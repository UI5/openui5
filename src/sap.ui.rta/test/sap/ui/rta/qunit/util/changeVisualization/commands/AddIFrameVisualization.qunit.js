/* global QUnit */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/commands/AddIFrameVisualization",
	"sap/ui/core/Lib"
], function(
	AddIFrameVisualization,
	Lib
) {
	"use strict";

	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	QUnit.module("Base tests", {}, function() {
		QUnit.test("when a payload with a wrapped { raw } URL is passed", function(assert) {
			// The URL contains a UI5 binding placeholder on purpose: the
			// wrapping is what keeps it from being resolved against a model,
			// and the visualization must show the exact authored string.
			const sUrl = "embed/content?category={Product/Category}";
			const mDescription = AddIFrameVisualization.getDescription({ url: { raw: sUrl } });
			const sExpected = oResourceBundle.getText(
				"TXT_CHANGEVISUALIZATION_CHANGE_ADDIFRAME_WITH_URL",
				[sUrl]
			);
			assert.strictEqual(
				mDescription.descriptionText,
				sExpected,
				"then the text contains the exact URL, with the binding placeholder untouched"
			);
			assert.strictEqual(
				mDescription.descriptionTooltip,
				sExpected,
				"then the tooltip contains the exact URL, with the binding placeholder untouched"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
