sap.ui.define([
	"sap/m/Popover",
	"sap/m/OverflowToolbar",
	"sap/m/Button"
], function (
	Popover,
	OverflowToolbar,
	Button
) {
	"use strict";

	const oButton = new Button({
		text: "Open Popover",
		press: function () {
			const oPopover = new Popover({
				title: "Popover Title",
				content: new Button({
					text: "Button inside Popover"
				}),
				footer: new OverflowToolbar({
					content: new Button({
						text: "Close",
						press: function () {
							oPopover.close();
							oPopover.destroy();
						}
					})
				}),
				afterOpen: function () {
					const oDomRef = oPopover.getDomRef();
					oDomRef.setAttribute("popover", "manual");
					oDomRef.showPopover();
				}
			}).openBy(this);

			oPopover.addStyleClass("sapMPopoverNativeAPI");
		}
	});

	oButton.placeAt("body");
});
