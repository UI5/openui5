sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/base/Log",
	"sap/m/MessageToast"
], function (
	Extension,
	Log,
	MessageToast
) {
	"use strict";

	var MeasureActionsExtension = Extension.extend("cardsdemo.measureActions.Extension");

	MeasureActionsExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	MeasureActionsExtension.prototype._handleAction = function (oEvent) {
		const sActionType = oEvent.getParameter("type"),
			mParams = oEvent.getParameter("parameters");

		if (sActionType !== "Custom") {
			return;
		}

		if (mParams.method === "processMeasureClick") {
			const sWeek = mParams.week,
				sMeasure = mParams.measure,
				sRevenueValue = mParams.revenueValue,
				sCostValue = mParams.costValue;

			const sValue = sMeasure === "Revenue" ? sRevenueValue : sCostValue;

			Log.info("Measure-specific action triggered:");
			Log.info(`  Week: ${sWeek}`);
			Log.info(`  Measure: ${sMeasure}`);
			Log.info(`  Value: ${sValue}`);

			const sMessage = `Clicked ${sMeasure} for ${sWeek}: ${sValue}`;
			MessageToast.show(sMessage, {
				duration: 3000,
				width: "20em"
			});
		}
	};

	return MeasureActionsExtension;
});
