/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/base/Log",
	"sap/m/StandardTreeItem",
	"sap/m/StandardListItem",
	"sap/m/Tree",
	"sap/m/ListBase",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Element, Library, createAndAppendDiv, qutils, KeyCodes, JSONModel, Sorter, Log, StandardTreeItem, StandardListItem, Tree, ListBase, library, nextUIUpdate) {
	"use strict";
	createAndAppendDiv("content").style.height = "100%";

	const IMAGE_PATH = "test-resources/sap/m/images/";
	const oData = [
		{
			text: "Node1",
			ref: IMAGE_PATH + "action.png",
			nodes: [
				{
					text: "Node1-1",
					ref: IMAGE_PATH + "action.png"
				},
				{
					text: "Node1-2",
					ref: IMAGE_PATH + "action.png",
					nodes: [
						{
							text: "Node1-2-1",
							ref: IMAGE_PATH + "action.png",
							nodes: [
							{
								text: "Node1-2-1-1",
								ref: IMAGE_PATH + "action.png"
							}]
						},
						{
							text: "Node1-2-2",
							ref: IMAGE_PATH + "action.png"
						}
					]
				}
			]
		},
		{
			text: "Node2",
			ref: IMAGE_PATH + "action.png",
			nodes: [
				{
					text: "Node2-1",
					ref: IMAGE_PATH + "action.png",
					nodes: [
							{
								text: "Node2-1-1",
								ref: IMAGE_PATH + "action.png",
								nodes: [
										{
											text: "Node2-1-1-1",
											ref: IMAGE_PATH + "action.png",
											nodes: [
													{
														text: "Node2-1-1-1-1",
														ref: IMAGE_PATH + "action.png",
														nodes: [
																{
																	text: "Node2-1-1-1-1-1",
																	ref: IMAGE_PATH + "action.png",
																	nodes: [
																		{
																			text: "Node2-1-1-1-1-1-1",
																			ref: IMAGE_PATH + "action.png",
																			nodes: [
																				{
																					text: "Node2-1-1-1-1-1-1-1",
																					ref: IMAGE_PATH + "action.png",
																					nodes: [
																						{
																							text: "Node2-1-1-1-1-1-1-1-1",
																							ref: IMAGE_PATH + "action.png"
																						}]
																				}]
																		}]
																}]
													}]
										}]
							}]
				}]
		}
	];

	const oData2 = [
		{
			text: "Node1",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node2",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node3",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node4",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node5",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node6",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node7",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node8",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node9",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node10",
			ref: IMAGE_PATH + "action.png"
		}
	];

	async function createTree() {
		const oTreeItem = new StandardTreeItem({title: "{text}", icon: "{ref}"});
		const oTree = new Tree();
		const oModel = new JSONModel();

		oTree.setModel(oModel);
		//set the data to the model
		oModel.setData(oData);
		oTree.bindItems("/", oTreeItem);
		oTree.placeAt("content");
		await nextUIUpdate();

		return oTree;
	}

	function assertToggleOpenStateParameters(assert, oTree, iIndex, bExpanded, mActualParameters) {
		assert.deepEqual(mActualParameters, {
			id: oTree.getId(),
			itemIndex: iIndex,
			itemContext: oTree.getItems()[iIndex].getBindingContext(oTree.getBindingInfo("items").model),
			expanded: bExpanded
		}, "The toggleOpenState event was called with the correct parameters");
	}

	/*
	//================================================================================
	//qunit checks
	//================================================================================
	*/

	QUnit.module("Rendering", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Tree items rendering", function(assert) {
		const oTree = this.oTree;
		assert.ok(document.getElementById(oTree.getItems()[0].getId()), "initial render of first node");
		assert.ok(document.getElementById(oTree.getItems()[1].getId()), "initial render of second node");
		assert.ok(document.getElementById(oTree.getItems()[0].getId() + "-icon"), "icon is rendered");

		const oImage = Element.getElementById(oTree.getItems()[0].getId() + "-icon");
		assert.strictEqual(oImage.getSrc(), IMAGE_PATH + "action.png", "icon source is correct");
	});

	QUnit.module("Indentation", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Indentation of tree nodes", async function(assert) {
		const oTree = this.oTree;
		assert.equal(oTree.getDeepestLevel(), 0, "deepestLevel");

		let oArrow = Element.getElementById(oTree.getItems()[1].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getDeepestLevel(), 1, "deepestLevel");
		assert.equal(oTree.getItems()[1].$().css("padding-inline-start"), "0px", "padding");
		assert.equal(oTree.getItems()[2].$().css("padding-inline-start"), "24px", "padding");

		oArrow = Element.getElementById(oTree.getItems()[2].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getDeepestLevel(), 2, "deepestLevel");
		assert.equal(oTree.getItems()[1].$().css("padding-inline-start"), "0px", "padding");
		assert.equal(oTree.getItems()[2].$().css("padding-inline-start"), "16px", "padding");
		assert.equal(oTree.getItems()[3].$().css("padding-inline-start"), "32px", "padding");

		oArrow = Element.getElementById(oTree.getItems()[3].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getDeepestLevel(), 3, "deepestLevel");
		assert.equal(oTree.getItems()[1].$().css("padding-inline-start"), "0px", "padding");
		assert.equal(oTree.getItems()[2].$().css("padding-inline-start"), "8px", "padding");
		assert.equal(oTree.getItems()[3].$().css("padding-inline-start"), "16px", "padding");
		assert.equal(oTree.getItems()[4].$().css("padding-inline-start"), "24px", "padding");

		oArrow = Element.getElementById(oTree.getItems()[4].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		oArrow = Element.getElementById(oTree.getItems()[5].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		oArrow = Element.getElementById(oTree.getItems()[6].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getDeepestLevel(), 6, "deepestLevel");
		assert.equal(oTree.getItems()[1].$().css("padding-inline-start"), "0px", "padding");
		assert.equal(oTree.getItems()[2].$().css("padding-inline-start"), "4px", "padding");
		assert.equal(oTree.getItems()[3].$().css("padding-inline-start"), "8px", "padding");
		assert.equal(oTree.getItems()[4].$().css("padding-inline-start"), "12px", "padding");
		assert.equal(oTree.getItems()[5].$().css("padding-inline-start"), "16px", "padding");
		assert.equal(oTree.getItems()[6].$().css("padding-inline-start"), "20px", "padding");

		// collapse
		const oArrowDomRef = oTree.getItems()[2].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		await nextUIUpdate();

		//expand
		oArrow = Element.getElementById(oTree.getItems()[2].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getItems()[2].$().css("padding-inline-start"), "4px", "padding");

		oTree.collapseAll();
	});

	QUnit.test("expandToLevel deep and initial indentation", async function(assert) {
		const aIndentations = [
			0,   // Root
			1.5, // Level 1
			1,   // Level 2
			0.5, // Level 3
			0.5, // Level 4
			0.5, // Level 5
			0.25,// Level 6
			0.25,// Level 7
			0.25 // Level 8
		];

		const assertIndentation = (iPaddingStep) => {
			const aItems = this.oTree.getItems();
			const oStartItem = aItems.find((oItem) => oItem.getTitle() === "Node2");
			const iStartIndex = aItems.indexOf(oStartItem);

			for (let i = iStartIndex, iExpectedPadding = 0; i < aItems.length; i++, iExpectedPadding += iPaddingStep) {
				assert.equal(
					aItems[i].getDomRef().style.paddingInlineStart,
					`${iExpectedPadding}rem`,
					`Item at index ${i} has correct indentation`
				);
			}
		};

		for (const [iLevel, fIndentation] of aIndentations.entries()) {
			this.oTree.expandToLevel(iLevel);
			await nextUIUpdate();
			assert.equal(this.oTree.getDeepestLevel(), iLevel, `deepestLevel is ${iLevel}`);
			assertIndentation(fIndentation);
		}

		for (const [iLevel, fIndentation] of aIndentations.entries()) {
			const oTreeItem = new StandardTreeItem({title: "{text}"});
			this.oTree.bindItems({
				path: "/",
				template: oTreeItem,
				parameters: {
					numberOfExpandedLevels: iLevel
				}
			});
			await nextUIUpdate();
			assert.equal(this.oTree.getDeepestLevel(), iLevel, `deepestLevel is ${iLevel}`);
			assertIndentation(fIndentation);
		}
	});

	QUnit.module("Selection", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Single selection", function(assert) {
		const oTree = this.oTree;
		oTree.setMode(library.ListMode.SingleSelect);
		oTree.getItems()[0].setSelected(true);
		assert.ok(oTree.getItems()[0].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[0].getItemNodeContext().nodeState.selected, "item context is selected");
	});

	QUnit.test("Multi selection", function(assert) {
		const oTree = this.oTree;
		oTree.setMode(library.ListMode.MultiSelect);
		oTree.getItems()[0].setSelected(true);
		oTree.getItems()[1].setSelected(true);
		assert.ok(oTree.getItems()[0].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[0].getItemNodeContext().nodeState.selected, "item context is selected");
		assert.ok(oTree.getItems()[1].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[1].getItemNodeContext().nodeState.selected, "item context is selected");

		oTree.removeSelections(true);
		assert.notOk(oTree.getItems()[0].getSelected(),"tree item is not selected.");
		assert.notOk(oTree.getItems()[0].getItemNodeContext().nodeState.selected, "item context is not selected");
		assert.notOk(oTree.getItems()[1].getSelected(),"tree item is not selected.");
		assert.notOk(oTree.getItems()[1].getItemNodeContext().nodeState.selected, "item context is not selected");
	});

	QUnit.module("Accessibility", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Custom announcement on focus", function(assert) {
		const oTreeItem = this.oTree.getItems()[1];
		oTreeItem.focus();
		assert.equal(oTreeItem.getAccessibilityInfo().description, "Node2", "Custom announcement is added without selected state");
	});

	QUnit.test("applyAriaRole should not have effect on Tree control", async function(assert) {
		const oMyTree = new Tree(),
			oTemplate = new StandardTreeItem({
				title: "{title}"
			}),
			aTreeData = [{
				"title": "C",
				"titles": [
					{"title": "Subtitle C"}
				]
			}, {
				"title": "B",
				"titles": [
					{"title": "SubTitle B"}
				]
			}, {
				"title": "A"
			}];

		const oModel = new JSONModel();
		oModel.setData(aTreeData);
		oMyTree.setModel(oModel);

		oMyTree.bindItems({
			path: "/",
			template: oTemplate
		});

		assert.strictEqual(oMyTree.getAriaRole(), "tree", "role='tree' returned");

		oMyTree.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.strictEqual(oMyTree.getDomRef("listUl").getAttribute("role"), oMyTree.getAriaRole(), "role='tree' not affected in DOM");
		assert.strictEqual(oMyTree.getItems()[0].getDomRef().getAttribute("role"), "treeitem", "role='treeitem', tree item is also not affected in DOM");
		oMyTree.destroy();
	});

	QUnit.module("Expanded state", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Expand/Collapse", async function(assert) {
		const oTree = this.oTree;
		const oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTree.attachToggleOpenState(oToggleOpenStateEventSpy);

		//initial state
		assert.strictEqual(oTree.getItems().length, 2, "two nodes displayed before tree expanding");
		assert.equal(oTree.getItems()[0].getDomRef().getAttribute("aria-posinset"), 1, "aria-posinset is set for the item 1");
		assert.equal(oTree.getItems()[0].getDomRef().getAttribute("aria-setsize"), 2, "aria-setsize is set for the item 1");
		assert.equal(oTree.getItems()[1].getDomRef().getAttribute("aria-posinset"), 2, "aria-posinset is set for the item 2");
		assert.equal(oTree.getItems()[1].getDomRef().getAttribute("aria-setsize"), 2, "aria-setsize is set for the item 2");

		oTree.focus();
		assert.strictEqual(oTree.getItems()[0].$().attr("aria-expanded"), "false", "aria-expanded is false");

		let oArrow = Element.getElementById(oTree.getItems()[0].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.strictEqual(oTree.getItems().length, 4, "four nodes displayed after tree expanding");
		assert.equal(oTree.getItems()[0].getLevel(), 0, "first level node is in level 0");
		assert.equal(oTree.getItems()[1].getLevel(), 1, "second node is in level 1");
		assert.strictEqual(oTree.getItems()[0].$().attr("aria-expanded"), "true", "aria-expanded is true");
		assert.equal(oTree.getItems()[0].getDomRef().getAttribute("aria-posinset"), 1, "aria-posinset is set for the item 1");
		assert.equal(oTree.getItems()[0].getDomRef().getAttribute("aria-setsize"), 2, "aria-setsize is set for the item 1");
		assert.equal(oTree.getItems()[1].getDomRef().getAttribute("aria-posinset"), 1, "aria-posinset is set for the item 2");
		assert.equal(oTree.getItems()[1].getDomRef().getAttribute("aria-setsize"), 2, "aria-setsize is set for the item 2");
		assert.equal(oTree.getItems()[2].getDomRef().getAttribute("aria-posinset"), 2, "aria-posinset is set for the item 3");
		assert.equal(oTree.getItems()[2].getDomRef().getAttribute("aria-setsize"), 2, "aria-setsize is set for the item 3");
		assert.equal(oTree.getItems()[3].getDomRef().getAttribute("aria-posinset"), 2, "aria-posinset is set for the item 4");
		assert.equal(oTree.getItems()[3].getDomRef().getAttribute("aria-setsize"), 2, "aria-setsize is set for the item 4");

		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, oTree, 0, true, oToggleOpenStateEventSpy._mEventParameters);

		let oArrowDomRef = oTree.getItems()[1].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "Clicked a leaf: The toggleOpenState event was not called");

		oToggleOpenStateEventSpy.reset();
		oArrowDomRef = oTree.getItems()[1].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		assert.ok(oToggleOpenStateEventSpy.notCalled, "Clicked a leaf: The toggleOpenState event was not called");

		//back to initial state
		assert.strictEqual(oTree.getItems().length, 4, "four nodes before tree expanding");

		oTree.focus();
		oArrow = Element.getElementById(oTree.getItems()[0].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.strictEqual(oTree.getItems().length, 2, "two nodes displayed after tree collapsing");

		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, oTree, 0, false, oToggleOpenStateEventSpy._mEventParameters);

		oTree.detachToggleOpenState(oToggleOpenStateEventSpy);
	});

	QUnit.test("Expand to level and tree item expander tooltip test", async function(assert) {
		const oTree = this.oTree;
		const oBundle = Library.getResourceBundleFor("sap.m");
		assert.strictEqual(oTree.getItems()[0]._oExpanderControl.getTooltip(), oBundle.getText("TREE_ITEM_EXPAND_NODE"), "Tooltip is correctly set to the Expander control");
		oTree.expandToLevel(3);
		await nextUIUpdate();
		assert.ok(oTree.getItems()[0].getExpanded(),"node is expanded");
		assert.strictEqual(oTree.getItems()[0]._oExpanderControl.getTooltip(), oBundle.getText("TREE_ITEM_COLLAPSE_NODE"), "Tooltip for the Expander control updated correctly");
		assert.equal(oTree.getItems()[4].getLevel(), 3, "expand to level 3");
	});

	QUnit.test("Collapse all", function(assert) {
		const oTree = this.oTree;
		oTree.collapseAll();
		assert.ok(!oTree.getItems()[0].getExpanded(),"node is expanded");
		assert.equal(oTree.getItems().length, 2, "node is collapsed");
	});

	QUnit.test("Expand/collapse multiple nodes", async function(assert) {
		const oTree = this.oTree;
		oTree.expand([0,1]);
		await nextUIUpdate();

		assert.equal(oTree.getItems().length, 5, "multiple expanding success.");

		oTree.collapse([0,3]);
		await nextUIUpdate();

		assert.equal(oTree.getItems().length, 2, "multiple collapsing success.");
	});

	QUnit.module("API", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("isLeaf/isTopLevel/getExpanded", function(assert) {
		const oTree = this.oTree;
		oTree.focus();
		let oArrow = Element.getElementById(oTree.getItems()[0].getId() + "-expander");
		oArrow.firePress();
		assert.ok(oTree.getItems()[1].getParentNode().getId(), oTree.getItems()[0].getId(), "parent node is found.");

		assert.ok(!oTree.getItems()[0].isLeaf(), "first node is not leaf.");
		assert.ok(oTree.getItems()[1].isLeaf(), "second node is leaf.");

		assert.ok(oTree.getItems()[0].isTopLevel(), "first node is root.");
		assert.ok(!oTree.getItems()[1].isTopLevel(), "second node is not root.");

		oTree.focus();
		oArrow = Element.getElementById(oTree.getItems()[0].getId() + "-expander");
		oArrow.firePress();
		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		assert.ok(!oTree.getItems()[1].getExpanded(), "second node is not expanded");
	});

	QUnit.module("Keyboard Handling", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Right + Left key", function(assert) {
		const oTree = this.oTree;
		const oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTree.attachToggleOpenState(oToggleOpenStateEventSpy);

		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		oTree.focus();
		const oArrowDomRef = oTree.getItems()[0].$();

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_RIGHT);
		assert.ok(oTree.getItems()[0].getExpanded(), "first node is expanded");
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, oTree, 0, true, oToggleOpenStateEventSpy._mEventParameters);

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_RIGHT);
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was not called as the node already was expanded");

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_LEFT);
		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		assert.ok(oToggleOpenStateEventSpy.calledTwice, "The toggleOpenState event was called twice");
		assertToggleOpenStateParameters(assert, oTree, 0, false, oToggleOpenStateEventSpy._mEventParameters);

		oTree.detachToggleOpenState(oToggleOpenStateEventSpy);
	});

	QUnit.module("Aggregation");

	QUnit.test("Validate aggregation", function(assert) {
		assert.throws(function () {
			const oTreeItem = new StandardListItem();
			const oTree = new Tree();
			oTree.addItem(oTreeItem);
		}, "Wrong aggregation object.");
	});

	QUnit.module("NoData", {
		beforeEach: async function () {
			this.oTree = new Tree();
			this.oTree.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Nodata should have the role treeitem", function(assert) {
		assert.equal(this.oTree.getDomRef("nodata").getAttribute("role"), "treeitem");
	});

	QUnit.module("Binding", {
		beforeEach: async function() {
			this.oTree = await createTree();
		},
		afterEach: function() {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("data binding update", async function(assert) {
		const oTree = this.oTree;
		assert.equal(oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander").control(0).getSrc(), "sap-icon://navigation-right-arrow", "initial binding context.");

		oTree.getModel().setProperty("/", oData2);
		await nextUIUpdate();

		assert.ok(oTree.getItems()[0].$().hasClass("sapMTreeItemBaseLeaf"), "data changed");
		assert.equal(oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander").control(0).getSrc(), "sap-icon://navigation-right-arrow", "icon has correct source.");
	});

	QUnit.test("context length", function(assert) {
		const oTree = this.oTree;
		oTree.expandToLevel(3);
		assert.strictEqual(oTree.getItems().length, 10, "initial length is 10.");

		oTree.getModel().setSizeLimit(6);
		oTree.getModel().refresh(true);

		assert.strictEqual(oTree.getItems().length, 6, "new length is 6.");
	});

	QUnit.test("Sorting scenario", async function(assert) {
		const aTreeData = [{
			"title": "C",
			"titles": [
				{"title": "Subtitle C"}
			]
		}, {
			"title": "B",
			"titles": [
				{"title": "SubTitle B"}
			]
		}, {
			"title": "A"
		}];
		const oTree = this.oTree;

		oTree.getModel().setData(aTreeData);
		oTree.expandToLevel(1);
		await nextUIUpdate();

		// 2nd tree item is a leaf node
		const oSecondItem = oTree.getItems()[1];
		const oSecondItemDomRef = oSecondItem.getDomRef();
		assert.ok(!oSecondItem.isTopLevel(), "2nd item is not a top level node");
		assert.ok(oSecondItem.isLeaf(), "2nd item is a leaf node");
		assert.ok(oSecondItemDomRef.classList.contains("sapMTreeItemBaseChildren"), "Second item is a child node");
		assert.ok(oSecondItemDomRef.getAttribute("aria-level"), "2", "aria-level = 2");

		// sort tree items in ascending order
		const oBinding = oTree.getBinding("items");
		const oSorter = new Sorter("title", false);
		oBinding.sort(oSorter);
		await nextUIUpdate();

		// 2nd tree item becomes a top level node after sorting is applied
		assert.ok(oSecondItem.isTopLevel(), "2nd item is a top level node");
		assert.ok(!oSecondItem.isLeaf(), "2nd item is not a leaf node");
		assert.ok(!oSecondItemDomRef.classList.contains("sapMTreeItemBaseChildren"), "Second item is a top level node");
		assert.ok(oSecondItemDomRef.getAttribute("aria-level"), "1", "aria-level = 1");
	});

	QUnit.module("getBinding adapter selection", {
		beforeEach: function() {
			this.oTree = new Tree();
		},
		afterEach: function() {
			this.oTree.destroy();
		}
	});

	QUnit.test("getBinding defaults to 'items' when no name is given", function(assert) {
		const oModel = new JSONModel();
		oModel.setData(oData);
		this.oTree.setModel(oModel);
		this.oTree.bindItems("/", new StandardTreeItem({title: "{text}"}));

		const oBindingViaItems = this.oTree.getBinding("items");
		const oBindingDefault = this.oTree.getBinding();
		assert.strictEqual(oBindingDefault, oBindingViaItems, "getBinding() returns the same binding as getBinding('items')");
	});

	QUnit.test("getBinding returns the binding for non-'items' aggregations as-is", function(assert) {
		// Returning a fake v2 ODataTreeBinding-shaped object lets us prove the Tree
		// did NOT touch it: applyAdapterInterface must remain uncalled and Log.error
		// must NOT be invoked, regardless of the binding's shape.
		const oFakeBinding = {
			isA: this.spy((sName) => sName === "sap.ui.model.odata.v2.ODataTreeBinding"),
			applyAdapterInterface: this.spy()
		};
		const oListBaseStub = this.stub(ListBase.prototype, "getBinding").returns(oFakeBinding);
		const oLogStub = this.stub(Log, "error");
		const oResult = this.oTree.getBinding("tooltip");

		assert.strictEqual(oResult, oFakeBinding, "Returns ListBase's binding without modification");
		assert.ok(oListBaseStub.calledOnceWithExactly("tooltip"), "ListBase.getBinding called with 'tooltip'");
		assert.notOk(oFakeBinding.applyAdapterInterface.called, "Adapter interface not applied for non-'items' binding");
		assert.notOk(oFakeBinding.isA.called, "Adapter dispatch (isA checks) not entered for non-'items' binding");
		assert.notOk(oLogStub.called, "No 'TreeBinding is not supported' error logged for non-'items' binding");
	});

	QUnit.test("getBinding applies ODataTreeBinding v2 adapter", function(assert) {
		// Stub ListBase.getBinding to return a fake v2 ODataTreeBinding (no getLength yet)
		const oFakeBinding = {
			isA: function(sName) {
				return sName === "sap.ui.model.odata.v2.ODataTreeBinding";
			},
			applyAdapterInterface: this.spy()
		};
		this.stub(this.oTree, "getBindingInfo").returns({});
		this.stub(ListBase.prototype, "getBinding").returns(oFakeBinding);

		const oResult = this.oTree.getBinding("items");
		assert.strictEqual(oResult, oFakeBinding, "binding returned");
		assert.ok(oFakeBinding.applyAdapterInterface.calledOnce, "applyAdapterInterface called for v2 ODataTreeBinding");
	});

	/**
	 * @deprecated As of version 1.96.
	 * See {@link sap.ui.model.TreeBindingCompatibilityAdapter}.
	 */
	QUnit.test("getBinding applies legacy ODataTreeBinding compatibility adapter", function(assert) {
		// TreeBindingCompatibilityAdapter mutates the binding.
		// Provide just enough surface on the binding and the tree for that call to
		// complete without throwing, then assert on the observable mutations.
		const oFakeBinding = {
			isA: (sName) => sName === "sap.ui.model.odata.ODataTreeBinding",
			getRootContexts: () => []
		};
		this.stub(ListBase.prototype, "getBinding").returns(oFakeBinding);
		this.oTree.getExpandFirstLevel = () => false;

		const oResult = this.oTree.getBinding("items");

		assert.strictEqual(oResult, oFakeBinding, "binding returned");
		// The adapter installs the ListBinding-compatibility surface on the binding.
		// If Tree took the wrong dispatch branch, none of these methods would exist.
		assert.strictEqual(typeof oFakeBinding.getLength, "function", "adapter installed getLength");
		assert.strictEqual(typeof oFakeBinding.getContexts, "function", "adapter installed getContexts");
		assert.strictEqual(typeof oFakeBinding.expand, "function", "adapter installed expand");
		assert.strictEqual(typeof oFakeBinding.collapse, "function", "adapter installed collapse");
	});

	QUnit.test("getBinding logs error for unsupported binding types", function(assert) {
		const oFakeBinding = {
			isA: function() {return false;}
		};
		this.stub(ListBase.prototype, "getBinding").returns(oFakeBinding);
		const oLogSpy = this.spy(Log, "error");

		const oResult = this.oTree.getBinding("items");
		assert.strictEqual(oResult, oFakeBinding, "Binding returned");
		assert.ok(oLogSpy.calledOnce, "Log.error called for unsupported binding");
		assert.ok(oLogSpy.firstCall.args[0].indexOf("TreeBinding is not supported") === 0, "correct error message");
	});

	QUnit.module("Aggregation handling", {
		beforeEach: async function() {
			this.oTree = await createTree();
		},
		afterEach: function() {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("updateAggregation delegates non-'items' aggregations to ListBase", function(assert) {
		const oTree = this.oTree;
		const oParentSpy = this.stub(ListBase.prototype, "updateAggregation").returns("delegated");

		const vResult = oTree.updateAggregation("someOtherAggregation");
		assert.strictEqual(vResult, "delegated", "result returned from ListBase.prototype.updateAggregation");
		assert.ok(oParentSpy.calledOnce, "ListBase.prototype.updateAggregation called once");
		assert.strictEqual(oParentSpy.firstCall.args[0], "someOtherAggregation", "with the original aggregation name");
	});

	QUnit.test("updateAggregation factory path destroys items when no template is set", async function(assert) {
		// Re-bind using a factory function rather than a template — this exercises the
		// `!oBindingInfo.template` branch in Tree.updateAggregation.
		const oTree = this.oTree;
		oTree.bindItems({
			path: "/",
			factory: (sId, oContext) => {
				return new StandardTreeItem({
					title: oContext.getProperty("text")
				});
			}
		});
		await nextUIUpdate();

		assert.strictEqual(oTree.getItems().length, 2, "two top-level items rendered via factory");
		assert.strictEqual(oTree.getItems()[0].getTitle(), "Node1", "title bound through factory");

		// Trigger another update — items should be recreated, not appended
		oTree.getModel().refresh(true);
		await nextUIUpdate();
		assert.strictEqual(oTree.getItems().length, 2, "items count stays at 2 after refresh with factory");
	});

	QUnit.test("_bindAggregation resets _iDeepestLevel when 'items' is rebound", async function(assert) {
		const oTree = this.oTree;
		oTree.expandToLevel(3);
		await nextUIUpdate();
		assert.ok(oTree.getDeepestLevel() > 0, "deepest level recorded after expanding");

		oTree.bindItems("/", new StandardTreeItem({title: "{text}"}));
		assert.strictEqual(oTree.getDeepestLevel(), 0, "deepest level reset to 0 on rebind");
	});

	QUnit.test("_bindAggregation does not reset _iDeepestLevel for other aggregations", function(assert) {
		const oTree = this.oTree;
		oTree._iDeepestLevel = 5;
		oTree.bindProperty("tooltip", "/text");
		assert.strictEqual(oTree.getDeepestLevel(), 5, "deepest level not reset for non-'items' bindings");
	});

	QUnit.module("Public API edge cases", {
		beforeEach: async function() {
			this.oTree = await createTree();
		},
		afterEach: function() {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("isGrouped always returns false", function(assert) {
		assert.strictEqual(this.oTree.isGrouped(), false, "Tree never reports as grouped");
	});

	QUnit.test("setLastGroupHeader is a no-op for Tree", function(assert) {
		// Should neither throw nor mutate any visible state.
		const iLengthBefore = this.oTree.getItems().length;
		this.oTree.setLastGroupHeader();
		this.oTree.setLastGroupHeader(this.oTree.getItems()[0]);
		assert.strictEqual(this.oTree.getItems().length, iLengthBefore, "items unchanged");
	});

	QUnit.test("getAccessbilityPosition returns setsize and posinset for an item", function(assert) {
		const oTree = this.oTree;
		const oItem = oTree.getItems()[0];
		const mPosition = oTree.getAccessbilityPosition(oItem);
		assert.strictEqual(typeof mPosition.setsize, "number", "setsize is a number");
		assert.strictEqual(typeof mPosition.posinset, "number", "posinset is a number");
		assert.strictEqual(mPosition.posinset, 1, "first item has posinset 1");
		assert.strictEqual(mPosition.setsize, 2, "setsize equals number of siblings at the root");
	});

	QUnit.test("getAccessibilityType returns the localized 'Tree' type", function(assert) {
		const sExpected = Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_TREE");
		assert.strictEqual(this.oTree.getAccessibilityType(), sExpected, "localized accessibility type returned");
	});

	QUnit.test("isTreeBinding only returns true for 'items'", function(assert) {
		assert.strictEqual(this.oTree.isTreeBinding("items"), true, "items aggregation is a tree binding");
		assert.strictEqual(this.oTree.isTreeBinding("foo"), false, "other aggregations are not tree bindings");
	});

	QUnit.test("onItemExpanderPressed with explicit bExpand=true expands and fires event", async function(assert) {
		const oTree = this.oTree;
		const oItem = oTree.getItems()[0];
		const oToggleSpy = this.spy();
		oTree.attachToggleOpenState(oToggleSpy);

		oTree.onItemExpanderPressed(oItem, true);
		await nextUIUpdate();

		assert.ok(oItem.getExpanded(), "item is expanded");
		assert.ok(oToggleSpy.calledOnce, "toggleOpenState fired once");
		assert.strictEqual(oToggleSpy.firstCall.args[0].getParameter("expanded"), true, "expanded=true in event");

		oToggleSpy.resetHistory();
		oTree.onItemExpanderPressed(oItem, true);
		await nextUIUpdate();
		assert.ok(oToggleSpy.notCalled, "no event when state didn't change (already expanded)");
	});

	QUnit.test("onItemExpanderPressed with explicit bExpand=false collapses and fires event", async function(assert) {
		const oTree = this.oTree;
		oTree.expand(0);
		await nextUIUpdate();
		const oItem = oTree.getItems()[0];

		const oToggleSpy = this.spy();
		oTree.attachToggleOpenState(oToggleSpy);

		oTree.onItemExpanderPressed(oItem, false);
		await nextUIUpdate();

		assert.notOk(oItem.getExpanded(), "item is collapsed");
		assert.ok(oToggleSpy.calledOnce, "toggleOpenState fired once");
		assert.strictEqual(oToggleSpy.firstCall.args[0].getParameter("expanded"), false, "expanded=false in event");
	});

	QUnit.test("onItemExpanderPressed does nothing when item context is missing", function(assert) {
		const oTree = this.oTree;
		const oToggleSpy = this.spy();
		oTree.attachToggleOpenState(oToggleSpy);

		// Pass an item that does not belong to the tree → no binding context
		oTree.onItemExpanderPressed(undefined, true);
		assert.ok(oToggleSpy.notCalled, "no event when item is undefined");
	});

	QUnit.module("Drag and drop", {
		beforeEach: async function() {
			this.oTree = await createTree();
		},
		afterEach: function() {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("onItemLongDragOver expands a non-leaf item and fires toggleOpenState", async function(assert) {
		const oTree = this.oTree;
		const oItem = oTree.getItems()[0]; // Node1 — has children
		assert.notOk(oItem.isLeaf(), "Precondition: first item is not a leaf");
		assert.notOk(oItem.getExpanded(), "Precondition: first item is collapsed");

		const oToggleSpy = this.spy();
		oTree.attachToggleOpenState(oToggleSpy);

		oTree.onItemLongDragOver(oItem);
		await nextUIUpdate();

		assert.ok(oItem.getExpanded(), "item is expanded after long drag over");
		assert.ok(oToggleSpy.calledOnce, "toggleOpenState fired once");
		const oEvent = oToggleSpy.firstCall.args[0];
		assert.strictEqual(oEvent.getParameter("expanded"), true, "event reports expanded=true");
		assert.strictEqual(oEvent.getParameter("itemIndex"), 0, "event reports correct itemIndex");
	});

	QUnit.test("onItemLongDragOver does nothing for a leaf item", async function(assert) {
		const oTree = this.oTree;
		oTree.expand(0); // expand Node1 to expose its leaf child Node1-1
		await nextUIUpdate();

		const oLeaf = oTree.getItems()[1]; // Node1-1 is a leaf
		assert.ok(oLeaf.isLeaf(), "Precondition: target item is a leaf");

		const oToggleSpy = this.spy();
		oTree.attachToggleOpenState(oToggleSpy);

		oTree.onItemLongDragOver(oLeaf);
		assert.ok(oToggleSpy.notCalled, "toggleOpenState not fired for leaf");
	});

	QUnit.test("onItemLongDragOver does nothing when item is undefined", function(assert) {
		const oTree = this.oTree;
		const oToggleSpy = this.spy();
		oTree.attachToggleOpenState(oToggleSpy);

		oTree.onItemLongDragOver(undefined);
		assert.ok(oToggleSpy.notCalled, "no event when item is undefined");
	});

	QUnit.module("Internal helpers", {
		beforeEach: async function() {
			this.oTree = await createTree();
		},
		afterEach: function() {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("_sortHelper accepts a single number", function(assert) {
		assert.deepEqual(this.oTree._sortHelper(3), [3], "single number wrapped in array");
	});

	QUnit.test("_sortHelper sorts an array descending", function(assert) {
		assert.deepEqual(this.oTree._sortHelper([1, 5, 2, 4]), [5, 4, 2, 1], "array sorted descending");
	});

	QUnit.test("_sortHelper returns empty array for unsupported input", function(assert) {
		assert.deepEqual(this.oTree._sortHelper("nope"), [], "string yields empty array");
		assert.deepEqual(this.oTree._sortHelper(null), [], "null yields empty array");
		assert.deepEqual(this.oTree._sortHelper(undefined), [], "undefined yields empty array");
	});

	QUnit.test("_removeLeaf filters out leaf indices", async function(assert) {
		const oTree = this.oTree;
		oTree.expand(0); // expand Node1 → second item becomes leaf Node1-1
		await nextUIUpdate();

		// Items: [Node1 (non-leaf, expanded), Node1-1 (leaf), Node1-2 (non-leaf)]
		const aFiltered = oTree._removeLeaf([0, 1, 2]);
		assert.deepEqual(aFiltered, [0, 2], "leaf index 1 removed; non-leaves kept");
	});

	QUnit.test("_removeLeaf handles out-of-range indices safely", function(assert) {
		const aFiltered = this.oTree._removeLeaf([99]);
		assert.deepEqual(aFiltered, [], "non-existent indices are dropped");
	});

	QUnit.test("_preExpand combines _sortHelper and _removeLeaf", async function(assert) {
		const oTree = this.oTree;
		oTree.expand(0);
		await nextUIUpdate();

		// _preExpand sorts descending and removes leaves
		const aResult = oTree._preExpand([0, 1, 2]);
		assert.deepEqual(aResult, [2, 0], "sorted descending and leaf at index 1 removed");
	});

	QUnit.module("Lifecycle", {
		beforeEach: function() { }
	});

	QUnit.test("exit clears the TreeBindingProxy reference", function(assert) {
		const oTree = new Tree();
		assert.ok(oTree._oProxy, "_oProxy created during init");
		oTree.destroy();
		assert.strictEqual(oTree._oProxy, null, "_oProxy cleared on destroy");
	});

	QUnit.test("invalidate sets _bInvalidated; onAfterRendering clears it", async function(assert) {
		const oTree = await createTree();
		assert.notOk(oTree._bInvalidated, "_bInvalidated cleared after initial render");

		oTree.invalidate();
		assert.ok(oTree._bInvalidated, "_bInvalidated set after invalidate()");

		await nextUIUpdate();
		assert.notOk(oTree._bInvalidated, "_bInvalidated cleared again after re-rendering");

		oTree.destroy();
	});

	QUnit.module("Deprecated growing* setters", {
		beforeEach: function() {
			this.oTree = new Tree();
			this.oLogStub = sinon.stub(Log, "error");
		},
		afterEach: function() {
			this.oLogStub.restore();
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("setGrowing logs an error", function(assert) {
		this.oTree.setGrowing(true);
		assert.ok(this.oLogStub.calledOnce, "Log.error was called once");
		assert.ok(this.oLogStub.firstCall.args[0].indexOf("Growing feature") === 0, "Error message mentions Growing feature");
	});

	QUnit.test("setGrowingThreshold logs an error", function(assert) {
		this.oTree.setGrowingThreshold(20);
		assert.ok(this.oLogStub.calledOnce, "Log.error was called once");
		assert.ok(this.oLogStub.firstCall.args[0].indexOf("GrowingThreshold") === 0, "Error message mentions GrowingThreshold");
	});

	QUnit.test("setGrowingTriggerText logs an error", function(assert) {
		this.oTree.setGrowingTriggerText("More");
		assert.ok(this.oLogStub.calledOnce, "Log.error was called once");
		assert.ok(this.oLogStub.firstCall.args[0].indexOf("GrowingTriggerText") === 0, "Error message mentions GrowingTriggerText");
	});

	QUnit.test("setGrowingScrollToLoad logs an error", function(assert) {
		this.oTree.setGrowingScrollToLoad(true);
		assert.ok(this.oLogStub.calledOnce, "Log.error was called once");
		assert.ok(this.oLogStub.firstCall.args[0].indexOf("GrowingScrollToLoad") === 0, "Error message mentions GrowingScrollToLoad");
	});

	QUnit.test("setGrowingDirection logs an error", function(assert) {
		this.oTree.setGrowingDirection("Downwards");
		assert.ok(this.oLogStub.calledOnce, "Log.error was called once");
		assert.ok(this.oLogStub.firstCall.args[0].indexOf("GrowingDirection") === 0, "Error message mentions GrowingDirection");
	});

	QUnit.test("validateAggregation throws for non-TreeItemBase items", function(assert) {
		const oTree = new Tree();
		assert.throws(function() {
			oTree.addItem(new StandardListItem());
		}, /TreeItemBase-based/, "Throws with a message mentioning TreeItemBase");
		oTree.destroy();
	});
});