/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Kbd = HTMLElementBase.extend("sap.html.Kbd", {
		metadata: {
			"tag": "kbd"
		}
	});

	return Kbd;
});
