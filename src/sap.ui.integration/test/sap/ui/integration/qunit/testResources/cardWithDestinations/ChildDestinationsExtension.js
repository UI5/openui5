sap.ui.define([
	"sap/ui/integration/Extension"
], (Extension) => {
	"use strict";

	return Extension.extend("test.sap.ui.integration.qunit.testResources.cardWithDestinations.ChildDestinationsExtension", {
		getDataUsingDestinationsInRequest() {
			return this.getCard().request({
				url: `{{mainDestinations.contentDestination}}/header.json`
			});
		},

		async getDataUsingResolveDestination() {
			const sUrl = await this.getCard().resolveDestination("contentDestination");

			return this.getCard().request({
				url: `${sUrl}/header.json`
			});
		}
	});
});