/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/GeomapDelegate",
    "sap/ui/mdc/geomap/PropertyHelper"
], function (
    V4GeomapDelegate,
    PropertyHelper
) {
    "use strict";

    var GeomapDelegate = Object.assign({}, V4GeomapDelegate);

    /**
     * Define a set of V4 specific functions which is specifically meant for the sap.geomap.Geomap control
     *
     * ...
     */

    /**
     * Checks the binding of the table and rebinds it if required.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap The MDC geomap instance
     * @param {object} oBindingInfo The bindingInfo of the geomap
     */
    GeomapDelegate.rebind = function (oGeomap, oBindingInfo) {
        //Nothing to test
    };

    GeomapDelegate.getBindingInfo = function (oGeomap) {
        var oMetadataInfo = oGeomap.getDelegate().payload;
        var sEntitySetPath = "/" + oMetadataInfo.collectionName;
        var oBindingInfo = {
            path: sEntitySetPath/*,
            parameters: {
                entitySet: oMetadataInfo.collectionName,
                useBatchRequests: true,
                provideGrandTotals: true,
                provideTotalResultSize: true,
                noPaging: true
            }*/
        };
        return oBindingInfo;
    };

    GeomapDelegate.fetchProperties = function (oGeomap) {
        var oModel = this._getModel(oGeomap);
        var pCreatePropertyInfos;

        if (!oModel) {
            pCreatePropertyInfos = new Promise(function (resolve) {
                oGeomap.attachModelContextChange({
                    resolver: resolve
                }, onModelContextChange, this);
            }.bind(this)).then(function (oModel) {
                return this._createPropertyInfos(oGeomap, oModel);
            }.bind(this));
        } else {
            pCreatePropertyInfos = this._createPropertyInfos(oGeomap, oModel);
        }

        return pCreatePropertyInfos.then(function (aProperties) {
            if (oGeomap.data) {
                oGeomap.data("$mdcGeomapPropertyInfo", aProperties);
            }
            return aProperties;
        });
    };

    function onModelContextChange(oEvent, oData) {
        var oGeomap = oEvent.getSource();
        var oModel = this._getModel(oGeomap);

        if (oModel) {
            oGeomap.detachModelContextChange(onModelContextChange);
            oData.resolver(oModel);
        }
    }

    GeomapDelegate._createPropertyInfos = function (oGeomap, oModel) {
        return Promise.resolve();
    };

    GeomapDelegate._getModel = function (oGeomap) {
        var oMetadataInfo = oGeomap.getDelegate().payload;
        return oGeomap.getModel(oMetadataInfo.model);
    };

    GeomapDelegate.initializeGeomap = function (oGeomap) {
        return new Promise(function (resolve, reject) {
            resolve(oGeomap);
        });
    };

    GeomapDelegate._createContentFromPropertyInfos = function (oGeomap) {
        return new Promise(function (resolve, reject) {
            resolve(oGeomap);
        });
    };

    /**
     * Initializes a new geomap property helper.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Instance of the MDC geomap.
     * @returns {Promise<sap.ui.mdc.geomap.PropertyHelper>} A promise that resolves with the property helper.
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    GeomapDelegate.initPropertyHelper = function (oGeomap) {
        return new Promise(function(resolve){
            resolve(new PropertyHelper([]));
        });
    };

    GeomapDelegate.createInitialGeomapContent = function() {
        //Nothing to do here
    };

    GeomapDelegate.insertItemToGeomap = function() {
        //Nothing to mock here
    };

    return GeomapDelegate;
});