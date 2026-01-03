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
	"sap/m/SegmentedButtonItem",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/m/VBox",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/model/Filter",
	"sap/m/Input",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/p13n/FilterGroupLayout"
], function(AdaptFiltersPanel, P13nBuilder, JSONModel, CustomListItem, Toolbar, Event, Text, List, SegmentedButtonItem, PropertyHelper, VBox, nextUIUpdate, Filter, Input, FilterField, FilterGroupLayout) {
	"use strict";

	const aInfoData = [
		{
			name: "key1",
			label: "Field 1",
			group: "G1",
			dataType: "String"
		},
		{
			name: "key2",
			label: "Field 2",
			group: "G1",
			dataType: "String"
		},
		{
			name: "key3",
			label: "Field 3",
			group: "G1",
			dataType: "String"
		},
		{
			name: "key4",
			label: "Field 4",
			group: "G2",
			groupLabel: "Group 2",
			dataType: "String"
		},
		{
			name: "key5",
			label: "Field 5",
			group: "G2",
			groupLabel: "Group 2",
			dataType: "String"
		},
		{
			name: "key6",
			label: "Field 6",
			group: "G2",
			groupLabel: "Group 2",
			tooltip: "Some Tooltip",
			dataType: "String"
		}
	];

	const sMode = ["Legacy", "Modern"];

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

	QUnit.module(`${sModeName} - API Tests`, {
		beforeEach: async function() {
			if (sModeName === "Modern") {
				this.fnNewUIStub = sinon.stub(AdaptFiltersPanel.prototype, "_checkIsNewUI").returns(true);
			}

			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel({
				defaultView: "group",
				footer: new Toolbar("ID_TB1",{})
			});

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
				if (oProperty.name == "key2") {
					mItem.active = true;
				}

				//Add (mock) a 'mandatory' field
				if (oProperty.name == "key5") {
					mItem.required = true;
				}

				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.name) > -1;
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
			if (oProp.name == "key2") {
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

	QUnit.test("Check 'addCustomView'", function(assert){

		//add a custom view
		this.oAFPanel.addCustomView({
			item: new SegmentedButtonItem({
				key: "test",
				icon: "sap-icon://bar-chart"
			}),
			content: new List("myCustomList1",{})
		});

		//Check that the UI has been enhanced
		assert.equal(this.oAFPanel.getViews().length, 3, "A custom view has been added");
		assert.equal(this.oAFPanel._getViewSwitch().getItems().length, 3, "The item has been set on the view switch control");
	});

	QUnit.test("Check 'addCustomView' can be used via 'switchView'", async function(assert){

		//add a custom view
		this.oAFPanel.addCustomView({
			item: new SegmentedButtonItem({
				key: "test",
				icon: "sap-icon://bar-chart"
			}),
			content: new List("myCustomList2",{})
		});
		await nextUIUpdate();

		this.oAFPanel.switchView("test");

		assert.equal(this.oAFPanel.getCurrentViewKey(), "test", "Correct view has been selected");

		assert.equal(this.oAFPanel._getViewSwitch().getSelectedKey(), "test", "Correct item has been selected in the SegmentedButton");
	});

	QUnit.test("Check 'addCustomView' view switch callback execution", async function(assert){
		const done = assert.async();
		const oItem = new SegmentedButtonItem({
			key: "test",
			icon: "sap-icon://bar-chart"
		});

		//add a custom view
		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("myCustomList3",{}),
			selectionChange: function(sKey){
				assert.equal(sKey, "test", "Callback executed with key");
				done();
			}
		});
		await nextUIUpdate();

		const sSelectionChangeEvent = sModeName === "Modern" ? "select" : "selectionChange";
		this.oAFPanel._getViewSwitch().fireEvent(sSelectionChangeEvent, {
			item: oItem
		});

	});


	QUnit.test("Check 'addCustomView' error if no key is provided", function(assert){

		assert.throws(
			function () {
				this.oAFPanel.addCustomView({
					item: new SegmentedButtonItem({
						icon: "sap-icon://bar-chart"
					}),
					content: new List({}),
					selectionChange: function(sKey){
					}
				});
			},
			function (oError) {
				return (
					oError instanceof Error &&
					oError.message ===
						"Please provide an item of type sap.m.SegmentedButtonItem with a key"
				);
			},
			"An error should be thrown if no item is provided or if the key is missing"
		);

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

	// Search field is not part of the "global" content anymore, specific to the view
	QUnit.test("Check 'addCustomView' search callback execution", function(assert){
		const done = assert.async();

		//add a custom view
		this.oAFPanel.addCustomView({
			item: new SegmentedButtonItem({
				key: "test",
				icon: "sap-icon://bar-chart"
			}),
			content: new List("myCustomList",{}),
			search: function(sValue){
				assert.equal(sValue, "Test", "Callback executed with searched String");
				done();
			}
		});

		this.oAFPanel.switchView("test");

		this.oAFPanel._getSearchField().setValue("Test");
		this.oAFPanel._getSearchField().fireLiveChange();
	});

	// Quick Filter option does not exist anymore
	QUnit.test("Check 'addCustomView' filterChange callback execution", async function(assert){
		const done = assert.async(2);

		let iCount = 0;

		//add a custom view
		this.oAFPanel.addCustomView({
			item: new SegmentedButtonItem({
				key: "test",
				icon: "sap-icon://bar-chart"
			}),
			content: new List("myCustomList",{}),
			filterSelect: function(sValue){
				if (iCount == 1) {
					assert.equal(sValue, "all", "Callback executed with 'all' key");
				}
				if (iCount == 2) {
					assert.equal(sValue, "visible", "Callback executed with 'visible' key");
				}
				iCount++;
				done();
			}
		});

		await nextUIUpdate();

		//Switch to custom view
		this.oAFPanel.switchView("test");

		//Trigger a Select event (with 'all')
		this.oAFPanel._getQuickFilter().fireChange({
			selectedItem: this.oAFPanel._getQuickFilter().getItems()[0]
		});

		//Trigger a Select event (with 'visible')
		this.oAFPanel._getQuickFilter().fireChange({
			selectedItem: this.oAFPanel._getQuickFilter().getItems()[0]
		});
	});

	QUnit.test("Check 'addCustomView' searchcallback on view switch execution", function (assert) {
		const done = assert.async();
		const oItem = new SegmentedButtonItem({
			key: "test",
			icon: "sap-icon://bar-chart"
		});
		//add a custom view
		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("myCustomList4", {}),
			search: function (sSearch) {
				assert.equal(sSearch, "Test", "Callback executed with key");
				done();
			}
		});
		this.oAFPanel._getSearchField().setValue("Test");
		this.oAFPanel._getViewSwitch().fireSelectionChange({
			item: oItem
		});
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
			oItem.visible = aVisible.indexOf(oProp.name) > -1;
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
				if (oProperty.name == "key2") {
					mItem.active = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.name) > -1;
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
