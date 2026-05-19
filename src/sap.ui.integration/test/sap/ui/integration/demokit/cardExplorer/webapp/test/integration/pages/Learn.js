sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
], (Opa5, Properties) => {
	"use strict";

	const sViewName = "LearnDetail";

	function getTopicIFrame() {
		const oFrame = Opa5.getWindow().document.querySelector(".sapUiTopicsIframe");

		if (oFrame?.contentWindow && oFrame.contentDocument?.readyState === "complete") {
			return oFrame;
		}

		return null;
	}

	Opa5.createPageObjects({
		onTheLearnPage: {

			assertions: {
				iShouldSeeSampleTitle(sTitle) {
					return this.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Title",

						matchers: new Properties({text: sTitle}),
						success() {
							Opa5.assert.ok(true, "The navigation ended on the correct topic: " + sTitle);
						},
						errorMessage: "The navigation isn't ended on the correct topic: " + sTitle
					});
				},

				iShouldSeeOpacityRestored() {
					return this.waitFor({
						check() {
							const oFrame = getTopicIFrame();

							return oFrame && oFrame.contentDocument.documentElement.style.opacity === "1";
						},
						success() {
							Opa5.assert.ok(true, "Opacity was restored to 1 after boot completed");
						},
						errorMessage: "Opacity was not restored after topic page loaded"
					});
				},

				iShouldSeeHighlightJs() {
					return this.waitFor({
						check() {
							const oFrame = getTopicIFrame();

							return oFrame && oFrame.contentWindow.hljs;
						},
						success() {
							Opa5.assert.ok(true, "highlight.js (window.hljs) is available in the iframe");
						},
						errorMessage: "highlight.js was not loaded in the topic iframe"
					});
				},

				iShouldSeeCodesample() {
					return this.waitFor({
						check() {
							const oFrame = getTopicIFrame();

							return oFrame && typeof oFrame.contentWindow.codesample === "function";
						},
						success() {
							Opa5.assert.ok(true, "codesample function is available in the iframe");
						},
						errorMessage: "codesample.js was not loaded in the topic iframe"
					});
				},

				iShouldSeeResolveTargetRoot() {
					return this.waitFor({
						check() {
							const oFrame = getTopicIFrame();

							return oFrame && typeof oFrame.contentWindow.resolveTargetRoot === "function";
						},
						success() {
							Opa5.assert.ok(true, "resolveTargetRoot is available in the iframe");
						},
						errorMessage: "resolveTargetRoot was not exposed on the iframe window"
					});
				},

				iShouldSeeResolveTargetRootResult(sPathname, sOrigin, sExpected, sDescription) {
					return this.waitFor({
						check() {
							return !!getTopicIFrame();
						},
						success() {
							const fnResolve = getTopicIFrame().contentWindow.resolveTargetRoot;
							Opa5.assert.strictEqual(fnResolve(sPathname, sOrigin), sExpected, sDescription);
						},
						errorMessage: "Topic iframe was not ready for resolveTargetRoot assertion"
					});
				},

				iShouldSeeTopicStylesheets() {
					return this.waitFor({
						check() {
							const oFrame = getTopicIFrame();

							if (!oFrame) {
								return false;
							}

							const oHead = oFrame.contentDocument.head;

							return !!oHead.querySelector('link[href*="codesample.css"]')
								&& !!oHead.querySelector('link[href*="topic.css"]')
								&& !!oHead.querySelector('link[href*="highlight.js/styles.css"]');
						},
						success() {
							Opa5.assert.ok(true, "All expected stylesheets are loaded in the iframe");
						},
						errorMessage: "Not all expected stylesheets were found in the iframe head"
					});
				}
			}
		}
	});
});
