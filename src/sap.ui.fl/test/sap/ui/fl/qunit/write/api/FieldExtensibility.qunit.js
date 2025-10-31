/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/base/ManagedObject"
], function(
	ABAPAccess,
	FieldExtensibility,
	sinon,
	ManagedObject
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var aFunctionNames = [
		"onControlSelected",
		"isExtensibilityEnabled",
		"isServiceOutdated",
		"setServiceValid",
		"getTexts",
		"getExtensionData",
		"onTriggerCreateExtensionData"
	];

	function stubAccessFunctions(AccessClass) {
		aFunctionNames.forEach(function(sFunctionName) {
			sandbox.stub(AccessClass, sFunctionName);
		});
	}

	QUnit.module("Given FieldExtensibility with an ABAPAccess.js", {
		before() {
			// Determine scenario
			FieldExtensibility.onControlSelected(new ManagedObject());
		},
		beforeEach() {
			stubAccessFunctions(ABAPAccess);
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			FieldExtensibility._resetCurrentScenario();
		}
	}, function() {
		aFunctionNames.forEach(function(sFunctionName) {
			var sText = `when the function ${sFunctionName} is called`;
			QUnit.test(sText, function(assert) {
				return FieldExtensibility[sFunctionName]().then(function() {
					assert.ok(true, "the function returns a promise");
					assert.strictEqual(ABAPAccess[sFunctionName].callCount, 1, "the Implementation was called");
				});
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
