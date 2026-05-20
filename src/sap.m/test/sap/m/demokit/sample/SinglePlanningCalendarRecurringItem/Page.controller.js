sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/Fragment"
],
function(Controller, JSONModel, MessageToast, UI5Date, Fragment) {
	"use strict";

	return Controller.extend("sap.m.sample.SinglePlanningCalendarRecurringItem.Page", {

		onInit: function() {

			var oModel = new JSONModel();
			oModel.setData({
				startDate: UI5Date.getInstance(2024, 0, 1),
				nonWorkingPeriods: [
					// --- Weekly: Work-hour boundaries ---
					// Every weekday before work (00:00-08:00)
					{
						date: UI5Date.getInstance(2024, 0, 1),
						start: "00:00",
						end: "08:00",
						valueFormat: "HH:mm",
						title: "Before Work Hours",
						recurrenceType: "Weekly",
						recurrencePattern: 1,
						recurrenceDay: [1, 2, 3, 4, 5],
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// Every weekday lunch break (12:00-13:00)
					{
						date: UI5Date.getInstance(2024, 0, 1),
						start: "12:00",
						end: "13:00",
						valueFormat: "HH:mm",
						title: "Lunch Break",
						recurrenceType: "Weekly",
						recurrencePattern: 1,
						recurrenceDay: [1, 2, 3, 4, 5],
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// Every weekday after work (18:00-23:59)
					{
						date: UI5Date.getInstance(2024, 0, 1),
						start: "18:00",
						end: "23:59",
						valueFormat: "HH:mm",
						title: "After Work Hours",
						recurrenceType: "Weekly",
						recurrencePattern: 1,
						recurrenceDay: [1, 2, 3, 4, 5],
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// --- Weekly: Full-day weekends ---
					// Saturday - full day
					{
						date: UI5Date.getInstance(2024, 0, 6),
						start: "00:00",
						end: "23:59",
						valueFormat: "HH:mm",
						title: "Weekend - Saturday",
						recurrenceType: "Weekly",
						recurrencePattern: 1,
						recurrenceDay: [6],
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// Sunday - full day
					{
						date: UI5Date.getInstance(2024, 0, 7),
						start: "00:00",
						end: "23:59",
						valueFormat: "HH:mm",
						title: "Weekend - Sunday",
						recurrenceType: "Weekly",
						recurrencePattern: 1,
						recurrenceDay: [0],
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// --- Daily: Short daily block ---
					// Daily server backup window 02:00-02:30
					{
						date: UI5Date.getInstance(2024, 0, 1),
						start: "02:00",
						end: "02:30",
						valueFormat: "HH:mm",
						title: "Server Backup",
						recurrenceType: "Daily",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// --- Monthly: Maintenance windows ---
					// First Monday of month, 06:00-08:00
					{
						date: UI5Date.getInstance(2024, 0, 1),
						start: "06:00",
						end: "08:00",
						valueFormat: "HH:mm",
						title: "Monthly Maintenance",
						recurrenceType: "Monthly",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					},
					// 15th of every month, inventory 08:00-12:00
					{
						date: UI5Date.getInstance(2024, 0, 15),
						start: "08:00",
						end: "12:00",
						valueFormat: "HH:mm",
						title: "Monthly Inventory",
						recurrenceType: "Monthly",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					},
					// --- Yearly: Public holidays (full-day) ---
					// New Year's Day
					{
						date: UI5Date.getInstance(2024, 0, 1),
						start: "00:00",
						end: "23:59",
						valueFormat: "HH:mm",
						title: "New Year's Day",
						recurrenceType: "Yearly",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					},
					// Independence Day
					{
						date: UI5Date.getInstance(2024, 6, 4),
						start: "00:00",
						end: "23:59",
						valueFormat: "HH:mm",
						title: "Independence Day",
						recurrenceType: "Yearly",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					},
					// Christmas Day
					{
						date: UI5Date.getInstance(2024, 11, 25),
						start: "00:00",
						end: "23:59",
						valueFormat: "HH:mm",
						title: "Christmas Day",
						recurrenceType: "Yearly",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					}
				],
				appointments: [
					// --- Daily ---
					// Daily standup, every day 09:00-09:15
					{
						start: UI5Date.getInstance(2024, 0, 1, 9, 0),
						end: UI5Date.getInstance(2024, 0, 1, 9, 15),
						title: "Daily Standup (every day)",
						text: "Should appear every single day",
						type: "Type05",
						recurrenceType: "Daily",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// Every other day log review, 16:00-16:30
					{
						start: UI5Date.getInstance(2024, 0, 1, 16, 0),
						end: UI5Date.getInstance(2024, 0, 1, 16, 30),
						title: "Log Review (every 2 days)",
						text: "Should appear every other day: Jan 1, 3, 5, 7...",
						type: "Type08",
						recurrenceType: "Daily",
						recurrencePattern: 2,
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},

					// --- Weekly ---
					// Weekly team meeting Mon 10:00-11:00
					{
						start: UI5Date.getInstance(2024, 0, 1, 10, 0),
						end: UI5Date.getInstance(2024, 0, 1, 11, 0),
						title: "Team Meeting (every Mon)",
						text: "Should appear once per week on Monday",
						type: "Type01",
						recurrenceType: "Weekly",
						recurrencePattern: 1,
						recurrenceDay: [1], // Monday
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// Code review session Wed+Fri 14:00-15:30
					{
						start: UI5Date.getInstance(2024, 0, 3, 14, 0),
						end: UI5Date.getInstance(2024, 0, 3, 15, 30),
						title: "Code Review (every Wed+Fri)",
						text: "Should appear twice per week: Wednesday and Friday",
						type: "Type02",
						recurrenceType: "Weekly",
						recurrencePattern: 1,
						recurrenceDay: [3, 5], // Wednesday + Friday
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},
					// Bi-weekly 1-on-1 with manager, Tue 11:00-11:30
					{
						start: UI5Date.getInstance(2024, 0, 2, 11, 0),
						end: UI5Date.getInstance(2024, 0, 2, 11, 30),
						title: "1-on-1 (every 2nd Tue)",
						text: "Should appear every other Tuesday: Jan 2, 16, 30...",
						type: "Type06",
						recurrenceType: "Weekly",
						recurrencePattern: 2,
						recurrenceDay: [2], // Tuesday
						recurrenceEndDate: UI5Date.getInstance(2024, 11, 31)
					},

					// --- Monthly ---
					// Sprint retrospective, 1st of each month 13:00-14:30
					{
						start: UI5Date.getInstance(2024, 0, 1, 13, 0),
						end: UI5Date.getInstance(2024, 0, 1, 14, 30),
						title: "Retro (1st of each month)",
						text: "Should appear on the 1st of every month: Jan 1, Feb 1...",
						type: "Type03",
						recurrenceType: "Monthly",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					},
					// Quarterly board review, every 3 months, 15th 09:00-12:00
					{
						start: UI5Date.getInstance(2024, 0, 15, 9, 0),
						end: UI5Date.getInstance(2024, 0, 15, 12, 0),
						title: "Board Review (every 3 months)",
						text: "Should appear quarterly on 15th: Jan 15, Apr 15, Jul 15, Oct 15",
						type: "Type07",
						recurrenceType: "Monthly",
						recurrencePattern: 3,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					},

					// --- Yearly ---
					// Annual company kickoff Jan 15, all-day
					{
						start: UI5Date.getInstance(2024, 0, 15, 0, 0),
						end: UI5Date.getInstance(2024, 0, 15, 23, 59),
						title: "Company Kickoff (yearly Jan 15)",
						text: "Should appear once per year on January 15",
						type: "Type04",
						recurrenceType: "Yearly",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					},
					// Annual performance review Mar 10, 10:00-11:30
					{
						start: UI5Date.getInstance(2024, 2, 10, 10, 0),
						end: UI5Date.getInstance(2024, 2, 10, 11, 30),
						title: "Perf Review (yearly Mar 10)",
						text: "Should appear once per year on March 10",
						type: "Type09",
						recurrenceType: "Yearly",
						recurrencePattern: 1,
						recurrenceEndDate: UI5Date.getInstance(2026, 11, 31)
					}
				]
			});
			this.getView().setModel(oModel);

			oModel = new JSONModel();
			oModel.setData({allDay: false});
			this.getView().setModel(oModel, "allDay");

			var oStartDate = UI5Date.getInstance();
			oStartDate.setMinutes(0, 0, 0);
			var oEndDate = UI5Date.getInstance(oStartDate);
			oEndDate.setHours(oEndDate.getHours() + 1);
			var oCreateModel = new JSONModel({
				title: "",
				text: "",
				type: "Type01",
				startDate: oStartDate,
				endDate: oEndDate,
				recurrenceType: "",
				recurrencePattern: 1,
				recurrenceDay: [],
				recurrenceEndDate: null,
				ruleType: "DayOfMonth",
				ruleDayOfMonth: 0,
				ruleWeekOfMonth: "First",
				ruleDayOfWeek: 0,
				ruleMonth: 0
			});
			this.getView().setModel(oCreateModel, "create");
		},

		handleViewChange: function () {
			MessageToast.show("'viewChange' event fired.");
		},

		onCreateAppointment: function () {
			var oView = this.getView();

			if (!this._pCreateDialog) {
				this._pCreateDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.SinglePlanningCalendarRecurringItem.CreateAppointmentDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pCreateDialog.then(function (oDialog) {
				// Reset dialog model
				var oStart = UI5Date.getInstance();
					oStart.setMinutes(0, 0, 0);
					var oEnd = UI5Date.getInstance(oStart);
					oEnd.setHours(oEnd.getHours() + 1);
					oDialog.getModel("create").setData({
					title: "",
					text: "",
					type: "Type01",
					startDate: oStart,
					endDate: oEnd,
					recurrenceType: "",
					recurrencePattern: 1,
					recurrenceDay: [],
					recurrenceEndDate: null,
					ruleType: "DayOfMonth",
					ruleDayOfMonth: 0,
					ruleWeekOfMonth: "First",
					ruleDayOfWeek: 0,
					ruleMonth: 0
				});
				oDialog.open();
			});
		},

		onRecurrenceTypeChange: function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey();
			var oModel = this.getView().getModel("create");
			oModel.setProperty("/recurrenceType", sKey);
			if (sKey !== "Weekly") {
				oModel.setProperty("/recurrenceDay", []);
			}
			if (sKey !== "Monthly" && sKey !== "Yearly") {
				oModel.setProperty("/ruleType", "DayOfMonth");
				oModel.setProperty("/ruleDayOfMonth", 0);
				oModel.setProperty("/ruleWeekOfMonth", "First");
				oModel.setProperty("/ruleDayOfWeek", 0);
			}
			if (sKey !== "Yearly") {
				oModel.setProperty("/ruleMonth", 0);
			}
		},

		onCreateDialogSave: function () {
			var oModel = this.getView().getModel();
			var oCreateModel = this.getView().getModel("create");
			var oData = oCreateModel.getData();

			var oNewAppointment = {
				start: UI5Date.getInstance(oData.startDate),
				end: UI5Date.getInstance(oData.endDate),
				title: oData.title,
				text: oData.text,
				type: oData.type
			};

			if (oData.recurrenceType) {
				oNewAppointment.recurrenceType = oData.recurrenceType;
				oNewAppointment.recurrencePattern = parseInt(oData.recurrencePattern) || 1;
				oNewAppointment.recurrenceEndDate = oData.recurrenceEndDate;
				if (oData.recurrenceType === "Weekly" && oData.recurrenceDay.length > 0) {
					oNewAppointment.recurrenceDay = oData.recurrenceDay.map(function(d) { return parseInt(d); });
				}
				if (oData.recurrenceType === "Monthly" || oData.recurrenceType === "Yearly") {
					oNewAppointment.ruleType = oData.ruleType;
					if (oData.ruleType === "DayOfMonth") {
						oNewAppointment.ruleDayOfMonth = parseInt(oData.ruleDayOfMonth) || 0;
					} else {
						oNewAppointment.ruleWeekOfMonth = oData.ruleWeekOfMonth;
						oNewAppointment.ruleDayOfWeek = parseInt(oData.ruleDayOfWeek);
					}
				}
				if (oData.recurrenceType === "Yearly") {
					oNewAppointment.ruleMonth = parseInt(oData.ruleMonth);
				}
			}

			var aAppointments = oModel.getProperty("/appointments");
			aAppointments.push(oNewAppointment);
			oModel.setProperty("/appointments", aAppointments);

			this._pCreateDialog.then(function (oDialog) {
				oDialog.close();
			});
			MessageToast.show("Appointment '" + oData.title + "' created.");
		},

		onCreateDialogCancel: function () {
			this._pCreateDialog.then(function (oDialog) {
				oDialog.close();
			});
		}

	});
});
