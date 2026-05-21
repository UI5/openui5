/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/LocalBusyIndicatorSupport",
	"sap/m/BusyDialog",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/OverflowToolbar",
	"sap/m/Slider",
	"sap/m/StandardListItem",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/m/VBox",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/test/utils/nextUIUpdate"
], function(LocalBusyIndicatorSupport, BusyDialog, Button, List, OverflowToolbar, Slider, StandardListItem, Title, ToolbarSpacer, VBox, Control, Element, XMLView, KeyCodes, jQuery, qutils, nextUIUpdate) {
	"use strict";

	// create page content
	["target1", "target2", "target3", "failsafeTests"].forEach(function(sId) {
		var oDIV = document.createElement("div");
		oDIV.id = sId;
		document.body.appendChild(oDIV);
	});



	QUnit.module("Basic", {
		beforeEach : function() {
			this.oFocusBefore = new Button("FocusBefore").placeAt("target1");
			this.oToolbarButton = new Button({
				text: "click me"
			});
			this.oListBox = new List({
				headerToolbar: new OverflowToolbar({
					content: [
						new Title({ text: "Title" }),
						new ToolbarSpacer(),
						this.oToolbarButton
					]
				}),
				tooltip : "Country",
				width : "200px",
				items : [ new StandardListItem({
					title : "I'm an item, and you?"
				}) ]
			}).placeAt("target1");
			this.oFocusAfter = new Button("FocusAfter").placeAt("target1");
			this.oSlider = new Slider().placeAt("target2");

			return nextUIUpdate();
		},

		afterEach : function() {
			this.oFocusBefore.destroy();
			this.oFocusAfter.destroy();
			this.oListBox.destroy();
			this.oSlider.destroy();
		}
	});

	// make sure the controls are not busy
	QUnit.test("InitialCheck", function(assert) {
		assert.equal(this.oSlider.getBusy(), false, "Slider is not busy");
		assert.equal(this.oListBox.getBusy(), false, "Listbox is not busy");
	});

	QUnit.test("Accessibility", function(assert) {
		var done = assert.async();
		var oListBox = this.oListBox;
		oListBox.setBusy(true);
		var $LB = oListBox.$();
		var iChildren = $LB.children().length;

		setTimeout(function() {
			var oBusyIndicator = oListBox.getDomRef("busyIndicator");
			assert.equal($LB.children().length, iChildren + 1, 'Busy Indicator added to DOM tree');
			assert.ok(oBusyIndicator, "Busy Indicator element is present in the DOM");
			assert.equal(oBusyIndicator.getAttribute("role"), "progressbar", "ARIA role 'progressbar' is set on the busy indicator");
			assert.equal(oBusyIndicator.getAttribute("tabindex"), "0", "The busy indicator is focusable (tabindex=0)");
			assert.ok(oBusyIndicator.hasAttribute("aria-label"), "ARIA label is set on the busy indicator");
			assert.ok(oBusyIndicator.hasAttribute("aria-valuetext"), "Busy indicator has 'aria-valuetext'");
			assert.ok(oBusyIndicator.hasAttribute("aria-valuemin"), "Busy indicator has 'aria-valuemin'");
			assert.ok(oBusyIndicator.hasAttribute("aria-valuemax"), "Busy indicator has 'aria-valuemax'");
			assert.ok($LB[0].hasAttribute("aria-busy"), "ARIA busy is set on the control root");
			done();
		}, 1200);
	});

	QUnit.test("aria-busy is set on the busy-section DOM when a busy section is defined", function(assert) {
		this.oListBox.setBusyIndicatorDelay(0);
		this.oListBox.setBusy(true, "listUl");

		var oRootDOM = this.oListBox.getDomRef();
		var oBusySectionDOM = this.oListBox.getDomRef("listUl");

		assert.strictEqual(oBusySectionDOM.getAttribute("aria-busy"), "true",
			"aria-busy='true' is set on the busy-section DOM (<id>-listUl)");
		assert.strictEqual(oRootDOM.getAttribute("aria-busy"), null,
			"aria-busy is NOT set on the root control DOM when a busy section is defined");

		this.oListBox.setBusy(false);
		assert.strictEqual(oBusySectionDOM.getAttribute("aria-busy"), null,
			"aria-busy is removed from the busy-section DOM after setBusy(false)");
	});

	QUnit.test("aria-valuetext is set on the busy indicator when a busy section is defined", function(assert) {
		this.oListBox.setBusyIndicatorDelay(0);
		this.oListBox.setBusy(true, "listUl");

		var oBusySectionDOM = this.oListBox.getDomRef("listUl");
		var oBusyIndicator = this.oListBox.getDomRef("busyIndicator");

		assert.ok(oBusyIndicator.hasAttribute("aria-valuetext"),
			"aria-valuetext is set on the busy indicator");
		assert.strictEqual(oBusySectionDOM.getAttribute("aria-valuetext"), null,
			"aria-valuetext is NOT set on the busy-section DOM (<id>-listUl)");

		this.oListBox.setBusy(false);
		assert.strictEqual(this.oListBox.getDomRef("busyIndicator"), null,
			"busy indicator (with its aria-valuetext) is removed after setBusy(false)");
	});


	QUnit.test("aria-busy is set on the root control DOM when no busy section is defined", function(assert) {
		this.oListBox.setBusyIndicatorDelay(0);
		this.oListBox.setBusy(true);

		var oRootDOM = this.oListBox.getDomRef();
		var oListUlDOM = this.oListBox.getDomRef("listUl");

		assert.strictEqual(oRootDOM.getAttribute("aria-busy"), "true",
			"aria-busy='true' is set on the root control DOM when _sBusySection is not defined");
		assert.strictEqual(oListUlDOM.getAttribute("aria-busy"), null,
			"aria-busy is NOT set on a sub-DOM when _sBusySection is not defined");

		this.oListBox.setBusy(false);
		assert.strictEqual(oRootDOM.getAttribute("aria-busy"), null,
			"aria-busy is removed from the root control DOM after setBusy(false)");
	});

	QUnit.test("aria-valuetext is set on the busy indicator when no busy section is defined", function(assert) {
		this.oListBox.setBusyIndicatorDelay(0);
		this.oListBox.setBusy(true);

		var oRootDOM = this.oListBox.getDomRef();
		var oBusyIndicator = this.oListBox.getDomRef("busyIndicator");

		assert.ok(oBusyIndicator.hasAttribute("aria-valuetext"),
			"aria-valuetext is set on the busy indicator");
		assert.strictEqual(oRootDOM.getAttribute("aria-valuetext"), null,
			"aria-valuetext is NOT set on the root control DOM");

		this.oListBox.setBusy(false);
		assert.strictEqual(this.oListBox.getDomRef("busyIndicator"), null,
			"busy indicator (with its aria-valuetext) is removed after setBusy(false)");
	});

	QUnit.test("Check suppressed events", function(assert) {
		var done = assert.async();
		this.oListBox.setBusyIndicatorDelay(0);
		this.oListBox.setBusy(true);
		var $LB = this.oListBox.$();

		var aPreventedEvents = [
			"mousedown",
			"touchstart",
			"touchmove",
			"mouseup",
			"touchend",
			"click"
		];

		var sListenerCalled = 'not called';
		function fnEventListener(oEvent) {
			sListenerCalled = 'called';
		}

		// register listener for all prevented events
		// Note: the issues described in BCP 1680184582 only occurs when the prevent-listener of the LocalBusyIndicator
		// is executed __BEFORE__ this listener here. As jQuery uses a while(--i) loop, this means we have to register
		// our listener before the LBI registers its own listener.
		// TODO consider using a capturing phase listener in LBI to make this more robust.
		for (var i = 0; i < aPreventedEvents.length; i++) {
			$LB.on(aPreventedEvents[i], fnEventListener);
		}

		setTimeout(function() {

			for (var i = 0; i < aPreventedEvents.length; i++) {

				try {
					sListenerCalled = 'not called';
					qutils.triggerEvent(aPreventedEvents[i], $LB);
					assert.equal(sListenerCalled, 'not called', "Event '" + aPreventedEvents[i] + "' should be suppressed");
				} catch (ex) {
					assert.ok(false, "Event '" + aPreventedEvents[i] + "' NOT suppressed");
				}

			}

			// hide busy indicator and test that events are no longer prevented
			this.oListBox.setBusy(false);
			$LB = this.oListBox.$();

			setTimeout(function() {

				for (var i = 0; i < aPreventedEvents.length; i++) {

					try {
						sListenerCalled = 'not called';
						qutils.triggerEvent(aPreventedEvents[i], $LB);
						assert.equal(sListenerCalled, 'called', "Event '" + aPreventedEvents[i] + "' should no longer be suppressed");
					} catch (ex) {
						// assert.ok(false, "Event '" + aPreventedEvents[i] + "' NOT suppressed");
					}

				}

				done();

			}, 250);

		}.bind(this), 250);
	});

	QUnit.test("Focus entering the busy section is redirected to the busy indicator", function(assert) {
		var oListBox = this.oListBox;
		oListBox.setBusyIndicatorDelay(0);
		oListBox.setBusy(true);

		var oBusyIndicator = oListBox.getDomRef("busyIndicator");
		assert.ok(oBusyIndicator, "Busy indicator is present in the DOM");

		// Simulate focus entering the blocked section (e.g. via click or programmatic focus).
		// The redirectFocus handler on the control root must move focus onto the busy indicator.
		var oRoot = oListBox.getDomRef();
		oRoot.setAttribute("tabindex", "-1");
		oRoot.focus();

		assert.strictEqual(document.activeElement, oBusyIndicator,
			"Focus entering the busy section is redirected to the busy indicator");

		oRoot.removeAttribute("tabindex");
		oListBox.setBusy(false);
	});

	QUnit.test("Focus is moved to the indicator while busy and restored afterwards", function(assert) {
		var oListBox = this.oListBox;
		var oItemDom = oListBox.getItems()[0].getFocusDomRef();
		oListBox.setBusyIndicatorDelay(0);

		// put focus inside the control before it becomes busy
		oItemDom.focus();
		assert.ok(oListBox.getDomRef().contains(document.activeElement),
			"Focus is inside the control before it becomes busy");

		oListBox.setBusy(true);
		var oBusyIndicator = oListBox.getDomRef("busyIndicator");
		assert.strictEqual(document.activeElement, oBusyIndicator,
			"Focus is moved to the busy indicator while the control is busy");

		oListBox.setBusy(false);
		assert.strictEqual(document.activeElement, oItemDom,
			"Focus is restored to the previously focused element after the control is no longer busy");
	});

	QUnit.test("Focus is restored to the block layer after invalidation of a busy control", async function(assert) {
		var oListBox = this.oListBox;
		var oItemDom = oListBox.getItems()[0].getFocusDomRef();
		oListBox.setBusyIndicatorDelay(0);

		// Focus an item, then make the control busy
		oItemDom.focus();
		oListBox.setBusy(true);
		var oBusyIndicator = oListBox.getDomRef("busyIndicator");
		assert.strictEqual(document.activeElement, oBusyIndicator,
			"Focus is on the busy indicator before invalidation");

		// Invalidate the busy control → triggers rerendering
		oListBox.invalidate();
		await nextUIUpdate();

		// After rerendering, the block layer is recreated. RenderManager restores focus into the
		// control, and the async focus redirect in fnAppendBusyIndicator must move it back to the
		// new busy indicator.
		var oNewBusyIndicator = oListBox.getDomRef("busyIndicator");
		assert.ok(oNewBusyIndicator, "New busy indicator exists after rerendering");

		await new Promise(function(resolve) { setTimeout(resolve, 0); });
		assert.strictEqual(document.activeElement, oNewBusyIndicator,
			"Focus is restored to the block layer after invalidation");

		oListBox.setBusy(false);
	});

	QUnit.test("Manual focus change during invalidation of a busy control is not overwritten", async function(assert) {
		var oListBox = this.oListBox;
		var oItemDom = oListBox.getItems()[0].getFocusDomRef();
		var oFocusAfter = this.oFocusAfter;
		oListBox.setBusyIndicatorDelay(0);

		// Focus an item, then make the control busy
		oItemDom.focus();
		oListBox.setBusy(true);
		var oBusyIndicator = oListBox.getDomRef("busyIndicator");
		assert.strictEqual(document.activeElement, oBusyIndicator,
			"Focus is on the busy indicator before invalidation");

		// Invalidate the busy control → triggers rerendering
		oListBox.invalidate();
		await nextUIUpdate();

		// Simulate application code moving focus to a different control between
		// onAfterRendering and the async focus redirect
		oFocusAfter.focus();
		assert.strictEqual(document.activeElement, oFocusAfter.getFocusDomRef(),
			"Focus was manually moved to another control");

		await new Promise(function(resolve) { setTimeout(resolve, 0); });
		assert.strictEqual(document.activeElement, oFocusAfter.getFocusDomRef(),
			"Manual focus change is respected and not overwritten by the busy indicator");

		oListBox.setBusy(false);
	});

	QUnit.test("Arrow keys are forwarded to the control's item navigation from a busy item", async function(assert) {
		// When a list item is busy, arrow keys pressed on its busy indicator must be delegated to
		// the list's own keyboard navigation (ItemNavigation), so navigation follows the actual
		// layout (linear or grid) instead of a naive sibling walk.
		var oList = new List({
			items: [
				new StandardListItem({ title: "Item 0" }),
				new StandardListItem({ title: "Item 1" }),
				new StandardListItem({ title: "Item 2" })
			]
		}).placeAt("failsafeTests");
		await nextUIUpdate();

		var aItems = oList.getItems();
		var oBusyItem = aItems[1];
		oBusyItem.getDomRef().focus(); // ItemNavigation: current item -> index 1
		oBusyItem.setBusyIndicatorDelay(0);
		oBusyItem.setBusy(true);

		var oBusyIndicator = oBusyItem.getDomRef("busyIndicator");
		assert.ok(oBusyIndicator, "Busy indicator is present in the DOM");
		assert.strictEqual(document.activeElement, oBusyIndicator,
			"Focus is on the busy indicator while the item is busy");

		// Arrow Down on the indicator is forwarded to the list -> focus moves to the next item
		qutils.triggerKeydown(oBusyIndicator, KeyCodes.ARROW_DOWN);
		assert.strictEqual(document.activeElement, aItems[2].getDomRef(),
			"ARROW_DOWN is delegated to the control and moves focus to the next item");

		oList.destroy();
	});

	QUnit.test("Focus that enters the busy section during busyIndicatorDelay is redirected to the block layer", function(assert) {
		var done = assert.async();
		var oListBox = this.oListBox;
		var oItemDom = oListBox.getItems()[0].getFocusDomRef();

		// Use a non-zero delay so there's a window where the control is logically busy
		// but the block layer (and inert) hasn't been applied yet.
		oListBox.setBusyIndicatorDelay(50);
		oListBox.setBusy(true);

		// No block layer yet — focus can still enter the control during the delay
		assert.notOk(oListBox.getDomRef("busyIndicator"),
			"Busy indicator not yet in DOM during delay");
		oItemDom.focus();
		assert.strictEqual(document.activeElement, oItemDom,
			"Focus is inside the control during busyIndicatorDelay");

		// After the delay, fnAppendBusyIndicator fires, applies inert, and must
		// redirect focus to the block layer.
		setTimeout(function() {
			var oBusyIndicator = oListBox.getDomRef("busyIndicator");
			assert.ok(oBusyIndicator, "Busy indicator is now in the DOM");
			assert.strictEqual(document.activeElement, oBusyIndicator,
				"Focus is redirected to the block layer after busyIndicatorDelay");

			oListBox.setBusy(false);
			done();
		}, 200);
	});

	QUnit.test("Shift+Tab moves focus from a busy button back to the previous tabbable element", async function(assert) {
		// A busy control whose root is itself tabbable (e.g. a <button>) holds the busy indicator
		// as a child. Backward tabbing lands on the tabbable root; focus must escape to the
		// previous tabbable element instead of bouncing back onto the busy indicator.
		// The busy button is nested in a VBox (its own flex item), so it has no focusable previous
		// element sibling - the escape must therefore use document order, not just siblings.
		var oButtonBefore = new Button({ text: "Before" });
		var oBusyButton = new Button({ text: "Busy", busyIndicatorDelay: 0 });
		var oVBox = new VBox({ items: [oButtonBefore, oBusyButton] }).placeAt("failsafeTests");
		await nextUIUpdate();

		oBusyButton.setBusy(true);
		var oBusyIndicator = oBusyButton.getDomRef("busyIndicator");
		assert.ok(oBusyIndicator, "Busy indicator is present in the DOM");
		assert.strictEqual(oBusyButton.getDomRef().previousElementSibling, null,
			"Busy button has no previous element sibling (it is nested in its own flex item)");

		// Focus the indicator, then simulate the browser moving focus onto the <button> root (Shift+Tab)
		oBusyIndicator.focus();
		assert.strictEqual(document.activeElement, oBusyIndicator, "Busy indicator is focused");
		oBusyButton.getDomRef().focus();

		assert.ok(oButtonBefore.getDomRef().contains(document.activeElement),
			"Focus escapes to the previous tabbable element instead of bouncing back to the busy indicator");

		oVBox.destroy();
	});



	QUnit.module("Open and Close", {
		beforeEach : function() {
			this.oListBox = new List({
				tooltip : "Country",
				width : "200px",
				items : [ new StandardListItem({
					title : "I'm an item, and you?"
				}) ]
			}).placeAt("target1");

			this.oSlider = new Slider().placeAt("target2");

			return nextUIUpdate();
		},

		afterEach : function() {
			this.oListBox.destroy();
			this.oSlider.destroy();
		}
	});

	QUnit.test("Delayed opening", function(assert) {
		var done = assert.async();
		var that = this;
		this.oListBox.setBusy(true);

		assert.equal(this.oListBox.$().children('.sapUiLocalBusyIndicator').length, 0, 'Busy Indicator not yet added to DOM');
		assert.equal(this.oListBox.getBusy(), true, 'ListBox is busy');

		setTimeout(function() {
			assert.equal(that.oListBox.$().children('.sapUiLocalBusyIndicator').length, 1, 'Busy Indicator is part of the DOM');
			done();
		}, 1200);
	});

	QUnit.test("Close Busy Indicator", function(assert) {
		var done = assert.async();
		assert.expect(7);
		var that = this;
		this.oListBox.setBusy(true);

		assert.equal(this.oListBox.$().children('.sapUiLocalBusyIndicator').length, 0, 'Busy Indicator not yet added to DOM');
		assert.equal(this.oListBox.getBusy(), true, 'ListBox is busy');
		assert.equal(this.oListBox.getDomRef().parentElement.children.length, 1, 'No additional elements in dom');

		setTimeout(function() {
			assert.equal(that.oListBox.$().children('.sapUiLocalBusyIndicator').length, 1, 'Busy Indicator is part of the DOM');

			that.oListBox.setBusy(false);

			setTimeout(function() {
				assert.equal(that.oListBox.$().children('.sapUiLocalBusyIndicator').length, 0, 'Busy Indicator was romoved from DOM');
				assert.equal(that.oListBox.getBusy(), false, 'ListBox is not busy anymore');
				assert.equal(that.oListBox.getDomRef().parentElement.children.length, 1, 'No additional elements in dom');
				done();
			}, 250);
		}, 1200);
	});

	/**
	 * This test checks if the busy indicator does not crash after the outer control was already
	 * removed from the DOM, when the
	 */
	QUnit.test("BusyIndicator and Already Closed sap.m.BusyDialog does not crash", function(assert) {
		var done = assert.async();

		var dialog = new BusyDialog({
			title: "Loading",
			text: "something loading..."
		});

		dialog.open();
		setTimeout(function () {
			Element.closestTo("#__dialog0-busyInd").setBusy(true);
			dialog.close();
			assert.ok("everythings fine");
			done();
		}, 250);

	});

	QUnit.test("Open multiple busy indicators", function(assert) {
		var done = assert.async();
		var that = this;

		this.oListBox.setBusy(true);
		this.oSlider.setBusy(true);

		assert.equal(this.oListBox.$().children('.sapUiLocalBusyIndicator').length, 0, 'Listbox Busy Indicator not yet added to DOM');
		assert.equal(this.oSlider.$().children('.sapUiLocalBusyIndicator').length, 0, 'Slider Busy Indicator not yet added to DOM');
		assert.equal(this.oListBox.getBusy(), true, 'ListBox is busy');
		assert.equal(this.oSlider.getBusy(), true, 'Slider is busy');

		setTimeout(function() {
			assert.equal(that.oListBox.$().children('.sapUiLocalBusyIndicator').length, 1, 'Listbox Busy Indicator is part of the DOM');
			assert.equal(that.oSlider.$().children('.sapUiLocalBusyIndicator').length, 1, 'Slider Busy Indicator is part of the DOM');
			done();
		}, 1200);
	});

	// as XML-View maintains the DOM itself, busy indicator should treat this particularly, as otherwise duplicate
	// busy indicators would be created when rerendering and never removed
	QUnit.test("Busy indicator on XML View", function(assert) {
		var done = assert.async();
		// setup the busy view
		return XMLView.create({
			definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" busyIndicatorDelay="0"></mvc:View>'
		}).then(async function(myView) {
			myView.placeAt('target1');
			await nextUIUpdate();
			myView.setBusy(true);
			// this rerendering is crucial to test the behavior
			myView.invalidate();
			await nextUIUpdate();
			setTimeout(function() {
				// assert
				assert.ok(myView.$("busyIndicator").length, "BusyIndicator rendered");
				myView.setBusy(false);
				assert.ok(!myView.$("busyIndicator").length, "All BusyIndicators removed");
				//cleanup
				myView.destroy();
				done();
			}, 50);
		});
	});


	QUnit.module("Delay", {
		beforeEach : function() {
			this.iDelay = 500;
			this.oButton = new Button({
				busy : true,
				busyIndicatorDelay : this.iDelay,
				text : "Delayed BusyIndicator"
			});
		},

		afterEach : function() {
			delete this.iDelay;
			this.oButton.destroy();
		}
	});

	QUnit.test("OnAfterRendering", async function(assert) {
		var done = assert.async();
		assert.expect(4);
		this.oButton.placeAt("target1");
		await nextUIUpdate();
		var that = this;

		setTimeout(function() {
			// set busy after rendering but no animation shown
			assert.ok(that.oButton.getBusy(), "Button is set to busy");
			var $BusyIndicator = that.oButton.$("busyIndicator");
			assert.ok(!$BusyIndicator.length, "BusyIndicator isn't shown yet");

			setTimeout(function() {
				// set busy and animation shown
				assert.ok(that.oButton.getBusy(), "Button still set to busy");
				$BusyIndicator = that.oButton.$("busyIndicator");
				assert.ok($BusyIndicator.length, "BusyIndicator is shown after delay");

				done();
			}, that.iDelay);
		}, 200);
	});

	QUnit.test("Ensuring DelayedCall Only Used Once", async function(assert) {
		var done = assert.async();
		assert.expect(2);

		var iFirstDelayedCallId,
			iSecondDelayedCallId;
		var oOnAfterRenderingDelegate = {
			onAfterRendering : function() {
				if (!iFirstDelayedCallId) {
					// first rendering will call delegate
					iFirstDelayedCallId = this.oButton._busyIndicatorDelayedCallId;
				} else if (!iSecondDelayedCallId) {
					// second call will happen when the text of the button is being changed
					iSecondDelayedCallId = this.oButton._busyIndicatorDelayedCallId;
				}
			}
		};
		this.oButton.addDelegate(oOnAfterRenderingDelegate, false, this);
		this.oButton.placeAt("target1");
		await nextUIUpdate();
		var that = this;

		setTimeout(function() {
			assert.ok(iFirstDelayedCallId && !iSecondDelayedCallId, "Delayed call started in afterRendering of control");

			// Force a re-rendering while waiting for the delay
			// (possible for example if a binding changes properties asynchronously)
			that.oButton.setText("Changed Text");

			setTimeout(function() {
				// set busy and animation shown
				assert.ok(iFirstDelayedCallId === iSecondDelayedCallId, "Delayed call not overwritten by rerendering");

				done();
			}, that.iDelay);
		}, 20);
	});



	QUnit.module("Busy Animation");

	QUnit.test("Check if small Animation is used", async function(assert) {
		var done = assert.async();

		this.oBtn = new Button({
			text : "Blub",
			width : "45px",
			busyIndicatorSize : 'Small',
			busy : true,
			busyIndicatorDelay : 0
		}).placeAt("target1");

		this.oDelegate = {
			onAfterRendering : function(oEvent) {}
		};
		this.oBtn.addDelegate(this.oDelegate);
		this.oSpy = sinon.spy(this.oDelegate, "onAfterRendering");

		await nextUIUpdate();

		setTimeout(function() {
			var $Animation = jQuery(".sapUiLocalBusyIndicatorAnimation");
			assert.ok($Animation.length, "Animation exists");
			assert.ok($Animation.hasClass("sapUiLocalBusyIndicatorAnimSmall"), "Correct CSS class set to DOM");

			assert.equal(this.oSpy.callCount, 1, "Icon should be rendered once");

			this.oSpy.restore();
			delete this.oSpy;
			this.oBtn.removeDelegate(this.oDelegate);
			delete this.oDelegate;
			this.oBtn.destroy();

			done();
		}.bind(this), 50);
	});

	QUnit.test("Check if small Animation is used", async function(assert) {
		var done = assert.async();

		this.oBtn = new Button({
			text : "Blub",
			width : "45px",
			busyIndicatorSize : 'Auto',
			busy : true,
			busyIndicatorDelay : 0
		}).placeAt("target1");

		this.oDelegate = {
			onAfterRendering : function(oEvent) {}
		};
		this.oBtn.addDelegate(this.oDelegate);
		this.oSpy = sinon.spy(this.oDelegate, "onAfterRendering");

		await nextUIUpdate();

		setTimeout(function() {
			var $Animation = jQuery(".sapUiLocalBusyIndicatorAnimation");
			assert.ok($Animation.length, "Animation exists");
			assert.ok($Animation.hasClass("sapUiLocalBusyIndicatorAnimSmall"), "Correct CSS class set to DOM");

			assert.equal(this.oSpy.callCount, 1, "Icon should be rendered once");

			this.oSpy.restore();
			delete this.oSpy;
			this.oBtn.removeDelegate(this.oDelegate);
			delete this.oDelegate;
			this.oBtn.destroy();

			done();
		}.bind(this), 50);
	});

	QUnit.test("Check if animations are stacked", async function(assert) {
		var done = assert.async();
		this.oVBox = new VBox({
			items : [
				new List({
					busyIndicatorDelay : 0,
					busy : true
				}),
				new List({
					busyIndicatorDelay : 0,
					busy : true
				})
			],
			busyIndicatorDelay : 0,
			busy : true
		}).placeAt("target3");

		await nextUIUpdate();

		setTimeout(function() {
			var $Animation = jQuery(".sapUiLocalBusyIndicatorAnimation");

			assert.equal($Animation.length, 3, "3 animations should be in DOM");
			assert.ok(!jQuery($Animation.get(0)).is(":visible"), "List1's animation is hidden");
			assert.ok(!jQuery($Animation.get(1)).is(":visible"), "List2's animation is hidden");
			assert.ok(jQuery($Animation.get(2)).is(":visible"), "VBox's animation is visible");

			this.oVBox.destroy();
			done();
		}.bind(this), 50);
	});

	QUnit.module("setBusy with rendering delegate", {
		beforeEach: function() {
			this.oButton = new Button({
				text: "Rendering Delegate"
			});

			this.oButton.setBusyIndicatorDelay(0);

			this.testClickEventOn = function (oControl, assert) {
				var oDomRef = oControl.getDomRef(),
					fnEventListener = sinon.spy();

				if (oDomRef) {
					oDomRef.addEventListener("click", fnEventListener);
					qutils.triggerEvent("click", oDomRef);
					assert.equal(fnEventListener.callCount, 1, "click event can be triggered correctly");
					oDomRef.removeEventListener("click", fnEventListener);
				} else {
					assert.ok(false, "The given control doesn't have DOM reference");
				}
			};
		},
		afterEach: function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("on control which is migrated with the new renderer mechanism", async function(assert) {
		// add one event delegate which set the busy state before the control is rerendered
		this.oButton.addEventDelegate({
			onBeforeRendering: function() {
				this.setBusy(true);
			}
		}, this.oButton);

		this.oButton.placeAt("target1");
		await nextUIUpdate();
		this.oButton.setBusy(false);
		// after reset the busy state, the control should be able to react to click event
		this.testClickEventOn(this.oButton, assert);

		// rerender the control to activate the busy state (problem only occurs with 2nd. rendering)
		this.oButton.invalidate();
		await nextUIUpdate();
		this.oButton.setBusy(false);
		// after reset the busy state, the control should be able to react to click event
		this.testClickEventOn(this.oButton, assert);
	});


	QUnit.module("getFocusDomRef wrapping while busy", {
		beforeEach: async function() {
			this.oList = new List({
				items: [new StandardListItem({ title: "Item" })]
			}).placeAt("target1");
			this.oList.setBusyIndicatorDelay(0);
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("getFocusDomRef returns block layer while control is busy", function(assert) {
		this.oList.setBusy(true);

		var oBlockLayer = this.oList.getDomRef("busyIndicator");
		assert.ok(oBlockLayer, "Block layer DOM exists");
		assert.strictEqual(this.oList.getFocusDomRef(), oBlockLayer,
			"getFocusDomRef returns the block layer while the control is busy");
	});

	QUnit.test("getFocusDomRef returns original value after busy is cleared", function(assert) {
		var oOriginalFocusDomRef = this.oList.getFocusDomRef();
		assert.ok(oOriginalFocusDomRef, "Original getFocusDomRef returns a DOM element");

		this.oList.setBusy(true);
		assert.notStrictEqual(this.oList.getFocusDomRef(), oOriginalFocusDomRef,
			"getFocusDomRef returns block layer, not original, while busy");

		this.oList.setBusy(false);
		assert.strictEqual(this.oList.getFocusDomRef(), oOriginalFocusDomRef,
			"getFocusDomRef returns the original value after busy is cleared");
	});

	QUnit.test("Subclass getFocusDomRef override is respected when not busy", async function(assert) {
		// Create a control with a custom getFocusDomRef override
		var oButton = new Button({ text: "Custom" });
		oButton.setBusyIndicatorDelay(0);
		oButton.placeAt("target1");
		await nextUIUpdate();

		// Button overrides getFocusDomRef — store its result before busy
		var oSubclassFocusDom = oButton.getFocusDomRef();
		assert.ok(oSubclassFocusDom, "Button has a custom getFocusDomRef result");

		oButton.setBusy(true);
		var oBlockLayer = oButton.getDomRef("busyIndicator");
		assert.strictEqual(oButton.getFocusDomRef(), oBlockLayer,
			"getFocusDomRef returns block layer while busy");

		oButton.setBusy(false);
		assert.strictEqual(oButton.getFocusDomRef(), oSubclassFocusDom,
			"Subclass getFocusDomRef override is restored after busy is cleared");

		oButton.destroy();
	});

	QUnit.test("getFocusDomRef wrapping survives rerendering while busy", async function(assert) {
		this.oList.setBusy(true);

		var oBlockLayer = this.oList.getDomRef("busyIndicator");
		assert.strictEqual(this.oList.getFocusDomRef(), oBlockLayer,
			"getFocusDomRef returns block layer before rerendering");

		// Trigger rerender
		this.oList.invalidate();
		await nextUIUpdate();

		var oNewBlockLayer = this.oList.getDomRef("busyIndicator");
		assert.ok(oNewBlockLayer, "New block layer exists after rerendering");
		assert.strictEqual(this.oList.getFocusDomRef(), oNewBlockLayer,
			"getFocusDomRef returns the new block layer after rerendering");
	});

	QUnit.test("focus() targets block layer while busy", function(assert) {
		this.oList.setBusy(true);

		var oBlockLayer = this.oList.getDomRef("busyIndicator");
		this.oList.focus();

		assert.strictEqual(document.activeElement, oBlockLayer,
			"focus() on a busy control sets focus to the block layer");
	});

	QUnit.test("Focus stays on block layer after rerendering a focused busy control", async function(assert) {
		// Focus the control before it becomes busy
		this.oList.focus();
		assert.ok(this.oList.getDomRef().contains(document.activeElement),
			"Control has focus before becoming busy");

		// Make the control busy — focus should move to block layer
		this.oList.setBusy(true);
		var oBlockLayer = this.oList.getDomRef("busyIndicator");
		assert.strictEqual(document.activeElement, oBlockLayer,
			"Block layer is focused after setting busy");

		// Trigger rerender
		this.oList.invalidate();
		await nextUIUpdate();

		// After rerendering, focus should still be on the (new) block layer
		var oNewBlockLayer = this.oList.getDomRef("busyIndicator");
		assert.ok(oNewBlockLayer, "Block layer exists after rerendering");
		assert.strictEqual(document.activeElement, oNewBlockLayer,
			"Focus is on the block layer after rerendering a focused busy control");
	});


	QUnit.module("Legacy", {
		beforeEach: function(assert) {
			var Log = sap.ui.require("sap/base/Log");
			assert.ok(Log, "Log module should be available");
			this.oLogSpy = sinon.spy(Log, "error");
		},
		afterEach: function() {
			this.oLogSpy.restore();
		}
	});

	/**
	 * @deprecated Since 1.15
	 */
	QUnit.test("LocalBusyIndicatorSupport", function(assert) {

		assert.equal(typeof Control.prototype.setDelay, "undefined", "Control#setDelay should not be available by default");

		// apply deprecated LocalBusyIndicatorSupport to Control prototype to make "setDelay" method available
		LocalBusyIndicatorSupport.apply(Control.prototype);

		assert.equal(Control.prototype.setDelay, Control.prototype.setBusyIndicatorDelay,
			"Control#setDelay should be available and a reference to #setBusyIndicatorDelay after applying legacy support");

		assert.ok(this.oLogSpy.notCalled, "No error should be logged");

	});

	/**
	 * @deprecated Since 1.15
	 */
	QUnit.test("LocalBusyIndicatorSupport (error handling)", function(assert) {

		// apply deprecated LocalBusyIndicatorSupport to a specific control
		LocalBusyIndicatorSupport.apply(Button.prototype);

		// LocalBusyIndicatorSupport should log an error when applying on a specific control
		sinon.assert.calledWithExactly(this.oLogSpy, "Only controls can use the LocalBusyIndicator", Button.prototype);

	});

});
