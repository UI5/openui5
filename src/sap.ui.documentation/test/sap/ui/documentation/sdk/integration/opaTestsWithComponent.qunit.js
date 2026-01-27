sap.ui.define([
	"require",
	"sap/ui/test/Opa5",
	"sap/ui/documentation/sdk/controller/util/APIInfo",
	"sap/ui/dom/includeStylesheet",
	"./arrangement/component/Arrangement",
	"./configureOpa",
	"./AllJourneys"
], function (require, Opa5, APIInfo, includeStylesheet, Arrangement) {
	"use strict";

	includeStylesheet(require.toUrl('./opaTestsWithComponent.qunit.css'));

	const mockUrl = require.toUrl('./mock');

	// Demo Kit in static navigation mode
	globalThis['sap-ui-documentation-static'] = true;
	//We preset the path to api-index.json file to be the local mock folder
	globalThis['sap-ui-documentation-config'] = {
		apiInfoRootURL: sap.ui.require.toUrl(`${mockUrl}/docs/api/api-index.json`)
	};
	APIInfo._setRoot(mockUrl);

	// use the specific arrangement for the component-based scenario
	Opa5.extendConfig({
		arrangements : new Arrangement()
	});
});
