/*global beforeAll,describe,it,element,by,takeScreenshot,expect,browser,sap_ui_Device:true */

describe("sap.m.MessagePopover", function () {
	"use strict";

	beforeAll(function() {
		browser.executeScript(function() {
			return new Promise(function(resolve) {
				sap.ui.require([
					"sap/ui/Device"
				], function(Device) {
					sap_ui_Device = Device;
					resolve();
				});
			});
		});
	});

	var bPhone = null;
	var _resolvePopover = function () {
			return bPhone ? "mPopover-messagePopover-dialog" : "mPopover-messagePopover-popover";
		},
		_resolvePopoverWithGrouping = function () {
			return bPhone ? "mPopoverWithGrouping-messagePopover-dialog" : "mPopoverWithGrouping-messagePopover-popover";
		};

	it("should load test page", function () {
		browser.executeScript(function () {
			return sap_ui_Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});

		// Now the focus will always remain initially over the button. Also, we add custom CSS to ensure that, if we decide
		// to add tests where messageitems are added, the problem with the cursor will not exist.
		element(by.id("customCssButton")).click();
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("should open MessagePopover", function () {
		element(by.id("mPopoverButton")).click();
		expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("mpopover");

		// close
		element(by.id("mPopoverButton")).click();
	});

	it("toggles MessagePopover", function () {
		// open
		element(by.id("mPopoverButton")).click();

		// close
		element(by.id("mPopoverButton")).click();

		// open again
		element(by.id("mPopoverButton")).click();

		expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("toggled-mpopover");
	});

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
		it("should open " + sMessageType + " messages.", function () {
			element(by.id("mPopover-messageView-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("mpopover-" + sMessageType);
		});
	});

	it("should open MessagePopover with groupItems set to true", function () {
		element(by.css(".sapMMsgPopoverCloseBtn")).click(); //Close the Popover/Dialog
		element(by.id("mPopoverWithGroupingButton")).click();
		expect(takeScreenshot(element(by.id(_resolvePopoverWithGrouping())))).toLookAs("mpopover-grouping");
	});

	it("should open error messages.", function () {
		element(by.id("mPopoverWithGrouping-messageView-error")).click();
		expect(takeScreenshot(element(by.id(_resolvePopoverWithGrouping())))).toLookAs("mpopover-grouping-error");
	});

	it("should open MessagePopover in compact mode", function () {
		element(by.css('#' + _resolvePopoverWithGrouping() + ' .sapMMsgPopoverCloseBtn')).click(); //Close the Popover/Dialog
		element(by.id("compactMode")).click();
		element(by.id("mPopoverButton")).click();
		expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("mpopover-compact");
	});

	["error", "warning", "success", "information", "all"].forEach(function (sMessageType) {
		it("should open " + sMessageType + " messages in MessagePopover in compact mode.", function () {
			element(by.id("mPopover-messageView-" + sMessageType)).click();
			expect(takeScreenshot(element(by.id(_resolvePopover())))).toLookAs("mpopover-compact-" + sMessageType);
		});
	});

	it("should open MessagePopover with grouping in compact mode", function () {
		element(by.css(".sapMMsgPopoverCloseBtn")).click(); //Close the Popover/Dialog
		element(by.id("mPopoverWithGroupingButton")).click();
		element(by.id("mPopoverWithGrouping-messageView-all")).click();
		expect(takeScreenshot(element(by.id(_resolvePopoverWithGrouping())))).toLookAs("mpopover-grouping-compact");
		element(by.css('#' + _resolvePopoverWithGrouping() + ' .sapMMsgPopoverCloseBtn')).click(); //Close the Popover/Dialog
	});
});