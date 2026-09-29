sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/UserSettingsView.css', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/parameters-bundle3.css'], (function (webcomponentsBase, parametersBundle_css, UserSettingsView_css, ManagedStyles, Icons, parametersBundle_css$1) { 'use strict';

    function UserSettingsViewTemplate() {
        return (parametersBundle_css.jsx("div", { class: "ui5-user-settings-view-container", children: parametersBundle_css.jsx("div", { class: "ui5-user-settings-view", children: parametersBundle_css.jsx("slot", {}) }) }));
    }

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
     * The `ui5-user-settings-view` represents a view displayed in the `ui5-user-settings-item`.
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.8.0
     */
    let UserSettingsView = class UserSettingsView extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the view is selected. There can be just one selected view at a time.
             *
             * @default false
             * @public
             */
            this.selected = false;
            /**
             * Indicates whether the view is secondary. It is relevant only if the view is used in `pages` slot of `ui5-user-settings-item`
             * and controls the visibility of the back button.
             * @default false
             * @public
             */
            this.secondary = false;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], UserSettingsView.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsView.prototype, "selected", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsView.prototype, "secondary", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            "default": true,
        })
    ], UserSettingsView.prototype, "content", void 0);
    UserSettingsView = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-view",
            renderer: parametersBundle_css.y,
            template: UserSettingsViewTemplate,
            styles: [UserSettingsView_css.UserSettingViewCss],
        })
    ], UserSettingsView);
    UserSettingsView.define();
    var UserSettingsView$1 = UserSettingsView;

    return UserSettingsView$1;

}));
