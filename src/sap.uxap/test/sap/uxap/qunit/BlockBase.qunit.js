/*global QUnit */

sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Control",
	"sap/m/Shell",
	"sap/ui/core/Element",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/uxap/BlockBase",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/uxap/library"
],
function(ComponentContainer, Control, Shell, Element, nextUIUpdate, BlockBase, ObjectPageLayout, ObjectPageSection, ObjectPageSubSection, View, XMLView, Controller, JSONModel, library) {
	"use strict";

	// shortcut for sap.uxap.BlockBaseFormAdjustment
	const BlockBaseFormAdjustment = library.BlockBaseFormAdjustment;

	/**
	 * Returns a Promise that resolves after the ObjectPageLayout fires onAfterRenderingDOMReady.
	 * @param {sap.uxap.ObjectPageLayout} oOPL
	 * @returns {Promise<void>}
	 */
	function waitForDOMReady(oOPL) {
		return new Promise((resolve) => {
			oOPL.attachEventOnce("onAfterRenderingDOMReady", resolve);
		});
	}

	QUnit.module("BlockBase");

	QUnit.test("Owner component propagated to views", async function(assert) {
		let oComponentContainer;
		let oComponent;
		let oMainView;
		let oMainController;
		let oObjectPage;
		let oBlock;
		let oBlockView;
		let oBlockViewController;
		const done = assert.async();

		assert.expect(5);

		async function fnOnComponentCreated() {
			await nextUIUpdate();

			oComponentContainer = Element.getElementById("myComponentContainer");
			oComponent = oComponentContainer.getComponentInstance();

			assert.ok(oComponent && oComponent.isA("blockbasetest.Component"), "The component was successfully created");

			oMainView = oComponent.getRootControl();
			oMainController = oMainView.getController();

			assert.ok(oMainView && oMainController, "The main view and controller were successfully created");

			oObjectPage = oMainView.byId("ObjectPageLayout");

			oBlock = oObjectPage.getSections()[0].getSubSections()[0].getBlocks()[0];

			assert.ok(oBlock, "The block was successfully created");
			oBlockView = oBlock.getAggregation("_views")[0];
			oBlockViewController = oBlockView.getController();

			assert.ok(oBlockView && oBlockViewController, "The block view and its controller were successfully created");

			assert.strictEqual(oBlockViewController.getOwnerComponent(), oMainController.getOwnerComponent(), "The block view is owned by the component");

			done();
		}

		new Shell("Shell", {
			app: new ComponentContainer("myComponentContainer", {
				name: 'blockbasetest',
				manifest: true,
				height: "100%",
				componentCreated: function() {
					// Component internal initialization runs asynchronously after componentCreated
					setTimeout(fnOnComponentCreated, 1000);
				}
			})
		}).placeAt('qunit-fixture');

		await nextUIUpdate();

	});

	QUnit.test("blocks are target of lazy loading feature", async function (assert) {
		assert.expect(6);

		const fnGetBlock = () => new BlockBase();
		const aBlocksOutsideSubSection = [fnGetBlock(), fnGetBlock(), fnGetBlock()];
		const aBlocksInsideSubSection = [fnGetBlock(), fnGetBlock(), fnGetBlock()];
		const oObjectPageLayout = new ObjectPageLayout({
			enableLazyLoading: true,
			headerContent: aBlocksOutsideSubSection,
			sections:[
					new ObjectPageSection({

						subSections: [
							new ObjectPageSubSection({
								blocks: aBlocksInsideSubSection
							})
						]
				})
			]
		});
		const fnAssertShouldBeLoadedLazily = (assert, oBlock, bExpected) => {
			const bShouldLazyLoad = oBlock._shouldLazyLoad();
			assert.strictEqual(bShouldLazyLoad, bExpected, " The block " + oBlock.getId() + " is target of lazy loading " + bShouldLazyLoad);
		};

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		// Assert: the blocks ObejctPageSubSection are target of lazy laoding
		aBlocksInsideSubSection.forEach((oBlock) => {
			fnAssertShouldBeLoadedLazily(assert, oBlock, true);
		});

		// Assert: the blocks outside the ObejctPageSubSection are not target of lazy laoding
		aBlocksOutsideSubSection.forEach((oBlock) => {
			fnAssertShouldBeLoadedLazily(assert, oBlock, false);
		});


		oObjectPageLayout.destroy();
	});

	QUnit.test("setVisible prevents redundant layout adjustment", function (assert) {
		// Arrange
		const oBlock = new BlockBase();
		const bVisible = oBlock.getVisible();
		const oMockObjectPage = {
			_requestAdjustLayoutAndUxRules: function() {}
		};
		const oSpy = this.spy(oMockObjectPage, "_requestAdjustLayoutAndUxRules");

		this.stub(oBlock, "_getObjectPageLayout").returns(oMockObjectPage);

		// Act: call the setter with the existing value
		oBlock.setVisible(bVisible);

		// Assert
		assert.equal(oSpy.callCount, 0, "no layout adjustment requested");

		oBlock.destroy();
	});

	QUnit.module("BlockBase Height", {

		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-InfoBlocks",
				viewName: "view.UxAP-InfoBlocks"
			}).then(async (oView) => {
				this.oObjectPageInfoView = oView;
				this.oObjectPageInfoView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.oObjectPageInfoView.destroy();
		}
	});

	QUnit.test("ObjectPage blocks height", async function (assert) {

		const oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout");
		const oTargetSubSection = oOPL.getSections()[0].getSubSections()[4];

		assert.expect(1);

		await waitForDOMReady(oOPL);

		// Act: scroll to target section, that will result in:
		// (1) will change the scrollTop [to the one that brings the target section to the top of sections container]
		// (2) will trigger lazy loading of the target section
		oOPL.scrollToSection(oTargetSubSection.getId());

		// Act: as the above call is asynchronous (but returns no promise),
		// make the test synchronous by *explicitly* calling the actions for (1) and (2) above
		// (1) explicitly change the scrollTop to target position [to the one that brings the target section to the top of sections container]
		const iTargetScrollTop = oOPL._computeScrollPosition(oTargetSubSection);
		oOPL._$opWrapper.scrollTop(iTargetScrollTop);
		// (2) explicitly connect the section models (lazy loading)
		oOPL._connectModelsForSections([oTargetSubSection]);
// eslint-disable-next-line no-warning-comments
		nextUIUpdate.runSync(); // TODO when using async rendering, the below expectations are no longer met?

		// Check if the scrollTop [of the lazy-loaded section] matches the expected one
		const iActualScrollTop = Math.ceil(oOPL._$opWrapper.scrollTop());
		assert.ok(iTargetScrollTop === iActualScrollTop || iTargetScrollTop === iActualScrollTop + 1, "scrollTop of lazy-loaded section not did not change upon lazy-loading");
	});

	QUnit.module("'visible' property data binding", {
		beforeEach: function() {
			this.fnCreatePageWithSingleBlock = function (oOptions) {

				const oJSONModelData = oOptions.JSONModelData;
				const sPageProperties = objectToString(oOptions.pageProperties);
				const sBlockProperties = objectToString(oOptions.blockProperties);

				return XMLView.create({
					definition: `<mvc:View
						xmlns:mvc="sap.ui.core.mvc"
						xmlns="sap.uxap"
						xmlns:opblock="sap.uxap.testblocks.objectpageblock"
						height="100%">
						<ObjectPageLayout ${sPageProperties}>
							<sections>
								<ObjectPageSection title="Section1">
									<ObjectPageSubSection title="Section1SubSection1">
										<opblock:InfoButton ${sBlockProperties} />
									</ObjectPageSubSection>
								</ObjectPageSection>
							</sections>
						</ObjectPageLayout>
					</mvc:View>`
				}).then((oView) => {
					this.oView = oView;
					this.oView.setModel(new JSONModel(oJSONModelData), "viewModel");
					return oView;
				});
			};
		},
		afterEach: function() {
			this.oView.destroy();
		}
	});

	QUnit.test("resolves databinding when lazyLoading disabled", function (assert) {
		const done = assert.async();

		assert.expect(1);

		this.fnCreatePageWithSingleBlock({
			blockProperties: { id: "block1", visible:"{viewModel>/blockVisible}" },
			JSONModelData: { blockVisible: false },
			pageProperties: { enableLazyLoading: false }
		}).then((oView) => {
			// Assert
			assert.strictEqual(oView.byId("block1").getVisible(), false, "Block visibility is false");
			done();
		});
	});

	QUnit.test("resolves databinding when lazyLoading enabled", function (assert) {
		const done = assert.async();

		assert.expect(2);

		this.fnCreatePageWithSingleBlock({
			blockProperties: { id: "block1", visible:"{viewModel>/blockVisible}" },
			JSONModelData: { blockVisible: false },
			pageProperties: { enableLazyLoading: true }
		}).then((oView) => {

			// before connecting to models
			const oBlock = oView.byId("block1");
			assert.strictEqual(oBlock.getVisible(), true, "Block visibility still has the default value of true");

			// after connecting to models
			oBlock.connectToModels();
			assert.strictEqual(oBlock.getVisible(), false, "Block visibility is false as binding is now resolved");
			done();
		});
	});

	QUnit.module("View selection", {

		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-InfoBlocks",
				viewName: "view.UxAP-InfoBlocks"
			}).then(async (oView) => {
				this.oObjectPageInfoView = oView;
				this.oObjectPageInfoView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			});
		},
		afterEach: function () {
			this.oObjectPageInfoView.destroy();
		}
	});

	QUnit.test("bindings are updated when we begin connecting to models with enabled lazyloading, if we are not already connected", async function (assert) {

		// Arrange
		const oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout");
		const oTargetSubSection = oOPL.getSections()[0].getSubSections()[0];
		const oBlock = oTargetSubSection.getBlocks()[0];
		const fnUpdateBindingSpy = this.spy(oBlock, "updateBindings");

		assert.expect(2);

		// Act: explicitly connect the section models (lazy loading)
		// _bConnected = false forces the block to go through the connect path
		oBlock._bConnected = false;
		await oOPL._connectModelsForSections([oTargetSubSection]);

		// Assert: updateBindings is called inside the async connectToModelsAsync chain
		assert.ok(fnUpdateBindingSpy.calledOnce, "updateBindings is called once only");
		assert.ok(fnUpdateBindingSpy.calledWithExactly(true, null), "updateBindings is called with the correct arguments");
	});

	QUnit.test("initView event is fired", function (assert) {

		const oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout");
		const oTargetSubSection = oOPL.getSections()[0].getSubSections()[0];
		const oBlock = oTargetSubSection.getBlocks()[0];
		const done = assert.async();

		assert.expect(2);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {
			oBlock._selectView("Expanded");
			oBlock.attachEvent("viewInit", (oEvent) => {
				const oView = oEvent.getParameter("view");
				assert.ok(oView, "event is fired");
				assert.strictEqual(oView.getViewName(), "sap.uxap.testblocks.objectpageblock.InfoButtonExpanded");
				done();
			});
		});

	});

	QUnit.test("view is created only once", function (assert) {

		const oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout");
		const oTargetSubSection = oOPL.getSections()[0].getSubSections()[0];
		const oBlock = oTargetSubSection.getBlocks()[0];
		const oExpandViewMetadata = oBlock.getMetadata().getView("Expanded");
		const createSpy = this.spy(View, "create");
		const done = assert.async();

		oExpandViewMetadata.id = oBlock.getId() + "-Expanded"; // setup

		assert.expect(1);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Wait for views of other blocks to be created --> as connectToModels is now called async
			setTimeout(function () {
				// Setup
				createSpy.resetHistory();

				// Act: request create the same view more than once
				oBlock.createView(oExpandViewMetadata);
				oBlock.createView(oExpandViewMetadata); // request the same view twice

				// Check
				oBlock.attachEventOnce("viewInit", function () {
					assert.ok(createSpy.calledOnce, "creation is called once only");
					done();
				});
			});
		});
	});

	QUnit.test("notification for view selection only once", function (assert) {

		const oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout");
		const oTargetSubSection = oOPL.getSections()[0].getSubSections()[0];
		const oBlock = oTargetSubSection.getBlocks()[0];
		const notifySpy = this.spy(oBlock, "_notifyForLoadingInMode");
		const done = assert.async();

		assert.expect(1);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Setup
			notifySpy.resetHistory();

			// Act: request select the same view more than once
			oBlock._selectView("Expanded");
			oBlock._selectView("Expanded"); // request the same view twice

			// Check
			oBlock.attachEventOnce("viewInit", function () {
				// Inside onAfterRenderingDOMReady + viewInit event chain — cannot replace with nextUIUpdate
				setTimeout(function() {
					assert.ok(notifySpy.calledOnce, "notification is called once only");
					done();
				}, 0);
			});
		});
	});

	QUnit.test("clean up after destroy view", function (assert) {

		const oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout");
		const oTargetSubSection = oOPL.getSections()[0].getSubSections()[0];
		const oBlock = oTargetSubSection.getBlocks()[0];
		const done = assert.async();

		assert.expect(2);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// verify init state
			const sCollapsedViewId = oBlock.getSelectedView();
			assert.ok(oBlock._oPromisedViews[sCollapsedViewId], "the view promise is created");

			oBlock._selectView("Expanded");
			oBlock.attachEvent("viewInit", (oEvent) => {

				// Act
				Element.getElementById(sCollapsedViewId).destroy();

				// Assert
				assert.strictEqual(oBlock._oPromisedViews[sCollapsedViewId], undefined, "the view promise is cleaned up");
				done();
			});
		});

	});

	QUnit.module("LazyLoading with BlockBase", {

		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageLazyLoadingWithBlocks",
				viewName: "view.UxAP-ObjectPageLazyLoadingWithBlocks"
			}).then((oView) => {
				this.oObjectPageInfoView = oView;
				done();
			});
		},
		afterEach: function () {
			this.oObjectPageInfoView.destroy();
		}
	});

	QUnit.test("Check updateBindings for visible and not visible blocks", function (assert) {
		// Arrange
		const oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout");
		const oLastSubSection = this.oObjectPageInfoView.byId("last");
		const oBlock = oLastSubSection.getBlocks()[0];
		const oSpy = this.spy(Control.prototype, "updateBindings");
		const done = assert.async();

		this.oObjectPageInfoView.placeAt('qunit-fixture');
		nextUIUpdate.runSync();

		function checkSpyCalledWithValue() {
			return oSpy.getCalls().some((oCall) => {
				return oCall.thisValue === oBlock;
			});
		}

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Giving time for all async connectToModels calls
			setTimeout(function () {
				// Assert
				assert.notOk(checkSpyCalledWithValue(), "update bindings is NOT called for BlockBase in last SubSection, as it is still not visible");

				// Act - scroll to last SubSection
				oOPL.scrollToSection(oLastSubSection.getId());

				setTimeout(function () {
					// Assert
					assert.ok(checkSpyCalledWithValue, "update bindings is  called for BlockBase in last SubSection, as it is visible now");

					done();
				}, 300);
			});
		});
	});

	QUnit.test("Update bindings when 'moreBlocks' are shown", async function (assert) {
		assert.expect(2);
		// Arrange
		const oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout");
		const oFirstSubSection = this.oObjectPageInfoView.byId("firstSubSection");
		const oBlock = oFirstSubSection.getMoreBlocks()[0];
		const oUpdateBindingsSpy = this.spy(oBlock, "updateBindings");
		const oSelectViewSpy = this.spy(oBlock, "_selectView");

		this.oObjectPageInfoView.placeAt('qunit-fixture');
		nextUIUpdate.runSync();

		await waitForDOMReady(oOPL);

		// Act - press ShowMore Button
		oFirstSubSection._getSeeMoreButton().firePress();

		// Assert
		assert.ok(oUpdateBindingsSpy.calledOnce, "updateBindings is called for BlockBase in 'moreBlocks' aggregation of first SubSection");
		assert.ok(oSelectViewSpy.calledOnce, "_selectView is called for BlockBase in 'moreBlocks' aggregation of first SubSection");

	});

	QUnit.test("Form adjustment destroys the obsolete form layout", function (assert) {
		const done = assert.async();
		const viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:form="sap.ui.layout.form">' +
				'<form:Form>' +
					'<form:layout>' +
						'<form:ResponsiveGridLayout id="idResponsiveGridLayout" />' +
					'</form:layout>' +
					'</form:Form>' +
				'</mvc:View>';
		const MyBlock = BlockBase.extend("my.custom.Block", {
			metadata: {
				views: {
					// Define the view for the block
					Collapsed: {
						type: "XML",
						async: true,
						definition:viewContent
					},
					Expanded: {
						type: "XML",
						async: true,
						definition:viewContent
					}
				}
			},
			renderer: {}
		});
		const myBlock = new MyBlock({
			id: "myBlock",
			formAdjustment: BlockBaseFormAdjustment.BlockColumns
		});
		const oSubSection = new ObjectPageSubSection({
			id: "mySubSection",
			blocks: [myBlock]
		});

		oSubSection._oLayoutConfig = {M: 2, L: 3, XL: 4};

		myBlock.attachEventOnce("viewInit", (oEvent) => {
			const oView = oEvent.getParameter("view");
			const oFormLayout = oView.byId("idResponsiveGridLayout");

			// Assert: check if the obsolete form layout is destroyed
			assert.ok(oFormLayout, "The form layout is created");

			// Inside viewInit event — allows form adjustment internals to settle
			setTimeout(function () {
				// Act: trigger the adjustment of the form layout
				myBlock._applyFormAdjustment();

				// Act: destroy the block parent
				oSubSection.destroy();
				// Assert: check if the obsolete form layout is destroyed
				assert.ok(oFormLayout.bIsDestroyed, "The obsolete form layout is destroyed");
				done();
			}, 0);
		});

		myBlock._selectView("Expanded");
	});

	// utils:
	function objectToString(obj) {
		return Object.entries(obj)
			.map(([key, value]) => `${key}="${String(value)}"`)
			.join(' ');
	}

});
