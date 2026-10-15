sap.ui.define([
	"sap/m/App",
	"sap/m/BusyIndicator",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(App, BusyIndicator, CheckBox, Page, PageAccessibleLandmarkInfo, Toolbar, ToolbarSpacer) {
	"use strict";

	var app = new App("myApp", {
			initialPage: "page1"
		}),
		busyCSSText = new BusyIndicator({
			text: 'Medium sized busy indicator'
		}),
		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),
		oPage = new Page("page1", {
			title: "BusyIndicator Accessibility Test Page",
			titleLevel: "H1",
			landmarkInfo: new PageAccessibleLandmarkInfo({
				rootRole: "None",
				contentRole: "Main",
				headerRole: "Region", headerLabel: "BusyIndicator Accessibility Test Page Header",
				footerRole: "Region", footerLabel: "BusyIndicator Accessibility Test Page Footer"
			}),
			content:[
				busyCSSText
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		});

	app.addPage(oPage).placeAt("content");
});
