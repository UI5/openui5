const sMeasure = "fl.performance.flexBundleLoad";
performance.mark(`${sMeasure}`);

window["sap-ui-config"] = window["sap-ui-config"] || {};
window["sap-ui-config"].onInit = "module:fl/performance/flexBundleLoad/withFL";
window["sap-ui-config"].resourceroots = {"fl.performance": "./"};
window["sap-ui-config"].async = "true";
const basePath = document.location.pathname.match(/(.*)\/test-resources\//)[1];
const script = document.createElement("script");
script.src = `${window.location.origin}${basePath}/resources/sap-ui-core.js`;
document.head.appendChild(script);