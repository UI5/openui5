/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/MultiSelectionPlugin",
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
	MultiSelectionPlugin,
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

	/**
	 * Creates response data for given settings.
	 *
	 * @param {object} mSettings Settings for response data creation
	 * @param {number} mSettings.skip Number of records to skip
	 * @param {number} mSettings.top Number of records to take
	 * @param {number} [mSettings.count] Total count of records
	 * @returns
	 */
	function createResponseData(mSettings) {
		const sRecordTemplate = "{\"__metadata\":{\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults('{index}')\","
							  + "\"type\":\"tmp.u012345.cca.CCA.ActualPlannedCostsResultsType\"},"
							  + "\"CostCenter\":\"CostCenter-{index}\""
							  + ",\"PlannedCosts\":\"499.99\""
							  + ",\"Currency\":\"EUR\""
							  + "}";
		const aRecords = [];
		const sCount = mSettings.count != null ? ",\"__count\":\"" + mSettings.count + "\"" : "";

		for (let i = mSettings.skip, iLastIndex = mSettings.skip + mSettings.top; i < iLastIndex; i++) {
			aRecords.push(sRecordTemplate.replace(/({index})/g, i));
		}

		return "{\"d\":{\"results\":[" + aRecords.join(",") + "]" + sCount + "}}";
	}

	/**
	 *
	 * @param {object} mSettings Settings for response creation
	 * @param {number} mSettings.skip Number of records to skip
	 * @param {number} mSettings.top Number of records to take
	 * @param {number} [mSettings.count] Total count of records
	 * @param {number} [mSettings.includeCountResponse] Whether to include count response
	 * @param {boolean} [mSettings.includeGrandTotalResponse] Whether to include grand total response
	 * @returns
	 */
	function createResponse(mSettings) {
		const sGrandTotalResponse =
			mSettings.includeGrandTotalResponse
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
				  "{\"d\":{\"results\":[{\"__metadata\":{\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544452006589331\')\","
				  + "\"type\":\"tmp.u012345.cca.CCA.ActualPlannedCostsResultsType\"},\"Currency\":\"USD\",\"PlannedCosts\":\"9848641.68\"}],"
				  + "\"__count\":\"1\"}}\r\n"
				: "";

		const sCountResponse =
			mSettings.includeCountResponse
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
				"{\"d\":{\"results\":[],\"__count\":\"" + mSettings.count + "\"}}\r\n"
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
			createResponseData({skip: mSettings.skip, top: mSettings.top, count: mSettings.count}) + "\r\n" +
			   "--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			   "";
	}

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter&$top=0&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter&$top=110&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse({skip: 0, top: 110, count: 200, includeCountResponse: true})
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter&$skip=110&$top=90"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse({skip: 110, top: 90})
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter&$skip=110&$top=80"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse({skip: 110, top: 80})
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter&$top=0&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter&$top=110&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse({skip: 0, top: 110, count: 200, includeCountResponse: true, includeGrandTotalResponse: true})
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=PlannedCosts,Currency&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter&$top=0&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,PlannedCosts,Currency&$top=110&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse({skip: 0, top: 110, count: 200, includeCountResponse: true, includeGrandTotalResponse: true})
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,PlannedCosts,Currency&$skip=110&$top=90"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse({skip: 110, top: 90})
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter&$orderby=CostCenter%20asc&$top=110&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse({skip: 0, top: 110, count: 200})
	});

	TableQUnitUtils.setDefaultSettings({
		dependents: [new MultiSelectionPlugin()],
		models: new ODataModel(sServiceURI)
	});

	QUnit.module("Load data", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
				columns: new AnalyticalColumn({
					leadingProperty: "CostCenter",
					template: new TableQUnitUtils.TestControl({text: {path: "CostCenter"}})
				})
			});
			this.oTable.bindRows({path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", async function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();
		await this.oMultiSelectionPlugin.selectAll();
		const oBinding = this.oTable.getBinding();
		const aContexts = oBinding.getContexts(0, 200, 0);

		assert.equal(aContexts.length, 200, "All binding contexts are available");
		assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			const aContexts = this.oTable.getBinding().getContexts(0, 190, 0);

			assert.equal(aContexts.length, 190, "Binding contexts in selected range are available");
			assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
		}.bind(this));
	});

	QUnit.module("Load data with grand total", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
				columns: [
					new AnalyticalColumn({
						leadingProperty: "CostCenter",
						template: new TableQUnitUtils.TestControl({text: {path: "CostCenter"}})
					}),
					new AnalyticalColumn({
						leadingProperty: "PlannedCosts",
						template: new TableQUnitUtils.TestControl({text: {path: "PlannedCosts"}}),
						summed: true
					})
				]
			});
			this.oTable.bindRows({path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", async function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();
		await this.oMultiSelectionPlugin.selectAll();
		const aContexts = this.oTable.getBinding().getContexts(0, 200, 0);
		assert.equal(aContexts.length, 200, "All binding contexts are available");
		assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
	});

	QUnit.module("HeaderSelector", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
				columns: [
					new AnalyticalColumn({
						leadingProperty: "CostCenter",
						template: new TableQUnitUtils.TestControl({text: {path: "CostCenter"}})
					})
				]
			});
			this.oTable.bindRows({path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oHeaderSelector = this.oTable._getHeaderSelector();

		assert.strictEqual(oHeaderSelector.getEnabled(), true, "HeaderSelector is enabled");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "HeaderSelector is visible");
	});

	QUnit.test("Sort", async function(assert) {
		const oHeaderSelector = this.oTable._getHeaderSelector();

		this.oTable.sort(this.oTable.getColumns()[0]);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(oHeaderSelector.getEnabled(), true, "HeaderSelector is enabled");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "HeaderSelector is visible");
	});
});