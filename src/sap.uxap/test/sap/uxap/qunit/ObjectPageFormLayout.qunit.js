/*global QUnit*/
sap.ui.define(["sap/ui/core/Element", "sap/ui/test/utils/nextUIUpdate", "sap/ui/thirdparty/jquery", "sap/ui/core/mvc/XMLView"],
function(Element, nextUIUpdate, jQuery, XMLView) {
	"use strict";


	const waitForForm = (oView, sBlockId) => {
		return new Promise((resolve) => {
			oView.byId(sBlockId)
				.attachEvent("viewInit", (oEvent) => {
					const oForm = oEvent.getParameter("view").getContent()[0];
					oForm.addEventDelegate({
						onAfterRendering: function() {
							oForm.removeEventDelegate(this);
							resolve();
						}
					});
				});
		});
	};


	QUnit.module("Form Layout", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-FormLayout",
				viewName: "view.UxAP-FormLayout"
			}).then(async function(oView) {
				this.oObjectPageFormView = oView;
				this.oObjectPageFormView.placeAt("qunit-fixture");
				await nextUIUpdate();

				waitForForm(oView, "personalFormBlock").then(done);

			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageFormView.destroy();
		}
	});

	QUnit.test("ObjectPage Form layout", function (assert) {
		const sExpectedClasses = ".sapUiFormCLColumnsL3.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL4.sapUiFormCLContent";

		// Arrange
		const oFormBlock = this.oObjectPageFormView.byId("personalFormBlock");
		const aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormCLContent>*");
		const $GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

		// Assert
		assert.strictEqual(aGridCells.length, 4, "Form grid has 4 cells");
		assert.ok($GridCellsOuter.is(sExpectedClasses),
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);
	});

	QUnit.test("ObjectPage with TitleOnLeft Form layout", function (assert) {
		const done = assert.async();
		const sExpectedClasses = ".sapUiFormCLColumnsL2.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL3.sapUiFormCLContent";

		assert.expect(1);

		// Arrange
		const oObjectPage = this.oObjectPageFormView.byId("ObjectPageLayout");
		const oFormBlock = this.oObjectPageFormView.byId("personalFormBlock");

		// Act
		oObjectPage.setSubSectionLayout("TitleOnLeft");
		oObjectPage.addEventDelegate({
			onAfterRendering: function() {
				const $GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

				// Assert
				assert.ok($GridCellsOuter.is(sExpectedClasses),
						"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);
				oObjectPage.removeEventDelegate(this);
				done();
			}
		});
	});

	QUnit.module("Simple Form Layout", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-SimpleFormLayout",
				viewName: "view.UxAP-SimpleFormLayout"
			}).then(async function(oView) {
				this.oObjectPageFormView = oView;
				this.oObjectPage = oView.byId("ObjectPageLayout");
				this.oObjectPageFormView.placeAt("qunit-fixture");
				await nextUIUpdate();

				const oPromise1 = waitForForm(oView, "personalSimpleFormBlock");
				const oPromise2 = waitForForm(oView, "employmentSimpleFormBlock");

				Promise.all([oPromise1, oPromise2]).then(done);

			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageFormView.destroy();
			this.oObjectPageFormView = null;
			this.oObjectPage = null;
		}
	});

	QUnit.test("ObjectPage SimpleForm layout", function (assert) {
		const sExpectedClasses = ".sapUiFormCLColumnsL3.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL4.sapUiFormCLContent";
		const oFormBlock = this.oObjectPageFormView.byId("personalSimpleFormBlock");
		const aGridCells = oFormBlock.$().find(".sapUiForm .sapUiFormCLContent>*");
		const oTestInput = Element.getElementById("__input0");
		const iTestInputTop = parseInt(oTestInput.$().offset().top);
		const $GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();
		const done = assert.async();

		// Assert
		assert.expect(3);

		// Assert
		assert.strictEqual(aGridCells.length, 4, "Form grid has 4 cells");
		assert.ok($GridCellsOuter.is(sExpectedClasses),
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);

		oFormBlock.addEventDelegate({
			onAfterRendering: function() {
				// Assert
				assert.strictEqual(parseInt(oTestInput.$().offset().top) < (iTestInputTop - oTestInput.$().height()), true, "Input field should be visible");
				oFormBlock.removeEventDelegate(this);
				done();
			}
		});

		// Act
		oFormBlock.setColumnLayout("3");

		// Act
		oFormBlock.setColumnLayout("2");

		// Act
		oFormBlock.setColumnLayout("1");

		// Act
		oTestInput.focus();

	});

	QUnit.test("ObjectPage with TitleOnLeft SimpleForm layout", function (assert) {
		const done = assert.async();
		const sExpectedClasses = ".sapUiFormCLColumnsL2.sapUiFormCLColumnsM2.sapUiFormCLColumnsXL3.sapUiFormCLContent";

		assert.expect(1);

		// Arrange
		const oObjectPage = this.oObjectPageFormView.byId("ObjectPageLayout");
		const oFormBlock = this.oObjectPageFormView.byId("personalSimpleFormBlock");

		// Act
		oObjectPage.setSubSectionLayout("TitleOnLeft");
		oObjectPage.addEventDelegate({
			onAfterRendering: function() {
				const $GridCellsOuter = oFormBlock.$().find(".sapUiForm .sapUiFormCL>div").first();

				// Assert
				assert.ok($GridCellsOuter.is(sExpectedClasses),
				"The correct classes are applied to to the outer div of the cells: " + sExpectedClasses);
				oObjectPage.removeEventDelegate(this);
				done();
			}
		});
	});

	QUnit.test("ObjectPage Fist Editable field focus", function (assert) {
		// Arrange
		const oObjectPageLayout = this.oObjectPageFormView.byId("ObjectPageLayout");
		const oInput = jQuery("#UxAP-SimpleFormLayout--employmentSimpleFormBlock-defaultXML--firstEditableInput-inner")[0];

		// Act
		oObjectPageLayout._focusFirstEditableInput("sectionsContainer");

		// Assert
		assert.equal(document.activeElement, oInput, "The first editable input is focused");
	});
});
