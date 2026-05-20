/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/date/UI5Date',
	'sap/ui/unified/library'
], function(
	UI5Date,
	library
) {
	"use strict";

	const RecurrenceType = library.RecurrenceType;
	const RecurrenceRuleType = library.RecurrenceRuleType;
	const WeekOfMonth = library.WeekOfMonth;

	const RecurrenceUtils = {};

	const TIME_PERIOD = {
		ONE_DAY_IN_MS: 86400000, // 24 * 60 * 60 * 1000
		ONE_WEEK_IN_MS: 604800000 // 7 * 24 * 60 * 60 * 1000
	};

	const PERIOD_TYPE = {
		"WORKING_PERIOD": "working",
		"NON_WORKING_PERIOD": "non-working"
	};

	/**
	 * Normalize recurrenceDay input to canonical array of JS day indices (0..6, 0 = Sunday).
	 * Accepts number or array of numbers in JS-style (0=Sunday..6=Saturday).
	 * Returns sorted unique array of numbers in range 0..6.
	 * @param {number|Array<number>} vDays
	 * @returns {number[]}
	 * @private
	 */
	RecurrenceUtils._normalizeRecurrenceDays = function(vDays) {
		if (vDays == null) {
			return [];
		}
		const aDays = Array.isArray(vDays) ? vDays.slice() : [vDays];
		const oUniqueDays = new Set();
		aDays.forEach((vDay) => {
			const iDay = Number(vDay);
			if (!isNaN(iDay) && iDay >= 0 && iDay <= 6) {
				oUniqueDays.add(iDay);
			}
		});
		return Array.from(oUniqueDays).sort((a, b) => a - b);
	};

	/**
	 * Evaluates whether there is an occurrence for a given date.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
	 * @return {boolean} True if there is an occurrence for this day
	 * @private
	 */
	RecurrenceUtils.hasOccurrenceOnDate = function(oDate) {
		const oStartDate = UI5Date.getInstance(this.getStartDate());
		const oCurrentDate = UI5Date.getInstance(oDate);
		const oEndDate = this.getRecurrenceEndDate();
		const sRecurrenceType = this.getRecurrenceType();
		const iPattern = this.getRecurrencePattern();

		// Normalize dates
		oStartDate.setHours(0, 0, 0, 0);
		oCurrentDate.setHours(0, 0, 0, 0);
		const oEndDateNorm = oEndDate ? UI5Date.getInstance(oEndDate) : null;
		if (oEndDateNorm) {
			oEndDateNorm.setHours(23, 59, 59, 999);
		}

		const oStartDateUTC = Date.UTC(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate());
		const oCurrentDateUTC = Date.UTC(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate());

		// Check if date is in valid range
		const isDateInRange = oCurrentDate >= oStartDate && (!oEndDateNorm || oCurrentDate <= oEndDateNorm);

		if (!isDateInRange) {
			return false;
		}

		// Daily
		if (sRecurrenceType === RecurrenceType.Daily) {
			const iDaysDiff = Math.floor((oCurrentDateUTC - oStartDateUTC) / TIME_PERIOD.ONE_DAY_IN_MS);
			return iDaysDiff >= 0 && iDaysDiff % iPattern === 0;
		}

		// Weekly
		if (sRecurrenceType === RecurrenceType.Weekly) {
			const oRule = this.getRecurrenceRule ? this.getRecurrenceRule() : null;
			const aRecurrenceDays = oRule ? oRule.getDays() : [];
			const iCurrentDayOfWeek = oCurrentDate.getDay();

			if (aRecurrenceDays.length > 0 && !aRecurrenceDays.includes(iCurrentDayOfWeek)) {
				return false;
			}

			if (aRecurrenceDays.length === 0 && iCurrentDayOfWeek !== oStartDate.getDay()) {
				return false;
			}

			// Align both dates to their ISO week Monday (Mon=1..Sun=0 → offset 1..6,0)
			const iStartDaysToMonday = oStartDate.getDay() === 0 ? 6 : oStartDate.getDay() - 1;
			const oStartWeekMondayUTC = Date.UTC(
				oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() - iStartDaysToMonday
			);
			const iCurrentDaysToMonday = oCurrentDate.getDay() === 0 ? 6 : oCurrentDate.getDay() - 1;
			const oCurrentWeekMondayUTC = Date.UTC(
				oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate() - iCurrentDaysToMonday
			);
			const iWeeksDiff = Math.round((oCurrentWeekMondayUTC - oStartWeekMondayUTC) / TIME_PERIOD.ONE_WEEK_IN_MS);
			return iWeeksDiff >= 0 && iWeeksDiff % iPattern === 0;
		}

		// Monthly
		if (sRecurrenceType === RecurrenceType.Monthly) {
			const oRule = this.getRecurrenceRule ? this.getRecurrenceRule() : null;
			const iMonthsDiff = (oCurrentDate.getFullYear() - oStartDate.getFullYear()) * 12 +
								(oCurrentDate.getMonth() - oStartDate.getMonth());

			if (iMonthsDiff < 0 || iMonthsDiff % iPattern !== 0) {
				return false;
			}

			if (!oRule || (oRule.getType() === RecurrenceRuleType.DayOfMonth && !oRule.getDayOfMonth())) {
				return oCurrentDate.getDate() === oStartDate.getDate();
			}

			if (oRule.getType() === RecurrenceRuleType.DayOfMonth) {
				return oCurrentDate.getDate() === oRule.getDayOfMonth();
			}

			return RecurrenceUtils._matchesWeekOrderInMonth(oCurrentDate, oRule);
		}

		// Yearly
		if (sRecurrenceType === RecurrenceType.Yearly) {
			const oRule = this.getRecurrenceRule ? this.getRecurrenceRule() : null;
			const iYearsDiff = oCurrentDate.getFullYear() - oStartDate.getFullYear();

			if (iYearsDiff < 0 || iYearsDiff % iPattern !== 0) {
				return false;
			}

			if (!oRule || (oRule.getType() === RecurrenceRuleType.DayOfMonth && !oRule.getDayOfMonth())) {
				return oCurrentDate.getMonth() === oStartDate.getMonth() &&
					   oCurrentDate.getDate() === oStartDate.getDate();
			}

			const iExpectedMonth = oRule.getMonth() >= 0 ? oRule.getMonth() : oStartDate.getMonth();
			if (oCurrentDate.getMonth() !== iExpectedMonth) {
				return false;
			}

			if (oRule.getType() === RecurrenceRuleType.DayOfMonth) {
				return oCurrentDate.getDate() === oRule.getDayOfMonth();
			}

			return RecurrenceUtils._matchesWeekOrderInMonth(oCurrentDate, oRule);
		}

		return false;
	};

	/**
	 * Checks if date matches week order in month (e.g., "second Tuesday")
	 * @param {Date} oDate - Date to check
	 * @param {object} oAdvanced - Advanced recurrence config
	 * @returns {boolean} True if matches
	 * @private
	 */
	RecurrenceUtils._matchesWeekOrderInMonth = function(oDate, oAdvanced) {
		const iDayOfWeek = oAdvanced.getDayOfWeek();
		const sWeekOfMonth = oAdvanced.getWeekOfMonth();

		// Check if the day of week matches
		if (oDate.getDay() !== iDayOfWeek) {
			return false;
		}

		if (sWeekOfMonth === WeekOfMonth.Last) {
			// Check if this is the last occurrence in the month
			const oNextWeek = UI5Date.getInstance(oDate.getFullYear(), oDate.getMonth(), oDate.getDate() + 7);
			return oNextWeek.getMonth() !== oDate.getMonth();
		} else {
			// Count how many times this day of week has occurred in the month up to this date
			const iOccurrence = Math.floor((oDate.getDate() - 1) / 7) + 1;
			const mWeekOfMonthMap = {
				[WeekOfMonth.First]: 1,
				[WeekOfMonth.Second]: 2,
				[WeekOfMonth.Third]: 3,
				[WeekOfMonth.Fourth]: 4
			};
			return iOccurrence === mWeekOfMonthMap[sWeekOfMonth];
		}
	};

	RecurrenceUtils.calculateDurationInCell = function (oNonWorkingPart, oCellStartDate, iCurrentPointInMinutes){
		const oNonWorkingPartDate = oNonWorkingPart.getStartDate();
		const iMinutesInOneHour = 60;
		let iDuration = oNonWorkingPart.getDurationInMinutes();

		if (oNonWorkingPartDate.getHours() < oCellStartDate.getHours()) {
			const iTimeCell = oCellStartDate.getHours() * iMinutesInOneHour + oCellStartDate.getMinutes();
			const iTimePart = oNonWorkingPartDate.getHours() * iMinutesInOneHour + oNonWorkingPartDate.getMinutes();
			iDuration -= (iTimeCell - iTimePart);
		} else if (oNonWorkingPartDate.getHours() === oCellStartDate.getHours() && oNonWorkingPartDate.getMinutes() > 0) {
			iDuration = oNonWorkingPart.getDurationInMinutes() + iCurrentPointInMinutes > 60 ? iMinutesInOneHour - iCurrentPointInMinutes : oNonWorkingPart.getDurationInMinutes();
		} else if (oNonWorkingPartDate.getHours() === oCellStartDate.getHours() && oNonWorkingPart.getEndDate().getHours() <= oCellStartDate.getHours() + 1) {
			iDuration = oNonWorkingPart.getDurationInMinutes();
		} else {
			iDuration = iMinutesInOneHour - iCurrentPointInMinutes;
		}

		return iDuration;
	};

	/**
	 * Determines what portion of a calendar cell (representing one hour) is filled with non-working time and what portion is filled with working time.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oCellStartDate A date instance for the current cell
	 * @param {Array<sap.ui.unified.NonWorkingPeriod | sap.ui.unified.RecurringNonWorkingPeriod>} aNonWorkingForCurrentHours An array of non-working periods
	 * @return {Array} An array of objects containing information about the type and duration of each part of the cell.
	 * @private
	 * @ui5-restricted sap.ui.unified.RecurringNonWorkingPeriod
	 */
	RecurrenceUtils.getWorkingAndNonWorkingSegments = function (oCellStartDate, aNonWorkingForCurrentHours) {
		const aCellInfo = [];
		const iMinutesInOneHour = 60;

		let iCurrentPointInMinutes = 0;
		let index = 0;

		while (iCurrentPointInMinutes < iMinutesInOneHour) {
			const oNonWorkingPart = aNonWorkingForCurrentHours[index];
			const oNonWorkingPartDate = oNonWorkingPart?.getStartDate();

			if (!oNonWorkingPart) {
				const iCurrentDuration = iMinutesInOneHour - iCurrentPointInMinutes;
				aCellInfo.push({
					type: PERIOD_TYPE.WORKING_PERIOD,
					duration: iCurrentDuration
				});

				return aCellInfo;
			}

			let iDuration = this.calculateDurationInCell(oNonWorkingPart, oCellStartDate, iCurrentPointInMinutes);
			const iStartTimeInMin = oNonWorkingPartDate.getMinutes();

			if (iDuration > iMinutesInOneHour && oNonWorkingPartDate.getHours() < oCellStartDate.getHours()) {
				aCellInfo.push({
					type: PERIOD_TYPE.NON_WORKING_PERIOD,
					duration: iMinutesInOneHour
				});

				return aCellInfo;
			}

			if (iStartTimeInMin === iCurrentPointInMinutes || oNonWorkingPartDate.getHours() < oCellStartDate.getHours()) {
				aCellInfo.push({
					type: PERIOD_TYPE.NON_WORKING_PERIOD,
					duration: iDuration
				});
				index++;
			} else {
				iDuration = iStartTimeInMin - iCurrentPointInMinutes;
				aCellInfo.push({
					type: PERIOD_TYPE.WORKING_PERIOD,
					duration: iDuration
				});
			}

			iCurrentPointInMinutes += iDuration;
		}

		return aCellInfo;
	};


	/**
	 * Gets all occurrence dates within a given range.
	 * PERFORMANCE: Pre-calculates all dates instead of checking each individually.
	 * @param {Date} oRangeStart - Start of range
	 * @param {Date} oRangeEnd - End of range
	 * @returns {Array<Date>} Array of occurrence dates
	 * @private
	 */
	RecurrenceUtils.getOccurrencesInRange = function(oRangeStart, oRangeEnd) {
		const aOccurrences = [];
		const oRecurrenceStart = this.getStartDate();
		const oRecurrenceEnd = this.getRecurrenceEndDate();

		// Early exit if ranges don't overlap (normalise to date-only for comparison)
		const oRangeEndNorm = UI5Date.getInstance(oRangeEnd);
		oRangeEndNorm.setHours(23, 59, 59, 999);
		const oRecurrenceStartNorm = UI5Date.getInstance(oRecurrenceStart);
		oRecurrenceStartNorm.setHours(0, 0, 0, 0);
		if (oRangeEndNorm < oRecurrenceStartNorm || (oRecurrenceEnd && oRangeStart > oRecurrenceEnd)) {
			return [];
		}

		// Find first occurrence in range
		const oFirstOccurrence = RecurrenceUtils._findFirstOccurrenceInRange.call(this, oRangeStart, oRecurrenceStart);
		if (!oFirstOccurrence) {
			return [];
		}

		let oCurrentDate = oFirstOccurrence;
		const sType = this.getRecurrenceType();
		const iPattern = this.getRecurrencePattern();
		const oEffectiveEnd = oRecurrenceEnd && oRecurrenceEnd < oRangeEnd ? oRecurrenceEnd : oRangeEnd;

		// Normalize effective end to end-of-day so that the last day is inclusive
		const oEffectiveEndNormalized = UI5Date.getInstance(oEffectiveEnd);
		oEffectiveEndNormalized.setHours(23, 59, 59, 999);

		// For Monthly/Yearly DayOfMonth rules, track the canonical target day so setMonth
		// rollover (e.g. Jan 31 → Feb 28) doesn't corrupt subsequent jumps.
		// For DayOfWeek rules, iCanonicalDay stays null → scan mode (advance 1 day at a time)
		// so hasOccurrenceOnDate can identify the correct weekday occurrence in each cycle.
		let iCanonicalDay = null;
		if (sType === RecurrenceType.Monthly || sType === RecurrenceType.Yearly) {
			const oRule = this.getRecurrenceRule ? this.getRecurrenceRule() : null;
			const bDayOfWeekRule = oRule?.getType() === RecurrenceRuleType.DayOfWeek;
			if (!bDayOfWeekRule) {
				// DayOfMonth: use explicit day or fall back to start date day
				if (oRule?.getDayOfMonth()) {
					iCanonicalDay = oRule.getDayOfMonth();
				} else {
					iCanonicalDay = oRecurrenceStart.getDate();
				}
			}
			// DayOfWeek: iCanonicalDay stays null → scan mode
		}

		// Ensure the iteration cursor starts no earlier than the requested range start
		// (for Weekly the candidate may point to the start of an active cycle before oRangeStart)
		if (oCurrentDate < oRangeStart) {
			const oRangeStartNorm = UI5Date.getInstance(oRangeStart);
			oRangeStartNorm.setHours(0, 0, 0, 0);
			oCurrentDate = oRangeStartNorm;
		}

		// Collect all occurrences
		while (oCurrentDate <= oEffectiveEndNormalized) {
			if (RecurrenceUtils.hasOccurrenceOnDate.call(this, oCurrentDate)) {
				aOccurrences.push(UI5Date.getInstance(oCurrentDate));
			}

			// Jump to next potential occurrence
			oCurrentDate = RecurrenceUtils._getNextPotentialOccurrence(oCurrentDate, sType, iPattern, iCanonicalDay);
		}

		return aOccurrences;
	};

	/**
	 * Finds first occurrence in range (skip irrelevant dates)
	 * @private
	 */
	RecurrenceUtils._findFirstOccurrenceInRange = function(oRangeStart, oRecurrenceStart) {
		if (oRangeStart <= oRecurrenceStart) {
			const oRuleInit = this.getRecurrenceRule ? this.getRecurrenceRule() : null;
			const sTypeInit = this.getRecurrenceType();
			const bDayOfMonthInit = oRuleInit?.getType() === RecurrenceRuleType.DayOfMonth &&
					oRuleInit?.getDayOfMonth();
			if (bDayOfMonthInit && (sTypeInit === RecurrenceType.Monthly || sTypeInit === RecurrenceType.Yearly)) {
				const oResult = UI5Date.getInstance(oRecurrenceStart);
				oResult.setDate(1); // prevent month rollover
				if (sTypeInit === RecurrenceType.Yearly) {
					const iRuleMonth = oRuleInit.getMonth() >= 0 ? oRuleInit.getMonth() : oRecurrenceStart.getMonth();
					oResult.setMonth(iRuleMonth);
				}
				const iDays = UI5Date.getInstance(oResult.getFullYear(), oResult.getMonth() + 1, 0).getDate();
				oResult.setDate(Math.min(oRuleInit.getDayOfMonth(), iDays));
				// For Yearly: if the computed first occurrence falls before the recurrence start
				// (e.g. rule says Jan 12 but startDate is May 4 of the same year), advance one year.
				if (sTypeInit === RecurrenceType.Yearly) {
					const oRecStartNorm = UI5Date.getInstance(oRecurrenceStart);
					oRecStartNorm.setHours(0, 0, 0, 0);
					if (oResult < oRecStartNorm) {
						oResult.setDate(1);
						oResult.setFullYear(oResult.getFullYear() + this.getRecurrencePattern());
						const iDaysNext = UI5Date.getInstance(oResult.getFullYear(), oResult.getMonth() + 1, 0).getDate();
						oResult.setDate(Math.min(oRuleInit.getDayOfMonth(), iDaysNext));
					}
				}
				return oResult;
			}
			return UI5Date.getInstance(oRecurrenceStart);
		}

		const sType = this.getRecurrenceType();
		const iPattern = this.getRecurrencePattern();
		let oCandidate = UI5Date.getInstance(oRecurrenceStart);

		switch (sType) {
			case RecurrenceType.Daily: {
				const iDaysDiff = (Date.UTC(oRangeStart.getFullYear(), oRangeStart.getMonth(), oRangeStart.getDate()) -
								Date.UTC(oRecurrenceStart.getFullYear(), oRecurrenceStart.getMonth(), oRecurrenceStart.getDate())) / TIME_PERIOD.ONE_DAY_IN_MS;
				const iCycles = Math.ceil(iDaysDiff / iPattern);
				oCandidate.setDate(oCandidate.getDate() + (iCycles * iPattern));
				break;
			}

			case RecurrenceType.Weekly: {
				// Align start date to its ISO Monday and do the same for the range start,
				// then compute how many ISO calendar weeks separate them.
				const iStartDay = oRecurrenceStart.getDay();
				const iStartToMon = iStartDay === 0 ? 6 : iStartDay - 1;
				const oStartMon = UI5Date.getInstance(oRecurrenceStart);
				oStartMon.setDate(oStartMon.getDate() - iStartToMon);
				oStartMon.setHours(0, 0, 0, 0);
				const iRangeDay = oRangeStart.getDay();
				const iRangeToMon = iRangeDay === 0 ? 6 : iRangeDay - 1;
				const oRangeMon = UI5Date.getInstance(oRangeStart);
				oRangeMon.setDate(oRangeMon.getDate() - iRangeToMon);
				oRangeMon.setHours(0, 0, 0, 0);
				const iISOWeeksDiff = Math.round((oRangeMon - oStartMon) / TIME_PERIOD.ONE_WEEK_IN_MS);
				const iActiveCycleOffset = Math.floor(iISOWeeksDiff / iPattern) * iPattern;
				// Position candidate at the Monday of the last active cycle before range start
				oCandidate = UI5Date.getInstance(oStartMon);
				oCandidate.setDate(oCandidate.getDate() + (iActiveCycleOffset * 7));
				// Restore original time-of-day from recurrence start
				oCandidate.setHours(oRecurrenceStart.getHours(), oRecurrenceStart.getMinutes(),
									oRecurrenceStart.getSeconds(), oRecurrenceStart.getMilliseconds());
				break;
			}

			case RecurrenceType.Monthly: {
				const iMonthsDiff = (oRangeStart.getFullYear() - oRecurrenceStart.getFullYear()) * 12 +
								  (oRangeStart.getMonth() - oRecurrenceStart.getMonth());
				const iCyclesMonths = Math.floor(iMonthsDiff / iPattern);
				// Use DayOfMonth rule's day if present; fall back to the start date's day
				const oRuleM = this.getRecurrenceRule ? this.getRecurrenceRule() : null;
				const bDayOfWeekM = oRuleM?.getType() === RecurrenceRuleType.DayOfWeek;
				const iOriginalDay = (oRuleM?.getType() === RecurrenceRuleType.DayOfMonth &&
						oRuleM?.getDayOfMonth())
					? oRuleM.getDayOfMonth()
					: oRecurrenceStart.getDate();
				const iTargetMonth = oRecurrenceStart.getMonth() + (iCyclesMonths * iPattern);
				// Set to day 1 first to avoid rollover, then set the intended month and restore the day
				oCandidate.setDate(1);
				oCandidate.setMonth(iTargetMonth);
				const iDaysInMonth = UI5Date.getInstance(oCandidate.getFullYear(), oCandidate.getMonth() + 1, 0).getDate();
				oCandidate.setDate(Math.min(iOriginalDay, iDaysInMonth));
				// Determine whether to advance to the next cycle.
				// For DayOfMonth: advance whenever the specific target day is before the range start.
				// For DayOfWeek (scan mode): the candidate is day 1 of the month; the actual occurrence
				// might still be later in that month. Only advance if the ENTIRE month lies before the
				// range start — otherwise leave the candidate as-is and let getOccurrencesInRange bump
				// the cursor to rangeStart, where the day-by-day scan will find the occurrence.
				const oMonthEnd = bDayOfWeekM
					? UI5Date.getInstance(oCandidate.getFullYear(), oCandidate.getMonth() + 1, 0)
					: null;
				const bAdvance = bDayOfWeekM
					? oMonthEnd < oRangeStart
					: oCandidate < oRangeStart;
				if (bAdvance) {
					const iNextTargetMonth = iTargetMonth + iPattern;
					// Re-init from base year so setMonth(iNextTargetMonth) overflow lands in the correct year.
					oCandidate = UI5Date.getInstance(oRecurrenceStart);
					oCandidate.setDate(1);
					oCandidate.setMonth(iNextTargetMonth);
					const iDaysInNextMonth = UI5Date.getInstance(oCandidate.getFullYear(), oCandidate.getMonth() + 1, 0).getDate();
					oCandidate.setDate(Math.min(iOriginalDay, iDaysInNextMonth));
				}
				break;
			}

			case RecurrenceType.Yearly: {
				const iYearsDiff = oRangeStart.getFullYear() - oRecurrenceStart.getFullYear();
				const iCyclesYears = Math.floor(iYearsDiff / iPattern);
				const oRuleY = this.getRecurrenceRule ? this.getRecurrenceRule() : null;
				const bDayOfMonthY = oRuleY?.getType() === RecurrenceRuleType.DayOfMonth &&
						oRuleY?.getDayOfMonth();
				const bDayOfWeekY = oRuleY?.getType() === RecurrenceRuleType.DayOfWeek;

				if (bDayOfMonthY) {
					const iExpectedMonth = oRuleY.getMonth() >= 0 ? oRuleY.getMonth() : oRecurrenceStart.getMonth();
					const iTargetYear = oRecurrenceStart.getFullYear() + (iCyclesYears * iPattern);
					oCandidate.setDate(1);
					oCandidate.setFullYear(iTargetYear);
					oCandidate.setMonth(iExpectedMonth);
					const iDaysInMonth = UI5Date.getInstance(oCandidate.getFullYear(), oCandidate.getMonth() + 1, 0).getDate();
					oCandidate.setDate(Math.min(oRuleY.getDayOfMonth(), iDaysInMonth));
					// Advance one year if candidate is still before the range start
					if (oCandidate < oRangeStart) {
						oCandidate.setDate(1);
						oCandidate.setFullYear(oCandidate.getFullYear() + iPattern);
						const iDaysInNextYear = UI5Date.getInstance(oCandidate.getFullYear(), oCandidate.getMonth() + 1, 0).getDate();
						oCandidate.setDate(Math.min(oRuleY.getDayOfMonth(), iDaysInNextYear));
					}
				} else if (bDayOfWeekY) {
					// For DayOfWeek (scan mode): position candidate at day 1 of the rule's target
					// month in the target year — not the start date's month. Only advance one year
					// if the entire target month lies before the range start.
					const iExpectedMonthY = oRuleY.getMonth() >= 0 ? oRuleY.getMonth() : oRecurrenceStart.getMonth();
					oCandidate.setDate(1);
					oCandidate.setFullYear(oCandidate.getFullYear() + (iCyclesYears * iPattern));
					oCandidate.setMonth(iExpectedMonthY);
					const oMonthEndY = UI5Date.getInstance(oCandidate.getFullYear(), oCandidate.getMonth() + 1, 0);
					if (oMonthEndY < oRangeStart) {
						oCandidate.setDate(1);
						oCandidate.setFullYear(oCandidate.getFullYear() + iPattern);
						oCandidate.setMonth(iExpectedMonthY);
					}
				} else {
					// setDate(1) prevents Feb 29 → Mar 1 overflow when the target year is not a leap year.
					oCandidate.setDate(1);
					oCandidate.setFullYear(oCandidate.getFullYear() + (iCyclesYears * iPattern));
					const iExpectedMonthFallback = oCandidate.getMonth();
					const iExpectedDayFallback = oRecurrenceStart.getDate();
					const iDaysFallback = UI5Date.getInstance(oCandidate.getFullYear(), iExpectedMonthFallback + 1, 0).getDate();
					oCandidate.setDate(Math.min(iExpectedDayFallback, iDaysFallback));
					// Advance one more cycle if candidate is still before range start
					// (e.g. startDate = Feb 29, range starts Mar 1 of same year → candidate lands on
					// Feb 28 of that year, which is before the range; without advancing,
					// _getNextPotentialOccurrence would stay in March every subsequent year).
					if (oCandidate < oRangeStart) {
						oCandidate.setDate(1);
						oCandidate.setFullYear(oCandidate.getFullYear() + iPattern);
						const iDaysNext = UI5Date.getInstance(oCandidate.getFullYear(), oCandidate.getMonth() + 1, 0).getDate();
						oCandidate.setDate(Math.min(iExpectedDayFallback, iDaysNext));
					}
				}
				break;
			}
		}

		return oCandidate;
	};

	/**
	 * Gets next potential occurrence date (jump by pattern interval)
	 * @private
	 */
	RecurrenceUtils._getNextPotentialOccurrence = function(oDate, sType, iPattern, iCanonicalDay) {
		const oNext = UI5Date.getInstance(oDate);

		switch (sType) {
			case RecurrenceType.Daily:
				oNext.setDate(oNext.getDate() + iPattern);
				break;
			case RecurrenceType.Weekly:
				oNext.setDate(oNext.getDate() + 1); // Check next day (due to recurrenceDay array)
				break;
			case RecurrenceType.Monthly: {
				if (iCanonicalDay === null) {
					// DayOfWeek scan mode: advance one day at a time
					oNext.setDate(oNext.getDate() + 1);
				} else {
					// DayOfMonth: jump to target day in next cycle month (avoid setMonth rollover)
					oNext.setDate(1);
					oNext.setMonth(oNext.getMonth() + iPattern);
					const iDays = UI5Date.getInstance(oNext.getFullYear(), oNext.getMonth() + 1, 0).getDate();
					oNext.setDate(Math.min(iCanonicalDay, iDays));
				}
				break;
			}
			case RecurrenceType.Yearly:
				if (iCanonicalDay === null) {
					// DayOfWeek scan mode: advance one day at a time
					oNext.setDate(oNext.getDate() + 1);
				} else {
					// setDate(1) first to prevent Feb 29 → Mar 1 overflow in non-leap target years.
					oNext.setDate(1);
					oNext.setFullYear(oNext.getFullYear() + iPattern);
					const iDaysY = UI5Date.getInstance(oNext.getFullYear(), oNext.getMonth() + 1, 0).getDate();
					oNext.setDate(Math.min(iCanonicalDay, iDaysY));
				}
				break;
		}

		return oNext;
	};

	/**
	 * Initializes the occurrence and range caches on the calling object.
	 * @this {sap.ui.unified.RecurringCalendarAppointment|sap.ui.unified.RecurringNonWorkingPeriod}
	 * @private
	 */
	RecurrenceUtils.initCache = function() {
		this._occurrenceCache = new Map();
		this._rangeCache = new Map();
	};

	/**
	 * Clears the occurrence and range caches on the calling object.
	 * @this {sap.ui.unified.RecurringCalendarAppointment|sap.ui.unified.RecurringNonWorkingPeriod}
	 * @private
	 */
	RecurrenceUtils.invalidateCache = function() {
		if (this._occurrenceCache) {
			this._occurrenceCache.clear();
		}
		if (this._rangeCache) {
			this._rangeCache.clear();
		}
	};

	/**
	 * Returns whether an occurrence exists on the given date, using a per-instance cache.
	 * @this {sap.ui.unified.RecurringCalendarAppointment|sap.ui.unified.RecurringNonWorkingPeriod}
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate - Date to check
	 * @returns {boolean}
	 * @private
	 */
	RecurrenceUtils.hasOccurrenceOnDateCached = function(oDate) {
		const sCacheKey = `${oDate.getFullYear()}-${oDate.getMonth()}-${oDate.getDate()}`;

		if (!this._occurrenceCache) {
			RecurrenceUtils.initCache.call(this);
		}

		if (this._occurrenceCache.has(sCacheKey)) {
			return this._occurrenceCache.get(sCacheKey);
		}

		const bResult = RecurrenceUtils.hasOccurrenceOnDate.call(this, oDate);

		if (this._occurrenceCache.size > 365) {
			this._occurrenceCache.clear();
		}

		this._occurrenceCache.set(sCacheKey, bResult);
		return bResult;
	};

	/**
	 * Builds a string key for a date range.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate
	 * @param {Date|module:sap/ui/core/date/UI5Date} oEndDate
	 * @returns {string}
	 * @private
	 */
	RecurrenceUtils._getRangeKey = function(oStartDate, oEndDate) {
		const sStart = `${oStartDate.getFullYear()}-${oStartDate.getMonth() + 1}-${oStartDate.getDate()}`;
		const sEnd = `${oEndDate.getFullYear()}-${oEndDate.getMonth() + 1}-${oEndDate.getDate()}`;
		return `${sStart}|${sEnd}`;
	};

	/**
	 * Returns cached occurrences for a date range, or null if not cached.
	 * @this {sap.ui.unified.RecurringCalendarAppointment|sap.ui.unified.RecurringNonWorkingPeriod}
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate
	 * @param {Date|module:sap/ui/core/date/UI5Date} oEndDate
	 * @returns {Array|null}
	 * @private
	 */
	RecurrenceUtils.getCachedOccurrences = function(oStartDate, oEndDate) {
		if (!this._rangeCache) {
			RecurrenceUtils.initCache.call(this);
		}
		return this._rangeCache.get(RecurrenceUtils._getRangeKey(oStartDate, oEndDate)) || null;
	};

	/**
	 * Stores occurrences for a date range in the cache.
	 * @this {sap.ui.unified.RecurringCalendarAppointment|sap.ui.unified.RecurringNonWorkingPeriod}
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate
	 * @param {Date|module:sap/ui/core/date/UI5Date} oEndDate
	 * @param {Array} aOccurrences
	 * @private
	 */
	RecurrenceUtils.setCachedOccurrences = function(oStartDate, oEndDate, aOccurrences) {
		if (!this._rangeCache) {
			RecurrenceUtils.initCache.call(this);
		}
		if (this._rangeCache.size > 12) {
			this._rangeCache.delete(this._rangeCache.keys().next().value);
		}
		this._rangeCache.set(RecurrenceUtils._getRangeKey(oStartDate, oEndDate), aOccurrences);
	};

	return RecurrenceUtils;

});
