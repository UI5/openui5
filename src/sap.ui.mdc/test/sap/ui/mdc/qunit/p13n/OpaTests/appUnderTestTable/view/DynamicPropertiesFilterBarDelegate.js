sap.ui.define([
	"AppUnderTestTable/view/TestFilterBarDelegate"
], function(TestFilterBarDelegate) {
	"use strict";

	const oCustomDelegate = Object.assign({}, TestFilterBarDelegate);

	oCustomDelegate.fetchProperties = function(oFilterBar) {
		return TestFilterBarDelegate.fetchProperties(oFilterBar).then(function(aProperties) {
			aProperties.forEach(function(oProperty) {
				if (oProperty.key === "name" || oProperty.key === "foundingYear") {
					oProperty.isActive = true;
				}
			});
			return aProperties;
		});
	};

	return oCustomDelegate;
});
