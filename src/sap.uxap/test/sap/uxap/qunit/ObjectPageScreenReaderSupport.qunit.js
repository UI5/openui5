/*global QUnit*/

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/jquery"
],
function(Element, nextUIUpdate, ObjectPageLayout, ObjectPageSection, XMLView, $) {
	"use strict";

	const sRoleAttribute = "role";
	const sRoleDescriptionAttribute = "aria-roledescription";
	const getResourceBundleText = (sResourceBundleKey) => {
			return ObjectPageLayout._getLibraryResourceBundle().getText(sResourceBundleKey);
		};
	const assertCorrectRole = ($element, sRole, sMessage, assert) => {
			assert.strictEqual($element.attr(sRoleAttribute), sRole, sMessage);
		};
	const assertNoRoleDescription = ($element, sMessage, assert) => {
			assert.strictEqual($element.attr(sRoleDescriptionAttribute), undefined, sMessage);
		};

	QUnit.module("Screen reader support - Page elements", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-71_ObjectPageScreenReaderSupport",
				viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
			}).then(async (oView) => {
				this.objectPageView = oView;
				this.objectPageView.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oObjectPage = this.objectPageView.byId("ObjectPageLayout");
				done();
			});
		},
		afterEach: function () {
			this.objectPageView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Root element role", function (assert) {
		// Assert
		assertCorrectRole(this.oObjectPage.$(), "main", "Root element has appropriate main role set", assert);
		assertNoRoleDescription(this.oObjectPage.$(), "Root element has no role description", assert);
	});

	QUnit.test("Root element aria-label", function (assert) {
		// Arrange
		const oHeader = this.objectPageView.byId("objectPageHeader");
		const sBundleTextWithoutTitle = getResourceBundleText("ROOT_ARIA_LABEL_WITHOUT_TITLE");
		const sBundleTextRootRoleDescription = getResourceBundleText("ROOT_ROLE_DESCRIPTION");

		// Assert initial state
		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithoutTitle + " " + sBundleTextRootRoleDescription,
			"The root element has correct aria-label set");

		// Update title's text
		oHeader.setObjectTitle("Updated title");

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithoutTitle,
			"The root element has the correct aria-label after header title is updated");

		// Remove title's text
		oHeader.setObjectTitle("");

		assert.strictEqual(this.oObjectPage.$().attr("aria-label"), sBundleTextWithoutTitle,
			"The root element has the correct aria-label on empty header title");
	});

	QUnit.test("Header element role", function (assert) {
		// Assert
		assertCorrectRole(this.oObjectPage.$("headerTitle"), "banner", "Header element has appropriate banner role set", assert);
		assertNoRoleDescription(this.oObjectPage.$("headerTitle"), "Header element has no role description", assert);
	});

	QUnit.test("Header element aria-label", function (assert) {
		// Arrange
		const oHeader = this.objectPageView.byId("objectPageHeader");
		const sTitleText = oHeader.getTitleText();
		const sBundleTextWithTitle = getResourceBundleText("HEADER_ARIA_LABEL_WITH_TITLE");
		const sBundleTextWithoutTitle = getResourceBundleText("HEADER_ARIA_LABEL_WITHOUT_TITLE");
		const sBundleTextHeaderRoleDescription = getResourceBundleText("HEADER_ROLE_DESCRIPTION");

		// Assert initial state
		assert.strictEqual(this.oObjectPage.$("headerTitle").attr("aria-label"), sTitleText + " "
			+ sBundleTextWithTitle + " " + sBundleTextHeaderRoleDescription, "The header element has correct aria-label set");

		// Update title's text
		oHeader.setObjectTitle("Updated title");

		assert.strictEqual(this.oObjectPage.$("headerTitle").attr("aria-label"), "Updated title" + " "
				+ sBundleTextWithTitle, "The header element has correctly updated it's aria-label");

		// Remove title's text
		oHeader.setObjectTitle("");

		assert.strictEqual(this.oObjectPage.$("headerTitle").attr("aria-label"), sBundleTextWithoutTitle,
			"The aria-label on the header element now indicates that there is no title");
	});

	QUnit.test("AnchorBar element aria-label", function (assert) {
		// Arrange
		const oHeader = this.objectPageView.byId("objectPageHeader");
		const sBundleTextWithoutTitle = getResourceBundleText("NAVIGATION_ARIA_LABEL_WITHOUT_TITLE");

		// Act - update title's text
		oHeader.setObjectTitle("Updated title");

		// Assert
		assert.strictEqual(this.oObjectPage.$("anchorBar").attr("aria-label"), "Updated title", "The AnchorBar element has correctly updated it's aria-label");

		// Remove title's text
		oHeader.setObjectTitle("");

		assert.strictEqual(this.oObjectPage.$("anchorBar").attr("aria-label"), sBundleTextWithoutTitle,
			"The aria-label on the AnchorBar element now indicates that there is no title");
	});

	QUnit.test("AnchorBar sticky aria state", function (assert) {
		// Arrange
		const oStickyAnchorBar = this.oObjectPage.$("stickyAnchorBar");

		// Assert initial state
		assert.strictEqual(oStickyAnchorBar.attr("aria-hidden"), "true", "The sticky AnchorBar should have aria-hidden=true when header is expanded initially.");

		// Act/Assert - snap header
		this.oObjectPage._snapHeader();
		assert.strictEqual(oStickyAnchorBar.attr("aria-hidden"), "false", "The sticky AnchorBar should have aria-hidden=false when header is snaped.");

		// Act/Assert - expand header
		this.oObjectPage._expandHeader();
		assert.strictEqual(oStickyAnchorBar.attr("aria-hidden"), "true", "The sticky AnchorBar should have aria-hidden=true when header is expanded again.");
	});

	QUnit.test("Footer element role", function (assert) {
		// Assert
		assertCorrectRole(this.oObjectPage.$("footerWrapper"), "region", "Footer element has appropriate banner role set", assert);
		assertNoRoleDescription(this.oObjectPage.$("footerWrapper"), "Footer element has no role description", assert);
	});

	QUnit.test('AriaLabelledBy attribute is set correctly on the footer toolbar', function(assert) {
		// Arrange
		const oFooter = this.oObjectPage.getFooter();
		const $InvisibleTextDomRef = $("#" + oFooter.getId() + "-FooterActions-InvisibleText");

		// Assert
		assert.strictEqual($InvisibleTextDomRef.length, 1, "InvisibleText DOM element exists");
		assert.equal(oFooter.$().attr("aria-labelledby"), $InvisibleTextDomRef.attr('id'), "ObjectPageLayout Footer aria-labelledby points to the invisible text control");
	});

	QUnit.test('Invisible Text gets removed when footer aggregation is destroyed', async function(assert) {
		assert.expect(1);
		// Arrange
		const oPage = this.oObjectPage;
		const oFooter = oPage.getFooter();

		// Act
		oPage.destroyFooter();
		await nextUIUpdate();

		const $InvisibleTextDomRef = $("#" + oFooter.getId() + "-FooterActions-InvisibleText");

		// Assert
		assert.strictEqual($InvisibleTextDomRef.length, 0, "InvisibleText element is removed from the DOM");
	});

	QUnit.module("Screen reader support - Section/SubSection", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-71_ObjectPageScreenReaderSupport",
				viewName: "view.UxAP-71_ObjectPageScreenReaderSupport"
			}).then(async (oView) => {
				this.objectPageView = oView;
				this.objectPageView.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oObjectPage = this.objectPageView.byId("ObjectPageLayout");
				done();
			});
		},
		afterEach: function () {
			this.objectPageView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Section/SubSection roles", function (assert) {
		// Arrange
		const oSection = this.objectPageView.byId("testSection");
		const oSubSection = this.objectPageView.byId("testSubSection");
		const sRegionRole = "region";

		// Assert
		assertCorrectRole(oSection.$(), sRegionRole, "Sections have appropriate ARIA region role set", assert);
		assertCorrectRole(oSubSection.$(), sRegionRole, "SubSection have appropriate ARIA region role set", assert);
		assertCorrectRole(oSubSection.$(), sRegionRole, "SubSection have appropriate ARIA heading role set", assert);
	});

	QUnit.test("Section receives correct AriaLabelledBy", function (assert) {
		// Arrange
		const oSection = this.objectPageView.byId("testSection");
		const sSectionTitle = oSection.getTitle();

		// Assert
		assert.strictEqual(Element.getElementById(oSection.$().attr("aria-labelledby")).getText(), sSectionTitle,
			"Section is labaled correctly");
	});

	QUnit.module("Screen reader support - ObjectPageDynamicHeaderTitle", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-72_ObjectPageScreenReaderSupport",
				viewName: "view.UxAP-72_ObjectPageScreenReaderSupport"
			}).then(async (oView) => {
				this.objectPageView = oView;
				this.objectPageView.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oObjectPage = this.objectPageView.byId("ObjectPageLayout");
				done();
			});
		},
		afterEach: function () {
			this.objectPageView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Header element aria-label - nested Title", function (assert) {
		// Arrange
		const sBundleTextWithTitle = getResourceBundleText("HEADER_ARIA_LABEL_WITH_TITLE");
		const sBundleTextHeaderRoleDescription = getResourceBundleText("HEADER_ROLE_DESCRIPTION");

		// Assert
		assert.strictEqual(this.oObjectPage.$("headerTitle").attr("aria-label"), "Denise Smith "
				+ sBundleTextWithTitle + " " + sBundleTextHeaderRoleDescription,
				"The header element has correct aria-label with nested Title in 'heading' aggregation");
	});

	QUnit.test("Header element aria-label - updates when nested Title text changes", function (assert) {
		// Locate the nested sap.m.Title inside the FlexBox heading of the ObjectPageDynamicHeaderTitle
		var oHeaderTitle = this.oObjectPage.getHeaderTitle(),
			oFlexBox = oHeaderTitle.getHeading(),
			oTitle = oFlexBox.getItems().filter(function (oItem) {
				return oItem.isA("sap.m.Title");
			})[0],
			sBundleTextWithTitle = getResourceBundleText("HEADER_ARIA_LABEL_WITH_TITLE");

		// Act - change only the nested Title's text (does NOT invalidate the ObjectPageLayout)
		oTitle.setText("Updated supplier");

		// Assert - the parent ObjectPageLayout's headerTitle aria-label has been refreshed.
		// _updateAriaLabels rewrites the attribute without HEADER_ROLE_DESCRIPTION (which the
		// renderer adds once on initial render), matching the pattern of the test above.
		assert.strictEqual(this.oObjectPage.$("headerTitle").attr("aria-label"),
			"Updated supplier " + sBundleTextWithTitle,
			"The header element aria-label is updated after the nested Title's text changes");
	});
});
