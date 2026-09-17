/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Div = HTMLElementBase.extend("sap.html.Div", {
		metadata: {
			"tag": "div"
		}
	});

	return Div;
});
