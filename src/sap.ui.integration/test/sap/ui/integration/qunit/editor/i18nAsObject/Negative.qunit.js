/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"../ContextHost",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"qunit/designtime/EditorQunitUtils"
], function (
	merge,
	x,
	Editor,
	CardEditor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	QUnitUtils,
	KeyCodes,
	ResourceBundle,
	EditorQunitUtils
) {
	"use strict";
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
			EditorQunitUtils.afterEachTest(this.oEditor);
		}
	}, function () {
		QUnit.test("Check translation for value, label, description in admin mode 1", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"es",
							"es_MX",
							"fr",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};

			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1: String 1 in i18n en");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 in i18n en", "Label2: Desc 1 in i18n en");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2: String 2 in i18n en");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 in i18n en", "Label2: Desc 2 in i18n en");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 in i18n en", "Field2: String 3 in i18n en");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 in i18n en", "Label3: Desc 3 in i18n en");
						EditorQunitUtils.afterEachTest(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which file exists but not included into i18n supportedLocales");
				return new Promise(function (resolve, reject) {
					this.oEditor = EditorQunitUtils.createEditor("en-US");
					this.oEditor.setMode("admin");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1: String 1 in i18n en");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 in i18n en", "Label2: Desc 1 in i18n en");
						}.bind(this)).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2: String 2 in i18n en");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 in i18n en", "Label2: Desc 2 in i18n en");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 in i18n en", "Field2: String 3 in i18n en");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 in i18n en", "Label3: Desc 3 in i18n en");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for value, label, description in admin mode 2", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"es",
							"es_MX",
							"fr"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};

			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1: String 1 in i18n en");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 in i18n en", "Label2: Desc 1 in i18n en");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2: String 2 in i18n en");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 in i18n en", "Label2: Desc 2 in i18n en");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 in i18n en", "Field2: String 3 in i18n en");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 in i18n en", "Label3: Desc 3 in i18n en");
						EditorQunitUtils.afterEachTest(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to fr_CA, which file exists but not included into i18n supportedLocales");
				return new Promise(function (resolve, reject) {
					this.oEditor = EditorQunitUtils.createEditor("fr_CA");
					this.oEditor.setMode("admin");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.equal(oLabel1.getText(), "Label 1 in i18n fr", "Label1: Label 1 in i18n fr");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 in i18n fr", "Field1: String 1 in i18n fr");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 in i18n fr", "Label2: Desc 1 in i18n fr");
						}.bind(this)).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 in i18n fr", "Label2: Label 2 in i18n fr");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 in i18n fr", "Field2: String 2 in i18n fr");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 in i18n fr", "Label2: Desc 2 in i18n fr");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 in i18n fr", "Label3: Label 3 in i18n fr");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 in i18n fr", "Field2: String 3 in i18n fr");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 in i18n fr", "Label3: Desc 3 in i18n fr");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for value, label, description in content mode 1", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"es",
							"es_MX",
							"fr",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("content");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1: String 1 in i18n en");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 in i18n en", "Label2: Desc 1 in i18n en");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2: String 2 in i18n en");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 in i18n en", "Label2: Desc 2 in i18n en");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 in i18n en", "Field2: String 3 in i18n en");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 in i18n en", "Label3: Desc 3 in i18n en");
						EditorQunitUtils.afterEachTest(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which file exists but not included into i18n supportedLocales");
				return new Promise(function (resolve, reject) {
					this.oEditor = EditorQunitUtils.createEditor("en-US");
					this.oEditor.setMode("content");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1: String 1 in i18n en");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 in i18n en", "Label2: Desc 1 in i18n en");
						}.bind(this)).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2: String 2 in i18n en");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 in i18n en", "Label2: Desc 2 in i18n en");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 in i18n en", "Field2: String 3 in i18n en");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 in i18n en", "Label3: Desc 3 in i18n en");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for value, label, description in content mode 2", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"es",
							"es_MX",
							"fr"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("content");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1: String 1 in i18n en");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 in i18n en", "Label2: Desc 1 in i18n en");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2: String 2 in i18n en");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 in i18n en", "Label2: Desc 2 in i18n en");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 in i18n en", "Field2: String 3 in i18n en");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 in i18n en", "Label3: Desc 3 in i18n en");
						EditorQunitUtils.afterEachTest(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to fr_CA, which file exists but not included into i18n supportedLocales");
				return new Promise(function (resolve, reject) {
					this.oEditor = EditorQunitUtils.createEditor("fr_CA");
					this.oEditor.setMode("content");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.equal(oLabel1.getText(), "Label 1 in i18n fr", "Label1: Label 1 in i18n fr");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 in i18n fr", "Field1: String 1 in i18n fr");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 in i18n fr", "Label2: Desc 1 in i18n fr");
						}.bind(this)).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 in i18n fr", "Label2: Label 2 in i18n fr");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 in i18n fr", "Field2: String 2 in i18n fr");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 in i18n fr", "Label2: Desc 2 in i18n fr");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 in i18n fr", "Label3: Label 3 in i18n fr");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 in i18n fr", "Field2: String 3 in i18n fr");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 in i18n fr", "Label3: Desc 3 in i18n fr");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from en (as original) to fr(file existing, not included in supportedLocales)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor();
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 in i18n en", "Field1Ori: String 1 in i18n en");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1Trans: String 1 in i18n en");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 in i18n en", "Field2Ori: String 2 in i18n en");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2Trans: String 2 in i18n en");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 in i18n en", "Field3Ori: String 3 in i18n en");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 in i18n en", "Field3Trans: String 3 in i18n en");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 in i18n en", "Label4: Label 4 in i18n en");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 in i18n en", "Field4Ori: String 4 in i18n en");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 in i18n en", "Field4Trans: String 4 in i18n en");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from en (as original) to fr-CA(file existing, not included in supportedLocales)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor();
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr-CA");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 in i18n en", "Field1Ori: String 1 in i18n en");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 in i18n fr", "Field1Trans: String 1 in i18n fr");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 in i18n en", "Field2Ori: String 2 in i18n en");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 in i18n fr", "Field2Trans: String 2 in i18n fr");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 in i18n en", "Field3Ori: String 3 in i18n en");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 in i18n fr", "Field3Trans: String 3 in i18n fr");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 in i18n en", "Label4: Label 4 in i18n en");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 in i18n en", "Field4Ori: String 4 in i18n en");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 in i18n fr", "Field4Trans: String 4 in i18n fr");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from en (as original) to fr-CA(file existing, not included in supportedLocales, fr not included too)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor();
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr-CA");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 in i18n en", "Field1Ori: String 1 in i18n en");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1Trans: String 1 in i18n en");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 in i18n en", "Field2Ori: String 2 in i18n en");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2Trans: String 2 in i18n en");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 in i18n en", "Field3Ori: String 3 in i18n en");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 in i18n en", "Field3Trans: String 3 in i18n en");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 in i18n en", "Label4: Label 4 in i18n en");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 in i18n en", "Field4Ori: String 4 in i18n en");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 in i18n en", "Field4Trans: String 4 in i18n en");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from de-DE (not existing as original) to fr(file existing, not included in supportedLocales)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr_CA"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 in i18n en", "Field1Ori: String 1 in i18n en");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1Trans: String 1 in i18n en");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 in i18n en", "Field2Ori: String 2 in i18n en");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2Trans: String 2 in i18n en");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 in i18n en", "Field3Ori: String 3 in i18n en");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 in i18n en", "Field3Trans: String 3 in i18n en");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 in i18n en", "Label4: Label 4 in i18n en");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 in i18n en", "Field4Ori: String 4 in i18n en");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 in i18n en", "Field4Trans: String 4 in i18n en");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from de-DE (not existing as original) to fr-CA(file existing, not included in supportedLocales)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX",
							"fr"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr-CA");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 in i18n en", "Field1Ori: String 1 in i18n en");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 in i18n fr", "Field1Trans: String 1 in i18n fr");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 in i18n en", "Field2Ori: String 2 in i18n en");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 in i18n fr", "Field2Trans: String 2 in i18n fr");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 in i18n en", "Field3Ori: String 3 in i18n en");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 in i18n fr", "Field3Trans: String 3 in i18n fr");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 in i18n en", "Label4: Label 4 in i18n en");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 in i18n en", "Field4Ori: String 4 in i18n en");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 in i18n fr", "Field4Trans: String 4 in i18n fr");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from de-DE (not existing as original) to fr-CA(file existing, not included in supportedLocales, fr not included too)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": {
						"bundleUrl": "../i18ntrans/i18n.properties",
						"supportedLocales": [
							"",
							"en",
							"en_US",
							"es",
							"es_MX"
						],
						"fallbackLocale": "en"
					}
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr-CA");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field");
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1].getAggregation("_field");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 in i18n en", "Label1: Label 1 in i18n en");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 in i18n en", "Field1Ori: String 1 in i18n en");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 in i18n en", "Field1Trans: String 1 in i18n en");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 in i18n en", "Label2: Label 2 in i18n en");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 in i18n en", "Field2Ori: String 2 in i18n en");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 in i18n en", "Field2Trans: String 2 in i18n en");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 in i18n en", "Label3: Label 3 in i18n en");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 in i18n en", "Field3Ori: String 3 in i18n en");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 in i18n en", "Field3Trans: String 3 in i18n en");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 in i18n en", "Label4: Label 4 in i18n en");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 in i18n en", "Field4Ori: String 4 in i18n en");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 in i18n en", "Field4Trans: String 4 in i18n en");
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
