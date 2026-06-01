/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_difference",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/restricted/_omit",
	"sap/base/util/Deferred",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/m/library",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
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
	isEmptyObject,
	merge,
	mobileLibrary,
	JsControlTreeModifier,
	Lib,
	URLHandler,
	VariantUtil,
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

			// set variant model data
			this.fnUpdateListener = this.updateData.bind(this);
			this.oDataSelector = VariantManagementState.getVariantManagementMap();
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
		const oNewVariantsMap = this.oDataSelector.get({ reference: this.sFlexReference });
		const oCurrentData = { ...this.getData() };
		Object.entries(oNewVariantsMap).forEach((aVariants) => {
			const sVariantManagementKey = aVariants[0];
			const oVariantMapEntry = { ...aVariants[1] };
			if (sVariantManagementKey !== this.sVMReference) {
				return;
			}
			oCurrentData[sVariantManagementKey] ||= {};
			oCurrentData[sVariantManagementKey].variants = oVariantMapEntry.variants.map(function(oVariant) {
				const oCurrentVariantData = (oCurrentData[sVariantManagementKey].variants || [])
				.find(function(oVariantToCheck) {
					return oVariantToCheck.key === oVariant.key;
				}) || {};
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
			const sOldCurrentVariant = oCurrentData[sVariantManagementKey].currentVariant;
			if (
				this.oVMControl.getUpdateVariantInURL()
				&& sOldCurrentVariant
				&& sOldCurrentVariant !== oVariantMapEntry.currentVariant
			) {
				this._oURLHandler?.updateVariantInURL(oVariantMapEntry.currentVariant);
			}
			oCurrentData[sVariantManagementKey].currentVariant = oVariantMapEntry.currentVariant;
			oCurrentData[sVariantManagementKey].defaultVariant = oVariantMapEntry.defaultVariant;
			oCurrentData[sVariantManagementKey].modified = oVariantMapEntry.modified;
		});
		this.setData(oCurrentData);

		// Since the model has an one-way binding, some VariantItem properties that were overridden
		// via direct setter calls need to be updated explicitly
		this.refresh(true);
	};

	VariantModel.prototype.invalidateMap = function() {
		this.oDataSelector.checkUpdate({ reference: this.sFlexReference });
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
	 * Returns the current variant for a given variant management control.
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @returns {string} Current variant reference
	 * @private
	 * @ui5-restricted
	 */
	VariantModel.prototype.getCurrentVariantReference = function(sVariantManagementReference) {
		return this.oData[sVariantManagementReference].currentVariant;
	};

	VariantModel.prototype.getVariantManagementReference = function(sVariantReference) {
		var sVariantManagementReference = "";
		var iIndex = -1;
		Object.keys(this.oData).some(function(sKey) {
			return this.oData[sKey].variants.some(function(oVariant, index) {
				if (oVariant.key === sVariantReference) {
					sVariantManagementReference = sKey;
					iIndex = index;
					return true;
				}
				return false;
			});
		}.bind(this));
		return {
			variantManagementReference: sVariantManagementReference,
			variantIndex: iIndex
		};
	};

	VariantModel.prototype.getVariant = function(sVariantReference, sVariantManagementReference) {
		var sVMReference = sVariantManagementReference || this.getVariantManagementReference(sVariantReference).variantManagementReference;
		return getVariant(
			this.oData[sVMReference].variants,
			sVariantReference
		);
	};

	VariantModel.prototype._ensureStandardVariantExists = function(sVariantManagementReference) {
		var oData = this.getData();
		var oVMDataSection = oData[sVariantManagementReference] || {};
		if (!oData[sVariantManagementReference] || isEmptyObject(oVMDataSection)) { // Ensure standard variant exists
			// Standard Variant should always contain the value: "SAP" in "author" / "Created by" field
			var oStandardVariantInstance = FlexObjectFactory.createFlVariant({
				id: sVariantManagementReference,
				variantManagementReference: sVariantManagementReference,
				variantName: this._oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
				user: VariantUtil.DEFAULT_AUTHOR,
				layer: Layer.BASE,
				reference: this.sFlexReference
			});

			VariantManagementState.addRuntimeSteadyObject(
				this.sFlexReference, this.oAppComponent.getId(), oStandardVariantInstance, this.sVMReference
			);
			this._bCreatedStandardVariant = true;
		}
	};

	VariantModel.prototype.setModelPropertiesForControl = function(bDesignTimeModeToBeSet) {
		this.oData[this.sVMReference].showFavorites = true;

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
			this.oData[this.sVMReference].variantsEditable = false;

			// Properties for variant management control's internal model
			this.oData[this.sVMReference].variants.forEach((oVariant) => {
				oVariant.rename = true;
				oVariant.change = true;
				oVariant.sharing = SharingMode.Public;
				oVariant.remove = isVariantValidForRemove(oVariant, this.sVMReference, bDesignTimeModeToBeSet);
			});
		} else if (this.oVMControl.getEditable()) { // Personalization settings
			this.oData[this.sVMReference].variantsEditable = true;

			// Properties for variant management control's internal model
			this.oData[this.sVMReference].variants.forEach((oVariant) => {
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
			this.oData[this.sVMReference].variantsEditable = false;
			this.oData[this.sVMReference].variants.forEach(function(oVariant) {
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
		const oVMData = this.oData[this.sVMReference];
		oVMData.variants.forEach(function(oVariant) {
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
		}.bind(this));
	}

	VariantModel.prototype.registerToModel = async function() {
		this._ensureStandardVariantExists(this.sVMReference);

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
		// so the initial changes are set as a variant switch
		const mParameters = {
			appComponent: this.oAppComponent,
			reference: this.sFlexReference,
			vmReference: this.sVMReference
		};
		VariantManagementState.setVariantSwitchPromise(
			this.sFlexReference,
			this.sVMReference,
			waitForInitialVariantChanges(mParameters)
		);
	};

	/**
	 * Returns the current variant references for the model passed as context.
	 *
	 * @returns {array} Array of current variant references
	 */
	VariantModel.prototype.getCurrentControlVariantIds = function() {
		return Object.keys(this.oData || {})
		.reduce(function(aCurrentVariants, sVariantManagementReference) {
			return aCurrentVariants.concat([this.oData[sVariantManagementReference].currentVariant]);
		}.bind(this), []);
	};

	/**
	 * Returns the IDs of the variant management controls.
	 *
	 * @returns {string[]} All IDs of the variant management controls
	 */
	VariantModel.prototype.getVariantManagementControlIds = function() {
		var sVMControlId;
		return Object.keys(this.oData || {}).reduce(function(aVMControlIds, sVariantManagementReference) {
			if (this.oAppComponent.byId(sVariantManagementReference)) {
				sVMControlId = this.oAppComponent.createId(sVariantManagementReference);
			} else {
				sVMControlId = sVariantManagementReference;
			}
			aVMControlIds.push(sVMControlId);
			return aVMControlIds;
		}.bind(this), []);
	};

	/**
	 * When the variants map is reset at runtime, this listener is called.
	 * It clears the fake standard variants and destroys the model.
	 */
	VariantModel.prototype.destroy = function() {
		this._oURLHandler?.destroy();
		// Variant dependent control changes of the current variant were added to the
		// dependency map in the VariantModel constructor and need to be removed
		const oVariantsMap = this.oDataSelector.get({ reference: this.sFlexReference });
		const oVMEntry = oVariantsMap[this.sVMReference];
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

		// as soon as there is a change / variant referencing a standard variant, the model is not in charge of creating the standard
		// variant anymore and it needs to be available already at an earlier point in time. Therefore the standard variant needs to
		// be added to the runtime persistence, mirroring the behavior of the InitialPrepareFunction.
		if (
			this._bCreatedStandardVariant && oVMEntry
			&& (oVMEntry.variants.length > 1 || oVMEntry.variants[0].controlChanges.length)
		) {
			VariantManagementState.addRuntimeOnlyFlexObjects(
				this.sFlexReference, this.oAppComponent.getId(), [oVMEntry.variants[0].instance]
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