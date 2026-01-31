sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/Control",
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/Layer",
	"sap/ui/rta/toolbar/Adaptation",
	"onStartAdaptation"
], function(
	Lib,
	Control,
	Controller,
	Layer,
	Adaptation,
	onStartAdaptation
) {
	"use strict";

	const PageController = Controller.extend("sap.ui.rta.rtaReload.Page", {
		onInit() {
			this.oToolbar = new Adaptation({
				textResources: Lib.getResourceBundleFor("sap.ui.rta"),
				rtaInformation: {
					flexSettings: {
						layer: Layer.CUSTOMER
					},
					rootControl: new Control()
				}
			});
		},
		switchToAdaptionMode() {
			onStartAdaptation();
		}
	});
	return PageController;
});