/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/ScrollContainer",
	"sap/ui/core/Lib",
	"sap/ui/core/Title",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/rename/Rename",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/Selection",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Button,
	Label,
	ScrollContainer,
	Lib,
	Title,
	DesignTime,
	OverlayRegistry,
	DtUtil,
	ChangesWriteAPI,
	Form,
	FormContainer,
	FormLayout,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	RenamePlugin,
	Plugin,
	SelectionPlugin,
	Utils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	function addResponsibleElement(oDesignTimeMetadata, oTargetElement, oResponsibleElement) {
		Object.assign(oDesignTimeMetadata.getData().actions, {
			getResponsibleElement(oElement) {
				if (oElement === oTargetElement) {
					return oResponsibleElement;
				}
				return undefined;
			},
			actionsFromResponsibleElement: ["rename"]
		});
	}

	async function getMenuEntryAndCheck(assert, oOverlay, oAssertions) {
		this.oRenamePlugin.deregisterElementOverlay(oOverlay);
		this.oRenamePlugin.registerElementOverlay(oOverlay);

		await DtUtil.waitForSynced(this.oDesignTime)();
		const bIsEditable = await this.oRenamePlugin._isEditable(oOverlay);
		assert.strictEqual(bIsEditable, oAssertions.editable, "then the editable property is correct");
		if (oAssertions.available !== undefined) {
			assert.strictEqual(this.oRenamePlugin.isAvailable([oOverlay], {}), oAssertions.available, "then available is correct");
		}

		const oMenuItem = (await this.oRenamePlugin.getMenuItems([oOverlay]))[0];
		if (oMenuItem) {
			if (typeof oMenuItem.enabled === "function") {
				assert.strictEqual(oMenuItem.enabled([oOverlay], oMenuItem), oAssertions.enabled, "then the enabled property is correct");
			} else {
				assert.strictEqual(oMenuItem.enabled, oAssertions.enabled, "then the enabled property is correct");
			}
		}
		return oMenuItem;
	}

	function addValidators(oDesignTimeMetadata, aValidator) {
		Object.assign(oDesignTimeMetadata.getData().actions.rename, {
			validators: aValidator
		});
	}

	QUnit.module("Given a designTime and rename plugin are instantiated using a form", {
		async beforeEach(assert) {
			var done = assert.async();

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
			const oCommandFactory = new CommandFactory();
			this.oRenamePlugin = new RenamePlugin({
				commandFactory: oCommandFactory
			});
			const oSelectionPlugin = new SelectionPlugin({
				commandFactory: oCommandFactory
			});
			this.oFormContainer0 = new FormContainer("formContainer0", {});
			this.oFormContainer = new FormContainer("formContainer", {
				title: new Title("title", {
					text: "title"
				})
			});
			this.oForm = new Form("form", {
				formContainers: [this.oFormContainer0, this.oFormContainer],
				layout: new FormLayout({
				})
			});
			this.oVerticalLayout = new VerticalLayout({
				content: [this.oForm]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oForm],
				plugins: [this.oRenamePlugin, oSelectionPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oFormContainerOverlay0 = OverlayRegistry.getOverlay(this.oFormContainer0);
				this.oFormContainerOverlay0.setSelectable(true);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				this.oFormContainerOverlay.setSelectable(true);
				done();
			}, this);
		},
		afterEach() {
			sandbox.restore();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when _isEditable is called", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				actions: {
					rename: {
						changeType: "renameGroup"
					}
				}
			});
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

			return this.oRenamePlugin._isEditable(this.oFormContainerOverlay)
			.then(function(bEditable) {
				assert.strictEqual(bEditable, true, "then the overlay is editable");
				assert.strictEqual(
					this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]),
					true,
					"then rename is available for the overlay"
				);
			}.bind(this));
		});

		QUnit.test("when _isEditable is called, rename has changeOnRelevantContainer true and the Form does not have a stable id", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				actions: {
					rename: {
						changeType: "renameGroup",
						changeOnRelevantContainer: true
					}
				}
			});
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

			sandbox.stub(this.oRenamePlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oFormOverlay) {
					return false;
				}
				return true;
			}.bind(this));

			sandbox.stub(this.oFormContainerOverlay, "getRelevantContainer").returns(this.oForm);

			return this.oRenamePlugin._isEditable(this.oFormContainerOverlay)
			.then(function(bEditable) {
				assert.strictEqual(bEditable, false, "then the overlay is not editable");
			});
		});

		QUnit.test("when isAvailable and isEnabled (returning function) are called", async function(assert) {
			var oDesignTimeMetadata = {
				actions: {
					rename: {
						changeType: "renameGroup",
						isEnabled(oFormContainer) {
							return !(oFormContainer.getToolbar() || !oFormContainer.getTitle());
						}
					}
				}
			};
			this.oFormContainerOverlay.setDesignTimeMetadata(oDesignTimeMetadata);
			this.oFormContainerOverlay0.setDesignTimeMetadata(oDesignTimeMetadata);

			await getMenuEntryAndCheck.call(this, assert, this.oFormContainerOverlay0, {
				editable: true,
				available: true,
				enabled: false
			});
			await getMenuEntryAndCheck.call(this, assert, this.oFormContainerOverlay, {
				editable: true,
				available: true,
				enabled: true
			});
		});

		QUnit.test("when isAvailable and isEnabled (returning boolean) are called", async function(assert) {
			var oDesignTimeMetadata = {
				actions: {
					rename(oFormContainer) {
						return {
							changeType: "renameGroup",
							isEnabled: !(oFormContainer.getToolbar() || !oFormContainer.getTitle())
						};
					}
				}
			};
			this.oFormContainerOverlay.setDesignTimeMetadata(oDesignTimeMetadata);
			this.oFormContainerOverlay0.setDesignTimeMetadata(oDesignTimeMetadata);

			await getMenuEntryAndCheck.call(this, assert, this.oFormContainerOverlay0, {
				editable: true,
				available: true,
				enabled: false
			});
			await getMenuEntryAndCheck.call(this, assert, this.oFormContainerOverlay, {
				editable: true,
				available: true,
				enabled: true
			});
		});

		QUnit.test("when retrieving the context menu item", async function(assert) {
			let bIsAvailable = true;
			sandbox.stub(this.oRenamePlugin, "isAvailable").callsFake(function(aElementOverlays) {
				assert.equal(
					aElementOverlays[0],
					this.oFormContainerOverlay,
					"the 'available' function calls isAvailable with the correct overlay"
				);
				return bIsAvailable;
			}.bind(this));
			sandbox.stub(this.oRenamePlugin, "handler").callsFake(function(aOverlays) {
				assert.deepEqual(aOverlays[0], this.oFormContainerOverlay, "the 'handler' method is called with the right overlay");
			}.bind(this));

			const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oFormContainerOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "'getMenuItems' returns the context menu item for the plugin");

			this.oFormContainerOverlay.setSelected(true);
			aMenuItems[0].handler([this.oFormContainerOverlay]);

			bIsAvailable = false;
			assert.equal(
				(await this.oRenamePlugin.getMenuItems([this.oFormContainerOverlay])).length,
				0,
				"and if plugin is not available for the overlay, no menu items are returned"
			);
		});

		QUnit.test("when isAvailable and isEnabled are called without designTime", async function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({});

			await getMenuEntryAndCheck.call(this, assert, this.oFormContainerOverlay, {
				editable: false,
				available: false,
				enabled: false
			});
		});

		QUnit.test("when deregister is called", function(assert) {
			var oSuperDeregisterSpy = sandbox.spy(Plugin.prototype, "deregisterElementOverlay");
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			assert.strictEqual(oSuperDeregisterSpy.callCount, 1, "the super class was called");
		});
	});

	QUnit.module("Given a designTime and rename plugin are instantiated using a VerticalLayout", {
		async beforeEach(assert) {
			var done = assert.async();

			this.oRenamePlugin = new RenamePlugin({
				commandFactory: new CommandFactory()
			});

			this.oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves();

			this.oButton = new Button({ text: "Button", id: "button" });
			this.oLabel = new Label({ text: "Label", id: "label" });
			this.oInnerButton = new Button({ text: "innerButton", id: "innerButton" });
			this.oInnerVerticalLayout = new VerticalLayout({
				id: "innerLayout",
				content: [this.oInnerButton],
				width: "400px"
			});
			this.oScrollContainer = new ScrollContainer({
				id: "scrollContainer",
				width: "100px",
				content: [this.oInnerVerticalLayout]
			});
			this.oVerticalLayout = new VerticalLayout({
				id: "layout",
				content: [this.oButton, this.oLabel, this.oScrollContainer],
				width: "200px"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
			// sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oRenamePlugin],
				designTimeMetadata: {
					"sap.ui.layout.VerticalLayout": {
						actions: {
							rename: {
								changeType: "renameField"
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
				this.oInnerButtonOverlay = OverlayRegistry.getOverlay(this.oInnerButton);
				this.oScrollContainerOverlay = OverlayRegistry.getOverlay(this.oScrollContainer);
				this.oLayoutOverlay.setSelectable(true);
				this.oLayoutOverlay.setSelected(true);

				await nextUIUpdate();

				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the Label was selected and gets renamed", async function(assert) {
			assert.ok(this.oLayoutOverlay.getSelected(), "then the overlay is initially selected");
			sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);
			await RtaQunitUtils.simulateRename(sandbox, "New Text", async () => {
				const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
				this.oRenamePlugin.handler([this.oLayoutOverlay], { menuItem: aMenuItems[0] });
			});
			assert.ok(this.oLayoutOverlay.getSelected(), "then the overlay is still selected after the rename");
		});

		QUnit.test("when the designtime provides a custom label getter", async function(assert) {
			sandbox.stub(CommandFactory.prototype, "getCommandFor").resolves();
			const oDesignTimeMetadata = this.oLayoutOverlay.getDesignTimeMetadata();
			const oGetLabelStub = sinon.stub();
			const oGetDataStub = sandbox.stub(oDesignTimeMetadata, "getData");
			oGetDataStub.callsFake(function(...aArgs) {
				return {
					...oGetDataStub.wrappedMethod.apply(this, aArgs),
					getLabel: oGetLabelStub
				};
			});

			sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);
			await RtaQunitUtils.simulateRename(sandbox, "New Text", async () => {
				const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
				this.oRenamePlugin.handler([this.oLayoutOverlay], { menuItem: aMenuItems[0] });
			});

			assert.strictEqual(oGetLabelStub.callCount, 1, "then the custom getter is called");
		});

		QUnit.test("when the Label gets renamed with a responsible element", function(assert) {
			const fnDone = assert.async();
			const oMockAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

			addResponsibleElement(this.oLayoutOverlay.getDesignTimeMetadata(), this.oVerticalLayout, this.oButton);

			this.oRenamePlugin.attachEventOnce("elementModified", (oEvent) => {
				const oRenameCommand = oEvent.getParameter("command");
				assert.strictEqual(
					this.oButton.getId(),
					oRenameCommand.getSelector().id,
					"then a command is created for the responsible element"
				);
				assert.strictEqual(
					oRenameCommand.getNewValue(),
					"New Text",
					"then the new text is set correctly"
				);
				assert.strictEqual(oRenameCommand.getName(), "rename", "then a rename command was created");
				oMockAppComponent.destroy();
				fnDone();
			});

			sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);
			RtaQunitUtils.simulateRename(sandbox, "New Text", async () => {
				const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
				this.oRenamePlugin.handler([this.oLayoutOverlay], { menuItem: aMenuItems[0] });
			});
		});

		QUnit.test("when retrieving the rename context menu item, with no action on the responsible element", async function(assert) {
			addResponsibleElement(this.oLayoutOverlay.getDesignTimeMetadata(), this.oButton, this.oInnerButton);

			// simulate actions on all overlays, except the responsible element
			sandbox.stub(this.oRenamePlugin, "getAction")
			.returns(true)
			.withArgs(this.oInnerButtonOverlay)
			.returns(false);

			await getMenuEntryAndCheck.call(this, assert, this.oButtonOverlay, {
				editable: false,
				enabled: false
			});
		});

		QUnit.test("when the Label gets renamed and the new value is interpreted as a binding", async function(assert) {
			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);
			await RtaQunitUtils.simulateRename(
				sandbox,
				"{testText}",
				async () => {
					const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
					this.oRenamePlugin.handler([this.oLayoutOverlay], { menuItem: aMenuItems[0] });
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oResourceBundle.getText("RENAME_BINDING_ERROR_TEXT"),
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when the Label gets renamed to }{", async function(assert) {
			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);
			await RtaQunitUtils.simulateRename(
				sandbox,
				"}{",
				async () => {
					const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
					this.oRenamePlugin.handler([this.oLayoutOverlay], { menuItem: aMenuItems[0] });
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oResourceBundle.getText("RENAME_BINDING_ERROR_TEXT"),
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when the Label gets renamed and the new value is empty and invalid", async function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				"noEmptyText"
			]);
			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);
			await RtaQunitUtils.simulateRename(
				sandbox,
				"",
				async () => {
					const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
					this.oRenamePlugin.handler([this.oLayoutOverlay], { menuItem: aMenuItems[0] });
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"),
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when the label of an element with a responsible element gets renamed and the new value is empty and invalid", async function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				"noEmptyText"
			]);
			addResponsibleElement(this.oButtonOverlay.getDesignTimeMetadata(), this.oButton, this.oVerticalLayout);
			this.oButtonOverlay.setSelectable(true);
			this.oButtonOverlay.setSelected(true);

			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);
			await RtaQunitUtils.simulateRename(
				sandbox,
				"",
				async () => {
					const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oButtonOverlay]);
					this.oRenamePlugin.handler([this.oButtonOverlay], { menuItem: aMenuItems[0] });
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"),
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when the Label gets renamed and the new value is invalid and multiple validators are available", async function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				{
					validatorFunction() {
						return false;
					},
					errorMessage: "invalid"
				},
				"noEmptyText"
			]);

			sandbox.stub(this.oRenamePlugin, "isAvailable").returns(true);
			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			await RtaQunitUtils.simulateRename(
				sandbox,
				"",
				async () => {
					const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
					this.oRenamePlugin.handler([this.oLayoutOverlay], { menuItem: aMenuItems[0] });
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						"invalid",
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when getParameters is called", function(assert) {
			const aParameters = this.oRenamePlugin.getParameters();
			assert.strictEqual(aParameters.length, 1, "then one parameter is returned");
			assert.strictEqual(aParameters[0].name, "newValue", "then the parameter is named 'newValue'");
			assert.strictEqual(aParameters[0].required, true, "then the parameter is required");
			assert.ok(aParameters[0].description, "then the parameter has a description");
		});

		QUnit.test("when createCommands is called directly", function(assert) {
			const oExpectedCommand = {};
			const oCreateCommandStub = sandbox.stub(this.oRenamePlugin, "createRenameCommand").returns(oExpectedCommand);

			const vResult = this.oRenamePlugin.createCommands(this.oLayoutOverlay, { newValue: "New Label" });

			assert.strictEqual(oCreateCommandStub.callCount, 1, "then createRenameCommand is called once");
			assert.strictEqual(
				oCreateCommandStub.getCall(0).args[0],
				this.oLayoutOverlay,
				"then createRenameCommand is called with the given overlay"
			);
			assert.strictEqual(
				oCreateCommandStub.getCall(0).args[1],
				"New Label",
				"then createRenameCommand is called with the new value from the parameters"
			);
			assert.strictEqual(vResult, oExpectedCommand, "then createCommands returns the created command");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});