/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	function SandboxModel(mParameters) {
		const mModelParameters = SandboxModelHelper.adaptModelParameters(mParameters);

		return SandboxModelHelper.createModel(mModelParameters);
	}
	SandboxModel.getMetadata = ODataModel.getMetadata;

	return SandboxModel;
});
