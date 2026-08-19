/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseHeader",
	"sap/m/AvatarColor",
	"sap/m/AvatarImageFitType",
	"sap/m/AvatarShape",
	"sap/m/AvatarSize",
	"sap/f/library",
	"sap/ui/core/library",
	"sap/m/Text",
	"sap/m/Avatar",
	"sap/f/cards/HeaderRenderer",
	"sap/ui/core/InvisibleText",
	"sap/base/Log"
], function(
	BaseHeader,
	AvatarColor,
	AvatarImageFitType,
	AvatarShape,
	AvatarSize,
	library,
	coreLibrary,
	Text,
	Avatar,
	HeaderRenderer,
	InvisibleText,
	Log
) {
	"use strict";

	const ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>Header</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays general information in the header of the {@link sap.f.Card}.
	 *
	 * You can configure the title, subtitle, status text and icon, using the provided properties.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>You should always set a title.</li>
	 * <li>To show a KPI or any numeric information, use {@link sap.f.cards.NumericHeader} instead.</li>
	 * <ul>
	 *
	 * @extends sap.f.cards.BaseHeader
	 * @implements sap.f.cards.IHeader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.64
	 * @alias sap.f.cards.Header
	 */
	var Header = BaseHeader.extend("sap.f.cards.Header", {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.f.cards.IHeader"],
			properties: {

				/**
				 * Defines the title.
				 */
				title: { type: "string", defaultValue: "" },

				/**
				 * Limits the number of lines for the title.
				 * @since 1.101
				 */
				titleMaxLines: { type: "int", defaultValue: 3 },

				/**
				 * Defines the subtitle.
				 */
				subtitle: { type: "string", defaultValue: "" },

				/**
				 * Limits the number of lines for the subtitle.
				 * @since 1.101
				 */
				subtitleMaxLines: { type: "int", defaultValue: 2 },

				/**
				 * Defines the status text.
				 */
				statusText: { type: "string", defaultValue: "" },

				/**
				 * Defines the shape of the icon.
				 */
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Circle },

				/**
				 * Defines the icon source.
				 */
				iconSrc: { type: "sap.ui.core.URI", defaultValue: "" },

				/**
				 * Defines the initials of the icon.
				 */
				iconInitials: { type: "string", defaultValue: "" },

				/**
				 * Defines an alt text for the avatar or icon.
				 *
				 * @since 1.81
				 */
				iconAlt: { type: "string", defaultValue: "" },

				/**
				 * Defines a background color for the avatar or icon.
				 *
				 * @since 1.83
				 */
				iconBackgroundColor: { type: "sap.m.AvatarColor", defaultValue: AvatarColor.Transparent },

				/**
				 * Defines whether the card icon is visible.
				 *
				 * @private
				 * @ui5-restricted sap.ui.integration
				 * @since 1.83
				 */
				iconVisible: { type: "boolean", defaultValue: true },

				/**
				 * Defines the size of the icon.
				 *
				 * @since 1.119
				 */
				iconSize: { type: "sap.m.AvatarSize", defaultValue: AvatarSize.S },

				/**
				 * Defines how the image fits in the icon area.
				 *
				 * @since 1.130
				 */
				iconFitType: { type: "sap.m.AvatarImageFitType", defaultValue: AvatarImageFitType.Cover },

				/**
				 * Defines a status-colored, non-interactive message icon in the icon area.
				 *
				 * @since 1.141
				 */
				iconState: { type: "sap.ui.core.ValueState", defaultValue: ValueState.None }
			},
			aggregations: {

				/**
				 * Defines the inner title control.
				 */
				_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner subtitle control.
				 */
				_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner avatar control.
				 */
				_avatar: { type: "sap.m.Avatar", multiple: false, visibility: "hidden" }
			}
		},
		renderer: HeaderRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	Header.prototype.init = function () {
		BaseHeader.prototype.init.apply(this, arguments);

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	Header.prototype.exit = function () {
		BaseHeader.prototype.exit.apply(this, arguments);
	};

	/**
	 * Lazily creates a title and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner title aggregation
	 */
	Header.prototype._getTitle = function () {
		var oTitle = this.getAggregation("_title");
		if (!oTitle) {
			oTitle = new Text(this.getId() + "-title").addStyleClass("sapFCardTitle");
			this.setAggregation("_title", oTitle);
		}
		return oTitle;
	};

	/**
	 * Lazily creates a subtitle and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner subtitle aggregation
	 */
	Header.prototype._getSubtitle = function () {
		var oSubtitle = this.getAggregation("_subtitle");
		if (!oSubtitle) {
			oSubtitle = new Text(this.getId() + "-subtitle").addStyleClass("sapFCardSubtitle");
			this.setAggregation("_subtitle", oSubtitle);
		}
		return oSubtitle;
	};

	/**
	 * Lazily creates an avatar control and returns it.
	 * @private
	 * @returns {sap.m.Avatar} The inner avatar aggregation
	 */
	Header.prototype._getAvatar = function () {
		var oAvatar = this.getAggregation("_avatar");
		if (!oAvatar) {
			oAvatar = new Avatar().addStyleClass("sapFCardIcon");
			this.setAggregation("_avatar", oAvatar);
		}
		return oAvatar;
	};

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	Header.prototype.onBeforeRendering = function () {
		BaseHeader.prototype.onBeforeRendering.apply(this, arguments);

		this._getTitle()
			.setText(this.getTitle())
			.setMaxLines(this.getTitleMaxLines())
			.setWrappingType(this.getWrappingType());

		this._enhanceText(this._getTitle());

		this._getSubtitle()
			.setText(this.getSubtitle())
			.setMaxLines(this.getSubtitleMaxLines())
			.setWrappingType(this.getWrappingType());

		this._enhanceText(this._getSubtitle());

		if (this.getIconState() != ValueState.None) {
			const icon = this._getIconForState();
			this._getAvatar()
				.setSrc(icon)
				.setTooltip(this.getIconAlt());
		} else {
			this._getAvatar()
				.setDisplayShape(this.getIconDisplayShape())
				.setSrc(this.getIconSrc())
				.setInitials(this.getIconInitials())
				.setTooltip(this.getIconAlt())
				.setBackgroundColor(this.getIconBackgroundColor())
				.setDisplaySize(this.getIconSize())
				.setImageFitType(this.getIconFitType());
		}

		this._validateIconProperties();
	};

	/**
	 * Helper function used to get the appropriate icon for the state.
	 *
	 * @private
	 * @returns {string} The URI of the icon corresponding to the state.
	 */
	Header.prototype._getIconForState = function () {
		switch (this.getIconState()) {
			case ValueState.Success:
				return "sap-icon://sys-enter-2";
			case ValueState.Error:
				return "sap-icon://error";
			case ValueState.Warning:
				return "sap-icon://warning";
			case ValueState.Information:
				return "sap-icon://information";
			default:
				return "";
		}
	};

	Header.prototype._validateIconProperties = function () {
		if ((this.getIconSrc() || this.getIconInitials()) && this.getIconState() != ValueState.None) {
			Log.warning("Invalid Icon configuration: You cannot set an icon with both src/initials and a state simultaneously. The Icon supports only one at a time. Remove either the src/initials or the state.");
		}
	};

	/**
	 * @protected
	 * @returns {boolean} If the icon should be shown.
	 */
	Header.prototype.shouldShowIcon = function () {
		return this.getIconVisible();
	};

	/**
	 * This method is a hook for the RenderManager that gets called
	 * during the rendering of child Controls. It allows to add,
	 * remove and update existing accessibility attributes (ARIA) of
	 * those controls.
	 *
	 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
	 * @param {{role: string, level: string}} mAriaProps - The mapping of "aria-" prefixed attributes
	 * @protected
	 */
	Header.prototype.enhanceAccessibilityState = function (oElement, mAriaProps) {
	   if (oElement === this.getAggregation("_title")) {
		   mAriaProps.role = this.getTitleAriaRole();
		   mAriaProps.level = this.getAriaHeadingLevel();
	   }
   };

	/**
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	Header.prototype._getAriaLabelledBy = function () {
		const aIds = [];

		if (this.getParent() && this.getParent()._ariaText) {
			aIds.push(this.getParent()._ariaText.getId());
		}

		if (this.getTitle()
			&& this.isParentCard()
			&& this.getParent().isTileDisplayVariant()) {
			aIds.push(this._getTitle().getId());
		}

		if (this.getSubtitle()) {
			aIds.push(this._getSubtitle().getId());
		}

		if (this.getStatusText()) {
			aIds.push(this.getId() + "-status");
		}

		if (this.getDataTimestamp()) {
			aIds.push(this.getId() + "-dataTimestamp");
		}

		if (this.getIconSrc() || this.getIconInitials() || this.getIconState() !== ValueState.None) {
			aIds.push(this._getAvatar().getId());
		}

		aIds.push(this._getBannerLinesIds());

		return aIds.filter((sElement) => { return !!sElement; }).join(" ");
	};

	/**
	 * @override
	 */
	Header.prototype.getTitleId = function () {
		return this._getTitle().getId();
	};

	Header.prototype.isLoading = function () {
		return false;
	};

	Header.prototype.attachPress = function () {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		BaseHeader.prototype.attachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	Header.prototype.detachPress = function() {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		BaseHeader.prototype.detachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	return Header;
});
