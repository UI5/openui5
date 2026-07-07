/*global QUnit */

sap.ui.define([
	"sap/m/StandardTreeItem",
	"sap/m/Tree",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/utils/nextUIUpdate"
], function(StandardTreeItem, Tree, MockServer, ODataModelV2, createAndAppendDiv, nextUIUpdate) {
	"use strict";

	createAndAppendDiv("content").style.height = "100%";

	function waitForItems(oTree, iExpectedCount, iTimeout) {
		iTimeout = iTimeout || 5000;
		return new Promise(function(resolve, reject) {
			if (oTree.getItems().length === iExpectedCount) {
				resolve();
				return;
			}
			var timeout = setTimeout(function() {
				oTree.detachUpdateFinished(handler);
				reject(new Error("Timeout: expected " + iExpectedCount + " items, got " + oTree.getItems().length));
			}, iTimeout);

			function handler() {
				if (oTree.getItems().length === iExpectedCount) {
					clearTimeout(timeout);
					oTree.detachUpdateFinished(handler);
					resolve();
				}
			}
			oTree.attachUpdateFinished(handler);
		});
	}

	QUnit.module("initial check", {
		beforeEach: async function() {
			const sMetaDataURI = "test-resources/sap/m/mockdata/";

			MockServer.config({
				autoRespond : true,
				autoRespondAfter : 1000
			});

			const oMockServer = new MockServer({
				rootUri : "/odataFake/"
			});
			this.oMockServer = oMockServer;

			this.oMockServer.simulate(sMetaDataURI + "treemetadata.xml", sMetaDataURI);
			this.oMockServer.start();

			const oTemplate = new StandardTreeItem({
				title: "{odata>Description}"
			});

			const oTree = new Tree();

			const oModel = new ODataModelV2("/odataFake/", { useBatch:false });
			oTree.setModel(oModel, "odata");

			oTree.bindItems({
				path: "odata>/Nodes",
				template: oTemplate,
				parameters: {
					countMode: 'Inline'
				}
			});

			oTree.placeAt("content");
			await nextUIUpdate();

			this.oTree = oTree;
		},

		afterEach: function(){
			this.oTree.destroy();
			this.oMockServer.stop();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("initial", async function(assert) {
		const oTree = this.oTree;

		await waitForItems(oTree, 3);

		assert.equal(oTree.getItems().length, 3, "the initial loading is done.");
	});

	QUnit.test("expand", async function(assert) {
		const oTree = this.oTree;

		await waitForItems(oTree, 3);

		const $expander = oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander");
		assert.ok($expander.length, "expander is rendered");

		$expander.trigger("click");

		await waitForItems(oTree, 5, 10000); // Apply enhanced timeout for this test, as the build voters are slow and the expand operation takes a while to complete

		assert.equal(oTree.getItems().length, 5, "expanding is done.");
	});

	QUnit.test("collapse", async function(assert) {
		const oTree = this.oTree;

		await waitForItems(oTree, 3);

		oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander").trigger("click");

		await waitForItems(oTree, 5);

		oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander").trigger("click");

		await waitForItems(oTree, 3);

		assert.equal(oTree.getItems().length, 3, "collapsing is done.");
	});

	QUnit.test("expand/collapse multiple nodes", async function(assert) {
		const oTree = this.oTree;

		await waitForItems(oTree, 3);

		oTree.expand([0,1]);

		await waitForItems(oTree, 8);

		assert.equal(oTree.getItems().length, 8, "expanding multiple nodes is done.");

		oTree.collapse([0,3]);

		await waitForItems(oTree, 3);

		assert.equal(oTree.getItems().length, 3, "collapsing multiple nodes is done.");
	});
});