/*!
 * ${copyright}
 */

// Provides control sap.tnt.SideNavigationSearchField.
sap.ui.define([
		'sap/ui/core/Lib',
		'sap/m/SearchField',
		'./SideNavigationSearchFieldRenderer'],
	function(
			Lib,
			SearchField,
			SideNavigationSearchFieldRenderer) {
		"use strict";

		/**
		 * Constructor for a new SideNavigationSearchField.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Search field for side navigation with predefined accessibility settings.
		 *
		 * The <code>SideNavigationSearchField</code> control extends {@link sap.m.SearchField}
		 * and provides accessibility-related defaults tailored for use in a {@link sap.tnt.SideNavigation}.
		 *
		 * @extends sap.m.SearchField
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.151
		 * @alias sap.tnt.SideNavigationSearchField
		 */
		const SideNavigationSearchField = SearchField.extend("sap.tnt.SideNavigationSearchField", {
			metadata: {
				library : "sap.tnt"
			},
			renderer: SideNavigationSearchFieldRenderer
		});

		SideNavigationSearchField.prototype._getPlaceholder = function() {
			return this.getPlaceholder() || Lib.getResourceBundleFor("sap.tnt").getText("SIDE_NAVIGATION_SEARCH_PLACEHOLDER");
		};

		SideNavigationSearchField.prototype._hasAriaLabelledBy = function() {
			// SideNavigationSearchField includes a default ariaLabelledBy
			// if one isn’t explicitly set
			return true;
		};

		return SideNavigationSearchField;
	});
