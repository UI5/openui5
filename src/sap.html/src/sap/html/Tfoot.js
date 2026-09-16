/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Tfoot = HTMLElementBase.extend("sap.html.Tfoot", {
		metadata: {
			"tag": "tfoot"
		}
	});

	return Tfoot;
});
