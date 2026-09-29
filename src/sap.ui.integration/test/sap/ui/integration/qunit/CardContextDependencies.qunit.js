/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host",
	"qunit/testResources/nextCardManifestReadyEvent",
	"qunit/testResources/nextCardManifestAppliedEvent",
	"sap/base/Log"
], function (
	Card,
	Host,
	nextCardManifestReadyEvent,
	nextCardManifestAppliedEvent,
	Log
) {
	"use strict";

	// The SampleExtension lives under test-resources; map a namespace so the card can load it.
	sap.ui.loader.config({
		paths: {
			"contextLoadingTest": "test-resources/sap/ui/integration/cardcontent/contextLoading"
		}
	});

	const oManifestContextInParams = {
		"sap.app": {
			"id": "test.contextDeps.params",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sample/currentUser/id}"
					},
					"supplierId": {
						"value": "{context>/sample/supplier/id/value}"
					}
				}
			},
			"header": {
				"title": "Card Title"
			}
		}
	};

	const oManifestDuplicates = {
		"sap.app": {
			"id": "test.contextDeps.duplicates",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sample/currentUser/id}"
					},
					"userIdCopy": {
						"value": "{context>/sample/currentUser/id}"
					}
				}
			},
			"header": {
				"title": "Card Title"
			}
		}
	};

	const oManifestNoContext = {
		"sap.app": {
			"id": "test.contextDeps.noContext",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"maxItems": {
						"value": 5
					}
				}
			},
			"header": {
				"title": "Simple Card"
			}
		}
	};

	const oManifestMultipleInOneParam = {
		"sap.app": {
			"id": "test.contextDeps.multipleInParam",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"combined": {
						"value": "{context>/sample/supplier/title/value} in {context>/sample/category/title/value}"
					}
				}
			}
		}
	};

	const oManifestFalsePositive = {
		"sap.app": {
			"id": "test.contextDeps.falsePositive",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"note": {
						"value": "This provides context> for the user"
					}
				}
			}
		}
	};

	const oManifestIgnoreBinding = {
		"sap.app": {
			"id": "test.contextDeps.ignoreBinding",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sample/currentUser/id}",
						"ignoreBinding": true
					}
				}
			}
		}
	};

	const oManifestExpressionBinding = {
		"sap.app": {
			"id": "test.contextDeps.expression",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"fullName": {
						"value": "{= ${context>/sample/firstName} + ' ' + ${context>/sample/lastName} }"
					}
				}
			}
		}
	};

	const oManifestComplexExpressions = {
		"sap.app": {
			"id": "test.contextDeps.complexExpressions",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "{= ${context>/sample/department/title}.length > 0 ? ${context>/sample/currentUser/name} : 'N/A' }",
				"subtitle": "Budget: {= format.currency(${context>/sample/currentUser/budget}, 'EUR', {currencyCode:false}) }"
			},
			"content": {
				"item": {
					"description": "Note the text 'context>/not/a/binding' here is literal and must not be detected"
				}
			}
		}
	};

	const oManifestContextInHeaderAndContent = {
		"sap.app": {
			"id": "test.contextDeps.headerAndContent",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Tasks for {context>/sample/currentUser/name}",
				"subtitle": "Department: {context>/sample/department/title}"
			},
			"content": {
				"data": {
					"request": {
						"url": "/api/tasks?user={context>/sample/currentUser/id}"
					}
				},
				"item": {
					"title": "{title}"
				}
			}
		}
	};

	const oManifestNestedInParameterObject = {
		"sap.app": {
			"id": "test.contextDeps.nestedParamObject",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"config": {
						"value": {
							"endpoint": "/api/{context>/sample/tenant/id}/users",
							"headers": {
								"Authorization": "Bearer {context>/sample/auth/token}"
							}
						}
					}
				}
			}
		}
	};

	const oManifestNestedInContentArray = {
		"sap.app": {
			"id": "test.contextDeps.nestedContentArray",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"request": {
						"url": "/api/data",
						"headers": {
							"X-Tenant": "{context>/sample/tenant/id}"
						},
						"parameters": {
							"filter": "{context>/sample/currentUser/department}"
						}
					}
				},
				"item": {
					"title": "{title}"
				}
			}
		}
	};

	const oManifestNestedInHeaderObject = {
		"sap.app": {
			"id": "test.contextDeps.nestedHeaderObject",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Dashboard",
				"status": {
					"text": "{context>/sample/notifications/count} new"
				},
				"icon": {
					"src": "{context>/sample/currentUser/avatar}"
				}
			}
		}
	};

	const oManifestPathsWithoutLeadingSlash = {
		"sap.app": {
			"id": "test.contextDeps.noLeadingSlash",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>sample/currentUser/id}"
					}
				}
			},
			"header": {
				"title": "Tasks for {context>sample/currentUser/name}"
			}
		}
	};

	QUnit.module("getContextDependencies", {
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Returns empty array when called before manifest is ready", function (assert) {
		// Arrange
		const oLogSpy = this.spy(Log, "error");
		this.oCard = new Card({
			manifest: oManifestContextInParams
		});

		// Act - call before manifest is ready - should return empty array
		const aDeps = this.oCard.getContextDependencies();

		// Assert
		assert.deepEqual(aDeps, [], "Should return empty array when manifest is not ready");
		assert.ok(oLogSpy.calledOnce, "Error logged when called before manifest ready");
		assert.ok(oLogSpy.calledWith("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.widgets.Card"), "Correct error message");
	});

	QUnit.test("Returns empty array when the card is destroyed", async function (assert) {
		// Arrange
		this.oCard = new Card({
			manifest: oManifestContextInParams
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		// Sanity check that dependencies are found while the manifest is ready
		assert.strictEqual(this.oCard.getContextDependencies().length, 2, "Precondition: dependencies are found before destroy");

		const oLogSpy = this.spy(Log, "error");

		// Act
		this.oCard.destroy();
		const aDeps = this.oCard.getContextDependencies();

		// Assert
		assert.deepEqual(aDeps, [], "Should return empty array when the card is destroyed");
		assert.ok(oLogSpy.calledOnce, "Error logged when called on a destroyed card");
	});

	QUnit.test("Returns context paths when manifest is ready", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestContextInParams
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 2, "Should find 2 context paths");
		assert.ok(aDeps.indexOf("/sample/currentUser/id") > -1, "Should contain userId path");
		assert.ok(aDeps.indexOf("/sample/supplier/id/value") > -1, "Should contain supplierId path");
	});

	QUnit.test("Handles expression bindings in parameters", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestExpressionBinding
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 2, "Should find 2 context paths from expression binding");
		assert.ok(aDeps.indexOf("/sample/firstName") > -1, "Should contain firstName path");
		assert.ok(aDeps.indexOf("/sample/lastName") > -1, "Should contain lastName path");
	});

	QUnit.test("Handles complex expression bindings with multiple context paths", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestComplexExpressions
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 3, "Should find 3 context paths from complex expressions");
		assert.ok(aDeps.indexOf("/sample/department/title") > -1, "Should contain department path from ternary condition");
		assert.ok(aDeps.indexOf("/sample/currentUser/name") > -1, "Should contain user name path from ternary result");
		assert.ok(aDeps.indexOf("/sample/currentUser/budget") > -1, "Should contain budget path from format expression");
	});

	QUnit.test("Deduplicates paths", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestDuplicates
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 1, "Should find 1 unique context path despite multiple parameters using it");
		assert.strictEqual(aDeps[0], "/sample/currentUser/id", "Should contain the deduplicated path");
	});

	QUnit.test("Returns empty array when no context references exist", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestNoContext
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.deepEqual(aDeps, [], "Should return empty array when no context refs");
	});

	QUnit.test("Multiple context refs in one parameter value", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestMultipleInOneParam
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 2, "Should find 2 context paths from one parameter");
		assert.ok(aDeps.indexOf("/sample/supplier/title/value") > -1, "Should contain supplier path");
		assert.ok(aDeps.indexOf("/sample/category/title/value") > -1, "Should contain category path");
	});

	QUnit.test("Ignores literal 'context>' text that is not a binding path", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestFalsePositive
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.deepEqual(aDeps, [], "Should return empty array when 'context>' appears as literal text without a path");
	});

	QUnit.test("Respects ignoreBinding flag", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestIgnoreBinding
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.deepEqual(aDeps, [], "Should skip parameters with ignoreBinding: true");
	});

	QUnit.test("Finds context references in header and content sections", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestContextInHeaderAndContent
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 3, "Should find 3 context paths from header and content");
		assert.ok(aDeps.indexOf("/sample/currentUser/name") > -1, "Should contain user name path from header title");
		assert.ok(aDeps.indexOf("/sample/department/title") > -1, "Should contain department path from header subtitle");
		assert.ok(aDeps.indexOf("/sample/currentUser/id") > -1, "Should contain user id path from content data URL");
	});

	QUnit.test("Finds context nested in object within parameters", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestNestedInParameterObject
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 2, "Should find 2 context paths nested in parameter object");
		assert.ok(aDeps.indexOf("/sample/tenant/id") > -1, "Should contain tenant id path from nested endpoint");
		assert.ok(aDeps.indexOf("/sample/auth/token") > -1, "Should contain auth token path from nested headers");
	});

	QUnit.test("Finds context nested in objects within content", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestNestedInContentArray
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 2, "Should find 2 context paths nested in content objects");
		assert.ok(aDeps.indexOf("/sample/tenant/id") > -1, "Should contain tenant id path from request headers");
		assert.ok(aDeps.indexOf("/sample/currentUser/department") > -1, "Should contain department path from request parameters");
	});

	QUnit.test("Finds context nested in objects within header", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestNestedInHeaderObject
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 2, "Should find 2 context paths nested in header objects");
		assert.ok(aDeps.indexOf("/sample/notifications/count") > -1, "Should contain notifications path from status object");
		assert.ok(aDeps.indexOf("/sample/currentUser/avatar") > -1, "Should contain avatar path from icon object");
	});

	QUnit.test("Handles context paths without leading slash", async function (assert) {
		this.oCard = new Card({
			manifest: oManifestPathsWithoutLeadingSlash
		});
		this.oCard.startManifestProcessing();
		await nextCardManifestReadyEvent(this.oCard);

		const aDeps = this.oCard.getContextDependencies();

		assert.strictEqual(aDeps.length, 2, "Should find 2 context paths without leading slash");
		assert.ok(aDeps.indexOf("/sample/currentUser/id") > -1, "Should normalize and contain userId path");
		assert.ok(aDeps.indexOf("/sample/currentUser/name") > -1, "Should normalize and contain userName path");
	});

	const oManifestContextLoading = {
		"sap.app": {
			"id": "test.contextDeps.loading",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sample/user/id}"
					}
				}
			},
			"header": {
				"title": "Tasks for {parameters>userId}"
			},
			"content": {
				"item": {
					"title": "{title}"
				}
			}
		}
	};

	const oManifestContextLoadingWithData = {
		"sap.app": {
			"id": "test.contextDeps.loadingWithData",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sample/user/id}"
					}
				}
			},
			"header": {
				"title": "Tasks for {parameters>userId}"
			},
			"content": {
				"data": {
					"request": {
						"url": "/api/items"
					}
				},
				"item": {
					"title": "{title}"
				}
			}
		}
	};

	const oManifestContextLoadingWithExtension = {
		"sap.app": {
			"id": "test.contextDeps.loadingWithExtension",
			"type": "card"
		},
		"sap.card": {
			"extension": "module:contextLoadingTest/SampleExtension",
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sample/user/id}"
					}
				}
			},
			"header": {
				"title": "Tasks for {parameters>userId}"
			},
			"content": {
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"item": {
					"title": "{title}"
				}
			}
		}
	};

	const oManifestNoContextLoading = {
		"sap.app": {
			"id": "test.contextDeps.noContextLoading",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Static Title"
			},
			"content": {
				"item": {
					"title": "{title}"
				}
			}
		}
	};

	const oManifestContextLoadingWithFilter = {
		"sap.app": {
			"id": "test.contextDeps.loadingWithFilter",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sample/user/id}"
					}
				},
				"filters": {
					"category": {
						"type": "Select",
						"value": "{context>/sample/user/id}",
						"data": {
							"request": {
								"url": "/api/categories"
							}
						},
						"item": {
							"template": {
								"key": "{key}",
								"title": "{title}"
							}
						}
					}
				}
			},
			"header": {
				"title": "Tasks for {parameters>userId}"
			},
			"content": {
				"item": {
					"title": "{title}"
				}
			}
		}
	};

	const oManifestContextLoadingWithDestinationAndIcon = {
		"sap.app": {
			"id": "test.contextDeps.loadingWithDestinationAndIcon",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"destinations": {
					"myDestination": { "name": "myDestination" }
				},
				"parameters": {
					"categoryId": {
						"value": "{context>/sample/category/id}"
					}
				}
			},
			"header": {
				"icon": { "src": "sap-icon://product" },
				"title": "Category {context>/sample/category/id}"
			},
			"content": {
				"data": {
					"request": {
						"url": "{{destinations.myDestination}}/Categories({parameters>/categoryId})/Products"
					},
					"path": "/value/"
				},
				"item": {
					"title": "{ProductName}"
				}
			}
		}
	};

	function nextHeaderReadyOrAlreadyReady(oCard) {
		return new Promise(function (resolve) {
			const oHeader = oCard.getCardHeader();
			if (oHeader && oHeader.isReady()) {
				resolve();
				return;
			}
			oCard.attachEventOnce("_headerReady", resolve);
		});
	}

	QUnit.module("Context loading placeholders", {
		beforeEach: function () {
			this.oHost = new Host();
			this.pContextCalled = new Promise(function (res) {
				this._fnContextCalled = res;
			}.bind(this));
			this.oHost.getContextValue = function () {
				this._fnContextCalled();
				return new Promise(function (resolve) {
					this._fnResolveContext = resolve;
				}.bind(this));
			}.bind(this);

			this.oCard = new Card({
				manifest: oManifestContextLoading,
				host: this.oHost
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Header and content show loading placeholders while context is pending", async function (assert) {
		// Act
		this.oCard.startManifestProcessing();
		await this.pContextCalled;

		// Assert
		const oHeader = this.oCard.getCardHeader();
		const oContent = this.oCard.getCardContent();

		assert.ok(oHeader, "Header exists during context resolution");
		assert.ok(oContent, "Content exists during context resolution");
		assert.ok(oHeader.isLoading(), "Header reports isLoading() true while context is pending");
		assert.ok(oContent.isLoading(), "Content reports isLoading() true while context is pending");

		// Unblock the card to avoid a hanging promise
		this._fnResolveContext(null);
	});

	QUnit.test("Loading placeholders are hidden after context resolves", async function (assert) {
		// Act
		this.oCard.startManifestProcessing();
		await this.pContextCalled;
		this._fnResolveContext(42);
		await nextCardManifestAppliedEvent(this.oCard);
		await nextHeaderReadyOrAlreadyReady(this.oCard);

		// Assert
		const oHeader = this.oCard.getCardHeader();
		assert.notOk(oHeader.isLoading(), "Header is no longer loading after context resolved");
	});

	QUnit.test("Data request is not triggered before context resolves", async function (assert) {
		// Arrange — use a manifest with a content data.request
		this.oCard.destroy();
		this.pContextCalled = new Promise(function (res) {
			this._fnContextCalled = res;
		}.bind(this));
		this.oHost.getContextValue = function () {
			this._fnContextCalled();
			return new Promise(function (resolve) {
				this._fnResolveContext = resolve;
			}.bind(this));
		}.bind(this);
		this.oCard = new Card({
			manifest: oManifestContextLoadingWithData,
			host: this.oHost
		});
		const oFetchSpy = this.spy(this.oHost, "fetch");

		// Act
		this.oCard.startManifestProcessing();
		await this.pContextCalled;

		// Assert — loading placeholder shown, no data request fired yet
		const oContent = this.oCard.getCardContent();
		assert.ok(oContent.isLoading(), "Content shows loading placeholder before context resolves");
		assert.ok(oFetchSpy.notCalled, "Host.fetch not called while context is pending");

		// Unblock the card
		this._fnResolveContext(null);
	});

	QUnit.test("Extension onCardReady is called exactly once for a card with context", async function (assert) {
		// Arrange — an extension card with a context dependency
		this.oCard.destroy();
		this.pContextCalled = new Promise(function (res) {
			this._fnContextCalled = res;
		}.bind(this));
		this.oHost.getContextValue = function () {
			this._fnContextCalled();
			return new Promise(function (resolve) {
				this._fnResolveContext = resolve;
			}.bind(this));
		}.bind(this);
		this.oCard = new Card({
			manifest: oManifestContextLoadingWithExtension,
			host: this.oHost
		});

		// Act — start processing, resolve the context, then wait for the card to apply
		this.oCard.startManifestProcessing();
		await this.pContextCalled;
		this._fnResolveContext("42");
		await nextCardManifestAppliedEvent(this.oCard);

		// Assert — the loading phase and the final application share one setup,
		// so the extension must receive onCardReady only once.
		const oExtension = this.oCard.getAggregation("_extension");
		assert.ok(oExtension, "Extension is created");
		assert.strictEqual(oExtension.getOnCardReadyCount(), 1, "onCardReady is called exactly once");
	});

	QUnit.test("Card with destinations and a header icon src renders placeholders during context resolution and applies after", async function (assert) {
		// Arrange — a card combining a destination-based data request, a header
		// icon with src, and context dependencies. The icon formatter must exist
		// during the loading phase so the header icon can render its placeholder
		// without an error, while no data request fires before context resolves.
		this.oCard.destroy();
		this.pContextCalled = new Promise(function (res) {
			this._fnContextCalled = res;
		}.bind(this));
		this.oHost.getContextValue = function () {
			this._fnContextCalled();
			return new Promise(function (resolve) {
				this._fnResolveContext = resolve;
			}.bind(this));
		}.bind(this);
		this.oCard = new Card({
			manifest: oManifestContextLoadingWithDestinationAndIcon,
			host: this.oHost
		});
		const oFetchSpy = this.spy(this.oHost, "fetch");

		// Act — start processing and wait for the context request
		this.oCard.startManifestProcessing();
		await this.pContextCalled;

		// Assert — header and content show placeholders, no data request yet
		const oHeader = this.oCard.getCardHeader();
		const oContent = this.oCard.getCardContent();
		assert.ok(oHeader, "Header is created during context resolution");
		assert.ok(oHeader.isLoading(), "Header shows loading placeholder while context is pending");
		assert.ok(oContent.isLoading(), "Content shows loading placeholder while context is pending");
		assert.ok(oFetchSpy.notCalled, "No data request fired while context is pending");

		// Act — resolve the context and let the card apply
		this._fnResolveContext("2");
		await nextCardManifestAppliedEvent(this.oCard);
		await nextHeaderReadyOrAlreadyReady(this.oCard);

		// Assert — the header applied without error and is no longer loading
		assert.notOk(this.oCard.getCardHeader().isLoading(), "Header is no longer loading after context resolved");
	});

	QUnit.test("Destroying the card while context is pending throws no error and fires no data request", async function (assert) {
		// Arrange — an extension card so a data request would fire once ready
		this.oCard.destroy();
		this.pContextCalled = new Promise(function (res) {
			this._fnContextCalled = res;
		}.bind(this));
		this.oHost.getContextValue = function () {
			this._fnContextCalled();
			return new Promise(function (resolve) {
				this._fnResolveContext = resolve;
			}.bind(this));
		}.bind(this);
		this.oCard = new Card({
			manifest: oManifestContextLoadingWithExtension,
			host: this.oHost
		});
		const oFetchSpy = this.spy(this.oHost, "fetch");

		// Act — destroy while the context is still pending
		this.oCard.startManifestProcessing();
		await this.pContextCalled;
		this.oCard.destroy();

		// Resolve the now-abandoned context and let any queued microtasks run
		this._fnResolveContext("42");
		await Promise.resolve();

		// Assert
		assert.ok(true, "No error is thrown when the card is destroyed mid-context");
		assert.ok(oFetchSpy.notCalled, "No data request is fired after destroy");
	});

	QUnit.module("Context loading — filter bar", {
		beforeEach: function () {
			this.oHost = new Host();
			this.pContextCalled = new Promise(function (res) {
				this._fnContextCalled = res;
			}.bind(this));
			this.oHost.getContextValue = function () {
				this._fnContextCalled();
				return new Promise(function (resolve) {
					this._fnResolveContext = resolve;
				}.bind(this));
			}.bind(this);

			this.oCard = new Card({
				manifest: oManifestContextLoadingWithFilter,
				host: this.oHost
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Filter bar shows loading placeholders while context is pending", async function (assert) {
		// Act
		this.oCard.startManifestProcessing();
		await this.pContextCalled;

		// Assert
		const oFilterBar = this.oCard.getAggregation("_filterBar");
		assert.ok(oFilterBar, "Filter bar exists during context resolution");
		const aFilters = oFilterBar._getFilters();
		assert.ok(aFilters.length > 0, "Filter bar has at least one filter");
		assert.ok(aFilters.every((oFilter) => oFilter.isLoading()), "All filters report isLoading() true while context is pending");

		// Unblock the card to avoid a hanging promise
		this._fnResolveContext(null);
	});

	QUnit.test("Filter data request is not triggered before context resolves", async function (assert) {
		// Arrange
		const oFetchSpy = this.spy(this.oHost, "fetch");

		// Act
		this.oCard.startManifestProcessing();
		await this.pContextCalled;

		// Assert
		assert.ok(oFetchSpy.notCalled, "Host.fetch not called while context is pending");

		// Unblock the card
		this._fnResolveContext(null);
	});

	QUnit.test("Filter bar is re-created with its data after context resolves", async function (assert) {
		// Act
		this.oCard.startManifestProcessing();
		await this.pContextCalled;
		this._fnResolveContext("1");
		await nextCardManifestAppliedEvent(this.oCard);

		// Assert
		const oFilterBar = this.oCard.getAggregation("_filterBar");
		assert.ok(oFilterBar, "Filter bar exists after context resolves");
	});

	QUnit.module("Context loading — no regression for cards without context", {
		beforeEach: function () {
			this.oCard = new Card({
				manifest: oManifestNoContextLoading
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Static header does not report isLoading() when there is no context or data", async function (assert) {
		this.oCard.startManifestProcessing();
		await nextCardManifestAppliedEvent(this.oCard);
		await nextHeaderReadyOrAlreadyReady(this.oCard);
		const oHeader = this.oCard.getCardHeader();
		assert.notOk(oHeader.isLoading(), "Static header without data or context is not loading");
	});
});
