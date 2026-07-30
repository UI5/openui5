sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/Search3', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/List', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/information', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/slim-arrow-down', 'sap/f/thirdparty/search2', 'sap/f/thirdparty/encodeXML', 'sap/f/thirdparty/information2', 'sap/f/thirdparty/sys-enter-2', 'sap/f/thirdparty/willShowContent'], (function (webcomponentsBase, Search, ManagedStyles, parametersBundle_css, Button, parametersBundle_css$1, i18nDefaults, Icons, eventStrict, Icon, parametersBundle_css$2, i18nDefaults$1, ListItemBase, ListItemTemplate, decline, ValueState, AccessibilityTextsHelper, Label, List, toLowercaseEnumValue, ListItemGroup, WrappingType, information, ResponsivePopover, Title, FocusableElements, slimArrowDown, search, encodeXML, information$1, sysEnter2, willShowContent) { 'use strict';

    function ShellBarSearchPopoverTemplate() {
        return (Search.SearchPopoverTemplate.call(this, ShellBarSearchDialogHeader));
    }
    function ShellBarSearchDialogHeader() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs("header", { slot: "header", class: "ui5-search-popup-searching-header", children: [parametersBundle_css.jsx("div", { class: "ui5-shellbar-search-field-wrapper", children: Search.SearchFieldTemplate.call(this, { forceExpanded: true }) }), parametersBundle_css.jsx(Button.Button, { design: Button.ButtonDesign.Transparent, onClick: this._handleCancel, children: this.cancelButtonText })] }) }));
    }

    function ShellBarSearchTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [Search.SearchFieldTemplate.call(this), ShellBarSearchPopoverTemplate.call(this)] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
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
            if (ManagedStyles.d() && this.open) {
                this._handleSearchEvent();
                this._closePopupAndResetState();
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
                // Fire `ui5-search` so a host ShellBar collapses in sync; also collapse
                // locally for standalone usage (host converges on the same state).
                this._handleSearchEvent();
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
            if (ManagedStyles.d()) {
                return;
            }
            super._onFocusOutSearch(e);
        }
        _handleInput(e) {
            super._handleInput(e);
            if (ManagedStyles.d()) {
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
            return ManagedStyles.d() ? domRef?.querySelector(`[ui5-responsive-popover] input`) : super.nativeInput;
        }
        getSearchButtonDomRef() {
            return this.shadowRoot?.querySelector(".ui5-shell-search-field-button") ?? null;
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
            if (ManagedStyles.d()) {
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
