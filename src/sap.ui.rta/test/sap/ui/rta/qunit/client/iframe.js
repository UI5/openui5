(function() {
	"use strict";
	if (window.location.search.indexOf("loadframework") !== -1) {
		const basePath = document.location.pathname.match(/(.*)\/test-resources\//)[1];
		const script = document.createElement("script");
		script.src = `${window.location.origin}${basePath}/resources/sap-ui-core.js`;
		document.head.appendChild(script);
	}
}());