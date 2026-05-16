sap.ui.define([
	"sap/m/MaskInputRule",
	"sap/ui/model/json/JSONModel",
	"sap/m/MaskInput",
	"sap/m/Label",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/Grid",
	"sap/m/VBox",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/FormattedText",
	"sap/m/Link",
	"sap/m/MessageToast"
], function(MaskInputRule, JSONModel, MaskInput, Label, App, Page, Grid, VBox, SimpleForm, FormattedText, Link, MessageToast) {
	"use strict";

	var ruleCollection = [
		{name: "allCharactersRule", rule: new MaskInputRule("allCharactersRule", { maskFormatSymbol: "~", regex: "[^_]"})},
		{name: "defaultRule", rule: new MaskInputRule("defaultRule")},
		{name: "lowercaseLettersOnlyRule", rule: new MaskInputRule("lowercaseLettersOnlyRule", { maskFormatSymbol: "a", regex: "[a-z]"})},
		{name: "uppercaseLettersOnlyRule", rule: new MaskInputRule("uppercaseLettersOnlyRule", { maskFormatSymbol: "A", regex: "[A-Z]"})},
		{name: "uppercaseAndNumericOnlyRule", rule: new MaskInputRule("uppercaseAndNumericOnlyRule", { maskFormatSymbol: "C", regex: "[A-Z0-9]"})}
	];
	var oRulesModel = new JSONModel({"ruleCollection": ruleCollection});
	function addMask(sMaskLabelText, sMask, sMaskPlaceholder, cPlaceholderSymbol, aRules) {
		if ( aRules ) {
			aRules = Array.isArray(aRules) ? aRules : [aRules];
		} else {
			aRules = undefined;
		}
		var oMaskInput = new MaskInput({
			mask: sMask ? sMask : "",
			placeholderSymbol: cPlaceholderSymbol ? cPlaceholderSymbol : "",
			rules: aRules,
			placeholder: sMaskPlaceholder ? sMaskPlaceholder : ""
		});
		return [
			new Label({
				text: sMaskLabelText ? sMaskLabelText : "",
				labelFor: oMaskInput
			}),
			oMaskInput
		];
	}
	var oData = {labelText: "Any character", mask: "9999999", placeholder: "Enter seven digit number", placeholderSymbol: "_"};
	var oMaskInputDataBound = new MaskInput("dataBindingMI", {
		mask: "{/mask}",
		placeholder: "{/placeholder}",
		placeholderSymbol: "{/placeholderSymbol}"
	});
	var oModel = new JSONModel(oData);
	oMaskInputDataBound.setModel(oModel);

	new App({
		pages: [
			new Page({
				title: "Mask Input - Testsuite example",
				content: [
					new Grid({
						vSpacing: 2,
						defaultSpan: "XL12 L12 M12 S12",
						content: [
							new VBox({
								items: [
									new SimpleForm({
										editable: true,
										title: "Generic Mask Input",
										content: [
											addMask("Any character", "~~~~~~~~~~", "Enter text", "_", [ruleCollection[0].rule]),
											addMask("Latin characters (case insensitive)", "aaaaaaaa", "Enter text", "_"),
											addMask("Latin characters (case sensitive, only capital letters allowed) and numbers", "CCCCCCCC", "Enter text", "_", [ruleCollection[4].rule]),
											addMask("Numeric only", "999999", "Enter a six digit number", "_", [ruleCollection[2].rule])
										]
									})
								]
							}),
							new VBox({
								items: [
									new SimpleForm({
										editable: true,
										title: "Possible usages (may require additional coding)",
										content: [
											addMask("Serial number", "CCCC-CCCC-CCCC-CCCC-CCCC", "Enter serial number", "_", [ruleCollection[4].rule]),
											addMask("Product activation key", "SAP-CCCCC-CCCCC", "Enter activation key", "_", [ruleCollection[4].rule]),
											addMask("ISBN", "999-99-999-9999-9", "Enter ISBN", "_")
										]
									})
								]
							}),
							new VBox({
								items: [
									new SimpleForm({
										editable: true,
										title: "Data binding",
										content: [
											new Label({
												text: "Data bound mask input (numeric)"
											}),
											oMaskInputDataBound
										]
									})
								]
							}),
							new VBox({
								items: [
									new SimpleForm({
										editable: true,
										title: "Value State with Links (Keyboard Navigation Testing)",
										content: [
											new Label({
												text: "ISBN Number:",
												labelFor: "masked-input-isbn"
											}),
											new MaskInput("masked-input-isbn", {
												placeholder: "Enter ISBN number",
												mask: "999-9-99999-99-9",
												placeholderSymbol: "_",
												value: "978-1-22222-32-1",
												valueState: "Information",
												valueStateText: "Keep typing to change the value states",
												formattedValueStateText: new FormattedText({
													htmlText: "ISBN format validation: %%0 for ISBN guidelines, %%1 for examples, or %%2 to verify your number, and %%3 for troubleshooting.",
													controls: [
														new Link({
															text: "click here",
															href: "#",
															press: function() {
																MessageToast.show("First link clicked in MaskInput value state message!");
															}
														})
													]
												})
											}),
											new Label({
												text: "Phone Number:",
												labelFor: "masked-input-phone"
											}),
											new MaskInput("masked-input-phone", {
												placeholder: "Enter phone number",
												mask: "+1 (999) 999-9999",
												placeholderSymbol: "_",
												value: "+1 (555) 123-4567",
												valueState: "Warning",
												valueStateText: "Please verify the phone number format.",
												formattedValueStateText: new FormattedText({
													htmlText: "Only US phone numbers are supported. For assistance, %%0 or %%1 for international formats.",
													controls: [
														new Link({
															text: "contact support",
															href: "#",
															press: function() {
																MessageToast.show("Support link clicked!");
															}
														}),
														new Link({
															text: "check format guide",
															href: "#",
															press: function() {
																MessageToast.show("Format guide link clicked!");
															}
														})
													]
												})
											}),
											new Label({
												text: "Credit Card:",
												labelFor: "masked-input-cc"
											}),
											new MaskInput("masked-input-cc", {
												placeholder: "Enter credit card number",
												mask: "9999-9999-9999-9999",
												placeholderSymbol: "_",
												value: "1234-5678-9012-3456",
												valueState: "Error",
												valueStateText: "Invalid credit card number",
												formattedValueStateText: new FormattedText({
													htmlText: "Please enter a valid credit card number. %%0 for accepted card types, %%1 for security tips, or %%2 for payment help.",
													controls: [
														new Link({
															text: "view accepted cards",
															href: "#",
															press: function() {
																MessageToast.show("Accepted cards link clicked!");
															}
														}),
														new Link({
															text: "security info",
															href: "#",
															press: function() {
																MessageToast.show("Security info link clicked!");
															}
														}),
														new Link({
															text: "need help",
															href: "#",
															press: function() {
																MessageToast.show("Help link clicked!");
															}
														})
													]
												})
											})
										]
									})
								]
							})
						]
					})
				]
			})
		],
		models: oRulesModel
	}).placeAt("body");
});
