/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/base/util/merge",
	"sap/ui/core/Component",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/util/CancelError",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	_pick,
	merge,
	Component,
	InitialConnector,
	InitialUtils,
	Settings,
	CancelError,
	WriteUtils,
	TransportSelection,
	BaseConnector,
	Layer,
	Utils
) {
	"use strict";

	var ROUTES = {
		FLEX_INFO: "/flex/info/",
		PUBLISH: "/actions/make_changes_transportable/",
		CHANGES: "/changes/",
		CONDENSE: "/actions/condense/",
		VARIANTS: "/variants/",
		TOKEN: "/actions/getcsrftoken/",
		APPVARIANTS: "/appdescr_variants/",
		APPVARIANTS_OVERVIEW: "/app_variant_overview/",
		UI2PERSONALIZATION: "/ui2personalization/",
		CONTEXTS: "/flex/contexts/",
		VERSIONS: {
			GET: "/flex/versions/",
			ACTIVATE: "/flex/versions/activate/",
			DISCARD: "/flex/versions/draft/",
			PUBLISH: "/flex/versions/publish/"
		},
		CONTEXT_BASED_ADAPTATION: "/flex/apps/",
		MANI_FIRST_SUPPORTED: "/sap/bc/ui2/app_index/ui5_app_mani_first_supported",
		SEEN_FEATURES: "/seen_features/"
	};

	var ADAPTATIONS_SEGMENTATION = "/adaptations/";

	/**
	 * Write flex data into LRep back end or update an existing flex data stored in LRep back end
	 *
	 * @param {object} mPropertyBag Property bag
	 * @param {string} mPropertyBag.method POST for writing new data and PUT for update an existing data
	 * @param {object[]} [mPropertyBag.flexObjects] Objects to be written (i.e. change definitions, variant definitions etc.)
	 * @param {object} [mPropertyBag.flexObject] Object to be updated
	 * @param {string} mPropertyBag.url Configured url for the connector
	 * @param {string} [mPropertyBag.transport] The transport ID
	 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
	 * @param {boolean} [mPropertyBag.isAppVariant] Indicator whether this is an app variant
	 * @param {boolean} [mPropertyBag.isContextSharing] Indicator whether this is a request for context sharing
	 * @param {boolean} [mPropertyBag.skipIam=false] - Indicates whether the default IAM item creation and registration is skipped. This is S4/Hana specific flag passed by only Smart Business
	 * @param {boolean} [mPropertyBag.isCondensingEnabled] Indicator whether this is a request for condensing
	 * @param {boolean} [mPropertyBag.isContextBasedAdaptationEnabled] Indicator whether this is a context-based adaptation
	 * @param {boolean} [mPropertyBag.parentVersion] Indicates if changes should be written as a draft and on which version the changes should be based on
	 * @private
	 * @returns {Promise} Promise resolves as soon as the writing was completed
	 */
	var _doWrite = function(mPropertyBag) {
		var sRoute;
		if (mPropertyBag.isLegacyVariant) {
			sRoute = ROUTES.VARIANTS;
		} else if (mPropertyBag.isAppVariant) {
			sRoute = ROUTES.APPVARIANTS;
		} else if (mPropertyBag.isContextSharing) {
			sRoute = ROUTES.CONTEXTS;
		} else if (mPropertyBag.isCondensingEnabled) {
			sRoute = ROUTES.CONDENSE;
		} else if (mPropertyBag.isContextBasedAdaptationEnabled) {
			sRoute = ROUTES.CONTEXT_BASED_ADAPTATION + mPropertyBag.appId + ADAPTATIONS_SEGMENTATION;
		} else {
			sRoute = ROUTES.CHANGES;
		}
		var mParameters = mPropertyBag.transport ? { changelist: mPropertyBag.transport } : {};
		if (mPropertyBag.skipIam) {
			mParameters.skipIam = mPropertyBag.skipIam;
		}
		if (mPropertyBag.parentVersion) {
			mParameters.parentVersion = mPropertyBag.parentVersion;
		}
		if (mPropertyBag.parsedHash) {
			mParameters.parsedHash = JSON.stringify(mPropertyBag.parsedHash);
		}
		InitialUtils.addSAPLogonLanguageInfo(mParameters);
		InitialConnector._addClientInfo(mParameters);
		// single update --> fileName needs to be in the url
		if (mPropertyBag.flexObject && !mPropertyBag.isAppVariant) {
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
		}
		var sWriteUrl = InitialUtils.getUrl(sRoute, mPropertyBag, mParameters);
		delete mPropertyBag.reference;
		delete mPropertyBag.fileName;
		var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

		var oRequestOption = WriteUtils.getRequestOptions(
			InitialConnector,
			sTokenUrl,
			mPropertyBag.flexObjects || mPropertyBag.flexObject,
			"application/json; charset=utf-8", "json"
		);
		return WriteUtils.sendRequest(sWriteUrl, mPropertyBag.method, oRequestOption);
	};

	var _prepareAppVariantSpecificChange = function(oAppVariant) {
		// Only content in the VENDOR layer have the real ABAP package
		// This check avoid sending ATO package to get transport info
		var sPackage = oAppVariant.getDefinition().layer === Layer.VENDOR ? oAppVariant.getPackage() : "";
		return {
			"package": sPackage,
			namespace: oAppVariant.getNamespace(),
			name: oAppVariant.getDefinition().fileName,
			type: oAppVariant.getDefinition().fileType
		};
	};

	var _selectTransportForAppVariant = function(mPropertyBag) {
		var oTransportSelectionPromise;
		if (mPropertyBag.transport) {
			oTransportSelectionPromise = Promise.resolve({ transport: mPropertyBag.transport });
		} else if (mPropertyBag.isForSmartBusiness) {
			return Promise.resolve();
		} else {
			var oTransportInfo = _prepareAppVariantSpecificChange(mPropertyBag.appVariant);
			oTransportSelectionPromise = new TransportSelection().openTransportSelection(oTransportInfo);
		}
		return oTransportSelectionPromise.then(function(oTransportInfo) {
			if (oTransportInfo === "cancel") {
				return Promise.reject(new CancelError());
			}
			if (oTransportInfo && oTransportInfo.transport !== undefined) {
				return oTransportInfo.transport;
			}
			return Promise.reject(new Error("Transport information could not be determined"));
		});
	};

	function renameVersionNumberProperty(oVersion) {
		oVersion.version = oVersion.versionId;
		delete oVersion.versionId;
		return oVersion;
	}

	/**
	 * Connector for requesting data from an LRep-based back end.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.LrepConnector
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	return merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.LrepConnector */ {
		initialConnector: InitialConnector,
		layers: InitialConnector.layers,
		/**
		 * Resets flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.changelist Transport Id
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.changes Changes of the selected layer and flex reference
		 * @param {string} [mPropertyBag.generator] Generator with which the changes were created
		 * @param {string} [mPropertyBag.selectorIds] Selector IDs of controls for which the reset should filter (comma-separated list)
		 * @param {string} [mPropertyBag.changeTypes] Change types of the changes which should be reset (comma-separated list)
		 * @param {function(boolean):void} [mPropertyBag.setBusy] Optional callback invoked to request showing (<code>true</code>) or hiding (<code>false</code>) a busy indicator while the reset is running. Hidden during transport selection and re-shown afterwards.
		 * @returns {Promise} Promise resolves as soon as the reset has completed
		 */
		async reset(mPropertyBag) {
			mPropertyBag.setBusy?.(true);
			try {
				let aChanges = [];
				if (mPropertyBag.layer !== Layer.USER) {
					aChanges = mPropertyBag.changes;
					const oSettings = await Settings.getInstance();
					if (!oSettings.getIsProductiveSystem()) {
						mPropertyBag.setBusy?.(false);
						try {
							await new TransportSelection().setTransports(aChanges, Component.getComponentById(mPropertyBag.reference));
						} finally {
							mPropertyBag.setBusy?.(true);
						}
						// Make sure we include one request in case of mixed changes (local and transported)
						aChanges.some(function(oChange) {
							if (oChange.getRequest()) {
								mPropertyBag.changelist = oChange.getRequest();
								return true;
							}
							return false;
						});
					}
				}

				const aParameters = ["reference", "layer", "changelist", "generator"];
				const mParameters = _pick(mPropertyBag, aParameters);

				InitialConnector._addClientInfo(mParameters);

				if (mPropertyBag.selectorIds) {
					mParameters.selector = mPropertyBag.selectorIds;
				}
				if (mPropertyBag.changeTypes) {
					mParameters.changeType = mPropertyBag.changeTypes;
				}

				delete mPropertyBag.reference;
				const sResetUrl = InitialUtils.getUrl(ROUTES.CHANGES, mPropertyBag, mParameters);
				const sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);
				const oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					sTokenUrl
				);
				const oResponse = await WriteUtils.sendRequest(sResetUrl, "DELETE", oRequestOption);
				if (oResponse && oResponse.response) {
					oResponse.response.forEach(function(oContentId) {
						oContentId.fileName = oContentId.name;
						delete oContentId.name;
					});
				}
				return oResponse;
			} finally {
				mPropertyBag.setBusy?.(false);
			}
		},

		/**
		 * Publish flexibility files for a given application and layer.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {object} mPropertyBag.transportDialogSettings Settings for Transport dialog
		 * @param {object} mPropertyBag.transportDialogSettings.rootControl The root control of the running application
		 * @param {string} mPropertyBag.transportDialogSettings.styleClass Style class name to be added in the TransportDialog
		 * @param {string} mPropertyBag.layer Working layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.localChanges Local changes to  be published
		 * @param {object[]} [mPropertyBag.appVariantDescriptors] An array of app variant descriptors which needs to be transported
		 * @param {function(boolean):void} [mPropertyBag.setBusy] Optional callback invoked to request showing (<code>true</code>) or hiding (<code>false</code>) a busy indicator after transport selection.
		 * @returns {Promise} Resolves once all artifacts are successfully transported.
		 * Rejects with a {@link sap.ui.fl.util.CancelError} if the user cancelled the transport selection.
		 * Rejects with the originating error otherwise.
		 */
		async publish(mPropertyBag) {
			const oTransportSelection = new TransportSelection();
			const oTransportInfo = await oTransportSelection.openTransportSelection(
				null,
				mPropertyBag.transportDialogSettings.rootControl,
				mPropertyBag.transportDialogSettings.styleClass
			);
			if (!oTransportSelection.checkTransportInfo(oTransportInfo)) {
				throw new CancelError();
			}
			mPropertyBag.setBusy?.(true);
			try {
				return await oTransportSelection._prepareChangesForTransport(
					oTransportInfo,
					mPropertyBag.localChanges,
					mPropertyBag.appVariantDescriptors,
					{ reference: mPropertyBag.reference, layer: mPropertyBag.layer }
				);
			} finally {
				mPropertyBag.setBusy?.(false);
			}
		},

		/**
		 * Gets the flexibility info for a given application and layer.
		 * The flexibility info is a JSON string that has boolean properties 'isPublishEnabled' and 'isResetEnabled'
		 * that indicate if for the given application and layer a publish and reset shall be enabled, respectively
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer
		 * @param {string} mPropertyBag.reference Flex reference of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @returns {Promise} Promise resolves as soon as flex info has been retrieved
		 */
		getFlexInfo(mPropertyBag) {
			var aParameters = ["layer"];
			var mParameters = _pick(mPropertyBag, aParameters);

			InitialConnector._addClientInfo(mParameters);

			var sDataUrl = InitialUtils.getUrl(ROUTES.FLEX_INFO, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sDataUrl, "GET", { initialConnector: InitialConnector }).then(function(oResult) {
				return oResult.response;
			});
		},

		/**
		 * Gets the variant management context information.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.type Type of context, currently only 'role' is supported
		 * @param {string} [mPropertyBag.$skip] Offset for paginated request
		 * @param {string} [mPropertyBag.$filter] Filters full raw data
		 * @returns {Promise<object>} Promise resolves as soon as context has been retrieved
		 */
		getContexts(mPropertyBag) {
			var aParameters = ["type", "$skip", "$filter"];
			var mParameters = _pick(mPropertyBag, aParameters);

			InitialConnector._addClientInfo(mParameters);

			var sContextsUrl = InitialUtils.getUrl(ROUTES.CONTEXTS, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sContextsUrl, "GET", { initialConnector: InitialConnector }).then(function(oResult) {
				return oResult.response;
			});
		},

		/**
		 * Loads the variant management context description in the correct language based on the browser configuration.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.flexObjects Payload for the post request
		 * @returns {Promise<object>} Promise resolves as soon as context descriptions have been retrieved
		 */
		loadContextDescriptions(mPropertyBag) {
			mPropertyBag.method = "POST";
			mPropertyBag.isContextSharing = true;
			return _doWrite(mPropertyBag).then(function(oResult) {
				return oResult.response;
			});
		},

		/**
		 * Gets the seen feature ids from the LRep backend.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @returns {Promise<string[]>} Promise resolves with an array of the seen feature ids
		 */
		async getSeenFeatureIds(mPropertyBag) {
			const mParameters = {};
			InitialConnector._addClientInfo(mParameters);
			const sUrl = InitialUtils.getUrl(ROUTES.SEEN_FEATURES, mPropertyBag, mParameters);
			const oResult = await InitialUtils.sendRequest(sUrl, "GET", { initialConnector: InitialConnector });
			// The ABAP backend returns an empty string if no seen feature ids are available instead of { seenFeatureIds: [] }
			return oResult.response?.seenFeatureIds || [];
		},

		/**
		 * Writes the seen feature ids into the LRep backend.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.seenFeatureIds List of feature ids that have been seen
		 * @returns {Promise<string[]>} Promise resolves with an array of the seen feature ids
		 */
		async setSeenFeatureIds(mPropertyBag) {
			const mPayload = {
				seenFeatureIds: mPropertyBag.seenFeatureIds
			};
			const mParameters = {};
			InitialConnector._addClientInfo(mParameters);
			const sUrl = InitialUtils.getUrl(ROUTES.SEEN_FEATURES, mPropertyBag, mParameters);
			const sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);
			const oRequestOptions = WriteUtils.getRequestOptions(
				InitialConnector,
				sTokenUrl,
				mPayload,
				"application/json; charset=utf-8",
				"json"
			);
			const oResult = await WriteUtils.sendRequest(sUrl, "PUT", oRequestOptions);
			return oResult.response?.seenFeatureIds;
		},

		/**
		 * Write flex data into LRep back end; This method is called with a list of entities like changes, variants,
		 * control variants, variant changes and variant management changes.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object[]} mPropertyBag.flexObjects Objects to be written (i.e. change definitions, variant definitions etc.)
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		write(mPropertyBag) {
			mPropertyBag.method = "POST";
			return _doWrite(mPropertyBag);
		},

		/**
		 * Write flex data into LRep back end; This function splits the condense format by namespaces.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObjects Map of condensed changes
		 * @param {object} mPropertyBag.allChanges Original set of changes
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {boolean} [mPropertyBag.isLegacyVariant] Whether the new flex data has file type .variant or not
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		condense(mPropertyBag) {
			const oFlexObjects = mPropertyBag.flexObjects;
			const oNamespaceMap = {};

			// Helper to process each change and add it to the correct namespace/action
			function processChange(sAction, sNamespace, sFileType, sFileName, oChange) {
				// Ensure the namespace object exists
				oNamespaceMap[sNamespace] ||= {
					namespace: sNamespace,
					layer: oFlexObjects.layer
				};

				oNamespaceMap[sNamespace][sAction] ||= {};
				oNamespaceMap[sNamespace][sAction][sFileType] ||= [];

				// For 'delete' and 'reorder', just add the file name
				if (sAction === "delete" || sAction === "reorder") {
					oNamespaceMap[sNamespace][sAction][sFileType].push(sFileName);
				} else {
					// For 'create' and 'update', add the full change object
					oNamespaceMap[sNamespace][sAction][sFileType].push({
						[sFileName]: oChange[sFileName] || oChange
					});
				}
			}

			// Loop through flexObjects to organize changes by namespace
			["create", "reorder", "update", "delete"].forEach((sAction) => {
				const oChangesByAction = oFlexObjects[sAction];

				if (oChangesByAction) {
					Object.keys(oChangesByAction).forEach((sFileType) => {
						oChangesByAction[sFileType].forEach((oChange) => {
							const sFileName = oChange.fileName || (typeof oChange === "object" ? Object.keys(oChange)[0] : oChange);
							var sNamespace = oChange[sFileName]?.namespace || oChange[sFileType]?.namespace;

							// If namespace is missing, fallback to allChanges to resolve it
							if (!sNamespace) {
								const oMatchingChange = mPropertyBag.allChanges.find((oChangeItem) => oChangeItem.getId() === sFileName);
								sNamespace = oMatchingChange ? oMatchingChange.getNamespace() : undefined;
							}

							// Ensure we have a valid namespace and process the change
							if (sNamespace) {
								processChange(sAction, sNamespace, sFileType, sFileName, oChange);
							}
						});
					});
				}
			});

			mPropertyBag.flexObjects = Object.values(oNamespaceMap);
			mPropertyBag.method = "POST";
			mPropertyBag.isCondensingEnabled = true;

			return _doWrite(mPropertyBag);
		},

		/**
		 * Update an existing flex data stored in LRep back end.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be updated
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @returns {Promise} Resolves as soon as the writing is completed without data
		 */
		update(mPropertyBag) {
			if (mPropertyBag.flexObject.fileType === "variant") {
				mPropertyBag.isLegacyVariant = true;
			}
			mPropertyBag.method = "PUT";
			return _doWrite(mPropertyBag);
		},

		/**
		 * Delete an existing flex data stored in LRep back end.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {object} mPropertyBag.flexObject Flex Object to be deleted
		 * @param {string} [mPropertyBag.transport] The transport ID
		 * @param {string} [mPropertyBag.parentVersion]  Indicates if changes should be written as a draft and on which version the changes should be based on
		 * @param {string} [mPropertyBag.url] Configured url for the connector
		 * @returns {Promise} Resolves as soon as the deletion is completed without data
		 */
		remove(mPropertyBag) {
			var mParameters = {
				namespace: mPropertyBag.flexObject.namespace,
				layer: mPropertyBag.flexObject.layer
			};
			if (mPropertyBag.transport) {
				mParameters.changelist = mPropertyBag.transport;
			}
			if (mPropertyBag.parentVersion) {
				mParameters.parentVersion = mPropertyBag.parentVersion;
			}
			InitialConnector._addClientInfo(mParameters);
			mPropertyBag.fileName = mPropertyBag.flexObject.fileName;
			var sRoute = mPropertyBag.flexObject.fileType === "variant" ? ROUTES.VARIANTS : ROUTES.CHANGES;
			var sDeleteUrl = InitialUtils.getUrl(sRoute, mPropertyBag, mParameters);
			// decode url before sending to ABAP back end which does not expect encoded special character such as "/" in the namespace
			sDeleteUrl = decodeURIComponent(sDeleteUrl);
			delete mPropertyBag.fileName;
			var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

			var oRequestOption = WriteUtils.getRequestOptions(
				InitialConnector,
				sTokenUrl,
				undefined,
				"application/json; charset=utf-8", "json"
			);
			return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
		},
		appVariant: {
			getManifirstSupport(mPropertyBag) {
				var sManifirstUrl = `${ROUTES.MANI_FIRST_SUPPORTED}/?id=${mPropertyBag.appId}`;
				return InitialUtils.sendRequest(sManifirstUrl, "GET", { initialConnector: InitialConnector }).then(function(oResponse) {
					return oResponse.response;
				});
			},
			getManifest(mPropertyBag) {
				var sAppVariantManifestUrl = mPropertyBag.appVarUrl;
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					Utils.getLrepUrl() + ROUTES.TOKEN,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sAppVariantManifestUrl, "GET", oRequestOption);
			},
			load(mPropertyBag) {
				var sAppVariantUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag);
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					Utils.getLrepUrl() + ROUTES.TOKEN,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sAppVariantUrl, "GET", oRequestOption);
			},
			create(mPropertyBag) {
				mPropertyBag.method = "POST";
				mPropertyBag.isAppVariant = true;
				return _doWrite(mPropertyBag);
			},
			assignCatalogs(mPropertyBag) {
				var mParameters = {};
				mParameters.action = mPropertyBag.action;
				delete mPropertyBag.action;
				mParameters.assignFromAppId = mPropertyBag.assignFromAppId;
				delete mPropertyBag.assignFromAppId;

				var sCatalogAssignmentUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
				delete mPropertyBag.reference;
				var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					sTokenUrl,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sCatalogAssignmentUrl, "POST", oRequestOption);
			},
			unassignCatalogs(mPropertyBag) {
				var mParameters = {};
				mParameters.action = mPropertyBag.action;
				delete mPropertyBag.action;

				var sCatalogUnAssignmentUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
				delete mPropertyBag.reference;
				var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					sTokenUrl,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sCatalogUnAssignmentUrl, "POST", oRequestOption);
			},
			update(mPropertyBag) {
				return _selectTransportForAppVariant(mPropertyBag).then(function(sTransport) {
					if (sTransport) {
						mPropertyBag.transport = sTransport;
					}
					delete mPropertyBag.isForSmartBusiness;
					mPropertyBag.method = "PUT";
					mPropertyBag.isAppVariant = true;
					return _doWrite(mPropertyBag);
				});
			},
			remove(mPropertyBag) {
				return _selectTransportForAppVariant(mPropertyBag).then(function(sTransport) {
					var mParameters = {};
					if (sTransport) {
						mParameters.changelist = sTransport;
					}
					delete mPropertyBag.isForSmartBusiness;
					var sDeleteUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS, mPropertyBag, mParameters);
					delete mPropertyBag.reference;
					var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag);

					var oRequestOption = WriteUtils.getRequestOptions(
						InitialConnector,
						sTokenUrl,
						undefined,
						"application/json; charset=utf-8", "json"
					);
					return WriteUtils.sendRequest(sDeleteUrl, "DELETE", oRequestOption);
				});
			},
			list(mPropertyBag) {
				var mParameters = {};

				mParameters.layer = mPropertyBag.layer;
				mParameters["sap.app/id"] = mPropertyBag.reference;

				delete mPropertyBag.layer;
				delete mPropertyBag.reference;

				var sAppVarOverviewUrl = InitialUtils.getUrl(ROUTES.APPVARIANTS_OVERVIEW, mPropertyBag, mParameters);

				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					undefined,
					undefined,
					"application/json; charset=utf-8", "json"
				);
				return WriteUtils.sendRequest(sAppVarOverviewUrl, "GET", oRequestOption);
			}
		},
		contextBasedAdaptation: {
			create(mPropertyBag) {
				mPropertyBag.isContextBasedAdaptationEnabled = true;
				mPropertyBag.method = "POST";
				return _doWrite(mPropertyBag);
			},
			reorder(mPropertyBag) {
				mPropertyBag.isContextBasedAdaptationEnabled = true;
				mPropertyBag.method = "PUT";
				return _doWrite(mPropertyBag);
			},
			update(mPropertyBag) {
				mPropertyBag.isContextBasedAdaptationEnabled = true;
				mPropertyBag.method = "PUT";
				mPropertyBag.reference = mPropertyBag.adaptationId;
				return _doWrite(mPropertyBag);
			},
			load(mPropertyBag) {
				var aParameters = ["version"];
				var mParameters = _pick(mPropertyBag, aParameters);
				InitialConnector._addClientInfo(mParameters);
				mPropertyBag.reference = mPropertyBag.appId + ADAPTATIONS_SEGMENTATION;
				var sDataUrl = InitialUtils.getUrl(ROUTES.CONTEXT_BASED_ADAPTATION, mPropertyBag, mParameters);
				return InitialUtils.sendRequest(sDataUrl, "GET", { initialConnector: InitialConnector }).then(function(oResult) {
					return oResult.response;
				});
			},
			remove(mPropertyBag) {
				mPropertyBag.isContextBasedAdaptationEnabled = true;
				mPropertyBag.method = "DELETE";
				mPropertyBag.reference = mPropertyBag.adaptationId;
				return _doWrite(mPropertyBag);
			}
		},
		ui2Personalization: {
			create(mPropertyBag) {
				mPropertyBag.initialConnector = this.initialConnector;
				var sPrefix = Utils.getLrepUrl();
				var oRequestOptions = WriteUtils.getRequestOptions(
					InitialConnector,
					sPrefix + ROUTES.TOKEN,
					mPropertyBag.flexObjects || mPropertyBag.flexObject,
					"application/json; charset=utf-8", "json"
				);
				var sUrl = sPrefix + ROUTES.UI2PERSONALIZATION;
				return WriteUtils.sendRequest(sUrl, "PUT", oRequestOptions);
			},
			remove(mPropertyBag) {
				mPropertyBag.initialConnector = this.initialConnector;
				var sUrl = InitialUtils.getUrl(ROUTES.UI2PERSONALIZATION, {
					url: Utils.getLrepUrl()
				}, {
					reference: mPropertyBag.reference,
					containerkey: mPropertyBag.containerKey,
					itemname: mPropertyBag.itemName
				});
				return WriteUtils.sendRequest(sUrl, "DELETE");
			}
		},
		versions: {
			load(mPropertyBag) {
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag)
				);
				var mParameters = {};
				InitialUtils.addSAPLogonLanguageInfo(mParameters);
				mParameters.limit = mPropertyBag.limit;
				var sVersionsUrl = InitialUtils.getUrl(ROUTES.VERSIONS.GET, mPropertyBag, mParameters);
				return WriteUtils.sendRequest(sVersionsUrl, "GET", oRequestOption).then(function(oResult) {
					return oResult.response.versions.map(function(oVersion) {
						return renameVersionNumberProperty(oVersion);
					});
				});
			},
			activate(mPropertyBag) {
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag),
					{ title: mPropertyBag.title },
					"application/json; charset=utf-8",
					"json"
				);
				var mParameters = { version: mPropertyBag.version };
				InitialUtils.addSAPLogonLanguageInfo(mParameters);
				var sVersionsUrl = InitialUtils.getUrl(ROUTES.VERSIONS.ACTIVATE, mPropertyBag, mParameters);
				return WriteUtils.sendRequest(sVersionsUrl, "POST", oRequestOption).then(function(oResult) {
					var oVersion = oResult.response;
					return renameVersionNumberProperty(oVersion);
				});
			},
			discardDraft(mPropertyBag) {
				var oRequestOption = WriteUtils.getRequestOptions(
					InitialConnector,
					InitialUtils.getUrl(ROUTES.TOKEN, mPropertyBag)
				);
				var sVersionsUrl = InitialUtils.getUrl(ROUTES.VERSIONS.DISCARD, mPropertyBag);
				return WriteUtils.sendRequest(sVersionsUrl, "DELETE", oRequestOption);
			},
			publish(mPropertyBag) {
				var oTransportSelection = new TransportSelection();
				return oTransportSelection.openTransportSelection(null, mPropertyBag.rootControl, mPropertyBag.styleClass, false)
				.then(function(oTransportInfo) {
					if (oTransportSelection.checkTransportInfo(oTransportInfo)) {
						if (!oTransportInfo.transport) {
							return Promise.reject(new Error("no transport provided as attribute of mParameters"));
						}
						if (!mPropertyBag.reference) {
							return Promise.reject(new Error("no reference provided as attribute of mParameters"));
						}
						if (!mPropertyBag.version) {
							return Promise.reject(new Error("no version provided as attribute of mParameters"));
						}

						mPropertyBag.setBusy?.(true);

						var mParameters = {
							transport: oTransportInfo.transport,
							version: mPropertyBag.version
						};

						var sUrl = InitialUtils.getUrl(ROUTES.VERSIONS.PUBLISH, {
							url: Utils.getLrepUrl(),
							reference: mPropertyBag.reference
						}, mParameters);
						var sTokenUrl = InitialUtils.getUrl(ROUTES.TOKEN, { url: Utils.getLrepUrl() });

						var oRequestOption = WriteUtils.getRequestOptions(
							InitialConnector,
							sTokenUrl,
							undefined,
							"application/json; charset=utf-8", "json"
						);
						return WriteUtils.sendRequest(sUrl, "POST", oRequestOption)
						.finally(function() {
							mPropertyBag.setBusy?.(false);
						});
					}
					throw new CancelError();
				});
			}
		}
	});
});
