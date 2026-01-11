//@ui5-bundle sap/test/lib3/library-preload.js
sap.ui.predefine("sap/test/lib3/library", ['sap/ui/core/Lib', 'sap/test/lib2/library'],
function(Library) {
"use strict";

return Library.init({
	name:"sap.test.lib3",
	apiVersion:2,
	noLibraryCSS:true
});
});
sap.ui.require.preload({
	"version":"2.0",
	"name":"sap.test.lib3",
	"modules":{
		"sap/test/lib3/manifest.json":"{\"sap.app\":{\"id\":\"sap.test.lib3\",\"type\":\"library\",\"title\":\"Library sap.test.lib3\",\"applicationVersion\":{\"version\":\"1.0.0\"}},\"sap.ui\":{\"technology\":\"UI5\",\"deviceTypes\":{\"desktop\":true,\"tablet\":true,\"phone\":true}},\"sap.ui5\":{\"dependencies\":{\"minUI5Version\":\"2.0.0\",\"libs\":{\"sap.test.lib2\":{}}}}}"
	}
});