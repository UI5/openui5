/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/Utils"
], function(
	FlexInfoSession,
	Loader,
	ManifestUtils,
	Settings,
	StorageUtils,
	requireAsync,
	Utils
) {
	"use strict";

	/**
	 * API module to check for various flexibility features at a very early stage of the application startup.
	 *
	 * @namespace
	 * @alias module:sap/ui/fl/initial/api/InitialFlexAPI
	 * @since 1.132
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var InitialFlexAPI = {};

	/**
	 * Checks if key user rights are available for the current user.
	 * Application developers can use this API to decide if the key user adaptation
	 * feature should be visible to the current user. This only applies if key user adaptation
	 * should be handled standalone without an SAP Fiori launchpad.
	 *
	 * @returns {Promise<boolean>} Resolves to a boolean indicating if the key user role is assigned to the user
	 * @public
	 */
	InitialFlexAPI.isKeyUser = async function() {
		const oSettings = await Settings.getInstance();
		return oSettings.getIsKeyUser();
	};

	/**
	 * Returns the version that is used for Flexibility Services
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Reference of the application
	 * @returns {string} Version of Flexibility Services
	 *
	 * @private
	 * @ui5-restricted sap.ushell
	 */
	InitialFlexAPI.getFlexVersion = function(mPropertyBag) {
		return FlexInfoSession.getByReference(mPropertyBag.reference)?.version;
	};

	/**
	 * Resolves with a promise after all the changes for all controls that are passed have been processed.
	 * You can either pass a single control, multiple controls or an array with objects that may contain additional configuration.
	 * If multiple selector parameters are passed, only one of them is used: first element, then selectors, then complexSelectors.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.element - Control whose changes are being waited for, the control has to exist
	 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - An array of {@link sap.ui.fl.Selector}s, whose changes are being waited for, the controls have to exist
	 * @param {object[]} mPropertyBag.complexSelectors - An array containing an object with {@link sap.ui.fl.Selector} and further configuration
	 * @param {sap.ui.fl.Selector} mPropertyBag.complexSelectors.selector - A {@link sap.ui.fl.Selector}
	 * @param {string[]} [mPropertyBag.complexSelectors.changeTypes] - An array containing the change types that will be considered. If empty no filtering will be done
	 * @returns {Promise} Resolves when all changes on the control(s) are processed
	 *
	 * @private
	 * @ui5-restricted
	 */
	InitialFlexAPI.waitForChanges = async function(mPropertyBag) {
		let aComplexSelectors;
		if (mPropertyBag.element) {
			aComplexSelectors = [{
				selector: mPropertyBag.element
			}];
		} else if (mPropertyBag.selectors) {
			aComplexSelectors = mPropertyBag.selectors.map(function(oSelector) {
				return {
					selector: oSelector
				};
			});
		} else if (mPropertyBag.complexSelectors) {
			aComplexSelectors = mPropertyBag.complexSelectors;
		}
		const oAppComponent = Utils.getAppComponentForSelector(aComplexSelectors[0].selector);
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		const oFlexData = Loader.getCachedFlexData(sFlexReference).data;
		// The FlexState is only available if there are changes. Without changes there is no need to check further
		if (!StorageUtils.isStorageResponseFilled(oFlexData?.changes)) {
			return undefined;
		}
		const FlexObjectState = await requireAsync("sap/ui/fl/apply/_internal/flexState/FlexObjectState");
		return FlexObjectState.waitForFlexObjectsToBeApplied(aComplexSelectors, oAppComponent);
	};

	return InitialFlexAPI;
});
