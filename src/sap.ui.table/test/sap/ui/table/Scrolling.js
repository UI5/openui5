// Note: the HTML page 'Scrolling.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Auto",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/ComboBox",
	"sap/m/DatePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/MultiComboBox",
	"sap/m/ObjectStatus",
	"sap/m/OverflowToolbar",
	"sap/m/Select",
	"sap/m/Slider",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/ToolbarSeparator",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/Icon",
	"sap/ui/core/Item",
	"sap/ui/model/Context",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Integer",
	"test-resources/sap/ui/table/Settings",
	"sap/ui/core/library"
], function(
	Table,
	Column,
	AutoRowMode,
	Button,
	CheckBox,
	ComboBox,
	DatePicker,
	Input,
	Label,
	Link,
	MultiComboBox,
	ObjectStatus,
	OverflowToolbar,
	Select,
	Slider,
	Text,
	Title,
	SegmentedButton,
	SegmentedButtonItem,
	ToolbarSeparator,
	Control,
	Core,
	Icon,
	Item,
	Context,
	JSONModel,
	BooleanType,
	IntegerType,
	TableSettings,
	library
) {
	"use strict";

	// shortcut for sap.ui.core.HorizontalAlign
	const HorizontalAlign = library.HorizontalAlign;

	const oTable = new Table({
		firstVisibleRow: 770000,
		selectionMode: "MultiToggle",
		extension: [
			new OverflowToolbar({
				content: [
					new Title({text: "Table with large data"}),
					new ToolbarSeparator(),
					new Label({
						id: "row-count-label",
						text: "Row Count"
					}),
					new Input({
						ariaLabelledBy: "row-count-label",
						width: "125px",
						value: {
							path: "config>/rowCount",
							type: new IntegerType()
						}
					}),
					new Label({
						id: "scroll-granularity-label",
						text: "Scroll Granularity"
					}),
					new Select({
						ariaLabelledBy: "scroll-granularity-label",
						width: "150px",
						items: [
							new Item({key: "Row", text: "Row"}),
							new Item({key: "Pixel", text: "Pixel"})
						],
						selectedKey: {
							path: "config>/scrollGranularity"
						}
					}),
					new ToolbarSeparator()
				]
			}),
			new OverflowToolbar({
				enabled: false, // variable row heights not testable with the current setup
				content: [
					new Text({text: "Row Height Configuration: (not testable because not correctly set up in this test page)" }),
					new Label({
						id: "row-height-label",
						text: "Max Row Height (actual height randomized)"
					}),
					new Slider({
						ariaLabelledBy: "row-height-label",
						width: "200px",
						value: 0,
						min: 0,
						max: 250,
						liveChange: function() {
							configureRowHeights(this.getValue());
						}
					}),
					new Text({
						text: {
							path: "config>/rowHeight",
							formatter: function(sRowHeight) {
								return "(" + sRowHeight + ")";
							}
						}
					}),
					new CheckBox({
						text: "Alternating",
						selected: {
							path: "config>/alternatingRowHeights",
							type: new BooleanType()
						},
						select: function() {
							configureRowHeights();
						}
					})
				]
			}),
			new OverflowToolbar({
				content: [
					new Text({text: "Automated Scrolling:" }),
					new SegmentedButton({
						items: [
							new SegmentedButtonItem({key: "off", text: "Off"}),
							new SegmentedButtonItem({key: "scrollbar_down", text: "Scrollbar Down"}),
							new SegmentedButtonItem({key: "scrollbar_up", text: "Scrollbar Up"})
						],
						selectionChange: function(oEvent) {
							const sKey = oEvent.getParameter("item").getKey();

							clearInterval(window.iScrollAutomationIntervalId);
							delete window.iScrollAutomationIntervalId;

							if (sKey === "scrollbar_down") {
								window.iScrollAutomationIntervalId = setInterval(function() {
									const oVsb = oTable._getScrollExtension().getVerticalScrollbar();
									if (oVsb) {
										oVsb.scrollTop += oConfigModel.getProperty("/automatedScrolling/delta");
									}
								}, oConfigModel.getProperty("/automatedScrolling/interval"));
							} else if (sKey === "scrollbar_up") {
								window.iScrollAutomationIntervalId = setInterval(function() {
									const oVsb = oTable._getScrollExtension().getVerticalScrollbar();
									if (oVsb) {
										oVsb.scrollTop -= oConfigModel.getProperty("/automatedScrolling/delta");
									}
								}, oConfigModel.getProperty("/automatedScrolling/interval"));
							}
						}
					}),
					new Label({
						id: "scroll-speed-label",
						text: "Speed"
					}),
					new Slider({
						ariaLabelledBy: "scroll-speed-label",
						width: "200px",
						value: "{config>/automatedScrolling/delta}",
						min: 1,
						max: 50,
						liveChange: function() {
							oConfigModel.setProperty("/automatedScrolling/delta", this.getValue());
						}
					}),
					new Text({text: "{config>/automatedScrolling/delta}pixel / {config>/automatedScrolling/interval}ms"})
				]
			})
		],
		footer: new Text({text: "Footer of the Table"}),
	});
	window.oTable = oTable;

	function configureRowHeights(iHeight) {
		const aData = oRowModel.getProperty("/custom");
		const bAlternatingRowHeights = oConfigModel.getProperty("/alternatingRowHeights");

		if (iHeight == null) {
			const sHeight = oConfigModel.getProperty("/rowHeight");
			iHeight = sHeight === "auto" ? 0 : parseInt(sHeight);
		}

		aData.forEach(function(oData) {
			if (iHeight > 0) {
				oData.height = (bAlternatingRowHeights ? iHeight : iHeight * Math.random()) + "px";
			} else {
				oData.height = "auto";
			}
		});

		oConfigModel.setProperty("/rowHeight", iHeight === 0 ? "auto" : iHeight + "px");
		oRowModel.setProperty("/custom/", aData);
		oTable.getBinding().refresh(true);
	}

	const VariableRowHeightControl = Control.extend("sap.ui.table.test.VariableRowHeightControl", {
		metadata: {
			properties: {
				height: {type: "string", defaultValue: "auto"},
				text: {type: "string", defaultValue: ""}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				const sText = oControl.getText();

				oRm.openStart("div", oControl);
				oRm.style("height", oControl.getHeight());
				oRm.style("position", "relative");
				oRm.style("display", "flex");
				oRm.style("align-items", "center");
				oRm.openEnd();

				oRm.openStart("span");
				oRm.style("position", "absolute");
				oRm.style("top", "0");
				oRm.openEnd();
				oRm.text(sText);
				oRm.close("span");

				oRm.openStart("span");
				oRm.style("z-index", "1");
				oRm.style("background-color", "white");
				oRm.openEnd();
				oRm.text(sText);
				oRm.close("span");

				oRm.openStart("span");
				oRm.style("position", "absolute");
				oRm.style("bottom", "0");
				oRm.openEnd();
				oRm.text(sText);
				oRm.close("span");

				oRm.close("div");
			}
		}
	});

	// Columns
	oTable.addColumn(new Column({
		label: new Label({text: "VariableRowHeightControl"}),
		template: new VariableRowHeightControl({
			height: "{height}",
			text: {
				path: "config>/firstRowIndex",
				formatter: function(iFirstRowIndex) {
					return "Row #" + (this.getParent().getIndex() + 1);
				}
			}
		}),
		width: "150px"
	}));

	oTable.addColumn(new Column({
		label: new Label({text: "m.Text"}),
		template: new Text({text: "Einstein"}),
		width: "120px"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.Label"}),
		template: new Label({text: "Albert"}),
		width: "6em"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.ObjectStatus"}),
		template: new ObjectStatus({text: {
			path: "config>/firstRowIndex",
			formatter: function() {
				const iIndex = this.getParent().getIndex();

				if (iIndex % 3 === 0) {
					return "Good";
				} else if (iIndex % 3 === 1) {
					return "Critical";
				} else {
					return "Error";
				}
			}
		}, state: {
			path: "config>/firstRowIndex",
			formatter: function() {
				const iIndex = this.getParent().getIndex();

				if (iIndex % 3 === 0) {
					return "Success";
				} else if (iIndex % 3 === 1) {
					return "Warning";
				} else {
					return "Error";
				}
			}
		}}),
		width: "200px"
	}));
	oTable.addColumn(new Column({
		resizable: false,
		label: new Label({text: "core.Icon"}),
		template: new Icon({src: "sap-icon://account", decorative: false}),
		width: "80px",
		hAlign: HorizontalAlign.Center
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.Button"}),
		template: new Button({text: "Button"}),
		width: "100px"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.Input"}),
		template: new Input({value: "Theory of relativity"}),
		width: "200px"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.DatePicker"}),
		template: new DatePicker({dateValue: new Date("1879-03-14")}),
		width: "200px"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.Select"}),
		template: new Select({
			items: [
				new Item({key: "v1", text: "Value 1"}),
				new Item({key: "v2", text: "Value 2"}),
				new Item({key: "v3", text: "Value 3"}),
				new Item({key: "v4", text: "Value 4"})
			]
		}),
		width: "150px"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.ComboBox"}),
		template: new ComboBox({
			items: [
				new Item({key: "v1", text: "Value 1"}),
				new Item({key: "v2", text: "Value 2"}),
				new Item({key: "v3", text: "Value 3"}),
				new Item({key: "v4", text: "Value 4"})
			]
		}),
		width: "150px"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.MultiComboBox"}),
		template: new MultiComboBox({
			items: [
				new Item({key: "v1", text: "Value 1"}),
				new Item({key: "v2", text: "Value 2"}),
				new Item({key: "v3", text: "Value 3"}),
				new Item({key: "v4", text: "Value 4"})
			]
		}),
		width: "250px"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.Checkbox"}),
		template: new CheckBox({selected: true, text: "Genius"}),
		width: "50px"
	}));
	oTable.addColumn(new Column({
		label: new Label({text: "m.Link"}),
		template: new Link({href: "http://www.sap.com", text: "www.sap.com"}),
		width: "150px"
	}));

	const oRowModel = new JSONModel({
		"default": {
			height: "auto"
		},
		custom: [
			{height: "auto"},
			{height: "auto"},
			{height: "auto"},
			{height: "auto"},
			{height: "auto"},
			{height: "auto"},
			{height: "auto"},
			{height: "auto"},
			{height: "auto"},
			{height: "auto"}
		]
	});

	const oConfigModel = new JSONModel({
		scrollGranularity: "Pixel",
		automatedScrolling: {
			delta: 1,
			interval: 50
		},
		alternatingRowHeights: false,
		rowCount: 1000000000,
		firstRowIndex: 0,
		rowHeight: "auto"
	});
	oConfigModel.bindProperty("/rowCount").attachChange(function() {
		oTable.getBinding().refresh(true);
	});
	oConfigModel.bindProperty("/scrollGranularity").attachChange(function() {
		const sScrollGranularity = oConfigModel.getProperty("/scrollGranularity");

		if (sScrollGranularity === "Row") {
			oTable._bVariableRowHeightEnabled = false;
		} else {
			oTable._bVariableRowHeightEnabled = true;
		}

		oTable.invalidate();
	}).refresh(true);

	oTable.setModel(oRowModel);
	oTable.setModel(oConfigModel, "config");
	oTable.bindRows("/");
	oTable.getBinding().getLength = function() {
		return oConfigModel.getProperty("/rowCount");
	};
	oTable.getBinding().getContexts = function(iStartIndex, iLength) {
		const aContexts = [];
		const iBindingLength = this.getLength();
		const iCount = iStartIndex + iLength > iBindingLength ? iBindingLength - iStartIndex : iLength;
		const bAlternatingRowHeights = oConfigModel.getProperty("/alternatingRowHeights");

		for (let i = 0; i < iCount; i++) {
			const iIndex = iStartIndex + i;
			let sPath = "/default";

			if (bAlternatingRowHeights) {
				if (iIndex % 2 > 0) {
					sPath = "/custom/0";
				}
			} else if (iIndex % 10 > 0) {
				sPath = "/custom/" + (iIndex % 10);
			}

			aContexts.push(new Context(oRowModel, sPath));
		}

		const iOldFirstRowIndex = oConfigModel.getProperty("/firstRowIndex");
		const iNewFirstRowIndex = iStartIndex;

		if (iOldFirstRowIndex !== iNewFirstRowIndex) {
			oConfigModel.setProperty("/firstRowIndex", iNewFirstRowIndex, null, true);
		}

		return aContexts;
	};

	oTable.setRowMode(new AutoRowMode());
	oTable.placeAt("table");

	TableSettings.init(oTable, function(oButton) {
		oTable.getExtension()[0].addContent(oButton);
	});
});