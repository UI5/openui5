/* global QUnit */
sap.ui.define([
	"sap/m/p13n/GroupPanel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
], function (GroupPanel, JSONModel, oCore) {
	"use strict";

	QUnit.module("GroupPanel API tests", {
		beforeEach: function(){
			this.oGroupPanel = new GroupPanel({
				enableShowField: true
			});
			this.oGroupPanel.setP13nData([
				{
					name: "key1",
					grouped: true,
					showIfGrouped: true
				},
				{
					name: "key2",
					grouped: true,
					showIfGrouped: true
				},
				{
					name: "key3",
					grouped: false,
					showIfGrouped: true
				},
				{
					name: "key4",
					grouped: false,
					showIfGrouped: true
				}
			]);
			this.oGroupPanel.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function(){
			this.oGroupPanel.destroy();
		}
	});

	QUnit.test("instantiate GroupPanel", function(assert){
		assert.ok(this.oGroupPanel);
	});

	QUnit.test("Check initial grouprow amount", function(assert){
		assert.equal(this.oGroupPanel._oListControl.getItems().length, 3, "two initial rows + 1 empty row created");
		assert.equal(this.oGroupPanel._oListControl.getItems()[0].getContent()[0].getContent()[0].getSelectedKey(), "key1", "correct key set");
		assert.equal(this.oGroupPanel._oListControl.getItems()[1].getContent()[0].getContent()[0].getSelectedKey(), "key2", "correct key set");
		assert.equal(this.oGroupPanel._oListControl.getItems()[2].getContent()[0].getContent()[0].getSelectedKey(), "", "correct key set");
	});

	QUnit.test("Check 'showIfGrouped' toggle'", function(assert){
		var oFirstGroupRow = this.oGroupPanel._oListControl.getItems()[0]; //key1
		var oCheckBox = oFirstGroupRow.getContent()[0].getContent()[1].getItems()[0];

		//check initial state
		var aGroupState = [
			{name: "key1", grouped: true, showIfGrouped: true},
			{name: "key2", grouped: true, showIfGrouped: true}
		];
		assert.deepEqual(this.oGroupPanel.getP13nData(true), aGroupState, "Correct group state");

		//Change sort order of 'key1' to descending
		oCheckBox.fireSelect({
			selected: false
		});

		var aNewGroupState = [
			{name: "key1", grouped: true, showIfGrouped: false}, // --> should be updated accordingly in the data
			{name: "key2", grouped: true, showIfGrouped: true}
		];
		assert.deepEqual(this.oGroupPanel.getP13nData(true), aNewGroupState, "Correct group state");

	});

	QUnit.test("GridData", function(assert){
		let aItems = this.oGroupPanel._oListControl.getItems();
		let oGrid = aItems[0].getContent()[0];
		let oSelect = oGrid.getContent()[0];
		const oCheckBox = oGrid.getContent()[1];
		let oButtonBox = oGrid.getContent()[2];

		assert.equal(oGrid.getDefaultSpan(), "XL4 L4 M4 S4", "Grid: Span");
		let oGridData = oSelect.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL4 L4 M4 S12", "Select: Span");
		oGridData = oCheckBox.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL4 L4 M4 S12", "CheckBox: Span");
		assert.ok(oGridData.getLinebreakS(), "CheckBox: linebreakS");
		oGridData = oButtonBox.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL4 L4 M4 S4", "ButtonBox: Span");
		assert.equal(oGridData.getIndentS(), 8, "ButtonBox: indentS");
		assert.ok(oGridData.getLinebreakS(), "ButtonBox: linebreakS");

		this.oGroupPanel.destroy();
		this.oGroupPanel = new GroupPanel({
			enableShowField: false
		});
		this.oGroupPanel.setP13nData([
			{
				name: "key1",
				grouped: true,
				showIfGrouped: true
			},
			{
				name: "key2",
				grouped: false,
				showIfGrouped: true
			}
		]);
		this.oGroupPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		aItems = this.oGroupPanel._oListControl.getItems();
		oGrid = aItems[0].getContent()[0];
		oSelect = oGrid.getContent()[0];
		oButtonBox = oGrid.getContent()[1];

		assert.equal(oGrid.getDefaultSpan(), "XL6 L6 M6 S6", "Grid: Span");
		oGridData = oSelect.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL6 L6 M6 S8", "Select: Span");
		oGridData = oButtonBox.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL6 L6 M6 S4", "ButtonBox: Span");
		assert.equal(oGridData.getIndentS(), 0, "ButtonBox: indentS");
		assert.notOk(oGridData.getLinebreakS(), "ButtonBox: linebreakS");

		this.oGroupPanel.destroy();
		this.oGroupPanel = new GroupPanel({
			enableShowField: false,
			queryLimit: 1
		});
		this.oGroupPanel.setP13nData([
			{
				name: "key1",
				grouped: true,
				showIfGrouped: true
			},
			{
				name: "key2",
				grouped: false,
				showIfGrouped: true
			}
		]);
		this.oGroupPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		aItems = this.oGroupPanel._oListControl.getItems();
		oGrid = aItems[0].getContent()[0];
		oSelect = oGrid.getContent()[0];
		oButtonBox = oGrid.getContent()[1];

		assert.equal(oGrid.getDefaultSpan(), "XL6 L6 M6 S6", "Grid: Span");
		oGridData = oSelect.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL6 L6 M6 S10", "Select: Span");
		oGridData = oButtonBox.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL6 L6 M6 S2", "ButtonBox: Span");
		assert.equal(oGridData.getIndentS(), 0, "ButtonBox: indentS");
		assert.notOk(oGridData.getLinebreakS(), "ButtonBox: linebreakS");
	});

});
