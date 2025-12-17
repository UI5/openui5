/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library testlibs.customCss.lib1
 */
sap.ui.define([
	'sap/ui/core/Core',
	'sap/ui/core/library' // library dependencies
], function(Core) {
	"use strict";

	return Core.initLibrary({
		name : "testlibs.customCss.lib1",
		apiVersion: 2,
		dependencies : ["sap.ui.core"],
		version: "1.2.3"
	});
});
