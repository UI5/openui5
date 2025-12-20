/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (HBox, UIComponent, XMLView, JSONModel, TestUtils) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.ServerDrivenPaging.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		},

		createContent : function () {
			var oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel();

			this.oUiModel = new JSONModel({
				bRealOData : TestUtils.isRealOData()
			});

			XMLView.create({
				models : {
					undefined : oModel,
					ui : this.oUiModel
				},
				viewName : "sap.ui.core.sample.odata.v4.ServerDrivenPaging.Main"
			}).then(function (oView) {
				oLayout.addItem(oView);
			});

			return oLayout;
		},

		exit : function () {
			this.oUiModel.destroy();
			this.getModel().restoreSandbox();
		}
	});
});
