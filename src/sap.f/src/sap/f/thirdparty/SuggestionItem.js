sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/parameters-bundle.css'], (function (exports, webcomponentsBase, ManagedStyles, ListItemBase, parametersBundle_css, parametersBundle_css$1) { 'use strict';

    function ListItemBaseTemplate(hooks, injectedProps) {
        const listItemContent = hooks?.listItemContent || defaultListItemContent;
        return (parametersBundle_css.jsx("li", { part: "native-li", "data-sap-focus-ref": true, tabindex: this._effectiveTabIndex, class: this.classes.main, draggable: this.movable, role: injectedProps?.role, title: injectedProps?.title, "aria-selected": injectedProps?.role === "option" ? this.selected : undefined, ...(injectedProps?.ariaSetsize !== undefined && { "aria-setsize": injectedProps.ariaSetsize }), ...(injectedProps?.ariaPosinset !== undefined && { "aria-posinset": injectedProps.ariaPosinset }), onFocusIn: this._onfocusin, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onClick: this._onclick, children: listItemContent.call(this) }));
    }
    function defaultListItemContent() {
        return parametersBundle_css.jsx("div", { part: "content", id: `${this._id}-content`, class: "ui5-li-content", children: parametersBundle_css.jsx("div", { class: "ui5-li-text-wrapper", children: parametersBundle_css.jsx("span", { part: "title", class: "ui5-li-title", children: parametersBundle_css.jsx("slot", {}) }) }) });
    }

    function SuggestionItemTemplate() {
        return [ListItemBaseTemplate.call(this, { listItemContent }, { role: "option" })];
    }
    function listItemContent() {
        return parametersBundle_css.jsx("div", { part: "content", id: "content", class: "ui5-li-content", children: parametersBundle_css.jsxs("div", { class: "ui5-li-text-wrapper", children: [parametersBundle_css.jsx("span", { part: "title", className: "ui5-li-title", dangerouslySetInnerHTML: { __html: this.markupText } }), this.additionalText &&
                        parametersBundle_css.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", children: this.additionalText })] }) });
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var styles = `:host([ui5-suggestion-item]){height:auto;min-height:var(--_ui5_list_item_base_height)}:host([ui5-suggestion-item]) .ui5-li-root{min-height:var(--_ui5_list_item_base_height)}:host([ui5-suggestion-item]) .ui5-li-content{padding-bottom:.5rem;padding-top:.5rem;box-sizing:border-box}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * The `ui5-suggestion-item` represents the suggestion item of the `ui5-input`.
     * @constructor
     * @extends ListItemBase
     * @abstract
     * @implements { IInputSuggestionItemSelectable }
     * @public
     */
    let SuggestionItem = class SuggestionItem extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            /**
             * Defines the markup text that will be displayed as suggestion.
             * Used for highlighting the matching parts of the text.
             *
             * @since 2.0.0
             * @private
             */
            this.markupText = "";
        }
        onEnterDOM() {
            if (ManagedStyles.f$1()) {
                this.setAttribute("desktop", "");
            }
        }
        get _effectiveTabIndex() {
            return -1;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "additionalText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "markupText", void 0);
    SuggestionItem = __decorate([
        webcomponentsBase.m({
            tag: "ui5-suggestion-item",
            template: SuggestionItemTemplate,
            styles: [ListItemBase.ListItemBase.styles, styles],
        })
    ], SuggestionItem);
    SuggestionItem.define();
    var SuggestionItem$1 = SuggestionItem;

    exports.ListItemBaseTemplate = ListItemBaseTemplate;
    exports.SuggestionItem = SuggestionItem$1;

}));
