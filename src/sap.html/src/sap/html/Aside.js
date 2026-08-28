/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Aside = HTMLElementBase.extend("sap.html.Aside", {
		metadata: {
			"tag": "aside"
		}
	});

	return Aside;
});
