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
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/rta/Utils"
], function(
	ManagedObject,
	Element,
	Fragment,
	CancelError,
	JSONModel,
	ResourceModel,
	Filter,
	FilterOperator,
	Sorter,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.plugin.additionalElements.AddElementsDialog control.
	 *
	 * @class Context - Dialog for available Fields in Runtime Authoring
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.plugin.additionalElements.AddElementsDialog
	 */
	const AddElementsDialog = ManagedObject.extend("sap.ui.rta.plugin.additionalElements.AddElementsDialog", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				businessContextVisible: {
					type: "boolean",
					defaultValue: false
				},
				title: {
					type: "string"
				}
			},
			events: {
				opened: {},
				triggerExtensibilityAction: {}
			}
		}
	});

	/**
	 * Initialize the Dialog
	 *
	 * @private
	 */
	AddElementsDialog.prototype.init = function() {
		this._oDialogModel = new JSONModel({
			elements: [],
			customFieldButtonText: "",
			customFieldButtonVisible: false,
			businessContextVisible: false,
			customFieldButtonTooltip: "",
			businessContextTexts: [{ text: "" }], // empty element in first place to be replaced by the headerText (see: addExtensibilityInfo)
			extensibilityMenuButtonActive: false,
			extensibilityMenuButtonText: "",
			extensibilityMenuButtonTooltip: "",
			extensibilityOptions: []
		});

		this._bDescendingSortOrder = false;
		this.oRTAResourceModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
	};

	AddElementsDialog.prototype.exit = function(...aArgs) {
		if (this._oDialog) {
			this._oDialog.destroy();
		}

		if (ManagedObject.prototype.exit) {
			ManagedObject.prototype.exit.apply(this, aArgs);
		}
	};

	/**
	 * Create the Add Elements Dialog
	 *
	 * @private
	 */
	AddElementsDialog.prototype._createDialog = function() {
		Fragment.load({
			id: this.getId(),
			name: "sap.ui.rta.plugin.additionalElements.AddElementsDialog",
			controller: this
		}).then(function(oDialog) {
			this._oDialog = oDialog;
			this._oDialog.addStyleClass(Utils.getRtaStyleClassName());
			this._oDialog.setModel(this._oDialogModel);
			this._oDialog.setModel(this.oRTAResourceModel, "i18n");

			this._oDialogModel.setProperty("/listNoDataText", this.oRTAResourceModel.getProperty("MSG_NO_FIELDS").toLowerCase());

			// retrieve List to set the sorting for the 'items' aggregation, since sap.ui.model.Sorter
			// does not support binding to a model property...
			this._oList = Element.getElementById(`${this.getId()}--rta_addElementsDialogList`);
			this._openDialog();
		}.bind(this));
	};

	/**
	 * Open and set up Add Elements Dialog
	 *
	 * @private
	 */
	AddElementsDialog.prototype._openDialog = function() {
		this._oDialog.attachAfterOpen(function() {
			this.fireOpened();
		}.bind(this));

		this._oDialog.attachAfterClose(function() {
			this._oDialog.destroy();
			this._oDialog = null;
			// The resolve/reject is handled by the specific dialog close methods (_submitDialog/_cancelDialog)
		}.bind(this));

		this._oDialog.open();
	};

	AddElementsDialog.prototype.setCustomFieldButtonVisible = function(bVisible) {
		this._oDialogModel.setProperty("/customFieldButtonVisible", bVisible);
	};

	AddElementsDialog.prototype.getCustomFieldButtonVisible = function() {
		return this._oDialogModel.getProperty("/customFieldButtonVisible");
	};

	/**
	 * Close the dialog.
	 */
	AddElementsDialog.prototype._submitDialog = function() {
		this._oDialog.close();
		this._fnResolveOnDialogConfirm();
		// indicate that the dialog has been closed and the selected fields (if any) are to be added to the UI
	};

	/**
	 * Close dialog. Dialog is destroyed.
	 */
	AddElementsDialog.prototype._cancelDialog = function() {
		// clear all selections
		this._oDialogModel.getObject("/elements").forEach(function(oElem) {
			oElem.selected = false;
		});
		this._oDialog.close();
		// indicate that the dialog has been closed without choosing to add any fields (canceled)
		this._fnRejectOnDialogCancel(new CancelError());
	};

	AddElementsDialog.prototype.setElements = function(aElements) {
		this._oDialogModel.setProperty("/elements", aElements);
	};

	AddElementsDialog.prototype.getElements = function() {
		return this._oDialogModel.getProperty("/elements");
	};

	AddElementsDialog.prototype.getSelectedElements = function() {
		return this._oDialogModel.getObject("/elements").filter(function(oElement) {
			return oElement.selected;
		});
	};

	/**
	 * Open the Field Repository Dialog
	 *
	 * @returns {Promise} Promise that resolves once the dialog is opened
	 * @public
	 */
	AddElementsDialog.prototype.open = function() {
		return new Promise(function(resolve, reject) {
			this._fnResolveOnDialogConfirm = resolve;
			this._fnRejectOnDialogCancel = reject;
			this._createDialog();
		}.bind(this));
	};

	/**
	 * Resort the list
	 *
	 * @private
	 */
	AddElementsDialog.prototype._resortList = function() {
		this._bDescendingSortOrder = !this._bDescendingSortOrder;
		const oBinding = this._oList.getBinding("items");
		const aSorter = [];
		aSorter.push(new Sorter("label", this._bDescendingSortOrder));
		oBinding.sort(aSorter);
	};

	/**
	 * Updates the model on filter events
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._updateModelFilter = function(oEvent) {
		const sValue = oEvent.getParameter("newValue");
		const oBinding = this._oList.getBinding("items");
		if ((typeof sValue) === "string") {
			const oFilterLabel = new Filter("label", FilterOperator.Contains, sValue);
			const oOriginalLabelFilter = new Filter("originalLabel", FilterOperator.Contains, sValue);
			const oParentPropertyNameFilter = new Filter("parentPropertyName", FilterOperator.Contains, sValue);
			const oDuplicateNameFilter = new Filter("duplicateName", FilterOperator.EQ, true);
			const oParentNameFilter = new Filter({ filters: [oParentPropertyNameFilter, oDuplicateNameFilter], and: true });
			const oFilterLabelOrInfo = new Filter({ filters: [oFilterLabel, oOriginalLabelFilter, oParentNameFilter], and: false });
			oBinding.filter([oFilterLabelOrInfo]);
		} else {
			oBinding.filter([]);
		}
	};

	/**
	 * Fire an event to redirect to the extensibility action
	 * @param {string} sActionKey - Key for the mapping of specific actions (e.g. which URI to open for given extension data)
	 * @private
	 */
	AddElementsDialog.prototype._redirectToExtensibilityAction = function(sActionKey) {
		this.fireTriggerExtensibilityAction({ actionKey: sActionKey });
		this._oDialog.close();
	};

	AddElementsDialog.prototype.setTitle = function(sTitle) {
		this.setProperty("title", sTitle, true);
		this._oDialogModel.setProperty("/dialogTitle", sTitle);
	};

	/**
	 * Sets the information for the extensibility menu button items
	 *
	 * @param {object} oExtensibilityInfo - Information for the extensibility menu button
	 * @param {string} oExtensibilityInfo.UITexts.buttonText - Text for the extensibility MenuButton
	 * @param {string} oExtensibilityInfo.UITexts.tooltip - Tooltip for the extensibility MenuButton
	 * @param {object[]} oExtensibilityInfo.UITexts.options - Options available on the extensibility MenuButton
	 * @public
	 */
	AddElementsDialog.prototype.setExtensibilityOptions = function(oExtensibilityInfo) {
		const aExtensibilityOptions = oExtensibilityInfo.UITexts.options;

		this._oDialogModel.setProperty("/extensibilityOptions", aExtensibilityOptions);
		if (aExtensibilityOptions.length === 1) {
			// if there is only one option, we can directly set the button text
			this._oDialogModel.setProperty("/customFieldButtonText", aExtensibilityOptions[0].text);
			if (aExtensibilityOptions[0]?.tooltip) {
				this._oDialogModel.setProperty("/customFieldButtonTooltip", aExtensibilityOptions[0].tooltip);
			}
			this.setCustomFieldButtonVisible(true);
		} else {
			this._oDialogModel.setProperty("/extensibilityMenuButtonActive", true);
			this._oDialogModel.setProperty("/extensibilityMenuButtonText", oExtensibilityInfo.UITexts.buttonText);
			this._oDialogModel.setProperty("/extensibilityMenuButtonTooltip", oExtensibilityInfo.UITexts.tooltip);
		}
	};

	AddElementsDialog.prototype.getExtensibilityOptions = function() {
		return this._oDialogModel.getProperty("/extensibilityOptions");
	};

	/**
	 * Sets the visibility of the business context container
	 *
	 * @param {boolean} bBusinessContextVisible - Indicates whether the container is visible
	 * @private
	 */
	AddElementsDialog.prototype._setBusinessContextVisible = function(bBusinessContextVisible) {
		this.setProperty("businessContextVisible", bBusinessContextVisible, true);
		this._oDialogModel.setProperty("/businessContextVisible", bBusinessContextVisible);
	};

	/**
	 * Adds extensibility info - business contexts, UI Texts, etc...
	 * @param {object} oExtensibilityInfo - Extensibility Info
	 * @public
	 */
	AddElementsDialog.prototype.addExtensibilityInfo = function(oExtensibilityInfo) {
		const aContexts = oExtensibilityInfo?.extensionData;
		// clear old values from last run
		this._removeExtensionDataTexts();

		const aBusinessContextTexts = this._oDialogModel.getObject("/businessContextTexts");
		if (aContexts && aContexts.length > 0) {
			aContexts.forEach(function(oContext) {
				aBusinessContextTexts.push({
					text: oContext.description
				});
			}, this);
		} else {
			// Message "none" when no extension data is available
			aBusinessContextTexts.push({
				text: this.oRTAResourceModel.getProperty("MSG_NO_BUSINESS_CONTEXTS")
			});
		}
		// set the container visible
		this._setBusinessContextVisible(true);

		// the first entry is always the "header" to be set by the implementation of FieldExtensibility
		// it is set during the instantiation of the model, in the 'init' function
		this._oDialogModel.setProperty("/businessContextTexts/0/text", oExtensibilityInfo?.UITexts?.headerText);
	};

	/**
	 * Removes extension data from the vertical layout
	 * (except for the title)
	 * @private
	 */
	AddElementsDialog.prototype._removeExtensionDataTexts = function() {
		const aBusinessContextTexts = this._oDialogModel.getObject("/businessContextTexts");
		aBusinessContextTexts.splice(1);
	};

	return AddElementsDialog;
});
