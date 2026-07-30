sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/unified/DateTypeRange',
		'sap/ui/unified/library',
		'sap/ui/core/library',
		'sap/ui/core/date/UI5Date',
		'sap/ui/core/format/DateFormat'
	], function(Controller, DateTypeRange, unifiedLibrary, coreLibrary, UI5Date, DateFormat) {
	"use strict";

	const CalendarDayType = unifiedLibrary.CalendarDayType;
	const AriaHasPopup = coreLibrary.aria.HasPopup;

	const oDateFormat = DateFormat.getDateInstance({ style: "long" });

	return Controller.extend("sap.ui.unified.sample.CalendarAriaHasPopup.CalendarAriaHasPopup", {

		onInit: function() {
			const oCal = this.byId("calendar"),
				oToday = UI5Date.getInstance(),
				iYear = oToday.getFullYear(),
				iMonth = oToday.getMonth();

			this._aSpecialDates = [];

			// Case 1: Special date with visual type + aria-haspopup
			this._addSpecialDate(oCal, {
				startDate: UI5Date.getInstance(iYear, iMonth, 5),
				type: CalendarDayType.Type01,
				ariaHasPopup: AriaHasPopup.Dialog
			});

			// Case 2: Date range with visual type + aria-haspopup
			this._addSpecialDate(oCal, {
				startDate: UI5Date.getInstance(iYear, iMonth, 10),
				endDate: UI5Date.getInstance(iYear, iMonth, 12),
				type: CalendarDayType.Type02,
				ariaHasPopup: AriaHasPopup.Dialog
			});

			// Case 3: type=None — no visual marking, only aria-haspopup
			this._addSpecialDate(oCal, {
				startDate: UI5Date.getInstance(iYear, iMonth, 20),
				type: CalendarDayType.None,
				ariaHasPopup: AriaHasPopup.Dialog
			});
		},

		_addSpecialDate: function(oCal, oConfig) {
			const oRange = new DateTypeRange(oConfig);
			oCal.addSpecialDate(oRange);
			this._aSpecialDates.push(oRange);
		},

		onDateSelect: function(oEvent) {
			const oCalendar = oEvent.getSource(),
				oSelectedDate = oCalendar.getSelectedDates()[0];

			if (!oSelectedDate) {
				return;
			}

			const oStart = oSelectedDate.getStartDate();
			const oMatchedRange = this._findSpecialDateRange(oStart);

			if (!oMatchedRange) {
				return;
			}

			const oPopover = this.byId("popover"),
				oDateTitle = this.byId("popoverDate"),
				oTypeText = this.byId("popoverType");

			const sDateLabel = this._buildDateLabel(oMatchedRange);
			const sTypeLabel = oMatchedRange.getType();

			oDateTitle.setText(sDateLabel);
			oTypeText.setText("Day type: " + sTypeLabel);

			// Open anchored to the specific day cell by its data-sap-day attribute
			const oDomRef = oCalendar.getDomRef();
			const sDay = oStart.getFullYear() +
				String(oStart.getMonth() + 1).padStart(2, "0") +
				String(oStart.getDate()).padStart(2, "0");
			const oDayCell = oDomRef && oDomRef.querySelector('[data-sap-day="' + sDay + '"]');
			oPopover.openBy(oDayCell || oCalendar);
		},

		_findSpecialDateRange: function(oDate) {
			return this._aSpecialDates.find(function(oRange) {
				if (!oRange.getProperty("ariaHasPopup")) {
					return false;
				}

				const oStart = oRange.getStartDate(),
					oEnd = oRange.getEndDate();

				const iStart = oStart ? UI5Date.getInstance(oStart.getFullYear(), oStart.getMonth(), oStart.getDate()).getTime() : null;
				const iEnd = oEnd ? UI5Date.getInstance(oEnd.getFullYear(), oEnd.getMonth(), oEnd.getDate()).getTime() : iStart;
				const iSelected = UI5Date.getInstance(oDate.getFullYear(), oDate.getMonth(), oDate.getDate()).getTime();

				return iStart !== null && iSelected >= iStart && iSelected <= iEnd;
			});
		},

		_buildDateLabel: function(oRange) {
			const oStart = oRange.getStartDate(),
				oEnd = oRange.getEndDate();

			if (oEnd && oEnd.getTime() !== oStart.getTime()) {
				return oDateFormat.format(oStart) + " – " + oDateFormat.format(oEnd);
			}
			return oDateFormat.format(oStart);
		}
	});

});
