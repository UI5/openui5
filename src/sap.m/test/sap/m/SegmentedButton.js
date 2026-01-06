// Note: the HTML page 'SegmentedButton.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/core/HTML",
	"sap/ui/core/IconPool",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/InputListItem",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/SplitApp",
	"sap/m/Toolbar",
	"sap/m/VBox"
], function(
	library,
	coreLibrary,
	HTML,
	IconPool,
	XMLView,
	JSONModel,
	Bar,
	Button,
	Dialog,
	InputListItem,
	Label,
	List,
	MessageToast,
	Page,
	Panel,
	SegmentedButton,
	SegmentedButtonItem,
	SplitApp,
	Toolbar,
	VBox
) {
	"use strict";
	const ButtonType = library.ButtonType;
	const LabelDesign = library.LabelDesign;
	const TextDirection = coreLibrary.TextDirection;

	const sAddIconURI = IconPool.getIconURI("add");
	const oApp = new SplitApp();
	oApp.placeAt("content");

	const oPage = new Page("myFirstPage", {
		backgroundDesign: "Standard",
		title : "Test",
		enableScrolling : false
		});

	const oPage2 = new Page("mySecondPage", {
		backgroundDesign: "Standard",
		title : "Test",
		showNavButton: true,
		enableScrolling : true,
		navButtonPress: function() {
			oApp.to(oPage);
		}
	});

	const fSelectionChange = function(oEvent) {
			console.info('press event segmented: ' + oEvent.getSource().getSelectedItem());
	};

	/* Side Bar Content */

	const oSegmentedButtonItem = new SegmentedButtonItem('item1', {
		text: "to Page 2",
		press: function(oEvent) {
			console.info('press event button: ' + oEvent.getParameter('id'));
			oApp.to(oPage2);
		}
	});
	const oSegmentedButtonItem2 = new SegmentedButtonItem('item2', {
		icon: sAddIconURI,
		press: function(oEvent) {
			console.info('press event button: ' + oEvent.getParameter('id'));
		}
	});
	const oSegmentedButtonItem3 = new SegmentedButtonItem('item3', {
		icon: "images/favorite_grey_24.png",
		tooltip: "Favorite"
	});

	const oSegmentedButton = new SegmentedButton({
		items: [
			oSegmentedButtonItem,
			oSegmentedButtonItem2,
			oSegmentedButtonItem3
		],
		selectedItem: oSegmentedButtonItem2,
		visible: true,
		selectionChange: fSelectionChange
	});

	const oBar = new Bar({
		contentLeft: [
			new Button('Back', { text: "Back", type: ButtonType.Back })
		],
		contentMiddle: [
			oSegmentedButton
		],
		contentRight: [
			new Button('Edit', { text: "Edit" })
		]
	});
	oPage.setCustomHeader(oBar);

	const oSegmentedButton2 = new SegmentedButton('SegmentedCnt1', {
		selectionChange: fSelectionChange,
		width: '100%'
	});

	const oSegmentedButtonItem4 = new SegmentedButtonItem('item4', {
		icon: sAddIconURI
	});

	const oSegmentedButtonItem5 = new SegmentedButtonItem('item5', {
		text: "100% Width"
	});

	const oSegmentedButtonItem6 = new SegmentedButtonItem('item6', {
		text: "This is a Very Very Very Long Text"
	});

	oSegmentedButton2.addItem(oSegmentedButtonItem4);
	oSegmentedButton2.setSelectedItem(oSegmentedButtonItem4);

	oSegmentedButton2.addItem(oSegmentedButtonItem5);
	oSegmentedButton2.addItem(oSegmentedButtonItem6);

	oPage.addContent(oSegmentedButton2);

	const oSegmentedButtonItem7 = new SegmentedButtonItem('item7', {
		text: "test",
	});

	const oSegmentedButtonItem8 = new SegmentedButtonItem('item8', {
		text: "test"
	});

	const oSegmentedButton3 = new SegmentedButton('SegmentedCnt2', {
		items: [
			oSegmentedButtonItem7,
			oSegmentedButtonItem8
		],
		selectedItem: oSegmentedButtonItem7,
		selectionChange: fSelectionChange
	});

	oPage.addContent(oSegmentedButton3);

	const oSegmentedIcons = new SegmentedButton('SegmentedIcons', {
		items: [
			new SegmentedButtonItem('buttonIcon1', {
				icon: sAddIconURI,
			}),
			new SegmentedButtonItem('buttonIcon2', {
				icon: sAddIconURI,
			}),
			new SegmentedButtonItem('buttonIcon3', {
				icon: sAddIconURI,
			}),
			new SegmentedButtonItem('buttonIcon4', {
				icon: sAddIconURI,
			})
		],
		selectionChange: fSelectionChange
	});

	oPage.addContent(oSegmentedIcons);

	const oSegmentedButton4 = new SegmentedButton({
		items: [
			new SegmentedButtonItem('segbtn1', {
				text: "first button"
			}),
			new SegmentedButtonItem('segbtn2', {
				text: "disabled button"
			}),
			new SegmentedButtonItem('segbtn3', {
				text: "third button"
			})
		]
	});

	oPage.addContent(oSegmentedButton4);

	window.setTimeout(function(){
		const oSecondItem = oSegmentedButton4.getItems()[1];
		oSecondItem.setEnabled(false);
	},1000);

	var oSegmentedButtonItem9 = new SegmentedButtonItem('item9', {
		text: "Label Footer"
	});
	var oSegmentedButtonItem10 = new SegmentedButtonItem('item10', {
		icon: sAddIconURI
	});
	var oSegmentedButtonItem11 = new SegmentedButtonItem('item11', {
		text: "Label Footer"
	});

	const oSegmentedFooter = new SegmentedButton('SegmentedFooter', {
		items: [
			oSegmentedButtonItem9,
			oSegmentedButtonItem10,
			oSegmentedButtonItem11
		],
		selectedItem: oSegmentedButtonItem10,
		selectionChange: fSelectionChange
	});

	const oFooter = new Bar({
		contentMiddle: [ oSegmentedFooter ]
	});

	oPage.setFooter(oFooter);

	/* Main Content */

	function createLabel(sText) {
		return new Label({ text: sText, design: LabelDesign.Bold });
	}

	const vBox = new VBox();

	/****************************************
	 * API test Start                       *
	 ****************************************/

	const oSegmentedButtonApiTest = new SegmentedButton('oSegmentedButtonApiTest', {
		items: [
			new SegmentedButtonItem({ text: "Some Text" }),
			new SegmentedButtonItem({ text: "100% Width" }),
			new SegmentedButtonItem({ text: "This xis a Very Very Very Long Text" })
		],
		selectionChange: fSelectionChange,
		width: '100%'
	});

	vBox.addItem(oSegmentedButtonApiTest);

	// new test case for CSN# 1143859/2014
	vBox.addItem(new Button({
		text : "Rotate selected button by API for \"oSegmentedButtonApiTest\"",
		press : function() {
			const oSelectedItem = oSegmentedButtonApiTest.getSelectedItem();
			const aItems = oSegmentedButtonApiTest.getItems();
			const aItemIds = aItems.map(item => item.getId());

			let index = aItemIds.indexOf(oSelectedItem);
			index = (index + 1) % aItems.length;

			oSegmentedButtonApiTest.setSelectedItem(aItems[index]);
		}
		})
	);

	/****************************************
	 * API test End                         *
	 ****************************************/

	/****************************************
	 * Fixed widths Start                   *
	 ****************************************/

	var oSegmentedSecondFixedWidths = new SegmentedButton('oSegmentedSecondFixedWidths', {
		items: [
			new SegmentedButtonItem({text: "100px", width: "100px"}),
			new SegmentedButtonItem({text: "no width -> segmentedButton: 400px"})
		],
		selectionChange: fSelectionChange,
		width: "400px"
	});
	vBox.addItem(oSegmentedSecondFixedWidths);

	/****************************************
	 * Fixed widths End                     *
	 ****************************************/

	/****************************************
	 * Images and state Start               *
	 ****************************************/

	const oSegmentedButtonImage = new SegmentedButton({
		items: [
			new SegmentedButtonItem({
				icon: "images/candy_v_46x46.png",
				tooltip: "Accept"
			}),
			new SegmentedButtonItem({
				icon: "images/candy_x_46x46.png",
				tooltip: "Reject"
			}),
			new SegmentedButtonItem({
				icon: "images/candy_star_46x46.png",
				enabled: false,
				tooltip: "Star"
			})
		],
		selectionChange: fSelectionChange
	});
	vBox.addItem(oSegmentedButtonImage);

	const oSegmentedButtonImage2 = new SegmentedButton({
		items: [
			new SegmentedButtonItem({
				icon: "sap-icon://factory",
				enabled: false
			}),
			new SegmentedButtonItem({
				icon: "sap-icon://flag"
			}),
			new SegmentedButtonItem({
				icon: "sap-icon://flight"
			})
		],
		selectionChange: fSelectionChange
	});
	vBox.addItem(oSegmentedButtonImage2);

	const oSegmentedImageAndText = new SegmentedButton('SegmentedImageAndText', {
		items: [
			new SegmentedButtonItem({
				icon: "images/candy_v_46x46.png",
				text: "one"
			}),
			new SegmentedButtonItem({
				icon: "images/candy_x_46x46.png",
				text: "two"
			}),
			new SegmentedButtonItem({
				icon: "images/candy_star_46x46.png",
				text: "three",
				enabled: false
			})
		],
		selectionChange: fSelectionChange
	});
	vBox.addItem(oSegmentedImageAndText);

	const oSegmentedIconAndText = new SegmentedButton('SegmentedIconAndText', {
		items: [
			new SegmentedButtonItem({
				icon: IconPool.getIconURI("add"),
				text: "one"
			}),
			new SegmentedButtonItem({
				icon: IconPool.getIconURI("attachment"),
				text: "two"
			}),
			new SegmentedButtonItem({
				icon: IconPool.getIconURI("paper-plane"),
				text: "three",
				enabled: false
			}),
			new SegmentedButtonItem({
				icon: IconPool.getIconURI("synchronize"),
				text: "four"
			})
		],
		selectionChange: fSelectionChange
	});
	vBox.addItem(oSegmentedIconAndText);

	const oSegmentedLastNotVisible = new SegmentedButton('SegmentedLastNotVisible', {
		items: [
			new SegmentedButtonItem({
				text: "one: last one not visible"
			}),
			new SegmentedButtonItem({
				text: "two: last one not visible"
			}),
			new SegmentedButtonItem({
				text: "three: last one not visible",
				enabled: true,
				visible: false
			})
		],
		selectionChange: fSelectionChange
	});
	vBox.addItem(oSegmentedLastNotVisible);

	const oSegmentedLastNotVisibleDis = new SegmentedButton('SegmentedLastNotVisibleDis', {
		items: [
			new SegmentedButtonItem({
				text: "one: last one not visible"
			}),
			new SegmentedButtonItem({
				text: "two: last one not visible",
				enabled: false
			}),
			new SegmentedButtonItem({
				text: "three: last one not visible",
				enabled: true,
				visible: false
			})
		],
		selectionChange: fSelectionChange
	});
	vBox.addItem(oSegmentedLastNotVisibleDis);

	/****************************************
	 * Images and state End                 *
	 ****************************************/

	vBox.addItem(new SegmentedButton({
		items : [
			new SegmentedButtonItem({text: "Some loooong text"}),
			new SegmentedButtonItem({icon: IconPool.getIconURI("drill-down")}),
			new SegmentedButtonItem({text: "Some loooong text"})
		]
	}));

	vBox.addItem(new SegmentedButton({
		items : [
			new SegmentedButtonItem({text: "Some loooong text"}),
			new SegmentedButtonItem({width: "60%", icon: IconPool.getIconURI("drill-down")}),
			new SegmentedButtonItem({text: "Some loooong text"})
		]
	}));

	vBox.addItem(new SegmentedButton({
		items : [
			new SegmentedButtonItem({text: "Some loooong text"}),
			new SegmentedButtonItem({width: "200px", icon: IconPool.getIconURI("drill-down")}),
			new SegmentedButtonItem({text: "Some loooong text"})
		]
	}));

	/****************************************
	 * sap.m.Dialog Start                   *
	 ****************************************/

	const oDialog = new Dialog({
		subHeader : new Bar({
			contentMiddle : [
				new SegmentedButton({
					width : "100%",
					items : [
						new SegmentedButtonItem({text: "Approved  1111111111"}),
						new SegmentedButtonItem({text: "Rejected 2222222222"}),
						new SegmentedButtonItem({text: "Lookup 3333333333"})
					]
				})]
		}),
		beginButton: new Button({text: "Close  1111111111", press: function() {oDialog.close();}})
	});

	const oDialog11 = new Dialog({
		content : [
			new Bar({
				contentMiddle : [
					new SegmentedButton({
					width : "100%",
					items : [
						new SegmentedButtonItem({text: "Approved  1111111111"}),
						new SegmentedButtonItem({text: "Button2"}),
						new SegmentedButtonItem({text: "Button3"})
					]
				})]
		})],
		beginButton: new Button({text: "Close  very long text", press: function() {oDialog11.close();}})
	});

	const oDialog12 = new Dialog({
		content : [
			new SegmentedButton({
			width : "100%",
			items : [
				new SegmentedButtonItem({text: "Approved  long text1"}),
				new SegmentedButtonItem({text: "Rejected long text2"}),
				new SegmentedButtonItem({text: "Lookup long text3"})
			]
		})],
		beginButton: new Button({text: "Close  1111111111", press: function() {oDialog12.close();}})
	});

	const oDialog2 = new Dialog({
		subHeader : new Bar({
			contentMiddle : [
				new SegmentedButton({
					width : "100%",
					items : [
						new SegmentedButtonItem({text: "All"}),
						new SegmentedButtonItem({text: "Drill", icon: IconPool.getIconURI("drill-down")}),
						new SegmentedButtonItem({text: "Text", icon: IconPool.getIconURI("e-care")})
					]
				})
			]
		}),
		content : [
			new Button({
				text : "Close",
				press: function () {
					oDialog2.close();
				}
			})
		]
	});

	const oDialog3 = new Dialog({
		subHeader : new Bar({
			contentMiddle : [
				new SegmentedButton({
					width : "100%",
					items : [
						new SegmentedButtonItem({icon: IconPool.getIconURI("edit")}),
						new SegmentedButtonItem({icon: IconPool.getIconURI("education")}),
						new SegmentedButtonItem({icon: IconPool.getIconURI("email-read")}),
						new SegmentedButtonItem({icon: IconPool.getIconURI("excel-attachment")})
					]
				})
			]
		}),
		content : [
			new Button({
				text : "Close",
				press: function () {
					oDialog3.close();
				}
			})
		]
	});

	vBox.addItem(createLabel("sap.m.Dialog:"));

	const oPanel1 = new Panel();

	oPanel1.addContent(new Button({
		text: "SB(w.100%)->Bar(middle)->Dialog(subHeader)",
		press: function () {
			oDialog.open();
		}
	}));

	oPanel1.addContent(new Button({
		text: "SB(w.100%)->Bar(middle)->Dialog(content)",
		press: function () {
			oDialog11.open();
		}
	}));

	oPanel1.addContent(new Button({
		text: "SB(w.100%)->Dialog(content)",
		press: function () {
			oDialog12.open();
		}
	}));
	oPanel1.addContent(new Button({
		text: "SB(w.100%)->Bar(middle)->Dialog(subHeader)-mixed content",
		press: function() {
			oDialog2.open();
		}
	}));

	oPanel1.addContent(new Button({
		text: "SB(w.100%)->Bar(middle)->Dialog(subHeader)-icons",
		press: function() {
			oDialog3.open();
		}
	}));

	vBox.addItem(oPanel1);

	/****************************************
	 * sap.m.Dialog End                     *
	 ****************************************/

	/****************************************
	 * sap.m.Toolbar Start                  *
	 ****************************************/

	const testPanel = new Panel({
		width: "700px"
	});

	const testBar = new Bar({
		contentMiddle : [
			new SegmentedButton({
				width: "100%",
				items : [
					new SegmentedButtonItem({text: "All"}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("synchronize"), text: "Button1"}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("add-equipment"), text: "Button2"}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("alert"), text: "Button3"})
				]
			})
		]
	});

	const testBar2 = new Bar({
		contentMiddle : [
			new Button({text: "Before SB", type: ButtonType.Emphasized}),
			new SegmentedButton({
				items : [
					new SegmentedButtonItem({text: "All"}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("attachment-video"), text: "Button1"}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("business-objects-experience"), text: "Button2"}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("cart-5"), text: "Button3"})
				]
			}),
			new Button({text: "After SB", type: ButtonType.Emphasized})
		]
	});

	const testBar3 = new Bar({
		contentMiddle : [
			new SegmentedButton({
				items : [
					new SegmentedButtonItem({text: "All"}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("chart-axis")}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("citizen-connect")}),
					new SegmentedButtonItem({icon: IconPool.getIconURI("collision")})
				]
			})
		]
	});

	testPanel.addContent(testBar);
	testPanel.addContent(testBar2);
	testPanel.addContent(testBar3);

	const oSBInToolBar1 = new SegmentedButton({
		items: [
			new SegmentedButtonItem({icon: "sap-icon://home"}),
			new SegmentedButtonItem({icon: "sap-icon://attachment"})
		]
	});

	const oSBInToolBar2 = new SegmentedButton({
		items : [
			new SegmentedButtonItem({text: "All"}),
			new SegmentedButtonItem({icon: IconPool.getIconURI("comment"), text: "Button1"}),
			new SegmentedButtonItem({icon: IconPool.getIconURI("create-leave-request"), text: "Button2"}),
			new SegmentedButtonItem({icon: IconPool.getIconURI("database"), text: "Button3"})
		]
	});

	const oSBInToolBar3 = new SegmentedButton({
		items : [
			new SegmentedButtonItem({text: "All"}),
			new SegmentedButtonItem({icon: IconPool.getIconURI("comment"), text: "Button1"}),
			new SegmentedButtonItem({icon: IconPool.getIconURI("create-leave-request"), text: "Button2"}),
			new SegmentedButtonItem({icon: IconPool.getIconURI("database"), text: "Button3"})
		]
	});

	// We add the class .sapMSegmentedButtonNoAutoWidth which is forcing the control to skip all width calculations
	// and make every button take the width it actually needs rather equalizing all button widths.
	oSBInToolBar3.addStyleClass("sapMSegmentedButtonNoAutoWidth");

	const oToolbar2 = new Toolbar({
		content: [
			oSBInToolBar1,
			oSBInToolBar2,
			oSBInToolBar3
		]
	});

	vBox.addItem(createLabel("Mixed content buttons in sap.m.ToolBar:"));
	vBox.addItem(oToolbar2);

	vBox.addItem(createLabel("Mixed content buttons in sap.m.Bar:"));
	vBox.addItem(testPanel);

	/****************************************
	 * sap.m.Toolbar End                    *
	 ****************************************/

	/****************************************
	 * sap.ui.layout.form.SimpleForm        *
	 ****************************************/

	XMLView.create({
		definition: document.getElementById('simpleFormExample').innerHTML
	}).then(function(oSimpleFormView) {
		vBox.addItem(createLabel("SegmentedButton in sap.ui.layout.form.SimpleForm:"));
		vBox.addItem(oSimpleFormView);
	});

	/****************************************
	 * sap.ui.layout.form.SimpleForm        *
	 ****************************************/

	/****************************************
	 * Items aggregation api Start          *
	 ****************************************/

	vBox.addItem(createLabel("New aggregation 'items' and 'selectedKey' property:"));

	const oSBItems = new SegmentedButton({
		selectedKey: "{/selectedKey}",
		items: {
			path : "/items",
			template : new SegmentedButtonItem({
				key: "{key}",
				text: "{text}",
				icon: "{icon}",
				enabled: "{enabled}",
				textDirection: "{textDirection}"
			})
		}
	});

	const oItems = {
		selectedKey: "b2",
		items: [
			{key: "b1", text: "Btn 1"},
			{key: "b2", text: "Btn 2"},
			{key: "b3", text: "Btn 3"}
		]
	};

	const oItems2 = {
		selectedKey: "b5",
		items: [
			{key: "b1", text: "btn 1", icon: "sap-icon://attachment"},
			{key: "b2", text: "btn 2", enabled: false},
			{key: "b3", text: "111 222 333", textDirection: TextDirection.RTL},
			{key: "b4", text: "btn 4", icon: "sap-icon://home"},
			{key: "b5", text: "btn 4", icon: "images/candy_x_46x46.png"},
			{key: "b6", text: "btn 4"},
			{key: "b7", text: "btn 4", icon: "images/candy_star_46x46.png"},
			{key: "b8", text: "btn 4"}
		]
	};

	const oSBItemsModel = new JSONModel();
	oSBItemsModel.setData(oItems);
	oSBItems.setModel(oSBItemsModel);

	vBox.addItem(oSBItems);

	const oPanel2 = new Panel();

	oPanel2.addContent(new Button({
		text: "getSelectedKey()",
		press: function() {
			MessageToast.show(oSBItems.getSelectedKey());
		}
	}));
	oPanel2.addContent(new Button({
		text: "setSelectedKey('b3')",
		press: function() {
			oSBItems.setSelectedKey("b3");
		}
	}));
	oPanel2.addContent(new Button({
		text: "Model 1",
		press: function() {
			oSBItemsModel.setData(oItems);
		}
	}));
	oPanel2.addContent(new Button({
		text: "Model 2",
		press: function() {
			oSBItemsModel.setData(oItems2);
		}
	}));

	vBox.addItem(oPanel2);

	/****************************************
	 * Items aggregation api End            *
	 ****************************************/

	/****************************************
	 * sap.m.InputListItem Start            *
	 ****************************************/

	vBox.addItem(createLabel("sap.m.InputListItem:"));

	const oList = new List({
		items: [
			new InputListItem({
				label: "Outside volume",
				content: new SegmentedButton({
					selectedKey: "b2",
					items: [
						new SegmentedButtonItem({key: "b1", text: "High"}),
						new SegmentedButtonItem({key: "b2", text: "Low"}),
						new SegmentedButtonItem({key: "b3", text: "Mute"})
					]
				})
			}),
			new InputListItem({
				label: "Inside volume",
				content: new SegmentedButton({
					selectedKey: "b3",
					items: [
						new SegmentedButtonItem({key: "b1", text: "High"}),
						new SegmentedButtonItem({key: "b2", text: "Low"}),
						new SegmentedButtonItem({key: "b3", text: "Mute"})
					]
				})
			})
		]
	});

	vBox.addItem(oList);

	/****************************************
	 * sap.m.InputListItem End              *
	 ****************************************/

	/****************************************
	 * TextDirection Start                  *
	 ****************************************/

	vBox.addItem(createLabel("TextDirection with telephone number:"));

	const oRtlSb = new SegmentedButton({
		items: [
			new SegmentedButtonItem({text: "(+359) 111 222 333", textDirection: TextDirection.RTL}),
			new SegmentedButtonItem({text: "(+359) 111 222 333", textDirection: TextDirection.LTR})
		]

	});

	vBox.addItem(oRtlSb);

	/****************************************
	 * TextDirection End                    *
	 ****************************************/

	/****************************************
	 * View                                 *
	 ****************************************/

	vBox.addItem(createLabel("Content Modes:"));

	var oSegBtnContentFit = new SegmentedButton({
			contentMode: "ContentFit",
			items: [
				new SegmentedButtonItem({key: "large", text: "This is a very large text for demonstration purposes"}),
				new SegmentedButtonItem({key: "medium", text: "Medium text"}),
				new SegmentedButtonItem({key: "small", text: "Small"}),
				new SegmentedButtonItem({key: "icon", icon: "sap-icon://attachment"})
			]
		});
	vBox.addItem(oSegBtnContentFit);

	var oSegBtnEqualSized = new SegmentedButton({
			contentMode: "EqualSized",
			items: [
				new SegmentedButtonItem({key: "large", text: "This is a very large text for demonstration purposes"}),
				new SegmentedButtonItem({key: "medium", text: "Medium text"}),
				new SegmentedButtonItem({key: "small", text: "Small"}),
				new SegmentedButtonItem({key: "icon", icon: "sap-icon://attachment"})
			]
	});

	vBox.addItem(oSegBtnEqualSized);

	oPage2.addContent(vBox);
	oApp.addPage(oPage, true).addPage(oPage2, false);
});