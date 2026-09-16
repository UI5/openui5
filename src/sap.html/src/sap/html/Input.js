/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/ui/core/EnabledPropagator", "sap/html/library"], function (HTMLElementBase, EnabledPropagator) {
	"use strict";

	const Input = HTMLElementBase.extend("sap.html.Input", {
		metadata: {
			"tag": "input",
			"void": true,
			"properties": {
				"accept": {
					"type": "string",
					"mapping": "property"
				},
				"alt": {
					"type": "string",
					"mapping": "property"
				},
				"autocomplete": {
					"type": "sap.html.enums.InputAutocomplete",
					"mapping": "property"
				},
				"checked": {
					"type": "boolean",
					"mapping": "property"
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
				"height": {
					"type": "int",
					"mapping": "property"
				},
				"max": {
					"type": "string",
					"mapping": "property"
				},
				"maxlength": {
					"type": "int",
					"mapping": "property"
				},
				"min": {
					"type": "string",
					"mapping": "property"
				},
				"minlength": {
					"type": "int",
					"mapping": "property"
				},
				"multiple": {
					"type": "boolean",
					"mapping": "property"
				},
				"name": {
					"type": "string",
					"mapping": "property"
				},
				"pattern": {
					"type": "string",
					"mapping": "property"
				},
				"placeholder": {
					"type": "string",
					"mapping": "property"
				},
				"popovertargetaction": {
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
				"size": {
					"type": "int",
					"mapping": "property"
				},
				"src": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				},
				"step": {
					"type": "string",
					"mapping": "property"
				},
				"type": {
					"type": "sap.html.enums.InputType",
					"mapping": "property"
				},
				"value": {
					"type": "string",
					"mapping": "property"
				},
				"width": {
					"type": "int",
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
				},
				"list": {
					"type": "sap.html.Datalist",
					"mapping": {
						"type": "property",
						"to": "list"
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

	EnabledPropagator.call(Input.prototype);

	return Input;
});
