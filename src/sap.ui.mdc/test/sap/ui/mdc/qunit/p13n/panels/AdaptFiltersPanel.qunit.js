/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/AdaptFiltersPanel",
	"sap/ui/mdc/p13n/P13nBuilder",
	"sap/ui/model/json/JSONModel",
	"sap/m/CustomListItem",
	"sap/m/Toolbar",
	"sap/ui/base/Event",
	"sap/m/Text",
	"sap/m/List",
	"sap/ui/core/Item",
	"sap/m/SegmentedButtonItem",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/m/VBox",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/model/Filter",
	"sap/m/Input",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/p13n/FilterGroupLayout"
], function(AdaptFiltersPanel, P13nBuilder, JSONModel, CustomListItem, Toolbar, Event, Text, List, Item, SegmentedButtonItem, PropertyHelper, VBox, nextUIUpdate, Filter, Input, FilterField, FilterGroupLayout) {
	"use strict";

	const aInfoData = [
		{
			key: "key1",
			label: "Field 1",
			group: "G1",
			dataType: "String"
		},
		{
			key: "key2",
			label: "Field 2",
			group: "G1",
			dataType: "String"
		},
		{
			key: "key3",
			label: "Field 3",
			group: "G1",
			dataType: "String"
		},
		{
			key: "key4",
			label: "Field 4",
			group: "G2",
			groupLabel: "Group 2",
			dataType: "String"
		},
		{
			key: "key5",
			label: "Field 5",
			group: "G2",
			groupLabel: "Group 2",
			dataType: "String"
		},
		{
			key: "key6",
			label: "Field 6",
			group: "G2",
			groupLabel: "Group 2",
			tooltip: "Some Tooltip",
			dataType: "String"
		}
	];

	const sMode = ["Modern", "Legacy"];

sMode.forEach(function(sModeName) {
	// Required Fields in new design are always visible
	const aVisible = sModeName === "Legacy" ? ["key1", "key2", "key3"] : ["key1", "key2", "key3", "key5"];

	function getGroups(oList) {
		if (sModeName === "Modern") {
			return oList.getItems().filter((oItem) => oItem.isA("sap.m.GroupHeaderListItem"));
		}
		return oList.getVisibleItems();
	}

	function modifyGroup(oP13nData, sGroup, fnModifier) {
		if (sModeName === "Modern") {
			oP13nData.items
				.filter((oItem) => oItem.group === sGroup)
				.forEach(fnModifier);
			return;
		}
		oP13nData.itemsGrouped.forEach(function(oGroup) {
			if (oGroup.group === sGroup) {
				oGroup.items.forEach(fnModifier);
			}
		});
	}

	function getGroupItems(oViewContent, sGroup) {
		sGroup ??= "Basic";

		if (sModeName === "Modern") {
			const aGroupItems = [];
			let bInGroup = false;
			oViewContent._oListControl.getItems().forEach((oItem) => {
				if (oItem.isA("sap.m.GroupHeaderListItem")) {
					bInGroup = oItem.getTitle() === sGroup;
					return;
				}

				if (bInGroup) {
					aGroupItems.push(oItem);
				}
			});

			return aGroupItems;
		}
		return oViewContent.getPanels().find((oPanel) => {
			return oPanel.getHeaderToolbar().getContent()[0].getText() === sGroup;
		}).getContent()[0].getVisibleItems();
	}

	function getItemContent(oCustomListItem) {
		if (sModeName === "Modern") {
			return oCustomListItem.getContent()[0].getContent()[1];
		}
		return oCustomListItem.getContent()[1];
	}

	// Helper function to create view items based on mode
	// Modern mode uses sap.ui.core.Item, Legacy mode uses sap.m.SegmentedButtonItem
	function createViewItem(mSettings) {
		if (sModeName === "Modern") {
			return new Item(mSettings);
		}
		return new SegmentedButtonItem(mSettings);
	}

	QUnit.module(`${sModeName} - API Tests`, {
		beforeEach: async function() {
			if (sModeName === "Modern") {
				this.fnNewUIStub = sinon.stub(AdaptFiltersPanel.prototype, "_checkIsNewUI").returns(true);
			}

			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			if (sModeName === "Legacy") {
				this.oAFPanel = new AdaptFiltersPanel({
				defaultView: "group",
				footer: new Toolbar("ID_TB1",{}),
				useNewUI: false

			});
			} else {
				this.oAFPanel = new AdaptFiltersPanel({
					defaultView: "group",
					footer: new Toolbar("ID_TB1",{})
				});
			}

		this.oAFPanel.setItemFactory(function(){
			let oControl = new VBox();
			if (sModeName === "Modern") {
				const oFilterField = new FilterField();
				// Ensure getConditions is available for FilterField instances
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				// Wrap FilterField in FilterGroupLayout to match production behavior
				const oFilterGroupLayout = new FilterGroupLayout();
				oFilterGroupLayout.setFilterField(oFilterField);
				oControl = oFilterGroupLayout;
			}
			return oControl;
		});			this.fnEnhancer = function(mItem, oProperty) {

				//Add (mock) an 'active' field
				if (oProperty.key == "key2") {
					mItem.active = true;
				}

				//Add (mock) a 'mandatory' field
				if (oProperty.key == "key5") {
					mItem.required = true;
				}

				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			if (sModeName === "Modern") {
				this.fnNewUIStub.restore();
			}

			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("check instantiation", function(assert){
		assert.ok(this.oAFPanel, "Panel created");
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		assert.ok(this.oAFPanel.getModel(this.oAFPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
	});

	QUnit.test("Check Search implementation", async function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel._getSearchField().setValue("Field 5");
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		await nextUIUpdate();

		const oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;
		const aGroups = getGroups(oOuterList);
		assert.equal(aGroups.length, 1, "One group available after filtering");
	});

	QUnit.test("Check Search implementation - also for ToolTip", async function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel._getSearchField().setValue("Some Tooltip");
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		await nextUIUpdate();

		const oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;
		const aGroups = getGroups(oOuterList);

		assert.equal(aGroups.length, 1, "One group available after filtering");
	});

	QUnit.test("Check that groups are initially only displayed if necessary", async function(assert){

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		assert.equal(getGroups(this.oAFPanel.getCurrentViewContent()._oListControl).length, 2, "All groups visible");

		modifyGroup(oP13nData, "G1", function(oItem){
			oItem.visibleInDialog = false;
		});
		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();

		assert.equal(getGroups(this.oAFPanel.getCurrentViewContent()._oListControl).length, 1, "Only necessary groups visible");

	});

	QUnit.test("Check additional filter implementation (visibleInDialog)", async function(assert){

		const oP13nData = this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, function(oItem, oProp) {
			if (oProp.key == "key2") {
				oItem.visibleInDialog = false;
			} else {
				oItem.visibleInDialog = true;
			}
			return oItem;
		}, true);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		this.oAFPanel.switchView("group");
		await nextUIUpdate();


		//Check in GroupView
		assert.equal(getGroupItems(this.oAFPanel.getCurrentViewContent()).length, 2, "There are 3 items in the model, but one should be hidden for the user");

		//Check in ListView
		this.oAFPanel.switchView("list");
		const aItems = this.oAFPanel.getCurrentViewContent()._oListControl.getItems();
		assert.equal(aItems.length, 5, "There are 6 items in the model, but one should be hidden for the user");

	});

	QUnit.test("Check 'getSelectedFields' - should only return selected fields", async function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		await nextUIUpdate();

		//Three existing items --> the amount of selected items should match the initially visible ones
		assert.equal(this.oAFPanel.getSelectedFields().length, aVisible.length, "Correct amount of selected items returned");

	});

	QUnit.test("Check 'itemFactory' model propagation", async function(assert){

		const oSecondModel = new JSONModel({
			data: [
				{
					key: "k1",
					text: "Some Test Text"
				}
			]
		});
		const oTestFactory = new List({
			items: {
				path: "/data",
				name: "key",
				template: new CustomListItem({
					content: new Text({
						text: "{text}"
					})
				}),
				templateShareable: false
			}
		});

		oTestFactory.setModel(oSecondModel);
		this.oAFPanel.setItemFactory(function(){
			const oClone = oTestFactory.clone();
			oClone.getConditions = function() {
				return [];
			};
			return oClone;
		});
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		await nextUIUpdate();

		const aGroupItems = getGroupItems(this.oAFPanel.getCurrentViewContent());
		//List created via template 'oTestFactory'
		const oCustomList = getItemContent(aGroupItems[0]);

		assert.equal(oCustomList.getItems().length, 1, "Custom template list has one item (oSecondModel, data)");
		assert.deepEqual(oCustomList.getModel(), oSecondModel, "Manual model propagated");
		assert.ok(oCustomList.getModel(this.oAFPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Inner panel p13n model propagated");

		assert.equal(oCustomList.getItems()[0].getContent()[0].getText(), "Some Test Text", "Custom binding from outside working in factory");

	});

	QUnit.test("Check view toggle", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("group");

		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Group view is the default");

		this.oAFPanel.switchView("group");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Group view is unchanged");

		this.oAFPanel.switchView("list");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "list", "List view should be selected");

		this.oAFPanel.switchView("group");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "List view should be selected");

	});

	QUnit.module(`${sModeName} - addCustomView Tests`, {
		beforeEach: async function() {
			if (sModeName === "Modern") {
				this.fnNewUIStub = sinon.stub(AdaptFiltersPanel.prototype, "_checkIsNewUI").returns(true);
			}

			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			if (sModeName === "Legacy") {
				this.oAFPanel = new AdaptFiltersPanel({
					defaultView: "group",
					footer: new Toolbar("ID_TB_CUSTOM", {}),
					useNewUI: false
				});
			} else {
				this.oAFPanel = new AdaptFiltersPanel({
					defaultView: "group",
					footer: new Toolbar("ID_TB_CUSTOM", {})
				});
			}

			this.oAFPanel.setItemFactory(function() {
				let oControl = new VBox();
				if (sModeName === "Modern") {
					const oFilterField = new FilterField();
					if (!oFilterField.getConditions) {
						oFilterField.getConditions = function() {
							return [];
						};
					}
					const oFilterGroupLayout = new FilterGroupLayout();
					oFilterGroupLayout.setFilterField(oFilterField);
					oControl = oFilterGroupLayout;
				}
				return oControl;
			});

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			if (sModeName === "Modern") {
				this.fnNewUIStub.restore();
			}
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("addCustomView registers a new view correctly", function(assert) {
		// Arrange & Act
		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "customChart"
			}),
			content: new List("myCustomList1", {})
		});

		// Assert
		assert.equal(this.oAFPanel.getViews().length, 3, "A custom view has been added to the views aggregation");
		assert.equal(this.oAFPanel._getViewSwitch().getItems().length, 3, "The item has been added to the view switch control");
	});

	QUnit.test("addCustomView registers multiple custom views", function(assert) {
		// Arrange & Act
		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "chart"
			}),
			content: new List("customChartList", {})
		});

		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "tree"
			}),
			content: new List("customTreeList", {})
		});

		// Assert
		assert.equal(this.oAFPanel.getViews().length, 4, "Two custom views have been added");
		assert.equal(this.oAFPanel._getViewSwitch().getItems().length, 4, "Both items have been added to the view switch control");
	});

	QUnit.test("addCustomView allows navigation via switchView", async function(assert) {
		// Arrange
		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "customView"
			}),
			content: new List("myCustomList2", {})
		});
		await nextUIUpdate();

		// Act
		this.oAFPanel.switchView("customView");

		// Assert
		assert.equal(this.oAFPanel.getCurrentViewKey(), "customView", "The custom view has been selected");
		assert.equal(this.oAFPanel._getViewSwitch().getSelectedKey(), "customView", "The view switch control reflects the selection");
	});

	QUnit.test("addCustomView executes selectionChange callback on view switch", async function(assert) {
		// Arrange
		const done = assert.async();
		const oItem = createViewItem({
			key: "callbackView"
		});

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("myCustomList3", {}),
			selectionChange: function(sKey) {
				// Assert
				assert.equal(sKey, "callbackView", "selectionChange callback received the correct key");
				done();
			}
		});
		await nextUIUpdate();

		// Act
		const sSelectionChangeEvent = sModeName === "Modern" ? "select" : "selectionChange";
		this.oAFPanel._getViewSwitch().fireEvent(sSelectionChangeEvent, {
			item: oItem
		});
	});

	QUnit.test("addCustomView throws error when no key is provided", function(assert) {
		// Arrange & Act & Assert
		const sExpectedErrorMessage = sModeName === "Modern"
			? "Please provide an item of type sap.ui.core.Item with a key to be used in the view switch"
			: "Please provide an item of type sap.m.SegmentedButtonItem with a key to be used in the view switch";

		assert.throws(
			function() {
				this.oAFPanel.addCustomView({
					item: createViewItem({}),
					content: new List({}),
					selectionChange: function() {}
				});
			}.bind(this),
			function(oError) {
				return (
					oError instanceof Error &&
					oError.message === sExpectedErrorMessage
				);
			},
			"Error is thrown when Item has no key"
		);
	});

	QUnit.test("addCustomView applies styling to content", function(assert) {
		// Arrange
		const oContent = new List("styledCustomList", {});

		// Act
		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "styledView"
			}),
			content: oContent
		});

		// Assert
		assert.ok(oContent.hasStyleClass("sapUiMDCPanelPadding"), "The content has the correct style class applied");
	});

	QUnit.test("addCustomView content is displayed when view is selected", async function(assert) {
		// Arrange
		const oCustomContent = new List("visibleCustomList", {});

		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "visibleView"
			}),
			content: oCustomContent
		});
		await nextUIUpdate();

		// Act
		this.oAFPanel.switchView("visibleView");
		await nextUIUpdate();

		// Assert
		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		assert.strictEqual(oCurrentContent, oCustomContent, "The custom content is the current view content");
	});

	QUnit.test("addCustomView preserves enabled state from Item", async function(assert) {
		// Arrange
		const oItem = createViewItem({
			key: "disabledView",
			enabled: false
		});

		// Act
		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("disabledViewList", {})
		});
		await nextUIUpdate();

		// Assert
		const oViewSwitch = this.oAFPanel._getViewSwitch();
		const oAddedItem = oViewSwitch.getItems().find((item) => item.getKey() === "disabledView");
		assert.ok(oAddedItem, "The item was added to the view switch");
		assert.strictEqual(oAddedItem.getEnabled(), false, "The enabled state is preserved");
	});

	QUnit.test("addCustomView with text property", async function(assert) {
		// Arrange
		const oItem = createViewItem({
			key: "textView",
			text: "Custom Text"
		});

		// Act
		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("textViewList", {})
		});
		await nextUIUpdate();

		// Assert
		const oViewSwitch = this.oAFPanel._getViewSwitch();
		const oAddedItem = oViewSwitch.getItems().find((item) => item.getKey() === "textView");
		assert.ok(oAddedItem, "The item was added to the view switch");

		if (sModeName === "Modern") {
			assert.strictEqual(oAddedItem.getText(), "Custom Text", "The text is preserved in IconTabFilter");
		} else {
			assert.strictEqual(oAddedItem.getText(), "Custom Text", "The text is preserved in Item");
		}
	});

	QUnit.test("addCustomView switching back to default views works", async function(assert) {
		// Arrange
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "customView"
			}),
			content: new List("switchBackList", {})
		});
		await nextUIUpdate();

		// Act - switch to custom view
		this.oAFPanel.switchView("customView");
		await nextUIUpdate();
		assert.equal(this.oAFPanel.getCurrentViewKey(), "customView", "Custom view is selected");

		// Act - switch back to group view
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		// Assert
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Can switch back to group view");

		// Act - switch to list view
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		// Assert
		assert.equal(this.oAFPanel.getCurrentViewKey(), "list", "Can switch to list view");
	});

	QUnit.test("Check 'restoreDefaults' to reset to initial values", async function(assert){

		this.oAFPanel.setDefaultView("list");

		if (sModeName === "Modern") {
			this.oAFPanel._getSearchField().setValue("Test"); //Set a search value
			this.oAFPanel.switchView("list");
			this.oAFPanel._filterByModeAndSearch();
		} else {
			this.oAFPanel._getSearchField().setValue("Test"); //Set a search value
			this.oAFPanel.switchView("list"); //Switch to group view
			this.oAFPanel._getQuickFilter().setSelectedKey("visible");//Only show visible filters in the quick filter
			this.oAFPanel.getView("list").getContent().showFactory?.(true);//Show the factory
		}
		await nextUIUpdate();

		const oFilterSpy = sinon.spy(this.oAFPanel, "_filterByModeAndSearch");
		assert.equal(this.oAFPanel._getSearchField().getValue(), "Test", "Value 'Test' is present on the SearchField");
		this.oAFPanel.restoreDefaults();

		//assert that defaults have been restored
		assert.ok(oFilterSpy.called, "Filter logic executed again after defaults have been restored");
		assert.equal(this.oAFPanel._getSearchField().getValue(), "", "SearchField is empty after defaults have been restored");
		//assert.equal(this.oAFPanel.getCurrentViewKey(), "list", "The list view has been set as default view");

		if (sModeName === "Legacy") {
			assert.equal(this.oAFPanel._getQuickFilter().getSelectedKey(), "all", "Quickfilter is set to 'all' after defaults have been restored");
			assert.equal(this.oAFPanel.getView("list").getContent()._getShowFactory(), false, "The factory is no longer displayed");
		}

		//cleanups
		this.oAFPanel._filterByModeAndSearch.restore();

	});

