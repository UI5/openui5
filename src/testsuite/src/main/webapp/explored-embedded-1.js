(function() {
	"use strict";

	sap.ui.require(["sap/ui/core/Core"], (Core) => Core.ready(function () {

		if (typeof window['sap-ui-documentation-config'] === "object") {
			sap.ui.require(['sap/ui/documentation/sdk/controller/util/APIInfo'], function (APIInfo) {
				APIInfo._setRoot(window['sap-ui-documentation-config'].apiInfoRoot);
			});

			sap.ui.require(['sap/ui/documentation/sdk/Component'], function (Comp) {
				null["sap.ui5"]["config"]["docuPath"] = window['sap-ui-documentation-config'].docuPath;
			});
		} else {
			jQuery.sap.log.info("No local documentation configuration found");
			window['sap-ui-documentation-hideEmptySections'] = true;
		}

		sap.ui.require([
			"sap/m/Page",
			"sap/ui/core/ComponentContainer"
		], function (Page, ComponentContainer) {
			// initialize the UI component
			new Page({
				showHeader : false,
				content : new ComponentContainer({
					height : "100%",
					name : "sap.ui.documentation.sdk",
					settings : {
						id : "sdk"
					}
				})
			}).placeAt("content");
		});

		if (!window.location.hash) {
			window.location.hash = "#/controls";
		}

	}));
})();