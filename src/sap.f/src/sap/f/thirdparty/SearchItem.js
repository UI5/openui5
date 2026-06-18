sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Tag', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/SearchItem.css', 'sap/f/thirdparty/generateHighlightedMarkup', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/encodeXML', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/parameters-bundle.css2'], (function (webcomponentsBase, ListItemBase, jsxRuntime, Icon, Tag, Button, decline, SearchItem_css, generateHighlightedMarkup, eventStrict, i18nDefaults, FocusableElements, parametersBundle_css, encodeXML, Theme, Icons, i18nDefaults$1, willShowContent, AccessibilityTextsHelper, toLowercaseEnumValue, BusyIndicator, Label, parametersBundle_css$1) { 'use strict';

    function SearchItemTemplate() {
        return (jsxRuntime.jsx("li", { part: "native-li", class: "ui5-li-root ui5-li--focusable", "aria-selected": this.selected, role: "option", "data-sap-focus-ref": true, draggable: this.movable, tabindex: this._effectiveTabIndex, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onClick: this._onclick, children: jsxRuntime.jsx("div", { part: "content", class: "ui5-search-item-content", children: jsxRuntime.jsxs("div", { class: "ui5-search-item-begin-content", children: [this.image.length > 0 && !this.icon &&
                            jsxRuntime.jsx("slot", { name: "image" }), this.icon &&
                            jsxRuntime.jsx(Icon.Icon, { class: "ui5-search-item-icon", name: this.icon }), this.scopeName &&
                            jsxRuntime.jsx(Tag.Tag, { design: Tag.TagDesign.Set2, colorScheme: "10", children: this.scopeName }), jsxRuntime.jsxs("div", { class: "ui5-search-item-titles-container", children: [jsxRuntime.jsx("span", { part: "title", class: "ui5-search-item-text", dangerouslySetInnerHTML: { __html: this._markupText } }), jsxRuntime.jsx("span", { part: "subtitle", class: "ui5-search-item-description", children: this.description })] }), jsxRuntime.jsxs("div", { class: "ui5-search-item-actions-container", children: [this.hasActions &&
                                    jsxRuntime.jsx("div", { class: "ui5-search-item-actions", children: jsxRuntime.jsx("slot", { name: "actions" }) }), this.deletable &&
                                    jsxRuntime.jsx(Button.Button, { class: "ui5-search-item-selected-delete", design: Button.ButtonDesign.Transparent, icon: decline.decline, onClick: this._onDeleteButtonClick, tooltip: this._deleteButtonTooltip, onKeyDown: this._onDeleteButtonKeyDown })] })] }) }) }));
    }

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var SearchItem_1;
    /**
     * @class
     *
     * ### Overview
     *
     * A `ui5-search-item` is a list item, used for displaying search suggestions
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/SearchItem.js";`
     *
     * @constructor
     * @extends ListItemBase
     * @public
     * @since 2.9.0
     * @experimental
     */
    let SearchItem = SearchItem_1 = class SearchItem extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the search item is selected.
             * @default false
             * @public
             */
            this.selected = false;
            /**
             * Defines whether the search item is deletable.
             * @default false
             * @public
             */
            this.deletable = false;
            this.highlightText = "";
            this._markupText = "";
        }
        _onfocusin(e) {
            super._onfocusin(e);
            this.selected = true;
        }
        _onfocusout() {
            this.selected = false;
        }
        async _onkeydown(e) {
            // Handle manual tab navigation between action items
            if (webcomponentsBase.x(e) || webcomponentsBase.V(e)) {
                const handled = this._handleTabNavigation(e);
                if (handled) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
            // Call super for other key handling
            super._onkeydown(e);
            // Handle space/enter when focus is within action items
            if (this.getFocusDomRef().matches(":has(:focus-within)")) {
                if (webcomponentsBase.A(e) || webcomponentsBase.b(e)) {
                    e.preventDefault();
                    return;
                }
            }
            // Handle F2 for focus navigation
            if (webcomponentsBase.ro(e)) {
                e.stopImmediatePropagation();
                const activeElement = webcomponentsBase.t();
                const focusDomRef = this.getFocusDomRef();
                if (!focusDomRef) {
                    return;
                }
                if (activeElement === focusDomRef) {
                    const firstFocusable = await FocusableElements.b(focusDomRef);
                    firstFocusable?.focus();
                }
                else {
                    focusDomRef.focus();
                }
            }
        }
        /**
         * Handles manual tab navigation between action items and delete button with focus looping
         */
        _handleTabNavigation(e) {
            const focusDomRef = this.getFocusDomRef();
            if (!focusDomRef) {
                return false;
            }
            const tabbableElements = ListItemBase.b(focusDomRef);
            if (tabbableElements.length === 0) {
                return false;
            }
            const activeElement = webcomponentsBase.t();
            const currentIndex = tabbableElements.indexOf(activeElement);
            if (currentIndex === -1) {
                return false;
            }
            let nextElement = null;
            if (webcomponentsBase.x(e)) {
                if (currentIndex < tabbableElements.length - 1) {
                    nextElement = tabbableElements[currentIndex + 1];
                }
                else {
                    // Loop to first element when at the last element
                    nextElement = tabbableElements[0];
                }
            }
            else if (webcomponentsBase.V(e)) {
                if (currentIndex > 0) {
                    nextElement = tabbableElements[currentIndex - 1];
                }
                else {
                    // Loop to last element when at the first element
                    nextElement = tabbableElements[tabbableElements.length - 1];
                }
            }
            if (nextElement) {
                nextElement.focus();
                return true;
            }
            return false;
        }
        _onDeleteButtonClick() {
            this.fireDecoratorEvent("delete");
        }
        _onDeleteButtonKeyDown(e) {
            if (webcomponentsBase.A(e) || webcomponentsBase.b(e)) {
                this.fireDecoratorEvent("delete");
            }
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            // bold the matched text
            this._markupText = this.highlightText ? generateHighlightedMarkup.f((this.text || ""), this.highlightText) : encodeXML.fnEncodeXML(this.text || "");
        }
        get _deleteButtonTooltip() {
            return SearchItem_1.i18nBundle.getText(i18nDefaults.SEARCH_ITEM_DELETE_BUTTON_TOOLTIP);
        }
        get hasActions() {
            return !!this.actions.length;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "description", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], SearchItem.prototype, "selected", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], SearchItem.prototype, "deletable", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "scopeName", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "highlightText", void 0);
    __decorate([
        webcomponentsBase.d()
    ], SearchItem.prototype, "image", void 0);
    __decorate([
        webcomponentsBase.d()
    ], SearchItem.prototype, "actions", void 0);
    __decorate([
        parametersBundle_css.i("@ui5/webcomponents-fiori")
    ], SearchItem, "i18nBundle", void 0);
    SearchItem = SearchItem_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-search-item",
            languageAware: true,
            renderer: jsxRuntime.y,
            template: SearchItemTemplate,
            styles: [
                ListItemBase.ListItemBase.styles,
                SearchItem_css.SearchItemCss,
            ],
        })
        /**
         * Fired when delete button is pressed.
         *
         * @public
         */
        ,
        eventStrict.l("delete")
    ], SearchItem);
    SearchItem.define();
    var SearchItem_default = SearchItem;

    return SearchItem_default;

}));
