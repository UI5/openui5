/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * KeyCodes enumeration.
	 * @enum {int}
	 * @since 1.58
	 * @alias module:sap/ui/events/KeyCodes
	 * @public
	 */
	var mKeyCodes = {

		/**
		 * Backspace key
		 * @type int
		 * @public
		 */
		BACKSPACE: 8,

		/**
		 * Tab key
		 * @type int
		 * @public
		 */
		TAB: 9,

		/**
		 * Enter key
		 * @type int
		 * @public
		 */
		ENTER: 13,

		/**
		 * Shift key
		 * @type int
		 * @public
		 */
		SHIFT: 16,

		/**
		 * Control key
		 * @type int
		 * @public
		 */
		CONTROL: 17,

		/**
		 * Alt key
		 * @type int
		 * @public
		 */
		ALT: 18,

		/**
		 * Pause/Break key
		 * @type int
		 * @public
		 */
		BREAK: 19,

		/**
		 * Caps Lock key
		 * @type int
		 * @public
		 */
		CAPS_LOCK: 20,

		/**
		 * Escape key
		 * @type int
		 * @public
		 */
		ESCAPE: 27,

		/**
		 * Space bar key
		 * @type int
		 * @public
		 */
		SPACE: 32,

		/**
		 * Page Up key
		 * @type int
		 * @public
		 */
		PAGE_UP: 33,

		/**
		 * Page Down key
		 * @type int
		 * @public
		 */
		PAGE_DOWN: 34,

		/**
		 * End key
		 * @type int
		 * @public
		 */
		END: 35,

		/**
		 * Home key
		 * @type int
		 * @public
		 */
		HOME: 36,

		/**
		 * Left arrow key
		 * @type int
		 * @public
		 */
		ARROW_LEFT: 37,

		/**
		 * Up arrow key
		 * @type int
		 * @public
		 */
		ARROW_UP: 38,

		/**
		 * Right arrow key
		 * @type int
		 * @public
		 */
		ARROW_RIGHT: 39,

		/**
		 * Down arrow key
		 * @type int
		 * @public
		 */
		ARROW_DOWN: 40,

		/**
		 * Print Screen key
		 * @type int
		 * @public
		 */
		PRINT: 44,

		/**
		 * Insert key
		 * @type int
		 * @public
		 */
		INSERT: 45,

		/**
		 * Delete key
		 * @type int
		 * @public
		 */
		DELETE: 46,

		/**
		 * Digit 0 key
		 * @type int
		 * @public
		 */
		DIGIT_0: 48,

		/**
		 * Digit 1 key
		 * @type int
		 * @public
		 */
		DIGIT_1: 49,

		/**
		 * Digit 2 key
		 * @type int
		 * @public
		 */
		DIGIT_2: 50,

		/**
		 * Digit 3 key
		 * @type int
		 * @public
		 */
		DIGIT_3: 51,

		/**
		 * Digit 4 key
		 * @type int
		 * @public
		 */
		DIGIT_4: 52,

		/**
		 * Digit 5 key
		 * @type int
		 * @public
		 */
		DIGIT_5: 53,

		/**
		 * Digit 6 key
		 * @type int
		 * @public
		 */
		DIGIT_6: 54,

		/**
		 * Digit 7 key
		 * @type int
		 * @public
		 */
		DIGIT_7: 55,

		/**
		 * Digit 8 key
		 * @type int
		 * @public
		 */
		DIGIT_8: 56,

		/**
		 * Digit 9 key
		 * @type int
		 * @public
		 */
		DIGIT_9: 57,

		/**
		 * Letter A key
		 * @type int
		 * @public
		 */
		A: 65,

		/**
		 * Letter B key
		 * @type int
		 * @public
		 */
		B: 66,

		/**
		 * Letter C key
		 * @type int
		 * @public
		 */
		C: 67,

		/**
		 * Letter D key
		 * @type int
		 * @public
		 */
		D: 68,

		/**
		 * Letter E key
		 * @type int
		 * @public
		 */
		E: 69,

		/**
		 * Letter F key
		 * @type int
		 * @public
		 */
		F: 70,

		/**
		 * Letter G key
		 * @type int
		 * @public
		 */
		G: 71,

		/**
		 * Letter H key
		 * @type int
		 * @public
		 */
		H: 72,

		/**
		 * Letter I key
		 * @type int
		 * @public
		 */
		I: 73,

		/**
		 * Letter J key
		 * @type int
		 * @public
		 */
		J: 74,

		/**
		 * Letter K key
		 * @type int
		 * @public
		 */
		K: 75,

		/**
		 * Letter L key
		 * @type int
		 * @public
		 */
		L: 76,

		/**
		 * Letter M key
		 * @type int
		 * @public
		 */
		M: 77,

		/**
		 * Letter N key
		 * @type int
		 * @public
		 */
		N: 78,

		/**
		 * Letter O key
		 * @type int
		 * @public
		 */
		O: 79,

		/**
		 * Letter P key
		 * @type int
		 * @public
		 */
		P: 80,

		/**
		 * Letter Q key
		 * @type int
		 * @public
		 */
		Q: 81,

		/**
		 * Letter R key
		 * @type int
		 * @public
		 */
		R: 82,

		/**
		 * Letter S key
		 * @type int
		 * @public
		 */
		S: 83,

		/**
		 * Letter T key
		 * @type int
		 * @public
		 */
		T: 84,

		/**
		 * Letter U key
		 * @type int
		 * @public
		 */
		U: 85,

		/**
		 * Letter V key
		 * @type int
		 * @public
		 */
		V: 86,

		/**
		 * Letter W key
		 * @type int
		 * @public
		 */
		W: 87,

		/**
		 * Letter X key
		 * @type int
		 * @public
		 */
		X: 88,

		/**
		 * Letter Y key
		 * @type int
		 * @public
		 */
		Y: 89,

		/**
		 * Letter Z key
		 * @type int
		 * @public
		 */
		Z: 90,

		/**
		 * Windows key (or Meta key on Mac)
		 * @type int
		 * @public
		 */
		WINDOWS: 91,

		/**
		 * Context menu key
		 * @type int
		 * @public
		 */
		CONTEXT_MENU: 93,

		/**
		 * Turn off key
		 * @type int
		 * @public
		 */
		TURN_OFF: 94,

		/**
		 * Sleep key
		 * @type int
		 * @public
		 */
		SLEEP: 95,

		/**
		 * Numpad 0 key
		 * @type int
		 * @public
		 */
		NUMPAD_0: 96,

		/**
		 * Numpad 1 key
		 * @type int
		 * @public
		 */
		NUMPAD_1: 97,

		/**
		 * Numpad 2 key
		 * @type int
		 * @public
		 */
		NUMPAD_2: 98,

		/**
		 * Numpad 3 key
		 * @type int
		 * @public
		 */
		NUMPAD_3: 99,

		/**
		 * Numpad 4 key
		 * @type int
		 * @public
		 */
		NUMPAD_4: 100,

		/**
		 * Numpad 5 key
		 * @type int
		 * @public
		 */
		NUMPAD_5: 101,

		/**
		 * Numpad 6 key
		 * @type int
		 * @public
		 */
		NUMPAD_6: 102,

		/**
		 * Numpad 7 key
		 * @type int
		 * @public
		 */
		NUMPAD_7: 103,

		/**
		 * Numpad 8 key
		 * @type int
		 * @public
		 */
		NUMPAD_8: 104,

		/**
		 * Numpad 9 key
		 * @type int
		 * @public
		 */
		NUMPAD_9: 105,

		/**
		 * Numpad asterisk (*) key
		 * @type int
		 * @public
		 */
		NUMPAD_ASTERISK: 106,

		/**
		 * Numpad plus (+) key
		 * @type int
		 * @public
		 */
		NUMPAD_PLUS: 107,

		/**
		 * Numpad minus (-) key
		 * @type int
		 * @public
		 */
		NUMPAD_MINUS: 109,

		/**
		 * Numpad comma/decimal (.) key
		 * @type int
		 * @public
		 */
		NUMPAD_COMMA: 110,

		/**
		 * Numpad slash (/) key
		 * @type int
		 * @public
		 */
		NUMPAD_SLASH: 111,

		/**
		 * F1 function key
		 * @type int
		 * @public
		 */
		F1: 112,

		/**
		 * F2 function key
		 * @type int
		 * @public
		 */
		F2: 113,

		/**
		 * F3 function key
		 * @type int
		 * @public
		 */
		F3: 114,

		/**
		 * F4 function key
		 * @type int
		 * @public
		 */
		F4: 115,

		/**
		 * F5 function key
		 * @type int
		 * @public
		 */
		F5: 116,

		/**
		 * F6 function key
		 * @type int
		 * @public
		 */
		F6: 117,

		/**
		 * F7 function key
		 * @type int
		 * @public
		 */
		F7: 118,

		/**
		 * F8 function key
		 * @type int
		 * @public
		 */
		F8: 119,

		/**
		 * F9 function key
		 * @type int
		 * @public
		 */
		F9: 120,

		/**
		 * F10 function key
		 * @type int
		 * @public
		 */
		F10: 121,

		/**
		 * F11 function key
		 * @type int
		 * @public
		 */
		F11: 122,

		/**
		 * F12 function key
		 * @type int
		 * @public
		 */
		F12: 123,

		/**
		 * Num Lock key
		 * @type int
		 * @public
		 */
		NUM_LOCK: 144,

		/**
		 * Scroll Lock key
		 * @type int
		 * @public
		 */
		SCROLL_LOCK: 145,

		/**
		 * Open bracket ([) key
		 * @type int
		 * @public
		 */
		OPEN_BRACKET: 186,

		/**
		 * Plus (+) key
		 * @type int
		 * @public
		 */
		PLUS: 187,

		/**
		 * Comma (,) key
		 * @type int
		 * @public
		 */
		COMMA: 188,

		/**
		 * Slash (/) key
		 * @type int
		 * @public
		 */
		SLASH: 189,

		/**
		 * Dot/period (.) key
		 * @type int
		 * @public
		 */
		DOT: 190,

		/**
		 * Pipe (|) key
		 * @type int
		 * @public
		 */
		PIPE: 191,

		/**
		 * Semicolon (;) key
		 * @type int
		 * @public
		 */
		SEMICOLON: 192,

		/**
		 * Minus (-) key
		 * @type int
		 * @public
		 */
		MINUS: 219,

		/**
		 * Grave accent (`) key
		 * @type int
		 * @public
		 */
		GREAT_ACCENT: 220,

		/**
		 * Equals (=) key
		 * @type int
		 * @public
		 */
		EQUALS: 221,

		/**
		 * Single quote (') key
		 * @type int
		 * @public
		 */
		SINGLE_QUOTE: 222,

		/**
		 * Backslash (\) key
		 * @type int
		 * @public
		 */
		BACKSLASH: 226
	};

	return mKeyCodes;

});