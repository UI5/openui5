(() => {
	"use strict";

	const __sPathPrefix = document.location.pathname.match(/(.*)\/test-resources\//)[1];
	const sPath = `${__sPathPrefix}/test-resources/sap/ui/fl/internal/performance/flexData/flexBundleLoad.rename.5.json`;

	globalThis["sap-ui-config"] ??= {};
	globalThis["sap-ui-config"].flexibilityServices = `[{"connector": "ObjectPathConnector", "path": "${sPath}"}, {"connector": "SessionStorageConnector"}]`;
})();