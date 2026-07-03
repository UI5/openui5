/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"./jsons/withDesigntime/sap.card1/DataExtensionImpl",
	"sap/ui/core/date/UI5Date",
	"sap/ui/integration/formatters/IconFormatter",
	"qunit/designtime/EditorQunitUtils"
], function(
	merge,
	x,
	Element,
	Library,
	Editor,
	Designtime,
	Host,
	nextUIUpdate,
	sinon,
	ContextHost,
	QUnitUtils,
	KeyCodes,
	ResourceBundle,
	DataExtensionImpl,
	UI5Date,
	IconFormatter,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card1/";

	document.body.className = document.body.className + " sapUiSizeCompact ";

	function getDefaultContextModel(oResourceBundle) {

		return {
			empty: {
				label: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_VAL"),
				type: "string",
				description: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_DESC"),
				placeholder: "",
				value: ""
			},
			"editor.internal": {
				label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_INTERNAL_VAL"),
				todayIso: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					customize: ["format.dataTime"],
					value: "{{parameters.TODAY_ISO}}"
				},
				nowIso: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					customize: ["dateFormatters"],
					value: "{{parameters.NOW_ISO}}"
				},
				currentLanguage: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					tags: ["technical"],
					customize: ["languageFormatters"],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					value: "{{parameters.LOCALE}}"
				}
			}
		};
	}

	QUnit.module("Create an editor based on old manifest without dt", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("1 string parameter", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value",
									"label": "string Parameter",
									"type": "string"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "string Parameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
					var oCurrentSettings = this.oEditor.getCurrentSettings();
					assert.equal(oCurrentSettings["/sap.card1/configuration/parameters/stringParameter/value"], "stringParameter Value", "Field: manifestpath Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Create an editor based on json with designtime module", {
		beforeEach: function () {
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
		}
	}, function () {
		QUnit.test("Empty Host Context", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ host: "host", manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					var oModel = this.oEditor.getModel("context");
					assert.ok(oModel !== null, "Editor has a context model");
					assert.deepEqual(oModel.getData(), getDefaultContextModel(this.oEditor._oResourceBundle), "Editor has a default context model");
					assert.equal(oModel.getProperty("/sap.workzone/currentUser/id"), undefined, "Editor context /sap.workzone/currentUser/id is undefned");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Context Host checks to access context data async", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ host: "contexthost", manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					var oModel = this.oEditor.getModel("context");
					assert.ok(oModel !== null, "Editor has a context model");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/label"), "Id of the Work Zone user", "Editor host context contains the user id label 'Id of the Work Zone'");
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/placeholder"), "Work Zone user id", "Editor host context contains the user id placeholder 'Work Zone user id'");
					var oBinding = oModel.bindProperty("/sap.workzone/currentUser/id/value");
					oBinding.attachChange(function () {
						assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), "MyCurrentUserId", "Editor host context user id value is 'MyCurrentUserId'");
						resolve();
					});
					assert.strictEqual(oModel.getProperty("/sap.workzone/currentUser/id/value"), undefined, "Editor host context user id value is undefined");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No configuration section (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/noconfig", "type": "List", "header": {} }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty configuration section (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/noconfig", "type": "List", "configuration": {} }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty parameters section (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "parameters": {} } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination section (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "destination": {} } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Empty destination and parameters section (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/noconfig", "type": "List", "configuration": { "destination": {}, "parameters": {} } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					assert.equal(this.oEditor.getAggregation("_formContent"), null, "No Content: Form content is empty");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and no label (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 hint below a group (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",

				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},

				"sap.card1": {
					"designtime": "designtime/1hintbelowgroup",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"type": "string"
							}
						}
					}
				}
			}
		});
		return new Promise(function (resolve, reject) {
			EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
				assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
				var oHint = this.oEditor.getAggregation("_formContent")[1];
				assert.ok(oHint.isA("sap.m.FormattedText"), "Hint: Form content contains a Hint");
				assert.equal(oHint.getHtmlText(), 'Please refer to the <a target="blank" href="https://www.sap.com" class="sapMLnk">documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a target="blank" href="https://www.sap.com" class="sapMLnk">two links</a>. good?', "Hint: Has html hint text");
				resolve();
			}.bind(this));
		}.bind(this));
		});

		QUnit.test("1 hint below an item (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",

				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18n/i18n.properties"
				},

				"sap.card1": {
					"designtime": "designtime/1hintbelowgroup",
					"type": "List",
					"configuration": {
						"parameters": {
							"stringParameter": {
								"type": "string"
							}
						}
					}
				}
			}
		});
		return new Promise(function (resolve, reject) {
			EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
				assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
				var oHint = this.oEditor.getAggregation("_formContent")[4];
				assert.ok(oHint.isA("sap.m.FormattedText"), "Hint: Form content contains a Hint");
				assert.equal(oHint.getHtmlText(), 'Please refer to the <a target="blank" href="https://www.sap.com" class="sapMLnk">documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a target="blank" href="https://www.sap.com" class="sapMLnk">two links</a>. good?', "Hint: Has html hint text");
				resolve();
			}.bind(this));
		}.bind(this));
		});

		QUnit.test("1 string parameter with values and no label (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1stringwithvalues", "type": "List", "configuration": { "parameters": { "stringParameterWithValues": { "type": "string" } } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Editor is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var aItems = oField.getAggregation("_field").getItems();
						assert.equal(aItems.length, 3, "Field: Select items lenght is OK");
						assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
						assert.equal(aItems[0].getText(), "text1", "Field: Select item 0 Text is OK");
						assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
						assert.equal(aItems[1].getText(), "text2", "Field: Select item 1 Text is OK");
						assert.equal(aItems[2].getKey(), "key3", "Field: Select item 1 Key is OK");
						assert.equal(aItems[2].getText(), "text3", "Field: Select item 1 Text is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter with request values from json file", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1stringWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"1stringWithRequestValues": {
									"type": "string"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameterWithValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Editor is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var aItems = oField.getAggregation("_field").getItems();
						assert.equal(aItems.length, 4, "Field: Select items lenght is OK");
						assert.equal(aItems[0].getKey(), "key1", "Field: Select item 0 Key is OK");
						assert.equal(aItems[0].getText(), "text1req", "Field: Select item 0 Text is OK");
						assert.equal(aItems[1].getKey(), "key2", "Field: Select item 1 Key is OK");
						assert.equal(aItems[1].getText(), "text2req", "Field: Select item 1 Text is OK");
						assert.equal(aItems[2].getKey(), "key3", "Field: Select item 2 Key is OK");
						assert.equal(aItems[2].getText(), "text3req", "Field: Select item 2 Text is OK");
						assert.equal(aItems[3].getKey(), "key4", "Field: Select item 3 Key is OK");
						assert.equal(aItems[3].getText(), "text4req", "Field: Select item 3 Text is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with values (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1stringarray",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameter": {
									"value": ["key1"]
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oField.getAggregation("_field").getItems().length, 5, "Field: MultiComboBox items lenght is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with no values (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1stringarraynovalues",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameterNoValues": {},
								"stringArrayParameterNoValuesNotEditable": {}
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringArrayParameterNoValues", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editor is Input");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: Input value is OK");
					oLabel = this.oEditor.getAggregation("_formContent")[3];
					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringArrayParameterNoValuesNotEditable", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editor is Input");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: Input value is OK");
					assert.ok(!oField.getAggregation("_field").getEditable(), "Field: Input editable is OK");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string array parameter with request values from json file", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1stringArrayWithRequestValues",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameter": {
									"value": ["key1"]
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringArrayParameter", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.MultiComboBox"), "Field: Editor is MultiComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oField.getAggregation("_field").getItems().length, 6, "Field: MultiComboBox items lenght is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1stringlabel",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "StaticLabel Value"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StaticLabel Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/icon", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oSelect = oField.getAggregation("_field").getAggregation("_control");
						EditorQunitUtils.wait(500).then(function () {
							oSelect.setSelectedIndex(10);
							oSelect.open();
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with Not Allow File (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/iconWithNotAllowFile", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oSelect.getItemByKey(IconFormatter.SRC_FOR_HIDDEN_ICON).getEnabled(), "Icon: item none is enabled");
						assert.ok(!oSelect.getItemByKey("file").getEnabled(), "Icon: item file is disabled");
						assert.ok(!oSelect.getItemByKey("selected").getEnabled(), "Icon: item selected is disabled");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 icon parameter with Not Allow None (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/iconWithNotAllowNone", "type": "List", "configuration": { "parameters": { "iconParameter": { "value": "sap-icon://cart" } } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.ok(oField.getAggregation("_field").isA("sap.ui.integration.editor.fields.viz.IconSelect"), "Field: Icon Select Field");
					var oSelect = oField.getAggregation("_field").getAggregation("_control");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(!oSelect.getItemByKey(IconFormatter.SRC_FOR_HIDDEN_ICON).getEnabled(), "Icon: item none is disabled");
						assert.ok(oSelect.getItemByKey("file").getEnabled(), "Icon: item file is enabled");
						assert.ok(!oSelect.getItemByKey("selected").getEnabled(), "Icon: item selected is disabled");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and value trans (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n en", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and value trans in i18n format (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{i18n>STRINGPARAMETERVALUE}"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n en", "Field: Value from Translate change");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 string parameter and label trans (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "StringLabelTrans Value"
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
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans in i18n en", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.equal(oField.getAggregation("_field").getValue(), "StringLabelTrans Value", "Field: String Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and no label no value (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1integer", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "integerParameter", "Label: Has integerParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.equal(oField.getAggregation("_field").getValue(), "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 integer parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1integerlabel", "type": "List", "configuration": { "parameters": { "integerParameter": {} } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "integerParameterLabel", "Label: Has integerParameter label from label");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.IntegerField"), "Field: Integer Field");
					assert.equal(oField.getAggregation("_field").getValue(), "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 number parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1number", "type": "List", "configuration": { "parameters": { "numberParameter": {} } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "numberParameter", "Label: Has numberParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.NumberField"), "Field: Number Field");
					assert.equal(oField.getAggregation("_field").getValue(), "0", "Field: Value 0 since No Value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 date parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1date", "type": "List", "configuration": { "parameters": { "dateParameter": {} } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(async function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "dateParameter", "Label: Has dateParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateField"), "Field: Date Field");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
					//force rendering
					await nextUIUpdate();
					//check the change event handling of the field
					oField.getAggregation("_field").setValue(UI5Date.getInstance());
					// oField.getAggregation("_field").fireChange({ valid: true });
					// assert.equal(oField.getAggregation("_field").getBinding("value").getValue(), oField.getAggregation("_field").getValue(), "Field: Date Field binding raw value '" + oField.getAggregation("_field").getValue() + "' ");
					oField.getAggregation("_field").fireChange({ valid: false });
					assert.equal(oField.getAggregation("_field").getBinding("value").getValue(), "", "Field: Date Field binding raw value '' ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 datetime parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1datetime", "type": "List", "configuration": { "parameters": { "datetimeParameter": {} } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(async function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "datetimeParameter", "Label: Has datetimeParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DateTimeField"), "Field: DateTime Field");
					assert.equal(oField.getAggregation("_field").getValue(), "", "Field: No Value");
					//force rendering
					await nextUIUpdate();
					//check the change event handling of the field
					oField.getAggregation("_field").setValue(UI5Date.getInstance());
					// oField.getAggregation("_field").fireChange({ valid: true });
					// assert.equal(oField.getAggregation("_field").getBinding("value").getValue(), oField.getAggregation("_field").getValue().toISOString(), "Field: DateTime Field binding raw value '" + oField.getAggregation("_field").getDateValue().toISOString() + "' ");
					oField.getAggregation("_field").fireChange({ valid: false });
					assert.equal(oField.getAggregation("_field").getBinding("value").getValue(), "", "Field: DateTime Field binding raw value '' ");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 boolean parameter and label with no value (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1boolean", "type": "List", "configuration": { "parameters": { "booleanParameter": {} } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "booleanParameter", "Label: Has booleanParameter label from parameter name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.BooleanField"), "Field: Boolean Field");
					assert.ok(oField.getAggregation("_field").getSelected() === false, "Field: No value");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("1 destination (as json)", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ host: "host", manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in admin mode", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setSection("sap.card1");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} }, "destinations": { "dest1": { "name": "Sample" } } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					var oPanel = this.oEditor.getAggregation("_formContent")[3].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[4];
					var oField1 = this.oEditor.getAggregation("_formContent")[5];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.ok(oLabel1.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel1.getText(), "dest1", "Label: Has dest1 label from destination settings name");
					assert.ok(oField1.isA("sap.ui.integration.editor.fields.DestinationField"), "Field: Destination Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in content mode", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setMode("content");
			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1stringlabel", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StaticLabel", "Label: Has static label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Start the editor in translation mode", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setMode("translation");

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({ baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } }
			} });
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
                    assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains a Panel");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans in i18n en", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible string parameters", function (assert) {
			this.oEditor.setSection("sap.card1");
			this.oEditor.setMode("translation");

			//TODO: check the log for the warning
			this.oEditor.setLanguage("badlanguage");

			this.oEditor.setLanguage("fr");

			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				manifest: {
					"_version": "2.0.0",

					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},

					"sap.card1": {
						"designtime": "designtime/stringsTransWithNotEditableOrNotVisible",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringNotEditableParameter": {
									"value": ""
								},
								"stringNotVisibleParameter": {
									"value": ""
								}
							}
						}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
                    assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains a Panel");

					var oLabel = this.oEditor.getAggregation("_formContent")[2];
					var oField = this.oEditor.getAggregation("_formContent")[3];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringNotEditableParameter", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");

					oField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").getEditable(), "Field: String Field editable");

					assert.equal(this.oEditor.getAggregation("_formContent").length, 5, "Field: stringNotVisibleParameter Field not exist");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check Description", function (assert) {
			this.oEditor.setSection("sap.card1");
			var oJson = { baseUrl: sBaseUrl, manifest: {
				"_version": "2.0.0",
				"sap.app": { "id": "test.sample", "i18n": "../i18n/i18n.properties" },
				"sap.card1": { "designtime": "designtime/1stringtrans", "type": "List", "configuration": { "parameters": { "stringParameter": {} } } }
			} };
			this.oEditor.setJson(oJson);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans in i18n en", "Label: Has translated label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					oField._descriptionIcon.onmouseover();
					var oDescriptionText = this.oEditor._getPopover().getContent()[0];
					assert.ok(oDescriptionText.isA("sap.m.Text"), "Text: Text Field");
					assert.equal(oDescriptionText.getText(), "Description", "Text: Description OK");
					oField._descriptionIcon.onmouseout();
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
