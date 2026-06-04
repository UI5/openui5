sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/library"
], function (Controller, JSONModel, Dialog, Button, List, StandardListItem, mobileLibrary) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	return Controller.extend("sap.m.sample.DialogFullScreen.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onDialogPress: function () {
			if (!this.oDialog) {
				this.oDialog = new Dialog({
					title: "Available Products",
					showFullScreenButton: true,
					content: new List({
						items: {
							path: "/ProductCollection",
							template: new StandardListItem({
								title: "{Name}",
								counter: "{Quantity}"
							})
						}
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oDialog.close();
						}.bind(this)
					})
				});

				this.getView().addDependent(this.oDialog);
			}

			this.oDialog.open();
		},

		onResizableDialogPress: function () {
			if (!this.oResizableDialog) {
				this.oResizableDialog = new Dialog({
					title: "Available Products",
					showFullScreenButton: true,
					contentWidth: "550px",
					contentHeight: "300px",
					resizable: true,
					content: new List({
						items: {
							path: "/ProductCollection",
							template: new StandardListItem({
								title: "{Name}",
								counter: "{Quantity}"
							})
						}
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oResizableDialog.close();
						}.bind(this)
					})
				});

				this.getView().addDependent(this.oResizableDialog);
			}

			this.oResizableDialog.open();
		},

		onDraggableResizableDialogPress: function () {
			if (!this.oDraggableResizableDialog) {
				this.oDraggableResizableDialog = new Dialog({
					title: "Available Products",
					showFullScreenButton: true,
					contentWidth: "550px",
					contentHeight: "300px",
					resizable: true,
					draggable: true,
					content: new List({
						items: {
							path: "/ProductCollection",
							template: new StandardListItem({
								title: "{Name}",
								counter: "{Quantity}"
							})
						}
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oDraggableResizableDialog.close();
						}.bind(this)
					})
				});

				this.getView().addDependent(this.oDraggableResizableDialog);
			}

			this.oDraggableResizableDialog.open();
		}
	});
});
