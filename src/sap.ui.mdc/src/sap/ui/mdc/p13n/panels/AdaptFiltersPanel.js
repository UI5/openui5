/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/AbstractContainer",
	"sap/m/p13n/AbstractContainerItem",
	"sap/m/p13n/SelectionPanel",
	"./GroupView",
	"./AdaptFiltersPanelContent",
	"sap/ui/core/Lib",
	"sap/ui/model/Filter",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/ToolbarSpacer",
	"sap/m/Select",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/core/InvisibleText",
	"sap/m/SearchField",
	"sap/ui/core/Item",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/merge"
], (AbstractContainer, AbstractContainerItem, SelectionPanel, GroupView, AdaptFiltersPanelContent, Library, Filter, Button, Bar, IconTabBar, IconTabFilter, ToolbarSpacer, Select, SegmentedButton, SegmentedButtonItem, InvisibleText, SearchField, Item, mLibrary, JSONModel, merge) => {
	"use strict";

	// shortcut for sap.m.BarDesign
	const { BarDesign } = mLibrary;

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
				},
				/**
				 * Whether to use the new UI (true) or legacy UI (false)
				 * Passed from AdaptationFilterBar via GroupContainer
				 * @experimental
				 * @private
				 * @ui5-restricted sap.comp, sap.ui.mdc
				 */
				useNewUI: {
					type: "boolean",
					defaultValue: true
				}
			},
			events: {
				/**
				 * This event is fired if any change has been made within the <code>AdaptFiltersPanel</code> control.
				 */
				change: {}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	AdaptFiltersPanel.prototype.GROUP_KEY = "group";
	AdaptFiltersPanel.prototype.LIST_KEY = "list";
	AdaptFiltersPanel.prototype.P13N_MODEL = "$p13n";

	/**
	 * Setter for useNewUI property.
	 * When property is set, check if it differs from what was created in applySettings.
	 * If so, destroy everything and recreate with correct UI mode.
	 * @param {boolean} bUseNewUI Whether to use new UI
	 * @returns {this} Reference to this for chaining
	 */
	AdaptFiltersPanel.prototype.setUseNewUI = function(bUseNewUI) {
		// Set the property
		this.setProperty("useNewUI", bUseNewUI);

		// Check if views were created with different UI mode
		if (this._bCreatedWithNewUI !== undefined && this._bCreatedWithNewUI !== bUseNewUI) {
			// UI mode changed - destroy and recreate everything
			this._destroyViews();
			this._createViews();

			// After recreating views, switch to the current/default view
			// to ensure the container is in a consistent state
			const sCurrentViewKey = this.getCurrentViewKey() || this.getDefaultView();
			if (sCurrentViewKey) {
				this.switchView(sCurrentViewKey);
			}
		}

		return this;
	};

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

		// Clear all cached header control references
		// These are either destroyed by aggregations above or will be recreated
		this._oHeader = null;
		this._oViewSwitch = null;
		this._oShowHideBtn = null;
		this._oGroupModeSelect = null;
		this._oSearchField = null;

		// Reset cached values
		delete this._bCreatedWithNewUI;
		delete this._bUseNewUI;
	};

	/**
	 * Creates views based on current useNewUI property
	 * @private
	 */
	AdaptFiltersPanel.prototype._createViews = function() {
		const bUseNewUI = this.getUseNewUI();

		// Remember what UI mode we created with
		this._bCreatedWithNewUI = bUseNewUI;

		const fnChangeFactory = (sPath) => {
			return function(oEvt) {
				if (this._checkIsNewUI()) {
					this.fireChange(oEvt.getParameters());
				} else {
					this.fireChange();
				}
				this.getP13nModel().setProperty(sPath, oEvt.getSource().getP13nData());
			}.bind(this);
		};

		let oListContent, oGroupContent;
		if (bUseNewUI) {
			oListContent = new AdaptFiltersPanelContent(this.getId() + "-listView", {
				change: fnChangeFactory("/items")
			});

			oGroupContent = new AdaptFiltersPanelContent(this.getId() + "-groupView", {
				defaultView: this.GROUP_KEY,
				change: fnChangeFactory("/items")
			});
		} else {
			// Legacy support
			oListContent = new SelectionPanel(this.getId() + "-listView", {
				activeColumn: this._getResourceText("p13nDialog.LIST_VIEW_ACTIVE"),
				change: fnChangeFactory("/items")
			});

			oGroupContent = new GroupView(this.getId() + "-groupView", {
				change: fnChangeFactory("/itemsGrouped")
			});
		}

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

		// Reapply item factory if it was already set
		// This is needed when views are recreated due to UI mode change
		const fnItemFactory = this.getItemFactory();
		if (fnItemFactory) {
			this.getViews().forEach((oView) => {
				const oPanel = oView.getContent();
				oPanel.setItemFactory(fnItemFactory);
			});
		}
	};

	/**
	 * Interface function for <code>sap.m.p13n.Popup</code> to determine that the <code>AdaptFiltersPanel</code> provides its own scrolling capabilites.
	 *
	 * @returns {boolean} The enablement of the vertical scrolling
	 */
	AdaptFiltersPanel.prototype.getVerticalScrolling = function() {
		return true;
	};

	AdaptFiltersPanel.prototype.applySettings = function(mSettings) {
		// Create views with default useNewUI (true)
		// If different value is set via property, setUseNewUI() will recreate them
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
	 * @param {string} sKey
	 */
	AdaptFiltersPanel.prototype.switchView = function(sKey) {
		const sPreviousKey = this.getCurrentViewKey();

		if (!this._isCustomView(sKey)) {
			// DINC0615996: "Deactivate" the current view - this will prevent events such as updateFinished to
			this.getCurrentViewContent()._bInactive = true;
		}

		if (this._checkIsNewUI() && sPreviousKey && !this._isCustomView()) {
			const oCurrentView = this.getCurrentViewContent();
			if (oCurrentView) {
				const aCurrentP13nData = oCurrentView.getP13nData();
				if (aCurrentP13nData && this.getP13nModel()) {
					this.getP13nModel().setProperty("/items", aCurrentP13nData);
				}
			}
		}

		AbstractContainer.prototype.switchView.call(this, sKey);

		const oCurrentViewContent = this.getCurrentViewContent();
		if (this._checkIsNewUI()) {
			this._getViewSwitch()?.setSelectedKey(this.getCurrentViewKey());

			if (oCurrentViewContent && this.getP13nModel() && !this._isCustomView()) {
				oCurrentViewContent.setP13nData(this.getP13nModel().getProperty("/items"));
			}

			if (oCurrentViewContent._getSearchField) {
				let sSearch;
				if (sPreviousKey) {
					sSearch = this.getView(sPreviousKey).getContent()._getSearchField?.().getValue();
				}
				oCurrentViewContent._getSearchField?.().setValue(sSearch);
			}

			this._filterByModeAndSearch();
			this.oLayout.insertContent(this._oHeader, 0);

			if (sKey === this.GROUP_KEY) {
				if (oCurrentViewContent._updateFilterFieldsEditMode) {
					oCurrentViewContent._updateFilterFieldsEditMode("edit");
				}
			} else if (sKey === this.LIST_KEY) {
				if (oCurrentViewContent._oViewModel) {
					const bEditable = oCurrentViewContent._oViewModel.getProperty("/editable");
					const sMode = bEditable ? "edit" : "sort";
					oCurrentViewContent._updateFilterFieldsEditMode(sMode);
				}
			}
		} else {
			//Only allow show/hide non custom view
			this._getShowHideBtn().setVisible(!this._isCustomView());

			this._getViewSwitch().setSelectedKey(this.getCurrentViewKey());

			//Factory logic should only be executed for non custom panels
			if (!this._isCustomView(sKey)) {
				oCurrentViewContent._bInactive = false;
				this.showFactory(oCurrentViewContent._getShowFactory());
			}

			//execute filtering
			this._filterByModeAndSearch();
		}

	};

	/**
	 * Adds custom content to the <code>sap.ui.mdc.p13n.panels.GroupPanelBase</code>
	 *
	 * @param {object} mViewSettings the setting for the cutom view
	 * @param {sap.ui.core.Item} mViewSettings.item the item used in the view switch
	 * @param {sap.ui.core.Control} mViewSettings.content the content displayed in the custom view
	 * @param {function} [mViewSettings.filterSelect] callback triggered by the combobox in the header area - executed with the selected key as paramter
	 * @param {function} [mViewSettings.search] callback triggered by search - executed with the string as parameter
	 * @param {function} [mViewSettings.selectionChange] callback triggered by selecting a view - executed with the key as parameter
	 *
	 */
	AdaptFiltersPanel.prototype.addCustomView = function(mViewSettings) {
		const oItem = mViewSettings.item;
		const sKey = oItem.getKey();
		const oContent = mViewSettings.content;
		let fnOnSearch = mViewSettings.search;
		const fnSelectionChange = mViewSettings.selectionChange;
		let fnDropDownChange = mViewSettings.filterSelect;

		if (!sKey && this._checkIsNewUI()) {
			throw new Error("Please provide an item of type sap.ui.core.Item with a key to be used in the view switch");
		} else if (!sKey) {
			throw new Error("Please provide an item of type sap.m.SegmentedButtonItem with a key to be used in the view switch");
		}

		if (this._checkIsNewUI()) {
			fnOnSearch = undefined;
			fnDropDownChange = undefined;
		}

		const oViewSwitch = this._getViewSwitch();
		if (oViewSwitch) {
			const sSelectionChangeEvent = this._checkIsNewUI() ? "select" : "selectionChange";

			oViewSwitch.attachEvent(sSelectionChangeEvent, (oEvt) => {
				if (fnSelectionChange) {
					fnSelectionChange(oEvt.getParameter("item").getKey());
				}
				//Fire search if custom view is selected
				if (this._isCustomView()) {
					if (fnOnSearch instanceof Function) {
						fnOnSearch(this._getSearchField().getValue());
					}
					if (fnDropDownChange instanceof Function) {
						fnDropDownChange(this._getQuickFilter().getSelectedKey());
					}
				}
			});
		}

		if (fnOnSearch instanceof Function) {
			this._getSearchField().attachLiveChange((oEvt) => {
				if (this._isCustomView()) {
					//Fire search only while on the custom view
					fnOnSearch(this._getSearchField().getValue());
				}
			});
		}

		if (fnDropDownChange instanceof Function) {
			this._getQuickFilter().attachChange((oEvt) => {
				if (this._isCustomView()) {
					//Fire selection change only when on custom view
					fnDropDownChange(this._getQuickFilter().getSelectedKey());
				}
			});
		}

		this.addView(new AbstractContainerItem({
			key: sKey,
			content: oContent.addStyleClass("sapUiMDCPanelPadding")
		}));

		if (this._checkIsNewUI()) {
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
		} else {
			oViewSwitch.addItem(oItem);
		}
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
	 * @param {string} sGroup Can be used to expand a specific group using the group key
	 * @param {boolean} bExpand Determines if the group should be expanded or collapsed
	 */
	AdaptFiltersPanel.prototype.setGroupExpanded = function(sGroup, bExpand) {
		this.getView(this.GROUP_KEY).getContent().setGroupExpanded(sGroup, bExpand);
	};

	/**
	 * Can be used to provide a JSON model provided by the <code>P13nBuilder</code>
	 *
	 * @param {sap.ui.model.json.JSONModel} oModel
	 */
	AdaptFiltersPanel.prototype.setP13nModel = function(oModel) {
		this.setModel(oModel, this.P13N_MODEL);

		const sListPath = "/items";
		let sGroupPath = "/itemsGrouped";
		if (this._checkIsNewUI()) {
			sGroupPath = "/items";
		}

		this.getView(this.LIST_KEY).getContent().setP13nData(oModel.getProperty(sListPath));
		this.getView(this.GROUP_KEY).getContent().setP13nData(oModel.getProperty(sGroupPath));
		this._filterByModeAndSearch();
	};

	AdaptFiltersPanel.prototype.setP13nData = function(oP13nData) {
		const oP13nModel = this.getP13nModel();
		if (!oP13nModel) {
			this.setP13nModel(new JSONModel(oP13nData));
		} else {
			const sListPath = "/items";
			let sGroupPath = "/itemsGrouped";
			if (this._checkIsNewUI()) {
				sGroupPath = "/items";
			}

			oP13nModel.setData(oP13nData);
			this.getView(this.LIST_KEY).getContent().setP13nData(oP13nModel.getProperty(sListPath));
			this.getView(this.GROUP_KEY).getContent().setP13nData(oP13nModel.getProperty(sGroupPath));
		}
	};

	/**
	 * Restores the default ui state of the <code>AdaptFiltersPanel</code>.
	 */
	AdaptFiltersPanel.prototype.restoreDefaults = function() {
		if (this._checkIsNewUI()) {
			this.switchView(this.LIST_KEY);
			this.getView(this.getCurrentViewKey()).getContent().restoreDefaults();
			return;
		}

		this._sModeKey = "all";
		this._getQuickFilter().setSelectedKey(this._sModeKey);
		this._getSearchField().setValue("");

		//Note: this will need to be threated as incompatible change
		//this.switchView(this.getDefaultView());
		this._filterByModeAndSearch();

		if (this.getCurrentViewKey() === this.LIST_KEY) {
			this._getShowHideBtn().setText(this._getResourceText("filterbar.ADAPT_SHOW_VALUE"));
			this.showFactory(false);
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

		if (this._checkIsNewUI()) {
			this._oHeader = new IconTabBar({
				selectedKey: this.LIST_KEY,
				applyContentPadding: false,
				expandable: false,
				items: [
					new IconTabFilter({
						key: this.LIST_KEY,
						text: this._getResourceText("adaptFiltersPanel.LIST")
					}),
					new IconTabFilter({
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
		} else {
			const oQuickFilter = this._getQuickFilter();
			const oViewSwitch = this._getViewSwitch();
			const oShowHideBtn = this._getShowHideBtn();

			this._oHeader = new Bar({
				contentMiddle: [ oQuickFilter, new ToolbarSpacer(), oShowHideBtn, oViewSwitch ]
			});
			this._oHeader.setDesign(BarDesign.SubHeader);

			const oSubHeader = new Bar({
				contentMiddle: [
					this._getSearchField()
				]
			}).addStyleClass("sapUiMDCAdaptFiltersSearchBar");
			oSubHeader.setDesign(BarDesign.SubHeader);
			this.setSubHeader(oSubHeader);
			this.setHeader(this._oHeader);
			this.oLayout.setShowHeader(true);
		}
		return this._oHeader;
	};

	AdaptFiltersPanel.prototype._getShowHideBtn = function() {
		if (this._checkIsNewUI()) {
			return;
		}

		const sShowText = this._getResourceText("filterbar.ADAPT_SHOW_VALUE");
		const sHideText = this._getResourceText("filterbar.ADAPT_HIDE_VALUE");

		if (!this._oShowHideBtn) {
			this._oShowHideBtn = new Button({
				press: function(oEvt) {
					this.showFactory(!this.getCurrentViewContent()._getShowFactory());
					const oBtn = oEvt.oSource;
					const sNewText = oBtn.getText() === sShowText ? sHideText : sShowText;
					oBtn.setText(sNewText);
				}.bind(this)
			});
		}

		this._oShowHideBtn.setText(!this._isCustomView() && this.getCurrentViewContent()._getShowFactory() ? sHideText : sShowText);
		return this._oShowHideBtn;
	};

	AdaptFiltersPanel.prototype._getQuickFilter = function() {

		if (!this._oGroupModeSelect) {
			this._oGroupModeSelect = new Select({
				items: [
					new Item({
						key: "all",
						text: this._getResourceText("p13nDialog.GROUPMODE_ALL")
					}),
					new Item({
						key: "visible",
						text: this._getResourceText("p13nDialog.GROUPMODE_VISIBLE")
					}),
					new Item({
						key: "active",
						text: this._getResourceText("p13nDialog.GROUPMODE_ACTIVE")
					}),
					new Item({
						key: "visibleactive",
						text: this._getResourceText("p13nDialog.GROUPMODE_VISIBLE_ACTIVE")
					}),
					new Item({
						key: "mandatory",
						text: this._getResourceText("p13nDialog.GROUPMODE_MANDATORY")
					})
				],
				tooltip: this._getResourceText("p13nDialog.QUICK_FILTER"),
				change: this._onGroupModeChange.bind(this)
			});

		}

		return this._oGroupModeSelect;
	};

	AdaptFiltersPanel.prototype._getSearchField = function() {
		if (this._checkIsNewUI()) {
			return this.getCurrentViewContent()._getSearchField?.();
		}

		if (!this._oSearchField) {
			this._oSearchField = new SearchField(this.getId() + "-searchField", {
				liveChange: [this._filterByModeAndSearch, this],
				width: "100%"
			});
			this._oSearchField.setPlaceholder(this._getResourceText("p13nDialog.ADAPT_FILTER_SEARCH"));
		}
		return this._oSearchField;
	};

	AdaptFiltersPanel.prototype.getInitialFocusedControl = function() {
		return this._getSearchField();
	};

	AdaptFiltersPanel.prototype._onGroupModeChange = function(oEvt) {
		this._sModeKey = oEvt.getParameters().selectedItem.getKey();
		this._filterByModeAndSearch();
	};

	AdaptFiltersPanel.prototype._getViewSwitch = function() {
		if (this._checkIsNewUI()) {
			return this._oHeader;
		}

		if (!this._oViewSwitch) {
			this._oViewSwitch = new SegmentedButton({
				items: [
					new SegmentedButtonItem({
						tooltip: this._getResourceText("filterbar.ADAPT_LIST_VIEW"),
						icon: "sap-icon://list",
						key: this.LIST_KEY
					}), new SegmentedButtonItem({
						tooltip: this._getResourceText("filterbar.ADAPT_GROUP_VIEW"),
						icon: "sap-icon://group-2",
						key: this.GROUP_KEY
					})
				],
				selectionChange: function(oEvt) {
					if (this.getCurrentViewKey() === this.LIST_KEY) {
						this.getCurrentViewContent()._removeMoveButtons();
					}
					const sKey = oEvt.getParameter("item").getKey();
					this.switchView(sKey);
				}.bind(this)
			});

			this._oInvText = new InvisibleText({
				text: this._getResourceText("p13nDialog.VIEW_SWITCH")
			}).toStatic();

			this._oViewSwitch.addAriaLabelledBy(this._oInvText);
		}

		return this._oViewSwitch;
	};

	AdaptFiltersPanel.prototype._isCustomView = function() {
		return this._sCurrentView != this.GROUP_KEY && this._sCurrentView != this.LIST_KEY;
	};

	AdaptFiltersPanel.prototype._filterByModeAndSearch = function() {
		if (this._checkIsNewUI()) {
			this.getCurrentViewContent()._filterByModeAndSearch?.();
			return;
		}

		if (this._isCustomView(this.getCurrentViewKey())) {
			return;
		}

		this._sSearchString = this._getSearchField().getValue();

		//Create model filter based on search & mode filter
		const aFilters = this._createFilterQuery();

		//Update value - necessary due to view switch
		this._getSearchField().setValue(this._sSearchString);

		this.getCurrentViewContent().filterContent(aFilters);

		return aFilters;
	};


	AdaptFiltersPanel.prototype._getResourceText = function(sKey) {
		return Library.getResourceBundleFor("sap.ui.mdc").getText(sKey);
	};

	//TODO: Renable with refactoring
	/*
	function matchTermToSearchRegex(term){

	    if (!term){
	        return false;
	    }

	    return term.match(this._oSearchRegex);
	}*/

	AdaptFiltersPanel.prototype._createFilterQuery = function() {
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

	AdaptFiltersPanel.prototype._checkIsNewUI = function() {
		if (this._bUseNewUI === undefined) {
			// URL parameter takes precedence (for testing/development)
			const sUrlParam = new URLSearchParams(window.location.search).get("sap-ui-xx-new-adapt-filters");
			if (sUrlParam === "true") {
				this._bUseNewUI = true;
			} else if (sUrlParam === "false") {
				this._bUseNewUI = false;
			} else {
				// Use the property value
				this._bUseNewUI = this.getUseNewUI();
			}
		}
		return this._bUseNewUI;
	};

	AdaptFiltersPanel.prototype.exit = function() {
		AbstractContainer.prototype.exit.apply(this, arguments);
		this._sModeKey = null;
		this._sSearchString = null;

		if (this._oInvText) {
			this._oInvText.destroy();
			this._oInvText = null;
		}

	};

	return AdaptFiltersPanel;

});