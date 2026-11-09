sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Messaging"
], function(Controller, Messaging) {
	"use strict";

	return Controller.extend("sap.ui.geomap.sample.dynamic.Main", {

		onInit: function() {
			Messaging.registerObject(this.getView(), true);

			const oProvider = this.byId("mapProvider");
			const osm = sap.ui.require.toUrl("sap/ui/geomap/sample/dynamic/osm.json");
			setTimeout(() => {
				oProvider.setStyleUrl(`${window.location.origin}/${osm}`);
			});

			// radius and fillColor on GeomapCircleLayer, and text on GeomapSymbolLayer,
			// are string-typed UI5 properties that map to DOM attributes. The underlying
			// web component converters (SAPGeomapFloat / SAPGeomapString) accept a JSON-
			// stringified array as the attribute value and parse it back to an expression.
			// The layer's source property must be the full DOM id of the source element.
			// UI5 prefixes control ids with the view id, so we use createId() to get it.
			const sSourceId = this.createId("earthquakeSource");
			const oLayer = this.byId("earthquakeLayer");
			oLayer.setSource(sSourceId);
			oLayer.setRadius(JSON.stringify(["*", 5, ["get", "mag"]]));
			oLayer.setFillColor(JSON.stringify([
				"step",
				["get", "mag"],
				"green",
				3, "orange",
				4, "red",
				5, "purple"
			]));

			const oLabels = this.byId("earthquakeLabels");
			oLabels.setSource(sSourceId);
			oLabels.setText(JSON.stringify([
				"number-format",
				["get", "mag"],
				{ "min-fraction-digits": 1, "max-fraction-digits": 1 }
			]));

			this._loadAndAnimate();
		},

		_loadAndAnimate: function() {
			const oSource = this.byId("earthquakeSource");

			fetch("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02")
				.then(function(oResponse) { return oResponse.json(); })
				.then(function(oData) {
					// Initial load goes through UI5 setGeojson to establish the source in MapLibre.
					oSource.setGeojson(oData);

					setInterval(function() {
						oData.features.forEach(function(oFeature) {
							oFeature.properties.mag += (Math.random() / 10) * (Math.random() < 0.5 ? -1 : 1);
							oFeature.geometry.coordinates[0] += (Math.random() / 10) * (Math.random() < 0.5 ? -1 : 1);
							oFeature.geometry.coordinates[1] += (Math.random() / 10) * (Math.random() < 0.5 ? -1 : 1);
						});
						// UI5 deepEqual skips re-render when the object reference is the same.
						// Set directly on the DOM element to bypass ManagedObject diffing.
						oSource.getDomRef().geojson = Object.assign({}, oData);
					}, 1000);
				});
		}

	});
});
