/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/BindingParser",
	"sap/ui/core/Lib"
], function(
	BindingParser,
	Lib
) {
	"use strict";

	const sEmptyTextKey = "\xa0"; // &nbsp; in Unicode
	const oValidators = {
		noBindingText: {
			validatorFunction(sNewText) {
				let oBindingParserResult;
				try {
					oBindingParserResult = BindingParser.complexParser(sNewText, undefined, true);
				} catch (error) {
					return false;
				}
				return !(oBindingParserResult && typeof oBindingParserResult === "object");
			},
			errorMessage: Lib.getResourceBundleFor("sap.ui.rta").getText("RENAME_BINDING_ERROR_TEXT")
		},
		sameText: {
			validatorFunction(sNewText, sOldText) {
				return sNewText !== sOldText;
			},
			errorMessage: "sameTextError"
		},
		noEmptyText: {
			validatorFunction(sNewText) {
				return sNewText !== sEmptyTextKey;
			},
			errorMessage: Lib.getResourceBundleFor("sap.ui.rta").getText("RENAME_EMPTY_ERROR_TEXT")
		}
	};

	return function(sNewText, sOldText, oAction) {
		let sErrorText;
		const aValidators = oAction?.validators || [];
		const aValidatorsToRun = [
			...(oAction?.skipSameTextValidator ? [] : ["sameText"]),
			"noBindingText",
			...aValidators
		];

		aValidatorsToRun.some(function(vValidator) {
			let oValidator;

			if (
				typeof vValidator === "string" && oValidators[vValidator]
			) {
				oValidator = oValidators[vValidator];
			} else {
				oValidator = vValidator;
			}

			if (!oValidator.validatorFunction(sNewText, sOldText)) {
				sErrorText = oValidator.errorMessage;
				return true;
			}

			return false;
		});

		if (sErrorText) {
			throw Error(sErrorText);
		}
	};
});