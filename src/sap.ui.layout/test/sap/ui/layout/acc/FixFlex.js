sap.ui.require([
	"sap/m/App",
	"sap/m/Carousel",
	"sap/m/Image",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/ui/layout/FixFlex"
], function(App, Carousel, Image, Page, PageAccessibleLandmarkInfo, Panel, Text, FixFlex) {
	"use strict";

	var app = new App('myApp', {
		initialPage: 'page1'
	});

	var oFixFlexColumn = new FixFlex({
		minFlexSize: 450,

		fixContent: [new Panel({
			expandable: true,
			expanded: false,
			headerText: "Panel with a header text",
			content: new Text({
				text: 'Lorem Ipsum'
			})
		})],
		flexContent: new Text({
			text:"This container is flexible and it will adapt its size to fill the remaining size in the FixFlex control"
		})
	});

	var page1 = new Page('page1', {
		title: 'FixFlex vertical layout',
		titleLevel: 'H1',
		landmarkInfo: new PageAccessibleLandmarkInfo({
			rootRole: 'None',
			contentRole: 'Main',
			headerRole: 'Region', headerLabel: 'FixFlex Accessibility Test Page Header'
		}),
		enableScrolling: true,
		content: [oFixFlexColumn]
	});


	app.addPage(page1).placeAt('body');
});
