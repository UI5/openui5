/*!
 * ${copyright}
 */

// Provides control sap.m.TableTitle.
sap.ui.define([
	"sap/ui/core/Control",
	"./TableTitleRenderer"
],
	function(Control, TableTitleRenderer) {
	"use strict";

	/**
	 * Constructor for a new TableTitle.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A composite title control intended to display a table title along with optional
	 * total and selected row counts.
	 *
	 * <h3>Overview</h3>
	 * The <code>TableTitle</code> control renders the provided <code>sap.m.Title</code> control and optionally
	 * displays the table's total row count, the selected row count, or both independently.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.ITitle
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.145.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.m.TableTitle
	 */
	const TableTitle = Control.extend("sap.m.TableTitle", /** @lends sap.m.TableTitle.prototype */ {
		metadata : {

			library : "sap.m",
			interfaces : [
				"sap.ui.core.ITitle",
				"sap.ui.core.IShrinkable"
			],

			properties : {

				/**
				 * Defines the value that is displayed as the total row count.
				 *
				 * <b>Note:</b> A value of 0 represents an empty table, while a negative value
				 * indicates that the total count is unknown. Although both cases are not displayed
				 * to the user, they are handled differently for accessibility features.
				 */
				totalCount : {type : "int", group : "Appearance", defaultValue : 0},

				/**
				 * Defines the value that is displayed as the selected row count.
				 */
				selectedCount : {type : "int", group : "Appearance", defaultValue : 0},

				/**
				 * Toggles between compact and extended mode for
				 * <code>selectedCount</code> and <code>totalCount</code>.
				 *
				 * <b>Compact mode</b>: Displays counts in a condensed format
				 * <br>
				 * <b>Extended mode</b>: Displays counts with separate descriptive labels
				 */
				showExtendedView : {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * Determines whether the <code>TableTitle</code> is visible.
				 */
				visible : {type : "boolean", group : "Appearance", defaultValue : true}

			},

			aggregations : {
				/**
				 * Sets the title control, which is displayed in the toolbar as usual.
				 *
				 * <b>Note:</b> You must set a <code>title</code> to use the <code>TableTitle</code>.
				 */
				title : {type : "sap.m.Title", multiple : false}
			}

		},

		renderer: TableTitleRenderer
	});

	return TableTitle;

});
