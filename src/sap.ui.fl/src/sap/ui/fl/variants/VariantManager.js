/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_difference",
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	_difference,
	merge,
	JsControlTreeModifier,
	Element,
	Applier,
	Reverter,
	FlexObjectFactory,
	States,
	Switcher,
	VariantManagementState,
	FlexObjectState,
	FlexRuntimeInfoAPI,
	ManifestUtils,
	Settings,
	ControlVariantWriteUtils,
	UIChangeManager,
	FlexObjectManager,
	ContextBasedAdaptationsAPI,
	Layer,
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

	function getVariantModel(oControl) {
		const oAppComponent = Utils.getAppComponentForControl(oControl);
		return oAppComponent.getModel("$FlexVariants");
	}

	function getDirtyChangesFromVariantChanges(aControlChanges, sFlexReference) {
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
		var aVariantDirtyChanges = getDirtyChangesFromVariantChanges(mPropertyBag.changes, mPropertyBag.reference);
		aVariantDirtyChanges = aVariantDirtyChanges.reverse();

		if (mPropertyBag.revert) {
			await Reverter.revertMultipleChanges(aVariantDirtyChanges, {
				appComponent: mPropertyBag.appComponent,
				modifier: JsControlTreeModifier,
				reference: mPropertyBag.reference
			});
		}
		FlexObjectManager.deleteFlexObjects({
			reference: mPropertyBag.reference,
			flexObjects: aVariantDirtyChanges
		});
	}

	/**
	 * Adds the passed function to the variant switch promise and returns the whole promise chain.
	 *
	 * @param {function():Promise} fnCallback - Callback function returning a promise
	 * @param {string} sFlexReference - Flex reference of the app
	 * @param {string} sVMReference - Variant Management reference
	 * @returns {Promise} Resolves when the variant model is not busy anymore
	 * @private
	 */
	function executeAfterSwitch(fnCallback, sFlexReference, sVMReference) {
		// if there are multiple switches triggered very quickly this makes sure that they are being executed one after another
		const oNewPromise = VariantManagementState.waitForVariantSwitch(sFlexReference, sVMReference)
		.catch(function() {})
		.then(fnCallback);
		VariantManagementState.setVariantSwitchPromise(sFlexReference, sVMReference, oNewPromise);
		return oNewPromise;
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
		// TODO: the logic needs to be refactored to get rid of this circular dependency
		var bHasAdaptationsModel = ContextBasedAdaptationsAPI.hasAdaptationsModel(mContextBasedAdaptationBag);
		return bHasAdaptationsModel && ContextBasedAdaptationsAPI.getDisplayedAdaptationId(mContextBasedAdaptationBag);
	}

	/**
	 * Switches the current variant and triggers all switch listener.
	 *
	 * @param {object} mPropertyBag - Object with properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {string} mPropertyBag.newVariantReference - Variant reference to be set as current
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
	 * @param {sap.ui.core.Component} [mPropertyBag.appComponent] - App component
	 * @param {boolean} [mPropertyBag.internallyCalled] - Whether the function is called from within the VariantManager
	 * @param {string} [mPropertyBag.scenario] - Scenario why the variant is switched
	 * @returns {Promise} Resolves when the variant has been switched
	 */
	VariantManager.updateCurrentVariant = function(mPropertyBag) {
		const oAppComponent = mPropertyBag.appComponent || Utils.getAppComponentForControl(mPropertyBag.vmControl);
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		const mProperties = {
			vmReference: mPropertyBag.variantManagementReference,
			currentVReference: mPropertyBag.vmControl.getCurrentVariantReference(),
			newVReference: mPropertyBag.newVariantReference,
			appComponent: oAppComponent,
			modifier: JsControlTreeModifier,
			reference: sFlexReference
		};

		const fnSwitchVariant = async () => {
			const oNewVariant = VariantManagementState.getVariant({
				reference: sFlexReference,
				vmReference: mProperties.vmReference,
				vReference: mProperties.newVReference
			});
			if (mPropertyBag.scenario) {
				// Only relevant for the callback - no need to persist this information
				oNewVariant.createScenario = mPropertyBag.scenario;
			}
			await Switcher.switchVariant(mProperties);
			mPropertyBag.vmControl._executeAllVariantAppliedListeners(oNewVariant);
		};

		if (mPropertyBag.internallyCalled) {
			return fnSwitchVariant();
		}
		return executeAfterSwitch(
			fnSwitchVariant,
			sFlexReference,
			mPropertyBag.variantManagementReference
		);
	};

	/**
	 * Handler for "select" event fired from a variant management control. Adds to the variant switch promise chain,
	 * resolving when new variant (if applicable) has been switched and all source variant dirty changes have been removed.
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @param {object} mPropertyBag - Object with properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model instance
	 * @returns {Promise<undefined>} Resolves with undefined
	 */
	VariantManager.handleSelectVariant = function(oEvent, mPropertyBag) {
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oEvent.getSource());
		return executeAfterSwitch(async () => {
			const oVMControl = oEvent.getSource();
			const oAppComponent = Utils.getAppComponentForControl(oVMControl);
			const sVMReference = mPropertyBag.vmReference;
			const bOldVariantWasModified = oVMControl.getModified();
			const sTargetVReference = oEvent.getParameter("key");
			let sSourceVReference = oEvent.getParameter("key");
			let bVariantSwitch = false;
			// for standard variants 'currentVariant' property is not set
			// e.g. variants generated through _ensureStandardVariantExists()
			const sCurrentVariantKey = oVMControl.getCurrentVariantReference();
			if (sCurrentVariantKey && sCurrentVariantKey !== sTargetVReference) {
				sSourceVReference = sCurrentVariantKey;
				bVariantSwitch = true;
				await VariantManager.updateCurrentVariant({
					variantManagementReference: sVMReference,
					newVariantReference: sTargetVReference,
					appComponent: oAppComponent,
					vmControl: oVMControl,
					internallyCalled: true
				});
			}
			if (bOldVariantWasModified) {
				const aControlChanges = VariantManagementState.getControlChangesForVariant({
					reference: sFlexReference,
					vmReference: sVMReference,
					vReference: sSourceVReference
				});
				await eraseDirtyChanges({
					changes: aControlChanges,
					reference: sFlexReference,
					vmReference: sVMReference,
					vReference: sSourceVReference,
					appComponent: oAppComponent,
					revert: !bVariantSwitch
				});
			}

			// updateCurrentVariant already calls the listeners
			if (!bVariantSwitch) {
				const oVariant = VariantManagementState.getVariant({
					reference: sFlexReference,
					vmReference: sVMReference,
					vReference: oVMControl.getCurrentVariantReference()
				});
				oVMControl._executeAllVariantAppliedListeners(oVariant);
			}
		}, sFlexReference, mPropertyBag.vmReference);
	};

	// Personalization scenario; for Adaptation, manageVariants is used
	// The event source is the sap.m.VariantManagement control, so the fl VMControl needs to be passed separately
	VariantManager.handleManageEvent = async function(oEvent, oVMControl) {
		const sVMReference = oVMControl.getVariantManagementReference();
		const oAppComponent = Utils.getAppComponentForControl(oVMControl);
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		const {
			changes: aConfigurationChangesContent,
			variantsToBeDeleted: aVariantsToBeDeleted
		} = getChangesFromManageEvent(oVMControl, Layer.USER, oEvent);

		if (!aConfigurationChangesContent.length && !aVariantsToBeDeleted.length) {
			return;
		}

		if (aConfigurationChangesContent.some((oChange) => {
			return oChange.visible === false
			&& oChange.variantReference === oVMControl.getCurrentVariantReference();
		})) {
			// If the current variant is deleted, switch to the default variant
			// In case the deleted variant was the default or the default variant was changed in the
			// same manage variants session, switch to the new default that is passed via the event
			const sNewDefaultVariantReference = (
				oEvent.getParameter("def")
				|| VariantManagementState.getDefaultVariantReference({
					reference: sFlexReference,
					vmReference: sVMReference
				})
			);
			await VariantManager.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: sNewDefaultVariantReference,
				vmControl: oVMControl,
				appComponent: Utils.getAppComponentForControl(oVMControl)
			});
		}

		aConfigurationChangesContent.forEach(function(oChangeProperties) {
			oChangeProperties.appComponent = oAppComponent;
		});

		const aNewVariantChanges = VariantManager.addVariantChanges(sVMReference, aConfigurationChangesContent);
		const aVariantDeletionChanges = aVariantsToBeDeleted
		.map((sVariantKey) => {
			const oVariant = VariantManagementState.getVariant({
				reference: sFlexReference,
				vmReference: sVMReference,
				vReference: sVariantKey
			});
			if (oVariant.layer === Layer.USER) {
				return ControlVariantWriteUtils.deleteVariant(sFlexReference, sVMReference, sVariantKey);
			}
			return [];
		})
		.flat();
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

		await executeAfterSwitch(async () => {
			const sSourceVariantReference = oVariantManagementControl.getCurrentVariantReference();
			const aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
				reference: sFlexReference,
				vmReference: sVMReference,
				vReference: sSourceVariantReference
			});

			if (mParameters.overwrite) {
				// handle triggered "Save" button
				// Includes special handling for PUBLIC variant which requires changing all the dirty changes to PUBLIC layer before saving
				aNewVariantDirtyChanges = getDirtyChangesFromVariantChanges(aSourceVariantChanges, sFlexReference);
				const oSourceVariant = VariantManagementState.getVariant({
					reference: sFlexReference,
					vmReference: sVMReference,
					vReference: sSourceVariantReference
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
				sourceVariantReference: sSourceVariantReference,
				newVariantReference: sNewVariantReference,
				generator: mParameters.generator,
				additionalVariantChanges: [],
				adaptationId: getAdaptationId(sVariantChangeLayer, oAppComponent, sFlexReference),
				executeOnSelection: mParameters.execute
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

			const aCopiedVariantDirtyChanges = await VariantManager.copyVariant(mPropertyBag);
			aNewVariantDirtyChanges = aCopiedVariantDirtyChanges;
			// unsaved changes on the source variant are removed before copied variant changes are saved
			await eraseDirtyChanges({
				changes: aSourceVariantChanges,
				reference: sFlexReference,
				vmReference: sVMReference,
				vReference: sSourceVariantReference,
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
	VariantManager.addAndApplyChangesOnVariant = function(aChanges, oControl) {
		const oVariantModel = getVariantModel(oControl);
		const aAddedChanges = UIChangeManager.addDirtyChanges(oVariantModel.sFlexReference, aChanges, oVariantModel.oAppComponent);
		return aAddedChanges.reduce(async function(oPreviousPromise, oChange) {
			await oPreviousPromise;
			const oControl = Element.getElementById(
				JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oVariantModel.oAppComponent)
			);
			const oReturn = await Applier.applyChangeOnControl(oChange, oControl, {
				modifier: JsControlTreeModifier,
				appComponent: oVariantModel.oAppComponent,
				view: Utils.getViewForControl(oControl)
			});
			if (!oReturn.success) {
				var oException = oReturn.error || new Error("The change could not be applied.");
				FlexObjectManager.deleteFlexObjects({
					reference: oVariantModel.sFlexReference,
					flexObjects: [oChange]
				});
				throw oException;
			}
		}, Promise.resolve());
	};

	/**
	 * Erases dirty changes on a given variant and returns the dirty changes.
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {string} sVariantReference - Variant reference to remove dirty changes from
	 * @param {sap.ui.core.Control} oControl - Control instance to fetch the variant model
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with the removed dirty changes
	 */
	VariantManager.eraseDirtyChangesOnVariant = async function(sVariantManagementReference, sVariantReference, oControl) {
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: oControl });
		var aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
			reference: sFlexReference,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference
		});

		var aSourceVariantDirtyChanges = getDirtyChangesFromVariantChanges(aSourceVariantChanges, sFlexReference);

		await eraseDirtyChanges({
			changes: aSourceVariantChanges,
			reference: sFlexReference,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference,
			appComponent: Utils.getAppComponentForControl(oControl),
			revert: true
		});
		return aSourceVariantDirtyChanges;
	};

	/**
	 * Copies a variant.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {string} mPropertyBag.title - Title for the variant
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Model's app component
	 * @param {string} mPropertyBag.layer - Layer on which the new variant should be created
	 * @param {string} mPropertyBag.newVariantReference - <code>variantReference</code> for the new variant
	 * @param {string} mPropertyBag.sourceVariantReference - <code>variantReference</code> of the source variant
	 * @param {string} mPropertyBag.generator - Information about who created the change
	 * @param {object} mPropertyBag.contexts - Context structure containing roles and countries
	 * @param {boolean} mPropertyBag.executeOnSelection - Apply automatically the content of the variant
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with dirty changes created during variant copy
	 * @private
	 */
	VariantManager.copyVariant = async function(mPropertyBag) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		var oDuplicateVariantData = oVariantModel._duplicateVariant(mPropertyBag);
		oDuplicateVariantData.generator = mPropertyBag.generator;

		oVariantModel.oData[mPropertyBag.variantManagementReference].variants.push({
			key: oDuplicateVariantData.instance.getId(),
			rename: true,
			change: true,
			remove: true,
			sharing: mPropertyBag.layer === Layer.USER
				? oVariantModel.sharing.PRIVATE
				: oVariantModel.sharing.PUBLIC
		});

		var aChanges = [];

		// when created a new public variant other users do not see the new public variant
		if (mPropertyBag.layer === Layer.PUBLIC) {
			oDuplicateVariantData.instance.setFavorite(false);
			var oChangeProperties = {
				variantId: mPropertyBag.newVariantReference,
				changeType: "setFavorite",
				fileType: "ctrl_variant_change",
				generator: mPropertyBag.generator,
				layer: Layer.USER,
				reference: oVariantModel.sFlexReference,
				content: { favorite: true }
			};
			aChanges.push(FlexObjectFactory.createVariantChange(oChangeProperties));
		}

		// sets copied variant and associated changes as dirty
		aChanges = FlexObjectManager.addDirtyFlexObjects(
			oVariantModel.sFlexReference,
			mPropertyBag.appComponent.getId(),
			aChanges
			.concat([oDuplicateVariantData.instance]
			.concat(oDuplicateVariantData.controlChanges)
			.concat(mPropertyBag.additionalVariantChanges))
		);

		await VariantManager.updateCurrentVariant({
			variantManagementReference: mPropertyBag.variantManagementReference,
			newVariantReference: oDuplicateVariantData.instance.getId(),
			appComponent: mPropertyBag.appComponent,
			vmControl: mPropertyBag.vmControl,
			internallyCalled: true,
			scenario: "saveAs"
		});
		return aChanges;
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
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		var aChangesToBeDeleted = FlexObjectState.getDirtyFlexObjects(oVariantModel.sFlexReference)
		.filter(function(oChange) {
			return (oChange.getVariantReference && oChange.getVariantReference() === mPropertyBag.variant.getId()) ||
				oChange.getId() === mPropertyBag.variant.getId();
		});

		await VariantManager.updateCurrentVariant({
			variantManagementReference: mPropertyBag.variantManagementReference,
			newVariantReference: mPropertyBag.sourceVariantReference,
			appComponent: mPropertyBag.appComponent,
			vmControl: mPropertyBag.vmControl
		});
		FlexObjectManager.deleteFlexObjects({
			reference: oVariantModel.sFlexReference,
			flexObjects: aChangesToBeDeleted
		});
	};

	/**
	 * Sets the variant properties and adds a variant change
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created Change object
	 */
	VariantManager.addVariantChange = function(sVariantManagementReference, mPropertyBag) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		var oChange = VariantManager.createVariantChange(sVariantManagementReference, mPropertyBag);
		FlexObjectManager.addDirtyFlexObjects(oVariantModel.sFlexReference, mPropertyBag.appComponent.getId(), [oChange]);

		return oChange;
	};

	/**
	 * Sets the variant properties and adds variant changes
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object[]} aChangePropertyMaps - Array of property maps optionally including the adaptation ID
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Created Change objects
	 */
	VariantManager.addVariantChanges = function(sVariantManagementReference, aChangePropertyMaps) {
		const oVariantModel = getVariantModel(aChangePropertyMaps[0].appComponent);
		var aChanges = aChangePropertyMaps.map(function(mProperties) {
			return VariantManager.createVariantChange(sVariantManagementReference, mProperties);
		});
		FlexObjectManager.addDirtyFlexObjects(oVariantModel.sFlexReference, aChangePropertyMaps[0].appComponent.getId(), aChanges);

		return aChanges;
	};

	/**
	 * Sets the variant properties and deletes a variant change
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Variant change to be deleted
	 */
	VariantManager.deleteVariantChange = function(sVariantManagementReference, mPropertyBag, oChange) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		oVariantModel.setVariantProperties(sVariantManagementReference, mPropertyBag);
		FlexObjectManager.deleteFlexObjects({
			reference: oVariantModel.sFlexReference,
			flexObjects: [oChange]
		});
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
	 * @param {sap.ui.fl.variants.VariantManagement} oVariantManagementControl - Variant management control
	 * @param {string} sLayer - Current layer
	 * @param {string} sClass - Style class assigned to the management dialog
	 * @param {Promise<sap.ui.core.ComponentContainer>} oContextSharingComponentPromise - Promise resolving with the ComponentContainer
	 * @returns {Promise<void>} Resolves when "manage" event is fired from the variant management control
	 * @private
	 * @ui5-restricted
	 */
	VariantManager.manageVariants = function(oVariantManagementControl, sLayer, sClass, oContextSharingComponentPromise) {
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
	 * Returns the dirty changes from the given changes.
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aControlChanges - Array of changes to be checked
	 * @param {string} sFlexReference - Flex reference of the app
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of filtered changes
	 * @private
	 */
	VariantManager.getDirtyChangesFromVariantChanges = function(aControlChanges, sFlexReference) {
		return getDirtyChangesFromVariantChanges(aControlChanges, sFlexReference);
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
	 * Returns all control changes for the given variant.
	 * @param {string} sFlexReference - Flex reference of the app
	 * @param {*} sVMReference - Variant Management reference
	 * @param {*} sVReference - Variant reference
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of control changes for the given variant
	 */
	VariantManager.getControlChangesForVariant = function(sFlexReference, sVMReference, sVReference) {
		return VariantManagementState.getVariant({
			reference: sFlexReference,
			vmReference: sVMReference,
			vReference: sVReference
		}).controlChanges;
	};

	return VariantManager;
});
