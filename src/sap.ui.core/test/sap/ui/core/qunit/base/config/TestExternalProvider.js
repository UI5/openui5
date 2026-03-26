sap.ui.define([], function() {
	"use strict";

	// External test provider for testing additional external provider registration
	var TestExternalProvider = {
		external: true,
		get: function(sName) {
			if (sName === "sapUiParamA") {
				return "new-external-provider";
			}
			if (sName === "sapUiNewExternalParam") {
				return "external-value";
			}
			return undefined;
		}
	};

	return TestExternalProvider;
});
