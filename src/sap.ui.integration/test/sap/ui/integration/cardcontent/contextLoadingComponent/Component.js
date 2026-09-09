sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("contextLoadingComponent.Component", {
		metadata: {
			manifest: "json"
		},
		onCardReady: function (oCard) {
			this.card = oCard;
		}
	});
});
