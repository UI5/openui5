/*global QUnit, window */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/FileUploader",
	"sap/ui/unified/library",
	"sap/ui/core/StaticArea",
	"sap/ui/core/TooltipBase",
	"sap/ui/core/InvisibleText",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function(Library, qutils, nextUIUpdate, FileUploader, unifiedLibrary, StaticArea, TooltipBase, InvisibleText, Button, Label, Text, Device, jQuery) {
	"use strict";

	// shortcut for sap.ui.unified.FileUploaderHttpRequestMethod
	var FileUploaderHttpRequestMethod = unifiedLibrary.FileUploaderHttpRequestMethod;

	/**
	* Helper function to create a FileUploader with useful default value
	*/
	var createFileUploader = function (mProps) {
		mProps = mProps || {};
		return new FileUploader({
			name: mProps.name || "test1",
			enabled: true,
			uploadUrl: mProps.uploadUrl || "../../../../upload/",
			sendXHR: mProps.sendXHR || true,
			multiple: mProps.multiple,
			value: mProps.value || "",
			width: mProps.width || "400px",
			tooltip: mProps.tooltip || "Upload your file to the local server.",
			placeholder: mProps.placeholder || "Choose a file for uploading...",
			fileType: mProps.fileType || ["pptx","txt","js"],
			mimeType: mProps.mimeType || ["image/jpeg","application/javascript","text/coffeescript"],
			maximumFilenameLength: mProps.maximumFilenameLength || 0,
			maximumFileSize: mProps.maximumFileSize || 2,
			uploadOnChange: mProps.uploadOnChange || false,
			buttonText: mProps.buttonText || "Choose!",
			buttonOnly: mProps.buttonOnly || false,
			additionalData: mProps.additionalData || "abc=123&test=456"
		});
	};

	/**
	 * Helper function to create a fake file object, which has the same properties
	 * as a real native File-Object.
	 * If the browser is Firefox we need to wrap the file object in a Blob.
	 * @param {object} mProps
	 * @param {boolean} bIsFirefox
	 */
	var createFakeFile = function (mProps, bIsFirefox) {
		var mProps = mProps || {},
			oFileObject = {
				"webkitRelativePath": mProps.webkitRelativePath || "",
				"lastModifiedDate": mProps.lastModifiedDate || "2014-08-14T09:42:09.000Z",
				"name": mProps.name || "FileUploader.js",
				"type": mProps.type || "application/javascript",
				"size": mProps.size || 401599
		};

		if (mProps.size === 0){
			oFileObject.size = 0;
		}

		return bIsFirefox ? new Blob([oFileObject]) : oFileObject;
	};

	/**
	 * Waits until a predicate on the file input becomes true or timeouts.
	 * Observes DOM mutations in the document (includes StaticArea). Resolves when the predicate is true.
	 * Rejects after the timeout to avoid infinite waiting.
	 * @param {function} fnPredicate - () => boolean
	 * @param {number} [iTimeout=2000] - ms
	 * @returns {Promise<void>}
	 */
	function waitForFileInputCondition(fnPredicate, iTimeout) {
		return new Promise(function(resolve, reject) {
			// Immediate check
			try {
				if (fnPredicate()) {
					resolve();
					return;
				}
			} catch (e) {
				// fall through to observer
			}

			var timer = setTimeout(function() {
				observer.disconnect();
				reject(new Error("waitForFileInputCondition: timeout"));
			}, iTimeout || 2000);

			var observer = new MutationObserver(function() {
				try {
					if (fnPredicate()) {
						clearTimeout(timer);
						observer.disconnect();
						resolve();
					}
				} catch (e) {
					// ignore and wait
				}
			});

			// observe whole document (covers static area). attribute changes + subtree childList
			observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["name", "multiple", "webkitdirectory", "required"] });
		});
	}

	/**
	 * Helper: Add files to a FileUploader by invoking its change handler.
	 * @param {sap.ui.unified.FileUploader} oFileUploader
	 * @param {Array} aFilesToAdd
	 */
	function addFilesToFileUploaderTokenizer(oFileUploader, aFilesToAdd) {
		aFilesToAdd = aFilesToAdd || [];
		oFileUploader._selectedFileNames = aFilesToAdd;
		oFileUploader._updateTokenizer();
	}

	/**
	 * Test Public Interface
	 */
	QUnit.module("public interface");

	QUnit.test("Test enabled property - setter/getter", async function (assert) {
		var oFileUploader = createFileUploader(),
				$fileUploader,
				sDisabledClassName = "sapUiFupDisabled",
				fnTestDisabledClass = function(fileUploader, bExpected) {
					assert.equal(fileUploader.hasClass(sDisabledClassName), bExpected,
							"The FUploader should " + (bExpected ? "" : "not") + " have the " + sDisabledClassName + " class.");
				};

		//Set up
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		$fileUploader = oFileUploader.$();

		// assert default
		fnTestDisabledClass($fileUploader, false);
		// prepare
		var oAfterRenderingHookSpy = this.spy(oFileUploader, "onAfterRendering");

		// act
		oFileUploader.setEnabled(false);
		await nextUIUpdate();

		// assert
		fnTestDisabledClass($fileUploader, true);
		assert.ok(oAfterRenderingHookSpy.calledOnce, "The enabled property setter causes invalidation");

		// cleanup
		oAfterRenderingHookSpy.restore();

		// act
		oFileUploader.setEnabled(true);
		await nextUIUpdate();
		// assert
		fnTestDisabledClass($fileUploader, false);

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Destroy: cleans the file uploader input filed from static area", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader(),
			oStaticArea = StaticArea.getDomRef();

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		// Trigger invalidation by using a setter,
		// That way before rendering hook will be executed,
		// control won't be rendered, after rendering
		// hook won't be executed and file uploader input
		// field will be left in static area
		oFileUploader.setVisible(false);
		await nextUIUpdate();

		// assert
		assert.ok(oStaticArea.querySelector("[type='file']"), "File uploader input field exits in the static area");
		assert.ok(oFileUploader.FUEl, "File type input element is cached");
		assert.ok(oFileUploader.FUDataEl, "File input data element is cached");

		// act
		oFileUploader.destroy();

		// assert
		assert.notOk(oStaticArea.querySelector("[type='file']"), "File uploader input field is removed from static area");
		assert.notOk(oFileUploader.FUEl, "File type input element reference is null");
		assert.notOk(oFileUploader.FUDataEl, "File input data element reference is null");
	});

	QUnit.test("Test buttonOnly property - setter/getter", async function (assert) {
		var oFileUploader = createFileUploader({
				buttonOnly: true
			}),
			$fileUploader,
			sButtonOnlyClassName = "sapUiFupButtonOnly",
			fnTestButtonOnlyClass = function(fileUploader, bExpected) {
				assert.equal(fileUploader.hasClass(sButtonOnlyClassName), bExpected,
					"The FUploader should " + (bExpected ? "" : "not") + " have the " + sButtonOnlyClassName + " class.");
			};

		//Set up
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		$fileUploader = oFileUploader.$();

		// assert default
		fnTestButtonOnlyClass($fileUploader, true);

		// act
		oFileUploader.setButtonOnly(false);
		await nextUIUpdate();
		$fileUploader = oFileUploader.$();
		// assert
		fnTestButtonOnlyClass($fileUploader, false);

		//cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Test fileType property - setter/getter - compatibility cases", function (assert) {
		//Setup
		var oFileUploader = createFileUploader({
			fileType: "doc,docx,txt,rtf"
		});

		//Initial Array Check
		assert.deepEqual(oFileUploader.getFileType(), ["doc", "docx", "txt", "rtf"], "initial property value 'doc,docx,txt,rtf' should be converted to an array");

		//standard cases
		oFileUploader.setFileType("bmp");
		assert.deepEqual(oFileUploader.getFileType(), ["bmp"], "setFileType('bmp') --> getFileType() should return the file types converted to an array");

		oFileUploader.setFileType("bmp,png,jpeg");
		assert.deepEqual(oFileUploader.getFileType(), ["bmp", "png", "jpeg"], "setFileType('bmp,png,jpeg') --> getFileType() should return the file types converted to an array");

		//Edge case
		oFileUploader.setFileType("");
		assert.deepEqual(oFileUploader.getFileType(), [], "setFileType('') --> getFileType() should return an empty array");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test fileType property - setter/getter - standard cases", function (assert) {
		//Setup
		var oFileUploader = createFileUploader({
				fileType: ["doc", "docx", "txt", "rtf"]
			});

		//Initial Array Check
		assert.deepEqual(oFileUploader.getFileType(), ["doc", "docx", "txt", "rtf"], "initial property value should be converted to an array");

		//Standard cases
		oFileUploader.setFileType(["bmp"]);
		assert.deepEqual(oFileUploader.getFileType(), ["bmp"], "setFileType(['bmp']) --> getFileType() should return a specific array");

		oFileUploader.setFileType(["bmp", "png", "jpeg"]);
		assert.deepEqual(oFileUploader.getFileType(), ["bmp", "png", "jpeg"], "setFileType(['bmp', 'png', 'jpeg']) --> getFileType() should return a specific array");

		//Edge cases
		oFileUploader.setFileType([]);
		assert.deepEqual(oFileUploader.getFileType(), [], "setFileType([]) --> getFileType() should return an empty array");

		oFileUploader.setFileType(null);
		assert.equal(oFileUploader.getFileType(), null, "setFileType(null) --> getFileType() should return null");

		oFileUploader.setFileType();
		assert.equal(oFileUploader.getFileType(), undefined, "setFileType() --> getFileType() should return undefined");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test mimeType property - setter/getter - compatibility cases", function (assert) {
		//Setup
		var oFileUploader = createFileUploader({
			mimeType: "image/png,image,image/jpeg,application/javascript"
		});

		//Initial Array Check
		assert.deepEqual(oFileUploader.getMimeType(), ["image/png", "image", "image/jpeg", "application/javascript"], "initial property value 'image/png,image,image/jpeg,application/javascript' should be converted to an array");

		//standard case
		oFileUploader.setMimeType("image/jpeg,audio/mpeg3,text");
		assert.deepEqual(oFileUploader.getMimeType(), ["image/jpeg", "audio/mpeg3", "text"], "setMimeType('image/jpeg,audio/mpeg3,text') --> getMimeType() should return the file types converted to an array");

		//Edge Cases
		oFileUploader.setMimeType("");
		assert.deepEqual(oFileUploader.getMimeType(), [], "setMimeType('') --> getMimeType() should return an empty array");

		oFileUploader.setMimeType("application");
		assert.deepEqual(oFileUploader.getMimeType(), ["application"], "setMimeType('application') --> getMimeType() should return the file types converted to an array");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test mimeType property - setter/getter - standard cases", function (assert) {
		//Setup
		var oFileUploader = createFileUploader({
				mimeType: ["image/png", "image", "image/jpeg", "application/javascript"]
			});

		//Initial Array Check
		assert.deepEqual(oFileUploader.getMimeType(), ["image/png", "image", "image/jpeg", "application/javascript"], "initial property value should be converted to an array");

		//standard cases
		oFileUploader.setMimeType(["audio"]);
		assert.deepEqual(oFileUploader.getMimeType(), ["audio"], "setMimeType(['audio']) --> getMimeType() should return an array with the original content");

		oFileUploader.setMimeType(["image", "audio/mpeg3", "text/x-java-source"]);
		assert.deepEqual(oFileUploader.getMimeType(), ["image", "audio/mpeg3", "text/x-java-source"], "setMimeType(['image', 'audio/mpeg3', 'text/x-java-source']) --> getMimeType() should return a specific array");

		//Edge cases
		oFileUploader.setMimeType([]);
		assert.deepEqual(oFileUploader.getMimeType(), [], "setMimeType([]) --> getMimeType() should return an empty array");

		oFileUploader.setMimeType(null);
		assert.equal(oFileUploader.getMimeType(), null, "setMimeType(null) --> getMimeType() should return null");

		oFileUploader.setMimeType();
		assert.equal(oFileUploader.getMimeType(), undefined, "setMimeType() --> getMimeType() should return undefined");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test mimeType property - setter", async function (assert) {
		//prepare
		var done = assert.async(),
			oFileUploader = new FileUploader();

		oFileUploader.placeAt("content");
		await nextUIUpdate();

		var oAfterRenderingDelegate = {
			onAfterRendering: function() {
				//assert
				assert.equal(document.querySelectorAll("[type='file']").length, 1, "There is only one upload input element");

				//clean
				oFileUploader.removeDelegate(oAfterRenderingDelegate);
				oFileUploader.destroy();
				done();
			}
		};

		oFileUploader.addDelegate(oAfterRenderingDelegate);

		//act
		oFileUploader.setMimeType(["audio"]);
	});

	QUnit.test("Test multiple property - setter", async function (assert) {
		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oFileUploader.setMultiple(true);

		// wait for the control's own native input to reflect the change
		await waitForFileInputCondition(function() {
			var oInput = oFileUploader.getInputReference(); // use control-specific getter
			return oInput && oInput.getAttribute("name") === oFileUploader.getId() + "[]";
		}, 2000);

		// assert using the control-specific input
		var oInput = oFileUploader.getInputReference();
		assert.strictEqual(oInput.getAttribute("name"), oFileUploader.getId() + "[]", "multiple files expected");

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Test directory property - setter", async function (assert) {

		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oFileUploader.setDirectory(true);

		// wait for the control's own native input to reflect the change
		await waitForFileInputCondition(function() {
			var oInput = oFileUploader.getInputReference();
			return oInput && oInput.getAttribute("name") === oFileUploader.getId() + "[]" && oInput.hasAttribute("webkitdirectory");
		}, 2000);

		// assert using the control-specific input
		var oInput = oFileUploader.getInputReference();
		assert.strictEqual(oInput.getAttribute("name"), oFileUploader.getId() + "[]", "multiple files expected");
		assert.ok(oInput.hasAttribute("webkitdirectory"), "attribute properly set");

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Setters used on after rendering, don't create additional input field type file", async function (assert) {
		//prepare
		var done = assert.async(),
			oFileUploader = new FileUploader({
				multiple: false
			});

		var oAfterRenderingDelegate = {
			onAfterRendering: function() {
				//act
				oFileUploader.setMultiple(true);

				//assert
				assert.strictEqual(document.querySelectorAll("[type='file']").length, 1, "There is only one input field");

				//clean
				oFileUploader.removeDelegate(oAfterRenderingDelegate);
				oFileUploader.destroy();
				done();
			}
		};

		oFileUploader.addDelegate(oAfterRenderingDelegate);
		oFileUploader.placeAt("content");
		await nextUIUpdate();
	});

	QUnit.test("Test httpRequestMethod property with native form submit", async function (assert) {
		//Setup
		var oFileUploader = new FileUploader();

		//Act
		oFileUploader.setHttpRequestMethod(FileUploaderHttpRequestMethod.PUT);
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.equal(
			oFileUploader.getDomRef().querySelector("form").getAttribute("method"),
			oFileUploader.getHttpRequestMethod().toLowerCase(),
			"Correct method attribute value is set"
		);

		//Clean
		oFileUploader.destroy();
	});

	QUnit.test("Test httpRequestMethod property with XMLHttpRequest", async function (assert) {
		//Setup
		var oFileUploader = createFileUploader(),
			aFiles = {
				"0": createFakeFile({
					name: "FileUploader.qunit.html",
					type: "text/html",
					size: 404450
				}),
				"length" : 1
			},
			oXMLHttpRequestOpenSpy = this.spy(window.XMLHttpRequest.prototype, "open");

		oFileUploader.setHttpRequestMethod(FileUploaderHttpRequestMethod.PUT);
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oFileUploader._sendFilesWithXHR(aFiles);

		//Assert
		assert.ok(oXMLHttpRequestOpenSpy.calledWith(FileUploaderHttpRequestMethod.PUT), "XHL Http put request is made");

		//Clean
		oFileUploader.destroy();
		oXMLHttpRequestOpenSpy.restore();
	});

	//BCP: 1970125350
	//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
	QUnit.test("input has the correct accept attribute", async function(assert) {
		//Setup
		var oFileUploader = createFileUploader({
			mimeType: ["image/png", "image/jpeg"],
			fileType: ["txt", "pdf"]
		});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("accept"),
			".txt,.pdf,image/png,image/jpeg",
			"accept attribute is correct");

		//cleanup
		oFileUploader.destroy();
	});

	//BCP: 2070139852
	QUnit.test("input has the correct accept attribute", async function(assert) {
		//Setup
		var oFileUploader = createFileUploader({
			fileType: ["XML"],
			mimeType: []
		});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("accept"),
			".XML",
			"accept attribute is correct initially");

		oFileUploader.setFileType(["JSON"]);
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("accept"),
			".JSON",
			"accept attribute is correct after using setter");
		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("input has the correct name attribute", async function(assert) {
		//Setup
		var oFileUploader = createFileUploader({
			name: "testNameAttribute"
		});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("name"),
			"testNameAttribute",
			"name attribute is correct initially");

		oFileUploader.setName("newTestNameAttribute");
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("name"),
			"newTestNameAttribute",
			"name attribute is correct after using setter");
		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test setTooltip", async function (assert) {
		//Set up
		var sTooltip = "this is \"the\" file uploader";
		var oFileUploader = createFileUploader({
			tooltip: "MyFileUploader"
		});


		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oFileUploader.setTooltip(sTooltip);
		await nextUIUpdate();

		// assert
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sTooltip, "FileUploader tooltip is correct");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test setTooltip with none-string tooltip", async function (assert) {
		// Set up
		var oTooltip = new TooltipBase({text: "test"});
		var oFileUploader = createFileUploader({
			tooltip: oTooltip
		});

		// act
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert (only tooltip type of string are added via the 'title' attribute)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), oFileUploader._getEffectivePlaceholder(), "The title attribute is set to default 'no file chosen' value");
		assert.equal(oFileUploader.$().find(".sapUiFupInputMask")[0].getAttribute("title"), null, "The title attribute is not set");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test browse icon/button interaction", async function (assert) {
		//Set up
		var oFileUploader = createFileUploader({ buttonOnly: true }),
			oSpy,
			FUEl,
			oBrowseIcon;

		// override onclick handler to prevent file dialog opening, causing the test execution to stop
		oFileUploader.onclick = function (oEvent) {
			oEvent.preventDefault();
		};

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		//act (in buttonOnly mode)
		FUEl = oFileUploader.getDomRef("fu");
		oSpy = this.spy(FUEl, "click");
		qutils.triggerEvent("click", oFileUploader.oBrowse.getId());

		// assert
		assert.strictEqual(oSpy.callCount, 1, "Clicking on browse button should trigger click on the input");

		oFileUploader.setButtonOnly(false);
		await nextUIUpdate();

		// act (in standard mode)
		oBrowseIcon = oFileUploader.getDomRef("fu_browse_icon");
		qutils.triggerEvent("click", oBrowseIcon);

		// assert
		assert.strictEqual(oSpy.callCount, 2, "Clicking on browse icon should trigger click on the input");

		// cleanup
		oSpy.restore();
		oFileUploader.destroy();
	});

	QUnit.test("Externally referenced label interaction", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader("uploader"),
			oLabel = new Label({labelFor: "uploader", text: "label"}),
			oClickEvent = new MouseEvent("click", {bubbles: true, cancelable: true}),
			oOpenDialogSpy;

		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oOpenDialogSpy = this.spy(oFileUploader, "fireBeforeDialogOpen");

		// assert
		assert.notOk(oFileUploader.getDomRef().classList.contains("sapMFocus"),  "The File Uploader is not focused");

		// act
		oLabel.getDomRef().dispatchEvent(oClickEvent);

		// assert
		assert.ok(oFileUploader.getDomRef().classList.contains("sapMFocus"),  "The File Uploader gets focused");
		assert.equal(oOpenDialogSpy.callCount, 0,  "The browse button does not get activated");

		// clean
		oOpenDialogSpy.restore();
		oLabel.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("dependency of submit and rendering", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader().placeAt("qunit-fixture");

		await nextUIUpdate();

		// act
		oFileUploader.upload();

		// assert
		assert.strictEqual(oFileUploader._submitAfterRendering, false, "The submit is performed without a dependency of the rendering.");

		// act
		oFileUploader.setUploadUrl("test");
		oFileUploader.upload();

		// assert
		assert.strictEqual(oFileUploader._submitAfterRendering, true, "The submit is performed after there is rendering caused by setter of uploadUrl.");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("'uploadStart' event is fired with native form submit", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader({ uploadUrl: "test" }).placeAt("qunit-fixture"),
			oFireUploadStartSpy = this.spy(oFileUploader, "fireUploadStart");

		await nextUIUpdate();

		// act
		oFileUploader.upload();

		// assert
		assert.ok(oFireUploadStartSpy.calledOnce, "'uploadStart' event is fired.");

		// cleanup
		oFileUploader.destroy();
		oFireUploadStartSpy.restore();
	});

	QUnit.test("'fireBeforeOpen', 'fileAfterClose' are properly called", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader().placeAt("content"),
			oFireBeforeDialogOpenSpy = this.spy(oFileUploader, "fireBeforeDialogOpen"),
			oFireAfterDialogCloseSpy = this.spy(oFileUploader, "fireAfterDialogClose"),
			oInputElement = document.createElement("input"),
			oFakeEvent = {};

		await nextUIUpdate();
		oInputElement.setAttribute("type", "file");
		oFakeEvent.target = oInputElement;

		// act
		oFileUploader.onclick(oFakeEvent);

		// assert
		assert.ok(oFireBeforeDialogOpenSpy.calledOnce, "'fireBeforeDialogOpen' event called once");

		// act
		document.body.onfocus();

		// assert
		assert.ok(oFireAfterDialogCloseSpy.calledOnce, "'fireAfterDialogClose' event called once");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test valueState property - setter", async function (assert) {
		//prepare
		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oAfterRenderingHookSpy = this.spy(oFileUploader, "onAfterRendering");

		// act
		oFileUploader.setValueState("Error");
		await nextUIUpdate();

		// assert
		assert.ok(oAfterRenderingHookSpy.calledOnce, "ValueState stter causes invalidation");

		// clean
		oFileUploader.destroy();
		oAfterRenderingHookSpy.restore();
	});

	QUnit.test("Test valueStateText property - setter", async function (assert) {
		//prepare
		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oAfterRenderingHookSpy = this.spy(oFileUploader, "onAfterRendering");

		// act
		oFileUploader.setValueStateText("Error text");
		await nextUIUpdate();

		// assert
		assert.ok(oAfterRenderingHookSpy.calledOnce, "ValueStateText stter causes invalidation");

		// clean
		oFileUploader.destroy();
		oAfterRenderingHookSpy.restore();
	});

	QUnit.test("FileUploader.prototype.clear", async function (assert) {
		// prepare
		var oFileUploader = new FileUploader();
		var oDataTransfer = new DataTransfer();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		var oFileInputField = oFileUploader.getDomRef("fu");
		oDataTransfer.items.add(
			new File(["test"], {type: "text/plain"})
		);
		oFileInputField.files = oDataTransfer.files;

		// assert
		assert.strictEqual(oFileInputField.files.length, 1, "A file is selected.");

		// act
		oFileUploader.setVisible(false);
		await nextUIUpdate();

		oFileUploader.clear();

		// assert
		assert.strictEqual(oFileUploader.getDomRef("fu").files.length, 0, "There are no selected files.");

		// clean
		oFileUploader.destroy();
	});

	// test various File Uploader interactions
	QUnit.module("FileUploader Interactions");

	QUnit.test("Check which DOM element is focused when file uploader is focused (buttonOnly: false)", async function (assert) {
		var oButton = new Button({ text: "Before" });
		var oFileUploader = new FileUploader({ buttonOnly: false });

		oButton.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// focus button first
		oButton.focus();
		await nextUIUpdate();
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Button is focused initially");

		// focus file uploader and verify internal input is active
		oFileUploader.focus();
		await nextUIUpdate();

		assert.strictEqual(document.activeElement, oFileUploader.oFileUpload, "After focusing FileUploader (buttonOnly:false) the internal input is the active element");
		assert.strictEqual(document.activeElement.id, oFileUploader.getId() + "-fu", "Active element id matches internal input id");

		// cleanup
		oButton.destroy();
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Check which DOM element is focused when file uploader is focused (buttonOnly: true)", async function (assert) {
		var oButton = new Button({ text: "Before" });
		var oFileUploader = new FileUploader({ buttonOnly: true });

		oButton.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// focus button first
		oButton.focus();
		await nextUIUpdate();
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Button is focused initially");

		// focus file uploader and verify internal input is active
		oFileUploader.focus();
		await nextUIUpdate();

		assert.strictEqual(document.activeElement, oFileUploader.oFileUpload, "After focusing FileUploader (buttonOnly:true) the internal input is the active element");
		assert.strictEqual(document.activeElement.id, oFileUploader.getId() + "-fu", "Active element id matches internal input id");

		// cleanup
		oButton.destroy();
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Browse icon opens file picker dialog", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oSpy = this.spy(oFileUploader, "openFilePicker");

		// act - click the browse icon (non-buttonOnly mode)
		qutils.triggerEvent("click", oFileUploader._getBrowseIcon().getId());
		await nextUIUpdate();

		// assert
		assert.ok(oSpy.calledOnce, "Clicking the browse icon fires openFilePicker");

		// cleanup
		oSpy.restore();
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("DEL removes selected tokens when FileUploader is focused", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader({ multiple: true });
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// populate tokens (helper updates tokenizer from selectedFileNames)
		addFilesToFileUploaderTokenizer(oFileUploader, ["a.txt", "b.txt"]);
		await nextUIUpdate();

		var oTokenizer = oFileUploader._getTokenizer();
		var aTokens = oTokenizer.getTokens();
		assert.strictEqual(aTokens.length, 2, "Tokenizer initially has two tokens");

		// ensure uploader is focused (as requested)
		oFileUploader.focus();
		await nextUIUpdate();

		// act: simulate DEL key press
		var oDelEvent = {
			keyCode: 46
		};
		oFileUploader.onkeydown(oDelEvent);
		oFileUploader.onkeyup(oDelEvent);
		await nextUIUpdate();

		// assert: tokens removed and internal state cleared
		assert.strictEqual(oTokenizer.getTokens().length, 0, "All tokens removed after DEL");
		assert.strictEqual(oFileUploader._selectedFileNames.length, 0, "_selectedFileNames cleared after DEL");

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("ValueState popup opens on focus when valueState is set", async function (assert) {
		var oFileUploader = new FileUploader({
				valueState: "Error",
				valueStateText: "There is an error"
			}),
			oOpenSpy = this.spy(oFileUploader, "openValueStateMessage"),
			oButton = new Button({ text: "Before" }),
			oValueStateMessage;

		// place a button before the uploader to be able to shift focus away
		oButton.placeAt("qunit-fixture");
		await nextUIUpdate();
		oButton.focus();
		await nextUIUpdate();

		// oFileUploader.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		oValueStateMessage = oFileUploader._oValueStateMessage;

		// assert initial state
		assert.notOk(oOpenSpy.called, "openValueStateMessage not called before focus");
		assert.notOk(oValueStateMessage.getPopup().isOpen(), "Value state message popup is not open before focus");

		// focus the control -> should open value state message
		oFileUploader.focus();
		await nextUIUpdate();

		// assert
		assert.ok(oOpenSpy.calledOnce, "openValueStateMessage was called once on focus when valueState is Error");
		assert.ok(oValueStateMessage.getPopup().isOpen(), "Value state message popup is open after focus");

		oButton.focus();
		await nextUIUpdate();

		// assert state on focus out
		assert.notOk(oValueStateMessage.getPopup().isOpen(), "Value state message popup is not open after focus out");

		// cleanup
		oOpenSpy.restore && oOpenSpy.restore();
		oButton.destroy();
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Label click focuses FileUploader (external label via labelFor)", async function (assert) {
		var oFileUploader = new FileUploader("fuLabelTest"),
			oLabel = new Label({ text: "Click me", labelFor: oFileUploader.getId() }),
			oBeforeDialogOpenSpy;

		// render
		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// spy to ensure clicking the label does not open the native dialog
		oBeforeDialogOpenSpy = this.spy(oFileUploader, "fireBeforeDialogOpen");

		// simulate user click on the label
		var oClickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
		oLabel.getDomRef().dispatchEvent(oClickEvent);
		await nextUIUpdate();

		// assert: file uploader receives focus (focus class present) and dialog not opened
		assert.ok(oFileUploader.getDomRef().classList.contains("sapMFocus"), "FileUploader is focused after clicking external label");
		assert.ok(document.activeElement === oFileUploader.oFileUpload, "Internal file input is the active element after clicking external label");
		assert.strictEqual(oBeforeDialogOpenSpy.callCount, 0, "Clicking external label does not fire beforeDialogOpen");

		// cleanup
		oBeforeDialogOpenSpy.restore();
		oLabel.destroy();
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.module("'title' attribute of the internal <input type='file'>");

	QUnit.test("Test 'title' attribute in different scenarios", async function (assert){
		var oFileUploader = new FileUploader(),
			sDefaultTitle = oFileUploader._getEffectivePlaceholder(),
			sFileName = "test.txt",
			sTooltip = "My tooltip";

		// act
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert (default 'no file chosen' text must be added as 'title' attribute if there is no file chosen and no tooltip set)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sDefaultTitle, "The title attribute is set to default 'no file chosen' value");

		// act
		oFileUploader.setValue(sFileName);

		// assert (file name passed as value must be added as 'title' attribute if there is no tooltip set)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sFileName, "The title attribute is set to file name passed as value");

		// act
		oFileUploader.setTooltip(sTooltip);

		// assert (passed tooltip must be added as 'title' attribute no matter if there is value set or not)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sTooltip, "The title attribute is set to passed tooltip when there is value set");

		// act
		oFileUploader.setValue("");

		// assert (passed tooltip must be added as 'title' attribute no matter if there is value set or not)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sTooltip, "The title attribute is set to passed tooltip when there is no value set");

		oFileUploader.destroy();
	});

	QUnit.test("dependency of submit and rendering", async function (assert) {
		// arrange
		var done = assert.async(),
			oFileUploader = new FileUploader(),
			oAfterRenderingDelegate = {
				onAfterRendering: function() {
					// act
					oFileUploader.setEnabled(null);

					// assert
					assert.notOk(oFileUploader.FUEl.getAttribute("disabled"), "File uploader is enabled");

					// clean
					oFileUploader.removeDelegate(oAfterRenderingDelegate);
					oFileUploader.destroy();
					done();
				}
			};

		oFileUploader.addDelegate(oAfterRenderingDelegate);
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.module("File validation");
	QUnit.test("Test file type validation - handlechange()", async function (assert){
		//setup
		var oFileUploader = createFileUploader({
				fileType: ["bmp", "png", "jpg"]
			}),
			//rebuilding the native event structure
			fakeEvent = {
				type: "change",
				target: {
					files : {
						"0": createFakeFile({
								name:"FileUploader.qunit.html",
								type:"text/html",
								size:404450
							}),
						"length" : 1
					}
				}
			},
			fnTypeMissmatchHandler = function (oEvent) {
				//this branch is necessary because, the typeMissmatch Event is fired if either the fileType or mimeType is wrong
				if (oEvent.getParameter("fileType")) {
					assert.equal(oEvent.getParameter("fileName"), "FileUploader.qunit.html", "typeMissmatch Event has the correct parameter");
				} else if (oEvent.getParameter("fileType") === "") {
					// when file has no extension it should return empty string for the fileType
					assert.equal(oEvent.getParameter("fileType"), "", "parameter fileType is empty, when file has no extension");
				} else if (oEvent.getParameter("mimeType")) {
					assert.equal(oEvent.getParameter("fileName"), "hallo.png", "typeMissmatch Event has the correct parameter");
				}
			},
			fnFileAllowedHandler = function (oEvent) {
				assert.equal(oEvent.getParameter("fileName"), undefined, "fileAllowed should not have any parameters");
			},
			oTypeMissmatchSpy = this.spy(oFileUploader, "fireTypeMissmatch"),
			oFileAllowedSpy = this.spy(oFileUploader, "fireFileAllowed");

		//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();


		//attach the events which will be fired
		oFileUploader.attachEvent("typeMissmatch", fnTypeMissmatchHandler);
		oFileUploader.attachEvent("fileAllowed", fnFileAllowedHandler);

		//type mismatch on the *fileType*
		oFileUploader.setMimeType(["text/html"]);
		oFileUploader.handlechange(fakeEvent);
		assert.equal(oTypeMissmatchSpy.callCount, 1, "typeMissmatch (fileType) Event should be called exactly ONCE");

		//type mismatch on the *mimeType*
		oFileUploader.setMimeType(["text/html"]);
		fakeEvent.target.files[0] = createFakeFile({
			name: "hallo.png",
			type: "image/png",
			size: 166311
		});
		oFileUploader.handlechange(fakeEvent);
		assert.equal(oTypeMissmatchSpy.callCount, 2, "typeMissmatch (mimeType) Event should be called TWICE now");

		//type mismatch on the empty *fileType*
		oFileUploader.setMimeType();
		fakeEvent.target.files[0] = createFakeFile({
			name: "hallo",
			type: "unknown",
			size: 166311
		});
		oFileUploader.handlechange(fakeEvent);
		assert.equal(oTypeMissmatchSpy.callCount, 3, "typeMissmatch (fileType) Event should be called TRICE now");

		//file allowed
		oFileUploader.setFileType(["html"]);
		oFileUploader.setMimeType(["text/html"]);
		fakeEvent.target.files[0] = createFakeFile({
			name: "FileUploader.qunit.html",
			type: "text/html",
			size: 100301
		});
		oFileUploader.handlechange(fakeEvent);

		assert.equal(oFileAllowedSpy.callCount, 1, "fileAllowed Event should be called exactly ONCE");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Unknown mime types doesn't block file from uploading", async function (assert) {
		// prepare
		var oFileUploader = new FileUploader({
				uploadUrl: "/upload",
				mimeType: ["image/png", "image/jpeg"],
				fileType: ["msg", "jpeg", "png"]
			}),
			fakeEvent = {
				type: "change",
				target: {
					files : {
						"0": createFakeFile({
								name: "test.msg",
								type: "unknown",
								size: 404450
							}),
						"length" : 1
					}
				}
			},
			oFileAllowedSpy = this.spy(oFileUploader, "fireFileAllowed");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oFileUploader.handlechange(fakeEvent);

		// assert
		assert.ok(oFileAllowedSpy.calledOnce, "File upload is allowed");

		// clean
		oFileUploader.destroy();
	});

	QUnit.test("Testing the filename lenth validation handling - handlechange()", async function (assert) {
		//setup
		var oFileUploader = createFileUploader({
				maximumFilenameLength: 10,
				fileType: ["java"],
				mimeType: ["text/x-java-source,java"]
			}),
			//rebuilding the native event structure
			fakeEvent = {
				type: "change",
				target: {
					files : {
						"0": createFakeFile({
								name:"AbstractSingletonProxyFactoryBean.java",
								type:"text/x-java-source,java",
								size:1226
							}),
						"length" : 1
					}
				}
			},
			fnFilenameLengthExceedHandler = function (oEvent) {
				assert.equal(oEvent.getParameter("fileName"), "AbstractSingletonProxyFactoryBean.java", "filenameLengthExceed Event delivers correct fileName, which is too long");
			},
			oSpy = this.spy(oFileUploader, "fireFilenameLengthExceed");

		//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oFileUploader.attachEvent("filenameLengthExceed", fnFilenameLengthExceedHandler);

		oFileUploader.handlechange(fakeEvent);
		assert.equal(oSpy.callCount, 1, "filenameLengthExceed Event should be called exactly ONCE");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Testing the clearing of the files - clear()", async function (assert) {
		// setup
		var oFileUploader = createFileUploader(),
			oSpy = this.spy(oFileUploader, "setValue"),
			oTokenizer,
			iTry = 0,
			oDelegate = {
				onAfterRendering: function() {
					// to avoid side effects in further tests
					if (iTry === 0) {
						assert.equal(oTokenizer.getTokens().length, 1, "Tokenizer should have 1 token");
					} else {
						assert.equal(oTokenizer.getTokens().length, 0, "Tokenizer should be empty after clearing the FileUploader");
						oTokenizer.removeDelegate(oDelegate);
					}
					iTry++;
				}
			};

		// explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		oTokenizer = oFileUploader._getTokenizer();
		oTokenizer.addDelegate(oDelegate);

		// act - simulate adding a file
		oFileUploader.setValue("Testfilename.txt");
		await nextUIUpdate();

		// assert - check if the file is set correctly
		assert.equal(oFileUploader.getValue(), "Testfilename.txt", "Check if filename is set correctly");
		assert.equal(oSpy.callCount, 1, "setValue was called ONCE");

		// clearing the FUP
		oFileUploader.clear();
		assert.equal(oFileUploader.getValue(), "", "Value should be empty string: ''");

		// check if the text fields are empty as expected
		assert.equal(oSpy.callCount, 2, "setValue should now be called TWICE");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("clear() should not steal focus from another control", async function (assert) {
		// prepare
		var oButton = new Button({ text: "Other control" }),
			oFileUploader = createFileUploader();

		oButton.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// focus the button (simulates another control having focus)
		oButton.focus();
		await nextUIUpdate();
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Button is focused before clear()");

		// act - programmatically clear the FileUploader while another element is focused
		oFileUploader.setValue("test.txt");
		await nextUIUpdate();
		oButton.focus();
		await nextUIUpdate();

		oFileUploader.clear();
		await nextUIUpdate();

		// assert - the _bFocusFileUploader flag must not be set
		assert.notOk(oFileUploader._bFocusFileUploader, "_bFocusFileUploader is not set after clear()");
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Focus stays on the button after clear()");

		// cleanup
		oButton.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("setValue() should not steal focus from another control", async function (assert) {
		// prepare
		var oButton = new Button({ text: "Other control" }),
			oFileUploader = createFileUploader();

		oButton.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// set initial value
		oFileUploader.setValue("initial.txt");
		await nextUIUpdate();

		// focus the button (simulates another control having focus)
		oButton.focus();
		await nextUIUpdate();
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Button is focused before setValue('')");

		// act - programmatically clear via setValue while another element is focused
		oFileUploader.setValue("");
		await nextUIUpdate();

		// assert - the _bFocusFileUploader flag must not be set
		assert.notOk(oFileUploader._bFocusFileUploader, "_bFocusFileUploader is not set after setValue('') when not focused");
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Focus stays on the button after setValue('')");

		// cleanup
		oButton.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("setValue() should preserve focus when FileUploader is focused", async function (assert) {
		// prepare
		var oFileUploader = createFileUploader();

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// focus the FileUploader itself
		oFileUploader.focus();
		await nextUIUpdate();

		// act - call setValue while the FileUploader is focused
		oFileUploader.setValue("newfile.txt");
		await nextUIUpdate();

		// assert - focus should remain on the FileUploader
		assert.ok(document.activeElement, oFileUploader.getDomRef(), "FileUploader remains focused");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Empty file event is fired", async function (assert){
		var oFileUploader = createFileUploader(),
			fnFireFileEmpty = this.spy( oFileUploader, "fireFileEmpty"),
			oTestEvent = {
				type: "change",
				target: {
					files : {
						"0": createFakeFile({
								name: "emptyFile.txt",
								type: "text/html",
								size: 0
							}),
						"length" : 1
					}
				}
		};

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oFileUploader.handlechange(oTestEvent);
		assert.equal(fnFireFileEmpty.calledOnce, true, "Event on empty file upload is fired.");

		//Clean up
		oFileUploader.destroy();
	});

	QUnit.test("Test file stays selected after click over the file uploader", async function (assert) {
		// Prepare
		var oFileUploader = new FileUploader({
				sameFilenameAllowed: true
			}),
			file = new File(["test"], "test.txt", {
				type: "text/plain"
			});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oFileInput = oFileUploader.getDomRef("fu");

		// Act
		var oTransfer = new DataTransfer();
		oTransfer.items.add(file);
		oFileInput.files = oTransfer.files;
		oFileUploader.setValue(file.name);
		await nextUIUpdate();

		// Assert
		assert.equal(oFileUploader.getValue(), "test.txt", "File name is set correctly");
		assert.equal(oFileInput.files.length, 1, "File is selected");

		// Act
		oFileUploader.onclick({ target: oFileUploader.getDomRef()});
		await nextUIUpdate();

		// Assert
		assert.equal(oFileUploader.getValue(), "test.txt", "File name is still set correctly");
		assert.equal(oFileInput.files.length, 1, "File is still selected");

		// Cleanup
		oFileUploader.destroy();
	});

	QUnit.test("setValue('') clears file selection when FileUploader is invisible", async function (assert) {
		// Prepare
		var oFileUploader = new FileUploader(),
			file = new File(["test"], "test.txt", {
				type: "text/plain"
			});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oFileInput = oFileUploader.getDomRef("fu");

		// Simulate file selection
		var oTransfer = new DataTransfer();
		oTransfer.items.add(file);
		oFileInput.files = oTransfer.files;
		oFileUploader.setValue(file.name);
		await nextUIUpdate();

		// Assert file is selected
		assert.equal(oFileUploader.getValue(), "test.txt", "File name is set correctly");
		assert.equal(oFileInput.files.length, 1, "File is selected");

		// Hide the FileUploader
		oFileUploader.setVisible(false);
		await nextUIUpdate();

		// Act - clear the value while invisible
		oFileUploader.setValue("");
		await nextUIUpdate();

		// Assert - both value and file selection should be cleared
		assert.equal(oFileUploader.getValue(), "", "Value is cleared");
		assert.equal(oFileInput.files.length, 0, "File selection is cleared even though FileUploader is invisible");

		// Cleanup
		oFileUploader.destroy();
	});

	/**
	 * Test private functions
	 */
	QUnit.module("private functions");
	QUnit.test("Testing sending passed files with XHR", async function (assert) {
		var oFileUploader = createFileUploader(),
			bIsExecutedInFireFox = Device.browser.firefox,
			aFiles = {
				"0": createFakeFile({
					name:"FileUploader.qunit.html",
					type:"text/html",
					size:404450
				}, bIsExecutedInFireFox),
				"1": createFakeFile({
					name:"FileUploader2.qunit.html",
					type:"text/html",
					size:404450
				}, bIsExecutedInFireFox),
				"length" : 2
			},
			oSpy = this.spy(window.XMLHttpRequest.prototype, "send");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oFileUploader._sendFilesWithXHR(aFiles);

		assert.ok(oSpy.called, "XHR request is made");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("BCP: 1770523801 - FormData.append called with third argument fails under Safari browser if passed file " +
			"is not a Blob", async function (assert) {
		// Arrange
		var oFileUploader = createFileUploader(),
			sExpectedFileName = "FileUploader.qunit.html",
			oFormData = new window.FormData(),
			oBlob,
			oMSBlobBuilder,
			aFiles,
			oFile = createFakeFile({
				name: "FileUploader.qunit.html",
				type: "text/html",
				size: 404450
			}, false /* In this test we always pass a Blob object */),
			oAppendFileSpy = this.spy(oFileUploader, "_appendFileToFormData"),
			oAppendSpy = this.spy(oFormData, "append");

		// NOTE: To create a Blob in Internet Explorer we have to use MSBlobBuilder when available because
		// normal window.Blob constructor will fail.
		if (window.MSBlobBuilder) {
			oMSBlobBuilder = new window.MSBlobBuilder();
			oMSBlobBuilder.append(oFile);
			oBlob = oMSBlobBuilder.getBlob();
		} else {
			oBlob = new window.Blob([oFile]);
		}

		// Mock array like object with file as a Blob
		aFiles = {
			"0": oBlob,
			"length" : 1
		};

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act - send files to make sure _appendFileToFormData method is used
		oFileUploader._sendFilesWithXHR(aFiles);

		// Assert
		assert.strictEqual(oAppendFileSpy.callCount, 1, "_sendFilesWithXHR calls internally _appendFileToFormData.");

		// Act - Send a Blob object without a name
		oFileUploader._appendFileToFormData(oFormData, 'test', oBlob);

		// Assert
		assert.strictEqual(oAppendSpy.getCall(0).args.length, 2,
				"FormData.append method is called with only two parameters when the Blob object has no 'name' property");

		// Act - add name property to the oBlob object
		oAppendSpy.resetHistory();
		oBlob.name = sExpectedFileName;
		oFileUploader._appendFileToFormData(oFormData, 'test', oBlob);

		// Assert
		assert.strictEqual(oAppendSpy.getCall(0).args.length, 3,
				"FormData.append method is called with three parameters");

		assert.strictEqual(oAppendSpy.getCall(0).args[2], sExpectedFileName,
				"The third parameter passed to FormData.append equals the expected file name.");

		// Cleanup
		oAppendFileSpy.restore();
		oAppendSpy.restore();
		oFileUploader.destroy();
	});

	QUnit.test("Testing the filename length handling - _isFilenameTooLong", function (assert) {
		//setup
		var oFileUploader = createFileUploader({
			maximumFilenameLength: 5
		});

		//initial check cases
		assert.ok(oFileUploader._isFilenameTooLong("15_AppDev_Components_Exercises.pptx"), "Initial check: Filename should be too long");

		//standard case
		oFileUploader.setMaximumFilenameLength(20);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should NOT be too long");

		oFileUploader.setMaximumFilenameLength(10);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), true, "Filename should be too long");

		//edge cases
		oFileUploader.setMaximumFilenameLength(15);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should NOT be too long");

		oFileUploader.setMaximumFilenameLength(14);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), true, "Filename should be too long");

		oFileUploader.setMaximumFilenameLength(-4);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), true, "Filename should be too long");

		oFileUploader.setMaximumFilenameLength();
		assert.equal(oFileUploader.getMaximumFilenameLength(), 0, "setMaximumFilenameLength() --> maximumFilenameLength should be 0 (default)");
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should be too long");

		oFileUploader.setMaximumFilenameLength(null);
		assert.equal(oFileUploader.getMaximumFilenameLength(), 0, "setMaximumFilenameLength(null) --> maximumFilenameLength should be 0 (default)");
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should be too long");

		var undefinedVariable;
		oFileUploader.setMaximumFilenameLength(undefinedVariable);
		assert.equal(oFileUploader.getMaximumFilenameLength(), 0, "setMaximumFilenameLength(undefined) --> maximumFilenameLength should be 0 (default)");
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should be too long");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Change event listener is reattached to the rerendered inner input field", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader(),
			oChangeHandlerSpy = this.spy(oFileUploader, "handlechange"),
			oCacheDOMEls;
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		oCacheDOMEls = this.spy(oFileUploader, "_cacheDOMEls");

		// act
		oFileUploader.setMultiple(false);
		oFileUploader.oFileUpload.dispatchEvent(createNewEvent("change"));

		// assert
		assert.ok(oChangeHandlerSpy.calledOnce, "Change handler is attached");
		assert.ok(oCacheDOMEls.calledOnce, "Elements are cached");

		// clean
		oFileUploader.destroy();
	});

	QUnit.test("Drop file over the browse button", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader({ buttonOnly: true });
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oEventParams = {
			originalEvent: {
				dataTransfer: {
					files: new DataTransfer().files
				}
			},
			preventDefault: () => {},
			stopPropagation: () => {}
		};
		var oHandleChangeSpy = this.spy(oFileUploader, "handlechange");
		var oPreventDefaultSpy = this.spy(oEventParams, "preventDefault");
		var oStopPropagationSpy = this.spy(oEventParams, "stopPropagation");

		// act
		qutils.triggerEvent("drop", oFileUploader.oBrowse.getId(), oEventParams);

		// assert
		assert.ok(oPreventDefaultSpy.calledOnce, "The default is prevented");
		assert.ok(oStopPropagationSpy.calledOnce, "The default is prevented");
		assert.ok(oHandleChangeSpy.calledOnce, "Change event is triggered");

		// clean
		oFileUploader.destroy();
		oHandleChangeSpy.restore();
		oPreventDefaultSpy.restore();
	});

	QUnit.test("Input type file element has the proper events registered", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader({ buttonOnly: true });
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oEvents = jQuery._data(oFileUploader.oBrowse.getDomRef(), "events");
		// assert
		assert.ok(oEvents.mouseover, "mouseover registed");
		assert.strictEqual(oEvents.mouseover.length, 1, "mouseover registed once");
		assert.ok(oEvents.click, "click registed");
		assert.strictEqual(oEvents.click.length, 1, "click registed once");
		assert.ok(oEvents.dragover, "dragover registed");
		assert.strictEqual(oEvents.dragover.length, 1, "dragover registed once");
		assert.ok(oEvents.dragenter, "dragenter registed");
		assert.strictEqual(oEvents.dragenter.length, 1, "dragenter registed once");
		assert.ok(oEvents.drop, "drop registed");
		assert.strictEqual(oEvents.drop.length, 1, "drop registed once");

		// clean
		oFileUploader.destroy();
	});

	QUnit.module("BlindLayer", {
		beforeEach: async function() {
			this.oFileUploader = createFileUploader();

			//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
			this.oFileUploader.placeAt("qunit-fixture");
			await nextUIUpdate();
		},

		afterEach: function() {
			this.oFileUploader.destroy();
		}
	});

	QUnit.test("Check if BlindLayer is in DOM", function(assert) {
		var $Frame = this.oFileUploader.$("frame");

		var oParentRef = $Frame.parent().get(0);
		var oStatic = StaticArea.getDomRef();

		assert.equal($Frame.length, 1, "iFrame was inserted into DOM");
		assert.equal(oParentRef, oStatic, "FileUploader's Blindlayer UI-area is the static UI-area");

		assert.equal($Frame.css("display"), "none", "Blindlayer is 'display:none'");
	});

	QUnit.test("File uploader browse button has stable ID", function (assert) {
		var sBrowseButtonSuffix = "-fu_button";

		// assert
		assert.strictEqual(
			this.oFileUploader.oBrowse.getId(),
			this.oFileUploader.getId()  + sBrowseButtonSuffix,
			"Browse button ID is stable"
		);
	});

	QUnit.test("getFocusDomRef returns the proper element", function(assert) {
		// assert
		assert.strictEqual(
			this.oFileUploader.getFocusDomRef().id,
			this.oFileUploader.getId() + "-fu",
			"Hidden input type='file' returned"
		);
	});

	QUnit.module("Keyboard handling");

	QUnit.test("ESCAPE key propagation", async function (assert) {
		var oFileUploader = createFileUploader(),
			oMockEscapePress = {
				keyCode: 27,
				stopPropagation: function() {},
				preventDefault: function () {}
			},
			stopPropagationSpy = this.spy(oMockEscapePress, "stopPropagation");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oFileUploader.onkeydown(oMockEscapePress);

		assert.strictEqual(stopPropagationSpy.callCount, 0, "stopPropagation shouldn't be fired on ESCAPE key press");

		oFileUploader.destroy();
	});

	QUnit.test("Browse logic is fired correctly", async function (assert) {
		// Prepare
		var oFileUploader = createFileUploader().placeAt("qunit-fixture"),
			oFakeEvent = {
				keyCode: 32, // space
				stopPropagation: function() {},
				preventDefault: function () {}
			},
			oClickSpy;

		await nextUIUpdate();
		oClickSpy = this.spy(oFileUploader.oFileUpload, "click");

		// Act
		oFileUploader.onkeydown(oFakeEvent);
		oFileUploader.onkeyup(oFakeEvent);

		// Assert
		assert.strictEqual(oClickSpy.callCount, 1, "SPACE key executes click on the browse button on key up");

		//Prepare
		oFakeEvent.keyCode = 13; // enter

		// Act
		oFileUploader.onkeydown(oFakeEvent);
		oFileUploader.onkeyup(oFakeEvent);

		// Assert
		assert.strictEqual(oClickSpy.callCount, 2, "ENTER key executes click on the browse button on key down");

		// Clean
		oFileUploader.destroy();
	});

	QUnit.test("prototype.openFilePicker", async function(assert) {
		// Prepare
		var oFU = new FileUploader();
		oFU.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oElementClickSpy = this.spy(oFU.getInputReference(), "click");

		// Act
		oFU.openFilePicker();

		// Assert
		assert.ok(oElementClickSpy.calledOnce, "File picker is opened.");

		// Clean
		oFU.destroy();
	});

	QUnit.test("prototype.getInputReference", async function(assert) {
		// Prepare
		var oFU = new FileUploader();
		oFU.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		// Assert
		assert.deepEqual(oFU.getInputReference(), oFU.getDomRef().querySelector("[type='file']"), "Proper input reference gets returned");

		// Clean
		oFU.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("AriaLabelledBy", async function(assert) {
		// setup
		var sPrefix = "lbl-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
		var oFileUploader = new FileUploader(sPrefix + "-fu"),
			oLabel = new Label({ text: "label for", labelFor: oFileUploader.getId() }),
			aLabelledBy = [
				new Text(sPrefix + "-l1", { text: "Labelled by 1" }),
				new Text(sPrefix + "-l2", { text: "Labelled by 2" }),
				new Text(sPrefix + "-l3", { text: "Labelled by 3" })
			];

		// render helpers and control
		oLabel.placeAt("qunit-fixture");
		aLabelledBy.forEach(function(oControl){ oControl.placeAt("qunit-fixture"); });
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		aLabelledBy.forEach(function(oControl){ oFileUploader.addAriaLabelledBy(oControl.getId()); });
		await nextUIUpdate();

		// assert
		assert.strictEqual(oFileUploader.getAriaLabelledBy().length, 3, "All three aria label IDs are added");

		// act/remove
		oFileUploader.removeAriaLabelledBy(aLabelledBy[1].getId());
		await nextUIUpdate();
		assert.strictEqual(oFileUploader.getAriaLabelledBy().length, 2, "One ID removed");
		assert.ok(oFileUploader.getAriaLabelledBy().indexOf(aLabelledBy[1].getId()) === -1, "Removed ID not present");

		// act/remove all
		oFileUploader.removeAllAriaLabelledBy();
		await nextUIUpdate();
		assert.strictEqual(oFileUploader.getAriaLabelledBy().length, 0, "All label IDs removed");

		// cleanup
		oLabel.destroy();
		aLabelledBy.forEach(function(oControl){ oControl.destroy(); });
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("ariaLabel: button-only file uploader", async function(assert) {
		// setup
		const oFileUploader = new FileUploader({
			buttonOnly: true
		});
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		const sExpectedTooltip = oFileUploader._getBrowseIconTooltip();
		assert.strictEqual(
			oFileUploader.oFileUpload.getAttribute("title"),
			sExpectedTooltip,
			"Input type file has the same default tooltip as the button"
		);
		assert.strictEqual(
			oFileUploader.oBrowse.getTooltip(),
			sExpectedTooltip,
			"Browse button has the expected default tooltip"
		);

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("AriaDescribedBy", async function(assert) {
		// setup
		var sPrefix = "desc-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
		var oFileUploader = new FileUploader(sPrefix + "-fu"),
			oLabel = new Label({ text: "label for", labelFor: oFileUploader.getId() }),
			aDescribedBy = [
				new Text(sPrefix + "-d1", { text: "Described by 1" }),
				new Text(sPrefix + "-d2", { text: "Described by 2" }),
				new Text(sPrefix + "-d3", { text: "Described by 3" })
			];

		// render helpers and control
		oLabel.placeAt("qunit-fixture");
		aDescribedBy.forEach(function(oControl){ oControl.placeAt("qunit-fixture"); });
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		aDescribedBy.forEach(function(oControl){ oFileUploader.addAriaDescribedBy(oControl.getId()); });
		await nextUIUpdate();

		// assert
		assert.strictEqual(oFileUploader.getAriaDescribedBy().length, 3, "All three description IDs are added");

		// act/remove
		oFileUploader.removeAriaDescribedBy(aDescribedBy[1].getId());
		await nextUIUpdate();
		assert.strictEqual(oFileUploader.getAriaDescribedBy().length, 2, "One ID removed");
		assert.ok(oFileUploader.getAriaDescribedBy().indexOf(aDescribedBy[1].getId()) === -1, "Removed ID not present");

		// act/remove all
		oFileUploader.removeAllAriaDescribedBy();
		await nextUIUpdate();
		assert.strictEqual(oFileUploader.getAriaDescribedBy().length, 0, "All IDs removed");

		// cleanup
		oLabel.destroy();
		aDescribedBy.forEach(function(oControl){ oControl.destroy(); });
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Browse button tooltip", async function(assert) {
		var oFileUploader = new FileUploader({
				buttonOnly: true,
				buttonText: "Something"
			}),
			sTooltip = oFileUploader.getTooltip_AsString() || oFileUploader._getBrowseIconTooltip();

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oFileUploader.oBrowse.getTooltip(), sTooltip,
				"Once FileUploader becomes icon-only, then it should contain just the 'Browse...' text");

		oFileUploader.destroy();
	});

	QUnit.test("Description for default FileUploader", async function (assert) {
		// use a unique control id to avoid collisions between runs
		var sId = "fu-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
		var oFileUploader = new FileUploader(sId),
			oRB = Library.getResourceBundleFor("sap.ui.unified");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// find the description inside the control DOM only
		var $description = oFileUploader.$().find("#" + oFileUploader.getId() + "-AccDescr");
		assert.strictEqual($description.text(), oRB.getText("FILEUPLOADER_ACC_TEXT"), "Description contains information just for activating.");

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Description for FileUploader with tooltip and placeholder", async function (assert) {
		var sId = "fu-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
		var oFileUploader = new FileUploader(sId, {
				tooltip: "the-tooltip",
				placeholder: "the-placeholder"
			}),
			oRB = Library.getResourceBundleFor("sap.ui.unified");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// read the description only from this control's DOM
		var sDescriptionText = oFileUploader.$().find("#" + oFileUploader.getId() + "-AccDescr").text();
		assert.ok(sDescriptionText.indexOf(oRB.getText("FILEUPLOADER_ACC_TEXT")) !== -1, "Activation information is placed in the description");
		assert.ok(sDescriptionText.indexOf("the-tooltip") !== -1, "FileUploader's tooltip is in the description");
		assert.ok(sDescriptionText.indexOf("the-placeholder") !== -1, "FileUploader's placeholder is in the description");

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Description for FileUploader after tooltip update", async function (assert) {
		var sInitialTooltip = "initial-tooltip",
			sUpdatedTooltip = "updated-tooltip",
			sId = "fu-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
			oFileUploader = new FileUploader(sId, {
				tooltip: sInitialTooltip
			});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act - update tooltip and wait for rendering
		oFileUploader.setTooltip(sUpdatedTooltip);
		await nextUIUpdate();

		// Assert - query the description only inside this control DOM
		var sAccDescription = oFileUploader.$().find("#" + oFileUploader.getId() + "-AccDescr").html();
		assert.ok(sAccDescription.indexOf(sInitialTooltip) === -1, "FileUploader's initial tooltip isn't in the description");
		assert.ok(sAccDescription.indexOf(sUpdatedTooltip) !== -1, "FileUploader's updated tooltip is in the description");

		// Cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Description for FileUploader after placeholder update", async function (assert) {
		var sInitialPlaceholder = "initial-placeholder",
			sUpdatedPlaceholder = "updated-placeholder",
			sId = "fu-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
			oFileUploader = new FileUploader(sId, {
				placeholder: sInitialPlaceholder
			});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oFileUploader.setPlaceholder(sUpdatedPlaceholder);
		await nextUIUpdate();

		// Assert - query description only inside this control's DOM
		var sAccDescription = oFileUploader.$().find("#" + oFileUploader.getId() + "-AccDescr").html();
		assert.ok(sAccDescription.indexOf(sInitialPlaceholder) === -1, "FileUploader's initial placeholder isn't in the description");
		assert.ok(sAccDescription.indexOf(sUpdatedPlaceholder) !== -1, "FileUploader's updated placeholder is in the description");

		// Cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Description for required FileUploader", async function (assert) {
		// use unique id to avoid collisions across test runs
		var sId = "fu-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
		var oLabel = new Label({ text: "Label", labelFor: sId, required: true });
		var oFileUploader = new FileUploader(sId);

		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// get the native input element belonging to this control
		var oInput = oFileUploader.getInputReference();
		assert.ok(oInput && oInput.hasAttribute("required"), "'required' attribute is added in the hidden input type='file' element");

		// cleanup
		oLabel.destroy();
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("External label reference", function(assert) {
		// setup
		var oFileUploader = new FileUploader("fu");

		// assert
		assert.strictEqual(oFileUploader.getIdForLabel(), "fu-fu", "The file uploader id is used for external label references");
	});

	QUnit.test("Change event firing", async function (assert){
		var oFileUploader = new FileUploader({
				sameFilenameAllowed: true,
				sendXHR: true,
				uploadOnChange: true
			}),
			oFireChangeSpy = this.spy(oFileUploader, "fireChange"),
			oFile = new File(['Hello world!'], 'hello.txt', {type: 'text/plain'}),
			oDataTransfer = new DataTransfer();

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oDataTransfer.items.add(oFile);
		var oEventParams = {
			originalEvent: {
				dataTransfer: {
					files: oDataTransfer.files
				}
			},
			preventDefault: () => {},
			stopPropagation: () => {}
		};

		// act
		qutils.triggerEvent("drop", oFileUploader.getId(), oEventParams);

		assert.ok(oFireChangeSpy.calledOnce, "Change event is fired once.");

		//Clean up
		oFileUploader.destroy();
	});



	//IE has no Event constructor
	function createNewEvent(eventName) {
		var oEvent;
		if (typeof (Event) === 'function') {
			oEvent = new Event(eventName);
		} else {
			oEvent = document.createEvent('Event');
			oEvent.initEvent(eventName, true, true);
		}
		return oEvent;
	}

	QUnit.module("Tokenizer", {
		beforeEach: async function() {
		},
		afterEach: async function() {
			await nextUIUpdate();
		}
	});

	QUnit.test("tokens created from selected files", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader({ multiple: true });
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// populate tokens
		addFilesToFileUploaderTokenizer(oFileUploader, ["a.txt", "b.txt"]);
		await nextUIUpdate();

		// assert
		var oTokenizer = oFileUploader._getTokenizer();
		var aTokens = oTokenizer.getTokens();
		assert.strictEqual(aTokens.length, 2, "Tokenizer contains two tokens");
		assert.strictEqual(aTokens[0].getText(), "a.txt", "First token text is the first filename");
		assert.strictEqual(aTokens[1].getText(), "b.txt", "Second token text is the second filename");

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("tokens created from selected files containing curly braces", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader({ multiple: true });
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// populate tokens with curly braces
		addFilesToFileUploaderTokenizer(oFileUploader, ["{a}.txt", "prefix_{b}_suffix.txt"]);
		await nextUIUpdate();

		// assert
		var oTokenizer = oFileUploader._getTokenizer();
		var aTokens = oTokenizer.getTokens();
		assert.strictEqual(aTokens.length, 2, "Tokenizer contains two tokens");
		assert.strictEqual(aTokens[0].getText(), "{a}.txt", "First token text preserves curly braces");
		assert.strictEqual(aTokens[0].getTooltip(), "{a}.txt", "First token tooltip preserves curly braces");
		assert.strictEqual(aTokens[1].getText(), "prefix_{b}_suffix.txt", "Second token text preserves curly braces");
		assert.strictEqual(aTokens[1].getTooltip(), "prefix_{b}_suffix.txt", "Second token tooltip preserves curly braces");

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("tokens cleared when clear() is called", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader({ multiple: true });
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// populate tokens
		addFilesToFileUploaderTokenizer(oFileUploader, ["a.txt", "b.txt"]);
		await nextUIUpdate();

		var oTokenizer = oFileUploader._getTokenizer();
		assert.ok(oTokenizer.getTokens().length >= 2, "Tokenizer populated before clear");

		// act
		oFileUploader.clear();
		await nextUIUpdate();

		// assert
		assert.strictEqual(oTokenizer.getTokens().length, 0, "Tokenizer is empty after clear()");

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Focus in/out of Tokenizer on Arrow Right/Left", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader({ multiple: true }),
			oMockArrowRightPress = {
				keyCode: 39,
				preventDefault: function() {}
			},
			oMockArrowLeftPress = {
				keyCode: 37,
				preventDefault: function() {},
				isMarked: function() { return true; }
			},
			oDelegate = {
				onfocusin: function () {
					// assert - first token should have tabindex 0 and control state updated
					var oFirstToken = oTokenizer.getTokens()[0].getDomRef();
					assert.ok(oFileUploader._bTokenizerFocus, "_bTokenizerFocus is true after pressing of Arrow Right");
					assert.strictEqual(document.activeElement, oFirstToken, "First token is focused after pressing of Arrow Right");
				},
				onsapfocusleave: function () {
					assert.notOk(oFileUploader._bTokenizerFocus, "_bTokenizerFocus is false after pressing of Arrow Left");
					assert.strictEqual(document.activeElement, oFileUploader.oFileUpload, "Internal hidden input type='file' is focused after pressing of Arrow Left");
				}
			};

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// populate tokens
		addFilesToFileUploaderTokenizer(oFileUploader, ["a.txt", "b.txt"]);
		await nextUIUpdate();

		var oTokenizer = oFileUploader._getTokenizer();
		oTokenizer.addDelegate(oDelegate);
		oFileUploader.focus();
		await nextUIUpdate();

		// assert initial state
		assert.notOk(oFileUploader._bTokenizerFocus, "_bTokenizerFocus is initially false");
		assert.strictEqual(document.activeElement, oFileUploader.oFileUpload, "Internal hidden input type='file' is initially focused");

		// act - simulate Arrow Right press to focus first token
		oFileUploader.onsapnext(oMockArrowRightPress);
		await nextUIUpdate();

		// act - simulate Arrow Left press to focus back the FileUploader
		oFileUploader.onsapprevious(oMockArrowLeftPress);
		await nextUIUpdate();

		// cleanup
		oFileUploader.destroy();
		await nextUIUpdate();
	});

	QUnit.test("expands on FileUploader focus and collapses on focus out (asserts in tokenizer onAfterRendering)", async function (assert) {

		var oButton = new Button({
			text: "Button Before File Uploader"
		});
		oButton.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oFileUploader = new FileUploader({ multiple: true });
		// oFileUploader.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// populate tokens
		addFilesToFileUploaderTokenizer(oFileUploader, ["a.txt", "b.txt", "c.txt", "d.txt"]);
		await nextUIUpdate();
		var oTokenizer = oFileUploader._getTokenizer();

		// act - ensure focus is outside FileUploader
		oButton.focus();

		// assert initial state
		assert.strictEqual(oTokenizer.getRenderMode(), "Narrow", "Tokenizer is initially in Narrow mode when not focused");

		// act - focus FileUploader
		oFileUploader.focus();
		await nextUIUpdate();

		// assert expanded state
		assert.strictEqual(oTokenizer.getRenderMode(), "Loose", "Tokenizer is in Loose mode when focused");

		// act - ensure focus is outside FileUploader
		oButton.focus();

		// assert collapsed state
		assert.strictEqual(oTokenizer.getRenderMode(), "Narrow", "Tokenizer is in Narrow mode when not focused");

		// cleanup
		oFileUploader.destroy();
		oButton.destroy();
		await nextUIUpdate();
	});
});