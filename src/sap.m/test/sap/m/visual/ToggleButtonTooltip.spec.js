/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.ToggleButtonTooltip", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ToggleButton';

	it("ToggleButton with tooltip shows tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("toggleTextNoShortcut"))).perform();
		expect(takeScreenshot()).toLookAs("text_tooltip_on_hover");
	});

	it("ToggleButton with tooltip and shortcut shows combined tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("toggleTextShortcut"))).perform();
		expect(takeScreenshot()).toLookAs("text_tooltip_shortcut_on_hover");
	});

	it("ToggleButton shows tooltip on keyboard focus", function() {
		browser.driver.executeScript(
			"document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true}));" +
			"document.getElementById('toggleTextShortcut').focus({focusVisible: true});"
		);
		expect(takeScreenshot()).toLookAs("text_tooltip_on_focus");
	});

});
