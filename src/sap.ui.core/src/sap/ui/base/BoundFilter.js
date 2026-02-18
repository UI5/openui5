/*!
 * ${copyright}
 */

// Provides control sap.ui.base.BoundFilter.
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new BoundFilter.
	 *
	 * @param {object} [mSettings]
	 *   The settings for the control properties
	 * @param {any} [mSettings.value1]
	 *   The value for the control property <code>value1</code>
	 * @param {any} [mSettings.value2]
	 *   The value for the control property <code>value2</code>
	 * @param {sap.ui.model.Filter} oFilter
	 *   The filter instance associated with this bound filter which is cloned and replaced in the aggregation
	 *   binding on changes to <code>value1</code> or <code>value2</code>
	 * @param {sap.ui.model.ListBinding} oBinding
	 *   The aggregation binding to be filtered when one of the filter values changes
	 *
	 * @class
	 * A control referring to a <code>sap.ui.model.Filter</code> and an aggregation binding using this filter where
	 * at least one of the filter's value1 and value2 is a data binding expression. This control reflects these
	 * data bindings and is added to the control hierarchy in the "dependents" aggregation of the
	 * control which has created the aggregation binding.
	 *
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.model
	 */
	const BoundFilter = ManagedObject.extend("sap.ui.base.BoundFilter", {
		metadata : {
			library : "sap.ui.core",
			properties : {
				/**
				 * The value1 of the filter.
				 */
				value1 : {type : "any", group : "Misc", defaultValue : null},

				/**
				 * The value2 of the filter.
				 */
				value2 : {type : "any", group : "Misc", defaultValue : null}
			}
		},
		constructor : function (mSettings, oFilter, oBinding) {
			this.oFilter = oFilter;
			this.oBinding = oBinding;
			ManagedObject.call(this, mSettings);
		}
	});

	/**
	 * Returns the aggregation binding associated with this bound filter.
	 *
	 * @returns {sap.ui.model.ListBinding} The binding
	 */
	BoundFilter.prototype.getBinding = function () {
		return this.oBinding;
	};

	/**
	 * Sets <code>value1</code> of the bound filter and triggers a filter update of the aggregation binding.
	 *
	 * @param {any} vValue The new value1
	 * @returns {this} <code>this</code> to allow method chaining
	 */
	BoundFilter.prototype.setValue1 = function (vValue) {
		this.setProperty("value1", vValue);
		if (this.getBindingInfo("value1")) {
			this.oFilter = this.oBinding._updateFilter(this.oFilter, vValue, this.getValue2());
		}

		return this;
	};

	/**
	 * Sets <code>value2</code> of the bound filter and triggers a filter update of the aggregation binding.
	 *
	 * @param {any} vValue The new value2
	 * @returns {this} <code>this</code> to allow method chaining
	 */
	BoundFilter.prototype.setValue2 = function (vValue) {
		this.setProperty("value2", vValue);
		if (this.getBindingInfo("value2")) {
			this.oFilter = this.oBinding._updateFilter(this.oFilter, this.getValue1(), vValue);
		}

		return this;
	};

	return BoundFilter;
});