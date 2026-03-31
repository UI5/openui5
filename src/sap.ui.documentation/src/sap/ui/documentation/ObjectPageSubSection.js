/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	"sap/ui/core/Lib",
	'sap/uxap/ObjectPageSubSection',
	'sap/uxap/ObjectPageSubSectionRenderer',
	'sap/m/OverflowToolbarLayoutData',
	'sap/m/library',
	'sap/ui/core/Icon'
], function(Control, Library, ObjectPageSubSection, ObjectPageSubSectionRenderer, OverflowToolbarLayoutData, mobileLibrary, Icon) {
	"use strict";

	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	/**
	 * @class
	 * Custom ObjectPageSubSection control which:
	 * - Does not use the Grid control internally (uses a simple Container instead)
	 * - Supports a showBookmarkIcon property: when true, a chain-link icon is inserted
	 *   into the internal OverflowToolbar right after the title. Clicking the icon
	 *   fires the bookmarkIconPress event.
	 *
	 * @extends sap.uxap.ObjectPageSubSection
	 * @private
	 * @ui5-restricted sdk
	 */
	var SDKObjectPageSubSection = ObjectPageSubSection.extend("sap.ui.documentation.ObjectPageSubSection", {
		metadata: {
			library: "sap.ui.documentation",
			properties: {
				/**
				 * When true, a chain-link icon is rendered inside the subsection toolbar
				 * right after the title. Clicking the icon fires the bookmarkIconPress event.
				 */
				showBookmarkIcon: { type: "boolean", defaultValue: false }
			},
			events: {
				/**
				 * Fired when the chain-link icon is pressed. Use to copy the subsection URL to clipboard.
				 */
				bookmarkIconPress: {}
			}
		},
		renderer: ObjectPageSubSectionRenderer
	});

	/**
	 * Override to create and insert the bookmark icon into the OverflowToolbar when
	 * showBookmarkIcon is set to true. The icon is NOT stored in a ManagedObject aggregation
	 * on this control - it lives only in the toolbar (its true parent), with a plain JS
	 * reference kept in this._oBookmarkIcon. The toolbar (a hidden child of this SubSection
	 * via _headerToolbar) owns the icon lifecycle.
	 * This mirrors how sap.uxap.ObjectPageSubSection handles its "actions" aggregation.
	 * @override
	 */
	SDKObjectPageSubSection.prototype.setShowBookmarkIcon = function (bValue) {
		this.setProperty("showBookmarkIcon", bValue, true); // suppress invalidate — toolbar insertion handles rendering

		if (bValue) {
			if (!this._oBookmarkIcon) {
				this._oBookmarkIcon = new Icon({
					src: "sap-icon://chain-link",
					tooltip: Library.getResourceBundleFor("sap.ui.documentation").getText("API_DETAIL_BOOKMARK_TOOLTIP"),
					decorative: false,
					layoutData: new OverflowToolbarLayoutData({
						priority: OverflowToolbarPriority.NeverOverflow
					}),
					press: function () {
						this.fireBookmarkIconPress();
					}.bind(this)
				}).addStyleClass("sapUiDocSectionLinkIcon");
			}
			// Insert at index 1: after Title (0), before ToolbarSpacer (was 1, now shifts to 2).
			// insertAggregation reparents the icon to the toolbar; the toolbar (child of this
			// SubSection via _headerToolbar) then owns the icon lifecycle.
			this._getHeaderToolbar()?.insertAggregation("content", this._oBookmarkIcon, 1);
		} else if (this._oBookmarkIcon) {
			// Remove from toolbar but keep the instance — re-inserted if showBookmarkIcon is set to true again
			this._getHeaderToolbar()?.removeContent(this._oBookmarkIcon);
		}

		return this;
	};

	/**
	 * Clean up the bookmark icon on control exit.
	 * The icon may be detached from the toolbar (showBookmarkIcon=false) so we destroy it explicitly.
	 * @override
	 */
	SDKObjectPageSubSection.prototype.exit = function () {
		if (this._oBookmarkIcon) {
			this._oBookmarkIcon.destroy();
			this._oBookmarkIcon = null;
		}
		ObjectPageSubSection.prototype.exit?.apply(this, arguments);
	};

	// -----------------------------------------------------------------------
	// Action aggregation overrides
	// -----------------------------------------------------------------------

	// Number of fixed toolbar slots when showBookmarkIcon=true:
	// [Title(0), BookmarkIcon(1), ToolbarSpacer(2)] = 3
	SDKObjectPageSubSection.NUMBER_OF_ADDITIONAL_ACTIONS_BOOKMARKABLE = 3;

	/**
	 * Returns the number of fixed toolbar slots before user-added actions.
	 * Overrides the base to account for the optional bookmark icon slot.
	 * @returns {int}
	 * @override
	 */
	SDKObjectPageSubSection.prototype._getActionsOffset = function () {
		return this.getShowBookmarkIcon()
			? SDKObjectPageSubSection.NUMBER_OF_ADDITIONAL_ACTIONS_BOOKMARKABLE
			: ObjectPageSubSection.NUMBER_OF_ADDITIONAL_ACTIONS;
	};

	// -----------------------------------------------------------------------
	// Grid override - replace with simple Container
	// -----------------------------------------------------------------------

	var Container = Control.extend("sap.ui.documentation.Container", {
		metadata: {
			library: "sap.ui.documentation",
			aggregations: {
				content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"}
			}
		},

		renderer: {
			apiVersion: 2,

			render: function (oRm, oControl) {
				var aContent = oControl.getContent(),
					iLen,
					i;

				oRm.openStart("div", oControl).openEnd();

				for (i = 0, iLen = aContent.length; i < iLen; i++) {
					oRm.renderControl(aContent[i]);
				}

				oRm.close("div");
			}
		}
	});

	SDKObjectPageSubSection.prototype._getGrid = function () {
		if (!this.getAggregation("_grid")) {
			this.setAggregation("_grid", new Container({
				id: this.getId() + "-innerGrid"
			}), true); // this is always called onBeforeRendering so suppress invalidate
		}

		return this.getAggregation("_grid");
	};

	return SDKObjectPageSubSection;
});
