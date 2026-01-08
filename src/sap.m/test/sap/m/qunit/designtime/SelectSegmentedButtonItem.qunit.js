/*global QUnit */
sap.ui.define([
	"sap/m/changeHandler/SelectSegmentedButtonItem",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem"
], function (SelectSegmentedButtonItem, SegmentedButton, SegmentedButtonItem) {
	"use strict";
	QUnit.module("SelectSegmentedButtonItem - basic apply/revert");
	QUnit.test("applyChange sets selectedItem/selectedKey and revertChange restores them", async function (assert) {
		// create controls
		const oSB = new SegmentedButton("sb", { selectedKey: "a" });
		const oItem1 = new SegmentedButtonItem("item1", { key: "a", text: "A" });
		const oItem2 = new SegmentedButtonItem("item2", { key: "b", text: "B" });
		oSB.addItem(oItem1);
		oSB.addItem(oItem2);
		// simple registry used by our fake modifier.bySelector
		const mRegistry = {
			sb: oSB,
			item1: oItem1,
			item2: oItem2,
			[oItem1.getId()]: oItem1,
			[oItem2.getId()]: oItem2
		};
		// fake change object
		const oChange = {
			_getContent: {
				selectedItem: oItem2.getId(),
				previousItem: oItem1.getId(),
				previousKey: "a",
				bUpdateSelectedKey: true
			},
			getContent: function () { return this._getContent; },
			setRevertData: function (d) { this._revert = d; },
			getRevertData: function () { return this._revert; },
			resetRevertData: function () { this._revert = null; }
		};
		// minimal modifier implementing methods used by the change handler
		const oModifier = {
			targets: "jsControlTree",
			bySelector: function (vSelector/*, oAppComponent, oView */) {
				// accept id string or return control if passed directly
				if (typeof vSelector === "string") {
					// try plain id, or with view prefix
					return Promise.resolve(mRegistry[vSelector] || mRegistry[vSelector.replace(/^.*#/, "")] || null);
				}
				return Promise.resolve(vSelector || null);
			},
			// emulate async property getter on items (used to read key via modifier)
			getProperty: function (oControl, sProp) {
				if (!oControl) {
					return Promise.resolve(null);
				}
				// for SegmentedButtonItem we read its key via getKey
				if (sProp === "selectedKey" && typeof oControl.getKey === "function") {
					return Promise.resolve(oControl.getKey());
				}
				return Promise.resolve(null);
			},
			// association setter used by change handler
			setAssociation: function (oControl, sAssociation, vTarget, _oView) {
				// use public API as fallback
				oControl.setSelectedItem(vTarget || "", false);
				return Promise.resolve();
			},
			// property setter used by change handler
			setProperty: function (oControl, sProp, vValue /*, oView */) {
				if (sProp === "selectedKey" && typeof oControl.setSelectedKey === "function") {
					oControl.setSelectedKey(vValue);
				}
				return Promise.resolve();
			}
		};
		const mPropertyBag = {
			modifier: oModifier,
			view: null,
			appComponent: null
		};
		// APPLY change
		await SelectSegmentedButtonItem.applyChange(oChange, oSB, mPropertyBag);
		assert.strictEqual(oSB.getSelectedKey(), "b", "selectedKey was updated to 'b' after applyChange");
		assert.strictEqual(oSB.getSelectedItem(), oItem2.getId(), "selectedItem points to item2 after applyChange");
		// REVERT change
		await SelectSegmentedButtonItem.revertChange(oChange, oSB, mPropertyBag);
		assert.strictEqual(oSB.getSelectedKey(), "a", "selectedKey restored to 'a' after revertChange");
		assert.strictEqual(oSB.getSelectedItem(), oItem1.getId(), "selectedItem restored to item1 after revertChange");
		// cleanup UI5 controls
		oSB.destroy();
		oItem1.destroy();
		oItem2.destroy();
	});
});
