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
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/GridData",
	"sap/ui/core/library"
], function(DatePicker, Input, Label, RadioButton, RadioButtonGroup, Select, Text, Item, Title, Form, FormContainer, FormElement, ResponsiveGridLayout, GridData, CoreLib) {
	"use strict";

	new Form("F1", {
		title: new Title("F1-Title", {text: "Customer data", level: CoreLib.TitleLevel.H2}),
		editable: true,
		layout: new ResponsiveGridLayout("L1"),
		formContainers: [
			new FormContainer("F1C1", {
				title: new Title("F1C1-Title", {text: "Contact data", level: CoreLib.TitleLevel.H3}),
				formElements: [
					new FormElement("F1C1FE1", {
						label: "Name",
						fields: [new Input("F1C1FE1-F1", {value: "Mustermann"})]
					}),
					new FormElement("F1C1FE2", {
						label: "First name",
						fields: [new Input("F1C1FE2-F1", {value: "Max"})]
					}),
					new FormElement("F1C1FE3", {
						label: "Date of birth",
						fields: [new DatePicker("F1C1FE3-F1")]
					}),
					new FormElement("F1C1FE4", {
						label: "Gender",
						fields: [new RadioButtonGroup("F1C1FE4-F1", {
							columns: 2,
							buttons: [
								new RadioButton("F1C1FE4-F1-RB1", {text: "male", selected: true}),
								new RadioButton("F1C1FE4-F1-RB2", {text: "female", selected: false})
								]
							})]
					}),
					new FormElement("F1C1FE5", {
						label: "Info",
						fields: [new Text("F1C1FE5-F1", {text:"additional information"})]
					})
					]
			}),
			new FormContainer("F1C2", {
				title: new Title("F1C2-Title", {text: "Address", level: CoreLib.TitleLevel.H3}),
				formElements: [
					new FormElement("F1C2FE1", {
						label: new Label("F1C2FE1-L1", {text:"Street / Housenumber"}),
						fields: [new Input("F1C2FE1-F1", {placeholder: "Street"}),
						         new Input("F1C2FE1-F2", {placeholder: "Number", layoutData: new GridData({span: "L2 M2 S2"})
						         })]
					}),
					new FormElement("F1C2FE2", {
						label: "City",
						fields: [new Input("F1C2FE2-F1")]
					}),
					new FormElement("F1C2FE3", {
						label: new Label("F1C2FE3-L1", {text: "Post code"}),
						fields: [new Input("F1C2FE3-F1", {layoutData: new GridData({span: "L2 M2 S2"})})]
					}),
					new FormElement("F1C2FE4", {
						label: "Country",
						fields: [new Select("F1C2FE4-F1", {
							items: [new Item("F1C2FE4-F1-Item1", {text: "Germany"}),
							        new Item("F1C2FE4-F1-Item2", {text: "USA"}),
							        new Item("F1C2FE4-F1-Item3", {text: "England"})]
						})]
					})
				]
			})]
	}).placeAt("content1");

	new Form("F2", {
		title: new Title("F2-Title", {text: "Employee", level: CoreLib.TitleLevel.H2}),
		editable: false,
		layout: new ResponsiveGridLayout("L2"),
		formContainers: [
			new FormContainer("F2C1", {
				title: new Title("F2C1-Title", {text: "Contact data", level: CoreLib.TitleLevel.H3}),
				formElements: [
					new FormElement("F2C1FE1", {
						label: "Name",
						fields: [new Text("F2C1FE1-F1", {text: "Mustermann"})]
					}),
					new FormElement("F2C1FE2", {
						label: "First name",
						fields: [new Text("F2C1FE2-F1", {text: "Max"})]
					}),
					new FormElement("F2C1FE3", {
						label: "Info",
						fields: [new Text("F2C1FE3-F1", {text:"additional information"})]
					})
					]
			}),
			new FormContainer("F2C2", {
				title: new Title("F2C2-Title", {text: "Address", level: CoreLib.TitleLevel.H3}),
				formElements: [
					new FormElement("F2C2FE1", {
						label: new Label("F2C2FE1-L1", {text:"Street / Housenumber"}),
						fields: [new Text("F2C2FE1-F1", {text: "Main street"}),
						         new Text("F2C2FE1-F2", {text: "1", layoutData: new GridData({span: "L2 M2 S2"})})]
					}),
					new FormElement("F2C2FE2", {
						label: "City",
						fields: [new Text("F2C2FE2-F1", {text: "Main city"})]
					}),
					new FormElement("F2C2FE3", {
						label: new Label("F2C2FE3-L1", {text: "Post code"}),
						fields: [new Text("F2C2FE3-F1", {text: "12345", layoutData: new GridData({span: "L2 M2 S2"})})]
					})
				]
			})]
	}).placeAt("content2");

	new Form("F3", {
		title: new Title("F3-Title", {text: "Supplier", level: CoreLib.TitleLevel.H2}),
		editable: true,
		layout: new ResponsiveGridLayout("L3"),
		formContainers: [
			new FormContainer("F3C1", {
				formElements: [
					new FormElement("F3C1FE1", {
						label: "Name",
						fields: [new Input("F3C1FE1-F1", {value: "Mustermann"})]
					}),
					new FormElement("F3C1FE2", {
						label: "First name",
						fields: [new Input("F3C1FE2-F1", {value: "Max"})]
					}),
					new FormElement("F3C1FE3", {
						label: "Date of birth",
						fields: [new DatePicker("F3C1FE3-F1")]
					}),
					new FormElement("F3C1FE4", {
						label: new Label("F3C1FE4-L1", {text:"Street / Housenumber"}),
						fields: [new Input("F3C1FE4-F1", {placeholder: "Street"}),
						         new Input("F3C1FE4-F2", {placeholder: "Number", layoutData: new GridData({span: "L2 M2 S2"})
						         })]
					}),
					new FormElement("F3C1FE5", {
						label: "City",
						fields: [new Input("F3C1FE5-F1")]
					}),
					new FormElement("F3C1FE6", {
						label: new Label("F3C1FE6-L1", {text: "Post code"}),
						fields: [new Input("F3C1FE6-F1", {layoutData: new GridData({span: "L2 M2 S2"})})]
					}),
					new FormElement("F3C1FE7", {
						label: "Country",
						fields: [new Select("F3C1FE7-F1", {
							items: [new Item("F3C1FE7-F1-Item1", {text: "Germany"}),
							        new Item("F3C1FE7-F1-Item2", {text: "USA"}),
							        new Item("F3C1FE7-F1-Item3", {text: "England"})]
						})]
					})
				]
			})]
	}).placeAt("content3");

});
