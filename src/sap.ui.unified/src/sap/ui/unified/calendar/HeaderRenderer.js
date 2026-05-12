/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/base/Object",
	// side effect: required when calling RenderManager.icon
	"sap/ui/core/IconPool"
], function(Localization, Library, Locale, BaseObject) {
	"use strict";


	var MAX_HEADER_BUTTONS = 5;

	// Header button slots rendered by renderCalendarButtons (B0..B4)
	var HEADER_BUTTONS = {
		// Optional first text button (normally day label in consumers that use it)
		DAY: 0,
		// Primary month and year buttons of the currently focused month
		PRIMARY_MONTH: 1,
		PRIMARY_YEAR: 2,
		// Secondary month and year buttons (used when showing multiple months)
		SECONDARY_MONTH: 3,
		SECONDARY_YEAR: 4
	};

	// Render order for button groups by locale/date-order convention and month layout.
	// CJK locales use year-month-day order; non-CJK locales use day-month-year order.
	var HEADER_BUTTON_GROUPS = {
		// Japanese/Chinese: year appears before month in header button sequence
		CJK: {
			TWO_MONTHS: {
				// Left = primary month/year content, Right = secondary month/year content
				LEFT: [HEADER_BUTTONS.PRIMARY_YEAR, HEADER_BUTTONS.PRIMARY_MONTH],
				RIGHT: [HEADER_BUTTONS.SECONDARY_YEAR, HEADER_BUTTONS.SECONDARY_MONTH]
			},
			DEFAULT: {
				// Single-content layout in CJK order: secondary year/month, primary year/month, optional day
				LEFT: [HEADER_BUTTONS.SECONDARY_YEAR, HEADER_BUTTONS.SECONDARY_MONTH, HEADER_BUTTONS.PRIMARY_YEAR, HEADER_BUTTONS.PRIMARY_MONTH, HEADER_BUTTONS.DAY],
				RIGHT: []
			}
		},
		// Non-CJK locales: day-month-year order
		DEFAULT: {
			TWO_MONTHS: {
				// Left = optional day + primary month/year, Right = secondary month/year
				LEFT: [HEADER_BUTTONS.DAY, HEADER_BUTTONS.PRIMARY_MONTH, HEADER_BUTTONS.PRIMARY_YEAR],
				RIGHT: [HEADER_BUTTONS.SECONDARY_MONTH, HEADER_BUTTONS.SECONDARY_YEAR]
			},
			DEFAULT: {
				// Single-content layout in non-CJK order
				LEFT: [HEADER_BUTTONS.DAY, HEADER_BUTTONS.PRIMARY_MONTH, HEADER_BUTTONS.PRIMARY_YEAR, HEADER_BUTTONS.SECONDARY_MONTH, HEADER_BUTTONS.SECONDARY_YEAR],
				RIGHT: []
			}
		}
	};

	/**
	 * Header renderer.
	 * @namespace
	 */
	var HeaderRenderer = {
		apiVersion: 2
	};

	// Holds the possible values for the "_currentPicker" property.
	var CALENDAR_PICKERS = {
		MONTH: "month", // represents the "month" aggregation
		MONTH_PICKER: "monthPicker",  // represents the "monthPicker" aggregation
		YEAR_PICKER: "yearPicker",  // represents the "yearPicker" aggregation
		YEAR_RANGE_PICKER: "yearRangePicker"  // represents the "yearRangePicker" aggregation
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.Header} oHead an object representation of the control that should be rendered
	 */
	HeaderRenderer.render = function(oRm, oHead){
		const sLanguage = new Locale(Localization.getLanguageTag()).getLanguage();
		const sTooltip = oHead.getTooltip_AsString();
		const sId = oHead.getId();
		const sPicker = oHead.getProperty("_currentPicker");
		const oRB = Library.getResourceBundleFor("sap.ui.unified");
		const sNextBtnShortCut = oRB.getText("CALENDAR_BTN_NEXT_MONTH_SHORTCUT");
		const sPrevBtnShortCut = oRB.getText("CALENDAR_BTN_PREV_MONTH_SHORTCUT");
		let sNextBtnMainLabel = oRB.getText("CALENDAR_BTN_NEXT_MONTH_TITLE");
		let sPrevBtnMainLabel = oRB.getText("CALENDAR_BTN_PREV_MONTH_TITLE");
		const sLabelToday = oRB.getText("CALENDAR_BTN_TODAY");

		if (sPicker === CALENDAR_PICKERS.MONTH_PICKER) {
			sNextBtnMainLabel = oRB.getText("CALENDAR_BTN_NEXT_YEAR_TITLE");
			sPrevBtnMainLabel = oRB.getText("CALENDAR_BTN_PREV_YEAR_TITLE");
		} else if (sPicker === CALENDAR_PICKERS.YEAR_RANGE_PICKER || sPicker === CALENDAR_PICKERS.YEAR_PICKER) {
			sNextBtnMainLabel = oRB.getText("CALENDAR_BTN_NEXT_YEAR_RANGE_TITLE");
			sPrevBtnMainLabel = oRB.getText("CALENDAR_BTN_PREV_YEAR_RANGE_TITLE");
		}
		const sNextBtnTitle = `${sNextBtnMainLabel} (${sNextBtnShortCut})`;
		const sPrevBtnTitle = `${sPrevBtnMainLabel} (${sPrevBtnShortCut})`;

		oRm.openStart("div", oHead);
		oRm.class("sapUiCalHead");
		if (oHead.getVisibleCurrentDateButton()) {
			oRm.class("sapUiCalHeaderWithTodayButton");
		}

		if (sTooltip) {
			oRm.attr('title', sTooltip);
		}

		oRm.accessibilityState(oHead);

		oRm.openEnd(); // div element

		oRm.openStart("button", sId + '-prev');
		oRm.attr("title", sPrevBtnTitle);
		oRm.accessibilityState(null, {
			label: sPrevBtnMainLabel,
			description: sPrevBtnMainLabel,
			keyshortcuts: sPrevBtnShortCut
		});

		const isPrevBtnEnabled = oHead.getEnabledPrevious();
		oRm.class("sapUiCalHeadPrev");
		if (!isPrevBtnEnabled) {
			oRm.class("sapUiCalDsbl");
			oRm.attr('disabled', "disabled");
		}
		oRm.attr('tabindex', isPrevBtnEnabled ? "0" : "-1");
		oRm.openEnd(); // button element
		oRm.icon("sap-icon://slim-arrow-left", null, { title: null });
		oRm.close("button");

		// Determine content-button groups and order.
		// Prev/next/today are rendered separately and are not part of these groups.
		var bIsCJK = sLanguage.toLowerCase() === "ja" || sLanguage.toLowerCase() === "zh";
		var bIsTwoMonths = this._isTwoMonthsCalendar(oHead);
		var aLeftButtons, aRightButtons;

		var oGroupConfig = bIsCJK ? HEADER_BUTTON_GROUPS.CJK : HEADER_BUTTON_GROUPS.DEFAULT;
		var oLayoutGroup = bIsTwoMonths ? oGroupConfig.TWO_MONTHS : oGroupConfig.DEFAULT;
		aLeftButtons = oLayoutGroup.LEFT;
		aRightButtons = oLayoutGroup.RIGHT;

		// Compute first/last visible button across all groups
		var iFirst = -1;
		var iLast = -1;
		var j;
		var aAllButtons = aLeftButtons.concat(aRightButtons);
		for (j = 0; j < aAllButtons.length; j++) {
			if (this.getVisibleButton(oHead, aAllButtons[j])) {
				if (iFirst < 0) {
					iFirst = aAllButtons[j];
				}
				iLast = aAllButtons[j];
			}
		}
		if (bIsTwoMonths) {
			iFirst = HEADER_BUTTONS.PRIMARY_YEAR;
			iLast = HEADER_BUTTONS.SECONDARY_MONTH;
		}

		// Check if right content has visible buttons
		var bHasRightContent = false;
		for (j = 0; j < aRightButtons.length; j++) {
			if (this.getVisibleButton(oHead, aRightButtons[j])) {
				bHasRightContent = true;
				break;
			}
		}

		// Left content container
		var sAlignLeft = oHead.getProperty("_alignLeft") || "Center";
		oRm.openStart("div", sId + "-contentLeft");
		oRm.class("sapUiCalHeadContent");
		oRm.class("sapUiCalHeadAlign" + sAlignLeft);
		oRm.openEnd();

		for (j = 0; j < aLeftButtons.length; j++) {
			this.renderCalendarButtons(oRm, oHead, sId, iFirst, iLast, aLeftButtons[j]);
		}

		// Placeholder when no buttons are visible
		var bAnyVisible = false;
		for (j = 0; j < MAX_HEADER_BUTTONS; j++) {
			if (this.getVisibleButton(oHead, j)) {
				bAnyVisible = true;
				break;
			}
		}
		if (!bAnyVisible) {
			oRm.openStart("div", sId + '-B' + "-Placeholder");
			oRm.class("sapUiCalHeadBPlaceholder");
			oRm.openEnd();
			oRm.close("div");
		}

		oRm.close("div"); // contentLeft

		// Right content container (only if visible buttons exist)
		if (bHasRightContent) {
			var sAlignRight = oHead.getProperty("_alignRight") || "Center";
			oRm.openStart("div", sId + "-contentRight");
			oRm.class("sapUiCalHeadContent");
			oRm.class("sapUiCalHeadAlign" + sAlignRight);
			oRm.openEnd();

			for (j = 0; j < aRightButtons.length; j++) {
				this.renderCalendarButtons(oRm, oHead, sId, iFirst, iLast, aRightButtons[j]);
			}

			oRm.close("div"); // contentRight
		}

		// Today button
		if (oHead.getVisibleCurrentDateButton()) {
			oRm.openStart("button", sId + '-today');
			oRm.attr("title", sLabelToday);
			oRm.accessibilityState(null, { label: sLabelToday});

			oRm.class("sapUiCalHeadB");
			oRm.class("sapUiCalHeadToday");
			oRm.openEnd(); // button element
			oRm.icon("sap-icon://appointment", null, { title: null });
			oRm.close("button");
		}

		// Next button
		oRm.openStart("button", sId + '-next');
		oRm.attr("title", sNextBtnTitle);
		oRm.accessibilityState(null, {
			label: sNextBtnMainLabel,
			description: sNextBtnMainLabel,
			keyshortcuts: sNextBtnShortCut
		});

		const isNextBtnEnabled = oHead.getEnabledNext();
		oRm.class("sapUiCalHeadNext");
		if (!isNextBtnEnabled) {
			oRm.class("sapUiCalDsbl");
			oRm.attr('disabled', "disabled");
		}
		oRm.attr('tabindex', isNextBtnEnabled ? "0" : "-1");
		oRm.openEnd(); // button element
		oRm.icon("sap-icon://slim-arrow-right", null, { title: null });
		oRm.close("button");

		oRm.close("div");

	};

	HeaderRenderer.renderCalendarButtons = function (oRm, oHead, sId, iFirst, iLast, i) {
		var mAccProps = {};

		if (this.getVisibleButton(oHead, i)) {
			oRm.openStart("button", sId + '-B' + i);
			oRm.class("sapUiCalHeadB");
			oRm.class("sapUiCalHeadB" + i);
			if (iFirst === i) {
				oRm.class("sapUiCalHeadBFirst");
			}
			if (iLast === i) {
				oRm.class("sapUiCalHeadBLast");
			}
			if (this.getAriaLabelButton(oHead, i)) {
				mAccProps["label"] = this.getAriaLabelButton(oHead, i);
			}

			// Set descriptions and keyboard shortcuts from private properties using helper functions
			this._setAccessibilityDescription(oHead, i, mAccProps);
			this._setAccessibilityKeyShortcuts(oHead, i, mAccProps);

			if (this.getTooltipButton(oHead, i)) {
				oRm.attr("title", this.getTooltipButton(oHead, i));
			}
			oRm.accessibilityState(null, mAccProps);
			mAccProps = {};
			oRm.openEnd(); // button element
			var sText = this.getTextButton(oHead, i) || "";
			var sAddText = this.getAdditionalTextButton(oHead, i) || "";
			if (sAddText) {
				oRm.openStart("span", sId + '-B' + i + "-Text");
				oRm.class("sapUiCalHeadBText");
				oRm.openEnd(); // span element
				oRm.text(sText);
				oRm.close("span");

				oRm.openStart("span", sId + '-B' + i + "-AddText");
				oRm.class("sapUiCalHeadBAddText");
				oRm.openEnd(); // span element
				oRm.text(sAddText);
				oRm.close("span");
			} else {
				oRm.text(sText);
			}
			oRm.close("button");
		}
	};

	HeaderRenderer.getVisibleButton = function (oHead, iButton) {
		var bVisible = false;

		if (oHead["getVisibleButton" + iButton]) {
			bVisible = oHead["getVisibleButton" + iButton]();
		} else if (oHead["_getVisibleButton" + iButton]) {
			bVisible = oHead["_getVisibleButton" + iButton]();
		}

		return bVisible;
	};

	HeaderRenderer.getAriaLabelButton = function (oHead, iButton) {
		var sAriaLabel;

		if (oHead["getAriaLabelButton" + iButton]) {
			sAriaLabel = oHead["getAriaLabelButton" + iButton]();
		} else if (oHead["_getAriaLabelButton" + iButton]) {
			sAriaLabel = oHead["_getAriaLabelButton" + iButton]();
		}

		return sAriaLabel;
	};

	HeaderRenderer.getTextButton = function (oHead, iButton) {
		var sText;

		if (oHead["getTextButton" + iButton]) {
			sText = oHead["getTextButton" + iButton]();
		} else if (oHead["_getTextButton" + iButton]) {
			sText = oHead["_getTextButton" + iButton]();
		}

		return sText;
	};

	HeaderRenderer.getAdditionalTextButton = function (oHead, iButton) {
		var sText;

		if (oHead["getAdditionalTextButton" + iButton]) {
			sText = oHead["getAdditionalTextButton" + iButton]();
		} else if (oHead["_getAdditionalTextButton" + iButton]) {
			sText = oHead["_getAdditionalTextButton" + iButton]();
		}

		return sText;
	};

	HeaderRenderer.getTooltipButton = function (oHead, iButton) {
		var sTooltip;

		if (oHead["getTooltipButton" + iButton]) {
			sTooltip = oHead["getTooltipButton" + iButton]();
		} else if (oHead["_getTooltipButton" + iButton]) {
			sTooltip = oHead["_getTooltipButton" + iButton]();
		} else if (iButton === 1) {
			sTooltip = oHead.getProperty("_tooltipButton1");
		} else if (iButton === 2) {
			sTooltip = oHead.getProperty("_tooltipButton2");
		} else if (iButton === 3) {
			sTooltip = oHead.getProperty("_tooltipButton3");
		} else if (iButton === 4) {
			sTooltip = oHead.getProperty("_tooltipButton4");
		}

		return sTooltip;
	};

	HeaderRenderer._isTwoMonthsCalendar = function (oHead) {
		return BaseObject.isObjectA(oHead.getParent(), "sap.ui.unified.Calendar") && (oHead.getParent().getMonths() >= 2);
	};

	/**
	 * Helper function to set accessibility description for calendar header buttons
	 * @param {sap.ui.unified.calendar.Header} oHead The header control
	 * @param {number} iButton The button index (1-4)
	 * @param {object} mAccProps Accessibility properties object to modify
	 * @private
	 */
	HeaderRenderer._setAccessibilityDescription = function (oHead, iButton, mAccProps) {
		if (iButton >= 1 && iButton <= 4) {
			var sDescription = oHead.getProperty("_descriptionButton" + iButton);
			if (sDescription) {
				mAccProps["description"] = sDescription;
			}
		}
	};

	/**
	 * Helper function to set accessibility keyboard shortcuts for calendar header buttons
	 * @param {sap.ui.unified.calendar.Header} oHead The header control
	 * @param {number} iButton The button index (1-4)
	 * @param {object} mAccProps Accessibility properties object to modify
	 * @private
	 */
	HeaderRenderer._setAccessibilityKeyShortcuts = function (oHead, iButton, mAccProps) {
		if (iButton >= 1 && iButton <= 4) {
			var sShortcut = oHead.getProperty("_keyShortcutButton" + iButton);
			if (sShortcut) {
				mAccProps["keyshortcuts"] = sShortcut;
			}
		}
	};

	return HeaderRenderer;

});