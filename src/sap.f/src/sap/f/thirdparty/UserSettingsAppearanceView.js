sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/UserSettingsView', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/List', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/UserSettingsView.css', 'sap/f/thirdparty/UserSettingsAppearanceViewItem', 'sap/f/thirdparty/UserSettingsAppearanceViewGroup', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/edit', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/ListItemCustom', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/Avatar2'], (function (webcomponentsBase, UserSettingsView, parametersBundle_css, List, ListItemGroup, UserSettingsView_css, UserSettingsAppearanceViewItem, UserSettingsAppearanceViewGroup, eventStrict, ManagedStyles, Icons, toLowercaseEnumValue, parametersBundle_css$1, AccessibilityTextsHelper, InvisibleMessage, ListItemTemplate, ListItemBase, decline, edit, i18nDefaults, Button, willShowContent, Icon, Label, ValueState, ListItemCustom, WrappingType, parametersBundle_css$2, Avatar) { 'use strict';

    function UserSettingsAppearanceViewTemplate() {
        return (parametersBundle_css.jsx("div", { class: "ui5-user-settings-view-container", children: parametersBundle_css.jsxs("div", { class: "ui5-user-settings-view", children: [parametersBundle_css.jsx("slot", { name: "additionalContent" }), parametersBundle_css.jsxs(List.List, { class: "user-settings-appearance-view-list", onItemClick: this._handleItemClick, "data-sap-ui-fastnavgroup": "false", children: [this.text && parametersBundle_css.jsx(ListItemGroup.ListItemGroupHeader, { class: "user-settings-appearance-view-top-header", children: this.text }), parametersBundle_css.jsx("slot", {})] })] }) }));
    }

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let UserSettingsAppearanceView =
    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-appearance-view` represents a view displayed in the `ui5-user-settings-item`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceView.js";`
     *
     * @constructor
     * @extends UserSettingsView
     * @public
     * @since 2.17.0
     */
    class UserSettingsAppearanceView extends UserSettingsView {
        constructor() {
            super(...arguments);
            this._handleItemClick = (e) => {
                const listItem = e.detail.item;
                if (UserSettingsAppearanceViewItem.isInstanceOfUserSettingsAppearanceViewItem(listItem)) {
                    const eventPrevented = !this.fireDecoratorEvent("selection-change", {
                        item: listItem,
                    });
                    if (!eventPrevented) {
                        this._getAllItems().forEach(viewItem => {
                            viewItem.selected = false;
                        });
                        listItem.selected = true;
                    }
                }
            };
        }
        _getAllItems() {
            const allItems = [];
            this.items.forEach(item => {
                if (UserSettingsAppearanceViewGroup.isInstanceOfUserSettingsAppearanceViewGroup(item)) {
                    const groupItems = Array.from(item.children).filter(UserSettingsAppearanceViewItem.isInstanceOfUserSettingsAppearanceViewItem);
                    allItems.push(...groupItems);
                }
                else if (UserSettingsAppearanceViewItem.isInstanceOfUserSettingsAppearanceViewItem(item)) {
                    allItems.push(item);
                }
            });
            return allItems;
        }
    };
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            "default": true,
            invalidateOnChildChange: true,
        })
    ], UserSettingsAppearanceView.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
        })
    ], UserSettingsAppearanceView.prototype, "additionalContent", void 0);
    UserSettingsAppearanceView = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-appearance-view",
            renderer: parametersBundle_css.y,
            template: UserSettingsAppearanceViewTemplate,
            styles: [UserSettingsView_css.UserSettingViewCss],
        })
        /**
         * Fired when an item is selected.
         * @param {UserSettingsAppearanceViewItem} item The selected `user settings appearance view item`.
         * @public
         */
        ,
        eventStrict.l("selection-change", {
            cancelable: true,
        })
        /**
         * @class
         * ### Overview
         *
         * The `ui5-user-settings-appearance-view` represents a view displayed in the `ui5-user-settings-item`.
         *
         * ### ES6 Module Import
         * `import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceView.js";`
         *
         * @constructor
         * @extends UserSettingsView
         * @public
         * @since 2.17.0
         */
    ], UserSettingsAppearanceView);
    UserSettingsAppearanceView.define();
    var UserSettingsAppearanceView_default = UserSettingsAppearanceView;

    return UserSettingsAppearanceView_default;

}));
