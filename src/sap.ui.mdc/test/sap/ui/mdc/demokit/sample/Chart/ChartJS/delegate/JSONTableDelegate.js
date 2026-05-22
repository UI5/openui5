/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (TableDelegate, Filter, FilterOperator) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = function (oTable) {
		const oPayload = oTable.getPayload();
		// Build minimal property infos from the column definitions so the table
		// can render without an OData metadata service.
		const aColumns = oTable.getColumns();
		const aProperties = aColumns.map(function (oCol) {
			const sKey = oCol.getPropertyKey();
			return {
				key: sKey,
				path: sKey,
				label: oCol.getHeader(),
				dataType: "sap.ui.model.type.String",
				sortable: true,
				filterable: false
			};
		});

		// Add any extra keys from searchKeys that may not be columns
		if (oPayload && oPayload.searchKeys) {
			oPayload.searchKeys.forEach(function (sKey) {
				if (!aProperties.find(function (p) { return p.key === sKey; })) {
					aProperties.push({ key: sKey, path: sKey, label: sKey, dataType: "sap.ui.model.type.String", sortable: false, filterable: false });
				}
			});
		}

		return Promise.resolve(aProperties);
	};

	JSONTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		const oPayload = oTable.getPayload();
		if (oPayload && oPayload.collectionPath) {
			// Split "modelName>/" notation into separate model and path for binding info objects
			const sCollection = oPayload.collectionPath;
			const iSep = sCollection.indexOf(">");
			if (iSep >= 0) {
				oBindingInfo.model = sCollection.substring(0, iSep);
				oBindingInfo.path = sCollection.substring(iSep + 1) || "/";
			} else {
				oBindingInfo.path = sCollection;
			}
		}
	};

	return JSONTableDelegate;
});
