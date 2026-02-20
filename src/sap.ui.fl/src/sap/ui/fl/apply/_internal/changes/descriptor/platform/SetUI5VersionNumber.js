
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/base/util/Version"
], function(
	ObjectPath,
	Version
) {
	"use strict";
	const rSemver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
	/**
	 * Descriptor change merger for change type <code>appdescr_platform_cf_setUI5VersionNumber</code>.
	 * Upserts string value at <code>sap.platform.cf/ui5VersionNumber</code>.
	 *
	 * Only available during build time {@link sap.ui.fl.apply._internal.changes.descriptor.RegistrationBuild}.
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.changes.descriptor.platform.SetUI5VersionNumber
	 * @since 1.120
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	const SetUI5VersionNumber = /** @lends sap.ui.fl.apply._internal.changes.descriptor.platform.SetUI5VersionNumber */ {
		/**
		 * Applies <code>appdescr_platform_cf_setUI5VersionNumber</code> change to the manifest.
		 * @param {object} oManifest - Original manifest
		 * @param {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange} oChange - Change with type <code>appdescr_platform_cf_setUI5VersionNumber</code>
		 * @param {object} oChange.content - Details of the change
		 * @param {string} oChange.content.ui5VersionNumber - String UI5 version number to set
		 * @returns {object} Updated manifest with changed <code>sap.platform.cf/ui5VersionNumber</code>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange(oManifest, oChange) {
			if (!oChange.getContent().hasOwnProperty("ui5VersionNumber")) {
				throw new Error("No ui5VersionNumber in change content provided");
			}
			const sUI5VersionNumber = oChange.getContent().ui5VersionNumber;
			if (typeof sUI5VersionNumber !== "string") {
				throw new Error(`The current change value type of property ui5VersionNumber is '${typeof sUI5VersionNumber}'. Only allowed type for property ui5VersionNumber is string`);
			}
			const aSemverMatch = rSemver.exec(sUI5VersionNumber);
			if (!aSemverMatch) {
				throw new Error(`The value of property ui5VersionNumber ('${sUI5VersionNumber}') is not a valid semantic version (MAJOR.MINOR or MAJOR.MINOR.PATCH)`);
			}
			const aPropertyPath = ["sap.platform.cf", "ui5VersionNumber"];
			const oNewVersion = new Version(sUI5VersionNumber);
			const oCurrVersionString = ObjectPath.get(aPropertyPath, oManifest);
			const oCurrVersion = oCurrVersionString ? new Version(oCurrVersionString) : null;
			if (!oCurrVersion || oCurrVersion.compareTo(oNewVersion) < 0) {
				ObjectPath.set(aPropertyPath, sUI5VersionNumber, oManifest);
			}
			return oManifest;
		}
	};
	return SetUI5VersionNumber;
});
