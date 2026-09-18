/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils"
], function(
	merge,
	Lib,
	ControlVariantApplyAPI,
	FlexRuntimeInfoAPI,
	InitialFlexAPI,
	ReloadInfoAPI,
	VersionsAPI,
	Layer,
	FlUtils,
	Utils
) {
	"use strict";

	/**
	 * Static class to handle all the reload related functionality for UI Adaptation
	 *
	 * @class
	 * @namespace sap.ui.rta.util.ReloadManager
	 * @alias sap.ui.rta.util.ReloadManager
	 * @since 1.104
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const ReloadManager = {};

	let mUShellServices = {};

	/**
	 * Collects the message keys for all reload reasons that apply to the given reload info. Unlike a
	 * first-match selection, every applicable reason is returned so that the reload dialog can list them
	 * all in its expandable details section.
	 *
	 * @param {object} oReloadInfo - Information about why a reload happens (see ReloadInfoAPI)
	 * @param {boolean} bExit - Whether RTA is being left (<code>true</code>) or started (<code>false</code>)
	 * @returns {string[]} The message bundle keys of all applicable reload reasons
	 */
	ReloadManager.getReloadReasons = function(oReloadInfo, bExit) {
		const aReasons = [];
		const bIsCustomerLayer = oReloadInfo.layer === Layer.CUSTOMER;

		// Removed non-favorite variants are higher layer changes that are not yet part of the lazy-loaded
		// flex data, so hasHigherLayerChanges only becomes detectable after the data-fetching reload. Both
		// reasons therefore map to the same "personalization" reason so the listed reasons stay stable
		// across open/close cycles.
		if (oReloadInfo.hasHigherLayerChanges || oReloadInfo.hasRemovedNonFavoriteVariants) {
			if (bExit && bIsCustomerLayer) {
				aReasons.push("MSG_RELOAD_REASON_EXIT_PERSONALIZATION_CUSTOMER");
			} else if (bExit) {
				aReasons.push("MSG_RELOAD_REASON_EXIT_PERSONALIZATION");
			} else if (bIsCustomerLayer) {
				aReasons.push("MSG_RELOAD_REASON_START_PERSONALIZATION_CUSTOMER");
			} else {
				aReasons.push("MSG_RELOAD_REASON_START_PERSONALIZATION");
			}
		}
		if (oReloadInfo.isDraftAvailable) {
			aReasons.push(bExit ? "MSG_RELOAD_REASON_EXIT_DRAFT" : "MSG_RELOAD_REASON_START_DRAFT");
		}
		if (oReloadInfo.allContexts) {
			aReasons.push(bExit ? "MSG_RELOAD_REASON_EXIT_RESTRICTED_CONTEXT" : "MSG_RELOAD_REASON_START_RESTRICTED_CONTEXT");
		}
		if (bExit) {
			if (oReloadInfo.changesNeedReload) {
				aReasons.push("MSG_RELOAD_REASON_EXIT_CHANGES_NEED_RELOAD");
			}
			if (oReloadInfo.initialDraftGotActivated || oReloadInfo.activeVersionNotSelected) {
				aReasons.push("MSG_RELOAD_REASON_EXIT_ACTIVATED_VERSION");
			}
			if (oReloadInfo.switchEndUserAdaptation) {
				aReasons.push("MSG_RELOAD_REASON_EXIT_CONTEXT_BASED_ADAPTATION");
			}
		}
		return aReasons;
	};

	function buildReasonsDetails(aReasonKeys) {
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
		const sListItems = aReasonKeys.map(function(sReasonKey) {
			return `<li>${oResourceBundle.getText(sReasonKey)}</li>`;
		}).join("");
		return `<ul>${sListItems}</ul>`;
	}

	async function showReloadMessageBox(aReasonKeys) {
		// A single reason is shown directly as the dialog's main text. Only when several reasons apply
		// do we fall back to a generic message plus a collapsible details list, so the user is not
		// forced to expand a section just to read one reason.
		if (aReasonKeys.length === 1) {
			const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
			await Utils.showMessageBox("information", "MSG_RELOAD_SINGLE_REASON", {
				titleKey: "HEADER_RELOAD_NEEDED",
				messageArgs: [oResourceBundle.getText(aReasonKeys[0])]
			});
			return;
		}
		await Utils.showMessageBox("information", "MSG_RELOAD_GENERIC", {
			titleKey: "HEADER_RELOAD_NEEDED",
			details: buildReasonsDetails(aReasonKeys)
		});
	}

	async function handleReloadMessageBoxOnExit(oReloadInfo) {
		const aReasons = ReloadManager.getReloadReasons(oReloadInfo, true);

		if (aReasons.length) {
			await showReloadMessageBox(aReasons);
		}
	}

	async function triggerReloadOnStart(oReloadInfo) {
		if (mUShellServices.Navigation && oReloadInfo.versioningEnabled) {
			// clears FlexState and triggers reloading of the flex data without blocking
			if (oReloadInfo.isDraftAvailable) {
				await VersionsAPI.loadDraftForApplication({
					control: oReloadInfo.selector,
					layer: oReloadInfo.layer,
					allContexts: oReloadInfo.allContexts,
					adaptationId: oReloadInfo.adaptationId
				});
			} else {
				await VersionsAPI.loadVersionForApplication({
					control: oReloadInfo.selector,
					layer: oReloadInfo.layer,
					allContexts: oReloadInfo.allContexts,
					adaptationId: oReloadInfo.adaptationId
				});
			}
		}
		// showing messages in visual editor is leading to blocked screen. In this case we should reload without message
		if (!oReloadInfo.developerMode) {
			await showReloadMessageBox(ReloadManager.getReloadReasons(oReloadInfo, false));
		}
		ReloadManager.enableAutomaticStart(oReloadInfo.layer, oReloadInfo.selector);
		oReloadInfo.onStart = true;
		await ReloadManager.triggerReload(oReloadInfo);
		return true;
	}

	ReloadManager.setUShellServices = function(mPassedUShellServices) {
		mUShellServices = mPassedUShellServices;
	};

	/**
	 * Enables automatic key user adaptation start.
	 *
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 * @param {sap.ui.core.Control} oRootControl - Root control for which key user adaptation was started
	 */
	ReloadManager.enableAutomaticStart = function(sLayer, oRootControl) {
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: oRootControl });
		const vParameter = sFlexReference || true;
		window.sessionStorage.setItem(`sap.ui.rta.restart.${sLayer}`, vParameter);
	};

	/**
	 * Disable automatic key user adaptation start
	 *
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 */
	ReloadManager.disableAutomaticStart = function(sLayer) {
		window.sessionStorage.removeItem(`sap.ui.rta.restart.${sLayer}`);
	};

	/**
	 * Triggers the reload of the page. Can either be a soft reload inside the FLP or a hard reload.
	 *
	 * @param {object} oReloadInfo - Information needed for the reload
	 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
	 * @param {boolean} oReloadInfo.ignoreMaxLayerParameter - Indicates if the max layer parameter should be ignored
	 * @param {string} oReloadInfo.versionSwitch - Indicates if we are in a version switch scenario
	 * @param {string} oReloadInfo.version - Version we want to switch to
	 * @param {string} oReloadInfo.removeVersionParameter - Indicates if version parameter should be removed
	 * @param {string} oReloadInfo.removeDraft - Indicates if draft parameter should be removed
	 */
	ReloadManager.triggerReload = async function(oReloadInfo) {
		if (oReloadInfo.onStart) {
			ReloadInfoAPI.handleReloadInfoOnStart(oReloadInfo);
		} else {
			ReloadInfoAPI.handleReloadInfo(oReloadInfo);
		}
		// In design-time mode all variant data is loaded eagerly, so any
		// sap-ui-fl-control-variant-id parameter in the URL is irrelevant and
		// would otherwise trigger spurious lazy-load requests on the next
		// initialization. Clear it before the reload happens.
		await ControlVariantApplyAPI.clearVariantParameterInURL();
		if (FlUtils.getUshellContainer()) {
			mUShellServices.AppLifeCycle.reloadCurrentApp();
		} else {
			ReloadManager.reloadPage();
		}
	};

	/**
	 * Reloads the page via the browsers window object.
	 */
	ReloadManager.reloadPage = function() {
		window.location.reload();
	};

	/**
	 * Sets the given parameters as <code>document.location.search</code> which will trigger a browser reload.
	 * @param {string} sParameters - URL parameters
	 */
	ReloadManager.setUriParameters = function(sParameters) {
		document.location.search = sParameters;
	};

	/**
	 * Checks if there are personalization changes/draft changes and restarts the application without/with them.
	 * Warns the user that the application will be restarted without personalization / with draft changes.
	 * Checks if it is necessary to load all contexts.
	 * @param {object} mProperties - Object with additional information
	 * @param {sap.ui.fl.Layer} mProperties.layer - Current layer
	 * @param {sap.ui.fl.Selector} mProperties.selector - Root control
	 * @param {boolean} mProperties.versioningEnabled - Whether versioning is enabled
	 * @param {boolean} mProperties.developerMode - Whether the developer mode is set
	 * @param {string} mProperties.adaptationId - Context-based adaptation ID of the currently displayed adaptation
	 *
	 * @return {Promise<boolean>} Resolving to <code>false</code> means that reload is not necessary
	 */
	ReloadManager.handleReloadOnStart = async function(mProperties) {
		// if RTA is already starting after a reload, all checks have already been done
		if (!InitialFlexAPI.isAutomaticRtaStartEnabled(mProperties.layer)) {
			merge(mProperties, {
				ignoreMaxLayerParameter: false,
				includeCtrlVariants: true
			});
			const oReloadInfo = await ReloadInfoAPI.getReloadReasonsForStart(mProperties);
			if (
				oReloadInfo.hasHigherLayerChanges
				|| oReloadInfo.isDraftAvailable
				|| oReloadInfo.allContexts
				|| oReloadInfo.hasRemovedNonFavoriteVariants
			) {
				return triggerReloadOnStart(merge(mProperties, oReloadInfo));
			}
		}
		return undefined;
	};

	/**
	 * When exiting key user adaptation and personalization changes exist, the user can choose to
	 * reload the app with personalization or stay in the app without the personalization.
	 * @param {object} mProperties - Object with additional information
	 * @param {sap.ui.fl.Layer} mProperties.layer - Current layer
	 * @param {sap.ui.fl.Selector} mProperties.selector - Root control
	 * @param {boolean} mProperties.versioningEnabled - Whether versioning is enabled
	 * @param {boolean} mProperties.isDraftAvailable - Whether a draft is available
	 * @param {boolean} mProperties.activeVersion - Number of the active version
	 * @param {Promise} mProperties.changesNeedReloadPromise - Resolves to whether any change needs a reload
	 * @param {boolean} bSkipRestart - Stop key user adaptation without reloading the app in any way
	 *
	 * @return {Promise<object>} Resolving to an object containing information about whether a reload is needed and how to handle it
	 */
	ReloadManager.checkReloadOnExit = async function(mProperties) {
		const bChangesNeedReload = await mProperties.changesNeedReloadPromise;
		mProperties.changesNeedReload = bChangesNeedReload;
		const oReloadInfo = ReloadInfoAPI.getReloadInfo(mProperties);
		await handleReloadMessageBoxOnExit(oReloadInfo);
		return oReloadInfo;
	};

	/**
	 * Reloads the app inside FLP or standalone by removing max layer / draft parameter;
	 *
	 * @param {object} oReloadInfo - Information needed for the reload
	 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
	 */
	ReloadManager.handleReloadOnExit = async function(oReloadInfo) {
		if (oReloadInfo.reloadNeeded) {
			oReloadInfo.removeVersionParameter = true;
			await ReloadManager.triggerReload(oReloadInfo);
		}
	};

	return ReloadManager;
});