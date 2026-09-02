/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.ButtonTooltip", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Button';

	it("Button with custom tooltip shows tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("btnTooltipOnly"))).perform();
		expect(takeScreenshot()).toLookAs("button_custom_tooltip_on_hover");
	});

	it("Button with keyboard shortcut shows combined tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("btnTooltipShortcut"))).perform();
		expect(takeScreenshot()).toLookAs("button_shortcut_tooltip_on_hover");
	});

	it("Icon-only button without tooltip set shows icon name tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("btnIconOnly"))).perform();
		expect(takeScreenshot()).toLookAs("button_icon_only_tooltip_on_hover");
	});

	it("Disabled button shows no tooltip on hover", function() {
		browser.actions().mouseMove(element(by.id("btnDisabled"))).perform();
		expect(takeScreenshot()).toLookAs("button_disabled_no_tooltip_on_hover");
	});

});
