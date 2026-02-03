// Note: the HTML page 'TreeTable.html' loads this module via data-sap-ui-on-init

/*global TABLESETTINGS */
sap.ui.define([
	"sap/ui/table/library",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/ProgressIndicator",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log"
], function(library, TreeTable, Column, Button, CheckBox, ProgressIndicator, Text, Title, TableUtils, JSONModel, Log) {
	const SelectionMode = library.SelectionMode;

	new Button({
		text: "Just a Button before"
	}).placeAt("content");

	const oTable = new TreeTable({
		footer: "Footer of the Table",
		groupHeaderProperty: "name",
		selectionMode: SelectionMode.MultiToggle,
		extension: [
			new Title({
				text: "Title of the TreeTable"
			})
		],
		columns: [
			new Column(
					{label: "Name", template: new Text({text: "{name}", wrapping: false}), filterProperty: "name", sortProperty: "name"}),
			new Column({label: "Description", template: "description", sortProperty: "description"}),
			new Column({label: "Available", template: new CheckBox({selected: "{checked}"})}),
			new Column({label: "ProgressIndicator", template: new ProgressIndicator({
				displayValue: "50",
				percentValue: "10",
				showaValue: true,
				width: "100%"
			})})
		]
	});

	oTable.attachToggleOpenState(function(oEvent) {
		Log.info("ToggleOpenState: rowIndex: " + oEvent.getParameter("rowIndex") +
							" - rowContext: " + oEvent.getParameter("rowContext") +
							" - expanded? " + oEvent.getParameter("expanded"));
	});

	oTable.attachRowSelectionChange(function(oEvent) {
		Log.info("RowSelectionChange: rowIndex: " + oEvent.getParameter("rowIndex") +
							" - rowContext: " + oEvent.getParameter("rowContext"));
	});

	// set Model and bind Table
	const oModel = new JSONModel();
	oModel.setData(TABLESETTINGS.treeTestData);
	oTable.setModel(oModel);
	oTable.bindRows({
		path: "/root",
		parameters: {
			numberOfExpandedLevels: 1
		}
	});


	oTable.placeAt("content");
	new Button({text: "Just a Button after"}).placeAt("content");

	TABLESETTINGS.init(oTable, function(oButton) {
		null.addContent(oButton);
	}, {
		FLATMODE: {
			text: "Flat Mode (protected)",
			value: function(oTable) {
				return TableUtils.Grouping.isInFlatMode(oTable);
			},
			input: "boolean",
			action: function(oTable, bValue) {
				oTable.setUseFlatMode(!!bValue);
			}
		}
	});
});