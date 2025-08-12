/* globals QUnit */
/* ui5lint-disable prefer-test-starter -- test scenario needs to control the bootstrap */
sap.ui.require([
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeManager"
], (
	Theming
	/** ThemeManager is needed to activate theming*/
) => {
	"use strict";

	sap.ui.loader._.config({
		paths: {
			"testlibs/customCss/lib1" : "../../../../../test-resources/sap/ui/core/qunit/testdata/libraries/customCss/lib1/"
		}
	});

	QUnit.module("ThemeManager - Custom.css without version info");

	QUnit.test("Receive version info from preloaded CSS in case it's not available", function(assert) {
		assert.expect(3);
		const done = assert.async();

		var mExpectedLinkURIs = {
			"sap-ui-theme-sap.ui.core": `/sap/ui/core/themes/sap_hcb/library.css?sap-ui-dist-version=0.0.0`, // Fallback to sap_hcb for core lib because of theme metadata
			"sap-ui-theme-testlibs.customCss.lib1": "/libraries/customCss/lib1/themes/customTheme/library.css?sap-ui-dist-version=1.2.3"
		};
		var checkLoadedCss = function () {
			var aAllThemeLinksForLibs = document.querySelectorAll("link[id^=sap-ui-theme]");
			var aCustomCssLink = document.querySelectorAll("link[id=sap-ui-core-customcss]");
			aAllThemeLinksForLibs.forEach(function ($link) {
				// Depending on order of test execution there could be more link tags as expected by this test
				// Only do asserts here for the expected link tags and check for complete test execution by assert.expect
				if (mExpectedLinkURIs[$link.id]) {
					assert.ok($link.getAttribute("href").endsWith(mExpectedLinkURIs[$link.id]), "URI of library.css link tag is correct");
				}
			});
			assert.ok(aCustomCssLink[0].getAttribute("href")
				.endsWith(`/libraries/customCss/sap/ui/core/themes/customTheme/custom.css?version=0.0.0&sap-ui-dist-version=0.0.0`), "URI of custom.css link tag is correct and contains derived version");

			done();
		};
		Theming.setTheme("customTheme");

		Theming.attachAppliedOnce(checkLoadedCss);
	});
});
