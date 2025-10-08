/*
 * ${copyright}
 */

// Provides class testdata.v4models.v4_01.Component
sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";

	return UIComponent.extend("testdata.v4models.v4_01.Component", {
		metadata: {
			manifest: {
				"_version": "2.0.0",
				"sap.app": {
					"id": "testdata.v4models.v4_01",
					"type": "application",

					"applicationVersion": {
						"version": "1.0.0"
					},

					"title": "V4 Models Test - Service Version 4.01",
					"description": "V4 Models Test - Service Version 4.01",

					"dataSources": {
						"v4_01" : {
							"uri" : "/path/to/odata/service/",
							"type" : "OData",
							"settings" : {
								"odataVersion" : "4.01"
							}
						}
					}
				},
				"sap.ui": {
					"technology": "UI5"
				},
				"sap.ui5": {
					"dependencies": {
						"minUI5Version": "2.0.0",
						"libs": {
							"sap.ui.core": {
								"minVersion": "1.142.0"
							}
						}
					},

					"models": {
						"v4_01": {
							"dataSource": "v4_01",
							"settings" : {
								"autoExpandSelect" : false,
								"operationMode" : "Server"
							}
						}
					}
				}
			}
		}
	});
});
