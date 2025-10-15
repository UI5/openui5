/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/Geomap", "../Util"
], (Geomap, Util) => {
    "use strict";

    const oDesignTime = {
        actions: {
        },
        aggregations: {
        }
    };

    const aAllowedAggregations = ["items"],
        aAllowedProperties = ["header", "zoom"];

    return Util.getDesignTime(Geomap, aAllowedProperties, aAllowedAggregations, oDesignTime);

});