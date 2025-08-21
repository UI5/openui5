/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/events/KeyCodes",
	"./waitForMultiValueField",
	"../actions/TriggerEvent",
	"../Utils",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(
	Opa5,
	EnterText,
	KeyCodes,
	waitForMultiValueField,
	TriggerEvent,
	Utils,
	PropertyStrictEquals
) {
    "use strict";

    var oActions =  {
		iEnterTextOnTheMultiValueField: function(vIdentifier, sValue, mSettings) {
			const fSuccess = mSettings && mSettings.success;
			const bEnterKeyPress = mSettings && mSettings.pressEnterKey !== undefined ? mSettings.pressEnterKey : true;
			return waitForMultiValueField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				actions: new EnterText({
					text: sValue,
					clearTextFirst: false,
					pressEnterKey: bEnterKeyPress,
					keepFocus: true
				}),
				success: function() {
					if (fSuccess) {
						fSuccess();
					} else {
						Opa5.assert.ok(true, 'The text "' + sValue + '" was entered into the field');
					}
				},
				errorMessage: 'The text "' + sValue + '" could not be entered into the field'
			}));
		},
		iEnterTextOnTheMultiValueFieldAndUseAutoComplete: function(vIdentifier, sValue) {
			const that = this;
			return oActions.iEnterTextOnTheMultiValueField.call(this, vIdentifier, sValue, {
				success: function() {
					return oActions.iPressKeyOnTheMultiValueField.call(that, vIdentifier, KeyCodes.TAB);
				}
			});
		},
		iPressKeyOnTheMultiValueField: function(vIdentifier, keyCode) {
			return waitForMultiValueField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success:function(oMultiValueField) {
					oMultiValueField.focus();
					new TriggerEvent({event: "keydown", payload: {which: keyCode, keyCode: keyCode}}).executeOn(oMultiValueField.getCurrentContent()[0]);
					Opa5.assert.ok(oMultiValueField, "Key '" + keyCode + "' pressed on FilterField '" + oMultiValueField.getId() + "'");
				}
			}));
		},

		iOpenTheValueHelpForMultiValueField: function (vIdentifier) {
			return oActions.iPressKeyOnTheMultiValueField.call(this, vIdentifier, KeyCodes.F4);
		},
		iSelectValueFromMDCValueHelp: function (vIdentifier, sValue) {
			return this.waitFor({
				controlType: "sap.m.ColumnListItem",
				matchers: [
					function(oItem) {
						const aCells = oItem.getCells();
						return aCells.some(function(oCell) {
							return oCell.getText && oCell.getText() === sValue;
						});
					}
				],
				success: function (aItems) {
					if (aItems.length > 0) {
						const oItem = aItems[0];
						oItem.$().trigger("tap");
						Opa5.assert.ok(true, "Value '" + sValue + "' selected from ValueHelp for MultiValueField '" + vIdentifier + "'");
					} else {
						Opa5.assert.ok(false, "No item with value '" + sValue + "' found in ValueHelp for MultiValueField '" + vIdentifier + "'");
					}
				}
			});
		},
		iPressOKOnValueHelpDialog: function () {
		return this.waitFor({
			controlType: "sap.m.Button",
			matchers: [
				new PropertyStrictEquals({name: "text", value: "OK"})
			],
			success: function (aButtons) {
				if (aButtons.length > 0) {
					new TriggerEvent({event: "tap"}).executeOn(aButtons[0]);
					Opa5.assert.ok(true, "OK Button pressed in ValueHelp Dialog");
				} else {
					Opa5.assert.ok(false, "OK Button not found in ValueHelp Dialog");
				}
			}
		});
		}
	};

	return oActions;
});
