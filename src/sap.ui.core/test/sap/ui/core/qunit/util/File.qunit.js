/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/util/File"
], function (File) {
	"use strict";

	var BOM = "\uFEFF";

	// Helper that asserts no <a> elements created by File.save are left dangling
	// in the DOM. We match anchors that have a download attribute since the
	// implementation always sets one on the temporary link.
	function assertNoLeftoverAnchor(assert) {
		var iLeftover = document.querySelectorAll("body > a[download]").length;
		assert.strictEqual(iLeftover, 0, "no temporary anchor left in the DOM");
	}

	QUnit.module("Save (modern browser path)", {
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();

			// Stub the Blob constructor so we can inspect the args without
			// actually creating Blob instances. createObjectURL is stubbed too,
			// so the unused return value is fine.
			this.sandbox.stub(window, "Blob");
			this.sandbox.stub(window.URL, "createObjectURL").returns("blob:fake-url");

			// Prevent actual navigation triggered by anchor.click()
			this.clickStub = this.sandbox.stub(HTMLAnchorElement.prototype, "click");

			// Ensure modern IE saveAs path is not taken in this module
			if (window.navigator.msSaveOrOpenBlob) {
				this.sandbox.stub(window.navigator, "msSaveOrOpenBlob");
				delete window.navigator.msSaveOrOpenBlob;
			}
		},
		afterEach: function () {
			this.sandbox.restore();
		}
	});

	QUnit.test("Triggers anchor download with correct attributes and cleans up", function (assert) {
		File.save("hello", "myfile", "txt", "text/plain", "utf-8");

		assert.strictEqual(window.Blob.callCount, 1, "Blob constructed once");
		var aBlobArgs = window.Blob.getCall(0).args;
		assert.deepEqual(aBlobArgs[0], ["hello"], "Blob received the data array");
		assert.strictEqual(aBlobArgs[1].type, "data:text/plain;charset=utf-8",
			"Blob type contains mime + charset");

		assert.strictEqual(window.URL.createObjectURL.callCount, 1,
			"createObjectURL called once");

		assert.strictEqual(this.clickStub.callCount, 1, "anchor click() called once");

		// inspect the anchor that received the click
		var oAnchor = this.clickStub.thisValues[0];
		assert.strictEqual(oAnchor.getAttribute("download"), "myfile.txt",
			"download attribute is <fileName>.<fileExtension>");
		assert.strictEqual(oAnchor.getAttribute("href"), "blob:fake-url",
			"href attribute is the blob URL returned by createObjectURL");

		assertNoLeftoverAnchor(assert);
	});

	QUnit.test("Blob type omits charset when sCharset is falsy", function (assert) {
		File.save("payload", "data", "bin", "application/octet-stream");

		var aBlobArgs = window.Blob.getCall(0).args;
		assert.strictEqual(aBlobArgs[1].type, "data:application/octet-stream",
			"no ;charset segment when charset is undefined");
		assertNoLeftoverAnchor(assert);
	});

	QUnit.test("Default BOM is prepended for utf-8 + csv", function (assert) {
		File.save("a,b", "x", "csv", "text/csv", "utf-8");

		var aBlobArgs = window.Blob.getCall(0).args;
		assert.strictEqual(aBlobArgs[0][0], BOM + "a,b",
			"BOM prepended automatically for csv + utf-8");
	});

	QUnit.test("Explicit bByteOrderMark=false suppresses default BOM for csv + utf-8", function (assert) {
		File.save("a,b", "x", "csv", "text/csv", "utf-8", false);

		var aBlobArgs = window.Blob.getCall(0).args;
		assert.strictEqual(aBlobArgs[0][0], "a,b", "no BOM when explicitly disabled");
	});

	QUnit.test("Explicit bByteOrderMark=true prepends BOM for non-csv extension", function (assert) {
		File.save("hi", "x", "txt", "text/plain", "utf-8", true);

		var aBlobArgs = window.Blob.getCall(0).args;
		assert.strictEqual(aBlobArgs[0][0], BOM + "hi",
			"BOM prepended for explicit true + utf-8 even for non-csv");
	});

	QUnit.test("BOM is not prepended for non-utf-8 charset even when explicitly enabled", function (assert) {
		File.save("hi", "x", "csv", "text/csv", "iso-8859-1", true);

		var aBlobArgs = window.Blob.getCall(0).args;
		assert.strictEqual(aBlobArgs[0][0], "hi",
			"BOM only applies to utf-8 charset");
	});

	QUnit.module("Save (legacy IE/Edge path)", {
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.bAddedMsSave = false;
			if (!("msSaveOrOpenBlob" in window.navigator)) {
				// Property does not exist; create it temporarily so sandbox.stub works.
				window.navigator.msSaveOrOpenBlob = function () {};
				this.bAddedMsSave = true;
			}
			this.msSaveStub = this.sandbox.stub(window.navigator, "msSaveOrOpenBlob");
			this.createObjectURLSpy = this.sandbox.spy(window.URL, "createObjectURL");
			this.clickStub = this.sandbox.stub(HTMLAnchorElement.prototype, "click");
		},
		afterEach: function () {
			this.sandbox.restore();
			if (this.bAddedMsSave) {
				delete window.navigator.msSaveOrOpenBlob;
			}
		}
	});

	QUnit.test("Uses navigator.msSaveOrOpenBlob when available", function (assert) {
		File.save("data", "report", "csv", "text/csv", "utf-8");

		assert.strictEqual(this.msSaveStub.callCount, 1, "msSaveOrOpenBlob called once");
		var aArgs = this.msSaveStub.getCall(0).args;
		assert.ok(aArgs[0] instanceof window.Blob, "first arg is a Blob");
		assert.strictEqual(aArgs[1], "report.csv", "second arg is the full filename");

		assert.strictEqual(this.createObjectURLSpy.callCount, 0,
			"createObjectURL not used in legacy IE path");
		assert.strictEqual(this.clickStub.callCount, 0,
			"no anchor click in legacy IE path");
		assertNoLeftoverAnchor(assert);
	});

	QUnit.module("Save (window.open fallback)", {
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();

			// Force the modern path to fall through to the data-uri branch by
			// returning a plain object instead of a real anchor — `'download' in {}`
			// is false, while a real <a> always inherits `download` from
			// HTMLAnchorElement.prototype, which would defeat the test.
			var fnRealCreate = document.createElement.bind(document);
			this.sandbox.stub(document, "createElement").callsFake(function (sTag) {
				if (sTag === "a") {
					return {};
				}
				return fnRealCreate(sTag);
			});

			// Make sure the modern IE saveAs path is not taken
			if (window.navigator.msSaveOrOpenBlob) {
				this.sandbox.stub(window.navigator, "msSaveOrOpenBlob");
				delete window.navigator.msSaveOrOpenBlob;
			}

			this.sandbox.stub(window.URL, "createObjectURL").returns("blob:fake-url");
		},
		afterEach: function () {
			this.sandbox.restore();
		}
	});

	QUnit.test("Falls back to window.open with encoded data URI when 'download' attr is unsupported", function (assert) {
		var oFakeWindow = { opener: {} };
		var openStub = this.sandbox.stub(window, "open").returns(oFakeWindow);

		File.save("hello world", "name", "txt", "text/plain", "utf-8");

		assert.strictEqual(openStub.callCount, 1, "window.open invoked once");
		assert.strictEqual(openStub.getCall(0).args[0],
			"data:text/plain;charset=utf-8," + encodeURI("hello world"),
			"window.open URL encodes data into data-uri with charset");
		assert.strictEqual(oFakeWindow.opener, null, "opener was nulled out");
	});

	QUnit.test("Throws when window.open returns a falsy value", function (assert) {
		// Note: the source code accesses oWindow.opener BEFORE checking for falsy,
		// so a falsy return triggers a TypeError instead of the explicit Error.
		// Either way, an error escapes File.save — that is what we assert.
		this.sandbox.stub(window, "open").returns(null);

		assert.throws(function () {
			File.save("x", "y", "txt", "text/plain", "utf-8");
		}, "an error is thrown when window.open returns null");
	});

	QUnit.module("Save (no Blob support)", {
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.originalDescriptor = Object.getOwnPropertyDescriptor(window, "Blob");

			// Replace Blob with undefined for the duration of the test.
			// Use defineProperty so we can safely restore even on browsers where
			// Blob is non-writable.
			Object.defineProperty(window, "Blob", {
				configurable: true,
				writable: true,
				value: undefined
			});
			this.clickStub = this.sandbox.stub(HTMLAnchorElement.prototype, "click");
			this.openStub = this.sandbox.stub(window, "open");
		},
		afterEach: function () {
			if (this.originalDescriptor) {
				Object.defineProperty(window, "Blob", this.originalDescriptor);
			} else {
				delete window.Blob;
			}
			this.sandbox.restore();
		}
	});

	QUnit.test("Does nothing when window.Blob is unavailable", function (assert) {
		var oError = null;
		try {
			File.save("x", "y", "txt", "text/plain");
		} catch (e) {
			oError = e;
		}
		assert.strictEqual(oError, null, "no error thrown when Blob is unavailable");
		assert.strictEqual(this.clickStub.callCount, 0, "no anchor click attempted");
		assert.strictEqual(this.openStub.callCount, 0, "no window.open attempted");
		assertNoLeftoverAnchor(assert);
	});
});
