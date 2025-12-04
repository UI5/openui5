/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.table.HeaderSelector
sap.ui.define([
	"./utils/TableUtils"
], function(
	TableUtils
) {
	"use strict";

	/**
	 * HeaderSelector renderer.
	 * @namespace
	 */
	const HeaderSelectorRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.HeaderSelector} oHeaderSelector HeaderSelector to be rendered
	 */
	HeaderSelectorRenderer.render = function(rm, oHeaderSelector) {
		const sType = oHeaderSelector.getType();
		const bVisible = oHeaderSelector.getVisible();
		let sTooltip = oHeaderSelector.getTooltip_AsString();

		rm.openStart("div", oHeaderSelector);

		// For accessibility reasons, the HeaderSelector acts as the table cell and receives the focus instead of the actual cell.
		rm.class("sapUiTableCell");
		rm.class("sapUiTableHeaderCell");
		rm.class("sapUiTableRowSelectionHeaderCell");
		rm.attr("tabindex", "-1");

		if (bVisible) {
			if (!oHeaderSelector.getEnabled()) {
				rm.class("sapUiTableSelAllDisabled");
			}

			if (sType === "checkbox") {
				rm.class("sapUiTableSelAllVisible");

				if (oHeaderSelector.getSelected()) {
					sTooltip ??= TableUtils.getResourceText("TBL_DESELECT_ALL");
				} else {
					sTooltip ??= TableUtils.getResourceText("TBL_SELECT_ALL");
					rm.class("sapUiTableSelAll");
				}
			}

			if (sTooltip) {
				rm.attr("title", sTooltip);
			}

			const oTable = oHeaderSelector.getParent();
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ColumnRowHeader", oHeaderSelector);
		}

		rm.openEnd();

		if (bVisible) {
			if (sType === "custom") {
				rm.icon(oHeaderSelector.getIcon(), ["sapUiTableHeaderSelectorIcon"], {
					"title": null
				});
			} else {
				rm.openStart("div");
				rm.class("sapUiTableSelectAllCheckBox");
				rm.openEnd();
				rm.close("div");
			}
		}

		rm.close("div");
	};

	return HeaderSelectorRenderer;
});