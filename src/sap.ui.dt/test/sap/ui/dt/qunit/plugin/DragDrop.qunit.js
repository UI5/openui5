/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/Device",
	"sap/ui/dt/plugin/DragDrop",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Page,
	Panel,
	Device,
	DragDrop,
	DesignTime,
	DOMUtil,
	ElementOverlay,
	OverlayRegistry,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	RemovePlugin,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function triggerEvent(sEventName, oTarget, oParams) {
		if (typeof oTarget === "string") {
			oTarget = oTarget ? document.getElementById(oTarget) : null;
		}

		if (!oTarget) {
			return;
		}

		var oEvent = new Event(sEventName);

		Object.assign(oEvent, oParams);

		oTarget.dispatchEvent(oEvent);
	}

	function testDragAndDropEventHandlerTriggering(
		sHandlerFunctionName, oOverlay, aDomDragEvents, assert, mFakeTouchEvents, oTargetOverlay
	) {
		var done = assert.async();

		this.oDragDrop[sHandlerFunctionName] = function(oOverlayInHandler) {
			assert.ok(true, "handler was called");
			if (oTargetOverlay) {
				assert.equal(oTargetOverlay.getId(), oOverlayInHandler.getId(), "correct overlay passed to the handler");
			} else {
				assert.equal(oOverlay.getId(), oOverlayInHandler.getId(), "correct overlay passed to the handler");
			}
			done();
		};

		if (aDomDragEvents.length) {
			for (var i = 0; i < aDomDragEvents.length; i++) {
				var oEventData = mFakeTouchEvents && mFakeTouchEvents[aDomDragEvents[i]];
				triggerEvent(aDomDragEvents[i], oOverlay.getDomRef(), oEventData);
			}
		}
	}

	QUnit.module("Given that a DragDrop is initialized ", {
		async beforeEach(assert) {
			this.oButton = new Button();
			this.oLayout = new VerticalLayout({ content: [this.oButton] });
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDragDrop = new DragDrop();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oDragDrop]
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonOverlay.setMovable(true);
				this.oAggregationOverlay = this.oButtonOverlay.getParentAggregationOverlay();
				this.oAggregationOverlay.setTargetZone(true);
				done();
			}.bind(this));

			this.mFakeTouchEvents = {
				touchstart: {
					touches: [{
						pageX: 5,
						pageY: 5
					}],
					originalEvent: {
						touches: [{
							pageX: 5,
							pageY: 5
						}]
					}
				},
				touchmove: {
					touches: [{
						pageX: 10,
						pageY: 10
					}],
					originalEvent: {
						touches: [{
							pageX: 10,
							pageY: 10
						}]
					}
				},
				touchend: {
					touches: [{
						pageX: 10,
						pageY: 10
					}],
					originalEvent: {
						touches: [{
							pageX: 10,
							pageY: 10
						}],
						changedTouches: [{
							pageX: 10,
							pageY: 10
						}]
					},
					changedTouches: [{
						pageX: 10,
						pageY: 10
					}]
				}
			};
		},
		afterEach() {
			this.oButtonOverlay.destroy();
			this.oLayoutOverlay.destroy();
			this.oLayout.destroy();
			this.oDragDrop.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the touchstart is triggered on an overlay and touchmove is being listened", function(assert) {
			testDragAndDropEventHandlerTriggering.call(
				this, "onDragStart", this.oButtonOverlay, ["touchstart", "touchmove"], assert, this.mFakeTouchEvents
			);
		});

		QUnit.test("when the touchmove is triggered on an overlay and dragenter is triggered on an element overlay", function(assert) {
			var fnElementFromPointStub = sandbox.stub(document, "elementFromPoint");

			var fakeIdStub = {
				id: this.oButtonOverlay.getId()
			};

			fnElementFromPointStub.returns(fakeIdStub);

			testDragAndDropEventHandlerTriggering.call(
				this, "onDragEnter", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents
			);

			sandbox.restore();
		});

		QUnit.test("when the touchmove is triggered on an overlay and dragover is triggered on an element overlay", function(assert) {
			var fnElementFromPointStub = sandbox.stub(document, "elementFromPoint");

			var fakeIdStub = {
				id: this.oButtonOverlay.getId()
			};

			fnElementFromPointStub.returns(fakeIdStub);
			testDragAndDropEventHandlerTriggering.call(
				this, "onDragOver", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents
			);

			sandbox.restore();
		});

		QUnit.test("when the touchmove is triggered on an overlay and drag is triggered", function(assert) {
			testDragAndDropEventHandlerTriggering.call(
				this, "onDrag", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents
			);
		});

		QUnit.test("when the touchmove is triggered on an overlay and aggregationdragenter is triggered on an aggregation overlay", function(assert) {
			var fnElementFromPointStub = sandbox.stub(document, "elementFromPoint");

			var fakeIdStub = {
				id: this.oAggregationOverlay.getId()
			};

			fnElementFromPointStub.returns(fakeIdStub);
			testDragAndDropEventHandlerTriggering.call(
				this,
				"onAggregationDragEnter",
				this.oButtonOverlay,
				["touchstart", "touchmove", "touchmove"],
				assert,
				this.mFakeTouchEvents,
				this.oAggregationOverlay
			);

			sandbox.restore();
		});

		QUnit.test("when the touchmove is triggered on an overlay and aggregationdragover is triggered on an aggregation overlay", function(assert) {
			var fnElementFromPointStub = sandbox.stub(document, "elementFromPoint");

			var fakeIdStub = {
				id: this.oAggregationOverlay.getId()
			};

			fnElementFromPointStub.returns(fakeIdStub);
			testDragAndDropEventHandlerTriggering.call(
				this,
				"onAggregationDragOver",
				this.oButtonOverlay,
				["touchstart", "touchmove", "touchmove"],
				assert,
				this.mFakeTouchEvents,
				this.oAggregationOverlay
			);

			sandbox.restore();
		});

		QUnit.test("when the touchend is triggered on an overlay and aggregationdrop is triggered on an aggregation overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(
				this, "onAggregationDrop",
				this.oButtonOverlay,
				["touchstart", "touchmove", "touchend"],
				assert,
				this.mFakeTouchEvents,
				this.oAggregationOverlay
			);
		});

		QUnit.test("when the touchend is triggered on an overlay and dragend is triggered on an element overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(
				this, "onDragEnd", this.oButtonOverlay, ["touchstart", "touchmove", "touchend"], assert, this.mFakeTouchEvents
			);
		});

		QUnit.test("when the dragstart triggered on overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onDragStart", this.oButtonOverlay, ["dragstart"], assert);
		});

		QUnit.test("when the dragend triggered on overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onDragEnd", this.oButtonOverlay, ["dragend"], assert);
		});

		QUnit.test("when the drag triggered on overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onDrag", this.oButtonOverlay, ["drag"], assert);
		});

		QUnit.test("when the dragenter triggered on overlay in droppable aggregation", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onDragEnter", this.oButtonOverlay, ["dragenter"], assert);
		});

		QUnit.test("when the dragover triggered on overlay in droppable aggregation", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onDragOver", this.oButtonOverlay, ["dragover"], assert);
		});

		QUnit.test("when the dragleave triggered on overlay in droppable aggregation", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onDragLeave", this.oButtonOverlay, ["dragleave"], assert);
		});

		QUnit.test("when the dragenter triggered on aggregation overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragEnter", this.oAggregationOverlay, ["dragenter"], assert);
		});

		QUnit.test("when the dragover triggered on aggregation overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragOver", this.oAggregationOverlay, ["dragover"], assert);
		});

		QUnit.test("when the dragleave triggered on aggregation overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragLeave", this.oAggregationOverlay, ["dragleave"], assert);
		});

		QUnit.test("when the drop triggered on aggregation overlay", function(assert) {
			testDragAndDropEventHandlerTriggering.call(this, "onAggregationDrop", this.oAggregationOverlay, ["drop"], assert);
		});
	});

	QUnit.module("Given that DragDrop touchevents are initialized ", {
		async beforeEach(assert) {
			this.oButton = new Button();
			this.oLayout1 = new VerticalLayout({ content: [this.oButton] });
			this.oLayout2 = new VerticalLayout({ content: [this.oLayout1] });
			this.oLayout2.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDragDrop = new DragDrop();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout2],
				plugins: [this.oDragDrop]
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayout1Overlay = OverlayRegistry.getOverlay(this.oLayout1);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonOverlay.setMovable(true);
				this.oAggregationOverlay = this.oLayout1Overlay.getParentAggregationOverlay();
				this.oAggregationOverlay.setTargetZone(true);
				done();
			}.bind(this));

			this.mFakeTouchEvents = {
				touchstart: {
					touches: [{
						pageX: 5,
						pageY: 5
					}],
					originalEvent: {
						touches: [{
							pageX: 5,
							pageY: 5
						}]
					}
				},
				touchmove: {
					touches: [{
						pageX: 10,
						pageY: 10
					}],
					originalEvent: {
						touches: [{
							pageX: 10,
							pageY: 10
						}]
					}
				}
			};
		},
		afterEach() {
			this.oButtonOverlay.destroy();
			this.oLayout1Overlay.destroy();
			this.oLayout2.destroy();
			this.oDragDrop.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the touchmove is triggered on an overlay and dragenter is triggered on an element overlay (go to the parent) which is in the target zone", function(assert) {
			var fnElementFromPointStub = sandbox.stub(document, "elementFromPoint");

			var fakeIdStub = {
				id: this.oButtonOverlay.getId()
			};

			fnElementFromPointStub.returns(fakeIdStub);

			testDragAndDropEventHandlerTriggering.call(
				this,
				"onDragEnter",
				this.oButtonOverlay,
				["touchstart", "touchmove", "touchmove"],
				assert,
				this.mFakeTouchEvents,
				this.oLayout1Overlay
			);

			sandbox.restore();
		});

		QUnit.test("when the touchmove is triggered on an overlay and dragover is triggered on an element overlay (go to the parent) which is in the target zone", function(assert) {
			var fnElementFromPointStub = sandbox.stub(document, "elementFromPoint");

			var fakeIdStub = {
				id: this.oButtonOverlay.getId()
			};

			fnElementFromPointStub.returns(fakeIdStub);

			testDragAndDropEventHandlerTriggering.call(
				this,
				"onDragOver",
				this.oButtonOverlay,
				["touchstart", "touchmove", "touchmove"],
				assert,
				this.mFakeTouchEvents,
				this.oLayout1Overlay
			);

			sandbox.restore();
		});

		QUnit.test("when the touchmove is triggered on an overlay and aggregationdragenter is triggered on an aggregation overlay which has a target zone", function(assert) {
			var fnElementFromPointStub = sandbox.stub(document, "elementFromPoint");

			var fakeIdStub = {
				id: this.oAggregationOverlay.getId()
			};

			fnElementFromPointStub.returns(fakeIdStub);

			testDragAndDropEventHandlerTriggering.call(
				this,
				"onAggregationDragEnter",
				this.oButtonOverlay,
				["touchstart", "touchmove", "touchmove"],
				assert,
				this.mFakeTouchEvents,
				this.oAggregationOverlay
			);

			sandbox.restore();
		});

		QUnit.test("when the touchmove is triggered on an overlay and aggregationdragover is triggered on an aggregation overlay which has a target zone", function(assert) {
			var fnElementFromPointStub = sandbox.stub(document, "elementFromPoint");

			var fakeIdStub = {
				id: this.oAggregationOverlay.getId()
			};

			fnElementFromPointStub.returns(fakeIdStub);

			testDragAndDropEventHandlerTriggering.call(
				this,
				"onAggregationDragOver",
				this.oButtonOverlay,
				["touchstart", "touchmove", "touchmove"],
				assert,
				this.mFakeTouchEvents,
				this.oAggregationOverlay
			);

			sandbox.restore();
		});
	});

	QUnit.module("Given DragDrop with removeLastElement = false is initialized", {
		async beforeEach(assert) {
			this.oButton = new Button();
			this.oLayout = new VerticalLayout({ content: [this.oButton] });
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oCommandFactory = new CommandFactory();
			this.oDragDrop = new DragDrop({	commandFactory: oCommandFactory	});
			this.oRemovePlugin = new RemovePlugin({ commandFactory: oCommandFactory	});
			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [this.oDragDrop, this.oRemovePlugin],
				designTimeMetadata: {
					"sap.ui.layout.VerticalLayout": {
						aggregations: {
							content: {
								actions: {
									remove: {
										removeLastElement: false
									}
								}
							}
						}
					}
				}
			});

			const done = assert.async();

			this.oDesignTime.attachEventOnce("synced", () => {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				done();
			});
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the element is the last visible element and removeLastElement is false", function(assert) {
			const fnOnDragStartSpy = sandbox.spy(this.oDragDrop, "onDragStart");
			this.oButtonOverlay.setMovable(true);

			assert.strictEqual(
				this.oButtonOverlay.getDomRef().getAttribute("draggable"),
				"true",
				"then the overlay is draggable before it is recognized as the last visible element"
			);

			this.oButtonOverlay.setLastElementMovable(false);
			triggerEvent("dragstart", this.oButtonOverlay.getDomRef());

			assert.strictEqual(
				fnOnDragStartSpy.callCount,
				0,
				"then after set as last visible Element onDragStart is not called because drag events are not attached"
			);
			assert.strictEqual(
				this.oButtonOverlay.getDomRef().getAttribute("draggable"),
				null,
				"then the overlay is not draggable"
			);
		});
	});

	if (!Device.browser.webkit) {
		/**
		 * scroll on drag
		 */
		QUnit.module("Given that overlay is created for a m.Page with Panels", {
			beforeEach(assert) {
				var done = assert.async();

				this.aPanels = [];
				this.aPanelOverlays = [];
				for (var i = 0; i < 30; i++) {
					var oPanel = new Panel();
					this.aPanels.push(oPanel);
					var oPanelOverlay = new ElementOverlay({
						element: oPanel
					});
					this.aPanelOverlays.push(oPanelOverlay);
				}

				this.oPage = new Page({
					content: this.aPanels
				}).placeAt("qunit-fixture");

				this.oDragDrop = new DragDrop();
				this.oDesignTime = new DesignTime({
					rootElements: [this.oPage],
					plugins: [this.oDragDrop]
				});

				this.oDesignTime.attachEventOnce("synced", () => {
					this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
					done();
				});
			},
			afterEach() {
				this.oDesignTime.destroy();
				this.oPage.destroy();
				sandbox.restore();
			}
		}, function() {
			QUnit.test("when a dragover event happens in a an overlay with a scrollbar near the edge...", function(assert) {
				const done = assert.async();
				const oPageContentOverlay = this.oPageOverlay.getAggregationOverlay("content");
				const oPageContentOverlayDomRef = oPageContentOverlay.getDomRef();
				const oPageContent = oPageContentOverlay.getGeometry().domRef;

				// The _dragScroll handler compares the event's clientX/clientY against the
				// overlay's document-relative offset (jQuery .offset()). Build the event
				// coordinates on the same document-relative scale so the scroll-trap math
				// matches regardless of how far qunit-fixture is scrolled down the page.
				const oRect = oPageContentOverlayDomRef.getBoundingClientRect();
				const iOffsetLeft = oRect.left + window.scrollX;
				const iOffsetTop = oRect.top + window.scrollY;

				const iX = iOffsetLeft + 10;
				const iY = iOffsetTop + oRect.height - 10;

				oPageContent.addEventListener("scroll", function() {
					assert.notStrictEqual(oPageContent.scrollTop, 0, "page content is scrolled after drag event");
					done();
				});

				const oEvent = new MouseEvent("dragover", {
					view: window,
					bubbles: true,
					cancelable: true,
					clientX: iX,
					clientY: iY
				});

				oPageContentOverlayDomRef.dispatchEvent(oEvent);
			});

			QUnit.test("when the aggregation overlay is not scrollable at registration time and becomes scrollable later", function(assert) {
				// Regression test: the drag-scroll listener must be attached regardless of the
				// overlay's scroll state at registration time. At registration the overlay DOM is
				// often not laid out yet (scrollHeight/clientHeight 0), so gating the attachment on
				// DOMUtil.hasScrollBar() used to permanently skip it - the aggregation then never
				// scrolled on drag even once it had a scrollbar.
				const oPageContentOverlay = this.oPageOverlay.getAggregationOverlay("content");
				const oPageContentOverlayDomRef = oPageContentOverlay.getDomRef();

				// Re-attach the handler while the overlay reports "not scrollable", mimicking the
				// not-yet-laid-out state during registration on a slow environment.
				this.oDragDrop._removeDragScrollHandler(oPageContentOverlay);
				const fnHasScrollBarStub = sandbox.stub(DOMUtil, "hasScrollBar").returns(false);
				this.oDragDrop._attachDragScrollHandler(oPageContentOverlay);

				// _checkScroll is reached only when the dragover listener fired and _dragScroll did
				// not early-return, i.e. the aggregation is scrollable at drag time. Spy on it
				// (a live prototype method - _dragScroll itself is pre-bound in init and cannot be
				// spied after the fact) and let the overlay report scrollable for the drag.
				const fnCheckScrollSpy = sandbox.spy(this.oDragDrop, "_checkScroll");
				fnHasScrollBarStub.returns(true);

				const oEvent = new MouseEvent("dragover", {
					view: window,
					bubbles: true,
					cancelable: true,
					clientX: 0,
					clientY: 0
				});
				oPageContentOverlayDomRef.dispatchEvent(oEvent);

				assert.ok(
					fnCheckScrollSpy.callCount > 0,
					"then the dragover listener is attached even though the overlay was not scrollable at registration time"
				);
			});

			QUnit.test("when a dragover happens while the aggregation is not scrollable", function(assert) {
				// The listener is attached unconditionally, so _dragScroll itself must gate on the
				// current scroll state and do nothing (start no scroll interval) when the aggregation
				// has no scrollbar at drag time.
				const oPageContentOverlay = this.oPageOverlay.getAggregationOverlay("content");
				const oPageContentOverlayDomRef = oPageContentOverlay.getDomRef();

				sandbox.stub(DOMUtil, "hasScrollBar").returns(false);
				const fnCheckScrollSpy = sandbox.spy(this.oDragDrop, "_checkScroll");

				const oEvent = new MouseEvent("dragover", {
					view: window,
					bubbles: true,
					cancelable: true,
					clientX: 0,
					clientY: 0
				});
				oPageContentOverlayDomRef.dispatchEvent(oEvent);

				assert.strictEqual(
					fnCheckScrollSpy.callCount,
					0,
					"then _dragScroll returns early and starts no scroll interval when the aggregation is not scrollable"
				);
			});
		});
	}

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

