/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/controlVariants/resolveInitialVariantFromURL",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/thirdparty/sinon-4"
], function(
	resolveInitialVariantFromURL,
	VariantsApplyUtil,
	VariantManagementState,
	VariantManagerApply,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sReference = "my.app.Component";
	const sComponentId = "my.app.Component---root";
	const sVMReference = "vm1";

	function callForVM1() {
		return resolveInitialVariantFromURL({ reference: sReference, componentId: sComponentId, vmReference: sVMReference });
	}

	QUnit.module("Given resolveInitialVariantFromURL", {
		beforeEach() {
			this.oOwnerStub = sandbox.stub(VariantManagementState, "getVariantManagementReferenceForVariant");
			this.oContentRemovedStub = sandbox.stub(VariantManagementState, "areVariantDependentControlChangesRemoved").returns(false);
			this.oLoadStub = sandbox.stub(VariantManagerApply, "loadVariantDependentControlChanges").resolves();
			this.oGetURLRefsStub = sandbox.stub(VariantsApplyUtil, "getVariantReferencesFromURL");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the URL has no variant ids, no load is triggered", async function(assert) {
			this.oGetURLRefsStub.returns([]);

			await callForVM1();

			assert.strictEqual(this.oLoadStub.callCount, 0, "loadVariantDependentControlChanges is not called");
		});

		QUnit.test("when the URL id is in this VM and content is loaded, no load is triggered", async function(assert) {
			this.oGetURLRefsStub.returns(["v1"]);
			this.oOwnerStub.withArgs(sReference, "v1").returns(sVMReference);
			this.oContentRemovedStub.returns(false);

			await callForVM1();

			assert.strictEqual(this.oLoadStub.callCount, 0, "loadVariantDependentControlChanges is not called");
		});

		QUnit.test("when the URL id is in this VM with content stripped, the matching id is loaded", async function(assert) {
			this.oGetURLRefsStub.returns(["v1"]);
			this.oOwnerStub.withArgs(sReference, "v1").returns(sVMReference);
			this.oContentRemovedStub.returns(true);

			await callForVM1();

			assert.ok(this.oLoadStub.calledOnceWithExactly({
				reference: sReference,
				componentId: sComponentId,
				vmReference: sVMReference,
				variantId: "v1"
			}), "loadVariantDependentControlChanges is called with the matching variant id");
		});

		QUnit.test("when the URL id is unknown to every VM, it is loaded speculatively", async function(assert) {
			this.oGetURLRefsStub.returns(["v1"]);
			this.oOwnerStub.withArgs(sReference, "v1").returns(undefined);

			await callForVM1();

			assert.ok(this.oLoadStub.calledOnceWithExactly({
				reference: sReference,
				componentId: sComponentId,
				vmReference: sVMReference,
				variantId: "v1"
			}), "loadVariantDependentControlChanges is called with the URL id");
		});

		QUnit.test("when the URL id belongs to a different VM, no load is triggered", async function(assert) {
			this.oGetURLRefsStub.returns(["v1"]);
			this.oOwnerStub.withArgs(sReference, "v1").returns("someOtherVM");

			await callForVM1();

			assert.strictEqual(this.oLoadStub.callCount, 0, "loadVariantDependentControlChanges is not called");
		});

		QUnit.test("when the URL has multiple ids unknown to every VM, all are loaded sequentially", async function(assert) {
			this.oGetURLRefsStub.returns(["v_for_VM1", "v_for_VM2"]);
			this.oOwnerStub.returns(undefined);

			await callForVM1();

			assert.strictEqual(this.oLoadStub.callCount, 2, "loadVariantDependentControlChanges is called twice");
			assert.deepEqual(this.oLoadStub.firstCall.args[0], {
				reference: sReference,
				componentId: sComponentId,
				vmReference: sVMReference,
				variantId: "v_for_VM1"
			}, "first call uses the first URL id");
			assert.deepEqual(this.oLoadStub.secondCall.args[0], {
				reference: sReference,
				componentId: sComponentId,
				vmReference: sVMReference,
				variantId: "v_for_VM2"
			}, "second call uses the second URL id");
		});

		QUnit.test("when one URL id belongs to this VM (stripped) and another belongs to a different VM, only the matching id is loaded", async function(assert) {
			this.oGetURLRefsStub.returns(["v_for_other_VM", "v_for_this_VM"]);
			this.oOwnerStub.withArgs(sReference, "v_for_other_VM").returns("someOtherVM");
			this.oOwnerStub.withArgs(sReference, "v_for_this_VM").returns(sVMReference);
			this.oContentRemovedStub.withArgs({
				reference: sReference,
				vmReference: sVMReference,
				variantId: "v_for_this_VM"
			}).returns(true);

			await callForVM1();

			assert.ok(this.oLoadStub.calledOnceWithExactly({
				reference: sReference,
				componentId: sComponentId,
				vmReference: sVMReference,
				variantId: "v_for_this_VM"
			}), "loadVariantDependentControlChanges is called only for the matching id");
		});

		QUnit.test("when the URL has a mix of known and unknown ids, the unknown one is loaded and the others are evaluated independently", async function(assert) {
			this.oGetURLRefsStub.returns(["v_in_other_VM", "v_unknown", "v_in_this_VM"]);
			this.oOwnerStub.withArgs(sReference, "v_in_other_VM").returns("someOtherVM");
			this.oOwnerStub.withArgs(sReference, "v_unknown").returns(undefined);
			this.oOwnerStub.withArgs(sReference, "v_in_this_VM").returns(sVMReference);
			this.oContentRemovedStub.returns(false);

			await callForVM1();

			assert.ok(this.oLoadStub.calledOnceWithExactly({
				reference: sReference,
				componentId: sComponentId,
				vmReference: sVMReference,
				variantId: "v_unknown"
			}), "loadVariantDependentControlChanges is called only for the unknown id");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
