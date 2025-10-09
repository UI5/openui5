/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/support/library",
	"sap/base/Log"
], (
	SupportLibrary,
	Log
) => {
	"use strict";

	const {Categories, Severity, Audiences} = SupportLibrary;

	const oHeaderVisibleWhenToolbarHidden = {
		id: "HeaderVisibleWhenToolbarHidden",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "Header visibility when the toolbar is hidden",
		description: "Checks 'headerVisible' when the toolbar is hidden",
		resolution: "Set the 'headerVisible' property of the 'sap.ui.mdc.Table' to false",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table").forEach((oTable) => {
				if (oTable.getHideToolbar() && oTable.getHeaderVisible()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "'headerVisible' is true but toolbar is hidden.",
						context: {
							id: oTable.getId()
						}
					});
				}
			});
		}
	};

	const oShowRowCountWhenToolbarHidden = {
		id: "ShowRowCountWhenToolbarHidden",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "Showing row count when the toolbar is hidden",
		description: "Checks 'showRowCount' when the toolbar is hidden",
		resolution: "Set the 'showRowCount' property of the 'sap.ui.mdc.Table' to false",
		resolutionurls: [],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table").forEach((oTable) => {
				if (oTable.getHideToolbar() && oTable.getShowRowCount()) {
					oIssueManager.addIssue({
						severity: Severity.Low,
						details: "'showRowCount' is true but toolbar is hidden.",
						context: {
							id: oTable.getId()
						}
					});
				}
			});
		}
	};

	const oEnableExportWhenToolbarHidden = {
		id: "EnableExportWhenToolbarHidden",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "Export when the toolbar is hidden",
		description: "Checks 'enableExport' when the toolbar is hidden",
		resolution: "Set the 'enableExport' property of the 'sap.ui.mdc.Table' to false",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table").forEach((oTable) => {
				if (oTable.getHideToolbar() && oTable.getEnableExport()) {
					oIssueManager.addIssue({
						severity: Severity.Low,
						details: "'enableExport' is true but toolbar is hidden.",
						context: {
							id: oTable.getId()
						}
					});
				}
			});
		}
	};

	const oToolbarElementsWhenToolbarHidden = {
		id: "ToolbarElementsWhenToolbarHidden",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "Actions, quickFilter, and a table-related VariantManagement when the toolbar is hidden",
		description: "Checks whether the 'actions', 'quickFilter', and 'variant' aggregations are used when the toolbar is hidden",
		resolution: "Remove 'actions', 'quickFilter', and 'variants' aggregations from the 'sap.ui.mdc.Table'",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table").forEach((oTable) => {
				const bActions = (oTable.getActions() !== undefined && oTable.getActions() !== null && oTable.getActions().length !== 0);
				const bVariant = (oTable.getVariant() !== undefined && oTable.getVariant() !== null && oTable.getVariant().length !== 0);
				const bQuickFilter = (oTable.getQuickFilter() !== undefined && oTable.getQuickFilter() !== null && oTable.getQuickFilter().length !== 0);

				if (oTable.getHideToolbar() && (bActions || bVariant || bQuickFilter)) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "'actions', 'quickFilter', and 'variant' aggregations are not empty.",
						context: {
							id: oTable.getId()
						}
					});
				}
			});
		}
	};

	const oHeader = {
		id: "Header",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "Table header value",
		description: "Checks if the table 'header' is set",
		resolution: "Set a table title via the 'header' property of the 'sap.ui.mdc.Table'",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table").forEach((oTable) => {
				if (!oTable.getHeader()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "Header isn't set. Set a title in the header property.",
						context: {
							id: oTable.getId()
						}
					});
				}
			});
		}
	};

	const oIllustratedMessageForNoData = {
		id: "IllustratedMessageForNoData",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "IllustratedMessage for noData",
		description: "Checks whether 'noData' is an 'IllustratedMessage' when the toolbar is hidden",
		resolution: "Set the 'noData' aggregation of the 'sap.ui.mdc.Table' to an 'sap.m.IllustratedMessage'",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: Illustrated Message",
			href: "https://experience.sap.com/fiori-design-web/illustrated-message/"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table").forEach((oTable) => {
				if (oTable.getHideToolbar() && (!oTable.getNoData() || !oTable.getNoData().isA("sap.m.IllustratedMessage"))) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "'noData' aggregation is either not set or no 'sap.m.IllustratedMessage' control is used.",
						context: {
							id: oTable.getId()
						}
					});
				}
			});
		}
	};

	const oStateValidation = {
		id: "StateValidation",
		audiences: [Audiences.Control],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.141",
		title: "Table reports invalid state modifications",
		description: "The table contains state modifications, for example sort conditions, for non-existent PropertyInfo properties",
		resolution: "Remove the invalid state modifications or add the missing PropertyInfo properties",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table").forEach((oTable) => {
				Log.getLogEntries().filter((oLogEntry) =>
					oLogEntry.details === oTable.toString()
					&& oLogEntry.level === Log.Level.ERROR
					&& oLogEntry.message.startsWith("Invalid state:")
				).forEach((oLogEntry) => {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: oLogEntry.message,
						context: {
							id: oTable.getId()
						}
					});
				});
			});
		}
	};

	return [
		oHeaderVisibleWhenToolbarHidden,
		oShowRowCountWhenToolbarHidden,
		oEnableExportWhenToolbarHidden,
		oToolbarElementsWhenToolbarHidden,
		oHeader,
		oIllustratedMessageForNoData,
		oStateValidation
	];

});