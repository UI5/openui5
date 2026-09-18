// Note: the HTML page 'TableClientHierarchy.html' loads this module via data-sap-ui-on-init

/*global TABLESETTINGS */
sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/plugins/ClientHierarchy",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/ProgressIndicator",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/ui/model/json/JSONModel"
], function(
	Table,
	Column,
	ClientHierarchy,
	Button,
	CheckBox,
	ProgressIndicator,
	Text,
	Title,
	Toolbar,
	JSONModel
) {
	const oTable = new Table({
		extension: [
			new Toolbar({
				content: [
					new Title({id: "tableTitle", text: "Hierarchical Data"})
				]
			})
		],
		ariaLabelledBy: "tableTitle",
		dependents: [
			new ClientHierarchy()
		],
		rows: {
			path: "/root",
			parameters: {
				numberOfExpandedLevels: 1
			}
		},
		columns: [
			new Column({label: "Name", template: new Text({text: "{name}", wrapping: false}), filterProperty: "name", sortProperty: "name"}),
			new Column({label: "Description", template: new Text({text: "{description}", wrapping: false}), sortProperty: "description"}),
			new Column({label: "Checked", template: new CheckBox({selected: "{checked}", editable: false})}),
			new Column({label: "ProgressIndicator", template: new ProgressIndicator({
				displayValue: "50",
				percentValue: "10",
				showValue: true,
				width: "100%"
			})})
		],
		models: new JSONModel(TABLESETTINGS.treeTestData),
		footer: "Footer of the Table"
	});

	TABLESETTINGS.init(oTable, function(oButton) {
		oTable.getExtension()[0].addContent(oButton);
	});

	oTable.placeAt("content");
});