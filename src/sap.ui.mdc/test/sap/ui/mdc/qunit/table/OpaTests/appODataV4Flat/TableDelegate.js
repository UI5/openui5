sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/m/ObjectIdentifier",
	"sap/m/ObjectNumber",
	"sap/m/VBox",
	"sap/ui/unified/Currency",
	"sap/ui/mdc/table/ResponsiveColumnSettings"
], function(TableDelegate, Column, Text, ObjectIdentifier, ObjectNumber, VBox, Currency, ResponsiveColumnSettings) {
	"use strict";

	const CustomTableDelegate = Object.assign({}, TableDelegate);

	CustomTableDelegate.fetchProperties = function(oTable) {
		return TableDelegate.fetchProperties.apply(this, arguments).then(function(aProperties) {
			aProperties.forEach(function(oProperty) {
				if (oProperty.key === "Category") {
					oProperty.isActive = true;
				}
			});

			const oProductIdName = {
				key: "ProductID_Name",
				label: "Product Name & Id",
				propertyInfos: ["ProductID", "Name"],
				exportSettings: {
					template: "{0} ({1})"
				}
			};

			const oNoDataCol1 = {
				key: "NoDataCol1",
				label: "NoDataColumn1",
				dataType: "String",
				sortable: false,
				filterable: false
			};

			const oNoDataCol2 = {
				key: "NoDataCol2",
				label: "NoDataColumn2",
				dataType: "String",
				sortable: false,
				filterable: false
			};

			aProperties.push(oProductIdName, oNoDataCol1, oNoDataCol2);

			return aProperties;
		});
	};

	CustomTableDelegate.addItem = function(oTable, sPropertyName, mPropertyBag) {
		const oPropertyHelper = oTable.getPropertyHelper();
		const oProperty = oPropertyHelper.getProperty(sPropertyName);

		if (oProperty.isComplex()) {
			return this._createComplexColumn(sPropertyName, oTable);
		}

		return this._createSimpleColumn(oTable, oProperty);
	};

	CustomTableDelegate._createSimpleColumn = function(oTable, oProperty) {
		const sKey = oProperty.key;
		const sPath = oProperty.path;
		const sHeader = oProperty.label;
		let oTemplate;
		let sHAlign;
		let sImportance;

		if (sKey === "ProductID") {
			oTemplate = new ObjectIdentifier({title: "{" + sPath + "}"});
			sImportance = "High";
		} else if (oProperty.unit) {
			const sUnitPath = oTable.getPropertyHelper().getProperty(oProperty.unit).path;
			if (oProperty.key === "Price") {
				oTemplate = new Currency({value: "{" + sPath + "}", currency: "{" + sUnitPath + "}"});
				sHAlign = "Right";
				sImportance = "High";
			} else {
				oTemplate = new ObjectNumber({number: "{" + sPath + "}", unit: "{" + sUnitPath + "}"});
				sHAlign = "End";
				sImportance = "Low";
			}
		} else if (sKey === "SupplierName") {
			oTemplate = new Text({text: "{" + sPath + "}"});
			sImportance = "Medium";
		} else {
			oTemplate = new Text({text: "{" + sPath + "}"});
			sImportance = "Low";
		}

		const oColumn = new Column(oTable.getId() + "--" + sKey, {
			header: sHeader,
			propertyKey: sKey,
			template: oTemplate,
			hAlign: sHAlign
		});

		if (sImportance) {
			oColumn.setExtendedSettings(new ResponsiveColumnSettings({importance: sImportance}));
		}

		return Promise.resolve(oColumn);
	};

	CustomTableDelegate._createComplexColumn = function(sPropertyInfoName, oTable) {
		return oTable.awaitPropertyHelper().then(function(oPropertyHelper) {
			const oPropertyInfo = oPropertyHelper.getProperty(sPropertyInfoName);

			if (!oPropertyInfo) {
				return null;
			}

			return this._createComplexColumnTemplate(oPropertyInfo).then(function(oTemplate) {
				const sPropertyName = oPropertyInfo.key;
				const oColumnInfo = {
					header: oPropertyInfo.label,
					tooltip: oPropertyInfo.label,
					propertyKey: sPropertyName,
					template: oTemplate
				};
				return new Column(oTable.getId() + "--" + sPropertyName, oColumnInfo);
			});
		}.bind(this));
	};

	CustomTableDelegate._createComplexColumnTemplate = function(oPropertyInfo) {
		const oVBox = new VBox({
			renderType: "Bare"
		});

		oPropertyInfo.getSimpleProperties().forEach(function(oSimplePropertyInfo) {
			const oText = new Text({
				text: {
					path: oSimplePropertyInfo.path
				}
			});
			oVBox.addItem(oText);
		});

		return Promise.resolve(oVBox);
	};

	return CustomTableDelegate;
});