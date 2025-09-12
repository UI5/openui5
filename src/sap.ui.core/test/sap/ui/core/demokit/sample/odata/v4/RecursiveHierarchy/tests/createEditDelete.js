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
		function createNewChild(sId, sComment) {
			When.onTheMainPage.createNewChild(sId, sComment);
		}

		function checkTable(sComment, iExpectedFirstVisibleRow, iExpectedCount, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected, /*bCheckName*/true,
				/*bCheckAge*/undefined, iExpectedFirstVisibleRow, iExpectedCount);
		}

		function deleteNode(sId, sComment) {
			When.onTheMainPage.deleteNode(sId, sComment);
		}

		function editName(sId, sName, sComment) {
			When.onTheMainPage.editName(sId, sName, sComment);
		}

		function scrollToRow(iRow, sComment) {
			When.onTheMainPage.scrollToRow(iRow, sComment);
		}

		function toggleExpand(sId, sComment) {
			When.onTheMainPage.toggleExpand(sId, sComment);
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

		toggleExpand("0", "Expand 0 (Alpha)");
		checkTable("After expand 0 (Alpha)", 0, 24, `
- 0 Alpha
	+ 1 Beta
	* 2 Kappa
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		createNewChild("0", "Create new child of 0 (Alpha)");
		checkTable("After create new child of 0 (Alpha)", 0, 25, `
- 0 Alpha
	* 6
	+ 1 Beta
	* 2 Kappa
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		editName("6", "1st new child", "Edit new child's name");
		checkTable("After edit new child's name", 0, 25, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	* 2 Kappa
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		createNewChild("2", "Create new child of 2 (Kappa)");
		checkTable("After create new child of 2 (Kappa)", 0, 26, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		editName("2.1", "2nd new child", "Edit new child's name");
		checkTable("After edit new child's name", 0, 26, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	+ 5 Xi`);

		toggleExpand("5", "Expand 5 (Xi)");
		checkTable("After expand 5 (Xi)", 0, 26, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi`);

		scrollToRow(1, "5.1 (Omicron) comes into view");
		checkTable("After 5.1 (Omicron) comes into view", 1, 26, `
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi
		+ 5.1 Omicron`);

		toggleExpand("5.1", "Expand 5.1 (Omicron)");
		checkTable("After expand 5.1 (Omicron)", 1, 26, `
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi
		- 5.1 Omicron`);

		createNewChild("5.1", "Create new child of 5.1 (Omicron)"); // still invisible
		scrollToRow(2, "5.1.10 comes into view");
		checkTable("After 5.1.10 comes into view", 2, 27, `
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi
		- 5.1 Omicron
			* 5.1.10`);

		scrollToRow(9, "Scroll to 5.1.10");
		checkTable("After scroll to 5.1.10", 9, 27, `
			* 5.1.10
			* 5.1.1 Pi
			* 5.1.2 Rho
			* 5.1.3 Sigma
			* 5.1.4 Tau
			* 5.1.5 Upsilon
			* 5.1.6 Phi
			* 5.1.7 Chi`);

		scrollToRow(11, "Scroll to bottom");
		checkTable("After scroll to bottom", 11, 27, `
			* 5.1.2 Rho
			* 5.1.3 Sigma
			* 5.1.4 Tau
			* 5.1.5 Upsilon
			* 5.1.6 Phi
			* 5.1.7 Chi
			* 5.1.8 Psi
			* 5.1.9 Omega`);

		deleteNode("5.1.4", "Delete 5.1.4 (Tau)");
		checkTable("After deletion of 5.1.4 (Tau)", 10, 26, `
			* 5.1.1 Pi
			* 5.1.2 Rho
			* 5.1.3 Sigma
			* 5.1.5 Upsilon
			* 5.1.6 Phi
			* 5.1.7 Chi
			* 5.1.8 Psi
			* 5.1.9 Omega`);

		scrollToRow(2, "Scroll up that Beta is the first visible row");
		checkTable("After scrolling up to Beta as first visible row", 2, 26, `
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	+ 4 Mu
	- 5 Xi
		- 5.1 Omicron
			* 5.1.10`);

		deleteNode("4", "Delete collapsed node 4 (Mu)");
		checkTable("After deletion of 4 (Mu)", 2, 24, `
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda
	- 5 Xi
		- 5.1 Omicron
			* 5.1.10
			* 5.1.1 Pi`);

		deleteNode("5", "Delete expanded node 5 (Xi)");
		checkTable("After deletion of 5 (Xi)", 0, 13, `
- 0 Alpha
	* 6 1st new child #0+1
	+ 1 Beta
	- 2 Kappa
		* 2.1 2nd new child #0+1
	* 3 Lambda`);

		Then.onAnyPage.checkLog();
	};
});
