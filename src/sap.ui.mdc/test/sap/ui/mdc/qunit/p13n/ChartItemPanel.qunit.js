/* global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/mdc/p13n/panels/ChartItemPanel",
	"sap/ui/model/json/JSONModel",
	"sap/m/VBox",
	"sap/ui/thirdparty/sinon",
	"sap/ui/test/actions/Press",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/library"
], function(Library, ChartItemPanel, JSONModel, VBox, sinon, Press, nextUIUpdate, coreLibrary) {
	"use strict";

	const ValueState = coreLibrary.ValueState;
	const MDCRb = Library.getResourceBundleFor("sap.ui.mdc");

	const oChartConfig = {
		allowedLayoutOptions: ["axis1", "category", "series"], templateConfig: [{kind: "Dimension"},{kind: "Measure"}]
	};

	const oErrorConfig = {
		chartType: "combination",
		invalidChartType: false,
		errorMessage: "<error message>"
	};

	QUnit.module("ChartItemPanelNew Unit tests", {
		beforeEach: async function(){
			await nextUIUpdate();

			const aItems = [
				{
					label: "Test",
					name: "test",
					visible: true,
					kind: "Dimension",
					role: "category"
				},
				{
					label: "Test2",
					name: "test2",
					visible: true,
					kind: "Measure",
					role: "axis1"
				},
				{
					label: "Test3",
					name: "test3",
					visible: true,
					kind: "Measure",
					role: "axis1"
				},
				{
					label: "Test4",
					name: "test4",
					visible: false,
					kind: "Measure",
					role: "axis1"
				}
			];

			this.oChartItemPanel = new ChartItemPanel("CIP", {panelConfig: oChartConfig, errorConfig: oErrorConfig});
			this.oChartItemPanel.setP13nData(aItems);
			this.oChartItemPanel.placeAt("qunit-fixture");
		}.bind(this),
		afterEach: function(){
			this.oChartItemPanel.destroy();
		}.bind(this)
	});

	QUnit.test("instantiate ChartItemPanel", function(assert){
		//var done = assert.async();
		assert.ok(this.oChartItemPanel);

		assert.ok(this.oChartItemPanel._oListControl, "Inner list control created");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly"); //3 visible Items, 2 Group Headers, 2 Templates
		assert.ok(this.oChartItemPanel.getEnableReorder(), "EnableReorder property is set to true");
		assert.ok(this.oChartItemPanel.getAggregation("_content") instanceof VBox, "Panel contains a VBox");
		assert.ok(this.oChartItemPanel.getAggregation("_content").getItems()[0].isA("sap.m.Table"), "VBox contains a table");
		assert.ok(this.oChartItemPanel._sContainerResizeListener, "Resize listener is created");

	}.bind(this));

	QUnit.test("_switchMobileMode", function(assert){
		const oCreateListControlSpy = sinon.spy(this.oChartItemPanel, "_createInnerListControl");
		const oBindListItemsSpy = sinon.spy(this.oChartItemPanel, "_bindListItems");
		assert.ok(!this.oChartItemPanel._bMobileMode, "Mobile mode is set to false");

		//Call with bMobile = false
		this.oChartItemPanel._switchMobileMode(false);
		assert.ok(!oCreateListControlSpy.called, "Table should not have changed");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly");
		assert.ok(this.oChartItemPanel._oListControl.getItems()[1].getCells().length == 3, "Table content has correct amount of cells");
		assert.ok(!oBindListItemsSpy.called, "List items were not rebound");

		//Call with bMobile = true
		this.oChartItemPanel._switchMobileMode(true);
		assert.ok(oCreateListControlSpy.calledOnce, "Table should have changed");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly");
		assert.ok(this.oChartItemPanel._oListControl.getItems()[1].getCells().length == 2, "Table content has correct amount of cells");
		assert.ok(oBindListItemsSpy.calledOnce, "List items were rebound");

		//Call with bMobile = false
		this.oChartItemPanel._switchMobileMode(false);
		assert.ok(oCreateListControlSpy.calledTwice, "Table should have changed");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly");
		assert.ok(this.oChartItemPanel._oListControl.getItems()[1].getCells().length == 3, "Table content has correct amount of cells");
		assert.ok(oBindListItemsSpy.calledTwice, "List items were rebound");

	}.bind(this));

	QUnit.test("_bindListItems", function(assert){
		const oBindItemsSpy = sinon.spy(this.oChartItemPanel._oListControl, "bindItems");

		this.oChartItemPanel._bindListItems();

		assert.ok(oBindItemsSpy.calledOnce, "Items were bound to table");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly");

	}.bind(this));

	QUnit.test("_getPlaceholderTextForKind", function(assert){
		assert.ok(this.oChartItemPanel._getPlaceholderTextForTemplate() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_TEMPLATE_PLACEHOLDER'), "Templatecorrect placeholder text");
	}.bind(this));

	QUnit.test("_getRoleSelect", function(assert){
		const oSelect = this.oChartItemPanel._getRoleSelect("Measure");

		assert.ok(oSelect.isA("sap.m.Select"), "Select is returned");
	}.bind(this));

	QUnit.test("_getNameComboBox", function(assert){
		const oSelect = this.oChartItemPanel._getNameComboBox("Measure");

		assert.ok(oSelect.isA("sap.m.ComboBox"), "ComboBox is returned");
	}.bind(this));

	QUnit.test("_updateAvailableRolesForItems", function(assert){
		//Arrange
		let aItems = this.oChartItemPanel._getP13nModel().getProperty("/items");
		assert.ok(aItems.length == 6, "6 items are inside p13n model"); // 4 items + 2 templates

		aItems[0].availableRoles = [{"key": "axis1", "text": "Axis 1"}, {"key": "axis2", "text": "Axis 2"}, {"key": "axis3", "text": "Axis 3"}];
		this.oChartItemPanel._getP13nModel().setProperty("/items", aItems);

		//Act
		this.oChartItemPanel._updateAvailableRolesForItems();

		//Assert
		aItems = this.oChartItemPanel._getP13nModel().getProperty("/items");
		assert.ok(aItems.length == 6, "6 items are inside p13n model");
		assert.ok(aItems[0].availableRoles.length == 1, "Incorrect roles have been deleted");
		assert.ok(aItems[0].availableRoles[0].key == "axis1", "Correct role was kept");

	}.bind(this));


	QUnit.test("onPressHide", function(assert){
		const done = assert.async();
		const oMockEvent = {getSource : function(){return {data : function(){return {propertyName: "test3"};}};}};
		const oUpdateIndexesSpy = sinon.spy(this.oChartItemPanel, "_updateVisibleIndexes");
		assert.ok(this.oChartItemPanel.getP13nData()[2].visible, "Item3 is visible");

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "change event has been fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");
			assert.ok(!oEvent.getParameter("items").visible, "Item3 is invisible in parameter events");
			done();
		});

		this.oChartItemPanel._onPressHide(oMockEvent);

		assert.ok(oUpdateIndexesSpy.calledOnce, "Visible Index update called");
		assert.ok(!this.oChartItemPanel.getP13nData()[2].visible, "Item3 is invisible");

	}.bind(this));

	QUnit.test("setP13nData", function(assert){
		const oUpdateIndexesSpy = sinon.spy(this.oChartItemPanel, "_updateVisibleIndexes");
		const aItems = [
			{
				label: "Test-New",
				name: "test-new",
				visible: true,
				kind: "Dimension"
			},
			{
				label: "Test2-New",
				name: "test2-new",
				visible: true,
				kind: "Measure"
			}
		];

		this.oChartItemPanel.setP13nData(aItems);

		assert.ok(this.oChartItemPanel.getP13nData().length == 2, "Model has correct amount of items");
		assert.ok(this.oChartItemPanel.getP13nData()[0].availableRoles, "Item was updated with available Roles");
		assert.ok(!this.oChartItemPanel.getP13nData()[0].template, "Template property was added");
		assert.ok(this.oChartItemPanel.getP13nData()[1].availableRoles, "Item was updated with available Roles");
		assert.ok(!this.oChartItemPanel.getP13nData()[1].template, "Template property was added");
		assert.ok(oUpdateIndexesSpy.calledOnce, "Visible Index update called");

	}.bind(this));

	QUnit.test("_updateVisibleIndexes", function(assert){
		assert.ok(this.oChartItemPanel._mVisibleIndexes.get("Dimension").length = 1, "Map contains one visible dimension");
		assert.ok(this.oChartItemPanel._mVisibleIndexes.get("Measure").length = 2, "Map contains two visible measures");

		const aItems = this.oChartItemPanel._getP13nModel().getProperty("/items");
		aItems[0].visible = false;

		this.oChartItemPanel._updateVisibleIndexes();

		assert.ok(!this.oChartItemPanel._mVisibleIndexes.get("Dimension"), "No map entry exist for Dimensions");
		assert.ok(this.oChartItemPanel._mVisibleIndexes.get("Measure").length = 2, "Map contains two visible measures");
	}.bind(this));

	//TODO: OnChangeOfTemplateName

	QUnit.test("_getTemplateItems", function(assert){
		const aTemplates = this.oChartItemPanel._getTemplateItems();

		assert.ok(aTemplates.length == 2, "Two templates created");
		assert.ok(aTemplates[0].kind == "Dimension", "Template for Dimension was created");
		assert.ok(aTemplates[1].kind == "Measure", "Template for Measure was created");
	}.bind(this));

	QUnit.test("_getListControlConfig", function(assert){
		let oConfig = this.oChartItemPanel._getListControlConfig();

		assert.ok(oConfig.columns.length == 3, "3 Columns were created");
		assert.ok(oConfig.columns[0].getHeader().getText() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION'), "Column 1 has correct text");
		assert.ok(oConfig.columns[1].getHeader().getText() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_COLUMN_ROLE'), "Column 2 has correct text");
		assert.ok(oConfig.mode == "None", "Mode was set to None");

		this.oChartItemPanel._bMobileMode = true;
		oConfig = this.oChartItemPanel._getListControlConfig();
		assert.ok(oConfig.columns.length == 2, "2 Columns were created for mobile");
		assert.ok(oConfig.columns[0].getHeader().getText() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION')  + " / " + MDCRb.getText('chart.PERSONALIZATION_DIALOG_COLUMN_ROLE'), "Column 1 has correct text");
		assert.ok(oConfig.mode == "None", "Mode was set to None");
	}.bind(this));

	QUnit.test("_getCleanP13nItems", function(assert){
		assert.ok(this.oChartItemPanel._getCleanP13nItems().filter(function(it){return it.template;}).length == 0, "Template not inside clean p13n state");
		assert.ok(this.oChartItemPanel._getCleanP13nItems().length == 4, "Clean p13n state has correct length");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[0].name == "test", "Item 1 has correct name");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[1].name == "test2", "Item 2 has correct name");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[2].name == "test3", "Item 3 has correct name");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[3].name == "test4", "Item 4 has correct name");
	}.bind(this));

	QUnit.test("_fireChangeItems", function(assert){
		const done = assert.async();

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "change event has been fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");

			assert.ok(oEvent.getParameter("items")[0].columnKey == "test", "Item 1 has correct columnKey");
			assert.ok(oEvent.getParameter("items")[0].index == 0, "Item 1 has correct index");
			assert.ok(oEvent.getParameter("items")[0].visible, "Item 1 has correct visibility");
			assert.ok(oEvent.getParameter("items")[0].role == "category", "Item 1 has correct role");

			assert.ok(oEvent.getParameter("items")[1].columnKey == "test2", "Item 2 has correct columnKey");
			assert.ok(oEvent.getParameter("items")[1].index == 1, "Item 2 has correct index");
			assert.ok(oEvent.getParameter("items")[1].visible, "Item 2 has correct visibility");
			assert.ok(oEvent.getParameter("items")[1].role == "axis1", "Item 2 has correct role");

			assert.ok(oEvent.getParameter("items")[2].columnKey == "test3", "Item 3 has correct columnKey");
			assert.ok(oEvent.getParameter("items")[2].index == 2, "Item 2 has correct index");
			assert.ok(oEvent.getParameter("items")[2].visible, "Item 2 has correct visibility");
			assert.ok(oEvent.getParameter("items")[2].role == "axis1", "Item 3 has correct role");

			assert.ok(oEvent.getParameter("items")[3].columnKey == "test4", "Item 4 has correct columnKey");
			assert.ok(oEvent.getParameter("items")[3].index == 3, "Item 2 has correct index");
			assert.ok(!oEvent.getParameter("items")[3].visible, "Item 2 has correct visibility");
			assert.ok(oEvent.getParameter("items")[3].role == "axis1", "Item 4 has correct role");
			done();
		});

		this.oChartItemPanel._fireChangeItems();

	}.bind(this));

	QUnit.test("_updateEnableOfMoveButtons", function(assert){
		let oTableItem = this.oChartItemPanel._oListControl.getItems()[1];

		//Select first dimension
		this.oChartItemPanel._updateEnableOfMoveButtons(oTableItem);
		assert.ok(!this.oChartItemPanel._getMoveTopButton().getEnabled(), "Top button disabled");
		assert.ok(!this.oChartItemPanel._getMoveUpButton().getEnabled(), "Up button disabled");
		assert.ok(!this.oChartItemPanel._getMoveDownButton().getEnabled(), "Down button disabled");
		assert.ok(!this.oChartItemPanel._getMoveBottomButton().getEnabled(), "Bottom button disabled");

		//Select first measure
		oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		this.oChartItemPanel._updateEnableOfMoveButtons(oTableItem);
		assert.ok(!this.oChartItemPanel._getMoveTopButton().getEnabled(), "Top button disabled");
		assert.ok(!this.oChartItemPanel._getMoveUpButton().getEnabled(), "Up button disabled");
		assert.ok(this.oChartItemPanel._getMoveDownButton().getEnabled(), "Down button enabled");
		assert.ok(this.oChartItemPanel._getMoveBottomButton().getEnabled(), "Bottom button enabled");

		//Select second measure
		oTableItem = this.oChartItemPanel._oListControl.getItems()[5];
		this.oChartItemPanel._updateEnableOfMoveButtons(oTableItem);
		assert.ok(this.oChartItemPanel._getMoveTopButton().getEnabled(), "Top button enabled");
		assert.ok(this.oChartItemPanel._getMoveUpButton().getEnabled(), "Up button enabled");
		assert.ok(!this.oChartItemPanel._getMoveDownButton().getEnabled(), "Down button disabled");
		assert.ok(!this.oChartItemPanel._getMoveBottomButton().getEnabled(), "Bottom button disabled");

	}.bind(this));

	QUnit.test("_getMoveTopButton", function(assert){
		const oBtn = this.oChartItemPanel._getMoveTopButton();
		assert.ok(oBtn, "Button exists");
		assert.ok(oBtn.isA("sap.m.Button"), "Button is type of sap.m.Button");

	}.bind(this));

	QUnit.test("_getMoveUpButton", function(assert){
		const oBtn = this.oChartItemPanel._getMoveUpButton();
		assert.ok(oBtn, "Button exists");
		assert.ok(oBtn.isA("sap.m.Button"), "Button is type of sap.m.Button");

	}.bind(this));

	QUnit.test("_getMoveDownButton", function(assert){
		const oBtn = this.oChartItemPanel._getMoveDownButton();
		assert.ok(oBtn, "Button exists");
		assert.ok(oBtn.isA("sap.m.Button"), "Button is type of sap.m.Button");

	}.bind(this));

	QUnit.test("_getMoveBottomButton", function(assert){
		const oBtn = this.oChartItemPanel._getMoveBottomButton();
		assert.ok(oBtn, "Button exists");
		assert.ok(oBtn.isA("sap.m.Button"), "Button is type of sap.m.Button");

	}.bind(this));

	QUnit.test("_getListItemFromMoveButton & _addMoveButtons", function(assert){
		const oTableItem = this.oChartItemPanel._oListControl.getItems()[1];

		this.oChartItemPanel._addMoveButtons(oTableItem);

		let oListItem = this.oChartItemPanel._getListItemFromMoveButton(this.oChartItemPanel._getMoveTopButton());
		assert.ok(oListItem, "ListItem exists");
		assert.ok(oListItem == oTableItem, "Button parent is correct");

		oListItem = this.oChartItemPanel._getListItemFromMoveButton(this.oChartItemPanel._getMoveUpButton());
		assert.ok(oListItem, "ListItem exists");
		assert.ok(oListItem == oTableItem, "Button parent is correct");

		oListItem = this.oChartItemPanel._getListItemFromMoveButton(this.oChartItemPanel._getMoveDownButton());
		assert.ok(oListItem, "ListItem exists");
		assert.ok(oListItem == oTableItem, "Button parent is correct");

		oListItem = this.oChartItemPanel._getListItemFromMoveButton(this.oChartItemPanel._getMoveBottomButton());
		assert.ok(oListItem, "ListItem exists");
		assert.ok(oListItem == oTableItem, "Button parent is correct");

	}.bind(this));

	QUnit.test("_onPressButtonMoveToTop", function(assert){
		const oTableItem = this.oChartItemPanel._oListControl.getItems()[5];
		const oEvent = {getSource : function() {return this.oChartItemPanel._getMoveTopButton();}.bind(this)};
		const oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveSelectedItem");
		this.oChartItemPanel._addMoveButtons(oTableItem);

		this.oChartItemPanel._onPressButtonMoveToTop(oEvent);

		assert.ok(oMoveSpy.calledWithExactly(1), "_moveSelectedItem was called");

	}.bind(this));

	QUnit.test("_onPressButtonMoveToUp", function(assert){
		const oTableItem = this.oChartItemPanel._oListControl.getItems()[5];
		const oEvent = {getSource : function() {return this.oChartItemPanel._getMoveUpButton();}.bind(this)};
		const oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveSelectedItem");
		this.oChartItemPanel._addMoveButtons(oTableItem);

		this.oChartItemPanel._onPressButtonMoveUp(oEvent);

		assert.ok(oMoveSpy.calledWithExactly(1), "_moveSelectedItem was called");

	}.bind(this));

	QUnit.test("_onPressButtonMoveToDown", function(assert){
		const oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		const oEvent = {getSource : function() {return this.oChartItemPanel._getMoveDownButton();}.bind(this)};
		const oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveSelectedItem");
		this.oChartItemPanel._addMoveButtons(oTableItem);

		this.oChartItemPanel._onPressButtonMoveDown(oEvent);

		assert.ok(oMoveSpy.calledWithExactly(2), "_moveSelectedItem was called");

	}.bind(this));

	QUnit.test("_onPressButtonMoveToBottom", function(assert){
		const oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		const oEvent = {getSource : function() {return this.oChartItemPanel._getMoveBottomButton();}.bind(this)};
		const oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveSelectedItem");
		this.oChartItemPanel._addMoveButtons(oTableItem);

		this.oChartItemPanel._onPressButtonMoveToBottom(oEvent);

		assert.ok(oMoveSpy.calledWithExactly(2), "_moveSelectedItem was called");

	}.bind(this));

	QUnit.test("_moveItemsByIndex", function(assert){
		const oUpdateMoveSpy = sinon.spy(this.oChartItemPanel, "_updateEnableOfMoveButtons");
		const oHandleActivatedSpy = sinon.spy(this.oChartItemPanel, "_handleActivated");
		const done = assert.async();

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "ChangeItems event was fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");
			assert.ok(oEvent.getParameter("items")[1].columnKey == "test3", "Item was moved");
			assert.ok(oEvent.getParameter("items")[2].columnKey == "test2", "Event has items parameter with correct length");
			done();
		});

		this.oChartItemPanel._moveItemsByIndex(1,2);

		assert.ok(this.oChartItemPanel._getCleanP13nItems()[1].name == "test3", "Item was moved");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[2].name == "test2", "Item was moved");
		assert.ok(oUpdateMoveSpy.called, "UpdateMoveButtons was called");
		assert.ok(oHandleActivatedSpy, "_handleActivated was called");

	}.bind(this));

	QUnit.test("_getModelItemByTableItem", function(assert){
		assert.ok(this.oChartItemPanel._getModelItemByTableItem(this.oChartItemPanel._oListControl.getItems()[1]).name == "test", "_getModelItemByTableItem retured correct item for table row");
		assert.ok(this.oChartItemPanel._getModelItemByTableItem(this.oChartItemPanel._oListControl.getItems()[4]).name == "test2", "_getModelItemByTableItem retured correct item for table row");
		assert.ok(this.oChartItemPanel._getModelItemByTableItem(this.oChartItemPanel._oListControl.getItems()[5]).name == "test3", "_getModelItemByTableItem retured correct item for table row");
	}.bind(this));

	QUnit.test("_getMoveConfigForTableItem", function(assert){
		let oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[0]);
		assert.ok(oConfig == undefined, "No config returned for grouping row");

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[1]);
		assert.ok(oConfig.aggregationRole == "Dimension", "Correct aggregation role returned");
		assert.ok(oConfig.template == false, "Template field not set");
		assert.ok(oConfig.currentIndex == 0, "Correct index returned returned");

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[2]);
		assert.ok(oConfig.aggregationRole == "Dimension", "Correct aggregation role returned");
		assert.ok(oConfig.template == true, "Template field set");
		assert.ok(oConfig.currentIndex == 4, "Correct index returned returned"); //Templates are always at end of array due to sorting

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[3]);
		assert.ok(oConfig == undefined, "No config returned for grouping row");

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[4]);
		assert.ok(oConfig.aggregationRole == "Measure", "Correct aggregation role returned");
		assert.ok(oConfig.template == false, "Template field not set");
		assert.ok(oConfig.currentIndex == 1, "Correct index returned returned");

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[5]);
		assert.ok(oConfig.aggregationRole == "Measure", "Correct aggregation role returned");
		assert.ok(oConfig.template == false, "Template field not set");
		assert.ok(oConfig.currentIndex == 2, "Correct index returned returned");

	}.bind(this));

	QUnit.test("_onRearrange with dropPosition \"After\"", function(assert){
		const oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveItemsByIndex");

		const oMockParams = {
			draggedControl: this.oChartItemPanel._oListControl.getItems()[4],
			droppedControl: this.oChartItemPanel._oListControl.getItems()[5],
			dropPosition: "After"
		};

		const oMockEvent = {getParameter : function(sParam){
			return oMockParams[sParam];
		}};

		const done = assert.async();

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "ChangeItems event was fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");
			assert.ok(oEvent.getParameter("items")[1].columnKey == "test3", "Item was moved");
			assert.ok(oEvent.getParameter("items")[2].columnKey == "test2", "Event has items parameter with correct length");
			done();
		});

		this.oChartItemPanel._onRearrange(oMockEvent);

		assert.ok(oMoveSpy.calledWithExactly(1,2), "moveItemsByIndex was called with correct parameters");

	}.bind(this));

	QUnit.test("_onRearrange with dropPosition \"Before\"", function(assert){
		const oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveItemsByIndex");

		const oMockParams = {
			draggedControl: this.oChartItemPanel._oListControl.getItems()[5],
			droppedControl: this.oChartItemPanel._oListControl.getItems()[4],
			dropPosition: "Before"
		};

		const oMockEvent = {getParameter : function(sParam){
			return oMockParams[sParam];
		}};

		const done = assert.async();

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "ChangeItems event was fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");
			assert.ok(oEvent.getParameter("items")[1].columnKey == "test3", "Item was moved");
			assert.ok(oEvent.getParameter("items")[2].columnKey == "test2", "Event has items parameter with correct length");
			done();
		});

		this.oChartItemPanel._onRearrange(oMockEvent);

		assert.ok(oMoveSpy.calledWithExactly(2,1), "moveItemsByIndex was called with correct parameters");

	}.bind(this));

	QUnit.test("_onRearrange with invalid drop position on group row", function(assert){
		const oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveItemsByIndex");

		const oMockParams = {
			draggedControl: this.oChartItemPanel._oListControl.getItems()[4],
			droppedControl: this.oChartItemPanel._oListControl.getItems()[3],
			dropPosition: "Before"
		};

		const oMockEvent = {getParameter : function(sParam){
			return oMockParams[sParam];
		},
		preventDefault: function(){}};

		const oPreventDefaultSpy = sinon.spy(oMockEvent, "preventDefault");

		this.oChartItemPanel._onRearrange(oMockEvent);

		assert.ok(!oMoveSpy.called, "moveItemsByIndex was not called");
		assert.ok(oPreventDefaultSpy.calledOnce, "preventDefault was called on event");

	}.bind(this));

	QUnit.test("_onRearrange with invalid drop position on different aggration role", function(assert){
		const oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveItemsByIndex");

		const oMockParams = {
			draggedControl: this.oChartItemPanel._oListControl.getItems()[4],
			droppedControl: this.oChartItemPanel._oListControl.getItems()[1],
			dropPosition: "Before"
		};

		const oMockEvent = {getParameter : function(sParam){
			return oMockParams[sParam];
		},
		preventDefault: function(){}};

		const oPreventDefaultSpy = sinon.spy(oMockEvent, "preventDefault");

		this.oChartItemPanel._onRearrange(oMockEvent);

		assert.ok(!oMoveSpy.called, "moveItemsByIndex was not called");
		assert.ok(oPreventDefaultSpy.calledOnce, "preventDefault was called on event");

	}.bind(this));

	QUnit.module("IllustratedMessage related errors", {
		beforeEach: function(){
			this.oChartItemPanel = new ChartItemPanel("CIP");
			this.oChartItemPanel.placeAt("qunit-fixture");
		}.bind(this),
		afterEach: function(){
			this.oChartItemPanel.destroy();
		}.bind(this)
	});

	QUnit.test("_validateChartType for axis1Only", function(assert) {
		// Arrange
		this.oChartItemPanel.setP13nData([]);
		sinon.stub(this.oChartItemPanel, "getErrorConfig").returns({chartType: "bar"});

		// Act
		let oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 0, "error correctly has 0 Measure");

		// Arrange
		this.oChartItemPanel.setP13nData([{
			label: "Test3",
			name: "test3",
			visible: true,
			kind: "Measure",
			role: "axis1"
		}]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, true, "Chart type is valid");
	}.bind(this));

	QUnit.test("_validateChartType for axis2", function(assert) {
		// Arrange
		this.oChartItemPanel.setP13nData([]);
		sinon.stub(this.oChartItemPanel, "getErrorConfig").returns({chartType: "scatter"});

		// Act
		let oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 0, "error correctly has Measure ");

		// Arrange
		this.oChartItemPanel.setP13nData([{
			label: "Test3",
			name: "test3",
			visible: true,
			kind: "Measure",
			role: "axis1"
		}]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 1, "error correctly has Measure 1");

		// Arrange
		this.oChartItemPanel.setP13nData([
			{
				label: "Test3",
				name: "test3",
				visible: true,
				kind: "Measure",
				role: "axis1"
			},
			{
				label: "Test4",
				name: "test4",
				visible: true,
				kind: "Measure",
				role: "axis1"
			}
		]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, true, "Chart type is valid");
	}.bind(this));

	QUnit.test("_validateChartType for axis3", function(assert) {
		// Arrange
		this.oChartItemPanel.setP13nData([]);
		sinon.stub(this.oChartItemPanel, "getErrorConfig").returns({chartType: "bubble"});

		// Act
		let oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 0, "error correctly has Measure 0");

		// Arrange
		this.oChartItemPanel.setP13nData([{
			label: "Test3",
			name: "test3",
			visible: true,
			kind: "Measure",
			role: "axis1"
		}]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 2, "error correctly has Measure 1");

		// Arrange
		this.oChartItemPanel.setP13nData([
			{
				label: "Test3",
				name: "test3",
				visible: true,
				kind: "Measure",
				role: "axis1"
			},
			{
				label: "Test4",
				name: "test4",
				visible: true,
				kind: "Measure",
				role: "axis1"
			}
		]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 1, "error correctly has Measure 1");

		// Arrange
		this.oChartItemPanel.setP13nData([
			{
				label: "Test3",
				name: "test3",
				visible: true,
				kind: "Measure",
				role: "axis1"
			},
			{
				label: "Test4",
				name: "test4",
				visible: true,
				kind: "Measure",
				role: "axis1"
			},
			{
				label: "Test5",
				name: "test5",
				visible: true,
				kind: "Measure",
				role: "axis1"
			}
		]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, true, "Chart type is valid");
	}.bind(this));

	QUnit.test("_validateChartType for axis1Cat1", function(assert) {
		// Arrange
		this.oChartItemPanel.setP13nData([]);
		sinon.stub(this.oChartItemPanel, "getErrorConfig").returns({chartType: "heatmap"});

		// Act
		let oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 0, "error correctly has Measure 0");
		assert.equal(oValidChartType.error["Dimension"], 1, "error correctly has Dimension 1");

		// Arrange
		this.oChartItemPanel.setP13nData([{
			label: "Test",
			name: "test",
			visible: true,
			kind: "Dimension",
			role: "category"
		}]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 0, "error correctly has Measure 0");

		// Arrange
		this.oChartItemPanel.setP13nData([
			{
				label: "Test3",
				name: "test3",
				visible: true,
				kind: "Measure",
				role: "axis1"
			},
			{
				label: "Test",
				name: "test",
				visible: true,
				kind: "Dimension",
				role: "category"
			}
		]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, true, "Chart type is valid");
	}.bind(this));

	QUnit.test("_validateChartType for axis2Cat1", function(assert) {
		// Arrange
		this.oChartItemPanel.setP13nData([]);
		sinon.stub(this.oChartItemPanel, "getErrorConfig").returns({chartType: "combination"});

		// Act
		let oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 0, "error correctly has Measure 0");
		assert.equal(oValidChartType.error["Dimension"], 1, "error correctly has Dimension 1");

		// Arrange
		this.oChartItemPanel.setP13nData([{
			label: "Test",
			name: "test",
			visible: true,
			kind: "Dimension",
			role: "category"
		}]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 0, "error correctly has Measure 0");
		assert.equal(oValidChartType.error["Dimension"], undefined, "error correctly has no Dimension error");

		// Arrange
		this.oChartItemPanel.setP13nData([
			{
				label: "Test3",
				name: "test3",
				visible: true,
				kind: "Measure",
				role: "axis1"
			},
			{
				label: "Test",
				name: "test",
				visible: true,
				kind: "Dimension",
				role: "category"
			}
		]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, false, "Chart type is invalid");
		assert.equal(oValidChartType.error["Measure"], 1, "error correctly has Measure 1");

				// Arrange
		this.oChartItemPanel.setP13nData([
			{
				label: "Test3",
				name: "test3",
				visible: true,
				kind: "Measure",
				role: "axis1"
			},
			{
				label: "Test4",
				name: "test4",
				visible: true,
				kind: "Measure",
				role: "axis1"
			},
			{
				label: "Test",
				name: "test",
				visible: true,
				kind: "Dimension",
				role: "category"
			}
		]);

		// Act
		oValidChartType = this.oChartItemPanel._validateChartType();

		// Assert
		assert.equal(oValidChartType.valid, true, "Chart type is valid");
	}.bind(this));

	QUnit.test("_onPressHide should call _setMessageStrip", function(assert) {
		// Arrange
		const oSpy = sinon.spy(this.oChartItemPanel, "_setMessageStrip"),
			oRemoveBtn = {
				data: function() {
					return {
						propertyName: "test"
					};
				}
			};

		// Act
		this.oChartItemPanel._onPressHide(undefined, oRemoveBtn);

		// Assert
		assert.ok(oSpy.calledOnce, "_setMessageStrip was called");

		// Cleanup
		oSpy.restore();

	}.bind(this));

	QUnit.test("setP13nData should call _setMessageStrip", function(assert) {
		//Arrange
		const oSpy = sinon.spy(this.oChartItemPanel, "_setMessageStrip"),
			oStub = sinon.stub(this.oChartItemPanel, "getErrorConfig").returns({invalidChartType: true, errorMessage: "Error"});

		// Act
		this.oChartItemPanel.setP13nData([]);

		// Assert
		assert.ok(oSpy.calledOnce, "_setMessageStrip was called");

		// Cleanup
		oSpy.restore();
		oStub.restore();
	}.bind(this));

	QUnit.test("onChangeOfTemplateName should call _setMessageStrip", function(assert) {
		//Arrange
		const oSpy = sinon.spy(this.oChartItemPanel, "_setMessageStrip"),
			oStub = sinon.stub(this.oChartItemPanel, "_getCleanP13nItems").returns([]),
			oStubGetMessageStrip = sinon.stub(this.oChartItemPanel, "getMessageStrip").returns(true),
			oEvent = {
				getSource: function() {
					return {
						getSelectedKey: function() {
							return;
						}
					};
				}
			};

		// Act
		this.oChartItemPanel.onChangeOfTemplateName(oEvent);

		// Assert
		assert.ok(oSpy.calledOnce, "_setMessageStrip was called");

		// Cleanup
		oSpy.restore();
		oStub.restore();
		oStubGetMessageStrip.restore();
	}.bind(this));


	QUnit.module("SortPanel API only tests", {
		beforeEach: function(){
			this.oChartItemPanel = new ChartItemPanel("CIP");
			this.oChartItemPanel.placeAt("qunit-fixture");
		}.bind(this),
		afterEach: function(){
			this.oChartItemPanel.destroy();
		}.bind(this)
	});


	QUnit.test("Template ComboBox tests", function(assert){
		const oComboBox = this.oChartItemPanel._getTemplateComboBox("Measure");
		const mockEvent = {getSource: function(){return oComboBox;}};

		//Override for test
		this.oChartItemPanel._getCleanP13nItems = function(){return [];};

		assert.ok(oComboBox.isA("sap.m.ComboBox"), "ComboBox is returned");
		assert.ok(oComboBox.getPlaceholder() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_TEMPLATE_PLACEHOLDER'), "ComboBox has correct placeholder");

		oComboBox.setValue("1234");
		this.oChartItemPanel.onChangeOfTemplateName(mockEvent);
		assert.equal(oComboBox.getValueState(), ValueState.Error, "Template ComboBox has error state");

		oComboBox.setValue("");
		this.oChartItemPanel.onChangeOfTemplateName(mockEvent);
		assert.equal(oComboBox.getValueState(), ValueState.None, "Error state is reset");

		oComboBox.destroy();
	}.bind(this));

	QUnit.test("_createListItem", function(assert){
		const oMockModelContext = {getObject : function(){return {kind: "Measure", name: "test5"};}};

		const oListItem = this.oChartItemPanel._createListItem("anyId", oMockModelContext);
		assert.ok(oListItem, "List item was created");
		assert.ok(oListItem.isA("sap.m.ColumnListItem"), "List Item is of type sap.m.ColumnListItem");
		assert.ok(oListItem.getCells().length == 3, "List Item has 3 cells");
		assert.ok(oListItem.getCells()[0].isA("sap.m.ComboBox"), "Cell 1 is of type sap.m.ComboBox");
		assert.ok(oListItem.getCells()[1].isA("sap.m.Select"), "Cell 2 is of type sap.m.Select");
		assert.ok(oListItem.getCells()[2].isA("sap.m.HBox"), "Cell 3 is of type sap.m.HBox");
		assert.ok(oListItem.getCells()[2].getItems().length == 1, "Cell 3 contains one item");
		assert.ok(oListItem.getCells()[2].getItems()[0].isA("sap.m.Button"), "Cell 3 contains a button");
		assert.ok(oListItem.getCells()[2].getItems()[0].getIcon() == "sap-icon://decline", "Button has a delete icon");
		assert.ok(oListItem.getCells()[2].getItems()[0].getType() == "Transparent", "Button transparent");

		oListItem.destroy();

	}.bind(this));

	QUnit.test("_createListItem with template", function(assert){
		const oMockModelContext = {getObject : function(){return {kind: "TestKind", template: true};}};

		const oListItem = this.oChartItemPanel._createListItem("anyId", oMockModelContext);

		assert.ok(oListItem, "List item was created");
		assert.ok(oListItem.isA("sap.m.ColumnListItem"), "List Item is of type sap.m.ColumnListItem");
		assert.ok(oListItem.getCells().length == 1, "List Item has 1 cell");
		assert.ok(oListItem.getCells()[0].isA("sap.m.ComboBox"), "Cell 1 is of type sap.m.ComboBox");

		oListItem.destroy();

	}.bind(this));

	QUnit.test("_createListItemMobile", function(assert){
		const oMockModelContext = {getObject : function(){return {kind: "Measure", name: "test6"};}};

		const oListItem = this.oChartItemPanel._createListItemMobile("anyId", oMockModelContext);
		assert.ok(oListItem, "List item was created");
		assert.ok(oListItem.isA("sap.m.ColumnListItem"), "List Item is of type sap.m.ColumnListItem");
		assert.ok(oListItem.getCells().length == 2, "List Item has 2 cells");
		assert.ok(oListItem.getCells()[0].isA("sap.m.VBox"), "Cell 1 is of type VBox");
		assert.ok(oListItem.getCells()[0].getItems().length == 2, "VBox has 2 items");
		assert.ok(oListItem.getCells()[0].getItems()[0].isA("sap.m.ComboBox"), "Item 1 is of type sap.m.ComboBox");
		assert.ok(oListItem.getCells()[0].getItems()[1].isA("sap.m.Select"), "Item 1 is of type sap.m.Select");
		assert.ok(oListItem.getCells()[1].isA("sap.m.HBox"), "Cell 2 is of type sap.m.HBox");
		assert.ok(oListItem.getCells()[1].getItems().length == 1, "Cell 2 contains one item");
		assert.ok(oListItem.getCells()[1].getItems()[0].isA("sap.m.Button"), "Cell 2 contains a button");
		assert.ok(oListItem.getCells()[1].getItems()[0].getIcon() == "sap-icon://decline", "Button has a delete icon");
		assert.ok(oListItem.getCells()[1].getItems()[0].getType() == "Transparent", "Button transparent");

		oListItem.destroy();
	}.bind(this));

	QUnit.test("_createListItemMobile with template", function(assert){
		const oMockModelContext = {getObject : function(){return {kind: "TestKindMobile", template: true};}};

		const oListItem = this.oChartItemPanel._createListItemMobile("anyId", oMockModelContext);
		assert.ok(oListItem, "List item was created");
		assert.ok(oListItem.isA("sap.m.ColumnListItem"), "List Item is of type sap.m.ColumnListItem");
		assert.ok(oListItem.getCells().length == 2, "List Item has 2 cells");
		assert.ok(oListItem.getCells()[0].isA("sap.m.ComboBox"), "Cell 1 is of type sap.m.ComboBox");
		assert.ok(oListItem.getCells()[1].isA("sap.m.HBox"), "Cell 2 is of type sap.m.HBox");
		assert.ok(oListItem.getCells()[1].getItems().length == 1, "Cell 2 contains one item");
		assert.ok(oListItem.getCells()[1].getItems()[0].isA("sap.m.Button"), "Cell 2 contains a button");
		assert.ok(oListItem.getCells()[1].getItems()[0].getIcon() == "sap-icon://decline", "Button has a delete icon");
		assert.ok(oListItem.getCells()[1].getItems()[0].getType() == "Transparent", "Button transparent");

	}.bind(this));

	QUnit.module("Keyboard Navigation and Move Button Tests", {
		beforeEach: async function(){
			await nextUIUpdate();

			const aItems = [
				{
					label: "Test",
					name: "test",
					visible: true,
					kind: "Dimension",
					role: "category"
				},
				{
					label: "Test2",
					name: "test2",
					visible: true,
					kind: "Measure",
					role: "axis1"
				},
				{
					label: "Test3",
					name: "test3",
					visible: true,
					kind: "Measure",
					role: "axis1"
				}
			];

			this.oChartItemPanel = new ChartItemPanel("CIP", {panelConfig: oChartConfig, errorConfig: oErrorConfig});
			this.oChartItemPanel.setP13nData(aItems);
			this.oChartItemPanel.placeAt("qunit-fixture");
		}.bind(this),
		afterEach: function(){
			this.oChartItemPanel.destroy();
		}.bind(this)
	});

	QUnit.test("Check '_addMoveButtons' inserts buttons in correct order (Desktop)", function(assert){
		// Arrange
		const oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		const oHBox = oTableItem.getCells()[2];

		// Act
		this.oChartItemPanel._addMoveButtons(oTableItem);

		// Assert
		assert.equal(oHBox.getItems().length, 5, "HBox contains 5 buttons (4 move + 1 remove)");
		assert.ok(oHBox.getItems()[0].getId().includes("moveTopBtn"), "Button at position 0 is MoveTop");
		assert.ok(oHBox.getItems()[1].getId().includes("moveUpBtn"), "Button at position 1 is MoveUp");
		assert.ok(oHBox.getItems()[2].getId().includes("moveDownpBtn"), "Button at position 2 is MoveDown");
		assert.ok(oHBox.getItems()[3].getId().includes("moveBottomBtn"), "Button at position 3 is MoveBottom");
		assert.ok(oHBox.getItems()[4].getIcon() === "sap-icon://decline", "Button at position 4 is Remove button");
	}.bind(this));

	QUnit.test("Check '_addMoveButtons' inserts buttons in correct order (Mobile)", function(assert){
		// Arrange
		this.oChartItemPanel._switchMobileMode(true);
		const oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		const oHBox = oTableItem.getCells()[1];

		// Act
		this.oChartItemPanel._addMoveButtons(oTableItem);

		// Assert
		assert.equal(oHBox.getItems().length, 3, "HBox contains 3 buttons (2 move + 1 remove)");
		assert.ok(oHBox.getItems()[0].getId().includes("moveUpBtn"), "Button at position 0 is MoveUp");
		assert.ok(oHBox.getItems()[1].getId().includes("moveDownpBtn"), "Button at position 1 is MoveDown");
		assert.ok(oHBox.getItems()[2].getIcon() === "sap-icon://decline", "Button at position 2 is Remove button");
	}.bind(this));

	QUnit.test("Check '_handleActivated' (remove buttons) works for new hovered item", function(assert){
		// Arrange
		const oHoveredItem = this.oChartItemPanel._oListControl.getItems()[4];
		const oSpyRemoveButtons = sinon.spy(this.oChartItemPanel, "removeMoveButtons");

		// Act
		this.oChartItemPanel._oHoveredItem = this.oChartItemPanel._oListControl.getItems()[5];
		this.oChartItemPanel._handleActivated(oHoveredItem);

		// Assert
		assert.ok(oSpyRemoveButtons.called, "Buttons were removed when hovering different item");

		// Cleanup
		oSpyRemoveButtons.restore();
	}.bind(this));

	QUnit.test("Check '_handleActivated' (early return) does not add buttons for same item", function(assert){
		// Arrange
		const oHoveredItem = this.oChartItemPanel._oListControl.getItems()[4];
		const oSpyRemoveButtons = sinon.spy(this.oChartItemPanel, "removeMoveButtons");
		const oSpyAddButtons = sinon.spy(this.oChartItemPanel, "_addMoveButtons");

		// Act - Set the item as already hovered
		this.oChartItemPanel._oHoveredItem = oHoveredItem;
		this.oChartItemPanel._handleActivated(oHoveredItem);

		// Assert
		assert.ok(oSpyRemoveButtons.notCalled, "Buttons were not removed for same item");
		assert.ok(oSpyAddButtons.notCalled, "Buttons were not added again for same item");

		// Cleanup
		oSpyRemoveButtons.restore();
		oSpyAddButtons.restore();
	}.bind(this));

	QUnit.test("Check '_handleActivated' removes buttons for template item", function(assert){
		// Arrange
		const oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		const oTemplateItem = this.oChartItemPanel._oListControl.getItems()[6];

		// Act - First hover regular item
		this.oChartItemPanel._handleActivated(oTableItem);

		// Create spies after first hover to track only the template item interaction
		const oSpyRemoveButtons = sinon.spy(this.oChartItemPanel, "removeMoveButtons");
		const oSpyAddButtons = sinon.spy(this.oChartItemPanel, "_addMoveButtons");

		// Act - Then hover template item
		this.oChartItemPanel._handleActivated(oTemplateItem);

		// Assert
		assert.ok(oSpyRemoveButtons.calledOnce, "Buttons were removed when hovering template item");
		assert.ok(oSpyAddButtons.notCalled, "Buttons were not added for template item");

		// Cleanup
		oSpyRemoveButtons.restore();
		oSpyAddButtons.restore();
	}.bind(this));

	QUnit.test("Check '_handleActivated' adds buttons only for non-template items", function(assert){
		// Arrange
		const oHoveredItem = this.oChartItemPanel._oListControl.getItems()[4];
		const oSpyAddButtons = sinon.spy(this.oChartItemPanel, "_addMoveButtons");
		const oSpyUpdateButtons = sinon.spy(this.oChartItemPanel, "_updateEnableOfMoveButtons");

		// Act
		this.oChartItemPanel._handleActivated(oHoveredItem);

		// Assert
		assert.ok(oSpyAddButtons.calledOnce, "Buttons were added for non-template item");
		assert.ok(oSpyUpdateButtons.calledOnce, "Button states were updated for non-template item");

		// Cleanup
		oSpyAddButtons.restore();
		oSpyUpdateButtons.restore();
	}.bind(this));

	QUnit.module("Accessibility - Focus Management", {
		beforeEach: async function(){
			await nextUIUpdate();

			const aItems = [
				{
					label: "Test",
					name: "test",
					visible: true,
					kind: "Dimension",
					role: "category"
				},
				{
					label: "Test2",
					name: "test2",
					visible: true,
					kind: "Measure",
					role: "axis1"
				},
				{
					label: "Test4",
					name: "test4",
					visible: false,
					kind: "Measure",
					role: "axis1"
				}
			];

			this.oChartItemPanel = new ChartItemPanel("CIP", {panelConfig: oChartConfig, errorConfig: oErrorConfig});
			this.oChartItemPanel.setP13nData(aItems);
			this.oChartItemPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		}.bind(this),
		afterEach: function(){
			this.oChartItemPanel?.destroy();
			this.oChartItemPanel = null;
		}.bind(this)
	});

	QUnit.test("Focus is set on newly added item after ComboBox selection", function(assert){
		// Arrange
		const done = assert.async();

		// Get existing ComboBox from map or let the panel create it
		let oComboBox = this.oChartItemPanel._mTemplatesMap.get("Measure");
		if (!oComboBox) {
			oComboBox = this.oChartItemPanel._getTemplateComboBox("Measure");
		}

		const oMockEvent = {
			getSource: function() {
				return oComboBox;
			}
		};

		// Stub to simulate selecting an item
		sinon.stub(oComboBox, "getSelectedKey").returns("test4");

		// Act
		this.oChartItemPanel.onChangeOfTemplateName(oMockEvent);

		// Assert - Check focus after setTimeout completes
		setTimeout(function() {
			const oListItems = this.oChartItemPanel._oListControl.getItems();
			const oAddedItem = oListItems.find((oItem) => {
				const oContext = oItem.getBindingContext(this.oChartItemPanel.P13N_MODEL);
				return oContext && oContext.getProperty("name") === "test4";
			});

			assert.ok(oAddedItem, "Added item was found in list");
			const oFocusedElement = document.activeElement;
			const oFirstCell = oAddedItem.getCells()[0];

			// Check if focus is on the first cell or its inner control
			assert.ok(
				oFocusedElement === oFirstCell.getDomRef() || oFirstCell.getDomRef().contains(oFocusedElement),
				"Focus is set on the first cell of the newly added item"
			);

			done();
		}.bind(this), 50);
	}.bind(this));
});
