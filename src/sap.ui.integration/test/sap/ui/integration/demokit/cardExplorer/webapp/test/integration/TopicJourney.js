/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/NavigationList",
	"./pages/ToolHeader",
	"./pages/Learn"
], (opaTest) => {
	"use strict";

	QUnit.module("Topic page boot.js");

	opaTest("Opacity should be restored after topic loads", (Given, When, Then) => {
		Given.iStartMyApp({ hash: "learn/headers" });

		Then.onTheLearnPage.iShouldSeeOpacityRestored();
	});

	opaTest("highlight.js should be loaded in the topic iframe", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeHighlightJs();
	});

	opaTest("codesample.js should be loaded in the topic iframe", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeCodesample();
	});

	opaTest("resolveTargetRoot should be exposed on the iframe window", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeResolveTargetRoot();
	});

	opaTest("resolveTargetRoot — standard /test-resources at root", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeResolveTargetRootResult(
			"/test-resources/sap/ui/integration/demokit/cardExplorer/webapp/index.html",
			"http://localhost:8080",
			"http://localhost:8080",
			"Root is extracted correctly when /test-resources is at the start"
		);
	});

	opaTest("resolveTargetRoot — prefix before /test-resources", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeResolveTargetRootResult(
			"/proxy/prefix/test-resources/sap/ui/integration/demokit/cardExplorer/webapp/index.html",
			"http://localhost:8080",
			"http://localhost:8080/proxy/prefix",
			"Prefix before /test-resources is preserved"
		);
	});

	opaTest("resolveTargetRoot — deep nested prefix", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeResolveTargetRootResult(
			"/a/b/c/test-resources/sap/m/demokit/accessibilityGuide/webapp/index.html",
			"https://example.com",
			"https://example.com/a/b/c",
			"Multiple path segments before /test-resources are preserved"
		);
	});

	opaTest("resolveTargetRoot — fallback when /test-resources is absent", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeResolveTargetRootResult(
			"/some/other/path/index.html",
			"http://localhost:8080",
			"http://localhost:8080",
			"Falls back to origin when /test-resources is not found"
		);
	});

	opaTest("resolveTargetRoot — only the first /test-resources occurrence matters", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeResolveTargetRootResult(
			"/prefix/test-resources/nested/test-resources/deep",
			"http://localhost:8080",
			"http://localhost:8080/prefix",
			"Only the first /test-resources is used for splitting"
		);
	});

	opaTest("resolveTargetRoot — percent-encoded dash does not match", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeResolveTargetRootResult(
			"/test%2Dresources/sap/ui/integration/demokit/cardExplorer/webapp/index.html",
			"http://localhost:8080",
			"http://localhost:8080",
			"Percent-encoded dash in pathname does not match /test-resources"
		);
	});

	opaTest("Topic stylesheets should be loaded in the iframe head", (Given, When, Then) => {
		Then.onTheLearnPage.iShouldSeeTopicStylesheets();

		Then.iTeardownMyApp();
	});
});
