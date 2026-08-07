/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.DateTimePickerWithTimezone", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.DateTimePicker';

	it("timezone label truncation", function() {
		const oDTP1 = element(by.id("DTP1"));
		const oBtnWidth20 = element(by.id("item20-button"));
		const oBtnWidth40 = element(by.id("item40-button"));

		expect(takeScreenshot(oDTP1)).toLookAs("buenos_aires_label_truncated");

		// Shrink to 20%
		oBtnWidth20.click();

		expect(takeScreenshot(oDTP1)).toLookAs("label_and_input_truncated");

		oBtnWidth40.click();
	});

	it("timezone label change", function() {
		const oDTP1 = element(by.id("DTP1"));
		const oBtnNY = element(by.id("itemNY-button"));
		const oBtnArgentina = element(by.id("itemArgentina-button"));

		// Set timezone property to New York
		oBtnNY.click();

		expect(takeScreenshot(oDTP1)).toLookAs("new_york_label_fully_visible");

		oBtnArgentina.click();
	});

	it("picker displays the correct date when the app timezone is different", function() {
		const oBtnArgentinaLocale = element(by.id("itemArgentinaLocale-button"));
		const oBtnBerlinLocale = element(by.id("itemBerlinLocale-button"));
		const oBtnSofiaLocale = element(by.id("itemSofiaLocale-button"));
		const oBtnDefaultLocale = element(by.id("itemDefaultLocale-button"));
		const oValueHelpIcon = element(by.id("DTP3-icon"));

		// Set the app locale to Argentina and open the picker
		oBtnArgentinaLocale.click();
		oValueHelpIcon.click();

		const oDTP3Popover = element(by.id("DTP3-RP-popover"));

		expect(takeScreenshot(oDTP3Popover)).toLookAs("picker_displays_24_Mar_2021_19_30_00");

		// Close picker, select Berlin locale and open the picker again
		oValueHelpIcon.click();

		oBtnBerlinLocale.click();
		oValueHelpIcon.click();

		expect(takeScreenshot(oDTP3Popover)).toLookAs("picker_displays_24_Mar_2021_23_30_00");

		// Close picker, select Sofia locale and open the picker again
		oValueHelpIcon.click();
		oBtnSofiaLocale.click();
		oValueHelpIcon.click();

		expect(takeScreenshot(oDTP3Popover)).toLookAs("picker_displays_25_Mar_2021_00_30_00");

		// Reset the app locale to default
		oValueHelpIcon.click();
		oBtnDefaultLocale.click();
	});
});
