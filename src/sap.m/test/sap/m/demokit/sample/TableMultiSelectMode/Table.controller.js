sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, Filter, FilterOperator, MessageToast) {
	"use strict";

	const TableController = Controller.extend("sap.m.sample.TableMultiSelectMode.Table", {

		onInit: function () {
			this._oViewModel = new JSONModel({ totalCount: 0, selectedCount: 0, extViewSwitchEnabled: true });
			// set explored app's demo model on this sample
			this._oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(this._oModel);
			this.getView().setModel(this._oViewModel, "ui");
		},

		_updateTotalCount: function () {
			const oTable = this.byId("idProductsTable");
			const oBinding = oTable.getBinding("items");
			const iCount = oBinding.getCount();
			this._oViewModel.setProperty('/totalCount', iCount);
		},

		_updateSelectedCount: function () {
			const oTable = this.byId("idProductsTable");
			const iSelected = oTable.getSelectedItems().length;
			this._oViewModel.setProperty('/selectedCount', iSelected);
		},

		onBindingChange: function () {
			this._updateTotalCount();
			this._updateSelectedCount();
		},

		onSelectionChange: function(oEvent) {
			const oComboBox = this.getView().byId("idComboBoxSuccess");
			const oTable = this.getView().byId("idProductsTable");
			const sMode = oComboBox.getSelectedKey();
			oTable.setMultiSelectionMode(sMode);
		},

		onRowSelectionChange: function() {
			this._updateSelectedCount();
		},

		onItemActionPress: function (oEvent) {
			const oItem = oEvent.getParameter("listItem");
			const oTable = this.byId("idProductsTable");
			const oModel = this.getView().getModel();
			const aProducts = oModel.getProperty("/ProductCollection");
			const oProduct = oItem.getBindingContext().getObject();
			const iDeleteIndex = aProducts.indexOf(oProduct);

			aProducts.splice(iDeleteIndex, 1);
			oModel.setProperty("/ProductCollection", aProducts);

			oTable.removeSelections();
			this._updateSelectedCount();

			MessageToast.show("Product deleted and selection cleared.");
		},

		onAddRow: function () {
			const oModel = this.getView().getModel();
			const aProducts = oModel.getProperty("/ProductCollection") || [];

			const iRandom = Math.floor(Math.random() * 10000);
			const aSuppliers = ["SupplierA", "SupplierB", "SupplierC"];
			const aCurrencies = ["EUR", "USD", "GBP"];

			const oNewProduct = {
				ProductId: `PRD-${iRandom}`,
				Name: `Product ${iRandom}`,
				SupplierName: aSuppliers[Math.floor(Math.random() * aSuppliers.length)],
				Width: Math.floor(Math.random() * 50) + 10,
				Depth: Math.floor(Math.random() * 50) + 10,
				Height: Math.floor(Math.random() * 50) + 10,
				DimUnit: "cm",
				Price: (Math.random() * 1000).toFixed(2),
				CurrencyCode: aCurrencies[Math.floor(Math.random() * aCurrencies.length)]
			};

			aProducts.push(oNewProduct);
			oModel.setProperty("/ProductCollection", aProducts);

			MessageToast.show(`New product added: ${oNewProduct.Name}`);
		},

		onToggleExtView: function (oEvent) {
			const bState = oEvent.getParameter("state");
			const oTableTitle = this.byId("idTableTitle");

			oTableTitle.setShowExtendedView(bState);
		},

		onSearch: function (oEvent) {
			const sQuery = oEvent.getParameter("query");
			const oTable = this.byId("idProductsTable");
			const oBinding = oTable.getBinding("items");

			const aFilters = [];
			if (sQuery) {
				aFilters.push(new Filter({
					filters: [
						new Filter("Name", FilterOperator.Contains, sQuery),
						new Filter("SupplierName", FilterOperator.Contains, sQuery),
						new Filter("ProductId", FilterOperator.Contains, sQuery)
					],
					and: false
				}));
			}

			oBinding.filter(aFilters);
		},

		onToggleTotalCount: function (oEvent) {
			const bState = oEvent.getParameter("state");

			if (bState) {
				this._updateTotalCount();
			} else {
				this._oViewModel.setProperty("/totalCount", -1);
			}
		},

		onExit: function () {
			this._oViewModel.destroy();
			this._oModel.destroy();
		}
	});

	return TableController;

});