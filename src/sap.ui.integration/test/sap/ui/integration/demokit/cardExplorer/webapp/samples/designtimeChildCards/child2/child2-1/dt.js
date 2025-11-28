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
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"label": "String Label",
						"translatable": true,
						"required": true,
						"editableToUser": true
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
