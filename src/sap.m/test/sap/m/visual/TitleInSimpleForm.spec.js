/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.TitleInSimpleForm", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.m.Title";

	// initial loading - all three form layouts
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("overview");
	});

	it("should visualize Title in a Form with ColumnLayout", function () {
		expect(takeScreenshot(element(by.id("clForm")))).toLookAs("ColumnLayout");
	});

	it("should visualize Title in a Form with ResponsiveLayout", function () {
		expect(takeScreenshot(element(by.id("rlForm")))).toLookAs("ResponsiveLayout");
	});

	it("should visualize Title in a Form with ResponsiveGridLayout", function () {
		expect(takeScreenshot(element(by.id("rgForm")))).toLookAs("ResponsiveGridLayout");
	});
});
