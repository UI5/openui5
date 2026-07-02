/*global QUnit*/
sap.ui.define(["sap/ui/core/Element", "sap/ui/test/utils/nextUIUpdate", "sap/ui/thirdparty/jquery", "sap/m/Label", "sap/m/Text", "sap/f/DynamicPageHeader", "sap/uxap/ObjectPageDynamicHeaderTitle", "sap/uxap/ObjectPageLayout", "sap/uxap/testblocks/GenericDiv", "sap/ui/core/mvc/XMLView"],
function(Element, nextUIUpdate, jQuery, Label, Text, DynamicPageHeader, ObjectPageDynamicHeaderTitle, ObjectPageLayout, GenericDiv, XMLView) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeaderContent",
				viewName: "view.UxAP-ObjectPageHeaderContent"
			}).then(async (oView) => {
				this.contentView = oView;
				this.contentView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("Should render the HeaderContent div", function (assert) {
		assert.ok(this.contentView.$().find(".sapUxAPObjectPageHeaderContent"), "HeaderContent div is rendered");
	});

	QUnit.test("Should render the title inside HeaderContent when showTitleInHeaderContent is enabled", function (assert) {
		assert.ok(this.contentView.$().find(".sapUxAPObjectPageHeaderIdentifierTitleInContent"), "Title is rendered inside the HeaderContent");
	});

	QUnit.test("Should render the edit header button inside HeaderContent when showEditHeaderButton is set", async function(assert) {
		assert.expect(2);
		// Arrange
		const oPl = this.contentView.byId("ObjectPageLayout");

		// Act
		oPl.setShowEditHeaderButton(true);
		await nextUIUpdate();

		// Assert
		let aEditHeaderBtn = oPl._getHeaderContent().$().find('#UxAP-ObjectPageHeaderContent--ObjectPageLayout-OPHeaderContent-editHeaderBtn');
		assert.ok(aEditHeaderBtn.length === 1, "button is rendered inside the HeaderContent");

		// Act - re-render
		oPl.invalidate();
		await nextUIUpdate();
		aEditHeaderBtn = oPl._getHeaderContent().$().find('#UxAP-ObjectPageHeaderContent--ObjectPageLayout-OPHeaderContent-editHeaderBtn');

		// Assert
		assert.ok(aEditHeaderBtn.length === 1, "button is rendered inside the HeaderContent after rerender");
	});

	QUnit.module("ObjectPageHeaderContent integration inside ObjectPageLayout", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeaderContent",
				viewName: "view.UxAP-ObjectPageHeaderContent"
			}).then(async (oView) => {
				this.contentView = oView;
				this.contentView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("Should generate unique IDs for title and subtitle in header and content", function (assert) {
		const sId = "#UxAP-ObjectPageHeaderContent--headerForTest";

		assert.strictEqual(jQuery(sId + "-title").length, 1, "Title in header ID is unique");
		assert.strictEqual(jQuery(sId + "-title-content").length, 1, "Title in content ID is unique");
		assert.strictEqual(jQuery(sId + "-innerTitle").length, 1, "Inner title in header ID is unique");
		assert.strictEqual(jQuery(sId + "-innerTitle-content").length, 1, "Inner title in content ID is unique");
		assert.strictEqual(jQuery(sId + "-subtitle").length, 1, "Subtitle in header ID is unique");
		assert.strictEqual(jQuery(sId + "-subtitle-content").length, 1, "Subtitle in content ID is unique");
	});

	QUnit.test("Should return correct index for a nested control via indexOfHeaderContent", function (assert) {
		// Arrange
		const oPage = this.contentView.byId("ObjectPageLayout");
		const oNestedControl = Element.getElementById("UxAP-ObjectPageHeaderContent--testLink");

		// Assert
		assert.equal(oPage.indexOfHeaderContent(oNestedControl), 0, "the Link inside the ContentHeader aggregation is on 0 position");
		assert.strictEqual(oNestedControl.getParent().getId(), oPage.getId(), "control parent is correct");
	});

	QUnit.test("Should insert a control at the correct position via insertHeaderContent", async function(assert) {
		assert.expect(3);
		// Arrange
		const oPage = this.contentView.byId("ObjectPageLayout");
		const oControl = new Label({id: "label1", text: "label1"});

		// Act
		oPage.insertHeaderContent(oControl, 1);
		await nextUIUpdate();

		// Assert
		assert.equal(oPage.getHeaderContent().length, 5, "contents length is 5 after inserting element in the HeaderContent aggregation");
		assert.equal(oPage.indexOfHeaderContent(Element.getElementById("label1")), 1, "the label1 inside the ContentHeader aggregation is insert on 1 position");
		assert.strictEqual(oControl.getParent().getId(), oPage.getId(), "control parent is correct");
	});

	QUnit.test("Should append a control to the end via addHeaderContent", async function(assert) {
		assert.expect(3);
		// Arrange
		const oPage = this.contentView.byId("ObjectPageLayout");
		const oControl = new Label({id: "label2", text: "label2"});

		// Act
		oPage.addHeaderContent(oControl);
		await nextUIUpdate();

		// Assert
		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 5, "contents length is 5 after inserting element in the HeaderContent aggregation");
		assert.equal(this.contentView.byId("ObjectPageLayout").indexOfHeaderContent(Element.getElementById("label2")), 4, "the label2 inside the ContentHeader aggregation is added on the last position");
		assert.strictEqual(oControl.getParent().getId(), oPage.getId(), "control parent is correct");
	});

	QUnit.test("Should remove a specific control via removeHeaderContent and nullify its parent", async function(assert) {
		assert.expect(2);
		// Arrange
		const oPage = this.contentView.byId("ObjectPageLayout");
		const oToRemove = this.contentView.byId("testLink");

		// Act
		oPage.removeHeaderContent(oToRemove);
		await nextUIUpdate();

		// Assert
		assert.equal(oPage.getHeaderContent().length, 3, "contents length is 5 after removing one item");
		assert.strictEqual(oToRemove.getParent(), null, "control parent is correct");

		//cleanup needed since we removed that item from its parent aggregation
		oToRemove.destroy();
	});

	QUnit.test("Should remove all controls via removeAllHeaderContent and nullify their parents", async function(assert) {
		assert.expect(5);
		// Act
		const oRemovedContent = this.contentView.byId("ObjectPageLayout").removeAllHeaderContent();
		await nextUIUpdate();

		// Assert
		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 0, "contents length is 0 after removing it all");

		oRemovedContent.forEach((oItem) => {
			assert.strictEqual(oItem.getParent(), null, "control parent is correct");
		});
		//cleanup needed since we removed those items from their parent aggregation
		oRemovedContent.forEach((oItem) => { oItem.destroy(); });
	});

	QUnit.test("Should destroy all header content controls via destroyHeaderContent", async function(assert) {
		assert.expect(1);
		// Arrange
		this.contentView.byId("ObjectPageLayout").addHeaderContent(new Label({id: "label3", text: "label3"}));
		await nextUIUpdate();

		// Act
		this.contentView.byId("ObjectPageLayout").destroyHeaderContent();
		await nextUIUpdate();

		// Assert
		assert.equal(this.contentView.byId("ObjectPageLayout").getHeaderContent().length, 0, "contents length is 0 after destroying HeaderContent");
	});

	QUnit.test("pin button icon is updated when header is snapped", async function(assert) {
		assert.expect(2);
		// Arrange
		const oHeaderTitle = new ObjectPageDynamicHeaderTitle();
		const oPage = new ObjectPageLayout({
			headerContentPinned: true,
			headerTitle: oHeaderTitle,
			headerContent: [new Text({text: "test"})]
		});
		oPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		const fnSpy = this.spy(oPage._getHeaderContent(), "_togglePinButton");
		oPage._handleDynamicTitlePress();

		// Assert
		assert.ok(fnSpy.calledWith(false), "Pin button is toggled to unpinned state");
		assert.strictEqual(oPage._getHeaderContent().getAggregation("_pinButton").getIcon() === DynamicPageHeader.UNPRESSED_PIN_ICON, true,
			"Pin button icon is updated to unpinned state");

		oPage.destroy();
	});

	QUnit.module("Dynamic Header State Preserved On Scroll", {
		beforeEach: async function() {
			this.oObjectPageWithPreserveHeaderStateOnScroll = new ObjectPageLayout({
				preserveHeaderStateOnScroll: true
			});
			this.oObjectPageWithPreserveHeaderStateOnScroll.setHeaderTitle(new ObjectPageDynamicHeaderTitle());
			this.oObjectPageWithPreserveHeaderStateOnScroll.addHeaderContent(new Text({text: "test"}));
			this.oObjectPageWithPreserveHeaderStateOnScroll.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oObjectPageWithPreserveHeaderStateOnScroll.destroy();
			this.oObjectPageWithPreserveHeaderStateOnScroll = null;
		}
	});

	QUnit.test("Dynamic Header rendered within Header Wrapper", function (assert) {
		// Arrange
		const $headerWrapper = this.oObjectPageWithPreserveHeaderStateOnScroll.$("headerTitle");
		const sHeaderId = this.oObjectPageWithPreserveHeaderStateOnScroll._getHeaderContent().getId();

		// Assert
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The Header is in the Header Title Wrapper");
	});

	QUnit.test("Dynamic Pin button is hidden", function (assert) {
		// Arrange
		const $pinButtonDom = this.oObjectPageWithPreserveHeaderStateOnScroll._getHeaderContent().getAggregation("_pinButton").getDomRef();

		// Assert
		assert.equal($pinButtonDom, null, "The Dynamic Header Pin Button not rendered");
	});

	QUnit.test("Dynamic Header with exceeding height override 'preserveHeaderStateOnScroll' property", function (assert) {
		const oObjectPage = this.oObjectPageWithPreserveHeaderStateOnScroll;

		// Setup header too big to be preserved in the title area
		oObjectPage.$().height(1000);
		oObjectPage.getHeaderTitle().$().height(300);
		oObjectPage._getHeaderContent().$().height(300);
		oObjectPage._bHeaderBiggerThanAllowedHeight = false;
		// Act
		oObjectPage._overridePreserveHeaderStateOnScroll();

		assert.strictEqual(oObjectPage._bHeaderBiggerThanAllowedHeight, true, "flag is updated");
		assert.strictEqual(oObjectPage._preserveHeaderStateOnScroll(), false, "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		// Setup header ok to be preserved in the title area
		oObjectPage.$().height(1000);
		oObjectPage.getHeaderTitle().$().height(200);
		oObjectPage._getHeaderContent().$().height(200);

		// Act
		oObjectPage._overridePreserveHeaderStateOnScroll();

		assert.strictEqual(oObjectPage._bHeaderBiggerThanAllowedHeight, false, "flag is updated");
		assert.strictEqual(oObjectPage._preserveHeaderStateOnScroll(), true, "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	QUnit.module("Header content initialization");

	QUnit.test("Should apply showHeaderContent:false before rendering without errors", function (assert) {
		// Arrange
		const oObjectPage = new ObjectPageLayout({
			showHeaderContent: false
		});

		// Assert
		assert.equal(oObjectPage.getShowHeaderContent(), false, "The value is applied");

		oObjectPage.destroy();
	});

	QUnit.module("ObjectPageLayout content resize", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeaderContent",
				viewName: "view.UxAP-ObjectPageHeaderContent"
			}).then(async (oView) => {
				this.contentView = oView;
				this.contentView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.contentView.destroy();
		}
	});

	QUnit.test("Should invoke the resize listener when header content size changes", async function(assert) {
		assert.expect(1);
		// Arrange
		const oObjectPageLayout = this.contentView.byId("ObjectPageLayout");
		const oResizableControl = new GenericDiv({height: "100px"});
		const done = assert.async();
		let bResizeListenerCalled = false;

		oObjectPageLayout.removeAllHeaderContent();
		oObjectPageLayout.addHeaderContent(oResizableControl);

		// proxy the resize listener to check if called
		const fnOrig = oObjectPageLayout._onUpdateContentSize;
		oObjectPageLayout._onUpdateContentSize = function() {
			bResizeListenerCalled = true;
			fnOrig.apply(this, arguments);
		};

		await nextUIUpdate();

		// wait for the point where the listener is internally attached
		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// act
			oResizableControl.getDomRef().style.height = "10px"; //decrease height of content
			setTimeout(function() {
				// check
				assert.ok(bResizeListenerCalled, "_onUpdateContentSize method is called");
				done();
			}, 500 /* wait for resizeHandler to be triggered */);
		});
	});
});
