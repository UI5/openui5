/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.LinkTooltip", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Link';

	it('should load test page with enhanced tooltip enabled', function() {
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('should show enhanced tooltip on hover', function() {
		var oLink = element(by.id('link_tooltip_baseline'));
		browser.actions().mouseMove(oLink).perform();
		expect(takeScreenshot()).toLookAs('link_tooltip_baseline_hover');
	});

});
