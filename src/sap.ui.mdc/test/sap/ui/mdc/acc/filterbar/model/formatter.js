sap.ui.define(function() {
	"use strict";
	return {
		formatHeight: (value) => {
			if (!value) {
				return "";
			}
			try {
				return `${parseInt(value)}px`;
			} catch (error) {
				return value;
			}
		},
		formatCountryArray: (countryArray) => {
			if (!countryArray || !Array.isArray(countryArray)) {
				return "";
			}
			return countryArray.join(", ");
		}
	};
});
