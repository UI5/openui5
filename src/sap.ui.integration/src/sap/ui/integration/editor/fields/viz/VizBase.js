/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/base/util/merge"
], function (
	Control, SegmentedButton, SegmentedButtonItem, merge
) {
	"use strict";

	/**
	 * @class Visualization Base Control
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.editor.fields.viz.VizBase
	 * @author SAP SE
	 * @since 1.105.0
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 *
	 * <h3>Subclassing Best Practices</h3>
	 * <p>
	 * VizBase provides a base implementation for visualization controls using the semantic rendering API (apiVersion: 2).
	 * </p>
	 * <p>
	 * Subclasses should:
	 * <ul>
	 * <li>Set <code>apiVersion: 2</code> in the renderer definition</li>
	 * <li>Only use semantic rendering APIs (e.g., <code>oRm.class()</code>, <code>oRm.style()</code>) in the <code>applyStyle</code> method</li>
	 * <li>Avoid using deprecated string-based rendering APIs (e.g., <code>oRm.addClass()</code>, <code>oRm.writeClasses()</code>,
	 *  <code>oRm.addStyle()</code>, <code>oRm.writeStyles()</code>)</li>
	 * </ul>
	 * </p>
	 */
	var VizBase = Control.extend("sap.ui.integration.editor.fields.viz.VizBase", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				value: {
					type: "string",
					defaultValue: ""
				},
				editable: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				_control: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oVizControl) {
				var oControl = oVizControl.getAggregation("_control");
				oRm.openStart("div", oVizControl);
				oVizControl.applyStyle(oRm);
				oRm.openEnd();
				oRm.renderControl(oControl);
				oRm.close("div");
			}
		}
	});

	VizBase.prototype.init = function () {
		this.onInit();
		this.setAggregation("_control", this._oControl);
	};

	VizBase.prototype.bindProperty = function (sProperty, oBindingInfo) {
		Control.prototype.bindProperty.apply(this, arguments);
		this.bindPropertyToControl(sProperty, oBindingInfo);
		return this;
	};

	// create this._oControl and set up it
	VizBase.prototype.onInit = function () {
	};

	// add style class to the render manager
	VizBase.prototype.applyStyle = function (oRm) {
	};

	// bind propety to this._oControl
	VizBase.prototype.bindPropertyToControl = function (sProperty, oBindingInfo) {
	};

	return VizBase;
});