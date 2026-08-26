/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/m/Image',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'./ImageContentRenderer',
	"sap/ui/events/KeyCodes"
], function(
	library,
	Control,
	Image,
	IconPool,
	Device,
	ImageContentRenderer,
	KeyCodes
) {
	"use strict";

	/**
	 * Constructor for a new sap.m.ImageContent control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class This control can be used to display image content in a GenericTile.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.38
	 *
	 * @public
	 * @alias sap.m.ImageContent
	 */
	var ImageContent = Control.extend("sap.m.ImageContent", /** @lends sap.m.ImageContent.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {
				/**
				 * The image to be displayed as a graphical element within the imageContent. This can be an image or an icon from the icon font.
				 */
				src: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: null},
				/**
				 * Description of image. This text is used to provide ScreenReader information when the control is interactive (has a press handler).
				 */
				description: {type: "string", group: "Accessibility", defaultValue: null}
			},
			defaultAggregation: "_content",
			aggregations: {
				/**
				 * The hidden aggregation for the image content.
				 */
				_content: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * The event is triggered when the image content is pressed.
				 */
				press: {}
			}
		},

		renderer: ImageContentRenderer
	});

	/* --- Lifecycle Handling --- */

	ImageContent.prototype.onBeforeRendering = function () {
		var oImage, sUri, sDescription, bHasPressHandler, bImageRecreated;
		oImage = this.getAggregation("_content");
		sUri = this.getSrc();
		sDescription = this.getDescription();
		bHasPressHandler = this.hasListeners("press");
		bImageRecreated = false;

		if (!oImage || sUri !== oImage.getSrc()) {
			if (oImage) {
				oImage.destroy();
				oImage = null;
			}

			// For interactive images, inner image is decorative (aria on outer control)
			// For non-interactive images, inner image should have alt text
			oImage = IconPool.createControlByURI({
				id: this.getId() + "-icon-image",
				src: sUri,
				alt: bHasPressHandler ? "" : (sDescription || ""),
				decorative: bHasPressHandler,
				useIconTooltip: false
			}, Image);
			this.setAggregation("_content", oImage, true);
			this._setPointerOnImage();
			bImageRecreated = true;
		}

		// Update inner image alt text when description or press handler changes
		// (only if image was reused, not recreated above)
		if (!bImageRecreated) {
			if (bHasPressHandler) {
				oImage.setAlt("");
				oImage.setDecorative(true);
			} else {
				oImage.setAlt(sDescription || "");
				oImage.setDecorative(false);
			}
		}

		// Always set tooltip when description exists, regardless of press handlers
		// This ensures tooltip is available on hover for all images
		if (sDescription) {
			this.setTooltip(sDescription.trim());
		} else {
			// Clear tooltip if description is removed
			this.setTooltip(null);
		}
	};

	/**
	 * Sets CSS class 'sapMPointer' for the internal Icon if needed.
	 * @private
	 */
	ImageContent.prototype._setPointerOnImage = function () {
		var oImage = this.getAggregation("_content");
		if (oImage && this.hasListeners("press")) {
			oImage.addStyleClass("sapMPointer");
		} else if (oImage && oImage.hasStyleClass("sapMPointer")) {
			oImage.removeStyleClass("sapMPointer");
		}
	};

	/* --- Event Handling --- */
	/**
	 * Handler for user tap (click on desktop, tap on touch devices) event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	ImageContent.prototype.ontap = function (oEvent) {
		if (Device.browser.msie) {
			this.getDomRef().focus();
		}
		this.firePress();
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	ImageContent.prototype.onkeydown = function (oEvent) {
		if (oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	ImageContent.prototype.attachEvent = function (eventId, data, functionToCall, listener) {
		Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);
		if (this.hasListeners("press")) {
			var oDomRef = this.getDomRef();
			var oInnerImage = this.getAggregation("_content");
			var sDescription = this.getDescription();

			if (oDomRef) {
				oDomRef.setAttribute("tabindex", "0");
				oDomRef.classList.add("sapMPointer");
				// Add aria-label when becoming interactive
				if (sDescription) {
					oDomRef.setAttribute("aria-label", sDescription);
				}
			}

			// Make inner image decorative when control becomes interactive
			if (oInnerImage) {
				oInnerImage.setAlt("");
				oInnerImage.setDecorative(true);
			}

			this._setPointerOnImage();
		}
		return this;
	};

	ImageContent.prototype.detachEvent = function (eventId, functionToCall, listener) {
		Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (!this.hasListeners("press")) {
			var oDomRef = this.getDomRef();
			var oInnerImage = this.getAggregation("_content");
			var sDescription = this.getDescription();

			if (oDomRef) {
				oDomRef.removeAttribute("tabindex");
				oDomRef.classList.remove("sapMPointer");
				// Remove aria-label when becoming non-interactive
				oDomRef.removeAttribute("aria-label");
			}

			// Make inner image non-decorative with alt text when control becomes non-interactive
			if (oInnerImage) {
				oInnerImage.setAlt(sDescription || "");
				oInnerImage.setDecorative(false);
			}

			this._setPointerOnImage();
		}
		return this;
	};

	/**
	 * Overridden setter for description property to handle dynamic aria-label updates
	 *
	 * @param {string} sDescription The new description value
	 * @returns {this} Reference to this for method chaining
	 */
	ImageContent.prototype.setDescription = function (sDescription) {
		// Call parent setter
		this.setProperty("description", sDescription);

		// Update aria-label dynamically if control is already rendered and interactive
		var oDomRef = this.getDomRef();
		if (oDomRef && this.hasListeners("press")) {
			if (sDescription) {
				oDomRef.setAttribute("aria-label", sDescription);
			} else {
				oDomRef.removeAttribute("aria-label");
			}
		}

		return this;
	};

	/**
	 * Returns the alternative text
	 *
	 * @returns {string} The alternative text
	 */
	ImageContent.prototype.getAltText = function () {
		const oContent = this.getAggregation("_content");
		if (oContent && oContent.getAlt() !== "") {
			return oContent.getAlt();
		} else {
			// Since inner control is decorative, return the description property
			// as it represents the semantic meaning of the image
			const sDescription = this.getDescription();
			if (sDescription) {
				return sDescription;
			}
			// Fallback to inner control's accessibility info
			const sText = oContent?.getAccessibilityInfo()?.description;
			return sText || "";
		}
	};

	return ImageContent;
});