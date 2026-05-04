(() => {
	"use strict";
	function getUrlVar(sKey) {
		const parsedUrl = new URL(window.location.href);
		return parsedUrl.searchParams.get(sKey);
	}
	const __sPathPrefix = document.location.pathname.match(/(.*)\/test-resources\//)[1];
	const sTestCase = getUrlVar("sap-ui-fl-test-case") || "rename";
	const sTestScope = getUrlVar("sap-ui-fl-test-scope") || "1050";
	const sJsonFile = `/FakeLrep.${sTestCase}.${sTestScope}.json`;
	const sPath = `${__sPathPrefix}/test-resources/sap/ui/fl/internal/performance/flexData${sJsonFile}`;
	globalThis["sap-ui-config"] ??= {};
	globalThis["sap-ui-config"].flexibilityServices = `[{"connector": "ObjectPathConnector", "path": "${sPath}"}, {"connector": "SessionStorageConnector"}]`;
})();