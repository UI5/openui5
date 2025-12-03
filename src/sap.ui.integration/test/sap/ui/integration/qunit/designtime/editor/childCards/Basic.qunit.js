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
	"qunit/designtime/EditorQunitUtils"
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
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/childEditors/";

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Tree stucture", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest(undefined, undefined,"CardEditor");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("admin mode", function (assert) {
			var that = this;
			that.oEditor.setMode("admin");
			that.oEditor.setCard({
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.equal(oMainNode.text, "Main Card", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var aNodes0 = oNode0.nodes;
						var oNode0_0 = aNodes0[0];
						assert.equal(oNode0_0.text, "Test Card(in sap.app)", "Child tree oNode0_0 text is OK");
						assert.equal(oNode0_0.path, "child1/child1-1", "Child tree oNode0_0 path is OK");
						assert.ok(!oNode0_0.selected, "Child tree oNode0_0 selected: false");
						assert.equal(oNode0_0.nodes.length, 0, "Child tree oNode0_0 nodes length is OK");
						var oNode0_1 = aNodes0[1];
						assert.equal(oNode0_1.text, "Child1-2 (in config)", "Child tree oNode0_1 text is OK");
						assert.equal(oNode0_1.path, "child1/child1-2", "Child tree oNode0_1 path is OK");
						assert.ok(!oNode0_1.selected, "Child tree oNode0_1 selected: false");
						assert.equal(oNode0_1.nodes.length, 0, "Child tree oNode0_1 nodes length is OK");

						var oNode1 = aNodes[1];
						assert.equal(oNode1.text, "Child2 (in sap.app)", "Child tree node1 text is OK");
						assert.equal(oNode1.path, "child2", "Child tree node1 path is OK");
						assert.ok(!oNode1.selected, "Child tree node1 selected: false");
						assert.equal(oNode1.nodes.length, 1, "Child tree node1 nodes length is OK");
						var oNode1_0 = oNode1.nodes[0];
						assert.equal(oNode1_0.text, "Child2-1 (in config)", "Child tree oNode1_0 text is OK");
						assert.equal(oNode1_0.path, "child2/child2-1", "Child tree oNode1_0 path is OK");
						assert.ok(!oNode1_0.selected, "Child tree oNode1_0 selected: false");
						assert.equal(oNode1_0.nodes.length, 0, "Child tree oNode1_0 nodes length is OK");
						resolve();
					});
				});
			});
		});

		QUnit.test("content mode", function (assert) {
			var that = this;
			that.oEditor.setMode("content");
			that.oEditor.setCard({
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.equal(oMainNode.text, "Main Card", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var aNodes0 = oNode0.nodes;
						var oNode0_0 = aNodes0[0];
						assert.equal(oNode0_0.text, "Test Card(in sap.app)", "Child tree oNode0_0 text is OK");
						assert.equal(oNode0_0.path, "child1/child1-1", "Child tree oNode0_0 path is OK");
						assert.ok(!oNode0_0.selected, "Child tree oNode0_0 selected: false");
						assert.equal(oNode0_0.nodes.length, 0, "Child tree oNode0_0 nodes length is OK");
						var oNode0_1 = aNodes0[1];
						assert.equal(oNode0_1.text, "Child1-2 (in config)", "Child tree oNode0_1 text is OK");
						assert.equal(oNode0_1.path, "child1/child1-2", "Child tree oNode0_1 path is OK");
						assert.ok(!oNode0_1.selected, "Child tree oNode0_1 selected: false");
						assert.equal(oNode0_1.nodes.length, 0, "Child tree oNode0_1 nodes length is OK");

						var oNode1 = aNodes[1];
						assert.equal(oNode1.text, "Child2 (in sap.app)", "Child tree node1 text is OK");
						assert.equal(oNode1.path, "child2", "Child tree node1 path is OK");
						assert.ok(!oNode1.selected, "Child tree node1 selected: false");
						assert.equal(oNode1.nodes.length, 1, "Child tree node1 nodes length is OK");
						var oNode1_0 = oNode1.nodes[0];
						assert.equal(oNode1_0.text, "Child2-1 (in config)", "Child tree oNode1_0 text is OK");
						assert.equal(oNode1_0.path, "child2/child2-1", "Child tree oNode1_0 path is OK");
						assert.ok(!oNode1_0.selected, "Child tree oNode1_0 selected: false");
						assert.equal(oNode1_0.nodes.length, 0, "Child tree oNode1_0 nodes length is OK");
						resolve();
					});
				});
			});
		});

		QUnit.test("translation mode", function (assert) {
			var that = this;
			that.oEditor.setMode("translation");
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						var oTitleLabel = aFormContents[2];
						var oTitleFieldOri = aFormContents[3];
						var oTitleField = aFormContents[4];
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
						assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
						assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.equal(oMainNode.text, "Main Card", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var aNodes0 = oNode0.nodes;
						var oNode0_0 = aNodes0[0];
						assert.equal(oNode0_0.text, "Test Card(in sap.app)", "Child tree oNode0_0 text is OK");
						assert.equal(oNode0_0.path, "child1/child1-1", "Child tree oNode0_0 path is OK");
						assert.ok(!oNode0_0.selected, "Child tree oNode0_0 selected: false");
						assert.equal(oNode0_0.nodes.length, 0, "Child tree oNode0_0 nodes length is OK");
						var oNode0_1 = aNodes0[1];
						assert.equal(oNode0_1.text, "Child1-2 (in config)", "Child tree oNode0_1 text is OK");
						assert.equal(oNode0_1.path, "child1/child1-2", "Child tree oNode0_1 path is OK");
						assert.ok(!oNode0_1.selected, "Child tree oNode0_1 selected: false");
						assert.equal(oNode0_1.nodes.length, 0, "Child tree oNode0_1 nodes length is OK");

						var oNode1 = aNodes[1];
						assert.equal(oNode1.text, "Child2 (in sap.app)", "Child tree node1 text is OK");
						assert.equal(oNode1.path, "child2", "Child tree node1 path is OK");
						assert.ok(!oNode1.selected, "Child tree node1 selected: false");
						assert.equal(oNode1.nodes.length, 1, "Child tree node1 nodes length is OK");
						var oNode1_0 = oNode1.nodes[0];
						assert.equal(oNode1_0.text, "Child2-1 (in config)", "Child tree oNode1_0 text is OK");
						assert.equal(oNode1_0.path, "child2/child2-1", "Child tree oNode1_0 path is OK");
						assert.ok(!oNode1_0.selected, "Child tree oNode1_0 selected: false");
						assert.equal(oNode1_0.nodes.length, 0, "Child tree oNode1_0 nodes length is OK");
						resolve();
					});
				});
			});
		});

		QUnit.test("all mode", function (assert) {
			var that = this;
			that.oEditor.setMode("all");
			that.oEditor.setCard({
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.equal(oMainNode.text, "Main Card", "Child tree main node text is OK");
						assert.equal(oMainNode.path, "", "Child tree main node path is OK");
						assert.ok(oMainNode.selected, "Child tree main node selected: true");

						var aNodes = oMainNode.nodes;
						assert.equal(aNodes.length, 2, "Child tree main node nodes length is OK");

						var oNode0 = aNodes[0];
						assert.equal(oNode0.text, "Child1 (in config)", "Child tree node0 text is OK");
						assert.equal(oNode0.path, "child1", "Child tree node0 path is OK");
						assert.ok(!oNode0.selected, "Child tree node0 selected: false");
						assert.equal(oNode0.nodes.length, 2, "Child tree node0 nodes length is OK");

						var aNodes0 = oNode0.nodes;
						var oNode0_0 = aNodes0[0];
						assert.equal(oNode0_0.text, "Test Card(in sap.app)", "Child tree oNode0_0 text is OK");
						assert.equal(oNode0_0.path, "child1/child1-1", "Child tree oNode0_0 path is OK");
						assert.ok(!oNode0_0.selected, "Child tree oNode0_0 selected: false");
						assert.equal(oNode0_0.nodes.length, 0, "Child tree oNode0_0 nodes length is OK");
						var oNode0_1 = aNodes0[1];
						assert.equal(oNode0_1.text, "Child1-2 (in config)", "Child tree oNode0_1 text is OK");
						assert.equal(oNode0_1.path, "child1/child1-2", "Child tree oNode0_1 path is OK");
						assert.ok(!oNode0_1.selected, "Child tree oNode0_1 selected: false");
						assert.equal(oNode0_1.nodes.length, 0, "Child tree oNode0_1 nodes length is OK");

						var oNode1 = aNodes[1];
						assert.equal(oNode1.text, "Child2 (in sap.app)", "Child tree node1 text is OK");
						assert.equal(oNode1.path, "child2", "Child tree node1 path is OK");
						assert.ok(!oNode1.selected, "Child tree node1 selected: false");
						assert.equal(oNode1.nodes.length, 1, "Child tree node1 nodes length is OK");
						var oNode1_0 = oNode1.nodes[0];
						assert.equal(oNode1_0.text, "Child2-1 (in config)", "Child tree oNode1_0 text is OK");
						assert.equal(oNode1_0.path, "child2/child2-1", "Child tree oNode1_0 path is OK");
						assert.ok(!oNode1_0.selected, "Child tree oNode1_0 selected: false");
						assert.equal(oNode1_0.nodes.length, 0, "Child tree oNode1_0 nodes length is OK");
						resolve();
					});
				});
			});
		});
	});

	QUnit.module("expand and collapse - admin mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest(undefined, undefined,"CardEditor");
			this.oEditor.setMode("admin");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("expand and collapse child1", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

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
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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

						// collapse child1
						oArrow = Element.getElementById(oNewItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree length is OK after collapse child1");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 1 is leaf: false");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand child1 then child2", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

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
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// expand child2
						oArrow = Element.getElementById(oNewItem4.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 6, "Child tree length is OK after expand child2 too");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						var oNewItem5 = that.oEditor._oChildTree.getItems()[5];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.ok(oNewItem4.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");
						assert.equal(oNewItem5.getTitle(), "Child2-1 (in config)", "Child tree item 5 title is OK");
						assert.ok(!oNewItem5.getExpanded(), "Child tree item 5 expanded: false");
						assert.ok(oNewItem5.isLeaf(), "Child tree item 5 is leaf: true");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand and collapse child2", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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

						// collapse child2
						oArrow = Element.getElementById(oNewItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree length is OK after collapse child1");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 1 is leaf: false");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand child2 then child1", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
						assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");

						// expand child1
						oArrow = Element.getElementById(oNewItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 6, "Child tree length is OK after expand child2 too");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						var oNewItem5 = that.oEditor._oChildTree.getItems()[5];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.ok(oNewItem4.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");
						assert.equal(oNewItem5.getTitle(), "Child2-1 (in config)", "Child tree item 5 title is OK");
						assert.ok(!oNewItem5.getExpanded(), "Child tree item 5 expanded: false");
						assert.ok(oNewItem5.isLeaf(), "Child tree item 5 is leaf: true");
						resolve();
					});
				});
			});
		});
	});

	QUnit.module("expand and collapse - content mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest(undefined, undefined,"CardEditor");
			this.oEditor.setMode("content");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("expand and collapse child1", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

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
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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

						// collapse child1
						oArrow = Element.getElementById(oNewItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree length is OK after collapse child1");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 1 is leaf: false");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand child1 then child2", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

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
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// expand child2
						oArrow = Element.getElementById(oNewItem4.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 6, "Child tree length is OK after expand child2 too");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						var oNewItem5 = that.oEditor._oChildTree.getItems()[5];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.ok(oNewItem4.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");
						assert.equal(oNewItem5.getTitle(), "Child2-1 (in config)", "Child tree item 5 title is OK");
						assert.ok(!oNewItem5.getExpanded(), "Child tree item 5 expanded: false");
						assert.ok(oNewItem5.isLeaf(), "Child tree item 5 is leaf: true");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand and collapse child2", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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

						// collapse child2
						oArrow = Element.getElementById(oNewItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree length is OK after collapse child1");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 1 is leaf: false");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand child2 then child1", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
						assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");

						// expand child1
						oArrow = Element.getElementById(oNewItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 6, "Child tree length is OK after expand child2 too");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						var oNewItem5 = that.oEditor._oChildTree.getItems()[5];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.ok(oNewItem4.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");
						assert.equal(oNewItem5.getTitle(), "Child2-1 (in config)", "Child tree item 5 title is OK");
						assert.ok(!oNewItem5.getExpanded(), "Child tree item 5 expanded: false");
						assert.ok(oNewItem5.isLeaf(), "Child tree item 5 is leaf: true");
						resolve();
					});
				});
			});
		});
	});

	QUnit.module("expand and collapse - translation mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest(undefined, undefined,"CardEditor");
			this.oEditor.setMode("translation");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("expand and collapse child1", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						var oTitleLabel = aFormContents[2];
						var oTitleFieldOri = aFormContents[3];
						var oTitleField = aFormContents[4];
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
						assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
						assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

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
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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

						// collapse child1
						oArrow = Element.getElementById(oNewItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree length is OK after collapse child1");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 1 is leaf: false");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand child1 then child2", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						var oTitleLabel = aFormContents[2];
						var oTitleFieldOri = aFormContents[3];
						var oTitleField = aFormContents[4];
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
						assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
						assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

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
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// expand child2
						oArrow = Element.getElementById(oNewItem4.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 6, "Child tree length is OK after expand child2 too");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						var oNewItem5 = that.oEditor._oChildTree.getItems()[5];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.ok(oNewItem4.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");
						assert.equal(oNewItem5.getTitle(), "Child2-1 (in config)", "Child tree item 5 title is OK");
						assert.ok(!oNewItem5.getExpanded(), "Child tree item 5 expanded: false");
						assert.ok(oNewItem5.isLeaf(), "Child tree item 5 is leaf: true");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand and collapse child2", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						var oTitleLabel = aFormContents[2];
						var oTitleFieldOri = aFormContents[3];
						var oTitleField = aFormContents[4];
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
						assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
						assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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

						// collapse child2
						oArrow = Element.getElementById(oNewItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree length is OK after collapse child1");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 1 is leaf: false");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand child2 then child1", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");

						var oTitleLabel = aFormContents[2];
						var oTitleFieldOri = aFormContents[3];
						var oTitleField = aFormContents[4];
						assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
						assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
						assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
						assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
						assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
						assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
						assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
						assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
						assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");

						// expand child1
						oArrow = Element.getElementById(oNewItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 6, "Child tree length is OK after expand child2 too");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						var oNewItem5 = that.oEditor._oChildTree.getItems()[5];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.ok(oNewItem4.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");
						assert.equal(oNewItem5.getTitle(), "Child2-1 (in config)", "Child tree item 5 title is OK");
						assert.ok(!oNewItem5.getExpanded(), "Child tree item 5 expanded: false");
						assert.ok(oNewItem5.isLeaf(), "Child tree item 5 is leaf: true");
						resolve();
					});
				});
			});
		});
	});

	QUnit.module("expand and collapse - all mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest(undefined, undefined,"CardEditor");
			this.oEditor.setMode("all");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("expand and collapse child1", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

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
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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

						// collapse child1
						oArrow = Element.getElementById(oNewItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree length is OK after collapse child1");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 1 is leaf: false");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand child1 then child2", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

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
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(oNewItem1.getExpanded(), "Child tree item 1 expanded: true");
						assert.equal(oNewItem2.getTitle(), "Test Card(in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.equal(oNewItem3.getTitle(), "Child1-2 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
						assert.equal(oNewItem4.getTitle(), "Child2 (in sap.app)", "Child tree item 4 title is OK");
						assert.ok(!oNewItem4.getExpanded(), "Child tree item 4 expanded: false");

						// expand child2
						oArrow = Element.getElementById(oNewItem4.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 6, "Child tree length is OK after expand child2 too");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						var oNewItem5 = that.oEditor._oChildTree.getItems()[5];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.ok(oNewItem4.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");
						assert.equal(oNewItem5.getTitle(), "Child2-1 (in config)", "Child tree item 5 title is OK");
						assert.ok(!oNewItem5.getExpanded(), "Child tree item 5 expanded: false");
						assert.ok(oNewItem5.isLeaf(), "Child tree item 5 is leaf: true");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand and collapse child2", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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

						// collapse child2
						oArrow = Element.getElementById(oNewItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree length is OK after collapse child1");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oNewItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oNewItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oNewItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oNewItem2.isLeaf(), "Child tree item 1 is leaf: false");
						resolve();
					});
				});
			});
		});

		QUnit.test("expand child2 then child1", function (assert) {
			var that = this;
			that.oEditor.setCard({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: sBaseUrl + "manifest.json"
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
					var aFormContents = that.oEditor.getAggregation("_formContent");
					assert.equal(aFormContents.length, 16, "Editor: form content length is OK");
					var oLabel = aFormContents[1];
					var oField = aFormContents[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "cardTitle", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "Trans Card Title en", "Field: String Value");
					EditorQunitUtils.isReady(that.oEditor).then(async function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						assert.ok(that.oEditor._oChildTree, "Child tree is created");
						assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
						var oItem0 = that.oEditor._oChildTree.getItems()[0];
						var oItem1 = that.oEditor._oChildTree.getItems()[1];
						var oItem2 = that.oEditor._oChildTree.getItems()[2];
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// expand child2
						var oArrow = Element.getElementById(oItem2.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child2");
						var oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						var oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						var oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oNewItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.equal(oNewItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oNewItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.equal(oNewItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(oNewItem2.getExpanded(), "Child tree item 4 expanded: true");
						assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
						assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");

						// expand child1
						oArrow = Element.getElementById(oNewItem1.getId() + "-expander");
						oArrow.firePress();
						await nextUIUpdate();
						assert.equal(that.oEditor._oChildTree.getItems().length, 6, "Child tree length is OK after expand child2 too");
						oNewItem0 = that.oEditor._oChildTree.getItems()[0];
						oNewItem1 = that.oEditor._oChildTree.getItems()[1];
						oNewItem2 = that.oEditor._oChildTree.getItems()[2];
						oNewItem3 = that.oEditor._oChildTree.getItems()[3];
						var oNewItem4 = that.oEditor._oChildTree.getItems()[4];
						var oNewItem5 = that.oEditor._oChildTree.getItems()[5];
						assert.equal(oNewItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
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
						assert.ok(oNewItem4.getExpanded(), "Child tree item 4 expanded: true");
						assert.ok(!oNewItem4.isLeaf(), "Child tree item 4 is leaf: false");
						assert.equal(oNewItem5.getTitle(), "Child2-1 (in config)", "Child tree item 5 title is OK");
						assert.ok(!oNewItem5.getExpanded(), "Child tree item 5 expanded: false");
						assert.ok(oNewItem5.isLeaf(), "Child tree item 5 is leaf: true");
						resolve();
					});
				});
			});
		});
	});
});
