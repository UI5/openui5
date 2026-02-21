sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	"use strict";

	// Mock search data - loaded once and cached
	var oMockSearchData = null;

	var BaseArrangement = Opa5.extend("test-resources.sap.ui.documentation.sdk.integration.arrangement.BaseArrangement", {

		iClearAllData: function() {
			clearAllCookies();
			localStorage.clear();
			sessionStorage.clear();
			return this;
		},

		iDisableUsageTracking: function() {
			Opa5.extendConfig({
				appParams: {
					"sap-ui-xx-tracking": false
				}
			});
		},

		/**
		 * Sets up a mock for the SearchUtil module to return predictable search results.
		 * This should be called after iStartMyApp and before any search interactions.
		 * @returns {jQuery.promise} A promise that resolves when the mock is set up
		 */
		iSetupSearchMock: function () {
			return this.waitFor({
				check: function () {
					var oWindow = Opa5.getWindow();
					return oWindow?.sap?.ui?.require;
				},
				success: function () {
					var oWindow = Opa5.getWindow();

					// Load mock data if not already loaded
					// Use path from test runner context (outside iframe), not from iframe's resource root
					if (!oMockSearchData) {
						var xhr = new XMLHttpRequest();
						// Path is relative to the test runner HTML file location
						var sMockDataPath = sap.ui.require.toUrl("test-resources/sap/ui/documentation/sdk/integration/mock/searchindex.json");
						xhr.open("GET", sMockDataPath, false); // synchronous for simplicity
						xhr.send();
						if (xhr.status === 200) {
							oMockSearchData = JSON.parse(xhr.responseText);
						} else {
							throw new Error("Failed to load mock search data from: " + sMockDataPath);
						}
					}

					// Stub SearchUtil in the target context (works for both component and iframe)
					oWindow.sap.ui.require([
						"sap/ui/documentation/sdk/controller/util/SearchUtil"
					], function (SearchUtil) {
						// Store original for potential restore
						if (!SearchUtil._originalSearch) {
							SearchUtil._originalSearch = SearchUtil.search;
							SearchUtil._originalInit = SearchUtil.init;
						}

						// Mock init to resolve immediately
						SearchUtil.init = function () {
							return Promise.resolve(true);
						};

						// Mock search to return data based on query
						SearchUtil.search = function (sQuery, oOptions) {
							var sLowerQuery = sQuery.toLowerCase();
							var oResult = oMockSearchData[sLowerQuery];

							if (oResult) {
								return Promise.resolve(oResult);
							}

							// Default: return empty results for unknown queries
							return Promise.resolve({
								success: false,
								totalHits: 0,
								matches: {
									data: [],
									aDataAPI: [],
									aDataDoc: [],
									aDataExplored: [],
									aDataExternal: [],
									filteredData: [],
									AllLength: 0,
									APILength: 0,
									DocLength: 0,
									ExploredLength: 0,
									ExternalLength: 0
								}
							});
						};
					});
				},
				errorMessage: "Could not set up search mock - app not ready"
			});
		},

		/**
		 * Restores the original SearchUtil implementation.
		 * Call this if you need to test with the real search after using mocks.
		 * @returns {jQuery.promise} A promise that resolves when the mock is restored
		 */
		iRestoreSearchMock: function () {
			return this.waitFor({
				success: function () {
					var oWindow = Opa5.getWindow();
					oWindow.sap.ui.require([
						"sap/ui/documentation/sdk/controller/util/SearchUtil"
					], function (SearchUtil) {
						if (SearchUtil._originalSearch) {
							SearchUtil.search = SearchUtil._originalSearch;
							SearchUtil.init = SearchUtil._originalInit;
							delete SearchUtil._originalSearch;
							delete SearchUtil._originalInit;
						}
					});
				},
				errorMessage: "Could not restore search mock"
			});
		}
	});

	// utility functions
	function clearAllCookies() {
		const aCookies = document.cookie.split(";");
		for (let i = 0; i < aCookies.length; i++) {
			const sCookie = aCookies[i];
			const iEqPos = sCookie.indexOf("=");
			const sCookieName = iEqPos > -1 ? sCookie.substring(0, iEqPos) : sCookie;
			clearCookie(sCookieName);
		}
	}

	function clearCookie(name) {
		var aDomains = window.location.hostname.split('.');
		var sCookieBase = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';

		// Try to delete the cookie at each domain level
		for (var i = 0; i < aDomains.length; i++) {
			var sDomain = aDomains.slice(i).join('.');
			document.cookie = sCookieBase + ';domain=' + sDomain;
		}
	}

	return BaseArrangement;
});