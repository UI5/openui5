sap.ui.define(['sap/ui/core/Control'], function(Control) {
	"use strict";

	return Control.extend("testdata.mvc.controls.RegularControl", {
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
});