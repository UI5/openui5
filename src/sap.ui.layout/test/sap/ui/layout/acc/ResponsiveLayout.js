sap.ui.define([
	"sap/m/DatePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/Select",
	"sap/m/Text",
	"sap/ui/core/Item",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/library",
	"sap/ui/core/library"
], function(DatePicker, Input, Label, RadioButton, RadioButtonGroup, Select, Text, Item, Title, SimpleForm, LayoutLib, CoreLib) {
	"use strict";

	new SimpleForm("SF1", {
		layout: LayoutLib.form.SimpleFormLayout.ResponsiveLayout,
		maxContainerCols: 2,
		editable: true,
		title: new Title({text: "Customer data", level: CoreLib.TitleLevel.H2}),
		content:[
			new Title({text: "Contact data", level: CoreLib.TitleLevel.H3}),
			new Label({text: "Name"}),
			new Input({value: "Mustermann"}),
			new Label({text: "First name"}),
			new Input({value: "Max"}),
			new Label({text: "Date of birth"}),
			new DatePicker(),
			new Label({text: "Gender"}),
			new RadioButtonGroup({
				columns: 2,
				buttons: [
					new RadioButton({text: "male", selected: true}),
					new RadioButton({text: "female", selected: false})
					]
				}),
			new Label({text: "Info"}),
			new Text({text: "additional information"}),
			new Title({text: "Address", level: CoreLib.TitleLevel.H3}),
			new Label({text: "Street / Housenumber"}),
			new Input({placeholder: "Street"}),
			new Input({placeholder: "Number"}),
			new Label({text: "City"}),
			new Input(),
			new Label({text: "Post code"}),
			new Input(),
			new Label({text: "Country"}),
			new Select({
				items: [
					new Item({text: "Germany"}),
					new Item({text: "USA"}),
					new Item({text: "England"})
				]
			})
		]
	}).placeAt("content");
});
