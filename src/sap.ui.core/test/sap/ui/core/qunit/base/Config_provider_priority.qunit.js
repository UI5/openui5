/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.reorder = false;
QUnit.config.autostart = false;

globalThis.fnInit = () => {
	"use strict";

	sap.ui.require([
		"sap/base/config",
		"sap/base/Log"
	], (
		BaseConfiguration,
		Log
	) => {

		sap.ui.loader._.logger = Log.getLogger("test", 6);
		QUnit.module("Configuration Provider Priority", {
			beforeEach: function() {
				BaseConfiguration._.invalidate();
			}
		});

		QUnit.test("Provider registration priority: non-external cannot override external", function(assert) {
			assert.expect(4);
			BaseConfiguration._.invalidate();

			// Verify that external provider has priority over non-external provider
			// TestNonExternalProvider returns "non-external-override-attempt" for sapUiParamA
			// But URLConfigurationProvider (external) and TestExternalProvider (external) should have priority
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiParamA",
				type: BaseConfiguration.Type.String,
				external: true
			}), "new-external-provider", "External provider (TestExternalProvider) has priority over non-external provider");

			// Verify that the new external parameter works
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiNewExternalParam",
				type: BaseConfiguration.Type.String,
				external: true
			}), "external-value", "New external provider can provide new parameters");

			// Clear cache before testing non-external access
			BaseConfiguration._.invalidate();

			// Verify that non-external provider works for internal access (without external flag)
			// When external flag is not set, external providers are skipped
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiParamA",
				type: BaseConfiguration.Type.String
			}), "non-external-override-attempt", "Without external flag: non-external provider (TestNonExternalProvider) returns its value");

			// Verify that URL provider returns "url" when checking external providers
			// This requires looking at config that URL provider has
			BaseConfiguration._.invalidate();
			assert.strictEqual(BaseConfiguration.get({
				name: "sapUiParamB",
				type: BaseConfiguration.Type.String,
				external: true
			}), "meta", "BaseConfiguration.get for param 'sapUiParamB' returns correct value 'meta'");
		});

		QUnit.start();
	});
};
