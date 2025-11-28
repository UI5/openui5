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
						"label": "General"
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
					"maxItems": {
						"manifestpath": "/sap.card/configuration/parameters/maxItems/value",
						"type": "integer",
						"allowDynamicValues": false,
						"allowSettings": false,
						"editableToUser": true,
						"visibleToUser": true,
						"visualization": {
							"type": "Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 10,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"Customer": {
						"manifestpath": "/sap.card/configuration/parameters/Customer/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.mock_request}}/Customers"
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"Employee": {
						"manifestpath": "/sap.card/configuration/parameters/Employee/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.mock_request}}/Employees"
								},
								"path": "/value"
							},
							"item": {
								"text": "{FirstName} {LastName}",
								"key": "{EmployeeID}",
								"additionalText": "{= ${EmployeeID} !== undefined ? ${Country} + ', ' +  ${Title} + ', ' + ${HomePhone} : ''}"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
