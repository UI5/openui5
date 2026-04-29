(() => {
	"use strict";

	const basePath = document.location.pathname.match(/(.*)\/test-resources\//)[1];
	const script = document.createElement("script");
	script.src = `${window.location.origin}${basePath}/resources/sap-ui-core.js`;
	script.id = "sap-ui-bootstrap";
	script.setAttribute("data-sap-ui-theme", "sap_horizon");
	script.setAttribute("data-sap-ui-language", "en");
	script.setAttribute("data-sap-ui-noConflict", "true");
	script.setAttribute("data-sap-ui-async", "true");
	script.setAttribute("data-sap-ui-libs", "sap.m");
	script.setAttribute("data-sap-ui-xx-bindingSyntax", "complex");
	script.setAttribute("data-sap-ui-resourceroots", '{"local": "./"}');
	script.setAttribute("data-sap-ui-onInit", "module:local/initApp");
	document.head.appendChild(script);
})();