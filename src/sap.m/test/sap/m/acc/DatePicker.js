sap.ui.define([
	"sap/m/App",
	"sap/m/DatePicker",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, DatePicker, Label, Text, Page, VerticalLayout, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handleChange(oEvent){
		var oDP = oEvent.getSource();
		var bValid = oEvent.getParameter("valid");
		if (bValid) {
			oDP.setValueState(ValueState.None);
		} else {
			oDP.setValueState(ValueState.Error);
		}
	}

	var oPageLayout = new VerticalLayout({
		content: [
			new Text("label0", {
				text: "Deadline"
			}),
			new DatePicker("DP0", {
				displayFormat: "MM/yyyy",
				change: handleChange,
				ariaLabelledBy: "label0"
			}),
			new Text("label1", {
				text: "Deadline"
			}),
			new DatePicker("DP1", {
				displayFormat: "yyyy",
				change: handleChange,
				ariaLabelledBy: "label1"
			}),
			new Label({
				text: "Deadline",
				labelFor: "DP1",
				wrapping: true
			}),
			new DatePicker("DP2", {
				change: handleChange
			}),
			new Label({
				text: "Showcase value format property",
				labelFor: "DP3",
				wrapping: true
			}),
			new DatePicker("DP3", {
				value: "2014-03-26",
				valueFormat: "yyyy-MM-dd",
				displayFormat: "long",
				change: handleChange
			})
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "DatePicker Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [ oPageLayout ]
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
