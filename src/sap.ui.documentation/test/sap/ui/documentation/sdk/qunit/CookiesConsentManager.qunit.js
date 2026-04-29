/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/CookiesConsentManager"],
function (CookiesConsentManager) {
	"use strict";

	var oFactory = (function () {
		return {
			getAdditionalPreferencesPerDomain: function (oOptions) {
				var bFirstPartyCookiesEnabled = !!oOptions.firstPartyCookiesEnabled,
					bUsageTrackingCookiesEnabled = !!oOptions.usageTrackingCookiesEnabled,
					bVideoContentCookiesEnabled = !!oOptions.usageVideoContentCookiesEnabled,
					bOtherThirdPartyCookiesEnabled = !!oOptions.otherThirdPartyCookiesEnabled,
					oPreferences = {
						"6sc.co": "0",
						"6sense.com": "0",
						"b.6sc.co": "0",
						"demdex.net": "0",
						"dpm.demdex.net": "0",
						"sap.demdex.net": "0",
						"omtrdc.net": "0",
						"sapglobalmarketingin.tt.omtrdc.net": "0",
						"adobedtm.com": "0",
						"assets.adobedtm.com": "0",
						"www.youtube.com": "0",
						"youtube.com": "0",
						"google.com": "0",
						"openui5.hana.ondemand.com": "0",
						"ui5.sap.com": "0"
					};

				if (bFirstPartyCookiesEnabled) {
					oPreferences["openui5.hana.ondemand.com"] = "1";
					oPreferences["ui5.sap.com"] = "1";
				}
				if (bUsageTrackingCookiesEnabled) {
					oPreferences["6sc.co"] = "1";
					oPreferences["6sense.com"] = "1";
					oPreferences["b.6sc.co"] = "1";
					oPreferences["demdex.net"] = "1";
					oPreferences["dpm.demdex.net"] = "1";
					oPreferences["sap.demdex.net"] = "1";
					oPreferences["omtrdc.net"] = "1";
					oPreferences["sapglobalmarketingin.tt.omtrdc.net"] = "1";
					oPreferences["adobedtm.com"] = "1";
					oPreferences["assets.adobedtm.com"] = "1";
				}
				if (bVideoContentCookiesEnabled) {
					oPreferences["www.youtube.com"] = "1";
					oPreferences["youtube.com"] = "1";
				}
				if (bOtherThirdPartyCookiesEnabled) {
					oPreferences["google.com"] = "1";
				}
				return oPreferences;
			}
		};
	})();

	QUnit.module("_checkAdditionalPreferencesAllowUsageTracking", {
		before: function () {
			this.oStub = sinon.stub(CookiesConsentManager, "_configIncludesUsageTracking").returns(true);
		},
		beforeEach: function () {
			this.oConsentManager = CookiesConsentManager.create();
			this.sandbox = sinon.createSandbox();
		},
		afterEach: function () {
			this.oConsentManager.destroy();
			this.oConsentManager = null;
			this.sandbox.restore();
		},
		after: function () {
			this.oStub.restore();
		}
	});

	QUnit.test("check absence of consent", function (assert) {
		this.sandbox.stub(this.oConsentManager, "_getAdditionalPreferencesPerDomain")
				.returns(oFactory.getAdditionalPreferencesPerDomain({
					firstPartyCookiesEnabled: true,
					usageTrackingCookiesEnabled: false,
					usageVideoContentCookiesEnabled: true,
					otherThirdPartyCookiesEnabled: true
				}));
		assert.strictEqual(this.oConsentManager._checkAdditionalPreferencesAllowUsageTracking(), false, "consent is denied");
	});

	QUnit.test("check ignores unrelated firstParty cookies", function (assert) {
		this.sandbox.stub(this.oConsentManager, "_getAdditionalPreferencesPerDomain")
				.returns(oFactory.getAdditionalPreferencesPerDomain({
					firstPartyCookiesEnabled: false,
					usageTrackingCookiesEnabled: true,
					usageVideoContentCookiesEnabled: true,
					otherThirdPartyCookiesEnabled: true
				}));
		assert.strictEqual(this.oConsentManager._checkAdditionalPreferencesAllowUsageTracking(), true, "consent is given");
	});

	QUnit.test("check ignores unrelated cookies for video content", function (assert) {
		this.sandbox.stub(this.oConsentManager, "_getAdditionalPreferencesPerDomain")
				.returns(oFactory.getAdditionalPreferencesPerDomain({
					firstPartyCookiesEnabled: true,
					usageTrackingCookiesEnabled: true,
					usageVideoContentCookiesEnabled: false,
					otherThirdPartyCookiesEnabled: true
				}));
		assert.strictEqual(this.oConsentManager._checkAdditionalPreferencesAllowUsageTracking(), true, "consent is given");
	});

	QUnit.test("check ignores unrelated third party cookies", function (assert) {
		this.sandbox.stub(this.oConsentManager, "_getAdditionalPreferencesPerDomain")
				.returns(oFactory.getAdditionalPreferencesPerDomain({
					firstPartyCookiesEnabled: true,
					usageTrackingCookiesEnabled: true,
					usageVideoContentCookiesEnabled: true,
					otherThirdPartyCookiesEnabled: false
				}));
		assert.strictEqual(this.oConsentManager._checkAdditionalPreferencesAllowUsageTracking(), true, "consent is given");
	});

	QUnit.module("supported hostnames", {
	});

	QUnit.test("_checkHostnameIsTracked", function (assert) {
		var aTrackerHostnames = ["openui5.hana.ondemand.com", "sapui5.hana.ondemand.com", "ui5.sap.com", "sdk.openui5.org"];
		aTrackerHostnames.forEach(function (sHostname) {
			assert.strictEqual(CookiesConsentManager._checkHostnameIsTracked(sHostname), true, "hostname is tracked: " + sHostname);
		});
	});

	QUnit.module("_isTrustArcScriptIncluded", {
		before: function () {
			this.oConfigStub = sinon.stub(CookiesConsentManager, "_configIncludesUsageTracking").returns(true);
		},
		beforeEach: function () {
			this.oConsentManager = CookiesConsentManager.create();
			this.sandbox = sinon.createSandbox();
		},
		afterEach: function () {
			this.oConsentManager.destroy();
			this.oConsentManager = null;
			this.sandbox.restore();
		},
		after: function () {
			this.oConfigStub.restore();
		}
	});

	QUnit.test("returns false when no scripts are present", function (assert) {
		this.sandbox.stub(document, "getElementsByTagName").returns([]);
		assert.strictEqual(this.oConsentManager._isTrustArcScriptIncluded(), false,
			"no TrustArc script found when no scripts are in the DOM");
	});

	QUnit.test("returns true when a script with the TrustArc HTTPS URL is present", function (assert) {
		var aScripts = [{ src: "https://consent.trustarc.com/notice?domain=ui5.sap.com&c=teconsent" }];
		this.sandbox.stub(document, "getElementsByTagName").returns(aScripts);
		assert.strictEqual(this.oConsentManager._isTrustArcScriptIncluded(), true,
			"TrustArc script is detected by its HTTPS src property");
	});

	QUnit.test("returns true when src property resolves to HTTPS but attribute uses a protocol-relative URL", function (assert) {
		// Regression test: the old code read getAttribute("src") which returned "//consent.trustarc.com/..."
		// and the startsWith("https://...") check failed. The fixed code reads the .src DOM property,
		// which browsers resolve to the fully-qualified URL regardless of how the attribute was written.
		var aScripts = [{
			src: "https://consent.trustarc.com/notice?domain=ui5.sap.com&c=teconsent",
			getAttribute: function () { return "//consent.trustarc.com/notice?domain=ui5.sap.com&c=teconsent"; }
		}];
		this.sandbox.stub(document, "getElementsByTagName").returns(aScripts);
		assert.strictEqual(this.oConsentManager._isTrustArcScriptIncluded(), true,
			"TrustArc script is detected even when the src attribute is protocol-relative");
	});

	QUnit.test("returns false when only unrelated scripts are present", function (assert) {
		var aScripts = [
			{ src: "https://other-library.com/script.js" },
			{ src: "https://example.com/app.js" }
		];
		this.sandbox.stub(document, "getElementsByTagName").returns(aScripts);
		assert.strictEqual(this.oConsentManager._isTrustArcScriptIncluded(), false,
			"no TrustArc script detected when only unrelated scripts are present");
	});
});