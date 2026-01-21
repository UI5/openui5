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
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexObjects/Variant",
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
	VariantManagementState,
	FlexObjectState,
	Variant,
	ManifestUtils,
	Settings,
	Layer,
	LayerUtils,
	Utils,
	JSONModel,
	BindingMode
) {
	"use strict";

	var _mUShellServices = {};
	const { SharingMode } = mobileLibrary;

	/**
	 * Saves the specified Unified Shell service on the model
	 *
	 * @param {string} sServiceName Name of the ushell service (e.g. "URLParsing")
	 * @param {sap.ui.core.service.Service} oService The service object
	 */
	function setUShellService(sServiceName, oService) {
		_mUShellServices[sServiceName] = oService;
	}

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

	function initUshellServices() {
		var oUShellContainer = Utils.getUshellContainer();
		if (oUShellContainer) {
			var aServicePromises = [
				Utils.getUShellService("UserInfo"),
				Utils.getUShellService("URLParsing"),
				Utils.getUShellService("Navigation"),
				Utils.getUShellService("ShellNavigationInternal")
			];
			return Promise.all(aServicePromises)
			.then(function(aServices) {
				setUShellService("UserInfo", aServices[0]);
				setUShellService("URLParsing", aServices[1]);
				setUShellService("Navigation", aServices[2]);
				setUShellService("ShellNavigationInternal", aServices[3]);
			})
			.catch(function(vError) {
				throw new Error(`Error getting service from Unified Shell: ${vError}`);
			});
		}
		return undefined;
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

			this.sharing = {
				PRIVATE: SharingMode.Private,
				PUBLIC: SharingMode.Public
			};

			this.sFlexReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.appComponent);
			this.oAppComponent = mPropertyBag.appComponent;
			this._oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");

			// set variant model data
			this.fnUpdateListener = this.updateData.bind(this);
			this.oDataSelector = VariantManagementState.getVariantManagementMap();
			this.oDataSelector.addUpdateListener(this.fnUpdateListener);
			// Initialize data
			this.updateData();

			const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(this.sFlexReference);
			VariantManagementState.getInitialUIChanges(
				{ reference: this.sFlexReference },
				this.oAppComponent.getId(),
				this.sFlexReference
			).forEach((oFlexObject) => {
				DependencyHandler.addChangeAndUpdateDependencies(oFlexObject, this.oAppComponent.getId(), oLiveDependencyMap);
			});

			this.setDefaultBindingMode(BindingMode.OneWay);
		}
	});

	VariantModel.prototype.updateData = function() {
		const oNewVariantsMap = this.oDataSelector.get({ reference: this.sFlexReference });
		const oCurrentData = { ...this.getData() };
		Object.entries(oNewVariantsMap).forEach((aVariants) => {
			const sVariantManagementKey = aVariants[0];
			const oVariantMapEntry = { ...aVariants[1] };
			oCurrentData[sVariantManagementKey] ||= {};
			oCurrentData[sVariantManagementKey].variants = oVariantMapEntry.variants.map(function(oVariant) {
				const oCurrentVariantData = (oCurrentData[sVariantManagementKey].variants || [])
				.find(function(oVariantToCheck) {
					return oVariantToCheck.key === oVariant.key;
				});
				return { ...(oCurrentVariantData || {}), ...oVariant };
			});
			const sOldCurrentVariant = oCurrentData[sVariantManagementKey].currentVariant;
			// Currently the VariantModel is still created independent of the existence of a VM control
			// It is likely that the control was created if sOldCurrentVariant is set but there are edge cases,
			// e.g. when creating the standard variant from a source variant directly in the FlexState
			// In such cases the switch was not triggered by a user though and thus must not be reflected in
			// the url, making it safe to ignore
			const oVMControl = VariantUtil.getVariantManagementControlByVMReference(sVariantManagementKey, this.oAppComponent);
			if (
				oVMControl
				&& oVMControl.getUpdateVariantInURL()
				&& sOldCurrentVariant
				&& sOldCurrentVariant !== oVariantMapEntry.currentVariant
			) {
				URLHandler.updateVariantInURL({
					vmReference: sVariantManagementKey,
					newVReference: oVariantMapEntry.currentVariant,
					model: this
				});
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

	/**
	 * Gets the necessary UShell Services and initializes the URL Handler
	 * @returns {Promise} Promise resolving when the VariantModel is initialized
	 */
	VariantModel.prototype.initialize = function() {
		return Promise.all([Settings.getInstance(), initUshellServices()])
		.then(function() {
			// initialize hash data - variants map & model should exist at this point (set on constructor)
			URLHandler.initialize({ model: this });
		}.bind(this));
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

	/**
	 * Sets the passed properties on a variant for the passed variant management reference and
	 * returns the content for change creation
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantReference - Variant reference for which properties should be set
	 * @param {string} mPropertyBag.changeType - Change type due to which properties are being set
	 * @param {string} mPropertyBag.layer - Current layer
	 * @param {string} mPropertyBag.appComponent - App component instance
	 * @param {string} [mPropertyBag.title] - New app title value for <code>setTitle</code> change type
	 * @param {boolean} [mPropertyBag.visible] - New visible value for <code>setVisible</code> change type
	 * @param {object} [mPropertyBag.contexts] - New contexts object (e.g. roles) for <code>setContexts</code> change type
	 * @param {boolean} [mPropertyBag.favorite] - New favorite value for <code>setFavorite</code> change type
	 * @param {boolean} [mPropertyBag.executeOnSelect] - New executeOnSelect value for <code>setExecuteOnSelect</code> change type
	 * @param {string} [mPropertyBag.defaultVariant] - New default variant for <code>setDefault</code> change type
	 * @returns {{title: string} | {favorite: boolean} | {executeOnSelect: boolean} | {visible: boolean, createdByReset: boolean} | {contexts: object} | {defaultVariant: string}} Additional content for change creation
	 * @private
	 * @ui5-restricted
	 */
	VariantModel.prototype.setVariantProperties = function(sVariantManagementReference, mPropertyBag) {
		// TODO: this function needs refactoring
		var oData = this.getData();
		var oVariantInstance = this.getVariant(mPropertyBag.variantReference, sVariantManagementReference).instance;
		const oVMControl = VariantUtil.getVariantManagementControlByVMReference(sVariantManagementReference, this.oAppComponent);

		var mAdditionalChangeContent = {};

		switch (mPropertyBag.changeType) {
			case "setTitle":
				oVariantInstance.setName(mPropertyBag.title, true);
				break;
			case "setFavorite":
				mAdditionalChangeContent.favorite = mPropertyBag.favorite;
				oVariantInstance.setFavorite(mPropertyBag.favorite);
				break;
			case "setExecuteOnSelect":
				mAdditionalChangeContent.executeOnSelect = mPropertyBag.executeOnSelect;
				oVariantInstance.setExecuteOnSelection(mPropertyBag.executeOnSelect);
				break;
			case "setVisible":
				mAdditionalChangeContent.visible = mPropertyBag.visible;
				// 'createdByReset' is used by the backend to distinguish between setVisible change created via reset and delete
				mAdditionalChangeContent.createdByReset = false;
				oVariantInstance.setVisible(mPropertyBag.visible);
				break;
			case "setContexts":
				mAdditionalChangeContent.contexts = mPropertyBag.contexts;
				oVariantInstance.setContexts(mPropertyBag.contexts);
				break;
			case "setDefault":
				mAdditionalChangeContent.defaultVariant = mPropertyBag.defaultVariant;
				// Update hash data
				var aHashParameters = URLHandler.getStoredHashParams({ model: this });
				if (aHashParameters && oVMControl.getUpdateVariantInURL()) {
					if (
						oData[sVariantManagementReference].defaultVariant !== oData[sVariantManagementReference].currentVariant
						&& aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant) === -1
					) {
						// if default variant is changed from the current variant, add the current variant id as a variant URI parameter
						URLHandler.update({
							parameters: aHashParameters.concat(oData[sVariantManagementReference].currentVariant),
							updateURL: !this._bDesignTimeMode,
							updateHashEntry: true,
							model: this
						});
					} else if (
						oData[sVariantManagementReference].defaultVariant === oData[sVariantManagementReference].currentVariant
						&& aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant) > -1
					) {
						// if current variant is now the default variant, then remove the current variant id as a variant URI parameter
						aHashParameters.splice(aHashParameters.indexOf(oData[sVariantManagementReference].currentVariant), 1);
						URLHandler.update({
							parameters: aHashParameters,
							updateURL: !this._bDesignTimeMode,
							updateHashEntry: true,
							model: this
						});
					}
				}

				break;
			default:
				break;
		}

		return mAdditionalChangeContent;
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

			VariantManagementState.addRuntimeSteadyObject(this.sFlexReference, this.oAppComponent.getId(), oStandardVariantInstance);
			// save all VariantManagement references for which a standard variant is created
			this._aCreatedStandardVariantsFor ||= [];
			this._aCreatedStandardVariantsFor.push(sVariantManagementReference);
		}
	};

	VariantModel.prototype.setModelPropertiesForControl = function(sVariantManagementReference, bDesignTimeModeToBeSet, oVMControl) {
		this.oData[sVariantManagementReference].showFavorites = true;

		// this._bDesignTime is undefined initially
		var bOriginalMode = this._bDesignTimeMode;
		if (bOriginalMode !== bDesignTimeModeToBeSet) {
			this._bDesignTimeMode = bDesignTimeModeToBeSet;

			if (bDesignTimeModeToBeSet) {
				URLHandler.clearAllVariantURLParameters({ model: this });
			} else if (bOriginalMode && oVMControl.getUpdateVariantInURL()) {
				// use case: switch from end user -> key user with a restart; the initial hash data is empty
				URLHandler.update({
					parameters: URLHandler.getStoredHashParams({ model: this }),
					updateURL: true,
					updateHashEntry: false,
					model: this
				});
			}
		}

		if (bDesignTimeModeToBeSet && oVMControl.getEditable()) {
			// Key user adaptation settings
			this.oData[sVariantManagementReference].variantsEditable = false;

			// Properties for variant management control's internal model
			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				oVariant.rename = true;
				oVariant.change = true;
				oVariant.sharing = this.sharing.PUBLIC;
				oVariant.remove = isVariantValidForRemove(oVariant, sVariantManagementReference, bDesignTimeModeToBeSet);
			}.bind(this));
		} else if (oVMControl.getEditable()) { // Personalization settings
			this.oData[sVariantManagementReference].variantsEditable = true;

			// Properties for variant management control's internal model
			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				oVariant.remove = isVariantValidForRemove(oVariant, sVariantManagementReference, bDesignTimeModeToBeSet);
				// Check for end-user variant
				switch (oVariant.layer) {
					case Layer.USER:
						oVariant.rename = true;
						oVariant.change = true;
						oVariant.sharing = this.sharing.PRIVATE;
						updatePersonalVariantPropertiesWithFlpSettings(oVariant);
						break;
					case Layer.PUBLIC:
						oVariant.sharing = this.sharing.PUBLIC;
						updatePublicVariantPropertiesWithSettings(oVariant);
						break;
					default:
						oVariant.rename = false;
						oVariant.change = false;
						oVariant.sharing = this.sharing.PUBLIC;
				}
			}.bind(this));
		} else {
			this.oData[sVariantManagementReference].variantsEditable = false;
			this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
				oVariant.remove = false;
				oVariant.rename = false;
				oVariant.change = false;
			});
		}
	};

	VariantModel.prototype.getLocalId = function(sId, oAppComponent) {
		return JsControlTreeModifier.getSelector(sId, oAppComponent).id;
	};

	function resolveTitleBindingsAndCreateVariantChanges(oVariantManagementControl, sVariantManagementReference) {
		this.oData[sVariantManagementReference].variants.forEach(function(oVariant) {
			// Find model and key from patterns like {i18n>TextKey} or {i18n>namespace.TextKey} - only resource models are supported
			const aMatches = oVariant.title && oVariant.title.match(/{(\w+)>(\w.+)}/);
			if (aMatches) {
				const [, sModelName, sKey] = aMatches;
				const oModel = oVariantManagementControl.getModel(sModelName);
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
					// The change cannot be added as a dirty change but must survive a state invalidation
					VariantManagementState.addRuntimeSteadyObject(this.sFlexReference, this.oAppComponent.getId(), oSetTitleChange);
				} else {
					// Wait for model to be assigned and try again
					oVariantManagementControl.attachEventOnce(
						"modelContextChange",
						resolveTitleBindingsAndCreateVariantChanges.bind(this, oVariantManagementControl, sVariantManagementReference)
					);
				}
			}
		}.bind(this));
	}

	VariantModel.prototype.registerToModel = function(oVariantManagementControl) {
		const sVariantManagementReference = oVariantManagementControl.getVariantManagementReference();

		// ensure standard variants are mocked, if no variants are present in the changes.variantSection response from the backend
		this._ensureStandardVariantExists(sVariantManagementReference);

		// only attachVariantApplied will set this to true
		oVariantManagementControl.setShowExecuteOnSelection(false);

		// replace bindings in titles with the resolved texts
		resolveTitleBindingsAndCreateVariantChanges.call(this, oVariantManagementControl, sVariantManagementReference);

		// set model's properties specific to control's appearance
		this.setModelPropertiesForControl(sVariantManagementReference, false, oVariantManagementControl);

		if (oVariantManagementControl.getUpdateVariantInURL()) {
			URLHandler.registerControl({
				vmReference: sVariantManagementReference,
				updateURL: true,
				model: this
			});
			URLHandler.handleModelContextChange({
				model: this,
				vmControl: oVariantManagementControl,
				appComponent: this.oAppComponent
			});
		}

		// the initial changes are not applied via a variant switch
		// to enable early variant switches to work properly they need to wait for the initial changes
		// so the initial changes are set as a variant switch
		const mParameters = {
			appComponent: this.oAppComponent,
			reference: this.sFlexReference,
			vmReference: sVariantManagementReference
		};
		VariantManagementState.setVariantSwitchPromise(
			this.sFlexReference,
			sVariantManagementReference,
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
		// Variant dependent control changes of the current variant were added to the
		// dependency map in the VariantModel constructor and need to be removed
		const oVariantsMap = this.oDataSelector.get({ reference: this.sFlexReference });
		const aVariantDependentControlChanges = Object.entries(oVariantsMap)
		.map(([sVMReference, oVM]) => {
			const mCurrentVariant = VariantManagementState.getVariant({
				vmReference: sVMReference,
				vReference: oVM.currentVariant,
				reference: this.sFlexReference
			});
			return mCurrentVariant.controlChanges;
		})
		.flat();
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
		const aFakeVariantsToBeAdded = [];
		(this._aCreatedStandardVariantsFor || []).forEach((sVariantManagementReference) => {
			if (
				oVariantsMap[sVariantManagementReference]?.variants.length > 1
				|| oVariantsMap[sVariantManagementReference]?.variants[0].controlChanges.length
			) {
				aFakeVariantsToBeAdded.push(oVariantsMap[sVariantManagementReference].variants[0].instance);
			}
		});
		if (aFakeVariantsToBeAdded.length) {
			VariantManagementState.addRuntimeOnlyFlexObjects(this.sFlexReference, this.oAppComponent.getId(), aFakeVariantsToBeAdded);
		}

		VariantManagementState.clearRuntimeSteadyObjects(this.sFlexReference, this.oAppComponent.getId());
		VariantManagementState.resetCurrentVariantReference(this.sFlexReference);
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

	/**
	 * Returns the Unified Shell service saved on the model, if available
	 *
	 * @param {string} sServiceName Name of the ushell service (e.g. "UserInfo")
	 * @returns {sap.ui.core.service.Service} The service object
	 */
	VariantModel.prototype.getUShellService = function(sServiceName) {
		return Utils.getUshellContainer() && _mUShellServices[sServiceName];
	};

	return VariantModel;
});