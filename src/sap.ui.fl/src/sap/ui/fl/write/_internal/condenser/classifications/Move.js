/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/condenser/Utils"
], function(
	CondenserUtils
) {
	"use strict";

	return {
		/**
		 * Adds a move change to the UI Reconstruction Map by moving the element to the source location.
		 *
		 * @param {Map} mUIReconstructions - Map of UI reconstructions
		 * @param {object} oCondenserInfo - Condenser specific information
		 * @returns {Promise} resolves when a create change is added to UI Reconstruction Map
		 */
		async addToReconstructionMap(mUIReconstructions, oCondenserInfo) {
			const [aSourceContainerElementIds, aTargetContainerElementIds] = await Promise.all([
				CondenserUtils.getContainerElementIds(
					oCondenserInfo.sourceContainer, oCondenserInfo.sourceAggregation,
					oCondenserInfo.customAggregation, oCondenserInfo.affectedControlIdProperty
				),
				CondenserUtils.getContainerElementIds(
					oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation,
					oCondenserInfo.customAggregation, oCondenserInfo.affectedControlIdProperty
				)
			]);

			let aContainerElementIds;
			let iTargetIndex;
			if (
				oCondenserInfo.targetContainer === oCondenserInfo.sourceContainer
				&& oCondenserInfo.targetAggregation === oCondenserInfo.sourceAggregation
			) {
				aContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(
					mUIReconstructions, oCondenserInfo.targetContainer,
					oCondenserInfo.targetAggregation, aTargetContainerElementIds
				);
				iTargetIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);
				CondenserUtils.shiftElement(aContainerElementIds, iTargetIndex, oCondenserInfo.sourceIndex);
			} else {
				// This function assigns the returning array to mUIReconstructions - so modifying the array modifies the map content
				const aTargetInitialContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(
					mUIReconstructions, oCondenserInfo.targetContainer,
					oCondenserInfo.targetAggregation, aTargetContainerElementIds
				);
				iTargetIndex = aTargetInitialContainerElementIds.indexOf(oCondenserInfo.affectedControl);
				aTargetInitialContainerElementIds.splice(iTargetIndex, 1);
				const aSourceInitialContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(
					mUIReconstructions, oCondenserInfo.sourceContainer,
					oCondenserInfo.sourceAggregation, aSourceContainerElementIds
				);
				aSourceInitialContainerElementIds.splice(oCondenserInfo.sourceIndex, 0, oCondenserInfo.affectedControl);
			}
		},

		/**
		 * Simulates the move change by moving the element to the target location.
		 *
		 * @param {string[]} aContainerElements - Array with the Ids of the current elements in the container
		 * @param {object} oCondenserInfo - Condenser specific information
		 * @param {string[]} aInitialUIElementIds - Array with the Ids of the initial elements in the container
		 * @param {string} sContainerKey - Container being simulated
		 */
		simulate(aContainerElements, oCondenserInfo, aInitialUIElementIds, sContainerKey) {
			const sAffectedControlId = oCondenserInfo.affectedControl;
			const bMoveWithinSameContainer = sContainerKey === oCondenserInfo.targetContainer;
			const iInitialSourceIndex = aInitialUIElementIds.indexOf(sAffectedControlId);
			// the move itself should not extend the array, just replace the placeholder
			CondenserUtils.extendElementsArray(aContainerElements, iInitialSourceIndex, undefined, sAffectedControlId);

			const iCurrentSourceIndex = aContainerElements.indexOf(sAffectedControlId);
			const iTargetIndex = oCondenserInfo.getTargetIndex(oCondenserInfo.change);

			// if the move was done from a different container the element can't be found
			if (iInitialSourceIndex === -1) {
				aContainerElements.splice(iTargetIndex, 0, sAffectedControlId);
			} else {
				const sRemovedElement = aContainerElements.splice(iCurrentSourceIndex, 1)[0];
				if (bMoveWithinSameContainer) {
					aContainerElements.splice(iTargetIndex, 0, sRemovedElement);
				}
			}

			// changes with the same current source and target index in the same container can be deleted, if the simulation is successful
			oCondenserInfo.sameIndex = bMoveWithinSameContainer && (iCurrentSourceIndex === iTargetIndex);

			// to enable a revert in the same session the previous index must be saved during the simulation
			oCondenserInfo.revertIndex = iCurrentSourceIndex;
		}
	};
});