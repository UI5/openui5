sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/list/GridListType",
	"sap/ui/mdc/list/ListType",
	"sap/ui/layout/cssgrid/GridBasicLayout",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Title",
	"sap/m/Text",
	"sap/m/MessageToast"
], function(Controller, GridListType, ListType, GridBasicLayout, VBox, HBox, Title, Text, MessageToast) {
	"use strict";

	const aGridLayoutControlIds = ["sepGridLayout", "lblBoxWidth", "sliderBoxWidth", "lblGap", "sliderGap"];

	return Controller.extend("mdc.sample.controller.Controller", {
		onInit: function() {
			const oList = this.getView().byId("list");
			oList.setType(this._getGridListType());
			oList.setItemContentTemplate(this._createGridListItemContentTemplate());
			this._enrichModelWithActions();
		},

		// --- Layout type (Grid / List) ---

		onListTypeChange: function(oEvent) {
			const bGrid = oEvent.getParameter("item").getKey() === "GridListType";
			const oList = this.getView().byId("list");
			oList.setType(bGrid ? this._getGridListType() : this._getListType());
			oList.setItemContentTemplate(bGrid ? this._createGridListItemContentTemplate() : this._createListItemContentTemplate());
			aGridLayoutControlIds.forEach((sId) => this.getView().byId(sId).setVisible(bGrid));
		},

		// --- Selection mode ---

		onSelectionModeChange: function(oEvent) {
			const sKey = oEvent.getParameter("item").getKey();
			this.getView().byId("list").setSelectionMode(sKey);
			MessageToast.show("Selection mode: " + sKey);
		},

		// --- Custom layout (GridListType only) ---

		onGridLayoutChange: function() {
			const oView = this.getView();
			const fBoxWidth = oView.byId("sliderBoxWidth").getValue();
			const fGap = oView.byId("sliderGap").getValue();
			oView.byId("list").getType().setLayout(new GridBasicLayout({
				gridTemplateColumns: "repeat(auto-fit, minmax(" + fBoxWidth + "rem, 1fr))",
				gridGap: fGap + "rem"
			}));
		},

		// --- Item events ---

		onItemPress: function(oEvent) {
			const oBindingContext = oEvent.getParameter("bindingContext");
			const sName = oBindingContext ? oBindingContext.getProperty("name") : "unknown";
			MessageToast.show("Pressed: " + sName);
		},

		onSelectionChange: function(oEvent) {
			const bSelectAll = oEvent.getParameter("selectAll");
			MessageToast.show("Selection changed" + (bSelectAll ? " (Select All)" : ""));
		},

		onBeforeOpenContextMenu: function(oEvent) {
			const oBindingContext = oEvent.getParameter("bindingContext");
			if (oBindingContext) {
				MessageToast.show("Context menu for: " + oBindingContext.getProperty("name"));
			}
		},

		onContextMenuViewDetails: function() {
			MessageToast.show("View Details action triggered");
		},

		onContextMenuCopyName: function() {
			MessageToast.show("Copy Name action triggered");
		},

		onItemActionPress: function(oEvent) {
			// ItemActionItem fires its own press event with a bindingContext parameter.
			const oAction = oEvent.getSource();
			const oBindingContext = oEvent.getParameter("bindingContext");
			const sName = oBindingContext ? oBindingContext.getProperty("name") : "unknown";
			MessageToast.show("Action '" + oAction.getText() + "' on: " + sName);
		},


		// --- Private helpers ---

		_enrichModelWithActions: function() {
			const aActionKeys = ["favorite", "edit", "share", "download", "flag", "bookmark"];

			const oModel = this.getView().getModel("mountains");
			const aMountains = oModel.getProperty("/mountains");
			aMountains.forEach((oMountain) => {
				const iCount = 1 + Math.floor(Math.random() * 2); // 1 or 2 visible actions
				const aShuffled = aActionKeys.slice().sort(() => Math.random() - 0.5);
				// Store a boolean visibility flag per action key on each mountain entry
				aActionKeys.forEach((sKey) => {
					oMountain["action_" + sKey] = false;
				});
				aShuffled.slice(0, iCount).forEach((sKey) => {
					oMountain["action_" + sKey] = true;
				});
			});
			oModel.setProperty("/mountains", aMountains);
		},

		_getGridListType: function() {
			if (!this._oGridListType) {
				this._oGridListType = new GridListType();
			}
			return this._oGridListType;
		},

		_getListType: function() {
			if (!this._oListType) {
				this._oListType = new ListType();
			}
			return this._oListType;
		},

		_createListItemContentTemplate: function() {
			return new HBox({
				alignItems: "Center",
				items: [
					new VBox({
						items: [
							new Title({text: "{mountains>name}", wrapping: true, titleStyle: "H5"}),
							new Text({text: "Range: {mountains>range}"}),
							new Text({text: "Height: {mountains>height}m"})
						],
						justifyContent: "Center"
					})
				]
			}).addStyleClass("sapUiSmallMargin");
		},

		_createGridListItemContentTemplate: function() {
			return new VBox({
				items: [
					new Title({text: "{mountains>name}"}),
					new Text({text: "Height: {mountains>height}m"}),
					new Text({text: "Range: {mountains>range}"}),
					new Text({text: "First Ascent: {mountains>first_ascent}"}),
					new Text({text: "Countries: {mountains>countries}"})
				]
			}).addStyleClass("sapUiSmallMargin");
		},

		onExit: function() {
			if (this._oGridListType) {
				this._oGridListType.destroy();
				this._oGridListType = null;
			}
			if (this._oListType) {
				this._oListType.destroy();
				this._oListType = null;
			}
		}
	});
});
