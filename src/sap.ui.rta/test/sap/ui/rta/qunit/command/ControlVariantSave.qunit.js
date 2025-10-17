/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/rta/plugin/ControlVariant"
], function(
	ElementDesignTimeMetadata,
	ElementOverlay,
	OverlayRegistry,
	VariantManagementState,
	FlexObjectState,
	VariantManagement,
	VariantManager,
	PersistenceWriteAPI,
	Layer,
	FlLayerUtils,
	CommandFactory,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Given a variant management control ...", {
		before() {
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");

			this.oChange1 = RtaQunitUtils.createUIChange({
				fileName: "change44",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {
					id: "abc123"
				},
				reference: "Dummy",
				variantReference: "variantMgmtId1"
			});
			this.oChange2 = RtaQunitUtils.createUIChange({
				fileName: "change45",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {
					id: "abc123"
				},
				reference: "Dummy",
				variantReference: "variantMgmtId1"
			});
			this.oVariantInstance = RtaQunitUtils.createUIChange({
				fileName: "variant0",
				content: {
					title: "myNewVariant"
				},
				variantManagementReference: "variantMgmtId1",
				variantReference: "variant00",
				support: {
					user: "Me"
				},
				layer: Layer.CUSTOMER,
				reference: "myReference",
				generator: "myGenerator"
			});

			this.oGetCurrentLayerStub = sinon.stub(FlLayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
			sinon.stub(VariantManagementState, "getControlChangesForVariant").returns([this.oChange1, this.oChange2]);
			sinon.stub(FlexObjectState, "getDirtyFlexObjects").returns([this.oChange1, this.oChange2]);
			PersistenceWriteAPI.add({
				flexObjects: [this.oVariantInstance, this.oChange1, this.oChange2],
				selector: this.oMockedAppComponent
			});
		},
		after() {
			this.oMockedAppComponent.destroy();
			this.oGetCurrentLayerStub.restore();
		},
		beforeEach() {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
		},
		afterEach() {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling command factory for save variants and undo", async function(assert) {
			const oOverlay = new ElementOverlay({element: this.oVariantManagement});
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			sandbox.stub(oOverlay, "getVariantManagement").returns("idMain1--variantManagementOrdersTable");
			sandbox.stub(this.oVariantManagement, "getCurrentVariantReference").returns("variant00");
			sandbox.stub(VariantManager, "getControlChangesForVariant")
			.withArgs("Dummy", "variantMgmtId1", "variant00")
			.returns([this.oChange1, this.oChange2]);
			const oInvalidationStub = sandbox.stub(VariantManager, "updateVariantManagementMap").withArgs("Dummy");

			const oDesignTimeMetadata = new ElementDesignTimeMetadata({data: {}});
			const mFlexSettings = {layer: Layer.CUSTOMER};
			const oControlVariantSaveCommand = await CommandFactory.getCommandFor(
				this.oVariantManagement, "save", {}, oDesignTimeMetadata, mFlexSettings
			);
			assert.ok(oControlVariantSaveCommand, "control variant save command exists for element");

			await oControlVariantSaveCommand.execute();
			assert.ok(oControlVariantSaveCommand._aDirtyChanges[0].getSavedToVariant(), "the first change is assigned to variant");
			assert.ok(oControlVariantSaveCommand._aDirtyChanges[1].getSavedToVariant(), "the second change is assigned to variant");
			assert.strictEqual(oInvalidationStub.callCount, 1, "the map was invalidated");

			await oControlVariantSaveCommand.undo();
			assert.notOk(
				oControlVariantSaveCommand._aDirtyChanges[0].getSavedToVariant(),
				"the first change is not assigned to variant"
			);
			assert.notOk(
				oControlVariantSaveCommand._aDirtyChanges[1].getSavedToVariant(),
				"the second change is not assigned to variant"
			);
			assert.strictEqual(oInvalidationStub.callCount, 2, "the map was invalidated again");

			await oControlVariantSaveCommand.undo();
			assert.ok(true, "then by default a Promise.resolve() is returned on undo(), even if no changes exist for the command");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
