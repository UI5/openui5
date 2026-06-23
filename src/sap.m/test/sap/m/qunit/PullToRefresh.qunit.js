/*global QUnit */
sap.ui.define([
	"sap/m/App",
	"sap/m/library",
	"sap/m/List",
	"sap/m/Page",
	"sap/m/PullToRefresh",
	"sap/m/StandardListItem",
	"sap/ui/core/Lib",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], async function(App, mobileLibrary, List, Page, PullToRefresh, StandardListItem, Library, nextUIUpdate, jQuery) {
	"use strict";

	// shortcut for sap.m.ListType
	const {ListType} = mobileLibrary;

	function addItems(list, nItems) {
		const n = list.getItems().length + 1;
		for (let i = 0; i < nItems; i++) {
			list.addItem(
				new StandardListItem({
					title: "List item " + (n + i),
					type: ListType.Navigation
				})
			);
		}
	}

	const oRb = Library.getResourceBundleFor("sap.m");
	const oApp = new App("p2RApp", {initialPage:"page1"});

	const sPullDwn = oRb.getText("PULL2REFRESH_PULLDOWN");
	const sRelease = oRb.getText("PULL2REFRESH_RELEASE");
	const sRefresh = "refreshing";
	const sLoading = oRb.getText("PULL2REFRESH_LOADING");
	const sDescription = "pull to refresh";

	const oList = new List("oList", {inset : false});
	addItems(oList, 15);

	const oP2R = new PullToRefresh({
		description: sDescription,
		refresh: function(){
			oP2R.setDescription(sRefresh);
		}
	});

	oP2R._bTouchMode = true;

	const oPage1 = new Page("page1", {
		title: "PullToRefresh Control",
		enableScrolling: true,
		content : [ oP2R, oList ]
	});

	oApp.addPage(oPage1);
	oApp.placeAt("qunit-fixture");

	await nextUIUpdate();

	QUnit.module("Properties");
	QUnit.test("Default property values are correct", function(assert) {
		assert.expect(3);
		assert.strictEqual(oP2R.getShowIcon(), false, "Default value for showIcon");
		assert.strictEqual(oP2R.getDescription(), sDescription, "Description value");
		assert.ok(!oP2R.getCustomIcon(), "Custom icon is not set");
	});

	QUnit.module("Check HTML");

	QUnit.test("Control is rendered with correct initial HTML structure", function(assert) {
		const $P2R = oP2R.$();
		const iScroller = oPage1.getScrollDelegate()._scroller;
		if (iScroller) { // this is executed when iScroll is used
			assert.expect(8);
			assert.ok($P2R.position().top + $P2R.height() - jQuery("#page1-intHeader").height() <= 0, "Control is hidden over the top of the parent container");
		} else {
			assert.expect(7);
		}
		assert.ok($P2R.length > 0, "Pull down control is rendered");
		assert.ok($P2R.children(".sapMPullDownCI").length === 0, "No custom logo is rendered initially");
		assert.ok(!$P2R.hasClass("sapMPullDownLogo"), "Standard logo is not shown");
		assert.strictEqual($P2R.children(".sapMPullDownText").text(), sPullDwn, "Pull down text is set correctly");
		assert.strictEqual($P2R.children(".sapMPullDownInfo").text(), sDescription, "Pull down description is set correctly");
		assert.ok(!($P2R.hasClass("sapMFlip")), "Arrow is not rotated");
		assert.ok(!($P2R.hasClass("sapLoading")), "Loading class is not set");
	});

	// Test pull to refresh functionality
	QUnit.module("Behavior");

	QUnit.test("Pulling down triggers refresh state and hiding restores initial state", function(assert) {
		const done = assert.async();
		const oSpy = this.spy();
		const iScroller = oPage1.getScrollDelegate()._scroller;

		if (iScroller) { // this is executed when iScroll is used
			assert.expect(14); // 13 + event
			let iTop = oList.$().offset().top + 20;
			const iLeft = 10;

			// Arrange
			oP2R.attachRefresh(oSpy);

			// Act: simulate touch start
			iScroller._start({
				type: "touchstart",
				touches : [{ pageX: iLeft, pageY: iTop, length: 1 }],
				pageX: iLeft,
				pageY: iTop
			});

			iTop = iTop + 250;

			// Act: simulate pull down gesture
			iScroller._move({ // Pull down
				type: "touchmove",
				touches : [{ pageX: iLeft, pageY: iTop, length: 1 }],
				pageX: iLeft,
				pageY: iTop
			});

			// Assert: state after pull
			assert.strictEqual(oP2R._iState, 1, "New state after pull should be 1 - release to refresh");
			const $P2R = oP2R.$();
			assert.ok($P2R.children(".sapMPullDownText").text() === sRelease, "Release text is set correctly");
			assert.ok($P2R.position().top >= 0, "Control is visible");
			assert.ok($P2R.hasClass("sapMFlip"), "Arrow is rotated");

			// Wait for iScroll animation to settle before releasing
			setTimeout(function() {
				iScroller._end({ // Release
					type: "touchend",
					touches : [{ pageX: iLeft, pageY: iTop, length: 1 }],
					pageX: iLeft,
					pageY: iTop
				});

				// Wait for iScroll to process the release and trigger refresh
				setTimeout(function() {
					assert.strictEqual(oSpy.callCount, 1, "Refresh event has been fired.");
					assert.strictEqual(oP2R._iState, 2, "New state after release should be 2 - loading");
					assert.ok($P2R.children(".sapMPullDownText").text() === sLoading, "Loading text is set");
					assert.strictEqual($P2R.children(".sapMPullDownInfo").text(), sRefresh, "Description is set");
					assert.ok($P2R.hasClass("sapMLoading"), "Loading css is set");
					oP2R.hide(); // Close
					oP2R.setDescription(sDescription);

					// Wait for iScroll hide animation to complete before asserting restored state
					setTimeout(function() {
						assert.strictEqual(oP2R._iState, 0, "New state after hide should be 0 - initial");
						assert.strictEqual($P2R.children(".sapMPullDownText").text(), sPullDwn, "Initial text is restored");
						assert.strictEqual($P2R.children(".sapMPullDownInfo").text(), sDescription, "Initial description is restored");
						assert.ok($P2R.position().top + $P2R.height() - jQuery("#page1-intHeader").height() <= 0, "Control is hidden over the top of the parent container");
						assert.ok(!($P2R.hasClass("sapMFlip")), "Arrow is not rotated");
						done();
					}, 1000);
				}, 1000);
			}, 1000);

		} else { // this is executed when iScroll is not used (= in mouse environments)  TODO: implement test once control is implemented
			assert.expect(0);
			done();
		}
	});
});
