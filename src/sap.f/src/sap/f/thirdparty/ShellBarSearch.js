sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/Search3', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/ListItemAdditionalText.css', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/List', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/ListSelectionMode', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/slim-arrow-down', 'sap/f/thirdparty/search2', 'sap/f/thirdparty/encodeXML', 'sap/f/thirdparty/information', 'sap/f/thirdparty/sys-enter-2'], (function (webcomponentsBase, Search, Theme, jsxRuntime, Button, parametersBundle_css, i18nDefaults, Icons, eventStrict, Icon, parametersBundle_css$1, i18nDefaults$1, ListItemBase, ListItemAdditionalText_css, InvisibleMessage, AccessibilityTextsHelper, ValueState, decline, List, toLowercaseEnumValue, ListItemGroup, WrappingType, ListSelectionMode, BusyIndicator, willShowContent, Label, ResponsivePopover, Title, FocusableElements, slimArrowDown, search, encodeXML, information, sysEnter2) { 'use strict';

    function ShellBarSearchPopoverTemplate() {
        return (Search.SearchPopoverTemplate.call(this, ShellBarSearchDialogHeader));
    }
    function ShellBarSearchDialogHeader() {
        return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("header", { slot: "header", class: "ui5-search-popup-searching-header", children: [jsxRuntime.jsx("div", { class: "ui5-shellbar-search-field-wrapper", children: Search.SearchFieldTemplate.call(this, { forceExpanded: true }) }), jsxRuntime.jsx(Button.Button, { design: Button.ButtonDesign.Transparent, onClick: this._handleCancel, children: this.cancelButtonText })] }) }));
    }

    function ShellBarSearchTemplate() {
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [Search.SearchFieldTemplate.call(this), ShellBarSearchPopoverTemplate.call(this)] }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var ShellBarSearchCss = `:host(:not([collapsed])){min-width:13rem}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ShellBarSearch_1;
    /**
     * @class
     * Search field for the ShellBar component.
     * @constructor
     * @extends Search
     * @public
     * @since 2.10.0
     * @experimental
     */
    let ShellBarSearch = ShellBarSearch_1 = class ShellBarSearch extends Search.Search {
        constructor() {
            super(...arguments);
            /**
             * Indicates whether the suggestions popover should be opened on focus.
             * @default false
             * @public
             */
            this.autoOpen = false;
        }
        _handleSearchIconPress() {
            if (Theme.d() && this.open) {
                this._handleSearchEvent();
                return;
            }
            super._handleSearchIconPress();
            if (this.collapsed) {
                this.collapsed = false;
            }
            else if (!this.value) {
                this.collapsed = true;
            }
        }
        _handleEnter() {
            if (!this.value && !this.collapsed) {
                this.collapsed = true;
                setTimeout(() => {
                    this.focus();
                }, 0);
            }
            else {
                super._handleEnter();
            }
        }
        _onFocusOutSearch(e) {
            if (Theme.d()) {
                return;
            }
            super._onFocusOutSearch(e);
        }
        _handleInput(e) {
            super._handleInput(e);
            if (Theme.d()) {
                this._performItemSelectionOnMobile = this._shouldPerformSelectionOnMobile(e.inputType);
            }
        }
        get _effectiveIconTooltip() {
            if (this.collapsed) {
                return ShellBarSearch_1.i18nBundle.getText(i18nDefaults.SHELLBAR_SEARCH_COLLAPSED);
            }
            if (this.value) {
                return ShellBarSearch_1.i18nBundle.getText(i18nDefaults.SEARCH_FIELD_SEARCH_ICON);
            }
            return ShellBarSearch_1.i18nBundle.getText(i18nDefaults.SHELLBAR_SEARCH_EXPANDED);
        }
        get nativeInput() {
            const domRef = this.shadowRoot;
            return Theme.d() ? domRef?.querySelector(`[ui5-responsive-popover] input`) : super.nativeInput;
        }
        _onfocusin() {
            super._onfocusin();
            if (this.autoOpen) {
                this.open = true;
                this.fireDecoratorEvent("open");
            }
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            if (Theme.d()) {
                this.collapsed = true;
            }
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ShellBarSearch.prototype, "autoOpen", void 0);
    ShellBarSearch = ShellBarSearch_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-shellbar-search",
            template: ShellBarSearchTemplate,
            styles: [
                Search.Search.styles,
                ShellBarSearchCss,
            ],
        })
    ], ShellBarSearch);
    ShellBarSearch.define();
    var ShellBarSearch_default = ShellBarSearch;

    return ShellBarSearch_default;

}));
