/*global QUnit*/

sap.ui.define(["sap/ui/core/Element", "sap/ui/model/json/JSONModel", "sap/ui/core/mvc/XMLView", "sap/ui/test/utils/nextUIUpdate"],
function(Element, JSONModel, XMLView, nextUIUpdate) {
	"use strict";

	QUnit.module("modelMapping", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-ModelMapping",
				viewName: "view.UxAP-ModelMapping"
			}).then(async (oView) => {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("initial model mapping is applied", async function(assert) {
		// Arrange
		const oExpectedFirstName = "John";
		const oExpectedLastName = "Miller";
		const oModel = new JSONModel({
			Employee: {
				firstName: oExpectedFirstName,
				lastName: oExpectedLastName
			}
		});

		assert.expect(2);

		// Act
		this.oView.setModel(oModel, "jsonModel");
		await nextUIUpdate(); // allow model info to propagare
		// setModel propagation is asynchronous; wait for it to settle
		await new Promise((resolve) => { setTimeout(resolve, 400); });

		const oSelectedView = Element.getElementById(this.oView.byId('block').getSelectedView());
		const oActualFirstName = oSelectedView.byId("txtFirstName").getText();
		const oActualLastName = oSelectedView.byId("txtLastName").getText();

		// Assert
		assert.strictEqual(oActualFirstName, oExpectedFirstName);
		assert.strictEqual(oActualLastName, oExpectedLastName);
	});

	QUnit.test("updated externalPath is applied", async function(assert) {
		// Arrange
		const oNewFirstName = "John1";
		const oNewLastName = "Miller1";
		const oModel = new JSONModel({
			Employee: {
				firstName: "John",
				lastName: "Miller"
			},
			newEmployee: {
				firstName: oNewFirstName,
				lastName: oNewLastName
			}
		});

		assert.expect(2);

		//setup
		this.oView.setModel(oModel, "jsonModel");
		await nextUIUpdate(); // allow model info to propagare

		// setModel propagation is asynchronous; wait for it to settle
		await new Promise((resolve) => { setTimeout(resolve, 400); });

		const oBlock = Element.getElementById("UxAP-ModelMapping--block");
		const oSelectedView = Element.getElementById(this.oView.byId('block').getSelectedView());

		// Act
		oBlock.getMappings()[0].setExternalPath("/newEmployee"); // update external path
		await nextUIUpdate(); // allow model info to propagare

		const oActualFirstName = oSelectedView.byId("txtFirstName").getText();
		const oActualLastName = oSelectedView.byId("txtLastName").getText();

		// Assert
		assert.strictEqual(oActualFirstName, oNewFirstName);
		assert.strictEqual(oActualLastName, oNewLastName);
	});

	QUnit.test("mapping is updated when the model is changed", async function(assert) {
		// Arrange
		const oExpectedFirstName = "JohnChanged";
		const oExpectedLastName = "MillerChanged";
		const oModel = new JSONModel({
			Employee: {
				firstName: "John",
				lastName: "Miller"
			}
		});
		const oChangedModel = new JSONModel({
			Employee: {
				firstName: oExpectedFirstName,
				lastName: oExpectedLastName
			}
		});

		assert.expect(2);

		this.oView.setModel(oModel, "jsonModel");
		await nextUIUpdate(); // allow model info to propagare

		// Act
		this.oView.setModel(oChangedModel, "jsonModel");
		await nextUIUpdate(); // allow model info to propagare

		// setModel propagation is asynchronous; wait for it to settle
		await new Promise((resolve) => { setTimeout(resolve, 400); });

		const oSelectedView = Element.getElementById(this.oView.byId('block').getSelectedView());
		const oActualFirstName = oSelectedView.byId("txtFirstName").getText();
		const oActualLastName = oSelectedView.byId("txtLastName").getText();

		// Assert
		assert.strictEqual(oActualFirstName, oExpectedFirstName);
		assert.strictEqual(oActualLastName, oExpectedLastName);
	});

});
