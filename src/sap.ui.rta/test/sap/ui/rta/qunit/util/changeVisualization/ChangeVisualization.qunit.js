/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_merge",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/rta/util/changeVisualization/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry",
	"sap/ui/rta/util/changeVisualization/ChangeStates",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	merge,
	Button,
	HBox,
	VBox,
	JsControlTreeModifier,
	Element,
	Lib,
	DesignTime,
	DesignTimeMetadata,
	Overlay,
	OverlayRegistry,
	KeyCodes,
	ChangesUtils,
	States,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	FlUtils,
	nextUIUpdate,
	ChangeCategories,
	ChangeIndicatorRegistry,
	ChangeStates,
	ChangeVisualization,
	ChangeVisualizationUtils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	QUnit.config.fixture = null;
	const oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "appComponent");

	function createMockChange(sId, sCommandName, sSelectorId, oAdditionalProperties, sState) {
		const oChange = RtaQunitUtils.createUIChange(merge({
			selector: JsControlTreeModifier.getSelector(sSelectorId, oAppComponent),
			fileName: sId,
			support: {
				command: sCommandName
			}
		}, oAdditionalProperties));
		oChange.setState(sState);
		if (oChange.markFinished) {
			oChange.markFinished();
		}
		return oChange;
	}

	function prepareChanges(aMockChanges, oChangeHandler) {
		sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves(aMockChanges || []);
		sandbox.stub(ChangesUtils, "getControlIfTemplateAffected")
		.callsFake(function(oChange, oControl) {
			return {
				control: oControl
			};
		});
		const oMergedChangeHandler = {
			getChangeVisualizationInfo() { },
			...oChangeHandler
		};
		sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves(oMergedChangeHandler);
	}

	async function setupTest(fnCallback, oRootElement) {
		this.oChangeVisualization = new ChangeVisualization({
			rootControlId: "MockComponent"
		});
		this.oContainer = oRootElement || new VBox("container", {
			items: [
				new Button("button1", {
					text: "First button"
				}),
				new Button(oAppComponent.createId("button2"), {
					text: "Second button"
				}),
				new Button("button3", {
					text: "Third button"
				})
			]
		});
		this.oContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.oDesignTime = new DesignTime({
			rootElements: [this.oContainer]
		});

		this.oChangeVisualization.setDesignTime(this.oDesignTime);

		this.oDesignTime.attachEventOnce("synced", function() {
			fnCallback();
		});
	}

	function cleanupTest() {
		this.oDesignTime.destroy();
		this.oChangeVisualization.destroy();
		this.oContainer.destroy();
		sandbox.restore();
	}

	function createContextMenuPluginStub() {
		return {
			oContextMenuControl: { close: sandbox.stub() },
			setBusy: sandbox.stub(),
			open: sandbox.stub()
		};
	}

	function createContextMenuRect() {
		return { top: 100, left: 50, right: 250, bottom: 600, height: 500, width: 200 };
	}

	QUnit.module("Initialization and border classes", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when initialize() is called with registered changes", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1"),
				createMockChange("testChange2", "move", oAppComponent.createId("button2"))
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				const oOverlay2 = OverlayRegistry.getOverlay(oAppComponent.createId("button2"));
				const oOverlay3 = OverlayRegistry.getOverlay("button3");

				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the overlay for button1 has the dashed border class"
				);
				assert.ok(
					oOverlay2.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the overlay for button2 has the dashed border class"
				);
				assert.notOk(
					oOverlay3.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the overlay for button3 does not have the dashed border class"
				);
				fnDone();
			});
		});

		QUnit.test("when initialize() is called with no changes", function(assert) {
			const fnDone = assert.async();
			prepareChanges([]);

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				const oOverlay2 = OverlayRegistry.getOverlay(oAppComponent.createId("button2"));

				assert.notOk(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then button1 overlay does not have the dashed border class"
				);
				assert.notOk(
					oOverlay2.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then button2 overlay does not have the dashed border class"
				);
				fnDone();
			});
		});

		QUnit.test("setDesignTime attaches and detaches the elementOverlayCreated listener", function(assert) {
			const fnDone = assert.async();
			prepareChanges([]);

			this.oChangeVisualization.setDesignTime(this.oDesignTime);
			assert.strictEqual(
				this.oChangeVisualization.getDesignTime(), this.oDesignTime,
				"then the DesignTime reference is stored"
			);

			const oAttachSpy = sandbox.spy(this.oDesignTime, "attachEvent");
			const oDetachSpy = sandbox.spy(this.oDesignTime, "detachEvent");

			this.oChangeVisualization.initialize().then(function() {
				assert.ok(
					oAttachSpy.calledWith("elementOverlayCreated"),
					"then the listener is attached during initialize()"
				);
				assert.strictEqual(
					typeof this.oChangeVisualization._fnOverlayCreatedHandler, "function",
					"then the handler reference is stored for later cleanup"
				);

				this.oChangeVisualization._detachOverlayListeners();

				assert.ok(
					oDetachSpy.calledWith("elementOverlayCreated"),
					"then the listener is detached"
				);
				assert.strictEqual(
					this.oChangeVisualization._fnOverlayCreatedHandler, null,
					"then the handler reference is cleared"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("_onElementOverlayCreated decorates a late-arriving overlay with registered changes", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay = OverlayRegistry.getOverlay("button1");
				oOverlay.removeStyleClass("sapUiRtaOverlayWithChanges");

				this.oChangeVisualization._onElementOverlayCreated({
					getParameter: () => oOverlay
				});

				assert.ok(
					oOverlay.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the overlay is decorated when the event handler runs"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("_onElementOverlayCreated resolves a previously unresolved change when its overlay arrives", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return { affectedControls: [oChange.getSelector()] };
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				// Simulate the "control absent during initialize" scenario by invalidating its resolution.
				const oRegistry = this.oChangeVisualization._oChangeIndicatorRegistry;
				oRegistry.invalidateResolution("testChange1");

				assert.strictEqual(
					oRegistry.getUnresolvedChangeIds().length, 1,
					"then the change is in the catalog but unresolved"
				);

				const oOverlay = OverlayRegistry.getOverlay("button1");
				this.oChangeVisualization._onElementOverlayCreated({ getParameter: () => oOverlay });

				// _onElementOverlayCreated delegates async work to _resolveAndDecorate; await it directly.
				return this.oChangeVisualization._resolveAndDecorate(["testChange1"]);
			}.bind(this)).then(function() {
				const oRegistry = this.oChangeVisualization._oChangeIndicatorRegistry;
				assert.strictEqual(
					oRegistry.getUnresolvedChangeIds().length, 0,
					"then the change is resolved after the overlay arrives"
				);
				assert.ok(
					OverlayRegistry.getOverlay("button1").hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the overlay is decorated after resolution"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("_onElementOverlayCreated ignores an overlay whose element has no valid selector (unstable Id)", async function(assert) {
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			oOverlay.removeStyleClass("sapUiRtaOverlayWithChanges");

			// Simulate an overlay whose element cannot be resolved to a stable selector.
			sandbox.stub(JsControlTreeModifier, "getSelector").throws(new Error("Control id was generated dynamically"));
			const oResolveSpy = sandbox.spy(this.oChangeVisualization, "_resolveAndDecorate");
			const oBorderSpy = sandbox.spy(this.oChangeVisualization, "_applyBorderToOverlay");

			this.oChangeVisualization._onElementOverlayCreated({
				getParameter: () => oOverlay
			});

			assert.ok(
				oResolveSpy.notCalled,
				"then no unresolved changes are found and resolution is skipped"
			);
			assert.ok(
				oBorderSpy.notCalled,
				"then no border is applied to the overlay since it cannot be resolved"
			);
		});
	});

	QUnit.module("removeBorderClasses", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when removeBorderClasses is called after initialize", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the overlay initially has the dashed border class"
				);

				this.oChangeVisualization.removeBorderClasses();

				assert.notOk(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the overlay no longer has the dashed border class"
				);
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("_applyBorderToOverlay edge cases", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("returns false for an undefined overlay without throwing", function(assert) {
			const fnDone = assert.async();
			prepareChanges([]);

			this.oChangeVisualization.initialize().then(function() {
				const bResult = this.oChangeVisualization._applyBorderToOverlay(undefined);
				assert.strictEqual(bResult, false, "then false is returned for an undefined overlay");
				fnDone();
			}.bind(this));
		});

		QUnit.test("returns false for an overlay flagged as destroyed or having no changes", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay = OverlayRegistry.getOverlay("button1");
				oOverlay.removeStyleClass("sapUiRtaOverlayWithChanges");
				oOverlay.bIsDestroyed = true;

				const bDestroyed = this.oChangeVisualization._applyBorderToOverlay(oOverlay);
				assert.strictEqual(bDestroyed, false, "then false is returned for a destroyed overlay");
				assert.notOk(
					oOverlay.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then no border class is applied to a destroyed overlay"
				);

				oOverlay.bIsDestroyed = false;

				const oOverlay3 = OverlayRegistry.getOverlay("button3");
				const bNoChanges = this.oChangeVisualization._applyBorderToOverlay(oOverlay3);
				assert.strictEqual(bNoChanges, false, "then false is returned when no condition matches");
				assert.notOk(
					oOverlay3.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then no border class is applied when element has no changes"
				);
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("connected elements", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("decorates the connected overlay when applyBorderClasses runs", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.setDesignTime(this.oDesignTime);
			sandbox.stub(this.oDesignTime, "getSelectionManager").returns({
				getConnectedElements: () => ({ button1: oAppComponent.createId("button2") })
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				const oOverlay2 = OverlayRegistry.getOverlay(oAppComponent.createId("button2"));

				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the source overlay is decorated"
				);
				assert.ok(
					oOverlay2.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the connected overlay is also decorated"
				);
				fnDone();
			});
		});

		QUnit.test("returns an empty map from _getConnectedElements when the selection manager has no entries", function(assert) {
			const fnDone = assert.async();
			prepareChanges([]);

			sandbox.stub(this.oDesignTime, "getSelectionManager").returns({
				getConnectedElements: () => null
			});

			this.oChangeVisualization.initialize().then(function() {
				assert.strictEqual(
					this.oChangeVisualization._getConnectedElements(), null,
					"then null is returned when the selection manager yields null"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("_applyBorderToOverlay decorates an element via connected-element lookup in both directions", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.setDesignTime(this.oDesignTime);

			// Check 2: element's connected element has the change (button2 → button1)
			sandbox.stub(this.oDesignTime, "getSelectionManager").returns({
				getConnectedElements: () => ({ [oAppComponent.createId("button2")]: "button1" })
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay2 = OverlayRegistry.getOverlay(oAppComponent.createId("button2"));
				oOverlay2.removeStyleClass("sapUiRtaOverlayWithChanges");

				assert.strictEqual(this.oChangeVisualization._applyBorderToOverlay(oOverlay2), true, "then true is returned for Check 2");
				assert.ok(oOverlay2.hasStyleClass("sapUiRtaOverlayWithChanges"), "then overlay is decorated for Check 2");

				// Check 3: element is targeted by another element with changes (button1 → button2)
				this.oDesignTime.getSelectionManager.restore();
				sandbox.stub(this.oDesignTime, "getSelectionManager").returns({
					getConnectedElements: () => ({ button1: oAppComponent.createId("button2") })
				});
				oOverlay2.removeStyleClass("sapUiRtaOverlayWithChanges");

				assert.strictEqual(this.oChangeVisualization._applyBorderToOverlay(oOverlay2), true, "then true is returned for Check 3");
				assert.ok(oOverlay2.hasStyleClass("sapUiRtaOverlayWithChanges"), "then overlay is decorated for Check 3");
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("refreshBorders", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when refreshBorders is called", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				// Now update the stub to return an additional change
				PersistenceWriteAPI._getUIChanges.resolves([
					createMockChange("testChange1", "rename", "button1"),
					createMockChange("testChange2", "move", oAppComponent.createId("button2"))
				]);

				return this.oChangeVisualization.refreshBorders();
			}.bind(this)).then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				const oOverlay2 = OverlayRegistry.getOverlay(oAppComponent.createId("button2"));

				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then button1 overlay still has the dashed border class"
				);
				assert.ok(
					oOverlay2.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then button2 overlay now has the dashed border class"
				);
				fnDone();
			});
		});

		QUnit.test("when refreshBorders is called a second time, the registry is not reset again", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			const oResetSpy = sandbox.spy(ChangeIndicatorRegistry.prototype, "reset");

			this.oChangeVisualization.initialize().then(function() {
				return this.oChangeVisualization.refreshBorders();
			}.bind(this)).then(function() {
				assert.strictEqual(oResetSpy.callCount, 1, "then the registry was reset only once on initialize");
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then borders are still applied after the second refresh"
				);
				fnDone();
			});
		});

		QUnit.test("when a version is activated, refreshBorders reclassifies draft changes to ALL", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1", {}, States.LifecycleState.PERSISTED)
			], {
				getChangeVisualizationInfo(oChange) {
					return { affectedControls: [oChange.getSelector()] };
				}
			});

			const oRefreshSpy = sandbox.spy(ChangeIndicatorRegistry.prototype, "refreshChangeStates");

			this.oChangeVisualization.initialize().then(function() {
				// Simulate post-activation: catalog entry is DRAFT (draftFilenames listed it),
				// then activate clears draftFilenames and refreshBorders runs.
				const oRegistry = this.oChangeVisualization._oChangeIndicatorRegistry;
				oRegistry._oChangeCatalog.testChange1.changeStates = [ChangeStates.DRAFT];

				const oActivatedModel = { getData: () => ({ draftFilenames: [] }) };
				this.oChangeVisualization.oVersionsModel = oActivatedModel;
				return this.oChangeVisualization.refreshBorders();
			}.bind(this)).then(function() {
				assert.ok(oRefreshSpy.called, "then refreshChangeStates was called during refreshBorders");
				const oRegistry = this.oChangeVisualization._oChangeIndicatorRegistry;
				assert.deepEqual(
					oRegistry.getCatalogEntry("testChange1").changeStates,
					[ChangeStates.ALL],
					"then the change is reclassified to ALL after activation"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("removes previously registered changes that no longer exist", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1"),
				createMockChange("testChange2", "move", oAppComponent.createId("button2"))
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				const oOverlay2 = OverlayRegistry.getOverlay(oAppComponent.createId("button2"));
				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then button1 has the border class initially"
				);
				assert.ok(
					oOverlay2.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then button2 has the border class initially"
				);

				// Now only return one change — the other should be removed
				PersistenceWriteAPI._getUIChanges.resolves([
					createMockChange("testChange1", "rename", "button1")
				]);

				return this.oChangeVisualization.refreshBorders();
			}.bind(this)).then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				const oOverlay2 = OverlayRegistry.getOverlay(oAppComponent.createId("button2"));
				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then button1 still has the border class"
				);
				assert.notOk(
					oOverlay2.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then button2 no longer has the border class"
				);
				fnDone();
			});
		});

		QUnit.test("resolves without crashing when no component is available", function(assert) {
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			return this.oChangeVisualization.initialize().then(function() {
				assert.strictEqual(
					this.oChangeVisualization._oChangeIndicatorRegistry.getRegisteredChangeIds().length,
					1,
					"then a change is registered after the initial run"
				);

				sandbox.stub(ChangeVisualization.prototype, "_getComponent").returns(undefined);

				const pUpdate = this.oChangeVisualization.refreshBorders();
				assert.ok(pUpdate && typeof pUpdate.then === "function", "then a thenable is returned");

				return pUpdate.then(function() {
					assert.strictEqual(
						this.oChangeVisualization._oChangeIndicatorRegistry.getRegisteredChangeIds().length,
						1,
						"then the existing registry entries are preserved"
					);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("hasChangesForElement", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("returns true for elements with changes and false for elements without", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				assert.ok(
					this.oChangeVisualization.hasChangesForElement("button1"),
					"then hasChangesForElement returns true for button1"
				);
				assert.notOk(
					this.oChangeVisualization.hasChangesForElement("button3"),
					"then hasChangesForElement returns false for button3"
				);
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("findOverlayWithChanges", {
		beforeEach(assert) {
			const oContainer = new VBox("parentContainer", {
				items: [
					new VBox("childContainer", {
						items: [
							new Button("nestedButton", {
								text: "Nested button"
							})
						]
					})
				]
			});

			const fnDone = assert.async();
			setupTest.call(this, fnDone, oContainer);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when the child overlay has no changes but a parent overlay does", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "parentContainer")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oChildOverlay = OverlayRegistry.getOverlay("nestedButton");
				const oParentOverlay = OverlayRegistry.getOverlay("parentContainer");
				const oChildContainerOverlay = OverlayRegistry.getOverlay("childContainer");

				// Stub geometries so child / parents match (within 2px) and the walk does not early-exit
				const oSharedGeometry = {
					position: { top: 100, left: 100 },
					size: { height: 50, width: 100 }
				};
				sandbox.stub(oChildOverlay, "getGeometry").returns(oSharedGeometry);
				sandbox.stub(oChildContainerOverlay, "getGeometry").returns(oSharedGeometry);
				sandbox.stub(oParentOverlay, "getGeometry").returns(oSharedGeometry);

				const oFoundOverlay = this.oChangeVisualization.findOverlayWithChanges(oChildOverlay);
				assert.strictEqual(
					oFoundOverlay, oParentOverlay,
					"then the parent overlay with changes is returned"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the overlay itself has changes", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "parentContainer")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay = OverlayRegistry.getOverlay("parentContainer");

				const oFoundOverlay = this.oChangeVisualization.findOverlayWithChanges(oOverlay);
				assert.strictEqual(
					oFoundOverlay, oOverlay,
					"then the same overlay is returned"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("when no overlay in the hierarchy has changes", function(assert) {
			const fnDone = assert.async();
			prepareChanges([]);

			this.oChangeVisualization.initialize().then(function() {
				const oChildOverlay = OverlayRegistry.getOverlay("nestedButton");

				const oFoundOverlay = this.oChangeVisualization.findOverlayWithChanges(oChildOverlay);
				assert.strictEqual(
					oFoundOverlay, undefined,
					"then undefined is returned"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("when a parent overlay has changes but its geometry differs from the child", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "parentContainer")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oChildOverlay = OverlayRegistry.getOverlay("nestedButton");
				const oParentOverlay = OverlayRegistry.getOverlay("parentContainer");

				// Stub geometries so the child differs from any parent by >= 2px
				sandbox.stub(oChildOverlay, "getGeometry").returns({
					position: { top: 0, left: 0 },
					size: { height: 20, width: 100 }
				});
				const oChildContainerOverlay = OverlayRegistry.getOverlay("childContainer");
				sandbox.stub(oChildContainerOverlay, "getGeometry").returns({
					position: { top: 100, left: 100 },
					size: { height: 200, width: 100 }
				});
				sandbox.stub(oParentOverlay, "getGeometry").returns({
					position: { top: 200, left: 200 },
					size: { height: 400, width: 100 }
				});

				const oFoundOverlay = this.oChangeVisualization.findOverlayWithChanges(oChildOverlay);
				assert.strictEqual(
					oFoundOverlay, undefined,
					"then undefined is returned because geometry differs significantly"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("when a parent overlay has no geometry the walk stops and returns undefined", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "parentContainer")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oChildOverlay = OverlayRegistry.getOverlay("nestedButton");
				const oChildContainerOverlay = OverlayRegistry.getOverlay("childContainer");

				sandbox.stub(oChildOverlay, "getGeometry").returns({
					position: { top: 0, left: 0 },
					size: { height: 20, width: 100 }
				});
				sandbox.stub(oChildContainerOverlay, "getGeometry").returns(undefined);

				const oFoundOverlay = this.oChangeVisualization.findOverlayWithChanges(oChildOverlay);
				assert.strictEqual(
					oFoundOverlay, undefined,
					"then the walk breaks on a parent with missing geometry"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the overlay hierarchy has no changes but a connected element does", async function(assert) {
			prepareChanges([]);

			await this.oChangeVisualization.initialize();
			const oChildOverlay = OverlayRegistry.getOverlay("nestedButton");

			// Stop the parent walk at the nested button (no changes there),
			// so only the connected-element fallback can find a match.
			sandbox.stub(oChildOverlay, "getParentElementOverlay").returns(null);
			sandbox.stub(this.oChangeVisualization, "hasChangesForElement")
			.callsFake((sElementId) => sElementId === "childContainer");
			sandbox.stub(this.oChangeVisualization, "_getConnectedElements").returns({
				nestedButton: "childContainer"
			});

			const oFoundOverlay = this.oChangeVisualization.findOverlayWithChanges(oChildOverlay);
			assert.strictEqual(
				oFoundOverlay, OverlayRegistry.getOverlay("childContainer"),
				"then the overlay of the connected element with changes is returned"
			);
		});
	});

	QUnit.module("getChangesForOverlay", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("returns formatted change data for overlay with changes", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1"),
				createMockChange("testChange2", "move", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay = OverlayRegistry.getOverlay("button1");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				assert.strictEqual(aChanges.length, 2, "then two changes are returned");
				assert.ok(aChanges[0].id, "then the first change has an id");
				assert.ok(aChanges[0].description, "then the first change has a description");
				assert.ok(aChanges[0].icon, "then the first change has an icon");
				assert.ok(aChanges[0].user !== undefined, "then the first change has a user field");
				assert.ok(aChanges[0].relativeDate, "then the first change has a relativeDate");
				assert.ok(aChanges[0].fullDate, "then the first change has a fullDate");
				fnDone();
			}.bind(this));
		});

		QUnit.test("returns empty array for overlay without changes", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay = OverlayRegistry.getOverlay("button3");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				assert.strictEqual(aChanges.length, 0, "then no changes are returned");
				fnDone();
			}.bind(this));
		});

		QUnit.test("formats description via resource bundle or descriptionPayload", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "unknownCommand", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				this.oChangeVisualization._bShowAllChanges = true;
				const oOverlay = OverlayRegistry.getOverlay("button1");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				assert.strictEqual(aChanges.length, 1, "then one change is returned");
				assert.ok(aChanges[0].description, "then the change has a description from resource bundle");
				fnDone();
			}.bind(this));
		});

		QUnit.test("formats description for settings command with custom description in payload", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "settings", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()],
						descriptionPayload: {
							description: "Custom settings description"
						}
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				this.oChangeVisualization._bShowAllChanges = true;
				const oOverlay = OverlayRegistry.getOverlay("button1");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				assert.strictEqual(aChanges.length, 1, "then one change is returned");
				assert.strictEqual(
					aChanges[0].description, "Custom settings description",
					"then the description comes from the descriptionPayload"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("resolves descriptionPayload values that are bindings", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()],
						descriptionPayload: {
							originalLabel: "{some/path}"
						}
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oIsBindingStub = sandbox.stub(FlUtils, "isBinding").returns(true);
				this.oChangeVisualization._bShowAllChanges = true;
				const oOverlay = OverlayRegistry.getOverlay("button1");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				assert.strictEqual(aChanges.length, 1, "then one change is returned");
				assert.ok(
					oIsBindingStub.called,
					"then FlUtils.isBinding is consulted for descriptionPayload values"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("falls back to a session-date string when the change has no creation date", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const aRegistered = this.oChangeVisualization
				._oChangeIndicatorRegistry.getAllRegisteredChanges();
				sandbox.stub(aRegistered[0].change, "getCreation").returns("");

				this.oChangeVisualization._bShowAllChanges = true;
				const oOverlay = OverlayRegistry.getOverlay("button1");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				const sFallback = Lib.getResourceBundleFor("sap.ui.rta")
				.getText("TXT_CHANGEVISUALIZATION_CREATED_IN_SESSION_DATE");
				assert.strictEqual(aChanges.length, 1, "then one change is returned");
				assert.strictEqual(
					aChanges[0].fullDate, sFallback,
					"then fullDate falls back to the session-date text"
				);
				assert.strictEqual(
					aChanges[0].relativeDate, sFallback,
					"then relativeDate falls back to the session-date text"
				);
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("ChangeVisualizationUtils.shortenString", function() {
		QUnit.test("returns null for falsy input", function(assert) {
			assert.strictEqual(ChangeVisualizationUtils.shortenString(null), null, "then null returns null");
			assert.strictEqual(ChangeVisualizationUtils.shortenString(""), null, "then empty string returns null");
			assert.strictEqual(ChangeVisualizationUtils.shortenString(undefined), null, "then undefined returns null");
		});

		QUnit.test("returns the original string when 60 characters or shorter", function(assert) {
			const sShortString = "A".repeat(60);
			assert.strictEqual(
				ChangeVisualizationUtils.shortenString(sShortString), sShortString,
				"then a 60-character string is returned unchanged"
			);
			assert.strictEqual(
				ChangeVisualizationUtils.shortenString("Hello"), "Hello",
				"then a short string is returned unchanged"
			);
		});

		QUnit.test("shortens a string longer than 60 characters", function(assert) {
			const sLongString = `${"A".repeat(27)}MIDDLE_PART_TO_BE_REMOVED${"B".repeat(27)}`;
			const sResult = ChangeVisualizationUtils.shortenString(sLongString);
			assert.ok(sResult.includes("(...)"), "then the result contains the ellipsis marker");
			assert.strictEqual(
				sResult, `${"A".repeat(27)}(...)${"B".repeat(27)}`,
				"then the first 27 and last 27 characters are preserved"
			);
			assert.ok(
				sResult.length < sLongString.length,
				"then the result is shorter than the original"
			);
		});
	});

	QUnit.module("openChangeDetailPopup", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			if (this.oChangeVisualization._oChangeDetailPopup) {
				this.oChangeVisualization._oChangeDetailPopup.destroy();
			}
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("opens a popover for an overlay with changes", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin
			});

			assert.ok(
				this.oChangeVisualization._oChangeDetailPopup,
				"then the detail popup is created"
			);
			const oChangesModel = this.oChangeVisualization._oChangeDetailPopup.getModel("changes");
			assert.ok(oChangesModel, "then the popup has a changes model");
			assert.strictEqual(
				oChangesModel.getData().length, 1,
				"then the model contains one change"
			);
			assert.ok(
				oPlugin.oContextMenuControl.close.calledOnce,
				"then the context menu was closed"
			);
			assert.ok(
				oPlugin.setBusy.calledWith(true),
				"then the context menu plugin was set to busy"
			);
			fnDone();
		});

		QUnit.test("does nothing for overlay without changes", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button3");
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay, openerOverlay: oOverlay, contextMenuPlugin: oPlugin
			});

			assert.notOk(
				this.oChangeVisualization._oChangeDetailPopup,
				"then no popup is created"
			);
			fnDone();
		});

		QUnit.test("when contextMenuRect is provided, the anchor is positioned at the rect's coordinates", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const mContextMenuRect = { top: 100, left: 50, right: 250, bottom: 600, height: 500, width: 200 };
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay, contextMenuRect: mContextMenuRect, openerOverlay: oOverlay, contextMenuPlugin: oPlugin
			});

			const oPopover = this.oChangeVisualization._oChangeDetailPopup;
			assert.ok(oPopover, "then the popup is created");
			const oAnchor = document.getElementById(`${this.oChangeVisualization.getId()}--popupAnchor`);
			assert.ok(oAnchor, "then the popup anchor is created");
			assert.strictEqual(oAnchor.style.position, "fixed", "then the anchor is positioned fixed");
			assert.strictEqual(oAnchor.style.top, "100px", "then the anchor top matches the context menu rect top");
			fnDone();
		});

		QUnit.test("when contextMenuRect is provided and the popover would overflow the right edge, the anchor is shifted left", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			// Use a context menu rect whose left + 43rem clearly overflows the viewport
			const iViewportWidth = document.documentElement.clientWidth;
			const mContextMenuRect = {
				top: 100,
				left: iViewportWidth - 50,
				right: iViewportWidth + 150,
				bottom: 600,
				height: 500,
				width: 200
			};
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay, contextMenuRect: mContextMenuRect, openerOverlay: oOverlay, contextMenuPlugin: oPlugin
			});

			const oAnchor = document.getElementById(`${this.oChangeVisualization.getId()}--popupAnchor`);
			assert.ok(oAnchor, "then the anchor is created");
			const iAnchorLeft = parseInt(oAnchor.style.left);
			assert.ok(
				iAnchorLeft < mContextMenuRect.left,
				"then the anchor is shifted left so the popover stays inside the viewport"
			);
			fnDone();
		});

		QUnit.test("when there is not enough space below, the popover opens upward", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const iViewportHeight = document.documentElement.clientHeight;
			const mContextMenuRect = {
				top: iViewportHeight - 100,
				left: 50,
				right: 250,
				bottom: iViewportHeight,
				height: 500,
				width: 200
			};
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay, contextMenuRect: mContextMenuRect, openerOverlay: oOverlay, contextMenuPlugin: oPlugin
			});

			const oPopover = this.oChangeVisualization._oChangeDetailPopup;
			assert.strictEqual(
				oPopover.getPlacement(), "Top",
				"then the popover is placed above the anchor"
			);
			const oAnchor = document.getElementById(`${this.oChangeVisualization.getId()}--popupAnchor`);
			assert.strictEqual(
				oAnchor.style.top, `${mContextMenuRect.bottom}px`,
				"then the anchor is moved to the bottom edge"
			);
			fnDone();
		});

		QUnit.test("when the app scrolls in the background, the popover is closed", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return { affectedControls: [oChange.getSelector()] };
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin
			});
			const oPopover = this.oChangeVisualization._oChangeDetailPopup;
			await new Promise((resolve) => { oPopover.attachEventOnce("afterOpen", resolve); });

			const oCloseSpy = sandbox.spy(oPopover, "close");
			const oScrollEvent = new Event("scroll", { bubbles: false });
			Object.defineProperty(oScrollEvent, "target", { value: document.body });
			window.dispatchEvent(oScrollEvent);

			assert.ok(oCloseSpy.calledOnce, "then the popover is closed when a background element scrolls");
			fnDone();
		});

		QUnit.test("when scrolling happens inside the popover, the popover stays open", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return { affectedControls: [oChange.getSelector()] };
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin
			});
			const oPopover = this.oChangeVisualization._oChangeDetailPopup;
			await new Promise((resolve) => { oPopover.attachEventOnce("afterOpen", resolve); });

			const oCloseSpy = sandbox.spy(oPopover, "close");
			// Pick any element that lives inside the popover DOM
			const oInnerElement = oPopover.getDomRef().querySelector("*") || oPopover.getDomRef();
			const oScrollEvent = new Event("scroll", { bubbles: false });
			Object.defineProperty(oScrollEvent, "target", { value: oInnerElement });
			window.dispatchEvent(oScrollEvent);

			assert.notOk(oCloseSpy.called, "then the popover is not closed when its own content scrolls");
			fnDone();
		});

		QUnit.test("when the popover is closed, the scroll and resize listeners are detached", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return { affectedControls: [oChange.getSelector()] };
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin
			});
			const oPopover = this.oChangeVisualization._oChangeDetailPopup;
			await new Promise((resolve) => { oPopover.attachEventOnce("afterOpen", resolve); });

			assert.ok(this.oChangeVisualization._fnScrollHandler, "then the scroll handler is attached while open");
			assert.ok(this.oChangeVisualization._fnGeometryChangeHandler, "then the resize handler is attached while open");

			await new Promise((resolve) => {
				oPopover.attachEventOnce("afterClose", resolve);
				oPopover.close();
			});

			assert.notOk(this.oChangeVisualization._fnScrollHandler, "then the scroll handler is cleared after close");
			assert.notOk(this.oChangeVisualization._fnGeometryChangeHandler, "then the resize handler is cleared after close");
			fnDone();
		});
	});

	QUnit.module("Command type detection", {
		beforeEach(assert) {
			const oContainer = new VBox("ctdContainer", {
				items: [
					new Button("ctdbutton1", {
						text: "First button"
					}),
					new HBox("nestedContainer1", {
						items: [
							new Button("ctdbutton2", {
								text: "Second button"
							}),
							new HBox("nestedContainer2", {
								items: [
									new Button("ctdbutton3", {
										text: "Third button"
									})
								]
							})
						]
					})
				]
			});

			const fnDone = assert.async();
			setupTest.call(this, fnDone, oContainer);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when the command type is not defined in the change", function(assert) {
			const fnDone = assert.async();
			const oGetCommandNameStub = sandbox.stub(DesignTimeMetadata.prototype, "getCommandName");
			oGetCommandNameStub.callsFake(function(...aArgs) {
				const [sChangeType, oElement, sAggregationName] = aArgs;
				const sIdentifier = (sAggregationName ? `${sAggregationName} ` : "") + sChangeType;
				const oMockResponse = ({
					ctdbutton1: {
						someRenameChangeType: "rename"
					},
					nestedContainer1: {
						"items someAddChangeType": "reveal"
					},
					nestedContainer2: {
						"items someMoveChangeType": "move"
					}
				}[oElement.getId()] || {})[sIdentifier];
				return oMockResponse || DesignTimeMetadata.prototype.getCommandName.wrappedMethod.apply(this, aArgs);
			});

			prepareChanges([
				createMockChange("testChange1", undefined, "ctdbutton1", {
					changeType: "someRenameChangeType",
					dependentSelector: {
						ctdbutton1: { id: "ctdbutton1" }
					}
				}),
				createMockChange("testChange2", undefined, "nestedContainer1", {
					changeType: "someAddChangeType",
					dependentSelector: {
						ctdbutton2: { id: "ctdbutton2" },
						nestedContainer1: { id: "nestedContainer1" }
					}
				}),
				createMockChange("testChange3", undefined, "nestedContainer1", {
					changeType: "someMoveChangeType",
					dependentSelector: {
						ctdbutton3: { id: "ctdbutton3" },
						nestedContainer1: { id: "nestedContainer1" }
					}
				})
			]);

			this.oChangeVisualization.initialize().then(function() {
				// After initialization, borders should be applied to elements with resolved commands
				const oOverlay1 = OverlayRegistry.getOverlay("ctdbutton1");
				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then command is resolved for ctdbutton1 (rename) and border is applied"
				);
				fnDone();
			});
		});
	});

	QUnit.module("selectChange / dependent element highlighting", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when _selectChange is called with a change that has dependent elements", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "move", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()],
						dependentControls: [{ id: oAppComponent.createId("button2") }]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oDependentOverlay = OverlayRegistry.getOverlay(oAppComponent.createId("button2"));
				const oDomRef = oDependentOverlay.getDomRef();

				this.oChangeVisualization._selectChange("testChange1");

				assert.ok(
					oDomRef.classList.contains("sapUiRtaChangeIndicatorDependent"),
					"then the dependent overlay has the dependent class"
				);

				// Simulate animationend
				oDomRef.dispatchEvent(new Event("animationend"));

				assert.notOk(
					oDomRef.classList.contains("sapUiRtaChangeIndicatorDependent"),
					"then the dependent class is removed after animation"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("when _selectChange is called with an unknown change ID", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				// Should not throw
				this.oChangeVisualization._selectChange("nonExistentChange");
				assert.ok(true, "then no error is thrown");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when a dependent element has no overlay, it is silently skipped", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "move", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()],
						dependentControls: [{ id: "ghostElement" }]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				assert.strictEqual(
					OverlayRegistry.getOverlay("ghostElement"), undefined,
					"sanity check: the dependent element has no overlay"
				);

				this.oChangeVisualization._selectChange("testChange1");
				assert.ok(true, "then no error is thrown for dependent ids without overlays");
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("Cleanup", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oContainer.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when ChangeVisualization is destroyed", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then border class is applied before destroy"
				);

				this.oChangeVisualization.destroy();

				assert.notOk(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then border class is removed after destroy"
				);
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("setShowAllChanges / state filter", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("when setShowAllChanges(true), all changes are shown regardless of state", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				this.oChangeVisualization.setShowAllChanges(true);
				assert.strictEqual(
					this.oChangeVisualization._bShowAllChanges, true,
					"then the flag is set to true"
				);
				return this.oChangeVisualization.refreshBorders();
			}.bind(this)).then(function() {
				const oOverlay1 = OverlayRegistry.getOverlay("button1");
				assert.ok(
					oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then the overlay has the border class when showing all changes"
				);
				assert.ok(
					this.oChangeVisualization.hasChangesForElement("button1"),
					"then hasChangesForElement returns true"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("when change has no draft/dirty state and showAllChanges is false, border is not applied", function(assert) {
			const fnDone = assert.async();
			const oChange = createMockChange("testChange1", "rename", "button1");
			sandbox.stub(oChange, "getState").returns("PERSISTED");

			prepareChanges([oChange], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				this.oChangeVisualization._bShowAllChanges = false;
				const aAllChanges = this.oChangeVisualization._oChangeIndicatorRegistry.getAllRegisteredChanges();
				aAllChanges.forEach(function(oRegChange) {
					oRegChange.changeStates = [];
				});

				this.oChangeVisualization.removeBorderClasses();
				this.oChangeVisualization.refreshBorders().then(function() {
					const oOverlay1 = OverlayRegistry.getOverlay("button1");
					assert.notOk(
						oOverlay1.hasStyleClass("sapUiRtaOverlayWithChanges"),
						"then the overlay does not have the border class"
					);
					assert.notOk(
						this.oChangeVisualization.hasChangesForElement("button1"),
						"then hasChangesForElement returns false"
					);
					fnDone();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("hasPersistedChanges", {
		beforeEach() {
			this.oCviz = new ChangeVisualization();
			this.oRegistry = this.oCviz._oChangeIndicatorRegistry;
		},
		afterEach() {
			this.oCviz.destroy();
			sandbox.restore();
		}
	}, function() {
		function setRegisteredChanges(oRegistry, mEntries) {
			// Write directly into the two-layer registry: catalog (Layer 1) + resolution cache (Layer 2).
			// Entries that have a non-empty visualizationInfo go into both layers; entries with
			// no/empty visualizationInfo go into the catalog only (simulating unresolved state).
			Object.keys(mEntries).forEach(function(sId) {
				const oEntry = mEntries[sId];
				oRegistry._oChangeCatalog[sId] = {
					change: oEntry.change,
					commandName: oEntry.commandName || "rename",
					changeCategory: oEntry.changeCategory || "other",
					changeStates: oEntry.changeStates
				};
				if (oEntry.visualizationInfo && (
					(oEntry.visualizationInfo.displayElementIds && oEntry.visualizationInfo.displayElementIds.length > 0)
					|| (oEntry.visualizationInfo.affectedElementIds && oEntry.visualizationInfo.affectedElementIds.length > 0)
				)) {
					oRegistry._oResolutionCache[sId] = oEntry.visualizationInfo;
				}
			});
		}

		function createChangeStub(sApplyState) {
			return {
				getApplyState: () => sApplyState,
				isSuccessfullyApplied: () => sApplyState === States.ApplyState.APPLY_SUCCESSFUL
			};
		}

		QUnit.test("returns false when the registry is empty", function(assert) {
			assert.strictEqual(this.oCviz.hasPersistedChanges(), false, "then no persisted change is reported");
		});

		QUnit.test("returns false when only draft/dirty changes are registered", function(assert) {
			setRegisteredChanges(this.oRegistry, {
				c1: {
					change: createChangeStub(States.ApplyState.APPLY_SUCCESSFUL),
					changeStates: ChangeStates.getDraftAndDirtyStates(),
					visualizationInfo: { affectedElementIds: ["b1"], displayElementIds: ["b1"] }
				}
			});
			assert.strictEqual(this.oCviz.hasPersistedChanges(), false, "then a draft/dirty change does not count");
		});

		QUnit.test("returns true for a persisted change with apply state APPLY_SUCCESSFUL", function(assert) {
			setRegisteredChanges(this.oRegistry, {
				c1: {
					change: createChangeStub(States.ApplyState.APPLY_SUCCESSFUL),
					changeStates: [ChangeStates.ALL],
					visualizationInfo: { affectedElementIds: ["b1"], displayElementIds: ["b1"] }
				}
			});
			assert.strictEqual(this.oCviz.hasPersistedChanges(), true, "then the successfully applied persisted change is reported");
		});

		QUnit.test("returns false when no persisted change has apply state APPLY_SUCCESSFUL", function(assert) {
			setRegisteredChanges(this.oRegistry, {
				c1: {
					change: createChangeStub(States.ApplyState.INITIAL),
					changeStates: [ChangeStates.ALL],
					visualizationInfo: { affectedElementIds: [], displayElementIds: [] }
				},
				c2: {
					change: createChangeStub(States.ApplyState.APPLY_FAILED),
					changeStates: [ChangeStates.ALL],
					visualizationInfo: {}
				}
			});
			assert.strictEqual(this.oCviz.hasPersistedChanges(), false, "then unsuccessfully applied persisted changes are ignored");
		});

		QUnit.test("returns true when at least one of the persisted changes has apply state APPLY_SUCCESSFUL", function(assert) {
			setRegisteredChanges(this.oRegistry, {
				c1: {
					change: createChangeStub(States.ApplyState.INITIAL),
					changeStates: [ChangeStates.ALL],
					visualizationInfo: { affectedElementIds: [], displayElementIds: [] }
				},
				c2: {
					change: createChangeStub(States.ApplyState.APPLY_SUCCESSFUL),
					changeStates: [ChangeStates.ALL],
					visualizationInfo: { affectedElementIds: ["b1"], displayElementIds: ["b1"] }
				}
			});
			assert.strictEqual(this.oCviz.hasPersistedChanges(), true, "then the successfully applied entry wins over the others");
		});

		QUnit.test("returns true when isSuccessfullyApplied() is true on a UIChange-like object", function(assert) {
			setRegisteredChanges(this.oRegistry, {
				c1: {
					change: { isSuccessfullyApplied: () => true },
					changeStates: [ChangeStates.ALL],
					visualizationInfo: { affectedElementIds: ["b1"], displayElementIds: ["b1"] }
				}
			});
			assert.strictEqual(
				this.oCviz.hasPersistedChanges(), true,
				"then the persisted change is reported via the isSuccessfullyApplied path"
			);
		});

		QUnit.test("returns false when isSuccessfullyApplied() is false", function(assert) {
			setRegisteredChanges(this.oRegistry, {
				c1: {
					change: { isSuccessfullyApplied: () => false },
					changeStates: [ChangeStates.ALL],
					visualizationInfo: {}
				}
			});
			assert.strictEqual(
				this.oCviz.hasPersistedChanges(), false,
				"then the change is not reported when isSuccessfullyApplied returns false"
			);
		});

		QUnit.test("returns false when the change has neither isSuccessfullyApplied nor getApplyState", function(assert) {
			setRegisteredChanges(this.oRegistry, {
				c1: {
					change: {},
					changeStates: [ChangeStates.ALL],
					visualizationInfo: {}
				}
			});
			assert.strictEqual(
				this.oCviz.hasPersistedChanges(), false,
				"then changes without an apply-state accessor are ignored"
			);
		});

		QUnit.test("returns false when changeStates is not an array", function(assert) {
			setRegisteredChanges(this.oRegistry, {
				c1: {
					change: createChangeStub(States.ApplyState.APPLY_SUCCESSFUL),
					changeStates: undefined,
					visualizationInfo: {}
				}
			});
			assert.strictEqual(
				this.oCviz.hasPersistedChanges(), false,
				"then entries without a changeStates array are skipped"
			);
		});
	});

	QUnit.module("setVersionsModel", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("stores the versions model from toolbar", function(assert) {
			const oMockModel = {};
			const oMockToolbar = {
				getModel(sName) {
					if (sName === "versions") {
						return oMockModel;
					}
					return undefined;
				}
			};
			this.oChangeVisualization.setVersionsModel(oMockToolbar);
			assert.strictEqual(
				this.oChangeVisualization.oVersionsModel, oMockModel,
				"then the versions model is stored"
			);
		});
	});

	QUnit.module("getChangesForOverlay - affectedElementIds fallback", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("falls back to affectedElementIds when selector does not match overlay element", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "nonExistentSelector")
			], {
				getChangeVisualizationInfo() {
					return {
						affectedControls: [{ id: "button1" }]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				// Manually patch visualizationInfo since getInfoFromChangeHandler
				// cannot resolve "nonExistentSelector" to a control
				const oRegistry = this.oChangeVisualization._oChangeIndicatorRegistry;
				const oVizInfo = oRegistry._oResolutionCache.testChange1
					|| { affectedElementIds: [], dependentElementIds: [], displayElementIds: [], descriptionPayload: {} };
				oVizInfo.affectedElementIds = ["button1"];
				oRegistry._oResolutionCache.testChange1 = oVizInfo;

				this.oChangeVisualization._bShowAllChanges = true;
				const oOverlay = OverlayRegistry.getOverlay("button1");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				assert.strictEqual(aChanges.length, 1, "then one change is returned via fallback");
				assert.strictEqual(aChanges[0].id, "testChange1", "then the correct change is returned");
				fnDone();
			}.bind(this));
		});

		QUnit.test("filters out registered changes rejected by the state filter in the fallback path", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "nonExistentSelector")
			], {
				getChangeVisualizationInfo() {
					return {
						affectedControls: [{ id: "button1" }]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oRegistry = this.oChangeVisualization._oChangeIndicatorRegistry;
				const oVizInfo = oRegistry._oResolutionCache.testChange1
					|| { affectedElementIds: [], dependentElementIds: [], displayElementIds: [], descriptionPayload: {} };
				oVizInfo.affectedElementIds = ["button1"];
				oRegistry._oResolutionCache.testChange1 = oVizInfo;
				oRegistry._oChangeCatalog.testChange1.changeStates = [];

				this.oChangeVisualization._bShowAllChanges = false;
				const oOverlay = OverlayRegistry.getOverlay("button1");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				assert.strictEqual(
					aChanges.length, 0,
					"then no changes are returned when the state filter rejects every fallback candidate"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("uses Date.now() as sort key when changes have no creation date", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1"),
				createMockChange("testChange2", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const aRegistered = this.oChangeVisualization
				._oChangeIndicatorRegistry.getAllRegisteredChanges();
				aRegistered.forEach((oEntry) => {
					sandbox.stub(oEntry.change, "getCreation").returns("");
				});

				this.oChangeVisualization._bShowAllChanges = true;
				const oOverlay = OverlayRegistry.getOverlay("button1");
				const aChanges = this.oChangeVisualization.getChangesForOverlay(oOverlay);

				assert.strictEqual(aChanges.length, 2, "then both changes are returned");
				const aIds = aChanges.map((oChange) => oChange.id);
				assert.deepEqual(
					aIds.sort(), ["testChange1", "testChange2"],
					"then both changes survive the sort fallback to Date.now()"
				);
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("openChangeDetailPopup - additional branches", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			if (this.oChangeVisualization._oChangeDetailPopup) {
				this.oChangeVisualization._oChangeDetailPopup.destroy();
			}
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("destroys previous popup when opening a new one", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");

			const oPlugin1 = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin1
			});
			const oFirstPopup = this.oChangeVisualization._oChangeDetailPopup;
			assert.ok(oFirstPopup, "then the first popup is created");
			const oDestroySpy = sandbox.spy(oFirstPopup, "destroy");

			const oPlugin2 = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin2
			});
			assert.ok(oDestroySpy.calledOnce, "then the first popup was destroyed");
			assert.ok(
				this.oChangeVisualization._oChangeDetailPopup,
				"then a new popup is created"
			);
			assert.notStrictEqual(
				this.oChangeVisualization._oChangeDetailPopup, oFirstPopup,
				"then the new popup is different from the first"
			);
			fnDone();
		});
	});

	QUnit.module("_onKeyDown - keyboard navigation in popup", {
		beforeEach() {
			// Build focus-tracking buttons
			this.oFocusLog = [];
			const createButton = (sId, bVisible) => {
				const oFocusDom = { id: sId };
				return {
					_id: sId,
					getVisible: () => bVisible,
					getFocusDomRef: () => oFocusDom,
					focus: () => { this.oFocusLog.push(sId); }
				};
			};

			this.oBackButton = createButton("back", true);
			this.oRowButton1 = createButton("row1", true);
			this.oRowButton2 = createButton("row2", true);
			this.oHiddenRowButton = createButton("rowHidden", false);

			const buildItem = (oButton) => ({
				getCells: () => [
					{ /* icon cell */ },
					{ getItems: () => [{ /* text */ }, oButton] }
				]
			});

			this.oMockPopover = {
				getBeginButton: () => this.oBackButton,
				getContent: () => [{
					getItems: () => [
						buildItem(this.oRowButton1),
						buildItem(this.oHiddenRowButton),
						buildItem(this.oRowButton2)
					]
				}]
			};

			// Resolve focusable elements: [back, row1, row2] (rowHidden excluded)
			this.aExpectedFocusables = [this.oBackButton, this.oRowButton1, this.oRowButton2];
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("non-TAB keys are ignored and prevented", function(assert) {
			const oCviz = new ChangeVisualization();
			const oPreventDefault = sandbox.stub();
			const oStopPropagation = sandbox.stub();
			const oEvent = {
				keyCode: KeyCodes.ENTER, shiftKey: false,
				preventDefault: oPreventDefault, stopPropagation: oStopPropagation
			};

			oCviz._onKeyDown.call(this.oMockPopover, oEvent);

			assert.ok(oPreventDefault.calledOnce, "then preventDefault is called for non-TAB keys");
			assert.strictEqual(this.oFocusLog.length, 0, "then no focus change occurs");
			oCviz.destroy();
		});

		QUnit.test("TAB cycles forward through visible focusable elements", function(assert) {
			const oCviz = new ChangeVisualization();
			// document.activeElement is none of our mock refs → iCurrentIndex = -1
			const oEvent = {
				keyCode: KeyCodes.TAB, shiftKey: false,
				preventDefault: sandbox.stub(), stopPropagation: sandbox.stub()
			};

			oCviz._onKeyDown.call(this.oMockPopover, oEvent);

			assert.deepEqual(this.oFocusLog, ["back"], "then focus moves to the first focusable (Back button)");
			oCviz.destroy();
		});

		QUnit.test("Shift+TAB cycles backward and wraps", function(assert) {
			const oCviz = new ChangeVisualization();
			const oEvent = {
				keyCode: KeyCodes.TAB, shiftKey: true,
				preventDefault: sandbox.stub(), stopPropagation: sandbox.stub()
			};

			oCviz._onKeyDown.call(this.oMockPopover, oEvent);

			// iCurrentIndex = -1, shiftKey true → iCurrentIndex <= 0 → wraps to last
			assert.deepEqual(this.oFocusLog, ["row2"], "then focus wraps to the last focusable element");
			oCviz.destroy();
		});

		QUnit.test("hidden row buttons are excluded from the focus cycle", function(assert) {
			const oCviz = new ChangeVisualization();
			// Force document.activeElement to row1's focus DOM ref
			const oOriginalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "activeElement")
				|| Object.getOwnPropertyDescriptor(HTMLDocument.prototype, "activeElement");
			Object.defineProperty(document, "activeElement", {
				configurable: true,
				get: () => this.oRowButton1.getFocusDomRef()
			});

			try {
				const oEvent = {
					keyCode: KeyCodes.TAB, shiftKey: false,
					preventDefault: sandbox.stub(), stopPropagation: sandbox.stub()
				};
				oCviz._onKeyDown.call(this.oMockPopover, oEvent);

				// row1 is index 1; next should be row2 (index 2), skipping rowHidden
				assert.deepEqual(this.oFocusLog, ["row2"], "then focus advances to the next visible button, skipping hidden ones");
			} finally {
				// Always restore activeElement so later tests are not left with a stubbed getter
				if (oOriginalDescriptor) {
					Object.defineProperty(document, "activeElement", oOriginalDescriptor);
				} else {
					delete document.activeElement;
				}
				oCviz.destroy();
			}
		});

		QUnit.test("returns silently when there are no focusable elements", function(assert) {
			const oCviz = new ChangeVisualization();
			const oEmptyPopover = {
				getBeginButton: () => null,
				getContent: () => [{ getItems: () => [] }]
			};
			const oEvent = {
				keyCode: KeyCodes.TAB, shiftKey: false,
				preventDefault: sandbox.stub(), stopPropagation: sandbox.stub()
			};

			oCviz._onKeyDown.call(oEmptyPopover, oEvent);

			assert.strictEqual(this.oFocusLog.length, 0, "then no focus change occurs");
			oCviz.destroy();
		});

		QUnit.test("TAB advances to the next visible element when not at the end of the cycle", function(assert) {
			const oCviz = new ChangeVisualization();
			const oOriginalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "activeElement")
				|| Object.getOwnPropertyDescriptor(HTMLDocument.prototype, "activeElement");
			Object.defineProperty(document, "activeElement", {
				configurable: true,
				get: () => this.oBackButton.getFocusDomRef()
			});

			const oEvent = {
				keyCode: KeyCodes.TAB, shiftKey: false,
				preventDefault: sandbox.stub(), stopPropagation: sandbox.stub()
			};
			oCviz._onKeyDown.call(this.oMockPopover, oEvent);

			assert.deepEqual(
				this.oFocusLog, ["row1"],
				"then focus moves to the next focusable element without wrapping"
			);

			if (oOriginalDescriptor) {
				Object.defineProperty(document, "activeElement", oOriginalDescriptor);
			} else {
				delete document.activeElement;
			}
			oCviz.destroy();
		});

		QUnit.test("Shift+TAB moves backward to the previous element when not at the start", function(assert) {
			const oCviz = new ChangeVisualization();
			const oOriginalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "activeElement")
				|| Object.getOwnPropertyDescriptor(HTMLDocument.prototype, "activeElement");
			Object.defineProperty(document, "activeElement", {
				configurable: true,
				get: () => this.oRowButton2.getFocusDomRef()
			});

			const oEvent = {
				keyCode: KeyCodes.TAB, shiftKey: true,
				preventDefault: sandbox.stub(), stopPropagation: sandbox.stub()
			};
			oCviz._onKeyDown.call(this.oMockPopover, oEvent);

			assert.deepEqual(
				this.oFocusLog, ["row1"],
				"then focus moves to the previous visible element without wrapping"
			);

			if (oOriginalDescriptor) {
				Object.defineProperty(document, "activeElement", oOriginalDescriptor);
			} else {
				delete document.activeElement;
			}
			oCviz.destroy();
		});
	});

	QUnit.module("onClosePopover", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			if (this.oChangeVisualization._oChangeDetailPopup) {
				this.oChangeVisualization._oChangeDetailPopup.destroy();
			}
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("closes popup and reopens context menu", async function(assert) {
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const oMockEvent = {};
			const oMockPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerEvent: oMockEvent,
				openerOverlay: oOverlay,
				contextMenuPlugin: oMockPlugin
			});

			const oDestroySpy = sandbox.spy(this.oChangeVisualization._oChangeDetailPopup, "destroy");
			const oCleanUpSpy = sandbox.spy(this.oChangeVisualization, "_cleanUpAfterClose");
			this.oChangeVisualization.onClosePopover();

			assert.ok(oDestroySpy.calledOnce, "then the popup is destroyed");
			assert.strictEqual(
				this.oChangeVisualization._oChangeDetailPopup, null,
				"then the popup reference is cleared"
			);
			assert.ok(
				oMockPlugin.setBusy.calledWith(false),
				"then the context menu plugin is no longer busy"
			);
			const sAnchorId = `${this.oChangeVisualization.getId()}--popupAnchor`;
			assert.notOk(
				document.getElementById(sAnchorId),
				"then the popup anchor is removed from the DOM"
			);
			assert.ok(
				oCleanUpSpy.calledOnce,
				"then the cleanup is triggered when the popup is closed"
			);
		});

		QUnit.test("_cleanUpAfterClose removes the popup anchor and unbusies the plugin", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const oPlugin = createContextMenuPluginStub();
			const mContextMenuRect = { top: 100, left: 50, right: 250, bottom: 600, height: 500, width: 200 };
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay, contextMenuRect: mContextMenuRect, openerOverlay: oOverlay, contextMenuPlugin: oPlugin
			});

			const sAnchorId = `${this.oChangeVisualization.getId()}--popupAnchor`;
			assert.ok(document.getElementById(sAnchorId), "then the anchor exists before cleanup");

			oPlugin.setBusy.resetHistory();
			this.oChangeVisualization._cleanUpAfterClose();

			assert.notOk(
				document.getElementById(sAnchorId),
				"then the anchor is removed from the DOM"
			);
			assert.ok(
				oPlugin.setBusy.calledWith(false),
				"then the context menu plugin is no longer busy"
			);
			fnDone();
		});
	});

	QUnit.module("_showDependentElements", {
		beforeEach(assert) {
			const fnDone = assert.async();
			// Production code reads Overlay.getOverlayContainer().childNodes[0].style.zIndex
			// to bring the root overlay to the front during the dependent-element animation. The test
			// fixture's DesignTime does not always create that container, so stub it with a stand-in
			// that holds a fake root overlay we can inspect.
			this.oFakeOverlayContainer = document.createElement("div");
			this.oFakeRootOverlay = document.createElement("div");
			this.oFakeRootOverlay.style.zIndex = "1";
			this.oFakeOverlayContainer.appendChild(this.oFakeRootOverlay);
			document.body.appendChild(this.oFakeOverlayContainer);
			sandbox.stub(Overlay, "getOverlayContainer").returns(this.oFakeOverlayContainer);
			setupTest.call(this, fnDone);
		},
		afterEach() {
			if (this.oChangeVisualization._oChangeDetailPopup) {
				this.oChangeVisualization._oChangeDetailPopup.destroy();
			}
			cleanupTest.call(this);
			this.oFakeOverlayContainer?.remove();
		}
	}, function() {
		QUnit.test("closes popup and calls _selectChange with the change ID", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "move", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()],
						dependentControls: [{ id: oAppComponent.createId("button2") }]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin
			});

			const oSelectChangeSpy = sandbox.spy(this.oChangeVisualization, "_selectChange");
			const oCloseSpy = sandbox.spy(this.oChangeVisualization._oChangeDetailPopup, "close");

			const oMockEvent = {
				getSource() {
					return {
						getBindingContext() {
							return {
								getObject() {
									return { id: "testChange1" };
								}
							};
						}
					};
				}
			};
			this.oChangeVisualization.showDependentElements(oMockEvent);

			assert.ok(oCloseSpy.calledOnce, "then the popup is closed");
			assert.ok(
				oSelectChangeSpy.calledWith("testChange1"),
				"then _selectChange is called with the correct change ID"
			);

			fnDone();
		});

		QUnit.test("reopens the popup after the dependent-element animation ends", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "move", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()],
						dependentControls: [{ id: oAppComponent.createId("button2") }]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const mContextMenuRect = { top: 10, left: 10, right: 200, bottom: 200, height: 190, width: 190 };
			const oOpenerEvent = {};
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: mContextMenuRect,
				openerEvent: oOpenerEvent,
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin
			});

			const oOpenSpy = sandbox.spy(this.oChangeVisualization, "openChangeDetailPopup");

			const oMockEvent = {
				getSource() {
					return {
						getBindingContext() {
							return { getObject() { return { id: "testChange1" }; } };
						}
					};
				}
			};
			this.oChangeVisualization.showDependentElements(oMockEvent);

			assert.notOk(oOpenSpy.called, "then the popup is not reopened immediately");

			// Production code listens for `animationend` on the .sapUiRtaChangeIndicatorDependent overlay.
			// Dispatch the event to simulate the animation finishing.
			const oAnimatedOverlay = document.querySelector(".sapUiRtaChangeIndicatorDependent");
			assert.ok(oAnimatedOverlay, "then the dependent indicator class was added");
			oAnimatedOverlay.dispatchEvent(new AnimationEvent("animationend"));

			assert.ok(oOpenSpy.calledOnce, "then the popup is reopened after the animation ends");
			assert.ok(
				oOpenSpy.calledWith({
					overlay: oOverlay,
					contextMenuRect: mContextMenuRect,
					openerEvent: oOpenerEvent,
					openerOverlay: oOverlay,
					contextMenuPlugin: oPlugin
				}),
				"then it is reopened with the stored opener tuple"
			);

			fnDone();
		});

		QUnit.test("does not throw when there is no current popup to close", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "move", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()],
						dependentControls: [{ id: oAppComponent.createId("button2") }]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			this.oChangeVisualization._oChangeDetailPopup = null;
			const oSelectChangeSpy = sandbox.spy(this.oChangeVisualization, "_selectChange");

			const oMockEvent = {
				getSource() {
					return {
						getBindingContext() {
							return { getObject() { return { id: "testChange1" }; } };
						}
					};
				}
			};
			this.oChangeVisualization.showDependentElements(oMockEvent);

			assert.ok(
				oSelectChangeSpy.calledWith("testChange1"),
				"then _selectChange still runs even when no popup is open"
			);

			fnDone();
		});

		QUnit.test("restores the original z-index of the root overlay after reopening", async function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "move", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()],
						dependentControls: [{ id: oAppComponent.createId("button2") }]
					};
				}
			});

			await this.oChangeVisualization.initialize();
			const oOverlay = OverlayRegistry.getOverlay("button1");
			const oPlugin = createContextMenuPluginStub();
			await this.oChangeVisualization.openChangeDetailPopup({
				overlay: oOverlay,
				contextMenuRect: createContextMenuRect(),
				openerOverlay: oOverlay,
				contextMenuPlugin: oPlugin
			});

			// Stub the reopen so the test does not race a real Fragment.load on the second open.
			sandbox.stub(this.oChangeVisualization, "openChangeDetailPopup").resolves();

			const sOriginalZ = this.oFakeRootOverlay.style.zIndex;

			const oMockEvent = {
				getSource() {
					return {
						getBindingContext() {
							return { getObject() { return { id: "testChange1" }; } };
						}
					};
				}
			};
			this.oChangeVisualization.showDependentElements(oMockEvent);

			assert.strictEqual(
				this.oFakeRootOverlay.style.zIndex, "99999999",
				"then the root overlay z-index is bumped while the animation runs"
			);

			const oAnimatedOverlay = document.querySelector(".sapUiRtaChangeIndicatorDependent");
			oAnimatedOverlay.dispatchEvent(new AnimationEvent("animationend"));

			assert.strictEqual(
				this.oFakeRootOverlay.style.zIndex, sOriginalZ,
				"then the root overlay z-index is restored once the animation ends"
			);

			fnDone();
		});
	});

	QUnit.module("selectChange (public event handler)", {
		beforeEach(assert) {
			const fnDone = assert.async();
			setupTest.call(this, fnDone);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("reads changeId from event parameter and calls _selectChange", function(assert) {
			const fnDone = assert.async();
			prepareChanges([
				createMockChange("testChange1", "rename", "button1")
			], {
				getChangeVisualizationInfo(oChange) {
					return {
						affectedControls: [oChange.getSelector()]
					};
				}
			});

			this.oChangeVisualization.initialize().then(function() {
				const oSelectChangeSpy = sandbox.spy(this.oChangeVisualization, "_selectChange");
				const oMockEvent = {
					getParameter(sName) {
						if (sName === "changeId") {
							return "testChange1";
						}
						return undefined;
					}
				};
				this.oChangeVisualization.selectChange(oMockEvent);
				assert.ok(
					oSelectChangeSpy.calledWith("testChange1"),
					"then _selectChange is called with the correct change ID"
				);
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("_getCommandForChange - canBeVisualized false", {
		beforeEach(assert) {
			const oContainer = new VBox("cbvContainer", {
				items: [
					new Button("cbvButton1", {
						text: "Button"
					})
				]
			});

			const fnDone = assert.async();
			setupTest.call(this, fnDone, oContainer);
		},
		afterEach() {
			cleanupTest.call(this);
		}
	}, function() {
		QUnit.test("returns false when change cannot be visualized", function(assert) {
			const fnDone = assert.async();
			const oChange = createMockChange("testChange1", undefined, "cbvButton1", {
				changeType: "someChangeType",
				dependentSelector: {
					cbvButton1: { id: "cbvButton1" }
				}
			});
			sandbox.stub(oChange, "canBeVisualized").returns(false);

			prepareChanges([oChange]);

			this.oChangeVisualization.initialize().then(function() {
				const oOverlay = OverlayRegistry.getOverlay("cbvButton1");
				assert.notOk(
					oOverlay.hasStyleClass("sapUiRtaOverlayWithChanges"),
					"then no border is applied when change cannot be visualized"
				);
				fnDone();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
		oAppComponent._restoreGetAppComponentStub();
		oAppComponent.destroy();
	});
});
