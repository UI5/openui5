sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/Text', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/i18n-defaults2'], (function (webcomponentsBase, parametersBundle_css, Title, Text, Theme, parametersBundle_css$1, Icons, parametersBundle_css$2, willShowContent, i18nDefaults) { 'use strict';

    function SearchMessageAreaTemplate() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs("div", { class: "ui5-search-message-area-wrapper", children: [parametersBundle_css.jsx(Title.Title, { size: Title.TitleLevel.H6, children: this.text }), parametersBundle_css.jsx(Text.Text, { class: "ui5-search-message-area-description", children: this.description })] }) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var SearchMessageAreaStyles = `:host{width:100%;border-bottom:1px solid var(--sapGroup_TitleBorderColor);box-sizing:border-box;display:inline-block}.ui5-search-message-area-wrapper{padding:.5rem;box-sizing:border-box}.ui5-search-message-area-description{margin-top:.25rem;font-size:.75rem;color:var(--sapContent_LabelColor)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * `import "@ui5/webcomponents-fiori/dist/SearchMessageArea.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.9.0
     * @experimental
     */
    let SearchMessageArea = class SearchMessageArea extends webcomponentsBase.b {
    };
    __decorate([
        webcomponentsBase.s()
    ], SearchMessageArea.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchMessageArea.prototype, "description", void 0);
    SearchMessageArea = __decorate([
        webcomponentsBase.m({
            tag: "ui5-search-message-area",
            languageAware: true,
            styles: SearchMessageAreaStyles,
            renderer: parametersBundle_css.y,
            template: SearchMessageAreaTemplate,
        })
    ], SearchMessageArea);
    SearchMessageArea.define();
    var SearchMessageArea_default = SearchMessageArea;

    return SearchMessageArea_default;

}));
