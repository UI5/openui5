sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/TreeTableType",
	"sap/ui/mdc/enums/TableRowCountMode",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/enums/TablePopinDisplay",
	"sap/ui/mdc/enums/TableType",
	"sap/ui/core/library",
	"sap/ui/core/Fragment",
	"sap/ui/core/message/MessageType",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button"
], function(
	Controller,
	GridTableType,
	ResponsiveTableType,
	TreeTableType,
	TableRowCountMode,
	TableSelectionMode,
	TablePopinDisplay,
	TableType,
	coreLibrary,
	Fragment,
	JSONModel,
	MessageType,
	Dialog,
	Text,
	Button
) {
	"use strict";

	const Priority = coreLibrary.Priority;

	return Controller.extend("sap.ui.mdc.acc.table.Table", {
		onInit: function() {
			const oTableConfigModel = new JSONModel({
				selectionMode: TableSelectionMode.Multi,
				gridType: {
					rowCountMode: TableRowCountMode.Auto
				},
				respType: {
					popinDisplay: TablePopinDisplay.Inline
				},
				treeType: {
					rowCountMode: TableRowCountMode.Auto
				},
				navigatedRowId: null,
				enums: {
					selectionModes: this.enumToObject(TableSelectionMode),
					rowCountModes: this.enumToObject(TableRowCountMode),
					priority: this.enumToObject(Priority),
					popinDisplay: this.enumToObject(TablePopinDisplay)
				}
			});

			this.getView().byId("mdcTable").setType(this.getGridTableType());
			this.getView().setModel(oTableConfigModel, "tableConfig");
		},
		formatHighlight: function(dHireDate) {
			return new Date(dHireDate).getFullYear() === new Date().getFullYear() - 10 ? MessageType.Information : MessageType.None;
		},
		formatHighlightText: function(dHireDate) {
			return new Date(dHireDate).getFullYear() === new Date().getFullYear() - 10 ? "10 years job anniversary" : null;
		},
		onTableTypeChange: function(oEvent) {
			const oSelectedType = oEvent.getParameter("selectedItem");
			const oTable = this.getView().byId("mdcTable");

			oTable.destroyType();

			switch (oSelectedType.getKey()) {
				case "ResponsiveTableType":
					oTable.setType(this.getResponsiveTableType());
					break;
				case "TreeTableType":
					oTable.setType(this.getTreeTableType());
					break;
				default:
					oTable.setType(this.getGridTableType());
			}
		},
		onShowRowActionsChange: async function(oEvent) {
			const oTable = this.getView().byId("mdcTable");
			const bShowRowActions = oEvent.getParameter("state");
			const oRowSettings = oTable.getRowSettings();

			if (bShowRowActions) {
				const aRowActionItems = await Fragment.load({
					name: "sap.ui.mdc.acc.table.fragment.RowActions",
					controller: this
				});
				aRowActionItems.forEach((oItem) => {oRowSettings.addRowAction(oItem);});
			} else {
				oRowSettings.destroyRowActions();
			}

			oTable.setRowSettings(oRowSettings);
		},
		onRowDetailsPress: function(oEvent) {
			this.getView().byId("mdcTable")
				.getModel("tableConfig")
				.setProperty("/navigatedRowId", oEvent.getParameter("bindingContext").getProperty("id"));
		},
		onRowActionPress: function(oEvent) {
			const oDialog = new Dialog({
				title: oEvent.getSource().getText(),
				content: new Text({text: "Row action triggered for " + oEvent.getParameter("bindingContext").getProperty("name")}),
				endButton: new Button({
					text: "Close",
					press: function() {
						oDialog.close();
						oDialog.destroy();
					}
				})
			});
			oDialog.addStyleClass("sapUiContentPadding");
			oDialog.open();
		},
		getGridTableType: function() {
			return new GridTableType({
				enableColumnFreeze: true,
				rowCountMode: "{tableConfig>/gridType/rowCountMode}"
			});
		},
		getResponsiveTableType: function() {
			return new ResponsiveTableType({
				showDetailsButton: true,
				popinDisplay: "{tableConfig>/respType/popinDisplay}"
			});
		},
		getTreeTableType: function() {
			return new TreeTableType({
				enableColumnFreeze: true,
				rowCountMode: "{tableConfig>/gridType/rowCountMode}"
			});
		},
		openConfigurationDialog: async function() {
			const oTable = this.getView().byId("mdcTable");
			let sFragmentName = "GridTableType";

			if (oTable._isOfType(TableType.TreeTable)) {
				sFragmentName = "TreeTableType";
			} else if (oTable._isOfType(TableType.ResponsiveTable)) {
				sFragmentName = "ResponsiveTableType";
			}

			this.oDialog ??= await Fragment.load({
				name: `sap.ui.mdc.acc.table.fragment.${sFragmentName}`,
				id: "configurationDialog",
				controller: this
			});
			this.getView().addDependent(this.oDialog);
			this.oDialog.open();
		},
		closeDialog: function() {
			this.oDialog.close();
			this.oDialog.destroy();
			this.oDialog = null;
		},
		enumToObject: function(oEnum) {
			return Object.values(oEnum).map((sValue) => {
				return {value: sValue};
			});
		}
	});
});