/* global describe, it, takeScreenshot, expect, browser */

describe("sap.ui.codeeditor.CodeEditor", function() {
	"use strict";

	it("should see the code editor", function () {
		// Wait for the editor to be fully rendered
		browser.sleep(1000);

		expect(takeScreenshot()).toLookAs("0_initial");
	});

});