/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/ui/core/EnabledPropagator", "sap/html/library"], function (HTMLElementBase, EnabledPropagator) {
	"use strict";

	const Option = HTMLElementBase.extend("sap.html.Option", {
		metadata: {
			"tag": "option",
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
				},
				"selected": {
					"type": "boolean",
					"mapping": "property"
				},
				"value": {
					"type": "string",
					"mapping": "property"
				}
			}
		}
	});

	EnabledPropagator.call(Option.prototype);

	return Option;
});
