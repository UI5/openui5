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
	"sap/m/ComboBox",
	"sap/ui/core/ListItem",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/m/VBox",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/model/Filter",
	"sap/m/table/Util",
	"sap/m/Input"
], function(AdaptFiltersPanel, P13nBuilder, JSONModel, CustomListItem, Toolbar, Event, Text, List, SegmentedButtonItem, ComboBox, Item, PropertyHelper, VBox, nextUIUpdate, Filter, TableUtil, Input) {
	"use strict";

	const aVisible = ["key1", "key2", "key3"];

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
			dataType: "String"
		},
		{
			name: "key5",
			label: "Field 5",
			group: "G2",
			dataType: "String"
		},
		{
			name: "key6",
			label: "Field 6",
			group: "G2",
			tooltip: "Some Tooltip",
			dataType: "String"
		}
	];

	QUnit.module("API Tests", {
		beforeEach: async function(){
			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel({
				defaultView: "group"
			});

			this.oAFPanel.setItemFactory(function(){
				const oVBox = new VBox();
				oVBox.getValueState = function() {
					return "None";
				};
				oVBox.getConditions = function() {
					return [];
				};
				oVBox.setValueState = function() {};
				oVBox.setValueStateText = function() {};
				return oVBox;
			});

			this.fnEnhancer = function(mItem, oProperty) {

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

			this.oCurrentContent = this.oAFPanel.getCurrentViewContent();

			// this.oCurrentContent.placeAt("qunit-fixture");
			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
			this.oCurrentContent = null;
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
		await nextUIUpdate();

		// const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		this.oCurrentContent._getSearchField().setValue("Field 5");
		const oFakeEvent = new Event("liveSearch", this.oCurrentContent._getSearchField(), {});

		this.oCurrentContent._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		const oList = this.oCurrentContent._oListControl;
		// Assert: Only one item is shown, of group G2
		assert.ok(oList.getItems()[0].isA("sap.m.GroupHeaderListItem"), "Group is shown");
		assert.equal(oList.getItems()[0].getTitle(), "Basic", "Group is correct");
		assert.equal(oList.getItems()[1].getVisible(), true, "Item is visible");
	});

	QUnit.test("Check Search implementation - also for ToolTip", async function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();
		this.oCurrentContent._getSearchField().setValue("Some Tooltip");
		const oFakeEvent = new Event("liveSearch", this.oCurrentContent._getSearchField(), {});

		this.oCurrentContent._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		const oList = this.oCurrentContent._oListControl;
		assert.ok(oList.getItems()[0].isA("sap.m.GroupHeaderListItem"), "Group is shown");
		assert.equal(oList.getItems()[0].getTitle(), "Basic", "Group is correct");
		assert.equal(oList.getItems()[1].getVisible(), true, "Item is visible");
	});

	QUnit.test("Check that groups are initially only displayed if necessary", async function(assert){
		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();
		const getGroupsCount = () => {
			const oVisibleItems = this.oCurrentContent._oListControl.getVisibleItems();
			let iGroupsCount = 0;
			oVisibleItems.forEach(function(oItem){
			if (oItem.isA("sap.m.GroupHeaderListItem") && oItem.getVisible()) {
				iGroupsCount++;
			}
			});
			if (iGroupsCount > 0) {
				return iGroupsCount;
			}
		};
		assert.equal(getGroupsCount(), 2, "All groups visible");
		oP13nData.items.forEach(function(oItem){
			if (oItem.group === "G1") {
				oItem.visibleInDialog = false;
			}
		});

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();
		assert.equal(getGroupsCount(), 1, "Only necessary groups visible");

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
		await nextUIUpdate();

		this.oAFPanel.switchView("list");
		const bFieldIsNotVisible = this.oCurrentContent._oListControl.getItems()[1].getDomRef();
		// const oInvisibleItemDomRef = this.oCurrentContent._oListControl.getItems()[1].getDomRef();
		await nextUIUpdate();
		assert.equal(bFieldIsNotVisible, null, "The Field 2 is invisible in the dialog");

	});
	QUnit.test("Check view toggle", function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("group");

		assert.equal(this.oCurrentContent._oViewModel.getProperty("/selectedKey"), "group", "Group view is the default");

		this.oAFPanel.switchView("group");
		assert.equal(this.oAFPanel._oViewModel.getProperty("/selectedKey"), "group", "Group view is unchanged");

		this.oAFPanel.switchView("list");
		assert.equal(this.oAFPanel._oViewModel.getProperty("/selectedKey"), "list", "List view should be selected");

		this.oAFPanel.switchView("group");
		assert.equal(this.oAFPanel._oViewModel.getProperty("/selectedKey"), "group", "List view should be selected");

	});

