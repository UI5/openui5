sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/UIComponent"
], function(Lib, ResourceModel, UIComponent) {
	"use strict";

	var Component = UIComponent.extend("samples.components.commands.Component", {
		metadata: {
			"manifest": "json"
		},
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			const oBundle = Lib.getResourceBundleFor("sap.ui.core");
			const oCoreResourceModel = new ResourceModel({
				bundle: oBundle
			});
			this.setModel(oCoreResourceModel, "i18n");

			const oAppResourceModel = new ResourceModel({
				bundleUrl: sap.ui.require.toUrl("samples/components/commands/i18n/i18n.properties")
			});
			this.setModel(oAppResourceModel, "i18nApp");
		}
	});

	return Component;
});
