/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	// load for availability
	"sap/ui/mdc/enums/ListActionType"
], (
	Element,
	ListActionType
) => {
	"use strict";

	/**
	 * Constructor for new ItemActionItem.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The <code>ItemActionItem</code> control represents an action for a list item.
	 * This control can only be used in the context of <code>sap.ui.mdc.List</code> control to define item actions.
	 * @extends sap.ui.core.Element
	 *
	 * @ui5-restricted sap.fe
	 * @since 1.153
	 * @alias sap.ui.mdc.list.ItemActionItem
	 */

	const ItemActionItem = Element.extend("sap.ui.mdc.list.ItemActionItem", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Type of the item action.
				 *
				 * Setting the type ensures default values for the properties <code>icon</code> and <code>text</code>.
				 * If an icon or text is set explicitly, this setting is used.
				 */
				type: {type: "sap.ui.mdc.enums.ListActionType", defaultValue: ListActionType.Custom},
				/**
				 * Text of the action.
				 */
				text: {type: "string"},
				/**
				 * Icon of the action.
				 */
				icon: {type: "sap.ui.core.URI"},
				/**
				 * Determines whether the action is visible.
				 */
				visible: {type: "boolean", defaultValue: true}
			},
			events: {
				/**
				 * This event is fired when the action is pressed.
				 */
				press: {
					parameters: {
						/**
						 * The binding context of the item on which the action was pressed.
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				}
			}
		}
	});

	/**
	 * Handles the press event from the inner control.
	 *
	 * @param {object} mPropertyBag The event property bag
	 * @private
	 */
	ItemActionItem.prototype._onPress = function(mPropertyBag) {
		this.firePress({
			bindingContext: mPropertyBag.bindingContext
		});
	};

	return ItemActionItem;
});
