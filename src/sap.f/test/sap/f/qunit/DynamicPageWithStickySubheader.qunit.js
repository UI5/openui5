/*global QUnit*/
sap.ui.define([
	"./DynamicPageUtil",
	"sap/f/DynamicPage",
	"sap/ui/core/Element",
	"sap/ui/test/utils/nextUIUpdate"
],
	function(
		DynamicPageUtil,
		DynamicPage,
		Element,
		nextUIUpdate
	) {
		"use strict";

		const INITIAL_SCROLL_POSITION = 0,
			BIG_SCROLL_POSITION = 1000,
			oLibraryFactory = DynamicPageUtil.oFactory,
			oUtil = DynamicPageUtil.oUtil;

		function scrollingStatesOfStickyContent(assert, oDynamicPage) {
			// Arrange
			const oDynamicPageContent = oDynamicPage.getContent();
			const iIntermediateHeightInHeader = oDynamicPage._getHeaderHeight() / 2;

			// Assert
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._toggleHeaderOnScroll();
			assert.strictEqual(!oDynamicPageContent._getStickySubheaderSticked(), oDynamicPage.getHeaderExpanded());

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();
			assert.strictEqual(!oDynamicPageContent._getStickySubheaderSticked(), oDynamicPage.getHeaderExpanded());

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._toggleHeaderOnScroll();
			assert.strictEqual(!oDynamicPageContent._getStickySubheaderSticked(), oDynamicPage.getHeaderExpanded());

			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();
			assert.strictEqual(!oDynamicPageContent._getStickySubheaderSticked(), oDynamicPage.getHeaderExpanded());
			oDynamicPage.destroy();

		}

		function statesOfStickyContentWhileScrollingWhenPinUnpin(assert, oDynamicPage) {
			// Arrange
			const oDynamicPageContent = oDynamicPage.getContent();
			const iIntermediateHeightInHeader = oDynamicPage._getHeaderHeight() / 2;

			// Assert
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._pin();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._unPin();
			// before scroll - header is still expanded
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(true);
			oDynamicPage._pin();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._unPin();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage.destroy();
		}

		function headerSnapExpandStateWhileScrolling(assert, oDynamicPage) {
			// Arrange
			const oDynamicPageContent = oDynamicPage.getContent();
			const bShouldInitiallyStick = oDynamicPage.getPreserveHeaderStateOnScroll();

			// Assert
			oDynamicPage.setHeaderExpanded(true);
			assert.strictEqual(!!oDynamicPageContent._getStickySubheaderSticked(), bShouldInitiallyStick, "Initial position is correct");
			oDynamicPage.setHeaderExpanded(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage.destroy();
		}

		function headerDynamicVisibilityChange(assert, oDynamicPage) {
			// Arrange
			const oDynamicPageContent = oDynamicPage.getContent();

			// Assert
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.getHeader().setVisible(false);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage.destroy();
		}

		function headerDynamicVisibilityChangeWithPreserveHeaderStateOnScroll(assert, oDynamicPage) {
			// Arrange
			const oDynamicPageContent = oDynamicPage.getContent();

			// Assert
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage.destroy();
		}

		QUnit.module("Association value");

		QUnit.test("StickySubheaderProvider association value changes are reflected correctly", async function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/),
				sWrongStickySubheaderSource = "sWrongStickySubheaderSource";

			oUtil.renderObject(oDynamicPage);

			const sStickyContentProviderId = oDynamicPage.getContent().getId();

			// Assert initial state
			assert.notEqual(oDynamicPage._oStickySubheader, null,  "There was setted sticky subheader");
			assert.equal(oDynamicPage.getStickySubheaderProvider(), sStickyContentProviderId,  "Sticky subheader provider is the control in content aggregation");

			// Act: set provider to null
			oDynamicPage.setStickySubheaderProvider(null);
			await nextUIUpdate();
			assert.equal(oDynamicPage._oStickySubheader, null,  "There was not setted sticky subheader");
			assert.equal(oDynamicPage.getStickySubheaderProvider(), null,  "Sticky content is in sticky area");

			// Act: set provider to a non-existing ID
			oDynamicPage.setStickySubheaderProvider(sWrongStickySubheaderSource);
			await nextUIUpdate();
			assert.equal(oDynamicPage._oStickySubheader, null,  "There was not setted sticky subheader");
			assert.equal(oDynamicPage.getStickySubheaderProvider(), sWrongStickySubheaderSource,  "Sticky content is in sticky area");

			// Act: restore valid provider
			oDynamicPage.setStickySubheaderProvider(sStickyContentProviderId);
			await nextUIUpdate();
			assert.notEqual(oDynamicPage._oStickySubheader, null,  "There was setted sticky subheader");
			assert.equal(oDynamicPage.getStickySubheaderProvider(), sStickyContentProviderId,  "Sticky content is in sticky area");

			// Cleanup
			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage sticky content position while scrolling");

		QUnit.test("DynamicPage which has header and title shows correct sticky content position while scrolling", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has title and is without header shows correct sticky content position while scrolling", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, false  /*has header*/, false /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has neither title nor header shows correct sticky content position while scrolling", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, false  /*has header*/, false /*header visible*/, false /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header and is without title shows correct sticky content position while scrolling", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header without content and title shows correct sticky content position while scrolling", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oDynamicPage.getHeader().destroyContent();

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header and without title shows correct sticky content position while scrolling", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while scrolling and pin/unpin");

		QUnit.test("DynamicPage which has header and title shows correct sticky content position while scrolling with pin and unpin", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			statesOfStickyContentWhileScrollingWhenPinUnpin(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while snap/expand header");

		QUnit.test("DynamicPage which has header and title shows correct sticky content position while snapping and expanding header", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerSnapExpandStateWhileScrolling(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage with header expanded in the title-area sticks sticky subheader when scrolled to snap position", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);

			const iHeaderContentHeight = oDynamicPage._getHeaderHeight();
			const iStickySubHeaderHeight = oDynamicPage._oStickySubheader.getDomRef().offsetHeight;

			// Act: scroll to snap [where the scroll Top is close to the snap breakpoints]
			oDynamicPage._setScrollPosition(iHeaderContentHeight + iStickySubHeaderHeight);
			// Act: click to expand the header in the title area
			oDynamicPage._titleExpandCollapseWhenAllowed(true /* user interaction */);
			assert.ok(oDynamicPage._shouldStickStickyContent(), "sticky content should snap");

			oDynamicPage._toggleHeaderOnScroll();// call the scroll listener synchronously to speed up the test
			assert.ok(oDynamicPage.getContent()._getStickySubheaderSticked(), "Sticky content is in sticky area");

			// Cleanup
			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage sticky content position while scrolling and changing the visibility of header");

		QUnit.test("DynamicPage which has header and title shows correct sticky content position when header visibility changes", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header and without title shows correct sticky content position when header visibility changes", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has not visible header and title shows correct sticky content position when header visibility changes", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, false /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has not visible header and without title shows correct sticky content position when header visibility changes", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, false /*header visible*/, false /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while scrolling and changing the visibility of header without content");

		QUnit.test("DynamicPage which has header without content and title shows correct sticky content position when header visibility changes", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oDynamicPage.getHeader().destroyContent();

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header without content and without title shows correct sticky content position when header visibility changes", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			oDynamicPage.getHeader().destroyContent();

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while scrolling and rerendering iconTabBar");

		QUnit.test("DynamicPage which has header and title keeps sticky content in sticky area after IconTabBar rerender", async function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/),
				oIconTabBar = oDynamicPage.getContent();

			assert.expect(2);

			oUtil.renderObject(oDynamicPage);

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();

			// Verify init state
			assert.ok(oIconTabBar._getStickySubheaderSticked(), "Sticky content is in sticky area");

			// Act: rerender
			oIconTabBar.invalidate();
			await nextUIUpdate();

			// Assert
			assert.ok(oIconTabBar._getStickySubheaderSticked(), "Sticky content is still in sticky area");

			// Cleanup
			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content position while scrolling");

		QUnit.test("DynamicPage which has header and title shows correct sticky content position while scrolling with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/),
				oDynamicPageContent = oDynamicPage.getContent();

			oUtil.renderObject(oDynamicPage);

			const iIntermediateHeightInHeader = oDynamicPage._getHeaderHeight() / 2;

			// Assert
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();
			oDynamicPage.setHeaderExpanded(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);
			oDynamicPage._toggleHeaderOnScroll();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content while snap/expand");

		QUnit.test("DynamicPage which has header and title keeps sticky content in sticky area while snapping and expanding header with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/),
				oDynamicPageContent = oDynamicPage.getContent();

			oUtil.renderObject(oDynamicPage);

			// Assert
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll on parent rerendering");

		QUnit.test("DynamicPage with header and title places sticky subheader correctly after parent rerender", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(
				true /*preserveHeaderStateOnScroll*/,
				true /*has header*/,
				true /*header visible*/,
				true /*has title*/);

			oUtil.renderObject(oDynamicPage);

			// Assert: verify API updated correctly
			assert.ok(oDynamicPage.getContent()._getStickySubheaderSticked(), "Sticky content is in sticky area");

			// Assert: check DOM also updated correctly
			const $stickySubHeader = oDynamicPage._oStickySubheader.$();
			const $stickyPlaceholder = oDynamicPage.$("stickyPlaceholder");
			assert.strictEqual($stickySubHeader.get(0).parentElement, $stickyPlaceholder.get(0),
				"Sticky content DOM is in the sticky area");

			// Cleanup
			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content position while scrolling and snap/expand header");

		QUnit.test("DynamicPage which has header and title shows correct sticky content position while scrolling and snapping with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerSnapExpandStateWhileScrolling(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content position while scrolling and changing the visibility of header");

		QUnit.test("DynamicPage which has header and title shows correct sticky content position when header visibility changes with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChangeWithPreserveHeaderStateOnScroll(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header and without title shows correct sticky content position when header visibility changes with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChangeWithPreserveHeaderStateOnScroll(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has not visible header and title shows correct sticky content position when header visibility changes with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true  /*has header*/, false /*header visible*/, true /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChangeWithPreserveHeaderStateOnScroll(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has not visible header and without title shows correct sticky content position when header visibility changes with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true  /*has header*/, false /*header visible*/, false /*has title*/);

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChangeWithPreserveHeaderStateOnScroll(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content position while scrolling and changing the visibility of header without content");

		QUnit.test("DynamicPage which has header without content and title shows correct sticky content position when header visibility changes with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/);

			oDynamicPage.getHeader().destroyContent();

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChangeWithPreserveHeaderStateOnScroll(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header without content and without title shows correct sticky content position when header visibility changes with preserveHeaderStateOnScroll", function (assert) {
			// Arrange
			const oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			oDynamicPage.getHeader().destroyContent();

			// Act
			oUtil.renderObject(oDynamicPage);

			// Assert
			headerDynamicVisibilityChangeWithPreserveHeaderStateOnScroll(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage - Conditional CSS applied when StickySubheaderProvider is present", {
			beforeEach: function () {
				// Arrange
				this.oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);
				oUtil.renderObject(this.oDynamicPage);
			},
			afterEach: function () {
				// Clean up
				this.oDynamicPage.destroy();
				this.oDynamicPage = null;
			}
		});

		QUnit.test("DynamicPage - " + DynamicPage.NAVIGATION_CLASS_NAME + " CSS class is added when StickySubheaderProvider is present and removed when it is destroyed", function(assert) {
			// Assert: class is present initially
			assert.ok(this.oDynamicPage.hasStyleClass(DynamicPage.NAVIGATION_CLASS_NAME),
					"Dynamic Page has the " + DynamicPage.NAVIGATION_CLASS_NAME + ", " +
					"when we have StickySubheaderProvider.");

			// Act: Destroy the StickySubheaderProvider
			Element.getElementById(this.oDynamicPage.getStickySubheaderProvider()).destroy();
			oUtil.renderObject(this.oDynamicPage);

			// Assert: class is removed after provider is destroyed
			assert.notOk(this.oDynamicPage.hasStyleClass(DynamicPage.NAVIGATION_CLASS_NAME),
					"Dynamic Page doesn't have the " + DynamicPage.NAVIGATION_CLASS_NAME + ", " +
					"when we don't have StickySubheaderProvider.");
		});

		QUnit.test("Sticky subheader gets 'sapFDynamicPageStickySubheader' class when StickySubheaderProvider is set", function (assert) {
			// Arrange
			const oStickySubheader = this.oDynamicPage._oStickySubheader;

			// Assert
			assert.ok(oStickySubheader, "Sticky subheader is available");
			assert.ok(oStickySubheader.hasStyleClass("sapFDynamicPageStickySubheader"),
				"'sapFDynamicPageStickySubheader' class is added to the sticky subheader");
		});

		QUnit.test("'sapFDynamicPageStickySubheader' class survives subheader re-render", async function (assert) {
			// Arrange
			const oStickySubheader = this.oDynamicPage._oStickySubheader;
			assert.ok(oStickySubheader.hasStyleClass("sapFDynamicPageStickySubheader"),
				"'sapFDynamicPageStickySubheader' class is present before re-render");

			// Act
			oStickySubheader.invalidate();
			await nextUIUpdate();

			// Assert
			assert.ok(oStickySubheader.hasStyleClass("sapFDynamicPageStickySubheader"),
				"'sapFDynamicPageStickySubheader' class is still present after re-render");
		});

		QUnit.module("DynamicPage - scrollToElement", {
			beforeEach: function () {
				// Arrange
				this.oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);
				oUtil.renderObject(this.oDynamicPage);
			},
			afterEach: function () {
				// Clean up
				this.oDynamicPage.destroy();
				this.oDynamicPage = null;
			}
		});

		QUnit.test("ScrollToElement positions element correctly when subHeader toggles during scroll", function(assert) {
			// Arrange
			const oIconTabBar = this.oDynamicPage.getContent(),
				oElement = oIconTabBar.getItems()[0].getContent()[0].getContent()[20].getDomRef(),
				$wrapper = this.oDynamicPage.$wrapper;

			// Assert: an element in the context exists
			assert.ok(oElement, "element is in dom");

			// Act
			this.oDynamicPage.getScrollDelegate().scrollToElement(oElement);
			this.oDynamicPage._toggleHeaderOnScroll(); // synchronously call the onscroll callback

			// Assert
			assert.ok(oUtil.getChildPosition(oElement, $wrapper.get(0)).top >= $wrapper.scrollTop(), "element is visible");
		});
	});
