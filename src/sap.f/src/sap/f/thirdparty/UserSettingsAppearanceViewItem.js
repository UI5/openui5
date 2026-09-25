sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/UserSettingsView.css', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/ListItemCustom', 'sap/f/thirdparty/Avatar2', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/edit', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ValueState'], (function (exports, webcomponentsBase, UserSettingsView_css, parametersBundle_css, ListItemCustom, Avatar, ManagedStyles, parametersBundle_css$1, Icons, parametersBundle_css$2, ListItemTemplate, ListItemBase, eventStrict, decline, edit, i18nDefaults, Button, AccessibilityTextsHelper, willShowContent, toLowercaseEnumValue, Icon, Label, ValueState) { 'use strict';

    function UserSettingsAppearanceViewItemTemplate() {
        return ListItemCustom.ListItemCustomTemplate.call(this, {
            listItemContent: listItemContent.bind(this),
        });
    }
    function listItemContent() {
        return (parametersBundle_css.jsx("div", { class: "list-item", children: parametersBundle_css.jsxs("div", { class: "item-left", children: [parametersBundle_css.jsx(Avatar.Avatar, { shape: "Square", icon: this.icon, "color-scheme": this.colorScheme, size: Avatar.AvatarSize.S }), parametersBundle_css.jsx("div", { class: "item-texts", children: parametersBundle_css.jsx("span", { class: "item-title", children: this.text }) })] }) }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var UserSettingsAppearanceViewItemCss = `.list-item{display:flex;align-items:center;justify-content:space-between;padding:.625rem 0;width:100%}.item-left{display:flex;align-items:center;gap:.75rem;flex:1}.item-texts{display:flex;flex-direction:column}.item-title{font-family:var(--sapFontFamily);font-size:var(--sapFontLargeSize);font-weight:400;color:var(--sapList_TextColor);margin:.5rem}.item-subtitle{color:var(--sapContent_LabelColor);font-size:var(--sapFontSize);margin:.5rem}.item-right{display:flex;align-items:center;gap:.5rem}
`;

    const name$1 = "product";
    const pathData$1 = "M15 3.451v9.098L8 16l-7-3.451V3.451l3.5-1.726 7.032 3.42v3.42l-1.188.564V5.835L4.5 3.012 2.156 4.11v7.78L8 14.714l5.844-2.824V4.11L8 1.286l-.9.44-1.316-.66L8 0l7 3.451ZM3.344 9.725l3.468 1.695v1.411L3.344 11.17V9.725Z";
    const ltr$1 = false;
    const viewBox$1 = "0 0 16 16";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

    const name = "product";
    const pathData = "M7.1.375A.75.75 0 0 1 8.126.1l6.5 3.75A.75.75 0 0 1 15 4.5v7a.75.75 0 0 1-.364.643l-6.25 3.75a.75.75 0 0 1-.772 0l-6.25-3.75A.75.75 0 0 1 1 11.5V5a.75.75 0 0 1 .323-.616l3.345-2.307a.75.75 0 0 1 .727.035l5.25 3.25A.75.75 0 0 1 11 6v3.5a.75.75 0 0 1-1.5 0V6.417L5.022 3.645 2.5 5.392v5.682L8 14.375l5.5-3.3V4.932L7.375 1.399A.75.75 0 0 1 7.101.375Zm-3.005 8.51a.75.75 0 0 1 1.02-.29l2.25 1.25a.75.75 0 1 1-.73 1.31l-2.25-1.25a.75.75 0 0 1-.29-1.02Z";
    const ltr = false;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, viewBox, collection, packageName });

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let UserSettingsAppearanceViewItem =
    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-appearance-view-item` represents a theme/appearance option item
     * within the `ui5-user-settings-appearance-view`.
     *
     * It displays a theme with an avatar icon, text label, and can be selected.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceViewItem.js";`
     *
     * @constructor
     * @extends ListItemCustom
     * @public
     * @since 2.17.0
     */
    class UserSettingsAppearanceViewItem extends ListItemCustom.ListItemCustom {
        constructor() {
            super(...arguments);
            /**
             * Defines the unique identifier of the item.
             * @default ""
             * @public
             */
            this.itemKey = "";
            /**
             * Defines the text label displayed for the appearance item.
             * @default ""
             * @public
             */
            this.text = "";
            /**
             * Defines the icon of the appearance item.
             * @default "product"
             * @public
             */
            this.icon = "product";
            /**
             * Defines the color scheme of the avatar.
             * @default "Accent7"
             * @public
             */
            this.colorScheme = "Accent7";
        }
        get isUserSettingsAppearanceViewItem() {
            return true;
        }
        get accessibilityInfo() {
            return {
                ...super.accessibilityInfo,
                description: this.text,
            };
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], UserSettingsAppearanceViewItem.prototype, "itemKey", void 0);
    __decorate([
        webcomponentsBase.s()
    ], UserSettingsAppearanceViewItem.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], UserSettingsAppearanceViewItem.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], UserSettingsAppearanceViewItem.prototype, "colorScheme", void 0);
    UserSettingsAppearanceViewItem = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-appearance-view-item",
            renderer: parametersBundle_css.y,
            template: UserSettingsAppearanceViewItemTemplate,
            styles: [ListItemCustom.ListItemCustom.styles, UserSettingsView_css.UserSettingViewCss, UserSettingsAppearanceViewItemCss],
        })
        /**
         * @class
         * ### Overview
         *
         * The `ui5-user-settings-appearance-view-item` represents a theme/appearance option item
         * within the `ui5-user-settings-appearance-view`.
         *
         * It displays a theme with an avatar icon, text label, and can be selected.
         *
         * ### ES6 Module Import
         * `import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceViewItem.js";`
         *
         * @constructor
         * @extends ListItemCustom
         * @public
         * @since 2.17.0
         */
    ], UserSettingsAppearanceViewItem);
    UserSettingsAppearanceViewItem.define();
    const isInstanceOfUserSettingsAppearanceViewItem = webcomponentsBase.r("isUserSettingsAppearanceViewItem");
    var UserSettingsAppearanceViewItem_default = UserSettingsAppearanceViewItem;

    exports.default = UserSettingsAppearanceViewItem_default;
    exports.isInstanceOfUserSettingsAppearanceViewItem = isInstanceOfUserSettingsAppearanceViewItem;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
