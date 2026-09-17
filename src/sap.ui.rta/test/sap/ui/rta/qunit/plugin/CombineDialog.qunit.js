/* global QUnit */

sap.ui.define([
	"sap/ui/rta/plugin/CombineDialog",
	"sap/ui/fl/util/CancelError",
	"sap/ui/thirdparty/sinon-4"
], function(
	CombineDialog,
	CancelError,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	function getElements() {
		return [
			{ id: "element1", label: "Element 1", count: 1, selected: false },
			{ id: "element2", label: "Element 2", count: 1, selected: false }
		];
	}

	// reads the elements from the dialog model (which carries the computed enabled/displayLabel state)
	function getModelElements(oDialog) {
		return oDialog._oDialogModel.getProperty("/elements");
	}

	QUnit.module("Given a CombineDialog is instantiated", {
		afterEach() {
			if (this.oCombineDialog) {
				this.oCombineDialog.destroy();
			}
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when open is called and the dialog is confirmed", function(assert) {
			const done = assert.async();
			const oDialog = new CombineDialog({
				title: "Combine With",
				elements: getElements()
			});
			this.oCombineDialog = oDialog;

			oDialog.attachOpened(function() {
				assert.strictEqual(oDialog.getTitle(), "Combine With", "then the title is set");
				assert.strictEqual(oDialog._oDialog.getTitle(), "Combine With", "then the title is set on the inner dialog");
				assert.strictEqual(getModelElements(oDialog).length, 2, "then both elements are known to the dialog");

				// select the first element and confirm
				getModelElements(oDialog)[0].selected = true;
				oDialog._submitDialog();
			});

			oDialog.open().then(function() {
				assert.strictEqual(oDialog.getSelectedElements().length, 1, "then the confirmed selection is returned");
				assert.strictEqual(oDialog.getSelectedElements()[0].id, "element1", "then the selected element id is correct");
				done();
			});
		});

		QUnit.test("when open is called and the dialog is cancelled", function(assert) {
			const done = assert.async();
			const oDialog = new CombineDialog({ elements: getElements() });
			this.oCombineDialog = oDialog;

			oDialog.attachOpened(function() {
				oDialog._cancelDialog();
			});

			oDialog.open().catch(function(oError) {
				assert.ok(oError instanceof CancelError, "then open rejects with a CancelError");
				done();
			});
		});

		QUnit.test("when a list item is activated via Enter/click it toggles the selection", function(assert) {
			const done = assert.async();
			const oDialog = new CombineDialog({
				// a limit of 2 controls with a source counting as 1 -> only one more element fits
				maxControlsCount: 2,
				sourceControlsCount: 1,
				elements: [
					{ id: "element1", label: "Element 1", count: 1, selected: false },
					{ id: "element2", label: "Element 2", count: 1, selected: false }
				]
			});
			this.oCombineDialog = oDialog;

			oDialog.attachOpened(function() {
				const aItems = oDialog._oList.getItems();

				// activating the enabled row toggles its checkbox and updates the model
				oDialog._onItemPress({ getSource: () => aItems[0] });
				assert.strictEqual(aItems[0].getContent()[0].getSelected(), true, "then the row's checkbox is selected");
				assert.strictEqual(oDialog.getSelectedElements().length, 1, "then the element is selected in the model");

				// the limit is now reached, so the other row is disabled and activating it does nothing
				assert.strictEqual(aItems[1].getContent()[0].getEnabled(), false, "then the other row is disabled at the limit");
				oDialog._onItemPress({ getSource: () => aItems[1] });
				assert.strictEqual(oDialog.getSelectedElements().length, 1, "then a disabled row cannot be activated");

				// activating the first row again toggles it back off
				oDialog._onItemPress({ getSource: () => aItems[0] });
				assert.strictEqual(oDialog.getSelectedElements().length, 0, "then activating again deselects the element");

				oDialog._cancelDialog();
			});

			oDialog.open().catch(function() {
				done();
			});
		});

		QUnit.test("when a list item is activated via Spacebar it toggles the selection", function(assert) {
			const done = assert.async();
			const oDialog = new CombineDialog({
				maxControlsCount: 2,
				sourceControlsCount: 1,
				elements: [
					{ id: "element1", label: "Element 1", count: 1, selected: false },
					{ id: "element2", label: "Element 2", count: 1, selected: false }
				]
			});
			this.oCombineDialog = oDialog;

			oDialog.attachOpened(function() {
				const aItems = oDialog._oList.getItems();
				let bPrevented = false;
				const fnFakeEvent = (oItem) => ({
					target: oItem.getFocusDomRef(),
					preventDefault() {
						bPrevented = true;
					}
				});

				// Spacebar on the enabled row toggles its checkbox
				oDialog._onListSpace(fnFakeEvent(aItems[0]));
				assert.ok(bPrevented, "then the default scrolling behavior is prevented");
				assert.strictEqual(oDialog.getSelectedElements().length, 1, "then the element is selected via Spacebar");

				// Spacebar on the now-disabled row does nothing
				oDialog._onListSpace(fnFakeEvent(aItems[1]));
				assert.strictEqual(oDialog.getSelectedElements().length, 1, "then a disabled row cannot be selected via Spacebar");

				oDialog._cancelDialog();
			});

			oDialog.open().catch(function() {
				done();
			});
		});

		QUnit.test("when the control-defined limit caps the number of selectable elements", function(assert) {
			// max 2 controls, source counts as 1 -> only one single-control element can be added
			const oDialog = new CombineDialog({
				maxControlsCount: 2,
				sourceControlsCount: 1,
				elements: [
					{ id: "element1", label: "Element 1", count: 1, selected: false },
					{ id: "element2", label: "Element 2", count: 1, selected: false },
					{ id: "element3", label: "Element 3", count: 1, selected: false }
				]
			});
			this.oCombineDialog = oDialog;
			oDialog._initModelFromProperties();
			const oModel = oDialog._oDialogModel;

			// nothing selected -> OK disabled, all elements selectable
			assert.strictEqual(oModel.getProperty("/okEnabled"), false, "then OK is disabled without a selection");
			assert.ok(getModelElements(oDialog).every((o) => o.enabled), "then all elements are enabled initially");

			// select the first element -> OK enabled, the other unselected elements become disabled
			getModelElements(oDialog)[0].selected = true;
			oDialog._onSelectionChange();
			assert.strictEqual(oModel.getProperty("/okEnabled"), true, "then OK is enabled after a selection");
			assert.strictEqual(getModelElements(oDialog)[0].enabled, true, "then the selected element stays enabled");
			assert.strictEqual(getModelElements(oDialog)[1].enabled, false, "then a further element is disabled at the limit");
			assert.strictEqual(getModelElements(oDialog)[2].enabled, false, "then all further elements are disabled at the limit");
		});

		QUnit.test("when the info text reflects the number of controls that can still be combined", function(assert) {
			// budget of 3 controls, source counts as 1 -> 2 more controls fit
			const oDialog = new CombineDialog({
				maxControlsCount: 3,
				sourceControlsCount: 1,
				elements: [
					{ id: "element1", label: "Element 1", count: 1, selected: false },
					{ id: "element2", label: "Element 2", count: 1, selected: false },
					{ id: "element3", label: "Element 3", count: 1, selected: false }
				]
			});
			this.oCombineDialog = oDialog;
			oDialog._initModelFromProperties();
			const oModel = oDialog._oDialogModel;
			const oBundle = oDialog._oResourceBundle;

			assert.strictEqual(
				oModel.getProperty("/infoText"),
				oBundle.getText("MSG_COMBINE_REMAINING", [2]),
				"then the info text reports the number of additional controls that fit"
			);

			// select one -> one control remains
			getModelElements(oDialog)[0].selected = true;
			oDialog._onSelectionChange();
			assert.strictEqual(
				oModel.getProperty("/infoText"),
				oBundle.getText("MSG_COMBINE_REMAINING", [1]),
				"then the remaining count decrements as elements are selected"
			);

			// select the second -> limit reached
			getModelElements(oDialog)[1].selected = true;
			oDialog._onSelectionChange();
			assert.strictEqual(
				oModel.getProperty("/infoText"),
				oBundle.getText("MSG_COMBINE_LIMIT_REACHED"),
				"then the limit-reached message is shown once no more controls can be combined"
			);
		});

		QUnit.test("when a combined element counts for more than one control", function(assert) {
			// budget of 3 controls, source counts as 1 -> 2 controls remain; element2 counts as 2
			const oDialog = new CombineDialog({
				maxControlsCount: 3,
				sourceControlsCount: 1,
				elements: [
					{ id: "combined", label: "Combined", count: 2, selected: false },
					{ id: "single", label: "Single", count: 1, selected: false }
				]
			});
			this.oCombineDialog = oDialog;
			oDialog._initModelFromProperties();

			// the combined element (count 2) fits into the remaining 2 controls, and gets a badge
			const oBundle = oDialog._oResourceBundle;
			assert.strictEqual(
				getModelElements(oDialog)[0].displayLabel,
				oBundle.getText("LBL_COMBINE_ELEMENT_COUNT", ["Combined", 2]),
				"then a multi-control element gets a count badge"
			);
			assert.strictEqual(getModelElements(oDialog)[0].enabled, true, "then the combined element is initially selectable");

			// selecting the combined element consumes both remaining controls -> the single one is disabled
			getModelElements(oDialog)[0].selected = true;
			oDialog._onSelectionChange();
			assert.strictEqual(getModelElements(oDialog)[1].enabled, false, "then the single element is disabled once the budget is used");
		});

		QUnit.test("when there is no limit all elements stay selectable", function(assert) {
			const oDialog = new CombineDialog({
				elements: [
					{ id: "element1", label: "Element 1", count: 1, selected: false },
					{ id: "element2", label: "Element 2", count: 1, selected: false }
				]
			});
			this.oCombineDialog = oDialog;
			oDialog._initModelFromProperties();

			assert.strictEqual(oDialog._oDialogModel.getProperty("/infoText"), "", "then no limit info text is shown");
			assert.strictEqual(oDialog._oDialogModel.getProperty("/infoVisible"), false, "then the info strip is hidden without a limit");
			getModelElements(oDialog)[0].selected = true;
			oDialog._onSelectionChange();
			assert.ok(getModelElements(oDialog).every((o) => o.enabled), "then all elements remain selectable without a limit");
			assert.strictEqual(oDialog._oDialogModel.getProperty("/infoVisible"), false, "then the info strip stays hidden after select");
		});

		QUnit.test("when getSelectedElements is called it returns only the selected elements", function(assert) {
			const oDialog = new CombineDialog({
				elements: [
					{ id: "element1", label: "Element 1", count: 1, selected: false },
					{ id: "element2", label: "Element 2", count: 1, selected: true }
				]
			});
			this.oCombineDialog = oDialog;
			oDialog._initModelFromProperties();

			assert.strictEqual(oDialog.getSelectedElements().length, 1, "then only the selected element is returned");
			assert.strictEqual(oDialog.getSelectedElements()[0].id, "element2", "then the correct element is returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
