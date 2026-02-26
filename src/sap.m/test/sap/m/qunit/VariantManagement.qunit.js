/*global QUnit, sinon */
sap.ui.define([
	"sap/m/VariantItem",
	"sap/m/VariantManagement",
	"sap/ui/core/Element",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/BindingMode"
], function(VariantItem, VariantManagement, Element, ContextSharingAPI, QUnitUtils, JSONModel, nextUIUpdate, mobileLibrary, KeyCodes, BindingMode) {
	"use strict";

	// shortcut for sap.m.Sticky
	var Sticky = mobileLibrary.Sticky;

	var fChangeApplyAutomatic = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oExec = aCells[4].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oExec, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	var fChangeDefault = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oDefault = aCells[3].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oDefault, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	var fChangeDelete = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oDelete = aCells[7].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("tap", oDelete, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	var fChangeFavorite = async function(oManagementTable, iRow, vValue) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oFavorite = aCells[0].getFocusDomRef();
		QUnitUtils.triggerTouchEvent("click", oFavorite, {
			srcControl: null
		});
		await nextUIUpdate();
	};

	var fChangeTitle = async function(oManagementTable, iRow, vValue, bFocusOut) {
		var aItems = oManagementTable.getItems();
		var aCells = aItems[iRow].getCells();

		var oInput = aCells[1];
		oInput.focus();
		oInput.$("inner").val(vValue);
		if (bFocusOut) {
			aCells[7].focus(); // delete button
			await new Promise((resolve) => {setTimeout(resolve, 100);}); // wait for the async setting of title
		} else {
			QUnitUtils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ENTER);
		}
		await nextUIUpdate();
	};


	QUnit.module("VariantManagement tests", {
		beforeEach:  function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("Instantiate VariantManagement", function(assert) {
		assert.ok(this.oVM, "could be instantiated");
	});

	QUnit.test("Check properties", function(assert) {
		assert.equal(this.oVM.getLevel(), "Auto", "expected level");
		assert.equal(this.oVM.getTitleStyle(), "Auto", "expected title style");

		this.oVM.setLevel("H1");
		this.oVM.setTitleStyle("H2");

		assert.equal(this.oVM.getLevel(), "H1", "expected level");
		assert.equal(this.oVM.getTitleStyle(), "H2", "expected title style");
	});

	QUnit.test("VariantManagement with two VariantItems", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		assert.equal(this.oVM.getItems().length, 2, "with two items");
	});

	QUnit.test("VariantManagement with selected key", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		var oTitle = Element.getElementById(this.oVM.getId() + "-text");
		assert.ok(oTitle);
		assert.equal(oTitle.getText(), "", "expected no text");

		this.oVM.setSelectedKey("2");

		assert.ok(oTitle);
		assert.equal(oTitle.getText(), "Two", "expected text");

		assert.equal(this.oVM.getSelectedKey(), "2", "expected selected key");
	});

	QUnit.test("VariantManagement check title", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		assert.equal(this.oVM.getTitle().getText(), "Two", "expected text");

		var aItems = this.oVM.getItems();
		assert.equal(aItems.length, 2, "expected items found");

		aItems[1].setTitle("Hugo");

		assert.equal(this.oVM.getTitle().getText(), "Hugo", "expected text");
	});

	QUnit.test("VariantManagement check _showAsText", function(assert) {
		assert.equal(this.oVM.getShowAsText(), false, "expected default value");

		assert.ok(this.oVM.getTitle());
		assert.ok(this.oVM.getTitle().isA("sap.m.Title"), "expected type 'sap.m.Title'.");

		this.oVM.setShowAsText(true);
		assert.equal(this.oVM.getShowAsText(), true, "expected assigned value");

		assert.ok(this.oVM.getTitle());
		assert.ok(this.oVM.getTitle().isA("sap.m.Text"), "expected type 'sap.m.Text'.");

		this.oVM.setShowAsText(false);
		assert.equal(this.oVM.getShowAsText(), false, "expected assigned value");

		assert.ok(this.oVM.getTitle());
		assert.ok(this.oVM.getTitle().isA("sap.m.Title"), "expected type 'sap.m.Title'.");
	});

	QUnit.test("VariantManagement check _IsItemDeleted", function(assert) {
		var oVMI1 = new VariantItem({key: "1", title:"One"});
		var oVMI2 = new VariantItem({key: "2", title:"Two"});

		this.oVM._clearDeletedItems();
		this.oVM._addDeletedItem(oVMI1);

		assert.ok(this.oVM._isItemDeleted(oVMI1), "item is deleted.");
		assert.ok(!this.oVM._isItemDeleted(oVMI2), "item is not deleted.");
	});

	QUnit.test("VariantManagement check aria-expanded initial state", async function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.setSelectedKey("1");

		await nextUIUpdate();

		const oTriggerButton = this.oVM.oVariantPopoverTrigger;
		assert.ok(oTriggerButton, "trigger button should exist");

		const sAriaExpanded = oTriggerButton.$().attr("aria-expanded");
		assert.equal(sAriaExpanded, "false", "aria-expanded should be 'false' after initial rendering");
	});

	QUnit.test("VariantManagement check aria-expanded attribute", async function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("1");

		await nextUIUpdate();

		const oTriggerButton = this.oVM.oVariantPopoverTrigger;
		assert.ok(oTriggerButton, "trigger button should exist");

		// Assert initial state - should be false
		const sInitialAriaExpanded = oTriggerButton.$().attr("aria-expanded");
		assert.equal(sInitialAriaExpanded, "false", "aria-expanded should initially be 'false'");

		const done = assert.async();

		// Mock the variant list opening to test aria-expanded behavior
		const fOriginalOpenVariantList = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function() {
			fOriginalOpenVariantList();

			// Verify aria-expanded is set to true when opening
			const sExpandedValue = oTriggerButton.$().attr("aria-expanded");
			assert.equal(sExpandedValue, "true", "aria-expanded should be 'true' when variant list opens");

			// Test closing behavior
			if (this.oVariantPopOver && this.oVariantPopOver.isOpen()) {
				this.oVariantPopOver.attachAfterClose(function() {
					// Wait a bit for the timeout in afterClose to execute (longer than the 200ms timeout in the implementation)
					setTimeout(function() {
						const sCollapsedValue = oTriggerButton.$().attr("aria-expanded");
						assert.equal(sCollapsedValue, "false", "aria-expanded should be 'false' when variant list closes");
						done();
					}, 250);
				});
				this.oVariantPopOver.close();
			} else {
				done();
			}
		}.bind(this));

		// Act
		this.oVM.onclick();
	});

	QUnit.test("VariantManagement check aria-expanded attribute in error state", async function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.setSelectedKey("1");
		this.oVM.setInErrorState(true);

		await nextUIUpdate();

		const oTriggerButton = this.oVM.oVariantPopoverTrigger;
		assert.ok(oTriggerButton, "trigger button should exist");

		// Assert initial state - should be false
		const sInitialAriaExpanded = oTriggerButton.$().attr("aria-expanded");
		assert.equal(sInitialAriaExpanded, "false", "aria-expanded should initially be 'false'");

		const done = assert.async();

		// Mock the error state opening to test aria-expanded behavior
		const fOriginalOpenInErrorState = this.oVM._openInErrorState.bind(this.oVM);
		sinon.stub(this.oVM, "_openInErrorState").callsFake(function() {
			fOriginalOpenInErrorState();

			// In error state, aria-expanded should remain false since the variant list doesn't open
			const sExpandedValue = oTriggerButton.$().attr("aria-expanded");
			assert.equal(sExpandedValue, "false", "aria-expanded should remain 'false' in error state since variant list doesn't open");

			// Test closing behavior for error popover
			if (this.oErrorVariantPopOver && this.oErrorVariantPopOver.isOpen()) {
				this.oErrorVariantPopOver.attachAfterClose(function() {
					// Wait a bit for the timeout in afterClose to execute (longer than the 200ms timeout in the implementation)
					setTimeout(function() {
						const sCollapsedValue = oTriggerButton.$().attr("aria-expanded");
						assert.equal(sCollapsedValue, "false", "aria-expanded should remain 'false' after error popover closes");
						done();
					}, 250);
				});
				this.oErrorVariantPopOver.close();
			} else {
				done();
			}
		}.bind(this));

		// Act
		this.oVM.onclick();
	});

	QUnit.module("VariantManagement variantlist", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM .placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check items", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setPopoverTitle("My List");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.equal(this.oVM.getItems().length, 2, "two items expected");

			assert.ok(this.oVM.oVariantPopOver, "popover should exists");
			assert.equal(this.oVM.oVariantPopOver.getTitle(), "My List", "title expected");

			assert.ok(this.oVM.oVariantList, "list should exists");
			assert.equal(this.oVM.oVariantList.getItems().length, 2, "two items expected");
			assert.equal(this.oVM.oVariantList.getSelectedItem().getKey(), "2", "selected item expected");

			assert.ok(this.oVM.getShowFooter(), "expect to see the footer");

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check items with some favorite = false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: false}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false}));
		this.oVM.setSelectedKey("2");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.equal(this.oVM.getItems().length, 4, "four items expected");

			assert.ok(this.oVM.oVariantList, "list should exists");
			assert.equal(this.oVM.oVariantList.getItems().length, 2, "two items expected");
			assert.equal(this.oVM.oVariantList.getSelectedItem().getKey(), "2", "selected item expected");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check setCurrentVariantKey", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		var bSelectCalled = false;

		this.oVM.attachSelect(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "1", "key expected");
			assert.equal(this.oVM.getSelectedKey(), "1", "new selection expected");
			bSelectCalled = true;
		}.bind(this));

		assert.ok(!bSelectCalled);
		this.oVM.setCurrentVariantKey("1");
		assert.ok(bSelectCalled);

		bSelectCalled = false;
		this.oVM.setCurrentVariantKey("XXX");
		assert.ok(!bSelectCalled);

	});

	QUnit.test("check event 'select'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		var done = assert.async();

		this.oVM.attachSelect(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "1", "key expected");
			assert.equal(this.oVM.getSelectedKey(), "1", "new selection expected");

			done();
		}.bind(this));

		this.oVM.setCurrentVariantKey("1");
	});

	QUnit.test("check event 'save'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", changeable: true}));

		this.oVM.setSelectedKey("2");
		this.oVM.setModified(true);

		var done = assert.async();

		this.oVM.attachSave(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.equal(mParameters.key, "2", "key expected");
			assert.ok(mParameters.overwrite, "overwrite should be true");

			done();
		});

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			assert.ok(this.oVM.oVariantSaveBtn.getVisible(), "should be visible");

			var oTarget = this.oVM.oVariantSaveBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});


	QUnit.test("check title", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setPopoverTitle("My List");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.equal(this.oVM.getItems().length, 2, "two items expected");

			assert.ok(this.oVM.oVariantPopOver, "popover should exists");
			assert.equal(this.oVM.oVariantPopOver.getTitle(), "My List", "title expected");

			done();

		}.bind(this));

		this.oVM.onclick();

	});

	QUnit.test("check with showFooter = false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setShowFooter(false);

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(!this.oVM.getShowFooter(), "expect to see the footer");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with modified=false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", changeable: true}));
		this.oVM.setSelectedKey("2");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.getShowFooter(), "expect to see the footer");

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with modified = true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title: "One"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", changeable: true}));
		this.oVM.setSelectedKey("2");
		this.oVM.setModified(true);

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(this.oVM.oVariantSaveBtn.getVisible(), "Save button should be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with showSaveAs=true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setShowSaveAs(false);

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with creation not allowed", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setCreationAllowed(false);

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check buttons with  creation not allowed and modified = true", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");
		this.oVM.setCreationAllowed(false);
		this.oVM.setModified(true);

		this.oVM.setPopoverTitle("My List");

		var done = assert.async();

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(function (oEvent) {

			fOriginalCall(oEvent);

			assert.ok(this.oVM.oVariantSaveBtn, "Save button should exists");
			assert.ok(!this.oVM.oVariantSaveBtn.getVisible(), "Save button should not be visible");

			assert.ok(this.oVM.oVariantSaveAsBtn, "Save As button should exists");
			assert.ok(!this.oVM.oVariantSaveAsBtn.getVisible(), "Save As button should not be visible");

			assert.ok(this.oVM.oVariantManageBtn, "Manage button should exists");
			assert.ok(this.oVM.oVariantManageBtn.getVisible(), "Manage button should be visible");

			done();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opening the variant list display in simulated designmode", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));

		sinon.stub(this.oVM, "_openVariantList");

		this.oVM.setDesignMode(true);
		this.oVM.onclick();
        assert.ok(!this.oVM._openVariantList.called);

		this.oVM.setDesignMode(false);
		this.oVM.onclick();
        assert.ok(this.oVM._openVariantList.called);
	});

	QUnit.test("check no data available", async function(assert) {
		this.oVM.onclick();
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataIllustratedMessage, "expected illustrated message found");

		this.oVM.addItem(new VariantItem({key: "1", title:"View1"}));

		this.oVM.onclick();
		await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until opened
		assert.ok(this.oVM.oVariantList.getVisible(), "list is visible");
		assert.ok(!this.oVM.oNodataTextLayout.getVisible(), "no data text is invisible");

		var sSearchText = "XXX";
		var oEvent = {
			getParameters: function() { return {newValue: sSearchText};}
		};

		this.oVM.addItem(new VariantItem({key: "2", title:"View2"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"View3"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"View4"}));
		this.oVM.addItem(new VariantItem({key: "5", title:"View5"}));
		this.oVM.addItem(new VariantItem({key: "6", title:"View6"}));
		this.oVM.addItem(new VariantItem({key: "7", title:"View7"}));
		this.oVM.addItem(new VariantItem({key: "8", title:"View8"}));
		this.oVM.addItem(new VariantItem({key: "9", title:"View9"}));
		this.oVM.addItem(new VariantItem({key: "10", title:"View10"}));

		this.oVM._triggerSearch(oEvent, this.oVM.oVariantList);
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataFoundIllustratedMessage, "expected illustrated message found");

		sSearchText = "View";
		this.oVM._triggerSearch(oEvent, this.oVM.oVariantList);
		assert.ok(this.oVM.oVariantList.getVisible(), "list is visible");
		assert.ok(!this.oVM.oNodataTextLayout.getVisible(), "no data text is invisible");

		this.oVM.removeAllItems();
		this.oVM.onclick();
		assert.ok(!this.oVM.oVariantList.getVisible(), "list is invisible");
		assert.ok(this.oVM.oNodataTextLayout.getVisible(), "no data text is visible");
		assert.equal(this.oVM.oNodataTextLayout.getItems()[0], this.oVM._oNoDataIllustratedMessage, "expected illustrated message found");
	});

	QUnit.module("VariantManagement SaveAs dialog", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check opens", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oInputName, "should exists");
			assert.ok(this.oVM.oInputName.getValue(), "Two", "default entry");

			assert.ok(this.oVM.oDefault, "should exists");
			assert.ok(this.oVM.oDefault.getVisible(), "should be visible");

			assert.ok(this.oVM.oPublic, "should exists");
			assert.ok(this.oVM.oPublic.getVisible(), "should be visible");

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			assert.ok(this.oVM.oExecuteOnSelect.getVisible(), "should be visible");

			assert.ok(this.oVM.oCreateTile, "should exists");
			assert.ok(!this.oVM.oCreateTile.getVisible(), "should not be visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens with supportPublic & supportDefault & supportApplyAutomatically set to false", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));
		this.oVM.setSelectedKey("2");

		this.oVM.setSupportPublic(false);
		this.oVM.setSupportApplyAutomatically(false);
		this.oVM.setSupportDefault(false);

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oDefault, "should exists");
			assert.ok(!this.oVM.oDefault.getVisible(), "should not be visible");

			assert.ok(this.oVM.oPublic, "should exists");
			assert.ok(!this.oVM.oPublic.getVisible(), "should not be visible");

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			assert.ok(!this.oVM.oExecuteOnSelect.getVisible(), "should not be visible");

			assert.ok(this.oVM.oCreateTile, "should exists");
			assert.ok(!this.oVM.oCreateTile.getVisible(), "should not be visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens with show Tile", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");
		this.oVM._setShowCreateTile(true);

		var done = assert.async();

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(function (oEvent) {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oDefault, "should exists");
			assert.ok(this.oVM.oDefault.getVisible(), "should be visible");

			assert.ok(this.oVM.oPublic, "should exists");
			assert.ok(this.oVM.oPublic.getVisible(), "should be visible");

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			assert.ok(this.oVM.oExecuteOnSelect.getVisible(), "should be visible");

			assert.ok(this.oVM.oCreateTile, "should exists");
			assert.ok(this.oVM.oCreateTile.getVisible(), "should be visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check text selection in save as dialog", function(assert) {

		_createSaveAsDialog.call(this, assert);
		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);

		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(async (oEvent) => {
			fOriginalSaveAsCall(oEvent);

			// Check if the whole text is selected
			assert.ok(this.oVM.oInputName.getSelectedText().length === this.oVM.oInputName.getValue().length, "text should be selected");

			// Close the dialog to finish the test
			this.oVM._cancelPressed();

			await nextUIUpdate();
		});

	});

	QUnit.test("check event 'save' on save button press", function(assert) {

		var triggerAction = (target) => {
			QUnitUtils.triggerTouchEvent("tap", target, {
				srcControl: null
			});
		};
		_checkSaveAction.call(this, assert, triggerAction);
	});

	QUnit.test("check event 'save' on enter key press", function(assert) {

		var triggerAction = (target) => {
			QUnitUtils.triggerKeydown(target, KeyCodes.ENTER);
		};

		_checkSaveAction.call(this, assert, triggerAction);

	});

	/**
	 * Creates the Save As dialog with mocked data
	 * @param {QUnit.Assert} assert - QUnit assert object
	 */
	function _createSaveAsDialog(assert) {
		// Add variant items
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));


		this.oVM.attachSave(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.ok(mParameters.def, "default flag expected");
			assert.ok(mParameters.execute, "execute flag expected");
			assert.ok(mParameters.public, "public flag expected");
			assert.ok(!mParameters.overwrite, "overwrite should be false");
			assert.equal(mParameters.name, "New", "name expected");
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog);
	}

	/**
	 * Test function to check 'save' event
	 * @param {QUnit.Assert} assert - QUnit assert object
	 * @param {VoidFunction} triggerAction - function to trigger the save action (either click or keypress)
	 */
	function _checkSaveAction(assert, triggerAction) {
		_createSaveAsDialog.call(this, assert);
		var done = assert.async();

		this.oVM.oSaveAsDialog.attachAfterClose(function(oEvent) {
			done();
		});

		var fOriginalSaveAsCall = this.oVM._openSaveAsDialog.bind(this.oVM);

		sinon.stub(this.oVM, "_openSaveAsDialog").callsFake(async (oEvent) => {

			fOriginalSaveAsCall(oEvent);

			assert.ok(this.oVM.oInputName, "should exists");
			this.oVM.oInputName.setValue("New");

			assert.ok(this.oVM.oDefault, "should exists");
			this.oVM.oDefault.setSelected(true);

			assert.ok(this.oVM.oPublic, "should exists");
			this.oVM.oPublic.setSelected(true);

			assert.ok(this.oVM.oExecuteOnSelect, "should exists");
			this.oVM.oExecuteOnSelect.setSelected(true);

			var oTarget = this.oVM.oSaveSave.getFocusDomRef();
			assert.ok(oTarget);
			// Use the provided triggerAction function to simulate user action
			triggerAction(oTarget);

			await nextUIUpdate();

		});

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async(oEvent) => {
			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantSaveAsBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		});

		this.oVM.onclick();
	}

	QUnit.module("VariantManagement Manage dialog", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});
	QUnit.test("check opens", function(assert) {
		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementDialog, "manage dialog exist");

			assert.ok(this.oVM.oManagementTable, "management table exists");
			assert.equal(this.oVM.oManagementTable.getSticky().length, 1);
			assert.equal(this.oVM.oManagementTable.getSticky()[0], Sticky.ColumnHeaders, "management table has sticky column headers");
			var aColumns = this.oVM.oManagementTable.getColumns();
			assert.ok(aColumns, "columns in the management table exists");
			assert.equal(aColumns.length, 9, "columns in the management table exists");
			assert.ok(aColumns[0].getVisible(), "favorite column is visible");
			assert.ok(aColumns[1].getVisible(), "title column is visible");
			assert.ok(aColumns[2].getVisible(), "sharing column is visible");
			assert.ok(aColumns[3].getVisible(), "default column is visible");
			assert.ok(aColumns[4].getVisible(), "apply automatic  column is visible");
			assert.ok(!aColumns[5].getVisible(), "contexts column is not visible");
			assert.ok(aColumns[6].getVisible(), "author column is visible");
			assert.ok(aColumns[7].getVisible(), "delete column is visible");
			assert.ok(!aColumns[8].getVisible(), "last column is always not visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens with supportDefault & supportApplyAutomatic & supportPublic & supportFavorites set to false", function(assert) {
		this.oVM.setSupportDefault(false);
		this.oVM.setSupportApplyAutomatically(false);
		this.oVM.setSupportPublic(false);
		this.oVM.setSupportFavorites(false);

		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aColumns = this.oVM.oManagementTable.getColumns();
			assert.ok(aColumns, "columns in the management table exists");
			assert.equal(aColumns.length, 9, "columns in the management table exists");
			assert.ok(!aColumns[0].getVisible(), "favorite column is visible");
			assert.ok(aColumns[1].getVisible(), "title column is visible");
			assert.ok(!aColumns[2].getVisible(), "sharing column is visible");
			assert.ok(!aColumns[3].getVisible(), "default column is visible");
			assert.ok(!aColumns[4].getVisible(), "apply automatic column is visible");
			assert.ok(!aColumns[5].getVisible(), "contexts column is not visible");
			assert.ok(aColumns[6].getVisible(), "author column is visible");
			assert.ok(aColumns[7].getVisible(), "delete column is visible");
			assert.ok(!aColumns[8].getVisible(), "last column is always not visible");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check items", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			var i, j, aCells, oControl, sTemp, bSkip;

			for (i = 0; i < this.oVM.oManagementTable.getItems().length; i++) {
				aCells = this.oVM.oManagementTable.getItems()[i].getCells();
				assert.ok(aCells, "expected cells found");

				if (i === 0) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found" + "' for (" + i + ',' + 0 + ')');
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be inactive" + "' for (" + i + ',' + 0 + ')');

					assert.ok(aCells[1].isA("sap.m.ObjectIdentifier"),  "expected controltype found" + "' for (" + i + ',' + 1 + ')');
					assert.equal(aCells[1].getTitle(), "One", "expected sharing info found" + "' for (" + i + ',' + 1 + ')');

					assert.equal(aCells[2].getText(), "Public", "expected sharing info found" + "' for (" + i + ',' + 2 + ')');
					assert.ok(!aCells[3].getSelected(), "expected default info found" + "' for (" + i + ',' + 3 + ')');
					assert.ok(aCells[4].getSelected(), "expected apply automatically info found" + "' for (" + i + ',' + 4 + ')');

					assert.equal(aCells[6].getText(), "A", "expected author found" + "' for (" + i + ',' + 6 + ')');
					assert.ok(!aCells[7].getVisible(), "expected delete info found" + "' for (" + i + ',' + 7 + ')');

				} else if (i === 1) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found" + "' for (" + i + ',' + 0 + ')');
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavColor"), "should be active" + "' for (" + i + ',' + 0 + ')');

					assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found" + "' for (" + i + ',' + 1 + ')');
					assert.equal(aCells[1].getValue(), "Two", "expected sharing info found" + "' for (" + i + ',' + 1 + ')');

					assert.equal(aCells[2].getText(),  "Private", "expected sharing info found" + "' for (" + i + ',' + 2 + ')');
					assert.ok(!aCells[3].getSelected(),  "expected default info found" + "' for (" + i + ',' + 3 + ')');
					assert.ok(!aCells[4].getSelected(),  "expected apply automatically info found" + "' for (" + i + ',' + 4 + ')');

					assert.equal(aCells[6].getText(), "B", "expected author found" + "' for (" + i + ',' + 6 + ')');
					assert.ok(aCells[7].getVisible(), "expected delete info found" + "' for (" + i + ',' + 7 + ')');
				} else if (i === 2) {
					assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found" + "' for (" + i + ',' + 0 + ')');
					assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be active" + "' for (" + i + ',' + 0 + ')');

					assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found" + "' for (" + i + ',' + 1 + ')');
					assert.equal(aCells[1].getValue(), "Three", "expected sharing info found" + "' for (" + i + ',' + 1 + ')');

					assert.equal(aCells[2].getText(),  "Private", "expected sharing info found" + "' for (" + i + ',' + 2 + ')');
					assert.ok(aCells[3].getSelected(),  "expected default info found" + "' for (" + i + ',' + 3 + ')');
					assert.ok(aCells[4].getSelected(),  "expected apply automatically info found" + "' for (" + i + ',' + 4 + ')');

					assert.equal(aCells[6].getText(), "A", "expected author found" + "' for (" + i + ',' + 6 + ')');
					assert.ok(aCells[7].getVisible(), "expected delete info found" + "' for (" + i + ',' + 7 + ')');
				} else {
					assert.equal(aCells[0].getSrc(), "sap-icon://unfavorite", "expected favorite icon found" + "' for (" + i + ',' + 0 + ')');

					assert.ok(aCells[1].isA("sap.m.ObjectIdentifier"), "expected controltype found" + "' for (" + i + ',' + 1 + ')');
					assert.equal(aCells[1].getTitle(), "Four", "expected sharing info found" + "' for (" + i + ',' + 1 + ')');

					assert.equal(aCells[2].getText(),  "Public", "expected sharing info found" + "' for (" + i + ',' + 2 + ')');
					assert.ok(!aCells[3].getSelected(),  "expected default info found" + "' for (" + i + ',' + 3 + ')');
					assert.ok(!aCells[4].getSelected(),  "expected apply automatically info found" + "' for (" + i + ',' + 4 + ')');

					assert.equal(aCells[6].getText(), "B", "expected author found" + "' for (" + i + ',' + 6 + ')');
					assert.ok(!aCells[7].getVisible(), "expected delete info found" + "' for (" + i + ',' + 7 + ')');
				}

				var sIdPrefix = this.oVM.getId() + "-manage-";

				for (j = 0; j < aCells.length; j++) {
					oControl = aCells[j];
					bSkip = false;
					switch (j) {
						case 0: sTemp = "fav-"; break;
						case 1: sTemp = oControl.isA("sap.m.Input") ? "input-" : "text-"; break;
						case 2: sTemp = "type-"; break;
						case 3: sTemp = "def-"; break;
						case 4: sTemp = "exe-"; break;
						case 5: sTemp = "roles-"; bSkip = true; break;
						case 6: sTemp = "author-"; break;
						case 7: sTemp = "del-"; break;
						default: bSkip = true; break;
					}

					if (!bSkip) {
						assert.equal(oControl.getId(), sIdPrefix + sTemp + i, "expecting id '" + sTemp + "' for (" + i + ',' + j + ')');
					}
				}
			}

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check event 'cancel'", async function(assert) {
		var done = assert.async();

		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));
		this.oVM.setDefaultKey("3");

		await nextUIUpdate();

		this.oVM.attachManageCancel(function(oEvent) {

			assert.equal(this.oVM.getDefaultKey(), "3", "default reverted correctly");

			var aItems = this.oVM.getItems();
			assert.ok(aItems, "items exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			for (var i = 0; i < aItems.length; i++) {

				if (i === 0) {
					assert.equal(aItems[i].getTitle(), "One", "expected title. Row=0");
					assert.equal(aItems[i].getTitle(), aItems[i]._getOriginalTitle(), "expected title. Row=0");

					assert.equal(aItems[i].getExecuteOnSelect(), true, "expected execute on select. Row=0");
					assert.equal(aItems[i].getExecuteOnSelect(), aItems[i]._getOriginalExecuteOnSelect(), "expected execute on select. Row=0");
				} else if (i === 1) {
					assert.equal(aItems[i].getTitle(), "Two", "expected title. Row=1");
					assert.equal(aItems[i].getTitle(), aItems[i]._getOriginalTitle(), "expected title. Row=1");

				} else if (i === 2) {
					assert.equal(aItems[i].getTitle(), "Three", "expected title. Row=2");
					assert.equal(aItems[i].getTitle(), aItems[i]._getOriginalTitle(), "expected title. Row=2");

					assert.equal(aItems[i].getExecuteOnSelect(), true, "expected execute on select. Row=2");
					assert.equal(aItems[i].getExecuteOnSelect(), aItems[i]._getOriginalExecuteOnSelect(), "expected execute on select. Row=2");

					assert.equal(aItems[i].getVisible(), true, "item is active. Row=3");
				} else {
					assert.equal(aItems[i].getTitle(), "Four", "expected title. Row=3");
					assert.equal(aItems[i].getTitle(), aItems[i]._getOriginalTitle(), "expected title. Row=3");

					assert.equal(aItems[i].getFavorite(), false, "expected favorite. Row=3");
					assert.equal(aItems[i].getFavorite(), aItems[i]._getOriginalFavorite(), "expected favorite. Row=3");
				}
			}
		}.bind(this));


		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(async function() {

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), true,  "item 2 is visible");

			// 1st row
			await fChangeApplyAutomatic(this.oVM.oManagementTable, 0);

			// 2nd row
			await fChangeTitle(this.oVM.oManagementTable, 1, "newName");
			await fChangeDefault(this.oVM.oManagementTable, 1);

			// 4th row
			await fChangeFavorite(this.oVM.oManagementTable, 3);

			// 3nd row
			await fChangeTitle(this.oVM.oManagementTable, 2, "newName2", true);
			await fChangeDelete(this.oVM.oManagementTable, 2);

			aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), false,  "item 2 is not visible");

			aItems = this.oVM.getItems();
			assert.ok(aItems, "aggregation items exists");
			assert.equal(aItems.length, 4, "aggregation items count");

			var oOrigItem;
			for (var i = 0; i < aItems.length; i++) {
				oOrigItem = this.oVM._getItemByKey(aItems[i].getKey());
				assert.ok(oOrigItem, "expected aggregation item found");

				if (oOrigItem.getKey() === "1") {
					assert.equal(oOrigItem.getTitle(), "One", "expected title. Key=1");
					assert.equal(oOrigItem.getTitle(), aItems[i]._getOriginalTitle(), "expected title. Key=1");

					assert.equal(oOrigItem.getExecuteOnSelect(), false, "expected execute on select. Key=1");
					assert.ok(oOrigItem.getExecuteOnSelect() !== oOrigItem._getOriginalExecuteOnSelect(), "expected execute on select. Key=1");
				} else if (oOrigItem.getKey() === "2") {
					assert.equal(oOrigItem.getTitle(), "newName", "expected title. Key=2");
					assert.ok(oOrigItem.getTitle() !== oOrigItem._getOriginalTitle(), "expected title. Key=2");

				} else if (oOrigItem.getKey() === "3") {
					assert.equal(oOrigItem.getTitle(), "newName2", "expected title. Key=3");
					assert.ok(oOrigItem.getTitle() !== oOrigItem._getOriginalTitle(), "expected title. Key=3");

					assert.ok(oOrigItem.getVisible(), "item is active. Key=3");
				} else {
					assert.equal(oOrigItem.getTitle(), "Four", "expected title. Key=4");
					assert.equal(oOrigItem.getTitle(), oOrigItem._getOriginalTitle(), "expected title. Key=4");

					assert.equal(oOrigItem.getFavorite(), true, "expected favorite. Key=4");
					assert.ok(oOrigItem.getFavorite() !== oOrigItem._getOriginalFavorite(), "expected favorite. Key=4");
				}
			}

			var oTarget = this.oVM.oManagementCancel.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected items");

		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check opens check event 'manage'", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		var done = assert.async();

		this.oVM.attachManage(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters);

			// unittest issue
