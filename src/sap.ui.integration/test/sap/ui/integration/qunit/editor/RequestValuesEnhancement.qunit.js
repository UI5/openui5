/* global QUnit */
sap.ui.define([
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"./jsons/withDesigntime/sap.card/DataExtensionImpl",
	"qunit/designtime/EditorQunitUtils"
], function (
	Editor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	DataExtensionImpl,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var iWaitTimeout = 3000;

	var oManifestForFilterBackendInComboBox = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/filterBackendForString",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"CustomerWithFilterParameter": {
						"value": ""
					},
					"CustomerWithFilterInURL": {
						"value": ""
					},
					"CustomerWithNotEditable": {
						"value": ""
					},
					"CustomerWithNotVisible": {
						"value": ""
					}
				},
				"destinations": {
					"northwind": {
						"name": "Northwind"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};
	var oManifestForFilterBackendInMultiComboBox = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/filterBackendForStringArrayInMultiComboBox",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"CustomersWithFilterParameter": {
						"value": []
					},
					"CustomersWithFilterInURL": {
						"value": []
					},
					"CustomersWithNotEditable": {
						"value": ""
					},
					"CustomersWithNotVisible": {
						"value": ""
					}
				},
				"destinations": {
					"northwind": {
						"name": "Northwind"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};
	var oManifestForFilterBackendInMultiInput = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/filterBackendForStringArrayInMultiInput",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"CustomersWithFilterParameter": {
						"value": []
					},
					"CustomersWithFilterInURL": {
						"value": []
					},
					"CustomersWithNotEditable": {
						"value": ""
					},
					"CustomersWithNotVisible": {
						"value": ""
					}
				},
				"destinations": {
					"northwind": {
						"name": "Northwind"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};

	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Filter in Backend by input for string (ComboBox)", {
		before: function () {
			EditorQunitUtils.createMockServer();
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
		QUnit.test("Check the setting button", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer with filter parameter", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						//settings button
						var oButton = oCustomerField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
						oButton.firePress();
						oButton.focus();
						EditorQunitUtils.wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.equal(oCustomerField._oSettingsPanel._oOpener, oCustomerField, "Settings: Has correct owner");
							var settingsClass = oCustomerField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							assert.deepEqual(testInterface.oCurrentInstance, oCustomerField._oSettingsPanel, "Settings: Points to right settings panel");
							assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
							assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
							assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
							assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
							testInterface.oSegmentedButton.getItems()[1].firePress();
							assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
							assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
							testInterface.oSegmentedButton.getItems()[0].firePress();
							assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
							assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
							testInterface.oDynamicValueField.fireValueHelpRequest();
							assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 5, "Settings: Settings Panel has 5 items");
							var oItem = testInterface.getMenuItems()[3].getItems()[2];
							testInterface.getMenu().fireItemSelected({ item: oItem });
							testInterface.oPopover.getFooter().getContent()[2].firePress();
							EditorQunitUtils.wait().then(function () {
								//this is delayed not to give time to show the tokenizer
								assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible parameter", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerNotEditableLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomerNotEditableField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomerNotEditableLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerNotEditableLabel.getText(), "CustomerWithNotEditable", "Label: Has static label text");
					assert.ok(oCustomerNotEditableField.isA("sap.ui.integration.editor.fields.StringField"), "Field: Customer NotEditable String Field");
					var oCustomerComboBox = oCustomerNotEditableField.getAggregation("_field");
					assert.ok(oCustomerComboBox.isA("sap.m.ComboBox"), "Field: Customer NotEditable is ComboBox");
					assert.ok(!oCustomerComboBox.getEditable(), "Field: Customer NotEditable is Not Editable");
					var oNextField = this.oEditor.getAggregation("_formContent")[7].getAggregation("_field");
					assert.ok(oNextField.isA("sap.m.Panel"), "Field: Customer NotVisible is not visible");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerComboBox.getItems().length, 4, "Field: Customer NotEditable data lenght is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in Filter Parameter", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer with filter parameter", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerComoboBox.getItems().length, 4, "Field: Customer origin lenght is OK");
						var oModel = oCustomerComoboBox.getModel();
						oModel.attachPropertyChange(function () {
							EditorQunitUtils.wait(iWaitTimeout).then(function () {
								assert.equal(oCustomerComoboBox.getItems().length, 2, "Field: Customer lenght is OK");
								resolve();
							});
						});
						oCustomerComoboBox.focus();
						EditorQunitUtils.setInputValue(oCustomerComoboBox, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in URL", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInComboBox
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "CustomerWithFilterInURL", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					var oCustomerComoboBox = oCustomerField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.ComboBox"), "Field: Customer is ComboBox");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerComoboBox.getItems().length, 4, "Field: Customer origin lenght is OK");
						var oModel = oCustomerComoboBox.getModel();
						oModel.attachPropertyChange(function () {
							EditorQunitUtils.wait(iWaitTimeout).then(function () {
								assert.equal(oCustomerComoboBox.getItems().length, 2, "Field: Customer lenght is OK");
								resolve();
							});
						});
						oCustomerComoboBox.focus();
						EditorQunitUtils.setInputValue(oCustomerComoboBox, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Filter in Backend by input for string[] (MultiComboBox)", {
		before: function () {
			EditorQunitUtils.createMockServer();
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
		QUnit.test("Check the setting button", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox

			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomerComoboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomerComoboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						//settings button
						var oButton = oCustomersField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
						oButton.firePress();
						oButton.focus();
						EditorQunitUtils.wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.deepEqual(oCustomersField._oSettingsPanel._oOpener, oCustomersField, "Settings: Has correct owner");
							var settingsClass = oCustomersField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							assert.deepEqual(testInterface.oCurrentInstance, oCustomersField._oSettingsPanel, "Settings: Points to right settings panel");
							assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
							assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
							assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
							assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
							testInterface.oSegmentedButton.getItems()[1].firePress();
							assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
							assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
							testInterface.oSegmentedButton.getItems()[0].firePress();
							assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
							assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
							testInterface.oDynamicValueField.fireValueHelpRequest();
							assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 5, "Settings: Settings Panel has 5 items");
							var oItem = testInterface.getMenuItems()[3].getItems()[2];
							testInterface.getMenu().fireItemSelected({ item: oItem });
							testInterface.oPopover.getFooter().getContent()[2].firePress();
							EditorQunitUtils.wait().then(function () {
								//this is delayed not to give time to show the tokenizer
								assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible parameter", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersNotEditableLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomersNotEditableField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersNotEditableLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersNotEditableLabel.getText(), "CustomersWithNotEditable", "Label: Has static label text");
					assert.ok(oCustomersNotEditableField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers NotEditable List Field");
					var oCustomersMultiComboBox = oCustomersNotEditableField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers NotEditable is MultiComboBox");
					assert.ok(!oCustomersMultiComboBox.getEditable(), "Field: Customers NotEditable is Not Editable");
					var oNextField = this.oEditor.getAggregation("_formContent")[7].getAggregation("_field");
					assert.ok(oNextField.isA("sap.m.Panel"), "Field: Customers NotVisible is not visible");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomersMultiComboBox.getItems().length, 5, "Field: Customers NotEditable data lenght is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in Filter Parameter", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiComboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomersMultiComboBox.getItems().length, 5, "Field: Customers origin lenght is OK");
						var oModel = oCustomersMultiComboBox.getModel();
						oModel.attachPropertyChange(function () {
							EditorQunitUtils.wait(iWaitTimeout).then(function () {
								assert.equal(oCustomersMultiComboBox.getItems().length, 3, "Field: Customers lenght is OK");
								resolve();
							});
						});
						oCustomersMultiComboBox.focus();
						EditorQunitUtils.setInputValue(oCustomersMultiComboBox, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in URL", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiComboBox
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "CustomersWithFilterInURL", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiComboBox = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers is MultiComboBox");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomersMultiComboBox.getItems().length, 5, "Field: Customers origin lenght is OK");
						var oModel = oCustomersMultiComboBox.getModel();
						oModel.attachPropertyChange(function () {
							EditorQunitUtils.wait(iWaitTimeout).then(function () {
								assert.equal(oCustomersMultiComboBox.getItems().length, 3, "Field: Customers lenght is OK");
								resolve();
							});
						});
						oCustomersMultiComboBox.focus();
						EditorQunitUtils.setInputValue(oCustomersMultiComboBox, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Filter in Backend by input for string[] (MultiInput)", {
		before: function () {
			EditorQunitUtils.createMockServer();
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
		QUnit.test("Check the setting button", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput

			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiInput = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers is MultiInput");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						//settings button
						var oButton = oCustomersField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
						oButton.firePress();
						oButton.focus();
						EditorQunitUtils.wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.deepEqual(oCustomersField._oSettingsPanel._oOpener, oCustomersField, "Settings: Has correct owner");
							var settingsClass = oCustomersField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							assert.deepEqual(testInterface.oCurrentInstance, oCustomersField._oSettingsPanel, "Settings: Points to right settings panel");
							assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
							assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
							assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
							assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
							testInterface.oSegmentedButton.getItems()[1].firePress();
							assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
							assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
							testInterface.oSegmentedButton.getItems()[0].firePress();
							assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
							assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
							testInterface.oDynamicValueField.fireValueHelpRequest();
							assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 5, "Settings: Settings Panel has 5 items");
							var oItem = testInterface.getMenuItems()[3].getItems()[2];
							testInterface.getMenu().fireItemSelected({ item: oItem });
							testInterface.oPopover.getFooter().getContent()[2].firePress();
							EditorQunitUtils.wait().then(function () {
								//this is delayed not to give time to show the tokenizer
								assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the NotEditable and NotVisible parameter", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersNotEditableLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomersNotEditableField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersNotEditableLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersNotEditableLabel.getText(), "CustomersWithNotEditable", "Label: Has static label text");
					assert.ok(oCustomersNotEditableField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers NotEditable List Field");
					var oCustomersMultiInput = oCustomersNotEditableField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers NotEditable is MultiInput");
					assert.ok(!oCustomersMultiInput.getEditable(), "Field: Customers NotEditable is Not Editable");
					var oNextField = this.oEditor.getAggregation("_formContent")[7].getAggregation("_field");
					assert.ok(oNextField.isA("sap.m.Panel"), "Field: Customers NotVisible is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in Filter Parameter", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiInput = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers is MultiInput");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oModel = oCustomersMultiInput.getModel();
						assert.deepEqual(oModel.getData(), {},  "Field: Customers ori lenght is OK");
						oModel.attachPropertyChange(function () {
							EditorQunitUtils.wait(iWaitTimeout).then(function () {
								assert.equal(oModel.getData().value.length, 2,  "Field: Customers lenght is OK");
								resolve();
							});
						});
						oCustomersMultiInput.focus();
						EditorQunitUtils.setInputValue(oCustomersMultiInput, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Defined in URL", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "CustomersWithFilterInURL", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiInput = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers is MultiInput");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oModel = oCustomersMultiInput.getModel();
						assert.deepEqual(oModel.getData(), {},  "Field: Customers ori lenght is OK");
						oModel.attachPropertyChange(function () {
							EditorQunitUtils.wait(iWaitTimeout).then(function () {
								assert.equal(oModel.getData().value.length, 2,  "Field: Customers lenght is OK");
								resolve();
							});
						});
						oCustomersMultiInput.focus();
						EditorQunitUtils.setInputValue(oCustomersMultiInput, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Backward Compatability for valueItems saved by MultiComboBox", function (assert) {
			var adminchanges = {
				"/sap.card/configuration/parameters/CustomersWithFilterParameter/value": ["a", "b", "d"],
				"/sap.card/configuration/parameters/CustomersWithFilterParameter/valueItems": [
					{"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1"},
					{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
					{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"}
				],
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForFilterBackendInMultiInput,
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomersLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomersField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomersLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersLabel.getText(), "Customers with filter parameter", "Label: Has static label text");
					assert.ok(oCustomersField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: List Field");
					var oCustomersMultiInput = oCustomersField.getAggregation("_field");
					assert.ok(oCustomersMultiInput.isA("sap.m.MultiInput"), "Field: Customers is MultiInput");
					var oTokens = oCustomersMultiInput.getTokens();
					assert.equal(oTokens.length, 3, "Field: token lenght is OK");
					assert.equal(oTokens[0].getText(), "A Company", "Field: token1 text is OK");
					assert.equal(oTokens[1].getText(), "B Company", "Field: token2 text is OK");
					assert.equal(oTokens[2].getText(), "C2 Company", "Field: token3 text is OK");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oModel = oCustomersMultiInput.getModel();
						assert.deepEqual(oModel.getData(), {},  "Field: Customers ori lenght is OK");
						oModel.attachPropertyChange(function () {
							EditorQunitUtils.wait(iWaitTimeout).then(function () {
								assert.equal(oModel.getData().value.length, 4,  "Field: Customers lenght is OK");
								resolve();
							});
						});
						oCustomersMultiInput.focus();
						EditorQunitUtils.setInputValue(oCustomersMultiInput, "c");
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
