
/* global QUnit */
sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/platform/SetUI5VersionNumber",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetUI5VersionNumber,
	AppDescriptorChange,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();
	function assertInvalidVersionChange(assert, oManifest, oChange) {
		assert.throws(function() {
			SetUI5VersionNumber.applyChange(oManifest, oChange);
		}, /not a valid semantic version/, "throws error for invalid semantic version");
	}
	QUnit.module("applyChange", {
		beforeEach() {
			this.oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_platform_cf_setUI5VersionNumber"
				},
				content: {
					ui5VersionNumber: "1.120.0"
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when applying change to manifest with existing sap.platform.cf", function(assert) {
			const oManifest = {
				"_version": "2.0.0",

				"sap.platform.cf": {
					ui5VersionNumber: "1.86"
				}
			};
			const oNewManifest = SetUI5VersionNumber.applyChange(oManifest, this.oChange);
			assert.strictEqual(oNewManifest["sap.platform.cf"].ui5VersionNumber, "1.120.0",
				"ui5VersionNumber is stored with patch when provided");
		});
		QUnit.test("when applying change with lower ui5VersionNumber than existing, manifest is not updated (downgrade check)", function(assert) {
			const oManifest = {
				"_version": "2.0.0",

				"sap.platform.cf": {
					ui5VersionNumber: "1.120"
				}
			};
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_platform_cf_setUI5VersionNumber"
				},
				content: {
					ui5VersionNumber: "1.86.0"
				}
			});
			const oNewManifest = SetUI5VersionNumber.applyChange(oManifest, oChange);
			assert.strictEqual(oNewManifest["sap.platform.cf"].ui5VersionNumber, "1.120",
				"ui5VersionNumber is not updated to major.minor if lower");
		});
		QUnit.test("when applying change to manifest without sap.platform.cf node", function(assert) {
			const oManifest = {
				"_version": "2.0.0",

				"sap.app": {
					id: "my.sample"
				}
			};
			const oNewManifest = SetUI5VersionNumber.applyChange(oManifest, this.oChange);
			assert.strictEqual(oNewManifest["sap.platform.cf"].ui5VersionNumber, "1.120.0",
				"ui5VersionNumber is created and set with patch when provided");
		});
		QUnit.test("when applying change with major.minor version, it is accepted", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_platform_cf_setUI5VersionNumber"
				},
				content: {
					ui5VersionNumber: "1.120"
				}
			});
			const oManifest = {};
			const oNewManifest = SetUI5VersionNumber.applyChange(oManifest, oChange);
			assert.strictEqual(oNewManifest["sap.platform.cf"].ui5VersionNumber, "1.120",
				"ui5VersionNumber is stored as major.minor");
		});
		QUnit.test("when applying change with major.minor.patch version, it is accepted", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_platform_cf_setUI5VersionNumber"
				},
				content: {
					ui5VersionNumber: "1.120.1"
				}
			});
			const oManifest = {};
			const oNewManifest = SetUI5VersionNumber.applyChange(oManifest, oChange);
			assert.strictEqual(oNewManifest["sap.platform.cf"].ui5VersionNumber, "1.120.1",
				"ui5VersionNumber is stored with patch when provided");
		});
		QUnit.test("when applying change with missing ui5VersionNumber", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_platform_cf_setUI5VersionNumber"
				},
				content: {}
			});
			const oManifest = {};
			assert.throws(function() {
				SetUI5VersionNumber.applyChange(oManifest, oChange);
			}, Error("No ui5VersionNumber in change content provided"), "throws error for missing property");
		});
		QUnit.test("when applying change with non-string ui5VersionNumber", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_platform_cf_setUI5VersionNumber"
				},
				content: {
					ui5VersionNumber: 120
				}
			});
			const oManifest = {};
			assert.throws(function() {
				SetUI5VersionNumber.applyChange(oManifest, oChange);
			}, /Only allowed type for property ui5VersionNumber is string/, "throws error for wrong type");
		});
		QUnit.test("when applying change with invalid semantic versions", function(assert) {
			const oManifest = {};
			const aInvalidVersions = ["invalidversion", "1,0,0", ""];
			for (let i = 0; i < aInvalidVersions.length; i++) {
				const sInvalidVersion = aInvalidVersions[i];
				const oChange = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_platform_cf_setUI5VersionNumber"
					},
					content: {
						ui5VersionNumber: sInvalidVersion
					}
				});
				assertInvalidVersionChange(assert, oManifest, oChange);
			}
		});
	});
	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
