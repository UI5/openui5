sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Tag', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/information', 'sap/f/thirdparty/SearchItem.css', 'sap/f/thirdparty/generateHighlightedMarkup', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/encodeXML', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/parameters-bundle.css3'], (function (webcomponentsBase, ListItemBase, parametersBundle_css, Icon, Tag, Button, information, SearchItem_css, generateHighlightedMarkup, eventStrict, i18nDefaults, FocusableElements, parametersBundle_css$1, encodeXML, Theme, Icons, willShowContent, i18nDefaults$1, AccessibilityTextsHelper, toLowercaseEnumValue, BusyIndicator, Label, parametersBundle_css$2) { 'use strict';

    function SearchFieldTemplate() {
        return (parametersBundle_css.jsx("li", { part: "native-li", class: "ui5-li-root ui5-li--focusable", "aria-selected": this.selected, role: "option", "data-sap-focus-ref": true, draggable: this.movable, tabindex: this._effectiveTabIndex, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onClick: this._onclick, children: parametersBundle_css.jsx("div", { part: "content", class: "ui5-search-item-content", children: parametersBundle_css.jsxs("div", { class: "ui5-search-item-begin-content", children: [this.image.length > 0 && !this.icon &&
                            parametersBundle_css.jsx("slot", { name: "image" }), this.icon &&
                            parametersBundle_css.jsx(Icon.Icon, { class: "ui5-search-item-icon", name: this.icon }), this.scopeName &&
                            parametersBundle_css.jsx(Tag.Tag, { design: Tag.TagDesign.Set2, colorScheme: "10", children: this.scopeName }), parametersBundle_css.jsxs("div", { class: "ui5-search-item-titles-container", children: [parametersBundle_css.jsx("span", { part: "title", class: "ui5-search-item-text", dangerouslySetInnerHTML: { __html: this._markupText } }), parametersBundle_css.jsx("span", { part: "subtitle", class: "ui5-search-item-description", children: this.description })] }), this.deletable &&
                            parametersBundle_css.jsx(Button.Button, { class: "ui5-search-item-selected-delete", design: Button.ButtonDesign.Transparent, icon: information.decline, onClick: this._onDeleteButtonClick, tooltip: this._deleteButtonTooltip, onKeyDown: this._onDeleteButtonKeyDown })] }) }) }));
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
            super._onkeydown(e);
            if (this.getFocusDomRef().matches(":has(:focus-within)")) {
                if (webcomponentsBase.A(e) || webcomponentsBase.b$1(e)) {
                    e.preventDefault();
                    return;
                }
            }
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
        _onDeleteButtonClick() {
            this.fireDecoratorEvent("delete");
        }
        _onDeleteButtonKeyDown(e) {
            if (webcomponentsBase.A(e) || webcomponentsBase.b$1(e)) {
                this.fireDecoratorEvent("delete");
            }
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            // bold the matched text
            this._markupText = this.highlightText ? generateHighlightedMarkup.f((this.text || ""), this.highlightText) : encodeXML.fnEncodeXML(this.text || "");
        }
        get _deleteButtonTooltip() {
            return SearchItem_1.i18nBundle.getText(i18nDefaults.SEARCH_ITEM_DELETE_BUTTON);
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
        parametersBundle_css$1.i("@ui5/webcomponents-fiori")
    ], SearchItem, "i18nBundle", void 0);
    SearchItem = SearchItem_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-search-item",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: SearchFieldTemplate,
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
