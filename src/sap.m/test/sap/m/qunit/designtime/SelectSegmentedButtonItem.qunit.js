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

	QUnit.test("revertData does not contain circular structures (only serializable data)", async function (assert) {
		const oSB = new SegmentedButton("sb2", { selectedKey: "x" });
		const oItem1 = new SegmentedButtonItem("itemX", { key: "x", text: "X" });
		const oItem2 = new SegmentedButtonItem("itemY", { key: "y", text: "Y" });
		oSB.addItem(oItem1);
		oSB.addItem(oItem2);

		const mRegistry = {
			sb2: oSB, itemX: oItem1, itemY: oItem2,
			[oItem1.getId()]: oItem1, [oItem2.getId()]: oItem2
		};

		const oChange = {
			_getContent: {
				selectedItem: oItem2.getId(),
				previousItem: oItem1.getId(),
				previousKey: "x",
				bUpdateSelectedKey: true
			},
			getContent: function () { return this._getContent; },
			setRevertData: function (d) { this._revert = d; },
			getRevertData: function () { return this._revert; },
			resetRevertData: function () { this._revert = null; }
		};

		const oModifier = {
			targets: "jsControlTree",
			bySelector: function (vSelector) {
				if (typeof vSelector === "string") {
					return Promise.resolve(mRegistry[vSelector] || mRegistry[vSelector.replace(/^.*#/, "")] || null);
				}
				return Promise.resolve(vSelector || null);
			},
			getPropertyBinding: function (oControl, sProp) {
				if (sProp === "selectedKey") {
					return Promise.resolve({ path: "/SelectedKey", model: "settings", parts: [{ path: "/SelectedKey", model: "settings" }] });
				}
				return Promise.resolve(null);
			},
			getProperty: function (oControl, sProp) {
				if (!oControl) {
					return Promise.resolve(null);
				}
				if (sProp === "selectedKey" && typeof oControl.getKey === "function") {
					return Promise.resolve(oControl.getKey());
				}
				return Promise.resolve(null);
			},
			setAssociation: function (oControl, sAssociation, vTarget) {
				oControl.setSelectedItem(vTarget || "", false);
				return Promise.resolve();
			},
			setProperty: function (oControl, sProp, vValue) {
				if (sProp === "selectedKey" && typeof oControl.setSelectedKey === "function") {
					oControl.setSelectedKey(vValue);
				}
				return Promise.resolve();
			},
			bindProperty: function (oControl, sProp, oBindingInfo) {
				if (sProp === "selectedKey" && oBindingInfo && oBindingInfo.path) {
					oControl.bindProperty("selectedKey", oBindingInfo);
				}
				return Promise.resolve();
			}
		};

		const mPropertyBag = { modifier: oModifier, view: null, appComponent: null };

		await SelectSegmentedButtonItem.applyChange(oChange, oSB, mPropertyBag);

		// Verify revert data is set, serializable, and contains binding info
		const oRevertData = oChange.getRevertData();
		assert.ok(oRevertData, "revertData is set after applyChange");
		assert.ok(oRevertData.originalSelectedKeyBinding, "originalSelectedKeyBinding is populated");
		assert.strictEqual(oRevertData.originalSelectedKeyBinding.path, "/SelectedKey", "binding path is preserved");
		assert.strictEqual(oRevertData.originalSelectedKeyBinding.model, "settings", "binding model is preserved");

		let bSerializable = true;
		try {
			JSON.stringify(oRevertData);
		} catch (e) {
			bSerializable = false;
		}
		assert.ok(bSerializable, "revertData does not contain circular structures and is JSON-serializable");
		// Verify revert data contains only primitive values or plain objects
		Object.keys(oRevertData).forEach(function (sKey) {
			const vValue = oRevertData[sKey];
			const bAllowed = vValue === null || vValue === undefined
				|| typeof vValue === "string" || typeof vValue === "boolean" || typeof vValue === "number"
				|| (typeof vValue === "object" && vValue.constructor === Object);
			assert.ok(
				bAllowed,
				"revertData." + sKey + " is a primitive or plain object (type: " + typeof vValue + "), not a control reference"
			);
		});

		// Revert should still work correctly
		await SelectSegmentedButtonItem.revertChange(oChange, oSB, mPropertyBag);

		oSB.destroy();
		oItem1.destroy();
		oItem2.destroy();
	});
});
