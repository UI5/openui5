sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"model/formatter"
], function (Element, Controller, Fragment, Item, MessageToast, formatter) {
	"use strict";

	return Controller.extend("teamCalendar.controller.Main", {

		myformatter : formatter,

		// Initial setup
		onInit: function() {
			this.imagePath = sap.ui.require.toUrl("sap/m/demokit/teamCalendar/webapp/").replace('/resources/', '/test-resources/');
			this._oModel = this.getView().getModel("calendar");
			this._oStartDate = this.myformatter.utcToLocalDateTime(this._oModel.getProperty("/startDate"));
			this._sSelectedView = this._oModel.getProperty("/viewKey");
			this._sSelectedMember = "Team";
			this._oCalendarContainer = this.byId("mainContent");
			this._mCalendars = {};
			this._sCalendarDisplayed = '';

			// load and display the Planning Calendar
			this._loadCalendar("PlanningCalendar");
		},

		// Does loading of the PC/SPC depending on selected item
		selectChangeHandler: function(oEvent) {
			this._sSelectedMember = oEvent.getParameter("selectedItem").getKey();
			this._loadCalendar(isNaN(this._sSelectedMember) ? "PlanningCalendar" : "SinglePlanningCalendar");
		},

		// Loads SPC for a person which row is clicked
		rowSelectionHandler: function(oEvent) {
			const oSelectedRow = oEvent.getParameter("rows")[0];
			const sSelectedId = oSelectedRow.getId();
			this._sSelectedMember = sSelectedId.substr(sSelectedId.lastIndexOf('-') + 1);
			oSelectedRow.setSelected(false);
			this._loadCalendar("SinglePlanningCalendar");
		},

		// Saves currently selected date
		startDateChangeHandler: function(oEvent) {
			this._oStartDate = new Date(oEvent.getSource().getStartDate());
		},

		// Saves currently selected view
		viewChangeHandler: function(oEvent) {
			const oCalendar = oEvent.getSource();
			if (isNaN(this._sSelectedMember)) {
				this._sSelectedView = oCalendar.getViewKey();
			} else {
				this._sSelectedView = Element.getElementById(oCalendar.getSelectedView()).getKey();
			}
			oCalendar.setStartDate(this._oStartDate);
		},

		// Handler of the "Create" button
		appointmentCreate: function(oEvent) {
			MessageToast.show("Creating new appointment...");
		},

		// Opens a legend
		openLegend: function(oEvent) {
			const oSource = oEvent.getSource();
			const oView = this.getView();
			if (!this._pLegendPopover) {
				this._pLegendPopover = Fragment.load({
					id: oView.getId(),
					name: "teamCalendar.view.Legend",
					controller: this
				}).then((oLegendPopover) => {
					oView.addDependent(oLegendPopover);
					return oLegendPopover;
				});
			}
			this._pLegendPopover.then((oLegendPopover) => {
				if (oLegendPopover.isOpen()) {
					oLegendPopover.close();
				} else {
					oLegendPopover.openBy(oSource);
				}
			});
		},

		// Loads and displays calendar (if not already loaded), otherwise just displays it
		_loadCalendar: function(sCalendarId) {
			const oView = this.getView();

			if (!this._mCalendars[sCalendarId]) {
				this._mCalendars[sCalendarId] = Fragment.load({
					id: oView.getId(),
					name: `teamCalendar.view.${sCalendarId}`,
					controller: this
				}).then((oCalendarVBox) => {
					this._populateSelect(this.byId(`${sCalendarId}TeamSelector`));
					return oCalendarVBox;
				});
			}

			this._mCalendars[sCalendarId].then((oCalendarVBox) => {
				this._displayCalendar(sCalendarId, oCalendarVBox);
			});
		},

		_hideCalendar: function() {
			if (this._sCalendarDisplayed === '') {
				return Promise.resolve();
			}
			return this._mCalendars[this._sCalendarDisplayed].then((oOldCalendarVBox) => {
				this._oCalendarContainer.removeContent(oOldCalendarVBox);
			});
		},

		// Displays already loaded calendar
		_displayCalendar: function(sCalendarId, oCalendarVBox) {
			this._hideCalendar().then(() => {
				this._oCalendarContainer.addContent(oCalendarVBox);
				this._sCalendarDisplayed = sCalendarId;
				const oCalendar = oCalendarVBox.getItems()[0];
				const oTeamSelect = this.byId(`${sCalendarId}TeamSelector`);
				oTeamSelect.setSelectedKey(this._sSelectedMember);
				oCalendar.setStartDate(this._oStartDate);
				if (isNaN(this._sSelectedMember)) {
					// Planning Calendar
					oCalendar.setViewKey(this._sSelectedView);
					oCalendar.bindElement({
						path: "/team",
						model: "calendar"
					});
				} else {
					// Single Planning Calendar
					oCalendar.setSelectedView(oCalendar.getViewByKey(this._sSelectedView));
					oCalendar.bindElement({
						path: `/team/${this._sSelectedMember}`,
						model: "calendar"
					});
				}
			});
		},

		// Adds "Team" and all team members as select items
		_populateSelect: function(oSelect) {
			const aTeam = this._oModel.getProperty("/team");
			for (let iPerson = 0; iPerson < aTeam.length; iPerson++) {
				oSelect.addItem(new Item({
					key: iPerson,
					text: aTeam[iPerson].name
				}));
			}
		}

	});
});