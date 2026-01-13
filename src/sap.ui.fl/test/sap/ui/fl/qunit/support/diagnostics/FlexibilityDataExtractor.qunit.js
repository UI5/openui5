/* global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/fl/support/diagnostics/FlexibilityDataExtractor",
	"sap/ui/VersionInfo",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	FlexObjectFactory,
	SupportAPI,
	FlexibilityDataExtractor,
	VersionInfo,
	sinon
) {
	"use strict";

	const oSandbox = sinon.createSandbox();
	document.getElementById("qunit-fixture").style.display = "none";

	function getMockAppComponent() {
		const oMockManifestObject = {
			getEntry: oSandbox.stub()
		};
		oMockManifestObject.getEntry.withArgs("/sap.app/applicationVersion/version").returns("1.2.3");
		oMockManifestObject.getEntry.withArgs("/sap.app/ach").returns("CA-UI5-FL");

		return {
			getManifestObject: oSandbox.stub().returns(oMockManifestObject)
		};
	}

	QUnit.module("sap.ui.fl.support.diagnostics.FlexibilityDataExtractor", {
		beforeEach() {
			oSandbox.stub(VersionInfo, "load").resolves({ version: "1.120.0" });
		},
		afterEach() {
			oSandbox.restore();
		}
	}, function() {
		QUnit.test("extractFlexibilityData - returns complete data structure without anonymization", async function(assert) {
			const oMockAppComponent = getMockAppComponent();

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
			const oResult = await FlexibilityDataExtractor.extractFlexibilityData(false, true);
			const dEndTime = new Date();

			assert.strictEqual(oResult.extractorVersion, "2.0", "Extractor version is set correctly");
			assert.strictEqual(oResult.ui5Version, "1.120.0", "UI5 version is extracted correctly from VersionInfo");
			assert.strictEqual(oResult.appVersion, "1.2.3", "App version is extracted correctly");
			assert.strictEqual(oResult.appACH, "CA-UI5-FL", "App ACH is extracted correctly");
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
			const oMockAppComponent = getMockAppComponent();

			const oMockFlexSettings = [
				{ key: "userId", value: "JohnDoesEmail" },
				{ key: "developerMode", value: true }
			];

			const oMockChangeDependencies = {
				aAppliedChanges: ["change1", "change2"],
				mChangesEntries: {
					change1: { changeId: "change1", dependencies: ["change2"], user: "JohnDoesEmail" },
					change2: { changeId: "change2", dependencies: [], user: "JaneSmithsEmail" }
				}
			};

			const aMockFlexObjectInfos = [
				FlexObjectFactory.createFlexObject({ id: "object1", type: "variant", user: "JohnDoesEmail" }),
				FlexObjectFactory.createFlexObject({ id: "object2", type: "change", user: "TestersEmail" })
			];

			oSandbox.stub(SupportAPI, "getApplicationComponent").resolves(oMockAppComponent);
			oSandbox.stub(SupportAPI, "getFlexSettings").resolves(oMockFlexSettings);
			oSandbox.stub(SupportAPI, "getChangeDependencies").resolves(oMockChangeDependencies);
			oSandbox.stub(SupportAPI, "getFlexObjectInfos").resolves(aMockFlexObjectInfos);

			const oResult = await FlexibilityDataExtractor.extractFlexibilityData(true, true);

			assert.strictEqual(oResult.extractorVersion, "2.0", "Extractor version is set correctly");
			assert.strictEqual(oResult.ui5Version, "1.120.0", "UI5 version is extracted correctly from VersionInfo");
			assert.strictEqual(oResult.appVersion, "1.2.3", "App version is extracted correctly");
			assert.strictEqual(oResult.appACH, "CA-UI5-FL", "App ACH is extracted correctly");

			// Verify data is anonymized when bAnonymizeUsers is true
			assert.strictEqual(oResult.flexSettings[0].value, "USER_1", "userId in flexSettings is anonymized");
			assert.strictEqual(oResult.flexSettings[1].value, true, "Non-user setting is unchanged");
			assert.strictEqual(
				oResult.changeDependencies.mChangesEntries.change1.user,
				"USER_1",
				"User in dependencies is anonymized consistently"
			);
			assert.strictEqual(
				oResult.changeDependencies.mChangesEntries.change2.user,
				"USER_2",
				"Different user gets different anonymized value"
			);
			assert.strictEqual(
				oResult.flexObjectInfos[0].mProperties.supportInformation.user,
				"USER_1",
				"User in flex object infos is anonymized consistently"
			);
			assert.strictEqual(
				oResult.flexObjectInfos[1].mProperties.supportInformation.user,
				"USER_3",
				"Different user in flex object infos gets different anonymized value"
			);
		});

		QUnit.test("extractFlexibilityData - no mutation of original data during anonymization", async function(assert) {
			const oMockAppComponent = getMockAppComponent();

			const oChange1 = FlexObjectFactory.createFlexObject({ id: "object1", type: "variant", user: "JohnDoesEmail" });
			const oMockChangeDependencies = {
				aAppliedChanges: ["change1", "change2"],
				mChangesEntries: {
					change1: oChange1.convertToFileContent()
				}
			};
			const aMockFlexObjectInfos = [
				oChange1
			];

			oSandbox.stub(SupportAPI, "getApplicationComponent").resolves(oMockAppComponent);
			oSandbox.stub(SupportAPI, "getFlexSettings").resolves([]);
			// Change dependencies and flex object infos share same object reference
			// Anonymization must not touch the same object reference twice
			oSandbox.stub(SupportAPI, "getChangeDependencies").resolves(oMockChangeDependencies);
			oSandbox.stub(SupportAPI, "getFlexObjectInfos").resolves(aMockFlexObjectInfos);

			const oResult = await FlexibilityDataExtractor.extractFlexibilityData(true, true);
			assert.strictEqual(
				oResult.changeDependencies.mChangesEntries.change1.support.user,
				"USER_1",
				"User in dependencies is anonymized consistently"
			);
			assert.strictEqual(
				oResult.flexObjectInfos[0].mProperties.supportInformation.user,
				"USER_1",
				"User in flex object infos is anonymized consistently"
			);
			assert.strictEqual(oChange1.getSupportInformation().user, "JohnDoesEmail", "Original object is not touched");
		});

		QUnit.test("extractFlexibilityData - logs error and returns empty object when no application component found", async function(assert) {
			oSandbox.stub(SupportAPI, "getApplicationComponent").resolves(null);
			const oLogErrorStub = oSandbox.stub(Log, "error");

			const oResult = await FlexibilityDataExtractor.extractFlexibilityData(false, true);

			assert.ok(oLogErrorStub.calledWith("No application component found"), "Error is logged when no application component found");
			assert.deepEqual(oResult, {}, "Empty object is returned when no application component found");
		});

		function mockSupportAPIFunctions() {
			const oMockAppComponent = getMockAppComponent();

			const oMockFlexSettings = [
				{ key: "userId", value: "JohnDoesEmail" },
				{ key: "developerMode", value: true }
			];

			const oChange1 = FlexObjectFactory.createUIChange({ id: "change1", type: "variant", user: "JohnDoesEmail" });
			oChange1.setApplyState("applied");
			const oChange2 = FlexObjectFactory.createUIChange(
				{ id: "change2", type: "change", user: "JaneSmithsEmail", content: [[{ user: "JaneSmithsEmail" }]] }
			);
			oChange2.setApplyState("pending");
			oChange2.setRevertData([[{ user: "JohnDoesEmail" }]]);

			const oMockFlexObjectInfos = {
				liveDependencyMap: {
					aChanges: [oChange1, oChange2],
					mChanges: {
						control1: [oChange1],
						control2: [oChange2]
					},
					mDependencies: {
						change1: [oChange2]
					}
				},
				allUIChanges: [oChange1, oChange2],
				allFlexObjects: [oChange1, oChange2]
			};

			oSandbox.stub(SupportAPI, "getApplicationComponent").resolves(oMockAppComponent);
			oSandbox.stub(SupportAPI, "getFlexSettings").resolves(oMockFlexSettings);
			oSandbox.stub(SupportAPI, "getFlexObjectInfos").resolves(oMockFlexObjectInfos);

			return {
				oMockFlexSettings
			};
		}

		QUnit.test("extractFlexibilityData - exports reduced dataset without anonymization", async function(assert) {
			const { oMockCachedFlexData, oMockFlexSettings } = mockSupportAPIFunctions();
			const dStartTime = new Date();
			const oResult = await FlexibilityDataExtractor.extractFlexibilityData(false, false);
			const dEndTime = new Date();

			// Verify basic metadata
			assert.strictEqual(oResult.extractorVersion, "2.0", "Extractor version is set correctly");
			assert.strictEqual(oResult.ui5Version, "1.120.0", "UI5 version is extracted correctly from VersionInfo");
			assert.strictEqual(oResult.appVersion, "1.2.3", "App version is extracted correctly");
			assert.strictEqual(oResult.appACH, "CA-UI5-FL", "App ACH is extracted correctly");

			// Verify extraction timestamp
			assert.ok(oResult.extractionTimeStamp, "Extraction timestamp is set");
			assert.strictEqual(typeof oResult.extractionTimeStamp, "string", "Timestamp is a string");
			const dParsedTimestamp = new Date(oResult.extractionTimeStamp);
			assert.ok(!isNaN(dParsedTimestamp.getTime()), "Timestamp is a valid date");
			assert.ok(dParsedTimestamp >= dStartTime, "Timestamp is not before test start");
			assert.ok(dParsedTimestamp <= dEndTime, "Timestamp is not after test end");

			// Verify reduced dataset structure
			assert.deepEqual(oResult.cachedBackendResponse, oMockCachedFlexData, "Cached backend response is included");
			assert.ok(oResult.flexObjectInfos, "Flex object infos structure is present");
			assert.deepEqual(oResult.flexSettings, oMockFlexSettings, "Flex settings are extracted correctly");

			// Verify liveDependencyMap is processed correctly (IDs extracted)
			assert.deepEqual(
				oResult.flexObjectInfos.liveDependencyMap.aChanges,
				["change1", "change2"],
				"aChanges contains change IDs"
			);
			assert.deepEqual(
				oResult.flexObjectInfos.liveDependencyMap.mChanges.control1,
				["change1"],
				"mChanges.control1 contains change IDs"
			);
			assert.deepEqual(
				oResult.flexObjectInfos.liveDependencyMap.mChanges.control2,
				["change2"],
				"mChanges.control2 contains change IDs"
			);
			assert.deepEqual(
				oResult.flexObjectInfos.liveDependencyMap.mDependencies.change1,
				["change2"],
				"mDependencies contains change IDs"
			);

			// Verify apply states
			assert.deepEqual(
				oResult.flexObjectInfos.applyStates,
				{ change1: "applied", change2: "pending" },
				"Apply states are correctly mapped"
			);

			// Verify no anonymization occurred (no user data in reduced set anyway)
			assert.strictEqual(oResult.flexSettings[0].value, "JohnDoesEmail", "User data is not anonymized");
			assert.strictEqual(
				oResult.flexObjectInfos.allFlexObjectFileContents[0].support.user,
				"JohnDoesEmail",
				"User data in dependencies is not anonymized"
			);
		});

		QUnit.test("extractFlexibilityData - exports reduced dataset with anonymization", async function(assert) {
			mockSupportAPIFunctions();

			const oResult = await FlexibilityDataExtractor.extractFlexibilityData(true, false);

			// Verify reduced dataset structure
			assert.strictEqual(oResult.flexObjectInfos.allFlexObjectFileContents.length, 2, "All flex object file contents are present");
			assert.strictEqual(oResult.flexObjectInfos.liveDependencyMap.aChanges.length, 2, "Flex object infos structure is present");
			assert.strictEqual(Object.keys(oResult.flexObjectInfos.applyStates).length, 2, "Apply states structure is present");

			// Verify data is anonymized when bAnonymizeUsers is true
			assert.strictEqual(oResult.flexSettings[0].value, "USER_1", "userId in flexSettings is anonymized");
			assert.strictEqual(oResult.flexSettings[1].value, true, "Non-user setting is unchanged");
			assert.strictEqual(
				oResult.flexObjectInfos.allFlexObjectFileContents[0].support.user,
				"USER_1",
				"User in cached flex data is anonymized consistently"
			);
			assert.strictEqual(
				oResult.flexObjectInfos.allFlexObjectFileContents[1].support.user,
				"USER_2",
				"Different user in cached flex data gets different anonymized value"
			);
			assert.strictEqual(
				oResult.flexObjectInfos.allFlexObjectFileContents[1].content[0][0].user,
				"USER_2",
				"User name covered in array in revert data is anonymized consistently"
			);
		});
	});
});