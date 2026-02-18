sap.ui.define(['sap/ui/test/Opa5', '../BaseArrangement'], function (Opa5, BaseArrangement) {
	"use strict";

	// Mock search data - loaded once and cached
	var oMockSearchData = null;

	function addSaveForLater() {
		var sStateToAdd;
		if (window.location.search) {
			sStateToAdd = "&";
		} else {
			sStateToAdd = "?";
		}

		sStateToAdd += "safeForLater=true";

		window.history.replaceState("dummy", {}, window.location.pathname + window.location.search + sStateToAdd + window.location.hash);
	}

	return BaseArrangement.extend("test-resources.sap.ui.documentation.sdk.integration.arrangement.component.Arrangement", {
		iStartMyApp : function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.documentation.sdk",
					manifest: true
				},
				hash: ""
			});
		},

		// feature toggle tests
		iStartMyAppSafeForLaterActivated: function () {
			if (!new URLSearchParams(window.location.search).has("safeForLater")) {
				addSaveForLater();
			}
			return this.iStartMyApp();
		},

		/**
		 * Sets up a mock for the SearchUtil module to return predictable search results.
		 * This should be called after iStartMyApp and before any search interactions.
		 * @returns {jQuery.promise} A promise that resolves when the mock is set up
		 */
		iSetupSearchMock: function () {
			return this.waitFor({
				check: function () {
					return sap && sap.ui && sap.ui.require;
				},
				success: function () {
					// Load mock data if not already loaded
					if (!oMockSearchData) {
						var xhr = new XMLHttpRequest();
						// Use sap.ui.require.toUrl to get the correct path for the mock data
						var sMockDataPath = sap.ui.require.toUrl("test-resources/sap/ui/documentation/sdk/integration/mock/searchindex.json");
						xhr.open("GET", sMockDataPath, false); // synchronous for simplicity
						xhr.send();
						if (xhr.status === 200) {
							oMockSearchData = JSON.parse(xhr.responseText);
						} else {
							throw new Error("Failed to load mock search data from: " + sMockDataPath);
						}
					}

					// Stub SearchUtil in the current context
					sap.ui.require([
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
					sap.ui.require([
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
});