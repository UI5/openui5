/*global QUnit */
sap.ui.define([
	"sap/m/designtime/ObjectHeader.designtime",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/Button",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	ObjectHeaderDesigntime,
	IconTabBar,
	IconTabFilter,
	Button,
	elementActionTest
) {
	"use strict";

	// ---------------------------------------------------------------------------------------------
	// Unit test: the ObjectHeader propagates itself as relevant container only for the tab strip of
	// an embedded IconTabBar, so that self-contained content (e.g. a Form) keeps its own relevant
	// container and can still resolve its delegate for the "add via delegate" action.
	// ---------------------------------------------------------------------------------------------
	QUnit.module("sap.m.ObjectHeader designtime - propagateRelevantContainer");

	function getPropagateRelevantContainer() {
		return ObjectHeaderDesigntime.aggregations.headerContainer.propagateRelevantContainer;
	}

	QUnit.test("is a function so it can be evaluated per element", function (assert) {
		assert.strictEqual(typeof getPropagateRelevantContainer(), "function",
			"then headerContainer.propagateRelevantContainer is a function");
	});

	QUnit.test("propagates the ObjectHeader as relevant container for the IconTabBar tab strip", function (assert) {
		const fnPropagate = getPropagateRelevantContainer();
		const oIconTabBar = new IconTabBar();
		const oIconTabFilter = new IconTabFilter();

		assert.strictEqual(fnPropagate(oIconTabBar), true,
			"then the IconTabBar itself gets the ObjectHeader as relevant container (needed for the tab move)");
		assert.strictEqual(fnPropagate(oIconTabFilter), true,
			"then an IconTabFilter (tab) gets the ObjectHeader as relevant container (needed for the tab move)");

		oIconTabBar.destroy();
		oIconTabFilter.destroy();
	});

	QUnit.test("does not propagate the ObjectHeader as relevant container for tab content", function (assert) {
		const fnPropagate = getPropagateRelevantContainer();
		const oButton = new Button();

		assert.strictEqual(fnPropagate(oButton), false,
			"then a content control keeps its own relevant container "
			+ "(e.g. a Form can still resolve its delegate for 'add via delegate')");

		oButton.destroy();
	});

	// ---------------------------------------------------------------------------------------------
	// elementActionTest: moving an IconTabFilter of an IconTabBar that is embedded in an ObjectHeader
	// must keep working (relevant container = ObjectHeader, due to the special embedded rendering).
	// ---------------------------------------------------------------------------------------------
	const fnGetView = function (sObjectHeaderId, sTabBarId) {
		return '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<ObjectHeader id="' + sObjectHeaderId + '" responsive="true">' +
				'<headerContainer>' +
					'<IconTabBar id="' + sTabBarId + '">' +
						'<items>' +
							'<IconTabFilter id="first" key="firstTab" text="First Tab"/>' +
							'<IconTabFilter id="second" key="secondTab" text="Second Tab"/>' +
							'<IconTabFilter id="third" key="thirdTab" text="Third Tab"/>' +
						'</items>' +
					'</IconTabBar>' +
				'</headerContainer>' +
			'</ObjectHeader>' +
		'</mvc:View>';
	};

	const fnConfirmItemPosition = function (sTabBarId, iPosition, sMovedElementId) {
		return function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId(sMovedElementId).getId(),
				oViewAfterAction.byId(sTabBarId).getItems()[iPosition].getId(),
				"then the IconTabFilter has been moved to the expected position");
		};
	};

	elementActionTest("Checking the move action for an IconTabFilter of an IconTabBar inside an ObjectHeader", {
		xmlView: fnGetView("objectHeader", "tabbar"),
		action: {
			name: "move",
			controlId: "tabbar",
			parameter: function (oView) {
				return {
					movedElements: [{
						element: oView.byId("first"),
						sourceIndex: 0,
						targetIndex: 2
					}],
					source: {
						aggregation: "items",
						parent: oView.byId("tabbar"),
						publicAggregation: "items",
						publicParent: oView.byId("tabbar")
					},
					target: {
						aggregation: "items",
						parent: oView.byId("tabbar"),
						publicAggregation: "items",
						publicParent: oView.byId("tabbar")
					}
				};
			}
		},
		afterAction: fnConfirmItemPosition("tabbar", 2, "first"),
		afterUndo: fnConfirmItemPosition("tabbar", 0, "first"),
		afterRedo: fnConfirmItemPosition("tabbar", 2, "first")
	});
});
