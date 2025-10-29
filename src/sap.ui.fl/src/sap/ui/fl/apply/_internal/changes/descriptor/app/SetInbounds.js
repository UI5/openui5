
/*!
 * ${copyright}
*/

sap.ui.define([
	"sap/ui/fl/util/DescriptorChangeCheck"
], function(
	DescriptorChangeCheck
) {
	"use strict";

	const MANDATORY_PROPERTIES = ["semanticObject", "action"];
	const SUPPORTED_PROPERTIES = [...MANDATORY_PROPERTIES, "hideLauncher", "icon", "title", "shortTitle", "subTitle", "info", "indicatorDataSource", "deviceTypes", "displayMode", "signature"];

	const PROPERTIES_PATTERNS = {
		semanticObject: "^[\\w\\*]{0,30}$",
		action: "^[\\w\\*]{0,60}$"
	};

	/**
	* Descriptor change merger for change type <code>appdescr_app_setInbounds</code>.
	* Overwrites all existing inbounds with new inbounds <code>sap.app/crossNavigation/inbounds</code> to the app.
	*
	* Available for build {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	*
	* @namespace
	* @alias sap.ui.fl.apply._internal.changes.descriptor.app.AddNewInbound
	* @version ${version}
	* @private
	* @ui5-restricted sap.ui.fl.apply._internal
	*/
	const SetInbounds = /** @lends sap.ui.fl.apply._internal.changes.descriptor.app.SetInbounds */ {

		/**
		* Method to apply the  <code>appdescr_app_setInbounds</code> change to the manifest.
		*
		* @param {object} oManifest - Original manifest
		* @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_app_setInbounds</code>
		* @param {object} oChange.content - Details of the change
		* @param {object} oChange.content.inbounds - Inbounds <code>content.inbounds</code> that is being added
		* @returns {object} Updated manifest with new inbounds <code>sap.app/crossNavigation/inbounds/<new_inbound_id></code>
		*
		* @private
		* @ui5-restricted sap.ui.fl.apply._internal
		*/
		applyChange(oManifest, oChange) {
			oManifest["sap.app"].crossNavigation ||= {};
			oManifest["sap.app"].crossNavigation.inbounds ||= {};

			const oChangeContent = oChange.getContent();
			const aInboundIds = DescriptorChangeCheck.getAndCheckContentObject(oChangeContent, {
				sKey: "inbounds",
				sChangeType: oChange.getChangeType(),
				iMaxNumberOfKeys: -1, // unlimited entries
				aMandatoryProperties: MANDATORY_PROPERTIES,
				aSupportedProperties: SUPPORTED_PROPERTIES,
				oSupportedPropertyPattern: PROPERTIES_PATTERNS
			});
			aInboundIds.forEach((sInboundId) => {
				DescriptorChangeCheck.checkIdNamespaceCompliance(sInboundId, oChange);
			});
			// Overwrite all inbounds with the new ones
			oManifest["sap.app"].crossNavigation.inbounds = oChangeContent.inbounds;

			return oManifest;
		}
	};

	return SetInbounds;
});