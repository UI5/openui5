sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/ListBoxItemGroupTemplate', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType'], (function (webcomponentsBase, ListItemGroup, Theme, parametersBundle_css, parametersBundle_css$1, ListBoxItemGroupTemplate, Icons, eventStrict, parametersBundle_css$2, toLowercaseEnumValue, ListItemBase, i18nDefaults, WrappingType) { 'use strict';

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var SearchItemGroupCss = `:host{height:2.75rem;background:var(--sapList_GroupHeaderBackground);color:var(--sapList_TableGroupHeaderTextColor)}.ui5-group-li-root{width:100%;height:100%;position:relative;box-sizing:border-box;padding:0;margin:0;list-style-type:none}[ui5-li-group-header]{border-bottom:var(--sapList_BorderWidth) solid var(--sapList_GroupHeaderBorderColor)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * The `ui5-search-item-group` is type of suggestion item,
     * that can be used to split the `ui5-search-item` suggestions into groups.
     * @constructor
     * @extends ListItemGroup
     * @public
     * @since 2.9.0
     * @experimental
     */
    let SearchItemGroup = class SearchItemGroup extends ListItemGroup.ListItemGroup {
        get isGroupItem() {
            return true;
        }
    };
    SearchItemGroup = __decorate([
        webcomponentsBase.m({
            tag: "ui5-search-item-group",
            styles: [
                ListItemGroup.ListItemGroup.styles,
                SearchItemGroupCss,
            ],
            template: ListBoxItemGroupTemplate.ListItemGroupTemplate,
        })
    ], SearchItemGroup);
    SearchItemGroup.define();
    var SearchItemGroup_default = SearchItemGroup;

    return SearchItemGroup_default;

}));
