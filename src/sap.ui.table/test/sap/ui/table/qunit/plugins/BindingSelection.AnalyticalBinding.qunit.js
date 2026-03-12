/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/AnalyticalColumn",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/qunit/analytics/o4aMetadata",
	// provides mock data
	"sap/ui/core/qunit/analytics/TBA_ServiceDocument",
	// provides mock data
	"sap/ui/core/qunit/analytics/ATBA_Batch_Contexts"
], function(
	TableQUnitUtils,
	AnalyticalTable,
	AnalyticalColumn,
	ODataModel,
	o4aFakeService
) {
	"use strict";

	const sServiceURI = "http://o4aFakeService:8080";

	o4aFakeService.fake({
		baseURI: sServiceURI
	});

	sinon.config.useFakeTimers = false;

	function createResponseData(iSkip, iTop, iCount) {
		const sRecordTemplate = "{\"__metadata\":{\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults('{index}')\","
			+ "\"type\":\"tmp.u012345.cca.CCA.ActualPlannedCostsResultsType\"},"
			+ "\"CostCenter\":\"CostCenter-{index}\""
			+ ",\"PlannedCosts\":\"499.99\""
			+ ",\"Currency\":\"EUR\""
			+ "}";
		const aRecords = [];
		const sCount = iCount != null ? ",\"__count\":\"" + iCount + "\"" : "";

		for (let i = iSkip, iLastIndex = iSkip + iTop; i < iLastIndex; i++) {
			aRecords.push(sRecordTemplate.replace(/({index})/g, i));
		}

		return "{\"d\":{\"results\":[" + aRecords.join(",") + "]" + sCount + "}}";
	}

	function createResponse(iSkip, iTop, iCount, bGrandTotal, bGrandTotalEmpty) {
		const sGrandTotal = "{\"__metadata\":{\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544452006589331\')\","
			+ "\"type\":\"tmp.u012345.cca.CCA.ActualPlannedCostsResultsType\"},"
			+ "\"Currency\":\"USD\",\"PlannedCosts\":\"9848641.68\"}";
		const sGrandTotalResponse =
			bGrandTotal
				? "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
				"Content-Type: application/http\r\n" +
				"Content-Length: 356\r\n" +
				"content-transfer-encoding: binary\r\n" +
				"\r\n" +
				"HTTP/1.1 200 OK\r\n" +
				"Content-Type: application/json\r\n" +
				"content-language: en-US\r\n" +
				"Content-Length: 259\r\n" +
				"\r\n" +
				"{\"d\":{\"results\":[" + (bGrandTotalEmpty ? "" : sGrandTotal) + "],"
				+ "\"__count\":\"" + (bGrandTotalEmpty ? "0" : "1") + "\"}}\r\n"
				: "";

		const sCountResponse =
			iCount != null
				? "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
				"Content-Type: application/http\r\n" +
				"Content-Length: 131\r\n" +
				"content-transfer-encoding: binary\r\n" +
				"\r\n" +
				"HTTP/1.1 200 OK\r\n" +
				"Content-Type: application/json\r\n" +
				"content-language: en-US\r\n" +
				"Content-Length: 35\r\n" +
				"\r\n" +
				"{\"d\":{\"results\":[],\"__count\":\"" + iCount + "\"}}\r\n"
				: "";

		return sGrandTotalResponse +
			sCountResponse +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 3113\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 3015\r\n" +
			"\r\n" +
			createResponseData(iSkip, iTop, iCount) + "\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			"";
	}

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,Currency"
			+ "&$top=0&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,Currency,PlannedCosts"
			+ "&$top=110&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 110, 110)
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,Currency,PlannedCosts"
			+ "&$orderby=CostCenter%20asc"
			+ "&$top=110&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 110)
	});

	QUnit.module("HeaderSelector", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
				columns: [
					new AnalyticalColumn({
						leadingProperty: "CostCenter",
						template: new TableQUnitUtils.TestControl({text: {path: "CostCenter"}})
					}),
					new AnalyticalColumn({
						leadingProperty: "PlannedCosts",
						template: new TableQUnitUtils.TestControl({text: {path: "PlannedCosts"}})
					}),
					new AnalyticalColumn({
						leadingProperty: "Currency",
						template: new TableQUnitUtils.TestControl({text: {path: "Currency"}})
					})
				],
				models: new ODataModel(sServiceURI, {useBatch: true}),
				rows: {
					path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"
				}
			});

			await this.oTable.qunit.whenBindingChange();
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Rebind when everything is selected", function(assert) {
		this.oTable.selectAll();
		assert.ok(this.oTable._getHeaderSelector().getCheckBoxSelected(), "HeaderSelector is selected before rebind");

		this.oTable.bindRows(this.oTable.getBindingInfo("rows"));
		assert.notOk(this.oTable._getHeaderSelector().getCheckBoxSelected(), "HeaderSelector is not selected after rebind");
	});

	QUnit.test("Binding deselects when everything is selected", async function(assert) {
		this.oTable.selectAll();
		assert.ok(this.oTable._getHeaderSelector().getCheckBoxSelected(), "HeaderSelector is selected");

		this.oTable.sort(this.oTable.getColumns()[0]);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		assert.notOk(this.oTable._getHeaderSelector().getCheckBoxSelected(), "HeaderSelector is not selected after binding deselected rows");
	});
});