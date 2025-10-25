/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/thirdparty/sinon-4"
], function(
	_pick,
	JsControlTreeModifier,
	Applier,
	Reverter,
	FlexObjectFactory,
	DependencyHandler,
	Switcher,
	VariantManagementState,
	FlexObjectState,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	QUnit.dump.maxDepth = 20;

	QUnit.module("Given Switcher.switchVariant()", {
		beforeEach() {
			this.aSourceVariantChanges = [
				FlexObjectFactory.createFromFileContent({ fileName: "change1" }),
				FlexObjectFactory.createFromFileContent({ fileName: "change3" })
			];

			this.aTargetControlChangesForVariant = [
				FlexObjectFactory.createFromFileContent({ fileName: "change2" }),
				FlexObjectFactory.createFromFileContent({ fileName: "change4" })
			];
			this.aTargetControlChangesForVariant[1].isApplyProcessFinished = sandbox.stub().returns(true);

			this.oAppComponent = { type: "appComponent" };

			this.mPropertyBag = {
				vmReference: "variantManagementReference",
				currentVReference: "currentVariantReference",
				newVReference: "newVariantReference",
				appComponent: this.oAppComponent,
				modifier: JsControlTreeModifier
			};

			sandbox.stub(Reverter, "revertMultipleChanges").resolves();
			sandbox.stub(Applier, "applyMultipleChanges").resolves();
			sandbox.stub(VariantManagementState, "setCurrentVariant");
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns("liveDependencyMap");
			this.oAddRuntimeChangeToMapStub = sandbox.stub(DependencyHandler, "addRuntimeChangeToMap");
			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
			.callThrough()
			.withArgs({
				...(_pick(this.mPropertyBag, ["vmReference"])),
				vReference: this.mPropertyBag.currentVReference
			})
			.returns(this.aSourceVariantChanges)
			.withArgs({
				...(_pick(this.mPropertyBag, ["vmReference"])),
				vReference: this.mPropertyBag.newVReference
			})
			.returns(this.aTargetControlChangesForVariant);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called", async function(assert) {
			await Switcher.switchVariant(this.mPropertyBag);
			assert.ok(
				Reverter.revertMultipleChanges.calledWith(
					this.aSourceVariantChanges.reverse(), { ...this.mPropertyBag, skipSetQueued: true }
				),
				"then revert of changes was correctly triggered"
			);
			this.aSourceVariantChanges.forEach((oChange) => {
				assert.ok(oChange.isQueuedForRevert(), "then the change was set to queued for revert");
			});
			assert.ok(
				Applier.applyMultipleChanges.calledWith(
					this.aTargetControlChangesForVariant, { ...this.mPropertyBag, skipSetQueued: true }
				),
				"then apply of changes was correctly triggered"
			);
			assert.ok(
				this.aTargetControlChangesForVariant[0].isQueuedForApply(),
				"then the unfinished change was set to queued for apply"
			);
			assert.notOk(
				this.aTargetControlChangesForVariant[1].isQueuedForApply(),
				"then the finished change was not set to queued for apply"
			);
			assert.ok(
				VariantManagementState.setCurrentVariant.calledWith(this.mPropertyBag),
				"then setting current variant was correctly triggered"
			);
			assert.ok(
				this.oAddRuntimeChangeToMapStub.calledWith(
					this.aTargetControlChangesForVariant[0], this.oAppComponent, "liveDependencyMap"
				),
				"then the change to be applied was added to the dependency map"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});