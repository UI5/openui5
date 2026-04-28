/* global QUnit */

sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/model/type/Boolean"
], function(
	nextUIUpdate,
	XMLView,
	JSONModel,
	RowSettings,
	Boolean
) {
	'use strict';

	function formatNavigated(sDescription) {
		return sDescription === "item 1";
	}

	function formatHighlight(sDescription) {
		if (sDescription === "item 1") {
			return "Warning";
		} else {
			return "Information";
		}
	}

	const oModel = new JSONModel({
		items: [
			{
				description: "item 1",
				type: "Navigation"
			},
			{
				description: "item 2",
				type: "Navigation"
			}
		],
		description: "item test",
		type: "Navigation"
	});

	function createView(sType, sSettings) {
		if (sSettings) {
			sSettings = "<rowSettings><mdcTable:RowSettings " + sSettings + "/></rowSettings>";
		} else {
			sSettings = "";
		}

		return XMLView.create({
			definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table'
						+ ' id="myTable" delegate="\{\'name\': \'test-resources/sap/ui/mdc/delegates/TableDelegate\', \'payload\': \{'
						+ ' \'collectionName\': \'items\' \} \}"><type><mdcTable:' + sType + '/></type>' + sSettings + '<columns><mdcTable:Column'
						+ ' id="myTable--column0" header="column 0" propertyKey="column0"><m:Text text="{description}" id="myTable--text0"'
						+ ' /></mdcTable:Column></columns></Table></mvc:View>'
		}).then(async function(oView) {
			oView.setModel(oModel);
			oView.placeAt("qunit-fixture");
			await nextUIUpdate();
			return oView;
		});
	}

	QUnit.module("RowSettings unit tests", {
		afterEach: function() {
			if (this.oView) {
				this.oTable = null;
				this.oView.destroy();
				this.oView = null;
			}
		}
	});

	QUnit.test("GridTable without settings in XML", function(assert) {
		const that = this;

		return createView("GridTableType").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			return that.oTable.initialized();
		}).then(function() {
			return new Promise(function(resolve) {
				that.oTable._oTable.attachEventOnce("rowsUpdated", async function() {
					// Check default values for settings
					assert.equal(that.oTable._oTable.getBinding("rows").getLength(), 2, "The table contains 2 rows");
					assert.equal(that.oTable.getRowSettings(), null, "No row settings defined");

					assert.equal(that.oTable._oTable.getRows()[0].getAggregation("_settings"), null, "No inner row settings defined");

					// Set fixed bound values for settings
					let oTableRowSettings = new RowSettings();
					oTableRowSettings.setNavigated(true);
					oTableRowSettings.setHighlight("Error");
					that.oTable.setRowSettings(oTableRowSettings);
					await nextUIUpdate();

					let oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Fixed value for navigated");
					assert.equal(oSettings.getHighlight(), "Error", "Fixed value for highlight");

					// Set calculated values for settings
					oTableRowSettings = new RowSettings();
					oTableRowSettings.bindProperty("navigated", {path: 'description', type: Boolean, formatter: formatNavigated});
					oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
					that.oTable.setRowSettings(oTableRowSettings);
					await nextUIUpdate();

					oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Calculated value for navigated 1");
					assert.equal(oSettings.getHighlight(), "Warning", "Calculated value for highlight 1");

					oSettings = that.oTable._oTable.getRows()[1].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), false, "Calculated value for navigated 2");
					assert.equal(oSettings.getHighlight(), "Information", "Calculated value for highlight 2");

					resolve();
				});
			});
		});
	});

	QUnit.test("GridTable with settings in XML", function(assert) {
		const that = this;

		return createView("GridTableType", "navigated='true' highlight='Warning'").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			return that.oTable.initialized();
		}).then(function() {
			return new Promise(function(resolve) {
				that.oTable._oTable.attachEventOnce("rowsUpdated", async function() {
					// Check default values for settings
					assert.equal(that.oTable._oTable.getBinding("rows").getLength(), 2, "The table contains 2 rows");
					assert.ok(that.oTable.getRowSettings() != null, "Row settings defined");

					let oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Navigated is true from XML view");
					assert.equal(oSettings.getHighlight(), "Warning", "Highlight is Warning from XML view");
					assert.equal(oSettings.getHighlightText(), "", "No highlight text by default");

					// Set calculated values for settings
					const oTableRowSettings = new RowSettings();
					oTableRowSettings.bindProperty("navigated", {path: 'description', type: Boolean, formatter: formatNavigated});
					oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
					that.oTable.setRowSettings(oTableRowSettings);
					await nextUIUpdate();

					oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Calculated value for navigated 1");
					assert.equal(oSettings.getHighlight(), "Warning", "Calculated value for highlight 1");

					oSettings = that.oTable._oTable.getRows()[1].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), false, "Calculated value for navigated 2");
					assert.equal(oSettings.getHighlight(), "Information", "Calculated value for highlight 2");

					resolve();
				});
			});
		});
	});

	QUnit.test("ResponsiveTable without settings", function(assert) {
		const that = this;

		return createView("ResponsiveTableType").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			return that.oTable.initialized();
		}).then(async function() {
			// Check default values for settings
			assert.equal(that.oTable._oTable.getItems().length, 2, "The table contains 2 rows");
			assert.equal(that.oTable.getRowSettings(), null, "No row settings defined");

			let oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), false, "Navigated is false by default");
			assert.equal(oItem.getHighlight(), "None", "No highlight by default");
			assert.equal(oItem.getHighlightText(), "", "No highlight text by default");

			// Set fixed bound values for settings
			let oTableRowSettings = new RowSettings();
			oTableRowSettings.setNavigated(true);
			oTableRowSettings.setHighlight("Error");
			that.oTable.setRowSettings(oTableRowSettings);
			await nextUIUpdate();

			oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), true, "Fixed value for navigated");
			assert.equal(oItem.getHighlight(), "Error", "Fixed value for highlight");

			// Set calculated values for settings
			oTableRowSettings = new RowSettings();
			oTableRowSettings.bindProperty("navigated", {path: 'description', type: Boolean, formatter: formatNavigated});
			oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
			that.oTable.setRowSettings(oTableRowSettings);
			await nextUIUpdate();

			oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), true, "Calculated value for navigated 1");
			assert.equal(oItem.getHighlight(), "Warning", "Calculated value for highlight 1");

			oItem = that.oTable._oTable.getItems()[1];
			assert.equal(oItem.getNavigated(), false, "Calculated value for navigated 2");
			assert.equal(oItem.getHighlight(), "Information", "Calculated value for highlight 2");
		});
	});

	QUnit.test("ResponsiveTable with settings in XML", function(assert) {
		const that = this;

		return createView("ResponsiveTableType", "navigated='true' highlight='Warning'").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			return that.oTable.initialized();
		}).then(async function() {
			// Check default values for settings
			assert.equal(that.oTable._oTable.getItems().length, 2, "The table contains 2 rows");
			assert.ok(that.oTable.getRowSettings() != null, "Row settings defined");

			let oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), true, "Navigated is true from XML view");
			assert.equal(oItem.getHighlight(), "Warning", "Highlight is Warning from XML view");
			assert.equal(oItem.getHighlightText(), "", "No highlight text by default");

			 // Set calculated values for settings
			const oTableRowSettings = new RowSettings();
			oTableRowSettings.bindProperty("navigated", {path: 'description', type: Boolean, formatter: formatNavigated});
			oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
			that.oTable.setRowSettings(oTableRowSettings);
			await nextUIUpdate();

			oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), true, "Calculated value for navigated 1");
			assert.equal(oItem.getHighlight(), "Warning", "Calculated value for highlight 1");

			oItem = that.oTable._oTable.getItems()[1];
			assert.equal(oItem.getNavigated(), false, "Calculated value for navigated 2");
			assert.equal(oItem.getHighlight(), "Information", "Calculated value for highlight 2");
		});
	});
});