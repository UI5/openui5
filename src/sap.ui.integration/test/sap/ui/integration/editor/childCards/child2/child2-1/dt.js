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
