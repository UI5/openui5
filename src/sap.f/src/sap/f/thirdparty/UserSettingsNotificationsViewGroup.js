sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType'], (function (exports, webcomponentsBase, ListItemGroup, ManagedStyles, parametersBundle_css, parametersBundle_css$1, Icons, eventStrict, parametersBundle_css$2, toLowercaseEnumValue, ListItemBase, i18nDefaults, WrappingType) { 'use strict';

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var UserSettingsNotificationsViewGroupCss = `:host{background:var(--sapList_Background)}::part(header){background:var(--sapList_Background);border-bottom:none}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-notifications-view-group` groups `ui5-user-settings-notifications-view-item`
     * elements inside a `ui5-user-settings-notifications-view`. Its header renders as a plain bold
     * section title with a separator line below, per the notifications design spec.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsNotificationsViewGroup.js";`
     *
     * @constructor
     * @extends ListItemGroup
     * @public
     * @since 2.27.0
     */
    let UserSettingsNotificationsViewGroup = class UserSettingsNotificationsViewGroup extends ListItemGroup.ListItemGroup {
        get isUserSettingsNotificationsViewGroup() {
            return true;
        }
    };
    __decorate([
        webcomponentsBase.d({
            "default": true,
            invalidateOnChildChange: true,
            type: HTMLElement,
        })
    ], UserSettingsNotificationsViewGroup.prototype, "items", void 0);
    UserSettingsNotificationsViewGroup = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-notifications-view-group",
            styles: [ListItemGroup.ListItemGroup.styles, UserSettingsNotificationsViewGroupCss],
        })
    ], UserSettingsNotificationsViewGroup);
    UserSettingsNotificationsViewGroup.define();
    const isInstanceOfUserSettingsNotificationsViewGroup = webcomponentsBase.r("isUserSettingsNotificationsViewGroup");
    var UserSettingsNotificationsViewGroup_default = UserSettingsNotificationsViewGroup;

    exports.default = UserSettingsNotificationsViewGroup_default;
    exports.isInstanceOfUserSettingsNotificationsViewGroup = isInstanceOfUserSettingsNotificationsViewGroup;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
