/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Input',
	'sap/ui/mdc/field/FieldInputRenderer',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/core/Lib'
], (
	Input,
	FieldInputRenderer,
	ManagedObjectObserver,
	Library
) => {
	"use strict";

	const oRbM = Library.getResourceBundleFor("sap.m");

	/**
	 * Constructor for a new <code>FieldInput</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * The <code>FieldInput</code> control is used to render an input field inside a control based on {@link sap.ui.mdc.field.FieldBase FieldBase}.
	 * It enhances the {@link sap.m.Input Input} control to add ARIA attributes and other {@link sap.ui.mdc.field.FieldBase FieldBase}-specific logic.
	 * @extends sap.m.Input
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 * @alias sap.ui.mdc.field.FieldInput
	 */
	const FieldInput = Input.extend("sap.ui.mdc.field.FieldInput", /** @lends sap.ui.mdc.field.FieldInput.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the ARIA attributes added to the <code>Input</code> control.
				 *
				 * The object contains ARIA attributes in an <code>aria</code> node.
				 * Additional attributes, such as <code>role</code>, <code>autocomplete</code> or <code>valueHelpEnabled</code>, are added on root level.
				 */
				ariaAttributes: {
					type: "object",
					defaultValue: {},
					byValue: true
				}
			}
		},
		renderer: FieldInputRenderer
	});

	FieldInput.prototype.init = function() {

		Input.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["ariaAttributes"]
		});

	};

	FieldInput.prototype.exit = function() {

		Input.prototype.exit.apply(this, arguments);

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	FieldInput.prototype.getAccessibilityInfo = function() {

		const oInfo = Input.prototype.getAccessibilityInfo.apply(this, arguments);

		if (oInfo.role === "combobox") { // use text like in ComboBox
			oInfo.type = oRbM.getText("ACC_CTR_TYPE_COMBO");
		}

		return oInfo;

	};

	function _observeChanges(oChanges) {

		if (oChanges.name === "ariaAttributes") {
			// set aria-activedescendant directly to prevent anouncement of old one
			if (oChanges.current.aria?.activedescendant !== oChanges.old.aria?.activedescendant) {
				const oDomRef = this.getFocusDomRef();
				if (!oChanges.current.aria?.activedescendant) {
					oDomRef?.removeAttribute("aria-activedescendant");
				} else {
					oDomRef?.setAttribute("aria-activedescendant", oChanges.current.aria.activedescendant);
				}
			}
		}

	}

	return FieldInput;

});