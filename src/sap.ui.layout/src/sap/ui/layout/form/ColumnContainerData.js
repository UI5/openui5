/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.ColumnContainerData.
sap.ui.define([
	'sap/ui/core/LayoutData',
	'sap/ui/layout/library'
	], function(LayoutData, library) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.ColumnContainerData.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The {@link sap.ui.layout.form.ColumnLayout ColumnLayout}-specific layout data for the {@link sap.ui.layout.form.FormContainer FormContainer} element.
	 *
	 * Depending on its size, the {@link sap.ui.layout.form.Form Form} control is divided into 1, 2, 3 or 4 columns
	 * by the {@link sap.ui.layout.form.ColumnLayout ColumnLayout} control.
	 * Using <code>ColumnContainerData</code>, the size of the {@link sap.ui.layout.form.FormContainer FormContainer} element can be influenced.
	 * @extends sap.ui.core.LayoutData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.56.0
	 * @alias sap.ui.layout.form.ColumnContainerData
	 */
	var ColumnContainerData = LayoutData.extend("sap.ui.layout.form.ColumnContainerData", /** @lends sap.ui.layout.form.ColumnContainerData.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Number of columns the {@link sap.ui.layout.form.FormContainer FormContainer} element uses if the {@link sap.ui.layout.form.Form Form} control has extra-large size.
			 *
			 * The number of columns for extra-large size must not be smaller than the number of columns for large size.
			 */
			columnsXL : {type : "sap.ui.layout.form.ColumnsXL", group : "Appearance", defaultValue : 2},

			/**
			 * Number of columns the {@link sap.ui.layout.form.FormContainer FormContainer} element uses if the {@link sap.ui.layout.form.Form Form} control has large size.
			 *
			 * The number of columns for large size must not be smaller than the number of columns for medium size.
			 */
			columnsL : {type : "sap.ui.layout.form.ColumnsL", group : "Appearance", defaultValue : 2},

			/**
			 * Number of columns the {@link sap.ui.layout.form.FormContainer FormContainer} element uses if the {@link sap.ui.layout.form.Form Form} control has medium size.
			 */
			columnsM : {type : "sap.ui.layout.form.ColumnsM", group : "Appearance", defaultValue : 1}
		}
	}});

	return ColumnContainerData;

});
