sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel"
], function(
	UIComponent,
	InitialFlexAPI,
	FlexUtils,
	JSONModel
) {
	"use strict";
	const Component = UIComponent.extend("sap.ui.rta.rtaReload.Component", {
		metadata: {
			manifest: "json"
		},
		init(...aArgs) {
			this._adaptButtonConfiguration();
			UIComponent.prototype.init.apply(this, aArgs);
		},

		_adaptButtonConfiguration() {
			var oAppModel = new JSONModel({
				showAdaptButton: false
			});
			this.setModel(oAppModel, "app");

			InitialFlexAPI.isKeyUser()
			.then((bIsKeyUser) => {
				oAppModel.setProperty("/showAdaptButton", bIsKeyUser);
			});
		}
	});
	return Component;
});