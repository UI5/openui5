/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Context",
	"sap/ui/model/json/TypedJSONContext"
], function (Log, Context, TypedJSONContext) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.json.TypedJSONContext", {
		beforeEach: function() {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		// code under test
		const oTypedContext = new TypedJSONContext("~oModel", "/path");

		assert.ok(oTypedContext instanceof TypedJSONContext);
		assert.ok(oTypedContext instanceof Context);
		assert.ok(oTypedContext.isA("sap.ui.model.Context"));
	});
});
