/* global QUnit */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/initial/_internal/connectors/BtpServiceConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/BtpServiceConnector",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	Localization,
	_omit,
	InitialConnector,
	InitialUtils,
	BtpServiceConnector,
	WriteUtils,
	Layer,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	QUnit.module("Seen Features", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getSeenFeatureIds", async function(assert) {
			const oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves(
				{ response: { seenFeatureIds: ["feature1", "feature2"] } }
			);
			const oResult = await BtpServiceConnector.getSeenFeatureIds({
				layer: Layer.CUSTOMER, url: "/btp"
			});
			const sUrl = "/btp/flex/all/v3/seenFeatures";
			assert.ok(oStubSendRequest.calledWith(sUrl, "GET", {
				initialConnector: InitialConnector
			}), "a GET request with correct parameters is sent");
			assert.deepEqual(oResult, ["feature1", "feature2"], "the seen feature ids are returned");
		});

		QUnit.test("setSeenFeatureIds", async function(assert) {
			const oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves(
				{ response: { seenFeatureIds: ["feature1", "feature2", "feature3"] } }
			);
			const oResult = await BtpServiceConnector.setSeenFeatureIds({
				layer: Layer.CUSTOMER, seenFeatureIds: ["feature1", "feature2", "feature3"], url: "/btp"
			});
			const sUrl = "/btp/flex/all/v3/seenFeatures";
			assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
				initialConnector: InitialConnector,
				tokenUrl: `/btp${BtpServiceConnector.ROUTES.TOKEN}`,
				payload: JSON.stringify({ seenFeatureIds: ["feature1", "feature2", "feature3"] }),
				dataType: "json",
				contentType: "application/json; charset=utf-8"
			}), "a PUT request with correct parameters is sent");
			assert.deepEqual(oResult, ["feature1", "feature2", "feature3"], "the seen feature ids are returned");
		});
	});

	QUnit.module("condense", {
		beforeEach() {
			sandbox.stub(Localization, "getLanguage").returns("de");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with parentVersion", async function(assert) {
			const oPayload = {
				layer: "CUSTOMER",
				create: {},
				update: {},
				reorder: {},
				"delete": {}
			};
			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves("response");
			const oResult = await BtpServiceConnector.condense({
				url: "my/url",
				flexObjects: oPayload,
				allChanges: [],
				parentVersion: "0",
				reference: "my/fancy/reference"
			});
			const aArgs = oSendRequestStub.lastCall.args;
			assert.strictEqual(aArgs[0], "my/url/flex/all/v3/actions/condense/my/fancy/reference?parentVersion=0&sap-language=de");
			assert.strictEqual(aArgs[1], "POST");
			assert.deepEqual(_omit(aArgs[2], "initialConnector"), {
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: JSON.stringify(oPayload),
				tokenUrl: `my/url${BtpServiceConnector.ROUTES.TOKEN}`
			});
			assert.strictEqual(oResult, "response", "the function returns the response of the request");
		});

		QUnit.test("without parentVersion", async function(assert) {
			const oPayload = {
				layer: "USER",
				create: {},
				update: {},
				reorder: {},
				"delete": {}
			};
			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves("response");
			const oResult = await BtpServiceConnector.condense({
				url: "my/url",
				flexObjects: oPayload,
				allChanges: [],
				reference: "my/fancy/reference"
			});
			const aArgs = oSendRequestStub.lastCall.args;
			assert.strictEqual(aArgs[0], "my/url/flex/all/v3/actions/condense/my/fancy/reference?sap-language=de");
			assert.strictEqual(aArgs[1], "POST");
			assert.deepEqual(_omit(aArgs[2], "initialConnector"), {
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				payload: JSON.stringify(oPayload),
				tokenUrl: `my/url${BtpServiceConnector.ROUTES.TOKEN}`
			});
			assert.strictEqual(oResult, "response", "the function returns the response of the request");
		});
	});

	QUnit.module("User variants deletion", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when deleting user variants with given variant management references", async function(assert) {
			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves();
			const testPayload = {
				flexReference: "testReference",
				variantManagementReferences: ["vm1", "vm2"]
			};
			await BtpServiceConnector.deleteUserVariantsForVM({
				url: "/btp",
				...testPayload
			});

			assert.strictEqual(oSendRequestStub.callCount, 1, "then the request is sent");
			assert.strictEqual(
				oSendRequestStub.lastCall.args[0],
				"/btp/flex/all/v3/variantdata/delete",
				"then the correct URL is used"
			);
			assert.strictEqual(
				oSendRequestStub.lastCall.args[1],
				"POST",
				"then the correct HTTP method is used"
			);
			assert.deepEqual(
				oSendRequestStub.lastCall.args[2],
				{
					tokenUrl: `/btp${BtpServiceConnector.ROUTES.TOKEN}`,
					initialConnector: InitialConnector,
					payload: JSON.stringify(testPayload),
					dataType: "json",
					contentType: "application/json; charset=utf-8"
				},
				"then the correct request options are used"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
