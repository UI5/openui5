/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Defines what data type is used for parse or format the condition values on a {@link sap.ui.mdc.condition.Operator Operator}.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.OperatorValueType
	 */
	const OperatorValueType = {
		/**
		 * The <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used.
		 *
		 * @public
		 */
		Self: "Self",

		/**
		 * A simple string type is used to display static text.
		 *
		 * @public
		 */
		Static: "Static",

		/**
		 * The <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used
		 * for validation, but the user input is used as value.
		 *
		 * @public
		 */
		SelfNoParse: "SelfNoParse",

		/**
		 * The condition contains conditions as values. This is used to display the default values of a <code>FilterField</code>
		 *
		 * @since 1.149
		 * @private
		 */
		Conditions: "Conditions"
	};

	DataType.registerEnum("sap.ui.mdc.enums.OperatorValueType", OperatorValueType);

	return OperatorValueType;

});