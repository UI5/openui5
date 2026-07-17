/*!
 * ${copyright}
 */

/**
 * Registers a global keyboard shortcut that toggles Extended Keyboard Navigation.
 *
 * On the {@link module:sap/ui/events/PseudoEvents.events.sapextendedkeyboardnavigationtoggle}
 * pseudo event (currently <code>Shift+Alt+F6</code>), the listener flips
 * <code>ControlBehavior.isExtendedKeyboardNavigationEnabled()</code> via
 * {@link module:sap/ui/core/ControlBehavior.setExtendedKeyboardNavigationEnabled}.
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/ui/core/ControlBehavior",
	"sap/ui/events/PseudoEvents"
], function(ControlBehavior, PseudoEvents) {
	"use strict";

	const oToggleEvent = PseudoEvents.events.sapextendedkeyboardnavigationtoggle;

	function _onKeyDown(oEvent) {
		if (oToggleEvent.fnCheck(oEvent)) {
			ControlBehavior.setExtendedKeyboardNavigationEnabled(
				!ControlBehavior.isExtendedKeyboardNavigationEnabled()
			);
			oEvent.preventDefault();
		}
	}

	// Register listener at module load — analogous to other modules in sap/ui/core/boot.
	document.addEventListener("keydown", _onKeyDown);

	return {
		run: function() {
			return Promise.resolve();
		}
	};
});
