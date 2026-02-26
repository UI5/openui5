sap.ui.define([
	"./GridTable.delegate",
	"./Authors.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/MultiValueField",
	"sap/ui/mdc/field/MultiValueFieldItem",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	"delegates/util/DelegateCache"
], function (ODataTableDelegate, AuthorsFBDelegate, Field, MultiValueField, MultiValueFieldItem, FieldDisplay, FieldEditMode, DelegateCache) {
	"use strict";

	var AuthorsTableDelegate = Object.assign({}, ODataTableDelegate);

	AuthorsTableDelegate.fetchProperties = function (oTable) {
		const oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);

		const oFilterSettings = {
			"name": { "valueHelp": "fhName" },
			"dateOfBirth": { "valueHelp": "fhAdob", "operators": ["RENAISSANCE", "MEDIEVAL", "MODERN", "CUSTOMRANGE", "NOTINRANGE"] },
			"dateOfDeath": {maxConditions: 1},
			"cityOfOrigin_city": { "valueHelp": "IOFFVHCity", "display": FieldDisplay.ValueDescription},
			"countryOfOrigin_code": { "valueHelp": "IOFFVHCountry", "display": FieldDisplay.ValueDescription},
			"regionOfOrigin_code": { "valueHelp": "IOFFVHRegion", "display": FieldDisplay.ValueDescription}
		};

		return oODataProps.then(function (aProperties) {
			if (!aProperties.find(function(oProperty) { return oProperty.key === "genres"; } ) ) {
				aProperties.push({
					key: "genres",
					label: "Genres",
					groupLabel: "none",
					dataType: "Edm.String",
					constraints: {maxLength: 1111},
					sortable: false,
					filterable: false
				});
			}

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the ValueHelp for some of the properties. Without ValueHelp the filter panel will not provide the expected VH.
			// TODO ValueHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oProperty) {
				if (oProperty.key === "ID") {
					// oProperty.dataType = new Int32Type({groupingEnabled: false}, {nullable: false});
					oProperty.formatOptions = {groupingEnabled: false};
					oProperty.constraints.nullable = false;
				} else if (oProperty.key === "countryOfOrigin/name") {
					oProperty.path = "countryOfOrigin/descr";
				} else if (oProperty.key === "countryOfOrigin_code") {
					oProperty.visible = false;
				} else if (oProperty.key === "regionOfOrigin_code") {
					oProperty.visible = false;
				} else if (oProperty.key === "cityOfOrigin_city") {
					oProperty.visible = false;
				} else if (oProperty.key === "countryOfOrigin_code_ComplexWithText") {
					oProperty.label = oProperty.label.split(" + ")[0];
				} else if (oProperty.key === "regionOfOrigin_code_ComplexWithText") {
					oProperty.label = oProperty.label.split(" + ")[0];
				} else if (oProperty.key === "cityOfOrigin_city_ComplexWithText") {
					oProperty.label = oProperty.label.split(" + ")[0];
				} else if (oProperty.key === "createdAt") {
					oProperty.maxConditions = 1;
				}

				if (oProperty.maxConditions === -1 ) {
					const oCurrentSettings = DelegateCache.get(oTable, oProperty.key) || oFilterSettings[oProperty.key] || {};
					if (!oCurrentSettings.valueHelp) {
						oFilterSettings[oProperty.key] = {...oCurrentSettings, valueHelp: "FVH_Generic_Multi"};
					}
				}
			});

			DelegateCache.add(oTable, oFilterSettings, "$Filters");
			DelegateCache.add(oTable, {
				"countryOfOrigin_code_ComplexWithText": {display: FieldDisplay.Description},
				"regionOfOrigin_code_ComplexWithText": {display: FieldDisplay.Description},
				"cityOfOrigin_city_ComplexWithText": {display: FieldDisplay.Description},
				"genres": {"valueHelp": "VHGenre", "display": FieldDisplay.Description}
			}, "$Columns");

			return aProperties;
		});
	};

	AuthorsTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(oTable, sPropertyName) {
				return AuthorsFBDelegate.addItem(oTable, sPropertyName)
				.then(function(oFilterField) {

					const oProp = oTable.getPropertyHelper().getProperty(sPropertyName);

					const oConstraints = oProp.typeConfig.typeInstance.getConstraints();
					const oFormatOptions = oProp.typeConfig.typeInstance.getFormatOptions();

					oFilterField.setDataTypeConstraints(oConstraints);
					oFilterField.setDataTypeFormatOptions(oFormatOptions);

					return oFilterField;
				});
			}
		};
	};

	AuthorsTableDelegate._createColumnTemplate = function (oTable, oProperty) {

		let oValueBindingInfo;
		let oAdditionalValueBindingInfo;
		let sDisplay = FieldDisplay.Value;

		if (oProperty.key.endsWith("_ComplexWithText")) {
			// get single properties
			const aProperties = oProperty.getSimpleProperties();
			const oKeyProperty = aProperties[0];
			const oDescriptionProperty = aProperties[1];

			if (oKeyProperty) {
				oValueBindingInfo = {path: oKeyProperty.path || oKeyProperty.key, type: oKeyProperty.typeConfig.typeInstance};
			}
			if (oDescriptionProperty) {
				oAdditionalValueBindingInfo = {path: oDescriptionProperty.path || oDescriptionProperty.key, type: oDescriptionProperty.typeConfig.typeInstance};
			}

			if (oProperty.exportSettings.template === "{0} ({1})") {
				sDisplay = FieldDisplay.ValueDescription;
			} else if (oProperty.exportSettings.template === "{1} ({0})") {
				sDisplay = FieldDisplay.DescriptionValue;
			} else if (oProperty.exportSettings.template === "{1}") {
				sDisplay = FieldDisplay.Description;
			}
		} else if (oProperty.key === "genres") {
			const oItem = new MultiValueFieldItem("F_" + oProperty.key + "_item", {
				key: {path: "genre/code", type: oProperty.typeConfig.typeInstance}
			});
			const oCtrlProperties = DelegateCache.merge({
				id: "F_" + oProperty.key,
				items: {path: oProperty.path || oProperty.key, template: oItem, templateShareable: false},
				editMode: FieldEditMode.Display,
				width:"100%",
				multipleLines: false, // set always to have property not initial,
				display: sDisplay,
				delegate: {name: 'delegates/odata/v4/MultiValueFieldDelegate', payload: {}}
			}, DelegateCache.get(oTable, oProperty.key, "$Columns"));
			return new MultiValueField(oCtrlProperties);
		} else {
			oValueBindingInfo = {path: oProperty.path || oProperty.key, type: oProperty.typeConfig.typeInstance};
		}

		const oCtrlProperties = DelegateCache.merge({
			id: "F_" + oProperty.key,
			value: oValueBindingInfo,
			additionalValue: oAdditionalValueBindingInfo,
			editMode: FieldEditMode.Display,
			width:"100%",
			multipleLines: false, // set always to have property not initial,
			display: sDisplay,
			delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}
		}, DelegateCache.get(oTable, oProperty.key, "$Columns"));

		return new Field(oCtrlProperties);
	};

	AuthorsTableDelegate.addItem = function (oTable, sPropertyName, mPropertyBag) {
		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			if (oColumn) { // while XML templating phase no Column is returned
				const oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

				// oColumn.getTemplate().destroy();
				// if (oColumn._oTemplateClone) {
				// 	oColumn._oTemplateClone.destroy();
				// 	delete oColumn._oTemplateClone;
				// }

				if (!oProperty.key.endsWith("_ComplexWithUnit")) {
					const oTemplate = AuthorsTableDelegate._createColumnTemplate(oTable, oProperty);
					oColumn.setTemplate(oTemplate);
				}
			}

			return oColumn;
		});
	};

	return AuthorsTableDelegate;
});
