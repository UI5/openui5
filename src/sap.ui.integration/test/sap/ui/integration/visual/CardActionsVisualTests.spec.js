/* eslint-env node */
/* global describe, it, by, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardActionsVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	it("Navigation Action page", function () {
		var aCardIds = ["listNavAction", "tableNavAction"];

		utils.navigateTo("Navigation Action");

		aCardIds.forEach(function (sId) {
			var oCard = {
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NavigationAction",
					interaction: "root",
					id: sId
				}
			};

			var oCardElement = utils.getElement(oCard);

			// Pre-scroll the card into view so that takePictureOfElement's scroll is a no-op,
			// ensuring the page does not shift after hovering.
			oCardElement.getWebElement().then(function (webElem) {
				return webElem.getAttribute("id").then(function (id) {
					return browser.executeScript("document.getElementById('" + id + "').scrollIntoView()");
				});
			});

			// For table cards, hover on a <td> cell inside the first row —
			// moving the mouse to a <tr> alone does not trigger CSS :hover visually in Chrome.
			var sFirstRowSelector = sId === "tableNavAction"
				? ".sapMLIB:nth-child(1) .sapMListTblCell"
				: ".sapMLIB:nth-child(1)";

			utils.hoverOn(
				oCardElement.element(by.css(sFirstRowSelector))
			);

			utils.takePictureOfElement(oCard, "Actions_" + sId);
		});
	});
});
