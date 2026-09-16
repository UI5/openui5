/*!
 * ${copyright}
 */

sap.ui.define([
	"./Control",
	"./ActionToolbar",
	"./util/ToolbarSettings",
	"./list/PropertyHelper",
	"./table/utils/Personalization",
	"./util/ExportUtils",
	"./util/P13nUtils",
	"./util/Common",
	"./list/GridListType",
	"./list/ListType",
	"./enums/ListType",
	"./enums/ListP13nMode",
	"./enums/ListGrowingMode",
	"./enums/ListSelectionMode",
	"sap/ui/core/library",
	"./p13n/subcontroller/SortController",
	"./p13n/subcontroller/FilterController",
	"./p13n/subcontroller/GroupController",
	"sap/m/Title",
	"sap/m/library",
	"sap/ui/core/Lib",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/BindingMode",
	"./mixin/FilterIntegrationMixin",
	"./mixin/ActionToolbarMixin",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/events/KeyCodes",
	"sap/base/Log"
], (
	Control,
	ActionToolbar,
	ToolbarSettings,
	PropertyHelper,
	PersonalizationUtils,
	ExportUtils,
	P13nUtils,
	Common,
	GridListType,
	ListType,
	// load for availability
	ListTypeEnum,
	ListP13nMode,
	ListGrowingMode,
	ListSelectionMode,
	coreLibrary,
	SortController,
	FilterController,
	GroupController,
	Title,
	MLibrary,
	Library,
	ManagedObjectModel,
	BindingMode,
	FilterIntegrationMixin,
	ActionToolbarMixin,
	InvisibleMessage,
	KeyCodes,
	Log
) => {
	"use strict";

	const { TitleLevel } = coreLibrary;
	const { ToolbarStyle } = MLibrary;

	const mTypeMap = {
		"List": ListType,
		"GridList": GridListType,
		"null": GridListType // default
	};

	/**
	 * Constructor for a new <code>List</code>.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * A metadata-driven list to simplify the usage of list-like controls such as <code>sap.f.GridList</code> and <code>sap.m.List</code>.
	 *
	 * The template for the item content is provided by the application via <code>itemTemplate</code>.
	 *
	 * @extends sap.ui.mdc.Control
	 * @author SAP SE
	 * @since 1.153
	 * @alias sap.ui.mdc.List
	 * @ui5-restricted sap.fe
	 */
	const List = Control.extend("sap.ui.mdc.List", {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/list/List.designtime",
			interfaces: [
				"sap.ui.mdc.IFilterSource", "sap.ui.mdc.IxState"
			],
			properties: {
				/**
				 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.
				 *
				 * The object has the following properties:
				 * <ul>
				 *   <li><code>name</code> defines the path to the <code>Delegate</code> module</li>
				 *   <li><code>payload</code> (optional) defines application-specific information to provide to the delegate</li>
				 * </ul>
				 */
				delegate: {
					type: "object",
					defaultValue: {
						name: "sap/ui/mdc/ListDelegate",
						payload: {}
					},
					bindable: false
				},
				/**
				 * Width of the list.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},
				/**
				 * Header text that is shown in the toolbar of the list.
				 */
				header: {
					type: "string",
					group: "Appearance",
					defaultValue: null
				},
				/**
				 * Determines whether the header text is shown in the toolbar of the list.
				 * Regardless of this property, the header text is used as a title for the list.
				 */
				headerVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * Defines the semantic level of the header. For more information, see {@link sap.m.Title#setLevel}.
				 *
				 */
				headerLevel: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				},
				/**
				 * Defines the style of the header. For more information, see {@link sap.m.Title#setTitleStyle}.
				 *
				 * @ui5-restricted sap.fe
				 */
				headerStyle: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance"
				},
				/**
				 * Determines whether the item count is shown in the toolbar of the list.
				 */
				showItemCount: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * Selection mode of the list. Determines whether items can be selected and how.
				 */
				selectionMode: {
					type: "sap.ui.mdc.enums.ListSelectionMode",
					group: "Behavior",
					defaultValue: ListSelectionMode.None
				},
				/**
				 * Determines whether the list data can be exported to a spreadsheet.
				 */
				enableExport: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Personalization options for the list.
				 * The order of the provided options does not influence their order on the UI.
				 *
				 * Supported values and their effects:
				 * <ul>
				 *   <li><code>Sort</code> — enables the sort panel in the personalization dialog and applies sorters to the items binding.</li>
				 *   <li><code>Filter</code> — enables the inbuilt filter panel in the personalization dialog and applies filter conditions
				 *       to the items binding. External <code>IFilter</code> association is also supported via
				 *       {@link sap.ui.mdc.mixin.FilterIntegrationMixin}.</li>
				 *   <li><code>Group</code> — enables the group panel in the personalization dialog and applies grouping sorters to the items binding.
				 *       Only single-level grouping is supported; multi-level grouping options in the dialog are not applicable.</li>
				 * </ul>
				 *
				 * The following capabilities are <b>not</b> supported for <code>sap.ui.mdc.List</code>:
				 * column visibility, aggregation, and column reorder.
				 *
				 * @see sap.ui.mdc.enums.ListP13nMode
				 */
				p13nMode: {
					type: "sap.ui.mdc.enums.ListP13nMode[]",
					defaultValue: []
				},
				/**
				 * Activates the growing feature of the list. Use <code>threshold</code> to control the batch size.
				 *
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @see sap.ui.mdc.enums.ListGrowingMode
				 */
				growingMode: {
					type: "sap.ui.mdc.enums.ListGrowingMode",
					group: "Behavior",
					defaultValue: ListGrowingMode.Basic
				},
				/**
				 * Number of items that are requested from the model for each growing request.
				 * This property is only used if <code>growingMode</code> is not set to <code>None</code>.
				 *
				 * If the value is -1, a type-dependent default value is used.
				 */
				threshold: {
					type: "int",
					group: "Misc",
					defaultValue: -1
				},
				/**
				 * Defines the XML baseline for filter conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @ui5-restricted sap.ui.mdc
				 */
				filterConditions: {
					type: "object",
					defaultValue: {},
					bindable: false
				},
				/**
				 * Defines the XML baseline for sort conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @ui5-restricted sap.ui.mdc
				 */
				sortConditions: {
					type: "object",
					bindable: false
				},
				/**
				 * Defines the XML baseline for group conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @ui5-restricted sap.ui.mdc
				 */
				groupConditions: {
					type: "object",
					bindable: false
				}
			},
			aggregations: {
				/**
				 * Type of the list. Defines which inner list control is used.
				 */
				type: {
					type: "sap.ui.mdc.list.ListTypeBase",
					altTypes: [
						"sap.ui.mdc.enums.ListType"
					],
					multiple: false
				},
				/**
				 * Content template for the items of the list.
				 */
				itemTemplate: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				 * Settings that are applied to each item of the list, such as highlight and navigated state.
				 *
				 * <b>Note:</b> Each time the properties of the settings are changed, they must be applied
				 * again via <code>setItemSettings</code> for the changes to take effect.
				 */
				itemSettings: {
					type: "sap.ui.mdc.list.ItemSettings",
					multiple: false
				},
				/**
				 * Defines the control to be displayed when the list has no data.
				 * Pass a string as an <code>altTypes</code> shorthand or a full control instance.
				 */
				noData: {
					type: "sap.ui.core.Control",
					multiple: false,
					altTypes: ["string"]
				},
				/**
				 * Additional actions that will be available in the toolbar.
				 *
				 * <b>Note:</b> This aggregation is managed by the control, can only be populated during the definition in the XML view, and is not
				 * bindable. Any changes of the initial aggregation content might result in undesired effects.
				 */
				actions: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_createToolbar",
						aggregation: "actions"
					}
				},
				/**
				 * Defines the context menu for the items of the list.
				 *
				 */
				contextMenu: {
					type: "sap.ui.core.IContextMenu",
					multiple: false
				},
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * Control or object that enables the list to do filtering, such as {@link sap.ui.mdc.FilterBar}.
				 * See also {@link sap.ui.mdc.IFilter}.
				 *
				 * When this association is set, the list listens to the <code>search</code> event of the filter
				 * and triggers a rebind. This enables the <code>Filter</code> p13n mode to work in combination
				 * with an external filter bar.
				 */
				filter: {
					type: "sap.ui.mdc.IFilter",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired when the selection of items changes.
				 */
				selectionChange: {},
				/**
				 * This event is fired when a list item is pressed.
				 */
				itemPress: {
					parameters: {
						/**
						 * The binding context of the pressed item.
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				},
				/**
				 * This event is fired before the export is triggered.
				 *
				 * The export can be prevented by calling <code>preventDefault</code> on the event.
				 */
				beforeExport: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * Contains the export settings defined by the list.
						 */
						exportSettings: {
							type: "object"
						},
						/**
						 * Contains the export settings defined by the user.
						 */
						userExportSettings: {
							type: "object"
						},
						/**
						 * Contains the filter settings defined by the user.
						 */
						filterSettings: {
							type: "object"
						}
					}
				},
				/**
				 * Fired before a context menu is opened for a list item.
				 *
				 */
				beforeOpenContextMenu: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The binding context of the item the context menu was opened for.
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				}
			}
		},
		constructor: function() {
			Control.apply(this, arguments);
			this.bCreated = true;
			this._updateAdaptation();
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oList) {
				const oType = oList._getType();
				const sTypeClass = oType?.isA?.("sap.ui.mdc.list.ListTypeBase") ? oType : null;
				oRm.openStart("div", oList);
				oRm.class("sapUiMdcList");
				sTypeClass?.getStyleClasses().forEach((sClass) => oRm.class(sClass));
				oRm.style("width", oList.getWidth());
				oRm.accessibilityState(oList, { role: "region", labelledby: { value: oList.getId() + "-title", append: false } });
				oRm.openEnd();
				oRm.renderControl(oList.getAggregation("_content"));
				oRm.close("div");
			}
		}
	});

	FilterIntegrationMixin.call(List.prototype);
	ActionToolbarMixin.call(List.prototype);

	List.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);
		this._oInitialized = Promise.withResolvers();
		this._oInitialized.promise.catch(() => { /* suppress unhandled rejection when List is destroyed before initialization */ });
		// Prevent propagation of models and binding contexts into the itemSettings and itemTemplate
		// aggregations, as bindings there must be relative to the list items, not the list itself.
		// Without this, V4 auto-$expand/$select walks the template's property bindings and tries to
		// resolve item properties (e.g. SalesOrderItemText) against the page-level entity type.
		this.mSkipPropagation = { itemSettings: true, itemTemplate: true };

		this._setPropertyHelperClass(PropertyHelper);

		this._oManagedObjectModel = new ManagedObjectModel(this);
		this._oManagedObjectModel.setDefaultBindingMode(BindingMode.OneWay);
		this._oManagedObjectModel.setProperty("/@custom/toolbarButtonType", ToolbarSettings.getToolbarButtonType());
		this._oManagedObjectModel.setProperty("/@custom/selectedCount", 0);
		this.setModel(this._oManagedObjectModel, "$sap.ui.mdc.List");
	};

	List.prototype.applySettings = function(mSettings, oScope) {
		// Apply type and delegate first so that the inner control is created with the correct type,
		// and all subsequent settings (e.g. itemTemplate) react to the already-initialized type.
		Common.applySettingsWithEarlyTypeAndDelegate(this, mSettings, oScope, Control.prototype.applySettings);
		this.initControlDelegate();
		// Initialize the property helper with an empty set so that awaitPropertyHelper() resolves
		// immediately. finalizePropertyHelper() later fetches real properties from the delegate.
		this.initPropertyHelper();
		this._initializeContent();
	};

	List.prototype.exit = function() {
		if (this._oItemsBinding) {
			this._detachItemsBindingListeners(this._oItemsBinding);
			this._oItemsBinding = null;
		}

		this._oInitialized.reject(new Error("sap.ui.mdc.List: control was destroyed before initialization completed"));
		this._oInitialized = null;

		Common.cleanup(this, [
			"_oManagedObjectModel",
			"_oToolbar",
			"_oTitle",
			"_oP13nButton",
			"_oExportButton",
			"_oFilterInfoBar",
			"_oFilterInfoBarText",
			"_oExportHandler",
			"_oDefaultType"
		]);

		this.destroyContextMenu();
		this._oList = null;
		this._oAppliedState = null;

		Control.prototype.exit.apply(this, arguments);
	};

	List.prototype.setType = function(vType) {
		if (!this.bCreated) {
			return this.setAggregation("type", vType, true);
		}

		this._resetContent();
		this._destroyDefaultType();
		this.setAggregation("type", vType);
		this._updateAdaptation();
		this._initializeContent();
		return this;
	};

	List.prototype.destroyType = function() {
		if (!this.getType()) {
			return this.destroyAggregation("type", true);
		}

		this._resetContent();
		this._destroyDefaultType();
		this.destroyAggregation("type");
		this._initializeContent();

		return this;
	};

	List.prototype.setItemTemplate = function(oTemplate) {
		this.setAggregation("itemTemplate", oTemplate, true);
		this._bindItems();
		return this;
	};

	List.prototype.setItemSettings = function(oItemSettings) {
		this.setAggregation("itemSettings", oItemSettings, true);
		this._getType().updateItemSettings();
		this._bindItems();
		return this;
	};

	List.prototype.setGrowingMode = function(sGrowingMode) {
		// The inner list reads growingMode via $sap.ui.mdc.List model bindings (growing,
		// growingScrollToLoad), so updating the property is sufficient for propagation.
		this.setProperty("growingMode", sGrowingMode, true);
		return this;
	};

	List.prototype.setHeaderLevel = function(sLevel) {
		this.setProperty("headerLevel", sLevel, true);
		this._oTitle?.setLevel(sLevel);
		return this;
	};

	List.prototype.setHeaderStyle = function(sStyle) {
		this.setProperty("headerStyle", sStyle, true);
		this._oTitle?.setTitleStyle(sStyle);
		return this;
	};

	List.prototype.setThreshold = function(iThreshold) {
		return this.setProperty("threshold", iThreshold, true);
	};

	List.prototype.setEnableExport = function(bEnableExport) {
		this.setProperty("enableExport", bEnableExport, true);
		this._updateExportButton();
		return this;
	};

	List.prototype.setP13nMode = function(aP13nMode) {
		this.setProperty("p13nMode", aP13nMode, true);
		this._updateAdaptation();
		this._updateP13nButton();
		return this;
	};

	List.prototype.setFilterConditions = function(mConditions) {
		this.setProperty("filterConditions", mConditions, true);
		this.getInbuiltFilter()?.setFilterConditions(mConditions);
		return this;
	};

	List.prototype.setSortConditions = function(mConditions) {
		this.setProperty("sortConditions", mConditions, true);
		return this;
	};

	List.prototype.setGroupConditions = function(mConditions) {
		this.setProperty("groupConditions", mConditions, true);
		return this;
	};

	List.prototype.setContextMenu = function(oContextMenu) {
		this._oContextMenu = this.validateAggregation("contextMenu", oContextMenu, false);
		this._oList?.setAggregation("contextMenu", oContextMenu, true);
		return this;
	};

	List.prototype.getContextMenu = function() {
		return (this._oContextMenu && !this._oContextMenu.isDestroyed()) ? this._oContextMenu : null;
	};

	List.prototype.destroyContextMenu = function() {
		if (this._oList) {
			this._oList.destroyAggregation("contextMenu");
		} else if (this._oContextMenu) {
			this._oContextMenu.destroy();
		}
		this._oContextMenu = null;
		return this;
	};

	List.prototype.getConditions = function() {
		return this.getInbuiltFilter() ? this.getInbuiltFilter().getConditions() : [];
	};

	List.prototype._updateAdaptation = function() {
		const oRegisterConfig = {
			controller: {}
		};

		const mRegistryOptions = {
			Sort: new SortController({ control: this }),
			Filter: new FilterController({ control: this }),
			Group: new GroupController({ control: this })
		};

		this.getActiveP13nModes().forEach((sMode) => {
			oRegisterConfig.controller[sMode] = mRegistryOptions[sMode];
		});

		this.getEngine().register(this, oRegisterConfig);
	};

	List.prototype._onModifications = async function(aAffectedP13nControllers) {
		if (!aAffectedP13nControllers || !this._oList) {
			return;
		}

		const bRebindRequired = aAffectedP13nControllers.includes("Sort")
			|| aAffectedP13nControllers.includes("Filter")
			|| aAffectedP13nControllers.includes("Group");

		if (!bRebindRequired) {
			return;
		}

		await this.finalizePropertyHelper();
		this._bindItems();
		this._validateState();
	};

	/**
	 * Validates the current sort, filter, and group conditions against the available property helper.
	 * Logs an error for any condition key that no longer maps to a known property.
	 *
	 * @private
	 */
	List.prototype._validateState = function() {
		const oPropertyHelper = this.getPropertyHelper();

		if (!oPropertyHelper) {
			return;
		}

		const oSortConditions = this.getSortConditions();
		const aSorters = oSortConditions ? oSortConditions.sorters : [];
		aSorters.forEach((oSorter) => {
			if (!oPropertyHelper.getProperty(oSorter.key)) {
				Log.error(
					"sap.ui.mdc.List: sort condition references unknown property '" + oSorter.key + "'",
					null,
					"sap.ui.mdc.List"
				);
			}
		});

		const mFilterConditions = this.getFilterConditions();
		Object.keys(mFilterConditions).forEach((sKey) => {
			if (mFilterConditions[sKey].length > 0 && !oPropertyHelper.getProperty(sKey)) {
				Log.error(
					"sap.ui.mdc.List: filter condition references unknown property '" + sKey + "'",
					null,
					"sap.ui.mdc.List"
				);
			}
		});

		const oGroupConditions = this.getGroupConditions();
		const aGroups = oGroupConditions ? oGroupConditions.groupLevels : [];
		aGroups.forEach((oGroup) => {
			if (!oPropertyHelper.getProperty(oGroup.key)) {
				Log.error(
					"sap.ui.mdc.List: group condition references unknown property '" + oGroup.key + "'",
					null,
					"sap.ui.mdc.List"
				);
			}
		});
	};

	List.prototype.getSelectedContexts = function() {
		if (!this._oList) {
			return [];
		}

		return this._oList.getSelectedContexts();
	};

	List.prototype.clearSelection = function() {
		if (this._oList) {
			this._oList.removeSelections(true);
		}

		return this;
	};

	List.prototype._initializeContent = function() {
		const oType = this._getType();
		const aInitPromises = [
			this.awaitControlDelegate(),
			this.awaitPropertyHelper(),
			oType.loadModules()
		];

		if (this.isFilteringEnabled()) {
			aInitPromises.push(this.retrieveInbuiltFilter());
		}

		Promise.all(aInitPromises).then(async () => {
			if (this.isDestroyed() || oType !== this._getType()) {
				return;
			}

			this._updateAdaptation();

			await this.getControlDelegate().initializeContent(this);

			this._createContent();

			await this.finalizePropertyHelper();
		}).then(() => {
			if (this._oInitialized) {
				this._oInitialized.resolve(this);
			}
		}).catch((vError) => {
			Log.error("Failed to initialize sap.ui.mdc.List content", vError, "sap.ui.mdc.List");
			if (this._oInitialized) {
				this._oInitialized.reject(vError);
			}
		});
	};

	List.prototype.initialized = function() {
		const oDelegatePromise = this.awaitControlDelegate ? this.awaitControlDelegate() : Promise.resolve();
		const oListPromise = this._oInitialized ? this._oInitialized.promise : Promise.resolve(this);

		return Promise.all([oDelegatePromise, oListPromise]).then(() => this);
	};

	List.prototype._getTypeKey = function() {
		const vType = this.getType();

		if (typeof vType === "string" || vType === null) {
			return vType || "GridList";
		}

		return this._isOfType("List", true) ? "List" : "GridList";
	};

	List.prototype.getCurrentState = function() {
		const aP13nMode = this.getActiveP13nModes();
		const oState = {};

		if (aP13nMode.includes("Sort")) {
			const oSortConditions = this.getSortConditions();
			oState.sorters = oSortConditions ? oSortConditions.sorters : [];
		}

		if (aP13nMode.includes("Filter")) {
			oState.filter = this.getFilterConditions();
		}

		if (aP13nMode.includes("Group")) {
			const oGroupConditions = this.getGroupConditions();
			oState.groupLevels = oGroupConditions ? oGroupConditions.groupLevels : [];
		}

		return oState;
	};

	List.prototype.applyState = function(oState) {
		if (!oState) {
			return Promise.resolve();
		}

		if (oState.type && oState.type !== this._getTypeKey()) {
			this.setType(oState.type);
		}

		if (Array.isArray(oState.p13nMode)) {
			this.setP13nMode(oState.p13nMode);
		}

		if (oState.sorters !== undefined) {
			this.setSortConditions({ sorters: oState.sorters });
		}

		if (oState.filter !== undefined) {
			this.setFilterConditions(oState.filter);
		}

		if (oState.groupLevels !== undefined) {
			this.setGroupConditions({ groupLevels: oState.groupLevels });
		}

		if (oState.sorters !== undefined || oState.filter !== undefined || oState.groupLevels !== undefined) {
			this._bindItems();
		}

		this._oAppliedState = oState;

		return Promise.resolve();
	};

	List.prototype._resetContent = function() {
		if (!this._oList) {
			return;
		}

		if (this._oItemsBinding) {
			this._detachItemsBindingListeners(this._oItemsBinding);
			this._oItemsBinding = null;
		}

		this._getType().removeToolbar();

		// store and remove the contextMenu otherwise it gets destroyed with the inner list
		const oContextMenu = this.getContextMenu();
		this.setContextMenu(null);
		this._oContextMenu = oContextMenu;

		this._oList.destroy("KeepDom");
		this._oList = null;
	};

	List.prototype._createContent = function() {
		const oType = this._getType();

		this._createToolbar();
		this._oList = oType.createList();

		if (!this._oList) {
			return;
		}

		// The title element always serves as the accessible label for the inner list,
		// even when it is visually hidden (headerVisible=false).
		// _createToolbar() is called above so _oTitle is always available here;
		// the guard is a defensive fallback in case toolbar creation is skipped.
		if (this._oTitle) {
			this._oList.addAriaLabelledBy(this._oTitle);
		} else {
			// Fallback: label the inner list directly with the header text
			const sHeader = this.getHeader();
			if (sHeader) {
				if (this._oList.setAriaLabelledBy) {
					this._oList.setAriaLabelledBy(sHeader);
				} else if (this._oList.setProperty) {
					this._oList.setProperty("accessibleName", sHeader, true);
				}
			}
		}

		this.setAggregation("_content", this._oList);
		if (this._oContextMenu) {
			this._oList.setAggregation("contextMenu", this._oContextMenu, true);
		}
		this._oList.attachBeforeOpenContextMenu((oEvent) => {
			const oListItem = oEvent.getParameter("listItem");
			const bPreventDefault = !this.fireBeforeOpenContextMenu({
				bindingContext: oListItem?.getBindingContext()
			});
			if (bPreventDefault) {
				oEvent.preventDefault();
			}
		});
		this._bindItems();
		this._updateP13nButton();
		this._updateExportButton();
	};

	List.prototype._getType = function() {
		const vType = this.getType();

		if (!this._oDefaultType && (typeof vType === "string" || vType === null)) {
			const TypeClass = mTypeMap[vType] || mTypeMap.null;
			this._oDefaultType = new TypeClass();
			this.addDependent(this._oDefaultType);
		}

		return this._oDefaultType || vType;
	};

	List.prototype._destroyDefaultType = function() {
		if (this._oDefaultType) {
			this.removeDependent(this._oDefaultType);
			this._oDefaultType.destroy();
			delete this._oDefaultType;
		}
	};

	List.prototype._isOfType = function(sType, bIncludeSubTypes) {
		const oType = this._getType();

		if (bIncludeSubTypes) {
			return oType.isA(mTypeMap[sType].getMetadata().getName());
		} else {
			return oType.constructor === mTypeMap[sType];
		}
	};

	List.prototype._createToolbar = function() {
		if (this.isDestroyStarted()) {
			return null;
		}

		if (this._oToolbar && this._oToolbar.bIsDestroyed) {
			this._oToolbar = null;
			this._oTitle = null;
		}

		if (this._oToolbar) {
			this._updateToolbarStyle();
			return this._oToolbar;
		}

		this._oTitle = new Title(this.getId() + "-title", {
			level: this.getHeaderLevel(),
			titleStyle: this.getHeaderStyle(),
			text: {
				parts: [
					{ path: "$sap.ui.mdc.List>/header" },
					{ path: "$sap.ui.mdc.List>/showItemCount" },
					{ path: "$sap.ui.mdc.List>/@custom/itemCount" },
					{ path: "$sap.ui.mdc.List>/@custom/selectedCount" },
					{ path: "$sap.ui.mdc.List>/growingMode" }
				],
				formatter: function(sHeader, bShowItemCount, iItemCount, iSelectedCount, sGrowingMode) {
					const sEffectiveHeader = sHeader || "";
					// Per guidelines: when the More button is shown (growingMode="Basic"),
					// don't show the count on the title bar.
					const bMoreButton = sGrowingMode === ListGrowingMode.Basic;
					if (!bShowItemCount || bMoreButton) {
						return sEffectiveHeader;
					}

					const iSafeCount = Number.isFinite(iItemCount) && iItemCount > 0 ? iItemCount : 0;
					const iSafeSelected = Number.isFinite(iSelectedCount) && iSelectedCount > 0 ? iSelectedCount : 0;

					// Per guidelines: remove the count when no items are displayed.
					if (iSafeCount === 0) {
						return sEffectiveHeader;
					}

					const oRb = Library.getResourceBundleFor("sap.ui.mdc");

					if (iSafeSelected > 0) {
						const sCounter = oRb.getText("list.TITLE_ITEM_COUNT_SELECTED", [iSafeSelected, iSafeCount]);
						return sEffectiveHeader ? sEffectiveHeader + " " + sCounter : sCounter;
					}

					const sCounter = oRb.getText("list.TITLE_ITEM_COUNT", [iSafeCount]);
					return sEffectiveHeader ? sEffectiveHeader + " " + sCounter : sCounter;
				}
			}
		});

		// Keep the title in the DOM at all times so that aria-labelledby references on the
		// root element and the ActionToolbar always resolve. Visually hide it via a CSS
		// class instead of removing it from the DOM when headerVisible=false.
		this._oTitle.toggleStyleClass("sapUiMdcListTitleHidden", !this.getHeaderVisible());

		this._oToolbar = new ActionToolbar(this.getId() + "-toolbar", {
			begin: [this._oTitle],
			end: [this._getP13nButton()],
			ariaLabelledBy: [this._oTitle]
		});
		this._updateToolbarStyle();

		return this._oToolbar;
	};

	/**
	 * Applies the toolbar style based on the current list type.
	 *
	 * The GridList (card layout) uses the <code>Clear</code> toolbar style so no separator line is
	 * rendered below the title, matching how <code>sap.ui.mdc.Table</code> styles its non-responsive
	 * toolbar. The plain <code>sap.m.List</code> type keeps the <code>Standard</code> style (with the
	 * line), consistent with Table's <code>ResponsiveTable</code>. Re-applied on every toolbar
	 * retrieval so the style stays correct across type switches.
	 *
	 * @private
	 */
	List.prototype._updateToolbarStyle = function() {
		if (!this._oToolbar) {
			return;
		}
		this._oToolbar.setStyle(this._isOfType("List", true) ? ToolbarStyle.Standard : ToolbarStyle.Clear);
	};

	List.prototype.setHeaderVisible = function(bHeaderVisible) {
		this.setProperty("headerVisible", bHeaderVisible, true);
		if (this._oTitle) {
			this._oTitle.toggleStyleClass("sapUiMdcListTitleHidden", !bHeaderVisible);
		}
		return this;
	};

	List.prototype._getP13nButton = function() {
		if (!this._oP13nButton) {
			this._oP13nButton = ToolbarSettings.createSettingsButton(this.getId(), [function() {
				PersonalizationUtils.openSettingsDialog(this);
			}, this], "$sap.ui.mdc.List");
		}

		this._updateP13nButton();
		return this._oP13nButton;
	};

	List.prototype._updateP13nButton = function() {
		if (!this._oP13nButton) {
			return;
		}

		this._oP13nButton.setVisible(P13nUtils.isSettingsButtonVisible(this.getActiveP13nModes(), false, false));
	};

	List.prototype.getSupportedP13nModes = function() {
		return Object.keys(ListP13nMode);
	};

	List.prototype.getActiveP13nModes = function() {
		return P13nUtils.getIntersection(this.getP13nMode(), this.getSupportedP13nModes());
	};

	List.prototype.isFilteringEnabled = function() {
		return this.getActiveP13nModes().includes(ListP13nMode.Filter);
	};

	// Start: FilterIntegrationMixin hooks
	List.prototype._onFilterProvided = function(oFilter) {
		this._updateInnerListNoData();
	};

	List.prototype._onFilterRemoved = function(oFilter) {
		this._updateInnerListNoData();
	};

	List.prototype._onFilterSearch = function(oEvent) {
		// _rebind() (called by FilterIntegrationMixin.onSearch) already triggers
		// delegate.updateBinding which handles the actual rebind. Do not call
		// _bindItems() here as that would cause a second, redundant binding update.
	};
	// End: FilterIntegrationMixin hooks

	/**
	 * Rebinds the list items. Called by {@link sap.ui.mdc.mixin.FilterIntegrationMixin}
	 * when the external filter fires a search event.
	 *
	 * @param {boolean} [bForceRefresh=false] If <code>true</code>, forces a full refresh of the binding
	 * @returns {Promise} A promise that resolves after the rebind is complete
	 * @private
	 */
	List.prototype._rebind = async function(bForceRefresh = false) {
		await this.initialized();

		if (this.isDestroyed()) {
			return;
		}

		const oBindingInfo = {
			templateShareable: false
		};

		this.getControlDelegate().updateBindingInfo(this, oBindingInfo);

		if (!oBindingInfo.path) {
			return;
		}

		const oExistingBinding = this._oList ? this._oList.getBinding("items") : null;
		await this.getControlDelegate().updateBinding(this, oBindingInfo, oExistingBinding, { forceRefresh: bForceRefresh });
	};

	List.prototype._updateInnerListNoData = function() {
		if (this._oList) {
			this._oList.setNoData(this.getNoData());
		}
	};

	List.prototype._updateExportButton = function() {
		const bNeedExportButton = this._oToolbar != null && this.getEnableExport();

		if (bNeedExportButton && !this._oExportButton) {
			this._oExportButton = ToolbarSettings.createExportButton(this.getId(), {
				"default": [function() {
					this._onExport(false);
				}, this],
				"exportAs": [function() {
					this._onExport(true);
				}, this]
			}, "$sap.ui.mdc.List");
			this._oToolbar.addEnd(this._oExportButton);
		}

		if (!this._oExportButton) {
			return;
		}

		const bEnabled = this._getExportData().length > 0;
		this._oExportButton.setVisible(this.getEnableExport());
		this._oExportButton.setEnabled(this.getEnableExport() && bEnabled);
	};

	List.prototype._bindItems = function() {
		if (!this._oList) {
			return;
		}

		const bDelegateReady = this.isControlDelegateInitialized();

		const oBindingInfo = {
			templateShareable: false
		};

		if (bDelegateReady) {
			this.getControlDelegate().updateBindingInfo(this, oBindingInfo);
		} else if (this.awaitControlDelegate instanceof Function && !this._bPendingInitialRebind) {
			this._bPendingInitialRebind = true;
			this.awaitControlDelegate().then(() => {
				this._bPendingInitialRebind = false;
				if (!this.isDestroyed()) {
					this._bindItems();
				}
			}).catch(() => {
				this._bPendingInitialRebind = false;
			});
		}

		if (!oBindingInfo.path) {
			this._updateItemCount(0);
			this._updateExportButton();
			return;
		}

		// Prefer a delegate-provided template; fall back to the app-provided itemTemplate aggregation.
		const oDelegateTemplate = bDelegateReady ? this.getControlDelegate().getItemTemplate(this, oBindingInfo) : null;
		const oItemTemplate = oDelegateTemplate || this.getItemTemplate();

		if (!oItemTemplate) {
			this._updateItemCount(0);
			this._updateExportButton();
			return;
		}

		if (this._oList.getBindingInfo("items")) {
			const oOldTemplate = this._oList.getBindingInfo("items").template;
			this._oList.unbindItems();
			oOldTemplate?.destroy();
		}

		const oContentClone = oItemTemplate.clone(this.getId() + "-itemTemplate");
		const oWrapper = this._getType().wrapItemTemplate(oContentClone);
		// Extract the model name before bindItems() is called so that applyItemActions
		// can correctly resolve the per-row binding context via getBindingContext(sModelName).
		const sModelName = oBindingInfo.model ?? (typeof oBindingInfo.path === "string" && oBindingInfo.path.includes(">") ? oBindingInfo.path.split(">")[0] : undefined);
		this._applyItemSettings(oWrapper, sModelName);
		oBindingInfo.template = oWrapper;

		this._getType().bindItems(oBindingInfo);

		this._observeItemsBinding();
		this._updateItemCountFromBinding();
		this._updateExportButton();
		this._updateFilterInfoBar();
	};

	List.prototype._applyItemSettings = function(oWrapper, sModelName) {
		const oItemSettings = this.getItemSettings();

		if (!oItemSettings) {
			return;
		}

		const mSettings = oItemSettings.getAllSettings();
		const mSetterMap = {
			type: "setType",
			highlight: "setHighlight",
			highlightText: "setHighlightText",
			navigated: "setNavigated"
		};

		Object.keys(mSetterMap).forEach((sProperty) => {
			const vValue = mSettings[sProperty];
			const sSetter = mSetterMap[sProperty];

			if (!(oWrapper[sSetter] instanceof Function) || vValue === undefined) {
				return;
			}

			if (typeof vValue === "object" && vValue !== null) {
				oWrapper.bindProperty(sProperty, vValue);
			} else {
				oWrapper[sSetter](vValue);
			}
		});

		this._getType().applyItemActions(oWrapper, oItemSettings, sModelName);
	};

	List.prototype._fireDefaultItemAction = function(oBindingContext, oItem) {
		if (oItem?.data("sap.ui.mdc.hasVisualItemActions")) {
			return;
		}

		const oItemSettings = this.getItemSettings();

		if (!oItemSettings) {
			return;
		}

		if (oItemSettings.isBound("itemActions")) {
			const oActionsConfig = oItemSettings.getAllActions();
			const oTemplateAction = oActionsConfig?.items?.template;

			if (!oTemplateAction || !oBindingContext) {
				return;
			}

			const oAction = oTemplateAction.clone();
			const sActionModel = oActionsConfig.items.model;
			oAction.setBindingContext(oBindingContext, sActionModel);
			oAction._onPress({ bindingContext: oBindingContext });
			oAction.destroy();
			return;
		}

		const oAction = oItemSettings.getItemActions().find((oActionItem) => oActionItem.getVisible());

		if (!oAction) {
			return;
		}

		oAction._onPress({ bindingContext: oBindingContext });
	};

	List.prototype._updateSelectedCount = function() {
		if (!this._oList) {
			this._oManagedObjectModel.setProperty("/@custom/selectedCount", 0);
			return;
		}

		const aSelectedItems = this._oList.getSelectedItems();
		const iCount = aSelectedItems.length;
		this._oManagedObjectModel.setProperty("/@custom/selectedCount", iCount);
	};

	/**
	 * Decides which info toolbar — filter bar or sort/group bar — to set on the inner list.
	 * The filter info bar takes precedence because it is more actionable.
	 * Called after either bar is created or destroyed.
	 *
	 * @private
	 */
	List.prototype._syncInfoToolbar = function() {
		if (!this._oList) {
			return;
		}

		if (this._oFilterInfoBar) {
			this._oList.setInfoToolbar(this._oFilterInfoBar);
		} else {
			this._oList.setInfoToolbar(null);
		}
	};

	List.prototype._updateFilterInfoBar = function() {
		if (!this._oList) {
			return;
		}

		const mFilterConditions = this.getFilterConditions();
		const bHasFilters = Object.values(mFilterConditions).some((aConditions) => aConditions.length > 0);

		if (!bHasFilters) {
			if (this._oFilterInfoBar) {
				this._oFilterInfoBar.destroy();
				this._oFilterInfoBar = null;
				this._syncInfoToolbar();
			}
			return;
		}

		if (!this._oFilterInfoBar) {
			sap.ui.require(["sap/m/OverflowToolbar", "sap/m/Text"], (OverflowToolbar, Text) => {
				if (this.isDestroyed() || !this._oList) {
					return;
				}
				this._oFilterInfoBarText = new Text(this.getId() + "-filterInfoBarText");
				this._oFilterInfoBar = new OverflowToolbar(this.getId() + "-filterInfoBar", {
					content: [this._oFilterInfoBarText],
					active: true,
					design: "Info",
					ariaLabelledBy: [this._oFilterInfoBarText]
				});
				this._updateFilterInfoBarText();
				this._syncInfoToolbar();
			});
		} else {
			this._updateFilterInfoBarText();
			this._syncInfoToolbar();
		}
	};

	List.prototype._updateFilterInfoBarText = function() {
		if (!this._oFilterInfoBarText) {
			return;
		}

		const mFilterConditions = this.getFilterConditions();
		const iFilterCount = Object.values(mFilterConditions).filter((aConditions) => aConditions.length > 0).length;
		const oRb = Library.getResourceBundleFor("sap.ui.mdc");
		const sText = iFilterCount > 0
			? oRb.getText("list.FILTER_INFO_BAR_TEXT", [iFilterCount])
			: oRb.getText("list.FILTER_INFO_BAR_TEXT_NO_COUNT");
		this._oFilterInfoBarText.setText(sText);
		InvisibleMessage.getInstance().announce(sText, "Polite");
	};

	List.prototype._observeItemsBinding = function() {
		if (this._oItemsBinding) {
			this._detachItemsBindingListeners(this._oItemsBinding);
			this._oItemsBinding = null;
		}

		this._oItemsBinding = this._oList ? this._oList.getBinding("items") : null;

		if (!this._oItemsBinding) {
			return;
		}

		this._oItemsBinding.attachChange(this._onItemsBindingChange, this);
		this._oItemsBinding.attachDataReceived(this._onItemsBindingChange, this);
	};

	List.prototype._detachItemsBindingListeners = function(oBinding) {
		oBinding.detachChange(this._onItemsBindingChange, this);
		oBinding.detachDataReceived(this._onItemsBindingChange, this);
	};

	List.prototype._onItemsBindingChange = function() {
		this._updateItemCountFromBinding();
		this._updateExportButton();
	};

	List.prototype._updateItemCountFromBinding = function() {
		if (!this._oItemsBinding) {
			this._updateItemCount(0);
			return;
		}

		let iItemCount = 0;
		if (this._oItemsBinding.getLength instanceof Function) {
			iItemCount = this._oItemsBinding.getLength();
		}

		if (!Number.isFinite(iItemCount) || iItemCount < 0) {
			iItemCount = this._oItemsBinding.getCurrentContexts instanceof Function
				? this._oItemsBinding.getCurrentContexts().length
				: 0;
		}

		this._updateItemCount(iItemCount);
	};

	List.prototype._updateItemCount = function(iItemCount) {
		const iPrevCount = this._oManagedObjectModel.getProperty("/@custom/itemCount");
		this._oManagedObjectModel.setProperty("/@custom/itemCount", iItemCount);

		// Announce count updates caused by growing so screen readers hear the new total.
		// Only announce when the list is initialized, showItemCount is on, and the count
		// actually grew (growing appends rows — it never reduces the count mid-session).
		if (this._oList && this.getShowItemCount() && iItemCount > iPrevCount) {
			const sText = Library.getResourceBundleFor("sap.ui.mdc").getText("list.TITLE_ITEM_COUNT", [iItemCount]);
			InvisibleMessage.getInstance().announce(sText, "Polite");
		}
	};

	List.prototype._getExportData = function() {
		const oItemsBinding = this._oList ? this._oList.getBinding("items") : null;

		if (!oItemsBinding) {
			return [];
		}

		const iLength = oItemsBinding.getLength instanceof Function ? oItemsBinding.getLength() : 0;
		if (!Number.isFinite(iLength) || iLength < 1) {
			return [];
		}

		const aContexts = oItemsBinding.getContexts instanceof Function ? oItemsBinding.getContexts(0, iLength) : [];

		return aContexts.filter(Boolean).map((oContext) => oContext.getObject());
	};

	List.prototype._createExportColumns = function() {
		const aPropertyInfo = this.getPropertyHelper()?.getProperties() || [];

		return aPropertyInfo.reduce((aColumns, oProperty) => {
			if (oProperty.exportSettings === null) {
				return aColumns;
			}

			const oExportSettings = oProperty.exportSettings || {};
			const oColumn = {
				...oExportSettings
			};

			oColumn.property = oColumn.property || oProperty.path || oProperty.name;
			oColumn.label = oColumn.label || oProperty.label || oProperty.name || oColumn.property;

			if (oColumn.property) {
				aColumns.push(oColumn);
			}

			return aColumns;
		}, []);
	};

	List.prototype._onExport = function(bExportAs) {
		if (!this.getEnableExport()) {
			return Promise.resolve();
		}

		const aColumns = this._createExportColumns();

		if (aColumns.length === 0) {
			return Promise.resolve();
		}

		const oItemsBinding = this._oList ? this._oList.getBinding("items") : null;
		const sExportFunctionName = bExportAs ? "exportAs" : "export";
		const mExportSettings = {
			workbook: {
				columns: aColumns,
				context: {
					title: this.getHeader()
				}
			},
			dataSource: oItemsBinding || this._getExportData(),
			fileName: this.getHeader() || "List"
		};

		return this._getExportHandler().then((oHandler) => {
			oHandler[sExportFunctionName](mExportSettings);
		});
	};

	/**
	 * Loads the export library and export capabilities in parallel and
	 * returns an initialized <code>ExportHandler</code> instance. The
	 * instance will be cached for subsequent calls.
	 *
	 * @returns {Promise<sap.ui.export.ExportHandler>} Promise that resolves with an initialized <code>ExportHandler</code> instance
	 * @private
	 */
	List.prototype._getExportHandler = function() {
		if (this._oExportHandler) {
			return Promise.resolve(this._oExportHandler);
		}

		return new Promise((fnResolve, fnReject) => {
			Promise.all([
				this.getControlDelegate().fetchExportCapabilities(this), Library.load({ name: "sap.ui.export" })
			]).then((aResult) => {
				const [oExportCapabilities] = aResult;

				sap.ui.require(["sap/ui/export/ExportHandler"], (ExportHandler) => {
					if (this.isDestroyed()) {
						fnReject(new Error("sap.ui.mdc.List: control was destroyed before export handler could be initialized"));
						return;
					}
					this._oExportHandler = new ExportHandler(oExportCapabilities);
					this._oExportHandler.attachBeforeExport(this._onBeforeExport, this);
					fnResolve(this._oExportHandler);
				});
			}).catch((vError) => {
				if (!Library.all().hasOwnProperty("sap.ui.export")) {
					sap.ui.require(["sap/m/MessageBox"], (MessageBox) => {
						MessageBox.error(Library.getResourceBundleFor("sap.ui.mdc").getText("ERROR_MISSING_EXPORT_LIBRARY"));
					});
				}

				fnReject(vError);
			});
		});
	};

	/**
	 * Handles the <code>beforeExport</code> event of the <code>ExportHandler</code>.
	 *
	 * @param {sap.ui.base.Event} oEvent The <code>beforeExport</code> event of the ExportHandler
	 * @private
	 */
	List.prototype._onBeforeExport = function(oEvent) {
		const aFilters = oEvent.getParameter("filterSettings");
		const oHelper = this.getPropertyHelper();

		aFilters.forEach((oFilter) => {
			const oProperty = oHelper?.getProperties().find((oPropertyInfo) => {
				return oPropertyInfo.path === oFilter.getProperty();
			});

			if (oProperty) {
				oFilter.setLabel(oProperty.label);
				oFilter.setType(oProperty.typeConfig?.typeInstance);
			}
		});

		ExportUtils.fireBeforeExport(this, { filterSettings: aFilters }, oEvent);
	};


	/**
	 * Event handler for <code>keydown</code>.
	 * @param {object} oEvent The event object
	 * @private
	 */
	List.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		if (isExportShortcut(oEvent)) {
			if (this._oExportButton && this._oExportButton.getEnabled()) {
				this._onExport(true);
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}

		if (isOpenPersonalizationShortcut(oEvent)) {
			if (this._oP13nButton && this._oP13nButton.getVisible()) {
				this._oP13nButton.firePress();
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Handler for theme changes
	 */
	List.prototype.onThemeChanged = function() {
		this._oManagedObjectModel.setProperty("/@custom/toolbarButtonType", ToolbarSettings.getToolbarButtonType());
	};

	return List;

	function isExportShortcut(oEvent) {
		return (oEvent.metaKey || oEvent.ctrlKey) && oEvent.shiftKey && oEvent.which === KeyCodes.E;
	}

	function isOpenPersonalizationShortcut(oEvent) {
		return (oEvent.metaKey || oEvent.ctrlKey) && oEvent.which === KeyCodes.COMMA;
	}
});
