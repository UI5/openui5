/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Span = HTMLElementBase.extend("sap.html.Span", {
		metadata: {
			"tag": "span"
		}
	});

	return Span;
});
