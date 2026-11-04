/* global QUnit */
sap.ui.define([
	"sap/m/IconTabFilter",
	"sap/m/IconTabBar",
	"sap/m/Button",
	"sap/base/i18n/Localization",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/thirdparty/sinon-4"
], function (
	IconTabFilter,
	IconTabBar,
	Button,
	Localization,
	nextUIUpdate,
	elementDesigntimeTest,
	elementActionTest,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.IconTabFilter",
			create: function () {
				return new IconTabFilter({
					text: "Old Text"
				});
			}
		});
	})
	.then(function() {
		// Rename title action module
		var fnConfirmFilterTextRenamedWithNewValue = function (oRadioButton, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("filter").getText(),
				"New Text",
				"then the filter title has been renamed to the new value (New Text)");
		};

		var fnConfirmFilterTextIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("filter").getText(),
				"Old Text",
				"then the filter title has been renamed to the old value (Old Text)");
		};

		elementActionTest("Checking the rename action for a IconTabFilter title", {
			xmlView:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<IconTabBar id="bar">' +
						'<items>' +
							'<IconTabFilter id="filter" text="Old Text" />' +
						'</items>' +
					'</IconTabBar>' +
				'</mvc:View>',
			action: {
				name: "rename",
				controlId: "filter",
				parameter: function (oView) {
					return {
						newValue: "New Text",
						renamedElement: oView.byId("filter")
					};
				}
			},
			afterAction: fnConfirmFilterTextRenamedWithNewValue,
			afterUndo: fnConfirmFilterTextIsRenamedWithOldValue,
			afterRedo: fnConfirmFilterTextRenamedWithNewValue
		});
	})
	.then(function() {
		// The flush first/last tab of an IconTabHeader drops its outer padding, so RTA overlays
		// are drawn flush against the content on that edge. The designtime metadata opts those
		// tabs into the generic sap.ui.dt "overlayOutsets" capability by returning the physical
		// side(s) to grow the overlay outward on; middle tabs return undefined (no outset).
		QUnit.module("IconTabFilter overlayOutsets designtime metadata", {
			async beforeEach() {
				this.oBar = new IconTabBar({
					expanded: true,
					items: [
						new IconTabFilter({ text: "First" }),
						new IconTabFilter({ text: "Middle" }),
						new IconTabFilter({ text: "Last" })
					]
				});
				this.oBar.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.aFilters = this.oBar.getItems();
				const oDesignTime = await this.aFilters[0].getMetadata().loadDesignTime();
				this.fnOverlayOutsets = oDesignTime.overlayOutsets;
			},
			afterEach() {
				this.oBar.destroy();
				sandbox.restore();
			}
		}, function() {
			QUnit.test("overlayOutsets is a function declared by the designtime metadata", function(assert) {
				assert.strictEqual(typeof this.fnOverlayOutsets, "function", "overlayOutsets is exposed as a function");
			});

			QUnit.test("first / middle / last tab outsets (LTR)", function(assert) {
				sandbox.stub(Localization, "getRTL").returns(false);
				assert.deepEqual(this.fnOverlayOutsets(this.aFilters[0]), { left: 16 }, "first tab grows outward on the left (its flush edge)");
				assert.strictEqual(this.fnOverlayOutsets(this.aFilters[1]), undefined, "middle tab has no outset");
				assert.deepEqual(this.fnOverlayOutsets(this.aFilters[2]), { right: 16 }, "last tab grows outward on the right (its flush edge)");
			});

			QUnit.test("first / last tab outsets mirror in RTL", function(assert) {
				sandbox.stub(Localization, "getRTL").returns(true);
				assert.deepEqual(this.fnOverlayOutsets(this.aFilters[0]), { right: 16 }, "first (leading) tab grows outward on the physical right in RTL");
				assert.deepEqual(this.fnOverlayOutsets(this.aFilters[2]), { left: 16 }, "last (trailing) tab grows outward on the physical left in RTL");
			});

			QUnit.test("an unrendered tab yields no outset", function(assert) {
				const oDetached = new IconTabFilter({ text: "Detached" });
				assert.strictEqual(this.fnOverlayOutsets(oDetached), undefined, "a tab without a DOM reference has no outset");
				oDetached.destroy();
			});
		});
	});

});