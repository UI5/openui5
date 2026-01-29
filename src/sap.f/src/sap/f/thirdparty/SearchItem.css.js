sap.ui.define(['exports', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/parameters-bundle.css3'], (function (exports, Theme, parametersBundle_css, parametersBundle_css$1) { 'use strict';

	Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
	Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
	var SearchItemCss = `:host([selected]){border:none}:host{border:none}.ui5-search-item-content{width:100%;height:100%;display:flex;align-items:center;gap:1rem}.ui5-search-item-begin-content{display:flex;height:100%;align-items:center;gap:.75rem;width:100%;box-sizing:border-box;flex:1}:host([desktop]) .ui5-search-item-selected-delete{display:none}:host(:hover),:host(:focus-within){.ui5-search-item-selected-delete{display:inline-block}}.ui5-search-item-text{display:inline-block;font-size:var(--sapFontLargeSize);font-family:var(--sapFontFamily);font-weight:400;color:var(--sapList_TextColor);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-search-item-titles-container{overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;flex:1}.ui5-search-item-icon{padding:.375rem;width:1.25rem;height:1rem;box-sizing:content-box}:host([description]){height:auto;min-height:var(--_ui5-v2-15-0_list_item_base_height)}:host([description]) .ui5-search-item-content{padding-top:.5rem;padding-bottom:.5rem}:host([description]) .ui5-search-item-description{display:inline-block}.ui5-search-item-description{display:none;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;color:var(--sapContent_LabelColor);margin-top:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

	exports.SearchItemCss = SearchItemCss;

}));
