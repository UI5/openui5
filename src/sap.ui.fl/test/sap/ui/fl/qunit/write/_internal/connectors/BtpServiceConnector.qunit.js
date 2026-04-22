/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/connectors/BtpServiceConnector",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	sinon,
	BtpServiceConnector,
	ApplyConnector,
	WriteUtils
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
		QUnit.test("given a mock server, when write is triggered with CUSTOMER variant", function (assert) {
			var oExpectedFlexObject = [{
				fileType: "variant",
				fileName: "myFileName",
				namespace: "myNamespace",
				layer: "PUBLIC"
			}];
			var mPropertyBag = {
				url : "/flexKeyuser",
				flexObjects : [{
					fileType: "variant",
					fileName: "myFileName",
					namespace: "myNamespace",
					layer: "CUSTOMER"
				}]
			};
			var sUrl = "/flexKeyuser/flex/all/v3/changes";
			var oExpected = {
				xsrfToken : undefined,
				tokenUrl : "/flexKeyuser/flex/all/v3/settings",
				applyConnector : ApplyConnector,
				contentType : "application/json; charset=utf-8",
				dataType : "json",
				payload : JSON.stringify(oExpectedFlexObject)
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return BtpServiceConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl);
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST");
				assert.deepEqual(JSON.parse(JSON.stringify(oStubSendRequest.getCall(0).args[2])), JSON.parse(JSON.stringify(oExpected)));
			});
		});

		QUnit.test("given a mock server, when write is triggered with USER variant", function (assert) {
			var oFlexObject = [{
				fileType: "variant",
				fileName: "myFileName",
				namespace: "myNamespace",
				layer: "USER"
			}];
			var mPropertyBag = {
				url : "/flexKeyuser",
				flexObjects : oFlexObject
			};
			var sUrl = "/flexKeyuser/flex/all/v3/changes";
			var oExpected = {
				xsrfToken : undefined,
				tokenUrl : "/flexKeyuser/flex/all/v3/settings",
				applyConnector : ApplyConnector,
				contentType : "application/json; charset=utf-8",
				dataType : "json",
				payload : JSON.stringify(oFlexObject)
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return BtpServiceConnector.write(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl);
				assert.equal(oStubSendRequest.getCall(0).args[1], "POST");
				assert.deepEqual(JSON.parse(JSON.stringify(oStubSendRequest.getCall(0).args[2])), JSON.parse(JSON.stringify(oExpected)));
			});
		});

		QUnit.test("given a mock server, when update is triggered with CUSTOMER change", function (assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName",
				layer: "CUSTOMER"
			};
			var mPropertyBag = {url : "/flexKeyuser", flexObject : oFlexObject};
			var sUrl = "/flexKeyuser/flex/all/v3/changes/myFileName";
			var oExpected = {
				xsrfToken : undefined,
				tokenUrl : "/flexKeyuser/flex/all/v3/settings",
				applyConnector : ApplyConnector,
				contentType : "application/json; charset=utf-8",
				dataType : "json",
				payload : JSON.stringify(oFlexObject)
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return BtpServiceConnector.update(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl);
				assert.equal(oStubSendRequest.getCall(0).args[1], "PUT");
				assert.deepEqual(JSON.parse(JSON.stringify(oStubSendRequest.getCall(0).args[2])), JSON.parse(JSON.stringify(oExpected)));
			});
		});

		QUnit.test("given a mock server, when update is triggered with CUSTOMER variant", function (assert) {
			var oExpectedFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				layer: "PUBLIC"
			};
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				layer: "CUSTOMER"
			};
			var mPropertyBag = {url : "/flexKeyuser", flexObject : oFlexObject};
			var sUrl = "/flexKeyuser/flex/all/v3/changes/myFileName";
			var oExpected = {
				xsrfToken : undefined,
				tokenUrl : "/flexKeyuser/flex/all/v3/settings",
				applyConnector : ApplyConnector,
				contentType : "application/json; charset=utf-8",
				dataType : "json",
				payload : JSON.stringify(oExpectedFlexObject)
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return BtpServiceConnector.update(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl);
				assert.equal(oStubSendRequest.getCall(0).args[1], "PUT");
				assert.deepEqual(JSON.parse(JSON.stringify(oStubSendRequest.getCall(0).args[2])), JSON.parse(JSON.stringify(oExpected)));
			});
		});

		QUnit.test("given a mock server, when remove is triggered", function (assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				namespace: "myNamespace",
				layer: "VENDOR"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/flexKeyuser"
			};
			var sUrl = "/flexKeyuser/flex/all/v3/changes/myFileName?namespace=myNamespace";
			var oExpected = {
				xsrfToken : undefined,
				tokenUrl : "/flexKeyuser/flex/all/v3/settings",
				applyConnector : ApplyConnector,
				contentType : "application/json; charset=utf-8",
				dataType : "json"
			};
			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves();

			return BtpServiceConnector.remove(mPropertyBag).then(function () {
				assert.equal(oStubSendRequest.getCall(0).args[0], sUrl);
				assert.equal(oStubSendRequest.getCall(0).args[1], "DELETE");
				assert.deepEqual(JSON.parse(JSON.stringify(oStubSendRequest.getCall(0).args[2])), JSON.parse(JSON.stringify(oExpected)));
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
