sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, PDFViewer, JSONModel, MessageToast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PDFViewerPopup.Page", {

		onInit: function () {
			this._pdfViewer = new PDFViewer({
				isTrustedSource : true
			});
			this._pdfViewer.attachError(function (oEvent) {
				if (oEvent.getParameter("errorType") === "PLUGIN_NOT_ENABLED") {
					MessageToast.show("Your browser does not support PDF preview. To download the file, choose Download.");
				}
			});
			this.getView().addDependent(this._pdfViewer);

			var oSample1Model = new JSONModel({
				Source: sap.ui.require.toUrl("sap/m/sample/PDFViewerPopup/sample1.pdf"),
				Preview: sap.ui.require.toUrl("sap/m/sample/PDFViewerPopup/sample1.jpg")
			});
			var oSample2Model = new JSONModel({
				Source: sap.ui.require.toUrl("sap/m/sample/PDFViewerPopup/sample2.pdf"),
				Preview: sap.ui.require.toUrl("sap/m/sample/PDFViewerPopup/sample2.jpg")
			});

			this.byId('image1').setModel(oSample1Model);
			this.byId('image2').setModel(oSample2Model);
		},

		onPress: function (oEvent) {
			var sSource = oEvent.getSource().getModel().getData().Source;
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("My Custom Title");
			this._pdfViewer.open();
		}
	});

	return PageController;

});