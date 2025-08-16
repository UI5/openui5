/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/widgets/Card",
	"sap/base/Log",
	"sap/ui/integration/Host",
	"sap/m/IllustratedMessageType",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextCardErrorEvent",
	"sap/ui/test/utils/nextUIUpdate"
],
	function(
		Library,
		Card,
		Log,
		Host,
		IllustratedMessageType,
		nextCardReadyEvent,
		nextCardErrorEvent,
		nextUIUpdate
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var sResourcePath = "qunit/testResources/cardWithDestinations/",
			sImagesResourcePath = "qunit/testResources/images/",
			sBaseUrl = "test-resources/sap/ui/integration/",
			sNavigationUrl = "https://some.domain.com",
			sCardId = "test1",
			sInnerText = "Some text";

		var oManifest_Valid = {
			"sap.app": {
				"id": sCardId
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"contentDestination": {
							"name": "contentDestination"
						},
						"headerDestination": {
							"name": "headerDestination"
						},
						"imageDestination": {
							"name": "imageDestination"
						},
						"emptyDestination": {
							"name": "emptyDestination"
						},
						"navigationDestination": {
							"name": "navigationDestination"
						},
						"innerDestination": {
							"name": "innerDestination"
						}
					},
					"parameters": {
						"subtitle": {
							"value": "Subtitle 1"
						}
					}
				},
				"header": {
					"title": "{{destinations.innerDestination}} {title}",
					"subtitle": "{parameters>/subtitle/value}",
					"data": {
						"request": {
							"url": "{{destinations.headerDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.imageDestination}}/{Image}"
						},
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"city": "{{destinations.navigationDestination}}/{Name}",
									"empty": "{{destinations.emptyDestination}}/empty"
								}
							}
						]
					}
				}
			}
		};

		var oManifest_Invalid_Destinations = {
			"sap.app": {
				"id": sCardId
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "{title}",
					"data": {
						"request": {
							"url": "{{destinations.asyncDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.myDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.myDestination}}/{Image}"
						}
					}
				}
			}
		};

		var oManifest_Mixed_Valid_Invalid_Destinations = {
			"sap.app": {
				"id": sCardId
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"contentDestination": {
							"name": "contentDestination"
						},
						"headerDestination": {
							"name": "headerDestination"
						}
					}
				},
				"header": {
					"title": "{title}",
					"data": {
						"request": {
							"url": "{{destinations.headerDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.invalidDestination}}/{Image}"
						}
					}
				}
			}
		};

		var oManifest_DefaultUrl = {
			"sap.app": {
				"id": sCardId
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"test1": {
							"name": "Test1Name",
							"defaultUrl": "test1/url"
						},
						"test2": {
							"defaultUrl": "test2/url"
						},
						"test3": { }
					}
				}
			}
		};

		async function checkValidDestinations(assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			var aItems = this.oCard.getCardContent().getInnerList().getItems(),
				sFirstItemIcon = aItems[0].getIcon(),
				sExpectedIcon = sBaseUrl + "qunit/testResources/images/Woman_avatar_01.png",
				aActions = this.oCard.getCardContent().getConfiguration().item.actions;

			// Assert
			assert.ok(aItems.length, "The data request is successful.");
			assert.strictEqual(this.oCard.getCardHeader().getTitle(), sInnerText + " Card Title", "header destination is resolved successfully");
			assert.strictEqual(sFirstItemIcon, sExpectedIcon, "The icon path is correct.");

			assert.ok(aActions[0].parameters.city.indexOf(sNavigationUrl + sCardId) > -1, "Navigation destination is resolved successfully");
			assert.strictEqual(aActions[0].parameters.empty, "/empty", "Empty destination is resolved successfully");
		}

		async function checkInvalidDestinations(assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			// Assert
			assert.notOk(this.oCard.getCardContent().getInnerList().getItems().length, "The data request is unsuccessful.");

			assert.notOk(this.oCard.getCardHeader().getTitle(), "async destination is not resolved successfully");
		}

		async function checkValidResolveDestinationMethod(assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			const destination = await this.oCard.resolveDestination("contentDestination");

			assert.strictEqual(destination, sResourcePath, "destination is resolved successfully");
		}

		async function checkInvalidResolveDestinationMethod(assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			try {
				await this.oCard.resolveDestination("contentDestination");
			} catch (e) {
				assert.ok(true, "destination is not resolved");
			}
		}

		async function checkValidDestinationsAndParameters(assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);

			// Act - setting a parameter after the card is already processed
			this.oCard.setParameter("subtitle", "Subtitle 2");
			await nextCardReadyEvent(this.oCard);

			const aItems = this.oCard.getCardContent().getInnerList().getItems();
			const oHeader = this.oCard.getCardHeader();

			// Assert
			assert.ok(aItems.length, "The data request is successful.");
			assert.strictEqual(oHeader.getTitle(), sInnerText + " Card Title", "header destination is resolved successfully");
			assert.strictEqual(oHeader.getSubtitle(), "Subtitle 2", "subtitle parameter is resolved successfully");
		}

		QUnit.module("Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName, oCard) {
						switch (sDestinationName) {
							case "contentDestination":
							case "headerDestination":
								return sResourcePath;
							case "imageDestination":
								return sImagesResourcePath;
							case "emptyDestination":
								return "";
							case "navigationDestination":
								return sNavigationUrl + oCard.getManifestEntry("/sap.app/id");
							case "innerDestination":
								return sInnerText;
							default:
								Log.error("Unknown destination.");
								break;
						}
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_Valid,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oHost.destroy();
				this.oHost = null;
			}
		});

		QUnit.test("Resolve destinations", async function (assert) {
			await checkValidDestinations.call(this, assert);
		});

		QUnit.test("Card.resolveDestination method", async function (assert) {
			await checkValidResolveDestinationMethod.call(this, assert);
		});

		QUnit.test("Resolve destinations after late paramater change", async function (assert) {
			await checkValidDestinationsAndParameters.call(this, assert);
		});

		QUnit.module("Async Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName, oCard) {
						switch (sDestinationName) {
							case "contentDestination":
							case "headerDestination":
								return new Promise(function (resolve) {
									setTimeout(function () {
										resolve(sResourcePath);
									}, 10);
								});
							case "imageDestination":
								return sImagesResourcePath;
							case "emptyDestination":
								return new Promise(function (resolve) {
									setTimeout(function () {
										resolve("");
									}, 10);
								});
							case "navigationDestination":
								return new Promise(function (resolve) {
									setTimeout(function () {
										resolve(sNavigationUrl + oCard.getManifestEntry("/sap.app/id"));
									}, 10);
								});
							case "innerDestination":
								return new Promise(function (resolve) {
									setTimeout(function () {
										resolve(sInnerText);
									}, 10);
								});
							default:
								Log.error("Unknown destination.");
								break;
						}
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_Valid,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oHost.destroy();
				this.oHost = null;
			}
		});

		QUnit.test("Resolve destinations", async function (assert) {
			await checkValidDestinations.call(this, assert);
		});

		QUnit.test("Card.resolveDestination method", async function (assert) {
			await checkValidResolveDestinationMethod.call(this, assert);
		});

		QUnit.test("Resolve destinations after late paramater change", async function (assert) {
			await checkValidDestinationsAndParameters.call(this, assert);
		});

		QUnit.module("Invalid Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName) {
						// do nothing
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_Invalid_Destinations,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oHost.destroy();
				this.oHost = null;
			}
		});

		QUnit.test("Resolve destinations", async function (assert) {
			await checkInvalidDestinations.call(this, assert);
		});

		QUnit.test("Card.resolveDestination method", async function (assert) {
			await checkInvalidResolveDestinationMethod.call(this, assert);
		});

		QUnit.module("Mixed Valid and Invalid Destinations", {
			beforeEach: function () {
				this.oHost = new Host({
					resolveDestination: function(sDestinationName) {
						switch (sDestinationName) {
							case "contentDestination":
							case "headerDestination":
								return sResourcePath;
							default:
								Log.error("Unknown destination.");
								break;
						}
					}
				});

				this.oCard = new Card({
					"manifest": oManifest_Mixed_Valid_Invalid_Destinations,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oHost.destroy();
				this.oHost = null;
			}
		});

		QUnit.test("Resolve destinations", async function (assert) {
			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			var aItems = this.oCard.getCardContent().getInnerList().getItems(),
				sFirstItemIcon = aItems[0].getIcon();

			// Assert
			assert.ok(aItems.length, "The data request is successful.");

			assert.strictEqual(this.oCard.getCardHeader().getTitle(), "Card Title", "header destination is resolved successfully");

			// Assert
			assert.notOk(sFirstItemIcon, "The icon path is not resolved.");
		});

		QUnit.module("No Host", {
			beforeEach: function () {
				this.oCard = new Card({
					"manifest": oManifest_Valid,
					"baseUrl": sBaseUrl
				});
				this.oCard.setHost(this.oHost);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Resolve destinations", async function (assert) {
			await checkInvalidDestinations.call(this, assert);
		});

		QUnit.test("Card.resolveDestination method", async function (assert) {
			await checkInvalidResolveDestinationMethod.call(this, assert);
		});

		QUnit.module("Default Url", {
			beforeEach: function () {
				this.oCard = new Card({
					"manifest": oManifest_DefaultUrl,
					"host": this.oHost,
					"baseUrl": sBaseUrl
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Resolve destinations to default url", async function (assert) {
			// Arrange
			var oHost = new Host({
					resolveDestination: function() {
						return null;
					}
				});

			this.oCard.setHost(oHost);

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			var pTest1 = this.oCard.resolveDestination("test1"),
				pTest2 = this.oCard.resolveDestination("test2");

			const aResult = await Promise.all([pTest1, pTest2]);

			assert.strictEqual(aResult[0], "test1/url", "Default url for test1 is correct.");
			assert.strictEqual(aResult[1], "test2/url", "Default url for test1 is correct.");
		});

		QUnit.test("Resolves default url without host", async function (assert) {
			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			const sUrl = await this.oCard.resolveDestination("test1");
			assert.strictEqual(sUrl, "test1/url", "Default url for test1 is correct.");
		});

		QUnit.test("Missing default url and name", async function (assert) {
			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			try {
				await this.oCard.resolveDestination("test3");
			} catch (e) {
				assert.ok(true, "Fails to resolve destination without name or defaultUrl.");
			}
		});

		QUnit.module("Destinations in child cards defined in external manifest", {
			beforeEach: function () {
				const oMainCardManifest = {
					"sap.app": {
						"id": sCardId
					},
					"sap.card": {
						"type": "Object",
						"configuration": {
							"destinations": {
								"contentDestination": {
									"name": "contentDestination"
								}
							}
						},
						"header": {
							"title": "Main Card"
						},
						"content": {
							"groups": [{
								"items": [{
									"label": "Open Child Card",
									"value": "Open Child Card",
									"actions": [{
										"type": "ShowCard",
										"parameters": {
											"manifest": "childCardManifest.json"
										}
									}]
								}]
							}]
						}
					}
				};

				this.resolveDestinationSpy = sinon.spy(function(sDestinationName, oCard) {
						switch (sDestinationName) {
							case "contentDestination":
								return sResourcePath;
							case "headerDestination":
								return sResourcePath;
							case "childOwnContentDestination":
								return sResourcePath;
							default:
								throw new Error("Unknown destination: " + sDestinationName);
						}
					});

				this.oHost = new Host({
					resolveDestination: this.resolveDestinationSpy
				});

				this.oCard = new Card({
					manifest: oMainCardManifest,
					baseUrl: sBaseUrl,
					height: "500px",
					host: this.oHost
				});

				// Create a fake server to respond to GET requests for the child card manifest
				this.oServer = sinon.createFakeServer({
					respondImmediately: true,
					autoRespond: true
				});
				this.oServer.xhr.useFilters = true;
				this.oServer.xhr.addFilter(function(sMethod, sUrl) {
					return !sUrl.includes("childCardManifest.json");
				});
				this.oServer.respondWith("GET", new RegExp(sBaseUrl + "childCardManifest.json"), (xhr) => {
					xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(this.oChildCardManifest));
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oHost.destroy();
				this.oServer.restore();
				this.oServer.xhr.useFilters = false;
			}
		});

		QUnit.test("Child card with 'useMainDestinations' set", async function (assert) {
			// Arrange
			this.oChildCardManifest = {
				"sap.app": {
					"id": "childCard"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"useMainDestinations": true
					},
					"data": {
						"request": {
							"url": "{{mainDestinations.contentDestination}}/header.json"
						}
					},
					"header": {
						"title": "{title}"
					},
					"content": {
						"groups": [{
							"title": "Child Card Content",
							"items": [{
								"title": "Title"
							}]
						}]
					}
				}
			};

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(this.resolveDestinationSpy.notCalled, "resolveDestination is not called yet.");

			// Act
			const oOpenChildCard = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];
			oOpenChildCard.firePress();

			const oChildCard = this.oCard.getDependents()[0].getContent()[0];
			await nextCardReadyEvent(oChildCard);
			await nextUIUpdate();

			// Assert
			assert.deepEqual(oChildCard._oDestinations._oConfiguration, this.oCard._oDestinations._oConfiguration, "Child card destinations configuration is inherited from the main card.");
			assert.strictEqual(oChildCard.getCardHeader().getTitle(), "Card Title", "Child card displays correct data.");
			assert.ok(this.resolveDestinationSpy.calledOnceWith("contentDestination", this.oCard), "resolveDestination was called once for content destination of the child card.");
		});

		QUnit.test("Child card with 'useMainDestinations' set and own destinations", async function (assert) {
			// Arrange
			const oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");
			const oLogSpy = this.spy(Log, "error");
			this.oChildCardManifest = {
				"sap.app": {
					"id": "childCard"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"useMainDestinations": true,
						"destinations": {
						}
					},
					"data": {
						"request": {
							"url": "{{mainDestinations.contentDestination}}/header.json"
						}
					},
					"header": {
						"title": "Child Card Title"
					},
					"content": {
						"groups": [{
							"title": "Child Card Content",
							"items": [{
								"title": "Title"
							}]
						}]
					}
				}
			};

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(this.resolveDestinationSpy.notCalled, "resolveDestination is not called yet.");

			// Act
			const oOpenChildCard = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];
			oOpenChildCard.firePress();

			await nextCardErrorEvent(this.oCard);
			await nextUIUpdate();

			const oBlockingMessage = this.oCard.getBlockingMessage();

			assert.strictEqual(oBlockingMessage.type, "Error", "Blocking message type is correct.");
			assert.strictEqual(oBlockingMessage.title, oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"), "Blocking message title is correct.");
			assert.strictEqual(oBlockingMessage.description, oResourceBundle.getText("CARD_ERROR_CONFIGURATION_DESCRIPTION"), "Blocking message description is correct.");
			assert.strictEqual(oBlockingMessage.illustrationType, IllustratedMessageType.UnableToLoad, "Blocking message illustration type is correct.");
			assert.ok(oLogSpy.calledWith(
					oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"),
					sinon.match((oError) => {
						return oError.message === "Unsupported configuration: 'sap.card/configuration/useMainDestinations' is set to true, yet 'sap.card/configuration/destinations' is also defined in the card manifest."
						+ "Remove 'sap.card/configuration/destinations' from the card manifest and refer exclusively to the main card destinations.\n";
					}),
					"sap.ui.integration.widgets.Card"
				),
				"Error is logged."
			);
		});

		QUnit.test("Child card without 'useMainDestinations' set and own destinations (deprecated)", async function (assert) {
			// Arrange
			const oLogSpy = this.spy(Log, "error");
			this.oChildCardManifest = {
				"sap.app": {
					"id": "childCard"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"destinations": {
							"childOwnContentDestination": {
								"name": "childOwnContentDestination"
							}
						}
					},
					"data": {
						"request": {
							"url": "{{destinations.childOwnContentDestination}}/header.json"
						}
					},
					"header": {
						"title": "{title}"
					},
					"content": {
						"groups": [{
							"title": "Child Card Content",
							"items": [{
								"title": "Title"
							}]
						}]
					}
				}
			};

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(this.resolveDestinationSpy.notCalled, "resolveDestination is not called yet.");

			// Act
			const oOpenChildCard = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];
			oOpenChildCard.firePress();

			const oChildCard = this.oCard.getDependents()[0].getContent()[0];
			await nextCardReadyEvent(oChildCard);
			await nextUIUpdate();

			assert.notDeepEqual(oChildCard._oDestinations._oConfiguration, this.oCard._oDestinations._oConfiguration, "Child card destinations configuration is NOT inherited from the main card.");
			assert.ok(this.resolveDestinationSpy.calledOnceWith("childOwnContentDestination", oChildCard), "resolveDestination was called once for content destination of the child card.");
			assert.strictEqual(oChildCard.getCardHeader().getTitle(), "Card Title", "Child card displays correct data.");
			assert.ok(oLogSpy.calledWith(
					"The configuration 'sap.card/configuration/destinations' for child cards is deprecated since 1.140. "
					+ "Use the property 'sap.card/configuration/useMainDestinations' instead and refer to the main card destinations.",
					"sap.ui.integration.widgets.Card"
				),
				"Error is logged."
			);
		});

		QUnit.test("Child card using destinations through Extension", async function (assert) {
			// Arrange
			this.oChildCardManifest = {
				"sap.app": {
					"id": "childCard"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"useMainDestinations": true
					},
					"extension": "./qunit/testResources/cardWithDestinations/ChildDestinationsExtension",
					"data": {
						"extension": {
							"method": "getDataUsingDestinationsInRequest"
						}
					},
					"header": {
						"title": "{title}"
					},
					"content": {
						"groups": [{
							"title": "Child Card Content",
							"items": [{
								"title": "Title"
							}]
						}]
					}
				}
			};

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(this.resolveDestinationSpy.notCalled, "resolveDestination is not called yet.");

			// Act
			const oOpenChildCard = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];
			oOpenChildCard.firePress();

			const oChildCard = this.oCard.getDependents()[0].getContent()[0];
			await nextCardReadyEvent(oChildCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(oChildCard.getCardHeader().getTitle(), "Card Title", "Child card displays correct data.");
			assert.ok(this.resolveDestinationSpy.calledOnceWith("contentDestination", this.oCard), "resolveDestination was called once for content destination of the child card.");
		});

		QUnit.test("Child card using destinations through Extension - resolveDestination", async function (assert) {
			// Arrange
			this.oChildCardManifest = {
				"sap.app": {
					"id": "childCard"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"useMainDestinations": true
					},
					"extension": "./qunit/testResources/cardWithDestinations/ChildDestinationsExtension",
					"data": {
						"extension": {
							"method": "getDataUsingResolveDestination"
						}
					},
					"header": {
						"title": "{title}"
					},
					"content": {
						"groups": [{
							"title": "Child Card Content",
							"items": [{
								"title": "Title"
							}]
						}]
					}
				}
			};

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(this.resolveDestinationSpy.notCalled, "resolveDestination is not called yet.");

			// Act
			const oOpenChildCard = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];
			oOpenChildCard.firePress();

			const oChildCard = this.oCard.getDependents()[0].getContent()[0];
			await nextCardReadyEvent(oChildCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(oChildCard.getCardHeader().getTitle(), "Card Title", "Child card displays correct data.");
			assert.ok(this.resolveDestinationSpy.calledOnceWith("contentDestination", this.oCard), "resolveDestination was called once for content destination of the child card.");
		});

		QUnit.module("Destinations in child cards created by Paginator", {
			beforeEach: function () {
				this.oCard = new Card({
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);

				this.oServer = sinon.createFakeServer({
					autoRespond: true,
					respondImmediately: true
				});

				this.oServer.respondWith("GET", /fakeService\/getProducts/, function (oXhr) {
					const aDataItems = [];

					for (let i = 0; i < 77; i++) {
						aDataItems.push({
							ProductName: "Name " + i
						});
					}

					oXhr.respond(
						200,
						{
							"Content-Type": "application/json"
						},
						JSON.stringify({
							"value": aDataItems
						})
					);
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oServer.restore();
			}
		});

		QUnit.test("Destinations should be treated the same way as the main card's", async function (assert) {
			const oManifest = {
				"sap.app": {
					"id": "test.pagination.destinations"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"destinations": {
							"fakeService": {
								"name": "fakeService",
								"defaultUrl": "fakeService"
							}
						}
					},
					"data": {
						"request": {
							"url": "{{destinations.fakeService}}/getProducts"
						},
						"path": "/value"
					},
					"header": {
						"title": "Products"
					},
					"content": {
						"item": {
							"title": "{ProductName}"
						}
					},
					"footer": {
						"paginator": {
							"pageSize": 5
						}
					}
				}
			};
			this.oCard.setManifest(oManifest);
			const oLogSpy = this.spy(Log, "error");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Act
			this.oCard.getCardFooter().getAggregation("_showMore").$().trigger("tap");
			const oChildCard = this.oCard.getDependents()[0].getContent()[0];
			await nextCardReadyEvent(oChildCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(oChildCard.getCardContent().getInnerList().getItems().length, 77, "All items are loaded in the child card.");
			assert.ok(oLogSpy.notCalled, "No error is logged for the child card destinations.");
		});
	}
);
