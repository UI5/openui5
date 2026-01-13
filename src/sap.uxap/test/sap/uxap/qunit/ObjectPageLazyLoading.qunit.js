/*global QUnit, */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel",
	"sap/m/Title",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection"
], async function(
	Element,
	nextUIUpdate,
	jQuery,
	JSONModel,
	Title,
	ObjectPageDynamicHeaderTitle,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection
) {
	"use strict";

	var oConfigModel = new JSONModel();
	await oConfigModel.loadData("test-resources/sap/uxap/qunit/model/ObjectPageConfig.json");

	QUnit.module("ObjectPageAfterRendering");

	QUnit.test("triggering visible subsections calculations should not fail before rendering", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({
			enableLazyLoading: true,
			sections: new ObjectPageSection("mySection1", {
				subSections: [
					new ObjectPageSubSection({
						title: "Title",
						blocks: [new Title({text: "test"})]
					})
				]
			}),
			selectedSection: "mySection1"
		});
		oObjectPageLayout._triggerVisibleSubSectionsEvents();
		assert.ok("passes before rendering (noop)");
		oObjectPageLayout.destroy();
	});

	QUnit.test("BCP: 1870326083 - _triggerVisibleSubSectionsEvents should force OP to recalculate", async function(assert) {
		// Arrange
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout");

		// We have to render the OP as LazyLoading is initiated on onBeforeRendering
		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act - call the method
		oObjectPageLayout._oLazyLoading._triggerVisibleSubSectionsEvents();

		// Assert
		assert.strictEqual(oRequestAdjustLayoutSpy.callCount, 1,
			"Method should be called from _triggerVisibleSubSectionsEvents");

		assert.ok(oRequestAdjustLayoutSpy.calledWith(true),
			"Method should be called with 'true' as a parameter for immediate execution");

		// Clean
		oObjectPageLayout.destroy();
	});

	QUnit.test("Early lazyLoading onAfterRendering", async function(assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			iExpectedLazyLoadingDelay,
			spy,
			that = this,
			done = assert.async();

		assert.expect(1);

		// Arrange: enable early lazy loading
		oObjectPage._triggerVisibleSubSectionsEvents();
		iExpectedLazyLoadingDelay = 0; // expect very small delay

		oObjectPage.addEventDelegate({
			"onBeforeRendering": function() {
				spy = that.spy(oObjectPage._oLazyLoading, "lazyLoadDuringScroll");
			},
			"onAfterRendering": function() {
				setTimeout(function() {
					// Check:
					assert.strictEqual(spy.callCount, 1, "lazy loading is called early");
					oObjectPage.destroy();
					done();
				}, iExpectedLazyLoadingDelay);
			}
		}, this);

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Early lazyLoading onAfterRendering if already scheduled", async function(assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			that = this,
			spy,
			done = assert.async();

		assert.expect(1);

		oObjectPage.addEventDelegate({
			"onBeforeRendering": function() {
				spy = that.spy(oObjectPage._oLazyLoading, "doLazyLoading");
			},
			"onAfterRendering": function() {
				oObjectPage._triggerVisibleSubSectionsEvents();
				// Arrange: reset any earlier recorded calls
				spy.resetHistory();
			}
		}, this);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				// Check:
				assert.strictEqual(spy.callCount, 1, "lazy loading is called early");
				oObjectPage.destroy();
				done();
		});

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Early lazyLoading onAfterRendering when hidden", async function(assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			iExpectedLazyLoadingDelay,
			recalcSpy = this.spy(oObjectPage, "_requestAdjustLayout"),
			lazyLoadingSpy,
			that = this,
			done = assert.async();

		assert.expect(2);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

				oObjectPage.addEventDelegate({
					"onBeforeRendering": function() {
						lazyLoadingSpy = that.spy(oObjectPage._oLazyLoading, "doLazyLoading");
					},
					"onAfterRendering": function() {

						setTimeout(function() {

							// restore visibility
							window["qunit-fixture"].style.display = "";
							recalcSpy.resetHistory();
							lazyLoadingSpy.resetHistory();
							// call the resize listener explicitly in the test to avoid waiting for the ResizeHandler to react (would introduce extra delay in the test)
							oObjectPage._onUpdateScreenSize({
								size: {
									width: 100,
									height: 300
								},
								oldSize: {
									height: 0
								}
							});
							setTimeout(function() {
								// Check:
								assert.strictEqual(lazyLoadingSpy.callCount, 1, "lazy loading is called early");
								assert.strictEqual(recalcSpy.callCount, 1, "layout adjustment is called early");
								oObjectPage.destroy();
								done();
							}, iExpectedLazyLoadingDelay);
						}, 0);

					}
				}, this);

				// Arrange:
				// we are interested in (1) subseqeuent (i.e. non-first) rendering (2) while the page is hidden child
				oObjectPage._triggerVisibleSubSectionsEvents(); // enable early lazy loading
				iExpectedLazyLoadingDelay = 0; // expect very small delay
				window["qunit-fixture"].style.display = "none";
				oObjectPage.invalidate();




		});

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Sections are lazy loaded when header content is pinned initially", async function(assert) {
		// Arrange
		var oObjectPageLayout = new ObjectPageLayout({
				enableLazyLoading: true,
				headerContentPinned: true,
				headerTitle: [new ObjectPageDynamicHeaderTitle()]
			}),
			fnDone = assert.async(),
			fnOnBeforeRendering = function () {
				oObjectPageLayout.removeEventDelegate(fnOnBeforeRendering);
				oLazyLoadingSpy = this.spy(oObjectPageLayout._oLazyLoading, "doLazyLoading");
			}.bind(this),
			oLazyLoadingSpy;

		assert.expect(1);

		// Setup: mock framework call on before rendering
		oObjectPageLayout.addEventDelegate({
			"onBeforeRendering": fnOnBeforeRendering
		});

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady",
			function () {
				// Assert
				assert.ok(oLazyLoadingSpy.calledOnce, "LazyLoading is called");

				// Clean up
				oObjectPageLayout.destroy();
				fnDone();
			}
		);

		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();
	});


	QUnit.module("Lifecycle");

	QUnit.test("lazyLoading created on beforeRendering", function (assert) {
		// Setup
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});

		// Act: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Check
		assert.ok(oObjectPageLayout._oLazyLoading , "lazy loading created");
	});

	QUnit.test("lazyLoading interval task", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			oLazyLoading,
			oLazyLoadingSpy,
			done = assert.async();

		assert.expect(1);

		// Setup: mock function result onBeforeRendering
		this.stub(oObjectPageLayout, "_getHeightRelatedParameters").callsFake(function() {
			// return value is not important for this test
			return {};
		});

		// Setup: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Setup: spy for repeated calls of <code>doLazyLoading</code>
		oLazyLoading = oObjectPageLayout._oLazyLoading;
		oLazyLoadingSpy = this.spy(oLazyLoading, "doLazyLoading");

		// Act: trigger lazyLoading
		oLazyLoading.doLazyLoading(); // mock initial trigger from objectPage
		oLazyLoadingSpy.resetHistory(); // ensure we monitor only calls from this point on

		// Check
		setTimeout(function() {
			assert.strictEqual(oLazyLoadingSpy.callCount, 0 , "lazy loading is not called for unstashing an extra SubSection");
			done();
			oObjectPageLayout.destroy();
		}, 1000);
	});

	QUnit.test("lazyLoading interval task cancelled when not needed", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			oLazyLoading,
			oLazyLoadingSpy,
			done = assert.async();

		assert.expect(1);

		// Setup: mock function result onBeforeRendering
		this.stub(oObjectPageLayout, "_getHeightRelatedParameters").callsFake(function() {
			// return value is not important for this test
			return {};
		});

		// Setup: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Setup: spy for repeated calls of <code>doLazyLoading</code>
		oLazyLoading = oObjectPageLayout._oLazyLoading;
		oLazyLoadingSpy = this.spy(oLazyLoading, "doLazyLoading");
		oLazyLoading.doLazyLoading(); // mock initial call from objectPage
		oLazyLoadingSpy.resetHistory(); // ensure we monitor only calls from this point on

		// Act
		oLazyLoading.destroy();

		// Check
		setTimeout(function() {
			assert.strictEqual(oLazyLoadingSpy.callCount, 0 , "lazy loading called no mpore");
			done();
			oObjectPageLayout.destroy();
		}, oLazyLoading.LAZY_LOADING_EXTRA_SUBSECTION);
	});

	QUnit.test("lazyLoading called when content size is updated", async function (assert) {
		// Setup
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			fnDone = assert.async(),
			oSpy;
		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		oSpy = this.spy(oObjectPageLayout._oLazyLoading, "doLazyLoading");

		// Act: call _onUpdateContentSize (when content is updated)
		oObjectPageLayout._onUpdateContentSize({
			size: {
				height: 1000,
				width: 600
			}
		});

		// Check
		assert.ok(oSpy.callCount, 1, "lazy loading is called after content update");
		fnDone();
	});

	QUnit.test("doLazyLoading called with scroll top parameter from lazyLoadingDuringScroll", async function (assert) {
		// Setup
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			fnDone = assert.async(),
			oSpy;

		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			oSpy = this.spy(oObjectPageLayout._oLazyLoading, "doLazyLoading");

			// Act: simulate calling lazyLoadDuringScroll upon native scroll event
			oObjectPageLayout._oLazyLoading.lazyLoadDuringScroll(false, 1000);

			// Check
			setTimeout(function () {
				// Assert
				assert.ok(oSpy.calledWith(1000),  "scroll top parameter is passed to doLazyLoading");

				// Clean up
				fnDone();
			}, 400);
		}.bind(this));
	});

	QUnit.test("_unStashControlsAsync preserves control order with different resolution times", function (assert) {
		// Setup
		var fnDone = assert.async(),
			oSubSection = new ObjectPageSubSection("testSubSection" + jQuery.now()),
			aUnstashedControls = [], // Array to track controls in the order they were unstashed
			aFinalBlockIds = [], // Array to track the final order of blocks in the aggregation
			oAddAggregationSpy;

		// Create mock stashed controls
		var oMockStashedControl1 = {
			getId: function() { return "control1"; },
			unstash: function() {
				// Mock the first control to unstash LAST (slowest)
				return new Promise(function(resolve) {
					setTimeout(function() {
						var oUnstashedControl = new Title({text: "Control 1", id: "control1"});
						aUnstashedControls.push("control1");
						resolve(oUnstashedControl);
					}, 30);
				});
			},
			isStashed: function() { return true; }
		};

		var oMockStashedControl2 = {
			getId: function() { return "control2"; },
			unstash: function() {
				// Mock the second control to unstash SECOND
				return new Promise(function(resolve) {
					setTimeout(function() {
						var oUnstashedControl = new Title({text: "Control 2", id: "control2"});
						aUnstashedControls.push("control2");
						resolve(oUnstashedControl);
					}, 20);
				});
			},
			isStashed: function() { return true; }
		};

		var oMockStashedControl3 = {
			getId: function() { return "control3"; },
			unstash: function() {
				// Mock the third control to unstash FIRST (fastest)
				return new Promise(function(resolve) {
					setTimeout(function() {
						var oUnstashedControl = new Title({text: "Control 3", id: "control3"});
						aUnstashedControls.push("control3");
						resolve(oUnstashedControl);
					}, 10);
				});
			},
			isStashed: function() { return true; }
		};

		// Setup the SubSection with stashed controls in the expected order
		oSubSection._aStashedControls = [
			{aggregationName: "blocks", control: oMockStashedControl1},
			{aggregationName: "blocks", control: oMockStashedControl2},
			{aggregationName: "blocks", control: oMockStashedControl3}
		];

		// Spy on addAggregation to verify the implementation
		oAddAggregationSpy = this.spy(oSubSection, "addAggregation");

		// Override getElementById to return our unstashed controls
		this.stub(Element, "getElementById").callsFake(function(sId) {
			if (sId === "control1") { return Element.getElementById("control1"); }
			if (sId === "control2") { return Element.getElementById("control2"); }
			if (sId === "control3") { return Element.getElementById("control3"); }
			return null;
		});

		// Act: Call the actual _unStashControlsAsync method
		oSubSection._unStashControlsAsync().then(function() {
			// Get the final order of blocks in the aggregation
			oSubSection.getBlocks().forEach(function(oBlock) {
				aFinalBlockIds.push(oBlock.getId());
			});

			// Assert

			// Verify unstashing happened in the reverse order (control3, control2, control1)
			// This proves our mocking worked correctly
			assert.strictEqual(aUnstashedControls.length, 3, "Three controls were unstashed");
			assert.strictEqual(aUnstashedControls[0], "control3", "Control 3 was unstashed first");
			assert.strictEqual(aUnstashedControls[1], "control2", "Control 2 was unstashed second");
			assert.strictEqual(aUnstashedControls[2], "control1", "Control 1 was unstashed last");

			// Verify addAggregation was called for each control
			assert.strictEqual(oAddAggregationSpy.callCount, 3, "addAggregation called three times");

			// Most importantly - verify the final order of blocks matches the original definition
			// despite being unstashed in reverse order
			assert.deepEqual(aFinalBlockIds, ["control1", "control2", "control3"],
				"Final order of blocks matches original definition");

			// Clean up
			oSubSection.destroy();
			fnDone();
		});
	});
});
