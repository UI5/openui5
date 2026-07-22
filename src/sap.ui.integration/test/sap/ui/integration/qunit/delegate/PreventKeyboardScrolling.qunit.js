/* global QUnit */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/widgets/Card",
	"sap/m/VBox",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], (
	library,
	Card,
	VBox,
	QUnitUtils,
	nextUIUpdate,
	nextCardReadyEvent
) => {
	"use strict";
	const {CardOverflow} = library;

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const oTestManifest1 = {
		"sap.app": {
			"id": "test.card.overflowHandler.sample1"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"json": [
					{
						"Name": "Career",
						"icon": "sap-icon://leads"
					},
					{
						"Name": "Company Directory",
						"icon": "sap-icon://address-book"
					},
					{
						"Name": "Development Plan",
						"icon": "sap-icon://activity-items"
					},
					{
						"Name": "Business Goals",
						"icon": "sap-icon://target-group"
					}
				]
			},
			"header": {
				"title": "Test Card"
			},
			"content": {
				"item": {
					"icon": {
						"src": "{icon}"
					},
					"title": "{Name}"
				}
			}
		}
	};

	QUnit.module("Prevent keyboard scrolling", {
		beforeEach: async function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: oTestManifest1,
				overflow: CardOverflow.ShowMore
			});

			this.oCard.setHeight("100%");

			this.vBox = new VBox({
				height: "150px",
				renderType: "Bare",
				items: [this.oCard]
			});

			this.vBox.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.vBox.destroy();
		}
	});

	QUnit.test("When space is not enough", function (assert) {
		// Arrange
		const oList = this.oCard.getCardContent().getInnerList();

		oList.focus();

		QUnitUtils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		this.oCard.getCardContent()._oOverflowHandler._oPreventKeyboardScrolling._scroll(); // @todo the scroll event should be fired, but is not

		QUnitUtils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		this.oCard.getCardContent()._oOverflowHandler._oPreventKeyboardScrolling._scroll();

		// Assert
		const oFooter = this.oCard.getCardFooter();
		const oShowMore = oFooter.getAggregation("_showMore");
		const oContentSection = this.oCard.getDomRef("contentSection");

		assert.strictEqual(oContentSection.scrollTop, 0, "The content is not scrolled");
		assert.strictEqual(oShowMore.getDomRef(), document.activeElement, "The focus is on the show more button.");
	});
});