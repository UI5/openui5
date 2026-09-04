/* global QUnit */

sap.ui.define([
	"sap/m/ObjectStatus",
	"sap/m/Page",
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/fl/Layer",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/CutPaste",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/plugin/RTAElementMover",
	"sap/ui/thirdparty/sinon-4"
],
function(
	ObjectStatus,
	Page,
	DtCutPaste,
	DesignTime,
	OverlayRegistry,
	OverlayUtil,
	Layer,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	CutPastePlugin,
	Plugin,
	RemovePlugin,
	RTAElementMover,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const oCommandFactory = new CommandFactory({
		flexSettings: {
			layer: Layer.VENDOR
		}
	});

	QUnit.module("CutPaste Plugin Tests", {
		beforeEach() {
			this.oCutPastePlugin = new CutPastePlugin({
				commandFactory: oCommandFactory
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When retrieving the context menu items", async function(assert) {
			assert.expect(11);
			let bIsCutAvailable = true;
			const oMockParentAggregationOverlay = {
				getDesignTimeMetadata() {}
			};
			const oMockOverlay = {
				getDesignTimeMetadata() {},
				getParentAggregationOverlay() { return oMockParentAggregationOverlay; },
				getEditableByPlugins() {
					return {
						"sap.ui.rta.plugin.CutPaste.asSibling": bIsCutAvailable,
						"sap.ui.rta.plugin.CutPaste.asChild": true
					};
				},
				isGenerallyMovable: () => bIsCutAvailable
			};

			// Cut
			sandbox.stub(this.oCutPastePlugin, "cut").callsFake(function(oOverlay) {
				assert.strictEqual(oOverlay, oMockOverlay, "the 'cut' method is called with the right overlay");
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
					this.oCutPastePlugin.getDesignTime(),
					"the 'canBeRemovedFromAggregationOnMove' function is called with the correct design time"
				);
				return true;
			}.bind(this));
			sandbox.stub(this.oCutPastePlugin, "_isPasteEditable").callsFake(function(oOverlay) {
				assert.strictEqual(
					oOverlay, oMockOverlay,
					"the 'available' function calls _isEditable when isAvailable is false, with the correct overlay"
				);
				return Promise.resolve(true);
			});

			// Paste
			sandbox.stub(this.oCutPastePlugin, "paste").callsFake(function(oOverlay) {
				assert.strictEqual(oOverlay, oMockOverlay, "the 'paste' method is called with the right overlay");
			});
			sandbox.stub(this.oCutPastePlugin, "isPasteEnabled").callsFake(function(oOverlay) {
				assert.strictEqual(oOverlay, oMockOverlay, "the 'enabled' function calls isPasteEnabled with the correct overlay");
				return Promise.resolve(true);
			});

			const aMenuItems = await this.oCutPastePlugin.getMenuItems([oMockOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_CUT", "'getMenuItems' returns a context menu item for 'cut'");
			assert.strictEqual(aMenuItems[0].aggregationRelevant, true, "the cut action is flagged as aggregation-relevant");
			await aMenuItems[0].handler([oMockOverlay], { menuItem: aMenuItems[0] });
			assert.strictEqual(
				aMenuItems[0].enabled([oMockOverlay], aMenuItems[0]), true,
				"the 'enabled' function returns true for single selection"
			);
			assert.strictEqual(aMenuItems[1].id, "CTX_PASTE", "'getMenuItems' returns a context menu item for 'paste'");
			assert.strictEqual(aMenuItems[1].aggregationRelevant, true, "the paste action is flagged as aggregation-relevant");
			await aMenuItems[1].handler([oMockOverlay], { menuItem: aMenuItems[1] });
			aMenuItems[1].enabled([oMockOverlay], aMenuItems[1]);

			bIsCutAvailable = false;
			const aMenuItems1 = await this.oCutPastePlugin.getMenuItems([oMockOverlay]);
			assert.strictEqual(aMenuItems1.length, 1, "then one menu item is returned when only paste is available");
		});

		QUnit.test("When retrieving the context menu items and a responsible element is available", async function(assert) {
			assert.expect(8);
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
				getParentAggregationOverlay() { return oMockParentAggregationOverlay; },
				getEditableByPlugins() { return { "sap.ui.rta.plugin.CutPaste.asSibling": true, "sap.ui.rta.plugin.CutPaste.asChild": true }; }
			};
			const oResponsibleElementOverlay = {
				type: "responsibleElementOverlay",
				getEditableByPlugins() { return { "sap.ui.rta.plugin.CutPaste.asSibling": true, "sap.ui.rta.plugin.CutPaste.asChild": true }; }
			};

			sandbox.stub(this.oCutPastePlugin, "isResponsibleElementActionAvailable").returns(true);
			sandbox.stub(this.oCutPastePlugin, "getResponsibleElementOverlay").returns(oResponsibleElementOverlay);
			sandbox.stub(this.oCutPastePlugin, "isAvailable").returns(true);
			sandbox.stub(OverlayUtil, "canBeRemovedFromAggregationOnMove")
			.callsFake(function(oElementOverlay, oDesignTime) {
				assert.strictEqual(
					oElementOverlay,
					oMockOverlay,
					"then canBeRemovedFromAggregationOnMove() is called with the correct overlay"
				);
				assert.strictEqual(
					oDesignTime,
					this.oCutPastePlugin.getDesignTime(),
					"then canBeRemovedFromAggregationOnMove() is called with the correct design time"
				);
				return true;
			}.bind(this));
			sandbox.stub(this.oCutPastePlugin, "_isPasteEditable").callsFake(function(oOverlay) {
				assert.strictEqual(oOverlay, oResponsibleElementOverlay, "then _isPasteEditable() is called with the responsible element overlay");
				return Promise.resolve(false);
			});

			sandbox.stub(this.oCutPastePlugin, "isPasteEnabled").callsFake(function(oOverlay) {
				assert.strictEqual(oOverlay, oResponsibleElementOverlay, "the enabled() for paste was called with the correct overlay");
			});

			const aMenuItems = await this.oCutPastePlugin.getMenuItems([oMockOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_CUT", "then getMenuItems() returns a context menu item for cut");
			assert.strictEqual(aMenuItems[0].enabled([oMockOverlay], aMenuItems[0]), true, "the enabled() returns true for single selection");
			assert.deepEqual(aMenuItems[0].responsible[0], oResponsibleElementOverlay,
				"then the cut menu item was enhanced with the responsible element overlay");
			assert.strictEqual(aMenuItems[1].id, "CTX_PASTE", "then getMenuItems() returns a context menu item for paste");
			aMenuItems[1].enabled([oResponsibleElementOverlay], aMenuItems[1]);
			assert.deepEqual(aMenuItems[1].responsible[0], oResponsibleElementOverlay,
				"then the paste menu item was enhanced with the responsible element overlay");
		});
	});

	// Integration scenario to check _isPasteEditable
	QUnit.module("Given a single layout with two elements", {
		async beforeEach(assert) {
			const done = assert.async();

			this.oCutPastePlugin = new CutPastePlugin({
				commandFactory: oCommandFactory
			});

			sandbox.stub(Plugin.prototype, "hasChangeHandler").resolves(true);

			const oObjectStatus1 = new ObjectStatus("objectStatus1", {
				text: "Text 1",
				title: "Title 1"
			});

			const oObjectStatus2 = new ObjectStatus("objectStatus2", {
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

			this.oCutPastePlugin.setDesignTime(this.oDesignTime);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
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
		QUnit.test("when retrieving the context menu items and checking if paste is available", async function(assert) {
			const oMoveAvailableOnRelevantContainerStub =
				sandbox.stub(this.oCutPastePlugin.getElementMover(), "isMoveAvailableOnRelevantContainer").resolves(true);
			const oMoveAvailableOnChildrenStub =
				sandbox.stub(this.oCutPastePlugin.getElementMover(), "isMoveAvailableForChildren").returns(true);
			const aMenuItemsForLayout = await this.oCutPastePlugin.getMenuItems([this.oVerticalLayoutOverlay]);
			sandbox.stub(this.oVerticalLayoutOverlay, "getMovable").returns(false);
			sandbox.stub(this.oObjectStatusOverlay1, "getMovable").returns(true);
			assert.strictEqual(
				this.oVerticalLayout.getContent()[0].getId(), "objectStatus1",
				"then 'Object Status 1' initially at the first position in the layout"
			);
			assert.strictEqual(
				aMenuItemsForLayout[0].id, "CTX_PASTE",
				"'getMenuItems' for formContainer returns a context menu item for 'paste'"
			);
			assert.notOk(
				aMenuItemsForLayout[0].enabled([this.oVerticalLayoutOverlay], aMenuItemsForLayout[0]),
				"'paste' is disabled for the formContainer"
			);
			oMoveAvailableOnRelevantContainerStub.restore();
			oMoveAvailableOnChildrenStub.restore();

			const aMenuItemsForObjectStatus = await this.oCutPastePlugin.getMenuItems([this.oObjectStatusOverlay1]);
			assert.strictEqual(aMenuItemsForObjectStatus[0].id, "CTX_CUT", "'getMenuItems' for object status returns a menu item for cut");
			await aMenuItemsForObjectStatus[0].handler([this.oObjectStatusOverlay1], { menuItem: aMenuItemsForObjectStatus[0] });

			const aMenuItemsForLayout1 = await this.oCutPastePlugin.getMenuItems([this.oVerticalLayoutOverlay]);
			assert.ok(
				aMenuItemsForLayout1[0].enabled([this.oVerticalLayoutOverlay], aMenuItemsForLayout1[0]),
				"'paste' is enabled for the layout"
			);
			await aMenuItemsForLayout1[0].handler([this.oVerticalLayoutOverlay], { menuItem: aMenuItemsForLayout1[0] });
			assert.strictEqual(
				this.oVerticalLayout.getContent()[0].getId(), "objectStatus1",
				"then object status now pasted at the first position"
			);
		});

		QUnit.test("when retrieving the context menu items with no move action available for children", async function(assert) {
			sandbox.stub(this.oCutPastePlugin.getElementMover(), "isMoveAvailableOnRelevantContainer").resolves(true);
			sandbox.stub(this.oCutPastePlugin.getElementMover(), "isMoveAvailableForChildren").returns(false);

			const aMenuItemsForLayout = await this.oCutPastePlugin.getMenuItems([this.oVerticalLayoutOverlay]);
			assert.strictEqual(aMenuItemsForLayout.length, 0, "getMenuItems for layout returns no menu items");
		});

		[
			{
				title: "with cut editable",
				isEditable: true,
				isMoveAvailableContainer: false,
				isMoveAvailableChildren: false,
				resultAsSibling: true,
				resultAsChild: true
			},
			{
				title: "with cut not editable and move available on container",
				isEditable: false,
				isMoveAvailableContainer: true,
				isMoveAvailableChildren: false,
				resultAsSibling: false,
				resultAsChild: false
			},
			{
				title: "with cut not editable and move available on children",
				isEditable: false,
				isMoveAvailableContainer: false,
				isMoveAvailableChildren: true,
				resultAsSibling: false,
				resultAsChild: false
			},
			{
				title: "with cut not editable and move available on container and children",
				isEditable: false,
				isMoveAvailableContainer: true,
				isMoveAvailableChildren: true,
				resultAsSibling: false,
				resultAsChild: true
			},
			{
				title: "with nothing editable",
				isEditable: false,
				isMoveAvailableContainer: false,
				isMoveAvailableChildren: false,
				resultAsSibling: false,
				resultAsChild: false
			}
		].forEach((oSetup) => {
			QUnit.test(`when checking _isEditable ${oSetup.title}`, async function(assert) {
				this.oEMIsEditableStub = sandbox.stub(RTAElementMover.prototype, "isEditable").resolves(oSetup.isEditable);
				this.oEMIsMoveAvailableOnContainerStub = sandbox.stub(RTAElementMover.prototype, "isMoveAvailableOnRelevantContainer")
				.resolves(oSetup.isMoveAvailableContainer);
				this.oEMIsMoveAvailableOnChildrenStub = sandbox.stub(RTAElementMover.prototype, "isMoveAvailableForChildren")
				.resolves(oSetup.isMoveAvailableChildren);

				const oIsEditable = await this.oCutPastePlugin._isEditable(this.oVerticalLayoutOverlay, {});
				assert.strictEqual(oIsEditable.asSibling, oSetup.resultAsSibling, "the cut action is editable");
				assert.strictEqual(oIsEditable.asChild, oSetup.resultAsChild, "the paste action is editable");
			});
		});
	});

	QUnit.module("Given a single layout without stable id", {
		async beforeEach(assert) {
			const done = assert.async();

			this.oCutPastePlugin = new CutPastePlugin({
				commandFactory: oCommandFactory
			});

			sandbox.stub(Plugin.prototype, "hasChangeHandler").returns(true);

			const oObjectStatus3 = new ObjectStatus({
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

			this.oCutPastePlugin.setDesignTime(this.oDesignTime);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVerticalLayoutOverlayWoStableId = OverlayRegistry.getOverlay(this.oVerticalLayoutWoStableId);
				done();
			}.bind(this));
		},

		afterEach() {
			this.oDesignTime.destroy();
			this.oPage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when retrieving the context menu items and checking if paste is available", async function(assert) {
			const aMenuItemsForLayout = await this.oCutPastePlugin.getMenuItems([this.oVerticalLayoutOverlayWoStableId]);
			assert.strictEqual(aMenuItemsForLayout.length, 0, "getMenuItems for layout without stable id returns no menu item");
		});
	});

	QUnit.module("Given a layout with just one object movable inside", {
		async beforeEach(assert) {
			const done = assert.async();
			this.oCutPastePlugin = new CutPastePlugin({
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
				plugins: [new RemovePlugin({ commandFactory: oCommandFactory }), this.oCutPastePlugin]
			});
			this.oCutPastePlugin.setDesignTime(this.oDesignTime);

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

			const aMenuItems = await this.oCutPastePlugin.getMenuItems([this.oObjectStatusOverlay]);
			const oCutMenuItem = aMenuItems.find(function(oItem) {
				return oItem.id === "CTX_CUT";
			});
			assert.ok(oCutMenuItem, "then the cut menu item is available");
			assert.ok(oCutMenuItem.enabled([this.oObjectStatusOverlay], oCutMenuItem), "then the cut menu item is enabled for the last element");

			// Execute cut
			await oCutMenuItem.handler([this.oObjectStatusOverlay], { menuItem: oCutMenuItem });
			assert.ok(this.oCutPastePlugin.getElementMover().getMovedOverlay(), "then the element is marked as moved");
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
			const aMenuItems = await this.oCutPastePlugin.getMenuItems([this.oVerticalLayoutOverlay]);
			const oCutMenuItem = aMenuItems.find(function(oItem) {
				return oItem.id === "CTX_CUT";
			});
			assert.strictEqual(
				oCutMenuItem !== undefined,
				true,
				"then cut menu item is returned for the layout with removeLastElement false"
			);
			assert.strictEqual(
				oCutMenuItem.enabled([this.oVerticalLayoutOverlay], oCutMenuItem),
				false,
				"then cut is disabled for the last element when removeLastElement is false"
			);
		});
	});

	QUnit.module("Given a layout with three elements, when createCommands is called directly", {
		async beforeEach(assert) {
			const done = assert.async();
			this.oCutPastePlugin = new CutPastePlugin({
				commandFactory: oCommandFactory
			});
			sandbox.stub(Plugin.prototype, "hasChangeHandler").resolves(true);

			this.oStatus1 = new ObjectStatus("ccStatus1", { text: "1" });
			this.oStatus2 = new ObjectStatus("ccStatus2", { text: "2" });
			this.oStatus3 = new ObjectStatus("ccStatus3", { text: "3" });
			this.oVerticalLayout = new VerticalLayout("ccLayout", {
				content: [this.oStatus1, this.oStatus2, this.oStatus3]
			});
			this.oPage = new Page("ccPage", {
				content: [this.oVerticalLayout]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage]
			});
			this.oCutPastePlugin.setDesignTime(this.oDesignTime);

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oStatus1Overlay = OverlayRegistry.getOverlay(this.oStatus1);

				const oElementMover = this.oCutPastePlugin.getElementMover();
				// Let cut() activate the real target zones (so the layout's "content" aggregation
				// is recognized as a valid drop zone) and set the moved overlay for real by marking
				// the source movable. Only the actual DOM move and the command build are stubbed,
				// so the test still isolates the index -> insert/reposition decision by asserting
				// on the mover primitive arguments.
				sandbox.stub(this.oStatus1Overlay, "isMovable").returns(true);
				sandbox.stub(oElementMover, "buildMoveCommand").resolves({});
				this.oInsertIntoStub = sandbox.stub(oElementMover, "insertInto");
				this.oRepositionOnStub = sandbox.stub(oElementMover, "repositionOn");
				done();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oPage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when targetIndex is 0", async function(assert) {
			await this.oCutPastePlugin.createCommands(this.oStatus1Overlay, {
				targetId: this.oVerticalLayout.getId(),
				targetAggregation: "content",
				targetIndex: 0
			});
			assert.strictEqual(this.oInsertIntoStub.callCount, 1, "then insertInto is used");
			assert.strictEqual(this.oInsertIntoStub.getCall(0).args[2], false, "then it inserts at the start (bInsertAtEnd=false)");
			assert.strictEqual(this.oRepositionOnStub.callCount, 0, "then repositionOn is not used");
		});

		QUnit.test("when targetIndex is past the end", async function(assert) {
			// moved element is excluded from the sibling list, leaving [status2, status3] (length 2)
			await this.oCutPastePlugin.createCommands(this.oStatus1Overlay, {
				targetId: this.oVerticalLayout.getId(),
				targetAggregation: "content",
				targetIndex: 5
			});
			assert.strictEqual(this.oInsertIntoStub.callCount, 1, "then insertInto is used");
			assert.strictEqual(this.oInsertIntoStub.getCall(0).args[2], true, "then it appends at the end (bInsertAtEnd=true)");
			assert.strictEqual(this.oRepositionOnStub.callCount, 0, "then repositionOn is not used");
		});

		QUnit.test("when targetIndex is omitted", async function(assert) {
			await this.oCutPastePlugin.createCommands(this.oStatus1Overlay, {
				targetId: this.oVerticalLayout.getId(),
				targetAggregation: "content"
			});
			assert.strictEqual(this.oInsertIntoStub.callCount, 1, "then insertInto is used");
			assert.strictEqual(this.oInsertIntoStub.getCall(0).args[2], false, "then it inserts at the start (bInsertAtEnd=false)");
		});

		QUnit.test("when targetIndex is an arbitrary position in the middle", async function(assert) {
			// other siblings (excluding the moved status1) are [status2, status3];
			// targetIndex 1 -> reposition after the sibling at index 0 (status2)
			await this.oCutPastePlugin.createCommands(this.oStatus1Overlay, {
				targetId: this.oVerticalLayout.getId(),
				targetAggregation: "content",
				targetIndex: 1
			});
			assert.strictEqual(this.oInsertIntoStub.callCount, 0, "then insertInto is not used");
			assert.strictEqual(this.oRepositionOnStub.callCount, 1, "then repositionOn is used");
			assert.strictEqual(
				this.oRepositionOnStub.getCall(0).args[1],
				OverlayRegistry.getOverlay(this.oStatus2),
				"then it repositions relative to the sibling at index targetIndex-1 (status2)"
			);
			assert.strictEqual(this.oRepositionOnStub.getCall(0).args[2], true, "then it inserts after that sibling (bInsertAfter=true)");
		});

		QUnit.test("when the target id does not resolve to an overlay", async function(assert) {
			await this.oCutPastePlugin.createCommands(this.oStatus1Overlay, {
				targetId: "doesNotExist"
			}).then(function() {
				assert.ok(false, "then the promise should not resolve");
			}).catch(function(oError) {
				assert.ok(oError instanceof Error, "then createCommands rejects with an error");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
