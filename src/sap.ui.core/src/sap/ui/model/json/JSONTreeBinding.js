/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the JSON model implementation of a list binding
sap.ui.define(['sap/ui/model/ClientTreeBinding'],
	function(ClientTreeBinding) {
	"use strict";


	/**
	 * @class Tree binding implementation for JSON format. See {@link sap.ui.model.json.JSONModel#bindTree}
	 * @hideconstructor
	 * @protected
	 * @alias sap.ui.model.json.JSONTreeBinding
	 * @extends sap.ui.model.ClientTreeBinding
	 */
	var JSONTreeBinding = ClientTreeBinding.extend("sap.ui.model.json.JSONTreeBinding");

	JSONTreeBinding.prototype._saveSubContext = function(oNode, aContexts, sContextPath, sName) {
		// only collect node if it is defined (and not null), because typeof null == "object"!
		if (oNode && typeof oNode == "object") {
			var oNodeContext = this.oModel.getContext(sContextPath + sName);
			// check if there is a filter on this level applied
			if (this.oCombinedFilter && !this.bIsFiltering) {
				if (this.filterInfo.aFilteredContexts && this.filterInfo.aFilteredContexts.indexOf(oNodeContext) != -1) {
					aContexts.push(oNodeContext);
				}
			} else {
				aContexts.push(oNodeContext);
			}
		}
	};

	return JSONTreeBinding;

});