/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/IntervalTrigger",
	"sap/ui/core/Lib",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/m/library",
	"sap/m/Text",
	"sap/f/cards/util/addTooltipIfTruncated",
	"sap/base/Log",
	"./BaseHeaderRenderer"
], function(
	Control,
	IntervalTrigger,
	Library,
	ResizeHandler,
	DateFormat,
	UniversalDate,
	coreLibrary,
	KeyCodes,
	mLibrary,
	Text,
	addTooltipIfTruncated,
	Log,
	BaseHeaderRenderer
) {
	"use strict";

	/**
	 * @const int The refresh interval for dataTimestamp in ms.
	 */
	const DATA_TIMESTAMP_REFRESH_INTERVAL = 15000;

	const XS_WIDTH_THRESHOLD = 180;

	const oResourceBundle = Library.getResourceBundleFor("sap.f");

	const TextAlign = coreLibrary.TextAlign;

	const TitleLevel = coreLibrary.TitleLevel;

	const WrappingType = mLibrary.WrappingType;

	/**
	 * Constructor for a new <code>BaseHeader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides basic functionality for header controls that can be used in <code>sap.f.Card</code.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.m.IBar
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.86
	 * @alias sap.f.cards.BaseHeader
	 */
	var BaseHeader = Control.extend("sap.f.cards.BaseHeader", {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.m.IBar"],
			"abstract" : true,
			properties: {
				/**
				 * Defines the timestamp of the oldest data in the card. Use this to show to the end user how fresh the information in the card is.
				 *
				 * Must be specified in ISO 8601 format.
				 *
				 * Will be shown as a relative time like "5 minutes ago".
				 *
				 * @ui5-experimental-since 1.89
				 */
				dataTimestamp: { type: "string", defaultValue: ""},

				/**
				 * Defines the status text visibility.
				 * @ui5-experimental-since 1.116
				 */
				statusVisible: { type: "boolean", defaultValue: true },

				/**
				 * Set to true to show that the data timestamp is currently updating.
				 * @private
				 */
				dataTimestampUpdating: { type: "boolean", defaultValue: false, visibility: "hidden" },

				/**
				 * Set to false if header shouldn't be focusable.
				 * @private
				 */
				focusable: { type: "boolean", defaultValue: true, visibility: "hidden" },

				/**
				 * If the header should be rendered as a tile.
				 * @private
				 */
				useTileLayout: { type: "boolean", group: "Appearance", visibility: "hidden" },

				/**
				 * Defines the semantic level of the header title, mapped to <code>aria-level</code>.
				 *
				 * Only used when the header is rendered standalone. When the header is
				 * part of a card, the card's <code>headingLevel</code> takes
				 * precedence (see <code>sap.f.CardBase#setHeadingLevel</code>).
				 *
				 * @private
				 */
				headingLevel: { type: "sap.ui.core.TitleLevel", group: "Accessibility", defaultValue: TitleLevel.H3, visibility: "hidden" },

				/**
				 * Defines the type of text wrapping to be used inside the header. This applies to title, subtitle and details texts of the header.
				 * @ui5-experimental-since 1.122
				 */
				wrappingType : {type: "sap.m.WrappingType", group : "Appearance", defaultValue : WrappingType.Normal},

				/**
				 * Defines if tooltips should be shown for truncated texts.
				 * @private
				 */
				useTooltips: { type: "boolean", visibility: "hidden", defaultValue: false},

				/**
				 * Defines the href which the header should open. If set - the header will act and render as a link.
				 *
				 * @ui5-experimental-since 1.122
				 * @ui5-restricted sap.ui.integration.widgets.Card
				 */
				href: { type: "string" },

				/**
				 * Defines the target for the case when <code>href</code> is given.
				 *
				 * @ui5-experimental-since 1.122
				 * @ui5-restricted sap.ui.integration.widgets.Card
				 */
				target: { type: "string" }
			},
			aggregations: {

				/**
				 * Info sections to be displayed in the header.
				 * @ui5-experimental-since 1.136
				 */
				infoSection: {type: "sap.ui.core.Control", multiple: true, singularName: "infoSection"},

				/**
				 * Holds the internal data timestamp text aggregation.
				 */
				_dataTimestamp: { type: "sap.m.Text", multiple: false, visibility: "hidden"},

				/**
				 * Defines the toolbar.
				 * @ui5-experimental-since 1.86
				 */
				toolbar: { type: "sap.ui.core.Control", multiple: false },

				/**
				 * Defines an error which will be displayed in the header.
				 */
				_error: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },

				/**
				 * Show as a banner in the header area. Use for example for system info and application shortcut.
				 * @ui5-experimental-since 1.118
				 * @ui5-restricted Work Zone
				 */
				bannerLines: { type: "sap.m.Text", group: "Appearance", multiple: true  }
			},
			events: {
				/**
				 * Fires when the user presses the control.
				 */
				press: {}
			}
		},

		renderer: BaseHeaderRenderer
	});

	BaseHeader.prototype._setRootAccessibilityRole = function () {
		// Do nothing. The sap.f.cards.BaseHeader has the heading role already.
	};
	BaseHeader.prototype._setRootAriaLevel = function () {
		// Do nothing. The sap.f.cards.BaseHeader has aria-level set by headingLevel already.
	};
	BaseHeader.prototype._applyContextClassFor = function () {
		// Do nothing. The sap.f.cards.BaseHeader does not differ based on context classes.
	};

	BaseHeader.prototype.init = function () {
		this._oRb = Library.getResourceBundleFor("sap.f");

		this._oToolbarDelegate = {
			onfocusin: this._onToolbarFocusin,
			onfocusout: this._onToolbarFocusout
		};
	};

	BaseHeader.prototype.exit = function () {
		this._removeTimestampListener();

		if (this._oToolbarDelegate) {
			this._oToolbarDelegate = null;
		}

		if (this._sXSWidthResizeHandlerId) {
			ResizeHandler.deregister(this._sXSWidthResizeHandlerId);
			this._sXSWidthResizeHandlerId = null;
		}

		this._oRb = null;
	};

	BaseHeader.prototype.onBeforeRendering = function () {
		var oToolbar = this.getToolbar(),
			aBannerLines = this.getBannerLines();

		if (oToolbar) {
			oToolbar.addStyleClass("sapFCardHeaderToolbar");
			oToolbar.removeEventDelegate(this._oToolbarDelegate, this);
			if (oToolbar.updateVisibility) {
				oToolbar.updateVisibility();
			}
		}
		if (aBannerLines) {
			aBannerLines.forEach((oText) => {
				oText.setTextAlign(TextAlign.End);
				oText.setWrapping(false);
			});
		}
	};

	BaseHeader.prototype.onAfterRendering = function () {
		var oToolbar = this.getToolbar();

		if (oToolbar) {
			oToolbar.addEventDelegate(this._oToolbarDelegate, this);
		}

		this.getBannerLines()?.forEach((oText) => {
			this._enhanceText(oText);
		});

		this._observeXSWidth();

		// Apply the initial state to the DOM.
		const oHeaderDomRef = this.getDomRef();
		if (oHeaderDomRef) {
			this._toggleXSHeaderClass(oHeaderDomRef.offsetWidth);
		}
	};

	/**
	 * Registers a {@link sap.ui.core.ResizeHandler} that toggles the
	 * <code>sapFCardXSHeader</code> class on the header DOM when the header
	 * becomes extra small (<= 180px, i.e. a 360px device at 200% zoom).
	 *
	 *
	 * Note: CSS container queries would be the natural fit here, but they were
	 * not available for use at the time of implementation, therefore
	 * ResizeHandler is used instead. ResizeHandler already defers its callback,
	 * so no manual <code>requestAnimationFrame</code> is needed.
	 *
	 * Tile-like cards are excluded in all their variants, as they are already
	 * optimized for small sizes. The exclusion is done purely in CSS (the XS
	 * rules are scoped to <code>:not(.sapUiIntCardTile)</code>), so the class is
	 * always toggled here and tiles simply do not react to it. This avoids
	 * relying on <code>isTile()</code> at render time, whose value could
	 * otherwise become stale.
	 *
	 * @private
	 */
	BaseHeader.prototype._observeXSWidth = function () {
		if (this._sXSWidthResizeHandlerId) {
			return;
		}

		this._sXSWidthResizeHandlerId = ResizeHandler.register(this, (oEvent) => {
			this._toggleXSHeaderClass(oEvent.size.width);
		});
	};

	/**
	 * Toggles the <code>sapFCardXSHeader</code> class on the header DOM based on
	 * the given width. Tile-like cards are excluded in CSS (see the class
	 * documentation of {@link sap.f.cards.BaseHeader#_observeXSWidth}).
	 *
	 * @param {float} fWidth The current header width in pixels.
	 * @private
	 */
	BaseHeader.prototype._toggleXSHeaderClass = function (fWidth) {
		this.getDomRef()?.classList.toggle("sapFCardXSHeader", fWidth <= XS_WIDTH_THRESHOLD);
	};

	BaseHeader.prototype.getFocusDomRef = function () {
		return this.getDomRef("focusable");
	};

	/**
	 * Gets the id of the title element. Can be used for aria-labelledby.
	 * @ui5-restricted sap.ui.integration
	 * @returns {string} The id of the title element.
	 */
	BaseHeader.prototype.getTitleId = function () {
		return null; // must override in Header and NumericHeader
	};

	/**
	 * If the header must be rendered as <code>a</code> element.
	 * @returns {boolean} True if the header must be rendered as <code>a</code> element.
	 */
	BaseHeader.prototype.isLink = function () {
		return !!this.getHref();
	};

	/**
	 * If the header must have tile accessibility.
	 * @returns {boolean} True if card related attributes should not be rendered.
	 */
	BaseHeader.prototype.isTile = function () {
		return !!this.getProperty("useTileLayout");
	};

	BaseHeader.prototype.onkeydown = function (oEvent) {

		if ((oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.ESCAPE || oEvent.which === KeyCodes.SHIFT)
			&& !oEvent.ctrlKey && !oEvent.metaKey) {

			if (oEvent.which === KeyCodes.SPACE) {
				// To prevent the browser scrolling.
				oEvent.preventDefault();
			}
			if (oEvent.which === KeyCodes.ENTER) {
				this._handleTap(oEvent);
			}

			if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
				this._bPressedEscapeOrShift = true;
			}
		}

	};

	BaseHeader.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === KeyCodes.SPACE) {
			if (!this._bPressedEscapeOrShift && !this._hasModifierKeys(oEvent)) {
				this._handleTap(oEvent);
			}
		}

		if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
			this._bPressedEscapeOrShift = false;
		}
	};

	BaseHeader.prototype.ontap = function (oEvent) {
		if (this.isLink() && oEvent.ctrlKey) {
			//Ctrl + click opens the link in a new tab.
			return;
		}

		this._handleTap(oEvent);
	};

	BaseHeader.prototype._handleTap = function (oEvent) {
		if (!oEvent.target.closest(".sapFCardSectionClickable") || !this.isInteractive() || this._isInsideToolbar(oEvent.target)) {
			return;
		}

		this.firePress({
			originalEvent: oEvent
		});

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Adds a CSS class on the header which removes its focus outline
	 * to prevent drawing two focuses when the toolbar is focused.
	 * @private
	 */
	BaseHeader.prototype._onToolbarFocusin = function () {
		this.addStyleClass("sapFCardHeaderToolbarFocused");
	};

	/**
	 * Removes a CSS class on the header which allows the header to show its focus outline.
	 * @private
	 */
	BaseHeader.prototype._onToolbarFocusout = function () {
		this.removeStyleClass("sapFCardHeaderToolbarFocused");
	};

	/*
	 * @override
	 */
	BaseHeader.prototype.setDataTimestamp = function (sDataTimestamp) {
		var sOldDataTimestamp = this.getDataTimestamp();

		if (sOldDataTimestamp && !sDataTimestamp) {
			this.destroyAggregation("_dataTimestamp");
			this._removeTimestampListener();
		}

		this.setProperty("dataTimestamp", sDataTimestamp);

		if (sDataTimestamp) {
			this._updateDataTimestamp();
			this._addTimestampListener();
		}

		return this;
	};

	/**
	 * @private
	 */
	BaseHeader.prototype.setDataTimestampUpdating = function (bDataTimestampUpdating) {
		var oTimestampText = this._createDataTimestamp();
		this.setProperty("dataTimestampUpdating", bDataTimestampUpdating);

		if (bDataTimestampUpdating) {
			oTimestampText.setText("updating..."); //@todo translate
			oTimestampText.addStyleClass("sapFCardDataTimestampUpdating");
			this._removeTimestampListener();
		} else {
			oTimestampText.removeStyleClass("sapFCardDataTimestampUpdating");
		}

		return this;
	};

	/**
	 * Lazily creates a title and returns it.
	 * @private
	 */
	BaseHeader.prototype._createDataTimestamp = function () {
		var oDataTimestamp = this.getAggregation("_dataTimestamp");

		if (!oDataTimestamp) {
			oDataTimestamp = new Text({
				id: this.getId() + "-dataTimestamp",
				wrapping: false,
				textAlign: "End"
			});
			oDataTimestamp.addStyleClass("sapFCardDataTimestamp");
			this.setAggregation("_dataTimestamp", oDataTimestamp);
		}

		return oDataTimestamp;
	};

	/**
	 * Updates the formatted data timestamp.
	 * @private
	 */
	BaseHeader.prototype._updateDataTimestamp = function () {
		var oDataTimestamp = this._createDataTimestamp(),
			sDataTimestamp = this.getDataTimestamp();

		if (!sDataTimestamp) {
			oDataTimestamp.setText("");
			return;
		}

		const sFormattedText = this._formatDataTimestamp(sDataTimestamp);

		oDataTimestamp.setText(sFormattedText);
		oDataTimestamp.removeStyleClass("sapFCardDataTimestampUpdating");
	};

	/**
	 * Formats the data timestamp to a relative time string.
	 * @private
	 * @param {string} sDataTimestamp The data timestamp in ISO 8601 format.
	 * @returns {string} The formatted data timestamp.
	 */
	BaseHeader.prototype._formatDataTimestamp = function (sDataTimestamp) {
		const oDateFormat = DateFormat.getDateTimeInstance({relative: true});
		const oUniversalDate = new UniversalDate(sDataTimestamp);

		const iDiffMs = Date.now() - oUniversalDate.getTime();
		const iTotalSeconds = Math.floor(iDiffMs / 1000);

		const iRoundedMinutes = Math.floor((iTotalSeconds - 44) / 60) + 1;

		const oRoundedDate = new UniversalDate(Date.now() - iRoundedMinutes * 60000);

		if (iTotalSeconds <= 44) {
			return oResourceBundle.getText("CARD_HEADER_DATETIMESTAMP_NOW");
		}

		return oDateFormat.format(oRoundedDate);
	};

	/**
	 * Adds listener to update the timestamp on interval.
	 * @private
	 */
	BaseHeader.prototype._addTimestampListener = function () {
		BaseHeader.getTimestampIntervalTrigger().addListener(this._updateDataTimestamp, this);

		this._bHasTimestampListener = true;
	};

	/**
	 * Removes the listener for updating the timestamp.
	 * @private
	 */
	BaseHeader.prototype._removeTimestampListener = function () {
		if (!this._bHasTimestampListener) {
			return;
		}

		BaseHeader.getTimestampIntervalTrigger().removeListener(this._updateDataTimestamp, this);

		this._bHasTimestampListener = false;
	};

	/**
	 * Gets or creates an interval trigger for the timestamp which is shared for all card headers.
	 * @private
	 * @ui5-restricted
	 * @returns {sap.ui.core.IntervalTrigger} The timestamp interval trigger for all card headers.
	 */
	BaseHeader.getTimestampIntervalTrigger = function () {
		if (!BaseHeader._oTimestampIntervalTrigger) {
			BaseHeader._oTimestampIntervalTrigger = new IntervalTrigger(DATA_TIMESTAMP_REFRESH_INTERVAL);
		}

		return BaseHeader._oTimestampIntervalTrigger;
	};

	/**
	 * @ui5-restricted
	 */
	BaseHeader.prototype.getTitleAriaRole = function () {
		return "heading";
	};

	/**
	 * @ui5-restricted
	 */
	BaseHeader.prototype.getFocusableElementAriaRole = function () {
		if (this.isLink()) {
			return "link";
		}

		return this.hasListeners("press") ? "button" : "group";
	};

	/**
	 * @ui5-restricted
	 */
	BaseHeader.prototype.getAriaHeadingLevel = function () {
		const sLevel = this._getResolvedHeadingLevel();

		if (sLevel === TitleLevel.Auto) {
			return "2";
		}

		// "H1".."H6" -> "1".."6"
		return sLevel.charAt(1);
	};

	/**
	 * Resolves the heading level to apply to the header title.
	 *
	 * When the header is part of a card, the card's <code>headingLevel</code> takes precedence.
	 * When the header is rendered standalone, its own <code>headingLevel</code>
	 * property is used.
	 *
	 * @returns {sap.ui.core.TitleLevel} The resolved heading level
	 * @private
	 */
	BaseHeader.prototype._getResolvedHeadingLevel = function () {
		if (this.isParentCard()) {
			return this.getParent().getHeadingLevel();
		}

		return this.getProperty("headingLevel");
	};

	/**
	 * @ui5-restricted
	 */
	BaseHeader.prototype.getAriaRoleDescription = function () {
		if (this.isTile()) {

			return null;
		}

		return this.hasListeners("press") ? this._oRb.getText("ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER") : this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER");
	};

	/**
	 * Gets the ids of the banner lines to be used in aria-labelledby
	 * @returns {string} The ids of the banner lines.
	 */
	BaseHeader.prototype._getBannerLinesIds = function () {
		return this.getBannerLines().map((oBannerLine) => {
			return oBannerLine.getId();
		}).join(" ");
	};

	BaseHeader.prototype.isInteractive = function() {
		return this.hasListeners("press");
	};

	BaseHeader.prototype.isFocusable = function() {
		if (!this.getProperty("focusable")) {
			return false;
		}

		const oParent = this.getParent();
		if (this.isParentCard() && oParent.isRoleListItem()) {
			return this.isInteractive();
		}

		return true;
	};

	/**
	 * Checks whether the parent of the header is a card.
	 * @returns {boolean} True if the parent is a card.
	 */
	BaseHeader.prototype.isParentCard = function() {
		const oParent = this.getParent();
		return oParent && oParent.isA("sap.f.CardBase");
	};

	/**
	 * Gets the id of the focusable element in the header.
	 */
	BaseHeader.prototype.getFocusableHeaderId = function() {

		return this.getId() + "-focusable";
	};

	BaseHeader.prototype._isInsideToolbar = function(oElement) {
		var oToolbar = this.getToolbar();

		return oToolbar && oToolbar.getDomRef() && oToolbar.getDomRef().contains(oElement);
	};

	/**
	 * When the option <code>useTooltips</code> is set to <code>true</code>,
	 * a tooltip is added to the text in case it gets truncated.
	 * @private
	 * @param {sap.m.Text} oText The text control.
	 */
	BaseHeader.prototype._enhanceText = function (oText) {
		if (this.getProperty("useTooltips")) {
			addTooltipIfTruncated(oText);
		}
	};

	BaseHeader.prototype._hasModifierKeys = function (oEvent) {
		return oEvent.altKey || oEvent.ctrlKey || oEvent.metaKey;
	};

	return BaseHeader;
});
