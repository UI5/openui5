window["sap-ui-config"].libs = "sap.m, sap.ui.layout, sap.uxap, sap.ui.rta";
window["sap-ui-config"].resourceroots = {
	"sap.ui.rta.test.rtaOpenUI5Only": "./"
};
window["sap-ui-config"].bindingSyntax = "complex";
window["sap-ui-config"].flexibilityServices = '[{"connector": "LocalStorageConnector"}]';
window["sap-ui-config"].noConflict = "true";
window["sap-ui-config"].async = "true";
window["sap-ui-config"].onInit="module:rta/internal/testdata/rtaOpenUI5Only/standalone_init"
const basePath = document.location.pathname.match(/(.*)\/test-resources\//)[1];
const script = document.createElement("script");
script.src = `${window.location.origin}${basePath}/resources/sap-ui-core.js`;
document.head.appendChild(script);