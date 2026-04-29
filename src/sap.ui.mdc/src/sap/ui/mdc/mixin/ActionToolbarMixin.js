/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/mdc/actiontoolbar/ActionToolbarAction"],
	(ActionToolbarAction) => {
	"use strict";

	/**
	 * Enhances {@link sap.ui.mdc.Table Table} or {@link sap.ui.mdc.Chart Chart} with helper functions for {@link sap.ui.mdc.ActionToolbar ActionToolbar}
	 *
	 * The following methods are wrapped:
	 *
	 * <ul>
	 * <li><code>addAction</code></li>
	 * <li><code>insertAction</code></li>
	 * <li><code>removeAction</code></li>
	 * <li><code>indexOfAction</code></li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.mixin.ActionToolbarMixin
	 * @namespace
	 * @since 1.148.0
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const ActionToolbarMixin = {};


	/**
	 * Creates the {@link sap.ui.mdc.actiontoolbar.ActionToolbarAction ActionToolbarAction} that can be used in the {@link sap.ui.mdc.ActionToolbar#getActions actions} aggregation of the {@link sap.ui.mdc.ActionToolbar ActionToolbar}.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of the new control
	 * @returns {sap.ui.mdc.actiontoolbar.ActionToolbarAction} Returns the wrapped action
	 * @private
	 */
	function _wrapActionForAggregation(oControl) {
		if (!oControl.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction")) {
			oControl = new ActionToolbarAction(oControl.getId() + "-action", {
				action: oControl
			});
		}
		return oControl;
	}

	/**
	 * Creates the {@link sap.ui.mdc.actiontoolbar.ActionToolbarAction ActionToolbarAction} that can be used in the {@link sap.ui.mdc.ActionToolbar#getActions actions} aggregation of the {@link sap.ui.mdc.ActionToolbar ActionToolbar}.
	 *
	 * @param {int | string | sap.ui.mdc.Control} vControl the position or ID of the <code>Control</code>> or the <code>Control</code> itself;
	 * @returns {sap.ui.mdc.actiontoolbar.ActionToolbarAction} Returns the wrapped action
	 * @private
	 */
	function _resolveActionForAggregation(vControl) {
		let oControl;

		const aActions = this.getActions();
		if (typeof vControl === "number") {
			oControl = aActions[vControl];
		} else {
			for (let i = 0; i < aActions.length; i++) {
				const oAction = aActions[i];
				const oActionAction = oAction.getAction();
				if ((typeof vControl === "string" && (oAction.getId() === vControl || oActionAction?.getId() === vControl)) ||
					(oAction === vControl || oActionAction === vControl)) {
					oControl = oAction;
					break;
				}
			}
		}

		return oControl;
	}

	ActionToolbarMixin.addAction = function(fnAddAction) {
		return function(oControl) {
			oControl = _wrapActionForAggregation.call(this, oControl);
			return fnAddAction.apply(this, [oControl]);
		};
	};

	ActionToolbarMixin.insertAction = function(fnInsertAction) {
		return function(oControl, iIndex) {
			oControl = _wrapActionForAggregation.call(this, oControl);

			return fnInsertAction.apply(this, [oControl, iIndex]);
		};
	};

	ActionToolbarMixin.removeAction = function(fnRemoveAction) {
		return function(vControl) {
			const oControl = _resolveActionForAggregation.call(this, vControl);

			return fnRemoveAction.apply(this, [oControl || vControl]);
		};
	};

	ActionToolbarMixin.indexOfAction = function(fnIndexOfAction) {
		return function(oControl) {
			oControl = _resolveActionForAggregation.call(this, oControl);

			return fnIndexOfAction.apply(this, [oControl]);
		};
	};

	return function() {
		// wrappers
		this.addAction = ActionToolbarMixin.addAction(this.addAction);
		this.insertAction = ActionToolbarMixin.insertAction(this.insertAction);
		this.removeAction = ActionToolbarMixin.removeAction(this.removeAction);
		this.indexOfAction = ActionToolbarMixin.indexOfAction(this.indexOfAction);
	};

});