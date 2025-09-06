/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler"
], (
	Device,
	ResizeHandler
) => {
	"use strict";

	/**
	 * Enhances a FilterBar control prototype methods for properly handling layout changes in FilterBar controls.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.mixin.FilterBarLayoutMixin
	 * @namespace
	 * @since 1.141.0
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.comp
	 */

	return function(oConfig = {}) {
		this._isPhone = function() {
			return !!(Device.system.phone);
		};

		this._getUseToolbar = oConfig._getUseToolbar || function() {
			return false;
		};

		this._getAdvancedMode = oConfig._getAdvancedMode || function() {
			return false;
		};

		this._shouldRenderAdvancedLayout = oConfig._shouldRenderAdvancedLayout || function() {
			return false;
		};

		this._getFilterBarExpanded = oConfig._getFilterBarExpanded || function() {
			return true;
		};

		this._getFilterItems = oConfig._getFilterItems || function () {
			throw new Error("Method '_getFilterItems' is not implemented. Implementation should be provided by child classes.");
		};

		this._isFilterItemHidden = oConfig._isFilterItemHidden || function(oFilterItem) {
			return false;
		};

		this._shouldSkipRenderFilters = oConfig._shouldSkipRenderFilters || function() {
			return false;
		};

		this._shouldSkipRenderButtons = oConfig._shouldSkipRenderButtons || function() {
			return false;
		};

		this._getButtons = oConfig._getButtons || function() {
			throw new Error("Method '_getButtons' is not implemented. Implementation should be provided by child classes.");
		};

		this._onResize = oConfig._onResize || function () {
			this._onNonAdvancedModeResize();
		};

		this._onNonAdvancedModeResize = function () {
			const iItemsGap = 16,
				oFB = this.getDomRef(),
				oButtons = oFB?.querySelector(".sapUiMdcFilterBarLayoutButtons"),
				oBasicSearch = oFB?.querySelector(".sapUiMdcFilterBarLayoutBasicSearch"),
				aFilterItems = oFB?.querySelectorAll(".sapUiMdcFilterBarLayoutItem"),
				oFirstItem = aFilterItems?.length > 0 ? aFilterItems[0] : oBasicSearch,
				oLastItem = aFilterItems?.length > 0 ? aFilterItems[aFilterItems.length - 1] : oBasicSearch;

			if (!oFirstItem || !oLastItem || !oButtons || oFB?.offsetHeight === 0) {
				return;
			}

			const oFBDim = oFB.getBoundingClientRect(),
				oButtonsDim = oButtons.getBoundingClientRect(),
				oFirstItemDim = oFirstItem.getBoundingClientRect(),
				oLastItemDim = oLastItem.getBoundingClientRect();
			let sButtonStyle = "";
			if (oButtonsDim.x - iItemsGap >= oLastItemDim.x + oLastItemDim.width) {
				sButtonStyle = `margin-top: -${oLastItemDim.height}px`;
			}
			const iLeftPadding = parseInt(getComputedStyle(oFB).paddingLeft);
			const iRightPadding = parseInt(getComputedStyle(oFB).paddingRight);

			if (oFBDim.left + iLeftPadding === oFirstItemDim.left && oFBDim.right - iRightPadding === oFirstItemDim.right) {
				sButtonStyle = "";
			}
			oButtons.style = sButtonStyle;

			if (oFirstItemDim.y === oLastItemDim.y) {
				oFB.classList.add("sapUiMdcFilterBarLayoutOneLine");
			} else {
				oFB.classList.remove("sapUiMdcFilterBarLayoutOneLine");
			}
		};

		this._registerResizeHandlers = function () {
			const oButtonsArea = this.$("item-buttons").get(0);
			this._iResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));

			if (oButtonsArea) {
				this._iButtonsAreaResizeHandlerId = ResizeHandler.register(oButtonsArea, this._onResize.bind(this));
			}
		};

		this._deregisterResizeHandlers = function () {
			if (this._iResizeHandlerId) {
				ResizeHandler.deregister(this._iResizeHandlerId);
				this._iResizeHandlerId = null;
			}

			if (this._iButtonsAreaResizeHandlerId) {
				ResizeHandler.deregister(this._iButtonsAreaResizeHandlerId);
				this._iButtonsAreaResizeHandlerId = null;
			}
		};
	};
});
