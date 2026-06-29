sap.ui.define(['require', 'exports', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/Theme'], (function (require, exports, Icons, Theme) { 'use strict';

    const loadIconsBundle = async (collection) => {
        let iconData;
        if (collection === "tnt-v3") {
            iconData = (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-icons-tnt-v3" */ 'sap/f/thirdparty/_dynamics/SAP-icons-TNT'], resolve, reject); })).default;
        }
        else {
            iconData = (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-icons-tnt-v2" */ 'sap/f/thirdparty/_dynamics/SAP-icons-TNT2'], resolve, reject); })).default;
        }
        if (typeof iconData === "string" && iconData.endsWith(".json")) {
            throw new Error("[icons-tnt] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the \"Assets\" documentation for more information.");
        }
        return iconData;
    };
    const registerLoaders = () => {
        Icons.C("tnt-v2", loadIconsBundle);
        Icons.C("tnt-v3", loadIconsBundle);
    };
    registerLoaders();

    const __esModule = true ;

    exports.__esModule = __esModule;

}));
