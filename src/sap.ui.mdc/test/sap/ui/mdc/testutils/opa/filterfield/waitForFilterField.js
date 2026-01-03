/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return function waitForFilterField(oSettings) {
        var oWaitForSettings = {
            controlType: "sap.ui.mdc.FilterField",
            success: function (vFilterFields) {
                var aFilterFields = [].concat(vFilterFields);

                const bHasSpecificMatchers = oSettings.properties || oSettings.matchers || oSettings.id;
                if (!bHasSpecificMatchers) {
                    Opa5.assert.strictEqual(
                        aFilterFields.length,
                        1,
                        "The field was found with settings " +
                            JSON.stringify(oSettings)
                    );
                } else {
                    Opa5.assert.ok(
                        aFilterFields.length >= 1,
                        aFilterFields.length + " field(s) found with settings " +
                            JSON.stringify(oSettings)
                    );
                }

                if (typeof oSettings.success === "function") {
                    var oFilterField = aFilterFields[0];
                    oSettings.success.call(this, oFilterField);
                }
            },
            errorMessage: "The filter field was not found"
        };
        ["id", "properties", "matchers", "actions"].forEach(function (sKey) {
            if (oSettings[sKey]) {
                oWaitForSettings[sKey] = oSettings[sKey];
            }
        });

        return this.waitFor(oWaitForSettings);
    };
});
