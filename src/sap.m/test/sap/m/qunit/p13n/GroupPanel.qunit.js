/* global QUnit */
sap.ui.define([
	"sap/m/p13n/GroupPanel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (GroupPanel, JSONModel, nextUIUpdate) {
	"use strict";

	QUnit.module("GroupPanel API tests", {
		beforeEach: async function(){
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
			await nextUIUpdate();
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

	QUnit.test("Check 'showIfGrouped' toggle fires change event exactly once with correct reason", function(assert) {
		var iChangeFiredCount = 0;
		var sLastReason;

		this.oGroupPanel.attachChange(function(oEvt) {
			iChangeFiredCount++;
			sLastReason = oEvt.getParameter("reason");
		});

		var oFirstGroupRow = this.oGroupPanel._oListControl.getItems()[0];
		var oCheckBox = oFirstGroupRow.getContent()[0].getContent()[1].getItems()[0];

		oCheckBox.fireSelect({ selected: false });

		assert.equal(iChangeFiredCount, 1,
			"change event is fired exactly once when the checkbox is toggled");
		assert.equal(sLastReason, this.oGroupPanel.CHANGE_REASON_SHOWIFGROUPED,
			"change event has reason 'showifgrouped'");
	});

	QUnit.test("GridData", async function(assert){
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
		await nextUIUpdate();

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
		await nextUIUpdate();

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
