/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Control",
	"sap/ui/core/Element",
	"sap/ui/mdc/mixin/DynamicPropertiesMixin",
	"sap/ui/mdc/util/PropertyHelper"
], function(
	MDCControl,
	Element,
	DynamicPropertiesMixin,
	PropertyHelper
) {
	"use strict";

	const TestItem = Element.extend("test.Item", {
		metadata: {
			properties: {
				propertyKey: {type: "string"}
			}
		}
	});

	const TestControl = MDCControl.extend("test.Control", {
		metadata: {
			properties: {
				propertyKeys: {type: "string[]", defaultValue: []}
			},
			aggregations: {
				items: {type: "sap.ui.core.Element", multiple: true}
			}
		},
		renderer: {apiVersion: 2, render: function() {}}
	});

	DynamicPropertiesMixin.call(TestControl.prototype, {aggregation: "items"});

	/*
	 * PropertyInfo layout used in most tests:
	 *   staticProp1        - static property (no isActive field)
	 *   staticProp2        - static property
	 *   dynamicActive      - dynamic property, isActive: true
	 *   dynamicInactive    - dynamic property, isActive: false
	 */
	const aProperties = [
		{key: "staticProp1", label: "Static 1", dataType: "sap.ui.model.type.String"},
		{key: "staticProp2", label: "Static 2", dataType: "sap.ui.model.type.String"},
		{key: "dynamicActive", label: "Dynamic Active", dataType: "sap.ui.model.type.String", isActive: true},
		{key: "dynamicInactive", label: "Dynamic Inactive", dataType: "sap.ui.model.type.String", isActive: false}
	];

	const aStaticProperties = [
		{key: "staticProp1", label: "Static 1", dataType: "sap.ui.model.type.String"}
	];

	function createTestControl(mSettings) {
		const oControl = new TestControl(Object.assign({
			delegate: {name: "sap/ui/mdc/BaseDelegate"}
		}, mSettings));
		oControl.getControlDelegate = sinon.stub().returns({
			addItem: sinon.stub().callsFake((oCtrl, sKey) => Promise.resolve(new TestItem({propertyKey: sKey}))),
			removeItem: sinon.stub().resolves(true)
		});
		oControl.getEngine = sinon.stub().returns({
			isModificationSupported: sinon.stub().resolves(false),
			waitForChanges: sinon.stub().resolves(),
			readXConfig: sinon.stub().returns(null)
		});

		// Real PropertyHelper — dynamic properties (isActive) require property-keys mode
		const bPropertyKeysMode = mSettings?.propertyKeys?.length > 0;
		oControl._oPropertyHelper = new PropertyHelper(
			bPropertyKeysMode ? aProperties : aStaticProperties,
			oControl,
			bPropertyKeysMode ? {isActive: true, propertyInfos: true} : undefined
		);
		oControl._bPropertyHelperFinal = true;

		return oControl;
	}

	function getItemKeys(oControl) {
		return oControl.getItems().map((oItem) => oItem.getPropertyKey());
	}

	QUnit.module("applySettings", {
		afterEach: function() {
			this.oControl?.destroy();
		}
	});

	QUnit.test("Property keys mode when propertyKeys is non-empty", function(assert) {
		this.oControl = createTestControl({propertyKeys: ["staticProp1"]});
		assert.strictEqual(this.oControl.isInPropertyKeysMode(), true, "isInPropertyKeysMode returns true");
	});

	QUnit.test("Aggregation mode when no propertyKeys", function(assert) {
		this.oControl = createTestControl({items: [new TestItem({propertyKey: "staticProp1"})]});
		assert.strictEqual(this.oControl.isInPropertyKeysMode(), false, "isInPropertyKeysMode returns false");
	});

	QUnit.test("Throws when both propertyKeys and aggregation items are defined", function(assert) {
		assert.throws(function() {
			this.oControl = new TestControl({
				delegate: {name: "sap/ui/mdc/BaseDelegate"},
				propertyKeys: ["staticProp1"],
				items: [new TestItem({propertyKey: "staticProp1"})]
			});
		}.bind(this), /propertyKeys.*items.*mutually exclusive/, "Error thrown for mutually exclusive settings");
	});

	QUnit.module("syncItemsFromPropertyKeys", {
		beforeEach: function() {
			this.oControl = createTestControl({
				propertyKeys: ["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"]
			});
		},
		afterEach: function() {
			this.oControl?.destroy();
		}
	});

	QUnit.test("Creates items for active keys, skips inactive keys", async function(assert) {
		await this.oControl.syncItemsFromPropertyKeys();

		assert.deepEqual(getItemKeys(this.oControl), ["staticProp1", "staticProp2", "dynamicActive"],
			"Only active/static properties are materialized");
		assert.strictEqual(this.oControl.getItems().length, 3, "3 items created");
	});

	QUnit.test("Removes excess items when key is removed from propertyKeys", async function(assert) {
		await this.oControl.syncItemsFromPropertyKeys();
		const oDelegate = this.oControl.getControlDelegate();
		oDelegate.removeItem.resetHistory();

		this.oControl.setPropertyKeys(["dynamicInactive", "staticProp1", "dynamicActive"]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.deepEqual(getItemKeys(this.oControl), ["staticProp1", "dynamicActive"],
			"staticProp2 removed from aggregation");
		assert.strictEqual(oDelegate.removeItem.callCount, 1, "Delegate.removeItem called once");
		assert.strictEqual(oDelegate.removeItem.firstCall.args[1].getPropertyKey(), "staticProp2",
			"removeItem called for staticProp2");
	});

	QUnit.test("Reorders items when key order changes in propertyKeys", async function(assert) {
		await this.oControl.syncItemsFromPropertyKeys();

		this.oControl.setPropertyKeys(["dynamicActive", "staticProp2", "dynamicInactive", "staticProp1"]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.deepEqual(getItemKeys(this.oControl), ["dynamicActive", "staticProp2", "staticProp1"],
			"Items reordered to match propertyKeys (inactive skipped)");
	});

	QUnit.test("Adds new items when key is added to propertyKeys", async function(assert) {
		await this.oControl.syncItemsFromPropertyKeys();
		const oDelegate = this.oControl.getControlDelegate();

		// Remove staticProp2 first, then add it back
		this.oControl.setPropertyKeys(["dynamicInactive", "staticProp1", "dynamicActive"]);
		await this.oControl.syncItemsFromPropertyKeys();
		oDelegate.addItem.resetHistory();

		this.oControl.setPropertyKeys(["dynamicInactive", "staticProp1", "dynamicActive", "staticProp2"]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.deepEqual(getItemKeys(this.oControl), ["staticProp1", "dynamicActive", "staticProp2"],
			"staticProp2 added at end");
		assert.strictEqual(oDelegate.addItem.callCount, 1, "Delegate.addItem called once");
		assert.strictEqual(oDelegate.addItem.firstCall.args[1], "staticProp2", "addItem called for staticProp2");
	});

	QUnit.test("Idempotent - calling twice with same state does not re-invoke delegate", async function(assert) {
		await this.oControl.syncItemsFromPropertyKeys();
		const oDelegate = this.oControl.getControlDelegate();
		oDelegate.addItem.resetHistory();
		oDelegate.removeItem.resetHistory();

		await this.oControl.syncItemsFromPropertyKeys();

		assert.strictEqual(oDelegate.addItem.callCount, 0, "Delegate.addItem not called");
		assert.strictEqual(oDelegate.removeItem.callCount, 0, "Delegate.removeItem not called");
		assert.deepEqual(getItemKeys(this.oControl), ["staticProp1", "staticProp2", "dynamicActive"],
			"Items unchanged");
	});

	QUnit.test("Empty propertyKeys removes all items", async function(assert) {
		await this.oControl.syncItemsFromPropertyKeys();

		this.oControl.setPropertyKeys([]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.strictEqual(this.oControl.getItems().length, 0, "All items removed");
	});

	QUnit.test("All inactive keys results in empty aggregation", async function(assert) {
		this.oControl.setPropertyKeys(["dynamicInactive"]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.strictEqual(this.oControl.getItems().length, 0, "No items materialized when all keys are inactive");
	});

	QUnit.test("Throws error for unknown property key", async function(assert) {
		this.oControl.setPropertyKeys(["staticProp1", "unknownProp", "dynamicActive"]);

		try {
			await this.oControl.syncItemsFromPropertyKeys();
			assert.ok(false, "Should have thrown");
		} catch (oError) {
			assert.ok(oError.message.includes("unknownProp"), "Error mentions the unknown property key: " + oError.message);
			assert.ok(oError.message.includes("not available"), "Error mentions unavailability: " + oError.message);
		}
	});

	QUnit.test("Throws when syncItemsFromPropertyKeys is called in aggregation mode", async function(assert) {
		this.oControl.destroy();
		this.oControl = createTestControl({items: [new TestItem({propertyKey: "staticProp1"})]});

		try {
			await this.oControl.syncItemsFromPropertyKeys();
			assert.ok(false, "Should have thrown");
		} catch (oError) {
			assert.ok(/must not be called in aggregation mode/.test(oError.message),
				"syncItemsFromPropertyKeys throws: " + oError.message);
		}
	});

	QUnit.test("Delegate.addItem returning null throws error", async function(assert) {
		const oDelegate = this.oControl.getControlDelegate();

		this.oControl.setPropertyKeys([]);
		await this.oControl.syncItemsFromPropertyKeys();

		oDelegate.addItem.resolves(null);
		this.oControl.setPropertyKeys(["staticProp1"]);

		try {
			await this.oControl.syncItemsFromPropertyKeys();
			assert.ok(false, "Should have thrown");
		} catch (oError) {
			assert.ok(oError.message.includes("addItem"), "Error mentions addItem: " + oError.message);
		}
	});

	QUnit.test("Delegate.addItem returning item with wrong propertyKey throws error", async function(assert) {
		const oDelegate = this.oControl.getControlDelegate();

		this.oControl.setPropertyKeys([]);
		await this.oControl.syncItemsFromPropertyKeys();

		oDelegate.addItem.callsFake(function() {
			return Promise.resolve(new TestItem({propertyKey: "wrongKey"}));
		});
		this.oControl.setPropertyKeys(["staticProp1"]);

		try {
			await this.oControl.syncItemsFromPropertyKeys();
			assert.ok(false, "Should have thrown");
		} catch (oError) {
			assert.ok(oError.message.includes("wrongKey"), "Error mentions the wrong key: " + oError.message);
			assert.ok(oError.message.includes("staticProp1"), "Error mentions the expected key: " + oError.message);
		}
	});

	QUnit.test("Delegate.addItem returning item without propertyKey property is accepted", async function(assert) {
		const oDelegate = this.oControl.getControlDelegate();
		const TestItemNoKey = Element.extend("test.ItemNoKey");

		this.oControl.setPropertyKeys([]);
		await this.oControl.syncItemsFromPropertyKeys();

		oDelegate.addItem.callsFake(function() {
			return Promise.resolve(new TestItemNoKey());
		});
		this.oControl.setPropertyKeys(["staticProp1"]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.strictEqual(this.oControl.getItems().length, 1, "Item added to aggregation");
	});

	QUnit.test("Control destroyed during sync aborts gracefully", async function(assert) {
		const oDelegate = this.oControl.getControlDelegate();
		const oControl = this.oControl;

		oControl.setPropertyKeys([]);
		await oControl.syncItemsFromPropertyKeys();

		oDelegate.addItem.callsFake(function() {
			oControl.destroy();
			return Promise.resolve(new TestItem({propertyKey: "staticProp1"}));
		});

		oControl.setPropertyKeys(["staticProp1"]);
		await oControl.syncItemsFromPropertyKeys(); // Should not throw
		assert.ok(oControl.isDestroyed(), "Control is destroyed");
		this.oControl = null;
	});

	QUnit.test("Control destroyed during remove aborts gracefully", async function(assert) {
		await this.oControl.syncItemsFromPropertyKeys();
		const oDelegate = this.oControl.getControlDelegate();
		const oControl = this.oControl;

		oDelegate.removeItem.callsFake(function() {
			oControl.destroy();
			return Promise.resolve(true);
		});

		oDelegate.addItem.resetHistory();
		oControl.setPropertyKeys(["dynamicInactive", "dynamicActive"]);
		await oControl.syncItemsFromPropertyKeys(); // Should not throw
		assert.ok(oControl.isDestroyed(), "Control is destroyed");
		assert.ok(oDelegate.addItem.notCalled, "addItem not called after destroy during remove");
		this.oControl = null;
	});

	QUnit.test("Delegate.removeItem returning false prevents item destruction", async function(assert) {
		await this.oControl.syncItemsFromPropertyKeys();
		const oDelegate = this.oControl.getControlDelegate();
		oDelegate.removeItem.resolves(false);

		const oStaticProp2Item = this.oControl.getItems().find((oItem) => oItem.getPropertyKey() === "staticProp2");
		this.oControl.setPropertyKeys(["dynamicInactive", "staticProp1", "dynamicActive"]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.ok(!oStaticProp2Item.isDestroyed(), "Item is not destroyed when Delegate.removeItem returns false");
		assert.ok(!this.oControl.getItems().includes(oStaticProp2Item), "Item is removed from aggregation");

		oStaticProp2Item.destroy();
	});

	QUnit.test("Triggers lazy PropertyHelper finalization for unknown property", async function(assert) {
		this.oControl._bPropertyHelperFinal = false;
		this.oControl.finalizePropertyHelper = sinon.stub().callsFake(() => {
			this.oControl.getPropertyHelper().setProperties(aProperties.concat([
				{key: "lateProp", label: "Late", dataType: "sap.ui.model.type.String"}
			]));
			this.oControl._bPropertyHelperFinal = true;
			return Promise.resolve();
		});

		this.oControl.setPropertyKeys(["lateProp"]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.ok(this.oControl.finalizePropertyHelper.calledOnce, "finalizePropertyHelper called");
		assert.deepEqual(getItemKeys(this.oControl), ["lateProp"], "Item created after finalization");
	});

	QUnit.module("_onModifications wrapper", {
		beforeEach: function() {
			this.oControl = createTestControl({propertyKeys: ["staticProp1"]});
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	QUnit.test("Calls syncItemsFromPropertyKeys before original _onModifications", async function(assert) {
		const oSyncStub = sinon.stub(this.oControl, "syncItemsFromPropertyKeys").resolves();

		await this.oControl._onModifications([]);

		assert.ok(oSyncStub.calledOnce, "syncItemsFromPropertyKeys called");
	});

	QUnit.test("Does not call syncItemsFromPropertyKeys in aggregation mode", async function(assert) {
		this.oControl.destroy();
		this.oControl = createTestControl({items: [new TestItem({propertyKey: "staticProp1"})]});
		const oSyncStub = sinon.stub(this.oControl, "syncItemsFromPropertyKeys").resolves();

		await this.oControl._onModifications([]);

		assert.ok(oSyncStub.notCalled, "syncItemsFromPropertyKeys not called");
	});

	QUnit.module("Cleanup", {
		beforeEach: function() {
			this.oControl = createTestControl({propertyKeys: ["staticProp1"]});
		}
	});

	QUnit.test("Cleans up mixin state on destroy", function(assert) {
		assert.ok(this.oControl.hasOwnProperty("_bUsesPropertyKeysMode"), "Before destroy: _bUsesPropertyKeysMode is an own property");
		assert.strictEqual(this.oControl._bUsesPropertyKeysMode, true, "Before destroy: _bUsesPropertyKeysMode is true");

		this.oControl.destroy();

		assert.ok(!this.oControl.hasOwnProperty("_bUsesPropertyKeysMode"), "After destroy: _bUsesPropertyKeysMode own property deleted");
	});

	QUnit.module("initializeItemsFromPropertyKeys", {
		beforeEach: function() {
			this.oControl = createTestControl({propertyKeys: ["staticProp1"]});
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	QUnit.test("Waits for changes and syncs", async function(assert) {
		const oEngine = this.oControl.getEngine();
		oEngine.isModificationSupported.resolves(true);
		const oSyncSpy = sinon.spy(this.oControl, "syncItemsFromPropertyKeys");

		await this.oControl.initializeItemsFromPropertyKeys();

		assert.ok(oEngine.waitForChanges.calledOnce, "Engine.waitForChanges called");
		assert.ok(oSyncSpy.calledOnce, "syncItemsFromPropertyKeys called");
	});

	QUnit.test("Skips waitForChanges when modifications not supported", async function(assert) {
		const oEngine = this.oControl.getEngine();
		const oSyncSpy = sinon.spy(this.oControl, "syncItemsFromPropertyKeys");

		await this.oControl.initializeItemsFromPropertyKeys();

		assert.ok(oEngine.waitForChanges.notCalled, "Engine.waitForChanges not called");
		assert.ok(oSyncSpy.calledOnce, "syncItemsFromPropertyKeys still called");
	});

	QUnit.test("Throws in aggregation mode", async function(assert) {
		this.oControl.destroy();
		this.oControl = createTestControl({items: [new TestItem({propertyKey: "staticProp1"})]});

		try {
			await this.oControl.initializeItemsFromPropertyKeys();
			assert.ok(false, "Should have thrown");
		} catch (oError) {
			assert.ok(/must not be called in aggregation mode/.test(oError.message),
				"initializeItemsFromPropertyKeys throws: " + oError.message);
		}
	});

	QUnit.module("Complex property validation", {
		beforeEach: function() {
			this.oControl = createTestControl({
				propertyKeys: ["staticProp1", "dynamicActive"]
			});
		},
		afterEach: function() {
			this.oControl?.destroy();
		}
	});

	QUnit.test("Calls validateDynamicProperties during sync", async function(assert) {
		const oValidateSpy = sinon.spy(this.oControl.getPropertyHelper(), "validateDynamicProperties");

		await this.oControl.syncItemsFromPropertyKeys();

		assert.ok(oValidateSpy.calledOnce, "validateDynamicProperties called once");
	});

	QUnit.test("PropertyHelper is final when validateDynamicProperties is called", async function(assert) {
		this.oControl._bPropertyHelperFinal = false;
		this.oControl.finalizePropertyHelper = sinon.stub().callsFake(async () => {
			await Promise.resolve();
			this.oControl.getPropertyHelper().setProperties(aProperties.concat([
				{key: "lateProp", label: "Late", dataType: "sap.ui.model.type.String"}
			]));
			this.oControl._bPropertyHelperFinal = true;
		});

		let bFinalWhenValidated;
		sinon.stub(this.oControl.getPropertyHelper(), "validateDynamicProperties").callsFake(() => {
			bFinalWhenValidated = this.oControl.isPropertyHelperFinal();
		});

		this.oControl.setPropertyKeys(["lateProp"]);
		await this.oControl.syncItemsFromPropertyKeys();

		assert.strictEqual(bFinalWhenValidated, true, "PropertyHelper is final when validateDynamicProperties is called");
	});
});