//			assert.equal(mParameters.def, "2");
//			assert.equal(this.oVM.getDefaultKey(), "2", "expected default");

			assert.ok(mParameters.exe);
			assert.equal(mParameters.exe.length, 1, "expected event data about apply automatically.");
			assert.equal(mParameters.exe[0].key, "1", "expected event data about apply automatically key.");
			assert.equal(mParameters.exe[0].exe, false, "expected event data about apply automatically value");

			assert.ok(mParameters.fav);
			assert.equal(mParameters.fav.length, 1, "expected event data about favorite.");
			assert.equal(mParameters.fav[0].key, "4", "expected event data about favorite key.");
			assert.equal(mParameters.fav[0].visible, true, "expected event data about favorite value");

			assert.ok(mParameters.deleted);
			assert.equal(mParameters.deleted.length, 1, "expected event data about deleted.");
			assert.equal(mParameters.deleted[0], '3', "expected event data about deleted.");

		});

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(async function() {

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), true,  "item 2 is visible");

			// 1st row
			await fChangeApplyAutomatic(this.oVM.oManagementTable, 0);

			// 2nd row
			await fChangeTitle(this.oVM.oManagementTable, 1, "newName");

			await fChangeDefault(this.oVM.oManagementTable, 1);

			// 4th row
			await fChangeFavorite(this.oVM.oManagementTable, 3);

			// 3nd row
			await fChangeTitle(this.oVM.oManagementTable, 2, "newName2");

			await fChangeDelete(this.oVM.oManagementTable, 2);

			aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");
			assert.equal(aItems[2].getVisible(), false,  "item 2 is not visible");


			aItems = this.oVM.getItems();
			assert.ok(aItems, "aggregation items exists");
			assert.equal(aItems.length, 4, "aggregation items count");


			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("check manage dialog with dublicate entries", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		var done = assert.async();

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		var fOriginalSaveHandler = this.oVM._handleManageSavePressed.bind(this.oVM);
		sinon.stub(this.oVM, "_handleManageSavePressed").callsFake(function (oEvent) {
			fOriginalSaveHandler();

			assert.ok(this.oVM.oManagementTable, "management table exists");
			var aItems = this.oVM.oManagementTable.getItems();
			var aCells = aItems[1].getCells();

			var oInput = aCells[1];
			assert.ok(oInput, "expected input field");

			assert.equal(oInput.getValueState(), "Error", "expected error state");

			var oTarget = this.oVM.oManagementCancel.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.oManagementDialog.attachAfterClose(function() {
			done();
		});

		this.oVM.oManagementDialog.attachAfterOpen(async function() {

			// 2nd row
			await fChangeTitle(this.oVM.oManagementTable, 1, "One");


			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(async function (oEvent) {

			await fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");
		}.bind(this));


		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test('check manage dialog Save shortcut key', function(assert) {

		_createMockVariantManagementDialog.call(this);

		sinon.stub(this.oVM, "_openManagementDialog").callsFake(async function (oEvent) {

			// simulate Enter key press on Save button
			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerKeydown(oTarget, KeyCodes.ENTER, false, false, true);

			await nextUIUpdate();

		}).bind(this);

		assert.ok(this.oVM._handleManageSavePressed(), "expected no errors");

	});

	QUnit.test("check manage dialog Save behavour", function(assert) {
		_createMockVariantManagementDialog.call(this);

		assert.ok(this.oVM._handleManageSavePressed(), "expected no errors");

		var oRow = this.oVM._getRowForKey("3");
		assert.ok(oRow, "expected row found");

		var oInput = oRow.getCells()[VariantManagement.COLUMN_NAME_IDX];
		assert.ok(oInput, "expected input found");
		oInput.setValueState("Error");
		assert.ok(!this.oVM._handleManageSavePressed(), "expected errors detected");

		var oView = this.oVM.getItemByKey("3");
		assert.ok(oView, "expected view found");
		this.oVM._handleManageDeletePressed(oView);
		assert.ok(this.oVM._handleManageSavePressed(), "expected no errors");
	});

	function _createMockVariantManagementDialog() {
		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		this.oVM._openManagementDialog();
	}

	QUnit.test("check binding on items is propagated into dialog", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantTitlePart1: "One", variantTitlePart2: " and One", author: "A", favorite: true, visible: true},
			{variantKey: "2", variantTitlePart1: "Two", variantTitlePart2: " and Two", favorite: false, visible: false}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem({
				key: "{variantKey}",
				title: {parts: [{path: 'variantTitlePart1'}, {path: 'variantTitlePart2'}], formatter: (part1, part2) => `Title: ${part1}${part2}`},
				author: "Constant Author",
				visible: "{visible}"
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 2,  "expected count of items in the management table exists");

			let aCells = aItems[0].getCells();
			assert.ok(aCells, "expected cells found");
			assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");
			assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be inactive");
			let oBinding = aCells[0].getBinding("src");
			assert.ok(oBinding.getModel().isA("sap.ui.model.base.ManagedObjectModel"), "Icon bound to Managed Object Model");
			assert.equal(oBinding.getBindingMode(), BindingMode.OneWay, "OneWay binding expected");

			assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found");
			assert.equal(aCells[1].getValue(), "Title: One and One", "expected title found");

			assert.equal(aCells[2].getText(), "Public", "expected sharing info found");
			assert.ok(aCells[3].getSelected(), "expected default info found");
			assert.ok(!aCells[4].getSelected(), "expected apply automatically info found");
			assert.equal(aCells[6].getText(), "Constant Author", "expected author found");
			assert.ok(aItems[0].getVisible(), "expected visibility found");

			oBinding = aCells[8].getBinding("text");
			assert.equal(oBinding.getPath(), "variantKey", "Text bound to outer model");
			assert.equal(oBinding.getModel(), oVariantsModel, "Text bound to outer model");
			assert.equal(oBinding.getBindingMode(), BindingMode.OneWay, "OneWay binding expected");

			aCells = aItems[1].getCells();
			assert.ok(aCells, "expected cells found");
			assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");

			assert.ok(aCells[1].isA("sap.m.Input"),  "expected controltype found");
			assert.equal(aCells[1].getValue(), "Title: Two and Two", "expected title found");

			assert.equal(aCells[2].getText(), "Public", "expected sharing info found");
			assert.ok(!aCells[3].getSelected(), "expected default info found");
			assert.ok(!aCells[4].getSelected(), "expected apply automatically info found");
			assert.equal(aCells[6].getText(), "Constant Author", "expected author found");
			assert.notOk(aItems[1].getVisible(), "expected visibility found");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("Fall back to Managed Object Model for favorite binding, in case it's given as constant", async function(assert) {
		const oVariantsModel = new JSONModel({variants: [
			{variantKey: "1", variantTitlePart1: "One", variantTitlePart2: " and One", author: "A", favorite: true, visible: true}
		]});

		this.oVM.setModel(oVariantsModel);

		this.oVM.bindAggregation("items", {
			path: "/variants",
			template: new VariantItem({
				key: "{variantKey}",
				title: {parts: [{path: 'variantTitlePart1'}, {path: 'variantTitlePart2'}], formatter: (part1, part2) => `Title: ${part1}${part2}`},
				author: "Constant Author",
				favorite: true
			})
		});

		this.oVM.setDefaultKey("1");

		await nextUIUpdate();

		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function (oEvent) {

			fOriginalManageCall(oEvent);

			assert.ok(this.oVM.oManagementTable, "management table exists");

			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 1,  "expected count of items in the management table exists");

			const aCells = aItems[0].getCells();
			assert.ok(aCells, "expected cells found");
			assert.equal(aCells[0].getSrc(), "sap-icon://favorite", "expected favorite icon found");
			assert.ok(aCells[0].hasStyleClass("sapMVarMngmtFavNonInteractiveColor"), "should be inactive");

			const oBinding = aCells[0].getBinding("src");
			const favoriteModel = oBinding.getModel();
			assert.ok(favoriteModel.isA("sap.ui.model.base.ManagedObjectModel"), "expected Managed Object Model found");
			assert.equal(oBinding.getBindingMode(), BindingMode.OneWay, "OneWay binding expected");

			done();

		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function (oEvent) {

			fOriginalCall(oEvent);

			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.module("VariantManagement _findNextFocusTargetAfterDelete", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM.addItem(new VariantItem({
				key: "1",
				title: "Standard",
				favorite: true,
				remove: false
			}));
			this.oVM.addItem(new VariantItem({
				key: "2",
				title: "Item 2",
				favorite: true,
				remove: true
			}));
			this.oVM.addItem(new VariantItem({
				key: "3",
				title: "Item 3",
				favorite: false,
				remove: true
			}));
			this.oVM.addItem(new VariantItem({
				key: "4",
				title: "Item 4",
				favorite: true,
				remove: true
			}));
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("no management table returns cancel button", function(assert) {
		// Test when no management table exists
		var oVariantItem = this.oVM.getItemByKey("2");
		var oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem);

		assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when no management table exists");
	});

	QUnit.test("no variant item returns cancel button", function(assert) {
		const done = assert.async();

		// Open management dialog to create the table
		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Test with null variant item
			let oResult = this.oVM._findNextFocusTargetAfterDelete(null);
			assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when variant item is null");

			// Test with undefined variant item
			oResult = this.oVM._findNextFocusTargetAfterDelete(undefined);
			assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when variant item is undefined");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("variant not found returns cancel button", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Create a mock variant item that doesn't exist in the table
			const oMockVariantItem = {
				getKey: function() { return "nonexistent"; }
			};

			const oResult = this.oVM._findNextFocusTargetAfterDelete(oMockVariantItem);
			assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when variant item is not found in table");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("returns next visible row", function(assert) {
		const done = assert.async();

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Test deleting item "2", should return the row for item "3"
			const oVariantItem2 = this.oVM.getItemByKey("2");
			const oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem2);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			// Verify it's the correct row by checking the binding context
			const oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			const oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "3", "Should return the row for item '3'");

			done();
		}.bind(this));

		const fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			const oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("returns previous row when no next row", function(assert) {
		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Test deleting the last item "4", should return the previous row for item "3"
			var oVariantItem4 = this.oVM.getItemByKey("4");
			var oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem4);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			var oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			var oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "3", "Should return the previous row for item '3' when no next row available");

			done();
		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("returns previous row when next row is invisible", function(assert) {
		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Hide the last row (item 4) to simulate no next visible row
			var aTableItems = this.oVM.oManagementTable.getItems();
			var oRowToHide = null;

			for (var i = 0; i < aTableItems.length; i++) {
				var oRow = aTableItems[i];
				var oBindingContext = oRow.getBindingContext("$mVariants");
				if (oBindingContext) {
					var oRowItem = oBindingContext.getObject();
					if (oRowItem && oRowItem.getKey() === "4") {
						oRowToHide = oRow;
						break;
					}
				}
			}

			if (oRowToHide) {
				oRowToHide.setVisible(false);
			}

			// Test deleting item "3", should return previous row for item "2" since next row is hidden
			var oVariantItem3 = this.oVM.getItemByKey("3");
			var oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem3);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			var oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			var oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "2", "Should return the previous row for item '2' when next row is hidden");

			done();
		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("returns cancel button when only one item", function(assert) {
		var done = assert.async();

		// Remove all items except one to test the edge case
		this.oVM.removeItem(this.oVM.getItemByKey("2"));
		this.oVM.removeItem(this.oVM.getItemByKey("3"));
		this.oVM.removeItem(this.oVM.getItemByKey("4"));

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Test deleting the only remaining item "1", should return cancel button
			var oVariantItem1 = this.oVM.getItemByKey("1");
			var oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem1);

			assert.strictEqual(oResult, this.oVM.oManagementCancel, "Should return cancel button when deleting the only remaining item");

			done();
		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("skips invisible previous rows", function(assert) {
		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Hide both the next row (item 4) and immediate previous row (item 2)
			var aTableItems = this.oVM.oManagementTable.getItems();

			for (var i = 0; i < aTableItems.length; i++) {
				var oRow = aTableItems[i];
				var oBindingContext = oRow.getBindingContext("$mVariants");
				if (oBindingContext) {
					var oRowItem = oBindingContext.getObject();
					if (oRowItem && (oRowItem.getKey() === "2" || oRowItem.getKey() === "4")) {
						oRow.setVisible(false);
					}
				}
			}

			// Test deleting item "3", should skip hidden item "2" and return item "1"
			var oVariantItem3 = this.oVM.getItemByKey("3");
			var oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem3);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			var oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			var oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "1", "Should skip invisible previous row and return the next available previous row for item '1'");

			done();
		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("handles invisible rows", function(assert) {
		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Hide the next row (item 3) to test skipping invisible rows
			var aTableItems = this.oVM.oManagementTable.getItems();
			var oRowToHide = null;

			for (var i = 0; i < aTableItems.length; i++) {
				var oRow = aTableItems[i];
				var oBindingContext = oRow.getBindingContext("$mVariants");
				if (oBindingContext) {
					var oRowItem = oBindingContext.getObject();
					if (oRowItem && oRowItem.getKey() === "3") {
						oRowToHide = oRow;
						break;
					}
				}
			}

			if (oRowToHide) {
				oRowToHide.setVisible(false);
			}

			// Test deleting item "2", should skip invisible item "3" and return item "4"
			var oVariantItem2 = this.oVM.getItemByKey("2");
			var oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem2);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			var oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			var oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "4", "Should skip invisible row and return the row for item '4'");

			done();
		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.test("handles row without binding context", function(assert) {
		var done = assert.async();

		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function() {
			fOriginalManageCall();

			// Find the row for item "3" and stub its getBindingContext to return null
			var aTableItems = this.oVM.oManagementTable.getItems();
			var oRowToStub = null;

			for (var i = 0; i < aTableItems.length; i++) {
				var oRow = aTableItems[i];
				var oBindingContext = oRow.getBindingContext("$mVariants");
				if (oBindingContext) {
					var oRowItem = oBindingContext.getObject();
					if (oRowItem && oRowItem.getKey() === "3") {
						oRowToStub = oRow;
						break;
					}
				}
			}

			if (oRowToStub) {
				sinon.stub(oRowToStub, "getBindingContext").returns(null);
			}

			// Test deleting item "2", should skip item "3" (no binding context) and return item "4"
			var oVariantItem2 = this.oVM.getItemByKey("2");
			var oResult = this.oVM._findNextFocusTargetAfterDelete(oVariantItem2);

			assert.ok(oResult, "Should return a result");
			assert.ok(oResult.isA && oResult.isA("sap.m.ColumnListItem"), "Should return a ColumnListItem (table row)");

			var oResultBindingContext = oResult.getBindingContext("$mVariants");
			assert.ok(oResultBindingContext, "Result should have a binding context");

			var oResultRowItem = oResultBindingContext.getObject();
			assert.strictEqual(oResultRowItem.getKey(), "4", "Should skip row without binding context and return the row for item '4'");

			done();
		}.bind(this));

		var fOriginalCall = this.oVM._openVariantList.bind(this.oVM);
		sinon.stub(this.oVM, "_openVariantList").callsFake(async function() {
			fOriginalCall();
			await new Promise((resolve) => {setTimeout(resolve, 100);}); //wait until open triggered
			var oTarget = this.oVM.oVariantManageBtn.getFocusDomRef();
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});
		}.bind(this));

		this.oVM.onclick();
	});

	QUnit.module("VariantManagement Manage dialog busy state", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oVM.destroy();
		}
	});

	QUnit.test("check table busy state is set and cleared during management dialog opening", function(assert) {
		var done = assert.async();

		this.oVM.addItem(new VariantItem({key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		var oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			// Verify setBusy was called with true and then false
			assert.ok(oSetBusySpy.calledWith(true), "setBusy(true) should have been called");
			assert.ok(oSetBusySpy.calledWith(false), "setBusy(false) should have been called");

			// Verify the order: setBusy(true) should be called before setBusy(false)
			var bTrueCalledFirst = false;
			for (var i = 0; i < oSetBusySpy.callCount; i++) {
				if (oSetBusySpy.getCall(i).args[0] === true) {
					bTrueCalledFirst = true;
				}
				if (oSetBusySpy.getCall(i).args[0] === false && bTrueCalledFirst) {
					assert.ok(true, "setBusy(true) was called before setBusy(false)");
					break;
				}
			}

			// Verify final state is not busy
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after dialog opens");

			oSetBusySpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check table binding is suspended during busy state", function(assert) {
		var done = assert.async();

		this.oVM.addItem(new VariantItem({key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		var oSuspendSpy = sinon.spy(this.oVM, "_suspendManagementTableBinding");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			// Verify _suspendManagementTableBinding was called
			assert.ok(oSuspendSpy.calledOnce, "_suspendManagementTableBinding should have been called once");

			oSuspendSpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check busy state with rebind required", function(assert) {
		var done = assert.async();

		this.oVM.addItem(new VariantItem({key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		// Force rebind to be required
		this.oVM._bRebindRequired = true;

		var oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");
		var oRebindSpy = sinon.spy(this.oVM, "_rebindVMTable");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			// Verify setBusy was called with true and then false
			assert.ok(oSetBusySpy.calledWith(true), "setBusy(true) should have been called");
			assert.ok(oSetBusySpy.calledWith(false), "setBusy(false) should have been called");

			// Verify rebind was called
			assert.ok(oRebindSpy.called, "_rebindVMTable should have been called when _bRebindRequired is true");

			// Verify final state is not busy
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after dialog opens");

			oSetBusySpy.restore();
			oRebindSpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check busy state clears correctly when no items exist", function(assert) {
		var done = assert.async();

		// No items added - empty table scenario

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		var oSetBusySpy = sinon.spy(this.oVM.oManagementTable, "setBusy");
		var oSetNoDataSpy = sinon.spy(this.oVM.oManagementTable, "setNoData");

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			// Verify setBusy was called with true and then false
			assert.ok(oSetBusySpy.calledWith(true), "setBusy(true) should have been called");
			assert.ok(oSetBusySpy.calledWith(false), "setBusy(false) should have been called");

			// Verify setNoData was called since there are no items
			assert.ok(oSetNoDataSpy.called, "setNoData should have been called when no items exist");

			// Verify final state is not busy
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after dialog opens");

			oSetBusySpy.restore();
			oSetNoDataSpy.restore();
			this.oVM.oManagementDialog.close();
			done();
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check busy state sequence with multiple dialog openings", function(assert) {
		var done = assert.async();

		this.oVM.addItem(new VariantItem({key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		var nOpenCount = 0;

		this.oVM.oManagementDialog.attachAfterOpen(function() {
			nOpenCount++;

			// Verify final state is not busy on each open
			assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy after dialog opens (open #" + nOpenCount + ")");

			if (nOpenCount === 1) {
				// Close and reopen the dialog
				this.oVM.oManagementDialog.attachEventOnce("afterClose", function() {
					this.oVM._openManagementDialog();
				}.bind(this));
				this.oVM.oManagementDialog.close();
			} else {
				// Second opening - test complete
				this.oVM.oManagementDialog.close();
				done();
			}
		}.bind(this));

		this.oVM._openManagementDialog();
	});

	QUnit.test("check table is not busy before dialog is opened", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title: "One", author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title: "Two", author: "B"}));

		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementTable, "management table should exist");

		// Before opening the dialog, table should not be busy
		assert.ok(!this.oVM.oManagementTable.getBusy(), "table should not be busy before dialog is opened");
	});

	QUnit.module("VariantManagement Roles handling", {
		beforeEach: async function() {
			this.oVM = new VariantManagement();
			this.oVM.placeAt("qunit-fixture");
			await nextUIUpdate();

		},
		afterEach: function() {

			if (this.oCompContainer) {
				var oComponent = this.oCompContainer.getComponentInstance();
				oComponent.destroy();

				this.oCompContainer.destroy();
				this.oCompContainer = undefined;
			}

			this.oVM.destroy();
		}
	});

	QUnit.test("check roles inside managed views", async function (assert) {
		var done = assert.async();

		this.oVM.addItem(new VariantItem({key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two", contexts: {role: ["test"]}, remove: true, sharing: "Private", author: "B"}));
		this.oVM.addItem(new VariantItem({key: "3", title:"Three", favorite: true, remove: true, sharing: "Private", executeOnSelect: true, oauthor: "A"}));
		this.oVM.addItem(new VariantItem({key: "4", title:"Four", contexts: {role: []}, favorite: false, rename: false, sharing: "Public", author: "B"}));

		this.oVM.setDefaultKey("3");

		await nextUIUpdate();

		this.oVM.attachManage(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters);
			assert.ok(this.oCompContainer, "context sharing component exists");

			done();
		}.bind(this));


		assert.ok(!this.oVM.getSupportContexts());
		this.oVM.setSupportContexts(true);

		this.oVM._sStyleClass = "STYLECLASS";
		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterOpen(async function() {
			var oIcon = null;
			var oRb = this.oVM._oRb;

			assert.ok(this.oVM.getSupportContexts());

			var aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			for (var i = 0; i < aItems.length; i++) {
				var oRolesCell = aItems[i].getCells()[5];
				assert.ok(oRolesCell, "expected contexts element");

				if (i === 0) {
					 assert.ok(oRolesCell.isA("sap.m.Text"), "standard has no contexts");
				} else {
					 assert.ok(oRolesCell.isA("sap.m.HBox"), "item with contexts");

					 var oText = oRolesCell.getItems()[0];
					 if (i === 1) {
						 assert.equal(oText.getText(), oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_RESTRICTED"), "restricted expected");
						 oIcon = oRolesCell.getItems()[1];
					 } else {
						 assert.equal(oText.getText(), oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"), "non restricted expected");
					 }
				}
			}

			assert.ok(oIcon, "restricted icon");
			var oTarget = oIcon.getFocusDomRef();
			assert.ok(oTarget);
			QUnitUtils.triggerTouchEvent("click", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));


		var fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(function () {

			fOriginalManageCall();

			assert.ok(this.oVM.oManagementTable, "management table exists");

		}.bind(this));


		this.oVM._createRolesDialog();
		assert.ok(this.oVM._oRolesDialog, "roles dialog exisis");

		this.oVM._oRolesDialog.attachAfterClose(async function() {

			var oTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oTarget, "dom ref of save button of manage dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));

		this.oVM._oRolesDialog.attachAfterOpen(async function() {

			var oCancelButton = Element.getElementById(this.oVM.getId() + "-rolecancel");
			assert.ok(oCancelButton, "cancel button of roles dialog existst");

			var oTarget = oCancelButton.getFocusDomRef();
			assert.ok(oTarget, "dom ref of cancel button of roles dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

			await nextUIUpdate();

		}.bind(this));

		var fOriginalRolesCall = this.oVM._openRolesDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openRolesDialog").callsFake(function (oItem, oTextControl) {
			fOriginalRolesCall(oItem, oTextControl);
		});

		var oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then(function(oCompContainer) {
			this.oCompContainer = oCompContainer;
			//oCompContainer.getComponentInstance().getRootControl().loaded().then(function() {
				this.oVM.openManagementDialog(false, "STYLECLASS", oContextSharing);
			//}.bind(this));
		}.bind(this));

	});

	QUnit.test("check roles inside SaveAs dialog", function(assert) {
		this.oVM.addItem(new VariantItem({key: "1", title:"One"}));
		this.oVM.addItem(new VariantItem({key: "2", title:"Two"}));

		this.oVM.setSelectedKey("2");

		var done = assert.async();


		this.oVM.attachSave(function(oEvent) {
			var mParameters = oEvent.getParameters();

			assert.ok(mParameters);
			assert.ok(!mParameters.def, "default flag not expected");
			assert.ok(!mParameters.execute, "execute flag not expected");
			assert.ok(!mParameters.public, "public flag not expected");
			assert.ok(!mParameters.overwrite, "overwrite should be false");
			assert.equal(mParameters.name, "New", "name expected");
			assert.deepEqual(mParameters.contexts, {role: []}, "non restricted context expected");
		});

		this.oVM._createSaveAsDialog();
		assert.ok(this.oVM.oSaveAsDialog, "saveas dialog exists");

		this.oVM.oSaveAsDialog.attachAfterClose(function() {
			assert.ok(this.oCompContainer, "context sharing component exists");
			done();
		}.bind(this));

		this.oVM.oSaveAsDialog.attachAfterOpen(function() {

			var oTarget = this.oVM.oSaveSave.getFocusDomRef();
			assert.ok(oTarget, "dom ref of the save button inside SaveAs dialog exists");
			QUnitUtils.triggerTouchEvent("tap", oTarget, {
				srcControl: null
			});

		}.bind(this));


		var fOpenCall = this.oVM.oSaveAsDialog.open.bind(this.oVM.oSaveAsDialog);
		sinon.stub(this.oVM.oSaveAsDialog, "open").callsFake(function (sClass, oContext) {

			assert.ok(this.oVM.oInputName, "input entry should exists");
			this.oVM.oInputName.setValue("New");

			fOpenCall(sClass, oContext);
		}.bind(this));

		var oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then(function(oCompContainer) {
			this.oCompContainer = oCompContainer;
			//oCompContainer.getComponentInstance().getRootControl().loaded().then(function() {
				this.oVM.openSaveAsDialog("STYLECLASS", oContextSharing);
			//}.bind(this));
		}.bind(this));

	});

	QUnit.test("check changing roles inside SaveAs dialog", async function(assert) {
		const oRb = this.oVM._oRb;
		const done = assert.async();

		const oModel = new JSONModel({
			items: [
				{ key: "1", title:"One", rename: false, sharing: "Public", executeOnSelect: true, author: "A", visible: true },
				{ key: "2", title:"Two", contexts: {role: ["test"]}, remove: true, sharing: "Private", author: "B", visible: true },
				{ key: "3", title:"Three", contexts: {role: []}, favorite: true, remove: true, sharing: "Private", executeOnSelect: true, oauthor: "A", visible: true },
				{ key: "4", title:"Four", contexts: {role: []}, favorite: false, rename: false, sharing: "Public", author: "B", visible: true }
			]
		});
		this.oVM.setModel(oModel);

		this.oVM.bindAggregation("items", {
			path: "/items",
			template: new VariantItem({
				key: "{key}",
				title: "{title}",
				contexts: "{contexts}",
				rename: "{rename}",
				remove: "{remove}",
				favorite: "{favorite}",
				sharing: "{sharing}",
				executeOnSelect: "{executeOnSelect}"
			})
		});

		this.oVM.setDefaultKey("3");

		await nextUIUpdate();

		this.oVM.attachManage((oEvent) => {
			const mParameters = oEvent.getParameters();
			assert.ok(mParameters);
			assert.ok(this.oCompContainer, "context sharing component exists");
			done();
		});

		assert.ok(!this.oVM.getSupportContexts());
		this.oVM.setSupportContexts(true);

		this.oVM._sStyleClass = "STYLECLASS";
		this.oVM._createManagementDialog();
		assert.ok(this.oVM.oManagementDialog, "manage dialog should exists.");

		this.oVM.oManagementDialog.attachAfterOpen(async () => {
			const aItems = this.oVM.oManagementTable.getItems();
			assert.ok(aItems, "items in the management table exists");
			assert.equal(aItems.length, 4,  "expected count of items in the management table exists");

			const oItem = aItems[2]; // 3rd item
			const oRolesCell = oItem.getCells()[5];
			assert.ok(oRolesCell, "expected contexts element");
			assert.ok(oRolesCell.isA("sap.m.HBox"), "item with contexts");

			const oText = oRolesCell.getItems()[0];
			assert.equal(oText.getText(), oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"), "non restricted expected");
			const oIcon = oRolesCell.getItems()[1];

			QUnitUtils.triggerTouchEvent("click", oIcon.getFocusDomRef(), {
				srcControl: null
			});

			await nextUIUpdate();
		});

		const fOriginalManageCall = this.oVM._openManagementDialog.bind(this.oVM);
		sinon.stub(this.oVM, "_openManagementDialog").callsFake(() => {
			fOriginalManageCall();
			assert.ok(this.oVM.oManagementTable, "management table exists");
		});

		sinon.stub(this.oVM, "_openRolesDialog").callsFake(async (oItem) => {
			const oBindingContext = oItem.getBindingContext();
			assert.equal(oBindingContext.getProperty("key"), "3", "expected item for key 3");

			oBindingContext.setProperty("contexts", { role: ["test"] });
			await nextUIUpdate();

			// Close Management Dialog
			const oSaveTarget = this.oVM.oManagementSave.getFocusDomRef();
			assert.ok(oSaveTarget, "dom ref of save button of manage dialog ob tained");
			QUnitUtils.triggerTouchEvent("tap", oSaveTarget, {
				srcControl: null
			});

			await nextUIUpdate();
		});

		const oContextSharing = ContextSharingAPI.createComponent({ layer: "CUSTOMER" });
		oContextSharing.then((oCompContainer) => {
			this.oCompContainer = oCompContainer;
			this.oVM.openManagementDialog(false, "STYLECLASS", oContextSharing);
		});
	});

});