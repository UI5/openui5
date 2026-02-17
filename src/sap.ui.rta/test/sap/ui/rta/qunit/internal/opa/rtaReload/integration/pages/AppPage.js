sap.ui.define([
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function(
	FlexInfoSession,
	Opa5,
	Press
) {
	"use strict";

	Opa5.createPageObjects({
		onTheTestApp: {
			actions: {
				iClickOnTheAdaptUIButton() {
					window.reloaded = false;
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "sap.ui.rta.rtaReload.Page",
						bindingPath: {
							path: "",
							propertyPath: "/showAdaptButton",
							modelName: "app"
						},
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iClickOnTheOKButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							text: "OK"
						},
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				}
			},
			assertions: {
				iShouldSeeTheAdaptUIButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "sap.ui.rta.rtaReload.Page",
						bindingPath: {
							path: "",
							propertyPath: "/showAdaptButton",
							modelName: "app"
						},
						success() {
							Opa5.assert.ok(true, "The Adapt UI Button is visible");
						}
					});
				},
				iShouldSeeTheDialogWithReloadReason(sText) {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						searchOpenDialogs: true,
						matchers(oDialog) {
							return oDialog.getContent().some(function(oContent) {
								return oContent.getText && oContent.getText() === sText;
							});
						},
						success() {
							Opa5.assert.ok(true, `Dialog with text '${sText}' is visible`);
						}
					});
				},
				iShouldNotSeeTheDialogWithReloadReason() {
					return this.waitFor({
						success() {
							const oFrameWindow = Opa5.getWindow();
							const aDialogs = oFrameWindow.document.getElementsByClassName("sapMDialog");
							const bExists = aDialogs.length > 0;
							Opa5.assert.deepEqual(bExists, false, "The dialog with reload reason is not visible");
						},
						errorMessage: "The dialog with reload reason is visible"
					});
				},
				iShouldSeeThePageTitle() {
					return this.waitFor({
						controlType: "sap.m.Title",
						properties: {
							text: "RTA Reload"
						},
						success() {
							Opa5.assert.ok(true, "The App Page is visible");
						}
					});
				},
				iShouldNotSeeTheRTAToolbar() {
					return this.waitFor({
						success() {
							const oFrameWindow = Opa5.getWindow();
							const bExists = !!oFrameWindow.document.getElementById("sapUIRta_toolbar");
							Opa5.assert.ok(!bExists, "The RTA Toolbar does not exist");
						}
					});
				},
				iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSessionStorage = {}) {
					return this.waitFor({
						success() {
							const sessionStorage = FlexInfoSession.getByReference(sAppId);
							Opa5.assert.deepEqual(sessionStorage, oExpectedFlexInfoSessionStorage, "The session storage is as expected");
						}
					});
				},
				iExpectFlexDataRequestCallCount(iExpectedCount) {
					return this.waitFor({
						success() {
							const iFlexDataCallCount = this.getContext().oLoadFlexDataStub.callCount;
							Opa5.assert.strictEqual(iFlexDataCallCount, iExpectedCount, `loadFlexData was called ${iExpectedCount} times`);
						}
					});
				},
				noReloadShouldHaveHappened() {
					return this.waitFor({
						success() {
							Opa5.assert.ok(!Opa5.getWindow().reloaded, "No reload has happened");
						}
					});
				},
				aReloadShouldHaveHappened() {
					return this.waitFor({
						success() {
							Opa5.assert.ok(Opa5.getWindow().reloaded, "A reload has happened");
						}
					});
				}
			}
		}
	});
});

