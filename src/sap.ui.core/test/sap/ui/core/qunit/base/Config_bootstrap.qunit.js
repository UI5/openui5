/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

globalThis.fnInit = () => {
	"use strict";

	sap.ui.require([
		"sap/base/config",
		"sap/base/Log",
		"sap/ui/thirdparty/sinon"
	], function (
		BaseConfiguration,
		Log,
		sinon
	) {
		var oLog = Log.getLogger("test", 6);
		var oLogErrorSpy = sinon.spy(oLog, "error");
		var oLogWarningSpy = sinon.spy(oLog, "warning");
		sap.ui.loader._.logger = oLog;

		QUnit.module("Base Configuration");

		QUnit.test("Basic: Check getter on provider level", function(assert) {
			assert.expect(24);

			["sapUiSapFooBar"].forEach(function (sDuplicateKey) {
				//trigger get for error logging
				const value = BaseConfiguration.get({
					name: sDuplicateKey,
					type: BaseConfiguration.Type.String
				});
				assert.ok(oLogErrorSpy.calledWith("Configuration option '" + sDuplicateKey + "' was set multiple times. Value '" + value + "' will be used"), "Logged invalid configuration option '" + sDuplicateKey + "'");
			});

			["sapUiSap;ui;bar"].forEach(function (sInvalidKey) {
				assert.ok(oLogErrorSpy.calledWith("Invalid configuration option '" + sInvalidKey + "' in bootstrap!"), "Logged invalid configuration option '" + sInvalidKey + "'");
			});

			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiHubelDubel",
				type: BaseConfiguration.Type.String
			}), "value1", "BaseConfiguration.get for param 'sapUiHubelDubel' returns value 'value1'");
			assert.ok(oLogWarningSpy.calledWith("Deprecated configuration option 'sap-ui-hubeldubel' given in bootstrap configuration. Please use 'sap-ui-hubel-dubel' instead."), "Logged warning for deprecated configuration spelling 'sap-ui-hubeldubel'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiHubeldubel",
				type: BaseConfiguration.Type.String
			}), "value1", "BaseConfiguration.get for param 'sapUiHubeldubel' returns value 'value1'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUihubeldubel",
				type: BaseConfiguration.Type.String
			}), "", "BaseConfiguration.get for param 'sapUihubeldubel' returns internal default value ''");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiFooBar",
				type: BaseConfiguration.Type.String
			}), "value6", "BaseConfiguration.get for param 'sapUiFooBar' returns correct value 'value6'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiFoobar",
				type: BaseConfiguration.Type.String
			}), "value3", "BaseConfiguration.get for param 'sapUiFoobar' returns correct value 'value3'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUi5oobar",
				type: BaseConfiguration.Type.String
			}), "value7", "BaseConfiguration.get for param 'sapUi5oobar' returns correct value 'value7'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUi5ooBar",
				type: BaseConfiguration.Type.String
			}), "value7", "BaseConfiguration.get for param 'sapUi5ooBar' returns correct value 'value7'");
			assert.ok(oLogWarningSpy.calledWith("Deprecated configuration option 'sap-ui5oobar' given in bootstrap configuration. Please use 'sap-ui5oo-bar' instead."), "Logged deprecated configuration spelling 'sap-ui5oobar'");
			assert.throws(function () {
				BaseConfiguration.get({
					name: "sapUi-5ooBar",
					type: BaseConfiguration.Type.String
				});
			}, new TypeError("Invalid configuration key 'sapUi-5ooBar'!"), "BaseConfiguration.get for param 'sapUi-5ooBar' throws error");
			assert.throws(function () {
				BaseConfiguration.get({
					name: "sapUiSap-ui-fooBar",
					type: BaseConfiguration.Type.String
				});
			}, new TypeError("Invalid configuration key 'sapUiSap-ui-fooBar'!"), "BaseConfiguration.get for param 'sapUiSap-ui-fooBar' throws error");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiSapUiFooBar",
				type: BaseConfiguration.Type.String
			}), "value9", "BaseConfiguration.get for param 'sapUiSapUiFooBar' returns correct value 'value9'");
			assert.ok(oLogWarningSpy.calledWith("Deprecated configuration option 'sap-ui-sapuifoobar' given in bootstrap configuration. Please use 'sap-ui-sap-ui-foo-bar' instead."), "Logged deprecated configuration spelling 'sap-ui-sapui5foobar'");
			assert.throws(function () {
				BaseConfiguration.get({
					name: "sapUiSap.foo.bar",
					type: BaseConfiguration.Type.String
				});
			}, new TypeError("Invalid configuration key 'sapUiSap.foo.bar'!"), "BaseConfiguration.get for param 'sapUiSap.foo.bar' throws error");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiSapFooBar",
				type: BaseConfiguration.Type.String
			}), "value10", "BaseConfiguration.get for param 'sapUiSapFooBar' returns correct value 'value10'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiXxBarFoo",
				type: BaseConfiguration.Type.String
			}), "", "BaseConfiguration.get for param 'sapUiXxBarFoo' returns internal default value value ''");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiBarFoo",
				type: BaseConfiguration.Type.String
			}), "", "BaseConfiguration.get for param 'sapUiBarFoo' returns internal default value value ''");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiXxFarBoo",
				type: BaseConfiguration.Type.String
			}), "value13", "BaseConfiguration.get for param 'sapUiXxFarBoo' returns correct value 'value13'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiFarBoo",
				type: BaseConfiguration.Type.String
			}), "value13", "BaseConfiguration.get for param 'sapUiFarBoo' returns correct value 'value13'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUshellFooBar",
				type: BaseConfiguration.Type.String
			}), "value15", "BaseConfiguration.get for param 'sapUshellFooBar' returns correct value 'value15'");
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiMissSpelled",
				type: BaseConfiguration.Type.String,
				external: false
			}), "test", "BaseConfiguration.get for param 'sapUiMissSpelled' returns correct value 'test'");
			assert.ok(oLogWarningSpy.calledWith("Deprecated configuration option 'sap-ui-missspelled' given in bootstrap configuration. Please use 'sap-ui-miss-spelled' instead."), "Logged deprecated configuration spelling 'sap-ui-missspelled'");
		});

		QUnit.start();
	});
};