//TODO: check if we use AddCustomView
	QUnit.test("Check 'restoreDefaults' to reset to initial values", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.setDefaultView("list");

		let oCurrentContent = this.oAFPanel.getCurrentViewContent();
		oCurrentContent._getSearchField().setValue("Test"); //Set a search value
		this.oAFPanel.switchView("group"); //Switch to group view

		oCurrentContent = this.oAFPanel.getCurrentViewContent();
		const oFilterSpy = sinon.spy(oCurrentContent, "_filterByModeAndSearch");
		assert.equal(oCurrentContent._getSearchField().getValue(), "Test", "Value 'Test' is present on the SearchField");

		await this.oAFPanel.restoreDefaults();

		//assert that defaults have been restored
		oCurrentContent = this.oAFPanel.getCurrentViewContent();
		assert.equal(oCurrentContent._oViewModel.getProperty("/grouped"), false, "The grouped property is false after defaults have been restored");
		assert.equal(this.oAFPanel._oPanelHeader.getSelectedKey(), "list", "The list view has been set as default view");
		assert.equal(oCurrentContent._getSearchField().getValue(), "", "SearchField is empty after defaults have been restored");
		assert.ok(oFilterSpy.called, "Filter logic executed again after defaults have been restored");
		//cleanups
		oFilterSpy.restore();

	});
