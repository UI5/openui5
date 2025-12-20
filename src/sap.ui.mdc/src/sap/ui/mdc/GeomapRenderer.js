/*!
 * ${copyright}
 */

sap.ui.define(['./library'], (library) => {
    "use strict";

    /**
     * Geomap renderer.
     * @namespace
     */
    const GeomapRenderer = {
        apiVersion: 2
    };

    /**
     * CSS class to be applied to the HTML root element of the control.
     *
     * @readonly
     * @const {string}
     */
    GeomapRenderer.CSS_CLASS = "sapUiMDCGeomap";

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.mdc.Geomap} oGeomap An object representation of the control that should be rendered
     */
    GeomapRenderer.render = function(oRm, oGeomap) {
        oRm.openStart("div", oGeomap);
        oRm.class(GeomapRenderer.CSS_CLASS);
        oRm.style("height", oGeomap.getHeight());
        oRm.style("width", oGeomap.getWidth());
        oRm.openEnd();

        const sHeader = oGeomap.getHeader();
        if (sHeader) {
            oRm.openStart("div", oGeomap.getId() + "-header");
            oRm.openEnd();
            oRm.text(sHeader);
            oRm.close("div");
        }

        // render internal geomap
        GeomapRenderer.renderInternalGeomap(oRm, oGeomap);

        oRm.close("div");
    };

    GeomapRenderer.renderInternalGeomap = function(oRm, oGeomap) {
        oRm.openStart("div", oGeomap.getId() + "-internal");
        oRm.class("sapUiMDCGeomapInternal");
        oRm.openEnd();
        oRm.renderControl(oGeomap.getAggregation("_geomap"));
        oRm.close("div");
    };

    GeomapRenderer.renderContent = function(oRm, oGeomap) {
        oRm.openStart("div", oGeomap.getId() + "-content");
        oRm.class("sapUiMDCGeomapInternal");
        oRm.openEnd();
        oRm.renderControl(oGeomap.getAggregation("content"));
        oRm.close("div");
    };

    GeomapRenderer.renderInnerStructure = function(oRm, oInnerStructure) {
        oRm.renderControl(oInnerStructure);
    };

    return GeomapRenderer;
});