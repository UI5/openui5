sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Messaging",
	"sap/m/Popover",
	"sap/m/Text",
	"sap/m/MessageToast"
], function(Controller, Messaging, Popover, Text, MessageToast) {
	"use strict";

	const UPDATE_INTERVAL_S = 4;

	return Controller.extend("sap.ui.geomap.sample.drive.Main", {

		onInit: function() {
			Messaging.registerObject(this.getView(), true);

			const oProvider = this.byId("mapProvider");
			const osm = sap.ui.require.toUrl("sap/ui/geomap/sample/drive/osm.json");
			setTimeout(() => {
				oProvider.setStyleUrl(`${window.location.origin}/${osm}`);
			});

			this._iFrame = null;
		},

		onStartDrive: function() {
			const oStartBtn = this.byId("startBtn");
			oStartBtn.setEnabled(false);

			const fSpeed = parseFloat(this.byId("speedInput").getValue());
			const oRoute = this.byId("route");
			const oTravelled = this.byId("routeTravelled");
			const oCar = this.byId("car");

			const fTotalDist = oRoute.getDistance("kilometers");
			const fTotalTime = fTotalDist / fSpeed;

			oTravelled.removeAllPoints();

			if (this._iFrame) {
				cancelAnimationFrame(this._iFrame);
			}

			let fDistanceTravelled = 0;

			const fnAnimate = () => {
				fDistanceTravelled += (UPDATE_INTERVAL_S / 3600) * fSpeed;
				if (fDistanceTravelled > fTotalDist) {
					fDistanceTravelled = fTotalDist;
				}

				const fTimeTravelled = fDistanceTravelled / fSpeed;
				this.byId("distanceDisplay").setValue(
					`${fDistanceTravelled.toPrecision(2)} / ${fTotalDist.toPrecision(2)} km`
				);
				this.byId("timeDisplay").setValue(
					`${Math.round(fTimeTravelled * 60)} / ${Math.round(fTotalTime * 60)} min`
				);

				const oCoords = oRoute.getPointAt(fDistanceTravelled, "kilometers");
				oCar.setLng(oCoords.lng);
				oCar.setLat(oCoords.lat);

				const GeomapPoint = sap.ui.require("sap/ui/geomap/GeomapPoint");
				oTravelled.addPoint(new GeomapPoint({ lng: oCoords.lng, lat: oCoords.lat }));

				if (fDistanceTravelled < fTotalDist) {
					this._iFrame = requestAnimationFrame(fnAnimate);
				} else {
					oStartBtn.setEnabled(true);
					MessageToast.show("Destination reached!");
				}
			};
			fnAnimate();
		},

		onDestinationPress: function(oEvent) {
			if (!this._oInfoPopover) {
				this._oInfoPopover = new Popover({
					title: "Walldorf",
					content: [
						new Text({
							text: "Walldorf is a town in the Rhein-Neckar-Kreis district in " +
								"Baden-Württemberg, Germany. It is home to the world headquarters of SAP SE."
						})
					]
				});
				this.getView().addDependent(this._oInfoPopover);
			}
			this._oInfoPopover.openBy(oEvent.getSource());
		}

	});
});
