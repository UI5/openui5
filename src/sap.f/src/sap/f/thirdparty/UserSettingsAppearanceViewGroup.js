sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType'], (function (exports, webcomponentsBase, ListItemGroup, ManagedStyles, Icons, eventStrict, parametersBundle_css, parametersBundle_css$1, toLowercaseEnumValue, ListItemBase, i18nDefaults, WrappingType) { 'use strict';

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
     * The `ui5-user-settings-appearance-view-group` is a special list item group used to group appearance view items.
     *
     * This is the item to use inside a `ui5-user-settings-appearance-view`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsAppearanceViewGroup.js";`
     *
     * @constructor
     * @extends ListItemGroup
     * @public
     * @since 2.17.0
     * @csspart header - Used to style the header item of the group
     * @csspart title - Used to style the title of the group header
     */
    let UserSettingsAppearanceViewGroup = class UserSettingsAppearanceViewGroup extends ListItemGroup.ListItemGroup {
        get isUserSettingsAppearanceViewGroup() {
            return true;
        }
    };
    __decorate([
        webcomponentsBase.d({
            "default": true,
            invalidateOnChildChange: true,
            type: HTMLElement,
        })
    ], UserSettingsAppearanceViewGroup.prototype, "items", void 0);
    UserSettingsAppearanceViewGroup = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-appearance-view-group",
        })
    ], UserSettingsAppearanceViewGroup);
    UserSettingsAppearanceViewGroup.define();
    const isInstanceOfUserSettingsAppearanceViewGroup = webcomponentsBase.r("isUserSettingsAppearanceViewGroup");
    var UserSettingsAppearanceViewGroup_default = UserSettingsAppearanceViewGroup;

    exports.default = UserSettingsAppearanceViewGroup_default;
    exports.isInstanceOfUserSettingsAppearanceViewGroup = isInstanceOfUserSettingsAppearanceViewGroup;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
