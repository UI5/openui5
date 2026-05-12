/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/util/ExportUtils"
],
function(
	ExportUtils
) {
	"use strict";

	QUnit.module("sap.ui.mdc.util.ExportUtils", {
		beforeEach: function() {
			this.oControl = {
				fireBeforeExport: sinon.stub()
			};
			this.oCancelableEvent = {
				getParameter: sinon.stub().callsFake(function(sName) {
					if (sName === "exportSettings") { return {sheet: "Sheet1"}; }
					if (sName === "userExportSettings") { return {format: "XLSX"}; }
					return undefined;
				}),
				preventDefault: sinon.spy()
			};
		}
	});

	QUnit.test("#fireBeforeExport calls oControl.fireBeforeExport with correct parameters", function(assert) {
		this.oControl.fireBeforeExport.returns(true);

		ExportUtils.fireBeforeExport(this.oControl, {customParam: "value"}, this.oCancelableEvent);

		assert.ok(this.oControl.fireBeforeExport.calledOnce, "fireBeforeExport was called once");
		assert.deepEqual(this.oControl.fireBeforeExport.firstCall.args[0], {
			exportSettings: {sheet: "Sheet1"},
			userExportSettings: {format: "XLSX"},
			customParam: "value"
		}, "fireBeforeExport was called with parameters read from the event and spread additionalParameters");
	});

	QUnit.test("#fireBeforeExport calls oCancelableEvent.preventDefault when fireBeforeExport returns false", function(assert) {
		this.oControl.fireBeforeExport.returns(false);

		ExportUtils.fireBeforeExport(this.oControl, {}, this.oCancelableEvent);

		assert.ok(this.oCancelableEvent.preventDefault.calledOnce, "preventDefault was called");
	});

	QUnit.test("#fireBeforeExport does NOT call oCancelableEvent.preventDefault when fireBeforeExport returns true", function(assert) {
		this.oControl.fireBeforeExport.returns(true);

		ExportUtils.fireBeforeExport(this.oControl, {}, this.oCancelableEvent);

		assert.ok(this.oCancelableEvent.preventDefault.notCalled, "preventDefault was not called");
	});

	QUnit.test("#fireBeforeExport returns the boolean result of fireBeforeExport", function(assert) {
		this.oControl.fireBeforeExport.returns(true);
		assert.strictEqual(ExportUtils.fireBeforeExport(this.oControl, {}, this.oCancelableEvent), true, "Returns true");

		this.oControl.fireBeforeExport.returns(false);
		assert.strictEqual(ExportUtils.fireBeforeExport(this.oControl, {}, this.oCancelableEvent), false, "Returns false");
	});
});
