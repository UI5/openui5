/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/ValueHelpDelegate',
	'sap/ui/mdc/valuehelp/content/MTable',
	'sap/ui/mdc/valuehelp/content/FixedList',
	'sap/ui/mdc/valuehelp/content/FixedListItem',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/OperatorValueType',
	'sap/m/Table',
	'sap/m/Column',
	'sap/m/ColumnListItem',
	'sap/m/Text',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function(
	BaseValueHelpDelegate,
	MTable,
	FixedList,
	FixedListItem,
	Condition,
	FilterOperatorUtil,
	ConditionValidated,
	OperatorValueType,
	Table,
	Column,
	ColumnListItem,
	Text,
	JSONModel,
	Filter,
	FilterOperator
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer, sContentId) {
		const aCurrentContent = oContainer?.getContent();
		const oCurrentContent = sContentId && aCurrentContent?.find(function(oContent){ return oContent.getId() === sContentId; });

		if (!oCurrentContent) {
			const oPayload = oValueHelp.getPayload();
			const sListType = oPayload?.listType;
			const oModel = new JSONModel({operators: []});
			let oContent;

			_fillModel(oContainer, oModel);

			if (sListType === "MTable") {
				const bMultiSelect = oValueHelp.getMaxConditions() === -1;

				oContent = new MTable(oContainer.getId() + "-MTable", {
					keyPath: "operator",
					descriptionPath: "text",
					useAsValueHelp: false,
					table: new Table(oContainer.getId() + "-MTable-Table", {
						width: "30rem",
						mode: bMultiSelect ? "MultiSelect" : "SingleSelectMaster",
						columns: [
							new Column(oContainer.getId() + "-MTable-Table-Column-Operator", {header: new Text(oContainer.getId() + "-MTable-Table-Column-Operator-Text", {text: "Operator"})}),
							new Column(oContainer.getId() + "-MTable-Table-Column-Description", {header: new Text(oContainer.getId() + "-MTable-Table-Column-Description-Text", {text: "Description"})})
						],
						items: {
							path: "/operators",
							template: new ColumnListItem(oContainer.getId() + "-MTable-ColumnTemplate", {
								cells: [
									new Text(oContainer.getId() + "-MTable-ColumnTemplate-Operator", {text: "{operator}"}),
									new Text(oContainer.getId() + "-MTable-ColumnTemplate-Description", {text: "{text}"})
								]
							})
						}
					}),
					models: oModel
				});
			} else if (sListType === "FixedList") {
				oContent = new FixedList(oContainer.getId() + "-FixedList", {
					useAsValueHelp: false,
					groupable: true,
					items: {
						path: "/operators",
						template: new FixedListItem(oContainer.getId() + "-FixedList-ItemTemplate", {
							key: "{operator}",
							text: "{text}",
							groupKey: "{groupKey}",
							groupText: "{groupText}"
						})
					},
					models: oModel
				});
			} else {
				throw new Error("Unknown list type: " + sListType);
			}
			oContainer.addContent(oContent);
		}

		return BaseValueHelpDelegate.retrieveContent.apply(this, arguments);
	};

	ValueHelpDelegate.isSearchSupported = function (oValueHelp, oContent, oListBinding) {
		return true;
	};

	function _fillModel(oContainer, oModel) {
		const oFilterField = oContainer.getControl();
		const aOperators = oFilterField?.getOperators();
		const oData = {operators: []};
		if (aOperators) {
			for (let i = 0; i < aOperators.length; i++) {
				const oOperator = FilterOperatorUtil.getOperator(aOperators[i]);
				if (oOperator.useDefaultValues || oOperator.valueTypes.length === 0 || oOperator.valueTypes[0] === OperatorValueType.Static) {
					oData.operators.push({
						operator: oOperator.name,
						text: oOperator.longText,
						groupKey: oOperator.group?.id,
						groupText: oOperator.group?.text
					});
				}
			}
			oModel.setData(oData);
		}

	}

	ValueHelpDelegate.getFilters = function (oValueHelp, oContent) {
		const aFilters = BaseValueHelpDelegate.getFilters.apply(this, arguments) || [];
		const sSearch = oContent.getSearch();

		if (sSearch) {
			const oFilter = new Filter({
				filters: [
					new Filter({path: "text", operator: FilterOperator.StartsWith, value1: sSearch, caseSensitive: false}),
					new Filter({path: "operator", operator: FilterOperator.StartsWith, value1: sSearch, caseSensitive: false})
				], and: false
			});
			aFilters.push(oFilter);
		}

		return aFilters;
	};

	ValueHelpDelegate.createConditionForContext = function (oValueHelp, oContent, oContext) {
		let sOperator;

		if (oContent.isA("sap.ui.mdc.valuehelp.content.MTable")) {
			sOperator = oContext.getProperty("operator");
		} else if (oContent.isA("sap.ui.mdc.valuehelp.content.FixedList")) {
			sOperator = oContext.getProperty("key");
		}

		if (sOperator) {
			const oOperator = FilterOperatorUtil.getOperator(sOperator);
			const oPayload = this.createConditionPayload(oValueHelp, oContent, [], oContext);
			const aValues = [];
			if (oOperator.useDefaultValues) {
				const oField = oContent.getControl();
				const oFieldDelegate = oField.getControlDelegate();
				aValues.push(oFieldDelegate.getDefaultValues(oField));
			}
			return Condition.createCondition(oOperator.name, aValues, undefined, undefined, ConditionValidated.NotValidated, oPayload);
		}

		return BaseValueHelpDelegate.createConditionForContext.apply(this, arguments);
	};

	return ValueHelpDelegate;
});
