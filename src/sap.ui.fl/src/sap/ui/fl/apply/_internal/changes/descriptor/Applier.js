
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/changes/descriptor/RawApplier",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils"
], function(
	ApplyStrategyFactory,
	RawApplier,
	Utils,
	FlexObjectFactory,
	FlexState,
	ManifestUtils
) {
	"use strict";

	const Applier = {
		/**
		 * Applies all descriptor changes to raw manifest.
		 *
		 * @param {object} oUpdatedManifest - Raw manifest provided by sap.ui.core.Component
		 * @param {Array<sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange>} [aPassedAppDescriptorChanges] - Array of descriptor changes
		 * @param {object} [mStrategy] - Strategy for runtime or for buildtime merging
		 * @param {object} [mStrategy.registry] - Change handler registry
		 * @param {function} [mStrategy.handleError] - Error handling strategy
		 * @param {function} [mStrategy.processTexts] - Text postprocessing strategy
		 * @returns {Promise<object>} - Processed manifest with descriptor changes
		 */
		async applyChanges(oUpdatedManifest, aPassedAppDescriptorChanges, mStrategy) {
			const sReference = ManifestUtils.getFlexReference({
				manifest: oUpdatedManifest
			});
			const aAppDescriptorChanges = aPassedAppDescriptorChanges || FlexState.getAppDescriptorChanges(sReference);
			const oStrategy = mStrategy || ApplyStrategyFactory.getRuntimeStrategy();
			const aChangeHandlers = [];
			for (const oAppDescriptorChange of aAppDescriptorChanges) {
				aChangeHandlers.push(await Utils.getChangeHandler({
					flexObject: oAppDescriptorChange,
					strategy: oStrategy
				}));
			}
			return RawApplier.applyChanges(aChangeHandlers, oUpdatedManifest, aAppDescriptorChanges, oStrategy);
		},

		applyInlineChanges(oManifest, aAppDescriptorChangesRaw) {
			const aAppDescriptorChanges = aAppDescriptorChangesRaw.map(function(oChange) {
				return FlexObjectFactory.createAppDescriptorChange(oChange);
			});
			return Applier.applyChanges(oManifest, aAppDescriptorChanges);
		}
	};

	return Applier;
});