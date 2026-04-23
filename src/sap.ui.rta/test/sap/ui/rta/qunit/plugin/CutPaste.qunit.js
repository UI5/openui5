/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/rta/plugin/CutPaste",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/layout/VerticalLayout",
	"sap/m/ObjectStatus",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/m/Page",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/test/utils/nextUIUpdate"
],
function(
	Layer,
	CutPastePlugin,
	RemovePlugin,
	CommandFactory,
	VerticalLayout,
	ObjectStatus,
	Plugin,
	DesignTime,
	OverlayRegistry,
	OverlayUtil,
	Page,
	sinon,
	nextUIUpdate
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oCommandFactory = new CommandFactory({
		flexSettings: {
			layer: Layer.VENDOR
		}
	});

	QUnit.module("CutPaste Plugin Tests", {
		beforeEach() {
			this.CutPastePlugin = new CutPastePlugin({
				commandFactory: oCommandFactory
			});
		},

		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When retrieving the context menu items", function(assert) {
			assert.expect(12);
			let bIsAvailable = true;
			const oMockParentAggregationOverlay = {
				getDesignTimeMetadata() {}
			};
			const oMockOverlay = {
				getDesignTimeMetadata() {},
				getParentAggregationOverlay() { return oMockParentAggregationOverlay; }
			};

			// Cut
			sandbox.stub(this.CutPastePlugin, "cut").callsFake(function(oOverlay) {
				assert.equal(oOverlay, oMockOverlay, "the 'cut' method is called with the right overlay");
			});
			sandbox.stub(this.CutPastePlugin, "isAvailable").callsFake(function(aOverlays) {
				assert.equal(aOverlays[0], oMockOverlay, "the 'available' function calls isAvailable with the correct overlay");
				return bIsAvailable;
			});
			sandbox.stub(OverlayUtil, "canBeRemovedFromAggregationOnMove")
			.callsFake(function(oElementOverlay, oDesignTime) {
				assert.strictEqual(
					oElementOverlay,
					oMockOverlay,
					"the 'canBeRemovedFromAggregationOnMove' function is called with the correct overlay"
				);
				assert.strictEqual(
					oDesignTime,
					this.CutPastePlugin.getDesignTime(),
					"the 'canBeRemovedFromAggregationOnMove' function is called with the correct design time"
				);
				return true;
			}.bind(this));
			sandbox.stub(this.CutPastePlugin, "_isPasteEditable").callsFake(function(oOverlay) {
				assert.equal(oOverlay, oMockOverlay, "the 'available' function calls _isEditable when isAvailable is false, with the correct overlay");
				return Promise.resolve(true);
			});

			// Paste
			sandbox.stub(this.CutPastePlugin, "paste").callsFake(function(oOverlay) {
				assert.equal(oOverlay, oMockOverlay, "the 'paste' method is called with the right overlay");
			});
			sandbox.stub(this.CutPastePlugin, "isElementPasteable").callsFake(function(oOverlay) {
				assert.equal(oOverlay, oMockOverlay, "the 'enabled' function calls isElementPasteable with the correct overlay");
				return Promise.resolve(true);
			});

			var aMenuItems = this.CutPastePlugin.getMenuItems([oMockOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_CUT", "'getMenuItems' returns a context menu item for 'cut'");
			aMenuItems[0].handler([oMockOverlay]);
			assert.equal(aMenuItems[0].enabled([oMockOverlay]), true, "the 'enabled' function returns true for single selection");
			assert.equal(aMenuItems[1].id, "CTX_PASTE", "'getMenuItems' returns a context menu item for 'paste'");
			aMenuItems[1].handler([oMockOverlay]);
			aMenuItems[1].enabled([oMockOverlay]);
			bIsAvailable = false;
			return this.CutPastePlugin.getMenuItems([oMockOverlay])
			.then(function(aMenuItems) {
				assert.equal(aMenuItems.length, 1, "then one menu item is returned when only paste is available");
			});
		});

		QUnit.test("When retrieving the context menu items and a responsible element is available", function(assert) {
			assert.expect(9);
			const oMockParentAggregationOverlay = {
				getDesignTimeMetadata() {
					return {
						actions: {
							remove: {
								removeLastElement: true
							}
						}
					};
				}
			};
			const oMockOverlay = {
				getDesignTimeMetadata() {},
				getParentAggregationOverlay() { return oMockParentAggregationOverlay; }
			};
			const oResponsibleElementOverlay = { type: "responsibleElementOverlay" };

			sandbox.stub(this.CutPastePlugin, "isResponsibleElementActionAvailable").returns(true);
			sandbox.stub(this.CutPastePlugin, "getResponsibleElementOverlay").returns(oResponsibleElementOverlay);
			sandbox.stub(this.CutPastePlugin, "isAvailable").callsFake(function(aOverlays) {
				assert.equal(aOverlays[0], oResponsibleElementOverlay, "then isAvailable() is called with the responsible element overlay");
				return true;
			});
			sandbox.stub(OverlayUtil, "canBeRemovedFromAggregationOnMove")
			.callsFake(function(oElementOverlay, oDesignTime) {
				assert.strictEqual(
					oElementOverlay,
					oMockOverlay,
					"then canBeRemovedFromAggregationOnMove() is called with the correct overlay"
				);
				assert.strictEqual(
					oDesignTime,
					this.CutPastePlugin.getDesignTime(),
					"then canBeRemovedFromAggregationOnMove() is called with the correct design time"
				);
				return true;
			}.bind(this));
			sandbox.stub(this.CutPastePlugin, "_isPasteEditable").callsFake(function(oOverlay) {
				assert.equal(oOverlay, oResponsibleElementOverlay, "then _isPasteEditable() is called with the responsible element overlay");
				return Promise.resolve(false);
			});

			sandbox.stub(this.CutPastePlugin, "isElementPasteable").callsFake(function(oOverlay) {
				assert.equal(oOverlay, oResponsibleElementOverlay, "the enabled() for paste was called with the correct overlay");
			});

			var aMenuItems = this.CutPastePlugin.getMenuItems([oMockOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_CUT", "then getMenuItems() returns a context menu item for cut");
			assert.equal(aMenuItems[0].enabled([oMockOverlay]), true, "the enabled() returns true for single selection");
			assert.deepEqual(aMenuItems[0].responsible[0], oResponsibleElementOverlay,
				"then the cut menu item was enhanced with the responsible element overlay");
			assert.equal(aMenuItems[1].id, "CTX_PASTE", "then getMenuItems() returns a context menu item for cut");
			aMenuItems[1].enabled([oResponsibleElementOverlay]);
			assert.deepEqual(aMenuItems[1].responsible[0], oResponsibleElementOverlay,
				"then the paste menu item was enhanced with the responsible element overlay");
		});
	});

	// Integration scenario to check _isPasteEditable
	QUnit.module("Given a single layout with two elements", {
		async beforeEach(assert) {
			var done = assert.async();

			this.CutPastePlugin = new CutPastePlugin({
				commandFactory: oCommandFactory
			});

			sandbox.stub(Plugin.prototype, "hasChangeHandler").resolves(true);

			var oObjectStatus1 = new ObjectStatus("objectStatus1", {
				text: "Text 1",
				title: "Title 1"
			});

			var oObjectStatus2 = new ObjectStatus("objectStatus2", {
				text: "Text 2",
				title: "Title 2"
			});

			this.oVerticalLayout = new VerticalLayout("VerticalLayout", {
				content: [oObjectStatus1, oObjectStatus2]
			});

			this.oPage = new Page("page", {
				content: [this.oVerticalLayout]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage]
			});

			this.CutPastePlugin.setDesignTime(this.oDesignTime);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVericalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oObjectStatusOverlay1 = OverlayRegistry.getOverlay(oObjectStatus1);
				done();
			}.bind(this));
		},

		afterEach() {
			this.oDesignTime.destroy();
			this.oPage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when retrieving the context menu items and checking if paste is available", function(assert) {
			var fnMoveAvailableOnRelevantContainerStub = sandbox.stub(this.CutPastePlugin.getElementMover(), "isMoveAvailableOnRelevantContainer").resolves(true);
			var fnMoveAvailableOnChildrenStub = sandbox.stub(this.CutPastePlugin.getElementMover(), "isMoveAvailableForChildren").returns(true);
			return this.CutPastePlugin.getMenuItems([this.oVericalLayoutOverlay])
			.then(function(aMenuItemsForLayout) {
				sandbox.stub(this.oVericalLayoutOverlay, "getMovable").returns(false);
				sandbox.stub(this.oObjectStatusOverlay1, "getMovable").returns(true);
				assert.equal(this.oVerticalLayout.getContent()[0].getId(), "objectStatus1", "then 'Object Status 1' initially at the first position in the layout");
				assert.equal(aMenuItemsForLayout[0].id, "CTX_PASTE", "'getMenuItems' for formContainer returns a context menu item for 'paste'");
				assert.notOk(aMenuItemsForLayout[0].enabled([this.oVericalLayoutOverlay]), "'paste' is disabled for the formContainer");
				assert.ok(fnMoveAvailableOnRelevantContainerStub.calledOnce, "then RTAElementMover.isMoveAvailableOnRelevantContainer called once, when retrieving menu items for vertical layout");
				assert.ok(fnMoveAvailableOnChildrenStub.calledOnce, "then RTAElementMover.fnMoveAvailableOnChildren called once, when retrieving menu items for vertical layout");
				fnMoveAvailableOnRelevantContainerStub.restore();
				fnMoveAvailableOnChildrenStub.restore();
				return this.CutPastePlugin.getMenuItems([this.oObjectStatusOverlay1]);
			}.bind(this))
			.then(function(aMenuItemsForObjectStatus) {
				assert.equal(aMenuItemsForObjectStatus[0].id, "CTX_CUT", "'getMenuItems' for formElement returns a context menu item for 'cut'");
				aMenuItemsForObjectStatus[0].handler([this.oObjectStatusOverlay1]);
				return this.CutPastePlugin.getMenuItems([this.oVericalLayoutOverlay]);
			}.bind(this))
			.then(function(aMenuItemsForLayout) {
				assert.ok(aMenuItemsForLayout[0].enabled([this.oVericalLayoutOverlay]), "'paste' is now enabled for the formContainer");
				aMenuItemsForLayout[0].handler([this.oVericalLayoutOverlay]);
				assert.equal(this.oVerticalLayout.getContent()[0].getId(), "objectStatus1", "then object status now pasted at the first position");
			}.bind(this));
		});

		QUnit.test("when retrieving the context menu items and checking if paste is unavailable", function(assert) {
			var fnMoveAvailableOnRelevantContainerStub = sandbox.stub(this.CutPastePlugin.getElementMover(), "isMoveAvailableOnRelevantContainer").resolves(true);
			var fnMoveAvailableOnChildrenStub = sandbox.stub(this.CutPastePlugin.getElementMover(), "isMoveAvailableForChildren").returns(false);
			return this.CutPastePlugin.getMenuItems([this.oVericalLayoutOverlay])
			.then(function(aMenuItemsForLayout) {
				sandbox.stub(this.oVericalLayoutOverlay, "getMovable").returns(false);
				sandbox.stub(this.oObjectStatusOverlay1, "getMovable").returns(false);
				assert.equal(this.oVerticalLayout.getContent()[0].getId(), "objectStatus1", "then 'Object Status 1' initially at the first position in the layout");
				assert.equal(aMenuItemsForLayout.length, 0, "'getMenuItems' for formContainer returns no menu item for 'paste'");
				assert.ok(fnMoveAvailableOnRelevantContainerStub.calledOnce, "then RTAElementMover.isMoveAvailableOnRelevantContainer called once, when retrieving menu items for vertical layout");
				assert.ok(fnMoveAvailableOnChildrenStub.calledOnce, "then RTAElementMover.fnMoveAvailableOnChildren called once, when retrieving menu items for vertical layout");
				fnMoveAvailableOnRelevantContainerStub.restore();
				fnMoveAvailableOnChildrenStub.restore();

				return this.CutPastePlugin.getMenuItems([this.oObjectStatusOverlay1]);
			}.bind(this))
			.then(function(aMenuItemsForObjectStatus) {
				assert.equal(aMenuItemsForObjectStatus.length, 0, "'getMenuItems' for formElement returns no context menu item for 'cut'");
			});
		});
	});

	QUnit.module("Given a single layout without stable id", {
		async beforeEach(assert) {
			var done = assert.async();

			this.CutPastePlugin = new CutPastePlugin({
				commandFactory: oCommandFactory
			});

			sandbox.stub(Plugin.prototype, "hasChangeHandler").returns(true);

			var oObjectStatus3 = new ObjectStatus({
				text: "Text 3",
				title: "Title 3"
			});

			this.oVerticalLayoutWoStableId = new VerticalLayout({
				content: [oObjectStatus3]
			});

			this.oPage = new Page("page", {
				content: [this.oVerticalLayoutWoStableId]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage]
			});

			this.CutPastePlugin.setDesignTime(this.oDesignTime);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVericalLayoutOverlayWoStableId = OverlayRegistry.getOverlay(this.oVerticalLayoutWoStableId);
				done();
			}.bind(this));
		},

		afterEach() {
			this.oDesignTime.destroy();
			this.oPage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when retrieving the context menu items and checking if paste is available", function(assert) {
			return this.CutPastePlugin.getMenuItems([this.oVericalLayoutOverlayWoStableId])
			.then(function(aMenuItemsForLayout) {
				assert.equal(aMenuItemsForLayout.length, 0, "'getMenuItems' for formContainer returns no menu item for layout without stableid");
			});
		});
	});

	QUnit.module("Given a layout with just one object movable inside", {
		async beforeEach(assert) {
			const done = assert.async();
			this.CutPastePlugin = new CutPastePlugin({
				commandFactory: oCommandFactory
			});
			sandbox.stub(Plugin.prototype, "hasChangeHandler").resolves(true);

			this.oObjectStatus = new ObjectStatus("objectStatusSingle", {
				text: "Text Single",
				title: "Title Single"
			});
			this.oVerticalLayout = new VerticalLayout("VerticalLayoutRemoveLast", {
				content: [this.oObjectStatus]
			});
			this.oPage = new Page("pageRemoveLast", {
				content: [this.oVerticalLayout]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage],
				designTimeMetadata: {
					"sap.ui.layout.VerticalLayout": {
						aggregations: {
							content: {
								actions: {
									move: "moveControls",
									remove: {
										removeLastElement: true
									}
								}
							}
						}
					}
				},
				plugins: [new RemovePlugin({ commandFactory: oCommandFactory }), this.CutPastePlugin]
			});
			this.CutPastePlugin.setDesignTime(this.oDesignTime);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oObjectStatusOverlay = OverlayRegistry.getOverlay(this.oObjectStatus);
				done();
			}.bind(this));
		},

		afterEach() {
			this.oDesignTime.destroy();
			this.oPage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when cutting the last element and removeLastElement is true", async function(assert) {
			sandbox.stub(this.oObjectStatusOverlay, "getMovable").returns(true);

			const aMenuItems = await this.CutPastePlugin.getMenuItems([this.oObjectStatusOverlay]);
			const oCutMenuItem = aMenuItems.find(function(oItem) {
				return oItem.id === "CTX_CUT";
			});
			assert.ok(oCutMenuItem, "then the cut menu item is available");
			assert.ok(oCutMenuItem.enabled([this.oObjectStatusOverlay]), "then the cut menu item is enabled for the last element");

			// Execute cut
			oCutMenuItem.handler([this.oObjectStatusOverlay]);
			assert.ok(this.CutPastePlugin.getElementMover().getMovedOverlay(), "then the element is marked as moved");
		});

		QUnit.test("when checking cut availability with removeLastElement false", async function(assert) {
			sandbox.stub(this.oVerticalLayoutOverlay, "getMovable").returns(true);
			sandbox.stub(this.oObjectStatusOverlay, "getMovable").returns(true);
			this.oVerticalLayoutOverlay.getDesignTimeMetadata().setData({
				actions: {
					remove: {
						removeLastElement: false
					}
				}
			});
			const aMenuItems = await this.CutPastePlugin.getMenuItems([this.oVerticalLayoutOverlay]);
			const oCutMenuItem = aMenuItems.find(function(oItem) {
				return oItem.id === "CTX_CUT";
			});
			assert.strictEqual(
				oCutMenuItem !== undefined,
				true,
				"then cut menu item is returned for the layout with removeLastElement false"
			);
			assert.strictEqual(
				oCutMenuItem.enabled([this.oVerticalLayoutOverlay]),
				false,
				"then cut is disabled for the last element when removeLastElement is false"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
