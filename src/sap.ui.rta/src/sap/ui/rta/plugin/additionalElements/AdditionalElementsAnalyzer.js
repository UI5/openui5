/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/base/util/ObjectPath",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/rta/util/BindingsExtractor"
], function(
	isPlainObject,
	ObjectPath,
	JsControlTreeModifier,
	ElementUtil,
	OverlayRegistry,
	DelegateMediatorAPI,
	BindingsExtractor
) {
	"use strict";

	function checkForAbsoluteAggregationBinding(oElement, sAggregationName, sModelName) {
		if (!oElement) {
			return false;
		}
		const mBindingInfo = oElement.getBindingInfo(sAggregationName, sModelName);
		let sPath = mBindingInfo && mBindingInfo.path;
		if (!sPath) {
			return false;
		}
		if (sPath.indexOf(">") > -1) {
			sPath = sPath.split(">").pop();
		}
		return sPath.indexOf("/") === 0;
	}

	function getModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName, sModelName) {
		let vBinding;
		if (bAbsoluteAggregationBinding) {
			vBinding = oElement.getBindingInfo(sAggregationName, sModelName);
			// check to be model binding otherwise return undefined
			if (typeof vBinding.model === "string" && vBinding.model !== sModelName) {
				vBinding = undefined;
			}
		} else {
			// here we explicitly request the models binding context
			vBinding = oElement.getBindingContext(sModelName);
		}
		return vBinding;
	}

	function getBindingContextPath(oElement, sAggregationName, sModelName) {
		const bAbsoluteAggregationBinding = checkForAbsoluteAggregationBinding(oElement, sAggregationName, sModelName);
		const vBinding = getModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName, sModelName);
		if (vBinding) {
			return bAbsoluteAggregationBinding ? vBinding.path : vBinding.getPath();
		}
	}

	function flattenProperties(aProperties) {
		const aFlattenedProperties = aProperties.reduce(function(aFlattened, oProperty) {
			if (Array.isArray(oProperty.properties)) {
				// only one level supported by our dialogs
				// Only take the leaves, but attach the parent property name/label to it
				aFlattened = aFlattened.concat(oProperty.properties.map(function(mInnerProp) {
					mInnerProp.parentPropertyName = oProperty.label || oProperty.name;
					return mInnerProp;
				}));
			} else {
				aFlattened.push(oProperty);
			}
			return aFlattened;
		}, []);

		return aFlattenedProperties;
	}

	async function getAllPropertiesFromAddViaDelegateAction(oElement, sAggregationName, mAction) {
		const aProperties = await mAction.delegateInfo.delegate.getPropertyInfo({
			element: oElement,
			aggregationName: sAggregationName,
			payload: mAction.delegateInfo.payload || {}
		});
		return flattenProperties(aProperties);
	}

	async function getAllPropertiesFromDelegate(oElement, sAggregationName) {
		const mDelegateInfo = await DelegateMediatorAPI.getReadDelegateForControl({
			control: oElement,
			modifier: JsControlTreeModifier
		});
		if (mDelegateInfo && mDelegateInfo.instance) {
			return mDelegateInfo.instance.getPropertyInfo({
				element: oElement,
				aggregationName: sAggregationName,
				payload: mDelegateInfo.payload || {}
			});
		}
		return [];
	}

	async function getAllPropertiesFromModels(oElement, sAggregationName, mActions) {
		const mAddViaDelegate = mActions.addViaDelegate;
		let fnGetAllProperties;
		if (mAddViaDelegate) {
			fnGetAllProperties = getAllPropertiesFromAddViaDelegateAction.bind(null, oElement, sAggregationName, mAddViaDelegate);
		} else {
			fnGetAllProperties = getAllPropertiesFromDelegate.bind(null, oElement, sAggregationName);
		}
		const aProperties = await fnGetAllProperties();
		return checkForDuplicateProperties(aProperties);
	}

	function filterUnsupportedProperties(aProperties) {
		return aProperties.filter(function(mProperty) {
			// see _enrichProperty
			return !(mProperty.unsupported || mProperty.hideFromReveal);
		});
	}

	function oPropertyToAdditionalElementInfo(oProperty) {
		const oReturn = {
			selected: false,
			label: oProperty.label || oProperty.name,
			parentPropertyName: oProperty.parentPropertyName ? oProperty.parentPropertyName : "",
			duplicateName: oProperty.duplicateName ? oProperty.duplicateName : false,
			tooltip: oProperty.tooltip || oProperty.label,
			originalLabel: "",
			// command relevant data
			type: "delegate",
			entityType: oProperty.entityType,
			name: oProperty.name,
			bindingPath: oProperty.bindingPath
		};
		if (oProperty.entityTypeDisplayName) {
			oReturn.entityTypeDisplayName = oProperty.entityTypeDisplayName;
		}
		return oReturn;
	}

	function getLabel(oElement, mAction) {
		const oOverlay = OverlayRegistry.getOverlay(oElement);
		// Try different label sources in the following order:
		// 1) Action.getLabel
		// 2) DTMetadata.getLabel
		// 3) The fallbacks in ElementUtil.getLabelForElement
		return (mAction.getLabel || !oOverlay)
			? ElementUtil.getLabelForElement(oElement, mAction.getLabel)
			: oOverlay.getDesignTimeMetadata().getLabel(oElement);
	}

	function elementToAdditionalElementInfo(mData) {
		const oElement = mData.element;
		const sLabel = getLabel(oElement, mData.action);
		const oReturn = {
			selected: false,
			label: oElement.__label || sLabel,
			tooltip: oElement.__tooltip || sLabel || oElement.__bindingPath,
			parentPropertyName: oElement.__parentPropertyName ? oElement.__parentPropertyName : "",
			duplicateName: oElement.__duplicateName ? oElement.__duplicateName : false,
			originalLabel: oElement.__renamedLabel && oElement.__label !== oElement.__originalLabel ? oElement.__originalLabel : "",
			bindingPath: oElement.__bindingPath, // used for OPA tests and debugging
			// command relevant data
			type: "invisible",
			elementId: oElement.getId(),
			sourceAggregation: mData.sourceAggregation
		};
		if (oElement.__entityTypeDisplayName) {
			oReturn.entityTypeDisplayName = oElement.__entityTypeDisplayName;
		}
		return oReturn;
	}

	/**
	 * Retrieving sibling elements from its parent container which are bound to the same Model (important!)
	 *
	 * @param {sap.ui.core.Element} oElement - element for which we're looking for siblings
	 * @param {sap.ui.core.Element} oRelevantContainer - "parent" container of the oElement
	 * @param {string} sAggregationName - name of the aggregation of the action
	 * @param {string} sModelName - model name
	 *
	 * @return {sap.ui.core.Element[]} - returns an array with found siblings elements
	 */
	function getRelevantElements(oElement, oRelevantContainer, sAggregationName, sModelName) {
		if (oRelevantContainer && oRelevantContainer !== oElement) {
			const sRelevantContainerBindingContext = getBindingContextPath(oElement, sAggregationName, sModelName);

			return ElementUtil
			.findAllSiblingsInContainer(oElement, oRelevantContainer)
			// We accept only siblings that are bound on the same model
			.filter(function(oSiblingElement) {
				return sRelevantContainerBindingContext === getBindingContextPath(oSiblingElement, sAggregationName, sModelName);
			});
		}
		return [oElement];
	}

	/**
	 * Marks properties with duplicate labels within the same entity type display name.
	 * The same entity can have different contexts (e.g. peer and manager both from Person entity),
	 * that's why we use the display name and not the entity type itself.
	 *
	 * @param {object[]} aProperties - Array of property objects
	 * @returns {object[]} - The same array with duplicateName flag set where applicable
	 */
	function checkForDuplicateProperties(aProperties) {
		// Group properties by entityType and label to find duplicates
		const mLabelsByEntityTypeDisplayName = {};

		aProperties.forEach(function(oProperty) {
			const sEntityTypeDisplayName = oProperty.entityTypeDisplayName || "";
			const sLabel = oProperty.label || "";
			const sKey = `${sEntityTypeDisplayName}|||${sLabel}`;

			mLabelsByEntityTypeDisplayName[sKey] ||= [];
			mLabelsByEntityTypeDisplayName[sKey].push(oProperty);
		});

		// Mark properties as duplicates if there are multiple with the same entityType display name and label
		Object.values(mLabelsByEntityTypeDisplayName).forEach(function(aPropertiesWithSameLabel) {
			if (aPropertiesWithSameLabel.length > 1) {
				aPropertiesWithSameLabel.forEach(function(oProperty) {
					oProperty.duplicateName = true;
				});
			}
		});

		return aProperties;
	}

	// check for duplicate labels to later add the parent property name/label if available
	function checkForDuplicateLabels(oInvisibleElement, aProperties) {
		return aProperties.some(function(oModelProperty) {
			return oModelProperty.label === oInvisibleElement.__label;
		});
	}

	/**
	 * Checks if array of paths is not empty
	 * @param {string[]} aBindingPaths - Array of collected binding paths
	 * @return {boolean} - true if it has binding(s)
	 */
	function hasBindings(aBindingPaths) {
		return Array.isArray(aBindingPaths) && aBindingPaths.length > 0;
	}

	/**
	 * Looks for a model property for a set of bindings paths
	 *
	 * @param {string[]} aControlsBindingPaths - Array of collected binding paths
	 * @param {object[]} aProperties - Array of Fields
	 *
	 * @return {object|undefined} - returns first found Object with Field (Property) description, undefined if not found
	 */
	function findModelProperty(aControlsBindingPaths, aProperties) {
		return aProperties
		.sort(function(oProperty1, oProperty2) {
			// Temporary fix to avoid evaluating technical properties like RAP feature
			// control flags, might lead to problems if multiple value bindings exist
			// on a hidden control
			return !!oProperty2.hideFromReveal - !!oProperty1.hideFromReveal;
		})
		.filter(function(oModelProperty) {
			return aControlsBindingPaths.some(function(sBindingPath) {
				// there might be some deeper binding paths available on controls,
				// than returned by the model evaluation (e.g. navigation property paths)
				// in this case we only check if the navigation path is valid
				// unsupported: check existence of the property also in the navigation target
				return (
					sBindingPath === oModelProperty.bindingPath
						|| sBindingPath.startsWith(`${oModelProperty.bindingPath}/`)
				);
			});
		})
		.pop();
	}

	function vBindingToPath(vBinding) {
		return (
			isPlainObject(vBinding)
				? vBinding.parts[0].path // TODO what about complex bindings with multiple paths, this was not covered so far?
				: !!vBinding.getPath && vBinding.getPath()
		);
	}

	function getRepresentedBindingPathsFromBinding(oElement, mAction, sModelName, sAggregationName) {
		const oModel = oElement.getModel(sModelName);
		const aRelevantElements = getRelevantElements(oElement, mAction.relevantContainer, sAggregationName, sModelName);
		let aBindingPaths = [];

		aRelevantElements.forEach(function(oElement) {
			aBindingPaths = aBindingPaths.concat(BindingsExtractor.getBindings({
				element: oElement,
				model: oModel,
				parent: oElement.getParent()
			}).map(vBindingToPath));
		});
		return aBindingPaths;
	}

	function getRepresentedPropertiesFromDelegate(mAction, sAggregationName) {
		const mPropertyBag = {
			element: mAction.relevantContainer,
			aggregationName: sAggregationName,
			payload: mAction.delegateInfo.payload || {}
		};
		return mAction.delegateInfo.delegate.getRepresentedProperties(mPropertyBag);
	}

	async function getRepresentedBindingPathsFromDelegateOrBinding(oElement, mAction, sModelName, sAggregationName) {
		const aRepresentedProperties = await getRepresentedPropertiesFromDelegate(mAction, sAggregationName);
		if (aRepresentedProperties === undefined) {
			// delegate skipped taking over => evaluate binding
			return getRepresentedBindingPathsFromBinding(oElement, mAction, sModelName, sAggregationName);
		}
		let aBindingPaths = [];
		aRepresentedProperties.forEach(function(oRepresentedProperty) {
			aBindingPaths = aBindingPaths.concat(oRepresentedProperty.bindingPaths);
		});
		return aBindingPaths;
	}

	function getRepresentedBindingPaths(oElement, mAction, sModelName, sAggregationName) {
		const bHasDelegateAndGetRepresentedProperties = !!ObjectPath.get("delegateInfo.delegate.getRepresentedProperties", mAction);

		if (bHasDelegateAndGetRepresentedProperties) {
			return getRepresentedBindingPathsFromDelegateOrBinding(oElement, mAction, sModelName, sAggregationName);
		}
		return getRepresentedBindingPathsFromBinding(oElement, mAction, sModelName, sAggregationName);
	}

	/**
	 * Enhance Invisible Element with extra data from model property or custom item
	 *
	 * @param {sap.ui.core.Element} oInvisibleElement - Invisible Element
	 * @param {object} mSomeItem - source of data enhancement process
	 */
	function enhanceInvisibleElement(oInvisibleElement, mSomeItem) {
		oInvisibleElement.__originalLabel = mSomeItem.label;
		oInvisibleElement.__tooltip = mSomeItem.tooltip;
		if (mSomeItem.entityTypeDisplayName) {
			oInvisibleElement.__entityTypeDisplayName = mSomeItem.entityTypeDisplayName;
		}

		// found element
		oInvisibleElement.__bindingPath = mSomeItem.name;

		// oInvisibleElement.__label has the current label retrieved before in the analysis
		if (oInvisibleElement.__label !== oInvisibleElement.__originalLabel) {
			oInvisibleElement.__renamedLabel = true;
		}
		if (mSomeItem.parentPropertyName) {
			oInvisibleElement.__parentPropertyName = mSomeItem.parentPropertyName;
		}
	}

	function getRepresentedBindingPathsFromDelegateIfAvailable(mAction, sAggregationName) {
		const bHasDelegateAndGetRepresentedProperties = !!ObjectPath.get("delegateInfo.delegate.getRepresentedProperties", mAction);

		if (bHasDelegateAndGetRepresentedProperties) {
			return getRepresentedPropertiesFromDelegate(mAction, sAggregationName);
		}
	}

	function getRepresentedBindingPathsOfInvisibleElement(oInvisibleElement, aRepresentedProperties) {
		let oRepresentedProperty;
		aRepresentedProperties.some(function(oProperty) {
			if (oProperty.id === oInvisibleElement.getId()) {
				oRepresentedProperty = oProperty;
				return true; // skip processing
			}
		});
		return oRepresentedProperty.bindingPaths || [];
	}

	/**
	 * Checks if this InvisibleProperty should be included in resulting list and adds information
	 * from models metadata to the InvisibleProperty if available.
	 * For "AddViaDelegate", if metadata is available and the element is not present in it, do not include it.
	 * Example use case: custom field which was hidden and then removed from system
	 * should not be available for reveal after the removal.
	 * For both "Reveal" and "AddViaDelegate", it must be checked if the field should be always hidden
	 * (e.g. via "UI Hidden" annotation)
	 *
	 * @param {sap.ui.core.Element} oInvisibleElement - Invisible Element
	 * @param {object[]} aProperties - Array of Fields
	 * @param {string[]} aBindingPaths - Map of all binding paths and binding context paths of the passed invisible element
	 * @param {boolean} bHasAddViaDelegate - If AddViaDelegate action is available
	 *
	 * @return {boolean} - whether this field should be included
	 */
	function checkAndEnhanceByModelProperty(oInvisibleElement, aProperties, aBindingPaths, bHasAddViaDelegate) {
		if (!hasBindings(aBindingPaths)) {
			// include it if the field has no bindings (bindings can be added in runtime)
			return true;
		}

		const mModelProperty = findModelProperty(aBindingPaths, aProperties);
		if (mModelProperty) {
			if (mModelProperty.hideFromReveal) {
				return false;
			}
			if (bHasAddViaDelegate) {
				enhanceInvisibleElement(oInvisibleElement, mModelProperty);
			}
			return true;
		}
		// if model property is not found, it depends if the hidden field is a removed custom field (AddViaDelegate case) or a standard field.
		return !bHasAddViaDelegate;
	}

	function enhanceByMetadata(oElement, sAggregationName, mInvisibleElement, mActions, aRepresentedProperties, aProperties) {
		const mAddViaDelegate = mActions.addViaDelegate;
		const sModelName = getModelName(mAddViaDelegate);
		const oModel = oElement.getModel(sModelName);
		let bIncludeElement = true;
		let aBindingPaths = [];
		const oInvisibleElement = mInvisibleElement.element;
		const iDepth = mInvisibleElement.action.depthOfRelevantBindings;

		if (aRepresentedProperties) {
			aBindingPaths = getRepresentedBindingPathsOfInvisibleElement(oInvisibleElement, aRepresentedProperties);
		// BCP: 1880498671
		} else if (getBindingContextPath(oElement, sAggregationName, sModelName) === getBindingContextPath(oInvisibleElement, sAggregationName, sModelName)) {
			aBindingPaths = BindingsExtractor.collectBindingPaths(oInvisibleElement, oModel, null, iDepth).bindingPaths;
		} else if (mAddViaDelegate && BindingsExtractor.getBindings({
			element: oInvisibleElement,
			model: oModel
		}).length > 0) {
			bIncludeElement = false;
		}

		if (bIncludeElement) {
			oInvisibleElement.__duplicateName = checkForDuplicateLabels(oInvisibleElement, aProperties);
			bIncludeElement = checkAndEnhanceByModelProperty(oInvisibleElement, aProperties, aBindingPaths, !!mAddViaDelegate);
		}
		return bIncludeElement;
	}

	function getModelName(mAddViaDelegate) {
		// ManagedObject jsdoc tells to use undefined for default model, therefore it
		// is necessary to return undefined if modelName or whole delegateInfo is missing
		return ObjectPath.get("delegateInfo.payload.modelName", mAddViaDelegate);
	}

	const oAnalyzer = {
		/**
		 * Filters available invisible elements whether they could be shown or not
		 *
		 * @param {sap.ui.core.Element} oElement - Container Element where to start search for a invisible
		 * @param {object} mActions - Container with actions
		 *
		 * @return {Promise} - returns a Promise which resolves with a list of hidden controls are available to display
		 */
		async enhanceInvisibleElements(oElement, mActions) {
			const mRevealData = mActions.reveal;
			const mAddViaDelegate = mActions.addViaDelegate;

			const oDefaultAggregation = oElement.getMetadata().getAggregation();
			const sAggregationName = oDefaultAggregation ? oDefaultAggregation.name : mActions.aggregation;

			const [aProperties, aRepresentedProperties] = await Promise.all([
				getAllPropertiesFromModels(oElement, sAggregationName, mActions),
				getRepresentedBindingPathsFromDelegateIfAvailable(mAddViaDelegate, sAggregationName)
			]);
			const aAllElementData = [];
			const aInvisibleElements = mRevealData.elements || [];

			aInvisibleElements.forEach(function(mInvisibleElement) {
				const oInvisibleElement = mInvisibleElement.element;
				const mRevealAction = mInvisibleElement.action;
				oInvisibleElement.__label = getLabel(oInvisibleElement, mRevealAction);

				const bIncludeElement = enhanceByMetadata(
					oElement, sAggregationName, mInvisibleElement, mActions, aRepresentedProperties, aProperties
				);

				if (bIncludeElement) {
					aAllElementData.push({
						element: oInvisibleElement,
						action: mRevealAction,
						sourceAggregation: mInvisibleElement.sourceAggregation
					});
				}
			});
			return aAllElementData.map(elementToAdditionalElementInfo);
		},

		/**
		 * Retrieves available properties from the delegate
		 *
		 * @param {sap.ui.core.Element} oElement - Source element for which delegate we're looking for additional properties
		 * @param {object} mAction - Action descriptor for add via delegate action
		 *
		 * @return {Promise} - returns a Promise which resolves with a list of available to display delegate properties
		 */
		async getUnrepresentedDelegateProperties(oElement, mAction) {
			const sModelName = getModelName(mAction);
			const oDefaultAggregation = oElement.getMetadata().getAggregation();
			const sAggregationName = oDefaultAggregation ? oDefaultAggregation.name : mAction.action.aggregation;
			const [aAllProperties, aRepresentedBindingPaths] = await Promise.all([
				getAllPropertiesFromAddViaDelegateAction(oElement, sAggregationName, mAction),
				getRepresentedBindingPaths(oElement, mAction, sModelName, sAggregationName)
			]);
			const fnFilter = mAction.action.filter ? mAction.action.filter : function() {return true;};

			let aUnrepresentedProperties = filterUnsupportedProperties(aAllProperties);
			aUnrepresentedProperties = aUnrepresentedProperties.filter(function(oModelProperty) {
				let bIsRepresented = false;
				if (aRepresentedBindingPaths) {
					bIsRepresented = aRepresentedBindingPaths.some(function(sBindingPath) {
						return sBindingPath === oModelProperty.bindingPath;
					});
				}
				return !bIsRepresented && fnFilter(mAction.relevantContainer, oModelProperty);
			});

			aUnrepresentedProperties = checkForDuplicateProperties(aUnrepresentedProperties);

			return aUnrepresentedProperties.map(oPropertyToAdditionalElementInfo);
		}
	};
	return oAnalyzer;
});
