/* global QUnit */
sap.ui.define([
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/thirdparty/sinon-4",
	"./pages/AppPage",
	"./pages/toolbar/RuntimeAuthoring",
	"test-resources/sap/ui/fl/testutils/opa/TestLibrary"
], (
	StorageUtils,
	opaTest,
	Opa5,
	sinon
) => {
	"use strict";

	const sAppId = "sap.ui.rta.rtaReload";
	const sandbox = sinon.createSandbox();

	const _oBaseFlexInfoSession = {
		adaptationId: "DEFAULT",
		adaptationTitle: "Default adaptation"
	};

	const oFlexDataObjectWithRoleSpecificReloadReason = {
		...StorageUtils.getEmptyFlexDataResponse(),
		info: {
			..._oBaseFlexInfoSession,
			allContextsProvided: false,
			isEndUserAdaptation: true
		}
	};

	const oFlexDataObjectWithoutReloadReason = {
		...StorageUtils.getEmptyFlexDataResponse(),
		info: {
			..._oBaseFlexInfoSession,
			allContextsProvided: true,
			isEndUserAdaptation: true
		}
	};

	const oExpectedFlexInfoSession = {
		keyUser: {
			noReloadReason: {
				..._oBaseFlexInfoSession,
				adaptationLayer: "CUSTOMER",
				allContextsProvided: true,
				initialAllContexts: false,
				isEndUserAdaptation: true
			},
			roleSpecificReloadReason: {
				..._oBaseFlexInfoSession,
				adaptationLayer: "CUSTOMER",
				allContextsProvided: false,
				initialAllContexts: true,
				isEndUserAdaptation: true
			}
		},
		endUser: {
			empty: {},
			noReloadReason: {
				..._oBaseFlexInfoSession,
				allContextsProvided: true,
				isEndUserAdaptation: true
			},
			draftReloadReason: {
				..._oBaseFlexInfoSession,
				allContextsProvided: true,
				isEndUserAdaptation: true
			},
			roleSpecificReloadReason: {
				..._oBaseFlexInfoSession,
				allContextsProvided: false,
				isEndUserAdaptation: true
			}
		}
	};

	const sContainedVMControlId = "RTAReloadContainer---rtaReload--variantManagementOrdersTable";
	const sNewContainedVariantName = "New Contained VM Variant";

	const sRoleSpecificReloadReason = "Role-specific views are available for this app. The app is reloading with these views.";
	const sWillReloadWithoutDraftChangesReloadReason = "The app will now reload without the draft changes.";
	const sDraftChangesAvailableReloadReason = "Draft changes are available for this app. The app is reloading with these changes.";

	const oArrangements = new Opa5({
		iStartMyApp(oFlexDataResponses, bClearStorages = false) {
			this.waitFor({
				async success() {
					await this.iStartMyAppInAFrame("test-resources/sap/ui/rta/qunit/internal/opa/rtaReload/index.html");
					const oFrameWindow = Opa5.getWindow();
					const oFrameStorage = oFrameWindow.sap.ui.require("sap/ui/fl/initial/_internal/Storage");
					this.oLoadFlexDataStub = sandbox.stub(oFrameStorage, "loadFlexData");
					this.oLoadFlexDataStub.resolves(oFlexDataResponses || oFlexDataObjectWithRoleSpecificReloadReason);
					this.getContext().oLoadFlexDataStub = this.oLoadFlexDataStub;
					if (bClearStorages) {
						oFrameWindow.sessionStorage.clear();
						oFrameWindow.localStorage.clear();
					}
					await oFrameWindow.startUp();
				}
			});
		}
	});

	Opa5.extendConfig({
		arrangements: oArrangements,
		autoWait: true
	});

	QUnit.module("RTAReloadJourney");
	opaTest("I open the App, start RTA with reload reason and check that the session storage is correctly filled", (Given, When, Then) => {
		Given.iStartMyApp(oFlexDataObjectWithRoleSpecificReloadReason, true);
		Then.onTheTestApp.iShouldSeeTheAdaptUIButton()
		.and.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.endUser.roleSpecificReloadReason)
		.and.iExpectFlexDataRequestCallCount(1);

		When.onTheTestApp.iClickOnTheAdaptUIButton();
		Then.onTheTestApp.iShouldSeeTheDialogWithReloadReason(sRoleSpecificReloadReason);
		When.onTheTestApp.iClickOnTheOKButton();

		Then.onTheRTAToolbar.iShouldSeeTheToolbar();
		Then.onTheTestApp.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.keyUser.roleSpecificReloadReason)
		.and.aReloadShouldHaveHappened()
		.and.iExpectFlexDataRequestCallCount(2);
	});

	opaTest("I reload the app and check that session storage is correctly filled", (Given, _, Then) => {
		// By tearing down and starting the app again, we simulate a reload of the app while being in RTA
		// This is done to avoid dealing with iframe reloads in OPA which can be flaky
		Given.iTeardownMyApp();
		Given.iStartMyApp(oFlexDataObjectWithRoleSpecificReloadReason);

		Then.onTheTestApp.iShouldSeeThePageTitle()
		.and.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.endUser.roleSpecificReloadReason)
		.and.iExpectFlexDataRequestCallCount(1);
		Given.iTeardownMyApp();
	});

	opaTest("I start RTA without reload reason, leave RTA via the exit button and then check that " +
		"session storage is correctly filled", (Given, When, Then) => {
		Given.iStartMyApp(oFlexDataObjectWithoutReloadReason, true);
		Then.onTheTestApp.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.endUser.noReloadReason)
		.and.iExpectFlexDataRequestCallCount(1);

		When.onTheTestApp.iClickOnTheAdaptUIButton();
		Then.onTheTestApp.iShouldNotSeeTheDialogWithReloadReason()
		.and.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.keyUser.noReloadReason)
		.and.noReloadShouldHaveHappened()
		.and.iExpectFlexDataRequestCallCount(1);
		Then.onTheRTAToolbar.iShouldSeeTheToolbar();

		When.onTheRTAToolbar.iClickOnTheExitButton();
		Then.onTheTestApp.iShouldNotSeeTheRTAToolbar()
		.and.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.endUser.empty)
		.and.noReloadShouldHaveHappened()
		.and.iExpectFlexDataRequestCallCount(1);
		Given.iTeardownMyApp();
	});

	opaTest("I start RTA without reload reason, create a draft, leave RTA via the exit button and check " +
		"that session storage is correctly filled", (Given, When, Then) => {
		Given.iStartMyApp(oFlexDataObjectWithoutReloadReason, true);
		Then.onTheTestApp.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.endUser.noReloadReason)
		.and.iExpectFlexDataRequestCallCount(1);

		When.onTheTestApp.iClickOnTheAdaptUIButton();
		Then.onTheTestApp.iShouldNotSeeTheDialogWithReloadReason()
		.and.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.keyUser.noReloadReason)
		.and.noReloadShouldHaveHappened()
		.and.iExpectFlexDataRequestCallCount(1);
		Then.onTheRTAToolbar.iShouldSeeTheToolbar();

		When.onTheRTAToolbar.iClickOnAnElementOverlay(sContainedVMControlId);
		When.onTheRTAToolbar.iClickOnVariantManagementMenuItem("Save View As");

		When.onFlVariantManagement.iCreateNewVariant(sContainedVMControlId, sNewContainedVariantName, true);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sContainedVMControlId, sNewContainedVariantName)
		.and.theModifiedIndicatorShouldBeHidden();
		When.onTheRTAToolbar.iPressTheSaveDraftButton();

		When.onTheRTAToolbar.iClickOnTheExitButton();
		Then.onTheTestApp.iShouldSeeTheDialogWithReloadReason(sWillReloadWithoutDraftChangesReloadReason);
		When.onTheTestApp.iClickOnTheOKButton();
		Then.onTheTestApp.iShouldSeeTheAdaptUIButton();
		Then.onTheTestApp.iShouldSeeTheExpectedFlexInfoSessionStorage(sAppId, oExpectedFlexInfoSession.endUser.draftReloadReason)
		.and.iExpectFlexDataRequestCallCount(3)
		.and.aReloadShouldHaveHappened();

		When.onTheTestApp.iClickOnTheAdaptUIButton();
		Then.onTheTestApp.iShouldSeeTheDialogWithReloadReason(sDraftChangesAvailableReloadReason);
		When.onTheTestApp.iClickOnTheOKButton();
		Then.onTheRTAToolbar.iShouldSeeTheToolbar();
		Then.onTheTestApp.aReloadShouldHaveHappened()
		.and.iExpectFlexDataRequestCallCount(4);

		Given.iTeardownMyApp();
	});
});