/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/DataType"
	], (
	DataType
) => {
"use strict";

/**
 * Defines the supported positions for chart-relevant actions within the chart toolbar, in accordance with the {@link https://www.sap.com/design-system/fiori-design-web/ui-elements/chart-toolbar/ SAP Design System}.
 *
 * @enum {string}
 * @alias sap.ui.mdc.enums.ChartActionPosition
 * @since 1.145
 * @public
 */
const ChartActionPosition = {
	/**
	 * The position of the selection details action in the personalization actions group.
	 * @public
	 */
	PersonalizationActionsSelectionDetails: "PersonalizationActionsSelectionDetails",

	/**
	 * The position of the drill-down action in the personalization actions group.
	 * @public
	 */
	PersonalizationActionsDrillDown: "PersonalizationActionsDrillDown",

	/**
	 * The position of the legend action in the personalization actions group.
	 * @public
	 */
	PersonalizationActionsLegend: "PersonalizationActionsLegend",

	/**
	 * The position of the zoom in action in the personalization actions group.
	 * @public
	 */
	PersonalizationActionsZoomIn: "PersonalizationActionsZoomIn",

	/**
	 * The position of the zoom out action in the personalization actions group.
	 * @public
	 */
	PersonalizationActionsZoomOut: "PersonalizationActionsZoomOut",

	/**
	 * The position of the settings action in the personalization actions group.
	 * @public
	 */
	PersonalizationActionsSettings: "PersonalizationActionsSettings",

	/**
	 * Extension point for the share actions.
	 * These actions allow users to share chart content with another application or with the homepage as a tile, such as Send as Email, Save as Tile.
	 * @public
	 */
	ShareActions: "ShareActions",

	/**
	 * The position of the chart type menu in the view actions group.
	 * @public
	 */
	ViewActionsChartType: "ViewActionsChartType",

	/**
	 * Extension point for the view actions.
	 * These actions change the representation of the entire chart, such as View Switch, Fullscreen.
	 * @public
	 */
	ViewActions: "ViewActions",

	/**
	 * Extension point for actions displayed after all chart-relevant actions.
	 * @public
	 */
	EndActions: "EndActions"
};

DataType.registerEnum("sap.ui.mdc.enums.ChartActionPosition", ChartActionPosition);

return ChartActionPosition;

});