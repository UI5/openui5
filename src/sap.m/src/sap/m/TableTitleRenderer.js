/*!
 * ${copyright}
 */

// Provides renderer for sap.m.TableTitle
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/format/NumberFormat"
], function(Library, NumberFormat) {
"use strict";

/**
 * TableTitle renderer.
 * @namespace
 */
const TableTitleRenderer = {
	apiVersion: 2
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used to render the control's DOM
 * @param {sap.m.TableTitle} oTableTitle An object representation of the control that is rendered
 */
TableTitleRenderer.render = function(oRm, oTableTitle){
	const oExternalTitle = oTableTitle.getTitle();

	const oNumberFormat = NumberFormat.getIntegerInstance({groupingEnabled: true});
	const iTotalCount = oTableTitle.getTotalCount();
	const iSelectedCount = oTableTitle.getSelectedCount();
	const sTotalCountFormatted = oNumberFormat.format(oTableTitle.getTotalCount());
	const sSelectedCountFormatted = oNumberFormat.format(oTableTitle.getSelectedCount());
	const oResourceBundle = Library.getResourceBundleFor("sap.m");
	let sText;

	oRm.openStart("div", oTableTitle);
	if (!oTableTitle.getVisible()) {
		oRm.style("display", "none");
	}
	oRm.class("sapMTableTitle");
	oRm.openEnd();

	oRm.renderControl(oExternalTitle);

	oRm.openStart("span", oTableTitle.getId() + "-tableTitleContent");
	oRm.class("sapMTableTitleText");
	if (iSelectedCount > 0 && iTotalCount > 0) {
		oRm.class("sapMTableTitleSelectedRowCount");
		if (oTableTitle.getShowExtendedView()) {
			sText = oResourceBundle.getText("TABLETITLE_SELECTED_ROW_COUNT_EXT", [sSelectedCountFormatted, sTotalCountFormatted]);

		} else {
			sText = oResourceBundle.getText("TABLETITLE_SELECTED_ROW_COUNT_COMP", [sSelectedCountFormatted, sTotalCountFormatted]);
		}
	} else if (iTotalCount > 0) {
		oRm.class("sapMTableTitleTotalCount");
		sText = sTotalCountFormatted;
	} else if (iSelectedCount > 0) {
		oRm.class("sapMTableTitleSelectedCount");
		sText = oResourceBundle.getText("TABLETITLE_SELECTED_COUNT_ONLY", [sSelectedCountFormatted]);
	}
	oRm.openEnd();
	if (sText) {
		oRm.text(`(${sText})`);
	}
	oRm.close("span");

	oRm.close("div");
};

return TableTitleRenderer;
});
