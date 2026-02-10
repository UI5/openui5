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

		function collapseAll(sId) {
			When.onTheMainPage.collapseAll(sId);
		}

		function expandAll(sId) {
			When.onTheMainPage.expandAll(sId);
		}

		function toggleExpand(sId) {
			When.onTheMainPage.toggleExpand(sId);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "1");
		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount", "25");

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("Initial state", `
+ 0`);

		for (let i = 0; i < 2; i += 1) { // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			toggleExpand("0");
			checkTable("After expand '0'", `
- 0
	+ 1
	* 2
	* 3
	+ 4
	+ 5`);

			toggleExpand("1");
			checkTable("After expand '1'", `
- 0
	- 1
		+ 1.1
		+ 1.2
	* 2
	* 3
	+ 4
	+ 5`);

			toggleExpand("1.1");
			checkTable("After expand '1.1'", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		+ 1.2
	* 2
	* 3
	+ 4
	+ 5`);

			collapseAll("0");
			checkTable("After collapse all below '0'", `
+ 0`);
		} // end for - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expandAll("0");
		checkTable("After expand all below '0'", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		- 1.2
			* 1.2.1
			* 1.2.2
			* 1.2.3
	* 2
	* 3
	- 4
		* 4.1
	- 5
		- 5.1
			* 5.1.1
			* 5.1.2
			* 5.1.3
			* 5.1.4
			* 5.1.5
			* 5.1.6
			* 5.1.7
			* 5.1.8
			* 5.1.9`);
	};
});
