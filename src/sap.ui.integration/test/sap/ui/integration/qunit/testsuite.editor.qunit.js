sap.ui.define([], function () {
	"use strict";

	return {
		name: "QUnit TestSuite for sap.ui.integration - Editor",
		defaults: {
			qunit: {
				version: "edge"
			},
			sinon: false,
			ui5: {
				language: "en",
				compatVersion: "edge",
				libs: ["sap.f", "sap.m", "sap.ui.integration"],
				noConflict: true,
				"xx-waitForTheme": "init",
				resourceroots: {
					"qunit": "test-resources/sap/ui/integration/qunit/"
				}
			},
			coverage: {
				only: ["sap/ui/integration"]
			},
			autostart: true,
			page: "test-resources/sap/ui/integration/qunit/testsandbox.editor.qunit.html?test={name}"
		},
		tests: {
			"designtime/baseEditor/integration/ReadyHandling": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/"
					]
				}
			},
			"designtime/baseEditor/BaseEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/BaseEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/BasePropertyEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor"
					]
				}
			},
			"designtime/baseEditor/PropertyEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/PropertyEditor"
					]
				}
			},
			"designtime/baseEditor/PropertyEditors": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/PropertyEditors"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/stringEditor/StringEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/groupEditor/GroupEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/groupEditor/GroupEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/separatorEditor/SeparatorEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/separatorEditor/SeparatorEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/numberEditor/NumberEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/integerEditor/IntegerEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/integerEditor/IntegerEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/codeEditor/CodeEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/codeEditor/CodeEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor"
					]
				}
			},
			/**
			 * @deprecated as of version 1.81
			 */
			"designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/selectEditor/SelectEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/mapEditor/MapEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/iconEditor/IconEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/dateEditor/DateEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/dateTimeEditor/DateTimeEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/dateTimeEditor/DateTimeEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/listEditor/ListEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/listEditor/ListEditor"
					]
				}
			},
			"designtime/baseEditor/propertyEditor/PropertyEditorFactory": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory"
					]
				}
			},
			"designtime/baseEditor/util/binding/resolveBinding": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/binding/resolveBinding"
					]
				}
			},
			"designtime/baseEditor/util/ObjectBinding": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/ObjectBinding"
					]
				}
			},
			"designtime/baseEditor/util/createPromise": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/createPromise"
					]
				}
			},
			"designtime/baseEditor/util/escapeParameter": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/escapeParameter"
					]
				}
			},
			"designtime/baseEditor/util/findClosestInstance": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/findClosestInstance"
					]
				}
			},
			"designtime/baseEditor/util/isValidBindingString": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/isValidBindingString"
					]
				}
			},
			"designtime/baseEditor/util/unset": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/unset"
					]
				}
			},
			"designtime/baseEditor/util/hasTag": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/hasTag"
					]
				}
			},
			"designtime/baseEditor/util/StylesheetManager": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/StylesheetManager"
					]
				},
				loader: {
					paths: {
						"mockdata": "test-resources/sap/ui/integration/qunit/designtime/baseEditor/util"
					}
				}
			},
			"designtime/baseEditor/layout/Form": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/layout/Form"
					]
				}
			},
			"designtime/baseEditor/validator/ValidatorRegistry": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/validator/ValidatorRegistry"
					]
				}
			},
			"designtime/baseEditor/validator/IsPatternMatch": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/validator/IsPatternMatch"
					]
				}
			},
			"designtime/cardEditor/CardEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/CardEditor"
					]
				}
			},
			"designtime/cardEditor/BASEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/BASEditor"
					]
				}
			},
			"designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor"
					]
				}
			},
			"designtime/cardEditor/propertyEditor/complexMapEditor/ComplexMapEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/propertyEditor/complexMapEditor/ComplexMapEditor"
					]
				}
			},
			"designtime/cardEditor/propertyEditor/destinationsEditor/DestinationsEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/propertyEditor/destinationsEditor/DestinationsEditor"
					]
				}
			},
			"designtime/cardEditor/propertyEditor/filtersEditor/FiltersEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/propertyEditor/filtersEditor/FiltersEditor"
					]
				}
			},
			"designtime/cardEditor/propertyEditor/iconEditor/IconEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/propertyEditor/iconEditor/IconEditor"
					]
				}
			},
			"editor/NoDesigntime": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/Destination": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/Enhancement": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/Ids": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/Layout": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/Settings": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeKey/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeKey/ChangesByAdminForAdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeKey/ChangesByAdminForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeKey/ChangesByAdminForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeKey/ChangesByContentForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeKey/ChangesByContentForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeKey/ChangesByAdminAndContentForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeKey/ChangesByAdminAndContentForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/I18nFormatAsValue": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/NormalStringAsValue": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminForAdminMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminForAdminMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminAndContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminAndContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminAndContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/simpleForm/typeProperty/ChangesByAdminAndContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminForAdminMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminForAdminMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminAndContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminAndContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminAndContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeKey/ChangesByAdminAndContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/I18nFormatAsValue": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/NormalStringAsValue": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminForAdminMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminForAdminMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminAndContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminAndContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminAndContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/propertyTranslation/table/typeProperty/ChangesByAdminAndContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/table/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/table/Add": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/table/UpdateAndDelete": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/table/Filter": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/table/FilterAndCUD": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/table/PropertyTranslation": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/table/SpecialProperties": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/TextArea": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectField/SimpleForm": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/TextArea": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/table/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/table/CUD": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/table/filter/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/table/filter/CUD": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/table/sort/Filter": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/table/sort/PropertiesDefinedOnly": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/table/sort/RequestValues": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/table/SpecialProperties": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/requestValues/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/requestValues/Add": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/requestValues/UpdateAndDelete": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/requestValues/Filter": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/requestValues/FilterAndCUD": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/Update": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminForAdminMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminForAdminMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminAndContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminAndContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminAndContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeKey/ChangesByAdminAndContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/NormalStringAsValue": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/I18nFormatAsValue": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminForAdminMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminForAdminMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminAndContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminAndContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminAndContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByAdminAndContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByContentForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByContentForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByContentForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/ChangesByContentForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/differentParameters/ChangesByAdminForAdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/differentParameters/ChangesByAdminForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/differentParameters/ChangesByAdminForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/differentParameters/ChangesByContentForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/differentParameters/ChangesByContentForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/differentParameters/ChangesByAdminAndContentForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/objectListField/propertyTranslation/table/typeProperty/differentParameters/ChangesByAdminAndContentForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/RequestValues": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/RequestValuesEnhancement": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/Translation": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/Validation": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/SectionSapCard1": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/SectionSapCard1_RequestValues": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/SectionSapCard1_RequestValuesEnhancement": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/SectionTemp": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/SectionTemp_RequestValues": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/SectionTemp_RequestValuesEnhancement": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/ParameterSyntax": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/InitialWithNoChange01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/InitialWithNoChange02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/InitialWithErrorCondition01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/InitialWithErrorCondition02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminForAdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByContentForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByContentForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByContentForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByContentForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndContentForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndContentForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndContentForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndContentForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndContentAndTranslationForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndContentAndTranslationForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndContentAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByAdminAndContentAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByContentAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByContentAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeByContentAndTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminForAdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByContentForContentAndAllModes": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByContentForTranslationMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndContentForContentAndAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndContentForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndContentForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndContentAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndContentAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndContentAndTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByAdminAndTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByContentAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByContentAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/BCChangeByContentAndTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeTranslationsForAdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeTranslationsForContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeTranslationsForContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeTranslationsForAllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeTranslationsForAllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeTranslationsForAllMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/multiLanguagesOfValue/ChangeTranslationsForAllMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/i18nAsObject/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/i18nAsObject/Negative": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/i18nAsObject/MultiLanguages01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/i18nAsObject/MultiLanguages02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AdminMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AdminMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/ContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/ContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/ContentMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/ContentMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/TranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/TranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/TranslationMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/TranslationMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/TranslationMode05": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/TranslationMode06": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/TranslationMode07": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/TranslationMode08": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AllMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AllMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AllMode05": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AllMode06": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AllMode07": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/underlineLanguages/AllMode08": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/AdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/ContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/ContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/ContentMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/TranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/TranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/AllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/AllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/AllMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/AllMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/AllMode05": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/BCChanges/AllMode06": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/StringField/AdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/StringField/ContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/StringField/ContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/StringField/AllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/StringField/AllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/StringField/TranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/StringField/TranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectField/AdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectField/ContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectField/ContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectField/AllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectField/AllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectListField/AdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectListField/ContentMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectListField/ContentMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectListField/AllMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/unMatchLanguages/ObjectListField/AllMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/performance/Basic01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/performance/Basic02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/performance/MultiFields": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/performance/Interaction": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/Basic": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/Navigation01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/Navigation02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/SaveChanges01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/SaveChanges02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminForAdminMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminForTranslationMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminForTranslationMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentForTranslationMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentForTranslationMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByTranslationForTranslationMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByTranslationForTranslationMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentForContentMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentForTranslationMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentForTranslationMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndTranslationForTranslationMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndTranslationForTranslationMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentAndTranslationForTranslationMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentAndTranslationForTranslationMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByContentAndTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForTranslationMode01": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForTranslationMode02": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForTranslationMode03": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForTranslationMode04": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"editor/childEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForAllMode": {
				group: "Runtime Editor",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/CardEditor": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/Basic": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/Navigation01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/designtime/editor",
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/Navigation02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/SaveChanges01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/SaveChanges02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminForAdminMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminForContentMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminForTranslationMode01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminForTranslationMode02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminForTranslationMode03": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminForTranslationMode04": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminForAllMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentForContentMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentForTranslationMode01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentForTranslationMode02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentForTranslationMode03": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentForTranslationMode04": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentForAllMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByTranslationForTranslationMode01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByTranslationForTranslationMode02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByTranslationForTranslationMode03": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByTranslationForTranslationMode04": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByTranslationForAllMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentForContentMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentForTranslationMode01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentForTranslationMode02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentForTranslationMode03": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentForTranslationMode04": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentForAllMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndTranslationForTranslationMode01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndTranslationForTranslationMode02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndTranslationForTranslationMode03": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndTranslationForTranslationMode04": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndTranslationForAllMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentAndTranslationForTranslationMode01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentAndTranslationForTranslationMode02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentAndTranslationForTranslationMode03": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentAndTranslationForTranslationMode04": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByContentAndTranslationForAllMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForAdminMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForContentMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForTranslationMode01": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForTranslationMode02": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForTranslationMode03": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForTranslationMode04": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			},
			"designtime/editor/childCardEditors/manifestChanges/ChangesByAdminAndContentAndTranslationForAllMode": {
				group: "Runtime Editor for Card",
				coverage: {
					only: [
						"sap/ui/integration/editor"
					]
				}
			}
		}
	};
});
