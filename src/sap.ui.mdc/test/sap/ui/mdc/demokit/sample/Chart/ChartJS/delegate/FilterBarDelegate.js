
/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
    "sap/ui/mdc/FilterBarDelegate",
    "sap/ui/mdc/FilterField",
    "sap/ui/core/Element",
    "sap/ui/core/mvc/View"
], function (FilterBarDelegate, FilterField, Element, View) {
    "use strict";

    const FilterBarChartSampleDelegate = Object.assign({}, FilterBarDelegate);

    // String fields that get a ValueHelp (keyPath matches the property key in the view)
    const aStringFields = ["Name", "Category", "Status", "SupplierName"];

    FilterBarChartSampleDelegate.fetchProperties = function (oFilterBar) {
        const oPayload = oFilterBar.getDelegate().payload;
        const oModel = oFilterBar.getModel(oPayload.infomodel);

        if (!oModel) {
            return Promise.resolve([]);
        }

        const aModelInfos = oModel.getData();
        const aProperties = aModelInfos.filter(function (oInfo) {
            return oInfo.filterable;
        }).map(function (oInfo) {
            return {
                key: oInfo.key,
                path: oInfo.path,
                label: oInfo.label,
                dataType: oInfo.dataType,
                maxConditions: -1
            };
        });

        return Promise.resolve(aProperties);
    };

    FilterBarChartSampleDelegate.addItem = function (oFilterBar, sPropertyKey) {
        const oProperty = oFilterBar.getPropertyHelper().getProperty(sPropertyKey);
        if (!oProperty) {
            return Promise.resolve(null);
        }
        const sId = oFilterBar.getId() + "--filter--" + sPropertyKey;
        // reuse existing field if it was already created
        const oExisting = Element.getElementById(sId);
        if (oExisting) {
            return Promise.resolve(oExisting);
        }
        const oFilterField = new FilterField(sId, {
            delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate" },
            label: oProperty.label,
            conditions: "{$filters>/conditions/" + sPropertyKey + "}",
            propertyKey: sPropertyKey,
            dataType: oProperty.dataType
        });
        if (aStringFields.indexOf(sPropertyKey) !== -1) {
            oFilterField.setOperators(["EQ"]);
            const oView = _getView(oFilterBar);
            if (oView) {
                oFilterField.setValueHelp(oView.createId("VH-" + sPropertyKey));
            }
        }
        return Promise.resolve(oFilterField);
    };

    FilterBarChartSampleDelegate.removeItem = function (oFilterBar, oFilterField) {
        oFilterField.destroy();
        return Promise.resolve(true);
    };

    function _getView(oControl) {
        if (oControl instanceof View) {
            return oControl;
        }
        if (oControl && typeof oControl.getParent === "function") {
            return _getView(oControl.getParent());
        }
        return undefined;
    }

    return FilterBarChartSampleDelegate;
});
