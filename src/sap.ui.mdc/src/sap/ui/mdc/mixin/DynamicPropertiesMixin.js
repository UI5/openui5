/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	/**
	 * Enhances a given control prototype with dynamic property support via key-based aggregation management.
	 *
	 * <b>Property keys mode</b>: When <code>propertyKeys</code> is non-empty, the control
	 * operates in property keys mode. Flex changes only modify the <code>propertyKeys</code> property.
	 * The aggregation is derived reactively by {@link #syncItemsFromPropertyKeys} after each batch of changes.
	 *
	 * <b>Aggregation mode</b>: When <code>propertyKeys</code> is empty, the control operates in aggregation
	 * mode (legacy behavior). Dynamic properties are not supported.
	 *
	 * The two modes are mutually exclusive. Defining both <code>propertyKeys</code> and items in the
	 * aggregation throws an error.
	 *
	 * The following methods are available:
	 * <ul>
	 * <li><code>isInPropertyKeysMode</code> - Whether the control uses property keys mode.</li>
	 * <li><code>syncItemsFromPropertyKeys</code> - Syncs the item aggregation from <code>propertyKeys</code> + PropertyHelper state.</li>
	 * <li><code>initializeItemsFromPropertyKeys</code> - Waits for pending flex changes and syncs. For use during control init.</li>
	 * </ul>
	 *
	 * Additionally, the following methods are wrapped:
	 * <ul>
	 * <li><code>applySettings</code></li>
	 * <li><code>exit</code></li>
	 * <li><code>_onModifications</code></li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.mixin.DynamicPropertiesMixin
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const DynamicPropertiesMixin = {};

	/**
	 * Whether the control is in property keys mode.
	 *
	 * In property keys mode, the aggregation is not managed directly. Instead, the <code>propertyKeys</code> property is the source of truth:
	 * flex changes only modify <code>propertyKeys</code>, and the aggregation is derived reactively by {@link #syncItemsFromPropertyKeys}.
	 * This enables support for dynamic properties whose metadata (e.g. <code>isActive</code>) can change at runtime — inactive properties are
	 * tracked in <code>propertyKeys</code> but excluded from the aggregation.
	 *
	 * The control is in property keys mode when no items are defined in the aggregation at initialization time. If items are defined in the
	 * aggregation, the control operates in aggregation mode and <code>propertyKeys</code> is not used.
	 *
	 * @returns {boolean} <code>true</code> if the control is in property keys mode
	 * @public
	 */
	DynamicPropertiesMixin.isInPropertyKeysMode = function() {
		return this._bUsesPropertyKeysMode;
	};

	/**
	 * Syncs the item aggregation from <code>propertyKeys</code> and PropertyHelper state.
	 * Computes the diff between the current aggregation and the desired state, and patches:
	 * creates and adds missing items, removes and destroys excess items, reorders mismatched items.
	 * Idempotent — calling with an unchanged state is a no-op.
	 *
	 * @returns {Promise} Resolves when the sync is complete
	 * @public
	 */
	DynamicPropertiesMixin.syncItemsFromPropertyKeys = async function() {
		if (!this.isInPropertyKeysMode()) {
			throw new Error(this + ": syncItemsFromPropertyKeys must not be called in aggregation mode.");
		}

		const oPropertyHelper = this.getPropertyHelper();
		const aDesiredKeys = this.getPropertyKeys();

		// Resolve active keys — finalize PropertyHelper lazily on first unknown property
		const aActiveKeys = [];
		for (const sKey of aDesiredKeys) {
			let oProperty = oPropertyHelper.getProperty(sKey, true);
			if (!oProperty) {
				if (!this.isPropertyHelperFinal()) {
					await this.finalizePropertyHelper();
					oProperty = oPropertyHelper.getProperty(sKey, true);
				}
				if (!oProperty) {
					throw new Error(`${this}: Property '${sKey}' is in 'propertyKeys' but not available.`
						+ ` Ensure the property is defined in the 'propertyInfo' control property or provided by Delegate.fetchProperties.`);
				}
			}
			if (oProperty.isActive !== false) {
				aActiveKeys.push(sKey);
			}
		}

		oPropertyHelper.validateDynamicProperties();
		await patchAggregation(this, aActiveKeys);
	};

	/**
	 * Patches the aggregation to match the desired active keys: removes excess items, adds missing items, reorders mismatched items.
	 *
	 * @param {sap.ui.mdc.Control} oControl The control instance
	 * @param {string[]} aActiveKeys The desired active property keys
	 */
	async function patchAggregation(oControl, aActiveKeys) {
		const oDelegate = oControl.getControlDelegate();
		const oAggMetadata = oControl.getMetadata().getAggregation(oControl._mDynamicPropertiesMixinSettings.aggregation);
		const aCurrentItems = oControl[oAggMetadata._sGetter]();
		const mCurrentByKey = {};
		aCurrentItems.forEach((oItem) => {
			mCurrentByKey[oItem.getPropertyKey()] = oItem;
		});

		// Remove excess items
		const aDesiredKeySet = new Set(aActiveKeys);
		for (const oItem of aCurrentItems) {
			if (!aDesiredKeySet.has(oItem.getPropertyKey())) {
				oControl[oAggMetadata._sRemoveMutator](oItem);
				const bContinue = await oDelegate.removeItem(oControl, oItem);
				if (bContinue !== false) {
					oItem.destroy();
				}
				delete mCurrentByKey[oItem.getPropertyKey()];
			}
		}

		if (oControl.isDestroyed()) {
			return;
		}

		// Add missing items and ensure correct order
		for (let i = 0; i < aActiveKeys.length; i++) {
			const sKey = aActiveKeys[i];
			let oItem = mCurrentByKey[sKey];

			if (!oItem) {
				oItem = await oDelegate.addItem(oControl, sKey);
				if (!oItem) {
					throw new Error("Delegate.addItem did not return an item for property '" + sKey + "'");
				}
				if (oItem.getPropertyKey && oItem.getPropertyKey() !== sKey) {
					throw new Error("Delegate.addItem returned an item with propertyKey '"
						+ oItem.getPropertyKey() + "' instead of '" + sKey + "'");
				}
				if (oControl.isDestroyed()) {
					return;
				}
				oControl[oAggMetadata._sInsertMutator](oItem, i);
			} else {
				const aUpdatedItems = oControl[oAggMetadata._sGetter]();
				const iCurrentIndex = aUpdatedItems.indexOf(oItem);
				if (iCurrentIndex !== i) {
					oControl[oAggMetadata._sRemoveMutator](oItem);
					oControl[oAggMetadata._sInsertMutator](oItem, i);
				}
			}
		}
	}

	/**
	 * Waits for pending flex changes, then syncs the item aggregation via
	 * {@link #syncItemsFromPropertyKeys}. For use during control initialization.
	 * Includes the <code>isModificationSupported</code> check — if modifications are not supported,
	 * skips <code>waitForChanges</code>.
	 *
	 * <b>Note:</b> Must not be called from within <code>_onModifications</code> — <code>waitForChanges</code>
	 * would deadlock there.
	 *
	 * @returns {Promise} Resolves when the initial sync is complete
	 * @public
	 */
	DynamicPropertiesMixin.initializeItemsFromPropertyKeys = async function() {
		if (!this.isInPropertyKeysMode()) {
			throw new Error(this + ": initializeItemsFromPropertyKeys must not be called in aggregation mode.");
		}

		const oEngine = this.getEngine();
		const bModificationSupported = await oEngine.isModificationSupported(this);

		if (bModificationSupported) {
			await oEngine.waitForChanges(this);
		}

		await this.syncItemsFromPropertyKeys();
	};

	DynamicPropertiesMixin.applySettings = function(fnApplySettings) {
		return function() {
			fnApplySettings.apply(this, arguments);

			const sAggregationName = this._mDynamicPropertiesMixinSettings.aggregation;
			const oAggMetadata = this.getMetadata().getAggregation(sAggregationName);
			const aPropertyKeys = this.getPropertyKeys();
			const aAggregationItems = this[oAggMetadata._sGetter]();

			if (aPropertyKeys.length > 0 && aAggregationItems.length > 0) {
				throw new Error(`${this}: 'propertyKeys' and '${sAggregationName}' are mutually exclusive. Define one or the other, not both.`);
			}

			this._bUsesPropertyKeysMode = aPropertyKeys.length > 0;

			return this;
		};
	};

	DynamicPropertiesMixin._onModifications = function(fnOnModifications) {
		return function(aAffectedControllers) {
			let pSync = Promise.resolve();
			if (this.isInPropertyKeysMode()) {
				pSync = this.syncItemsFromPropertyKeys();
			}
			return pSync.then(() => {
				return fnOnModifications.apply(this, arguments);
			});
		};
	};

	DynamicPropertiesMixin.exit = function(fnExit) {
		return function() {
			delete this._bUsesPropertyKeysMode;
			delete this._mDynamicPropertiesMixinSettings;

			if (fnExit) {
				fnExit.apply(this, arguments);
			}
		};
	};

	return function(mSettings) {
		// Validate prerequisites
		const sAggregationName = mSettings.aggregation;
		const oControlMetadata = this.getMetadata();
		if (!oControlMetadata.hasAggregation(sAggregationName)) {
			throw new Error("DynamicPropertiesMixin: Aggregation '" + sAggregationName + "' not found.");
		}
		if (!oControlMetadata.hasProperty("propertyKeys")) {
			throw new Error("DynamicPropertiesMixin: Control does not have a 'propertyKeys' property.");
		}

		this._mDynamicPropertiesMixinSettings = mSettings;

		// Wrappers
		this.applySettings = DynamicPropertiesMixin.applySettings(this.applySettings);
		this._onModifications = DynamicPropertiesMixin._onModifications(this._onModifications);
		this.exit = DynamicPropertiesMixin.exit(this.exit);

		// Additional methods
		this.isInPropertyKeysMode = DynamicPropertiesMixin.isInPropertyKeysMode;
		this.syncItemsFromPropertyKeys = DynamicPropertiesMixin.syncItemsFromPropertyKeys;
		this.initializeItemsFromPropertyKeys = DynamicPropertiesMixin.initializeItemsFromPropertyKeys;
	};
});
