/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Pre = HTMLElementBase.extend("sap.html.Pre", {
		metadata: {
			"tag": "pre"
		}
	});

	return Pre;
});
