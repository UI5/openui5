/*!
* ${copyright}
*/

sap.ui.define([
	'sap/ui/core/IconPool',
	"sap/ui/core/Lib"
], function(
	IconPool,
	Library
) {
	"use strict";

	/**
	 * MessageStrip utilities.
	 * @namespace
	 */
	var MessageStripUtilities = {};

	MessageStripUtilities.MESSAGES = {
		TYPE_NOT_SUPPORTED: "Value 'module:sap/ui/core/message/MessageType.None' for property 'type' is not supported. " +
		"Defaulting to 'module:sap/ui/core/message/MessageType.Information'"
	};

	MessageStripUtilities.CLASSES = {
		ROOT: "sapMMsgStrip",
		ICON: "sapMMsgStripIcon",
		MESSAGE: "sapMMsgStripMessage",
		CLOSE_BUTTON: "sapMMsgStripCloseButton",
		CLOSING_TRANSITION: "sapMMsgStripClosing"
	};

	MessageStripUtilities.ATTRIBUTES = {
		CLOSABLE: "data-sap-ui-ms-closable"
	};

	MessageStripUtilities.RESOURCE_BUNDLE = Library.getResourceBundleFor("sap.m");

	/**
	 * Calculate the icon uri that should be set to the control property.
	 * Custom icons are allowed for all message types.
	 * If no custom icon is specified a default one is used.
	 * is defined by the control type.
	 * @private
	 * @returns {string} the icon uri that should be set to the control property
	 */
	MessageStripUtilities.getIconURI = function () {
		var sType = this.getType(),
			sCustomIconURI = this.getCustomIcon(),
			sIconURI;

		var oIconsMapping = {
			"Error": "error",
			"Warning": "alert",
			"Success": "sys-enter-2",
			"Information": "information"
		};

		sIconURI = IconPool.getIconURI(oIconsMapping[sType]);

		return sCustomIconURI || sIconURI;
	};

	MessageStripUtilities.getAriaTypeText = function () {
		var sBundleKey = "MESSAGE_STRIP_" + this.getType().toUpperCase(),
			sAriaText = MessageStripUtilities.RESOURCE_BUNDLE.getText(sBundleKey);

		if (this.getShowCloseButton()) {
			sAriaText += " " + MessageStripUtilities.RESOURCE_BUNDLE.getText("MESSAGE_STRIP_CLOSABLE");
		}

		return sAriaText;
	};

	MessageStripUtilities.isMSCloseButtonPressed = function (oTarget) {
		return oTarget.className.indexOf(MessageStripUtilities.CLASSES.CLOSE_BUTTON) !== -1 ||
			oTarget.parentNode.className.indexOf(MessageStripUtilities.CLASSES.CLOSE_BUTTON) !== -1;
	};

	MessageStripUtilities.closeTransitionWithCSS = function (fnCallback) {
		this.$().addClass(MessageStripUtilities.CLASSES.CLOSING_TRANSITION)
				.one("webkitTransitionEnd transitionend", fnCallback);
	};

	MessageStripUtilities.getAccessibilityState = function () {
		return {
			role: "note"
		};
	};

	/**
	 * Converts an icon URI to an inline icon HTML string for use in <code>sap.m.MessageStrip</code> formatted text.
	 *
	 * This is a helper function to make it easier to add inline icons to message text without
	 * having to write Unicode characters directly. The function uses IconPool to resolve the
	 * icon URI to its Unicode representation and wraps it in an appropriately styled span element.
	 *
	 * @param {sap.ui.core.URI} sIconURI Icon URI (e.g. "sap-icon://alert", "sap-icon://message-success")
	 * @returns {string} HTML string with inline icon span, or empty string if the icon is not found
	 * @static
	 * @public
	 * @since 1.148
	 */
	MessageStripUtilities.getInlineIcon = function (sIconURI) {
		var oIconInfo = IconPool.getIconInfo(sIconURI);
		if (oIconInfo && oIconInfo.content) {
			return "<span class='sapMMsgStripInlineIcon'>" + oIconInfo.content + "</span>";
		}
		// If icon not found, return empty string
		return "";
	};

	return MessageStripUtilities;
});
