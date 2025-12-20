/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display supplier of "/ProductSet('HT-1021')"
 *   from GWSAMPLE_BASIC via XML Templating.
 * @version @version@
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/Title",
	"sap/m/VBox",
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/odata/v2/ODataModel"
], function (MessageBox, Title, VBox, library, UIComponent, XMLView, ODataModel) {
	"use strict";

	var TitleLevel = library.TitleLevel; // shortcut for sap.ui.core.TitleLevel

	return UIComponent.extend("sap.ui.core.sample.ViewTemplate.tiny.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		},

		createContent : function () {
			var oModel = new ODataModel(
					"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/", {
					annotationURI : "annotations.xml",
					json : true,
					loadMetadataAsync : true
				}),
				oMetaModel = oModel.getMetaModel(),
				sPath = "/ProductSet('HT-1021')/ToSupplier",
				oViewContainer = new VBox({
					items : [
						new Title({text : "Run this code sample with UI5 CLI. "
							+ "See the example in 'XML Templating' in the Demo Kit.",
							titleStyle : TitleLevel.H3})
					]
				});

			oMetaModel.loaded().then(function () {
				XMLView.create({
					models : oModel,
					preprocessors : {
						xml : {
							bindingContexts : {
								meta : oMetaModel.getMetaContext(sPath)
							},
							models : {
								meta : oMetaModel
							}
						}
					},
					viewName : "sap.ui.core.sample.ViewTemplate.tiny.Template"
				}).then(function (oTemplateView) {
					oTemplateView.bindElement(sPath);
					oViewContainer.destroyItems();
					oViewContainer.addItem(oTemplateView);
				}, function (oError) {
					MessageBox.alert(oError.message, {
						icon : MessageBox.Icon.ERROR,
						title : "Missing Proxy?"
					});
				});
			});

			// Note: synchronously return s.th. here and add content to it later on
			return oViewContainer;
		}
	});
});
