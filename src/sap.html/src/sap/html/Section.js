/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Section = HTMLElementBase.extend("sap.html.Section", {
		metadata: {
			"tag": "section"
		}
	});

	return Section;
});
