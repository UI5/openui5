/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/ui/core/EnabledPropagator", "sap/html/library"], function (HTMLElementBase, EnabledPropagator) {
	"use strict";

	const Optgroup = HTMLElementBase.extend("sap.html.Optgroup", {
		metadata: {
			"tag": "optgroup",
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
				"label": {
					"type": "string",
					"mapping": "property"
				}
			}
		}
	});

	EnabledPropagator.call(Optgroup.prototype);

	return Optgroup;
});
