/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
], function (Log, MessageBox, Controller, Filter, Sorter, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DataAggregation_CAP.CAP", {
		onChangeGrandTotal : function (vEventOrSelectedKey) {
			const sGrandTotalAtBottomOnly = typeof vEventOrSelectedKey === "string"
				? vEventOrSelectedKey
				: vEventOrSelectedKey.getSource().getSelectedKey();
			const oTable = this.byId("table");

			oTable.getRowMode().setFixedTopRowCount(
				["", "false"].includes(sGrandTotalAtBottomOnly) ? 1 : 0);
			oTable.getRowMode().setFixedBottomRowCount(
				["false", "true"].includes(sGrandTotalAtBottomOnly) ? 1 : 0);
			switch (sGrandTotalAtBottomOnly) {
				case "":
					this._oAggregation.grandTotalAtBottomOnly = undefined;
					break;

				case "false":
					this._oAggregation.grandTotalAtBottomOnly = false;
					break;

				case "true":
					this._oAggregation.grandTotalAtBottomOnly = true;
					break;

				// case "off":
				// no default
			}
			this._oAggregation.aggregate.FlightPrice.grandTotal = sGrandTotalAtBottomOnly !== "off";

			oTable.getBinding("rows").setAggregation(this._oAggregation);
		},

		onDownload : function () {
			this.byId("table").getBinding("rows").requestDownloadUrl().then(function (sUrl) {
				window.open(sUrl, sUrl);
			});
		},

		onExit : function () {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
		},

		onInit : function () {
			// initialization has to wait for view model/context propagation
			this.getView().attachEventOnce("modelContextChange", function () {
				var oUriParameters = new URLSearchParams(window.location.search),
					bBookingID = oUriParameters.has("BookingID"),
					sFilter = oUriParameters.get("filter"),
					sGrandTotalAtBottomOnly = oUriParameters.get("grandTotalAtBottomOnly"),
					sGroupLevels = oUriParameters.get("groupLevels"),
					sSort = oUriParameters.get("sort"),
					sSubtotalsAtBottomOnly = oUriParameters.get("subtotalsAtBottomOnly"),
					oTable = this.byId("table"),
					sThreshold = oUriParameters.get("threshold") || "100",
					oRowsBinding = oTable.getBinding("rows"),
					sVisibleRowCount = oUriParameters.get("visibleRowCount");

				this.getView().setModel(new JSONModel({
					bBookingID : bBookingID,
					iMessages : 0,
					sSearch : "",
					iVisibleRowCount : parseInt(sVisibleRowCount) || 20
				}), "ui");
				this.initMessagePopover("showMessages");

				this._oAggregation = {
					aggregate : {
						FlightPrice : {
							grandTotal : true,
							subtotals : true,
							unit : "CurrencyCode_code"
						}
					},
					group : {
						airline : {additionally : ["airlineName"]},
						ConnectionID : {
							additionally : ["DepAirport", "DepCity", "DestAirport", "DestCity"]
						},
						status : {additionally : ["statusName"]}
					},
					groupLevels : ["airline", "ConnectionID", "FlightDate", "status", "TravelID",
						"BookingDate"]
				};
				if (bBookingID) { // leaf level is individual bookings
					this._oAggregation.group.BookingID = {additionally : ["ID"]};
					this._oAggregation.groupLevels.push("BookingID");
				}
				if (sGroupLevels !== null) {
					this._oAggregation.groupLevels.forEach((sGroupLevel) => {
						// ensure that all groups are defined to avoid drill-down errors
						this._oAggregation.group[sGroupLevel] ??= {};
					});
					if (sGroupLevels === "") {
						delete this._oAggregation.groupLevels;
					} else {
						this._oAggregation.groupLevels = sGroupLevels.split(",");
					}
				}
				this.getView().setModel(oRowsBinding.getModel(), "header");
				this.getView().setBindingContext(oRowsBinding.getHeaderContext(), "header");
				if (sThreshold) {
					oTable.setThreshold(parseInt(sThreshold));
				}
				if (!["", "false", "off", "true"].includes(sGrandTotalAtBottomOnly)) {
					sGrandTotalAtBottomOnly = ""; // ignore invalid values
				}
				// Note: no "change" event fired!
				this.byId("grandTotalAtBottomOnly").setSelectedKey(sGrandTotalAtBottomOnly);
				this.onChangeGrandTotal(sGrandTotalAtBottomOnly);
				if (sSubtotalsAtBottomOnly === "off") {
					this._oAggregation.aggregate.FlightPrice.subtotals = false;
				} else if (sSubtotalsAtBottomOnly) {
					this._oAggregation.subtotalsAtBottomOnly = sSubtotalsAtBottomOnly === "true";
				}
				oRowsBinding.setAggregation(this._oAggregation);
				if (sFilter) { // e.g. "status EQ B,Distance BT 1000 5000"
					oRowsBinding.filter(sFilter.split(",").map(function (sSingleFilter) {
						var aPieces = sSingleFilter.split(" ");

						return new Filter({
							path : aPieces[0],
							operator : aPieces[1],
							value1 : aPieces[2],
							value2 : aPieces[3]
						});
					}));
				}
				if (sSort) {
					oRowsBinding.sort(sSort.split(",").map((sSingleSort) => {
						const aPieces = sSingleSort.split(" ");

						return new Sorter({
							path : aPieces[0],
							descending : aPieces[1] === "desc"
						});
					}));
				}
				oRowsBinding.resume(); // now that "ui" model is available...
			}, this);
		},

		onRefresh : function () {
			this.byId("table").getBinding("rows").refresh();
		},

		onRefreshBooking : function () {
			this.byId("details").getBindingContext().refresh();
		},

		onSearch : function () {
			this._oAggregation.search
				= this.getView().getModel("ui").getProperty("/sSearch");
			this.byId("table").getBinding("rows").setAggregation(this._oAggregation);
		},

		onShowDetails : function (oEvent) {
			const oDetails = this.byId("details");
			oDetails.getBindingContext()?.setKeepAlive(false);

			const oContext = oEvent.getSource().getBindingContext();
			oContext.setKeepAlive(true, (oVictim = oContext) => {
				MessageBox.alert("Unexpected #destroy of " + oVictim);
			});
			oDetails.setBindingContext(oContext);
		},

		onShowSelection : function () {
			const oListBinding = this.byId("table").getBinding("rows");
			const bSelectAll = oListBinding.getHeaderContext().isSelected();
			const aPaths = oListBinding.getAllCurrentContexts()
				.filter((oContext) => oContext.isSelected() !== bSelectAll)
				.map((oContext) => oContext.getPath());
			MessageBox.information((bSelectAll ? "All except " : "") + aPaths.join("\n"),
				{title : "Selected Rows"});

			oListBinding.getAllCurrentContexts().forEach((oContext) => {
				const bSelectedGetter = oContext.isSelected();
				const bSelectedProperty = oContext.getProperty("@$ui5.context.isSelected") ?? false;
				if (bSelectedGetter !== bSelectedProperty) {
					Log.warning(`${bSelectedGetter} vs. ${bSelectedProperty}`,
						oContext, "sap.ui.core.sample.odata.v4.DataAggregation_CAP.CAP");
				}
			});
		},

		onToggleCount : function (oEvent) {
			const bCount = oEvent.getSource().getSelected();
			const oListBinding = this.byId("table").getBinding("rows");
			oListBinding.changeParameters({$count : bCount});
		}
	});
});
