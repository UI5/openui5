/*global describe,it,takeScreenshot,expect,browser,element,by*/
describe("sap.m.InputDescriptionVisualTests", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Input';

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("1_initial");
	});

	it("should align the description inside sap.m.Table (Start and End)", function () {
		var oTable = element(by.id("descriptionAlignTable"));
		expect(takeScreenshot(oTable)).toLookAs("2_description_align_in_table");
	});
});