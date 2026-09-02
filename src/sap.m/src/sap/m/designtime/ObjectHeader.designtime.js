/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.ObjectHeader control
sap.ui.define([],
	function() {
	"use strict";

	return {
		palette: {
			group: "INPUT",
			icons: {
				svg: "sap/m/designtime/ObjectHeader.icon.svg"
			}
		},
		aggregations: {
			headerContainer: {
				propagateMetadata: function (oInnerControl, oObjectHeader) {
					if (oInnerControl.isA("sap.m.IconTabBar")) {
						return {
							domRef: function () {
								return oObjectHeader.getDomRef().querySelector(".sapMITH");
							},
							aggregations: {
								items: {
									domRef: function () {
										return oObjectHeader.getDomRef().querySelector(".sapMITH");
									},
									actions: {
										move: "moveControls"
									}
								}
							}
						};
					}

					return null;
				},
				// The ObjectHeader should only propagate itself as the relevant container for the tab strip of an embedded IconTabBar
				// to enable the move functionality.
				// Otherwise there will be conflicts with inner controls also using this mechanism where the ObjectHeader would incorrectly
				// be the relevant container for inner controls (e.g. a Form inside, which uses this mechanism to enable addViaDelegate)
				propagateRelevantContainer: function isIconTabBarStructure(oElement) {
					return oElement.isA("sap.m.IconTabBar") || oElement.isA("sap.m.IconTabFilter");
				}
			}
		},
		templates: {
			create: "sap/m/designtime/ObjectHeader.create.fragment.xml"
		}
	};

});