/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"qunit/testResources/nextCardManifestReadyEvent"
], function (
	Card,
	nextCardManifestReadyEvent
) {
	"use strict";

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
		this.oCard = new Card({
			manifest: oManifestContextInParams
		});

		// Call before manifest is ready - should return empty array
		const aDeps = this.oCard.getContextDependencies();

		assert.deepEqual(aDeps, [], "Should return empty array when manifest is not ready");
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
});
