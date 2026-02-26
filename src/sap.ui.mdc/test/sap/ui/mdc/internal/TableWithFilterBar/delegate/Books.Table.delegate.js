sap.ui.define([
	"./GridTable.delegate",
	"./Books.FB.delegate",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"delegates/odata/v4/util/DelegateUtil",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/String",
	"sap/m/Text",
	"sap/ui/mdc/enums/FilterBarValidationStatus",
	'delegates/util/DelegateCache'
], function (ODataTableDelegate, BooksFBDelegate, Field, Link, FieldDisplay, FieldEditMode, OperatorName, DelegateUtil, CurrencyType, DecimalType, StringType, Text, FilterBarValidationStatus, DelegateCache) {
	"use strict";
	var BooksTableDelegate = Object.assign({}, ODataTableDelegate);
	var getFullId = function(oControl, sVHId) {
		var oView = oControl.getParent();
		while (!oView.isA("sap.ui.core.mvc.View")) {
			oView = oView.getParent();
		}
		return oView.getId() + "--" + sVHId;
	};

	BooksTableDelegate.fetchProperties = function (oTable) {
		var oODataProps = ODataTableDelegate.fetchProperties.apply(this, arguments);
		// url-param sap-ui-xx-p13n-hide-descriptions
		const hideDescriptionsParam = window.location.search.includes("sap-ui-xx-p13n-hide-descriptions=true");

		return oODataProps.then(function(aProperties) {

			// Provide the label for the properties which are the same on the xml view. so that the column header and p13n dialog has the same names.
			// Provide the ValueHelp for some of the properties. Without ValueHelp the filter panel will not provide the expected VH.
			// TODO ValueHelp is not a supported property of the table propertyHelper and we will get warning logn in the console.
			aProperties.forEach(function(oProperty) {
				if (oProperty.key === "title") {
					oProperty.caseSensitive = false;
				}
				if (oProperty.key === "subgenre_code") {
					oProperty.label = "Sub Genre";
					oProperty.visualSettings = {widthCalculation: {maxWidth: 10}}; // as Text is normally short
				}
				if (oProperty.key === "genre_code") {
					oProperty.visualSettings = {widthCalculation: {maxWidth: 10}}; // as Text is normally short
				}

				if (oProperty.key === "ID" || oProperty.key === "author_ID") {
					oProperty.dataType = "Edm.Int32";
					oProperty.constraints = {nullable: false};
					oProperty.formatOptions = {groupingEnabled: false}; // needed for FilterField on settings-FilterBar
					oProperty.visualSettings = {widthCalculation: {minWidth: 15}}; // as the Name is shown too
				} else if (oProperty.key === "descr") {
					oProperty.visualSettings = {widthCalculation: {minWidth: 40}};
				}


				if (hideDescriptionsParam) {
					// relevant for showing the hideDescription feature of the SelectionPanel
					if (oProperty.key === "subgenre_code") {
						oProperty.visible = true;
					}
					// relevant for showing the hideDescription feature of the SelectionPanel
					if (oProperty.key === "genre_code") {
						oProperty.text = "subgenre_code";
					}
				}

			});

			aProperties.push(...[{
				key: "author/name",
				path: "author/name",
				label: "Name",
				dataType: "Edm.String"
			}, {
				key: "author_ID_ComplexWithText",
				label: "Author ID + Text",
				propertyInfos: ["author_ID", "author/name"],
				exportSettings: {
					template: "{0} ({1})"
				}
			}]);

			DelegateCache.add(oTable, {
				"author_ID": {valueHelp: "FH1", display: FieldDisplay.Description},
				"title": {valueHelp: "FH4"},
				"published": {valueHelp: "FHPublished", operators: [OperatorName.EQ, OperatorName.GT, OperatorName.LT, OperatorName.BT, "MEDIEVAL", "RENAISSANCE", "MODERN", OperatorName.LASTYEAR]},
				"language_code": {dataTypeConstraints: {nullable: false, maxLength: 3}, valueHelp: "FHLanguage", maxConditions: 1, display: FieldDisplay.Description},
				"stock": {maxConditions: 1, operators: [OperatorName.BT]},
				"classification_code": {valueHelp: "FHClassification", display: FieldDisplay.Description},
				"genre_code": {valueHelp: "FHGenre", display: FieldDisplay.Description},
				"subgenre_code": {valueHelp: "FHSubGenre", display: FieldDisplay.Description},
				"detailgenre_code": {valueHelp: "FHDetailGenre", display: FieldDisplay.Description},
				"currency_code": {valueHelp: "FH-Currency", display: FieldDisplay.Value, maxConditions: 1, operators: [OperatorName.EQ]},
				"createdAt": {maxConditions: 1, operators: ["MYDATE", "MYDATERANGE", OperatorName.EQ, OperatorName.GE, OperatorName.LE, OperatorName.BT, OperatorName.LT, OperatorName.TODAY, OperatorName.YESTERDAY, OperatorName.TOMORROW, OperatorName.LASTDAYS, "MYNEXTDAYS", OperatorName.THISWEEK, OperatorName.THISMONTH, OperatorName.THISQUARTER, OperatorName.THISYEAR, OperatorName.NEXTHOURS, OperatorName.NEXTMINUTES, OperatorName.LASTHOURS]}
			}, "$Filters");

			DelegateCache.add(oTable, {
				"descr": {multipleLines: true},
				"author_ID_ComplexWithText": {multipleLines: true, display: FieldDisplay.DescriptionValue},
				"classification_code": {display: FieldDisplay.Description, additionalValue: "{classification/title}"},
				"detailgenre_code": {display: FieldDisplay.Description, additionalValue: "{detailgenre/title}"},
				"language_code": {display: FieldDisplay.Description, additionalValue: "{language/name}", valueHelp: "FHLanguage"},
				"genre_code": {display: FieldDisplay.Description, valueHelp: "FHGenreSingle"},
				"subgenre_code": {display: FieldDisplay.Description, valueHelp: "FHSubGenreSingle"},
				"title": {multipleLines: true}
			}, "$Columns");

			return aProperties;
		});
	};

	BooksTableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(oTable, sPropertyName) {
				return BooksFBDelegate.addItem(oTable, sPropertyName)
				.then(function(oFilterField) {

					var oProp = oTable.getPropertyHelper().getProperty(sPropertyName);

					var oConstraints = oProp.typeConfig.typeInstance.getConstraints();
					var oFormatOptions = oProp.typeConfig.typeInstance.getFormatOptions();

					oFilterField.setDataTypeConstraints(oConstraints);
					oFilterField.setDataTypeFormatOptions(oFormatOptions);

					return oFilterField;
				});
			},
			determineValidationState: function(oFilterBar, mValidation) {
				const oFilterBarConditions = oFilterBar.getConditions();
				const sCurrencyConditionName = "currency_code";
				const sPriceConditionName = "price";

				const bPriceConditionPresent = !!oFilterBarConditions?.[sPriceConditionName]?.length,
					bCurrencyConditionPresent = !!oFilterBarConditions[sCurrencyConditionName]?.length;

				const oPriceFilterField = oFilterBar.getFilterItems().find((oFilterItem) => oFilterItem.getPropertyKey() === sPriceConditionName);

				if (!bPriceConditionPresent || (bPriceConditionPresent && bCurrencyConditionPresent)) {
					oPriceFilterField?.setValueState("None");
					oPriceFilterField?.setValueStateText();
				}

				if (bPriceConditionPresent && !bCurrencyConditionPresent) {
					oPriceFilterField?.setValueState("Error");
					oPriceFilterField?.setValueStateText("Please select a Currency!");

					return FilterBarValidationStatus.RequiredHasNoValue;
				}

				return oFilterBar.checkFilters();
			}
		};
	};

	BooksTableDelegate._createColumnTemplate = function (oTable, oProperty) {

		if (oProperty.key === "currency_code") { // Just use text to test rendering Text vs Field
			return new Text(getFullId(oTable, "T_" + oProperty.key), {
				text: {path: oProperty.path || oProperty.key, type: oProperty.typeConfig.typeInstance},
				width:"100%"
			});
		}

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
		} else {
			oValueBindingInfo = {path: oProperty.path || oProperty.key, type: oProperty.typeConfig.typeInstance};
		}

		var oCtrlProperties = DelegateCache.merge({
			id: getFullId(oTable, "F_" + oProperty.key),
			value: oValueBindingInfo,
			additionalValue: oAdditionalValueBindingInfo,
			editMode: FieldEditMode.Display,
			width:"100%",
			multipleLines: false, // set always to have property not initial
			display: sDisplay,
			delegate: {name: 'delegates/odata/v4/FieldBaseDelegate', payload: {}}
		}, DelegateCache.get(oTable, oProperty.key, "$Columns"));

		if (oProperty.key === "price") {
			oCtrlProperties.value = {
				parts: [
					{path:'price', type: new DecimalType(undefined, {precision: 9, scale: 2})},
					{path:'currency_code', type: new StringType(undefined, {maxLength: 3})},
					{path:'/##@@requestCurrencyCodes', mode:'OneTime', targetType:'any'}
				],
				type: new CurrencyType(),
				mode:'TwoWay'
			};
		}  else if (oProperty.key === "title") {
			oCtrlProperties.fieldInfo = new Link({
					sourceControl:"tFieldLinkTitle",
					delegate: {
						name: "sap/ui/mdc/ushell/LinkDelegate",
						payload: {
							semanticObjects: ["FakeFlpSemanticObject"],
							mainSemanticObject: "FakeFlpSemanticObject"
						}
					}
				});
		} else if (oProperty.key === "author_ID_ComplexWithText") {
			oCtrlProperties.fieldInfo = new Link({
				delegate: { name: "sap/ui/v4demo/delegate/Books.Link.delegate" }
			});
		}

		return new Field(oCtrlProperties);
	};

	BooksTableDelegate.addItem = function (oTable, sPropertyName, mPropertyBag) {

//		if (sPropertyName === "createdAt") {
//			return null;
//		}

		return ODataTableDelegate.addItem.apply(this, arguments).then(function (oColumn) {
			if (oColumn) { // in XML templating there is no column
				var oProperty = oTable.getPropertyHelper().getProperty(sPropertyName);

				if (!oProperty.key.endsWith("_ComplexWithUnit")) {
					var oTemplate = BooksTableDelegate._createColumnTemplate(oTable, oProperty);
					oColumn.setTemplate(oTemplate);
				}
			}

			return oColumn;
		});
	};


	BooksTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		ODataTableDelegate.updateBindingInfo.apply(this, arguments);

		// always select fields needed as InParameters (only if corresponding field displayed?)
		oBindingInfo.parameters.$select = ["classification_code", "genre_code"]; // Comment this out to test late loading of InParameters

	};

	return BooksTableDelegate;
});
