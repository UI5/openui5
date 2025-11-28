sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"generalGroup": {
						"type": "group",
						"label": "General",
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"cardTitle": {
						"manifestpath": "/sap.card/configuration/parameters/cardTitle/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"allowDynamicValues": true,
						"editableToUser": true,
						"visibleToUser": true
					},
					"separator1": {
						"type": "separator"
					},
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"label": "String Label",
						"translatable": true,
						"required": true,
						"editableToUser": true
					},
					"boolean": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"description": "Description",
						"label": "Boolean with Switch",
						"type": "boolean",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value",
						"type": "object",
						"label": "Object properties defined: value from Json list",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text01", "key": "key01", "type": "type01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "object": {"text": "text01", "key": "key01"}},
										{ "text": "text02", "key": "key02", "type": "type02", "url": "http://sap.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2 , "object": {"text": "text02", "key": "key02"}},
										{ "text": "text03", "key": "key03", "type": "type03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3 , "object": {"text": "text03", "key": "key03"}},
										{ "text": "text04", "key": "key04", "type": "type04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4 , "object": {"text": "text04", "key": "key04"}},
										{ "text": "text05", "key": "key05", "type": "type05", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5 , "object": {"text": "text05", "key": "key05"}},
										{ "text": "text06", "key": "key06", "type": "type06", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6 , "object": {"text": "text06", "key": "key06"}},
										{ "text": "text07", "key": "key07", "type": "type05", "url": "http://sap.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7 , "object": {"text": "text07", "key": "key07"}},
										{ "text": "text08", "key": "key08", "type": "type06", "url": "https://sap.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8 , "object": {"text": "text08", "key": "key08"}}
									]
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "Key"
							},
							"icon": {
								"label": "Icon",
								"type": "icon",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"color": "{iconcolor}"
								}
							},
							"type": {
								"label": "Type",
								"type": "string",
								"values": {
									"data": {
										"json": {
											"values": [
												{ "text": "Type 01", "key": "type01"},
												{ "text": "Type 02", "key": "type02"},
												{ "text": "Type 03", "key": "type03"},
												{ "text": "Type 04", "key": "type04"},
												{ "text": "Type 05", "key": "type05"},
												{ "text": "Type 06", "key": "type06"}
											]
										},
										"path": "/values"
									},
									"item": {
										"text": "{text}",
										"key": "{key}"
									}
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"translatable": true,
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"
								}
							},
							"url": {
								"label": "URL",
								"defaultValue": "http://",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"label": "URL Link",
									"filterProperty": "url",
									"defaultFilterOperator": "StartsWith"
								},
								"cell": {
									"type": "Link",
									"href": "{url}"
								}
							},
							"editable": {
								"label": "Editable",
								"defaultValue": false,
								"type": "boolean"
							},
							"int": {
								"label": "Integer",
								"defaultValue": 0,
								"type": "int",
								"formatter": {
									"minIntegerDigits": 1,
									"maxIntegerDigits": 6,
									"emptyString": ""
								},
								"column": {
									"hAlign": "Center",
									"width": "5rem",
									"label": "Integer",
									"filterProperty": "int",
									"defaultFilterOperator": "EQ",
									"filterType": "sap.ui.model.type.Integer"
								}
							},
							"number": {
								"label": "Number",
								"defaultValue": 0.5,
								"type": "number",
								"formatter": {
									"decimals": 1,
									"style":"short"
								}
							},
							"object": {
								"label": "Object",
								"type": "object",
								"column": {
									"hAlign": "Center",
									"width": "10rem"
								}
							}
						},
						"addButtonText": "Add a new step"
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
