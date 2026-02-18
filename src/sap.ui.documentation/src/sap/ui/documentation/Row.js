/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/Icon'
], function(Control, Icon) {
	"use strict";

		/**
		 * @class
		 * Provides a row element for the <code>LightTable</code>.
		 * @extends sap.ui.core.Control
		 * @private
		 * @ui5-restricted sdk
		 */
		var Row = Control.extend("sap.ui.documentation.Row", {
			metadata : {
				library: "sap.ui.documentation",
				properties: {
					/**
					 * Determines whether the row is visible.
					 */
					visible: {type: "boolean", defaultValue: true},
					/**
					 * Determines whether the row is expanded (showing subRows).
					 */
					expanded: {type: "boolean", defaultValue: false},
					/**
					 * Determines whether the row can be expanded/collapsed (shows expand/collapse icon).
					 */
					expandable: {type: "boolean", defaultValue: false},
					/**
					 * The name of the typedef that this parameter refers to
					 */
					typedefName: {type : "string", defaultValue : ""}
				},
				defaultAggregation : "content",
				aggregations: {
					/**
					 * Controls to be displayed by the <code>LightTable</code>.
					 */
					content: {type: "sap.ui.core.Control", multiple: true},
					/**
					 * Sub-rows to be displayed when the row is expanded.
					 */
					subRows: {type: "sap.ui.documentation.Row", multiple: true},
					/**
					 * Internal Icon control for the expand/collapse functionality
					 */
					_expandIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
				},
				events: {
					/**
					 * Event is fired when the user clicks on the expand/collapse icon.
					 */
					expandToggle: {}
				}
			},

			/**
			 * Creates the expand/collapse icon
			 * @private
			 */
			_getExpandCollapseIcon: function() {
				if (!this.getAggregation("_expandIcon")) {
					var oExpandIcon = new Icon({
						press: function() {
							this.fireExpandToggle();
						}.bind(this)
					});

					// Add custom classes for styling
					oExpandIcon.addStyleClass("sapUiTinyMarginEnd").addStyleClass("sapUiDocTypedefExpandIcon");

					this.setAggregation("_expandIcon", oExpandIcon);

					// Update the icon appearance based on the current expanded state
					this._updateExpandIconState();
				}

				return this.getAggregation("_expandIcon");
			},

			/**
			 * Updates the expand icon state (src) based on the expanded property
			 * @private
			 */
			_updateExpandIconState: function() {
				var oExpandIcon = this.getAggregation("_expandIcon");

				if (oExpandIcon) {
					var bExpanded = this.getExpanded();
					oExpandIcon.setSrc(bExpanded ? "sap-icon://slim-arrow-down" : "sap-icon://slim-arrow-right");
				}
			},

			/**
			 * Updates the expand icon when the expanded property changes
			 */
			setExpanded: function(bExpanded) {
				this.setProperty("expanded", bExpanded, true); // Suppress rerendering
				this._updateExpandIconState();
				return this;
			},
			renderer: {
				apiVersion: 2,

				render: function(oRm, oControl) {
					var aControls = oControl.getContent(),
						aSubRows = oControl.getSubRows(),
						bExpanded = oControl.getExpanded(),
						bExpandable = oControl.getExpandable(),
						bVisible = oControl.getVisible(),
						aLen,
						a;

					// Don't render if not visible
					if (!bVisible) {
						return;
					}

					// Get column titles from parent LightTable
					var oParent = oControl.getParent(),
						aColumnTitles = oParent && oParent.getColumnTitles ? oParent.getColumnTitles() : [];

					// Render the main row
					oRm.openStart("div", oControl);
					oRm.class("row");
					if (bExpandable) {
						oRm.class(bExpanded ? "expanded" : "collapsed");
					}
					oRm.openEnd();

					// Render cells
					for (a = 0, aLen = aControls.length; a < aLen; a++) {
						oRm.openStart("div")
							.class("cell")
							.openEnd();

						// Handle inline title (for responsive view)
						if (a > 0 && aColumnTitles[a]) {
							oRm.openStart("div")
								.class("inTitle")
								.openEnd()
								.text(aColumnTitles[a] + ":")
								.close("div");
						}

						// Render the expand/collapse icon in the first cell if expandable
						if (a === 0 && bExpandable) {
							oRm.renderControl(oControl._getExpandCollapseIcon());
						}

						oRm.renderControl(aControls[a]);
						oRm.close("div");
					}

					oRm.close("div");

					// Render sub-rows if expanded
					if (bExpanded && aSubRows.length > 0) {
						for (var i = 0; i < aSubRows.length; i++) {
							oRm.renderControl(aSubRows[i]);
						}
					}
				}
			}
		});

		return Row;

});