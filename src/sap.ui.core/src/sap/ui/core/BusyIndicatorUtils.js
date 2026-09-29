/*!
 * ${copyright}
 */

// Provides utility class sap.ui.core.BusyIndicatorUtils
sap.ui.define([
	'./BlockLayerUtils',
	"sap/ui/core/Lib",
	'sap/ui/core/library'], function(BlockLayerUtils, Library, coreLibrary) {
"use strict";

// Static class

/**
 * @alias sap.ui.core.BusyIndicatorUtils
 * @namespace
 * @private
 * @ui5-restricted sap.ui.core, sap.chart
 */
var BusyIndicatorUtils = function() {};

var BusyIndicatorSize = coreLibrary.BusyIndicatorSize;

/**
 * Returns the HTML content for the busy indicator
 * styling + animation: BusyIndicator.less
 *
 * @param {string} sSize either "Large", "Medium" or "Section". Other sizes will be mapped to "Medium"
 * @returns {Element} the element for the busy indicator
 * @private
 * @ui5-restricted sap.ui.core, sap.chart
 */
BusyIndicatorUtils.getElement = function(sSize) {
	var sSizeClass;

	switch (sSize) {
		case BusyIndicatorSize.Large:
			sSizeClass = "sapUiLocalBusyIndicatorSizeBig sapUiLocalBusyIndicatorShowContainer";
			break;
		case BusyIndicatorSize.Medium:
			sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
			break;
		case BusyIndicatorSize.Section:
			sSizeClass = "sapUiLocalBusyIndicatorSizeSection sapUiLocalBusyIndicatorShowContainer";
			break;
		default:
			//default size is medium
			sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
			break;
	}

	var oContainer = document.createElement("div");
	oContainer.className = "sapUiLocalBusyIndicator " + sSizeClass + " sapUiLocalBusyIndicatorFade";

	BusyIndicatorUtils.addAriaAttributes(oContainer);

	addAnimation(oContainer);

	return oContainer;
};

function addAnimation(oContainer, sSizeClass) {
	sSizeClass  = sSizeClass || "sapUiLocalBusyIndicatorAnimStandard";

	// determine automation size class
	var oAnimation = document.createElement("div");
	oAnimation.className = "sapUiLocalBusyIndicatorAnimation " + sSizeClass;
	oAnimation.appendChild(document.createElement("div"));
	oAnimation.appendChild(document.createElement("div"));
	oAnimation.appendChild(document.createElement("div"));


	oContainer.appendChild(oAnimation);
}

function handleAutoAnimationSize(oBusyBlockState, sSize) {
	var oParentDOM = oBusyBlockState.$parent.get(0),
		oBlockLayerDOM = oBusyBlockState.$blockLayer.get(0);

	// get animation container
	var oAnimation = oBlockLayerDOM.children[0],
		iWidth = oAnimation.offsetWidth;

	// We can only determine the actual animation after the browser has
	// calculated the size of the indicator we need to know the pixel-size of
	// 3rem, under which the indicator will animate differently
	if (oParentDOM.offsetWidth < iWidth) {
		oAnimation.className = "sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimSmall";
	}
}

/**
 * Adds the necessary ARIA attributes to the busy indicator and marks the busy region.
 *
 * The busy indicator element carries the <code>progressbar</code> semantics
 * (<code>role</code>, <code>aria-value*</code>, <code>aria-label</code>) and is made
 * focusable, while <code>aria-busy</code> is set on the busy region (the busy section or,
 * if none is defined, the control root).
 *
 * @param {object|HTMLDivElement} oBusyBlockState The block-state, or the standalone busy
 *        indicator container created by {@link sap.ui.core.BusyIndicatorUtils.getElement}
 * @private
 */
BusyIndicatorUtils.addAriaAttributes = function(oBusyBlockState) {
	const oResourceBundle = Library.getResourceBundleFor("sap.ui.core");
	let oIndicatorDom, oBusyRegionDom;

	if (oBusyBlockState instanceof HTMLDivElement) {
		// Standalone container from BusyIndicatorUtils.getElement: it is the indicator itself
		oIndicatorDom = oBusyBlockState;
	} else {
		oIndicatorDom = oBusyBlockState.$blockLayer.get(0);
		// aria-busy marks the busy region: the busy section if defined, otherwise the control root
		oBusyRegionDom = oBusyBlockState.control._sBusySection
			? oBusyBlockState.$parent.get(0)
			: oBusyBlockState.control.getDomRef();
	}

	if (oIndicatorDom) {
		// make the busy indicator focusable and expose it as an indeterminate progressbar
		oIndicatorDom.setAttribute("tabindex", "0");
		oIndicatorDom.setAttribute("role", "progressbar");
		oIndicatorDom.setAttribute("aria-label", oResourceBundle.getText("BUSY_VALUE_TEXT"));
		oIndicatorDom.setAttribute("aria-valuemin", "0");
		oIndicatorDom.setAttribute("aria-valuemax", "100");
		oIndicatorDom.setAttribute("aria-valuetext", oResourceBundle.getText("BUSY_TEXT"));
	}

	oBusyRegionDom?.setAttribute("aria-busy", "true");
};

/**
 * Removes the <code>aria-busy</code> marker added by {@link #addAriaAttributes} from the busy region.
 *
 * The progressbar ARIA attributes live on the busy indicator DOM, which is removed as a whole
 * on unblock, so only <code>aria-busy</code> on the busy region needs to be cleaned up here.
 *
 * @param {object} oBusyBlockState The block state
 * @private
 */
BusyIndicatorUtils.removeAriaAttributes = function(oBusyBlockState) {
	const oBusyRegionDom = oBusyBlockState.control._sBusySection
		? oBusyBlockState.$parent.get(0)
		: oBusyBlockState.control.getDomRef();

	oBusyRegionDom?.removeAttribute("aria-busy");
};

/**
 * Adds the DOM element for the BusyIndicator animation to the contained DOM element in the given block-state.
 * @param {object} oBusyBlockState The given block-state on which the DOM gets added for the busy animation
 * @param {sap.ui.core.BusyIndicatorSize} sSize either "Auto", "Large", "Medium" or "Small", determines the size of the
 *                     indicator, default is "Medium"
 * @see sap.ui.core.BusyIndicatorSize
 * @private
 */
BusyIndicatorUtils.addHTML = function (oBusyBlockState, sSize) {
	var sSizeClass, sAnimationSizeClass;

	switch (sSize) {
		case BusyIndicatorSize.Small:
			sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
			sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimSmall";
			break;
		case BusyIndicatorSize.Section:
			sSizeClass = "sapUiLocalBusyIndicatorSizeSection sapUiLocalBusyIndicatorShowContainer";
			sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard ";
			break;
		case BusyIndicatorSize.Large:
			sSizeClass = "sapUiLocalBusyIndicatorSizeBig sapUiLocalBusyIndicatorShowContainer";
			sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
			break;
		case BusyIndicatorSize.Auto:
			sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
			sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
			break;
		default:
			//default size is medium
			sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
			sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
			break;
	}

	if (!oBusyBlockState) {
		return;
	}

	var oParentDOM = oBusyBlockState.$parent.get(0),
		oBlockLayerDOM = oBusyBlockState.$blockLayer.get(0);

	// aria attributes
	BusyIndicatorUtils.addAriaAttributes(oBusyBlockState);

	oParentDOM.className += " sapUiLocalBusy";
	oBlockLayerDOM.className += " sapUiLocalBusyIndicator " + sSizeClass + " sapUiLocalBusyIndicatorFade";
	addAnimation(oBlockLayerDOM, sAnimationSizeClass);

	if (sSize === BusyIndicatorSize.Auto) {
		handleAutoAnimationSize(oBusyBlockState);
	}
};

return BusyIndicatorUtils;

});
