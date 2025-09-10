/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/changeHandler/ChangeAnnotation",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration"
], function(
	DelegateMediator,
	ChangeAnnotation,
	ChangeHandlerRegistration
) {
	"use strict";

	/**
	 * Initialization of the apply bundle - takes care of registering change handlers
 	 * This module must be loaded by every publicly used module of the apply bundle.
	 *
	 * @name sap.ui.fl.apply._internal.init
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.141.0
	 * @private
	 */
	ChangeHandlerRegistration.registerPredefinedChangeHandlers();
	ChangeHandlerRegistration.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();
	ChangeHandlerRegistration.registerAnnotationChangeHandler({
		changeHandler: ChangeAnnotation,
		isDefaultChangeHandler: true
	});

	DelegateMediator.registerReadDelegate({
		modelType: "sap.ui.model.odata.v4.ODataModel",
		delegate: "sap/ui/fl/write/_internal/delegates/ODataV4ReadDelegate"
	});
	DelegateMediator.registerReadDelegate({
		modelType: "sap.ui.model.odata.v2.ODataModel",
		delegate: "sap/ui/fl/write/_internal/delegates/ODataV2ReadDelegate"
	});
	DelegateMediator.registerReadDelegate({
		modelType: "sap.ui.model.odata.ODataModel",
		delegate: "sap/ui/fl/write/_internal/delegates/ODataV2ReadDelegate"
	});
});