/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Thead = HTMLElementBase.extend("sap.html.Thead", {
		metadata: {
			"tag": "thead"
		}
	});

	return Thead;
});
