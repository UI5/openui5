/* global QUnit, sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Extension",
	"sap/ui/test/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustrationPool"
], function(
	Log,
	Card,
	Extension,
	nextUIUpdate,
	nextCardReadyEvent,
	IllustratedMessageType,
	IllustrationPool
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Extension Instantiated by a Card", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Initialization", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"content": {
					"item": {
						"title": "{Name}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// assert
		assert.ok(this.oCard.getAggregation("_extension"), "The extension is created successfully.");
	});

	QUnit.test("Changing manifest from one with extension to one without extension", async function (assert) {
		// arrange
		var oManifest1 = {
				"sap.app": {
					"id": "sap.ui.integration.test"
				},
				"sap.card": {
					"type": "List",
					"extension": "./extensions/Extension1",
					"data": {
						"extension": {
							"method": "getData"
						}
					},
					"content": {
						"item": {
							"title": "{Name}"
						}
					}
				}
			},
			oManifest2 = {
				"sap.app": {
					"id": "sap.ui.integration.test"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": []
					},
					"content": {
						"item": {
							"title": "{Name}"
						}
					}
				}
			};

		// act
		this.oCard.setManifest(oManifest1);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// act
		this.oCard.setManifest(oManifest2);

		await nextCardReadyEvent(this.oCard);

		assert.notOk(!!this.oCard.getAggregation("_extension"), "The extension should be destroyed.");
	});

	QUnit.test("Extension providing data on card level", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"content": {
					"item": {
						"title": "{city}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var aItems = this.oCard.getCardContent().getInnerList().getItems();

		// assert
		assert.ok(aItems.length, "The data request on card level is successful.");
	});

	QUnit.test("Extension providing data on header level", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"header": {
					"data": {
						"extension": {
							"method": "getDataForHeader"
						}
					},
					"title": "{title}"
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// assert
		assert.ok(this.oCard.getCardHeader().getTitle(), "The data request on header level is successful.");
	});

	QUnit.test("Extension providing data on content level", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"content": {
					"data": {
						"extension": {
							"method": "getDataForContent"
						}
					},
					"item": {
						"title": "{city}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var aItems = this.oCard.getCardContent().getInnerList().getItems();

		// assert
		assert.ok(aItems.length, "The data request on content level is successful.");
	});

	QUnit.test("Extension providing data for a Filter", async function (assert) {
		// arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"populationDensity": {
							"value": "hi",
							"item": {
								"template": {
									"key": "{key}",
									"title": "{title}"
								}
							},
							"data": {
								"extension": {
									"method": "getDataForFilter"
								}
							}
						}
					}
				},
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"content": {
					"item": {
						"title": "{city}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar");
		assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

		var oFilter = oFilterBar._getFilters()[0];

		assert.strictEqual(oFilter._getSelect().getSelectedKey(), "hi", "property binding works");
		assert.strictEqual(oFilter._getSelect().getItems()[2].getKey(), "lo", "option has the expected key");
	});

	QUnit.test("Extension making request with custom dataType", async function (assert) {
		// arrange
		var oServer = sinon.createFakeServer({
				autoRespond: true
			});

		oServer.respondImmediately = true;

		oServer.respondWith(/.*\/some\/url/, function (oXhr) {
			oXhr.respond(
				200,
				{
					"Content-Type": "application/xml"
				},
				'<CitySet> <City Name="Paris"/> <City Name="Berlin" /> </CitySet>'
			);
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"content": {
					"data": {
						"extension": {
							"method": "requestWithCustomDataType"
						}
					},
					"item": {
						"title": "{city}"
					}
				}
			}
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var aItems = this.oCard.getCardContent().getInnerList().getItems();

		// assert
		assert.ok(aItems.length, "The data request is successful.");

		oServer.restore();

	});

	QUnit.test("Extension making card request for filters", async function (assert) {
		// arrange
		var oServer = sinon.createFakeServer({
				autoRespond: true
			});

		oServer.respondImmediately = true;

		oServer.respondWith(/.*\/filter\/url/, function (oXhr) {
			oXhr.respond(
				200,
				[{ key: "hi", value: "High" },
				{ key: "mi", value: "Middle" },
				{ key: "lo", value: "Low" }]
			);
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"configuration": {
					"filters": {
						"populationDensity": {
							"value": "hi",
							"item": {
								"template": {
									"key": "{key}",
									"title": "{title}"
								}
							},
							"data": {
								"extension": {
									"method": "requestFilterData"
								}
							}
						}
					}
				},
				"content": {
					"data": {
						"extension": {
							"method": "getDataForContent"
						}
					},
					"item": {
						"title": "{city}"
					}
				}
			  }
		});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var aItems = this.oCard.getCardContent().getInnerList().getItems();
		await nextUIUpdate();

		// assert
		assert.ok(aItems.length, "The data request is successful.");

		oServer.restore();

	});

	QUnit.module("Custom Formatters", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "sap.ui.integration.test"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/Extension1",
						"data": {
							"extension": {
								"method": "getData"
							}
						},
						"content": {
							"item": {
								"title": "{= extension.formatters.toUpperCase(${city}) }"
							}
						}
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Formatting the title", async function (assert) {
		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFirstItem = this.oCard.getCardContent().getInnerList().getItems()[0];

		// assert
		assert.strictEqual(oFirstItem.getTitle(), "BERLIN", "The formatter successfully transformed the title to upper case characters.");
	});

	QUnit.test("setFormatters method", async function (assert) {
		// arrange
		var oErrorSpy = sinon.spy(Log, "error");

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		this.oCard.getAggregation("_extension").setFormatters({
			toUpperCase: function (sValue) {
				return sValue.toUpperCase() + " New";
			}
		});

		// assert
		assert.ok(oErrorSpy.called, "An error is logged");

		oErrorSpy.restore();
	});

	QUnit.test("setFormatters method before the extension is attached to a card", function (assert) {
		// arrange
		var oErrorSpy = sinon.spy(Log, "error");
		var oExtension = new Extension();
		var oFormatters = {
			toUpperCase: function (sValue) {
				return sValue.toUpperCase();
			}
		};

		// act
		var oResult = oExtension.setFormatters(oFormatters);

		// assert
		assert.strictEqual(oExtension.getFormatters(), oFormatters, "The formatters are stored on the extension.");
		assert.notOk(oErrorSpy.called, "No error is logged when formatters are set before the card is available.");
		assert.strictEqual(oResult, oExtension, "The method returns the extension instance for chaining.");

		// clean up
		oErrorSpy.restore();
		oExtension.destroy();
	});

	QUnit.test("Formatters are local to card instance", async function (assert) {
		// arrange
		var oCard2 = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "sap.ui.integration.test.card2"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/Extension2",
						"content": {
							"item": {
								"title": "{= extension.formatters.toUpperCase2(${city}) }"
							}
						}
					}
				}
			});

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// act
		oCard2.placeAt(DOM_RENDER_LOCATION);
		var oBindingNamespaces = this.oCard.getBindingNamespaces();

		await nextCardReadyEvent(oCard2);

		// assert
		assert.notDeepEqual(oBindingNamespaces, oCard2.getBindingNamespaces(), "Namespaces contain different functions for both cards");
		assert.deepEqual(this.oCard.getBindingNamespaces(), oBindingNamespaces, "Namespace of the first card remains unchanged");

		// clean up
		oCard2.destroy();
	});

	QUnit.module("Extension Lifecycle", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "test"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/ExtensionSample",
						"content": {
							"item": {}
						}
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Method onCardReady is called once on card initialization", async function (assert) {
		// arrange
		var onCardReadyStub = this.stub(Extension.prototype, "onCardReady");

		await nextCardReadyEvent(this.oCard);

		assert.ok(onCardReadyStub.calledOnce, "The onCardReady event is called once.");
	});

	QUnit.test("Method resolveDestination inside onCardReady does not throw an error", function (assert) {
		// arrange
		var done = assert.async();
		var onCardReadyStub = this.stub(Extension.prototype, "onCardReady");

		onCardReadyStub.callsFake(function () {
			this.oCard.resolveDestination("test");

			assert.ok(true, "There is no error when calling resolveDestination.");
			done();
		}.bind(this));
	});

	QUnit.test("Method loadDependencies is called once on card initialization", async function (assert) {
		// arrange
		var loadDependenciesStub = this.stub(Extension.prototype, "loadDependencies");

		await nextCardReadyEvent(this.oCard);

		// assert
		assert.ok(loadDependenciesStub.calledOnce, "'loadDependencies' is called once.");
	});

	QUnit.test("Card waits for the loadDependencies promise before it is ready", async function (assert) {
		// arrange
		var fnResolveDependencies;
		var bReadyFired = false;
		var pDependencies = new Promise(function (resolve) {
			fnResolveDependencies = resolve;
		});
		this.stub(Extension.prototype, "loadDependencies").returns(pDependencies);

		this.oCard.attachEventOnce("_ready", function () {
			bReadyFired = true;
		});

		// act - give the card time to initialize as far as it can while dependencies are pending
		await new Promise(function (resolve) { setTimeout(resolve, 100); });

		// assert - the card must not be ready while the dependencies promise is pending
		assert.notOk(bReadyFired, "The card is not ready while the loadDependencies promise is pending.");
		assert.notOk(this.oCard.isReady(), "isReady returns false while the loadDependencies promise is pending.");

		// act - resolve the dependencies
		fnResolveDependencies();

		await nextCardReadyEvent(this.oCard);

		// assert - the card becomes ready only after the promise resolves
		assert.ok(this.oCard.isReady(), "The card is ready after the loadDependencies promise resolves.");
	});

	QUnit.test("Default loadDependencies implementation resolves immediately", async function (assert) {
		// arrange
		var oExtension = new Extension();

		// act
		var pDependencies = oExtension.loadDependencies();

		// assert
		assert.ok(pDependencies instanceof Promise, "'loadDependencies' returns a Promise.");

		var vResult = await pDependencies;
		assert.strictEqual(vResult, undefined, "The default 'loadDependencies' promise resolves with no value.");

		// clean up
		oExtension.destroy();
	});

	QUnit.test("Card awaits an overridden loadDependencies promise which loads real dependencies", async function (assert) {
		// arrange
		var bDependenciesLoaded = false;
		this.stub(Extension.prototype, "loadDependencies").callsFake(function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					bDependenciesLoaded = true;
					resolve();
				}, 100);
			});
		});

		// act
		await nextCardReadyEvent(this.oCard);

		// assert
		assert.ok(bDependenciesLoaded, "The overridden 'loadDependencies' promise is awaited before the card is ready.");
		assert.ok(this.oCard.isReady(), "The card is ready after the overridden 'loadDependencies' promise resolves.");
	});

	QUnit.module("Use translations from inside the extension", {
		beforeEach: function () {
			this.fnOnCardReadyStub = this.stub(Extension.prototype, "onCardReady");

			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "test",
						"i18n": "cardWithTranslationsCustomCounter/i18n/i18n.properties"
					},
					"sap.card": {
						"type": "List",
						"extension": "./extensions/ExtensionSample"
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Call getTranslatedText in onCardReady", function (assert) {
		// arrange
		var done = assert.async();

		this.fnOnCardReadyStub.callsFake(function () {
			assert.strictEqual(this.oCard.getTranslatedText("SUBTITLE"), "Some subtitle", "The translation for SUBTITLE is correct.");
			done();
		}.bind(this));

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Validation", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "sap.ui.integration.test"
					},
					"sap.card": {
						"type": "Object",
						"extension": "./extensions/Extension1",
						"data": {
							"extension": {
								"method": "getData"
							}
						},
						"content": {
							"groups": [{
								"items": [{
									"id": "e-mail",
									"label": "E-mail",
									"type": "TextArea",
									"rows": 1,
									"placeholder": "e-mail",
									"validations": [{
											"required": true
										},
										{
											"validate": "extension.validateEmail",
											"message": "You should enter valid e-mail.",
											"type": "Warning"
										}
									]
								}]
							}]
						}
					}
				}
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("validation method", async function (assert) {
		// arrange
		var bValid = false;

		// act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		bValid = this.oCard.getAggregation("_extension").validateEmail("Text");
		assert.strictEqual(bValid, false, "E-mail is not valid");

		bValid = this.oCard.getAggregation("_extension").validateEmail("my@mail.com");
		assert.strictEqual(bValid, true, "E-mail is valid");
	});

	QUnit.test("No data IllustratedMessage set by extension binding", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.NoData"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "loadData"
					}
				},
				"configuration": {
					"messages": {
						"noData": {
							"type": "{/IMType}",
							"title": "{/IMTitle}",
							"description": "{/IMDescription}",
							"size": "{/IMSize}"
						}
					}
				},
				"header": {},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{title}"
					},
					"maxItems": "{maxItems}"
				}
			}
		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

		// Assert
		assert.strictEqual(oMessage.getIllustrationType(), IllustratedMessageType.UnableToLoad, "The no data message type set by expression binding is correct");
		assert.strictEqual(oMessage.getDescription(), "Test", "The no data message description set by expression binding is correct");
		assert.strictEqual(oMessage.getTitle(), "No Data", "The no data message title set by expression binding is correct");
		assert.strictEqual(oMessage.getIllustrationSize(), "Auto", "The no data message size set by expression binding is correct");
	});

	QUnit.test("No data IllustratedMessage set by extension binding with 'tnt' set", async function (assert) {
		// Arrange
		var oTntSet = {
			setFamily: "tnt",
			setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
		};

		// register tnt illustration set
		IllustrationPool.registerIllustrationSet(oTntSet, false);

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.NoData"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "loadData"
					}
				},
				"configuration": {
					"messages": {
						"noData": {
							"type": "{/IMTntType}",
							"title": "{/IMTitle}",
							"description": "{/IMDescription}",
							"size": "{/IMSize}"
						}
					}
				},
				"header": {},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{title}"
					},
					"maxItems": "{maxItems}"
				}
			}

		});
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

		// Assert
		assert.strictEqual(oMessage.getIllustrationType(), "tnt-Tools", "The no data message type set by expression binding is correct");
		assert.strictEqual(oMessage.getDescription(), "Test", "The no data message description set by expression binding is correct");
		assert.strictEqual(oMessage.getTitle(), "No Data", "The no data message title set by expression binding is correct");
		assert.strictEqual(oMessage.getIllustrationSize(), "Auto", "The no data message size set by expression binding is correct");
	});

	QUnit.test("Card facade methods are proxied to the card", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "List",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"content": {
					"item": {
						"title": "{Name}"
					}
				}
			}
		});

		this.oCard.placeAt(DOM_RENDER_LOCATION);
		this.oCard.attachAction((oEvent) => oEvent.preventDefault()); // prevent default action handling to avoid side effects in tests
		await nextCardReadyEvent(this.oCard);

		const oExtension = this.oCard.getAggregation("_extension");
		const oCardFacade = oExtension.getCard();

		const aCardFacadeMethods = [
			{ name: "getId", params: [] },
			{ name: "getDomRef", params: [] },
			{ name: "setVisible", params: ["bVisible"], testArgs: [false] },
			{ name: "getParameters", params: [] },
			{ name: "getResolvedParameters", params: [] },
			{ name: "getCombinedParameters", params: [] },
			{ name: "getManifestEntry", params: ["sPath"], testArgs: ["/sap.app/id"] },
			{ name: "resolveDestination", params: ["sKey"], testArgs: ["testDestination"] },
			{ name: "request", params: ["oSettings"], testArgs: [{ url: "sap.com"}] },
			{ name: "refresh", params: [] },
			{ name: "refreshData", params: [] },
			{ name: "showMessage", params: ["sMessage", "sType", "bAutoClose"], testArgs: ["Test message", "Information", false] },
			{ name: "resolveUrl", params: ["sUrl"], testArgs: ["test/url"] },
			{ name: "getRuntimeUrl", params: ["sUrl"], testArgs: ["test/url"] },
			{ name: "getTranslatedText", params: ["sKey", "aArgs", "bIgnoreKeyFallback"], testArgs: ["TEST_KEY"] },
			{ name: "getModel", params: ["sName"] },
			{ name: "triggerAction", params: ["oAction"], testArgs: [{ type: "Navigation", parameters: { url: "test" } }] },
			{ name: "addActionDefinition", params: [] },
			{ name: "removeActionDefinition", params: [] },
			{ name: "insertActionDefinition", params: [] },
			{ name: "getActionDefinitions", params: [] },
			{ name: "indexOfActionDefinition", params: [] },
			{ name: "destroyActionDefinitions", params: [] },
			{ name: "showLoadingPlaceholders", params: ["eCardArea"], testArgs: ["Content"] },
			{ name: "hideLoadingPlaceholders", params: ["eCardArea"], testArgs: ["Content"] },
			{ name: "showCard", params: ["oParameters"], testArgs: [{ childCardKey: "someKey"}] },
			{ name: "hide", params: [] },
			{ name: "getOpener", params: [] },
			{ name: "validateControls", params: [] },
			{ name: "showBlockingMessage", params: ["oSettings"], testArgs: [{ type: "Error", title: "Test" }] },
			{ name: "hideBlockingMessage", params: [] },
			{ name: "getBlockingMessage", params: [] }
		];

		aCardFacadeMethods.forEach((oMethodInfo) => {
			const { name: sMethodName, params: aParams, testArgs: aTestArgs = [] } = oMethodInfo;

			const oSpy = sinon.spy(this.oCard, sMethodName);

			oCardFacade[sMethodName](...aTestArgs);

			assert.ok(oSpy.calledOnce, `Card method '${sMethodName}' with params [${aParams.join(', ')}] was called when facade method was called`);
			assert.ok(oSpy.calledWith(...aTestArgs), `Card method '${sMethodName}' was called with the expected arguments`);

			oSpy.restore();
		});
	});
});
