sap.ui.define("sap/ui/table/sample/TableExampleUtils", [
	"sap/ui/core/syncStyleClass",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/List",
	"sap/m/Button",
	"sap/m/FeedListItem"
], function(syncStyleClass, JSONModel, Popover, List, Button, FeedListItem) {
	"use strict";

	function showInfo(aItems, oBy) {
		const oPopover = new Popover({
			showHeader: false,
			placement: "Auto",
			afterClose: function() {
				oPopover.destroy();
			},
			content: [
				new List({
					items: {
						path: "/items",
						template: new FeedListItem({
							senderActive: false,
							sender: "{title}",
							showIcon: false,
							text: "{text}"
						})
					}
				})
			]
		});

		syncStyleClass("sapUiSizeCompact", oBy, oPopover);
		syncStyleClass("sapUiSizeCozy", oBy, oPopover);
		oPopover.setModel(new JSONModel({items: aItems}));
		oPopover.openBy(oBy, true);
	}

	const Utils = {};

	Utils.showInfo = function(aItems, oBy) {
		if (typeof (aItems) === "string") {
			fetch(aItems)
				.then(function(response) {
					if (!response.ok) {
						throw new Error("HTTP error " + response.status);
					}
					return response.json();
				})
				.then(function(oData) {
					showInfo(oData, oBy);
				})
				.catch(function() {
					// Error loading info.json
				});
		} else {
			showInfo(aItems, oBy);
		}
	};

	Utils.createInfoButton = function(sInfoFor) {
		return new Button({
			icon: "sap-icon://hint",
			tooltip: "Show information",
			press: function(oEvent) {
				Utils.showInfo(sap.ui.require.toUrl(sInfoFor) + "/info.json", oEvent.getSource());
			}
		});
	};

	return Utils;

});