/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/changeHandler/ChangeAnnotation"
], function(
	ChangeHandlerRegistration,
	ChangeAnnotation
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
});