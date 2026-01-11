//@ui5-bundle sap/test/lib2/library-preload.js
sap.ui.predefine("sap/test/lib2/library", ['sap/ui/core/Lib', 'sap/test/lib4/library'],
	function(Library) {
	"use strict";

	return Library.init({
		name:"sap.test.lib2",
		apiVersion:2,
		noLibraryCSS:true
	});
});
sap.ui.require.preload({
	"version":"2.0",
	"name":"sap.test.lib2",
	"modules":{
		"sap/test/lib2/manifest.json":"{\"sap.app\":{\"id\":\"sap.test.lib2\",\"type\":\"library\",\"title\":\"Library sap.test.lib2\",\"applicationVersion\":{\"version\":\"1.0.0\"}},\"sap.ui\":{\"technology\":\"UI5\",\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true}},\"sap.ui5\":{\"dependencies\":{\"minUI5Version\":\"2.0.0\",\"libs\":{\"sap.test.lib4\":{}}}}}"
	}
});