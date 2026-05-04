(function() {
	"use strict";
	function getUrlVar(sKey) {
		try {
			var parsedUrl = new URL(window.location.href);
			return parsedUrl.searchParams.get(sKey);
		} catch (oError) {
			// IE11 is not supported
		}
	}
	var __sPathPrefix = document.location.pathname.match(/(.*)\/test-resources\//)[1];
	var sTestCase = getUrlVar("sap-ui-fl-test-case") || "rename";
	var sTestScope = getUrlVar("sap-ui-fl-test-scope") || "1050";
	var sJsonFile = "/FakeLrep." + sTestCase + "." + sTestScope + ".json";
	var sPath = __sPathPrefix + "/test-resources/sap/ui/fl/internal/performance/flexData" + sJsonFile;
	window["sap-ui-config"] = window["sap-ui-config"] || {};
	window["sap-ui-config"].flexibilityServices = "[{\"connector\": \"ObjectPathConnector\", \"path\": \"" + sPath + "\"}, {\"connector\": \"SessionStorageConnector\"}]";
})();