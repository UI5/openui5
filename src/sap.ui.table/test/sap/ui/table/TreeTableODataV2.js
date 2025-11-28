sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/table/TreeTable",
  "sap/ui/table/Table",
  "jquery.sap.global"
], async function(XMLView, TreeTable, Table, jQuery) {
  "use strict";
  // Note: the HTML page 'TreeTableODataV2.html' loads this module via data-sap-ui-on-init

  jQuery.sap.measure.setActive(true);

  jQuery.sap.measure.registerMethod("Table._createRows", Table.prototype, "_createRows", ["JS"]);
  jQuery.sap.measure.registerMethod("TreeTable._updateTableContent", TreeTable.prototype, "_updateTableContent", ["JS"]);
  jQuery.sap.measure.registerMethod("Table._syncColumnHeaders", Table.prototype, "_syncColumnHeaders", ["JS"]);
  jQuery.sap.measure.registerMethod("Table._updateRowHeader", Table.prototype, "_updateRowHeader", ["JS"]);

  (await XMLView.create({
	  viewName: "sap.ui.table.mvc.TreeTableODataV2"
  })).placeAt("content");
});