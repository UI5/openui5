/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"./jsons/withDesigntime/sap.card/DataExtensionImpl",
	"./testLib/SharedExtension",
	"qunit/designtime/EditorQunitUtils"
], function(
	Localization,
	Element,
	Library,
	Editor,
	Designtime,
	Host,
	nextUIUpdate,
	sinon,
	ContextHost,
	DataExtensionImpl,
	SharedExtension,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	var iWaitTimeout = 1500;

	var oManifestBasic = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/linkedDropdownList",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"Customer": {
						"value": ""
					},
					"Employee": {
						"value": ""
					},
					"Order": {
						"value": ""
					},
					"Product": {
						"value": ""
					},
					"CustomerWithTopAndSkipOption": {
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
	var oManifestForExtension = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"extension": "DataExtensionImpl",
			"designtime": "designtime/extension",
			"type": "List",
			"header": {},
			"data": {
				"extension": {
					"method": "getData"
				},
				"path": "/values"
			},
			"configuration": {
				"parameters": {
					"DataGotFromExtensionRequest": {
						"value": ""
					},
					"DataGotFromEditorExtension": {
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
			},
			"content": {
				"item": {
					"title": "{title}",
					"description": "Trainer: {trainer}",
					"info": {
						"value": "Location: {location}"
					}
				},
				"maxItems": 4
			}
		}
	};
	var oManifestForSharedExtension = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.ui5": {
			"dependencies": {
			  "libs": {
				"sap/ui/integration/editor/test/testLib": {}
			  }
			}
		},
		"sap.card": {
			"extension": "module:sap/ui/integration/editor/test/testLib/SharedExtension",
			"designtime": "designtime/extension",
			"type": "List",
			"header": {},
			"data": {
				"extension": {
					"method": "getData"
				},
				"path": "/values"
			},
			"configuration": {
				"parameters": {
					"DataGotFromExtensionRequest": {
						"value": ""
					},
					"DataGotFromEditorExtension": {
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
			},
			"content": {
				"item": {
					"title": "{title}",
					"description": "Trainer: {trainer}",
					"info": {
						"value": "Location: {location}"
					}
				},
				"maxItems": 4
			}
		}
	};
	var oManifestForEditableDependence = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/filterBackendWithEditableDependence",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"boolean": {
						"value": false
					},
					"CustomerWithEditableDependent": {
						"value": ""
					},
					"CustomersWithEditableDependent": {
						"value": []
					},
					"CustomersInMultiInputWithEditableDependent": {
						"value": []
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
	var oManifestForVisibleDependence = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18n/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/filterBackendWithVisibleDependence",
			"type": "List",
			"header": {},
			"configuration": {
				"parameters": {
					"boolean": {
						"value": false
					},
					"CustomerWithVisibleDependent": {
						"value": ""
					},
					"CustomersWithVisibleDependent": {
						"value": []
					},
					"CustomersInMultiInputWithVisibleDependent": {
						"value": []
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

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("Linked Dropdown list", {
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
		QUnit.test("Initalize", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(async function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
						assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
						assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
						oOrderField.getAggregation("_field").focus();
						// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
						oOrderField.onfocusin();
						await nextUIUpdate();
						var sMsgStripId = oOrderField.getAssociation("_messageStrip");
						var oMsgStrip = Element.getElementById(sMsgStripId);
						assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
						assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
						assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
						assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
						oProductField.getAggregation("_field").focus();
						// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
						oProductField.onfocusin();
						await nextUIUpdate();
						assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
						assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
						assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
						assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Just select Customer, check Order and Product", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						EditorQunitUtils.wait(iWaitTimeout).then(async function () {
							assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
							assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							await nextUIUpdate();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Element.getElementById(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							await nextUIUpdate();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Just select Employee, check Order and Product", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						EditorQunitUtils.wait(iWaitTimeout).then(async function () {
							assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
							assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 0, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							await nextUIUpdate();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Element.getElementById(sMsgStripId);
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select a cutomer and an employee first", "Order Error Text");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							await nextUIUpdate();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer and Employee, check Order", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						EditorQunitUtils.wait(iWaitTimeout).then(async function () {
							assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
							assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
							assert.equal(oOrderField.getAggregation("_field").getItems().length, 1, "Field: Order lenght is OK");
							oOrderField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oOrderField.onfocusin();
							await nextUIUpdate();
							var sMsgStripId = oOrderField.getAssociation("_messageStrip");
							var oMsgStrip = Element.getElementById(sMsgStripId);
							var oDefaultBundle = Library.getResourceBundleFor("sap.ui.integration");
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oDefaultBundle.getText("EDITOR_VAL_TEXTREQ"), oMsgStrip.getText(), "Order Error Text : required");
							assert.equal(oProductField.getAggregation("_field").getItems().length, 0, "Field: Product lenght is OK");
							oProductField.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oProductField.onfocusin();
							await nextUIUpdate();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
							assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
							assert.equal(oMsgStrip.getText(), "400: Please select an order first", "Product Error Text");
							assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer, Employee and Oder, check Product 1", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(0);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
						EditorQunitUtils.wait(iWaitTimeout).then(function () {
							oComboBox = oOrderField.getAggregation("_field");
							assert.equal(oComboBox.getItems().length, 1, "Field: Order lenght is OK");
							oComboBox.setSelectedIndex(0);
							oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
							EditorQunitUtils.wait(iWaitTimeout).then(async function () {
								assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
								assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
								assert.equal(oOrderField.getAggregation("_field").getItems().length, 1, "Field: Order lenght is OK");
								oOrderField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oOrderField.onfocusin();
								await nextUIUpdate();
								var sMsgStripId = oOrderField.getAssociation("_messageStrip");
								var oMsgStrip = Element.getElementById(sMsgStripId);
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oProductField.getAggregation("_field").getItems().length, 2, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oProductField.onfocusin();
								await nextUIUpdate();
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Select Customer, Employee and Oder, check Product 2", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestBasic
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "Customer", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Customers is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "Employee", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Employee is ComboBox");

					var oOrderLabel = this.oEditor.getAggregation("_formContent")[5];
					var oOrderField = this.oEditor.getAggregation("_formContent")[6];
					assert.equal(oOrderLabel.getText(), "Order", "Label: Has static label text");
					assert.ok(oOrderField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oOrderField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Order is ComboBox");

					var oProductLabel = this.oEditor.getAggregation("_formContent")[7];
					var oProductField = this.oEditor.getAggregation("_formContent")[8];
					assert.equal(oProductLabel.getText(), "Product", "Label: Has static label text");
					assert.ok(oProductField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oProductField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Product is ComboBox");

					var oCustomerLimitLabel = this.oEditor.getAggregation("_formContent")[9];
					var oCustomerLimitField = this.oEditor.getAggregation("_formContent")[10];
					assert.equal(oCustomerLimitLabel.getText(), "CustomerWithTopAndSkipOption", "Label: Has static label text");
					assert.ok(oCustomerLimitField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerLimitField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: CustomerWithTopAndSkipOption is ComboBox");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oComboBox = oCustomerField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 4, "Field: Customer lenght is OK");
						oComboBox.setSelectedIndex(1);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[1] });
						oComboBox = oEmployeeField.getAggregation("_field");
						assert.equal(oComboBox.getItems().length, 6, "Field: Employee lenght is OK");
						oComboBox.setSelectedIndex(1);
						oComboBox.fireChange({ selectedItem: oComboBox.getItems()[1] });
						EditorQunitUtils.wait(iWaitTimeout).then(function () {
							oComboBox = oOrderField.getAggregation("_field");
							assert.equal(oComboBox.getItems().length, 2, "Field: Order lenght is OK");
							oComboBox.setSelectedIndex(0);
							oComboBox.fireChange({ selectedItem: oComboBox.getItems()[0] });
							EditorQunitUtils.wait(iWaitTimeout).then(async function () {
								assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: Customer lenght is OK");
								assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 6, "Field: Employee lenght is OK");
								assert.equal(oOrderField.getAggregation("_field").getItems().length, 2, "Field: Order lenght is OK");
								oOrderField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oOrderField.onfocusin();
								await nextUIUpdate();
								var sMsgStripId = oOrderField.getAssociation("_messageStrip");
								var oMsgStrip = Element.getElementById(sMsgStripId);
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oProductField.getAggregation("_field").getItems().length, 1, "Field: Product lenght is OK");
								oProductField.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oProductField.onfocusin();
								await nextUIUpdate();
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								assert.equal(oCustomerLimitField.getAggregation("_field").getItems().length, 2, "Field: CustomerWithTopAndSkipOption lenght is OK");
								resolve();
							});
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Get data from extension", {
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
		QUnit.test("Check value items", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForExtension
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "DataGotFromExtensionRequest", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromExtensionRequest is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "DataGotFromEditorExtension", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromEditorExtension is ComboBox");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromExtensionRequest lenght is OK");
						assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromEditorExtension lenght is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Get data from shared extension", {
		before: function () {
			// Simulate library location for the shared extension
			sap.ui.loader.config({
				paths: {
					"sap/ui/integration/editor/test/testLib": "test-resources/sap/ui/integration/qunit/editor/testLib"
				}
			});
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
		QUnit.test("Check value items from shared extension", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForSharedExtension
			});
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oCustomerLabel = this.oEditor.getAggregation("_formContent")[1];
					var oCustomerField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oCustomerLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerLabel.getText(), "DataGotFromExtensionRequest", "Label: Has static label text");
					assert.ok(oCustomerField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oCustomerField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromExtensionRequest is ComboBox");

					var oEmployeeLabel = this.oEditor.getAggregation("_formContent")[3];
					var oEmployeeField = this.oEditor.getAggregation("_formContent")[4];
					assert.equal(oEmployeeLabel.getText(), "DataGotFromEditorExtension", "Label: Has static label text");
					assert.ok(oEmployeeField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oEmployeeField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: DataGotFromEditorExtension is ComboBox");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromExtensionRequest lenght is OK");
						assert.equal(oEmployeeField.getAggregation("_field").getItems().length, 4, "Field: DataGotFromEditorExtension lenght is OK");
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Dependence", {
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
		QUnit.test("Check the Editable dependece parameters", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForEditableDependence
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oBooleanSwitch = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(oBooleanSwitch.getState() === false, "Label: Boolean switch value");

					var oCustomerWithEditableDependentLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomerWithEditableDependentField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerWithEditableDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerWithEditableDependentLabel.getText(), "CustomerWithEditableDependent", "Label: Has static label text");
					assert.ok(oCustomerWithEditableDependentField.isA("sap.ui.integration.editor.fields.StringField"), "Field: Customer Editable String Field");
					var oCustomerWithEditableDependentComboBox = oCustomerWithEditableDependentField.getAggregation("_field");
					assert.ok(oCustomerWithEditableDependentComboBox.isA("sap.m.ComboBox"), "Field: Customer Editable is ComboBox");
					assert.ok(!oCustomerWithEditableDependentComboBox.getEditable(), "Field: Customer Editable is Not Editable");

					var oCustomersWithEditableDependentLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomersWithEditableDependenteField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersWithEditableDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersWithEditableDependentLabel.getText(), "CustomersWithEditableDependent", "Label: Has static label text");
					assert.ok(oCustomersWithEditableDependenteField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers Editable List Field");
					var oCustomersWithEditableDependentMultiComboBox = oCustomersWithEditableDependenteField.getAggregation("_field");
					assert.ok(oCustomersWithEditableDependentMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers Editable is MultiComboBox");
					assert.ok(!oCustomersWithEditableDependentMultiComboBox.getEditable(), "Field: Customers Editable is Not Editable");

					var oCustomersInMultiInputWithEditableDependentLabel = this.oEditor.getAggregation("_formContent")[7];
					var oCustomersInMultiInputWithEditableDependenteField = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oCustomersInMultiInputWithEditableDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersInMultiInputWithEditableDependentLabel.getText(), "CustomersInMultiInputWithEditableDependent", "Label: Has static label text");
					assert.ok(oCustomersInMultiInputWithEditableDependenteField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers Editable List Field");
					var oCustomersWithEditableDependentMultiInput = oCustomersInMultiInputWithEditableDependenteField.getAggregation("_field");
					assert.ok(oCustomersWithEditableDependentMultiInput.isA("sap.m.MultiInput"), "Field: Customers Editable is MultiInput");
					assert.ok(!oCustomersWithEditableDependentMultiInput.getEditable(), "Field: Customers Editable is Not Editable");

					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerWithEditableDependentComboBox.getItems().length, 4, "Field: Customer Editable data lenght is OK");
						assert.equal(oCustomersWithEditableDependentMultiComboBox.getItems().length, 5, "Field: Customers Editable data lenght is OK");

						oBooleanSwitch.setState(true);
						EditorQunitUtils.wait(iWaitTimeout).then(function () {
							assert.ok(oCustomerWithEditableDependentComboBox.getEditable(), "Field: Customer Editable is now Editable");
							assert.equal(oCustomerWithEditableDependentComboBox.getItems().length, 4, "Field: Customer Editable data lenght is OK");
							assert.ok(oCustomersWithEditableDependentMultiComboBox.getEditable(), "Field: Customers Editable is now Editable");
							assert.equal(oCustomersWithEditableDependentMultiComboBox.getItems().length, 5, "Field: Customers Editable data lenght is OK");
							assert.ok(oCustomersWithEditableDependentMultiInput.getEditable(), "Field: Customers Editable is now Editable");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check the Visible dependece parameters", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: oManifestForVisibleDependence
			});
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			return new Promise(function (resolve, reject) {
				EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
					var oBooleanSwitch = this.oEditor.getAggregation("_formContent")[2].getAggregation("_field");
					assert.ok(oBooleanSwitch.getState() === false, "Label: Boolean switch value");

					var oCustomerWithVisibleDependentLabel = this.oEditor.getAggregation("_formContent")[3];
					var oCustomerWithVisibleDependentField = this.oEditor.getAggregation("_formContent")[4];
					assert.ok(oCustomerWithVisibleDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomerWithVisibleDependentLabel.getText(), "CustomerWithVisibleDependent", "Label: Has static label text");
					assert.ok(oCustomerWithVisibleDependentField.isA("sap.ui.integration.editor.fields.StringField"), "Field: Customer Visible String Field");
					var oCustomerWithVisibleDependentComboBox = oCustomerWithVisibleDependentField.getAggregation("_field");
					assert.ok(oCustomerWithVisibleDependentComboBox.isA("sap.m.ComboBox"), "Field: Customer Visible is ComboBox");
					assert.ok(!oCustomerWithVisibleDependentComboBox.getVisible(), "Field: Customers Visible is Not Visible");

					var oCustomersWithVisibleDependentLabel = this.oEditor.getAggregation("_formContent")[5];
					var oCustomersWithVisibleDependentField = this.oEditor.getAggregation("_formContent")[6];
					assert.ok(oCustomersWithVisibleDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersWithVisibleDependentLabel.getText(), "CustomersWithVisibleDependent", "Label: Has static label text");
					assert.ok(oCustomersWithVisibleDependentField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers Visible List Field");
					var oCustomersWithVisibleDependentMultiComboBox = oCustomersWithVisibleDependentField.getAggregation("_field");
					assert.ok(oCustomersWithVisibleDependentMultiComboBox.isA("sap.m.MultiComboBox"), "Field: Customers Visible is MultiComboBox");
					assert.ok(!oCustomersWithVisibleDependentMultiComboBox.getVisible(), "Field: Customers Visible is Not Visible");

					var oCustomersMultiInputWithVisibleDependentLabel = this.oEditor.getAggregation("_formContent")[7];
					var oCustomersMultiInputWithVisibleDependentField = this.oEditor.getAggregation("_formContent")[8];
					assert.ok(oCustomersMultiInputWithVisibleDependentLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oCustomersMultiInputWithVisibleDependentLabel.getText(), "CustomersInMultiInputWithVisibleDependent", "Label: Has static label text");
					assert.ok(oCustomersMultiInputWithVisibleDependentField.isA("sap.ui.integration.editor.fields.StringListField"), "Field: Customers Visible List Field");
					var oCustomersWithVisibleDependentMultiInput = oCustomersMultiInputWithVisibleDependentField.getAggregation("_field");
					assert.ok(oCustomersWithVisibleDependentMultiInput.isA("sap.m.MultiInput"), "Field: Customers Visible is MultiInput");
					assert.ok(!oCustomersWithVisibleDependentMultiInput.getVisible(), "Field: Customers Visible is Not Visible");
					EditorQunitUtils.isReady(this.oEditor).then(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						assert.equal(oCustomerWithVisibleDependentComboBox.getItems().length, 4, "Field: Customer Visible data lenght is OK");
						assert.equal(oCustomersWithVisibleDependentMultiComboBox.getItems().length, 5, "Field: Customers Visible data lenght is OK");

						oBooleanSwitch.setState(true);
						EditorQunitUtils.wait(iWaitTimeout).then(function () {
							assert.ok(oCustomerWithVisibleDependentComboBox.getVisible(), "Field: Customer Visible is now Visible");
							assert.equal(oCustomerWithVisibleDependentComboBox.getItems().length, 4, "Field: Customer Visible data lenght is OK");
							assert.ok(oCustomersWithVisibleDependentMultiComboBox.getVisible(), "Field: Customers Visible is now Visible");
							assert.equal(oCustomersWithVisibleDependentMultiComboBox.getItems().length, 5, "Field: Customers Visible data lenght is OK");
							assert.ok(oCustomersWithVisibleDependentMultiInput.getEditable(), "Field: Customers Visible is now Editable");
							resolve();
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
