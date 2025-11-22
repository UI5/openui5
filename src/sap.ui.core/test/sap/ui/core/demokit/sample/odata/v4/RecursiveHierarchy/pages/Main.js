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

	function copy(sId, sParentOrSibling, sComment, rButton, sButtonText) {
		selectCopy.call(this);
		pressButtonInRow.call(this, sId, rButton, sButtonText, sComment);
		findNode.call(this, sParentOrSibling);
		pressButton.call(this, undefined, function (oControl) {
				return oControl.getBindingContext().getProperty("ID")
					=== sParentOrSibling;
			}, `to select node with ID ${sParentOrSibling}`, "sap.m.StandardListItem");
	}

	function findNode(sId) {
		this.waitFor({
			actions : new EnterText({clearTextFirst : true, text : sId}),
			controlType : "sap.m.SearchField",
			errorMessage : `Could not find node with ID ${sId}`,
			matchers : function (oControl) {
				return oControl.getId().includes("searchField");
			},
			success : function () {
				Opa5.assert.ok(true, `Found node with ID ${sId}`);
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

	function pressButton(rButtonId, fnMatchers, sComment, sControlType = "sap.m.Button") {
		this.waitFor({
			actions : new Press(),
			controlType : sControlType,
			errorMessage : `Could not press button ${sComment}`,
			id : rButtonId,
			matchers : fnMatchers,
			success : function () {
				Opa5.assert.ok(true, `Pressed button ${sComment}`);
			},
			viewName : sViewName
		});
	}

	function pressButtonInRow(sId, rButtonId, sText, sComment) {
		pressButton.call(this, rButtonId, function (oControl) {
				return oControl.getBindingContext().getProperty("ID") === sId;
			}, `'${sText}' with ID ${sId}. ${sComment}`);
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

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				copyAsLastChildOf : function (sId, sParent, sComment) {
					copy.call(this, sId, sParent, sComment, /moveAsLastChildOf/,
						"Move as last child of");
				},
				copyAsLastRoot : function (sId, sComment) {
					selectCopy.call(this);
					pressButtonInRow.call(this, sId, /makeLastRoot/, "Make Last Root", sComment);
				},
				copyJustBeforeSibling : function (sId, sParent, sComment) {
					copy.call(this, sId, sParent, sComment, /moveJustBeforeSibling/,
						"Move just before sibling");
				},
				copyToParent : function (sId, sParent, sComment) {
					copy.call(this, sId, sParent, sComment, /moveToParent/, "Move to parent");
				},
				copyToRoot : function (sId, sComment) {
					selectCopy.call(this);
					pressButtonInRow.call(this, sId, /moveToRoot/, "Move to root", sComment);
				},
				createNewChild : function (sId, sComment) {
					pressButtonInRow.call(this, sId, /create/, "Create new child below node",
						sComment);
				},
				deleteNode : function (sId, sComment) {
					pressButtonInRow.call(this, sId, /delete/, "Delete node", sComment);
				},
				editName : function (sId, sName, sComment) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sName}),
						controlType : "sap.m.Input",
						errorMessage : `Could not edit name of node with ID ${sId}`,
						id : /name/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getProperty("ID") === sId;
						},
						success : function () {
							Opa5.assert.ok(true,
								`Entered name of node ${sId} as "${sName}". ${sComment}`);
						},
						viewName : sViewName
					});
				},
				scrollToRow : function (iRow, sComment) {
					this.waitFor({
						actions : function (oTable) {
							oTable.setFirstVisibleRow(iRow);
						},
						errorMessage : "Could not select row " + iRow,
						id : rTableId,
						success : function (aControls) {
							const oTable = aControls[0];
							Opa5.assert.strictEqual(oTable.getFirstVisibleRow(), iRow,
								"Scrolled table to row " + iRow + ". " + sComment);
						},
						viewName : sViewName
					});
				},
				synchronize : function (sComment) {
					pressButton.call(this, /synchronize/, null, "Synchronize (" + sComment + ")");
				},
				refreshKeepingTreeState : function (sComment) {
					pressButton.call(this, /sideEffectsRefresh/, null,
						`'Refresh (keeping tree state)'. ${sComment}`);
				},
				toggleExpand : function (sId, sComment) {
					this.waitFor({
						actions : (oTable) => {
							if (oTable.getId().includes("treeTable")) {
								const oRow = oTable.getRows().find(function (oControl) {
									return oControl.getBindingContext().getProperty("ID") === sId;
								}).getBindingContext();

								if (oRow.isExpanded()) {
									oRow.collapse();
								} else {
									oRow.expand();
								}
							} else { // Table
								pressButtonInRow.call(this, sId, /expandToggle/, "Expand",
									sComment);
							}
						},
						errorMessage : `Could not press button 'Expand' with ID ${sId}`,
						id : rTableId,
						success : function () {
							Opa5.assert.ok(true,
								`Pressed button 'Expand' with ID ${sId}. ${sComment}`);
						},
						viewName : sViewName
					});
				},
				expandAll : function (sId, sComment) {
					pressButtonInRow.call(this, sId, /expandAll/, "Expand Levels", sComment);
				},
				collapseAll : function (sId, sComment) {
					pressButtonInRow.call(this, sId, /collapseAll/, "Collapse All", sComment);
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
									oTable.getFirstVisibleRow(), iExpectedFirstVisibleRow);
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
