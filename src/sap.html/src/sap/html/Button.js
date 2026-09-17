/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/ui/core/EnabledPropagator", "sap/html/library"], function (HTMLElementBase, EnabledPropagator) {
	"use strict";

	const Button = HTMLElementBase.extend("sap.html.Button", {
		metadata: {
			"tag": "button",
			"properties": {
				"command": {
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
				"formaction": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				},
				"formenctype": {
					"type": "sap.html.enums.EncodingType",
					"mapping": "property"
				},
				"formmethod": {
					"type": "sap.html.enums.Method",
					"mapping": "property"
				},
				"formnovalidate": {
					"type": "boolean",
					"mapping": "property"
				},
				"formtarget": {
					"type": "string",
					"mapping": "property"
				},
				"name": {
					"type": "string",
					"mapping": "property"
				},
				"popovertargetaction": {
					"type": "string",
					"mapping": "property"
				},
				"type": {
					"type": "sap.html.enums.ButtonType",
					"mapping": "property"
				},
				"value": {
					"type": "string",
					"mapping": "property"
				}
			},
			"associations": {
				"commandfor": {
					"type": "sap.ui.core.Control",
					"mapping": {
						"type": "property",
						"to": "commandfor"
					}
				},
				"form": {
					"type": "sap.html.Form",
					"mapping": {
						"type": "property",
						"to": "form"
					}
				},
				"popovertarget": {
					"type": "sap.ui.core.Control",
					"mapping": {
						"type": "property",
						"to": "popovertarget"
					}
				}
			}
		}
	});

	EnabledPropagator.call(Button.prototype);

	return Button;
});
