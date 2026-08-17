/*global QUnit */

sap.ui.define([
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/util/MockServer",
	"sap/ui/table/Table",
	"sap/ui/model/odata/v2/ODataModel"
], function(TableUtils, MockServer, Table, ODataModel) {
	"use strict";

	const sServiceURI = "/service/";
	const iResponseTime = 10;

	function createODataModel(sURL) {
		sURL = sURL == null ? sServiceURI : sURL;
		return new ODataModel(sURL, {
			json: true
		});
	}

	function startMockServer() {
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: iResponseTime
		});

		const oMockServer = new MockServer({
			rootUri: sServiceURI
		});

		const sURLPrefix = sap.ui.require.toUrl("sap/ui/table/qunit");
		oMockServer.simulate(sURLPrefix + "/mockdata/metadata.xml", sURLPrefix + "/mockdata/");
		oMockServer.start();
		return oMockServer;
	}

	QUnit.module("Events", {
		beforeEach: function() {
			this.oTable = new Table();
			this.oMockServer = startMockServer();
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("metadataLoaded", async function(assert) {
		const oTable = this.oTable;

		assert.expect(4);

		try {
			await TableUtils.Binding.metadataLoaded(oTable);
		} catch (oError) {
			assert.ok(true, "No binding, no model: MetadataLoaded promise was rejected");
		}

		oTable.bindRows({path: "test"});
		try {
			await TableUtils.Binding.metadataLoaded(oTable);
		} catch (oError) {
			assert.ok(true, "No model: MetadataLoaded promise was rejected");
		}

		oTable.setModel(createODataModel("/top/secret/service"));
		TableUtils.Binding.metadataLoaded(oTable).then(() => {
			assert.ok(false, "No metadata: MetadataLoaded promise should be pending, but was resolved");
		}).catch(() => {
			assert.ok(false, "No metadata: MetadataLoaded promise should be pending, but was rejected");
		});
		await new Promise((resolve) => {
			window.setTimeout(() => {
				assert.ok(true, "No metadata: MetadataLoaded promise is pending");
				resolve();
			}, iResponseTime + 10);
		});

		oTable.setModel(createODataModel(sServiceURI));
		await TableUtils.Binding.metadataLoaded(oTable);
		assert.ok(true, "Binding, model and metadata available: MetadataLoaded promise was resolved");
	});
});