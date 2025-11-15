sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Tokenizer",
	"sap/m/Token",
	"sap/m/MultiInput",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Switch",
	"sap/m/Text",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
	"sap/m/Panel",
	"sap/m/VBox"
], function(
	App,
	Page,
	Tokenizer,
	Token,
	MultiInput,
	Label,
	Button,
	Switch,
	Text,
	SimpleForm,
	Grid,
	GridData,
	Panel,
	VBox
) {
	"use strict";
	const longToken = {
		text: "Mexico Mexico Mexico Mexico Mexico Mexico Mexico Mexico Mexico Mexico",
		key: "long-token",
		editable: true
	};

	const nonEditablelongToken = {
		text: "Mexico Mexico Mexico Mexico Mexico Mexico Mexico Mexico Mexico Mexico",
		key: "long-token",
		editable: false
	};

	// Helper function to create sample tokens
	function createSampleTokens(editable = true) {
		const countries = [
			"Andora",
			"Argentina",
			"Brazil",
			"Bulgaria",
			"Canada",
			"China",
			"Denmark",
			"Estonia",
			"Finland",
			"Germany",
			"Hungary",
			"Ireland",
			"Norway",
			"Japan",
			"Korea",
			"Latvia"
		];
		const tokens = [];
		for (var i = 1; i < countries.length; i++) {
			tokens.push(new Token({
				text: countries[i],
				key: "token-" + i,
				editable: editable
			}));
		}
		return tokens;
	}

	function fnHandleTokenDelete(oEvent) {
		const oTokenizer = oEvent.getSource();
		const aDeletedTokens = oEvent.getParameter("tokens");
		aDeletedTokens.forEach(function (oToken) {
			oTokenizer.removeToken(oToken);
		});
	}

	/*** EXAMPLE 1: Basic MultiLine Tokenizer ***/
	var oExample1 = new Panel({
		headerText: "Multi Line",
		content: [
			new Tokenizer("tokenizer1", {
				multiLine: true,
				width: "320px",
				tokens: createSampleTokens(),
				tokenDelete: fnHandleTokenDelete
			})
		],
		expandable: true,
		expanded: true
	}).addStyleClass("controlContainer");

	var oExample2 = new Panel({
		headerText: "Multi Line with long token",
		content: [
			new Tokenizer("tokenizer2", {
				multiLine: true,
				showClearAll: false,
				width: "320px",
				tokens: [longToken, ...createSampleTokens(), longToken],
				tokenDelete: fnHandleTokenDelete
			})
		],
		expandable: true,
		expanded: true
	}).addStyleClass("controlContainer");

	var oExample3 = new Panel({
		headerText: "Multi Line with limited height",
		content: [
			new Tokenizer("tokenizer3", {
				multiLine: true,
				showClearAll: false,
				width: "320px",
				tokens: [longToken, ...createSampleTokens(), longToken],
				tokenDelete: fnHandleTokenDelete
			}).addStyleClass("tokenizerLimitedHeight")
		],
		expandable: true,
		expanded: true
	}).addStyleClass("controlContainer");

	var oExample4 = new Panel({
		headerText: "Multi Line with clear all",
		content: [
			new Tokenizer("tokenizer4", {
				multiLine: true,
				showClearAll: true,
				width: "320px",
				tokens: createSampleTokens(),
				tokenDelete: fnHandleTokenDelete
			})
		],
		expandable: true,
		expanded: true
	}).addStyleClass("controlContainer");

	var oExample5 = new Panel({
		headerText: "Tokenizer States",
		content: [
			new SimpleForm({
				layout: "ResponsiveGridLayout",
				content: [
					new Label({text: "Read-only"}),
					new Tokenizer({
						multiLine: true,
						showClearAll: true,
						editable: false,
						width: "320px",
						tokens: [nonEditablelongToken, ...createSampleTokens(false), nonEditablelongToken],
						tokenDelete: fnHandleTokenDelete
					}),

					new Label({text: "Disabled"}),
					new Tokenizer({
						multiLine: true,
						showClearAll: true,
						enabled: false,
						width: "400px",
						tokens: [nonEditablelongToken, ...createSampleTokens(false), nonEditablelongToken],
						tokenDelete: fnHandleTokenDelete
					}),

					new Label({text: "Non-editable tokens"}),
					new Tokenizer({
						multiLine: true,
						showClearAll: true,
						editable: false,
						width: "320px",
						tokens: [nonEditablelongToken, ...createSampleTokens(false), nonEditablelongToken], // non-editable tokens
						tokenDelete: fnHandleTokenDelete
					})
				]
			})
		],
		expandable: true,
		expanded: true
	}).addStyleClass("controlContainer");

	var oExample6 = new Panel({
		headerText: "Multi Line with single long token",
		content: [
			new Tokenizer("tokenizer6", {
				multiLine: true,
				showClearAll: false,
				width: "320px",
				tokens: [longToken],
				tokenDelete: fnHandleTokenDelete
			})
		],
		expandable: true,
		expanded: true
	}).addStyleClass("controlContainer");

	/*** Build Page ***/
	new App({
		pages: new Page({
			title: "Tokenizer - MultiLine and Clear All",
			content: [
				new VBox({
					items: [
						oExample1,
						oExample2,
						oExample3,
						oExample4,
						oExample5,
						oExample6
					]
				}).addStyleClass("demoWrapper")
			]
		})
	}).placeAt("content");
});