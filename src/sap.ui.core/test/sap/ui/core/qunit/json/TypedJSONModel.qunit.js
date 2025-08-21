/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/json/TypedJSONModel"
], function (Log, JSONModel, TypedJSONModel) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.json.TypedJSONModel", {
		beforeEach: function() {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		// code under test
		const oTypedModel = new TypedJSONModel({prop: "foo"});

		assert.ok(oTypedModel instanceof TypedJSONModel);
		assert.ok(oTypedModel instanceof JSONModel);
		assert.ok(oTypedModel.isA("sap.ui.model.json.JSONModel"));
	});
});
