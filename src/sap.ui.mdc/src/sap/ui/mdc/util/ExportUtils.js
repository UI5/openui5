/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	/**
	 * @namespace
	 * @alias sap.ui.mdc.util.ExportUtils
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.151
	 */
	const ExportUtils = {
		/**
		 * Fires the <code>beforeExport</code> event on the given control and, if the event handler
		 * calls <code>preventDefault()</code> on it, also calls <code>preventDefault()</code> on
		 * <code>oCancelableEvent</code> to propagate the cancellation to the export framework.
		 *
		 * @param {sap.ui.mdc.Table|sap.ui.mdc.List} oControl The control firing the event
		 * @param {object} mAdditionalParameters Additional event parameters spread into the event parameter object
		 * @param {sap.ui.base.Event} oCancelableEvent The cancelable event from the export framework;
		 *   <code>exportSettings</code> and <code>userExportSettings</code> are read from it, and
		 *   when <code>fireBeforeExport</code> returns <code>false</code>,
		 *   <code>oCancelableEvent.preventDefault()</code> is called
		 * @returns {boolean} The return value of <code>oControl.fireBeforeExport</code>
		 * @private
		 */
		fireBeforeExport: function(oControl, mAdditionalParameters, oCancelableEvent) {
			const bExecuteDefaultAction = oControl.fireBeforeExport({
				exportSettings: oCancelableEvent.getParameter("exportSettings"),
				userExportSettings: oCancelableEvent.getParameter("userExportSettings"),
				...mAdditionalParameters
			});

			if (!bExecuteDefaultAction) {
				oCancelableEvent?.preventDefault();
			}

			return bExecuteDefaultAction;
		}
	};

	return ExportUtils;
});
