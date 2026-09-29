// Note: the HTML page 'CardHostContextLoading.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/integration/Host",
	"sap/ui/integration/widgets/Card",
	"sap/f/GridContainer",
	"sap/f/GridContainerItemLayoutData",
	"sap/m/Title",
	"sap/m/Text"
], function (Host, Card, GridContainer, GridContainerItemLayoutData, Title, Text) {
	"use strict";

	// Context values keyed by the requested path. Each path resolves after a
	// different delay so the staggered loading placeholders are clearly visible.
	var mContextValues = {
		"sample/currentUser/id": { value: "1", delay: 1500 },
		"sample/currentUser/name": { value: "Alice Cooper", delay: 1500 },
		"sample/supplier/id/value": { value: "3", delay: 4000 },
		"sample/supplier/title/value": { value: "New Orleans Cajun Delights", delay: 4000 },
		"sample/category/id/value": { value: "2", delay: 7000 },
		"sample/category/title/value": { value: "Condiments", delay: 7000 }
	};

	var oHost = new Host({
		resolveDestination: function (sName) {
			if (sName === "Northwind") {
				return "https://services.odata.org/V3/Northwind/Northwind.svc";
			}
		}
	});

	oHost.getContextValue = function (sPath) {
		return new Promise(function (resolve) {
			var oEntry = mContextValues[sPath];
			if (!oEntry) {
				resolve(undefined);
				return;
			}
			setTimeout(function () {
				resolve(oEntry.value);
			}, oEntry.delay);
		});
	};

	function makeCard(sId, oManifest, sBaseUrl) {
		return new Card({
			id: sId,
			manifest: oManifest,
			baseUrl: sBaseUrl,
			host: oHost,
			layoutData: new GridContainerItemLayoutData({ columns: 4 })
		});
	}

	// 1. Data request in the CARD (root) — depends on context.
	var oManifestCardData = {
		"sap.app": { "id": "test.contextLoading.cardData", "type": "card" },
		"sap.card": {
			"type": "List",
			"data": {
				"request": {
					"url": "{{destinations.Northwind}}/Products",
					"parameters": {
						"$format": "json",
						"$top": "5",
						"$filter": "SupplierID eq {parameters>/supplierId/value} and CategoryID eq {parameters>/categoryId/value}"
					}
				},
				"path": "/value/"
			},
			"configuration": {
				"destinations": { "Northwind": { "name": "Northwind" } },
				"parameters": {
					"supplierId": { "value": "{context>/sample/supplier/id/value}" },
					"categoryId": { "value": "{context>/sample/category/id/value}" }
				}
			},
			"header": {
				"title": "Data request in card",
				"subtitle": "Supplier {context>/sample/supplier/title/value}"
			},
			"content": {
				"item": { "title": "{ProductName}" }
			}
		}
	};

	// 2. Data request in the HEADER — must not fire before context is ready.
	var oManifestHeaderData = {
		"sap.app": { "id": "test.contextLoading.headerData", "type": "card" },
		"sap.card": {
			"type": "List",
			"configuration": {
				"destinations": { "Northwind": { "name": "Northwind" } },
				"parameters": {
					"supplierId": { "value": "{context>/sample/supplier/id/value}" }
				}
			},
			"header": {
				"type": "Numeric",
				"data": {
					"request": {
						"url": "{{destinations.Northwind}}/Suppliers({parameters>/supplierId/value})",
						"parameters": { "$format": "json" }
					}
				},
				"title": "Data request in header",
				"subtitle": "{CompanyName}",
				"mainIndicator": { "number": "{parameters>/supplierId/value}" }
			},
			"content": {
				"item": { "title": "static" },
				"data": { "json": [{ "title": "static row" }] }
			}
		}
	};

	// 3. Data request in the CONTENT — must not fire before context is ready.
	var oManifestContentData = {
		"sap.app": { "id": "test.contextLoading.contentData", "type": "card" },
		"sap.card": {
			"type": "List",
			"configuration": {
				"destinations": { "Northwind": { "name": "Northwind" } },
				"parameters": {
					"categoryId": { "value": "{context>/sample/category/id/value}" }
				}
			},
			"header": {
				"title": "Data request in content",
				"subtitle": "Category {context>/sample/category/title/value}"
			},
			"content": {
				"data": {
					"request": {
						"url": "{{destinations.Northwind}}/Categories({parameters>/categoryId/value})/Products",
						"parameters": { "$format": "json", "$top": "5" }
					},
					"path": "/value/"
				},
				"item": { "title": "{ProductName}" }
			}
		}
	};

	// 4. Header with NO data — context only in bound text; must still show loading.
	var oManifestHeaderNoData = {
		"sap.app": { "id": "test.contextLoading.headerNoData", "type": "card" },
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Tasks for {context>/sample/currentUser/name}",
				"subtitle": "User id {context>/sample/currentUser/id}"
			},
			"content": {
				"item": { "title": "{title}" },
				"data": { "json": [{ "title": "Row A" }, { "title": "Row B" }] }
			}
		}
	};

	// 5. Multiple contexts resolving at different times.
	var oManifestMultipleContexts = {
		"sap.app": { "id": "test.contextLoading.multiContext", "type": "card" },
		"sap.card": {
			"type": "List",
			"header": {
				"title": "{context>/sample/currentUser/name}",
				"subtitle": "{context>/sample/supplier/title/value} / {context>/sample/category/title/value}"
			},
			"content": {
				"item": { "title": "{title}" },
				"data": { "json": [{ "title": "Row 1" }, { "title": "Row 2" }] }
			}
		}
	};

	// 6. Component card with context. The context value is passed to the
	// component as a parameter; the component renders it once resolved.
	var oManifestComponent = {
		"_version": "2.0.0",
		"sap.app": { "id": "contextLoadingComponent", "type": "card" },
		"sap.ui5": {
			"rootView": {
				"viewName": "contextLoadingComponent.Main",
				"type": "XML",
				"id": "app"
			},
			"dependencies": {
				"minUI5Version": "2.0.0",
				"libs": { "sap.m": {}, "sap.ui.core": {} }
			}
		},
		"sap.card": {
			"type": "Component",
			"configuration": {
				"parameters": {
					"userName": { "value": "{context>/sample/currentUser/name}" }
				}
			},
			"header": {
				"title": "Component card",
				"subtitle": "User {context>/sample/currentUser/name}"
			}
		}
	};

	// 7. Card with extension using context (SuccessFactors-style).
	var oManifestExtension = {
		"sap.app": { "id": "test.contextLoading.extension", "type": "card" },
		"sap.card": {
			"extension": "module:test/cardcontent/contextLoading/SampleExtension",
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": { "value": "{context>/sample/currentUser/id}" }
				}
			},
			"header": {
				"title": "Extension card",
				"subtitle": "User id {context>/sample/currentUser/id}"
			},
			"content": {
				"item": { "title": "{title}" },
				"data": {
					"extension": { "method": "getData" }
				}
			}
		}
	};

	// 8. Card with FILTERS depending on context — the filter bar shows
	// loading placeholders and the filter data request does not fire
	// before the context is resolved.
	var oManifestFilterData = {
		"sap.app": { "id": "test.contextLoading.filterData", "type": "card" },
		"sap.card": {
			"type": "List",
			"configuration": {
				"destinations": { "Northwind": { "name": "Northwind" } },
				"parameters": {
					"categoryId": { "value": "{context>/sample/category/id/value}" }
				},
				"filters": {
					"supplier": {
						"type": "Select",
						"label": "Supplier",
						"value": "{context>/sample/supplier/id/value}",
						"data": {
							"request": {
								"url": "{{destinations.Northwind}}/Suppliers",
								"parameters": { "$format": "json", "$top": "5" }
							},
							"path": "/value/"
						},
						"item": {
							"template": {
								"key": "{SupplierID}",
								"title": "{CompanyName}"
							}
						}
					}
				}
			},
			"header": {
				"title": "Filters with context",
				"subtitle": "Category {context>/sample/category/title/value}"
			},
			"content": {
				"data": {
					"request": {
						"url": "{{destinations.Northwind}}/Categories({parameters>/categoryId/value})/Products",
						"parameters": { "$format": "json", "$top": "5" }
					},
					"path": "/value/"
				},
				"item": { "title": "{ProductName}" }
			}
		}
	};

	// 9. Card combining DESTINATIONS, a header ICON with src, and CONTEXT.
	// The header icon must render its loading placeholder while the context
	// resolves, which requires the icon formatter to exist early. The content
	// data request must not fire before the context is resolved.
	var oManifestDestinationIconContext = {
		"sap.app": { "id": "test.contextLoading.destinationIconContext", "type": "card" },
		"sap.card": {
			"type": "List",
			"configuration": {
				"destinations": { "Northwind": { "name": "Northwind" } },
				"parameters": {
					"categoryId": { "value": "{context>/sample/category/id/value}" }
				}
			},
			"header": {
				"icon": { "src": "sap-icon://product" },
				"title": "Destinations + icon + context",
				"subtitle": "Category {context>/sample/category/title/value}"
			},
			"content": {
				"data": {
					"request": {
						"url": "{{destinations.Northwind}}/Categories({parameters>/categoryId/value})/Products",
						"parameters": { "$format": "json", "$top": "5" }
					},
					"path": "/value/"
				},
				"item": { "title": "{ProductName}" }
			}
		}
	};

	var oGrid = new GridContainer({
		items: [
			makeCard("cardCardData", oManifestCardData),
			makeCard("cardHeaderData", oManifestHeaderData),
			makeCard("cardContentData", oManifestContentData),
			makeCard("cardHeaderNoData", oManifestHeaderNoData),
			makeCard("cardMultiContext", oManifestMultipleContexts),
			makeCard("cardComponent", oManifestComponent, "./cardcontent/contextLoadingComponent/"),
			makeCard("cardExtension", oManifestExtension),
			makeCard("cardFilterData", oManifestFilterData),
			makeCard("cardDestinationIconContext", oManifestDestinationIconContext)
		]
	});

	new Title({ text: "Cards show loading placeholders while host context resolves (staggered 1.5s / 4s / 7s)" }).placeAt("intro");
	new Text({ text: "No data request (card, header or content) fires before the context values are resolved." }).placeAt("intro");
	oGrid.placeAt("content");
});