
sap.ui.define([
    "sap/ui/mdc/field/FieldBaseDelegate",
    "sap/ui/mdc/odata/TypeMap",
    "sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName"
], function(
    MDCFieldBaseDelegate,
    ODataTypeMap,
    Condition,
    ConditionValidated,
    OperatorName
) {
    "use strict";

    var FieldBaseDelegate = Object.assign({}, MDCFieldBaseDelegate);

    FieldBaseDelegate.getTypeMap = function (oField) {
        return ODataTypeMap;
    };

	FieldBaseDelegate.isInputMatchingText = function(oField, sUserInput, sText, bDescription, bCaseSensitive) {

		const oPayload = oField.getPayload();

		if (oPayload && oPayload.hasOwnProperty("autoCompleteCaseSensitive")) { // ignore configuration of ValueHelp
            if (oPayload.autoCompleteCaseSensitive) {
                return sText.normalize().startsWith(sUserInput.normalize());
            } else {
                return sText.normalize().toLowerCase().startsWith(sUserInput.normalize().toLowerCase());
            }
		}

		return MDCFieldBaseDelegate.isInputMatchingText.apply(this, arguments);

	};

	FieldBaseDelegate.getDefaultValues = function(oField) {

        if (oField?.isA("sap.ui.mdc.FilterField")) {
            switch (oField.getPropertyKey()) {
                case "ProductId":
                    return [
                        Condition.createCondition(OperatorName.EQ, ["214-121-828"], undefined, undefined, ConditionValidated.NotValidated)
                    ];
                case "Name":
                    return [
                        Condition.createCondition(OperatorName.EQ, ["Webcam"], undefined, undefined, ConditionValidated.NotValidated),
                        Condition.createCondition(OperatorName.NE, ["Laptop Case"], undefined, undefined, ConditionValidated.NotValidated),
                        Condition.createCondition(OperatorName.BT, ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated)
                    ];
                case "Description":
                    return [
                        Condition.createCondition(OperatorName.EQ, ["Test Description"], undefined, undefined, ConditionValidated.NotValidated),
                        Condition.createCondition(OperatorName.NE, ["Invalid Description"], undefined, undefined, ConditionValidated.NotValidated),
                        Condition.createCondition(OperatorName.BT, ["A", "Z"], undefined, undefined, ConditionValidated.NotValidated)
                    ];
                case "DateTime":
                    return [
                        Condition.createCondition(OperatorName.EQ, [new Date()], undefined, undefined, ConditionValidated.NotValidated)
                    ];
                case "Date":
                    return [
                        Condition.createCondition(OperatorName.EQ, [new Date()], undefined, undefined, ConditionValidated.NotValidated)
                    ];
                case "Status":
                    return [
                        Condition.createCondition(OperatorName.EQ, ["S1"], undefined, undefined, ConditionValidated.NotValidated)
                    ];
                case "Quantity":
                    return [
                        Condition.createCondition(OperatorName.EQ, [100], undefined, undefined, ConditionValidated.NotValidated)
                    ];
                default:
                    break;
            }
        }

		return [];

	};

	return FieldBaseDelegate;
});