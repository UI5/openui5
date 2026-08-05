sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/core/Lib"
], (
	Opa5,
	Press,
	Lib
) => {
	"use strict";

	const sOverlayWithChangesClass = "sapUiRtaOverlayWithChanges";
	const oContextMenuEvent = new MouseEvent("contextmenu", {
		bubbles: true,
		cancelable: true,
		view: window,
		buttons: 2
	});

	function getChangeDetailTable(oPopover) {
		return oPopover.getContent().find((oControl) => oControl.isA("sap.m.Table"));
	}

	Opa5.createPageObjects({
		onPageWithCViz: {

			actions: {
				iOpenTheChangeDetailPopupFor(vElementId) {
					const fnGetElementId = typeof vElementId === "function" ? vElementId : () => vElementId;
					this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === fnGetElementId();
						},
						success(aOverlays) {
							aOverlays[0].getDomRef().dispatchEvent(oContextMenuEvent);
						},
						errorMessage: "Did not find the Element Overlay"
					});
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getId().endsWith("-viewChanges-button");
						},
						actions: new Press(),
						errorMessage: "Did not find the View Changes button in the context menu"
					});
				},
				iPressTheShowSourceButton() {
					const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
					const sButtonText = oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getText() === sButtonText;
						},
						actions: new Press(),
						errorMessage: "Did not find the Show Source button"
					});
				},
				iCloseTheChangeDetailPopup() {
					// The popover's begin/back button (press=".onClosePopover") closes the popup
					// and reopens the context menu. Closing it frees the context menu plugin so the
					// next element's change list can be opened.
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.getId().endsWith("--changeDetailPopover");
						},
						actions(oPopover) {
							new Press().executeOn(oPopover.getBeginButton());
						},
						errorMessage: "Did not find the change detail popover to close"
					});
				}
			},

			assertions: {
				iShouldSeeTheChangeDetailPopup() {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.getId().endsWith("--changeDetailPopover");
						},
						success(aPopover) {
							Opa5.assert.ok(aPopover[0].isOpen(), "then the change detail popover is open");
						},
						errorMessage: "Did not find the change detail popover"
					});
				},
				iShouldSeeChangeDetailWithType(sChangeType, iRow) {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.getId().endsWith("--changeDetailPopover");
						},
						success(aPopover) {
							const oTable = getChangeDetailTable(aPopover[0]);
							Opa5.assert.strictEqual(
								oTable.getItems()[iRow].getCells()[0].getTooltip(),
								sChangeType,
								"then the change type displayed in the detail popover is correct"
							);
						},
						errorMessage: "Could not find the change detail information or it doesn't match the change type"
					});
				},
				iShouldSeeNumberOfChangeDetailRows(iCount) {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.getId().endsWith("--changeDetailPopover");
						},
						success(aPopover) {
							const oTable = getChangeDetailTable(aPopover[0]);
							Opa5.assert.strictEqual(
								oTable.getItems().length,
								iCount,
								"then the correct number of changes is listed in the detail popover"
							);
						},
						errorMessage: "The number of change detail rows does not match"
					});
				},
				iShouldSeeOverlaysWithChanges(iCount) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.hasStyleClass(sOverlayWithChangesClass);
						},
						success(aOverlays) {
							Opa5.assert.strictEqual(
								aOverlays.length,
								iCount,
								"then the correct number of overlays is decorated as changed"
							);
						},
						errorMessage: "The number of decorated overlays does not match the expected count"
					});
				},
				iShouldNotSeeAnyOverlayWithChanges() {
					return this.waitFor({
						success() {
							const bHasNoDecoratedOverlays =
								Opa5.getWindow().document.getElementsByClassName(sOverlayWithChangesClass).length === 0;
							Opa5.assert.ok(bHasNoDecoratedOverlays, "then no overlay is decorated as changed");
						},
						errorMessage: "There is still an overlay decorated as changed"
					});
				},
				iShouldSeeTheSourceElementOverlay() {
					return this.waitFor({
						asyncPolling: true,
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorDependent");
						},
						success(oOverlay) {
							Opa5.assert.ok(oOverlay[0], "then dependent element indicator is shown");
						},
						errorMessage: "Did not find the dependent element with the style class"
					});
				}
			}
		}
	});
});
