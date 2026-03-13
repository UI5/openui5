/*global QUnit, sinon*/
sap.ui.define([
	'sap/ui/performance/trace/Interaction',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/performance/trace/FESRHelper',
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/m/Button",
	"sap/m/Input",
	"sap/ui/test/utils/nextUIUpdate"
], function(Interaction, XMLView, FESRHelper, Press, EnterText, Button, Input, nextUIUpdate) {
	"use strict";

	QUnit.config.reorder = false;

	// performance is hijacked by sinon's fakeTimers (https://github.com/sinonjs/fake-timers/issues/374)
	// and might be out of sync with the latest specs and APIs. Therefore, mock them further,
	// so they won't affect tests.
	//
	// *Note:* Call this method after sinon.useFakeTimers(); as for example performance.timeOrigin is read only
	// in its nature and cannot be modified otherwise.
	function mockPerformanceObject (bRestorePerformance) {
		const oPerformance = globalThis.performance;
		const clock = sinon.useFakeTimers();
		if (bRestorePerformance !== false) {
			globalThis.performance = oPerformance;
		}
		return clock;
	}

	QUnit.module("Interaction API", {
		before: function() {
			return Interaction.setActive(true);
		},
		after: function() {
			return Interaction.setActive(false);
		}
	});

	QUnit.test("add BusyIndicator duration", function(assert) {

		assert.expect(4);
		Interaction.start();
		var oPendingInteraction = Interaction.getPending();
		var iBusyDuration = oPendingInteraction.busyDuration;

		assert.strictEqual(iBusyDuration, 0, "no busy duration should have been added");

		//busy indicator adds busy duration - everything is fine
		Interaction.addBusyDuration(33);
		iBusyDuration = oPendingInteraction.busyDuration;
		assert.strictEqual(iBusyDuration, 33, "busy indicator adds busy duration");


		// interaction is ended because a key was pressed (busy indicator still shows)
		Interaction.end(true);
		assert.notOk(Interaction.getPending(), "interaction is ended because a key was pressed");

		//BusyIndicator#hide uis triggered which calls #addBusyDuration, this call should not fail
		try {
			Interaction.addBusyDuration(33);
		} catch (e) {
			assert.notOk(e, "addBusyDuration should not fail");
		}
		assert.strictEqual(iBusyDuration, oPendingInteraction.busyDuration, "no additional duration is added");

	});

	QUnit.test("set component name", function(assert) {

		assert.expect(5);
		Interaction.start();
		var oPendingInteraction = Interaction.getPending();
		var sComponentName = oPendingInteraction.stepComponent;


		assert.strictEqual(oPendingInteraction.component, "undetermined", "component name should not be set");
		assert.strictEqual(sComponentName, undefined, "step component name should not be set");

		Interaction.setStepComponent("foo");
		sComponentName = oPendingInteraction.stepComponent;
		assert.strictEqual(sComponentName, "foo", "component name should be set");


		Interaction.end(true);
		assert.notOk(Interaction.getPending(), "interaction is ended because a key was pressed");

		try {
			Interaction.setStepComponent("bar");
		} catch (e) {
			assert.notOk(e, "setStepComponent should not fail");
		}
		assert.strictEqual(sComponentName, "foo", "no additional duration is added");

		Interaction.clear();

	});

	QUnit.module("Interaction API - liveChange filtering", {
		before: async function() {
			this.oOriginalPerformance = globalThis.performance;
			// Use sinon fake timers WITHOUT restoring the real performance object,
			// so that clock.tick() also controls performance.now() — needed to
			// produce a measurable duration while keeping legacyDuration near zero.
			this.clock = mockPerformanceObject(false);
			// Sinon's fake performance does not implement the full Performance API.
			// Stub the missing methods as noops so _InteractionImpl.js does not throw.
			globalThis.performance.getEntriesByType = () => [];
			globalThis.performance.clearResourceTimings = () => {};
			globalThis.performance.timeOrigin = 1000; // must be non-zero: now()=timeOrigin+performance.now()=0 would be falsy
			// setActive is async; await it so that _InteractionImpl is loaded and the
			// startup interaction is created before we call end(true) to clear it.
			await Interaction.setActive(true);
			// setActive(true) always creates a startup interaction via notifyStepStart;
			// end and clear it so it does not absorb liveChange step notifications.
			Interaction.end(true);
			Interaction.clear();
		},
		after: function() {
			Interaction.setActive(false);
			this.clock.runAll();
			this.clock.restore();
			globalThis.performance = this.oOriginalPerformance;
		}
	});

	QUnit.test("liveChange keystrokes should not be recorded as interactions", async function(assert) {
		assert.expect(3);

		let iDebounceTimer;
		const oInput = new Input({
			liveChange() {
				// Simulate FilterField's _fnLiveChangeTimer: 300ms debounce that resets on each
				// keystroke and triggers an async step (e.g. typeahead request) after 300ms idle.
				clearTimeout(iDebounceTimer);
				iDebounceTimer = setTimeout(() => {
					const fnEnd = Interaction.notifyAsyncStep();
					fnEnd();
				}, 300);
			}
		});
		oInput.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const iBaselineCount = Interaction.getAll().length;

		// keepFocus: true avoids _simulateFocusout, which would trigger Input re-rendering
		// and set preliminaryEnd before the 301ms grace-period timer fires.
		const oEnterText = new EnterText({ text: "a", clearTextFirst: false, keepFocus: true });

		// First keystroke: creates interaction, liveChange fires, starts 300ms debounce.
		oEnterText.executeOn(oInput);
		this.clock.tick(100); // < 301ms: grace period not yet expired, interaction still pending

		assert.strictEqual(Interaction.getAll().length - iBaselineCount, 0,
			"liveChange interaction stays pending before the 301ms grace period expires");

		// Second keystroke within the grace period resets the debounce.
		// The 301ms grace period (from "a") fires at t=301ms → finalizes the interaction.
		// legacyDuration ≈ 0ms (set at t=0); without fix (duration >= 2): recorded, with fix: filtered.
		oEnterText.executeOn(oInput);
		this.clock.tick(400); // > 301ms: grace period fires, debounce from "b" also expires (noop: no pending interaction)

		assert.strictEqual(Interaction.getAll().length - iBaselineCount, 0,
			"liveChange keystroke interactions without a typeahead request are filtered");

		// Final keystroke: user stops typing → 300ms debounce fires → notifyAsyncStep resets
		// legacyEndTime to now(). When the new 301ms grace period fires, legacyDuration = 300ms >= 2
		// → the interaction IS recorded. This verifies the fix does not filter valid interactions.
		oEnterText.executeOn(oInput);
		this.clock.tick(700); // covers 300ms debounce + 301ms new grace period

		assert.strictEqual(Interaction.getAll().length - iBaselineCount, 1,
			"final liveChange interaction followed by an async step (typeahead request) is recorded");

		Interaction.clear();
		oInput.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.module("Interaction API with fake timer", {
		before: function() {
			this.oOriginalPerformance = globalThis.performance;
			this.clock = mockPerformanceObject();
			Interaction.setActive(true);
		},
		after: function() {
			Interaction.setActive(false);

			// Run all pending setTimeout and restore the timer
			this.clock.runAll();
			this.clock.restore();
			globalThis.performance = this.oOriginalPerformance;
		}
	});

	QUnit.test("Semantic Stepname", function(assert) {
		assert.expect(2);

		return XMLView.create({
			definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:fesr="http://schemas.sap.com/sapui5/extension/sap.ui.core.FESR/1">'
			+ '          <Button id="btnWithDeclarativeSemanticAnnotation" text="Create something" fesr:press="create"/>                     '
			+ '          <Button id="btnWithProgramaticSemanticAnnotation" text="Delete something"/>                     '
			+ '    </mvc:View>         '
		}).then(async function (oView) {
			oView.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
			return new Promise(function(resolve, reject) {
				var oBtn1 = oView.byId("btnWithDeclarativeSemanticAnnotation"),
					oBtn2 = oView.byId("btnWithProgramaticSemanticAnnotation"),
					oPress = new Press(),
					oInteraction;

				FESRHelper.setSemanticStepname(oBtn2, "press", "delete");

				oBtn1.attachPress(function () {
					oInteraction = Interaction.getPending();
					assert.strictEqual(oInteraction.semanticStepName, "create", "Semantic step name declared in XMLView is correct");
					this.clock.tick(301); // 301ms in order to trigger the notifyStepEnd timeout
					oPress.executeOn(oBtn2);
				}.bind(this));

				oBtn2.attachPress(function () {
					oInteraction = Interaction.getPending();
					assert.strictEqual(oInteraction.semanticStepName, "delete", "Semantic step name set programatically is correct");
					resolve();
				});

				oPress.executeOn(oBtn1);
			}.bind(this)).then(function () {
				// cleanup
				oView.destroy();
			});
		}.bind(this));
	});

	QUnit.test("Pending interaction should be finalized even if the handler does not trigger any timing relevant action.", async function (assert) {
		assert.expect(3);

		//Create and render button
		var oButton = new Button({
			press: function () {
				// event handler without timing relevant action
				var oPendingInteraction = Interaction.getPending();
				assert.strictEqual(oPendingInteraction.trigger, oButton.getId(), "Pending Interaction for button '" + oButton.getId() + "' exist.");
				assert.strictEqual(oPendingInteraction.event, "press", "Pending Interaction has the correct event");
			}
		});
		oButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Press button and check that a new interaction is created and that the interaction is also finalized after 300ms
		var oPress = new Press();
		oPress.executeOn(oButton);
		this.clock.tick(301);
		assert.notOk(Interaction.getPending(), "There is no pending interaction anymore.");
	});

	QUnit.test("Cleanup browser events in case they don't lead to an interaction.", async function (assert) {
		assert.expect(5);
		var notifyEventStartSpy = sinon.spy(Interaction, "notifyEventStart");
		var notifyEventEndSpy = sinon.spy(Interaction, "notifyEventEnd");
		assert.notOk(Interaction.eventEndTimer, "There shouldn't be an eventEndTimer and therefore also no oCurrentBrowserEvent");

		//Create and render button
		var oButton = new Button(); // Button without press handler to simulate controls which should not result in interactions
		oButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Press button and check that browser events are triggered
		var oPress = new Press();
		oPress.executeOn(oButton);
		assert.strictEqual(notifyEventStartSpy.callCount, 4, "There should be 4 browser events started after pressing the button.");
		assert.strictEqual(notifyEventEndSpy.callCount, 4, "There should be 4 browser events ended after pressing the button.");
		assert.ok(Interaction.eventEndTimer, "There should be an eventEndTimer to cleanup oCurrentBrowserEvent at the end.");
		this.clock.tick(10);
		assert.notOk(Interaction.eventEndTimer, "There shouldn't be an eventEndTimer at the end after the oCurrentBrowserEvent was reset.");
	});
});
