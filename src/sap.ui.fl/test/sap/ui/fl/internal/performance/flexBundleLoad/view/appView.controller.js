sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(
	Controller
) {
	"use strict";

	return Controller.extend("sap.ui.fl.internal.performance.flexBundleLoad.view.appView", {
		onAfterRendering() {
			const sMeasure = "fl.performance.flexBundleLoad";
			performance.measure(sMeasure, `${sMeasure}`);
			window.wpp.customMetrics[sMeasure] = performance.getEntriesByName(sMeasure, "measure")[0].duration;
			this.byId("ResultText").setText(`Measurement result: ${window.wpp.customMetrics[sMeasure]} ms`);
		}
	});
});