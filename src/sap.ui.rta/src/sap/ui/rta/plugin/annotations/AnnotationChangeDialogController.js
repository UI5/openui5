
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Select",
	"sap/m/Switch",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/layout/form/FormElement",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/plugin/annotations/AnnotationTypes",
	"sap/ui/rta/util/validateText"
], function(
	Input,
	Label,
	Select,
	Switch,
	Controller,
	Element,
	Item,
	FormElement,
	Filter,
	FilterOperator,
	AnnotationTypes,
	validateText
) {
	"use strict";

	/**
	 * @class Controller for the AnnotationChangeDialog.
	 * @extends sap.ui.core.mvc.Controller
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.132
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const AnnotationChangeDialogController = Controller.extend("sap.ui.rta.plugin.annotations.AnnotationChangeDialogController");

	AnnotationChangeDialogController.prototype.initialize = function() {
		return new Promise((resolve) => {
			this._fnResolveAfterClose = resolve;
		});
	};

	AnnotationChangeDialogController.prototype.filterProperties = function(sQuery, bEquals) {
		const aFilters = [];
		if (sQuery && sQuery.length > 0) {
			const sOperator = bEquals ? FilterOperator.EQ : FilterOperator.Contains;
			const oLabelFilter = new Filter("label", sOperator, sQuery);
			const oValueFilter = new Filter("currentValue", sOperator, sQuery);
			const oCombinedFilter = new Filter({
				filters: [oLabelFilter, oValueFilter],
				and: false
			});
			aFilters.push(oCombinedFilter);
		}

		const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
		const oBinding = oList.getBinding("formElements");
		oBinding.filter(aFilters);
	};

	AnnotationChangeDialogController.prototype.onFilterProperties = function(oEvent) {
		const sQuery = oEvent.getSource().getValue();
		this.filterProperties(sQuery);
	};

	AnnotationChangeDialogController.prototype.switchDisplayMode = function(oEvent) {
		const bShowChangedPropertiesOnly = oEvent.getParameter("state");
		const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
		const oModel = oList.getModel();
		oModel.setProperty("/showChangedPropertiesOnly", bShowChangedPropertiesOnly);

		if (bShowChangedPropertiesOnly) {
			const aOriginallyChangedProperties = oModel.getProperty("/changedProperties");
			const aAllChangedProperties = oModel.getProperty("/properties").filter((oProperty) => (
				aOriginallyChangedProperties.some((oOriginallyChangedProperty) => (
					oOriginallyChangedProperty.annotationPath === oProperty.annotationPath
				))
				|| oProperty.originalValue !== oProperty.currentValue
			));
			oModel.setProperty("/propertiesToDisplay", aAllChangedProperties);
		} else {
			oModel.setProperty("/propertiesToDisplay", oModel.getProperty("/properties"));
		}
	};

	AnnotationChangeDialogController.prototype.onSave = function(oEvent) {
		const oModelData = oEvent.getSource().getModel().getData();
		const aChanges = oModelData.properties
		.map((oProperty) => {
			if (oProperty.originalValue === oProperty.currentValue) {
				return null;
			}
			const oChangeSpecificData = {
				serviceUrl: oModelData.serviceUrl,
				content: {
					annotationPath: oProperty.annotationPath
				}
			};
			oChangeSpecificData.content[oModelData.valueType === AnnotationTypes.StringType ? "text" : "value"] =
			oModelData.objectAsKey ? JSON.parse(oProperty.currentValue) : oProperty.currentValue;
			return oChangeSpecificData;
		})
		.filter(Boolean);

		this._fnResolveAfterClose(aChanges);
	};

	AnnotationChangeDialogController.prototype.onCancel = function() {
		this._fnResolveAfterClose([]);
	};

	AnnotationChangeDialogController.prototype._validateInput = function(oInput, sNewValue, sOldValue) {
		const oModel = oInput.getModel();
		if (!oModel) {
			return false;
		}
		const aValidators = oModel.getProperty("/validators");
		const bSingleRename = oModel.getProperty("/singleRename");
		let bHasError = false;
		try {
			// Run other validators first (passing null as old value skips the sameTextError check).
			// Only surface sameTextError as a field-level error in single-rename mode — with multiple
			// input fields, an unchanged value must not be marked as error on the input itself.
			validateText(sNewValue, null, { validators: aValidators });
			if (bSingleRename) {
				validateText(sNewValue, sOldValue, { validators: aValidators });
			}
			oInput.setValueState("None");
			oInput.setValueStateText("");
		} catch (oError) {
			oInput.setValueState("Error");
			oInput.setValueStateText(oError.message);
			bHasError = true;
		}
		return bHasError;
	};

	AnnotationChangeDialogController.prototype._updateSaveEnabled = function(oModel, mPropertyBag) {
		const [bWasError, bHasError, bWasChanged, bIsChanged] = [
			mPropertyBag.wasError,
			mPropertyBag.hasError,
			mPropertyBag.wasChanged,
			mPropertyBag.isChanged
		];
		// avoid counting existing errors multiple times
		if (bHasError !== bWasError) {
			oModel.setProperty("/errorCount", oModel.getProperty("/errorCount") + (bHasError ? 1 : -1));
		}
		// track changed-vs-original transitions so we can disable save in multi-rename mode
		// when nothing actually differs from the original values
		if (bIsChanged !== bWasChanged) {
			oModel.setProperty("/changedCount", oModel.getProperty("/changedCount") + (bIsChanged ? 1 : -1));
		}
		const bNoErrors = oModel.getProperty("/errorCount") === 0;
		const bSingleRename = oModel.getProperty("/singleRename");
		const bHasChanges = bSingleRename || oModel.getProperty("/changedCount") > 0;
		oModel.setProperty("/isSaveEnabled", bNoErrors && bHasChanges);
	};

	function createEditorField(sValueType) {
		if (sValueType === AnnotationTypes.ValueListType) {
			const oSelect = new Select({
				selectedKey: {
					path: "currentValue",
					mode: "OneWay"
				},
				change: (oEvent) => {
					const oSource = oEvent.getSource();
					const oContext = oSource.getBindingContext();
					const oModel = oSource.getModel();
					const sOriginalValue = oContext.getProperty("originalValue");
					const sNewKey = oEvent.getParameter("selectedItem").getKey();
					const mPropertyBag = {
						wasError: false,
						hasError: false,
						wasChanged: oContext.getProperty("currentValue") !== sOriginalValue,
						isChanged: sNewKey !== sOriginalValue
					};
					oModel.setProperty("currentValue", sNewKey, oContext);
					this._updateSaveEnabled(oModel, mPropertyBag);
				}
			});

			const oItemTemplate = new Item({
				key: "{key}",
				text: "{text}"
			});

			oSelect.bindItems({
				path: "/possibleValues",
				template: oItemTemplate,
				templateShareable: false
			});

			return oSelect;
		}

		if (sValueType === AnnotationTypes.StringType) {
			return new Input({
				value: "{currentValue}",
				liveChange: (oEvent) => {
					const oSource = oEvent.getSource();
					const oContext = oSource.getBindingContext();
					const oModel = oSource.getModel();
					const sInputValue = oEvent.getParameter("newValue").trim();
					const sNewText = sInputValue.length ? sInputValue : "\xa0";
					const sOriginalValue = oContext.getProperty("originalValue");
					const mPropertyBag = {};
					mPropertyBag.wasChanged = oContext.getProperty("currentValue") !== sOriginalValue;
					oModel.setProperty("currentValue", sNewText, oContext);
					mPropertyBag.isChanged = sNewText !== sOriginalValue;
					mPropertyBag.wasError = oSource.getValueState() === "Error";
					mPropertyBag.hasError = this._validateInput(oSource, sNewText, sOriginalValue);
					this._updateSaveEnabled(oModel, mPropertyBag);
				}
			});
		}

		if (sValueType === AnnotationTypes.BooleanType) {
			return new Switch({
				state: {
					path: "currentValue",
					mode: "OneWay"
				},
				change: (oEvent) => {
					const oSource = oEvent.getSource();
					const oContext = oSource.getBindingContext();
					const oModel = oSource.getModel();
					const bOriginalValue = oContext.getProperty("originalValue");
					const bNewState = oEvent.getParameter("state");
					const mPropertyBag = {
						wasError: false,
						hasError: false,
						wasChanged: oContext.getProperty("currentValue") !== bOriginalValue,
						isChanged: bNewState !== bOriginalValue
					};
					oModel.setProperty("currentValue", bNewState, oContext);
					this._updateSaveEnabled(oModel, mPropertyBag);
				}
			});
		}

		throw new Error(`Unsupported value type: ${sValueType}`);
	}

	AnnotationChangeDialogController.prototype.editorFactory = function(sId, oContext) {
		const sValueType = oContext.getProperty("/valueType");
		const bSingleRename = oContext.getProperty("/singleRename");

		return new FormElement({
			id: sId,
			label: new Label({
				text: bSingleRename ? "{i18n>ANNOTATION_CHANGE_DIALOG_SINGLE_RENAME_LABEL}" : "{= ${label} || ${propertyName}}",
				tooltip: "{tooltip}"
			}),
			fields: [
				createEditorField.call(this, sValueType)
			]
		});
	};

	return AnnotationChangeDialogController;
});