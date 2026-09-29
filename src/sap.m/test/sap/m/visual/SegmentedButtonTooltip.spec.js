/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.SegmentedButtonTooltip", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.SegmentedButton';

	it("Segment shows container tooltip and shortcut on hover", function() {
		browser.actions().mouseMove(element(by.id("segSharedItem0-button"))).perform();
		expect(takeScreenshot()).toLookAs("shared_tooltip_shortcut_on_hover");
	});

	it("Segment shows per-item tooltip and shortcut on hover", function() {
		browser.actions().mouseMove(element(by.id("segPerItemDay-button"))).perform();
		expect(takeScreenshot()).toLookAs("per_item_tooltip_shortcut_on_hover");
	});

	it("Segment shows tooltip on keyboard focus", function() {
		browser.driver.executeScript(
			"document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true}));" +
			"document.getElementById('segSharedItem0-button').focus({focusVisible: true});"
		);
		expect(takeScreenshot()).toLookAs("shared_tooltip_on_focus");
	});

});
