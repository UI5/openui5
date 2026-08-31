/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Layer",
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataUtils"
], function(
	Log,
	Component,
	Lib,
	ControlVariantApplyAPI,
	Loader,
	ManifestUtils,
	StorageUtils,
	VariantModel,
	Layer,
	requireAsync,
	Utils,
	JSONModel,
	ODataUtils
) {
	"use strict";

	/**
	 * @namespace sap.ui.fl.initial._internal.preprocessors.ComponentLifecycleHooks
	 * @since 1.114
	 * @author SAP SE
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	const ComponentLifecycleHooks = {};

	// in this object a promise is stored for every application component instance
	// if the same instance is initialized twice the promise is replaced
	ComponentLifecycleHooks._componentInstantiationPromises = new WeakMap();
	ComponentLifecycleHooks._embeddedComponents = {};

	// only initialize FlexState if there are any changes or if the data was previously filled,
	// meaning it potentially needs to be cleaned up (e.g. when discarding a draft that contained all existing changes).
	function isInitializeRelevant(oFlexData) {
		// TODO: Rework logic so that previouslyFilledData is not needed anymore, todos#15
		return StorageUtils.isStorageResponseFilled(oFlexData.data.changes) || oFlexData.parameters.previouslyFilledData;
	}

	async function checkForChangesAndInitializeFlexState(oConfig, oFlexData) {
		if (isInitializeRelevant(oFlexData)) {
			const FlexState = await requireAsync("sap/ui/fl/apply/_internal/flexState/FlexState");
			await FlexState.initialize(oConfig);
		}
	}

	/**
	 * The fl library must ensure a proper rta startup by a lazy loading of the rta library and starting RTA accordingly.
	 * This is needed in the stand alone scenario; ATTENTION: if also the ushell-plugin of rta runs, the first one will
	 * actually trigger the reload and clear the flag for the second.
	 *
	 * @param {object} oComponent - Application component about to be started
	 * @returns {Promise<undefined>} Resolves with undefined
	 */
	async function checkForRtaStartOnDraftAndReturnResult(oComponent) {
		// if the FLP is available the restart behavior is handled there
		if (Utils.getUshellContainer()) {
			return;
		}

		const sRestartingComponent = window.sessionStorage.getItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`);
		if (sRestartingComponent) {
			const sComponentId = ManifestUtils.getFlexReferenceForControl(oComponent);
			if (sRestartingComponent !== sComponentId && sRestartingComponent !== "true") {
				Log.error(`an application component was started which does not match the component for which the restart was triggered:
					Triggering component: ${sRestartingComponent}
					Started component: ${sComponentId}`
				);

				return;
			}
			await Promise.all([
				Lib.load({ name: "sap.ui.rta" }),
				oComponent.rootControlLoaded()
			]);
			const startKeyUserAdaptation = await requireAsync("sap/ui/rta/api/startKeyUserAdaptation");
			startKeyUserAdaptation({
				rootControl: oComponent
			});
		}
	}

	/**
	 * Binds a json model to the component if a vendor change is loaded. This will enable the translation for those changes.
	 * Used on the NEO stack
	 * @param {sap.ui.core.Component} oAppComponent - Component instance
	 * @param {object} oFlexData - Flex Data containing the changes and the messagebundle
	 */
	function createVendorTranslationModelIfNecessary(oAppComponent, oFlexData) {
		if (
			oFlexData.messagebundle
			&& !oAppComponent.getModel("i18nFlexVendor")
			&& oFlexData?.changes?.some((oChange) => {
				return oChange.layer === Layer.VENDOR;
			})
		) {
			oAppComponent.setModel(new JSONModel(oFlexData.messagebundle), "i18nFlexVendor");
		}
	}

	async function propagateChangesForAppComponent(oAppComponent, sReference) {
		const Applier = await requireAsync("sap/ui/fl/apply/_internal/changes/Applier");
		const fnPropagationListener = Applier.applyAllChangesForControl.bind(
			Applier,
			oAppComponent,
			sReference
		);
		fnPropagationListener._bIsFlexApplyChangesFunction = true;
		oAppComponent.addPropagationListener(fnPropagationListener);
	}

	async function handleAppComponentInstanceCreated(oComponent, vConfig) {
		const sReference = ManifestUtils.getFlexReferenceForControl(oComponent);
		const oFlexData = await Loader.getFlexData({
			componentData: oComponent.getComponentData(),
			asyncHints: vConfig.asyncHints,
			manifest: oComponent.getManifestObject(),
			reference: sReference
		});
		const sComponentId = oComponent.getId();
		if (isInitializeRelevant(oFlexData)) {
			const FlexState = await requireAsync("sap/ui/fl/apply/_internal/flexState/FlexState");
			await FlexState.initialize({
				componentId: sComponentId,
				asyncHints: vConfig.asyncHints
			});
			await propagateChangesForAppComponent(oComponent, sReference);
			createVendorTranslationModelIfNecessary(oComponent, oFlexData.data.changes);
		}

		const oVariantModel = ComponentLifecycleHooks._createVariantModel(oComponent);
		await oVariantModel.initialize();
		oComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());

		if (ComponentLifecycleHooks._embeddedComponents[sComponentId]) {
			ComponentLifecycleHooks._embeddedComponents[sComponentId].forEach(function(oEmbeddedComponent) {
				const oVariantModel = oComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
				oEmbeddedComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
			});
			delete ComponentLifecycleHooks._embeddedComponents[sComponentId];
		}
		// if there are only changes in the draft, RTA restart is relevant even without changes in the current storage response
		await checkForRtaStartOnDraftAndReturnResult(oComponent);

		// initialize the Support Message Client (Message Broker Communication) only in debug mode
		// used window["sap-ui-debug"] because sap.ui.core.Supportability.isDebugModeEnabled() does not recognize the debug mode
		// if it is activated only for some libraries
		if (window["sap-ui-debug"]) {
			const SupportAPI = await requireAsync("sap/ui/fl/support/api/SupportAPI");
			try {
				await SupportAPI.initializeMessageBrokerForComponent();
			} catch (oError) {
				Log.warning("Message Broker could not be initialized", oError);
			}
		}
	}

	// the current sinon version used in UI5 does not support stubbing the constructor
	ComponentLifecycleHooks._createVariantModel = function(oAppComponent) {
		return new VariantModel({}, {
			appComponent: oAppComponent
		});
	};

	/**
	 * Gets the changes and in case of existing changes, prepare the applyChanges function already with the changes.
	 *
	 * @param {object} oComponent - Component instance that is currently loading
	 * @param {object} vConfig - Configuration of loaded component
	 * @returns {Promise} Resolves when all relevant tasks for changes propagation have been processed
	 */
	ComponentLifecycleHooks.instanceCreatedHook = async function(oComponent, vConfig) {
		if (Utils.isApplicationComponent(oComponent)) {
			const oReturnPromise = await handleAppComponentInstanceCreated(oComponent, vConfig);
			ComponentLifecycleHooks._componentInstantiationPromises.set(oComponent, oReturnPromise);
			return oReturnPromise;
		} else if (Utils.isEmbeddedComponent(oComponent)) {
			const oAppComponent = Utils.getAppComponentForControl(oComponent);
			// once the VModel is set to the outer component it also has to be set to any embedded component
			if (ComponentLifecycleHooks._componentInstantiationPromises.has(oAppComponent)) {
				await ComponentLifecycleHooks._componentInstantiationPromises.get(oAppComponent);
				const oVariantModel = oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
				oComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
			}
			ComponentLifecycleHooks._embeddedComponents[oAppComponent.getId()] ||= [];
			ComponentLifecycleHooks._embeddedComponents[oAppComponent.getId()].push(oComponent);
		}
		return undefined;
	};

	/**
	 * Callback which is called within the early state of Component processing.
	 * Already triggers the loading of the flexibility changes if the loaded manifest is an application variant.
	 * The processing is only done for components of the type "application"
	 *
	 * @param {object} oConfig - Copy of the configuration of loaded component
	 * @param {object} oConfig.asyncHints - Async hints passed from the app index to the core Component processing
	 * @param {object} oManifest - Copy of the manifest of loaded component
	 * @returns {Promise} Resolves after all Manifest changes are applied
	 */
	ComponentLifecycleHooks.componentLoadedHook = async function(oConfig, oManifest) {
		// stop processing if the component is not of the type application or component ID is missing
		if (Utils.isApplication(oManifest) && oConfig.id) {
			const mPropertyBag = {
				manifest: oManifest,
				componentData: oConfig.componentData || (oConfig.settings?.componentData),
				asyncHints: oConfig.asyncHints
			};
			const oFlexData = await Loader.getFlexData(mPropertyBag);

			await checkForChangesAndInitializeFlexState(
				{
					...mPropertyBag,
					componentId: oConfig.id
				},
				oFlexData
			);

			// manifest descriptor changes for ABAP mixed mode can only be applied in this hook,
			// because at this point all libs have been loaded (in contrast to the first Component(s) 'onPreprocessManifest' hook),
			// but the manifest is still adaptable
			const sChangesNamespace = "$sap.ui.fl.changes";
			const aAppDescriptorChangesRaw = oManifest?.getEntry?.(sChangesNamespace)?.descriptor || [];
			if (aAppDescriptorChangesRaw.length) {
				const oManifestJSON = oManifest.getJson();
				const DescriptorApplier = await requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/Applier");
				await DescriptorApplier.applyInlineChanges(oManifestJSON, aAppDescriptorChangesRaw);
				delete oManifestJSON[sChangesNamespace];
			}
		}
	};

	async function fetchModelChanges(oPropertyBag) {
		// the functionality still works without component Id, but the FlexState will be initialized again
		// once the component Id is set. This will happen in the instanceCreated hook.
		// This can only be improved once the generated component instance Id is available in the factory config
		if (!oPropertyBag.factoryConfig) {
			Log.error("Could not fetch Annotation changes. This can be caused by creating a component in an unsupported way");
			return [];
		}

		// all components can have an owner component, no matter if they are a re-use component or an application (e.g. in MyInbox)
		// the owner component is only relevant if the created component is not of type 'application'
		// in case of re-use components the owner property must be set for further processing
		const oOwnerComponent = oPropertyBag.owner && Component.get(oPropertyBag.owner.id);
		const bUseOwnerComponent = !Utils.isApplication(oPropertyBag.manifest);
		if (bUseOwnerComponent && !oOwnerComponent) {
			return [];
		}

		const oManifest = bUseOwnerComponent ? oOwnerComponent.getManifest() : oPropertyBag.manifest;
		if (!Utils.isApplication(oManifest)) {
			return [];
		}

		const sAppComponentId = bUseOwnerComponent ?
			oPropertyBag.owner.id :
			oPropertyBag.factoryConfig.id || oPropertyBag.factoryConfig.settings?.id;
		const oComponentData = bUseOwnerComponent ?
			oOwnerComponent.getComponentData() :
			oPropertyBag.factoryConfig.componentData || oPropertyBag.factoryConfig.settings?.componentData;
		const sReference = ManifestUtils.getFlexReference({
			manifest: oManifest,
			componentData: oComponentData
		});

		try {
			// skipLoadBundle has to be true as there is no guarantee that the flex bundle is already available at this point
			const mProperties = {
				componentData: oComponentData,
				asyncHints: bUseOwnerComponent ? oPropertyBag.owner.config.asyncHints : oPropertyBag.factoryConfig.asyncHints,
				componentId: sAppComponentId,
				reference: sReference,
				skipLoadBundle: true,
				manifest: oManifest
			};
			const oFlexData = await Loader.getFlexData(mProperties);

			if (!isInitializeRelevant(oFlexData)) {
				return [];
			}

			const FlexState = await requireAsync("sap/ui/fl/apply/_internal/flexState/FlexState");
			await FlexState.initialize(mProperties);

			const sServiceUrl = ODataUtils.removeOriginSegmentParameters(oPropertyBag.model.getServiceUrl());
			const aRelevantAnnotationChanges = FlexState.getAnnotationChanges(sReference)
			.filter((oAnnotationChange) => oAnnotationChange.getServiceUrl() === sServiceUrl);

			return aRelevantAnnotationChanges.reduce(async (oPreviousPromise, oAnnotationChange) => {
				const aReturn = await oPreviousPromise;
				try {
					const ChangeHandlerRegistration = await requireAsync("sap/ui/fl/apply/_internal/changeHandlers/ChangeHandlerRegistration");
					const oChangeHandler = await ChangeHandlerRegistration.getAnnotationChangeHandler({
						changeType: oAnnotationChange.getChangeType()
					});
					aReturn.push(await oChangeHandler.applyChange(oAnnotationChange));
					oAnnotationChange._appliedOnModel = true;
				} catch (oError) {
					// Continue with next change
					Log.error(`Annotation change with id ${oAnnotationChange.getId()} could not be applied to the model`, oError);
				}
				return aReturn;
			}, Promise.resolve([]));
		} catch (oError) {
			Log.error("Annotation changes could not be applied.", oError);
			return [];
		}
	}

	/**
	 * Sets a promise at the model instance which resolves with the necessary information for the model to change annotations.
	 *
	 * @param {object} oPropertyBag - Property bag
	 * @param {object} oPropertyBag.model - Model instance
	 * @param {string} oPropertyBag.modelId - Id of the model instance
	 * @param {object} oPropertyBag.factoryConfig - Configuration of loaded component
	 * @param {object} oPropertyBag.manifest - Manifest of the owner component
	 * @param {object} [oPropertyBag.owner] - Only passed if the model is part of an embedded component
	 * @param {string} [oPropertyBag.owner.id] - Id of the owner component
	 * @param {object} [oPropertyBag.owner.config] - Configuration of the owner component
	 */
	ComponentLifecycleHooks.modelCreatedHook = function(oPropertyBag) {
		oPropertyBag.model.setAnnotationChangePromise(fetchModelChanges(oPropertyBag));
	};

	/**
	 * Preprocesses the manifest by applying descriptor changes.
	 * The processing is only done for components of the type "application".
	 *
	 * @param {object} oManifest - Raw manifest provided by core Component
	 * @param {object} oConfig - Copy of the configuration of loaded component
	 * @param {object} oConfig.id - Id of the loaded component
	 * @param {object} oConfig.asyncHints - Async hints passed from the app index to the core Component processing
	 * @param {object} [oConfig.componentData] - Component Data from the Component processing
	 * @param {object} [oConfig.settings] - Object containing the componentData
	 * @returns {Promise<object>} - Resolves with the processed manifest
	 */
	ComponentLifecycleHooks.preprocessManifest = async function(oManifest, oConfig) {
		// stop processing if the component is not of the type application or component ID is missing
		if (!Utils.isApplication(oManifest, true) || !oConfig.id) {
			return oManifest;
		}

		const oComponentData = oConfig.componentData || {};
		const sReference = ManifestUtils.getFlexReference({
			manifest: oManifest,
			componentData: oComponentData
		});

		// skipLoadBundle has to be true as there is no guarantee that the flex bundle is already available at this point
		const oFlexData = await Loader.getFlexData({
			componentData: oConfig.componentData || oConfig.settings?.componentData,
			asyncHints: oConfig.asyncHints,
			manifest: oManifest,
			skipLoadBundle: true
		});

		if (isInitializeRelevant(oFlexData)) {
			await checkForChangesAndInitializeFlexState({
				...oConfig,
				manifest: oManifest,
				componentId: oConfig.id,
				reference: sReference,
				skipLoadBundle: true
			}, oFlexData);
			const oManifestCopy = { ...oManifest };
			const Applier = await requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/Applier");
			return Applier.applyChanges(oManifestCopy);
		}

		return oManifest;
	};

	return ComponentLifecycleHooks;
});