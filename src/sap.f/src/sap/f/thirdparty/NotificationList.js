sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/List', 'sap/f/thirdparty/NotificationListGroupItem', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/NotificationListItemBase', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/Icon'], (function (webcomponentsBase, parametersBundle_css, eventStrict, parametersBundle_css$2, List, NotificationListGroupItem, Theme, parametersBundle_css$1, i18nDefaults, Icons, toLowercaseEnumValue, ListItemGroup, ListItemBase, i18nDefaults$1, WrappingType, AccessibilityTextsHelper, BusyIndicator, willShowContent, Label, NotificationListItemBase, FocusableElements, Icon) { 'use strict';

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * Internal `ui5-li-notification-list-list` component,
     * that is used to support keyboard navigation of the notification list internal list.
     *
     * @private
     */
    let NotificationListInternal = class NotificationListInternal extends List.List {
        constructor() {
            super();
            this._allNavigationItems = [];
            this._itemNavigation._navigationMode = webcomponentsBase.r.Auto;
        }
        getEnabledItems() {
            const items = new Array();
            const allNavigationItems = new Array();
            this.getItems().forEach(item => {
                items.push(item);
                allNavigationItems.push(item);
                if (item instanceof NotificationListGroupItem && !item.collapsed && !item.loading) {
                    item.items.forEach(subItem => {
                        items.push(subItem);
                        allNavigationItems.push(subItem);
                    });
                    const growingButton = item.getGrowingButton();
                    if (growingButton) {
                        allNavigationItems.push(growingButton);
                    }
                }
            });
            const growingButton = this.getGrowingButton();
            if (growingButton) {
                allNavigationItems.push(growingButton);
            }
            this._allNavigationItems = allNavigationItems;
            return items;
        }
        _onkeydown(e) {
            if (webcomponentsBase.n(e)) {
                this._handleEndKey(e);
                e.preventDefault();
                return;
            }
            if (webcomponentsBase.M(e)) {
                this._handleHomeKey(e);
                e.preventDefault();
                return;
            }
            this._focusSameItemOnNextRow(e);
        }
        _handleHomeKey(e) {
            e.stopImmediatePropagation();
            const target = e.target;
            const activeElement = webcomponentsBase.t();
            if ((!this._isGrowingButton(activeElement) && target?.hasAttribute("ui5-li-notification-group"))
                || target?.hasAttribute("ui5-menu-item")) {
                return;
            }
            const currentFocusedItem = this.getEnabledItems()[this._itemNavigation._currentIndex];
            if (!currentFocusedItem) {
                return;
            }
            const currentFocusedIndex = this._allNavigationItems.indexOf(currentFocusedItem);
            let nextFocusedIndex = 0;
            for (let i = currentFocusedIndex - 1; i >= 0; i--) {
                const item = this._allNavigationItems[i];
                if (item.hasAttribute("ui5-li-notification-group")) {
                    nextFocusedIndex = i + 1;
                    break;
                }
            }
            this._allNavigationItems[nextFocusedIndex].focus();
        }
        _handleEndKey(e) {
            e.stopImmediatePropagation();
            const target = e.target;
            if (target?.hasAttribute("ui5-menu-item")) {
                return;
            }
            const currentFocusedItem = this.getEnabledItems()[this._itemNavigation._currentIndex];
            if (!currentFocusedItem) {
                return;
            }
            const currentFocusedIndex = this._allNavigationItems.indexOf(currentFocusedItem);
            let nextFocusedIndex = this._allNavigationItems.length - 1;
            for (let i = currentFocusedIndex + 1; i < this._allNavigationItems.length; i++) {
                const item = this._allNavigationItems[i];
                if (item.hasAttribute("ui5-li-notification-group")) {
                    nextFocusedIndex = i - 1;
                    break;
                }
                if (this._isGrowingButton(item)) {
                    nextFocusedIndex = i === currentFocusedIndex + 1 ? i : i - 1;
                    break;
                }
            }
            this._allNavigationItems[nextFocusedIndex].focus();
        }
        _focusSameItemOnNextRow(e) {
            if (!webcomponentsBase.P(e) && !webcomponentsBase._(e) && !webcomponentsBase.D(e) && !webcomponentsBase.R(e)) {
                return;
            }
            const target = e.target;
            const shadowTarget = target.shadowRoot.activeElement;
            const activeElement = webcomponentsBase.t();
            const isGrowingBtn = this._isGrowingButton(activeElement);
            if (!target || target.hasAttribute("ui5-menu-item")) {
                return;
            }
            const isFocusWithin = target.matches(":focus-within");
            if (!isFocusWithin) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            const currentItem = isGrowingBtn ? activeElement : this.getEnabledItems()[this._itemNavigation._currentIndex];
            const index = this._allNavigationItems.indexOf(currentItem) + ((webcomponentsBase.P(e) || webcomponentsBase.D(e)) ? -1 : 1);
            const nextItem = this._allNavigationItems[index];
            if (!nextItem) {
                return;
            }
            if (this._isGrowingButton(nextItem) || shadowTarget.classList.contains("ui5-nli-focusable")) {
                nextItem.focus();
                return;
            }
            const nextListItem = nextItem;
            if (nextListItem.loading || (webcomponentsBase.D(e) || webcomponentsBase.R(e))) {
                nextItem.focus();
                return;
            }
            const sameItemOnNextRow = nextListItem.getHeaderDomRef().querySelector(`.${shadowTarget.className}`);
            if (sameItemOnNextRow && sameItemOnNextRow.offsetParent) {
                sameItemOnNextRow.focus();
            }
            else {
                nextItem.focus();
            }
        }
        _isGrowingButton(item) {
            return item?.classList.contains("ui5-growing-button-inner");
        }
    };
    NotificationListInternal = __decorate$1([
        webcomponentsBase.m("ui5-notification-list-internal")
    ], NotificationListInternal);
    NotificationListInternal.define();
    var NotificationListInternal$1 = NotificationListInternal;

    function NotificationListTemplate() {
        return (parametersBundle_css.jsx(NotificationListInternal$1, { accessibleName: this._accessibleName, noDataText: this.noDataText, onItemClick: this._onItemClick, onItemClose: this._onItemClose, onItemToggle: this._onItemToggle, onLoadMore: this._onLoadMore, children: parametersBundle_css.jsx("slot", {}) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var NotificationListCss = `:host(:not([hidden])){display:block}[ui5-notification-list-internal]{height:100%}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var NotificationList_1;
    /**
     * @class
     * ### Overview
     * The `ui5-notification-list` web component represents
     * a container for `ui5-li-notification-group` and `ui5-li-notification`.
     *
     * ### Keyboard Handling
     *
     * #### Basic Navigation
     * The `ui5-notification-list` provides advanced keyboard handling.
     * When a list is focused the user can use the following keyboard
     * shortcuts in order to perform a navigation:
     *
     * - [Up] or [Left] - Navigates up the items
     * - [Down] or [Right] - Navigates down the items
     * - [Home] - Navigates to first item
     * - [End] - Navigates to the last item
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/NotificationList.js";``
     * @constructor
     * @extends UI5Element
     * @since 2.0.0
     * @public
     */
    let NotificationList = NotificationList_1 = class NotificationList extends webcomponentsBase.b {
        get _accessibleName() {
            return NotificationList_1.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ACCESSIBLE_NAME);
        }
        getEnabledItems() {
            return this.innerList?.getEnabledItems() || [];
        }
        get innerList() {
            return this.shadowRoot?.querySelector("[ui5-notification-list-internal]");
        }
        _onItemClick(e) {
            const item = e.detail.item;
            if (!this.fireDecoratorEvent("item-click", { item })) {
                e.preventDefault();
            }
        }
        _onItemClose(e) {
            const item = e.detail.item;
            if (!this.fireDecoratorEvent("item-close", { item })) {
                e.preventDefault();
            }
        }
        _onItemToggle(e) {
            const item = e.detail.item;
            if (!this.fireDecoratorEvent("item-toggle", { item })) {
                e.preventDefault();
            }
        }
        _onLoadMore() {
            this.fireDecoratorEvent("load-more");
        }
    };
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], NotificationList.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.s()
    ], NotificationList.prototype, "noDataText", void 0);
    __decorate([
        parametersBundle_css$2.i("@ui5/webcomponents-fiori")
    ], NotificationList, "i18nFioriBundle", void 0);
    NotificationList = NotificationList_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-notification-list",
            renderer: parametersBundle_css.y,
            languageAware: true,
            styles: [NotificationListCss],
            template: NotificationListTemplate,
        })
        /**
         * Fired when an item is clicked.
         * @param {HTMLElement} item The clicked item.
         * @public
         */
        ,
        eventStrict.l("item-click", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when the `Close` button of any item is clicked.
         * @param {HTMLElement} item the item about to be closed.
         * @public
         */
        ,
        eventStrict.l("item-close", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when an item is toggled.
         *
         * @param {HTMLElement} item the toggled item.
         * @public
         */
        ,
        eventStrict.l("item-toggle", {
            bubbles: true,
            cancelable: true,
        })
    ], NotificationList);
    NotificationList.define();
    var NotificationList_default = NotificationList;

    return NotificationList_default;

}));
