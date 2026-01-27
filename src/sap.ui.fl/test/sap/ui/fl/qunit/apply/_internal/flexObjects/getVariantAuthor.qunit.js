/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/flexObjects/getVariantAuthor",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	Lib,
	getVariantAuthor,
	Loader,
	Settings,
	Layer,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	const sYou = Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME");
	QUnit.module("get variant authors", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("get variant authors", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getUser() { return "userA";}
			});
			sandbox.stub(Loader, "getCachedFlexData").returns({
				data: {
					authors: {
						userD: "Name of user D"
					}
				}
			});
			assert.equal(getVariantAuthor("userB", Layer.USER, undefined), sYou, "user variant always has You as author");
			assert.equal(getVariantAuthor("userA", Layer.PUBLIC, undefined), sYou, "public variant of same user has You as author");
			assert.equal(getVariantAuthor("vendorA", Layer.VENDOR, undefined), "vendorA", "vendor variant has support user as author");
			assert.equal(getVariantAuthor("userC", Layer.CUSTOMER, undefined), "userC", "customer variant has support user as author when no author name provided");
			assert.equal(getVariantAuthor("userD", Layer.PUBLIC, "reference"), "Name of user D", "public variant has user name as author when user name provided");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});