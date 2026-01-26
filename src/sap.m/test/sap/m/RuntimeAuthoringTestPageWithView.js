sap.ui.define("my/own/Controller", [
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel"
], (MessageBox, Controller, MockServer, ODataModel) => {
	return Controller.extend("my.own.Controller", {
		onInit(){
			this.sMockServerBaseUri = sap.ui.require.toUrl("test-resources/sap/ui/core/demokit/sample/ViewTemplate/scenario/data/");
			this.sServiceUri = "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/";

			this.oMockServer = new MockServer({rootUri : this.sServiceUri});
			// configure

			this.oMockServer.simulate(this.sMockServerBaseUri + "metadata.xml", {
				sMockdataBaseUrl : this.sMockServerBaseUri,
				bGenerateMissingMockData : true
			});
			this.oMockServer.start();
			var oModel = new ODataModel(this.sServiceUri, {defaultBindingMode:"TwoWay"});
			this.getView().setModel(oModel);
			this.getView().bindElement("/ProductSet('HT-1000')");
		},
		onPress(oEvent) {
			MessageBox.alert(oEvent.getSource());
		},
		onItemPress(oEvent) {
			oEvent.getParameter("item").firePress();
		}
	});
});

sap.ui.define("my/own/View", [
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MenuButton",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/mvc/View",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement"
], (
	Button,
	Input,
	Menu,
	MenuItem,
	MenuButton,
	Text,
	Toolbar,
	ToolbarSpacer,
	View,
	Form,
	FormContainer,
	FormElement
) => {
	return View.extend("my.own.view", {
		getControllerName() {
			return "my.own.Controller";
		},
		// defines the UI of this View
		createContent: function(oController) {
			return [
				new Toolbar({
					id: "toolbar1",
					content: [
						new MenuButton({
							id: "mbtn",
							text: "MenuButton_1",
							menu: new Menu({
								itemSelected: oController.onItemPress,
								items: [
									new MenuItem({id: "mitem1", icon:"sap-icon://accept", text: "Item1"}),
									new MenuItem({id: "mitem2", icon:"sap-icon://decline", text: "Item2", press: oController.onPress})
								]
							})
						}),
						new ToolbarSpacer(),
						new Text({text: "Toolbar"}),
						new ToolbarSpacer(),
						new MenuButton({
							id: "mbtn2",
							text: "MenuButton_2",
							menu: new Menu({
								items: [
									new MenuItem({id: "mitem21", icon:"sap-icon://cart-3", text: "Item1", press: oController.onPress}),
									new MenuItem({id: "mitem22", icon:"sap-icon://cart-4", text: "Item2"}),
									new MenuItem({id: "mitem23", icon:"sap-icon://cart-5", text: "Item3"})
								]
							})
						})
					]
				}),
				new sap.m.Bar({
					id: "bar0",
					contentLeft: [
						new Text({
							text: "Bar"
						})
					],
					contentMiddle: [
						new Button({
							id: "btn1",
							text: "Button 1",
							icon: "sap-icon://cart-3",
							press: oController.onPress
						}),
						new Button({
							id: "btn2",
							text: "Button 2",
							icon: "sap-icon://cart-4",
							press: oController.onPress
						}),
						new Button({
							id: "btn3",
							text: "Button 3",
							icon:"sap-icon://cart-5",
							press: oController.onPress
						})
					]
				}),
				new sap.m.OverflowToolbar({
					id: "overflowtb0",
					content: [
						new Button({
							id: "btn4",
							text: "Button 1",
							icon: "sap-icon://cart-3",
							press: oController.onPress
						}),
						new Button({
							id: "btn5",
							text: "Button 2",
							icon: "sap-icon://cart-4",
							press: oController.onPress
						}),
						new Button({
							id: "btn6",
							text: "Button 3",
							icon:"sap-icon://cart-5",
							press: oController.onPress
						}),
						new ToolbarSpacer(),
						new Text({text: "Overflow Toolbar"}),
						new ToolbarSpacer(),
						new MenuButton({
							id: "mbtn1",
							text: "MenuButton_2",
							menu: new Menu({
								itemSelected: oController.onItemPress,
								items: [
									new MenuItem({id: "mitem3", icon:"sap-icon://accept", text: "Item1"}),
									new MenuItem({id: "mitem4", icon:"sap-icon://decline", text: "Item2", press: oController.onPress})
								]
							})
						})

					]
				}),
				new Form({
					id: "form",
					title: "Form",
					layout: new sap.ui.layout.form.GridLayout(),
					formContainers: [
						new FormContainer({
							id: "formContainer",
							formElements: [
								new FormElement({
									id: "formElement",
									label: "Name",
									fields: [new Input({
												value: "{Name}"
											}
									)]
								}),
								new sap.ui.layout.form.FormElement({
									id: "formElement2",
									label: "CompanyId",
									fields: [new Input({
												value: "{CompanyId}"
											}
									)]
								})
							]
						})
					]
				})
			]
		}
	});
});

sap.ui.define("my/own/Component", [
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/rta/RuntimeAuthoring"
], (
	App,
	Bar,
	Button,
	Page,
	UIComponent,
	View,
	RuntimeAuthoring
) => {
	return UIComponent.extend("MyComponent", {
		metadata: {
			interfaces: [
				"sap.ui.core.IAsyncContentCreation"
			]
		},

		async createContent() {
			const oView = await View.create({
				viewName: "module:my/own/View"
			});

			return this.runAsOwner(() => {
				const oRootPage = new Page({
					id: "idMain1",
					content: oView,
					footer: new Bar({
						id: "bar1",
						contentLeft: [
							new Button({
								id: "adapt",
								text: "Adapt UI",
								press: function () {
									var oRta = new RuntimeAuthoring({
										rootControl: oRootPage,
										flexSettings: {
											layer: "VENDOR"
										}
									});
									oRta.attachStop(function() {
										oRta.destroy();
									});
									oRta.start();
								}
							})
						]
					})
				})

				return new App("myApp", {
					pages: [
						oRootPage
					]
				});
			});
		}
	});
});

sap.ui.define([
	"sap/ui/core/ComponentContainer"
], (ComponentContainer) => {
	"use strict";

	new ComponentContainer({
		name: "my.own",
		async: true,
		manifest: false
	}).placeAt("content");
});