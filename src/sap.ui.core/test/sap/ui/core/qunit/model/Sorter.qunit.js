/* global  QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/model/Sorter"
], function(Localization, Sorter) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

	QUnit.module("sap.ui.model.Sorter", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			Localization.setLanguage("en-US");
		},

		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare with language tag", function (assert) {
		var oLocalizationMock = this.mock(Localization);

		oLocalizationMock.expects("getLanguageTag").withExactArgs().returns("foo");
		this.mock(String.prototype).expects("localeCompare")
			.withExactArgs("~b", "foo")
			.on("~a")
			.returns("bar");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("~a", "~b"), "bar");

		// Otherwise, the call in "afterEach" leads to an error.
		oLocalizationMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare for different locales", function (assert) {
		Localization.setLanguage("de");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("ä", "z"), -1);

		Localization.setLanguage("sv");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("ä", "z"), 1);
	});

	//*********************************************************************************************
	QUnit.test("getPath, isDescending", function (assert) {
		const oSorter = new Sorter("~path", "~descending");

		// code under test
		assert.strictEqual(oSorter.getPath(), "~path");

		// code under test
		assert.strictEqual(oSorter.isDescending(), "~descending");
	});

	//*********************************************************************************************
	QUnit.test("group paths", function (assert) {
		const aGroupPaths = ["~groupPaths"];

		// code under test - constructor with object parameter and group paths
		let oSorter = new Sorter({groupPaths: aGroupPaths, path: "~path"});

		assert.deepEqual(oSorter.aGroupPaths, aGroupPaths);
		assert.notStrictEqual(oSorter.aGroupPaths, aGroupPaths);

		// code under test
		const aGroupPathsResult = oSorter.getGroupPaths();

		assert.deepEqual(aGroupPathsResult, aGroupPaths);
		assert.notStrictEqual(aGroupPathsResult, oSorter.aGroupPaths);

		// code under test - constructor with object parameter, no group paths
		oSorter = new Sorter({path: "~path"});

		assert.strictEqual(oSorter.aGroupPaths, undefined);

		// code under test
		assert.strictEqual(oSorter.getGroupPaths(), undefined);

		// code under test - constructor with single parameters
		oSorter = new Sorter("~path");

		assert.strictEqual(oSorter.aGroupPaths, undefined);

		// code under test
		assert.strictEqual(oSorter.getGroupPaths(), undefined);
	});
});
