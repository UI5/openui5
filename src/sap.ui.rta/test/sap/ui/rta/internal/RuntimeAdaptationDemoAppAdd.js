window["sap-ui-config"].async = "true";
window["sap-ui-config"].theme = "sap_horizon";
window["sap-ui-config"].resourceroots = { "sap.ui.rta.test.additionalElements": "testdata/additionalElements/" };
window["sap-ui-config"].libs = "sap.m, sap.ui.comp, sap.ui.layout, sap.uxap, sap.ui.rta";
window['sap-ui-config'].flexibilityServices = '[{"connector": "LocalStorageConnector"}]';
window["sap-ui-config"].onInit="module:rta/internal/testdata/additionalElements/AdditionalElements"
const basePath = document.location.pathname.match(/(.*)\/test-resources\//)[1];
const script = document.createElement("script");
script.src = `${window.location.origin}${basePath}/resources/sap-ui-core.js`;
document.head.appendChild(script);