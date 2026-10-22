sap.ui.define([
  "sap/m/App",
  "sap/m/Dialog",
  "sap/m/Text",
  "sap/m/Button",
  "sap/m/Page",
  "sap/m/DialogAccessibleLandmarkInfo"
], function(App, Dialog, Text, Button, Page, DialogAccessibleLandmarkInfo) {
  "use strict";
  // Note: the HTML page 'DialogLandmarks.html' loads this module via data-sap-ui-on-init

  var oApp = new App();
  oApp.placeAt("body");

  function openDialog(sTitle, oLandmarkInfo) {
	  var oDialog = new Dialog({
		  title: sTitle,
		  landmarkInfo: oLandmarkInfo,
		  content: new Text({
			  text: "Inspect the Header, Content and Footer region landmarks of this Dialog."
		  }).addStyleClass("sapUiSmallMargin"),
		  beginButton: new Button({
			  text: "Close",
			  press: function () {
				  oDialog.close();
			  }
		  }),
		  endButton: new Button({
			  text: "Cancel",
			  press: function () {
				  oDialog.close();
			  }
		  }),
		  afterClose: function () {
			  oDialog.destroy();
		  }
	  });
	  oDialog.open();
  }

  var oPage = new Page({
	  title: "sap.m.Dialog - Accessible Landmarks",
	  content: [
		  new Button({
			  text: "Default Landmarks",
			  press: function () {
				  openDialog("Default Landmarks", null);
			  }
		  }),
		  new Button({
			  text: "Custom Labels",
			  press: function () {
				  openDialog("Custom Labels", new DialogAccessibleLandmarkInfo({
					  headerLabel: "Header label from LandmarkInfo",
					  contentLabel: "Content label from LandmarkInfo",
					  footerLabel: "Footer label from LandmarkInfo"
				  }));
			  }
		  }),
		  new Button({
			  text: "Content Landmark Suppressed",
			  press: function () {
				  openDialog("Content Landmark Suppressed", new DialogAccessibleLandmarkInfo({
					  showContentLandmark: false
				  }));
			  }
		  }),
		  new Button({
			  text: "No Region Landmarks",
			  press: function () {
				  openDialog("No Region Landmarks", new DialogAccessibleLandmarkInfo({
					  showHeaderLandmark: false,
					  showContentLandmark: false,
					  showFooterLandmark: false
				  }));
			  }
		  })
	  ]
  });
  oApp.addPage(oPage);
});