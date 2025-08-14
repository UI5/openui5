sap.ui.define([
	"sap/m/CheckBox",
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
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/String"
], function(CheckBox, DatePicker, Input, Label, RadioButton, RadioButtonGroup, Select, Text, Item, Title, Form, FormContainer, FormElement, ColumnLayout, ColumnElementData, ColumnContainerData, SemanticFormElement, JSONModel, DateType, StringType) {
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
		title: new Title({text: "Customer data"}),
		editable: true,
		layout: new ColumnLayout("L1"),
		formContainers: [
			new FormContainer("F1C1", {
				title: "contact data",
				formElements: [
					new FormElement("F1C1FE1", {
						label: "Name",
						fields: [new Input({value: {path: '/name', type: new StringType()}})]
					}),
					new FormElement("F1C1FE2", {
						label: "First name",
						fields: [new Input({value: {path: '/firstName', type: new StringType()}})]
					}),
					new FormElement("F1C1FE3", {
						label: "Date of birth",
						fields: [new DatePicker({value: {path: '/dateOfBirth', type: new DateType({style: "long"})}})]
					}),
					new FormElement("F1C1FE4", {
						label: "Gender",
						fields: [new RadioButtonGroup({
							columns: 3,
							buttons: [
								new RadioButton({text: "male", selected: {path: "/gender", formatter: (gender) => { return gender === "male"; }}}),
								new RadioButton({text: "female", selected: {path: "/gender", formatter: (gender) => { return gender === "female"; }}}),
								new RadioButton({text: "other", selected: {path: "/gender", formatter: (gender) => { return gender === "other"; }}})
								]
							})]
					}),
					new FormElement("F1C1FE5", {
						label: "Info",
						fields: [new Text({text: {path: '/info', type: new StringType()}})]
					})
				]
			}),
			new FormContainer("F1C2", {
				title: new Title({text: "Address"}),
				formElements: [
					new SemanticFormElement("F1C2FE1", {
						fieldLabels: [new Label({text: "Street"}),
						              new Label({text: "Housenumber"})],
						fields: [new Input({value: {path: "/street", type: new StringType()}}),
								 new Input({value: {path: "/housenumber", type: new StringType()}, layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]
					}),
					new SemanticFormElement("F1C2FE2", {
						fieldLabels: [new Label({text: "Post code"}),
						              new Label({text: "City"})],
						fields: [new Input({value: {path: "/postCode", type: new StringType({}, {maxLength: 5})}, layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
								 new Input({value: {path: "/city", type: new StringType()}})]
					}),
					new FormElement("F1C2FE3", {
						label: "Country",
						fields: [new Select({
							selectedKey: {path: "/country", type: new StringType({}, {maxLength: 2})},
							items: {path: "/countries", template: new Item({key: {path: "key", type: new StringType({}, {maxLength: 2})}, text: {path: "text", type: new StringType()}})}
						})]
					}),
					new FormElement("F1C2FE4", {
						label: "Shipping Address",
						fields: [new CheckBox({selected: {path: '/shipping'}})]
					})
				]
			})],
		models: oModel
	}).placeAt("content1");

	new Form("F2",{
		title: new Title({text: "Employee"}),
		editable: false,
		layout: new ColumnLayout("L2"),
		formContainers: [
			new FormContainer("F2C1", {
				title: "contact data",
				formElements: [
					new FormElement("F2C1FE1", {
						label: "Name",
						fields: [new Text({text: {path: '/name', type: new StringType()}})]
					}),
					new FormElement("F2C1FE2", {
						label: "First name",
						fields: [new Text({text: {path: '/firstName', type: new StringType()}})]
					}),
					new FormElement("F2C1FE3", {
						label: "Date of birth",
						fields: [new Text({text: {path: '/dateOfBirth', type: new DateType({style: "long"})}})]
					}),
					new FormElement("F2C1FE4", {
						label: "Gender",
						fields: [new Text({text: {path: '/gender', type: new StringType()}})]
					}),
					new FormElement("F2C1FE5", {
						label: "Info",
						fields: [new Text({text: {path: '/info', type: new StringType()}})]
					})
					]
			}),
			new FormContainer("F2C2", {
				title: new Title({text: "Address"}),
				formElements: [
					new SemanticFormElement("F2C2FE1", {
						fieldLabels: [new Label({text: "Street"}),
						              new Label({text: "Housenumber"})],
						fields: [new Text({text: {path: "/street", type: new StringType()}}),
								 new Text({text: {path: "/housenumber", type: new StringType()}, layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]
					}),
					new SemanticFormElement("F2C2FE2", {
						fieldLabels: [new Label({text: "Post code"}),
						              new Label({text: "City"})],
						fields: [new Text({text: {path: "/postCode", type: new StringType({}, {maxLength: 5})}, layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
								 new Text({text: {path: "/city", type: new StringType()}})]
					}),
					new FormElement("F2C2FE3", {
						label: "Country",
						fields: [new Text({text: {parts: [{path: "/country", type: new StringType({}, {maxLength: 2})}, {path: "/countries"}], formatter: (sKey, aCounties) => {
									const oCountry = aCounties.find((country) => country.key === sKey);
									return oCountry ? oCountry.text : "";
								}}})]
					}),
					new FormElement("F2C2FE4", {
						label: "Shipping Address",
						fields: [new CheckBox({selected: {path: '/shipping'}, displayOnly: true})]
					})
				]
			})],
		models: oModel
	}).placeAt("content2");
});
