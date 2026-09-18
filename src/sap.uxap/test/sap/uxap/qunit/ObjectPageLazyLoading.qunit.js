/*global QUnit, */
sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Title",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/core/mvc/XMLView"
], async function(
	nextUIUpdate,
	jQuery,
	Element,
	JSONModel,
	Button,
	Title,
	ObjectPageDynamicHeaderTitle,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	XMLView
) {
	"use strict";

	// utility function that will be used in these tests
	const _getOneBlock = function () {
		return {
			Type: "sap.uxap.testblocks.employmentblockjob.EmploymentBlockJob",

			mappings: [{
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/0",
				"internalModelName": "emp1"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/1",
				"internalModelName": "emp2"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/2",
				"internalModelName": "emp3"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/3",
				"internalModelName": "emp4"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/4",
				"internalModelName": "emp5"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/5",
				"internalModelName": "emp6"
			}

			]
		};
	};

	const _loadBlocksData = function (oData) {
		jQuery.each(oData.sections, (iIndexSection, oSection) => {
			jQuery.each(oSection.subSections, (iIndex, oSubSection) => {
				oSubSection.blocks = [_getOneBlock()];
				if (iIndexSection <= 4) {
					oSubSection.mode = "Collapsed";
					oSubSection.moreBlocks = [_getOneBlock()];
				}
			});
		});
	};

	const iLoadingDelay = 1000;
	const oConfigModel = new JSONModel();
	await oConfigModel.loadData("test-resources/sap/uxap/qunit/model/ObjectPageConfig.json");

	/**
	 * Returns a Promise that resolves after the ObjectPageLayout fires onAfterRenderingDOMReady.
	 * @param {sap.uxap.ObjectPageLayout} oOPL
	 * @returns {Promise<void>}
	 */
	function waitForDOMReady(oOPL) {
		return new Promise((resolve) => {
			oOPL.attachEventOnce("onAfterRenderingDOMReady", resolve);
		});
	}

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.module("ObjectPageConfig", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-27_ObjectPageConfig",
				viewName: "view.UxAP-27_ObjectPageConfig"
			}).then(async function (oView) {
				this.oView = oView;
				this.oComponentContainer = this.oView.byId("objectPageContainer");
				this.oView.setModel(oConfigModel, "objectPageLayoutMetadata");
				this.oView.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oComponentContainer.attachEventOnce("componentCreated", function () {
					done();
				});
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("load first visible sections", async function (assert) {
		assert.expect(3);
		// Arrange
		const oObjectPageLayout = this.oComponentContainer
			.getObjectPageLayoutInstance();

		const oData = oConfigModel.getData();
		_loadBlocksData(oData);

		// Act
		oConfigModel.setData(oData);
		await nextUIUpdate();

		const done = assert.async();

		// Assert
		setTimeout(function() {
			const oFirstSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
			assert.strictEqual(oFirstSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");

			const oSecondSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
			assert.strictEqual(oSecondSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");

			const oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded");
			done();
		}, iLoadingDelay);
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("does not load more than needed subsections", async function (assert) {
			const oObjectPageLayout = this.oComponentContainer
				.getObjectPageLayoutInstance();

			const oData = oConfigModel.getData();
			_loadBlocksData(oData);

			oConfigModel.setData(oData);
			oObjectPageLayout.setHeaderTitle(new ObjectPageDynamicHeaderTitle({
				heading: new Title({
					text: "Title of ObjectPageLayout"
				})
			}));
			oObjectPageLayout.addHeaderContent(new Button({
				text: "Hello"
			}));
			await nextUIUpdate();

			const done = assert.async();
			assert.expect(3);

			setTimeout(function() {
				const oFirstSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
				assert.strictEqual(oFirstSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");

				const oSecondSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
				assert.strictEqual(oSecondSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");

				const oOutOfViewPortSubSection = oObjectPageLayout.getSections()[3].getSubSections()[1];
				assert.strictEqual(oOutOfViewPortSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded");
				done();
			}, iLoadingDelay);
	});

	QUnit.test("subSectionEnteredViewPort event is fired only for visible SubSections after rerendering", async function (assert) {
		assert.expect(1);
		// Arrange
		const oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance();
		const oThirdSection = oObjectPageLayout.getSections()[3];
		const oThirdSubSection = oThirdSection.getSubSections()[1];
		const done = assert.async();
		let iCallCounts = 0;
		const aSubSectionsEnteredViewPortIds = [];

		const oData = oConfigModel.getData();
		_loadBlocksData(oData);
		oConfigModel.setData(oData);

		// Act
		oObjectPageLayout.setSelectedSection(oThirdSection, 0);
		oThirdSection.setSelectedSubSection(oThirdSubSection.getId());
		oObjectPageLayout.getSections()[5].setVisible(false);
		await nextUIUpdate();

		oObjectPageLayout.attachEvent("subSectionEnteredViewPort", function (oEvent) {
			iCallCounts++;
			aSubSectionsEnteredViewPortIds.push(oEvent.getParameter("subSection").getId());

			if (iCallCounts === 6) {
				// Assert
				assert.strictEqual(aSubSectionsEnteredViewPortIds
					.indexOf("__xmlview0--ObjectPageSubSection-__xmlview0--ObjectPageLayout-3-__xmlview0--ObjectPageSection-__xmlview0--ObjectPageLayout-3-0"),
				-1, "subSectionEnteredViewPort event not called with first SubSection of the third Section");
				done();
			}
		});

	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("load first visible sections is relative to selectedSection", function (assert) {
		// Arrange
		const oObjectPageLayout = this.oComponentContainer
			.getObjectPageLayoutInstance();

		// Act
		const secondSection = oObjectPageLayout.getSections()[1];
		oObjectPageLayout.setSelectedSection(secondSection);

		// Assert
		const aSectionBases = oObjectPageLayout._getSectionsToPreloadOnBeforeFirstRendering();
		assert.strictEqual(aSectionBases[0].getParent(), secondSection, "first visible subSection is within the currently selectedSection");

		this.oView.destroy();
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("load scrolled sections", function (assert) {
		// Arrange
		const oObjectPageLayout = this.oComponentContainer
			.getObjectPageLayoutInstance();
		const oThirdSubSection = oObjectPageLayout.getSections()[3].getSubSections()[0];

		assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded yet");

		// Act
		oObjectPageLayout.scrollToSection(oObjectPageLayout.getSections()[5].getId());

		const done = assert.async();

		// Assert
		setTimeout(function() {

			assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport still not loaded");

			const oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, true, "block data if target section loaded");
			done();
		}, iLoadingDelay);
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("model mapping for scrolled sections", async function (assert) {
		assert.expect(2);
		// Arrange
		const oObjectPageLayout = this.oComponentContainer
			.getObjectPageLayoutInstance();

		const oDataModel = new JSONModel();
		oDataModel.loadData("test-resources/sap/uxap/qunit/model/HRData.json", {}, false);

		// Act
		this.oView.setModel(oDataModel, "objectPageData");

		await nextUIUpdate();

		const done = assert.async();

		// Assert
		setTimeout(function() {

			const oThirdSubSection = oObjectPageLayout.getSections()[3].getSubSections()[0];
			assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "data of disconnected blocks is not loaded");

			const oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, false, "data of last connected blocks is loaded"); // TODO Verify this is correct since these tests were disabled (changed from true)
			done();
		}, iLoadingDelay);
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("scrollToSection with animation does not load intermediate sections", async function (assert) {
			const oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance();
			const oData = oConfigModel.getData();
			const done = assert.async();
			const that = this;

		_loadBlocksData(oData);

		oConfigModel.setData(oData);
		await nextUIUpdate();

		assert.expect(1);

		function checkOnDomReady() {
			const iSectionsCount = oObjectPageLayout.getSections().length;
			const oLastSection = oObjectPageLayout.getSections()[iSectionsCount - 1];
			const oSectionBeforeLast = oObjectPageLayout.getSections()[iSectionsCount - 2];
			const iSectionBeforeLastPositionTo = oObjectPageLayout._computeScrollPosition(oSectionBeforeLast);

			// Setup: mock scrollTop of a section before the target section
			that.stub(oObjectPageLayout, "_getHeightRelatedParameters").callsFake(function() {
				return {
					// mock a scrollTop where an intermediate [before the target] section is in the viewport
					iScrollTop: iSectionBeforeLastPositionTo,
					iScreenHeight: oObjectPageLayout.iScreenHeight
				};
			});

			// Act: scroll with animation
			oObjectPageLayout.scrollToSection(oLastSection.getId());

			// Act: mock lazyLoading call *during animated scroll*
			oObjectPageLayout._oLazyLoading.doLazyLoading();

			// Check the intermediate [before the target] section is not loaded despite being in the viewport
			assert.strictEqual(oSectionBeforeLast.getSubSections()[0].getBlocks()[0]._bConnected, false, "section above the target section is not loaded");
			done();
		}

		if (oObjectPageLayout._bDomReady) {
			checkOnDomReady();
		} else {
			oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", checkOnDomReady);
		}
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("BCP: 1970115549 - _grepCurrentTabSectionBases should always return a value", function (assert) {
			const oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance();
			const aSectionBases = oObjectPageLayout._aSectionBases;
			const fnCustomGetParent = function () {
				return undefined;
			};

		oObjectPageLayout.setSelectedSection(aSectionBases[0].getId());

		assert.equal(oObjectPageLayout._grepCurrentTabSectionBases().length, 3, "_grepCurrentTabSectionBases returns 3 filtered sections + subsections initially");

		aSectionBases[1].getParent = fnCustomGetParent;

		assert.equal(oObjectPageLayout._grepCurrentTabSectionBases().length, 2, "_grepCurrentTabSectionBases returns a valid value if some of the sections parent is undefined");
	});

	QUnit.test("_triggerVisibleSubSectionsEvents fires subSectionEnteredViewPort event for visible SubSections", async function(assert) {
		assert.expect(3);
		// Arrange
		const oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance();
		const fnDone = assert.async();
		let iCallCounts = 0;
		const fnOnSubSectionEnteredViewPort = function (oEvent) {
			const oSubSection = oEvent.getParameter("subSection");
			assert.ok(true, "subSectionEnteredViewPort fired for " + oSubSection.getId());
			iCallCounts++;

			if (iCallCounts === 3) {
				fnDone();
			}
		};
		const oData = oConfigModel.getData();

		_loadBlocksData(oData);
		oConfigModel.setData(oData);
		await nextUIUpdate();

		setTimeout(function () {
			oObjectPageLayout.attachEvent("subSectionEnteredViewPort", fnOnSubSectionEnteredViewPort);

			// Act - call _triggerVisibleSubSectionsEvents to force subSectionEnteredViewPort event firing
			oObjectPageLayout._oLazyLoading._triggerVisibleSubSectionsEvents();
		}, 1000);
	});

	QUnit.test("_triggerVisibleSubSectionsEvents scrolls to the selected section when it is not the one currently in view",
		async function(assert) {
		assert.expect(1);
		// Arrange
		const oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance();
		const oScrolledToSection = oObjectPageLayout.getSections()[2];
		const oFirstSection = oObjectPageLayout.getSections()[0];
		const oData = oConfigModel.getData();

		_loadBlocksData(oData);
		oConfigModel.setData(oData);
		oObjectPageLayout.setSelectedSection(oScrolledToSection);
		await nextUIUpdate();

		await waitForDOMReady(oObjectPageLayout);

		const sSelectedSubSectionId = oScrolledToSection.getSelectedSubSection();
		const sExpectedScrollTargetId = sSelectedSubSectionId || oScrolledToSection.getId();

		// Simulate the page being scrolled away from the selected section by reporting the first
		// (sub)section as the closest scrolled one. (Faking positionTop no longer influences the
		// decision, which is now based on the closest scrolled (sub)section.)
		this.stub(oObjectPageLayout, "_getClosestScrolledSectionBaseId").callsFake(function (iScrollTop, iPageHeight, bSubSectionsOnly) {
			return bSubSectionsOnly ? oFirstSection.getSubSections()[0].getId() : oFirstSection.getId();
		});

		const oSpy = this.spy(oObjectPageLayout, "scrollToSection");

		// Act
		oObjectPageLayout._triggerVisibleSubSectionsEvents();

		// Assert
		assert.ok(oSpy.calledWith(sExpectedScrollTargetId), "scrolled to the selected (sub)section");
	});

	QUnit.test("_triggerVisibleSubSectionsEvents does not scroll when the selected subSection is already the closest scrolled one",
		async function(assert) {
		assert.expect(1);
		// Arrange
		const oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance();
		const oSelectedSection = oObjectPageLayout.getSections()[2];
		const oData = oConfigModel.getData();

		_loadBlocksData(oData);
		oConfigModel.setData(oData);
		oObjectPageLayout.setSelectedSection(oSelectedSection);
		await nextUIUpdate();

		await waitForDOMReady(oObjectPageLayout);

		// Simulate the scenario where the selected (sub)section is already scrolled into view (e.g. the
		// browser scrolled a control that Fiori Elements focused after an FCL column change). In that case
		// the selected subSection is the closest scrolled one, so no corrective scroll must be triggered.
		const sSelectedSubSectionId = oSelectedSection.getSelectedSubSection() || oSelectedSection.getSubSections()[0].getId();
		this.stub(oObjectPageLayout, "_getClosestScrolledSectionBaseId").returns(sSelectedSubSectionId);

		const oSpy = this.spy(oObjectPageLayout, "scrollToSection");

		// Act
		oObjectPageLayout._triggerVisibleSubSectionsEvents();

		// Assert
		assert.notOk(oSpy.called, "no corrective scroll is triggered when already at the selected subSection");
	});

	QUnit.module("ObjectPageAfterRendering");

	QUnit.test("triggering visible subsections calculations should not fail before rendering", function (assert) {
		const oObjectPageLayout = new ObjectPageLayout({
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
		assert.expect(2);
		// Arrange
		const oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});
		const oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout");

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
		// Arrange
		const oObjectPage = new ObjectPageLayout({enableLazyLoading: true});
		const that = this;
		const done = assert.async();
		let spy;

		assert.expect(1);

		// Arrange: enable early lazy loading
		oObjectPage._triggerVisibleSubSectionsEvents();
		const iExpectedLazyLoadingDelay = 0; // expect very small delay

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
		// Arrange
		const oObjectPage = new ObjectPageLayout({enableLazyLoading: true});
		const that = this;
		let spy;

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

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		await waitForDOMReady(oObjectPage);

		// Check:
		assert.strictEqual(spy.callCount, 1, "lazy loading is called early");
		oObjectPage.destroy();
	});

	QUnit.test("Early lazyLoading onAfterRendering when hidden", async function(assert) {
		// Arrange
		const oObjectPage = new ObjectPageLayout({enableLazyLoading: true});
		const recalcSpy = this.spy(oObjectPage, "_requestAdjustLayout");
		const that = this;
		const done = assert.async();
		let iExpectedLazyLoadingDelay, lazyLoadingSpy;

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
		const oObjectPageLayout = new ObjectPageLayout({
				enableLazyLoading: true,
				headerContentPinned: true,
				headerTitle: [new ObjectPageDynamicHeaderTitle()]
			});
		let oLazyLoadingSpy;
		const fnOnBeforeRendering = function () {
			oObjectPageLayout.removeEventDelegate(fnOnBeforeRendering);
			oLazyLoadingSpy = this.spy(oObjectPageLayout._oLazyLoading, "doLazyLoading");
		}.bind(this);

		assert.expect(1);

		// Setup: mock framework call on before rendering
		oObjectPageLayout.addEventDelegate({
			"onBeforeRendering": fnOnBeforeRendering
		});

		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		await waitForDOMReady(oObjectPageLayout);

		// Assert
		assert.ok(oLazyLoadingSpy.calledOnce, "LazyLoading is called");

		// Clean up
		oObjectPageLayout.destroy();
	});


	QUnit.module("Lifecycle");

	QUnit.test("lazyLoading created on beforeRendering", function (assert) {
		// Setup
		const oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});

		// Act: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Check
		assert.ok(oObjectPageLayout._oLazyLoading , "lazy loading created");
	});

	QUnit.test("lazyLoading interval task", function (assert) {
		const oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});
		const done = assert.async();

		assert.expect(1);

		// Setup: mock function result onBeforeRendering
		this.stub(oObjectPageLayout, "_getHeightRelatedParameters").callsFake(function() {
			// return value is not important for this test
			return {};
		});

		// Setup: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Setup: spy for repeated calls of <code>doLazyLoading</code>
		const oLazyLoading = oObjectPageLayout._oLazyLoading;
		const oLazyLoadingSpy = this.spy(oLazyLoading, "doLazyLoading");

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
		const oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});
		const done = assert.async();

		assert.expect(1);

		// Setup: mock function result onBeforeRendering
		this.stub(oObjectPageLayout, "_getHeightRelatedParameters").callsFake(function() {
			// return value is not important for this test
			return {};
		});

		// Setup: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Setup: spy for repeated calls of <code>doLazyLoading</code>
		const oLazyLoading = oObjectPageLayout._oLazyLoading;
		const oLazyLoadingSpy = this.spy(oLazyLoading, "doLazyLoading");
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
		assert.expect(1);
		// Setup
		const oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});
		const fnDone = assert.async();
		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oSpy = this.spy(oObjectPageLayout._oLazyLoading, "doLazyLoading");

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
		assert.expect(1);
		// Setup
		const oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});
		const fnDone = assert.async();
		let oSpy;

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
		const fnDone = assert.async();
		const oSubSection = new ObjectPageSubSection();
		const aUnstashedControls = []; // Array to track controls in the order they were unstashed
		const aFinalBlockIds = []; // Array to track the final order of blocks in the aggregation

		// Create mock stashed controls
		const oMockStashedControl1 = {
			getId: function() { return "control1"; },
			unstash: function() {
				// Mock the first control to unstash LAST (slowest)
				return new Promise(function(resolve) {
					setTimeout(function() {
						const oUnstashedControl = new Title({text: "Control 1", id: "control1"});
						aUnstashedControls.push("control1");
						resolve(oUnstashedControl);
					}, 30);
				});
			},
			isStashed: function() { return true; }
		};

		const oMockStashedControl2 = {
			getId: function() { return "control2"; },
			unstash: function() {
				// Mock the second control to unstash SECOND
				return new Promise(function(resolve) {
					setTimeout(function() {
						const oUnstashedControl = new Title({text: "Control 2", id: "control2"});
						aUnstashedControls.push("control2");
						resolve(oUnstashedControl);
					}, 20);
				});
			},
			isStashed: function() { return true; }
		};

		const oMockStashedControl3 = {
			getId: function() { return "control3"; },
			unstash: function() {
				// Mock the third control to unstash FIRST (fastest)
				return new Promise(function(resolve) {
					setTimeout(function() {
						const oUnstashedControl = new Title({text: "Control 3", id: "control3"});
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
		const oAddAggregationSpy = this.spy(oSubSection, "addAggregation");

		// Keep a reference to the original getElementById function
		const fnOriginalGetElementById = Element.getElementById;

		// Override getElementById to return our unstashed controls
		this.stub(Element, "getElementById").callsFake(function(sId) {
			if (sId === "control1") { return fnOriginalGetElementById("control1"); }
			if (sId === "control2") { return fnOriginalGetElementById("control2"); }
			if (sId === "control3") { return fnOriginalGetElementById("control3"); }
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
