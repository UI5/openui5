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
		function checkTable(sComment, iExpectedFirstVisibleRow, iExpectedCount, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected, /*bCheckName*/true,
				/*bCheckAge*/false, iExpectedFirstVisibleRow, iExpectedCount);
		}

		function copyAsLastChildOf(sId, sParent) {
			When.onTheMainPage.copyAsLastChildOf(sId, sParent);
		}

		function copyAsLastRoot(sId) {
			When.onTheMainPage.copyAsLastRoot(sId);
		}

		function copyJustBeforeSibling(sId, sSibling) {
			When.onTheMainPage.copyJustBeforeSibling(sId, sSibling);
		}

		function copyToParent(sId, sParent) {
			When.onTheMainPage.copyToParent(sId, sParent);
		}

		function copyToRoot(sId) {
			When.onTheMainPage.copyToRoot(sId);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "3");
		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount", "6");

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("Initial state", 0, 24, `
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma
		+ 1.2 Zeta
	* 2 Kappa
	* 3 Lambda`);

		copyToParent("1", "2");
		checkTable("After copy '1' to '2'", 0, 32, `
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma
		+ 1.2 Zeta
	- 2 Kappa
		+ A Copy of 1 (Beta)`);

		copyToRoot("1.1");
		checkTable("After copy '1.1' to root", 0, 35, `
- B Copy of 1.1 (Gamma)
	* B.1 Copy of 1.1.1 (Delta)
	* B.2 Copy of 1.1.2 (Epsilon)
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma`);

		copyAsLastChildOf("1.1", "B");
		checkTable("After copy '1.1' as last child of 'B'", 0, 38, `
- B Copy of 1.1 (Gamma)
	* B.1 Copy of 1.1.1 (Delta)
	* B.2 Copy of 1.1.2 (Epsilon)
	- C Copy of 1.1 (Gamma)
		* C.1 Copy of 1.1.1 (Delta)
		* C.2 Copy of 1.1.2 (Epsilon)`);

		copyJustBeforeSibling("C.1", "B.1");
		checkTable("After copy 'C.1' just before sibling 'B.1'", 0, 39, `
- B Copy of 1.1 (Gamma)
	* D Copy of C.1 (Copy of 1.1.1 (Delta))
	* B.1 Copy of 1.1.1 (Delta)
	* B.2 Copy of 1.1.2 (Epsilon)
	- C Copy of 1.1 (Gamma)
		* C.1 Copy of 1.1.1 (Delta)`);

		copyAsLastRoot("C");
		checkTable("After copy 'C' as last root", 15, 42, `
		* 4.1 Nu
	- 5 Xi
		+ 5.1 Omicron
- E Copy of C (Copy of 1.1 (Gamma))
	* E.1 Copy of C.1 (Copy of 1.1.1 (Delta))
	* E.2 Copy of C.2 (Copy of 1.1.2 (Epsilon))`);
	};
});
