window['sap-ui-config'].libs = 'sap.m, sap.ui.comp, sap.ui.layout, sap.uxap, sap.ui.rta';
window['sap-ui-config'].resourceroots = {
	'sap.ui.rta.test.additionalElements': './'
};
window['sap-ui-config'].flexibilityServices = '[{"connector": "LocalStorageConnector"}]';
window['sap-ui-config'].async = 'true';
window["sap-ui-config"].onInit="module:rta/internal/testdata/additionalElements/standalone_init"
const basePath = document.location.pathname.match(/(.*)\/test-resources\//)[1];
const script = document.createElement("script");
script.src = `${window.location.origin}${basePath}/resources/sap-ui-core.js`;
document.head.appendChild(script);