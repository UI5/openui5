/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/m/Popover",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/rta/toolbar/contextBased/ManageAdaptations",
	"sap/ui/rta/toolbar/contextBased/SaveAsAdaptation",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	MessageBox,
	Popover,
	Lib,
	FlexState,
	FlexRuntimeInfoAPI,
	Version,
	ContextBasedAdaptationsAPI,
	FeaturesAPI,
	VersionsAPI,
	Layer,
	VerticalLayout,
	JSONModel,
	AppVariantFeature,
	RtaQunitUtils,
	ManageAdaptations,
	SaveAsAdaptation,
	Adaptation,
	BaseToolbar,
	ReloadManager,
	RuntimeAuthoring,
	Utils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	function createAndStartRTA(oAdaptationsModel) {
		this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
		const oButton = new Button("testButton");
		this.oContainer = new VerticalLayout({
			id: this.oComponent.createId("myVerticalLayout"),
			content: [oButton],
			width: "100%"
		});
		this.oContainer.placeAt("qunit-fixture");
		this.oRta = new RuntimeAuthoring({
			rootControl: this.oContainer,
			flexSettings: {
				developerMode: false
			}
		});
		return this.oRta.start()
		.then(function() {
			this.oToolbar = this.oRta.getToolbar();
			this.oRta._oContextBasedAdaptationsModel = oAdaptationsModel;
		}.bind(this));
	}

	function cleanUpCreateAndStartRTA() {
		this.oContainer.destroy();
		this.oComponent.destroy();
		this.oRta.destroy();
	}

	QUnit.module("Given Versions Model binding & formatter", {
		before() {
			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
			this.oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
		},
		after() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When switching versions is possible", function(assert) {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: true
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded
			.then(function() {
				this.oToolbar.setModel(this.oVersionsModel, "versions");
				this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
				assert.ok(this.oToolbar.getControl("versionButton").getEnabled(), "then the version button is enabled");
				this.oToolbar.destroy();
			}.bind(this));
		});

		QUnit.test("When switching versions is not possible", function(assert) {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded
			.then(function() {
				this.oToolbar.setModel(this.oVersionsModel, "versions");
				this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
				this.oVersionButton = this.oToolbar.getControl("versionButton");
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "then the version button is not visible");
				this.oToolbar.destroy();
			}.bind(this));
		});

		QUnit.test("When adaptation toolbar is given including save button", function(assert) {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oToolbar.setModel(this.oVersionsModel, "versions");

			return this.oToolbar._pFragmentLoaded
			.then(function() {
				assert.strictEqual(
					this.oToolbar.getControl("save").getTooltip(),
					"Save",
					"then without versioning enabled tooltip on save button is correct"
				);
				this.oVersionsModel.setProperty("/versioningEnabled", true);
				assert.strictEqual(
					this.oToolbar.getControl("save").getTooltip(),
					"Save Draft",
					"then with versioning enabled tooltip on save button is correct"
				);
				this.oToolbar.destroy();
			}.bind(this));
		});

		QUnit.test("when versioning is available and changes need a hard reload", async function(assert) {
			assert.expect(5);
			this.oToolbarControlsModel.setProperty("/changesNeedHardReload", true);
			this.oVersionsModel = new JSONModel({
				versioningEnabled: true
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			await this.oToolbar._pFragmentLoaded;
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			assert.strictEqual(this.oToolbar.getControl("versionButton").getVisible(), false, "then the version button is not visible");
			assert.strictEqual(this.oToolbar.getControl("hardReloadButton").getVisible(), true, "then the hard reload buttons are visible");
			assert.strictEqual(
				this.oToolbar.getControl("hardReloadInfoButton").getVisible(),
				true,
				"then the hard reload buttons are visible"
			);

			const oOpenPopoverStub = sandbox.stub(Popover.prototype, "openBy");
			this.oToolbar.getControl("hardReloadInfoButton").firePress();
			assert.strictEqual(oOpenPopoverStub.callCount, 1, "then the popover is opened");

			this.oToolbar.attachEventOnce("saveAndReload", () => {
				assert.ok(true, "then the save and reload event is fired");
			});
			this.oToolbar.getControl("hardReloadButton").firePress();

			this.oToolbar.destroy();
		});

		QUnit.test("when there is an exception in the init", function(assert) {
			sandbox.stub(BaseToolbar.prototype, "buildContent").rejects("error");
			sandbox.spy(BaseToolbar.prototype, "exit");
			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});
			this.oToolbar.destroy();
			assert.ok(BaseToolbar.prototype.exit.calledOnce, "then the exit function is called");
		});
	});

	QUnit.module("Test Adaptation Model binding & formatter and save as", {
		async beforeEach() {
			this.oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
			sandbox.stub(BaseToolbar.prototype, "placeToContainer").callsFake(function() {
				this.placeAt("qunit-fixture");
			});
			const oAdaptationsModel = new JSONModel({
				adaptations: [],
				count: 0,
				displayedAdaptation: {}
			});
			this.oControlsModel = RtaQunitUtils.createToolbarControlsModel();
			sandbox.stub(ContextBasedAdaptationsAPI, "initialize").resolves(oAdaptationsModel);
			this.oCanMigrateStub = sandbox.stub(ContextBasedAdaptationsAPI, "canMigrate").resolves(false);
			this.oMigrateStub = sandbox.stub(ContextBasedAdaptationsAPI, "migrate").resolves(false);

			this.oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox");
			this.oOpenAddAdaptationDialogStub = sandbox.stub(SaveAsAdaptation.prototype, "openAddAdaptationDialog");
			this.oOpenManageAdaptationDialog = sandbox.stub(ManageAdaptations.prototype, "openManageAdaptationDialog");

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});
			this.oToolbar.attachSwitchAdaptation(function(oEvent) {
				this.sSwitchedToAdaptation = oEvent.getParameter("adaptationId");
				oEvent.getParameter("callback")();
			}.bind(this));
			this.oToolbar.setRtaInformation({
				flexSettings: {
					layer: "CUSTOMER"
				},
				commandStack: {
					canSave: function() {
						return this.hasDirtyChanges;
					}.bind(this),
					removeAllCommands: function() {
						this.bRemovedAllCommands = true;
					}.bind(this)
				}
			});
			this.oVersionsModel = new JSONModel({
				backendDraft: true,
				displayedVersion: "0"
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			await this.oToolbar._pFragmentLoaded;
			await RtaQunitUtils.showActionsMenu(this.oToolbar);
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given no context-based adaptation is available", function(assert) {
			this.oAdaptationsModel = new JSONModel({
				adaptations: [],
				count: 0,
				displayedAdaptation: {}
			});

			this.oToolbar.setModel(this.oAdaptationsModel, "contextBasedAdaptations");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			const oContextBasedAdaptationMenu = this.oToolbar.getControl("contextBasedAdaptationMenu");
			assert.ok(oContextBasedAdaptationMenu.getEnabled(), "then the context-based adaptation menu is enabled");
			const sExpectedTitle = this.oToolbar.getTextResources().getText("BTN_ADAPTING_FOR_ALL_USERS");
			assert.strictEqual(oContextBasedAdaptationMenu.getText(), sExpectedTitle, "then the menu text is rendered correctly ");
			assert.ok(this.oToolbar.getControl("saveAsAdaptation").getEnabled(), "then the save as new adaptation button is enabled");
			assert.ok(this.oToolbar.getControl("manageAdaptations").getEnabled(), "then the manage adaptations button is enabled");
			assert.notOk(this.oToolbar.getControl("switchAdaptations").getVisible(), "then the switch adaptations button is not visible");
		});

		QUnit.test("Given two context-based adaptation are available and the displayed adaptation is default (context-free) (ABAP Style)", function(assert) {
			this.oAdaptationsModel = new JSONModel({
				allAdaptations: [{ title: "Sales" }, { title: "Manager" }, { title: "" }],
				adaptations: [{ title: "Sales" }, { title: "Manager" }],
				count: 2,
				displayedAdaptation: { title: "" }
			});

			this.oToolbar.setModel(this.oAdaptationsModel, "contextBasedAdaptations");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			const oContextBasedAdaptationMenu = this.oToolbar.getControl("contextBasedAdaptationMenu");
			assert.ok(oContextBasedAdaptationMenu.getEnabled(), "then the context-based adaptation menu is enabled");
			const sExpectedTitle = this.oToolbar.getTextResources().getText(this.oToolbar.getTextResources().getText("TXT_DEFAULT_APP"));
			assert.strictEqual(oContextBasedAdaptationMenu.getText(), sExpectedTitle, "then the menu text is rendered correctly ");
			assert.ok(this.oToolbar.getControl("saveAsAdaptation").getEnabled(), "then the save as new adaptation button is enabled");
			assert.ok(this.oToolbar.getControl("manageAdaptations").getEnabled(), "then the manage adaptations button is enabled");
			assert.notOk(this.oToolbar.getControl("editAdaptation").getVisible(), "then the edit adaptations button is not visible");
			assert.notOk(this.oToolbar.getControl("deleteAdaptation").getVisible(), "then the delete adaptations button is not visible");
			const oSwitchAdaptationsButton = this.oToolbar.getControl("switchAdaptations");
			assert.ok(oSwitchAdaptationsButton.getVisible(), "then the switch adaptations button is visible");
			assert.strictEqual(oSwitchAdaptationsButton.getItems().length, 3, "number of adaptations to be switched is correct");
		});

		QUnit.test("Given two context-based adaptation are available and the displayed adaptation is default (context-free) (CF Style)", function(assert) {
			this.oAdaptationsModel = new JSONModel({
				allAdaptations: [{ title: "Sales" }, { title: "Manager" }, {}],
				adaptations: [{ title: "Sales" }, { title: "Manager" }],
				count: 2,
				displayedAdaptation: {}
			});

			this.oToolbar.setModel(this.oAdaptationsModel, "contextBasedAdaptations");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			const oContextBasedAdaptationMenu = this.oToolbar.getControl("contextBasedAdaptationMenu");
			assert.ok(oContextBasedAdaptationMenu.getEnabled(), "then the context-based adaptation menu is enabled");
			const sExpectedTitle = this.oToolbar.getTextResources().getText(this.oToolbar.getTextResources().getText("TXT_DEFAULT_APP"));
			assert.strictEqual(oContextBasedAdaptationMenu.getText(), sExpectedTitle, "then the menu text is rendered correctly ");
			assert.ok(this.oToolbar.getControl("saveAsAdaptation").getEnabled(), "then the save as new adaptation button is enabled");
			assert.ok(this.oToolbar.getControl("manageAdaptations").getEnabled(), "then the manage adaptations button is enabled");
			assert.notOk(this.oToolbar.getControl("editAdaptation").getVisible(), "then the edit adaptations button is not visible");
			assert.notOk(this.oToolbar.getControl("deleteAdaptation").getVisible(), "then the delete adaptations button is not visible");
			const oSwitchAdaptationsButton = this.oToolbar.getControl("switchAdaptations");
			assert.ok(oSwitchAdaptationsButton.getVisible(), "then the switch adaptations button is visible");
			assert.strictEqual(oSwitchAdaptationsButton.getItems().length, 3, "number of adaptations to be switched is correct");
		});

		QUnit.test("Given two context-based adaptation are available", function(assert) {
			this.oAdaptationsModel = new JSONModel({
				allAdaptations: [{ title: "Sales" }, { title: "Manager" }, { title: "" }],
				adaptations: [{ title: "Sales" }, { title: "Manager" }],
				count: 2,
				displayedAdaptation: { title: "Sales" }
			});

			this.oToolbar.setModel(this.oAdaptationsModel, "contextBasedAdaptations");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			const oContextBasedAdaptationMenu = this.oToolbar.getControl("contextBasedAdaptationMenu");
			assert.ok(oContextBasedAdaptationMenu.getEnabled(), "then the context-based adaptation menu is enabled");
			const sExpectedTitle = this.oToolbar.getTextResources().getText("BTN_ADAPTING_FOR", ["Sales"]);
			assert.strictEqual(oContextBasedAdaptationMenu.getText(), sExpectedTitle, "then the menu text is rendered correctly ");
			assert.ok(this.oToolbar.getControl("saveAsAdaptation").getEnabled(), "then the save as new adaptation button is enabled");
			assert.ok(this.oToolbar.getControl("manageAdaptations").getEnabled(), "then the manage adaptations button is enabled");
			assert.ok(this.oToolbar.getControl("editAdaptation").getVisible(), "then the edit adaptations button is visible");
			assert.ok(this.oToolbar.getControl("deleteAdaptation").getVisible(), "then the delete adaptations button is visible");
			const oSwitchAdaptationsButton = this.oToolbar.getControl("switchAdaptations");
			assert.ok(oSwitchAdaptationsButton.getVisible(), "then the switch adaptations button is visible");
			assert.strictEqual(oSwitchAdaptationsButton.getItems().length, 3, "number of adaptations to be switched is correct");
		});

		QUnit.test("Given I am on backend draft, when save as is pressed", async function(assert) {
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "0"
			});

			await this.oToolbar.onSaveAsAdaptation();
			assert.strictEqual(this.oShowMessageBoxStub.callCount, 0, "Warning is not shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 1, "Dialog is opened");
		});

		QUnit.test("Given I am on client draft, when save as is pressed", async function(assert) {
			this.oVersionsModel.setData({
				backendDraft: false,
				displayedVersion: "0"
			});

			await this.oToolbar.onSaveAsAdaptation();
			assert.strictEqual(this.oShowMessageBoxStub.callCount, 0, "Warning is not shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 1, "Dialog is opened");
		});

		QUnit.test("Given I am on active version without draft, when save as is pressed", async function(assert) {
			this.oVersionsModel.setData({
				backendDraft: false,
				displayedVersion: "12345"
			});

			await this.oToolbar.onSaveAsAdaptation();

			assert.strictEqual(this.oShowMessageBoxStub.callCount, 0, "Warning is not shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 1, "Dialog is opened");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.getCall(0).args[0], Layer.CUSTOMER, "Dialog has correct layer");
			assert.notOk(this.oOpenAddAdaptationDialogStub.getCall(0).args[1], "Dialog not in edit mode (but create)");
		});

		QUnit.test("Given I am on active version with draft, when save as is pressed I confirm warning", async function(assert) {
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "12345"
			});
			this.oShowMessageBoxStub.resolves(MessageBox.Action.OK);

			await this.oToolbar.onSaveAsAdaptation();

			assert.strictEqual(this.oShowMessageBoxStub.callCount, 1, "Warning is shown");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(0).args[0], "warning", "Warning is shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 1, "Dialog is opened");
		});

		QUnit.test("Given I am on active version with draft, when save as is pressed I cancel warning", async function(assert) {
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "12345"
			});
			this.oShowMessageBoxStub.resolves(MessageBox.Action.CANCEL);

			await this.oToolbar.onSaveAsAdaptation();

			assert.strictEqual(this.oShowMessageBoxStub.callCount, 1, "Warning is shown");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(0).args[0], "warning", "Warning is shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 0, "Dialog is opened");
		});

		QUnit.test("Given I am on active version with draft, when edit as is pressed I confirm warning", async function(assert) {
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "12345"
			});
			this.oShowMessageBoxStub.resolves(MessageBox.Action.OK);

			await this.oToolbar.onEditAdaptation();

			assert.strictEqual(this.oShowMessageBoxStub.callCount, 1, "Warning is shown");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(0).args[0], "warning", "Warning is shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 1, "Dialog is opened");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.getCall(0).args[0], "CUSTOMER", "Dialog has correct layer");
			assert.ok(this.oOpenAddAdaptationDialogStub.getCall(0).args[1], "Dialog in edit mode ");
		});

		QUnit.test("Given I am on active version with draft, when delete is pressed I confirm warning", async function(assert) {
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "12345"
			});
			this.oShowMessageBoxStub.resolves(MessageBox.Action.OK);
			let iEventCalls = 0;
			this.oToolbar.attachDeleteAdaptation(function() {
				iEventCalls++;
			});

			await this.oToolbar.onDeleteAdaptation();

			assert.strictEqual(this.oShowMessageBoxStub.callCount, 1, "Warning is shown");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(0).args[0], "warning", "Warning is shown");
			assert.strictEqual(iEventCalls, 1, "Event is raised");
		});

		QUnit.test("Given I am on active version with draft, when manage as is pressed", async function(assert) {
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "12345"
			});
			this.oShowMessageBoxStub.resolves(MessageBox.Action.OK);

			await this.oToolbar.onManageAdaptations();

			assert.strictEqual(this.oShowMessageBoxStub.callCount, 0, "Warning is not shown (will be shown on save)");
			assert.strictEqual(this.oOpenManageAdaptationDialog.callCount, 1, "Dialog is opened");
		});

		QUnit.test("Given a migration is needed and I am on backend draft, when save as is pressed and I cancel migration and there are no dirty changes", async function(assert) {
			this.oCanMigrateStub.resolves(true);
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "0"
			});
			this.oShowMessageBoxStub.resolves(MessageBox.Action.CANCEL);
			this.hasDirtyChanges = false;

			await this.oToolbar.onSaveAsAdaptation();

			assert.strictEqual(this.oShowMessageBoxStub.callCount, 1, "Migration Information is shown");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(0).args[0], "confirm", "Migration Information is shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 0, "Dialog is not opened");
			assert.notOk(this.bRemovedAllCommands, "Did not revert dirty changes");
			assert.strictEqual(this.oMigrateStub.callCount, 0, "migrate is called");
			assert.notOk(this.sSwitchedToAdaptation, "Did not switch adaptation");
			assert.strictEqual(this.oOpenManageAdaptationDialog.callCount, 0, "Manage Dialog is not opened");
		});

		QUnit.test("Given a migration is needed and I am on backend draft, when save as is pressed and I confirm migration and there are no dirty changes", async function(assert) {
			this.oCanMigrateStub.resolves(true);
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "0"
			});
			this.oShowMessageBoxStub.resolves("something positive");
			this.hasDirtyChanges = false;

			await this.oToolbar.onSaveAsAdaptation();

			return new Promise(function(resolve) {
				setTimeout(resolve, 0);
			}).then(function() {
				assert.strictEqual(this.oShowMessageBoxStub.callCount, 2, "Migration Information is shown");
				assert.strictEqual(this.oShowMessageBoxStub.getCall(0).args[0], "confirm", "Migration Information is shown");
				assert.strictEqual(this.oShowMessageBoxStub.getCall(1).args[0], "information", "Migration completed is shown");
				assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 0, "Dialog is not opened");
				assert.notOk(this.bRemovedAllCommands, "Did not revert dirty changes");
				assert.strictEqual(this.oMigrateStub.callCount, 1, "migrate is called");
				assert.ok(this.sSwitchedToAdaptation, "switched adaptation");
				assert.strictEqual(
					this.oOpenManageAdaptationDialog.callCount,
					0,
					"Manage Dialog is not opened (because it does not work after reload)"
				);
			}.bind(this));
		});

		QUnit.test("Given a migration is needed and I am on active version with backend draft existing , when save as is pressed and I confirm all and there are dirty changes", async function(assert) {
			assert.expect(9);
			this.oCanMigrateStub.resolves(true);
			this.oVersionsModel.setData({
				backendDraft: true,
				displayedVersion: "12345"
			});
			this.oShowMessageBoxStub.resolves(MessageBox.Action.OK);
			this.hasDirtyChanges = true;

			this.oToolbar.attachSave(function(oEvent) {
				assert.strictEqual(oEvent.sId, "save", "Dirty changes were saved");
				oEvent.getParameter("callback")();
			});
			await this.oToolbar.onSaveAsAdaptation();

			assert.strictEqual(this.oShowMessageBoxStub.callCount, 3, "Some dialogs are show");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(0).args[0], "warning", "Discard draft warning is shown");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(1).args[0], "confirm", "Migration Information is shown");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(2).args[0], "information", "Migration completed is shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 0, "Save as Dialog is not opened");
			assert.strictEqual(this.oMigrateStub.callCount, 1, "migrate is called");
			assert.ok(this.sSwitchedToAdaptation, "switched adaptation");
			assert.strictEqual(
				this.oOpenManageAdaptationDialog.callCount,
				0,
				"Manage Dialog is opened (because it does not work after reload)"
			);
		});

		QUnit.test("Given a migration is needed and there are dirty changes", async function(assert) {
			assert.expect(8);
			this.oCanMigrateStub.resolves(true);
			this.oVersionsModel.setData({
				backendDraft: false,
				displayedVersion: "0"
			});
			this.oShowMessageBoxStub.resolves(MessageBox.Action.OK);
			this.hasDirtyChanges = true;

			this.oToolbar.attachSave(function(oEvent) {
				assert.strictEqual(oEvent.sId, "save", "Dirty changes were saved");
				oEvent.getParameter("callback")();
			});
			await this.oToolbar.onSaveAsAdaptation();
			assert.strictEqual(this.oShowMessageBoxStub.callCount, 2, "Some dialogs are show");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(0).args[0], "confirm", "Migration Information is shown");
			assert.strictEqual(this.oShowMessageBoxStub.getCall(1).args[0], "information", "Migration completed is shown");
			assert.strictEqual(this.oOpenAddAdaptationDialogStub.callCount, 0, "Save as Dialog is not opened");
			assert.strictEqual(this.oMigrateStub.callCount, 1, "migrate is called");
			assert.ok(this.sSwitchedToAdaptation, "switched adaptation");
			assert.strictEqual(this.oOpenManageAdaptationDialog.callCount,
				0,
				"Manage Dialog is opened (because it does not work after reload)"
			);
		});
	});

	QUnit.module("Given RTA and context-based adaptation is enabled and filled", {
		beforeEach() {
			this.oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
			sandbox.stub(BaseToolbar.prototype, "placeToContainer").callsFake(function() {
				this.placeAt("qunit-fixture");
			});
			this.oControlsModel = RtaQunitUtils.createToolbarControlsModel();
		},
		afterEach() {
			this.oContainer.destroy();
			this.oComponent.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		// TODO: This test should be deleted after OPA5 test are available for this functionality
		QUnit.test("When two context-based adaptation are available and then both adaptations are deleted one after the other", async function(assert) {
			const oDefaultAdaptation = {
				id: "DEFAULT",
				contexts: {},
				title: "",
				description: "",
				createdBy: "",
				createdAt: "",
				changedBy: "",
				changedAt: "",
				type: "DEFAULT"
			};
			const aAdaptations = [
				{
					title: "Sales",
					rank: 1,
					id: "id_1234"
				},
				{
					title: "Manager",
					rank: 2,
					id: "id_5678"
				},
				oDefaultAdaptation
			];
			const oAdaptationsModel = ContextBasedAdaptationsAPI.createModel(aAdaptations, aAdaptations[0], true);

			sandbox.stub(FlexState, "update");
			sandbox.stub(ContextBasedAdaptationsAPI, "remove").resolves({ status: 204 });
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(oAdaptationsModel);
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.OK);
			const oReloadStub = sandbox.stub(ReloadManager, "triggerReload");

			await createAndStartRTA.call(this, oAdaptationsModel);
			this.oToolbar.setModel(oAdaptationsModel, "contextBasedAdaptations");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			await RtaQunitUtils.showActionsMenu(this.oToolbar);
			const oMenuButton = this.oToolbar.getControl("contextBasedAdaptationMenu");
			const oDeleteButton = this.oToolbar.getControl("deleteAdaptation");
			const oEditButton = this.oToolbar.getControl("editAdaptation");
			assert.strictEqual(oDeleteButton.getEnabled(), true, "then the context-based adaptation delete menu button is enabled");
			assert.strictEqual(oDeleteButton.getVisible(), true, "then the context-based adaptation delete menu button is enabled");
			assert.strictEqual(oEditButton.getEnabled(), true, "then the context-based edit menu button is enabled");
			assert.strictEqual(oEditButton.getVisible(), true, "then the context-based edit menu button is enabled");
			assert.strictEqual(oMenuButton.getText(), "Adapting for 'Sales'", "then the menu text is rendered correctly");

			this.oToolbar.onDeleteAdaptation();
			await new Promise((resolve) => {
				oReloadStub.callsFake(function() {
					resolve();
				});
			});
			oReloadStub.reset();

			assert.strictEqual(oAdaptationsModel.getProperty("/count"), 1, "only one adaptation is left in the model");
			assert.strictEqual(oDeleteButton.getVisible(), true, "then the context-based adaptation delete menu button is enabled");
			assert.strictEqual(oEditButton.getVisible(), true, "then the context-based edit menu button is enabled");
			assert.strictEqual(oMenuButton.getText(), "Adapting for 'Manager'", "then the menu text is rendered correctly");

			this.oToolbar.onDeleteAdaptation();
			await new Promise((resolve) => {
				oReloadStub.callsFake(function() {
					resolve();
				});
			});
			assert.strictEqual(oAdaptationsModel.getProperty("/count"), 0, "only one adaptation is left in the model");
			assert.strictEqual(oDeleteButton.getVisible(), false, "then the context-based adaptation delete menu button is enabled");
			assert.strictEqual(oEditButton.getVisible(), false, "then the context-based edit menu button is enabled");
			assert.strictEqual(oMenuButton.getText(), "Adapting for 'All Users'", "then the menu text is rendered correctly");
		});
	});

	QUnit.module("Setting AppVariant properties", {
		beforeEach() {
			this.oToolbar = new Adaptation({
				textResources: Lib.getResourceBundleFor("sap.ui.rta"),
				rtaInformation: {
					flexSettings: {
						layer: Layer.CUSTOMER
					}
				}
			});
			this.oControlsModel = RtaQunitUtils.createToolbarControlsModel();
			this.oToolbar.setModel(this.oControlsModel, "controls");
			this.oToolbar.setModel(new JSONModel({}), "versions");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		[{
			description: "Given a toolbar is created, current version is 'Draft' and 'Save As' app variant is enabled",
			versionNumber: Version.Number.Draft,
			appVariantMenu: {
				saveAs: {
					visible: true,
					enabled: true
				}
			}
		},
		{
			description: "Given a toolbar is created, current version is 'Draft' and 'Save As' app variant is not enabled",
			versionNumber: Version.Number.Draft,
			appVariantMenu: {
				saveAs: {
					visible: true,
					enabled: false
				}
			}
		},
		{
			description: "Given a toolbar is created, current version is not 'Draft' and 'Save As' app variant is not enabled",
			versionNumber: Version.Number.Original,
			appVariantMenu: {
				saveAs: {
					visible: true,
					enabled: false
				}
			}
		},
		{
			description: "Given a toolbar is created, current version is not 'Draft' and 'Save As' app variant is enabled",
			versionNumber: Version.Number.Original,
			appVariantMenu: {
				saveAs: {
					visible: true,
					enabled: true
				}
			}
		}].forEach(function(oTestSetup) {
			QUnit.test(oTestSetup.description, async function(assert) {
				const oVersionsModel = new JSONModel({
					versioningEnabled: true,
					backendDraft: true,
					displayedVersion: oTestSetup.versionNumber
				});
				this.oToolbar.setModel(oVersionsModel, "versions");

				this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", oTestSetup.appVariantMenu.saveAs.visible);
				this.oControlsModel.setProperty("/appVariantMenu/saveAs/enabled", oTestSetup.appVariantMenu.saveAs.enabled);
				this.oControlsModel.setProperty("/appVariantMenu/overview/visible", true);
				this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", true);

				this.oToolbar.animation = false;
				await this.oToolbar.show();
				await RtaQunitUtils.showActionsMenu(this.oToolbar);
				const oSaveAsButton = this.oToolbar.getControl("saveAs");
				const bIsSaveAsEnabled = Version.Number.Draft !== oTestSetup.versionNumber && oTestSetup.appVariantMenu.saveAs.enabled;
				assert.strictEqual(oSaveAsButton.getEnabled(), bIsSaveAsEnabled, `saveAs has enabled status ${bIsSaveAsEnabled}`);
				assert.deepEqual(
					oSaveAsButton.getTooltip(),
					bIsSaveAsEnabled ? null : "Only active versions can be saved as app variants. Please activate your draft.",
					`then ${bIsSaveAsEnabled ? "no" : "a"} tooltip is set for saveAs`);
			});
		});

		QUnit.test("Given a toolbar is created and app variants parameter in the model are switched back and forth", function(assert) {
			this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", false);
			this.oControlsModel.setProperty("/appVariantMenu/overview/visible", false);
			this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", false);
			this.oToolbar.animation = false;

			let oGetOverviewStub;
			let oSaveAsStub;
			this.oToolbar.animation = false;
			return this.oToolbar.show()
			.then(function() {
				oGetOverviewStub = sandbox.stub(AppVariantFeature, "onGetOverview");
				oSaveAsStub = sandbox.stub(AppVariantFeature, "onSaveAs");
				return RtaQunitUtils.showActionsMenu(this.oToolbar);
			}.bind(this))
			.then(function() {
				const oSaveAsButton = this.oToolbar.getControl("saveAs");
				const oManageAppsButton = this.oToolbar.getControl("manageApps");
				const oOverviewButton = this.oToolbar.getControl("appVariantOverview");

				assert.notOk(oSaveAsButton.getVisible(), "saveAs is not visible");
				assert.deepEqual(
					oSaveAsButton.getTooltip(),
					"Only active versions can be saved as app variants. Please activate your draft.",
					"then the correct tooltip is set for saveAs");
				assert.notOk(oOverviewButton.getVisible(), "appVariantOverview is not visible");
				assert.notOk(oManageAppsButton.getVisible(), "manageApps is not visible");

				this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", true);
				this.oControlsModel.setProperty("/appVariantMenu/saveAs/enabled", false);
				this.oControlsModel.setProperty("/appVariantMenu/overview/visible", false);
				this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", true);
				this.oControlsModel.setProperty("/appVariantMenu/manageApps/enabled", false);
				assert.ok(oSaveAsButton.getVisible(), "saveAs is visible");
				assert.notOk(oSaveAsButton.getEnabled(), "saveAs is not enabled");
				assert.deepEqual(
					oSaveAsButton.getTooltip(),
					"Only active versions can be saved as app variants. Please activate your draft.",
					"then the correct tooltip is set for saveAs");
				assert.notOk(oOverviewButton.getVisible(), "AppVariantOverview is not visible");
				assert.ok(oManageAppsButton.getVisible(), "manageApps is visible");
				assert.notOk(oManageAppsButton.getEnabled(), "manageApps is not enabled");

				this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", true);
				this.oControlsModel.setProperty("/appVariantMenu/saveAs/enabled", true);
				this.oControlsModel.setProperty("/appVariantMenu/overview/visible", false);
				this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", true);
				this.oControlsModel.setProperty("/appVariantMenu/manageApps/enabled", true);
				assert.ok(oSaveAsButton.getVisible(), "saveAs is visible");
				assert.ok(oSaveAsButton.getEnabled(), "saveAs is enabled");
				assert.deepEqual(
					oSaveAsButton.getTooltip(),
					null,
					"then no tooltip is set for saveAs");
				assert.notOk(oOverviewButton.getVisible(), "AppVariantOverview is not visible");
				assert.ok(oManageAppsButton.getVisible(), "manageApps is visible");
				assert.ok(oManageAppsButton.getEnabled(), "manageApps is enabled");

				oManageAppsButton.firePress();
				assert.strictEqual(oGetOverviewStub.callCount, 1, "the overview function was called");
				assert.strictEqual(oGetOverviewStub.lastCall.args[0], true, "the first agrument is true");
				assert.strictEqual(oGetOverviewStub.lastCall.args[1], Layer.CUSTOMER, "the second agrument is the current layer");

				oSaveAsButton.firePress();
				assert.strictEqual(oSaveAsStub.callCount, 1, "the save as function was called");
				assert.deepEqual(oSaveAsStub.lastCall.args, [true, true, Layer.CUSTOMER, null], "the correct arguments got passed");

				this.oControlsModel.setProperty("/appVariantMenu/saveAs/visible", true);
				this.oControlsModel.setProperty("/appVariantMenu/saveAs/enabled", true);
				this.oControlsModel.setProperty("/appVariantMenu/overview/visible", true);
				this.oControlsModel.setProperty("/appVariantMenu/overview/enabled", true);
				this.oControlsModel.setProperty("/appVariantMenu/manageApps/visible", false);
				this.oControlsModel.setProperty("/appVariantMenu/manageApps/enabled", false);
				assert.ok(oSaveAsButton.getVisible(), "saveAs is visible");
				assert.ok(oSaveAsButton.getEnabled(), "saveAs is enabled");
				assert.deepEqual(
					oSaveAsButton.getTooltip(),
					null,
					"then no tooltip is set for saveAs");
				assert.ok(oOverviewButton.getVisible(), "AppVariantOverview is visible");
				assert.ok(oOverviewButton.getEnabled(), "AppVariantOverview is enabled");
				assert.notOk(oManageAppsButton.getVisible(), "manageApps is not visible");
				assert.notOk(oManageAppsButton.getEnabled(), "manageApps is not enabled");

				oOverviewButton.getItems()[0].firePress();
				assert.strictEqual(oGetOverviewStub.callCount, 2, "the overview function was called");
				assert.strictEqual(oGetOverviewStub.lastCall.args[0], true, "the first agrument is true");
				assert.strictEqual(oGetOverviewStub.lastCall.args[1], Layer.CUSTOMER, "the second agrument is the current layer");

				oOverviewButton.getItems()[1].firePress();
				assert.strictEqual(oGetOverviewStub.callCount, 3, "the overview function was called");
				assert.strictEqual(oGetOverviewStub.lastCall.args[0], false, "the first agrument is false");
				assert.strictEqual(oGetOverviewStub.lastCall.args[1], Layer.CUSTOMER, "the second agrument is the current layer");
			}.bind(this));
		});

		QUnit.test("Given a toolbar is created and app variants parameter in the model are set to false", function(assert) {
			sandbox.stub(AppVariantFeature, "isSaveAsAvailable").resolves(true);
			sandbox.stub(AppVariantFeature, "isManifestSupported").resolves(false);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").resolves(true);

			return createAndStartRTA.call(this)
			.then(function() {
				return RtaQunitUtils.showActionsMenu(this.oToolbar);
			}.bind(this))
			.then(function() {
				const oAppVariantMenuControl = this.oToolbar.getControl("appVariantMenu");
				assert.notOk(oAppVariantMenuControl.getEnabled(), "then the app variant menu is not enabled");
				assert.strictEqual(
					oAppVariantMenuControl.getTooltip(),
					"App variants are not supported for this app.",
					"then the app variant menu tooltip is correct"
				);
				cleanUpCreateAndStartRTA.call(this);
			}.bind(this));
		});

		QUnit.test("Given a toolbar is created and app variants parameter in the model are set to true", function(assert) {
			sandbox.stub(AppVariantFeature, "isSaveAsAvailable").resolves(true);
			sandbox.stub(AppVariantFeature, "isManifestSupported").resolves(true);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").resolves(true);

			return createAndStartRTA.call(this)
			.then(function() {
				return RtaQunitUtils.showActionsMenu(this.oToolbar);
			}.bind(this))
			.then(function() {
				const oAppVariantMenuControl = this.oToolbar.getControl("appVariantMenu");
				assert.ok(oAppVariantMenuControl.getEnabled(), "then the app variant menu is enabled");
				assert.strictEqual(
					oAppVariantMenuControl.getTooltip(),
					null,
					"then the app variant menu does not have a tooltip"
				);
				cleanUpCreateAndStartRTA.call(this);
			}.bind(this));
		});
	});

	QUnit.module("Setting different modes", {
		beforeEach() {
			this.oToolbar = new Adaptation({
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oVersionsModel = new JSONModel({
				versioningEnabled: true,
				displayedVersion: Version.Number.Draft
			});
			this.oControlsModel = new JSONModel({
				changesNeedHardReload: false,
				restore: {
					visible: true
				},
				appVariantMenu: {
					overview: {
						visible: true
					},
					saveAs: {
						visible: true
					},
					manageApps: {
						visible: true
					}
				}
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oControlsModel, "controls");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a toolbar is created and mode is set to 'adaptation'", async function(assert) {
			this.oControlsModel.setProperty("/adaptationMode", true);
			this.oToolbar.animation = false;
			await this.oToolbar.show();
			assert.ok(this.oToolbar.getControl("undo").getVisible(), "undo is visible");
			assert.ok(this.oToolbar.getControl("redo").getVisible(), "redo is visible");
			assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "versionButton is visible");
			assert.ok(this.oToolbar.getControl("activate").getVisible(), "activate is visible");
			assert.ok(this.oToolbar.getControl("discardDraft").getVisible(), "discardDraft is visible");

			await RtaQunitUtils.showActionsMenu(this.oToolbar);

			assert.ok(this.oToolbar.getControl("highlightAllChanges").getVisible(), "highlight all changes is visible");
			assert.ok(this.oToolbar.getControl("feedback").getVisible(), "feedback is visible");
			assert.ok(this.oToolbar.getControl("contextBasedAdaptationMenu").getVisible(), "contextBasedAdaptationMenu is visible");
			assert.ok(this.oToolbar.getControl("translateMenu").getVisible(), "translateMenu is visible");
			assert.ok(this.oToolbar.getControl("restore").getVisible(), "restore is visible");
			assert.ok(this.oToolbar.getControl("manageApps").getVisible(), "manageApps is visible");
			assert.ok(this.oToolbar.getControl("appVariantOverview").getVisible(), "appVariantOverview is visible");
			assert.ok(this.oToolbar.getControl("saveAs").getVisible(), "saveAs is visible");
		});

		QUnit.test("Given a toolbar is created and mode is set to 'navigation'", async function(assert) {
			this.oControlsModel.setProperty("/adaptationMode", false);
			this.oToolbar.animation = false;
			await this.oToolbar.show();

			assert.notOk(this.oToolbar.getControl("undo").getVisible(), "undo is not visible");
			assert.notOk(this.oToolbar.getControl("redo").getVisible(), "redo is not visible");
			assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "versionButton is not visible");
			assert.notOk(this.oToolbar.getControl("activate").getVisible(), "activate is not visible");
			assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "discardDraft is not visible");
			assert.ok(this.oToolbar.getControl("actionsMenu").getVisible(), "actionsMenu is visible");
			assert.notOk(this.oToolbar.getControl("actionsMenu").getEnabled(), "actionsMenu is not enabled");
		});
	});

	QUnit.module("Feedback Button", {
		afterEach() {
			this.oToolbar.closeFeedbackForm();
			this.oRta.destroy();
			this.oComponent.destroy();
			this.oContainer.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when being on a system with LocalStorageConnector", async function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "getConfiguredFlexServices").returns([
				{ connector: "LocalStorageConnector" }
			]);
			await createAndStartRTA.call(this);
			await RtaQunitUtils.showActionsMenu(this.oToolbar);
			assert.notOk(
				this.oToolbar.getControl("feedback").getVisible(),
				"then the feedback button is not enabled"
			);
		});

		["KeyUserConnector", "BtpServiceConnector"].forEach(function(sConnectorName) {
			QUnit.test(`when being on a system with ${sConnectorName}`, async function(assert) {
				sandbox.stub(FlexRuntimeInfoAPI, "getFeedbackInformation").returns({
					appId: "someAppId",
					appVersion: "someAppVersion",
					connector: sConnectorName,
					version: "someVersion"
				});
				await createAndStartRTA.call(this);
				await RtaQunitUtils.showActionsMenu(this.oToolbar);
				assert.ok(
					this.oToolbar.getControl("feedback").getVisible(),
					"then the feedback button is enabled"
				);
				await this.oToolbar.showFeedbackForm();
				const oIframeURL = new URL(this.oToolbar._oFeedbackDialog.getContent()[0].getBindingInfo("url").binding.getValue());
				assert.ok(
					oIframeURL.pathname.endsWith("SV_4MANxRymEIl9K06"),
					"then the proper form id is passed"
				);
				assert.strictEqual(
					oIframeURL.searchParams.get("version"),
					"someVersion",
					"then the proper version is passed"
				);
				assert.strictEqual(
					oIframeURL.searchParams.get("feature"),
					"BTP",
					"then the proper platform is passed"
				);
				assert.strictEqual(
					oIframeURL.searchParams.get("appId"),
					"someAppId",
					"then the proper app id is passed"
				);
				assert.strictEqual(
					oIframeURL.searchParams.get("appVersion"),
					"someAppVersion",
					"then the proper app version is passed"
				);
				assert.strictEqual(
					oIframeURL.searchParams.get("product_filter"),
					"Key%20User%20Adaptation",
					"then the proper product filter is passed"
				);
			});
		});

		QUnit.test("when being on a system with LrepConnector", async function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "getFeedbackInformation").returns({
				appId: "someAppId",
				appVersion: "someAppVersion",
				connector: "LrepConnector",
				version: "someVersion"
			});
			await createAndStartRTA.call(this);
			await RtaQunitUtils.showActionsMenu(this.oToolbar);
			assert.ok(
				this.oToolbar.getControl("feedback").getVisible(),
				"then the feedback button is enabled"
			);
			await this.oToolbar.showFeedbackForm();
			const oIframeURL = new URL(this.oToolbar._oFeedbackDialog.getContent()[0].getBindingInfo("url").binding.getValue());
			assert.strictEqual(
				oIframeURL.searchParams.get("feature"),
				"ABAP",
				"then the proper platform is passed"
			);
		});
	});

	function createMockNavigationAPI(aEntries, iCurrentIndex) {
		const oCurrentEntry = aEntries[iCurrentIndex];
		return {
			currentEntry: oCurrentEntry,
			entries() {
				return aEntries;
			},
			setCurrentEntryByIndex(iIndex) {
				this.currentEntry = aEntries[iIndex];
			},
			addEventListener: sandbox.stub(),
			removeEventListener: sandbox.stub()
		};
	}

	function createNavigationEntry(sKey, iIndex) {
		return { key: sKey, index: iIndex };
	}

	// Minimal in-memory session storage so persistence can be asserted without touching real storage.
	function stubSessionStorage() {
		const mStore = {};
		sandbox.stub(window.sessionStorage, "getItem").callsFake((sKey) => (sKey in mStore ? mStore[sKey] : null));
		sandbox.stub(window.sessionStorage, "setItem").callsFake((sKey, sValue) => { mStore[sKey] = String(sValue); });
		sandbox.stub(window.sessionStorage, "removeItem").callsFake((sKey) => { delete mStore[sKey]; });
		return mStore;
	}

	QUnit.module("Navigate Back", {
		beforeEach() {
			this.oToolbar = new Adaptation({
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oToolbar.setModel(new JSONModel({}), "versions");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when navigateBack is called, it calls history.back", function(assert) {
			const oHistoryBackStub = sandbox.stub(window.history, "back");

			this.oToolbar.navigateBack();

			assert.strictEqual(oHistoryBackStub.callCount, 1, "then window.history.back was called");
		});
	});

	QUnit.module("Navigation Tracking", {
		beforeEach() {
			this.mSessionStore = stubSessionStorage();
			this.oOriginalNavigation = window.navigation;
			this.aNavigationEntries = [
				createNavigationEntry("entry-0", 0),
				createNavigationEntry("entry-1", 1),
				createNavigationEntry("entry-2", 2)
			];
			this.oMockNavigation = createMockNavigationAPI(this.aNavigationEntries, 1);
			window.navigation = this.oMockNavigation;

			this.oToolbar = new Adaptation({
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oToolbar.setModel(new JSONModel({}), "versions");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach() {
			this.oToolbar.destroy();
			window.navigation = this.oOriginalNavigation;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar is initialized, setupNavigationTracking is called", function(assert) {
			// The toolbar is already created in beforeEach, so setupNavigationTracking was already called.
			// We verify by checking that the starting boundary index was stored.
			assert.strictEqual(
				this.oToolbar._iStartingNavigationIndex,
				1,
				"then setupNavigationTracking was called during init and the starting index was stored"
			);
			assert.ok(
				this.oMockNavigation.addEventListener.calledWith("currententrychange"),
				"then addEventListener was called with 'currententrychange'"
			);
		});

		QUnit.test("when the toolbar is destroyed, cleanupNavigationTracking is called", function(assert) {
			const fnHandler = this.oToolbar._fnNavigationHandler;

			this.oToolbar.destroy();

			assert.ok(
				this.oMockNavigation.removeEventListener.calledWith("currententrychange", fnHandler),
				"then cleanupNavigationTracking was called during exit and removeEventListener was called"
			);
		});

		QUnit.test("when setupNavigationTracking is called, the starting index is stored and persisted", function(assert) {
			this.oToolbar.setupNavigationTracking();

			assert.strictEqual(
				this.oToolbar._iStartingNavigationIndex,
				1,
				"then the starting navigation index is stored"
			);
			const oPersisted = JSON.parse(this.mSessionStore["sap.ui.rta.toolbar.navigationBoundary"]);
			assert.deepEqual(
				oPersisted,
				{ index: 1, key: "entry-1" },
				"then the boundary index and anchor key are persisted to the session storage"
			);
			assert.ok(
				this.oMockNavigation.addEventListener.calledWith("currententrychange"),
				"then addEventListener was called with 'currententrychange'"
			);
			assert.ok(this.oToolbar._fnNavigationHandler, "then the navigation handler is stored");
		});

		QUnit.test("when setupNavigationTracking finds a valid persisted boundary, it is restored", function(assert) {
			// Simulate a discard-draft reload: RTA restarts on a deeper entry (the object page, index 2),
			// but a boundary from before the reload is still persisted and its anchor entry is unchanged.
			this.mSessionStore["sap.ui.rta.toolbar.navigationBoundary"] = JSON.stringify({ index: 0, key: "entry-0" });
			this.oMockNavigation.setCurrentEntryByIndex(2);

			this.oToolbar.setupNavigationTracking();

			assert.strictEqual(
				this.oToolbar._iStartingNavigationIndex,
				0,
				"then the original boundary index is restored instead of re-capturing the current (deeper) index"
			);

			// The controls model is only evaluated once the toolbar is shown / a navigation occurs.
			this.oToolbar._updateBackButtonState();
			assert.strictEqual(
				this.oToolbarControlsModel.getProperty("/backButton/enabled"),
				true,
				"then the back button is enabled because the current position is deeper than the restored boundary"
			);
		});

		QUnit.test("when the toolbar is shown, the back button state is recomputed for a restored boundary", function(assert) {
			// After a discard-draft reload the boundary is restored on a deeper entry, but no navigation
			// event fires. show() must recompute the state so the button reflects the restored boundary.
			this.mSessionStore["sap.ui.rta.toolbar.navigationBoundary"] = JSON.stringify({ index: 0, key: "entry-0" });
			this.oMockNavigation.setCurrentEntryByIndex(2);
			this.oToolbar.setupNavigationTracking();
			this.oToolbarControlsModel.setProperty("/backButton/enabled", false);
			this.oToolbar.animation = false;

			return this.oToolbar.show().then(() => {
				assert.strictEqual(
					this.oToolbarControlsModel.getProperty("/backButton/enabled"),
					true,
					"then the back button is enabled after the toolbar is shown"
				);
			});
		});

		QUnit.test("when setupNavigationTracking finds a persisted boundary with a mismatching anchor, it is ignored", function(assert) {
			// A stale value left behind by an abnormal termination: the anchor key no longer matches the
			// entry at that index, so the boundary must be captured anew (self-heal).
			this.mSessionStore["sap.ui.rta.toolbar.navigationBoundary"] = JSON.stringify({ index: 0, key: "some-old-key" });
			this.oMockNavigation.setCurrentEntryByIndex(1);

			this.oToolbar.setupNavigationTracking();

			assert.strictEqual(
				this.oToolbar._iStartingNavigationIndex,
				1,
				"then the stale boundary is ignored and the current index is captured as the new boundary"
			);
		});

		QUnit.test("when navigation occurs and current entry is at start position, back button is disabled", function(assert) {
			this.oToolbar.setupNavigationTracking();

			this.oMockNavigation.setCurrentEntryByIndex(1);
			this.oToolbar._fnNavigationHandler();

			assert.strictEqual(
				this.oToolbarControlsModel.getProperty("/backButton/enabled"),
				false,
				"then the back button is disabled"
			);
		});

		QUnit.test("when navigation occurs and current entry is ahead of start position, back button is enabled", function(assert) {
			this.oToolbar.setupNavigationTracking();

			this.oMockNavigation.setCurrentEntryByIndex(2);
			this.oToolbar._fnNavigationHandler();

			assert.strictEqual(
				this.oToolbarControlsModel.getProperty("/backButton/enabled"),
				true,
				"then the back button is enabled"
			);
		});

		QUnit.test("when navigation occurs and current entry is behind start position, back button is disabled", function(assert) {
			this.oToolbar.setupNavigationTracking();

			this.oMockNavigation.setCurrentEntryByIndex(0);
			this.oToolbar._fnNavigationHandler();

			assert.strictEqual(
				this.oToolbarControlsModel.getProperty("/backButton/enabled"),
				false,
				"then the back button is disabled"
			);
		});

		QUnit.test("when the originally captured entry was evicted but the boundary index still holds, back button is enabled", function(assert) {
			// Reproduces the incident regression: after a discard-draft reload, browser back and
			// re-navigation, the entry originally captured on init is evicted and the history is
			// rebuilt with new keys. The boundary is index 0 (list report) and the current entry is
			// index 1 (object page), so navigating back to the list report must be possible.
			this.mSessionStore["sap.ui.rta.toolbar.navigationBoundary"] = JSON.stringify({ index: 0, key: "entry-0" });
			this.oMockNavigation.setCurrentEntryByIndex(0);
			this.oToolbar.setupNavigationTracking();

			this.oMockNavigation.setCurrentEntryByIndex(1);
			this.oToolbar._fnNavigationHandler();

			assert.strictEqual(
				this.oToolbarControlsModel.getProperty("/backButton/enabled"),
				true,
				"then the back button is enabled so the user can return to the list report"
			);
		});

		QUnit.test("when cleanupNavigationTracking is called and RTA is not restarting, listener and persisted boundary are removed", function(assert) {
			this.oToolbar.setupNavigationTracking();
			const fnHandler = this.oToolbar._fnNavigationHandler;

			this.oToolbar.cleanupNavigationTracking();

			assert.ok(
				this.oMockNavigation.removeEventListener.calledWith("currententrychange", fnHandler),
				"then removeEventListener was called with the handler"
			);
			assert.strictEqual(this.oToolbar._fnNavigationHandler, null, "then the handler is cleared");
			assert.strictEqual(this.oToolbar._iStartingNavigationIndex, null, "then the starting index is cleared");
			assert.notOk(
				"sap.ui.rta.toolbar.navigationBoundary" in this.mSessionStore,
				"then the persisted boundary is removed from the session storage"
			);
		});

		QUnit.test("when cleanupNavigationTracking is called while RTA is about to restart, the persisted boundary is kept", function(assert) {
			// Simulate the discard-draft reload: ReloadManager set the layer-specific restart flag before
			// the reload. The toolbar is torn down but the boundary must survive to be restored on restart.
			this.oToolbar.setRtaInformation({ flexSettings: { layer: "CUSTOMER" } });
			this.mSessionStore["sap.ui.rta.restart.CUSTOMER"] = "true";
			this.oToolbar.setupNavigationTracking();

			this.oToolbar.cleanupNavigationTracking();

			assert.ok(
				"sap.ui.rta.toolbar.navigationBoundary" in this.mSessionStore,
				"then the persisted boundary is kept in the session storage across the reload"
			);
			assert.strictEqual(this.oToolbar._fnNavigationHandler, null, "then the handler is still cleared");
		});
	});

	QUnit.module("Navigation Tracking - without Navigation API", {
		beforeEach() {
			this.oOriginalNavigation = window.navigation;
			delete window.navigation;

			this.oToolbar = new Adaptation({
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			this.oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oToolbar.setModel(new JSONModel({}), "versions");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach() {
			this.oToolbar.destroy();
			window.navigation = this.oOriginalNavigation;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when setupNavigationTracking is called without Navigation API, no error is thrown", function(assert) {
			this.oToolbar.setupNavigationTracking();

			assert.strictEqual(this.oToolbar._oStartingNavigationEntry, undefined, "then no starting entry is stored");
			assert.strictEqual(this.oToolbar._fnNavigationHandler, undefined, "then no handler is stored");
		});

		QUnit.test("when cleanupNavigationTracking is called without Navigation API, no error is thrown", function(assert) {
			this.oToolbar.cleanupNavigationTracking();
			assert.ok(true, "cleanup completed without error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
