/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/fl/util/CancelError",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/Utils"
], function(
	ManagedObject,
	Element,
	Fragment,
	CancelError,
	JSONModel,
	ResourceModel,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.plugin.CombineDialog control.
	 *
	 * @class Dialog offering the sibling elements that can be combined with a single selected element in Runtime Authoring
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.153
	 * @alias sap.ui.rta.plugin.CombineDialog
	 */
	const CombineDialog = ManagedObject.extend("sap.ui.rta.plugin.CombineDialog", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				/**
				 * Title of the dialog.
				 */
				title: {
					type: "string"
				},
				/**
				 * The candidate elements offered for combination. Each entry has an <code>id</code>, a
				 * <code>label</code>, a <code>count</code> (the number of controls it counts as, used
				 * for the badge and the limit arithmetic) and a <code>selected</code> flag.
				 */
				elements: {
					type: "object[]",
					defaultValue: []
				},
				/**
				 * Maximum number of controls that may be combined. When not set, the number of
				 * combinable elements is not limited.
				 */
				maxControlsCount: {
					type: "int"
				},
				/**
				 * The number of controls the source element already counts as. It always counts towards
				 * the limit. Defaults to 1.
				 */
				sourceControlsCount: {
					type: "int",
					defaultValue: 1
				}
			},
			events: {
				opened: {}
			}
		}
	});

	CombineDialog.prototype.init = function() {
		this._oDialogModel = new JSONModel({
			elements: [],
			dialogTitle: "",
			okEnabled: false,
			infoText: "",
			infoVisible: false
		});
		// Allow for a large number of sibling elements without hitting the default size limit (100)
		this._oDialogModel.setSizeLimit(1000);
		this.oRTAResourceModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
		this._oResourceBundle = this.oRTAResourceModel.getResourceBundle();
	};

	CombineDialog.prototype.exit = function(...aArgs) {
		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}
		if (ManagedObject.prototype.exit) {
			ManagedObject.prototype.exit.apply(this, aArgs);
		}
	};

	/**
	 * Returns the elements the user selected in the dialog.
	 *
	 * @returns {object[]} The selected elements
	 */
	CombineDialog.prototype.getSelectedElements = function() {
		return this._oDialogModel.getProperty("/elements").filter(function(oElement) {
			return oElement.selected;
		});
	};

	/**
	 * Transfers the constructor properties into the dialog model, building the display label (with a
	 * badge for already-combined elements) for each element, and computes the initial selection state.
	 *
	 * @private
	 */
	CombineDialog.prototype._initModelFromProperties = function() {
		const aElements = this.getElements().map((oElement) => ({
			...oElement,
			displayLabel: oElement.count > 1
				? this._oResourceBundle.getText("LBL_COMBINE_ELEMENT_COUNT", [oElement.label, oElement.count])
				: oElement.label
		}));
		this._oDialogModel.setProperty("/elements", aElements);
		this._oDialogModel.setProperty("/dialogTitle", this.getTitle());
		this._updateSelectionState();
	};

	/**
	 * Recomputes, after every selection change:
	 * <ul>
	 *   <li>which unselected elements can still be added without exceeding the limit (the rest are disabled),</li>
	 *   <li>whether OK is enabled (at least one element selected),</li>
	 *   <li>the informational text telling the user how many more controls can still be combined.</li>
	 * </ul>
	 *
	 * @private
	 */
	CombineDialog.prototype._updateSelectionState = function() {
		const aElements = this._oDialogModel.getProperty("/elements") || [];
		const iMax = this.getMaxControlsCount();
		const bLimited = iMax !== undefined;

		// controls already consumed: the source plus the selected elements
		let iUsed = this.getSourceControlsCount();
		aElements.forEach((oElement) => {
			if (oElement.selected) {
				iUsed += oElement.count;
			}
		});
		const iRemaining = bLimited ? iMax - iUsed : Infinity;

		// an unselected element can still be added only if its control count fits into the remaining budget
		aElements.forEach((oElement) => {
			oElement.enabled = oElement.selected || oElement.count <= iRemaining;
		});

		const iSelectedCount = aElements.filter((oElement) => oElement.selected).length;
		this._oDialogModel.setProperty("/okEnabled", iSelectedCount > 0);
		// the info strip is only shown when there is a limit; otherwise it would be empty
		this._oDialogModel.setProperty("/infoVisible", bLimited);
		this._oDialogModel.setProperty("/infoText", bLimited ? this._getInfoText(iRemaining) : "");
		this._oDialogModel.refresh(true);
	};

	/**
	 * Builds the informational text shown at the top of the dialog, telling the user how many more
	 * controls can still be combined. When the number of combinable elements is not limited, no text
	 * is shown.
	 *
	 * @param {int} [iRemaining] - Number of additional controls that can still be combined
	 * @returns {string} The informational text
	 * @private
	 */
	CombineDialog.prototype._getInfoText = function(iRemaining) {
		if (iRemaining === undefined) {
			return "";
		}
		if (iRemaining <= 0) {
			return this._oResourceBundle.getText("MSG_COMBINE_LIMIT_REACHED");
		}
		return this._oResourceBundle.getText("MSG_COMBINE_REMAINING", [iRemaining]);
	};

	CombineDialog.prototype._onSelectionChange = function() {
		this._updateSelectionState();
	};

	/**
	 * Toggles the selection of a row when the whole list item is activated via keyboard (Enter) or
	 * click, so the entries are keyboard-selectable like in the Additional Elements dialog. Disabled
	 * entries are not toggled.
	 *
	 * @param {sap.ui.base.Event} oEvent - The list item press event
	 * @private
	 */
	CombineDialog.prototype._onItemPress = function(oEvent) {
		this._toggleItem(oEvent.getSource());
	};

	/**
	 * Toggles the checkbox of the given list item, if it is enabled, and recomputes the dialog state.
	 *
	 * @param {sap.m.CustomListItem} oItem - The list item whose checkbox should be toggled
	 * @private
	 */
	CombineDialog.prototype._toggleItem = function(oItem) {
		const oCheckBox = oItem.getContent()[0];
		if (!oCheckBox.getEnabled()) {
			return;
		}
		oCheckBox.setSelected(!oCheckBox.getSelected());
		this._updateSelectionState();
	};

	/**
	 * Handles the Spacebar key on a focused list item so the entries can be selected with Space
	 * (Enter is already handled via the item's press event). The list items are not part of a list
	 * selection mode, so the Spacebar has to be handled explicitly here.
	 *
	 * @param {jQuery.Event} oEvent - The keyboard event
	 * @private
	 */
	CombineDialog.prototype._onListSpace = function(oEvent) {
		const oItem = this._oList.getItems().find((oListItem) => oListItem.getFocusDomRef() === oEvent.target);
		if (oItem) {
			oEvent.preventDefault();
			this._toggleItem(oItem);
		}
	};

	/**
	 * Opens the Combine dialog.
	 *
	 * @returns {Promise} Resolves when the user confirms the selection, rejects with a
	 * {@link sap.ui.fl.util.CancelError} when the user cancels
	 */
	CombineDialog.prototype.open = async function() {
		this._initModelFromProperties();
		this._oDialog = await Fragment.load({
			id: this.getId(),
			name: "sap.ui.rta.plugin.CombineDialog",
			controller: this
		});
		this._oDialog.addStyleClass(Utils.getRtaStyleClassName());
		this._oDialog.setModel(this._oDialogModel);
		this._oDialog.setModel(this.oRTAResourceModel, "i18n");

		// The list items are not part of a list selection mode, so Enter is handled via the item's
		// press event and Spacebar has to be handled explicitly to keep the entries keyboard-selectable.
		this._oList = Element.getElementById(`${this.getId()}--rta_combineDialogList`);
		this._oList.addEventDelegate({ onsapspace: this._onListSpace.bind(this) });

		this._oDialog.attachAfterOpen(function() {
			this.fireOpened();
		}.bind(this));
		this._oDialog.attachAfterClose(function() {
			this._oDialog.destroy();
			this._oDialog = null;
		}.bind(this));

		return new Promise(function(resolve, reject) {
			this._fnResolveOnConfirm = resolve;
			this._fnRejectOnCancel = reject;
			this._oDialog.open();
		}.bind(this));
	};

	/**
	 * Confirms the dialog: closes it and resolves the open promise.
	 *
	 * @private
	 */
	CombineDialog.prototype._submitDialog = function() {
		this._oDialog.close();
		this._fnResolveOnConfirm();
	};

	/**
	 * Cancels the dialog: closes it and rejects the open promise.
	 *
	 * @private
	 */
	CombineDialog.prototype._cancelDialog = function() {
		this._oDialog.close();
		this._fnRejectOnCancel(new CancelError());
	};

	return CombineDialog;
});
