/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Var = HTMLElementBase.extend("sap.html.Var", {
		metadata: {
			"tag": "var"
		}
	});

	return Var;
});
