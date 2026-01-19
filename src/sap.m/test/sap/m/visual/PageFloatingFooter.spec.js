/*global beforeAll,describe,it,element,by,takeScreenshot,expect,browser,protractor,sap_ui_core_Element:true,sap_ui_thirdparty_jQuery:true */

describe("sap.m.PageFloatingFooter", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Page';

	beforeAll(function() {
		browser.executeScript(function() {
			return new Promise(function(resolve) {
				sap.ui.require([
					"sap/ui/core/Element",
					"sap/ui/thirdparty/jquery"
				], function(Device, Element, jQuery) {
					sap_ui_core_Element = Element;
					sap_ui_thirdparty_jQuery = jQuery;
					resolve();
				});
			});
		});
	});

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should scroll into view the element on focus", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap_ui_core_Element.getElementById("page").getDomRef();
			sap_ui_thirdparty_jQuery(oPageDomRef).css("height", "400px");
		});
		expect(takeScreenshot()).toLookAs("focused_element_not_fully_visible");

		element(by.id("button0")).click();
		browser.actions().sendKeys(protractor.Key.TAB).perform();

		expect(takeScreenshot()).toLookAs("focused_element_visible");
	});
});