/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/api/FrontendActionsAPI"
], function(
	FrontendActionsAPI
) {
	"use strict";

	/**
	 * Browser-side API for test automation interacting with RTA.
	 *
	 * The RTA actions delegate to {@link sap.ui.rta.api.FrontendActionsAPI} — the single source of
	 * truth for the RTA lifecycle (start, save, reload, activate, stop) — rather than reimplementing
	 * that logic or hardcoding RTA selectors, fragment prefixes or internal control IDs. When RTA
	 * internals change, only <code>FrontendActionsAPI</code> changes and these tests keep working.
	 *
	 * These actions drive RTA programmatically to reach a state so a scenario can run; they are
	 * prerequisite helpers and do not assert that each step is reachable by an end user.
	 *
	 * @namespace sap.ui.rta.testing.TestAutomationAPI
	 * @since 1.155
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta test automation
	 */
	const TestAutomationAPI = {};

	/**
	 * Unwraps a {@link sap.ui.rta.util.ai.FrontendActionResult} into a plain promise result: resolves
	 * with its payload on success, rejects with an <code>Error</code> carrying the error details on
	 * failure. This turns the FrontendActionsAPI envelope contract into the normal resolve/reject
	 * contract that a test runner's <code>evaluate()</code> expects.
	 *
	 * @param {Promise<sap.ui.rta.util.ai.FrontendActionResult>} pResult - The FrontendActionsAPI call result
	 * @returns {Promise<*>} Resolves with the payload, or rejects with the failure message
	 */
	async function unwrap(pResult) {
		const oResult = await pResult;
		if (oResult && oResult.isSuccess) {
			return oResult.payload;
		}
		const sMessage = (oResult && oResult.error && oResult.error.message)
			|| "unknown FrontendActionsAPI failure";
		const sCode = oResult && oResult.error && oResult.error.code;
		throw new Error(`TestAutomationAPI: ${sMessage}${sCode ? ` (${sCode})` : ""}`);
	}

	/**
	 * Enters UI Adaptation mode by starting RTA via
	 * {@link sap.ui.rta.api.FrontendActionsAPI.startRTA} (adopting an already-running instance if one
	 * exists). The underlying call awaits the full start lifecycle, including the toolbar being shown.
	 *
	 * Installs the {@link sap.ui.rta.api.FrontendActionsAPI.NoopStatusReporter} first so that starting RTA
	 * does <b>not</b> paint the AI "agent is working" visualization overlay. That overlay gates input over
	 * the whole viewport until RTA stops, which would make the app's controls (and RTA overlays)
	 * unclickable for a test. The AI visualization is meant for an AI driver, not for tests.
	 * Starts RTA directly; does not exercise the FLP "Adapt UI" shell entry.
	 *
	 * @returns {Promise<void>} Resolves once RTA is running
	 */
	TestAutomationAPI.enterAdaptationMode = function() {
		// Suppress the AI visualization/input-gating overlay BEFORE startRTA fires its first setStatus.
		FrontendActionsAPI.setStatusReporter(FrontendActionsAPI.NoopStatusReporter);
		return unwrap(FrontendActionsAPI.startRTA());
	};

	/**
	 * Saves the current draft changes via {@link sap.ui.rta.api.FrontendActionsAPI.saveChanges}.
	 *
	 * @returns {Promise<void>} Resolves once the changes are saved
	 */
	TestAutomationAPI.save = function() {
		return unwrap(FrontendActionsAPI.saveChanges());
	};

	/**
	 * Waits for any pending RTA command execution to complete before proceeding.
	 * Call this after UI interactions (rename dialogs, context menu actions) and before save,
	 * to ensure the command stack is fully populated.
	 * @returns {Promise<void>}
	 */
	TestAutomationAPI.waitForPendingActions = function() {
		return unwrap(FrontendActionsAPI.waitForPendingActions());
	};

	/**
	 * Waits for both RTA's pending actions and the last element-modification outcome to settle.
	 * Call this after UI interactions that trigger async command creation (e.g. rename dialogs)
	 * and before save, to ensure the command stack is fully populated.
	 * @returns {Promise<void>}
	 */
	TestAutomationAPI.waitForCommandExecutionResult = function() {
		return unwrap(FrontendActionsAPI.waitForCommandExecutionResult());
	};

	/**
	 * Saves and activates a new version via
	 * {@link sap.ui.rta.api.FrontendActionsAPI.saveAndActivateChanges}.
	 * Bypasses UI reachability checks for the version flow.
	 *
	 * @param {string} sTitle - The version title to activate with (must be non-empty)
	 * @returns {Promise<void>} Resolves once the version is activated
	 */
	TestAutomationAPI.activateVersion = function(sTitle) {
		return unwrap(FrontendActionsAPI.saveAndActivateChanges({ title: sTitle }));
	};

	/**
	 * For app-descriptor changes that require a hard reload: saves and reloads the app via
	 * {@link sap.ui.rta.api.FrontendActionsAPI.saveAndReloadApp} (a no-op if no reload is needed).
	 *
	 * Because this triggers a full page reload, the <code>evaluate()</code> call that invoked this method
	 * is torn down by the navigation — the consumer <b>must</b> coordinate the navigation wait on
	 * the test side and call {@link #enterAdaptationMode} plus {@link #activateVersion} in separate
	 * <code>evaluate()</code> calls after the reload completes.
	 *
	 * Note: RTA must have been started via {@link sap.ui.rta.api.FrontendActionsAPI.startRTA} so that
	 * it runs in non-interactive mode and the save does not block on an open dialog.
	 *
	 * @returns {Promise<void>} Resolves once the save+reload is triggered (may not complete if the
	 *   page navigates mid-promise)
	 */
	TestAutomationAPI.saveAndReload = function() {
		return unwrap(FrontendActionsAPI.saveAndReloadApp());
	};

	/**
	 * Exits the running RTA session via {@link sap.ui.rta.api.FrontendActionsAPI.stopRTA}, which stops
	 * RTA the same way the toolbar Exit action does (prompting to save unsaved changes where applicable).
	 * May trigger a reload in some app configurations; coordinate the navigation wait on the test side
	 * when that applies.
	 *
	 * @returns {Promise<void>} Resolves once RTA has stopped
	 */
	TestAutomationAPI.exitRTA = function() {
		return unwrap(FrontendActionsAPI.stopRTA());
	};

	return TestAutomationAPI;
});
