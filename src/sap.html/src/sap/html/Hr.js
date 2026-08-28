/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Hr = HTMLElementBase.extend("sap.html.Hr", {
		metadata: {
			"tag": "hr",
			"void": true
		}
	});

	return Hr;
});
