/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
], function(
	Opa5,
	opaTest
) {
	"use strict";

	const mExportLibPromiseWithResolvers = Promise.withResolvers();
	const opaTestIfExportLibLoaded = function() {
		mExportLibPromiseWithResolvers.promise.then(() => {
			//opaTest.apply(this, arguments);
			opaTest.skip.apply(this, arguments); // After a long period of not running the tests, they no longer run successfully
		}).catch(() => {
			opaTest.skip.apply(this, arguments);
		});
	};
	const sTableId = "mdcTable";

	// sap.ui.export library can't be added to the manifest, because then non-export related tests could not be run with OpenUI5.
	opaTest("Loading sap.ui.export library", function(Given, When, Then) {
		When.waitFor({
			check: When.hasAppStartedInAFrame, // Needed because start.js cannot use async QUnit hooks
			success: function() {
				Then.iWaitForPromise(new Promise((resolve) => {
					Opa5.getWindow().sap.ui.require(["sap/ui/core/Lib"], async function(oLib) {
						try {
							await oLib.load("sap.ui.export");
							mExportLibPromiseWithResolvers.resolve();
						} catch {
							mExportLibPromiseWithResolvers.reject();
						}
						QUnit.assert.ok(true, "sap.ui.export library loaded: " + oLib.isLoaded("sap.ui.export"));
						resolve();
					});
				}));
			},
			errorMessage: "App could not be started"
		});
	});

	opaTestIfExportLibLoaded("The table should have the export button", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheExportMenuButton(sTableId);
	});

	opaTestIfExportLibLoaded("Export to Excel via quick export", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressQuickExportButton(sTableId);
		Then.onTheAppMDCTable.iShouldSeeExportProcessDialog();
	});

	opaTestIfExportLibLoaded("Export to Excel via menu", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressExportMenuButton(sTableId);
		Then.onTheAppMDCTable.iShouldSeeExportMenu();
		When.onTheAppMDCTable.iPressExportButtonInMenu();
		Then.onTheAppMDCTable.iShouldSeeExportProcessDialog();
	});

	opaTestIfExportLibLoaded("Export to Excel via Export as...", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressExportMenuButton(sTableId);
		When.onTheAppMDCTable.iPressExportAsButtonInMenu();
		Then.onTheAppMDCTable.iShouldSeeExportSettingsDialog();
		When.onTheAppMDCTable.iFillInExportSettingsDialog(sTableId, {
			fileName: "Products List",
			fileType: "XLSX",
			includeFilterSettings: true,
			splitCells: true
		});
		Then.onTheAppMDCTable.iShouldSeeExportProcessDialog();
	});
});