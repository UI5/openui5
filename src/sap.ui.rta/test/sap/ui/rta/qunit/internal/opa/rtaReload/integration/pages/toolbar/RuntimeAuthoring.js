sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function(
	Opa5,
	Press
) {
	"use strict";

	Opa5.createPageObjects({
		onTheRTAToolbar: {
			actions: {
				iClickOnTheExitButton() {
					window.reloaded = false;
					return this.waitFor({
						id: "sapUIRta_toolbar_fragment--sapUiRta_exit",
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iRightClickOnTheVariantManagementButton() {
					return this.waitFor({
						id: "variantManagementContained",
						viewName: "sap.ui.rta.rtaReload.Page",
						actions: new Press({
							altKey: true
						})
					});
				},
				iClickOnAnElementOverlay(sId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sId;
						},
						errorMessage: "Did not find the Element Overlay",
						actions: new Press()
					});
				},
				iClickOnVariantManagementMenuItem(sMenuText) {
					return this.waitFor({
						controlType: "sap.m.MenuItem",
						properties: {
							text: sMenuText
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iPressTheSaveDraftButton() {
					return this.waitFor({
						id: "sapUIRta_toolbar_fragment--sapUiRta_save-img",
						searchOpenDialogs: true,
						actions: new Press()
					});
				}
			},
			assertions: {
				iShouldSeeTheToolbar() {
					return this.waitFor({
						id: "sapUIRta_toolbar",
						searchOpenDialogs: true,
						success() {
							Opa5.assert.ok(true, "I see the rta toolbar");
						}
					});
				}
			}
		}
	});
});

