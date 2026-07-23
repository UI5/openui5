/*global QUnit, sinon */

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
		await nextUIUpdate(); // Ensure rendering is complete before DOM interaction

		const $expander = oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander");
		assert.ok($expander.length, "expander is rendered");

		assert.ok(oTree._oProxy, "TreeBindingProxy is available");
		sinon.spy(oTree._oProxy, "expand");

		$expander.trigger("click");

		assert.ok(oTree._oProxy.expand.calledOnce, "expand method is called on TreeBindingProxy");

		await waitForItems(oTree, 5, 10000);

		assert.equal(oTree.getItems().length, 5, "expanding is done.");

		oTree._oProxy.expand.restore();
	});

	QUnit.test("collapse", async function(assert) {
		const oTree = this.oTree;

		await waitForItems(oTree, 3);
		await nextUIUpdate(); // Ensure rendering is complete before DOM interaction

		assert.ok(oTree._oProxy, "TreeBindingProxy is available");
		sinon.spy(oTree._oProxy, "expand");

		oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander").trigger("click");

		assert.ok(oTree._oProxy.expand.calledOnce, "expand method is called on TreeBindingProxy");

		await waitForItems(oTree, 5);
		await nextUIUpdate(); // Ensure rendering is complete before DOM interaction

		oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander").trigger("click");

		await waitForItems(oTree, 3);

		assert.equal(oTree.getItems().length, 3, "collapsing is done.");

		oTree._oProxy.expand.restore();
	});

	QUnit.test("expand/collapse multiple nodes", async function(assert) {
		const oTree = this.oTree;

		await waitForItems(oTree, 3);
		await nextUIUpdate(); // Ensure rendering is complete before DOM interaction

		oTree.expand([0,1]);

		await waitForItems(oTree, 8);

		assert.equal(oTree.getItems().length, 8, "expanding multiple nodes is done.");

		oTree.collapse([0,3]);

		await waitForItems(oTree, 3);

		assert.equal(oTree.getItems().length, 3, "collapsing multiple nodes is done.");
	});
});