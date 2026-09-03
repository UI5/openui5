/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/integration/formatters/IconFormatter",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	deepClone,
	EditorQunitUtils,
	IconFormatter,
	QUnitUtils,
	KeyCodes,
	nextUIUpdate
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oManifestForObjectFieldsWithValues = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldsWithValues",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"value": {"text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false, "_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
					},
					"objectWithPropertiesDefinedAndValueFromRequestedFile": {
						"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}
					},
					"objectWithPropertiesDefinedAndValueFromODataRequest": {
						"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false, "_uuid": "333771a4-0d3f-4fec-af20-6f28f1b894cb"}}
					}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};

	var oEditObject = {"text": "textnew","key": "keynew","url": "https://sap.com/04","icon": "sap-icon://zoom-in","iconcolor": "#E69A17","int": 3,"_dt": {"_selected": true}};
	var oChangedObject = {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","iconcolor": "#E69A17","int": 1,"_dt": {"_selected": true},"editable": true,"number": 0.55};
	var oResponseData = {
		"Customers": [
			{"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1"},
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"},
			{"CustomerID": "e", "CompanyName": "E Company", "Country": "Country 5", "City": "City 5", "Address": "Address 5"},
			{"CustomerID": "f", "CompanyName": "F Company", "Country": "Country 6", "City": "City 6", "Address": "Address 5"}
		]
	};

	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("basic", {
		before: function () {
			EditorQunitUtils.createMockServer(oResponseData);
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("no value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefinedAndValueFromJsonList": {},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
								},
								"mock_request": {
									"name": "mock_request"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					var oSettings = this.oEditor.getCurrentSettings();
					assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value"], "Editor: Field 1 setting value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oTableToolbar = oTable.getExtension()[0];
						var oAddButton = oTableToolbar.getContent()[1];
						assert.ok(oAddButton.getEnabled(), "Table: Add button in toolbar enabled");
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						var oDeleteButton = oTableToolbar.getContent()[3];
						assert.ok(!oDeleteButton.getEnabled(), "Table: Delete button in toolbar disabled");
						var oClearFitlersButton = oTableToolbar.getContent()[4];
						assert.ok(!oClearFitlersButton.getEnabled(), "Table: ClearAllFilters button in toolbar disabled");
						var oSelectAllSelectionsButton = oTableToolbar.getContent()[5];
						assert.ok(!oSelectAllSelectionsButton.getVisible(), "Table: SelectAllSelections button in toolbar hided");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						var oClearAllSelectionsButton = oTableToolbar.getContent()[6];
						assert.ok(!oClearAllSelectionsButton.getVisible(), "Table: ClearAllSelections button in toolbar hided");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices()[0], 0, "Table: SelectedIndices Value after table selection change");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value not change after table selection change");
						oSettings = this.oEditor.getCurrentSettings();
						assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value"], "Editor: Field 1 setting value not change after table selection change");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(3);
						oTable.fireRowSelectionChange({
							rowIndex: 3,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices()[0], 3, "Table: SelectedIndices Value after table selection change again");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value not change after table selection change again");
						oSettings = this.oEditor.getCurrentSettings();
						assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value"], "Editor: Field 1 setting value not change after table selection change again");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value after remove table selection");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value not change after remove table selection");
						oSettings = this.oEditor.getCurrentSettings();
						assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value"], "Editor: Field 1 setting value not change after remove table selection");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

						oSelectAllSelectionsButton.firePress();
						assert.ok(!oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar disabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.equal(oTable.getSelectedIndices().length, 8, "Table: Select All selections working");

						oClearAllSelectionsButton.firePress();
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: Clear All selections working");

						var oRow1 = oTable.getRows()[0];
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
						oSelectionCell1.setSelected(true);
						oSelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting");
						oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value"], oField._getCurrentProperty("value"), "Editor: Field 1 setting value changed after selecting");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
						oSelectionCell1.setSelected(false);
						oSelectionCell1.fireSelect({
							selected: false
						});
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after deselecting");
						oSettings = this.oEditor.getCurrentSettings();
						assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value"], "Editor: Field 1 setting value removed after deselecting");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

						var oRow4 = oTable.getRows()[3];
						var oSelectionCell4 = oRow4.getCells()[0];
						assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
						oSelectionCell4.setSelected(true);
						oSelectionCell4.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting again");
						oSettings = this.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value"], oField._getCurrentProperty("value"), "Editor: Field 1 setting value changed after selecting again");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

						oRemoveValueButton.firePress();
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after clicking remove value button");
						oSettings = this.oEditor.getCurrentSettings();
						assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value"], "Editor: Field 1 setting value removed after clicking remove value button");

						EditorQunitUtils.wait().then(function () {
							assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
							assert.equal(oLabel2.getText(), "Object properties defined: value from requested file", "Label 2: Has label text");
							assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
							assert.ok(!oField2._getCurrentProperty("value"), "Field 2: Value");
							oSettings = this.oEditor.getCurrentSettings();
							assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value"], "Editor: Field 2 setting value");
							oTable = oField2.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 2: Control is Table");
							assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
							assert.equal(oTable.getBinding().getCount(), 4, "Table: value length is 4");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
							oSelectionColumn = oTable.getColumns()[0];
							oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
							assert.ok(!oField2._getCurrentProperty("value"), "Field 2: Value not change");
							oSettings = this.oEditor.getCurrentSettings();
							assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value"], "Editor: Field 2 setting value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
							assert.ok(!oField2._getCurrentProperty("value"), "Field 2: Value not change");
							oSettings = this.oEditor.getCurrentSettings();
							assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value"], "Editor: Field 2 setting value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
							assert.ok(!oField2._getCurrentProperty("value"), "Field 2: Value not change");
							oSettings = this.oEditor.getCurrentSettings();
							assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value"], "Editor: Field 2 setting value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

							var oRow1 = oTable.getRows()[0];
							var oSelectionCell1 = oRow1.getCells()[0];
							assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
							oSelectionCell1.setSelected(true);
							oSelectionCell1.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField2._getCurrentProperty("value")), {"text": "text1req", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept", "_dt": {"_editable": false} }), "Field 2: DT Value changed after selecting");
							oSettings = this.oEditor.getCurrentSettings();
							assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value"], oField2._getCurrentProperty("value"), "Editor: Field 2 setting value changed after selecting");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
							oSelectionCell1.setSelected(false);
							oSelectionCell1.fireSelect({
								selected: false
							});
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
							assert.ok(!oField2._getCurrentProperty("value"), "Field 2: DT Value removed after deselecting");
							oSettings = this.oEditor.getCurrentSettings();
							assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value"], "Editor: Field 2 setting value removed after deselecting");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

							var oRow4 = oTable.getRows()[3];
							var oSelectionCell4 = oRow4.getCells()[0];
							assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
							oSelectionCell4.setSelected(true);
							oSelectionCell4.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField2._getCurrentProperty("value")), { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false} }), "Field 2: DT Value changed after selecting");
							oSettings = this.oEditor.getCurrentSettings();
							assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value"], oField2._getCurrentProperty("value"), "Editor: Field 2 setting value changed after selecting");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oRemoveValueButton.firePress();
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
							assert.ok(!oField2._getCurrentProperty("value"), "Field 2: DT Value removed after clicking remove value button");
							oSettings = this.oEditor.getCurrentSettings();
							assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value"], "Editor: Field 2 setting value removed after clicking remove value button");

							EditorQunitUtils.wait().then(function () {
								assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
								assert.equal(oLabel3.getText(), "Object properties defined: value from OData Request", "Label 3: Has label text");
								assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
								assert.ok(!oField3._getCurrentProperty("value"), "Field 3: Value");
								oSettings = this.oEditor.getCurrentSettings();
								assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value"], "Editor: Field 3 setting value");
								oTable = oField3.getAggregation("_field");
								assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
								assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
								assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is 6");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
								oSelectionColumn = oTable.getColumns()[0];
								oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
								oTable.setSelectedIndex(0);
								oTable.fireRowSelectionChange({
									rowIndex: 0,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
								assert.ok(!oField3._getCurrentProperty("value"), "Field 3: Value not change");
								oSettings = this.oEditor.getCurrentSettings();
								assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value"], "Editor: Field 3 setting value not change");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
								oTable.setSelectedIndex(3);
								oTable.fireRowSelectionChange({
									rowIndex: 3,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
								assert.ok(!oField3._getCurrentProperty("value"), "Field 3: Value not change");
								oSettings = this.oEditor.getCurrentSettings();
								assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value"], "Editor: Field 3 setting value not change");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
								oTable.setSelectedIndex(-1);
								oTable.fireRowSelectionChange({
									rowIndex: -1,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
								assert.ok(!oField3._getCurrentProperty("value"), "Field 3: Value not change");
								oSettings = this.oEditor.getCurrentSettings();
								assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value"], "Editor: Field 3 setting value not change");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
								assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
								oSelectionCell1.setSelected(true);
								oSelectionCell1.fireSelect({
									selected: true
								});
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change");
								oSettings = this.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value"], oField3._getCurrentProperty("value"), "Editor: Field 3 setting value not change after table selection change");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
								oSelectionCell1.setSelected(false);
								oSelectionCell1.fireSelect({
									selected: false
								});
								assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
								assert.ok(!oField3._getCurrentProperty("value"), "Field 3: DT Value removed after deselecting");
								oSettings = this.oEditor.getCurrentSettings();
								assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value"], "Editor: Field 3 setting value removed after deselecting");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
								assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
								oSelectionCell4.setSelected(true);
								oSelectionCell4.fireSelect({
									selected: true
								});
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change again");
								oSettings = this.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value"], oField3._getCurrentProperty("value"), "Editor: Field 3 setting value not change after table selection change again");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
								oRemoveValueButton.firePress();
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
								assert.ok(!oField._getCurrentProperty("value"), "Field 3: DT Value removed after clicking remove value button");
								oSettings = this.oEditor.getCurrentSettings();
								assert.ok(!oSettings["/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value"], "Editor: Field 3 setting value removed after clicking remove value button");

								resolve();
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("{} as value", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {}
								}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
								},
								"mock_request": {
									"name": "mock_request"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oTableToolbar = oTable.getExtension()[0];
						var oAddButton = oTableToolbar.getContent()[1];
						assert.ok(oAddButton.getEnabled(), "Table: Add button in toolbar enabled");
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						var oDeleteButton = oTableToolbar.getContent()[3];
						assert.ok(!oDeleteButton.getEnabled(), "Table: Delete button in toolbar disabled");
						var oClearFitlersButton = oTableToolbar.getContent()[4];
						assert.ok(!oClearFitlersButton.getEnabled(), "Table: ClearAllFilters button in toolbar disabled");
						var oSelectAllSelectionsButton = oTableToolbar.getContent()[5];
						assert.ok(!oSelectAllSelectionsButton.getVisible(), "Table: SelectAllSelections button in toolbar hided");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						var oClearAllSelectionsButton = oTableToolbar.getContent()[6];
						assert.ok(!oClearAllSelectionsButton.getVisible(), "Table: ClearAllSelections button in toolbar hided");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices()[0], 0, "Table: SelectedIndices Value after table selection change");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: DT Value not change after table selection change");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(3);
						oTable.fireRowSelectionChange({
							rowIndex: 3,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices()[0], 3, "Table: SelectedIndices Value after table selection change again");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: DT Value not change after table selection change again");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value after remove table selection");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: Value not change after remove table selection");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

						oSelectAllSelectionsButton.firePress();
						assert.ok(!oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar disabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.equal(oTable.getSelectedIndices().length, 8, "Table: Select All selections working");

						oClearAllSelectionsButton.firePress();
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: Clear All selections working");

						var oRow1 = oTable.getRows()[0];
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
						oSelectionCell1.setSelected(true);
						oSelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
						oSelectionCell1.setSelected(false);
						oSelectionCell1.fireSelect({
							selected: false
						});
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after deselecting");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

						var oRow4 = oTable.getRows()[3];
						var oSelectionCell4 = oRow4.getCells()[0];
						assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
						oSelectionCell4.setSelected(true);
						oSelectionCell4.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting again");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

						oRemoveValueButton.firePress();
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after clicking remove value button");

						EditorQunitUtils.wait().then(function () {
							assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
							assert.equal(oLabel2.getText(), "Object properties defined: value from requested file", "Label 2: Has label text");
							assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
							assert.ok(deepEqual(oField2._getCurrentProperty("value"), {}), "Field 2: Value");
							oTable = oField2.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 2: Control is Table");
							assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
							assert.equal(oTable.getBinding().getCount(), 4, "Table: value length is 4");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
							oSelectionColumn = oTable.getColumns()[0];
							oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
							assert.ok(deepEqual(oField2._getCurrentProperty("value"), {}), "Field 2: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(3);
							oTable.fireRowSelectionChange({
								rowIndex: 3,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
							assert.ok(deepEqual(oField2._getCurrentProperty("value"), {}), "Field 2: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
							assert.ok(deepEqual(oField2._getCurrentProperty("value"), {}), "Field 2: Value not change");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

							var oRow1 = oTable.getRows()[0];
							var oSelectionCell1 = oRow1.getCells()[0];
							assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
							oSelectionCell1.setSelected(true);
							oSelectionCell1.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField2._getCurrentProperty("value")), { "text": "text1req", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept", "_dt": {"_editable": false} }), "Field 2: DT Value changed after selecting");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
							oSelectionCell1.setSelected(false);
							oSelectionCell1.fireSelect({
								selected: false
							});
							assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
							assert.ok(!oField._getCurrentProperty("value"), "Field 2: DT Value removed after deselecting");
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

							var oRow4 = oTable.getRows()[3];
							var oSelectionCell4 = oRow4.getCells()[0];
							assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
							assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
							oSelectionCell4.setSelected(true);
							oSelectionCell4.fireSelect({
								selected: true
							});
							assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
							assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField2._getCurrentProperty("value")), { "text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false} }), "Field 2: DT Value changed after selecting");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oRemoveValueButton.firePress();
							assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
							assert.ok(!oField._getCurrentProperty("value"), "Field 2: DT Value removed after clicking remove value button");

							EditorQunitUtils.wait().then(function () {
								assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
								assert.equal(oLabel3.getText(), "Object properties defined: value from OData Request", "Label 3: Has label text");
								assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
								assert.ok(deepEqual(oField3._getCurrentProperty("value"), {}), "Field 3: Value");
								oTable = oField3.getAggregation("_field");
								assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
								assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
								assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is 6");
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
								oSelectionColumn = oTable.getColumns()[0];
								oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
								oTable.setSelectedIndex(0);
								oTable.fireRowSelectionChange({
									rowIndex: 0,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
								assert.ok(deepEqual(oField3._getCurrentProperty("value"), {}), "Field 3: Value not change");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
								oTable.setSelectedIndex(3);
								oTable.fireRowSelectionChange({
									rowIndex: 3,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndex and SelectedIndices Value after selection change again");
								assert.ok(deepEqual(oField3._getCurrentProperty("value"), {}), "Field 3: Value not change");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
								oTable.setSelectedIndex(-1);
								oTable.fireRowSelectionChange({
									rowIndex: -1,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
								assert.ok(deepEqual(oField3._getCurrentProperty("value"), {}), "Field 3: Value not change");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");

								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
								assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
								oSelectionCell1.setSelected(true);
								oSelectionCell1.fireSelect({
									selected: true
								});
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
								oSelectionCell1.setSelected(false);
								oSelectionCell1.fireSelect({
									selected: false
								});
								assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
								assert.ok(!oField3._getCurrentProperty("value"), "Field 3: DT Value removed after deselecting");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
								assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
								oSelectionCell4.setSelected(true);
								oSelectionCell4.fireSelect({
									selected: true
								});
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change again");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
								oRemoveValueButton.firePress();
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
								assert.ok(!oField._getCurrentProperty("value"), "Field 2: DT Value removed after clicking remove value button");

								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no add and clearFilter buttons in table toolbar", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldWithoutAddAndClearFilterButtons",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectWithoutAddAndClearFilterButtons": {
									"value": {}
								}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), {}), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(!oAddButton.getVisible(), "Table toolbar: add button not visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(!oClearFilterButton.getVisible(), "Table toolbar: clear filter button not visible");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("select and unselect", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest:  oManifestForObjectFieldsWithValues
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oTableToolbar = oTable.getExtension()[0];
						var oAddButton = oTableToolbar.getContent()[1];
						assert.ok(oAddButton.getEnabled(), "Table: Add button in toolbar enabled");
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						var oDeleteButton = oTableToolbar.getContent()[3];
						assert.ok(!oDeleteButton.getEnabled(), "Table: Delete button in toolbar disabled");
						var oClearFitlersButton = oTableToolbar.getContent()[4];
						assert.ok(!oClearFitlersButton.getEnabled(), "Table: ClearAllFilters button in toolbar disabled");
						var oSelectAllSelectionsButton = oTableToolbar.getContent()[5];
						assert.ok(!oSelectAllSelectionsButton.getVisible(), "Table: SelectAllSelections button in toolbar hided");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						var oClearAllSelectionsButton = oTableToolbar.getContent()[6];
						assert.ok(!oClearAllSelectionsButton.getVisible(), "Table: ClearAllSelections button in toolbar hided");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						var oSelectionColumn = oTable.getColumns()[0];
						var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange({
							rowIndex: 0,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices()[0], 0, "Table: SelectedIndices Value after table selection change");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: DT Value not change after table selection change");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						oTable.setSelectedIndex(3);
						oTable.fireRowSelectionChange({
							rowIndex: 3,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices()[0], 3, "Table: SelectedIndices Value after table selection change again");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: DT Value not change after table selection change again");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
						oTable.setSelectedIndex(-1);
						oTable.fireRowSelectionChange({
							rowIndex: -1,
							userInteraction: true
						});
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value after remove table selection");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false }}), "Field 1: Value not change after remove table selection");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

						oSelectAllSelectionsButton.firePress();
						assert.ok(!oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar disabled");
						assert.ok(oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar enabled");
						assert.equal(oTable.getSelectedIndices().length, 8, "Table: Select All selections working");

						oClearAllSelectionsButton.firePress();
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: Clear All selections working");

						var oRow3 = oTable.getRows()[2];
						var oSelectionCell3 = oRow3.getCells()[0];
						assert.ok(oSelectionCell3.isA("sap.m.CheckBox"), "Row 3: Cell 1 is CheckBox");
						assert.ok(oSelectionCell3.getSelected(), "Row 3: Cell 1 is selected");

						var oRow1 = oTable.getRows()[0];
						var oSelectionCell1 = oRow1.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
						oSelectionCell1.setSelected(true);
						oSelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
						oSelectionCell1.setSelected(false);
						oSelectionCell1.fireSelect({
							selected: false
						});
						assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after deselecting");
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

						var oRow4 = oTable.getRows()[3];
						var oSelectionCell4 = oRow4.getCells()[0];
						assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
						assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
						oSelectionCell4.setSelected(true);
						oSelectionCell4.fireSelect({
							selected: true
						});
						assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
						assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField._getCurrentProperty("value")), { "text": "text04", "key": "key04", "url": "https://sap.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4, "_dt": { "_editable": false} }), "Field 1: DT Value changed after selecting again");
						assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

						oRemoveValueButton.firePress();
						assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
						assert.ok(!oField._getCurrentProperty("value"), "Field 1: DT Value removed after clicking remove value button");

						EditorQunitUtils.wait().then(function () {
							assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
							assert.equal(oLabel2.getText(), "Object properties defined: value from requested file", "Label 2: Has label text");
							assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
							assert.ok(deepEqual(oField2._getCurrentProperty("value"), {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}), "Field 2: Value");
							oTable = oField2.getAggregation("_field");
							assert.ok(oTable.isA("sap.ui.table.Table"), "Field 2: Control is Table");
							assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
							assert.equal(oTable.getBinding().getCount(), 4, "Table: value length is 4");
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: no selected row");
							oSelectionColumn = oTable.getColumns()[0];
							oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndex and SelectedIndices Value after selection change");
							assert.ok(deepEqual(oField2._getCurrentProperty("value"), {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}), "Field 2: Value not change after table selection changed");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oTable.setSelectedIndex(2);
							oTable.fireRowSelectionChange({
								rowIndex: 2,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices()[0] === 2, "Table: SelectedIndex and SelectedIndices Value after selection change again");
							assert.ok(deepEqual(oField2._getCurrentProperty("value"), {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}), "Field 2: Value not change after table selection changed");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
							oTable.setSelectedIndex(-1);
							oTable.fireRowSelectionChange({
								rowIndex: -1,
								userInteraction: true
							});
							assert.ok(oTable.getSelectedIndices().length === 0, "Table: SelectedIndex and SelectedIndices Value after remove table selection");
							assert.ok(deepEqual(oField2._getCurrentProperty("value"), {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_dt": {"_editable": false, "_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"}}), "Field 2: Value not change after table selection changed");
							assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

							oRow4 = oTable.getRows()[3];
							oSelectionCell4 = oRow4.getCells()[0];
							assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
							assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected");
							EditorQunitUtils.wait().then(function () {
								assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
								assert.equal(oLabel3.getText(), "Object properties defined: value from OData Request", "Label 3: Has label text");
								assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}), "Field 3: Value");
								oTable = oField3.getAggregation("_field");
								assert.ok(oTable.isA("sap.ui.table.Table"), "Field 3: Control is Table");
								assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
								assert.equal(oTable.getBinding().getCount(), 6, "Table: value length is 6");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: no selected row");
								oSelectionColumn = oTable.getColumns()[0];
								oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
								oTable.setSelectedIndex(0);
								oTable.fireRowSelectionChange({
									rowIndex: 0,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices()[0] === 0, "Table: SelectedIndices Value after table selection change");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}), "Field 3: DT Value not change after table selection change");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
								oTable.setSelectedIndex(3);
								oTable.fireRowSelectionChange({
									rowIndex: 3,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices()[0] === 3, "Table: SelectedIndices Value after table selection change again");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}), "Field 3: DT Value not change after table selection change again");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
								oTable.setSelectedIndex(-1);
								oTable.fireRowSelectionChange({
									rowIndex: -1,
									userInteraction: true
								});
								assert.ok(oTable.getSelectedIndices().length === 0, "Table: SetectedIndex and SelectedIndices Value after remove table selection");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}), "Field 3: DT Value not change after remove table selections");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");

								var oRow2 = oTable.getRows()[1];
								var oSelectionCell2 = oRow2.getCells()[0];
								assert.ok(oSelectionCell2.isA("sap.m.CheckBox"), "Row 2: Cell 1 is CheckBox");
								assert.ok(oSelectionCell2.getSelected(), "Row 2: Cell 1 is selected");

								var oRow1 = oTable.getRows()[0];
								var oSelectionCell1 = oRow1.getCells()[0];
								assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
								assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected");
								oSelectionCell1.setSelected(true);
								oSelectionCell1.fireSelect({
									selected: true
								});
								assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected after selecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled after selecting");
								oSelectionCell1.setSelected(false);
								oSelectionCell1.fireSelect({
									selected: false
								});
								assert.ok(!oSelectionCell1.getSelected(), "Row 1: Cell 1 is not selected after deselecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after deselecting");
								assert.ok(!oField3._getCurrentProperty("value"), "Field 3: DT Value removed after deselecting");
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after deselecting");

								var oRow4 = oTable.getRows()[3];
								var oSelectionCell4 = oRow4.getCells()[0];
								assert.ok(oSelectionCell4.isA("sap.m.CheckBox"), "Row 4: Cell 1 is CheckBox");
								assert.ok(!oSelectionCell4.getSelected(), "Row 4: Cell 1 is not selected");
								oSelectionCell4.setSelected(true);
								oSelectionCell4.fireSelect({
									selected: true
								});
								assert.ok(oSelectionCell4.getSelected(), "Row 4: Cell 1 is selected after selecting");
								assert.equal(oTable.getSelectedIndices().length, 0, "Table: SelectedIndices Value not change after selecting");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oField3._getCurrentProperty("value")), {"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4", "_dt": {"_editable": false} }), "Field 3: DT Value not change after table selection change again");
								assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
								oRemoveValueButton.firePress();
								assert.ok(!oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column disabled after clicking it");
								assert.ok(!oField._getCurrentProperty("value"), "Field 3: DT Value removed after clicking remove value button");

								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch edit mode in popover for editable object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}
								}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
								},
								"mock_request": {
									"name": "mock_request"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oValueInTable = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_selected": true}};
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oNewRow = oTable.getRows()[0];
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oNewRow.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oSelectionCell1 = oNewRow.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						var oTableToolbar = oTable.getExtension()[0];
						var oAddButton = oTableToolbar.getContent()[1];
						assert.ok(oAddButton.getEnabled(), "Table: Add button in toolbar enabled");
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						var oDeleteButton = oTableToolbar.getContent()[3];
						assert.ok(!oDeleteButton.getEnabled(), "Table: Delete button in toolbar disabled");
						var oClearFitlersButton = oTableToolbar.getContent()[4];
						assert.ok(!oClearFitlersButton.getEnabled(), "Table: ClearAllFilters button in toolbar disabled");
						var oSelectAllSelectionsButton = oTableToolbar.getContent()[5];
						assert.ok(!oSelectAllSelectionsButton.getVisible(), "Table: SelectAllSelections button in toolbar hided");
						assert.ok(oSelectAllSelectionsButton.getEnabled(), "Table: SelectAllSelections button in toolbar enabled");
						var oClearAllSelectionsButton = oTableToolbar.getContent()[6];
						assert.ok(!oClearAllSelectionsButton.getVisible(), "Table: ClearAllSelections button in toolbar hided");
						assert.ok(!oClearAllSelectionsButton.getEnabled(), "Table: ClearAllSelections button in toolbar disabled");
						oTable.setSelectedIndex(0);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oEditButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(oUpdateButtonInPopover.getVisible(), "Popover: update button visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oContents[15].getValue()), oEditObject), "SimpleForm field textArea: Has the value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "keynew", "SimpleForm field1: Has value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://zoom-in", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "textnew", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "https://sap.com/04", "SimpleForm field4: Has value");
							oFormField.setValue("https://sap.com/06");
							oFormField.fireChange({ value: "https://sap.com/06" });
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormField.setSelected(true);
							oFormField.fireSelect({ selected: true });
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Has value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field7: Has value");
							oFormField.setValue("0.55");
							oFormField.fireChange({ value: "0.55"});
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							EditorQunitUtils.wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oFormField.getValue()), oChangedObject), "SimpleForm field textArea: Has changed value");
								var sNewValue = '{\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sap.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								oSwitchModeButton.firePress();
								EditorQunitUtils.wait().then(function () {
									oContents = oSimpleForm.getContent();
									oFormLabel = oContents[0];
									oFormField = oContents[1];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Label text");
									assert.equal(oFormField.getValue(), "key01 2", "SimpleForm field1: Value changed");
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Label text");
									assert.equal(oFormField.getValue(), "sap-icon://accept 2", "SimpleForm field2: Value changed");
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Label text");
									assert.equal(oFormField.getValue(), "text01 2", "SimpleForm field3: Value changed");
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Label text");
									assert.equal(oFormField.getValue(), "https://sap.com/06 2", "SimpleForm field4: Value changed");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Label text");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value changed");
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Label text");
									assert.equal(oFormField.getValue(), "3", "SimpleForm field6: Value changed");
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Label text");
									assert.equal(oFormField.getValue(), "5.6", "SimpleForm field7: Value changed");
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.equal(oFormField.getValue(), sNewValue, "SimpleForm field5: Value changed");
									resolve();
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch edit mode in popover for not editable object", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectFieldsWithValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"object": {
									"value": {"string": "string value", "boolean": true, "integer": 3, "number": 3.22}
								},
								"objectWithPropertiesDefined": {
									"value": {"text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 , "editable": true, "number": 3.55}
								},
								"objectWithPropertiesDefinedAndValueFromJsonList": {
									"value": {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3}
								},
								"objectWithPropertiesDefinedAndValueFromRequestedFile": {
									"value": {"text": "text4req", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-out", "_editable": false}
								},
								"objectWithPropertiesDefinedAndValueFromODataRequest": {
									"value": {"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2", "_dt": {"_editable": false}}
								}
							},
							"destinations": {
								"local": {
									"name": "local",
									"defaultUrl": "./"
								},
								"mock_request": {
									"name": "mock_request"
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oValue = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3};
					var oValueInTable = {"text": "textnew", "key": "keynew", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_selected": true}};
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanDT(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oTable.getBinding().getContexts()[0].getObject()), oValueInTable), "Table: new row");
						var oNewRow = oTable.getRows()[0];
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oNewRow.getBindingContext().getObject()), oValueInTable), "Table: value row is at top");
						var oSelectionCell1 = oNewRow.getCells()[0];
						assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
						assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
						var oTableToolbar = oTable.getExtension()[0];
						var oEditButton = oTableToolbar.getContent()[2];
						assert.ok(!oEditButton.getEnabled(), "Table: Edit button in toolbar disabled");
						var oRow = oTable.getRows()[1];
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oRow.getBindingContext().getObject()), { "text": "text01", "key": "key01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1, "_dt": {"_editable": false}}), "Table: target row");
						oTable.setSelectedIndex(1);
						oTable.fireRowSelectionChange();
						assert.ok(oEditButton.getEnabled(), "Table: Edit button in toolbar enabled");
						oEditButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(!oAddButtonInPopover.getVisible(), "Popover: add button not visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(!oCancelButtonInPopover.getVisible(), "Popover: cancel button not visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(oCloseButtonInPopover.getVisible(), "Popover: close button visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
							assert.equal(oFormField.getValue(), "key01", "SimpleForm field1: Has value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field2: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
							assert.equal(oFormField.getValue(), "sap-icon://accept", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
							assert.equal(oFormField.getValue(), "text01", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
							assert.equal(oFormField.getValue(), "https://sap.com/06", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
							assert.equal(oFormField.getValue(), "1", "SimpleForm field6: Has value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
							var oFormFieldObject = {"text": "text01","key": "key01","url": "https://sap.com/06","icon": "sap-icon://accept","iconcolor": "#031E48","int": 1,"_dt": {"_editable": false}};
							assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oFormField.getValue()), oFormFieldObject), "SimpleForm field textArea: Has the value");
							var oSwitchModeButton = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getHeaderContent()[0];
							oSwitchModeButton.firePress();
							EditorQunitUtils.wait().then(function () {
								oContents = oSimpleForm.getContent();
								oFormLabel = oContents[0];
								oFormField = oContents[1];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label1: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field1: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
								assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Label text");
								assert.equal(oFormField.getValue(), "key01", "SimpleForm field1: Value");
								oFormLabel = oContents[2];
								oFormField = oContents[3];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label2: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field2: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
								assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Label text");
								assert.equal(oFormField.getValue(), "sap-icon://accept", "SimpleForm field2: Value");
								oFormLabel = oContents[4];
								oFormField = oContents[5];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label3: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field3: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
								assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Label text");
								assert.equal(oFormField.getValue(), "text01", "SimpleForm field3: Value");
								oFormLabel = oContents[6];
								oFormField = oContents[7];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label4: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field4: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
								assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Label text");
								assert.equal(oFormField.getValue(), "https://sap.com/06", "SimpleForm field4: Value");
								oFormLabel = oContents[8];
								oFormField = oContents[9];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label5: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field5: Not Visible");
								assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
								assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Label text");
								assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value");
								oFormLabel = oContents[10];
								oFormField = oContents[11];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label6: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field6: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
								assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Label text");
								assert.equal(oFormField.getValue(), "1", "SimpleForm field6: Value");
								oFormLabel = oContents[12];
								oFormField = oContents[13];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label7: Not Visible");
								assert.ok(!oFormField.getVisible(), "SimpleForm Field7: Not Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
								assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Label text");
								assert.equal(oFormField.getValue(), "", "SimpleForm field7: Value");
								oFormLabel = oContents[14];
								oFormField = oContents[15];
								assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
								assert.ok(oFormField.getVisible(), "SimpleForm Field8: Visible");
								assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oFormField.getValue()), oFormFieldObject), "SimpleForm field textArea: Has the value");
								oSwitchModeButton.firePress();
								EditorQunitUtils.wait().then(function () {
									oContents = oSimpleForm.getContent();
									oFormLabel = oContents[0];
									oFormField = oContents[1];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field1: Not Editable");
									assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Label text");
									assert.equal(oFormField.getValue(), "key01", "SimpleForm field1: Value");
									oFormLabel = oContents[2];
									oFormField = oContents[3];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field2: Not Editable");
									assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Label text");
									assert.equal(oFormField.getValue(), "sap-icon://accept", "SimpleForm field2: Value");
									oFormLabel = oContents[4];
									oFormField = oContents[5];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field3: Not Editable");
									assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Label text");
									assert.equal(oFormField.getValue(), "text01", "SimpleForm field3: Value");
									oFormLabel = oContents[6];
									oFormField = oContents[7];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field4: Not Editable");
									assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Label text");
									assert.equal(oFormField.getValue(), "https://sap.com/06", "SimpleForm field4: Value");
									oFormLabel = oContents[8];
									oFormField = oContents[9];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
									assert.ok(!oFormField.getEnabled(), "SimpleForm Field5: Not Enabled");
									assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Label text");
									assert.ok(!oFormField.getSelected(), "SimpleForm field5: Value");
									oFormLabel = oContents[10];
									oFormField = oContents[11];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field6: Not Editable");
									assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Label text");
									assert.equal(oFormField.getValue(), "1", "SimpleForm field6: Value");
									oFormLabel = oContents[12];
									oFormField = oContents[13];
									assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
									assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field7: Not Editable");
									assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Label text");
									assert.equal(oFormField.getValue(), "", "SimpleForm field7: Value");
									oFormLabel = oContents[14];
									oFormField = oContents[15];
									assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
									assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
									assert.ok(!oFormField.getEditable(), "SimpleForm Field8: Not Editable");
									assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oFormField.getValue()), oFormFieldObject), "SimpleForm field textArea: Has the value");
									resolve();
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("icon property in object details popover", function (assert) {
			var oManifestForObjectFieldWithValues = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/objectFieldWithValuesAndIconPropertiesDefined",
					"type": "List",
					"configuration": {
						"parameters": {
							"objectWithPropertiesDefinedAndValueFromJsonList": {
								"value": {"text": "textnew", "icon1": "sap-icon://zoom-in", "icon2": "sap-icon://zoom-in", "icon3": "sap-icon://zoom-in", "iconcolor": "#E69A17", "_dt": {"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}}
							}
						},
						"destinations": {
							"local": {
								"name": "local",
								"defaultUrl": "./"
							},
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectFieldWithValues
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oValue1 = {"text": "textnew", "icon1": "sap-icon://zoom-in", "icon2": "sap-icon://zoom-in", "icon3": "sap-icon://zoom-in", "iconcolor": "#E69A17"};
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanDT(oField._getCurrentProperty("value")), oValue1), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					var oToolbar = oTable.getExtension()[0];
					assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 10, "SimpleForm: length");
							var oFormLabel1 = oContents[2];
							var oFormField1 = oContents[3];
							assert.equal(oFormLabel1.getText(), "Icon1", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel1.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField1.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field2: Icon Select Viz Field");
							assert.ok(oFormField1.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField1.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField1.getValue(), "", "SimpleForm field2: Has value");

							var oSelect1 = oFormField1.getAggregation("_control");
							assert.ok(oSelect1.getItemByKey(IconFormatter.SRC_FOR_HIDDEN_ICON).getEnabled(), "Icon 1: item none is enabled");
							assert.ok(oSelect1.getItemByKey("file").getEnabled(), "Icon 1: item file is enabled");
							assert.ok(!oSelect1.getItemByKey("selected").getEnabled(), "Icon 1: item selected is disabled");
							oSelect1.setSelectedIndex(5);
							oSelect1.fireChange({ selectedItem: oSelect1.getItems()[5] });
							var bIsClosedByLosingFocus = true;
							var oPicker1 = oSelect1.getPicker();
							var oPickerBeforeCloseHandler = function(oEvent) {
								if (bIsClosedByLosingFocus) {
									resolve();
								}
							};
							// move resolve call to beforeClose event if the picker is about to close to avoid asserting failures
							oPicker1.attachBeforeClose(oPickerBeforeCloseHandler, this);
							oSelect1.focus();
							oSelect1.open();
							EditorQunitUtils.wait().then(async function () {
								assert.ok(oPicker1.isOpen(), "Icon 1: Picker opened");
								// Indices 0-2 are the 3 action items (None, Upload, Selected).
								// Real icons start at index 3. The grid reflows based on picker width,
								// so iIconsPerRow is read from the live DOM via _getIconsPerRow().
								// Navigation expressions use: 3 + row * iIconsPerRow + column
								// index 3+2: 3rd icon on first row, guaranteed to be on row 0 for any reasonable picker width
								var iIconsPerRow1 = oFormField1._getIconsPerRow();
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 1, "IconSelect 1: Arrow Up navigation correct for 3 < index < 14");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 0, "IconSelect 1: Arrow Up navigation correct for index = 1");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 0, "IconSelect 1: Arrow Up navigation correct for index = 0");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.PAGE_DOWN);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 39, "IconSelect 1: Page DOWN navigation correct for index = 0");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.PAGE_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 0, "IconSelect 1: Page Up navigation correct for index = 39");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_DOWN);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 1, "IconSelect 1: Arrow Down navigation correct for index = 0");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_DOWN);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3, "IconSelect 1: Arrow Down navigation correct for index = 1");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_DOWN);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1, "IconSelect 1: Arrow Down navigation correct for index = 3");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_RIGHT);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1 + 1, "IconSelect 1: Arrow Right navigation correct for index = 15");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.PAGE_DOWN);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1 + 1 + 60, "IconSelect 1: Page DOWN navigation correct for index = 16");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.PAGE_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1 + 1, "IconSelect 1: Page Up navigation correct for index = 16");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_LEFT);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1, "IconSelect 1: Arrow Left navigation correct for index = 16");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_LEFT);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1 - 1, "IconSelect 1: Arrow Left navigation correct for index = 15");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_RIGHT);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1, "IconSelect 1: Arrow Right navigation correct for index = 14");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_RIGHT);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1 + 1, "IconSelect 1: Arrow Right navigation correct for index = 15");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_RIGHT);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1 + 2, "IconSelect 1: Arrow Right navigation correct for index = 16");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_DOWN);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + 2 * iIconsPerRow1 + 2, "IconSelect 1: Arrow Down navigation correct for index = 17");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_RIGHT);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + 2 * iIconsPerRow1 + 3, "IconSelect 1: Arrow Right navigation correct for index = 29");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_RIGHT);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + 2 * iIconsPerRow1 + 4, "IconSelect 1: Arrow Right navigation correct for index = 30");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_DOWN);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + 3 * iIconsPerRow1 + 4, "IconSelect 1: Arrow Down navigation correct for index = 31");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + 2 * iIconsPerRow1 + 4, "IconSelect 1: Arrow Up navigation correct for index = 43");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 3 + iIconsPerRow1 + 4, "IconSelect 1: Arrow Up navigation correct for index = 31");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 7, "IconSelect 1: Arrow Up navigation correct for index = 19");
								QUnitUtils.triggerKeydown(oSelect1.getDomRef(), KeyCodes.ARROW_UP);
								await nextUIUpdate();
								assert.equal(oSelect1.getSelectedIndex(), 1, "IconSelect 1: Arrow Up navigation correct for index = 7");
								bIsClosedByLosingFocus = false;
								oPicker1.detachBeforeClose(oPickerBeforeCloseHandler, this);
								oPicker1 = null;
								// close popover manually
								oSelect1.close();
								EditorQunitUtils.wait().then(function () {
									var oFormLabel2 = oContents[4];
									var oFormField2 = oContents[5];
									assert.equal(oFormLabel2.getText(), "Icon2", "SimpleForm label3: Has label text");
									assert.ok(oFormLabel2.getVisible(), "SimpleForm label3: Visible");
									assert.ok(oFormField2.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field3: Icon Select Viz Field");
									assert.ok(oFormField2.getVisible(), "SimpleForm Field3: Visible");
									assert.ok(oFormField2.getEditable(), "SimpleForm Field3: Editable");
									assert.equal(oFormField2.getValue(), "", "SimpleForm field3: Has value");

									var oSelect2 = oFormField2.getAggregation("_control");
									assert.ok(!oSelect2.getItemByKey(IconFormatter.SRC_FOR_HIDDEN_ICON).getEnabled(), "Icon 2: item none is disabled");
									assert.ok(oSelect2.getItemByKey("file").getEnabled(), "Icon 2: item file is enabled");
									assert.ok(!oSelect2.getItemByKey("selected").getEnabled(), "Icon 2: item selected is disabled");
									oSelect2.setSelectedIndex(5);
									oSelect2.fireChange({ selectedItem: oSelect2.getItems()[5] });
									var oPicker2 = oSelect2.getPicker();
									// move resolve call to beforeClose event if the picker is about to close to avoid asserting failures
									oPicker2.attachBeforeClose(oPickerBeforeCloseHandler, this);
									bIsClosedByLosingFocus = true;
									oSelect2.focus();
									oSelect2.open();
									EditorQunitUtils.wait().then(async function () {
										assert.ok(oPicker2.isOpen(), "Icon 2: Picker opened");
										// Indices 0-2 are the 3 action items (None, Upload, Selected).
										// Real icons start at index 3. The grid reflows based on picker width,
										// so iIconsPerRow is read from the live DOM via _getIconsPerRow().
										// Navigation expressions use: 3 + row * iIconsPerRow + column
										// index 3+2: 3rd icon on first row, guaranteed to be on row 0 for any reasonable picker width
										var iIconsPerRow2 = oFormField2._getIconsPerRow();
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 1, "Icon Select 2: Arrow Up navigation correct for 3 < index < 14");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 1, "Icon Select 2: Arrow Up navigation correct for index = 1");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 1, "Icon Select 2: Arrow Up navigation correct for index = 1");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_DOWN);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3, "Icon Select 2: Arrow Down navigation correct for index = 1");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_DOWN);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2, "Icon Select 2: Arrow Down navigation correct for index = 3");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_LEFT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 1, "Icon Select 2: Arrow Left navigation correct for index = 15");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_LEFT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 2, "Icon Select 2: Arrow Left navigation correct for index = 14");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_LEFT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 3, "Icon Select 2: Arrow Left navigation correct for index = 13");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_LEFT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 4, "Icon Select 2: Arrow Left navigation correct for index = 12");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 3, "Icon Select 2: Arrow Right navigation correct for index = 11");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 2, "Icon Select 2: Arrow Right navigation correct for index = 12");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 1, "Icon Select 2: Arrow Right navigation correct for index = 13");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_DOWN);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 2 * iIconsPerRow2 - 1, "Icon Select 2: Arrow Down navigation correct for index = 14");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 2 * iIconsPerRow2, "Icon Select 2: Arrow Right navigation correct for index = 26");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 2 * iIconsPerRow2 + 1, "Icon Select 2: Arrow Right navigation correct for index = 27");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_DOWN);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 3 * iIconsPerRow2 + 1, "Icon Select 2: Arrow Down navigation correct for index = 28");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 2 * iIconsPerRow2 + 1, "Icon Select 2: Arrow Up navigation correct for index = 40");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 + 1, "Icon Select 2: Arrow Up navigation correct for index = 28");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 4, "Icon Select 2: Arrow Up navigation correct for index = 16");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 1, "Icon Select 2: Arrow Up navigation correct for index = 4");
										bIsClosedByLosingFocus = false;
										oPicker2.detachBeforeClose(oPickerBeforeCloseHandler, this);
										oPicker2 = null;
										// close popover manually
										oSelect2.close();
										EditorQunitUtils.wait().then(function () {
											var oFormLabel3 = oContents[6];
											var oFormField3 = oContents[7];
											assert.equal(oFormLabel3.getText(), "Icon3", "SimpleForm label4: Has label text");
											assert.ok(oFormLabel3.getVisible(), "SimpleForm label4: Visible");
											assert.ok(oFormField3.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field4: Icon Select Viz Field");
											assert.ok(oFormField3.getVisible(), "SimpleForm Field4: Visible");
											assert.ok(oFormField3.getEditable(), "SimpleForm Field4: Editable");
											assert.equal(oFormField3.getValue(), "", "SimpleForm field4: Has value");

											var oSelect3 = oFormField3.getAggregation("_control");
											assert.ok(oSelect3.getItemByKey(IconFormatter.SRC_FOR_HIDDEN_ICON).getEnabled(), "Icon 3: item none is enabled");
											assert.ok(!oSelect3.getItemByKey("file").getEnabled(), "Icon 3: item file is disabled");
											assert.ok(!oSelect3.getItemByKey("selected").getEnabled(), "Icon 3: item selected is disabled");
											oSelect3.setSelectedIndex(5);
											oSelect3.fireChange({ selectedItem: oSelect3.getItems()[5] });
											var oPicker3 = oSelect3.getPicker();
											// move resolve call to beforeClose event if the picker is about to close to avoid asserting failures
											oPicker3.attachBeforeClose(oPickerBeforeCloseHandler, this);
											oSelect3.focus();
											oSelect3.open();
											EditorQunitUtils.wait().then(async function () {
												assert.ok(oSelect3.getPicker().isOpen(), "Icon 3: Picker opened");
												// Indices 0-2 are the 3 action items (None, Upload, Selected).
												// Real icons start at index 3. The grid reflows based on picker width,
												// so iIconsPerRow is read from the live DOM via _getIconsPerRow().
												// Navigation expressions use: 3 + row * iIconsPerRow + column
												// index 3+2: 3rd icon on first row, guaranteed to be on row 0 for any reasonable picker width
												var iIconsPerRow3 = oFormField3._getIconsPerRow();
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_UP);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 0, "IconSelect 3: Arrow Up navigation correct for 3 < index < 14");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_UP);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 0, "IconSelect 3: Arrow Up navigation correct for index = 0");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_DOWN);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3, "IconSelect 3: Arrow Down navigation correct for index = 0");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_DOWN);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + iIconsPerRow3, "IconSelect 3: Arrow Down navigation correct for index = 3");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_LEFT);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + iIconsPerRow3 - 1, "IconSelect 3: Arrow Left navigation correct for index = 15");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_LEFT);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + iIconsPerRow3 - 2, "IconSelect 3: Arrow Left navigation correct for index = 14");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_LEFT);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + iIconsPerRow3 - 3, "IconSelect 3: Arrow Left navigation correct for index = 13");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_RIGHT);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + iIconsPerRow3 - 2, "IconSelect 3: Arrow Right navigation correct for index = 12");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_RIGHT);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + iIconsPerRow3 - 1, "IconSelect 3: Arrow Right navigation correct for index = 13");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_RIGHT);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + iIconsPerRow3, "IconSelect 3: Arrow Right navigation correct for index = 14");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_DOWN);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + 2 * iIconsPerRow3, "IconSelect 3: Arrow Down navigation correct for index = 15");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_RIGHT);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + 2 * iIconsPerRow3 + 1, "IconSelect 3: Arrow Right navigation correct for index = 27");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_RIGHT);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + 2 * iIconsPerRow3 + 2, "IconSelect 3: Arrow Right navigation correct for index = 28");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_DOWN);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + 3 * iIconsPerRow3 + 2, "IconSelect 3: Arrow Down navigation correct for index = 29");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_UP);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + 2 * iIconsPerRow3 + 2, "IconSelect 3: Arrow Up navigation correct for index = 41");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_UP);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 3 + iIconsPerRow3 + 2, "IconSelect 3: Arrow Up navigation correct for index = 29");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_UP);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 5, "IconSelect 3: Arrow Up navigation correct for index = 17");
												QUnitUtils.triggerKeydown(oSelect3.getDomRef(), KeyCodes.ARROW_UP);
												await nextUIUpdate();
												assert.equal(oSelect3.getSelectedIndex(), 0, "IconSelect 3: Arrow Up navigation correct for index = 5");
												bIsClosedByLosingFocus = false;
												oPicker3.detachBeforeClose(oPickerBeforeCloseHandler, this);
												oPicker3 = null;
												oSelect3.close();
												// close popover manually
												oSelect3.close();
												resolve();
											});
										});
									});
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
