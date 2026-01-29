sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/SearchItem.css', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/event-strict'], (function (webcomponentsBase, ListItemBase, parametersBundle_css, parametersBundle_css$2, SearchItem_css, Theme, parametersBundle_css$1, i18nDefaults, Icons, eventStrict) { 'use strict';

    function SearchItemShowMoreTemplate() {
        return (parametersBundle_css.jsx("li", { class: "ui5-li-root ui5-li--focusable ui5-search-item-show-more", role: "option", tabindex: this._effectiveTabIndex, "aria-selected": this.selected, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, children: parametersBundle_css.jsx("span", { class: "ui5-search-item-show-more-text", children: this.showMoreTextCount }) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var SearchItemShowMoreCss = `.ui5-search-item-show-more-text{color:var(--sapLinkColor)}.ui5-search-item-show-more-text:active{color:var(--sapList_Active_TextColor)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var SearchItemShowMore_1;
    /**
     * @class
     * ### Overview
     *
     * A `ui5-search-item-show-more` is a special type of ui5-li that acts as a button to progressively reveal additional (overflow) items within a group.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/SearchItemShowMore.js";`
     *
     * @constructor
     * @extends ListItemBase
     * @public
     * @since 2.14.0
     * @experimental
     */
    let SearchItemShowMore = SearchItemShowMore_1 = class SearchItemShowMore extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the show more item is selected.
             * @default false
             * @public
             */
            this.selected = false;
        }
        get showMoreTextCount() {
            if (this.itemsToShowCount) {
                return SearchItemShowMore_1.i18nBundle.getText(i18nDefaults.SEARCH_ITEM_SHOW_MORE_COUNT, this.itemsToShowCount);
            }
            return SearchItemShowMore_1.i18nBundle.getText(i18nDefaults.SEARCH_ITEM_SHOW_MORE_NO_COUNT);
        }
        _onfocusin(e) {
            super._onfocusin(e);
            this.selected = true;
        }
        _onfocusout() {
            this.selected = false;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], SearchItemShowMore.prototype, "itemsToShowCount", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], SearchItemShowMore.prototype, "selected", void 0);
    __decorate([
        parametersBundle_css$2.i("@ui5/webcomponents-fiori")
    ], SearchItemShowMore, "i18nBundle", void 0);
    SearchItemShowMore = SearchItemShowMore_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-search-item-show-more",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: SearchItemShowMoreTemplate,
            styles: [
                ListItemBase.ListItemBase.styles,
                SearchItem_css.SearchItemCss,
                SearchItemShowMoreCss,
            ],
        })
    ], SearchItemShowMore);
    SearchItemShowMore.define();
    var SearchItemShowMore_default = SearchItemShowMore;

    return SearchItemShowMore_default;

}));
