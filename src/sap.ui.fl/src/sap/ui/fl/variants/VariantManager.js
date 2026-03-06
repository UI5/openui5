/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/restricted/_difference",
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	Log,
	_difference,
	merge,
	JsControlTreeModifier,
	Element,
	Applier,
	Reverter,
	FlexObjectFactory,
	States,
	VariantManagementState,
	VariantManagerApply,
	FlexObjectState,
	FlexRuntimeInfoAPI,
	ManifestUtils,
	Settings,
	ControlVariantWriteUtils,
	UIChangeManager,
	FlexObjectManager,
	ContextBasedAdaptationsAPI,
	VersionsAPI,
	Layer,
	LayerUtils,
	Utils
) {
	"use strict";

	/**
	 * Manager for all FlVariant related tasks that are triggered by a user interaction.
	 *
	 * @namespace sap.ui.fl.variants.VariantManager
	 * @since 1.132
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	var VariantManager = {};

	function getVariantModel(oAppComponent) {
		return oAppComponent.getModel("$FlexVariants");
	}

	function getDirtyControlChangesFromVariant(aControlChanges, sFlexReference) {
		const aChangeFileNames = aControlChanges.map((oChange) => oChange.getId());

		return FlexObjectState.getDirtyFlexObjects(sFlexReference).filter(function(oChange) {
			return aChangeFileNames.includes(oChange.getId()) && !oChange.getSavedToVariant();
		});
	}

	function getChangesFromManageEvent(oVMControl, sLayer, oEvent) {
		const sVariantManagementReference = oVMControl.getVariantManagementReference();
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oVMControl);
		const aVariants = VariantManagementState.getVariantsForVariantManagement({
			reference: sFlexReference,
			vmReference: sVariantManagementReference
		});
		const sDefaultVariant = VariantManagementState.getDefaultVariantReference({
			reference: sFlexReference,
			vmReference: sVariantManagementReference
		});
		const aChanges = [];
		const oSettings = Settings.getInstanceOrUndef();
		const aVariantsToBeDeleted = [];

		const findVariant = (sVariantKey) => {
			return aVariants.find((oVariant) => oVariant.key === sVariantKey);
		};

		const fnAddPreparedChange = (oVariant, sChangeType, mChangeData) => {
			// layer can be PUBLIC for setTitle, setExecuteOnSelect or setVisible, but never for setFavorite, setDefault or setContexts
			const bSupportsPublicChange = ["setTitle", "setExecuteOnSelect", "setVisible"].includes(sChangeType);
			const sChangeLayer = (
				bSupportsPublicChange
				&& oSettings?.getIsPublicFlVariantEnabled()
				&& oVariant.layer === Layer.PUBLIC
			) ? Layer.PUBLIC : sLayer;

			aChanges.push({
				variantReference: oVariant.key,
				changeType: sChangeType,
				layer: sChangeLayer,
				...mChangeData
			});
		};

		oEvent.getParameter("renamed")?.forEach(({ key: sVariantKey, name: sNewTitle }) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setTitle",
				{
					title: sNewTitle,
					originalTitle: oVariant.title
				}
			);
		});
		oEvent.getParameter("fav")?.forEach(({ key: sVariantKey, visible: bNewIsFavorite }) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setFavorite",
				{
					favorite: bNewIsFavorite,
					originalFavorite: oVariant.favorite
				}
			);
		});
		oEvent.getParameter("exe")?.forEach(({ key: sVariantKey, exe: bNewExecuteOnSelect }) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setExecuteOnSelect",
				{
					executeOnSelect: bNewExecuteOnSelect,
					originalExecuteOnSelect: oVariant.executeOnSelect
				}
			);
		});
		oEvent.getParameter("deleted")?.forEach((sVariantKey) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setVisible",
				{
					visible: false
				}
			);
			aVariantsToBeDeleted.push(sVariantKey);
		});
		oEvent.getParameter("contexts")?.forEach(({ key: sVariantKey, contexts: aNewContexts }) => {
			const oVariant = findVariant(sVariantKey);
			fnAddPreparedChange(
				oVariant,
				"setContexts",
				{
					contexts: aNewContexts,
					originalContexts: oVariant.contexts
				}
			);
		});
		const sNewDefault = oEvent.getParameter("def");
		if (sNewDefault) {
			aChanges.push({
				variantManagementReference: sVariantManagementReference,
				changeType: "setDefault",
				defaultVariant: sNewDefault,
				originalDefaultVariant: sDefaultVariant,
				layer: sLayer
			});
		}

		return {
			changes: aChanges,
			variantsToBeDeleted: aVariantsToBeDeleted
		};
	}

	/**
	 * Removes passed control changes which are in DIRTY state from the variant state and flex controller.
	 *
	 * @param {object} mPropertyBag - Object with properties
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.changes - Array of control changes
	 * @param {string} mPropertyBag.reference - Flex reference of the app
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.vReference - Variant reference to remove dirty changes from
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Model's app component
	 * @param {boolean} [mPropertyBag.revert] - Revert the given changes
	 *
	 * @returns {Promise<undefined>} Resolves when changes have been erased
	 */
	async function eraseDirtyChanges(mPropertyBag) {
		const aVariantDirtyChanges = getDirtyControlChangesFromVariant(mPropertyBag.changes, mPropertyBag.reference).slice().reverse();
		if (aVariantDirtyChanges.length > 0) {
			if (mPropertyBag.revert) {
				await Reverter.revertMultipleChanges(aVariantDirtyChanges, {
					appComponent: mPropertyBag.appComponent,
					modifier: JsControlTreeModifier,
					reference: mPropertyBag.reference
				});
			}

			FlexObjectManager.deleteFlexObjects({
				reference: mPropertyBag.reference,
				componentId: mPropertyBag.appComponent.getId(),
				flexObjects: aVariantDirtyChanges
			});
		}
	}

	async function handleDirtyChanges(mProperties) {
		const {
			dirtyChanges: aDirtyChanges,
			variantManagementReference: sVariantManagementReference,
			appComponent: oAppComponent,
			variantManagementControl: oVariantManagementControl,
			flexReference: sFlexReference
		} = mProperties;
		if (!oVariantManagementControl.getDesignMode()) {
			const oResponse = await FlexObjectManager.saveFlexObjects({ flexObjects: aDirtyChanges, selector: oAppComponent });
			if (oResponse) {
				const oVariantFlexObject = oResponse.response.find((oFlexObject) => oFlexObject.fileType === "ctrl_variant");
				const aVariants = VariantManagementState.getVariantsForVariantManagement({
					reference: sFlexReference,
					vmReference: sVariantManagementReference
				});
				const oAffectedVariant = aVariants.find((oVariant) => oVariant.key === oVariantFlexObject.fileName);
				const oSupportInformation = oAffectedVariant.instance.getSupportInformation();
				oSupportInformation.user = oVariantFlexObject.support.user;
				oAffectedVariant.instance.setSupportInformation(oSupportInformation);
			}
		}
	}

	function getAdaptationId(sLayer, oControl, sFlexReference) {
		var mContextBasedAdaptationBag = {
			layer: sLayer,
			control: oControl,
			reference: sFlexReference
		};
		// the VariantManager uses the ContextBasedAdaptationsAPI to fetch the adaptation id,
		// and the ContextBasedAdaptationsAPI uses the VariantManager to create changes
		var bHasAdaptationsModel = ContextBasedAdaptationsAPI.hasAdaptationsModel(mContextBasedAdaptationBag);
		return bHasAdaptationsModel && ContextBasedAdaptationsAPI.getDisplayedAdaptationId(mContextBasedAdaptationBag);
	}

	function createNewVariant(oSourceVariant, mPropertyBag) {
		const sReference = oSourceVariant.getFlexObjectMetadata().reference;
		const mProperties = {
			id: mPropertyBag.newVariantReference,
			variantName: mPropertyBag.title,
			contexts: mPropertyBag.contexts,
			layer: mPropertyBag.layer,
			adaptationId: mPropertyBag.adaptationId,
			reference: sReference,
			generator: mPropertyBag.generator,
			variantManagementReference: mPropertyBag.variantManagementReference,
			executeOnSelection: mPropertyBag.executeOnSelection
		};

		const iLayerComparison = LayerUtils.compareAgainstCurrentLayer(oSourceVariant.getLayer(), mPropertyBag.layer);

		if (iLayerComparison === 1) {
			// current layer is lower than source variant layer, e.g. (PUBLIC) -> [USER]
			const oSourceVariantReferencedVariant = VariantManagementState.getVariant({
				reference: sReference,
				vmReference: mPropertyBag.variantManagementReference,
				vReference: oSourceVariant.getVariantReference()
			});
			if (oSourceVariantReferencedVariant.instance.getLayer() === mPropertyBag.layer) {
				// in case the new variant is in the PUBLIC layer, and the source variant references a PUBLIC variant,
				// the new variant must also reference the same variant as the PUBLIC variant
				// (PUBLIC) -> [USER] -> [PUBLIC] -> [CUSTOMER]
				mProperties.variantReference = oSourceVariantReferencedVariant.instance.getVariantReference();
			} else {
				// (PUBLIC) -> [USER] -> [CUSTOMER]
				mProperties.variantReference = oSourceVariant.getVariantReference();
			}
		} else if (iLayerComparison === 0) {
			// current layer is the same as source variant layer, so the new variant should refer to the same as the source
			mProperties.variantReference = oSourceVariant.getVariantReference();
		} else if (iLayerComparison === -1) {
			// current layer is higher than source variant layer, e.g. (USER) -> [PUBLIC]
			mProperties.variantReference = mPropertyBag.sourceVariantId;
		}

		return FlexObjectFactory.createFlVariant(mProperties);
	}

	function duplicateVariant(mPropertyBag) {
		const oSourceVariant = VariantManagementState.getVariant({
			reference: mPropertyBag.reference,
			vmReference: mPropertyBag.variantManagementReference,
			vReference: mPropertyBag.sourceVariantId
		});

		const aVariantChanges = VariantManagementState.getControlChangesForVariant({
			vmReference: mPropertyBag.variantManagementReference,
			vReference: mPropertyBag.sourceVariantId,
			reference: mPropertyBag.reference
		})
		.map((oVariantChange) => {
			return oVariantChange.convertToFileContent();
		});

		const oNewVariant = createNewVariant(oSourceVariant.instance, { ...mPropertyBag });
		return {
			instance: oNewVariant,
			variantChanges: {},
			controlChanges: aVariantChanges.reduce((aSameLayerChanges, oChange) => {
				// copy all changes in the same layer and higher layers (PUBLIC variant can copy USER layer changes)
				if (LayerUtils.compareAgainstCurrentLayer(oChange.layer, mPropertyBag.layer) >= 0) {
					const oDuplicateChangeData = merge({}, oChange);
					// ensure that the layer is set to the current variants (USER may become PUBLIC)
					oDuplicateChangeData.layer = mPropertyBag.layer;
					oDuplicateChangeData.variantReference = oNewVariant.getId();
					oDuplicateChangeData.support ||= {};
					oDuplicateChangeData.support.sourceChangeFileName = oChange.fileName;
					// For new change instances the package name needs to be reset to $TMP, BCP: 1870561348
					oDuplicateChangeData.packageName = "$TMP";
					oDuplicateChangeData.fileName = Utils.createDefaultFileName(oDuplicateChangeData.changeType);
					aSameLayerChanges.push(FlexObjectFactory.createFromFileContent(oDuplicateChangeData));
				}
				return aSameLayerChanges;
			}, [])
		};
	}

	/**
	 * Copies a variant.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {string} mPropertyBag.title - Title for the variant
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Model's app component
	 * @param {string} mPropertyBag.layer - Layer on which the new variant should be created
	 * @param {string} mPropertyBag.newVariantId - Variant Id for the new variant
	 * @param {string} mPropertyBag.sourceVariantId - Variant Id of the source variant
	 * @param {string} mPropertyBag.generator - Information about who created the change
	 * @param {object} mPropertyBag.contexts - Context structure containing roles and countries
	 * @param {boolean} mPropertyBag.executeOnSelection - Apply automatically the content of the variant
	 * @param {string} mPropertyBag.reference - Flex reference of the app
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with dirty changes created during variant copy
	 */
	async function copyVariant(mPropertyBag) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		const oDuplicateVariantData = duplicateVariant({ ...mPropertyBag });
		oDuplicateVariantData.generator = mPropertyBag.generator;

		// VMTODO: check if this can also be done in the updateData function of the variant model
		// this information is not derived from the data selector, so it needs to be set manually
		oVariantModel.oData[mPropertyBag.variantManagementReference].variants.push({
			key: oDuplicateVariantData.instance.getId(),
			rename: true,
			change: true,
			remove: true,
			sharing: mPropertyBag.layer === Layer.USER ? oVariantModel.sharing.PRIVATE : oVariantModel.sharing.PUBLIC
		});

		const aChanges = [];

		// other users should not see a new PUBLIC variant as favorite by default to not pollute their favorite list
		if (mPropertyBag.layer === Layer.PUBLIC) {
			oDuplicateVariantData.instance.setFavorite(false);
			const oChangeProperties = {
				variantId: mPropertyBag.newVariantReference,
				changeType: "setFavorite",
				fileType: "ctrl_variant_change",
				generator: mPropertyBag.generator,
				layer: Layer.USER,
				reference: mPropertyBag.reference,
				content: { favorite: true }
			};
			aChanges.push(FlexObjectFactory.createVariantChange(oChangeProperties));
		}

		const aAllFlexObjects = FlexObjectManager.addDirtyFlexObjects(
			mPropertyBag.reference,
			mPropertyBag.appComponent.getId(),
			aChanges
			.concat([oDuplicateVariantData.instance]
			.concat(oDuplicateVariantData.controlChanges)
			.concat(mPropertyBag.additionalVariantChanges))
		);

		await VariantManagerApply.updateCurrentVariant({
			variantManagementReference: mPropertyBag.variantManagementReference,
			newVariantReference: oDuplicateVariantData.instance.getId(),
			appComponent: mPropertyBag.appComponent,
			vmControl: mPropertyBag.vmControl,
			skipExecuteAfterSwitch: true,
			scenario: "saveAs"
		});
		return aAllFlexObjects;
	}

	async function switchToDefaultIfCurrentVariantIsDeleted(
		sVMReference,
		oAppComponent,
		aConfigurationChangeContent,
		oVariantManagementControl,
		sNewDefaultVariantReferenceParameter
	) {
		let sDeletedVariantReference;
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		// check if the current variant has been deleted
		if (aConfigurationChangeContent.some((oChange) => {
			if (
				oChange.visible === false
				&& oChange.variantReference === oVariantManagementControl.getCurrentVariantReference()
			) {
				sDeletedVariantReference = oChange.variantReference;
				return true;
			}
			return false;
		})) {
			// If the current variant is deleted, switch to the default variant
			// In case the deleted variant was the default or the default variant was changed in the
			// same manage variants session, switch to the new default that is passed via the event
			const sNewDefaultVariantReference = (
				sNewDefaultVariantReferenceParameter
				|| VariantManagementState.getDefaultVariantReference({
					reference: sFlexReference,
					vmReference: sVMReference
				})
			);
			await VariantManagerApply.updateCurrentVariant({
				newVariantReference: sNewDefaultVariantReference,
				vmControl: oVariantManagementControl,
				appComponent: oAppComponent
			});
		}
		return sDeletedVariantReference;
	}

	/**
	 * Deletes the variants and their related FlexObjects. By default, only variants that are in the draft
	 * or dirty state can be deleted, as they have no dependencies on them.
	 * The Business Network scenario can delete any variants (forceDelete=true).
	 * Returns all FlexObjects that were deleted in the process.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.variantManagementControl - Variant management control
	 * @param {string[]} mPropertyBag.variants - Variant IDs to be deleted
	 * @param {string} mPropertyBag.layer - Layer that the variants belong to
	 * @param {boolean} [mPropertyBag.forceDelete=false] - If set to true, the deletion will not check for draft or dirty state of the variants
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of deleted Flex Objects
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
	 */
	function deleteVariantsAndRelatedObjects(mPropertyBag) {
		if (!(mPropertyBag.variantManagementControl?.isA("sap.ui.fl.variants.VariantManagement"))) {
			throw new Error("Please provide a valid Variant Management control");
		}
		const oVariantManagementControl = mPropertyBag.variantManagementControl;
		const oAppComponent = Utils.getAppComponentForControl(oVariantManagementControl);
		const sVariantManagementReference = JsControlTreeModifier.getSelector(oVariantManagementControl, oAppComponent).id;
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		// Filter out passed variants from other layers
		let aVariantsToBeDeleted = mPropertyBag.variants.filter((sVariantId) => {
			const oVariant = VariantManagementState.getVariant({
				vmReference: sVariantManagementReference,
				reference: sFlexReference,
				vReference: sVariantId
			});
			if (!oVariant) {
				Log.warning(`Variant with ID '${sVariantId}' does not exist in the Variant Management control.`);
				return false;
			}
			return oVariant.layer === mPropertyBag.layer;
		});
		if (!mPropertyBag.forceDelete) {
			const aDraftFilenames = VersionsAPI.getDraftFilenames({
				control: oVariantManagementControl,
				layer: mPropertyBag.layer
			});
			const aDirtyFlexObjectIds = FlexObjectState.getDirtyFlexObjects(sFlexReference).map((oFlexObject) => (
				oFlexObject.getId()
			));
			aVariantsToBeDeleted = aVariantsToBeDeleted.filter((sVariantID) => (
				aDraftFilenames.includes(sVariantID) || aDirtyFlexObjectIds.includes(sVariantID)
			));
		}
		return aVariantsToBeDeleted
		.map((sVariantId) => (ControlVariantWriteUtils.deleteVariant(
			sFlexReference,
			oAppComponent.getId(),
			sVariantManagementReference,
			sVariantId
		)))
		.flat();
	}

	VariantManager.handleManageViewDialogExecution = async function(mPropertyBag) {
		const {
			vmReference: sVMReference,
			appComponent: oAppComponent,
			changeContents: aConfigurationChangesContent,
			vmControl: oVMControl,
			newDefaultVariantReferenceParameter: sNewDefaultVariantReferenceParameter,
			generatorName: sGeneratorName,
			variantsToBeDeleted: aVariantsToBeDeleted,
			layer: sLayer
		} = mPropertyBag;

		const sOldVariantReference = await switchToDefaultIfCurrentVariantIsDeleted(
			sVMReference,
			oAppComponent,
			aConfigurationChangesContent,
			oVMControl,
			sNewDefaultVariantReferenceParameter
		);

		const aNewVariantChanges = VariantManager.addVariantChanges({
			variantManagementReference: sVMReference,
			appComponent: oAppComponent,
			changeContents: aConfigurationChangesContent,
			generatorName: sGeneratorName
		});

		// Deletes variants from USER layer only. PUBLIC variants are filtered out within the method.
		// As this is a personalization scenario, there's no need to filter for dirty or draft variants (forceDelete=true).
		const aVariantDeletionChanges = deleteVariantsAndRelatedObjects({
			variantManagementControl: oVMControl,
			layer: sLayer,
			variants: aVariantsToBeDeleted,
			forceDelete: true
		});

		return [
			aNewVariantChanges,
			aVariantDeletionChanges,
			sOldVariantReference
		];
	};

	// Personalization scenario; for Adaptation, ManageVariants is used
	// The event source is the sap.m.VariantManagement control, so the fl VMControl needs to be passed separately
	VariantManager.handleManageEvent = async function(oEvent, oVMControl) {
		const sVMReference = oVMControl.getVariantManagementReference();
		const oAppComponent = Utils.getAppComponentForControl(oVMControl);
		const {
			changes: aConfigurationChangesContent,
			variantsToBeDeleted: aVariantsToBeDeleted
		} = getChangesFromManageEvent(oVMControl, Layer.USER, oEvent);

		if (!aConfigurationChangesContent.length && !aVariantsToBeDeleted.length) {
			return;
		}

		const [
			aNewVariantChanges,
			aVariantDeletionChanges
		 ] = await VariantManager.handleManageViewDialogExecution({
			vmReference: sVMReference,
			appComponent: oAppComponent,
			changeContents: aConfigurationChangesContent,
			vmControl: oVMControl,
			newDefaultVariantReferenceParameter: oEvent.getParameter("def"),
			generatorName: null,
			variantsToBeDeleted: aVariantsToBeDeleted,
			layer: Layer.USER
		});

		// Save all changes unless they were just added and then removed immediately
		// or are deleted and still dirty and were thus directly removed from the state
		const aChanges = [
			..._difference(aNewVariantChanges, aVariantDeletionChanges),
			...aVariantDeletionChanges.filter((oChange) => oChange.getState() !== States.LifecycleState.NEW)
		];
		// From the lowest to the highest layer, save the changes separately to ensure that the condense route is used.
		const aLayers = Object.values(Layer).reverse();
		for (const sCurrentLayer of aLayers) {
			const aChangesOnLayer = aChanges.filter((oChange) => oChange.getLayer() === sCurrentLayer);
			if (aChangesOnLayer.length > 0) {
				// Always pass the pre-defined changes here to avoid that UI changes that are part of the FlexState
				// are also persisted during variant manage save
				await FlexObjectManager.saveFlexObjects({
					flexObjects: aChangesOnLayer,
					selector: oAppComponent
				});
			}
		}
	};

	VariantManager.handleSaveEvent = async function(oVariantManagementControl, mParameters) {
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oVariantManagementControl);
		const oAppComponent = Utils.getAppComponentForControl(oVariantManagementControl);
		const sVMReference = oVariantManagementControl.getVariantManagementReference();
		let aNewVariantDirtyChanges;

		await VariantManagerApply.executeAfterSwitch(async () => {
			const sSourceVariantId = oVariantManagementControl.getCurrentVariantReference();
			const aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
				reference: sFlexReference,
				vmReference: sVMReference,
				vReference: sSourceVariantId
			});

			if (mParameters.overwrite) {
				// handle triggered "Save" button
				// Includes special handling for PUBLIC variant which requires changing all the dirty changes to PUBLIC layer before saving
				aNewVariantDirtyChanges = getDirtyControlChangesFromVariant(aSourceVariantChanges, sFlexReference);
				const oSourceVariant = VariantManagementState.getVariant({
					reference: sFlexReference,
					vmReference: sVMReference,
					vReference: sSourceVariantId
				});
				if (oSourceVariant.layer === Layer.PUBLIC) {
					aNewVariantDirtyChanges.forEach((oChange) => oChange.setLayer(Layer.PUBLIC));
				}
				const oResponse = await FlexObjectManager.saveFlexObjects({
					flexObjects: aNewVariantDirtyChanges,
					selector: oAppComponent
				});

				return oResponse;
			}

			const sVariantLayer = mParameters.layer || (mParameters.public ? Layer.PUBLIC : Layer.USER);
			const sVariantChangeLayer = mParameters.layer || Layer.USER;

			// handle triggered "SaveAs" button
			const sNewVariantReference = mParameters.newVariantReference || Utils.createDefaultFileName("flVariant");
			const mPropertyBag = {
				variantManagementReference: sVMReference,
				vmControl: oVariantManagementControl,
				appComponent: oAppComponent,
				layer: sVariantLayer,
				title: mParameters.name,
				contexts: mParameters.contexts,
				sourceVariantId: sSourceVariantId,
				newVariantReference: sNewVariantReference,
				generator: mParameters.generator,
				additionalVariantChanges: [],
				adaptationId: getAdaptationId(sVariantChangeLayer, oAppComponent, sFlexReference),
				executeOnSelection: mParameters.execute,
				reference: sFlexReference
			};

			const oBaseChangeProperties = {
				content: {},
				reference: sFlexReference,
				generator: mPropertyBag.generator,
				layer: sVariantChangeLayer,
				adaptationId: mPropertyBag.adaptationId
			};

			if (mParameters.def) {
				const mPropertyBagSetDefault = merge({
					changeType: "setDefault",
					content: {
						defaultVariant: sNewVariantReference
					},
					fileType: "ctrl_variant_management_change",
					selector: JsControlTreeModifier.getSelector(sVMReference, mPropertyBag.appComponent)
				}, oBaseChangeProperties);
				mPropertyBag.additionalVariantChanges.push(FlexObjectFactory.createVariantManagementChange(mPropertyBagSetDefault));
			}

			const aCopiedVariantDirtyChanges = await copyVariant(mPropertyBag);
			aNewVariantDirtyChanges = aCopiedVariantDirtyChanges;
			// unsaved changes on the source variant are removed before copied variant changes are saved
			await eraseDirtyChanges({
				changes: aSourceVariantChanges,
				reference: sFlexReference,
				vmReference: sVMReference,
				vReference: sSourceVariantId,
				appComponent: oAppComponent
			});
			return handleDirtyChanges({
				dirtyChanges: aNewVariantDirtyChanges,
				variantManagementReference: sVMReference,
				appComponent: oAppComponent,
				variantManagementControl: oVariantManagementControl,
				flexReference: sFlexReference
			});
		}, sFlexReference, sVMReference);
		return aNewVariantDirtyChanges;
	};

	/**
	 * Adds and applies the given changes.
	 *
	 * @param {Array<sap.ui.fl.apply._internal.flexObjects.FlexObject>} aChanges Changes to be applied
	 * @param {sap.ui.core.Control} oControl - Control instance to fetch the variant model
	 * @returns {Promise<undefined>} Promise resolving when all changes are applied
	 */
	VariantManager.addAndApplyControlChangesOnVariant = function(aChanges, oControl) {
		const oAppComponent = Utils.getAppComponentForControl(oControl);
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: oAppComponent });
		const aAddedChanges = UIChangeManager.addDirtyChanges(sFlexReference, aChanges, oAppComponent);
		return aAddedChanges.reduce(async function(oPreviousPromise, oChange) {
			await oPreviousPromise;
			const oControl = Element.getElementById(
				JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent)
			);
			const oReturn = await Applier.applyChangeOnControl(oChange, oControl, {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent,
				view: Utils.getViewForControl(oControl)
			});
			if (!oReturn.success) {
				const oException = oReturn.error || new Error("The change could not be applied.");
				FlexObjectManager.deleteFlexObjects({
					reference: sFlexReference,
					componentId: oAppComponent.getId(),
					flexObjects: [oChange]
				});
				throw oException;
			}
		}, Promise.resolve());
	};

	/**
	 * Erases dirty changes on a given variant and returns the dirty changes.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {string} mPropertyBag.variantReference - Variant reference to remove dirty changes from
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control instance to fetch the variant model
	 * @param {boolean} [mPropertyBag.revert] - Whether the changes should be reverted
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with the removed dirty changes
	 */
	VariantManager.eraseDirtyChangesOnVariant = async function(mPropertyBag) {
		const {
			variantManagementReference: sVariantManagementReference,
			variantReference: sVariantReference,
			control: oControl,
			revert: bRevert
		} = mPropertyBag;

		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: oControl });
		var aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
			reference: sFlexReference,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference
		});

		var aSourceVariantDirtyChanges = getDirtyControlChangesFromVariant(aSourceVariantChanges, sFlexReference);

		await eraseDirtyChanges({
			changes: aSourceVariantChanges,
			reference: sFlexReference,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference,
			appComponent: Utils.getAppComponentForControl(oControl),
			revert: bRevert === undefined ? true : bRevert
		});
		return aSourceVariantDirtyChanges;
	};

	/**
	 * Removes a variant and switches to the provided sourceVariantReference.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {sap.ui.fl.variants.Variant} mPropertyBag.variant - Variant to be removed
	 * @param {string} mPropertyBag.sourceVariantReference - Source variant reference that should be set as current after removing
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
	 */
	VariantManager.removeVariant = async function(mPropertyBag) {
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: mPropertyBag.appComponent });
		var aChangesToBeDeleted = FlexObjectState.getDirtyFlexObjects(sFlexReference)
		.filter(function(oChange) {
			return (oChange.getVariantReference && oChange.getVariantReference() === mPropertyBag.variant.getId()) ||
				oChange.getId() === mPropertyBag.variant.getId();
		});

		await VariantManagerApply.updateCurrentVariant({
			newVariantReference: mPropertyBag.sourceVariantReference,
			appComponent: mPropertyBag.appComponent,
			vmControl: mPropertyBag.vmControl
		});
		FlexObjectManager.deleteFlexObjects({
			reference: sFlexReference,
			componentId: mPropertyBag.appComponent.getId(),
			flexObjects: aChangesToBeDeleted
		});
	};

	/**
	 * Sets the variant properties and adds changes to the variants.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {object[]} mPropertyBag.changeContents - Array of change content objects
	 * @param {string} [mPropertyBag.generatorName] - Generator name for the changes
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Created Change objects
	 */
	VariantManager.addVariantChanges = function(mPropertyBag) {
		const {
			variantManagementReference: sVariantManagementReference,
			appComponent: oAppComponent,
			changeContents: aChangeContents,
			generatorName: sGeneratorName
		} = mPropertyBag;
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		const aChanges = aChangeContents.map((mChangeContent) => {
			mChangeContent.appComponent = oAppComponent;
			mChangeContent.generator ||= sGeneratorName;
			return VariantManager.createVariantChange(sVariantManagementReference, mChangeContent);
		});
		FlexObjectManager.addDirtyFlexObjects(sFlexReference, oAppComponent.getId(), aChanges);
		return aChanges;
	};

	/**
	 * Sets the variant properties and creates a variant change
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} [mPropertyBag.adaptationId] - Adaptation ID to set which overrules the currently display adaptation
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created Change object
	 */
	VariantManager.createVariantChange = function(sVariantManagementReference, mPropertyBag) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		var mAdditionalChangeContent = oVariantModel.setVariantProperties(sVariantManagementReference, mPropertyBag);

		var mNewChangeData = {
			changeType: mPropertyBag.changeType,
			layer: mPropertyBag.layer,
			generator: mPropertyBag.generator,
			reference: oVariantModel.sFlexReference
		};

		if (mPropertyBag.adaptationId !== undefined) {
			mNewChangeData.adaptationId = mPropertyBag.adaptationId;
		} else {
			mNewChangeData.adaptationId = getAdaptationId(mPropertyBag.layer, mPropertyBag.appComponent, oVariantModel.sFlexReference);
		}

		let oChange;
		if (mPropertyBag.changeType === "setDefault") {
			mNewChangeData.fileType = "ctrl_variant_management_change";
			mNewChangeData.selector = JsControlTreeModifier.getSelector(sVariantManagementReference, mPropertyBag.appComponent);
			oChange = FlexObjectFactory.createVariantManagementChange(mNewChangeData);
		} else {
			mNewChangeData.fileType = "ctrl_variant_change";
			mNewChangeData.variantId = mPropertyBag.variantReference;
			oChange = FlexObjectFactory.createVariantChange(mNewChangeData);
		}

		// update change with additional content
		oChange.setContent(mAdditionalChangeContent);
		if (mPropertyBag.changeType === "setTitle") {
			oChange.setText("title", mPropertyBag.title, "XFLD");
		}

		return oChange;
	};

	/**
	 * Opens the <i>Manage Views</i> dialog in Adaptation mode. Called from the ControlVariant plugin.
	 * For Personalization, handleManageEvent is used.
	 * Returns a promise which resolves to changes made from the manage dialog, based on the parameters passed.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.variantManagementControl - Variant management control
	 * @param {string} mPropertyBag.layer - Current layer
	 * @param {string} mPropertyBag.styleClass - Style class assigned to the management dialog
	 * @param {Promise<sap.ui.core.ComponentContainer>} mPropertyBag.contextSharingComponentPromise - Promise resolving with the ComponentContainer
	 * @returns {Promise<void>} Resolves when "manage" event is fired from the variant management control
	 * @private
	 * @ui5-restricted
	 */
	VariantManager.openManageVariantsDialog = function(mPropertyBag) {
		const {
			variantManagementControl: oVariantManagementControl,
			layer: sLayer,
			styleClass: sClass,
			contextSharingComponentPromise: oContextSharingComponentPromise
		} = mPropertyBag;

		function onManageSaveRta(oEvent, mParams) {
			const oModelChanges = getChangesFromManageEvent(oVariantManagementControl, sLayer, oEvent);
			mParams.resolve(oModelChanges);
		}

		return new Promise(function(resolve) {
			oVariantManagementControl.attachEventOnce("manage", { resolve }, onManageSaveRta);
			oVariantManagementControl.openManagementDialog(true, sClass, oContextSharingComponentPromise);
		});
	};

	/**
	 * Returns the dirty control changes from the given control changes.
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aControlChanges - Array of changes to be checked
	 * @param {string} sFlexReference - Flex reference of the app
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of filtered changes
	 * @private
	 */
	VariantManager.getDirtyControlChangesFromVariant = function(aControlChanges, sFlexReference) {
		return getDirtyControlChangesFromVariant(aControlChanges, sFlexReference);
	};

	/**
	 * Invalidates the variant management map for the given flex reference.
	 * This is used to ensure that the variant management map is updated when changes are made.
	 * @param {string} sFlexReference - Flex reference of the app
	 */
	VariantManager.updateVariantManagementMap = function(sFlexReference) {
		VariantManagementState.getVariantManagementMap().checkUpdate({ reference: sFlexReference });
	};

	/**
	 * Deletes the variants and their related FlexObjects. By default, only variants that are in the draft
	 * or dirty state can be deleted, as they have no dependencies on them.
	 * The Business Network scenario can delete any variants (forceDelete=true).
	 * Returns all FlexObjects that were deleted in the process.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.variantManagementControl - Variant management control
	 * @param {string[]} mPropertyBag.variants - Variant IDs to be deleted
	 * @param {string} mPropertyBag.layer - Layer that the variants belong to
	 * @param {boolean} [mPropertyBag.forceDelete=false] - If set to true, the deletion will not check for draft or dirty state of the variants
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of deleted Flex Objects
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
	 */
	VariantManager.deleteVariantsAndRelatedObjects = function(mPropertyBag) {
		return deleteVariantsAndRelatedObjects(mPropertyBag);
	};

	return VariantManager;
});
