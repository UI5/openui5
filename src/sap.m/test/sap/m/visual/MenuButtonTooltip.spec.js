/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.MenuButtonTooltip", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.MenuButton';

	it("Regular mode button with tooltip shows tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("mbRegularTooltip"))).perform();
		expect(takeScreenshot()).toLookAs("regular_tooltip_on_hover");
	});

	it("Regular mode button with shortcut shows combined tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("mbRegularShortcut"))).perform();
		expect(takeScreenshot()).toLookAs("regular_shortcut_tooltip_on_hover");
	});

	it("Split mode button with tooltip shows tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("mbSplitTooltip"))).perform();
		expect(takeScreenshot()).toLookAs("split_tooltip_on_hover");
	});

	it("Split mode arrow button shows its own fixed tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("mbSplitTooltip-internalSplitBtn-arrowButton"))).perform();
		expect(takeScreenshot()).toLookAs("split_arrow_tooltip_on_hover");
	});

	it("Split mode button with shortcut shows combined tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("mbSplitShortcut"))).perform();
		expect(takeScreenshot()).toLookAs("split_shortcut_tooltip_on_hover");
	});

	it("Regular mode button shows tooltip on keyboard focus", function() {
		browser.driver.executeScript(
			"document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true}));" +
			"document.getElementById('mbRegularShortcut-internalBtn').focus({focusVisible: true});"
		);
		expect(takeScreenshot()).toLookAs("regular_tooltip_on_focus");
	});

	it("Split mode button shows tooltip on keyboard focus", function() {
		browser.driver.executeScript(
			"document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true}));" +
			"document.getElementById('mbSplitTooltip-internalSplitBtn').focus({focusVisible: true});"
		);
		expect(takeScreenshot()).toLookAs("split_tooltip_on_focus");
	});

});

