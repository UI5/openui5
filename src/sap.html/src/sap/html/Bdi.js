/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Bdi = HTMLElementBase.extend("sap.html.Bdi", {
		metadata: {
			"tag": "bdi"
		}
	});

	return Bdi;
});
