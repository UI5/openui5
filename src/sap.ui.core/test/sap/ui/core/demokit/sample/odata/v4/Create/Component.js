/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.Create.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		}
	});
});
