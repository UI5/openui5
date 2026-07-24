
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
	"sap/ui/rta/plugin/annotations/AnnotationTypes"
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
	AnnotationTypes
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

	function onSave(oEvent) {
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
	}

	AnnotationChangeDialogController.prototype.onSave = function(oEvent) {
		onSave.call(this, oEvent);
	};

	AnnotationChangeDialogController.prototype.onCancel = function() {
		this._fnResolveAfterClose([]);
	};

	function createEditorField(sValueType, bSingleFieldRename) {
		if (sValueType === AnnotationTypes.ValueListType) {
			const oSelect = new Select({
				selectedKey: "{currentValue}"
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
				// In single-field-rename mode exactly one field is displayed, so it carries a stable ID
				// that _openDialog uses to focus it. Multi-field dialogs keep auto-generated IDs.
				id: bSingleFieldRename ? "sapUiRtaChangeAnnotationDialog_singleRenameField" : undefined,
				value: "{currentValue}",
				liveChange: (oEvent) => {
					const sValue = oEvent.getParameter("newValue");
					const oContext = oEvent.getSource().getBindingContext();
					oEvent.getSource().getModel().setProperty("currentValue", sValue, oContext);
				},
				// The Enter key triggers the save action for a single field rename, mirroring the RenameDialog.
				submit: bSingleFieldRename ? onSave.bind(this) : () => {}
			});
		}

		if (sValueType === AnnotationTypes.BooleanType) {
			return new Switch({
				state: "{currentValue}"
			});
		}

		throw new Error(`Unsupported value type: ${sValueType}`);
	}

	AnnotationChangeDialogController.prototype.editorFactory = function(sId, oContext) {
		const sValueType = oContext.getProperty("/valueType");
		const bSingleFieldRename = !!oContext.getProperty("/singleFieldRename");

		return new FormElement({
			id: sId,
			label: new Label({
				// The generic single-rename label is only shown when the dialog collapsed to a single
				// target field. Otherwise (e.g. singleRename without a preSelectedProperty, so all
				// properties are shown) the real per-property label is used.
				text: bSingleFieldRename ? "{i18n>ANNOTATION_CHANGE_DIALOG_SINGLE_RENAME_LABEL}" : "{= ${label} || ${propertyName}}",
				tooltip: "{tooltip}"
			}),
			fields: [
				createEditorField.call(this, sValueType, bSingleFieldRename)
			]
		});
	};

	return AnnotationChangeDialogController;
});