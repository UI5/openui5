sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion"
], function(Opa5, Arrangement, Action, Assertion) {
	"use strict";

	return function(opaTestOrSkip) {

		Opa5.extendConfig({
			arrangements: new Arrangement(),
			actions: new Action(),
			assertions: new Assertion(),
			viewNamespace: "view.",
			autoWait: true
		});

		const sTableID = "IDTableOfInternalSampleApp_01";
		const sFilterBarID = "IDFilterBar";

		opaTestOrSkip("Start the app with DynamicProperties view", function(Given, When, Then) {
			Given.iStartMyAppInAFrame({
				source: "test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?view=DynamicProperties",
				autoWait: true
			});
			When.iLookAtTheScreen();
			Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		});

		opaTestOrSkip("Table p13n dialog shows updated label and does not show inactive property", function(Given, When, Then) {
			When.iApplyPropertyAttributeChanges(sTableID, {name: {label: "New Name"}});

			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
			Then.thePersonalizationDialogOpens();
			Then.iShouldSeeP13nItem("New Name", 0, true);
			Then.iShouldNotSeeP13nItem("Breakout Year");

			When.iPressDialogOk();
		});

		opaTestOrSkip("Activated property is added to Table p13n dialog", function(Given, When, Then) {
			When.iApplyPropertyAttributeChanges(sTableID, {breakupYear: {isActive: true}});

			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
			Then.thePersonalizationDialogOpens();
			Then.iShouldSeeP13nItem("Breakout Year", 5, false);

			When.iPressDialogOk();
		});

		opaTestOrSkip("Deactivated property is removed from Table p13n dialog", function(Given, When, Then) {
			When.iApplyPropertyAttributeChanges(sTableID, {foundingYear: {isActive: false}});

			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
			Then.thePersonalizationDialogOpens();
			Then.iShouldNotSeeP13nItem("Founding Year");

			When.iPressDialogOk();
		});

		opaTestOrSkip("Reactivated property appears in Table p13n dialog", function(Given, When, Then) {
			When.iApplyPropertyAttributeChanges(sTableID, {foundingYear: {isActive: true}});

			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
			Then.thePersonalizationDialogOpens();
			Then.iShouldSeeP13nItem("Founding Year", 1, true);

			When.iPressDialogOk();
		});

		opaTestOrSkip("FilterBar adapt filters dialog shows updated label and does not show inactive property", function(Given, When, Then) {
			When.iApplyPropertyAttributeChanges(sFilterBarID, {name: {label: "New FB Name"}});

			When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
			Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.adaptFilter);
			Then.iShouldSeeSelectedListFilterItems([
				{p13nItem: "New FB Name", selected: true},
				{p13nItem: "Founding Year", selected: true}
			]);
			Then.iShouldNotSeeP13nItem("Breakout Year");

			When.iPressDialogOk();
		});

		opaTestOrSkip("Activated property is added to FilterBar p13n dialog", function(Given, When, Then) {
			When.iApplyPropertyAttributeChanges(sFilterBarID, {breakupYear: {isActive: true}});

			When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
			Then.thePersonalizationDialogOpens();
			Then.iShouldSeeListFilterItem("Breakout Year");

			When.iPressDialogOk();
		});

		opaTestOrSkip("Deactivated property is removed from FilterBar adapt filters dialog", function(Given, When, Then) {
			When.iApplyPropertyAttributeChanges(sFilterBarID, {foundingYear: {isActive: false}});

			When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
			Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.adaptFilter);
			Then.iShouldSeeSelectedListFilterItems([
				{p13nItem: "New FB Name", selected: true},
				{p13nItem: "Founding Year", selected: false}
			]);
			Then.iShouldNotSeeListFilterItem("Founding Year");

			When.iPressDialogOk();
		});

		opaTestOrSkip("Reactivated property appears in FilterBar adapt filters dialog", function(Given, When, Then) {
			When.iApplyPropertyAttributeChanges(sFilterBarID, {foundingYear: {isActive: true}});

			When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
			Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.adaptFilter);
			Then.iShouldSeeSelectedListFilterItems([
				{p13nItem: "New FB Name", selected: true},
				{p13nItem: "Founding Year", selected: true}
			]);

			When.iPressDialogOk();

			Given.enableAndDeleteLrepLocalStorage();
			Then.iTeardownMyAppFrame();
		});
	};
});
