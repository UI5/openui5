
/*!\n * ${copyright}\n */
sap.ui.define([
	"sap/ui/core/Lib",
	'sap/uxap/ObjectPageSection',
	'sap/uxap/ObjectPageSectionRenderer',
	'sap/ui/core/Icon',
	'sap/ui/core/RenderManager'
], function(Library, ObjectPageSection, ObjectPageSectionRenderer, Icon, RenderManager) {
	"use strict";

	/**
	 * @class
	 * Custom ObjectPageSection control which supports a showBookmarkIcon property.
	 * When showBookmarkIcon=true, a chain-link icon is injected into the DOM right after
	 * the section title in onAfterRendering — no renderer override needed.
	 * Clicking the icon fires the bookmarkIconPress event.
	 * @extends sap.uxap.ObjectPageSection
	 * @private
	 * @ui5-restricted sdk
	 */
	var SDKObjectPageSection = ObjectPageSection.extend("sap.ui.documentation.ObjectPageSection", {
		metadata: {
			library: "sap.ui.documentation",
			properties: {
				/**
				 * When true, a chain-link icon is injected after the section title.
				 * Clicking the icon fires the bookmarkIconPress event.
				 */
				showBookmarkIcon: { type: "boolean", defaultValue: false }
			},
			aggregations: {
				/**
				 * Internal bookmark icon. The Section is the ManagedObject parent,
				 * so lifecycle (destroy) is handled automatically.
				 * Not intended for external use.
				 */
				_bookmarkIcon: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden" }
			},
			events: {
				/**
				 * Fired when the chain-link icon is pressed. Use to copy the section URL to clipboard.
				 */
				bookmarkIconPress: {}
			}
		},
		renderer: ObjectPageSectionRenderer
	});

	/**
	 * After the base renderer writes the section DOM, injects the bookmark icon
	 * right after the title element using a RenderManager flush into a placeholder span.
	 * This avoids copying/maintaining the ObjectPageSectionRenderer.
	 * @override
	 */
	SDKObjectPageSection.prototype.onAfterRendering = function () {
		ObjectPageSection.prototype.onAfterRendering?.apply(this, arguments);

		if (!this.getShowBookmarkIcon() || !this.getTitleVisible()) {
			return;
		}

		var oTitleControl = this._getTitleControl();
		var oTitleDom = oTitleControl && oTitleControl.getDomRef();
		if (!oTitleDom) {
			return;
		}

		// Insert a placeholder <span> directly after the title element.
		// The base renderer recreates the section DOM on every render cycle, so the
		// placeholder is also recreated fresh each time (no stale-DOM risk).
		var oPlaceholder = document.createElement("span");
		oTitleDom.parentNode.insertBefore(oPlaceholder, oTitleDom.nextSibling);

		// Render the icon into the placeholder (RenderManager.flush replaces
		// the placeholder's children with the icon's DOM).
		var oRm = new RenderManager().getInterface();
		oRm.renderControl(this._getBookmarkIcon());
		oRm.flush(oPlaceholder, true);
		oRm.destroy();
	};

	/**
	 * Lazy getter for the internal bookmark icon.
	 * Creates the icon on first call and stores it in the _bookmarkIcon hidden aggregation.
	 * @returns {sap.ui.core.Icon}
	 * @private
	 */
	SDKObjectPageSection.prototype._getBookmarkIcon = function () {
		var oIcon = this.getAggregation("_bookmarkIcon");
		if (!oIcon) {
			oIcon = new Icon({
				src: "sap-icon://chain-link",
				tooltip: Library.getResourceBundleFor("sap.ui.documentation").getText("API_DETAIL_BOOKMARK_TOOLTIP"),
				decorative: false,
				press: function () {
					this.fireBookmarkIconPress();
				}.bind(this)
			}).addStyleClass("sapUiDocSectionLinkIcon");
			this.setAggregation("_bookmarkIcon", oIcon, true); // suppress invalidate
		}
		return oIcon;
	};

	return SDKObjectPageSection;
});
