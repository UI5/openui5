/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/ui/core/EnabledPropagator", "sap/html/library"], function (HTMLElementBase, EnabledPropagator) {
	"use strict";

	const Fieldset = HTMLElementBase.extend("sap.html.Fieldset", {
		metadata: {
			"tag": "fieldset",
			"properties": {
				"enabled": {
					"type": "boolean",
					"defaultValue": true,
					"mapping": {
						"type": "property",
						"to": "disabled",
						"formatter": "_mapEnabled"
					}
				},
				"name": {
					"type": "string",
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

	EnabledPropagator.call(Fieldset.prototype);

	return Fieldset;
});
