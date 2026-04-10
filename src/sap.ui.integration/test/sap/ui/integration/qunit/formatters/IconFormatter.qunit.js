/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/integration/formatters/IconFormatter",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/Manifest"
],
function (
	IconFormatter,
	Card,
	Manifest
) {
	"use strict";

	var APP_ID = "test.app.id";
	var APP_URL = "my/app/url";

	QUnit.module("IconFormatter", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oCard._oCardManifest = new Manifest("sap.card", {
				"_version": "2.0.0",

				"sap.app": {
					"id": APP_ID
				}
			});
			this.oIconFormatter = new IconFormatter({
				card: this.oCard
			});

			sinon.stub(sap.ui.require, "toUrl")
				.withArgs(sinon.match(/^test\/app\/id/))
				.callsFake(function (sPath) {
					return APP_URL + sPath.substr(APP_ID.length);
				});
		},
		afterEach: function () {
			this.oIconFormatter.destroy();
			this.oIconFormatter = null;
			this.oCard.destroy();
			sap.ui.require.toUrl.restore();
		}
	});

	QUnit.test("Resolve icon src", function (assert) {
		var aSamples = [
				null,
				"",
				" ",
				"my/image.png",
				"./my/image.png",
				"../my/image.png",
				"/my/image.png",
				"http://my/image.png",
				"sap-icon://accept",
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
			],
			aExpected = [
				null,
				"",
				" ",
				sap.ui.require.toUrl("test/app/id/my/image.png"),
				sap.ui.require.toUrl("test/app/id/./my/image.png"),
				sap.ui.require.toUrl("test/app/id/../my/image.png"),
				"/my/image.png",
				"http://my/image.png",
				"sap-icon://accept",
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
			];


		aSamples.forEach(function (sSample, iInd) {
			var sSrc = this.oIconFormatter.formatSrc(sSample),
				sExpected = aExpected[iInd];

			assert.strictEqual(sSrc, sExpected, `The image src is as expected for '${sSample}'.`);
		}.bind(this));
	});

	QUnit.test("Absolute URL", function (assert) {
		var sImageSrc = "http://my/image.png",
			sSrc = this.oIconFormatter.formatSrc(sImageSrc);

		assert.strictEqual(sSrc, sImageSrc, "The image src is as expected.");
	});

	QUnit.test("Relative URL", function (assert) {
		var sImageSrc = "./relative/path/image.png",
			sSrc = this.oIconFormatter.formatSrc(sImageSrc);

		assert.strictEqual(sSrc, APP_URL + "/" + sImageSrc, "The image src is as expected.");
	});

	QUnit.test("Empty sap-icon URI returns empty string", function (assert) {
		const sSrc = this.oIconFormatter.formatSrc("sap-icon://");

		assert.strictEqual(sSrc, "", "Empty sap-icon:// URI returns empty string to avoid incorrect thumbnail sizing.");
	});

	QUnit.test("Invalid icon names return empty string", function (assert) {
		const aInvalidIcons = [
			"invalidIconName",
			"icon",
			"MyIcon",
			"icon_name",
			"icon-name"
		];

		aInvalidIcons.forEach(function (sInvalidIcon) {
			const sSrc = this.oIconFormatter.formatSrc(sInvalidIcon);
			assert.strictEqual(sSrc, "", `Invalid icon name '${sInvalidIcon}' returns empty string.`);
		}.bind(this));
	});

	QUnit.test("Valid icon patterns are not affected", function (assert) {
		const aValidPatterns = [
			{ input: "icon/name.png", expected: APP_URL + "/icon/name.png" },
			{ input: "icon.png", expected: APP_URL + "/icon.png" },
			{ input: "https://example.com/icon", expected: "https://example.com/icon" },
			{ input: "http://example.com/icon", expected: "http://example.com/icon" }
		];

		aValidPatterns.forEach(function (oPattern) {
			const sSrc = this.oIconFormatter.formatSrc(oPattern.input);
			assert.strictEqual(sSrc, oPattern.expected, `Valid pattern '${oPattern.input}' is correctly resolved.`);
		}.bind(this));
	});
});
