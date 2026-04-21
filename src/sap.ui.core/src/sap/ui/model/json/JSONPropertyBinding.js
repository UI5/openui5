/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the JSON model implementation of a property binding
sap.ui.define([
	'sap/ui/model/ChangeReason',
	'sap/ui/model/ClientPropertyBinding',
	"sap/base/util/deepEqual"
],
	function(ChangeReason, ClientPropertyBinding, deepEqual) {
	"use strict";


	/**
	 * @class Property binding implementation for JSON model.
	 * @hideconstructor
	 * @protected
	 * @alias sap.ui.model.json.JSONPropertyBinding
	 * @extends sap.ui.model.ClientPropertyBinding
	 */
	var JSONPropertyBinding = ClientPropertyBinding.extend("sap.ui.model.json.JSONPropertyBinding", /** @lends sap.ui.model.json.JSONPropertyBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, mParameters){
			ClientPropertyBinding.apply(this, arguments);
			if (this.isRelative()) {
				this.sPreviousResolvedPath = this.getResolvedPath();
			}
		}

	});

	/**
	 * Sets the value for this <code>JSONPropertyBinding</code> if the binding is not suspended.
	 * If a new value is set, an {@link sap.ui.model.Model#propertyChange} event is fired with change reason
	 * {@link sap.ui.model.ChangeReason.Binding Binding}.
	 *
	 * @param {any} vValue The value to set for this binding
	 *
	 * @public
	 */
	JSONPropertyBinding.prototype.setValue = function(vValue) {
		if (this.bSuspended) {
			return;
		}
		if (!deepEqual(this.oValue, vValue)) {
			if (this.oModel.setProperty(this.sPath, vValue, this.oContext, true)) {
				this.oValue = vValue;
				this.getDataState().setValue(this.oValue);
				this.oModel.firePropertyChange({reason: ChangeReason.Binding, path: this.sPath, context: this.oContext,
					value: vValue});
			}
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed, fire a change
	 * event with change reason <code>Change</code>.
	 *
	 * @param {boolean} [bForceupdate]
	 *   Whether the change event will be fired regardless of the bindings state
	 *
	 */
	JSONPropertyBinding.prototype.checkUpdate = function(bForceupdate){
		if (this.bSuspended && !bForceupdate) {
			return;
		}

		var oValue = this._getValue();
		if (!deepEqual(oValue, this.oValue)
				|| (this.isRelative() && this.sPreviousResolvedPath !== this.getResolvedPath())
				|| bForceupdate) {
			this.oValue = oValue;
			this.getDataState().setValue(this.oValue);
			this.checkDataState();
			this.sPreviousResolvedPath = this.getResolvedPath();
			this._fireChange({reason: ChangeReason.Change});
		}
	};

	return JSONPropertyBinding;

});