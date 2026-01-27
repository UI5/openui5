sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangement/iframe/Arrangement",
	"./configureOpa",
	"./AllJourneys",
	"./DownloadJourney"
], function (Opa5, Arrangement) {
	"use strict";

	// use the specific arrangement for the IFrame-based scenario
	Opa5.extendConfig({
		arrangements : new Arrangement()
	});
});
