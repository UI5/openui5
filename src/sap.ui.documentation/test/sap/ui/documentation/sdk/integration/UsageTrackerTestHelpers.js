sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	/**
	 * Returns a waitFor config that navigates to the given hash via HashChanger.
	 * Works in the embedded-component scenario without triggering a full page reload.
	 */
	function iNavigateTo(sHash) {
		return {
			success: function () {
				Opa5.getHashChanger().setHash(sHash);
			},
			errorMessage: "Could not navigate to #" + sHash
		};
	}

	/**
	 * Returns a waitFor config that resolves once window.adobeDataLayer has exactly
	 * `iExpectedLength` entries AND the last entry's event matches `sLastEvent`.
	 * Avoids fixed timeouts — retries every OPA poll cycle until the array stabilises.
	 *
	 * @param {int}    iExpectedLength  Total number of expected entries in the array
	 * @param {string} sLastEvent       Expected `event` value of the last entry (default "stBeaconReady")
	 * @param {string} sErrorMessage    OPA error message shown on timeout
	 */
	function waitForDataLayer(iExpectedLength, sLastEvent, sErrorMessage) {
		sLastEvent = sLastEvent || "stBeaconReady";
		return {
			check: function () {
				var oDL = Opa5.getWindow().adobeDataLayer;
				return Array.isArray(oDL)
					&& oDL.length === iExpectedLength
					&& oDL[oDL.length - 1].event === sLastEvent;
			},
			success: function () {
				var oDL = Opa5.getWindow().adobeDataLayer;
				Opa5.assert.ok(true, (sErrorMessage || "data layer reached expected state") +
					" — " + oDL.length + " entries, last='" + sLastEvent + "'");
			},
			errorMessage: sErrorMessage || "adobeDataLayer did not reach expected state (" +
				iExpectedLength + " entries, last='" + sLastEvent + "')"
		};
	}

	/**
	 * Returns the full adobeDataLayer array from the app window.
	 * Must be called inside a waitFor success callback.
	 */
	function getDataLayer() {
		return Opa5.getWindow().adobeDataLayer || [];
	}

	return {
		iNavigateTo: iNavigateTo,
		waitForDataLayer: waitForDataLayer,
		getDataLayer: getDataLayer
	};
});
