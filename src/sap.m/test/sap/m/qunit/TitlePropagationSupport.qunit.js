/*global QUnit */
sap.ui.define([
	"sap/m/TitlePropagationSupport",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Control",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/RenderManager"
], function (TitlePropagationSupport, ManagedObject, Control, ControlBehavior, RenderManager) {
	"use strict";

	// Custom control used for this test
	const TestControl = Control.extend("my.lib.TestControl", {
		metadata: {
			properties: {
				returnTitleId: {type: "boolean", defaultValue: true}
			},
			aggregations: {
				content: {type: "sap.ui.core.Control", multiple: true}
			}
		},
		init: function () {
			Control.prototype.init.call(this, arguments);
			this._initTitlePropagationSupport();
		},
		getTitleId: function () {
			return this.getReturnTitleId() ? this.getId() + "-Title" : undefined;
		},
		renderer: null // no renderer needed
	});

	// Add title propagation support to the test control
	TitlePropagationSupport.call(TestControl.prototype, "content", function () {
		return this.getTitleId();
	});

	QUnit.module("Generic");

	QUnit.test("Control has all needed private methods added to its prototype", (assert) => {
		assert.ok(TestControl.prototype.hasOwnProperty("_initTitlePropagationSupport"),
				"Private method _initTitlePropagationSupport added to control");
		assert.ok(TestControl.prototype.hasOwnProperty("_propagateTitleIdToChildControl"),
				"Private method _propagateTitleIdToChildControl added to control");
	});

	QUnit.test("TitlePropagationSupport does not enrich a non-element ManagedObject", (assert) => {
		// Arrange
		const TestObject = ManagedObject.extend("my.lib.TestObject");
		TitlePropagationSupport.call(TestObject.prototype, "", function () {return this.getId();});

		// Assert
		assert.notOk(Object.hasOwn(TestObject.prototype, "_initTitlePropagationSupport"),
				"Private method _initTitlePropagationSupport was not added to control");
		assert.notOk(Object.hasOwn(TestObject.prototype, "_propagateTitleIdToChildControl"),
				"Private method _propagateTitleIdToChildControl was not added to control");
		assert.strictEqual(TestObject.aDelegates, undefined, "No delegates added to control");
	});

	QUnit.module("Delegate", {
		beforeEach: function () {
			this.oControl = new TestControl();
		},
		afterEach: function () {
			this.oControl.destroy();
			this.oControl = null;
		}
	});

	QUnit.test("Delegate is added to the test control instance on creation", function (assert) {
		assert.strictEqual(this.oControl.aDelegates.length, 1,
				"The control instance has one delegate attached");
	});

	QUnit.module("Propagation", {
		beforeEach: function () {
			this.oTC = new TestControl();
		},
		afterEach: function () {
			this.oSuggestSpy?.restore();
			this.oSuggestSpy = null;
			this.oTC.destroy();
			this.oTC = null;
		},
		getTitleID: function () {
			return this.oTC.getTitleId();
		},
		getMockedControl: function (sMockedControlType, bSuggestTitleSupported) {
			// Using sap.ui.core.Control here to not introduce unneeded dependency to another library
			const oControl = new Control();

			// Mock "isA" method on the instance
			oControl.isA = function (aTypes) {
				return aTypes.indexOf(sMockedControlType) >= 0 || Control.prototype.isA.apply(this, arguments);
			};

			// Mock _suggestTitleId method on the instance
			if (bSuggestTitleSupported) {
				oControl._suggestTitleId = function () {};
				this.oSuggestSpy = bSuggestTitleSupported && this.spy(oControl, "_suggestTitleId");
			}

			return oControl;
		},
		assertWithMockControlOfType: function (assert, sType, bSuggestTitleSupported, bNegative) {
			// Arrange
			const oMockedControl = this.getMockedControl(sType, bSuggestTitleSupported);
			const sTitleID = this.getTitleID();

			this.oTC.removeAllContent(); // Make sure we don't have any leftover content from the last test
			this.oTC.addContent(oMockedControl);

			// Act - We have to actually render the control because delegates will not be called if
			// onBeforeRendering method is called directly
			new RenderManager().renderControl(this.oTC);

			// Assert
			if (!bNegative) {
				assert.strictEqual(this.oSuggestSpy.callCount, 1,
						"Suggest method is called once for control of type " + sType);
				assert.ok(this.oSuggestSpy.calledWithMatch({id: sTitleID}),
						"Suggest method on " + sType + " is called with object containing the expected title ID: " +
						sTitleID);
			} else if (bSuggestTitleSupported) {
				assert.strictEqual(this.oSuggestSpy.callCount, 0,
						"The method should not be called for a control of type " + sType);
			}

			// Cleanup
			oMockedControl.destroy();
		}
	});

	QUnit.test("Title ID is propagated to a child control of a supported type", function (assert) {
		// Assert
		this.assertWithMockControlOfType(assert, "sap.ui.layout.form.SimpleForm", true, false);
		this.assertWithMockControlOfType(assert, "sap.ui.layout.form.Form", true, false);
		this.assertWithMockControlOfType(assert, "sap.ui.comp.smartform.SmartForm", true, false);
		this.assertWithMockControlOfType(assert, "sap.m.Button", false, true /* Negative test */);
	});

	QUnit.test("_propagateTitleIdToChildControl returns false when no content or no title ID is present", function (assert) {
		const oMockedControl = this.getMockedControl("sap.ui.layout.form.SimpleForm", true);
		let bResult;

		// Assert
		assert.notOk(this.oTC._propagateTitleIdToChildControl(),
				"Method called on a control with no content should return false");

		// Act - add content
		this.oTC.addContent(oMockedControl);
		this.oTC.setReturnTitleId(false); // In this case this.oTC.getTitleId() should return undefined
		bResult = this.oTC._propagateTitleIdToChildControl();

		// Assert
		assert.notOk(bResult,
				"Method called on a control with content but without a ID should return false");
		assert.strictEqual(this.oSuggestSpy.callCount, 0,
				"Suggest method should not be called when propagate method is called without ID");

		// Act - reset the spy and call suggest method with ID when there is a content in the control
		this.oSuggestSpy.resetHistory();
		this.oTC.setReturnTitleId(true); // In this case this.oTC.getTitleId() should return ID
		bResult = this.oTC._propagateTitleIdToChildControl();

		assert.ok(bResult,
				"Method called on a control with content and with ID should return true");
		assert.strictEqual(this.oSuggestSpy.callCount, 1,
				"Suggest method should be called once to propagate ID");

		// Cleanup
		oMockedControl.destroy();
	});

	QUnit.test("_propagateTitleIdToChildControl respects accessibility mode when propagating title ID", function (assert) {
		// Arrange
		let oStub = this.stub(ControlBehavior, "isAccessibilityEnabled").returns(true);
		const oMockedControl = this.getMockedControl("sap.ui.layout.form.SimpleForm", true);
		let bResult;

		// Act - add content to control and call method
		this.oTC.addContent(oMockedControl);
		bResult = this.oTC._propagateTitleIdToChildControl();

		// Assert
		assert.ok(bResult, "Method called with ACC on should return 'true'");

		// Arrange
		oStub.restore();
		oStub = this.stub(ControlBehavior, "isAccessibilityEnabled").returns(false);

		// Act - call method again
		bResult = this.oTC._propagateTitleIdToChildControl();

		// Assert
		assert.notOk(bResult, "Method called with ACC off should return 'false'");

		// Cleanup
		oMockedControl.destroy();
	});

});
