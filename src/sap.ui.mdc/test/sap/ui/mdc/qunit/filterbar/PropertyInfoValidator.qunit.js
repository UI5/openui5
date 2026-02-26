/* global QUnit, sinon*/

sap.ui.define([
	"sap/ui/mdc/filterbar/PropertyInfoValidator",
	"sap/base/Log"
], function (
	PropertyInfoValidator,
	Log
) {
	"use strict";

	QUnit.module("checkMandatoryProperty");

	const sCheckMandatoryPropertWarningText = "sap.ui.mdc.util.PropertyInfoValidator:checkMandatoryProperty either Control or property name are not defined.";

	QUnit.test("should return false when oControl is not set", function (assert) {
		const fnLogWarningSpy = sinon.spy(Log, "warning");

		[undefined, null, false].forEach((vIncorrectValue) => {
			const bReturnValue = PropertyInfoValidator.checkMandatoryProperty(undefined, "TestProperty");
			assert.notOk(bReturnValue, "should return false when oControl = undefined");
			assert.ok(fnLogWarningSpy.calledOnce, "should log a warning");
			assert.ok(fnLogWarningSpy.calledWith(sCheckMandatoryPropertWarningText), "should log correct warning");

			fnLogWarningSpy.reset();
		});

		fnLogWarningSpy.restore();
	});

	QUnit.test("should return false when sPropertyName is not set", function (assert) {
		const fnLogWarningSpy = sinon.spy(Log, "warning");

		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const fnGetPropertyStub = sinon.stub().returns(true);
		const fnIsPropertyInitialStub = sinon.stub().returns(true);
		const fnIsBoundStub = sinon.stub().returns(false);
		const oControlMock = {
			getId: fnGetIdStub,
			getProperty: fnGetPropertyStub,
			isPropertyInitial: fnIsPropertyInitialStub,
			isBound: fnIsBoundStub
		};

		["", undefined, null, false].forEach((vIncorrectValue) => {
			const bReturnValue = PropertyInfoValidator.checkMandatoryProperty(oControlMock, vIncorrectValue);
			assert.notOk(bReturnValue, `should return false when sPropertyName = '${vIncorrectValue}'`);
			assert.ok(fnLogWarningSpy.calledOnce, "should log a warning");
			assert.ok(fnLogWarningSpy.calledWith(sCheckMandatoryPropertWarningText), "should log correct warning");

			assert.ok(fnGetIdStub.notCalled, "should not call 'getId' on oControl");
			assert.ok(fnGetPropertyStub.notCalled, "should not call 'getProperty' on oControl");
			assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' on oControl");

			fnLogWarningSpy.reset();
		});

		fnLogWarningSpy.restore();
	});

	QUnit.test("should return false when property is initial", function (assert) {
		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const fnGetPropertyStub = sinon.stub().returns(true);
		const fnIsPropertyInitialStub = sinon.stub().returns(true);
		const fnIsBoundStub = sinon.stub().returns(false);
		const oControlMock = {
			getId: fnGetIdStub,
			getProperty: fnGetPropertyStub,
			isPropertyInitial: fnIsPropertyInitialStub,
			isBound: fnIsBoundStub
		};

		const sPropertyName = "testPropertyName";

		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
		assert.ok(fnGetIdStub.notCalled, "should not call 'getId' initially");
		assert.ok(fnGetPropertyStub.notCalled, "should not call 'getProperty' initially");

		const bReturnValue = PropertyInfoValidator.checkMandatoryProperty(oControlMock, sPropertyName);

		assert.ok(fnIsPropertyInitialStub.calledOnce, "should call 'isPropertyInitial'");
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName), "should call 'isPropertyInitial' with correct property name");
		assert.ok(fnGetIdStub.notCalled, "should not call 'getId'");
		assert.ok(fnGetPropertyStub.notCalled, "should not call 'getProperty'");
		assert.notOk(bReturnValue, "should return false");
	});

	QUnit.test("should call 'getProperty' with given property name", function (assert) {
		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const fnGetPropertyStub = sinon.stub().returns(true);
		const fnIsPropertyInitialStub = sinon.stub().returns(false);
		const fnIsBoundStub = sinon.stub().returns(false);
		const oControlMock = {
			getId: fnGetIdStub,
			getProperty: fnGetPropertyStub,
			isPropertyInitial: fnIsPropertyInitialStub,
			isBound: fnIsBoundStub
		};

		const sPropertyName = "testPropertyName";

		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
		assert.ok(fnGetIdStub.notCalled, "should not call 'getId' initially");
		assert.ok(fnGetPropertyStub.notCalled, "should not call 'getProperty' initially");

		const bReturnValue = PropertyInfoValidator.checkMandatoryProperty(oControlMock, sPropertyName);

		assert.ok(fnIsPropertyInitialStub.calledOnce, "should call 'isPropertyInitial'");
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName), "should call 'isPropertyInitial' with correct property name");
		assert.ok(fnGetIdStub.notCalled, "should not call 'getId'");
		assert.ok(fnGetPropertyStub.calledOnce, "should call 'getProperty'");
		assert.ok(fnGetPropertyStub.calledWith(sPropertyName), "should call 'getProperty' with correct property name");
		assert.ok(bReturnValue, "should return true");
	});

	[undefined, null, ""].forEach((vFalseValue) => {
		QUnit.test(`should log an error and return 'false' when given property is ${vFalseValue}`, function (assert) {
			const fnLogErrorSpy = sinon.spy(Log, "error");

			const sId = `__control0`;
			const fnGetIdStub = sinon.stub().returns(sId);
			const fnGetPropertyStub = sinon.stub().returns(vFalseValue);
			const fnIsPropertyInitialStub = sinon.stub().returns(false);
			const fnIsBoundStub = sinon.stub().returns(false);
			const fngetBindingStub = sinon.stub().returns(undefined);
			const oControlMock = {
				getId: fnGetIdStub,
				getProperty: fnGetPropertyStub,
				isPropertyInitial: fnIsPropertyInitialStub,
				isBound: fnIsBoundStub,
				getBinding: fngetBindingStub
			};

			assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
			assert.ok(fnLogErrorSpy.notCalled, "should not log an error initially");

			const sPropertyName = "No proper property name needed as we always return vFalseValue";
			const bReturnValue = PropertyInfoValidator.checkMandatoryProperty(oControlMock, sPropertyName);

			assert.ok(fnIsPropertyInitialStub.calledOnce, "should call 'isPropertyInitial'");
			assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName), "should call 'isPropertyInitial' with correct property name");
			assert.ok(fnIsBoundStub.calledOnce, "should call 'isBound'");
			assert.ok(fnIsBoundStub.calledWith(sPropertyName), "should call 'isBound' with correct property name");
			assert.ok(fngetBindingStub.notCalled, "should not call 'getBinding'");
			assert.ok(fnLogErrorSpy.calledOnce, "should log an error");
			assert.ok(fnLogErrorSpy.calledWith(`sap.ui.mdc.util.PropertyInfoValidator: Control '${sId}' is missing mandatory property '${sPropertyName}'`), "should correct error message");
			assert.notOk(bReturnValue, "should return false");

			fnLogErrorSpy.restore();
		});
	});

	QUnit.test("should not log an error and return false when given property is bound but binding not ready", function (assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");

		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const sPropertyName = "testProperty";
		const fnGetPropertyStub = sinon.stub().withArgs(sPropertyName).returns(true);
		const fnIsPropertyInitialStub = sinon.stub().returns(true);
		const fnIsBoundStub = sinon.stub().returns(true);
		const fngetBindingStub = sinon.stub().returns(undefined);
		const oControlMock = {
			getId: fnGetIdStub,
			getProperty: fnGetPropertyStub,
			isPropertyInitial: fnIsPropertyInitialStub,
			isBound: fnIsBoundStub,
			getBinding: fngetBindingStub,
			mProperties: {}
		};

		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not log an error initially");

		const bReturnValue = PropertyInfoValidator.checkMandatoryProperty(oControlMock, sPropertyName);

		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial'");
		assert.ok(fnIsBoundStub.calledOnce, "should call 'isBound'");
		assert.ok(fnIsBoundStub.calledWith(sPropertyName), "should call 'isBound' with correct property name");
		assert.ok(fngetBindingStub.calledOnce, "should call 'getBinding'");
		assert.ok(fngetBindingStub.calledWith(sPropertyName), "should call 'getBinding' with correct property name");
		assert.ok(fnLogErrorSpy.notCalled, "should not log an error");
		assert.notOk(bReturnValue, "should return false");
		assert.ok(fnGetIdStub.notCalled, "should not call 'getId'");
		fnLogErrorSpy.restore();
	});

	QUnit.test("should not log an error and return true when given property is bound and binding is ready", function (assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");

		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const sPropertyName = "testProperty";
		const fnGetPropertyStub = sinon.stub().withArgs(sPropertyName).returns(true);
		const fnIsPropertyInitialStub = sinon.stub().returns(false);
		const fnIsBoundStub = sinon.stub().returns(true);
		const fngetBindingStub = sinon.stub().returns({}); // just return an object
		const oControlMock = {
			getId: fnGetIdStub,
			getProperty: fnGetPropertyStub,
			isPropertyInitial: fnIsPropertyInitialStub,
			isBound: fnIsBoundStub,
			getBinding: fngetBindingStub,
			mProperties: {"testProperty": true}
		};

		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not log an error initially");

		const bReturnValue = PropertyInfoValidator.checkMandatoryProperty(oControlMock, sPropertyName);

		assert.ok(fnIsPropertyInitialStub.calledOnce, "should call 'isPropertyInitial'");
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName), "should call 'isPropertyInitial' with correct property name");
		assert.ok(fnIsBoundStub.calledOnce, "should call 'isBound'");
		assert.ok(fnIsBoundStub.calledWith(sPropertyName), "should call 'isBound' with correct property name");
		assert.ok(fngetBindingStub.calledOnce, "should call 'getBinding'");
		assert.ok(fngetBindingStub.calledWith(sPropertyName), "should call 'getBinding' with correct property name");
		assert.ok(fnLogErrorSpy.notCalled, "should not log an error");
		assert.ok(bReturnValue, "should return true");
		assert.ok(fnGetIdStub.notCalled, "should not call 'getId'");
		fnLogErrorSpy.restore();
	});

	QUnit.test("should not log an error and return true when given property is set", function (assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");

		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const sPropertyName = "testProperty";
		const fnGetPropertyStub = sinon.stub().withArgs(sPropertyName).returns(true);
		const fnIsPropertyInitialStub = sinon.stub().returns(false);
		const fnIsBoundStub = sinon.stub().returns(false);
		const oControlMock = {
			getId: fnGetIdStub,
			getProperty: fnGetPropertyStub,
			isPropertyInitial: fnIsPropertyInitialStub,
			isBound: fnIsBoundStub
		};

		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not log an error initially");

		const bReturnValue = PropertyInfoValidator.checkMandatoryProperty(oControlMock, sPropertyName);

		assert.ok(fnIsPropertyInitialStub.calledOnce, "should call 'isPropertyInitial'");
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName), "should call 'isPropertyInitial' with correct property name");
		assert.ok(fnLogErrorSpy.notCalled, "should not log an error");
		assert.ok(bReturnValue, "should return true");
		assert.ok(fnGetIdStub.notCalled, "should not call 'getId'");
		fnLogErrorSpy.restore();
	});

	QUnit.module("checkMandatoryProperties");

	const MANDATORY_PROPERTIES = {
		"dataType": "dataType",
		"dataTypeConstraints": "constraints",
		"dataTypeFormatOptions": "formatOptions",
		"label": "label",
		"maxConditions": "maxConditions"
	};
	const aMandatoryProperties = Object.keys(MANDATORY_PROPERTIES);

	QUnit.test("should call 'checkMandatoryProperty' for given properties", function (assert) {
		const oControlMock = {};
		const fnCheckMandatoryPropertyStub = sinon.stub(PropertyInfoValidator, "checkMandatoryProperty");

		assert.ok(fnCheckMandatoryPropertyStub.notCalled, "should not call 'checkMandatoryProperty' initially");

		PropertyInfoValidator.checkMandatoryProperties(oControlMock);
		assert.equal(fnCheckMandatoryPropertyStub.getCalls().length, aMandatoryProperties.length, `should call 'checkMandatoryProperty' ${aMandatoryProperties.length} times`);
		aMandatoryProperties.forEach((sMandatoryProperty) => {
			assert.ok(fnCheckMandatoryPropertyStub.calledWith(oControlMock, sMandatoryProperty), `should call 'checkMandatoryProperty' with '${sMandatoryProperty}'`);
		});

		fnCheckMandatoryPropertyStub.restore();
	});

	QUnit.test("should return true when all mandatory properties are set", function (assert) {
		const oControlMock = {};
		const fnCheckMandatoryPropertyStub = sinon.stub(PropertyInfoValidator, "checkMandatoryProperty").returns(true);

		assert.ok(fnCheckMandatoryPropertyStub.notCalled, "should not call 'checkMandatoryProperty' initially");

		const bReturnValue = PropertyInfoValidator.checkMandatoryProperties(oControlMock);

		assert.ok(bReturnValue, "should return true");

		fnCheckMandatoryPropertyStub.restore();
	});

	aMandatoryProperties.forEach((sMandatoryProperty) => {
		QUnit.test(`should return false when '${sMandatoryProperty}' is not set`, function (assert) {
			const oControlMock = {};
			const fnCheckMandatoryPropertyStub = sinon.stub(PropertyInfoValidator, "checkMandatoryProperty");
			fnCheckMandatoryPropertyStub.returns(true);
			fnCheckMandatoryPropertyStub.withArgs(oControlMock, sMandatoryProperty).returns(false);

			const bReturnValue = PropertyInfoValidator.checkMandatoryProperties(oControlMock);
			assert.notOk(bReturnValue, "should return false");

			fnCheckMandatoryPropertyStub.restore();
		});
	});

	QUnit.module("comparePropertyInfoWithControl");

	QUnit.test("should do nothing when oControl is not provided", function(assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");
		const fnObjectKeysSpy = sinon.spy(Object, "keys");

		assert.ok(fnObjectKeysSpy.notCalled, "should not get keys of oPropertyInfo initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error initially");

		PropertyInfoValidator.comparePropertyInfoWithControl(undefined, {});
		PropertyInfoValidator.comparePropertyInfoWithControl(null, {});
		PropertyInfoValidator.comparePropertyInfoWithControl(false, {});

		assert.ok(fnObjectKeysSpy.notCalled, "should not get keys of oPropertyInfo");
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error");

		fnLogErrorSpy.restore();
		fnObjectKeysSpy.restore();
	});

	QUnit.test("should do nothing when oPropertyInfo is not provided, but all mandatory properties are not initial on oControl", function(assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");
		const fnObjectKeysSpy = sinon.spy(Object, "keys");

		assert.ok(fnObjectKeysSpy.notCalled, "should not get keys of oPropertyInfo initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error initially");

		const fnIsPropertyInitialStub = sinon.stub().returns(false);
		const getPropertyStub = sinon.stub().returns("some value");
		const fnIsBoundStub = sinon.stub().returns(false);

		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getProperty: getPropertyStub,
			isBound: fnIsBoundStub
		};

		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, undefined);
		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, null);
		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, false);

		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error");

		fnLogErrorSpy.restore();
		fnObjectKeysSpy.restore();
	});

	QUnit.test("should log error when oPropertyInfo is not provided and oControl has not all mandatory properties", function(assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");
		const fnObjectKeysSpy = sinon.spy(Object, "keys");

		assert.ok(fnObjectKeysSpy.notCalled, "should not get keys of oPropertyInfo initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error initially");

		const fnIsPropertyInitialStub = sinon.stub().returns(true);
		const fnIsBoundStub = sinon.stub().returns(false);
		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getId: () => "__control0",
			isBound: fnIsBoundStub
		};

		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, undefined);
		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, null);
		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, false);

		assert.ok(fnLogErrorSpy.called, "should Log an error");

		fnLogErrorSpy.restore();
		fnObjectKeysSpy.restore();
	});

	QUnit.test("should do nothing when oPropertyInfo has no relevant properties", function(assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");
		const fnObjectKeysSpy = sinon.spy(Object, "keys");
		const oPropertyInfo = {
			"name": "nameValue",
			"key": "keyValue"
		};
		const fnIsPropertyInitialStub = sinon.stub();
		const fnGetMetadataStub = sinon.stub().returns({
			getAllProperties: () => { return {}; }
		});
		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getMetadata: fnGetMetadataStub
		};

		assert.ok(fnObjectKeysSpy.notCalled, "should not get keys of oPropertyInfo initially");
		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error initially");

		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, oPropertyInfo);

		assert.ok(fnObjectKeysSpy.called, "should call 'keys'");
		assert.ok(fnObjectKeysSpy.calledWith(oPropertyInfo), "should get keys of oPropertyInfo");
		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial'");
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error");

		fnLogErrorSpy.restore();
		fnObjectKeysSpy.restore();
	});

	QUnit.test("should not Log an error when oPropertyInfo has the same properties as the given oControl", function(assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");
		const fnObjectKeysSpy = sinon.spy(Object, "keys");

		const sPropertyName = "__property0";
		const oPropertyInfo = {
			"name": "nameValue",
			"key": "keyValue"
		};
		oPropertyInfo[sPropertyName] = "propertyValue";

		const fnIsPropertyInitialStub = sinon.stub();
		fnIsPropertyInitialStub.returns(true);
		fnIsPropertyInitialStub.withArgs(sPropertyName).returns(false);
		const fnGetMetadataStub = sinon.stub().returns({
			getAllProperties: () => ({
					[sPropertyName]: { name: sPropertyName }
				})
		});
		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getMetadata: fnGetMetadataStub
		};

		assert.ok(fnObjectKeysSpy.notCalled, "should not get keys of oPropertyInfo initially");
		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error initially");

		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, oPropertyInfo);

		assert.ok(fnObjectKeysSpy.called, "should call 'keys'");
		assert.ok(fnObjectKeysSpy.calledWith(oPropertyInfo), "should get keys of oPropertyInfo");
		assert.ok(fnIsPropertyInitialStub.calledOnce, "should call 'isPropertyInitial'");
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName), `should call 'isPropertyInitial' with '${sPropertyName}'`);
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error");

		fnLogErrorSpy.restore();
		fnObjectKeysSpy.restore();
	});

	QUnit.test("should Log an error when oPropertyInfo has more properties than the given oControl", function(assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");
		const fnObjectKeysSpy = sinon.spy(Object, "keys");

		const sPropertyName0 = "__property0",
			sPropertyName1 = "__property1";
		const oPropertyInfo = {
			"name": "nameValue",
			"key": "keyValue"
		};
		oPropertyInfo[sPropertyName0] = "propertyValue";
		oPropertyInfo[sPropertyName1] = "propertyValue";

		const fnIsPropertyInitialStub = sinon.stub();
		fnIsPropertyInitialStub.returns(true);
		fnIsPropertyInitialStub.withArgs(sPropertyName0).returns(false);
		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const fnGetMetadataStub = sinon.stub().returns({
			getAllProperties: () => ({
				[sPropertyName0]: { name: sPropertyName0 },
				[sPropertyName1]: { name: sPropertyName1 }
			})
		});
		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getId: fnGetIdStub,
			getMetadata: fnGetMetadataStub
		};

		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error initially");
		assert.ok(fnObjectKeysSpy.notCalled, "should not get keys of oPropertyInfo initially");
		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");

		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, oPropertyInfo);

		assert.ok(fnObjectKeysSpy.called, "should call 'keys'");
		assert.ok(fnObjectKeysSpy.calledWith(oPropertyInfo), "should get keys of oPropertyInfo");
		assert.ok(fnIsPropertyInitialStub.calledTwice, "should call 'isPropertyInitial'");
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName0), `should call 'isPropertyInitial' with '${sPropertyName0}'`);
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName1), `should call 'isPropertyInitial' with '${sPropertyName1}'`);
		assert.ok(fnLogErrorSpy.calledOnce, "should Log an error");
		assert.ok(fnLogErrorSpy.calledWith(`sap.ui.mdc.util.PropertyInfoValidator: the propertyInfo for Control '${sId}' contains more information than the control itself!`), "should Log correct error");

		fnLogErrorSpy.restore();
		fnObjectKeysSpy.restore();
	});

	QUnit.test("should do nothing if the oControl sets no metadata properties explicitly", function(assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");
		const fnObjectKeysSpy = sinon.spy(Object, "keys");

		const sPropertyName0 = "__property0",
			sPropertyName1 = "__property1";
		const oPropertyInfo = {
			"name": "nameValue",
			"key": "keyValue"
		};
		oPropertyInfo[sPropertyName0] = "propertyValue";
		oPropertyInfo[sPropertyName1] = "propertyValue";

		const fnIsPropertyInitialStub = sinon.stub();
		fnIsPropertyInitialStub.returns(true);
		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const fnGetMetadataStub = sinon.stub().returns({
			getAllProperties: () => ({
				[sPropertyName0]: { name: sPropertyName0 },
				[sPropertyName1]: { name: sPropertyName1 }
			})
		});
		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getId: fnGetIdStub,
			getMetadata: fnGetMetadataStub
		};

		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error initially");
		assert.ok(fnObjectKeysSpy.notCalled, "should not get keys of oPropertyInfo initially");
		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");

		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, oPropertyInfo);

		assert.ok(fnObjectKeysSpy.called, "should call 'keys'");
		assert.ok(fnObjectKeysSpy.calledWith(oPropertyInfo), "should get keys of oPropertyInfo");
		assert.ok(fnIsPropertyInitialStub.calledTwice, "should call 'isPropertyInitial'");
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName0), `should call 'isPropertyInitial' with '${sPropertyName0}'`);
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName1), `should call 'isPropertyInitial' with '${sPropertyName1}'`);
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error");

		fnLogErrorSpy.restore();
		fnObjectKeysSpy.restore();
	});

	QUnit.test("should call 'getPropertyNameFromPropertyInfo' when set on oControl", function(assert) {
		const fnLogErrorSpy = sinon.spy(Log, "error");
		const sPropertyName0 = "__property0",
			sPropertyName1 = "__property1";
		const oPropertyInfo = {
			"name": "nameValue",
			"key": "keyValue"
		};
		oPropertyInfo[sPropertyName0] = "propertyValue";
		oPropertyInfo[sPropertyName1] = "propertyValue";

		const sMappedPropertyName = "__property2";
		const fnGetPropertyNameFromPropertyInfo = sinon.stub(PropertyInfoValidator, "_getPropertyNameFromPropertyInfo");
		fnGetPropertyNameFromPropertyInfo.withArgs(sPropertyName0).returns(sPropertyName0);
		fnGetPropertyNameFromPropertyInfo.withArgs(sPropertyName1).returns(sMappedPropertyName);
		const fnIsPropertyInitialStub = sinon.stub();
		fnIsPropertyInitialStub.returns(true);
		fnIsPropertyInitialStub.withArgs(sPropertyName0).returns(false);
		fnIsPropertyInitialStub.withArgs(sMappedPropertyName).returns(false);
		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const fnGetMetadataStub = sinon.stub().returns({
			getAllProperties: () => ({
				[sPropertyName0]: { name: sPropertyName0 },
				[sPropertyName1]: { name: sPropertyName1 }
			})
		});
		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getId: fnGetIdStub,
			getMetadata: fnGetMetadataStub
		};

		assert.ok(fnGetPropertyNameFromPropertyInfo.notCalled, "should not call 'getPropertyNameFromPropertyInfo' initially");
		assert.ok(fnIsPropertyInitialStub.notCalled, "should not call 'isPropertyInitial' initially");
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error initially");

		PropertyInfoValidator.comparePropertyInfoWithControl(oControlMock, oPropertyInfo);

		assert.ok(fnGetPropertyNameFromPropertyInfo.calledTwice, "should call 'getPropertyNameFromPropertyInfo' twice");
		assert.ok(fnGetPropertyNameFromPropertyInfo.calledWith(sPropertyName0), `should call 'getPropertyNameFromPropertyInfo' with '${sPropertyName0}'`);
		assert.ok(fnGetPropertyNameFromPropertyInfo.calledWith(sPropertyName1), `should call 'getPropertyNameFromPropertyInfo' with '${sPropertyName1}'`);
		assert.ok(fnIsPropertyInitialStub.calledTwice, "should call 'isPropertyInitial'");
		assert.ok(fnIsPropertyInitialStub.calledWith(sPropertyName0), `should call 'isPropertyInitial' with '${sPropertyName0}'`);
		assert.ok(fnIsPropertyInitialStub.calledWith(sMappedPropertyName), `should call 'isPropertyInitial' with mapped property '${sMappedPropertyName}'`);
		assert.ok(fnLogErrorSpy.notCalled, "should not Log an error");

		fnLogErrorSpy.restore();
		fnGetPropertyNameFromPropertyInfo.restore();
	});

	QUnit.module("compareControlWithPropertyInfo");

	const aMandatoryPropertiesWithRequired = [...aMandatoryProperties, "required"];

	QUnit.test("should do nothing when oControl is not provided", function(assert) {
		const fnCheckMandatoryPropertySpy = sinon.spy(PropertyInfoValidator, "checkMandatoryProperty");
		const oPropertyInfo = {};

		assert.ok(fnCheckMandatoryPropertySpy.notCalled, "should not call 'checkMandatoryProperty' initially");

		PropertyInfoValidator.compareControlWithPropertyInfo(undefined, oPropertyInfo);
		PropertyInfoValidator.compareControlWithPropertyInfo(null, oPropertyInfo);
		PropertyInfoValidator.compareControlWithPropertyInfo(false, oPropertyInfo);

		assert.ok(fnCheckMandatoryPropertySpy.notCalled, "should not call 'checkMandatoryProperty'");

		fnCheckMandatoryPropertySpy.restore();
	});

	QUnit.test("should do nothing when oPropertyInfo is not provided", function(assert) {
		const fnCheckMandatoryPropertySpy = sinon.spy(PropertyInfoValidator, "checkMandatoryProperty");
		const oControl = {};

		assert.ok(fnCheckMandatoryPropertySpy.notCalled, "should not call 'checkMandatoryProperty' initially");

		PropertyInfoValidator.compareControlWithPropertyInfo(oControl, undefined);
		PropertyInfoValidator.compareControlWithPropertyInfo(oControl, null);
		PropertyInfoValidator.compareControlWithPropertyInfo(oControl, false);

		assert.ok(fnCheckMandatoryPropertySpy.notCalled, "should not call 'checkMandatoryProperty'");

		fnCheckMandatoryPropertySpy.restore();
	});

	QUnit.test("should call 'checkMandatoryProperty' for given properties", function (assert) {
		const fnCheckMandatoryPropertyStub = sinon.stub(PropertyInfoValidator, "checkMandatoryProperty").returns(false);
		const sId = "__control0";
		const fnGetIdStub = sinon.stub().returns(sId);
		const fnSetPropertyStub = sinon.stub();
		const oControlMock = {
			getId: fnGetIdStub,
			setProperty: fnSetPropertyStub
		};

		const fnHasOwnPropertyStub = sinon.stub().returns(false);
		const oPropertyInfo = {
			hasOwnProperty: fnHasOwnPropertyStub
		};

		assert.ok(fnCheckMandatoryPropertyStub.notCalled, "should not call 'checkMandatoryProperty' initially");
		assert.ok(fnSetPropertyStub.notCalled, "should not call 'setProperty'");

		PropertyInfoValidator.compareControlWithPropertyInfo(oControlMock, oPropertyInfo);

		assert.equal(fnCheckMandatoryPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'checkMandatoryProperty' ${aMandatoryPropertiesWithRequired.length} times`);
		aMandatoryPropertiesWithRequired.forEach((sMandatoryProperty) => {
			assert.ok(fnCheckMandatoryPropertyStub.calledWith(oControlMock, sMandatoryProperty), `should call 'checkMandatoryProperty' with ${sMandatoryProperty}`);
		});
		assert.ok(fnSetPropertyStub.notCalled, "should not call 'setProperty'");

		fnCheckMandatoryPropertyStub.restore();
	});

	aMandatoryPropertiesWithRequired.forEach((sMandatoryProperty) => {
		const sPropertyInfoPropertyName = PropertyInfoValidator._getPropertyInfoPropertyName(sMandatoryProperty);
		QUnit.test(`should override '${sMandatoryProperty}' with the one provided in property info when it's not set in the given Control`, function (assert) {
			const fnSetPropertyStub = sinon.stub();
			const oControlMock = {
				setProperty: fnSetPropertyStub
			};

			const vValue = "Test Value";
			const fnHasOwnPropertyStub = sinon.stub().returns(false);
			fnHasOwnPropertyStub.withArgs(sPropertyInfoPropertyName).returns(true);

			const oPropertyInfo = {
				hasOwnProperty: fnHasOwnPropertyStub
			};
			oPropertyInfo[sPropertyInfoPropertyName] = vValue;

			const fnCheckMandatoryPropertyStub = sinon.stub(PropertyInfoValidator, "checkMandatoryProperty");
			fnCheckMandatoryPropertyStub.returns(false);

			assert.ok(fnCheckMandatoryPropertyStub.notCalled, "should not call 'checkMandatoryProperty' initially");
			assert.ok(fnHasOwnPropertyStub.notCalled, "should not call 'hasOwnProperty'");
			assert.ok(fnSetPropertyStub.notCalled, "should not call 'setProperty'");

			PropertyInfoValidator.compareControlWithPropertyInfo(oControlMock, oPropertyInfo);

			assert.equal(fnCheckMandatoryPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'checkMandatoryProperty' ${aMandatoryPropertiesWithRequired.length} times`);
			assert.equal(fnHasOwnPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'hasOwnProperty' ${aMandatoryPropertiesWithRequired.length} times`);

			assert.ok(fnSetPropertyStub.calledOnce, "should call 'setProperty'");
			assert.ok(fnSetPropertyStub.calledWith(sMandatoryProperty, vValue), "should call 'setProperty' with correct parameters");

			fnCheckMandatoryPropertyStub.restore();
		});

		QUnit.test(`should override '${sMandatoryProperty}' with the one mapped in property info when it's not set in the given Control`, function (assert) {
			const fnSetPropertyStub = sinon.stub();
			const sMappedPropertyName = `${sMandatoryProperty}-mapped`;
			const fnGetPropertyInfoPropertyNameStub = sinon.stub(PropertyInfoValidator, "_getPropertyInfoPropertyName");
			fnGetPropertyInfoPropertyNameStub.returns(undefined);
			fnGetPropertyInfoPropertyNameStub.withArgs(sMandatoryProperty).returns(sMappedPropertyName);
			const oControlMock = {
				setProperty: fnSetPropertyStub
			};

			const vValue = "Test Value";
			const fnHasOwnPropertyStub = sinon.stub().returns(false);
			fnHasOwnPropertyStub.withArgs(sMappedPropertyName).returns(true);

			const oPropertyInfo = {
				hasOwnProperty: fnHasOwnPropertyStub
			};
			oPropertyInfo[sMappedPropertyName] = vValue;

			const fnCheckMandatoryPropertyStub = sinon.stub(PropertyInfoValidator, "checkMandatoryProperty");
			fnCheckMandatoryPropertyStub.returns(false);

			assert.ok(fnCheckMandatoryPropertyStub.notCalled, "should not call 'checkMandatoryProperty' initially");
			assert.ok(fnHasOwnPropertyStub.notCalled, "should not call 'hasOwnProperty'");
			assert.ok(fnSetPropertyStub.notCalled, "should not call 'setProperty'");
			assert.ok(fnSetPropertyStub.notCalled, "should not call 'getPropertyInfoPropertyName'");

			PropertyInfoValidator.compareControlWithPropertyInfo(oControlMock, oPropertyInfo);

			assert.equal(fnGetPropertyInfoPropertyNameStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'getPropertyInfoPropertyName' ${aMandatoryPropertiesWithRequired.length} times`);
			assert.equal(fnCheckMandatoryPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'checkMandatoryProperty' ${aMandatoryPropertiesWithRequired.length} times`);
			assert.equal(fnHasOwnPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'hasOwnProperty' ${aMandatoryPropertiesWithRequired.length} times`);

			assert.ok(fnSetPropertyStub.calledOnce, "should call 'setProperty'");
			assert.ok(fnSetPropertyStub.calledWith(sMandatoryProperty, vValue), "should call 'setProperty' with correct parameters");

			fnCheckMandatoryPropertyStub.restore();
			fnGetPropertyInfoPropertyNameStub.restore();
		});

		QUnit.test(`should compare '${sMandatoryProperty}' of Control with the one provided in property info and log an error if they are not equal`, function (assert) {
			const sId = "__control0";
			const fnGetIdStub = sinon.stub().returns(sId);
			const sControlValue = "value";
			const fnGetPropertyStub = sinon.stub().withArgs(sMandatoryProperty).returns(sControlValue);
			const fnSetPropertyStub = sinon.stub();
			const oControlMock = {
				getId: fnGetIdStub,
				getProperty: fnGetPropertyStub,
				setProperty: fnSetPropertyStub
			};

			const sPropertyInfoValue = "Test Value";
			const fnHasOwnPropertyStub = sinon.stub();
			fnHasOwnPropertyStub.returns(false);
			fnHasOwnPropertyStub.withArgs(sPropertyInfoPropertyName).returns(true);
			const oPropertyInfo = {
				hasOwnProperty: fnHasOwnPropertyStub
			};
			oPropertyInfo[sPropertyInfoPropertyName] = sPropertyInfoValue;

			const fnCheckMandatoryPropertyStub = sinon.stub(PropertyInfoValidator, "checkMandatoryProperty");
			fnCheckMandatoryPropertyStub.returns(true);

			const fnLogErrorSpy = sinon.spy(Log, "error");

			assert.ok(fnLogErrorSpy.notCalled, "should not log an error initially");
			assert.ok(fnCheckMandatoryPropertyStub.notCalled, "should not call 'checkMandatoryProperty' initially");
			assert.ok(fnHasOwnPropertyStub.notCalled, "should not call 'hasOwnProperty'");
			assert.ok(fnGetIdStub.notCalled, "should not call 'getId'");
			assert.ok(fnGetPropertyStub.notCalled, "should not call 'getProperty'");
			assert.ok(fnSetPropertyStub.notCalled, "should not call 'setProperty'");

			PropertyInfoValidator.compareControlWithPropertyInfo(oControlMock, oPropertyInfo);

			assert.equal(fnCheckMandatoryPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'checkMandatoryProperty' ${aMandatoryPropertiesWithRequired.length} times`);
			assert.equal(fnHasOwnPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'hasOwnProperty' ${aMandatoryPropertiesWithRequired.length} times`);
			assert.ok(fnGetIdStub.called, "should call 'getId'");
			assert.ok(fnGetPropertyStub.called, "should call 'getProperty'");
			assert.ok(fnGetPropertyStub.calledWith(sMandatoryProperty), "should call 'getProperty' with correct property name");
			assert.ok(fnSetPropertyStub.notCalled, "should not call 'setProperty'");

			const sExpectedErrorText = `sap.ui.mdc.util.PropertyInfoValidator: Control '${sId}' with mandatory property '${sMandatoryProperty}' has a different value for property '${sPropertyInfoPropertyName}' in given 'propertyInfo'!`;
			assert.ok(fnLogErrorSpy.called, "should log an error");
			assert.ok(fnLogErrorSpy.calledWith(sExpectedErrorText), "should log an error with correct text");

			fnCheckMandatoryPropertyStub.restore();
			fnLogErrorSpy.restore();
		});

		QUnit.test(`should compare '${sMandatoryProperty}' of Control with the one mapped in property info and log an error if they are not equal`, function (assert) {
			const sId = "__control0";
			const fnGetIdStub = sinon.stub().returns(sId);
			const sControlValue = "value";
			const fnGetPropertyStub = sinon.stub().withArgs(sMandatoryProperty).returns(sControlValue);
			const fnSetPropertyStub = sinon.stub();
			const sMappedPropertyName = `${sMandatoryProperty}-mapped`;
			const fnGetPropertyInfoPropertyNameStub = sinon.stub(PropertyInfoValidator, "_getPropertyInfoPropertyName");
			fnGetPropertyInfoPropertyNameStub.returns(undefined);
			fnGetPropertyInfoPropertyNameStub.withArgs(sMandatoryProperty).returns(sMappedPropertyName);
			const oControlMock = {
				getId: fnGetIdStub,
				getProperty: fnGetPropertyStub,
				setProperty: fnSetPropertyStub
			};

			const sPropertyInfoValue = "Test Value";
			const fnHasOwnPropertyStub = sinon.stub();
			fnHasOwnPropertyStub.returns(false);
			fnHasOwnPropertyStub.withArgs(sMappedPropertyName).returns(true);
			const oPropertyInfo = {
				hasOwnProperty: fnHasOwnPropertyStub
			};
			oPropertyInfo[sMappedPropertyName] = sPropertyInfoValue;

			const fnCheckMandatoryPropertyStub = sinon.stub(PropertyInfoValidator, "checkMandatoryProperty");
			fnCheckMandatoryPropertyStub.returns(true);

			const fnLogErrorSpy = sinon.spy(Log, "error");

			assert.ok(fnLogErrorSpy.notCalled, "should not log an error initially");
			assert.ok(fnCheckMandatoryPropertyStub.notCalled, "should not call 'checkMandatoryProperty' initially");
			assert.ok(fnHasOwnPropertyStub.notCalled, "should not call 'hasOwnProperty'");
			assert.ok(fnGetIdStub.notCalled, "should not call 'getId'");
			assert.ok(fnGetPropertyStub.notCalled, "should not call 'getProperty'");
			assert.ok(fnSetPropertyStub.notCalled, "should not call 'setProperty'");

			PropertyInfoValidator.compareControlWithPropertyInfo(oControlMock, oPropertyInfo);

			assert.equal(fnCheckMandatoryPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'checkMandatoryProperty' ${aMandatoryPropertiesWithRequired.length} times`);
			assert.equal(fnHasOwnPropertyStub.callCount, aMandatoryPropertiesWithRequired.length, `should call 'hasOwnProperty' ${aMandatoryPropertiesWithRequired.length} times`);
			assert.ok(fnGetIdStub.called, "should call 'getId'");
			assert.ok(fnGetPropertyStub.called, "should call 'getProperty'");
			assert.ok(fnGetPropertyStub.calledWith(sMandatoryProperty), "should call 'getProperty' with correct property name");
			assert.ok(fnSetPropertyStub.notCalled, "should not call 'setProperty'");

			const sExpectedErrorText = `sap.ui.mdc.util.PropertyInfoValidator: Control '${sId}' with mandatory property '${sMandatoryProperty}' has a different value for property '${sMappedPropertyName}' in given 'propertyInfo'!`;
			assert.ok(fnLogErrorSpy.called, "should log an error");
			assert.ok(fnLogErrorSpy.calledWith(sExpectedErrorText), "should log an error with correct text");

			fnCheckMandatoryPropertyStub.restore();
			fnLogErrorSpy.restore();
			fnGetPropertyInfoPropertyNameStub.restore();
		});
	});

	QUnit.module("hasPropertiesOnControl");

	// All properties that can be set in a sap.ui.mdc.filterbar.PropertyInfo object
	const ALL_PROPERTIES = {
		...MANDATORY_PROPERTIES,
		"required": "required",
		"hiddenFilter": "hiddenFilter",
		"path": "path",
		"caseSensitive": "caseSensitive",
		"key": "key",
		"tooltip": "tooltip",
		"visible": "visible",
		"group": "group",
		"groupLabel": "groupLabel"
	};

	QUnit.test("should return false, if all PropertyInfo properties are initial on control", function(assert) {
		const fnIsPropertyInitialStub = sinon.stub();
		fnIsPropertyInitialStub.returns(true);

		fnIsPropertyInitialStub.withArgs("irrelevantProperty").returns(false);

		const fnGetMetadataStub = sinon.stub().returns({
			getAllProperties: () => Object.keys(ALL_PROPERTIES).reduce((oResult, sPropertyName) => {
				oResult[sPropertyName] = { name: sPropertyName };
				return oResult;
			}, {})
		});
		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getMetadata: fnGetMetadataStub
		};

			const bActualResult = PropertyInfoValidator.hasPropertiesOnControl(oControlMock);

			assert.notOk(bActualResult, `should return false when all PropertyInfo properties are initial on control`);
	});

	QUnit.test("should return true, if any PropertyInfo property is not initial on control", function(assert) {
		const fnIsPropertyInitialStub = sinon.stub();
		fnIsPropertyInitialStub.returns(true);

		const fnGetMetadataStub = sinon.stub().returns({
			getAllProperties: () => Object.keys(ALL_PROPERTIES).reduce((oResult, sPropertyName) => {
				oResult[sPropertyName] = { name: sPropertyName };
				return oResult;
			}, {})
		});
		const oControlMock = {
			isPropertyInitial: fnIsPropertyInitialStub,
			getMetadata: fnGetMetadataStub
		};

		Object.entries(ALL_PROPERTIES).forEach(([sControlPropertyName, _sPropertyInfoPropertyName]) => {
			fnIsPropertyInitialStub.withArgs(sControlPropertyName).returns(false);

			const bActualResult = PropertyInfoValidator.hasPropertiesOnControl(oControlMock);

			assert.ok(bActualResult, `should return true when property '${sControlPropertyName}' is not initial on control`);

			fnIsPropertyInitialStub.withArgs(sControlPropertyName).returns(true);
		});

	});

});