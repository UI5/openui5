sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/MenuItem2', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/information', 'sap/f/thirdparty/ListItemCustom', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/List', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ListItemAdditionalText.css', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Title'], (function (webcomponentsBase, MenuItem, Theme, parametersBundle_css, parametersBundle_css$1, Icons, eventStrict, parametersBundle_css$2, information, ListItemCustom, FocusableElements, ListItemBase, List, toLowercaseEnumValue, ListItemGroup, i18nDefaults, WrappingType, AccessibilityTextsHelper, BusyIndicator, willShowContent, Label, ListItemAdditionalText_css, Button, Icon, ValueState, ResponsivePopover, Title) { 'use strict';

    function UserMenuItemTemplate() {
        return [MenuItem.MenuItemTemplate.call(this)];
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var userMenuItemCss = `:host{height:40px}:host(:last-of-type){margin-bottom:0}:host(:first-of-type){margin-top:0}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
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
     * @experimental
     * @public
     * @since 2.5.0
     */
    let UserMenuItem = class UserMenuItem extends MenuItem.MenuItem {
        get _menuItems() {
            return this.items.filter(MenuItem.isInstanceOfMenuItem);
        }
    };
    __decorate([
        webcomponentsBase.d({ "default": true, type: HTMLElement, invalidateOnChildChange: true })
    ], UserMenuItem.prototype, "items", void 0);
    UserMenuItem = __decorate([
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
