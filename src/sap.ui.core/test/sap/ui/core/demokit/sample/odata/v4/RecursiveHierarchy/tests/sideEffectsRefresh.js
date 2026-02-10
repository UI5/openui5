/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main"
], function (_Any, _Main) {
	"use strict";

	return function (Given, When, Then) {
		function checkTable(sComment, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected);
		}

		function refreshKeepingTreeState() {
			When.onTheMainPage.refreshKeepingTreeState();
		}

		function toggleExpand(sId) {
			When.onTheMainPage.toggleExpand(sId);
		}

		function expandAll(sId) {
			When.onTheMainPage.expandAll(sId);
		}

		function scrollToRow(iRow) {
			When.onTheMainPage.scrollToRow(iRow);
		}

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("Initial state", `
- 0
	- 1
		+ 1.1
		+ 1.2
	* 2`);

		toggleExpand("0");
		checkTable("After Collapse '0'", `
+ 0`);

		expandAll("0");
		checkTable("After expand all '0'", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);

		scrollToRow(5);
		checkTable("After scroll to '1.2'", `
		- 1.2
			* 1.2.1
			* 1.2.2
			* 1.2.3
	* 2`);

		toggleExpand("1.2");
		checkTable("After collapse '1.2'", `
		+ 1.2
	* 2
	* 3
	- 4
		* 4.1`);

		scrollToRow(11);
		checkTable("After scroll to '5.1'", `
		- 5.1
			* 5.1.1
			* 5.1.2
			* 5.1.3
			* 5.1.4`);

		toggleExpand("5.1");
		checkTable("After collapse '5.1'", `
	* 3
	- 4
		* 4.1
	- 5
		+ 5.1`);

		toggleExpand("5");
		checkTable("After collapse '5'", `
	* 2
	* 3
	- 4
		* 4.1
	+ 5`);

		scrollToRow(1);
		checkTable("After scroll to '1'", `
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		+ 1.2`);

		toggleExpand("1.1");
		checkTable("After collapse '1.1'", `
	- 1
		+ 1.1
		+ 1.2
	* 2
	* 3`);

		toggleExpand("1");
		checkTable("After collapse '1'", `
	+ 1
	* 2
	* 3
	- 4
		* 4.1`);

		scrollToRow(2);
		checkTable("After scroll to '2'", `
	* 2
	* 3
	- 4
		* 4.1
	+ 5`);

		refreshKeepingTreeState();
		checkTable("After side effects refresh", `
	* 2
	* 3
	- 4
		* 4.1
	+ 5`);

		scrollToRow(1);
		checkTable("After scroll to '1'", `
	+ 1
	* 2
	* 3
	- 4
		* 4.1`);

		expandAll("1");
		checkTable("After expand all '1'", `
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		- 1.2`);

		scrollToRow(9);
		checkTable("After scroll to '2'", `
	* 2
	* 3
	- 4
		* 4.1
	+ 5`);
	};
});
