/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	var Utils = {};

	Utils.getPersistencyKey = (oControl) => {
		if (oControl) {
			var oVMControl = oControl.getVariantManagement?.() || oControl;
			if (oVMControl.getPersonalizableControlPersistencyKey) {
				return oVMControl.getPersonalizableControlPersistencyKey();
			}
			return oVMControl.getPersistencyKey && oVMControl.getPersistencyKey();
		}
		return undefined;
	};

	return Utils;
});