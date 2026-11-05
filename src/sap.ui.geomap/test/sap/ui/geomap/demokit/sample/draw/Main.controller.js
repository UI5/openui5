sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Messaging",
	"sap/m/MessageToast",
	"sap/ui/geomap/GeomapCircle",
	"sap/ui/geomap/GeomapPoint"
], function(Controller, Messaging, MessageToast, GeomapCircle, GeomapPoint) {
	"use strict";

	return Controller.extend("sap.ui.geomap.sample.draw.Main", {

		onInit: function() {
			Messaging.registerObject(this.getView(), true);

			const oProvider = this.byId("mapProvider");
			const osm = sap.ui.require.toUrl("sap/ui/geomap/sample/draw/osm.json");
			setTimeout(() => {
				oProvider.setStyleUrl(`${window.location.origin}/${osm}`);
			});

			this._bClosed = false;
			this._aCorners = [];
			this._oFirstCorner = null;
			this._oDraggedCorner = null;
		},

		onMapClick: function(oEvent) {
			if (this._bClosed) {
				return;
			}

			const fLng = oEvent.getParameter("lng");
			const fLat = oEvent.getParameter("lat");
			const oPoint = oEvent.getParameter("point");

			const oMap = this.byId("map");
			const aHit = oMap.getLayersAt(oPoint);
			const bFirstHit = this._oFirstCorner && aHit.includes(this._oFirstCorner);

			if (bFirstHit && this._aCorners.length > 2) {
				this._bClosed = true;
				this._updatePolygon();
				this._updateOutline();
				this._clearPreview();
				MessageToast.show("Polygon closed. Drag corners to reshape it.");
			} else {
				this._createCorner(fLng, fLat);
				this._updateOutline();
				if (this._aCorners.length === 3) {
					MessageToast.show("Click the first point to close the polygon.");
				}
			}
		},

		onMapMousemove: function(oEvent) {
			const fLng = oEvent.getParameter("lng");
			const fLat = oEvent.getParameter("lat");

			if (this._oDraggedCorner) {
				this._oDraggedCorner.setLng(fLng);
				this._oDraggedCorner.setLat(fLat);
				if (this._bClosed) {
					this._updatePolygon();
				}
				this._updateOutline();
			}

			if (!this._bClosed && this._aCorners.length > 0) {
				this._updatePreview(fLng, fLat);
			}
		},

		onMapMouseup: function() {
			this._oDraggedCorner = null;
		},

		_createCorner: function(fLng, fLat) {
			const oCorner = new GeomapCircle({
				lng: fLng,
				lat: fLat,
				radius: 10,
				fillColor: "blue",
				outlineColor: "white",
				outlineWidth: 2,
				layerMouseenter: () => {
					this._setCanvasCursor("grabbing");
					oCorner.setOutlineColor("orange");
					if (oCorner === this._oFirstCorner && this._aCorners.length > 2) {
						oCorner.setOutlineWidth(10);
					}
				},
				layerMouseleave: () => {
					this._setCanvasCursor("");
					oCorner.setOutlineColor("white");
					oCorner.setOutlineWidth(2);
				},
				layerMousedown: () => {
					this._setCanvasCursor("grab");
					this._oDraggedCorner = oCorner;
				}
			});

			this.byId("map").addItem(oCorner);
			this._aCorners.push(oCorner);
			if (this._oFirstCorner === null) {
				this._oFirstCorner = oCorner;
			}
		},

		_updatePolygon: function() {
			const oPolygon = this.byId("polygon");
			oPolygon.removeAllPoints();
			this._aCorners.forEach(function(oCorner) {
				oPolygon.addPoint(new GeomapPoint({ lng: oCorner.getLng(), lat: oCorner.getLat() }));
			});
		},

		_updateOutline: function() {
			const oLine = this.byId("outline");
			oLine.removeAllPoints();
			this._aCorners.forEach(function(oCorner) {
				oLine.addPoint(new GeomapPoint({ lng: oCorner.getLng(), lat: oCorner.getLat() }));
			});
			if (this._bClosed && this._aCorners.length > 0) {
				const oFirst = this._aCorners[0];
				oLine.addPoint(new GeomapPoint({ lng: oFirst.getLng(), lat: oFirst.getLat() }));
			}
		},

		_updatePreview: function(fLng, fLat) {
			const oPreview = this.byId("preview");
			oPreview.removeAllPoints();
			const oLast = this._aCorners[this._aCorners.length - 1];
			oPreview.addPoint(new GeomapPoint({ lng: oLast.getLng(), lat: oLast.getLat() }));
			oPreview.addPoint(new GeomapPoint({ lng: fLng, lat: fLat }));
		},

		_clearPreview: function() {
			this.byId("preview").removeAllPoints();
		},

		_setCanvasCursor: function(sCursor) {
			const oCanvas = this.byId("map").getCanvas();
			if (oCanvas) {
				oCanvas.style.cursor = sCursor;
			}
		}

	});
});
