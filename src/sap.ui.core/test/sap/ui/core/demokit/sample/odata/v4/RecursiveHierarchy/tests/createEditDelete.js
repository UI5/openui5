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
		function createNewChild(sId) {
			When.onTheMainPage.createNewChild(sId);
		}

		function checkTable(sComment, iExpectedFirstVisibleRow, iExpectedCount, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected, /*bCheckName*/true,
				/*bCheckAge*/undefined, iExpectedFirstVisibleRow, iExpectedCount);
		}

		function deleteNode(sId) {
			When.onTheMainPage.deleteNode(sId);
		}

		function editName(sId, sName) {
			When.onTheMainPage.editName(sId, sName);
		}

		function scrollToRow(iRow) {
			When.onTheMainPage.scrollToRow(iRow);
		}

		function toggleExpand(sId) {
			When.onTheMainPage.toggleExpand(sId);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "1");
		// Note: If more rows are visible, no placeholders for paging will be created!
		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount", "8");
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("Initial state", 0, 24, `
+ 0 Alpha`);

		toggleExpand("0");
		checkTable("After expand '0'", 0, 24, `
- 0 Alpha
	+ 1 Beta
	* 2 Kappa
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		createNewChild("0");
		checkTable("After create new child of '0'", 0, 25, `
- 0 Alpha
	* 6
	+ 1 Beta
	* 2 Kappa
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		editName("6", "1st new child");
		checkTable("After edit 1st new child's name", 0, 25, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	* 2 Kappa
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		createNewChild("2");
		checkTable("After create new child of '2'", 0, 26, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		editName("2.1", "2nd new child");
		checkTable("After edit 2nd new child's name", 0, 26, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		toggleExpand("5");
		checkTable("After expand '5'", 0, 26, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi`);

		scrollToRow(1);
		checkTable("After '5.1' comes into view", 1, 26, `
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi
		+ 5.1 Omicron`);

		toggleExpand("5.1");
		checkTable("After expand '5.1'", 1, 26, `
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi
		- 5.1 Omicron`);

		createNewChild("5.1"); // still invisible
		scrollToRow(2);
		checkTable("After '5.1.10' comes into view", 2, 27, `
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi
		- 5.1 Omicron
			* 5.1.10`);

		scrollToRow(9);
		checkTable("After scroll to '5.1.10'", 9, 27, `
			* 5.1.10
			* 5.1.1 Pi
			* 5.1.2 Rho
			* 5.1.3 Sigma
			* 5.1.4 Tau
			* 5.1.5 Upsilon
			* 5.1.6 Phi
			* 5.1.7 Chi`);

		scrollToRow(11);
		checkTable("After scroll to bottom", 11, 27, `
			* 5.1.2 Rho
			* 5.1.3 Sigma
			* 5.1.4 Tau
			* 5.1.5 Upsilon
			* 5.1.6 Phi
			* 5.1.7 Chi
			* 5.1.8 Psi
			* 5.1.9 Omega`);

		deleteNode("5.1.4");
		checkTable("After deletion of '5.1.4'", 10, 26, `
			* 5.1.1 Pi
			* 5.1.2 Rho
			* 5.1.3 Sigma
			* 5.1.5 Upsilon
			* 5.1.6 Phi
			* 5.1.7 Chi
			* 5.1.8 Psi
			* 5.1.9 Omega`);

		scrollToRow(2);
		checkTable("After scrolling up to '1' as first visible row", 2, 26, `
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi
		- 5.1 Omicron
			* 5.1.10`);

		deleteNode("4");
		checkTable("After deletion of collapsed node '4'", 2, 24, `
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	- 5 Xi
		- 5.1 Omicron
			* 5.1.10
			* 5.1.1 Pi`);

		deleteNode("5");
		checkTable("After deletion of expanded node '5'", 0, 13, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda`);

		Then.onAnyPage.checkLog();
	};
});
