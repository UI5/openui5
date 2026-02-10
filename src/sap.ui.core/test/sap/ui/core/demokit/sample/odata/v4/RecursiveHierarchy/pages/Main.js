/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Opa5, EnterText, Press) {
	"use strict";

	const rTableId = /^(treeTable|table)$/;
	const sViewName = "sap.ui.core.sample.odata.v4.RecursiveHierarchy.RecursiveHierarchy";

	function checkCount(oTable, iExpectedCount) {
		this.waitFor({
			controlType : "sap.m.Title",
			id : /title/,
			success : function (aControls) {
				const sCount = aControls[0].getText().match(/ (\d+) Employees/)[1];
				Opa5.assert.strictEqual(sCount, String(iExpectedCount),
					"$count binding as expected");
				Opa5.assert.strictEqual(oTable.getBinding("rows").getCount(), iExpectedCount,
					"ODLB#getCount() as expected");
			},
			viewName : sViewName
		});
	}

	function copy(sId, sParentOrSibling, rButton) {
		selectCopy.call(this);
		pressButtonInRow.call(this, sId, rButton);
		findNode.call(this, sParentOrSibling);
		selectItem.call(this, sParentOrSibling);
	}

	function findNode(sId) {
		this.waitFor({
			actions : new EnterText({clearTextFirst : true, text : sId}),
			controlType : "sap.m.SearchField",
			errorMessage : `Could not find '${sId}'`,
			matchers : function (oControl) {
				return oControl.getId().includes("searchField");
			},
			success : function () {
				Opa5.assert.ok(true, `Found '${sId}'`);
			},
			viewName : sViewName
		});
	}

	function getTableAsString(oTable, bCheckName, bCheckAge) {
		const bTreeTable = oTable.getId().includes("treeTable");
		let sResult = "";

		for (const oRow of oTable.getRows()) {
			const oRowContext = oRow.getBindingContext();
			if (!oRowContext) {
				break; // empty row found, no more data to process
			}

			const bDrillState = oRowContext.getProperty("@$ui5.node.isExpanded");
			let sDrillState = "* "; // leaf by default
			if (bDrillState === true) {
				sDrillState = "- "; // expanded
			} else if (bDrillState === false) {
				sDrillState = "+ "; // collapsed
			}

			const iLevel = oRowContext.getProperty("@$ui5.node.level");
			const aCells = oRow.getCells();
			const sID = aCells[bTreeTable ? 0 : 2].getText();
			sResult += "\n" + "\t".repeat(iLevel - 1) + sDrillState + sID;
			const sName = aCells[bTreeTable ? 3 : 4].getValue();
			if (sName && bCheckName) {
				sResult += " " + sName;
			}
			if (bCheckAge) {
				sResult += " " + aCells[bTreeTable ? 4 : 5].getText();
			}
		}

		return sResult;
	}

	function pressButton(rButtonId, fnMatchers) {
		let sMessage;
		this.waitFor({
			actions : function (oControl) {
				// tooltip may change after the press
				sMessage = `Pressed '${oControl.getTooltip()}' button`;
				// toolbar buttons don't have a binding context
				const oNode = oControl.getBindingContext()?.getObject();
				if (oNode) {
					sMessage += ` on '${oNode.ID}' (${oNode.Name})`;
				}
				new Press().executeOn(oControl);
			},
			controlType : "sap.m.Button",
			errorMessage : `Could not press button ${rButtonId}`,
			id : rButtonId,
			matchers : fnMatchers,
			success : function () {
				Opa5.assert.ok(true, sMessage);
			},
			viewName : sViewName
		});
	}

	function pressButtonInRow(sId, rButtonId) {
		pressButton.call(this, rButtonId, function (oControl) {
				return oControl.getBindingContext().getProperty("ID") === sId;
			});
	}

	function selectCopy() {
		this.waitFor({
			actions : function (oCheckBox) {
				oCheckBox.setSelected(true);
			},
			controlType : "sap.m.CheckBox",
			errorMessage : "Could not find checkbox Copy",
			id : /copyCheckBox/,
			success : function () {
				Opa5.assert.ok(true, "Enable Copy");
			},
			viewName : sViewName
		});
	}

	function selectItem(sId) {
		this.waitFor({
			actions : new Press(),
			controlType : "sap.m.StandardListItem",
			errorMessage : `Could not select '${sId}'`,
			matchers : function (oControl) {
				return oControl.getBindingContext().getProperty("ID") === sId;
			},
			success : function ([oListItem]) {
				Opa5.assert.ok(true,
					`Selected '${sId}' (${oListItem.getBindingContext().getProperty("Name")})`);
			},
			viewName : sViewName
		});
	}

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				copyAsLastChildOf : function (sId, sParent) {
					copy.call(this, sId, sParent, /moveAsLastChildOf/);
				},
				copyAsLastRoot : function (sId) {
					selectCopy.call(this);
					pressButtonInRow.call(this, sId, /makeLastRoot/);
				},
				copyJustBeforeSibling : function (sId, sParent) {
					copy.call(this, sId, sParent, /moveJustBeforeSibling/);
				},
				copyToParent : function (sId, sParent) {
					copy.call(this, sId, sParent, /moveToParent/);
				},
				copyToRoot : function (sId) {
					selectCopy.call(this);
					pressButtonInRow.call(this, sId, /moveToRoot/);
				},
				createNewChild : function (sId) {
					pressButtonInRow.call(this, sId, /create/);
				},
				deleteNode : function (sId) {
					pressButtonInRow.call(this, sId, /delete/);
				},
				editName : function (sId, sName) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sName}),
						controlType : "sap.m.Input",
						errorMessage : `Could not edit name of '${sId}'`,
						id : /name/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getProperty("ID") === sId;
						},
						success : function () {
							Opa5.assert.ok(true, `Entered name of '${sId}' as "${sName}"`);
						},
						viewName : sViewName
					});
				},
				scrollToRow : function (iRow) {
					this.waitFor({
						actions : function (oTable) {
							oTable.setFirstVisibleRow(iRow);
						},
						errorMessage : "Could not scroll to row " + iRow,
						id : rTableId,
						success : function (aControls) {
							const oTable = aControls[0];
							Opa5.assert.strictEqual(oTable.getFirstVisibleRow(), iRow,
								`Scrolled table to row ${iRow}`);
						},
						viewName : sViewName
					});
				},
				synchronize : function () {
					pressButton.call(this, /synchronize/);
				},
				refreshKeepingTreeState : function () {
					pressButton.call(this, /sideEffectsRefresh/);
				},
				toggleExpand : function (sId) {
					this.waitFor({
						actions : (oTable) => {
							if (oTable.getId().includes("treeTable")) {
								const oRowContext = oTable.getRows().find(function (oControl) {
									return oControl.getBindingContext().getProperty("ID") === sId;
								}).getBindingContext();
								const bIsExpanded = oRowContext.isExpanded();
								if (bIsExpanded) {
									oRowContext.collapse();
								} else {
									oRowContext.expand();
								}
								Opa5.assert.ok(true,
									`${bIsExpanded ? "Collapsed" : "Expanded"}`
										+ ` '${sId}' (${oRowContext.getProperty("Name")})`);
							} else { // Table
								pressButtonInRow.call(this, sId, /expandToggle/);
							}
						},
						errorMessage :
							`Could not press button 'Collapse/Expand' on '${sId}'`,
						id : rTableId,
						viewName : sViewName
					});
				},
				expandAll : function (sId) {
					pressButtonInRow.call(this, sId, /expandAll/);
				},
				collapseAll : function (sId) {
					pressButtonInRow.call(this, sId, /collapseAll/);
				}
			},
			assertions : {
				checkTable : function (sComment, sExpected, bCheckName, bCheckAge,
						iExpectedFirstVisibleRow, iExpectedCount) {
					this.waitFor({
						id : rTableId,
						success : function (aControls) {
							const oTable = aControls[0];
							const sResult = getTableAsString(oTable, bCheckName, bCheckAge);
							Opa5.assert.strictEqual(sResult, sExpected, sComment);
							if (iExpectedFirstVisibleRow !== undefined) {
								Opa5.assert.strictEqual(
									oTable.getFirstVisibleRow(), iExpectedFirstVisibleRow,
									`First visible row is ${iExpectedFirstVisibleRow} as expected`);
							}
							if (iExpectedCount !== undefined) {
								checkCount.call(this, oTable, iExpectedCount);
							}
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});
