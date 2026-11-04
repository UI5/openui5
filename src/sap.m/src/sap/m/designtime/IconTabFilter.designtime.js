/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.IconTabBar control
sap.ui.define([
	"sap/base/i18n/Localization"
],
	function (Localization) {
		"use strict";

		// The flush first/last tab of an IconTabHeader drops its outer padding
		// (see IconTabBar.less), while middle tabs keep 1rem (16px) on each side.
		// Grow the overlay outward by the same amount on the flush edge so the RTA
		// selection border keeps identical breathing room to the tab content and is
		// not drawn flush against it.
		const OUTSET_PX = 16;

		return {
			palette: {
				group: "CONTAINER",
				icons: {
					svg: "sap/m/designtime/IconTabFilter.icon.svg"
				}
			},
			overlayOutsets: function (oControl) {
				const oDomRef = oControl.getDomRef();
				const oParent = oDomRef && oDomRef.parentElement;
				if (!oParent) {
					return undefined;
				}
				// Only consider the visible tabs: the overflow / "More" expand button
				// uses a different class and hidden tabs render with no width.
				const aVisibleTabs = Array.prototype.filter.call(oParent.children, function (oNode) {
					return oNode.classList.contains("sapMITBFilter")
						&& !oNode.classList.contains("sapMITBFilterHidden")
						&& oNode.offsetWidth > 0;
				});
				if (aVisibleTabs.length === 0) {
					return undefined;
				}
				const bFirst = aVisibleTabs[0] === oDomRef;
				const bLast = aVisibleTabs[aVisibleTabs.length - 1] === oDomRef;
				if (!bFirst && !bLast) {
					return undefined;
				}
				const bRTL = Localization.getRTL();
				const mOutset = {};
				if (bFirst) {
					mOutset[bRTL ? "right" : "left"] = OUTSET_PX;
				}
				if (bLast) {
					mOutset[bRTL ? "left" : "right"] = OUTSET_PX;
				}
				return mOutset;
			},
			actions: {
				rename: function () {
					return {
						changeType: "rename",
						domRef: function (oControl) {
							return oControl.$().find(".sapMITBText")[0];
						}
					};
				}
			},
			aggregations: {
				content: {
					propagateMetadata: function (oControl) {
						if (oControl.getParent()?.isA("sap.m.IconTabFilter")) {
							return {
								actions: {
									remove: null,
									reveal: null
								}
							};
						}

						return undefined;
					}
				}
			}
		};

	});