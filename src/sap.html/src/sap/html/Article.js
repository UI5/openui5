/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Article = HTMLElementBase.extend("sap.html.Article", {
		metadata: {
			"tag": "article"
		}
	});

	return Article;
});
