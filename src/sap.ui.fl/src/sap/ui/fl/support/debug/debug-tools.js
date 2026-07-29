/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/support/debug/UI5Debug",
	"sap/ui/fl/support/api/SupportAPI"
], function(UI5Debug, SupportAPI) {
	"use strict";

	// scope() is a helper function to create a clean empty object without a prototype chain (see tip below)
	const { scope } = UI5Debug;

	return {
		// Help entries shown by "ui5.help()"
		__help: [
			{ cmd: "ui5.flexFl.getApplicationComponent()", text: "Get the current application component" },
			{ cmd: "ui5.flexFl.getFlexSettings()", text: "Get the flexibility settings of the current application" },
			{ cmd: "ui5.flexFl.getAllUIChanges()", text: "Get all UI changes of the current application" },
			{ cmd: "ui5.flexFl.getFlexObjectInfos()", text: "Get information about all flex objects of the current application" },
			{ cmd: "ui5.flexFl.getChangeDependencies()", text: "Get the change dependencies of the current application" }
		],

		// Tools are merged into the global "ui5" object under a dedicated "fl" sub-namespace
		// to avoid name clashes with the base tools or other libraries
		// Tools are merged into the global "ui5" object under a dedicated "flexFl" sub-namespace
		// to avoid name clashes with the base tools or other libraries
		flexFl: scope({
			/**
			 * Retrieves the current application component.
			 * @returns {Promise<sap.ui.core.Component|undefined>} The application component, or undefined if not found
			 */
			getApplicationComponent() {
				return SupportAPI.getApplicationComponent();
			},

			/**
			 * Retrieves the flexibility settings of the current application.
			 * @returns {Promise<object>} Flex settings information
			 */
			getFlexSettings() {
				return SupportAPI.getFlexSettings();
			},

			/**
			 * Retrieves all UI changes of the current application.
			 * @returns {Promise<Array>} Array of all UI changes
			 */
			getAllUIChanges() {
				return SupportAPI.getAllUIChanges();
			},

			/**
			 * Retrieves information about all flex objects of the current application.
			 * @returns {Promise<object>} Flex object information
			 */
			getFlexObjectInfos() {
				return SupportAPI.getFlexObjectInfos();
			},

			/**
			 * Retrieves the change dependencies of the current application.
			 * @returns {Promise<object>} Change dependencies information
			 */
			getChangeDependencies() {
				return SupportAPI.getChangeDependencies();
			}
		})
	};
});
