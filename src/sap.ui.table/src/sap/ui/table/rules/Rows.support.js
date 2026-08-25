/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/table/rowmodes/Type",
	"./TableHelper.support",
	"sap/ui/support/library"
], function(
	Lib,
	RowModeType,
	SupportHelper,
	SupportLibrary
) {
	"use strict";

	const Categories = SupportLibrary.Categories;
	const Severity = SupportLibrary.Severity;

	function checkDensity(aSource, sTargetClass, sMessage, oIssueManager) {
		let bFound = false;
		for (const oNode of aSource) {
			if (oNode.closest(sTargetClass)) {
				bFound = true;
			}
		}
		if (bFound && sMessage) {
			SupportHelper.reportIssue(oIssueManager, sMessage, Severity.High);
		}
		return bFound;
	}

	/*
	 * Checks whether content densities are used correctly.
	 */
	const oContentDensity = SupportHelper.normalizeRule({
		id: "ContentDensity",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Content Density Usage",
		description: "Checks whether the content densities 'Cozy', 'Compact' and 'Condensed' are used correctly.",
		resolution: "Ensure that either only the 'Cozy' or 'Compact' content density is used, or the 'Condensed' and 'Compact' content densities"
					+ " are used in combination.",
		resolutionurls: [
			SupportHelper.createDocuRef("Documentation: Content Densities", "topic/e54f729da8e3405fae5e4fe8ae7784c1")
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			const aCozy = document.documentElement.querySelectorAll(".sapUiSizeCozy");
			const aCompact = document.documentElement.querySelectorAll(".sapUiSizeCompact");
			const aCondensed = document.documentElement.querySelectorAll(".sapUiSizeCondensed");

			checkDensity(aCompact, ".sapUiSizeCozy", "'Compact' content density is used within 'Cozy' area.", oIssueManager);
			checkDensity(aCozy, ".sapUiSizeCompact", "'Cozy' content density is used within 'Compact' area.", oIssueManager);
			checkDensity(aCondensed, ".sapUiSizeCozy", "'Condensed' content density is used within 'Cozy' area.", oIssueManager);
			checkDensity(aCozy, ".sapUiSizeCondensed", "'Cozy' content density is used within 'Condensed' area.", oIssueManager);

			if (aCondensed.length > 0) {
				const bFound = checkDensity(aCondensed, ".sapUiSizeCompact", oIssueManager);
				if (!bFound) {
					SupportHelper.reportIssue(oIssueManager, "'Condensed' content density must be used in combination with 'Compact'.",
						Severity.High);
				}
			}

			if (Lib.all()["sap.m"] && aCozy.length === 0 && aCompact.length === 0 && aCondensed.length === 0) {
				SupportHelper.reportIssue(oIssueManager,
					"If the sap.ui.table and the sap.m libraries are used together, a content density must be specified.",
					Severity.High
				);
			}
		}
	});

	/*
	 * Checks the configuration of the sap.f.DynamicPage. If the DynamicPage contains a table with row mode <code>Auto</code>, the
	 * <code>fitContent</code> property of the DynamicPage should be set to true, otherwise false.
	 */
	const oDynamicPageConfiguration = SupportHelper.normalizeRule({
		id: "DynamicPageConfiguration",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Table environment validation - 'sap.f.DynamicPage'",
		description: "Verifies that the DynamicPage is configured correctly from the table's perspective.",
		resolution: "If a table with row mode 'Auto' is placed inside a sap.f.DynamicPage, the fitContent property of the DynamicPage"
					+ " should be set to true, otherwise false.",
		resolutionurls: [
			SupportHelper.createDocuRef("API Reference: sap.f.DynamicPage#getFitContent", "#/api/sap.f.DynamicPage/methods/getFitContent")
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			const aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			function checkAllParentDynamicPages(oControl, fnCheck) {
				if (oControl) {
					if (oControl.isA("sap.f.DynamicPage")) {
						fnCheck(oControl);
					}
					checkAllParentDynamicPages(oControl.getParent(), fnCheck);
				}
			}

			function checkConfiguration(oTable, oDynamicPage) {
				const vRowMode = oTable.getRowMode();
				let bIsTableInAutoMode = false;

				/**
				 * @deprecated As of version 1.119
				 */
				if (!vRowMode) {
					bIsTableInAutoMode = oTable.getVisibleRowCountMode() === "Auto";
				}

				if (vRowMode) {
					bIsTableInAutoMode = vRowMode === RowModeType.Auto || vRowMode.isA("sap.ui.table.rowmodes.Auto");
				}

				if (bIsTableInAutoMode && !oDynamicPage.getFitContent()) {
					SupportHelper.reportIssue(oIssueManager,
						"A table with an auto row mode is placed inside a sap.f.DynamicPage with fitContent=\"false\"",
						Severity.High, oTable.getId());
				} else if (!bIsTableInAutoMode && oDynamicPage.getFitContent()) {
					SupportHelper.reportIssue(oIssueManager,
						"A table with a fixed or interactive row mode is placed inside a sap.f.DynamicPage with fitContent=\"true\"",
						Severity.Low, oTable.getId());
				}
			}

			aTables.forEach((oTable) => checkAllParentDynamicPages(oTable, checkConfiguration.bind(null, oTable)));
		}
	});

	return [oContentDensity, oDynamicPageConfiguration];

}, true);