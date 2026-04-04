/* global QUnit */

sap.ui.define([
	"sap/ui/demo/cardExplorer/model/ExploreNavigationModel"
], (ExploreNavigationModel) => {
	"use strict";

	const APP_SCHEMA_VERSION = "1.83.1";
	const APP_SCHEMA_URL = "https://raw.githubusercontent.com/SAP/ui5-manifest/v" + APP_SCHEMA_VERSION + "/schema.json";

	/**
	 * Collects all sample entries from the navigation model.
	 */
	function collectSamples(aNavigation) {
		const aSamples = [];

		for (const oSection of aNavigation) {
			for (const oItem of (oSection.items || [])) {
				if (oItem.subSamples) {
					for (const oSubSample of oItem.subSamples) {
						if (oSubSample.files) {
							aSamples.push({
								isApplication: oItem.isApplication,
								...oSubSample
							});
						}
					}
				} else if (oItem.files) {
					aSamples.push(oItem);
				}
			}
		}

		return aSamples;
	}

	const aNavigation = ExploreNavigationModel.getData().navigation;
	const aSamples = collectSamples(aNavigation);

	QUnit.module("SampleTester - Manifest Checks");

	for (const oSample of aSamples) {
		const aJsonFiles = (oSample.files || []).filter((oFile) => oFile.url.endsWith(".json"));

		for (const oFile of aJsonFiles) {
			QUnit.test(`${oSample.key} > ${oFile.name}`, async (assert) => {
				const sUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer" + oFile.url);
				const oResponse = await fetch(sUrl);
				const oManifest = await oResponse.json();

				if (!oManifest["sap.app"]) {
					assert.ok(true, "Not a manifest, skipping");
					return;
				}

				const sType = oManifest["sap.app"].type;

				assert.ok(oManifest["sap.app"].id, "sap.app/id must exist");

				if (sType === "application") {
					assert.strictEqual(
						oManifest["_version"],
						APP_SCHEMA_VERSION,
						`Application manifest _version must be fixed at ${APP_SCHEMA_VERSION}`
					);
					assert.strictEqual(
						oManifest["$schema"],
						APP_SCHEMA_URL,
						`Application manifest $schema must be "${APP_SCHEMA_URL}"`
					);
				} else if (sType === "card") {
					assert.notOk("_version" in oManifest, "Card manifest must not have _version property");
					assert.notOk("$schema" in oManifest, "Card manifest must not have $schema property");
				} else {
					throw new Error(`Unexpected sap.app.type "${sType}" in ${oFile.url}`);
				}
			});
		}
	}
});
