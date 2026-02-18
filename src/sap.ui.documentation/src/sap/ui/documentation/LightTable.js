/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control'],
	function(Control) {
	"use strict";

		/**
		 * @class
		 * Provides a light table control used in the API Reference section.
		 * @extends sap.ui.core.Control
		 * @private
		 * @ui5-restricted sdk
		 */
		return Control.extend("sap.ui.documentation.LightTable", {
			metadata : {
				library: "sap.ui.documentation",
				properties: {
					/**
					 * Determines the list of names for the table columns. For example, <code>["Name", "Cardinality", "Type", "Description"]</code>.
					 */
					columnTitles: {type: "string[]"},
					/**
					 * Determines the number of columns the table will have. Keep in mind that this number should correspond to the length of
					 * the array provided with the <code>columnTitles</code> property.
					 */
					columnCount: {type: "int"}
				},
				defaultAggregation : "rows",
				aggregations: {
					/**
					 * Rows of the table.
					 */
					rows: {type: "sap.ui.documentation.Row", multiple: true}
				}
			},
			renderer: {
				apiVersion: 2,

				render: function(oRm, oControl) {
					var aRows = oControl.getRows(),
					aColumnTitles = oControl.getColumnTitles(),
					iLen,
					i;

					oRm.openStart("div", oControl);
					oRm.class("sapUiDocLightTable");
					oRm.class("columns-" + oControl.getColumnCount());
					oRm.openEnd();

					// Column titles
					oRm.openStart("div")
						.class("head")
						.openEnd();

					for (i = 0, iLen = aColumnTitles.length; i < iLen; i++) {
						oRm.openStart("div")
							.class("cell")
							.openEnd();

						oRm.text(aColumnTitles[i])
							.close("div");
					}

					oRm.close("div");

					// Render rows (each row handles its own rendering including subRows)
					for (i = 0, iLen = aRows.length; i < iLen; i++) {
						oRm.renderControl(aRows[i]);
					}

					oRm.close("div");
				}
			}
		});
});