/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.ElementUtil.
sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/ui/base/Object",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/core/UIArea",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/Util"
], function(
	isPlainObject,
	BaseObject,
	Component,
	Element,
	UIArea,
	DOMUtil,
	Util
) {
	"use strict";

	/**
	 * Utility functionality to work with UI5 elements, e.g. iterate through aggregations, find parents, ...
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.ElementUtil
	 */

	const ElementUtil = {};

	ElementUtil.iterateOverAllPublicAggregations = function(oElement, fnCallback) {
		const mAggregations = oElement.getMetadata().getAllAggregations();
		const aAggregationNames = Object.keys(mAggregations);

		aAggregationNames.forEach(function(sAggregationName) {
			const oAggregation = mAggregations[sAggregationName];
			const vAggregationValue = ElementUtil.getAggregation(oElement, sAggregationName);

			fnCallback(oAggregation, vAggregationValue);
		});
	};

	ElementUtil.getElementInstance = function(vElement) {
		if (typeof vElement === "string") {
			const oElement = Element.getElementById(vElement);
			return oElement || Component.getComponentById(vElement);
		}
		return vElement;
	};

	ElementUtil.hasAncestor = function(oElement, oAncestor) {
		oAncestor = ElementUtil.fixComponentContainerElement(oAncestor);
		let oFixedParent;

		while (oElement && oElement !== oAncestor) {
			oFixedParent = ElementUtil.fixComponentParent(oElement);
			// fixComponentParent already returns the parent
			if (oElement === oFixedParent) {
				oElement = oElement.getParent();
			} else {
				oElement = oFixedParent;
			}
		}

		return !!oElement;
	};

	ElementUtil.getClosestElementForNode = function(oNode) {
		const oClosestElement = oNode.closest("[data-sap-ui]");
		return oClosestElement ? Element.getElementById(oClosestElement.getAttribute("data-sap-ui")) : undefined;
	};

	ElementUtil.fixComponentParent = function(oElement) {
		if (BaseObject.isObjectA(oElement, "sap.ui.core.UIComponent")) {
			const oComponentContainer = oElement.oContainer;
			if (oComponentContainer) {
				return oComponentContainer.getParent();
			}
		} else {
			return oElement;
		}
	};

	ElementUtil.fixComponentContainerElement = function(oElement) {
		if (BaseObject.isObjectA(oElement, "sap.ui.core.ComponentContainer")) {
			// This happens when the compontentContainer has not been rendered yet
			if (!oElement.getComponentInstance()) {
				return undefined;
			}
			return oElement.getComponentInstance().getRootControl();
		}
		return oElement;
	};

	ElementUtil.getDomRef = function(oElement) {
		if (oElement) {
			let oDomRef;
			if (oElement.getDomRef) {
				oDomRef = oElement.getDomRef();
			}
			if (!oDomRef && oElement.getRenderedDomRef) {
				oDomRef = oElement.getRenderedDomRef();
			}
			return oDomRef;
		}
	};

	ElementUtil.findAllSiblingsInContainer = function(oElement, oContainer) {
		const oParent = oElement && oElement.getParent();
		if (!oParent) {
			return [];
		}

		if (oParent !== oContainer) {
			const aParents = ElementUtil.findAllSiblingsInContainer(oParent, oContainer);
			return aParents.map((oParentElement) => {
				return ElementUtil.getAggregation(oParentElement, oElement.sParentAggregationName);
			}).flat();
		}

		return ElementUtil.getAggregation(oParent, oElement.sParentAggregationName);
	};

	ElementUtil.getAggregationAccessors = function(oElement, sAggregationName) {
		const oMetadata = oElement.getMetadata();
		oMetadata.getJSONKeys();
		const oAggregationMetadata = oMetadata.getAggregation(sAggregationName);
		if (oAggregationMetadata) {
			let sGetter = oAggregationMetadata._sGetter;

			// altType getter returns not element (TODO: clarify if getAggregationNameControl getter is a convention)
			if (oAggregationMetadata.altTypes && oAggregationMetadata.altTypes.length
					&& oElement[`${oAggregationMetadata._sGetter}Control`]) {
				sGetter = `${oAggregationMetadata._sGetter}Control`;
			}

			return {
				get: sGetter,
				add: oAggregationMetadata._sMutator,
				remove: oAggregationMetadata._sRemoveMutator,
				insert: oAggregationMetadata._sInsertMutator,
				removeAll: oAggregationMetadata._sRemoveAllMutator
			};
		}
		return {};
	};

	ElementUtil.getAggregation = function(oElement, sAggregationName) {
		let oValue;

		const sGetter = ElementUtil.getAggregationAccessors(oElement, sAggregationName).get;
		if (sGetter) {
			oValue = oElement[sGetter]();
		} else {
			oValue = oElement.getAggregation(sAggregationName);
		}
		// ATTENTION:
		// under some unknown circumstances the return oValue looks like an Array but Array.isArray() returned
		// undefined => false
		// that is why we use array ducktyping with a null check!
		// reproducible with Windows and Chrome (currently 35), when creating a project and opening WYSIWYG editor
		// afterwards on any file
		// sap.m.Panel.prototype.getHeaderToolbar() returns a single object but an array
		/* eslint-disable no-nested-ternary */
		oValue = oValue && oValue.splice ? oValue : (oValue ? [oValue] : []);
		/* eslint-enable no-nested-ternary */
		return oValue;
	};

	ElementUtil.getIndexInAggregation = function(oElement, oParent, sAggregationName) {
		return ElementUtil.getAggregation(oParent, sAggregationName).indexOf(oElement);
	};

	ElementUtil.addAggregation = function(oParent, sAggregationName, oElement) {
		if (ElementUtil.hasAncestor(oParent, oElement)) {
			throw new Error("Trying to add an element to itself or its successors");
		}
		const sAggregationAddMutator = ElementUtil.getAggregationAccessors(oParent, sAggregationName).add;
		if (sAggregationAddMutator) {
			oParent[sAggregationAddMutator](oElement);
		} else {
			oParent.addAggregation(sAggregationName, oElement);
		}
	};

	ElementUtil.removeAggregation = function(oParent, sAggregationName, oElement, bSuppressInvalidate) {
		const sAggregationRemoveMutator = ElementUtil.getAggregationAccessors(oParent, sAggregationName).remove;
		if (sAggregationRemoveMutator) {
			oParent[sAggregationRemoveMutator](oElement, bSuppressInvalidate);
		} else {
			oParent.removeAggregation(sAggregationName, oElement, bSuppressInvalidate);
		}
	};

	ElementUtil.insertAggregation = function(oParent, sAggregationName, oElement, iIndex) {
		if (ElementUtil.hasAncestor(oParent, oElement)) {
			throw new Error("Trying to add an element to itself or its successors");
		}
		if (ElementUtil.getIndexInAggregation(oElement, oParent, sAggregationName) !== -1) {
			// ManagedObject.insertAggregation won't reposition element, if it's already inside of same aggregation
			// therefore we need to remove the element and then insert it again. To prevent ManagedObjectObserver from
			// firing
			// setParent event with parent null, private flag is set.
			oElement.__bSapUiDtSupressParentChangeEvent = true;
			try {
				ElementUtil.removeAggregation(oParent, sAggregationName, oElement, true);
			} finally {
				delete oElement.__bSapUiDtSupressParentChangeEvent;
			}
		}
		const sAggregationInsertMutator = ElementUtil.getAggregationAccessors(oParent, sAggregationName).insert;
		if (sAggregationInsertMutator) {
			oParent[sAggregationInsertMutator](oElement, iIndex);
		} else {
			oParent.insertAggregation(sAggregationName, oElement, iIndex);
		}
	};

	ElementUtil.isValidForAggregation = function(oParent, sAggregationName, oElement) {
		const oAggregationMetadata = oParent.getMetadata().getAggregation(sAggregationName);

		// Make sure that the parent is not inside of the element, or is not the element itself,
		// e.g. insert a layout inside it's content aggregation.
		// This check needed as UI5 will have a maximum call stack error otherwise.
		if (ElementUtil.hasAncestor(oParent, oElement)) {
			return false;
		}

		// only for public aggregations
		if (oAggregationMetadata) {
			// TODO : test altTypes
			const sTypeOrInterface = oAggregationMetadata.type;

			// if aggregation is not multiple and already has element inside, then it is not valid for element
			if (oAggregationMetadata.multiple === false && ElementUtil.getAggregation(oParent, sAggregationName) &&
					ElementUtil.getAggregation(oParent, sAggregationName).length > 0) {
				return false;
			}
			return BaseObject.isObjectA(oElement, sTypeOrInterface) || ElementUtil.hasInterface(oElement, sTypeOrInterface);
		}
	};

	ElementUtil.getAssociationAccessors = function(oElement, sAggregationName) {
		const oMetadata = oElement.getMetadata();
		oMetadata.getJSONKeys();
		const oAssociationMetadata = oMetadata.getAssociation(sAggregationName);
		if (oAssociationMetadata) {
			return {
				get: oAssociationMetadata._sGetter,
				add: oAssociationMetadata._sMutator,
				remove: oAssociationMetadata._sRemoveMutator,
				insert: oAssociationMetadata._sInsertMutator,
				removeAll: oAssociationMetadata._sRemoveAllMutator
			};
		}
		return {};
	};

	ElementUtil.getAssociation = function(oElement, sAssociationName) {
		let oValue;
		const sGetter = ElementUtil.getAssociationAccessors(oElement, sAssociationName).get;
		if (sGetter) {
			oValue = oElement[sGetter]();
		}
		return oValue;
	};

	ElementUtil.getIndexInAssociation = function(oElement, oParent, sAssociationName) {
		return ElementUtil.getAssociationInstances(oParent, sAssociationName).indexOf(oElement);
	};

	ElementUtil.getAssociationInstances = function(oElement, sAssociationName) {
		const vValue = Util.castArray(ElementUtil.getAssociation(oElement, sAssociationName));
		return vValue
		.map(function(sId) {
			return ElementUtil.getElementInstance(sId);
		});
	};

	ElementUtil.hasInterface = function(oElement, sInterface) {
		const aInterfaces = oElement.getMetadata().getInterfaces();
		return aInterfaces.indexOf(sInterface) !== -1;
	};

	/**
	 * Checks whether specified Element is in a binding template, if so it checks if template has a valid control representation.
	 *
	 * @param {sap.ui.base.Object} oObject - Object for validation
	 * @param {object} [oMoveInformation] - Information about the source parent, needed for correct template id extraction in move scenarios
	 * @returns {boolean} <code>true</code> if object is not in bound aggregation or has a valid template representation
	 */
	ElementUtil.isElementInTemplate = function(oObject, oMoveInformation) {
		const mLocationInTemplate = ElementUtil.getAggregationInformation(oObject, oMoveInformation);

		if (mLocationInTemplate.templateId) {
			const sTemplateId = ElementUtil.extractTemplateId(mLocationInTemplate);

			if (!sTemplateId) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Checks whether specified Element is a direct template clone (e.g. the list items of a sap.m.ListItem)
	 *
	 * @param {sap.ui.base.Object} oObject - Object for validation
	 * @returns {boolean} <code>true</code> if object is a direct clone of the template
	 */
	 ElementUtil.isElementDirectTemplateChild = function(oObject) {
		const mLocationInTemplate = ElementUtil.getAggregationInformation(oObject);

		if (mLocationInTemplate.templateId) {
			const sTemplateId = ElementUtil.extractTemplateId(mLocationInTemplate);

			// If the stack only has one element, this element is a direct child of the template aggregation
			if (sTemplateId && mLocationInTemplate.stack.length === 1) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Checks whether specified Element is a valid ManagedObject. The allowed objects must be
	 * descendants of sap.ui.core.Element or sap.ui.core.Component classes.
	 *
	 * @param {sap.ui.base.Object} oObject - Object for validation
	 * @param {object} [oMoveInformation] - Information about the source parent, needed for correct template id extraction in move scenarios
	 * @returns {boolean} <code>true</code> if object is supported
	 */
	ElementUtil.isElementValid = function(oObject, oMoveInformation) {
		const bValid = (
			(
				oObject instanceof Element
				|| oObject instanceof Component
			)
			&& !oObject.bIsDestroyed
			&& ElementUtil.isElementInTemplate(oObject, oMoveInformation)
		);

		return bValid;
	};

	/**
	 * Extract potential label part from the passed managed object instance
	 *
	 * @param {sap.ui.base.ManagedObject} oElement - managed object class instance for which label has to be extracted
	 * @param {function} [fnFunction] - custom function for retrieving label
	 * @return {string|undefined} label string or undefined when no label can be extracted
	 */
	ElementUtil.getLabelForElement = function(oElement, fnFunction) {
		if (!ElementUtil.isElementValid(oElement)) {
			throw Util.createError("ElementUtil#getLabelForElement", "A valid managed object instance should be passed as parameter", "sap.ui.dt");
		}
		// if there is a function, only the function is executed
		if (typeof fnFunction === "function") {
			return fnFunction(oElement);
		}

		function calculateLabel(oElement) {
			const vFieldLabel = (
				typeof oElement.getText === "function" && oElement.getText()
				|| typeof oElement.getLabelText === "function" && oElement.getLabelText()
				|| typeof oElement.getLabel === "function" && oElement.getLabel()
				|| typeof oElement.getTitle === "function" && oElement.getTitle()
				|| typeof oElement.getHeading === "function" && oElement.getHeading()
				|| typeof oElement.getDataSourceLabel === "function" && oElement.getDataSourceLabel()
				|| typeof oElement.getHeaderText === "function" && oElement.getHeaderText()
			);

			if (ElementUtil.isElementValid(vFieldLabel)) {
				return calculateLabel(vFieldLabel);
			}
			return vFieldLabel;
		}

		const vCalculatedLabel = calculateLabel(oElement);
		return typeof vCalculatedLabel !== "string" ? oElement.getId() : vCalculatedLabel;
	};

	/**
	 * Returns for a given element the corresponding element id of the element inside of a binding template
	 * This function uses the information gathered in the output of ElementUtil.getAggregationInformation
	 * The check is done recursively
	 * @param  {sap.ui.dt.OverlayUtil.AggregationBindingStack}  mBoundControl {@link sap.ui.dt.ElementUtil.AggregationBindingStack}
	 * @return {string}                                         Returns the element id of the corresponding element inside of a template
	 */
	ElementUtil.extractTemplateId = function(mBoundControl) {
		if (isPlainObject(mBoundControl) && mBoundControl.templateId) {
			if (mBoundControl.stack.length > 1) {
				let oResultControl;
				let oAggregatedControl = Element.getElementById(mBoundControl.templateId);
				let sAggregation;
				let iIndex;
				for (let i = mBoundControl.stack.length - 2; i >= 0; i--) {
					sAggregation = mBoundControl.stack[i].aggregation;
					iIndex = mBoundControl.stack[i].index;
					oResultControl = ElementUtil.getAggregation(oAggregatedControl, sAggregation)[iIndex];
					if (!oResultControl) {
						return undefined;
					}
					oAggregatedControl = oResultControl;
				}
				return oAggregatedControl.getId();
			} else if (mBoundControl.stack.length === 1) {
				return mBoundControl.templateId;
			}
		} else {
			return undefined;
		}
	};

	/**
	 * The AggregationBindingStack contains element id and aggregation name of the bound control together with a stack containing
	 * information about the traversed elements for an Overlay which is part of an aggregation binding.
	 * @typedef {object} sap.ui.dt.ElementUtil.AggregationBindingStack
	 * @property {string} elementId - id of the bound control.
	 * @property {string} aggregation - name of the bound aggregation.
	 * @property {string} templateId - id of the binding template.
	 * @property {Object[]} stack - array of objects containing element, element type, aggregation name and index of the element in
	 *                              the aggregation for each traversed aggregation.
	 * @property {string} stack.element - element id
	 * @property {string} stack.type - element type
	 * @property {string} stack.aggregation - aggregation name
	 * @property {number} stack.index - index of the element in parent aggregation
	 */

	/**
	 * Returns the element ID and the aggregation name of the bound control for an element which is part of an aggregation binding.
	 * The check is done recursively.
	 * @param {sap.ui.core.Element} oElement - Element being checked
	 * @param {object} [oMoveInformation] - Information about the source parent, needed for correct template id extraction in move scenarios
	 * @return {AggregationBindingStack} {@link sap.ui.dt.ElementUtil.AggregationBindingStack} object
	 */
	ElementUtil.getAggregationInformation = function(oElement, oMoveInformation) {
		const aStack = [];
		const oResult = ElementUtil._evaluateBinding(oElement, aStack);

		// oResult is based on the current state of the UI, which means in move scenarios the element instance was already moved
		// in case of move inside a template, the template is not yet updated and we have to adjust the parent information
		// based on the move information which is saved before the move is executed
		if (oMoveInformation) {
			const iIndexOfParent = ElementUtil.getIndexInAggregation(
				oMoveInformation.sourceParentInstance,
				oMoveInformation.sourceParentInstance.getParent(),
				oMoveInformation.sourceParentInstance.sParentAggregationName
			);
			oResult.stack[1].index = iIndexOfParent;
			oResult.stack[1].element = oMoveInformation.sourceParentInstance.getId();
		}
		return oResult;
	};

	ElementUtil._evaluateBinding = function(oElement, aStack) {
		let sAggregationName;
		let iIndex;
		let oParent;
		let bBindingFound;

		// If the binding is found on an API parent (with a forwarded aggregation),
		// the templateId is directly retrieved from it (the stack only has the element itself)
		const { aAPIParentInfos } = oElement;
		if (aAPIParentInfos && aAPIParentInfos.length > 0) {
			bBindingFound = aAPIParentInfos.some(function(mParentInfo) {
				oParent = mParentInfo.parent;
				sAggregationName = mParentInfo.aggregationName;
				iIndex = ElementUtil.getAggregation(oParent, sAggregationName).indexOf(oElement);
				return oParent.getBinding(sAggregationName);
			});
		}
		if (!bBindingFound) {
			oParent = oElement.getParent();
			if (oParent) {
				sAggregationName = oElement.sParentAggregationName;
				iIndex = ElementUtil.getAggregation(oParent, sAggregationName).indexOf(oElement);
			} else {
				iIndex = -1;
			}
		}

		aStack.push({
			element: oElement.getId(),
			type: oElement.getMetadata().getName(),
			aggregation: sAggregationName,
			index: iIndex
		});

		// the parent might not be available yet
		if (sAggregationName && oParent?.getBinding(sAggregationName)) {
			const oBinding = oParent.getBindingInfo(sAggregationName);
			const oTemplate = oBinding && oBinding.template;

			return {
				elementId: oParent.getId(),
				aggregation: sAggregationName,
				templateId: oTemplate ? oTemplate.getId() : undefined,
				stack: aStack
			};
		}

		return !oParent || oParent instanceof UIArea
			? {
				elementId: undefined,
				aggregation: undefined,
				templateId: undefined,
				stack: aStack
			}
			: (
				ElementUtil._evaluateBinding(
					oParent,
					aStack
				)
			);
	};

	/**
	 * Getter for binding template if available.
	 * @param {sap.ui.base.ManagedObject} oElement - Element to be checked for binding info with template attached
	 * @param {string} sAggregationName - Aggregation name required to check binding info for this one aggregation
	 * @returns {sap.ui.base.ManagedObject} Aggregation binding template for the given element and aggregation name
	 */
	ElementUtil.getAggregationBindingTemplate = function(oElement, sAggregationName) {
		const oBinding = oElement && oElement.getBindingInfo(sAggregationName);
		return oBinding && oBinding.template;
	};

	/**
	 * Decrements passed index value by 1, if the source and target overlays for move belong to the same container and source index is less than the target index.
	 * To compensate the fact that the lower source index is also removed during move.
	 * @param {object} oSourceContainer - Source container
	 * @param {object} oTargetContainer - Target container
	 * @param {int} iSourceIndex - Source index
	 * @param {int} iTargetIndex - Target index
	 * @returns {int} - Index for move
	 */
	ElementUtil.adjustIndexForMove = function(oSourceContainer, oTargetContainer, iSourceIndex, iTargetIndex) {
		if (oSourceContainer === oTargetContainer && iSourceIndex < iTargetIndex && iSourceIndex > -1) {
			return iTargetIndex - 1;
		}
		return iTargetIndex;
	};

	/**
	 * Checks if an aggregation is valid for an element being moved
	 *
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay - Aggregation overlay to be checked for target zone
	 * @param {sap.ui.dt.ElementOverlay} oMovedOverlay - Overlay being moved
	 * @param {boolean} bOverlayNotInDom - Flag defining if overlay is not in DOM
	 * @returns {Promise.<boolean>} Resolved promise with <code>true</code> if the aggregation overlay is a valid target zone for the overlay
	 */
	 ElementUtil.checkTargetZone = function(oAggregationOverlay, oMovedOverlay, bOverlayNotInDom) {
		const oGeometry = oAggregationOverlay.getGeometry();
		const bGeometryVisible = oGeometry && oGeometry.size.height > 0 && oGeometry.size.width > 0;
		const oParentElement = oAggregationOverlay.getElement();

		const oMovedElement = oMovedOverlay.getElement();
		const sAggregationName = oAggregationOverlay.getAggregationName();
		if (!oMovedElement || !ElementUtil.isValidForAggregation(oParentElement, sAggregationName, oMovedElement)) {
			return Promise.resolve(false);
		}

		// checks related to visibility
		function fnCheckAggregationOverlayVisibility(oAggregationOverlay, oParentElement) {
			// this function can get called on overlay registration, when there are no overlays in dom yet. In this case, DOMUtil.isVisible is always false.
			const oAggregationOverlayDomRef = oAggregationOverlay.getDomRef();
			const bAggregationOverlayVisibility = DOMUtil.isVisible(oAggregationOverlayDomRef);

			// if there is no aggregation overlay domRef available the further check for domRef of the corresponding element is not required
			if (!oAggregationOverlayDomRef) {
				return bAggregationOverlayVisibility;
			}
			// additional check for corresponding element DomRef visibiltiy required for target zone checks during navigation mode.
			// during navigation mode the domRef of valid overlays is given and the offsetWidth is 0. Therefor we need to check the visibility of the corresponding element additionally
			const oParentElementDomRef = oParentElement && oParentElement.getDomRef && oParentElement.getDomRef();
			const bAggregationElementVisibility = oParentElementDomRef ? DOMUtil.isVisible(oParentElementDomRef) : true;
			return bAggregationOverlayVisibility || bAggregationElementVisibility;
		}

		if (
			(bOverlayNotInDom && !bGeometryVisible)
			|| !bOverlayNotInDom && !fnCheckAggregationOverlayVisibility(oAggregationOverlay, oParentElement)
			|| !(oParentElement && oParentElement.getVisible && oParentElement.getVisible())
			// an aggregation can still have visible = true even if it has been removed from its parent
			|| !oParentElement.getParent()
		) {
			return Promise.resolve(false);
		}

		return Promise.resolve(true);
	};

	return ElementUtil;
});