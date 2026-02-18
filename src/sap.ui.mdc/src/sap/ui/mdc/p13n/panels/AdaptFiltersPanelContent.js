/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/model/json/JSONModel",
	"sap/m/p13n/QueryPanel",
	"sap/ui/core/Icon",
	"sap/ui/model/Sorter",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/HBox",
	"sap/ui/model/Filter",
	"sap/ui/core/ListItem",
	"sap/m/ComboBox",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/GroupHeaderListItem",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/core/library",
	"sap/m/table/Util",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/ui/core/InvisibleText",
	"sap/ui/Device",
	"sap/ui/layout/VerticalLayout"
], (Library, JSONModel, QueryPanel, Icon, Sorter, OverflowToolbar, ToolbarSpacer, Title, Label, HBox, Filter, Item, ComboBox, List, CustomListItem, GroupHeaderListItem, Grid, GridData, SegmentedButton, SegmentedButtonItem, coreLib, TableUtil, Button, ToggleButton, InvisibleText, Device, VerticalLayout) => {
	"use strict";

	const { ValueState } = coreLib;

	const AdaptFiltersPanelContent = QueryPanel.extend("sap.ui.mdc.p13n.panels.AdaptFiltersPanelContent", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				itemFactory: {
					type: "function"
				},
				defaultView: {
					type: "string",
					defaultValue: "list"
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	AdaptFiltersPanelContent.prototype.GROUP_KEY = "group";
	AdaptFiltersPanelContent.prototype.CHANGE_REASON_FILTER = "Filter";
	AdaptFiltersPanelContent.prototype.CHANGE_REASON_SHOW = "Show";
	AdaptFiltersPanelContent.prototype.CHANGE_REASON_HIDE = "Hide";
	AdaptFiltersPanelContent.prototype.LIST_KEY = "list";
	AdaptFiltersPanelContent.prototype.PRESENCE_ATTRIBUTE = "visible";
	AdaptFiltersPanelContent.prototype.CONTROL_MODEL = "$sap.ui.mdc.p13n";

	AdaptFiltersPanelContent.prototype.applySettings = function(mSettings) {
		QueryPanel.prototype.applySettings.apply(this, arguments);

		const sDefaultView = this.getDefaultView();
		this._oViewModel = new JSONModel({
			editable: true,
			grouped: sDefaultView === this.GROUP_KEY,
			selectedKey: sDefaultView
		});
		this.setModel(this._oViewModel, this.CONTROL_MODEL);
	};

	AdaptFiltersPanelContent.prototype.setP13nData = function(aP13nData) {
		aP13nData = this._enhanceP13nData(aP13nData);
		this._getP13nModel().setProperty("/items", aP13nData);
		this._bindList();
		this._updateAddFilterVisibility();
		return this;
	};

	AdaptFiltersPanelContent.prototype.restoreDefaults = function() {
		this._oViewModel.setProperty("/grouped", false);
		this._oViewModel.setProperty("/editable", true);
		this._updateFilterFieldsEditMode("edit");
		this._oModeButton.setSelectedKey("edit");
		this._oCurrentViewKey = this.LIST_KEY;
		this._bindList();

		this._getSearchField().setValue("");
		this._filterByModeAndSearch();
	};

	AdaptFiltersPanelContent.prototype.setP13nModel = function(oModel) {
		this.setModel(oModel, this.P13N_MODEL);
		this.setP13nData(oModel.getData());
		this._filterByModeAndSearch();
	};

	AdaptFiltersPanelContent.prototype.getP13nModel = function() {
		return this.getModel(this.P13N_MODEL);
	};

	AdaptFiltersPanelContent.prototype.getSelectedFields = function() {
		return this._getP13nModel().getProperty("/items").filter((oItem) => {
			return oItem[this.PRESENCE_ATTRIBUTE] && oItem.visibleInDialog;
		}).map((oItem) => {
			return oItem.name;
		});
	};

	AdaptFiltersPanelContent.prototype._enhanceP13nData = function(aP13nData) {
		// Determine items that are currently not visible in the filterbar, but should be visible in the panel
		const aFilteredInvisibleItems = aP13nData.filter((oItem) => oItem.isFiltered && !oItem.visible).slice();
		aFilteredInvisibleItems.forEach((oItem) => {
			const aExistingItems = this._getP13nModel().getProperty("/items");
			if (!aExistingItems) {
				return;
			}
			const oOldItem = aExistingItems.find((oExistingItem) => oExistingItem.name === oItem.name);

			if (!oOldItem || oOldItem.position == -1) {
				return;
			}

			// Save position and a temp variable to re-insert the item later
			oItem.position = oOldItem.position;
			oItem.oldPosition = oOldItem.position;
		});

		// Ensure correct sort order
		this._sortItems(aFilteredInvisibleItems);
		this._sortItems(aP13nData);

		// Re-insert the filtered invisible items at their old position
		// and shift other items accordingly
		for (const oItem of aFilteredInvisibleItems) {
			if (oItem.oldPosition === -1) {
				break;
			}

			for (let i = oItem.oldPosition; i < aP13nData.length; i++) {
				if (aP13nData[i].name == oItem.name) {
					aP13nData[i].position = oItem.oldPosition;
					continue;
				}

				if (aP13nData[i] && aP13nData[i].position !== -1) {
					aP13nData[i].position++;
				}
			}

			// Delete temp variable and re-sort the array for next insertion
			delete oItem.oldPosition;
			this._sortItems(aP13nData);
		}

		return aP13nData;
	};

	AdaptFiltersPanelContent.prototype._setInnerLayout = function() {
		const oVBox = new VerticalLayout({
			width: "100%",
			content: [
				this._oListControl,
				this._getAddFilterSection()
			]
		});
		this.setAggregation("_content", oVBox);
	};

	AdaptFiltersPanelContent.prototype._createInnerListControl = function() {
		const oDragDropConfig = this._getDragDropConfig();
		oDragDropConfig.bindProperty("enabled", {
			parts: [
				`${this.CONTROL_MODEL}>/editable`,
				`${this.CONTROL_MODEL}>/grouped`
			],
			formatter: (bEditable, bGrouped) => {
				return !bEditable && !bGrouped;
			}
		});
		oDragDropConfig.setKeyboardHandling(true);

		const oList = new List(this.getId() + "-innerP13nList", {
			ariaLabelledBy: this.getId() + "-title",
			dragDropConfig: oDragDropConfig,
			keyboardMode: "Edit",
			headerToolbar: this._getToolbar(),
			selectionChange: this._onSelectionChange.bind(this)
		});

		return oList;
	};

	AdaptFiltersPanelContent.prototype._getToolbar = function() {
		if (!this._oToolbar) {
			this._oToolbar = new OverflowToolbar({
				content: [
					new Title(this.getId() + "-title", { text: this._getResourceText("adaptFiltersPanel.TOOLBAR_TITLE") }),
					new ToolbarSpacer(),
					this._getSearchField(),
					this._getModeButton()
				]
			});
		}
		return this._oToolbar;
	};

	AdaptFiltersPanelContent.prototype._getModeButton = function() {
		if (!this._oModeButton) {
			this._oModeButton = new SegmentedButton({
				visible: `{=%{${this.CONTROL_MODEL}>/grouped} === false}`,
				selectedKey: "edit",
				items: [
					new SegmentedButtonItem({
						key: "edit",
						text: this._getResourceText("adaptFiltersPanel.VIEW_MODE_EDIT")
					}),
					new SegmentedButtonItem({
						key: "sort",
						text: this._getResourceText("adaptFiltersPanel.VIEW_MODE_SORT")
					})
				],
				selectionChange: this._onModeChange.bind(this)
			});
		}
		return this._oModeButton;
	};

	AdaptFiltersPanelContent.prototype._onModeChange = function(oEvent) {
		const oItem = oEvent.getParameter("item");
		const sKey = oItem.getKey();

		this._updateFilterFieldsEditMode(sKey);

		const bEditable = sKey === "edit";
		this._oViewModel.setProperty("/editable", bEditable);

		this._oListControl.setKeyboardMode(bEditable ? "Edit" : "Navigation");
	};

	/**
	 * Updates the edit mode of all filter fields in the list
	 * @param {string} sMode The mode key ("edit" or "sort")
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._updateFilterFieldsEditMode = function(sMode) {
		const aItems = this._oListControl.getItems();

		aItems.forEach((oItem) => {
			if (oItem.isA("sap.m.CustomListItem")) {
				const [oControl] = oItem.getContent()[0].getContent()[1].getItems();

				if (sMode === "sort") {
					if (oControl.isA("sap.ui.mdc.FilterField")) {
						oControl.setEditMode("Disabled");
					} else {
						oControl.setEnabled?.(false);
					}
				}
				if (sMode === "edit") {
					if (oControl.isA("sap.ui.mdc.FilterField")) {
						oControl.setEditMode("Editable");
					} else {
						oControl.setEnabled?.(true);
					}
				}
			}
		});
	};

	AdaptFiltersPanelContent.prototype._getAddFilterSection = function() {
		if (!this._oAddFilterSelect) {
			this._oKeySelect = this._createKeySelect().setLayoutData(new GridData({
				span: "XL5 L5 M5 S12"
			}));
			const oLabel = new Label({
				text: this._getResourceText("adaptFiltersPanel.ADD_FILTER_LABEL"),
				showColon: true,
				labelFor: this._oKeySelect,
				vAlign: "Middle",
				width: "100%",
				wrapping: true
			}).setLayoutData(new GridData({
				span: "XL2 L2 M2 S12"
			})).addStyleClass("sapUiMDCAdaptFiltersPanelFilterLabel");

			this._oAddFilterSelect = new Grid({
				containerQuery: true,
				width: "100%",
				hSpacing: 0.5,
				content: [oLabel, this._oKeySelect]
			}).addStyleClass("sapUiMDCAdaptFiltersPanelAddFilterSection");
		}
		return this._oAddFilterSelect;
	};

	AdaptFiltersPanelContent.prototype._createKeySelect = function() {
		const oComboBox = new ComboBox({
			width: "100%",
			placeholder: this._getPlaceholderText(),
			change: (oEvt) => {
				const oComboBox = oEvt.getSource();
				const newValue = oEvt.getParameter("newValue");

				oComboBox.setValueState(newValue && !oComboBox.getSelectedItem() ? ValueState.Error : ValueState.None);

				this._selectKey(oComboBox);

				// Workaround. If the item is pressed, item title is set despite clearing selection
				setTimeout(() => oComboBox.clearSelection(), 100);
			}
		});

		return oComboBox;
	};

	AdaptFiltersPanelContent.prototype._updateAddFilterVisibility = function() {
		// if (!this._oAddFilterSelect) {
		// 	return;
		// }
		const bHasInvisibleItems = this._getP13nModel().getProperty("/items").some((oItem) => {
			// Only show add filter section if there are items that are not visible AND not required
			return !oItem[this.PRESENCE_ATTRIBUTE] && !oItem.required;
		});

		this._oAddFilterSelect.setVisible(bHasInvisibleItems);

		const bIsGrouped = this._oViewModel.getProperty("/grouped");
		this._oKeySelect.bindItems(this._getKeySelectBindingInfos(bIsGrouped));
	};

	AdaptFiltersPanelContent.prototype._getKeySelectBindingInfos = function(bIsGrouped) {
		const oBindingInfo = {
			path: `${this.P13N_MODEL}>/items`,
			filters: [
				new Filter(this.PRESENCE_ATTRIBUTE, "EQ", false),
				new Filter("required", "NE", true)  // Exclude required items
			],
			template: new Item({
				key: { path: `${this.P13N_MODEL}>name` },
				text: { path: `${this.P13N_MODEL}>label` }
			})
		};

		if (bIsGrouped) {
			oBindingInfo.sorter = new Sorter({
				path: "group",
				descending: false,
				group: this._getGroup.bind(this)
			});
		} else {
			// Always sort alphabetically by label when not grouped
			oBindingInfo.sorter = new Sorter("label", false);
		}

		return oBindingInfo;
	};

	/**
	 * Binds the list to the p13n model, depending on the current view mode.
	 */
	AdaptFiltersPanelContent.prototype._bindList = function() {
		const oBindingInfo = {
			path: `${this.P13N_MODEL}>/items`,
			factory: this._getItemFactory.bind(this),
			templateShareable: false
		};

		const bIsGrouped = this._oViewModel.getProperty("/grouped");
		if (bIsGrouped) {
			oBindingInfo.sorter = new Sorter({
				path: "group",
				descending: false,
				group: this._getGroup.bind(this)
			});
			oBindingInfo.groupHeaderFactory = this._groupHeaderFactory.bind(this);
		} else {
			oBindingInfo.sorter = new Sorter({
				path: "position",
				descending: false,
				comparator: (iPosition1, iPosition2) => {
					if (iPosition1 === iPosition2) {
						return 0;
					}
					if (iPosition1 === -1) {
						return 1;
					}
					if (iPosition2 === -1) {
						return -1;
					}
					return iPosition1 - iPosition2;
				}
			});
		}

		this._oListControl.removeAllItems();
		this._oListControl.bindItems(oBindingInfo);
	};

	AdaptFiltersPanelContent.prototype._getGroup = function(oContext) {
		return {
			key: oContext.getProperty("group"),
			text: oContext.getProperty("groupLabel") || this._getResourceText("adaptFiltersPanel.GROUP_DEFAULT")
		};
	};

	AdaptFiltersPanelContent.prototype._groupHeaderFactory = function(oGroup) {
		return new GroupHeaderListItem({
			title: oGroup.text,
			visible: {
				path: `${this.P13N_MODEL}>/items`,
				// Only show group, if items are actually in it
				formatter: (aItems) => {
					return aItems.some((oItem) => {
						const bBelongsToGroup = oItem.group === oGroup.key;
						const bVisibleInDialog = oItem.visibleInDialog === true;
						const bItemVisible = oItem[this.PRESENCE_ATTRIBUTE] || oItem.isFiltered || oItem.position >= 0;
						return bBelongsToGroup && bVisibleInDialog && bItemVisible;
					});
				}
			}
		});
	};


	/**
	 * Factory for the list items used in the list.
	 * @param {string} sId id of the item
	 * @param {sap.ui.model.ContextBinding} oContext context of the item
	 * @returns {sap.m.CustomListItem} the list item for the current context
	 */
	AdaptFiltersPanelContent.prototype._getItemFactory = function(sId, oContext) {
		const oGrid = this._createItemGrid(oContext);

		const oRow = new CustomListItem({
			content: oGrid,
			selected: { path: `${this.P13N_MODEL}>${this.PRESENCE_ATTRIBUTE}` },
			visible: {
				parts: [
					`${this.P13N_MODEL}>${this.PRESENCE_ATTRIBUTE}`,
					`${this.P13N_MODEL}>isFiltered`,
					`${this.P13N_MODEL}>position`,
					`${this.P13N_MODEL}>visibleInDialog`
				],
				formatter: (bVisible, bIsFiltered, iPosition, visibleInDialog) => {
					return visibleInDialog && (bVisible || bIsFiltered || iPosition >= 0);
				}
			}
		});
		const bIsMac = Device.os.macintosh;
		const oInvisibleTextReordering = new InvisibleText({
			id: oRow.getId() + "-reorderingInfo",
			text: {
				parts: [
					`${this.CONTROL_MODEL}>/editable`
				],
				formatter: (bEditable) => {
					if (!bEditable) {
						return bIsMac ? this._getResourceText("adaptFiltersPanel.REORDERING_SHORTCUT_MAC") : this._getResourceText("adaptFiltersPanel.REORDERING_SHORTCUT_WINDOWS");
					}
					// return empty string because for edit mode no reordering info is needed
					return "";
			}}
		});
		oRow.addAriaLabelledBy(oInvisibleTextReordering);
		oRow.addContent(oInvisibleTextReordering);
		return oRow;
	};

	/**
	 * Creates the label for a filter item.
	 * @param {object} oItem item data for the filter
	 * @returns {sap.m.Label} the label control
	 */
	AdaptFiltersPanelContent.prototype._createFilterLabel = function(oItem) {
		return new Label({
			text: { path: `${this.P13N_MODEL}>label` },
			required: { path: `${this.P13N_MODEL}>required` },
			showColon: true,
			wrapping: true,
			width: "100%",
			wrappingType: "Hyphenated",
			vAlign: "Middle"
		}).addStyleClass("sapUiMDCAdaptFiltersPanelFilterLabel");
	};

	/**
	 * Creates the filter control for a filter item.
	 *
	 * @param {sap.ui.model.ContextBinding} oContext context of the item
	 * @returns {sap.ui.core.Control} the filter control wrapped in an AssociativeControl
	 */
	AdaptFiltersPanelContent.prototype._createFilterControl = function(oContext) {
		const oFilterControl = this.getItemFactory().call(this, oContext);

		let oField = oFilterControl;
		if (oField.isA("sap.ui.mdc.filterbar.p13n.FilterGroupLayout")) {
			[oField] = oFilterControl.getItems();
		}

		if (oField.isA("sap.ui.mdc.FilterField")) {
			oField.detachChange(this._onFieldChange, this);
			oField.attachChange(this._onFieldChange, this);
		}

		oFilterControl.setLayoutData(new GridData({
			span: "XL8 L8 M8 S8"
		}));

		const oFilterClone = oFilterControl.clone();
		if (oFilterClone.isA("sap.ui.mdc.filterbar.p13n.FilterGroupLayout")) {
			oFilterClone.setFilterField(oField);
		}

		return oFilterClone;
	};

	AdaptFiltersPanelContent.prototype._onFieldChange = function(oEvent) {
		const oField = oEvent.getSource();

		const sKey = oField.getPropertyKey();
		const oItem = this.getP13nData().find((oItem) => oItem.name === sKey);

		const bHasConditions = oField.getConditions().length > 0;
		this._updateFilteredState(sKey, bHasConditions);

		if (oItem.required) {
			const oItems = this._oListControl.getItems();
			const oListItem = oItems.find((oLiItem) => {
				return oLiItem.getBindingContext(this.P13N_MODEL)?.getObject().key === oItem.key;
			});

			const [oVisibilityAction] = oListItem.getContent()[0].getContent()[2].getContent();

			this._updateFilteredState(sKey, bHasConditions);

			oVisibilityAction.setEnabled(bHasConditions);
			if (!bHasConditions && !oItem.visible) {
				// If no conditions are set, but the item is required, enforce visibility
				oVisibilityAction.setPressed(true);
				this._updatePresence(sKey, true);
			}
		}

		this.fireChange({
			reason: this.CHANGE_REASON_FILTER,
			item: oItem
		});
	};

	/**
	 * Creates the grid layout for the list item.
	 *
	 * @param {sap.ui.model.ContextBinding} oContext context of the item
	 * @returns {sap.ui.layout.Grid} the grid layout containing the label and filter control
	 */
	AdaptFiltersPanelContent.prototype._createItemGrid = function(oContext) {
		const oItem = oContext.getObject();

		const oLabel = this._createFilterLabel(oItem);
		const oFilterControl = this._createFilterControl(oContext);

		oFilterControl.addAriaLabelledBy?.(oLabel);
		oLabel.setLabelFor(oFilterControl);

		const oDeleteButton = this._createDeleteAction();
		const oSortButton = this._createSortAction();
		const oVisibleButton = this._createVisibilityAction(oContext);

		const oActionContainer = new Grid({
			containerQuery: true,
			hSpacing: 0.25,
			defaultSpan: "XL6 L6 M6 S6",
			content: [oVisibleButton, oDeleteButton, oSortButton]
		}).setLayoutData(new GridData({
			span: "XL2 L2 M2 S4"
		}));

		oLabel.setLayoutData(new GridData({
			span: "XL2 L2 M2 S12"
		}));
		oFilterControl.setLayoutData(new GridData({
			span: "XL8 L8 M8 S8",
			linebreakS: true
		}));

		return new Grid({
			containerQuery: true,
			hSpacing: 0.5,
			defaultSpan: "XL3 L3 M3 S12",
			content: [oLabel, oFilterControl, oActionContainer]
		});
	};

	/**
	 * Creates the delete action button
	 * @returns {sap.m.Button} delete button
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._createDeleteAction = function() {
		return new Button({
			icon: "sap-icon://decline",
			type: "Transparent",
			tooltip: this._getResourceText("adaptFiltersPanel.ACTION_DELETE"),
			visible: {
				parts: [
					`${this.P13N_MODEL}>${this.PRESENCE_ATTRIBUTE}`,
					`${this.P13N_MODEL}>required`,
					`${this.CONTROL_MODEL}>/editable`,
					`${this.P13N_MODEL}>position`
				],
				formatter: (bVisible, bRequired, bEditable, iPosition) => {
					return !bRequired && bEditable;
				}
			},
			press: (oEvent) => {
				const oButton = oEvent.getSource();
				const oListItem = this._getListItemFromControl(oButton);
				this._onRemoveRow(oListItem);
				this._updateAddFilterVisibility();
			}
		});
	};

	/**
	 * Creates the sort action button
	 * @returns {sap.m.Button} sort button
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._createSortAction = function() {
		return new Icon({
			src: "sap-icon://horizontal-grip",
			tooltip: this._getResourceText("adaptFiltersPanel.ACTION_SORT"),
			useIconTooltip: true,
			color: "#000",
			visible: {
				parts: [
					`${this.CONTROL_MODEL}>/editable`,
					`${this.CONTROL_MODEL}>/grouped`
				],
				formatter: (bEditable, bGrouped) => {
					return !bEditable && !bGrouped;
				}
			}
		}).addStyleClass("sapUiMDCAdaptFiltersContentSortIcon");
	};

	AdaptFiltersPanelContent.prototype._createVisibilityAction = function(oContext) {
		const oFilterField = this._getFilterFieldFromItem(oContext);
		const oItem = oContext.getObject();
		const bHasConditions = oFilterField?.isA("sap.ui.mdc.FilterField") ? oFilterField.getConditions().length != 0 : oFilterField?._bHasConditions;

		const oAction = new ToggleButton({
			enabled: oItem.required ? bHasConditions : true,
			pressed: oItem.visible,
			icon: {
				path: `${this.P13N_MODEL}>${this.PRESENCE_ATTRIBUTE}`,
				formatter: (bVisible) => {
					return bVisible ? "sap-icon://show" : "sap-icon://hide";
				}
			},
			tooltip: {
				path: `${this.P13N_MODEL}>${this.PRESENCE_ATTRIBUTE}`,
				formatter: (bVisible) => {
					return bVisible
						? this._getResourceText("adaptFiltersPanel.ACTION_VISIBILITY_SHOW")
						: this._getResourceText("adaptFiltersPanel.ACTION_VISIBILITY_HIDE");
				}
			},
			press: (oEvent) => {
				const oButton = oEvent.getSource();
				const oListItem = this._getListItemFromControl(oButton);
				const sKey = oListItem.getBindingContext(this.P13N_MODEL).getProperty("name");
				const oItem = this.getP13nData().find((oItem) => oItem.name === sKey);
				oItem.visible = !oListItem.getBindingContext(this.P13N_MODEL).getProperty(this.PRESENCE_ATTRIBUTE);

				const bCurrentlyVisible = oListItem.getBindingContext(this.P13N_MODEL).getProperty(this.PRESENCE_ATTRIBUTE);
				this._updatePresence(sKey, !bCurrentlyVisible);

				this.fireChange({
					reason: !bCurrentlyVisible ? this.CHANGE_REASON_SHOW : this.CHANGE_REASON_HIDE,
					item: oItem
				});

			}
		});

		return oAction;
	};

	/**
	 * Helper method to find the parent list item from a control
	 * @param {sap.ui.core.Control} oControl the control to search from
	 * @returns {sap.m.ListItemBase} the parent list item
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._getListItemFromControl = function(oControl) {
		let oParent = oControl.getParent();
		while (oParent && !oParent.isA("sap.m.ListItemBase")) {
			oParent = oParent.getParent();
		}
		return oParent;
	};

	AdaptFiltersPanelContent.prototype._sortItems = function(aItems) {
		aItems.sort((a, b) => {
			if (a.position === -1) { return 1; }
			if (b.position === -1) { return -1; }
			return a.position - b.position;
		});
	};

	AdaptFiltersPanelContent.prototype._getControlFromRow = function(oRow, iIndex) {
		if (!oRow) {
			return null;
		}

		if (oRow.isA("sap.m.GroupHeaderListItem")) {
			return oRow;
		}

		if (oRow?.getContent()[0].getContent) {
			return QueryPanel.prototype._getControlFromRow.call(this, oRow, iIndex);
		}

		const aContent = oRow.getContent()[0].getItems()[1].getContent();

		iIndex ??= 0;
		iIndex = iIndex < 0 ? aContent.length + iIndex : iIndex;

		return aContent[iIndex];
	};

	AdaptFiltersPanelContent.prototype._onRearrange = function(oEvent) {
		const oDraggedItem = oEvent.getParameter("draggedControl");
		const oDroppedItem = oEvent.getParameter("droppedControl");
		const sDropPosition = oEvent.getParameter("dropPosition");
		const iDraggedIndex = this._getModelEntry(oDraggedItem).position;
		const iDroppedIndex = this._getModelEntry(oDroppedItem).position;
		const iActualDroppedIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? 0 : 1);

		this._moveListItem(oDraggedItem, iActualDroppedIndex);
	};

	/**
	 * Event listener for the list item action press event.
	 *
	 * "Delete": Remove item from list, from the filter bar and clear its filter state.
	 * "Sort": No action yet, as drag and drop is part of the whole list item.
	 * @param {object} oEvent event object
	 */
	AdaptFiltersPanelContent.prototype._onListActionPress = function(oEvent) {
		const oAction = oEvent.getParameter("action");

		if (oAction.getType() === "Delete") {
			this._onRemoveRow(oEvent.getParameter("listItem"));
			this._updateAddFilterVisibility();
		}
	};

	AdaptFiltersPanelContent.prototype._onRemoveRow = function(oRow) {
		const sKey = oRow.getBindingContext(this.P13N_MODEL).getProperty("name");
		const oContext = oRow.getBindingContext(this.P13N_MODEL);
		this._updateFocus(oRow);
		this._removeFilteredState(sKey, oContext);
		this._updatePresence(sKey, false);
		this._updatePosition(sKey, false);

		const oItem = this.getP13nData().find((oItem) => oItem.name === sKey);
		this.fireChange({
			reason: this.CHANGE_REASON_REMOVE,
			item: oItem
		});

		const aItems = this._getP13nModel().getProperty("/items");
		this._sortItems(aItems);
		this._getP13nModel().setProperty("/items", aItems);
		this._getP13nModel().checkUpdate(true);
	};

	AdaptFiltersPanelContent.prototype._updateFocus = function(oRow) {
		const iIndex = this._oListControl.getItems().filter((oItem) => oItem.getVisible()).indexOf(oRow);
		const fnUpdateFocusPosition = () => {
			const oItems = this._oListControl.getItems().filter((oItem) => oItem.getVisible());
			if (iIndex >= 0 && iIndex < oItems.length) {
				oItems[iIndex].focus();
			} else {
				oItems[oItems.length - 1].focus();
			}
		};
		this._oListControl.attachEventOnce("updateFinished", fnUpdateFocusPosition);
	};

	/**
	 * Moves the given list item to a new position.
	 *
	 * Note: Changes the position of the item in the p13n model and fires a change event,
	 * position changes therefore require a sorter on the list.
	 * @param {sap.m.ListItemBase} oListItem list item to move
	 * @param {int} iNewIndex new position of the item
	 */
	AdaptFiltersPanelContent.prototype._moveListItem = function(oListItem, iNewIndex) {
		const oItem = this._getModelEntry(oListItem);
		const aItems = this._getP13nModel().getProperty("/items");

		this._sortItems(aItems);
		aItems.splice(aItems.indexOf(oItem), 1);
		aItems.splice(iNewIndex - 1, 0, oItem);
		aItems[iNewIndex - 1].position = iNewIndex - 1;

		aItems.forEach((oItem, iIndex) => {
			if (oItem.position === -1 || !oItem.position) {
				return;
			}
			oItem.position = iIndex;
		});

		this._getP13nModel().setProperty("/items", aItems);
		this._getP13nModel().checkUpdate(true);
		this.fireChange({
			reason: this.CHANGE_REASON_REORDER,
			item: oItem
		});

		// As the List rerenders, the focus is lost. Therefore, we need to set the focus manually to the moved item.
		// Timeout is used to ensure that the rendering is done before focusing.
		setTimeout(() => {
			const aListItems = this._oListControl.getItems().filter((oItem) => oItem.getVisible());
			aListItems[iNewIndex - 1].focus();
		}, 0);
	};

	AdaptFiltersPanelContent.prototype._selectKey = function(oComboBox) {
		const sNewKey = oComboBox.getSelectedKey();
			if (!sNewKey) {
			return;
			}

		const oItem = this.getP13nData().find((oItem) => oItem.name === sNewKey);
		if (oItem) {
			// 1) Get Model /items
			// 2) Get current item position
			// 3) Move item to the spot after the last visible item
			// 4) Set visible = true
			// 5) fire change event with the correct data
			this._updatePresence(sNewKey, true);
			this._updatePosition(sNewKey, true);
			const aItems = this._getP13nModel().getProperty("/items");
			const oNewItem = aItems.find((oItem) => oItem.name === sNewKey);

			let iLastIndex = -1;
			aItems.forEach((oItem, iIndex) => {
				if (oItem[this.PRESENCE_ATTRIBUTE] && oItem.position >= 0 && iIndex > iLastIndex) {
				iLastIndex = iIndex;
				}
			});

			// Remove and insert at new position
			aItems.splice(aItems.indexOf(oNewItem), 1);
			aItems.splice(iLastIndex + 1, 0, oNewItem);
			this._updateAddFilterVisibility();

			this._getP13nModel().setProperty("/items", aItems);
			this._getP13nModel().checkUpdate(true);
			this.fireChange({
				reason: this.CHANGE_REASON_ADD,
				item: this.getP13nData().find((oItem) => oItem.name === sNewKey)
			});

			// Add newly selected item to the Filters of the binding, to ensure it is constantly shown
			// TODO: Discuss whether the Filter should be appended OR whether the filters should be reset
			const oBinding = this._oListControl.getBinding("items");

			if (oBinding.getFilters("Control").length > 0) {
				oBinding.filter(
				new Filter([
				...oBinding.getFilters("Control"),
				new Filter("name", "EQ", oItem.name)
				], false)
				);
			}
			setTimeout(() => setTimeout(() => {
				const aAllItems = this._oListControl.getItems();
				const oAddedItem = aAllItems.find((oListItem) => {
					const oBindingContext = oListItem.getBindingContext(this.P13N_MODEL);
					if (!oBindingContext) {
						return false;
					}
					const oModelEntry = oBindingContext.getObject();
					return oModelEntry && oModelEntry.name === sNewKey;
				});
				oAddedItem?.getContent()[0].getContent()[1].getItems()[0].focus();
			}, 0),
			0);
		}
	};

	AdaptFiltersPanelContent.prototype._updatePresence = function(sKey, bAdd, iNewIndex) {
		const aData = this._getP13nModel().getProperty("/items");
		const iIndex = aData.findIndex((oItem) => oItem.name === sKey);
		if (iIndex < 0) {
			return;
		}

		aData[iIndex][this.PRESENCE_ATTRIBUTE] = bAdd;
		this._getP13nModel().setProperty("/items", aData);
	};

	AdaptFiltersPanelContent.prototype._updatePosition = function(sKey, bVisible) {
		const aData = this._getP13nModel().getProperty("/items");
		const oItem = aData.find((oItem) => oItem.name === sKey);
		let iPosition = oItem.position;

		if (bVisible && (oItem.position === -1 || oItem.position === undefined)) {
			iPosition = aData.reduce((iMax, oItem) => {
				return oItem.position > iMax ? oItem.position : iMax;
			}, -1) + 1;
		} else if (!bVisible) {
			iPosition = -1;
		}

		oItem.position = iPosition;
		this._getP13nModel().setProperty("/items", aData);
	};

	AdaptFiltersPanelContent.prototype._updateVisibleInDialog = function(sKey, bVisible) {
		const aData = this._getP13nModel().getProperty("/items");
		const iIndex = aData.findIndex((oItem) => oItem.name === sKey);
		if (iIndex < 0) {
			return;
		}

		aData[iIndex].visibleInDialog = bVisible;
		this._getP13nModel().setProperty("/items", aData);
	};

	AdaptFiltersPanelContent.prototype._updateFilteredState = function(sKey, bIsFiltered) {
		const aData = this._getP13nModel().getProperty("/items");
		const oItem = aData.find((oItem) => oItem.name === sKey);
		if (!oItem) {
			return;
		}

		oItem.isFiltered = bIsFiltered;
		this._getP13nModel().setProperty("/items", aData);
	};

	AdaptFiltersPanelContent.prototype._removeFilteredState = function(sKey, oContext) {
		const aData = this._getP13nModel().getProperty("/items");
		const iIndex = aData.findIndex((oItem) => oItem.name === sKey);
		if (iIndex < 0) {
			return;
		}
		aData[iIndex].isFiltered = false;

		this._getP13nModel().setProperty("/items", aData);

		if (oContext) {
			const oFilterField = this._getFilterFieldFromItem(oContext);
			if (oFilterField && oFilterField.isA && oFilterField.isA("sap.ui.mdc.FilterField")) {
				oFilterField.setConditions([]);
			}
		}
	};

	AdaptFiltersPanelContent.prototype._filterByModeAndSearch = function() {
		this._sSearchString = this._getSearchField().getValue();

		//Create model filter based on search & mode filter
		const aFilters = this._createFilterQuery();

		//Update value - necessary due to view switch
		this._getSearchField().setValue(this._sSearchString);

		const oBinding = this._oListControl?.getBinding("items");
		if (oBinding) {
			oBinding.filter(aFilters, true);
		}

		return aFilters;
	};

	AdaptFiltersPanelContent.prototype._createFilterQuery = function() {
		let aFiltersSearch = [],
			vFilterMode = [],
			vQueryFilter = [];

		// 1) Check if there is a "search" filtering
		if (this._sSearchString) {
			//Match "Any term starting with"
			//this._oSearchRegex = new RegExp("(?<=^|\\s)" + this._sSearchString + "\\w*", "i");
			aFiltersSearch = [
				new Filter("label", "Contains", this._sSearchString), new Filter("tooltip", "Contains", this._sSearchString)
			];
			vQueryFilter = new Filter(aFiltersSearch, false);
		}

		// 2) Check if the filter combobox has been used and append the filter to the previous filters
		switch (this._sModeKey) {
			case "visible":
				vFilterMode = new Filter("visible", "EQ", true);
				break;
			case "active":
				vFilterMode = new Filter("active", "EQ", true);
				break;
			case "mandatory":
				vFilterMode = new Filter("required", "EQ", true);
				break;
			case "visibleactive":
				vFilterMode = new Filter([
					new Filter("active", "EQ", true), new Filter("visible", "EQ", true)
				], true);
				break;
			default:
		}

		// 3) always add the 'visibleInDialog' filter to the query
		const oVisibleInDialogFilter = new Filter("visibleInDialog", "EQ", true);

		return new Filter([].concat(vQueryFilter, vFilterMode, oVisibleInDialogFilter), true);
	};

	AdaptFiltersPanelContent.prototype._announceSearchUpdate = function() {
		const iVisibleItems = this._oListControl.getItems().filter((oItem) => oItem.getVisible()).length;
		TableUtil.announceTableUpdate(this._getResourceText("adaptFiltersPanel.TOOLBAR_TITLE"), iVisibleItems);
	};

	AdaptFiltersPanelContent.prototype._getModelEntry = function(oItem) {
		const oBindingContext = oItem.getBindingContext(this.P13N_MODEL);
		if (!oBindingContext) {
			return null;
		}
		return oBindingContext.getObject();
	};

	AdaptFiltersPanelContent.prototype._getPlaceholderText = function() {
		return this._getResourceText("adaptFiltersPanel.ADD_FILTER_PLACEHOLDER");
	};

	AdaptFiltersPanelContent.prototype._getResourceText = function(sText, aValue) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : Library.getResourceBundleFor("sap.ui.mdc");
		return sText ? this.oResourceBundle.getText(sText, aValue) : this.oResourceBundle;
	};

	/**
	 * Retrieves the filter field control for a given item.
	 * Uses the item factory to get the actual filter field control.
	 * @param {sap.ui.model.Context} oContext The binding context of the item
	 * @returns {sap.ui.core.Control|null} The filter field control or null if not found
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._getFilterFieldFromItem = function(oContext) {
		if (!this.getItemFactory() || !oContext) {
			return null;
		}

		try {
			// Get the filter field through the item factory
			const oFilterField = this.getItemFactory().call(this, oContext);

			// The filter field might be wrapped in an AssociativeControl in the AdaptFiltersPanel
			// In that case, we need to get the inner control
			if (oFilterField && oFilterField._oFilterField) {
				return oFilterField._oFilterField;
			}

			return oFilterField;
		} catch (e) {
			// Return null if the filter field cannot be retrieved
			return null;
		}
	};

	AdaptFiltersPanelContent.prototype._updateMovement = function(bEnableReorder) {
		return this;
	};

	AdaptFiltersPanelContent.prototype.exit = function() {
		QueryPanel.prototype.exit.apply(this, arguments);
		this._oViewModel?.destroy();
		this._oListControl?.destroy();
		this._oAddFilterSelect?.destroy();

		this._oViewModel = null;
		this._oListControl = null;
		this._oAddFilterSelect = null;
	};

	return AdaptFiltersPanelContent;
});