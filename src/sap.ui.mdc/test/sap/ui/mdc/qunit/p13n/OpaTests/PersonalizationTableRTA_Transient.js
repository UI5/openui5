sap.ui.define([
	'sap/ui/test/Opa5',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device',
	'test-resources/sap/ui/rta/integration/pages/Adaptation',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary'
], function(Opa5, Arrangement, TestUtil, Action, Assertion, Device, TestLibrary) {
	'use strict';

	return function(opaTestOrSkip) {
		if (window.blanket) {
			//window.blanket.options("sap-ui-cover-only", "sap/ui/mdc");
			window.blanket.options("sap-ui-cover-never", "sap/viz");
		}

		Opa5.extendConfig({
			arrangements: new Arrangement(),
			actions: new Action(),
			assertions: new Assertion(),
			viewNamespace: "view.",
			autoWait: true
		});

		const aTableItems = [
			{p13nItem: "Name", selected: true},
			{p13nItem: "Founding Year", selected: true},
			{p13nItem: "Changed By", selected: true},
			{p13nItem: "Created On", selected: true},
			{p13nItem: "artistUUID", selected: false},
			{p13nItem: "Breakout Year", selected: false},
			{p13nItem: "Changed On", selected: false},
			{p13nItem: "City of Origin", selected: false},
			{p13nItem: "Country", selected: false},
			{p13nItem: "Created (Complex)", selected: false},
			{p13nItem: "Created By", selected: false},
			{p13nItem: "regionOfOrigin_code", selected: false}
		];

		// ----------------------------------------------------------------
		// initialize application
		// ----------------------------------------------------------------
		opaTestOrSkip("When I start the 'appUnderTestTable' app, the table should appear and contain some columns", function(Given, When, Then) {
			//insert application
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
				autoWait: true
			});
			When.iLookAtTheScreen();

			//check icons
			Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

			//check initially visible columns
			Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
				"name", "foundingYear", "modifiedBy", "createdAt"
			]);

			Then.theVariantManagementIsDirty(false);
		});

		// ----------------------------------------------------------------
		// start and enable RTA
		// ----------------------------------------------------------------
		opaTestOrSkip("When I enable key user adaptation, the App should change into 'RTA' mode", function(Given, When, Then) {
			When.iPressButtonWithText("Start RTA");
			Then.onPageWithRTA.iShouldSeeTheToolbar();
		});

		// ----------------------------------------------------------------
		// open RTA settings
		// ----------------------------------------------------------------
		opaTestOrSkip("When I press on the Table, the settings context menu opens", function(Given, When, Then) {
			When.iClickOnOverlayForControl("sap.ui.mdc.Table");
			Then.onPageWithRTA.iShouldSeetheContextMenu();
			Then.onPageWithRTA.iShouldSeetheNumberOfContextMenuActions(3);
			When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_SETTINGS");

			Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.settings);

			Then.iShouldSeeP13nItems(aTableItems);
		});

		// ----------------------------------------------------------------
		// Move a Column to the top
		// ----------------------------------------------------------------
		opaTestOrSkip("When I select the 'Country' column and move it to the top, the table should be changed", function(Given, When, Then) {

			When.iSelectColumn("Country", undefined, aTableItems);

			When.iClickOnTableItem("Country").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);

			Then.iShouldSeeP13nItem("Country", 0);
			Then.iShouldSeeP13nItem("Name", 1);
			Then.iShouldSeeP13nItem("Founding Year", 2);
			Then.iShouldSeeP13nItem("Changed By", 3);
			Then.iShouldSeeP13nItem("Created On", 4);
		});

		// ----------------------------------------------------------------
		// close modal dialog with 'OK' and check reorderd columns
		// ----------------------------------------------------------------
		opaTestOrSkip("When I close the 'Add/Remove Columns' button, the table has been changed and the variant is dirty", function(Given, When, Then) {

			//close dialog
			Given.closeModalDialog("OK");

			//check initially visible columns
			Then.iShouldSeeVisibleColumnsInOrderInTable("sap.ui.mdc.Table", "sap.ui.mdc.table.Column", [
				"countryOfOrigin_code", "name", "foundingYear", "modifiedBy", "createdAt"
			]);

			Then.theVariantManagementIsDirty(true);
		});


		opaTestOrSkip("Quit RTA and check that changes are persisted correctly", function(Given, When, Then) {
			//Quit RTA
			When.onPageWithRTA.iExitRtaMode();

			//tear down app
			Then.iTeardownMyAppFrame();

			//Restart app
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
				autoWait: true
			});
			When.iLookAtTheScreen();

			//check that changes are persisted
			Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
				"name", "foundingYear", "modifiedBy", "createdAt", "countryOfOrigin_code"
			]);

			//tear down app
			When.onPageWithRTA.enableAndDeleteLrepLocalStorageAfterRta();
			Then.iTeardownMyAppFrame();
		});
	};

});
