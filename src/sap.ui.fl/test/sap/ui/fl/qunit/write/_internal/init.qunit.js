/* global QUnit */

sap.ui.define([
	"sap/ui/fl/changeHandler/ChangeAnnotation",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangeAnnotation,
	ChangeHandlerRegistration,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.write._internal.init", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Check if the change handler registration functions were called (from apply init)", function(assert) {
			const oRegisterChangeHandlersForLibraryStub = sandbox.stub(
				ChangeHandlerRegistration,
				"getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs"
			);
			const oRegisterPredefinedChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerPredefinedChangeHandlers");
			const oRegisterAnnotationChangeHandlerStub = sandbox.stub(ChangeHandlerRegistration, "registerAnnotationChangeHandler");

			const fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/write/_internal/init"], function() {
				assert.equal(oRegisterChangeHandlersForLibraryStub.callCount, 1, "Register Change Handlers called.");
				assert.equal(oRegisterPredefinedChangeHandlersStub.callCount, 1, "Extension provider called.");
				assert.strictEqual(oRegisterAnnotationChangeHandlerStub.callCount, 1, "Annotation change handler called once.");
				assert.deepEqual(oRegisterAnnotationChangeHandlerStub.getCall(0).args[0], {
					changeHandler: ChangeAnnotation,
					isDefaultChangeHandler: true
				}, "Annotation change handler registered for ODataModel v2");
				fnDone();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
