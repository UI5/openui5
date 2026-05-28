sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/ObjectStatus",
    "sap/tnt/NavigationList",
    "sap/tnt/NavigationListItem"
],
    function (
        App,
        Page,
        Button,
        ObjectStatus,
        NavigationList,
        NavigationListItem
    ){
        "use strict";

		var list = new NavigationList("navLiWithIcons", {
			// width: '320px',
			expanded: true,
			items: [
				new NavigationListItem({
					// textDirection: sap.ui.core.TextDirection.RTL,
					text: 'Root 1',
					expanded: true,
					// icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Looooooooooooooooooooong Child'
						}),
						new NavigationListItem({
							text: 'Disabled Child',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Only Root',
					icon: 'sap-icon://employee'
				}),
				new NavigationListItem({
					text: 'Disabled Root',
					enabled: false,
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Looooooooooooooooong Root 2',
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Root 3',
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				})
			]
		});

        var menuButton = new Button({
			text: 'menu',
			press: function () {
				list.setExpanded(!list.getExpanded());
			}
		});
		var change = new Button({
			text: 'Change',
			press: function () {
				list.getItems()[0].getItems()[0].setText('New text');
			}
		});

		var oNavigationListWithoutIcons = new NavigationList("navLiWithoutIcons", {
			width: '320px',
			expanded: true,
			items: [
				new NavigationListItem({
					text: 'Root 1',
					expanded: true,
					items: [
						new NavigationListItem({
							text: 'Looooooooooooooooooooong Child'
						}),
						new NavigationListItem({
							text: 'Disabled Child',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Only Root'
				}),
				new NavigationListItem({
					text: 'Disabled Root',
					enabled: false,
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Looooooooooooooooong Root 2',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						})
					]
				}),
				new NavigationListItem({
					text: 'Root 3',
					items: [
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				})
			]
		});

		var oNavigationListWithStatuses = new NavigationList("navLiWithStatuses", {
			width: '420px',
			expanded: true,
			items: [
				new NavigationListItem({
					text: 'Overview',
					icon: 'sap-icon://home',
					tag: new ObjectStatus({
						text: "Beta",
						state: "Indication15",
						inverted: true
					})
				}),
				new NavigationListItem({
					text: 'Features',
					icon: 'sap-icon://activity-items',
					expanded: true,
					tag: new ObjectStatus({
						text: "New",
						state: "Indication16",
						inverted: true
					}),
					items: [
						new NavigationListItem({
							text: 'Feature A',
							tag: new ObjectStatus({
									text: "Beta",
									state: "Indication15",
									inverted: true
								})
						}),
						new NavigationListItem({
							text: 'Feature B',
							tag: new ObjectStatus({
									text: "Deprecated",
									state: "Indication18",
									inverted: true
								})
						}),
						new NavigationListItem({
							text: 'Feature C'
						})
					]
				}),
				new NavigationListItem({
					text: 'Documentation',
					icon: 'sap-icon://sys-help',
					tag: new ObjectStatus({
							text: "Updated",
							state: "Indication16",
							inverted: true
						})
				}),
				new NavigationListItem({
					text: 'Settings',
					icon: 'sap-icon://action-settings'
				}),
				new NavigationListItem({
					text: 'Analytics',
					icon: 'sap-icon://bar-chart',
					tag: new ObjectStatus({
						text: "Nightly",
						state: "Indication17",
						inverted: true
					})
				}),
				new NavigationListItem({
					text: 'Preview',
					icon: 'sap-icon://show',
					tag: new ObjectStatus({
							text: "Experimental",
							state: "Indication19",
							inverted: true
						})
				}),
				new NavigationListItem({
					text: 'Reports',
					icon: 'sap-icon://document',
					tag: new ObjectStatus({
						text: "Updated",
						state: "Indication20",
						inverted: true
					})
				}),
				new NavigationListItem({
					text: 'Administration',
					icon: 'sap-icon://settings',
					tag: new ObjectStatus({
						text: "Long tag Long tag",
						state: "Indication17",
						inverted: true
					})
				})
			]
		});

		var menuButtonStatuses = new Button({
			text: 'Toggle Expand/Collapse',
			press: function () {
				oNavigationListWithStatuses.setExpanded(!oNavigationListWithStatuses.getExpanded());
			}
		});

		var oApp = new App({
			pages: [
				new Page("page1", {
					title: "NavigationList with icons",
					headerContent: [
						new Button("toPage2", {
							text: "Go to Page2",
							press: function () {
								oApp.to("page2");
							}
						}),
						new Button("toPage3", {
							text: "Go to Tags Demo",
							press: function () {
								oApp.to("page3");
							}
						})
					],
					content: [menuButton, list, change]
				}),
				new Page("page2", {
					title: "NavigationList without icons",
					headerContent: [
						new Button({
							text: "Go to Page1",
							press: function () {
								oApp.to("page1");
							}
						})
					],
					content: [oNavigationListWithoutIcons]
				}),
				new Page("page3", {
					title: "NavigationList with Status Indicators (New Feature)",
					headerContent: [
						new Button({
							text: "Go to Page1",
							press: function () {
								oApp.to("page1");
							}
						}),
						new Button({
							text: "Go to Page2",
							press: function () {
								oApp.to("page2");
							}
						})
					],
					content: [menuButtonStatuses, oNavigationListWithStatuses]
				})
			]
		});

		oApp.placeAt("content");
});