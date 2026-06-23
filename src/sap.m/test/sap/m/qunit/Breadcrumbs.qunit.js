/*global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/dom/units/Rem",
	"sap/ui/core/theming/Parameters",
	"sap/m/Breadcrumbs",
	"sap/m/Link",
	"sap/m/OverflowToolbar",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device"
],
function(Library, DomUnitsRem, Parameters, Breadcrumbs, Link, OverflowToolBar, Text, library, nextUIUpdate, jQuery, Device) {
	"use strict";

	const oFactory = {
		getLink: function (sText, sHref) {
			return new Link({
				text: sText || "Page 1 long link",
				href: sHref || "http://go.sap.com/index.html"
			});
		},
		getText: function (sText) {
			return new Text({
				text: sText || "Current Location Text"
			});
		},
		getLinks: function (iCount) {
			const aLinks = [];
			let i;

			for (i = 0; i < iCount; i++) {
				aLinks.push(this.getLink());
			}

			return aLinks;
		},
		getBreadCrumbControlWithLinks: function (iLinkCount, sCurrentLocationText) {
			return new Breadcrumbs({
				links: [this.getLinks(iLinkCount)],
				currentLocationText: sCurrentLocationText
			});
		},
		getResourceBundle: function () {
			return Library.getResourceBundleFor("sap.m");
		}
	};

	const helpers = {
		waitForUIUpdates: function (){
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		countChildren: function (oControl){
			return oControl.$().find("li").length;
		},
		renderObject: function (oSapUiObject) {
			oSapUiObject.placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			return oSapUiObject;
		},
		controlIsInTheDom: function (oControl){
			return !!oControl.getDomRef();
		},
		setMobile: function () {
			jQuery("html").removeClass("sapUiMedia-Std-Desktop").addClass("sapUiMedia-Std-Phone");
			Device.system.desktop = false;
			Device.system.phone = true;
		},
		resetMobile: function () {
			jQuery("html").addClass("sapUiMedia-Std-Desktop").removeClass("sapUiMedia-Std-Phone");
			Device.system.desktop = true;
			Device.system.phone = false;
		},
		setSmallScreenSize: function () {
			jQuery("#qunit-fixture").css("width", "50px");
		},
		resetScreenSize: function () {
			jQuery("#qunit-fixture").css("width", "");
		}
	};

	function Parameters_getAsync(key, oElement) {
		return new Promise((resolve) => {
			const sParameter = Parameters.get({
				name: key,
				scopeElement: oElement,
				callback: resolve
			});
			if (sParameter !== undefined) {
				resolve(sParameter);
			}
		});
	}

	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - API", {
		beforeEach: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
		},
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Instantiation creates a control with the expected number of links", function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		const iLinksCount = oStandardBreadCrumbsControl.getLinks().length;

		assert.ok(oStandardBreadCrumbsControl, "is instantiated correctly");
		assert.strictEqual(iLinksCount, 4, "has " + 4 + " links");
	});

	QUnit.test("Changing the control dynamically", function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		let iExpectedLinkCount = oStandardBreadCrumbsControl.getLinks().length;
		let oNewLink;

		oStandardBreadCrumbsControl.addLink(oFactory.getLink());
		iExpectedLinkCount++;

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is correctly added to the control");

		oNewLink = oFactory.getLink();
		oStandardBreadCrumbsControl.insertLink(oNewLink, 2);
		iExpectedLinkCount++;

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is inserted correctly");

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks()[2], oNewLink,
			"the link is correctly inserted at position 2");

		oNewLink = oFactory.getLink();
		oStandardBreadCrumbsControl.insertLink(oNewLink);
		iExpectedLinkCount++;

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is inserted correctly");

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks()[0], oNewLink,
			"the link is correctly inserted at the beginning of the array");

		oStandardBreadCrumbsControl.removeLink(oStandardBreadCrumbsControl.getLinks()[0]);
		iExpectedLinkCount--;
		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is correctly removed from the control");

		const oRemovedLink = oStandardBreadCrumbsControl.getLinks()[1];
		oStandardBreadCrumbsControl.removeLink(1);
		iExpectedLinkCount--;

		assert.strictEqual(oStandardBreadCrumbsControl.getLinks().length, iExpectedLinkCount,
			"the link is correctly removed from the control using its index");

		assert.ok(oStandardBreadCrumbsControl.getLinks().indexOf(oRemovedLink) === -1,
			"the link is correctly removed from the control using its index");

		assert.throws(() => {
			oStandardBreadCrumbsControl.addLink(oFactory.getText());
		}, "an exception is thrown when trying to add an incorrect type to the links aggregation");
	});

	QUnit.test("Toggling the links visibility updates the DOM correctly", async function (assert) {
		const oBreadcrumbsControl = this.oStandardBreadCrumbsControl;
		const oSecondLink = oBreadcrumbsControl.getLinks()[1];

		await helpers.renderObject(oBreadcrumbsControl);

		assert.ok(helpers.controlIsInTheDom(oSecondLink), "Initially the link is visible and it's in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 5);

		oSecondLink.setVisible(false);
		await helpers.waitForUIUpdates();

		assert.ok(!helpers.controlIsInTheDom(oSecondLink), "The link is not visible and not in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 4);

		oSecondLink.setVisible(true);
		await helpers.waitForUIUpdates();

		assert.ok(helpers.controlIsInTheDom(oSecondLink), "The link is visible again and it's in the dom");
		assert.strictEqual(helpers.countChildren(oBreadcrumbsControl), 5);
	});

	QUnit.test("Current location setter updates the currentLocationText property", function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		const sNewCurrentLocationVal = "New current location value";

		assert.ok(oStandardBreadCrumbsControl.getCurrentLocationText(), "has current location text setted");
		assert.ok(oStandardBreadCrumbsControl.getCurrentLocation(), "has current location text control instantiated");
		assert.ok(oStandardBreadCrumbsControl.getCurrentLocation().hasStyleClass("sapMBreadcrumbsCurrentLocation"), "current location has a correct class");

		oStandardBreadCrumbsControl.setCurrentLocationText(sNewCurrentLocationVal);
		assert.strictEqual(oStandardBreadCrumbsControl.getCurrentLocationText(), sNewCurrentLocationVal, "current location value changed to sNewCurrentLocationVal");
	});

	QUnit.test("Instantiation with no current location text renders correctly", function (assert) {
		const oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(0, null);

		// Arrange
		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		let $currentLocationText = oStandardBreadCrumbsControl.$("currentText");
		assert.strictEqual($currentLocationText.length, 0, "has " + 0 + " links");

		// Act
		oStandardBreadCrumbsControl.setCurrentLocationText("Test");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		$currentLocationText = oStandardBreadCrumbsControl.$("currentText");
		assert.strictEqual($currentLocationText.length, 1, "has " + 1 + " links");

		oStandardBreadCrumbsControl.destroy();
	});

	QUnit.test("Current location not set renders without the text control in the DOM", async function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;

		oStandardBreadCrumbsControl.setCurrentLocationText("");

		await helpers.renderObject(oStandardBreadCrumbsControl);
		assert.ok(!oStandardBreadCrumbsControl.getCurrentLocation().getDomRef(), "When empty string is set the text control is not rendered");
	});

	QUnit.test("Select aggregation is rendered on small screen", async function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;

		helpers.setSmallScreenSize();
		await helpers.renderObject(oStandardBreadCrumbsControl);
		assert.ok(oStandardBreadCrumbsControl._getSelect().getDomRef(), "Select is rendered");

		helpers.resetScreenSize();
	});

	QUnit.test("Select's picker offsetY decorated on desktop", function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		const iOffsetY = 4; // px

		const oSelect = oStandardBreadCrumbsControl._getSelect();
		const oPicker = oSelect.getPicker();
		assert.strictEqual(oPicker.getOffsetY(), iOffsetY, "Picker offset Y is correctly set");
	});

	QUnit.test("Select width returns positive value when visible and zero when hidden", async function (assert) {
		// arrange
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		helpers.setSmallScreenSize();
		await helpers.renderObject(oStandardBreadCrumbsControl);

		// assert
		assert.ok(oStandardBreadCrumbsControl._getSelectWidth() > 0, "Select is rendered");

		// act
		oStandardBreadCrumbsControl.getAggregation("_select").setVisible(false);

		// assert
		assert.ok(oStandardBreadCrumbsControl._getSelectWidth() === 0, "Select is not rendered");
	});

	QUnit.test("Select enables text wrapping in overflow", async function (assert) {
		// arrange
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		helpers.setSmallScreenSize();
		await helpers.renderObject(oStandardBreadCrumbsControl);

		// act
		const oSelect = oStandardBreadCrumbsControl._getSelect();
		const oPicker = oSelect.getPicker();

		// assert
		assert.strictEqual(oSelect.getWrapItemsText(), true, "Select has wrapItemsText enabled");
		assert.ok(oPicker.hasStyleClass("sapMBreadcrumbsPicker"), "Picker has sapMBreadcrumbsPicker style class");

		helpers.resetScreenSize();
	});

	const testSeparatorStyleSymbols = function (oControl, sStyle, assert) {
		//arrange
		oControl.setSeparatorStyle(sStyle);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//act
		const sAppliedSymbol = oControl.$().find(".sapMBreadcrumbsSeparator").first().text();
		const sExpectedSymbol = Breadcrumbs.STYLE_MAPPER[oControl.getSeparatorStyle()];

		// assert
		assert.equal(sAppliedSymbol, sExpectedSymbol, sStyle + " separator loaded");
	};

	QUnit.test("Custom separator (String Rendering)", async function (assert) {
		for (const sStyle of Object.keys(library.BreadcrumbsSeparatorStyle)) {
			// arrange
			// using a new control each time enforces initial string rendering
			const oControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
			oControl.placeAt("qunit-fixture");

			// assert
			await testSeparatorStyleSymbols(oControl, sStyle, assert);

			// clean up
			oControl.destroy();
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		}
	});

	QUnit.test("Separator has aria-hidden attribute set to true", function (assert) {
		// arrange
		const oControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
		oControl.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(oControl.getDomRef().querySelector(".sapMBreadcrumbsSeparator").getAttribute("aria-hidden"), "true",
			"the separator has 'aria-hidden' attr set to 'true'");

		// clean up
		oControl.destroy();
	});

	QUnit.test("Custom separator (DOM Patching)", async function (assert) {
		//arrange
		const oControl = this.oStandardBreadCrumbsControl;
		oControl.placeAt("qunit-fixture");
		// initial rendering is always string rendering, later re-renderings will use DOM patching
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//assert
		for (const sStyle of Object.keys(library.BreadcrumbsSeparatorStyle)) {
			await testSeparatorStyleSymbols(oControl, sStyle, assert);
		}
	});

	QUnit.test("CurrentLocation IS NOT a link by default", async function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl.clone();
		await helpers.renderObject(oStandardBreadCrumbsControl);

		assert.equal(oStandardBreadCrumbsControl.$().find(".sapMBreadcrumbsCurrentLocation").prop("tagName"), "SPAN", "Current location IS NOT a link");
	});

	QUnit.test("CurrentLocation is a link when a Link control is set as currentLocation", async function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl.clone();
		const oLink = new Link({text: "currentLocation"});
		oStandardBreadCrumbsControl.setCurrentLocation(oLink);
		await helpers.renderObject(oStandardBreadCrumbsControl);

		assert.equal(oStandardBreadCrumbsControl.$().find(".sapMBreadcrumbsCurrentLocation").prop("tagName"), "A", "Current location is a link");
	});

	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - Mobile cases, small screen", {
		beforeEach: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
			helpers.setMobile();
			helpers.setSmallScreenSize();
		},
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
			helpers.resetMobile();
			helpers.resetScreenSize();
		}
	});

	QUnit.test("Select on mobile contains all links with no current location text", async function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		oStandardBreadCrumbsControl.setCurrentLocationText("");
		await helpers.renderObject(oStandardBreadCrumbsControl);

		const aSelectItems = oStandardBreadCrumbsControl._getSelect().getItems();

		assert.ok(!oStandardBreadCrumbsControl.getCurrentLocationText(), "There's no current location text set");
		assert.ok(aSelectItems.length === 4, "All links are in select, but no current location item");
	});

	QUnit.test("Select on mobile contains all links with current location text", async function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		await helpers.renderObject(oStandardBreadCrumbsControl);

		const aSelectItems = oStandardBreadCrumbsControl._getSelect().getItems();

		assert.ok(oStandardBreadCrumbsControl.getCurrentLocationText(), "There's current location text set");
		assert.ok(aSelectItems.length === 5, "All links are in select along with the currrent location item");
	});

	QUnit.test("Select on mobile contains only links with visible true", function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		const oSecondLink = oStandardBreadCrumbsControl.getLinks()[0];

		const iItemsLengthA = oStandardBreadCrumbsControl._getItemsForMobile().length;
		oSecondLink.setVisible(false);
		const iItemsLengthB = oStandardBreadCrumbsControl._getItemsForMobile().length;

		assert.ok(iItemsLengthB === iItemsLengthA - 1, "All links with visible true are returned");
	});

	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - Special cases", {
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Breadcrumbs in OverflowToolbar", async function (assert) {
		// Arrange
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, "Loooooooooooooooooooooooooong current location text");
		const oOFT = new OverflowToolBar({
				content: [this.oStandardBreadCrumbsControl]
			});
		const oSpy = this.spy(this.oStandardBreadCrumbsControl, "fireEvent");
		await helpers.renderObject(oOFT);

		// Assert
		const sMinWidth = this.oStandardBreadCrumbsControl.$().css("min-width");
		assert.ok(parseInt(sMinWidth) > DomUnitsRem.toPx(
			await Parameters_getAsync("_sap_m_Toolbar_ShrinkItem_MinWidth")),
			"Min-width is bigger than the standart 2.5rem/40px width of OFT's shrikable items");
		assert.ok(oSpy.calledWith("_minWidthChange"), "Invalidation event is fired for the OFT");
		//Arrange
		const oCurrentLocation = this.oStandardBreadCrumbsControl.getCurrentLocation();
		const iCurrentLocationHeight = oCurrentLocation.$().height();

		//Act
		document.getElementById("qunit-fixture").setAttribute("style", "width: 200px");
		await helpers.waitForUIUpdates();

		// Assert
		assert.equal(oCurrentLocation.$().height(), iCurrentLocationHeight, "Breadcrumbs current location element truncates, when space is not enough");

		//Clean up
		document.getElementById("qunit-fixture").setAttribute("style", "width: 200px");

	});

	QUnit.test("Breadcrumbs in OverflowToolbar's Popover does not fire invalidation event", async function (assert) {
		// Arrange
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, "Loooooooooooooooooooooooooong current location text");
		const oOFT = new OverflowToolBar({
				content: [new Text({text: "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooonooooooooong"}),
					this.oStandardBreadCrumbsControl]
			});
		const oSpy = this.spy(oOFT, "_onInvalidationEventFired");

		await helpers.renderObject(oOFT);

		// Act
		oOFT._getOverflowButton().firePress();

		// Assert
		assert.ok(oSpy.notCalled, "Invalidation event is not fired for the OFT");
		assert.strictEqual(this.oStandardBreadCrumbsControl._bInOverflow, true, "_bInOverflow is true when Breadcrumbs is in the Popover of OFT");

		// Clean up
		oOFT.destroy();
	});

	QUnit.test("Breadcrumbs in OverflowToolbar - config", function (assert) {
		// Arrange
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, "Current location text");

		// Act
		const oOFTConfig = this.oStandardBreadCrumbsControl.getOverflowToolbarConfig();

		// Assert
		assert.strictEqual(oOFTConfig.canOverflow, true, "Breadcrumbs can overflow");
		assert.strictEqual(oOFTConfig.getCustomImportance(), "Medium", "Breadcrumbs have Medium overflow importance");
		assert.strictEqual(oOFTConfig.invalidationEvents.length, 1, "Breadcrumbs have one invalidation event");
		assert.strictEqual(oOFTConfig.invalidationEvents[0], "_minWidthChange", "Invalidation event is '_minWidthChange'");
		assert.strictEqual(typeof oOFTConfig.onAfterExitOverflow, "function", "Breadcrumbs have onAfterExitOverflow function implementation");
		assert.strictEqual(typeof oOFTConfig.onBeforeEnterOverflow, "function", "Breadcrumbs have onBeforeEnterOverflow function implementation");
	});

	QUnit.test("Breadcrumbs in OverflowToolbar - reseting control", async function (assert) {
		// Arrange
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, "Current location text");
		await helpers.renderObject(this.oStandardBreadCrumbsControl);

		const oSpy = this.spy(this.oStandardBreadCrumbsControl, "_resetControl");

		// Act
		this.oStandardBreadCrumbsControl._onAfterExitOverflow();

		// Assert
		assert.ok(oSpy.calledOnce, "_resetControl is called, when Breadcrumbs exits overflow menu");

		// Clean up
		oSpy.resetHistory();

		// Act
		this.oStandardBreadCrumbsControl.setCurrentLocationText("New Location Text");

		// Assert
		assert.ok(oSpy.calledOnce, "_resetControl is called, when currentLocationText is changed");
	});

	QUnit.test("Only links", async function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4);
		await helpers.renderObject(this.oStandardBreadCrumbsControl);
		assert.ok(!this.oStandardBreadCrumbsControl.getCurrentLocation().getDomRef(), "Current location has no dom ref");
		const $lastSeparator = this.oStandardBreadCrumbsControl.$().find("li.sapMBreadcrumbsItem:last-child > span.sapMBreadcrumbsSeparator");

		assert.ok($lastSeparator.length, "There is a '/' separator after last link");
		assert.strictEqual(Math.ceil(parseFloat($lastSeparator.css("fontSize"))),
			DomUnitsRem.toPx(await Parameters_getAsync("sapMFontMediumSize")),
			"Font-size of the separator is 14px");
	});

	QUnit.test("Only current location renders without a Select icon", async function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(0, "Current location text");

		helpers.setSmallScreenSize();
		await helpers.renderObject(this.oStandardBreadCrumbsControl);
		assert.ok(this.oStandardBreadCrumbsControl.getCurrentLocation().getDomRef(), "Current location is rendered");
		assert.ok(!this.oStandardBreadCrumbsControl._getSelect().getDomRef(), "No Select icon");
		helpers.resetScreenSize();
	});

	QUnit.test("Prevent dependency bug with select's popover", async function (assert) {
		const pickerAfterOpenSpy = this.spy(Breadcrumbs.prototype, "_removeItemNavigation");
		const pickerBeforeCloseSpy = this.spy(Breadcrumbs.prototype, "_restoreItemNavigation");
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(15, "Current location text");

		await helpers.renderObject(this.oStandardBreadCrumbsControl);

		this.oStandardBreadCrumbsControl._getSelect().open();
		this.oStandardBreadCrumbsControl._getSelect().close();

		assert.ok(pickerAfterOpenSpy.calledOnce, "Popover after open event is handled");
		assert.ok(pickerBeforeCloseSpy.calledOnce, "Popover after before close event is handled");
	});

	QUnit.test("No invalidation when creating the select", async function (assert) {
		const createSelectSpy = this.spy(Breadcrumbs.prototype, "_getSelect");
		const afterRenderingSpy = this.spy(Breadcrumbs.prototype, "onAfterRendering");
		const invalidateSpy = this.spy(Breadcrumbs.prototype, "invalidate");
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(15, "Current location text");

		this.oStandardBreadCrumbsControl.addEventDelegate({
			onBeforeRendering: function() {
				invalidateSpy.resetHistory();
			}
		});

		// Act
		await helpers.renderObject(this.oStandardBreadCrumbsControl);

		// Check if invalidation upon select creation during rendering
		assert.ok(createSelectSpy.calledBefore(afterRenderingSpy), "select is created during rendering");
		assert.ok(invalidateSpy.notCalled, "breadcrumb is not invalidated during rendering");
	});

	QUnit.test("Prevent width rounding issues", async function (assert) {
		const oLink1 = new Link({text: "Sales Organization"});
		const oLink2 = new Link({text: "Order Type"});
		this.oStandardBreadCrumbsControl = new Breadcrumbs({
			links: [oLink1, oLink2]
		});

		await helpers.renderObject(this.oStandardBreadCrumbsControl);

		this.stub(this.oStandardBreadCrumbsControl, "$").callsFake(() => {
			return {
				"hasClass": function(){ return false; },
				"outerWidth": function(){ return 208;}
			};
		});
		this.stub(oLink1, "$").callsFake(() => {
			return {
				"parent": function() {
					return {
						"outerWidth": function(){ return 128;}
					};
				}
			};
		});
		this.stub(oLink2, "$").callsFake(() => {
			return {
				"parent": function() {
					return {
						"outerWidth": function(){ return 81;}
					};
				}
			};
		});

		const iSumOfContentWidths = oLink1.$().parent().outerWidth() + oLink2.$().parent().outerWidth();
		const iContainerWidth = this.oStandardBreadCrumbsControl.$().outerWidth();

		// assert mocked setup (when we have a rounding issue)
		assert.strictEqual(iSumOfContentWidths, iContainerWidth + 1, "sum of the widths of the children exceeds the container width by 1");

		this.oStandardBreadCrumbsControl._resetControl();
		this.oStandardBreadCrumbsControl.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.equal(this.oStandardBreadCrumbsControl._getSelect().getVisible(), false, "select is not shown");
	});

	QUnit.test("Skip overflow recalculations when no width change", async function (assert) {
		const oLink1 = new Link({text: "link1"});
		const oLink2 = new Link({text: "link2"});
		this.oStandardBreadCrumbsControl = new Breadcrumbs({
			links: [oLink1, oLink2]
		});

		await helpers.renderObject(this.oStandardBreadCrumbsControl);

		const oSpy = this.spy(this.oStandardBreadCrumbsControl, "_getControlDistribution");

		// Act
		this.oStandardBreadCrumbsControl._handleScreenResize({
			size: { width: 100},
			oldSize: { width: 100}
		});

		assert.notOk(oSpy.called, "skipped overflow recalculations");
	});

	QUnit.test("Skip overflow recalculations when new width is 0", async function (assert) {
		// Arrange
		const oLink1 = new Link({text: "link1"});
		const oLink2 = new Link({text: "link2"});

		this.oStandardBreadCrumbsControl = new Breadcrumbs({
			links: [oLink1, oLink2]
		});

		await helpers.renderObject(this.oStandardBreadCrumbsControl);

		const oSpy = this.spy(this.oStandardBreadCrumbsControl, "_getControlDistribution");

		// Act
		this.oStandardBreadCrumbsControl._handleScreenResize({
			size: { width: 0 },
			oldSize: { width: 100}
		});

		// Assert
		assert.ok(oSpy.notCalled, "Skipped overflow recalculations");

		// Clean up
		this.oStandardBreadCrumbsControl.destroy();
	});

	QUnit.module("Breadcrumbs - private functions", {
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("_determineControlDistribution - all items in breadcrumb", async function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks();

		await helpers.renderObject(this.oStandardBreadCrumbsControl);
		this.oStandardBreadCrumbsControl._iSelectWidth = 50;
		this.oStandardBreadCrumbsControl._getControlsInfo = function () {
			return {
				aControlInfo: [{
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}]
			};
		};
		const aControlDistrib = this.oStandardBreadCrumbsControl._determineControlDistribution(300);
		assert.ok(aControlDistrib.aControlsForBreadcrumbTrail.length === 3, "Trail has 3 items");
		assert.ok(aControlDistrib.aControlsForSelect.length === 0, "There is no select items");
	});

	QUnit.test("_determineControlDistribution - all items in select", async function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks();

		await helpers.renderObject(this.oStandardBreadCrumbsControl);
		this.oStandardBreadCrumbsControl._iSelectWidth = 50;
		this.oStandardBreadCrumbsControl._getControlsInfo = function () {
			return {
				aControlInfo: [{
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}]
			};
		};
		const aControlDistrib = this.oStandardBreadCrumbsControl._determineControlDistribution(60);
		assert.ok(aControlDistrib.aControlsForBreadcrumbTrail.length === 1, "There must be always one item in the trail");
		assert.ok(aControlDistrib.aControlsForSelect.length === 2, "Select has 2 items");
	});

	QUnit.test("_determineControlDistribution - equal select and breadcrumb items", async function (assert) {
		this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks();

		await helpers.renderObject(this.oStandardBreadCrumbsControl);
		this.oStandardBreadCrumbsControl._iSelectWidth = 50;
		this.oStandardBreadCrumbsControl._getControlsInfo = function () {
			return {
				aControlInfo: [{
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}, {
					bCanOverflow: true,
					control: {},
					width: 100
				}]
			};
		};
		const aControlDistrib = this.oStandardBreadCrumbsControl._determineControlDistribution(250);
		assert.ok(aControlDistrib.aControlsForBreadcrumbTrail.length === 2, "There are 2 items in the trail");
		assert.ok(aControlDistrib.aControlsForSelect.length === 2, "There are 2 items in the breadcrumb");
	});


	/*------------------------------------------------------------------------------------*/
	QUnit.module("Breadcrumbs - Accessibility", {
		beforeEach: function () {
			this.oStandardBreadCrumbsControl = oFactory.getBreadCrumbControlWithLinks(4, oFactory.getText());
		},
		afterEach: function () {
			this.oStandardBreadCrumbsControl.destroy();
		}
	});

	QUnit.test("Screen reader support", async function ( assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		const sExpectedText = oStandardBreadCrumbsControl._getInvisibleText().getId();

		await helpers.renderObject(oStandardBreadCrumbsControl);
		assert.strictEqual(oStandardBreadCrumbsControl.$()[0].tagName, "NAV", "Breadcrumbs is rendered in nav HTML element");
		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("aria-labelledby"), sExpectedText, "has correct 'aria-labelledby'");
		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("role"), undefined, "Role shouldn't be defined for the nav element");

		oStandardBreadCrumbsControl.$().find("li").each((index, item) => {
			assert.strictEqual(jQuery(item).attr("role"), undefined, "Role shouldn't be defined for the li element");
		});
	});

	QUnit.test("Position and size of the items", function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		const oCurrentLocation = oStandardBreadCrumbsControl.getCurrentLocation();
		const oLinks = oStandardBreadCrumbsControl._getControlsForBreadcrumbTrail();
		const oFirstLink = oLinks[0];

		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		const aAriaLabelledByFirstLink = oFirstLink.getAriaLabelledBy();
		const oInvisibleTextData = oStandardBreadCrumbsControl._aCachedInvisibleTexts.find((oItem) => {
			return oItem.controlId === oFirstLink.getId();
		});

		assert.strictEqual(oInvisibleTextData.invisibleText.getText(), "1 of " + oLinks.length, "Announcement is correct");
		assert.ok(aAriaLabelledByFirstLink.includes(oInvisibleTextData.invisibleText.getId()), "Announcement is correct");

		assert.ok(oCurrentLocation.$().attr("aria-label").indexOf(oLinks.length + " of " + oLinks.length) > -1, "Aria label is correct");
	});

	QUnit.test("Current location aria attributes are set correctly", async function (assert) {
		// Arrange
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		const oCurrentLocation = oStandardBreadCrumbsControl.getCurrentLocation();

		// Act
		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		await helpers.waitForUIUpdates();

		// Assert
		assert.strictEqual(oCurrentLocation.$().attr("aria-current"), "page", "Current location should have correct aria attribute");
		assert.strictEqual(oCurrentLocation.$().attr("role"), undefined, "Current location should not have role attribute, when Text control is rendered");
	});

	QUnit.test("Keyboard Handling", async function (assert) {
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;

		await helpers.renderObject(oStandardBreadCrumbsControl);
		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("tabindex"), "0", "Default tabindex 0 should be set");

		// Act - make the inside elements of the control empty
		oStandardBreadCrumbsControl.setCurrentLocationText("");
		oStandardBreadCrumbsControl.removeAllLinks();
		await helpers.waitForUIUpdates();

		assert.strictEqual(oStandardBreadCrumbsControl.$().attr("tabindex"), undefined, "Tabindex should not be set for empty breadcrumbs");
	});

	QUnit.test("Current location focus restored after adding a new link", function (assert) {
		// Arrange
		const oStandardBreadCrumbsControl = this.oStandardBreadCrumbsControl;
		const oCurrentLocation = oStandardBreadCrumbsControl.getCurrentLocation();

		oStandardBreadCrumbsControl.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		// Act
		oCurrentLocation.focus();
		// Assert
		assert.equal(document.activeElement, oCurrentLocation.getDomRef(), "Focus on the current location element");
		// Act
		oStandardBreadCrumbsControl.addLink(new Link({text: "New Test Link"}));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		// Assert
		assert.equal(document.activeElement, oCurrentLocation.getDomRef(), "Focus is correctly restored");

	});

	QUnit.test("ARIA labelledBy", function(assert) {
		const oBreadcrumbsControl = new Breadcrumbs({
			ariaLabelledBy: "id1"
		});

		oBreadcrumbsControl.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oBreadcrumbsControl.getAriaLabelledBy().join(""), "id1", "aria-labelledby is set correctly");

		oBreadcrumbsControl.destroy();
	});

	QUnit.module("Internal ItemNavigation");

	QUnit.test("Alt/meta key combined with navigation keys is not handled by ItemNavigation", function (assert) {
		// Prepare
		const oBreadcrumbs = new Breadcrumbs();

		// Act
		oBreadcrumbs._configureKeyboardHandling();

		// Assert
		const oModifiers = oBreadcrumbs._getItemNavigation().getDisabledModifiers();
		assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
		assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
		assert.ok(oModifiers["sapnext"].indexOf("alt") !== -1, "right is not handled when alt is pressed");
		assert.ok(oModifiers["sapnext"].indexOf("meta") !== -1, "right is not handled when meta key is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("alt") !== -1, "left is not handled when alt is pressed");
		assert.ok(oModifiers["sapprevious"].indexOf("meta") !== -1, "left is not handled when meta key is pressed");

		// Cleanup
		oBreadcrumbs.destroy();
	});

	QUnit.test("Disabled links are not included in ItemNavigation object", async function (assert) {
		// Prepare
		const oLink1 = new Link({text: "Sales Organization"});
		const oLink2 = new Link({text: "Order Type", enabled: false});
		const oBreadcrumbs = new Breadcrumbs({
			links: [oLink1, oLink2]
		});

		// Act
		await helpers.renderObject(oBreadcrumbs);

		// Assert
		assert.strictEqual(oBreadcrumbs._getItemNavigation().getItemDomRefs().length, 1, "there should be only one link in item navigation's items.");

		// Cleanup
		oBreadcrumbs.destroy();
	});

	QUnit.module("OverflowToolbar configuration");

	QUnit.test("OverflowToolbar configuration is set correctly", function (assert) {
		const oBreadcrumbs = new Breadcrumbs();
		const oConfig = oBreadcrumbs.getOverflowToolbarConfig();

		assert.ok(oConfig.canOverflow, "canOverflow is set to true");
		assert.equal(typeof oConfig.getCustomImportance, "function", "getCustomImportance function is set");
		assert.equal(oConfig.getCustomImportance(), "Medium", "customImportance is set to 'Medium'");
	});

	QUnit.module("Mobile phone - picker dialog", {
		beforeEach: async function () {
			helpers.setMobile();
			this.oBreadcrumbs = new Breadcrumbs({
				links: oFactory.getLinks(4),
				currentLocationText: "Current"
			});
			await helpers.renderObject(this.oBreadcrumbs);
		},
		afterEach: function () {
			helpers.resetMobile();
			this.oBreadcrumbs.destroy();
		}
	});

	QUnit.test("Phone picker dialog has no header", function (assert) {
		const oPicker = this.oBreadcrumbs._getSelect().getPicker();

		assert.strictEqual(oPicker.getShowHeader(), false,
			"Dialog showHeader is false ? header container is not rendered");
	});

	QUnit.test("Phone picker dialog has no custom header aggregation", function (assert) {
		const oPicker = this.oBreadcrumbs._getSelect().getPicker();

		assert.notOk(oPicker.getCustomHeader(),
			"Custom header aggregation is destroyed/absent ? no title or close icon");
	});

	QUnit.test("Phone picker dialog has a footer Cancel button", function (assert) {
		const oPicker = this.oBreadcrumbs._getSelect().getPicker();
		const oEndButton = oPicker.getEndButton();

		assert.ok(oEndButton, "An end button exists in the dialog footer");
		assert.strictEqual(
			oEndButton.getText(),
			oFactory.getResourceBundle().getText("SELECT_CANCEL_BUTTON"),
			"Footer button text is the i18n Cancel label"
		);
	});

	QUnit.test("Footer Cancel button closes the dialog", function (assert) {
		const oSelect = this.oBreadcrumbs._getSelect();
		const oPicker = oSelect.getPicker();
		const oEndButton = oPicker.getEndButton();
		const oCloseSpy = this.spy(oSelect, "close");

		oEndButton.firePress();

		assert.ok(oCloseSpy.calledOnce, "Pressing the Cancel button calls Select.close()");
	});
});
