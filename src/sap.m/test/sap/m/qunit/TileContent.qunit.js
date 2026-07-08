/*global QUnit */
sap.ui.define([
	"sap/m/TileContent",
	"sap/m/NewsContent",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/m/NumericContent",
	"sap/m/GenericTile"
], function(TileContent, NewsContent, Text, library, nextUIUpdate, NumericContent, GenericTile) {
	"use strict";


	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;


	QUnit.module("Default Values", {
		beforeEach : async function() {
			this.oTileContent = new TileContent();
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	QUnit.test("Property 'footer'", function(assert) {
		assert.equal(this.oTileContent.getFooter(), "", "Property 'footer' default value is correct.");
	});

	QUnit.test("Property 'footerColor'", function(assert) {
		assert.equal(this.oTileContent.getFooterColor(), "Neutral", "Property 'footerColor' default value is correct.");
	});

	QUnit.test("Property 'unit'", function(assert) {
		assert.equal(this.oTileContent.getUnit(), "", "Property 'unit' default value is correct.");
	});

	QUnit.test("Property 'disabled'", function(assert) {
		assert.equal(this.oTileContent.getDisabled(), false, "Property 'disabled' default value is correct.");
	});

	QUnit.test("Property 'frameType'", function(assert) {
		assert.equal(this.oTileContent.getFrameType(), "Auto", "Property 'frameType' default value is correct.");
	});

	QUnit.module("TileContent Inside GenericTile",{
		beforeEach : async function(){
			this.tileContent = new TileContent({
				content: new NumericContent({
					icon: "sap-icon://world",
					truncateValueTo: 5,
					value: "0",
					width: "100%",
					withMargin: false
				})
			});

			this.tile = new GenericTile({
			header: "Manage my Timesheet",
			systemInfo: "S/4HANA Cloud",
			sizeBehavior: "Responsive",
			wrappingType: "Hyphenated",
			additionalTooltip: "S/4HANA Cloud",
			tileContent: this.tileContent
			});
			//window.setTimeout(function () {this.tileContent.setFooter("Hours Missing")}, 1000);
			this.tile.placeAt("qunit-fixture");
			this.tileContent.setFooter("Hours Missing");
			await nextUIUpdate();

		},

		afterEach : function(){
			this.tile.destroy();
		}
	});

	QUnit.test("Footer property changes the GenericTile CSS class after explicitly being changed later", function(assert){
		assert.equal(this.tile.getDomRef("content").classList[1], "appInfoWithFooter", "The CSS class is applied properly");
	});

	QUnit.module("Rendering of colored footer", {
		beforeEach : async function() {
			this.oTileContent = new TileContent();
			this.oTileContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	QUnit.test("Neutral CSS Class added", function(assert) {
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorNeutral"), "Correct CSS class added");
	});

	QUnit.test("Critical CSS Class added", async function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Critical);
		await nextUIUpdate();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorCritical"), "Correct CSS class added");
	});

	QUnit.test("Error CSS Class added", async function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Error);
		await nextUIUpdate();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorError"), "Correct CSS class added");
	});

	QUnit.test("Good CSS Class added", async function(assert) {
		//Act
		this.oTileContent.setFooterColor(ValueColor.Good);
		await nextUIUpdate();
		//Assert
		assert.ok(this.oTileContent.$("footer-text").hasClass("sapMTileCntFooterTextColorGood"), "Correct CSS class added");
	});

	QUnit.module("Protected property bRenderFooter", {
		beforeEach : async function() {
			this.oTileContent = new TileContent("tileContent", {
				footer : "Current Quarter",
				unit : "EUR"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	QUnit.test("Default value of _bRenderFooter", function(assert) {
		assert.equal(this.oTileContent._bRenderFooter, true, "Default value of _bRenderFooter is correct.");
	});

	QUnit.test("Function setRenderFooter changes value and returns this", function(assert) {
		//Arrange
		var oReturnValue;

		//Act
		oReturnValue = this.oTileContent.setRenderFooter(false);

		//Assert
		assert.equal(this.oTileContent._bRenderFooter, false, "_bRenderFooter has been correctly updated.");
		assert.deepEqual(oReturnValue, this.oTileContent,  "Function setRenderFooter has returned a reference to the Tile Content.");
	});

	QUnit.test("Function setRenderFooter does not mark the control as invalidated", function(assert) {
		//Arrange
		this.spy(this.oTileContent, "invalidate");

		//Act
		this.oTileContent.setRenderFooter(false);

		//Assert
		assert.equal(this.oTileContent.invalidate.callCount, 0, "The control has not been invalidated.");
	});

	QUnit.test("Footer is not rendered in case _bRenderFooter is false", async function(assert) {
		//Arrange
		this.oTileContent.setRenderFooter(false);

		//Act
		this.oTileContent.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(!document.getElementById("tileContent-footer-text"), "No footer has been rendered.");
	});

	QUnit.module("Protected property _bRenderContent", {
		beforeEach : async function() {
			this.oTileContent = new TileContent("tileContent", {
				content: new Text()
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	QUnit.test("Default value of _bRenderContent", function(assert) {
		assert.equal(this.oTileContent._bRenderContent, true, "Default value of _bRenderContent is correct.");
	});

	QUnit.test("Function setRenderContent changes value and returns this", function(assert) {
		//Arrange
		var oReturnValue;

		//Act
		oReturnValue = this.oTileContent.setRenderContent(false);

		//Assert
		assert.equal(this.oTileContent._bRenderContent, false, "_bRenderContent has been correctly updated.");
		assert.deepEqual(oReturnValue, this.oTileContent, "Function setRenderContent has returned a reference to the Tile Content.");
	});

	QUnit.test("Function setRenderContent does not mark the control as invalidated", function(assert) {
		//Arrange
		this.spy(this.oTileContent, "invalidate");

		//Act
		this.oTileContent.setRenderContent(false);

		//Assert
		assert.equal(this.oTileContent.invalidate.callCount, 0, "The control has not been invalidated.");
	});

	QUnit.test("Content is not rendered in case _bRenderContent is false", async function(assert) {
		//Arrange
		this.oTileContent.setRenderContent(false);

		//Act
		this.oTileContent.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(!document.getElementById("tileContent-content"), "No content has been rendered.");
	});

	QUnit.module("testing tooltip", {
		afterEach : function() {
			this.oTileContent.destroy();
		}
	});

	var sPriorityText = "Medium Priority";
	QUnit.module("Priority Badge tests",{
		beforeEach : async function(){
			this.tileContent = new TileContent("customTileContent", {
				priority: "Medium",
				priorityText: sPriorityText,
				content: new NumericContent({
					icon: "sap-icon://world",
					truncateValueTo: 5,
					value: "0",
					width: "100%",
					withMargin: false
				})
			});

			this.tile = new GenericTile({
				header: "Manage my Timesheet",
				systemInfo: "S/4HANA Cloud",
				sizeBehavior: "Responsive",
				wrappingType: "Hyphenated",
				additionalTooltip: "S/4HANA Cloud",
				tileContent: this.tileContent
			});
			this.tile.placeAt("qunit-fixture");
			await nextUIUpdate();
		},

		afterEach : function(){
			this.tile.destroy();
		}
	});

	QUnit.test("ensure that priority badge is not displayed only for NewsContent", async function(assert) {
		//Assert
		assert.equal(document.getElementById("customTileContent-priority"), null, "Priority badge is not displayed for NumericContent");

		//Act
		this.tileContent.setContent(new NewsContent("newsContent", {
			contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
			subheader : "August 21, 2013"
		}));
		await nextUIUpdate();

		//Assert
		assert.ok(document.getElementById("customTileContent-priority"), "Priority badge is displayed for NewsContent");
		assert.equal(document.getElementById("customTileContent-priority-text").innerText, sPriorityText, "Priority badge text is correct");
	});

	QUnit.test("ensure that priority badge is rendered for GenericTile only in Article Mode", async function(assert) {
		//Act
		this.tileContent.setContent(new NewsContent("newsContent", {
			contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
			subheader : "August 21, 2013"
		}));
		await nextUIUpdate();

		//Assert - non-ArticleMode: sapMGTBackgroundBadge must not be rendered
		assert.equal(document.querySelectorAll('.sapMGTBackgroundBadge .sapMGTPriorityBadge').length, 0, "Priority badge is not rendered inside sapMGTBackgroundBadge when not in ArticleMode");

		//Act - switch to ArticleMode
		this.tile.setMode("ArticleMode");
		await nextUIUpdate();

		//Assert - ArticleMode: badge present in both locations
		assert.ok(document.getElementById("customTileContent-priority"), "Priority badge is displayed");
		assert.equal(document.querySelectorAll('.sapMGTPriorityBadge').length, 2, "Priority badge is rendered in both sapMGTBackgroundBadge (header) and sapMNwCPriorityContainer (body)");
		assert.equal(document.querySelectorAll('.sapMGTBackgroundBadge .sapMGTPriorityBadge').length, 1, "Priority badge is present in sapMGTBackgroundBadge");
	});

	var sAdditionalPriorityText = "Contains new News";
	QUnit.module("Additional Priority Badge tests", {
		beforeEach: async function() {
			this.tileContent = new TileContent("additionalPriorityTileContent", {
				priority: "VeryHigh",
				priorityText: "Contains Critical News",
				additionalPriority: "Low",
				additionalPriorityText: sAdditionalPriorityText,
				content: new NewsContent("additionalNewsContent", {
					contentText: "Sourcing and Procurement (3)",
					subheader: "SAP S/4HANA Cloud"
				})
			});
			this.tile = new GenericTile({
				mode: "ArticleMode",
				frameType: "Stretch",
				backgroundImage: "test.png",
				tileContent: this.tileContent
			});
			this.tile.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.tile.destroy();
		}
	});

	QUnit.test("additionalPriorityText default value is null", function(assert) {
		var oContent = new TileContent();
		assert.notOk(oContent.getAdditionalPriorityText(), "Default additionalPriorityText is falsy (null or empty string)");
		oContent.destroy();
	});

	QUnit.test("additionalPriority default value is None", function(assert) {
		var oContent = new TileContent();
		assert.strictEqual(oContent.getAdditionalPriority(), "None", "Default additionalPriority is None");
		oContent.destroy();
	});

	QUnit.test("additionalPriorityText setter updates property", function(assert) {
		this.tileContent.setAdditionalPriorityText("New Text");
		assert.strictEqual(this.tileContent.getAdditionalPriorityText(), "New Text", "additionalPriorityText updated correctly");
	});

	QUnit.test("additionalPriority setter updates property", function(assert) {
		this.tileContent.setAdditionalPriority("Medium");
		assert.strictEqual(this.tileContent.getAdditionalPriority(), "Medium", "additionalPriority updated correctly");
	});

	QUnit.test("additionalPriority setter updates badge state and icon", async function(assert) {
		this.tileContent.setAdditionalPriority("VeryHigh");
		await nextUIUpdate();
		var oBadge = this.tileContent._getAdditionalPriorityBadge();
		assert.ok(oBadge, "Badge exists");
		assert.strictEqual(oBadge.getState(), "Error", "VeryHigh priority maps to Error state");
		assert.strictEqual(oBadge.getIcon(), "sap-icon://alert", "VeryHigh priority maps to alert icon");
	});

	QUnit.test("badge is not created when additionalPriority is None even if text is set", function(assert) {
		var oContent = new TileContent({ additionalPriorityText: "test" });
		assert.notOk(oContent._getAdditionalPriorityBadge(), "Badge not created when priority is None");
		oContent.destroy();
	});

	QUnit.test("Additional priority badge is rendered in both sapMNwCPriorityContainer and sapMGTBackgroundBadge", function(assert) {
		var oBodyContainer = document.querySelector(".sapMNwCPriorityContainer");
		assert.ok(oBodyContainer, "sapMNwCPriorityContainer is rendered");
		assert.ok(oBodyContainer && oBodyContainer.querySelector(".sapMGTAdditionalPriorityBadge"), "Additional priority badge is rendered inside sapMNwCPriorityContainer");
		var oHeaderContainer = document.querySelector(".sapMGTBackgroundBadge");
		assert.ok(oHeaderContainer, "sapMGTBackgroundBadge is rendered");
		assert.ok(oHeaderContainer && oHeaderContainer.querySelector(".sapMGTAdditionalPriorityBadge"), "Additional priority badge is rendered inside sapMGTBackgroundBadge");
	});

	QUnit.test("Additional priority badge text matches additionalPriorityText", function(assert) {
		var oBadgeText = document.querySelector(".sapMNwCPriorityContainer .sapMGTAdditionalPriorityBadge .sapMObjStatusText");
		assert.ok(oBadgeText, "Badge text element exists");
		assert.strictEqual(oBadgeText && oBadgeText.innerText, sAdditionalPriorityText, "Badge text matches additionalPriorityText");
	});

	QUnit.test("Additional priority badge is not rendered when additionalPriorityText is not set", async function(assert) {
		//Act
		this.tileContent.setAdditionalPriorityText(null);
		await nextUIUpdate();
		//Assert — _getAdditionalPriorityBadge returns undefined when text is null
		assert.notOk(this.tileContent._getAdditionalPriorityBadge(), "No additional priority badge control when text is null");
	});

	QUnit.test("Additional priority badge is not rendered when additionalPriority is None", async function(assert) {
		//Act
		this.tileContent.setAdditionalPriority("None");
		await nextUIUpdate();
		//Assert — _getAdditionalPriorityBadge returns undefined when priority is None
		assert.notOk(this.tileContent._getAdditionalPriorityBadge(), "No additional priority badge control when priority is None");
	});

	QUnit.test("Both priority and additional priority badges render together in sapMNwCPriorityContainer and sapMGTBackgroundBadge", function(assert) {
		var oBodyContainer = document.querySelector(".sapMNwCPriorityContainer");
		assert.ok(oBodyContainer, "sapMNwCPriorityContainer exists");
		assert.equal(oBodyContainer && oBodyContainer.querySelectorAll(".sapMGTPriorityBadge").length, 1, "Priority badge present in sapMNwCPriorityContainer");
		assert.equal(oBodyContainer && oBodyContainer.querySelectorAll(".sapMGTAdditionalPriorityBadge").length, 1, "Additional priority badge present in sapMNwCPriorityContainer");
		var oHeaderContainer = document.querySelector(".sapMGTBackgroundBadge");
		assert.ok(oHeaderContainer, "sapMGTBackgroundBadge exists");
		assert.equal(oHeaderContainer && oHeaderContainer.querySelectorAll(".sapMGTPriorityBadge").length, 1, "Priority badge present in sapMGTBackgroundBadge");
		assert.equal(oHeaderContainer && oHeaderContainer.querySelectorAll(".sapMGTAdditionalPriorityBadge").length, 1, "Additional priority badge present in sapMGTBackgroundBadge");
	});

	QUnit.test("getAltText includes additionalPriorityText", function(assert) {
		var sAltText = this.tileContent.getAltText();
		assert.ok(sAltText.indexOf(sAdditionalPriorityText) !== -1, "additionalPriorityText is included in AltText");
	});
});