if (sModeName === "Legacy") {
	QUnit.test("Check 'Select All' functionality", async function(assert) {
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		let aSelectedItems = this.oAFPanel.getP13nModel().getProperty("/items").filter(function(oItem) {
			return oItem.visible;
		});
		assert.equal(aSelectedItems.length, 3, "Initially all items are selected");

		// Arrange:
		this.oAFPanel._getSearchField().setValue("Field 5");
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		const oListControl = this.oAFPanel.getCurrentViewContent()._oListControl;

		// Assert: Only one item is shown after filtering and is not selected
		assert.equal(oListControl.getItems().length, 1, "Only one item is shown after filtering");
		assert.equal(oListControl.getItems()[0].getSelected(), false, "Item is not selected");

		// Act: Click on Select All checkbox
		oListControl.fireSelectionChange({
			listItems: oListControl.getItems(),
			selectAll: true
		});
		await nextUIUpdate();

		// Assert: item is selected now
		aSelectedItems = oListControl.getSelectedItems();
		assert.equal(aSelectedItems.length, 1, "Only one item was affected by Select All");
		assert.equal(aSelectedItems[0].getCells()[0].getItems()[0].getText(), "Field 5", "Only the filtered item was selected");

		// Now remove the filter and check that only the previously filtered items are selected
		this.oAFPanel._getSearchField().setValue("");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		// Assert: item is selected now
		aSelectedItems = oListControl.getSelectedItems();
		assert.equal(aSelectedItems.length, 4, "Only four items are selected");
		assert.equal(aSelectedItems[0].getCells()[0].getItems()[0].getText(), "Field 1", "Field 1 is selected correctly");
		assert.equal(aSelectedItems[1].getCells()[0].getItems()[0].getText(), "Field 2", "Field 2 is selected correctly");
		assert.equal(aSelectedItems[2].getCells()[0].getItems()[0].getText(), "Field 3", "Field 3 is selected correctly");
		assert.equal(aSelectedItems[3].getCells()[0].getItems()[0].getText(), "Field 5", "Field 5 is selected correctly");
	});

	QUnit.test("Check 'Deselect All' after filtering", async function(assert) {
		this.oAFPanel.setP13nModel(new JSONModel({
			items: [ ...this.oP13nData.items, {name: "key21", label: "Field 21", group: "G1", dataType: "String", visible: true, visibleInDialog: true} ],
			itemsGrouped: [ ...this.oP13nData.itemsGrouped ]
		}));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		let aSelectedItems = this.oAFPanel.getP13nModel().getProperty("/items").filter(function(oItem) {
			return oItem.visible;
		});
		assert.equal(aSelectedItems.length, 4, "Initially all items are selected");

		// Arrange:
		this.oAFPanel._getSearchField().setValue("Field 2");
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		const oListControl = this.oAFPanel.getCurrentViewContent()._oListControl;

		// Assert: Only one item is shown after filtering and is not selected
		assert.equal(oListControl.getItems().length, 2, "Two items are shown after filtering");
		assert.equal(oListControl.getItems()[0].getSelected(), true, "Item is initially selected");
		assert.equal(oListControl.getItems()[1].getSelected(), true, "Item is initially selected");

		// Act: Click on Select All checkbox
		oListControl.getItems()[0].setSelected(false);
		oListControl.getItems()[1].setSelected(false);
		oListControl.fireSelectionChange({
			listItems: oListControl.getItems(),
			selectAll: false
		});
		await nextUIUpdate();

		aSelectedItems = oListControl.getSelectedItems();
		assert.equal(aSelectedItems.length, 0, "No item is selected");

		// Now remove the filter and check that only the previously filtered items are selected
		this.oAFPanel._getSearchField().setValue("");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		aSelectedItems = oListControl.getSelectedItems();
		assert.equal(aSelectedItems.length, 2, "Only 2 items are selected after removing filter");
	});

	QUnit.test("Check Search implementation in combination with 'group mode' Select for 'active'", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._sModeKey = "active";
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		const oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;

		//filter only via select control --> only first group has an active item
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is invisible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with additional search --> active item does not have this tooltip
		this.oAFPanel._getSearchField().setValue("Some Tooltip");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with a search filter and 'all' --> only affected item with the tooltip should be visible
		this.oAFPanel._sModeKey = "all";
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check Search implementation in combination with 'group mode' Select for 'mandatory'", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._sModeKey = "mandatory";
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		const oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;

		//filter only via select control --> only second group has a mandatory item
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since one item is available");

		//filter with a search filter and 'all'
		this.oAFPanel._sModeKey = "all";
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check Search implementation in combination with 'group mode' Select for 'visibleactive'", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._sModeKey = "visibleactive";
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		const oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;

		//filter only via select control --> only first group has an active and visible item
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with additional search --> active item is still present as it fits the label
		this.oAFPanel._getSearchField().setValue("Field 2");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		this.oAFPanel._getSearchField().setValue("Field 1");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with additional search --> active item is still present as it fits the label
		this.oAFPanel._getSearchField().setValue("Field 2");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with a search filter and 'all' --> only affected item with the tooltip should be visible
		this.oAFPanel._sModeKey = "all";
		this.oAFPanel._getSearchField().setValue("");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check Search implementation in combination with 'group mode' Select", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._getSearchField().setValue("Some Tooltip");
		this.oAFPanel._sModeKey = "visible";
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});

		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		const oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		this.oAFPanel._sModeKey = "all";
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check that groups are initially only displayed if necessary", function(assert){

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		assert.equal(this.oAFPanel.getCurrentViewContent()._oListControl.getVisibleItems().length, 2, "All groups visible");

		oP13nData.itemsGrouped[0].items.forEach(function(oItem){
			oItem.visibleInDialog = false;
		});

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		assert.equal(this.oAFPanel.getCurrentViewContent()._oListControl.getVisibleItems().length, 1, "Only necessary groups visible");

	});

	QUnit.test("Check additional filter implementation (visibleInDialog)", function(assert){

		const oP13nData = this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, function(oItem, oProp) {
			if (oProp.key == "key2") {
				oItem.visibleInDialog = false;
			} else {
				oItem.visibleInDialog = true;
			}
			return oItem;
		}, true);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		const aGroupPanels = this.oAFPanel.getCurrentViewContent().getPanels();

		//Check in GroupView
		assert.equal(aGroupPanels[0].getContent()[0].getVisibleItems().length, 2, "There are 3 items in the model, but one should be hidden for the user");

		//Check in ListView
		this.oAFPanel.switchView("list");
		const aItems = this.oAFPanel.getCurrentViewContent()._oListControl.getItems();
		assert.equal(aItems.length, 5, "There are 6 items in the model, but one should be hidden for the user");

	});

	// not relevant for new mode, as groups are always loaded expanded (as they are just items in a list)
	QUnit.test("Check 'itemFactory' execution for only necessary groups", async function(assert){

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

		const fnItemFactoryCallback = function(oContext) {
			return new VBox();
		};

		this.oAFPanel.setItemFactory(fnItemFactoryCallback);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		await nextUIUpdate();

		this.oAFPanel.getCurrentViewContent()._loopGroupList(function(oItem, sKey){
			const oProp = this.oAFPanel.getP13nModel().getProperty(oItem.getBindingContext(this.oAFPanel.P13N_MODEL).sPath);
			const iExpectedLength = oProp.group === "G1" ? 2 : 1;

			assert.equal(oItem.getContent().length, iExpectedLength, "Only required callbacks executed");

		}.bind(this));

	});

	QUnit.test("Check 'itemFactory' execution for expanded groups", function(assert){

		//6 items in 2 groups --> 6x callback excuted after expanding --> +3x for initial filtering
		const done = assert.async(9);

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

		const fnItemFactoryCallback = function (oContext) {
			assert.ok(oContext, "Callback executed with binding context");
			done(6);
		};

		this.oAFPanel.setItemFactory(fnItemFactoryCallback);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		this.oAFPanel.setGroupExpanded("G2");

	});

	QUnit.test("Check 'itemFactory' execution for expanded groups by checking created controls", function(assert){

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

		const fnItemFactoryCallback = function (oContext) {

			return new VBox();
		};

		this.oAFPanel.setItemFactory(fnItemFactoryCallback);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		this.oAFPanel.setGroupExpanded("G2");

		this.oAFPanel.getCurrentViewContent()._loopGroupList(function(oItem, sKey){

			//All Panels expanded --> all fields created
			assert.equal(oItem.getContent().length, 2, "Only required callbacks executed");

		});

	});

	QUnit.test("Check 'itemFactory' execution combined with filtering - panel not expaned while searching", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._getSearchField().setValue("Field 5");
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});

		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		assert.equal(this.oAFPanel.getCurrentViewContent()._getInitializedLists().length, 1, "Filter triggerd, but group not yet initialized");

		this.oAFPanel.getCurrentViewContent()._loopGroupList(function(oItem, sKey){
			const oProp = this.oAFPanel.getP13nModel().getProperty(oItem.getBindingContext(this.oAFPanel.P13N_MODEL).sPath);
			const iExpectedLength = oProp.group === "G1" ? 2 : 1;

			assert.equal(oItem.getContent().length, iExpectedLength, "Only required callbacks executed");

		}.bind(this));
	});

	QUnit.test("Check 'itemFactory' execution combined with filtering - panel is expaned while searching", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._getSearchField().setValue("Field 5");
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});

		this.oAFPanel.setGroupExpanded("G2");

		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		assert.equal(this.oAFPanel.getCurrentViewContent()._getInitializedLists().length, 2, "Filter triggerd - group initialized");

	});

	QUnit.test("Check method 'setGroupExpanded' ", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		const oSecondPanel = this.oAFPanel.getCurrentViewContent()._oListControl.getItems()[1].getContent()[0];
		assert.ok(!oSecondPanel.getExpanded(), "Panel is initially collapsed");

		this.oAFPanel.setGroupExpanded("G2", true);
		assert.ok(oSecondPanel.getExpanded(), "Panel is expanded after manually triggering");

		this.oAFPanel.setGroupExpanded("G2");
		assert.ok(!oSecondPanel.getExpanded(), "Panel is collapsed when calling with 'undefined' as second parameter");

		this.oAFPanel.setGroupExpanded("G2", true);
		assert.ok(oSecondPanel.getExpanded(), "Panel is expanded after manually triggering");

		this.oAFPanel.setGroupExpanded("G2", false);
		assert.ok(!oSecondPanel.getExpanded(), "Panel is collapsed when calling with 'false'' as second parameter");
	});

	QUnit.test("Check inner controls upon toggling the view", function (assert) {
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("group");

		this.oAFPanel.switchView("list");
		assert.ok(this.oAFPanel.getCurrentViewContent().isA("sap.m.p13n.SelectionPanel"));

		this.oAFPanel.switchView("group");
		assert.ok(this.oAFPanel.getCurrentViewContent().isA("sap.ui.mdc.p13n.panels.GroupView"));

	});

	QUnit.module(`${sModeName} - Legacy addCustomView Callbacks`, {
		beforeEach: async function() {
			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel({
				defaultView: "group",
				footer: new Toolbar("ID_TB_LEGACY_CB", {}),
				useNewUI: false
			});

			this.oAFPanel.setItemFactory(function() {
				return new VBox();
			});

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("addCustomView search callback is executed on liveChange", function(assert) {
		// Arrange
		const done = assert.async();

		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "searchView"
			}),
			content: new List("searchCallbackList", {}),
			search: function(sValue) {
				// Assert
				assert.equal(sValue, "SearchValue", "Search callback received the correct search string");
				done();
			}
		});

		// Act
		this.oAFPanel.switchView("searchView");
		this.oAFPanel._getSearchField().setValue("SearchValue");
		this.oAFPanel._getSearchField().fireLiveChange({ newValue: "SearchValue" });
	});

	QUnit.test("addCustomView search callback only fires when custom view is active", async function(assert) {
		// Arrange
		let iSearchCallCount = 0;

		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "conditionalSearchView"
			}),
			content: new List("conditionalSearchList", {}),
			search: function() {
				iSearchCallCount++;
			}
		});
		await nextUIUpdate();

		// Act - search while on default view (not custom view)
		this.oAFPanel._getSearchField().setValue("Test");
		this.oAFPanel._getSearchField().fireLiveChange();

		// Assert
		assert.equal(iSearchCallCount, 0, "Search callback is not executed when custom view is not active");

		// Act - switch to custom view and search
		this.oAFPanel.switchView("conditionalSearchView");
		this.oAFPanel._getSearchField().fireLiveChange();

		// Assert
		assert.equal(iSearchCallCount, 1, "Search callback is executed when custom view is active");
	});

	QUnit.test("addCustomView filterSelect callback is executed on QuickFilter change", async function(assert) {
		// Arrange
		const done = assert.async();

		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "filterView"
			}),
			content: new List("filterSelectList", {}),
			filterSelect: function(sValue) {
				// Assert
				assert.ok(sValue, "filterSelect callback received a value");
				done();
			}
		});
		await nextUIUpdate();

		// Act
		this.oAFPanel.switchView("filterView");
		this.oAFPanel._getQuickFilter().fireChange({
			selectedItem: this.oAFPanel._getQuickFilter().getItems()[0]
		});
	});

	QUnit.test("addCustomView filterSelect callback only fires when custom view is active", async function(assert) {
		// Arrange
		let iFilterSelectCallCount = 0;

		this.oAFPanel.addCustomView({
			item: createViewItem({
				key: "conditionalFilterView"
			}),
			content: new List("conditionalFilterList", {}),
			filterSelect: function() {
				iFilterSelectCallCount++;
			}
		});
		await nextUIUpdate();

		// Act - change filter while on default view
		this.oAFPanel._getQuickFilter().fireChange({
			selectedItem: this.oAFPanel._getQuickFilter().getItems()[0]
		});

		// Assert
		assert.equal(iFilterSelectCallCount, 0, "filterSelect callback is not executed when custom view is not active");

		// Act - switch to custom view and change filter
		this.oAFPanel.switchView("conditionalFilterView");
		this.oAFPanel._getQuickFilter().fireChange({
			selectedItem: this.oAFPanel._getQuickFilter().getItems()[0]
		});

		// Assert
		assert.equal(iFilterSelectCallCount, 1, "filterSelect callback is executed when custom view is active");
	});

	QUnit.test("addCustomView search callback is executed on view switch with existing search value", function(assert) {
		// Arrange
		const done = assert.async();
		const oItem = createViewItem({
			key: "switchSearchView"
		});

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("switchSearchList", {}),
			search: function(sSearch) {
				// Assert
				assert.equal(sSearch, "ExistingSearch", "Search callback received the existing search value on view switch");
				done();
			}
		});

		// Act - set search value before switching
		this.oAFPanel._getSearchField().setValue("ExistingSearch");
		this.oAFPanel._getViewSwitch().fireSelectionChange({
			item: oItem
		});
	});

	QUnit.test("addCustomView filterSelect callback is executed on view switch", async function(assert) {
		// Arrange
		const done = assert.async();
		const oItem = createViewItem({
			key: "switchFilterView"
		});

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("switchFilterList", {}),
			filterSelect: function(sValue) {
				// Assert
				assert.ok(sValue, "filterSelect callback received a value on view switch");
				done();
			}
		});
		await nextUIUpdate();

		// Act
		this.oAFPanel._getViewSwitch().fireSelectionChange({
			item: oItem
		});
	});

	QUnit.test("addCustomView with all callbacks combined", async function(assert) {
		// Arrange
		const aCallbacksCalled = [];
		const oItem = createViewItem({
			key: "allCallbacksView"
		});

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("allCallbacksList", {}),
			selectionChange: function(sKey) {
				aCallbacksCalled.push("selectionChange:" + sKey);
			},
			search: function(sValue) {
				aCallbacksCalled.push("search:" + sValue);
			},
			filterSelect: function(sValue) {
				aCallbacksCalled.push("filterSelect:" + sValue);
			}
		});
		await nextUIUpdate();

		// Act - trigger view switch
		this.oAFPanel._getViewSwitch().fireSelectionChange({
			item: oItem
		});

		// Assert
		assert.ok(aCallbacksCalled.includes("selectionChange:allCallbacksView"), "selectionChange callback was executed");
		assert.ok(aCallbacksCalled.some((s) => s.startsWith("search:")), "search callback was executed on view switch");
		assert.ok(aCallbacksCalled.some((s) => s.startsWith("filterSelect:")), "filterSelect callback was executed on view switch");
	});

	QUnit.test("Check filter field visibility when switching views", async function(assert) {
		const oControlMap = new Map();
		this.oP13nData.items.forEach((oItem) => {
			oControlMap.set(oItem.name, new Input());
		});

		this.oAFPanel.setItemFactory(function(oContext) {
			return oControlMap.get(oContext.getProperty("name"));
		});
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		await nextUIUpdate();

		this.oAFPanel.setDefaultView("list");
		this.oAFPanel.getView("list").getContent().showFactory(true); //Show the factory
		this.oAFPanel.switchView("list");

		await nextUIUpdate();

		// Check if items are visible and have the correct parent
		const oList = this.oAFPanel.getCurrentViewContent()._oListControl;
		assert.ok(oList, "List is available");
		assert.ok(oList.getDomRef(), "List is rendered");

		let oItem = oList.getItems()[0];
		let oInput = oItem.getCells()[0].getItems()[1];
		assert.ok(oItem.getDomRef(), "List item is rendered");
		assert.ok(oInput.isA("sap.m.Input"), "List item content is an Input field");
		assert.ok(oInput.getDomRef(), "List item content is rendered");

		// Switch to group view, by simulating press on SegmentedButton (this will fire updateFinished, similar to scrolling)
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		const oGroupList = this.oAFPanel.getCurrentViewContent()._oListControl;
		assert.ok(oGroupList, "Group List is available");
		assert.ok(oGroupList.getDomRef(), "Group List is rendered");

		oItem = oGroupList.getItems()[0].getContent()[0].getContent()[0].getItems()[0];

		assert.ok(oItem.getContent().length > 1, "Group List Hbox has two items");

		oInput = oItem.getContent()[1];
		assert.ok(oInput.isA("sap.m.Input"), "Group List item content is an Input field");
		assert.ok(oInput.getDomRef(), "Group List item content is rendered");
	});
}

