sap.ui.define([
	"sap/m/Avatar",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Button",
	"sap/ui/core/InvisibleText",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/ObjectAttribute"
], function (Avatar, HBox, VBox, Title, Label, Link, Button, InvisibleText, Toolbar, ToolbarSpacer, ObjectPageLayout, ObjectPageDynamicHeaderTitle, ObjectPageSection, ObjectPageSubSection, ObjectAttribute) {
	"use strict";

	new InvisibleText("phone-inv-text", { text: "Phone" }).toStatic();

	var oObjectPageLayout = new ObjectPageLayout({
		headerTitle: new ObjectPageDynamicHeaderTitle({
			expandedHeading: [
				new HBox({
					items: [
						new Avatar({ displayShape: "Square" }).addStyleClass("sapUiTinyMarginEnd"),
						new VBox({
							items: [
								new Title({ text: "Denise Smith", level: "H1" }),
								new Label({ text: "Web developer" })
							]
						})
					]
				})
			],
			snappedHeading: [
				new VBox({
					items: [
						new Title({ text: "Denise Smith", level: "H1" }),
						new Label({ text: "Web developer" })
					]
				})
			],
			actions: [
				new Button({ text: "Edit", type: "Emphasized", icon: "sap-icon://edit", tooltip: "Edit" }),
				new Button({ text: "Delete", type: "Transparent", icon: "sap-icon://delete", tooltip: "Delete" }),
				new Button({ text: "Copy", type: "Transparent", icon: "sap-icon://copy", tooltip: "Copy" }),
				new Button({
					type: "Transparent",
					text: "Show Footer",
					press: function() {
						// Toggle footer visibility
						var bCurrentlyVisible = oObjectPageLayout.getShowFooter();
						oObjectPageLayout.setShowFooter(!bCurrentlyVisible);

						this.setText(bCurrentlyVisible ? "Show Footer" : "Hide Footer");
					}
				})
			]
		}),
		headerContent: [
			new Label({ text: "Hello! I am Denise and I use UxAP", wrapping: true }),
			new ObjectAttribute({
				title: "Phone",
				customContent: new Link({ text: "+33 6 4512 5158", ariaLabelledBy: ["phone-inv-text"] }),
				active: true
			})
		],
		sections: [
			new ObjectPageSection({
				title: "Section Title",
				subSections: new ObjectPageSubSection({
					blocks: new Label({ text: "Section with show more button" }),
					moreBlocks: new Label({ text: "Another block" })
				})
			}),

			new ObjectPageSection({
				title: "Section Title",
				subSections: new ObjectPageSubSection({
					blocks: new Label({ text: "Subsection without title" })
				})
			}),

			new ObjectPageSection({
				subSections: new ObjectPageSubSection({
					title: "Subsection Title",
					blocks: new Label({ text: "Section without title" })
				})
			}),

			new ObjectPageSection({
				title: "Hidden Section Title",
				showTitle: false,
				subSections: new ObjectPageSubSection({
					title: "Subsection Title",
					blocks: new Label({ text: "Section with hidden title" })
				})
			}),

			new ObjectPageSection({
				title: "Section Title",
				subSections: new ObjectPageSubSection({
					title: "Hidden Subsection Title",
					showTitle: false,
					blocks: new Label({ text: "Subsection with hidden title" })
				})
			}),

			new ObjectPageSection({
				title: "Section Title",
				subSections: [
					new ObjectPageSubSection({
						blocks: new Label({ text: "First subsection without title" })
					}),
					new ObjectPageSubSection({
						blocks: new Label({ text: "Second subsection without title" })
					})
				]
			}),

			new ObjectPageSection({
				title: "Section Title",
				subSections: [
					new ObjectPageSubSection({
						title: "First Subsection Title",
						blocks: new Label({ text: "First subsection with title" })
					}),
					new ObjectPageSubSection({
						blocks: new Label({ text: "Second subsection without title" })
					})
				]
			}),

			new ObjectPageSection({
				title: "Section Title",
				subSections: [
					new ObjectPageSubSection({
						title: "Hidden Subsection Title",
						showTitle: false,
						blocks: new Label({ text: "First subsection with hidden title" })
					}),
					new ObjectPageSubSection({
						blocks: new Label({ text: "Second subsection without title" })
					})
				]
			}),

			new ObjectPageSection({
				title: "Section Title",
				subSections: [
					new ObjectPageSubSection({
						title: "Hidden First Subsection Title",
						showTitle: false,
						blocks: new Label({ text: "First subsection with hidden title" })
					}),
					new ObjectPageSubSection({
						title: "Hidden Second Subsection Title",
						showTitle: false,
						blocks: new Label({ text: "Second subsection with hidden title" })
					})
				]
			})
		],

		// Footer that can be toggled with the button
		footer: new Toolbar({
			content: [
				new ToolbarSpacer(),
				new Button({
					text: "Save",
					type: "Emphasized",
					icon: "sap-icon://save"
				}),
				new Button({
					text: "Cancel",
					type: "Default"
				})
			]
		}),

		// Initially hide the footer
		showFooter: false
	}).placeAt('content');
});
