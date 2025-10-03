sap.ui.define(['require', 'sap/f/thirdparty/webcomponents-base', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/Icons'], (function (require, webcomponentsBase, webcomponents, Icons) { 'use strict';

    // @ts-nocheck
    const loadThemeProperties = async (themeName) => {
        switch (themeName) {
            case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css20'], resolve, reject); })).default;
            case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css21'], resolve, reject); })).default;
            case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css22'], resolve, reject); })).default;
            case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-fiori_3_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css23'], resolve, reject); })).default;
            case "sap_horizon": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css24'], resolve, reject); })).default;
            case "sap_horizon_dark": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_dark-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css25'], resolve, reject); })).default;
            case "sap_horizon_hcb": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_hcb-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css26'], resolve, reject); })).default;
            case "sap_horizon_hcw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-sap-horizon_hcw-parameters-bundle" */ 'sap/f/thirdparty/_dynamics/parameters-bundle.css27'], resolve, reject); })).default;
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
        .forEach(themeName => Icons.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", themeName, loadAndCheck));

    // @ts-nocheck
    const importMessageBundle = async (localeId) => {
        switch (localeId) {
            case "ar": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ar" */ 'sap/f/thirdparty/_dynamics/messagebundle_ar2'], resolve, reject); })).default;
            case "bg": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-bg" */ 'sap/f/thirdparty/_dynamics/messagebundle_bg2'], resolve, reject); })).default;
            case "ca": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ca" */ 'sap/f/thirdparty/_dynamics/messagebundle_ca2'], resolve, reject); })).default;
            case "cnr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cnr" */ 'sap/f/thirdparty/_dynamics/messagebundle_cnr2'], resolve, reject); })).default;
            case "cs": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cs" */ 'sap/f/thirdparty/_dynamics/messagebundle_cs2'], resolve, reject); })).default;
            case "cy": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-cy" */ 'sap/f/thirdparty/_dynamics/messagebundle_cy2'], resolve, reject); })).default;
            case "da": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-da" */ 'sap/f/thirdparty/_dynamics/messagebundle_da2'], resolve, reject); })).default;
            case "de": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-de" */ 'sap/f/thirdparty/_dynamics/messagebundle_de2'], resolve, reject); })).default;
            case "el": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-el" */ 'sap/f/thirdparty/_dynamics/messagebundle_el2'], resolve, reject); })).default;
            case "en": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en" */ 'sap/f/thirdparty/_dynamics/messagebundle_en2'], resolve, reject); })).default;
            case "en_GB": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_GB" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_GB2'], resolve, reject); })).default;
            case "en_US_sappsd": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_sappsd" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_sappsd2'], resolve, reject); })).default;
            case "en_US_saprigi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_saprigi" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saprigi2'], resolve, reject); })).default;
            case "en_US_saptrc": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-en_US_saptrc" */ 'sap/f/thirdparty/_dynamics/messagebundle_en_US_saptrc2'], resolve, reject); })).default;
            case "es": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-es" */ 'sap/f/thirdparty/_dynamics/messagebundle_es2'], resolve, reject); })).default;
            case "es_MX": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-es_MX" */ 'sap/f/thirdparty/_dynamics/messagebundle_es_MX2'], resolve, reject); })).default;
            case "et": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-et" */ 'sap/f/thirdparty/_dynamics/messagebundle_et2'], resolve, reject); })).default;
            case "fi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fi" */ 'sap/f/thirdparty/_dynamics/messagebundle_fi2'], resolve, reject); })).default;
            case "fr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fr" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr2'], resolve, reject); })).default;
            case "fr_CA": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-fr_CA" */ 'sap/f/thirdparty/_dynamics/messagebundle_fr_CA2'], resolve, reject); })).default;
            case "hi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hi" */ 'sap/f/thirdparty/_dynamics/messagebundle_hi2'], resolve, reject); })).default;
            case "hr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hr" */ 'sap/f/thirdparty/_dynamics/messagebundle_hr2'], resolve, reject); })).default;
            case "hu": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-hu" */ 'sap/f/thirdparty/_dynamics/messagebundle_hu2'], resolve, reject); })).default;
            case "id": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-id" */ 'sap/f/thirdparty/_dynamics/messagebundle_id2'], resolve, reject); })).default;
            case "it": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-it" */ 'sap/f/thirdparty/_dynamics/messagebundle_it2'], resolve, reject); })).default;
            case "iw": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-iw" */ 'sap/f/thirdparty/_dynamics/messagebundle_iw2'], resolve, reject); })).default;
            case "ja": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ja" */ 'sap/f/thirdparty/_dynamics/messagebundle_ja2'], resolve, reject); })).default;
            case "kk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-kk" */ 'sap/f/thirdparty/_dynamics/messagebundle_kk2'], resolve, reject); })).default;
            case "ko": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ko" */ 'sap/f/thirdparty/_dynamics/messagebundle_ko2'], resolve, reject); })).default;
            case "lt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-lt" */ 'sap/f/thirdparty/_dynamics/messagebundle_lt2'], resolve, reject); })).default;
            case "lv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-lv" */ 'sap/f/thirdparty/_dynamics/messagebundle_lv2'], resolve, reject); })).default;
            case "mk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-mk" */ 'sap/f/thirdparty/_dynamics/messagebundle_mk2'], resolve, reject); })).default;
            case "ms": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ms" */ 'sap/f/thirdparty/_dynamics/messagebundle_ms2'], resolve, reject); })).default;
            case "nl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-nl" */ 'sap/f/thirdparty/_dynamics/messagebundle_nl2'], resolve, reject); })).default;
            case "no": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-no" */ 'sap/f/thirdparty/_dynamics/messagebundle_no2'], resolve, reject); })).default;
            case "pl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pl" */ 'sap/f/thirdparty/_dynamics/messagebundle_pl2'], resolve, reject); })).default;
            case "pt": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pt" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt2'], resolve, reject); })).default;
            case "pt_PT": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-pt_PT" */ 'sap/f/thirdparty/_dynamics/messagebundle_pt_PT2'], resolve, reject); })).default;
            case "ro": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ro" */ 'sap/f/thirdparty/_dynamics/messagebundle_ro2'], resolve, reject); })).default;
            case "ru": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-ru" */ 'sap/f/thirdparty/_dynamics/messagebundle_ru2'], resolve, reject); })).default;
            case "sh": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sh" */ 'sap/f/thirdparty/_dynamics/messagebundle_sh2'], resolve, reject); })).default;
            case "sk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sk" */ 'sap/f/thirdparty/_dynamics/messagebundle_sk2'], resolve, reject); })).default;
            case "sl": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sl" */ 'sap/f/thirdparty/_dynamics/messagebundle_sl2'], resolve, reject); })).default;
            case "sr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sr" */ 'sap/f/thirdparty/_dynamics/messagebundle_sr2'], resolve, reject); })).default;
            case "sv": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-sv" */ 'sap/f/thirdparty/_dynamics/messagebundle_sv2'], resolve, reject); })).default;
            case "th": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-th" */ 'sap/f/thirdparty/_dynamics/messagebundle_th2'], resolve, reject); })).default;
            case "tr": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-tr" */ 'sap/f/thirdparty/_dynamics/messagebundle_tr2'], resolve, reject); })).default;
            case "uk": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-uk" */ 'sap/f/thirdparty/_dynamics/messagebundle_uk2'], resolve, reject); })).default;
            case "vi": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-vi" */ 'sap/f/thirdparty/_dynamics/messagebundle_vi2'], resolve, reject); })).default;
            case "zh_CN": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-zh_CN" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_CN2'], resolve, reject); })).default;
            case "zh_TW": return (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-fiori-messagebundle-zh_TW" */ 'sap/f/thirdparty/_dynamics/messagebundle_zh_TW2'], resolve, reject); })).default;
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
        Icons.$$1("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", localeId, importAndCheck);
    });

}));
