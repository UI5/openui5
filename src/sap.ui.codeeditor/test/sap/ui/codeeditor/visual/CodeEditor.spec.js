/* global describe, it, browser, takeScreenshot, expect */

describe("sap.ui.codeeditor.CodeEditor", function() {
	"use strict";

	it("should see the code editor", function () {
		// Wait for the editor to be fully rendered
		browser.sleep(1000);

		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("should highlight selected word occurrences in default theme", function () {
		// Wait for the editor to be ready
		browser.sleep(500);

		// Select the word "input" which appears multiple times in the HTML sample
		browser.executeScript(function() {
			var Element = sap.ui.require("sap/ui/core/Element");
			var oEditor = Element.getElementById("__editor0");
			if (oEditor) {
				var oAce = oEditor.getAceEditor();
				// The HTML sample has <input> tags - select the word "input" at row 9
				// <input id="fname" value="John"><br>
				oAce.selection.setRange({
					start: { row: 9, column: 4 },
					end: { row: 9, column: 9 }
				});
				oAce.focus();
			}
		});

		browser.sleep(300);

		expect(takeScreenshot()).toLookAs("1_selected_word_input");
	});

});
