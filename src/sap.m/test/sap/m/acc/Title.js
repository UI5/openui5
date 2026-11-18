sap.ui.define(["sap/m/App", "sap/m/Page", "sap/m/PageAccessibleLandmarkInfo", "sap/ui/core/library", "sap/m/Title"], function(App, Page, PageAccessibleLandmarkInfo, coreLibrary, Title) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

	const oTitle = new Title({
		text: "Sample Title",
		level: TitleLevel.H1
	});

	const oApp = new App({ initialPage: "accPage" });
	oApp.addPage(new Page("accPage", {
		landmarkInfo: new PageAccessibleLandmarkInfo({
			rootRole: "None", contentRole: "Main", headerRole: "None"
		}),
		content: [oTitle]
	}));
	oApp.placeAt("content");
});
