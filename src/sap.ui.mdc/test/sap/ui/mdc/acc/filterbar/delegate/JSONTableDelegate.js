/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/metadata/JSONPropertyInfo",
	"./JSONTableFilterDelegate"
], function (
	Element,
	TableDelegate,
	Column,
	Text,
	Filter,
	FilterOperator,
	JSONPropertyInfo,
	JSONTableFilterDelegate
) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = async (oTable) => {
		const oPayload = oTable.getPayload();
		const sBindingPath = oPayload?.bindingPath;
		const aParts = sBindingPath?.split(">/");
		return JSONPropertyInfo[aParts[1]].filter((oPI) => oPI.key !== "$search");
	};

	JSONTableDelegate.getFilterDelegate = () => JSONTableFilterDelegate;

	const _createColumn = (sId, oPropertyInfo) => {
		return new Column(sId, {
			propertyKey: oPropertyInfo.key,
			header: oPropertyInfo.label,
			template: new Text({
				text: {
					path: "mountains>" + oPropertyInfo.path,
					type: oPropertyInfo.dataType
				}
			})
		});
	};

	JSONTableDelegate.addItem = async (oTable, sPropertyKey) => {
		const aPropertiyInfos = await JSONTableDelegate.fetchProperties(oTable);
		const oPropertyInfo = aPropertiyInfos.find((oPI) => oPI.key === sPropertyKey);
		const sId = oTable.getId() + "---col-" + sPropertyKey;
		return await _createColumn(sId, oPropertyInfo);
	};

	JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
		TableDelegate.updateBindingInfo.call(JSONTableDelegate, oTable, oBindingInfo);
		oBindingInfo.path = oTable.getPayload().bindingPath;

		// add search filter
		const sFilter = oTable.getFilter();
		const oFilterBar = sFilter && Element.getElementById(sFilter);
		const sSearch = oFilterBar?.getSearch();
		if (sSearch) {
			const oPayload = oTable.getPayload();
			const aSearchKeys = oPayload.searchKeys || [];
			const aFilters = [];
			let oSearchFilter;
			aSearchKeys.forEach((sPropertyKey) => {
				aFilters.push(new Filter(sPropertyKey, FilterOperator.Contains, sSearch));
			});
			if (aFilters.length > 1) {
				oSearchFilter = new Filter({
					filters: aFilters,
					and: false
				});
			} else {
				oSearchFilter = aFilters[0];
			}
			if (oBindingInfo.filters?.length > 0) {
				oBindingInfo.filters = new Filter({
					filters: [oBindingInfo.filters, oSearchFilter],
					and: true
				});
			} else {
				oBindingInfo.filters = oSearchFilter;
			}
		}

	};

	return JSONTableDelegate;
});