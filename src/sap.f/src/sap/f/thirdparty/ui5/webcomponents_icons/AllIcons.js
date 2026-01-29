sap.ui.define(['require', 'exports', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/Theme'], (function (require, exports, Icons, Theme) { 'use strict';

    const loadIconsBundle = async (collection) => {
        let iconData;
        if (collection === "SAP-icons-v5") {
            iconData = (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-icons-v5" */ 'sap/f/thirdparty/_dynamics/SAP-icons'], resolve, reject); })).default;
        }
        else {
            iconData = (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-icons-v4" */ 'sap/f/thirdparty/_dynamics/SAP-icons2'], resolve, reject); })).default;
        }
        if (typeof iconData === "string" && iconData.endsWith(".json")) {
            throw new Error("[icons] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the \"Assets\" documentation for more information.");
        }
        return iconData;
    };
    const registerLoaders = () => {
        Icons.C("SAP-icons-v4", loadIconsBundle);
        Icons.C("SAP-icons-v5", loadIconsBundle);
    };
    registerLoaders();

    const __esModule = true ;

    exports.__esModule = __esModule;

}));
