/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/AbstractContainer",
	"sap/m/p13n/AbstractContainerItem",
	"./AdaptFiltersPanelContent",
	"sap/ui/core/Lib",
	"sap/ui/model/Filter",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/ToolbarSpacer",
	"sap/m/SearchField",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/merge",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/m/OverflowToolbarLayoutData"
], (AbstractContainer, AbstractContainerItem, AdaptFiltersPanelContent, Library, Filter, IconTabBar, IconTabFilter, ToolbarSpacer, SearchField, JSONModel, merge, OverflowToolbar, Title, OverflowToolbarLayoutData) => {
	"use strict";

	/**
	 * Constructor for a new AdaptFiltersPanel
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The AdaptFiltersPanel is meant to provide a container for different filter personalization views.
	 * @extends sap.m.p13n.AbstractContainer
	 * @author SAP SE
	 * @private
	 * @since 1.85
	 * @alias sap.ui.mdc.p13n.panels.AdaptFiltersPanel
	 */
	const AdaptFiltersPanel = AbstractContainer.extend("sap.ui.mdc.p13n.panels.AdaptFiltersPanel", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Factory function which can be used to provide custom filter controls
				 */
				itemFactory: {
					type: "function"
				},
				/**
				 * Determines whether the reordering of items should be enabled
				 */
				enableReorder: {
					type: "boolean",
					defaultValue: true
				}
			},
			events: {
				/**
				 * This event is fired if any change has been made within the <code>AdaptFiltersPanel</code> control.
				 */
				change: {
					parameters: {
						/**
						 * The reason why the panel state has changed, for example, filters have been added, removed, hidden, shown, or reordered.
						 */
						reason: {
							type: "string"
						},
						/**
						 * An object containing information about the specific filter item that has been changed.
						 */
						item: {
							type: "object"
						}
					}
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	AdaptFiltersPanel.prototype.GROUP_KEY = "group";
	AdaptFiltersPanel.prototype.LIST_KEY = "list";
	AdaptFiltersPanel.prototype.P13N_MODEL = "$p13n";
	AdaptFiltersPanel.prototype.MODEL_PATH = "/items";

	/**
	 * Destroys all views and header
	 * @private
	 */
	AdaptFiltersPanel.prototype._destroyViews = function() {
		// Destroy all views
		this.removeAllViews().forEach((oView) => {
			oView.destroy();
		});

		// Clear header and subHeader aggregations (this destroys the controls)
		this.setHeader(null);
		this.setSubHeader(null);

		// Destroy the header IconTabBar if it exists
		if (this._oHeader) {
			this._oHeader.destroy();
		}

		// Clear all cached header control references
		// These are either destroyed by aggregations above or will be recreated
		this._oHeader = null;
		this._oGroupModeSelect = null;
		this._oSearchField = null;
		this._oCustomViewToolbar = null;
		this._oCustomViewSearchField = null;

		// Reset cached values
		delete this._bGroupViewInitialized;
		delete this._bListViewInitialized;
	};

	/**
	 * Creates views
	 * @private
	 */
	AdaptFiltersPanel.prototype._createViews = function() {
		const fnChangeFactory = (sPath) => {
			return function(oEvt) {
				this.fireChange(oEvt.getParameters());
				this.getP13nModel().setProperty(sPath, oEvt.getSource().getP13nData(), null, true);
			}.bind(this);
		};

		const oListContent = new AdaptFiltersPanelContent(this.getId() + "-listView", {
			change: fnChangeFactory(this.MODEL_PATH)
		});

		const oGroupContent = new AdaptFiltersPanelContent(this.getId() + "-groupView", {
			defaultView: this.GROUP_KEY,
			change: fnChangeFactory(this.MODEL_PATH)
		});

		this.addView(new AbstractContainerItem({
			key: this.LIST_KEY,
			content: oListContent
		}));

		this.addView(new AbstractContainerItem({
			key: this.GROUP_KEY,
			content: oGroupContent
		}));

		this.getView(this.LIST_KEY).getContent().setEnableReorder(this.getEnableReorder());
		this._createHeader();
	};

	/**
	 * Interface function for <code>sap.m.p13n.Popup</code> to determine that the <code>AdaptFiltersPanel</code> provides its own scrolling capabilites.
	 *
	 * @returns {boolean} The enablement of the vertical scrolling
	 */
	AdaptFiltersPanel.prototype.getVerticalScrolling = function() {
		return false;
	};

	AdaptFiltersPanel.prototype.applySettings = function(mSettings) {
		this._createViews();

		AbstractContainer.prototype.applySettings.apply(this, arguments);

		this.addStyleClass("sapUiMDCAdaptFiltersPanel");
	};

	/**
	 * The itemFactory function should always return the FilterControl instance for the according key.
	 * The <code>AdaptFiltersPanel</code> will take care to properly display the factory item in the
	 * selected view.
	 *
	 * @param {function} fnItemFactory The factory function that is being called with the unique key.
	 * @returns {this} instance for chaining
	 */
	AdaptFiltersPanel.prototype.setItemFactory = function(fnItemFactory) {
		this.setProperty("itemFactory", fnItemFactory);
		this.getViews().forEach((oView) => {
			const oPanel = oView.getContent();
			oPanel.setItemFactory(fnItemFactory);
		});

		return this;
	};

	/**
	 * Can be used to toggle between the different views such as <code>ListView</code> and <code>GroupView</code>
	 *
	 * @param {string} sKey key of the View
	 */
	AdaptFiltersPanel.prototype.switchView = function(sKey) {
		const sPreviousKey = this.getCurrentViewKey();

		// Prepare view switch
		this._prepareViewSwitch(sKey, sPreviousKey);

		// Perform the actual switch
		AbstractContainer.prototype.switchView.call(this, sKey);

		// Update the new view
		const oCurrentViewContent = this.getCurrentViewContent();
		this._getViewSwitch()?.setSelectedKey(this.getCurrentViewKey());

		// Initialize view data
		this._initializeViewData(sKey, oCurrentViewContent);

		// Transfer search value between views
		this._transferSearchValue(sPreviousKey, oCurrentViewContent);

		// Update filtering and layout
		this._filterByModeAndSearch();
		this.oLayout.insertContent(this._oHeader, 0);

		// Handle custom view toolbar
		this._updateCustomViewToolbar(sKey);

		// Update filter fields edit mode
		this._updateViewEditMode(sKey, oCurrentViewContent);
	};

	/**
	 * Prepares the view switch by saving current data and deactivating current view
	 * @param {string} sKey New view key
	 * @param {string} sPreviousKey Previous view key
	 * @private
	 */
	AdaptFiltersPanel.prototype._prepareViewSwitch = function(sKey, sPreviousKey) {
		if (!this._isCustomView(sKey)) {
			// DINC0615996: "Deactivate" the current view - this will prevent events such as updateFinished
			this.getCurrentViewContent()._bInactive = true;
		}

		if (sPreviousKey && !this._isCustomView()) {
			const oCurrentView = this.getCurrentViewContent();
			if (oCurrentView) {
				const aCurrentP13nData = oCurrentView.getP13nData();
				if (aCurrentP13nData && this.getP13nModel()) {
					this.getP13nModel().setProperty(this.MODEL_PATH, aCurrentP13nData, null, true);
				}
			}
		}
	};

	/**
	 * Initializes the new view with p13n data
	 * @param {string} sKey View key
	 * @param {sap.ui.core.Control} oCurrentViewContent The current view content control
	 * @private
	 */
	AdaptFiltersPanel.prototype._initializeViewData = function(sKey, oCurrentViewContent) {
		if (oCurrentViewContent && this.getP13nModel() && !this._isCustomView()) {
			oCurrentViewContent.setP13nData(this.getP13nModel().getProperty(this.MODEL_PATH));
			if (sKey === this.GROUP_KEY) {
				this._bGroupViewInitialized = true;
			} else if (sKey === this.LIST_KEY) {
				this._bListViewInitialized = true;
			}
		}
	};

	/**
	 * Transfers search value from previous view to current view
	 * @param {string} sPreviousKey Previous view key
	 * @param {sap.ui.core.Control} oCurrentViewContent The current view content control
	 * @private
	 */
	AdaptFiltersPanel.prototype._transferSearchValue = function(sPreviousKey, oCurrentViewContent) {
		let sSearch = "";
		if (sPreviousKey) {
			if (this._isCustomView(sPreviousKey)) {
				sSearch = this._getCustomViewSearchField().getValue();
			} else {
				sSearch = this.getView(sPreviousKey).getContent()._getSearchField?.()?.getValue() ?? "";
			}
		}

		if (this._isCustomView()) {
			this._getCustomViewSearchField().setValue(sSearch);
		} else if (oCurrentViewContent?._getSearchField) {
			oCurrentViewContent._getSearchField?.().setValue(sSearch);
		}
	};

	/**
	 * Updates custom view toolbar visibility and title
	 * @param {string} sKey Current view key
	 * @private
	 */
	AdaptFiltersPanel.prototype._updateCustomViewToolbar = function(sKey) {
		if (this._isCustomView()) {
			const oCustomViewToolbar = this._getCustomViewToolbar();
			if (this.oLayout.indexOfContent(oCustomViewToolbar) === -1) {
				this.oLayout.insertContent(oCustomViewToolbar, 1);
			}
			oCustomViewToolbar.setVisible(true);

			const [oTitle] = this._oCustomViewToolbar.getContent();
			if (oTitle) {
				const sViewName = this._mCustomViewTitles?.[sKey] ?? "";
				oTitle.setText(sViewName);
			}
		} else if (this._oCustomViewToolbar) {
			this._oCustomViewToolbar.setVisible(false);
		}
	};

	/**
	 * Updates the edit mode of filter fields in the view
	 * @param {string} sKey View key
	 * @param {sap.ui.core.Control} oCurrentViewContent The current view content control
	 * @private
	 */
	AdaptFiltersPanel.prototype._updateViewEditMode = function(sKey, oCurrentViewContent) {
		if (sKey === this.GROUP_KEY) {
			if (oCurrentViewContent?._updateFilterFieldsEditMode) {
				oCurrentViewContent._updateFilterFieldsEditMode("edit");
			}
		} else if (sKey === this.LIST_KEY) {
			if (oCurrentViewContent?._oViewModel) {
				const bEditable = oCurrentViewContent._oViewModel.getProperty("/editable");
				const sMode = bEditable ? "edit" : "sort";
				oCurrentViewContent._updateFilterFieldsEditMode(sMode);
			}
		}
	};

	/**
	 * Adds custom content to the <code>sap.ui.mdc.p13n.panels.GroupPanelBase</code>
	 *
	 * @param {object} mViewSettings the setting for the custom view
	 * @param {sap.ui.core.Item} mViewSettings.item the item used in the view switch
	 * @param {sap.ui.core.Control} mViewSettings.content the content displayed in the custom view
	 * @param {string} [mViewSettings.title] Title to be displayed in the overflow toolbar for the custom view
	 * @param {function} [mViewSettings.search] callback triggered by search - executed with the string as parameter
	 * @param {function} [mViewSettings.selectionChange] callback triggered by selecting a view - executed with the key as parameter
	 * @param {function} [mViewSettings.reset] callback triggered when restoreDefaults is called - allows custom views to reset their state
	 *
	 * @private
	 * @ui5-restricted sap.ui.comp
	 */
	AdaptFiltersPanel.prototype.addCustomView = function(mViewSettings) {
		const oItem = mViewSettings.item;
		const sKey = oItem.getKey();
		const oContent = mViewSettings.content;
		const fnOnSearch = mViewSettings.search;
		const fnSelectionChange = mViewSettings.selectionChange;
		const fnReset = mViewSettings.reset;

		if (!sKey) {
			throw new Error("Please provide an item of type sap.ui.core.Item with a key to be used in the view switch");
		}

		const oViewSwitch = this._getViewSwitch();
		if (oViewSwitch) {
			const sSelectionChangeEvent = "select";

			oViewSwitch.attachEvent(sSelectionChangeEvent, (oEvt) => {
				if (fnSelectionChange) {
					fnSelectionChange(oEvt.getParameter("item").getKey());
				}
				//Fire search if custom view is selected
				if (this._isCustomView()) {
					if (fnOnSearch instanceof Function) {
						fnOnSearch(this._getSearchField().getValue());
					}
				}
			});
		}

		if (fnOnSearch instanceof Function) {
			const oSearchField = this._getCustomViewSearchField();
			oSearchField.attachLiveChange((oEvt) => {
				if (this._isCustomView()) {
					fnOnSearch(oEvt.getParameter("newValue"));
				}
			});
		}

		this.addView(new AbstractContainerItem({
			key: sKey,
			content: oContent.addStyleClass("sapUiMDCPanelPadding")
		}));

		if (fnReset instanceof Function) {
			this._mCustomViewResetCallbacks = this._mCustomViewResetCallbacks || {};
			this._mCustomViewResetCallbacks[sKey] = fnReset;
		}

		if (mViewSettings.title) {
			this._mCustomViewTitles = this._mCustomViewTitles || {};
			this._mCustomViewTitles[sKey] = mViewSettings.title;
		}
		let oIconTabFilter;
		if (oItem.isA("sap.m.IconTabFilter")) {
			oIconTabFilter = oItem;
		} else {
			oIconTabFilter = new IconTabFilter({
				key: sKey,
				text: oItem.getText()
			});

			// Clone the enabled property/binding from oItem to the new IconTabFilter
			const fnPropertyIsInItem = (sProperty) => oItem && (oItem.getBindingInfo(sProperty) !== undefined || !oItem.isPropertyInitial?.(sProperty));
			const fnExtractBinding = (sProperty) => oItem?.getBindingInfo(sProperty) ?? ({ value: oItem?.getProperty(sProperty) });

			if (fnPropertyIsInItem("enabled")) {
				let oBindingCopy = merge({}, fnExtractBinding("enabled"));
				if (!oBindingCopy.parts) {
					oBindingCopy = { parts: [merge({}, oBindingCopy)] };
				}
				oIconTabFilter.bindProperty("enabled", oBindingCopy);
			}
		}

		oViewSwitch.addItem(oIconTabFilter);
	};

	/**
	 * Determines whether the itemFactory's returned control should be displayed or not.
	 * Note: The according view needs to implement this functionality.
	 *
	 * @param {boolean} bShow Determines if the factory should be displayed or not
	 */
	AdaptFiltersPanel.prototype.showFactory = function(bShow) {
		if (this.getCurrentViewContent().showFactory) {
			this.getCurrentViewContent().showFactory(bShow);
		}
	};

	/**
	 * @returns {array} The currently selected field keys
	 */
	AdaptFiltersPanel.prototype.getSelectedFields = function() {
		return this.getCurrentViewContent().getSelectedFields();
	};

	/**
	 * Can be used to provide a JSON model provided by the <code>P13nBuilder</code>
	 *
	 * @param {sap.ui.model.json.JSONModel} oModel The JSON model instance
	 */
	AdaptFiltersPanel.prototype.setP13nModel = function(oModel) {
		this.setModel(oModel, this.P13N_MODEL);

		const sCurrentView = this.getCurrentViewKey() || this.LIST_KEY;

		// Only initialize the default view, the other view will be initialized lazily when switching to it
		if (sCurrentView === this.GROUP_KEY) {
			this.getView(this.GROUP_KEY).getContent().setP13nData(oModel.getProperty(this.MODEL_PATH));
			this._bGroupViewInitialized = true;
			this._bListViewInitialized = false;
		} else {
			this.getView(this.LIST_KEY).getContent().setP13nData(oModel.getProperty(this.MODEL_PATH));
			this._bListViewInitialized = true;
			this._bGroupViewInitialized = false;
		}
		this._filterByModeAndSearch();
	};

	AdaptFiltersPanel.prototype.setP13nData = function(oP13nData) {
		const oP13nModel = this.getP13nModel();
		if (!oP13nModel) {
			this.setP13nModel(new JSONModel(oP13nData));
		} else {
			oP13nModel.setData(oP13nData);
			// Only update views if they were already initialized (lazy loading)
			if (this._bListViewInitialized) {
				this.getView(this.LIST_KEY).getContent().setP13nData(oP13nModel.getProperty(this.MODEL_PATH));
			}
			if (this._bGroupViewInitialized) {
				this.getView(this.GROUP_KEY).getContent().setP13nData(oP13nModel.getProperty(this.MODEL_PATH));
			}
		}
	};

	/**
	 * Restores the default ui state of the <code>AdaptFiltersPanel</code>.
	 */
	AdaptFiltersPanel.prototype.restoreDefaults = function() {
		this.switchView(this.LIST_KEY);
		this.getView(this.getCurrentViewKey()).getContent().restoreDefaults();

		if (this._oCustomViewSearchField) {
			this._oCustomViewSearchField.setValue("");
		}

		if (this._mCustomViewResetCallbacks) {
			Object.values(this._mCustomViewResetCallbacks).forEach((fnReset) => {
				fnReset();
			});
		}
	};

	/**
	 *
	 * @returns {sap.ui.model.json.JSONModel} The inner p13n model instance
	 */
	AdaptFiltersPanel.prototype.getP13nModel = function() {
		return this.getModel(this.P13N_MODEL);
	};

	AdaptFiltersPanel.prototype._createHeader = function() {
		if (this._oHeader) {
			return this._oHeader;
		}

		this._oHeader = new IconTabBar(this.getId() + "-header", {
			selectedKey: this.LIST_KEY,
			applyContentPadding: false,
			expandable: false,
			items: [
				new IconTabFilter(this.getId() + "-listTabFilter", {
					key: this.LIST_KEY,
					text: this._getResourceText("adaptFiltersPanel.LIST")
				}),
				new IconTabFilter(this.getId() + "-groupTabFilter", {
					key: this.GROUP_KEY,
					text: this._getResourceText("adaptFiltersPanel.GROUP")
				})
			],
			select: (oEvent) => {
				const sKey = oEvent.getParameter("key");
				this.switchView(sKey);
			}
		});

		this.oLayout.insertContent(this._oHeader, 0);
		this.oLayout.setShowHeader(false);
		return this._oHeader;
	};

	AdaptFiltersPanel.prototype._getSearchField = function() {
		if (this._isCustomView()) {
			return this._getCustomViewSearchField();
		}
		return this.getCurrentViewContent()._getSearchField?.();
	};

	/**
	 * Creates and returns the SearchField for custom views in the new UI.
	 * @returns {sap.m.SearchField} The search field for custom views
	 * @private
	 */
	AdaptFiltersPanel.prototype._getCustomViewSearchField = function() {
		if (!this._oCustomViewSearchField) {
			this._oCustomViewSearchField = new SearchField(this.getId() + "-customViewSearchField", {
				width: "20rem",
				placeholder: this._getResourceText("p13nDialog.ADAPT_FILTER_SEARCH")
			});
		}
		return this._oCustomViewSearchField;
	};

	/**
	 * Creates and returns the OverflowToolbar for custom views in the new UI.
	 * This toolbar contains a Title and SearchField, similar to the standard views.
	 * @returns {sap.m.OverflowToolbar} The toolbar for custom views
	 * @private
	 */
	AdaptFiltersPanel.prototype._getCustomViewToolbar = function() {
		if (!this._oCustomViewToolbar) {
			const oSearchField = this._getCustomViewSearchField();
			oSearchField.setLayoutData(new OverflowToolbarLayoutData({
				priority: "NeverOverflow"
			}));

			let sViewName = this._getResourceText("adaptFiltersPanel.TOOLBAR_TITLE");
			const sCurrentViewKey = this.getCurrentViewKey();
			if (sCurrentViewKey && this._isCustomView(sCurrentViewKey)) {
				const oViewSwitch = this._getViewSwitch();
				if (oViewSwitch) {
					const aItems = oViewSwitch.getItems();
					const oSelectedItem = aItems.find((oItem) => oItem.getKey() === sCurrentViewKey);
					if (oSelectedItem) {
						sViewName = oSelectedItem.getText();
					}
				}
			}

			this._oCustomViewToolbar = new OverflowToolbar(this.getId() + "-customViewToolbar", {
				content: [
					new Title(this.getId() + "-customViewTitle", {
						text: sViewName,
						layoutData: new OverflowToolbarLayoutData({
							priority: "NeverOverflow"
						})
					}).addStyleClass("sapUiTinyMarginBegin"),
					new ToolbarSpacer(),
					oSearchField
				]
			});
			this._oCustomViewToolbar.addStyleClass("sapUiMDCAdaptFiltersPanelCustomViewToolbar");
		}
		return this._oCustomViewToolbar;
	};

	AdaptFiltersPanel.prototype.getInitialFocusedControl = function() {
		return this._getSearchField();
	};

	AdaptFiltersPanel.prototype._getViewSwitch = function() {
		return this._oHeader;
	};

	AdaptFiltersPanel.prototype._isCustomView = function(sKey) {
		const sViewKey = sKey ?? this._sCurrentView;
		return sViewKey != this.GROUP_KEY && sViewKey != this.LIST_KEY;
	};

	AdaptFiltersPanel.prototype._filterByModeAndSearch = function() {
		this.getCurrentViewContent()._filterByModeAndSearch?.();
	};


	AdaptFiltersPanel.prototype._getResourceText = function(sKey) {
		return Library.getResourceBundleFor("sap.ui.mdc").getText(sKey);
	};

	AdaptFiltersPanel.prototype.exit = function() {
		AbstractContainer.prototype.exit.apply(this, arguments);

		// Destroy all control instances
		this._oInvText?.destroy();
		this._oHeader?.destroy();
		this._oCustomViewToolbar?.destroy();
		this._oCustomViewSearchField?.destroy();

		// Clear all references
		this._oInvText = null;
		this._oHeader = null;
		this._oCustomViewToolbar = null;
		this._oCustomViewSearchField = null;
		this._mCustomViewResetCallbacks = null;
		this._mCustomViewTitles = null;
	};

	return AdaptFiltersPanel;

});