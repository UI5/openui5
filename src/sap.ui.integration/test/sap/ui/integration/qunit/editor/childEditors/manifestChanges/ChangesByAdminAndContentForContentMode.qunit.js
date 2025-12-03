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

	var _aCheckedLanguages = [
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
	var _oContentChanges = {
		"/sap.card/configuration/parameters/maxItems/value": 2,
		"/sap.card/configuration/parameters/Customer/value": "c",
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
			"fr": "cardTitle FR Admin - main",
			"ru": "cardTitle RU Content - main",
			"zh-CN": "cardTitle 简体 Admin - main",
			"zh-TW": "cardTitle 繁體 Content - main"
		},
		"child1": {
			"default_in_en": "Trans Card Title en",
			"en": "cardTitle EN Admin - child1",
			"de-CH": "Trans Card Title de-CH",
			"zh-CN": "cardTitle 简体 Admin - child1"
		},
		"child1-1": {
			"default_in_en": "Trans Card Title en",
			"de-CH": "Trans Card Title de-CH",
			"fr": "cardTitle FR Content - child1-1",
			"ru": "cardTitle RU Content - child1-1"
		},
		"child1-2": {
			"default_in_en": "Trans Card Title en",
			"de-CH": "Trans Card Title de-CH",
			"fr": "cardTitle FR Admin - child1-2",
			"ru": "cardTitle RU Admin - child1-2"
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

	QUnit.module("main -> child1 -> child1-1 -> child1-2", {
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
		_aCheckedLanguages.forEach(function(oLanguage) {
			var sLanguageKey = oLanguage.key;
			var sCaseTitle = "in " + sLanguageKey + " (" + oLanguage.description + ")";
			QUnit.test(sCaseTitle, function (assert) {
				var that = this;
				that.oEditor = EditorQunitUtils.createEditor(sLanguageKey);
				that.oEditor.setMode("content");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: sBaseUrl + "manifest.json",
					manifestChanges: [_oAdminChanges, _oContentChanges]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
						var aFormContents = that.oEditor.getAggregation("_formContent");
						assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
						EditorQunitUtils.isReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");

							var oMaxItemLabel = aFormContents[3];
							var oMaxItemField = aFormContents[4];
							assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
							assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
							assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
							assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
							assert.equal(oMaxItemField.getAggregation("_field").getValue(), 2, "MaxItem Field: Integer Value");

							var oCustomerLabel = aFormContents[5];
							var oCustomerField = aFormContents[6];
							assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
							assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
							assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
							var oCustomerFieldControl = oCustomerField.getAggregation("_field");
							assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
							assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
							assert.equal(oCustomerFieldControl.getSelectedKey(), "c", "Customer Field: Key Value");
							assert.equal(oCustomerFieldControl.getValue(), "C1 Company", "Customer Field: String Value");

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

							var oSettings = that.oEditor.getCurrentSettings();
							assert.deepEqual(oSettings, {
								"/sap.card/configuration/parameters/maxItems/value": 2,
								"/sap.card/configuration/parameters/Customer/value": "c",
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
								},
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
							var sExpectedValue = _oExpectedCardTitleValues["main"][sLanguageKey] || _oExpectedCardTitleValues["main"]["default_in_en"];
							assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

							var oValueHelpIconOfTitle = oTitleFieldControl._oValueHelpIcon;
							assert.ok(oValueHelpIconOfTitle.isA("sap.ui.core.Icon"), "Title field: Input value help icon");
							assert.equal(oValueHelpIconOfTitle.getSrc(), "sap-icon://translate", "Title field: Input value help icon src");
							oTitleField.attachEventOnce("translationPopoverOpened",async function () {
								var oTranslationPopover1 = oTitleField._oTranslationPopover;
								var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
								assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
								assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
								assert.equal(aHeaderItems1[2].getItems()[0].getText(), oLanguage.description, "oTranslationPopover1 Header: English");
								var sExpectedValueInPopoverTitle = _oExpectedCardTitleValues["main"][sLanguageKey] || _oExpectedCardTitleValues["main"]["default_in_en"];
								assert.equal(aHeaderItems1[2].getItems()[1].getValue(), sExpectedValueInPopoverTitle, "oTranslationPopover1 Header: Title Value");
								assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
								assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
								assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
									var sExpectedValueInPopoveItem = _oExpectedCardTitleValues["main"][sLanguage] || _oExpectedCardTitleValues["main"]["default_in_en"];
									var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValueInPopoveItem, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValueInPopoveItem);
								}
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
								oCancelButton1.firePress();

								await nextUIUpdate();

								// simulate to click child1
								that.oEditor._oChildTree.onItemPress(oItem1, oItem1);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 11, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again");

										oMaxItemLabel = aFormContents[3];
										oMaxItemField = aFormContents[4];
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemField.getAggregation("_field").getValue(), 3, "MaxItem Field: Integer Value");

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

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/parameters/maxItems/value": 2,
											"/sap.card/configuration/parameters/Customer/value": "c",
											"/sap.card/configuration/childCards/child1/_manifestChanges": {
												"/sap.card/configuration/parameters/Employee/value": "1",
												"/sap.card/configuration/parameters/maxItems/value": 3,
												":errors": false,
												":layer": 5
											},
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
											},
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");

										oTitleLabel = aFormContents[1];
										oTitleField = aFormContents[2];
										oTitleFieldControl = oTitleField.getAggregation("_field");
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
										sExpectedValue = _oExpectedCardTitleValues["child1"][sLanguageKey] || _oExpectedCardTitleValues["child1"]["default_in_en"];
										assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

										oValueHelpIconOfTitle = oTitleFieldControl._oValueHelpIcon;
										assert.ok(oValueHelpIconOfTitle.isA("sap.ui.core.Icon"), "Title field: Input value help icon");
										assert.equal(oValueHelpIconOfTitle.getSrc(), "sap-icon://translate", "Title field: Input value help icon src");
										oTitleField.attachEventOnce("translationPopoverOpened",async function () {
											oTranslationPopover1 = oTitleField._oTranslationPopover;
											aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
											assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
											assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
											assert.equal(aHeaderItems1[2].getItems()[0].getText(), oLanguage.description, "oTranslationPopover1 Header: English");
											sExpectedValueInPopoverTitle = _oExpectedCardTitleValues["child1"][sLanguageKey] || _oExpectedCardTitleValues["child1"]["default_in_en"];
											assert.equal(aHeaderItems1[2].getItems()[1].getValue(), sExpectedValueInPopoverTitle, "oTranslationPopover1 Header: Title Value");
											assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
											assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
											assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
											oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
											for (var i = 0; i < oLanguageItems1.length; i++) {
												var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
												var sExpectedValueInPopoveItem = _oExpectedCardTitleValues["child1"][sLanguage] || _oExpectedCardTitleValues["child1"]["default_in_en"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValueInPopoveItem, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValueInPopoveItem);
											}
											oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
											oCancelButton1.firePress();

											await nextUIUpdate();

											// simulate to click child1-1
											that.oEditor._oChildTree.onItemPress(oNewItem2, oNewItem2);
											EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
												assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
												aFormContents = that.oEditor.getAggregation("_formContent");
												assert.equal(aFormContents.length, 9, "Editor: form content length is OK");

												EditorQunitUtils.isReady(that.oEditor).then(function () {
													assert.ok(that.oEditor.isReady(), "Editor is ready again too");

													oMaxItemLabel = aFormContents[3];
													oMaxItemField = aFormContents[4];
													assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
													assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
													assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
													assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
													assert.equal(oMaxItemField.getAggregation("_field").getValue(), 4, "MaxItem Field: Integer Value");

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

													oEmployeeLabel = aFormContents[7];
													oEmployeeField = aFormContents[8];
													assert.ok(oEmployeeLabel.isA("sap.m.Label"), "Employee Label: Form content contains a Label");
													assert.equal(oEmployeeLabel.getText(), "Employee", "Employee Label: Has static label text");
													assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Employee Field: String Field");
													oEmployeeFieldControl = oEmployeeField.getAggregation("_field");
													assert.ok(oEmployeeFieldControl.isA("sap.m.ComboBox"), "Employee Field: Control is a ComboBox");
													assert.equal(oEmployeeFieldControl.getItems().length, 6, "Employee Field: items length is OK");
													assert.equal(oEmployeeFieldControl.getSelectedKey(), 3, "Employee Field: Key Value");
													assert.equal(oEmployeeFieldControl.getValue(), "FirstName3 LastName3", "Employee Field: String Value");

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

													oSettings = that.oEditor.getCurrentSettings();
													assert.deepEqual(oSettings, {
														"/sap.card/configuration/parameters/maxItems/value": 2,
														"/sap.card/configuration/parameters/Customer/value": "c",
														"/sap.card/configuration/childCards/child1/_manifestChanges": {
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
															"/sap.card/configuration/parameters/Employee/value": "1",
															"/sap.card/configuration/parameters/maxItems/value": 3,
															":errors": false,
															":layer": 5
														},
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
														},
														":errors": false,
														":layer": 5
													}, "Editor settings are OK");

													oTitleLabel = aFormContents[1];
													oTitleField = aFormContents[2];
													oTitleFieldControl = oTitleField.getAggregation("_field");
													assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
													assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
													assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
													assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
													sExpectedValue = _oExpectedCardTitleValues["child1-1"][sLanguageKey] || _oExpectedCardTitleValues["child1-1"]["default_in_en"];
													assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

													oValueHelpIconOfTitle = oTitleFieldControl._oValueHelpIcon;
													assert.ok(oValueHelpIconOfTitle.isA("sap.ui.core.Icon"), "Title field: Input value help icon");
													assert.equal(oValueHelpIconOfTitle.getSrc(), "sap-icon://translate", "Title field: Input value help icon src");
													oTitleField.attachEventOnce("translationPopoverOpened",async function () {
														oTranslationPopover1 = oTitleField._oTranslationPopover;
														aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
														assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
														assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
														assert.equal(aHeaderItems1[2].getItems()[0].getText(), oLanguage.description, "oTranslationPopover1 Header: English");
														sExpectedValueInPopoverTitle = _oExpectedCardTitleValues["child1-1"][sLanguageKey] || _oExpectedCardTitleValues["child1-1"]["default_in_en"];
														assert.equal(aHeaderItems1[2].getItems()[1].getValue(), sExpectedValueInPopoverTitle, "oTranslationPopover1 Header: Title Value");
														assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
														assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
														assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
														oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
														assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
														for (var i = 0; i < oLanguageItems1.length; i++) {
															var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
															var sExpectedValueInPopoveItem = _oExpectedCardTitleValues["child1-1"][sLanguage] || _oExpectedCardTitleValues["child1-1"]["default_in_en"];
															var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
															assert.equal(sCurrentValue, sExpectedValueInPopoveItem, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValueInPopoveItem);
														}
														oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
														oCancelButton1.firePress();

														await nextUIUpdate();

														// simulate to click child1-2
														that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
														EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
															assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
															aFormContents = that.oEditor.getAggregation("_formContent");
															assert.equal(aFormContents.length, 7, "Editor: form content length is OK");

															EditorQunitUtils.isReady(that.oEditor).then(function () {
																assert.ok(that.oEditor.isReady(), "Editor is ready again too");

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

																oSettings = that.oEditor.getCurrentSettings();
																assert.deepEqual(oSettings, {
																	"/sap.card/configuration/parameters/maxItems/value": 2,
																	"/sap.card/configuration/parameters/Customer/value": "c",
																	"/sap.card/configuration/childCards/child1/_manifestChanges": {
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
																		"/sap.card/configuration/childCards/child1-2/_manifestChanges": {
																			"/sap.card/configuration/parameters/Order/value": "1",
																			"/sap.card/configuration/parameters/maxItems/value": 5,
																			":errors": false,
																			":layer": 5
																		},
																		"/sap.card/configuration/parameters/Employee/value": "1",
																		"/sap.card/configuration/parameters/maxItems/value": 3,
																		":errors": false,
																		":layer": 5
																	},
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
																	},
																	":errors": false,
																	":layer": 5
																}, "Editor settings are OK");

																oTitleLabel = aFormContents[1];
																oTitleField = aFormContents[2];
																oTitleFieldControl = oTitleField.getAggregation("_field");
																assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
																assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
																assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
																assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
																sExpectedValue = _oExpectedCardTitleValues["child1-2"][sLanguageKey] || _oExpectedCardTitleValues["child1-2"]["default_in_en"];
																assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

																oValueHelpIconOfTitle = oTitleFieldControl._oValueHelpIcon;
																assert.ok(oValueHelpIconOfTitle.isA("sap.ui.core.Icon"), "Title field: Input value help icon");
																assert.equal(oValueHelpIconOfTitle.getSrc(), "sap-icon://translate", "Title field: Input value help icon src");
																oTitleField.attachEventOnce("translationPopoverOpened",async function () {
																	oTranslationPopover1 = oTitleField._oTranslationPopover;
																	aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
																	assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
																	assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
																	assert.equal(aHeaderItems1[2].getItems()[0].getText(), oLanguage.description, "oTranslationPopover1 Header: English");
																	sExpectedValueInPopoverTitle = _oExpectedCardTitleValues["child1-2"][sLanguageKey] || _oExpectedCardTitleValues["child1-2"]["default_in_en"];
																	assert.equal(aHeaderItems1[2].getItems()[1].getValue(), sExpectedValueInPopoverTitle, "oTranslationPopover1 Header: Title Value");
																	assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
																	assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
																	assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
																	oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
																	assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
																	for (var i = 0; i < oLanguageItems1.length; i++) {
																		var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
																		var sExpectedValueInPopoveItem = _oExpectedCardTitleValues["child1-2"][sLanguage] || _oExpectedCardTitleValues["child1-2"]["default_in_en"];
																		var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
																		assert.equal(sCurrentValue, sExpectedValueInPopoveItem, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValueInPopoveItem);
																	}
																	oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
																	oCancelButton1.firePress();

																	await nextUIUpdate();
																	destroyEditor(that.oEditor);
																	resolve();
																});
																oValueHelpIconOfTitle.firePress();
																oValueHelpIconOfTitle.focus();
															});
														});
													});
													oValueHelpIconOfTitle.firePress();
													oValueHelpIconOfTitle.focus();
												});
											});
										});
										oValueHelpIconOfTitle.firePress();
										oValueHelpIconOfTitle.focus();
									});
								});
							});
							oValueHelpIconOfTitle.firePress();
							oValueHelpIconOfTitle.focus();
						});
					});
				});
			});
		});
	});

	QUnit.module("main -> child2 -> child2-1", {
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
		_aCheckedLanguages.forEach(function(oLanguage) {
			var sLanguageKey = oLanguage.key;
			var sCaseTitle = "in " + sLanguageKey + " (" + oLanguage.description + ")";
			QUnit.test(sCaseTitle, function (assert) {
				var that = this;
				that.oEditor = EditorQunitUtils.createEditor(sLanguageKey);
				that.oEditor.setMode("content");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: sBaseUrl + "manifest.json",
					manifestChanges: [_oAdminChanges, _oContentChanges]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
						var aFormContents = that.oEditor.getAggregation("_formContent");
						assert.equal(aFormContents.length, 11, "Editor: form content length is OK");
						EditorQunitUtils.isReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");

							var oMaxItemLabel = aFormContents[3];
							var oMaxItemField = aFormContents[4];
							assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
							assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
							assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
							assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
							assert.equal(oMaxItemField.getAggregation("_field").getValue(), 2, "MaxItem Field: Integer Value");

							var oCustomerLabel = aFormContents[5];
							var oCustomerField = aFormContents[6];
							assert.ok(oCustomerLabel.isA("sap.m.Label"), "Customer Label: Form content contains a Label");
							assert.equal(oCustomerLabel.getText(), "Customer", "Customer Label: Has static label text");
							assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Customer Field: String Field");
							var oCustomerFieldControl = oCustomerField.getAggregation("_field");
							assert.ok(oCustomerFieldControl.isA("sap.m.ComboBox"), "Customer Field: Control is a ComboBox");
							assert.equal(oCustomerFieldControl.getItems().length, 4, "Customer Field: items length is OK");
							assert.equal(oCustomerFieldControl.getSelectedKey(), "c", "Customer Field: Key Value");
							assert.equal(oCustomerFieldControl.getValue(), "C1 Company", "Customer Field: String Value");

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

							var oSettings = that.oEditor.getCurrentSettings();
							assert.deepEqual(oSettings, {
								"/sap.card/configuration/parameters/maxItems/value": 2,
								"/sap.card/configuration/parameters/Customer/value": "c",
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
								},
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
							var sExpectedValue = _oExpectedCardTitleValues["main"][sLanguageKey] || _oExpectedCardTitleValues["main"]["default_in_en"];
							assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

							var oValueHelpIconOfTitle = oTitleFieldControl._oValueHelpIcon;
							assert.ok(oValueHelpIconOfTitle.isA("sap.ui.core.Icon"), "Title field: Input value help icon");
							assert.equal(oValueHelpIconOfTitle.getSrc(), "sap-icon://translate", "Title field: Input value help icon src");
							oTitleField.attachEventOnce("translationPopoverOpened",async function () {
								var oTranslationPopover1 = oTitleField._oTranslationPopover;
								var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
								assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
								assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
								assert.equal(aHeaderItems1[2].getItems()[0].getText(), oLanguage.description, "oTranslationPopover1 Header: English");
								var sExpectedValueInPopoverTitle = _oExpectedCardTitleValues["main"][sLanguageKey] || _oExpectedCardTitleValues["main"]["default_in_en"];
								assert.equal(aHeaderItems1[2].getItems()[1].getValue(), sExpectedValueInPopoverTitle, "oTranslationPopover1 Header: Title Value");
								assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
								assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
								assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
									var sExpectedValueInPopoveItem = _oExpectedCardTitleValues["main"][sLanguage] || _oExpectedCardTitleValues["main"]["default_in_en"];
									var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValueInPopoveItem, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValueInPopoveItem);
								}
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
								oCancelButton1.firePress();

								await nextUIUpdate();

								// simulate to click child2
								that.oEditor._oChildTree.onItemPress(oItem2, oItem2);
								EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
									assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again");
									aFormContents = that.oEditor.getAggregation("_formContent");
									assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

									EditorQunitUtils.isReady(that.oEditor).then(function () {
										assert.ok(that.oEditor.isReady(), "Editor is ready again");

										oMaxItemLabel = aFormContents[3];
										oMaxItemField = aFormContents[4];
										assert.ok(oMaxItemLabel.isA("sap.m.Label"), "MaxItem Label: Form content contains a Label");
										assert.equal(oMaxItemLabel.getText(), "maxItems", "MaxItem Label: Has label text");
										assert.ok(oMaxItemField.isA("sap.ui.integration.editor.fields.IntegerField"), "MaxItem Field: Integer Field");
										assert.ok(oMaxItemField.getAggregation("_field").isA("sap.m.Slider"), "MaxItem Field: Control is a Slider");
										assert.equal(oMaxItemField.getAggregation("_field").getValue(), 3, "MaxItem Field: Integer Value");

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

										oSettings = that.oEditor.getCurrentSettings();
										assert.deepEqual(oSettings, {
											"/sap.card/configuration/parameters/maxItems/value": 2,
											"/sap.card/configuration/parameters/Customer/value": "c",
											"/sap.card/configuration/childCards/child2/_manifestChanges": {
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
											},
											":errors": false,
											":layer": 5
										}, "Editor settings are OK");

										oTitleLabel = aFormContents[1];
										oTitleField = aFormContents[2];
										oTitleFieldControl = oTitleField.getAggregation("_field");
										assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
										assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
										assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
										assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
										sExpectedValue = _oExpectedCardTitleValues["child2"][sLanguageKey] || _oExpectedCardTitleValues["child2"]["default_in_en"];
										assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

										oValueHelpIconOfTitle = oTitleFieldControl._oValueHelpIcon;
										assert.ok(oValueHelpIconOfTitle.isA("sap.ui.core.Icon"), "Title field: Input value help icon");
										assert.equal(oValueHelpIconOfTitle.getSrc(), "sap-icon://translate", "Title field: Input value help icon src");
										oTitleField.attachEventOnce("translationPopoverOpened",async function () {
											oTranslationPopover1 = oTitleField._oTranslationPopover;
											aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
											assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
											assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
											assert.equal(aHeaderItems1[2].getItems()[0].getText(), oLanguage.description, "oTranslationPopover1 Header: English");
											sExpectedValueInPopoverTitle = _oExpectedCardTitleValues["child2"][sLanguageKey] || _oExpectedCardTitleValues["child2"]["default_in_en"];
											assert.equal(aHeaderItems1[2].getItems()[1].getValue(), sExpectedValueInPopoverTitle, "oTranslationPopover1 Header: Title Value");
											assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
											assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
											assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
											oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
											for (var i = 0; i < oLanguageItems1.length; i++) {
												var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
												var sExpectedValueInPopoveItem = _oExpectedCardTitleValues["child2"][sLanguage] || _oExpectedCardTitleValues["child2"]["default_in_en"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValueInPopoveItem, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValueInPopoveItem);
											}
											oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
											oCancelButton1.firePress();

											await nextUIUpdate();

											// simulate to click child2-1
											that.oEditor._oChildTree.onItemPress(oNewItem3, oNewItem3);
											EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
												assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready again too");
												aFormContents = that.oEditor.getAggregation("_formContent");
												assert.equal(aFormContents.length, 5, "Editor: form content length is OK");

												EditorQunitUtils.isReady(that.oEditor).then(function () {
													assert.ok(that.oEditor.isReady(), "Editor is ready again too");

													var oStringLabel = aFormContents[3];
													var oStringField = aFormContents[4];
													assert.ok(oStringLabel.isA("sap.m.Label"), "String Label: Form content contains a Label");
													assert.equal(oStringLabel.getText(), "String Label", "String Label: Has label text");
													assert.ok(oStringField.isA("sap.ui.integration.editor.fields.StringField"), "String Field: String Field");
													assert.ok(oStringField.getAggregation("_field").isA("sap.m.Input"), "String Field: Control is a Input");
													assert.equal(oStringField.getAggregation("_field").getValue(), "StringValue Content Child2-1", "String Field: String Value");

													assert.equal(that.oEditor._oChildTree.getItems().length, 4, "Child tree length is OK after expand child1");
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
													assert.ok(oNewItem2.getExpanded(), "Child tree item 2 expanded: true");
													assert.ok(!oNewItem2.isLeaf(), "Child tree item 2 is leaf: false");
													assert.equal(oNewItem3.getTitle(), "Child2-1 (in config)", "Child tree item 3 title is OK");
													assert.ok(!oNewItem3.getExpanded(), "Child tree item 3 expanded: false");
													assert.ok(oNewItem3.isLeaf(), "Child tree item 3 is leaf: true");

													oSettings = that.oEditor.getCurrentSettings();
													assert.deepEqual(oSettings, {
														"/sap.card/configuration/parameters/maxItems/value": 2,
														"/sap.card/configuration/parameters/Customer/value": "c",
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
														},
														":errors": false,
														":layer": 5
													}, "Editor settings are OK");

													oTitleLabel = aFormContents[1];
													oTitleField = aFormContents[2];
													oTitleFieldControl = oTitleField.getAggregation("_field");
													assert.ok(oTitleLabel.isA("sap.m.Label"), "Title Label: Form content contains a Label");
													assert.equal(oTitleLabel.getText(), "cardTitle", "Title Label: Has label text");
													assert.ok(oTitleField.isA("sap.ui.integration.editor.fields.StringField"), "Title Field: String Field");
													assert.ok(oTitleFieldControl.isA("sap.m.Input"), "Title Field: Control is an Input");
													sExpectedValue = _oExpectedCardTitleValues["child2-1"][sLanguageKey] || _oExpectedCardTitleValues["child2-1"]["default_in_en"];
													assert.equal(oTitleFieldControl.getValue(), sExpectedValue, "Title Field: String Value");

													oValueHelpIconOfTitle = oTitleFieldControl._oValueHelpIcon;
													assert.ok(oValueHelpIconOfTitle.isA("sap.ui.core.Icon"), "Title field: Input value help icon");
													assert.equal(oValueHelpIconOfTitle.getSrc(), "sap-icon://translate", "Title field: Input value help icon src");
													oTitleField.attachEventOnce("translationPopoverOpened",function () {
														oTranslationPopover1 = oTitleField._oTranslationPopover;
														aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
														assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
														assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
														assert.equal(aHeaderItems1[2].getItems()[0].getText(), oLanguage.description, "oTranslationPopover1 Header: English");
														sExpectedValueInPopoverTitle = _oExpectedCardTitleValues["child2-1"][sLanguageKey] || _oExpectedCardTitleValues["child2-1"]["default_in_en"];
														assert.equal(aHeaderItems1[2].getItems()[1].getValue(), sExpectedValueInPopoverTitle, "oTranslationPopover1 Header: Title Value");
														assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
														assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
														assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
														oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
														assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
														for (var i = 0; i < oLanguageItems1.length; i++) {
															var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
															var sExpectedValueInPopoveItem = _oExpectedCardTitleValues["child2-1"][sLanguage] || _oExpectedCardTitleValues["child2-1"]["default_in_en"];
															var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
															assert.equal(sCurrentValue, sExpectedValueInPopoveItem, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValueInPopoveItem);
														}
														oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
														oCancelButton1.firePress();

														destroyEditor(that.oEditor);
														resolve();
													});
													oValueHelpIconOfTitle.firePress();
													oValueHelpIconOfTitle.focus();
												});
											});
										});
										oValueHelpIconOfTitle.firePress();
										oValueHelpIconOfTitle.focus();
									});
								});
							});
							oValueHelpIconOfTitle.firePress();
							oValueHelpIconOfTitle.focus();
						});
					});
				});
			});
		});
	});
});
