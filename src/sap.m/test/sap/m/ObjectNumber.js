sap.ui.define([
	"sap/m/Label",
	"sap/m/ObjectNumber",
	"sap/ui/core/library",
	"sap/ui/core/Item",
	"sap/m/Select",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/library",
	"sap/m/HBox"
], function(Label, ObjectNumber, coreLibrary, Item, Select, App, Page, mobileLibrary, HBox) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	const TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	const TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.ObjectNumberDisplayMode
	const ObjectNumberDisplayMode = mobileLibrary.ObjectNumberDisplayMode;

	const txt1 = new Label({text:"ObjectNumber (emphasized by default):"});

	const on1 = new ObjectNumber("on1", {
		number: "12",
		unit: "Euro",
		emptyIndicatorMode: "Auto"
	});

	const txt2 = new Label({text:"Non-emphasized ObjectNumber:"});

	const on2 = new ObjectNumber("on2", {
		number: "1.50",
		unit: "Euro",
		emphasized: false
	});

	const txt23 = new Label({text:"Empty Text ObjectNumber:"});

	const on23 = new ObjectNumber("on23", {
		number: "",
		unit: "Euro",
		emptyIndicatorMode: "On"
	});

	const txt3 = new sap.m.Title({
		text:"ObjectNumber state changes"
	});

	const on3 = new ObjectNumber("on3", {
		number: "1.50",
		unit: "Euro",
		emphasized: false
	});

	const txt4 = new Label({text: "textDirection: LTR, textAlign: Begin"});

	const on4 = new ObjectNumber("on4", {
		number: "1.50",
		unit: "Euro",
		emphasized: true,
		textDirection: TextDirection.LTR,
		textAlign: TextAlign.Begin
	});

	const txt5 = new Label({text: "textDirection: LTR, textAlign: End"});

	const on5 = new ObjectNumber("on5", {
		number: "1.50",
		unit: "Euro",
		emphasized: true,
		textDirection: TextDirection.LTR,
		textAlign: TextAlign.End
	});

	const txt6 = new Label({text: "textDirection: RTL, textAlign: Begin"});

	const on6 = new ObjectNumber("on6", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.Begin
	});

	const txt7 = new Label({text: "textDirection: RTL, textAlign: End"});

	const on7 = new ObjectNumber("on7", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.End
	});

	const txt8 = new Label({text: "textDirection: RTL, textAlign: Left"});

	const on8 = new ObjectNumber("on8", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.Left
	});

	const txt9 = new Label({text: "textDirection: RTL, textAlign: Right"});

	const on9 = new ObjectNumber("on9", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.Right
	});

	const txt10 = new Label({text: "Active ObjectNumber", labelFor: "on10"});

	const on10 = new ObjectNumber("on10", {
		number: "1.50",
		active: true
	});

	const on102 = new ObjectNumber("on102", {
		number: "1.50",
		unit: "EUR",
		active: true
	});

	const txt11 = new Label({text: "Inverted ObjectNumber"});

	const on11 = new ObjectNumber("on11", {
		number: "1.50",
		inverted: true
	});

	const txt12 = new Label({text: "Large ObjectNumber"});

	const on12 = new ObjectNumber("on12", {
		number: "1.50"
	}).addStyleClass("sapMObjectNumberLarge");

	const txt13 = new Label({text: "Inverted active ObjectNumber", labelFor: "on13"});

	const on13 = new ObjectNumber("on13", {
		number: "1.50",
		active: true,
		inverted: true
	});

	const txt14 = new Label({text: "Active large ObjectNumber", labelFor: "on14"});

	const on14 = new ObjectNumber("on14", {
		number: "1.50",
		active: true
	}).addStyleClass("sapMObjectNumberLarge");

	const on142 = new ObjectNumber("on142", {
		number: "1.50",
		unit: "EUR",
		active: true
	}).addStyleClass("sapMObjectNumberLarge");

	const txt15 = new Label({text: "Inverted large ObjectNumber"});

	const on15 = new ObjectNumber("on15", {
		number: "1.50",
		inverted: true
	}).addStyleClass("sapMObjectNumberLarge");

	const txt16 = new Label({text: "Inverted active large ObjectNumber", labelFor: "on16"});

	const on16 = new ObjectNumber("on16", {
		number: "1.50",
		active: true,
		inverted: true
	}).addStyleClass("sapMObjectNumberLarge");

	const txt17 = new Label({text: "Currency display mode (USD)"});

	const on17 = new ObjectNumber("on17", {
		number: "1234.5",
		unit: "USD",
		useSymbol: false,
		displayMode: ObjectNumberDisplayMode.Currency
	});

	const txt18 = new Label({text: "Currency display mode, symbol (EUR)"});

	const on18 = new ObjectNumber("on18", {
		number: "9876.543",
		unit: "EUR",
		displayMode: ObjectNumberDisplayMode.Currency,
		useSymbol: true
	});

	const txt19 = new Label({text: "Unit display mode (kg)"});

	const on19 = new ObjectNumber("on19", {
		number: "42.5",
		unit: "kg",
		displayMode: ObjectNumberDisplayMode.Unit
	});

	const txt20 = new Label({text: "Unit display mode (km/h)"});

	const on20 = new ObjectNumber("on20", {
		number: "120.75",
		unit: "km/h",
		displayMode: ObjectNumberDisplayMode.Unit
	});

	// items
	const oItemNone = new Item({
		key: ValueState.None,
		text: "None"
	}),

	oItemWarning = new Item({
		key: ValueState.Warning,
		text: "Warning"
	}),

	oItemError = new Item({
		key: ValueState.Error,
		text: "Error"
	}),

	oItemSuccess = new Item({
		key: ValueState.Success,
		text: "Success"
	}),

	//Object Number control to demonstrate state changes
	oSelectLabel = new Label({
		text:"Select a state from the dropdown:",
		labelFor: "select"
	}),

	oStateSelect = new Select("select", {
		name: "select-object-state",
		items: [oItemNone, oItemWarning, oItemError, oItemSuccess],
		change: function(oControlEvent) {
			on3.setState(oControlEvent.getParameter("selectedItem").getKey());
		}
	});

	const oVBox = new sap.m.VBox().addStyleClass("sapUiSmallMargin");
		oVBox.addItem(txt3);
		oVBox.addItem(oSelectLabel);
		oVBox.addItem(oStateSelect);
		oVBox.addItem(on3.addStyleClass("sapUiTinyMarginTop"));

	const app = new App();
	const page = new Page({
		title: "Object Number",
		titleLevel: TitleLevel.H1,
		enableScrolling : true,
		content: [
			txt1,
			on1,
			txt2,
			on2,
			txt23,
			on23,
			oVBox,
			txt4,
			on4,
			txt5,
			on5,
			txt6,
			on6,
			txt7,
			on7,
			txt8,
			on8,
			txt9,
			on9,
			txt10,
			on10,
			on102,
			txt11,
			on11,
			txt12,
			on12,
			txt13,
			on13,
			txt14,
			on14,
			on142,
			txt15,
			on15,
			txt16,
			on16,
			txt17,
			new HBox({width: "30%", justifyContent: "End", items: [on17]}),
			txt18,
			new HBox({width: "30%", justifyContent: "End", items: [on18]}),
			txt19,
			new HBox({width: "30%", justifyContent: "End", items: [on19]}),
			txt20,
			new HBox({width: "30%", justifyContent: "End", items: [on20]})
		]
	});
	app.setInitialPage(page.getId());
	app.addPage(page);

	app.placeAt('body');
});
