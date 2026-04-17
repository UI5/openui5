// Note: the HTML page 'MenuButtonIFormContent.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/Menu",
	"sap/m/MenuButton",
	"sap/m/MenuItem",
	"sap/m/MessageToast",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/library",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/library",
	"sap/ui/core/library",
	"sap/m/Text",
	"sap/ui/layout/VerticalLayout"
], async function(
	Core,
	App,
	Page,
	Title,
	Label,
	Input,
	Button,
	Menu,
	MenuButton,
	MenuItem,
	MessageToast,
	SegmentedButton,
	SegmentedButtonItem,
	mLibrary,
	SimpleForm,
	layoutLibrary,
	coreLibrary,
	Text,
	VerticalLayout
) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;
	var MenuButtonMode = mLibrary.MenuButtonMode;
	var TitleLevel = coreLibrary.TitleLevel;

	await Core.ready();

	// ========================================================
	// Helper: creates a Menu with value-help-like items
	// ========================================================
	function createValueHelpMenu(sId) {
		return new Menu(sId, {
			itemSelected: function (oEvent) {
				var oItem = oEvent.getParameter("item");
				MessageToast.show("Selected: " + oItem.getText());
			},
			items: [
				new MenuItem({ text: "Region Value Help",    icon: "sap-icon://world" }),
				new MenuItem({ text: "Product Value Help",   icon: "sap-icon://product" }),
				new MenuItem({ text: "Category Value Help",  icon: "sap-icon://group" })
			]
		});
	}

	// ========================================================
	// 1) MenuButton inside a SimpleForm (IFormContent)
	// ========================================================
	var oSimpleForm = new SimpleForm("simpleFormDemo", {
		title: "1 \u2014 MenuButton in a SimpleForm (IFormContent)",
		layout: SimpleFormLayout.ResponsiveGridLayout,
		labelSpanXL: 3,
		labelSpanL: 3,
		labelSpanM: 3,
		labelSpanS: 12,
		adjustLabelSpan: false,
		emptySpanXL: 4,
		emptySpanL: 4,
		emptySpanM: 4,
		emptySpanS: 0,
		columnsXL: 1,
		columnsL: 1,
		columnsM: 1,
		editable: true,
		content: [
			// -- Group 1: basic fields + MenuButton --
			new Title({ text: "Order Details" }),

			new Label({ text: "Order ID" }),
			new Input({ value: "10248", editable: false }),

			new Label({ text: "Customer" }),
			new Input({ value: "ACME Corp" }),

			new Label({ text: "Actions (Regular)" }),
			new MenuButton("mbFormRegular", {
				text: "Select Value Help\u2026",
				menu: createValueHelpMenu("menuFormRegular")
			}),

			new Label({ text: "Actions (Split)" }),
			new MenuButton("mbFormSplit", {
				text: "Open Region VH",
				buttonMode: MenuButtonMode.Split,
				defaultAction: function () {
					MessageToast.show("Default action: Open Region Value Help");
				},
				menu: createValueHelpMenu("menuFormSplit")
			}),

			// -- Group 2: compare with existing IFormContent controls --
			new Label({ text: "Plain Button" }),
			new Button({ text: "I am a Button" }),

			new Label({ text: "Segmented Button" }),
			new SegmentedButton({
				items: [
					new SegmentedButtonItem({ text: "Option A" }),
					new SegmentedButtonItem({ text: "Option B" }),
					new SegmentedButtonItem({ text: "Option C" })
				]
			}),

			new Label({ text: "Menu Button" }),
			new MenuButton("mbFormCompare", {
				text: "I am a MenuButton",
				menu: createValueHelpMenu("menuFormCompare")
			}),

			new Label({ text: "Regular Input" }),
			new Input({ value: "For width comparison" })
		]
	});

	// ========================================================
	// 2) MenuButton inside sap.ui.mdc.Field content
	//    (requires IFormContent on the control)
	// ========================================================
	var oMdcSection;
	try {
		// mdc.Field may not be available in every OpenUI5 build,
		// so we load it dynamically.
		var Field = sap.ui.require("sap/ui/mdc/Field");
		if (!Field) {
			Field = await new Promise(function (resolve) {
				sap.ui.require(["sap/ui/mdc/Field"], resolve);
			});
		}
		if (!VerticalLayout) {
			VerticalLayout = await new Promise(function (resolve) {
				sap.ui.require(["sap/ui/layout/VerticalLayout"], resolve);
			});
		}

		var oField = new Field("mdcFieldWithMenuButton", {
			label: "MDC Field with MenuButton",
			editMode: "Editable",
			content: new MenuButton("mbInMdcField", {
				text: "Multi-Select Value Help\u2026",
				menu: createValueHelpMenu("menuMdcField")
			})
		});

		var oFieldSplit = new Field("mdcFieldWithMenuButtonSplit", {
			label: "MDC Field with Split MenuButton",
			editMode: "Editable",
			content: new MenuButton("mbInMdcFieldSplit", {
				text: "Open Region VH",
				buttonMode: MenuButtonMode.Split,
				defaultAction: function () {
					MessageToast.show("Default: Region Value Help");
				},
				menu: createValueHelpMenu("menuMdcFieldSplit")
			})
		});

		oMdcSection = new VerticalLayout({
			width: "100%",
			content: [
				new Title({ text: "2 \u2014 MenuButton inside sap.ui.mdc.Field content", level: TitleLevel.H2 })
					.addStyleClass("sapUiMediumMarginTop"),
				new Label({ text: "The MenuButton below lives inside mdc:Field/content aggregation." })
					.addStyleClass("sapUiSmallMarginBottom"),
				oField,
				oFieldSplit
			]
		}).addStyleClass("sapUiContentPadding");
	} catch (e) {
		// If mdc is not available, show a placeholder
		oMdcSection = new Text({
			text: "sap.ui.mdc.Field is not available in this build. " +
				  "The SimpleForm demo above still demonstrates IFormContent."
		}).addStyleClass("sapUiContentPadding");
	}

	// ========================================================
	// 3) Verify that getFormDoNotAdjustWidth works
	// ========================================================
	var oVerifySection = new VerticalLayout({
		width: "100%",
		content: [
			new Title({ text: "3 \u2014 API verification", level: TitleLevel.H2 })
				.addStyleClass("sapUiMediumMarginTop"),
			new Text({
				text: (function () {
					var oMB = new MenuButton();
					var bImplements = oMB.isA("sap.ui.core.IFormContent");
					var bDoNotAdjust = typeof oMB.getFormDoNotAdjustWidth === "function"
						&& oMB.getFormDoNotAdjustWidth() === true;
					oMB.destroy();
					return "MenuButton implements IFormContent: " + bImplements +
						" | getFormDoNotAdjustWidth() === true: " + bDoNotAdjust;
				})()
			})
		]
	}).addStyleClass("sapUiContentPadding");

	// ========================================================
	// Assemble the page
	// ========================================================
	var oPage = new Page("page", {
		title: "MenuButton as IFormContent \u2014 Demo",
		content: [
			oSimpleForm,
			oMdcSection,
			oVerifySection
		]
	});

	new App({ pages: [oPage] }).placeAt("body");
});