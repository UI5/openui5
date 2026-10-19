sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/CheckBox",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/m/DatePicker",
	"sap/m/DateRangeSelection",
	"sap/m/DateTimePicker",
	"sap/m/TimePicker",
	"sap/ui/core/Core",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library"
], async function (App, Page, Panel, CheckBox, Text, FormattedText,
		DatePicker, DateRangeSelection, DateTimePicker, TimePicker,
		Core, ShortcutHintsMixin,
		Calendar, CalendarLegend, CalendarLegendItem, DateTypeRange, unifiedLibrary) {
	"use strict";

	await Core.ready();

	const CalendarDayType = unifiedLibrary.CalendarDayType;

	const oToday = new Date();
	function dateOffset(iDays) {
		const d = new Date(oToday);
		d.setDate(d.getDate() + iDays);
		return d;
	}

	// 1. DatePicker — with F4 shortcut hint in the tooltip
	const oDatePicker = new DatePicker({ id: "dp1" });
	ShortcutHintsMixin.addConfig(oDatePicker, { event: "press", message: "F4" }, oDatePicker);

	// 2. DateRangeSelection
	const oDateRangeSelection = new DateRangeSelection({
		id: "drs1",
		dateValue: dateOffset(0),
		secondDateValue: dateOffset(7)
	});

	// 3. TimePicker
	const oTimePicker = new TimePicker({
		id: "tp1",
		value: "02:30:00 PM",
		valueFormat: "hh:mm:ss a",
		displayFormat: "hh:mm:ss a",
		showCurrentTimeButton: true
	});

	// 4. DateTimePicker
	const oDateTimePicker = new DateTimePicker({
		id: "dtp1",
		value: "2024-11-15T14:30:00",
		valueFormat: "yyyy-MM-dd'T'HH:mm:ss",
		displayFormat: "dd/MM/yyyy HH:mm:ss"
	});

	// 5. Calendar — with special dates and a legend
	const oLegend = new CalendarLegend({
		items: [
			new CalendarLegendItem({ type: CalendarDayType.Type01, text: "Tomorrow — Type01" }),
			new CalendarLegendItem({ type: CalendarDayType.Type02, text: "In 3 days — Type02" }),
			new CalendarLegendItem({ type: CalendarDayType.Type03, text: "Range in 5–7 days — Type03" })
		]
	});
	const oCalendar = new Calendar({
		id: "cal1",
		showCurrentDateButton: true,
		showWeekNumbers: true,
		showWeekNumbersHeader: true,
		intervalSelection: true,
		legend: oLegend,
		specialDates: [
			new DateTypeRange({ startDate: dateOffset(1), type: CalendarDayType.Type01, tooltip: "Tomorrow — Type01" }),
			new DateTypeRange({ startDate: dateOffset(3), type: CalendarDayType.Type02, tooltip: "In 3 days — Type02" }),
			new DateTypeRange({ startDate: dateOffset(5), endDate: dateOffset(7), type: CalendarDayType.Type03, tooltip: "Range in 5–7 days — Type03" })
		]
	});

	// 6. Calendar — intervalSelection: false (week number tooltips must NOT appear)
	const oLegend2 = new CalendarLegend({
		items: [
			new CalendarLegendItem({ type: CalendarDayType.Type01, text: "Tomorrow — Type01" }),
			new CalendarLegendItem({ type: CalendarDayType.Type02, text: "In 3 days — Type02" })
		]
	});
	const oCalendarNoInterval = new Calendar({
		id: "cal2",
		showCurrentDateButton: true,
		showWeekNumbers: true,
		showWeekNumbersHeader: true,
		intervalSelection: false,
		legend: oLegend2,
		specialDates: [
			new DateTypeRange({ startDate: dateOffset(1), type: CalendarDayType.Type01, tooltip: "Tomorrow — Type01" }),
			new DateTypeRange({ startDate: dateOffset(3), type: CalendarDayType.Type02, tooltip: "In 3 days — Type02" })
		]
	});

	const oIntro = new FormattedText({
		htmlText:
			"Bootstrap runs with <code>data-sap-ui-xx-tooltip=&quot;enhanced&quot;</code>. " +
			"<code>DatePicker</code>, <code>DateRangeSelection</code>, <code>TimePicker</code>, and <code>DateTimePicker</code> " +
			"wire their picker icon to <code>sap.ui.core.tooltip.TooltipEnablement</code>. " +
			"The standalone <code>Calendar</code> shows enhanced tooltips on its header buttons and special-day cells. " +
			"Week number cells show a tooltip only when <code>intervalSelection</code> is <code>true</code>. " +
			"Hover or keyboard-focus the icons and buttons to see the tooltip; press <kbd>Esc</kbd> to dismiss."
	}).addStyleClass("sapUiResponsiveMargin");

	function pickerCheckBoxes(oPicker) {
		return [
			new CheckBox({
				text: "Enabled",
				selected: true,
				select: function (oEvent) {
					oPicker.setEnabled(oEvent.getParameter("selected"));
				}
			}).addStyleClass("sapUiSmallMarginBegin"),
			new CheckBox({
				text: "Editable",
				selected: true,
				select: function (oEvent) {
					oPicker.setEditable(oEvent.getParameter("selected"));
				}
			}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom")
		];
	}

	function panel(sHeading, sIntro, oPicker) {
		return new Panel({
			headerText: sHeading,
			expandable: false,
			width: "30rem",
			content: [
				new Text({ text: sIntro }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				...pickerCheckBoxes(oPicker),
				oPicker
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	const oPage = new Page({
		title: "Date/Time Controls — TooltipEnablement",
		content: [
			oIntro,
			panel(
				"1. DatePicker",
				"Hover or focus the calendar icon — the enhanced tooltip includes the F4 shortcut hint.",
				oDatePicker
			),
			panel(
				"2. DateRangeSelection",
				"Hover or focus the calendar icon — the enhanced tooltip should appear.",
				oDateRangeSelection
			),
			panel(
				"3. TimePicker",
				"Hover or focus the clock icon — the enhanced tooltip should appear.",
				oTimePicker
			),
			panel(
				"4. DateTimePicker",
				"Hover or focus the calendar icon — the enhanced tooltip should appear.",
				oDateTimePicker
			),
			new Panel({
				headerText: "5. Calendar (intervalSelection: true, showWeekNumbers: true, showWeekNumbersHeader: true)",
				expandable: false,
				width: "40rem",
				content: [
					new Text({
						text: "intervalSelection: true — week number cells show a 'Calendar Week N' tooltip on hover/focus. " +
							"showWeekNumbers: true — week number column is visible. " +
							"showWeekNumbersHeader: true — the week numbers column header shows the 'Calendar Week' tooltip. " +
							"Special-day cells show their tooltip text as invisible text in aria-describedby (no visible tooltip)."
					}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
					oCalendar,
					oLegend
				]
			}).addStyleClass("sapUiResponsiveMargin"),
			new Panel({
				headerText: "6. Calendar (intervalSelection: false, showWeekNumbers: true, showWeekNumbersHeader: true)",
				expandable: false,
				width: "40rem",
				content: [
					new Text({
						text: "intervalSelection: false — week number cells do NOT show a tooltip (week selection is disabled). " +
							"showWeekNumbers: true — week number column is still visible. " +
							"showWeekNumbersHeader: true — the week numbers column header still shows the 'Calendar Week' tooltip. " +
							"Special-day cells still show their tooltip text as invisible text in aria-describedby."
					}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
					oCalendarNoInterval,
					oLegend2
				]
			}).addStyleClass("sapUiResponsiveMargin")
		]
	});

	new App({ pages: [oPage] }).placeAt("content");
});

