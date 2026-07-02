/*global QUnit*/

sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	'./ObjectPageLayoutUtils'
], function(nextUIUpdate, utils) {
	"use strict";

	QUnit.module("Anchor labels", {
		beforeEach: function() {
			const iNumberOfSections = 2;
			const iNumberOfSubSectionsInEachSection = 1;
			this.oObjectPage = utils.helpers.generateObjectPageWithSubSectionContent(utils.oFactory, iNumberOfSections, iNumberOfSubSectionsInEachSection);
		},
		afterEach: function() {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("section without title but with promoted subSection", function(assert) {
		// Arrange
		const oSection = this.oObjectPage.getSections()[0];
		const oSubSection = oSection.getSubSections()[0];

		// Arrange
		oSection.setTitle("");
		const sExpectedSectionTitle = oSubSection.getTitle();
		this.oObjectPage.setShowAnchorBarPopover(false);

		// Act: build the anchorBar
		this.oObjectPage._requestAdjustLayoutAndUxRules(true);

		// Assert
		const sActualSectionTitle = this.oObjectPage._oABHelper._getAnchorBar().getItems()[0].getText();
		assert.strictEqual(sActualSectionTitle, sExpectedSectionTitle, "section title is correct");
	});

	QUnit.test("section with only one subsection and title on the left", function(assert) {
		// Arrange
		const oSection = this.oObjectPage.getSections()[0];
		const oSubSection = oSection.getSubSections()[0];

		// Arrange
		this.oObjectPage.setSubSectionLayout("TitleOnLeft");
		const sExpectedSectionTitle = oSubSection.getTitle();

		// Act: build the anchorBar
		this.oObjectPage._requestAdjustLayoutAndUxRules(true);

		// Assert
		const sActualSectionTitle = this.oObjectPage._oABHelper._getAnchorBar().getItems()[0].getText();
		assert.strictEqual(sActualSectionTitle, sExpectedSectionTitle, "Anchor bar item title is correct (subsection title)");
	});

	QUnit.module("Anchor tab focus", {
		beforeEach: async function() {
			this.NUMBER_OF_SECTIONS = 3;
			this.NUMBER_OF_SUB_SECTIONS = 1;
			this.oObjectPage = utils.helpers.generateObjectPageWithSubSectionContent(utils.oFactory, this.NUMBER_OF_SECTIONS, this.NUMBER_OF_SUB_SECTIONS);
			this.oObjectPage.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Anchor buttons tabindex values are set correctly when section is selected", function(assert) {
		// Arrange
		const oAnchorBar = this.oObjectPage._oABHelper._getAnchorBar();
		const aAnchorBarItems = oAnchorBar.getItems();
		const oFirstSection = this.oObjectPage.getSections()[0];
		const oThirdSection = this.oObjectPage.getSections()[2];
		const sFirstSectionId = oFirstSection.getId();
		const sThirdSectionId = oThirdSection.getId();
		const oABHelper = this.oObjectPage._oABHelper;

		// Act - select first section
		oABHelper.selectAnchorForSection(sFirstSectionId);

		// Assert - first anchor should have tabindex 0, others should have -1
		aAnchorBarItems.forEach((oItem) => {
			if (oItem.getKey() === sFirstSectionId) {
				assert.strictEqual(oItem.$().attr("tabindex"), "0", "Selected anchor button has tabindex 0");
			} else {
				assert.strictEqual(oItem.$().attr("tabindex"), "-1", "Non-selected anchor button has tabindex -1");
			}
		});

		// Act - select third section
		oABHelper.selectAnchorForSection(sThirdSectionId);

		// Assert - third anchor should have tabindex 0, others should have -1
		aAnchorBarItems.forEach((oItem) => {
			if (oItem.getKey() === sThirdSectionId) {
				assert.strictEqual(oItem.$().attr("tabindex"), "0", "Selected anchor button has tabindex 0 after selection change");
			} else {
				assert.strictEqual(oItem.$().attr("tabindex"), "-1", "Non-selected anchor button has tabindex -1 after selection change");
			}
		});
	});

	QUnit.test("_setAnchorButtonsTabFocusValues is called when selecting anchor for section", function(assert) {
		// Arrange
		const oABHelper = this.oObjectPage._oABHelper;
		const oFirstSection = this.oObjectPage.getSections()[0];
		const sFirstSectionId = oFirstSection.getId();
		const oSetTabFocusSpy = this.spy(oABHelper, "_setAnchorButtonsTabFocusValues");

		// Act
		oABHelper.selectAnchorForSection(sFirstSectionId);

		// Assert
		assert.strictEqual(oSetTabFocusSpy.callCount, 1, "_setAnchorButtonsTabFocusValues is called once");
		assert.strictEqual(oSetTabFocusSpy.firstCall.args[0], sFirstSectionId, "_setAnchorButtonsTabFocusValues is called with the correct section ID");
	});
});
