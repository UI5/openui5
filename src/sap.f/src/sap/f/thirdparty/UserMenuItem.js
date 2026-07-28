sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/MenuItem2', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/List', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/information'], (function (webcomponentsBase, MenuItem, parametersBundle_css, ManagedStyles, parametersBundle_css$1, Icons, eventStrict, parametersBundle_css$2, decline, List, toLowercaseEnumValue, ListItemGroup, ListItemBase, i18nDefaults, WrappingType, AccessibilityTextsHelper, ListItemTemplate, Button, willShowContent, Icon, Label, ValueState, ResponsivePopover, Title, FocusableElements, information) { 'use strict';

    function UserMenuItemTemplate() {
        const hooks = {};
        if (this.showSelection) {
            hooks.menuItemTextContent = userMenuItemTextContent;
        }
        return [MenuItem.MenuItemTemplate.call(this, hooks)];
    }
    function userMenuItemTextContent() {
        return (parametersBundle_css.jsxs("div", { class: "ui5-user-menu-item-text-wrapper", children: [this.text && parametersBundle_css.jsx("div", { class: "ui5-menu-item-text", children: this.text }), this._selectedSubItemText &&
                    parametersBundle_css.jsx("div", { class: "ui5-user-menu-item-selection-text", children: this._selectedSubItemText })] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var userMenuItemCss = `:host{height:2.5rem;min-height:2.5rem;border:none}.ui5-li-root{min-height:2.5rem}:host(:last-of-type){margin-bottom:0}:host(:first-of-type){margin-top:0}:host([show-selection]){height:3.25rem;min-height:3.25rem}:host([show-selection]) .ui5-li-root{min-height:3.25rem;padding-block:.5rem}.ui5-user-menu-item-text-wrapper{display:flex;flex-direction:column;gap:.25rem;overflow:hidden;flex:1;min-width:0}.ui5-user-menu-item-selection-text{font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;color:var(--sapContent_LabelColor);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var UserMenuItem_1;
    /**
     * @class
     *
     * ### Overview
     *
     * `ui5-user-menu-item` is the item to use inside a `ui5-user-menu`.
     * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
     *
     * ### Usage
     *
     * `ui5-user-menu-item` represents a node in a `ui5-user-menu`. The user menu itself is rendered as a list,
     * and each `ui5-menu-item` is represented by a menu item in that menu. Therefore, you should only use
     * `ui5-user-menu-item` directly in your apps. The `ui5-menu` menu item is internal for the menu, and not intended for public use.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/UserMenuItem.js";`
     * @constructor
     * @extends MenuItem
     * @public
     * @since 2.5.0
     */
    let UserMenuItem = UserMenuItem_1 = class UserMenuItem extends MenuItem.MenuItem {
        constructor() {
            super(...arguments);
            /**
             * When set, a second line appears below the menu item text showing the text
             * of the currently selected sub-item. Intended for use with a single-select
             * ui5-menu-item-group (check-mode="Single").
             * When enabled, the checked sub-item cannot be unchecked,
             * ensuring the selection text is always displayed.
             *
             * @default false
             * @public
             * @since 2.22.0
             */
            this.showSelection = false;
        }
        get _menuItems() {
            return this.items.filter(MenuItem.isInstanceOfMenuItem);
        }
        /**
         * Overrides the base MenuItem behavior to prevent unchecking
         * the currently checked item in single-select mode when
         * the parent item uses showSelection, ensuring there is always
         * a visible selection.
         */
        _updateCheckedState() {
            const parentItem = this.parentElement?.parentElement;
            const hasShowSelection = parentItem instanceof UserMenuItem_1 && parentItem.showSelection;
            if (hasShowSelection && this._checkMode === MenuItem.MenuItemGroupCheckMode.Single && this.checked) {
                return;
            }
            super._updateCheckedState();
        }
        /**
         * Returns the text of the currently checked sub-item.
         * Only returns text for single-select groups.
         */
        get _selectedSubItemText() {
            if (!this.showSelection) {
                return "";
            }
            const singleSelectGroup = this._menuItemGroups.find(g => g.checkMode === MenuItem.MenuItemGroupCheckMode.Single);
            if (!singleSelectGroup) {
                return "";
            }
            const checkedItem = singleSelectGroup._menuItems.find(item => item.checked);
            return checkedItem?.text || "";
        }
    };
    __decorate([
        webcomponentsBase.d({ "default": true, type: HTMLElement, invalidateOnChildChange: true })
    ], UserMenuItem.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserMenuItem.prototype, "showSelection", void 0);
    UserMenuItem = UserMenuItem_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-menu-item",
            template: UserMenuItemTemplate,
            styles: [MenuItem.MenuItem.styles, userMenuItemCss],
        })
    ], UserMenuItem);
    UserMenuItem.define();
    var UserMenuItem_default = UserMenuItem;

    return UserMenuItem_default;

}));
