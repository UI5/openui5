/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/CustomListItem",
	"sap/m/FormattedText",
	"sap/m/GroupHeaderListItem",
	"sap/m/VBox",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/fl/util/CancelError",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/Utils"
], function(
	CustomListItem,
	FormattedText,
	GroupHeaderListItem,
	VBox,
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
	 * Highlights matching text by wrapping it in <strong> tags.
	 * Escapes HTML in the text to prevent XSS.
	 *
	 * @param {string} sText - The text to process
	 * @param {string} sSearchValue - The search value to highlight
	 * @returns {string} The text with matching parts wrapped in <strong> tags
	 * @private
	 */
	function highlightText(sText, sSearchValue) {
		if (!sText) {
			return "";
		}
		if (!sSearchValue) {
			return encodeXML(sText);
		}

		const sLowerText = sText.toLowerCase();
		const sLowerSearch = sSearchValue.toLowerCase();
		const iIndex = sLowerText.indexOf(sLowerSearch);

		if (iIndex === -1) {
			return encodeXML(sText);
		}

		// Split the text into parts: before match, match, after match
		const sBefore = sText.substring(0, iIndex);
		const sMatch = sText.substring(iIndex, iIndex + sSearchValue.length);
		const sAfter = sText.substring(iIndex + sSearchValue.length);

		// Recursively highlight the rest of the text (for multiple occurrences)
		return `${encodeXML(sBefore)}<strong>${encodeXML(sMatch)}</strong>${highlightText(sAfter, sSearchValue)}`;
	}

	/**
	 * Encodes special XML/HTML characters to prevent XSS.
	 *
	 * @param {string} sText - The text to encode
	 * @returns {string} The encoded text
	 * @private
	 */
	function encodeXML(sText) {
		if (!sText) {
			return "";
		}
		return sText
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
	}

	/**
	 * Transforms flat elements array into a flat list with group headers.
	 * Elements without entityTypeDisplayName are placed at the root level (top).
	 * Elements with entityTypeDisplayName are grouped under their entity name with a group header.
	 *
	 * @param {object[]} aElements - Flat array of elements
	 * @param {string} [sFilterValue] - Optional filter value to filter elements
	 * @private
	 */
	function buildElementsList(aElements, sFilterValue) {
		const aRootElements = [];
		const mGroups = {};

		// Filter elements if filter value is provided
		const aFilteredElements = sFilterValue
			? aElements.filter((oElement) => this._elementMatchesFilter(oElement, sFilterValue))
			: aElements;

		// Separate elements into root elements and grouped elements
		aFilteredElements.forEach(function(oElement) {
			if (oElement.entityTypeDisplayName) {
				// Element belongs to an entity group
				mGroups[oElement.entityTypeDisplayName] ||= [];
				mGroups[oElement.entityTypeDisplayName].push(oElement);
			} else {
				// Element has no entity - place at root level
				aRootElements.push(oElement);
			}
		});

		// Sort root elements
		const bDescending = this._bDescendingSortOrder;
		aRootElements.sort(function(a, b) {
			const sLabelA = (a.label || "").toLowerCase();
			const sLabelB = (b.label || "").toLowerCase();
			if (sLabelA < sLabelB) {
				return bDescending ? 1 : -1;
			}
			if (sLabelA > sLabelB) {
				return bDescending ? -1 : 1;
			}
			return 0;
		});

		// Build flat list: root elements first, then group headers with their elements
		const aFlatList = [];

		// Add root elements (without entityTypeDisplayName) first
		aRootElements.forEach(function(oElement) {
			aFlatList.push(oElement);
		});

		// Add groups with their elements (groups sorted alphabetically, elements sorted by label)
		const aGroupNames = Object.keys(mGroups);
		aGroupNames.sort(function(a, b) {
			const sNameA = a.toLowerCase();
			const sNameB = b.toLowerCase();
			if (sNameA < sNameB) {
				return bDescending ? 1 : -1;
			}
			if (sNameA > sNameB) {
				return bDescending ? -1 : 1;
			}
			return 0;
		});

		aGroupNames.forEach(function(sEntityName) {
			// Add group header
			aFlatList.push({
				label: sEntityName,
				isGroupHeader: true
			});

			// Sort and add elements within this group
			const aGroupElements = mGroups[sEntityName];
			aGroupElements.sort(function(a, b) {
				const sLabelA = (a.label || "").toLowerCase();
				const sLabelB = (b.label || "").toLowerCase();
				if (sLabelA < sLabelB) {
					return bDescending ? 1 : -1;
				}
				if (sLabelA > sLabelB) {
					return bDescending ? -1 : 1;
				}
				return 0;
			});

			aGroupElements.forEach(function(oElement) {
				aFlatList.push(oElement);
			});
		});

		this._oDialogModel.setProperty("/elementsFlat", aFlatList);
	}

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
			// empty element in first place to be replaced by the headerText (see: addExtensibilityInfo)
			businessContextTexts: [{ text: "" }],
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
		// Reset filter when new elements are set (e.g., when dialog is reopened)
		this._sCurrentFilterValue = "";
		buildElementsList.call(this, aElements);
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
	 * Factory function to create list items.
	 * Creates GroupHeaderListItem for group headers and CustomListItem for regular elements.
	 *
	 * @param {string} sId - The ID for the new item
	 * @param {sap.ui.model.Context} oContext - The binding context
	 * @returns {sap.m.ListItemBase} The created list item
	 * @private
	 */
	AddElementsDialog.prototype._createListItem = function(sId, oContext) {
		const oData = oContext.getObject();

		if (oData.isGroupHeader) {
			// Create a group header item (no checkbox, acts as a divider)
			return new GroupHeaderListItem(sId, {
				title: "{label}"
			});
		}

		// Get the current filter value for highlighting
		const sFilterValue = this._sCurrentFilterValue;

		// Build the label text with optional parent property name
		let sLabelText = oData.label || "";
		if (oData.parentPropertyName && oData.duplicateName) {
			sLabelText = `${sLabelText} (${oData.parentPropertyName})`;
		}

		// Create label with highlighted text if filter is active
		const sHighlightedLabel = highlightText(sLabelText, sFilterValue);
		const oLabelText = new FormattedText({
			htmlText: sHighlightedLabel
		});

		// Build the original label text with highlighting
		let oOriginalLabel;
		if (oData.originalLabel) {
			const sOriginalLabelText = this.oRTAResourceModel.getProperty("LBL_FREP").replace("{0}", oData.originalLabel);
			const sHighlightedOriginal = highlightText(sOriginalLabelText, sFilterValue);
			oOriginalLabel = new FormattedText({
				htmlText: sHighlightedOriginal
			});
		}

		const aVBoxItems = [oLabelText];
		if (oOriginalLabel) {
			aVBoxItems.push(oOriginalLabel);
		}

		const oVBox = new VBox({
			items: aVBoxItems
		});

		return new CustomListItem(sId, {
			content: [oVBox],
			type: "Active",
			selected: "{selected}",
			tooltip: "{tooltip}"
		}).addStyleClass("sapUIRtaListItem");
	};

	/**
	 * Resort the list by rebuilding it with sorted elements
	 *
	 * @private
	 */
	AddElementsDialog.prototype._resortList = function() {
		this._bDescendingSortOrder = !this._bDescendingSortOrder;
		buildElementsList.call(this, this._oDialogModel.getProperty("/elements"), this._sCurrentFilterValue);
		this._rebindList();
	};

	/**
	 * Updates the model on filter events by rebuilding the list with filtered elements
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._updateModelFilter = function(oEvent) {
		const sValue = oEvent.getParameter("newValue");
		this._sCurrentFilterValue = sValue;
		buildElementsList.call(this, this._oDialogModel.getProperty("/elements"), sValue);
		this._rebindList();
	};

	/**
	 * Rebinds the list items to force recreation with updated highlighting
	 *
	 * @private
	 */
	AddElementsDialog.prototype._rebindList = function() {
		if (this._oList) {
			// Unbind and rebind to force factory function to be called again
			this._oList.bindItems({
				path: "/elementsFlat",
				factory: this._createListItem.bind(this)
			});
		}
	};

	/**
	 * Checks if an element matches the filter criteria
	 *
	 * @param {object} oElement - The element to check
	 * @param {string} sFilterValue - The filter value to match
	 * @returns {boolean} True if the element matches the filter
	 * @private
	 */
	AddElementsDialog.prototype._elementMatchesFilter = function(oElement, sFilterValue) {
		const sLowerFilterValue = sFilterValue.toLowerCase();
		// Check label
		if (oElement.label?.toLowerCase().includes(sLowerFilterValue)) {
			return true;
		}
		// Check originalLabel
		if (oElement.originalLabel?.toLowerCase().includes(sLowerFilterValue)) {
			return true;
		}
		// Check parentPropertyName (only for duplicates)
		if (oElement.duplicateName && oElement.parentPropertyName?.toLowerCase().includes(sLowerFilterValue)) {
			return true;
		}
		return false;
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
