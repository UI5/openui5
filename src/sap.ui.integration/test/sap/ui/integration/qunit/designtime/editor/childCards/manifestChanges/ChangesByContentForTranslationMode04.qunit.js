/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/test/utils/nextUIUpdate",
	"./../../ContextHost",
	"qunit/designtime/EditorQunitUtils"
], function(
	Localization,
	x,
	Editor,
	CardEditor,
	Designtime,
	Host,
	nextUIUpdate,
	ContextHost,
	EditorQunitUtils
) {
	"use strict";

	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/childEditors/";

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	var _aCoreLanguages = [
		{
			"key": "fr",
			"description": "Français"
		},
		{
			"key": "fr-CA",
			"description": "Français (Canada)"
		},
		{
			"key": "zh-CN",
			"description": "简体中文"
		}
	];
	var _aEditorLanguages = [
		{
			"key": "en",
			"description": "English"
		},
		{
			"key": "en-GB",
			"description": "English UK"
		},
		{
			"key": "de",
			"description": "Deutsch"
		},
		{
			"key": "de-CH",
			"description": "Deutsch (Schweiz)"
		},
		{
			"key": "fr",
			"description": "Français"
		},
		{
			"key": "fr-CA",
			"description": "Français (Canada)"
		},
		{
			"key": "zh-CN",
			"description": "简体中文"
		},
		{
			"key": "zh-TW",
			"description": "繁體中文"
		}
	];

	var _oContentChanges = {
		"/sap.card/configuration/parameters/maxItems/value": 1,
		"/sap.card/configuration/parameters/Customer/value": "b",
		"/sap.card/configuration/childCards/child1/_manifestChanges": {
			"/sap.card/configuration/parameters/maxItems/value": 3,
			"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
				"/sap.card/configuration/parameters/Customer/value": "a",
				"/sap.card/configuration/parameters/Employee/value": "3",
				"texts": {
					"fr": {
						"/sap.card/configuration/parameters/cardTitle/value": "cardTitle FR Content - child1-1"
					},
					"ru": {
						"/sap.card/configuration/parameters/cardTitle/value": "cardTitle RU Content - child1-1"
					}
				},
				":errors": false,
				":layer": 5
			},
			":errors": false,
			":layer": 5
		},
		"/sap.card/configuration/childCards/child2/_manifestChanges": {
			"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
				"/sap.card/configuration/parameters/string/value": "StringValue Content Child2-1",
				"texts": {
					"fr": {
						"/sap.card/configuration/parameters/cardTitle/value": "cardTitle FR Content - child2-1"
					},
					"zh-TW": {
						"/sap.card/configuration/parameters/cardTitle/value": "cardTitle 繁體 Content - child2-1"
					}
				},
				":errors": false,
				":layer": 5
			},
			"texts": {
				"en": {
					"/sap.card/configuration/parameters/cardTitle/value": "cardTitle EN Content - child2"
				},
				"zh-CN": {
					"/sap.card/configuration/parameters/cardTitle/value": "cardTitle 简体 Content - child2"
				}
			},
			":errors": false,
			":layer": 5
		},
		":layer": 5,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle EN Content - main"
			},
			"ru": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle RU Content - main"
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle 繁體 Content - main"
			}
		}
	};
	var _oExpectedCardTitleValues = {
		"main": {
			"default_in_en": "Trans Card Title en",
			"en": "cardTitle EN Content - main",
			"de-CH": "Trans Card Title de-CH",
			"ru": "cardTitle RU Content - main",
			"zh-TW": "cardTitle 繁體 Content - main"
		},
		"child1": {
			"default_in_en": "Trans Card Title en",
			"de-CH": "Trans Card Title de-CH"
		},
		"child1-1": {
			"default_in_en": "Trans Card Title en",
			"de-CH": "Trans Card Title de-CH",
			"fr": "cardTitle FR Content - child1-1",
			"ru": "cardTitle RU Content - child1-1"
		},
		"child1-2": {
			"default_in_en": "Trans Card Title en",
			"de-CH": "Trans Card Title de-CH"
		},
		"child2": {
			"default_in_en": "Trans Card Title en",
			"en": "cardTitle EN Content - child2",
			"de-CH": "Trans Card Title de-CH",
			"zh-CN": "cardTitle 简体 Content - child2"
		},
		"child2-1": {
			"default_in_en": "Child Card Title Child2-1",
			"fr": "cardTitle FR Content - child2-1",
			"zh-TW": "cardTitle 繁體 Content - child2-1"
		}
	};

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
	}

	QUnit.module("translation mode", {
		before: function () {
			EditorQunitUtils.createMockServer();
		},
		after: function () {
			EditorQunitUtils.destroyMockServer();
		},
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		_aCoreLanguages.forEach(function(oCoreLanguage) {
			var sCoreLanguageKey = oCoreLanguage.key;
			_aEditorLanguages.forEach(function(oEditorLanguage) {
				var sEditorLanguageKey = oEditorLanguage.key;
				var sCaseTitle = "Core: " + sCoreLanguageKey + ", Editor: " + sEditorLanguageKey + ", main -> child2 -> child2-1";
				QUnit.test(sCaseTitle, function (assert) {
					var that = this;
					that.oEditor = EditorQunitUtils.createEditor(sCoreLanguageKey, undefined,"CardEditor");
					that.oEditor.setMode("translation");
					that.oEditor.setLanguage(sEditorLanguageKey);
					that.oEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: sBaseUrl + "manifest.json",
						manifestChanges: [_oContentChanges]
					});
					return new Promise(function (resolve, reject) {
						EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
							var aFormContents = that.oEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Editor: form content length is OK");
							EditorQunitUtils.isReady(that.oEditor).then(function () {
								assert.ok(that.oEditor.isReady(), "Editor is ready");

								var oSettings = that.oEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									":errors": false,
									":layer": 10
								}, "Editor settings are OK");

								var oTitleLabel = aFormContents[2];
								var oTitleFieldOri = aFormContents[3];
								var oTitleField = aFormContents[4];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								var sExpectedText = _oExpectedCardTitleValues["main"][sCoreLanguageKey] || _oExpectedCardTitleValues["main"]["default_in_en"];
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), sExpectedText, "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								var sExpectedValue = _oExpectedCardTitleValues["main"][sEditorLanguageKey] || _oExpectedCardTitleValues["main"]["default_in_en"];
								assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

								// simulate to click child2
								assert.equal(that.oEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
								var oItem2 = that.oEditor._oChildTree.getItems()[2];
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
										oTitleFieldControl = oTitleField.getAggregation("_field");
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
										assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
										sExpectedText = _oExpectedCardTitleValues["child2"][sCoreLanguageKey] || _oExpectedCardTitleValues["child2"]["default_in_en"];
										assert.equal(oTitleFieldOri.getAggregation("_field").getText(), sExpectedText, "Title Field Ori: String Value");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
										sExpectedValue = _oExpectedCardTitleValues["child2"][sEditorLanguageKey] || _oExpectedCardTitleValues["child2"]["default_in_en"];
										assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child2/_manifestChanges": {
												":errors": false,
												":layer": 10
											},
											":errors": false,
											":layer": 10
										}, "Editor settings are OK");

										// simulate to click child2-1
										assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after clicking child2");
										var oNewItem3 = that.oEditor._oChildTree.getItems()[3];
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
												var sExpectedText = _oExpectedCardTitleValues["child2-1"][sCoreLanguageKey] || _oExpectedCardTitleValues["child2-1"]["default_in_en"];
												assert.equal(oTitleFieldOri.getAggregation("_field").getText(), sExpectedText, "Title Field Ori: String Value");
												assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
												assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
												var sExpectedValue = _oExpectedCardTitleValues["child2-1"][sEditorLanguageKey] || _oExpectedCardTitleValues["child2-1"]["default_in_en"];
												assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

												oSettings = that.oEditor.getCurrentSettings();
												assert.deepEqual(oSettings, {
													"/sap.card/configuration/childCards/child2/_manifestChanges": {
														"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
															":errors": false,
															":layer": 10
														},
														":errors": false,
														":layer": 10
													},
													":errors": false,
													":layer": 10
												}, "Editor settings are OK");

												destroyEditor(that.oEditor);
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
	});
});
