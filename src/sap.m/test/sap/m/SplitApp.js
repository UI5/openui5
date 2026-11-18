sap.ui.define([
	"sap/m/App",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/OverflowToolbar",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/SplitApp",
	"sap/ui/Device",
	"sap/base/Log"
], function(App, Input, Label, Button, Page, PageAccessibleLandmarkInfo, mobileLibrary, library, OverflowToolbar, List, StandardListItem, SplitApp, Device, Log) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.m.SplitAppMode
	var SplitAppMode = mobileLibrary.SplitAppMode;

	// shortcut for sap.m.PageBackgroundDesign
	var PageBackgroundDesign = mobileLibrary.PageBackgroundDesign;

	function generateDetailPage2Content() {
		var aContent = [];
		var sLabelText = "This is detail ";
		var iInputCount = 19;
		var oLabelControl;
		var oInputControl;

		for (var iNumber = 0; iNumber < iInputCount; iNumber += 1) {
			oInputControl = new Input();
			oLabelControl = new Label({
				labelFor: oInputControl.getId(),
				text: sLabelText + (iNumber + 1)
			});
			aContent.push(oLabelControl);
			aContent.push(oInputControl);
		}

		return aContent;
	}

	// create first detail page
	var oDetailPage = new Page("detail", {
		title: "Detail 1",
		backgroundDesign: PageBackgroundDesign.Solid,
		content: [
			new Button("saNavigationToDetail", {
				text: "Navigate to detail 2",
				press: function() {
					oSplitApp.to("detailDetail");
				}
			})
		],
		showNavButton: Device.system.phone,
		landmarkInfo: new PageAccessibleLandmarkInfo({
			contentRole: "Region",
			rootLabel: "Detail 1",
			contentLabel: "Detail 1",
			headerRole: "Region", headerLabel: "Detail 1 Header",
			footerRole: "Region", footerLabel: "Detail 1 Footer"
		}),
		navButtonPress: function() {
			oSplitApp.backDetail();
		},
		subHeader: new OverflowToolbar({
			content: [
				new Button("saShowHideMasterMode", {
					text: "show/hide",
					press: function() {
						oSplitApp.setMode(SplitAppMode.ShowHideMode);
					}
				}), new Button({
					text: "stretch/compress",
					press: function() {
						oSplitApp.setMode(SplitAppMode.StretchCompressMode);
					}
				}), new Button("saHideMasterMode", {
					text: "hide",
					press: function() {
						oSplitApp.setMode(SplitAppMode.HideMode);
					}
				}), new Button({
					text: "popover",
					press: function() {
						oSplitApp.setMode(SplitAppMode.PopoverMode);
					}
				})
			]
		}),
		footer: new OverflowToolbar({
			id: "detail-footer",
			content: [
				new Button({
					text: "Action 1"
				}),
				new Button({
					text: "Action 2"
				}),
				new Button({
					text: "Action 3"
				}),
				new Button({
					text: "Action 4"
				})
			]
		})
	}).addStyleClass("pageWithPadding");

	var oDetailDetailPage = new Page("detailDetail", {
		title: "Detail Detail",
		landmarkInfo: new PageAccessibleLandmarkInfo({
			contentRole: "Region",
			rootLabel: "Detail Detail",
			contentLabel: "Detail Detail",
			headerRole: "Region", headerLabel: "Detail Detail Header"
		}),
		backgroundDesign: PageBackgroundDesign.Solid,
		content: [
			new Label({
				text: "this is Detail Detail"
			})
		],
		showNavButton: true,
		navButtonPress: function() {
			oSplitApp.backDetail();
		},
		subHeader: new OverflowToolbar({
			content: [
				new Button({
					text: "show/hide",
					press: function() {
						oSplitApp.setMode(SplitAppMode.ShowHideMode);
					}
				}), new Button({
					text: "stretch/compress",
					press: function() {
						oSplitApp.setMode(SplitAppMode.StretchCompressMode);
					}
				}), new Button({
					text: "hide",
					press: function() {
						oSplitApp.setMode(SplitAppMode.HideMode);
					}
				}), new Button({
					text: "popover",
					press: function() {
						oSplitApp.setMode(SplitAppMode.PopoverMode);
					}
				})
			]
		})
	}).addStyleClass("pageWithPadding");

	//create second detail page
	var oDetailPage2 = new Page("detail2", {
		title: "Detail 2",
		backgroundDesign: PageBackgroundDesign.Solid,
		showNavButton: true,
		landmarkInfo: new PageAccessibleLandmarkInfo({
			contentRole: "Region",
			rootLabel: "Detail 2",
			contentLabel: "Detail 2",
			headerRole: "Region", headerLabel: "Detail 2 Header",
			footerRole: "Region", footerLabel: "Detail 2 Footer"
		}),
		navButtonPress: function() {
			oSplitApp.backDetail();
		},
		content: [
			generateDetailPage2Content()
		],
		subHeader: new OverflowToolbar({
			content: []
		}),
		footer: new OverflowToolbar({
			id: "detai2l-footer",
			content: [
				new Button({
					text: "Action 1"
				}),
				new Button({
					text: "Action 2"
				}),
				new Button({
					text: "Action 3"
				}),
				new Button({
					text: "Action 4"
				})
			]
		})
	}).addStyleClass("pageWithPadding");

	//create first master page

	var oMasterPage = new Page("master", {
		title: "Master",
		landmarkInfo: new PageAccessibleLandmarkInfo({
			contentRole: "Region",
			rootLabel: "Master",
			contentLabel: "Master",
			headerRole: "Region", headerLabel: "Master Header",
			footerRole: "Region", footerLabel: "Master Footer"
		}),
		backgroundDesign: PageBackgroundDesign.List,
		content: [
			new List({
				items: [
					new StandardListItem("saNavigateToMaster", {
						title: "To Master 2",
						type: "Navigation",
						press: function() {
							oSplitApp.toMaster("master2");
						}
					})
				]
			})
		],
		footer: new OverflowToolbar({
			id: "master-footer",
			content: [
				new Button({
					text: "Action 1"
				}),
				new Button({
					text: "Action 2"
				}),
				new Button({
					text: "Action 3"
				}),
				new Button({
					text: "Action 4"
				})
			]
		})
	});

	//create second master page
	var oMasterPage2 = new Page("master2", {
		title: "Master 2",
		backgroundDesign: PageBackgroundDesign.List,
		landmarkInfo: new PageAccessibleLandmarkInfo({
			contentRole: "Region",
			rootLabel: "Master 2",
			contentLabel: "Master 2",
			headerRole: "Region", headerLabel: "Master 2 Header",
			footerRole: "Region", footerLabel: "Master 2 Footer"
		}),
		showNavButton: true,
		navButtonPress: function() {
			oSplitApp.backMaster();
		},
		content: [
			new List({
				mode: Device.system.phone ? ListMode.None : ListMode.SingleSelectMaster,
				selectionChange: function(oEv) {
					if (oEv.getParameter("listItem").getId() == "listDetail2") {
						oSplitApp.toDetail("detail2");
					} else {
						oSplitApp.toDetail("detail");
					}
				},
				items: [
					new StandardListItem("listDetail", {
						title: "To Detail 1",
						type: ListType.Active,
						press: function(oEv) {
							oSplitApp.toDetail("detail");
						}
					}),
					new StandardListItem("listDetail2", {
						title: "To Detail 2",
						type: ListType.Active,
						press: function(oEv) {
							oSplitApp.toDetail("detail2");
						}
					})
				]
			})
		],
		footer: new OverflowToolbar({
			id: "master2-footer",
			content: [
				new Button({
					text: "Action 1"
				}),
				new Button({
					text: "Action 2"
				}),
				new Button({
					text: "Action 3"
				}),
				new Button({
					text: "Action 4"
				})
			]
		})
	});

	//create SplitApp()
	var oSplitApp = new SplitApp({
		detailPages: [oDetailPage, oDetailDetailPage, oDetailPage2],
		masterPages: [oMasterPage, oMasterPage2],
		initialDetail: "detail",
		initialMaster: "master",
		afterMasterOpen: function() {
			Log.info("master is opened");
		},
		afterMasterClose: function() {
			Log.info("master is closed");
		}
	});

	if (Device.system.tablet  || Device.system.desktop) {
		oSplitApp.setDefaultTransitionNameDetail("fade");
	}

	var oPage = new Page("page", {
		title: "SplitApp Test Page",
		titleLevel: library.TitleLevel.H1,
		landmarkInfo: new PageAccessibleLandmarkInfo({
			rootRole: "None",
			contentRole: "Region",
			rootLabel: "SplitApp Test Page",
			contentLabel: "SplitApp Test Page Content",
			headerLabel: "SplitApp Test Page Header"
		}),
		content: oSplitApp
	});

	var oApp = new App("myApp", {
		initialPage: "page",
		pages: [oPage]
	});

	oApp.placeAt("body");
});
