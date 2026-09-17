/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Datalist = HTMLElementBase.extend("sap.html.Datalist", {
		metadata: {
			"tag": "datalist"
		}
	});

	return Datalist;
});
