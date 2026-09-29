sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/UserSettingsView', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/List', 'sap/f/thirdparty/UserSettingsView.css', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/UserSettingsNotificationsViewItem', 'sap/f/thirdparty/UserSettingsNotificationsViewGroup', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/edit', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/ListItemCustom'], (function (webcomponentsBase, UserSettingsView, parametersBundle_css, List, UserSettingsView_css, ManagedStyles, parametersBundle_css$1, UserSettingsNotificationsViewItem, UserSettingsNotificationsViewGroup, FocusableElements, parametersBundle_css$2, eventStrict, i18nDefaults, Icons, toLowercaseEnumValue, ListItemGroup, ListItemBase, i18nDefaults$1, WrappingType, AccessibilityTextsHelper, InvisibleMessage, ListItemTemplate, decline, edit, Button, willShowContent, Icon, Label, ValueState, ListItemCustom) { 'use strict';

    function UserSettingsNotificationsViewTemplate() {
        return (parametersBundle_css.jsx("div", { class: "ui5-user-settings-view-container", children: parametersBundle_css.jsxs("div", { class: "ui5-user-settings-view ui5-user-settings-notifications-view-content", children: [parametersBundle_css.jsx("slot", { name: "additionalContent" }), this._hasHeaderItems && this.headerItems.map(item => (parametersBundle_css.jsx("div", { role: "form", class: "ui5-user-settings-notifications-view-form", "onui5-_form-item-click": this._handleFormItemClick, children: parametersBundle_css.jsx("slot", { name: item._individualSlot }) }))), parametersBundle_css.jsx(List.List, { class: "ui5-user-settings-notifications-view-list", separators: "All", onItemClick: this._handleItemClick, "data-sap-ui-fastnavgroup": "false", accessibleName: this._listAccessibleName, children: parametersBundle_css.jsx("slot", {}) })] }) }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var UserSettingsNotificationsViewCss = `.ui5-user-settings-notifications-view-content{display:flex;flex-direction:column;gap:.5rem}.ui5-user-settings-notifications-view-list{padding:0;margin:0;--ui5-group-header-listitem-background-color: var(--sapList_Background)}.ui5-user-settings-notifications-view-form{background:var(--sapGroup_ContentBackground);border-bottom:.0625rem solid var(--sapList_BorderColor);overflow:visible}slot[name=additionalContent]::slotted(*){display:block}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var UserSettingsNotificationsView_1;
    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-notifications-view` represents a view displayed in the
     * `ui5-user-settings-item` that lists notification preferences. Individual settings
     * are represented by `ui5-user-settings-notifications-view-item` elements, optionally
     * grouped by `ui5-user-settings-notifications-view-group`.
     *
     * When a navigable item is clicked, the view drills into a sibling secondary view of
     * its parent `ui5-user-settings-item`. When an item's `item-key` matches a target
     * view's `id`, that view is opened and keeps its own `text`. Otherwise the first
     * sibling marked as `secondary` is opened and its `text` is set to the clicked
     * item's `text` so the drill-in header reflects the origin.
     *
     * Apps can override this behavior by preventing the `item-click` event.
     *
     * Applications should listen to the item's `switch-change` event (which bubbles) to
     * be notified when a switch is toggled.
     *
     * Additional content (e.g. an information message strip) can be placed via the
     * `additionalContent` slot, which is rendered above the list.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsNotificationsView.js";`
     *
     * @constructor
     * @extends UserSettingsView
     * @public
     * @since 2.27.0
     */
    let UserSettingsNotificationsView = UserSettingsNotificationsView_1 = class UserSettingsNotificationsView extends UserSettingsView {
        constructor() {
            super(...arguments);
            this._lastNavigatedItem = null;
            this._handleItemClick = (e) => {
                this._processItemClick(e.detail.item);
            };
            this._handleFormItemClick = (e) => {
                this._processItemClick(e.detail.item);
            };
        }
        getAllItems() {
            const allItems = [...this.headerItems];
            this.items.forEach(item => {
                if (UserSettingsNotificationsViewGroup.isInstanceOfUserSettingsNotificationsViewGroup(item)) {
                    item.items.forEach(child => {
                        if (UserSettingsNotificationsViewItem.isInstanceOfUserSettingsNotificationsViewItem(child)) {
                            allItems.push(child);
                        }
                    });
                }
                else if (UserSettingsNotificationsViewItem.isInstanceOfUserSettingsNotificationsViewItem(item)) {
                    allItems.push(item);
                }
            });
            return allItems;
        }
        getItemByKey(itemKey) {
            return this.getAllItems().find(item => item.itemKey === itemKey);
        }
        get _hasHeaderItems() {
            return this.headerItems.length > 0;
        }
        get _listAccessibleName() {
            return this.secondary
                ? UserSettingsNotificationsView_1.i18nBundle.getText(i18nDefaults.USER_SETTINGS_NOTIFICATIONS_PREFERENCES_LIST_LABEL)
                : UserSettingsNotificationsView_1.i18nBundle.getText(i18nDefaults.USER_SETTINGS_NOTIFICATIONS_LIST_LABEL);
        }
        _navigateToSecondaryView(item) {
            const parentItem = this.closest("[ui5-user-settings-item]");
            const secondaryViews = parentItem?.pages?.filter(view => view !== this && view.secondary) ?? [];
            const matched = item.itemKey ? secondaryViews.find(view => view.id === item.itemKey) : undefined;
            const target = matched ?? secondaryViews[0];
            if (!target) {
                return;
            }
            if (!matched || !target.text) {
                target.text = item.text;
            }
            this.selected = false;
            this._lastNavigatedItem = item;
            target.selected = true;
            ManagedStyles.w().then(async () => {
                if (!this.isConnected) {
                    return;
                }
                await target._waitForDomRef();
                const focusable = await FocusableElements.b(target.getDomRef());
                focusable?.focus();
            });
        }
        _processItemClick(item) {
            if (!UserSettingsNotificationsViewItem.isInstanceOfUserSettingsNotificationsViewItem(item) || !item.navigable) {
                return;
            }
            if (!this.fireDecoratorEvent("item-click", { item })) {
                return;
            }
            this._navigateToSecondaryView(item);
        }
    };
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            "default": true,
            invalidateOnChildChange: true,
        })
    ], UserSettingsNotificationsView.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            invalidateOnChildChange: true,
            individualSlots: true,
        })
    ], UserSettingsNotificationsView.prototype, "headerItems", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
        })
    ], UserSettingsNotificationsView.prototype, "additionalContent", void 0);
    __decorate([
        parametersBundle_css$2.i("@ui5/webcomponents-fiori")
    ], UserSettingsNotificationsView, "i18nBundle", void 0);
    UserSettingsNotificationsView = UserSettingsNotificationsView_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-notifications-view",
            renderer: parametersBundle_css.y,
            template: UserSettingsNotificationsViewTemplate,
            styles: [UserSettingsView_css.UserSettingViewCss, UserSettingsNotificationsViewCss],
        })
        /**
         * Fired when a navigable item in the list is clicked.
         *
         * The event is cancelable: preventing it skips the built-in drill-in to the
         * parent's secondary view, allowing the application to take over.
         *
         * @param {UserSettingsNotificationsViewItem} item The clicked notifications view item.
         * @public
         */
        ,
        eventStrict.l("item-click", {
            cancelable: true,
        })
    ], UserSettingsNotificationsView);
    UserSettingsNotificationsView.define();
    var UserSettingsNotificationsView_default = UserSettingsNotificationsView;

    return UserSettingsNotificationsView_default;

}));
