/* global QUnit */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/cards/Footer",
	"sap/ui/integration/widgets/Card",
	"sap/ui/test/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function(
	library,
	Footer,
	Card,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	const CardOverflow = library.CardOverflow;

	QUnit.module("Footer", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oFooter = new Footer({
				card: this.oCard
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oFooter.destroy();
		}
	});

	QUnit.test("#_hasBinding when there is no binding", function (assert) {
		// Arrange
		this.oFooter.setConfiguration({
			actionsStrip: [
				{
					text: "Text without binding"
				}
			]
		});

		// Assert
		assert.notOk(this.oFooter._hasBinding(), "Check for bindings should be negative");
	});

	QUnit.test("#_hasBinding when there is binding", function (assert) {
		// Arrange
		this.oFooter.setConfiguration({
			actionsStrip: [
				{
					text: "{someBindingPath}"
				}
			]
		});

		// Assert
		assert.ok(this.oFooter._hasBinding(), "Check for bindings should be positive");
	});

	QUnit.test("Footer with empty configuration during loading", async function (assert) {
		// Arrange
		const oFooter = this.oFooter;
		const oCard = this.oCard;

		// Act
		oCard.showLoadingPlaceholders();
		oFooter.setShowCloseButton(true);
		oFooter.placeAt("qunit-fixture");

		await nextUIUpdate();

		// Assert
		assert.ok(true, "There must be no errros thrown.");
	});

	QUnit.module("Footer actions strip", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Create actions strip with template", async function (assert) {
		const oManifest = {
			"sap.card": {
				"type": "List",
				"data": {
					"json": {
						"actions": [{
							"text": "Action 1"
						}, {
							"text": "Action 2"
						}]
					}
				},
				"content": {
					"item": {}
				},
				"footer": {
					"actionsStrip": {
						"item": {
							"template": {
								"text": "{text}"
							},
							"path": "actions"
						}
					}
				}
			}
		};

		this.oCard.setManifest(oManifest);
		this.oCard.startManifestProcessing();

		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getCardFooter().getActionsStrip(),
			aItems = oActionsStrip._getToolbar().getContent();

		assert.strictEqual(aItems[1].getText(), "Action 1", "Action text is correct");
		assert.strictEqual(aItems[2].getText(), "Action 2", "Action text is correct");
	});

	QUnit.module("Footer close button", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Hiding close button from header", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.sample.bitetosnacUrlmanifest.bite",
				"type": "card"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://switch-classes"
				}
			},
			"sap.card": {
				"type": "Object",
				"configuration": {
					"parameters": {
						"test": {
							"value": "test"
						}
					}
				},
				"data": {
					"json": {
						"info": {
							"firstName": "Donna",
							"email": "mail@mycompany.com"
						}
					}
				},
				"header": {
					"title": "Some Title"
				},
				"content": {
					"groups": [{
						"items": [{
							"value": "Lorem ipsum dolor sit."
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
						"text": "Review",
						"actions": [{
							"type": "ShowCard",
							"parameters": {
								"width": "420px",
								"data": {
									"personalInfoData": "{/info}"
								},
								"parameters": {
									"test": "{parameters>/test/value}"
								},
								"manifest": "./snackManifest.json"
							}
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		const sFooterId = oSnackCard.getCardFooter().getId();

		//Assert
		assert.strictEqual(oSnackCard.getCardFooter().getShowCloseButton(), false, "Close Button is not visible");
		assert.strictEqual(oSnackCard.getCardFooter().getDomRef().querySelector("#" + sFooterId + "-closeBtn"), null, "Close Button is not in DOM");
	});

	QUnit.test("Hiding close button from footer", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.sample.bitetosnacUrlmanifest.bite",
				"type": "card"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://switch-classes"
				}
			},
			"sap.card": {
				"type": "Object",
				"configuration": {
					"parameters": {
						"test": {
							"value": "test"
						}
					}
				},
				"data": {
					"json": {
						"info": {
							"firstName": "Donna",
							"email": "mail@mycompany.com"
						}
					}
				},
				"header": {
					"title": "Some Title"
				},
				"content": {
					"groups": [{
						"items": [{
							"value": "Lorem ipsum dolor sit."
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
						"text": "Review",
						"actions": [{
							"type": "ShowCard",
							"parameters": {
								"width": "420px",
								"data": {
									"personalInfoData": "{/info}"
								},
								"parameters": {
									"test": "{parameters>/test/value}"
								},
								"manifest": "./snackManifest2.json"
							}
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		const sFooterId = oSnackCard.getCardFooter().getId();

		//Assert
		assert.strictEqual(oSnackCard.getCardFooter().getShowCloseButton(), false, "Close Button is not visible");
		assert.strictEqual(oSnackCard.getCardFooter().getDomRef().querySelector("#" + sFooterId + "-closeBtn"), null, "Close Button is not in DOM");
	});

	QUnit.test("Footer is not created if the only configuration it has is to hide the close button", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.sample.bitetosnacUrlmanifest.bite",
				"type": "card"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://switch-classes"
				}
			},
			"sap.card": {
				"type": "Object",
				"configuration": {
					"parameters": {
						"test": {
							"value": "test"
						}
					}
				},
				"data": {
					"json": {
						"info": {
							"firstName": "Donna",
							"email": "mail@mycompany.com"
						}
					}
				},
				"header": {
					"title": "Some Title"
				},
				"content": {
					"groups": [{
						"items": [{
							"value": "Lorem ipsum dolor sit."
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
						"text": "Review",
						"actions": [{
							"type": "ShowCard",
							"parameters": {
								"width": "420px",
								"data": {
									"personalInfoData": "{/info}"
								},
								"parameters": {
									"test": "{parameters>/test/value}"
								},
								"manifest": "./snackManifest3.json"
							}
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		//Assert
		assert.strictEqual(oSnackCard.getCardFooter(), null, "Footer is not created");
	});

	QUnit.test("Close button is visible by default", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.sample.bitetosnacUrlmanifest.bite",
				"type": "card"
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://switch-classes"
				}
			},
			"sap.card": {
				"type": "Object",
				"configuration": {
					"parameters": {
						"test": {
							"value": "test"
						}
					}
				},
				"data": {
					"json": {
						"info": {
							"firstName": "Donna",
							"email": "mail@mycompany.com"
						}
					}
				},
				"header": {
					"title": "Some Title"
				},
				"content": {
					"groups": [{
						"items": [{
							"value": "Lorem ipsum dolor sit."
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
						"text": "Review",
						"actions": [{
							"type": "ShowCard",
							"parameters": {
								"width": "420px",
								"data": {
									"personalInfoData": "{/info}"
								},
								"parameters": {
									"test": "{parameters>/test/value}"
								},
								"manifest": "./snackManifest4.json"
							}
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		const sFooterId = oSnackCard.getCardFooter().getId();

		//Assert
		assert.strictEqual(oSnackCard.getCardFooter().getShowCloseButton(), true, "Close Button is visible");
		assert.ok(oSnackCard.getCardFooter().getDomRef().querySelector("#" + sFooterId + "-closeBtn"), "Close Button is rendered in DOM");
	});

	QUnit.module("Footer detectVisibility", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				overflow: CardOverflow.ShowMore
			});
			this.oCard.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Footer visibility with buttons", async function (assert) {
		const oCard = this.oCard;
		const oManifest = {
			"sap.app": {
				id: "card.test.footer.detectVisibility1"
			},
			"sap.card": {
				type: "List",
				data: {
					json: []
				},
				header: {
					title: "Test Card"
				},
				content: {
					item: {
						title: "{title}"
					}
				},
				footer: {
					actionsStrip: [
						{
							text: "Action"
						}
					]
				}
			}
		};

		// Act
		oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		// Assert
		const oFooter = oCard.getCardFooter();

		assert.ok(oFooter.getDetectVisibility(), "Property detectVisibility is true when card is overflow=ShowMore");
		assert.ok(oFooter.getVisible(), "Footer is visible when there is a button");
	});

	QUnit.test("Footer visibility with buttons", async function (assert) {
		const oCard = this.oCard;
		const oManifest = {
			"sap.app": {
				id: "card.test.footer.detectVisibility2"
			},
			"sap.card": {
				type: "List",
				data: {
					json: []
				},
				header: {
					title: "Test Card"
				},
				content: {
					item: {
						title: "{title}"
					}
				},
				footer: {
					actionsStrip: [
						{
							text: "Action",
							visible: false
						}
					]
				}
			}
		};

		// Act
		oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		// Assert
		const oFooter = oCard.getCardFooter();

		assert.notOk(oFooter.getVisible(), "Footer is not visible when all buttons are not visible");
	});

	QUnit.test("Footer visibility without buttons", async function (assert) {
		const oCard = this.oCard;
		const oManifest = {
			"sap.app": {
				id: "card.test.footer.detectVisibility3"
			},
			"sap.card": {
				type: "List",
				data: {
					json: []
				},
				header: {
					title: "Test Card"
				},
				content: {
					item: {
						title: "{title}"
					}
				}
			}
		};

		// Act
		oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		// Assert
		const oFooter = oCard.getCardFooter();

		assert.ok(oFooter, "Footer is created even when there are no buttons");
		assert.notOk(oFooter.getVisible(), "Footer is not visible");
	});

	QUnit.module("Footer showMore button", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				overflow: CardOverflow.ShowMore
			});
			this.oCard.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Footer visibility and showMore button", async function (assert) {
		const oCard = this.oCard;
		const oManifest = {
			"sap.app": {
				id: "card.test.footer.showMoreButton"
			},
			"sap.card": {
				type: "List",
				data: {
					json: []
				},
				header: {
					title: "Test Card"
				},
				content: {
					item: {
						title: "{title}"
					}
				}
			}
		};

		// Act
		oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		// Assert
		const oFooter = oCard.getCardFooter();

		assert.notOk(oFooter.getVisible(), "Footer is not visible if no showMore");

		// Act
		oFooter.setShowMoreButton(true);
		await nextUIUpdate();

		// Assert
		assert.ok(oFooter.getVisible(), "Footer is visible when there is a showMore button");

		const oShowMoreButton = oFooter.getAggregation("_showMore");
		assert.ok(oShowMoreButton, "Show more button is created");
		assert.ok(oShowMoreButton.getVisible(), "Show more button is visible");
	});

	QUnit.module("Footer showSeparator property", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Default value of showSeparator property", function (assert) {
		const oFooter = new Footer();

		assert.strictEqual(oFooter.getShowSeparator(), false, "Default value should be false");

		oFooter.destroy();
	});

	QUnit.test("Setting showSeparator to true", function (assert) {
		const oFooter = new Footer();

		oFooter.setShowSeparator(true);

		assert.strictEqual(oFooter.getShowSeparator(), true, "Property should be set to true");

		oFooter.destroy();
	});

	QUnit.test("Footer renders with border class when showSeparator is true", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.footer.borderLine",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Test Card"
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Name",
							"value": "Test Value"
						}]
					}]
				},
				"footer": {
					"showSeparator": true,
					"actionsStrip": [{
						"text": "Action",
						"actions": [{
							"type": "Custom"
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oFooter = this.oCard.getCardFooter();
		const oDomRef = oFooter.getDomRef();

		assert.ok(oFooter.getShowSeparator(), "showSeparator property is true");
		assert.ok(oDomRef.classList.contains("sapFCardFooterBorderLine"), "Footer has the border line CSS class");
	});

	QUnit.test("Footer renders without border class when showSeparator is false", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.footer.noBorderLine",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Test Card"
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Name",
							"value": "Test Value"
						}]
					}]
				},
				"footer": {
					"showSeparator": false,
					"actionsStrip": [{
						"text": "Action",
						"actions": [{
							"type": "Custom"
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oFooter = this.oCard.getCardFooter();
		const oDomRef = oFooter.getDomRef();

		assert.notOk(oFooter.getShowSeparator(), "showSeparator property is false");
		assert.notOk(oDomRef.classList.contains("sapFCardFooterBorderLine"), "Footer does not have the border line CSS class");
	});

	QUnit.test("Footer renders without border class when showSeparator is not set", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.footer.defaultBorderLine",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Test Card"
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Name",
							"value": "Test Value"
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
						"text": "Action",
						"actions": [{
							"type": "Custom"
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oFooter = this.oCard.getCardFooter();
		const oDomRef = oFooter.getDomRef();

		assert.strictEqual(oFooter.getShowSeparator(), false, "showSeparator property defaults to false");
		assert.notOk(oDomRef.classList.contains("sapFCardFooterBorderLine"), "Footer does not have the border line CSS class by default");
	});

	QUnit.test("Dynamically changing showSeparator property", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.footer.dynamicBorderLine",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Test Card"
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Name",
							"value": "Test Value"
						}]
					}]
				},
				"footer": {
					"showSeparator": false,
					"actionsStrip": [{
						"text": "Action",
						"actions": [{
							"type": "Custom"
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oFooter = this.oCard.getCardFooter();
		let oDomRef = oFooter.getDomRef();

		assert.notOk(oDomRef.classList.contains("sapFCardFooterBorderLine"), "Footer does not have border class initially");

		oFooter.setShowSeparator(true);
		await nextUIUpdate();

		oDomRef = oFooter.getDomRef();

		assert.ok(oDomRef.classList.contains("sapFCardFooterBorderLine"), "Footer has border class after setting to true");

		oFooter.setShowSeparator(false);
		await nextUIUpdate();

		oDomRef = oFooter.getDomRef();

		assert.notOk(oDomRef.classList.contains("sapFCardFooterBorderLine"), "Footer does not have border class after setting back to false");
	});
});