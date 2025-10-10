sap.ui.define(['require', 'sap/f/thirdparty/webcomponents-base', 'sap/f/thirdparty/Icons'], (function (require, webcomponentsBase, Icons) { 'use strict';

    // @ts-nocheck
    const loadThemeProperties$1 = async (themeName) => {
        switch (themeName) {
            case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-fiori_3-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css4'], resolve, reject); })).default;
            case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-fiori_3_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css5'], resolve, reject); })).default;
            case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-fiori_3_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css6'], resolve, reject); })).default;
            case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-fiori_3_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css7'], resolve, reject); })).default;
            case "sap_horizon": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css8'], resolve, reject); })).default;
            case "sap_horizon_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css9'], resolve, reject); })).default;
            case "sap_horizon_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css10'], resolve, reject); })).default;
            case "sap_horizon_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-theming-sap-horizon_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css11'], resolve, reject); })).default;
            default: throw "unknown theme";
        }
    };
    const loadAndCheck$1 = async (themeName) => {
        const data = await loadThemeProperties$1(themeName);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    ["sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_dark", "sap_horizon_hcb", "sap_horizon_hcw"]
        .forEach(themeName => Icons.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "t" + "h" + "e" + "m" + "i" + "n" + "g", themeName, loadAndCheck$1));

    // @ts-nocheck
    const loadThemeProperties = async (themeName) => {
        switch (themeName) {
            case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-fiori_3-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css12'], resolve, reject); })).default;
            case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-fiori_3_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css13'], resolve, reject); })).default;
            case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-fiori_3_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css14'], resolve, reject); })).default;
            case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-fiori_3_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css15'], resolve, reject); })).default;
            case "sap_horizon": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css16'], resolve, reject); })).default;
            case "sap_horizon_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css17'], resolve, reject); })).default;
            case "sap_horizon_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css18'], resolve, reject); })).default;
            case "sap_horizon_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-horizon_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css19'], resolve, reject); })).default;
            default: throw "unknown theme";
        }
    };
    const loadAndCheck = async (themeName) => {
        const data = await loadThemeProperties(themeName);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    ["sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_dark", "sap_horizon_hcb", "sap_horizon_hcw"]
        .forEach(themeName => Icons.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", themeName, loadAndCheck));

    // @ts-nocheck
    const importMessageBundle = async (localeId) => {
        switch (localeId) {
            case "ar": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ar" */ 'sap/f/thirdparty/_dynamics/messagebundle_ar'], resolve, reject); })).default;
            case "bg": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-bg" */ 'sap/f/thirdparty/_dynamics/messagebundle_bg'], resolve, reject); })).default;
            case "ca": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ca" */ 'sap/f/thirdparty/_dynamics/messagebundle_ca'], resolve, reject); })).default;
            case "cnr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-cnr" */ 'sap/f/thirdparty/_dynamics/messagebundle_cnr'], resolve, reject); })).default;
            case "cs": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-cs" */ 'sap/f/thirdparty/_dynamics/messagebundle_cs'], resolve, reject); })).default;
            case "cy": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-cy" */ 'sap/f/thirdparty/_dynamics/messagebundle_cy'], resolve, reject); })).default;
            case "da": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-da" */ 'sap/f/thirdparty/_dynamics/messagebundle_da'], resolve, reject); })).default;
            case "de": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-de" */ 'sap/f/thirdparty/_dynamics/messagebundle_de'], resolve, reject); })).default;
            case "el": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-el" */ 'sap/f/thirdparty/_dynamics/messagebundle_el'], resolve, reject); })).default;
            case "en": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en" */ 'sap/f/thirdparty/_dynamics/messagebundle_en'], resolve, reject); })).default;
            case "en_GB": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en_GB" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_GB'], resolve, reject); })).default;
            case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en_US_sappsd" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_sappsd'], resolve, reject); })).default;
            case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en_US_saprigi" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saprigi'], resolve, reject); })).default;
            case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-en_US_saptrc" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saptrc'], resolve, reject); })).default;
            case "es": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-es" */ 'sap/f/thirdparty/_dynamics/messagebundle_es'], resolve, reject); })).default;
            case "es_MX": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-es_MX" */ 'sap/f/thirdparty/_dynamics/messagebundle_es_MX'], resolve, reject); })).default;
            case "et": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-et" */ 'sap/f/thirdparty/_dynamics/messagebundle_et'], resolve, reject); })).default;
            case "fi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-fi" */ 'sap/f/thirdparty/_dynamics/messagebundle_fi'], resolve, reject); })).default;
            case "fr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-fr" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr'], resolve, reject); })).default;
            case "fr_CA": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-fr_CA" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr_CA'], resolve, reject); })).default;
            case "hi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-hi" */ 'sap/f/thirdparty/_dynamics/messagebundle_hi'], resolve, reject); })).default;
            case "hr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-hr" */ 'sap/f/thirdparty/_dynamics/messagebundle_hr'], resolve, reject); })).default;
            case "hu": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-hu" */ 'sap/f/thirdparty/_dynamics/messagebundle_hu'], resolve, reject); })).default;
            case "id": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-id" */ 'sap/f/thirdparty/_dynamics/messagebundle_id'], resolve, reject); })).default;
            case "it": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-it" */ 'sap/f/thirdparty/_dynamics/messagebundle_it'], resolve, reject); })).default;
            case "iw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-iw" */ 'sap/f/thirdparty/_dynamics/messagebundle_iw'], resolve, reject); })).default;
            case "ja": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ja" */ 'sap/f/thirdparty/_dynamics/messagebundle_ja'], resolve, reject); })).default;
            case "kk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-kk" */ 'sap/f/thirdparty/_dynamics/messagebundle_kk'], resolve, reject); })).default;
            case "ko": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ko" */ 'sap/f/thirdparty/_dynamics/messagebundle_ko'], resolve, reject); })).default;
            case "lt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-lt" */ 'sap/f/thirdparty/_dynamics/messagebundle_lt'], resolve, reject); })).default;
            case "lv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-lv" */ 'sap/f/thirdparty/_dynamics/messagebundle_lv'], resolve, reject); })).default;
            case "mk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-mk" */ 'sap/f/thirdparty/_dynamics/messagebundle_mk'], resolve, reject); })).default;
            case "ms": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ms" */ 'sap/f/thirdparty/_dynamics/messagebundle_ms'], resolve, reject); })).default;
            case "nl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-nl" */ 'sap/f/thirdparty/_dynamics/messagebundle_nl'], resolve, reject); })).default;
            case "no": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-no" */ 'sap/f/thirdparty/_dynamics/messagebundle_no'], resolve, reject); })).default;
            case "pl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-pl" */ 'sap/f/thirdparty/_dynamics/messagebundle_pl'], resolve, reject); })).default;
            case "pt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-pt" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt'], resolve, reject); })).default;
            case "pt_PT": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-pt_PT" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt_PT'], resolve, reject); })).default;
            case "ro": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ro" */ 'sap/f/thirdparty/_dynamics/messagebundle_ro'], resolve, reject); })).default;
            case "ru": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-ru" */ 'sap/f/thirdparty/_dynamics/messagebundle_ru'], resolve, reject); })).default;
            case "sh": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sh" */ 'sap/f/thirdparty/_dynamics/messagebundle_sh'], resolve, reject); })).default;
            case "sk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sk" */ 'sap/f/thirdparty/_dynamics/messagebundle_sk'], resolve, reject); })).default;
            case "sl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sl" */ 'sap/f/thirdparty/_dynamics/messagebundle_sl'], resolve, reject); })).default;
            case "sr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sr" */ 'sap/f/thirdparty/_dynamics/messagebundle_sr'], resolve, reject); })).default;
            case "sv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-sv" */ 'sap/f/thirdparty/_dynamics/messagebundle_sv'], resolve, reject); })).default;
            case "th": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-th" */ 'sap/f/thirdparty/_dynamics/messagebundle_th'], resolve, reject); })).default;
            case "tr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-tr" */ 'sap/f/thirdparty/_dynamics/messagebundle_tr'], resolve, reject); })).default;
            case "uk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-uk" */ 'sap/f/thirdparty/_dynamics/messagebundle_uk'], resolve, reject); })).default;
            case "vi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-vi" */ 'sap/f/thirdparty/_dynamics/messagebundle_vi'], resolve, reject); })).default;
            case "zh_CN": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-zh_CN" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_CN'], resolve, reject); })).default;
            case "zh_TW": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-messagebundle-zh_TW" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_TW'], resolve, reject); })).default;
            default: throw "unknown locale";
        }
    };
    const importAndCheck = async (localeId) => {
        const data = await importMessageBundle(localeId);
        if (typeof data === "string" && data.endsWith(".json")) {
            throw new Error(`[i18n] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the "Assets" documentation for more information.`);
        }
        return data;
    };
    const localeIds = ["ar",
        "bg",
        "ca",
        "cnr",
        "cs",
        "cy",
        "da",
        "de",
        "el",
        "en",
        "en_GB",
        "en_US_sappsd",
        "en_US_saprigi",
        "en_US_saptrc",
        "es",
        "es_MX",
        "et",
        "fi",
        "fr",
        "fr_CA",
        "hi",
        "hr",
        "hu",
        "id",
        "it",
        "iw",
        "ja",
        "kk",
        "ko",
        "lt",
        "lv",
        "mk",
        "ms",
        "nl",
        "no",
        "pl",
        "pt",
        "pt_PT",
        "ro",
        "ru",
        "sh",
        "sk",
        "sl",
        "sr",
        "sv",
        "th",
        "tr",
        "uk",
        "vi",
        "zh_CN",
        "zh_TW",];
    localeIds.forEach(localeId => {
        Icons.$$1("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", localeId, importAndCheck);
    });

}));
