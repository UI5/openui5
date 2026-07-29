sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/List', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/i18n-defaults2'], (function (exports, webcomponentsBase, jsxRuntime, eventStrict, parametersBundle_css, Theme, Icons, decline, List, ListItemTemplate, ListItemBase, ResponsivePopover, Button, Icon, i18nDefaults) { 'use strict';

	const name$1 = "nav-back";
	const pathData$1 = "M11.723 13.285a.957.957 0 0 1 .277.702c0 .28-.092.514-.277.701a.967.967 0 0 1-.708.312.967.967 0 0 1-.707-.312L4.246 8.67a.723.723 0 0 0-.092-.156.362.362 0 0 0-.046-.077.362.362 0 0 1-.046-.078A1.106 1.106 0 0 1 4 8.016a.22.22 0 0 1 .015-.094.14.14 0 0 0 .016-.062.44.44 0 0 1 .092-.297c.02-.03.041-.067.062-.109.02-.02.03-.036.03-.046 0-.01.01-.026.031-.047.02-.021.03-.042.03-.063l6.032-5.986A.967.967 0 0 1 11.015 1c.267 0 .503.104.708.312.185.187.277.42.277.701a.957.957 0 0 1-.277.702l-4.77 4.802a.889.889 0 0 0 0 .997l4.77 4.771Z";
	const ltr$1 = false;
	const accData$1 = decline.ICON_NAV_BACK;
	const viewBox$1 = "0 0 16 16";
	const collection$1 = "SAP-icons-v4";
	const packageName$1 = "@ui5/webcomponents-icons";

	Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, accData: accData$1, collection: collection$1, packageName: packageName$1 });

	const name = "nav-back";
	const pathData = "M10.795 3.235a.75.75 0 0 0-1.06-.03l-4.5 4.247a.75.75 0 0 0 0 1.091l4.5 4.252a.75.75 0 1 0 1.03-1.09L6.843 7.997l3.922-3.702a.75.75 0 0 0 .03-1.06Z";
	const ltr = false;
	const accData = decline.ICON_NAV_BACK;
	const viewBox = "0 0 16 16";
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";

	Icons.y(name, { pathData, ltr, viewBox, accData, collection, packageName });

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
	    return (jsxRuntime.jsx(List.ListItemCustom, { class: "ui5-menu-separator", _forcedAccessibleRole: "separator", disabled: true }));
	}

	Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
	Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
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
	        renderer: jsxRuntime.y,
	        styles: [menuSeparatorCss],
	        template: MenuSeparatorTemplate,
	    })
	], MenuSeparator);
	MenuSeparator.define();
	const isInstanceOfMenuSeparator = webcomponentsBase.r$1("isSeparator");

	function MenuItemGroupTemplate() {
	    return (jsxRuntime.jsx("div", { role: "group", "aria-label": this.ariaLabelText, "onui5-check": this._handleItemCheck, children: jsxRuntime.jsx("slot", {}) }));
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
	let MenuItemGroup = MenuItemGroup_1 = class MenuItemGroup extends webcomponentsBase.S {
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
	    parametersBundle_css.i("@ui5/webcomponents")
	], MenuItemGroup, "i18nBundle", void 0);
	MenuItemGroup = MenuItemGroup_1 = __decorate$1([
	    webcomponentsBase.m({
	        tag: "ui5-menu-item-group",
	        renderer: jsxRuntime.y,
	        template: MenuItemGroupTemplate,
	    })
	], MenuItemGroup);
	MenuItemGroup.define();
	const isInstanceOfMenuItemGroup = webcomponentsBase.r$1("isGroup");

	const predefinedHooks = {
	    iconBegin,
	    menuItemTextContent,
	};
	function MenuItemTemplate(hooks) {
	    const currentHooks = { ...predefinedHooks, ...hooks };
	    if (!hooks?.listItemContent) {
	        currentHooks.listItemContent = function listItemContent() {
	            return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [currentHooks.menuItemTextContent.call(this), rightContent.call(this), checkmarkContent.call(this)] }));
	        };
	    }
	    return jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [ListItemTemplate.ListItemTemplate.call(this, currentHooks), listItemPostContent.call(this)] });
	}
	function menuItemTextContent() {
	    return jsxRuntime.jsx(jsxRuntime.Fragment, { children: this.text && jsxRuntime.jsx("div", { class: "ui5-menu-item-text", children: this.text }) });
	}
	function checkmarkContent() {
	    return !this._markChecked ? "" : (jsxRuntime.jsx("div", { class: "ui5-menu-item-checked", children: jsxRuntime.jsx(Icon.Icon, { name: ListItemTemplate.checkIcon, class: "ui5-menu-item-icon-checked" }) }));
	}
	function rightContent() {
	    switch (true) {
	        case this.hasSubmenu:
	            return (jsxRuntime.jsx("div", { class: "ui5-menu-item-submenu-icon", children: jsxRuntime.jsx(Icon.Icon, { part: "subicon", name: ListItemTemplate.slimArrowRight, class: "ui5-menu-item-icon-end" }) }));
	        case this.hasEndContent:
	            return (jsxRuntime.jsx("div", { class: "ui5-menu-item-end-content", role: "group", "aria-label": this.endContentAccessibleName, children: jsxRuntime.jsx("slot", { name: "endContent", onKeyDown: this._endContentKeyDown }) }));
	        case !!this.additionalText:
	            return (jsxRuntime.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", "aria-hidden": this._accInfo.ariaHidden, children: this.additionalText }));
	    }
	}
	function iconBegin() {
	    if (this.hasIcon) {
	        return jsxRuntime.jsx(Icon.Icon, { class: "ui5-li-icon", name: this.icon });
	    }
	    if (this._siblingsWithIcon) {
	        return jsxRuntime.jsx("div", { class: "ui5-menu-item-dummy-icon" });
	    }
	}
	function listItemPostContent() {
	    return this.hasSubmenu && jsxRuntime.jsxs(ResponsivePopover.ResponsivePopover, { id: `${this._id}-menu-rp`, class: "ui5-menu-rp ui5-menu-rp-sub-menu", preventInitialFocus: true, preventFocusRestore: true, hideArrow: true, allowTargetOverlap: true, placement: ResponsivePopover.PopoverPlacement.End, verticalAlign: "Top", accessibleName: this.accessibleNameText, onBeforeOpen: this._beforePopoverOpen, onOpen: this._afterPopoverOpen, onBeforeClose: this._beforePopoverClose, onClose: this._afterPopoverClose, children: [this.isPhone && (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("div", { slot: "header", class: "ui5-menu-dialog-header", children: [jsxRuntime.jsx(Button.Button, { icon: navBackIcon, class: "ui5-menu-back-button", design: "Transparent", "aria-label": this.labelBack, onClick: this._close }), jsxRuntime.jsx("div", { class: "ui5-menu-dialog-title", children: jsxRuntime.jsx("div", { children: this.text }) })] }) })), jsxRuntime.jsx("div", { id: `${this._id}-menu-main`, class: this.loading ? "menu-busy-indicator-main" : "", "aria-busy": this.loading, children: this.items.length ? (jsxRuntime.jsx(List.List, { id: `${this._id}-menu-list`, selectionMode: "None", separators: "None", accessibleRole: "Menu", loading: this.loading, loadingDelay: this.loadingDelay, onMouseOver: this._itemMouseOver, onKeyDown: this._itemKeyDown, onKeyUp: this._itemKeyUp, "onui5-close-menu": this._close, "onui5-exit-end-content": this._navigateOutOfEndContent, children: jsxRuntime.jsx("slot", {}) })) : this.loading && jsxRuntime.jsx(Button.BusyIndicator, { id: `${this._id}-menu-busy-indicator`, delay: this.loadingDelay, class: "ui5-menu-busy-indicator", active: true }) }), this.isPhone && (jsxRuntime.jsx("div", { slot: "footer", class: "ui5-menu-dialog-footer", children: jsxRuntime.jsx(Button.Button, { design: "Transparent", onClick: this._closeAll, children: this.labelCancel }) }))] });
	}

	Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
	Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
	var menuItemCss = `:host{line-height:initial}::slotted([ui5-menu-item]){line-height:inherit}.ui5-menu-rp[ui5-responsive-popover]::part(header),.ui5-menu-rp[ui5-responsive-popover]::part(content),.ui5-menu-rp[ui5-responsive-popover]::part(footer){padding:0}.ui5-menu-rp[ui5-responsive-popover]{box-shadow:var(--sapContent_Shadow1);border-radius:var(--_ui5_menu_popover_border_radius)}.ui5-menu-busy-indicator{width:100%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}.ui5-menu-busy-indicator-main{min-height:var(--_ui5_list_item_base_height)}.ui5-menu-dialog-header{display:flex;height:var(--_ui5-responsive_popover_header_height);align-items:center;justify-content:space-between;padding:0px 1rem;width:100%;overflow:hidden}.ui5-menu-dialog-title{display:flex;flex-direction:row;align-items:center;justify-content:flex-start;width:calc(100% - 6.5rem);padding-right:1rem;font-family:var(--sapFontHeaderFamily)}.ui5-menu-dialog-title>h1{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--sapFontHeader5Size)}.ui5-menu-back-button{margin-right:1rem}.ui5-menu-dialog-footer{display:flex;align-items:center;justify-content:flex-end;padding:0 1rem;width:100%;border-top:.0625rem solid var(--sapPageFooter_BorderColor)}.ui5-menu-rp.ui5-menu-rp-sub-menu{margin-top:.25rem;margin-inline:var(--_ui5_menu_submenu_margin_offset)}:host([disabled]){pointer-events:initial;opacity:initial}:host([disabled])::part(content){opacity:var(--_ui5-listitembase_disabled_opacity)}:host([disabled][actionable]:not([active]):not([selected]):hover),:host([disabled][active][actionable]){background:var(--ui5-listitem-background-color)}:host([active]:not([disabled])),:host([active]:not([disabled])):hover{background-color:var(--sapList_Active_Background)}:host(:not([active]):not([selected]):not([disabled]):hover){background-color:var(--sapList_Hover_Background)}:host([disabled][active][actionable]) .ui5-li-root .ui5-li-icon{color:var(--sapContent_NonInteractiveIconColor)}:host([active]:not([disabled]))::part(content),:host([active]:not([disabled]))::part(additional-text),:host([active]:not([disabled])) .ui5-li-root .ui5-li-icon{color:var(--sapList_Active_TextColor)}:host([focused]:not([active]):not([disabled])){background-color:var(--sapList_Hover_Background)}:host::part(additional-text){margin:unset;margin-inline-start:1rem;color:var(--sapContent_LabelColor);min-width:max-content}.ui5-menu-item-text{width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;display:inline-block;font-size:var(--sapFontSize)}.ui5-menu-item-dummy-icon{visibility:hidden}:host::part(title){font-size:var(--sapFontSize);padding-top:.125rem}:host([icon]:not([is-phone]))::part(title),:host([is-phone]:not([icon=""]))::part(title){padding-top:0}:host(:not([is-phone]))::part(native-li){user-select:none;padding:var(--_ui5_menu_item_padding)}:host::part(content){padding-inline-end:.25rem}.ui5-menu-item-submenu-icon{min-width:var(--_ui5_list_item_icon_size);min-height:var(--_ui5_list_item_icon_size);display:inline-block;vertical-align:middle;pointer-events:none}.ui5-menu-item-icon-end{display:inline-block;vertical-align:middle;padding-inline-start:.5rem;pointer-events:none;position:absolute;inset-inline-end:var(--_ui5_menu_item_submenu_icon_right)}.ui5-menu-item-submenu-icon .ui5-menu-item-icon-end{color:var(--sapContent_NonInteractiveIconColor)}.ui5-menu-item-dummy-icon{min-width:var(--_ui5_list_item_icon_size);min-height:var(--_ui5_list_item_icon_size);display:inline-block;vertical-align:middle;padding-inline-end:.75rem;pointer-events:none}.ui5-menu-item-checked{padding-inline-start:.5rem;padding-inline-end:0;font-weight:400;text-align:center}.ui5-menu-item-icon-checked{color:var(--sapContent_BusyColor);padding-top:.25rem}.ui5-menu-item-end-content{display:inline-flex;align-items:center}.ui5-menu-busy-indicator{position:absolute;width:100%;top:50%;left:50%;transform:translate(-50%,-50%)}
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
	let MenuItem = MenuItem_1 = class MenuItem extends ListItemTemplate.ListItem {
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
	        this._openedByMouse = false;
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
	    get labelCancel() {
	        return MenuItem_1.i18nBundle.getText(i18nDefaults.MENU_CANCEL_BUTTON_TEXT);
	    }
	    get accessibleNameText() {
	        return MenuItem_1.i18nBundle.getText(i18nDefaults.MENU_POPOVER_ACCESSIBLE_NAME);
	    }
	    get endContentAccessibleName() {
	        return MenuItem_1.i18nBundle.getText(i18nDefaults.MENU_ITEM_END_CONTENT_ACCESSIBLE_NAME);
	    }
	    get loadingText() {
	        return MenuItem_1.i18nBundle.getText(i18nDefaults.MENU_ITEM_LOADING);
	    }
	    /**
	     * Returns the text for aria-describedby, including loading state for iOS VoiceOver support.
	     * When a menu item with a submenu is focused and is in loading state, the loading text
	     * will be announced by screen readers.
	     */
	    get ariaSelectedText() {
	        const texts = [];
	        const parentAriaSelectedText = super.ariaSelectedText;
	        if (parentAriaSelectedText) {
	            texts.push(parentAriaSelectedText);
	        }
	        // Add loading text when the menu item has a submenu and is loading
	        if (this.hasSubmenu && this.loading) {
	            texts.push(this.loadingText);
	        }
	        return texts.length ? texts.join(" ") : undefined;
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
	        await Theme.w();
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
	        const slottedItems = this.getSlottedNodes("items");
	        slottedItems.forEach(item => {
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
	        if (!Theme.f$1()) {
	            return;
	        }
	        const item = e.target;
	        if (!isInstanceOfMenuItem(item)) {
	            return;
	        }
	        item.getFocusDomRef()?.focus();
	        this._closeOtherSubMenus(item);
	    }
	    _isSpace(e) {
	        this._shiftPressed = this._isCheckable && webcomponentsBase.K(e);
	        return webcomponentsBase.A(e) || webcomponentsBase.K(e);
	    }
	    _isEnter(e) {
	        this._shiftPressed = this._isCheckable && webcomponentsBase.i(e);
	        return webcomponentsBase.b(e) || webcomponentsBase.i(e);
	    }
	    _onclick(e) {
	        // Clicks on the endContent slot must not activate the item (which would close the menu).
	        if (this._isEndContentClicked(e)) {
	            return;
	        }
	        this._shiftPressed = this._isCheckable && e.shiftKey;
	        super._onclick(e);
	    }
	    _isEndContentClicked(e) {
	        return this.endContent.some(element => e.composedPath().includes(element));
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
	        if (!this._openedByMouse) {
	            this._allMenuItems[0]?.focus();
	        }
	        if (this.loading) {
	            List.p(MenuItem_1.i18nBundle.getText(i18nDefaults.MENU_ITEM_LOADING));
	        }
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
	        this._openedByMouse = false;
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
	    webcomponentsBase.d()
	], MenuItem.prototype, "endContent", void 0);
	__decorate([
	    parametersBundle_css.i("@ui5/webcomponents")
	], MenuItem, "i18nBundle", void 0);
	MenuItem = MenuItem_1 = __decorate([
	    webcomponentsBase.m({
	        tag: "ui5-menu-item",
	        renderer: jsxRuntime.y,
	        template: MenuItemTemplate,
	        styles: [ListItemTemplate.ListItem.styles, menuItemCss],
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
	var MenuItem$1 = MenuItem;
	const isInstanceOfMenuItem = webcomponentsBase.r$1("isMenuItem");

	exports.MenuItem = MenuItem$1;
	exports.MenuItemGroupCheckMode = MenuItemGroupCheckMode$1;
	exports.MenuItemTemplate = MenuItemTemplate;
	exports.isInstanceOfMenuItem = isInstanceOfMenuItem;
	exports.isInstanceOfMenuItemGroup = isInstanceOfMenuItemGroup;
	exports.isInstanceOfMenuSeparator = isInstanceOfMenuSeparator;

}));
