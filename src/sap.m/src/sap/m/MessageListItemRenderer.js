/*!
 * ${copyright}
 */
sap.ui.define(["./StandardListItemRenderer", "sap/ui/core/Renderer"], function (StandardListItemRenderer, Renderer) {
	"use strict";


	/**
	 * MessageListItem renderer.
	 * @namespace
	 */
	var MessageListItemRenderer = Renderer.extend(StandardListItemRenderer);
	MessageListItemRenderer.apiVersion = 2;

	MessageListItemRenderer.renderTitle = function (oRm, oControl) {
		if (oControl.getActiveTitle()) {
			oRm.renderControl(oControl.getLink());
			oRm.renderControl(oControl.getLinkAriaDescribedBy());
		} else {
			StandardListItemRenderer.renderTitle.apply(this, arguments);
		}
	};

	/**
	 * Overrides the base method to add aria-describedby for valueState
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager
	 * @param {sap.m.MessageListItem} oLI The list item
	 * @returns {string|undefined} The aria-describedby IDs
	 * @protected
	 */
	MessageListItemRenderer.getAriaDescribedBy = function(oLI) {
		var sAriaDescribedBy = StandardListItemRenderer.getAriaDescribedBy.apply(this, arguments);
		var oValueStateText = oLI.getValueStateAriaDescribedBy();

		if (oValueStateText) {
			sAriaDescribedBy = sAriaDescribedBy ? sAriaDescribedBy + " " + oValueStateText.getId() : oValueStateText.getId();
		}

		return sAriaDescribedBy;
	};

	/**
	 * Renders the valueState InvisibleText
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager
	 * @param {sap.m.MessageListItem} oLI The list item
	 * @protected
	 */
	MessageListItemRenderer.renderLIContent = function(oRm, oLI) {
		StandardListItemRenderer.renderLIContent.apply(this, arguments);

		// Render the valueStateAriaDescribedBy InvisibleText
		var oValueStateText = oLI.getValueStateAriaDescribedBy();
		if (oValueStateText) {
			oRm.renderControl(oValueStateText);
		}
	};

	MessageListItemRenderer.renderTitleWrapper = function(rm, oLI) {

		var	sTitle = oLI.getTitle(),
			sDescription = oLI.getDescription(),
			sInfo = oLI.getInfo(),
			bWrapping = oLI.getWrapping(),
			bActiveTitle = oLI.getActiveTitle(),
			bShouldRenderInfoWithoutTitle = !sTitle && sInfo;

		rm.openStart("div");

		if (!bShouldRenderInfoWithoutTitle && sDescription) {
			rm.class("sapMSLITitle");
		} else {
			rm.class("sapMSLITitleOnly");
		}
		rm.openEnd();

		if (bWrapping && !bActiveTitle) {
			this.renderWrapping(rm, oLI, "title");
			if (sInfo && !sDescription) {
				this.renderInfo(rm, oLI);
			}
		} else {
			this.renderTitle(rm, oLI);
		}

		rm.close("div");

		if (sInfo && !sDescription && !bWrapping && !bShouldRenderInfoWithoutTitle) {
			this.renderInfo(rm, oLI);
		}
	};

	return MessageListItemRenderer;

});
