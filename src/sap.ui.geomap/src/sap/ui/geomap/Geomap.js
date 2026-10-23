/*!
 * ${copyright}
 */

// Provides control sap.ui.geomap.Geomap.
sap.ui.define([
	"sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap"
], function (_Geomap) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.geomap.Geomap</code> control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A map container control that displays an interactive 2D map and hosts map features,
	 * data-driven layers, and map UI controls as child elements.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>Geomap</code> control is the top-level container of the <code>sap.ui.geomap</code>
	 * library. Child elements are rendered on the map by the underlying Geomap web component:
	 * <ul>
	 *   <li>Per-feature primitives: {@link sap.ui.geomap.GeomapSpot}, {@link sap.ui.geomap.GeomapCircle}, {@link sap.ui.geomap.GeomapPolygon}, and {@link sap.ui.geomap.GeomapLine}.</li>
	 *   <li>Data-driven layers bound to a {@link sap.ui.geomap.GeomapSource}: {@link sap.ui.geomap.GeomapCircleLayer}, {@link sap.ui.geomap.GeomapFillLayer}, {@link sap.ui.geomap.GeomapLineLayer}, {@link sap.ui.geomap.GeomapSymbolLayer}, and {@link sap.ui.geomap.GeomapHeatmapLayer}.</li>
	 *   <li>Map UI controls such as {@link sap.ui.geomap.GeomapNavigationControl}, {@link sap.ui.geomap.GeomapScaleControl}, and {@link sap.ui.geomap.GeomapFullscreenControl}.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3>
	 *
	 * Use the <code>Geomap</code> control to render a map in a UI5 view and add the map content
	 * declaratively as child controls. For high-volume datasets, prefer a single {@link sap.ui.geomap.GeomapSource}
     * bound to a matching layer control over many per-feature child controls –
	 * see <em>Performance and Limitations</em> below.
	 *
	 * <h3>Performance and Limitations</h3>
	 *
	 * The declarative API is well suited for small to medium maps.
	 * The following guidelines apply when the number of displayed features grows large:
	 * <ul>
	 *   <li><b>Prefer a single source and layer over many per-feature controls.</b> Each {@link sap.ui.geomap.GeomapCircle}, {@link sap.ui.geomap.GeomapPolygon}, and {@link sap.ui.geomap.GeomapLine} owns its own map source and layer. Above roughly 1,000 features, use a single {@link sap.ui.geomap.GeomapSource} bound to a matching layer control (for example {@link sap.ui.geomap.GeomapCircleLayer}) instead.</li>
	 *   <li><b>Approximate, device-dependent scale thresholds for per-feature controls:</b> above 5,000 elements, expect slow pan/zoom and delayed interactions; above 10,000 elements, significant memory pressure; above 50,000 elements, risk of a tab crash on constrained devices.</li>
	 *   <li><b>Use <code>GeomapSource</code> for high-frequency data updates.</b> Assigning the full feature set to {@link sap.ui.geomap.GeomapSource}'s <code>geojson</code> property is significantly more efficient than appending or removing many child controls at runtime.</li>
	 *   <li><b>Complex MapLibre expressions must be set via the JavaScript property.</b> HTML attributes serialize only simple scalars; set expression arrays (for example <code>["interpolate", ["linear"], ["get", "population"], 0, "#F2F12D", 1000000, "#DA9C20"]</code>) in JavaScript, not in XML.</li>
	 *   <li><b>Avoid repeated style or provider swapping on long-lived maps.</b> Each style change can accumulate per-layer listeners; if style switching is unavoidable, recreate the control rather than mutating the provider in place.</li>
	 *   <li><b>Pick one owner per source/layer ID.</b> Mixing declarative children with direct calls on the underlying map instance for the same ID can produce duplicate or missing layers after a style change.</li>
	 * </ul>
	 *
	 * @extends module:sap/ui/geomap/gen/ui5/webcomponents_geomap/dist/Geomap
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.ui.geomap.Geomap
	 */
	const Geomap = _Geomap.extend("sap.ui.geomap.Geomap", {
		metadata: {
			tag: _Geomap.getMetadata().getTag()
		}
	});

	return Geomap;
});


