/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap-ui-integration-editor",
	"sap/ui/core/Element",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Host",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
	"qunit/designtime/EditorQunitUtils",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone"
], function(
	Localization,
	x,
	Element,
	Editor,
	CardEditor,
	Host,
	nextUIUpdate,
	sinon,
	ContextHost,
	EditorQunitUtils,
	deepEqual,
	deepClone
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/childEditors/";

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	var oDefaultNewObject = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};

	QUnit.module("admin mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
			this.oEditor.setMode("admin");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("main editor with no change", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						var oTitleLabel = aFormContents[1];
						var oTitleField = aFormContents[2];
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

						var oMaxItemLabel = aFormContents[3];
						var oMaxItemField = aFormContents[4];
						assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
						assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
						assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
						assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
						assert.equal(oMaxItemField.getAggregation("_field").getValue(), 3, "MaxItem Field: Integer Value");

						var oCustomerLabel = aFormContents[5];
						var oCustomerField = aFormContents[6];
						assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
						assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
						assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
						var oCustomerFieldControl = oCustomerField.getAggregation("_field");
						assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
						assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
						assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
						assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");

						var oObjectLabel = aFormContents[7];
						var oObjectField = aFormContents[8];
						assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
						assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
						assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
						assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
						var oObjectFieldControl = oObjectField.getAggregation("_field");
						assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
						assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
						assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
						assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

						var oObjectsLabel = aFormContents[9];
						var oObjectsField = aFormContents[10];
						assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
						assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
						assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
						assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
						var oObjectsFieldControl = oObjectsField.getAggregation("_field");
						assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
						assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
						assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
						assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

						var oDestinationNorthWindLabel = aFormContents[12];
						var oDestinationNorthWindField = aFormContents[13];
						assert.ok(oDestinationNorthWindLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oDestinationNorthWindLabel.getText(), "northwind", "Label: Has northwind label from destination settings name");
						assert.ok(oDestinationNorthWindField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

						var oDestinationMockLabel = aFormContents[14];
						var oDestinationMockField = aFormContents[15];
						assert.ok(oDestinationMockLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oDestinationMockLabel.getText(), "mock_request", "Label: Has mock_request label from destination settings name");
						assert.ok(oDestinationMockField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
							}, "Editor settings are OK");
						resolve();
					});
				});
			});
		});

		QUnit.test("main editor with changes in main editor 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oTitleLabel = aFormContents[1];
						var oTitleField = aFormContents[2];
						var oTitleFieldControl = oTitleField.getAggregation("_field");
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
						oTitleFieldControl.setValue("string value 1");
						oTitleFieldControl.fireChange({ value: "string value 1"});
						assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

						var oMaxItemLabel = aFormContents[3];
						var oMaxItemField = aFormContents[4];
						var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
						assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
						assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
						assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
						assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
						assert.equal(oMaxItemFieldControl.getValue(), 3, "MaxItem Field: Integer Value");
						oMaxItemFieldControl.setValue(4);
						oMaxItemFieldControl.fireChange({ value: 4});
						assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

						var oCustomerLabel = aFormContents[5];
						var oCustomerField = aFormContents[6];
						assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
						assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
						assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
						var oCustomerFieldControl = oCustomerField.getAggregation("_field");
						assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
						assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
						assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
						assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");
						oCustomerFieldControl.setSelectedKey("b");
						oCustomerFieldControl.fireChange({ selectedItem: oCustomerFieldControl.getItemByKey("b") });

						await nextUIUpdate();

						var oObjectLabel = aFormContents[7];
						var oObjectField = aFormContents[8];
						assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
						assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
						assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
						assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
						var oObjectFieldControl = oObjectField.getAggregation("_field");
						assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
						assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
						assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
						assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");
						var oObjectFieldTableRow1 = oObjectFieldControl.getRows()[0];
						var oObjectFieldTableRow1SelectionCell1 = oObjectFieldTableRow1.getCells()[0];
						assert.ok(oObjectFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Object Field Table Row 1: Cell 1 is CheckBox");
						assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is not selected");
						oObjectFieldTableRow1SelectionCell1.setSelected(true);
						oObjectFieldTableRow1SelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is selected after selecting");
						assert.equal(oObjectFieldControl.getSelectedIndices().length, 0, "Object Field Table: SelectedIndices Value not change after selecting");
						var newObjectFieldValue = oObjectField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), {
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false
							}
						}, "Object Field: DT Value changed after selecting");

						var oObjectsLabel = aFormContents[9];
						var oObjectsField = aFormContents[10];
						assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
						assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
						assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
						assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
						var oObjectsFieldControl = oObjectsField.getAggregation("_field");
						assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
						assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
						assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
						assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");
						var oObjectsFieldTableRow1 = oObjectsFieldControl.getRows()[0];
						var oObjectsFieldTableRow1SelectionCell1 = oObjectsFieldTableRow1.getCells()[0];
						assert.ok(oObjectsFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Objects Field Table Row 1: Cell 1 is CheckBox");
						assert.ok(!oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is not selected");
						oObjectsFieldTableRow1SelectionCell1.setSelected(true);
						oObjectsFieldTableRow1SelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is selected after selecting");
						assert.equal(oObjectsFieldControl.getSelectedIndices().length, 0, "Objects Field Table: SelectedIndices Value not change after selecting");
						var newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue[0]), {
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false,
								"_position": 1
							}
						}, "Objects Field: DT Value changed after selecting");

						var oDestinationNorthWindLabel = aFormContents[12];
						var oDestinationNorthWindField = aFormContents[13];
						assert.ok(oDestinationNorthWindLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oDestinationNorthWindLabel.getText(), "northwind", "Label: Has northwind label from destination settings name");
						assert.ok(oDestinationNorthWindField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

						var oDestinationMockLabel = aFormContents[14];
						var oDestinationMockField = aFormContents[15];
						assert.ok(oDestinationMockLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oDestinationMockLabel.getText(), "mock_request", "Label: Has mock_request label from destination settings name");
						assert.ok(oDestinationMockField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// add new value (defaut) for object field
						var oObjectFieldTableBar = oObjectFieldControl.getExtension()[0];
						assert.equal(oObjectFieldTableBar.getContent().length, 7, "Object field Table toolbar: content length");
						var oObjectFieldAddButton = oObjectFieldTableBar.getContent()[1];
						assert.ok(oObjectFieldAddButton.getVisible(), "Object field Table toolbar: add button visible");
						oObjectFieldAddButton.firePress();
						await nextUIUpdate();

						var oSimpleForm = oObjectField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Object field Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 20, "Object field SimpleForm: length");
						var oFormTextArearLabel = oContents[18];
						var oFormTextAreaField = oContents[19];
						assert.equal(oFormTextArearLabel.getText(), "", "Object field SimpleForm label8: Has no label text");
						assert.ok(!oFormTextArearLabel.getVisible(), "Object field SimpleForm label8: Not Visible");
						assert.ok(oFormTextAreaField.isA("sap.m.TextArea"), "Object field SimpleForm Field8: TextArea Field");
						assert.ok(!oFormTextAreaField.getVisible(), "Object field SimpleForm Field8: Not Visible");
						assert.ok(oFormTextAreaField.getEditable(), "Object field SimpleForm Field8: Editable");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oFormTextAreaField.getValue()), oDefaultNewObject), "Object field SimpleForm field textArea: Has Default value");

						var oAddButtonInPopover = oObjectField._oObjectDetailsPopover._oAddButton;
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						oAddButtonInPopover.firePress();
						await nextUIUpdate();

						assert.equal(oObjectFieldControl.getBinding().getCount(), 9, "Object field Table: value length is 9");
						assert.deepEqual(EditorQunitUtils.cleanUUID(oObjectFieldControl.getBinding().getContexts()[8].getObject()), oDefaultNewObject, "Object field Table: new row data");
						assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object field Table Row 1: Cell 1 is not selected after new row added");

						newObjectFieldValue = oObjectField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), EditorQunitUtils.cleanDT(oDefaultNewObject), "Object Field: DT Value changed after selecting");

						oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 0
						}, "Editor settings are OK afeter adding new default value for object field");

						// add new value (defaut) for objects field
						var oObjectsFieldTableBar = oObjectsFieldControl.getExtension()[0];
						assert.equal(oObjectsFieldTableBar.getContent().length, 9, "Objects field Table toolbar: content length");
						var oObjectsFieldAddButton = oObjectsFieldTableBar.getContent()[1];
						assert.ok(oObjectsFieldAddButton.getVisible(), "Objects field Table toolbar: add button visible");
						oObjectsFieldAddButton.firePress();
						await nextUIUpdate();

						oSimpleForm = oObjectsField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Objects field Popover: Content is SimpleForm");
						oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 20, "Objects field SimpleForm: length");
						oFormTextArearLabel = oContents[18];
						oFormTextAreaField = oContents[19];
						assert.equal(oFormTextArearLabel.getText(), "", "Objects field SimpleForm label8: Has no label text");
						assert.ok(!oFormTextArearLabel.getVisible(), "Objects field SimpleForm label8: Not Visible");
						assert.ok(oFormTextAreaField.isA("sap.m.TextArea"), "Objects field SimpleForm Field8: TextArea Field");
						assert.ok(!oFormTextAreaField.getVisible(), "Objects field SimpleForm Field8: Not Visible");
						assert.ok(oFormTextAreaField.getEditable(), "Objects field SimpleForm Field8: Editable");
						var oDefaultNewObjectClone = deepClone(oDefaultNewObject);
						oDefaultNewObjectClone._dt._position = 9;
						assert.deepEqual(EditorQunitUtils.cleanUUID(oFormTextAreaField.getValue()), oDefaultNewObject, "Objects field SimpleForm field textArea: Has Default value");

						oAddButtonInPopover = oObjectsField._oObjectDetailsPopover._oAddButton;
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						oAddButtonInPopover.firePress();
						await nextUIUpdate();

						assert.equal(oObjectsFieldControl.getBinding().getCount(), 9, "Objects field Table: value length is 9");
						assert.deepEqual(EditorQunitUtils.cleanUUID(oObjectsFieldControl.getBinding().getContexts()[8].getObject()), oDefaultNewObjectClone, "Objects field Table: new row data");
						assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects field Table Row 1: Cell 1 is still selected after new row added");

						newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
						delete oDefaultNewObjectClone._dt._selected;
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue), [{
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false,
								"_position": 1
							}
						}, oDefaultNewObjectClone], "Objects Field: DT Value changed after selecting");

						oSettings = that.oEditor.getCurrentSettings();
						// in settings, the _position in dt of each value of Object List Field will be replaced with order of appearance in the array
						newObjectsFieldValue[0]._dt._position = 1;
						newObjectsFieldValue[1]._dt._position = 2;
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 0
						}, "Editor settings are OK afeter adding new default value for object field");

						resolve();
					});
				});
			});
		});

		QUnit.test("main editor with changes in main editor 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oTitleLabel = aFormContents[1];
						var oTitleField = aFormContents[2];
						var oTitleFieldControl = oTitleField.getAggregation("_field");
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
						oTitleFieldControl.setValue("string value 1");
						oTitleFieldControl.fireChange({ value: "string value 1"});
						assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

						var oMaxItemLabel = aFormContents[3];
						var oMaxItemField = aFormContents[4];
						var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
						assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
						assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
						assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
						assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
						assert.equal(oMaxItemFieldControl.getValue(), 3, "MaxItem Field: Integer Value");
						oMaxItemFieldControl.setValue(4);
						oMaxItemFieldControl.fireChange({ value: 4});
						assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

						var oCustomerLabel = aFormContents[5];
						var oCustomerField = aFormContents[6];
						assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
						assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
						assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
						var oCustomerFieldControl = oCustomerField.getAggregation("_field");
						assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
						assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
						assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
						assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");
						oCustomerFieldControl.setSelectedKey("b");
						oCustomerFieldControl.fireChange({ selectedItem: oCustomerFieldControl.getItemByKey("b") });

						await nextUIUpdate();

						var oObjectLabel = aFormContents[7];
						var oObjectField = aFormContents[8];
						assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
						assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
						assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
						assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
						var oObjectFieldControl = oObjectField.getAggregation("_field");
						assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
						assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
						assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
						assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");
						var oObjectFieldTableRow1 = oObjectFieldControl.getRows()[0];
						var oObjectFieldTableRow1SelectionCell1 = oObjectFieldTableRow1.getCells()[0];
						assert.ok(oObjectFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Object Field Table Row 1: Cell 1 is CheckBox");
						assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is not selected");
						oObjectFieldTableRow1SelectionCell1.setSelected(true);
						oObjectFieldTableRow1SelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is selected after selecting");
						assert.equal(oObjectFieldControl.getSelectedIndices().length, 0, "Object Field Table: SelectedIndices Value not change after selecting");
						var newObjectFieldValue = oObjectField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), {
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false
							}
						}, "Object Field: DT Value changed after selecting");

						var oObjectsLabel = aFormContents[9];
						var oObjectsField = aFormContents[10];
						assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
						assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
						assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
						assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
						var oObjectsFieldControl = oObjectsField.getAggregation("_field");
						assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
						assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
						assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
						assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");
						var oObjectsFieldTableRow1 = oObjectsFieldControl.getRows()[0];
						var oObjectsFieldTableRow1SelectionCell1 = oObjectsFieldTableRow1.getCells()[0];
						assert.ok(oObjectsFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Objects Field Table Row 1: Cell 1 is CheckBox");
						assert.ok(!oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is not selected");
						oObjectsFieldTableRow1SelectionCell1.setSelected(true);
						oObjectsFieldTableRow1SelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is selected after selecting");
						assert.equal(oObjectsFieldControl.getSelectedIndices().length, 0, "Objects Field Table: SelectedIndices Value not change after selecting");
						var newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue[0]), {
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false,
								"_position": 1
							}
						}, "Objects Field: DT Value changed after selecting");

						var oDestinationNorthWindLabel = aFormContents[12];
						var oDestinationNorthWindField = aFormContents[13];
						assert.ok(oDestinationNorthWindLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oDestinationNorthWindLabel.getText(), "northwind", "Label: Has northwind label from destination settings name");
						assert.ok(oDestinationNorthWindField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

						var oDestinationMockLabel = aFormContents[14];
						var oDestinationMockField = aFormContents[15];
						assert.ok(oDestinationMockLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oDestinationMockLabel.getText(), "mock_request", "Label: Has mock_request label from destination settings name");
						assert.ok(oDestinationMockField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// add new value (defaut) for object field
						var oObjectFieldTableBar = oObjectFieldControl.getExtension()[0];
						assert.equal(oObjectFieldTableBar.getContent().length, 7, "Object field Table toolbar: content length");
						var oObjectFieldAddButton = oObjectFieldTableBar.getContent()[1];
						assert.ok(oObjectFieldAddButton.getVisible(), "Object field Table toolbar: add button visible");
						oObjectFieldAddButton.firePress();
						await nextUIUpdate();

						var oSimpleForm = oObjectField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Object field Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 20, "Object field SimpleForm: length");
						var oFormTextArearLabel = oContents[18];
						var oFormTextAreaField = oContents[19];
						assert.equal(oFormTextArearLabel.getText(), "", "Object field SimpleForm label8: Has no label text");
						assert.ok(!oFormTextArearLabel.getVisible(), "Object field SimpleForm label8: Not Visible");
						assert.ok(oFormTextAreaField.isA("sap.m.TextArea"), "Object field SimpleForm Field8: TextArea Field");
						assert.ok(!oFormTextAreaField.getVisible(), "Object field SimpleForm Field8: Not Visible");
						assert.ok(oFormTextAreaField.getEditable(), "Object field SimpleForm Field8: Editable");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oFormTextAreaField.getValue()), oDefaultNewObject), "Object field SimpleForm field textArea: Has Default value");

						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "Object field SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "Object field SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "Object field SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "Object field SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "Object field SimpleForm Field1: Editable");
						assert.equal(oFormField.getValue(), "", "Object field SimpleForm field1: Has No value");
						oFormField.setValue("key01");
						oFormField.fireChange({ value: "key01" });
						await nextUIUpdate();

						var oAddButtonInPopover = oObjectField._oObjectDetailsPopover._oAddButton;
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						oAddButtonInPopover.firePress();
						await nextUIUpdate();

						assert.equal(oObjectFieldControl.getBinding().getCount(), 9, "Object field Table: value length is 9");
						var oUpdatedNewObject = deepClone(oDefaultNewObject);
						oUpdatedNewObject.key = "key01";
						assert.deepEqual(EditorQunitUtils.cleanUUID(oObjectFieldControl.getBinding().getContexts()[8].getObject()), oUpdatedNewObject, "Object field Table: new row data");
						assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object field Table Row 1: Cell 1 is not selected after new row added");

						newObjectFieldValue = oObjectField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), EditorQunitUtils.cleanDT(oUpdatedNewObject), "Object Field: DT Value changed after selecting");

						oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 0
						}, "Editor settings are OK afeter adding new default value for object field");

						// add new value (defaut) for objects field
						var oObjectsFieldTableBar = oObjectsFieldControl.getExtension()[0];
						assert.equal(oObjectsFieldTableBar.getContent().length, 9, "Objects field Table toolbar: content length");
						var oObjectsFieldAddButton = oObjectsFieldTableBar.getContent()[1];
						assert.ok(oObjectsFieldAddButton.getVisible(), "Objects field Table toolbar: add button visible");
						oObjectsFieldAddButton.firePress();
						await nextUIUpdate();

						oSimpleForm = oObjectsField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Objects field Popover: Content is SimpleForm");
						oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 20, "Objects field SimpleForm: length");
						oFormTextArearLabel = oContents[18];
						oFormTextAreaField = oContents[19];
						assert.equal(oFormTextArearLabel.getText(), "", "Objects field SimpleForm label8: Has no label text");
						assert.ok(!oFormTextArearLabel.getVisible(), "Objects field SimpleForm label8: Not Visible");
						assert.ok(oFormTextAreaField.isA("sap.m.TextArea"), "Objects field SimpleForm Field8: TextArea Field");
						assert.ok(!oFormTextAreaField.getVisible(), "Objects field SimpleForm Field8: Not Visible");
						assert.ok(oFormTextAreaField.getEditable(), "Objects field SimpleForm Field8: Editable");
						oUpdatedNewObject = deepClone(oDefaultNewObject);
						oUpdatedNewObject._dt._position = 9;
						assert.deepEqual(EditorQunitUtils.cleanUUID(oFormTextAreaField.getValue()), oDefaultNewObject, "Objects field SimpleForm field textArea: Has Default value");

						oFormLabel = oContents[0];
						oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "Objects field SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "Objects field SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "Objects field SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "Objects field SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "Objects field SimpleForm Field1: Editable");
						assert.equal(oFormField.getValue(), "", "Objects field SimpleForm field1: Has No value");
						oFormField.setValue("key02");
						oFormField.fireChange({ value: "key02" });
						await nextUIUpdate();

						oAddButtonInPopover = oObjectsField._oObjectDetailsPopover._oAddButton;
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						oAddButtonInPopover.firePress();
						await nextUIUpdate();

						oUpdatedNewObject.key = "key02";
						assert.equal(oObjectsFieldControl.getBinding().getCount(), 9, "Objects field Table: value length is 9");
						assert.deepEqual(EditorQunitUtils.cleanUUID(oObjectsFieldControl.getBinding().getContexts()[8].getObject()), oUpdatedNewObject, "Objects field Table: new row data");
						assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects field Table Row 1: Cell 1 is still selected after new row added");

						newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
						delete oUpdatedNewObject._dt._selected;
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue), [{
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false,
								"_position": 1
							}
						}, oUpdatedNewObject], "Objects Field: DT Value changed after selecting");

						oSettings = that.oEditor.getCurrentSettings();
						// in settings, the _position in dt of each value of Object List Field will be replaced with order of appearance in the array
						newObjectsFieldValue[0]._dt._position = 1;
						newObjectsFieldValue[1]._dt._position = 2;
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 0
						}, "Editor settings are OK afeter adding new default value for object field");

						resolve();
					});
				});
			});
		});

		QUnit.test("child1 with no change", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");
								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child1 with changes", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(async function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
								oTitleFieldControl.setValue("string value 1");
								oTitleFieldControl.fireChange({ value: "string value 1"});
								assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

								var oMaxItemLabel = aFormContents[3];
								var oMaxItemField = aFormContents[4];
								var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Integer Value");
								oMaxItemFieldControl.setValue(5);
								oMaxItemFieldControl.fireChange({ value: 5});
								assert.equal(oMaxItemFieldControl.getValue(), 5, "MaxItem Field: Has new value");

								var oEmployeeLabel = aFormContents[5];
								var oEmployeeField = aFormContents[6];
								assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
								assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
								assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
								var oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
								assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
								assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
								assert.equal(oEmployeeFieldControl.getSelectedKey(), 1, "Employee Field: Key Value");
								assert.equal(oEmployeeFieldControl.getValue(), "FirstName1 LastName1", "Employee Field: String Value");
								oEmployeeFieldControl.setSelectedKey("2");
								oEmployeeFieldControl.fireChange({ selectedItem: oEmployeeFieldControl.getItemByKey("2") });

								await nextUIUpdate();

								var oObjectLabel = aFormContents[7];
								var oObjectField = aFormContents[8];
								assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
								assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
								assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
								assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
								var oObjectFieldControl = oObjectField.getAggregation("_field");
								assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
								assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
								assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
								assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");
								var oObjectFieldTableRow1 = oObjectFieldControl.getRows()[0];
								var oObjectFieldTableRow1SelectionCell1 = oObjectFieldTableRow1.getCells()[0];
								assert.ok(oObjectFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Object Field Table Row 1: Cell 1 is CheckBox");
								assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is not selected");
								oObjectFieldTableRow1SelectionCell1.setSelected(true);
								oObjectFieldTableRow1SelectionCell1.fireSelect({
									selected: true
								});
								assert.ok(oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is selected after selecting");
								assert.equal(oObjectFieldControl.getSelectedIndices().length, 0, "Object Field Table: SelectedIndices Value not change after selecting");
								var newObjectFieldValue = oObjectField._getCurrentProperty("value");
								assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), {
									"text": "text01",
									"key": "key01",
									"url": "https://sap.com/06",
									"icon": "sap-icon://accept",
									"iconcolor": "#031E48",
									"int": 1,
									"object": {
										"key": "key01",
										"text":"text01"
									},
									"type": "type01",
									"_dt": {
										"_editable": false
									}
								}, "Object Field: DT Value changed after selecting");

								var oObjectsLabel = aFormContents[9];
								var oObjectsField = aFormContents[10];
								assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
								assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
								assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
								assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
								var oObjectsFieldControl = oObjectsField.getAggregation("_field");
								assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
								assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
								assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
								assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");
								var oObjectsFieldTableRow1 = oObjectsFieldControl.getRows()[0];
								var oObjectsFieldTableRow1SelectionCell1 = oObjectsFieldTableRow1.getCells()[0];
								assert.ok(oObjectsFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Objects Field Table Row 1: Cell 1 is CheckBox");
								assert.ok(!oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is not selected");
								oObjectsFieldTableRow1SelectionCell1.setSelected(true);
								oObjectsFieldTableRow1SelectionCell1.fireSelect({
									selected: true
								});
								assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is selected after selecting");
								assert.equal(oObjectsFieldControl.getSelectedIndices().length, 0, "Objects Field Table: SelectedIndices Value not change after selecting");
								var newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
								assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue[0]), {
									"text": "text01",
									"key": "key01",
									"url": "https://sap.com/06",
									"icon": "sap-icon://accept",
									"iconcolor": "#031E48",
									"int": 1,
									"object": {
										"key": "key01",
										"text":"text01"
									},
									"type": "type01",
									"_dt": {
										"_editable": false,
										"_position": 1
									}
								}, "Objects Field: DT Value changed after selecting");

								await nextUIUpdate();

								assert.deepEqual(that.oEditor.getCurrentSettings(), {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										"/sap.card/configuration/parameters/Employee/value": "2",
										"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
										"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
										"texts": {
											"en": {
											"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
											}
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-1 with no change 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								// simulate to click child1-1
								that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
										assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
										assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
										assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
										assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
										assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
										assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 4,
												"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
													"/sap.card/configuration/parameters/Customer/value": "b",
													"/sap.card/configuration/parameters/Employee/value": "2",
													"/sap.card/configuration/parameters/maxItems/value": 6,
													":errors": false,
													":layer": 0
												},
												":errors": false,
												":layer": 0
											},
											"/sap.card/configuration/destinations/mock_request/name": "mock_request",
											"/sap.card/configuration/destinations/northwind/name": "Northwind",
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 0
										}, "Editor settings are OK");

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-1 with changes 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								// simulate to click child1-1
								that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(async function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
										assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
										assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
										assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
										assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
										assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
										assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 4,
												"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
													"/sap.card/configuration/parameters/Customer/value": "b",
													"/sap.card/configuration/parameters/Employee/value": "2",
													"/sap.card/configuration/parameters/maxItems/value": 6,
													":errors": false,
													":layer": 0
												},
												":errors": false,
												":layer": 0
											},
											"/sap.card/configuration/destinations/mock_request/name": "mock_request",
											"/sap.card/configuration/destinations/northwind/name": "Northwind",
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 0
										}, "Editor settings are OK");

										var oTitleLabel = aFormContents[1];
										var oTitleField = aFormContents[2];
										var oTitleFieldControl = oTitleField.getAggregation("_field");
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
										oTitleFieldControl.setValue("string value 1");
										oTitleFieldControl.fireChange({ value: "string value 1"});
										assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

										var oMaxItemLabel = aFormContents[3];
										var oMaxItemField = aFormContents[4];
										var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemFieldControl.getValue(), 6, "MaxItem Field: Integer Value");
										oMaxItemFieldControl.setValue(4);
										oMaxItemFieldControl.fireChange({ value: 4});
										assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

										var oCustomerLabel = aFormContents[5];
										var oCustomerField = aFormContents[6];
										assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
										assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
										assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
										var oCustomerFieldControl = oCustomerField.getAggregation("_field");
										assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
										assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
										assert.equal(oCustomerFieldControl.getSelectedKey(), "b", "Customer Field: Key Value");
										assert.equal(oCustomerFieldControl.getValue(), "B Company", "Customer Field: String Value");
										oCustomerFieldControl.setSelectedKey("a");
										oCustomerFieldControl.fireChange({ selectedItem: oCustomerFieldControl.getItemByKey("a") });

										var oEmployeeLabel = aFormContents[7];
										var oEmployeeField = aFormContents[8];
										assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
										assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
										assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
										var oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
										assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
										assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
										assert.equal(oEmployeeFieldControl.getSelectedKey(), 2, "Employee Field: Key Value");
										assert.equal(oEmployeeFieldControl.getValue(), "FirstName2 LastName2", "Employee Field: String Value");
										oEmployeeFieldControl.setSelectedKey("1");
										oEmployeeFieldControl.fireChange({ selectedItem: oEmployeeFieldControl.getItemByKey("1") });

										await nextUIUpdate();

										assert.deepEqual(that.oEditor.getCurrentSettings(), {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 4,
												"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
													"/sap.card/configuration/parameters/Customer/value": "a",
													"/sap.card/configuration/parameters/Employee/value": "1",
													"/sap.card/configuration/parameters/maxItems/value": 4,
													"texts": {
														"en": {
														"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
														}
													},
													":errors": false,
													":layer": 0
												},
												":errors": false,
												":layer": 0
											},
											"/sap.card/configuration/destinations/mock_request/name": "mock_request",
											"/sap.card/configuration/destinations/northwind/name": "Northwind",
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 0
										}, "Editor settings are OK");

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-1 with no change 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// expand child1
						var oArrow = Element.getElementById(oItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// simulate to click child1-1
						that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
											"/sap.card/configuration/parameters/Customer/value": "b",
											"/sap.card/configuration/parameters/Employee/value": "2",
											"/sap.card/configuration/parameters/maxItems/value": 6,
											":errors": false,
											":layer": 0
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-1 with changes 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// expand child1
						var oArrow = Element.getElementById(oItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// simulate to click child1-1
						that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(async function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
											"/sap.card/configuration/parameters/Customer/value": "b",
											"/sap.card/configuration/parameters/Employee/value": "2",
											"/sap.card/configuration/parameters/maxItems/value": 6,
											":errors": false,
											":layer": 0
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
								oTitleFieldControl.setValue("string value 1");
								oTitleFieldControl.fireChange({ value: "string value 1"});
								assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

								var oMaxItemLabel = aFormContents[3];
								var oMaxItemField = aFormContents[4];
								var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemFieldControl.getValue(), 6, "MaxItem Field: Integer Value");
								oMaxItemFieldControl.setValue(4);
								oMaxItemFieldControl.fireChange({ value: 4});
								assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

								var oCustomerLabel = aFormContents[5];
								var oCustomerField = aFormContents[6];
								assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
								assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
								assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
								var oCustomerFieldControl = oCustomerField.getAggregation("_field");
								assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
								assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
								assert.equal(oCustomerFieldControl.getSelectedKey(), "b", "Customer Field: Key Value");
								assert.equal(oCustomerFieldControl.getValue(), "B Company", "Customer Field: String Value");
								oCustomerFieldControl.setSelectedKey("a");
								oCustomerFieldControl.fireChange({ selectedItem: oCustomerFieldControl.getItemByKey("a") });

								var oEmployeeLabel = aFormContents[7];
								var oEmployeeField = aFormContents[8];
								assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
								assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
								assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
								var oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
								assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
								assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
								assert.equal(oEmployeeFieldControl.getSelectedKey(), 2, "Employee Field: Key Value");
								assert.equal(oEmployeeFieldControl.getValue(), "FirstName2 LastName2", "Employee Field: String Value");
								oEmployeeFieldControl.setSelectedKey("1");
								oEmployeeFieldControl.fireChange({ selectedItem: oEmployeeFieldControl.getItemByKey("1") });

								await nextUIUpdate();

								assert.deepEqual(that.oEditor.getCurrentSettings(), {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/Employee/value": "1",
											"/sap.card/configuration/parameters/maxItems/value": 4,
											"texts": {
												"en": {
												"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
												}
											},
											":errors": false,
											":layer": 0
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
									}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-2 with no change 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								// simulate to click child1-2
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 7, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
										assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
										assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
										assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
										assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
										assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
										assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 4,
												"/sap.card/configuration/childCards/child1-2/_manifestChanges": {
													"/sap.card/configuration/parameters/Order/value": "1",
													"/sap.card/configuration/parameters/maxItems/value": 5,
													":errors": false,
													":layer": 0
												},
												":errors": false,
												":layer": 0
											},
											"/sap.card/configuration/destinations/mock_request/name": "mock_request",
											"/sap.card/configuration/destinations/northwind/name": "Northwind",
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 0
										}, "Editor settings are OK");

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-2 with no change 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// expand child1
						var oArrow = Element.getElementById(oItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// simulate to click child1-2
						that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 7, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/childCards/child1-2/_manifestChanges": {
											"/sap.card/configuration/parameters/Order/value": "1",
											"/sap.card/configuration/parameters/maxItems/value": 5,
											":errors": false,
											":layer": 0
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child2 with no change", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");


								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");
								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child2 with changes", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
								oTitleFieldControl.setValue("string value 1");
								oTitleFieldControl.fireChange({ value: "string value 1"});
								assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

								var oMaxItemLabel = aFormContents[3];
								var oMaxItemField = aFormContents[4];
								var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemFieldControl.getValue(), 5, "MaxItem Field: Integer Value");
								oMaxItemFieldControl.setValue(4);
								oMaxItemFieldControl.fireChange({ value: 4});
								assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 4,
										"texts": {
											"en": {
											"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
											}
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child2-1 with no change 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");


								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								// simulate to click child2-1
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										var oTitleLabel = aFormContents[1];
										var oTitleField = aFormContents[2];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Child Card Title Child2-1", "Title Field: String Value");

										var oStringLabel = aFormContents[3];
										var oStringField = aFormContents[4];
										assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
										assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
										assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
										assert.ok(oStringField.getAggregation("_field").isA("sap.m.Input"), "String Field: Control is an Input");
										assert.equal(oStringField.getAggregation("_field").getValue(), "StringValue Child2-1", "String Field: String Value");

										assert.ok(that.oEditor._oChildTree.getItems()[2].getExpanded(), "Child tree item 2 expanded: true");
										assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
										var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
										assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
										assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
										assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child2/_manifestChanges": {
												"/sap.card/configuration/parameters/maxItems/value": 5,
												"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
													"/sap.card/configuration/parameters/string/value": "StringValue Child2-1",
													":errors": false,
													":layer": 0
												},
												":errors": false,
												":layer": 0
											},
											"/sap.card/configuration/destinations/mock_request/name": "mock_request",
											"/sap.card/configuration/destinations/northwind/name": "Northwind",
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 0
										}, "Editor settings are OK");

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child2-1 with changes 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");


								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								// simulate to click child2-1
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										var oTitleLabel = aFormContents[1];
										var oTitleField = aFormContents[2];
										var oTitleFieldControl = oTitleField.getAggregation("_field");
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleFieldControl.getValue(), "Child Card Title Child2-1", "Title Field: String Value");

										var oStringLabel = aFormContents[3];
										var oStringField = aFormContents[4];
										var oStringFieldControl = oStringField.getAggregation("_field");
										assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
										assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
										assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
										assert.ok(oStringFieldControl.isA("sap.m.Input"), "String Field: Control is an Input");
										assert.equal(oStringFieldControl.getValue(), "StringValue Child2-1", "String Field: String Value");

										assert.ok(that.oEditor._oChildTree.getItems()[2].getExpanded(), "Child tree item 2 expanded: true");
										assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
										var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
										assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
										assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
										assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child2/_manifestChanges": {
												"/sap.card/configuration/parameters/maxItems/value": 5,
												"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
													"/sap.card/configuration/parameters/string/value": "StringValue Child2-1",
													":errors": false,
													":layer": 0
												},
												":errors": false,
												":layer": 0
											},
											"/sap.card/configuration/destinations/mock_request/name": "mock_request",
											"/sap.card/configuration/destinations/northwind/name": "Northwind",
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 0
										}, "Editor settings are OK");

										oTitleFieldControl.setValue("string value 1");
										oTitleFieldControl.fireChange({ value: "string value 1"});
										assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

										oStringFieldControl.setValue("StringValue Child2-1 updated");
										oStringFieldControl.fireChange({ value: "StringValue Child2-1 updated"});
										assert.equal(oStringFieldControl.getValue(), "StringValue Child2-1 updated", "String Field: Has new value");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child2/_manifestChanges": {
												"/sap.card/configuration/parameters/maxItems/value": 5,
												"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
													"/sap.card/configuration/parameters/string/value": "StringValue Child2-1 updated",
													"texts": {
														"en": {
														"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
														}
													},
													":errors": false,
													":layer": 0
												},
												":errors": false,
												":layer": 0
											},
											"/sap.card/configuration/destinations/mock_request/name": "mock_request",
											"/sap.card/configuration/destinations/northwind/name": "Northwind",
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 0
										}, "Editor settings are OK");
										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child2-1 with no change 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
						assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

						// simulate to click child2-1
						that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Child Card Title Child2-1", "Title Field: String Value");

								var oStringLabel = aFormContents[3];
								var oStringField = aFormContents[4];
								assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
								assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
								assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
								assert.ok(oStringField.getAggregation("_field").isA("sap.m.Input"), "String Field: Control is an Input");
								assert.equal(oStringField.getAggregation("_field").getValue(), "StringValue Child2-1", "String Field: String Value");

								assert.ok(that.oEditor._oChildTree.getItems()[2].getExpanded(), "Child tree item 2 expanded: true");
								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
											"/sap.card/configuration/parameters/string/value": "StringValue Child2-1",
											":errors": false,
											":layer": 0
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child2-1 with changes 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							"/sap.card/configuration/destinations/mock_request/name": "mock_request",
							"/sap.card/configuration/destinations/northwind/name": "Northwind",
							":errors": false,
							":layer": 0
						}, "Editor settings are OK");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
						assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

						// simulate to click child2-1
						that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), "Child Card Title Child2-1", "Title Field: String Value");

								var oStringLabel = aFormContents[3];
								var oStringField = aFormContents[4];
								var oStringFieldControl = oStringField.getAggregation("_field");
								assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
								assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
								assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
								assert.ok(oStringFieldControl.isA("sap.m.Input"), "String Field: Control is an Input");
								assert.equal(oStringFieldControl.getValue(), "StringValue Child2-1", "String Field: String Value");

								assert.ok(that.oEditor._oChildTree.getItems()[2].getExpanded(), "Child tree item 2 expanded: true");
								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
											"/sap.card/configuration/parameters/string/value": "StringValue Child2-1",
											":errors": false,
											":layer": 0
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");

								oTitleFieldControl.setValue("string value 1");
								oTitleFieldControl.fireChange({ value: "string value 1"});
								assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

								oStringFieldControl.setValue("StringValue Child2-1 updated");
								oStringFieldControl.fireChange({ value: "StringValue Child2-1 updated"});
								assert.equal(oStringFieldControl.getValue(), "StringValue Child2-1 updated", "String Field: Has new value");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
											"/sap.card/configuration/parameters/string/value": "StringValue Child2-1 updated",
											"texts": {
												"en": {
												"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
												}
											},
											":errors": false,
											":layer": 0
										},
										":errors": false,
										":layer": 0
									},
									"/sap.card/configuration/destinations/mock_request/name": "mock_request",
									"/sap.card/configuration/destinations/northwind/name": "Northwind",
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 0
								}, "Editor settings are OK");
								resolve();
							});
						});
					});
				});
			});
		});
	});

	QUnit.module("content mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
			this.oEditor.setMode("content");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("main editor with no change", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						var oTitleLabel = aFormContents[1];
						var oTitleField = aFormContents[2];
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

						var oMaxItemLabel = aFormContents[3];
						var oMaxItemField = aFormContents[4];
						assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
						assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
						assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
						assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
						assert.equal(oMaxItemField.getAggregation("_field").getValue(), 3, "MaxItem Field: Integer Value");

						var oCustomerLabel = aFormContents[5];
						var oCustomerField = aFormContents[6];
						assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
						assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
						assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
						var oCustomerFieldControl = oCustomerField.getAggregation("_field");
						assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
						assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
						assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
						assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");

						var oObjectLabel = aFormContents[7];
						var oObjectField = aFormContents[8];
						assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
						assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
						assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
						assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
						var oObjectFieldControl = oObjectField.getAggregation("_field");
						assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
						assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
						assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
						assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

						var oObjectsLabel = aFormContents[9];
						var oObjectsField = aFormContents[10];
						assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
						assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
						assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
						assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
						var oObjectsFieldControl = oObjectsField.getAggregation("_field");
						assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
						assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
						assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
						assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");
						resolve();
					});
				});
			});
		});

		QUnit.test("main editor with changes in main editor 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oTitleLabel = aFormContents[1];
						var oTitleField = aFormContents[2];
						var oTitleFieldControl = oTitleField.getAggregation("_field");
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
						oTitleFieldControl.setValue("string value 1");
						oTitleFieldControl.fireChange({ value: "string value 1"});
						assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

						var oMaxItemLabel = aFormContents[3];
						var oMaxItemField = aFormContents[4];
						var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
						assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
						assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
						assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
						assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
						assert.equal(oMaxItemFieldControl.getValue(), 3, "MaxItem Field: Integer Value");
						oMaxItemFieldControl.setValue(4);
						oMaxItemFieldControl.fireChange({ value: 4});
						assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

						var oCustomerLabel = aFormContents[5];
						var oCustomerField = aFormContents[6];
						assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
						assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
						assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
						var oCustomerFieldControl = oCustomerField.getAggregation("_field");
						assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
						assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
						assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
						assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");
						oCustomerFieldControl.setSelectedKey("b");
						oCustomerFieldControl.fireChange({ selectedItem: oCustomerFieldControl.getItemByKey("b") });

						await nextUIUpdate();

						var oObjectLabel = aFormContents[7];
						var oObjectField = aFormContents[8];
						assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
						assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
						assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
						assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
						var oObjectFieldControl = oObjectField.getAggregation("_field");
						assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
						assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
						assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
						assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");
						var oObjectFieldTableRow1 = oObjectFieldControl.getRows()[0];
						var oObjectFieldTableRow1SelectionCell1 = oObjectFieldTableRow1.getCells()[0];
						assert.ok(oObjectFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Object Field Table Row 1: Cell 1 is CheckBox");
						assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is not selected");
						oObjectFieldTableRow1SelectionCell1.setSelected(true);
						oObjectFieldTableRow1SelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is selected after selecting");
						assert.equal(oObjectFieldControl.getSelectedIndices().length, 0, "Object Field Table: SelectedIndices Value not change after selecting");
						var newObjectFieldValue = oObjectField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), {
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false
							}
						}, "Object Field: DT Value changed after selecting");

						var oObjectsLabel = aFormContents[9];
						var oObjectsField = aFormContents[10];
						assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
						assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
						assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
						assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
						var oObjectsFieldControl = oObjectsField.getAggregation("_field");
						assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
						assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
						assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
						assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");
						var oObjectsFieldTableRow1 = oObjectsFieldControl.getRows()[0];
						var oObjectsFieldTableRow1SelectionCell1 = oObjectsFieldTableRow1.getCells()[0];
						assert.ok(oObjectsFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Objects Field Table Row 1: Cell 1 is CheckBox");
						assert.ok(!oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is not selected");
						oObjectsFieldTableRow1SelectionCell1.setSelected(true);
						oObjectsFieldTableRow1SelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is selected after selecting");
						assert.equal(oObjectsFieldControl.getSelectedIndices().length, 0, "Objects Field Table: SelectedIndices Value not change after selecting");
						var newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue[0]), {
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false,
								"_position": 1
							}
						}, "Objects Field: DT Value changed after selecting");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// add new value (defaut) for object field
						var oObjectFieldTableBar = oObjectFieldControl.getExtension()[0];
						assert.equal(oObjectFieldTableBar.getContent().length, 7, "Object field Table toolbar: content length");
						var oObjectFieldAddButton = oObjectFieldTableBar.getContent()[1];
						assert.ok(oObjectFieldAddButton.getVisible(), "Object field Table toolbar: add button visible");
						oObjectFieldAddButton.firePress();
						await nextUIUpdate();

						var oSimpleForm = oObjectField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Object field Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 20, "Object field SimpleForm: length");
						var oFormTextArearLabel = oContents[18];
						var oFormTextAreaField = oContents[19];
						assert.equal(oFormTextArearLabel.getText(), "", "Object field SimpleForm label8: Has no label text");
						assert.ok(!oFormTextArearLabel.getVisible(), "Object field SimpleForm label8: Not Visible");
						assert.ok(oFormTextAreaField.isA("sap.m.TextArea"), "Object field SimpleForm Field8: TextArea Field");
						assert.ok(!oFormTextAreaField.getVisible(), "Object field SimpleForm Field8: Not Visible");
						assert.ok(oFormTextAreaField.getEditable(), "Object field SimpleForm Field8: Editable");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oFormTextAreaField.getValue()), oDefaultNewObject), "Object field SimpleForm field textArea: Has Default value");

						var oAddButtonInPopover = oObjectField._oObjectDetailsPopover._oAddButton;
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						oAddButtonInPopover.firePress();
						await nextUIUpdate();

						assert.equal(oObjectFieldControl.getBinding().getCount(), 9, "Object field Table: value length is 9");
						assert.deepEqual(EditorQunitUtils.cleanUUID(oObjectFieldControl.getBinding().getContexts()[8].getObject()), oDefaultNewObject, "Object field Table: new row data");
						assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object field Table Row 1: Cell 1 is not selected after new row added");

						newObjectFieldValue = oObjectField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), EditorQunitUtils.cleanDT(oDefaultNewObject), "Object Field: DT Value changed after selecting");

						oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 5
						}, "Editor settings are OK afeter adding new default value for object field");

						// add new value (defaut) for objects field
						var oObjectsFieldTableBar = oObjectsFieldControl.getExtension()[0];
						assert.equal(oObjectsFieldTableBar.getContent().length, 9, "Objects field Table toolbar: content length");
						var oObjectsFieldAddButton = oObjectsFieldTableBar.getContent()[1];
						assert.ok(oObjectsFieldAddButton.getVisible(), "Objects field Table toolbar: add button visible");
						oObjectsFieldAddButton.firePress();
						await nextUIUpdate();

						oSimpleForm = oObjectsField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Objects field Popover: Content is SimpleForm");
						oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 20, "Objects field SimpleForm: length");
						oFormTextArearLabel = oContents[18];
						oFormTextAreaField = oContents[19];
						assert.equal(oFormTextArearLabel.getText(), "", "Objects field SimpleForm label8: Has no label text");
						assert.ok(!oFormTextArearLabel.getVisible(), "Objects field SimpleForm label8: Not Visible");
						assert.ok(oFormTextAreaField.isA("sap.m.TextArea"), "Objects field SimpleForm Field8: TextArea Field");
						assert.ok(!oFormTextAreaField.getVisible(), "Objects field SimpleForm Field8: Not Visible");
						assert.ok(oFormTextAreaField.getEditable(), "Objects field SimpleForm Field8: Editable");
						var oDefaultNewObjectClone = deepClone(oDefaultNewObject);
						oDefaultNewObjectClone._dt._position = 9;
						assert.deepEqual(EditorQunitUtils.cleanUUID(oFormTextAreaField.getValue()), oDefaultNewObject, "Objects field SimpleForm field textArea: Has Default value");

						oAddButtonInPopover = oObjectsField._oObjectDetailsPopover._oAddButton;
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						oAddButtonInPopover.firePress();
						await nextUIUpdate();

						assert.equal(oObjectsFieldControl.getBinding().getCount(), 9, "Objects field Table: value length is 9");
						assert.deepEqual(EditorQunitUtils.cleanUUID(oObjectsFieldControl.getBinding().getContexts()[8].getObject()), oDefaultNewObjectClone, "Objects field Table: new row data");
						assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects field Table Row 1: Cell 1 is still selected after new row added");

						newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
						delete oDefaultNewObjectClone._dt._selected;
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue), [{
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false,
								"_position": 1
							}
						}, oDefaultNewObjectClone], "Objects Field: DT Value changed after selecting");

						oSettings = that.oEditor.getCurrentSettings();
						// in settings, the _position in dt of each value of Object List Field will be replaced with order of appearance in the array
						newObjectsFieldValue[0]._dt._position = 1;
						newObjectsFieldValue[1]._dt._position = 2;
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 5
						}, "Editor settings are OK afeter adding new default value for object field");

						resolve();
					});
				});
			});
		});

		QUnit.test("main editor with changes in main editor 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oTitleLabel = aFormContents[1];
						var oTitleField = aFormContents[2];
						var oTitleFieldControl = oTitleField.getAggregation("_field");
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
						oTitleFieldControl.setValue("string value 1");
						oTitleFieldControl.fireChange({ value: "string value 1"});
						assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

						var oMaxItemLabel = aFormContents[3];
						var oMaxItemField = aFormContents[4];
						var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
						assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
						assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
						assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
						assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
						assert.equal(oMaxItemFieldControl.getValue(), 3, "MaxItem Field: Integer Value");
						oMaxItemFieldControl.setValue(4);
						oMaxItemFieldControl.fireChange({ value: 4});
						assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

						var oCustomerLabel = aFormContents[5];
						var oCustomerField = aFormContents[6];
						assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
						assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
						assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
						var oCustomerFieldControl = oCustomerField.getAggregation("_field");
						assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
						assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
						assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
						assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");
						oCustomerFieldControl.setSelectedKey("b");
						oCustomerFieldControl.fireChange({ selectedItem: oCustomerFieldControl.getItemByKey("b") });

						await nextUIUpdate();

						var oObjectLabel = aFormContents[7];
						var oObjectField = aFormContents[8];
						assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
						assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
						assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
						assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
						var oObjectFieldControl = oObjectField.getAggregation("_field");
						assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
						assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
						assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
						assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");
						var oObjectFieldTableRow1 = oObjectFieldControl.getRows()[0];
						var oObjectFieldTableRow1SelectionCell1 = oObjectFieldTableRow1.getCells()[0];
						assert.ok(oObjectFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Object Field Table Row 1: Cell 1 is CheckBox");
						assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is not selected");
						oObjectFieldTableRow1SelectionCell1.setSelected(true);
						oObjectFieldTableRow1SelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is selected after selecting");
						assert.equal(oObjectFieldControl.getSelectedIndices().length, 0, "Object Field Table: SelectedIndices Value not change after selecting");
						var newObjectFieldValue = oObjectField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), {
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false
							}
						}, "Object Field: DT Value changed after selecting");

						var oObjectsLabel = aFormContents[9];
						var oObjectsField = aFormContents[10];
						assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
						assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
						assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
						assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
						var oObjectsFieldControl = oObjectsField.getAggregation("_field");
						assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
						assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
						assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
						assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");
						var oObjectsFieldTableRow1 = oObjectsFieldControl.getRows()[0];
						var oObjectsFieldTableRow1SelectionCell1 = oObjectsFieldTableRow1.getCells()[0];
						assert.ok(oObjectsFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Objects Field Table Row 1: Cell 1 is CheckBox");
						assert.ok(!oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is not selected");
						oObjectsFieldTableRow1SelectionCell1.setSelected(true);
						oObjectsFieldTableRow1SelectionCell1.fireSelect({
							selected: true
						});
						assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is selected after selecting");
						assert.equal(oObjectsFieldControl.getSelectedIndices().length, 0, "Objects Field Table: SelectedIndices Value not change after selecting");
						var newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue[0]), {
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false,
								"_position": 1
							}
						}, "Objects Field: DT Value changed after selecting");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// add new value (defaut) for object field
						var oObjectFieldTableBar = oObjectFieldControl.getExtension()[0];
						assert.equal(oObjectFieldTableBar.getContent().length, 7, "Object field Table toolbar: content length");
						var oObjectFieldAddButton = oObjectFieldTableBar.getContent()[1];
						assert.ok(oObjectFieldAddButton.getVisible(), "Object field Table toolbar: add button visible");
						oObjectFieldAddButton.firePress();
						await nextUIUpdate();

						var oSimpleForm = oObjectField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Object field Popover: Content is SimpleForm");
						var oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 20, "Object field SimpleForm: length");
						var oFormTextArearLabel = oContents[18];
						var oFormTextAreaField = oContents[19];
						assert.equal(oFormTextArearLabel.getText(), "", "Object field SimpleForm label8: Has no label text");
						assert.ok(!oFormTextArearLabel.getVisible(), "Object field SimpleForm label8: Not Visible");
						assert.ok(oFormTextAreaField.isA("sap.m.TextArea"), "Object field SimpleForm Field8: TextArea Field");
						assert.ok(!oFormTextAreaField.getVisible(), "Object field SimpleForm Field8: Not Visible");
						assert.ok(oFormTextAreaField.getEditable(), "Object field SimpleForm Field8: Editable");
						assert.ok(deepEqual(EditorQunitUtils.cleanUUID(oFormTextAreaField.getValue()), oDefaultNewObject), "Object field SimpleForm field textArea: Has Default value");

						var oFormLabel = oContents[0];
						var oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "Object field SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "Object field SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "Object field SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "Object field SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "Object field SimpleForm Field1: Editable");
						assert.equal(oFormField.getValue(), "", "Object field SimpleForm field1: Has No value");
						oFormField.setValue("key01");
						oFormField.fireChange({ value: "key01" });
						await nextUIUpdate();

						var oAddButtonInPopover = oObjectField._oObjectDetailsPopover._oAddButton;
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						oAddButtonInPopover.firePress();
						await nextUIUpdate();

						assert.equal(oObjectFieldControl.getBinding().getCount(), 9, "Object field Table: value length is 9");
						var oUpdatedNewObject = deepClone(oDefaultNewObject);
						oUpdatedNewObject.key = "key01";
						assert.deepEqual(EditorQunitUtils.cleanUUID(oObjectFieldControl.getBinding().getContexts()[8].getObject()), oUpdatedNewObject, "Object field Table: new row data");
						assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object field Table Row 1: Cell 1 is not selected after new row added");

						newObjectFieldValue = oObjectField._getCurrentProperty("value");
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), EditorQunitUtils.cleanDT(oUpdatedNewObject), "Object Field: DT Value changed after selecting");

						oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 5
						}, "Editor settings are OK afeter adding new default value for object field");

						// add new value (defaut) for objects field
						var oObjectsFieldTableBar = oObjectsFieldControl.getExtension()[0];
						assert.equal(oObjectsFieldTableBar.getContent().length, 9, "Objects field Table toolbar: content length");
						var oObjectsFieldAddButton = oObjectsFieldTableBar.getContent()[1];
						assert.ok(oObjectsFieldAddButton.getVisible(), "Objects field Table toolbar: add button visible");
						oObjectsFieldAddButton.firePress();
						await nextUIUpdate();

						oSimpleForm = oObjectsField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
						assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Objects field Popover: Content is SimpleForm");
						oContents = oSimpleForm.getContent();
						assert.equal(oContents.length, 20, "Objects field SimpleForm: length");
						oFormTextArearLabel = oContents[18];
						oFormTextAreaField = oContents[19];
						assert.equal(oFormTextArearLabel.getText(), "", "Objects field SimpleForm label8: Has no label text");
						assert.ok(!oFormTextArearLabel.getVisible(), "Objects field SimpleForm label8: Not Visible");
						assert.ok(oFormTextAreaField.isA("sap.m.TextArea"), "Objects field SimpleForm Field8: TextArea Field");
						assert.ok(!oFormTextAreaField.getVisible(), "Objects field SimpleForm Field8: Not Visible");
						assert.ok(oFormTextAreaField.getEditable(), "Objects field SimpleForm Field8: Editable");
						oUpdatedNewObject = deepClone(oDefaultNewObject);
						oUpdatedNewObject._dt._position = 9;
						assert.deepEqual(EditorQunitUtils.cleanUUID(oFormTextAreaField.getValue()), oDefaultNewObject, "Objects field SimpleForm field textArea: Has Default value");

						oFormLabel = oContents[0];
						oFormField = oContents[1];
						assert.equal(oFormLabel.getText(), "Key", "Objects field SimpleForm label1: Has label text");
						assert.ok(oFormLabel.getVisible(), "Objects field SimpleForm label1: Visible");
						assert.ok(oFormField.isA("sap.m.Input"), "Objects field SimpleForm Field1: Input Field");
						assert.ok(oFormField.getVisible(), "Objects field SimpleForm Field1: Visible");
						assert.ok(oFormField.getEditable(), "Objects field SimpleForm Field1: Editable");
						assert.equal(oFormField.getValue(), "", "Objects field SimpleForm field1: Has No value");
						oFormField.setValue("key02");
						oFormField.fireChange({ value: "key02" });
						await nextUIUpdate();

						oAddButtonInPopover = oObjectsField._oObjectDetailsPopover._oAddButton;
						assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
						oAddButtonInPopover.firePress();
						await nextUIUpdate();

						oUpdatedNewObject.key = "key02";
						assert.equal(oObjectsFieldControl.getBinding().getCount(), 9, "Objects field Table: value length is 9");
						assert.deepEqual(EditorQunitUtils.cleanUUID(oObjectsFieldControl.getBinding().getContexts()[8].getObject()), oUpdatedNewObject, "Objects field Table: new row data");
						assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects field Table Row 1: Cell 1 is still selected after new row added");

						newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
						delete oUpdatedNewObject._dt._selected;
						assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue), [{
							"text": "text01",
							"key": "key01",
							"url": "https://sap.com/06",
							"icon": "sap-icon://accept",
							"iconcolor": "#031E48",
							"int": 1,
							"object": {
								"key": "key01",
								"text":"text01"
							},
							"type": "type01",
							"_dt": {
								"_editable": false,
								"_position": 1
							}
						}, oUpdatedNewObject], "Objects Field: DT Value changed after selecting");

						oSettings = that.oEditor.getCurrentSettings();
						// in settings, the _position in dt of each value of Object List Field will be replaced with order of appearance in the array
						newObjectsFieldValue[0]._dt._position = 1;
						newObjectsFieldValue[1]._dt._position = 2;
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 4,
							"/sap.card/configuration/parameters/Customer/value": "b",
							"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
							"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
							"texts": {
								"en": {
								"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
								}
							},
							":errors": false,
							":layer": 5
						}, "Editor settings are OK afeter adding new default value for object field");

						resolve();
					});
				});
			});
		});

		QUnit.test("child1 with no change", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");
								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child1 with changes", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(async function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
								oTitleFieldControl.setValue("string value 1");
								oTitleFieldControl.fireChange({ value: "string value 1"});
								assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

								var oMaxItemLabel = aFormContents[3];
								var oMaxItemField = aFormContents[4];
								var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Integer Value");
								oMaxItemFieldControl.setValue(5);
								oMaxItemFieldControl.fireChange({ value: 5});
								assert.equal(oMaxItemFieldControl.getValue(), 5, "MaxItem Field: Has new value");

								var oEmployeeLabel = aFormContents[5];
								var oEmployeeField = aFormContents[6];
								assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
								assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
								assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
								var oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
								assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
								assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
								assert.equal(oEmployeeFieldControl.getSelectedKey(), 1, "Employee Field: Key Value");
								assert.equal(oEmployeeFieldControl.getValue(), "FirstName1 LastName1", "Employee Field: String Value");
								oEmployeeFieldControl.setSelectedKey("2");
								oEmployeeFieldControl.fireChange({ selectedItem: oEmployeeFieldControl.getItemByKey("2") });

								await nextUIUpdate();

								var oObjectLabel = aFormContents[7];
								var oObjectField = aFormContents[8];
								assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
								assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
								assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
								assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
								var oObjectFieldControl = oObjectField.getAggregation("_field");
								assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
								assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
								assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
								assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");
								var oObjectFieldTableRow1 = oObjectFieldControl.getRows()[0];
								var oObjectFieldTableRow1SelectionCell1 = oObjectFieldTableRow1.getCells()[0];
								assert.ok(oObjectFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Object Field Table Row 1: Cell 1 is CheckBox");
								assert.ok(!oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is not selected");
								oObjectFieldTableRow1SelectionCell1.setSelected(true);
								oObjectFieldTableRow1SelectionCell1.fireSelect({
									selected: true
								});
								assert.ok(oObjectFieldTableRow1SelectionCell1.getSelected(), "Object Field Table Row 1: Cell 1 is selected after selecting");
								assert.equal(oObjectFieldControl.getSelectedIndices().length, 0, "Object Field Table: SelectedIndices Value not change after selecting");
								var newObjectFieldValue = oObjectField._getCurrentProperty("value");
								assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectFieldValue), {
									"text": "text01",
									"key": "key01",
									"url": "https://sap.com/06",
									"icon": "sap-icon://accept",
									"iconcolor": "#031E48",
									"int": 1,
									"object": {
										"key": "key01",
										"text":"text01"
									},
									"type": "type01",
									"_dt": {
										"_editable": false
									}
								}, "Object Field: DT Value changed after selecting");

								var oObjectsLabel = aFormContents[9];
								var oObjectsField = aFormContents[10];
								assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
								assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
								assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
								assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
								var oObjectsFieldControl = oObjectsField.getAggregation("_field");
								assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
								assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
								assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
								assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");
								var oObjectsFieldTableRow1 = oObjectsFieldControl.getRows()[0];
								var oObjectsFieldTableRow1SelectionCell1 = oObjectsFieldTableRow1.getCells()[0];
								assert.ok(oObjectsFieldTableRow1SelectionCell1.isA("sap.m.CheckBox"), "Objects Field Table Row 1: Cell 1 is CheckBox");
								assert.ok(!oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is not selected");
								oObjectsFieldTableRow1SelectionCell1.setSelected(true);
								oObjectsFieldTableRow1SelectionCell1.fireSelect({
									selected: true
								});
								assert.ok(oObjectsFieldTableRow1SelectionCell1.getSelected(), "Objects Field Table Row 1: Cell 1 is selected after selecting");
								assert.equal(oObjectsFieldControl.getSelectedIndices().length, 0, "Objects Field Table: SelectedIndices Value not change after selecting");
								var newObjectsFieldValue = oObjectsField._getCurrentProperty("value");
								assert.deepEqual(EditorQunitUtils.cleanUUID(newObjectsFieldValue[0]), {
									"text": "text01",
									"key": "key01",
									"url": "https://sap.com/06",
									"icon": "sap-icon://accept",
									"iconcolor": "#031E48",
									"int": 1,
									"object": {
										"key": "key01",
										"text":"text01"
									},
									"type": "type01",
									"_dt": {
										"_editable": false,
										"_position": 1
									}
								}, "Objects Field: DT Value changed after selecting");

								await nextUIUpdate();

								assert.deepEqual(that.oEditor.getCurrentSettings(), {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										"/sap.card/configuration/parameters/Employee/value": "2",
										"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": newObjectFieldValue,
										"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": newObjectsFieldValue,
										"texts": {
											"en": {
											"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
											}
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
									}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-1 with no change 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								// simulate to click child1-1
								that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
										assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
										assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
										assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
										assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
										assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
										assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 4,
												"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
													"/sap.card/configuration/parameters/Customer/value": "b",
													"/sap.card/configuration/parameters/Employee/value": "2",
													"/sap.card/configuration/parameters/maxItems/value": 6,
													":errors": false,
													":layer": 5
												},
												":errors": false,
												":layer": 5
											},
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-1 with changes 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								// simulate to click child1-1
								that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(async function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
										assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
										assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
										assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
										assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
										assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
										assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 4,
												"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
													"/sap.card/configuration/parameters/Customer/value": "b",
													"/sap.card/configuration/parameters/Employee/value": "2",
													"/sap.card/configuration/parameters/maxItems/value": 6,
													":errors": false,
													":layer": 5
												},
												":errors": false,
												":layer": 5
											},
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");

										var oTitleLabel = aFormContents[1];
										var oTitleField = aFormContents[2];
										var oTitleFieldControl = oTitleField.getAggregation("_field");
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
										oTitleFieldControl.setValue("string value 1");
										oTitleFieldControl.fireChange({ value: "string value 1"});
										assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

										var oMaxItemLabel = aFormContents[3];
										var oMaxItemField = aFormContents[4];
										var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemFieldControl.getValue(), 6, "MaxItem Field: Integer Value");
										oMaxItemFieldControl.setValue(4);
										oMaxItemFieldControl.fireChange({ value: 4});
										assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

										var oCustomerLabel = aFormContents[5];
										var oCustomerField = aFormContents[6];
										assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
										assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
										assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
										var oCustomerFieldControl = oCustomerField.getAggregation("_field");
										assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
										assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
										assert.equal(oCustomerFieldControl.getSelectedKey(), "b", "Customer Field: Key Value");
										assert.equal(oCustomerFieldControl.getValue(), "B Company", "Customer Field: String Value");
										oCustomerFieldControl.setSelectedKey("a");
										oCustomerFieldControl.fireChange({ selectedItem: oCustomerFieldControl.getItemByKey("a") });

										var oEmployeeLabel = aFormContents[7];
										var oEmployeeField = aFormContents[8];
										assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
										assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
										assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
										var oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
										assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
										assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
										assert.equal(oEmployeeFieldControl.getSelectedKey(), 2, "Employee Field: Key Value");
										assert.equal(oEmployeeFieldControl.getValue(), "FirstName2 LastName2", "Employee Field: String Value");
										oEmployeeFieldControl.setSelectedKey("1");
										oEmployeeFieldControl.fireChange({ selectedItem: oEmployeeFieldControl.getItemByKey("1") });

										await nextUIUpdate();

										assert.deepEqual(that.oEditor.getCurrentSettings(), {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 4,
												"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
													"/sap.card/configuration/parameters/Customer/value": "a",
													"/sap.card/configuration/parameters/Employee/value": "1",
													"/sap.card/configuration/parameters/maxItems/value": 4,
													"texts": {
														"en": {
														"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
														}
													},
													":errors": false,
													":layer": 5
												},
												":errors": false,
												":layer": 5
											},
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-1 with no change 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// expand child1
						var oArrow = Element.getElementById(oItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// simulate to click child1-1
						that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
											"/sap.card/configuration/parameters/Customer/value": "b",
											"/sap.card/configuration/parameters/Employee/value": "2",
											"/sap.card/configuration/parameters/maxItems/value": 6,
											":errors": false,
											":layer": 5
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-1 with changes 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// expand child1
						var oArrow = Element.getElementById(oItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// simulate to click child1-1
						that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(async function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
											"/sap.card/configuration/parameters/Customer/value": "b",
											"/sap.card/configuration/parameters/Employee/value": "2",
											"/sap.card/configuration/parameters/maxItems/value": 6,
											":errors": false,
											":layer": 5
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
								oTitleFieldControl.setValue("string value 1");
								oTitleFieldControl.fireChange({ value: "string value 1"});
								assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

								var oMaxItemLabel = aFormContents[3];
								var oMaxItemField = aFormContents[4];
								var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemFieldControl.getValue(), 6, "MaxItem Field: Integer Value");
								oMaxItemFieldControl.setValue(4);
								oMaxItemFieldControl.fireChange({ value: 4});
								assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

								var oCustomerLabel = aFormContents[5];
								var oCustomerField = aFormContents[6];
								assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
								assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
								assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
								var oCustomerFieldControl = oCustomerField.getAggregation("_field");
								assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
								assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
								assert.equal(oCustomerFieldControl.getSelectedKey(), "b", "Customer Field: Key Value");
								assert.equal(oCustomerFieldControl.getValue(), "B Company", "Customer Field: String Value");
								oCustomerFieldControl.setSelectedKey("a");
								oCustomerFieldControl.fireChange({ selectedItem: oCustomerFieldControl.getItemByKey("a") });

								var oEmployeeLabel = aFormContents[7];
								var oEmployeeField = aFormContents[8];
								assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
								assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
								assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
								var oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
								assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
								assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
								assert.equal(oEmployeeFieldControl.getSelectedKey(), 2, "Employee Field: Key Value");
								assert.equal(oEmployeeFieldControl.getValue(), "FirstName2 LastName2", "Employee Field: String Value");
								oEmployeeFieldControl.setSelectedKey("1");
								oEmployeeFieldControl.fireChange({ selectedItem: oEmployeeFieldControl.getItemByKey("1") });

								await nextUIUpdate();

								assert.deepEqual(that.oEditor.getCurrentSettings(), {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/Employee/value": "1",
											"/sap.card/configuration/parameters/maxItems/value": 4,
											"texts": {
												"en": {
												"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
												}
											},
											":errors": false,
											":layer": 5
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-2 with no change 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/parameters/Employee/value": "1",
										"/sap.card/configuration/parameters/maxItems/value": 4,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								// simulate to click child1-2
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 7, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
										assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
										assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
										assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
										assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
										assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
										assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 4,
												"/sap.card/configuration/childCards/child1-2/_manifestChanges": {
													"/sap.card/configuration/parameters/Order/value": "1",
													"/sap.card/configuration/parameters/maxItems/value": 5,
													":errors": false,
													":layer": 5
												},
												":errors": false,
												":layer": 5
											},
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child1-2 with no change 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// expand child1
						var oArrow = Element.getElementById(oItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// simulate to click child1-2
						that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 7, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
								assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
								assert.ok(oNewItem2.isLeaf(), "Child tree item 2 is leaf: true");
								assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");
								assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
								assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");
								assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child1/_manifestChanges": {
										"/sap.card/configuration/childCards/child1-2/_manifestChanges": {
											"/sap.card/configuration/parameters/Order/value": "1",
											"/sap.card/configuration/parameters/maxItems/value": 5,
											":errors": false,
											":layer": 5
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child2 with no change", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");


								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");
								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child2 with changes", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), "Trans Card Title en", "Title Field: String Value");
								oTitleFieldControl.setValue("string value 1");
								oTitleFieldControl.fireChange({ value: "string value 1"});
								assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

								var oMaxItemLabel = aFormContents[3];
								var oMaxItemField = aFormContents[4];
								var oMaxItemFieldControl = oMaxItemField.getAggregation("_field");
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemFieldControl.isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemFieldControl.getValue(), 5, "MaxItem Field: Integer Value");
								oMaxItemFieldControl.setValue(4);
								oMaxItemFieldControl.fireChange({ value: 4});
								assert.equal(oMaxItemFieldControl.getValue(), 4, "MaxItem Field: Has new value");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 4,
										"texts": {
											"en": {
											"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
											}
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child2-1 with no change 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");


								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								// simulate to click child2-1
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										var oTitleLabel = aFormContents[1];
										var oTitleField = aFormContents[2];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Child Card Title Child2-1", "Title Field: String Value");

										var oStringLabel = aFormContents[3];
										var oStringField = aFormContents[4];
										assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
										assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
										assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
										assert.ok(oStringField.getAggregation("_field").isA("sap.m.Input"), "String Field: Control is an Input");
										assert.equal(oStringField.getAggregation("_field").getValue(), "StringValue Child2-1", "String Field: String Value");

										assert.ok(that.oEditor._oChildTree.getItems()[2].getExpanded(), "Child tree item 2 expanded: true");
										assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
										var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
										assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
										assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
										assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child2/_manifestChanges": {
												"/sap.card/configuration/parameters/maxItems/value": 5,
												"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
													"/sap.card/configuration/parameters/string/value": "StringValue Child2-1",
													":errors": false,
													":layer": 5
												},
												":errors": false,
												":layer": 5
											},
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child2-1 with changes 01", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");


								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/parameters/maxItems/value": 5,
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								// simulate to click child2-1
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										var oTitleLabel = aFormContents[1];
										var oTitleField = aFormContents[2];
										var oTitleFieldControl = oTitleField.getAggregation("_field");
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleFieldControl.getValue(), "Child Card Title Child2-1", "Title Field: String Value");

										var oStringLabel = aFormContents[3];
										var oStringField = aFormContents[4];
										var oStringFieldControl = oStringField.getAggregation("_field");
										assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
										assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
										assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
										assert.ok(oStringFieldControl.isA("sap.m.Input"), "String Field: Control is an Input");
										assert.equal(oStringFieldControl.getValue(), "StringValue Child2-1", "String Field: String Value");

										assert.ok(that.oEditor._oChildTree.getItems()[2].getExpanded(), "Child tree item 2 expanded: true");
										assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
										var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
										assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
										assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
										assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
										assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
										assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
										assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
										assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
										assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
										assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
										assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
										assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child2/_manifestChanges": {
												"/sap.card/configuration/parameters/maxItems/value": 5,
												"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
													"/sap.card/configuration/parameters/string/value": "StringValue Child2-1",
													":errors": false,
													":layer": 5
												},
												":errors": false,
												":layer": 5
											},
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");

										oTitleFieldControl.setValue("string value 1");
										oTitleFieldControl.fireChange({ value: "string value 1"});
										assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

										oStringFieldControl.setValue("StringValue Child2-1 updated");
										oStringFieldControl.fireChange({ value: "StringValue Child2-1 updated"});
										assert.equal(oStringFieldControl.getValue(), "StringValue Child2-1 updated", "String Field: Has new value");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child2/_manifestChanges": {
												"/sap.card/configuration/parameters/maxItems/value": 5,
												"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
													"/sap.card/configuration/parameters/string/value": "StringValue Child2-1 updated",
													"texts": {
														"en": {
														"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
														}
													},
													":errors": false,
													":layer": 5
												},
												":errors": false,
												":layer": 5
											},
											"/sap.card/configuration/parameters/Customer/value": "a",
											"/sap.card/configuration/parameters/maxItems/value": 3,
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");
										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("child2-1 with no change 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
						assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

						// simulate to click child2-1
						that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Child Card Title Child2-1", "Title Field: String Value");

								var oStringLabel = aFormContents[3];
								var oStringField = aFormContents[4];
								assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
								assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
								assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
								assert.ok(oStringField.getAggregation("_field").isA("sap.m.Input"), "String Field: Control is an Input");
								assert.equal(oStringField.getAggregation("_field").getValue(), "StringValue Child2-1", "String Field: String Value");

								assert.ok(that.oEditor._oChildTree.getItems()[2].getExpanded(), "Child tree item 2 expanded: true");
								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
											"/sap.card/configuration/parameters/string/value": "StringValue Child2-1",
											":errors": false,
											":layer": 5
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("child2-1 with changes 02", function (assert) {
			var that = this;
			that.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						var oTreeModel = that.oEditor._oChildTree.getModel();
						var oMainNode = oTreeModel.getData()[0];
						assert.equal(oMainNode.text, "Main", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var oSettings = that.oEditor.getCurrentSettings();
						assert.deepEqual(oSettings, {
							"/sap.card/configuration/parameters/maxItems/value": 3,
							"/sap.card/configuration/parameters/Customer/value": "a",
							":errors": false,
							":layer": 5
						}, "Editor settings are OK");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
						assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

						// simulate to click child2-1
						that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								var oTitleLabel = aFormContents[1];
								var oTitleField = aFormContents[2];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), "Child Card Title Child2-1", "Title Field: String Value");

								var oStringLabel = aFormContents[3];
								var oStringField = aFormContents[4];
								var oStringFieldControl = oStringField.getAggregation("_field");
								assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
								assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
								assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
								assert.ok(oStringFieldControl.isA("sap.m.Input"), "String Field: Control is an Input");
								assert.equal(oStringFieldControl.getValue(), "StringValue Child2-1", "String Field: String Value");

								assert.ok(that.oEditor._oChildTree.getItems()[2].getExpanded(), "Child tree item 2 expanded: true");
								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
								var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								assert.equal(oNewItem0.getTitle(), "Main", "Child tree item 0 title is OK");
								assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
								assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
								assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
								assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
								assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
								assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
								assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
								assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
								assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
								assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
								assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: false");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
											"/sap.card/configuration/parameters/string/value": "StringValue Child2-1",
											":errors": false,
											":layer": 5
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");

								oTitleFieldControl.setValue("string value 1");
								oTitleFieldControl.fireChange({ value: "string value 1"});
								assert.equal(oTitleFieldControl.getValue(), "string value 1", "Title Field: Has new value");

								oStringFieldControl.setValue("StringValue Child2-1 updated");
								oStringFieldControl.fireChange({ value: "StringValue Child2-1 updated"});
								assert.equal(oStringFieldControl.getValue(), "StringValue Child2-1 updated", "String Field: Has new value");

								oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/childCards/child2/_manifestChanges": {
										"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
											"/sap.card/configuration/parameters/string/value": "StringValue Child2-1 updated",
											"texts": {
												"en": {
												"/sap.card/configuration/parameters/cardTitle/value": "string value 1"
												}
											},
											":errors": false,
											":layer": 5
										},
										":errors": false,
										":layer": 5
									},
									"/sap.card/configuration/parameters/Customer/value": "a",
									"/sap.card/configuration/parameters/maxItems/value": 3,
									":errors": false,
									":layer": 5
								}, "Editor settings are OK");
								resolve();
							});
						});
					});
				});
			});
		});
	});
});
