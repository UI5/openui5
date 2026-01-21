sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Host",
	"./../editor/ContextHost",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"sap/ui/core/util/MockServer",
	"sap/base/util/merge"
], function(
	Localization,
	QUnitUtils,
	KeyCodes,
	Editor,
	CardEditor,
	Host,
	ContextHost,
	deepEqual,
	deepClone,
	MockServer,
	merge
) {
	"use strict";

	var EditorQunitUtils = {};

	/**
	 * @param {sap.m.Input} oControl - Control to set the value on
	 * @param {string} sValue - Value to set
	*/
	EditorQunitUtils.setInputValue = function(oControl, sValue) {
		var oInputControl = oControl.$("inner");
		oInputControl.focus();
		oInputControl.val(sValue);
		QUnitUtils.triggerEvent("input", oInputControl);
	};

	/**
	 * @param {sap.m.SearchField} oControl - Control to set the value on
	 * @param {string} sValue - Value to set
	*/
	EditorQunitUtils.setSearchFieldValue = function(oControl, sValue) {
		var oInputControl = oControl.$("I");
		oInputControl.focus();
		oInputControl.val(sValue);
		QUnitUtils.triggerEvent("input", oInputControl);
	};

	/**
	 * @param {sap.m.ComboBox} oControl - Control to set the value on
	 * @param {string} sKey - Value to select from the available options
	*/
	EditorQunitUtils.selectComboBoxValue = function(oControl, sKey) {
		var sValue = oControl.getItemByKey(sKey).getText();
		this.setInputValueAndConfirm(oControl, sValue);
	};

	/**
	 * @param {sap.m.InputBase} oControl - Control to set the value on
	 * @param {string} sValue - Custom value to set
	*/
	EditorQunitUtils.setInputValueAndConfirm = function(oControl, sValue) {
		this.setInputValue(oControl, sValue);
		var oControlDomRef = oControl.getDomRef();
		QUnitUtils.triggerKeydown(oControlDomRef, KeyCodes.ENTER);
	};

	/**
	 * @param {sap.m.MultiInput} oControl - Control to add the value to
	 * @param {string} sValue - Value to add
	*/
	EditorQunitUtils.addToMultiInput = function(oControl, sValue) {
		this.setInputValue(oControl, sValue);
		QUnitUtils.triggerKeydown(oControl.getDomRef(), KeyCodes.ENTER);
	};

	EditorQunitUtils.openColumnMenu = function(oColumn, assert) {
		return new Promise(function(resolve) {
			var oHeaderMenu = oColumn.getHeaderMenuInstance();
			assert.ok(oHeaderMenu, "EditorQunitUtils openColumnMenu: header menu instance ok");
			// attach to event beforeOpen
			oHeaderMenu.attachEventOnce("beforeOpen", function() {
				setTimeout(function() {
					assert.ok(oColumn._isHeaderMenuOpen(), "EditorQunitUtils openColumnMenu: ColumnMenu is open");
					resolve();
				}, 200);
			});
			var oElement = oColumn.getDomRef();
			assert.ok(oElement, "EditorQunitUtils openColumnMenu: column domref ok");
			oElement.focus();
			QUnitUtils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, 0);
			QUnitUtils.triggerMouseEvent(oElement, "click");
			assert.ok(oElement, "EditorQunitUtils openColumnMenu: click column ok");
		});
	};

	EditorQunitUtils.tableUpdated = function(oField) {
		return new Promise(function(resolve) {
			oField.attachEventOnce("tableUpdated", function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.beforeEachTest = function(oHostConfig, oContextHostConfig, sEditorType) {
		oHostConfig = Object.assign({
			"id": "host",
			"getDestinations": function () {
				return new Promise(function (resolve) {
					EditorQunitUtils.wait().then(function () {
						resolve([
							{
								"name": "Products"
							},
							{
								"name": "Orders"
							},
							{
								"name": "Portal"
							},
							{
								"name": "Northwind"
							}
						]);
					});
				});
			}
		}, oHostConfig);
		oContextHostConfig = Object.assign({
			"id":"contexthost"
		}, oContextHostConfig);
		this.oHost = new Host(oHostConfig.id);
		this.oHost.getDestinations = oHostConfig.getDestinations;
		this.oContextHost = new ContextHost(oContextHostConfig.id);

		return this.createEditor(undefined, undefined, sEditorType);
	};

	EditorQunitUtils.afterEachTest = function(oEditor, sandbox, oMockServer) {
		sandbox && sandbox.restore();
		oMockServer && oMockServer.destroy();
		this.oHost && this.oHost.destroy();
		this.oContextHost && this.oContextHost.destroy();
		this.destroyEditor(oEditor);
	};

	EditorQunitUtils.createEditor = function(sLanguage, oDesigntime, sEditorType) {
		sLanguage = sLanguage || "en";
		Localization.setLanguage(sLanguage);
		var oEditor;
		var oContent = document.getElementById("content");
		if (!oContent) {
			oContent = document.createElement("div");
			oContent.style.position = "absolute";
			oContent.style.top = "200px";
			oContent.style.width = sEditorType === "CardEditor" ? "calc(1000px + 5rem)" : "800px";
			oContent.style.background = "white";

			oContent.setAttribute("id", "content");
			document.body.appendChild(oContent);
			document.body.style.zIndex = 1000;
		}
		if (sEditorType === "CardEditor") {
			oEditor = new CardEditor({
				designtime: oDesigntime,
				language: sLanguage
			});
		} else {
			oEditor = new Editor({
				designtime: oDesigntime,
				language: sLanguage
			});
		}
		oEditor.placeAt(oContent);
		return oEditor;
	};

	EditorQunitUtils.destroyEditor = function(oEditor) {
		oEditor && oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
		Localization.setLanguage("en");
	};

	EditorQunitUtils.oResponseDataOfMockServer = {
		"Customers": [
			{"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1"},
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"}
		],
		"Customers_1_2": [
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"}
		],
		"Customers_CustomerID_b_startswith_": [
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"}
		],
		"Customers_startswith_": [
			{"CustomerID": "a", "CompanyName": "A Company", "Country": "Country 1", "City": "City 1", "Address": "Address 1"},
			{"CustomerID": "b", "CompanyName": "B Company", "Country": "Country 2", "City": "City 2", "Address": "Address 2"},
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"}
		],
		"Customers_startswith_c": [
			{"CustomerID": "c", "CompanyName": "C1 Company", "Country": "Country 3", "City": "City 3", "Address": "Address 3"},
			{"CustomerID": "d", "CompanyName": "C2 Company", "Country": "Country 4", "City": "City 4", "Address": "Address 4"}
		],
		"Employees": [
			{"EmployeeID": 1, "FirstName": "FirstName1", "LastName": "LastName1", "Country": "Country 1", "Title": "City 1", "HomePhone": "111111"},
			{"EmployeeID": 2, "FirstName": "FirstName2", "LastName": "LastName2", "Country": "Country 2", "Title": "City 2", "HomePhone": "222222"},
			{"EmployeeID": 3, "FirstName": "FirstName3", "LastName": "LastName3", "Country": "Country 3", "Title": "City 3", "HomePhone": "333333"},
			{"EmployeeID": 4, "FirstName": "FirstName4", "LastName": "LastName4", "Country": "Country 4", "Title": "City 4", "HomePhone": "444444"},
			{"EmployeeID": 5, "FirstName": "FirstName5", "LastName": "LastName5", "Country": "Country 5", "Title": "City 5", "HomePhone": "555555"},
			{"EmployeeID": 6, "FirstName": "FirstName6", "LastName": "LastName6", "Country": "Country 6", "Title": "City 6", "HomePhone": "666666"}
		],
		"Employees_endswith__endswith_": [
			{"EmployeeID": 1, "FirstName": "FirstName1", "LastName": "LastName1", "Country": "Country 1", "Title": "City 1", "HomePhone": "111111"},
			{"EmployeeID": 2, "FirstName": "FirstName2", "LastName": "LastName2", "Country": "Country 2", "Title": "City 2", "HomePhone": "222222"},
			{"EmployeeID": 3, "FirstName": "FirstName3", "LastName": "LastName3", "Country": "Country 3", "Title": "City 3", "HomePhone": "333333"},
			{"EmployeeID": 4, "FirstName": "FirstNamen", "LastName": "LastNamen", "Country": "Country 4", "Title": "City 4", "HomePhone": "444444"},
			{"EmployeeID": 5, "FirstName": "FirstName5", "LastName": "LastName5", "Country": "Country 5", "Title": "City 5", "HomePhone": "555555"},
			{"EmployeeID": 6, "FirstName": "FirstName6", "LastName": "LastName6", "Country": "Country 6", "Title": "City 6", "HomePhone": "666666"}
		],
		"Employees_endswith_n_endswith_n": [
			{"EmployeeID": 4, "FirstName": "FirstNamen", "LastName": "LastNamen", "Country": "Country 4", "Title": "City 4", "HomePhone": "444444"}
		],
		"Orders": [
			{"OrderID": 1, "OrderDate": "2021-02-11", "CustomerID": "a", "EmployeeID": 1},
			{"OrderID": 2, "OrderDate": "2021-02-12", "CustomerID": "b	", "EmployeeID": 2},
			{"OrderID": 3, "OrderDate": "2021-02-13", "CustomerID": "b	", "EmployeeID": 2}
		],
		"Orders_a_1": [
			{"OrderID": 1, "OrderDate": "2021-02-11", "CustomerID": "a", "EmployeeID": 1}
		],
		"Orders_b_2": [
			{"OrderID": 2, "OrderDate": "2021-02-12", "CustomerID": "b", "EmployeeID": 2},
			{"OrderID": 3, "OrderDate": "2021-02-13", "CustomerID": "b", "EmployeeID": 2}
		],
		"Products_1": [
			{"ProductID": 1, "OrderID": 1, "UnitPrice": 32.4, "Quantity": 2, "Product": {"ProductID": 1, "ProductName": "Product A"}},
			{"ProductID": 2, "OrderID": 1, "UnitPrice": 11.5, "Quantity": 4, "Product": {"ProductID": 2, "ProductName": "Product B"}}
		],
		"Products_2": [
			{"ProductID": 3, "OrderID": 2, "UnitPrice": 12.3, "Quantity": 6, "Product": {"ProductID": 3, "ProductName": "Product C"}}
		]
	};

	EditorQunitUtils.createMockServer = function(oData) {
		var oResponseData = merge(this.oResponseDataOfMockServer, oData);
		this.destroyMockServer();
		this.oMockServer = new MockServer();
		this.oMockServer.setRequests([
			{
				method: "GET",
				path: RegExp("/mock_request/Customers.*"),
				response: function (xhr) {
					var oValue = {};
					var sKey = "Customers";
					var aSplits = xhr.url.split("?");
					if (aSplits.length > 1) {
						var aParameters = aSplits[1].split("&");
						var sSkip = "_";
						var sTop = "_";
						var sConditionOperation = "_";
						var sConditionValue = "_";
						aParameters.forEach(function (parameter) {
							if (parameter.startsWith("%24skip=")) {
								sSkip += parameter.substr(8);
								sKey = sKey + sSkip;
							}
							if (parameter.startsWith("%24top=")) {
								sTop += parameter.substr(7);
								sKey = sKey + sTop;
							}
							if (parameter.startsWith("%24filter=")) {
								parameter = parameter.substr(10);
								var aConditions = parameter.split(")%20and%20(");
								aConditions.forEach(function (condition) {
									if (condition.startsWith("startswith(CompanyName%2C'")) {
										sConditionOperation += "startswith";
										sConditionValue += condition.substring(26, condition.lastIndexOf("')"));
										sKey = sKey + sConditionOperation + sConditionValue;
									} else if (condition.startsWith("(CustomerID%20eq%20'")) {
										sConditionOperation += "CustomerID";
										sConditionValue += condition.slice(20, -1);
										sKey = sKey + sConditionOperation + sConditionValue;
									}
									sConditionOperation = "_";
									sConditionValue = "_";
								});
							}
							if (parameter.startsWith("$filter=")) {
								parameter = parameter.substr(8);
								var aConditions = parameter.split(") and (");
								aConditions.forEach(function (condition) {
									if (condition.startsWith("startswith(CompanyName,'")) {
										sConditionOperation += "startswith";
										sConditionValue += condition.substring(24, condition.lastIndexOf("')"));
										sKey = sKey + sConditionOperation + sConditionValue;
									}
									sConditionOperation = "_";
									sConditionValue = "_";
								});
							}
						});
					}
					oValue = {"value": oResponseData[sKey]};
					xhr.respondJSON(200, null, oValue);
				}
			},
			{
				method: "GET",
				path: RegExp("/mock_request/Employees.*"),
				response: function (xhr) {
					var oValue = {};
					var sKey = "Employees";
					var aSplits = xhr.url.split("?");
					if (aSplits.length > 1) {
						var aParameters = aSplits[1].split("&");
						var sConditionOperation = "_";
						var sConditionValue = "_";
						aParameters.forEach(function (parameter) {
							if (parameter.startsWith("%24filter=")) {
								parameter = parameter.substr(10);
								var aConditions = parameter.split(")%20or%20");
								aConditions.forEach(function (condition) {
									if (condition.startsWith("endswith(FirstName%2C'")) {
										sConditionOperation += "endswith";
										sConditionValue += condition.slice(22, -1);
										sKey = sKey + sConditionOperation + sConditionValue;
									} else if (condition.startsWith("endswith(LastName%2C'")) {
										sConditionOperation += "endswith";
										sConditionValue += condition.substring(21, condition.lastIndexOf("')"));
										sKey = sKey + sConditionOperation + sConditionValue;
									}
									sConditionOperation = "_";
									sConditionValue = "_";
								});
							}
						});
					}
					oValue = {"value": oResponseData[sKey]};
					xhr.respondJSON(200, null, oValue);
				}
			},
			{
				method: "GET",
				path: RegExp("/mock_request/Orders.*"),
				response: function (xhr) {
					var oValue = {};
					var sKey = "Orders";
					var aSplits = xhr.url.split("?");
					if (aSplits.length > 1) {
						var aParameters = aSplits[1].split("&");
						var sCustomerID = "_";
						var sEmployeeID = "_";
						aParameters.forEach(function (parameter) {
							var sValue = parameter.split("=")[1];
							sValue = sValue.replaceAll("(", "").replaceAll(")", "");
							var aConditions = sValue.split("'%20and%20");
							aConditions.forEach(function (condition) {
								if (condition.startsWith("CustomerID%20eq%20'")) {
									sCustomerID += condition.substr(19);
								}
								if (condition.startsWith("EmployeeID%20eq%20")) {
									sEmployeeID += condition.substr(18);
								}
							});
						});
						if (sCustomerID === "_" || sEmployeeID  === "_") {
							xhr.respondJSON(400, null, {"error":{"errorCode":400,"message":"Please select a cutomer and an employee first"}});
							return;
						}
						sKey = sKey + sCustomerID + sEmployeeID;
					}
					oValue = {"value": oResponseData[sKey]};
					xhr.respondJSON(200, null, oValue);
				}
			},
			{
				method: "GET",
				path: RegExp("/mock_request/Order_Details.*"),
				response: function (xhr) {
					var oValue = {};
					var sKey = "Products";
					var aSplits = xhr.url.split("?");
					if (aSplits.length > 1) {
						var aParameters = aSplits[1].split("&");
						var sOrderID = "_";
						aParameters.forEach(function (parameter) {
							var sValue = parameter.split("=")[1];
							if (sValue.startsWith("OrderID%20eq%20")) {
								sOrderID += sValue.substr(15);
							}
						});
						if (sOrderID  === "_") {
							xhr.respondJSON(400, null, {"error":{"errorCode":400,"message":"Please select an order first"}});
							return;
						}
						sKey = sKey + sOrderID;
					}
					oValue = {"value": oResponseData[sKey]};
					xhr.respondJSON(200, null, oValue);
				}
			},
			{
				method: "GET",
				path: "/mock_request/checkValidation",
				response: function (xhr) {
					xhr.respondJSON(200, null, {
						"values": {
							"checkEditable": false,
							"minLength": 2,
							"maxLength": 4,
							"valueRange": ["key1", "key3", "key6"]
						}
					});
				}
			},
			{
				method: "GET",
				path: RegExp("/mock_request/Objects.*"),
				response: function (xhr) {
					xhr.respondJSON(200, null, {"value": oResponseData["Objects"]});
				}
			}
		]);
		this.oMockServer.start();
	};

	EditorQunitUtils.destroyMockServer = function() {
		this.oMockServer && this.oMockServer.destroy();
	};

	EditorQunitUtils.isFieldReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachFieldReady(function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.isDestinationReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachDestinationReady(function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.isUIReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachUIReady(function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.isReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachReady(function() {
				setTimeout(function () {
					resolve();
				}, 100);
			});
		});
	};

	EditorQunitUtils.wait = function(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	};

	EditorQunitUtils.getRandomElementsOfArray = function(aArray, count) {
		var result = [];
		for (var i = 0; i < count; i++) {
			if (aArray.length === 0) {
				break;
			}
			var randomIndex = Math.floor(Math.random() * aArray.length);
			result.push(aArray[randomIndex]);
			aArray.splice(randomIndex, 1);
		}
		return result;
	};

	EditorQunitUtils.getRandomPropertiesOfObject = function(oObject, count) {
		var aKeys = Object.keys(oObject);
		if (aKeys.length <= 3 || (count && count >= aKeys.length)) {
			return oObject;
		}
		if (!count || count < 0) {
			count = count || aKeys.length / 3;
			count = count > 2 ? count : 3;
		}
		var aSubKeys = EditorQunitUtils.getRandomElementsOfArray(aKeys, count);
		var oSubObject = {};
		aSubKeys.forEach(function(sKey) {
			oSubObject[sKey] = oObject[sKey];
		});
		return oSubObject;
	};

	EditorQunitUtils.performance = {
		action: 150,
		interaction: 1500,
		complexInteraction: 3000
	};

	EditorQunitUtils.cleanUUID = function(oValue) {
		return this.cleanDT(oValue, true);
	};

	EditorQunitUtils.cleanUUIDAndPosition = function(oValue) {
		return this.cleanDT(oValue, true, true);
	};

	EditorQunitUtils.cleanDT = function(oValue, bDeleteUUID, bDeletePosition) {
		var bDeleteAll = true;
		if (typeof bDeleteUUID !== "undefined" || typeof bDeletePosition !== "undefined") {
			bDeleteAll = false;
		}
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (bDeleteAll) {
					delete oResult._dt;
				} else {
					if (oResult._dt) {
						bDeleteUUID && delete oResult._dt._uuid;
						bDeletePosition && delete oResult._dt._position;
					}
					if (deepEqual(oResult._dt, {})) {
						delete oResult._dt;
					}
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (bDeleteAll) {
				delete oClonedValue._dt;
			} else {
				if (oClonedValue._dt) {
					bDeleteUUID && delete oClonedValue._dt._uuid;
					bDeletePosition && delete oClonedValue._dt._position;
				}
				if (deepEqual(oClonedValue._dt, {})) {
					delete oClonedValue._dt;
				}
			}
		}
		return oClonedValue;
	};

	return EditorQunitUtils;
});
