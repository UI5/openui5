sap.ui.define([
	"sap/m/App",
	"sap/m/DateTimePicker",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library",
	"sap/ui/core/date/UI5Date"
], function(App, DateTimePicker, Label, Page, VerticalLayout, coreLibrary, UI5Date) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handleChange(oEvent){
		var oDP = oEvent.getSource();
		var bValid = oEvent.getParameter("valid");
		if (bValid) {
			oDP.setValueState(ValueState.None);
		} else {
			oDP.setValueState(ValueState.Error);
		}
	}

	var oPageLayout = new VerticalLayout({
		content: [
			// Basic scenario
			new Label({
				text: "Meeting Appointment: Choose a date and time",
				labelFor: "DTP1",
				wrapping: true
			}),
			new DateTimePicker("DTP1", {
				change: handleChange,
				valueStateText: "Please enter a valid date and time for Meeting Appointment."
			}),

			// Custom value format scenario
			new Label({
				text: "Project Deadline: Select delivery date and time (custom format)",
				labelFor: "DTP2",
				wrapping: true
			}),
			new DateTimePicker("DTP2", {
				value: "2016-02-16,12-50-30",
				valueFormat: "yyyy-MM-dd,HH-mm-ss",
//				displayFormat: "long/short",
				displayFormat: "EEEE, MMMM d, yyyy 'at' HH:mm",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: handleChange,
				valueStateText: "Please enter a valid date and time for Project Deadline."
			}),

			// Secondary calendar type scenario (Islamic calendar)
			new Label({
				text: "Event Date: Choose date and time with Islamic calendar",
				labelFor: "DTP3",
				wrapping: true
			}),
			new DateTimePicker("DTP3", {
				secondaryCalendarType: "Islamic",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: handleChange,
				valueStateText: "Please enter a valid date and time for Event Date."
			}),

			// 24-hour format without AM/PM
			new Label({
				text: "System Maintenance Window: Select time in 24-hour format",
				labelFor: "DTP4",
				wrapping: true
			}),
			new DateTimePicker("DTP4", {
				displayFormat: "dd/MM/yyyy HH:mm:ss",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: handleChange,
				valueStateText: "Please enter a valid date and time for System Maintenance Window."
			}),

			// Timezone scenario
			new Label({
				text: "International Conference Call: Select time with timezone display",
				labelFor: "DTP5",
				wrapping: true
			}),
			new DateTimePicker("DTP5", {
				showTimezone: true,
				timezone: "America/New_York",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: handleChange,
				valueStateText: "Please enter a valid date and time for International Conference Call."
			}),

			// Custom steps scenario
			new Label({
				text: "Train Schedule: Select departure time (15-minute intervals)",
				labelFor: "DTP6",
				wrapping: true
			}),
			new DateTimePicker("DTP6", {
				minutesStep: 15,
				secondsStep: 30,
				displayFormat: "EEE, MMM d, yyyy 'at' HH:mm",
				showCurrentTimeButton: true,
				change: handleChange,
				valueStateText: "Please enter a valid date and time for Train Schedule."
			}),

			// Min/Max date range scenario
			new Label({
				text: "Vacation Booking: Select dates within current year only",
				labelFor: "DTP7",
				wrapping: true
			}),
			new DateTimePicker("DTP7", {
				minDate: UI5Date.getInstance(2025, 0, 1), // January 1, 2025
				maxDate: UI5Date.getInstance(2025, 11, 31), // December 31, 2025
				displayFormat: "EEEE, MMMM d, yyyy 'at' h:mm a",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: handleChange,
				valueStateText: "Please enter a valid date and time for Vacation Booking."
			}),

			// Different display format styles
			new Label({
				text: "Flight Departure: Select date and time (medium format)",
				labelFor: "DTP8",
				wrapping: true
			}),
			new DateTimePicker("DTP8", {
				displayFormat: "medium/medium",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: handleChange,
				valueStateText: "Please enter a valid date and time for Flight Departure."
			}),

			// Disabled state for comparison
			new Label({
				text: "Read-only Appointment: Cannot be modified",
				labelFor: "DTP9",
				wrapping: true
			}),
			new DateTimePicker("DTP9", {
				enabled: false,
				value: "Dec 25, 2025, 2:30:00 PM",
				displayFormat: "long/medium"
			}),

			// Placeholder scenario
			new Label({
				text: "Custom Event: Enter date and time with specific placeholder",
				labelFor: "DTP10",
				wrapping: true
			}),
			new DateTimePicker("DTP10", {
				placeholder: "When will your event take place?",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: handleChange,
				valueStateText: "Please enter a valid date and time for Custom Event."
			}),

			// Error state scenario
			new Label({
				text: "Document Expiry: Date must be in the future (validation example)",
				labelFor: "DTP11",
				wrapping: true
			}),
			new DateTimePicker("DTP11", {
				valueState: ValueState.Error,
				valueStateText: "Expiry date must be in the future",
				showCurrentDateButton: true,
				showCurrentTimeButton: true,
				change: function(oEvent) {
					var oDP = oEvent.getSource();
					var oDate = oEvent.getParameter("value");
					var oToday = UI5Date.getInstance();

					if (oDate && UI5Date.getInstance(oDate) > oToday) {
						oDP.setValueState(ValueState.Success);
						oDP.setValueStateText("Valid future date");
					} else {
						oDP.setValueState(ValueState.Error);
						oDP.setValueStateText("Expiry date must be in the future");
					}
				}
			})
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "DateTimePicker Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [ oPageLayout ]
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
