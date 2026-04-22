/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/connectors/BtpServiceConnector"
], function(
	sinon,
	Utils,
	BtpServiceConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("BtpServiceConnector", {
		beforeEach : function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("loadFlexData trigger the correct request to back end", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "reference"
			};
			var sExpectedUrl = "/flexKeyuser/flex/all/v3/data/reference";
			var oStubGetUrlWithQueryParameters = sandbox.stub(Utils, "getUrl").returns(sExpectedUrl);
			var oStubSendRequest = sandbox.stub(Utils, "sendRequest").resolves({
				response : {
					contents: [
						{
							changes: []
						}
					]
				},
				xsrfToken : "newToken",
				status: "200"
			});
			return BtpServiceConnector.loadFlexData(mPropertyBag).then(function () {
				assert.ok(oStubGetUrlWithQueryParameters.calledOnce, "getUrl is called once");
				assert.equal(oStubGetUrlWithQueryParameters.getCall(0).args[0], "/flex/all/v3/data", "with correct route path");
				assert.deepEqual(oStubGetUrlWithQueryParameters.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], "GET", "with correct method");
			});
		});

		QUnit.test("loadFlexData merges the compVariants in the changes", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "reference"
			};
			var sExpectedUrl = "/flexKeyuser/flex/all/v3/data/reference";
			sandbox.stub(Utils, "getUrl").returns(sExpectedUrl);
			sandbox.stub(Utils, "sendRequest").resolves({
				response : {
					contents: [
						{
							changes: [1],
							compVariants: [2]
						},
						{
							changes: [3],
							compVariants: [4]
						}
					]
				},
				status: "200"
			});
			return BtpServiceConnector.loadFlexData(mPropertyBag).then(function (oFlexData) {
				assert.equal(oFlexData[0].changes.length, 2, "two entries are in the change section");
				assert.equal(oFlexData[0].changes[0], 1, "the change entry is contained");
				assert.equal(oFlexData[0].changes[1], 2, "the compVariant entry is contained");
				assert.equal(oFlexData[1].changes.length, 2, "two entries are in the change section");
				assert.equal(oFlexData[1].changes[0], 3, "the change entry is contained");
				assert.equal(oFlexData[1].changes[1], 4, "the compVariant entry is contained");
			});
		});

		QUnit.test("loadFlexData add variantManagementChanges to PUBLIC layer", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				reference: "reference"
			};
			var sExpectedUrl = "/flexKeyuser/flex/all/v3/data/reference";
			sandbox.stub(Utils, "getUrl").returns(sExpectedUrl);
			sandbox.stub(Utils, "sendRequest").resolves({
				response : {
					contents: [
						{
							changes: [1],
							compVariants:[],
							variantManagementChanges: [2]
						},
						{
							changes: [3],
							compVariants:[]
						},
						{
							changes:[4],
							compVariants:[],
							variantManagementChanges: [5]
						}
					]
				},
				status: "200"
			});
			return BtpServiceConnector.loadFlexData(mPropertyBag).then(function (oFlexData) {
				assert.equal(oFlexData[0].changes.length, 1, "one entry are in the CUSTOMER change section");
				assert.equal(oFlexData[0].changes[0], 1, "the change entry is contained");
				assert.equal(oFlexData[0].variantManagementChanges.length, 1, "one entry are in the CUSTOMER variantManagementChanges section");
				assert.equal(oFlexData[0].variantManagementChanges[0], 2, "the variantManagementChanges entry is contained");
				assert.equal(oFlexData[1].changes.length, 1, "one entry are in the PUBLIC change section");
				assert.equal(oFlexData[1].changes[0], 3, "the change entry is contained");
				assert.equal(oFlexData[1].variantManagementChanges.length, 0, "one entry are in the PUBLIC variantManagementChanges section");
				assert.equal(oFlexData[2].changes.length, 1, "one entry are in the USER change section");
				assert.equal(oFlexData[2].changes[0], 4, "the change entry is contained");
				assert.equal(oFlexData[2].variantManagementChanges.length, 1, "one entry are in the USER variantManagementChanges section");
				assert.equal(oFlexData[2].variantManagementChanges[0], 5, "the variantManagementChanges entry is contained");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});