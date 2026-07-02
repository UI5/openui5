/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
	"sap/uxap/library",
	"sap/ui/core/library",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Link",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/NavContainer",
	"sap/uxap/testblocks/GenericDiv",
	"sap/base/Log",
	"sap/ui/Device",
	"sap/ui/dom/getScrollbarSize",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/base/ManagedObject",
	"sap/m/OverflowToolbar",
	"sap/uxap/ObjectPageAccessibleLandmarkInfo",
	"sap/ui/test/utils/nextUIUpdate"
],
function(
	Element,
	jQuery,
	lib,
	coreLib,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeader,
	ObjectPageDynamicHeaderTitle,
	Text,
	Title,
	Link,
	Button,
	Page,
	App,
	NavContainer,
	GenericDiv,
	Log,
	Device,
	getScrollbarSize,
	XMLView,
	ManagedObject,
	OverflowToolbar,
	ObjectPageAccessibleLandmarkInfo,
	nextUIUpdate
) {
	"use strict";

	//eslint-disable-next-line no-void
	const makeVoid = (fn) => (...args) => void fn(...args);

	/**
	 * Returns a Promise that resolves after the ObjectPageLayout fires onAfterRenderingDOMReady.
	 * @param {sap.uxap.ObjectPageLayout} oOPL The ObjectPageLayout instance to wait for
	 * @returns {Promise<void>} A promise that resolves when the DOM is ready
	 */
	function waitForDOMReady(oOPL) {
		return new Promise((resolve) => {
			oOPL.attachEventOnce("onAfterRenderingDOMReady", resolve);
		});
	}

	const TitleLevel = coreLib.TitleLevel;
	const ObjectPageLayoutMediaRange = lib.ObjectPageLayoutMediaRange;
	const oFactory = {
			getSection: function (iNumber, sTitleLevel, aSubSections, visibility) {
				return new ObjectPageSection({
					title: "Section" + iNumber,
					titleLevel: sTitleLevel,
					subSections: aSubSections || [],
					visible: visibility
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
			getHeaderTitle: function() {
				return new ObjectPageHeader({
					objectTitle: "Long title that wraps and goes over more lines",
					objectSubtitle: "Long subtitle that wraps and goes over more lines"
				});
			},
			getObjectPageDynamicHeaderTitle: function () {
				return new ObjectPageDynamicHeaderTitle({
					content: [new Text({text: "some text"})],
					expandedContent: [new GenericDiv({"height":"100px", text:"some content"})]
				});
			},
			getHeaderContent: function() {
				return new GenericDiv({"height":"100px", text:"some content"});
			},
			getObjectPage: function () {
				return new ObjectPageLayout();
			},
			getObjectPageLayoutWithIconTabBar: function () {
				return new ObjectPageLayout({
					useIconTabBar: true
				});
			},
			getObjectPageLayoutWithSectionTitleLevel: function (sSectionTitleLevel) {
				return new ObjectPageLayout({
					sectionTitleLevel: sSectionTitleLevel,
					sections:
						oFactory.getSection(1, null, [
							oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(3, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(4, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						])

				});
			},
			getObjectPageLayoutWithOneVisibleSection: function () {
				return new ObjectPageLayout({
					sections: [
						oFactory.getSection(1, null, [
							oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						]),
						oFactory.getSection(2, null, [
							oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						], false)
					]
				});
			}
	};
	const helpers = {
			generateObjectPageWithContent: function (oFactory, iNumberOfSection, bUseIconTabBar, bFooter) {
				const oObjectPage = bUseIconTabBar ? oFactory.getObjectPageLayoutWithIconTabBar() : oFactory.getObjectPage();
				let oSection;
				let oSubSection;

				for (let i = 0; i < iNumberOfSection; i++) {
					oSection = oFactory.getSection(i);
					oSubSection = oFactory.getSubSection(i, oFactory.getBlocks());
					oSection.addSubSection(oSubSection);
					oObjectPage.addSection(oSection);
				}

				if (bFooter) {
					oObjectPage.setFooter(new OverflowToolbar());
				}

				return oObjectPage;
			},
			generateObjectPageWithSubSectionContent: function (oFactory, iNumberOfSection, iNumberOfSubSection, bUseIconTabBar) {
				const oObjectPage = bUseIconTabBar ? oFactory.getObjectPageLayoutWithIconTabBar() : oFactory.getObjectPage();
				let oSection;
				let oSubSection;
				let sSectionId;
				let sSubSectionId;

				for (let i = 0; i < iNumberOfSection; i++) {
					sSectionId = "s" + i;
					oSection = oFactory.getSection(sSectionId);

					for (let j = 0; j < iNumberOfSubSection; j++) {
						sSubSectionId = sSectionId + "ss" + j;
						oSubSection = oFactory.getSubSection(sSubSectionId, oFactory.getBlocks());
						oSection.addSubSection(oSubSection);
					}

					oObjectPage.addSection(oSection);
				}

				return oObjectPage;
			},
			renderObject: async function (oSapUiObject) {
				oSapUiObject.placeAt("qunit-fixture");
				await nextUIUpdate();
				return oSapUiObject;
			},
			toPhoneMode: function (oObjectPage) {
				oObjectPage.$().removeClass("sapUxAPObjectPageLayout-Std-Desktop")
				.removeClass("sapUxAPObjectPageLayout-Std-Desktop-XL")
				.removeClass("sapUxAPObjectPageLayout-Std-Tablet")
				.addClass("sapUxAPObjectPageLayout-Std-Phone");
		Device.system.desktop = false;
		Device.system.tablet = false;
		Device.system.phone = true;
	},
	toTabletMode: function (oObjectPage) {
		oObjectPage.$().removeClass("sapUxAPObjectPageLayout-Std-Desktop")
				.removeClass("sapUxAPObjectPageLayout-Std-Desktop-XL")
				.removeClass("sapUxAPObjectPageLayout-Std-Phone")
				.addClass("sapUxAPObjectPageLayout-Std-Tablet");
		Device.system.desktop = false;
		Device.system.phone = false;
		Device.system.tablet = true;
	},
	toDesktopMode: function (oObjectPage) {
		oObjectPage.$().addClass("sapUxAPObjectPageLayout-Std-Desktop")
				.removeClass("sapUxAPObjectPageLayout-Std-Desktop-XL")
				.removeClass("sapUxAPObjectPageLayout-Std-Tablet")
				.removeClass("sapUxAPObjectPageLayout-Std-Phone");
		Device.system.desktop = true;
		Device.system.tablet = false;
		Device.system.phone = false;
	},
	toDesktopXLMode: function (oObjectPage) {
		oObjectPage.$().addClass("sapUxAPObjectPageLayout-Std-Desktop-XL")
				.removeClass("sapUxAPObjectPageLayout-Std-Desktop")
				.removeClass("sapUxAPObjectPageLayout-Std-Tablet")
				.removeClass("sapUxAPObjectPageLayout-Std-Phone");
				Device.system.desktop = true;
				Device.system.tablet = false;
				Device.system.phone = false;
			},
			exists: function (vObject) {
				if (arguments.length === 1) {
					return vObject && ("length" in vObject) ? vObject.length > 0 : !!vObject;
				}

				return Array.prototype.slice.call(arguments).every(function (oObject) {
					return this.exists(oObject);
				});
			}
		};

	QUnit.module("Section without sub-section");

	QUnit.test("Section without sub-section simulation", async function(assert) {

		// Arrange
		const oMainSection = new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							blocks: [new Text({text: "test"})]
						}),
						new ObjectPageSubSection({
							blocks: [new Text({text: "text"})]
						})
					]
			});
		const oObjectPageLayout = new ObjectPageLayout({
				sections: oMainSection
			});
		// Assert
		assert.expect(1); // The test is expected to have one assert

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oObjectPageLayout);

		oMainSection.removeAllSubSections();
		const sClosestID = oObjectPageLayout._getClosestScrolledSectionBaseId(0, "iPageHeight is not defined", true);

		// Assert
		assert.strictEqual(sClosestID, oMainSection.sId, "check if _getClosestScrolledSectionBaseId returns the correct value");

		// Cleanup
		oObjectPageLayout.destroy();
	});

	QUnit.module("IconTabBar is initially enabled", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Using UseIconTabBar via Control settings", function (assert) {
		assert.strictEqual(this.oObjectPage.getUseIconTabBar(), true);
	});
	QUnit.test("Using UseIconTabBar does not disable the use of an AnchorBar", function (assert) {
		assert.strictEqual(this.oObjectPage.getShowAnchorBar(), true);
	});

	QUnit.module("IconTabBar is initially not enabled", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPage();
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("The default value of UseIconTabBar", function (assert) {
		assert.strictEqual(this.oObjectPage.getUseIconTabBar(), false, "is correctly set to false");
	});

	QUnit.test("test UseIconTabBar APIs", async function(assert) {
		assert.expect(4);
		// Act
		this.oObjectPage.setUseIconTabBar(false);
		await nextUIUpdate();

		// Assert
		assert.ok(!this.oObjectPage.getUseIconTabBar(), false);
		assert.notOk(this.oObjectPage.$().hasClass("sapUxAPObjectPageLayoutIconTabBar"),
			"'sapUxAPObjectPageLayoutIconTabBar' is not applied when OPL is not in iconTabBar mode");

		// Act
		this.oObjectPage.setUseIconTabBar(true);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oObjectPage.$().hasClass("sapUxAPObjectPageLayoutIconTabBar"),
			"'sapUxAPObjectPageLayoutIconTabBar' is  applied when OPL is in iconTabBar mode");
		assert.ok(this.oObjectPage.getUseIconTabBar(), true);
	});

	QUnit.module("IconTabBar enabled with one visible section", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPageLayoutWithOneVisibleSection();
			this.oObjectPage.setUseIconTabBar(true);
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Object Page shows first section title when only one section is visible", function (assert) {
		//Arrange
		const oFirstSection = this.oObjectPage.getSections()[0];
		const oSubSection = oFirstSection.getSubSections()[0];

		oFirstSection.setShowTitle(true);

		//Assert
		assert.ok(oFirstSection.$().find(".sapUxAPObjectPageSectionHeader").hasClass("sapUxAPObjectPageSectionHeaderHidden"),
			"Header container of Section is not visible in the DOM");
		assert.ok(oFirstSection.$().hasClass("sapUxAPObjectPageSectionNoTitle"), "CSS class for no title shown is there");
		assert.ok(oSubSection.$().find(".sapUxAPObjectPageSubSectionTitle ").length > 0, "Title container of SubSection is visible in the DOM");

	});

	QUnit.module("test scrollToSection API", {
		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Calling scrollToSection when OPL is not rendered should do nothing", function (assert) {
		assert.ok(Log, "Log module should be available");

		const oObjectPage = this.oObjectPage;
		const oFirstSection = oObjectPage.getSections()[0];
		const oLoggerSpy = this.spy(Log, "warning");
		const oComputeScrollPositionSpy = this.spy(oObjectPage, "_computeScrollPosition");

		assert.ok(!oObjectPage.getDomRef(), "ObjectPage is not rendered");

		oObjectPage.scrollToSection(oFirstSection.getId());

		assert.ok(!oComputeScrollPositionSpy.called, "Compute scroll position not called when OPL is not rendered");

		assert.ok(oLoggerSpy.calledWith("scrollToSection can only be used after the ObjectPage is rendered", oObjectPage), "Warning message is logged");
	});

	QUnit.test("Calling scrollToSection before its onAfterRendring hook should not throw error", async function (assert) {
		assert.expect(2);
		const oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		let oAnchorBar;
		const oFirstSection = oObjectPage.getSections()[0];

		oObjectPage.addEventDelegate({
			onBeforeRendering: function() {
				oAnchorBar = oObjectPage.getAggregation("_anchorBar");
				oAnchorBar.addEventDelegate({
					onAfterRendering: function() {
						assert.strictEqual(oObjectPage._bDomReady, false, "ObjectPage DOM is not ready");
						try {
							oObjectPage.scrollToSection(oFirstSection.getId());
							assert.ok(true, "No error is thrown");
						} catch (e) {
							assert.notOk(e, "Error should be thrown");
						}
						oAnchorBar.removeEventDelegate(this);
					}
				});
				oObjectPage.removeEventDelegate(this);
			}
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Use IconTabBar with no sections", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("test IconTabBar is empty", function (assert) {
		assert.strictEqual(this.oObjectPage._oABHelper._getAnchorBar().getItems().length, 0, 'The IconTabBar content aggregation is empty');
	});

	QUnit.test("test IconTabBar shoud not be created when 0 section is provided", function (assert) {
		const expectedNumberOfSections = 0;

		assert.strictEqual(this.oObjectPage.getSections().length, expectedNumberOfSections, 'The ObjectPage has ' +
		expectedNumberOfSections + ' sections');
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation").length, "anchor bar when no sections");
		assert.strictEqual(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation *").length, 0, "empty anchor bar when no sections");
	});

	QUnit.module("Use IconTabBar with one section", {
		beforeEach: async function () {
			this.NUMBER_OF_SECTIONS = 1;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("test empty anchorBar when one section is provided", function (assert) {
		const expectedNumberOfSections = this.NUMBER_OF_SECTIONS;

		// one section only
		assert.strictEqual(this.oObjectPage.getSections().length, expectedNumberOfSections, 'The ObjectPage has ' +
		expectedNumberOfSections + ' sections');

		//empty anchor bar
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation").length, "anchor bar when no sections");
		assert.strictEqual(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation *").length, 0, "empty anchor bar when no sections");
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageContainerNoBar").length, "Empty bar when single section");
	});

	QUnit.test("test the section is rendered", function (assert) {
		//section is rendered
		const sSectionId = this.oObjectPage.getSections()[0].getId();
		assert.ok(this.oObjectPage.$().find("#" + sSectionId + " *").length, "section is rendered");
	});

	QUnit.module("test selectedSection association API", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			this.oSecondSection = this.oObjectPage.getSections()[1];
			this.oThirdSection = this.oObjectPage.getSections()[2];
			this.oObjectPage.setSelectedSection(this.oSecondSection.getId());
			this.iLoadingDelay = 1000;

		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oSecondSection = null;
			this.oThirdSection = null;
			this.iLoadingDelay = 0;
		}
	});

	QUnit.test("test user defined selected section", async function (assert) {
		assert.expect(4);
		const oObjectPage = this.oObjectPage;
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		const oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("test selected section when hiding another one", async function (assert) {
		assert.expect(4);
		/* Arrange */
		const oObjectPage = this.oObjectPage;
		const oExpected = {
				oSelectedSection: this.oSecondSection,
				sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle()
			};
		const done = assert.async();

		/* Act: Hide the third section.
		 /* which used to cause a failure, see BCP: 1770148914 */
		this.oThirdSection.setVisible(false);

		setTimeout(function () {
			/* Assert:
			 /* The ObjectPage adjusts its layout, */
			/* but the selected section should remain the same. */
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("test selected section when removing another one", async function (assert) {
		assert.expect(11);
		/* Arrange */
		const oObjectPage = this.oObjectPage;
		const iNonIntegerHeaderContentHeight = 99.7; // header content height should not be an integer
		const oHeaderContent = new GenericDiv({
				height: iNonIntegerHeaderContentHeight + "px",
				margin: "0", // to suppress any margin imposed by the OP laoyut
				padding: "0", // to suppress any padding imposed by the OP layout
				text: "some content"});
		const oExpected = {
				oSelectedSection: this.oSecondSection,
				sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle()
			};
		const done = assert.async();
		const _pxToNumber = function (sSizeToConvert) {
				return (sSizeToConvert.substring(0, (sSizeToConvert.length - 2)) ) * 1;
			};

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.addHeaderContent(oHeaderContent);
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function() {
				const oHeaderContentDOM = oObjectPage._getHeaderContent().getDomRef();
				const sPaddingTop = _pxToNumber(window.getComputedStyle(oHeaderContentDOM, null).getPropertyValue('padding-top'));
				const sPaddingBottom = _pxToNumber(window.getComputedStyle(oHeaderContentDOM, null).getPropertyValue('padding-bottom'));

				// assert that the page internally rounds (ceils) the header content heights
				assert.notEqual(oObjectPage.iHeaderContentHeight, iNonIntegerHeaderContentHeight, "cached headerContent height is rounded");
				assert.strictEqual(oObjectPage.iHeaderContentHeight, 100 + sPaddingTop + sPaddingBottom, "cached headerContent height is ceiled");

				// Act: make an action that causes the page to have (1) first visible section selected but (2) header snapped
				oObjectPage.removeSection(0);

				// as the above causes invalidation, hook to onAfterRendering to check resulting state:
				oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
					setTimeout(function () {
						sectionIsSelected(oObjectPage, assert, oExpected);
						assert.ok(isTolerableDifference(oObjectPage._$opWrapper.scrollTop(), oObjectPage.iHeaderContentHeight, 1), "top section is selected");
						assert.strictEqual(oObjectPage._bStickyAnchorBar, true, "anchor bar is snapped");
						assert.strictEqual(oObjectPage._bHeaderExpanded, false, "header is snapped");

						oObjectPage._onScroll({target: {scrollTop: iNonIntegerHeaderContentHeight + sPaddingTop + sPaddingBottom}}); // scrollEnablement kicks in to restore last saved Y position, which is not rounded (ceiled)
						assert.strictEqual(oObjectPage._bStickyAnchorBar, true, "anchor bar is still snapped");
						assert.strictEqual(oObjectPage._bHeaderExpanded, false, "header is still snapped");
						done();
					}, 100);
				});
			}, 1000);
		});
		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("unset selected section", async function (assert) {
		assert.expect(11);
		// Arrange
		const oObjectPage = this.oObjectPage;
		const oFirstSection = this.oObjectPage.getSections()[0];
		const oSecondSection = this.oSecondSection;
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)
		let oExpected;
		let oAnchorBarRebuildSpy;
		let oSubSectionVisibilityEventSpy;
		let oSectionPreloadSpy;

		setTimeout(function () {

			// initially, the second section is selected (from the module setup)
			oExpected = {
				oSelectedSection: oSecondSection,
				sSelectedTitle: oSecondSection.getSubSections()[0].getTitle()
			};

			// Assert
			sectionIsSelected(oObjectPage, assert, oExpected);

			oAnchorBarRebuildSpy = this.spy(oObjectPage._oABHelper, "_buildAnchorBar");
			oSubSectionVisibilityEventSpy = this.spy(oObjectPage, "_checkSubSectionVisibilityChange");
			oSectionPreloadSpy = this.spy(oObjectPage, "_preloadSectionsOnBeforeScroll");

			// Act: unset the currently selected section
			oObjectPage.setSelectedSection(null);

			// Check: the selection moved to the first visible section
			oExpected = {
				oSelectedSection: oFirstSection,
				sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
			};

			// Assert
			sectionIsSelected(oObjectPage, assert, oExpected);
			assert.ok(oAnchorBarRebuildSpy.notCalled, "AnchorBar is not rebuilt in IconTabBar mode when setSelectedSection is called with null");
			assert.ok(oSubSectionVisibilityEventSpy.calledOnce, "_checkSubSectionVisibilityChange is called once");
			assert.ok(oSectionPreloadSpy.calledOnce, "Section is loaded");

			// Clean up
			done();
		}.bind(this), this.iLoadingDelay);

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("unset selected section resets expanded state", async function (assert) {
		assert.expect(11);
		// Arrange
		const oObjectPage = this.oObjectPage;
		const oFirstSection = this.oObjectPage.getSections()[0];
		const oSecondSection = this.oSecondSection;
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)
		let oExpected;
		let oAnchorBarRebuildSpy;

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function () {

				// initially, the second section is selected (from the module setup)
				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getSubSections()[0].getTitle()
				};

				// Assert
				sectionIsSelected(oObjectPage, assert, oExpected);
				assert.equal(oObjectPage._bHeaderExpanded, false, "Header is snapped");

				oAnchorBarRebuildSpy = this.spy(oObjectPage._oABHelper, "_buildAnchorBar");

				// Act: unset the currently selected section
				oObjectPage.setSelectedSection(null);

				// Check: the selection moved to the first visible section
				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
				};

				setTimeout(function () {
					// Assert
					sectionIsSelected(oObjectPage, assert, oExpected);
					assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expnded");
					assert.ok(oAnchorBarRebuildSpy.notCalled, "AnchorBar is not rebuilt when setSelectedSection is called with null");

					// Clean up
					done();
				}, 0);
			}.bind(this), this.iLoadingDelay);
		}.bind(this));

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.test("unset selected section when header always in title area", async function (assert) {
		const oObjectPage = this.oObjectPage;

		assert.expect(2);

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());
		oObjectPage.setIsHeaderContentAlwaysExpanded(true);

		// ensure desktop mode
		helpers.toDesktopMode(oObjectPage);
		this.stub(lib.Utilities, "isPhoneScenario").returns(false);
		this.stub(lib.Utilities, "isTabletScenario").returns(false);

		await helpers.renderObject(this.oObjectPage);
		await waitForDOMReady(oObjectPage);

		// Act: unset the currently selected section
		oObjectPage.setSelectedSection(null);

		// Check: the header is still expanded in the title
		await new Promise((resolve) => { setTimeout(resolve, 0); });

		// Assert
		assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expanded");
		assert.equal(oObjectPage._bHeaderInTitleArea, true, "Header is still in the title area");
	});

	QUnit.test("unset selected section of hidden page", async function (assert) {
		assert.expect(11);
		const oObjectPage = this.oObjectPage;
		const oFirstSection = this.oObjectPage.getSections()[0];
		const oSecondSection = this.oSecondSection;
		const oSpy = this.spy(oObjectPage, "_scrollTo");
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)
		let sOrigDisplay;
		let oExpected;

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());

		// add header content
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
			// initially, the second section is selected (from the module setup)
			oExpected = {
				oSelectedSection: oSecondSection,
				sSelectedTitle: oSecondSection.getSubSections()[0].getTitle()
			};
			sectionIsSelected(oObjectPage, assert, oExpected);
			assert.equal(oObjectPage._bHeaderExpanded, false, "Header is snapped");
			sOrigDisplay = oObjectPage.getDomRef().style.display;

			// Act
			oObjectPage.getDomRef().style.display = "none";
			oSpy.resetHistory();
			oObjectPage.setSelectedSection(null);

			oObjectPage.getDomRef().style.display = sOrigDisplay;
			oObjectPage._onUpdateScreenSize({ // mock resize handler call after size restored
				size: { width: 1000, height: 1000 },
				oldSize: { width: 0, height: 0 }
			});

			setTimeout(function() {
				assert.ok(oSpy.calledWith(0, 0), "page is scrolled to top");
				// synchronously call the scroll listener to save adding a timeout in the test
				oObjectPage._onScroll({target: {scrollTop: 0}});
				// Check: the selection moved to the first visible section
				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
				};
				sectionIsSelected(oObjectPage, assert, oExpected);
				assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header is expnded");

				// cleanup
				oObjectPage.destroy();
				done();
			}, oObjectPage._getDOMCalculationDelay());

		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("unset selected section before layout adjusted", async function (assert) {
		assert.expect(6);
		const oObjectPage = this.oObjectPage;
		const oFirstSection = this.oObjectPage.getSections()[0];
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)
		let oExpected;

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());

		oFirstSection.setVisible(false);

		const oDelegate = {
			onAfterRendering: function () {
				oObjectPage.removeEventDelegate(oDelegate);

				// Act: change first section to *make it the first visible* AND unset selectedSection
				oFirstSection.setVisible(true);
				oObjectPage.setSelectedSection(null);

				setTimeout(function() {
					// Check: the selection moved to the first visible section
					oExpected = {
						oSelectedSection: oFirstSection,
						sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
					};
					sectionIsSelected(oObjectPage, assert, oExpected);
					assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expnded");
					assert.equal(oObjectPage._$opWrapper.scrollTop(), 0, "page is scrolled to top");
					done();
				}, 500);
			}
		};

		oObjectPage.addEventDelegate(oDelegate);

		await helpers.renderObject(oObjectPage);
	});


	QUnit.test("call setSelectedSection(null) when the first visible section is already selected", async function (assert) {
		assert.expect(6);
		const oObjectPage = this.oObjectPage;
		const oFirstSection = this.oObjectPage.getSections()[0];
		const oSecondSection = this.oObjectPage.getSections()[1];
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)
		let oExpected;

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.addHeaderContent(oFactory.getHeaderContent());

		oFirstSection.setVisible(false);

		const oDelegate = {
			onAfterRendering: function () {
				oObjectPage.removeEventDelegate(oDelegate);

				setTimeout(function() {
					// Act: change first section to *make it the first visible* AND unset selectedSection
					oObjectPage.setSelectedSection(null);

					setTimeout(function() {
						// Check: the selection moved to the first visible section
						oExpected = {
							oSelectedSection: oSecondSection,
							sSelectedTitle: oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
						};
						sectionIsSelected(oObjectPage, assert, oExpected);
						assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expanded");
						assert.equal(oObjectPage._$opWrapper.scrollTop(), 0, "page is scrolled to top");
						done();
					}, 500);
				}, 500);
			}
		};

		oObjectPage.addEventDelegate(oDelegate);

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("reset setSelectedSection when single visible section", async function (assert) {
		assert.expect(1);
		const oObjectPage = this.oObjectPage;
		const oSubSection = oFactory.getSubSection(1, oFactory.getBlocks());
		const oSection = oFactory.getSection(1, null, oSubSection);

		oObjectPage.setUseIconTabBar(false);

		// single section only
		oObjectPage.removeAllSections();
		oObjectPage.addSection(oSection);

		await helpers.renderObject(oObjectPage);
		oObjectPage.setSelectedSection(null);

		assert.strictEqual(oObjectPage.getSelectedSection(), oSection.getId(), "selected section is correct");
	});


	QUnit.test("scroll to selected section on rerender", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const oSecondSection = this.oObjectPage.getSections()[1];
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		assert.expect(2);

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setSelectedSection(oSecondSection);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			// assert state before second rendering
			assert.ok(oObjectPage._$opWrapper.get(0).scrollTop > 0, "selected section is bellow scrollTop");

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				// assert state after second rendering
				assert.ok(oObjectPage._$opWrapper.get(0).scrollTop > 0, "selected section is bellow scrollTop");
				done();
			});

			// act: rerender
			oObjectPage.invalidate();
			await nextUIUpdate();
		}));

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("scrollEnablement obtains container ref onAfterRendering", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)
		const vOriginalHeight = jQuery("#qunit-fixture").height();

		// ensure page can be scrolled
		jQuery("#qunit-fixture").height("200"); // container small enough
		oObjectPage.setUseIconTabBar(false); // content can be scrolled across sections

		assert.expect(3);

		const oDelegate = {
			onAfterRendering: function () {
				assert.ok(oObjectPage._oScroller._$Container, "scroller has container referefnce");
				assert.strictEqual(oObjectPage._oScroller._$Container.get(0), oObjectPage._$opWrapper.get(0), "scroller has correct container reference");

				oObjectPage._oScroller.scrollTo(0, 10);
				assert.strictEqual(Math.round(oObjectPage._$opWrapper.scrollTop()), 10, "scroller can correctly scroll after we have externally provided the container reference");

				oObjectPage.removeEventDelegate(oDelegate);
				jQuery("#qunit-fixture").height(vOriginalHeight); // restore the original height
				done();
			}
		};
		oObjectPage.addEventDelegate(oDelegate);

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("not scrolled to selected section when navigation is canceled", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const oSecondSection = this.oObjectPage.getSections()[1];
		const oSpy = this.spy(oObjectPage, "scrollToSection");

		assert.expect(1);

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.attachBeforeNavigate(function (oEvent) {
			oEvent.preventDefault();
		});

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		oSpy.reset();

		// Act
		oObjectPage.onAnchorBarTabPress(oSecondSection.getId());

		// Assert
		assert.ok(oSpy.notCalled, "scroll to selected section is prevented");
	});

	QUnit.module("Resizing", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, false);
			this.iLoadingDelay = 2000;
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.iLoadingDelay = 0;
		}
	});

	QUnit.test("adjust selected section", async function (assert) {
		assert.expect(3);
		const oObjectPage = this.oObjectPage;
		const oFirstSection = oObjectPage.getSections()[0];
		const oSecondSection = oObjectPage.getSections()[1];
		const iHeightDiff = 40;
		const oAdjustLayoutSpy = this.spy(oObjectPage, "_requestAdjustLayout");
		const oUpdateSelectionSpy = this.spy(oObjectPage, "_updateSelectionOnScroll");

		// setup step1: add content with defined height
		const oHhtmBlock = new GenericDiv("b1", {height: "300px"}).addStyleClass("innerDiv");
		oFirstSection.getSubSections()[0].addBlock(oHhtmBlock);

		// setup step2
		oObjectPage.setSelectedSection(oSecondSection.getId());

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		const oBlockDomElement = oHhtmBlock.getDomRef();
		const iBlockHeightBefore = oBlockDomElement.offsetHeight;
		const iScrollTopBefore = oObjectPage._$opWrapper.scrollTop();
		const iBlockHeightAfter = iBlockHeightBefore - iHeightDiff;
		const iScrollTopAfter = iScrollTopBefore - iHeightDiff;

		oAdjustLayoutSpy.resetHistory();
		oUpdateSelectionSpy.resetHistory();


		// Act: change height without invalidating any control => on the the resize handler will be responsible for re-adjusting the selection
		oBlockDomElement.style.height = iBlockHeightAfter + "px";

		// mock the (1) scroll and (2) resize listeners that will be fired
		// as a result of the resize of the content:
		// (1) call the scroll listener synchronously to speed-up the test
		oObjectPage._onScroll({target: { scrollTop:  iScrollTopAfter }});
		// (2) call the resize listener synchronously to speed up the test
		oObjectPage._onUpdateContentSize({ size: {}, oldSize: { height: 600, width: 400} });

		// Check
		assert.equal(oAdjustLayoutSpy.callCount, 1, "layout adjustment is called");
		assert.ok(oUpdateSelectionSpy.called, "update selection is called");
		assert.equal(oObjectPage.getSelectedSection(), oSecondSection.getId(), "selected section is correct");
	});

	QUnit.test("ObjectPage resize handler is regestered in onAfterRendering", async function (assert) {
		// arrange
		const oObjectPage = this.oObjectPage;
		const done = assert.async();
		const oDelegate = { onAfterRendering: function() {
					oObjectPage.removeEventDelegate(oDelegate);
					// assert
					assert.ok(oObjectPage._iResizeId !== null, "Resize handler is registered in onAfterRendering function");
					done();
				}};

		assert.expect(2);

		// assert
		assert.strictEqual(oObjectPage._iResizeId, null, "Resize handler is not registered before onAfterRendering function");

		// act
		oObjectPage.addEventDelegate(oDelegate);
		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("ObjectPage DOM element resize listeners deregistered on exit", async function (assert) {
		assert.expect(2);
		// arrange
		const oObjectPage = this.oObjectPage;
		const oSpy1 = this.spy(oObjectPage, "_deregisterScreenSizeListener");
		const oSpy2 = this.spy(oObjectPage, "_deregisterTitleSizeListener");

		await helpers.renderObject(oObjectPage);

		// act
		oSpy1.reset();
		oSpy2.reset();
		oObjectPage.destroy();

		// assert
		assert.strictEqual(oSpy1.callCount, 1, "screen size listener is deregistered");
		assert.strictEqual(oSpy2.callCount, 1, "title-area size listener is deregistered");
	});

	QUnit.test("height metrics are updated on content-resize", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const oFirstSection = oObjectPage.getSections()[0];
		const oSpy = this.spy(oObjectPage, "_adjustHeaderHeights");
		assert.expect(1);

		// setup step1: add content with defined height
		const oHtmlBlock = new GenericDiv("b1", {height: "300px"}).addStyleClass("innerDiv");
		oFirstSection.getSubSections()[0].addBlock(oHtmlBlock);

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		// Act: change height without invalidating any control
		Element.getElementById("b1").getDomRef().style.height = "250px";
		oSpy.resetHistory();
		oObjectPage._onUpdateContentSize({ size: {}, oldSize: {} });

		assert.equal(oSpy.callCount, 1, "recalculation of heights is called");
	});

	QUnit.test("media range is updated on-resize", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const done = assert.async();
		let iWidth = 0;

		this.stub(oObjectPage, "_getMediaContainerWidth").callsFake(function() {
			return iWidth;
		});

		assert.expect(1);

		oObjectPage.addEventDelegate({
			onAfterRendering: function() {
				oObjectPage.removeEventDelegate(this);
				iWidth = 1024; // change to desktop size
				// invoke the resize listener synchronously to save a timeout
				oObjectPage._onUpdateScreenSize({size: {width: 1024}, oldSize: {}});
				assert.notOk(oObjectPage._bMobileScenario, "media range is updated");
				done();
			}
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("test setSelectedSection functionality");

	QUnit.test("test setSelectedSection with initially empty ObjectPage", function (assert) {
		const oObjectPage = oFactory.getObjectPage();
		const sSectionId = "section1";

		// act
		oObjectPage.setSelectedSection(sSectionId);

		// assert
		assert.strictEqual(oObjectPage.getSelectedSection(), sSectionId, "The given section should be the selected one");

		oObjectPage.destroy();
	});

	QUnit.module("IconTabBar section selection", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.NUMBER_OF_SUB_SECTIONS = 2;
			this.oObjectPage = helpers.generateObjectPageWithSubSectionContent(oFactory, this.NUMBER_OF_SECTIONS, this.NUMBER_OF_SUB_SECTIONS, true);
			this.oFirstSection = this.oObjectPage.getSections()[0];
			this.oSecondSection = this.oObjectPage.getSections()[1];
			this.iLoadingDelay = 500;
			this.oObjectPage.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oFirstSection = null;
			this.oSecondSection = null;
			this.iLoadingDelay = 0;
		}
	});

	function sectionIsSelected(oObjectPage, assert, oExpected) {

		const oAnchorBar = oObjectPage.getAggregation('_anchorBar');
		const sSelectedSectionId = oAnchorBar.getSelectedKey();
		const oSelectedFilter = oAnchorBar.getItems().find((i) => i.getKey() === sSelectedSectionId);
		const bExpectedSnapped = oExpected.bSnapped;
		const iExpectedScrollTop = oExpected.iScrollTop;

		assert.ok(oSelectedFilter, "anchorBar has selected filter");
		assert.strictEqual(oSelectedFilter.getText(), oExpected.sSelectedTitle, "section is selected in anchorBar");
		assert.strictEqual(oObjectPage.getSelectedSection(), oExpected.oSelectedSection.getId(), "section is selected in objectPage");
		assert.ok(oObjectPage.$().find("#" + oExpected.oSelectedSection.getId() + "*").length, "section is rendered");

		if (bExpectedSnapped !== undefined) {
			assert.strictEqual(oObjectPage._bStickyAnchorBar, bExpectedSnapped, "header snapped state is correct");
		}
		if (iExpectedScrollTop !== undefined) {
			assert.ok(isTolerableDifference(Math.ceil(oObjectPage._$opWrapper[0].scrollTop), Math.floor(iExpectedScrollTop), 1), "scroll position is correct");
		}
	}

	QUnit.test("test first visible section is initially selected", function (assert) {

		const oPage = this.oObjectPage;
		const oFirstSection = oPage.getSections()[0];
		const done = assert.async();
		const fnOnDomReady = function() {
				const oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);
				done();
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another section", function (assert) {

		const oPage = this.oObjectPage;
		const oSecondSection = oPage.getSections()[1];
		const bTabsMode = oPage.getUseIconTabBar();
		const done = assert.async();
		const fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSecondSection.getId(), 0, null, true);

				const oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another subSection (first subsection)", function (assert) {

		const oPage = this.oObjectPage;
		const oSecondSection = oPage.getSections()[1];
		const bTabsMode = oPage.getUseIconTabBar();
		const done = assert.async();
		const fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSecondSection.getSubSections()[0].getId(), 0, null, true);

				const oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another subSection (second subsection)", function (assert) {

		const oPage = this.oObjectPage;
		const oSecondSection = oPage.getSections()[1];
		const oSubSectionToScrollTo = oSecondSection.getSubSections()[1];
		const done = assert.async();
		const fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSubSectionToScrollTo.getId(), 0, null, true);

				//check
				setTimeout(function() {

					const iExpectedScrollTop = oPage._oSectionInfo[oSubSectionToScrollTo.getId()].positionTop;

					const oExpected = {
						oSelectedSection: oSecondSection,
						sSelectedTitle: oSecondSection.getTitle(),
						bSnapped: true,
						iScrollTop: iExpectedScrollTop
					};

					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section before rendering completed", function (assert) {
		const oPage = this.oObjectPage;
		const oSecondSection = this.oSecondSection;
		const done = assert.async();
		const fnOnDomReady = function() {
				const oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle() //subsection is promoted
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};

		//act
		oPage.setSelectedSection(this.oSecondSection.getId());
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section on before page rendering", function (assert) {

		const oPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 3, 2, true);
		const oSecondSection = oPage.getSections()[1];
		const done = assert.async();
		const fnOnDomReady = function() {
				const oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);

					oPage.destroy();//cleanup
					done();
				}, 0);
			};

		oPage.addEventDelegate({onBeforeRendering: function() {
			oPage.setSelectedSection(oSecondSection.getId());
		}});
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
		oPage.placeAt("qunit-fixture");
	});

	QUnit.test("select another section on after page rendering", function (assert) {
		const oPage = this.oObjectPage;
		const oSecondSection = oPage.getSections()[1];
		const done = assert.async();
		const fnOnDomReady = function() {
				const oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};

		oPage.addEventDelegate({onAfterRendering: function() {
			oPage.setSelectedSection(oSecondSection.getId());
		}});
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section after dom rendering completed", function (assert) {
		const oPage = this.oObjectPage;
		const oSecondSection = oPage.getSections()[1];
		const done = assert.async();
		const fnOnDomReady = function() {
				//act
				oPage.setSelectedSection(oSecondSection.getId());

				const oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide selectedSection when selectedSection is first", function (assert) {
		const oPage = this.oObjectPage;
		const oFirstSection = oPage.getSections()[0];
		const oSecondSection = oPage.getSections()[1];
		const done = assert.async();
		const fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				let oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				oFirstSection.setVisible(false); /* hide first section */

				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide a subsection of selectedSection when selectedSection is first", function (assert) {
		const oPage = this.oObjectPage;
		const oFirstSection = oPage.getSections()[0];
		const done = assert.async();
		const fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				let oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				oFirstSection.getSubSections()[0].setVisible(false);

				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[1].getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide all subsections of selectedSection when selectedSection is first", function (assert) {
		const oPage = this.oObjectPage;
		const oFirstSection = oPage.getSections()[0];
		const oSecondSection = oPage.getSections()[1];
		const done = assert.async();
		const fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				let oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				//hide all subsections => no content left to display
				oFirstSection.getSubSections()[0].setVisible(false);
				oFirstSection.getSubSections()[1].setVisible(false);

				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test remove selected section", async function(assert) {

		assert.expect(4);
		const oObjectPage = this.oObjectPage;
		const iLoadingDelay = 500;
		const done = assert.async();

		//act
		oObjectPage.removeSection(this.oFirstSection);
		await nextUIUpdate();

		const oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getTitle() //subsection is promoted
		};

		//check
		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, iLoadingDelay);
	});

	QUnit.test("test rename selected section", async function(assert) {
		assert.expect(4);
		const oObjectPage = this.oObjectPage;
		const oFirstSection = this.oFirstSection;
		const done = assert.async();
		const fnOnDomReady = function() {
				const oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: "Updated Title"
				};

				//check
				sectionIsSelected(oObjectPage, assert, oExpected);
				done();
			};

		//act
		this.oFirstSection.setTitle("Updated Title");
		await nextUIUpdate();

		oObjectPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("section modified during layout calculation", function (assert) {

		const oPage = this.oObjectPage;
		const oFirstSection = oPage.getSections()[0];
		const oThirdSection = oPage.getSections()[2];
		const bTabsMode = oPage.getUseIconTabBar();
		const done = assert.async();
		const fnOnDomReady = function() {
				//act
				oFirstSection.setVisible(false); // will trigger async request to adjust layout
				oPage.setSelectedSection(oThirdSection.getId());

				const oExpected = {
					oSelectedSection: oThirdSection,
					sSelectedTitle: oThirdSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("_isClosestScrolledSection", function (assert) {

		const oPage = this.oObjectPage;
		const oFirstSection = oPage.getSections()[0];
		const oThirdSection = oPage.getSections()[2];
		const done = assert.async();
		const fnOnDomReady = function() {

				//check
				assert.strictEqual(oPage._isClosestScrolledSection(oFirstSection.getId()), true, "first section is currently scrolled");

				oPage.setSelectedSection(oThirdSection.getId());

				//check
				setTimeout(function() {
					assert.strictEqual(oPage._isClosestScrolledSection(oThirdSection.getId()), true, "third section is currently scrolled");
					done();
				}, 0);
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("setSelectedSection to subsection", function (assert) {

		const oPage = this.oObjectPage;
		const oSecondSection = oPage.getSections()[1];
		const oSecondSectionSecondSubSection = oSecondSection.getSubSections()[1];
		const done = assert.async();
		const fnOnDomReady = async function() {
				const oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);
				oPage.invalidate();
				await nextUIUpdate();
				sectionIsSelected(oPage, assert, oExpected);
				done();
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(fnOnDomReady));
		oPage.setSelectedSection(oSecondSectionSecondSubSection);
	});

	QUnit.module("ObjectPage API: sectionTitleLevel");

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel is TitleLevel.Auto", async function (assert) {
		assert.expect(3);
		const oObjectPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 2, 2);
		const sTitleLevel3 = "h3";
		const sTitleLevel4 = "h4";

		await helpers.renderObject(oObjectPage);

		// subsection titles inside the first section should have aria-level 4 because the section title is no longer hidden
		const oFirstSection = oObjectPage.getSections()[0];
		const $firstSectionSubSectionTitle = oFirstSection.getSubSections()[0].$("headerTitle");

		// get the second section to test the aria-level of the section title and the subsection title
		const oSection = oObjectPage.getSections()[1];
		const $sectionHeaderTitle = oSection.$("title");
		const oSubSection = oSection.getSubSections()[0];
		const $subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeaderTitle[0].tagName.toLowerCase(), sTitleLevel3, "The section has the correct aria-level");
		assert.equal($firstSectionSubSectionTitle[0].tagName.toLowerCase(), sTitleLevel4, "The subSection in the first section has the correct aria-level");
		assert.equal($subSectionTitle[0].tagName.toLowerCase(), sTitleLevel4, "The subSection has the correct aria-level");
	});

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel is not TitleLevel.Auto", async function(assert) {
		assert.expect(4);
		const oObjectPageSectionTitleLevel = TitleLevel.H1;
		const oObjectPageMinimumSectionTitleLevel = TitleLevel.H6;
		const oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(oObjectPageSectionTitleLevel);
		let $sectionHeaderTitle;
		let $subSectionTitle;
		const sSectionExpectedAriaLevel = "h1"; // equal to the  sectionTitleLevel(H1)
		const sSubSectionExpectedAriaLevel = "h2"; // lower than sectionTitleLevel(H1) by 1
		const sMinimumAriaLevel = "h6";

		await helpers.renderObject(oObjectPage);

		const oSection = oObjectPage.getSections()[0];
		$sectionHeaderTitle = oSection.$("title");
		const oSubSection = oSection.getSubSections()[0];
		$subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeaderTitle[0].tagName.toLowerCase(), sSectionExpectedAriaLevel, "The section has the correct aria-level");
		assert.equal($subSectionTitle[0].tagName.toLowerCase(), sSubSectionExpectedAriaLevel, "The subSection has the correct aria-level");

		oObjectPage.setSectionTitleLevel(oObjectPageMinimumSectionTitleLevel);
		await nextUIUpdate();
		$sectionHeaderTitle = oSection.$("title");
		$subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeaderTitle[0].tagName.toLowerCase(), sMinimumAriaLevel, "The section has the correct aria-level");
		assert.equal($subSectionTitle[0].tagName.toLowerCase(), sMinimumAriaLevel, "The subSection has the correct aria-level");

	});

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel and titleLevel are defined", async function (assert) {
		assert.expect(3);
		const oObjectPageSectionTitleLevel = TitleLevel.H4;
		const oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(oObjectPageSectionTitleLevel);
		const aSections = oObjectPage.getSections();
		const oSection = aSections[0];
		const aSubSections = oSection.getSubSections();
		const oFirstSubSection = aSubSections[0];
		const oSecondSubSection  = aSubSections[1];
		const oThirdSubSection = aSubSections[2];
		const sSubSectionDefaultAriaLevel = "h5"; // lower than sectionTitleLevel(H4) by 1
		const sFirstSubSectionExpectedAriaLevel = "h1"; // titleLevel(H1) is set explicitly
		const sSecondSubSectionExpectedAriaLevel = "h2"; // titleLevel(H2) is set explicitly

		oFirstSubSection.setTitleLevel(TitleLevel.H1);
		oSecondSubSection.setTitleLevel(TitleLevel.H2);

		await helpers.renderObject(oObjectPage);
		const $firstSubSectionTitle = oFirstSubSection.$("headerTitle");
		const $secondSubSectionTitle = oSecondSubSection.$("headerTitle");
		const $thirdSubSectionTitle = oThirdSubSection.$("headerTitle");

		assert.equal($firstSubSectionTitle[0].tagName.toLowerCase(), sFirstSubSectionExpectedAriaLevel,
			"SubSection aria-level " + sFirstSubSectionExpectedAriaLevel + ", although op sectionTitleLevel is " + oObjectPageSectionTitleLevel);

		assert.equal($secondSubSectionTitle[0].tagName.toLowerCase(), sSecondSubSectionExpectedAriaLevel,
			"SubSection aria-level " + sSecondSubSectionExpectedAriaLevel + ", although op sectionTitleLevel is " + oObjectPageSectionTitleLevel);

		assert.equal($thirdSubSectionTitle[0].tagName.toLowerCase(), sSubSectionDefaultAriaLevel,
			"SubSection aria-level " + sSubSectionDefaultAriaLevel + ", lower than sectionTitleLevel:" + oObjectPageSectionTitleLevel + " by 1");
	});

	QUnit.module("ObjectPage API: sectionTitleLevel - private methods");

	QUnit.test("test _determineSectionBaseInternalTitleLevel and _shouldApplySectionTitleLevel", async function (assert) {
		assert.expect(3);
		const oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(TitleLevel.H2);
		const oSection = oObjectPage.getSections()[0];
		const aSubSections = oSection.getSubSections();
		const oFirstSubSection = aSubSections[0];
		const oThirdSubSection = aSubSections[2];

		oFirstSubSection.setTitleLevel(TitleLevel.H1);
		await helpers.renderObject(oObjectPage);

		assert.equal(oObjectPage._shouldApplySectionTitleLevel(oFirstSubSection), false,
			"OP should not apply sectionTitleLevel as the subSection has titleLevel, explicitly defined and different from TitleLevel.Auto: " + oFirstSubSection.getTitleLevel());

		assert.equal(oObjectPage._shouldApplySectionTitleLevel(oThirdSubSection), true,
			"OP should apply sectionTitleLevel as the subSection has no titleLevel, explicitly defined");
		assert.equal(oObjectPage._determineSectionBaseInternalTitleLevel(oThirdSubSection), TitleLevel.H3,
			"SubSection internal titleLevel is: " + TitleLevel.H3 + ", lower than sectionTitleLevel:" + oObjectPage.getSectionTitleLevel() + " by 1");
	});

	QUnit.test("test _getNextTitleLevelEntry", function (assert) {
		let sCurrentTitleLevel = TitleLevel.H1;

		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), TitleLevel.H2,
			"Correct, next TitleLevel is: " + TitleLevel.H2 + " one level lower than: " + sCurrentTitleLevel);

		sCurrentTitleLevel = TitleLevel.H4;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), TitleLevel.H5,
			"Correct, next TitleLevel is: " + TitleLevel.H5 + " one level lower than: " + sCurrentTitleLevel);

		sCurrentTitleLevel = TitleLevel.H6;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), TitleLevel.H6,
			"Correct, starting from the last entry should return the last entry itself: " + sCurrentTitleLevel);

		sCurrentTitleLevel = TitleLevel.H7;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), TitleLevel.Auto,
			"Correct, if the provided TitleLevel is not valid, TitleLevel.Auto should be returned " + TitleLevel.Auto);
	});

	QUnit.module("ObjectPage API: AnchorBar", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "objectPageViewSample",
				viewName: "view.UxAP-77_ObjectPageSample"
			}).then(async function(oView) {
				this.oSampleView = oView;
				this.appControl = new App();
				this.appControl.addPage(this.oSampleView);
				this.appControl.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();
		}
	});

	QUnit.test("test AnchorBar not rendering using ShowAnchorBar within XMLView", async function(assert) {
		assert.expect(2);
		const oObjectPage = this.oSampleView.byId("objectPage13");

		oObjectPage.setShowAnchorBar(false);
		await nextUIUpdate();

		assert.equal(oObjectPage.getShowAnchorBar(), false);
		assert.strictEqual(oObjectPage.$().find(".sapUxAPAnchorBar").length, 0, "AnchorBar is not rendered");
	});

	QUnit.test("test AnchorBar rendering using ShowAnchorBar within XMLView", async function(assert) {
		assert.expect(2);
		const oObjectPage = this.oSampleView.byId("objectPage13");

		oObjectPage.setShowAnchorBar(true);
		await nextUIUpdate();

		assert.equal(oObjectPage.getShowAnchorBar(), true);
		assert.equal(checkObjectExists(".sapUxAPObjectPageNavigation .sapMITH"), true);
	});

	QUnit.test("test AnchorBar showPopover setting through ObjectPageLayout", async function(assert) {
		assert.expect(2);
		const oObjectPage = this.oSampleView.byId("objectPage13");
		const oAnchorBar =  oObjectPage.getAggregation("_anchorBar");
		let oSectionButton = oAnchorBar.getItems()[0];

		assert.ok(oSectionButton.getDomRef().querySelector(".sapMITBFilterExpandIcon"), "Drop-down icon in AnchorBar button is shown initially");

		oObjectPage.setShowAnchorBarPopover(false);
		await nextUIUpdate();
		oSectionButton = oAnchorBar.getItems()[0];

		assert.notOk(oSectionButton.getDomRef().querySelector(".sapMITBFilterExpandIcon"), "Drop-down icon in AnchorBar button is not shown");
	});

	QUnit.test("test AnchorBar menu items IDs build correctly", async function(assert) {
		assert.expect(1);
		const sIds = [];
		const oPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 5, 2);
		let oMenuItems;
		let aSubSections;
		let bAllIdsMatched = true;

		oPage.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oPage);

		const aSections = oPage.getSections() || [];
		const oAnchorBar = oPage._oABHelper._getAnchorBar();

		// we store the expected subsection MenuItems IDs
		aSections.forEach(function (oSection, index) {
			aSubSections = oSection.getSubSections() || [];

			// second Level (subsections)
			aSubSections.forEach(function (oSubSection) {
				sIds.push(oAnchorBar.getId() + "-" + oSubSection.getId() + "-anchor");
			});
		});

		// Check MenuItems IDs if match stored IDs
		oAnchorBar.getItems().forEach(function (oAggregation) {
			if (oAggregation.getMenu) {
				oMenuItems = oAggregation.getMenu().getItems();
				oMenuItems.forEach(function (item) {
					if (sIds.indexOf(item.getId()) < 0) {
						bAllIdsMatched = false;
						return;
					}
				});
			}
		});

		// Assert
		assert.equal(bAllIdsMatched, true, "All AnchorBar MenuItems are with correct IDs");
		oPage.destroy();
	});

	QUnit.test("test AnchorBar focus section synchronously and immediate after anchor press to prevent loss of focus when header is snapping", async function(assert) {
		assert.expect(1);
		// Arrange
		const iSectionCount = 3;
		const iSubSectionCount = 1;
		const oPage = helpers.generateObjectPageWithSubSectionContent(oFactory, iSectionCount, iSubSectionCount);
		const oABHelper = oPage._oABHelper;
		const oAnchorBar = oABHelper._getAnchorBar();
		const oLastSection = oPage.getSections()[iSectionCount - 1];

		oPage.placeAt('qunit-fixture');
		await nextUIUpdate();
		await waitForDOMReady(oPage);

		// Arrange
		const oLastSectionButton = oAnchorBar.getItems()[iSectionCount - 1];
		// Act
		oAnchorBar.fireSelect({
			key: oLastSectionButton.getKey()
		});

		// Assert
		assert.strictEqual(document.activeElement, oLastSection.getDomRef(), "Section is focused synchronously");

		// Clean
		oPage.destroy();
	});

	QUnit.module("ObjectPage API: ObjectPageHeader", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "objectPageViewSample",
				viewName: "view.UxAP-77_ObjectPageSample"
			}).then(async function(oView) {
				this.oSampleView = oView;
				this.appControl = new App();
				this.appControl.addPage(this.oSampleView);
				this.appControl.placeAt("qunit-fixture");

				await nextUIUpdate();
				this.oObjectPage = this.oSampleView.byId("objectPage13");
				this.oObjectPageClone = this.oObjectPage.clone();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();

			this.oObjectPage.destroy();
			this.oObjectPageClone.destroy();
		}
	});

	QUnit.test("test ObjectPageHeader for ObjectPageLayout defined into XMLView", async function(assert) {
		assert.expect(6);
		const oHeader = this.oObjectPage.getHeaderTitle();
		assert.ok(oHeader);
		assert.equal(this.oObjectPage.getHeaderContent()[0].getText(), "Personal description");

		this.oObjectPage.destroyHeaderTitle();
		this.oObjectPage.destroyHeaderContent();
		assert.ok(!this.oObjectPage.getHeaderTitle());

		const oNewHeader = new ObjectPageHeader(this.oSampleView.createId("newHeader"));
		this.oObjectPage.addHeaderContent(new Text(this.oSampleView.createId("newHeaderText"), {text: "test"}));
		this.oObjectPage.setHeaderTitle(oNewHeader);
		assert.ok(this.oObjectPage.getHeaderTitle());
		assert.equal(this.oObjectPage.getHeaderContent()[0].getText(), "test");

		await nextUIUpdate();

		assert.strictEqual(checkObjectExists("#objectPageViewSample--newHeader"), true);
	});

	QUnit.test("Should not call ObjectPageHeader _toggleFocusableState in non DynamicPageTitle case", function (assert) {

		const oHeader = this.oObjectPage.getHeaderTitle();
		const oHeaderSpy = this.spy(oHeader, "_toggleFocusableState");

		// act
		this.oObjectPage.setToggleHeaderOnTitleClick(false);

		// assert
		assert.strictEqual(oHeaderSpy.callCount, 0, "ObjectPageHeader _toggleFocusableState is not called");
	});

	QUnit.test("Should copy _headerContent hidden aggregation to the ObjectPage clone", function (assert) {

		const oHeaderContent = this.oObjectPage.getHeaderContent();
		const oHeaderContentClone = this.oObjectPageClone.getHeaderContent();

		assert.strictEqual(oHeaderContentClone !== null, true, "HeaderContent aggregation should exist in the clone");
		assert.strictEqual(oHeaderContent.length, oHeaderContentClone.length, "HeaderContent and it's clone should have the same nubmer of elements");
	});

	QUnit.test("Should destroy cloned _headerContent hidden aggregation", function (assert) {
		const oDestroySpy = this.spy(ManagedObject.prototype, "destroy");
		const sHeaderContentId = this.oObjectPageClone.getHeaderContent()[0].getId();

		// act
		this.oObjectPageClone.destroy();

		// check
		const aDestroyedObjectIds = oDestroySpy.thisValues.map(function(x) {return x.getId();});
		assert.ok(aDestroyedObjectIds.indexOf(sHeaderContentId) > -1, "default headerContent clone is destroyed");
	});

	QUnit.module("ObjectPage API", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "objectPageViewSample",
				viewName: "view.UxAP-77_ObjectPageSample"
			}).then(function (oView) {
				this.oSampleView = oView;
				XMLView.create({
					id: "objectPageView",
					viewName: "view.UxAP-77_ObjectPage"
				}).then(async function(oView) {
					this.oView = oView;
					this.appControl = new App();
					this.appControl.addPage(this.oView);
					this.appControl.placeAt("qunit-fixture");
					await nextUIUpdate();
					done();
				}.bind(this));
			}.bind(this));
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();
			this.oView.destroy();
		}
	});

	QUnit.test("create instance ObjectPageLayout via javascript", function (assert) {
		const oObjectPage = new ObjectPageLayout("myObjectPage1");
		assert.equal(oObjectPage.getId(), "myObjectPage1");
	});
	QUnit.test("add ObjectPageLayout in XMLView via API", function (assert) {
		const oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage2"));
		this.oView.addContent(oObjectPage);
		const referenceObjectPage = this.oView.byId("myObjectPage2");
		assert.ok(referenceObjectPage != undefined, "ObjectPageLayout created in View");

	});
	QUnit.test("test default value of ShowAnchorBar", function (assert) {
		this.oView.removeAllContent();
		const oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage3"));
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});
	QUnit.test("test ShowAnchorBar via Control settings", function (assert) {
		const oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage4"), {showAnchorBar: false});
		assert.equal(oObjectPage.getShowAnchorBar(), false);
	});

	QUnit.test("test ShowAnchorBar APIs", function (assert) {
		const oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage5"));
		oObjectPage.setShowAnchorBar(false);
		assert.equal(oObjectPage.getShowAnchorBar(), false);
		oObjectPage.setShowAnchorBar(true);
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});

	QUnit.test("test showEditHeaderButton API", function (assert) {
		const oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage6"));
		assert.strictEqual(oObjectPage.getShowEditHeaderButton(), false, "showEditHeaderButton is false by default");
		oObjectPage.setShowEditHeaderButton(true);
		assert.strictEqual(oObjectPage.getShowEditHeaderButton(), true, "showEditHeaderButton is set to true correctly");
		oObjectPage.setShowEditHeaderButton(false);
		assert.strictEqual(oObjectPage.getShowEditHeaderButton(), false, "showEditHeaderButton is set to false correctly");
	});

	QUnit.test("test Section APIs", function (assert) {
		const oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage7"));
		const oSection1 = new ObjectPageSection({title: "Recognition"});
		const oSection2 = new ObjectPageSection({title: "Employee"});
		oObjectPage.addSection(oSection1);
		oObjectPage.addSection(oSection2);
		const aSections = oObjectPage.getSections();
		assert.equal(aSections.length, 2);

		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.indexOfSection(oSection2), 1);

		assert.equal(aSections[0].getTitle(), "Recognition");
		assert.equal(aSections[1].getTitle(), "Employee");
		const oSection3 = new ObjectPageSection({title: "Goal"});
		oObjectPage.insertSection(oSection3, 1);
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.indexOfSection(oSection3), 1);
		assert.equal(oObjectPage.indexOfSection(oSection2), 2);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Recognition");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Employee");
		oObjectPage.removeSection(oSection1);
		assert.equal(oObjectPage.getSections().length, 2);
		assert.equal(oObjectPage.indexOfSection(oSection3), 0);
		assert.equal(oObjectPage.indexOfSection(oSection2), 1);

		oObjectPage.removeAllSections();
		assert.equal(oObjectPage.getSections().length, 0);
		oObjectPage.addSection(oSection1);
		assert.equal(oObjectPage.getSections().length, 1);
		oObjectPage.destroySections();
		assert.equal(oObjectPage.getSections().length, 0);
	});

	QUnit.test("test Height APIs", function (assert) {
		const oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage10"));
		assert.equal(oObjectPage.getHeight(), '100%');
		oObjectPage.setHeight('50%');
		assert.equal(oObjectPage.getHeight(), '50%');
	});
	QUnit.test("test Header APIs", function (assert) {
		const oObjectPage = new ObjectPageLayout(this.oView.createId("myObjectPage11"));
		const oHeader = new ObjectPageHeader("header");
		oObjectPage.addHeaderContent(new Text({text: "test"}));
		oObjectPage.setHeaderTitle(oHeader);
		const aContent = oObjectPage.getHeaderContent();
		assert.equal(aContent[0].getText(), "test");
	});

	QUnit.test("test ShowAnchorBar for ObjectPageLayout defined into XMLView", function (assert) {
		this.appControl.removeAllPages();
		this.appControl.addPage(this.oSampleView);
		const oObjectPage = this.oSampleView.byId("objectPage13");
		assert.equal(oObjectPage.getShowAnchorBar(), true);
		oObjectPage.setShowAnchorBar(false);
		assert.equal(oObjectPage.getShowAnchorBar(), false);
		oObjectPage.setShowAnchorBar(true);
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});

	QUnit.test("test Section for ObjectPageLayout defined into XMLView", function (assert) {
		this.appControl.removeAllPages();
		this.appControl.addPage(this.oSampleView);

		const oObjectPage = this.oSampleView.byId("objectPage13");
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Payroll");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Wage Type");

		const oSection1 = new ObjectPageSection(this.oSampleView.createId("sectionGoal"), {title: "Goal"});
		oObjectPage.insertSection(oSection1, 1);
		assert.equal(oObjectPage.getSections().length, 4);
		assert.equal(oObjectPage.indexOfSection(oSection1), 1);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Payroll");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[3].getTitle(), "Wage Type");
		oObjectPage.removeSection(oObjectPage.getSections()[0]);
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Wage Type");
		const oSection2 = new ObjectPageSection(this.oSampleView.createId("sectionRecognition"), {title: "Recognition"});
		oObjectPage.addSection(oSection2);
		assert.equal(oObjectPage.getSections().length, 4);
		assert.equal(oObjectPage.indexOfSection(oSection2), 3);
		assert.equal(oObjectPage.getSections()[3].getTitle(), "Recognition");
		oSection2.addDelegate({
			onAfterRendering: function () {
				QUnit.test("Sections Rendering", function (assert) {
					//check sections
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionGoal"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionStatus"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionWageType"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionRecognition"), true);
				});
			}
		});
	});

	QUnit.module("ObjectPage HeaderContent");

	QUnit.test("test getHeaderContent returns array if empty", function (assert) {
		// setup: object page without header content
		const oPage = new ObjectPageLayout();
		const aHeaderContent = oPage.getHeaderContent();

		// check
		assert.ok(Array.isArray(aHeaderContent), "array is returned");
		assert.strictEqual(aHeaderContent.length, 0, "empty array is returned");

		// cleanup
		oPage.destroy();
	});

	QUnit.module("ObjectPage API: sections removal", {
		beforeEach: function () {
			this.iDelay = 500;
			this.oSelectedSection = oFactory.getSection(2, null, [
				oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null)
			]);

			this.oOP = oFactory.getObjectPage();
			this.oOP.addSection(oFactory.getSection(1, null, [
					oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null)
			])).addSection(this.oSelectedSection)
				.setSelectedSection(this.oSelectedSection.getId());

			this.oOP.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oOP.destroy();
			this.oOP = null;
			this.oSelectedSection.destroy();
			this.oSelectedSection = null;
		}
	});

	QUnit.test("test removeAllSections should reset selectedSection", async function(assert) {
		assert.expect(2);
		const oObjectPage = this.oOP;
		const done = assert.async();

		// Act
		oObjectPage.removeAllSections();
		await nextUIUpdate();

		setTimeout(function () {
			assert.equal(oObjectPage.getSections().length, 0, "There are no sections.");
			assert.equal(oObjectPage.getSelectedSection(), null, "Selected section is null as there are no sections.");
			done();
		},  this.iDelay);
	});

	QUnit.test("applyLayout is not called on invalidated SubSection without parent ObjectPage", async function(assert) {
		assert.expect(1);
		const oObjectPage = this.oOP;
		const sNewTitle = "New SubSection Title";
		const oSectionToRemove = this.oSelectedSection;
		const oSubSectionToSpy = this.oSelectedSection.getSubSections()[0];
		const oSubSectionMethodSpy = this.spy(oSubSectionToSpy, "_applyLayout");

		// Act: invalidate the SubSection and remove its parent Section
		oSubSectionToSpy.setTitle(sNewTitle); // invalidate the SubSection
		oObjectPage.removeSection(oSectionToRemove); // remove the Section

		await nextUIUpdate();

		// Assert
		assert.equal(oSubSectionMethodSpy.callCount, 0,
			"applyLayout is called: " + oSubSectionMethodSpy.callCount + " times.");
	});


	QUnit.test("test destroySections should reset selectedSection", async function(assert) {
		assert.expect(2);
		const oObjectPage = this.oOP;
		const done = assert.async();

		// Act
		oObjectPage.destroySections();
		await nextUIUpdate();

		setTimeout(function () {
			assert.equal(oObjectPage.getSections().length, 0, "There are no sections.");
			assert.equal(oObjectPage.getSelectedSection(), null, "Selected section is null as there are no sections.");
			done();
		}, this.iDelay);
	});

	QUnit.test("test removing and destroying Section on mobile (with binding)", function (assert) {
		const oObjectPage = this.oOP;
		const done = assert.async();

			this.stub(lib.Utilities, "isPhoneScenario").returns(true);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function () {
			// Act
			oObjectPage.removeSection(oObjectPage.getSections()[1]).destroy("KeepDom");
			await nextUIUpdate();

			setTimeout(function () {
				assert.ok(true, "Error is not thrown");
				done();
			},  this.iDelay);
		}.bind(this)));
	});

	QUnit.module("ObjectPage API: invalidate");

	QUnit.test("inactive section does not invalidate the objectPage", async function (assert) {

		assert.expect(1);
		const oObjectPage = new ObjectPageLayout({
			useIconTabBar: true,
			selectedSection: "section1",
			sections: [
				new ObjectPageSection("section1", {
					subSections: [
						new ObjectPageSubSection({
							blocks: [
								new Link("section1Link", {})
							]
						})
					]
				}),
				new ObjectPageSection("section2", {
					subSections: [
						new ObjectPageSubSection({
							blocks: [
								new Link("section2Link", {})
							]
						})
					]
				})

			]
		});
		const oObjectPageRenderSpy = this.spy();
		const done = assert.async();

		await helpers.renderObject(oObjectPage);

		oObjectPage.addEventDelegate({
			onBeforeRendering: oObjectPageRenderSpy
		});

		//act
		Element.getElementById("section2Link").invalidate();

		//check
		setTimeout(function() {
			assert.equal(oObjectPageRenderSpy.callCount, 0,
				"OP is not rerendered");
			oObjectPage.destroy();
			done();
		}, 0);
	});

	QUnit.test("adding section does invalidate the objectPage", async function (assert) {

		assert.expect(1);
		const oObjectPage = new ObjectPageLayout({
				useIconTabBar: true,
				selectedSection: "section1",
				sections: [
					new ObjectPageSection("section1", {
						subSections: [
							new ObjectPageSubSection({
								blocks: [
									new Link("section1Link", {})
								]
							})
						]
					})
				]
			});
		const section2 = new ObjectPageSection("section2", {
				subSections: [
					new ObjectPageSubSection({
						blocks: [
							new Link("section2Link", {})
						]
					})
				]
			});
		const oObjectPageRenderSpy = this.spy();
		const done = assert.async();

		await helpers.renderObject(oObjectPage);

		oObjectPage.addEventDelegate({
			onBeforeRendering: oObjectPageRenderSpy
		});

		//act
		oObjectPage.addSection(section2);

		//check
		setTimeout(function() {
			assert.equal(oObjectPageRenderSpy.callCount, 1,
				"OP is rerendered");
			oObjectPage.destroy();
			done();
		}, 0);
	});

	QUnit.test("browser events not attached twice on rerender", async function (assert) {

		const oButton = new Button("btn1", {text: "test"});
		const oObjectPage = new ObjectPageLayout({
				useIconTabBar: true,
				selectedSection: "section1",
				sections: [
					new ObjectPageSection("section1", {
						subSections: [
							new ObjectPageSubSection({
								blocks: [
									oButton
								]
							})
						]
					})
				]
			});
		const fnBrowserEventHandler = this.spy();
		const fnOnDomReady = async function() {
				oObjectPage.invalidate();
				await nextUIUpdate();
				let event;
				const $buttonDomRef = Element.getElementById("btn1").getDomRef();
				if (typeof Event === 'function') {
					event = new Event("click");
				} else {
					event = document.createEvent('Event');
					event.initEvent("click", true, true);
				}
				$buttonDomRef.dispatchEvent(event);
				assert.equal(fnBrowserEventHandler.callCount, 1, "browser event listener called only once");
				oObjectPage.destroy();
				done();
			};
		const done = assert.async();

		assert.expect(1); //number of assertions

		oButton.attachBrowserEvent("click", fnBrowserEventHandler);

		await helpers.renderObject(oObjectPage);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("onAfterRenderingDomReady cancelled on invalidate", function (assert) {

		const oObjectPage = new ObjectPageLayout({
			useIconTabBar: true,
			selectedSection: "section1",
			sections: [
				new ObjectPageSection("section1", {
					subSections: [
						new ObjectPageSubSection({
							blocks: [
								new Text({ text: "content"})
							]
						})
					]
				})
			]
		});
		const done = assert.async();
		const oSpy = this.spy(window, "clearTimeout");

		assert.expect(3);

		// hook to onAfterRendering to *make a change that caused invalidation* before _onAfterRenderingDomReady is called
		const oDelegate = {"onAfterRendering": function() {

			// clean up to avoid calling the same hook again
			oObjectPage.removeDelegate(oDelegate);
			oSpy.resetHistory();

			assert.ok(oObjectPage._iAfterRenderingDomReadyTimeout > 0, "the task is scheduled");

			// Act
			oObjectPage.invalidate();

			// Check
			assert.ok(oSpy.called, "the task is cancelled");
			assert.strictEqual(oObjectPage._iAfterRenderingDomReadyTimeout, null, "the field is cleared");

			oObjectPage.destroy();
			done();
		}};

		oObjectPage.addEventDelegate(oDelegate);
		oObjectPage.placeAt("qunit-fixture");
	});

	QUnit.test("setShowHeaderContent does not invalidate the objectPage", async function (assert) {
		// Arrange
		const oObjectPage = new ObjectPageLayout({
			headerTitle: new ObjectPageDynamicHeaderTitle({
				backgroundDesign: "Solid"
			}),
			headerContent: new Button({
				text: "Button"
			}),
			sections:
						oFactory.getSection(1, null, [
							oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(3, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(4, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						])
			});
		const oObjectPageRenderSpy = this.spy();
		const done = assert.async();
		let oAdjustHeaderHeightsSpy;
		let oRequestAdjustLayoutSpy;
		let oHeaderContentRenderSpy;
		let oUpdateTitleVisualStateSpy;

		assert.expect(6);
		await helpers.renderObject(oObjectPage);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			oObjectPage.addEventDelegate({
				onAfterRendering: oObjectPageRenderSpy
			});

			oAdjustHeaderHeightsSpy = this.spy(oObjectPage, "_adjustHeaderHeights");
			oRequestAdjustLayoutSpy = this.spy(oObjectPage, "_requestAdjustLayout");
			oUpdateTitleVisualStateSpy = this.spy(oObjectPage, "_updateTitleVisualState");
			oHeaderContentRenderSpy = this.spy(oObjectPage._getHeaderContent(), "invalidate");

			// Act
			oObjectPage.setShowHeaderContent(false);
			await nextUIUpdate();

			setTimeout(async function() {
				// Assert
				assert.equal(oObjectPageRenderSpy.callCount, 0, "OPL is not rerendered");
				assert.equal(oHeaderContentRenderSpy.callCount, 1, "headerContent is rerendered");
				assert.equal(oAdjustHeaderHeightsSpy.callCount, 1, "_adjustHeaderHeights is called once");
				assert.equal(oRequestAdjustLayoutSpy.callCount, 1, "_requestAdjustLayout is called once");
				assert.equal(oUpdateTitleVisualStateSpy.callCount, 1, "_updateTitleVisualState is called once when the showHeaderContent property is changed");

				oUpdateTitleVisualStateSpy.resetHistory();
				oObjectPage.setShowHeaderContent(true);
				await nextUIUpdate();

				setTimeout(function() {
					// Assert
					assert.equal(oUpdateTitleVisualStateSpy.callCount, 1, "_updateTitleVisualState is called once when the showHeaderContent property is changed");

					// Clean up
					oObjectPage.destroy();
					done();
				}, 500);
			}, 500);
		}.bind(this)));
	});

	QUnit.test("setShowHeaderContent updates the toggle header buttons", function (assert) {
		// Arrange
		const oObjectPage = new ObjectPageLayout({
				headerTitle: new ObjectPageDynamicHeaderTitle(),
				headerContent: new Button({
					text: "Button"
				}),
				showHeaderContent: false
			});
		const updateToggleHeaderVisualIndicatorsSpy = this.spy(oObjectPage, "_updateToggleHeaderVisualIndicators");

		oObjectPage.setShowHeaderContent(true);
		assert.ok(updateToggleHeaderVisualIndicatorsSpy.calledOnce, "buttons visibility is updated");
	});

	QUnit.module("ObjectPage API: Header", {
		beforeEach: async function() {
			this.oObjectPageLayout = new ObjectPageLayout();
			this.oObjectPageLayout.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
			this.oObjectPageLayout = null;
		}
	});

	QUnit.test("ObjectPageLayout - setHeaderTitle", function (assert) {
		const oHeaderTitle = new ObjectPageDynamicHeaderTitle({
				backgroundDesign: "Solid"
			});

		// act
		this.oObjectPageLayout.setHeaderTitle(oHeaderTitle);

		// assert
		assert.ok(this.oObjectPageLayout._oObserver.isA("sap.ui.base.ManagedObjectObserver"), true, "ManagedObjectObserver is created");
	});

	QUnit.test("ObjectPageLayout - update Header Title", function (assert) {
		// Arrange
		const oObjectPageLayout = this.oObjectPageLayout;
		const oHeaderTitle = new ObjectPageHeader({
				objectTitle: "First Title"
			});
		const oSpy = this.spy(this.oObjectPageLayout, "_adjustHeaderHeights");
		const fnDone = assert.async();

		assert.expect(2);

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			oObjectPageLayout.setHeaderTitle(oHeaderTitle);
			await nextUIUpdate();

			oSpy.resetHistory();

			// Act - already have a title, so changing its text should not affect height
			oHeaderTitle.setObjectTitle("New Title");
			await nextUIUpdate();

			// Assert
			assert.ok(oSpy.notCalled, "_adjustHeaderHeights is not called when there is no change in Header's height");

			// Act - no subTitle yet, so setting one will change the height
			oHeaderTitle.setObjectSubtitle("New SubTitle");
			await nextUIUpdate();

			// Assert
			assert.ok(oSpy.calledOnce, "_adjustHeaderHeights is called when there is a change in Header's height");

			// Clean up
			fnDone();
		}));
	});

	QUnit.test("ObjectPageLayout - backgroundDesignAnchorBar", async function(assert) {
		assert.expect(9);
		const $oAnchorBarDomRef = this.oObjectPageLayout.$("anchorBar");

		// assert
		assert.equal(this.oObjectPageLayout.getBackgroundDesignAnchorBar(), null, "Default value of backgroundDesign property = null");

		// act
		this.oObjectPageLayout.setBackgroundDesignAnchorBar("Solid");
		await nextUIUpdate();

		// assert
		assert.ok($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationSolid"), "Should have sapUxAPObjectPageNavigationSolid class");
		assert.strictEqual(this.oObjectPageLayout.getBackgroundDesignAnchorBar(), "Solid", "Should have backgroundDesign property = 'Solid'");

		// act
		this.oObjectPageLayout.setBackgroundDesignAnchorBar("Transparent");
		await nextUIUpdate();

		// assert
		assert.notOk($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationSolid"), "Should not have sapUxAPObjectPageNavigationSolid class");
		assert.ok($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationTransparent"), "Should have sapUxAPObjectPageNavigationTransparent class");
		assert.strictEqual(this.oObjectPageLayout.getBackgroundDesignAnchorBar(), "Transparent", "Should have backgroundDesign property = 'Transparent'");

		// act
		this.oObjectPageLayout.setBackgroundDesignAnchorBar("Translucent");
		await nextUIUpdate();

		// assert
		assert.notOk($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationTransparent"), "Should not have sapUxAPObjectPageNavigationTransparent class");
		assert.ok($oAnchorBarDomRef.hasClass("sapUxAPObjectPageNavigationTranslucent"), "Should have sapUxAPObjectPageNavigationTranslucent class");
		assert.strictEqual(this.oObjectPageLayout.getBackgroundDesignAnchorBar(), "Translucent", "Should have backgroundDesign property = 'Translucent'");
	});

	QUnit.module("Object Page Private API", {
		beforeEach: function () {
			this.oObjectPageLayout = new ObjectPageLayout("layout", {
				headerTitle: new ObjectPageDynamicHeaderTitle({
					backgroundDesign: "Solid"
				}),
				headerContent: new Button({
					text: "Button"
				})
			});
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
			this.oObjectPageLayout = null;
		}
	});

	QUnit.test("safe-check _adjustLayoutAndUxRules", function (assert) {
		// arrange
		const oObjectPage = this.oObjectPageLayout;
		let oSection;
		let oSubSection;

		for (let i = 0; i < 2; i++) {
			oSection = oFactory.getSection(i);
			oSubSection = oFactory.getSubSection(i, oFactory.getBlocks());
			oSection.addSubSection(oSubSection);
			oObjectPage.addSection(oSection);
		}

		const oSelectedSection = oObjectPage.getSections()[1];
		oObjectPage.setSelectedSection(oSelectedSection);

		try {
			// act
			// call the function before ObjectPageLayout is rendered
			oObjectPage._adjustLayoutAndUxRules();
			// assert
			assert.ok(true, "No error is thrown");
		} catch (e) {
			// assert
			assert.notOk(e, "Error should not be thrown");
		}
	});


	QUnit.test("_getStickyAreaHeight calculation while header expanded in the title-area", async function (assert) {
		assert.expect(1);
		this.oObjectPageLayout.setHeaderTitle(oFactory.getHeaderTitle());
		this.oObjectPageLayout.addHeaderContent(oFactory.getHeaderContent());

		await helpers.renderObject(this.oObjectPageLayout);
		await waitForDOMReady(this.oObjectPageLayout);

		// pre-calculate the height of the sticky area in snapped mode
		const iStickyAreaHeight = this.oObjectPageLayout._getStickyAreaHeight(true /*snapped header*/);
		this.oObjectPageLayout._expandHeader(true);
		assert.strictEqual(this.oObjectPageLayout._getStickyAreaHeight(true /*snapped header*/), iStickyAreaHeight, "sticky area correctly calculated while header expanded");
	});

	QUnit.test("_obtainExpandedTitleHeight using clone", async function (assert) {
		assert.expect(1);
		this.oObjectPageLayout.setHeaderTitle(oFactory.getHeaderTitle());
		this.oObjectPageLayout.addHeaderContent(oFactory.getHeaderContent());
		// add two sections
		for (let i = 0; i < 2; i++) {
			this.oObjectPageLayout.addSection(oFactory.getSection(i, null, [
				oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null)
			]));
		}

		await helpers.renderObject(this.oObjectPageLayout);
		await waitForDOMReady(this.oObjectPageLayout);

		// save the actual title height in expanded mode
		const iExpandedTitleHeight = this.oObjectPageLayout.getHeaderTitle().$().height();
		// scroll to switch to snapped mode
		this.oObjectPageLayout._scrollTo(this.oObjectPageLayout._getSnapPosition() + 1, 0);

		// Act
		const iClonedExpandedTitleHeight = this.oObjectPageLayout._obtainExpandedTitleHeight(true /* use clone */);
		// Check
		assert.strictEqual(iClonedExpandedTitleHeight, iExpandedTitleHeight, "height is correct");
	});

	QUnit.test("_calculateShiftOffset on FireFox", async function (assert) {
		assert.expect(1);
		const oStubBrowser = this.stub(Device, "browser").value({
				firefox: true
			});
		const oStubScrollbar = this.stub(this.oObjectPageLayout, "_hasVerticalScrollBar").returns(true);

		await helpers.renderObject(this.oObjectPageLayout);
		await waitForDOMReady(this.oObjectPageLayout);

		// Assert
		assert.strictEqual(this.oObjectPageLayout._calculateShiftOffset().iMarginalsOffset, ObjectPageLayout.SCROLLBAR_SIZE_FF, "Header and footer offset on FireFox is set correctly");
		oStubBrowser.restore();
		oStubScrollbar.restore();
	});


	QUnit.module("ObjectPage with ObjectPageDynamicHeaderTitle without header content", {
		beforeEach: async function () {
			this.NUMBER_OF_SECTIONS = 2;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, false);
			this.oObjectPage.setHeaderTitle(new ObjectPageDynamicHeaderTitle());
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("ObjectPage headerContent not rendered", function (assert) {
		const oObjectPage = this.oObjectPage;
		const oTitle = oObjectPage.getHeaderTitle();
		const done = assert.async();

		this.oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function () {
				assert.notOk(helpers.exists(oObjectPage.getHeaderContent()), "The DynamicPage Header does not exist.");
				assert.equal(oTitle._getFocusSpan().is(":hidden"), true, "Focus span should be excluded from the tab chain");
				assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayoutTitleClickEnabled"), "No ObjectPage Header content - sapUxAPObjectPageLayoutTitleClickEnabled not added");

				oObjectPage.setToggleHeaderOnTitleClick(true);

				assert.equal(oTitle._getFocusSpan().is(":hidden"), true, "Focus span should still be excluded from the tab chain");
				assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayoutTitleClickEnabled"), "No ObjectPage Header content - sapUxAPObjectPageLayoutTitleClickEnabled not added");
				done();
			}, 0);
		});
	});

	QUnit.module("ObjectPage with ObjectPageDynamicHeaderTitle", {
		beforeEach: async function () {
			this.NUMBER_OF_SECTIONS = 2;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			this.oObjectPage.setHeaderTitle(new ObjectPageDynamicHeaderTitle());
			this.oObjectPage.addHeaderContent(new Text({text: "test"}));
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Object Page has the correct CSS class", function (assert) {
		// Assert
		assert.ok(this.oObjectPage.hasStyleClass("sapUxAPObjectPageHasDynamicTitle"),
				"Object Page page has the sapUxAPObjectPageHasDynamicTitle CSS class" +
				" when Dynamic Header Title is being used.");
	});

	QUnit.test("ObjectPageDynamicHeaderTitle with snappedTitleOnMobile on desktop", function (assert) {
		// Arrange
		const oObjectPage = this.oObjectPage;
		const oDomObjectPageHeaderTitle = oObjectPage.getDomRef("headerTitle");
		const oDynamicPageTitle = oObjectPage.getHeaderTitle();

		// Act
		helpers.toDesktopMode(oObjectPage);
		oDynamicPageTitle.setAggregation("snappedTitleOnMobile", new Title("Test"));
		oObjectPage._snapHeader();

		// Assert
		assert.notOk(oObjectPage._hasDynamicTitleWithSnappedTitleOnMobile(),
				"ObjectPageDynamicHeaderTitle hasn't snappedTitleOnMobile while on desktop.");

		assert.notOk(oDomObjectPageHeaderTitle.classList.contains("sapUxAPObjectPageHeaderSnappedTitleOnMobile"),
				"Object Page Header Dom node hasn't sapUxAPObjectPageHeaderSnappedTitleOnMobile class while on desktop.");

		assert.ok(oDynamicPageTitle._getShowExpandButton(), "Expand button of Dynamic Page Title is shown.");
	});

	QUnit.test("ObjectPageDynamicHeaderTitle with snappedTitleOnMobile on tablet", function (assert) {
		// Arrange
		const oObjectPage = this.oObjectPage;
		const oDomObjectPageHeaderTitle = oObjectPage.getDomRef("headerTitle");
		const oDynamicPageTitle = oObjectPage.getHeaderTitle();

		// Act
		helpers.toTabletMode(oObjectPage);
		oDynamicPageTitle.setAggregation("snappedTitleOnMobile", new Title("Test"));
		oObjectPage._snapHeader();

		// Assert
		assert.notOk(oObjectPage._hasDynamicTitleWithSnappedTitleOnMobile(),
				"ObjectPageDynamicHeaderTitle hasn't snappedTitleOnMobile while on tablet.");

		assert.notOk(oDomObjectPageHeaderTitle.classList.contains("sapUxAPObjectPageHeaderSnappedTitleOnMobile"),
				"Object Page Header Dom node hasn't sapUxAPObjectPageHeaderSnappedTitleOnMobile class while on tablet.");

		assert.ok(oDynamicPageTitle._getShowExpandButton(), "Expand button of Dynamic Page Title is shown.");

		// Clean up
		helpers.toDesktopMode(oObjectPage);
	});

	QUnit.test("ObjectPageDynamicHeaderTitle with snappedTitleOnMobile on phone", function (assert) {
		// Arrange
		const oObjectPage = this.oObjectPage;
		const oDomObjectPageHeaderTitle = oObjectPage.getDomRef("headerTitle");
		const oDynamicPageTitle = oObjectPage.getHeaderTitle();

		// Act
		helpers.toPhoneMode(oObjectPage);
		oDynamicPageTitle.setAggregation("snappedTitleOnMobile", new Title("Test"));
		oObjectPage._snapHeader();

		// Assert
		assert.ok(oObjectPage._hasDynamicTitleWithSnappedTitleOnMobile(),
				"ObjectPageDynamicHeaderTitle has snappedTitleOnMobile while on phone.");

		assert.ok(oDomObjectPageHeaderTitle.classList.contains("sapUxAPObjectPageHeaderSnappedTitleOnMobile"),
				"Object Page Header Dom node has the sapUxAPObjectPageHeaderSnappedTitleOnMobile class while on phone.");

		assert.notOk(oDynamicPageTitle._getShowExpandButton(), "Expand button of Dynamic Page Title is not shown.");

		// Clean up
		helpers.toDesktopMode(oObjectPage);
	});

	QUnit.test("ObjectPage Header pinnable and not pinnable", async function(assert) {

		assert.expect(3);
		const oHeader = this.oObjectPage._getHeaderContent();
		const oPinButton = oHeader.getAggregation("_pinButton");

		this.oObjectPage.setHeaderContentPinnable(false);
		await nextUIUpdate();

		assert.ok(!oPinButton.$()[0],
			"The ObjectPage Header Pin Button not rendered");

		this.oObjectPage.setHeaderContentPinnable(true);
		await nextUIUpdate();

		assert.ok(oPinButton.$()[0],
			"The ObjectPage Header Pin Button rendered");

		assert.equal(oPinButton.$().hasClass("sapUiHidden"), false,
			"The ObjectPage Header Pin Button is visible");
	});

	QUnit.test("ObjectPage Header Pin Button focus preservation", async function(assert) {
		assert.expect(1);
		// Arrange
		const oHeader = this.oObjectPage._getHeaderContent();
		const oPinButton = oHeader.getAggregation("_pinButton");
		const oPinButtonDomRef = oPinButton.$();
			oPinButton.$ = function () {
				return {
					attr: function () {},
					removeClass: function () {},
					off: function () {},
					trigger: function (sMethod) {
						if (sMethod === "focus") {
							// Assert
							assert.ok(true, "The Pin Button remain focused after triggering");
						}
					}
				};
			};

		// Act
		await nextUIUpdate();
		oPinButtonDomRef.focus();

		// Act
		oPinButton.firePress();
	});

	QUnit.test("ObjectPage Header - expanding/collapsing by clicking the title", function (assert) {

		const oObjectPage = this.oObjectPage;
		const oObjectPageTitle = oObjectPage.getHeaderTitle();
		const oHeaderContent = oObjectPage._getHeaderContent();
		const oPinButton = oHeaderContent._getPinButton();
		const oFakeEvent = {
				srcControl: oObjectPageTitle
			};

		this.oObjectPage._bHeaderInTitleArea = true;

		assert.equal(oObjectPage._bHeaderExpanded, true, "Initially the header is expanded");
		assert.equal(oObjectPage.getToggleHeaderOnTitleClick(), true, "Initially toggleHeaderOnTitleClick = true");

		oObjectPageTitle.ontap(oFakeEvent);

		assert.equal(oObjectPage._bHeaderExpanded, false, "After one click, the header is collapsed");

		oObjectPage.setToggleHeaderOnTitleClick(false);

		oObjectPageTitle.ontap(oFakeEvent);
		assert.equal(oObjectPage._bHeaderExpanded, false, "The header is still collapsed, because toggleHeaderOnTitleClick = false");

		oObjectPage.setToggleHeaderOnTitleClick(true);

		oObjectPageTitle.ontap(oFakeEvent);
		assert.equal(oObjectPage._bHeaderExpanded, true, "After restoring toggleHeaderOnTitleClick to true, the header again expands on click");

		oPinButton.firePress();
		oObjectPageTitle.ontap(oFakeEvent);

		assert.strictEqual(oObjectPage._bHeaderExpanded, false, "After one click, the header is collapsed even it's pinned");
		assert.strictEqual(oPinButton.getPressed(), false, "Pin button pressed state should be reset.");
		assert.strictEqual(oObjectPage.$().hasClass("sapUxAPObjectPageLayoutHeaderPinned"), false, "ObjectPage header should be unpinned.");
	});

	QUnit.test("ObjectPage Header - expanding/collapsing by clicking the title", function (assert) {
		// arrange
		const oObjectPage = this.oObjectPage;
		const oObjectPageTitle = oObjectPage.getHeaderTitle();
		const oStateChangeListener = this.spy();
		const oFakeEvent = {
				srcControl: oObjectPageTitle
			};

		oObjectPageTitle.attachEvent("stateChange", oStateChangeListener);

		// act
		oObjectPageTitle.ontap(oFakeEvent);

		// assert
		assert.ok(oStateChangeListener.calledOnce, "stateChange event was fired once");

		// act
		oObjectPageTitle.ontap(oFakeEvent);

		// assert
		assert.strictEqual(oStateChangeListener.callCount, 2, "stateChange event was fired twice");
	});

	QUnit.test("ObjectPage Header - expanding/collapsing by clicking the expand/collapse arrow", function (assert) {
		// arrange
		const oObjectPage = this.oObjectPage;
		const oObjectPageTitle = oObjectPage.getHeaderTitle();
		const oStateChangeListener = this.spy();

		oObjectPageTitle.attachEvent("stateChange", oStateChangeListener);

		// act
		oObjectPage.getAggregation("_headerContent").getAggregation("_collapseButton").firePress();

		// assert
		assert.ok(oStateChangeListener.calledOnce, "stateChange event was fired once");

		// act
		oObjectPage.getAggregation("headerTitle").getAggregation("_expandButton").firePress();

		// assert
		assert.strictEqual(oStateChangeListener.callCount, 2, "stateChange event was fired twice");
	});

	QUnit.test("ObjectPage header is preserved in title on screen resize", function (assert) {
		// arrange
		const oObjectPage = this.oObjectPage;
		const oFakeEvent = {
				size: {
					width: 100,
					height: 300
				},
				oldSize: {
					width: 100,
					height: 400
				}
			};
		// this delay is already introduced in the ObjectPage resize listener
		const iDelay = ObjectPageLayout.HEADER_CALC_DELAY + 100;
		const done = assert.async();
		let oSpy;

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// setup: expand the header in the title
			oObjectPage._scrollTo(0, 200);
			oObjectPage._expandHeader(true);
			assert.ok(oObjectPage._bHeaderInTitleArea);

			oSpy = this.spy(ObjectPageLayout.prototype, "invalidate");

			// act: resize and check if the page invalidates in the resize listener
			oObjectPage._onUpdateScreenSize(oFakeEvent);

			setTimeout(function() {
				assert.strictEqual(oSpy.called, false, "page was not invalidated during resize");
				done();
			}, iDelay);
		}.bind(this));

	});

	QUnit.test("ObjectPage header is preserved in title on content resize", function (assert) {
		// arrange
		const oObjectPage = this.oObjectPage;
		// this delay is already introduced in the ObjectPage resize listener
		const done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// setup: expand the header in the title
			oObjectPage._scrollTo(0, 200);
			oObjectPage._expandHeader(true);
			assert.ok(oObjectPage._bHeaderInTitleArea);

			// act: resize and check if the page invalidates in the resize listener
			oObjectPage._onUpdateContentSize({ size: {}, oldSize: {} });

			assert.strictEqual(oObjectPage._bHeaderInTitleArea, true, "page is not snapped on resize");
			done();
		});
	});

	QUnit.test("ObjectPage is not attached to MouseOut/MouseOver events of title on tablet/phone device", async function (assert) {
		assert.expect(2);
		// Setup
		helpers.toPhoneMode(this.oObjectPage);

		const oVisualIndicatorMouseoOverSpy = this.spy(this.oObjectPage, "_attachVisualIndicatorMouseOverHandlers");
		const oTitleMouseOverSpy = this.spy(this.oObjectPage, "_attachTitleMouseOverHandlers");

		// Act
		this.oObjectPage.invalidate();
		await nextUIUpdate();

		// Assert
		assert.ok(oVisualIndicatorMouseoOverSpy.notCalled, "ObjectPage is not attached to MouseOut/MouseOver events of snap/expand button");
		assert.ok(oTitleMouseOverSpy.notCalled, "ObjectPage is not attached to MouseOut/MouseOver events of title");

		helpers.toDesktopMode(this.oObjectPage);
	});

	QUnit.test("ObjectPage obtains correct anchorBar height", function (assert) {
		// arrange
		const oObjectPage = this.oObjectPage;
		const done = assert.async();

		assert.expect(2);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			assert.strictEqual(oObjectPage.iAnchorBarHeight, this.getDomRef("anchorBar").offsetHeight, "correct anchorBar height");

			oObjectPage._snapHeader(true);
			assert.strictEqual(oObjectPage.iAnchorBarHeight, this.getDomRef("stickyAnchorBar").offsetHeight, "correct sticky anchorBar height");
			done();
		});
	});

	QUnit.test("AnchorBar height includes paddings", function (assert) {
		// arrange
		const oObjectPage = this.oObjectPage;
		const done = assert.async();

		assert.expect(1);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			const oAnchorBarDOM = this.getDomRef("anchorBar");
			const iPadding = parseInt(getComputedStyle(oAnchorBarDOM).paddingTop) || 0;
			const iABHeight = oObjectPage.iAnchorBarHeight;
			const iDiff = 10;

			// Act: increase padding
			oAnchorBarDOM.style.paddingTop = (iPadding + iDiff) + "px";
			oObjectPage._adjustHeaderHeights(); // call the function that recalculates anchorBar height

			//Check: the new padding is included
			assert.ok(isTolerableDifference(oObjectPage.iAnchorBarHeight, iABHeight + iDiff, 1), "anchorBar height is also augmented");
			done();
		});
	});

	QUnit.test("unset selected section when preserveHeaderStateOnScroll enabled", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const oSecondSection = this.oObjectPage.getSections()[1];
		const done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		assert.expect(1);

		this.oObjectPage.setSelectedSection(oSecondSection);
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setPreserveHeaderStateOnScroll(true);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Act: unset the currently selected section
			oObjectPage.setSelectedSection(null);

			// Check
			setTimeout(function() {
				assert.equal(oObjectPage._bHeaderInTitleArea, true, "Header is still in the title area");
				done();
			}, 0);
		});

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.module("ObjectPage with alwaysShowContentHeader", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
			this.oObjectPage.setAlwaysShowContentHeader(true);
			this.oObjectPage.addHeaderContent(new Text({text: "Some header content"}));
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Should not call toggleHeader", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const oSecondSection = oObjectPage.getSections()[1];
		const oToggleHeaderSpy = this.spy(oObjectPage, "_toggleHeader");
		const done = assert.async();
		let oHeaderContent;
		const fnOnDomReady = function() {
				oObjectPage.scrollToSection(oSecondSection.getId(), 0);
				assert.strictEqual(oToggleHeaderSpy.callCount, 0, "Toggle header is not called");
				oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnRerenderedDomReady2);
				oObjectPage.invalidate();
			};
		const fnOnRerenderedDomReady2 = function() {
				// Assert
				assert.equal(oObjectPage._bHeaderExpanded, true, "Flag for expandedHeader has correct value");
				oHeaderContent = oObjectPage._getHeaderContent();
				assert.equal(oHeaderContent.$().hasClass("sapUxAPObjectPageHeaderContentHidden"), false, "Header content is not hidden");

				// Clean up
				done();
			};

			// ensure desktop mode
			helpers.toDesktopMode(oObjectPage);
			this.stub(lib.Utilities, "isPhoneScenario").returns(false);
			this.stub(lib.Utilities, "isTabletScenario").returns(false);

			assert.expect(3);
			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
			await helpers.renderObject(oObjectPage);
	});

	QUnit.test("'alwaysShowContentHeader' is applied correctly on screen resize", async function (assert) {
		// arrange
		const oObjectPage = this.oObjectPage;
		const oFakeEvent = {
				size: {
					width: 100,
					height: 300
				},
				oldSize: {
					width: 100,
					height: 400
				}
			};
		const done = assert.async();

		// mock tablet mode
		this.stub(lib.Utilities, "isPhoneScenario").returns(false);
		this.stub(lib.Utilities, "isTabletScenario").returns(true);

		assert.expect(2);


		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// setup: expand the header in the title
			oObjectPage._scrollTo(0, 200);
			assert.ok(!oObjectPage._bHeaderInTitleArea);

			// act: resize and check if the page invalidates in the resize listener
			lib.Utilities.isTabletScenario.returns(false);
			oObjectPage._onUpdateScreenSize(oFakeEvent);

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				assert.ok(oObjectPage._bHeaderInTitleArea);
				done();
			});
		}, this);

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Modifying hidden page", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Object Page has the correct CSS class", function (assert) {
		// Assert
		assert.notOk(this.oObjectPage.hasStyleClass("sapUxAPObjectPageHasDynamicTitle"),
				"Object Page page hasn't the sapUxAPObjectPageHasDynamicTitle CSS class" +
				" when Dynamic Header Title is not being used.");
	});

	QUnit.test("Should change selectedSection", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const oSecondPage = new Page();
		const oNavContainer = new App();
		const oSecondSection = oObjectPage.getSections()[1];
		const iCompleteResizeCalculationTimeout = ObjectPageLayout.HEADER_CALC_DELAY + 100;
		const done = assert.async();
		let oExpected;
		const onResizeCheckCompleted = function() {
				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getSubSections()[0].getTitle(), // the only subsection is promoted
					bSnapped: true
				};
				//check
				sectionIsSelected(oObjectPage, assert, oExpected);
				done();
			};
		const fnOnShowBackObjectPage = function() {
				setTimeout(onResizeCheckCompleted, iCompleteResizeCalculationTimeout);
			};
		const fnOnHideObjectPage = function() {
				// act: change selectedSection while page is HIDDEN
				oObjectPage.setSelectedSection(oSecondSection);
				// call the listener to the <code>scroll</code> event synchonously to avoid waiting a timeout
				oObjectPage._onScroll({ target: {scrollTop: oObjectPage._computeScrollPosition(oSecondSection)}});
				oNavContainer.attachEventOnce("afterNavigate", fnOnShowBackObjectPage);
				oNavContainer.to(oObjectPage.getId()); // nav back to the object page
			};
		const fnOnDomReady = function() {
				oNavContainer.attachEventOnce("afterNavigate", fnOnHideObjectPage);
				oNavContainer.to(oSecondPage.getId()); // nav to the second page to hide the object page
			};

		assert.expect(5);
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		oNavContainer.addPage(oObjectPage);
		oNavContainer.addPage(oSecondPage);
		await helpers.renderObject(oNavContainer);
	});

	QUnit.module("First visible section", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 5, 2);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("iconTabBar mode selected section", async function (assert) {
		assert.expect(1);
		this.oObjectPage.setUseIconTabBar(true);

		const oSectionToSelect = this.oObjectPage.getSections()[1];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		await helpers.renderObject(this.oObjectPage);

		assert.ok(this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelect), "the selected section is the first visible one");
	});

	QUnit.test("iconTabBar mode selected section first subSection", async function (assert) {
		assert.expect(1);
		this.oObjectPage.setUseIconTabBar(true);

		const oSectionToSelect = this.oObjectPage.getSections()[1];
		const oSectionToSelectFirstSubSection = oSectionToSelect.getSubSections()[0];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		await helpers.renderObject(this.oObjectPage);

		assert.ok(this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelectFirstSubSection), "the first visible subSection is correct");
	});

	QUnit.test("iconTabBar mode selected section non-first subSection", async function (assert) {
		assert.expect(1);
		this.oObjectPage.setUseIconTabBar(true);

		const oSectionToSelect = this.oObjectPage.getSections()[1];
		const oSectionToSelectSecondSubSection = oSectionToSelect.getSubSections()[1];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		await helpers.renderObject(this.oObjectPage);

		assert.ok(!this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelectSecondSubSection), "the first visible subSection is correct");
	});

	QUnit.test("resize of empty page", async function (assert) {
		assert.expect(2);
		const oObjectPage = this.oObjectPage;
		const oSelectSpy = this.spy(oObjectPage, "_selectFirstVisibleSection");
		const done = assert.async();

		// Setup
		this.oObjectPage.setUseIconTabBar(true);
		this.oObjectPage.removeAllSections(); //ensure no first visible section

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSelectSpy.resetHistory();

			// Act: update height from 0 to greater than 0
			oObjectPage._onUpdateScreenSize({
				oldSize: {width: 1000, height:0},
				size: { width: 1000, height:1000}
			});

			setTimeout(function() {
				assert.equal(oSelectSpy.callCount, 1, "reset of selected section is called");
				assert.ok(oSelectSpy.returned(undefined), "the function returned");
				done();
			}, oObjectPage._getDOMCalculationDelay());

		});

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.module("ScrollDelegate", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("getScrollDelegate", async function (assert) {
		const oObjectPage = this.oObjectPage;

		assert.expect(1);

		// Act: render page to test scrolling behavior
		await helpers.renderObject(oObjectPage);

		// wait for the event when the page is rendered and ready
		await waitForDOMReady(oObjectPage);

		// Setup: save init scroll position
		const iInitScrollTop = Math.round(oObjectPage._$opWrapper.scrollTop());

		// Act: call scrolling while scrolling is suppressed
		const iNewScrollTop = iInitScrollTop + 10;
		oObjectPage.getScrollDelegate().scrollTo(0 /* x */, iNewScrollTop /* y */);

		// Check if scroll was effective
		assert.strictEqual(Math.round(oObjectPage._$opWrapper.scrollTop()), iNewScrollTop, "scroll top is changed");
	});

	QUnit.module("RTA util functions", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("_suppressScroll", async function (assert) {
		const oObjectPage = this.oObjectPage;

		assert.expect(1);

		// Act: render page to test scrolling behavior
		await helpers.renderObject(oObjectPage);

		// wait for the event when the page is rendered and ready
		await waitForDOMReady(oObjectPage);

		// Setup: save current scroll position and suppress scroll
		const iScrollTopBefore = oObjectPage._$opWrapper.scrollTop();
		oObjectPage._suppressScroll();

		// Act: call scrolling while scrolling is suppressed
		oObjectPage._scrollTo(iScrollTopBefore + 10);

		// Check if scroll suppression was effective
		const iScrollTopAfter = oObjectPage._$opWrapper.scrollTop();
		assert.strictEqual(iScrollTopBefore, iScrollTopAfter, "scroll top is unchanged");
	});

	QUnit.test("_resumeScroll", async function (assert) {
		const oObjectPage = this.oObjectPage;
		const iUpdatedScrollTop = 0;
		const oFirstSection = oObjectPage.getSections()[0];
		const oFourthSection = oObjectPage.getSections()[3];
		const done = assert.async();

		// Arrange: set selection to a (non-first) section that requires page scrolling
		oObjectPage.setSelectedSection(oFourthSection.getId());

		assert.expect(3);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			// Arrange: save current scroll position and suppress scroll
			oObjectPage._suppressScroll();

			// Act: Change scrollTop (effect of RTA operation)
			oObjectPage._$opWrapper.scrollTop(iUpdatedScrollTop);

			// Act: resume page's own scrolling and restore state
			oObjectPage._resumeScroll();

			// Check that the restored section corresponds to the current scroll position
			assert.strictEqual(oObjectPage.getSelectedSection(), oFirstSection.getId(), "selected section is correct");
			assert.strictEqual(oObjectPage._$opWrapper.scrollTop(), iUpdatedScrollTop, "scroll top is correct");

			// Check that the state is correctly preserved even of the page is meanwhile invalidated and rerendered
			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				setTimeout(function() {
					assert.strictEqual(oObjectPage._$opWrapper.scrollTop(), iUpdatedScrollTop, "scroll top is correct");
					done();
				}, 0);
			});
			// Act: invalidate and apply changes to cause rerendering
			oObjectPage.invalidate();
			await nextUIUpdate();
		}));

		// Act: render page to test scrolling behavior
		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Private methods");

	QUnit.test("BCP:1870298358 - cloned header should not introduce scrollbar - _appendTitleCloneToDOM", async function(assert) {

		assert.expect(2);
		// Arrange
		const oObjectPage = helpers.generateObjectPageWithContent(oFactory, 2, true);

		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		await waitForDOMReady(oObjectPage);

		const oWrapperElement = oObjectPage._$opWrapper.get(0);

		// Act: obtain snapped title height
		const oClone = oObjectPage._appendTitleCloneToDOM(true /* snap title */);

		// Assert
		assert.strictEqual(oWrapperElement.offsetHeight, oWrapperElement.scrollHeight, "no scrolling");

		oClone.remove();

		// ACT: obtain expanded title height
		oObjectPage._appendTitleCloneToDOM(false /* do not snap title */);

		// Assert
		assert.strictEqual(oWrapperElement.offsetHeight, oWrapperElement.scrollHeight, "no scrolling");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("_obtainExpandedTitleHeight does not change element overflow", async function(assert) {

		assert.expect(1);
		// Arrange
		const oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();

		oObjectPage.setHeaderTitle(oFactory.getHeaderTitle());
		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		const oCSSSpy = this.spy(oObjectPage._$opWrapper, "css");

		// Act - render OP and call method
		oObjectPage._obtainExpandedTitleHeight(false/* snap directly */);

		// Assert
		assert.notOk(oCSSSpy.calledWith("overflow-y", "hidden"), "no disabling of scrolling of the wrapper (BCP 002075129400005875712019)");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("_getHeaderContentDomRef works as expected", async function(assert) {

		assert.expect(3);
		// Arrange
		const oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oObjectPage._getHeaderContentDomRef(), oObjectPage._getHeaderContent().getDomRef(),
			"The new '_getHeaderContentDomRef' method is returning the Dom Ref of headerContent as expected.");


		// Act - scroll to snap the header
		oObjectPage._setSectionInfoIsDirty(false);
		oObjectPage._onScroll({ target: { scrollTop: oObjectPage._getSnapPosition() + 1} });
		// Assert
		assert.strictEqual(oObjectPage._getHeaderContentDomRef(),
			oObjectPage.$().find(".sapUxAPObjectPageHeaderTitle .sapUxAPObjectPageHeaderDetails").get(0),
			"return an empty placeholder if the header is hidden in the scroll overflow.");


		// Act - remove header content
		oObjectPage.setAggregation("_headerContent", null);

		// Assert
		assert.strictEqual(oObjectPage._getHeaderContentDomRef(), null,
			"The new '_getHeaderContentDomRef' method is returning null, when there is no headerContent available.");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("_obtainSnappedTitleHeight does not change element overflow", async function(assert) {

		assert.expect(1);
		// Arrange
		const oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();

		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());
		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		const oCSSSpy = this.spy(oObjectPage._$opWrapper, "css");

		// Act - render OP and call method
		oObjectPage._obtainSnappedTitleHeight(false/* expand directly */);

		// Assert
		assert.notOk(oCSSSpy.calledWith("overflow-y", "hidden"), "no disabling of scrolling of the wrapper (BCP 002075129400005875712019)");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("Unsnapping/snapping header for measurements should update spacer height and should not introduce scrollbar",
	async function (assert) {

		// Arrange
		const oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();

			assert.expect(1);

		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());
		const oSection = oFactory.getSection(0);
		const oSubSection = oFactory.getSubSection(0, oFactory.getBlocks());
		oSection.addSubSection(oSubSection);
		oObjectPage.addSection(oSection);

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		const iSpacerInitialHeight = oObjectPage._$spacer.height();
		oObjectPage._adjustSpacerHeightUponUnsnapping(150, 200);
		const iSpacerNewHeight = oObjectPage._$spacer.height();

		// Assert
		assert.equal(iSpacerInitialHeight, iSpacerNewHeight,
			"Spacer height remains 0 when unsnapping leads to change of content height and there is only one SubSection");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("Snapping Header with ObjectPageDynamicHeaderTitle when expandedHeading has bigger height than snappedHeading",
	async function (assert) {

		// Arrange
		const oObjectPage = oFactory.getObjectPageLayoutWithOneVisibleSection();
		const oHeader = oFactory.getObjectPageDynamicHeaderTitle();
		const fnDone = assert.async();

		assert.expect(1);

		oHeader.setSnappedHeading(new Button({text: "Heading Button"}));
		oHeader.setExpandedHeading(new Button({text: "Heading Button"}));
		oObjectPage.setShowAnchorBar(false);
		oObjectPage.addHeaderContent(new Button());
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Act - Snap header
			oObjectPage._handleDynamicTitlePress();

			setTimeout(function() {
				// Assert
				assert.strictEqual(oObjectPage._bHeaderExpanded, false, "Header is collapsed");

				// Cleanup
				oObjectPage.destroy();
				fnDone();
			}, 100);
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("Expanding Header with ObjectPageDynamicHeaderTitle with rounding issue",
	async function (assert) {

		// Arrange
		const oObjectPage = oFactory.getObjectPageLayoutWithOneVisibleSection();
		const oHeader = oFactory.getObjectPageDynamicHeaderTitle();
		const fnDone = assert.async();
		let oSpy;

		assert.expect(2);

		oHeader.setSnappedHeading(new Button({text: "Heading Button"}));
		oHeader.setExpandedHeading(new Button({text: "Heading Button"}));
		oObjectPage.setShowAnchorBar(false);
		oObjectPage.addHeaderContent(new Button());
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Act - Snap header
			oObjectPage._handleDynamicTitlePress();

			setTimeout(function() {
				// Assert
				assert.strictEqual(oObjectPage._bHeaderExpanded, false, "Header is collapsed");

				// stub - simulate rounding issue
				this.stub(oObjectPage._$opWrapper, "scrollTop").returns(oObjectPage._getSnapPosition() + 1.6);
				oSpy = this.spy(oObjectPage, "_moveHeaderToTitleArea");

				// Act - Expand header
				oObjectPage._handleDynamicTitlePress();

				// Assert
				assert.ok(oSpy.notCalled, "_moveHeaderToTitleArea is not called");

				// Cleanup
				oObjectPage.destroy();
				fnDone();
			}.bind(this), 100);
		}.bind(this));

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("_updateMedia called with proper arguments onAfterRendering when _hasDynamicTitle",
	async function (assert) {

		// Arrange
		const oObjectPage = oFactory.getObjectPageLayoutWithOneVisibleSection();

		assert.expect(1);
		oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		const oUpdateMediaSpy = this.spy(oObjectPage, "_updateMedia");

		oObjectPage.onAfterRendering();

		assert.strictEqual(oUpdateMediaSpy.getCalls()[0].args[1],
			ObjectPageLayout.DYNAMIC_HEADERS_MEDIA,
			"_updateMedia is correctly called with dynamic headers args when needed");

		oObjectPage.destroy();
		oUpdateMediaSpy.reset();
	});

	QUnit.test("BCP:1870298358 - _getScrollableViewportHeight method should acquire the exact height", async function(assert) {

		assert.expect(1);
		// Arrange
		const oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		const oGetBoundingClientRectSpy = this.spy(oObjectPage.getDomRef(), "getBoundingClientRect");

		// Act - call method
		oObjectPage._getScrollableViewportHeight();

		// Assert
		assert.strictEqual(oGetBoundingClientRectSpy.callCount, 1, "Exact height is acquired using getBoundingClientRect");

		// Cleanup
		oObjectPage.destroy();
	});

	QUnit.test("BCP:1870470695/1970034947 - check _updateMedia is called initially when ObjectPage has correct size", async function (assert) {
		const oObjectPage = new ObjectPageLayout({});
		const oUpdateMediaSpy = this.spy(oObjectPage, "_updateMedia");
		const oGetWidthSpy = this.spy(oObjectPage, "_getWidth");

		assert.expect(2);

		await helpers.renderObject(oObjectPage);
		await waitForDOMReady(oObjectPage);

		assert.strictEqual(oUpdateMediaSpy.callCount, 2, "_updateMedia is called on after rendering and after DOM ready to ensure coorect size classes are set");
		assert.strictEqual(oGetWidthSpy.callCount, 2, "_getWidth is called once on after rendering and once after DOM ready");
		oObjectPage.destroy();
	});

	QUnit.test("ObjectPage _updateMedia: Call with falsy value should not take action", function (assert) {
        // setup
        const oObjectPage = new ObjectPageLayout({});
        const oToggleStyleClassSpy = this.spy(oObjectPage, "toggleStyleClass");

        // act
        oObjectPage._updateMedia(0);

        // assert
        assert.ok(oToggleStyleClassSpy.notCalled, "Media styles were not changed");

        // clean up
        oObjectPage.destroy();
	});

	QUnit.test("ObjectPage _applyContextualSettings: changes media classes", async function(assert) {
        assert.expect(13);
        // Arrange
		const oObjectPage = new ObjectPageLayout({});
		const oContextualSettings = {contextualWidth: 800};
		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		const oSpy = this.spy(ManagedObject.prototype, "_applyContextualSettings");
		oObjectPage._applyContextualSettings(oContextualSettings);

		// Assert
		assert.ok(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Tablet"), "Tablet class is applied");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop-XL"), "Desktop XL class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop"), "Desktop class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Phone"), "Phone class is removed");
		assert.deepEqual(oSpy.getCall(0).args[0], oContextualSettings, "Contextual settings object is passed");

		// Act
		oObjectPage._applyContextualSettings({contextualWidth: 500});

		// Assert
		assert.ok(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Phone"), "Phone class is applied");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Tablet"), "Tablet class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop"), "Desktop class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop-XL"), "Desktop XL class is removed");

		// Act
		oObjectPage._applyContextualSettings({contextualWidth: 1440});

		// Assert
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Phone"), "Phone class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Tablet"), "Tablet class is removed");
		assert.notOk(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop"), "Desktop class is removed");
		assert.ok(oObjectPage.$().hasClass("sapUxAPObjectPageLayout-Std-Desktop-XL"), "Desktop XL class is applied");
    });

	QUnit.test("ObjectPage _computeLastVisibleHeight floors the top position of the spacer", async function (assert) {
		assert.expect(1);
		// setup
		const oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		const oSpy = this.spy(Math, "floor");
		oObjectPage._computeLastVisibleHeight(oObjectPage.getSections()[4].getSubSections()[0]);

		// assert
		assert.ok(oSpy.calledOnce, "Spacer's top positioned is floored");

		// clean up
		oObjectPage.destroy();
	});

	QUnit.module("Header DOM changes", {
		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
			this.oObjectPage.addHeaderContent(oFactory.getHeaderContent());
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});


	QUnit.test("Change in title size retrigger layout calculations", async function (assert) {

		const oObjectPage = this.oObjectPage;
		const sShortText = "sample object subtitle text";
		const sLongText = (function(s) {
				for (let i = 0; i < 100; i++) {
					s += sShortText;
				}
				return s;
			}(""));
		const oHeaderTitle = new ObjectPageHeader({
				objectTitle: "Title",
				objectSubtitle: sLongText
			});
		const layoutCalcSpy = this.spy(oObjectPage, "_requestAdjustLayout");
		const headerCalcSpy = this.spy(oObjectPage, "_adjustHeaderHeights");

		assert.expect(2);

		oObjectPage.setHeaderTitle(oHeaderTitle);

		await helpers.renderObject(this.oObjectPage);
		await waitForDOMReady(oObjectPage);

		layoutCalcSpy.resetHistory();
		headerCalcSpy.resetHistory();

		// Act: change size of title dom element [without control invalidation]
		const $titleDescription = oObjectPage.getHeaderTitle().$().find('.sapUxAPObjectPageHeaderIdentifierDescription').get(0);
		$titleDescription.innerText = sShortText;

		oObjectPage.getHeaderTitle()._onHeaderResize({ size: { width: "800px", height: "800px"}});
		assert.strictEqual(layoutCalcSpy.callCount, 1, "layout recalculations called once");
		assert.strictEqual(headerCalcSpy.callCount, 1, "header height recalculation called");
	});

	QUnit.test("Title is toggled only upon snap/unsnap", async function (assert) {

		const oObjectPage = this.oObjectPage;
		const oHeaderTitle = new ObjectPageHeader({
				objectTitle: "Title"
			});
		const toggleTitleSpy = this.spy(oObjectPage, "_toggleHeaderTitle");
		const done = assert.async();

		assert.expect(2);

		oObjectPage.setHeaderTitle(oHeaderTitle);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			toggleTitleSpy.resetHistory();

			// Act: scroll to position that does not require snap
			oObjectPage._$opWrapper.scrollTop(20);

			setTimeout(function() {
				assert.strictEqual(toggleTitleSpy.callCount, 0, "title is not toggled");

				// Act: scroll to position that does not require snap
				oObjectPage._$opWrapper.scrollTop(oObjectPage._getSnapPosition());

				setTimeout(function() {
					assert.strictEqual(toggleTitleSpy.callCount, 1, "title is toggled");
					done();
				}, 100);
			}, 100);
		});

		await helpers.renderObject(this.oObjectPage);
	});

	QUnit.module("events", {
		beforeEach: async function () {
			this.oObjectPage = oFactory.getObjectPage();
			this.oObjectPage.addSection(oFactory.getSection(1, null, [
				oFactory.getSubSection(1, [oFactory.getBlocks()], null),
				oFactory.getSubSection(2, [oFactory.getBlocks()], null)
			]));
			this.oObjectPage.addSection(oFactory.getSection(1, null, [
				oFactory.getSubSection(1, [oFactory.getBlocks()], null)]));

			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("sectionChange event is fired for single/not promoted SubSection", async function (assert) {
		assert.expect(2);
		// Arrange
		const fnDone = assert.async();
		const oSubSection = new ObjectPageSubSection({
				blocks: new Button()
			});
		const oSection = oFactory.getSection(1, null, [ oSubSection ]);

		this.oObjectPage.addSection(oSection);
		await nextUIUpdate();

		this.oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			this.oObjectPage.attachEventOnce("sectionChange", function(oEvent) {
				// Assert
				assert.strictEqual(oEvent.getParameter("section").getId(), oSection.getId(),
					"sectionChange event is fired for the new Section");
				assert.strictEqual(oEvent.getParameter("subSection").getId(), oSubSection.getId(),
					"sectionChange event is fired for the new SubSection");
				fnDone();
			});

			// Act
			this.oObjectPage.onAnchorBarTabPress(oSection.getId());
			this.oObjectPage._onScroll({ target: {scrollTop: this.oObjectPage._computeScrollPosition(oSection)}});
		}.bind(this));
	});

	QUnit.test("subSectionVisibilityChange without IconTabBar and changing visibility", function (assert) {
		// Arrange
		const fnDone = assert.async();
		this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
			// Assert
			const oVisibleSubSections = oEvent.getParameter("visibleSubSections");
			assert.strictEqual(Object.keys(oVisibleSubSections).length, 2,
				"Two visible subSections are reported when visibility of one of the three subSections is changed to false");

			fnDone();
		});

		assert.expect(1);

		// Act
		this.oObjectPage.getSections()[0].getSubSections()[0].setVisible(false);
	});

	QUnit.test("subSectionVisibilityChange with IconTabBar and changing visibility", function (assert) {
		// Arrange
		const fnDone = assert.async();

		this.oObjectPage.setUseIconTabBar(true);
		this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
			// Assert
			const oVisibleSubSections = oEvent.getParameter("visibleSubSections");
			assert.strictEqual(Object.keys(oVisibleSubSections).length, 1,
				"One visible subSection is reported when visibility of one of the two subSections in the first section is changed to false");

			// Clean-up
			fnDone();
		});

		assert.expect(1);

		// Act
		this.oObjectPage.getSections()[0].getSubSections()[0].setVisible(false);
	});

	QUnit.test("subSectionVisibilityChange adding new SubSection and Section without IconTabBar", function (assert) {
		// Arrange
		const fnDone = assert.async();
		this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
			// Assert
			const oVisibleSubSections = oEvent.getParameter("visibleSubSections");
			assert.strictEqual(Object.keys(oVisibleSubSections).length, 4,
				"Four visible subSections are reported when new subSection is added");

			//Act
			this.oObjectPage.addSection(oFactory.getSection(4, null, [
				oFactory.getSubSection(5, [oFactory.getBlocks()], null)
			]));

			this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
				// Assert
				const oVisibleSubSections = oEvent.getParameter("visibleSubSections");
				assert.strictEqual(Object.keys(oVisibleSubSections).length, 5,
					"Five visible subSections are reported when new Section with one subSection is added");

				// Clean-up
				fnDone();
			});
		}.bind(this));

		assert.expect(2);

		//Act
		this.oObjectPage.getSections()[0].addSubSection(oFactory.getSubSection(3, [oFactory.getBlocks()], null));
	});

	QUnit.test("subSectionVisibilityChange adding new SubSection and Section with IconTabBar", function (assert) {
		// Arrange
		const fnDone = assert.async();
		let oSpy;

		this.oObjectPage.setUseIconTabBar(true);
		this.oObjectPage.attachEventOnce("subSectionVisibilityChange", function(oEvent) {
			// Assert
			const oVisibleSubSections = oEvent.getParameter("visibleSubSections");
			assert.strictEqual(Object.keys(oVisibleSubSections).length, 3,
				"Three visible subSections are reported when new visible subSection is added to the selected section");

			oSpy = this.spy(this.oObjectPage, "fireEvent");

			// Act
			this.oObjectPage.getSections()[1].addSubSection(oFactory.getSubSection(4, [oFactory.getBlocks()], null));
			this.oObjectPage._checkSubSectionVisibilityChange();

			// Assert
			assert.ok(oSpy.notCalled, "sectionVisibilityChange event is not fired when new subsSection is added to not selected section");

			// Clean-up
			fnDone();
		}.bind(this));

		assert.expect(2);

		// Act
		this.oObjectPage.getSections()[0].addSubSection(oFactory.getSubSection(3, [oFactory.getBlocks()], null));
	});

	QUnit.module("ObjectPage landmarkInfo API");

	QUnit.test("ObjectPage landmark info is set correctly", async function(assert) {
		assert.expect(27);
		const oObjectPage = helpers.generateObjectPageWithContent(oFactory, 3, false, true);
		let oLandmarkInfo = new ObjectPageAccessibleLandmarkInfo({
				rootRole: "Region",
				rootLabel: "Root",
				contentRole: "Main",
				contentLabel: "Content",
				headerRole: "Banner",
				headerLabel: "Header",
				footerRole: "Region",
				footerLabel: "Footer",
				navigationRole: "Navigation",
				navigationLabel: "Navigation"
			});

		oObjectPage.placeAt('qunit-fixture');
		oObjectPage.setLandmarkInfo(oLandmarkInfo);
		await nextUIUpdate();

		assert.strictEqual(oObjectPage.$().attr("role"), "region", "Root role is set correctly.");
		assert.strictEqual(oObjectPage.$().attr("aria-label"), "Root", "Root label is set correctly.");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("role"), "main", "Content role is set correctly.");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("aria-label"), "Content", "Content label is set correctly.");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("role"), "banner", "Header role is set correctly.");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("aria-label"), "Header", "Header label is set correctly.");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("role"), "region", "Footer role is set correctly.");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("aria-label"), "Footer", "Footer label is set correctly.");
		assert.strictEqual(Element.getElementById(oObjectPage.getId() + "-anchBar").$().attr("role"), "navigation", "Navigation role is set correctly.");
		assert.strictEqual(Element.getElementById(oObjectPage.getId() + "-anchBar").$().attr("aria-label"), "Navigation", "Navigation label is set correctly.");

		oLandmarkInfo = new ObjectPageAccessibleLandmarkInfo({
			rootRole: "None",
			rootLabel: "Root",
			contentRole: "None",
			contentLabel: "Content",
			headerRole: "None",
			headerLabel: "Header",
			footerRole: "None",
			footerLabel: "Footer",
			navigationRole: "None",
			navigationLabel: "Navigation"
		});

		oObjectPage.setLandmarkInfo(oLandmarkInfo);
		await nextUIUpdate();

		assert.strictEqual(oObjectPage.$().attr("role"), undefined, "Root role is not set");
		assert.strictEqual(oObjectPage.$().attr("aria-label"), undefined, "Root label is not");
		assert.strictEqual(oObjectPage.$().attr("aria-roledescription"), undefined, "Root roledescription is not set");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("role"), undefined, "Content role  is not set");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("aria-label"), undefined, "Content label is not set");
		assert.strictEqual(oObjectPage.$("sectionsContainer").attr("aria-roledescription"), undefined, "Content roledescription is not set");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("role"), undefined, "Header role is not set");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("aria-label"), undefined, "Header label is set correctly.");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("aria-roledescription"), undefined, "Header roledescription is not set");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("role"), undefined, "Footer role is not set");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("aria-label"), undefined, "Footer label is not set");
		assert.strictEqual(oObjectPage.$("footerWrapper").attr("aria-roledescription"), undefined, "Footer roledescription is not set");
		assert.strictEqual(Element.getElementById(oObjectPage.getId() + "-anchBar").$().attr("role"), undefined, "Navigation role is not set");
		assert.strictEqual(Element.getElementById(oObjectPage.getId() + "-anchBar").$().attr("aria-label"), undefined, "Navigation label  is not set");
		assert.strictEqual(Element.getElementById(oObjectPage.getId() + "-anchBar").$().attr("aria-roledescription"), undefined, "Navigation roledescription is not set");

		oLandmarkInfo = new ObjectPageAccessibleLandmarkInfo({
			rootRole: "None",
			headerRole: "None"
		});

		oObjectPage.setLandmarkInfo(oLandmarkInfo);
		await nextUIUpdate();

		assert.strictEqual(oObjectPage.$().attr("aria-label"), undefined, "When rootRole is None and no label is set, root label is not set.");
		assert.strictEqual(oObjectPage.$("headerTitle").attr("aria-label"), undefined, "When headerRole is None and no label is set, header label is not set.");


		oObjectPage.destroy();
	});

	QUnit.test("ObjectPage landmark info aria-label is applied to dynamically shown anchor bar", async function(assert) {
	assert.expect(5);
	const oObjectPage = helpers.generateObjectPageWithContent(oFactory, 1, true);
	const oLandmarkInfo = new ObjectPageAccessibleLandmarkInfo({
			navigationRole: "Navigation",
			navigationLabel: "Custom Navigation Label"
		});
	const oSubSection = oFactory.getSubSection(1, oFactory.getBlocks());
	const oNewSection = oFactory.getSection(2, null, oSubSection);

	oObjectPage.setLandmarkInfo(oLandmarkInfo);
	oObjectPage.placeAt('qunit-fixture');
	await nextUIUpdate();

	// Initially with 1 section, anchor bar exists but is empty
	const oAnchorBar = oObjectPage.getAggregation("_anchorBar");
	assert.ok(oAnchorBar, "Anchor bar aggregation exists.");
	assert.strictEqual(oAnchorBar.getItems().length, 0, "Anchor bar is empty with only one section.");

	// Add a second section dynamically to trigger anchor bar population
	oObjectPage.addSection(oNewSection);
	await nextUIUpdate();

	// Now anchor bar should be populated and have the correct aria-label
	assert.strictEqual(oAnchorBar.getItems().length, 2, "Anchor bar now has items after adding second section.");

	const $anchorBar = oAnchorBar.$();
	assert.strictEqual($anchorBar.attr("role"), "navigation", "Navigation role is set correctly on dynamically shown anchor bar.");
	assert.strictEqual($anchorBar.attr("aria-label"), "Custom Navigation Label", "Navigation label is set correctly on dynamically shown anchor bar.");

	oObjectPage.destroy();
});

	QUnit.module("ObjectPageLayout - API - headerContentPinned property", {
		beforeEach: async function () {

			// Setup
			this.oObjectPage = oFactory.getObjectPage();
			this.oObjectPage.setHeaderContentPinned(true);
			this.oObjectPage.setHeaderTitle(oFactory.getObjectPageDynamicHeaderTitle());
			this.oHeader = this.oObjectPage._getHeaderContent();
			await helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {

			// Clean up
			this.oObjectPage.destroy();
			this.oObjectPage = null;
			this.oHeader = null;
		}
	});

	QUnit.test("Pin button is pinned initially when all the requirements are met and the headerContentPinned property is true", function (assert) {

		// Assert
		assert.strictEqual(this.oObjectPage._bPinned, true, "Internal pin flag of the ObjectPage is 'true'");
		assert.strictEqual(this.oHeader._getPinButton().getPressed(), true, "The pin button of the header is pressed.");
	});

	QUnit.test("Pin button is pinned initially, but becomes unpinned once the headerContentPinned property of the ObjectPage is set to 'false'", function (assert) {

		// Act - Setting the headerContentPinned property to 'false' and forcing re-rendering
		this.oObjectPage.setHeaderContentPinned(false);
		this.oObjectPage.onAfterRendering();

		// Assert
		assert.strictEqual(this.oObjectPage._bPinned, false, "Internal pin flag of the ObjectPage is 'false'");
		assert.strictEqual(this.oHeader._getPinButton().getPressed(), false, "The pin button of the header is not pressed.");
	});

	QUnit.test("The headerContentPinned property is altered and an event is fired when the pin button is toggled", function (assert) {

		// Assert
		assert.expect(3);

		// Arrange
		const oObjectPage = this.oObjectPage;
		const done = assert.async();
		this.oObjectPage.attachEventOnce("headerContentPinnedStateChange", function (oEvent) {

			// Assert
			assert.strictEqual(oObjectPage._bPinned, false, "Internal pin flag of the ObjectPage is 'false'");
			assert.strictEqual(oObjectPage.getHeaderContentPinned(), false, "headerContentPinned property is forced to 'false'");
			assert.strictEqual(oEvent.getParameter("pinned"), false, "headerContentPinnedStateChange event is fired with 'false' as parameter'");

			done();
		});

		// Act - Simulating pin button press
		this.oObjectPage._onPinUnpinButtonPress();
	});

	QUnit.test("The headerContentPinned property is altered and an event is fired when header is snapped by the user", function (assert) {

		// Assert
		assert.expect(3);

		// Arrange
		const oObjectPage = this.oObjectPage;
		const done = assert.async();
		this.oObjectPage.attachEventOnce("headerContentPinnedStateChange", function (oEvent) {

			// Assert
			assert.strictEqual(oObjectPage._bPinned, false, "Internal pin flag of the ObjectPage is 'false'");
			assert.strictEqual(oObjectPage.getHeaderContentPinned(), false, "headerContentPinned property is forced to 'false'");
			assert.strictEqual(oEvent.getParameter("pinned"), false, "headerContentPinnedStateChange event is fired with 'false' as parameter'");

			done();
		});

		// Act - Simulating snapping of header by user interaction
		this.oObjectPage._snapHeader(true, true);
	});

	QUnit.test("The headerContentPinned property is preserved when screen is resized", function (assert) {

		// Arrange
		const oObjectPage = this.oObjectPage;
		const done = assert.async();
		const vOriginalHeight = jQuery("#qunit-fixture").height();

		assert.expect(3);


		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Act
			jQuery("#qunit-fixture").height("100"); // container small enough

			setTimeout(function() {
				// Assert
				assert.strictEqual(oObjectPage._bPinned, false, "Header is unpinned /not by user interaction/");
				assert.strictEqual(oObjectPage.getHeaderContentPinned(), true, "headerContentPinned property is preserved");
				assert.strictEqual(oObjectPage._getHeaderContent()._getPinButton().getVisible(), false, "Pin button is hidden");

				jQuery("#qunit-fixture").height(vOriginalHeight);
				done();
			}, 800);
		});
	});

	QUnit.module("ObjectPageLayout rendering in hidden parent", {
		beforeEach: function () {

			// Setup
			this.oObjectPage = oFactory.getObjectPage();
		},
		afterEach: function () {

			// Clean up
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Store scroll location, when Object page DOM is not visible on the document on onBeforeRendering", async function(assert) {
		assert.expect(1);
		const oParentNode = document.getElementById("content");

		//Hiding parent element
		this.oObjectPage.placeAt("content");
		oParentNode.style.display = "none";

		await nextUIUpdate();
		//We want the _bDdomReady to be set to true on initial rendering
		this.oObjectPage._onAfterRenderingDomReady();
		//Assert
		assert.equal(this.oObjectPage._storeScrollLocation(), false, "We make sure we don`t store scroll location on hidden ObjectPage DOM reference");
	});

	QUnit.module("BreakpointChange Event", {
		beforeEach: function () {
			this.oObjectPage = new ObjectPageLayout();
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("breakpointChange event is fired on resize", function(assert) {
		const oEventSpy = this.spy();

		// Attach event handler
		this.oObjectPage.attachBreakpointChange(oEventSpy);

		// Set initial state to Desktop
		this.oObjectPage._sCurrentMediaRange = ObjectPageLayoutMediaRange.Desktop;

		// Change to Phone range - should fire event
		this.oObjectPage._updateMedia(400, ObjectPageLayout.MEDIA);

		// Assert event was fired
		assert.ok(oEventSpy.called, "Event was called");
		assert.strictEqual(oEventSpy.callCount, 1, "Event was fired exactly once");

		// Verify event parameters
		const oParams = oEventSpy.getCall(0).args[0].getParameters();
		assert.strictEqual(oParams.currentRange, ObjectPageLayoutMediaRange.Phone, "currentRange is 'Phone'");
		assert.strictEqual(oParams.currentWidth, 400, "currentWidth is 400px");
	});

	QUnit.test("breakpointChange event provides correct range values", function(assert) {
		const oEventSpy = this.spy();

		this.oObjectPage.attachBreakpointChange(oEventSpy);

		// Start from a known state
		this.oObjectPage._sCurrentMediaRange = ObjectPageLayoutMediaRange.Desktop;

		// Test Phone range (< 600px)
		this.oObjectPage._updateMedia(500, ObjectPageLayout.MEDIA);
		assert.strictEqual(oEventSpy.callCount, 1, "Event fired for Desktop->Phone");
		assert.strictEqual(oEventSpy.getCall(0).args[0].getParameter("currentRange"), ObjectPageLayoutMediaRange.Phone, "Range is Phone for 500px");
		assert.strictEqual(oEventSpy.getCall(0).args[0].getParameter("currentWidth"), 500, "Width is 500px");

		// Test Tablet range (600-1024px)
		this.oObjectPage._updateMedia(800, ObjectPageLayout.MEDIA);
		assert.strictEqual(oEventSpy.callCount, 2, "Event fired for Phone->Tablet");
		assert.strictEqual(oEventSpy.getCall(1).args[0].getParameter("currentRange"), ObjectPageLayoutMediaRange.Tablet, "Range is Tablet for 800px");

		// Test Desktop range (1024-1439px)
		this.oObjectPage._updateMedia(1200, ObjectPageLayout.MEDIA);
		assert.strictEqual(oEventSpy.callCount, 3, "Event fired for Tablet->Desktop");
		assert.strictEqual(oEventSpy.getCall(2).args[0].getParameter("currentRange"), ObjectPageLayoutMediaRange.Desktop, "Range is Desktop for 1200px");

		// Test DesktopExtraLarge range (>= 1440px)
		this.oObjectPage._updateMedia(1600, ObjectPageLayout.MEDIA);
		assert.strictEqual(oEventSpy.callCount, 4, "Event fired for Desktop->DesktopExtraLarge");
		assert.strictEqual(oEventSpy.getCall(3).args[0].getParameter("currentRange"), ObjectPageLayoutMediaRange.DesktopExtraLarge, "Range is DesktopExtraLarge for 1600px");
	});

	function checkObjectExists(sSelector) {
		const oObject = jQuery(sSelector);
		return oObject.length !== 0;
	}

	function isTolerableDifference(iPos, iPos2, iTolerance) {
		return Math.abs(iPos - iPos2) <= iTolerance;
	}
});