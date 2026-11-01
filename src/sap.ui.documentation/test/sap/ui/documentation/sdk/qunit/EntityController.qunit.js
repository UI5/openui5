/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/Entity.controller",
	"sap/ui/documentation/sdk/controller/util/EntityInfo",
	"sap/ui/core/EventBus"
], function (EntityController, EntityInfo, EventBus) {
	"use strict";

	function filterResourceResolvedPublishes(spy) {
		return spy.args.filter(function (a) {
			return a[0] === "usageTracking" && a[1] === "resourceResolved";
		});
	}

	function makeControlsData(sId) {
		return {
			entities: sId ? [{ id: sId, library: "sap.m", samples: [], description: "" }] : [],
			controls: []
		};
	}

	QUnit.module("Entity.controller — reportsResourceResolved", {
		beforeEach: function () {
			this.oController = new EntityController();
		},
		afterEach: function () {
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("reportsResourceResolved is true", function (assert) {
		assert.strictEqual(this.oController.reportsResourceResolved, true,
			"Entity.controller declares reportsResourceResolved: true");
	});

	QUnit.module("Entity.controller — _loadSample publishes resourceResolved", {
		beforeEach: function () {
			this.oPublishSpy = sinon.spy(EventBus.getInstance(), "publish");
			this.oController = new EntityController();

			// minimal stubs so _loadSample can run without a real view
			var oFakeModel = {
				getResourceBundle: function () { return Promise.resolve({}); },
				setData: function () {},
				getData: function () { return { show: { samples: true }, name: "sap.m.Button" }; },
				getProperty: function () { return "sap.m.Button"; }
			};
			this.oController.getView = function () {
				return {
					getModel: function (sName) {
						if (!sName) { return oFakeModel; }
						return { getResourceBundle: function () { return Promise.resolve({}); } };
					}
				};
			};
			this.oController.getModel = function () { return oFakeModel; };
			this.oController._oObjectPage = { setBusy: function () {} };
			this.oController._switchPageTab = function () {};
			this.oController.appendPageTitle = function () {};
			this.oController.getAPIReferenceCheckPromise = function () { return Promise.resolve(false); };
			this.oController.onRouteNotFound = sinon.spy();
			this.oController._getViewData = function () {
				return { name: "sap.m.Button", show: { samples: true }, count: { samples: 1 }, entity: {} };
			};
			this.oController._buildHeaderLayout = function () {};
		},
		afterEach: function () {
			this.oPublishSpy.restore();
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("single visit to a valid entity — resourceResolved published once", function (assert) {
		var done = assert.async();
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;
		var oGetDocStub = sinon.stub(EntityInfo, "getEntityDocuAsync").resolves({ doc: "text", values: [] });

		oController._sNewId = "sap.m.Button";
		oController._sId = undefined;

		oController._loadSample(makeControlsData("sap.m.Button")).then(function () {
			assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 1,
				"resourceResolved published exactly once after successful entity load");
			oGetDocStub.restore();
			done();
		});
	});

	QUnit.test("two visits to the same entity — resourceResolved published on both", function (assert) {
		var done = assert.async();
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;
		var oGetDocStub = sinon.stub(EntityInfo, "getEntityDocuAsync").resolves({ doc: "text", values: [] });

		oController._sNewId = "sap.m.Button";
		oController._sId = undefined;

		oController._loadSample(makeControlsData("sap.m.Button")).then(function () {
			// Simulate revisit: _sId is now set, _sNewId stays the same
			oController._sNewId = "sap.m.Button";
			return oController._loadSample(makeControlsData("sap.m.Button"));
		}).then(function () {
			assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 2,
				"resourceResolved published on first load and again on revisit to the same entity");
			oGetDocStub.restore();
			done();
		});
	});

	QUnit.test("visit to a non-existent entity — no resourceResolved published", function (assert) {
		var done = assert.async();
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;
		// No entity in controls data, and server returns null
		var oGetDocStub = sinon.stub(EntityInfo, "getEntityDocuAsync").resolves(null);

		oController._sNewId = "non.Existent.Entity";
		oController._sId = undefined;

		oController._loadSample(makeControlsData(null /* empty entity list */)).then(function () {
			assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 0,
				"resourceResolved not published when entity is not found");
			assert.ok(oController.onRouteNotFound.calledOnce,
				"onRouteNotFound called for non-existent entity");
			oGetDocStub.restore();
			done();
		});
	});

});
