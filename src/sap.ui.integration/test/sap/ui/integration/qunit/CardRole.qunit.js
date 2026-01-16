/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/test/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/ui/integration/library",
	"sap/f/library"
],
	function(
		Card,
		nextUIUpdate,
		nextCardReadyEvent,
		library,
		fLibrary
	) {
		"use strict";

		const DOM_RENDER_LOCATION = "qunit-fixture";
		const CardDisplayVariant = library.CardDisplayVariant;
		const SemanticRole = fLibrary.cards.SemanticRole;

		const sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue libero ut blandit faucibus. Phasellus sed urna id tortor consequat accumsan eget at leo. Cras quis arcu magna.";

		QUnit.module("Role - region" , {
			beforeEach: async function() {
				this.oCard = new Card({
					manifest: {
						"sap.app": {
							"id": "test.card.tile.tooltips"
						},
						"sap.card": {
							"type": "Object",
							"header": {
								"title": sLongText,
								"subtitle": sLongText
							},
							"content": {
								"groups": []
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Cards attributes", function (assert) {
			// Assert
			assert.ok(this.oCard.getSemanticRole(), "region", "Card role is regions");
			assert.notOk(this.oCard.getDomRef().getAttribute("tabindex"), "Card should  not have tabindex");
			assert.notOk(this.oCard.getDomRef().classList["value"].indexOf("sapFCardInteractive") > -1, "Card should  not have interactive styles");
		});

		QUnit.module("Role - listitem" , {
			beforeEach: async function() {
				this.oCard = new Card({
					semanticRole: SemanticRole.ListItem,
					manifest: {
						"sap.app": {
							"id": "test.card.tile.tooltips"
						},
						"sap.card": {
							"type": "Object",
							"header": {
								"title": sLongText,
								"subtitle": sLongText
							},
							"content": {
								"groups": []
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Testing attributes", function (assert) {
			// Assert
			assert.ok(this.oCard.getSemanticRole(), SemanticRole.ListItem, "Card role is listitem");
			assert.strictEqual(this.oCard.getDomRef().getAttribute("tabindex"), "0", "Card should have tabindex");
			assert.ok(this.oCard.getDomRef().classList["value"].indexOf("sapFCardInteractive") === -1, "Card should not have interactive styles");
		});

		QUnit.module("Card with semanticRole = region, displayVariant - Tile" , {
			beforeEach: async function() {
				this.oCard = new Card({
					displayVariant: CardDisplayVariant.TileStandard,
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
					manifest: {
						"sap.app": {
							"id": "test.card.tile.links"
						},
						"sap.card": {
							"type": "Object",
							"data":	{
								"json": {
									"url": "http://www.sap.com",
									"target": "_blank"
								}
							},
							"header": {
								"title": "Test",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "{url}",
											"target": "{target}"
										}
									}
								]
							},
							"content": { }
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Check role of card", function (assert) {
			// Assert
			assert.notOk(this.oCard.getDomRef().getAttribute("role"), "Card should  not have role attribute");
			assert.notOk(this.oCard.getDomRef().getAttribute("aria-labelledby"), "Card should  not have aria-labelledby attribute");
		});

		QUnit.module("Card with semanticRole region, displayVariant - Tile, navigation action in header", {
			beforeEach: async function() {
				this.oCard = new Card({
					displayVariant: CardDisplayVariant.TileStandard,
					manifest: {
						"sap.app": {
							"id": "test.card.region.href"
						},
						"sap.card": {
							"type": "Object",
							"header": {
								"title": "Test Card with Link",
								"subtitle": "Subtitle text",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "https://www.sap.com",
											"target": "_blank"
										}
									}
								]
							},
							"content": {
								"groups": []
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Card with href", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();
			var oHeaderDomRef = oHeader.getDomRef("focusable");

			// Assert card level attributes
			assert.notOk(oCardDomRef.getAttribute("role"), "Card should not have role attribute");
			assert.notOk(oCardDomRef.getAttribute("aria-labelledby"), "Card should not have aria-labelledby attribute");

			// Assert header attributes
			assert.strictEqual(oHeaderDomRef.getAttribute("role"), "link", "Header should have role link");

			var sHeaderAriaLabelledBy = oHeaderDomRef.getAttribute("aria-labelledby");

			// Verify the header's aria-labelledby contains the title ID
			var sTitleId = oHeader._getTitle().getId();
			assert.ok(sHeaderAriaLabelledBy.indexOf(sTitleId) > -1, "Header aria-labelledby should contain the title ID");
		});

		QUnit.module("Card with semanticRole - region without action in header", {
			beforeEach: async function() {
				this.oCard = new Card({
					displayVariant: CardDisplayVariant.TileStandard,
					manifest: {
						"sap.app": {
							"id": "test.card.region.no.href"
						},
						"sap.card": {
							"type": "Object",
							"header": {
								"title": "Test Card without Link",
								"subtitle": "Subtitle text"
							},
							"content": {
								"groups": []
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Card without href on header", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();
			var oHeaderDomRef = oHeader.getDomRef("focusable");

			// Assert card level attributes
			assert.notOk(oCardDomRef.getAttribute("role"), "Card should not have role region");

			var sCardAriaLabelledBy = oCardDomRef.getAttribute("aria-labelledby");
			assert.notOk(sCardAriaLabelledBy, "Card should not have aria-labelledby");

			// Assert header attributes
			assert.strictEqual(oHeaderDomRef.getAttribute("role"), "group", "Header should have role group when no href");

			var sTitleId = oHeader._getTitle().getId();
			var sHeaderAriaLabelledBy = oHeaderDomRef.getAttribute("aria-labelledby");
			assert.ok(sHeaderAriaLabelledBy, "Header should have aria-labelledby attribute");

			// Verify the header's aria-labelledby does NOT contain just the title ID (it should reference the parent card's aria text)
			assert.ok(sHeaderAriaLabelledBy.indexOf(sTitleId) > -1, "Header aria-labelledby should include title id");
		});

		QUnit.module("Card with semanticRole - listitem and action in header", {
			beforeEach: async function() {
				this.oCard = new Card({
					displayVariant: CardDisplayVariant.TileStandard,
					semanticRole: SemanticRole.ListItem,
					manifest: {
						"sap.app": {
							"id": "test.card.listitem.href"
						},
						"sap.card": {
							"type": "Object",
							"header": {
								"title": "Test Card ListItem with Link",
								"subtitle": "Subtitle text",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "https://www.sap.com",
											"target": "_blank"
										}
									}
								]
							},
							"content": {
								"groups": []
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Card with listitem role and href", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();
			var sFocusableHeaderId = oHeader.getFocusableHeaderId();

			// Assert card level attributes
			var sCardAriaLabelledBy = oCardDomRef.getAttribute("aria-labelledby");

			assert.ok(sCardAriaLabelledBy.indexOf(sFocusableHeaderId) > -1, "Card aria-labelledby should point to the focusable header ID");
			assert.notOk(sCardAriaLabelledBy.indexOf(oHeader._getTitle().getId()) > -1, "Card aria-labelledby should not contain the title ID");
		});

		QUnit.test("Set manifest to null", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();

			this.oCard.setManifest(null);

			assert.ok(oCardDomRef, "Card wrapper is rendered");
			assert.notOk(oHeader.getDomRef(), "Header is not rendered");
		});

		QUnit.module("Card with semanticRole - listitem without href in header", {
			beforeEach: async function() {
				this.oCard = new Card({
					semanticRole: SemanticRole.ListItem,
					manifest: {
						"sap.app": {
							"id": "test.card.listitem.no.href"
						},
						"sap.card": {
							"type": "Object",
							"header": {
								"title": "Test Card ListItem without Link",
								"subtitle": "Subtitle text"
							},
							"content": {
								"groups": []
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Card with listitem role and no href", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();

			// Assert card level attributes
			var sCardAriaLabelledBy = oCardDomRef.getAttribute("aria-labelledby");
			assert.ok(sCardAriaLabelledBy, "Card should have aria-labelledby attribute");

			// Verify the card's aria-labelledby contains the title ID
			var sTitleId = oHeader._getTitle().getId();
			assert.ok(sCardAriaLabelledBy.indexOf(sTitleId) > -1, "Card aria-labelledby should contain the title ID");
		});

		QUnit.module("Numeric header - Card with semanticRole region", {
			beforeEach: async function() {
				this.oCard = new Card({
					displayVariant: CardDisplayVariant.TileStandard,
					manifest: {
						"sap.app": {
							"id": "test.card.numeric.region.href"
						},
						"sap.card": {
							"type": "List",
							"header": {
								"type": "Numeric",
								"title": "Numeric Card with Link",
								"subTitle": "Subtitle text",
								"mainIndicator": {
									"number": "123",
									"unit": "EUR"
								},
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "https://www.sap.com",
											"target": "_blank"
										}
									}
								]
							},
							"content": {
								"data": {
									"json": []
								},
								"item": {
									"title": "{title}"
								}
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Numeric header with href", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();
			var oHeaderDomRef = oHeader.getDomRef("focusable");

			// Assert card level attributes
			assert.notOk(oCardDomRef.getAttribute("role"), "Card should not have role attribute when header has href");
			assert.notOk(oCardDomRef.getAttribute("aria-labelledby"), "Card should not have aria-labelledby attribute when header has href");

			// Assert header attributes
			assert.ok(oHeaderDomRef, "Header focusable element should exist");
			assert.strictEqual(oHeaderDomRef.getAttribute("role"), "link", "Header should have role link");

			var sHeaderAriaLabelledBy = oHeaderDomRef.getAttribute("aria-labelledby");
			assert.ok(sHeaderAriaLabelledBy, "Header should have aria-labelledby attribute");

			// Verify the header's aria-labelledby contains the title ID
			var sTitleId = oHeader._getTitle().getId();
			assert.ok(sHeaderAriaLabelledBy.indexOf(sTitleId) > -1, "Header aria-labelledby should contain the title ID");
		});

		QUnit.module("Numeric header - Card with semanticRole region, displayVariant - Tile", {
			beforeEach: async function() {
				this.oCard = new Card({
					displayVariant: CardDisplayVariant.TileStandard,
					manifest: {
						"sap.app": {
							"id": "test.card.numeric.region.no.href"
						},
						"sap.card": {
							"type": "List",
							"header": {
								"type": "Numeric",
								"title": "Numeric Card without Link",
								"subTitle": "Subtitle text",
								"mainIndicator": {
									"number": "123",
									"unit": "EUR"
								}
							},
							"content": {
								"data": {
									"json": []
								},
								"item": {
									"title": "{title}"
								}
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Numeric header without href", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();
			var oHeaderDomRef = oHeader.getDomRef("focusable");

			// Assert card level attributes
			assert.notOk(oCardDomRef.getAttribute("role"), "Card not should have role region");

			var sCardAriaLabelledBy = oCardDomRef.getAttribute("aria-labelledby");
			assert.notOk(sCardAriaLabelledBy, "Card should not have aria-labelledby");

			assert.strictEqual(oHeaderDomRef.getAttribute("role"), "group", "Header should have role group when no href");

			var sTitleId = oHeader._getTitle().getId();
			var sHeaderAriaLabelledBy = oHeaderDomRef.getAttribute("aria-labelledby");

			// Verify the header's aria-labelledby does NOT contain just the title ID (it should reference the parent card's aria text)
			assert.ok(sHeaderAriaLabelledBy.indexOf(sTitleId) > -1, "Header aria-labelledby should include title id");
		});

		QUnit.module("Numeric header with actions, displayVariant - Tile", {
			beforeEach: async function() {
				this.oCard = new Card({
					displayVariant: CardDisplayVariant.TileStandard,
					semanticRole: SemanticRole.ListItem,
					manifest: {
						"sap.app": {
							"id": "test.card.numeric.listitem.href"
						},
						"sap.card": {
							"type": "List",
							"header": {
								"type": "Numeric",
								"title": "Numeric Card ListItem with Link",
								"subTitle": "Subtitle text",
								"mainIndicator": {
									"number": "123",
									"unit": "EUR"
								},
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "https://www.sap.com",
											"target": "_blank"
										}
									}
								]
							},
							"content": {
								"data": {
									"json": []
								},
								"item": {
									"title": "{title}"
								}
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Numeric header and href", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();
			var sFocusableHeaderId = oHeader.getFocusableHeaderId();

			// Assert card level attributes
			var sCardAriaLabelledBy = oCardDomRef.getAttribute("aria-labelledby");

			assert.ok(sCardAriaLabelledBy.indexOf(sFocusableHeaderId) > -1, "Card aria-labelledby should point to the focusable header ID");
			assert.notOk(sCardAriaLabelledBy.indexOf(oHeader._getTitle().getId()) > -1, "Card aria-labelledby should not contain the title ID");
		});

		QUnit.module("Numeric header without actions, displayVariant - Tile", {
			beforeEach: async function() {
				this.oCard = new Card({
					displayVariant: CardDisplayVariant.TileStandard,
					semanticRole: SemanticRole.ListItem,
					manifest: {
						"sap.app": {
							"id": "test.card.numeric.listitem.no.href"
						},
						"sap.card": {
							"type": "List",
							"header": {
								"type": "Numeric",
								"title": "Numeric Card ListItem without Link",
								"subTitle": "Subtitle text",
								"mainIndicator": {
									"number": "123",
									"unit": "EUR"
								}
							},
							"content": {
								"data": {
									"json": []
								},
								"item": {
									"title": "{title}"
								}
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Numeric header and no href", function (assert) {
			var oCardDomRef = this.oCard.getDomRef();
			var oHeader = this.oCard.getCardHeader();

			// Assert card level attributes
			var sCardAriaLabelledBy = oCardDomRef.getAttribute("aria-labelledby");
			assert.ok(sCardAriaLabelledBy, "Card should have aria-labelledby attribute");

			assert.ok(sCardAriaLabelledBy.indexOf(oHeader.getFocusableHeaderId()) > -1, "Card aria-labelledby should contain the focusable header ID");
		});
	}
);
