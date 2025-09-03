/* global QUnit */

sap.ui.define([
	"sap/ui/integration/util/CardMerger"
], (
	CardMerger
) => {
	"use strict";

	QUnit.module("CardMerger - extractChildCardChanges");

	QUnit.test("single change for given child card", function (assert) {
		const oChildCardChanges = {
			"/sap.card/header/title": "New Title"
		};
		const aManifestChanges = [
			{
				"/sap.card/configuration/childCards/childCard1/_manifestChanges": oChildCardChanges
			}
		];

		assert.deepEqual(CardMerger.extractChildCardChanges(aManifestChanges, "childCard1"), [oChildCardChanges], "Child card changes should be extracted");
	});

	QUnit.test("many changes for given child card", function (assert) {
		const oChildChange1 = {
			"/sap.card/header/title": "New Title"
		};
		const oChildChange2 = {
			"/sap.card/configuration/parameters/param1/value": "new value"
		};
		const oChildChange3 = {
			"/sap.card/header/title": "New Header Title"
		};
		const aManifestChanges = [
			{
				"/sap.card/configuration/childCards/childCard1/_manifestChanges": oChildChange1
			},
			{
				"/sap.card/configuration/childCards/childCard1/_manifestChanges": oChildChange2
			},
			{
				"/sap.card/configuration/childCards/childCard1/_manifestChanges": oChildChange3
			}
		];
		const aExpectedChanges = [oChildChange1, oChildChange2, oChildChange3];

		assert.deepEqual(CardMerger.extractChildCardChanges(aManifestChanges, "childCard1"), aExpectedChanges, "Child card changes should be extracted");
	});

	QUnit.test("no child card changes", function (assert) {
		const aManifestChanges = [
			{
				"/sap.card/header/title": "New Title",
				"/sap.card/header/subtitle": "New Subtitle"
			},
			{
				"/sap.card/configuration/parameters/param1/value": "new value"
			}
		];

		assert.deepEqual(CardMerger.extractChildCardChanges([], "childCard1"), [], "No child card changes should be extracted");
		assert.deepEqual(CardMerger.extractChildCardChanges(aManifestChanges, "childCard1"), [], "No child card changes should be extracted");
	});

	QUnit.test("no child card changes for the given card", function (assert) {
		const aManifestChanges = [
			{
				"/sap.card/configuration/childCards/anotherChildCard/_manifestChanges": {
					"/sap.card/header/title": "New Title"
				}
			}
		];

		assert.deepEqual(CardMerger.extractChildCardChanges(aManifestChanges, "someChildCard"), [], "No child card changes should be extracted");
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
