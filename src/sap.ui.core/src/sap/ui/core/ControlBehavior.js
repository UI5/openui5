/*!
 * ${copyright}
 */

// Provides module sap/ui/core/ControlBehavior
sap.ui.define([
	"sap/base/config",
	"sap/base/Eventing",
	"sap/ui/core/AnimationMode"
], (
	BaseConfig,
	Eventing,
	AnimationMode
) => {
	"use strict";

	const oWritableConfig = BaseConfig.getWritableInstance();
	const oEventing = new Eventing();

	/**
	 * Provides control behavior relevant configuration options
	 *
	 * @namespace
	 * @alias module:sap/ui/core/ControlBehavior
	 * @public
	 * @since 1.120
	 */
	const ControlBehavior = {
		/**
		 * The <code>change</code> event is fired, when the configuration options are changed.
		 *
		 * @name module:sap/ui/core/ControlBehavior.change
		 * @event
		 * @type {module:sap/ui/core/ControlBehavior$ChangeEvent}
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */

		/**
		 * The theme scoping change Event.
		 *
		 * @typedef {object} module:sap/ui/core/ControlBehavior$ChangeEvent
		 * @property {string} animationMode Whether the animation mode should be active or not.
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.116.0
		 */

		/**
		 * The <code>extendedKeyboardNavigationChanged</code> event is fired whenever
		 * Extended Keyboard Navigation is toggled via {@link #setExtendedKeyboardNavigationEnabled}.
		 *
		 * The event fires for both transitions (enable and disable). It does
		 * <strong>not</strong> fire for the initial value provided via configuration
		 * (URL parameter, bootstrap attribute, or <code>window["sap-ui-config"]</code>);
		 * consumers needing the current value at registration time should call
		 * {@link #isExtendedKeyboardNavigationEnabled} once after attaching.
		 *
		 * API might change before stable release.
		 *
		 * @name module:sap/ui/core/ControlBehavior.extendedKeyboardNavigationChanged
		 * @event
		 * @type {module:sap/ui/core/ControlBehavior$ExtendedKeyboardNavigationChangedEvent}
		 * @public
		 * @ui5-experimental-since 1.151
		 */

		/**
		 * The Extended Keyboard Navigation change Event.
		 *
		 * API might change before stable release.
		 *
		 * @typedef {object} module:sap/ui/core/ControlBehavior$ExtendedKeyboardNavigationChangedEvent
		 * @property {boolean} extendedKeyboardNavigationEnabled The new value
		 * @public
		 * @ui5-experimental-since 1.151
		 */

		/**
		 * Attaches the <code>fnFunction</code> event handler to the {@link #event:change change} event
		 * of <code>sap/ui/core/ControlBehavior</code>.
		 *
		 * When called, the context of the event handler (its <code>this</code>) will be bound to
		 * <code>oListener</code> if specified, otherwise it will be bound to this
		 * <code>sap/ui/core/ControlBehavior</code> itself.
		 *
		 * @param {function(module:sap/ui/core/ControlBehavior$ChangeEvent)} fnFunction
		 *   The function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */
		attachChange: (fnFunction) => {
			oEventing.attachEvent("change", fnFunction);
		},

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of
		 * this <code>sap/ui/core/ControlBehavior</code>.
		 *
		 * @param {function(module:sap/ui/core/ControlBehavior$ChangeEvent)} fnFunction Function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */
		detachChange: (fnFunction) => {
			oEventing.detachEvent("change", fnFunction);
		},

		/**
		 * Returns whether the accessibility mode is enabled or not.
		 * @return {boolean} whether the accessibility mode is enabled or not
		 * @public
		 * @since 1.120
		 */
		isAccessibilityEnabled: () => {
			return oWritableConfig.get({
				name: "sapUiAccessibility",
				type: BaseConfig.Type.Boolean,
				defaultValue: true,
				external: true
			});
		},

		/**
		 * Returns the current animation mode.
		 *
		 * @return {module:sap/ui/core/AnimationMode} The current animationMode
		 * @public
		 * @since 1.120
		 */
		getAnimationMode: () => {
			return oWritableConfig.get({
				name: "sapUiAnimationMode",
				type: AnimationMode,
				defaultValue: AnimationMode.full,
				external: true
			});
		},

		/**
		 * Sets the current animation mode.
		 *
		 * Expects an animation mode as string and validates it. If a wrong animation mode was set, an error is
		 * thrown. If the mode is valid it is set, then the attributes <code>data-sap-ui-animation</code> and
		 * <code>data-sap-ui-animation-mode</code> of the HTML document root element are also updated.
		 * If the <code>animationMode</code> is <code>AnimationMode.none</code> the old
		 * <code>animation</code> property is set to <code>false</code>, otherwise it is set to <code>true</code>.
		 *
		 * @param {module:sap/ui/core/AnimationMode} sAnimationMode A valid animation mode
		 * @throws {Error} If the provided <code>sAnimationMode</code> does not exist, an error is thrown
		 * @public
		 * @since 1.120
		 */
		setAnimationMode: (sAnimationMode) => {
			BaseConfig._.checkEnum(AnimationMode, sAnimationMode, "animationMode");

			const sOldAnimationMode = oWritableConfig.get({
				name: "sapUiAnimationMode",
				type: AnimationMode,
				defaultValue: undefined,
				external: true
			});

			// Set the animation mode and update html attributes.
			oWritableConfig.set("sapUiAnimationMode", sAnimationMode);
			if (sOldAnimationMode != sAnimationMode) {
				fireChange({animationMode: sAnimationMode});
			}
		},

		/**
		 * Returns whether Extended Keyboard Navigation is currently enabled.
		 *
		 * Extended Keyboard Navigation extends the keyboard tab order to include
		 * non-interactive, text-bearing elements so their tooltips become reachable
		 * by keyboard. The feature is not recommended for screen-reader users.
		 *
		 * API might change before stable release.
		 *
		 * @return {boolean} whether Extended Keyboard Navigation is enabled
		 * @public
		 * @ui5-experimental-since 1.151
		 */
		isExtendedKeyboardNavigationEnabled: () => {
			return oWritableConfig.get({
				name: "sapUiExtendedKeyboardNavigation",
				type: BaseConfig.Type.Boolean,
				defaultValue: false,
				external: true
			});
		},

		/**
		 * Enables or disables Extended Keyboard Navigation.
		 *
		 * When the value changes, the <code>extendedKeyboardNavigationChanged</code> event
		 * is fired. A call with the current value (or with the default value when no
		 * state has been set) is a no-op — no event fires.
		 *
		 * API might change before stable release.
		 *
		 * @param {boolean} bEnabled <code>true</code> to enable the Extended Keyboard Navigation, <code>false</code> to disable
		 * @throws {TypeError} If <code>bEnabled</code> is not a boolean
		 * @private
		 * @ui5-restricted sap.ui.core sap.ushell
		 */
		setExtendedKeyboardNavigationEnabled: (bEnabled) => {
			if (typeof bEnabled !== "boolean") {
				throw new TypeError(
					"ControlBehavior.setExtendedKeyboardNavigationEnabled: argument must be a boolean"
				);
			}
			const bOldValue = ControlBehavior.isExtendedKeyboardNavigationEnabled();
			if (bOldValue === bEnabled) {
				return;
			}
			oWritableConfig.set("sapUiExtendedKeyboardNavigation", bEnabled);
			fireExtendedKeyboardNavigationChanged({ extendedKeyboardNavigationEnabled: bEnabled });
		},

		/**
		 * Attaches a handler to the {@link #event:extendedKeyboardNavigationChanged} event.
		 *
		 * The handler is invoked whenever the Extended Keyboard Navigation state is toggled via
		 * {@link #setExtendedKeyboardNavigationEnabled} — both for transitions from
		 * <code>false</code> to <code>true</code> and from <code>true</code> to
		 * <code>false</code>. No event is fired for the initial value provided
		 * via configuration; call {@link #isExtendedKeyboardNavigationEnabled} once
		 * after attaching to learn the current state.
		 *
		 * API might change before stable release.
		 *
		 * @param {function(module:sap/ui/core/ControlBehavior$ExtendedKeyboardNavigationChangedEvent)} fnFunction
		 *   The function to be called when the event occurs
		 * @public
		 * @ui5-experimental-since 1.151
		 */
		attachExtendedKeyboardNavigationChanged: (fnFunction) => {
			oEventing.attachEvent("extendedKeyboardNavigationChanged", fnFunction);
		},

		/**
		 * Detaches a handler from the {@link #event:extendedKeyboardNavigationChanged} event.
		 *
		 * The passed function must be the same one used for the corresponding
		 * <code>attachExtendedKeyboardNavigationChanged</code> call.
		 *
		 * API might change before stable release.
		 *
		 * @param {function(module:sap/ui/core/ControlBehavior$ExtendedKeyboardNavigationChangedEvent)} fnFunction
		 *   The function to be detached
		 * @public
		 * @ui5-experimental-since 1.151
		 */
		detachExtendedKeyboardNavigationChanged: (fnFunction) => {
			oEventing.detachEvent("extendedKeyboardNavigationChanged", fnFunction);
		}
	};

	function fireChange(mChanges) {
		oEventing.fireEvent("change", mChanges);
	}

	function fireExtendedKeyboardNavigationChanged(mPayload) {
		fireChange({ extendedKeyboardNavigation: mPayload.extendedKeyboardNavigationEnabled });
		oEventing.fireEvent("extendedKeyboardNavigationChanged", mPayload);
	}

	return ControlBehavior;
});