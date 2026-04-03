sap.ui.define([
	"sap/m/CheckBox",
	"sap/m/DatePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/Select",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/ToggleButton",
	"sap/ui/core/Item",
	"sap/ui/core/Title",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/String",
	"sap/ui/core/library"
], function(CheckBox, DatePicker, Input, Label, RadioButton, RadioButtonGroup, Select, Text, Toolbar, ToolbarSpacer, mTitle, ToggleButton, Item, Title, Form, FormContainer, FormElement, ColumnLayout, ColumnElementData, ColumnContainerData, SemanticFormElement, JSONModel, DateType, StringType, CoreLib) {
	"use strict";

	const oModel = new JSONModel({
		name: "Mustermann",
		firstName: "Max",
		dateOfBirth: new Date(1950, 10, 4),
		gender: "male",
		info: "additional information",
		street: "Musterstraße",
		housenumber: 1,
		postCode: "12345",
		city: "Musterstadt",
		country: "DE",
		countries: [{key: "GB", text: "England"}, {key: "US", text: "USA"}, {key: "DE", text: "Germany"}],
		shipping: true
	});

	new Form("F1",{
		title: new Title("F1-Title", {text: "Customer data", level: CoreLib.TitleLevel.H2}),
		editable: true,
		layout: new ColumnLayout("L1"),
		formContainers: [
			new FormContainer("F1C1", {
				title: new Title("F1C1-Title", {text: "Contact data", level: CoreLib.TitleLevel.H3}),
				formElements: [
					new FormElement("F1C1FE1", {
						label: "Name",
						fields: [new Input("F1C1FE1-F1", {value: {path: '/name', type: new StringType()}})]
					}),
					new FormElement("F1C1FE2", {
						label: "First name",
						fields: [new Input("F1C1FE2-F1", {value: {path: '/firstName', type: new StringType()}})]
					}),
					new FormElement("F1C1FE3", {
						label: "Date of birth",
						fields: [new DatePicker("F1C1FE3-F1", {value: {path: '/dateOfBirth', type: new DateType({style: "long"})}})]
					}),
					new FormElement("F1C1FE4", {
						label: "Gender",
						fields: [new RadioButtonGroup("F1C1FE4-F1", {
							columns: 3,
							buttons: [
								new RadioButton("F1C1FE4-F1-RB1", {text: "male", selected: {path: "/gender", formatter: (gender) => { return gender === "male"; }}}),
								new RadioButton("F1C1FE4-F1-RB2", {text: "female", selected: {path: "/gender", formatter: (gender) => { return gender === "female"; }}}),
								new RadioButton("F1C1FE4-F1-RB3", {text: "other", selected: {path: "/gender", formatter: (gender) => { return gender === "other"; }}})
								]
							})]
					}),
					new FormElement("F1C1FE5", {
						label: "Info",
						fields: [new Text("F1C1FE5-F1", {text: {path: '/info', type: new StringType()}})]
					})
				]
			}),
			new FormContainer("F1C2", {
				toolbar: new Toolbar("F1C2-TB", {
					content: [new mTitle("F1C2-Title", {text: "Address", level: CoreLib.TitleLevel.H3, titleStyle: CoreLib.TitleLevel.H6}),
					          new ToolbarSpacer("F1C2-TB-Spacer"),
					          new ToggleButton("F1C2-TB-Button", {text: "my action"})
					          ]
				}),
				formElements: [
					new SemanticFormElement("F1C2FE1", {
						fieldLabels: [new Label("F1C2FE1-L1", {text: "Street"}),
						              new Label("F1C2FE1-L2", {text: "Housenumber"})],
						fields: [new Input("F1C2FE1-F1", {value: {path: "/street", type: new StringType()}}),
								 new Input("F1C2FE1-F2", {value: {path: "/housenumber", type: new StringType()}, layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]
					}),
					new SemanticFormElement("F1C2FE2", {
						fieldLabels: [new Label("F1C2FE2-L1", {text: "Post code"}),
						              new Label("F1C2FE2-L2", {text: "City"})],
						fields: [new Input("F1C2FE2-F1", {value: {path: "/postCode", type: new StringType({}, {maxLength: 5})}, layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
								 new Input("F1C2FE2-F2", {value: {path: "/city", type: new StringType()}})]
					}),
					new FormElement("F1C2FE3", {
						label: "Country",
						fields: [new Select("F1C2FE3-F1", {
							selectedKey: {path: "/country", type: new StringType({}, {maxLength: 2})},
							items: {path: "/countries", template: new Item("F1C2FE3-F1-Item", {key: {path: "key", type: new StringType({}, {maxLength: 2})}, text: {path: "text", type: new StringType()}})}
						})]
					}),
					new FormElement("F1C2FE4", {
						label: "Shipping Address",
						fields: [new CheckBox("F1C2FE4-F1", {selected: {path: '/shipping'}})]
					})
				]
			})],
		models: oModel
	}).placeAt("content1");

	new Form("F2",{
		toolbar: new Toolbar("F2-TB", {
			content: [new mTitle("F2-TB-Title", {text: "Employee", level: CoreLib.TitleLevel.H2, titleStyle: CoreLib.TitleLevel.H5}),
					  new ToolbarSpacer("F2-TB-Spacer"),
					  new ToggleButton("F2-TB-Button", {text: "another action"})
					 ]
		}),
		editable: false,
		layout: new ColumnLayout("L2"),
		formContainers: [
			new FormContainer("F2C1", {
				title: new Title("F2C1-Title", {text: "Contact data", level: CoreLib.TitleLevel.H3}),
				formElements: [
					new FormElement("F2C1FE1", {
						label: "Name",
						fields: [new Text("F2C1FE1-F1", {text: {path: '/name', type: new StringType()}})]
					}),
					new FormElement("F2C1FE2", {
						label: "First name",
						fields: [new Text("F2C1FE2-F1", {text: {path: '/firstName', type: new StringType()}})]
					}),
					new FormElement("F2C1FE3", {
						label: "Date of birth",
						fields: [new Text("F2C1FE3-F1", {text: {path: '/dateOfBirth', type: new DateType({style: "long"})}})]
					}),
					new FormElement("F2C1FE4", {
						label: "Gender",
						fields: [new Text("F2C1FE4-F1", {text: {path: '/gender', type: new StringType()}})]
					}),
					new FormElement("F2C1FE5", {
						label: "Info",
						fields: [new Text("F2C1FE5-F1", {text: {path: '/info', type: new StringType()}})]
					})
					]
			}),
			new FormContainer("F2C2", {
				toolbar: new Toolbar("F2C2-TB", {
					content: [new mTitle("F2C2-Title", {text: "Address", level: CoreLib.TitleLevel.H3, titleStyle: CoreLib.TitleLevel.H6}),
					          new ToolbarSpacer("F2C2-TB-Spacer"),
					          new ToggleButton("F2C2-TB-Button", {text: "third action"})
					          ]
				}),
				formElements: [
					new SemanticFormElement("F2C2FE1", {
						fieldLabels: [new Label("F2C2FE1-L1", {text: "Street"}),
						              new Label("F2C2FE1-L2", {text: "Housenumber"})],
						fields: [new Text("F2C2FE1-F1", {text: {path: "/street", type: new StringType()}}),
								 new Text("F2C2FE1-F2", {text: {path: "/housenumber", type: new StringType()}, layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]
					}),
					new SemanticFormElement("F2C2FE2", {
						fieldLabels: [new Label("F2C2FE2-L1", {text: "Post code"}),
						              new Label("F2C2FE2-L2", {text: "City"})],
						fields: [new Text("F2C2FE2-F1", {text: {path: "/postCode", type: new StringType({}, {maxLength: 5})}, layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
								 new Text("F2C2FE2-F2", {text: {path: "/city", type: new StringType()}})]
					}),
					new FormElement("F2C2FE3", {
						label: "Country",
						fields: [new Text("F2C2FE3-F1", {text: {parts: [{path: "/country", type: new StringType({}, {maxLength: 2})}, {path: "/countries"}], formatter: (sKey, aCounties) => {
									const oCountry = aCounties.find((country) => country.key === sKey);
									return oCountry ? oCountry.text : "";
								}}})]
					}),
					new FormElement("F2C2FE4", {
						label: "Shipping Address",
						fields: [new CheckBox("F2C2FE4-F1", {selected: {path: '/shipping'}, displayOnly: true})]
					})
				]
			})],
		models: oModel
	}).placeAt("content2");

	new Form("F3",{
		title: new Title("F3-Title", {text: "Supplier", level: CoreLib.TitleLevel.H2}),
		editable: false,
		layout: new ColumnLayout("L3"),
		formContainers: [
			new FormContainer("F3C1", {
				formElements: [
					new FormElement("F3C1FE1", {
						label: "Name",
						fields: [new Text("F3C1FE1-F1", {text: {path: '/name', type: new StringType()}})]
					}),
					new FormElement("F3C1FE2", {
						label: "First name",
						fields: [new Text("F3C1FE2-F1", {text: {path: '/firstName', type: new StringType()}})]
					}),
					new FormElement("F3C1FE3", {
						label: "Date of birth",
						fields: [new Text("F3C1FE3-F1", {text: {path: '/dateOfBirth', type: new DateType({style: "long"})}})]
					}),
					new FormElement("F3C1FE4", {
						label: "Gender",
						fields: [new Text("F3C1FE4-F1", {text: {path: '/gender', type: new StringType()}})]
					}),
					new FormElement("F3C1FE5", {
						label: "Info",
						fields: [new Text("F3C1FE5-F1", {text: {path: '/info', type: new StringType()}})]
					}),
					new SemanticFormElement("F3C1FE6", {
						fieldLabels: [new Label("F3C1FE6-L1", {text: "Street"}),
						              new Label("F3C1FE6-L2", {text: "Housenumber"})],
						fields: [new Text("F3C1FE6-F1", {text: {path: "/street", type: new StringType()}}),
								 new Text("F3C1FE6-F2", {text: {path: "/housenumber", type: new StringType()}, layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]
					}),
					new SemanticFormElement("F3C1FE7", {
						fieldLabels: [new Label("F3C1FE7-L1", {text: "Post code"}),
						              new Label("F3C1FE7-L2", {text: "City"})],
						fields: [new Text("F3C1FE7-F1", {text: {path: "/postCode", type: new StringType({}, {maxLength: 5})}, layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
								 new Text("F3C1FE7-F2", {text: {path: "/city", type: new StringType()}})]
					}),
					new FormElement("F3C1FE8", {
						label: "Country",
						fields: [new Text("F3C1FE8-F1", {text: {parts: [{path: "/country", type: new StringType({}, {maxLength: 2})}, {path: "/countries"}], formatter: (sKey, aCounties) => {
									const oCountry = aCounties.find((country) => country.key === sKey);
									return oCountry ? oCountry.text : "";
								}}})]
					}),
					new FormElement("F3C1FE9", {
						label: "Shipping Address",
						fields: [new CheckBox("F3C1FE9-F1", {selected: {path: '/shipping'}, displayOnly: true})]
					})
				]
			})],
		models: oModel
	}).placeAt("content3");
});
