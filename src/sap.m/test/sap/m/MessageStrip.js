sap.ui.define([
  "sap/ui/core/Theming",
  "sap/m/MessageStrip",
  "sap/m/Link",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/Button",
  "sap/m/Toolbar",
  "sap/m/Label",
  "sap/m/ToolbarSpacer",
  "sap/m/Text",
  "sap/m/Page",
  "sap/m/App"
], function(Theming, MessageStrip, Link, Select, Item, Button, Toolbar, Label, ToolbarSpacer, Text, Page, App) {
  "use strict";
  // Note: the HTML page 'MessageStrip.html' loads this module via data-sap-ui-on-init

  // This page is used for visualtesting

  var oMCInformation = new MessageStrip("mcontainer1", {
	  type: "Information",
	  text: "You have configured Windows Internet Explorer to block unsigned ActiveX controls.",
	  link: new Link({
		  text: "Learn more",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCSuccess = new MessageStrip("mcontainer2", {
	  type: "Success",
	  showIcon: true,
	  text: "We have received your enquiry and will respond to you within 24 hours." +
		  "For urgent enquiries please call us on one of the telephone numbers below.",
	  link: new Link({
		  text: "Learn more",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCWarningExpand = new MessageStrip("mcontainer3", {
	  type: "Warning",
	  showIcon: true,
	  text: "This page might not behave as expected because Windows Internet Explorer " +
		  "isn't configured to load unsigned ActiveX controls. Allow this page to install an unsigned " +
		  "ActiveX Control? Doing so from untrusted sources may harm your computer." +
		  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat sagittis tortor," +
		  "quis suscipit urna ornare ut. Donec semper auctor turpis"
  });

  var oMCError = new MessageStrip("mcontainer4", {
	  type: "Error",
	  showIcon: true,
	  text: "This page cannot load an unsigned ActiveX control.",
	  link: new Link({
		  text: "Learn more",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCInformationIC = new MessageStrip("mcontainer5", {
	  type: "Information",
	  showIcon: true,
	  showCloseButton: true,
	  text: "You have configured Windows Internet Explorer to block unsigned ActiveX controls.",
	  link: new Link({
		  text: "SAP CE",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCInformationLong = new MessageStrip("mcontainer6", {
	  type: "Information",
	  showCloseButton: true,
	  text: "Very long text: Lorem ipsum dolor sit amet, consectetur adipisicing elit." +
		  "Ex libero maxime quasi qui veniam? Alias ducimus laborum porro quidem quo velit?" +
		  "Cumque est in iusto, magnam minus quis tempora tenetur? Adipisci aliquid atque doloribus " +
		  "error expedita hic necessitatibus nesciunt nobis non odit quas, quos ratione reiciendis repellendus " +
		  "sapiente suscipit tempore voluptas. Aut cupiditate, est iusto provident saepe voluptatum." +
		  "A autem excepturi fugit iure reprehenderit. Aut autem dolor eaque esse exercitationem, expedita facilis," +
		  "fugiat incidunt iure iusto magni minima mollitia odit perferendis possimus provident quaerat quo " +
		  "repellendus temporibus ullam unde velit, vero voluptates! A aliquam aspernatur dolorem dolorum fuga " +
		  "harum omnis quos sed totam voluptas. Accusamus alias atque commodi cumque dicta, dignissimos dolore error " +
		  "et facilis impedit in iste maiores nemo neque nobis, odit optio placeat provident quia totam voluptas " +
		  "voluptate voluptates. Architecto blanditiis culpa eveniet expedita harum, iure molestias nam qui sint tenetur!"
  });

  // Example using MessageStripUtilities.getInlineIcon() helper with icon names
  var MSUtils = sap.ui.require("sap/m/MessageStripUtilities");
  var oMCWithInlineIcons = new MessageStrip({
	  type: "Warning",
	  showIcon: true,
	  enableFormattedText: true,
	  text: "System status: " + MSUtils.getInlineIcon("sap-icon://alert") + " critical error detected " + MSUtils.getInlineIcon("sap-icon://message-warning") + " in module " + MSUtils.getInlineIcon("sap-icon://settings") + " configuration."
  });

  var oMCWithInlineIconsAndHTML = new MessageStrip({
	  type: "Success",
	  showIcon: true,
	  text: "<strong>Deployment successful!</strong> " + MSUtils.getInlineIcon("sap-icon://message-success") +
		  " All services " + MSUtils.getInlineIcon("sap-icon://sys-enter-2") +
		  " are running. <em>Check status</em> " + MSUtils.getInlineIcon("sap-icon://stethoscope"),
	  enableFormattedText: true
  });

  var oMCWarning = new MessageStrip("mcontainer7", {
	  type: "Warning",
	  showIcon: true,
	  text: "This page might not behave as expected because Windows Internet Explorer " +
		  "isn't configured to load unsigned ActiveX controls.Allow this page to install an unsigned " +
		  "ActiveX Control? Doing so from untrusted sources may harm your computer.",
	  link: new Link({
		  text: "Learn more",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCWarningWithFormattedText = new MessageStrip({
	  type: "Warning",
	  enableFormattedText: true,
	  showIcon: true,
	  text: "<strong>Warning:</strong> This page might not behave as expected because Windows Internet Explorer " +
		  "isn't <em><u>configured to load unsigned</u></em> <a href='http://www.sap.com/' target='_blank'>ActiveX</a> controls.Allow this page to install an unsigned " +
		  "ActiveX Control? <em><strong>Doing so from untrusted sources</strong> may harm your computer.</em>" +
		  "<a href='http://www.sap.com/' target='_blank'>Learn more</a>"
  });

  // Create ColorSet examples using loops
  var aColorSetExamples = [];

  // Default design examples (explicit)
  var aDefaultTypes = ["Information", "Success"];
  aDefaultTypes.forEach(function (sType) {
	  aColorSetExamples.push(new MessageStrip({
		  colorSet: "Default",
		  type: sType,
		  showIcon: true,
		  showCloseButton: true,
		  text: "Default Design - " + sType + ": Standard semantic color"
	  }));
  });

  // ColorSet1 examples - All 10 color schemes
  for (var i = 1; i <= 10; i++) {
	  aColorSetExamples.push(new MessageStrip({
		  customIcon: "sap-icon://alert",
		  showIcon: true,
		  colorSet: "ColorSet1",
		  colorScheme: i,
		  showCloseButton: true,
		  text: "ColorSet1 - Color Scheme " + i + ": Custom color palette",
		  link: new Link({
			  text: "Learn more",
			  href: "http://www.sap.com/",
			  target: "_blank"
		  })
	  }));
  }

  // Special interactive MessageStrip for testing dynamic colorScheme changes
  var oInteractiveMessageStrip = new MessageStrip("interactiveMessageStrip", {
	  customIcon: "sap-icon://message-success",
	  showIcon: true,
	  colorSet: "ColorSet1",
	  colorScheme: 3,
	  showCloseButton: true,
	  text: "Interactive ColorSet1 - Color Scheme 3: Click the button below to cycle through color schemes!",
	  link: new Link({
		  text: "Test link",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  // ColorSet2 examples - All 10 color schemes
  for (var j = 1; j <= 10; j++) {
	  aColorSetExamples.push(new MessageStrip({
		  customIcon: "sap-icon://message-information",
		  showIcon: true,
		  colorSet: "ColorSet2",
		  colorScheme: j,
		  showCloseButton: true,
		  text: "ColorSet2 - Color Scheme " + j + ": Alternative color palette",
		  link: new Link({
			  text: "Learn more",
			  href: "http://www.sap.com/",
			  target: "_blank"
		  })
	  }));
  }

  // Theme switcher button
  var oThemeSelect = new Select("themeSelect", {
	  items: [
		  new Item({ key: "sap_horizon", text: "Horizon Light" }),
		  new Item({ key: "sap_horizon_dark", text: "Horizon Dark" }),
		  new Item({ key: "sap_horizon_hcb", text: "Horizon High Contrast Black" }),
		  new Item({ key: "sap_horizon_hcw", text: "Horizon High Contrast White" }),
		  new Item({ key: "sap_fiori_3", text: "Fiori 3.0" }),
		  new Item({ key: "sap_fiori_3_dark", text: "Fiori 3.0 Dark" }),
		  new Item({ key: "sap_fiori_3_hcb", text: "Fiori 3.0 High Contrast Black" }),
		  new Item({ key: "sap_fiori_3_hcw", text: "Fiori 3.0 High Contrast White" })
	  ],
	  selectedKey: Theming.getTheme(),
	  change: function(oEvent) {
		  var sSelectedTheme = oEvent.getParameter("selectedItem").getKey();
		  Theming.setTheme(sSelectedTheme);
	  }
  });

  // Interactive color scheme changer
  var iCurrentScheme = 3;
  var oColorSchemeChangeButton = new Button("colorSchemeBtn", {
	  text: "Change Color Scheme (Current: 3)",
	  type: "Emphasized",
	  press: function() {
		  // Cycle through color schemes 1-10
		  iCurrentScheme = (iCurrentScheme % 10) + 1;
		  oInteractiveMessageStrip.setColorScheme(iCurrentScheme);
		  oInteractiveMessageStrip.setText("Interactive ColorSet1 - Color Scheme " + iCurrentScheme + ": Click the button to cycle through color schemes!");
		  this.setText("Change Color Scheme (Current: " + iCurrentScheme + ")");
	  }
  });

  var oColorSetChangeButton = new Button("colorSetBtn", {
	  text: "Switch to ColorSet2",
	  press: function() {
		  var sCurrentColorSet = oInteractiveMessageStrip.getColorSet();
		  if (sCurrentColorSet === "ColorSet1") {
			  oInteractiveMessageStrip.setColorSet("ColorSet2");
			  oInteractiveMessageStrip.setText("Interactive ColorSet2 - Color Scheme " + iCurrentScheme + ": Now using ColorSet2 palette!");
			  this.setText("Switch to ColorSet1");
		  } else {
			  oInteractiveMessageStrip.setColorSet("ColorSet1");
			  oInteractiveMessageStrip.setText("Interactive ColorSet1 - Color Scheme " + iCurrentScheme + ": Now using ColorSet1 palette!");
			  this.setText("Switch to ColorSet2");
		  }
	  }
  });

  var oInteractiveToolbar = new Toolbar({
	  content: [
		  new Label({ text: "Interactive Demo:" }).addStyleClass("sapUiTinyMarginEnd"),
		  oColorSchemeChangeButton,
		  oColorSetChangeButton,
		  new ToolbarSpacer(),
		  new Text({ text: "Test dynamic colorScheme and colorSet changes" }).addStyleClass("sapUiTinyMargin")
	  ]
  }).addStyleClass("sapUiMediumMarginBottom");

  var oThemeToolbar = new Toolbar({
	  content: [
		  new Label({ text: "Theme:", labelFor: "themeSelect" }).addStyleClass("sapUiTinyMarginEnd"),
		  oThemeSelect,
		  new ToolbarSpacer(),
		  new Text({ text: "Test the contrast text styling for ColorSet1 in different themes" }).addStyleClass("sapUiTinyMargin")
	  ]
  }).addStyleClass("sapUiMediumMarginBottom");

  var oPageNoLayout = new Page("no-layout", {
	  title: "Several MessageStrip controls with no layout",
	  titleLevel: "H1",
	  content: [
		  oThemeToolbar,
		  oInteractiveToolbar,
		  oInteractiveMessageStrip,
		  new Label({ text: "Standard MessageStrip Examples:" }).addStyleClass("sapUiMediumMarginTop sapUiSmallMarginBottom"),
		  oMCInformation,
		  oMCSuccess,
		  oMCWarningExpand,
		  oMCError,
		  oMCInformationIC,
		  oMCInformationLong,
		  oMCWarning,
		  oMCWarningWithFormattedText,
		  new Label({ text: "Inline Icon Examples:" }).addStyleClass("sapUiMediumMarginTop sapUiSmallMarginBottom"),
		  oMCWithInlineIcons,
		  oMCWithInlineIconsAndHTML,
		  new Label({ text: "ColorSet Examples:" }).addStyleClass("sapUiMediumMarginTop sapUiSmallMarginBottom")
	  ].concat(aColorSetExamples)
  }).addStyleClass("sapUiContentPadding");

  var oApp = new App("myApp", {
	  initialPage: "no-layout",
	  pages: [oPageNoLayout]
  });

  oApp.placeAt("content");
});