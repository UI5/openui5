/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/UIComponent"],
	function (UIComponent) {
	"use strict";

	// Note:
	// - This sample uses a JSON model to keep the structure simple. For productive apps,
	//   we strongly recommend using the OData V4 model.
	// - OData types can also be used without the OData models. The prerequisite is that the
	//   data format matches the expected serialization format of OData.
	return UIComponent.extend("sap.ui.core.sample.odata.types.v2.Time.Component", {
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getModel().setData({
				Time: { ms: 41635000 , __edmType: 'Edm.Time' }
			});
		}
	});
});
