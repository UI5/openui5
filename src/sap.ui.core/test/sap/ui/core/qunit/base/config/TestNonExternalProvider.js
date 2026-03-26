sap.ui.define([], function() {
	"use strict";

	// Non-external test provider that tries to override sapUiParamA
	var TestNonExternalProvider = {
		get: function(sName) {
			if (sName === "sapUiParamA") {
				return "non-external-override-attempt";
			}
			return undefined;
		}
	};

	return TestNonExternalProvider;
});
