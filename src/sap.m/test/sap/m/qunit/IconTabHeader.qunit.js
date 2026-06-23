/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes",
	"sap/m/BadgeCustomData",
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/ScrollContainer",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/CustomData",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Panel",
	"sap/m/library",
	"sap/base/util/Deferred",
	"sap/ui/core/Element",
	"sap/ui/Device"
], function(
	Library1,
	QUnitUtils,
	nextUIUpdate,
	KeyCodes,
	BadgeCustomData,
	IconTabHeader,
	IconTabFilter,
	IconTabSeparator,
	ScrollContainer,
	Text,
	VBox,
	Core,
	InvisibleMessage,
	CustomData,
	createAndAppendDiv,
	Panel,
	Library,
	Deferred,
	Element,
	Device
) {
	"use strict";

	// shortcut for sap.m.TabsOverflowMode
	var TabsOverflowMode = Library.TabsOverflowMode;

	// shortcut for sap.m.IconTabHeaderMode
	var IconTabHeaderMode = Library.IconTabHeaderMode;

	var DOM_RENDER_LOCATION = "content";
	var oRB = Library1.getResourceBundleFor("sap.m");

	createAndAppendDiv(DOM_RENDER_LOCATION);

	function createHeaderWithItems(iNum, bWithSeparators) {
		var aItems = [];
		for (var i = 0; i < iNum; i++) {
			aItems.push(new IconTabFilter({
				text: "Tab " + i,
				key: i
			}));

			if (bWithSeparators && i < (iNum - 1)) {
				aItems.push(new IconTabSeparator());
			}
		}

		return new IconTabHeader({
			items: aItems
		});
	}

	function createHeaderWithItemsSubItems(iNum, iSubTabPosition) {
		var aItems = [];
		for (var i = 0; i < iNum; i++) {
			aItems.push(new IconTabFilter({
				text: "Tab " + i,
				key: i,
				items: new IconTabFilter({
					text: iSubTabPosition === 0 ? "SubTab " + i : null
				})
			}));
		}

		return new IconTabHeader({
			items: aItems
		});
	}

	function fillWithItems(oITH, iCount) {
		for (var i = 0; i < iCount; i++) {
			oITH.addItem(new IconTabFilter({
				text: "Tab " + i,
				key: i
			}));
		}
	}

	function headerThemeApplied(oHeader) {
		if (oHeader._bThemeApplied) {
			return Promise.resolve();
		}

		const oDeferred = new Deferred();

		const fnHandleThemeApplied = oHeader._handleThemeApplied;
		oHeader._handleThemeApplied = function () {
			fnHandleThemeApplied.apply(this, arguments);
			oDeferred.resolve();
		};

		return oDeferred.promise;
	}

	const fnRunAllTimersAndRestore = (oClock) => {
		if (!oClock) {
			return;
		}
		oClock.runAll();
		oClock.restore();
	};

	QUnit.module("Methods");

	QUnit.test("_findItemByKey", function (assert) {
		// arrange
		var oITH = createHeaderWithItems(3),
			oNestedItem = new IconTabFilter({
				key: "nested"
			}),
			oSecondItem = oITH.getItems()[1];

		oSecondItem.addItem(oNestedItem);

		// assert
		assert.strictEqual(oITH._findItemByKey("nested"), oNestedItem, "Nested item should be found.");

		oITH.destroy();
	});

	QUnit.module("Overflow tab");

	QUnit.test("Adding event delegates", async function (assert) {
		// arrange
		var oSpy = sinon.spy(IconTabFilter.prototype, "addEventDelegate"),
			oITH = createHeaderWithItems(100);
		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oSpy.calledWith(oITH._oOverflowEventDelegate, oITH._getOverflow()), "Event delegate is added to the overflow tab");

		// clean up
		oITH.destroy();
	});

	QUnit.test("Removing event delegates", async function (assert) {
		// arrange
		var oITH = createHeaderWithItems(100);
		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		var oOverflow = oITH._getOverflow(),
			oSpy = sinon.spy(oOverflow, "removeEventDelegate"),
			oOverflowEventDelegate = oITH._oOverflowEventDelegate;

		// Act
		oITH.destroy();

		// assert
		assert.ok(oSpy.calledWith(oOverflowEventDelegate), "Event delegate is removed from the overflow tab");
	});

	QUnit.module("Resize", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("when there is not enough space, items should be hidden", async function(assert) {
		// arrange
		var oITH = createHeaderWithItems(4),
			oLastItem = oITH.getItems()[3];

		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		assert.notOk(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter is visible");

		oITH.$().width("200px");
		await nextUIUpdate(this.clock);
		this.clock.tick(300);

		// assert
		assert.ok(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter is hidden");

		// clean up
		oITH.destroy();
	});

	QUnit.test("hide items together with preceding separator", async function(assert) {
		// arrange
		var oITH = createHeaderWithItems(4, true),
			aItems = oITH.getItems(),
			oLastSeparator = aItems[5],
			oLastItem = aItems[6];

		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// assert - all visible
		assert.notOk(oLastSeparator.$().hasClass("sapMITBFilterHidden"), "the last separator is visible");
		assert.notOk(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter item is visible");

		// act - resize
		oITH.$().width("200px");
		await nextUIUpdate(this.clock);
		this.clock.tick(300);

		// assert - last item is hidden
		assert.ok(oLastSeparator.$().hasClass("sapMITBFilterHidden"), "the last separator is hidden");
		assert.ok(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter item is hidden");

		// act - select last item
		oITH.setSelectedKey(oLastItem.getKey());
		await nextUIUpdate(this.clock);
		this.clock.tick(300);

		// assert - selected item is visible
		assert.notOk(oLastSeparator.$().hasClass("sapMITBFilterHidden"), "the last separator is visible");
		assert.notOk(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter item is visible");

		// clean up
		oITH.destroy();
	});

	QUnit.test("when first item is truncated, more button is still visible", async function(assert) {
		// arrange
		var oITH = createHeaderWithItems(2),
			oContainer = new Panel({
				width: "50px",
				content: [oITH]
			});

		oContainer.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oITH._getOverflow().$().hasClass("sapMITHOverflowVisible"), "the more button is visible");

		// clean up
		oContainer.destroy();
	});

	QUnit.module("Shifting behavior");

	QUnit.test("Selecting an overflown tab causes it to show up in the tab strip", async function (assert) {
		// Arrange
		var oITH = createHeaderWithItems(100);
		var oTargetTab = oITH.getItems()[99];
		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		var aVisibleTabs = oITH.$().find(".sapMITBItem:not(.sapMITBFilterHidden)").toArray();
		assert.strictEqual(aVisibleTabs.indexOf(oTargetTab.getDomRef()), -1, "The target tab is not in the tab strip before it gets picked");
		assert.strictEqual(oITH._getItemsInStrip().indexOf(oTargetTab), -1, "The target tab is not in the tab strip before it gets picked");

		// Act
		oITH.setSelectedKey("99");
		await nextUIUpdate();

		// Assert
		aVisibleTabs = oITH.$().find(".sapMITBItem:not(.sapMITBFilterHidden)").toArray();
		assert.notStrictEqual(aVisibleTabs.indexOf(oTargetTab.getDomRef()), -1, "The target tab is not in the tab strip before it gets picked");
		assert.notStrictEqual(oITH._getItemsInStrip().indexOf(oTargetTab), -1, "The target tab is now in the tab strip after it got selected");

		// Clean-up
		oITH.destroy();
	});

	QUnit.test("Tabs are correctly shifted with tabsOverflowMode=StartAndEnd", async function (assert) {
		// Arrange
		var oITH = createHeaderWithItems(10);
		oITH.setTabsOverflowMode(TabsOverflowMode.StartAndEnd);

		var oContainer = new VBox({
			width: "300px",
			items: oITH
		});

		// Act
		oContainer.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oITH.getDomRef("head").querySelectorAll(".sapMITBFilter:not(.sapMITBFilterHidden)").length, 2, "Only two tabs should be visible");

		// Clean-up
		oITH.destroy();
		oContainer.destroy();
	});

	QUnit.test("Tabs are correctly calculated in overflow with tabsOverflowMode=StartAndEnd", async function (assert) {
		// Arrange
		var oITH = createHeaderWithItemsSubItems(10, 1);
		oITH.setTabsOverflowMode(TabsOverflowMode.StartAndEnd);

		var oContainer = new VBox({
			width: "300px",
			items: oITH
		});

		// Act
		oContainer.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oITH._getOverflow().getText(), "+9", "Only main tabs should be calculated in overflow tab counter");

		// Clean-up
		oITH.destroy();
		oContainer.destroy();
	});

	QUnit.module("Tab properties", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Tabs with items aggregation and property enabled=false should not open their dropdown", async function (assert) {
		// Arrange
		var oITH = createHeaderWithItems(1);
		var oTab = oITH.getItems()[0];
		var sAriaLabelledbyText = Library1.getResourceBundleFor("sap.m").getText("ICONTABBAR_SUBITEMS_POPOVER_ACCESSIBLE_NAME");
		var sLabelId;

		oTab.addItem(new IconTabFilter({ text: "SAP" }));
		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// Act
		oTab._expandButtonPress();

		sLabelId = oTab._oPopover.getDomRef().getAttribute("aria-labelledby");

		// Assert
		assert.ok(oTab._oPopover, "Tab's own popover is initialized");
		assert.strictEqual(oTab._oPopover.isOpen(), true, "Tab's popover is open");
		assert.strictEqual(Element.getElementById(sLabelId).getDomRef().textContent, sAriaLabelledbyText, "The popover has the correct accessible name");


		oTab._closePopover();
		this.clock.tick(250);

		// Act
		oTab.setEnabled(false);
		oTab._expandButtonPress();
		this.clock.tick(250);

		// Assert
		assert.strictEqual(oTab._oPopover.isOpen(), false, "Tab's popover does not open");

		// Clean-up
		oITH.destroy();
	});

	QUnit.module("Properties");

	QUnit.test("ariaTexts", async function (assert) {
		var oITH = createHeaderWithItems(10);

		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		assert.notOk(oITH.$().attr("aria-label"), "'aria-label' attribute should NOT be set.");
		assert.notOk(oITH.$("head").attr("aria-describedby"), "'aria-describedby' attribute should NOT be set.");

		oITH.setAriaTexts({
			headerLabel: "Available spaces",
			headerDescription: "Select tab to show a space"
		});
		await nextUIUpdate();

		assert.strictEqual(oITH.$().attr("aria-label"), "Available spaces", "'aria-label' attribute should be set");
		assert.strictEqual(oITH.$("head").attr("aria-describedby"), oITH._getInvisibleHeadText().getId(), "'aria-describedby' attribute should be set.");


		// Clean-up
		oITH.destroy();
	});

	QUnit.test("interactionMode", async function (assert) {
		var oITH = createHeaderWithItemsSubItems(1, 0),
			oFirstTab = oITH.getItems()[0];

		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		assert.strictEqual(oFirstTab.getInteractionMode(), "Auto", "'interactionMode' property is with correct default value");
		assert.notOk(oFirstTab.getDomRef().classList.contains("sapMITHUnselectable"), "Tab is rendered with two click areas");

		oFirstTab.setInteractionMode("SelectLeavesOnly");
		await nextUIUpdate();
		assert.ok(oITH.getItems()[0].getDomRef().classList.contains("sapMITHUnselectable"), "Tab is rendered with one click area");

		oFirstTab.setInteractionMode("Select");
		await nextUIUpdate();
		assert.notOk(oITH.getItems()[0].getDomRef().classList.contains("sapMITHUnselectable"), "Tab is rendered with two click areas");

		// Clean-up
		oITH.destroy();
	});

	QUnit.test("interactionMode - no subitems", async function (assert) {
		var oITH = createHeaderWithItems(1, false),
			oFirstTab = oITH.getItems()[0];

		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		assert.ok(oITH._isSelectable(oFirstTab), "Tab is selectable");

		oFirstTab.setInteractionMode("SelectLeavesOnly");
		await nextUIUpdate();
		assert.ok(oITH._isSelectable(oFirstTab), "Tab is selectable");

		oFirstTab.setInteractionMode("Select");
		await nextUIUpdate();
		assert.ok(oITH._isSelectable(oFirstTab), "Tab is selectable");

		// Clean-up
		oITH.destroy();
	});


	QUnit.module("Badges - simple tabs", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
			this.oITH = new IconTabHeader({
				items: [
					new IconTabFilter({
						text: "Tab1",
						key: "tab1"
					})
				]
			});
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oITH.destroy();
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Badge is shown on tab with text and icon", async function (assert) {
		// Arrange
		this.oITH.setMode("Inline");
		var oTab = 	new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			icon: "sap-icon://attachment",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oTab);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oTab.$().find(".sapMBadgeIndicator").length, "Badge indicator is rendered");
	});

	QUnit.test("Badge is shown", async function (assert) {
		// Arrange
		var oTab = 	new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oTab);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.oITH.$().find(".sapMBadgeIndicator").length, "Badge indicator is rendered");
	});

	QUnit.test("Badge hiding after tab is selected", async function (assert) {
		// Arrange
		var oTab = 	new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oTab);
		await nextUIUpdate(this.clock);

		// Act
		this.oITH.setSelectedKey("tab2");
		this.clock.tick(4000);

		// Assert
		assert.notOk(oTab._isBadgeAttached, "Badge indicator is removed");
	});

	QUnit.test("Badge hiding timeout is properly handled", async function (assert) {
		// Arrange
		var oTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oTab);
		await nextUIUpdate(this.clock);

		// Act
		this.oITH.setSelectedKey("tab2");
		var iTimeoutId = oTab._iHideBadgeTimeout;

		// Assert
		assert.ok(iTimeoutId, "There is timeout");

		// Act
		this.oITH.setSelectedKey("tab2");

		assert.strictEqual(oTab._iHideBadgeTimeout, iTimeoutId, "The timeout is the same as before");
	});

	QUnit.module("Badges - single click area tabs", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
			this.oITH = new IconTabHeader({
				selectedKey: "initiallySelected",
				items: [
					new IconTabFilter({
						key: "initiallySelected"
					})
				]
			});
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oITH.destroy();
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Badge is shown on the root tab when a nested tab has badge", async function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			items: [
				new IconTabFilter({
					text: "Nested",
					key: "Nested",
					customData: [
						new BadgeCustomData()
					]
				})
			]
		});
		this.oITH.addItem(oRootTab);
		await nextUIUpdate(this.clock);

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator");

		// Assert
		assert.ok($badgeIndicator.length, "Badge is rendered on the root tab");
		assert.strictEqual($badgeIndicator.attr("aria-label"), oRB.getText("ICONTABFILTER_SUB_ITEMS_BADGES"), "'aria-label' is correct");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");
	});

	QUnit.test("Badge is removed from the root tab", async function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oRootTab);
		await nextUIUpdate(this.clock);

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");

		QUnitUtils.triggerKeydown(oRootTab.$(), KeyCodes.ENTER);

		this.clock.tick(4000);

		// Assert
		assert.notOk(oRootTab._isBadgeAttached, "Badge is removed from the root tab");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === -1, "aria-labelledby doesn't contain the badge indicator id");
	});

	QUnit.test("Badge is removed from the root tab when it is removed from the nested tab", async function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			items: [
				new IconTabFilter({
					text: "Nested",
					key: "Nested",
					customData: [
						new BadgeCustomData()
					]
				})
			]
		});
		this.oITH.addItem(oRootTab);
		await nextUIUpdate(this.clock);

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator");

		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");

		oRootTab._expandButtonPress();
		var oFakeEvent = {
			srcControl: oRootTab._getSelectList().getItems()[0],
			preventDefault: function () {}
		};

		// Act
		oRootTab._getSelectList().ontap(oFakeEvent);
		this.clock.tick(4000);

		// Assert
		assert.notOk(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is removed from the root tab");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === -1, "aria-labelledby doesn't contain the badge indicator id");
	});

	QUnit.test("Badge is NOT removed from the root tab when there are more tabs inside it with badges", async function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			items: [
				new IconTabFilter({
					text: "Nested1",
					key: "Nested2",
					customData: [
						new BadgeCustomData()
					]
				}),
				new IconTabFilter({
					text: "Nested2",
					key: "Nested1",
					customData: [
						new BadgeCustomData()
					]
				})
			]
		});
		this.oITH.addItem(oRootTab);
		await nextUIUpdate(this.clock);
		oRootTab._expandButtonPress();
		var oFakeEvent = {
			srcControl: oRootTab._getSelectList().getItems()[0],
			preventDefault: function () {}
		};

		// Act
		oRootTab._getSelectList().ontap(oFakeEvent);
		this.clock.tick(4000);

		// Assert
		assert.ok(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is NOT removed from the root tab");
	});

	QUnit.test("Badge is removed from the cloned item in the select list", async function (assert) {
		// Arrange
		this.clock.restore();
		const done = assert.async();
		const BADGE_ANIMATION_DURATION = 3000;
		var oNestedItem  = new IconTabFilter({
				text: "Nested",
				key: "Nested",
				customData: [
					new BadgeCustomData()
				]
			}),
			oRootTab = new IconTabFilter({
				text: "Tab2",
				key: "tab2",
				items: [oNestedItem]
			});

		this.oITH.placeAt("qunit-fixture");
		this.oITH.addItem(oRootTab);
		await nextUIUpdate(this.clock);
		oRootTab._expandButtonPress();

		oRootTab._oPopover.attachEventOnce("afterOpen", () => {
			oRootTab._oPopover.attachEventOnce("afterClose", () => {
				oRootTab._expandButtonPress(); // open the list again while the badge is still there
				oRootTab._oPopover.attachEventOnce("afterOpen", () => {
					// Assert
					assert.ok(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is shown on the root tab");
					assert.ok(oNestedItem._oCloneInList._isBadgeAttached, "Badge is shown on the item in the SelectList");

					// Wait for the badge hiding animation to complete
					setTimeout(() => {
						// Assert
						assert.notOk(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is removed from the root tab");
						assert.strictEqual(oNestedItem._oCloneInList, null, "Badge is removed from the item in the SelectList");

						done();
					}, BADGE_ANIMATION_DURATION);
				});
			});

			var oFakeEvent = {
				srcControl: oNestedItem,
				preventDefault: function () {}
			};

			// Act
			oRootTab._getSelectList().ontap(oFakeEvent);
		});

	});

	QUnit.module("Badges - double click area tabs", {
		beforeEach: async function () {
			this.oITH = new IconTabHeader({
				items: [
					new IconTabFilter({
						text: "Tab1",
						key: "tab1"
					})
				]
			});
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is shown on the root tab and the expand button", async function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			],
			items: [
				new IconTabFilter({
					text: "Nested",
					key: "Nested",
					customData: [
						new BadgeCustomData()
					]
				})
			],
			content: [
				new Text()
			]
		});
		this.oITH.addItem(oRootTab);
		await nextUIUpdate();

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator");

		// Assert
		assert.strictEqual($badgeIndicator.length, 2, "There are 2 badges rendered");
	});

	QUnit.test("aria-label of the 2 badges", async function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			],
			items: [
				new IconTabFilter({
					text: "Nested",
					key: "Nested",
					customData: [
						new BadgeCustomData()
					]
				})
			],
			content: [
				new Text()
			]
		});
		this.oITH.addItem(oRootTab);
		await nextUIUpdate();

		var $badgeIndicator1 = oRootTab.$().find(".sapMBadgeIndicator").eq(0),
			$badgeIndicator2 = oRootTab.$().find(".sapMBadgeIndicator").eq(1);

		// Assert
		assert.strictEqual($badgeIndicator1.attr("aria-label"), oRB.getText("ICONTABFILTER_BADGE"), "'aria-label' is correct");
		assert.strictEqual($badgeIndicator2.attr("aria-label"), oRB.getText("ICONTABFILTER_SUB_ITEMS_BADGES"), "'aria-label' is correct");
	});

	QUnit.test("There is badge on the root when a nested tab with badge is selected from the overflow", async function (assert) {
		// Arrange
		fillWithItems(this.oITH, 100);

		var oNestedItem = new IconTabFilter({
				text: "Nested11",
				key: "Nested11"
			}),
			oRootTab = new IconTabFilter({
				text: "Tab2",
				key: "tab2",
				content: [
					new Text()
				],
				items: [
					new IconTabFilter({
						text: "Nested1",
						key: "Nested1",
						items: [
							oNestedItem
						]
					})
				]
			});
		this.oITH.addItem(oRootTab);
		await nextUIUpdate();

		// Act
		oNestedItem.addCustomData(new BadgeCustomData());
		this.oITH._getOverflow()._expandButtonPress();
		var oItems = this.oITH._getOverflow()._getSelectList().getItems();
		var oFakeEvent = {
			srcControl: oItems[oItems.length - 1],
			preventDefault: function () {}
		};
		this.oITH._getOverflow()._getSelectList().ontap(oFakeEvent);
		await nextUIUpdate();

		// Assert
		assert.ok(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is added to the expand button");

		var sAriaLabelledbyText = Library1.getResourceBundleFor("sap.m").getText("ICONTABBAR_OVERFLOW_POPOVER_ACCESSIBLE_NAME");
		var sLabelId = document.getElementsByClassName("sapMITBFilterPopover")[0].getAttribute("aria-labelledby");
		assert.strictEqual(Element.getElementById(sLabelId).getDomRef().textContent, sAriaLabelledbyText, "The popover has the correct accessible name");

	});

	QUnit.module("Badges - overflow menu (More button)", {
		beforeEach: async function () {
			this.iSize = 100;
			this.oITH = createHeaderWithItems(this.iSize);
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is shown on the overflow tab when there are tabs with badges in it", async function (assert) {
		// Arrange
		this.oITH.getItems()[this.iSize - 1].addCustomData(new BadgeCustomData());
		await nextUIUpdate();

		// Assert
		assert.ok(this.oITH._getOverflow().getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is rendered on the overflow tab");
	});

	QUnit.test("Badge is removed from the overflow tab when there are no more tabs with badges in it", async function (assert) {
		// Arrange
		this.oITH.getItems()[this.iSize - 1].addCustomData(new BadgeCustomData());

		await nextUIUpdate();

		// Act
		this.oITH._getOverflow()._expandButtonPress();
		var oItems = this.oITH._getOverflow()._getSelectList().getItems();
		var oFakeEvent = {
			srcControl: oItems[oItems.length - 1],
			preventDefault: function () {}
		};
		this.oITH._getOverflow()._getSelectList().ontap(oFakeEvent);

		// Assert
		assert.notOk(this.oITH._getOverflow()._isBadgeAttached, "Badge is removed from the root tab");
	});

	QUnit.module("Badges - dynamically added", {
		beforeEach: async function () {
			this.oITH = new IconTabHeader({
				items: [
					new IconTabFilter({
						text: "Tab1",
						id: "tab1",
						items: [
							new IconTabFilter({
								text: "Tab11",
								id: "tab11"
							}),
							new IconTabFilter({
								text: "Tab12",
								id: "tab12"
							})
						]
					}),
					new IconTabFilter({
						text: "Tab2",
						id: "tab2"
					})
				]
			});

			for (var i = 0; i < 100; i++) {
				this.oITH.addItem(new IconTabFilter({text: 'additional tab ' + i}));
			}

			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is added on a root tab", async function (assert) {
		// Arrange
		var oRootTab = this.oITH.getItems()[0],
			oInvisibleMessageInstance = InvisibleMessage.getInstance();

		oRootTab.addCustomData(new BadgeCustomData());
		await nextUIUpdate();

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator"),
			oInvisibleMsgDomRef = document.getElementById(oInvisibleMessageInstance.getId() + "-assertive");

		// Assert
		assert.ok($badgeIndicator.length, "Badge is rendered on the root tab");
		assert.strictEqual($badgeIndicator.attr("aria-label"), oRB.getText("ICONTABFILTER_BADGE"),"'aria-label' is correct");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");
		assert.strictEqual(oInvisibleMsgDomRef.textContent, oRB.getText("ICONTABFILTER_BADGE_MSG", [oRootTab.getText()]), "badge is announced");
	});

	QUnit.test("Badge is added on a child tab", async function (assert) {
		// Arrange
		var oRootTab = this.oITH.getItems()[0],
			oChildTab = oRootTab.getItems()[0],
			oInvisibleMessageInstance = InvisibleMessage.getInstance();

		oChildTab.addCustomData(new BadgeCustomData());
		await nextUIUpdate();

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator"),
			oInvisibleMsgDomRef = document.getElementById(oInvisibleMessageInstance.getId() + "-assertive");

		// Assert
		assert.ok($badgeIndicator.length, "Badge is rendered on the root tab");
		assert.strictEqual($badgeIndicator.attr("aria-label"), oRB.getText("ICONTABFILTER_SUB_ITEMS_BADGES"),"'aria-label' is correct");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");
		assert.strictEqual(oInvisibleMsgDomRef.textContent, oRB.getText("ICONTABFILTER_SUB_ITEM_BADGE", [oChildTab.getText(), oRootTab.getText()]), "badge is announced");
	});

	QUnit.test("Badge is added on an overflow tab", async function (assert) {
		// Arrange
		var oRootTab = this.oITH.getItems()[90],
			oOverflowTab = this.oITH._getOverflow(),
			oInvisibleMessageInstance = InvisibleMessage.getInstance();

		oRootTab.addCustomData(new BadgeCustomData());
		await nextUIUpdate();

		var $badgeIndicator = oOverflowTab.$().find(".sapMBadgeIndicator"),
			oInvisibleMsgDomRef = document.getElementById(oInvisibleMessageInstance.getId() + "-assertive");

		// Assert
		assert.ok($badgeIndicator.length, "Badge is rendered on the root tab");
		assert.strictEqual($badgeIndicator.attr("aria-label"), oRB.getText("ICONTABFILTER_SUB_ITEMS_BADGES"),"'aria-label' is correct");
		assert.ok(oOverflowTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");
		assert.strictEqual(oInvisibleMsgDomRef.textContent, oRB.getText("ICONTABFILTER_SUB_ITEM_BADGE", [oRootTab.getText(), oOverflowTab.getText()]), "badge is announced");
	});

	QUnit.module("Badges and selectedKey", {
		beforeEach: async function () {
			this.oITH = new IconTabHeader();
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is removed from initially selected tab", async function (assert) {
		// Arrange
		var oSelectedTab = new IconTabFilter({
			text: "Tab",
			key: "tab",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oSelectedTab);
		this.oITH.setSelectedKey("tab");
		await nextUIUpdate();

		// Assert
		assert.notOk(oSelectedTab._isBadgeAttached, "The badge is removed from initially selected tab");
	});

	QUnit.module("Filters CustomData", {
		beforeEach: async function () {
			this.oITH = new IconTabHeader();

			// Arrange
			fillWithItems(this.oITH, 100);

			var oRootTab = new IconTabFilter({
				text: "Tab2",
				key: "tab2",
				customData: new CustomData({
					key: "a",
					value: "b",
					writeToDom: true
				})
			});
			this.oITH.addItem(oRootTab);
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("CustomData is cloned to the overflow item", function (assert) {
		var oOverflowTab = this.oITH._getOverflow();

		QUnitUtils.triggerKeydown(oOverflowTab.$(), KeyCodes.ENTER);

		assert.strictEqual(oOverflowTab._oPopover.$().find("li[data-a]").attr('data-a'), "b", "custom data attribute is correctly cloned");

		oOverflowTab._closePopover();
	});

	QUnit.module("Tabs Overflow Mode", {
		beforeEach: async function () {
			this.oITH = new IconTabHeader({
				tabsOverflowMode: TabsOverflowMode.StartAndEnd
			}).addStyleClass("sapUiResponsiveContentPadding");

			this.oScrollContainer = new ScrollContainer({
				width: "380px",
				content: this.oITH
			});

			// make sure the padding won't change depending on window width
			this.oScrollContainer.addStyleClass("sapFDynamicPage-Std-Tablet");

			// Arrange
			fillWithItems(this.oITH, 100);

			this.oScrollContainer.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oScrollContainer.destroy();
		}
	});

	QUnit.test("Tabs go in the startOverflow", async function (assert) {

		var oTargetTab = this.oITH.getItems()[0];

		// Assert
		var aVisibleTabs = this.oITH.$().find(".sapMITBItem:not(.sapMITBFilterHidden)").toArray();
		assert.notStrictEqual(aVisibleTabs.indexOf(oTargetTab.getDomRef()), -1, "The target tab is in the tab strip");
		assert.notStrictEqual(this.oITH._getItemsInStrip().indexOf(oTargetTab), -1, "The target tab is in the tab strip");
		assert.strictEqual(oTargetTab._isInStartOverflow(), false, "The target tab is not in the startOverflow");

		// Act
		this.oITH.setSelectedKey("50");
		await nextUIUpdate();

		// Assert
		aVisibleTabs = this.oITH.$().find(".sapMITBItem:not(.sapMITBFilterHidden)").toArray();
		assert.strictEqual(aVisibleTabs.indexOf(oTargetTab.getDomRef()), -1, "The target tab is not in the tab strip");
		assert.strictEqual(this.oITH._getItemsInStrip().indexOf(oTargetTab), -1, "The target tab is not in the tab strip");
		assert.strictEqual(oTargetTab._isInStartOverflow(), true, "The target tab is in the startOverflow");

	});

	QUnit.test("Both overflows show how many tabs they hold", async function (assert) {
		// Arrange
		this.oITH.setSelectedKey("50");
		await nextUIUpdate();

		var aItems = this.oITH.getItems(),
			aVisibleTabs = this.oITH._getItemsInStrip(),
			oFirstVisibleTab = aVisibleTabs[0],
			oLastVisibleTab = aVisibleTabs[aVisibleTabs.length - 1];

		var iOverflownTabsInStartOverflow = aItems.slice(0, aItems.indexOf(oFirstVisibleTab)).length,
			iOverflownTabsInEndOverflow = aItems.slice(aItems.indexOf(oLastVisibleTab) + 1).length;

		var oStartOverflowText = this.oITH._getStartOverflow().getText(),
			oEndOverflowText = this.oITH._getOverflow().getText();

		// Assert
		assert.strictEqual("+" + iOverflownTabsInStartOverflow, oStartOverflowText, "start overflow has correct tab count: " + iOverflownTabsInStartOverflow);
		assert.strictEqual("+" + iOverflownTabsInEndOverflow, oEndOverflowText, "end overflow has correct tab count: " + iOverflownTabsInEndOverflow);
	});

	QUnit.test("Start overflow button is visible when fifth item is selected", async function (assert) {
		// Arrange
		const oSetItemsForStripSpy = this.spy(this.oITH, "_setItemsForStrip");
		this.oITH.setSelectedKey("4");
		await headerThemeApplied(this.oITH);
		await nextUIUpdate();

		assert.ok(oSetItemsForStripSpy.called, "_setItemsForStrip should be called");
		assert.ok(this.oITH._getStartOverflow().$().hasClass("sapMITHOverflowVisible"), "start overflow button is visible");
		assert.strictEqual(this.oITH._getStartOverflow().getText(), "+3", "start overflow button text is correct");
	});

	QUnit.test("End overflow button is visible when the before last item is selected", async function (assert) {
		// Arrange
		this.oITH.setSelectedKey("98");
		this.oScrollContainer.setWidth("220px");
		await nextUIUpdate();

		assert.ok(this.oITH._getOverflow().$().hasClass("sapMITHOverflowVisible"), "end overflow button is visible");
		assert.strictEqual(this.oITH._getOverflow().getText(), "+1", "end overflow button text is correct");
	});

	QUnit.test("End overflow '+N' shows only the remainder on phone (StartAndEnd)", async function (assert) {
		// Arrange
		const oDeviceStub = sinon.stub(Device, "system").value({ phone: true, tablet: false, combi: false, desktop: false });

		// Act
		this.oITH.setSelectedKey("50");
		await nextUIUpdate();

		const aItems = this.oITH.getItems(),
			aVisibleTabs = this.oITH._getItemsInStrip(),
			oFirstVisibleTab = aVisibleTabs[0],
			oLastVisibleTab = aVisibleTabs[aVisibleTabs.length - 1];

		const iExpectedStart = aItems.slice(0, aItems.indexOf(oFirstVisibleTab)).length;
		const iExpectedEnd = aItems.slice(aItems.indexOf(oLastVisibleTab) + 1).length;

		// Assert
		assert.strictEqual(this.oITH._getStartOverflow().getText(), "+" + iExpectedStart,
			"start overflow text reflects only hidden tabs");
		assert.strictEqual(this.oITH._getOverflow().getText(), "+" + iExpectedEnd,
			"end overflow text reflects only hidden tabs");

		// Clean-up
		oDeviceStub.restore();
	});

	QUnit.test("End overflow popover still lists all items on phone (StartAndEnd)", async function (assert) {
		// Arrange
		const oDeviceStub = sinon.stub(Device, "system").value({ phone: true, tablet: false, combi: false, desktop: false });

		this.oITH.setSelectedKey("50");
		await nextUIUpdate();

		// Act
		const aItemsInEndSlice = this.oITH._getItemsForOverflow(false, false, false);
		const aItemsInStrip = this.oITH._getItemsInStrip();

		// Assert
		const bAllStripItemsIncluded = aItemsInStrip.every(function (oItem) {
			return aItemsInEndSlice.indexOf(oItem) !== -1;
		});
		assert.ok(bAllStripItemsIncluded, "all currently-visible tabs are still part of the popover input on phone");

		// Clean-up
		oDeviceStub.restore();
	});

	QUnit.test("_getItemsForOverflow honors bExcludeStripItems regardless of device", async function (assert) {
		// Arrange
		const oDeviceStub = sinon.stub(Device, "system").value({ phone: true, tablet: false, combi: false, desktop: false });

		this.oITH.setSelectedKey("50");
		await nextUIUpdate();

		// Act
		const aItemsInStrip = this.oITH._getItemsInStrip();
		const aStrictItems = this.oITH._getItemsForOverflow(false, true, true);

		// Assert
		const bAnyStripLeak = aStrictItems.some(function (oItem) {
			return aItemsInStrip.indexOf(oItem) !== -1;
		});
		assert.notOk(bAnyStripLeak, "strict mode excludes all strip items even on phone");

		// Clean-up
		oDeviceStub.restore();
	});

	QUnit.test("Start overflow popover still lists all items on phone (StartAndEnd)", async function (assert) {
		// Arrange
		const oDeviceStub = sinon.stub(Device, "system").value({ phone: true, tablet: false, combi: false, desktop: false });

		this.oITH.setSelectedKey("50");
		await nextUIUpdate();

		// Act
		const aItemsInStartSlice = this.oITH._getItemsForOverflow(true, false, false);
		const aItemsInStrip = this.oITH._getItemsInStrip();

		// Assert
		const bAllStripItemsIncluded = aItemsInStrip.every(function (oItem) {
			return aItemsInStartSlice.indexOf(oItem) !== -1;
		});
		assert.ok(bAllStripItemsIncluded, "all currently-visible tabs are still part of the start popover input on phone");

		// Clean-up
		oDeviceStub.restore();
	});

	QUnit.test("Start overflow '+N' shows only the remainder on phone (StartAndEnd)", async function (assert) {
		// Arrange
		const oDeviceStub = sinon.stub(Device, "system").value({ phone: true, tablet: false, combi: false, desktop: false });

		// Act
		this.oITH.setSelectedKey("50");
		await nextUIUpdate();

		const aItems = this.oITH.getItems(),
			aVisibleTabs = this.oITH._getItemsInStrip(),
			oFirstVisibleTab = aVisibleTabs[0];

		const iExpectedStart = aItems.slice(0, aItems.indexOf(oFirstVisibleTab)).length;

		// Assert
		assert.strictEqual(this.oITH._getStartOverflow().getText(), "+" + iExpectedStart,
			"start overflow text reflects only hidden tabs on phone");

		// Clean-up
		oDeviceStub.restore();
	});

	QUnit.module("Badges - Start overflow", {
		beforeEach: async function () {
			this.oITH = new IconTabHeader({
				tabsOverflowMode: TabsOverflowMode.StartAndEnd
			});

			// Arrange
			fillWithItems(this.oITH, 100);

			this.oITH.placeAt(DOM_RENDER_LOCATION);

			this.oITH.setSelectedKey("50");
			await nextUIUpdate();

			this.oITH.getItems()[1].addCustomData(new BadgeCustomData());
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is shown on the start overflow tab when there are tabs with badges in it", function (assert) {

		// Assert
		assert.ok(this.oITH._getStartOverflow().getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is rendered on the start overflow tab");
	});

	QUnit.test("Badge is removed from the start overflow tab when there are no more tabs with badges in it", function (assert) {

		// Act
		this.oITH._getStartOverflow()._expandButtonPress();
		var oItems = this.oITH._getStartOverflow()._getSelectList().getItems();
		var oFakeEvent = {
			srcControl: oItems[1],
			preventDefault: function () {}
		};
		this.oITH._getStartOverflow()._getSelectList().ontap(oFakeEvent);

		// Assert
		assert.notOk(this.oITH._getOverflow()._isBadgeAttached, "Badge is removed from the start overflow tab");
	});

	QUnit.module("Separator", {

		beforeEach: async function () {
			this.oITH = createHeaderWithItems(40, true);
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Separator goes to the overflow", async function (assert) {

		this.oITH.$().width("400px");
		await nextUIUpdate();

		var aItems = this.oITH.getItems(),
			oLastVisibleItem = aItems[6],
			oLastVisibleSeparator = aItems[5];

		// Assert
		assert.notOk(oLastVisibleItem.$().hasClass("sapMITBFilterHidden"), "the last item is visible");
		assert.notOk(oLastVisibleSeparator.$().hasClass("sapMITBFilterHidden"), "the last item separator is visible");

		// Act
		this.oITH.setSelectedKey("10");
		await nextUIUpdate();

		// Assert
		assert.ok(oLastVisibleItem.$().hasClass("sapMITBFilterHidden"), "the last item is not visible");
		assert.ok(oLastVisibleSeparator.$().hasClass("sapMITBFilterHidden"), "the last item separator is not visible");
	});

	QUnit.module("Accessibility", {
		beforeEach: async function () {
			this.oITH = new IconTabHeader();
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Count in aria-labelledby in default and inline mode", async function (assert) {
		// Arrange
		var oITH = this.oITH,
			oFilter = new IconTabFilter({
				text: "Tab 1",
				key: "tab1",
				count: "33"
			}),
			sAriaLabelledBy,
			sCountElementId = oFilter.getId() + "-count";

		oITH.addItem(oFilter);
		await nextUIUpdate();

		sAriaLabelledBy = oFilter.getDomRef().getAttribute("aria-labelledby");

		// Assert
		assert.ok(sAriaLabelledBy.indexOf(sCountElementId) !== -1, "Count is part of aria-labelledby in default mode.");

		// Act
		oITH.setMode(IconTabHeaderMode.Inline);
		await nextUIUpdate();

		sAriaLabelledBy = oFilter.getDomRef().getAttribute("aria-labelledby");

		// Assert
		assert.ok(sAriaLabelledBy.indexOf(sCountElementId) === -1, "Count is not part of aria-labelledby in inline mode.");
	});

	QUnit.module("Events", {
		beforeEach: async function () {
			this.oITH = new IconTabHeader();
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("select", async function(assert) {
		// Arrange
		this.oITH.addItem(
			new IconTabFilter({
				icon: "sap-icon://instance",
				key: "key1"
			})
		).addItem(
			new IconTabFilter({
				icon: "sap-icon://instance",
				key: "key2"
			})
		);

		var oSelectSpy = sinon.spy(this.oITH, "fireSelect");
		await nextUIUpdate();

		// Press SPACE key on second IconTabFilter to expand
		QUnitUtils.triggerKeyup(this.oITH.getItems()[1].$(), KeyCodes.SPACE);

		// Assert
		assert.strictEqual(oSelectSpy.lastCall.args[0].key, "key2", "second filter key is passed as select event arg");
		assert.strictEqual(oSelectSpy.lastCall.args[0].previousKey, "key1", "first filter key is passed as previousKey select event arg");
	});

	QUnit.test("Right Click", async function (assert) {
		// Arrange
		this.oITH.addItem(
			new IconTabFilter({
				icon: "sap-icon://instance",
				key: "key1"
			})
		).addItem(
			new IconTabFilter({
				icon: "sap-icon://instance",
				key: "key2"
			})
		);
		this.oITH.setSelectedKey("key1");
		await nextUIUpdate();

		// Act
		var oMockEvent = {
			which: 3,
			target: this.oITH.getAggregation("items")[1].$(),
			targetTouches: {
				0: {
					identifier: 0,
					target: this.oITH.getAggregation("items")[1].$()
				},
				length: 1
			}
		};

		this.oITH.ontouchstart(oMockEvent);
		await nextUIUpdate();

		var iActiveTouch = this.oITH._iActiveTouch;

		// Assert
		assert.strictEqual(iActiveTouch, undefined, "Active touch is not defined when using right click");
	});

	QUnit.module("Focusing");

	QUnit.test("Focused index on focus leave", async function(assert) {
		var oITH = new IconTabHeader({
			items: [
				new IconTabFilter({
					text: "Tab1",
					key: "tab1"
				}),
				new IconTabFilter({
					text: "Tab2",
					key: "tab2",
					visible: false
				}),
				new IconTabFilter({
					text: "Tab3",
					key: "tab3"
				}),
				new IconTabFilter({
					text: "Tab4",
					key: "tab4"
				}),
				new IconTabFilter({
					text: "Tab5",
					key: "tab5"
				})
			]
		});
		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		oITH.setSelectedKey("tab4");
		await nextUIUpdate();

		oITH._onItemNavigationFocusLeave();

		// Assert
		assert.strictEqual(oITH._oItemNavigation.getFocusedIndex(), 2, "focused index is correct");

		oITH.destroy();
	});

	QUnit.test("Focus moves to selected tab when selectedKey is updated after rendering", async function(assert) {
		this.clock = sinon.useFakeTimers();

		var oITH = new IconTabHeader({
			items: [
				new IconTabFilter({ text: "Tab1", key: "tab1" }),
				new IconTabFilter({ text: "Tab2", key: "tab2" }),
				new IconTabFilter({ text: "Tab3", key: "tab3" }),
				new IconTabFilter({ text: "Tab4", key: "tab4" })
			]
		});
		oITH.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		this.clock.tick(1000);

		var fnSpy = this.spy(oITH, "_initItemNavigation");

		oITH.setSelectedKey("tab4");
		await nextUIUpdate(this.clock);

		assert.ok(fnSpy.calledOnce, "_initItemNavigation was called");

		oITH.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("Focused index on focus leave when StartAndEnd overflow", async function(assert) {
		var oITH = new IconTabHeader({
			tabsOverflowMode: TabsOverflowMode.StartAndEnd,
			items: [
				new IconTabFilter({
					text: "Tab1",
					key: "tab1"
				}),
				new IconTabFilter({
					text: "Tab2",
					key: "tab2"
				}),
				new IconTabFilter({
					text: "Tab3",
					key: "tab3"
				}),
				new IconTabFilter({
					text: "Tab4",
					key: "tab4"
				}),
				new IconTabFilter({
					text: "Tab5",
					key: "tab5"
				}),
				new IconTabFilter({
					text: "Tab6",
					key: "tab6",
					items: [
						new IconTabFilter({
							text: "Tab61",
							key: "tab61"
						}),
						new IconTabFilter({
							text: "Tab62",
							key: "tab62"
						})
					]
				}),
				new IconTabFilter({
					text: "Tab7",
					key: "tab7"
				})
			]
		});

		var oScrollContainer = new ScrollContainer({
			width: "400px",
			content: oITH
		});

		oScrollContainer.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		oITH.setSelectedKey("tab5");
		await nextUIUpdate();

		oITH._onItemNavigationFocusLeave();

		// Assert
		assert.strictEqual(oITH._oItemNavigation.getFocusedIndex(), 5, "focused index is correct");

		oITH.setSelectedKey("tab62");
		await nextUIUpdate();

		oITH._onItemNavigationFocusLeave();

		// Assert
		assert.strictEqual(oITH._oItemNavigation.getFocusedIndex(), 6, "focused index is correct");

		oScrollContainer.destroy();
	});

	QUnit.test("Overflow button remains focusable after switching from start to end", async function(assert) {
		const oITH = new IconTabHeader({
			tabsOverflowMode: TabsOverflowMode.StartAndEnd,
			items: [
				new IconTabFilter({ text: "Section1", key: "section1" }),
				new IconTabFilter({ text: "Section2", key: "section2" }),
				new IconTabFilter({ text: "Section3", key: "section3" }),
				new IconTabFilter({ text: "Section4", key: "section4" }),
				new IconTabFilter({ text: "Section5", key: "section5" }),
				new IconTabFilter({ text: "Section6", key: "section6" }),
				new IconTabFilter({ text: "Section7", key: "section7" }),
				new IconTabFilter({ text: "Section8", key: "section8" }),
				new IconTabFilter({ text: "Section9", key: "section9" }),
				new IconTabFilter({ text: "Section10", key: "section10" })
			]
		});

		const oScrollContainer = new ScrollContainer({
			width: "400px",
			content: oITH
		});

		oScrollContainer.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const oLastTab = oITH.getItems()[9];
		oITH.setSelectedItem(oLastTab);
		await nextUIUpdate();

		assert.ok(oITH._getStartOverflow().$().hasClass("sapMITHOverflowVisible"), "start overflow button (+X on left) is visible after selecting last section");
		assert.notOk(oITH._getOverflow().$().hasClass("sapMITHOverflowVisible"), "end overflow button is hidden");

		oITH.setSelectedKey("section2");

		assert.notOk(oITH._getStartOverflow().$().hasClass("sapMITHOverflowVisible"), "start overflow button is now hidden");
		assert.ok(oITH._getOverflow().$().hasClass("sapMITHOverflowVisible"), "end overflow button (+X on right) is now visible");

		const oEndOverflowDomRef = oITH._getOverflow().getFocusDomRef();
		const aItemDomRefs = oITH._oItemNavigation.getItemDomRefs();

		const iLastIndex = aItemDomRefs.length - 1;
		const oLastItemDomRef = aItemDomRefs[iLastIndex];
		assert.strictEqual(oLastItemDomRef, oEndOverflowDomRef, "end overflow button is the last item in ItemNavigation (reachable via right arrow key)");

		oITH.getItems()[2].getDomRef().focus();
		assert.strictEqual(document.activeElement, oITH.getItems()[2].getDomRef(), "first tab is focused");

		QUnitUtils.triggerKeydown(document.activeElement, KeyCodes.ARROW_RIGHT);
		await nextUIUpdate();

		assert.strictEqual(document.activeElement, oEndOverflowDomRef, "end overflow button receives focus when navigating with arrow keys");

		oScrollContainer.destroy();
	});
});