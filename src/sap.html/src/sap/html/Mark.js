/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Mark = HTMLElementBase.extend("sap.html.Mark", {
		metadata: {
			"tag": "mark"
		}
	});

	return Mark;
});
