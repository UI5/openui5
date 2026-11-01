/*global QUnit*/
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"./UsageTrackerTestHelpers"
], function (Opa5, opaTest, Helpers) {
	"use strict";

	var iNavigateTo = Helpers.iNavigateTo;
	var waitForDataLayer = Helpers.waitForDataLayer;
	var getDataLayer = Helpers.getDataLayer;

	// ─── module ───────────────────────────────────────────────────────────────────

	QUnit.module("UsageTracker Journey");

	// ─── deep-link tests ─────────────────────────────────────────────────────────

	opaTest("Tracks existing page on initial load", function (Given, When, Then) {
		Given.iStartMyAppWithUsageTracking("api/sap.base");

		Then.waitFor(waitForDataLayer(3, "stBeaconReady", "3 entries after ApiDetail first load"));
		Then.waitFor({
			success: function () {
				var aDL = getDataLayer();
				Opa5.assert.strictEqual(aDL[0].event, "globalDL", "first entry is globalDL");
				Opa5.assert.strictEqual(aDL[1].event, "pageView", "second entry is pageView");
				Opa5.assert.strictEqual(aDL[1].page.section, "apiReference", "section is apiReference");
				Opa5.assert.strictEqual(aDL[2].event, "stBeaconReady", "third entry is stBeaconReady");
				Opa5.assert.strictEqual(
					aDL.filter(function (e) { return e.event === "pageView"; }).length,
					1, "exactly 1 pageView — no duplicates");
			},
			errorMessage: "ApiDetail first-load data layer structure incorrect"
		});
		Then.iTeardownMyApp();
	});

	opaTest("Tracks non-existing page on initial load", function (Given, When, Then) {
		Given.iStartMyAppWithUsageTracking("api/sap.base1");

		// 3 entries: globalDL + errorPage + stBeaconReady
		Then.waitFor(waitForDataLayer(3, "stBeaconReady", "3 entries after deep-link not-found"));
		Then.waitFor({
			success: function () {
				var aDL = getDataLayer();
				Opa5.assert.strictEqual(aDL[1].event, "errorPage", "second entry is errorPage");
				Opa5.assert.strictEqual(aDL[1].error.type, 404, "error type is 404");
				Opa5.assert.strictEqual(
					aDL.filter(function (e) { return e.event === "pageView"; }).length,
					0, "0 pageViews for not-found deep link");
			},
			errorMessage: "3.1 deep-link not-found data layer structure incorrect"
		});
	});

	opaTest("Tracks navigation to existing page", function (Given, When, Then) {
		When.waitFor(iNavigateTo("api/sap.base"));

		Then.waitFor(waitForDataLayer(5, "stBeaconReady", "5 entries after ApiDetail first load"));
		Then.waitFor({
			success: function () {
				var aDL = getDataLayer();
				Opa5.assert.strictEqual(aDL[3].event, "pageView", "fourth entry is pageView");
				Opa5.assert.strictEqual(aDL[3].page.section, "apiReference", "section is apiReference");
				Opa5.assert.strictEqual(aDL[4].event, "stBeaconReady", "fifth entry is stBeaconReady");
				Opa5.assert.strictEqual(
					aDL.filter(function (e) { return e.event === "pageView"; }).length,
					1, "exactly 1 pageView — no duplicates");
			},
			errorMessage: "ApiDetail first-load data layer structure incorrect"
		});
	});

	opaTest("Tracks next navigation to member anchor", function (Given, When, Then) {
		// Navigate to a member anchor of the same symbol — triggers the early-return path
		When.waitFor(iNavigateTo("api/sap.base/methods/Summary"));

		// Expect 2 pageViews: globalDL + pv1 + beacon + pv2 + beacon = 7 entries
		Then.waitFor(waitForDataLayer(7, "stBeaconReady", "7 entries after ApiDetail revisit"));
		Then.waitFor({
			success: function () {
				var aDL = getDataLayer();
				var aPageViews = aDL.filter(function (e) { return e.event === "pageView"; });
				Opa5.assert.strictEqual(aPageViews.length, 2, "2 pageViews: first load + revisit");
				Opa5.assert.ok(aPageViews[1].page.referrer, "revisit has a referrer");
				Opa5.assert.notStrictEqual(aPageViews[1].page.referrer, "", "revisit referrer is not empty");
			},
			errorMessage: "ApiDetail revisit data layer structure incorrect"
		});
	});

	// Tracks navigation to non-existing page
	opaTest("Tracks navigation to non-existing page", function (Given, When, Then) {
		When.waitFor(iNavigateTo("api/sap.base1"));

		// 3 entries: globalDL + errorPage + stBeaconReady
		Then.waitFor(waitForDataLayer(9, "stBeaconReady", "9 entries after ApiDetail not-found"));
		Then.waitFor({
			success: function () {
				var aDL = getDataLayer();
				Opa5.assert.strictEqual(aDL[7].event, "errorPage", "second entry is errorPage (not pageView)");
				Opa5.assert.strictEqual(aDL[7].error.type, 404, "error type is 404");
				Opa5.assert.strictEqual(aDL[7].error.description, "page data not found", "description is 'page data not found'");
			},
			errorMessage: "ApiDetail not-found data layer structure incorrect"
		});
		Then.iTeardownMyApp();
	});

	opaTest("Tracks non-existing topic on initial load", function (Given, When, Then) {
		Given.iStartMyAppWithUsageTracking("topic/non-existing-topic");

		Then.waitFor(waitForDataLayer(3, "stBeaconReady", "3 entries after TopicDetail first load"));
		Then.waitFor({
			success: function () {
				var aDL = getDataLayer();
				Opa5.assert.strictEqual(aDL[1].event, "errorPage", "second entry is errorPage");
				Opa5.assert.strictEqual(aDL[1].error.type, 404, "error type is 404");
				Opa5.assert.strictEqual(
					aDL.filter(function (e) { return e.event === "pageView"; }).length,
					0, "0 pageViews for not-found deep link");
			},
			errorMessage: "TopicDetail first-load data layer structure incorrect"
		});
		Then.iTeardownMyApp();
	});
});
