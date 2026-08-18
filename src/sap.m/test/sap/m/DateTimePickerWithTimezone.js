// Note: the HTML page 'DateTimePickerWithTimezone.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/m/DateTimePicker",
	"sap/m/Slider",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Title",
	"sap/m/Text",
	"sap/ui/core/date/UI5Date",
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, Page, VBox, DateTimePicker, Slider, SegmentedButton, SegmentedButtonItem, Title, Text, UI5Date, Localization, Element, VerticalLayout, coreLibrary) {
	"use strict";

	const TitleLevel = coreLibrary.TitleLevel;

	const sDefaultTimezone = Localization.getTimezone();

	function byId(sId) {
		return Element.getElementById(sId);
	}

	function invalidateAll() {
		oDTP1.invalidate();
		oDTP2.invalidate();
		oDTP3.invalidate();
	}

	const oTitleWidth = new Title({ text: "Picker width", titleStyle: "H5" });
	const oTitlePickerTimezone = new Title({ text: "Picker timezone", titleStyle: "H5" });
	const oTitleAppLocale = new Title({ text: "App Locale", titleStyle: "H5" });

	const oTextWidth = new Text({ text: "Selected width: 40%" });
	const oTextPickerTimezone = new Text({ text: "Selected timezone: America/Argentina/Buenos_Aires" });
	const oTextAppLocale = new Text({ text: "Selected locale: " + sDefaultTimezone });

	const oDTP1 = new DateTimePicker("DTP1", {
		displayFormat: "medium",
		width: "100%",
		dateValue: UI5Date.getInstance(Date.UTC(2000, 10, 20, 8, 10, 10)),
		showTimezone: true,
		timezone: "America/Argentina/Buenos_Aires"
	});

	const oDTP2 = new DateTimePicker("DTP2", {
		displayFormat: "medium",
		width: "100%",
		dateValue: UI5Date.getInstance(Date.UTC(2000, 10, 20, 8, 10, 10)),
		timezone: "America/Argentina/Buenos_Aires"
	});

	const oDTP3 = new DateTimePicker("DTP3", {
		displayFormat: "medium",
		width: "100%",
		dateValue: UI5Date.getInstance(Date.UTC(2021, 2, 24, 22, 30)),
		showTimezone: true
	});

	const oSlider = new Slider({
		value: 40,
		step: 1,
		min: 1,
		max: 100,
		enabled: false,
		change: function() {
			// oSegButtonWidth.setSelectedKey("custom");
			oTextWidth.setText("Selected width: " + this.getValue() + "%");
			byId("VBOX1").setWidth(this.getValue() + "%");
		}
	});

	const oSegButtonWidth = new SegmentedButton("buttonWidth", {
		selectedKey: "40",
		selectionChange: function(oEvent) {
			const sKey = oEvent.getParameter("item").getKey();

			if (sKey === "custom") {
				oSlider.setEnabled(true);
				return;
			}
			const iVal = parseInt(sKey);

			oSlider.setValue(iVal);
			oSlider.setEnabled(false);
			oTextWidth.setText("Selected width: " + iVal + "%");
			byId("VBOX1").setWidth(iVal + "%");
		},
		items: [
			new SegmentedButtonItem("item20", { key: "20", text: "20%" }),
			new SegmentedButtonItem("item40", { key: "40", text: "40%" }),
			new SegmentedButtonItem("itemCustom", { key: "custom", text: "Custom (Slider)" })
		]
	});

	const oSegButtonPickerTimezone = new SegmentedButton("buttonTimezone", {
		selectedKey: "America/Argentina/Buenos_Aires",
		selectionChange: function(oEvent) {
			const sTimezone = oEvent.getParameter("item").getKey();
			oDTP1.setTimezone(sTimezone);
			oDTP2.setTimezone(sTimezone);
			oTextPickerTimezone.setText("Selected timezone: " + sTimezone);
		},
		items: [
			new SegmentedButtonItem("itemArgentina", { key: "America/Argentina/Buenos_Aires", text: "Argentina" }),
			new SegmentedButtonItem("itemNY", { key: "America/New_York", text: "New York" }),
			new SegmentedButtonItem("itemSofia", { key: "Europe/Sofia", text: "Sofia" }),
			new SegmentedButtonItem("itemGMT12", { key: "Etc/GMT+12", text: "GMT+12" })
		]
	});

	const oSegButtonAppLocale = new SegmentedButton("buttonLocale", {
		selectedKey: "default",
		selectionChange: function(oEvent) {
			const sKey = oEvent.getParameter("item").getKey();
			const sTimezone = sKey === "default" ? sDefaultTimezone : sKey;
			Localization.setTimezone(sTimezone);
			invalidateAll();
			oTextAppLocale.setText("Selected locale: " + sTimezone);
		},
		items: [
			new SegmentedButtonItem("itemDefaultLocale", { key: "default", text: "Default (locale)" }),
			new SegmentedButtonItem("itemArgentinaLocale", { key: "America/Argentina/Buenos_Aires", text: "Argentina" }),
			new SegmentedButtonItem("itemSofiaLocale", { key: "Europe/Sofia", text: "Sofia" }),
			new SegmentedButtonItem("itemBerlinLocale", { key: "Europe/Berlin", text: "Berlin" })
		]
	});

	const page1 = new Page("page1", {
		title: "DateTimePicker with Timezone",
		titleLevel: TitleLevel.H1,
		content: [
			new VerticalLayout({
				width: "100%",
				content: [
					new VBox("VBOX1", {
						width: oSlider.getValue() + "%",
						items: [ oDTP1, oDTP2, oDTP3 ]
					}),
					oSlider,

					oTitleWidth,
					oSegButtonWidth,
					oTextWidth,

					oTitlePickerTimezone,
					oSegButtonPickerTimezone,
					oTextPickerTimezone,

					oTitleAppLocale,
					oSegButtonAppLocale,
					oTextAppLocale
				]
			}).addStyleClass("sapUiContentPadding")
		]
	});

	new App("myApp").addPage(page1).placeAt("body");
});