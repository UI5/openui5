sap.ui.define(['require', 'exports', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/Theme'], (function (require, exports, Icons, Theme) { 'use strict';

    const loadIconsBundle = async (collection) => {
        let iconData;
        if (collection === "business-suite-v1") {
            iconData = (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-icons-business-suite-v1" */ 'sap/f/thirdparty/_dynamics/SAP-icons-business-suite'], resolve, reject); })).default;
        }
        else {
            iconData = (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-icons-business-suite-v2" */ 'sap/f/thirdparty/_dynamics/SAP-icons-business-suite2'], resolve, reject); })).default;
        }
        if (typeof iconData === "string" && iconData.endsWith(".json")) {
            throw new Error("[icons-business-suite] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the \"Assets\" documentation for more information.");
        }
        return iconData;
    };
    const registerLoaders = () => {
        Icons.C("business-suite-v1", loadIconsBundle);
        Icons.C("business-suite-v2", loadIconsBundle);
    };
    registerLoaders();

    const __esModule = true ;

    exports.__esModule = __esModule;

}));
