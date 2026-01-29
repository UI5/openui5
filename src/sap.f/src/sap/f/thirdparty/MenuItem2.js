sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/information', 'sap/f/thirdparty/ListItemCustom', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/List', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/i18n-defaults2'], (function (exports, webcomponentsBase, parametersBundle_css, eventStrict, parametersBundle_css$1, Theme, Icons, information, ListItemCustom, ListItemBase, ResponsivePopover, Button, List, BusyIndicator, Icon, i18nDefaults) { 'use strict';

	const name$1 = "nav-back";
	const pathData$1 = "M375.5 426q9 9 9 22.5t-9 22.5q-10 10-23 10t-23-10l-192-192q-9-9-9-22.5t9-22.5l191-193q10-10 23-10t22 10q10 9 10 22t-10 23l-157 159q-5 5-5 11.5t5 11.5z";
	const ltr$1 = false;
	const accData$1 = information.ICON_NAV_BACK;
	const collection$1 = "SAP-icons-v4";
	const packageName$1 = "@ui5/webcomponents-icons";

	Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, accData: accData$1, collection: collection$1, packageName: packageName$1 });

	const name = "nav-back";
	const pathData = "M326 96q11 0 18.5 7.5T352 122q0 10-8 18L223 256l121 116q8 8 8 18 0 11-7.5 18.5T326 416q-10 0-17-7L168 274q-8-6-8-18 0-11 8-19l141-134q7-7 17-7z";
	const ltr = false;
	const accData = information.ICON_NAV_BACK;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";

	Icons.y(name, { pathData, ltr, accData, collection, packageName });

	var navBackIcon = "nav-back";

	/**
	 * Menu item group check modes.
	 * @since 2.12.0
	 * @public
	 */
	var MenuItemGroupCheckMode;
	(function (MenuItemGroupCheckMode) {
	    /**
	     * default type (items in a group cannot be checked)
	     * @public
	     */
	    MenuItemGroupCheckMode["None"] = "None";
	    /**
	     * Single item check mode (only one item in a group can be checked at a time)
	     * @public
	     */
	    MenuItemGroupCheckMode["Single"] = "Single";
	    /**
	     * Multiple items check mode (multiple items in a group can be checked at a time)
	     * @public
	     */
	    MenuItemGroupCheckMode["Multiple"] = "Multiple";
	})(MenuItemGroupCheckMode || (MenuItemGroupCheckMode = {}));
	var MenuItemGroupCheckMode$1 = MenuItemGroupCheckMode;

	function MenuSeparatorTemplate() {
	    return (parametersBundle_css.jsx(ListItemCustom.ListItemCustom, { class: "ui5-menu-separator", _forcedAccessibleRole: "separator", disabled: true }));
	}

	Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
	Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
	var menuSeparatorCss = `:host{border-top:.0625rem solid var(--sapGroup_ContentBorderColor);min-height:.125rem}.ui5-menu-separator{border:inherit;min-height:inherit;background:inherit;opacity:1}
`;

	var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	/**
	 * @class
	 * The `ui5-menu-separator` represents a horizontal line to separate menu items inside a `ui5-menu`.
	 * @constructor
	 * @extends ListItemBase
	 * @implements {IMenuItem}
	 * @public
	 * @since 2.0.0
	 */
	let MenuSeparator = class MenuSeparator extends ListItemBase.ListItemBase {
	    get isSeparator() {
	        return true;
	    }
	    get classes() {
	        return {
	            main: {
	                "ui5-menu-separator": true,
	            },
	        };
	    }
	    /**
	     * @override
	     */
	    get _focusable() {
	        return false;
	    }
	    /**
	     * @override
	     */
	    get _pressable() {
	        return false;
	    }
	};
	MenuSeparator = __decorate$2([
	    webcomponentsBase.m({
	        tag: "ui5-menu-separator",
	        renderer: parametersBundle_css.y,
	        styles: [menuSeparatorCss],
	        template: MenuSeparatorTemplate,
	    })
	], MenuSeparator);
	const isInstanceOfMenuSeparator = (object) => {
	    return "isSeparator" in object;
	};
	MenuSeparator.define();

	function MenuItemGroupTemplate() {
	    return (parametersBundle_css.jsx("div", { role: "group", "aria-label": this.ariaLabelText, "onui5-check": this._handleItemCheck, children: parametersBundle_css.jsx("slot", {}) }));
	}

	var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var MenuItemGroup_1;
	/**
	 * @class
	 *
	 * ### Overview
	 *
	 * The `ui5-menu-item-group` component represents a group of items designed for use inside a `ui5-menu`.
	 * Items belonging to the same group should be wrapped by a `ui5-menu-item-group`.
	 * Each group can have an `checkMode` property, which defines the check mode for the items within the group.
	 * The possible values for `checkMode` are:
	 * - 'None' (default) - no items can be checked
	 * - 'Single' - Only one item can be checked at a time
	 * - 'Multiple' - Multiple items can be checked simultaneously
	 *
	 * **Note:** If the `checkMode` property is set to 'Single', only one item can remain checked at any given time.
	 * If multiple items are marked as checked, the last checked item will take precedence.
	 *
	 * ### Usage
	 *
	 * `ui5-menu-item-group` represents a collection of `ui5-menu-item` components that can have the same check mode.
	 * The items are addeed to the group's `items` slot.
	 *
	 * ### ES6 Module Import
	 *
	 * `import "@ui5/webcomponents/dist/MenuItemGroup.js";`
	 * @constructor
	 * @extends UI5Element
	 * @implements {IMenuItem}
	 * @since 2.12.0
	 * @public
	 */
	let MenuItemGroup = MenuItemGroup_1 = class MenuItemGroup extends webcomponentsBase.b {
	    constructor() {
	        super(...arguments);
	        /**
	         * Defines the component's check mode.
	         * @default "None"
	         * @public
	         */
	        this.checkMode = "None";
	    }
	    get ariaLabelText() {
	        switch (this.checkMode) {
	            case MenuItemGroupCheckMode$1.None:
	                return MenuItemGroup_1.i18nBundle.getText(i18nDefaults.MENU_ITEM_GROUP_NONE_ACCESSIBLE_NAME);
	            case MenuItemGroupCheckMode$1.Single:
	                return MenuItemGroup_1.i18nBundle.getText(i18nDefaults.MENU_ITEM_GROUP_SINGLE_ACCESSIBLE_NAME);
	            case MenuItemGroupCheckMode$1.Multiple:
	                return MenuItemGroup_1.i18nBundle.getText(i18nDefaults.MENU_ITEM_GROUP_MULTI_ACCESSIBLE_NAME);
	            default:
	                return undefined;
	        }
	    }
	    get isGroup() {
	        return true;
	    }
	    get _menuItems() {
	        return this.items.filter(isInstanceOfMenuItem);
	    }
	    onBeforeRendering() {
	        this._updateItemsCheckMode();
	        if (this.checkMode === MenuItemGroupCheckMode$1.Single) {
	            this._ensureSingleItemIsChecked();
	        }
	    }
	    /**
	     * Sets <code>_checkMode</code> property of all menu items in the group.
	     * @private
	     */
	    _updateItemsCheckMode() {
	        this._menuItems.forEach((item) => {
	            item._checkMode = this.checkMode;
	        });
	    }
	    /**
	     * Sets <code>checked</code> property of all items in the group to <code>false</code>.
	     * @private
	     */
	    _clearCheckedItems() {
	        this._menuItems.forEach((item) => { item.checked = false; });
	    }
	    /**
	     * Ensures that only one item can remain checked at any given time. If multiple items are marked as checked,
	     * the last checked item will take precedence.
	     * @private
	     */
	    _ensureSingleItemIsChecked() {
	        const lastCheckedItem = this._menuItems.findLast((item) => item.checked);
	        this._clearCheckedItems();
	        if (lastCheckedItem) {
	            lastCheckedItem.checked = true;
	        }
	    }
	    /**
	     * Handles the checking of an item in the group and unchecks other items if the item check mode is Single.
	     * @private
	     */
	    _handleItemCheck(e) {
	        const clickedItem = e.target;
	        const isChecked = clickedItem.checked;
	        if (this.checkMode === MenuItemGroupCheckMode$1.Single) {
	            this._clearCheckedItems();
	            clickedItem.checked = isChecked;
	        }
	    }
	};
	__decorate$1([
	    webcomponentsBase.s()
	], MenuItemGroup.prototype, "checkMode", void 0);
	__decorate$1([
	    webcomponentsBase.d({ "default": true, type: HTMLElement, invalidateOnChildChange: true })
	], MenuItemGroup.prototype, "items", void 0);
	__decorate$1([
	    parametersBundle_css$1.i("@ui5/webcomponents")
	], MenuItemGroup, "i18nBundle", void 0);
	MenuItemGroup = MenuItemGroup_1 = __decorate$1([
	    webcomponentsBase.m({
	        tag: "ui5-menu-item-group",
	        renderer: parametersBundle_css.y,
	        template: MenuItemGroupTemplate,
	    })
	], MenuItemGroup);
	const isInstanceOfMenuItemGroup = (object) => {
	    return "isGroup" in object;
	};
	MenuItemGroup.define();

	const predefinedHooks = {
	    listItemContent,
	    iconBegin,
	};
	function MenuItemTemplate(hooks) {
	    const currentHooks = { ...predefinedHooks, ...hooks };
	    return parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [ListItemCustom.ListItemTemplate.call(this, currentHooks), listItemPostContent.call(this)] });
	}
	function listItemContent() {
	    return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [this.text && parametersBundle_css.jsx("div", { class: "ui5-menu-item-text", children: this.text }), rightContent.call(this), checkmarkContent.call(this)] }));
	}
	function checkmarkContent() {
	    return !this._markChecked ? "" : (parametersBundle_css.jsx("div", { class: "ui5-menu-item-checked", children: parametersBundle_css.jsx(Icon.Icon, { name: ListItemCustom.checkIcon, class: "ui5-menu-item-icon-checked" }) }));
	}
	function rightContent() {
	    switch (true) {
	        case this.hasSubmenu:
	            return (parametersBundle_css.jsx("div", { class: "ui5-menu-item-submenu-icon", children: parametersBundle_css.jsx(Icon.Icon, { part: "subicon", name: ListItemCustom.slimArrowRight, class: "ui5-menu-item-icon-end" }) }));
	        case this.hasEndContent:
	            return parametersBundle_css.jsx("slot", { name: "endContent", onKeyDown: this._endContentKeyDown });
	        case !!this.additionalText:
	            return (parametersBundle_css.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", "aria-hidden": this._accInfo.ariaHidden, children: this.additionalText }));
	    }
	}
	function iconBegin() {
	    if (this.hasIcon) {
	        return parametersBundle_css.jsx(Icon.Icon, { class: "ui5-li-icon", name: this.icon });
	    }
	    if (this._siblingsWithIcon) {
	        return parametersBundle_css.jsx("div", { class: "ui5-menu-item-dummy-icon" });
	    }
	}
	function listItemPostContent() {
	    return this.hasSubmenu && parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { id: `${this._id}-menu-rp`, class: "ui5-menu-rp ui5-menu-rp-sub-menu", preventInitialFocus: true, preventFocusRestore: true, hideArrow: true, allowTargetOverlap: true, placement: this.placement, verticalAlign: "Top", accessibleName: this.acessibleNameText, onBeforeOpen: this._beforePopoverOpen, onOpen: this._afterPopoverOpen, onBeforeClose: this._beforePopoverClose, onClose: this._afterPopoverClose, children: [this.isPhone && (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs("div", { slot: "header", class: "ui5-menu-dialog-header", children: [parametersBundle_css.jsx(Button.Button, { icon: navBackIcon, class: "ui5-menu-back-button", design: "Transparent", "aria-label": this.labelBack, onClick: this._close }), parametersBundle_css.jsx("div", { class: "ui5-menu-dialog-title", children: parametersBundle_css.jsx("div", { children: this.text }) }), parametersBundle_css.jsx(Button.Button, { icon: information.decline, design: "Transparent", "aria-label": this.labelClose, onClick: this._closeAll })] }) })), parametersBundle_css.jsx("div", { id: `${this._id}-menu-main`, children: this.items.length ? (parametersBundle_css.jsx(List.List, { id: `${this._id}-menu-list`, selectionMode: "None", separators: "None", accessibleRole: "Menu", loading: this.loading, loadingDelay: this.loadingDelay, onMouseOver: this._itemMouseOver, onKeyDown: this._itemKeyDown, onKeyUp: this._itemKeyUp, "onui5-close-menu": this._close, "onui5-exit-end-content": this._navigateOutOfEndContent, children: parametersBundle_css.jsx("slot", {}) })) : this.loading && parametersBundle_css.jsx(BusyIndicator.BusyIndicator, { id: `${this._id}-menu-busy-indicator`, delay: this.loadingDelay, class: "ui5-menu-busy-indicator", active: true }) })] });
	}

	Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
	Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
	var menuItemCss = `:host{line-height:initial}::slotted([ui5-menu-item]){line-height:inherit}.ui5-menu-rp[ui5-responsive-popover]::part(header),.ui5-menu-rp[ui5-responsive-popover]::part(content),.ui5-menu-rp[ui5-responsive-popover]::part(footer){padding:0}.ui5-menu-rp[ui5-responsive-popover]{box-shadow:var(--sapContent_Shadow1);border-radius:var(--_ui5-v2-15-0_menu_popover_border_radius)}.ui5-menu-busy-indicator{width:100%}.ui5-menu-dialog-header{display:flex;height:var(--_ui5-v2-15-0-responsive_popover_header_height);align-items:center;justify-content:space-between;padding:0px 1rem;width:100%;overflow:hidden}.ui5-menu-dialog-title{display:flex;flex-direction:row;align-items:center;justify-content:flex-start;width:calc(100% - 6.5rem);padding-right:1rem;font-family:var(--sapFontHeaderFamily)}.ui5-menu-dialog-title>h1{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--sapFontHeader5Size)}.ui5-menu-back-button{margin-right:1rem}.ui5-menu-rp.ui5-menu-rp-sub-menu{margin-top:.25rem;margin-inline:var(--_ui5-v2-15-0_menu_submenu_margin_offset)}.ui5-menu-rp.ui5-menu-rp-sub-menu[actual-placement=Start]{margin-top:.25rem;margin-inline:var(--_ui5-v2-15-0_menu_submenu_placement_type_left_margin_offset)}:host([disabled]){pointer-events:initial;opacity:initial}:host([disabled])::part(content){opacity:var(--_ui5-v2-15-0-listitembase_disabled_opacity)}:host([disabled][actionable]:not([active]):not([selected]):hover),:host([disabled][active][actionable]){background:var(--ui5-v2-15-0-listitem-background-color)}:host([active]:not([disabled])),:host([active]:not([disabled])):hover{background-color:var(--sapList_Active_Background)}:host(:not([active]):not([selected]):not([disabled]):hover){background-color:var(--sapList_Hover_Background)}:host([disabled][active][actionable]) .ui5-li-root .ui5-li-icon{color:var(--sapContent_NonInteractiveIconColor)}:host([active]:not([disabled]))::part(content),:host([active]:not([disabled]))::part(additional-text),:host([active]:not([disabled])) .ui5-li-root .ui5-li-icon{color:var(--sapList_Active_TextColor)}:host([focused]:not([active]):not([disabled])){background-color:var(--sapList_Hover_Background)}:host::part(additional-text){margin:unset;margin-inline-start:1rem;color:var(--sapContent_LabelColor);min-width:max-content}.ui5-menu-item-text{width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;display:inline-block}.ui5-menu-item-dummy-icon{visibility:hidden}:host::part(title){font-size:var(--sapFontSize);padding-top:.125rem}:host([icon]:not([is-phone]))::part(title),:host([is-phone]:not([icon=""]))::part(title){padding-top:0}:host(:not([is-phone]))::part(native-li){user-select:none;padding:var(--_ui5-v2-15-0_menu_item_padding)}:host::part(content){padding-inline-end:.25rem}.ui5-menu-item-submenu-icon{min-width:var(--_ui5-v2-15-0_list_item_icon_size);min-height:var(--_ui5-v2-15-0_list_item_icon_size);display:inline-block;vertical-align:middle;pointer-events:none}.ui5-menu-item-icon-end{display:inline-block;vertical-align:middle;padding-inline-start:.5rem;pointer-events:none;position:absolute;inset-inline-end:var(--_ui5-v2-15-0_menu_item_submenu_icon_right)}.ui5-menu-item-submenu-icon .ui5-menu-item-icon-end{color:var(--sapContent_NonInteractiveIconColor)}.ui5-menu-item-dummy-icon{min-width:var(--_ui5-v2-15-0_list_item_icon_size);min-height:var(--_ui5-v2-15-0_list_item_icon_size);display:inline-block;vertical-align:middle;padding-inline-end:.75rem;pointer-events:none}.ui5-menu-item-checked{padding-inline-start:.5rem;padding-inline-end:0;font-weight:400;text-align:center}.ui5-menu-item-icon-checked{color:var(--sapContent_BusyColor);padding-top:.25rem}
`;

	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var MenuItem_1;
	/**
	 * @class
	 *
	 * ### Overview
	 *
	 * `ui5-menu-item` is the item to use inside a `ui5-menu`.
	 * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
	 *
	 * ### Usage
	 *
	 * `ui5-menu-item` represents a node in a `ui5-menu`. The menu itself is rendered as a list,
	 * and each `ui5-menu-item` is represented by a list item in that list. Therefore, you should only use
	 * `ui5-menu-item` directly in your apps. The `ui5-li` list item is internal for the list, and not intended for public use.
	 *
	 * ### ES6 Module Import
	 *
	 * `import "@ui5/webcomponents/dist/MenuItem.js";`
	 * @constructor
	 * @extends ListItem
	 * @implements {IMenuItem}
	 * @since 1.3.0
	 * @public
	 */
	let MenuItem = MenuItem_1 = class MenuItem extends ListItemCustom.ListItem {
	    constructor() {
	        super();
	        /**
	         * Defines whether menu item is in disabled state.
	         *
	         * **Note:** A disabled menu item is noninteractive.
	         * @default false
	         * @public
	         */
	        this.disabled = false;
	        /**
	         * Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding menu popover.
	         *
	         * **Note:** If set to `true` a busy indicator component will be displayed into the related one to the current menu item sub-menu popover.
	         * @default false
	         * @public
	         * @since 1.13.0
	         */
	        this.loading = false;
	        /**
	         * Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding menu popover.
	         * @default 1000
	         * @public
	         * @since 1.13.0
	         */
	        this.loadingDelay = 1000;
	        /**
	         * Defines whether menu item is in checked state.
	         *
	         * **Note:** checked state is only taken into account when menu item is added to menu item group
	         * with `checkMode` other than `None`.
	         *
	         * **Note:** A checked menu item has a checkmark displayed at its end.
	         * @default false
	         * @public
	         * @since 2.12.0
	         */
	        this.checked = false;
	        /**
	         * Indicates whether any of the element siblings have icon.
	         */
	        this._siblingsWithIcon = false;
	        /**
	         * Defines the component's check mode.
	         * @default "None"
	         * @private
	         */
	        this._checkMode = "None";
	        this._shiftPressed = false;
	        this._itemNavigation = new webcomponentsBase.f$1(this, {
	            navigationMode: webcomponentsBase.r.Horizontal,
	            behavior: webcomponentsBase.l.Static,
	            getItemsCallback: () => this._navigableItems,
	        });
	    }
	    get _list() {
	        return this.shadowRoot && this.shadowRoot.querySelector("[ui5-list]");
	    }
	    get _navigableItems() {
	        return [...this.endContent].filter(item => {
	            return item.hasAttribute("ui5-button")
	                || item.hasAttribute("ui5-link")
	                || (item.hasAttribute("ui5-icon") && item.getAttribute("mode") === "Interactive");
	        });
	    }
	    get _isCheckable() {
	        return this._checkMode !== MenuItemGroupCheckMode$1.None;
	    }
	    _navigateToEndContent(shouldNavigateToPreviousItem) {
	        const navigatableItems = this._navigableItems;
	        const item = shouldNavigateToPreviousItem
	            ? navigatableItems[navigatableItems.length - 1]
	            : navigatableItems[0];
	        if (item) {
	            this._itemNavigation.setCurrentItem(item);
	            this._itemNavigation._focusCurrentItem();
	        }
	    }
	    get placement() {
	        return this.isRtl ? "Start" : "End";
	    }
	    get isRtl() {
	        return this.effectiveDir === "rtl";
	    }
	    get hasSubmenu() {
	        return !!(this.items.length || this.loading) && !this.disabled;
	    }
	    get hasEndContent() {
	        return !!(this.endContent.length);
	    }
	    get hasIcon() {
	        return !!this.icon;
	    }
	    get isSubMenuOpen() {
	        return this._popover?.open;
	    }
	    get menuHeaderTextPhone() {
	        return this.text;
	    }
	    get isPhone() {
	        return Theme.d();
	    }
	    get labelBack() {
	        return MenuItem_1.i18nBundle.getText(i18nDefaults.MENU_BACK_BUTTON_ARIA_LABEL);
	    }
	    get labelClose() {
	        return MenuItem_1.i18nBundle.getText(i18nDefaults.MENU_CLOSE_BUTTON_ARIA_LABEL);
	    }
	    get acessibleNameText() {
	        return MenuItem_1.i18nBundle.getText(i18nDefaults.MENU_POPOVER_ACCESSIBLE_NAME);
	    }
	    onBeforeRendering() {
	        super.onBeforeRendering();
	        const siblingsWithIcon = this._allMenuItems.some(menuItem => !!menuItem.icon);
	        this._setupItemNavigation();
	        this._allMenuItems.forEach(item => {
	            item._siblingsWithIcon = siblingsWithIcon;
	        });
	    }
	    async focus(focusOptions) {
	        await Theme.f$1();
	        if (this.hasSubmenu && this.isSubMenuOpen) {
	            const menuItems = this._allMenuItems;
	            return menuItems[0] && menuItems[0].focus(focusOptions);
	        }
	        return super.focus(focusOptions);
	    }
	    get _focusable() {
	        return true;
	    }
	    get _role() {
	        switch (this._checkMode) {
	            case MenuItemGroupCheckMode$1.Single:
	                return "menuitemradio";
	            case MenuItemGroupCheckMode$1.Multiple:
	                return "menuitemcheckbox";
	            default:
	                return "menuitem";
	        }
	    }
	    get _accInfo() {
	        const accInfoSettings = {
	            role: this.accessibilityAttributes.role || this._role,
	            ariaHaspopup: this.hasSubmenu ? "menu" : undefined,
	            ariaKeyShortcuts: this.accessibilityAttributes.ariaKeyShortcuts,
	            ariaExpanded: this.hasSubmenu ? this.isSubMenuOpen : undefined,
	            ariaHidden: !!this.additionalText && !!this.accessibilityAttributes.ariaKeyShortcuts ? true : undefined,
	            ariaChecked: this._markChecked ? true : undefined,
	        };
	        return { ...super._accInfo, ...accInfoSettings };
	    }
	    get _popover() {
	        return this.shadowRoot && this.shadowRoot.querySelector("[ui5-responsive-popover]");
	    }
	    get _markChecked() {
	        return !this.hasSubmenu && this.checked && this._checkMode !== MenuItemGroupCheckMode$1.None;
	    }
	    /** Returns menu item groups */
	    get _menuItemGroups() {
	        return this.items.filter(isInstanceOfMenuItemGroup);
	    }
	    /** Returns menu items */
	    get _menuItems() {
	        return this.items.filter(isInstanceOfMenuItem);
	    }
	    /** Returns all menu items (including those in groups */
	    get _allMenuItems() {
	        const items = [];
	        this.items.forEach(item => {
	            if (isInstanceOfMenuItemGroup(item)) {
	                items.push(...item._menuItems);
	            }
	            else if (!isInstanceOfMenuSeparator(item)) {
	                items.push(item);
	            }
	        });
	        return items;
	    }
	    /** Returns menu items included in the ItemNavigation */
	    get _navigatableMenuItems() {
	        const items = [];
	        const slottedItems = this.getSlottedNodes("items");
	        slottedItems.forEach(item => {
	            if (isInstanceOfMenuItemGroup(item)) {
	                const groupItems = item.getSlottedNodes("items");
	                items.push(...groupItems);
	            }
	            else if (!isInstanceOfMenuSeparator(item)) {
	                items.push(item);
	            }
	        });
	        return items;
	    }
	    _setupItemNavigation() {
	        if (this._list) {
	            this._list._itemNavigation._getItems = () => this._navigatableMenuItems;
	        }
	    }
	    _closeOtherSubMenus(item) {
	        const menuItems = this._allMenuItems;
	        if (!menuItems.includes(item)) {
	            return;
	        }
	        menuItems.forEach(menuItem => {
	            if (menuItem !== item) {
	                menuItem._close();
	            }
	        });
	    }
	    _itemMouseOver(e) {
	        if (!Theme.f()) {
	            return;
	        }
	        const item = e.target;
	        if (!isInstanceOfMenuItem(item)) {
	            return;
	        }
	        item.focus();
	        this._closeOtherSubMenus(item);
	    }
	    _isSpace(e) {
	        this._shiftPressed = this._isCheckable && webcomponentsBase.K(e);
	        return webcomponentsBase.A(e) || webcomponentsBase.K(e);
	    }
	    _isEnter(e) {
	        this._shiftPressed = this._isCheckable && webcomponentsBase.i(e);
	        return webcomponentsBase.b$1(e) || webcomponentsBase.i(e);
	    }
	    _onclick(e) {
	        this._shiftPressed = this._isCheckable && e.shiftKey;
	        super._onclick(e);
	    }
	    _itemKeyDown(e) {
	        const item = e.target;
	        const itemInMenuItems = this._allMenuItems.includes(item);
	        const isTabNextPrevious = webcomponentsBase.x(e) || webcomponentsBase.V(e);
	        const shouldCloseMenu = this.isRtl ? webcomponentsBase.R(e) : webcomponentsBase.D(e);
	        if (itemInMenuItems && (isTabNextPrevious || shouldCloseMenu)) {
	            this._close();
	            this.focus();
	            e.stopPropagation();
	        }
	    }
	    _itemKeyUp(e) {
	        if (webcomponentsBase.Ko(e)) {
	            this._shiftPressed = false;
	        }
	    }
	    _endContentKeyDown(e) {
	        const shouldNavigateOutOfEndContent = webcomponentsBase.P(e) || webcomponentsBase._(e);
	        if (shouldNavigateOutOfEndContent) {
	            this.fireDecoratorEvent("exit-end-content", { shouldNavigateToNextItem: webcomponentsBase._(e) });
	        }
	    }
	    _navigateOutOfEndContent(e) {
	        const item = e.target;
	        const shouldNavigateToNextItem = e.detail.shouldNavigateToNextItem;
	        const menuItems = this._allMenuItems;
	        const itemIndex = menuItems.indexOf(item);
	        if (itemIndex > -1) {
	            const nextItem = shouldNavigateToNextItem ? menuItems[itemIndex + 1] : menuItems[itemIndex - 1];
	            const itemToFocus = nextItem || menuItems[itemIndex];
	            itemToFocus?.focus();
	            e.stopPropagation();
	        }
	    }
	    _closeAll() {
	        if (this._popover) {
	            this._popover.open = false;
	        }
	        this.selected = false;
	        this.fireDecoratorEvent("close-menu");
	    }
	    _close() {
	        if (this._popover) {
	            this._popover.open = false;
	            this._allMenuItems.forEach(item => item._close());
	        }
	        this.selected = false;
	    }
	    _beforePopoverOpen(e) {
	        const prevented = !this.fireDecoratorEvent("before-open", {});
	        if (prevented) {
	            e.preventDefault();
	        }
	    }
	    _afterPopoverOpen() {
	        this._allMenuItems[0]?.focus();
	        this.fireDecoratorEvent("open");
	    }
	    _beforePopoverClose(e) {
	        const prevented = !this.fireDecoratorEvent("before-close", { escPressed: e.detail.escPressed });
	        if (prevented) {
	            e.preventDefault();
	            return;
	        }
	        this.selected = false;
	        if (e.detail.escPressed) {
	            this.focus();
	            if (Theme.d()) {
	                this.fireDecoratorEvent("close-menu");
	            }
	        }
	    }
	    _afterPopoverClose() {
	        this.fireDecoratorEvent("close");
	    }
	    get isMenuItem() {
	        return true;
	    }
	    _updateCheckedState() {
	        if (this._checkMode === MenuItemGroupCheckMode$1.None) {
	            return;
	        }
	        const newState = !this.checked;
	        this.checked = newState;
	        this.fireDecoratorEvent("check");
	    }
	};
	__decorate([
	    webcomponentsBase.s()
	], MenuItem.prototype, "text", void 0);
	__decorate([
	    webcomponentsBase.s()
	], MenuItem.prototype, "additionalText", void 0);
	__decorate([
	    webcomponentsBase.s()
	], MenuItem.prototype, "icon", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], MenuItem.prototype, "disabled", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], MenuItem.prototype, "loading", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Number })
	], MenuItem.prototype, "loadingDelay", void 0);
	__decorate([
	    webcomponentsBase.s()
	], MenuItem.prototype, "accessibleName", void 0);
	__decorate([
	    webcomponentsBase.s()
	], MenuItem.prototype, "tooltip", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], MenuItem.prototype, "checked", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Object })
	], MenuItem.prototype, "accessibilityAttributes", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean, noAttribute: true })
	], MenuItem.prototype, "_siblingsWithIcon", void 0);
	__decorate([
	    webcomponentsBase.s()
	], MenuItem.prototype, "_checkMode", void 0);
	__decorate([
	    webcomponentsBase.d({ "default": true, type: HTMLElement, invalidateOnChildChange: true })
	], MenuItem.prototype, "items", void 0);
	__decorate([
	    webcomponentsBase.d({ type: HTMLElement })
	], MenuItem.prototype, "endContent", void 0);
	__decorate([
	    parametersBundle_css$1.i("@ui5/webcomponents")
	], MenuItem, "i18nBundle", void 0);
	MenuItem = MenuItem_1 = __decorate([
	    webcomponentsBase.m({
	        tag: "ui5-menu-item",
	        renderer: parametersBundle_css.y,
	        template: MenuItemTemplate,
	        styles: [ListItemCustom.ListItem.styles, menuItemCss],
	    })
	    /**
	     * Fired before the menu is opened. This event can be cancelled, which will prevent the menu from opening.
	     *
	     * **Note:** Since 1.14.0 the event is also fired before a sub-menu opens.
	     * @public
	     * @since 1.10.0
	     * @param { HTMLElement } item The menu item that triggers opening of the sub-menu or undefined when fired upon root menu opening.
	     */
	    ,
	    eventStrict.l("before-open", {
	        cancelable: true,
	    })
	    /**
	     * Fired after the menu is opened.
	     * @public
	     */
	    ,
	    eventStrict.l("open")
	    /**
	     * Fired when the menu is being closed.
	     * @private
	     */
	    ,
	    eventStrict.l("close-menu", {
	        bubbles: true,
	    })
	    /**
	     * Fired when navigating out of end-content.
	     * @private
	     */
	    ,
	    eventStrict.l("exit-end-content", {
	        bubbles: true,
	    })
	    /**
	     * Fired before the menu is closed. This event can be cancelled, which will prevent the menu from closing.
	     * @public
	     * @param {boolean} escPressed Indicates that `ESC` key has triggered the event.
	     * @since 1.10.0
	     */
	    ,
	    eventStrict.l("before-close", {
	        cancelable: true,
	    })
	    /**
	     * Fired after the menu is closed.
	     * @public
	     * @since 1.10.0
	     */
	    ,
	    eventStrict.l("close")
	    /**
	     * Fired when an item is checked or unchecked.
	     * @public
	     * @since 2.12.0
	     */
	    ,
	    eventStrict.l("check", {
	        bubbles: true,
	    })
	], MenuItem);
	MenuItem.define();
	const isInstanceOfMenuItem = (object) => {
	    return "isMenuItem" in object;
	};
	var MenuItem$1 = MenuItem;

	exports.MenuItem = MenuItem$1;
	exports.MenuItemTemplate = MenuItemTemplate;
	exports.isInstanceOfMenuItem = isInstanceOfMenuItem;
	exports.isInstanceOfMenuItemGroup = isInstanceOfMenuItemGroup;
	exports.isInstanceOfMenuSeparator = isInstanceOfMenuSeparator;

}));
