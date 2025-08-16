/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/Log",
	"sap/base/util/isPlainObject",
	"sap/ui/integration/util/Utils"
], function (
	BaseObject,
	Log,
	isPlainObject,
	Utils
) {
	"use strict";

	const rDestinations = /\{\{destinations.([^\}]+)/;
	const rMainDestinations = /\{\{mainDestinations.([^\}]+)/;
	const MANIFEST_PATHS = {
		DESTINATIONS: "/sap.card/configuration/destinations"
	};

	function hasDestination(oObject, rPattern) {
		return Utils.find(oObject, (vValue) => {
			return typeof vValue === "string" && vValue.match(rPattern);
		});
	}

	/**
	 * Constructor for a new <code>Destinations</code>.
	 *
	 * @class
	 * Processes and resolves destinations configuration.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @param {sap.ui.integration.Host} oHost The Host which will be used for resolving destinations.
	 * @param {object} oConfiguration The destinations configuration.
	 * @private
	 * @alias sap.ui.integration.util.Destinations
	 */
	var Destinations = BaseObject.extend("sap.ui.integration.util.Destinations", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (mConfig) {
			BaseObject.call(this);
			this._oHost = mConfig.host;
			this._oCard = mConfig.card;
			this._oResolverCard = mConfig.resolverCard;
			this._oConfiguration = mConfig.manifestConfig;
			this._mResolved = new Map();
			this._sPrefix = mConfig.prefix;
		}
	});

	Destinations.create = function (mParameters) {
		const oCard = mParameters.card;
		const oMainCard = mParameters.mainCard;
		const bIsPaginationCard = mParameters.isPaginationCard;

		if (!bIsPaginationCard) {
			Destinations._validateConfiguration(oCard, oMainCard);
		}

		let oResolverCard = oCard;
		let sPrefix = "destinations";

		const bIsChildCard = oMainCard !== oCard;
		const bUseMainDestinations = oCard.getManifestEntry("/sap.card/configuration/useMainDestinations") === true;

		if (bIsChildCard && bUseMainDestinations) {
			oResolverCard = oMainCard;
			sPrefix = "mainDestinations";
		}

		return new Destinations({
			host: oCard.getHostInstance(),
			card: oCard,
			resolverCard: oResolverCard,
			manifestConfig: oResolverCard.getManifestEntry(MANIFEST_PATHS.DESTINATIONS),
			prefix: sPrefix
		});
	};

	Destinations._validateConfiguration = function (oCard, oMainCard) {
		const bIsChildCard = oMainCard !== oCard;
		const bUseMainDestinations = oCard.getManifestEntry("/sap.card/configuration/useMainDestinations") === true;
		const bHasOwnDestinations = oCard.getManifestEntry(MANIFEST_PATHS.DESTINATIONS) !== undefined;

		if (bUseMainDestinations && !bIsChildCard) {
			throw new Error(
				"Unsupported configuration: 'sap.card/configuration/useMainDestinations' is for child cards only. "
			);
		}

		if (bIsChildCard && bUseMainDestinations) {
			if (bHasOwnDestinations) {
				throw new Error(
					"Unsupported configuration: 'sap.card/configuration/useMainDestinations' is set to true, yet 'sap.card/configuration/destinations' is also defined in the card manifest."
					+ "Remove 'sap.card/configuration/destinations' from the card manifest and refer exclusively to the main card destinations.\n"
				);
			}

			const sDestination = hasDestination(oCard.getManifestEntry("/sap.card"), rDestinations);

			if (sDestination) {
				Log.error(`Unsupported syntax: ${sDestination}. {{destinations.<destination>}} cannot be used in child card that has 'sap.card/configuration/useMainDestinations' set to true. Use {{mainDestinations.<destination>}} instead.`);
			}
		}

		if (bIsChildCard && !bUseMainDestinations && bHasOwnDestinations) {
			Log.error(
				"The configuration 'sap.card/configuration/destinations' for child cards is deprecated since 1.140. "
				+ "Use the property 'sap.card/configuration/useMainDestinations' instead and refer to the main card destinations.",
				"sap.ui.integration.widgets.Card"
			);
		}
	};

	/**
	 * Sets the host which is used to resolve destinations.
	 * @param {sap.ui.integration.Host} oHost The host.
	 */
	Destinations.prototype.setHost = function(oHost) {
		this._oHost = oHost;
		this._mResolved.clear();
	};

	/**
	 * Process destination placeholders inside a configuration object.
	 * @param {Object} oConfig The configuration object.
	 * @returns {Promise} A promise which resolves with the processed object.
	 */
	Destinations.prototype.process = function (oConfig) {
		var aPromises = [];

		this._processObject(oConfig, undefined, aPromises);

		return Promise.all(aPromises).then(function () {
			return oConfig;
		}).catch(function (sMessage) {
			Log.error(sMessage, "sap.ui.integration.util.Destinations");
			return oConfig;
		});
	};

	/**
	 * @private
	 */
	Destinations.prototype._processObject = function (oObj, vKey, aPromises) {
		if (!oObj) {
			return Promise.resolve(oObj);
		}

		var vValue = oObj.hasOwnProperty(vKey) ? oObj[vKey] : oObj;

		if (typeof vValue === "string") {
			aPromises.push(this.processString(vValue)
				.then(function (sProcessedString) {
					if (vKey !== undefined) {
						oObj[vKey] = sProcessedString;
					}
				})
				.catch(function (sMessage) {
					Log.error(sMessage, "sap.ui.integration.util.Destinations");
					if (vKey !== undefined) {
						oObj[vKey] = "";
					}
				}));
		}

		if (isPlainObject(vValue)) {
			Object.keys(vValue).forEach(function (sKey) {
				this._processObject(vValue, sKey, aPromises);
			}.bind(this));
		}

		if (Array.isArray(vValue)) {
			vValue.forEach(function (vItem, iIndex) {
				this._processObject(vValue, iIndex, aPromises);
			}.bind(this));
		}
	};

	/**
	 * Resolves the destination and returns its URL.
	 * @param {string} sKey The destination's key used in the configuration.
	 * @returns {Promise} A promise which resolves with the URL of the destination.
	 * @public
	 */
	Destinations.prototype.getUrl = function (sKey) {
		var oResult;

		if (this._mResolved.has(sKey)) {
			return this._mResolved.get(sKey);
		}

		oResult = this._resolveUrl(sKey);

		this._mResolved.set(sKey, oResult);

		return oResult;
	};

	/**
	 * @private
	 */
	Destinations.prototype._resolveUrl = function (sKey) {
		var oConfig = this._oConfiguration ? this._oConfiguration[sKey] : null,
			sName,
			sDefaultUrl,
			pResult;

		if (!oConfig) {
			return Promise.reject("Configuration for destination '" + sKey + "' was not found in the manifest.");
		}

		sName = oConfig.name;
		sDefaultUrl = oConfig.defaultUrl;

		if (!sName && !sDefaultUrl) {
			return Promise.reject("Can not resolve destination '" + sKey + "'. Neither 'name' nor 'defaultUrl' is configured.");
		}

		if (!sName && sDefaultUrl) {
			return Promise.resolve(sDefaultUrl);
		}

		if (!this._oHost && !sDefaultUrl) {
			return Promise.reject("Can not resolve destination '" + sKey + "'. There is no 'host' and no defaultUrl specified.");
		}

		if (!this._oHost && sDefaultUrl) {
			return Promise.resolve(sDefaultUrl);
		}

		pResult = Utils.timeoutPromise(this._oHost.getDestination(sName, this._oResolverCard));

		if (sDefaultUrl) {
			return pResult.catch(function (sMessage) {
				Log.info(sMessage + " Fallback to default url.", "sap.ui.integration.util.Destinations");
				return sDefaultUrl;
			});
		}

		return pResult;
	};

	/**
	 * Process a string and replaces a destination placeholder with the resolved destination.
	 * @param {string} sString The string to process.
	 * @returns {Promise} A Promise which resolves with the processed string.
	 */
	Destinations.prototype.processString = function (sString) {
		const aMatches = this._sPrefix === "destinations" ? sString.match(rDestinations) : sString.match(rMainDestinations);

		if (!aMatches) {
			return Promise.resolve(sString); // no destinations to process
		}

		const sKey = aMatches[1];

		return this.getUrl(sKey)
			.then(function (sUrl) {
				return this._replaceUrl(sString, sKey, sUrl);
			}.bind(this));
	};

	/**
	 * @private
	 */
	Destinations.prototype._replaceUrl = function (sString, sKey, sUrl) {
		const sSanitizedUrl = sUrl.trim().replace(/\/$/, ""); // remove any trailing spaces and slashes

		if (this._sPrefix === "destinations") {
			return sString.replace("{{destinations." + sKey + "}}", sSanitizedUrl);
		}

		return sString.replace("{{mainDestinations." + sKey + "}}", sSanitizedUrl);
	};

	return Destinations;
});
