sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'test-resources/sap/ui/mdc/qunit/util/V4ServerHelper',
	'sap/ui/model/odata/v4/ODataModel'
], function(
	Controller,
	V4ServerHelper,
	ODataModel
) {
	"use strict";

	return Controller.extend("view.Main", {
		onInit: function() {
			V4ServerHelper.requestServerURLForTenant("MDCChartP13nOpaTestApplication", true).then(function(tenantBaseUrl) {
				const oModel = new ODataModel({
					serviceUrl: tenantBaseUrl + "catalog/",
					operationMode: "Server",
					updateGroupId: "update"
				});

				this.getView().setModel(oModel);
			}.bind(this));
		}
	});
});
