sap.ui.define([
	"AppUnderTestTable/view/TestTableDelegate"
], function(TestTableDelegate) {
	"use strict";

	const oCustomDelegate = Object.assign({}, TestTableDelegate);

	oCustomDelegate.fetchProperties = function(oTable) {
		return TestTableDelegate.fetchProperties(oTable).then(function(aProperties) {
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
