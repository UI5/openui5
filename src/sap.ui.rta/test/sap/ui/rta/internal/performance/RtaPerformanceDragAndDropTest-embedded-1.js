window["sap-ui-config"] = window["sap-ui-config"] || {};
window["sap-ui-config"].onInit = "module:rta/performance/dragAndDrop/main";
window["sap-ui-config"].async = "true";
window["sap-ui-config"].libs = "sap.ui.rta, sap.ui.dt, sap.m, sap.ui.layout, sap.ui.fl";
window["sap-ui-config"].resourceroots = {
	"rta.performance": "./",
	"dt.performance": "../../../../../sap/ui/dt/internal/performance/",
	"test-resources": "../../../../../../test-resources"
};
window["sap-ui-config"].flexibilityServices = '[{"connector": "SessionStorageConnector"}]';
const basePath = document.location.pathname.match(/(.*)\/test-resources\//)[1];
const script = document.createElement("script");
script.src = `${window.location.origin}${basePath}/resources/sap-ui-core.js`;
document.head.appendChild(script);