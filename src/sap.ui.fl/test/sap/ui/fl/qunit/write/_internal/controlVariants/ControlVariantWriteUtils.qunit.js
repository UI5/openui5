/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	FlexObjectFactory,
	Settings,
	ControlVariantWriteUtils,
	FlexObjectManager,
	Layer,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	function createFlexObjects(sReference, sVMReference) {
		return [
			FlexObjectFactory.createFlVariant({
				id: sVMReference,
				reference: sReference,
				variantManagementReference: sVMReference,
				layer: Layer.CUSTOMER
			}),
			FlexObjectFactory.createFlVariant({
				variantName: "Variant 1",
				id: "variant1",
				reference: sReference,
				variantReference: sVMReference, // Inherits from standard
				variantManagementReference: sVMReference,
				layer: Layer.USER
			}),
			FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_management_change",
				reference: sReference,
				layer: Layer.USER,
				content: {
					defaultVariant: "variant1"
				},
				selector: {
					id: sVMReference
				}
			}),
			FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_change",
				reference: sReference,
				layer: Layer.USER,
				changeType: "setVisible",
				content: {
					visible: false
				},
				selector: {
					id: "variant1"
				}
			}),
			FlexObjectFactory.createFromFileContent({
				fileType: "ctrl_variant_change",
				reference: sReference,
				layer: Layer.USER,
				changeType: "setTitle",
				selector: {
					id: "variant1"
				}
			}),
			FlexObjectFactory.createFromFileContent({
				fileType: "change",
				reference: sReference,
				layer: Layer.USER,
				changeType: "dummyChange",
				variantReference: "variant1"
			}),
			// Referenced UI Change
			FlexObjectFactory.createFromFileContent({
				fileType: "change",
				reference: sReference,
				layer: Layer.CUSTOMER,
				changeType: "dummyChange",
				variantReference: sVMReference
			})
		];
	}

	QUnit.module("Utils", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when deleteVariant is called and condensing is enabled", (assert) => {
			sandbox.stub(Settings, "getInstanceOrUndef").callsFake(() => {
				return {
					getIsCondensingEnabled: () => true,
					getUser: () => "testUser"
				};
			});
			const sReference = "appReference";
			const sComponentId = "componentId";
			const sVMReference = "vmReference";
			const sVariantReference = "variant1";

			const aAllChanges = createFlexObjects(sReference, sVMReference);
			const [
				, // Standard variant
				oVariant,
				oVMChange,
				oSetVisibleVariantChange,
				oSetTitleVariantChange,
				oVMDependentChange
			] = aAllChanges;
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, aAllChanges);
			const aExpectedChanges = [oVariant, oVMChange, oSetVisibleVariantChange, oSetTitleVariantChange, oVMDependentChange];

			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const aDeletedChanges = ControlVariantWriteUtils.deleteVariant(sReference, sComponentId, sVMReference, sVariantReference);
			assert.deepEqual(
				aDeletedChanges.map((oChange) => oChange.getId()),
				aExpectedChanges.map((oChange) => oChange.getId()),
				"then all changes are returned as deleted, except the referenced UI Change"
			);
			assert.ok(
				FlexObjectManager.deleteFlexObjects.calledWith({
					reference: sReference,
					componentId: sComponentId,
					flexObjects: aExpectedChanges
				}),
				"then FlexObjectManager.deleteFlexObjects is called with the correct parameters"
			);
		});

		QUnit.test("when deleteVariant is called and condensing is disabled", (assert) => {
			sandbox.stub(Settings, "getInstanceOrUndef").callsFake(() => {
				return {
					getIsCondensingEnabled: () => false,
					getUser: () => "testUser"
				};
			});
			const sReference = "appReference";
			const sComponentId = "componentId";
			const sVMReference = "vmReference";
			const sVariantReference = "variant1";

			const aAllChanges = createFlexObjects(sReference, sVMReference);
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, aAllChanges);
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const aDeletedChanges = ControlVariantWriteUtils.deleteVariant(sReference, sComponentId, sVMReference, sVariantReference);
			assert.strictEqual(aDeletedChanges.length, 0, "then no changes are returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
