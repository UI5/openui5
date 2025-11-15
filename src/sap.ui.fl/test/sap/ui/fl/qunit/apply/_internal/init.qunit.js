/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/changeHandler/ChangeAnnotation",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangeHandlerRegistration,
	DelegateMediator,
	ChangeAnnotation,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.apply._internal.init", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Check if the change handler registration functions were called", function(assert) {
			const oRegisterChangeHandlersForLibraryStub = sandbox.stub(
				ChangeHandlerRegistration,
				"getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs"
			);
			const oRegisterPredefinedChangeHandlersStub = sandbox.stub(ChangeHandlerRegistration, "registerPredefinedChangeHandlers");
			const oRegisterAnnotationChangeHandlerStub = sandbox.stub(ChangeHandlerRegistration, "registerAnnotationChangeHandler");
			const oRegisterDelegateStub = sandbox.stub(DelegateMediator, "registerReadDelegate");

			const fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/apply/_internal/init"], function() {
				assert.equal(oRegisterChangeHandlersForLibraryStub.callCount, 1, "Register Change Handlers called.");
				assert.equal(oRegisterPredefinedChangeHandlersStub.callCount, 1, "Extension provider called.");
				assert.strictEqual(oRegisterAnnotationChangeHandlerStub.callCount, 1, "Annotation change handler called once.");
				assert.deepEqual(oRegisterAnnotationChangeHandlerStub.getCall(0).args[0], {
					changeHandler: ChangeAnnotation,
					isDefaultChangeHandler: true
				}, "Annotation change handler registered");
				assert.strictEqual(oRegisterDelegateStub.callCount, 3, "Read delegate registered three times.");
				assert.strictEqual(
					oRegisterDelegateStub.getCall(0).args[0].modelType, "sap.ui.model.odata.v4.ODataModel",
					"then the model type is 'sap.ui.model.odata.v4.ODataModel'"
				);
				assert.strictEqual(
					oRegisterDelegateStub.getCall(1).args[0].modelType, "sap.ui.model.odata.v2.ODataModel",
					"then the model type is 'sap.ui.model.odata.v2.ODataModel'"
				);
				assert.strictEqual(
					oRegisterDelegateStub.getCall(2).args[0].modelType, "sap.ui.model.odata.ODataModel",
					"then the model type is 'sap.ui.model.odata.ODataModel'"
				);
				fnDone();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
