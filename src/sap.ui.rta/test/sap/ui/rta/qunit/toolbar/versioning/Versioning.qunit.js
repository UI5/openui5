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

		QUnit.test("all content columns in the version list have a header title", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oTextResources = this.oToolbar.getTextResources();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const aColumns = oVersionList.getColumns();

			const aExpectedTitles = [
				oTextResources.getText("TIT_VERSION_COLUMN"),
				oTextResources.getText("TIT_VERSION_STATE"),
				oTextResources.getText("TIT_CHANGEVISUALIZATION_DATE"),
				oTextResources.getText("TIT_CHANGEVISUALIZATION_USER")
			];

			// The date column header is an HBox (Text + sort Button); all others are plain Text.
			// This helper resolves either case to the visible label text.
			function getHeaderText(oHeader) {
				if (typeof oHeader.getText === "function") {
					return oHeader.getText();
				}
				const oText = oHeader.getItems?.().find((oItem) => typeof oItem.getText === "function");
				return oText?.getText() ?? "";
			}

			aExpectedTitles.forEach((sExpectedTitle, iIndex) => {
				const oHeader = aColumns[iIndex].getHeader();
				assert.ok(oHeader, `column ${iIndex} has a header control`);
				assert.strictEqual(getHeaderText(oHeader), sExpectedTitle, `column ${iIndex} shows the expected title`);
				assert.ok(getHeaderText(oHeader).length > 0, `column ${iIndex} title is not empty`);
			});

			// the trailing action column (switch-to-version button) has no header by design
			assert.notOk(aColumns[4].getHeader(), "the trailing action column has no header title (by design)");
		});

		QUnit.test("the search field has a stable id and starts collapsed", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");
			const oContainer = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchContainer");
			assert.ok(oSearchField, "the search field exists");
			assert.ok(oSearchField.getId().endsWith("manageVersionsSearchField"), "the search field has a stable id");
			assert.notOk(
				oContainer.hasStyleClass("sapUiRtaVersionsSearchExpanded"),
				"the search container starts collapsed"
			);
		});

		QUnit.test("toggling the search button expands and collapses the search field", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oContainer = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchContainer");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");
			const oToggle = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchToggle");

			oToggle.firePress();
			assert.ok(oContainer.hasStyleClass("sapUiRtaVersionsSearchExpanded"), "the container is expanded after the first press");

			oSearchField.setValue("something");
			oToggle.firePress();
			assert.notOk(oContainer.hasStyleClass("sapUiRtaVersionsSearchExpanded"), "the container is collapsed after the second press");
			assert.strictEqual(oSearchField.getValue(), "", "the search value is cleared on collapse");
		});

		QUnit.test("the search field is not keyboard-focusable when collapsed and is focusable when expanded", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oContainer = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchContainer");
			const oToggle = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchToggle");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");
			// Retrieve the underlying <input> that receives keyboard focus.
			const oInnerInput = oSearchField.getDomRef("F");

			// Collapsed state: visibility:hidden must be applied via CSS so the browser
			// removes the element from the tab order. The computed style is the authoritative
			// source — checking the CSS class alone would not catch a broken stylesheet.
			assert.strictEqual(
				window.getComputedStyle(oInnerInput).visibility,
				"hidden",
				"the search field input is visibility:hidden when collapsed"
			);

			// Expanded state: the CSS class switches visibility to 'visible'.
			oToggle.firePress();
			assert.ok(oContainer.hasStyleClass("sapUiRtaVersionsSearchExpanded"), "the container is now expanded");
			assert.strictEqual(
				window.getComputedStyle(oInnerInput).visibility,
				"visible",
				"the search field input is visibility:visible when expanded"
			);
		});

		QUnit.test("searching filters the version list by title", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");

			oSearchField.setValue(VERSION_TITLE);
			oSearchField.fireLiveChange({ newValue: VERSION_TITLE });
			await nextUIUpdate();

			const aItems = oVersionList.getItems();
			assert.strictEqual(aItems.length, 1, "only the matching version is shown");
			assert.strictEqual(aItems[0].getCells()[0].getText(), VERSION_TITLE, "the matching version title is shown");
		});

		QUnit.test("searching filters the version list by user (activatedBy)", async function(assert) {
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: "1",
				title: "First",
				type: Version.Type.Active,
				isPublished: false,
				activatedBy: "alice"
			}, {
				version: "2",
				title: "Second",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedBy: "bob"
			}]);
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");

			oSearchField.fireSearch({ query: "alice" });
			await nextUIUpdate();

			const aItems = oVersionList.getItems();
			assert.strictEqual(aItems.length, 1, "only the version activated by the searched user is shown");
			assert.strictEqual(aItems[0].getCells()[3].getText(), "alice", "the matching user is shown");
		});

		QUnit.test("searching filters the version list by a partial title", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");

			// a substring taken from the middle of the title must still match
			oSearchField.fireSearch({ query: "special_chars" });
			await nextUIUpdate();

			const aItems = oVersionList.getItems();
			assert.strictEqual(aItems.length, 1, "only the version whose title contains the substring is shown");
			assert.strictEqual(aItems[0].getCells()[0].getText(), VERSION_TITLE, "the matching version title is shown");
		});

		QUnit.test("searching filters the version list by a partial user (activatedBy)", async function(assert) {
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: "1",
				title: "First",
				type: Version.Type.Active,
				isPublished: false,
				activatedBy: "alice"
			}, {
				version: "2",
				title: "Second",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedBy: "bob"
			}]);
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");

			// "lic" is a substring of "alice" but not of "bob"
			oSearchField.fireSearch({ query: "lic" });
			await nextUIUpdate();

			const aItems = oVersionList.getItems();
			assert.strictEqual(aItems.length, 1, "only the version whose user contains the substring is shown");
			assert.strictEqual(aItems[0].getCells()[3].getText(), "alice", "the matching user is shown");
		});

		QUnit.test("searching is case-insensitive across title, user", async function(assert) {
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: "1",
				title: "MixedCaseTitle",
				type: Version.Type.Active,
				isPublished: false,
				activatedBy: "Alice"
			}, {
				version: "2",
				title: "Second",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedBy: "bob"
			}]);
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");

			// a partial title typed in a different case must still match
			oSearchField.fireSearch({ query: "mixedcase" });
			await nextUIUpdate();
			assert.strictEqual(oVersionList.getItems().length, 1, "a lower-case query matches a mixed-case title");

			// a partial user typed in a different case must still match
			oSearchField.fireSearch({ query: "ALI" });
			await nextUIUpdate();
			assert.strictEqual(oVersionList.getItems().length, 1, "an upper-case query matches a mixed-case user");
		});

		QUnit.test("clearing the search restores the full version list", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");
			const iInitialCount = oVersionList.getItems().length;

			oSearchField.fireLiveChange({ newValue: VERSION_TITLE });
			await nextUIUpdate();
			assert.ok(oVersionList.getItems().length < iInitialCount, "the list is filtered");

			oSearchField.fireLiveChange({ newValue: "" });
			await nextUIUpdate();
			assert.strictEqual(oVersionList.getItems().length, iInitialCount, "the full list is restored when the query is empty");
		});

		QUnit.test("a search event without a query or newValue parameter is treated as an empty query", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");
			const iInitialCount = oVersionList.getItems().length;

			// first filter the list so we can observe the fallback clearing it again
			oSearchField.fireSearch({ query: VERSION_TITLE });
			await nextUIUpdate();
			assert.ok(oVersionList.getItems().length < iInitialCount, "the list is filtered");

			// an event carrying neither query nor newValue must fall back to an empty query
			oSearchField.fireSearch({});
			await nextUIUpdate();
			assert.strictEqual(oVersionList.getItems().length, iInitialCount, "the full list is restored for a parameterless event");
		});

		QUnit.test("searching does not fail when the versions model has no versions", async function(assert) {
			await this.oToolbar.showManageVersions();
			this.oToolbar.getModel("versions").setProperty("/versions", null);
			await nextUIUpdate();
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");
			const oSearchField = this.oToolbar.getControl("manageVersionsDialog--manageVersionsSearchField");

			oSearchField.fireSearch({ query: "anything" });
			await nextUIUpdate();

			assert.strictEqual(oVersionList.getItems().length, 0, "no versions are shown and no error is thrown");
		});

		QUnit.test("clicking the date sort button sorts the version list ascending on first click", async function(assert) {
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: "1",
				title: "Oldest",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedAt: "2022-01-01 10:00:00.000Z"
			}, {
				version: "2",
				title: "Newest",
				type: Version.Type.Active,
				isPublished: false,
				activatedAt: "2022-06-01 10:00:00.000Z"
			}, {
				version: "3",
				title: "Middle",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedAt: "2022-03-01 10:00:00.000Z"
			}]);
			await this.oToolbar.showManageVersions();
			const oSortButton = this.oToolbar.getControl("manageVersionsDialog--versionListDateSortButton");
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");

			assert.strictEqual(oSortButton.getIcon(), "sap-icon://sort-descending",
				"the sort button defaults to the descending icon, matching the natural order");

			oSortButton.firePress();
			await nextUIUpdate();

			const aTitles = oVersionList.getItems().map((oItem) => oItem.getCells()[0].getText());
			assert.deepEqual(aTitles, ["Oldest", "Middle", "Newest"], "versions are sorted ascending by date");
			assert.strictEqual(oSortButton.getIcon(), "sap-icon://sort-ascending", "the sort button shows the ascending icon");
		});

		QUnit.test("clicking the date sort button a second time sorts descending", async function(assert) {
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: "1",
				title: "Oldest",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedAt: "2022-01-01 10:00:00.000Z"
			}, {
				version: "2",
				title: "Newest",
				type: Version.Type.Active,
				isPublished: false,
				activatedAt: "2022-06-01 10:00:00.000Z"
			}, {
				version: "3",
				title: "Middle",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedAt: "2022-03-01 10:00:00.000Z"
			}]);
			await this.oToolbar.showManageVersions();
			const oSortButton = this.oToolbar.getControl("manageVersionsDialog--versionListDateSortButton");
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");

			oSortButton.firePress();
			await nextUIUpdate();
			oSortButton.firePress();
			await nextUIUpdate();

			const aTitles = oVersionList.getItems().map((oItem) => oItem.getCells()[0].getText());
			assert.deepEqual(aTitles, ["Newest", "Middle", "Oldest"], "versions are sorted descending by date");
			assert.strictEqual(oSortButton.getIcon(), "sap-icon://sort-descending", "the sort button shows the descending icon");
		});

		QUnit.test("the draft stays pinned as the newest entry regardless of sort direction", async function(assert) {
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: "1",
				title: "Oldest",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedAt: "2022-01-01 10:00:00.000Z"
			}, {
				version: Version.Number.Draft,
				title: "Draft",
				type: Version.Type.Draft,
				isPublished: false
			}, {
				version: "2",
				title: "Newest",
				type: Version.Type.Active,
				isPublished: false,
				activatedAt: "2022-06-01 10:00:00.000Z"
			}]);
			await this.oToolbar.showManageVersions();
			const oSortButton = this.oToolbar.getControl("manageVersionsDialog--versionListDateSortButton");
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");

			// first click → ascending: draft (no date) sorts to the bottom as the newest entry
			oSortButton.firePress();
			await nextUIUpdate();
			let aTitles = oVersionList.getItems().map((oItem) => oItem.getCells()[0].getText());
			assert.deepEqual(aTitles, ["Oldest", "Newest", "Draft"],
				"ascending: dated versions sort oldest-first and the draft is pinned to the bottom");

			// second click → descending: draft sorts back to the top as the newest entry
			oSortButton.firePress();
			await nextUIUpdate();
			aTitles = oVersionList.getItems().map((oItem) => oItem.getCells()[0].getText());
			assert.deepEqual(aTitles, ["Draft", "Newest", "Oldest"],
				"descending: the draft is pinned to the top and dated versions sort newest-first");
		});

		QUnit.test("date sort uses importedAt over activatedAt, matching the date column display", async function(assert) {
			// version "1" has importedAt so it is displayed and sorted by that date even
			// though activatedAt would give a different order
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: "1",
				title: "ImportedEarly",
				type: Version.Type.Active,
				isPublished: true,
				activatedAt: "2022-12-31 10:00:00.000Z",
				importedAt: "2022-01-01 10:00:00.000"
			}, {
				version: "2",
				title: "ActivatedLater",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedAt: "2022-06-01 10:00:00.000Z"
			}]);
			await this.oToolbar.showManageVersions();
			const oSortButton = this.oToolbar.getControl("manageVersionsDialog--versionListDateSortButton");
			const oVersionList = this.oToolbar.getControl("manageVersionsDialog--versionList");

			oSortButton.firePress();
			await nextUIUpdate();

			const aTitles = oVersionList.getItems().map((oItem) => oItem.getCells()[0].getText());
			assert.deepEqual(aTitles, ["ImportedEarly", "ActivatedLater"],
				"importedAt takes priority: the early-imported version sorts before the later-activated one");
		});

		QUnit.test("the date sort icon is reset when the dialog is closed", async function(assert) {
			await this.oToolbar.showManageVersions();
			const oDialog = this.oToolbar.getControl("manageVersionsDialog--manageVersionsDialog");
			const oSortButton = this.oToolbar.getControl("manageVersionsDialog--versionListDateSortButton");

			oSortButton.firePress();
			await nextUIUpdate();
			assert.strictEqual(oSortButton.getIcon(), "sap-icon://sort-ascending", "sort icon is ascending after pressing");

			// afterClose fires asynchronously (after the close animation); await it directly
			const oAfterClosePromise = new Promise((resolve) => { oDialog.attachEventOnce("afterClose", resolve); });
			oDialog.close();
			await oAfterClosePromise;
			assert.strictEqual(oSortButton.getIcon(), "sap-icon://sort-descending", "sort icon is reset to descending after the dialog closes");
		});

		QUnit.test("closing the dialog restores the original version order in the model", async function(assert) {
			const aOriginalVersions = [{
				version: "1",
				title: "Oldest",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedAt: "2022-01-01 10:00:00.000Z"
			}, {
				version: "2",
				title: "Newest",
				type: Version.Type.Active,
				isPublished: false,
				activatedAt: "2022-06-01 10:00:00.000Z"
			}, {
				version: "3",
				title: "Middle",
				type: Version.Type.Inactive,
				isPublished: false,
				activatedAt: "2022-03-01 10:00:00.000Z"
			}];
			this.oToolbar.getModel("versions").setProperty("/versions", aOriginalVersions);
			await this.oToolbar.showManageVersions();
			const oDialog = this.oToolbar.getControl("manageVersionsDialog--manageVersionsDialog");
			const oSortButton = this.oToolbar.getControl("manageVersionsDialog--versionListDateSortButton");

			// sort twice (ascending then descending) so the model is not in its original order
			oSortButton.firePress();
			await nextUIUpdate();
			oSortButton.firePress();
			await nextUIUpdate();

			const oAfterClosePromise = new Promise((resolve) => { oDialog.attachEventOnce("afterClose", resolve); });
			oDialog.close();
			await oAfterClosePromise;

			const aTitlesAfterClose = this.oToolbar.getModel("versions").getProperty("/versions").map((oVersion) => oVersion.title);
			assert.deepEqual(aTitlesAfterClose, ["Oldest", "Newest", "Middle"],
				"the model array is back in its original order after the dialog closes");
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