//TODO: to be discussed if we want to keep custom model name

	// QUnit.module("'AdaptFiltersPanel' instance with a custom model name",{
	// 	beforeEach: async function() {
	// 		this.oAFPanel = new AdaptFiltersPanel();

	// 		this.oAFPanel.P13N_MODEL = "$My_very_own_model";

	// 		this.aMockInfo = aInfoData;
	// 		this.oAFPanel.setItemFactory(function(){
	// 			return new CustomListItem({
	// 				//Check both ways, one time via P13N_MODEL, one time hard coded
	// 				selected: "{" + this.oAFPanel.P13N_MODEL + ">selected}",
	// 				visible: "{" + "$My_very_own_model" + ">visibleInDialog}"
	// 			});
	// 		}.bind(this));

	// 		this.oPropertyHelper = new PropertyHelper(this.aMockInfo);
	// 		this.oP13nData = P13nBuilder.prepareAdaptationData(aInfoData, function(mItem, oProperty) {
	// 			if (oProperty.name == "key2") {
	// 				mItem.active = true;
	// 			}
	// 			mItem.visibleInDialog = true;
	// 			mItem.visible = aVisible.indexOf(oProperty.name) > -1;
	// 			return true;
	// 		}, true);

	// 		this.oAFPanel.placeAt("qunit-fixture");
	// 		await nextUIUpdate();

	// 	},
	// 	afterEach: function() {
	// 		this.oAFPanel.destroy();
	// 	}
	// });

	// QUnit.test("Instantiate panel and check model", function(assert){
	// 	this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
	// 	assert.ok(this.oAFPanel.getP13nModel().isA("sap.ui.model.json.JSONModel"), "Model has been set");
	// 	assert.ok(!this.oAFPanel.getModel("$p13n"), "The default $p13n model has not been set");
	// 	assert.ok(this.oAFPanel.getModel("$My_very_own_model").isA("sap.ui.model.json.JSONModel"), "Custom model is set");
	// });
	QUnit.test("Check '_onModeChange' sets sort mode", async function(assert) {
		// Arrange
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const oSortItem = this.oAFPanel._getModeButton().getItems()[1];

		// Act
		this.oAFPanel._onModeChange({ getParameter: function() { return oSortItem; } });
		await nextUIUpdate();

		// Assert
		assert.equal(this.oAFPanel._oViewModel.getProperty("/editable"), false, "Panel is not editable in sort mode");
		assert.equal(this.oAFPanel._oListControl.getKeyboardMode(), "Navigation", "List control is in Navigation mode in sort mode");
	});

	QUnit.test("Check '_onModeChange' sets edit mode", async function(assert) {
		// Arrange
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const oEditItem = this.oAFPanel._getModeButton().getItems()[0];

		// Act
		this.oAFPanel._onModeChange({ getParameter: function() { return oEditItem; } });
		await nextUIUpdate();

		// Assert
		assert.equal(this.oAFPanel._oViewModel.getProperty("/editable"), true, "Panel is editable after switching back to edit mode");
		assert.equal(this.oAFPanel._oListControl.getKeyboardMode(), "Edit", "List control is in Edit mode after switching back");
	});

	QUnit.test("Check '_sortItems' sorts items by position", function(assert) {
		// Arrange
		const aItems = [
			{ name: "A", position: 2 },
			{ name: "B", position: -1 },
			{ name: "C", position: 1 },
			{ name: "D", position: 0 },
			{ name: "E", position: -1 }
		];

		// Act
		this.oAFPanel._sortItems(aItems);

		// Assert
		assert.deepEqual(
			aItems.map(function(item){ return item.name; }),
			["D", "C", "A", "B", "E"],
			"Items are sorted by position, with -1 at the end"
		);
	});

	QUnit.test("Check '_onListActionPress' removes item and fires change", async function(assert) {
		// Arrange
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const oListControl = this.oAFPanel._oListControl;
		const oFirstItem = oListControl.getItems().find(function(item){
			return item.isA("sap.m.CustomListItem") && item.getBindingContext && item.getBindingContext(this.oAFPanel.P13N_MODEL);
		}.bind(this));
		const oItemData = this.oAFPanel._getModelEntry(oFirstItem);

		const oDeleteAction = {
			getType: function() { return "Delete"; }
		};

		const oEvent = {
			getParameter: function(param) {
				if (param === "action") {return oDeleteAction;}
				if (param === "listItem") {return oFirstItem;}
			}
		};

		const fnChangeSpy = sinon.spy(this.oAFPanel, "fireChange");

		// Act
		this.oAFPanel._onListActionPress(oEvent);
		await nextUIUpdate();

		// Assert
		const aItems = this.oAFPanel.getP13nModel().getProperty("/items");
		assert.notOk(aItems.find(function(item){ return item.name === oItemData.name && item.visible; }), "Item is no longer visible after delete");
		assert.ok(fnChangeSpy.called, "fireChange was called");
		assert.equal(fnChangeSpy.lastCall.args[0].reason, this.oAFPanel.CHANGE_REASON_REMOVE, "Change reason is 'Remove'");

		// Clean up
		fnChangeSpy.restore();
	});

	QUnit.test("Check '_moveListItem' moves item and fires change", async function(assert) {
		// Arrange
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const oListControl = this.oAFPanel._oListControl;
		const aCustomItems = oListControl.getItems().filter(function(item){
			return item.isA("sap.m.CustomListItem") && item.getBindingContext && item.getBindingContext(this.oAFPanel.P13N_MODEL);
		}.bind(this));

		const oFirstItem = aCustomItems[0];
		const oItemData = this.oAFPanel._getModelEntry(oFirstItem);

		const fnChangeSpy = sinon.spy(this.oAFPanel, "fireChange");

		// Act
		this.oAFPanel._moveListItem(oFirstItem, 2);
		await nextUIUpdate();

		// Assert
		const aItems = this.oAFPanel.getP13nModel().getProperty("/items");
		const movedItem = aItems.find(function(item){ return item.name === oItemData.name; });
		assert.equal(movedItem.position, 1, "Item position updated after move");
		assert.ok(fnChangeSpy.called, "fireChange was called");
		assert.equal(fnChangeSpy.lastCall.args[0].reason, this.oAFPanel.CHANGE_REASON_REORDER, "Change reason is 'Reorder'");

		// Clean up
		fnChangeSpy.restore();
	});

	QUnit.test("Check '_selectKey' adds item and fires change", async function(assert) {
		// Arrange
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();
		const oComboBox = new ComboBox({
			items: [
				new Item({ key: "key1", text: "Field 1" }),
				new Item({ key: "key2", text: "Field 2" }),
				new Item({ key: "key3", text: "Field 3" }),
				new Item({ key: "key4", text: "Field 4" }),
				new Item({ key: "key5", text: "Field 5" }),
				new Item({ key: "key6", text: "Field 6" })
			]
		});
		oComboBox.setSelectedKey("key4");
		const fnChangeSpy = sinon.spy(this.oAFPanel, "fireChange");

		// Act
		this.oAFPanel._selectKey(oComboBox);

		// Assert
		const aItems = this.oAFPanel.getP13nModel().getProperty("/items");
		assert.equal(aItems.find(function(item){ return item.name === "key4"; }).visible, true, "Item 'key4' is now visible");
		assert.equal(aItems.find(function(item){ return item.name === "key4"; }).position, 0, "Item 'key4' position is correct");
		assert.equal(this.oAFPanel._oAddFilterSelect.getVisible(), true, "Add filter section is visible");
		assert.ok(fnChangeSpy.called, "fireChange was called");
		assert.equal(fnChangeSpy.lastCall.args[0].reason, this.oAFPanel.CHANGE_REASON_ADD, "Change reason is 'Add'");
		assert.equal(fnChangeSpy.lastCall.args[0].item.name, "key4", "Added item is 'key4'");

		// Clean up
		fnChangeSpy.restore();
	});
	QUnit.test("Check '_announceSearchUpdate' announces correct count", async function(assert) {
		// Arrange
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const fnAnnounceSpy = sinon.spy(TableUtil, "announceTableUpdate");

		// Act
		this.oAFPanel._announceSearchUpdate();

		// Assert
		assert.ok(fnAnnounceSpy.calledOnce, "announceTableUpdate was called");
		const sExpectedTitle = this.oAFPanel._getResourceText("adaptFiltersPanel.TOOLBAR_TITLE");
		const iExpectedCount = this.oAFPanel._oListControl.getItems().filter((item) => item.getVisible()).length;
		assert.equal(fnAnnounceSpy.firstCall.args[0], sExpectedTitle, "Correct title announced");
		assert.equal(fnAnnounceSpy.firstCall.args[1], iExpectedCount, "Correct count announced");

		// Clean up
		fnAnnounceSpy.restore();
	});
});
