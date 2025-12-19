/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/isHidden",
	"./hasTabIndex" // provides jQuery.fn.hasTabIndex
], function(Device, jQuery, isHidden) {
	"use strict";
/**
	 * @type {WeakMap<Element, {bIsScrollable: boolean, scrollHeight: number, scrollWidth: number}>}
	 * @private
	 * A WeakMap to cache the scrollable state and dimensions of DOM elements.
	 * This helps to avoid expensive style recalculations.
	 */
	const mStyleCache = new WeakMap();

	/**
	 * Checks if a given DOM element is a scrollable container that should be focusable via keyboard.
	 * Excludes Safari because scroll containers are NOT focusable in Safari. Caches results for performance.
	 *
	 * @param {Element} oDomRef The DOM element to check.
	 * @returns {boolean} `true` if the element is a keyboard-focusable scroll container, otherwise `false`.
	 * @private
	 */
	function isScrollable(oDomRef) {
		// Don't make scroll containers focusable in Safari due to known issues
		if (Device.browser.safari) {
			return false;
		}

		// Check cache first to avoid performance hits
		if (mStyleCache.has(oDomRef)) {
			const oCached = mStyleCache.get(oDomRef);
			// Invalidate cache only if element dimensions have changed (both content and container size)
			if (oCached.scrollHeight === oDomRef.scrollHeight &&
				oCached.scrollWidth === oDomRef.scrollWidth &&
				oCached.clientHeight === oDomRef.clientHeight &&
				oCached.clientWidth === oDomRef.clientWidth) {
				return oCached.isScrollable;
			}
		}

		try {
			const oComputedStyle = getComputedStyle(oDomRef);

			if (!oComputedStyle) {
				return false;
			}

			const bHasHorizontalScroll = oDomRef.scrollWidth > oDomRef.clientWidth &&
				['scroll', 'auto'].includes(oComputedStyle.overflowX);

			const bHasVerticalScroll = oDomRef.scrollHeight > oDomRef.clientHeight &&
				['scroll', 'auto'].includes(oComputedStyle.overflowY);

			const bIsScrollable = bHasHorizontalScroll || bHasVerticalScroll;

			// Cache the result for subsequent checks
			mStyleCache.set(oDomRef, {
				isScrollable: bIsScrollable,
				scrollHeight: oDomRef.scrollHeight,
				scrollWidth: oDomRef.scrollWidth,
				clientHeight: oDomRef.clientHeight,
				clientWidth: oDomRef.clientWidth
			});

			return bIsScrollable;
		} catch (e) {
			// In case of an error (e.g., on a detached element), gracefully return false.
			return false;
		}
	}

	/**
	 * This module provides the following API:
	 * <ul>
	 * <li>{@link jQuery#firstFocusableDomRef}</li>
	 * <li>{@link jQuery#lastFocusableDomRef}</li>
	 * <ul>
	 * @namespace
	 * @name module:sap/ui/dom/jquery/Focusable
	 * @public
	 * @since 1.58
	 */

	/**
	 * Searches for a descendant of the given node that is an Element and focusable and visible.
	 *
	 * The search is executed 'depth first'.
	 *
	 * @param {Node} oContainer Node to search for a focusable descendant
	 * @param {boolean} bForward Whether to search forward (true) or backwards (false)
	 * @param {object} [mOptions] Options map
	 * @param {boolean} [mOptions.includeSelf=false] Whether to include the DOM node itself in the search
	 * @param {boolean} [mOptions.includeScroller=false] Whether to include keyboard focusable scrollers in the search.
	 *  See {@link https://developer.chrome.com/blog/keyboard-focusable-scrollers}
	 * @returns {Element|null} Element node that is focusable and visible or null
	 * @private
	 */
	function findFocusableDomRef(oContainer, bForward, mOptions) {
		let oChild,
			oFocusableDescendant;

		const bIncludeSelf = !!mOptions?.includeSelf,
			bIncludeScroller = !!mOptions?.includeScroller;

		if (bIncludeSelf) {
			oChild = oContainer;
		} else {
			oChild = bForward ? oContainer.firstChild : oContainer.lastChild;
		}

		while (oChild) {
			if (oChild.nodeType == 1 && !isHidden(oChild)) {
				if (jQuery(oChild).hasTabIndex()) {
					return oChild;
				}

				oFocusableDescendant = findFocusableDomRef(oChild, bForward, {
					includeScroller: bIncludeScroller
				});

				// check if it is a keyboard focusable scroll container
				if (bIncludeScroller && !oFocusableDescendant && isScrollable(oChild)) {
					return oChild;
				}

				if (oFocusableDescendant) {
					return oFocusableDescendant;
				}
			}

			if (bIncludeSelf) {
				break;
			}

			oChild = bForward ? oChild.nextSibling : oChild.previousSibling;
		}

		return null;
	}

	/**
	 * Returns the first focusable domRef in a given container (the first element of the collection)
	 *
	 * @return {Element} The domRef
	 * @public
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @param {object} [mOptions] Options map
	 * @param {boolean} [mOptions.includeSelf=false] Whether to include the DOM node itself in the search
	 * @param {boolean} [mOptions.includeScroller=false] Whether to include keyboard focusable scrollers in the search.
	 *  See {@link https://developer.chrome.com/blog/keyboard-focusable-scrollers}
	 * @name jQuery#firstFocusableDomRef
	 * @requires module:sap/ui/dom/jquery/Focusable
	 */
	jQuery.fn.firstFocusableDomRef = function(mOptions) {
		var oContainerDomRef = this.get(0);

		if ( !oContainerDomRef || isHidden(oContainerDomRef) ) {
			return null;
		}

		return findFocusableDomRef(oContainerDomRef, /* search forward */ true, mOptions);
	};

	/**
	 * Returns the last focusable domRef in a given container
	 *
	 * @return {Element} The last domRef
	 * @public
	 * @name jQuery#lastFocusableDomRef
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @param {object} [mOptions] Options map
	 * @param {boolean} [mOptions.includeSelf=false] Whether to include the DOM node itself in the search
	 * @param {boolean} [mOptions.includeScroller=false] Whether to include keyboard focusable scrollers in the search.
	 *  See {@link https://developer.chrome.com/blog/keyboard-focusable-scrollers}
	 * @requires module:sap/ui/dom/jquery/Focusable
	 */
	jQuery.fn.lastFocusableDomRef = function(mOptions) {
		var oContainerDomRef = this.get(0);

		if (!oContainerDomRef || isHidden(oContainerDomRef)) {
			return null;
		}

		return findFocusableDomRef(oContainerDomRef, /* search backwards */ false, mOptions);
	};

	return jQuery;

});

