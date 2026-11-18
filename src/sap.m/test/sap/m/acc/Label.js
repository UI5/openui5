sap.ui.define(["sap/m/App", "sap/m/Label", "sap/m/Page", "sap/m/PageAccessibleLandmarkInfo"], function(App, Label, Page, PageAccessibleLandmarkInfo) {
	"use strict";

	const oLabel = new Label({
		text: "Sample Label"
	});

	const oApp = new App({ initialPage: "accPage" });
	oApp.addPage(new Page("accPage", {
		title: "Label Accessibility Test Page", titleLevel: "H1",
		landmarkInfo: new PageAccessibleLandmarkInfo({
			rootRole: "None", contentRole: "Main",
			headerRole: "Region", headerLabel: "Label Accessibility Test Page Header"
		}),
		content: [oLabel]
	}));
	oApp.placeAt("content");
});
