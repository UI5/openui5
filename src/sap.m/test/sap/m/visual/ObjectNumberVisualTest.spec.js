/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.ObjectNumberVisualTest", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ObjectNumber';

	it("ObjectNumber",function() {
		expect(takeScreenshot()).toLookAs("initial-rendering");
	});

	it("Number set to emphasized",function(){
		element(by.id("emphasized")).click();
		expect(takeScreenshot()).toLookAs("number-emphasized");
	});

	it("Change number",function(){
		element(by.id("num")).click();
		expect(takeScreenshot()).toLookAs("number-change-value");
	});

	it("Change unit",function(){
		element(by.id("unit")).click();
		expect(takeScreenshot()).toLookAs("number-change-unit");
	});

	it("Number change state to success",function(){
		element(by.id("change_stateS")).click();
		expect(takeScreenshot()).toLookAs("number-state-success");
	});

	it("Number change state to error",function(){
		element(by.id("change_stateE")).click();
		expect(takeScreenshot()).toLookAs("number-state-error");
	});

	it("Number change state to warning",function(){
		element(by.id("change_stateW")).click();
		expect(takeScreenshot()).toLookAs("number-state-warning");
	});

	it("Number change state to information",function(){
		element(by.id("change_stateI")).click();
		expect(takeScreenshot()).toLookAs("number-state-information");
	});

	// Currency mode

	it("Currency mode: USD with symbol (useSymbol=true)", function() {
		expect(takeScreenshot(element(by.id("onCurrency1")))).toLookAs("currency-usd-symbol");
	});

	it("Currency mode: USD with ISO code (useSymbol=false)", function() {
		expect(takeScreenshot(element(by.id("onCurrency2")))).toLookAs("currency-usd-iso");
	});

	it("Currency mode: EUR with maxPrecision=4 (extra padding)", function() {
		expect(takeScreenshot(element(by.id("onCurrency3")))).toLookAs("currency-eur-maxprecision-4");
	});

	it("Currency mode: JPY (zero decimal digits)", function() {
		expect(takeScreenshot(element(by.id("onCurrency4")))).toLookAs("currency-jpy-zero-decimals");
	});

	it("Currency mode: CHF with maxPrecision matching CLDR (no padding)", function() {
		expect(takeScreenshot(element(by.id("onCurrency5")))).toLookAs("currency-chf-maxprecision-cldr");
	});

	// Unit mode

	it("Unit mode: kg without maxPrecision (integer)", function() {
		expect(takeScreenshot(element(by.id("onUnit1")))).toLookAs("unit-kg-no-precision");
	});

	it("Unit mode: km with maxPrecision=2", function() {
		expect(takeScreenshot(element(by.id("onUnit2")))).toLookAs("unit-km-maxprecision-2");
	});

	it("Unit mode: m² with maxPrecision=3", function() {
		expect(takeScreenshot(element(by.id("onUnit3")))).toLookAs("unit-m2-maxprecision-3");
	});

	it("Unit mode: useSymbol has no effect on raw unit string", function() {
		expect(takeScreenshot(element(by.id("onUnit4")))).toLookAs("unit-kwh-usesymbol-ignored");
	});

	it("Unit mode: emphasized", function() {
		expect(takeScreenshot(element(by.id("onUnit5")))).toLookAs("unit-kg-emphasized");
	});

});