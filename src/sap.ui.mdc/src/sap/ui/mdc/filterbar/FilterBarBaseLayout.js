/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/mdc/mixin/FilterBarLayoutMixin",
	"./FilterBarBaseLayoutRenderer"
], (
	Control,
	FilterBarLayoutMixin,
	FilterBarBaseLayoutRenderer
) => {
	"use strict";

	/**
	 * Constructor for a new FilterBarBaseLayout.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The <code>FilterBarBaseLayout</code> is a base layout control for filter bar implementations.
	 * It provides common functionality for filter bar layouts and serves as a foundation for specific
	 * filter bar layout implementations.
	 * @extends sap.ui.core.Control
	 * @mixins sap.ui.mdc.mixin.FilterBarLayoutMixin
	 * @constructor
	 * @private
	 * @since 1.144
	 * @alias sap.ui.mdc.filterbar.FilterBarBaseLayout
	 */
	const FilterBarBaseLayout = Control.extend("sap.ui.mdc.filterbar.FilterBarBaseLayout", {
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},
				buttons: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		},

		renderer: FilterBarBaseLayoutRenderer,

		init: function() {
			Control.prototype.init.apply(this, arguments);

			FilterBarLayoutMixin.call(FilterBarBaseLayout.prototype, {
				_getFilterItems: function() {
					return this.getParent()?.getFilterFields?.() ?? this.getContent();
				},
				_getButtons: function() {
					return this.getButtons();
				}
			});
		},

		onBeforeRendering: function() {
			this._deregisterResizeHandlers();
		},

		onAfterRendering: function() {
			this._registerResizeHandlers();
			this._onResize();
		},

		exit: function() {
			Control.prototype.exit.apply(this, arguments);
		}
	});

	return FilterBarBaseLayout;
});