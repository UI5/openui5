/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Renderer',
	"sap/ui/util/defaultLinkTypes",
	'sap/m/MenuItemRenderer',
	'sap/tnt/NavigationListItem',
	"sap/ui/core/Lib"
], function(
	Renderer,
	defaultLinkTypes,
	MenuItemRenderer,
	NavigationListItem,
	Lib
) {
	"use strict";

	/**
	 * NavigationListMenuItemRenderer renderer.
	 * @namespace
	 */
	const NavigationListMenuItemRenderer = Renderer.extend(MenuItemRenderer);
	NavigationListMenuItemRenderer.apiVersion = 2;

	NavigationListMenuItemRenderer.render = function(oRm, oItem) {
		const bHasSubmenu = !!oItem._getVisibleItems().length;
		const bIsExternalLink = oItem.getHref() && oItem.getTarget() === "_blank";

		oRm.openStart("li", oItem);

		if (oItem.getHref()) {
			oRm.class("sapTntNavMenuItemExternalLink");
		}

		// HTML attributes
		this.renderAttributes(oRm, oItem);
		// CSS classes
		this.renderStyleClasses(oRm, oItem);
		// Inline styles
		this.renderInlineStyles(oRm, oItem);
		// Add ARIA attributes
		this.setAccessibilityAttributes(oRm, oItem);

		// ARIA attributes for the item
		if (oItem?._navItem?.getSelectable() && bHasSubmenu) {
			oRm.attr("aria-description", Lib.getResourceBundleFor("sap.tnt").getText("NAVIGATION_LIST_DUAL_CLICK_MENU_ITEM_DESCRIPTION"));
		}
		oRm.openEnd();

		// External link "a" tag
		if (oItem.getHref()) {
			this._renderLinkTag(oRm, oItem);
		}

		// Icon column
		this.renderIcon(oRm, oItem);
		// Text column
		this.renderText(oRm, oItem);

		if (bHasSubmenu) {
			// Submenu arrow column
			this.renderSubmenuArrow(oRm, oItem);
		} else {
			// Shortcut column
			this.renderShortcut(oRm, oItem);
			// End content column
			this.renderEndContent(oRm, oItem);
			// Selection mark column
			this.renderSelectionMark(oRm, oItem);
		}

		// External link icon
		if (bIsExternalLink) {
			const oIcon = oItem._getExternalLinkIcon();
			oRm.renderControl(oIcon);
		}

		// End of external link "a" tag
		if (oItem.getHref()) {
			oRm.close("a");
		}

		oRm.close("li");
	};


	/**
	 * Renders opening tag of anchor element.
	 *
	 * @param {sap.ui.core.RenderManager} oRm renderer instance
	 * @private
	 */
	NavigationListMenuItemRenderer._renderLinkTag = function (oRm, oItem) {
		const sHref = oItem.getHref(),
			sTarget = oItem.getTarget();

		oRm.openStart("a", `${oItem.getId()}-a`);

		const sTooltip = oItem.getTooltip_AsString() || oItem.getText();

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (sHref) {
			oRm.attr("href", sHref);
		}

		if (sTarget) {
			oRm.attr("target", sTarget)
				.attr("rel", defaultLinkTypes("", sTarget));
		}

		if (sHref && sTarget === "_blank") {
			const oInvisibleText = NavigationListItem._getInvisibleText();
			oRm.attr("aria-describedby", oInvisibleText.getId());
		}

		oRm.openEnd();
	};

	return NavigationListMenuItemRenderer;
});
