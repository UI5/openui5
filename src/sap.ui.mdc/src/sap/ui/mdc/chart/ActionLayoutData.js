/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.ActionLayoutData.
sap.ui.define([
		"sap/m/OverflowToolbarLayoutData",
		"sap/ui/mdc/enums/ChartActionPosition"
	],
	(
		OverflowToolbarLayoutData,
		ChartActionPosition
	) => {
		"use strict";

		/**
		 * Constructor for a new <code>ActionLayoutData</code>.
		 *
		 * @param {string} [sId] ID for the new layout data, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new layout data
		 *
		 * @class
		 * Defines the layout data for the {@link sap.ui.mdc.Chart#getActions actions} and {@link sap.ui.mdc.Chart#getChartActions chartActions}
		 * of the {@link sap.ui.mdc.Chart Chart}.
		 *
		 * @extends sap.m.OverflowToolbarLayoutData
		 * @implements sap.ui.mdc.IActionLayoutData
		 * @version ${version}
		 * @constructor
		 * @public
		 * @since 1.145
		 * @alias sap.ui.mdc.chart.ActionLayoutData
		 */
		const ActionLayoutData = OverflowToolbarLayoutData.extend("sap.ui.mdc.chart.ActionLayoutData", {
			metadata: {
				library: "sap.ui.mdc",
				interfaces: [
					"sap.ui.mdc.IActionLayoutData"
				],
				properties: {
					/**
					 * Defines the position of the action within the group of chart actions.
					 */
					position: {
						type: "sap.ui.mdc.enums.ChartActionPosition",
						group: "Misc",
						defaultValue: ChartActionPosition.EndActions
					}
				}
			}
		});

		return ActionLayoutData;

	});