if (sModeName === "Modern") {
	QUnit.test("Header creation", function(assert){
		assert.ok(this.oAFPanel._oHeader, "Panel header exists");
		assert.ok(this.oAFPanel._oHeader.isA("sap.m.IconTabBar"), "Panel header is IconTabBar");
		const aItems = this.oAFPanel._oHeader.getItems();
		assert.equal(aItems.length, 2, "Two tabs in header");
		assert.equal(aItems[0].getKey(), "list", "First tab is list view");
		assert.equal(aItems[1].getKey(), "group", "Second tab is group view");
	});

	QUnit.test("Switch from list to group view", async function(assert){
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "On group view");
		assert.equal(oCurrentContent.getDefaultView(), "group", "Content is in group mode");
	});

	QUnit.test("Switch from group to list view", async function(assert){
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "On group view");

		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		assert.equal(this.oAFPanel.getCurrentViewKey(), "list", "On list view");
		assert.equal(oCurrentContent.getDefaultView(), "list", "Content is in list mode");
	});

	QUnit.test("Data synchronization during view switch", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		let oCurrentContent = this.oAFPanel.getCurrentViewContent();
		const oInitialData = oCurrentContent.getP13nData();

		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		oCurrentContent = this.oAFPanel.getCurrentViewContent();
		const oNewData = oCurrentContent.getP13nData();

		assert.equal(oNewData.length, oInitialData.length, "Data preserved during view switch");
		assert.deepEqual(oNewData[0].name, oInitialData[0].name, "Item data matches after switch");
	});

	QUnit.test("Search implementation in content", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		await nextUIUpdate();

		oCurrentContent._getSearchField().setValue("Field 5");
		const oFakeEvent = new Event("liveSearch", oCurrentContent._getSearchField(), {});
		oCurrentContent._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		const oList = oCurrentContent._oListControl;
		const aVisibleItems = oList.getItems().filter(function(item) { return item.getVisible(); });
		assert.ok(aVisibleItems.length > 0, "Items are visible after search");
		assert.ok(oList.getItems()[0].isA("sap.m.GroupHeaderListItem"), "Group header shown");
	});

	QUnit.test("Search by tooltip in content", async function(assert){
		const oP13nData = JSON.parse(JSON.stringify(this.oP13nData));
		const oKey6Item = oP13nData.items.find((item) => item.name === "key6");
		if (oKey6Item) {
			oKey6Item.visible = true;
			oKey6Item.position = 3;
		}

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		await nextUIUpdate();

		oCurrentContent._getSearchField().setValue("Some Tooltip");
		const oFakeEvent = new Event("liveSearch", oCurrentContent._getSearchField(), {});
		oCurrentContent._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		const oList = oCurrentContent._oListControl;
		const aVisibleItems = oList.getItems().filter(function(item) {
			return item.getVisible() && !item.isA("sap.m.GroupHeaderListItem");
		});
		assert.ok(aVisibleItems.length > 0, "Items found by tooltip");
	});

	QUnit.test("Group visibility based on visibleInDialog", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const iInitialGroups = getGroups(this.oAFPanel.getCurrentViewContent()._oListControl).length;
		assert.ok(iInitialGroups > 0, "Groups are visible initially");

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, function(oItem, oProp) {
			if (oProp.group === "G1") {
				oItem.visibleInDialog = false;
			} else {
				oItem.visibleInDialog = true;
			}
			oItem.visible = aVisible.indexOf(oProp.key) > -1;
			return true;
		}, true);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();

		const iFinalGroups = getGroups(this.oAFPanel.getCurrentViewContent()._oListControl).length;
		assert.ok(iFinalGroups < iInitialGroups, "Fewer groups visible after filtering");
	});

	QUnit.test("Change event propagation from content", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const fnChangeSpy = sinon.spy(this.oAFPanel, "fireChange");

		this.oAFPanel.getCurrentViewContent().fireChange();

		assert.ok(fnChangeSpy.calledOnce, "Change event fired on panel");
		fnChangeSpy.restore();
	});

	QUnit.test("Test _enhanceP13nData: re-insert filtered invisible items at their old position", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 1, visible: true, isFiltered: false},
			{name: "field3", label: "Field 3", position: 2, visible: false, isFiltered: true},
			{name: "field4", label: "Field 4", position: 3, visible: true, isFiltered: false},
			{name: "field5", label: "Field 5", position: 4, visible: true, isFiltered: false}
		];

		// Set existing items in the model (simulating previous state where field3 was at position 2)
		oViewContent._getP13nModel().setProperty("/items", [
			{name: "field1", position: 0},
			{name: "field2", position: 1},
			{name: "field3", position: 2},
			{name: "field4", position: 3},
			{name: "field5", position: 4}
		]);

		// Act:
		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		// Assert: Check that field3 maintains its old position
		const oField3 = aEnhancedData.find((oItem) => oItem.name === "field3");
		assert.equal(oField3.position, 2, "Filtered invisible item field3 maintains position 2");

		const aPositions = aEnhancedData.map((oItem) => oItem.position);
		const aSortedPositions = [...aPositions].sort((a, b) => {
			if (a === -1) {
				return 1;
			}
			if (b === -1) {
				return -1;
			}
			return a - b;
		});
		assert.deepEqual(aPositions, aSortedPositions, "Items are sorted by position");
	});

	QUnit.test("Test _enhanceP13nData: handle multiple filtered invisible items", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 1, visible: false, isFiltered: true},
			{name: "field3", label: "Field 3", position: 2, visible: false, isFiltered: true},
			{name: "field4", label: "Field 4", position: 3, visible: true, isFiltered: false}
		];

		oViewContent._getP13nModel().setProperty("/items", [
			{name: "field1", position: 0},
			{name: "field2", position: 1},
			{name: "field3", position: 2},
			{name: "field4", position: 3}
		]);

		// Act
		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		// Assert:
		const oField2 = aEnhancedData.find((oItem) => oItem.name === "field2");
		const oField3 = aEnhancedData.find((oItem) => oItem.name === "field3");

		assert.equal(oField2.position, 1, "First filtered invisible item maintains position 1");
		assert.equal(oField3.position, 2, "Second filtered invisible item maintains position 2");
	});

	QUnit.test("Test _enhanceP13nData: ignore items with position -1", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 1, visible: false, isFiltered: true}
		];

		oViewContent._getP13nModel().setProperty("/items", [
			{name: "field1", position: 0},
			{name: "field2", position: -1} // Not positioned
		]);

		// Act
		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		// Assert:
		const oField2 = aEnhancedData.find((oItem) => oItem.name === "field2");
		assert.ok(oField2, "Field2 exists in enhanced data");
		assert.ok(!oField2.oldPosition, "oldPosition temporary variable is cleaned up");
	});

	QUnit.test("Test _enhanceP13nData: position shifting for subsequent items", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		// Setup:
		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 2, visible: true, isFiltered: false}, // Will be shifted
			{name: "field3", label: "Field 3", position: 1, visible: false, isFiltered: true}  // Will be inserted at position 1
		];

		oViewContent._getP13nModel().setProperty("/items", [
			{name: "field1", position: 0},
			{name: "field2", position: 1}, // Currently at position 1
			{name: "field3", position: 1}  // Old position 1, now filtered
		]);

		// Act
		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		// Assert:
		const oField3 = aEnhancedData.find((oItem) => oItem.name === "field3");
		assert.equal(oField3.position, 1, "Filtered item field3 is at position 1");

		const aSortedByPosition = [...aEnhancedData].sort((a, b) => {
			if (a.position === -1) {
				return 1;
			}
			if (b.position === -1) {
				return -1;
			}
			return a.position - b.position;
		});
		assert.deepEqual(aEnhancedData, aSortedByPosition, "Enhanced data is correctly sorted");
	});

	QUnit.test("Test _enhanceP13nData: no existing items in model", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 1, visible: false, isFiltered: true}
		];

		// Clear existing items
		oViewContent._getP13nModel().setProperty("/items", null);

		// Act
		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		// Assert:
		assert.ok(aEnhancedData, "Enhanced data is returned");
		assert.equal(aEnhancedData.length, 2, "All items are present");
	});

	QUnit.module(`${sModeName} - Modern addCustomView Specific Tests`, {
		beforeEach: async function() {
			this.fnNewUIStub = sinon.stub(AdaptFiltersPanel.prototype, "_checkIsNewUI").returns(true);

			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel({
				defaultView: "group",
				footer: new Toolbar("ID_TB_MODERN_CUSTOM", {})
			});

			this.oAFPanel.setItemFactory(function() {
				const oFilterField = new FilterField();
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout();
				oFilterGroupLayout.setFilterField(oFilterField);
				return oFilterGroupLayout;
			});

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.fnNewUIStub.restore();
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("addCustomView creates IconTabFilter instead of Item", async function(assert) {
		// Arrange & Act
		this.oAFPanel.addCustomView({
			item: new Item({
				key: "iconTabView",
				text: "Chart"
			}),
			content: new List("iconTabViewList", {})
		});
		await nextUIUpdate();

		// Assert
		const oViewSwitch = this.oAFPanel._getViewSwitch();
		assert.ok(oViewSwitch.isA("sap.m.IconTabBar"), "View switch is an IconTabBar in Modern mode");

		const oAddedItem = oViewSwitch.getItems().find((item) => item.getKey() === "iconTabView");
		assert.ok(oAddedItem, "The custom view item was added");
		assert.ok(oAddedItem.isA("sap.m.IconTabFilter"), "The item is an IconTabFilter");
		assert.equal(oAddedItem.getText(), "Chart", "The text property is preserved");
	});

	QUnit.test("addCustomView search and filterSelect callbacks are ignored in Modern mode", async function(assert) {
		// Arrange
		let bSearchCalled = false;
		let bFilterSelectCalled = false;

		this.oAFPanel.addCustomView({
			item: new Item({
				key: "ignoredCallbacks"
			}),
			content: new List("ignoredCallbacksList", {}),
			search: function() {
				bSearchCalled = true;
			},
			filterSelect: function() {
				bFilterSelectCalled = true;
			}
		});
		await nextUIUpdate();

		// Act - switch to custom view
		this.oAFPanel.switchView("ignoredCallbacks");
		await nextUIUpdate();

		// Assert - search and filterSelect should not have hooks in Modern mode
		// The implementation sets them to undefined, so they won't be attached
		assert.notOk(bSearchCalled, "Search callback was not called (not supported in Modern mode)");
		assert.notOk(bFilterSelectCalled, "filterSelect callback was not called (not supported in Modern mode)");
	});

	QUnit.test("addCustomView selectionChange callback works in Modern mode", async function(assert) {
		// Arrange
		const done = assert.async();
		const oItem = new Item({
			key: "modernCallback"
		});

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("modernCallbackList", {}),
			selectionChange: function(sKey) {
				// Assert
				assert.equal(sKey, "modernCallback", "selectionChange callback receives correct key in Modern mode");
				done();
			}
		});
		await nextUIUpdate();

		// Act - use 'select' event for Modern mode
		const oViewSwitch = this.oAFPanel._getViewSwitch();
		const oIconTabItem = oViewSwitch.getItems().find((item) => item.getKey() === "modernCallback");
		oViewSwitch.fireEvent("select", {
			item: oIconTabItem
		});
	});

	QUnit.test("addCustomView enabled binding is cloned to IconTabFilter", async function(assert) {
		// Arrange
		const oModel = new JSONModel({ isEnabled: false });
		const oItem = new Item({
			key: "boundEnabledView"
		});
		oItem.setModel(oModel);
		oItem.bindProperty("enabled", { path: "/isEnabled" });

		// Act
		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("boundEnabledList", {})
		});
		await nextUIUpdate();

		// Assert
		const oViewSwitch = this.oAFPanel._getViewSwitch();
		const oIconTabItem = oViewSwitch.getItems().find((item) => item.getKey() === "boundEnabledView");
		assert.ok(oIconTabItem, "The IconTabFilter was created");

		// The binding info should be cloned
		const oBindingInfo = oIconTabItem.getBindingInfo("enabled");
		assert.ok(oBindingInfo, "The enabled binding was cloned to IconTabFilter");
	});
}

	QUnit.module(`${sModeName} - 'AdaptFiltersPanel' instance with a custom model name`,{
		beforeEach: async function() {
			if (sModeName === "Modern") {
				this.fnNewUIStub = sinon.stub(AdaptFiltersPanel.prototype, "_checkIsNewUI").returns(true);
			}

			this.oAFPanel = new AdaptFiltersPanel();

			this.oAFPanel.P13N_MODEL = "$My_very_own_model";

			this.aMockInfo = aInfoData;
			this.oAFPanel.setItemFactory(function(){
				return new CustomListItem({
					//Check both ways, one time via P13N_MODEL, one time hard coded
					selected: "{" + this.oAFPanel.P13N_MODEL + ">selected}",
					visible: "{" + "$My_very_own_model" + ">visibleInDialog}"
				});
			}.bind(this));

			this.oPropertyHelper = new PropertyHelper(this.aMockInfo);
			this.oP13nData = P13nBuilder.prepareAdaptationData(aInfoData, function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			}, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();

		},
		afterEach: function() {
			this.fnNewUIStub?.restore();
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Instantiate panel and check model", function(assert){
		assert.ok(this.oAFPanel, "Panel created");
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		assert.ok(this.oAFPanel.getP13nModel().isA("sap.ui.model.json.JSONModel"), "Model has been set");
		assert.ok(!this.oAFPanel.getModel("$p13n"), "The default $p13n model has not been set");
		assert.ok(this.oAFPanel.getModel("$My_very_own_model").isA("sap.ui.model.json.JSONModel"), "Model has been set");
	});
});

});
