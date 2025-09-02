sap.ui.define([
	"sap/ui/integration/Extension"
], (Extension) => {
	"use strict";

	return Extension.extend("sap.f.cardsdemo.cardcontent.cardWithManyChildren.ChildCard2Extension", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);
			this.attachAction((oEvent) => {
				const sType = oEvent.getParameter("type");

				if (sType !== "Custom") {
					return;
				}

				this.getCard().triggerAction({
					type: "ShowCard",
					parameters: {
						childCardKey: oEvent.getParameter("parameters").childCardKey
					}
				});
			});
		}
	});
});