sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/ui/layout/PaneContainer",
	"sap/ui/layout/ResponsiveSplitter",
	"sap/ui/layout/SplitPane"
], function(App, Page, PageAccessibleLandmarkInfo, Panel, Text, PaneContainer, ResponsiveSplitter, SplitPane) {
	"use strict";

	var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.";


	var oResponsiveSplitter = new ResponsiveSplitter("responsiveSplitter", {
		defaultPane: "defaultPane",
		rootPaneContainer: [
			new PaneContainer({
				orientation: "Horizontal",
				panes: [
					new SplitPane({
						demandPane: true,
						content: new Panel({
							accessibleRole: "Region",
							headerText: "Pane 1",
							content: new Text({text: "1. " + lorem + lorem})
						}),
						requiredParentWidth: 400
					}),
					new PaneContainer({
						orientation: "Vertical",
						panes: [
							new SplitPane({
								demandPane: true,
								content:  new Panel({
									accessibleRole: "Region",
									headerText: "Pane 2",
									content: new Text({text: "2. " + lorem + lorem})
								}),
								requiredParentWidth: 400
							}),
							new SplitPane({
								demandPane: true,
								content:  new Panel({
									accessibleRole: "Region",
									headerText: "Pane 3",
									content: new Text({text: "3. " + lorem + lorem})
								}),
								requiredParentWidth: 600
							})
						]
					})
				]
			})
		]
	});

	const oApp = new App({ initialPage: "accPage" });
	oApp.addPage(new Page("accPage", {
		title: "ResponsiveSplitter Accessibility Test Page", titleLevel: "H1",
		landmarkInfo: new PageAccessibleLandmarkInfo({
			rootRole: "None", contentRole: "Main",
			headerRole: "Region", headerLabel: "ResponsiveSplitter Accessibility Test Page Header"
		}),
		content: [oResponsiveSplitter]
	}));
	oApp.placeAt("content");
});
