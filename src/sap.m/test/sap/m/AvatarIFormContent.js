// Note: the HTML page 'AvatarIFormContent.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Avatar",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/MessageToast",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/library"
], async function (Core, App, Page, Avatar, Button, HBox, VBox, Input, Label, Text, Title, MessageToast, SimpleForm, layoutLibrary) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	await Core.ready();

	// ─────────────────────────────────────────────────────────────
	// 1) Avatar in a SimpleForm / ColumnLayout
	//    IFormContent use-case: outline must not clip at overflow:hidden
	// ─────────────────────────────────────────────────────────────
	var oSection1 = new VBox({
		items: [
			new Title({ text: "1 — Avatar in a SimpleForm (ColumnLayout)", level: "H2" }),
			new Text({ text: "Focus an Avatar — the outline must not be clipped by the ColumnLayout's overflow:hidden." }).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginTop"),
			new SimpleForm({
				layout: SimpleFormLayout.ColumnLayout,
				editable: true,
				content: [
					new Label({ text: "Name" }),
					new Input({ value: "John Doe" }),

					new Label({ text: "Initials" }),
					new Avatar({
						initials: "JD",
						displaySize: "M",
						press: function () { MessageToast.show("JD pressed"); }
					}),

					new Label({ text: "Department" }),
					new Avatar({
						src: "sap-icon://employee",
						displaySize: "M",
						press: function () { MessageToast.show("Department pressed"); }
					})
				]
			})
		]
	}).addStyleClass("demoSection");

	// ─────────────────────────────────────────────────────────────
	// 2) Avatar between two Buttons in an HBox
	// ─────────────────────────────────────────────────────────────
	var oSection2 = new VBox({
		items: [
			new Title({ text: "2 — Avatar between two Buttons (HBox)", level: "H2" }),
			new Text({ text: "Focus the Avatar — the outline must be fully visible on all four sides." }).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginTop"),
			new HBox({
				items: [
					new Button({ text: "Button Before" }),
					new Avatar({ initials: "JD", displaySize: "M", press: function () { MessageToast.show("JD pressed"); } }),
					new Button({ text: "Button After" })
				]
			})
		]
	}).addStyleClass("demoSection");

	// ─────────────────────────────────────────────────────────────
	// 3) Avatar next to an Input
	// ─────────────────────────────────────────────────────────────
	var oSection3 = new VBox({
		items: [
			new Title({ text: "3 — Avatar next to an Input (HBox)", level: "H2" }),
			new Text({ text: "Focus the Avatar — the outline must not be clipped by the adjacent Input." }).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginTop"),
			new HBox({
				items: [
					new Avatar({ initials: "AB", displaySize: "S", press: function () { MessageToast.show("AB pressed"); } }),
					new Input({ placeholder: "Adjacent input" })
				]
			})
		]
	}).addStyleClass("demoSection");

	// ─────────────────────────────────────────────────────────────
	// 4) Avatar between rows in a VBox
	// ─────────────────────────────────────────────────────────────
	var oSection4 = new VBox({
		items: [
			new Title({ text: "4 — Avatar between rows in a VBox", level: "H2" }),
			new Text({ text: "Focus the Avatar — the top and bottom outline edges must be visible." }).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginTop"),
			new VBox({
				items: [
					new Button({ text: "Row Above", width: "10rem" }),
					new Avatar({ initials: "CD", displaySize: "M", press: function () { MessageToast.show("CD pressed"); } }),
					new Button({ text: "Row Below", width: "10rem" })
				]
			})
		]
	}).addStyleClass("demoSection");

	// ─────────────────────────────────────────────────────────────
	// 5) Avatar flush against the browser left edge
	//    The section is split into two Page-level items so that the
	//    heading area keeps normal left padding while the Avatar row
	//    has padding-left: 0 — touching the browser window edge.
	// ─────────────────────────────────────────────────────────────
	var oSection5Head = new VBox({
		items: [
			new Title({ text: "5 — Avatar flush against the browser left edge", level: "H2" }),
			new Text({ text: "Focus the Avatar — the left side of the outline must not be clipped." }).addStyleClass("sapUiTinyMarginTop")
		]
	}).addStyleClass("demoSection5Head");

	var oSection5Edge = new HBox({
		items: [
			new Avatar({ initials: "EF", displaySize: "M", press: function () { MessageToast.show("EF pressed"); } })
		]
	}).addStyleClass("demoSection5Edge");

	// ─────────────────────────────────────────────────────────────
	// Assemble
	// ─────────────────────────────────────────────────────────────
	new App({
		pages: [
			new Page({
				title: "Avatar — IFormContent & Focus Outline",
				content: [oSection1, oSection2, oSection3, oSection4, oSection5Head, oSection5Edge]
			})
		]
	}).addStyleClass("demoApp").placeAt("body");
});