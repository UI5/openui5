
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
	"sap/ui/rta/Utils"
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
	RtaUtils
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

	AnnotationChangeDialogController.prototype.formatDocumentationUrl = function() {
		const oDocumentationUrls = {
			btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/making-ui-changes",
			s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/54270a390b194c3e97be2424592c3352.html",
			s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/54270a390b194c3e97be2424592c3352.html"
		};

		return RtaUtils.getSystemSpecificDocumentationUrl(oDocumentationUrls);
	};

	AnnotationChangeDialogController.prototype.filterProperties = function(sQuery, bEquals) {
		const aFilters = [];
		if (sQuery && sQuery.length > 0) {
			const filter = new Filter("label", bEquals ? FilterOperator.EQ : FilterOperator.Contains, sQuery);
			aFilters.push(filter);
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

	function createEditorField(sValueType) {
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
				value: "{currentValue}",
				liveChange: (oEvent) => {
					const sValue = oEvent.getParameter("newValue");
					const oContext = oEvent.getSource().getBindingContext();
					oEvent.getSource().getModel().setProperty("currentValue", sValue, oContext);
				}
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