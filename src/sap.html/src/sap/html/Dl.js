/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Dl = HTMLElementBase.extend("sap.html.Dl", {
		metadata: {
			"tag": "dl"
		}
	});

	return Dl;
});
