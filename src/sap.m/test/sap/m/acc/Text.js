sap.ui.define(["sap/m/App", "sap/m/Page", "sap/m/PageAccessibleLandmarkInfo", "sap/m/Text"], function(App, Page, PageAccessibleLandmarkInfo, Text) {
	"use strict";

	const oText = new Text({
		text: "I am a text"
	});

	const oApp = new App({ initialPage: "accPage" });
	oApp.addPage(new Page("accPage", {
		title: "Text Accessibility Test Page", titleLevel: "H1",
		landmarkInfo: new PageAccessibleLandmarkInfo({
			rootRole: "None", contentRole: "Main",
			headerRole: "Region", headerLabel: "Text Accessibility Test Page Header"
		}),
		content: [oText]
	}));
	oApp.placeAt("content");
});
