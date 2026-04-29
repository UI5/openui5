const basePath = document.location.pathname.match(/(.*)\/test-resources\//)[1];
const script = document.createElement("script");
script.src = `${window.location.origin}${basePath}/resources/sap-ui-core.js`;
document.head.appendChild(script);
window["sap-ui-config"] = window["sap-ui-config"] || {};
window["sap-ui-config"].onInit = "module:dt/performance/designtimeRegularOverlays/main";
window["sap-ui-config"].async = "true";
window["sap-ui-config"].libs = "sap.ui.rta, sap.ui.dt, sap.m, sap.ui.layout";
window['sap-ui-config'].resourceroots = {
	"dt.performance": "./",
	"rta.performance": "../../../../../sap/ui/rta/internal/performance/"
};
window["sap-ui-config"].flexibilityServices = '[{"connector": "SessionStorageConnector"}]';