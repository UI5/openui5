sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.TokenizerMultiLine.C", {
		onTokenDelete: function (oEvent) {
			var aDeletedTokens = oEvent.getParameter("tokens");
			var oTokenizer = this.getView().byId("tokenizerMultiLine");

			aDeletedTokens.forEach(function (oToken) {
				oTokenizer.removeToken(oToken);
			});
		}
	});
});