sap.ui.require([
	"sap/m/Title",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Panel",
	"sap/m/Link",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/Slider",
	"sap/m/MessageStrip",
	"sap/m/MessageToast",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/m/QuickView",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroupElement",
	"sap/m/QuickViewGroup",
	"sap/m/Avatar",
	"sap/ui/core/ControlBehavior"
], function (
	Title,
	Page,
	App,
	VBox,
	HBox,
	Panel,
	Link,
	Button,
	Toolbar,
	ToolbarSpacer,
	Label,
	Text,
	Input,
	Slider,
	MessageStrip,
	MessageToast,
	SimpleForm,
	coreLibrary,
	mLibrary,
	QuickView,
	QuickViewPage,
	QuickViewGroupElement,
	QuickViewGroup,
	Avatar,
	ControlBehavior
) {
	"use strict";

	const TitleLevel = coreLibrary.TitleLevel;
	const HasPopup = coreLibrary.aria.HasPopup;
	const QuickViewGroupElementType = mLibrary.QuickViewGroupElementType;
	const PlacementType = mLibrary.PlacementType;
	const sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";
	const sMediumText = "Business Contact Information and Communication Preferences";
	const sShortText = "Status";

	ControlBehavior.attachExtendedKeyboardNavigationChanged(function(oEvent) {
		const bEnabled = oEvent.extendedKeyboardNavigationEnabled;
		if (bEnabled) {
			MessageToast.show("✓ Extended Keyboard Navigation is now ENABLED. Non-truncated titles with custom tooltips are now focusable via Tab key.");
		} else {
			MessageToast.show("Extended Keyboard Navigation is now DISABLED.");
		}
	});

	const oInstructionsStrip = new MessageStrip({
		text: "Press Shift+Alt+F6 (Windows) or Shift+Option+F6 (Mac) to toggle Extended Keyboard Navigation. When enabled, titles with tooltips become focusable. To test RTL mode, add ?sap-ui-rtl=true to the URL and reload the page.",
		type: "Information",
		showIcon: true
	}).addStyleClass("sapUiSmallMarginBottom");

	// ==========================================
	// PANEL 1: Basic Title Scenarios with Slider
	// ==========================================

	const oBasicTitlesPanel = new Panel("basicTitlesPanel", {
		headerText: "Basic Title Scenarios",
		expandable: true,
		expanded: true,
		width: "700px",
		content: [
			// Slider to adjust panel width
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "Panel Width:" }).addStyleClass("sapUiSmallMarginEnd"),
					new Slider({
						value: 700,
						min: 200,
						max: 1200,
						width: "300px",
						liveChange: function(oEvent) {
							const iValue = oEvent.getParameter("value");
							oBasicTitlesPanel.setWidth(iValue + "px");
						}
					}),
					new Text({ text: " (drag to resize)" }).addStyleClass("sapUiSmallMarginBegin")
				]
			}).addStyleClass("sapUiSmallMargin"),

			new VBox({
				items: [
                    new Label({ text: "Short title with no tooltip:" }),
					new Title({
						text: sShortText,
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Short title with custom tooltip:" }),
					new Title({
						text: sShortText,
						tooltip: "Additional information about the status",
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Short title with width=100% and custom tooltip:" }),
					new Title({
						text: sShortText,
						width: "100%",
						tooltip: "More details about the current status",
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Short title with width=300px and custom tooltip:" }),
					new Title({
						text: sShortText,
						width: "300px",
						tooltip: "Helpful context for this field",
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Long title truncated by panel width (shows truncation tooltip):" }),
					new Title({
						text: sLongText,
						wrapping: false,
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Long title with custom tooltip (overrides truncation tooltip):" }),
					new Title({
						text: sLongText,
						wrapping: false,
						tooltip: "Important note about this section",
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Medium-length title (may or may not truncate based on width):" }),
					new Title({
						text: sMediumText,
						wrapping: false,
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Long title with width=300px (always truncated):" }),
					new Title({
						text: sLongText,
						width: "300px",
						wrapping: false,
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Long title with width=500px:" }),
					new Title({
						text: sLongText,
						width: "500px",
						wrapping: false,
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Wrapping title with custom tooltip:" }),
					new Title({
						text: sLongText,
						wrapping: true,
						tooltip: "This section contains important guidelines",
						titleStyle: TitleLevel.H3
					}).addStyleClass("sapUiSmallMarginBottom")
				]
			}).addStyleClass("sapUiSmallMargin")
		]
	}).addStyleClass("sapUiSmallMarginBottom");

	// ==========================================
	// PANEL 2: SimpleForm with ResponsiveGridLayout Toolbar Titles (Realistic Pattern)
	// ==========================================

	const oFormPanel = new Panel({
		headerText: "SimpleForm with ResponsiveGridLayout - Toolbar Titles",
		expandable: true,
		expanded: true,
		content: [
			new SimpleForm({
				editable: true,
				width: "600px",
				layout: "ResponsiveGridLayout",
				ariaLabelledBy: "formMainTitle",
				toolbar: new Toolbar({
					content: [
						new Title({
							id: "formMainTitle",
							text: "Customer Contact Information",
							titleStyle: TitleLevel.H4,
							tooltip: "Edit customer contact details and preferences"
						}),
						new ToolbarSpacer(),
						new Button({ icon: "sap-icon://action-settings", tooltip: "Form Settings" })
					]
				}),
				content: [
					new Toolbar({
						ariaLabelledBy: "sectionTitle1",
						content: [
							new Title({
								id: "sectionTitle1",
								text: "Personal Information",
								titleStyle: TitleLevel.H5,
								tooltip: "Enter basic personal details"
							}),
							new ToolbarSpacer(),
							new Button({ icon: "sap-icon://edit", tooltip: "Edit Section" })
						]
					}),
					new Label({ text: "First Name" }),
					new Input({ value: "John" }),
					new Label({ text: "Last Name" }),
					new Input({ value: "Doe" }),
					new Label({ text: "Email" }),
					new Input({ value: "john.doe@example.com" }),

					new Toolbar({
						ariaLabelledBy: "sectionTitle2",
						content: [
							new Title({
								id: "sectionTitle2",
								text: sLongText,
								titleStyle: TitleLevel.H5
							}),
							new ToolbarSpacer(),
							new Button({ icon: "sap-icon://hint", tooltip: "Section Help" })
						]
					}),
					new Label({ text: "Company" }),
					new Input({ value: "SAP SE" }),
					new Label({ text: "Department" }),
					new Input({ value: "Product Engineering" }),

					new Toolbar({
						ariaLabelledBy: "sectionTitle3",
						content: [
							new Title({
								id: "sectionTitle3",
								text: "Address Details",
								titleStyle: TitleLevel.H5,
								tooltip: "Shipping and billing address information"
							})
						]
					}),
					new Label({ text: "Street" }),
					new Input({ value: "Dietmar-Hopp-Allee 16" }),
					new Label({ text: "City" }),
					new Input({ value: "Walldorf" })
				]
			}).addStyleClass("sapUiSmallMargin")
		]
	}).addStyleClass("sapUiSmallMarginBottom");

	// ==========================================
	// PANEL 2b: SimpleForm with ColumnLayout Toolbar Titles
	// ==========================================
	// Sibling layout to ResponsiveGridLayout. The Form toolbar CSS
	// (.sapUiFormCL.sapUiFormToolbar > div:first-child) forces line-height
	// on all toolbar children. Used to verify the Title with the enhanced
	// tooltip is not affected by the stretched-box behavior.

	const oColumnLayoutFormPanel = new Panel({
		headerText: "SimpleForm with ColumnLayout - Toolbar Titles",
		expandable: true,
		expanded: true,
		content: [
			new SimpleForm({
				editable: true,
				width: "600px",
				layout: "ColumnLayout",
				ariaLabelledBy: "clFormMainTitle",
				toolbar: new Toolbar({
					content: [
						new Title({
							id: "clFormMainTitle",
							text: "Customer Contact Information",
							titleStyle: TitleLevel.H4,
							tooltip: "Edit customer contact details and preferences"
						}),
						new ToolbarSpacer(),
						new Button({ icon: "sap-icon://action-settings", tooltip: "Form Settings" })
					]
				}),
				content: [
					new Toolbar({
						ariaLabelledBy: "clSectionTitle1",
						content: [
							new Title({
								id: "clSectionTitle1",
								text: sLongText,
								titleStyle: TitleLevel.H5,
								tooltip: "Enter basic personal details"
							}),
							new ToolbarSpacer(),
							new Button({ icon: "sap-icon://edit", tooltip: "Edit Section" })
						]
					}),
					new Label({ text: "First Name" }),
					new Input({ value: "John" }),
					new Label({ text: "Last Name" }),
					new Input({ value: "Doe" }),
					new Label({ text: "Email" }),
					new Input({ value: "john.doe@example.com" })
				]
			}).addStyleClass("sapUiSmallMargin")
		]
	}).addStyleClass("sapUiSmallMarginBottom");

	// ==========================================
	// PANEL 2c: SimpleForm with ResponsiveLayout Toolbar Titles
	// ==========================================
	// Deprecated sibling layout. The Form toolbar CSS
	// (.sapUiFormResLayout.sapUiFormToolbar > div:first-child) forces
	// line-height on all toolbar children. Used to verify the Title with
	// the enhanced tooltip is not affected by the stretched-box behavior.

	const oResponsiveLayoutFormPanel = new Panel({
		headerText: "SimpleForm with ResponsiveLayout - Toolbar Titles",
		expandable: true,
		expanded: true,
		content: [
			new SimpleForm({
				editable: true,
				width: "600px",
				layout: "ResponsiveLayout",
				ariaLabelledBy: "rlFormMainTitle",
				toolbar: new Toolbar({
					content: [
						new Title({
							id: "rlFormMainTitle",
							text: "Customer Contact Information",
							titleStyle: TitleLevel.H4,
							tooltip: "Edit customer contact details and preferences"
						}),
						new ToolbarSpacer(),
						new Button({ icon: "sap-icon://action-settings", tooltip: "Form Settings" })
					]
				}),
				content: [
					new Toolbar({
						ariaLabelledBy: "rlSectionTitle1",
						content: [
							new Title({
								id: "rlSectionTitle1",
								text: sLongText,
								titleStyle: TitleLevel.H5,
								tooltip: "Enter basic personal details"
							}),
							new ToolbarSpacer(),
							new Button({ icon: "sap-icon://edit", tooltip: "Edit Section" })
						]
					}),
					new Label({ text: "First Name" }),
					new Input({ value: "John" }),
					new Label({ text: "Last Name" }),
					new Input({ value: "Doe" }),
					new Label({ text: "Email" }),
					new Input({ value: "john.doe@example.com" })
				]
			}).addStyleClass("sapUiSmallMargin")
		]
	}).addStyleClass("sapUiSmallMarginBottom");

	// ==========================================
	// PANEL 3: Titles in Toolbars (All Size Variants)
	// ==========================================

	const oToolbarTitlePanel = new Panel({
		headerText: "Titles in Toolbars - All Title Levels (H2-H6)",
		expandable: true,
		expanded: true,
		width: "600px",
		content: [
			new VBox({
				items: [
					new Toolbar({
						content: [
							new Title({
								text: sLongText,
								titleStyle: TitleLevel.H2
							}),
							new ToolbarSpacer(),
							new Button({ icon: "sap-icon://hint" })
						]
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Toolbar({
						content: [
							new Title({
								text: "Medium H3 Title",
								titleStyle: TitleLevel.H3,
								tooltip: "Custom tooltip for H3 level title"
							})
						]
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Toolbar({
						content: [
							new Title({
								text: "SAP Business Technology Platform - Cloud Foundry Environment Configuration and Management",
								titleStyle: TitleLevel.H4
							}),
							new ToolbarSpacer(),
							new Button({ icon: "sap-icon://edit" })
						]
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Toolbar({
						content: [
							new Title({
								text: "Small H5 Title",
								titleStyle: TitleLevel.H5,
								tooltip: "Custom tooltip for H5 level title"
							})
						]
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Toolbar({
						content: [
							new Title({
								text: sMediumText,
								titleStyle: TitleLevel.H6,
								tooltip: "Custom tooltip for H6 level title"
							}),
							new ToolbarSpacer(),
							new Button({ icon: "sap-icon://action-settings" })
						]
					})
				]
			}).addStyleClass("sapUiSmallMargin")
		]
	}).addStyleClass("sapUiSmallMarginBottom");

	// ==========================================
	// PANEL 4: Title with Link (Content Aggregation)
	// ==========================================
	const oTitleWithLinkPanel = new Panel({
		headerText: "Title with Link (Content Aggregation)",
		expandable: true,
		expanded: true,
		width: "400px",
		content: [
			new VBox({
				items: [
					new Label({ text: "Short Link with tooltip:" }),
					new Title({
						titleStyle: TitleLevel.H3,
						content: new Link({
							text: "Help Center",
							href: "#",
							tooltip: "Open the help center in a new window"
						})
					}).addStyleClass("sapUiSmallMarginBottom"),

					new Label({ text: "Long Link (truncates):" }),
					new Title({
						titleStyle: TitleLevel.H3,
						content: new Link({
							text: "Complete Reference Documentation for SAP UI5 Integration Cards",
							href: "#",
							wrapping: false
						})
					}).addStyleClass("sapUiSmallMarginBottom")
				]
			}).addStyleClass("sapUiSmallMargin")
		]
	}).addStyleClass("sapUiSmallMarginBottom");

    // ==========================================
    // PANEL 5: Special Content Scenarios
    // ==========================================
    const oSpecialContentPanel = new Panel({
		headerText: "Special Content Scenarios",
		expandable: true,
		expanded: true,
		width: "500px",
		content: [
			new VBox({
				items: [
					new Title({
						text: "Product #12345 - Status: In Progress (85%) - Due: 2026-12-31",
						wrapping: false,
						titleStyle: TitleLevel.H4
					}).addStyleClass("sapUiSmallMarginBottom"),
					new Title({
						text: "Email: support@company.com | Phone: +1-800-555-0199 | Web: https://www.example-company-portal.com/support/documentation",
						wrapping: false,
						titleStyle: TitleLevel.H4,
						tooltip: "Contact information for technical support team"
					}).addStyleClass("sapUiSmallMarginBottom"),
					new Title({
						text: "File: /users/shared/documents/2026/Q4/reports/financial-summary-november.xlsx",
						wrapping: false,
						titleStyle: TitleLevel.H4
					})
				]
			}).addStyleClass("sapUiSmallMargin")
		]
	}).addStyleClass("sapUiSmallMarginBottom");

	const oQuickView = new QuickView("QV", {
		placement : PlacementType.VerticalPreferredBottom,
		pages : [
			new QuickViewPage({
				header	: "Store",
				title	: "Jumbo Jumbo Jumbo Jumbo Jumbo Jumbo Loooooooooooooooooooooooooong",
				description	: "The best toy store in the USA Loooooooooooooooooooooooooong",
				avatar: new Avatar({
					src: "sap-icon://retail-store"
				}),
				groups	: [
					new QuickViewGroup({
						heading		: "Store details",
						elements	: [
							new QuickViewGroupElement({
								label	: "Address",
								value	: "Sunset Blvd. 7, Los Angeles"
							}),
							new QuickViewGroupElement({
								label	: "Website",
								value	: "http://jumbo.com",
								url 	: "http://jumbo.com",
								type	: QuickViewGroupElementType.link
							}),
							new QuickViewGroupElement({
								label	: "Email",
								value	: "info@jumbo.com",
								type	: QuickViewGroupElementType.email
							}),
							new QuickViewGroupElement({
								label	: "Opening hours",
								value	: "Every day from 8AM to 10PM",
								type	: QuickViewGroupElementType.text
							})
						]
					})
				]
			})
		]
	});


	const oQuickViewButton = new Button("SinglePageQVButton", {
		text: "Open a single page quick view",
		ariaHasPopup: HasPopup.Dialog,
		press: function() {
			oQuickView.openBy(this);
		}
	});

	// ==========================================
	// PAGE ASSEMBLY
	// ==========================================

	const oPage = new Page({
		title: "Title Tooltips - Comprehensive Test",
		content: [
			oInstructionsStrip,
			oBasicTitlesPanel,
			oFormPanel,
			oColumnLayoutFormPanel,
			oResponsiveLayoutFormPanel,
			oToolbarTitlePanel,
			oTitleWithLinkPanel,
			oSpecialContentPanel,
			oQuickViewButton
		]
	});

	const oApp = new App({
		pages: [oPage]
	});

	oApp.placeAt("body");
});
