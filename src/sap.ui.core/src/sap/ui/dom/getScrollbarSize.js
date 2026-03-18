/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	var _oScrollbarSize = {};

	/**
	 * Returns the size (width of the vertical / height of the horizontal) native browser scrollbars.
	 *
	 * This function must only be used when the DOM is ready.
	 *
	 * @function
	 * @since 1.58
	 * @param {string} [sClasses=null] The CSS class that should be added to the test element.
	 * @param {boolean} [bForce=false] Force recalculation of size (e.g. when CSS was changed). When no classes are passed all calculated sizes are reset.
	 * @returns {{width: number, height: number}} Object with properties <code>width</code> and <code>height</code> (the values are of type number and are pixels).
	 * @public
	 * @alias module:sap/ui/dom/getScrollbarSize
	 */
	var fnGetScrollbarSize = function(sClasses, bForce) {
		if (typeof sClasses === "boolean") {
			bForce = sClasses;
			sClasses = null;
		}

		var sKey = sClasses || "#DEFAULT"; // # is an invalid character for CSS classes

		if (bForce) {
			if (sClasses) {
				delete _oScrollbarSize[sClasses];
			} else {
				_oScrollbarSize = {};
			}
		}

		if (_oScrollbarSize[sKey]) {
			return _oScrollbarSize[sKey];
		}

		if (!document.body) {
			return {width: 0, height: 0};
		}

		// Create container element (hidden)
		var oArea = document.createElement("div");
		oArea.style.cssText = "visibility:hidden;height:0;width:0;overflow:hidden;";

		if (sClasses) {
			oArea.className = sClasses;
		}

		// Insert at beginning of body
		document.body.insertBefore(oArea, document.body.firstChild);

		// Create test element with forced scrollbars
		var oDummy = document.createElement("div");
		oDummy.style.cssText = "visibility:visible;position:absolute;height:100px;width:100px;overflow:scroll;opacity:0;";
		oArea.appendChild(oDummy);

		// Check if test element is actually visible/rendered
		var bIsVisible = oDummy.checkVisibility?.();

		// Calculate scrollbar size
		var iWidth = oDummy.offsetWidth - oDummy.scrollWidth;
		var iHeight = oDummy.offsetHeight - oDummy.scrollHeight;

		// Cleanup - remove test elements
		document.body.removeChild(oArea);

		// IMPORTANT: Check visibility FIRST
		// If element is not visible, measurements are unreliable (Firefox iframe bug)
		if (!bIsVisible) {
			// Don't cache - return uncached value to allow recalculation when visible
			return {width: iWidth, height: iHeight};
		}

		// Element is visible - measurement is reliable, always cache
		_oScrollbarSize[sKey] = {width: iWidth, height: iHeight};

		return _oScrollbarSize[sKey];
	};

	return fnGetScrollbarSize;

});