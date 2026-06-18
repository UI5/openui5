/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	var MenuRenderer = {
		apiVersion: 2
	};

	MenuRenderer.render = function (oRm, oMenu) {
		oRm.openStart("div", oMenu);
		oRm.class("sapMTCMenu");
		oRm.openEnd();

		const bHasQuickActions = oMenu._getAllEffectiveQuickActions().length > 0;
		const bHasItems = oMenu._getAllEffectiveItems().length > 0;

		if (bHasQuickActions) {
			this.renderQuickActions(oRm, oMenu, bHasItems);
		}

		if (bHasItems) {
			this.renderItems(oRm, oMenu, bHasQuickActions);
		}

		if (!bHasQuickActions && !bHasItems) {
			oRm.renderControl(oMenu._oIllustratedMessage);
		}

		oRm.close("div");
	};

	MenuRenderer.renderQuickActions = function (oRm, oMenu, bHasItems) {
		oRm.openStart("div");
		if (oMenu._oItemsContainer) {
			if (oMenu._oItemsContainer.getCurrentViewKey() === "$default") {
				oRm.class("sapMTCMenuQAList");
			} else {
				oRm.class("sapMTCMenuQAListHidden");
			}
			if (bHasItems) {
				oRm.attr("role", "region");
				oRm.attr("aria-label", oMenu._getResourceText("table.COLUMNMENU_QUICK_ACTIONS_REGION_LABEL"));
			}
		} else {
			oRm.class("sapMTCMenuQAList");
		}
		oRm.openEnd();

		oRm.renderControl(oMenu._oQuickSortList);
		oRm.renderControl(oMenu._oQuickFilterList);
		oRm.renderControl(oMenu._oQuickGroupList);
		oRm.renderControl(oMenu._oQuickAggregateList);
		oRm.renderControl(oMenu._oQuickGenericList);

		oRm.close("div");
	};

	MenuRenderer.renderItems = function (oRm, oMenu, bHasQuickActions) {
		oRm.openStart("div");
		oRm.class("sapMTCMenuContainerWrapper");
		if (bHasQuickActions) {
			oRm.attr("role", "region");
			oRm.attr("aria-label", oMenu._getResourceText("table.COLUMNMENU_ITEMS_REGION_LABEL"));
		}
		oRm.openEnd();
		oRm.renderControl(oMenu._oItemsContainer);
		oRm.close("div");
	};

	return MenuRenderer;
});