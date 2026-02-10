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

		function toggleExpand(sId) {
			When.onTheMainPage.toggleExpand(sId);
		}

		// function expandLevels(sId, iLevels, sComment) {
		//   When.onTheMainPage.expandLevels(sId, iLevels, sComment);
		// }

		function expandAll(sId) {
			When.onTheMainPage.expandAll(sId);
		}

		function collapseAll(sId) {
			When.onTheMainPage.collapseAll(sId);
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

		collapseAll("0");
		checkTable("After collapse all below '0'", `
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

		// expandLevels(0, 4); // TODO should be the same
		expandAll("0");
		checkTable("After expand all below '0'", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);
	};
});
