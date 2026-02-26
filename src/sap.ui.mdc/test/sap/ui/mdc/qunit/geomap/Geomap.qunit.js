/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/Geomap",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/library",
	"sap/m/Button",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/core/Theming",
	"sap/base/util/Deferred"
],
	function (
		Geomap,
		UIComponent,
		ComponentContainer,
		CoreLibrary,
		Button,
		nextUIUpdate,
		Theming,
		Deferred
	) {
		"use strict";

		const sDelegatePath = "test-resources/sap/ui/mdc/delegates/GeomapDelegate";

		QUnit.module("sap.ui.mdc.Geomap: Simple Properties", {

			beforeEach: async function () {
				const TestComponent = UIComponent.extend("test", {
					metadata: {
						manifest: {
							"sap.app": {
								"id": "",
								"type": "application"
							}
						}
					},
					createContent: function () {
						return new Geomap({
							delegate: {
								name: sDelegatePath,
								payload: {
									collectionPath: "/testPath"
								}
							},
							propertyInfo: [{ key: "name1", label: "name1", dataType: "String" }, { key: "name2", label: "name2", dataType: "String" }]
						});
					}
				});
				this.oUiComponent = new TestComponent();
				this.oUiComponentContainer = new ComponentContainer({
					component: this.oUiComponent,
					async: false
				});
				this.oMDCGeomap = this.oUiComponent.getRootControl();

				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oUiComponentContainer.destroy();
				this.oUiComponent.destroy();
			}

		});

		QUnit.test("_initMap", function (assert) {
			const done = assert.async();
            // Arrange
			const oMockDelegate = { createInitialGeomapContent: function() {}, _createContentfromPropertyInfos: function () { return Promise.resolve(); }, initializeGeomap: function () { this.createInitialGeomapContent(); return Promise.resolve(); }};
			const _getControlDelegateStub = sinon.stub(this.oMDCGeomap, "getControlDelegate").returns(oMockDelegate);
			this.oMDCGeomap._propagatePropertiesToInnerGeomap = function () { }; //Mock this as it requires an inner geomap (which we don't want to test in this case)

			const oPropagateSpy = sinon.spy(this.oMDCGeomap, "_propagatePropertiesToInnerGeomap");
			const oInitializeGeomapSpy = sinon.spy(this.oMDCGeomap.getControlDelegate(), "initializeGeomap");
			const oCreateInitialContentSpy = sinon.spy(this.oMDCGeomap.getControlDelegate(), "createInitialGeomapContent");

            this.oMDCGeomap._initMap();
            setTimeout(() => {
                // Assert
                assert.ok(oInitializeGeomapSpy.called, "initializeGeomap was called.");
                assert.ok(oCreateInitialContentSpy.called, "createInitialGeomapContent was called.");
                assert.ok(this.oMDCGeomap._oObserver, "_oObserver was created.");
                assert.equal(this.oMDCGeomap._bGeomapReady, true,"Geomap is ready.");

                // Cleanup
                _getControlDelegateStub.restore();
                oPropagateSpy.restore();
                oInitializeGeomapSpy.restore();
                oCreateInitialContentSpy.restore();
                done();
            }, 0);
		});

		QUnit.test("_createContentFromPropertyInfos", function (assert) {
			const done = assert.async();
			const oMockDelegate = { createInitialGeomapContent: function() {}, _createContentfromPropertyInfos: function () { return Promise.resolve(); }, initializeGeomap: function () { this.createInitialGeomapContent(); return Promise.resolve(); }};
			const _getControlDelegateStub = sinon.stub(this.oMDCGeomap, "getControlDelegate").returns(oMockDelegate);
			this.oMDCGeomap._propagatePropertiesToInnerGeomap = function () { }; //Mock this as it requires an inner geomap (which we don't want to test in this case)

			const oPropagateSpy = sinon.spy(this.oMDCGeomap, "_propagatePropertiesToInnerGeomap");
			const oCreateInitialContentSpy = sinon.spy(this.oMDCGeomap.getControlDelegate(), "createInitialGeomapContent");

			this.oMDCGeomap.getControlDelegate()._createContentfromPropertyInfos();
            this.oMDCGeomap.getControlDelegate().initializeGeomap().then(function () {
                setTimeout(function() { //as order of promise execution is not stable

                    assert.ok(oCreateInitialContentSpy.called, "createInitialGeomapContent was called.");
                    assert.notOk(oPropagateSpy.calledTwice, "Function was not called twice.");

                    _getControlDelegateStub.restore();
                    oPropagateSpy.restore();
                    oCreateInitialContentSpy.restore();
                    done();

                }, 0);
            });
		});


		QUnit.module("sap.ui.mdc.Geomap: Simple Properties", {

			beforeEach: async function () {
				const TestComponent = UIComponent.extend("test", {
					metadata: {
						manifest: {
							"sap.app": {
								"id": "",
								"type": "application"
							}
						}
					},
					createContent: function () {
						return new Geomap({
							delegate: {
								name: sDelegatePath,
								payload: {
									collectionPath: "/testPath"
								}
							},
							propertyInfo: [{ key: "name1", label: "name1", dataType: "String" }, { key: "name2", label: "name2", dataType: "String" }]
						});
					}
				});
				this.oUiComponent = new TestComponent();
				this.oUiComponentContainer = new ComponentContainer({
					component: this.oUiComponent,
					async: false
				});
				this.oMDCGeomap = this.oUiComponent.getRootControl();

				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oUiComponentContainer.destroy();
				this.oUiComponent.destroy();
			}

		});

		QUnit.test("Test exists", function (assert) {
			assert.ok(true);
		});


		QUnit.test("Instantiate", function (assert) {
			assert.ok(this.oMDCGeomap);
			assert.ok(this.oMDCGeomap.isA("sap.ui.mdc.IxState"));

		});

		QUnit.test("Init", function (assert) {
			const done = assert.async();

			this.oMDCGeomap.initialized().then(function () {
				assert.ok(this.oMDCGeomap, "The geomap is created");

				done();
			}.bind(this));

		});

		QUnit.test("_loadDelegate", function (assert) {
			const done = assert.async();

			this.oMDCGeomap._loadDelegate().then(function (oDelegate) {
				assert.ok(oDelegate, "Delegate loaded");
				done();
			});
		});

		QUnit.test("_getInnerGeomap", function (assert) {
			const done = assert.async();

			this.oMDCGeomap.initialized().then(function () {
				const delegateSpy = sinon.spy(this.oMDCGeomap, "getAggregation");

				this.oMDCGeomap._getInnerGeomap();
				assert.ok(delegateSpy.calledOnce, "getAggregation was called on innerGeomap");

				done();
			}.bind(this));
		});

		QUnit.test("zoomIn", function (assert) {
			const done = assert.async();

			this.oMDCGeomap.initialized().then(function () {
				const zoomInSpy = sinon.spy(this.oMDCGeomap.getControlDelegate(), "zoomIn");

				this.oMDCGeomap.zoomIn();
				assert.ok(zoomInSpy.calledOnce, "Zoom in was called on delegate");
				done();
			}.bind(this));
		});

		QUnit.test("zoomOut", function (assert) {
			const done = assert.async();

			this.oMDCGeomap.initialized().then(function () {
				const zoomOutSpy = sinon.spy(this.oMDCGeomap.getControlDelegate(), "zoomOut");

				this.oMDCGeomap.zoomOut();
				assert.ok(zoomOutSpy.calledOnce, "Zoom out was called on delegate");
				done();
			}.bind(this));
		});
	});
