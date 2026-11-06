sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/DialogAccessibleLandmarkInfo",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/Button"
], function (Controller, coreLibrary, Dialog, DialogAccessibleLandmarkInfo, Page, PageAccessibleLandmarkInfo,
		Bar, Title, Table, Column, ColumnListItem, Link, Text, Button) {
	"use strict";

	// shortcut for sap.ui.core.AccessibleLandmarkRole
	var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

	var aDocuments = [
		{ number: "232058679452165", company: "Jologa" },
		{ number: "761302359006367", company: "Exotic Liquids" },
		{ number: "305382373556494", company: "Lyngbysild" },
		{ number: "584481767262332", company: "DelBont Industries" },
		{ number: "303923770901747", company: "Jologa" },
		{ number: "185758129903115", company: "DelBont Industries" },
		{ number: "322877581627108", company: "Exotic Liquids" },
		{ number: "496978767984546", company: "DelBont Industries" },
		{ number: "197153704660013", company: "DelBont Industries" },
		{ number: "679387912345678", company: "Lyngbysild" },
		{ number: "845120097651234", company: "Jologa" },
		{ number: "913476625509981", company: "Exotic Liquids" },
		{ number: "274910835562017", company: "DelBont Industries" },
		{ number: "558201476639824", company: "Lyngbysild" }
	];

	return Controller.extend("sap.m.sample.DialogLandmarkInfo.C", {

		// Dialog without its own header that embeds a Page which declares its own landmarks.
		// The Dialog's Content region is suppressed so the Page's landmark is not nested in it,
		// and the Page title labels the headerless Dialog.
		onOpenPress: function () {
			if (!this.oDialog) {
				var oTitle = new Title({ text: "Table Page", level: "H1" });

				var oPage = new Page({
					customHeader: new Bar({ contentLeft: [oTitle] }),
					landmarkInfo: new PageAccessibleLandmarkInfo({
						rootRole: AccessibleLandmarkRole.None,
						headerRole: AccessibleLandmarkRole.None,
						contentRole: AccessibleLandmarkRole.Region,
						contentLabel: "Documents"
					}),
					content: new Table({
						columns: [
							new Column({ header: new Text({ text: "Document Number" }) }),
							new Column({ header: new Text({ text: "Company" }) })
						],
						items: aDocuments.map(function (oDoc) {
							return new ColumnListItem({
								cells: [ new Link({ text: oDoc.number }), new Text({ text: oDoc.company }) ]
							});
						})
					})
				});

				this.oDialog = new Dialog({
					showHeader: false,
					// No Dialog header, so the embedded Page title labels the Dialog.
					ariaLabelledBy: [oTitle],
					// Suppress the Content region so the Page's own landmark is not nested inside it.
					landmarkInfo: new DialogAccessibleLandmarkInfo({
						showContentLandmark: false
					}),
					contentWidth: "640px",
					contentHeight: "420px",
					resizable: true,
					draggable: true,
					content: oPage,
					beginButton: new Button({
						text: "Close",
						press: function () {
							this.oDialog.close();
						}.bind(this)
					})
				});
				this.getView().addDependent(this.oDialog);
			}

			this.oDialog.open();
		}

	});
});
