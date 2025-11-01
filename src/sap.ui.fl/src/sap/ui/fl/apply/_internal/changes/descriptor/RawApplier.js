/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/isEmptyObject"
], function(
	isEmptyObject
) {
	"use strict";

	const RawApplier = {
		/**
		 * Applies all app descriptor changes to the provided raw manifest without validating the input parameters.
		 * Assumes that the change handlers and changes are already available and correct. Intended to be used
		 * internally but also inside adaptation builder avoiding unnecessary module dependencies.
		 *
		 * @param {Array<object>} aChangeHandlers - Array of change handler objects, each responsible for applying a change
		 * @param {object} oUpdatedManifest - The raw manifest object to which changes will be applied
		 * @param {Array<sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange>} aAppDescriptorChanges - Array of app descriptor change objects to apply
		 * @param {object} oStrategy - Strategy object containing helper functions for error handling and text processing
		 * @param {function} oStrategy.handleError - Function to handle errors during change application
		 * @param {function} oStrategy.processTexts - Function to process and merge texts after applying a change
		 * @returns {object} The manifest object after all changes have been applied
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl UI5-Adaptation-builder
		 */
		applyChanges(aChangeHandlers, oUpdatedManifest, aAppDescriptorChanges, oStrategy) {
			aChangeHandlers.forEach(function(oChangeHandler, iIndex) {
				try {
					const oChange = aAppDescriptorChanges[iIndex];
					oUpdatedManifest = oChangeHandler.applyChange(oUpdatedManifest, oChange);
					if (!oChangeHandler.skipPostprocessing && !isEmptyObject(oChange.getTexts())) {
						oUpdatedManifest = oStrategy.processTexts(oUpdatedManifest, oChange.getTexts());
					}
				} catch (oError) {
					oStrategy.handleError(oError);
				}
			});
			return oUpdatedManifest;
		}
	};

	return RawApplier;
});