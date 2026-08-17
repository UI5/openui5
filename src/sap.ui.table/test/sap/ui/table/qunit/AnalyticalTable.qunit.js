/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/qunit/analytics/o4aMetadata",
	"sap/ui/model/TreeAutoExpandMode",
	"sap/ui/table/AnalyticalColumn",
	"sap/ui/table/Column",
	"sap/ui/model/Filter",
	"sap/ui/model/type/Float",
	"sap/ui/table/Row",
	"sap/ui/table/library",
	"sap/ui/core/Element",
	"sap/m/Title",
	"sap/m/table/columnmenu/Menu",
	"sap/base/Log",
	// provides mock data
	"sap/ui/core/qunit/analytics/TBA_ServiceDocument",
	// provides mock data
	"sap/ui/core/qunit/analytics/ATBA_Batch_Contexts"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	AnalyticalTable,
	FixedRowMode,
	TableUtils,
	ODataModel,
	ODataModelV2,
	o4aFakeService,
	TreeAutoExpandMode,
	AnalyticalColumn,
	Column,
	Filter,
	FloatType,
	Row,
	library,
	Element,
	Title,
	ColumnMenu,
	Log
) {
	"use strict";

	// ************** Preparation Code **************

	//start the fake service
	const sServiceURI = "http://o4aFakeService:8080/";
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
			+ "/Results?$select=ActualCosts,Currency,PlannedCosts"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExist%27)"
			+ "&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,CostCenterText,ActualCosts,Currency,PlannedCosts"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExist%27)"
			+ "&$orderby=CostCenter%20asc"
			+ "&$top=110&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,CostElement,Currency"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExist%27)"
			+ "&$top=0&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 0, 0, true, true)
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=ActualCosts,Currency,PlannedCosts"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExistButReturnsGrandTotal%27)"
			+ "&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,CostCenterText,ActualCosts,Currency,PlannedCosts"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExistButReturnsGrandTotal%27)"
			+ "&$orderby=CostCenter%20asc"
			+ "&$top=110&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,CostElement,Currency"
			+ "&$filter=(CostCenter%20eq%20%27DoesNotExistButReturnsGrandTotal%27)"
			+ "&$top=0&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 0, 0, true)
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,Currency"
			+ "&$top=0&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter,Currency,PlannedCosts"
			+ "&$top=120&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 120, 120)
	});

	o4aFakeService.addResponse({
		batch: true,
		uri: [
			"ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')"
			+ "/Results?$select=CostCenter"
			+ "&$orderby=CostCenter%20asc"
			+ "&$top=120&$inlinecount=allpages"
		],
		header: o4aFakeService.headers.BATCH,
		content: createResponse(0, 10)
	});

	function attachEventHandler(oControl, iSkipCalls, fnHandler, thisArg) {
		let iCalled = 0;
		const fnEventHandler = function() {
			const fnTest = () => {
				iCalled++;
				if (iSkipCalls === iCalled) {
					oControl.detachRowsUpdated(fnEventHandler);
					oControl.attachEventOnce("rowsUpdated", fnHandler, thisArg);
				}
			};
			Promise.resolve().then(fnTest);
		};

		if (iSkipCalls === 0) {
			oControl.attachEventOnce("rowsUpdated", fnHandler, thisArg);
		} else {
			oControl.attachRowsUpdated(fnEventHandler);
		}
	}

	function performTestAfterTableIsUpdated(doTest, done) {
		this.oModel.metadataLoaded().then(() => {
			attachEventHandler(this.oTable, 0, function() {
				doTest(this.oTable);
				if (done) {
					done();
				}
			}, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");
		});
	}

	function createColumn(mSettings) {
		return new AnalyticalColumn({
			grouped: mSettings.grouped || false,
			summed: mSettings.summed || false,
			visible: true,
			template: new TableQUnitUtils.TestControl({
				text: {
					path: mSettings.name
				}
			}),
			sortProperty: mSettings.name,
			filterProperty: mSettings.name,
			filterType: mSettings.summed ? new FloatType() : undefined,
			groupHeaderFormatter: function(value, value2) {
				return "|" + value + "-" + value2 + "|";
			},
			leadingProperty: mSettings.name,
			autoResizable: true
		});
	}

	function createTable(mSettings) {

		const mParams = {
			extension: [
				new Title({
					text: "AnalyticalTable"
				})
			],
			columns: [
				//dimensions + description texts
				createColumn({grouped: true, name: "CostCenter"}),
				createColumn({name: "CostCenterText"}),
				createColumn({grouped: true, name: "CostElement"}),
				createColumn({name: "CostElementText"}),
				createColumn({grouped: true, name: "Currency"}),

				//measures
				createColumn({summed: true, name: "ActualCosts"}),
				createColumn({summed: true, name: "PlannedCosts"})
			],
			rowMode: new FixedRowMode({
				rowCount: 20
			}),
			enableColumnReordering: true,
			/**
			 * @deprecated As of Version 1.117
			 */
			showColumnVisibilityMenu: true,
			enableColumnFreeze: true,
			enableCellFilter: true,
			selectionMode: library.SelectionMode.MultiToggle
		};

		//maybe override some initial settings
		for (const sKey in mSettings) {
			mParams[sKey] = mSettings[sKey];
		}

		const oTable = new AnalyticalTable("analytical_table0", mParams);
		oTable.setModel(this.oModel);
		oTable.placeAt("qunit-fixture");

		return oTable;
	}

	//************** Test Code **************

	QUnit.module("Properties & Functions", {
		beforeEach: async function() {
			this.oModel = new ODataModelV2(sServiceURI, {useBatch: true});
			this.oTable = createTable.call(this);
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Hierarchy mode", function(assert) {
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Group, "Table is in mode 'Group'");
	});

	QUnit.test("Selection Plugin", function(assert) {
		assert.ok(this.oTable._getSelectionPlugin().isA("sap.ui.table.plugins.BindingSelection"), "BindingSelection plugin is initialized");
	});

	QUnit.test("SelectionBehavior", function(assert) {
		assert.equal(this.oTable.getSelectionBehavior(), library.SelectionBehavior.RowSelector, "SelectionBehavior.RowSelector");
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		assert.equal(this.oTable.getSelectionBehavior(), library.SelectionBehavior.Row, "SelectionBehavior.Row");
		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		assert.equal(this.oTable.getSelectionBehavior(), library.SelectionBehavior.RowOnly, "SelectionBehavior.RowOnly");
	});

	/**
	 * @deprecated As of version 1.21.2
	 */
	QUnit.test("Dirty", function(assert) {
		assert.equal(this.oTable.getDirty(), false, "Default dirty");
		assert.equal(this.oTable.getShowOverlay(), false, "Default showOverlay");
		this.oTable.setDirty(true);
		assert.equal(this.oTable.getDirty(), true, "Dirty set");
		assert.equal(this.oTable.getShowOverlay(), true, "ShowOverlay set");
	});

	/**
	 * @deprecated As of version 1.21.2
	 */
	QUnit.test("FixedRowCount", function(assert) {
		assert.equal(this.oTable.getFixedRowCount(), 0, "Default fixedRowCount");
		this.oTable.setFixedRowCount(5);
		assert.equal(this.oTable.getFixedRowCount(), 0, "FixedRowCount cannot be changed");
	});

	/**
	 * @deprecated As of version 1.21.2
	 */
	QUnit.test("FixedBottomRowCount", function(assert) {
		const done = assert.async();

		function doTest(oTable) {
			assert.equal(oTable.getFixedBottomRowCount(), 0, "Default fixedBottomRowCount");
			oTable.setFixedBottomRowCount(5);
			assert.equal(oTable.getFixedBottomRowCount(), 0, "FixedBottomRowCount cannot be changed");
			TableQUnitUtils.assertRenderedRows(assert, oTable, 0, 19, 1);
		}

		performTestAfterTableIsUpdated.call(this, doTest, done);
	});

	QUnit.test("EnableGrouping", function(assert) {
		assert.equal(this.oTable.getEnableGrouping(), false, "Default enableGrouping");
		this.oTable.setEnableGrouping(true);
		assert.equal(this.oTable.getEnableGrouping(), false, "EnableGrouping cannot be changed");
	});

	QUnit.test("getTotalSize", function(assert) {
		assert.expect(3);
		const done = assert.async();

		function doTest(oTable) {
			const oBinding = oTable.getBinding();
			oBinding.getTotalSize = function() {
				assert.ok(true, "getTotalSize on Binding called");
				return 5;
			};
			assert.equal(oTable.getTotalSize(), 5, "Result of Binding");
			oTable.unbindRows();
			assert.equal(oTable.getTotalSize(), 0, "No Binding");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	/**
	 * @deprecated As of version 1.76
	 */
	QUnit.test("CollapseRecursive property", function(assert) {
		assert.expect(7);
		const done = assert.async();

		function doTest(oTable) {
			const oBinding = oTable.getBinding();
			let bCollapseRecursive = false;
			oBinding.setCollapseRecursive = function(bParam) {
				assert.equal(bParam, bCollapseRecursive, "setCollapseRecursive on Binding called");
			};

			assert.ok(oTable.setCollapseRecursive(bCollapseRecursive) === oTable, "Call on Binding");
			assert.equal(oTable.getCollapseRecursive(), bCollapseRecursive, "Property");
			bCollapseRecursive = true;
			assert.ok(oTable.setCollapseRecursive(bCollapseRecursive) === oTable, "Call of Binding");
			assert.equal(oTable.getCollapseRecursive(), bCollapseRecursive, "Property");
			oTable.unbindRows();
			bCollapseRecursive = false;
			oTable.setCollapseRecursive(bCollapseRecursive);
			assert.equal(oTable.getCollapseRecursive(), bCollapseRecursive, "Property");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("collapseAll", function(assert) {
		assert.expect(6);
		const done = assert.async();

		function doTest(oTable) {
			oTable.setFirstVisibleRow(2);
			const oBinding = oTable.getBinding();
			oBinding.collapseToLevel = function(iLevel) {
				assert.ok(true, "collapseToLevel on Binding called ...");
				assert.equal(iLevel, 0, "... with level 0");
			};
			assert.ok(oTable.collapseAll() === oTable, "Call on Binding");
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row");
			oTable.unbindRows();
			oTable.setFirstVisibleRow(2);
			assert.ok(oTable.collapseAll() === oTable, "No Binding");
			assert.equal(oTable.getFirstVisibleRow(), 2, "First visible row");
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("expandAll", function(assert) {
		assert.expect(5);
		const done = assert.async();

		function doTest(oTable) {
			const oBinding = oTable.getBinding();
			const oExpandLevelSpy = sinon.spy(oBinding, "expandToLevel");
			const oClearSelectionSpy = sinon.spy(oTable._getSelectionPlugin(), "clearSelection");

			oTable.setFirstVisibleRow(2);
			assert.ok(oTable.expandAll() === oTable, "ExpandAll returns a reference to the table");
			assert.ok(oExpandLevelSpy.calledOnce, "expandToLevel on Binding called once");
			assert.ok(oExpandLevelSpy.calledWith(3), "called with the correct parameter value");
			assert.ok(oClearSelectionSpy.calledOnce, "clearSelection called once");
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row");
			oTable.unbindRows();
			done();
		}

		performTestAfterTableIsUpdated.call(this, doTest);
	});

	QUnit.test("BindRows", function(assert) {
		const oInnerBindRows = this.spy(AnalyticalTable.prototype, "_bindRows");
		const oTable = new AnalyticalTable({
			rows: {path: "/modelData"},
			columns: [new AnalyticalColumn()]
		});

		assert.ok(oInnerBindRows.calledOnce, "bindRows was called");
		assert.ok(!!oTable.getBindingInfo("rows"), "BindingInfo available");

		oInnerBindRows.restore();
	});

	QUnit.test("BindRows - Named model", function(assert) {
		const oInnerBindRows = this.spy(AnalyticalTable.prototype, "_bindRows");
		const oTable = new AnalyticalTable({
			rows: {path: "myNamedModel>/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"},
			models: {
				myNamedModel: new ODataModelV2(sServiceURI)
			},
			columns: [new AnalyticalColumn()]
		});

		// DINC0118223: Binding the table to a named model should not throw an error.
		assert.ok(oInnerBindRows.calledOnce, "bindRows was called");
		assert.ok(!!oTable.getBindingInfo("rows"), "BindingInfo available");

		oInnerBindRows.restore();
	});

	QUnit.test("BindRows - Update columns", async function(assert) {
		const oBindingInfo = {path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"};

		async function testRun(mTestSettings) {
			const oTable = new AnalyticalTable({
				columns: [new AnalyticalColumn()]
			});

			if (mTestSettings.renderTable) {
				oTable.placeAt("qunit-fixture");
				await nextUIUpdate();
			}

			const oUpdateColumnsSpy = sinon.spy(oTable, "_updateColumns");
			const oInvalidateSpy = sinon.spy(oTable, "invalidate");

			oTable.setModel(mTestSettings.model);
			if (mTestSettings.bindingInfo != null) {
				oTable.bindRows(mTestSettings.bindingInfo);
			}

			try {
				await oTable._metadataLoaded();
			} catch (e) {
				// metadataLoaded rejected - proceed with test regardless
			}
			mTestSettings.metadataLoaded(oUpdateColumnsSpy, oInvalidateSpy, mTestSettings.renderTable);
			oTable.destroy();
		}

		async function test(mTestSettings) {
			mTestSettings.renderTable = true;
			await testRun(mTestSettings);
			mTestSettings.renderTable = false;
			await testRun(mTestSettings);
		}

		await test({
			bindingInfo: oBindingInfo,
			metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
				assert.ok(oUpdateColumnsSpy.notCalled, "No Model -> Columns not updated");
				if (bTableIsRendered) {
					assert.ok(oInvalidateSpy.notCalled, "Table is rendered -> Not invalidated");
				} else {
					assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
				}
			}
		});
		await test({
			model: new ODataModelV2(sServiceURI),
			metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
				assert.ok(oUpdateColumnsSpy.notCalled, "No BindingInfo -> Columns not updated");
				if (bTableIsRendered) {
					assert.ok(oInvalidateSpy.notCalled, "Table is rendered -> Not invalidated");
				} else {
					assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
				}
			}
		});
		await test({
			bindingInfo: oBindingInfo,
			model: new ODataModelV2(sServiceURI),
			metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
				assert.ok(oUpdateColumnsSpy.calledOnce, "V2 model -> Columns updated");
				if (bTableIsRendered) {
					assert.ok(oInvalidateSpy.calledOnce, "Table is rendered -> Invalidated");
				} else {
					assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
				}
			}
		});
	});

	/** @deprecated As of version 1.48 */
	QUnit.test("BindRows - Update columns with ODataModel V1 (legacy)", async function(assert) {
		const oBindingInfo = {path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"};

		async function testRun(mTestSettings) {
			const oTable = new AnalyticalTable({
				columns: [new AnalyticalColumn()]
			});

			if (mTestSettings.renderTable) {
				oTable.placeAt("qunit-fixture");
				await nextUIUpdate();
			}

			const oUpdateColumnsSpy = sinon.spy(oTable, "_updateColumns");
			const oInvalidateSpy = sinon.spy(oTable, "invalidate");

			oTable.setModel(mTestSettings.model);
			if (mTestSettings.bindingInfo != null) {
				oTable.bindRows(mTestSettings.bindingInfo);
			}

			try {
				await oTable._metadataLoaded();
			} catch (e) {
				// metadataLoaded rejected - proceed with test regardless
			}
			mTestSettings.metadataLoaded(oUpdateColumnsSpy, oInvalidateSpy, mTestSettings.renderTable);
			oTable.destroy();
		}

		async function test(mTestSettings) {
			mTestSettings.renderTable = true;
			await testRun(mTestSettings);
			mTestSettings.renderTable = false;
			await testRun(mTestSettings);
		}

		await test({
			bindingInfo: oBindingInfo,
			model: new ODataModel(sServiceURI, {loadMetadataAsync: false}),
			metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
				assert.ok(oUpdateColumnsSpy.calledOnce, "V1 model; Load metadata synchronously -> Columns updated");
				if (bTableIsRendered) {
					assert.ok(oInvalidateSpy.calledOnce, "Table is rendered -> Invalidated");
				} else {
					assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
				}
			}
		});
		await test({
			bindingInfo: oBindingInfo,
			model: new ODataModel(sServiceURI, {loadMetadataAsync: true}),
			metadataLoaded: function(oUpdateColumnsSpy, oInvalidateSpy, bTableIsRendered) {
				assert.ok(oUpdateColumnsSpy.calledOnce, "V1 model; Load metadata asynchronously -> Columns updated");
				if (bTableIsRendered) {
					assert.ok(oInvalidateSpy.calledOnce, "Table is rendered -> Invalidated");
				} else {
					assert.ok(oInvalidateSpy.notCalled, "Table is not rendered -> Not invalidated");
				}
			}
		});
	});

	QUnit.test("Binding events", function(assert) {
		const oChangeSpy = this.spy();
		const oDataRequestedSpy = this.spy();
		const oDataReceivedSpy = this.spy();
		const oSelectionChangedSpy = this.spy();

		this.oTable.bindRows({
			path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
			events: {
				change: oChangeSpy,
				dataRequested: oDataRequestedSpy,
				dataReceived: oDataReceivedSpy,
				selectionChanged: oSelectionChangedSpy
			}
		});

		const oBinding = this.oTable.getBinding();
		oBinding.fireEvent("change");
		oDataRequestedSpy.resetHistory(); // The AnalyticalBinding tends to send multiple requests initially.
		oBinding.fireEvent("dataRequested");
		oBinding.fireEvent("dataReceived");
		oBinding.fireEvent("selectionChanged");

		assert.ok(oChangeSpy.calledOnce, "The original change event listener was called once");
		assert.ok(oDataRequestedSpy.calledOnce, "The original dataRequested event listener was called once");
		assert.ok(oDataReceivedSpy.calledOnce, "The original dataReceived event listener was called once");
		assert.ok(oSelectionChangedSpy.calledOnce, "The original selectionChanged event listener was called once");
	});

	QUnit.test("_metadataLoaded", async function(assert) {
		const oModel = this.oTable.getModel();

		assert.expect(3);
		this.oTable.setModel(null);

		try {
			await this.oTable._metadataLoaded();
		} catch (e) {
			assert.ok(true, "No binding, no model: Promise rejected");
		}

		this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");
		try {
			await this.oTable._metadataLoaded();
		} catch (e) {
			assert.ok(true, "No model: Promise rejected");
		}

		this.oTable.setModel(oModel);
		await this.oTable._metadataLoaded();
		assert.ok(true, "Binding, model and metadata available: Promise resolved");
	});

	QUnit.module("Context menu", {
		beforeEach: async function() {
			this.oModel = new ODataModelV2(sServiceURI, {useBatch: true});
			this.oTable = createTable.call(this);
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Default context menu", function(assert) {
		assert.ok(this.oTable._getDefaultContextMenu().isA("sap.ui.table.menus.AnalyticalTableContextMenu"),
			"Default context menu is a sap.ui.table.menus.AnalyticalTableContextMenu");
	});

	QUnit.module("AnalyticalTable with ODataModel v2", {
		beforeEach: function() {
			this.oModel = new ODataModelV2(sServiceURI, {useBatch: true});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	/**
	 * @deprecated As of Version 1.117
	 */
	QUnit.test("Grouping and focus handling - legacy menu", function(assert) {
		const done = assert.async();
		this.oModel.metadataLoaded().then(function() {
			const mSettings = {
				columns: [
					createColumn({name: "CostCenter"}),
					createColumn({name: "PlannedCosts"}),
					createColumn({name: "Currency"})
				]
			};
			this.oTable = createTable.call(this, mSettings);

			const fnHandler1 = async function() {
				const oColumn = this.oTable.getColumns()[0];
				const nextColumnMenuOpen = TableQUnitUtils.nextEvent("columnMenuOpen", oColumn);

				oColumn._openHeaderMenu(oColumn.getDomRef());
				await nextColumnMenuOpen;

				await TableQUnitUtils.sleep(0);

				this.oTable.getBinding().attachChange(() => {
					this.oTable.attachEventOnce("rowsUpdated", () => {
						assert.deepEqual(document.activeElement, this.oTable.getDomRef("rowsel0"));
						done();
					});
				});

				oColumn.getMenu().getItems()[3].fireSelect();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		}.bind(this));
	});

	QUnit.test("Grouping and focus handling", function(assert) {
		const done = assert.async();
		this.oModel.metadataLoaded().then(() => {
			const mSettings = {
				columns: [
					createColumn({name: "CostCenter"}),
					createColumn({name: "PlannedCosts"}),
					createColumn({name: "Currency"})
				]
			};
			this.oTable = createTable.call(this, mSettings);

			const fnHandler1 = async function() {
				const oColumn = this.oTable.getColumns()[0];
				const oColumnMenu = new ColumnMenu();
				oColumn.setHeaderMenu(oColumnMenu);

				const nextBeforeOpen = TableQUnitUtils.nextEvent("beforeOpen", oColumnMenu);

				oColumn._openHeaderMenu(oColumn.getDomRef());
				await nextBeforeOpen;

				await TableQUnitUtils.sleep(0);

				const oGroupSwitch = oColumnMenu._getAllEffectiveQuickActions()[2].getContent()[0];
				oGroupSwitch.setState(true);
				oGroupSwitch.fireChange();

				this.oTable.getBinding().attachChange(() => {
					this.oTable.attachEventOnce("rowsUpdated", () => {
						assert.deepEqual(document.activeElement, this.oTable.getDomRef("rowsel0"));
						done();
					});
				});
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		});
	});

	QUnit.test("getAnalyticalInfoOfRow", function(assert) {
		const done = assert.async();
		this.oModel.metadataLoaded().then(() => {
			this.oTable = createTable.call(this);

			const fnHandler1 = function() {
				let oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[0]);
				assert.equal(oInfo.grandTotal, false, "Group: grandTotal flag");
				assert.equal(oInfo.group, true, "Group: group flag");
				assert.equal(oInfo.groupTotal, false, "Group: groupTotal flag");
				assert.equal(oInfo.level, 1, "Group: level");
				assert.ok(oInfo.context === this.oTable.getRows()[0].getBindingContext(), "Group: context");
				assert.equal(oInfo.groupedColumns.length, 1, "Group: groupedColumns");
				assert.equal(oInfo.groupedColumns[0], this.oTable.getGroupedColumns()[0], "Group: groupedColumn");

				oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[9]);
				assert.equal(oInfo.grandTotal, true, "GrandTotal: grandTotal flag");
				assert.equal(oInfo.group, false, "GrandTotal: group flag");
				assert.equal(oInfo.groupTotal, false, "GrandTotal: groupTotal flag");
				assert.equal(oInfo.level, 0, "GrandTotal: level");
				assert.ok(oInfo.context === this.oTable.getRows()[9].getBindingContext(), "GrandTotal: context");
				assert.equal(oInfo.groupedColumns.length, 0, "GrandTotal: groupedColumns");

				oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[10]);
				assert.ok(!oInfo, "Row has no context");

				oInfo = this.oTable.getAnalyticalInfoOfRow(new Row());
				assert.ok(!oInfo, "Row does not belong to the table");

				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.expand(0);
			};

			const fnHandler2 = function() {
				let oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[13]);
				assert.equal(oInfo.grandTotal, false, "GroupTotal: grandTotal flag");
				assert.equal(oInfo.group, false, "GroupTotal: group flag");
				assert.equal(oInfo.groupTotal, true, "GroupTotal: groupTotal flag");
				assert.equal(oInfo.level, 1, "GroupTotal: level");
				assert.ok(oInfo.context === this.oTable.getRows()[0].getBindingContext(), "GroupTotal: context");
				assert.equal(oInfo.groupedColumns.length, 1, "GroupTotal: groupedColumns");
				assert.equal(oInfo.groupedColumns[0], this.oTable.getGroupedColumns()[0], "Group: groupedColumn");

				this.oTable.unbindRows();
				oInfo = this.oTable.getAnalyticalInfoOfRow(this.oTable.getRows()[0]);
				assert.ok(!oInfo, "Table has no binding");

				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		});
	});

	/**
	 * @deprecated As of version 1.44
	 */
	QUnit.test("TreeAutoExpandMode property", function(assert) {
		const done = assert.async();
		const oExpandMode = TreeAutoExpandMode;

		function checkMode(mode, text) {
			assert.equal(mode.Bundled, "Bundled", text + " - Mode Bundled");
			assert.equal(mode.Sequential, "Sequential", text + " - Mode Sequential");
		}

		sap.ui.require(["sap/ui/table/TreeAutoExpandMode"], function(oMode) {
			checkMode(oMode, "Module sap/ui/table/TreeAutoExpandMode");
			assert.ok(sap.ui.table.TreeAutoExpandMode === oMode, "Namespace sap.ui.table.TreeAutoExpandMode");
			assert.ok(sap.ui.table.TreeAutoExpandMode === oExpandMode, "sap.ui.table.TreeAutoExpandMode === sap.ui.model.TreeAutoExpandMode");
			done();
		});

		this.oTable = new AnalyticalTable();
		let oBindingInfo = {};
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Default");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode(oExpandMode.Sequential);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Sequential, "Property AutoExpandMode - Sequential");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode(oExpandMode.Bundled);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Bundled");

		oBindingInfo = {};
		this.oTable.setAutoExpandMode("DOES_NOT_EXIST");
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.autoExpandMode, oExpandMode.Bundled, "Property AutoExpandMode - Wrong");
	});

	/**
	 * @deprecated As of version 1.44
	 */
	QUnit.test("SumOnTop property", function(assert) {
		this.oTable = new AnalyticalTable();
		let oBindingInfo = {};
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.sumOnTop, false, "Property SumOnTop - Default");

		oBindingInfo = {};
		this.oTable.setSumOnTop(true);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.sumOnTop, true, "Property SumOnTop - Custom");
	});

	/**
	 * @deprecated As of version 1.44
	 */
	QUnit.test("NumberOfExpandedLevels property", function(assert) {
		this.oTable = new AnalyticalTable();
		let oBindingInfo = {};
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 0, "Property NumberOfExpandedLevels - Default");

		this.oTable._aGroupedColumns = new Array(4);
		oBindingInfo = {};
		this.oTable.setNumberOfExpandedLevels(4);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 4, "Property NumberOfExpandedLevels - Custom");

		this.oTable._aGroupedColumns = [];
		oBindingInfo = {};
		this.oTable.setNumberOfExpandedLevels(4);
		this.oTable._applyAnalyticalBindingInfo(oBindingInfo);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, 0, "Property NumberOfExpandedLevels (no grouped columns) - Custom");
	});

	QUnit.test("Simple expand/collapse", function(assert) {
		const done = assert.async();
		this.oModel.metadataLoaded().then(() => {
			this.oTable = createTable.call(this);

			const fnHandler1 = function() {
				const oBinding = this.oTable.getBinding();

				/** @deprecated As of Version 1.44 */
				assert.equal(oBinding.mParameters.numberOfExpandedLevels, 0, "NumberOfExpandedLevels is 0");

				let oContext = this.oTable.getContextByIndex(0);
				assert.equal(oContext.getProperty("ActualCosts"), "1588416", "First row data is correct");

				oContext = this.oTable.getContextByIndex(8);
				assert.equal(oContext.getProperty("CostCenterText"), "Marketing Canada", "Last data row is correct");

				oContext = this.oTable._getFixedBottomRowContexts()[0].context;
				assert.equal(oContext.getProperty("ActualCosts"), "11775332", "Sum Row is correct");

				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.expand(0);
			};

			const fnHandler2 = function() {
				assert.ok(this.oTable.isExpanded(0), "First row is now expanded");
				const oContext = this.oTable.getContextByIndex(0);
				const oSumContext = this.oTable.getContextByIndex(13);
				assert.deepEqual(oContext, oSumContext, "Subtotal-Row context is correct");

				this.oTable.collapse(0);
				assert.equal(this.oTable.isExpanded(0), false, "First row is now collapsed again");
				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		});
	});

	QUnit.test("Row#expand & Row#collapse", function(assert) {
		const done = assert.async();
		this.oModel.metadataLoaded().then(() => {
			this.oTable = createTable.call(this);

			const fnHandler1 = function() {
				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.getRows()[0].expand();
			};

			const fnHandler2 = function() {
				assert.ok(this.oTable.isExpanded(0), "First row is now expanded");
				const oContext = this.oTable.getContextByIndex(0);
				const oSumContext = this.oTable.getContextByIndex(13);
				assert.deepEqual(oContext, oSumContext, "Subtotal-Row context is correct");
				assert.equal(this.oTable._getTotalRowCount(), 23, "Total row count");

				attachEventHandler(this.oTable, 0, fnHandler3, this);
				this.oTable.getRows()[0].collapse();
			};

			const fnHandler3 = function() {
				assert.equal(this.oTable.isExpanded(0), false, "First row is now collapsed again");
				assert.equal(this.oTable._getTotalRowCount(), 10, "Total row count");
				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");

		});
	});

	QUnit.test("ProvideGrandTotals = false: No Sum row available", function(assert) {
		const done = assert.async();
		this.oModel.metadataLoaded().then(() => {
			this.oTable = createTable.call(this);

			const fnHandler1 = function() {
				let oContext = this.oTable.getContextByIndex(0);
				assert.equal(oContext.getProperty("ActualCosts"), "1588416", "First row data is correct");

				oContext = this.oTable.getContextByIndex(8);
				assert.equal(oContext.getProperty("CostCenterText"), "Marketing Canada", "Last data row is correct");

				oContext = this.oTable._getFixedBottomRowContexts()[0].context;
				assert.equal(oContext.getPath(), "/artificialRootContext", "No Grand Totals: Root Context is artificial!");

				// initial expand
				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.expand(0);
			};

			const fnHandler2 = function() {
				assert.ok(this.oTable.isExpanded(0), "First row is now expanded");

				const oContext = this.oTable.getContextByIndex(0);
				const oSumContext = this.oTable.getContextByIndex(13);

				assert.notEqual(oContext.getPath(), oSumContext.getPath(), "No Subtotal Row Context inserted");

				this.oTable.collapse(0);
				assert.equal(this.oTable.isExpanded(0), false, "First row is now collapsed again");
				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows({
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					provideGrandTotals: false
				}
			});

		});
	});

	QUnit.test("Row state", function(assert) {
		const done = assert.async();

		this.oModel.metadataLoaded().then(() => {
			this.oTable = createTable.call(this);

			const fnHandler1 = function() {
				attachEventHandler(this.oTable, 1, fnHandler2, this);
				this.oTable.getRows()[0].expand();
			};

			const fnHandler2 = function() {
				const oExpandedGroupRow = this.oTable.getRows()[0];
				assert.strictEqual(oExpandedGroupRow.isGroupHeader(), true, "Group row (expanded): Is group header");
				assert.strictEqual(oExpandedGroupRow.getLevel(), 1, "Group row (expanded): Level");
				assert.strictEqual(oExpandedGroupRow.isExpandable(), true, "Group row (expanded): Expandable");
				assert.strictEqual(oExpandedGroupRow.isExpanded(), true, "Group row (expanded): Expanded");
				assert.strictEqual(
					oExpandedGroupRow.getTitle(),
					this.oTable.getBinding().getGroupName(oExpandedGroupRow.getBindingContext(), oExpandedGroupRow.getLevel()),
					"Group row (expanded): Title"
				);

				const oCollapsedGroupRow = this.oTable.getRows()[1];
				assert.strictEqual(oCollapsedGroupRow.isGroupHeader(), true, "Group row (collapsed): Is group header");
				assert.strictEqual(oCollapsedGroupRow.getLevel(), 2, "Group row (collapsed): Level");
				assert.strictEqual(oCollapsedGroupRow.isExpandable(), true, "Group row (collapsed): Expandable");
				assert.strictEqual(oCollapsedGroupRow.isExpanded(), false, "Group row (collapsed): Expanded");
				assert.strictEqual(
					oCollapsedGroupRow.getTitle(),
					this.oTable.getBinding().getGroupName(oCollapsedGroupRow.getBindingContext(), oCollapsedGroupRow.getLevel()),
					"Group row (collapsed): Title"
				);

				const oGroupSummaryRow = this.oTable.getRows()[13];
				assert.strictEqual(oGroupSummaryRow.isGroupSummary(), true, "Group summary row: Is group summary");
				assert.strictEqual(oGroupSummaryRow.getLevel(), 2, "Group summary row: Level");

				const oTotalSummaryRow = this.oTable.getRows()[19];
				assert.strictEqual(oTotalSummaryRow.isTotalSummary(), true, "Total summary row: Is total summary");
				assert.strictEqual(oTotalSummaryRow.getLevel(), 1, "Total summary row: Level");

				done();
			};

			attachEventHandler(this.oTable, 0, fnHandler1, this);
			this.oTable.bindRows("/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results");
		});
	});

	QUnit.module("AnalyticalColumn", {
		beforeEach: function() {
			this.oModel = new ODataModelV2(sServiceURI, {useBatch: true});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("_setGrouped", function(assert) {
		const done = assert.async();
		this.oTable = createTable.call(this);
		const oColumn = this.oTable.getColumns()[1];

		assert.ok(!oColumn.getGrouped(), "The column is not grouped initially");
		this.oTable.attachGroup((oEvent) => {
			assert.ok(oEvent.getParameter("column") === oColumn &&
					  oEvent.getParameter("groupedColumns") === this.oTable._aGroupedColumns &&
					  oEvent.getParameter("type") === "group", "The group event is fired with the correct parameters");
			done();
		});
		oColumn._setGrouped(true);
		assert.ok(oColumn.getGrouped(), "The column is grouped");
	});

	QUnit.test("Cell content visibility settings", function(assert) {
		this.oTable = createTable.call(this);
		const oColumn = this.oTable.getColumns()[1];

		oColumn._setCellContentVisibilitySettings({
			standard: false,
			groupHeader: {nonExpandable: false, expanded: false, collapsed: false},
			summary: {group: false, total: false}
		});

		assert.deepEqual(oColumn._getCellContentVisibilitySettings(), {
			standard: true,
			groupHeader: {nonExpandable: true, expanded: true, collapsed: true},
			summary: {group: true, total: true}
		}, "Settings cannot be changed from outside");
	});

	QUnit.module("AnalyticalColumn - Column Menu", {
		beforeEach: function() {
			this._oTable = new AnalyticalTable();
			this._oTable.addColumn(createColumn({name: "CostCenter"}));
			this._oTable.addColumn(createColumn({name: "d1"}));
			this._oTable.addColumn(createColumn({name: "d2_filterable"}));
			this._oTable.addColumn(createColumn({name: "d3_filterable"}));
			this._oTable.addColumn(createColumn({name: "d4"}));
			this._oTable.addColumn(createColumn({name: "d5_filterable"}));

			this._oTable.removeColumn = function(oColumn) {
				return this.removeAggregation('columns', oColumn);
			};

			// no real binding is required here. Instead mock a binding object
			sinon.stub(this._oTable, "getBinding").callsFake(function() {
				const oBinding = {};
				const aProperties = [
					{name: "m1", type: "measure", filterable: false},
					{name: "m2_filterable", type: "measure", filterable: true},
					{name: "d1", type: "dimension", filterable: false, sortProperty: "d1"},
					{name: "d2_filterable", type: "dimension", filterable: true, sortProperty: "d2_filterable"},
					{name: "d3_filterable", type: "dimension", filterable: true, sortProperty: "d3_filterable"},
					{name: "d4", type: "dimension", filterable: false, sortProperty: "d4", filterProperty: "d3_filterable"},
					{name: "d5_filterable", type: "dimension", filterable: false, filterProperty: "d5_filterable"}
				];

				oBinding.isMeasure = function(sPropertyName) {
					return aProperties.some((oProperty) => oProperty.name === sPropertyName && oProperty.type === "measure");
				};

				oBinding.getProperty = function(sPropertyName) {
					return aProperties.find((oProperty) => oProperty.name === sPropertyName);
				};

				oBinding.getSortablePropertyNames = function() {
					return aProperties
						.filter((oProperty) => oProperty.sortProperty)
						.map((oProperty) => oProperty.name);
				};

				oBinding.getFilterablePropertyNames = function() {
					return aProperties
						.filter((oProperty) => oProperty.filterable === true)
						.map((oProperty) => oProperty.name);
				};

				oBinding.getAnalyticalQueryResult = function() {
					return {
						findMeasureByPropertyName: function(arg1) {
							return {value: true, argument: arg1};
						},
						findDimensionByPropertyName: function(arg1) {
							if (arg1 === "d1" || arg1 === "d2_filterable" || arg1 === "d5_filterable") {
								return {
									getName: function() {
										return arg1;
									}
								};
							} else {
								return {
									getName: function() {
										return "d3_filterable";
									}
								};
							}
						}
					};
				};

				return oBinding;
			});
			this._oColumn = new AnalyticalColumn();
		},
		afterEach: function() {
			this._oTable.getBinding.restore();
			this._oColumn.destroy();
			this._oTable.destroy();
		}
	});

	QUnit.test("_isAggregatableByMenu", function(assert) {
		const oColumn = this._oTable.getColumns()[0];

		const oReturnValue = oColumn._isAggregatableByMenu();
		assert.ok(oReturnValue.value, "", "findMeasureByPropertyName is called");
		assert.equal(oReturnValue.argument, "CostCenter", "findMeasureByPropertyName is called with the correct parameter");
	});

	QUnit.test("isGroupableByMenu", function(assert) {
		const aColumns = this._oTable.getColumns();
		assert.notOk(aColumns[1].isGroupableByMenu(), "Column is not groupable by menu");
		assert.ok(aColumns[2].isGroupableByMenu(), "Column is groupable by menu");
		assert.ok(aColumns[3].isGroupableByMenu(), "Column is groupable by menu");
		assert.ok(aColumns[4].isGroupableByMenu(), "Column is groupable by menu");
		assert.notOk(aColumns[5].isGroupableByMenu(), "Column is not groupable by menu");
	});

	QUnit.test("Pre-Check Menu Item Creation without Parent", function(assert) {

		//######################################################################################################
		// Filter menu item
		//######################################################################################################
		this._oColumn.setFilterProperty("");
		this._oColumn.setShowFilterMenuEntry(true);

		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("m1");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("m2_filterable");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("d1");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("d2_filterable");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());
	});

	QUnit.test("Pre-Check Menu Item Creation with Parent", function(assert) {

		//######################################################################################################
		// Filter menu item
		//######################################################################################################
		// add the column to analytical table
		this._oTable.addAggregation("columns", this._oColumn);

		this._oColumn.setFilterProperty("");
		this._oColumn.setShowFilterMenuEntry(true);

		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("m1");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("m2_filterable");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(this._oColumn.isFilterableByMenu(), "Measure fields marked as filterable --> still filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("d1");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("d2_filterable");
		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(this._oColumn.isFilterableByMenu(), "Filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(), "Not filterable by menu: " +
			"filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "', " +
			"showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());
	});

	QUnit.module("BusyIndicator", {
		before: function() {
			this.oDataModel = new ODataModelV2(sServiceURI);

			TableQUnitUtils.setDefaultSettings({
				id: "table",
				models: this.oDataModel,
				columns: [
					createColumn({grouped: true, name: "CostCenter"}),
					createColumn({name: "CostCenterText"}),
					createColumn({grouped: true, name: "CostElement"}),
					createColumn({name: "CostElementText"}),
					createColumn({grouped: true, name: "Currency"}),
					createColumn({summed: true, name: "ActualCosts"}),
					createColumn({summed: true, name: "PlannedCosts"})
				]
			});

			return this.oDataModel.metadataLoaded();
		},
		afterEach: function() {
			this.getTable().destroy();
		},
		after: function() {
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		},
		assertState: function(assert, sMessage, mExpectation) {
			const oTable = this.getTable();

			assert.deepEqual({
				pendingRequests: oTable._isWaitingForData(),
				busy: oTable.getBusy()
			}, mExpectation, sMessage);
		},
		getTable: function() {
			return Element.getElementById("table");
		}
	});

	QUnit.test("Initial request; Automatic BusyIndicator disabled; Batch requests disabled", function(assert) {
		const done = assert.async();
		const that = this;
		let iCurrentRequest = 0;
		const iExpectedRequestCount = 2;

		assert.expect(7);

		TableQUnitUtils.createTable(AnalyticalTable, {
			busyStateChanged: function() {
				assert.ok(false, "The 'busyStateChanged' event should not be fired");
			},
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: false});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: false});
						iCurrentRequest++;

						if (iCurrentRequest === iExpectedRequestCount) {
							setTimeout(function() {
								that.assertState(assert, "200ms after last 'dataReceived'", {pendingRequests: false, busy: false});
								done();
							}, 200);
						}
					}
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: true, busy: false});
	});

	QUnit.test("Initial request; Automatic BusyIndicator enabled; Batch requests disabled", function(assert) {
		const done = assert.async();
		const that = this;

		assert.expect(8);

		TableQUnitUtils.createTable(AnalyticalTable, {
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: true, busy: true});
	});

	QUnit.test("Initial request; Automatic BusyIndicator enabled; Batch requests enabled", function(assert) {
		const done = assert.async();
		const that = this;

		assert.expect(5);

		TableQUnitUtils.createTable(AnalyticalTable, {
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				},
				parameters: {
					useBatchRequests: true
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: false, busy: false});
	});

	QUnit.test("Rebind after 'dataRequested'", function(assert) {
		const done = assert.async();
		const that = this;
		let bRebound = false;

		assert.expect(5);

		TableQUnitUtils.createTable(AnalyticalTable, {
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});

						if (!bRebound) {
							const oBindingInfo = that.getTable().getBindingInfo("rows");

							oBindingInfo.parameters = {useBatchRequests: true};
							bRebound = true;
							that.getTable().bindRows(oBindingInfo);
						}
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});
	});

	QUnit.module("NoData", {
		before: function() {
			this.oDataModel = new ODataModelV2(sServiceURI);

			TableQUnitUtils.setDefaultSettings({
				models: this.oDataModel,
				columns: [
					createColumn({grouped: true, name: "CostCenter"}),
					createColumn({name: "CostCenterText"}),
					createColumn({grouped: true, name: "CostElement"}),
					createColumn({name: "CostElementText"}),
					createColumn({grouped: true, name: "Currency"}),
					createColumn({summed: true, name: "ActualCosts"}),
					createColumn({summed: true, name: "PlannedCosts"})
				]
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
				rows: {
					path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
					parameters: {
						useBatchRequests: true
					}
				}
			});
			this.iNoDataVisibilityChanges = 0;

			await this.oTable.qunit.rendered();
			this.oObserver = new MutationObserver((aRecords) => {
				const oRecord = aRecords[0];
				const bNoDataWasVisible = oRecord.oldValue.includes("sapUiTableEmpty");
				const bNoDataIsVisible = oRecord.target.classList.contains("sapUiTableEmpty");

				if (bNoDataWasVisible !== bNoDataIsVisible) {
					this.iNoDataVisibilityChanges++;
				}
			});

			this.oObserver.observe(this.oTable.getDomRef(), {attributes: true, attributeOldValue: true, attributeFilter: ["class"]});
		},
		afterEach: function() {
			if (this.oObserver) {
				this.oObserver.disconnect();
			}
			this.oTable.destroy();
		},
		after: function() {
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		},
		assertNoDataVisibilityChangeCount: function(assert, iCount) {
			assert.equal(this.iNoDataVisibilityChanges, iCount, "Number of NoData visibility changes");
			this.resetNoDataVisibilityChangeCount();
		},
		resetNoDataVisibilityChangeCount: function() {
			this.iNoDataVisibilityChanges = 0;
		}
	});

	QUnit.test("After rendering with data", function(assert) {
		const done = assert.async();

		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					useBatchRequests: true
				}
			}
		}, function(oTable) {
			new Promise((resolve) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
					resolve();
				});
			}).then(oTable.qunit.rendered).then(() => {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, false);
				done();
			});
		});
	});

	QUnit.test("After rendering without data", function(assert) {
		const done = assert.async();

		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					useBatchRequests: true
				},
				filters: [new Filter({path: "CostCenter", operator: "eq", value1: "DoesNotExist"})]
			}
		}, function(oTable) {
			new Promise((resolve) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
					resolve();
				});
			}).then(oTable.qunit.rendered).then(() => {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
				done();
			});
		});
	});

	QUnit.test("After rendering without data but with the grand total", function(assert) {
		const done = assert.async();

		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
			rows: {
				path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
				parameters: {
					useBatchRequests: true
				},
				filters: [new Filter({path: "CostCenter", operator: "eq", value1: "DoesNotExistButReturnsGrandTotal"})]
			}
		}, function(oTable) {
			new Promise((resolve) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
					resolve();
				});
			}).then(oTable.qunit.rendered).then(() => {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
				done();
			});
		});
	});

	QUnit.test("Bind/Unbind", async function(assert) {
		const oBindingInfo = this.oTable.getBindingInfo("rows");

		this.oTable.unbindRows();
		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Unbind");
		this.assertNoDataVisibilityChangeCount(assert, 1);
		this.oTable.bindRows(oBindingInfo);
		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Bind");
		this.assertNoDataVisibilityChangeCount(assert, 1);
	});

	QUnit.test("Rerender while binding/unbinding", async function(assert) {
		const oBindingInfo = this.oTable.getBindingInfo("rows");
		const that = this;

		this.oTable.unbindRows();
		this.oTable.invalidate();
		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Unbind");
		that.assertNoDataVisibilityChangeCount(assert, 1);

		that.oTable.invalidate();
		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Rerender");
		that.assertNoDataVisibilityChangeCount(assert, 0);

		that.oTable.bindRows(oBindingInfo);
		that.oTable.invalidate();
		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Bind");
		that.assertNoDataVisibilityChangeCount(assert, 1);

		that.oTable.invalidate();
		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Rerender");
		that.assertNoDataVisibilityChangeCount(assert, 0);
	});

	QUnit.module("TreeBindingProxy", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
				models: new ODataModelV2(sServiceURI),
				columns: [
					createColumn({grouped: true, name: "CostCenter"})
				],
				rows: {
					path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results"
				}
			});
			this.oProxy = this.oTable._oProxy;
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Proxy Initialisation", function(assert) {
		const oTable = new AnalyticalTable();
		assert.ok(oTable._oProxy, "TreeTable has a proxy object");
		assert.equal(oTable._oProxy._sAggregation, "rows", "Proxy has correct aggregation");
		assert.equal(oTable._oProxy._oControl, oTable, "Proxy has correct control associated");
		oTable.destroy();
	});

	/**
	 * @deprecated As of version 1.76
	 */
	QUnit.test("Correct Proxy Calls - collapseRecursive property", function(assert) {
		// Initialise spies
		const fnSetCollapseRecursiveSpy = sinon.spy(this.oProxy, "setCollapseRecursive");

		// setCollapseRecursive
		this.oTable.setCollapseRecursive(true);
		assert.ok(fnSetCollapseRecursiveSpy.called, "proxy#setCollapseRecursive was called");

		// Restore spies and stubs
		fnSetCollapseRecursiveSpy.restore();
	});

	QUnit.test("Correct Proxy Calls", function(assert) {
		this.spy(this.oProxy, "expand");
		this.oTable.expand(0);
		assert.ok(this.oProxy.expand.calledOnceWithExactly(0), "proxy#expand call");

		this.spy(this.oProxy, "collapse");
		this.oTable.collapse(0);
		assert.ok(this.oProxy.collapse.calledOnceWithExactly(0), "proxy#collapse call");

		this.spy(this.oProxy, "expandToLevel");
		this.oTable._aGroupedColumns = Array(3);
		this.oTable.expandAll();
		assert.ok(this.oProxy.expandToLevel.calledOnceWithExactly(3), "proxy#expandToLevel call");

		this.spy(this.oProxy, "collapseAll");
		this.oTable.collapseAll();
		assert.ok(this.oProxy.collapseAll.calledOnceWithExactly(), "proxy#collapseAll call");

		this.spy(this.oProxy, "isExpanded");
		this.oTable.isExpanded(0);
		assert.ok(this.oProxy.isExpanded.calledOnceWithExactly(0), "proxy#isExpanded call");

		this.spy(this.oProxy, "getNodeByIndex");
		this.oTable.getContextInfoByIndex(0);
		assert.ok(this.oProxy.getNodeByIndex.calledOnceWithExactly(0), "proxy#getNodeByIndex call");
	});

	QUnit.module("Hidden table with suspended binding", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(AnalyticalTable, {
				models: new ODataModelV2(sServiceURI),
				columns: [
					createColumn({grouped: true, name: "CostCenter"}),
					createColumn({name: "CostCenterText"}),
					createColumn({grouped: true, name: "CostElement"}),
					createColumn({name: "CostElementText"}),
					createColumn({grouped: true, name: "Currency"}),
					createColumn({summed: true, name: "ActualCosts"}),
					createColumn({summed: true, name: "PlannedCosts"})
				],
				rows: {
					path: "/ActualPlannedCosts(P_ControllingArea='US01',P_CostCenter='100-1000',P_CostCenterTo='999-9999')/Results",
					parameters: {
						useBatchRequests: true
					},
					suspended: true
				},
				visible: false
			});
			this.fnBindingNodesSpy = sinon.spy(this.oTable.getBinding(), "getNodes");
		},
		afterEach: function() {
			this.oTable?.destroy();
			this.fnBindingNodesSpy?.restore();
		},
		after: function() {
			this.oDataModel?.destroy();
		}
	});

	QUnit.test("Initialization", async function(assert) {
		await TableQUnitUtils.sleep(100);
		assert.ok(this.fnBindingNodesSpy.notCalled, "Binding.getNodes was not called");
	});

	QUnit.test("#_getContexts", function(assert) {
		const oBinding = this.oTable.getBinding();

		this.fnBindingNodesSpy.resetHistory();
		this.oTable.setVisible(false);
		oBinding.suspend();
		assert.deepEqual(this.oTable._getContexts(), [], "Called on invisible table and suspended binding: Return value");
		assert.ok(this.fnBindingNodesSpy.notCalled, "Called on invisible table and suspended binding: Binding#getNodes not called");

		oBinding.resume();
		this.fnBindingNodesSpy.resetHistory();
		this.oTable._getContexts(1, 2, 3);
		assert.ok(this.fnBindingNodesSpy.calledOnceWithExactly(1, 2, 3),
			"Called on invisible table and not suspended binding: Binding#getNodes call");

		this.fnBindingNodesSpy.resetHistory();
		this.oTable.setVisible(true);
		oBinding.suspend();
		this.oTable._getContexts(1, 2, 3);
		assert.ok(this.fnBindingNodesSpy.calledOnceWithExactly(1, 2, 3),
			"Called on visible table and suspended binding: Binding#getNodes call");

		this.fnBindingNodesSpy.resetHistory();
		this.oTable.unbindRows();
		assert.deepEqual(this.oTable._getContexts(1, 2, 3), [], "Called without binding: Return value");
		assert.ok(this.fnBindingNodesSpy.notCalled, "Called without binding: Binding#getNodes not called");
	});

	QUnit.module("Unsupported operations", {
		beforeEach: function() {
			this.oTable = new AnalyticalTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	/**
	 * @deprecated As of version 1.28
	 */
	QUnit.test("setGroupBy logs a warning and does not change the association", function(assert) {
		const oLogWarning = this.stub(Log, "warning");
		assert.strictEqual(this.oTable.setGroupBy("someColumnId"), this.oTable, "setGroupBy returns the table for chaining");
		assert.strictEqual(this.oTable.getGroupBy(), null, "groupBy association remains unset");
		assert.ok(oLogWarning.calledOnce, "Log.warning called once");
	});

	QUnit.test("_getColumn throws for unsupported column types", function(assert) {
		assert.throws(() => this.oTable._getColumn(42),
			new Error("Wrong column type. You need to define a string (property) or pass an AnalyticalColumnObject"));
	});

	QUnit.test("_getColumn creates an AnalyticalColumn from a string", function(assert) {
		const oColumn = this.oTable._getColumn("SomeProperty");
		assert.ok(oColumn instanceof AnalyticalColumn, "Returns an AnalyticalColumn");
		assert.strictEqual(oColumn.getLeadingProperty(), "SomeProperty", "leadingProperty derived from the string");
		oColumn.destroy();
	});

	QUnit.test("_getColumn passes an AnalyticalColumn through unchanged", function(assert) {
		const oColumn = new AnalyticalColumn();
		assert.strictEqual(this.oTable._getColumn(oColumn), oColumn, "Returns the same instance");
		oColumn.destroy();
	});

	QUnit.test("Methods depending on the binding tolerate an unbound table", function(assert) {
		assert.deepEqual(this.oTable._getFixedBottomRowContexts(), [], "_getFixedBottomRowContexts returns an empty array");
		assert.strictEqual(this.oTable._getTotalRowCount(), 0, "_getTotalRowCount returns 0");
		this.oTable._updateTotalRow(true);
		assert.deepEqual(this.oTable.getProperty("rowCountConstraints"), {fixedTop: false, fixedBottom: false},
			"_updateTotalRow keeps fixedBottom disabled");
	});

	QUnit.test("_getColumnInformation logs an error for non-AnalyticalColumn instances", function(assert) {
		const oLogError = this.stub(Log, "error");
		const oPlainColumn = new Column();
		// AnalyticalColumn adds getLeadingProperty; a plain Column does not. Stub it so the
		// method can complete after logging.
		oPlainColumn.getLeadingProperty = () => "P";
		oPlainColumn.getGrouped = () => false;
		oPlainColumn.getSummed = () => false;
		oPlainColumn.getInResult = () => false;
		oPlainColumn.getGroupHeaderFormatter = () => null;

		this.oTable.addAggregation("columns", oPlainColumn);
		this.oTable._getColumnInformation();

		assert.ok(oLogError.calledWithMatch(/AnalyticalColumns/), "Log.error called with the expected message");
	});

	QUnit.module("suspend/resumeUpdateAnalyticalInfo", {
		beforeEach: function() {
			this.oTable = new AnalyticalTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("suspend prevents _updateColumns and updateAnalyticalInfo from running", function(assert) {
		const oUpdateTableColumnDetailsSpy = this.spy(this.oTable, "_updateTableColumnDetails");
		const oUpdateAnalyticalInfoSpy = this.spy(this.oTable, "updateAnalyticalInfo");

		this.oTable.suspendUpdateAnalyticalInfo();
		assert.strictEqual(this.oTable._bSuspendUpdateAnalyticalInfo, true, "Suspend flag set");

		this.oTable._updateColumns();
		assert.ok(oUpdateTableColumnDetailsSpy.notCalled, "_updateTableColumnDetails not called while suspended");

		this.oTable.updateAnalyticalInfo();
		assert.ok(oUpdateAnalyticalInfoSpy.calledOnce, "updateAnalyticalInfo invoked but returned early");
	});

	QUnit.test("resume clears the suspend flag and triggers _updateColumns", function(assert) {
		const oUpdateColumnsSpy = this.spy(this.oTable, "_updateColumns");

		this.oTable.suspendUpdateAnalyticalInfo();
		this.oTable.resumeUpdateAnalyticalInfo(true, false);

		assert.strictEqual(this.oTable._bSuspendUpdateAnalyticalInfo, false, "Suspend flag cleared");
		assert.ok(oUpdateColumnsSpy.calledOnceWithExactly(true, false), "_updateColumns called with forwarded arguments");
	});

	QUnit.test("_updateTableColumnDetails returns early while suspended", function(assert) {
		this.oTable._bSuspendUpdateAnalyticalInfo = true;
		const oGetBindingSpy = this.spy(this.oTable, "getBinding");

		this.oTable._updateTableColumnDetails();

		assert.ok(oGetBindingSpy.notCalled, "getBinding not called while suspended");
	});

	QUnit.module("Column aggregation management", {
		beforeEach: function() {
			this.oTable = new AnalyticalTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("insertColumn registers a grouped column", function(assert) {
		const oGrouped = new AnalyticalColumn({leadingProperty: "A", grouped: true});
		const oUngrouped = new AnalyticalColumn({leadingProperty: "B"});

		this.oTable.insertColumn(oGrouped, 0);
		this.oTable.insertColumn(oUngrouped, 1);

		assert.deepEqual(this.oTable.getGroupedColumns(), [oGrouped.getId()], "Only the grouped column is registered");
		assert.strictEqual(this.oTable.getColumns()[0], oGrouped, "Column inserted at requested index");
	});

	QUnit.test("removeColumn removes the column id from the grouped-columns list", function(assert) {
		const oGrouped = new AnalyticalColumn({leadingProperty: "A", grouped: true});

		this.oTable.addColumn(oGrouped);
		assert.deepEqual(this.oTable.getGroupedColumns(), [oGrouped.getId()], "Grouped column registered on add");

		this.oTable.removeColumn(oGrouped);
		assert.deepEqual(this.oTable.getGroupedColumns(), [], "Grouped column deregistered on remove");

		oGrouped.destroy();
	});

	QUnit.test("removeColumn leaves grouped-columns list unchanged during a column reorder", function(assert) {
		const oGrouped = new AnalyticalColumn({leadingProperty: "A", grouped: true});
		this.oTable.addColumn(oGrouped);

		this.oTable._bReorderInProcess = true;
		this.oTable.removeColumn(oGrouped);

		assert.deepEqual(this.oTable.getGroupedColumns(), [oGrouped.getId()],
			"Grouped column still registered when removal is caused by reorder");
		this.oTable._bReorderInProcess = false;
		oGrouped.destroy();
	});

	QUnit.test("removeAllColumns clears the grouped-columns list", function(assert) {
		this.oTable.addColumn(new AnalyticalColumn({leadingProperty: "A", grouped: true}));
		this.oTable.addColumn(new AnalyticalColumn({leadingProperty: "B", grouped: true}));

		const aResult = this.oTable.removeAllColumns();

		assert.strictEqual(aResult.length, 2, "Removed columns are returned");
		assert.deepEqual(this.oTable.getGroupedColumns(), [], "Grouped-columns list is empty");
		aResult.forEach((oColumn) => oColumn.destroy());
	});

	QUnit.test("_removeGroupedColumn removes only the matching id", function(assert) {
		this.oTable._aGroupedColumns = ["a", "b", "c"];

		this.oTable._removeGroupedColumn("b");
		assert.deepEqual(this.oTable._aGroupedColumns, ["a", "c"], "Existing id removed");

		this.oTable._removeGroupedColumn("x");
		assert.deepEqual(this.oTable._aGroupedColumns, ["a", "c"], "Unknown id ignored");
	});

	/** @deprecated As of version 1.48 */
	QUnit.module("_metadataLoaded with a v1 model", {
		beforeEach: function() {
			this.oTable = new AnalyticalTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Resolves once the v1 model fires 'metadataLoaded' asynchronously", async function(assert) {
		let fnMetadataLoadedCallback;
		const oV1Model = {
			oMetadata: {isLoaded: () => false},
			attachMetadataLoaded: (fn) => {
				fnMetadataLoadedCallback = fn;
			}
		};
		this.stub(this.oTable, "getBinding").returns({getModel: () => oV1Model});

		let bResolved = false;
		const oPromise = this.oTable._metadataLoaded().then(() => {
			bResolved = true;
		});

		// The promise must be pending until the model's metadataLoaded event fires.
		await Promise.resolve();
		assert.strictEqual(bResolved, false, "Promise is pending while the model has not yet loaded metadata");
		assert.strictEqual(typeof fnMetadataLoadedCallback, "function", "attachMetadataLoaded received a callback");

		fnMetadataLoadedCallback();
		await oPromise;
		assert.strictEqual(bResolved, true, "Promise resolves after the model fires metadataLoaded");
	});

	QUnit.module("Analytical Info", {
		beforeEach: function() {
			this.oTable = new AnalyticalTable();

			this.oBinding = {
				getNumberOfExpandedLevels: this.stub().returns(0),
				setNumberOfExpandedLevels: this.stub(),
				updateAnalyticalInfo: this.stub(),
				providesGrandTotal: this.stub().returns(false),
				hasTotaledMeasures: this.stub().returns(false),
				getAnalyticalQueryResult: this.stub().returns(null),
				isMeasure: this.stub().returns(false),
				nodeHasChildren: this.stub().returns(false),
				getGroupName: this.stub().returns(""),
				getModel: this.stub().returns({})
			};
			this.stub(this.oTable, "getBinding").returns(this.oBinding);
			this.stub(this.oTable, "getBindingInfo").returns({parameters: {sumOnTop: false}});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("updateAnalyticalInfo resets numberOfExpandedLevels when it exceeds grouped-column count", function(assert) {
		this.oBinding.getNumberOfExpandedLevels.returns(5);
		this.oTable._aGroupedColumns = ["a"];

		this.oTable.updateAnalyticalInfo(true);

		assert.ok(this.oBinding.setNumberOfExpandedLevels.calledOnceWithExactly(0),
			"Binding#setNumberOfExpandedLevels called with 0");
	});

	QUnit.test("updateAnalyticalInfo returns early while suspended", function(assert) {
		this.oTable._bSuspendUpdateAnalyticalInfo = true;

		this.oTable.updateAnalyticalInfo();

		assert.ok(this.oBinding.updateAnalyticalInfo.notCalled, "Binding#updateAnalyticalInfo not called");
	});

	QUnit.test("_updateTableColumnDetails skips invisible columns and flags the sole ungrouped dimension", function(assert) {
		const oUngroupedColumn = new AnalyticalColumn({leadingProperty: "Dim1"});
		const oInvisibleColumn = new AnalyticalColumn({leadingProperty: "Dim2", visible: false});

		this.oTable.addAggregation("columns", oUngroupedColumn);
		this.oTable.addAggregation("columns", oInvisibleColumn);

		this.oBinding.getAnalyticalQueryResult.returns({
			findDimensionByPropertyName: (sName) => ({getName: () => sName})
		});

		this.oTable._updateTableColumnDetails();

		assert.strictEqual(oUngroupedColumn._isLastGroupableLeft, true,
			"Ungrouped dimension flagged as last groupable left");
		assert.strictEqual(oInvisibleColumn._isLastGroupableLeft, false,
			"Invisible column not touched by the flag-assignment loop");
	});

	QUnit.test("_getFirstMeasureColumnIndex returns -1 without an analytical query result", function(assert) {
		this.oBinding.getAnalyticalQueryResult.returns(null);
		assert.strictEqual(this.oTable._getFirstMeasureColumnIndex(), -1, "Returns -1 without a result set");
	});

	QUnit.test("_getFirstMeasureColumnIndex returns the index of the first measure column", function(assert) {
		const oColumnA = new AnalyticalColumn({leadingProperty: "A"});
		const oColumnB = new AnalyticalColumn({leadingProperty: "B"});
		const oColumnC = new AnalyticalColumn({leadingProperty: "C"});

		this.stub(this.oTable, "_getVisibleColumns").returns([oColumnA, oColumnB, oColumnC]);
		this.oBinding.getAnalyticalQueryResult.returns({
			findMeasureByName: (sName) => (sName === "B" ? {name: sName} : null),
			findMeasureByPropertyName: () => null
		});

		assert.strictEqual(this.oTable._getFirstMeasureColumnIndex(), 1, "Index of first measure column");
		oColumnA.destroy();
		oColumnB.destroy();
		oColumnC.destroy();
	});

	QUnit.module("updateRowState hook", {
		beforeEach: function() {
			this.oTable = new AnalyticalTable();
			this.stub(this.oTable, "getBinding").returns({
				nodeHasChildren: () => false,
				getGroupName: () => ""
			});
			this.stub(this.oTable, "getBindingInfo").returns({parameters: {sumOnTop: false}});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Row state remains untouched when the node has no context", function(assert) {
		const oState = {
			context: {context: null, nodeState: {}, level: 0},
			Type: {Standard: "Standard", GroupHeader: "GroupHeader", Summary: "Summary"},
			type: "Standard"
		};

		TableUtils.Hook.call(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, oState);

		assert.strictEqual(oState.context, null, "Context replaced by the inner node context");
		assert.strictEqual(oState.type, "Standard", "Type unchanged");
		assert.notOk("expanded" in oState, "Expanded not assigned");
		assert.notOk("title" in oState, "Title not assigned");
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.module("_onPersoApplied", {
		beforeEach: function() {
			this.oTable = new AnalyticalTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("Rebuilds the grouped-columns list from currently grouped columns", function(assert) {
		const oGrouped = new AnalyticalColumn({leadingProperty: "A", grouped: true});
		const oUngrouped = new AnalyticalColumn({leadingProperty: "B"});
		this.oTable.addColumn(oGrouped);
		this.oTable.addColumn(oUngrouped);

		this.oTable._aGroupedColumns = ["stale"];
		this.oTable._onPersoApplied();

		assert.deepEqual(this.oTable._aGroupedColumns, [oGrouped.getId()],
			"Grouped-columns list reflects the current grouped columns only");
	});
});