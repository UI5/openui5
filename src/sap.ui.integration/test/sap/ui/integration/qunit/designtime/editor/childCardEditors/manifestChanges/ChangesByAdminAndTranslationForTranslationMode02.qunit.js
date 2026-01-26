/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/test/utils/nextUIUpdate",
	"./../../ContextHost",
	"qunit/designtime/EditorQunitUtils"
], function(
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
	var _aCardEditorLanguages = [
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

	var _oAdminChanges = {
		"/sap.card/configuration/parameters/maxItems/value": 1,
		"/sap.card/configuration/parameters/Customer/value": "b",
		"/sap.card/configuration/childCards/child1/_manifestChanges": {
			"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
				"/sap.card/configuration/parameters/Customer/value": "c",
				"/sap.card/configuration/parameters/Employee/value": "4",
				"/sap.card/configuration/parameters/maxItems/value": 4,
				":errors": false,
				":layer": 0
			},
			"/sap.card/configuration/childCards/child1-2/_manifestChanges": {
				"texts": {
					"fr": {
						"/sap.card/configuration/parameters/cardTitle/value": "cardTitle FR Admin - child1-2"
					},
					"ru": {
						"/sap.card/configuration/parameters/cardTitle/value": "cardTitle RU Admin - child1-2"
					}
				},
				":errors": false,
				":layer": 0
			},
			"texts": {
				"en": {
					"/sap.card/configuration/parameters/cardTitle/value": "cardTitle EN Admin - child1"
				},
				"zh-CN": {
					"/sap.card/configuration/parameters/cardTitle/value": "cardTitle 简体 Admin - child1"
				}
			},
			":errors": false,
			":layer": 0
		},
		"/sap.card/configuration/childCards/child2/_manifestChanges": {
			"/sap.card/configuration/parameters/maxItems/value": 3,
			":errors": false,
			":layer": 0
		},
		":layer": 0,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle EN Admin - main"
			},
			"fr": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle FR Admin - main"
			},
			"ru": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle RU Admin - main"
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle 简体 Admin - main"
			}
		}
	};

	var _oTranslationChanges = {
		"/sap.card/configuration/childCards/child1/_manifestChanges": {
			"/sap.card/configuration/childCards/child1-2/_manifestChanges": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - child1-2",
				":errors": false,
				":layer": 10
			},
			"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - child1",
			":errors": false,
			":layer": 10
		},
		"/sap.card/configuration/childCards/child2/_manifestChanges": {
			"/sap.card/configuration/childCards/child2-1/_manifestChanges": {
				"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - child2-1",
				":errors": false,
				":layer": 10
			},
			":errors": false,
			":layer": 10
		},
		"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - main",
		":layer": 10,
		":errors": false
	};
	var _oExpectedCardTitleValues = {
		"main": {
			"default": "cardTitle Translation - main",
			"defaultOri_in_trans": "Trans Card Title in i18n en",
			"da": "Trans Card Title in i18n da",
			"de-CH": "Trans Card Title in i18n de-CH",
			"en": "cardTitle EN Admin - main",
			"fr": "cardTitle FR Admin - main",
			"fr-CA": "Trans Card Title in i18n fr",
			"fr-FR": "Trans Card Title in i18n fr",
			"pl": "Trans Card Title in i18n pl",
			"ru": "cardTitle RU Admin - main",
			"zh-CN": "cardTitle 简体 Admin - main"
		},
		"child1": {
			"default": "cardTitle Translation - child1",
			"defaultOri_in_trans": "Trans Card Title in i18n en",
			"da": "Trans Card Title in i18n da",
			"de-CH": "Trans Card Title in i18n de-CH",
			"en": "cardTitle EN Admin - child1",
			"fr": "Trans Card Title in i18n fr",
			"fr-CA": "Trans Card Title in i18n fr",
			"fr-FR": "Trans Card Title in i18n fr",
			"pl": "Trans Card Title in i18n pl",
			"zh-CN": "cardTitle 简体 Admin - child1"
		},
		"child1-1": {
			"default": "Trans Card Title in i18n en",
			"defaultOri_in_trans": "Trans Card Title in i18n en",
			"da": "Trans Card Title in i18n da",
			"de-CH": "Trans Card Title in i18n de-CH",
			"fr": "Trans Card Title in i18n fr",
			"fr-CA": "Trans Card Title in i18n fr",
			"fr-FR": "Trans Card Title in i18n fr",
			"pl": "Trans Card Title in i18n pl"
		},
		"child1-2": {
			"default": "cardTitle Translation - child1-2",
			"defaultOri_in_trans": "Trans Card Title in i18n en",
			"da": "Trans Card Title in i18n da",
			"de-CH": "Trans Card Title in i18n de-CH",
			"fr": "cardTitle FR Admin - child1-2",
			"fr-CA": "Trans Card Title in i18n fr",
			"fr-FR": "Trans Card Title in i18n fr",
			"pl": "Trans Card Title in i18n pl",
			"ru": "cardTitle RU Admin - child1-2"
		},
		"child2": {
			"default": "Trans Card Title in i18n en",
			"defaultOri_in_trans": "Trans Card Title in i18n en",
			"da": "Trans Card Title in i18n da",
			"de-CH": "Trans Card Title in i18n de-CH",
			"fr": "Trans Card Title in i18n fr",
			"fr-CA": "Trans Card Title in i18n fr",
			"fr-FR": "Trans Card Title in i18n fr",
			"pl": "Trans Card Title in i18n pl"
		},
		"child2-1": {
			"default": "cardTitle Translation - child2-1",
			"defaultOri_in_trans": "Child Card Title Child2-1"
		}
	};


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
			_aCardEditorLanguages.forEach(function(oCardEditorLanguage) {
				var sEditorLanguageKey = oCardEditorLanguage.key;
				var sCaseTitle = "Core: " + sCoreLanguageKey + ", Editor: " + sEditorLanguageKey + ", main -> child1 -> child1-1 -> child1-2";
				QUnit.test(sCaseTitle, function (assert) {
					var that = this;
					that.oCardEditor = EditorQunitUtils.createEditor(sCoreLanguageKey, undefined, "CardEditor");
					that.oCardEditor.setMode("translation");
					that.oCardEditor.setLanguage(sEditorLanguageKey);
					that.oCardEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: sBaseUrl + "manifest.json",
						manifestChanges: [_oAdminChanges, _oTranslationChanges]
					});

					return new Promise(function (resolve, reject) {
						EditorQunitUtils.isFieldReady(that.oCardEditor).then(function () {
							assert.ok(that.oCardEditor.isFieldReady(), "Card Editor fields are ready");
							var aFormContents = that.oCardEditor.getAggregation("_formContent");
							assert.equal(aFormContents.length, 5, "Card Editor: form content length is OK");
							EditorQunitUtils.isReady(that.oCardEditor).then(function () {
								assert.ok(that.oCardEditor.isReady(), "Card Editor is ready");

								var oSettings = that.oCardEditor.getCurrentSettings();
								assert.deepEqual(oSettings, {
									"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - main",
									":errors": false,
									":layer": 10
								}, "Card Editor settings are OK");

								var oTitleLabel = aFormContents[2];
								var oTitleFieldOri = aFormContents[3];
								var oTitleField = aFormContents[4];
								var oTitleFieldControl = oTitleField.getAggregation("_field");
								var sTitleOriValue = sEditorLanguageKey === sCoreLanguageKey ? _oExpectedCardTitleValues["main"]["default"] : _oExpectedCardTitleValues["main"][sCoreLanguageKey] || _oExpectedCardTitleValues["main"]["defaultOri_in_trans"];
								var sTitleTransValue = _oExpectedCardTitleValues["main"]["default"];
								assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
								assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
								assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
								assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
								assert.equal(oTitleFieldOri.getAggregation("_field").getText(), sTitleOriValue, "Title Field Ori: String Value");
								assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
								assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
								assert.equal(oTitleFieldControl.getValue(), sTitleTransValue, "Title Field: String Value");

								// simulate to click child1
								assert.equal(that.oCardEditor._oChildTree.getItems().length, 3, "Child tree initial length is OK");
								var oItem1 = that.oCardEditor._oChildTree.getItems()[1];
								that.oCardEditor._oChildTree.onItemPress(oItem1, oItem1);
								EditorQunitUtils.isFieldReady(that.oCardEditor).then(function () {
									assert.ok(that.oCardEditor.isFieldReady(), "Card Editor fields are ready again");
									aFormContents = that.oCardEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Card Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oCardEditor).then(function () {
										assert.ok(that.oCardEditor.isReady(), "Card Editor is ready again");

										oTitleLabel = aFormContents[2];
										oTitleFieldOri = aFormContents[3];
										oTitleField = aFormContents[4];
										sTitleOriValue = sEditorLanguageKey === sCoreLanguageKey ? _oExpectedCardTitleValues["child1"]["default"] : _oExpectedCardTitleValues["child1"][sCoreLanguageKey] || _oExpectedCardTitleValues["child1"]["defaultOri_in_trans"];
										sTitleTransValue = _oExpectedCardTitleValues["child1"]["default"];
										oTitleFieldControl = oTitleField.getAggregation("_field");
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
										assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
										assert.equal(oTitleFieldOri.getAggregation("_field").getText(), sTitleOriValue, "Title Field Ori: String Value");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
										assert.equal(oTitleFieldControl.getValue(), sTitleTransValue, "Title Field: String Value");

										oSettings = that.oCardEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - child1",
												":errors": false,
												":layer": 10
											},
											"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - main",
											":errors": false,
											":layer": 10
										}, "Card Editor settings are OK");

										// simulate to click child1-1
										assert.equal(that.oCardEditor._oChildTree.getItems().length, 5, "Child tree length is OK after expand child1");
										var oNewItem2 = that.oCardEditor._oChildTree.getItems()[2];
										that.oCardEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
										EditorQunitUtils.isFieldReady(that.oCardEditor).then(function () {
											assert.ok(that.oCardEditor.isFieldReady(), "Card Editor fields are ready again too");
											aFormContents = that.oCardEditor.getAggregation("_formContent");
											assert.equal(aFormContents.length, 5, "Card Editor: form content length is OK");

											EditorQunitUtils.isReady(that.oCardEditor).then(function () {
												assert.ok(that.oCardEditor.isReady(), "Card Editor is ready again too");

												oTitleLabel = aFormContents[2];
												oTitleFieldOri = aFormContents[3];
												oTitleField = aFormContents[4];
												sTitleOriValue = _oExpectedCardTitleValues["child1-1"][sCoreLanguageKey] || _oExpectedCardTitleValues["child1-1"]["defaultOri_in_trans"];
												sTitleTransValue = _oExpectedCardTitleValues["child1-1"][sEditorLanguageKey] || _oExpectedCardTitleValues["child1-1"]["default"];
												oTitleFieldControl = oTitleField.getAggregation("_field");
												assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
												assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
												assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
												assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
												assert.equal(oTitleFieldOri.getAggregation("_field").getText(), sTitleOriValue, "Title Field Ori: String Value");
												assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
												assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
												assert.equal(oTitleFieldControl.getValue(), sTitleTransValue, "Title Field: String Value");

												oSettings = that.oCardEditor.getCurrentSettings();
												assert.deepEqual(oSettings, {
													"/sap.card/configuration/childCards/child1/_manifestChanges": {
														"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
															":errors": false,
															":layer": 10
														},
														"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - child1",
														":errors": false,
														":layer": 10
													},
													"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - main",
													":errors": false,
													":layer": 10
												}, "Card Editor settings are OK");

												// simulate to click child1-2
												var oNewItem3 = that.oCardEditor._oChildTree.getItems()[3];
												that.oCardEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
												EditorQunitUtils.isFieldReady(that.oCardEditor).then(function () {
													assert.ok(that.oCardEditor.isFieldReady(), "Card Editor fields are ready again too");
													aFormContents = that.oCardEditor.getAggregation("_formContent");
													assert.equal(aFormContents.length, 5, "Card Editor: form content length is OK");

													EditorQunitUtils.isReady(that.oCardEditor).then(function () {
														assert.ok(that.oCardEditor.isReady(), "Card Editor is ready again too");

														oTitleLabel = aFormContents[2];
														oTitleFieldOri = aFormContents[3];
														oTitleField = aFormContents[4];
														sTitleOriValue = sEditorLanguageKey === sCoreLanguageKey ? _oExpectedCardTitleValues["child1-2"]["default"] : _oExpectedCardTitleValues["child1-2"][sCoreLanguageKey] || _oExpectedCardTitleValues["child1-2"]["defaultOri_in_trans"];
														sTitleTransValue = _oExpectedCardTitleValues["child1-2"]["default"];
														oTitleFieldControl = oTitleField.getAggregation("_field");
														assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
														assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
														assert.ok(oTitleFieldOri.isA("sap.ui.integration.editor.fields.StringField"), "Title Field Ori: String Field");
														assert.ok(oTitleFieldOri.getAggregation("_field").isA("sap.m.Text"), "Title Field Ori: Control is an Text");
														assert.equal(oTitleFieldOri.getAggregation("_field").getText(), sTitleOriValue, "Title Field Ori: String Value");
														assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
														assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
														assert.equal(oTitleFieldControl.getValue(), sTitleTransValue, "Title Field: String Value");

														oSettings = that.oCardEditor.getCurrentSettings();
														assert.deepEqual(oSettings, {
															"/sap.card/configuration/childCards/child1/_manifestChanges": {
																"/sap.card/configuration/childCards/child1-1/_manifestChanges": {
																	":errors": false,
																	":layer": 10
																},
																"/sap.card/configuration/childCards/child1-2/_manifestChanges": {
																	"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - child1-2",
																	":errors": false,
																	":layer": 10
																},
																"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - child1",
																":errors": false,
																":layer": 10
															},
															"/sap.card/configuration/parameters/cardTitle/value": "cardTitle Translation - main",
															":errors": false,
															":layer": 10
														}, "Card Editor settings are OK");

														EditorQunitUtils.destroyEditor(that.oCardEditor);
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
	});
});
