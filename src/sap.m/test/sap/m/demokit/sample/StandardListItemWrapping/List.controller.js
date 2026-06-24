sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.StandardListItemWrapping.List", {

		onInit : function (evt) {

			var oData = {
				wrapping: false,
				names: [{
						title: "Short title",
						icon: "sap-icon://favorite",
						highlight: "Success",
						info: "Available",
						infoIcon: "sap-icon://accept"
					},
					{
						title: "Short title with long info text",
						icon: "sap-icon://employee",
						highlight: "Error",
						info: "This is a very long information status text that demonstrates truncation and wrapping behavior",
						infoIcon: "sap-icon://decline"
					},
					{
						title: "wrapCharLimit is set to Default. Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
						desc: "Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
						icon: "sap-icon://favorite",
						highlight: "Success",
						info: "Completed",
						infoIcon: "sap-icon://accept"
					},
					{
						title: "wrapCharLimit is set to 100. Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
						desc: "Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
						icon: "sap-icon://employee",
						highlight: "Error",
						info: "Incomplete",
						infoIcon: "sap-icon://decline",
						wrapCharLimit: 100
					},
					{
						title: "Title text",
						desc: "Description text",
						icon: "sap-icon://accept",
						highlight: "Information",
						info: "Information",
						infoIcon: "sap-icon://information",
						wrapCharLimit: 10
					}
				]
			};

			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		}
	});


	return ListController;

});