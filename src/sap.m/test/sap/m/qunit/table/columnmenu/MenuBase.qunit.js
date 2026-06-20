/*global QUnit*/
sap.ui.define([
	"sap/m/table/columnmenu/MenuBase"
], function(MenuBase) {
	"use strict";

	QUnit.module("Interface");

	QUnit.test("Implements IColumnHeaderMenu interface", function(assert) {
		const oMenuBase = new MenuBase();

		assert.ok(oMenuBase.isA("sap.ui.core.IColumnHeaderMenu"), "Instance implements sap.ui.core.IColumnHeaderMenu interface");

		// Unfortunately, there is no way to get all methods defined by a (JSDoc) interface,
		// so we have to keep this list up to date manually.
		["openBy", "close", "isOpen", "getAriaHasPopupType"].forEach((sMethod) => {
			assert.strictEqual(typeof oMenuBase[sMethod], "function", `IColumnHeaderMenu method ${sMethod} is implemented`);
		});

		oMenuBase.destroy();
	});

	QUnit.module("Abstract / default API", {
		beforeEach: function() {
			this.oMenuBase = new MenuBase();
		},
		afterEach: function() {
			this.oMenuBase.destroy();
		}
	});

	QUnit.test("openBy throws when not overridden", function(assert) {
		assert.throws(() => {
			this.oMenuBase.openBy(null);
		}, new Error("This method should be implemented in one of the inherited classes."));
	});

	QUnit.test("isOpen throws when not overridden", function(assert) {
		assert.throws(() => {
			this.oMenuBase.isOpen();
		}, new Error("This method should be implemented in one of the inherited classes."));
	});

	QUnit.test("close throws when not overridden", function(assert) {
		assert.throws(() => {
			this.oMenuBase.close();
		}, new Error("This method should be implemented in one of the inherited classes."));
	});

	QUnit.test("getAriaHasPopupType returns 'Menu'", function(assert) {
		assert.strictEqual(this.oMenuBase.getAriaHasPopupType(), "Menu", "Default aria-haspopup type is 'Menu'");
	});
});
