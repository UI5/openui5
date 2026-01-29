sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemCustom', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/MenuItem2', 'sap/f/thirdparty/List', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/information', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/ListItemAdditionalText.css', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/willShowContent'], (function (webcomponentsBase, eventStrict, Theme, parametersBundle_css$1, ListItemCustom, parametersBundle_css, ResponsivePopover, MenuItem, List, BusyIndicator, Button, information, i18nDefaults, Icons, FocusableElements, ListItemBase, ListItemAdditionalText_css, Icon, ValueState, AccessibilityTextsHelper, Label, Title, toLowercaseEnumValue, ListItemGroup, WrappingType, willShowContent) { 'use strict';

    function MenuTemplate() {
        return (parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { id: `${this._id}-menu-rp`, class: "ui5-menu-rp", placement: "Bottom", verticalAlign: "Bottom", horizontalAlign: this.horizontalAlign, opener: this.opener, open: this.open, preventInitialFocus: true, hideArrow: true, allowTargetOverlap: true, accessibleName: this.acessibleNameText, onBeforeOpen: this._beforePopoverOpen, onOpen: this._afterPopoverOpen, onBeforeClose: this._beforePopoverClose, onClose: this._afterPopoverClose, children: [this.isPhone &&
                    parametersBundle_css.jsxs("div", { slot: "header", class: "ui5-menu-dialog-header", children: [parametersBundle_css.jsx("div", { class: "ui5-menu-dialog-title", children: parametersBundle_css.jsx("h1", { children: this.headerText }) }), parametersBundle_css.jsx(Button.Button, { icon: information.decline, design: "Transparent", "aria-label": this.labelClose, onClick: this._close })] }), parametersBundle_css.jsx("div", { id: `${this._id}-menu-main`, children: this.items.length ?
                        (parametersBundle_css.jsx(List.List, { id: `${this._id}- menu-list`, selectionMode: "None", loading: this.loading, loadingDelay: this.loadingDelay, separators: "None", accessibleRole: "Menu", onItemClick: this._itemClick, onMouseOver: this._itemMouseOver, onKeyDown: this._itemKeyDown, "onui5-close-menu": this._close, "onui5-exit-end-content": this._navigateOutOfEndContent, children: parametersBundle_css.jsx("slot", {}) }))
                        : this.loading && (parametersBundle_css.jsx(BusyIndicator.BusyIndicator, { id: `${this._id}-menu-busy-indicator`, delay: this.loadingDelay, class: "ui5-menu-busy-indicator", active: true })) })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var menuCss = `:host{line-height:initial}::slotted([ui5-menu-item]){line-height:inherit}.ui5-menu-rp[ui5-responsive-popover]::part(header),.ui5-menu-rp[ui5-responsive-popover]::part(content),.ui5-menu-rp[ui5-responsive-popover]::part(footer){padding:0}.ui5-menu-rp[ui5-responsive-popover]{box-shadow:var(--sapContent_Shadow1);border-radius:var(--_ui5-v2-15-0_menu_popover_border_radius)}.ui5-menu-busy-indicator{width:100%}.ui5-menu-dialog-header{display:flex;height:var(--_ui5-v2-15-0-responsive_popover_header_height);align-items:center;justify-content:space-between;padding:0px 1rem;width:100%;overflow:hidden}.ui5-menu-dialog-title{display:flex;flex-direction:row;align-items:center;justify-content:flex-start;width:calc(100% - 6.5rem);padding-right:1rem;font-family:var(--sapFontHeaderFamily)}.ui5-menu-dialog-title>h1{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--sapFontHeader5Size)}.ui5-menu-back-button{margin-right:1rem}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Menu_1;
    const MENU_OPEN_DELAY = 300;
    /**
     * @class
     *
     * ### Overview
     *
     * `ui5-menu` component represents a hierarchical menu structure.
     *
     * ### Structure
     *
     * The `ui5-menu` can hold two types of entities:
     *
     * - `ui5-menu-item` components
     * - `ui5-menu-separator` - used to separate menu items with a line
     *
     * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
     *
     * ### Keyboard Handling
     *
     * The `ui5-menu` provides advanced keyboard handling.
     * The user can use the following keyboard shortcuts in order to navigate trough the tree:
     *
     * - `Arrow Up` / `Arrow Down` - Navigates up and down the menu items that are currently visible.
     * - `Arrow Right`, `Space` or `Enter` - Opens a sub-menu if there are menu items nested
     * in the currently clicked menu item.
     * - `Arrow Left` or `Escape` - Closes the currently opened sub-menu.
     *
     * when there is `endContent` :
     * - `Arrow Left` or `ArrowRight` - Navigate between the menu item actions and the menu item itself
     * - `Arrow Up` / `Arrow Down` - Navigates up and down the currently visible menu items
     *
     * **Note:** If the text direction is set to Right-to-left (RTL), `Arrow Right` and `Arrow Left` functionality is swapped.
     *
     * Application developers are responsible for ensuring that interactive elements placed in the `endContent` slot
     * have the correct accessibility behaviour, including their enabled or disabled states.
     * The menu does not manage these aspects when the menu item state changes.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Menu.js";`
     * @constructor
     * @extends UI5Element
     * @since 1.3.0
     * @public
     */
    let Menu = Menu_1 = class Menu extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Indicates if the menu is open.
             * @public
             * @default false
             * @since 1.10.0
             */
            this.open = false;
            /**
             * Determines the horizontal alignment of the menu relative to its opener control.
             * @default "Start"
             * @public
             */
            this.horizontalAlign = "Start";
            /**
             * Defines if a loading indicator would be displayed inside the corresponding ui5-menu popover.
             * @default false
             * @public
             * @since 1.13.0
             */
            this.loading = false;
            /**
             * Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding ui5-menu popover.
             * @default 1000
             * @public
             * @since 1.13.0
             */
            this.loadingDelay = 1000;
        }
        get isRtl() {
            return this.effectiveDir === "rtl";
        }
        get labelClose() {
            return Menu_1.i18nBundle.getText(i18nDefaults.MENU_CLOSE_BUTTON_ARIA_LABEL);
        }
        get isPhone() {
            return Theme.d();
        }
        get _popover() {
            return this.shadowRoot.querySelector("[ui5-responsive-popover]");
        }
        get _list() {
            return this.shadowRoot.querySelector("[ui5-list]");
        }
        /** Returns menu item groups */
        get _menuItemGroups() {
            return this.items.filter(MenuItem.isInstanceOfMenuItemGroup);
        }
        /** Returns menu items */
        get _menuItems() {
            return this.items.filter(MenuItem.isInstanceOfMenuItem);
        }
        /** Returns all menu items (including those in groups */
        get _allMenuItems() {
            const items = [];
            this.items.forEach(item => {
                if (MenuItem.isInstanceOfMenuItemGroup(item)) {
                    items.push(...item._menuItems);
                }
                else if (!MenuItem.isInstanceOfMenuSeparator(item)) {
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
                if (MenuItem.isInstanceOfMenuItemGroup(item)) {
                    const groupItems = item.getSlottedNodes("items");
                    items.push(...groupItems);
                }
                else if (!MenuItem.isInstanceOfMenuSeparator(item)) {
                    items.push(item);
                }
            });
            return items;
        }
        get acessibleNameText() {
            return Menu_1.i18nBundle.getText(i18nDefaults.MENU_POPOVER_ACCESSIBLE_NAME);
        }
        onBeforeRendering() {
            const siblingsWithIcon = this._allMenuItems.some(menuItem => !!menuItem.icon);
            this._setupItemNavigation();
            this._allMenuItems.forEach(item => {
                item._siblingsWithIcon = siblingsWithIcon;
            });
        }
        getFocusDomRef() {
            return this._list?.getFocusDomRef();
        }
        _setupItemNavigation() {
            if (this._list) {
                this._list._itemNavigation._getItems = () => this._navigatableMenuItems;
            }
        }
        _close() {
            this.open = false;
        }
        _openItemSubMenu(item) {
            clearTimeout(this._timeout);
            if (!item._popover || item._popover.open) {
                return;
            }
            this.fireDecoratorEvent("before-open", {
                item,
            });
            item._popover.opener = item;
            item._popover.open = true;
            item.selected = true;
        }
        _itemMouseOver(e) {
            if (!Theme.f()) {
                return;
            }
            const item = e.target;
            if (!MenuItem.isInstanceOfMenuItem(item)) {
                return;
            }
            item.focus();
            // Opens submenu with 300ms delay
            this._startOpenTimeout(item);
        }
        async focus(focusOptions) {
            await Theme.f$1();
            const firstMenuItem = this._allMenuItems[0];
            if (firstMenuItem) {
                return firstMenuItem.focus(focusOptions);
            }
            return super.focus(focusOptions);
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
        _startOpenTimeout(item) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(() => {
                this._closeOtherSubMenus(item);
                this._openItemSubMenu(item);
            }, MENU_OPEN_DELAY);
        }
        _itemClick(e) {
            const item = e.detail.item;
            if (!item._popover) {
                const prevented = !this.fireDecoratorEvent("item-click", {
                    "item": item,
                    "text": item.text || "",
                });
                if (!prevented) {
                    item._updateCheckedState();
                    this._popover && !item._shiftPressed && item.fireDecoratorEvent("close-menu");
                }
            }
            else {
                this._openItemSubMenu(item);
            }
        }
        _itemKeyDown(e) {
            const isTabNextPrevious = webcomponentsBase.x(e) || webcomponentsBase.V(e);
            const item = e.target;
            if (!MenuItem.isInstanceOfMenuItem(item)) {
                return;
            }
            const isEndContentNavigation = webcomponentsBase.R(e) || webcomponentsBase.D(e);
            const shouldOpenMenu = this.isRtl ? webcomponentsBase.D(e) : webcomponentsBase.R(e);
            if (webcomponentsBase.b$1(e) || isTabNextPrevious) {
                e.preventDefault();
            }
            if (isEndContentNavigation) {
                item._navigateToEndContent(webcomponentsBase.D(e));
            }
            if (shouldOpenMenu) {
                this._openItemSubMenu(item);
            }
            else if (isTabNextPrevious) {
                this._close();
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
        _beforePopoverOpen(e) {
            const prevented = !this.fireDecoratorEvent("before-open", {});
            if (prevented) {
                this.open = false;
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
                this.open = true;
                e.preventDefault();
            }
        }
        _afterPopoverClose() {
            this.open = false;
            this.fireDecoratorEvent("close");
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Menu.prototype, "headerText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Menu.prototype, "open", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Menu.prototype, "horizontalAlign", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Menu.prototype, "loading", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], Menu.prototype, "loadingDelay", void 0);
    __decorate([
        webcomponentsBase.s({ converter: ResponsivePopover.e })
    ], Menu.prototype, "opener", void 0);
    __decorate([
        webcomponentsBase.d({ "default": true, type: HTMLElement, invalidateOnChildChange: true })
    ], Menu.prototype, "items", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Menu, "i18nBundle", void 0);
    Menu = Menu_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-menu",
            renderer: parametersBundle_css.y,
            styles: menuCss,
            template: MenuTemplate,
        })
        /**
         * Fired when an item is being clicked.
         *
         * **Note:** Since 1.17.0 the event is preventable, allowing the menu to remain open after an item is pressed.
         * @param { HTMLElement } item The currently clicked menu item.
         * @param { string } text The text of the currently clicked menu item.
         * @public
         */
        ,
        eventStrict.l("item-click", {
            cancelable: true,
        })
        /**
         * Fired before the menu is opened. This event can be cancelled, which will prevent the menu from opening.
         *
         * **Note:** Since 1.14.0 the event is also fired before a sub-menu opens.
         * @public
         * @since 1.10.0
         * @param { HTMLElement } item The `ui5-menu-item` that triggers opening of the sub-menu or undefined when fired upon root menu opening.
         */
        ,
        eventStrict.l("before-open", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired after the menu is opened.
         * @public
         * @since 1.10.0
         */
        ,
        eventStrict.l("open", {
            bubbles: true,
        })
        /**
         * Fired when the menu is being closed.
         * @private
         */
        ,
        eventStrict.l("close-menu", {
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
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired after the menu is closed.
         * @public
         * @since 1.10.0
         */
        ,
        eventStrict.l("close")
    ], Menu);
    Menu.define();
    var Menu$1 = Menu;

    return Menu$1;

}));
