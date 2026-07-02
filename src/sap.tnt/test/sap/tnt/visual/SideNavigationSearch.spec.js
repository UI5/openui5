/*global describe, it, element, by, takeScreenshot, expect, browser, protractor*/

describe("sap.tnt.SideNavigationSearch", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.tnt.SideNavigation";

	it("should load test page with search field visible", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("should visualize the search field in the side navigation", function () {
		const oSideNavigation = element(by.id("SNav"));
		expect(takeScreenshot(oSideNavigation)).toLookAs("1_side_navigation_with_search");
	});

	it("should visualize search results with highlighted text", function () {
		const oSearchField = element(by.css("#SNav .sapMSF input"));
		oSearchField.clear();
		oSearchField.sendKeys("Customer");
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		const oSideNavigation = element(by.id("SNav"));
		expect(takeScreenshot(oSideNavigation)).toLookAs("2_search_with_highlighted_text");
	});

	it("should visualize filtered navigation items", function () {
		const oSearchField = element(by.css("#SNav .sapMSF input"));
		oSearchField.clear();
		oSearchField.sendKeys("Orders");
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		var oSideNavigation = element(by.id("SNav"));
		expect(takeScreenshot(oSideNavigation)).toLookAs("3_filtered_items");
	});

	it("should visualize no results state", function () {
		const oSearchField = element(by.css("#SNav .sapMSF input"));
		oSearchField.clear();
		oSearchField.sendKeys("xyznonexistent");
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		const oSideNavigation = element(by.id("SNav"));
		expect(takeScreenshot(oSideNavigation)).toLookAs("4_no_results");
	});

	it("should visualize cleared search field", function () {
		const oResetButton = element(by.css("#SNav .sapMSF .sapMSFR"));
		oResetButton.click();

		const oSideNavigation = element(by.id("SNav"));
		expect(takeScreenshot(oSideNavigation)).toLookAs("5_cleared_search");
	});

	it("should visualize collapsed side navigation without search field", function () {
		element(by.id("menuToggleButton")).click();
		expect(takeScreenshot()).toLookAs("6_collapsed_no_search_field");
	});

	it("should visualize expanded side navigation with search field restored", function () {
		element(by.id("menuToggleButton")).click();

		const oSideNavigation = element(by.id("SNav"));
		expect(takeScreenshot(oSideNavigation)).toLookAs("7_expanded_search_field_restored");
	});
});
