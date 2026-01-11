sap.ui.define(['sap/ui/core/Control'], function(Control) {
	"use strict";

	const clazz = Control.extend("testdata.mvc.controls.ModuleWithPromiseExport", {
		metadata: {},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.close("div");
			}
		}
	});

	return new Promise(function(resolve) {
		resolve(clazz);
	});
});