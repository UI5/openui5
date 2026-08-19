/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.ScrollContainer", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ScrollContainer';

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should show focus outline on full-sized container", function () {
		element(by.id("oScrollContainer1")).click();
		expect(takeScreenshot(element(by.id("oScrollContainer1")))).toLookAs("scrollcontainer-focused");
	});

	it("Should show focus outline when scrolled", function () {
		element(by.id("oScrollContainer1")).click();
		// Scroll down to check focus remains visible
		browser.executeScript('document.getElementById("oScrollContainer1").scrollTop = 100');
		expect(takeScreenshot(element(by.id("oScrollContainer1")))).toLookAs("scrollcontainer-focused-scrolled");
	});
});
