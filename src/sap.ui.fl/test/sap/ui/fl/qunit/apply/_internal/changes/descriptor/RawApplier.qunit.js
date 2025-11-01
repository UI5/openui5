/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/RawApplier",
	"sap/ui/thirdparty/sinon-4"
], function(
	RawApplier,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("RawApplier: applyChanges", {
		beforeEach() {
			this.oManifest = {
				"_version": "2.0.0",

				"sap.app": {
					id: "test.id",
					title: "Original Title",
					description: "Original Description"
				},

				"sap.ui5": {
					dependencies: {
						minUI5Version: "2.0.0",
						libs: {}
					}
				}
			};

			this.oMockStrategy = {
				handleError() {},
				processTexts(oManifest) {
					return oManifest;
				}
			};

			this.oHandleErrorSpy = sandbox.spy(this.oMockStrategy, "handleError");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'applyChanges' with one change handler that succeeds", function(assert) {
			const oChange = {
				getTexts() {
					return {};
				}
			};
			const oChangeHandler = {
				applyChange(oManifest) {
					oManifest["sap.app"].title = "New Title";
					return oManifest;
				}
			};
			const fnApplyChangeSpy = sandbox.spy(oChangeHandler, "applyChange");
			this.oMockStrategy.processTexts = function(oManifest) {
				assert.ok(false, "No text processing should be done for empty texts");
				return oManifest;
			};

			const oUpdatedManifest = RawApplier.applyChanges([oChangeHandler], this.oManifest, [oChange], this.oMockStrategy);

			assert.strictEqual(fnApplyChangeSpy.callCount, 1, "The change handler's applyChange method was called once");
			assert.strictEqual(oUpdatedManifest["sap.app"].title, "New Title", "The change was applied to the manifest");
			assert.strictEqual(this.oHandleErrorSpy.callCount, 0, "No error was handled");
		});

		QUnit.test("when calling 'applyChanges' with one change handler that fails", function(assert) {
			const oChange = {
				getTexts() {
					return {};
				}
			};
			const oChangeHandler = {
				applyChange() {
					throw new Error("Change handler error");
				}
			};
			const fnApplyChangeSpy = sandbox.spy(oChangeHandler, "applyChange");

			const oUpdatedManifest = RawApplier.applyChanges([oChangeHandler], this.oManifest, [oChange], this.oMockStrategy);

			assert.strictEqual(fnApplyChangeSpy.callCount, 1, "The change handler's applyChange method was called once");
			assert.strictEqual(this.oHandleErrorSpy.callCount, 1, "The error was handled");
			assert.deepEqual(oUpdatedManifest, this.oManifest, "The manifest remains unchanged");
		});

		QUnit.test("when calling 'applyChanges' with a change that has texts", function(assert) {
			const oTexts = {
				"sap.app.title": {
					value: "Translated Title"
				}
			};
			const oChange = {
				getTexts() {
					return oTexts;
				}
			};
			const oChangeHandler = {
				applyChange(oManifest) {
					oManifest["sap.app"].title = "{{sap.app.title}}";
					return oManifest;
				}
			};
			this.oMockStrategy.processTexts = function(oManifest) {
				assert.ok(true, "then text processing is triggered by the applier");
				assert.strictEqual(
					oManifest["sap.app"].title,
					"{{sap.app.title}}",
					"The change was applied and texts were processed"
				);
				return oManifest;
			};

			RawApplier.applyChanges([oChangeHandler], this.oManifest, [oChange], this.oMockStrategy);
		});

		QUnit.test("when calling 'applyChanges' with a change handler that has skipPostprocessing flag", function(assert) {
			const oChange = {
				getTexts() {
					return {
						"sap.app.title": {
							value: "Translated Title"
						}
					};
				}
			};
			const oChangeHandler = {
				skipPostprocessing: true,
				applyChange(oManifest) {
					oManifest["sap.app"].title = "No Processing";
					return oManifest;
				}
			};
			this.oMockStrategy.processTexts = function(oManifest) {
				assert.ok(false, "No text processing should be done for empty texts");
				return oManifest;
			};

			const oUpdatedManifest = RawApplier.applyChanges([oChangeHandler], this.oManifest, [oChange], this.oMockStrategy);

			assert.strictEqual(oUpdatedManifest["sap.app"].title, "No Processing", "The change was applied without text processing");
		});

		QUnit.test("when calling 'applyChanges' with multiple changes", function(assert) {
			assert.expect(4);
			const aChanges = [
				{
					getTexts() {
						return {};
					}
				},
				{
					getTexts() {
						return {};
					}
				},
				{
					getTexts() {
						return {
							"sap.app.description": {
								value: "Translated Description"
							}
						};
					}
				}
			];

			const aChangeHandlers = [
				{
					applyChange(oManifest) {
						oManifest["sap.app"].title = "First Change";
						return oManifest;
					}
				},
				{
					applyChange(oManifest) {
						oManifest["sap.ui5"].dependencies.libs.lib1 = {
							minVersion: "1.0.0"
						};
						return oManifest;
					}
				},
				{
					applyChange(oManifest) {
						oManifest["sap.app"].description = "{{sap.app.description}}";
						return oManifest;
					}
				}
			];
			this.oMockStrategy.processTexts = function(oManifest) {
				assert.ok(true, "then text processing is triggered by the applier");
				return oManifest;
			};

			const oUpdatedManifest = RawApplier.applyChanges(aChangeHandlers, this.oManifest, aChanges, this.oMockStrategy);

			assert.strictEqual(oUpdatedManifest["sap.app"].title, "First Change", "First change was applied");
			assert.strictEqual(oUpdatedManifest["sap.ui5"].dependencies.libs.lib1.minVersion, "1.0.0", "Second change was applied");
			assert.strictEqual(oUpdatedManifest["sap.app"].description, "{{sap.app.description}}", "Third change was applied");
		});

		QUnit.test("when calling 'applyChanges' with a failing change in the middle of the sequence", function(assert) {
			const aChanges = [
				{
					getTexts() {
						return {};
					}
				},
				{
					getTexts() {
						return {};
					}
				},
				{
					getTexts() {
						return {};
					}
				}
			];

			const aChangeHandlers = [
				{
					applyChange(oManifest) {
						oManifest["sap.app"].title = "First Change";
						return oManifest;
					}
				},
				{
					applyChange() {
						throw new Error("Middle change fails");
					}
				},
				{
					applyChange(oManifest) {
						oManifest["sap.app"].description = "Third Change";
						return oManifest;
					}
				}
			];

			const oUpdatedManifest = RawApplier.applyChanges(aChangeHandlers, this.oManifest, aChanges, this.oMockStrategy);

			assert.strictEqual(oUpdatedManifest["sap.app"].title, "First Change", "First change was applied");
			assert.strictEqual(oUpdatedManifest["sap.app"].description, "Third Change", "Third change was applied");
			assert.strictEqual(this.oHandleErrorSpy.callCount, 1, "Error was handled once");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
