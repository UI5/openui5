/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib"
], function(
	Lib
) {
	"use strict";

	const AddIFrameVisualization = {};

	/**
	 * Creates a localized description for addIFrame changes that includes the
	 * URL of the embedded iFrame.
	 *
	 * @param {object} mPayload - Change visualization description payload from the change handler
	 * @param {object} mPayload.url - URL of the embedded iFrame, wrapped as <code>{ raw: string }</code>
	 * @returns {object} Localized description with <code>descriptionText</code> and <code>descriptionTooltip</code>.
	 */
	AddIFrameVisualization.getDescription = function(mPayload) {
		const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
		const sText = oRtaResourceBundle.getText(
			"TXT_CHANGEVISUALIZATION_CHANGE_ADDIFRAME_WITH_URL",
			[mPayload.url.raw]
		);
		return {
			descriptionText: sText,
			descriptionTooltip: sText
		};
	};

	return AddIFrameVisualization;
});
