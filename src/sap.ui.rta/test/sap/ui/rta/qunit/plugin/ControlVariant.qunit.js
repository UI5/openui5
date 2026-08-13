/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/FlexBox",
	"sap/m/MessageBox",
	"sap/m/Page",
	"sap/ui/core/Lib",
	"sap/ui/dt/plugin/ToolHooks",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/ControlVariantConfigure",
	"sap/ui/rta/command/ControlVariantSave",
	"sap/ui/rta/command/ControlVariantSaveAs",
	"sap/ui/rta/command/ControlVariantSetTitle",
	"sap/ui/rta/command/ControlVariantSwitch",
	"sap/ui/rta/plugin/ControlVariant",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Button,
	Dialog,
	FlexBox,
	MessageBox,
	Page,
	Lib,
	ToolHooksPlugin,
	DesignTime,
	ElementOverlay,
	OverlayRegistry,
	DtUtil,
	FlexObjectFactory,
	FlexObjectState,
	FlexState,
	ControlVariantApplyAPI,
	VariantManagement,
	VariantModel,
	VariantManager,
	ChangesWriteAPI,
	ContextSharingAPI,
	VersionsAPI,
	Layer,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	ControlVariantConfigure,
	ControlVariantSave,
	ControlVariantSaveAs,
	ControlVariantSetTitle,
	ControlVariantSwitch,
	ControlVariantPlugin,
	RtaUtils,
	sinon,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	FlQUnitUtils,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
	const oMLibraryBundle = Lib.getResourceBundleFor("sap.m");

	QUnit.module("Given a designTime and ControlVariant plugin are instantiated", {
		async beforeEach(assert) {
			const done = assert.async();

			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			const sReference = this.oMockedAppComponent.getManifestEntry("sap.app").id;
			await FlQUnitUtils.initializeFlexStateWithData(
				sandbox, sReference, {}, this.oMockedAppComponent.getId()
			);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			//	page
			//		verticalLayout
			//		objectPageLayout
			//			variantManagement (headerContent)
			//			objectPageSection (sections)
			//				objectPageSubSection
			//					verticalLayout
			//						button

			this.oButton = new Button();
			this.oLayout = new VerticalLayout("overlay1", {
				content: [this.oButton]
			});
			this.oObjectPageSubSection = new ObjectPageSubSection("objSubSection", {
				blocks: [this.oLayout]
			});
			this.oObjectPageSection = new ObjectPageSection("objSection", {
				subSections: [this.oObjectPageSubSection]
			});
			this.sLocalVariantManagementId = "varMgtKey";

			sandbox.stub(VariantManagement.prototype, "_updateWithSettingsInfo").resolves(true);
			this.oVariantManagementControl = new VariantManagement(this.sLocalVariantManagementId);
			this.oObjectPageLayout = new ObjectPageLayout("objPage", {
				headerContent: [this.oVariantManagementControl],
				sections: [this.oObjectPageSection]
			});
			this.oVariantManagementControl.addAssociation("for", "objPage", true);
			this.oButton2 = new Button();
			this.oLayoutOuter = new VerticalLayout("verlayouter", {
				content: [this.oButton2]
			});
			this.oPage = new Page("mainPage", {
				content: [this.oLayoutOuter, this.oObjectPageLayout]
			}).placeAt("qunit-fixture");
			const oVariantManagementDesignTimeMetadata = {
				"sap.ui.fl.variants.VariantManagement": {}
			};

			this.oDesignTime = new DesignTime({
				designTimeMetadata: oVariantManagementDesignTimeMetadata,
				rootElements: [this.oPage]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oObjectPageLayoutOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout);
				this.oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
				this.oObjectPageSubSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSubSection);
				this.oLayoutOuterOverlay = OverlayRegistry.getOverlay(this.oLayoutOuter);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonOverlay2 = OverlayRegistry.getOverlay(this.oButton2);
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				this.oControlVariantPlugin = new ControlVariantPlugin({
					commandFactory: new CommandFactory(),
					designTime: this.oDesignTime
				});
				this.oToolHooksPlugin = new ToolHooksPlugin();
				done();
			}.bind(this));
			await nextUIUpdate();
		},
		afterEach() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
			this.oLayoutOuter.destroy();
			this.oPage.destroy();
			this.oDesignTime.destroy();
			this.oData = null;
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when _isPersonalizationMode is called", function(assert) {
			assert.notOk(this.oControlVariantPlugin._isPersonalizationMode(), "then _isPersonalizationMode for CUSTOMER layer is false");
			sandbox.stub(this.oControlVariantPlugin.getCommandFactory(), "getFlexSettings").returns({ layer: Layer.USER });
			assert.ok(this.oControlVariantPlugin._isPersonalizationMode(), "then _isPersonalizationMode for USER layer is true");
		});

		QUnit.test("when registerElementOverlay is called", function(assert) {
			assert.ok(ElementOverlay.prototype.getVariantManagement, "then getVariantManagement added to the ElementOverlay prototype");
			assert.ok(ElementOverlay.prototype.setVariantManagement, "then setVariantManagement added to the ElementOverlay prototype");
		});

		QUnit.test("when _isEditable is called with VariantManagement overlay", function(assert) {
			sandbox.spy(this.oControlVariantPlugin, "hasStableId");
			const bEditable = this.oControlVariantPlugin._isEditable(this.oVariantManagementOverlay);
			assert.ok(bEditable, "then VariantManagement overlay is editable");
			assert.ok(
				this.oControlVariantPlugin.hasStableId.calledWith(this.oVariantManagementOverlay),
				"then the VariantManagement overlay was checked for a stable ID"
			);
		});

		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay", function(assert) {
			this.oToolHooksPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			assert.strictEqual(
				this.oObjectPageLayoutOverlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control"
			);
			assert.strictEqual(
				this.oVariantManagementOverlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully set to VariantManagement control itself"
			);
			assert.notOk(
				this.oLayoutOuterOverlay.getVariantManagement(),
				"then no VariantManagement reference set to an element outside element not a part of the associated control"
			);
			assert.strictEqual(
				this.oVariantManagementOverlay.getEditableByPlugins()[this.oControlVariantPlugin.getMetadata().getName()],
				true,
				"then VariantManagement is marked as editable by ControlVariant plugin"
			);
		});

		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay, and the target overlay is not available", async function(assert) {
			this.oVariantManagementControl.addAssociation("for", "dynamicallyCreatedButton", true);
			this.oToolHooksPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			this.oLayoutOuter.addContent(new Button("dynamicallyCreatedButton", { text: "Dynamically Created Button" }));
			await DtUtil.waitForSynced(this.oDesignTime)();
			const oNewButtonOverlay = OverlayRegistry.getOverlay("dynamicallyCreatedButton");

			assert.strictEqual(
				this.oObjectPageLayoutOverlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control"
			);
			assert.strictEqual(
				oNewButtonOverlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully set to the new Overlay from the id of VariantManagement control"
			);
		});

		QUnit.test("when isVariantSwitchAvailable is called with VariantManagement overlay", function(assert) {
			const bVMAvailable = this.oControlVariantPlugin.isVariantSwitchAvailable(this.oVariantManagementOverlay);
			const bButtonAvailable = this.oControlVariantPlugin.isVariantSwitchAvailable(this.oButtonOverlay);
			assert.ok(bVMAvailable, "then variant switch is available for VariantManagement control");
			assert.notOk(bButtonAvailable, "then variant switch not available for a non VariantManagement control overlay");
		});

		QUnit.test("when isVariantSwitchEnabled is called with VariantManagement overlay", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			const oGetVariantsStub = sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => "Variant 1", getVisible: () => true },
				{ getKey: () => "variant2", getTitle: () => "Variant 2", getVisible: () => true },
				{ getKey: () => "variant3", getTitle: () => "Variant 3", getVisible: () => false }
			]);
			const bButtonEnabled = this.oControlVariantPlugin.isVariantSwitchEnabled([this.oButtonOverlay]);
			assert.ok(
				this.oControlVariantPlugin.isVariantSwitchEnabled([this.oVariantManagementOverlay]),
				"then variant switch is enabled for VariantManagement control with more than one visible variant"
			);
			assert.notOk(bButtonEnabled, "then variant switch is not enabled for a non VariantManagement control");
			oGetVariantsStub.returns([
				{ getKey: () => "variant1", getTitle: () => "Variant 1", getVisible: () => true },
				{ getKey: () => "variant2", getTitle: () => "Variant 2", getVisible: () => false },
				{ getKey: () => "variant3", getTitle: () => "Variant 3", getVisible: () => false }
			]);
			assert.notOk(
				this.oControlVariantPlugin.isVariantSwitchEnabled([this.oVariantManagementOverlay]),
				"then variant switch is not enabled for VariantManagement control with only one visible variant"
			);
		});

		QUnit.test("when isVariantSaveAvailable is called with different overlays", function(assert) {
			assert.notOk(
				this.oControlVariantPlugin.isVariantSaveAvailable(this.oObjectPageLayoutOverlay),
				"then save not available for a non VariantManagement control overlay with variantReference"
			);
			assert.ok(
				this.oControlVariantPlugin.isVariantSaveAvailable(this.oVariantManagementOverlay),
				"then save available for a VariantManagement control overlay with variantReference"
			);
			assert.notOk(
				this.oControlVariantPlugin.isVariantSaveAvailable(this.oLayoutOuterOverlay),
				"then save not available for a non VariantManagement control overlay without variantReference"
			);
		});

		[
			["variant management is modified", true, "enabled"],
			["variant management is not modified", false, "disabled"]
		].forEach(function(obj) {
			QUnit.test(`when isVariantSaveEnabled is called with VariantManagement overlay and ${obj[0]}`, function(assert) {
				// eslint-disable-next-line prefer-destructuring
				this.oVariantManagementControl.setModified(obj[1]);
				this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
				const bVMEnabled = this.oControlVariantPlugin.isVariantSaveEnabled([this.oVariantManagementOverlay]);
				assert.strictEqual(bVMEnabled, obj[1], `then variant save is ${obj[2]} for VariantManagement control`);
			});
		});

		QUnit.test("when isVariantSaveAsAvailable is called with different overlays", function(assert) {
			assert.notOk(
				this.oControlVariantPlugin.isVariantSaveAsAvailable(this.oObjectPageLayoutOverlay),
				"then saveAs not available for a non VariantManagement control overlay with variantReference"
			);
			assert.ok(
				this.oControlVariantPlugin.isVariantSaveAsAvailable(this.oVariantManagementOverlay),
				"then saveAs available for a VariantManagement control overlay with variantReference"
			);
			assert.notOk(
				this.oControlVariantPlugin.isVariantSaveAsAvailable(this.oLayoutOuterOverlay),
				"then saveAs not available for a non VariantManagement control overlay without variantReference"
			);
		});

		QUnit.test("when isVariantSaveAsEnabled is called with VariantManagement overlay", function(assert) {
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			const bVMEnabled = this.oControlVariantPlugin.isVariantSaveAsEnabled([this.oVariantManagementOverlay]);
			const bButtonEnabled = this.oControlVariantPlugin.isVariantSaveAsEnabled([this.oButtonOverlay]);
			assert.ok(bVMEnabled, "then variant saveAs is enabled for VariantManagement control");
			assert.notOk(bButtonEnabled, "then variant saveAs is not enabled for a non VariantManagement control");
		});

		QUnit.test("when isVariantRenameAvailable is called with VariantManagement overlay", function(assert) {
			const bVMAvailable = this.oControlVariantPlugin.isRenameAvailable(this.oVariantManagementOverlay);
			const bButtonAvailable = this.oControlVariantPlugin.isRenameAvailable(this.oButtonOverlay);
			assert.ok(bVMAvailable, "then variant rename is available for VariantManagement control");
			assert.notOk(bButtonAvailable, "then variant rename is not available for non VariantManagement control");
		});

		QUnit.test("when isVariantRenameEnabled is called with VariantManagement overlay", function(assert) {
			const bVMEnabled = this.oControlVariantPlugin.isRenameEnabled([this.oVariantManagementOverlay]);
			const bButtonEnabled = this.oControlVariantPlugin.isRenameEnabled([this.oButtonOverlay]);
			assert.ok(bVMEnabled, "then variant rename is enabled for VariantManagement control");
			assert.notOk(bButtonEnabled, "then variant rename is not enabled for a non VariantManagement control");
		});

		QUnit.test("when isVariantConfigureAvailable is called with VariantManagement overlay", function(assert) {
			const bVMAvailable = this.oControlVariantPlugin.isVariantConfigureAvailable(this.oVariantManagementOverlay);
			const bButtonAvailable = this.oControlVariantPlugin.isVariantConfigureAvailable(this.oButtonOverlay);
			assert.ok(bVMAvailable, "then variant configure is available for VariantManagement control");
			assert.notOk(bButtonAvailable, "then variant configure is not available for non VariantManagement control");
		});

		QUnit.test("when isVariantConfigureEnabled is called with VariantManagement overlay", function(assert) {
			const bVMEnabled = this.oControlVariantPlugin.isVariantConfigureEnabled([this.oVariantManagementOverlay]);
			const bButtonEnabled = this.oControlVariantPlugin.isVariantConfigureEnabled([this.oButtonOverlay]);
			assert.ok(bVMEnabled, "then variant configure is enabled for VariantManagement control");
			assert.notOk(bButtonEnabled, "then variant configure is not enabled for a non VariantManagement control");
		});

		QUnit.test("when switchVariant is called without changes", function(assert) {
			const done = assert.async();
			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantSwitch, "then an switchVariant event is received with a switch command");
				done();
			});
			this.oControlVariantPlugin.switchVariant(this.oVariantManagementOverlay, "variant2", "variant1");
		});

		QUnit.test("when the current variant has unsaved changes and a user switches to another variant - user chooses 'cancel'", function(assert) {
			const fnDone = assert.async();
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);
			const oFireElementModifiedSpy = sandbox.spy(this.oControlVariantPlugin, "fireElementModified");
			sandbox.stub(MessageBox, "warning").callsFake(function(sMessage, oParameters) {
				oParameters.onClose(MessageBox.Action.CANCEL);
				assert.ok(oFireElementModifiedSpy.notCalled, "the variant does not switch");
				fnDone();
			});
			this.oControlVariantPlugin.switchVariant(this.oVariantManagementOverlay, "variant2", "variant1");
		});

		QUnit.test("when the current variant has unsaved changes and a user switches to another variant - user chooses 'save'", function(assert) {
			const fnDone = assert.async();
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				const oSaveCommand = oCommand.mAggregations.commands[0];
				assert.strictEqual(oSaveCommand.getName(), "save", "then the save command is part of the composite command");
				const oSwitchCommand = oCommand.mAggregations.commands[1];
				assert.strictEqual(oSwitchCommand.getName(), "switch", "then the switch command is part of the composite command");
				assert.strictEqual(oSwitchCommand.getSourceVariantReference(), "variant1", "then the source is set correctly");
				assert.strictEqual(oSwitchCommand.getTargetVariantReference(), "variant2", "then the target is set correctly");
				fnDone();
			});

			sandbox.stub(MessageBox, "warning").callsFake(function(sMessage, oParameters) {
				assert.strictEqual(sMessage, oLibraryBundle.getText("MSG_CHANGE_MODIFIED_VARIANT"), "the message is correct");
				assert.strictEqual(oParameters.styleClass, RtaUtils.getRtaStyleClassName(), "the style class is set");
				assert.strictEqual(
					oParameters.emphasizedAction,
					oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE"),
					"the emphasized button text is correct"
				);
				oParameters.onClose(oParameters.emphasizedAction);
			});

			this.oControlVariantPlugin.switchVariant(this.oVariantManagementOverlay, "variant2", "variant1");
		});

		QUnit.test("when the current variant has unsaved changes and a user switches to another variant - user chooses 'discard'", function(assert) {
			const fnDone = assert.async();
			sandbox.stub(this.oVariantManagementControl, "getModified").returns(true);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				const oSwitchCommand = oEvent.getParameter("command");
				assert.strictEqual(oSwitchCommand.getName(), "switch", "then the switch command is created");
				assert.strictEqual(oSwitchCommand.getSourceVariantReference(), "variant1", "then the source is set correctly");
				assert.strictEqual(oSwitchCommand.getTargetVariantReference(), "variant2", "then the target is set correctly");
				assert.ok(oSwitchCommand.getDiscardVariantContent(), "then the property is set correctly");
				fnDone();
			});

			sandbox.stub(MessageBox, "warning").callsFake(function(sMessage, oParameters) {
				oParameters.onClose(oLibraryBundle.getText("BTN_MODIFIED_VARIANT_DISCARD"));
			});

			this.oControlVariantPlugin.switchVariant(this.oVariantManagementOverlay, "variant2", "variant1");
		});

		QUnit.test("when renameVariant is called", function(assert) {
			const fnDone = assert.async();

			sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => "Variant 1" },
				{ getKey: () => "variant2", getTitle: () => "Variant 2" }
			]);
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oVariantManagementOverlay.setSelectable(true);

			this.oControlVariantPlugin.attachElementModified((oEvent) => {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.ok(
					oCommand instanceof ControlVariantSetTitle,
					"then an elementModified event is received with a controlVariantSetTitle command"
				);
				assert.strictEqual(oCommand.getNewText(), "Test", "then the command contains the correct new title");
				fnDone();
			});

			RtaQunitUtils.simulateRename(sandbox, "Test", () => {
				this.oControlVariantPlugin.renameVariant([this.oVariantManagementOverlay]);
			});
		});

		QUnit.test("when configureVariants is called", function(assert) {
			const done = assert.async();
			const aChanges = ["change1", "change2"];
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			sandbox.stub(VariantManager, "openManageVariantsDialog").resolves({ changes: aChanges, variantsToBeDeleted: [] });
			sandbox.stub(VersionsAPI, "getDraftFilenames").returns([]);
			const oCreateComponentSpy = sandbox.spy(ContextSharingAPI, "createComponent");

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.ok(
					oCommand instanceof ControlVariantConfigure,
					"then a configure Variant event is received with a configure command"
				);
				assert.strictEqual(oCommand.getChanges(), aChanges, "and the command contains the given changes");
				done();
			});
			this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay]);
			const oArgs = oCreateComponentSpy.getCall(0).args[0];
			assert.ok(oArgs.variantManagementControl, "then the correct control is used");
		});

		QUnit.test("when configureVariants is called without changes", function(assert) {
			const done = assert.async();
			const aChanges = [];
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			sandbox.stub(VariantManager, "openManageVariantsDialog").resolves({ changes: aChanges, variantsToBeDeleted: [] });
			sandbox.stub(VersionsAPI, "getDraftFilenames").returns([]);
			const oFireElementModifiedSpy = sandbox.spy(this.oControlVariantPlugin, "fireElementModified");

			return this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay])
			.then(function() {
				assert.ok(oFireElementModifiedSpy.notCalled, "then the command is not built");
				done();
			});
		});

		QUnit.test("when configureVariants is called and variants are deleted", function(assert) {
			const fnDone = assert.async();
			const aChanges = ["change1", "change2"];
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			sandbox.stub(VariantManager, "openManageVariantsDialog").resolves({ changes: aChanges, variantsToBeDeleted: ["dummyVariant"] });

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.ok(
					oCommand instanceof ControlVariantConfigure,
					"then a configure Variant event is received with a configure command"
				);
				assert.strictEqual(oCommand.getChanges(), aChanges, "and the command contains the given changes");
				assert.strictEqual(oCommand.getDeletedVariants()[0], "dummyVariant", "and the command contains the deleted variant");
				fnDone();
			});
			this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay]);
		});

		QUnit.test("when configureVariants is called and a dirty variant is deleted", function(assert) {
			const done = assert.async();
			const oVariant = FlexObjectFactory.createFlVariant({
				id: "variant1",
				reference: "dummyReference",
				layer: Layer.USER
			});
			const oSetTitleVariantChange = FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_change",
				layer: Layer.USER,
				changeType: "setTitle",
				selector: {
					id: "variant1"
				}
			});
			const oVMDependentChange = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.USER,
				changeType: "dummyChange",
				variantReference: "variant1"
			});

			sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns([oVariant, oSetTitleVariantChange, oVMDependentChange]);

			const aChanges = [oSetTitleVariantChange, oVMDependentChange];
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			sandbox.stub(VariantManager, "openManageVariantsDialog").resolves(
				{ changes: aChanges, variantsToBeDeleted: [oVariant.getId()] }
			);
			sandbox.stub(VersionsAPI, "getDraftFilenames").returns([]);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.ok(
					oCommand instanceof ControlVariantConfigure,
					"then a configure Variant event is received with a configure command"
				);
				assert.strictEqual(oCommand.getChanges(), aChanges, "and the command contains the given changes");
				assert.deepEqual(oCommand.getDeletedVariants(), [oVariant.getId()], "and the command contains the deleted dirty variant");
				done();
			});
			this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay]);
		});

		QUnit.test("when configureVariants is called and dirty + draft variants are deleted", function(assert) {
			const done = assert.async();
			const oVariant = FlexObjectFactory.createFlVariant({
				id: "variant1",
				reference: "dummyReference",
				layer: Layer.USER
			});
			const oVariant2 = FlexObjectFactory.createFlVariant({
				id: "variant2",
				reference: "dummyReference",
				layer: Layer.USER
			});

			sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns([oVariant]);

			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			sandbox.stub(VariantManager, "openManageVariantsDialog")
			.resolves({ changes: ["SetVisibleFalse"], variantsToBeDeleted: [oVariant.getId(), oVariant2.getId()] });
			sandbox.stub(VersionsAPI, "getDraftFilenames").returns([oVariant2.getId()]);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.ok(
					oCommand instanceof ControlVariantConfigure,
					"then a configure Variant event is received with a configure command"
				);
				assert.strictEqual(oCommand.getChanges()[0], "SetVisibleFalse", "and the command contains the given changes");
				assert.deepEqual(
					oCommand.getDeletedVariants(),
					[oVariant.getId(), oVariant2.getId()],
					"and the command contains both variants"
				);
				done();
			});
			this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay]);
		});

		QUnit.test("when createSaveCommand is called and the key user presses the save button", function(assert) {
			const done = assert.async();
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ControlVariantSave, "then a save Variant event is received with a save command");
				done();
			});
			this.oControlVariantPlugin.createSaveCommand([this.oVariantManagementOverlay]);
		});

		QUnit.test("when createSaveAsCommand is called and the key user presses the save button", function(assert) {
			const done = assert.async();
			this.oHandleSaveStub = sandbox.stub(VariantManager, "handleSaveEvent");
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oVariantManagementControl._createSaveAsDialog();

			this.oVariantManagementControl._getEmbeddedVM().oSaveAsDialog.attachEventOnce("afterOpen", function() {
				this.oVariantManagementControl._handleVariantSaveAs("myNewVariant");
			}.bind(this));

			const oOpenSaveAsDialogSpy = sandbox.spy(this.oVariantManagementControl._getEmbeddedVM(), "_openSaveAsDialog");

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.equal(oOpenSaveAsDialogSpy.callCount, 1, "then openSaveAsDialog has been called once");
				assert.ok(oCommand instanceof ControlVariantSaveAs, "then a saveAs Variant event is received with a saveAs command");
				done();
			});
			this.oControlVariantPlugin.createSaveAsCommand([this.oVariantManagementOverlay]);
		});

		QUnit.test("when createSaveAsCommand is called and the key user presses the cancel button", function(assert) {
			const done = assert.async();
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			const oCreateComponentSpy = sandbox.spy(ContextSharingAPI, "createComponent");
			this.oVariantManagementControl._createSaveAsDialog();

			this.oVariantManagementControl._getEmbeddedVM().oSaveAsDialog.attachEventOnce("afterOpen", function() {
				this.oVariantManagementControl._getEmbeddedVM()._cancelPressed();
			}.bind(this));

			const oOpenSaveAsDialogSpy = sandbox.spy(this.oVariantManagementControl._getEmbeddedVM(), "_openSaveAsDialog");

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.ok(oEvent, "then fireElementModified is called once");
				const oCommand = oEvent.getParameter("command");
				assert.equal(oOpenSaveAsDialogSpy.callCount, 1, "then openSaveAsDialog has been called once");
				assert.notOk(oCommand, "then a saveAs Variant event is received, but no command is created");
				const oArgs = oCreateComponentSpy.getCall(0).args[0];
				assert.ok(oArgs.variantManagementControl, "then the correct control is used");
				done();
			});
			this.oControlVariantPlugin.createSaveAsCommand([this.oVariantManagementOverlay]);
		});

		QUnit.test("when manage dialog is already open, followed by registration of variant management overlay", function(assert) {
			const done = assert.async();
			this.oVariantManagementControl.openManagementDialog();
			this.oVariantManagementControl.getManageDialog().attachEventOnce("afterOpen", function() {
				this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
				assert.ok(
					this.oVariantManagementControl.getManageDialog().bIsDestroyed,
					"then on overlay registration, manage dialog is destroyed"
				);
				done();
			}.bind(this));
		});

		QUnit.test("when configure variants context menu item opens the manage dialog, followed by de-registration of variant management overlay", async function(assert) {
			const fnDone = assert.async();
			await FlexState.initialize({
				componentId: this.oMockedAppComponent.getId()
			});
			await this.oVariantManagementControl.waitForInit();
			const oModel = this.oVariantManagementControl.getVariantModel();
			sandbox.stub(this.oMockedAppComponent, "getModel").returns(oModel);
			sandbox.stub(Dialog.prototype, "open").callsFake(function() {
				assert.ok(this.oVariantManagementControl.getManageDialog().isA("sap.m.Dialog"), "then initially a dialog is created");
				this.oControlVariantPlugin.deregisterElementOverlay(this.oVariantManagementOverlay);
				assert.ok(
					this.oVariantManagementControl.getManageDialog().bIsDestroyed,
					"then on overlay de-registration, manage dialog is destroyed"
				);
				fnDone();
			}.bind(this));
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.configureVariants([this.oVariantManagementOverlay]);
		});

		QUnit.test("when _propagateVariantManagement is called with a root overlay and VariantManagement reference", function(assert) {
			const aOverlays = this.oControlVariantPlugin._propagateVariantManagement(this.oObjectPageLayoutOverlay, "varMgtKey");
			assert.equal(
				this.oButtonOverlay.getVariantManagement(),
				"varMgtKey",
				"then VariantManagement reference successfully propagated from the root overlay to last child overlay)"
			);
			assert.equal(aOverlays.length, 6, "then VariantManagement reference successfully set for all 6 child ElementOverlays");
		});

		QUnit.test("when _getVariantManagementFromParent is called with an overlay with no VariantManagement reference", function(assert) {
			assert.notOk(this.oButtonOverlay2.getVariantManagement(), "no VariantManagement reference set initially for the last overlay");
			this.oLayoutOuterOverlay.setVariantManagement("varMgtKey");
			const sVarMgmt = this.oControlVariantPlugin._getVariantManagementFromParent(this.oButtonOverlay2);
			assert.equal(sVarMgmt, "varMgtKey", "then correct VariantManagement reference returned");
		});

		// Integration Test
		QUnit.test("when ControlVariant Plugin is added to designTime and a new overlay is rendered dynamically", async function(assert) {
			const done = assert.async();
			this.oDesignTime.addPlugin(this.oControlVariantPlugin);
			await nextUIUpdate();
			assert.ok(
				this.oButtonOverlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully propagated from ObjectPageLayout to Button (last element)"
			);
			const oTestButton = new Button("testButton");
			this.oLayout.addContent(oTestButton);
			await nextUIUpdate();
			this.oDesignTime.attachEventOnce("synced", function() {
				const oTestButtonOverlay = OverlayRegistry.getOverlay(oTestButton);
				assert.equal(
					oTestButtonOverlay.getVariantManagement(),
					this.sLocalVariantManagementId,
					"then VariantManagement reference successfully set for newly inserted ElementOverlay from parent ElementOverlays"
				);
				done();
			}.bind(this));
		});

		QUnit.test("when retrieving the context menu items", function(assert) {
			const renameDone = assert.async();
			const createSaveAsCommandDone = assert.async();
			const configureDone = assert.async();
			const switchDone = assert.async();
			this.oVariantManagementControl.setModified(true);
			sandbox.stub(this.oVariantManagementControl, "getCurrentVariantReference").returns("variant1");
			sandbox.stub(this.oVariantManagementControl, "getVariantByKey").withArgs("variant1").returns({
				getKey: () => "variant1"
			});
			sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => "Variant 1", getVisible: () => true },
				{ getKey: () => "variant2", getTitle: () => "Variant 2", getVisible: () => true }
			]);

			sandbox.stub(this.oControlVariantPlugin, "renameVariant").callsFake(function(aElementOverlays) {
				// Rename
				assert.deepEqual(
					aElementOverlays[0],
					this.oVariantManagementOverlay,
					"the 'handler' function calls renameVariant for rename menu item with the correct overlay"
				);
				renameDone();
			}.bind(this));

			// SaveAs
			sandbox.stub(this.oControlVariantPlugin, "createSaveAsCommand").callsFake(function() {
				assert.ok(true, "the 'handler' function calls the createSaveAsCommand method");
				createSaveAsCommandDone();
			});

			// Configure
			sandbox.stub(this.oControlVariantPlugin, "configureVariants").callsFake(function() {
				assert.ok(true, "the 'handler' function calls the configureVariants method");
				configureDone();
			});

			// Switch SubMenu
			const mPropertyBag = {
				payload: { key: "variant2" }
			};
			this.oVariantManagementOverlay.getVariantManagement = function() {
				return "varMgtKey";
			};
			const aExpectedSubmenu = [
				{ id: "variant1", text: "Variant 1", icon: "sap-icon://accept", enabled: false },
				{ id: "variant2", text: "Variant 2", icon: "blank", enabled: true }
			];

			sandbox.stub(this.oControlVariantPlugin, "switchVariant")
			.callsFake(function(oTargetOverlay, sNewVariantReference, sCurrentVariantReference) {
				assert.equal(
					oTargetOverlay,
					this.oVariantManagementOverlay,
					"the 'handler' function calls the switchVariant method with the correct oTargetOverlay"
				);
				assert.equal(
					sNewVariantReference,
					"variant2",
					"the 'handler' function calls the switchVariant method with the correct sNewVariantKey"
				);
				assert.equal(
					sCurrentVariantReference,
					"variant1",
					"the 'handler' function calls the switchVariant method with the correct sCurrentVariantKey"
				);
				switchDone();
			}.bind(this));

			const aMenuItems = this.oControlVariantPlugin.getMenuItems([this.oVariantManagementOverlay]);

			assert.equal(aMenuItems[0].id, "CTX_VARIANT_SET_TITLE", "there is an entry for rename variant");
			assert.equal(aMenuItems[0].rank, 200, "and the entry has the correct rank");
			aMenuItems[0].handler([this.oVariantManagementOverlay]);
			assert.ok(aMenuItems[0].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");

			assert.equal(aMenuItems[1].id, "CTX_VARIANT_SAVE", "there is an entry for save variant");
			assert.equal(aMenuItems[1].rank, 210, "and the entry has the correct rank");
			aMenuItems[1].handler([this.oVariantManagementOverlay]);
			assert.ok(aMenuItems[1].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");

			assert.equal(aMenuItems[2].id, "CTX_VARIANT_SAVEAS", "there is an entry for saveAs variant");
			assert.equal(aMenuItems[2].rank, 220, "and the entry has the correct rank");
			aMenuItems[2].handler([this.oVariantManagementOverlay]);
			assert.ok(aMenuItems[2].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");

			assert.equal(aMenuItems[3].id, "CTX_VARIANT_MANAGE", "there is an entry for configure variant");
			assert.equal(aMenuItems[3].rank, 230, "and the entry has the correct rank");
			aMenuItems[3].handler([this.oVariantManagementOverlay]);
			assert.ok(aMenuItems[3].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");
			assert.equal(aMenuItems[3].startSection, true, "the configure variant starts a new section on the menu");

			assert.equal(aMenuItems[4].id, "CTX_VARIANT_SWITCH_SUBMENU", "there is an entry for switch variant");
			assert.equal(aMenuItems[4].rank, 240, "and the entry has the correct rank");
			assert.ok(aMenuItems[4].enabled([this.oVariantManagementOverlay]), "and the entry is enabled");
			assert.propEqual(aMenuItems[4].submenu, aExpectedSubmenu, "and the submenu array is correct");
			aMenuItems[4].handler([this.oVariantManagementOverlay], mPropertyBag);
		});

		QUnit.test("when the switch submenu handler is invoked with payload.key (Action service path)", function(assert) {
			const switchDone = assert.async();
			sandbox.stub(this.oVariantManagementControl, "getCurrentVariantReference").returns("variant1");
			sandbox.stub(this.oVariantManagementControl, "getVariantByKey").withArgs("variant1").returns({
				getKey: () => "variant1"
			});
			sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => "Variant 1", getVisible: () => true },
				{ getKey: () => "variant2", getTitle: () => "Variant 2", getVisible: () => true }
			]);
			this.oVariantManagementOverlay.getVariantManagement = function() {
				return "varMgtKey";
			};

			sandbox.stub(this.oControlVariantPlugin, "switchVariant")
			.callsFake(function(oTargetOverlay, sNewVariantReference, sCurrentVariantReference) {
				assert.strictEqual(
					oTargetOverlay,
					this.oVariantManagementOverlay,
					"the handler forwards the target overlay"
				);
				assert.strictEqual(
					sNewVariantReference,
					"variant2",
					"the new variant key is read from mPropertyBag.payload.key"
				);
				assert.strictEqual(
					sCurrentVariantReference,
					"variant1",
					"the current variant key is unchanged"
				);
				switchDone();
			}.bind(this));

			const aMenuItems = this.oControlVariantPlugin.getMenuItems([this.oVariantManagementOverlay]);
			const oSwitchSubmenuItem = aMenuItems.find((mItem) => mItem.id === "CTX_VARIANT_SWITCH_SUBMENU");
			assert.ok(oSwitchSubmenuItem, "the switch submenu entry exists");

			// The target variant key is forwarded via payload by both the context menu and the Action service.
			oSwitchSubmenuItem.handler([this.oVariantManagementOverlay], { payload: { key: "variant2" } });
		});

		QUnit.test("when the switch submenu handler is invoked without a resolvable target key", function(assert) {
			sandbox.stub(this.oVariantManagementControl, "getCurrentVariantReference").returns("variant1");
			sandbox.stub(this.oVariantManagementControl, "getVariantByKey").withArgs("variant1").returns({
				getKey: () => "variant1"
			});
			sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => "Variant 1", getVisible: () => true },
				{ getKey: () => "variant2", getTitle: () => "Variant 2", getVisible: () => true }
			]);
			this.oVariantManagementOverlay.getVariantManagement = function() {
				return "varMgtKey";
			};
			const oSwitchVariantStub = sandbox.stub(this.oControlVariantPlugin, "switchVariant");

			const aMenuItems = this.oControlVariantPlugin.getMenuItems([this.oVariantManagementOverlay]);
			const oSwitchSubmenuItem = aMenuItems.find((mItem) => mItem.id === "CTX_VARIANT_SWITCH_SUBMENU");

			assert.throws(
				function() {
					// No payload.key is provided
					oSwitchSubmenuItem.handler([this.oVariantManagementOverlay], { payload: {} });
				}.bind(this),
				/Target variant key is missing/,
				"the handler throws when the target variant key cannot be resolved"
			);
			assert.strictEqual(oSwitchVariantStub.callCount, 0, "switchVariant is not called");
		});
	});

	QUnit.module("Given a designTime where VM control is not part of responsible control tree and ControlVariant plugin are instantiated", {
		async beforeEach(assert) {
			const done = assert.async();

			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			this.oData = {
				varMgtKey: {
					defaultVariant: "variant1",
					variantsEditable: true,
					variants: [
						{
							key: "variant1",
							title: "Variant 1",
							visible: true
						},
						{
							key: "variant2",
							title: "Variant 2",
							visible: true
						}
					]
				}
			};

			//	page
			//		verticalLayout
			//			flexBox1
			//				variantManagement
			//				button1
			//			flexBox2
			//				button2

			this.sLocalVariantManagementId = "varMgtKey";
			const sReference = this.oMockedAppComponent.getManifestEntry("sap.app").id;
			await FlQUnitUtils.initializeFlexStateWithData(
				sandbox, sReference, {}, this.oMockedAppComponent.getId()
			);
			this.oVariantManagementControl = new VariantManagement(this.sLocalVariantManagementId);
			this.oModel = new VariantModel(this.oData, {
				appComponent: this.oMockedAppComponent,
				vmReference: this.sLocalVariantManagementId,
				vmControl: this.oVariantManagementControl
			});
			sandbox.stub(this.oMockedAppComponent, "getModel").returns(this.oModel);
			this.oVariantManagementControl.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oFlexBox1 = new FlexBox("flexbox1", {
				items: [this.oVariantManagementControl, this.oButton1]
			});
			this.oFlexBox2 = new FlexBox("flexbox2", {
				items: [this.oButton2]
			});
			this.oVariantManagementControl.addAssociation("for", "flexbox2", true);
			this.oLayoutOuter = new VerticalLayout("layoutouter", {
				content: [this.oFlexBox1, this.oFlexBox2]
			});
			this.oPage = new Page("mainPage", {
				content: [this.oLayoutOuter]
			}).placeAt("qunit-fixture");
			const oVariantManagementDesignTimeMetadata = {
				"sap.ui.fl.variants.VariantManagement": {}
			};

			this.oDesignTime = new DesignTime({
				designTimeMetadata: oVariantManagementDesignTimeMetadata,
				rootElements: [this.oPage]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOuterOverlay = OverlayRegistry.getOverlay(this.oLayoutOuter);
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oFlexBox1Overlay = OverlayRegistry.getOverlay(this.oFlexBox1);
				this.oFlexBox2Overlay = OverlayRegistry.getOverlay(this.oFlexBox2);
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				this.oControlVariantPlugin = new ControlVariantPlugin({
					commandFactory: new CommandFactory()
				});
				this.oToolHooksPlugin = new ToolHooksPlugin();
				done();
			}.bind(this));

			await nextUIUpdate();
		},
		afterEach() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
			this.oLayoutOuter.destroy();
			this.oPage.destroy();
			this.oDesignTime.destroy();
			this.oData = null;
			this.oModel.destroy();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when registerElementOverlay is called with VariantManagement control Overlay", function(assert) {
			this.oToolHooksPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
			assert.strictEqual(
				this.oFlexBox2Overlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control"
			);
			assert.strictEqual(
				this.oButton2Overlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control"
			);
			assert.strictEqual(
				this.oVariantManagementOverlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully set to VariantManagement control itself"
			);
			assert.notOk(
				this.oLayoutOuterOverlay.getVariantManagement(),
				"then no VariantManagement reference set to an element outside element not a part of the associated control"
			);
			assert.notOk(
				this.oFlexBox1Overlay.getVariantManagement(),
				"then no VariantManagement reference set to an element outside element not a part of the associated control"
			);
			assert.notOk(
				this.oButton1Overlay.getVariantManagement(),
				this.sLocalVariantManagementId,
				"then VariantManagement reference successfully set to ObjectPageLayout Overlay from the id of VariantManagement control"
			);
			assert.strictEqual(
				this.oVariantManagementOverlay.getEditableByPlugins()[this.oControlVariantPlugin.getMetadata().getName()],
				true,
				"then VariantManagement is marked as editable by ControlVariant plugin"
			);
		});
	});

	QUnit.module("Rename", {
		async beforeEach(assert) {
			const done = assert.async();
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			const sReference = this.oMockedAppComponent.getManifestEntry("sap.app").id;
			await FlQUnitUtils.initializeFlexStateWithData(
				sandbox, sReference, {}, this.oMockedAppComponent.getId()
			);

			this.oVariantManagementControl = new VariantManagement("varMgtKey").placeAt("qunit-fixture");

			const oVariantManagementDesignTimeMetadata = {
				"sap.ui.fl.variants.VariantManagement": {
					actions: {}
				}
			};
			await nextUIUpdate();
			this.oDesignTime = new DesignTime({
				designTimeMetadata: oVariantManagementDesignTimeMetadata,
				rootElements: [this.oVariantManagementControl]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				this.oControlVariantPlugin = new ControlVariantPlugin({
					commandFactory: new CommandFactory()
				});
				this.oControlVariantPlugin.registerElementOverlay(this.oVariantManagementOverlay);
				this.oVariantManagementOverlay.setSelectable(true);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oVariantManagementControl.destroy();
			this.oDesignTime.destroy();
			this.oMockedAppComponent.destroy();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when a variant is renamed to a new title", function(assert) {
			assert.expect(2);

			sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => "Variant 1" },
				{ getKey: () => "variant2", getTitle: () => "Variant 2" }
			]);

			this.oControlVariantPlugin.attachElementModified((oEvent) => {
				assert.ok(
					oEvent.getParameter("command") instanceof ControlVariantSetTitle,
					"then a variant modification event with a setControlVariantTitle command is fired"
				);
				assert.strictEqual(
					oEvent.getParameter("command").getNewText(),
					"New Variant Title",
					"then the new title is set correctly and trimmed"
				);
			});

			return RtaQunitUtils.simulateRename(sandbox, "New Variant Title  ", () => {
				this.oControlVariantPlugin.renameVariant([this.oVariantManagementOverlay]);
			});
		});

		QUnit.test("when a variant is renamed to an existing variant title", async function(assert) {
			const sNewVariantTitle = "Existing Variant Title";
			const oCreateCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand");
			sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => sNewVariantTitle, getVisible: () => true },
				{ getKey: () => "variant2", getTitle: () => "Variant 2", getVisible: () => true }
			]);

			await RtaQunitUtils.simulateRename(
				sandbox,
				sNewVariantTitle,
				() => {
					this.oControlVariantPlugin.renameVariant([this.oVariantManagementOverlay]);
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oMLibraryBundle.getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE"),
						"then an error is displayed in the dialog"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then _createSetTitleCommand() was not called");
		});

		QUnit.test("when a variant is renamed to title of an invisible variant", function(assert) {
			const sNewVariantTitle = "Existing Variant Title";

			sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => sNewVariantTitle, getVisible: () => false },
				{ getKey: () => "variant2", getTitle: () => "Variant 2", getVisible: () => true }
			]);

			this.oControlVariantPlugin.attachElementModified(function(oEvent) {
				assert.strictEqual(
					oEvent.getParameter("command").getNewText(),
					sNewVariantTitle,
					"then the variant is renamed"
				);
			});

			return RtaQunitUtils.simulateRename(sandbox, sNewVariantTitle, () => {
				this.oControlVariantPlugin.renameVariant([this.oVariantManagementOverlay]);
			});
		});

		QUnit.test("when a variant is renamed to en empty string", async function(assert) {
			const sNewVariantTitle = "\xa0  ";
			const oCreateCommandSpy = sandbox.spy(this.oControlVariantPlugin, "_createSetTitleCommand");

			await RtaQunitUtils.simulateRename(
				sandbox,
				sNewVariantTitle,
				() => {
					this.oControlVariantPlugin.renameVariant([this.oVariantManagementOverlay]);
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oLibraryBundle.getText("RENAME_EMPTY_ERROR_TEXT"),
						"then an error is displayed in the dialog"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then _createSetTitleCommand() was not called");
		});
	});

	QUnit.module("Given a designTime and ControlVariant plugin are instantiated and the model has only one visible variant", {
		async beforeEach(assert) {
			const done = assert.async();
			this.sLocalVariantManagementId = "varMgtKey";

			this.oVariantManagementControl = new VariantManagement(this.sLocalVariantManagementId);
			this.oVariantManagementControl.addAssociation("for", "objPage", true);

			const oVariantManagementDesignTimeMetadata = {
				"sap.ui.fl.variants.VariantManagement": {}
			};

			this.oVariantManagementControl.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				designTimeMetadata: oVariantManagementDesignTimeMetadata,
				rootElements: [this.oVariantManagementControl]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVariantManagementOverlay = OverlayRegistry.getOverlay(this.oVariantManagementControl);
				this.oControlVariantPlugin = new ControlVariantPlugin({
					commandFactory: new CommandFactory()
				});
				done();
			}.bind(this));

			await nextUIUpdate();

			sandbox.stub(this.oVariantManagementControl, "getCurrentVariantReference").returns("variant1");
			sandbox.stub(this.oVariantManagementControl, "getVariantByKey").withArgs("variant1").returns({
				getKey: () => "variant1"
			});
			sandbox.stub(this.oVariantManagementControl, "getVariants").returns([
				{ getKey: () => "variant1", getTitle: () => "Variant 1", getVisible: () => true },
				{ getKey: () => "variant2", getTitle: () => "Variant 2", getVisible: () => false }
			]);
		},
		afterEach() {
			sandbox.restore();
			this.oVariantManagementControl.destroy();
			this.oDesignTime.destroy();
			this.oData = null;
		}
	}, function() {
		QUnit.test("when retrieving the context menu items", function(assert) {
			const aMenuItems = this.oControlVariantPlugin.getMenuItems([this.oVariantManagementOverlay]);

			assert.equal(aMenuItems[4].id, "CTX_VARIANT_SWITCH_SUBMENU", "there is an entry for switch variant");
			assert.equal(aMenuItems[4].rank, 240, "and the entry has the correct rank");
			assert.notOk(aMenuItems[4].enabled([this.oVariantManagementOverlay]), "and the entry is disabled");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});