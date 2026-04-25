/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/p13n/Engine', 'sap/ui/mdc/flexibility/Util', 'sap/ui/fl/changeHandler/condenser/Classification'
], (Engine, Util, CondenserClassification) => {
	"use strict";

	/**
	 * @class Utility class for generic mdc xConfig handling by utilizing the
	 * <code>sap.ui.mdc.p13n.Engine</code> and its <code>Modificationhandler</code>.
	 * This class should be used to handle property changes that should be persisted
	 * as flex changes for MDC control while enabling preprocessing via customdata.
	 *
	 * @author SAP SE
	 * @private
	 * @alias sap.ui.mdc.flexibility.xConfigFlex
	 */
	const xConfigFlex = {};

	const fnQueueChange = function(oControl, fTask) {
		const fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oControl._pQueue === pOriginalPromise) {
				delete oControl._pQueue;
			}
		};

		oControl._pQueue = oControl._pQueue instanceof Promise ? oControl._pQueue.then(fTask) : fTask();
		oControl._pQueue.then(fCleanupPromiseQueue.bind(null, oControl._pQueue));

		return oControl._pQueue;
	};

	/**
	 * Creates a change handler specific to the provided aggregation and property,
	 * to enhance the xConfig object for a given mdc control instance.
	 *
	 * The <code>property</code> can be a string (static, resolved at registration time) or a function
	 * (dynamic, resolved per change). A function receives the change object and returns the property name.
	 *
	 * The enhanced object can be accessed using <code>Engine#readAggregationConfig</code>.
	 *
	 * @param {object} mMetaConfig A map describing the metadata structure that is affected by this change handler
	 * @param {string} mMetaConfig.aggregation The aggregation name (such as <code>columns</code> or <code>propertyInfo</code>)
	 * @param {string|function(sap.ui.fl.Change):string} mMetaConfig.property The property name (such as <code>width</code> or <code>label</code>),
	 *   or a function that receives the change and returns the property name
	 * @param {string} [mMetaConfig.classification] The condenser classification for the change handler
	 *
	 * @returns {object} The created change handler object
	 */
	xConfigFlex.createSetChangeHandler = function(mMetaConfig) {

		if (!mMetaConfig || !mMetaConfig.hasOwnProperty("aggregation") || !mMetaConfig.hasOwnProperty("property")) {
			throw new Error("Please provide a map containing the affected aggregation and property name!");
		}

		const sAffectedAggregation = mMetaConfig.aggregation;
		const bDynamic = typeof mMetaConfig.property === "function";

		function resolveProperty(oChange) {
			return bDynamic ? mMetaConfig.property(oChange) : mMetaConfig.property;
		}

		const fApply = function(oChange, oControl, mPropertyBag) {
			return fnQueueChange(oControl, async () => {
				const oPriorAggregationConfig = await Engine.getInstance().readXConfig(oControl, {
					propertyBag: mPropertyBag
				});

				let sOldValue = null;
				const sPropertyKey = oChange.getContent().name;
				const sProperty = resolveProperty(oChange);

				const oPriorSection = oControl.getMetadata().hasAggregation(sAffectedAggregation)
					? oPriorAggregationConfig?.aggregations?.[sAffectedAggregation]
					: oPriorAggregationConfig?.[sAffectedAggregation];

				if (oPriorSection?.[sPropertyKey]?.[sProperty] !== undefined) {
					sOldValue = oPriorSection[sPropertyKey][sProperty];
				}

				oChange.setRevertData(bDynamic
					? {name: sPropertyKey, property: sProperty, value: sOldValue}
					: {name: sPropertyKey, value: sOldValue}
				);

				return Engine.getInstance().enhanceXConfig(oControl, {
					controlMeta: {
						aggregation: sAffectedAggregation
					},
					property: sProperty,
					name: sPropertyKey,
					value: oChange.getContent().value,
					propertyBag: mPropertyBag
				});
			});
		};

		const fRevert = async function(oChange, oControl, mPropertyBag) {
			await Engine.getInstance().enhanceXConfig(oControl, {
				controlMeta: {
					aggregation: sAffectedAggregation
				},
				property: bDynamic ? oChange.getRevertData().property : mMetaConfig.property,
				name: oChange.getRevertData().name,
				value: oChange.getRevertData().value,
				propertyBag: mPropertyBag
			});
			oChange.resetRevertData();
		};

		return Util.createChangeHandler({
			apply: fApply,
			revert: fRevert,
			getCondenserInfo: function(oChange, mPropertyBag) {
				return {
					classification: mMetaConfig.classification ?? CondenserClassification.LastOneWins,
					affectedControl: oChange.getSelector(),
					uniqueKey: oChange.getContent().name + "_" + sAffectedAggregation + "_" + resolveProperty(oChange)
				};
			}
		});

	};

	return xConfigFlex;

});
