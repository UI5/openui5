/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/Utils",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/base/Log"
], function (
	Library,
	BindingHelper,
	BindingResolver,
	Utils,
	IllustratedMessageType,
	IllustratedMessageSize,
	Log
) {
	"use strict";

	/**
	 * Util class for preprocessing of card manifests.
	 * @namespace sap.ui.integration.util.ManifestResolver
	 * @since 1.97
	 * @private
	 * @ui5-restricted Mobile SDK
	 */
	var ManifestResolver = {};

	/**
	 * Resolves a card and returns its resolved manifest.
	 * @memberof sap.ui.integration.util.ManifestResolver
	 * @alias sap.ui.integration.util.ManifestResolver.resolveCard
	 * @param {sap.ui.integration.widgets.Card} oCard The card to resolve.
	 * @returns {Promise<object>} Promise which resolves with manifest with resolved bindings and translations or rejects with an error message if there is an error.
	 * @private
	 * @ui5-restricted Mobile SDK
	 */
	ManifestResolver.resolveCard = function (oCard) {
		oCard.startManifestProcessing();

		return ManifestResolver._awaitReadyEvent(oCard)
			.then(function () {
				return oCard.getModel("context").waitForPendingProperties();
			})
			.then(function () {
				return ManifestResolver._handleCardReady(oCard);
			})
			.catch(function (oError) {
				return ManifestResolver._handleCardSevereError(oCard, oError);
			});
	};

	/**
	 * Waits for the _ready event of the card
	 * @private
	 * @param {sap.ui.integration.widgets.Card} oCard The card.
	 * @returns {Promise} A promise which is resolved when the _ready event is fired.
	 */
	ManifestResolver._awaitReadyEvent = function (oCard) {
		if (oCard.isReady()) {
			return Promise.resolve(oCard);
		}

		return new Promise(function (resolve, reject) {
			oCard.attachEvent("_ready", function (e) {
				resolve(oCard);
			});
		});
	};

	/**
	 * Resolves the manifest when the card is ready.
	 * @private
	 * @param {sap.ui.integration.widgets.Card} oCard The card.
	 * @returns {Promise<object>} Resolved manifest.
	 */
	ManifestResolver._handleCardReady = function (oCard) {
		var oManifest = oCard.getManifestEntry("/"),
			aFilters = [],
			aErrors = oCard.getSevereErrors(),
			oContentMessage = oCard.getContentMessage();

		if (aErrors.length) {
			return Promise.reject(aErrors.join(" "));
		}

		try {
			const oProcessedParameters = ManifestResolver._processParameters(oManifest, oCard.getBindingNamespaces());

			oManifest = BindingHelper.createBindingInfos(oManifest, oCard.getBindingNamespaces());

			if (oProcessedParameters) {
				Utils.setNestedPropertyValue(oManifest, "/sap.card/configuration/parameters", oProcessedParameters);
			}

			// Include merged customSettings in resolved manifest
			const oCustomSettings = oCard.getCombinedCustomSettings();
			oManifest["sap.card"].customSettings = oCustomSettings;

			if (oCard.getAggregation("_filterBar")) {
				aFilters =  oCard.getAggregation("_filterBar")._getFilters().map(function (oFilter) {
					return ["/sap.card/configuration/filters/" + oFilter.getKey(), oFilter];
				});
			}

			var iFilterIndex = 0;
			// Process card sections in order - nested sections with "data" have to be processed first
			aFilters.concat([
				["/sap.card/content", oCard.getCardContent()],
				["/sap.card/header", oCard.getCardHeader()],
				["/sap.card/footer", oCard.getCardFooter()],
				["/sap.card", oCard]
			]).filter(function (aPathAndContext) {
				return !!oCard.getManifestEntry(aPathAndContext[0]); // only resolve existing sections
			}).forEach(function (aPathAndContext) {
				var sManifestPath = aPathAndContext[0];
				var oContext = aPathAndContext[1];
				var oSubConfig;
				var sDataPath;

				if (oContentMessage && sManifestPath === "/sap.card/content") {
					oSubConfig = {
						message: oContentMessage
					};
				} else if (oContext.getStaticConfiguration) {
					oSubConfig = oContext.getStaticConfiguration(Utils.getNestedPropertyValue(oManifest, sManifestPath));
					// add index to each filter so that Mobile SDK can get correct order of the filters
					if (sManifestPath.startsWith("/sap.card/configuration/filters/")) {
						oSubConfig.index = iFilterIndex;
						iFilterIndex++;
					}
				} else {
					oSubConfig = Utils.getNestedPropertyValue(oManifest, sManifestPath);
				}

				if (oContext.extendStaticConfiguration) {
					oContext.extendStaticConfiguration(oSubConfig);
				}

				if (oSubConfig.data) {
					sDataPath = oSubConfig.data.path;
					delete oSubConfig.data;
				}

				// Resolve only binding infos which are left unresolved, we must not resolve sections twice.
				oSubConfig = BindingResolver.resolveValue(oSubConfig, oContext, sDataPath, true);
				Utils.setNestedPropertyValue(oManifest, sManifestPath, oSubConfig);
			});

			ManifestResolver._makeEnabledAndVisibleBooleans(oManifest);

			return Promise.resolve(JSON.parse(JSON.stringify(oManifest))); // remove undefined values
		} catch (ex) {
			return Promise.reject(ex);
		}
	};

	/**
	 * Detaches the parameters subtree, processes each parameter individually, and
	 * returns the result. Callers must re-attach it onto the resolved manifest.
	 *
	 * @private
	 * @param {object} oManifest The manifest object (parameters subtree is detached).
	 * @param {string[]} aBindingNamespaces Passed to createBindingInfos.
	 * @returns {object|null} Processed parameters, or null if there are none.
	 */
	ManifestResolver._processParameters = function (oManifest, aBindingNamespaces) {
		const oParameters = oManifest?.["sap.card"]?.configuration?.parameters;
		if (!oParameters) {
			return null;
		}

		delete oManifest["sap.card"].configuration.parameters;

		const oProcessed = {};
		Object.keys(oParameters).forEach(function (sName) {
			oProcessed[sName] = ManifestResolver._processSingleParameter(oParameters[sName], sName, aBindingNamespaces);
		});

		return oProcessed;
	};

	/**
	 * Processes a single parameter wrapper. With <code>ignoreBinding: true</code> the value is taken verbatim.
	 * Otherwise the wrapper goes through createBindingInfos.
	 * If the fail-safe detects a malformation, the raw value is restored and a Log.error names the parameter.
	 *
	 * @private
	 * @param {object} oParam The parameter wrapper from the manifest.
	 * @param {string} sName The parameter name (used in the Log.error message).
	 * @param {string[]} aBindingNamespaces Passed to createBindingInfos.
	 * @returns {object} The processed parameter wrapper.
	 */
	ManifestResolver._processSingleParameter = function (oParam, sName, aBindingNamespaces) {
		if (!oParam) {
			return oParam;
		}

		if (oParam.ignoreBinding === true) {
			return oParam;
		}

		const vRawValue = oParam.value;
		const oResolved = BindingHelper.createBindingInfos(oParam, aBindingNamespaces);

		// Two parser misbehaviors, both treated as fail-safe triggers:
		// 1) findMalformedBindingInfoPath: a {parts, formatter} wrapper whose parts lack path
		//    (typical for "[{...}]" array-shaped JSON);
		// 2) bStringCoercedToObject: a string silently parsed into an object (typical for "{...}").
		const sOffendingPath = BindingHelper.findMalformedBindingInfoPath(oResolved.value);
		const bStringCoercedToObject = typeof vRawValue === "string"
			&& oResolved.value !== null
			&& typeof oResolved.value === "object"
			&& !BindingHelper.isBindingInfo(oResolved.value);

		if (sOffendingPath || bStringCoercedToObject) {
			oResolved.value = vRawValue;
			Log.error(
				"Parameter '" + sName + "' is bound to '" + (sOffendingPath || "/")  + "'. This path points to value with unescaped binding literals that led to failure during binding resolution." +
				"The raw value was preserved. If this parameter does not contain binding syntax, but contains strings similar to binding syntax, which are not escaped, you can use the property 'ignoreBinding: true' on this parameter to silence this message.",
				"sap.ui.integration.util.ManifestResolver"
			);
		}

		return oResolved;
	};

	ManifestResolver._makeEnabledAndVisibleBooleans = function (oManifest) {
		for (const sKey in oManifest) {
			if (!oManifest.hasOwnProperty(sKey)) {
				continue;
			}

			const oValue = oManifest[sKey];

			if (oValue && typeof oValue === "object") {
				ManifestResolver._makeEnabledAndVisibleBooleans(oValue);
			} else if (sKey === "enabled" || sKey === "visible") {
				oManifest[sKey] = !!oValue;
			}
		}
	};

	/**
	 * Resolves the manifest if there is a severe error. This function makes sure that we always return a manifest.
	 * @private
	 * @param {sap.ui.integration.widgets.Card} oCard The card.
	 * @param {object} oError The error which was caught.
	 * @returns {object} Resolved manifest.
	 */
	ManifestResolver._handleCardSevereError = function (oCard, oError) {
		var oManifest = oCard.getManifestEntry("/"),
			oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

		Log.error(oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"), oError, "sap.ui.integration.util.ManifestResolver");

		if (oManifest === null) {
			oManifest = {};
		}

		oManifest["sap.card"] = {
			content: {
				message: {
					type: "error",
					title: oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"),
					description: oResourceBundle.getText("CARD_ERROR_CONFIGURATION_DESCRIPTION"),
					details: oError.toString(),
					illustrationType: IllustratedMessageType.UnableToLoad,
					illustrationSize: IllustratedMessageSize.Small
				}
			}
		};

		return JSON.parse(JSON.stringify(oManifest)); // remove undefined values
	};

	return ManifestResolver;
});