/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Tr = HTMLElementBase.extend("sap.html.Tr", {
		metadata: {
			"tag": "tr"
		}
	});

	return Tr;
});
