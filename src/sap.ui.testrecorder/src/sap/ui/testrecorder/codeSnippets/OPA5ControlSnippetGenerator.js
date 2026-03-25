/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/codeSnippets/ControlSnippetGenerator",
	"sap/ui/testrecorder/interaction/Commands",
	"sap/base/strings/capitalize"
], function (ControlSnippetGenerator, Commands, capitalize) {
	"use strict";

	/**
	 * @class  generates a code snippet relevant to OPA5
	 */
	var OPA5ControlSnippetGenerator = ControlSnippetGenerator.extend("sap.ui.testrecorder.codeSnippets.OPA5ControlSnippetGenerator", {});

	/**
	 * @param {object} mData data from which to generate a snippet
	 * @param {object} mData.controlSelector control selector in string format
	 * @param {string} mData.action name of the action to record for the control
	 * @param {object} mData.actionSettings options for the action contructor
	 * @param {object} mData.assertion assertion details - property name, type and expected value
	 * @returns {string} a stringified code snippet
	 */
	OPA5ControlSnippetGenerator.prototype._generate = function (mData) {
		var sIdSuffix = mData.controlSelector.interaction && mData.controlSelector.interaction.idSuffix;
		var oActionSettings = mData.actionSettings || {};
		if (sIdSuffix) {
			oActionSettings.idSuffix = sIdSuffix;
		}
		var sAction = this._getActionAsString(mData.action, oActionSettings);
		var sAssertion = this._getAssertionAsString(mData.assertion);

		if (sAction) {
			// insert actions key in the selector
			mData.controlSelector.actions = [];
		}
		if (sAssertion) {
			mData.controlSelector.success = [];
		}
		// remove interaction as it is already used for the action
		delete mData.controlSelector.interaction;

		var sBasicSelector = this._getSelectorAsString(mData.controlSelector);
		var sSelectorWithAction = this._getSelectorWithAction(sBasicSelector, sAction);
		var sFullSelector = this._getSelectorWithAssertion(sSelectorWithAction, sAssertion);
		return "this.waitFor(" + sFullSelector + ");";
	};

	/**
	 * @param {string} sAction name of the action to record for the control
	 * @param {object} oSettings settings for the action constructor
	 * @returns {string} a stringified code snippet for the action
	 */
	OPA5ControlSnippetGenerator.prototype._getActionAsString = function (sAction, oSettings) {
		oSettings = oSettings || {};

		switch (sAction) {
			case Commands.PRESS:
				return "new Press(" + this._getSettingsAsString(oSettings, 2) + ")";

			case Commands.ENTER_TEXT:
				if (oSettings.text === undefined) {
					oSettings.text = "test";
				}
				return "new EnterText(" + this._getSettingsAsString(oSettings, 2) + ")";

			default: return "";
		}
	};

	OPA5ControlSnippetGenerator.prototype._getAssertionAsString = function (mAssertion) {
		if (mAssertion) {
			var sGetterCall = "oControl.get" + capitalize(mAssertion.propertyName) + "()";
			if (!mAssertion.expectedValue || mAssertion.expectedValue === "false") {
				return "Opa5.assert.ok(!" + sGetterCall + ");";
			} else if (mAssertion.propertyType === "boolean") {
				return "Opa5.assert.ok(" + sGetterCall + ");";
			} else {
				var sExpectedValue = this._escapeQuotes(mAssertion.expectedValue);
				return 'Opa5.assert.strictEqual(' + sGetterCall + ', "' + sExpectedValue + '");';
			}
		} else {
			return "";
		}
	};

	OPA5ControlSnippetGenerator.prototype._getSettingsAsString = function (oSettings, iIndentationLevel) {
		if (!oSettings || Object.keys(oSettings).length === 0) {
			return "";
		}
		return "{\n" + this._getIndentation(iIndentationLevel) +
			Object.keys(oSettings).map(function(sKey) {
				return sKey + ': "' + oSettings[sKey] + '"';
			}).join(",\n" + this._getIndentation(iIndentationLevel + 1)) +
			"\n" + this._getIndentation(iIndentationLevel - 1) + "}";
	};

	OPA5ControlSnippetGenerator.prototype._getSelectorWithAction = function (sSelector, sAction) {
		return sSelector.replace("actions: []", "actions: " + sAction);
	};

	OPA5ControlSnippetGenerator.prototype._getSelectorWithAssertion = function (sSelector, sAssertion) {
		return sSelector.replace("success: []", "success: function (vControls) {\n" +
			this._getIndentation(2) + "var oControl = vControls[0] || vControls;\n" +
			this._getIndentation(2) + sAssertion + "\n" + this._getIndentation(1) + "}");
	};

	return new OPA5ControlSnippetGenerator();
});
