/*!
 * ${copyright}
 */

// Provides control sap.m.DialogAccessibleLandmarkInfo.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";


	/**
	 * Constructor for a new <code>sap.m.DialogAccessibleLandmarkInfo</code> element.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Settings for accessible landmarks which can be applied to the structural regions of a
	 * <code>sap.m.Dialog</code> control.
	 *
	 * By default the Dialog exposes its <code>Header</code>, <code>Content</code>, and <code>Footer</code>
	 * as separate <code>region</code> landmarks. This element lets app developers suppress a region or
	 * provide a custom accessible name for it. It does not allow reassigning a region to a different
	 * ARIA landmark role.
	 *
	 * Suppression is relevant when the Dialog's <code>content</code> aggregation contains a <code>Page</code> or
	 * <code>DynamicPage</code> that declares its own <code>PageAccessibleLandmarkInfo</code>: Without suppression,
	 * the Page's own banner/region landmarks are nested inside the Dialog's content region.
	 *
	 * Suppressing the Content landmark is recommended when <code>showHeader="false"</code>. In this case, the Dialog
	 * has no header title, so the embedded Page's title is responsible for labeling the Dialog.
	 *
	 * @example
	 * // Headerless Dialog embedding a Page that declares its own landmarks.
	 * // Suppress the Dialog's Content region so the Page's landmarks are not nested in it;
	 * // the Page title labels the Dialog via ariaLabelledBy.
	 * var oTitle = new sap.m.Title({ text: "Order details" });
	 * var oDialog = new sap.m.Dialog({
	 *     showHeader: false,
	 *     ariaLabelledBy: [oTitle],
	 *     landmarkInfo: new sap.m.DialogAccessibleLandmarkInfo({
	 *         showContentLandmark: false
	 *     }),
	 *     content: new sap.m.Page({
	 *         customHeader: new sap.m.Bar({ contentLeft: [oTitle] }),
	 *			landmarkInfo: new sap.m.PageAccessibleLandmarkInfo()
	 *     })
	 * });
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.m.DialogAccessibleLandmarkInfo
	 */
	var DialogAccessibleLandmarkInfo = Element.extend("sap.m.DialogAccessibleLandmarkInfo", /** @lends sap.m.DialogAccessibleLandmarkInfo.prototype */ { metadata : {

		library : "sap.m",
		properties : {
			/**
			 * Defines whether the <code>Header</code> region of the corresponding <code>sap.m.Dialog</code> is exposed as a landmark.
			 */
			showHeaderLandmark : {type : "boolean", defaultValue : true},

			/**
			 * Defines the accessible name of the <code>Header</code> landmark.
			 *
			 * Only relevant when the <code>Header</code> landmark is exposed. If not set or empty, a predefined text is used.
			 * To remove the landmark, set <code>showHeaderLandmark</code> to <code>false</code>.
			 */
			headerLabel : {type : "string", defaultValue : null},

			/**
			 * Defines whether the <code>Content</code> region of the corresponding <code>sap.m.Dialog</code> is exposed as a landmark.
			 */
			showContentLandmark : {type : "boolean", defaultValue : true},

			/**
			 * Defines the accessible name of the <code>Content</code> landmark.
			 *
			 * Only relevant when the <code>Content</code> landmark is exposed. If not set or empty, a predefined text is used.
			 * To remove the landmark, set <code>showContentLandmark</code> to <code>false</code>.
			 */
			contentLabel : {type : "string", defaultValue : null},

			/**
			 * Defines whether the <code>Footer</code> region of the corresponding <code>sap.m.Dialog</code> is exposed as a landmark.
			 */
			showFooterLandmark : {type : "boolean", defaultValue : true},

			/**
			 * Defines the accessible name of the <code>Footer</code> landmark.
			 *
			 * Only relevant when the <code>Footer</code> landmark is exposed. If not set or empty, a predefined text is used.
			 * To remove the landmark, set <code>showFooterLandmark</code> to <code>false</code>.
			 */
			footerLabel : {type : "string", defaultValue : null}
		}
	}});

	return DialogAccessibleLandmarkInfo;
});
