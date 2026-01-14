/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/thirdparty/sinon-4"
], function(
	Settings,
	getFlexSettings,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function checkPropertiesInSettings(assert, aSettings, aExpectedSettings) {
		aExpectedSettings.forEach(function(oExpectedSetting) {
			const oSetting = aSettings.find(function(oSetting) {
				return oSetting.key === oExpectedSetting.key;
			});
			assert.ok(oSetting, "the setting is available");
			assert.strictEqual(oSetting.value, oExpectedSetting.value, "the setting has the expected value");
		});
	}

	QUnit.module("getFlexSettings", {
		beforeEach() {
			this.oSettings = {
				isKeyUser: true,
				isLocalResetEnabled: false
			};
			sandbox.stub(Settings, "getInstance").resolves(new Settings(this.oSettings));
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with some settings", async function(assert) {
			const aSettings = await getFlexSettings("dummyComponent");
			checkPropertiesInSettings(assert, aSettings, [
				{ key: "isKeyUser", value: true },
				{ key: "isLocalResetEnabled", value: false }
			]);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});