//@ui5-bundle sap/test/lib4/library-preload.js
sap.ui.predefine("sap/test/lib4/library", ['sap/ui/core/Lib'],
	function(Library) {
	"use strict";

	return Library.init({
		name:"sap.test.lib4",
		apiVersion:2,
		noLibraryCSS:true
	});
});
sap.ui.require.preload({
	"version":"2.0",
	"name":"sap.test.lib4",
	"modules":{
		"sap/test/lib4/manifest.json":"{\"sap.app\":{\"id\":\"sap.test.lib4\",\"type\":\"library\",\"title\":\"Library sap.test.lib4\",\"applicationVersion\":{\"version\":\"1.0.0\"}},\"sap.ui\":{\"technology\":\"UI5\",\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true}},\"sap.ui5\":{\"dependencies\":{\"minUI5Version\":\"2.0.0\",\"libs\":{}}}}"
	}
});