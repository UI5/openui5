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

	var oDefaultNewObject = {"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
	var oDefaultNewObjectSelected = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};

	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("no value or [] as value", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("no value, add with default property values in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
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
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 0, "Table: value length is 0");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field2: Icon Select Viz Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has No value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "0.5", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oFormField.getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							EditorQunitUtils.wait().then(function () {
								assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObjectSelected), "Table: new row data");
								var oRow1 = oTable.getRows()[0];
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), oDefaultNewObjectSelected), "Table: new row");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oDefaultNewObject]), "Field 1: Value after adding");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no value, add with property fields in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
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
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 0, "Table: value length is 0");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field2: Icon Select Viz Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
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
							assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "0.5", "SimpleForm field7: Has value");
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
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sap.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								EditorQunitUtils.wait().then(function () {
									assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
									var oDefaultNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sap.com/06","number": 0.55, "key": "key01", "editable": true, "int": 1, "_dt": {"_selected": true}};
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObject), "Table: new row data");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), oDefaultNewObject), "Table: new row");
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), [{"icon": "sap-icon://accept","text": "text01","url": "https://sap.com/06","number": 0.55, "key": "key01", "editable": true, "int": 1}]), "Field 1: Value after adding");
									resolve();
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("no value, add with TextArea field in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {}
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
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(!oField._getCurrentProperty("value"), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 0, "Table: value length is 0");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field2: Icon Select Viz Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
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
							assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "0.5", "SimpleForm field7: Has value");
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
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sap.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sap.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								EditorQunitUtils.wait().then(function () {
									assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
									var oDefaultNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sap.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55, "_dt": {"_selected": true}};
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObject), "Table: new row data");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), oDefaultNewObject), "Table: new row");
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), [{"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sap.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55}]), "Field 1: Value after adding");
									resolve();
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("[] as value, add with default property values in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 0, "Table: value length is 0");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field2: Icon Select Viz Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field2: Has value");
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
							oFormLabel = oContents[8];
							oFormField = oContents[9];
							assert.equal(oFormLabel.getText(), "Editable", "SimpleForm label5: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
							assert.ok(oFormField.isA("sap.m.CheckBox"), "SimpleForm Field5: CheckBox Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
							assert.ok(oFormField.getEnabled(), "SimpleForm Field5: Enabled");
							assert.ok(!oFormField.getSelected(), "SimpleForm field5: Has No value");
							oFormLabel = oContents[10];
							oFormField = oContents[11];
							assert.equal(oFormLabel.getText(), "Integer", "SimpleForm label6: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field6: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has No value");
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "0.5", "SimpleForm field7: Has value");
							oFormLabel = oContents[14];
							oFormField = oContents[15];
							assert.equal(oFormLabel.getText(), "", "SimpleForm label8: Has no label text");
							assert.ok(!oFormLabel.getVisible(), "SimpleForm label8: Not Visible");
							assert.ok(oFormField.isA("sap.m.TextArea"), "SimpleForm Field8: TextArea Field");
							assert.ok(!oFormField.getVisible(), "SimpleForm Field8: Not Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field8: Editable");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oFormField.getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							oAddButtonInPopover.firePress();
							EditorQunitUtils.wait().then(function () {
								assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObjectSelected), "Table: new row data");
								var oRow1 = oTable.getRows()[0];
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), oDefaultNewObjectSelected), "Table: new row");
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), [oDefaultNewObject]), "Field 1: Value after adding");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("[] as value, add with property values in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 0, "Table: value length is 0");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field2: Icon Select Viz Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
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
							assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "0.5", "SimpleForm field7: Has value");
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
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sap.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								EditorQunitUtils.wait().then(function () {
									assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
									var oDefaultNewObject = {"icon": "sap-icon://accept","text": "text01","url": "https://sap.com/06","number": 0.55, "key": "key01", "editable": true, "int": 1, "_dt": {"_selected": true}};
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObject), "Table: new row data");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), oDefaultNewObject), "Table: new row");
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), [{"icon": "sap-icon://accept","text": "text01","url": "https://sap.com/06","number": 0.55, "key": "key01", "editable": true, "int": 1}]), "Field 1: Value after adding");
									resolve();
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("[] as value, add with TextArea field in popover", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": []
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
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), []), "Field 1: Value");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
						assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
						assert.equal(oTable.getBinding().getCount(), 0, "Table: value length is 0");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						var oClearFilterButton = oToolbar.getContent()[4];
						assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
						var oColumns = oTable.getColumns();
						assert.equal(oColumns.length, 8, "Table: column number is 8");
						var oSelectionColumn = oColumns[0];
						var oSelectOrUnSelectAllButton = oSelectionColumn.getAggregation("multiLabels")[0];
						assert.ok(!oSelectOrUnSelectAllButton.getVisible(), "Table: Select or Unselect All button in Selection column hided");
						assert.equal(oColumns[1].getLabel().getText(), "Key", "Table: column 'Key'");
						assert.equal(oColumns[2].getLabel().getText(), "Icon", "Table: column 'Icon'");
						assert.equal(oColumns[3].getLabel().getText(), "Text", "Table: column 'Text'");
						assert.equal(oColumns[4].getLabel().getText(), "URL Link", "Table: column 'URL Link'");
						assert.equal(oColumns[5].getLabel().getText(), "Editable", "Table: column 'Editable'");
						assert.equal(oColumns[6].getLabel().getText(), "Integer", "Table: column 'Integer'");
						assert.equal(oColumns[7].getLabel().getText(), "Number", "Table: column 'Number'");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oContents[15].getValue()), oDefaultNewObjectSelected), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "Key", "SimpleForm label1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field1: Has No value");
							oFormField.setValue("key01");
							oFormField.fireChange({ value: "key01" });
							oFormLabel = oContents[2];
							oFormField = oContents[3];
							assert.equal(oFormLabel.getText(), "Icon", "SimpleForm label2: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label2: Visible");
							assert.ok(oFormField.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field2: Icon Select Viz Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field2: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field2: Editable");
							assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field2: Has value");
							oFormField.setValue("sap-icon://accept");
							oFormField.fireChange({ value: "sap-icon://accept" });
							oFormLabel = oContents[4];
							oFormField = oContents[5];
							assert.equal(oFormLabel.getText(), "Text", "SimpleForm label3: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label3: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field3: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field3: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field3: Editable");
							assert.equal(oFormField.getValue(), "text", "SimpleForm field3: Has value");
							oFormField.setValue("text01");
							oFormField.fireChange({ value: "text01" });
							oFormLabel = oContents[6];
							oFormField = oContents[7];
							assert.equal(oFormLabel.getText(), "URL", "SimpleForm label4: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label4: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field4: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field4: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field4: Editable");
							assert.equal(oFormField.getValue(), "http://", "SimpleForm field4: Has value");
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
							assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has No value");
							oFormField.setValue("1");
							oFormField.fireChange({value: "1"});
							oFormLabel = oContents[12];
							oFormField = oContents[13];
							assert.equal(oFormLabel.getText(), "Number", "SimpleForm label7: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label7: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field7: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field7: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field7: Editable");
							assert.equal(oFormField.getValue(), "0.5", "SimpleForm field7: Has value");
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
								assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oFormField.getValue()), {"_dt": {"_selected": true},"icon": "sap-icon://accept","text": "text01","url": "https://sap.com/06","number": 0.55,"key": "key01","editable": true,"int": 1}), "SimpleForm field8: Has value");
								var sNewValue = '{\n\t"_dt": {\n\t\t"_selected": true\n\t},\n\t"text new": "textnew",\n\t"text": "text01 2",\n\t"key": "key01 2",\n\t"url": "https://sap.com/06 2",\n\t"icon": "sap-icon://accept 2",\n\t"int": 3,\n\t"editable": false,\n\t"number": 5.55\n}';
								oFormField.setValue(sNewValue);
								oFormField.fireChange({ value: sNewValue});
								var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
								assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
								var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
								assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
								var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
								assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
								var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
								assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
								oAddButtonInPopover.firePress();
								EditorQunitUtils.wait().then(function () {
									assert.equal(oTable.getBinding().getCount(), 1, "Table: value length is 1");
									var oDefaultNewObject = {"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sap.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55, "_dt": {"_selected": true}};
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oTable.getBinding().getContexts()[0].getObject()), oDefaultNewObject), "Table: new row data");
									var oRow1 = oTable.getRows()[0];
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oRow1.getBindingContext().getObject()), oDefaultNewObject), "Table: new row");
									assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), [{"text new": "textnew", "text": "text01 2", "key": "key01 2", "url": "https://sap.com/06 2", "icon": "sap-icon://accept 2", "int": 3, "editable": false, "number": 5.55}]), "Field 1: Value after adding");
									resolve();
								});
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("icon properties in object details popover", function (assert) {
			var oManifestForObjectListFieldsWithPropertiesOnly = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/objectListWithIconPropertiesDefined",
					"type": "List",
					"configuration": {
						"parameters": {
							"objectsWithPropertiesDefined": {
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
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForObjectListFieldsWithPropertiesOnly
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oTable = oField.getAggregation("_field");
						assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
						var oToolbar = oTable.getExtension()[0];
						assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
						var oAddButton = oToolbar.getContent()[1];
						assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover: Content is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 14, "SimpleForm: length");

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
									assert.equal(oFormField2.getValue(), "sap-icon://add", "SimpleForm field3: Has value");

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
										assert.equal(oSelect2.getSelectedIndex(), 1, "IconSelect 2: Arrow Up navigation correct for 3 < index < 14");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 1, "IconSelect 2: Arrow Up navigation correct for index = 1");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 1, "IconSelect 2: Arrow Up navigation correct for index = 1");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_DOWN);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3, "IconSelect 2: Arrow Down navigation correct for index = 1");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_DOWN);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2, "IconSelect 2: Arrow Down navigation correct for index = 3");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_LEFT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 1, "IconSelect 2: Arrow Left navigation correct for index = 15");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_LEFT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 2, "IconSelect 2: Arrow Left navigation correct for index = 14");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_LEFT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 3, "IconSelect 2: Arrow Left navigation correct for index = 13");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_LEFT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 4, "IconSelect 2: Arrow Left navigation correct for index = 12");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 3, "IconSelect 2: Arrow Right navigation correct for index = 11");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 2, "IconSelect 2: Arrow Right navigation correct for index = 12");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 - 1, "IconSelect 2: Arrow Right navigation correct for index = 13");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_DOWN);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 2 * iIconsPerRow2 - 1, "IconSelect 2: Arrow Down navigation correct for index = 14");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 2 * iIconsPerRow2, "IconSelect 2: Arrow Right navigation correct for index = 26");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_RIGHT);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 2 * iIconsPerRow2 + 1, "IconSelect 2: Arrow Right navigation correct for index = 27");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_DOWN);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 3 * iIconsPerRow2 + 1, "IconSelect 2: Arrow Down navigation correct for index = 28");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + 2 * iIconsPerRow2 + 1, "IconSelect 2: Arrow Up navigation correct for index = 40");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 3 + iIconsPerRow2 + 1, "IconSelect 2: Arrow Up navigation correct for index = 28");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 4, "IconSelect 2: Arrow Up navigation correct for index = 16");
										QUnitUtils.triggerKeydown(oSelect2.getDomRef(), KeyCodes.ARROW_UP);
										await nextUIUpdate();
										assert.equal(oSelect2.getSelectedIndex(), 1, "IconSelect 2: Arrow Up navigation correct for index = 4");
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
											assert.equal(oFormField3.getValue(), "sap-icon://add", "SimpleForm field4: Has value");

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

												var oFormLabel = oContents[8];
												var oFormField = oContents[9];
												assert.equal(oFormLabel.getText(), "Icon4", "SimpleForm label5: Has label text");
												assert.ok(oFormLabel.getVisible(), "SimpleForm label5: Visible");
												assert.ok(oFormField.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field5: Icon Select Viz Field");
												assert.ok(oFormField.getVisible(), "SimpleForm Field5: Visible");
												assert.ok(oFormField.getEditable(), "SimpleForm Field5: Editable");
												assert.equal(oFormField.getValue(), "sap-icon://add", "SimpleForm field5: Has value");

												var oSelect4 = oFormField.getAggregation("_control");
												assert.ok(!oSelect4.getItemByKey(IconFormatter.SRC_FOR_HIDDEN_ICON).getEnabled(), "Icon 4: item none is disabled");
												assert.ok(oSelect4.getItemByKey("file").getEnabled(), "Icon 4: item file is enabled");
												assert.ok(!oSelect4.getItemByKey("selected").getEnabled(), "Icon 4: item selected is disabled");

												oFormLabel = oContents[10];
												oFormField = oContents[11];
												assert.equal(oFormLabel.getText(), "Icon5", "SimpleForm label6: Has label text");
												assert.ok(oFormLabel.getVisible(), "SimpleForm label6: Visible");
												assert.ok(oFormField.isA("sap.ui.integration.editor.fields.viz.IconSelect"), "SimpleForm Field6: Icon Select Viz Field");
												assert.ok(oFormField.getVisible(), "SimpleForm Field6: Visible");
												assert.ok(oFormField.getEditable(), "SimpleForm Field6: Editable");
												assert.equal(oFormField.getValue(), "", "SimpleForm field6: Has empty value");

												var oSelect5 = oFormField.getAggregation("_control");
												assert.ok(!oSelect5.getItemByKey(IconFormatter.SRC_FOR_HIDDEN_ICON).getEnabled(), "Icon 5: item none is disabled");
												assert.ok(oSelect5.getItemByKey("file").getEnabled(), "Icon 5: item file is enabled");
												assert.ok(!oSelect5.getItemByKey("selected").getEnabled(), "Icon 5: item selected is disabled");
												bIsClosedByLosingFocus = false;
												oPicker3.detachBeforeClose(oPickerBeforeCloseHandler, this);
												oPicker3 = null;
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

	QUnit.module("backward compatability", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("get current settings with old values", function (assert) {
			var oValue = [
				{"icon": "sap-icon://add", "text": "text1", "url": "http://"},
				{"icon": "sap-icon://add", "text": "text2", "url": "http://"},
				{"icon": "sap-icon://add", "text": "text3", "url": "http://"},
				{"icon": "sap-icon://add", "text": "text4", "url": "http://"}
			];
			var oValueInCurrentSettings = [
				{"icon": "sap-icon://add", "text": "text1", "url": "http://", "_dt": {"_position": 1}},
				{"icon": "sap-icon://add", "text": "text2", "url": "http://", "_dt": {"_position": 2}},
				{"icon": "sap-icon://add", "text": "text3", "url": "http://", "_dt": {"_position": 3}},
				{"icon": "sap-icon://add", "text": "text4", "url": "http://", "_dt": {"_position": 4}}
			];
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/objectListWithPropertiesDefinedOnly",
						"type": "List",
						"configuration": {
							"parameters": {
								"objectsWithPropertiesDefined": {
									"value": oValue
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
					assert.equal(oLabel.getText(), "Object properties defined", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(EditorQunitUtils.cleanUUIDAndPosition(oField._getCurrentProperty("value")), oValue), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					assert.ok(oTable.getEnableSelectAll(), "Table: SelectAll enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 4, "Table: value length is 4");
					var oToolbar = oTable.getExtension()[0];
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oClearFilterButton = oToolbar.getContent()[4];
					assert.ok(oClearFilterButton.getVisible(), "Table toolbar: clear filter button visible");
					var oSettings = this.oEditor.getCurrentSettings();
					assert.deepEqual(oSettings["/sap.card/configuration/parameters/objectsWithPropertiesDefined/value"], oValueInCurrentSettings, "Editor: field 1 setting value");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
