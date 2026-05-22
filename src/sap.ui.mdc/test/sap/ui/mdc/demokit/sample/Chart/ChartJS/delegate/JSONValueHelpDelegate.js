/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (ValueHelpDelegate, Filter, FilterOperator) {
	"use strict";

	const JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	// Build and inject the sap.m.Table into an MTable content that has no table yet.
	// Called by the framework before the container is shown.
	JSONValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer, sContentId) {
		const aContent = oContainer.getContent();
		const oContent = aContent && aContent[0];

		if (!oContent || !oContent.isA("sap.ui.mdc.valuehelp.content.MTable") || oContent.getTable()) {
			return Promise.resolve();
		}

		const oPayload = oValueHelp.getPayload();
		const bTypeahead = oContainer.isTypeahead();
		const aColumnDefs = oPayload.columns || [];
		const sCollection = oPayload.collectionPath || "/";

		// Split "modelName>/" into model + path for JS binding info
		const iSep = sCollection.indexOf(">");
		const sModel = iSep >= 0 ? sCollection.substring(0, iSep) : undefined;
		const sPath  = iSep >= 0 ? sCollection.substring(iSep + 1) || "/" : sCollection;

		return new Promise(function (fnResolve, fnReject) {
			sap.ui.require([
				"sap/m/Table",
				"sap/m/Column",
				"sap/m/ColumnListItem",
				"sap/m/Label",
				"sap/m/Text",
				"sap/m/library"
			], function (Table, Column, ColumnListItem, Label, Text, mobileLibrary) {
				const sId = oContent.getId() + "-tbl";
				const aColumns = aColumnDefs.map(function (oDef, i) {
					return new Column(sId + "-col" + i, {
						header: new Label(sId + "-col" + i + "-hdr", { text: oDef.header })
					});
				});
				const aCells = aColumnDefs.map(function (oDef, i) {
					return new Text(sId + "-cell" + i, { text: "{" + (sModel ? sModel + ">" : "") + oDef.path + "}" });
				});

				const oTable = new Table(sId, {
					width: bTypeahead ? "25rem" : "100%",
					mode: mobileLibrary.ListMode.MultiSelect,
					columns: aColumns,
					items: {
						path: sPath,
						model: sModel,
						template: new ColumnListItem(sId + "-item", {
							type: "Active",
							cells: aCells
						})
					}
				});

				oContent.setTable(oTable);
				fnResolve();
			}, fnReject);
		});
	};

	JSONValueHelpDelegate.updateBindingInfo = function (oValueHelp, oContent, oBindingInfo) {
		ValueHelpDelegate.updateBindingInfo.apply(this, arguments);

		const oPayload = oValueHelp.getPayload();
		if (oPayload && oPayload.searchKeys) {
			const sSearch = oContent.getSearch();
			if (sSearch) {
				const aFilters = oPayload.searchKeys.map(function (sPath) {
					return new Filter({ path: sPath, operator: FilterOperator.Contains, value1: sSearch, caseSensitive: false });
				});
				oBindingInfo.filters = (oBindingInfo.filters || []).concat(new Filter(aFilters, false));
			}
		}
	};

	JSONValueHelpDelegate.isSearchSupported = function (oValueHelp, oContent) {
		return !!(oValueHelp.getPayload() && oValueHelp.getPayload().searchKeys);
	};

	return JSONValueHelpDelegate;
});
