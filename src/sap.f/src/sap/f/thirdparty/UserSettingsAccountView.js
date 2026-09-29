sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/UserSettingsView', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/Avatar2', 'sap/f/thirdparty/user-settings', 'sap/f/thirdparty/Text', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/edit', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/UserSettingsView.css', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/Label'], (function (webcomponentsBase, UserSettingsView, parametersBundle_css, Avatar, userSettings, Text, Button, edit, eventStrict, parametersBundle_css$2, UserSettingsView_css, ManagedStyles, parametersBundle_css$1, i18nDefaults, Icons, Icon, i18nDefaults$1, ValueState, willShowContent, AccessibilityTextsHelper, toLowercaseEnumValue, Label) { 'use strict';

    function UserSettingsAccountViewTemplate() {
        return (parametersBundle_css.jsx("div", { class: "ui5-user-settings-view-container", children: parametersBundle_css.jsxs("div", { class: "ui5-user-settings-view ui5-user-settings-account-view", children: [parametersBundle_css.jsxs("div", { class: "ui5-user-settings-account", children: [parametersBundle_css.jsx("span", { title: this.showEditButton ? this._editAvatarTooltip : undefined, children: parametersBundle_css.jsxs(Avatar.Avatar, { size: "XL", onClick: this.showEditButton ? this._handleEditAvatarClick : undefined, initials: this._account?._initials, fallbackIcon: userSettings.personPlaceholder, class: "ui5-user-settings-account-avatar", mode: this.showEditButton ? "Interactive" : "Image", children: [this._account?.avatarSrc &&
                                            parametersBundle_css.jsx("img", { src: this._account.avatarSrc }), this.showEditButton &&
                                            parametersBundle_css.jsx(userSettings.AvatarBadge, { slot: "badge", icon: edit.edit })] }) }), this._account?.titleText &&
                                parametersBundle_css.jsx(Text.Text, { id: "account-title", class: "ui5-user-settings-account-title", children: this._account.titleText }), this._account?.subtitleText &&
                                parametersBundle_css.jsx(Text.Text, { class: "ui5-user-settings-account-subtitleText", children: this._account.subtitleText }), this._account?.description &&
                                parametersBundle_css.jsx(Text.Text, { class: "ui5-user-settings-account-description", children: this._account.description }), this.showManageAccount &&
                                parametersBundle_css.jsx(Button.Button, { id: "account-manage-btn", icon: userSettings.userSettings, class: "ui5-user-settings-account-btn", onClick: this._handleManageAccountClick, children: this._manageAccountButtonText })] }), parametersBundle_css.jsx("slot", {})] }) }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var UserSettingsAccountViewCss = `.ui5-user-settings-account{display:flex;align-items:center;flex-direction:column;margin-top:2.5rem}.ui5-user-settings-account-avatar{display:flex;max-width:7rem;max-height:7rem;justify-content:center;align-items:center;gap:.625rem}.ui5-user-settings-account-title{text-align:center;margin-top:.25rem;margin-bottom:.25rem;font-family:var(--sapFontFamily);font-size:var(--sapFontLargeSize);color:var(--sapTextColor)}.ui5-user-settings-account-subtitleText,.ui5-user-settings-account-description{text-align:center;margin-bottom:.25rem;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor);overflow:hidden;text-overflow:ellipsis}.ui5-user-settings-account-btn{display:flex;justify-content:center;align-items:center;gap:.625rem;border-radius:var(--sapButton_BorderCornerRadius);border:var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);background:var(--sapButton_Background)}.ui5-user-settings-account-btn::part(button){padding:.375rem}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var UserSettingsAccountView_1;
    let UserSettingsAccountView = UserSettingsAccountView_1 =
    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-account-view` represents a view displayed in the `ui5-user-settings-item`.
     *
     * @constructor
     * @extends UserSettingsView
     * @public
     * @since 2.17.0
     */
    class UserSettingsAccountView extends UserSettingsView {
        constructor() {
            super(...arguments);
            /**
             * Defines if the User Settings Account View shows the edit button on the avatar.
             *
             * @default false
             * @public
             * @since 2.26.0
             */
            this.showEditButton = false;
            /**
             * Defines if the User Menu shows the `Manage Account` option.
             *
             * @default false
             * @public
             */
            this.showManageAccount = false;
        }
        _handleEditAvatarClick(e) {
            if (e.type === "click") {
                this.fireDecoratorEvent("edit-accounts-click");
            }
        }
        _handleManageAccountClick() {
            this.fireDecoratorEvent("manage-account-click");
        }
        get _manageAccountButtonText() {
            return UserSettingsAccountView_1.i18nBundle?.getText(i18nDefaults.USER_SETTINGS_ACCOUNT_MANAGE_ACCOUNT_BUTTON_TXT);
        }
        get _editAvatarTooltip() {
            return UserSettingsAccountView_1.i18nBundle?.getText(i18nDefaults.USER_SETTINGS_ACCOUNT_EDIT_AVATAR_TXT);
        }
        get _account() {
            return this?.account?.[0];
        }
    };
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            invalidateOnChildChange: {
                properties: true,
                slots: false,
            },
        })
    ], UserSettingsAccountView.prototype, "account", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsAccountView.prototype, "showEditButton", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsAccountView.prototype, "showManageAccount", void 0);
    __decorate([
        parametersBundle_css$2.i("@ui5/webcomponents-fiori")
    ], UserSettingsAccountView, "i18nBundle", void 0);
    UserSettingsAccountView = UserSettingsAccountView_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-account-view",
            renderer: parametersBundle_css.y,
            template: UserSettingsAccountViewTemplate,
            styles: [UserSettingsView_css.UserSettingViewCss, UserSettingsAccountViewCss],
        })
        /**
         * Fired when the `Edit Accounts` button is selected.
         * @public
         */
        ,
        eventStrict.l("edit-accounts-click")
        /**
         * Fired when the `Manage Account` button is selected.
         * @public
         */
        ,
        eventStrict.l("manage-account-click")
        /**
         * @class
         * ### Overview
         *
         * The `ui5-user-settings-account-view` represents a view displayed in the `ui5-user-settings-item`.
         *
         * @constructor
         * @extends UserSettingsView
         * @public
         * @since 2.17.0
         */
    ], UserSettingsAccountView);
    UserSettingsAccountView.define();
    var UserSettingsAccountView_default = UserSettingsAccountView;

    return UserSettingsAccountView_default;

}));
