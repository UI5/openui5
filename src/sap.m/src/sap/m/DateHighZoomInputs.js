/*!
 * ${copyright}
 */

// Provides control sap.m.DateHighZoomInputs
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/core/Control",
	"sap/ui/core/Item",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/library",
	"sap/ui/unified/calendar/YearPicker",
	"sap/ui/unified/calendar/Header",
	"./library",
	"./DateHighZoomInputsRenderer",
	"./Input",
	"./Label",
	"./Select"
], function(
	Formatting,
	Localization,
	Control,
	Item,
	Library,
	Locale,
	LocaleData,
	UI5Date,
	UniversalDate,
	coreLibrary,
	YearPicker,
	CalendarHeader,
	library,
	DateHighZoomInputsRenderer,
	Input,
	Label,
	Select
) {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.m");

	/**
	 * Constructor for a new DateHighZoomInputs.
	 *
	 * Renders a Year input + Month select + Day select for use inside the
	 * DatePicker popup when the viewport is too narrow to display a Calendar
	 * (high-zoom / small-screen mode). The control handles cascade population
	 * of months and days and fires a <code>change</code> event when the user
	 * selects a day.
	 *
	 * Validation (checking against min/max boundaries) is intentionally kept in
	 * the parent DatePicker — this control exposes <code>setFieldValueState</code>
	 * so DatePicker can push feedback back to the individual fields.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.135
	 * @alias sap.m.DateHighZoomInputs
	 */
	const DateHighZoomInputs = Control.extend("sap.m.DateHighZoomInputs", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The currently selected date value.
				 */
				dateValue: { type: "object", defaultValue: null },

				/**
				 * The end date value (used in <code>Range</code> mode only).
				 */
				secondDateValue: { type: "object", defaultValue: null },

				/**
				 * The minimum selectable date.
				 */
				minDate: { type: "object", defaultValue: null },

				/**
				 * The maximum selectable date.
				 */
				maxDate: { type: "object", defaultValue: null },

				/**
				 * The primary calendar type used for date formatting and input.
				 * When not set, falls back to the globally configured calendar type.
				 */
				primaryCalendarType: { type: "sap.base.i18n.date.CalendarType", defaultValue: null },

				/**
				 * Rendering mode: <code>Single</code> shows one set of date fields;
				 * <code>Range</code> shows two sets (start + end) for date-range selection.
				 */
				mode: { type: "sap.m.DateHighZoomInputsMode", defaultValue: library.DateHighZoomInputsMode.Single },

				/**
				 * Optional secondary calendar type. When set, the control can display
				 * dates in either the primary or secondary calendar type.
				 */
				secondaryCalendarType: { type: "sap.base.i18n.date.CalendarType", defaultValue: null },

				/** Whether the year-picker section is visible instead of the date inputs. @private */
				_yearPickerVisible: { type: "boolean", defaultValue: false, visibility: "hidden" },

				/**
				 * The calendar type currently shown in the inputs (primary or secondary).
				 * Toggled by the parent DatePicker's header button. @private
				 */
				_activeCalendarType: { type: "string", defaultValue: null, visibility: "hidden" },

				/**
				 * Controls which input rows are rendered.
				 * <ul>
				 *   <li><code>"YearMonthDay"</code> — all three fields</li>
				 *   <li><code>"YearMonth"</code> — year + month (no day)</li>
				 *   <li><code>"Year"</code> — year only</li>
				 *   <li><code>"MonthDay"</code> — month + day (no year)</li>
				 * </ul>
				 * Mirrors the format-pattern analysis done by DatePicker._getCalendarConstructor().
				 * @private
				 */
				_visibleFields: { type: "string", defaultValue: "YearMonthDay", visibility: "hidden" }
			},
			aggregations: {
			},
			events: {
				/**
				 * Fired when the user selects a day — i.e. a complete date has been chosen.
				 * The parent should validate and, if valid, persist the value.
				 */
				change: {
					parameters: {
						/** The currently composed date {year, month, day}. */
						year:  { type: "int" },
						month: { type: "int" },
						day:   { type: "int" },
						field: { type: "sap.m.DateHighZoomInputsField" },
						/** True when the changed field belongs to the end date (range mode). */
						isEndDate: { type: "boolean" }
					}
				}
			}
		},

		renderer: DateHighZoomInputsRenderer
	});

	// =========================================================
	// Lifecycle
	// =========================================================

	DateHighZoomInputs.prototype.init = function() {
		const sId = this.getId();

		this._sYearPickerTarget = "start"; // "start" | "end" — which group triggered the year picker

		this._oYearPicker = new YearPicker(sId + "-hzYearPicker", {
			years: 8,
			columns: 2,
			primaryCalendarType: this._getActiveCalendarType(),
			select: () => {
				// YearPicker's "year" property is in its own primaryCalendarType,
				// which we keep synced with the active calendar type of this control.
				const iDisplayYear = 2000;
				if (iDisplayYear) {
					const bEnd = this._sYearPickerTarget === "end";
					const oInput = bEnd ? this._oYearInputEnd : this._oYearInput;
					oInput.setValue(String(iDisplayYear));
					bEnd ? this._onEndYearChange() : this._onYearChange();
				}
				this._showYearPickerView(false);
			}
		});

		this._oYearNavHeader = new CalendarHeader(sId + "-hzYearHeader", {
			visibleButton1: false,
			visibleButton2: true,
			pressPrevious: () => this._navigateYearPicker(-1),
			pressNext:     () => this._navigateYearPicker(1)
		});

		this._oYearInput = new Input(sId + "-hzYear", {
			width: "100%",
			showValueHelp: true,
			valueHelpIconSrc: "sap-icon://slim-arrow-down",
			valueHelpRequest: () => this._onYearValueHelpRequest(),
			change: () => this._onYearChange()
		});

		this._oMonthSelect = new Select(sId + "-hzMonth", {
			width: "100%",
			change: () => this._onMonthChange()
		});

		this._oDaySelect = new Select(sId + "-hzDay", {
			width: "100%",
			change: () => this._onDayChange()
		});

		this._oYearLabel  = new Label(sId + "-hzYearLbl",  { text: oResourceBundle.getText("DATEPICKER_HZ_YEAR_LABEL"),  labelFor: sId + "-hzYear",  showColon: true });
		this._oMonthLabel = new Label(sId + "-hzMonthLbl", { text: oResourceBundle.getText("DATEPICKER_HZ_MONTH_LABEL"), labelFor: sId + "-hzMonth", showColon: true });
		this._oDayLabel   = new Label(sId + "-hzDayLbl",   { text: oResourceBundle.getText("DATEPICKER_HZ_DAY_LABEL"),   labelFor: sId + "-hzDay",   showColon: true });

		this.addDependent(this._oYearPicker);
		this.addDependent(this._oYearNavHeader);
		this.addDependent(this._oYearInput);
		this.addDependent(this._oMonthSelect);
		this.addDependent(this._oDaySelect);
		this.addDependent(this._oYearLabel);
		this.addDependent(this._oMonthLabel);
		this.addDependent(this._oDayLabel);
	};

	DateHighZoomInputs.prototype.exit = function() {
		this._oYearInput      = null;
		this._oMonthSelect    = null;
		this._oDaySelect      = null;
		this._oYearLabel      = null;
		this._oMonthLabel     = null;
		this._oDayLabel       = null;
		this._oYearPicker     = null;
		this._oYearNavHeader  = null;
		// End-date controls (range mode)
		this._oYearInputEnd     = null;
		this._oMonthSelectEnd   = null;
		this._oDaySelectEnd     = null;
		this._oYearLabelEnd     = null;
		this._oMonthLabelEnd    = null;
		this._oDayLabelEnd      = null;
	};

	// =========================================================
	// Public API
	// =========================================================

	/**
	 * Synchronizes UI controls to the current dateValue / minDate / maxDate.
	 * Must be called after any of those properties change while the control is visible.
	 */
	DateHighZoomInputs.prototype.syncStartDate = function() {
		const oDate = this.getDateValue() || UI5Date.getInstance();
		const sCalType = this._getActiveCalendarType();

		const oUDate = UniversalDate.getInstance(oDate, sCalType);
		const iYear  = oUDate.getFullYear();
		const iMonth = oUDate.getMonth();
		const iDay   = oUDate.getDate();

		this._syncYearPickerMinMax();
		this._oYearInput.setValue(String(iYear));
		this._oYearInput.setShowValueHelp(true);

		if (this._isMonthVisible()) {
			this._populateMonthSelect(this._oMonthSelect, sCalType);
			this._oMonthSelect.setSelectedKey(String(iMonth));
		}

		if (this._isDayVisible()) {
			this._populateDaySelect(this._oDaySelect, iYear, iMonth, sCalType);
			this._oDaySelect.setSelectedKey(String(iDay));
		}

		this._showYearPickerView(false);
	};

	/**
	 * Returns the currently composed date as plain Gregorian values.
	 * Converts from the active calendar type if necessary.
	 * @returns {{year: int, month: int, day: int}}
	 */
	DateHighZoomInputs.prototype.getSelectedDate = function() {
		const sCalType = this._getActiveCalendarType();
		let iYear;
		if (this._isYearVisible()) {
			iYear = parseInt(this._oYearInput.getValue());
		} else {
			// MonthDay mode — year not shown, inherit from dateValue (or current year as fallback)
			const oRef = this.getDateValue() || UI5Date.getInstance();
			iYear = (sCalType === "Gregorian")
				? oRef.getFullYear()
				: UniversalDate.getInstance(oRef, sCalType).getFullYear();
		}
		const iMonth = this._isMonthVisible() ? parseInt(this._oMonthSelect.getSelectedKey()) : 0;
		const iDay   = this._isDayVisible()   ? parseInt(this._oDaySelect.getSelectedKey())   : 1;

		if (isNaN(iYear) || isNaN(iMonth) || isNaN(iDay)) {
			return { year: iYear, month: iMonth, day: iDay };
		}

		if (sCalType === "Gregorian") {
			return { year: iYear, month: iMonth, day: iDay };
		}

		const oUDate = UniversalDate.getInstance(UI5Date.getInstance(), sCalType);
		oUDate.setFullYear(iYear);
		oUDate.setMonth(iMonth);
		oUDate.setDate(iDay);
		return {
			year:  oUDate.getJSDate().getFullYear(),
			month: oUDate.getJSDate().getMonth(),
			day:   oUDate.getJSDate().getDate()
		};
	};

	/**
	 * Returns the start date as a UI5Date instance, or null if the fields are incomplete.
	 * Guards against years < 100 being shifted to 19xx by Date internals.
	 * @returns {module:sap/ui/core/date/UI5Date|null}
	 */
	DateHighZoomInputs.prototype.getDateObject = function() {
		const { year, month, day } = this.getSelectedDate();
		if (isNaN(year) || isNaN(month) || isNaN(day)) { return null; }
		const oDate = UI5Date.getInstance(year, month, day);
		oDate.setFullYear(year);
		return oDate;
	};

	/**
	 * Sets the value state and optional value state text on a specific field.
	 * Called by DatePicker after it validates the composed date.
	 *
	 * @param {sap.m.DateHighZoomInputsField} sField  Year | Month | Day
	 * @param {string} sState  sap.ui.core.ValueState value
	 * @param {string} [sText] Optional value state text shown in the message popup
	 * @param {boolean} [bEndDate] If true, targets the end-date fields (range mode)
	 */
	DateHighZoomInputs.prototype.setFieldValueState = function(sField, sState, sText, bEndDate) {
		const oControl = bEndDate ? this._endDateFieldControl(sField) : this._startDateFieldControl(sField);
		if (!oControl) {
			return;
		}
		oControl.setValueState(sState);
		oControl.setValueStateText(sText || "");
	};

	// =========================================================
	// Range mode — public API
	// =========================================================

	/**
	 * Lazily creates the end-date sub-controls (called once when mode <code>Range</code> is first used).
	 */
	DateHighZoomInputs.prototype._createEndDateControls = function() {
		if (this._oYearInputEnd) { return; }
		const sId = this.getId();

		this._oYearInputEnd = new Input(sId + "-hzYear2", {
			width: "100%",
			showValueHelp: true,
			valueHelpIconSrc: "sap-icon://slim-arrow-down",
			valueHelpRequest: () => {
				this._sYearPickerTarget = "end";
				this._syncYearPickerMinMax();
				const iYear = parseInt(this._oYearInputEnd.getValue());
				if (!isNaN(iYear)) {
					const sCalType = this._getActiveCalendarType();
					const oUDate = UniversalDate.getInstance(UI5Date.getInstance(), sCalType);
					oUDate.setUTCFullYear(iYear);
					oUDate.setUTCMonth(0);
					oUDate.setUTCDate(1);
					oUDate.setUTCHours(12, 0, 0, 0);
					this._oYearPicker.setDate(oUDate.getJSDate());
				}
				this._showYearPickerView(true);
			},
			change: () => this._onEndYearChange()
		});

		this._oMonthSelectEnd = new Select(sId + "-hzMonth2", {
			width: "100%",
			change: () => this._onEndMonthChange()
		});

		this._oDaySelectEnd = new Select(sId + "-hzDay2", {
			width: "100%",
			change: () => this._onEndDayChange()
		});

		this._oYearLabelEnd  = new Label(sId + "-hzYearLbl2",  { text: oResourceBundle.getText("DATEPICKER_HZ_YEAR_LABEL"),  labelFor: sId + "-hzYear2",  showColon: true });
		this._oMonthLabelEnd = new Label(sId + "-hzMonthLbl2", { text: oResourceBundle.getText("DATEPICKER_HZ_MONTH_LABEL"), labelFor: sId + "-hzMonth2", showColon: true });
		this._oDayLabelEnd   = new Label(sId + "-hzDayLbl2",   { text: oResourceBundle.getText("DATEPICKER_HZ_DAY_LABEL"),   labelFor: sId + "-hzDay2",   showColon: true });

		this.addDependent(this._oYearInputEnd);
		this.addDependent(this._oMonthSelectEnd);
		this.addDependent(this._oDaySelectEnd);
		this.addDependent(this._oYearLabelEnd);
		this.addDependent(this._oMonthLabelEnd);
		this.addDependent(this._oDayLabelEnd);
	};

	/**
	 * Synchronizes the end-date fields to the given date (range mode).
	 * Creates end controls if not yet done.
	 * @param {Date|module:sap/ui/core/date/UI5Date|null} oDate
	 */
	DateHighZoomInputs.prototype.syncEndDate = function(oDate) {
		this._createEndDateControls();
		const oEffectiveDate = oDate || UI5Date.getInstance();
		const sCalType = this._getActiveCalendarType();

		const oUDate = UniversalDate.getInstance(oEffectiveDate, sCalType);
		const iYear  = oUDate.getFullYear();
		const iMonth = oUDate.getMonth();
		const iDay   = oUDate.getDate();

		this._oYearInputEnd.setValue(String(iYear));
		this._oYearInputEnd.setShowValueHelp(true);

		if (this._isMonthVisible()) {
			this._populateMonthSelect(this._oMonthSelectEnd, sCalType);
			this._oMonthSelectEnd.setSelectedKey(String(iMonth));
		}

		if (this._isDayVisible()) {
			this._populateDaySelect(this._oDaySelectEnd, iYear, iMonth, sCalType);
			this._oDaySelectEnd.setSelectedKey(String(iDay));
		}
	};

	/**
	 * Returns the currently composed end date as plain Gregorian values (range mode).
	 * @returns {{year: int, month: int, day: int}|null}
	 */
	DateHighZoomInputs.prototype.getSelectedSecondDate = function() {
		if (!this._oYearInputEnd) { return null; }
		const sCalType = this._getActiveCalendarType();
		let iYear;
		if (this._isYearVisible()) {
			iYear = parseInt(this._oYearInputEnd.getValue());
		} else {
			const oRef = this.getSecondDateValue() || this.getDateValue() || UI5Date.getInstance();
			iYear = (sCalType === "Gregorian")
				? oRef.getFullYear()
				: UniversalDate.getInstance(oRef, sCalType).getFullYear();
		}
		const iMonth = this._isMonthVisible() ? parseInt(this._oMonthSelectEnd.getSelectedKey()) : 0;
		const iDay   = this._isDayVisible()   ? parseInt(this._oDaySelectEnd.getSelectedKey())   : 1;

		if (isNaN(iYear) || isNaN(iMonth) || isNaN(iDay)) {
			return { year: iYear, month: iMonth, day: iDay };
		}

		if (sCalType === "Gregorian") {
			return { year: iYear, month: iMonth, day: iDay };
		}

		const oUDate = UniversalDate.getInstance(UI5Date.getInstance(), sCalType);
		oUDate.setFullYear(iYear);
		oUDate.setMonth(iMonth);
		oUDate.setDate(iDay);
		return { year: oUDate.getJSDate().getFullYear(), month: oUDate.getJSDate().getMonth(), day: oUDate.getJSDate().getDate() };
	};

	/**
	 * Validates the end date (range mode).
	 * @returns {boolean}
	 */
	DateHighZoomInputs.prototype.validateEndDate = function() {
		return this._doValidate(true);
	};

	// =========================================================
	// Event handlers
	// =========================================================

	DateHighZoomInputs.prototype._onYearValueHelpRequest = function() {
		this._sYearPickerTarget = "start";
		this._syncYearPickerMinMax();
		const iYear = parseInt(this._oYearInput.getValue());
		if (!isNaN(iYear)) {
			const sCalType = this._getActiveCalendarType();
			// Use noon to avoid UTC midnight shifting into the previous day in UTC+ timezones
			const oUDate = UniversalDate.getInstance(UI5Date.getInstance(), sCalType);
			oUDate.setUTCFullYear(iYear);
			oUDate.setUTCMonth(0);
			oUDate.setUTCDate(1);
			oUDate.setUTCHours(12, 0, 0, 0);
			this._oYearPicker.setDate(oUDate.getJSDate());
		}
		this._showYearPickerView(true);
	};

	DateHighZoomInputs.prototype._onYearChange = function() {
		const iYear = parseInt(this._oYearInput.getValue());
		const { min, max } = this._getYearBounds();
		const bYearValid = !isNaN(iYear) && iYear >= min && iYear <= max;

		if (!bYearValid) {
			this.fireChange(Object.assign(this.getSelectedDate(), { field: library.DateHighZoomInputsField.Year, isEndDate: false }));
			return;
		}

		if (!this._isMonthVisible()) {
			this.fireChange(Object.assign(this.getSelectedDate(), { field: library.DateHighZoomInputsField.Year, isEndDate: false }));
			return;
		}

		this._onMonthChange();
	};

	DateHighZoomInputs.prototype._onMonthChange = function() {
		const iYear  = parseInt(this._oYearInput.getValue());
		const iMonth = parseInt(this._oMonthSelect.getSelectedKey());
		const sCalType = this._getActiveCalendarType();

		if (this._isDayVisible()) {
			let iCurrentDay = parseInt(this._oDaySelect.getSelectedKey()) || 1;
			this._populateDaySelect(this._oDaySelect, iYear, iMonth, sCalType);
			if (!this._oDaySelect.getItemByKey(String(iCurrentDay))) {
				iCurrentDay = parseInt(this._oDaySelect.getItems()[0].getKey());
			}
			this._oDaySelect.setSelectedKey(String(iCurrentDay));
		}

		this.fireChange(Object.assign(this.getSelectedDate(), { field: library.DateHighZoomInputsField.Month, isEndDate: false }));
	};

	DateHighZoomInputs.prototype._onDayChange = function() {
		this.fireChange(Object.assign(this.getSelectedDate(), { field: library.DateHighZoomInputsField.Day, isEndDate: false }));
	};

	// End-date event handlers (range mode)

	DateHighZoomInputs.prototype._onEndYearChange = function() {
		const iYear = parseInt(this._oYearInputEnd.getValue());
		const { min, max } = this._getYearBounds();
		const bYearValid = !isNaN(iYear) && iYear >= min && iYear <= max;

		if (!bYearValid) {
			this.fireChange(Object.assign(this.getSelectedSecondDate(), { field: library.DateHighZoomInputsField.Year, isEndDate: true }));
			return;
		}

		if (!this._isMonthVisible()) {
			this.fireChange(Object.assign(this.getSelectedSecondDate(), { field: library.DateHighZoomInputsField.Year, isEndDate: true }));
			return;
		}

		this._onEndMonthChange();
	};

	DateHighZoomInputs.prototype._onEndMonthChange = function() {
		const iYear  = parseInt(this._oYearInputEnd.getValue());
		const iMonth = parseInt(this._oMonthSelectEnd.getSelectedKey());
		const sCalType = this._getActiveCalendarType();

		if (this._isDayVisible()) {
			let iCurrentDay = parseInt(this._oDaySelectEnd.getSelectedKey()) || 1;
			this._populateDaySelect(this._oDaySelectEnd, iYear, iMonth, sCalType);
			if (!this._oDaySelectEnd.getItemByKey(String(iCurrentDay))) {
				iCurrentDay = parseInt(this._oDaySelectEnd.getItems()[0].getKey());
			}
			this._oDaySelectEnd.setSelectedKey(String(iCurrentDay));
		}

		this.fireChange(Object.assign(this.getSelectedSecondDate(), { field: library.DateHighZoomInputsField.Month, isEndDate: true }));
	};

	DateHighZoomInputs.prototype._onEndDayChange = function() {
		this.fireChange(Object.assign(this.getSelectedSecondDate(), { field: library.DateHighZoomInputsField.Day, isEndDate: true }));
	};

	// =========================================================
	// Internal helpers
	// =========================================================

	DateHighZoomInputs.prototype._startDateFieldControl = function(sField) {
		switch (sField) {
			case library.DateHighZoomInputsField.Year:  return this._oYearInput;
			case library.DateHighZoomInputsField.Month: return this._oMonthSelect;
			case library.DateHighZoomInputsField.Day:   return this._oDaySelect;
			default:                                    return null;
		}
	};

	DateHighZoomInputs.prototype._endDateFieldControl = function(sField) {
		switch (sField) {
			case library.DateHighZoomInputsField.Year:  return this._oYearInputEnd;
			case library.DateHighZoomInputsField.Month: return this._oMonthSelectEnd;
			case library.DateHighZoomInputsField.Day:   return this._oDaySelectEnd;
			default:                                    return null;
		}
	};

	/**
	 * Populates a month Select control with localized month names.
	 * @param {sap.m.Select} oSelect
	 * @param {string} sCalType
	 */
	DateHighZoomInputs.prototype._populateMonthSelect = function(oSelect, sCalType) {
		const oLocaleData = LocaleData.getInstance(
			new Locale(Localization.getLanguageTag().toString())
		);
		const sType = sCalType || this._getActiveCalendarType();
		const aMonths = oLocaleData.getMonthsStandAlone("wide", sType);

		oSelect.destroyItems();
		aMonths.forEach((sMonth, i) => {
			oSelect.addItem(new Item({ key: String(i), text: sMonth }));
		});
	};

	/**
	 * Populates a day Select control for the given year/month.
	 * All days in the month are shown; validation handles out-of-range selection.
	 * @param {sap.m.Select} oSelect
	 * @param {int} iYear
	 * @param {int} iMonth
	 * @param {string} sCalType
	 */
	DateHighZoomInputs.prototype._populateDaySelect = function(oSelect, iYear, iMonth, sCalType) {
		const sType = sCalType || this._getActiveCalendarType();

		const oUDate = UniversalDate.getInstance(UI5Date.getInstance(iYear, iMonth, 1), sType);
		oUDate.setMonth(iMonth + 1);
		oUDate.setDate(0);
		const iDaysInMonth = oUDate.getDate();

		oSelect.destroyItems();
		for (let d = 1; d <= iDaysInMonth; d++) {
			oSelect.addItem(new Item({
				key:  String(d),
				text: String(d).padStart(2, "0")
			}));
		}
	};

	/**
	 * Returns the currently active calendar type.
	 * @returns {string}
	 */
	DateHighZoomInputs.prototype._getActiveCalendarType = function() {
		return this.getProperty("_activeCalendarType") || this.getPrimaryCalendarType() || Formatting.getCalendarType();
	};

	/** @returns {boolean} */
	DateHighZoomInputs.prototype._isYearVisible = function() {
		const s = this.getProperty("_visibleFields");
		return s !== "MonthDay";
	};

	/** @returns {boolean} */
	DateHighZoomInputs.prototype._isMonthVisible = function() {
		const s = this.getProperty("_visibleFields");
		return s === "YearMonthDay" || s === "YearMonth" || s === "MonthDay";
	};

	/** @returns {boolean} */
	DateHighZoomInputs.prototype._isDayVisible = function() {
		const s = this.getProperty("_visibleFields");
		return s === "YearMonthDay" || s === "MonthDay";
	};

	/**
	 * Switches the active calendar type and re-syncs the inputs.
	 * @param {string} sCalType
	 */
	DateHighZoomInputs.prototype.switchCalendarType = function(sCalType) {
		this.setProperty("_activeCalendarType", sCalType, true);
		if (this._oYearPicker) {
			this._oYearPicker.setPrimaryCalendarType(sCalType);
		}
		this.syncStartDate();
	};

	/**
	 * Override to keep YearPicker in sync whenever the primary calendar type is set from outside
	 * (e.g. by DatePicker._switchPickerContent before calling switchCalendarType).
	 * @override
	 */
	DateHighZoomInputs.prototype.setPrimaryCalendarType = function(sCalType) {
		this.setProperty("primaryCalendarType", sCalType);
		if (this._oYearPicker && !this.getProperty("_activeCalendarType")) {
			this._oYearPicker.setPrimaryCalendarType(sCalType || Formatting.getCalendarType());
		}
		return this;
	};

	DateHighZoomInputs.prototype._showYearPickerView = function(bShow) {
		this.setProperty("_yearPickerVisible", bShow);
		if (bShow) {
			window.requestAnimationFrame(() => this._updateYearPickerHeader());
		}
	};

	DateHighZoomInputs.prototype._getYearBounds = function() {
		const oMinDate = this.getMinDate();
		const oMaxDate = this.getMaxDate();
		const sCalType = this._getActiveCalendarType();
		const oRefJS   = this.getDateValue() || UI5Date.getInstance();
		const fToActiveYear = (oJSDate) => {
			// Convert a Gregorian JS Date to a year in the active calendar type via UTC noon
			// (avoids midnight DST/timezone shifts crossing the year boundary).
			const oJSNoon = UI5Date.getInstance(
				oJSDate.getFullYear(), oJSDate.getMonth(), oJSDate.getDate(), 12, 0, 0);
			return UniversalDate.getInstance(oJSNoon, sCalType).getUTCFullYear();
		};
		const iRefYear = fToActiveYear(oRefJS);
		return {
			min: (oMinDate && oMinDate.getFullYear() > 1)    ? fToActiveYear(oMinDate) : iRefYear - 200,
			max: (oMaxDate && oMaxDate.getFullYear() < 9999) ? fToActiveYear(oMaxDate) : iRefYear + 200
		};
	};

	DateHighZoomInputs.prototype._syncYearPickerMinMax = function() {
		const { min, max } = this._getYearBounds();
		this._oYearPicker._oMinDate.setYear(min);
		this._oYearPicker._oMaxDate.setYear(max);
	};

	DateHighZoomInputs.prototype._navigateYearPicker = function(iDirection) {
		const oMiddle = this._oYearPicker.getProperty("_middleDate");
		if (!oMiddle) { return; }
		const { min, max } = this._getYearBounds();
		const iYears = this._oYearPicker.getYears();
		let iNewYear = oMiddle.getYear() + (iDirection * iYears);
		iNewYear = Math.max(iNewYear, min);
		iNewYear = Math.min(iNewYear, max);
		// oMiddle year is in the active calendar type — convert back to Gregorian JS Date
		// so YearPicker.setDate() (which expects a local JS Date) resolves to the correct year.
		const sCalType = this._getActiveCalendarType();
		const oUDate = UniversalDate.getInstance(UI5Date.getInstance(), sCalType);
		oUDate.setUTCFullYear(iNewYear);
		oUDate.setUTCMonth(0);
		oUDate.setUTCDate(1);
		oUDate.setUTCHours(12, 0, 0, 0);
		this._oYearPicker.setDate(oUDate.getJSDate());
		this._updateYearPickerHeader();
	};

	DateHighZoomInputs.prototype._updateYearPickerHeader = function() {
		if (!this._oYearPicker || !this._oYearNavHeader) { return; }

		const iYears  = this._oYearPicker.getYears();
		const oMiddle = this._oYearPicker.getProperty("_middleDate");
		if (!oMiddle) { return; }

		const iMid   = oMiddle.getYear ? oMiddle.getYear() : oMiddle.getFullYear();
		const iStart = iMid - Math.floor(iYears / 2);
		const iEnd   = iStart + iYears - 1;
		const { min, max } = this._getYearBounds();
		this._oYearNavHeader.setTextButton2(iStart + " - " + iEnd);
		this._oYearNavHeader.setEnabledPrevious(iStart > min);
		this._oYearNavHeader.setEnabledNext(iEnd   < max);
	};

	// =========================================================
	// Validation
	// =========================================================

	DateHighZoomInputs.prototype._validateYear = function(iYear, bEndDate) {
		const { None, Error } = coreLibrary.ValueState;
		const oMinDate = this.getMinDate();
		const oMaxDate = this.getMaxDate();
		if (!oMinDate || !oMaxDate) { return true; }
		const sCalType = this._getActiveCalendarType();
		const iYearMin = UniversalDate.getInstance(oMinDate, sCalType).getFullYear();
		const iYearMax = UniversalDate.getInstance(oMaxDate, sCalType).getFullYear();
		const bValid = !isNaN(iYear) && iYear >= iYearMin && iYear <= iYearMax;
		this.setFieldValueState(library.DateHighZoomInputsField.Year,
			bValid ? None : Error,
			bValid ? "" : oResourceBundle.getText("DATEPICKER_HZ_YEAR_OUT_OF_RANGE", [iYearMin, iYearMax]),
			bEndDate
		);
		return bValid;
	};

	DateHighZoomInputs.prototype._validateMonth = function(iYear, iMonth, bEndDate) {
		const { None, Error } = coreLibrary.ValueState;
		const oMinDate = this.getMinDate();
		const oMaxDate = this.getMaxDate();
		if (!oMinDate || !oMaxDate) { return true; }
		const sCalType = this._getActiveCalendarType();
		const oUMin = UniversalDate.getInstance(oMinDate, sCalType);
		const oUMax = UniversalDate.getInstance(oMaxDate, sCalType);
		const iMinMonth = (iYear === oUMin.getFullYear()) ? oUMin.getMonth() : 0;
		const iMaxMonth = (iYear === oUMax.getFullYear()) ? oUMax.getMonth() : 11;
		const bValid = !isNaN(iMonth) && iMonth >= iMinMonth && iMonth <= iMaxMonth;
		this.setFieldValueState(library.DateHighZoomInputsField.Month,
			bValid ? None : Error,
			bValid ? "" : oResourceBundle.getText("DATEPICKER_HZ_MONTH_OUT_OF_RANGE"),
			bEndDate
		);
		return bValid;
	};

	DateHighZoomInputs.prototype._validateDay = function(iYear, iMonth, iDay, bEndDate) {
		const { None, Error } = coreLibrary.ValueState;
		const oMinDate = this.getMinDate();
		const oMaxDate = this.getMaxDate();
		if (!oMinDate || !oMaxDate) { return true; }
		const sCalType = this._getActiveCalendarType();
		const oUMin = UniversalDate.getInstance(oMinDate, sCalType);
		const oUMax = UniversalDate.getInstance(oMaxDate, sCalType);
		const oULast = UniversalDate.getInstance(UI5Date.getInstance(iYear, iMonth, 1), sCalType);
		oULast.setMonth(iMonth + 1);
		oULast.setDate(0);
		const iDaysInMonth = oULast.getDate();
		const iMinDay = (iYear === oUMin.getFullYear() && iMonth === oUMin.getMonth())
			? oUMin.getDate() : 1;
		const iMaxDay = (iYear === oUMax.getFullYear() && iMonth === oUMax.getMonth())
			? oUMax.getDate() : iDaysInMonth;
		const bValid = !isNaN(iDay) && iDay >= iMinDay && iDay <= iMaxDay;
		this.setFieldValueState(library.DateHighZoomInputsField.Day,
			bValid ? None : Error,
			bValid ? "" : oResourceBundle.getText("DATEPICKER_HZ_DAY_OUT_OF_RANGE"),
			bEndDate
		);
		return bValid;
	};

	/**
	 * Returns raw input values in the active calendar type (not converted to Gregorian).
	 * Used by validation which compares against min/max in the same calendar type.
	 * @param {boolean} bEndDate
	 * @returns {{year: int, month: int, day: int}}
	 * @private
	 */
	DateHighZoomInputs.prototype._getRawInputValues = function(bEndDate) {
		const sCalType = this._getActiveCalendarType();
		let iYear;
		if (this._isYearVisible()) {
			iYear = parseInt(bEndDate ? this._oYearInputEnd.getValue() : this._oYearInput.getValue());
		} else {
			// MonthDay mode — year not rendered, derive from dateValue
			const oRef = (bEndDate ? this.getSecondDateValue() : null) || this.getDateValue() || UI5Date.getInstance();
			iYear = (sCalType === "Gregorian")
				? oRef.getFullYear()
				: UniversalDate.getInstance(oRef, sCalType).getFullYear();
		}
		const oMonthSelect = bEndDate ? this._oMonthSelectEnd : this._oMonthSelect;
		const oDaySelect   = bEndDate ? this._oDaySelectEnd   : this._oDaySelect;
		const iMonth = this._isMonthVisible() ? parseInt(oMonthSelect.getSelectedKey()) : 0;
		const iDay   = this._isDayVisible()   ? parseInt(oDaySelect.getSelectedKey())   : 1;
		return { year: iYear, month: iMonth, day: iDay };
	};

	/**
	 * Validates the currently composed date against minDate/maxDate.
	 * @param {boolean} [bEndDate] If true, validates the end-date fields (range mode)
	 * @returns {boolean}
	 */
	DateHighZoomInputs.prototype._doValidate = function(bEndDate) {
		const { None } = coreLibrary.ValueState;
		const { year, month, day } = this._getRawInputValues(bEndDate);
		if (this._isYearVisible() && !this._validateYear(year, bEndDate)) {
			if (this._isMonthVisible()) {
				this.setFieldValueState(library.DateHighZoomInputsField.Month, None, "", bEndDate);
			}
			if (this._isDayVisible()) {
				this.setFieldValueState(library.DateHighZoomInputsField.Day, None, "", bEndDate);
			}
			return false;
		}
		if (this._isMonthVisible() && !this._validateMonth(year, month, bEndDate)) {
			if (this._isDayVisible()) {
				this.setFieldValueState(library.DateHighZoomInputsField.Day, None, "", bEndDate);
			}
			return false;
		}
		if (this._isDayVisible()) {
			return this._validateDay(year, month, day, bEndDate);
		}
		return true;
	};

	/**
	 * Validates the currently composed start date against minDate/maxDate.
	 * @returns {boolean}
	 */
	DateHighZoomInputs.prototype.validate = function() {
		return this._doValidate(false);
	};

	/**
	 * Clears the value state on all date fields (start and end in range mode).
	 * Call on cancel to remove any error indicators left from a previous failed validation.
	 */
	DateHighZoomInputs.prototype.resetValueState = function() {
		const { None } = coreLibrary.ValueState;
		const aFields = [library.DateHighZoomInputsField.Year];
		if (this._isMonthVisible()) { aFields.push(library.DateHighZoomInputsField.Month); }
		if (this._isDayVisible())   { aFields.push(library.DateHighZoomInputsField.Day);   }

		aFields.forEach((sField) => {
			this.setFieldValueState(sField, None, "");
		});
		if (this.getMode() === library.DateHighZoomInputsMode.Range) {
			aFields.forEach((sField) => {
				this.setFieldValueState(sField, None, "", true);
			});
		}
	};

	return DateHighZoomInputs;
});
