/*!
 * ${copyright}
 */

// Provides an OData Unit type which extends sap.ui.model.type.Unit by unit of measure
// customizing
sap.ui.define([
	"./UnitMixin",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/type/Unit"
], function (applyUnitMixin, NumberFormat, BaseUnit) {
	"use strict";

	/**
	 * @typedef {sap.ui.core.format.NumberFormat.FormatOptions} sap.ui.model.odata.type.UnitFormatOptions
	 *
	 * Format options for the {@link sap.ui.model.odata.type.Unit}.
	 *
	 * @property {int} [decimals]
	 *   The number of decimals to be used for formatting the numerical value of the unit composite type; if none of the
	 *   format options <code>maxFractionDigits</code>, <code>minFractionDigits</code> or <code>decimals</code> are
	 *   given, the following defaults apply:
	 *   <ul>
	 *      <li> <b>0</b> if the numerical value is of an OData integer type, i.e. {@link sap.ui.model.odata.type.Int}
	 *        or {@link sap.ui.model.odata.type.Int64} </li>
	 *      <li> the <b>scale constraint of the numerical value's type</b> if this type is
	 *        {@link sap.ui.model.odata.type.Decimal} and the scale is not "variable" </li>
	 *      <li> <b>3</b> otherwise </li>
	 *   </ul>
	 * @property {int} [decimalPadding]
	 *   The target length of places after the decimal separator; if the number has fewer decimals than specified in
	 *   this option, it is padded with whitespaces at the end up to the target length. An additional whitespace
	 *   character for the decimal separator is added for a number without any decimals.
	 *   <b>Note:</b> This format option is only allowed if the following conditions apply:
	 *   <ul>
	 *     <li>It has a value greater than 0</li>
	 *     <li>The <code>oFormatOptions.style</code> format option is <b>not</b> set to <code>"short"</code> or
	 *         <code>"long"</code></li>
	 *   </ul>
	 * @property {null|number|string} [emptyString]
	 *   Defines how an empty string is parsed into the measure. With the default value
	 *   <code>0</code> the measure becomes <code>0</code> when an empty string is parsed.
	 * @property {int} [minFractionDigits]
	 *   The minimal number of decimal digits.
	 * @property {boolean} [parseAsString]
	 *   Whether the measure is parsed to a string; set to <code>false</code> if the measure's
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
	 *   By default decimals are preserved, unless <code>oFormatOptions.style</code> is given as
	 *   "short" or "long"; since 1.89.0
	 * @property {boolean} [showMeasure]
	 *   Defines whether the unit of measure is shown in the formatted string, for example 1 day for locale "en"
	 *   <pre><code>NumberFormat.getUnitInstance({showMeasure: true})
	 *     .format(1, "duration-day"); // "1 day"</code></pre>
	 *   <pre><code>NumberFormat.getUnitInstance({showMeasure: false})
	 *     .format(1, "duration-day"); // "1"</code></pre>
	 *   If both <code>showMeasure</code> and <code>showNumber</code> are set to false, an empty string is returned.
	 * @property {boolean} [showNumber]
	 *   Defines whether the number is shown as part of the formatted string, for example 1 day for locale "en"
	 *   <pre><code>NumberFormat.getUnitInstance({showNumber: true})
	 *     .format(1, "duration-day"); // "1 day"</code></pre>
	 *   <pre><code>NumberFormat.getUnitInstance({showNumber: false})
	 *     .format(1, "duration-day"); // "day"</code></pre>
	 *   If both <code>showMeasure</code> and <code>showNumber</code> are false, an empty string is returned
	 * @property {"short"|"long"|"standard"} [style]
	 *   The style of format.
	 *   Valid values are based on the CLDR <code>decimalFormat</code>. When set to
	 *   <code>short</code> or <code>long</code>, numbers are formatted into compact forms.
	 *   When this option is set, the default value of the <code>precision</code> option is set to <code>2</code>.
	 *   This can be changed by setting either <code>min/maxFractionDigits</code>,
	 *   <code>decimals</code>, <code>shortDecimals</code>, or the <code>precision</code> option itself.
	 * @property {boolean} [unitOptional]
	 *   Whether the measure is parsed if no unit is entered; defaults to <code>true</code> if
	 *   neither <code>showMeasure</code> nor <code>showNumber</code> is set to a falsy value,
	 *   otherwise defaults to <code>false</code>
	 *
	 * @public
	 */

	/**
	 * Constructor for a <code>Unit</code> composite type.
	 *
	 * @param {sap.ui.model.odata.type.UnitFormatOptions} [oFormatOptions={
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
	 *   Format options as defined in {@link sap.ui.core.format.NumberFormat.getUnitInstance}.
	 *   Format options are immutable, that is, they can only be set once on construction. Format
	 *   options that are not supported or have a different default are listed below. If the format
	 *   option <code>showMeasure</code> is set to <code>false</code>, model messages for the unit
	 *   of measure are not propagated to the control if the corresponding binding supports the
	 *   feature of ignoring messages, see {@link sap.ui.model.Binding#supportsIgnoreMessages}, and
	 *   the corresponding binding parameter is not set manually.
	 * @param {object} [oConstraints]
	 *   Only the 'skipDecimalsValidation' constraint is supported. Constraints are immutable,
	 *   that is, they can only be set once on construction.
	 * @param {boolean} [oConstraints.skipDecimalsValidation=false]
	 *   Whether to skip validation of the number of decimals based on the code list customizing;
	 *   since 1.93.0
	 * @param {string[]} [aDynamicFormatOptionNames] Not supported
	 * @throws {Error}
	 *   If
	 *   <ul>
	 *     <li>More parameters than <code>oFormatOptions</code> and <code>oConstraints</code> are given</li>
	 *     <li>The <code>customUnits</code> format option is set</li>
	 *     <li>Any constraint other than <code>skipDecimalsValidation</code> is set</li>
	 *     <li>The <code>oFormatOptions.decimalPadding</code> is set but is not allowed</li>
	 *   </ul>
	 *
	 * @alias sap.ui.model.odata.type.Unit
	 * @author SAP SE
	 * @class This class represents the <code>Unit</code> composite type with the parts measure,
	 * unit, and unit customizing. The type may only be used for measure and unit parts from a
	 * {@link sap.ui.model.odata.v4.ODataModel} or a {@link sap.ui.model.odata.v2.ODataModel}.
	 * The measure part is formatted according to the customizing for the unit. Use the result of
	 * the promise returned by {@link sap.ui.model.odata.v4.ODataMetaModel#requestUnitsOfMeasure}
	 * for OData V4 or by {@link sap.ui.model.odata.ODataMetaModel#requestUnitsOfMeasure} for OData
	 * V2 as unit customizing part. See
	 * {@link topic:4d1b9d44941f483f9b7f579873d38685 Currency and Unit Customizing in OData V4}
	 * resp. {@link topic:6c47b2b39db9404582994070ec3d57a2#loioaa9024c7c5444822a68daeb21a92bd51
	 * Currency and Unit Customizing in OData V2} for more information. If no unit customizing is
	 * available, UI5's default formatting applies.
	 * @extends sap.ui.model.type.Unit
	 * @public
	 * @since 1.63.0
	 * @version ${version}
	 */
	var Unit = BaseUnit.extend("sap.ui.model.odata.type.Unit", {
		constructor : function (oFormatOptions, oConstraints, aDynamicFormatOptionNames) {
			this._applyUnitMixin.apply(this, arguments);
		}
	});

	applyUnitMixin(Unit.prototype, BaseUnit, "customUnits", "Unit");

	/**
	 * Formats the given values of the parts of the <code>Unit</code> composite type to the given
	 * target type.
	 *
	 * If CLDR or custom units are used and the <code>preserveDecimals</code> format option is set to
	 * <code>false</code>, the maximal number of decimal places for the numeric part of the
	 * {@link sap.ui.model.odata.type.Unit} type depends on:
	 *   <ul>
	 *     <li>The <code>DecimalPlaces</code> property of the current unit code.
	 *     <li>The <code>maxFractionDigits</code> format option of the {@link sap.ui.model.odata.type.Unit} type.
	 *     <li>The <code>scale</code> constraint of the {@link sap.ui.model.odata.type.Decimal} type for the
	 *       quantity part.
	 *   </ul>
	 *   The maximal number of decimal places is determined as follows:
	 *   <ul>
	 *     <li>If <code>maxFractionDigits</code> is provided and is less than the current unit code's
	 *       <code>DecimalPlaces</code>, the <code>maxFractionDigits</code> is used to determine the
	 *       number of decimal places. Conversely, if <code>DecimalPlaces</code> is less than
	 *       <code>maxFractionDigits</code>, <code>DecimalPlaces</code> wins.
	 *     <li>If <code>maxFractionDigits</code> is not provided, the <code>DecimalPlaces</code> of the current unit
	 *       code is applied, unless it is greater than the <code>scale</code> of the
	 *       {@link sap.ui.model.odata.type.Decimal} type for the numeric part, in which case <code>scale</code> wins.
	 *     <li>A <code>scale='variable'</code> is treated as being always greater than the <code>DecimalPlaces</code>
	 *       of the current unit code. In this case, the <code>DecimalPlaces</code> of the current unit code is
	 *       applied.
	 *   </ul>
	 *
	 * @param {any[]} aValues
	 *   Array of part values to be formatted; contains in the following order: measure, unit,
	 *   unit customizing. The first call to this method where all parts are set determines the unit
	 *   customizing; subsequent calls use this customizing, so that the corresponding part may be
	 *   omitted. Changes to the unit customizing part after this first method call are not
	 *   considered: The unit customizing for this <code>Unit</code> instance remains unchanged.
	 * @param {string} sTargetType
	 *   The target type; must be "string" or a type with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The formatted output value; <code>null</code>, if <code>aValues</code> is
	 *   <code>undefined</code> or <code>null</code> or if the measure, the unit or the
	 *   unit customizing contained therein is <code>undefined</code>.
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported
	 *
	 * @function
	 * @name sap.ui.model.odata.type.Unit#formatValue
	 * @public
	 * @since 1.63.0
	 */

	// @override
	// @see sap.ui.model.odata.type.UnitMixin#getCustomUnitForKey
	Unit.prototype.getCustomUnitForKey = function (mCustomizing, sKey) {
		return {
			decimals : mCustomizing[sKey].UnitSpecificScale,
			displayName : mCustomizing[sKey].Text,
			"unitPattern-count-other" : NumberFormat.getDefaultUnitPattern(sKey)
		};
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {"sap.ui.model.odata.type.Unit"}
	 *   The type's name
	 *
	 * @public
	 * @since 1.63.0
	 */
	Unit.prototype.getName = function () {
		return "sap.ui.model.odata.type.Unit";
	};

	/**
	 * Parses the given string value to an array containing measure and unit.
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
	 *   An array containing measure and unit in this order. Both, measure and unit, are string
	 *   values unless the format option <code>parseAsString</code> is <code>false</code>; in this
	 *   case, the measure is a number.
	 * @throws {sap.ui.model.ParseException}
	 *   If {@link #formatValue} has not yet been called with a unit customizing part or
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed
	 *
	 * @function
	 * @name sap.ui.model.odata.type.Unit#parseValue
	 * @public
	 * @see sap.ui.model.type.Unit#parseValue
	 * @since 1.63.0
	 */

	/**
	 * Validates whether the given value in model representation as returned by {@link #parseValue}
	 * is valid and meets the conditions of this type's unit customizing.
	 *
	 * @param {any[]} aValues
	 *   An array containing measure and unit in this order, see return value of {@link #parseValue}
	 * @throws {sap.ui.model.ValidateException}
	 *   If {@link #formatValue} has not yet been called with a customizing part or if the entered
	 *   measure has too many decimals for its unit
	 *
	 * @function
	 * @name sap.ui.model.odata.type.Unit#validateValue
	 * @public
	 * @since 1.63.0
	 */

	return Unit;
});