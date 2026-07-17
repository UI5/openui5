/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Panel",
	"sap/m/VBox",
	"sap/uxap/testblocks/GenericDiv",
	"sap/ui/Device",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Element",
	"sap/uxap/library"
],
function(nextUIUpdate, ObjectPageSubSection, ObjectPageSection, ObjectPageLayout, ObjectPageDynamicHeaderTitle, Button, Text, Title, Panel, VBox, GenericDiv, Device, XMLView, Element, lib) {

	"use strict";

	//eslint-disable-next-line no-void
	const makeVoid = (fn) => (...args) => void fn(...args);

	const oFactory = {
		getSection: function (iNumber, sTitleLevel, aSubSections) {
			return new ObjectPageSection({
				title: "Section" + iNumber,
				titleLevel: sTitleLevel,
				subSections: aSubSections || []
			});
		},
		getSubSection: function (iNumber, aBlocks, sTitleLevel) {
			return new ObjectPageSubSection({
				title: "SubSection " + iNumber,
				titleLevel: sTitleLevel,
				blocks: aBlocks || []
			});
		},
		getBlocks: function (sText) {
			return [
				new Text({text: sText || "some text"})
			];
		},
		getObjectPage: function () {
			return new ObjectPageLayout();
		},
		getDynamicPageTitle: function () {
			return new ObjectPageDynamicHeaderTitle({
				heading:  this.getTitle()
			});
		},
		getTitle: function () {
			return new Title({
				text: "Anna Maria Luisa"
			});
		}
	};

	const helpers = {
		generateObjectPageWithContent: function (oFactory, iNumberOfSection) {
			const oObjectPage = oFactory.getObjectPage();
			let oSection, oSubSection;

			for (let i = 0; i < iNumberOfSection; i++) {
				oSection = oFactory.getSection(i);
				oSubSection = oFactory.getSubSection(i, oFactory.getBlocks());
				oSection.addSubSection(oSubSection);
				oObjectPage.addSection(oSection);
			}

			return oObjectPage;
		},
		generateObjectPageWithDynamicBigHeaderContent: function() {
			const oBigHeaderContent = new Panel({ height: "900px"});
			const oObjectPage = this.generateObjectPageWithContent(oFactory, 2);

			oObjectPage.setHeaderTitle(oFactory.getDynamicPageTitle());
			oObjectPage.addHeaderContent(oBigHeaderContent);
			return oObjectPage;
		},
		generateObjectPageWithDynamicHeaderTitle: function() {
			const oHeaderContent = new Panel({ height: "99.3px"});
			const oObjectPage = this.generateObjectPageWithContent(oFactory, 5);

			oObjectPage.setHeaderTitle(oFactory.getDynamicPageTitle());
			oObjectPage.addHeaderContent(oHeaderContent);
			return oObjectPage;
		},
		renderObject: async function (oSapUiObject) {
			oSapUiObject.placeAt("qunit-fixture");
			await nextUIUpdate();
			return oSapUiObject;
		},
		getSectionAnchor: function(oSection) {
			const oObjectPage = oSection.getParent();
			const aResult = oObjectPage._oABHelper._getAnchorBar().getItems().filter((oItem) => {
				return oItem.getKey() === oSection.getId();
			});
			return aResult.length && aResult[0];
		}
	};

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
	 * In some tests that are using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each such test a sync rendering is executed which will clear any pending
	 * fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 *
	 * This function is used as an indicator for such cases. It's just a wrapper around nextUIUpdate.
	 */
	function clearPendingUIUpdates(clock) {
		return nextUIUpdate(clock);
	}

	QUnit.module("ObjectPage Content scroll visibility", {
		beforeEach: function (assert) {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 10);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("sectionChange event is fired upon scrolling", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPage;
		const oSection = oObjectPage.getSections()[9];
		const fnDone = assert.async();

		oObjectPage.attachEventOnce("sectionChange", (oEvent) => {
			assert.equal(oEvent.getParameter("section").getId(), oSection.getId(), "sectionChange event is fired upon scrolling to a specified section");
			fnDone();
		});

		// Act
		await helpers.renderObject(oObjectPage);
		oObjectPage.setSelectedSection(oSection);
	});

	QUnit.test("sectionChange event is fired with correct parameters", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPage;
		const oSection = oObjectPage.getSections()[9];
		const fnDone = assert.async();

		this.stub(this.oObjectPage, "_getClosestScrolledSectionBaseId").callsFake(() => {
			return oObjectPage.getSections()[9].getSubSections()[0].getId(); // return a subSection of the scrolled section
		});

		oObjectPage.attachSectionChange((oEvent) => {
			// Assert
			assert.equal(oEvent.getParameter("section").getId(), oSection.getId(), "correct section parameter");
			fnDone();
		});

		// Act
		await helpers.renderObject(oObjectPage);
		oObjectPage.setSelectedSection(oSection);
	});

	QUnit.module("scroll position", {
		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 10);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("correct scroll position of section with hidden title", async function(assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPage;
		const oFirstSection = oObjectPage.getSections()[0];

		oObjectPage.addEventDelegate({
			onBeforeRendering:function(){
				oObjectPage._bStickyAnchorBar = true;//force init rendering with snapped header
				oObjectPage._bHeaderExpanded = false;
			}
		});

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		// Act
		const iPosTop = oObjectPage._computeScrollPosition(oFirstSection);
		const iOffsetTop = oFirstSection.getDomRef().offsetTop;

		// Assert
		assert.strictEqual(iPosTop ,iOffsetTop ,"corrected scroll position");
	});

	QUnit.test("_restoreScrollPosition restores position within subSection", function (assert) {
		// Arrange
		const oSelectedSection = this.oObjectPage.getSections()[1];
		const oStoredSubSection = oSelectedSection.getSubSections()[0];
		const storedSubSectionPositionTop = 200;
		const iOffsetWithinStoredSubSection = 20;
		const oScrollSpy = this.spy(this.oObjectPage, "_scrollTo");


		// Setup: Select section
		this.oObjectPage.setSelectedSection(oSelectedSection);
		// Setup: Mock the effect of _storeScrollLocation with oStoredSubSection
		this.oObjectPage._oStoredScrolledSubSectionInfo.sSubSectionId = oStoredSubSection.getId();
		this.oObjectPage._oStoredScrolledSubSectionInfo.iOffset = iOffsetWithinStoredSubSection;
		// Setup: Mock the position of the stored subSection
		this.stub(this.oObjectPage, "_computeScrollPosition").callsFake(() => {
			return storedSubSectionPositionTop; // mock a specific scroll position of a section
		});
		// Setup: Mock the validity of the stored subSection
		this.stub(this.oObjectPage, "_sectionCanBeRenderedByUXRules").returns(true);

		// Act
		this.oObjectPage._restoreScrollPosition();

		// Assert
		assert.ok(oScrollSpy.calledWithMatch(storedSubSectionPositionTop + iOffsetWithinStoredSubSection),
			"correct scroll position is restored");
	});

	QUnit.test("_isClosestScrolledSection identifies subSections", function(assert) {
		// Arrange
		const oObjectPage = this.oObjectPage;
		const oFirstSection = oObjectPage.getSections()[0];
		const oFirstSubSection = oFirstSection.getSubSections()[0];

		this.stub(oObjectPage, "_getClosestScrolledSectionBaseId").returns(oFirstSubSection.getId());

		// Assert
		assert.ok(oObjectPage._isClosestScrolledSection(oFirstSection.getId()), "identified current section");
	});

	QUnit.test("selectedSection value correct after resize content in scroll overflow", async function(assert) {
		assert.expect(Device.browser.safari ? 1 : 2);
		const oObjectPage = this.oObjectPage;
		const oFirstSection = oObjectPage.getSections()[0];
		const oFirstSubSection = oFirstSection.getSubSections()[0];
		const sSelectedSectionId = oObjectPage.getSections()[3].getId();
		const item1 = new Button({text: "content", visible: false});
		const item2 = new Button({text: "content", visible: false});
		const item3 = new Button({text: "content", visible: false});
		const item4 = new Button({text: "content", visible: false});
		const item5 = new Button({text: "content", visible: false});
		let iExpectedScrollTopAfterChange;

			oFirstSubSection.addBlock(new VBox({
				items: [item1, item2, item3 , item4, item5]
			}));

		// Setup: select a section lower than the first
		oObjectPage.setSelectedSection(sSelectedSectionId);

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		const iScrollTopBeforeChange = oObjectPage._$opWrapper.scrollTop();

		//Act: change the height of the content inside the scroll overflow
		//(i.e. the content above above the current scroll position)
		item1.setVisible(true);
		item2.setVisible(true);
		item3.setVisible(true);
		await nextUIUpdate();

		// Simulate the expected scroll event from the browser, due to overflow anchoring
		// (expected from all supported browsers except Safari which does not support overflow anchoring => does not fire scroll event)
		if (!Device.browser.safari) {
			iExpectedScrollTopAfterChange = iScrollTopBeforeChange + (5 * item1.getDomRef().offsetHeight);
			// synchronously call the result of the expected scroll event
			// the browser fires that scroll event because the position of the selected section changed
			oObjectPage._updateSelectionOnScroll(iExpectedScrollTopAfterChange);
			// the page internally sets a wrong selected section
			// because we do not yet update the cached positions of the sections
			assert.notEqual(oObjectPage.getSelectedSection() , sSelectedSectionId, "selected section has changed");

			// act: request the page to update the positions of the sections and check its current selected section
			oObjectPage.triggerPendingLayoutUpdates();
		}

		assert.strictEqual(oObjectPage.getSelectedSection() , sSelectedSectionId, "selected section is correct");
	});

	QUnit.test("triggerPendingLayoutUpdates is called on before rendering", async function(assert) {
		assert.expect(2);
		const oObjectPage = this.oObjectPage;
		const sSelectedSectionId = oObjectPage.getSections()[1].getId();
		const oSpy = this.spy(oObjectPage, "triggerPendingLayoutUpdates");

		// Setup: select a section lower than the first
		oObjectPage.setSelectedSection(sSelectedSectionId);

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		const iScrollTop = oObjectPage._$opWrapper.scrollTop();
		oSpy.reset();

		// synchronously call the result of a scroll event that
		// the browser fires when the position of the selected section changed
		oObjectPage._updateSelectionOnScroll(iScrollTop + oObjectPage.getSections().length * 100);
		// the page internally sets a wrong selected section
		// because on scroll we do not yet update the cached positions of the sections
		assert.notEqual(oObjectPage.getSelectedSection() , sSelectedSectionId, "selected section has changed");

		// act: trigger rerendering while an incorrect selected section is set
		oObjectPage.onBeforeRendering();
		assert.strictEqual(oSpy.callCount, 1, "selected section is updated");
	});

	QUnit.module("Scroll to snap", {
		beforeEach: function (assert) {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 2);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("spacer sufficient to snap with scroll", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPage;

		oObjectPage.setHeight("999.1px");
		oObjectPage.setUseIconTabBar(true);
		oObjectPage.addHeaderContent(new Panel({height: "50.2px"}));

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		// Act
		oObjectPage._snapHeader(true /*keep header in content area */);
		const oWrapperDom = oObjectPage._$opWrapper.get(0);
		const iMaxScrollHeight = oWrapperDom.scrollHeight - oWrapperDom.clientHeight;

		// Assert
		assert.ok(iMaxScrollHeight >= oObjectPage._getSnapPosition(), "enough space to allow scroll");
	});

	QUnit.test("no cut-off snap/pin buttons", async function (assert) {
		assert.expect(3);
		const oObjectPage = this.oObjectPage;

		oObjectPage.setHeaderTitle(oFactory.getDynamicPageTitle());

		oObjectPage.addHeaderContent(new Panel({height: "50.2px"}));

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		const iSnapPosition = oObjectPage._getSnapPosition().toString();
		const oHeader = oObjectPage._getHeaderContent();

		// Assert initial setup (in the context of which the final check is valid)
		assert.notEqual(getComputedStyle( oHeader.getDomRef()).position, "static", "the header is css-positioned");
		assert.notEqual(getComputedStyle( oObjectPage._$opWrapper.get(0)).position, "static", "the scroll-container is css-positioned");

		// Act:
		// scroll just before snap
		// so that only the bottom-most area of the headerContent is visible
		oObjectPage._scrollTo(iSnapPosition - 5);

		// Check:
		// obtain the amount of top pixels that are in the overflow (i.e. pixels that are scrolled out of view)
		const iScrollTop = oObjectPage._$opWrapper.scrollTop();
		// obtain the distance of the expand button from the top of the scrollable content
		const iButtonOffsetTop = oHeader._getCollapseButton().getDomRef().offsetTop + oHeader.getDomRef().offsetTop;
		assert.ok(iButtonOffsetTop >= iScrollTop, "snap button is not in the overflow");
	});

	QUnit.module("Expand header");

	QUnit.test("Header expand works, when scrolled header has height with fraction value", async function(assert) {
		// Arrange
		const oObjectPage = helpers.generateObjectPageWithDynamicHeaderTitle();
		const aSections = oObjectPage.getSections();
		const oLastSection = aSections[aSections.length - 1];

		assert.expect(2);

		await helpers.renderObject(oObjectPage);

		oObjectPage.scrollToSection(oLastSection.getId(), 0);
		const iLastSectionScrollTop = oObjectPage._computeScrollPosition(oLastSection);
		oObjectPage._onScroll({target: {scrollTop: iLastSectionScrollTop}});
		await nextUIUpdate();

		// Ensure deterministic precondition for the expand action.
		if (oObjectPage._bHeaderExpanded) {
			oObjectPage._toggleHeader(true);
			await nextUIUpdate();
		}

		// Assert
		assert.strictEqual(oObjectPage._bHeaderExpanded, false, "Header is snapped after scroll");

		// Act
		const oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton();
		oExpandButton.firePress();
		await nextUIUpdate();

		// Check
		assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header is expanded after pressing expand button");
	});

	QUnit.test("Header expanded in title-area remains expanded upon switching tabs", async function(assert) {
		// Arrange
		const oObjectPage = helpers.generateObjectPageWithDynamicHeaderTitle();
		const aSections = oObjectPage.getSections();
		const oFirstSection = aSections[0];
		const oSecondSection = aSections[1];

		oSecondSection.addSubSection(oFactory.getSubSection(1, oFactory.getBlocks()));
		oObjectPage.setUseIconTabBar(true);

		assert.expect(3);

		oObjectPage.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oObjectPage);

		// step 1 of setup: Scroll to a non-first section to snap the header
		oObjectPage.scrollToSection(oSecondSection.getSubSections()[1].getId(), 0);
		// call the scroll handler synchronously to save a timeout
		oObjectPage._onScroll({target: {scrollTop: oObjectPage._computeScrollPosition(oSecondSection.getSubSections()[1])}});
		// Assert precondition
		assert.strictEqual(oObjectPage._bHeaderExpanded, false, "Header is snapped after scroll");

		// step 2 of setup: Expand the header by pressing the expand button
		const oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton();
		oExpandButton.firePress();
		// Assert precondition
		assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header is expanded after pressing expand button");

		// step 3 of setup: Select a new tab
		oObjectPage.scrollToSection(oFirstSection.getId(), 0);
		// call the scroll handler synchronously to save a timeout
		oObjectPage._onScroll({target: {scrollTop: oObjectPage._computeScrollPosition(oFirstSection)}});

		// Check
		assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header remains expanded");
	});

	QUnit.test("Scroll position is preserved upon switching tabs when header is expanded", async function(assert) {
		// Arrange
		const oObjectPage = helpers.generateObjectPageWithDynamicHeaderTitle();
		const aSections = oObjectPage.getSections();
		const iScrollPosition = 30;
		const oFirstSection = aSections[0];
		const oSecondSection = aSections[1];

		oFirstSection.addSubSection(oFactory.getSubSection(1, new Panel({height: "1000px"})));
		oSecondSection.addSubSection(oFactory.getSubSection(1, new Panel({height: "1000px"})));
		oObjectPage.setUseIconTabBar(true);

		assert.expect(2);

		oObjectPage.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oObjectPage);

		// scroll down without snapping the header
		oObjectPage._scrollTo(iScrollPosition, 0);
		// click on another tab
		oObjectPage._oABHelper._getAnchorBar().setSelectedItem(oObjectPage._oABHelper._getAnchorBar().getItems()[1]);
		// Check
		assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header remains expanded");
		assert.strictEqual(iScrollPosition, oObjectPage._$opWrapper.scrollTop(), "Scroll position is preserved");
	});

	QUnit.test("Scrolls to correct position when header is expanded", async function(assert) {
		// Arrange
		const oObjectPage = helpers.generateObjectPageWithDynamicHeaderTitle();
		const aSections = oObjectPage.getSections();
		const oSection = aSections[1];

		assert.expect(1);

		oObjectPage.setSelectedSection(aSections[3]);
		await helpers.renderObject(oObjectPage);

		// Act - expand header and scroll to target section
		const oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton();
		oExpandButton.firePress();
		await nextUIUpdate();

		if (!oObjectPage._bHeaderExpanded) {
			oObjectPage._toggleHeader(false);
			await nextUIUpdate();
		}

		oObjectPage.scrollToSection(oSection.getId(), 0);
		const iExpectedScrollTop = oObjectPage._computeScrollPosition(oSection);
		oObjectPage._onScroll({target: {scrollTop: iExpectedScrollTop}});
		await nextUIUpdate();
		const iActualScrollTop = oObjectPage._$opWrapper.scrollTop();

		// Assert
		assert.strictEqual(Math.round(iActualScrollTop), Math.round(iExpectedScrollTop), "Scroll position is correct for the target section");
	});

	QUnit.module("ObjectPage Content scrolling with snap", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageContentScrollingWithSnap",
				viewName: "view.UxAP-ObjectPageContentScrollingWithSnap"
			}).then(async (oView) => {
				this.oObjectPageContentScrollingView = oView;
				this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.oObjectPageContentScrollingView.destroy();
		}
	});

	QUnit.test("Scroll position preserved when header is snapped (integration test)", async function (assert) {
		assert.expect(2);
		this.oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		await waitForDOMReady(this.oObjectPage);

		const iSnapThreshold = this.oObjectPage._getSnapPosition();
		// Scroll to a position that will trigger header snap
		// and is close to the threshold where scroll preservation issue occurs
		const iScrollPosition = iSnapThreshold + 10;

		// Act - scroll to trigger header snap
		this.oObjectPage._scrollTo(iScrollPosition, 0);

		// simulate scroll event fired immediately after the scrollTo call
		// this synchronously triggers _moveAnchorBarToTitleArea and the snap logic
		this.oObjectPage._onScroll({target: {scrollTop: iScrollPosition}});

		// Assert immediately - the snap operation is synchronous
		const iScrollPositionAfterSnap = this.oObjectPage._$opWrapper.scrollTop();
		assert.ok(this.oObjectPage._bStickyAnchorBar, "header is snapped");
		assert.strictEqual(Math.round(iScrollPositionAfterSnap), Math.round(iScrollPosition),
			"scroll position is preserved (not adjusted due to anchorBar removal)");
	});

	QUnit.module("ObjectPage Content scrolling", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-objectPageContentScrolling",
				viewName: "view.UxAP-ObjectPageContentScrolling"
			}).then(async (oView) => {
				this.oObjectPageContentScrollingView = oView;
				this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.oObjectPageContentScrollingView.destroy();
		}
	});

	QUnit.test("Should validate each section's position after scrolling to it, considering UI rules", function (assert) {
		const clock = sinon.useFakeTimers();

		clock.tick(500);

		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");

		for (const section in oObjectPage._oSectionInfo) {
			if (!oObjectPage._oSectionInfo.hasOwnProperty(section)) {
				continue;
			}

			//Scroll to section
			oObjectPage.scrollToSection(section,0,0);
			clock.tick(500);

			//Handle UI Rules special cases
			let iExpectedPosition;
			switch (section) {
				case "UxAP-objectPageContentScrolling--firstSection":
					iExpectedPosition =  0;
					break;
				case "UxAP-objectPageContentScrolling--subsection1-1":
					iExpectedPosition =  0;
					break;
				case "UxAP-objectPageContentScrolling--secondSection":
					iExpectedPosition =  oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection2-1"].positionTop;
					break;
				case "UxAP-objectPageContentScrolling--thirdSection":
					iExpectedPosition = oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection3-1"].positionTop;
					break;
				case "UxAP-objectPageContentScrolling--subsection3-1":
					iExpectedPosition = oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection3-1"].positionTop;
					break;
				default:
					iExpectedPosition = oObjectPage._oSectionInfo[section].positionTop;
			}

			//Assert
			assert.strictEqual(oObjectPage._$opWrapper[0].scrollTop, iExpectedPosition, "Assert section: \"" + section + "\" position: " + iExpectedPosition);
		}
		clock.restore();
	});

	QUnit.test("Slow CPU case", async function (assert) {

		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const sTargetSectionId = "UxAP-objectPageContentScrolling--secondSection";

		assert.expect(2);

		await waitForDOMReady(oObjectPage);

		oObjectPage._requestAdjustLayout(true);
		const iTargetPosition = oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection2-1"].positionTop;

		// intercept — must be set up after iTargetPosition is known
		oObjectPage._moveAnchorBarToTitleArea = function () {
			ObjectPageLayout.prototype._moveAnchorBarToTitleArea.apply(oObjectPage, arguments);
			assert.ok(oObjectPage._$opWrapper.scrollTop() < iTargetPosition, "header is snapped before reaching the target position");
		};

		oObjectPage.scrollToSection(sTargetSectionId);

		oObjectPage._$opWrapper.scrollTop(iTargetPosition);
		oObjectPage._onScroll({target: {scrollTop: iTargetPosition}});

		assert.ok(oObjectPage._bStickyAnchorBar, "header is snapped");

	});

	QUnit.test("Failure to scroll resumes lazy loading", function (assert) {

		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oTargetSection = oObjectPage.getSections()[2];
		const sTargetSectionId = oTargetSection.getId();
		const done = assert.async();
		let oSuppressSpy;

		//Setup
		oObjectPage.setEnableLazyLoading(true);
		this.stub(oObjectPage, "_resumeLazyLoading").callsFake(function () {
			// Assert
			assert.ok(true, "lazy loading is resumed");
			done();
		});

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			oSuppressSpy = this.spy(oObjectPage._oLazyLoading, "suppress");

			// initiate scroll that involves supression of lazy loading
			oObjectPage.scrollToSection(sTargetSectionId);
			assert.equal(oSuppressSpy.callCount, 1, "lazy loading is suppressed");

			// Act: change the DOM structure in a way
			// that prevents the animation to end normally
			oTargetSection.destroy();
			await nextUIUpdate();
		}.bind(this)));

	});

	QUnit.test("Rerendering the page preserves the scroll position", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oSecondSection = this.oObjectPageContentScrollingView.byId("secondSection");
		const oStoreSpy = this.spy(oObjectPage, "_storeScrollLocation");
		const oRestoreSpy = this.spy(oObjectPage, "_restoreScrollPosition");
		const oScrollSpy = this.spy(oObjectPage, "_scrollTo");
		const done = assert.async();
		let iScrollPositionBeforeRerender;
		let iExpectedScrollPositionAfterRerender;

		oObjectPage.setSelectedSection(oSecondSection.getId());

		assert.expect(3);

		setTimeout(async function() {
			iScrollPositionBeforeRerender = oObjectPage._$opWrapper[0].scrollTop;
			iExpectedScrollPositionAfterRerender = Math.ceil(iScrollPositionBeforeRerender); //the page ceils the obtained DOM positions

			oObjectPage.addEventDelegate({ onBeforeRendering: function() {
					assert.ok(oStoreSpy.called, "_storeScrollLocation is called on beforeRenderingf");
				}});

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				assert.ok(oRestoreSpy.called, "_restoreScrollPosition is called on afterRendering");
				assert.ok(oScrollSpy.calledWithMatch(iExpectedScrollPositionAfterRerender), "scroll position is preserved");
				done();
			});
			oObjectPage.invalidate();
			await nextUIUpdate();
		}, 1000); //dom calc delay
	});

	QUnit.test("Scroll position is preserved upon insertion of another section", function (assert) {

		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oFirstSection = oObjectPage.getSections()[0];
		const oSecondSection = oObjectPage.getSections()[1];
		const oScrollSpy = this.spy(oObjectPage, "_scrollTo");
		const done = assert.async();
		let iExpectedScrollTopAfterRendering;

		// setup: hide the first visible section so that the next visible is selected
		oFirstSection.setVisible(false);

		setTimeout(function() {

			oFirstSection.setVisible(true);
			oScrollSpy.resetHistory();
			setTimeout( function() {
				iExpectedScrollTopAfterRendering = oObjectPage._computeScrollPosition(oSecondSection);
				assert.ok(oScrollSpy.calledWithMatch(iExpectedScrollTopAfterRendering),
					"scroll position of the selectedSection is preserved");
				done();
			}, 1000);
		}, 1000);
	});

	QUnit.test("ScrollToSection in 0 time scrolls to correct the scroll position", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const sTargetSectionId = "UxAP-objectPageContentScrolling--secondSection";
		const done = assert.async();
		let iScrollPosition;
		let iExpectedPosition;

		setTimeout(function() {
			oObjectPage.scrollToSection(sTargetSectionId, 0);
			setTimeout(function() {
				iScrollPosition = Math.ceil(oObjectPage._$opWrapper[0].scrollTop);
				iExpectedPosition =  oObjectPage._oSectionInfo[sTargetSectionId].positionTop;
				assert.strictEqual(iScrollPosition, iExpectedPosition, "scrollPosition is correct");
				done();
			}, 1000); // throttling delay
		}, 1000); //dom calc delay
	});

	QUnit.test("Deleting the above section preserves the selected section position", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oFirstSection = this.oObjectPageContentScrollingView.byId("firstSection");
		const oThirdSection = this.oObjectPageContentScrollingView.byId("thirdSection");
		const done = assert.async();
		let iScrollPositionAfterRemove;
		let iExpectedPositionAfterRemove;

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oObjectPage.setSelectedSection(oThirdSection.getId());
			setTimeout(function () {
				oObjectPage.removeSection(oFirstSection);
				setTimeout(function () {
					iScrollPositionAfterRemove = Math.ceil(oObjectPage._$opWrapper[0].scrollTop);
					iExpectedPositionAfterRemove = oObjectPage._oSectionInfo[oThirdSection.getId()].positionTop; // top of third section
					assert.strictEqual(iScrollPositionAfterRemove, iExpectedPositionAfterRemove, "scrollPosition is correct");
					oFirstSection.destroy();
					done();
				}, 1000); // throttling delay
			}, 1000); //dom calc delay
		});
	});

	QUnit.test("Deleting the below section preserves the scroll position", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oSecondSection = this.oObjectPageContentScrollingView.byId("secondSection");
		const oThirdSection = this.oObjectPageContentScrollingView.byId("thirdSection");
		const done = assert.async();
		let iScrollPositionBeforeRemove;
		let iScrollPositionAfterRemove;

		oObjectPage.setSelectedSection(oSecondSection.getId());

		setTimeout(function() {
			oObjectPage.removeSection(oThirdSection);
			iScrollPositionBeforeRemove = oObjectPage._$opWrapper[0].scrollTop;
			setTimeout(function() {
				iScrollPositionAfterRemove = oObjectPage._$opWrapper[0].scrollTop;
				assert.strictEqual(iScrollPositionAfterRemove, iScrollPositionBeforeRemove, "scrollPosition is preserved");
				oThirdSection.destroy();
				done();
			}, 1000); // throttling delay
		}, 1000); //dom calc delay
	});

	QUnit.test("Should keep ObjectPageHeader in \"Expanded\" mode on initial load", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const done = assert.async();

		setTimeout(function() {
			assert.ok(!isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in \"Expanded\" mode");
			done();
		}, 1000); //dom calc delay

	});

	QUnit.test("Should change ObjectPageHeader in \"Stickied\" mode after scrolling to a lower section", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const done = assert.async();

		setTimeout(function(){
			//Act
			oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--subsection3-1",0,0);
			setTimeout(function() {
				assert.ok(isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in stickied mode");
				done();
			}, 1000); //scroll delay
		}, 1000); //dom calc delay

	});

	QUnit.test("Should keep ObjectPageHeader in \"Stickied\" mode when scrolling", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const done = assert.async();

		setTimeout(function(){
			//Act
			oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--subsection3-1",0,0);
			setTimeout(function() {
				assert.ok(isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in stickied mode");
				oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--firstSection",0,0);
				setTimeout(function() {
					assert.ok(isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in stickied mode");
					done();
				}, 1000);
			}, 1000); //scroll delay
		}, 1000); //dom calc delay

	});

	QUnit.test("Should keep the AnchorBar scrolled to the selected Section when title is snapped", async function(assert) {
		// Arrange
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oObjectPageSection = new ObjectPageSection({
			subSections: [
			new ObjectPageSubSection({
				blocks: [new GenericDiv({height: "1500px"})]
			}),
			new ObjectPageSubSection({
				blocks: [new GenericDiv({height: "200px"})]
			})
		]
		});
		const sSectionId = oObjectPageSection.getId();
		const oAnchorBar = oObjectPage._oABHelper._getAnchorBar();
		const done = assert.async();

		assert.expect(2);

		oObjectPage.setUseIconTabBar(true);
		oObjectPage.addSection(oObjectPageSection);
		await nextUIUpdate();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
			//Act
			oObjectPage.setSelectedSection(sSectionId);

			setTimeout(function() {
				//Act
				oObjectPage._scrollTo(oObjectPage._getSnapPosition() + 100);

				setTimeout(function() {
					// Assert
					assert.ok(isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in stickied mode");
					assert.strictEqual(oAnchorBar.getSelectedKey(), sSectionId, "the section is selected in the anchorBar");
					done();
				}, 1000); //scroll delay

			}, 1000); //scroll delay

		});
	});

	QUnit.test("_isClosestScrolledSection should return the first section if all sections are hidden", async function (assert) {
		assert.expect(1);
		const clock = sinon.useFakeTimers();
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const aSections = oObjectPage.getSections();
		const sFirstSectionId = "UxAP-objectPageContentScrolling--firstSection";

		clock.tick(500);

		for (const section in aSections) {
			aSections[section].setVisible(false);
		}

		assert.strictEqual(oObjectPage._isClosestScrolledSection(sFirstSectionId), true, "Fisrt section is the closest scrolled section");

		await clearPendingUIUpdates(clock);
		clock.restore();
	});

	QUnit.test("_getClosestScrolledSectionBaseId identifies target subSection", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oTargetSection = this.oObjectPageContentScrollingView.byId("secondSection");
		const oTargetSubSection = oTargetSection.getSubSections()[1];

		await waitForDOMReady(oObjectPage);

		const iPageHeight = oObjectPage.getDomRef().offsetHeight;
		const iTargetSubSectionScrollPosition = oObjectPage._computeScrollPosition(oTargetSubSection);
		const sClosestSectionId = oObjectPage._getClosestScrolledSectionBaseId(iTargetSubSectionScrollPosition, iPageHeight, true);
		assert.equal(sClosestSectionId, oTargetSubSection.getId(), "target subSection is recognized");
	});


	QUnit.test("_getClosestScrolledSectionBaseId identifies target subSection with rounding pixels tolerance", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oTargetSection = this.oObjectPageContentScrollingView.byId("secondSection");
		const oTargetSubSection = oTargetSection.getSubSections()[1];

		oObjectPage.scrollToSection(oTargetSubSection.getId());

		await waitForDOMReady(oObjectPage);

		const iPageHeight = oObjectPage.getDomRef().offsetHeight;
		// Simulating rounding down issue of the current scroll position
		const iTargetSubSectionScrollPosition = oObjectPage._computeScrollPosition(oTargetSubSection) - 1;
		const sClosestSectionId = oObjectPage._getClosestScrolledSectionBaseId(iTargetSubSectionScrollPosition, iPageHeight, true);
		assert.equal(sClosestSectionId, oTargetSubSection.getId(), "target subSection is recognized");
	});

	QUnit.test("_getClosestScrolledSectionBaseId returns null if current section is destroyed", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oTargetSection = this.oObjectPageContentScrollingView.byId("secondSection");
		const oTargetSubSection = oTargetSection.getSubSections()[1];

		await waitForDOMReady(oObjectPage);

		oObjectPage.scrollToSection(oTargetSubSection.getId(), 0);
		const iPageHeight = oObjectPage.getDomRef().offsetHeight;
		const iTargetSubSectionScrollPosition = oObjectPage._computeScrollPosition(oTargetSubSection);

		//Act
		oTargetSection.destroy();

		const sClosestSectionId = oObjectPage._getClosestScrolledSectionBaseId(iTargetSubSectionScrollPosition, iPageHeight, true);
		assert.equal(sClosestSectionId, null, "target subSection is recognized");
	});

	QUnit.test("Upon scrolling 'subSectionEnteredViewPortEvent' is fired after '_connectModelsForSections' is called", async function(assert) {
		assert.expect(2);
		// Arrange
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const done = assert.async();
		let oSpy;
		const oStub = this.stub(oObjectPage, "_connectModelsForSections").callsFake(function () {
			// Assert
			assert.ok(oSpy.notCalled, "subSectionEnteredViewPortEvent is not fired before _connectModelsForSections");

			oStub.restore();
			return Promise.all([]);
		});

		oObjectPage.setEnableLazyLoading(true);
		await nextUIUpdate();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSpy = this.spy(oObjectPage, "_fireSubSectionEnteredViewPortEvent");

			//Act
			oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--subsection3-1",0,0);

			setTimeout(function() {
				//Assert
				assert.ok(oSpy.called, "subSectionEnteredViewPortEvent is fired after _connectModelsForSections");

				// Clean up
				done();
			}, 1000); //scroll delay
		}.bind(this));
	});

	QUnit.test("ScrollEnablement private API", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");

		oObjectPage._initializeScroller();

		assert.ok(oObjectPage._oScroller._$Container, "ScrollEnablement private API is OK.");
	});

	QUnit.test("Section position top", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oSection = oObjectPage.getSections()[1];
		const done = assert.async();
		let $mobileAnchor;
		let iPositionTopBefore;
		let iPositionTopAfter;
		const fnCheckPosition = function() {
				$mobileAnchor = oSection.$("header");
				iPositionTopBefore = lib.Utilities.getChildPosition($mobileAnchor, oObjectPage._$contentContainer).top;

				// Act
				oObjectPage.getDomRef().style.position = "relative";
				iPositionTopAfter = lib.Utilities.getChildPosition($mobileAnchor, oObjectPage._$contentContainer).top;

				// Check
				assert.strictEqual(iPositionTopBefore, iPositionTopAfter, "position within contentContainer is still correct");
				done();
			};
		if (oObjectPage.isActive()) {
			fnCheckPosition();
		} else {
			oObjectPage.addEventDelegate({
				onAfterRendering: fnCheckPosition
			});
		}
	});

	QUnit.test("ScrollToElement", async function (assert) {
		assert.expect(2);
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oSection2 = oObjectPage.getSections()[1];
		let fnResolveOnVisible;

		await new Promise(function (resolve) {
			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", resolve);
		});

		const $Section2TTitle = oSection2.$().find('.sapUxAPObjectPageSectionTitle');
		const fnIsElementVisible = function () {
			const oWrapperRect = oObjectPage._$opWrapper.get(0).getBoundingClientRect();
			const oTitleRect = $Section2TTitle.get(0).getBoundingClientRect();

			return oTitleRect.bottom > oWrapperRect.top && oTitleRect.top < oWrapperRect.bottom;
		};

		assert.ok($Section2TTitle.length, "element exists");

		// Act
		oObjectPage.getScrollDelegate().scrollToElement($Section2TTitle.get(0));
		oObjectPage._onScroll({ target: { scrollTop: oObjectPage._$opWrapper.scrollTop()}});

		await new Promise(function (resolve) {
			fnResolveOnVisible = function () {
				if (fnIsElementVisible()) {
					oObjectPage._$opWrapper.off("scroll", fnResolveOnVisible);
					resolve();
				}
			};

			oObjectPage._$opWrapper.on("scroll", fnResolveOnVisible);
			fnResolveOnVisible();
		});

		// Check
		assert.ok(fnIsElementVisible(), "element is visible");

	});

	QUnit.test("Modify structure during scroll", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oSection2 = oObjectPage.getSections()[1];
		const oSection3 = oObjectPage.getSections()[2];
		const oScrollToSectionSpy = this.spy(oObjectPage, "scrollToSection");
		const done = assert.async();
		let oSection2Anchor;

		assert.expect(2);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			oSection2Anchor = helpers.getSectionAnchor(oSection2);

			// simulate user press on the anchorBar button
			oObjectPage.getAggregation("_anchorBar").fireSelect({
				key: oSection2Anchor.getKey()
			});

			// simulate change in structure during scroll
			oSection3.setVisible(false);

			// ensure we test the scrolling from this point on
			oScrollToSectionSpy.resetHistory();
			this.stub(oObjectPage._oScroller._$Container, "is").callsFake(function(sState) {
				if (sState === ":animated") {
					return true;
				}
			});

			// subscribe for end of adjustment
			oObjectPage._requestAdjustLayoutAndUxRules().then(function() {
				// Check
				assert.ok(oScrollToSectionSpy.called, "scrolling is adjusted");
				assert.ok(oScrollToSectionSpy.alwaysCalledWithMatch(oSection2.getId()), "scrolling is adjusted to the correct section");

				done();
			});
		}, this);

	});

	QUnit.test("subSection without title", async function (assert) {
		assert.expect(3);

		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oSection = oObjectPage.getSections()[1];
		const oSectionSubSection = oSection.getSubSections()[1];
		const oSpy = this.spy(oObjectPage, "_requestAdjustLayout");

		await waitForDOMReady(oObjectPage);

		const iSectionPositionTopBefore = oObjectPage._computeScrollPosition(oSection);
		const iSubSectionPositionTopBefore = oObjectPage._computeScrollPosition(oSectionSubSection);
		// verify init state
		assert.ok(iSubSectionPositionTopBefore > iSectionPositionTopBefore, "subSection position is below its parent section");

		// Act
		oSpy.resetHistory();
		oSectionSubSection.setShowTitle(false);
		await nextUIUpdate();

		// Check
		assert.ok(oSpy.called, "layout adjustment is requested");
		oObjectPage._requestAdjustLayout(true); // call synchronously to save a timeout
		const iSectionPositionTopAfter = oObjectPage._computeScrollPosition(oSection);
		const iSubSectionPositionTopAfter = oObjectPage._computeScrollPosition(oSectionSubSection);
		assert.ok(iSubSectionPositionTopAfter > iSectionPositionTopAfter, "subSection position is below its parent section");

	});

	QUnit.test("Scrolling to Section, when selectedSection is not visible", async function (assert) {
		// Arrange
		const oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 10);
		const oFirstSection = oObjectPageLayout.getSections()[0];
		const oFirstSectionSubSection = oFirstSection.getSubSections()[0];
		const oScrollToSection = oObjectPageLayout.getSections()[6];

		assert.expect(1);

		oFirstSectionSubSection.setVisible(false);
		oObjectPageLayout.setSelectedSection(oFirstSection);
		oObjectPageLayout.placeAt('qunit-fixture');

		await waitForDOMReady(oObjectPageLayout);

		// Act
		const oScrollToSectionInfo = oObjectPageLayout._oSectionInfo[oScrollToSection.getId()];
		const iTargetPosition = oScrollToSectionInfo.positionTop;
		oObjectPageLayout._$opWrapper.scrollTop(iTargetPosition);
		oObjectPageLayout._onScroll({target: {scrollTop: iTargetPosition}});

		// Assert
		assert.strictEqual(oObjectPageLayout._oABHelper._getAnchorBar().getSelectedKey(), oScrollToSection.getId(),
			"Scrolled to Section is selected correctly in the AnchorBar");
	});

	QUnit.test("Does not throw an error when selectedSection does not exist", async function (assert) {
		// Arrange
		const oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 3);

		assert.expect(1);

		// Act
		oObjectPageLayout.setSelectedSection("not-existing-section");
		oObjectPageLayout.placeAt('qunit-fixture');

		await waitForDOMReady(oObjectPageLayout);

		// Assert
		assert.ok(true, "Error is not thrown");
	});

	QUnit.test("requestAdjustLayoutAndUxRules during animated scroll to subSection", async function (assert) {
		assert.expect(1);

		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oTargetSection = oObjectPage.getSections()[2];
		const sTargetSectionId = oTargetSection.getId();
		const sTargetSubSectionId = oTargetSection.getSubSections()[0].getId();
		const oScrollSpy = this.spy(oObjectPage, "scrollToSection");

		await waitForDOMReady(oObjectPage);

		oObjectPage.setSelectedSection(sTargetSectionId);

		// scroll to a subSection of the selectedSection
		oObjectPage.scrollToSection(sTargetSubSectionId);

		this.stub(oObjectPage, "_isClosestScrolledSection").callsFake(function (sSectionId) {
			return sSectionId === sTargetSectionId;
		});
		this.stub(oObjectPage._oScroller._$Container, "is").callsFake(function (sCondition) {
			return sCondition === ":animated";
		});
		oScrollSpy.reset();
		oObjectPage._adjustLayoutAndUxRules();
		assert.ok(oScrollSpy.calledOnceWith(sTargetSubSectionId), "correct scrolled section");
	});

	QUnit.test("Scroll-padding-top of scrolling container", function (assert) {
		const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
		const oSelectedSection = oObjectPage.getSections()[1];
		const done = assert.async();
		let iPaddingTop;

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			iPaddingTop = parseInt(oObjectPage._$opWrapper.css("scroll-padding-top"));
			// Check
			assert.strictEqual(iPaddingTop, oObjectPage._$titleArea.get(0).getBoundingClientRect().height,
				"scroll-padding-top is equal to the title area height");

			oObjectPage.setSelectedSection(oSelectedSection);
			setTimeout(function() {
				iPaddingTop = parseInt(oObjectPage._$opWrapper.css("scroll-padding-top"));
				// Check
				assert.strictEqual(iPaddingTop, oObjectPage._$titleArea.get(0).getBoundingClientRect().height,
					"when ObjectPage is scrolled to the top of the Section, scroll-padding-top is still equal to the title area height");

				// Act - scroll a bit more to make the header of the Section stickied
				oObjectPage._scrollTo(oObjectPage._oScrollContainerLastState.iScrollTop + 10);

				setTimeout(function() {
					iPaddingTop = parseInt(oObjectPage._$opWrapper.css("scroll-padding-top"));
					// Check
					assert.strictEqual(iPaddingTop,
						(oObjectPage._$titleArea.get(0).getBoundingClientRect().height || 0) +
						(oSelectedSection?.$().find(".sapUxAPObjectPageSectionHeader").outerHeight() || 0),
						"when ObjectPage is scrolled to make the header of the Section stickied, scroll-padding-top is equal to the header height + title area height");

					done();
				}, 1000); //scroll delay

			}, 1000); //scroll delay
		});
	});

	QUnit.module("ObjectPage scrolling without view");

	QUnit.test("auto-scroll on resize of last section", async function(assert) {
		assert.expect(2);
		const oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 10); /* enough sections to allow scrolling even on big screens */
		const oLastSection = oObjectPageLayout.getSections()[1];
		const oLastSubSection = oLastSection.getSubSections()[0];
		const oResizableControl = new GenericDiv({height: "100px"});

		oLastSubSection.addBlock(oResizableControl);
		oObjectPageLayout.setSelectedSection(oLastSection);

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oObjectPageLayout);

		const iScrollTopBeforeResize = oObjectPageLayout._$opWrapper.scrollTop();
		// make the height of the last section smaller
		oResizableControl.getDomRef().style.height = "10px";
		const iScrollTopAfterResize = oObjectPageLayout._$opWrapper.scrollTop();
		// call the listener for the scroll event synchronously to speed up the test
		oObjectPageLayout._onScroll({target: {scrollTop: iScrollTopAfterResize}});

		assert.strictEqual(oObjectPageLayout.getSelectedSection(), oLastSection.getId(), "Selection is preserved");
		assert.strictEqual(oObjectPageLayout._$opWrapper.scrollTop(), iScrollTopBeforeResize, "scrollTop is restored");
		oObjectPageLayout.destroy();
	});

	QUnit.test("auto-scroll on resize of last section rounding", async function(assert) {
		assert.expect(1);
		const oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */);
		const oLastSection = oObjectPageLayout.getSections()[1];
		const oLastSubSection = oLastSection.getSubSections()[0];
		const iResizableControlHeight = 100;
		const iHeightChange = 90;
		const oResizableControl = new GenericDiv({height: +iResizableControlHeight + "px"});
		const iRoundingOffset = 0.005;

		oLastSubSection.addBlock(oResizableControl);
		oObjectPageLayout.setSelectedSection(oLastSection);

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oObjectPageLayout);

		const iScrollTopBeforeResize = oObjectPageLayout._$opWrapper.scrollTop();
		const iScrollLengthBeforeResize = oObjectPageLayout._$opWrapper.get(0).scrollHeight;

		// Act: make the height of the last section 90px smaller
		oResizableControl.getDomRef().style.height = (iResizableControlHeight - iHeightChange) + "px";
		this.stub(oObjectPageLayout, "_getScrollableContentLength").callsFake(function() {
			// the <code>iRoundingOffset</code> adds a tiny extra ammount of 0.005 that should not affect the outcome
			return iScrollLengthBeforeResize - iHeightChange + iRoundingOffset;
		});

		oObjectPageLayout._onScroll({target: {scrollTop: iScrollTopBeforeResize - iHeightChange}});

		// Check: test that the extra <code>iRoundingOffset</code> of 0.005px do not affect the outcome:
		assert.strictEqual(oObjectPageLayout._isContentScrolledToBottom(), true, "content is scrolled to bottom");
		oObjectPageLayout.destroy();
	});

	QUnit.test("auto-scroll on resize after layout calculation", async function(assert) {
		assert.expect(2);
		const oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */);
		const oLastSection = oObjectPageLayout.getSections()[1];
		const oLastSubSection = oLastSection.getSubSections()[0];
		const oResizableControl = new GenericDiv({height: "100px"});
		const oSpy = this.spy(oObjectPageLayout, "_scrollTo");
		const done = assert.async();
		let iScrollTopBeforeResize;
		let iExpectedScrollTopAfterResize;

		oLastSubSection.addBlock(oResizableControl);
		oObjectPageLayout.setSelectedSection(oLastSection);


		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function() {
				// make the height of the last section bigger
				oResizableControl.getDomRef().style.height = "1000px";
				oObjectPageLayout._requestAdjustLayout(true);


				iScrollTopBeforeResize = oObjectPageLayout._$opWrapper.scrollTop();
				iExpectedScrollTopAfterResize = Math.ceil(iScrollTopBeforeResize); //the page ceils the obtained DOM positions
				// make the height of the last section smaller
				oResizableControl.getDomRef().style.height = "10px";

				oSpy.resetHistory();
				oObjectPageLayout._onScroll({ target: { scrollTop: 0 }}); // call synchronously to avoid another timeout
				assert.strictEqual(oObjectPageLayout.getSelectedSection(), oLastSection.getId(), "Selection is preserved");
				assert.ok(oSpy.calledWith(iExpectedScrollTopAfterResize), "scrollTop is preserved");
				oObjectPageLayout.destroy();
				done();
			}, 500);
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("content size correctly calculated", async function(assert) {
		assert.expect(3);
		const oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */);
		const oFirstSection = oObjectPageLayout.getSections()[0];
		const oLastSection = oObjectPageLayout.getSections()[1];
		const oBigHeightControl = new GenericDiv({height: "500px"});
		const oSmallHeightControl = new GenericDiv({height: "100px"});
		const done = assert.async();
		let iFirstSectionSpacerHeight;
		let iLastSectionSpacerHeight;

		oObjectPageLayout.setUseIconTabBar(true);
		oFirstSection.getSubSections()[0].addBlock(oBigHeightControl);
		oLastSection.getSubSections()[0].addBlock(oSmallHeightControl);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function() {
				iFirstSectionSpacerHeight = oObjectPageLayout._$spacer.get(0).offsetHeight;

				// show the bigger section
				oObjectPageLayout.setSelectedSection(oLastSection.getId());

				setTimeout(function () {

					// assert context
					iLastSectionSpacerHeight = oObjectPageLayout._$spacer.get(0).offsetHeight;
					assert.equal(iLastSectionSpacerHeight, 0,
						"spacer is 0");
					assert.equal(iLastSectionSpacerHeight, iFirstSectionSpacerHeight,
						"spacer for smaller section is the same when there is only one visible SubSection");

					//Act: return to initial section
					oObjectPageLayout.setSelectedSection(oFirstSection.getId());

					setTimeout(function () {

						// Check: spacer is correctly restored
						assert.ok(oObjectPageLayout._$spacer.get(0).offsetHeight === iFirstSectionSpacerHeight, "spacer height is correct");
						oObjectPageLayout.destroy();
						done();
					}, 10);
				}, 10);
			}, 500);
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	// ensure that appending the anchorBar does not change the scrollTop,
	// as it may happen in certain cases (if another part of content freshly rerendered (BCP: 1870365138)
	QUnit.test("_moveAnchorBarToContentArea preserves the page scrollTop", async function(assert) {
		assert.expect(1);
		const oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */);
		const oFirstSection = oObjectPageLayout.getSections()[0];
		const oLastSection = oObjectPageLayout.getSections()[1];

		oObjectPageLayout.setSelectedSection(oLastSection);

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oObjectPageLayout);

		const iScrollTopBefore = oObjectPageLayout.getDomRef().scrollTop;

		// Act
		oFirstSection.invalidate();
		await nextUIUpdate();
		oObjectPageLayout._moveAnchorBarToContentArea();

		assert.strictEqual(oObjectPageLayout.getDomRef().scrollTop, iScrollTopBefore, "scrollTop is preserved");
		oObjectPageLayout.destroy();
	});

	QUnit.test("no scrollbar on unsnap if not needed", async function(assert) {
		assert.expect(2);
		const oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 1 /* single section */);
		const oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout");

		oObjectPageLayout.setHeaderTitle(oFactory.getDynamicPageTitle());
		oObjectPageLayout.addHeaderContent(new Panel({height: "100px"}));

		function hasScrollbar() {
			const oScrollContainer = oObjectPageLayout._$opWrapper.get(0);
			return oScrollContainer.scrollHeight > oScrollContainer.offsetHeight;
		}

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oObjectPageLayout);

		oObjectPageLayout._snapHeader(true);
		oRequestAdjustLayoutSpy.resetHistory();

		// Act: unsnap the snapped header
		oObjectPageLayout._expandHeader(false);

		// Check
		assert.strictEqual(oRequestAdjustLayoutSpy.called, true, "layout recalculation called");
		// call explicitly *with no delay* to save timeout in this test
		oObjectPageLayout._requestAdjustLayout(true);
		assert.strictEqual(hasScrollbar(), false, "no more scrollbar");

		oObjectPageLayout.destroy();
	});

	QUnit.module("ObjectPage On Title Press when Header height bigger than page height", {
		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithDynamicBigHeaderContent();
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("ObjectPage On Title Press", async function (assert) {
		assert.expect(3);
		const oObjectPage = this.oObjectPage;
		const oTitle = oObjectPage.getHeaderTitle();
		const oScrollSpy = this.spy(oObjectPage, "_scrollTo");
		const done = assert.async();


		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// check setup:
			assert.equal(oObjectPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

			// setup: scroll to a position where the header is snapped
			oObjectPage._scrollTo(950);
			setTimeout(function() {
				oScrollSpy.resetHistory();

				//act
				oTitle.fireEvent("_titlePress");
				assert.equal(oObjectPage._bHeaderInTitleArea, false, "Header is not added to the title");
				assert.ok(oScrollSpy.calledWith(0, 0), "scroll position is correct");
				done();
			}, 500); //allow the page to scroll to the required position
		});

		await helpers.renderObject(oObjectPage);
		oObjectPage.$().outerHeight("800px"); // set page height smaller than header height
	});

	QUnit.test("expand shows the visual indicator", async function (assert) {
		assert.expect(2);
		const oObjectPage = this.oObjectPage;
		const oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton();
		const oScrollSpy = this.spy(oObjectPage, "_scrollBelowCollapseVisualIndicator");
		const done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// check setup:
			assert.equal(oObjectPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

			// setup: scroll to a position where the header is snapped
			oObjectPage._scrollTo(950);
			setTimeout(function() {
				oScrollSpy.resetHistory();

				//act: expand via the 'expand' visual indicator
				oExpandButton.firePress();

				// check scroll adjustment called
				assert.strictEqual(oScrollSpy.callCount, 1, "executed scroll to show the visual indicator");
				done();
			}, 500); //allow the page to scroll to the required position
		});

		await helpers.renderObject(oObjectPage);
		oObjectPage.$().outerHeight("800px"); // set page height smaller than header height
	});

	QUnit.test("_getClosestScrolledSectionBaseId anchorBar mode", function (assert) {
		const done = assert.async();
		XMLView.create({
			id: "UxAP-objectPageContentScrolling",
			viewName: "view.UxAP-ObjectPageContentScrolling"
		}).then(async (oView) => {
			this.oObjectPageContentScrollingView = oView;
			this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
			await nextUIUpdate();

			const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
			const oFirstSubSection = oObjectPage.getSections()[0].getSubSections()[0];
			const oSecondSubSection = oObjectPage.getSections()[0].getSubSections()[0];
			let iFirstSubSectionScrollTop;
			let iSecondSubSectionScrollTop;
			let iPageHeight;

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				iPageHeight = oObjectPage.getDomRef().offsetHeight;
				iFirstSubSectionScrollTop = oObjectPage._computeScrollPosition(oFirstSubSection);
				iSecondSubSectionScrollTop = oObjectPage._computeScrollPosition(oSecondSubSection);

				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iFirstSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oFirstSubSection.getId(), "first subsection is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iSecondSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSubSection.getId(), "second subsection is closest");
				this.oObjectPageContentScrollingView.destroy();
				done();
			}.bind(this));
		});
	});

	QUnit.test("_getClosestScrolledSectionBaseId tabs mode", function (assert) {
		const done = assert.async();
		XMLView.create({
			id: "UxAP-objectPageContentScrolling",
			viewName: "view.UxAP-ObjectPageContentScrolling"
		}).then(async (oView) => {
			this.oObjectPageContentScrollingView = oView;
			this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
			await nextUIUpdate();

			const oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");
			const oSecondSection = oObjectPage.getSections()[1];
			const oSecondSectionFirstSubSection = oSecondSection.getSubSections()[0];
			const oSecondSectionSecondSubSection = oSecondSection.getSubSections()[0];
			let iFirstSubSectionScrollTop;
			let iSecondSubSectionScrollTop;
			let iPageHeight;

			// select the second visible tab
			oObjectPage.setSelectedSection();

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				iPageHeight = oObjectPage.getDomRef().offsetHeight;
				iFirstSubSectionScrollTop = oObjectPage._computeScrollPosition(oSecondSectionFirstSubSection);
				iSecondSubSectionScrollTop = oObjectPage._computeScrollPosition(oSecondSectionSecondSubSection);

				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iFirstSubSectionScrollTop + 10, iPageHeight, false /* sections only */), oSecondSection.getId(), "second section is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iFirstSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSectionFirstSubSection.getId(), "first subsection is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iSecondSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSectionSecondSubSection.getId(), "second subsection is closest");
				this.oObjectPageContentScrollingView.destroy();
				done();
			}.bind(this));
		});
	});

	QUnit.module("No visible section", {
		beforeEach: function (assert) {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("_shouldAllowScrolling checks if visible sections exist", async function (assert) {
		assert.expect(2);
		const oObjectPage = this.oObjectPage;
		const oSpy = this.spy(oObjectPage, "_shouldAllowScrolling");

		await helpers.renderObject(this.oObjectPage);
		await waitForDOMReady(oObjectPage);

		// Setup
		oSpy.resetHistory();
		oObjectPage._bAllContentFitsContainer = true;

		// Act:
		oObjectPage.getSections()[0].destroy();
		// call synchronously to speed up the test
		oObjectPage._requestAdjustLayout(true);
		assert.ok(oSpy.calledOnce, "check for scrolling is requested");
		assert.ok(oSpy.returned(true), "result is correct");
	});

	QUnit.test("Resetting visibility of subsection does not lead to exception", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPage;
		const oSubSection = oObjectPage.getSections()[0].getSubSections()[0];

		await helpers.renderObject(oObjectPage);

		oSubSection.setVisible(false);
		oObjectPage._applyUxRules();

		const oSelectedSection = Element.getElementById(oObjectPage.getSelectedSection());
		oSelectedSection.setSelectedSubSection(oSubSection);

		const oComputeScrollPositionSpy = this.spy(oObjectPage, "_computeScrollPosition");

		oObjectPage._initAnchorBarScroll();

		assert.ok(oComputeScrollPositionSpy.calledWith(oSelectedSection), "scroll position fallback to parent section from subsection with still not registered info");

	});

	function isObjectPageHeaderStickied(oObjectPage) {
		const oHeaderTitle = oObjectPage.getDomRef("headerTitle");
		const oHeaderContent = oObjectPage.getDomRef("headerContent");
		return oHeaderTitle.classList.contains("sapUxAPObjectPageHeaderStickied") &&
				oHeaderContent.classList.contains("sapUxAPObjectPageHeaderDetailsHidden") &&
				oHeaderContent.style["overflow"] == "hidden";
	}

	QUnit.module("Scroll position correction after async content growth");

	QUnit.test("_correctScrollPositionIfNeeded does not scroll when position is already correct", function (assert) {
		assert.expect(2);

		const oObjectPage = oFactory.getObjectPage();
		const sId = "someSection";
		const iCorrectTarget = 500;
		const oFakeSectionRef = { getId: function() { return sId; } };

		oObjectPage._oSectionInfo[sId] = { positionTop: iCorrectTarget, sectionReference: oFakeSectionRef };
		oObjectPage._requestAdjustLayout = sinon.stub();
		oObjectPage._computeScrollPosition = sinon.stub().returns(iCorrectTarget);
		oObjectPage._$opWrapper = { length: 1, scrollTop: sinon.stub().returns(iCorrectTarget), off: sinon.stub() };
		oObjectPage._scrollTo = sinon.stub();

		oObjectPage._correctScrollPositionIfNeeded(sId);

		assert.ok(oObjectPage._requestAdjustLayout.calledWith(true), "_requestAdjustLayout called to re-measure");
		assert.notOk(oObjectPage._scrollTo.called, "_scrollTo not called when already at correct position");

		oObjectPage.destroy();
	});

	QUnit.test("_correctScrollPositionIfNeeded snap-corrects when async content caused position drift", function (assert) {
		assert.expect(1);

		const oObjectPage = oFactory.getObjectPage();
		const sId = "someSection";
		const iStaleScrollTop = 400;
		const iCorrectedTarget = 600; // content grew: real section is now at 600
		const oFakeSectionRef = { getId: function() { return sId; } };

		oObjectPage._oSectionInfo[sId] = { positionTop: iStaleScrollTop, sectionReference: oFakeSectionRef };
		oObjectPage._requestAdjustLayout = sinon.stub();
		oObjectPage._computeScrollPosition = sinon.stub().returns(iCorrectedTarget);
		oObjectPage._$opWrapper = { length: 1, scrollTop: sinon.stub().returns(iStaleScrollTop), off: sinon.stub() };
		oObjectPage._scrollTo = sinon.stub();

		oObjectPage._correctScrollPositionIfNeeded(sId);

		assert.ok(oObjectPage._scrollTo.calledWith(iCorrectedTarget, 0),
			"_scrollTo called with corrected target and duration 0");

		oObjectPage.destroy();
	});

	QUnit.test("_correctScrollPositionIfNeeded is a no-op when a newer scroll is in progress", function (assert) {
		assert.expect(2);

		const oObjectPage = oFactory.getObjectPage();
		const sStaleId = "section6";
		const sCurrentId = "section5";
		const oFakeSectionRef = { getId: function() { return sStaleId; } };

		oObjectPage._oSectionInfo[sStaleId] = { positionTop: 600, sectionReference: oFakeSectionRef };
		oObjectPage._sCurrentScrollId = sCurrentId; // user already clicked section 5
		oObjectPage._requestAdjustLayout = sinon.stub();
		oObjectPage._scrollTo = sinon.stub();

		oObjectPage._correctScrollPositionIfNeeded(sStaleId);

		assert.notOk(oObjectPage._requestAdjustLayout.called, "_requestAdjustLayout not called for stale section");
		assert.notOk(oObjectPage._scrollTo.called, "_scrollTo not called for stale section");

		oObjectPage.destroy();
	});

	QUnit.test("_correctScrollPositionIfNeeded is a no-op for unknown section", function (assert) {
		assert.expect(2);

		const oObjectPage = oFactory.getObjectPage();

		oObjectPage._requestAdjustLayout = sinon.stub();
		oObjectPage._scrollTo = sinon.stub();

		oObjectPage._correctScrollPositionIfNeeded("nonExistentSection");

		assert.notOk(oObjectPage._requestAdjustLayout.called, "_requestAdjustLayout not called for unknown section");
		assert.notOk(oObjectPage._scrollTo.called, "_scrollTo not called for unknown section");

		oObjectPage.destroy();
	});

	QUnit.module("AnchorBar scroll preservation during header snap");

	QUnit.test("_needsAnchorBarPlaceholderForScrollPreservation returns false when sufficient scroll space remains", function(assert) {
		const oObjectPage = oFactory.getObjectPage();

		// Mock: scrollHeight=1000, offsetHeight=500 -> maxScroll=500
		// scrollTop=100, anchorBarHeight=48 -> maxScrollAfterRemoval=452
		// 452 > 100, so no placeholder needed
		oObjectPage._$opWrapper = {
			0: {
				scrollHeight: 1000,
				offsetHeight: 500
			},
			scrollTop: function() { return 100; }
		};
		oObjectPage.iAnchorBarHeight = 48;

		// Act & Assert
		assert.strictEqual(oObjectPage._needsAnchorBarPlaceholderForScrollPreservation(), false,
			"Returns false when sufficient scroll space remains after anchorBar removal");

		oObjectPage.destroy();
	});

	QUnit.test("_needsAnchorBarPlaceholderForScrollPreservation returns true when insufficient scroll space", function(assert) {
		const oObjectPage = oFactory.getObjectPage();

		// Mock: scrollHeight=1000, offsetHeight=500 -> maxScroll=500
		// scrollTop=480, anchorBarHeight=48 -> maxScrollAfterRemoval=452
		// 452 < 480, so placeholder IS needed
		oObjectPage._$opWrapper = {
			0: {
				scrollHeight: 1000,
				offsetHeight: 500
			},
			scrollTop: function() { return 480; }
		};
		oObjectPage.iAnchorBarHeight = 48;

		// Act & Assert
		assert.strictEqual(oObjectPage._needsAnchorBarPlaceholderForScrollPreservation(), true,
			"Returns true when insufficient scroll space would remain after anchorBar removal");

		oObjectPage.destroy();
	});

	QUnit.test("_moveAnchorBarToTitleArea preserves scroll by using placeholder when needed", function(assert) {
		const oObjectPage = oFactory.getObjectPage();

		// Setup
		oObjectPage._$opWrapper = {
			0: {
				scrollHeight: 1000,
				offsetHeight: 500
			},
			scrollTop: function() { return 480; }
		};
		oObjectPage.iAnchorBarHeight = 48;
		oObjectPage._$anchorBar = {
			css: sinon.stub(),
			children: function() {
				return { appendTo: sinon.stub() };
			}
		};
		oObjectPage._$stickyAnchorBar = {};
		oObjectPage._adjustTitlePositioning = sinon.stub();
		oObjectPage._toggleHeaderStyleRules = sinon.stub();

		// Act
		oObjectPage._moveAnchorBarToTitleArea();

		// Assert
		assert.ok(oObjectPage._$anchorBar.css.calledWith("height", "48px"),
			"Placeholder height is set before moving anchorBar");
		assert.ok(oObjectPage._adjustTitlePositioning.called,
			"Layout adjustment is called while placeholder is active");
		assert.ok(oObjectPage._$anchorBar.css.calledWith("height", ""),
			"Placeholder height is removed after layout adjustment");

		oObjectPage.destroy();
	});

});