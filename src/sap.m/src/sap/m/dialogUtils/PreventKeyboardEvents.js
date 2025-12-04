/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/library",
	"sap/base/Log"
],
	function (library, Log) {
	"use strict";

	const fnPreventEvent = (oEvent) => {
		Log.info(`Keyboard event ${oEvent.type} on target ${oEvent.target.id} prevented by sap.m.Dialog during opening.`);

		oEvent.stopPropagation();
		oEvent.preventDefault();
	};

	/**
	 * Utility class for preventing keyboard events.
	 * @private
	 */
	const PreventKeyboardEvents = {};

	/**
	 * Prevents keypress and keyup events within the given element.
	 * @param {HTMLElement} oElement The element within which the events should be prevented.
	 */
	PreventKeyboardEvents.preventOnce = function (oElement) {
		if (!oElement) {
			return;
		}

		const options = {
			capture: true,
			once: true
		};

		oElement.addEventListener("keypress", fnPreventEvent, options);
		oElement.addEventListener("keyup", fnPreventEvent, options);
	};

	/**
	 * Restores keypress and keyup events within the given element.
	 * @param {HTMLElement} oElement The element within which the events should be restored.
	 */
	PreventKeyboardEvents.restore = function (oElement) {
		if (!oElement) {
			return;
		}

		const options = {
			capture: true
		};

		oElement.removeEventListener("keypress", fnPreventEvent, options);
		oElement.removeEventListener("keyup", fnPreventEvent, options);
	};

	return PreventKeyboardEvents;
});