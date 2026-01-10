// Note: the HTML page 'FileUploaderVisual.html' loads this module via data-sap-ui-on-init

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/mvc/XMLView", "sap/ui/thirdparty/jquery"],
function(Controller, XMLView, jQuery) {
	"use strict";
	Controller.extend("myController", {
		onInit: function () {
			// Initialization code can go here
		},
		onActionPress: function () {
			alert("Button Pressed!");
		}
	});

	XMLView.create({definition: jQuery('#myXml').html()}).then(function (oView) {
		oView.placeAt("content");
	});
});