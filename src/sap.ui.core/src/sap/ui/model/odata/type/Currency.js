/*!
 * ${copyright}
 */

// Provides an OData Currency type which extends sap.ui.model.type.Currency by currency customizing
sap.ui.define([
	"./UnitMixin",
	"sap/ui/model/type/Currency"
], function (applyUnitMixin, BaseCurrency) {
	"use strict";

	/**
	 * @typedef {sap.ui.core.format.NumberFormat.FormatOptions} sap.ui.model.odata.type.CurrencyFormatOptions
	 *
	 * Format options for the {@link sap.ui.model.odata.type.Currency} type.
	 *
	 * @property {boolean} [currencyCode]
	 *   Defines whether the currency is shown as a code in currency format.
	 *   The currency symbol is displayed when this option is set to
	 *   <code>false</code> and a symbol exists for the given currency code.
	 * @property {"standard"|"accounting"|"sap-standard"|"sap-accounting"} [currencyContext]
	 *   Can be set to either 'standard'
	 *   (the default value) or to 'accounting' for an accounting-specific currency display
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
	 * @property {int} [decimals]
	 *   The number of decimal digits.
	 * @property {any} [emptyString]
	 *   Defines how an empty string is parsed into the amount. With the default value
	 *   <code>0</code>, the amount becomes <code>0</code> when an empty string is parsed.
	 * @property {int} [minFractionDigits]
	 *   Deprecated as of 1.130; this format option does not have
	 *   an effect on currency formats since decimals can always be determined, either through the given format options,
	 *   custom currencies, or the CLDR
	 * @property {boolean} [parseAsString]
	 *   Whether the amount is parsed to a string; set to <code>false</code> if the amount's
	 *   underlying type is represented as a <code>number</code>, for example
	 *   {@link sap.ui.model.odata.type.Int32}
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
	 * @property {"short"|"long"|"standard"} [style]
	 *   The style of format.
	 *   Valid values are based on the CLDR <code>decimalFormat</code>. When set to
	 *   <code>short</code> or <code>long</code>, numbers are formatted into compact forms.
	 *   When this option is set, the default value of the <code>precision</code> option is set to <code>2</code>.
	 *   This can be changed by setting either <code>min/maxFractionDigits</code>,
	 *   <code>decimals</code>, <code>shortDecimals</code>, or the <code>precision</code> option itself.
	 * @property {boolean} [trailingCurrencyCode]
	 *   Overrides the global configuration
	 *   value {@link module:sap/base/i18n/Formatting.getTrailingCurrencyCode Formatting.getTrailingCurrencyCode},
	 *   which has a default value of <code>true</code>.
	 *   This is ignored if <code>oFormatOptions.currencyCode</code> is set to <code>false</code>,
	 *   or if <code>oFormatOptions.pattern</code> is supplied.
	 * @property {boolean} [unitOptional]
	 *   Whether the amount is parsed if no currency is entered; defaults to <code>true</code> if
	 *   neither <code>showMeasure</code> nor <code>showNumber</code> is set to a falsy value,
	 *   otherwise defaults to <code>false</code>
	 *
	 * @public
	 */

	/**
	 * Constructor for a <code>Currency</code> composite type.
	 *
	 * @param {sap.ui.model.odata.type.CurrencyFormatOptions} [oFormatOptions={
	 *     currencyCode: true,
	 *     currencyContext: "standard",
	 *     emptyString: 0,
	 *     groupingBaseSize: 3,
	 *     groupingEnabled: true,
	 *     groupingSize: 3,
	 *     maxFractionDigits: 99,
	 *     maxIntegerDigits: 99,
	 *     minFractionDigits: 0,
	 *     minIntegerDigits: 1,
	 *     parseAsString: true,
	 *     preserveDecimals: true,
	 *     roundingMode: "HALF_AWAY_FROM_ZERO",
	 *     showMeasure: true,
	 *     showNumber: true,
	 *     showScale: true,
	 *     strictGroupingValidation: false,
	 *     style: "standard"
	 *   }]
	 *   Format options as defined in {@link sap.ui.core.format.NumberFormat.getCurrencyInstance}.
	 *   Format options are immutable, that is,
	 *   they can only be set once on construction. Format options that are not supported or have a
	 *   different default are listed below. If the format option <code>showMeasure</code> is set to
	 *   <code>false</code>, model messages for the currency code are not propagated to the control
	 *   if the corresponding binding supports the feature of ignoring messages, see
	 *   {@link sap.ui.model.Binding#supportsIgnoreMessages}, and the corresponding binding
	 *   parameter is not set manually.
	 * @param {object} [oConstraints]
	 *   Only the 'skipDecimalsValidation' constraint is supported. Constraints are immutable,
	 *   that is, they can only be set once on construction.
	 * @param {boolean} [oConstraints.skipDecimalsValidation=false]
	 *   Whether to skip validation of the number of decimals based on the code list customizing;
	 *   since 1.93.0
	 * @throws {Error}
	 *   If
	 *   <ul>
	 *     <li>More parameters than <code>oFormatOptions</code> and <code>oConstraints</code> are given</li>
	 *     <li>The <code>customCurrencies</code> format option is set</li>
	 *     <li>Any constraint other than <code>skipDecimalsValidation</code> is set</li>
	 *     <li>The <code>oFormatOptions.decimalPadding</code> is set but is not allowed</li>
	 *   </ul>
	 *
	 * @alias sap.ui.model.odata.type.Currency
	 * @author SAP SE
	 * @class This class represents the <code>Currency</code> composite type with the parts amount,
	 * currency, and currency customizing. The type may only be used for amount and currency parts
	 * from a {@link sap.ui.model.odata.v4.ODataModel} or a
	 * {@link sap.ui.model.odata.v2.ODataModel}. The amount part is formatted according to the
	 * customizing for the currency. Use the result of the promise returned by
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#requestCurrencyCodes} for OData V4 or by
	 * {@link sap.ui.model.odata.ODataMetaModel#requestCurrencyCodes} for OData V2 as currency
	 * customizing part. See
	 * {@link topic:4d1b9d44941f483f9b7f579873d38685 Currency and Unit Customizing in OData V4}
	 * resp. {@link topic:6c47b2b39db9404582994070ec3d57a2#loioaa9024c7c5444822a68daeb21a92bd51
	 * Currency and Unit Customizing in OData V2} for more information. If no currency customizing
	 * is available, UI5's default formatting applies.
	 * @extends sap.ui.model.type.Currency
	 * @public
	 * @since 1.63.0
	 * @version ${version}
	 */
	var Currency = BaseCurrency.extend("sap.ui.model.odata.type.Currency", {
		constructor : function (oFormatOptions, oConstraints) {
			this._applyUnitMixin.apply(this, arguments);
		}
	});

	applyUnitMixin(Currency.prototype, BaseCurrency, "customCurrencies", "Currency");

	/**
	 * Formats the given values of the parts of the <code>Currency</code> composite type to the
	 * given target type.
	 *
	 * If CLDR or custom currencies are used and the <code>preserveDecimals</code> format option is set to
	 * <code>false</code>, the maximal number of decimal places for the numeric part of the
	 * {@link sap.ui.model.odata.type.Currency} type depends on:
	 *   <ul>
	 *     <li>The <code>DecimalPlaces</code> property of the current currency code.
	 *     <li>The <code>maxFractionDigits</code> format option of the {@link sap.ui.model.odata.type.Currency} type.
	 *     <li>The <code>scale</code> constraint of the {@link sap.ui.model.odata.type.Decimal} type for the
	 *       quantity part.
	 *   </ul>
	 *   The maximal number of decimal places is determined as follows:
	 *   <ul>
	 *     <li>If <code>maxFractionDigits</code> is provided and is less than the current currency code's
	 *       <code>DecimalPlaces</code>, the <code>maxFractionDigits</code> is used to determine the
	 *       number of decimal places. Conversely, if <code>DecimalPlaces</code> is less than
	 *       <code>maxFractionDigits</code>, <code>DecimalPlaces</code> wins.
	 *     <li>If <code>maxFractionDigits</code> is not provided, the <code>DecimalPlaces</code> of the current currency
	 *       code is applied, unless it is greater than the <code>scale</code> of the
	 *       {@link sap.ui.model.odata.type.Decimal} type for the numeric part, in which case <code>scale</code> wins.
	 *     <li>A <code>scale='variable'</code> is treated as being always greater than the <code>DecimalPlaces</code>
	 *       of the current currency code. In this case, the <code>DecimalPlaces</code> of the current currency code is
	 *       applied.
	 *   </ul>
	 *
	 * @param {any[]} aValues
	 *   Array of part values to be formatted; contains in the following order: amount, currency,
	 *   currency customizing. The first call to this method where all parts are set determines the
	 *   currency customizing; subsequent calls use this customizing, so that the corresponding
	 *   part may be omitted. Changes to the currency customizing part after this first method call
	 *   are not considered: The currency customizing for this <code>Currency</code> instance
	 *   remains unchanged.
	 * @param {string} sTargetType
	 *   The target type; must be "string" or a type with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The formatted output value; <code>null</code>, if <code>aValues</code> is
	 *   <code>undefined</code> or <code>null</code> or if the amount, the currency or
	 *   the currency customizing contained therein is <code>undefined</code>.
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported
	 *
	 * @function
	 * @name sap.ui.model.odata.type.Currency#formatValue
	 * @public
	 * @since 1.63.0
	 */

	// @override
	// @see sap.ui.model.odata.type.UnitMixin#getCustomUnitForKey
	Currency.prototype.getCustomUnitForKey = function (mCustomizing, sKey) {
		return {
			decimals : mCustomizing[sKey].UnitSpecificScale,
			isoCode : mCustomizing[sKey].StandardCode
		};
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {"sap.ui.model.odata.type.Currency"}
	 *   The type's name
	 *
	 * @public
	 * @since 1.63.0
	 */
	Currency.prototype.getName = function () {
		return "sap.ui.model.odata.type.Currency";
	};

	/**
	 * Parses the given string value to an array containing amount and currency.
	 *
	 * @param {string} vValue
	 *   The value to be parsed
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>vValue</code>); must be "string", or a type
	 *   with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @param {any[]} [aCurrentValues]
	 *   Not used
	 * @returns {any[]}
	 *   An array containing amount and currency in this order. Both, amount and currency, are
	 *   string values unless the format option <code>parseAsString</code> is <code>false</code>; in
	 *   this case, the amount is a number.
	 * @throws {sap.ui.model.ParseException}
	 *   If {@link #formatValue} has not yet been called with a currency customizing part or
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed
	 *
	 * @function
	 * @name sap.ui.model.odata.type.Currency#parseValue
	 * @public
	 * @see sap.ui.model.type.Currency#parseValue
	 * @since 1.63.0
	 */

	/**
	 * Validates whether the given value in model representation as returned by {@link #parseValue}
	 * is valid and meets the conditions of this type's currency customizing.
	 *
	 * @param {any[]} aValues
	 *   An array containing amount and currency in this order, see return value of
	 *   {@link #parseValue}
	 * @throws {sap.ui.model.ValidateException}
	 *   If {@link #formatValue} has not yet been called with a customizing part or if the entered
	 *   amount has too many decimals for its currency
	 *
	 * @function
	 * @name sap.ui.model.odata.type.Currency#validateValue
	 * @public
	 * @since 1.63.0
	 */

	return Currency;
});