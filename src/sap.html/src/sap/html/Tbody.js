/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Tbody = HTMLElementBase.extend("sap.html.Tbody", {
		metadata: {
			"tag": "tbody"
		}
	});

	return Tbody;
});
