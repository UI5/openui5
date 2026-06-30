/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the base implementation for all model implementations
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/each",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/Lib",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/CompositeType",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], function(Log, each, extend, isEmptyObject, Library, NumberFormat, CompositeType, FormatException, ParseException,
		ValidateException) {
	"use strict";

	/**
	 * @typedef {sap.ui.core.format.NumberFormat.FormatOptions} sap.ui.model.type.CurrencyFormatOptions
	 *
	 * Format options for the {@link sap.ui.model.type.Currency} type.
	 *
	 * @property {boolean} [currencyCode]
	 *   Defines whether the currency is shown as a code in currency format.
	 *   The currency symbol is displayed when this option is set to
	 *   <code>false</code> and a symbol exists for the given currency code.
	 * @property {"standard"|"accounting"|"sap-standard"|"sap-accounting"} [currencyContext]
	 *   Can be set to either 'standard'
	 *   (the default value) or to 'accounting' for an accounting-specific currency display
	 * @property {Object<string,object>} [customCurrencies]
	 *   Defines a set of custom currencies exclusive to this NumberFormat instance.
	 *   Custom currencies must not consist only of digits.
	 *   If custom currencies are defined on the instance, no other currencies can be formatted and
	 *   parsed by this instance.
	 *   Globally available custom currencies can be added via the global configuration.
	 *   See {@link module:sap/base/i18n/Formatting.setCustomCurrencies Formatting.setCustomCurrencies} and
	 *   {@link module:sap/base/i18n/Formatting.addCustomCurrencies Formatting.addCustomCurrencies}.
	 * @property {int} [decimals]
	 *   The number of decimal digits.
	 * @property {int} [decimalPadding]
	 *   The target length of places after the decimal separator; if the number has fewer decimals than specified in
	 *   this option, it is padded with whitespaces at the end up to the target length. An additional whitespace
	 *   character for the decimal separator is added for a number without any decimals.
	 *   <b>Note:</b> This format option is only allowed if the following conditions apply:
	 *   <ul>
	 *     <li>It has a value greater than 0.</li>
	 *     <li>The <code>oFormatOptions.style</code> format option is <b>not</b> set to <code>"short"</code> or
	 *         <code>"long"</code>.</li>
	 *   </ul>
	 * @property {null|number|string} [emptyString]
	 *   Since 1.130.0. Defines what value an empty string is parsed into and what value is formatted as an empty
	 *   string.
	 *   The {@link #format} and {@link #parse} functions are done in a symmetric way.
	 *   For example, when this parameter is set to <code>NaN</code>, an empty string is parsed as <code>NaN</code>,
	 *   and <code>NaN</code> is formatted as an empty string.
	 * @property {int} [minFractionDigits]
	 *   Deprecated as of 1.130; this format option does not have
	 *   an effect on currency formats since decimals can always be determined, either through the given format options,
	 *   custom currencies or the CLDR
	 * @property {boolean} [parseAsString]
	 *   Since 1.28.2, whether to parse the number as a string in order to keep the precision for large numbers. Numbers
	 *   in scientific notation are parsed back to standard notation.
	 *   For example, <code>5e-3</code> is parsed to <code>0.005</code>.
	 * @property {int} [precision]
	 *   The maximum number of digits in the formatted representation of a number;
	 *   if the <code>precision</code> is less than the overall length of the number, its fractional part is truncated
	 *   through rounding. As the <code>precision</code> only affects the rounding of a number, its integer part can
	 *   retain more digits than defined by this parameter.
	 *   <b>Example:</b> With a <code>precision</code> of 2, <code>234.567</code> is formatted to <code>235</code>.
	 *   <b>Note:</b> The formatted output may differ depending on locale.
	 * @property {boolean} [preserveDecimals]
	 *   By default, decimals are preserved unless <code>oFormatOptions.style</code> is given as
	 *   "short" or "long"; since 1.89.0
	 * @property {boolean} [showMeasure]
	 *   Defines whether the currency code or symbol is shown in the formatted string,
	 *   for example true: "1.00 EUR", false: "1.00" for locale "en"
	 *   If both <code>showMeasure</code> and <code>showNumber</code> are <code>false</code>, an empty string is
	 *   returned
	 * @property {boolean} [showNumber]
	 *   Defines whether the number is shown as part of the result string,
	 *   for example 1 EUR for locale "en"
	 *   <pre><code>NumberFormat.getCurrencyInstance({showNumber: true}).format(1, "EUR"); // "1.00 EUR"</code></pre>
	 *   <pre><code>NumberFormat.getCurrencyInstance({showNumber: false}).format(1, "EUR"); // "EUR"</code></pre>
	 *   If both <code>showMeasure</code> and <code>showNumber</code> are <code>false</code>, an empty string is
	 *   returned
	 * @property {object} [source]
	 *   A set of format options as defined for
	 *   {@link sap.ui.core.format.NumberFormat.getCurrencyInstance} which describes the format of
	 *   amount and currency in the model in case the model holds this in one property of type
	 *   <code>string</code>, for example as "EUR 22". If an empty object is given,
	 *   grouping is disabled, the decimal separator is a dot, and the grouping separator is a comma.
	 * @property {"short"|"long"|"standard"} [style]
	 *   The style of format.
     *   When set to <code>short</code> or <code>long</code>, numbers are formatted into the <code>short</code> form
	 *   only.
	 *   When this option is set, the default value of the <code>precision</code> option is set to <code>2</code>.
	 *   This can be changed by setting either <code>min/maxFractionDigits</code>,
	 *   <code>decimals</code>, <code>shortDecimals</code>, or the <code>precision</code> option itself.
	 * @property {boolean} [trailingCurrencyCode]
	 *   Overrides the global configuration
	 *   value {@link module:sap/base/i18n/Formatting.getTrailingCurrencyCode Formatting.getTrailingCurrencyCode},
	 *   which has a default value of <code>true</code>.
	 *   This is ignored if <code>oFormatOptions.currencyCode</code> is set to <code>false</code>,
	 *   or if <code>oFormatOptions.pattern</code> is supplied.
	 *
	 * @public
	 */

	/**
	 * Constructor for a <code>Currency</code> type.
	 *
	 * @class
	 * This class represents the composite type <code>Currency</code>, which consists of the parts
	 * "amount" (of type <code>number</code> or <code>string</code>) and "currency" (of type
	 * <code>string</code>). In case the amount is a <code>string</code>, it must be the JavaScript
	 * representation of the corresponding number.
	 * If the <code>source</code> format option is given, the composite type has only one part of
	 * type <code>string</code>, holding both amount and currency in the source format.
	 *
	 * @extends sap.ui.model.CompositeType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {sap.ui.model.type.CurrencyFormatOptions} [oFormatOptions={
	 * 	   currencyCode: true,
	 *     currencyContext: "standard",
	 *     emptyString: NaN,
	 *     groupingBaseSize: 3,
	 *     groupingEnabled: true,
	 *     groupingSize: 3,
	 *     maxFractionDigits: 99,
	 *     maxIntegerDigits: 99,
	 *     minFractionDigits: 0,
	 *     minIntegerDigits: 1,
	 *     parseAsString: false,
	 *     preserveDecimals: true,
	 *     roundingMode: "HALF_AWAY_FROM_ZERO",
	 *     showMeasure: true,
	 *     showNumber: true,
	 *     showScale: true,
	 *     strictGroupingValidation: false,
	 *     style: "standard"
	 *   }]
	 *   Format options; for a list of all available options, see
	 *   {@link sap.ui.core.format.NumberFormat.getCurrencyInstance}. If the format options
	 *   <code>showMeasure</code> or since 1.89.0 <code>showNumber</code> are set to
	 *   <code>false</code>, model messages for the respective parts are not propagated to the
	 *   control, provided the corresponding binding supports the feature of ignoring model
	 *   messages, see {@link sap.ui.model.Binding#supportsIgnoreMessages}, and the corresponding
	 *   binding parameter is not set manually.
	 * @param {object} [oConstraints]
	 *   Constraints for the value part
	 * @param {number} [oConstraints.minimum]
	 *   Smallest amount allowed excluding the minimum value itself
	 * @param {number} [oConstraints.maximum]
	 *   Largest amount allowed excluding the maximum value itself
	 * @throws {Error} If the <code>oFormatOptions.decimalPadding</code> is set but is not allowed
	 * @alias sap.ui.model.type.Currency
	 */
	var Currency = CompositeType.extend("sap.ui.model.type.Currency", /** @lends sap.ui.model.type.Currency.prototype  */ {

		constructor : function (oFormatOptions) {
			CompositeType.apply(this, arguments);
			this.sName = "Currency";
			this.bShowMeasure = !oFormatOptions || !("showMeasure" in oFormatOptions)
				|| oFormatOptions.showMeasure;
			this.bShowNumber = !oFormatOptions || !("showNumber" in oFormatOptions)
				|| oFormatOptions.showNumber;
			this.bUseRawValues = true;
		}

	});

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {any[]|string} vValue
	 *   The array containing amount and currency code in case the <code>source</code> format option
	 *   is not given; otherwise, a string representation of the value which is parsed using the
	 *   source format
	 * @param {string} sTargetType
	 *   The target type; must be "string", or a type with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}
	 * @returns {string|null}
	 *   The formatted output value; the values <code>undefined</code> or <code>null</code> or
	 *   an amount <code>undefined</code> or <code>null</code> are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported
	 *
	 * @public
	 */
	Currency.prototype.formatValue = function(vValue, sTargetType) {
		var aValues = vValue;
		if (vValue == undefined || vValue == null) {
			return null;
		}
		if (this.oInputFormat) {
			aValues = this.oInputFormat.parse(vValue);
		}
		if (!Array.isArray(aValues)) {
			throw new FormatException("Cannot format currency: " + vValue + " has the wrong format");
		}
		if ((aValues[0] == undefined || aValues[0] == null) && this.bShowNumber) {
			return null;
		}
		switch (this.getPrimitiveType(sTargetType)) {
			case "string":
				return this.oOutputFormat.format(aValues);
			default:
				throw new FormatException("Don't know how to format currency to " + sTargetType);
		}
	};

	/**
	 * Parses a string value.
	 *
	 * @param {string} sValue
	 *   The value to be parsed
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>sValue</code>); must be "string", or a type
	 *   with "string" as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 * @param {array} [aCurrentValues]
	 *   Not used
	 * @returns {any[]|string}
	 *   If the <code>source</code> format option is not set, the method returns an array
	 *   containing amount and currency: the amount is a <code>string</code> if the format
	 *   option <code>parseAsString</code> is set and a <code>number</code> otherwise, the currency
	 *   is always a <code>string</code>.
	 *   If the <code>source</code> format option is set, the method returns a string representation
	 *   of amount and currency in the given source format.
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is unsupported or if the given string cannot be parsed
	 * @public
	 */
	Currency.prototype.parseValue = function(sValue, sSourceType) {
		var vResult;

		switch (this.getPrimitiveType(sSourceType)) {
			case "string":
				vResult = this.oOutputFormat.parse(sValue);
				if (!Array.isArray(vResult) || this.bShowNumber && isNaN(vResult[0])) {
					throw this.getParseException();
				}
				break;
			default:
				throw new ParseException("Don't know how to parse Currency from " + sSourceType);
		}
		if (this.oInputFormat) {
			vResult = this.oInputFormat.format(vResult);
		}
		return vResult;
	};

	Currency.prototype.validateValue = function(vValue) {
		if (this.oConstraints) {
			var oBundle = Library.getResourceBundleFor("sap.ui.core"),
				aViolatedConstraints = [],
				aMessages = [],
				aValues = vValue,
				iValue;
			if (this.oInputFormat) {
				aValues = this.oInputFormat.parse(vValue);
			}
			iValue = aValues[0];
			each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (iValue < oContent) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText("Currency.Minimum", [oContent]));
						}
						break;
					case "maximum":
						if (iValue > oContent) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText("Currency.Maximum", [oContent]));
						}
						break;
					default:
						Log.warning("Unknown constraint '" + sName + "': Value is not validated.",
							null, "sap.ui.model.type.Currency");
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
			}
		}
	};

	Currency.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = Object.assign(
			oFormatOptions.style !== "short" && oFormatOptions.style !== "long"
				? {preserveDecimals : true}
				: {},
			oFormatOptions);
		this._createFormats();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Currency.prototype._handleLocalizationChange = function() {
		this._createFormats();
	};

	/**
	 * Create formatters used by this type
	 *
	 * @private
	 */
	Currency.prototype._createFormats = function () {
		var oSourceOptions = this.oFormatOptions.source;
		this.oOutputFormat = NumberFormat.getCurrencyInstance(this.iScale >= 0
			// ensures that amount scale wins over the decimals for the unit
			? extend({}, {maxFractionDigits : this.iScale}, this.oFormatOptions)
			: this.oFormatOptions);
		if (oSourceOptions) {
			if (isEmptyObject(oSourceOptions)) {
				oSourceOptions = {
					groupingEnabled: false,
					groupingSeparator: ",",
					decimalSeparator: "."
				};
			}
			this.oInputFormat = NumberFormat.getCurrencyInstance(oSourceOptions);
		}
	};

	/**
	 * Returns the parse exception based on "showNumber" and "showMeasure" format options.
	 *
	 * @returns {sap.ui.model.ParseException} The parse exception
	 *
	 * @private
	 */
	Currency.prototype.getParseException = function () {
		var oBundle = Library.getResourceBundleFor("sap.ui.core"),
			sText;

		if (!this.bShowNumber) {
			sText = oBundle.getText("Currency.InvalidMeasure");
		} else if (!this.bShowMeasure) {
			sText = oBundle.getText("EnterNumber");
		} else {
			sText = oBundle.getText("Currency.Invalid");
		}

		return new ParseException(sText);
	};

	/**
	 * Gets an array of indices that determine which parts of this type shall not propagate their
	 * model messages to the attached control. Prerequisite is that the corresponding binding
	 * supports this feature, see {@link sap.ui.model.Binding#supportsIgnoreMessages}. If the format
	 * option <code>showMeasure</code> is set to <code>false</code> and the currency value is not
	 * shown in the control, the part for the currency code shall not propagate model messages to
	 * the control. Analogously, since 1.89.0, if the format option <code>showNumber</code> is set
	 * to <code>false</code>, the amount is not shown in the control and the part for the amount
	 * shall not propagate model messages to the control.
	 *
	 * @return {number[]}
	 *   An array of indices that determine which parts of this type shall not propagate their model
	 *   messages to the attached control
	 *
	 * @public
	 * @see sap.ui.model.Binding#supportsIgnoreMessages
	 * @since 1.82.0
	 */
	// @override sap.ui.model.Binding#supportsIgnoreMessages
	Currency.prototype.getPartsIgnoringMessages = function () {
		if (!this.bShowMeasure) {
			return [1];
		} else if (!this.bShowNumber) {
			return [0];
		}
		return [];
	};

	/**
	 * Gets the indices of the binding parts of this composite type in order to determine those parts
	 * whose types are required for formatting.
	 * If for example the type of the amount part is a {@link sap.ui.model.odata.type.Decimal} with a
	 * <code>scale</code> constraint less than the currency part's decimal places, then the amount's
	 * scale is used.
	 *
	 * @returns {int[]}
	 *   The indices of the parts with a relevant type for this composite type, or an empty array if
	 *   the format option <code>showNumber</code> is <code>false</code>
	 *
	 * @override sap.ui.model.CompositeType#getPartsListeningToTypeChanges
	 * @see #processPartTypes
	 */
	Currency.prototype.getPartsListeningToTypeChanges = function () {
		// Only the first part is of interest because it may have a type with another scale than the
		// decimal places for the currency part
		return this.bShowNumber ? [0] : [];
	};

	/**
	 * Processes the types of this composite type's parts. Remembers the <code>scale</code>
	 * constraint of the amount part's type to consider it while formatting.
	 *
	 * @param {sap.ui.model.SimpleType[]} aPartTypes The types of the composite binding parts
	 *
	 * @override sap.ui.model.CompositeType#processPartTypes
	 * @protected
	 * @since 1.120.0
	 */
	Currency.prototype.processPartTypes = function (aPartTypes) {
		const iOldScale = this.iScale;
		const oAmountType = aPartTypes[0];
		if (oAmountType?.isA("sap.ui.model.odata.type.Decimal")) {
			this.iScale = oAmountType.oConstraints?.scale || 0;
		}
		if (iOldScale !== this.iScale) {
			this._createFormats();
		}
	};

	return Currency;

});
