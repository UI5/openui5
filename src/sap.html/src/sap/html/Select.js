/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/ui/core/EnabledPropagator", "sap/html/library"], function (HTMLElementBase, EnabledPropagator) {
	"use strict";

	const Select = HTMLElementBase.extend("sap.html.Select", {
		metadata: {
			"tag": "select",
			"properties": {
				"autocomplete": {
					"type": "sap.html.enums.InputAutocomplete",
					"mapping": "property"
				},
				"enabled": {
					"type": "boolean",
					"defaultValue": true,
					"mapping": {
						"type": "property",
						"to": "disabled",
						"formatter": "_mapEnabled"
					}
				},
				"multiple": {
					"type": "boolean",
					"mapping": "property"
				},
				"name": {
					"type": "string",
					"mapping": "property"
				},
				"required": {
					"type": "boolean",
					"mapping": "property"
				},
				"size": {
					"type": "int",
					"mapping": "property",
					"defaultValue": 0
				}
			},
			"associations": {
				"form": {
					"type": "sap.html.Form",
					"mapping": {
						"type": "property",
						"to": "form"
					}
				}
			}
		}
	});

	EnabledPropagator.call(Select.prototype);

	return Select;
});
