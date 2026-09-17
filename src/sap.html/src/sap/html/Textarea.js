/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/ui/core/EnabledPropagator", "sap/html/library"], function (HTMLElementBase, EnabledPropagator) {
	"use strict";

	const Textarea = HTMLElementBase.extend("sap.html.Textarea", {
		metadata: {
			"tag": "textarea",
			"properties": {
				"autocomplete": {
					"type": "sap.html.enums.InputAutocomplete",
					"mapping": "property"
				},
				"cols": {
					"type": "int",
					"mapping": "property",
					"defaultValue": 20
				},
				"dirname": {
					"type": "string",
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
				"maxlength": {
					"type": "int",
					"mapping": "property"
				},
				"minlength": {
					"type": "int",
					"mapping": "property"
				},
				"name": {
					"type": "string",
					"mapping": "property"
				},
				"placeholder": {
					"type": "string",
					"mapping": "property"
				},
				"readonly": {
					"type": "boolean",
					"mapping": "property"
				},
				"required": {
					"type": "boolean",
					"mapping": "property"
				},
				"rows": {
					"type": "int",
					"mapping": "property",
					"defaultValue": 2
				},
				"wrap": {
					"type": "sap.html.enums.Wrapping",
					"mapping": "property"
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

	EnabledPropagator.call(Textarea.prototype);

	return Textarea;
});
