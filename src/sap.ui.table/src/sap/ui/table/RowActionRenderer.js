/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.RowAction
sap.ui.define([
	"./library"
], function(
	library
) {
	"use strict";

	/**
	 * RowAction renderer.
	 * @namespace
	 */
	const RowActionRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.table.RowAction} oAction an object representation of the control that should be rendered
	 */
	RowActionRenderer.render = function(rm, oAction) {
		rm.openStart("div", oAction);
		rm.class("sapUiTableAction");

		if (!oAction.getRow()) {
			rm.style("display", "none");
		}

		if (!oAction.getVisible()) {
			rm.class("sapUiTableActionHidden");
		}

		const sTooltip = oAction.getTooltip_AsString();
		if (sTooltip) {
			rm.attr("title", sTooltip);
		}

		rm.openEnd();

		// special handling is needed for the navigation item
		const aItems = [];
		const aNavigationItems = [];
		oAction._getVisibleItems().forEach((oItem) => {
			oItem.getType() === library.RowActionType.Navigation ? aNavigationItems.push(oItem) : aItems.push(oItem);
		});

		if (oAction._getSize() >= aItems.length + aNavigationItems.length /*No overflow*/) {
			aItems.forEach((oItem) => {
				renderItem(rm, oItem);
			});

			aNavigationItems.forEach((oItem) => {
				renderItem(rm, oItem);
			});
		} else {
			const iItemsBeforeOverflow = Math.max(0, oAction._getSize() - aNavigationItems.length - 1);
			for (let i = 0; i < iItemsBeforeOverflow; i++) {
				renderItem(rm, aItems[i]);
			}

			const oIcon = oAction._getOverflowIcon(aItems, aNavigationItems, iItemsBeforeOverflow);
			rm.renderControl(oIcon);

			for (let i = 0; i < Math.min(aNavigationItems.length, oAction._getSize() - 1); i++) {
				renderItem(rm, aNavigationItems[i]);
			}
		}

		rm.close("div");
	};

	function renderItem(rm, oActionItem) {
		const oIcon = oActionItem._getIcon();
		oIcon.addStyleClass("sapUiTableActionIcon");

		rm.renderControl(oIcon);
	}

	return RowActionRenderer;

});