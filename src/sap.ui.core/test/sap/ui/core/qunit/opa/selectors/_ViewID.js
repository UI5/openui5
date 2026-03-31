/*global QUnit */
sap.ui.define([
	"sap/ui/test/selectors/_ControlSelectorGenerator",
	"sap/ui/thirdparty/jquery",
	"sap/m/Button",
	'sap/ui/core/Element',
	'sap/ui/core/mvc/XMLView',
	"sap/ui/test/utils/nextUIUpdate"
], function (_ControlSelectorGenerator, $, Button, Element, XMLView, nextUIUpdate) {
	"use strict";

	QUnit.module("_ViewID", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return Promise.all([
				XMLView.create({
					id: "myView",
					definition: createViewContent("myView")
				}),
				XMLView.create({
					definition: createViewContent("myViewWithoutId")
				})
			]).then(function(aViews) {
				this.oButton = new Button("myButton");
				this.oButton.placeAt("qunit-fixture");
				this.oViewWithId = aViews[0].placeAt("qunit-fixture");
				this.oViewNoId = aViews[1].placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oViewWithId.destroy();
			this.oViewNoId.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Should generate selector for control in a view with stable ID", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({control: Element.closestTo("#myView form input"), includeAll: true})
			.then(function (aSelector) {
				var mViewIdSelector = aSelector[1][0];
				assert.strictEqual(mViewIdSelector.viewId, "myView", "Should generate selector with viewName");
				assert.strictEqual(mViewIdSelector.id, "mySearch", "Should generate selector with ID");
				assert.ok(!mViewIdSelector.controlType, "Should not include controlType matcher");
			}).finally(fnDone);
	});

	QUnit.test("Should generate selector for control in a view with stable ID, including also the viewName", function (assert) {
		var fnDone = assert.async();

		_ControlSelectorGenerator._generate({control: Element.closestTo("#myView form input"), includeAll: true})
			.then(function (aSelector) {
				var mViewIdSelector = aSelector[2][0];
				assert.strictEqual(mViewIdSelector.viewId, "myView", "Should generate selector with viewID");
				assert.strictEqual(mViewIdSelector.viewName, "myView", "Should generate selector with ViewName");
			}).finally(fnDone);
	});

	QUnit.test("Should generate selector for control with stable ID in any view", function (assert) {
		var fnDone = assert.async();
		var $view = $(".sapUiView").filter(function (i, $elem) {
			return $elem.id !== "myView";
		});
		_ControlSelectorGenerator._generate({control: $view[0] ? Element.closestTo($view[0].querySelector("form input")) : undefined, includeAll: true})
			.then(function (aSelector) {
				var mViewIdSelector = aSelector[0][0];
				assert.strictEqual(mViewIdSelector.viewName, "myViewWithoutId", "Should generate selector with viewName");
				assert.strictEqual(mViewIdSelector.id, "mySearch", "Should generate selector with ID");
				assert.ok(!mViewIdSelector.controlType, "Should not include controlType matcher");
			}).finally(fnDone);
	});

	QUnit.test("Should not generate selector for control with generated ID", function (assert) {
		var fnDone = assert.async();
		var aDomNodes = document.querySelectorAll("#myView form input");
		_ControlSelectorGenerator._generate({control: Element.closestTo(aDomNodes[1]), includeAll: true, shallow: true})
			.then(function (aSelector) {
				assert.ok(!hasViewIdSelector(aSelector), "Should not generate selector");
			}).finally(fnDone);
	});

	QUnit.test("Should not generate selector for control with no view", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({control: this.oButton, includeAll: true, shallow: true})
			.then(function (aSelector) {
				assert.ok(!hasViewIdSelector(aSelector), "Should not generate selector");
			}).finally(fnDone);
	});

	QUnit.test("Should generate selector with viewName (not viewId) when preferViewNameAsViewLocator is true", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({
			control: Element.closestTo("#myView form input"),
			includeAll: true,
			settings: { preferViewNameAsViewLocator: true }
		}).then(function (aSelector) {
			var mViewIdSelector = aSelector[1][0];
			assert.strictEqual(mViewIdSelector.viewName, "myView", "Should use viewName as locator");
			assert.ok(!mViewIdSelector.viewId, "Should not include viewId");
			assert.strictEqual(mViewIdSelector.id, "mySearch", "Should have relative ID");
		}).finally(fnDone);
	});

	QUnit.test("Should still generate selector with viewId when preferViewNameAsViewLocator is false", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({
			control: Element.closestTo("#myView form input"),
			includeAll: true,
			settings: { preferViewNameAsViewLocator: false }
		}).then(function (aSelector) {
			var mViewIdSelector = aSelector[1][0];
			assert.strictEqual(mViewIdSelector.viewId, "myView", "Should use viewId as locator");
			assert.ok(!mViewIdSelector.viewName, "Should not include viewName");
		}).finally(fnDone);
	});

	QUnit.test("Should generate selector for private sub-control with hyphen in ID when preferViewNameAsViewLocator is true", function (assert) {
		var fnDone = assert.async();
		// page1-intHeader is a private sub-control of the Page; its view-relative ID contains a hyphen
		var oInternalHeader = Element.closestTo(document.getElementById("myView--page1-intHeader"));
		_ControlSelectorGenerator._generate({
			control: oInternalHeader,
			includeAll: true,
			settings: { preferViewNameAsViewLocator: true }
		}).then(function (aSelector) {
			// _GlobalID is at index 0; _ViewID is at index 1
			var mViewIdSelector = aSelector[1][0];
			assert.strictEqual(mViewIdSelector.viewName, "myView", "Should use viewName as locator");
			assert.strictEqual(mViewIdSelector.id, "page1-intHeader", "Should include sub-control with hyphen in ID");
			assert.ok(!mViewIdSelector.viewId, "Should not include viewId");
		}).finally(fnDone);
	});

	QUnit.test("Should not generate selector for private sub-control with hyphen in ID by default", function (assert) {
		var fnDone = assert.async();
		var oInternalHeader = Element.closestTo(document.getElementById("myView--page1-intHeader"));
		_ControlSelectorGenerator._generate({
			control: oInternalHeader,
			includeAll: true,
			shallow: true
		}).then(function (aSelector) {
			assert.ok(!hasViewIdSelector(aSelector), "Should not generate selector for sub-control with hyphen");
		}).finally(fnDone);
	});

	QUnit.test("Should generate selector with viewName when preferViewNameAsViewLocator is true and view ID is generated", function (assert) {
		var fnDone = assert.async();
		var $view = $(".sapUiView").filter(function (i, $elem) {
			return $elem.id !== "myView";
		});
		_ControlSelectorGenerator._generate({
			control: $view[0] ? Element.closestTo($view[0].querySelector("form input")) : undefined,
			includeAll: true,
			settings: { preferViewNameAsViewLocator: true }
		}).then(function (aSelector) {
			var mViewIdSelector = aSelector[0][0];
			assert.strictEqual(mViewIdSelector.viewName, "myViewWithoutId", "Should use viewName");
			assert.ok(!mViewIdSelector.viewId, "Should not include viewId");
		}).finally(fnDone);
	});

	QUnit.module("_ViewID - separateViewNamespace", {
		beforeEach: function (assert) {
			return Promise.all([
				XMLView.create({
					id: "nsView",
					definition: createViewContent("sap.my.app.namespace.MyView")
				}),
				XMLView.create({
					id: "myView2",
					definition: createViewContent("myView2")
				})
			]).then(function (aViews) {
				this.oViewWithNamespace = aViews[0].placeAt("qunit-fixture");
				this.oViewNoDots = aViews[1].placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function (oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oViewWithNamespace.destroy();
			this.oViewNoDots.destroy();
		}
	});

	QUnit.test("Should split viewName into viewNamespace and viewName when separateViewNamespace is true", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({
			control: Element.closestTo("#nsView form input"),
			includeAll: true,
			settings: { preferViewNameAsViewLocator: true, separateViewNamespace: true }
		}).then(function (aSelector) {
			var mViewIdSelector = aSelector[1][0];
			assert.strictEqual(mViewIdSelector.viewName, "MyView", "Should have short viewName");
			assert.strictEqual(mViewIdSelector.viewNamespace, "sap.my.app.namespace", "Should have viewNamespace");
			assert.strictEqual(mViewIdSelector.id, "mySearch", "Should have relative ID");
			assert.ok(!mViewIdSelector.viewId, "Should not include viewId");
		}).finally(fnDone);
	});

	QUnit.test("Should keep full viewName when separateViewNamespace is false", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({
			control: Element.closestTo("#nsView form input"),
			includeAll: true,
			settings: { preferViewNameAsViewLocator: true, separateViewNamespace: false }
		}).then(function (aSelector) {
			var mViewIdSelector = aSelector[1][0];
			assert.strictEqual(mViewIdSelector.viewName, "sap.my.app.namespace.MyView", "Should have full viewName");
			assert.ok(!mViewIdSelector.viewNamespace, "Should not have separate viewNamespace");
		}).finally(fnDone);
	});

	QUnit.test("Should not add viewNamespace when viewName has no dots", function (assert) {
		var fnDone = assert.async();
		_ControlSelectorGenerator._generate({
			control: Element.closestTo("#myView2 form input"),
			includeAll: true,
			settings: { preferViewNameAsViewLocator: true, separateViewNamespace: true }
		}).then(function (aSelector) {
			var mViewIdSelector = aSelector[1][0];
			assert.strictEqual(mViewIdSelector.viewName, "myView2", "Should keep viewName as-is");
			assert.ok(!mViewIdSelector.viewNamespace, "Should not add viewNamespace for non-dotted name");
		}).finally(fnDone);
	});

	function createViewContent (sViewName) {
		return '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" viewName="' + sViewName + '">' +
			'<App id="myApp">' +
				'<Page id="page1">' +
					'<SearchField id="mySearch" placeholder="Test"></SearchField>' +
					'<SearchField placeholder="Placeholder"></SearchField>' +
				'</Page>' +
			'</App>' +
		'</mvc:View>';
	}

	function hasViewIdSelector(aSelectors) {
		return aSelectors.filter(function (aSelectorsOfType) {
			return aSelectorsOfType.filter(function (mSelector) {
				return (mSelector.viewName || mSelector.viewId) && mSelector.id && Object.keys(mSelector).length === 2;
			}).length;
		}).length;
	}
});
