/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
], function(
	Opa5,
	opaTest
) {
	"use strict";


	const oModuleSettings = {
		beforeEach: function() {},
		afterEach: function() {}
	};

	QUnit.module("TwFb - Table Personalization", oModuleSettings);

	opaTest("twfb - start app and test personalization of table", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");

		const sTableID = "container-v4demo---books--booksTable";
		//???? first parameter is called oControl. Why not oTable or vTableIdentifier.....
		When.onTheMDCTable.iPersonalizeColumns(sTableID, ["Genre", "Sub Genre"]);
		When.onTheMDCTable.iResetThePersonalization(sTableID);
		//Then TODO no assertions available

		When.onTheMDCTable.iPersonalizeFilter(sTableID, [{key : "Language", values: ["DE"], inputControl: "container-v4demo---books--booksTable--filter--language_code"}]);

		When.onTheMDCTable.iPersonalizeSort(sTableID, [{key: "Price", descending: false}]); //ERROR failed because of custom stock slider (when at the end I call teardown....)
		// When.onTheMDCTable.iResetThePersonalization(sTableID);

		When.onTheMDCTable.iPressShowSelected(sTableID, true);

		Then.iTeardownMyAppFrame();
	});

	opaTest("twfb - start app and test hide description feature of personalization", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html?sap-ui-xx-p13n-hide-descriptions=true#");

		const sTableID = "container-v4demo---books--booksTable";
		//???? first parameter is called oControl. Why not oTable or vTableIdentifier.....
		When.onTheMDCTable.iPersonalizeColumns(sTableID, ["Genre", "Sub Genre"]);
		When.onTheMDCTable.iResetThePersonalization(sTableID);
		//Then TODO no assertions available

		When.onTheMDCTable.iPersonalizeFilter(sTableID, [{key : "Language", values: ["DE"], inputControl: "container-v4demo---books--booksTable--filter--language_code"}]);

		When.onTheMDCTable.iPersonalizeSort(sTableID, [{key: "Price", descending: false}]); //ERROR failed because of custom stock slider (when at the end I call teardown....)
		// When.onTheMDCTable.iResetThePersonalization(sTableID);

		When.onTheMDCTable.iSetShowSelectedFilters(sTableID, true);
		When.onTheMDCTable.iSetHideDescriptionsFilters(sTableID, true);

		When.onTheMDCTable.iSetShowSelectedFilters(sTableID, false);
		When.onTheMDCTable.iSetHideDescriptionsFilters(sTableID, false);

		Then.iTeardownMyAppFrame();
	});

	QUnit.module("TwFb - Chart Personalization", oModuleSettings);

	opaTest("twfb - start app and test chart/personalization", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");

		const sChartID = "container-v4demo---books--bookChart";

		Then.onTheMDCChart.iShouldSeeAChart();// Why does it not get the chartId?
		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartID, "column"); // key of chart not the name

		When.onTheMDCChart.iPersonalizeChart(sChartID, [{
			key: "Author ID",
			role: "Category",
			kind: "Dimension"
		},
		{
			key: "Language",
			role: "Category",
			kind: "Dimension"
		},
		{
			key: "Words (average)",
			kind: "Measure"
		}
		]);
		Then.onTheMDCChart.iShouldSeeTheDrillStack(["author_ID", "language_code"], sChartID); // why is sChartID the second param?
		When.onTheMDCTable.iResetThePersonalization(sChartID);

		//TODO does not exist for Chart
		// When.onTheMDCChart.iPersonalizeFilter(sChartID, [{key : "language_code", operator: "EQ", values: ["DE"], inputControl: "__component0---books--booksTable--filter--language_code"}]);

		When.onTheMDCChart.iPersonalizeSort(sChartID, [{key: "Language", descending: true}]); // This is not a key it is the label!
		When.onTheMDCTable.iResetThePersonalization(sChartID);

		// zoom is disabled for most chart types
		//When.onTheMDCChart.iClickOnZoomIn(sChartID);

		When.onTheMDCChart.iClickOnTheLegendToggleButton(sChartID);
		Then.onTheMDCChart.iShouldSeeNoLegend(sChartID);
		When.onTheMDCChart.iClickOnTheLegendToggleButton(sChartID);
		Then.onTheMDCChart.iShouldSeeALegend(sChartID);

		//change ChartType
		When.onTheMDCChart.iSelectAChartType(sChartID, "Pie Chart");
		// same as:
		//    When.onTheMDCChart.iClickOnTheChartTypeButton(sChartID);
		//    When.onTheMDCChart.iSelectChartTypeInPopover("Pie Chart");
		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartID, "pie"); // chart type key and NOT the ui label!!!!

		Then.iTeardownMyAppFrame();
	});

	opaTest("twfb - start app and test zoom buttons in overflow behavior", function(Given, When, Then) {
		// Restrict width to ensure that the zoom buttons are in the overflow area.
		Given.iStartMyAppInAFrame({source: "test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html", width: "500px", height: "1000px"});

		const sChartId = "container-v4demo---books--bookChart";

		// Change Chart type to stacked bar chart, which has zoom buttons enabled.
		When.onTheMDCChart.iOpenTheOverflowPopover(sChartId);
		Then.onTheMDCChart.iShouldSeeAnOverflowPopover(sChartId);
		When.onTheMDCChart.iSelectAChartType(sChartId, "Stacked Bar Chart");
		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartId, "stacked_bar");
		// Selecting chart type closes overflow popover

		// Click zoom in button and check that overflow popover stays open.
		When.onTheMDCChart.iOpenTheOverflowPopover(sChartId);
		Then.onTheMDCChart.iShouldSeeAnOverflowPopover(sChartId);
		When.onTheMDCChart.iClickOnZoomIn(sChartId);
		Then.onTheMDCChart.iShouldSeeAnOverflowPopover(sChartId);

		// Click zoom out button and check that overflow popover stays open.
		When.onTheMDCChart.iClickOnZoomOut(sChartId);
		Then.onTheMDCChart.iShouldSeeAnOverflowPopover(sChartId);

		Then.iTeardownMyAppFrame();
	});
});
