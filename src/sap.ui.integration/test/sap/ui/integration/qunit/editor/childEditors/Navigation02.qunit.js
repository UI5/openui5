/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/merge",
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
	merge,
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

	QUnit.module("translation mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
			this.oEditor.setMode("translation");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("click and load child1", function (assert) {
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

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

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

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then back to main", function (assert) {
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

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

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

								// simulate to click main
								that.oEditor._oChildTree.onItemPress(oNewItem0, oNewItem0);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again after back to main");
									var aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again after back to main");

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

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then child1-1", function (assert) {
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

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

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

								// simulate to click child1-1
								that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										oTitleLabel = aFormContents[2];
										oTitleFieldOri = aFormContents[3];
										oTitleField = aFormContents[4];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
										assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
										assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then child1-1, then back to main", function (assert) {
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

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

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

								// simulate to click child1-1
								that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										oTitleLabel = aFormContents[2];
										oTitleFieldOri = aFormContents[3];
										oTitleField = aFormContents[4];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
										assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
										assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										// simulate to click main
										that.oEditor._oChildTree.onItemPress(oNewItem0, oNewItem0);
										EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
											assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again after back to main");
											var aFormContents = that.oEditor.getAggregation("_formContent");
											assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
											EditorQunitUtils.isReady(that.oEditor).then(function () {
												assert.ok(that.oEditor.isReady(), "Editor is ready again after back to main");

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

												assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
												oNewItem0 = that.oEditor._oChildTree.getItems()[0];
												oNewItem1 = that.oEditor._oChildTree.getItems()[1];
												oNewItem2 = that.oEditor._oChildTree.getItems()[2];
												oNewItem3 = that.oEditor._oChildTree.getItems()[3];
												oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

												resolve();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then child1-2", function (assert) {
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

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

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

								// simulate to click child1-2
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										oTitleLabel = aFormContents[2];
										oTitleFieldOri = aFormContents[3];
										oTitleField = aFormContents[4];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
										assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
										assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then child1-2, then back to main", function (assert) {
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

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

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

								// simulate to click child1-2
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										oTitleLabel = aFormContents[2];
										oTitleFieldOri = aFormContents[3];
										oTitleField = aFormContents[4];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
										assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
										assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										// simulate to click main
										that.oEditor._oChildTree.onItemPress(oNewItem0, oNewItem0);
										EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
											assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again after back to main");
											var aFormContents = that.oEditor.getAggregation("_formContent");
											assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
											EditorQunitUtils.isReady(that.oEditor).then(function () {
												assert.ok(that.oEditor.isReady(), "Editor is ready again after back to main");

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

												assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
												oNewItem0 = that.oEditor._oChildTree.getItems()[0];
												oNewItem1 = that.oEditor._oChildTree.getItems()[1];
												oNewItem2 = that.oEditor._oChildTree.getItems()[2];
												oNewItem3 = that.oEditor._oChildTree.getItems()[3];
												oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

												resolve();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child2", function (assert) {
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

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
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

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child2, then back to main", function (assert) {
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

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
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

								// simulate to click main
								that.oEditor._oChildTree.onItemPress(oNewItem0, oNewItem0);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again after back to main");
									var aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again after back to main");

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

										assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
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

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("expand child1 then click child1-1", function (assert) {
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

						// simulate to click child1-1
						that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							var aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("expand child1 then click child1-2", function (assert) {
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

						// simulate to click child1-2
						that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								oTitleLabel = aFormContents[2];
								oTitleFieldOri = aFormContents[3];
								oTitleField = aFormContents[4];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), "Trans Card Title en", "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

								resolve();
							});
						});
					});
				});
			});
		});
	});

	QUnit.module("all mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
			this.oEditor.setMode("all");
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("click and load child1", function (assert) {
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 4, "MaxItem Field: Integer Value");

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

								oObjectLabel = aFormContents[7];
								oObjectField = aFormContents[8];
								assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
								assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
								assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
								assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
								oObjectFieldControl = oObjectField.getAggregation("_field");
								assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
								assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
								assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
								assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

								oObjectsLabel = aFormContents[9];
								oObjectsField = aFormContents[10];
								assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
								assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
								assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
								assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
								oObjectsFieldControl = oObjectsField.getAggregation("_field");
								assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
								assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
								assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
								assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

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

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then back to main", function (assert) {
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 4, "MaxItem Field: Integer Value");

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

								oObjectLabel = aFormContents[7];
								oObjectField = aFormContents[8];
								assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
								assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
								assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
								assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
								oObjectFieldControl = oObjectField.getAggregation("_field");
								assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
								assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
								assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
								assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

								oObjectsLabel = aFormContents[9];
								oObjectsField = aFormContents[10];
								assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
								assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
								assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
								assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
								oObjectsFieldControl = oObjectsField.getAggregation("_field");
								assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
								assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
								assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
								assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

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

								// simulate to click main
								that.oEditor._oChildTree.onItemPress(oNewItem0, oNewItem0);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again after back to main");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 16, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again after back to main");

										oTitleLabel = aFormContents[1];
										oTitleField = aFormContents[2];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										oMaxItemLabel = aFormContents[3];
										oMaxItemField = aFormContents[4];
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemField.getAggregation("_field").getValue(), 3, "MaxItem Field: Integer Value");

										oCustomerLabel = aFormContents[5];
										oCustomerField = aFormContents[6];
										assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
										assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
										assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
										oCustomerFieldControl = oCustomerField.getAggregation("_field");
										assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
										assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
										assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
										assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");

										oObjectLabel = aFormContents[7];
										oObjectField = aFormContents[8];
										assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
										assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
										assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
										assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
										oObjectFieldControl = oObjectField.getAggregation("_field");
										assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
										assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
										assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
										assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

										oObjectsLabel = aFormContents[9];
										oObjectsField = aFormContents[10];
										assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
										assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
										assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
										assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
										oObjectsFieldControl = oObjectsField.getAggregation("_field");
										assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
										assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
										assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
										assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

										oDestinationNorthWindLabel = aFormContents[12];
										oDestinationNorthWindField = aFormContents[13];
										assert.ok(oDestinationNorthWindLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
										assert.equal(oDestinationNorthWindLabel.getText(), "northwind", "Label: Has northwind label from destination settings name");
										assert.ok(oDestinationNorthWindField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

										oDestinationMockLabel = aFormContents[14];
										oDestinationMockField = aFormContents[15];
										assert.ok(oDestinationMockLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
										assert.equal(oDestinationMockLabel.getText(), "mock_request", "Label: Has mock_request label from destination settings name");
										assert.ok(oDestinationMockField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then child1-1", function (assert) {
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 4, "MaxItem Field: Integer Value");

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

								oObjectLabel = aFormContents[7];
								oObjectField = aFormContents[8];
								assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
								assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
								assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
								assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
								oObjectFieldControl = oObjectField.getAggregation("_field");
								assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
								assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
								assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
								assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

								oObjectsLabel = aFormContents[9];
								oObjectsField = aFormContents[10];
								assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
								assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
								assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
								assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
								oObjectsFieldControl = oObjectsField.getAggregation("_field");
								assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
								assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
								assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
								assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

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

								// simulate to click child1-1
								that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										oTitleLabel = aFormContents[1];
										oTitleField = aFormContents[2];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										oMaxItemLabel = aFormContents[3];
										oMaxItemField = aFormContents[4];
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemField.getAggregation("_field").getValue(), 6, "MaxItem Field: Integer Value");

										oCustomerLabel = aFormContents[5];
										oCustomerField = aFormContents[6];
										assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
										assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
										assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
										oCustomerFieldControl = oCustomerField.getAggregation("_field");
										assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
										assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
										assert.equal(oCustomerFieldControl.getSelectedKey(), "b", "Customer Field: Key Value");
										assert.equal(oCustomerFieldControl.getValue(), "B Company", "Customer Field: String Value");

										oEmployeeLabel = aFormContents[7];
										oEmployeeField = aFormContents[8];
										assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
										assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
										assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
										oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
										assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
										assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
										assert.equal(oEmployeeFieldControl.getSelectedKey(), 2, "Employee Field: Key Value");
										assert.equal(oEmployeeFieldControl.getValue(), "FirstName2 LastName2", "Employee Field: String Value");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then child1-1, then back to main", function (assert) {
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 4, "MaxItem Field: Integer Value");

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

								oObjectLabel = aFormContents[7];
								oObjectField = aFormContents[8];
								assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
								assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
								assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
								assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
								oObjectFieldControl = oObjectField.getAggregation("_field");
								assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
								assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
								assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
								assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

								oObjectsLabel = aFormContents[9];
								oObjectsField = aFormContents[10];
								assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
								assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
								assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
								assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
								oObjectsFieldControl = oObjectsField.getAggregation("_field");
								assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
								assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
								assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
								assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

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

								// simulate to click child1-1
								that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										oTitleLabel = aFormContents[1];
										oTitleField = aFormContents[2];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										oMaxItemLabel = aFormContents[3];
										oMaxItemField = aFormContents[4];
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemField.getAggregation("_field").getValue(), 6, "MaxItem Field: Integer Value");

										oCustomerLabel = aFormContents[5];
										oCustomerField = aFormContents[6];
										assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
										assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
										assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
										oCustomerFieldControl = oCustomerField.getAggregation("_field");
										assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
										assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
										assert.equal(oCustomerFieldControl.getSelectedKey(), "b", "Customer Field: Key Value");
										assert.equal(oCustomerFieldControl.getValue(), "B Company", "Customer Field: String Value");

										oEmployeeLabel = aFormContents[7];
										oEmployeeField = aFormContents[8];
										assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
										assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
										assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
										oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
										assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
										assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
										assert.equal(oEmployeeFieldControl.getSelectedKey(), 2, "Employee Field: Key Value");
										assert.equal(oEmployeeFieldControl.getValue(), "FirstName2 LastName2", "Employee Field: String Value");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										// simulate to click main
										that.oEditor._oChildTree.onItemPress(oNewItem0, oNewItem0);
										EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
											assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again after back to main");
											aFormContents = that.oEditor.getAggregation("_formContent");
											assert.equal(aFormContents.length, 16, "Editor: form content length is OK");

											EditorQunitUtils.isReady(that.oEditor).then(function () {
												assert.ok(that.oEditor.isReady(), "Editor is ready again after back to main");

												oTitleLabel = aFormContents[1];
												oTitleField = aFormContents[2];
												assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
												assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
												assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
												assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
												assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

												oMaxItemLabel = aFormContents[3];
												oMaxItemField = aFormContents[4];
												assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
												assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
												assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
												assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
												assert.equal(oMaxItemField.getAggregation("_field").getValue(), 3, "MaxItem Field: Integer Value");

												oCustomerLabel = aFormContents[5];
												oCustomerField = aFormContents[6];
												assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
												assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
												assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
												oCustomerFieldControl = oCustomerField.getAggregation("_field");
												assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
												assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
												assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
												assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");

												oObjectLabel = aFormContents[7];
												oObjectField = aFormContents[8];
												assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
												assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
												assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
												assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
												oObjectFieldControl = oObjectField.getAggregation("_field");
												assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
												assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
												assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
												assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

												oObjectsLabel = aFormContents[9];
												oObjectsField = aFormContents[10];
												assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
												assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
												assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
												assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
												oObjectsFieldControl = oObjectsField.getAggregation("_field");
												assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
												assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
												assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
												assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

												oDestinationNorthWindLabel = aFormContents[12];
												oDestinationNorthWindField = aFormContents[13];
												assert.ok(oDestinationNorthWindLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
												assert.equal(oDestinationNorthWindLabel.getText(), "northwind", "Label: Has northwind label from destination settings name");
												assert.ok(oDestinationNorthWindField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

												oDestinationMockLabel = aFormContents[14];
												oDestinationMockField = aFormContents[15];
												assert.ok(oDestinationMockLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
												assert.equal(oDestinationMockLabel.getText(), "mock_request", "Label: Has mock_request label from destination settings name");
												assert.ok(oDestinationMockField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

												assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
												oNewItem0 = that.oEditor._oChildTree.getItems()[0];
												oNewItem1 = that.oEditor._oChildTree.getItems()[1];
												oNewItem2 = that.oEditor._oChildTree.getItems()[2];
												oNewItem3 = that.oEditor._oChildTree.getItems()[3];
												oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

												resolve();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then child1-2", function (assert) {
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 4, "MaxItem Field: Integer Value");

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

								oObjectLabel = aFormContents[7];
								oObjectField = aFormContents[8];
								assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
								assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
								assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
								assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
								oObjectFieldControl = oObjectField.getAggregation("_field");
								assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
								assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
								assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
								assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

								oObjectsLabel = aFormContents[9];
								oObjectsField = aFormContents[10];
								assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
								assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
								assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
								assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
								oObjectsFieldControl = oObjectsField.getAggregation("_field");
								assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
								assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
								assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
								assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

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

								// simulate to click child1-2
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 7, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										oTitleLabel = aFormContents[1];
										oTitleField = aFormContents[2];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										oMaxItemLabel = aFormContents[3];
										oMaxItemField = aFormContents[4];
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemField.getAggregation("_field").getValue(), 5, "MaxItem Field: Integer Value");

										var oOrderLabel = aFormContents[5];
										var oOrderField = aFormContents[6];
										assert.ok(oOrderLabel.isA("sap.m.Label"), "Order Label: Form content contains a Label");
										assert.equal(oOrderLabel.getText(), "Order", "Order Label: Has static label text");
										assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Order Field: String Field");
										var oOrderFieldControl = oOrderField.getAggregation("_field");
										assert.ok(oOrderFieldControl.isA("sap.m.ComboBox"), "Order Field: Control is a ComboBox");
										assert.equal(oOrderFieldControl.getItems().length, 3, "Order Field: items length is OK");
										assert.equal(oOrderFieldControl.getSelectedKey(), "1", "Order Field: Key Value");
										assert.equal(oOrderFieldControl.getValue(), "1-a-1", "Order Field: String Value");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child1, then child1-2, then back to main", function (assert) {
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// simulate to click child1
						that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 4, "MaxItem Field: Integer Value");

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

								oObjectLabel = aFormContents[7];
								oObjectField = aFormContents[8];
								assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
								assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
								assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
								assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
								oObjectFieldControl = oObjectField.getAggregation("_field");
								assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
								assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
								assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
								assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

								oObjectsLabel = aFormContents[9];
								oObjectsField = aFormContents[10];
								assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
								assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
								assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
								assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
								oObjectsFieldControl = oObjectsField.getAggregation("_field");
								assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
								assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
								assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
								assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

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

								// simulate to click child1-2
								that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 7, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again too");

										oTitleLabel = aFormContents[1];
										oTitleField = aFormContents[2];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										oMaxItemLabel = aFormContents[3];
										oMaxItemField = aFormContents[4];
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemField.getAggregation("_field").getValue(), 5, "MaxItem Field: Integer Value");

										var oOrderLabel = aFormContents[5];
										var oOrderField = aFormContents[6];
										assert.ok(oOrderLabel.isA("sap.m.Label"), "Order Label: Form content contains a Label");
										assert.equal(oOrderLabel.getText(), "Order", "Order Label: Has static label text");
										assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Order Field: String Field");
										var oOrderFieldControl = oOrderField.getAggregation("_field");
										assert.ok(oOrderFieldControl.isA("sap.m.ComboBox"), "Order Field: Control is a ComboBox");
										assert.equal(oOrderFieldControl.getItems().length, 3, "Order Field: items length is OK");
										assert.equal(oOrderFieldControl.getSelectedKey(), "1", "Order Field: Key Value");
										assert.equal(oOrderFieldControl.getValue(), "1-a-1", "Order Field: String Value");

										assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
										oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

										// simulate to click main
										that.oEditor._oChildTree.onItemPress(oNewItem0, oNewItem0);
										EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
											assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again after back to main");
											aFormContents = that.oEditor.getAggregation("_formContent");
											assert.equal(aFormContents.length, 16, "Editor: form content length is OK");

											EditorQunitUtils.isReady(that.oEditor).then(function () {
												assert.ok(that.oEditor.isReady(), "Editor is ready again after back to main");

												oTitleLabel = aFormContents[1];
												oTitleField = aFormContents[2];
												assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
												assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
												assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
												assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
												assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

												oMaxItemLabel = aFormContents[3];
												oMaxItemField = aFormContents[4];
												assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
												assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
												assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
												assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
												assert.equal(oMaxItemField.getAggregation("_field").getValue(), 3, "MaxItem Field: Integer Value");

												oCustomerLabel = aFormContents[5];
												oCustomerField = aFormContents[6];
												assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
												assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
												assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
												oCustomerFieldControl = oCustomerField.getAggregation("_field");
												assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
												assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
												assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
												assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");

												oObjectLabel = aFormContents[7];
												oObjectField = aFormContents[8];
												assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
												assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
												assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
												assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
												oObjectFieldControl = oObjectField.getAggregation("_field");
												assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
												assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
												assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
												assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

												oObjectsLabel = aFormContents[9];
												oObjectsField = aFormContents[10];
												assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
												assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
												assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
												assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
												oObjectsFieldControl = oObjectsField.getAggregation("_field");
												assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
												assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
												assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
												assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

												oDestinationNorthWindLabel = aFormContents[12];
												oDestinationNorthWindField = aFormContents[13];
												assert.ok(oDestinationNorthWindLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
												assert.equal(oDestinationNorthWindLabel.getText(), "northwind", "Label: Has northwind label from destination settings name");
												assert.ok(oDestinationNorthWindField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

												oDestinationMockLabel = aFormContents[14];
												oDestinationMockField = aFormContents[15];
												assert.ok(oDestinationMockLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
												assert.equal(oDestinationMockLabel.getText(), "mock_request", "Label: Has mock_request label from destination settings name");
												assert.ok(oDestinationMockField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

												assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
												oNewItem0 = that.oEditor._oChildTree.getItems()[0];
												oNewItem1 = that.oEditor._oChildTree.getItems()[1];
												oNewItem2 = that.oEditor._oChildTree.getItems()[2];
												oNewItem3 = that.oEditor._oChildTree.getItems()[3];
												oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

												resolve();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child2", function (assert) {
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 5, "MaxItem Field: Integer Value");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
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

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("click and load child2, then back to main", function (assert) {
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
						assert.equal(oItem0.getTitle(), "Main Card", "Child tree item 0 title is OK");
						assert.ok(oItem0.getExpanded(), "Child tree item 0 expanded: true");
						assert.ok(oItem0.isTopLevel(), "Child tree item 1 is top level: true");
						assert.equal(oItem1.getTitle(), "Child1 (in config)", "Child tree item 1 title is OK");
						assert.ok(!oItem1.getExpanded(), "Child tree item 1 expanded: false");
						assert.ok(!oItem1.isLeaf(), "Child tree item 1 is leaf: false");
						assert.equal(oItem2.getTitle(), "Child2 (in sap.app)", "Child tree item 2 title is OK");
						assert.ok(!oItem2.getExpanded(), "Child tree item 2 expanded: false");
						assert.ok(!oItem2.isLeaf(), "Child tree item 2 is leaf: false");

						// simulate to click child2
						that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 5, "MaxItem Field: Integer Value");

								assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
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

								// simulate to click main
								that.oEditor._oChildTree.onItemPress(oNewItem0, oNewItem0);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again after back to main");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 16, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again after back to main");

										oTitleLabel = aFormContents[1];
										oTitleField = aFormContents[2];
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

										oMaxItemLabel = aFormContents[3];
										oMaxItemField = aFormContents[4];
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemField.getAggregation("_field").getValue(), 3, "MaxItem Field: Integer Value");

										oCustomerLabel = aFormContents[5];
										oCustomerField = aFormContents[6];
										assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
										assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
										assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
										oCustomerFieldControl = oCustomerField.getAggregation("_field");
										assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
										assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
										assert.equal(oCustomerFieldControl.getSelectedKey(), "a", "Customer Field: Key Value");
										assert.equal(oCustomerFieldControl.getValue(), "A Company", "Customer Field: String Value");

										oObjectLabel = aFormContents[7];
										oObjectField = aFormContents[8];
										assert.ok(oObjectLabel.isA("sap.m.Label"), "Object Label: Form content contains a Label");
										assert.equal(oObjectLabel.getText(), "Object properties defined: value from Json list", "Object Label: Has label text");
										assert.ok(oObjectField.isA("sap.ui.integration.editor.fields.ObjectField"), "Object Field: Object Field");
										assert.ok(!oObjectField._getCurrentProperty("value"), "Object Field: Object Value");
										oObjectFieldControl = oObjectField.getAggregation("_field");
										assert.ok(oObjectFieldControl.isA("sap.ui.table.Table"), "Object Field: Control is Table");
										assert.equal(oObjectFieldControl.getRows().length, 5, "Object Field Table: line number is 5");
										assert.equal(oObjectFieldControl.getBinding().getCount(), 8, "Object Field Table: value length is 8");
										assert.ok(oObjectFieldControl.getSelectedIndices().length === 0, "Object Field Table: no selected row");

										oObjectsLabel = aFormContents[9];
										oObjectsField = aFormContents[10];
										assert.ok(oObjectsLabel.isA("sap.m.Label"), "Objects Label: Form content contains a Label");
										assert.equal(oObjectsLabel.getText(), "Objects properties defined: value from Json list", "Objects Label: Has label text");
										assert.ok(oObjectsField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Objects Field: Object List Field");
										assert.ok(!oObjectsField._getCurrentProperty("value"), "Objects Field: Objects Value");
										oObjectsFieldControl = oObjectsField.getAggregation("_field");
										assert.ok(oObjectsFieldControl.isA("sap.ui.table.Table"), "Objects Field: Control is Table");
										assert.equal(oObjectsFieldControl.getRows().length, 5, "Objects Field Table: line number is 5");
										assert.equal(oObjectsFieldControl.getBinding().getCount(), 8, "Objects Field Table: value length is 8");
										assert.ok(oObjectsFieldControl.getSelectedIndices().length === 0, "Objects Field Table: no selected row");

										oDestinationNorthWindLabel = aFormContents[12];
										oDestinationNorthWindField = aFormContents[13];
										assert.ok(oDestinationNorthWindLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
										assert.equal(oDestinationNorthWindLabel.getText(), "northwind", "Label: Has northwind label from destination settings name");
										assert.ok(oDestinationNorthWindField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

										oDestinationMockLabel = aFormContents[14];
										oDestinationMockField = aFormContents[15];
										assert.ok(oDestinationMockLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
										assert.equal(oDestinationMockLabel.getText(), "mock_request", "Label: Has mock_request label from destination settings name");
										assert.ok(oDestinationMockField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");

										assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
										oNewItem0 = that.oEditor._oChildTree.getItems()[0];
										oNewItem1 = that.oEditor._oChildTree.getItems()[1];
										oNewItem2 = that.oEditor._oChildTree.getItems()[2];
										oNewItem3 = that.oEditor._oChildTree.getItems()[3];
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

										resolve();
									});
								});
							});
						});
					});
				});
			});
		});

		QUnit.test("expand child1 then click child1-1", function (assert) {
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

						// simulate to click child1-1
						that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							var aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 6, "MaxItem Field: Integer Value");

								oCustomerLabel = aFormContents[5];
								oCustomerField = aFormContents[6];
								assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
								assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
								assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
								oCustomerFieldControl = oCustomerField.getAggregation("_field");
								assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
								assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
								assert.equal(oCustomerFieldControl.getSelectedKey(), "b", "Customer Field: Key Value");
								assert.equal(oCustomerFieldControl.getValue(), "B Company", "Customer Field: String Value");

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

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

								resolve();
							});
						});
					});
				});
			});
		});

		QUnit.test("expand child1 then click child1-2", function (assert) {
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

						// simulate to click child1-2
						that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
							aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 7, "Editor: form content length is OK");

							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready again too");

								oTitleLabel = aFormContents[1];
								oTitleField = aFormContents[2];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleField.getAggregation("_field").isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleField.getAggregation("_field").getValue(), "Trans Card Title en", "Title Field: String Value");

								oMaxItemLabel = aFormContents[3];
								oMaxItemField = aFormContents[4];
								assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
								assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
								assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
								assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
								assert.equal(oMaxItemField.getAggregation("_field").getValue(), 5, "MaxItem Field: Integer Value");

								var oOrderLabel = aFormContents[5];
								var oOrderField = aFormContents[6];
								assert.ok(oOrderLabel.isA("sap.m.Label"), "Order Label: Form content contains a Label");
								assert.equal(oOrderLabel.getText(), "Order", "Order Label: Has static label text");
								assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Order Field: String Field");
								var oOrderFieldControl = oOrderField.getAggregation("_field");
								assert.ok(oOrderFieldControl.isA("sap.m.ComboBox"), "Order Field: Control is a ComboBox");
								assert.equal(oOrderFieldControl.getItems().length, 3, "Order Field: items length is OK");
								assert.equal(oOrderFieldControl.getSelectedKey(), "1", "Order Field: Key Value");
								assert.equal(oOrderFieldControl.getValue(), "1-a-1", "Order Field: String Value");

								assert.equal(that.oEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
								oNewItem0 = that.oEditor._oChildTree.getItems()[0];
								oNewItem1 = that.oEditor._oChildTree.getItems()[1];
								oNewItem2 = that.oEditor._oChildTree.getItems()[2];
								oNewItem3 = that.oEditor._oChildTree.getItems()[3];
								oNewItem4 = that.oEditor._oChildTree.getItems()[4];
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

								resolve();
							});
						});
					});
				});
			});
		});
	});
});
