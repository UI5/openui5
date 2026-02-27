sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/ui/layout/library",
	"sap/m/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/m/DatePicker",
	"sap/m/RadioButtonGroup",
	"sap/m/RadioButton",
	"sap/m/TextArea",
	"sap/m/Link",
	"sap/m/ToggleButton",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/CheckBox",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem"
	],
	function(
		CoreLib,
		Element,
		LayoutLib,
		MLib,
		Form,
		FormContainer,
		FormElement,
		SemanticFormElement,
		ColumnLayout,
		ColumnElementData,
		ColumnContainerData,
		Title,
		Toolbar,
		ToolbarSpacer,
		mTitle,
		Label,
		Text,
		Input,
		Select,
		ListItem,
		DatePicker,
		RadioButtonGroup,
		RadioButton,
		TextArea,
		Link,
		ToggleButton,
		Button,
		Image,
		CheckBox,
		SegmentedButton,
		SegmentedButtonItem
		) {
	"use strict";

	// TODO: Fake iSematicFormContent on controls until it is official supported
	var myTypeCheck = function(vTypeName) {
		if (vTypeName === "sap.ui.core.ISemanticFormContent") {
			return true;
		} else {
			return this.getMetadata().isA(vTypeName);
		}
	};
	Input.prototype.isA = myTypeCheck;

	var toggleLayoutData = function(oEvent){
		var oControl, oLayoutData;
		var oButton = Element.getElementById("B1");
		if (oEvent.getParameter("pressed")){
			oControl = Element.getElementById("C14-L1");
			oLayoutData = new ColumnElementData({cellsSmall: 2, cellsLarge: 12});
			oControl.setLayoutData(oLayoutData);
			oControl = Element.getElementById("C14-I2");
			oLayoutData = new ColumnElementData({cellsSmall: 2, cellsLarge: 12});
			oControl.setLayoutData(oLayoutData);
			oButton.setEnabled(true);
		} else {
			oControl = Element.getElementById("C14-L1");
			oControl.destroyLayoutData();
			oControl = Element.getElementById("C14-I2");
			oControl.destroyLayoutData();
			oButton.setEnabled(false);
		}
	};

	var changeLayoutData = function(oEvent){
		var oControl = Element.getElementById("C14-L1");
		var oLayoutData = oControl.getLayoutData();
		if (oLayoutData){
			oLayoutData.setCellsSmall(4);
			oLayoutData.setCellsLarge(2);
		}
		oControl = Element.getElementById("C14-I2");
		oLayoutData = oControl.getLayoutData();
		if (oLayoutData){
			oLayoutData.setCellsSmall(4);
			oLayoutData.setCellsLarge(2);
		}
	};

	var specialColumns = function(oEvent){
		if (oEvent.getParameter("pressed")){
			oLayout1.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
			oLayout2.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
			oLayout3.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
			oLayout4.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
			oLayout5.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		} else {
			oLayout1.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
			oLayout2.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
			oLayout3.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
			oLayout4.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
			oLayout5.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
		}
	};

	var moveContainer = function(oEvent){
		var oContainer = Element.getElementById("C12");
		oForm5.removeFormContainer(oContainer);
		if (oEvent.getParameter("pressed")){
			oForm5.insertFormContainer(oContainer, 0);
		} else {
			oForm5.insertFormContainer(oContainer, 1);
		}
	};

	var newContainer = function(oEvent){
		if (oEvent.getParameter("pressed")){
			oForm5.addFormContainer(oNewContainer);
		} else {
			oForm5.removeFormContainer(oNewContainer);
		}
	};

	var visibilityContainer = function(oEvent){
		var oContainer = Element.getElementById("C13");
		if (oEvent.getParameter("pressed")){
			oContainer.setVisible(false);
		} else {
			oContainer.setVisible(true);
		}
	};

	var toggleLabelSize = function(oEvent){
		if (oEvent.getParameter("pressed")){
			oLayout1.setLabelCellsLarge(2);
			oLayout2.setLabelCellsLarge(2);
			oLayout3.setLabelCellsLarge(2);
			oLayout4.setLabelCellsLarge(2);
			oLayout5.setLabelCellsLarge(2);
		} else {
			oLayout1.resetProperty("labelCellsLarge");
			oLayout2.resetProperty("labelCellsLarge");
			oLayout3.resetProperty("labelCellsLarge");
			oLayout4.resetProperty("labelCellsLarge");
			oLayout5.resetProperty("labelCellsLarge");
		}
	};

	var toggleEmptyCells = function(oEvent){
		if (oEvent.getParameter("pressed")){
			oLayout1.setEmptyCellsLarge(2);
			oLayout2.setEmptyCellsLarge(2);
			oLayout3.setEmptyCellsLarge(2);
			oLayout4.setEmptyCellsLarge(2);
			oLayout5.setEmptyCellsLarge(2);
		} else {
			oLayout1.resetProperty("emptyCellsLarge");
			oLayout2.resetProperty("emptyCellsLarge");
			oLayout3.resetProperty("emptyCellsLarge");
			oLayout4.resetProperty("emptyCellsLarge");
			oLayout5.resetProperty("emptyCellsLarge");
		}
	};

	var toggleContainerData = function(oEvent){
		var oContainer1 = Element.getElementById("C1");
		var oContainer3 = Element.getElementById("C3");
		var oContainer4 = Element.getElementById("C4");
		var oContainer9 = Element.getElementById("C9");
		var oContainer11 = Element.getElementById("C11");
		if (oEvent.getParameter("pressed")){
			oContainer1.destroyLayoutData();
			oContainer3.destroyLayoutData();
			oContainer4.destroyLayoutData();
			oContainer9.destroyLayoutData();
			oContainer11.destroyLayoutData();
		} else {
			oContainer1.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 1, columnsXL: 1}));
			oContainer3.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 1, columnsXL: 1}));
			oContainer4.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 2, columnsXL: 2}));
			oContainer9.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 2, columnsXL: 2}));
			oContainer11.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 2, columnsXL: 2}));
		}
	};

	var toggleXLColumns = function(oEvent) {
		var oLayout = Element.getElementById("L5");
		var oItem = oEvent.getParameter("item");
		var iColumns = parseInt(oItem.getKey());
		oLayout.setColumnsXL(iColumns);
	};

	var toggleLayoutData2 = function(oEvent){
		var oLayoutData;
		var oContainer = Element.getElementById("C3");
		var aElements = oContainer.getFormElements();
		var aFields;
		if (oEvent.getParameter("pressed")){
			aFields = aElements[0].getFields();
			oLayoutData = new ColumnElementData({cellsSmall: 2, cellsLarge: 2});
			aFields[0].setLayoutData(oLayoutData);
			aFields[0].setValueState("Warning");
			aFields = aElements[1].getFields();
			oLayoutData = new ColumnElementData({cellsSmall: 12, cellsLarge: 8});
			aFields[1].setLayoutData(oLayoutData);
			aFields[1].setValueState("Warning");
			aFields = aElements[2].getFields();
			oLayoutData = new ColumnElementData({cellsSmall: 12, cellsLarge: 12});
			aFields[2].setLayoutData(oLayoutData);
			aFields[2].setValueState("Warning");
			aFields = aElements[3].getFields();
			oLayoutData = new ColumnElementData({cellsSmall: 3, cellsLarge: 3});
			aFields[3].setLayoutData(oLayoutData);
			aFields[3].setValueState("Warning");
		} else {
			aFields = aElements[0].getFields();
			aFields[0].destroyLayoutData();
			aFields[0].setValueState("None");
			aFields = aElements[1].getFields();
			aFields[1].destroyLayoutData();
			aFields[1].setValueState("None");
			aFields = aElements[2].getFields();
			aFields[2].destroyLayoutData();
			aFields[2].setValueState("None");
			aFields = aElements[3].getFields();
			aFields[3].destroyLayoutData();
			aFields[3].setValueState("None");
		}
	};

	var oLayout1 = new ColumnLayout("L1");
	var oForm1 = new Form("F1",{
		title: "One Container",
		editable: true,
		layout: oLayout1,
		formContainers: [
			new FormContainer("C1",{
				title: "contact data",
				formElements: [
					new FormElement("C1E1", {
						label: new Label("C1E1-Label", {text:"Name"}),
						fields: [new Input("C1E1-Field1", {value: "Mustermann", required: true})]
					}),
					new FormElement("C1E2", {
						label: new Label("C1E2-Label", {text:"First Name"}),
						fields: [new Input("C1E2-Field1", {value: "Max", required: true})]
					}),
					new SemanticFormElement("C1E3", {
						label: "Street / Number",
						fields: [new Input("C1E3-Field1", {value: "Musterstraße"}),
								 new Input("C1E3-Field2", {value: "1", layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]
					}),
					new SemanticFormElement("C1E4", {
						label: new Label("C1E4-Label", {text: "Post code / City"}),
						fields: [new Input("C1E4-Field1", {value: "12345", layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
								 new Input("C1E4-Field2", {value: "Musterstadt"})]
					}),
					new FormElement("C1E5", {
						label: "Country",
						fields: [new Select("C1E5-Field1", {selectedKey: "DE",
							items: [new ListItem("C1E5-Field1-Item1", {key: "GB", text: "England"}),
									new ListItem("C1E5-Field1-Item2", {key: "US", text: "USA"}),
									new ListItem("C1E5-Field1-Item3", {key: "DE", text: "Germany"})]
						})]
					}),
					new FormElement("C1E6", {
						label: "Date of birth",
						fields: [new DatePicker("C1E6-Field1", {dateValue: new Date(2018, 0, 10), layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 3})})]
					}),
					new FormElement("C1E7", {
						label: "Gender",
						fields: [new RadioButtonGroup("C1E7-Field1", {
							buttons: [new RadioButton("C1E7-Field1-RB1", {text: "male"}),
							          new RadioButton("C1E7-Field1-RB2", {text: "female"})]
						})]
					})
				]
			})
		]
	});
	oForm1.placeAt("content1");

	var oLayout2 = new ColumnLayout("L2");
	var oForm2 = new Form("F2",{
		title: "Two Containers",
		editable: true,
		layout: oLayout2,
		formContainers: [
			new FormContainer("C2",{
				title: "Container 1",
				formElements: [
					new FormElement("C2E1", {
						label: new Label("C2E1-Label", {text: "Text Area"}),
						fields: [new TextArea("C2E1-Field1", {rows: 3})]
					}),
					new FormElement("C2E2", {
						label: "Label 2",
						fields: [new Link("C2E2-Field1", {text: "Link", href: "http://www.sap.com"}),
								 new Input("C2E2-Field2")]
					}),
					new FormElement("C2E3", {
						label: "Label 3",
						fields: [new Input("C2E3-Field1"),
								 new Input("C2E3-Field2")]
					})
				]
			}),
			new FormContainer("C3",{
				toolbar: new Toolbar("C3-TB", {
					content: [new mTitle("C3-Title", {text: "Container 2", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H6, tooltip: "Title tooltip"}),
					          new ToolbarSpacer("C3-TB-Spacer"),
					          new ToggleButton("C3-TB-ToggleLayoutData", {text: "LayoutData", press: toggleLayoutData2})
					          ]
				}),
				ariaLabelledBy: "C3-Title",
				formElements: [
					new FormElement("C3E1",{
						label: new Label("C3E1-Label", {text:"Label 1"}),
						fields: [new Input("C3E1-Field1", {value: "1", type: MLib.InputType.Number}),
						         new Input("C3E1-Field2", {value: "2", type: MLib.InputType.Number}),
						         new Input("C3E1-Field3", {value: "3", type: MLib.InputType.Number})]
					}),
					new FormElement("C3E2",{
						label: "Label 2",
						fields: [new Input("C3E2-Field1", {value: "1", type: MLib.InputType.Number}),
						         new Input("C3E2-Field2", {value: "2", type: MLib.InputType.Number}),
						         new Input("C3E2-Field3", {value: "3", type: MLib.InputType.Number}),
						         new Input("C3E2-Field4", {value: "4", type: MLib.InputType.Number})]
					}),
					new FormElement("C3E3",{
						label: new Label("C3E3-Label", {text: "Label 3"}),
						fields: [new Input("C3E3-Field1", {value: "1", type: MLib.InputType.Number}),
						         new Input("C3E3-Field2", {value: "2", type: MLib.InputType.Number}),
						         new Input("C3E3-Field3", {value: "3", type: MLib.InputType.Number}),
						         new Input("C3E3-Field4", {value: "4", type: MLib.InputType.Number}),
						         new Input("C3E3-Field5", {value: "5", type: MLib.InputType.Number}),
						         new Input("C3E3-Field6", {value: "6", type: MLib.InputType.Number}),
						         new Input("C3E3-Field7", {value: "7", type: MLib.InputType.Number}),
						         new Input("C3E3-Field8", {value: "8", type: MLib.InputType.Number}),
						         new Input("C3E3-Field9", {value: "9", type: MLib.InputType.Number}),
						         new Input("C3E3-Field10", {value: "10", type: MLib.InputType.Number})]
					}),
					new FormElement("C3E4",{
						label: "Label 4",
						fields: [new Input("C3E4-Field1", {value: "1", type: MLib.InputType.Number}),
								 new Input("C3E4-Field2", {value: "2", type: MLib.InputType.Number}),
						         new Input("C3E4-Field3", {value: "3", type: MLib.InputType.Number}),
						         new Input("C3E4-Field4", {value: "4", type: MLib.InputType.Number}),
						         new Input("C3E4-Field5", {value: "5", type: MLib.InputType.Number}),
						         new Input("C3E4-Field6", {value: "6", type: MLib.InputType.Number}),
						         new Input("C3E4-Field7", {value: "7", type: MLib.InputType.Number}),
						         new Input("C3E4-Field8", {value: "8", type: MLib.InputType.Number}),
						         new Input("C3E4-Field9", {value: "9", type: MLib.InputType.Number}),
						         new Input("C3E4-Field10", {value: "10", type: MLib.InputType.Number}),
						         new Input("C3E4-Field11", {value: "11", type: MLib.InputType.Number}),
						         new Input("C3E4-Field12", {value: "12", type: MLib.InputType.Number}),
								 new Input("C3E4-Field13", {value: "13", type: MLib.InputType.Number}),
								 new Input("C3E4-Field14", {value: "14", type: MLib.InputType.Number}),
								 new Input("C3E4-Field15", {value: "15", type: MLib.InputType.Number})]
					})
				]
			})
		]
	});
	oForm2.placeAt("content2");

	var oLayout3 = new ColumnLayout("L3");
	var oForm3 = new Form("F3",{
		title: "Three Containers",
		editable: true,
		layout: oLayout3,
		formContainers: [
			new FormContainer("C4",{
				title: "Container 1",
				formElements: [
					new FormElement("C4E1", {
						label: "Label 1",
						fields: [new Input("C4E1-Field1", {required: true})]
					}),
					new FormElement("C4E2", {
						label: "Label 2",
						fields: [new Input("C4E2-Field1")]
					}),
					new FormElement("C4E3", {
						label: "Label 3",
						fields: [new Input("C4E3-Field1")]
					}),
					new FormElement("C4E4", {
						label: "Label 4",
						fields: [new Input("C4E4-Field1")]
					}),
					new FormElement("C4E5", {
						label: "Text Area",
						fields: [new TextArea("C4E5-Field1", {required: true})]
					}),
					new FormElement("C4E6", {
						label: "Image",
						fields: [new Image("C4E6-Field1", {src: sap.ui.require.toUrl("sap/ui/core/mimes/logo/sap_73x36.gif"), width: "73px", densityAware: false})]
					})
				]
			}),
			new FormContainer("C5",{
				toolbar: new Toolbar("C5-TB", {
					content: [new mTitle("C5-Title", {text: "Container 2", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H6, tooltip: "Title tooltip"}),
					          new ToolbarSpacer("C5-TB-Spacer"),
					          new ToggleButton("C5-TB-Toggle", {icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
					          ]
				}),
				formElements: [
					new FormElement("C5E1", {
						label: "Label 1",
						fields: [new Input("C5E1-Field1", {required: true})]
					}),
					new FormElement("C5E2", {
						label: "Label 2",
						fields: [new Input("C5E2-Field1")]
					}),
					new FormElement("C5E3", {
						label: "Label 3",
						fields: [new Input("C5E3-Field1")]
					}),
					new FormElement("C5E4", {
						label: "Label 4",
						fields: [new Input("C5E4-Field1")]
					}),
					new FormElement("C5E5", {
						label: "Label 5",
						fields: [new Select("Sel_C5",{selectedKey: "DE",
							items: [new ListItem("Sel_C5-Item1",{key: "GB", text: "England"}),
									new ListItem("Sel_C5-Item2",{key: "US", text: "USA"}),
									new ListItem("Sel_C5-Item3",{key: "DE", text: "Germany"})]
						})]
					})
				]
			}),
			new FormContainer("C6",{
				title: "Container 3",
				tooltip: "This container is expandable",
				expandable: true,
				formElements: [
					new FormElement("C6E1",{
						fields: [new CheckBox("C6E1-Field1",{text: 'Kindergarden'}),
								new CheckBox("C6E1-Field2",{text: 'primary school'})]
					}),
					new FormElement("C6E2",{
						fields: [new CheckBox("C6E2-Field1",{text: 'high school'})]
					}),
					new FormElement("C6E3",{
						fields: [new CheckBox("C6E3-Field1",{text: 'college'})]
					}),
					new FormElement("C6E4",{
						fields: [new CheckBox("C6E4-Field1",{text: 'university'})]
					})
				]
			})
		]
	});
	oForm3.placeAt("content3");

	var oLayout4 = new ColumnLayout("L4");
	var oForm4 = new Form("F4",{
		title: "Four Containers",
		editable: false,
		layout: oLayout4,
		formContainers: [
			new FormContainer("C7",{
				title: "Container 1",
				formElements: [
					new FormElement("C7E1",{
						label: "Label 1",
						fields: [new Text("C7E1-Field1",{text: "Text 1"})]
					}),
					new FormElement("C7E2",{
						label: "Label 2",
						fields: [new Text("C7E2-Field1",{text: "Text 2"})]
					}),
					new FormElement("C7E3",{
						label: "Label 3",
						fields: [new Text("C7E3-Field1",{text: "Text 3"})]
					}),
					new FormElement("C7E4",{
						label: "Label 4",
						fields: [new Text("C7E4-Field1",{text: "Text 4"})]
					})
				]
			}),
			new FormContainer("C8",{
				title: "Container 2",
				formElements: [
					new SemanticFormElement("C8E1",{
						label: "Label 1",
						fields: [new Text("C8E1-Field1",{text: "Text 1"})]
					}),
					new SemanticFormElement("C8E2",{
						label: "Label 2",
						fields: [new Text("C8E2-Field1",{text: "Text 2"}), new Text("C8E2-Field2",{text: "Text 2a"})]
					}),
					new SemanticFormElement("C8E3",{
						label: "Label 3",
						fields: [new Text("C8E3-Field1",{text: "Text 3"}), new Text("C8E3-Field2",{text: "Text 3a"}), new Text("C8E3-Field3",{text: "Text 3b"})]
					}),
					new SemanticFormElement("C8E4",{
						label: "Label 4",
						fields: [new Text("C8E4-Field1",{text: "Text 4"}), new Text("C8E4-Field2",{text: "Text 4a"}), new Text("C8E4-Field3",{text: "Text 4b"}),
								 new Text("C8E4-Field4",{text: "Text 4c"}), new Text("C8E4-Field5",{text: "Text 4d"}), new Text("C8E4-Field6",{text: "Text 4e"}),
								 new Text("C8E4-Field7",{text: "Text 4f"}), new Text("C8E4-Field8",{text: "Text 4g"}), new Text("C8E4-Field9",{text: "Text 4h"}),
								 new Text("C8E4-Field10",{text: "Text 4i"}), new Text("C8E4-Field11",{text: "Text 4j"}), new Text("C8E4-Field12",{text: "Text 4k"})
								]
					})
				]
			}),
			new FormContainer("C9",{
				toolbar: new Toolbar("C9-TB", {
					content: [new mTitle("C9-Title", {text: "Container 3", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H6, tooltip: "Title tooltip"}),
					          new ToolbarSpacer("C9-TB-Spacer"),
					          new ToggleButton("C9-TB-Toggle",{icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
					          ]
				}),
				formElements: [
					new FormElement("C9E1",{
						label: "Label 1",
						fields: [new Text("C9E1-Field1",{text: "Text 1"}), new Text("C9E1-Field2",{text: "another Text 1"})]
					}),
					new FormElement("C9E2",{
						label: "Label 2",
						fields: [new Text("C9E2-Field1",{text: "Text 2"}), new Text("C9E2-Field2",{text: "another Text 2"})]
					}),
					new FormElement("C9E3",{
						label: "Label 3",
						fields: [new Text("C9E3-Field1",{text: "Text 3"}), new Text("C9E3-Field2",{text: "another Text 3"})]
					}),
					new FormElement("C9E4",{
						label: "Label 4",
						fields: [new Text("C9E4-Field1",{text: "Text 4"}), new Text("C9E4-Field2",{text: "another Text 4"})]
					})
				]
			}),
			new FormContainer("C10",{
				title: "Container 4",
				expandable: true,
				formElements: [
					new FormElement("C10E1",{
						label: "Label 1",
						fields: [new Text("C10E1-Field1",{text: "Text 1"})]
					}),
					new FormElement("C10E2",{
						label: "Label 2",
						fields: [new Text("C10E2-Field1",{text: "Text 2"}), new Text("C10E2-Field2",{text: "Text 2a"})]
					}),
					new FormElement("C10E3",{
						label: "Label 3",
						fields: [new Text("C10E3-Field1",{text: "Text 3"}), new Text("C10E3-Field2",{text: "Text 3a"}), new Text("C10E3-Field3",{text: "Text 3b"})]
					}),
					new FormElement("C10E4",{
						label: "Label 4",
						fields: [new Text("C10E4-Field1",{text: "Text 4"}), new Text("C10E4-Field2",{text: "Text 4a"}), new Text("C10E4-Field3",{text: "Text 4b"}),
								 new Text("C10E4-Field4",{text: "Text 4c"}), new Text("C10E4-Field5",{text: "Text 4d"}), new Text("C10E4-Field6",{text: "Text 4e"}),
								 new Text("C10E4-Field7",{text: "Text 4f"}), new Text("C10E4-Field8",{text: "Text 4g"}), new Text("C10E4-Field9",{text: "Text 4h"}),
								 new Text("C10E4-Field10",{text: "Text 4i"}), new Text("C10E4-Field11",{text: "Text 4j"}), new Text("C10E4-Field12",{text: "Text 4k"})
								]
					})
				]
			})
		]
	});
	oForm4.placeAt("content4");

	var oLayout5 = new ColumnLayout("L5");
	var oForm5 = new Form("F5",{
		title: "Five Containers",
		editable: true,
		layout: oLayout5,
		formContainers: [
			new FormContainer("C11",{
				title: "Container 1",
				formElements: [
					new FormElement("C11E1",{
						label: "Label 1",
						fields: [new Input("C11E1-Field1",{value: "Container 1", required: true})]
					}),
					new FormElement("C11E2",{
						label: "Label 2",
						fields: [new Input("C11E2-Field1",{value: "Container 1"})]
					}),
					new FormElement("C11E3",{
						label: "Label 3",
						fields: [new Input("C11E3-Field1",{value: "Container 1"})]
					}),
					new FormElement("C11E4",{
						label: "Label 4",
						fields: [new Input("C11E4-Field1",{value: "Container 1"})]
					})
				]
			}),
			new FormContainer("C12",{
				title: "Container 2",
				formElements: [
					new FormElement("C12E1",{
						label: "Label 1",
						fields: [new Input("C12E1-Field1",{value: "Container 2", valueState: "Warning", required: true})]
					}),
					new FormElement("C12E2",{
						label: "Label 2",
						fields: [new Input("C12E2-Field1",{value: "Container 2", valueState: "Warning"})]
					}),
					new FormElement("C12E3",{
						label: "Label 3",
						fields: [new Input("C12E3-Field1",{value: "Container 2", valueState: "Warning"})]
					}),
					new FormElement("C12E4",{
						label: "Label 4",
						fields: [new Input("C12E4-Field1",{value: "Container 2", valueState: "Warning"})]
					})
				]
			}),
			new FormContainer("C13",{
				title: "Container 3",
				formElements: [
					new FormElement("C13E1",{
						label: "Label 1",
						fields: [new Input("C13E1-Field1",{value: "Container 3", valueState: "Error", required: true})]
					}),
					new FormElement("C13E2",{
						label: "Label 2",
						fields: [new Input("C13E2-Field1",{value: "Container 3", valueState: "Error"})]
					}),
					new FormElement("C13E3",{
						label: "Label 3",
						fields: [new Input("C13E3-Field1",{value: "Container 3", valueState: "Error"})]
					}),
					new FormElement("C13E4",{
						label: "Label 4",
						fields: [new Input("C13E4-Field1",{value: "Container 3", valueState: "Error"})]
					})
				]
			}),
			new FormContainer("C14",{
				title: "Container 4",
				formElements: [
					new FormElement("C14E1",{
						label: new Label("C14E1-Label", {text:"Label 1"}),
						fields: [new Input("C14E1-Field1", {value: "Container 4", valueState: "Success", required: true})]
					}),
					new FormElement("C14E2",{
						label: new Label("C14E2-Label", {text:"Label 2"}),
						fields: [new Input("C14E2-Field1", {value: "Container 4", valueState: "Success"})]
					}),
					new FormElement("C14E3",{
						label: new Label("C14E3-Label", {text:"Label 3"}),
						fields: [new Input("C14E3-Field1", {value: "Container 4", valueState: "Success"})]
					}),
					new FormElement("C14E4",{
						label: new Label("C14E4-Label", {text:"Label 4"}),
						fields: [new Input("C14E4-Field1", {value: "Container 4", valueState: "Success"})]
					})
				]
			}),
			new FormContainer("C15",{
				formElements: [
					new FormElement("C15E1",{
						fields: [new ToggleButton("C15E1-Field1",{text: 'Field LayoutData',
																press: toggleLayoutData,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new Button("C15E1-Field2", {text: 'Change LayoutData',
																press: changeLayoutData,
																enabled: false,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new ToggleButton("C15E1-Field3",{text: "special columns",
																press: specialColumns,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new ToggleButton("C15E1-Field4",{text: "move Container",
																press: moveContainer,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new ToggleButton("C15E1-Field5",{text: "visibility Container",
																press: visibilityContainer,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new ToggleButton("C15E1-Field6",{text: "new Container",
																press: newContainer,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new ToggleButton("C15E1-Field7",{text: "Label size",
																press: toggleLabelSize,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new ToggleButton("C15E1-Field8",{text: "emty cells",
																press: toggleEmptyCells,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new ToggleButton("C15E1-Field9",{text: "Default container size",
																pressed: true,
																press: toggleContainerData,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})}),
								new SegmentedButton("C15E1-Field10",{
																width: "100%",
																selectedKey: "2",
																tooltip: "XL columns",
																items: [
																	new SegmentedButtonItem("C15E1-Field10-Item1",{key: "2", text: "2"}),
																	new SegmentedButtonItem("C15E1-Field10-Item2",{key: "4", text: "4"}),
																	new SegmentedButtonItem("C15E1-Field10-Item3",{key: "6", text: "6"})
																],
																selectionChange: toggleXLColumns,
																layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 4})})]
						}),
					new FormElement("C15E2",{
						fields: [new Button("C15E2-Field1",{text: 'OK', type: MLib.ButtonType.Accept}),
								 new Button("C15E2-Field2",{text: 'Cancel', type: MLib.ButtonType.Reject})]
					})
				]
			})
		]
	});
	oForm5.placeAt("content5");

	var oTitle = new Title("TitleX",{text: "new Container", level: CoreLib.TitleLevel.H2});
	var oNewContainer = new FormContainer("CX",{
			title: oTitle,
			formElements: [
					new FormElement("CXE1",{
						label: new Label("CXE1-Label", {text:"Label1"}),
						fields: [new Input("CXE1-Field1", {value: "Text1", required: true}),
						         new Input("CXE1-Field2", {value: "Text2"}),
						         new Input("CXE1-Field3", {value: "Text3"})]
					})
			]
	});

	var oLayout6 = new ColumnLayout("L6", {columnsM: 2});
	var oForm6 = new Form("F6",{
		toolbar: new Toolbar("F6-TB", {
			content: [
				new mTitle("F6-Title", {text: "column test", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H6, tooltip: "Title tooltip"}),
				new ToolbarSpacer("F6-TB-Spacer"),
				new SegmentedButton("F6-TB-SwitchLayout", {
					width: "auto",
					selectedKey: "C2",
					items: [
						new SegmentedButtonItem("F6-TB-SwitchLayout-Item1", {key: "C1", text: "1 1 1 1"}),
						new SegmentedButtonItem("F6-TB-SwitchLayout-Item2", {key: "C2", text: "1 2 2 2"}),
						new SegmentedButtonItem("F6-TB-SwitchLayout-Item3", {key: "C3", text: "1 2 3 3"}),
						new SegmentedButtonItem("F6-TB-SwitchLayout-Item4", {key: "C4", text: "1 2 3 4"}),
						new SegmentedButtonItem("F6-TB-SwitchLayout-Item5", {key: "C5", text: "1 3 4 6"})
					],
					selectionChange: function(oEvent) {
						var oItem = oEvent.getParameter("item");
						switch (oItem.getKey()) {
						case "C1":
							oLayout6.setColumnsM(1).setColumnsL(1).setColumnsXL(1);
							break;
						case "C2":
							oLayout6.setColumnsM(2).setColumnsL(2).setColumnsXL(2);
							break;
						case "C3":
							oLayout6.setColumnsM(2).setColumnsL(3).setColumnsXL(3);
							break;
						case "C4":
							oLayout6.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
							break;
						case "C5":
							oLayout6.setColumnsM(3).setColumnsL(4).setColumnsXL(6);
							break;
						default:
							break;
						}
					}
				}),
				new Button("F6-TB-AddField",{text: "add field",
					press: function(oEvent) {
						var oFormContainer = Element.getElementById("C16");
						var iElements = oFormContainer.getFormElements().length +  1;
						var oFormElement = new FormElement("C16E" + iElements, {
							label: "Label" + iElements,
							fields: [new Input("C16E" + iElements + "-Field1", {value: iElements})]
						});
						oFormContainer.addFormElement(oFormElement);
					}})
			]
		}),
		ariaLabelledBy: "F6-Title",
		editable: true,
		layout: oLayout6,
		formContainers: [
			new FormContainer("C16",{
				formElements: [
					new FormElement("C16E1",{
						label: new Label("C16E1-Label", {text: "Label 1"}),
						fields: [new Input("C16E1-Field1", {value: "1"})]
					})
					]
			})
		]
	});
	oForm6.placeAt("content6");

});