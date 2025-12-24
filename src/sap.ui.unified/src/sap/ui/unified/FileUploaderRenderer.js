/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.FileUploader
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/unified/FileUploaderHelper"
], function(
	coreLibrary,
	jQuery,
	FileUploaderHelper
) {

	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	/**
	 * FileUploader renderer.
	 *
	 * @namespace
	 * @alias sap.ui.unified.FileUploaderRenderer
	 * @static
	 * @protected
	 */
	var FileUploaderRenderer = {apiVersion: 2};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.unified.FileUploader} oFileUploader An object representation of the control that should be rendered.
	 */
	FileUploaderRenderer.render = function(oRm, oFileUploader) {
		const bEnabled = oFileUploader.getEnabled(),
			oFileUploaderHelper = FileUploaderHelper.getHelper(),
			sWidth = oFileUploader.getWidth(),
			sId = oFileUploader.getId(),
			sPlaceholder = oFileUploader._getEffectivePlaceholder(),
			bButtonOnly = oFileUploader.getButtonOnly(),
			bBrowseIcon = !bButtonOnly && bEnabled,
			bTokenizer = oFileUploader._hasTokenizer();

		oRm.openStart("div", oFileUploader); // Control main div
		oRm.class("sapUiFup");
		oRm.class("sapMInputBase");
		if (!bButtonOnly) {
			oRm.class("sapMInputBaseHeightMargin");

			if (bEnabled) {
				oRm.attr("tabindex", "-1");
			} else {
				oRm.class("sapMInputBaseDisabled");
			}
		}

		// Accessibility states
		this.writeAccessibilityState(oRm, oFileUploader);

		if (sWidth && sWidth !== 'auto') {
			oRm.style("width", sWidth);
		}

		if (oFileUploader.getButtonOnly()) {
			oRm.class("sapUiFupButtonOnly");
		}

		const sClass = oFileUploaderHelper.addFormClass();
		if (sClass) {
			oRm.class(sClass);
		}
		if (!bEnabled) {
			oRm.class("sapUiFupDisabled");
		}
		oRm.openEnd();

		// Content wrapper
		oRm.openStart("div", `${sId}-fu-container`);
		oRm.class("sapMInputBaseContentWrapper");

		// Check disable state
		if (!bEnabled) {
			oRm.class("sapMInputBaseDisabledWrapper");
		}

		if (oFileUploader.getValueState() !== ValueState.None && bEnabled) {
			this.addValueStateClasses(oRm, oFileUploader);
		}

		oRm.openEnd();

		// Form
		oRm.openStart("form", oFileUploader.getId() + "-fu_form");
		oRm.style("display", "inline-block");
		oRm.attr("enctype", "multipart/form-data");
		oRm.attr("method", oFileUploader.getHttpRequestMethod().toLowerCase());
		oRm.attr('action', oFileUploader.getUploadUrl());
		oRm.attr('target', oFileUploader.getId() + '-frame');
		oRm.openEnd();

		// Hidden pure input type file (surrounded by a div which is responsible for giving the input the correct size)
		const sName = oFileUploader.getName() || oFileUploader.getId();
		oRm.openStart("div");
		oRm.class("sapUiFupInputMask");
		oRm.openEnd();
		oRm.voidStart("input");
		oRm.attr("type", "hidden");
		oRm.attr("name", "_charset_");
		oRm.attr("aria-hidden", "true");
		oRm.voidEnd();
		oRm.voidStart("input", oFileUploader.getId() + "-fu_data");
		oRm.attr("type", "hidden");
		oRm.attr("aria-hidden", "true");
		oRm.attr('name', sName + '-data');
		oRm.attr('value', oFileUploader.getAdditionalData() || "");
		oRm.voidEnd();
		jQuery.each(oFileUploader.getParameters(), function(iIndex, oParam) {
			oRm.voidStart("input");
			oRm.attr("type", "hidden");
			oRm.attr("aria-hidden", "true");
			oRm.attr('name', oParam.getName() || "");
			oRm.attr('value', oParam.getValue() || "");
			oRm.voidEnd();
		});
		oRm.close("div");

		oRm.close("form");

		// Visual elements - icons, tokenizer, button, placeholder, labels
		oRm.openStart("div", sId + "-fu-visual"); // Visual elements wrapper
		oRm.class("sapUiFupVisual");
		oRm.openEnd();

		if (bButtonOnly) {
			oRm.renderControl(oFileUploader.oBrowse);
		}

		if (bButtonOnly && oFileUploader._selectedFileNames.length === 0) {
			const sName = oFileUploader.getId() + "-fu-no-file-chosen";
			oRm.openStart("div", sName);
			oRm.class("sapUiPseudoInvisibleText");
			oRm.openEnd();
			oRm.text(oFileUploader._getNoFileChosenText());
			oRm.close("div");
		}

		oRm.openStart("span", oFileUploader.getId() + "-AccDescr");
		oRm.class("sapUiInvisibleText");
		oRm.attr("aria-hidden", "true");
		oRm.openEnd();
		oRm.text(oFileUploader._generateAccDescriptionText());
		oRm.close("span");

		// Placeholder Field
		if (!bButtonOnly && sPlaceholder) {
			const sName = oFileUploader.getId() + "-fu-placeholder"; // Placeholder wrapper
			oRm.openStart("div", sName);
			oRm.class("sapUiFupPlaceholder");
			oRm.openEnd();

			oRm.openStart("div"); // Placeholder text
			if (bTokenizer || bButtonOnly) {
				oRm.class("sapUiPseudoInvisibleText");
			}
			oRm.openEnd();
			oRm.text(sPlaceholder);
			oRm.close("div"); // Placeholder text

			oRm.close("div"); // Placeholder wrapper
		}

		// Tokenizer Field
		if (bTokenizer) {
			oRm.openStart("div");
			oRm.class("sapUiFupTokenizer");
			oRm.openEnd();
			oRm.renderControl(oFileUploader._getTokenizer());
			oRm.close("div");
		}

		// Browse Icon
		if (bBrowseIcon) {
			oRm.openStart("div");
			oRm.class("sapUiFupBrowseIcon");
			oRm.class("sapMInputBaseIcon");
			oRm.attr("tabindex", "-1");
			oRm.openEnd();
			oRm.renderControl(oFileUploader._getBrowseIcon());
			oRm.close("div");
		}

		// Clear Icon
		if (bTokenizer && bEnabled) {
			oRm.openStart("div");
			oRm.class("sapUiFupClearIcon");
			oRm.class("sapMInputBaseIcon");
			oRm.attr("tabindex", "-1");
			oRm.openEnd();
			oRm.renderControl(oFileUploader._getClearIcon());
			oRm.close("div");
		}

		this.renderValueStateAccDom(oRm, oFileUploader);

		oRm.close("div"); // Visual elements wrapper
		oRm.close("div"); // Content wrapper
		oRm.close("div"); // Control main div
	};

	/**
	 * Adds the CSS value state classes to the control's root element using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager used for writing to the render output buffer.
	 * @param {sap.ui.unified.FileUploader} oFileUploader An object representation of the control that should be rendered.
	 */
	FileUploaderRenderer.addValueStateClasses = function(oRm, oFileUploader) {
		oRm.class("sapMInputBaseContentWrapperState");
		oRm.class("sapMInputBaseContentWrapper" + oFileUploader.getValueState());
	};

	/**
	 * Returns the accessibility state of the control.
	 * Hook for the subclasses.
	 *
	 * @protected
	 * @returns {sap.m.InputBaseAccessibilityState} The accessibility state object.
	 */
	FileUploaderRenderer.getAccessibilityState = function() {
		const mAccessibilityState = {};

		mAccessibilityState.labelledby = null;
		mAccessibilityState.describedby = null;
		mAccessibilityState.required = null;

		return mAccessibilityState;
	};

	/**
	 * Writes the accessibility state of the control.
	 * Hook for the subclasses.
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager used for writing to the render output buffer.
	 * @param {sap.m.InputBase} oFileUploader An object representation of the control that should be rendered.
	 */
	FileUploaderRenderer.writeAccessibilityState = function(oRm, oFileUploader) {
		oRm.accessibilityState(oFileUploader, this.getAccessibilityState(oFileUploader));
	};

	/**
	 * Renders the hidden aria-describedby and error message nodes for accessibility.
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager used for writing to the render output buffer.
	 * @param {sap.ui.unified.FileUploader} oFileUploader An object representation of the control that should be rendered.
	 */
	FileUploaderRenderer.renderValueStateAccDom = function(oRm, oFileUploader) {
		const sValueState = oFileUploader.getValueState();

		if (sValueState === ValueState.None || !oFileUploader.getEnabled()) {
			return;
		}

		const sValueStateTypeText = oFileUploader._getValueStateMessageText();

		oRm.openStart("div", oFileUploader.getValueStateMessageId() + "-sr");
		oRm.class("sapUiPseudoInvisibleText");
		oRm.openEnd();
		oRm.text(sValueStateTypeText);
		oRm.close("div");
	};

	return FileUploaderRenderer;

});