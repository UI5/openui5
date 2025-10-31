/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./PDFViewerTestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewerRenderer",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (jQuery, TestUtils, JSONModel, PDFViewerRenderer, library, Device, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.PDFViewerDisplayType
	var PDFViewerDisplayType = library.PDFViewerDisplayType;

	var oPdfViewer = null;

	QUnit.module('Embedded mode', {
		afterEach: function (assert) {
			if ( oPdfViewer ) {
				oPdfViewer.destroy();
			}
		}
	});

	function createMockEvent(iEmbedCount, bCanAccessChildren, bIsChildrenPresent) {
		var aEmbedsArray = new Array(iEmbedCount).fill({});
		var bodyObj = {};
		if (bIsChildrenPresent !== false) {
			bodyObj.children = bCanAccessChildren ? [{}] : undefined;
		}
		var oMockContentWindow = {
			document: {
				embeds: aEmbedsArray,
				body: bodyObj
			}
		};
		return {
			target: {
				contentWindow: oMockContentWindow
			}
		};
	}

	QUnit.test("Fire loaded event when PDF plugin enabled and one embed present", function(assert) {
		oPdfViewer = TestUtils.createPdfViewer({});
		var bLoadedCalled = false;
		var bErrorCalled = false;

		// Mock PDFViewerRenderer._isPdfPluginEnabled
		PDFViewerRenderer._isPdfPluginEnabled = function() { return true; };
		oPdfViewer._fireLoadedEvent = function() { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function() { bErrorCalled = true; };
		var oEvent = createMockEvent(1, true);
		oPdfViewer._onLoadListener(oEvent);

		assert.ok(bLoadedCalled, "Loaded event should be fired");
		assert.notOk(bErrorCalled, "Error event should not be fired");
	});

	QUnit.test("Fire error event when PDF plugin enabled but no embed present", function(assert) {
		oPdfViewer = TestUtils.createPdfViewer({});
		var bLoadedCalled = false;
		var bErrorCalled = false;

		PDFViewerRenderer._isPdfPluginEnabled = function() { return true; };
		oPdfViewer._fireLoadedEvent = function() { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function() { bErrorCalled = true; };
		var oEvent = createMockEvent(0, true);
		oPdfViewer._onLoadListener(oEvent);

		assert.notOk(bLoadedCalled, "Loaded event should not be fired");
		assert.ok(bErrorCalled, "Error event should be fired");
	});

	QUnit.test("Fire error event when PDF plugin not enabled", function(assert) {
		oPdfViewer = TestUtils.createPdfViewer({});
		var bLoadedCalled = false;
		var bErrorCalled = false;

		PDFViewerRenderer._isPdfPluginEnabled = function() { return false; };
		oPdfViewer._fireLoadedEvent = function() { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function() { bErrorCalled = true; };
		var oEvent = createMockEvent(1, true);
		oPdfViewer._onLoadListener(oEvent);

		assert.notOk(bLoadedCalled, "Loaded event should not be fired");
		assert.ok(bErrorCalled, "Error event should be fired");

	});

	QUnit.test("Handle error when children cannot be accessed", function(assert) {
		oPdfViewer = TestUtils.createPdfViewer({});
		var bLoadedCalled = false;
		var bErrorCalled = false;

		PDFViewerRenderer._isPdfPluginEnabled = function() { return true; };
		oPdfViewer._fireLoadedEvent = function() { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function() { bErrorCalled = true; };
		var oEvent = createMockEvent(1, false);
		oPdfViewer._onLoadListener(oEvent);

		assert.ok(bLoadedCalled, "Loaded event should not be fired");
		assert.notOk(bErrorCalled, "Error event should be fired");
	});

	QUnit.test("Handle error when children is not present", function(assert) {
		oPdfViewer = TestUtils.createPdfViewer({});
		var bLoadedCalled = false;
		var bErrorCalled = false;

		PDFViewerRenderer._isPdfPluginEnabled = function() { return true; };
		oPdfViewer._fireLoadedEvent = function() { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function() { bErrorCalled = true; };
		var oEvent = createMockEvent(1, false, false);
		oPdfViewer._onLoadListener(oEvent);

		assert.ok(bLoadedCalled, "Loaded event should not be fired");
		assert.notOk(bErrorCalled, "Error event should be fired");
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled() || /HeadlessChrome/.test(window.navigator.userAgent)) {
		return;
	}

	QUnit.test("Toolbar is shown with download button", async function (assert) {
		assert.expect(5);
		var fnDone = assert.async();
		var sTitle = "My Title";

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var fnCheckControlStructure = function () {
			var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
			assert.ok(oOverflowToolbar.length === 1, "OverflowToolbar should be visible");

			var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
			assert.ok(oOverflowToolbarTitle.length === 1, "OverflowToolbar's title should be visible");
			// the selector may (when fe. overflow toolbar implementation changes) return multiple jquery objects
			assert.ok(oOverflowToolbarTitle.find(':contains("' + sTitle + '")').length > 0, 'OverFlowToolbar should contain title');

			var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
			assert.ok(oDownloadButton.length === 1, 'Download button should be visible');
		};

		var oOptions = {
			source: "{/source}",
			isTrustedSource: true,
			title: sTitle,
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				fnDone();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				fnDone();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		await TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Toolbar is shown even when title is filled and download button hidden", async function (assert) {
		assert.expect(5);
		var fnDone = assert.async();
		var sTitle = "My Title";

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var fnCheckControlStructure = function () {
			var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
			assert.ok(oOverflowToolbar.length === 1, "OverflowToolbar should be visible");

			var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
			assert.ok(oOverflowToolbarTitle.length === 1, "OverflowToolbar's title should be visible");
			// the selector may (when fe. overflow toolbar implementation changes) return multiple jquery objects
			assert.ok(oOverflowToolbarTitle.find(':contains("' + sTitle + '")').length > 0, "OverFlowToolbar should contain title");

			var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
			assert.ok(oDownloadButton.length === 0, 'Download button should be hidden');
		};

		var oOptions = {
			showDownloadButton: false,
			source: "{/source}",
			isTrustedSource: true,
			title: sTitle,
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				fnDone();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				fnDone();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		await TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Toolbar is hidden when title is empty and download button is hidden", async function (assert) {
		assert.expect(4);
		var fnDone = assert.async();

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var fnCheckControlStructure = function () {
			var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
			assert.ok(oOverflowToolbar.length === 0, "OverflowToolbar should be visible");

			var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
			assert.ok(oOverflowToolbarTitle.length === 0, "OverflowToolbar's title should be visible");

			var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
			assert.ok(oDownloadButton.length === 0, 'Download button should be hidden');
		};

		var oOptions = {
			showDownloadButton: false,
			isTrustedSource: true,
			source: "{/source}",
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				fnDone();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				fnDone();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		await TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Rendering with toolbar related changes", async function (assert) {
		assert.expect(9);
		var fnDone = assert.async();

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			showDownloadButton: false
		});

		var oOptions = {
			showDownloadButton: "{/showDownloadButton}",
			isTrustedSource: true,
			source: "{/source}",
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		await TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(2000)()
			.then(async function () {
				oModel.setData({showDownloadButton: true}, true);
				await TestUtils.triggerRerender();
			})
			.then(TestUtils.wait(2000))
			.then(function () {
				var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
				assert.ok(oOverflowToolbar.length === 1, "OverflowToolbar should be visible");

				var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
				assert.ok(oOverflowToolbarTitle.length === 1, "OverflowToolbar's title should be visible");

				var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
				assert.ok(oDownloadButton.length === 1, 'Download button should be visible');
			})
			.then(async function () {
				oModel.setData({showDownloadButton: false}, true);
				await TestUtils.triggerRerender();
			})
			.then(TestUtils.wait(2000))
			.then(function () {
				var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
				assert.ok(oOverflowToolbar.length === 0, "OverflowToolbar should be hidden");

				var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
				assert.ok(oOverflowToolbarTitle.length === 0, "OverflowToolbar's title should be hidden");

				var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
				assert.ok(oDownloadButton.length === 0, 'Download button should be hidden');
				fnDone();
			});
	});

	QUnit.test("DisplayTypes tests", async function (assert) {
		assert.expect(11);
		var fnDone = assert.async();
		var sTitle = "My Title";

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var fnIsContentDisplayed = function () {
			return jQuery(".sapMPDFViewerContent").length === 1 || jQuery(".sapMPDFViewerEmbeddedContent").length === 1;
		};

		var fnIsErrorContentDisplayed = function () {
			return jQuery(".sapMPDFViewerEmbeddedContent").length === 1;
		};

		var fnCheckControlStructure = async function () {
			assert.equal(oPdfViewer.getDisplayType(), PDFViewerDisplayType.Auto, "Default value of displayType is Auto");
			assert.ok(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is displayed in Auto mode");
			assert.ok(fnIsContentDisplayed(), "Content is displayed in Auto mode");

			oPdfViewer.setDisplayType(PDFViewerDisplayType.Embedded);
			await TestUtils.triggerRerender();
			assert.equal(oPdfViewer.getDisplayType(), PDFViewerDisplayType.Embedded, "Set displayType to Embedded mode");
			assert.ok(fnIsContentDisplayed(), "Content is displayed in Embedded mode");

			oPdfViewer.setDisplayType(PDFViewerDisplayType.Link);
			await TestUtils.triggerRerender();
			assert.equal(oPdfViewer.getDisplayType(), PDFViewerDisplayType.Link, "Set displayType to Link mode");
			assert.ok(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is displayed in Link mode");
			assert.notOk(fnIsContentDisplayed(), "Content is not displayed in Link mode");

			oPdfViewer.setShowDownloadButton(false);
			oPdfViewer.invalidate();
			await nextUIUpdate();
			assert.ok(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is displayed in Link mode always");

			oPdfViewer.setDisplayType(PDFViewerDisplayType.Auto);
			oPdfViewer.invalidate();
			await nextUIUpdate();
			assert.notOk(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is not displayed in Auto mode");

			Device.system.desktop = false;
			Device.system.phone = true;
			oPdfViewer.setDisplayType(PDFViewerDisplayType.Embedded);
			await TestUtils.triggerRerender();
			assert.ok(!fnIsErrorContentDisplayed(), "Error Content is not displayed in Mobile and Embedded mode");
			Device.system.desktop = true;
			Device.system.phone = false;

			fnDone();
		};

		var oOptions = {
			source: "{/source}",
			isTrustedSource: true,
			title: sTitle
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		await TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(1000)()
			.then(fnCheckControlStructure);
	});
});
