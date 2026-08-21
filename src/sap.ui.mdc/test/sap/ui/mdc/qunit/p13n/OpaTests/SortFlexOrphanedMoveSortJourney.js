/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function(Opa5, opaTest, Arrangement, Action, Assertion) {
	"use strict";

	/**
	 * Injects the orphaned variant into the app frame's localStorage.
	 * Must be called inside a waitFor success callback (after iStartMyAppInAFrame)
	 * so Opa5.getWindow() resolves to the app frame.
	 */
	function injectIntoAppFrameLocalStorage() {
		const oAppWindow = Opa5.getWindow();
		const oLS = oAppWindow.localStorage;
		const sRef = "AppUnderTestTable";
		const sVMRef = "IDVariantManagementOfInternalSampleApp_01";

		Object.keys(oLS).forEach((sKey) => {
			if (sKey.includes("sap.ui.fl")) { oLS.removeItem(sKey); }
		});

		oLS.setItem("sap.ui.fl.id_orphaned_moveSort_variant", JSON.stringify({
			fileName: "id_orphaned_moveSort_variant",
			fileType: "ctrl_variant",
			layer: "USER",
			reference: sRef,
			namespace: "apps/AppUnderTestTable/variants/",
			creation: "2020-01-01T00:00:00.000Z",
			projectId: "AppUnderTestTable",
			originalLanguage: "EN",
			support: { generator: "FlexObjectFactory.createFlVariant", user: "DEFAULT_USER", sapui5Version: "1.0.0" },
			content: {},
			texts: { variantName: { value: "OrphanedMoveSortVariant", type: "XFLD" } },
			favorite: true,
			executeOnSelection: false,
			contexts: {},
			variantReference: sVMRef,
			variantManagementReference: sVMRef
		}));

		oLS.setItem("sap.ui.fl.id_orphaned_moveSort_change", JSON.stringify({
			fileName: "id_orphaned_moveSort_change",
			fileType: "change",
			changeType: "moveSort",
			layer: "USER",
			reference: sRef,
			namespace: "apps/AppUnderTestTable/changes/",
			creation: "2020-01-01T00:00:01.000Z",
			projectId: "AppUnderTestTable",
			packageName: "$TMP",
			originalLanguage: "EN",
			support: { generator: "FlexObjectFactory.createFromFileContent", user: "DEFAULT_USER", sapui5Version: "1.0.0" },
			content: { key: "foundingYear", name: "foundingYear", index: 0 },
			texts: {},
			selector: { id: "IDTableOfInternalSampleApp_01", idIsLocal: false },
			dependentSelector: {},
			variantReference: "id_orphaned_moveSort_variant"
		}));
	}

	const sAppSource = "test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html";

	return function() {
		Opa5.extendConfig({
			arrangements: new Arrangement(),
			actions: new Action(),
			assertions: new Assertion(),
			viewNamespace: "view.",
			autoWait: true
		});

		// -----------------------------------------------------------------------
		// Orphaned moveSort variant: fMoveSort guard regression test
		//
		// Simulates the customer scenario where the fl condenser eliminated addSort
		// but retained moveSort for the same key. On variant apply, fMoveSort must
		// skip gracefully (not corrupt sortConditions with null) so that
		// getCurrentState() does not throw and the table binding is created.
		// -----------------------------------------------------------------------

		opaTest("Given an orphaned moveSort variant — switching to it must not corrupt sortConditions", function(Given, When, Then) {
			Given.enableAndDeleteLrepLocalStorage();

			// Phase 1: start app, inject into app frame localStorage, tear down
			Given.iStartMyAppInAFrame({ source: sAppSource, autoWait: true });
			When.waitFor({ success: injectIntoAppFrameLocalStorage });
			Then.iTeardownMyAppFrame();

			// Phase 2: restart — fl now reads the injected variant from localStorage on init
			Given.iStartMyAppInAFrame({ source: sAppSource, autoWait: true });

			// Switch to the variant — fMoveSort fires on an empty sorters array (no addSort injected)
			When.iSelectVariant("OrphanedMoveSortVariant");

			Then.waitFor({
				controlType: "sap.ui.mdc.Table",
				success: function(aTables) {
					const oTable = aTables[0];
					const aSorters = oTable.getSortConditions()?.sorters ?? [];

					Opa5.assert.ok(
						aSorters.every(Boolean),
						"sortConditions contains no null entries — orphaned moveSort was skipped gracefully"
					);

					let bGetCurrentStateSucceeded = false;
					try {
						oTable.getCurrentState();
						bGetCurrentStateSucceeded = true;
					} catch (e) {
						// TypeError: Cannot read properties of null/undefined (reading 'name'/'key')
					}
					Opa5.assert.ok(bGetCurrentStateSucceeded, "getCurrentState() does not throw after orphaned moveSort apply");
				}
			});

			Given.enableAndDeleteLrepLocalStorage();
			Then.iTeardownMyAppFrame();
		});

		opaTest("Given an orphaned moveSort variant — opening the sort dialog must not throw", function(Given, When, Then) {
			Given.enableAndDeleteLrepLocalStorage();

			Given.iStartMyAppInAFrame({ source: sAppSource, autoWait: true });
			When.waitFor({ success: injectIntoAppFrameLocalStorage });
			Then.iTeardownMyAppFrame();

			Given.iStartMyAppInAFrame({ source: sAppSource, autoWait: true });

			When.iSelectVariant("OrphanedMoveSortVariant");

			// Opening the sort dialog triggered the second crash path via UIManager.validateP13n
			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
			When.iSwitchToP13nTab("Sort");

			Then.thePersonalizationDialogOpens();

			When.iPressDialogOk();
			Then.thePersonalizationDialogShouldBeClosed();

			Given.enableAndDeleteLrepLocalStorage();
			Then.iTeardownMyAppFrame();
		});
	};
});
