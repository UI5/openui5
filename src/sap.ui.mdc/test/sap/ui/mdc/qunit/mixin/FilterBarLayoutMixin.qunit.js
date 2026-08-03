/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/mixin/FilterBarLayoutMixin"
], function(
	FilterBarLayoutMixin
) {
	"use strict";

	/**
	 * Builds a lightweight object that carries the mixin methods and returns a
	 * mocked FilterBar DOM structure from <code>getDomRef</code>.
	 *
	 * The dimensions of the buttons area and of the first / last filter item are
	 * configurable, since <code>_onNonAdvancedModeResize</code> decides the
	 * buttons area's <code>margin-top</code> purely from their
	 * <code>getBoundingClientRect</code> values.
	 *
	 * @param {object} mDims Configuration for the mocked dimensions
	 * @returns {object} The instance carrying the mixin methods plus its mocked <code>oButtons</code> element
	 */
	const fnCreateInstance = function(mDims) {
		const oButtons = {
			className: "sapUiMdcFilterBarLayoutButtons",
			style: "existing",
			getBoundingClientRect: function() {
				return mDims.buttons;
			}
		};
		const oFirstItem = {
			className: "sapUiMdcFilterBarLayoutItem",
			getBoundingClientRect: function() {
				return mDims.firstItem;
			}
		};
		const oLastItem = {
			className: "sapUiMdcFilterBarLayoutItem",
			getBoundingClientRect: function() {
				return mDims.lastItem;
			}
		};
		const aItems = mDims.singleItem ? [oFirstItem] : [oFirstItem, oLastItem];

		const oFB = {
			offsetHeight: 100,
			classList: {
				_set: new Set(),
				add: function(sClass) {
					this._set.add(sClass);
				},
				remove: function(sClass) {
					this._set.delete(sClass);
				},
				contains: function(sClass) {
					return this._set.has(sClass);
				}
			},
			querySelector: function(sSelector) {
				if (sSelector.indexOf("Buttons") >= 0) {
					return oButtons;
				}
				return null; // no basic search
			},
			querySelectorAll: function() {
				return aItems;
			}
		};

		const oInstance = {
			getDomRef: function() {
				return oFB;
			}
		};

		FilterBarLayoutMixin.call(oInstance, {});
		return { oInstance, oButtons, oFB };
	};

	QUnit.module("_onNonAdvancedModeResize - buttons covering filters (DINC0956364)");

	QUnit.test("applies negative margin-top when items fill the row and buttons sit right of the last item", function(assert) {
		// first and last item have equal width and span the whole row, buttons are to the right of the last item
		const { oInstance, oButtons } = fnCreateInstance({
			buttons: { x: 900, height: 40 },
			firstItem: { x: 0, width: 400, height: 40, y: 0 },
			lastItem: { x: 420, width: 400, height: 40, y: 0 }
		});

		oInstance._onNonAdvancedModeResize();

		assert.strictEqual(oButtons.style, "margin-top: -40px", "buttons area gets a negative margin-top equal to the last item's height");
	});

	QUnit.test("clears the margin-top when the last item is narrower than the first (fix: no covering)", function(assert) {
		// buttons sit right of the last item (would normally trigger the negative margin), but the
		// last item is narrower than the first item -> the items do not fill the row, so no margin
		const { oInstance, oButtons } = fnCreateInstance({
			buttons: { x: 900, height: 40 },
			firstItem: { x: 0, width: 400, height: 40, y: 0 },
			lastItem: { x: 420, width: 200, height: 40, y: 0 }
		});

		oInstance._onNonAdvancedModeResize();

		assert.strictEqual(oButtons.style, "", "buttons area keeps no margin-top so it cannot cover the filters");
	});

	QUnit.test("keeps no margin-top when the buttons area overlaps the last item horizontally", function(assert) {
		// buttons are not to the right of the last item -> the initial condition is not met
		const { oInstance, oButtons } = fnCreateInstance({
			buttons: { x: 300, height: 40 },
			firstItem: { x: 0, width: 400, height: 40, y: 0 },
			lastItem: { x: 420, width: 400, height: 40, y: 20 }
		});

		oInstance._onNonAdvancedModeResize();

		assert.strictEqual(oButtons.style, "", "buttons area gets no margin-top");
	});

	QUnit.module("_onNonAdvancedModeResize - one line marker");

	QUnit.test("adds the one-line class when first and last item share the same vertical position", function(assert) {
		const { oInstance, oFB } = fnCreateInstance({
			buttons: { x: 900, height: 40 },
			firstItem: { x: 0, width: 400, height: 40, y: 0 },
			lastItem: { x: 420, width: 400, height: 40, y: 0 }
		});

		oInstance._onNonAdvancedModeResize();

		assert.ok(oFB.classList.contains("sapUiMdcFilterBarLayoutOneLine"), "one-line class is added");
	});

	QUnit.test("removes the one-line class when items wrap to different rows", function(assert) {
		const { oInstance, oFB } = fnCreateInstance({
			buttons: { x: 900, height: 40 },
			firstItem: { x: 0, width: 400, height: 40, y: 0 },
			lastItem: { x: 0, width: 400, height: 40, y: 40 }
		});
		oFB.classList.add("sapUiMdcFilterBarLayoutOneLine"); // pretend it was one line before

		oInstance._onNonAdvancedModeResize();

		assert.notOk(oFB.classList.contains("sapUiMdcFilterBarLayoutOneLine"), "one-line class is removed when items wrap");
	});

	QUnit.module("_onNonAdvancedModeResize - guards");

	QUnit.test("does nothing when the FilterBar is not rendered (offsetHeight 0)", function(assert) {
		const { oInstance, oButtons, oFB } = fnCreateInstance({
			buttons: { x: 900, height: 40 },
			firstItem: { x: 0, width: 400, height: 40, y: 0 },
			lastItem: { x: 420, width: 400, height: 40, y: 0 }
		});
		oFB.offsetHeight = 0;

		oInstance._onNonAdvancedModeResize();

		assert.strictEqual(oButtons.style, "existing", "buttons area style is left untouched");
	});
});
