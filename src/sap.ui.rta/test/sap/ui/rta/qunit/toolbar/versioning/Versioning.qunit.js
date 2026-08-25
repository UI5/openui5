/* global QUnit */

sap.ui.define([
	"../../RtaQunitUtils",
	"sap/m/Dialog",
	"sap/m/library",
	"sap/ui/core/Control",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/Layer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	Dialog,
	mLibrary,
	Control,
	Fragment,
	Lib,
	coreLibrary,
	MessageType,
	Version,
	Layer,
	JSONModel,
	nextUIUpdate,
	Adaptation,
	Utils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const DRAFT_ACCENT_COLOR = "sapUiRtaDraftVersionAccent";
	const ACTIVE_ACCENT_COLOR = "sapUiRtaActiveVersionAccent";
	const VERSION_TITLE = "Title_with_special_chars &<>\"'";
	const { ValueState } = coreLibrary;
	const { ButtonType } = mLibrary;

	async function initializeToolbar() {
		const aVersions = [{
			version: Version.Number.Draft,
			type: Version.Type.Draft,
			isPublished: false
		}, {
			version: "1",
			title: VERSION_TITLE,
			type: Version.Type.Active,
			isPublished: true,
			importedAt: "2022-05-09 15:00:00.000"
		}, {
			version: "2",
			type: Version.Type.Inactive,
			isPublished: false,
			activatedAt: "2022-05-10 16:00:00.000Z"
		}];
		const oVersionsModel = new JSONModel({
			versioningEnabled: true,
			versions: aVersions,
			draftAvailable: true,
			displayedVersion: Version.Number.Draft,
			publishVersionVisible: false,
			publishVersionEnabled: false
		});
		const oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();

		const oToolbar = new Adaptation({
			textResources: Lib.getResourceBundleFor("sap.ui.rta"),
			rtaInformation: {
				flexSettings: {
					layer: Layer.CUSTOMER
				},
				rootControl: new Control()
			}
		});
		oToolbar.setModel(oVersionsModel, "versions");
		oToolbar.setModel(oToolbarControlsModel, "controls");

		oToolbar.animation = false;
		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oToolbar;
	}

	QUnit.module("Manage Versions", {
		async beforeEach() {
			this.oToolbar = await initializeToolbar();
			await this.oToolbar.onFragmentLoaded();
			await this.oToolbar.show();
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the dialog is opened twice the fragment is only loaded once", async function(assert) {
			const oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			await this.oToolbar.showManageVersions();
			this.oToolbar.getControl("manageVersionsDialog--manageVersionsDialog").close();
			await this.oToolbar.showManageVersions();
			assert.strictEqual(oFragmentLoadSpy.callCount, 1, "the fragment was only loaded once");
			const oDialog = this.oToolbar.getControl("manageVersionsDialog--manageVersionsDialog");
			assert.strictEqual(oDialog.isOpen(), true, "the dialog is open again");
		});

		QUnit.test("the version list is configured to grow to avoid rendering all versions at once", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			assert.strictEqual(oVersionList.getGrowing(), true, "growing is enabled");
			assert.strictEqual(oVersionList.getGrowingThreshold(), 20, "the growing threshold is 20");
			assert.strictEqual(oVersionList.getGrowingScrollToLoad(), true, "more versions are loaded on scroll");
		});

		QUnit.test("when a version is selected the switchVersion event is fired", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oDialog = this.oToolbar.getControl("manageVersionsDialog--manageVersionsDialog");
			const oSwitchVersionPromise = new Promise((resolve) => {
				this.oToolbar.attachEventOnce("switchVersion", (oEvent) => {
					// the dialog must already be closed when the switch (and the following soft reload) is triggered,
					// otherwise the modal block layer stays in the DOM and covers the reloaded application
					assert.strictEqual(oDialog.isOpen(), false, "the dialog is closed before the switchVersion event fires");
					resolve(oEvent);
				});
			});
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			assert.strictEqual(oVersionList.getVisible(), true, "the list is visible");
			const oItem = oVersionList.getItems().find((oRow) => {
				return oRow.getBindingContext("versions").getProperty("version") === "1";
			});
			oItem.getCells()[4].firePress();
			const oEvent = await oSwitchVersionPromise;
			assert.strictEqual(oEvent.getParameter("version"), "1", "the event was fired with the correct version");
		});

		QUnit.test("Formatting: version title, state, icon, and state text for all version types", async function(assert) {
			await this.oToolbar.showManageVersions();
			await nextUIUpdate();
			const oTextResources = this.oToolbar.getTextResources();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const aItems = oVersionList.getItems();

			// Draft (index 0)
			assert.strictEqual(aItems[0].getCells()[0].getText(), oTextResources.getText("TIT_DRAFT"), "draft title is shown");
			assert.strictEqual(aItems[0].getCells()[1].getState(), ValueState.None, "draft has no state indicator");
			assert.strictEqual(aItems[0].getCells()[1].getIcon(), "", "draft has no icon");
			assert.strictEqual(aItems[0].getCells()[1].getText(), "", "draft has no state text");
			assert.ok(aItems[0].hasStyleClass(DRAFT_ACCENT_COLOR), "draft row has draft color style class");

			// Active + published (index 1, isPublished: true)
			assert.strictEqual(aItems[1].getCells()[0].getText(), VERSION_TITLE, "active version title is shown without XML encoding");
			assert.strictEqual(aItems[1].getCells()[1].getState(), ValueState.Information, "published version has Information state");
			assert.strictEqual(aItems[1].getCells()[1].getIcon(), "sap-icon://information", "published version has information icon");
			assert.strictEqual(
				aItems[1].getCells()[1].getText(),
				oTextResources.getText("TIT_VERSION_HISTORY_PUBLISHED"),
				"published version has published state text"
			);

			// Inactive (index 2)
			assert.strictEqual(aItems[2].getCells()[0].getText(), oTextResources.getText("TIT_VERSION_1"), "fallback title is shown"
			);
			assert.strictEqual(aItems[2].getCells()[1].getState(), ValueState.None, "inactive version has no state indicator");
			assert.strictEqual(aItems[2].getCells()[1].getIcon(), "", "inactive version has no icon");
			assert.strictEqual(aItems[2].getCells()[1].getText(), "", "inactive version has no state text");
			assert.notOk(aItems[1].hasStyleClass(DRAFT_ACCENT_COLOR), "active row has no draft color style class");
			assert.notOk(aItems[2].hasStyleClass(DRAFT_ACCENT_COLOR), "inactive row has no draft color style class");
		});

		QUnit.test("Formatting: active unpublished version shows Success state", async function(assert) {
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: "1",
				title: "My Version",
				type: Version.Type.Active,
				isPublished: false,
				activatedAt: "2022-05-09 15:00:00.000Z"
			}]);
			await this.oToolbar.showManageVersions();
			const oTextResources = this.oToolbar.getTextResources();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oStatus = oVersionList.getItems()[0].getCells()[1];
			assert.strictEqual(oStatus.getState(), ValueState.Success, "active unpublished version has Success state");
			assert.strictEqual(oStatus.getIcon(), "sap-icon://sys-enter-2", "active unpublished version has check icon");
			assert.strictEqual(
				oStatus.getText(),
				oTextResources.getText("LBL_ACTIVE"),
				"active unpublished version has active state text"
			);
		});

		QUnit.test("Formatting: timestamps are displayed in local time", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const aItems = oVersionList.getItems();
			// version "1" uses importedAt, version "2" uses activatedAt
			assert.ok(aItems[1].getCells()[2].getText().length > 0, "a timestamp is rendered for the imported version");
			assert.ok(aItems[2].getCells()[2].getText().length > 0, "a timestamp is rendered for the activated version");
			assert.strictEqual(aItems[0].getCells()[2].getText(), "", "no timestamp for draft");
		});

		QUnit.test("navigation button is disabled for the currently displayed version", async function(assert) {
			// displayedVersion is set to Version.Number.Draft in initializeToolbar
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const aItems = oVersionList.getItems();

			assert.strictEqual(aItems[0].getCells()[4].getEnabled(), false, "button is disabled for the displayed (draft) version");
			assert.strictEqual(aItems[1].getCells()[4].getEnabled(), true, "button is enabled for a non-displayed version");
			assert.strictEqual(aItems[2].getCells()[4].getEnabled(), true, "button is enabled for another non-displayed version");
		});

		QUnit.test("close button closes the dialog", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oDialog = this.oToolbar.getControl("manageVersionsDialog--manageVersionsDialog");
			assert.strictEqual(oDialog.isOpen(), true, "dialog is open");
			const oClosePromise = new Promise((resolve) => {
				oDialog.attachEventOnce("afterClose", resolve);
			});
			this.oToolbar.getControl("manageVersionsDialog--closeManageVersionsDialogButton").firePress();
			await oClosePromise;
			assert.strictEqual(oDialog.isOpen(), false, "dialog is closed after pressing the close button");
		});

		QUnit.test("original version row fires switchVersion with original version number", async function(assert) {
			const oSwitchVersionPromise = new Promise((resolve) => {
				this.oToolbar.attachEventOnce("switchVersion", resolve);
			});
			await this.oToolbar.showManageVersions();
			const oOriginalVersionButton = this.oToolbar.getControl("manageVersionsDialog--sapUiRta_originalVersionButton");
			assert.strictEqual(
				oOriginalVersionButton.getEnabled(), true,
				"the button is enabled when a non-original version is displayed"
			);
			oOriginalVersionButton.firePress();
			const oEvent = await oSwitchVersionPromise;
			assert.strictEqual(
				oEvent.getParameter("version"),
				Version.Number.Original,
				"the original version number is passed"
			);

			this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
			assert.strictEqual(
				oOriginalVersionButton.getEnabled(), false,
				"the button is disabled when the original version is already displayed"
			);
		});
	});

	QUnit.module("ActivateVersionDialog", {
		async beforeEach() {
			this.oToolbar = await initializeToolbar();
			await this.oToolbar.onFragmentLoaded();
			return this.oToolbar.show();
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the activate version button is pressed with a draft and afterwards pressed a second time", function(assert) {
			sandbox.stub(Utils, "getRtaStyleClassName").returns("myRtaCustomStyle");
			var oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			var oSetInputSpy;
			var oConfirmButtonEnabledSpy;
			var sExpectedTitle = this.oToolbar.getTextResources().getText("TIT_VERSION_TITLE_DIALOG");
			return this.oToolbar._openVersionTitleDialog().then(function() {
				var oDialog = this.oToolbar.getControl("activateVersionDialog--dialog");
				assert.equal(oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
				assert.strictEqual(oDialog.hasStyleClass("myRtaCustomStyle"), true, "the rta style class is set");
				// checking for the dialog instance wrapped into a promise

				var oVersionTitleInput = this.oToolbar.getControl("activateVersionDialog--versionTitleInput");
				oSetInputSpy = sandbox.spy(oVersionTitleInput, "setValue");
				var oConfirmButton = this.oToolbar.getControl("activateVersionDialog--confirmVersionTitleButton");
				oConfirmButtonEnabledSpy = sandbox.spy(oConfirmButton, "setEnabled");
				assert.equal(oDialog.getTitle(), sExpectedTitle, "and the title is 'Activate New Version'");
			}.bind(this))
			.then(this.oToolbar._openVersionTitleDialog.bind(this.oToolbar))
			.then(function() {
				assert.equal(oFragmentLoadSpy.callCount, 1, "the fragment not loaded again");
				assert.equal(oSetInputSpy.callCount, 1, "and Input Value was set");
				assert.equal(oSetInputSpy.getCall(0).args[0], "", "to an empty string");
				assert.equal(oConfirmButtonEnabledSpy.callCount, 1, "and the confirm button was set");
				assert.equal(oSetInputSpy.getCall(0).args[0], false, "to be disabled");
			});
		});

		QUnit.test("when the activate dialog is confirmed for a Draft", function(assert) {
			var done = assert.async();
			this.oToolbar._openVersionTitleDialog().then(function() {
				var oDialog = this.oToolbar.getControl("activateVersionDialog--dialog");
				var oCloseSpy = sandbox.spy(oDialog, "close");
				var oConfirmButton = this.oToolbar.getControl("activateVersionDialog--confirmVersionTitleButton");
				var oVersionTitleInput = this.oToolbar.getControl("activateVersionDialog--versionTitleInput");
				var oFireActivateSpy = sandbox.spy(this.oToolbar, "fireEvent");

				// no version title is set
				assert.strictEqual(oConfirmButton.getEnabled(), false, "initially the confirm button is disabled");
				oConfirmButton.firePress();
				assert.strictEqual(oCloseSpy.callCount, 0, "the dialog is not closed");
				assert.strictEqual(oFireActivateSpy.callCount, 0, "no events were fired");

				// set version title
				oVersionTitleInput.setValue("myVersionName");
				oVersionTitleInput.fireLiveChange({ value: "myVersionName" });
				assert.strictEqual(oConfirmButton.getEnabled(), true, "the confirm button is enabled");

				this.oToolbar.attachEventOnce("activate", function(oEvent) {
					assert.strictEqual(oEvent.getParameter("versionTitle"), "myVersionName", "the version title is part of the event");
					done();
				});
				oConfirmButton.firePress();
				assert.strictEqual(oCloseSpy.callCount, 1, "the dialog is closed");
				assert.strictEqual(oFireActivateSpy.callCount, 1, "the events were fired");
			}.bind(this));
		});

		QUnit.test("when the activate dialog is opened for an inactive version and cancel is pressed", function(assert) {
			return this.oToolbar._openVersionTitleDialog().then(function() {
				var oDialog = this.oToolbar.getControl("activateVersionDialog--dialog");
				var oCloseSpy = sandbox.spy(oDialog, "close");
				assert.strictEqual(
					oDialog.getTitle(),
					this.oToolbar.getTextResources().getText("TIT_VERSION_TITLE_DIALOG"),
					"the title is correct"
				);
				var oFireActivateSpy = sandbox.spy(this.oToolbar, "fireEvent");
				oDialog.getEndButton().firePress();
				assert.strictEqual(oFireActivateSpy.callCount, 0, "no events were fired");
				assert.strictEqual(oCloseSpy.callCount, 1, "the dialog is closed");
			}.bind(this));
		});
	});

	function checkFormatting(assert, mProperties) {
		const oVersionButton = this.oToolbar.getControl("versionButton");
		assert.strictEqual(oVersionButton.getText(), mProperties.versionText, "the text is set");
		assert.strictEqual(oVersionButton.getType(), mProperties.buttonType, "the button type is set");
		assert.strictEqual(
			oVersionButton.hasStyleClass(ACTIVE_ACCENT_COLOR), mProperties.bActiveStyleClass, "the active style class is set correctly"
		);
		assert.strictEqual(oVersionButton.hasStyleClass(DRAFT_ACCENT_COLOR), mProperties.bDraft, "the draft style class is set correctly");
		const oDiscardButton = this.oToolbar.getControl("discardDraft");
		assert.strictEqual(oDiscardButton.getVisible(), mProperties.bDraft, "the discard button is visible");

		const oPublishButton = this.oToolbar.getControl("publishVersion");
		assert.strictEqual(oPublishButton.getVisible(), mProperties.bPublish, "the publish button is visible");
		assert.strictEqual(oPublishButton.getEnabled(), !mProperties.bDraft && mProperties.bPublish, "the publish button is enabled");
	}

	QUnit.module("Formatting of direct Toolbar content", {
		async beforeEach() {
			this.oToolbar = await initializeToolbar();
			this.oTextResources = this.oToolbar.getTextResources();
			await this.oToolbar.onFragmentLoaded();
			return this.oToolbar.show();
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("for a draft", function(assert) {
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_DRAFT"),
				buttonType: ButtonType.Attention,
				bActiveStyleClass: false,
				bDraft: true,
				bPublish: false
			});
		});

		QUnit.test("for an active version with a title", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", "1");
			checkFormatting.call(this, assert, {
				versionText: VERSION_TITLE,
				buttonType: ButtonType.Transparent,
				bActiveStyleClass: true,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for an inactive version without a title", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", "2");
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_VERSION_1"),
				buttonType: ButtonType.Transparent,
				bActiveStyleClass: false,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for no versions", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
			this.oToolbar.getModel("versions").setProperty("/versions", []);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_ORIGINAL_APP"),
				buttonType: ButtonType.Transparent,
				bActiveStyleClass: true,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for original with only draft available", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: Version.Number.Draft,
				type: Version.Type.Draft,
				isPublished: false
			}]);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_ORIGINAL_APP"),
				buttonType: ButtonType.Transparent,
				bActiveStyleClass: true,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for original", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_ORIGINAL_APP"),
				buttonType: ButtonType.Transparent,
				bActiveStyleClass: false,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for activated version with publish", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", "2");
			this.oToolbar.getModel("versions").setProperty("/publishVersionVisible", true);
			this.oToolbar.getModel("versions").setProperty("/publishVersionEnabled", true);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_VERSION_1"),
				buttonType: ButtonType.Transparent,
				bActiveStyleClass: false,
				bDraft: false,
				bPublish: true
			});
		});

		QUnit.test("for an activated version that is already published, the publish button is disabled", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", "2");
			this.oToolbar.getModel("versions").setProperty("/publishVersionVisible", true);
			// after the displayed version has been published, publishVersionEnabled is false
			this.oToolbar.getModel("versions").setProperty("/publishVersionEnabled", false);
			const oPublishButton = this.oToolbar.getControl("publishVersion");
			assert.strictEqual(oPublishButton.getVisible(), true, "the publish button is visible");
			assert.strictEqual(oPublishButton.getEnabled(), false, "the publish button is disabled once the version is published");
		});

		QUnit.test("for draft with publish", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/publishVersionVisible", true);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_DRAFT"),
				buttonType: ButtonType.Attention,
				bActiveStyleClass: false,
				bDraft: true,
				bPublish: true
			});
		});

		QUnit.test("for original with publish visible, publish button is disabled", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
			this.oToolbar.getModel("versions").setProperty("/publishVersionVisible", true);
			const oPublishButton = this.oToolbar.getControl("publishVersion");
			assert.strictEqual(oPublishButton.getVisible(), true, "the publish button is visible");
			assert.strictEqual(oPublishButton.getEnabled(), false, "the publish button is disabled for the original version");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
