sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox',
	'sap/m/MessageToast',
	'sap/ui/core/Fragment',
	'sap/ui/core/Item',
	'sap/ui/core/date/UI5Date'
],
(Controller, JSONModel, MessageBox, MessageToast, Fragment, Item, UI5Date) => {
	"use strict";

	return Controller.extend("sap.m.sample.PlanningCalendarRecurringItem.Page", {

		onInit() {
			const oModel = new JSONModel();
			oModel.setData({
				startDate: UI5Date.getInstance("2019", "8", "1", "0", "0"),
				viewKey: "Hour",
				people: [
					{
						pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
						name: "John Miller",
						role: "team member",
						appointments: [
							{
								startDate: UI5Date.getInstance(2019, 8, 2, 9, 0),
								endDate: UI5Date.getInstance(2019, 8, 2, 9, 30),
								recurrenceType: "Daily",
								recurrencePattern: 1,
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								title: "Daily Standup",
								type: "Type01"
							},
							{
								startDate: UI5Date.getInstance(2019, 8, 4, 14, 0),
								endDate: UI5Date.getInstance(2019, 8, 4, 15, 0),
								recurrenceType: "Weekly",
								recurrencePattern: 1,
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								title: "Weekly Team Meeting",
								type: "Type08"
							}
						],
						nonWorkingPeriods: [
							{
								recurrenceType: "Daily",
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								recurrencePattern: 1,
								date: UI5Date.getInstance(2019, 8, 1),
								start: "12:55",
								end: "13:15",
								valueFormat: "HH:mm"
							},
							{
								recurrenceType: "Daily",
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								recurrencePattern: 1,
								date: UI5Date.getInstance(2019, 8, 1),
								start: "04:30",
								end: "04:45",
								valueFormat: "HH:mm"
							}
						],
						headers: [
							{
								start: UI5Date.getInstance("2017", "0", "15", "8", "0"),
								end: UI5Date.getInstance("2017", "0", "15", "10", "0"),
								title: "Reminder",
								type: "Type06"
							},
							{
								start: UI5Date.getInstance("2017", "0", "15", "17", "0"),
								end: UI5Date.getInstance("2017", "0", "15", "19", "0"),
								title: "Reminder",
								type: "Type06"
							},
							{
								start: UI5Date.getInstance("2017", "8", "1", "0", "0"),
								end: UI5Date.getInstance("2017", "10", "30", "23", "59"),
								title: "New quarter",
								type: "Type10",
								tentative: false
							},
							{
								start: UI5Date.getInstance("2018", "1", "1", "0", "0"),
								end: UI5Date.getInstance("2018", "3", "30", "23", "59"),
								title: "New quarter",
								type: "Type10",
								tentative: false
							}
						]
					},
					{
						pic: "test-resources/sap/ui/documentation/sdk/images/Donna_Moore.jpg",
						name: "Donna Moore",
						role: "team member",
						appointments: [
							{
								startDate: UI5Date.getInstance(2019, 8, 2, 10, 0),
								endDate: UI5Date.getInstance(2019, 8, 2, 10, 30),
								recurrenceType: "Weekly",
								recurrencePattern: 2,
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								title: "Bi-weekly Sync",
								type: "Type03"
							}
						],
						nonWorkingPeriods: [
							{
								recurrenceType: "Daily",
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								recurrencePattern: 1,
								date: UI5Date.getInstance(2019, 8, 1),
								start: "11:55",
								end: "13:15",
								valueFormat: "HH:mm"
							},
							{
								recurrenceType: "Daily",
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								recurrencePattern: 1,
								date: UI5Date.getInstance(2019, 8, 1),
								start: "03:30",
								end: "03:45",
								valueFormat: "HH:mm"
							}
						],
						headers: [
							{
								start: UI5Date.getInstance("2017", "0", "15", "9", "0"),
								end: UI5Date.getInstance("2017", "0", "15", "10", "0"),
								title: "Payment reminder",
								type: "Type06"
							},
							{
								start: UI5Date.getInstance("2017", "0", "15", "16", "30"),
								end: UI5Date.getInstance("2017", "0", "15", "18", "00"),
								title: "Private appointment",
								type: "Type06"
							}
						]
					},
					{
						pic: "sap-icon://employee",
						name: "Max Mustermann",
						role: "team member",
						appointments: [
							{
								startDate: UI5Date.getInstance(2019, 8, 3, 11, 0),
								endDate: UI5Date.getInstance(2019, 8, 3, 12, 0),
								recurrenceType: "Daily",
								recurrencePattern: 2,
								recurrenceEndDate: UI5Date.getInstance(2019, 9, 1),
								title: "Every Other Day Check-in",
								type: "Type07"
							}
						],
						headers: [
							{
								start: UI5Date.getInstance("2017", "0", "16", "0", "0"),
								end: UI5Date.getInstance("2017", "0", "16", "23", "59"),
								title: "Private",
								type: "Type05"
							}
						]
					}
				]
			});
			this.getView().setModel(oModel);

			// Model for the create dialog
			const oCreateModel = new JSONModel({
				personKey: "0",
				title: "",
				text: "",
				type: "Type01",
				startDate: null,
				endDate: null,
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
			this._sTargetAppointmentsPath = "/people/0/appointments";
		},

		handleRowHeaderPress(oEvent) {
			MessageBox.show("rowHeaderPressed on row: " + oEvent.getParameter("row").getId());
		},

		onAppointmentCreate(oEvent) {
			const oRow = oEvent.getParameter("calendarRow");
			const oStart = oEvent.getParameter("startDate");
			const oEnd = oEvent.getParameter("endDate");

			const sRowPath = oRow.getBindingContext().getPath();
			const iIndex = parseInt(sRowPath.split("/").pop());
			this.getView().getModel("create").setProperty("/personKey", String(iIndex));
			this._sTargetAppointmentsPath = sRowPath + "/appointments";

			this._openCreateDialog(oStart, oEnd);
		},

		onCreateAppointment() {
			const oStart = UI5Date.getInstance();
			oStart.setMinutes(0, 0, 0);
			const oEnd = UI5Date.getInstance(oStart);
			oEnd.setHours(oEnd.getHours() + 1);
			this._openCreateDialog(oStart, oEnd);
		},

		_openCreateDialog(oStart, oEnd) {
			const oView = this.getView();

			if (!this._pCreateDialog) {
				this._pCreateDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.PlanningCalendarRecurringItem.CreateAppointmentDialog",
					controller: this
				}).then((oDialog) => {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pCreateDialog.then((oDialog) => {
				const oPeople = oView.getModel().getProperty("/people") || [];
				const oSelect = oView.byId("personSelect");
				oSelect.removeAllItems();
				oPeople.forEach((oPerson, iIndex) => {
					oSelect.addItem(new Item({ key: String(iIndex), text: oPerson.name }));
				});

				let sCurrentKey = oView.getModel("create").getProperty("/personKey");
				if (!sCurrentKey || parseInt(sCurrentKey) >= oPeople.length) {
					sCurrentKey = "0";
				}
				oSelect.setSelectedKey(sCurrentKey);

				oDialog.getModel("create").setData({
					personKey: sCurrentKey,
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
				this._sTargetAppointmentsPath = `/people/${sCurrentKey}/appointments`;
				oDialog.open();
			});
		},

		onPersonChange(oEvent) {
			const sKey = oEvent.getParameter("selectedItem").getKey();
			this.getView().getModel("create").setProperty("/personKey", sKey);
			this._sTargetAppointmentsPath = `/people/${sKey}/appointments`;
		},

		onRecurrenceTypeChange(oEvent) {
			const sKey = oEvent.getParameter("selectedItem").getKey();
			const oModel = this.getView().getModel("create");
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

		onCreateDialogSave() {
			const oModel = this.getView().getModel();
			const oData = this.getView().getModel("create").getData();

			this._sTargetAppointmentsPath = `/people/${oData.personKey}/appointments`;

			const oNewAppointment = {
				startDate: UI5Date.getInstance(oData.startDate),
				endDate: UI5Date.getInstance(oData.endDate),
				title: oData.title,
				text: oData.text,
				type: oData.type
			};

			if (oData.recurrenceType) {
				oNewAppointment.recurrenceType = oData.recurrenceType;
				oNewAppointment.recurrencePattern = parseInt(oData.recurrencePattern) || 1;
				oNewAppointment.recurrenceEndDate = oData.recurrenceEndDate;
				if (oData.recurrenceType === "Weekly" && oData.recurrenceDay.length > 0) {
					oNewAppointment.recurrenceDay = oData.recurrenceDay.map((d) => parseInt(d));
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

			const aAppointments = oModel.getProperty(this._sTargetAppointmentsPath);
			aAppointments.push(oNewAppointment);
			oModel.setProperty(this._sTargetAppointmentsPath, aAppointments);

			this._pCreateDialog.then((oDialog) => oDialog.close());
			MessageToast.show(`Appointment '${oData.title}' created.`);
		},

		onCreateDialogCancel() {
			this._pCreateDialog.then((oDialog) => oDialog.close());
		},

		onAppointmentDrop(oEvent) {
			const oDropped = oEvent.getParameter("appointment");
			const oNewStart = oEvent.getParameter("startDate");
			const oTargetRow = oEvent.getParameter("calendarRow");
			const bCopy = oEvent.getParameter("copy");

			const oOriginal = oDropped._oOriginalAppointment || oDropped;
			const oCtx = oOriginal.getBindingContext();
			if (!oCtx) {
				MessageToast.show("Cannot move this appointment.");
				return;
			}

			const oModel = this.getView().getModel();
			const sOrigPath = oCtx.getPath();
			const sSourceAppsPath = sOrigPath.replace(/\/\d+$/, "");
			const iIndex = parseInt(sOrigPath.split("/").pop());
			const sTargetAppsPath = oTargetRow.getBindingContext().getPath() + "/appointments";

			const iDelta = oNewStart.getTime() - oDropped.getStartDate().getTime();
			const oData = oModel.getProperty(sOrigPath);
			const oUpdated = {
				...oData,
				startDate: UI5Date.getInstance(oData.startDate.getTime() + iDelta),
				endDate: UI5Date.getInstance(oData.endDate.getTime() + iDelta)
			};
			if (oData.recurrenceEndDate) {
				oUpdated.recurrenceEndDate = UI5Date.getInstance(oData.recurrenceEndDate.getTime() + iDelta);
			}

			if (bCopy) {
				const aTarget = [...oModel.getProperty(sTargetAppsPath), oUpdated];
				oModel.setProperty(sTargetAppsPath, aTarget);
				MessageToast.show(`Appointment copied to ${oTargetRow.getTitle()}.`);
			} else if (sSourceAppsPath !== sTargetAppsPath) {
				const aSource = oModel.getProperty(sSourceAppsPath).filter((_, i) => i !== iIndex);
				oModel.setProperty(sSourceAppsPath, aSource);
				const aTarget = [...oModel.getProperty(sTargetAppsPath), oUpdated];
				oModel.setProperty(sTargetAppsPath, aTarget);
				MessageToast.show(`Appointment moved to ${oTargetRow.getTitle()}.`);
			} else {
				oModel.setProperty(sOrigPath, oUpdated);
				MessageToast.show("Appointment rescheduled.");
			}
		}

	});
});
