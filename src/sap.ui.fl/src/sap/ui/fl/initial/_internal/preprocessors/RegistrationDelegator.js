/*!
 * ${copyright}
 */

// Provides object sap.ui.fl.apply._internal.preprocessors.RegistrationDelegator
sap.ui.define([
	"sap/ui/core/mvc/ControllerExtensionProvider",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentHooks",
	"sap/ui/core/ExtensionPoint",
	"sap/ui/fl/apply/_internal/preprocessors/ComponentLifecycleHooks",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/base/DesignTime",
	// the lower 2 are set as a callback in the "register...Processors" which are not detected as dependencies from the preload-building
	"sap/ui/fl/initial/_internal/preprocessors/ControllerExtension",
	"sap/ui/fl/initial/_internal/preprocessors/XmlPreprocessor"
], function(
	MvcControllerExtensionProvider,
	XMLView,
	ComponentHooks,
	ExtensionPoint,
	ComponentLifecycleHooks,
	ManifestUtils,
	DesignTime
) {
	"use strict";

	/**
	 * This module registers everything needed for the app to start,
	 * without flex changes being involved yet.
	 *
	 * @name sap.ui.fl.apply._internal.preprocessors.RegistrationDelegator
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.43.0
	 * @private
	 */
	var RegistrationDelegator = {};
	function registerChangesInComponent() {
		ComponentHooks.onInstanceCreated.register(ComponentLifecycleHooks.instanceCreatedHook);
	}

	function registerOnModelCreated() {
		ComponentHooks.onModelCreated.register(ComponentLifecycleHooks.modelCreatedHook);
	}

	function registerLoadComponentEventHandler() {
		ComponentHooks.onComponentLoaded.register(ComponentLifecycleHooks.componentLoadedHook);
	}

	function registerExtensionProvider() {
		MvcControllerExtensionProvider.registerExtensionProvider("sap/ui/fl/initial/_internal/preprocessors/ControllerExtension");
	}

	function registerXMLPreprocessor() {
		if (XMLView.registerPreprocessor) {
			XMLView.registerPreprocessor("viewxml", "sap.ui.fl.initial._internal.preprocessors.XmlPreprocessor");
		}
	}

	function registerDescriptorChangeHandler() {
		ComponentHooks.onPreprocessManifest.register(ComponentLifecycleHooks.preprocessManifest);
	}

	function getExtensionPointProvider(oView) {
		if (ManifestUtils.isFlexExtensionPointHandlingEnabled(oView)) {
			return "sap/ui/fl/apply/_internal/extensionPoint/Processor";
		}
		if (DesignTime.isDesignModeEnabled()) {
			return "sap/ui/fl/write/_internal/extensionPoint/Processor";
		}
		return undefined;
	}

	function registerExtensionPointProvider() {
		ExtensionPoint.registerExtensionProvider(getExtensionPointProvider);
	}

	/**
	 * Registers everything in one call
	 *
	 * @public
	 */
	RegistrationDelegator.registerAll = function() {
		registerLoadComponentEventHandler();
		registerExtensionProvider();
		registerChangesInComponent();
		registerXMLPreprocessor();
		registerDescriptorChangeHandler();
		registerExtensionPointProvider();
		registerOnModelCreated();
	};

	return RegistrationDelegator;
});
