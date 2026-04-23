/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/base/util/merge",
	"sap/ui/dom/includeScript",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/interfaces/BaseLoadConnector",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	_pick,
	merge,
	includeScript,
	Utils,
	FlexInfoSession,
	StorageUtils,
	BaseConnector,
	Layer,
	FlexUtils
) {
	"use strict";

	const ROUTES = {
		DATA: "/flex/data/",
		VARIANT_DATA: "/flex/variantdata/",
		VARIANT_DATA_CONTENT: "/flex/variantdata/content/",
		COMP_VARIANT_DATA: "/flex/compvariantdata/",
		COMP_VARIANT_DATA_CONTENT: "/flex/compvariantdata/content/",
		MODULES: "/flex/modules/",
		SETTINGS: "/flex/settings",
		VARIANTS_AUTHORS: "/variants/authors/"
	};

	let _mFlexDataParameters = {};

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.LrepConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @since 1.67
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage, sap.ui.fl.write._internal.transport
	 */
	return merge({}, BaseConnector, {
		layers: [
			"ALL"
		],
		xsrfToken: undefined,
		settings: undefined,

		/**
		 * Loads the modules in a CSP-compliant way via the UI5 core scripting mechanism
		 * This function has been extracted from the function <code>loadFlexData</code>
		 * The purpose of this is to have a function that can be stubbed for testing.
		 *
		 * @param {string} sFlexModulesUri Uri to load flex modules
		 * @returns {Promise} Returns a Promise resolved empty after the script was included
		 * @private
		 */
		 _loadModules(sFlexModulesUri) {
			return new Promise(function(resolve, reject) {
				includeScript(sFlexModulesUri, undefined, resolve, reject);
			});
		},

		/**
		 * Adds client information from browser url into request parameters
		 *
		 * @param {object} mParameters Parameters of the request
		 * @private
		 * @ui5-restricted sap.ui.fl.write._internal.connectors.LrepConnector
		 */
		_addClientInfo(mParameters) {
			var sClient = FlexUtils.getUrlParameter("sap-client");
			if (!mParameters && sClient) {
				mParameters = {};
			}
			if (sClient) {
				mParameters["sap-client"] = sClient;
			}
		},

		/**
		 * Called to get the flex features.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures(mPropertyBag) {
			if (this.settings) {
				return Promise.resolve(this.settings);
			}
			var mParameters = {};

			this._addClientInfo(mParameters);

			var sFeaturesUrl = Utils.getUrl(ROUTES.SETTINGS, mPropertyBag, mParameters);
			return Utils.sendRequest(sFeaturesUrl, "GET", { initialConnector: this }).then(function(oResult) {
				oResult.response.isVariantAdaptationEnabled = !!oResult.response.isPublicLayerAvailable;
				oResult.response.isContextSharingEnabled = true;
				oResult.response.isLocalResetEnabled = true;
				return oResult.response;
			});
		},

		/**
		 * Loads flexibility data from a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to actual component
		 * @param {string} [mPropertyBag.siteId] <code>sideId</code> that belongs to actual component
		 * @param {string} [mPropertyBag.cacheKey] Cache buster token
		 * @param {object} [mPropertyBag.preview] Preview data provided within the asyn hints
		 * @param {string} [mPropertyBag.preview.reference] Reference of the base application for building the preview request
		 * @param {sap.ui.fl.Layer} [mPropertyBag.preview.maxLayer] Limit to which layer the preview data has to be requested
		 * @param {boolean} [mPropertyBag.allContexts] Includes also restricted context
		 * @param {string} [mPropertyBag.version] Version to be loaded
		 * @param {string} [mPropertyBag.adaptationId] - Context-based adaptation to be loaded
		 * @param {boolean} [mPropertyBag.lazyLoadingViewsEnabled] Signals to the back end that lazy loading of variants is supported;
		 * must not be set when starting key user adaptation
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 * or resolves with undefined in case cache bustering determines that no data is present
		 */
		loadFlexData(mPropertyBag) {
			if (mPropertyBag.cacheKey === "<NO CHANGES>") {
				/**
				 * Currently LREP filters changes context-depended for cache key calculation and
				 * can not provide the correct allContextsProvided value. Therefore, no assumption can be made
				 * about the presence of changes in the response.
				 */
				return Promise.resolve({ ...StorageUtils.getEmptyFlexDataResponse() });
			}

			const mParameters = _pick(mPropertyBag, ["version", "allContexts", "adaptationId", "lazyLoadingViewsEnabled"]);

			// todos#18: For the moment, only the LREP connector supports lazy loading of views. Therefore the flag is explicitly set here.
			// The flag must not be set when in RTA.
			const oFlexInfoSession = FlexInfoSession.getByReference(mPropertyBag.reference);
			if (!(oFlexInfoSession.adaptationMode || window.sessionStorage.getItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`))) {
				mParameters.lazyLoadingViewsEnabled = true;
			}

			this._addClientInfo(mParameters);
			Utils.addSAPLogonLanguageInfo(mParameters);
			let sAppDescriptorId;
			if (mPropertyBag.appDescriptor && mPropertyBag.appDescriptor["sap.app"]) {
				sAppDescriptorId = mPropertyBag.appDescriptor["sap.app"].id;
			}

			if (mPropertyBag.preview) {
				// IDE may show a preview where only references in a lower app variant hierarchy are known by the back end
				mPropertyBag.reference = mPropertyBag.preview.reference;
				// higher layers are served by other connectors
				mParameters.upToLayerType = mPropertyBag.preview.maxLayer;
			}

			// Store parameters for possible subsequence GET variants' authors names request
			_mFlexDataParameters = mParameters;

			const sDataUrl = Utils.getUrl(ROUTES.DATA, mPropertyBag, mParameters);
			return Utils.sendRequest(sDataUrl, "GET", {
				initialConnector: this,
				xsrfToken: this.xsrfToken,
				siteId: mPropertyBag.siteId,
				cacheable: true,
				sAppDescriptorId
			}).then(function(oResult) {
				const oResponse = oResult.response;
				if (oResult.etag) {
					oResponse.cacheKey = oResult.etag;
				} else if (mPropertyBag.cacheKey) {
					oResponse.cacheKey = mPropertyBag.cacheKey;
				}
				oResponse.changes = oResponse.changes.concat(oResponse.compVariants || []);
				if (oResponse.settings) {
					this.settings = oResponse.settings;
					this.settings.isVariantAdaptationEnabled = !!this.settings.isPublicLayerAvailable;
					this.settings.isContextSharingEnabled = true;
					this.settings.isLocalResetEnabled = true;
				}
				if (!oResponse.loadModules) {
					return oResponse;
				}

				const sModulesUrl = Utils.getUrl(ROUTES.MODULES, mPropertyBag, mParameters);
				return this._loadModules(sModulesUrl).then(function() {
					return oResponse;
				});
			}.bind(this));
		},

		/**
		 * Get full names of variants' authors.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured URL for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @returns {Promise<object>} Promise resolves with an object containing maps of variants' IDs and their names
		 */
		loadVariantsAuthors(mPropertyBag) {
			delete _mFlexDataParameters.lazyLoadingViewsEnabled;
			const sVariantsAuthorsUrl = Utils.getUrl(ROUTES.VARIANTS_AUTHORS, mPropertyBag, _mFlexDataParameters);
			return Utils.sendRequest(sVariantsAuthorsUrl, "GET", { initialConnector: this }).then(function(oResult) {
				return oResult.response;
			});
		},

		/**
		 * Load all FL variants and their metadata for Manage Views dialog.
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.vmReference Id of the control for which the variants should be loaded
		 * @returns {Promise<object>} Promise resolves with an object containing the flex variants for the given control
		 */
		loadAllFlVariants(mPropertyBag) {
			const mParameters = _pick(mPropertyBag, ["vmReference"]);
			this._addClientInfo(mParameters);
			Utils.addSAPLogonLanguageInfo(mParameters);

			const sVariantUrl = Utils.getUrl(ROUTES.VARIANT_DATA, mPropertyBag, mParameters);
			return Utils.sendRequest(sVariantUrl, "GET", { initialConnector: this }).then((oResult) => {
				return oResult.response;
			});
		},

		/**
		 * Load missing UI changes when switching to a variant that has variantDependentControlChangesRemoved: true
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.id Id of the variant for which the content should be loaded
		 * @returns {Promise<object>} Promise resolves with an object containing the flex variant content for the given variant ID
		 */
		loadFlVariantContent(mPropertyBag) {
			const mParameters = _pick(mPropertyBag, ["id"]);
			this._addClientInfo(mParameters);
			Utils.addSAPLogonLanguageInfo(mParameters);

			const sVariantUrl = Utils.getUrl(ROUTES.VARIANT_DATA_CONTENT, mPropertyBag, mParameters);
			return Utils.sendRequest(sVariantUrl, "GET", { initialConnector: this }).then((oResult) => {
				return oResult.response;
			});
		},

		/**
		 * Load all comp variants and their metadata for Manage Views dialog.
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.persistencyKey Persistency key of the control for which the variants should be loaded
		 * @returns {Promise<object>} Promise resolves with an object containing the flex variants for the given control
		 */
		loadAllCompVariants(mPropertyBag) {
			const mParameters = _pick(mPropertyBag, ["persistencyKey"]);
			this._addClientInfo(mParameters);
			Utils.addSAPLogonLanguageInfo(mParameters);

			const sVariantUrl = Utils.getUrl(ROUTES.COMP_VARIANT_DATA, mPropertyBag, mParameters);
			return Utils.sendRequest(sVariantUrl, "GET", { initialConnector: this }).then((oResult) => {
				return oResult.response;
			});
		},

		/**
		 * Load missing content when switching to a variant that has contentRemoved: true.
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.id Id of the variant for which the content should be loaded
		 * @returns {Promise<object>} Promise resolves with an object containing the flex variant content for the given variant ID
		 */
		loadCompVariantContent(mPropertyBag) {
			const mParameters = _pick(mPropertyBag, ["id"]);
			this._addClientInfo(mParameters);
			Utils.addSAPLogonLanguageInfo(mParameters);

			const sVariantUrl = Utils.getUrl(ROUTES.COMP_VARIANT_DATA_CONTENT, mPropertyBag, mParameters);
			return Utils.sendRequest(sVariantUrl, "GET", { initialConnector: this }).then((oResult) => {
				return oResult.response;
			});
		}
	});
});
