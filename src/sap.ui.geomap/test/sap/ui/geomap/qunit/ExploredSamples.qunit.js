sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	'sap/ui/demo/mock/qunit/SampleTester'
], function(createAndAppendDiv, SampleTester) {
	"use strict";

	createAndAppendDiv("content");

	new SampleTester(
		'sap.ui.geomap',
		[
			'sap.ui.geomap.sample.dynamic',
			'sap.ui.geomap.sample.draw',
			'sap.ui.geomap.sample.drive'
		]
	).placeAt('content');

});
