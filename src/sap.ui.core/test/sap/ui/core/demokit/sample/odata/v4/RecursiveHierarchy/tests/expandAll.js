/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main",
	"sap/ui/test/TestUtils"
], function (_Any, _Main, TestUtils) {
	"use strict";

	return function (Given, When, Then) {
		function checkTable(sComment, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected);
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

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "1");

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("Initial state", `
+ 0`);

		toggleExpand("0");
		checkTable("After expand '0'", `
- 0
	+ 1
	* 2
	* 3
	+ 4`);

		toggleExpand("0");
		checkTable("After collapse '0'", `
+ 0`);

		expandAll("0");
		checkTable("After expand all below '0'", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);

		scrollToRow(11);
		checkTable("After scroll to '4'", `
	- 4
		* 4.1
	- 5
		- 5.1
			* 5.1.1`);

		scrollToRow(0);
		checkTable("After scroll to '0'", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);

		toggleExpand("1.1");
		checkTable("After collapse '1.1'", `
- 0
	- 1
		+ 1.1
		- 1.2
			* 1.2.1`);

		toggleExpand("1");
		checkTable("After collapse '1'", `
- 0
	+ 1
	* 2
	* 3
	- 4`);

		toggleExpand("0");
		checkTable("After collapse '0'", `
+ 0`);

		expandAll("0");
		checkTable("After expand all below '0'", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);
	};
});
