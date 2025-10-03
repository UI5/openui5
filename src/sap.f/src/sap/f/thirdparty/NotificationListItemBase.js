sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-base', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/i18n-defaults'], (function (exports, webcomponentsBase, parametersBundle_css, ListItemBase, FocusableElements, i18nDefaults) { 'use strict';

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * The base class of the `NotificationListItem` and `NotificationListGroupItem`.
     * @constructor
     * @extends ListItemBase
     * @since 1.0.0-rc.8
     * @public
     */
    class NotificationListItemBase extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            /**
             * Defines if the `notification` is new or has been already read.
             *
             * **Note:** if set to `false` the `titleText` has bold font,
             * if set to true - it has a normal font.
             * @default false
             * @public
             */
            this.read = false;
            /**
             * Defines if a busy indicator would be displayed over the item.
             * @default false
             * @public
             * @since 1.0.0-rc.8
             */
            this.loading = false;
            /**
             * Defines the delay in milliseconds, after which the busy indicator will show up for this component.
             * @default 1000
             * @public
             */
            this.loadingDelay = 1000;
        }
        get hasTitleText() {
            return !!this.titleText?.length;
        }
        get loadingText() {
            return NotificationListItemBase.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_ITEM_LOADING);
        }
        /**
         * Event handlers
         */
        async _onkeydown(e) {
            super._onkeydown(e);
            if (webcomponentsBase.A(e) && this.getFocusDomRef().matches(":has(:focus-within)")) {
                e.preventDefault();
                return;
            }
            if (webcomponentsBase.ro(e)) {
                e.stopImmediatePropagation();
                const activeElement = webcomponentsBase.t();
                const focusDomRef = this.getHeaderDomRef();
                if (activeElement === focusDomRef) {
                    const firstFocusable = await FocusableElements.b(focusDomRef);
                    firstFocusable?.focus();
                }
                else {
                    focusDomRef.focus();
                }
            }
        }
        getHeaderDomRef() {
            return this.getFocusDomRef();
        }
        shouldForwardTabAfter() {
            const aContent = ListItemBase.b(this.getHeaderDomRef());
            return aContent.length === 0 || (aContent[aContent.length - 1] === webcomponentsBase.t());
        }
    }
    __decorate([
        webcomponentsBase.s()
    ], NotificationListItemBase.prototype, "titleText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], NotificationListItemBase.prototype, "read", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], NotificationListItemBase.prototype, "loading", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], NotificationListItemBase.prototype, "loadingDelay", void 0);
    __decorate([
        parametersBundle_css.i("sap/f/gen/ui5/webcomponents_fiori")
    ], NotificationListItemBase, "i18nFioriBundle", void 0);

    exports.NotificationListItemBase = NotificationListItemBase;

}));
