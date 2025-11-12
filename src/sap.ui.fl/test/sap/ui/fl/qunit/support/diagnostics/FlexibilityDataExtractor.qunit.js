/* global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/fl/support/diagnostics/FlexibilityDataExtractor",
	"sap/ui/VersionInfo",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	SupportAPI,
	FlexibilityDataExtractor,
	VersionInfo,
	sinon
) {
	"use strict";

	const oSandbox = sinon.createSandbox();
	document.getElementById("qunit-fixture").style.display = "none";

	QUnit.module("sap.ui.fl.support.diagnostics.FlexibilityDataExtractor", {
		beforeEach() {
			oSandbox.stub(VersionInfo, "load").resolves({ version: "1.120.0" });
		},

		afterEach() {
			oSandbox.restore();
		}
	});

	QUnit.test("extractFlexibilityData - returns complete data structure without anonymization", async function(assert) {
		const oMockManifestObject = {
			getEntry: oSandbox.stub()
		};
		oMockManifestObject.getEntry.withArgs("/sap.app/applicationVersion/version").returns("1.2.3");
		oMockManifestObject.getEntry.withArgs("/sap.app/ach").returns("FI-GL");

		const oMockAppComponent = {
			getManifestObject: oSandbox.stub().returns(oMockManifestObject)
		};

		const oMockFlexSettings = [
			{ key: "userId", value: "JohnDoesEmail" },
			{ key: "developerMode", value: true }
		];

		const aMockChangeDependencies = [
			{ changeId: "change1", dependencies: ["change2"], user: "JohnDoesEmail" },
			{ changeId: "change2", dependencies: [], user: "JaneSmithsEmail" }
		];

		const aMockFlexObjectInfos = [
			{ id: "object1", type: "variant", user: "myEmail1" },
			{ id: "object2", type: "change", user: "myEmail2" }
		];

		oSandbox.stub(SupportAPI, "getApplicationComponent").resolves(oMockAppComponent);
		oSandbox.stub(SupportAPI, "getFlexSettings").resolves(oMockFlexSettings);
		oSandbox.stub(SupportAPI, "getChangeDependencies").resolves(aMockChangeDependencies);
		oSandbox.stub(SupportAPI, "getFlexObjectInfos").resolves(aMockFlexObjectInfos);

		const dStartTime = new Date();
		const oResult = await FlexibilityDataExtractor.extractFlexibilityData(false);
		const dEndTime = new Date();

		assert.strictEqual(oResult.extractorVersion, "1.0", "Extractor version is set correctly");
		assert.strictEqual(oResult.ui5Version, "1.120.0", "UI5 version is extracted correctly from VersionInfo");
		assert.strictEqual(oResult.appVersion, "1.2.3", "App version is extracted correctly");
		assert.strictEqual(oResult.appACH, "FI-GL", "App ACH is extracted correctly");
		assert.deepEqual(oResult.flexSettings, oMockFlexSettings, "Flex settings are extracted correctly");
		assert.deepEqual(oResult.changeDependencies, aMockChangeDependencies, "Change dependencies are extracted correctly");
		assert.deepEqual(oResult.flexObjectInfos, aMockFlexObjectInfos, "Flex object infos are extracted correctly");

		// Verify extraction timestamp
		assert.ok(oResult.extractionTimeStamp, "Extraction timestamp is set");
		assert.strictEqual(typeof oResult.extractionTimeStamp, "string", "Timestamp is a string");
		const dParsedTimestamp = new Date(oResult.extractionTimeStamp);
		assert.ok(!isNaN(dParsedTimestamp.getTime()), "Timestamp is a valid date");
		assert.ok(dParsedTimestamp >= dStartTime, "Timestamp is not before test start");
		assert.ok(dParsedTimestamp <= dEndTime, "Timestamp is not after test end");
		assert.ok(oResult.extractionTimeStamp.endsWith("Z"), "Timestamp is in ISO format (UTC)");

		// Verify data is not anonymized when bAnonymizeUsers is false
		assert.strictEqual(oResult.flexSettings[0].value, "JohnDoesEmail", "User data is not anonymized");
		assert.strictEqual(oResult.changeDependencies[0].user, "JohnDoesEmail", "User data in dependencies is not anonymized");
	});

	QUnit.test("extractFlexibilityData - returns anonymized data structure when requested", async function(assert) {
		const oMockManifestObject = {
			getEntry: oSandbox.stub()
		};
		oMockManifestObject.getEntry.withArgs("/sap.app/applicationVersion/version").returns("1.2.3");
		oMockManifestObject.getEntry.withArgs("/sap.app/ach").returns("FI-GL");

		const oMockAppComponent = {
			getManifestObject: oSandbox.stub().returns(oMockManifestObject)
		};

		const oMockFlexSettings = [
			{ key: "userId", value: "JohnDoesEmail" },
			{ key: "developerMode", value: true }
		];

		const aMockChangeDependencies = [
			{ changeId: "change1", dependencies: ["change2"], user: "JohnDoesEmail" },
			{ changeId: "change2", dependencies: [], user: "JaneSmithsEmail" }
		];

		const aMockFlexObjectInfos = [
			{ id: "object1", type: "variant", user: "JohnDoesEmail" },
			{ id: "object2", type: "change", user: "TestersEmail" }
		];

		oSandbox.stub(SupportAPI, "getApplicationComponent").resolves(oMockAppComponent);
		oSandbox.stub(SupportAPI, "getFlexSettings").resolves(oMockFlexSettings);
		oSandbox.stub(SupportAPI, "getChangeDependencies").resolves(aMockChangeDependencies);
		oSandbox.stub(SupportAPI, "getFlexObjectInfos").resolves(aMockFlexObjectInfos);

		const oResult = await FlexibilityDataExtractor.extractFlexibilityData(true);

		assert.strictEqual(oResult.extractorVersion, "1.0", "Extractor version is set correctly");
		assert.strictEqual(oResult.ui5Version, "1.120.0", "UI5 version is extracted correctly from VersionInfo");
		assert.strictEqual(oResult.appVersion, "1.2.3", "App version is extracted correctly");
		assert.strictEqual(oResult.appACH, "FI-GL", "App ACH is extracted correctly");

		// Verify data is anonymized when bAnonymizeUsers is true
		assert.strictEqual(oResult.flexSettings[0].value, "USER_1", "userId in flexSettings is anonymized");
		assert.strictEqual(oResult.flexSettings[1].value, true, "Non-user setting is unchanged");
		assert.strictEqual(oResult.changeDependencies[0].user, "USER_1", "User in dependencies is anonymized consistently");
		assert.strictEqual(oResult.changeDependencies[1].user, "USER_2", "Different user gets different anonymized value");
		assert.strictEqual(oResult.flexObjectInfos[0].user, "USER_1", "User in flex object infos is anonymized consistently");
		assert.strictEqual(oResult.flexObjectInfos[1].user, "USER_3",
			"Different user in flex object infos gets different anonymized value");
	});

	QUnit.test("extractFlexibilityData - no mutation of original data during anonymization", async function(assert) {
		const oMockManifestObject = {
			getEntry: oSandbox.stub()
			.withArgs("/sap.app/applicationVersion/version").returns("1.2.3")
			.withArgs("/sap.app/ach").returns("FI-GL")
		};
		const oMockAppComponent = {
			getManifestObject: oSandbox.stub().returns(oMockManifestObject)
		};

		const aFlexObjects = [
			// Simulate serializable object with prototype
			Object.create({})
		];
		aFlexObjects[0].user = "JohnDoesEmail";

		oSandbox.stub(SupportAPI, "getApplicationComponent").resolves(oMockAppComponent);
		oSandbox.stub(SupportAPI, "getFlexSettings").resolves([]);
		// Change dependencies and flex object infos share same object reference
		// Anonymization must not touch the same object reference twice
		oSandbox.stub(SupportAPI, "getChangeDependencies").resolves(aFlexObjects);
		oSandbox.stub(SupportAPI, "getFlexObjectInfos").resolves(aFlexObjects);

		const oResult = await FlexibilityDataExtractor.extractFlexibilityData(true);
		assert.strictEqual(oResult.changeDependencies[0].user, "USER_1", "User in dependencies is anonymized");
		assert.strictEqual(oResult.flexObjectInfos[0].user, "USER_1", "User in flex object infos is anonymized consistently");
		assert.strictEqual(aFlexObjects[0].user, "JohnDoesEmail", "Original object is not touched");
	});

	QUnit.test("extractFlexibilityData - logs error and returns empty object when no application component found", async function(assert) {
		oSandbox.stub(SupportAPI, "getApplicationComponent").resolves(null);
		const oLogErrorStub = oSandbox.stub(Log, "error");

		const oResult = await FlexibilityDataExtractor.extractFlexibilityData(false);

		assert.ok(oLogErrorStub.calledWith("No application component found"), "Error is logged when no application component found");
		assert.deepEqual(oResult, {}, "Empty object is returned when no application component found");
	});
});