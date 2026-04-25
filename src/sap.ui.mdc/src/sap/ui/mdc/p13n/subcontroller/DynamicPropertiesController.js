/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/base/util/merge"
], (
	BaseController,
	xConfigAPI,
	merge
) => {
	"use strict";

	/**
	 * Constructor for a new <code>DynamicPropertiesController</code>.
	 * This controller can be registered using the <code>sap.m.p13n.Engine</code> for changes of the PropertyInfo.
	 *
	 * @class
	 * The <code>DynamicPropertiesController</code> entity serves to create PropertyInfo-specific personalization changes.
	 *
	 * @param {object} mSettings Initial settings for the new controller
	 * @param {sap.ui.core.Control} mSettings.control
	 *     The control instance that is personalized by this controller
	 * @param {function(sap.ui.core.Element):string} [mSettings.getKeyForItem]
	 *     By default the controller tries to identify the existing item through the key by checking if there is an existing item with this id. This
	 *     behaviour can be overruled by implementing this method which will provide the according item of the <code>targetAggregation</code> to
	 *     return the according key associated to this item.
	 * @param {string} mSettings.targetAggregation
	 *     The name of the aggregation that is now managed by this controller
	 * @param {string} [mSettings.persistenceIdentifier]
	 *     If multiple <code>SelectionController</code> controls exist for a personalization use case, the <code>persistenceIdentifier</code> property
	 *     must be added to uniquely identify a <code>SelectionController</code> control
	 * @param {sap.m.p13n.MetadataHelper} [mSettings.helper]
	 *     The <code>{@link sap.m.p13n.MetadataHelper MetadataHelper}</code> to provide metadata-specific information. It may be used to define more
	 *     granular information for the selection of items.
	 * @param {string[]} mSettings.allowedPropertyAttributes List of property attributes that can be personalized
	 *
	 * @extends sap.m.p13n.SelectionController
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias sap.ui.mdc.p13n.subcontroller.DynamicPropertiesController
	 */
	const DynamicPropertiesController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.DynamicPropertiesController", {
		constructor: function(mSettings) {
			BaseController.apply(this, arguments);
			this.aAllowedPropertyAttributes = mSettings.allowedPropertyAttributes;

			if (!Array.isArray(this.aAllowedPropertyAttributes) || this.aAllowedPropertyAttributes.length === 0) {
				throw new Error("DynamicPropertiesController: 'allowedPropertyAttributes' must be an array with at least one entry!");
			}
			if (typeof mSettings.control.isInPropertyKeysMode !== "function") {
				throw new Error("DynamicPropertiesController: Control '" + mSettings.control
					+ "' does not implement DynamicPropertiesMixin.");
			}
		}
	});

	/**
	 * Returns the state key for external state representation.
	 *
	 * @returns {string} The external state key
	 * @private
	 * @ui5-restricted sap.m.p13n.Engine, sap.ui.mdc
	 */
	DynamicPropertiesController.prototype.getStateKey = function() {
		return "supplementaryConfig";
	};

	/**
	 * Returns the available change types for change creation.
	 *
	 * @returns {object} An object of available change operations
	 * @private
	 * @ui5-restricted sap.m.p13n.Engine, sap.ui.mdc
	 */
	DynamicPropertiesController.prototype.getChangeOperations = function() {
		return {
			setPropertyAttribute: "setPropertyAttribute"
		};
	};

	/**
	 * Returns the current state of the controller.
	 *
	 * @returns {object} The current state
	 * @private
	 * @ui5-restricted sap.m.p13n.Engine, sap.ui.mdc
	 */
	DynamicPropertiesController.prototype.getCurrentState = function() {
		const oControl = this.getAdaptationControl();
		const mState = oControl.getEngine().readXConfig(oControl)?.propertyInfo;
		return mState ? {propertyInfo: mState} : undefined;
	};

	/**
	 * Formats the external state to the internal representation of the controller. The external state with key "supplementaryConfig" could contain
	 * states of multiple controllers.
	 *
	 * @param {object} oExternalState The external state to be formatted to the internal representation of the controller
	 * @returns {object} The internal state representation of the controller
	 * @private
	 * @ui5-restricted sap.m.p13n.Engine
	 */
	DynamicPropertiesController.prototype.formatToInternalState = function(oExternalState) {
		const mState = oExternalState?.propertyInfo;
		return mState ? {propertyInfo: mState} : {};
	};

	/**
	 * Calculates the delta between the current state and the changed state.
	 *
	 * @param {object} mDeltaInfo An object containing information about two states to compare
	 * @param {object[]} mDeltaInfo.existingState An array describing the control state before a adaptation
	 * @param {object[]} mDeltaInfo.changedState An array describing the control state after a certain adaptation
	 * @param {object} mDeltaInfo.control Control instance which is being used to generate the changes
	 * @param {object} mDeltaInfo.changeOperations Map containing the changeOperations for the given Control instance
	 * @param {boolean} mDeltaInfo.applyAbsolute Determines whether absolute or delta changes should be created
	 * @param {Array.<{key: string, name: string}>} mDeltaInfo.propertyInfo Array of available propertyInfo entries
	 * @returns {object[]} An array of column width changes
	 * @private
	 * @ui5-restricted sap.m.p13n.Engine, sap.ui.mdc
	 */
	DynamicPropertiesController.prototype.getDelta = function(mDeltaInfo) {
		if (!mDeltaInfo.control.isInPropertyKeysMode()) {
			return [];
		}

		const aChanges = [];
		const oDeltaState = mDeltaInfo.applyAbsolute
			? calculateAbsoluteDelta(mDeltaInfo.existingState?.propertyInfo, mDeltaInfo.changedState?.propertyInfo)
			: calculateRelativeDelta(mDeltaInfo.existingState?.propertyInfo, mDeltaInfo.changedState?.propertyInfo);

		for (const sPropertyKey in oDeltaState) {
			const oPropertyChanges = oDeltaState[sPropertyKey];
			const oProperty = mDeltaInfo.control.getPropertyHelper().getProperty(sPropertyKey, true);

			if (!oProperty) {
				if (mDeltaInfo.control.isPropertyHelperFinal()) {
					throw new Error("Unknown property '" + sPropertyKey + "'. Ensure it is defined in the PropertyInfo.");
				}
			} else if (typeof oProperty.isActive !== "boolean") {
				throw new Error("Cannot create change for static property '" + sPropertyKey + "'");
			}

			for (const sAttribute in oPropertyChanges) {

				if (!this.aAllowedPropertyAttributes.includes(sAttribute)) {
					continue; // Unsupported attribute change
				}

				aChanges.push({
					selectorElement: mDeltaInfo.control,
					changeSpecificData: {
						changeType: "setPropertyAttribute",
						content: {
							name: sPropertyKey,
							attribute: sAttribute,
							value: oPropertyChanges[sAttribute]
						}
					},
					"transient": true
				});
			}
		}

		return aChanges;
	};

	/**
	 * Calculates the absolute delta state by comparing existing and changed states.
	 *
	 * @param {object} [oExistingState] The existing state
	 * @param {object} [oChangedState] The changed state
	 * @returns {object} The delta state
	 * @private
	 */
	function calculateAbsoluteDelta(oExistingState = {}, oChangedState = {}) {
		const oDeltaState = {...oChangedState};

		// Check for properties that exist in existingState but not in changedState - they need to be removed
		for (const sPropertyKey in oExistingState) {
			if (!oChangedState[sPropertyKey]) {
				// Property was completely removed - set all attributes to null
				const oExistingProperty = oExistingState[sPropertyKey];
				oDeltaState[sPropertyKey] = {};
				for (const sAttributeKey in oExistingProperty) {
					oDeltaState[sPropertyKey][sAttributeKey] = null;
				}
			} else {
				// Property exists in both, check for removed attributes
				const oExistingProperty = oExistingState[sPropertyKey];
				const oChangedProperty = oChangedState[sPropertyKey];

				for (const sAttributeKey in oExistingProperty) {
					if (!oChangedProperty.hasOwnProperty(sAttributeKey)) {
						// Attribute was removed - set to null
						if (!oDeltaState[sPropertyKey]) {
							oDeltaState[sPropertyKey] = {};
						}
						oDeltaState[sPropertyKey][sAttributeKey] = null;
					}
				}
			}
		}

		return oDeltaState;
	}

	/**
	 * Calculates the relative delta state by finding differences between existing and changed states.
	 *
	 * @param {object} [oExistingState] The existing state
	 * @param {object} [oChangedState] The changed state
	 * @returns {object} The delta state
	 * @private
	 */
	function calculateRelativeDelta(oExistingState = {}, oChangedState = {}) {
		const oDeltaState = {};

		// Check for new or changed properties
		for (const sPropertyKey in oChangedState) {
			if (!oExistingState[sPropertyKey]) {
				// New PropertyInfo entry
				oDeltaState[sPropertyKey] = oChangedState[sPropertyKey];
			} else {
				// Existing PropertyInfo entry - check for changes
				const oChangedProperty = oChangedState[sPropertyKey];
				const oExistingProperty = oExistingState[sPropertyKey];
				const oDeltaProperty = {};

				for (const sAttributeKey in oChangedProperty) {
					if (JSON.stringify(oChangedProperty[sAttributeKey]) !== JSON.stringify(oExistingProperty[sAttributeKey])) {
						// Attribute has changed
						oDeltaProperty[sAttributeKey] = oChangedProperty[sAttributeKey];
					}
				}

				if (Object.keys(oDeltaProperty).length > 0) {
					oDeltaState[sPropertyKey] = oDeltaProperty;
				}
			}
		}

		return oDeltaState;
	}


	/**
	 * Transforms an array of changes to the state representation
	 *
	 * @param {object[]} aChanges An array of changes
	 * @returns {object} The state
	 * @private
	 * @ui5-restricted sap.m.p13n.Engine
	 */
	DynamicPropertiesController.prototype.changesToState = function(aChanges) {
		let oState = {};
		const oControl = aChanges.length && aChanges[0].selectorElement;

		aChanges.forEach((oChange) => {
			const sAttribute = oChange.changeSpecificData.content.attribute;
			const vValue = oChange.changeSpecificData.content.value;

			oState = xConfigAPI.createAggregationConfig(oControl, {
				name: oChange.changeSpecificData.content.name,
				controlMeta: {
					aggregation: "propertyInfo"
				},
				property: sAttribute,
				value: typeof vValue === "object" && vValue !== null ? merge({}, vValue) : vValue
			}, oState);
		});

		return oState;
	};

	return DynamicPropertiesController;

});