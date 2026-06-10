/*!
 * ${copyright}
 */

/* global localStorage */

sap.ui.define([
	"sap/ui/support/supportRules/Constants"
], function (Constants) {
	"use strict";

	var _storage = localStorage,
		_cookieInterface = {
			get cookie() {
				return document.cookie;
			},
			set cookie(sValue) {
				document.cookie = sValue;
			}
		};

	/**
	 * The Storage is used to store and receive data in/from the LocalStorage in the browser.
	 *
	 * <h3>Overview</h3>
	 * The Storage class is used to persist user settings.
	 *
	 * <h3>Usage</h3>
	 * This class must be used with {@link sap.ui.support.RuleSerializer} and {@link sap.ui.support.Constants} in order to store user data in the LocalStorage.
	 *
	 * @name sap.ui.support.Storage
	 * @author SAP SE.
	 * @version ${version}
	 * @private
	 */
	return /** @lends sap.ui.support.Storage */ {

		/**
		 * Retrieves the selected rules which are stored in the LocalStorage persistence layer.
		 * @private
		 * @returns {object[]} All selected rules that are stored in the LocalStorage persistence layer.
		 */
		getSelectedRules: function () {
			var rawLSData = _storage.getItem(Constants.LOCAL_STORAGE_SELECTED_RULES_KEY);

			if (!rawLSData) {
				return null;
			}

			return JSON.parse(rawLSData);
		},

		/**
		 * Stores which rules are selected to be run by the analyzer on the next check.
		 * @private
		 * @param {object[]} aSelectedRules The data for the libraries and their rules.
		 */
		setSelectedRules: function (aSelectedRules) {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTED_RULES_KEY, JSON.stringify(aSelectedRules));
		},

		/**
		 * Sets the context for the execution scope in the LocalStorage persistence layer.
		 * @private
		 * @param {object} selectedContext Object containing the <code>analyzeContext</code> and <code>subtreeExecutionContextId</code>.
		 */
		setSelectedContext: function(selectedContext) {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY, JSON.stringify(selectedContext));
		},

		/**
		 * Retrieves the selected context from the LocalStorage persistence layer.
		 * @private
		 * @returns {string} Parsed value of the <code>selectedContext</code> key in the LocalStorage persistence layer.
		 */
		getSelectedContext: function() {
			return JSON.parse(_storage.getItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY));
		},

		/**
		 * Sets the scope components that are selected.
		 * @private
		 * @param {object} contextComponent Component that's stored in the LocalStorage.
		 */
		setSelectedScopeComponents: function(contextComponent)  {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY, JSON.stringify(contextComponent));
		},

		/**
		 * Gets the scope components that are selected.
		 * @private
		 * @returns {string} componentContext The selected components within a given scope.
		 */
		getSelectedScopeComponents: function() {
			var componentContext = _storage.getItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY);
			return JSON.parse(componentContext);
		},

		/**
		 * Sets the visible column setting selection.
		 * @param {string[]} aVisibleColumns visible columns ids
		 */
		setVisibleColumns: function(aVisibleColumns)  {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTED_VISIBLE_COLUMN_KEY, JSON.stringify(aVisibleColumns));
		},

		/**
		 * Gets the visible column setting selection.
		 * @returns {string[]} ids of visible columns.
		 */
		getVisibleColumns: function()  {
			return JSON.parse(_storage.getItem(Constants.LOCAL_STORAGE_SELECTED_VISIBLE_COLUMN_KEY));
		},

		/**
		 * Retrieves the list of selection presets
		 * @private
		 * @returns {Object[]} The list of selection presets
		 */
		getSelectionPresets: function() {
			return JSON.parse(_storage.getItem(Constants.LOCAL_STORAGE_SELECTION_PRESETS_KEY));
		},

		/**
		 * Retrieves the list of custom presets
		 * @private
		 * @returns {Object[]} The list of custom presets
		 */
		getCustomPresets: function() {
			return JSON.parse(_storage.getItem(Constants.LOCAL_STORAGE_CUSTOM_PRESETS_KEY));
		},

		/**
		 * Sets the list of selection presets
		 * @private
		 * @param {Object[]} selectionPresets The list of selection presets
		 */
		setSelectionPresets: function(selectionPresets)  {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTION_PRESETS_KEY, JSON.stringify(selectionPresets));
		},

		/**
		 * Sets the list of custom presets
		 * @private
		 * @param {Object[]} customPresets The list of custom presets
		 */
		setCustomPresets: function(customPresets)  {
			_storage.setItem(Constants.LOCAL_STORAGE_CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
		},

		/**
		 * Removes all data from LocalStorage persistence layer.
		 * @private
		 */
		removeAllData: function() {
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTED_RULES_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTED_VISIBLE_COLUMN_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTION_PRESETS_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_CUSTOM_PRESETS_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_CUSTOM_PRESETS_KEY);
		},

		/**
		 * Creates a cookie with encoded information in the LocalStorage persistence layer.
		 * @private
		 * @param {string} sCookieName Name of the cookie.
		 * @param {boolean} sCookieValue Contents of the cookie.
		 * @returns {void}
		 */
		createPersistenceCookie: function(sCookieName, sCookieValue) {
			_cookieInterface.cookie = sCookieName + "=" + sCookieValue;
		},

		/**
		 * Retrieves the persistence options of the user in the LocalStorage layer.
		 * @private
		 * @param {string} sCookieName Name of the cookie.
		 * @returns {string} sOutput The persistence options of the user.
		 */
		readPersistenceCookie: function(sCookieName) {

			var name = sCookieName + "=",
				decodedCookie = decodeURIComponent(_cookieInterface.cookie),
				ca = decodedCookie.split(';'),
				sOutput = "";
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					sOutput = c.substring(name.length, c.length);
					return sOutput;
				}
			}

			return sOutput;

		},

		/**
		 * Removes the cookie with persistence information in the LocalStorage.
		 * @private
		 * @param {string} sCookieName Name of the cookie
		 * @returns {void}
		 */
		deletePersistenceCookie: function(sCookieName) {
			_cookieInterface.cookie = sCookieName + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		},

		_setStorage: function (oStorage) {
			_storage = oStorage;
		},

		_getStorage: function () {
			return _storage;
		},

		_setCookieInterface: function (oCookieInterface) {
			_cookieInterface = oCookieInterface;
		},

		_getCookieInterface: function () {
			return _cookieInterface;
		}
	};

});
