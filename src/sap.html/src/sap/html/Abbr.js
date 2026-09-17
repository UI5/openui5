/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Abbr = HTMLElementBase.extend("sap.html.Abbr", {
		metadata: {
			"tag": "abbr"
		}
	});

	return Abbr;
});
