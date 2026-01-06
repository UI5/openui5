sap.ui.define([
	'sap/base/Log',
	'sap/m/PlanningCalendarHeader',
	'sap/m/Button',
	'sap/m/SegmentedButton',
	'sap/m/SegmentedButtonItem',
	'sap/m/App',
	'sap/m/Page'
],
function (Log, PlanningCalendarHeader, Button, SegmentedButton, SegmentedButtonItem, App, Page) {
	"use strict";
	var oPCHeader = new PlanningCalendarHeader("PlanningCalendarHeader",{
		pickerText: "Picker text",
		actions: [
			new SegmentedButton('ViewSwitch1', {
				items: [
					new SegmentedButtonItem({
						text: "Days"
					}),
					new SegmentedButtonItem({
						text: "Week"
					}),
					new SegmentedButtonItem({
						text: "Months"
					})
				]}
			),
			new Button("firstButton", {
				text: "hello world"
			}),
			new Button("firstButton1", {
				text: "hello world"
			}),
			new Button("firstButton2", {
				text: "hello world"
			})
		],
		pressPrevious: function () {
			Log.info("Previous pressed!");
		},
		pressToday: function () {
			Log.info("Today pressed!");
		},
		pressNext: function () {
			Log.info("Next pressed!");
		},
		dateSelect: function () {
			Log.info("Date selected!");
		}
	});
	new App({
		pages: new Page({
			title: "PlanningCalendarHeader test page",
			content: oPCHeader
		})
	}).placeAt("body");
});