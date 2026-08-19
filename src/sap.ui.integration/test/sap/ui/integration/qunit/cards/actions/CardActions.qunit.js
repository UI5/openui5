/* global QUnit, sinon */

sap.ui.define([
		"sap/ui/core/Lib",
		"sap/ui/integration/library",
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/cards/actions/CardActions",
		"sap/ui/integration/cards/actions/NavigationAction",
		"sap/ui/integration/cards/actions/SubmitAction",
		"sap/ui/integration/cards/actions/CustomAction",
		"sap/ui/integration/util/RequestDataProvider",
		"sap/ui/integration/Host",
		"sap/ui/core/Element",
		"sap/base/Log",
		"sap/ui/events/KeyCodes",
		"sap/ui/qunit/QUnitUtils",
		"sap/m/library",
		"sap/ui/test/utils/nextUIUpdate",
		"qunit/testResources/nextCardReadyEvent"
],
	function (
		Library,
		library,
		Card,
		CardActions,
		NavigationAction,
		SubmitAction,
		CustomAction,
		RequestDataProvider,
		Host,
		Element,
		Log,
		KeyCodes,
		qutils,
		mLibrary,
		nextUIUpdate,
		nextCardReadyEvent
	) {
		"use strict";

		var CardActionType = library.CardActionType;
		var ListType = mLibrary.ListType;

		const oRbF = Library.getResourceBundleFor("sap.f");
		const oRbIntegration = Library.getResourceBundleFor("sap.ui.integration");

		var DOM_RENDER_LOCATION = "qunit-fixture",
			LOG_MESSAGE = "Navigate successfully";

		var oManifest_ListCard_No_Actions = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card4",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subtitle": "Card Subtitle"
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						},
						"path": "/"
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						}
					}
				}
			}
		};

		var oManifest_ListCard_Actions_Missing_Type = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card5",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subtitle": "Card Subtitle",
					"actions": [{
						"parameters": {
							"url": "https://www.sap.com"
						}
					}]
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						},
						"path": "/"
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						},
						"actions": [{
							"enabled": "{= ${url}}",
							"parameters": {
								"url": "{url}",
								"target": "_blank",
								"somekey": "{someparam}"
							}
						}]
					}
				}
			}
		};

		var oManifest_ListCard_CONTENT_ACTION = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card6",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subtitle": "Card Subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						},
						"path": "/"
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						},
						"actions": [{
							"type": "Navigation",
							"enabled": "{= ${url}}",
							"parameters": {
								"url": "{url}",
								"target": "_blank",
								"somekey": "{someparam}"
							}
						}]
					}
				}
			}
		};

		var oManifest_ListCard_Action_Enabled = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card7",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subtitle": "Card Subtitle"
				},
				"content": {
					"data": {
						"request": {
							"url": "someitems_services_action_enabled.json"
						},
						"path": "/"
					},
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						},
						"actions": [{
							"type": "Navigation",
							"enabled": "{= ${enabled}}",
							"parameters": {
								"url": "{url}",
								"target": "_blank"
							}
						}]
					}
				}
			}
		};

		var oManifest_ListCard_No_Request = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card8",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "List Card",
					"subtitle": "With static list items"
				},
				"content": {
					"data": {
						"json": [{
								"Name": "Comfort Easy",
								"Category": "PDA & Organizers",
								"url": "https://www.sap.com"
							},
							{
								"Name": "ITelO Vault",
								"Category": "PDA & Organizers"
							}
						]
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"actions": [{
							"type": "Navigation",
							"enabled": "{= ${url}}",
							"parameters": {
								"url": "{url}"
							}
						}]
					}
				}
			}
		};

		var objectContent_url = {
			"sap.app": {
				"id": "test.card.actions.card12",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "employee.json"
					}
				},
				"header": {
					"icon": {
						"src": "{photo}"
					},
					"title": "{firstName} {lastName}",
					"subtitle": "{position}",
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com"
						}

					}]
				},
				"content": {
					"groups": [{
							"title": "Contact Details",
							"items": [{
									"label": "Fist Name",
									"value": "{firstName}"
								},
								{
									"label": "Last Name",
									"value": "{lastName}"
								},
								{
									"label": "Phone",
									"value": "{phone}"
								},
								{
									"label": "Agenda",
									"value": "Book a meeting",
									"type": "action",
									"actions": [{
										"type": "Navigation",
										"enabled": "{= ${agendaUrl}}",
										"parameters": {
											"url": "{agendaUrl}"
										}
									}]
								}
							]
						},
						{
							"title": "Organization Details",
							"items": [{
								"label": "Direct Manager",
								"value": "{manager/firstName} {manager/lastName}",
								"icon": {
									"src": "{manager/photo}"
								}
							}]
						},
						{
							"title": "Company Details",
							"items": [{
									"label": "Company Name",
									"value": "{company/name}"
								},
								{
									"label": "Address",
									"value": "{company/address}"
								},
								{
									"label": "Website",
									"value": "{company/website}",
									"actions": [{
										"type": "Navigation",
										"enabled": false,
										"parameters": {
											"url": "{company/website}"
										}
									}]
								}
							]
						}
					],
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com"
						}
					}]
				}
			}
		};

		var oManifestActionSubmit = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "adaptivecard.embedded",
				"type": "card"
			},
			"sap.card": {
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "./my-fake.url",
							"method": "POST"
						}
					}
				},
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [{
						"type": "TextBlock",
						"size": "medium",
						"weight": "bolder",
						"isSubtle": true,
						"text": "Input.Text elements",
						"horizontalAlignment": "center"
					}]
				}
			}
		};

		var oIntegrationCardManifest = {
			"sap.app": {
				"id": "test.card.actions.card13"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com"
						}
					}],
					"title": "Integration Card with action",
					"subtitle": "Card subtitle",
					"icon": {
						"src": "sap-icon://activities"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"data": {
						"json": [{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"icon": "sap-icon://laptop",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"icon": "sap-icon://laptop",
								"state": "Success",
								"info": "27.45 EUR",
								"infoState": "Success"

							}
						]
					},
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						},
						"highlight": "{state}",
						"info": {
							"value": "{info}",
							"state": "{infoState}"
						}
					}
				}
			}
		};

		var tableContent_action_on_cell = {
			"sap.app": {
				"type": "card",
				"id": "test.card.actions.card14"
			},
			"sap.card": {
				"type": "Table",
				"header": {
					"title": "Table Card with Top 5 Products",
					"subtitle": "These are the top sellers this month",
					"icon": {
						"src": "sap-icon://sales-order"
					},
					"status": {
						"text": "5 of 100"
					}
				},
				"content": {
					"data": {
						"json": [{
								"Name": "Ergo Screen E-I",
								"Number": "356865544"
							},
							{
								"Name": "Laser Professional Eco",
								"Number": "356865544",
								"ActionUrl": "https://www.sap.com/corporate/en/company/innovation.html"
							}
						]
					},
					"row": {
						"columns": [{
								"title": "Name",
								"value": "{Name}"
							},
							{
								"title": "Number",
								"value": "{Number}",
								"actions": [{
									"type": "Navigation",
									"enabled": "{= ${ActionUrl}}",
									"parameters": {
										"url": "{ActionUrl}"
									}
								}]
							}
						]
					}
				}
			}
		};

		var oManifest_ActionsStrip = {
			"sap.app": {
				"id": "card.explorer.footer.manyButtons",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"company": {
							"email": "mail@mycompany.com",
							"emailSubject": "Subject"
						}
					}
				},
				"content": {
					"groups": [{
						"title": "Contact Details",
						"items": [{
							"label": "First Name",
							"value": "{firstName}"
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
							"text": "Disabled",
							"overflowPriority": "High",
							"actions": [{
								"enabled": false,
								"type": "Custom",
								"parameters": {
									"method": "approve"
								}
							}]
						},
						{
							"buttonType": "Transparent",
							"text": "Enabled: {= !${company/email} }",
							"actions": [{
								"type": "Navigation",
								"enabled": "{= !${company/email} }",
								"parameters": {
									"url": "mailto:{company/email}?subject={company/emailSubject}"
								}
							}]
						}
					]
				}
			}
		};

		var oManifestListCardRequest = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card8",
				"type": "card"
			},
			"sap.card": {
				"actions": [{
					"type": "Navigation",
					"parameters": {
						"url": "https://www.sap.com"
					}
				}],
				"type": "List",
				"header": {
					"title": "List Card",
					"subtitle": "With static list items"
				},
				"content": {
					"data": {
						"json": [{
								"Name": "Comfort Easy"
							}]
					},
					"item": {
						"title": {
							"value": "{Name}"
						}
					}
				}
			}
		};

		var oManifestActionsStripCardAction = {
			"sap.app": {
				"id": "card.explorer.footer.manyButtons",
				"type": "card"
			},
			"sap.card": {
				"actions": [{
					"type": "Navigation",
					"parameters": {
						"url": "https://www.sap.com"
					}
				}],
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"company": {
							"email": "mail@mycompany.com",
							"emailSubject": "Subject"
						}
					}
				},
				"content": {
					"groups": [{
						"title": "Contact Details",
						"items": [{
							"label": "First Name",
							"value": "{firstName}"
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
							"text": "Navigate",
							"overflowPriority": "High",
							"actions": [{

							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
							}]
						}
					]
				}
			}
		};

		async function testActionOnContentUrl(oManifest, assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardLContent = this.oCard.getCardContent(),
				oCardHeader = this.oCard.getCardHeader();

			// Assert
			assert.ok(oCardLContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.ok(oCardHeader.getDomRef().querySelector(".sapFCardHeaderMainPart").classList.contains("sapFCardSectionClickable"), "Card Header main part has clickable class");

			//Act
			oCardLContent.firePress();
			oCardHeader.firePress();

			await nextUIUpdate();

			//Assert
			assert.strictEqual(oActionSpy.callCount, 2, "Card Content and header are clicked and action event is fired twice");

			// Cleanup
			oStubOpenUrl.restore();
			oActionSpy.restore();
		}

		QUnit.module("CardActions API", {
			beforeEach: function () {
				this.oActions = new CardActions();
			},
			afterEach: function () {
				this.oActions.destroy();
			}
		});

		QUnit.test("Resolving binding path with custom bindingPathResolver", function (assert) {
			// Arrange
			var stubResolver = sinon.stub().returns("/custom/resolved/path");
			this.oActions.setBindingPathResolver(stubResolver);
			var oFakeEvent = {
				getSource: function () {
					return {
						getBindingContext: function () {}
					};
				}
			};

			// Act
			var sPath = this.oActions._resolveBindingPath(oFakeEvent);

			// Assert
			assert.strictEqual(sPath, "/custom/resolved/path", "Custom binding path resolver should be used when provided");
			assert.ok(stubResolver.calledWith(oFakeEvent), "Custom binding path resolver should be called with the action event");
		});

		QUnit.test("Unknown action type", function (assert) {
			// Arrange
			var oCard = new Card();
			this.oActions.setCard(oCard);
			var oLogSpy = this.spy(Log, "error");

			// Act
			this.oActions.fireAction({}, "Unknown Type", {});

			// Assert
			assert.ok(
				oLogSpy.calledWith("Unknown action type 'Unknown Type'. Expected one of " + Object.values(CardActionType).join(", "), sinon.match.any, "sap.ui.integration.widgets.Card"),
				"Error should be logged when attempted to fire unknown action"
			);

			// Clean up
			oCard.destroy();
		});

		QUnit.module("Navigation Action - List Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("List should be actionable", async function (assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oManifest_ListCard_CONTENT_ACTION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Active, "Card list item is actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");

			//Act
			oCardListItems[0].firePress();
			await nextUIUpdate();

			// Assert
			assert.ok(oActionSpy.callCount === 1, "Card List Item is clicked");

			// Cleanup
			oStubOpenUrl.restore();
			oActionSpy.restore();
		});

		QUnit.test("Static Data - List should be actionable", async function (assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Request);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Active, "Card list item is actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");

			//Act
			oCardListItems[0].firePress();
			await nextUIUpdate();

			// Assert
			assert.ok(oActionSpy.callCount === 1, "Card List Item is clicked");

			// Cleanup
			oStubOpenUrl.restore();
			oActionSpy.restore();
		});

		QUnit.test("Action enabled/disabled in template", async function (assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oManifest_ListCard_Action_Enabled);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			//Act
			oCardListItems[3].firePress();
			await nextUIUpdate();

			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[2].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[3].getType(), ListType.Active, "Card list item is actionable");
			assert.strictEqual(oCardListItems[4].getType(), ListType.Active, "Card list item is actionable");

			assert.ok(oActionSpy.callCount, "Card List item is clicked");

			//Clean up
			oStubOpenUrl.restore();
			oActionSpy.restore();
		});

		QUnit.test("No actions available", async function (assert) {
			// Arrange
			var oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Actions);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();
			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oAttachNavigationSpy.callCount, 0, "_attachAction should not be called");

			//Clean up
			oAttachNavigationSpy.restore();
		});

		QUnit.test("No action type available", async function (assert) {
			// Arrange
			var oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_Actions_Missing_Type);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();
			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oAttachNavigationSpy.callCount, 0, "_attachAction should not be called");

			//Clean up
			oAttachNavigationSpy.restore();
		});

		QUnit.module("Navigation Action - Object Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});


		QUnit.test("Object content should be actionable - url", async function (assert) {
			await testActionOnContentUrl.call(this, objectContent_url, assert);
		});

		QUnit.test("On pressing link, action should be fired", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(objectContent_url);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oObjContent = this.oCard.getCardContent();

			//Act
			var oLink = Element.closestTo(oObjContent.$().find(".sapMLnk")[0]);
			oLink.firePress();

			await nextUIUpdate();

			// Assert
			assert.ok(oObjContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.ok(oActionSpy.callCount === 1, "Link is clicked and action event is fired");

			// Cleanup
			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.test("Disabled actions should also disable links", async function (assert) {
			// Act
			this.oCard.setManifest(objectContent_url);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();

			//Act
			var oLink = Element.closestTo(oContent.$().find(".sapMLnk")[1]);
			assert.strictEqual(oLink.getEnabled(), false, "Link is disabled");
		});

		QUnit.test("Pressing a field with type 'action' should fire an action", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(objectContent_url);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();

			//Act
			var oLink = Element.closestTo(oContent.$().find("a:contains('Book a meeting')")[0]);
			assert.strictEqual(oLink.getEnabled(), true, "Link is enabled");
			oLink.firePress();

			await nextUIUpdate();

			// Assert
			assert.ok(oContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.ok(oActionSpy.callCount === 1, "Field with type='action' is clicked and action event is fired");

			// Cleanup
			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.module("Action Handlers", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Submit action handler", async function (assert) {
			var oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
				oSpyActionHandler = this.spy(SubmitAction.prototype, "execute");

			// Setup
			this.oCard.setManifest(oManifestActionSubmit);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const mEventArguments = {
				card: this.oCard,
				host: null,
				action: {
					type: CardActionType.Submit
				},
				parameters: {
					param1: "test"
				},
				source: this.oCard.getCardContent()
			};

			// Act
			CardActions.fireAction(mEventArguments);
			await nextUIUpdate();

			assert.ok(oStubRequest.called, "DataProvider's getData should have been called.");
			assert.ok(oSpyActionHandler.called, "Submit Action's handler should have been called.");
			assert.deepEqual(oSpyActionHandler.thisValues[0].getParameters(), mEventArguments.parameters, "Submit Action's handler should have been called with the event configuration.");
		});

		QUnit.test("Custom action handler", async function (assert) {
			var oSpyActionHandler = this.spy(CustomAction.prototype, "execute"),
				oActionFnSpy = this.spy();

			// Setup
			this.oCard.setManifest(oManifestActionSubmit);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const mEventArguments = {
				card: this.oCard,
				host: null,
				action: {
					type: CardActionType.Custom,
					action: oActionFnSpy
				},
				parameters: {
					param1: "test"
				},
				source: this.oCard.getCardContent()
			};

			var fnActionAssert = (oEvent) => {
				// Assert - the Custom action type also provides formData (CardActions.fireAction)
				assert.deepEqual(oEvent.getParameter("formData"), this.oCard.getModel("form").getData(), "The 'formData' parameter is passed for Custom actions.");
				assert.strictEqual(oEvent.getParameter("type"), CardActionType.Custom, "The action type is Custom.");
			};
			this.oCard.attachAction(fnActionAssert);

			// Act
			CardActions.fireAction(mEventArguments);
			await nextUIUpdate();

			// Assert
			assert.ok(oSpyActionHandler.called, "Custom Action's handler should have been called.");
			assert.ok(oActionFnSpy.calledWith(this.oCard, this.oCard.getCardContent()), "The custom action function is called with the card and the source.");
		});

		QUnit.test("Submit action handler at the Host", async function (assert) {
			var oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
				oSpyActionHandler = this.spy(SubmitAction.prototype, "execute"),
				oHostActionHandlerSpy1 = this.spy(),
				oHost1 = new Host({
					action: oHostActionHandlerSpy1
				}),
				oHostActionHandlerSpy2 = this.spy(function (oEvent) {
					oEvent.preventDefault();
				}),
				oHost2 = new Host({
					action: oHostActionHandlerSpy2
				});

			// Setup
			this.oCard.setManifest(oManifestActionSubmit);
			this.oCard.setHost(oHost1);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const mEventArguments = {
				card: this.oCard,
				host: oHost1,
				action: {
					type: CardActionType.Submit
				},
				parameters: {
					param1: "test"
				},
				source: this.oCard.getCardContent()
			};
			// Act
			CardActions.fireAction(mEventArguments);
			await nextUIUpdate();

			// Assert
			assert.ok(oHostActionHandlerSpy1.calledOnce, "Host's action handler should have been called");
			assert.ok(oStubRequest.calledOnce, "DataProvider's getData should have been called.");
			assert.ok(oSpyActionHandler.calledOnce, "Submit Action's handler should have been called.");
			assert.deepEqual(oSpyActionHandler.thisValues[0].getParameters(), mEventArguments.parameters, "Submit Action's handler should have been called with the event configuration.");

			// Act
			this.oCard.setHost(oHost2);
			mEventArguments.host = oHost2;
			CardActions.fireAction(mEventArguments);
			await nextUIUpdate();

			// Assert
			assert.ok(oHostActionHandlerSpy2.calledOnce, "Host's action handler should have been called");
			assert.ok(oSpyActionHandler.calledOnce, "Submit Action's handler should be skipped this time.");
		});

		QUnit.module("Card API", {
			beforeEach: function () {
				this.oCard = new Card();

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("When preventing an action within action handler, no further processing of that action should be done", async function (assert) {
			var done = assert.async(2),
				oCardFireActionSpy = sinon.spy(this.oCard, "fireAction"),
				oFurtherProcessingSpy = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Arrange
			this.oCard.attachEvent("action", function (oEvent) {
				// Act
				oEvent.preventDefault();
				done();

				setTimeout(function () {
					// Assert
					assert.strictEqual(oCardFireActionSpy.returned(), false, "Event fired from Card was prevented");
					assert.strictEqual(oFurtherProcessingSpy.notCalled, true, "Further processing has not happened");

					// Cleanup
					oCardFireActionSpy.restore();
					oFurtherProcessingSpy.restore();
					done();
				}, 300);
			});

			// Act
			this.oCard.setManifest(tableContent_action_on_cell);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			//Act
			var oLink = Element.closestTo(this.oCard.getCardContent().$().find(".sapMLnk:not(.sapMLnkDsbl)")[0]);
			qutils.triggerKeydown(oLink.getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("Trigger action", async function (assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "_openUrl").callsFake(function () {});

			this.oCard.setManifest(oIntegrationCardManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			// Act
			this.oCard.triggerAction({
				type: "Navigation",
				parameters: {
					url: "test-url"
				}
			});

			// Assert
			assert.ok(oActionSpy.calledOnce, "The action is triggered.");
			assert.ok(oStubOpenUrl.calledOnce, "The predefined action is executed.");
			assert.ok(oStubOpenUrl.calledWith("test-url"), "The predefined action has correct parameters.");

			// Clean
			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.module("ActionsStrip", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
			}
		});

		QUnit.test("Complex expression binding", async function (assert) {
			this.oCard.setManifest(oManifest_ActionsStrip);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			var oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
				aButtons = oActionsStrip._getToolbar().getContent();

			// Assert
			assert.notOk(aButtons[1].getEnabled(), "Button is disabled.");
			assert.notOk(aButtons[2].getEnabled(), "Button is disabled.");
		});

		QUnit.module("Navigation Action - Card", {
			beforeEach: function () {
				this.oCard = new Card({
					semanticRole: "ListItem",
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Interactive card should navigate", async function (assert) {

			var oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			this.oCard.setManifest(oManifestListCardRequest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			qutils.triggerKeydown(this.oCard.getDomRef(), KeyCodes.ENTER);
			await nextUIUpdate();

			assert.ok(this.oCard.getDomRef().getAttribute("tabindex"),"0", "Tabindex is added");
			assert.ok(this.oCard.getDomRef().classList["value"].indexOf("sapFCardInteractive") > -1, "Interactive styles are added");
			assert.ok(oStubOpenUrl.callCount === 1, "Navigate is called");

			oStubOpenUrl.restore();
		});

		QUnit.test("Interactive card should not fire press if interactive element inside card is pressed", async function (assert) {

			const oPressSpy = this.spy(this.oCard, "firePress"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			this.oCard.setManifest(oManifestActionsStripCardAction);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const oActionsStrip = this.oCard.getCardFooter().getActionsStrip(),
				aItems = oActionsStrip._getToolbar().getContent();

			assert.ok(this.oCard.getDomRef().getAttribute("tabindex"),"0", "Tabindex is added");
			assert.ok(this.oCard.getDomRef().classList["value"].indexOf("sapFCardInteractive") > -1, "Interactive styles are added");

			const aIds = this.oCard.getDomRef().getAttribute("aria-describedby").split(" ");
			assert.strictEqual(document.getElementById(aIds[0]).innerText, oRbIntegration.getText("ARIA_DESCRIPTION_CARD_TYPE_OBJECT"), "aria text for card type is correct");
			assert.strictEqual(document.getElementById(aIds[1]).innerText, oRbF.getText("ARIA_ACTIVATE_CARD"), "aria text for card activation is correct");

			qutils.triggerKeydown(aItems[1].getDomRef(), KeyCodes.ENTER);
			await nextUIUpdate();

			assert.ok(oPressSpy.callCount === 0, "Press is not fired");
			assert.ok(oStubOpenUrl.callCount === 1, "Only action of button is executed");

			oPressSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.test("Action should not fire when text is selected", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			this.oCard.setManifest(oManifestListCardRequest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oHeaderDom = this.oCard.getCardHeader().getDomRef().querySelector(".sapFCardHeaderMainPart");

			// Simulate text selection in the header
			var oRange = document.createRange();
			var oTextNode = oHeaderDom.childNodes[0];
			if (oTextNode && oTextNode.nodeType === Node.TEXT_NODE) {
				oRange.selectNodeContents(oTextNode);
			} else {
				oRange.selectNodeContents(oHeaderDom);
			}
			var oSelection = window.getSelection();
			oSelection.removeAllRanges();
			oSelection.addRange(oRange);

			// Try to trigger the header action
			qutils.triggerKeydown(oHeaderDom, KeyCodes.ENTER);
			await nextUIUpdate();

			assert.strictEqual(oActionSpy.callCount, 0, "Action should NOT be fired when text is selected");
			assert.strictEqual(oStubOpenUrl.callCount, 0, "Navigation should NOT be executed when text is selected");

			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.module("Enabled Property Without Action Type", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("List item without action should not be actionable", async function (assert) {
			const oManifest = {
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Test Card"
					},
					"content": {
						"data": {
							"json": [
								{ "Name": "Item 1" }
							]
						},
						"item": {
							"title": "{Name}"
						}
					}
				}
			};

			this.oCard.setManifest(oManifest);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const oContent = this.oCard.getCardContent();
			const oListItem = oContent.getInnerList().getItems()[0];

			assert.strictEqual(oListItem.getType(), ListType.Inactive, "List item should be inactive when no action is configured");
		});

		QUnit.test("List item with enabled:false should not be actionable even with action type", async function (assert) {
			const oManifest = {
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Test Card"
					},
					"content": {
						"data": {
							"json": [
								{ "Name": "Item 1", "url": "http://sap.com" }
							]
						},
						"item": {
							"title": "{Name}",
							"actions": [{
								"type": "Navigation",
								"enabled": false,
								"parameters": {
									"url": "{url}"
								}
							}]
						}
					}
				}
			};

			this.oCard.setManifest(oManifest);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const oContent = this.oCard.getCardContent();
			const oListItem = oContent.getInnerList().getItems()[0];

			assert.strictEqual(oListItem.getType(), ListType.Inactive, "List item should be inactive when action has enabled:false");
		});

		QUnit.test("List item with actions should be active", async function (assert) {
			const oManifest = {
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Test Card"
					},
					"content": {
						"data": {
							"json": [
								{ "Name": "Item 1", "url": "http://sap.com" }
							]
						},
						"item": {
							"title": "{Name}",
							"actions": [{
								"type": "Navigation",
								"parameters": {
									"url": "{url}"
								}
							}]
						}
					}
				}
			};

			this.oCard.setManifest(oManifest);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const oContent = this.oCard.getCardContent();
			const oListItem = oContent.getInnerList().getItems()[0];

			assert.strictEqual(oListItem.getType(), ListType.Active, "List item should be active when action is configured");
		});

		QUnit.test("Object content field with enabled:true without type should be enabled", async function (assert) {
			const oManifest = {
				"sap.card": {
					"type": "Object",
					"header": {
						"title": "Test Card"
					},
					"content": {
						"groups": [{
							"items": [{
								"label": "Website",
								"value": "www.sap.com",
								"type": "link",
								"actions": [{
									"enabled": true
								}]
							}]
						}]
					}
				}
			};

			this.oCard.setManifest(oManifest);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const oContent = this.oCard.getCardContent();
			const oLink = Element.closestTo(oContent.$().find(".sapMLnk")[0]);

			assert.ok(oLink.getEnabled(), "Link should be enabled when action has enabled:true");
		});
	}
);