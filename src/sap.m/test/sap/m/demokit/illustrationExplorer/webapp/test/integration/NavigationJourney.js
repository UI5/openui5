/* global QUnit */

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/App"
], (opaTest) => {
    "use strict";

    QUnit.module("Functionality");

    opaTest("Should see the initial page of the app", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Assertions
        Then.onTheAppPage.iShouldSeeTheApp();

        // Cleanup
        Then.iTeardownMyApp();
    });

    opaTest("Should see the illustration details content", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Actions
        When.onTheAppPage.iPressOnAnIllustration();

        // Assertions
        Then.onTheAppPage.iShouldSeeTheIllustrationDetails()
            .and.iShouldSeeItemsInIllustrationDetails();

        // Cleanup
        Then.iTeardownMyApp();
    });

    opaTest("Should see the same illustration type and set in side content", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Actions
        When.onTheAppPage.iPressOnAnIllustration();

        // Assertions
        Then.onTheAppPage.iShouldSeeTheIllustrationDetails()
            .and.iShouldSeeItemsInIllustrationDetails()
            .and.iShouldSeeIllustrationInSideContent();

        // Cleanup
        Then.iTeardownMyApp();
    });

    opaTest("Should see the ObjectStatus populated in illustration details", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Actions
        When.onTheAppPage.iPressOnAnIllustration();

        // Assertions
        Then.onTheAppPage.iShouldSeeTheIllustrationDetails()
            .and.iShouldSeeItemsInIllustrationDetails()
            .and.iShouldSeeObjectStatusPopulated();

        // Cleanup
        Then.iTeardownMyApp();
    });

    opaTest("Should filter illustrations based on search input", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Actions
        When.onTheAppPage.iSearchForIllustration("NoData");

        // Assertions
        Then.onTheAppPage.iShouldSeeFilteredIllustrations("NoData");

        // Cleanup
        Then.iTeardownMyApp();
    });

    opaTest("Should change the illustration size and see updated illustrations", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Actions
        When.onTheAppPage.iSelectIllustrationSize("Medium");

        // Assertions
        Then.onTheAppPage.iShouldSeeIllustrationsWithSize("Dialog");

        // Cleanup
        Then.iTeardownMyApp();
    });

    opaTest("Should change the illustration set and see updated illustrations", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Actions
        When.onTheAppPage.iSelectIllustrationSet("tnt");

        // Assertions
        Then.onTheAppPage.iShouldSeeIllustrationsFromSet("tnt");

        // Cleanup
        Then.iTeardownMyApp();
    });

    opaTest("Should show and then hide deprecated illustrations", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Actions
        When.onTheAppPage.iShowDeprecatedIllustrations();

        // Assertions
        Then.onTheAppPage.iShouldSeeDeprecatedIllustrations();

        // Actions
        When.onTheAppPage.iHideDeprecatedIllustrations();

        // Assertions
        Then.onTheAppPage.iShouldNotSeeDeprecatedIllustrations();

        // Cleanup
        Then.iTeardownMyApp();
    });
});