/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_difference",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/restricted/_omit",
	"sap/base/util/Deferred",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/m/library",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/controlVariants/resolveInitialVariantFromURL",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode"
], function(
	_difference,
	_isEqual,
	_omit,
	Deferred,
	merge,
	Log,
	mobileLibrary,
	JsControlTreeModifier,
	Lib,
	URLHandler,
	VariantUtil,
	resolveInitialVariantFromURL,
	FlexObjectFactory,
	DependencyHandler,
	VariantManagerApply,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	Loader,
	ManifestUtils,
	Settings,
	Layer,
	LayerUtils,
	Utils,
	JSONModel,
	BindingMode
) {
	"use strict";

	const { SharingMode } = mobileLibrary;

	function updatePersonalVariantPropertiesWithFlpSettings(oVariant) {
		var oSettings = Settings.getInstanceOrUndef();
		if (oSettings && !oSettings.getIsVariantPersonalizationEnabled()) {
			oVariant.remove = false;
			oVariant.rename = false;
			oVariant.change = false;
		}
	}

	function updatePublicVariantPropertiesWithSettings(oVariant) {
		var oSettings = Settings.getInstanceOrUndef();
		var bUserIsAuthorized = oSettings &&
			(oSettings.getIsKeyUser() || (oSettings.getIsPublicFlVariantEnabled() && oVariant.instance.isUserAuthor()));
		oVariant.remove = bUserIsAuthorized;
		oVariant.rename = bUserIsAuthorized;
		oVariant.change = bUserIsAuthorized;
	}

	function isVariantValidForRemove(oVariant, sVariantManagementReference, bDesignTimeModeToBeSet) {
		var sLayer = bDesignTimeModeToBeSet ? LayerUtils.getCurrentLayer() : Layer.USER;
		if ((oVariant.layer === sLayer) && (oVariant.key !== sVariantManagementReference)) {
			return true;
		}
		return false;
	}

	function getVariant(aVariants, sVariantKey) {
		return merge({}, aVariants.find(function(oCurrentVariant) {
			return oCurrentVariant.key === sVariantKey;
		}));
	}

	function waitForInitialVariantChanges(mPropertyBag) {
		const aCurrentVariantChanges = VariantManagementState.getInitialUIChanges({
			vmReference: mPropertyBag.vmReference,
			reference: mPropertyBag.reference
		});
		const aSelectors = aCurrentVariantChanges.reduce((aCurrentControls, oChange) => {
			const oSelector = oChange.getSelector();
			const oControl = JsControlTreeModifier.bySelector(oSelector, mPropertyBag.appComponent);
			if (oControl && Utils.indexOfObject(aCurrentControls, { selector: oControl }) === -1) {
				aCurrentControls.push({ selector: oControl });
			}
			return aCurrentControls;
		}, []);
		return aSelectors.length ? FlexObjectState.waitForFlexObjectsToBeApplied(aSelectors, mPropertyBag.appComponent) : Promise.resolve();
	}

	/**
	 * Constructor for a new sap.ui.fl.variants.VariantModel model.
	 * @class Variant model implementation for JSON format.
	 * @extends sap.ui.model.json.JSONModel
	 * @author SAP SE
	 * @version ${version}
	 * @param {object} oData - Either the URL where to load the JSON from or a JS object
	 * @param {object} mPropertyBag - Map of properties required for the constructor
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component instance that is currently loading
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.fl
	 * @since 1.50
	 * @alias sap.ui.fl.variants.VariantModel
	 */
	var VariantModel = JSONModel.extend("sap.ui.fl.variants.VariantModel", /** @lends sap.ui.fl.variants.VariantModel.prototype */ {
		constructor: function(oData, mPropertyBag) {
			// JSON model internal properties
			this.pSequentialImportCompleted = Promise.resolve();
			JSONModel.apply(this, [oData]);

			this.sFlexReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.appComponent);
			this.oAppComponent = mPropertyBag.appComponent;
			this.sVMReference = mPropertyBag.vmReference;
			this.oVMControl = mPropertyBag.vmControl;
			this._oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");

			this.oDataSelector = VariantManagementState.getVariantManagementDataSelector();
			// todos#20: Make sure the variant management entry exists in the map before subscribing
			// to updates so that the model has a valid initial state even when no variants
			// were loaded for this VM. This comment can be removed once the data selector is more robust.
			ensureStandardVariantExists(this);

			this.fnUpdateListener = this.updateData.bind(this);
			this.oDataSelector.addUpdateListener(this.fnUpdateListener);
			// Initialize data
			this.updateData();

			const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(this.sFlexReference);
			VariantManagementState.getInitialUIChanges({
				reference: this.sFlexReference,
				vmReference: this.sVMReference
			}).forEach((oFlexObject) => {
				DependencyHandler.addChangeAndUpdateDependencies(oFlexObject, this.oAppComponent.getId(), oLiveDependencyMap);
			});

			this.setDefaultBindingMode(BindingMode.OneWay);
			// Increase the default size limit (100) to allow for large numbers of variants.
			this.setSizeLimit(10000);
		}
	});

	VariantModel.prototype.updateData = function() {
		const oVariantMapEntry = this.oDataSelector.get({
			reference: this.sFlexReference,
			variantManagementReference: this.sVMReference
		});
		const oCurrentData = { ...this.getData() };
		const aPreviousVariants = oCurrentData.variants || [];
		oCurrentData.variants = oVariantMapEntry.variants.map((oVariant) => {
			const oCurrentVariantData = aPreviousVariants
			.find((oVariantToCheck) => oVariantToCheck.key === oVariant.key) || {};
			return {
				// Default values
				rename: true,
				change: true,
				remove: true,
				sharing: oVariant.layer === Layer.USER ? SharingMode.Private : SharingMode.Public,
				// Previous values
				...oCurrentVariantData,
				...oVariant
			};
		});
		const sOldCurrentVariant = oCurrentData.currentVariant;
		if (
			this.oVMControl.getUpdateVariantInURL()
			&& sOldCurrentVariant
			&& sOldCurrentVariant !== oVariantMapEntry.currentVariant
		) {
			this._oURLHandler?.updateVariantInURL(oVariantMapEntry.currentVariant);
		}
		oCurrentData.currentVariant = oVariantMapEntry.currentVariant;
		oCurrentData.defaultVariant = oVariantMapEntry.defaultVariant;
		oCurrentData.modified = oVariantMapEntry.modified;
		this.setData(oCurrentData);

		// Since the model has an one-way binding, some VariantItem properties that were overridden
		// via direct setter calls need to be updated explicitly
		this.refresh(true);
	};

	VariantModel.prototype.initializeURLHandler = async function() {
		if (!this.oVMControl.getUpdateVariantInURL() || !Utils.getUshellContainer()) {
			return;
		}
		if (!this._oURLHandler) {
			this._oURLHandler = new URLHandler({
				vmReference: this.sVMReference,
				flexReference: this.sFlexReference,
				appComponent: this.oAppComponent
			});
			await this._oURLHandler.initialize();
		}
		this._oURLHandler.registerControl();
		this._oURLHandler.handleModelContextChange(this.oVMControl);
	};

	/**
	 * Returns the URL handler instance for this model.
	 * @returns {sap.ui.fl.apply._internal.controlVariants.URLHandler} The URL handler instance
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	VariantModel.prototype._getURLHandler = function() {
		return this._oURLHandler;
	};

	/**
	 * Returns the current variant for this model's variant management control.
	 * @returns {string} Current variant reference
	 * @private
	 * @ui5-restricted
	 */
	VariantModel.prototype.getCurrentVariantReference = function() {
		return this.oData.currentVariant;
	};

	VariantModel.prototype.getVariantManagementReference = function(sVariantReference) {
		const iIndex = this.oData.variants.findIndex((oVariant) => {
			return oVariant.key === sVariantReference;
		});
		return {
			variantManagementReference: iIndex !== -1 ? this.sVMReference : "",
			variantIndex: iIndex
		};
	};

	VariantModel.prototype.getVariant = function(sVariantReference) {
		return getVariant(
			this.oData.variants,
			sVariantReference
		);
	};

	function ensureStandardVariantExists(oModel) {
		// If no variant management entry exists yet for this VM in the map, create
		// a fake standard variant so the control has something to display.
		const oVariantMapEntry = oModel.oDataSelector.get({
			reference: oModel.sFlexReference,
			variantManagementReference: oModel.sVMReference
		});
		if (!oVariantMapEntry?.variants?.length) {
			// Standard Variant should always contain the value: "SAP" in "author" / "Created by" field
			const oStandardVariantInstance = FlexObjectFactory.createFlVariant({
				id: oModel.sVMReference,
				variantManagementReference: oModel.sVMReference,
				variantName: oModel._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
				user: VariantUtil.DEFAULT_AUTHOR,
				layer: Layer.BASE,
				reference: oModel.sFlexReference
			});

			VariantManagementState.addRuntimeSteadyObject(
				oModel.sFlexReference, oModel.oAppComponent.getId(), oStandardVariantInstance, oModel.sVMReference
			);
			oModel._oFakeStandardVariant = oStandardVariantInstance;
		}
	}

	VariantModel.prototype.setModelPropertiesForControl = function(bDesignTimeModeToBeSet) {
		this.oData.showFavorites = true;

		// this._bDesignTime is undefined initially
		var bOriginalMode = this._bDesignTimeMode;
		if (bOriginalMode !== bDesignTimeModeToBeSet) {
			this._bDesignTimeMode = bDesignTimeModeToBeSet;

			if (bDesignTimeModeToBeSet && this._oURLHandler) {
				this._oURLHandler.clearAllVariantURLParameters();
			}
		}

		if (bDesignTimeModeToBeSet && this.oVMControl.getEditable()) {
			// Key user adaptation settings
			this.oData.variantsEditable = false;

			// Properties for variant management control's internal model
			this.oData.variants.forEach((oVariant) => {
				oVariant.rename = true;
				oVariant.change = true;
				oVariant.sharing = SharingMode.Public;
				oVariant.remove = isVariantValidForRemove(oVariant, this.sVMReference, bDesignTimeModeToBeSet);
			});
		} else if (this.oVMControl.getEditable()) { // Personalization settings
			this.oData.variantsEditable = true;

			// Properties for variant management control's internal model
			this.oData.variants.forEach((oVariant) => {
				oVariant.remove = isVariantValidForRemove(oVariant, this.sVMReference, bDesignTimeModeToBeSet);
				// Check for end-user variant
				switch (oVariant.layer) {
					case Layer.USER:
						oVariant.rename = true;
						oVariant.change = true;
						oVariant.sharing = SharingMode.Private;
						updatePersonalVariantPropertiesWithFlpSettings(oVariant);
						break;
					case Layer.PUBLIC:
						oVariant.sharing = SharingMode.Public;
						updatePublicVariantPropertiesWithSettings(oVariant);
						break;
					default:
						oVariant.rename = false;
						oVariant.change = false;
						oVariant.sharing = SharingMode.Public;
				}
			});
		} else {
			this.oData.variantsEditable = false;
			this.oData.variants.forEach((oVariant) => {
				oVariant.remove = false;
				oVariant.rename = false;
				oVariant.change = false;
			});
		}
	};

	VariantModel.prototype.getLocalId = function(sId, oAppComponent) {
		return JsControlTreeModifier.getSelector(sId, oAppComponent).id;
	};

	function resolveTitleBindingsAndCreateVariantChanges() {
		this.oData.variants.forEach((oVariant) => {
			// Find model and key from patterns like {i18n>TextKey} or {i18n>namespace.TextKey} - only resource models are supported
			const aMatches = oVariant.title && oVariant.title.match(/{(\w+)>(\w.+)}/);
			if (aMatches) {
				const [, sModelName, sKey] = aMatches;
				const oModel = this.oVMControl.getModel(sModelName);
				if (oModel) {
					const sResolvedTitle = oModel.getResourceBundle().getText(sKey);
					const mChangeProperties = {
						reference: this.sFlexReference,
						changeType: "setTitle",
						layer: oVariant.layer,
						fileType: "ctrl_variant_change",
						variantId: oVariant.key
					};
					const oSetTitleChange = FlexObjectFactory.createVariantChange(mChangeProperties);
					oSetTitleChange.setText("title", sResolvedTitle, "XFLD");
					oVariant.instance.setName(sResolvedTitle, true);
					VariantManagementState.addRuntimeSteadyObject(
						this.sFlexReference, this.oAppComponent.getId(), oSetTitleChange, this.sVMReference
					);
				} else {
					// Wait for model to be assigned and try again
					this.oVMControl.attachEventOnce(
						"modelContextChange",
						resolveTitleBindingsAndCreateVariantChanges.bind(this)
					);
				}
			}
		});
	}

	VariantModel.prototype.registerToModel = async function() {
		// only attachVariantApplied will set this to true
		this.oVMControl.setShowExecuteOnSelection(false);

		// replace bindings in titles with the resolved texts
		resolveTitleBindingsAndCreateVariantChanges.call(this);

		// set model's properties specific to control's appearance
		this.setModelPropertiesForControl(false);

		await this.initializeURLHandler();

		// Set up lazy loading callback for Manage Views dialog
		const oLoaderData = Loader.getCachedFlexData(this.sFlexReference);
		const aControlsWithRemovedVariants = oLoaderData.parameters?.nonFavoriteVariantsRemoved;
		if (
			aControlsWithRemovedVariants?.includes(this.sVMReference)
		) {
			const sComponentId = this.oAppComponent.getId();
			const sReference = this.sFlexReference;
			this.oVMControl.setDynamicVariantsLoadedCallback(() => {
				if (FlexState.getLazyVariantsLoaded(sReference).includes(this.sVMReference)) {
					return Promise.resolve();
				}
				return VariantManagerApply.loadAllVariantsForVM({
					reference: sReference,
					componentId: sComponentId,
					vmReference: this.sVMReference
				});
			});
		}

		// the initial changes are not applied via a variant switch
		// to enable early variant switches to work properly they need to wait for the initial changes
		// so the initial changes are set as a variant switch.
		// If the URL targets a variant that is not yet loaded, ensure it is loaded
		// before the initial changes are awaited.
		const mParameters = {
			appComponent: this.oAppComponent,
			reference: this.sFlexReference,
			vmReference: this.sVMReference
		};
		VariantManagementState.setVariantSwitchPromise(
			this.sFlexReference,
			this.sVMReference,
			resolveInitialVariantFromURL({
				reference: this.sFlexReference,
				componentId: this.oAppComponent.getId(),
				vmReference: this.sVMReference
			})
			.catch((oError) => {
				// A failed lazy-load should not skip the initial-changes wait;
				// getInitialCurrentVariant falls back to the default variant.
				Log.error("URL-targeted variant lazy-load failed", oError);
			})
			.then(() => waitForInitialVariantChanges(mParameters))
		);
	};

	/**
	 * When the variants map is reset at runtime, this listener is called.
	 * It clears the fake standard variants and destroys the model.
	 */
	VariantModel.prototype.destroy = function() {
		this._oURLHandler?.destroy();
		// Variant dependent control changes of the current variant were added to the
		// dependency map in the VariantModel constructor and need to be removed
		const oVMEntry = this.oDataSelector.get({
			reference: this.sFlexReference,
			variantManagementReference: this.sVMReference
		});
		// FlexState may already be cleared at this point (e.g. during component teardown)
		const aVariantDependentControlChanges = oVMEntry
			? VariantManagementState.getVariant({
				vmReference: this.sVMReference,
				vReference: oVMEntry.currentVariant,
				reference: this.sFlexReference
			})?.controlChanges || []
			: [];
		const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(this.sFlexReference);
		const aDirtyChanges = [];
		aVariantDependentControlChanges.forEach((oChange) => {
			// dirty changes should not be applied when the app is opened the next time
			if (!oChange.isPersisted()) {
				aDirtyChanges.push(oChange);
			} else {
				DependencyHandler.removeChangeFromMap(oLiveDependencyMap, oChange.getId());
				DependencyHandler.removeChangeFromDependencies(oLiveDependencyMap, oChange.getId());
			}
		});
		this.oDataSelector.removeUpdateListener(this.fnUpdateListener);

		// As soon as a real change/variant references our fake standard variant, this model can no longer be the
		// one re-creating it on the next reload: the fake's specific identity is now responsible, so we promote
		// it from runtime-steady to runtime-only persistence so the next VariantModel finds it already present,
		// mirroring the behavior of the InitialPrepareFunction.
		if (
			this._oFakeStandardVariant && oVMEntry
			&& (oVMEntry.variants.length > 1 || oVMEntry.variants[0].controlChanges.length)
		) {
			VariantManagementState.addRuntimeOnlyFlexObjects(
				this.sFlexReference, this.oAppComponent.getId(), [this._oFakeStandardVariant]
			);
		}

		VariantManagementState.clearRuntimeSteadyObjects(this.sFlexReference, this.oAppComponent.getId(), this.sVMReference);
		VariantManagementState.resetCurrentVariantReference(this.sFlexReference, this.sVMReference);
		JSONModel.prototype.destroy.apply(this);

		// this promise can be used in tests to properly wait for the asynchronous logic of the destroy function
		this.oDestroyPromise = new Deferred();
		if (aDirtyChanges.length) {
			sap.ui.require(["sap/ui/fl/write/_internal/flexState/FlexObjectManager"], (FlexObjectManager) => {
				FlexObjectManager.deleteFlexObjects({
					reference: this.sFlexReference,
					flexObjects: aDirtyChanges,
					componentId: this.oAppComponent.getId()
				});
				this.oDestroyPromise.resolve();
			});
		} else {
			this.oDestroyPromise.resolve();
		}
	};

	return VariantModel;
});