sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.tnt.sample.SideNavigationWithTags.C", {

		onCollapseExpandPress: function () {
			const oSideNavigation = this.byId("sideNavigation");
			const bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		}

	});
});
