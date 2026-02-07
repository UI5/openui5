/*global QUnit*/

sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	'./ObjectPageLayoutUtils'
], function(nextUIUpdate, utils) {
	"use strict";

	QUnit.module("Anchor labels", {
	});

	QUnit.test("section without title but with promoted subSection", function(assert) {
		// Arrange
		var iNumberOfSections = 2,
			iNumberOfSubSectionsInEachSection = 1,
			oObjectPage = utils.helpers.generateObjectPageWithSubSectionContent(utils.oFactory, iNumberOfSections, iNumberOfSubSectionsInEachSection),
			oSection = oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			sExpectedSectionTitle,
			sActualSectionTitle;

		// Arrange
		oSection.setTitle("");
		sExpectedSectionTitle = oSubSection.getTitle();
		oObjectPage.setShowAnchorBarPopover(false);

		// Act: build the anchorBar
		oObjectPage._requestAdjustLayoutAndUxRules(true);

		// Assert
		sActualSectionTitle = oObjectPage._oABHelper._getAnchorBar().getItems()[0].getText();
		assert.strictEqual(sActualSectionTitle, sExpectedSectionTitle, "section title is correct");
	});

	QUnit.test("section with only one subsection and title on the left", function(assert) {
		// Arrange
		var iNumberOfSections = 2,
			iNumberOfSubSectionsInEachSection = 1,
			oObjectPage = utils.helpers.generateObjectPageWithSubSectionContent(utils.oFactory, iNumberOfSections, iNumberOfSubSectionsInEachSection),
			oSection = oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			sExpectedSectionTitle,
			sActualSectionTitle;

		// Arrange
		oObjectPage.setSubSectionLayout("TitleOnLeft");
		sExpectedSectionTitle = oSubSection.getTitle();

		// Act: build the anchorBar
		oObjectPage._requestAdjustLayoutAndUxRules(true);

		// Assert
		sActualSectionTitle = oObjectPage._oABHelper._getAnchorBar().getItems()[0].getText();
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
		var oAnchorBar = this.oObjectPage._oABHelper._getAnchorBar(),
			aAnchorBarItems = oAnchorBar.getItems(),
			oFirstSection = this.oObjectPage.getSections()[0],
			oThirdSection = this.oObjectPage.getSections()[2],
			sFirstSectionId = oFirstSection.getId(),
			sThirdSectionId = oThirdSection.getId(),
			oABHelper = this.oObjectPage._oABHelper;

		// Act - select first section
		oABHelper.selectAnchorForSection(sFirstSectionId);

		// Assert - first anchor should have tabindex 0, others should have -1
		aAnchorBarItems.forEach(function (oItem) {
			if (oItem.getKey() === sFirstSectionId) {
				assert.strictEqual(oItem.$().attr("tabindex"), "0", "Selected anchor button has tabindex 0");
			} else {
				assert.strictEqual(oItem.$().attr("tabindex"), "-1", "Non-selected anchor button has tabindex -1");
			}
		});

		// Act - select third section
		oABHelper.selectAnchorForSection(sThirdSectionId);

		// Assert - third anchor should have tabindex 0, others should have -1
		aAnchorBarItems.forEach(function (oItem) {
			if (oItem.getKey() === sThirdSectionId) {
				assert.strictEqual(oItem.$().attr("tabindex"), "0", "Selected anchor button has tabindex 0 after selection change");
			} else {
				assert.strictEqual(oItem.$().attr("tabindex"), "-1", "Non-selected anchor button has tabindex -1 after selection change");
			}
		});
	});

	QUnit.test("_setAnchorButtonsTabFocusValues is called when selecting anchor for section", function(assert) {
		// Arrange
		var oABHelper = this.oObjectPage._oABHelper,
			oFirstSection = this.oObjectPage.getSections()[0],
			sFirstSectionId = oFirstSection.getId(),
			oSetTabFocusSpy = this.spy(oABHelper, "_setAnchorButtonsTabFocusValues");

		// Act
		oABHelper.selectAnchorForSection(sFirstSectionId);

		// Assert
		assert.strictEqual(oSetTabFocusSpy.callCount, 1, "_setAnchorButtonsTabFocusValues is called once");
		assert.strictEqual(oSetTabFocusSpy.firstCall.args[0], sFirstSectionId, "_setAnchorButtonsTabFocusValues is called with the correct section ID");
	});
});
