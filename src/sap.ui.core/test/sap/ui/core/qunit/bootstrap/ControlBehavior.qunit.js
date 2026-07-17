/*global QUnit, sinon */
sap.ui.define([
    "sap/base/config",
    "sap/base/config/GlobalConfigurationProvider",
    "sap/ui/base/config/URLConfigurationProvider",
    "sap/ui/core/AnimationMode",
    "sap/ui/core/ControlBehavior",
	"sap/ui/core/UIArea"
], (
    BaseConfig,
    GlobalConfigurationProvider,
    URLConfigurationProvider,
    AnimationMode,
    ControlBehavior
	/* UIArea - Configures AnimationMode */
) => {
	"use strict";

    function getHtmlAttribute(sAttribute) {
		return document.documentElement.getAttribute(sAttribute);
	}

    QUnit.module("AnimationMode initial setting evaluation", {
		beforeEach: function() {
			this.mParams = {};
			BaseConfig._.invalidate();
			this.oGlobalConfigStub = sinon.stub(GlobalConfigurationProvider, "get");
			this.oGlobalConfigStub.callsFake(function(sKey) {
				if (this.mParams[sKey] !== undefined) {
					return this.mParams[sKey];
				} else {
					return this.oGlobalConfigStub.wrappedMethod.call(this, sKey);
				}
			}.bind(this));
			this.oBaseStub = sinon.stub(BaseConfig, "get");
			this.oBaseStub.callsFake(function(mParameters) {
				mParameters.provider = undefined;
				return this.oBaseStub.wrappedMethod.call(this, mParameters);
			}.bind(this));
		},
		afterEach: function() {
			this.oGlobalConfigStub.restore();
			this.oBaseStub.restore();
		}
	});

	QUnit.test("Invalid animation mode", function(assert) {
		this.mParams.sapUiAnimationMode = "someuUnsupportedStringValue";
		assert.throws(
			function() { ControlBehavior.getAnimationMode(); },
			new TypeError("Unsupported Enumeration value for sapUiAnimationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);
	});

	QUnit.test("Valid animation modes from enumeration", function(assert) {
		for (var sAnimationModeKey in AnimationMode) {
			if (AnimationMode.hasOwnProperty(sAnimationModeKey)) {
				BaseConfig._.invalidate();
				var sAnimationMode = AnimationMode[sAnimationModeKey];
				this.mParams.sapUiAnimationMode = sAnimationMode;
				assert.equal(ControlBehavior.getAnimationMode(), sAnimationMode, "Test for animation mode: " + sAnimationMode);
			}
		}
	});

	QUnit.module("AnimationMode changes at runtime", {
		beforeEach: function() {
			// Restore default animation mode
			ControlBehavior.setAnimationMode(AnimationMode.full);
		},
		afterEach: function() {
			ControlBehavior.setAnimationMode(AnimationMode.minimal);
		}
	});

	QUnit.test("Set animation mode to a valid value", function(assert) {
		const changeHandler = function (oEvent) {
			assert.strictEqual(oEvent.animationMode, AnimationMode.basic, "'change' event was executed with the correct event parameters.");
		};
		assert.equal(ControlBehavior.getAnimationMode(), AnimationMode.full, "Default animation mode is " + AnimationMode.full + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full);

		ControlBehavior.attachChange(changeHandler);
		ControlBehavior.setAnimationMode(AnimationMode.basic);
		assert.equal(ControlBehavior.getAnimationMode(), AnimationMode.basic, "Animation mode should switch to " + AnimationMode.basic + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.basic);
		ControlBehavior.detachChange(changeHandler);
	});

	QUnit.test("Set animation mode to " + AnimationMode.none + " to turn animation off", function(assert) {
		// Check if default values are set
		assert.equal(ControlBehavior.getAnimationMode(), AnimationMode.full, "Default animation mode is " + AnimationMode.full + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full, "Default animation mode should be injected as attribute.");

		// Change animation mode
		ControlBehavior.setAnimationMode(AnimationMode.none);
		assert.equal(ControlBehavior.getAnimationMode(), AnimationMode.none, "Animation mode should switch to " + AnimationMode.none + ".");
		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.none, "Animation mode should be injected as attribute.");
	});

	QUnit.test("Invalid animation mode", function(assert) {
		assert.throws(
			function() { ControlBehavior.setAnimationMode("someUnsupportedStringValue"); },
			new TypeError("Unsupported Enumeration value for animationMode, valid values are: full, basic, minimal, none"),
			"Unsupported value for animation mode should throw an error."
		);

		assert.equal(getHtmlAttribute("data-sap-ui-animation-mode"), AnimationMode.full, "Default animation mode should stay the same.");
	});

	QUnit.module("ExtendedKeyboardNavigation — getter (default)", {
		beforeEach: function() {
			this.mParams = {};
			BaseConfig._.invalidate();
			this.oGlobalConfigStub = sinon.stub(GlobalConfigurationProvider, "get");
			this.oGlobalConfigStub.callsFake(function(sKey) {
				if (this.mParams[sKey] !== undefined) {
					return this.mParams[sKey];
				}
				return this.oGlobalConfigStub.wrappedMethod.call(this, sKey);
			}.bind(this));
		},
		afterEach: function() {
			this.oGlobalConfigStub.restore();
			BaseConfig._.invalidate();
		}
	});

	QUnit.test("returns false by default", function(assert) {
		assert.strictEqual(
			ControlBehavior.isExtendedKeyboardNavigationEnabled(),
			false,
			"Extended Keyboard Navigation is disabled by default"
		);
	});

	QUnit.test("returns the configured value when sapUiExtendedKeyboardNavigation is set", function(assert) {
		this.mParams["sapUiExtendedKeyboardNavigation"] = "true";
		assert.strictEqual(
			ControlBehavior.isExtendedKeyboardNavigationEnabled(),
			true,
			"configured 'true' is reflected"
		);
	});

	QUnit.module("ExtendedKeyboardNavigation — getter (URL provider)", {
		beforeEach: function() {
			this.mParams = {};
			BaseConfig._.invalidate();
			this.oURLConfigStub = sinon.stub(URLConfigurationProvider, "get");
			this.oURLConfigStub.callsFake(function(sKey) {
				if (this.mParams[sKey] !== undefined) {
					return this.mParams[sKey];
				}
				return this.oURLConfigStub.wrappedMethod.call(this, sKey);
			}.bind(this));
		},
		afterEach: function() {
			this.oURLConfigStub.restore();
			BaseConfig._.invalidate();
		}
	});

	QUnit.test("returns the configured value when sapUiExtendedKeyboardNavigation is set via URL", function(assert) {
		this.mParams["sapUiExtendedKeyboardNavigation"] = "true";
		assert.strictEqual(
			ControlBehavior.isExtendedKeyboardNavigationEnabled(),
			true,
			"URL-configured 'true' is reflected"
		);
	});

	QUnit.module("ExtendedKeyboardNavigation — setter validation", {
		beforeEach: function() { BaseConfig._.invalidate(); },
		afterEach: function() { BaseConfig._.invalidate(); }
	});

	QUnit.test("throws TypeError on non-boolean argument", function(assert) {
		[ "true", "false", 1, 0, null, undefined, {}, [] ].forEach((vBadArg) => {
			assert.throws(
				() => ControlBehavior.setExtendedKeyboardNavigationEnabled(vBadArg),
				TypeError,
				"throws TypeError for " + JSON.stringify(vBadArg)
			);
		});
	});

	QUnit.test("state is unchanged after a rejected non-boolean call", function(assert) {
		const bBefore = ControlBehavior.isExtendedKeyboardNavigationEnabled();
		assert.throws(
			() => ControlBehavior.setExtendedKeyboardNavigationEnabled("true"),
			TypeError
		);
		assert.strictEqual(
			ControlBehavior.isExtendedKeyboardNavigationEnabled(),
			bBefore,
			"state unchanged"
		);
	});

	QUnit.module("ExtendedKeyboardNavigation — setter state and idempotency", {
		beforeEach: function() { BaseConfig._.invalidate(); },
		afterEach: function() {
			// restore default state for subsequent tests
			if (ControlBehavior.isExtendedKeyboardNavigationEnabled()) {
				ControlBehavior.setExtendedKeyboardNavigationEnabled(false);
			}
			BaseConfig._.invalidate();
		}
	});

	QUnit.test("setExtendedKeyboardNavigationEnabled(true) flips state", function(assert) {
		assert.strictEqual(ControlBehavior.isExtendedKeyboardNavigationEnabled(), false, "starts false");
		ControlBehavior.setExtendedKeyboardNavigationEnabled(true);
		assert.strictEqual(ControlBehavior.isExtendedKeyboardNavigationEnabled(), true, "is true after set");
	});

	QUnit.test("setExtendedKeyboardNavigationEnabled(false) flips back", function(assert) {
		ControlBehavior.setExtendedKeyboardNavigationEnabled(true);
		ControlBehavior.setExtendedKeyboardNavigationEnabled(false);
		assert.strictEqual(ControlBehavior.isExtendedKeyboardNavigationEnabled(), false, "back to false");
	});

	QUnit.test("setExtendedKeyboardNavigationEnabled with same value is a no-op (no event fires)", function(assert) {
		assert.expect(3);
		const aCalls = [];
		const fnHandler = (oEvent) => {
			if (oEvent.extendedKeyboardNavigation !== undefined) {
				aCalls.push(oEvent.extendedKeyboardNavigation);
			}
		};
		ControlBehavior.attachChange(fnHandler);
		ControlBehavior.setExtendedKeyboardNavigationEnabled(false); // same as default
		assert.deepEqual(aCalls, [], "no event for redundant call");
		ControlBehavior.setExtendedKeyboardNavigationEnabled(true);
		assert.deepEqual(aCalls, [true], "one event after actual change");
		ControlBehavior.setExtendedKeyboardNavigationEnabled(true); // idempotent
		assert.deepEqual(aCalls, [true], "still one event after idempotent call");
		ControlBehavior.detachChange(fnHandler);
	});

	QUnit.module("ExtendedKeyboardNavigation — public event", {
		beforeEach: function() { BaseConfig._.invalidate(); },
		afterEach: function() {
			if (ControlBehavior.isExtendedKeyboardNavigationEnabled()) {
				ControlBehavior.setExtendedKeyboardNavigationEnabled(false);
			}
			BaseConfig._.invalidate();
		}
	});

	QUnit.test("attached handler receives payload {extendedKeyboardNavigationEnabled} on change", function(assert) {
		assert.expect(3);
		const aEvents = [];
		const fnHandler = (oEvent) => aEvents.push(oEvent);
		ControlBehavior.attachExtendedKeyboardNavigationChanged(fnHandler);
		ControlBehavior.setExtendedKeyboardNavigationEnabled(true);
		assert.strictEqual(aEvents.length, 1, "one event fired");
		assert.strictEqual(
			aEvents[0].extendedKeyboardNavigationEnabled,
			true,
			"payload contains extendedKeyboardNavigationEnabled=true"
		);
		ControlBehavior.setExtendedKeyboardNavigationEnabled(false);
		assert.strictEqual(aEvents.length, 2, "second event fired on disable");
		ControlBehavior.detachExtendedKeyboardNavigationChanged(fnHandler);
	});

	QUnit.test("detached handler no longer receives events", function(assert) {
		const aEvents = [];
		const fnHandler = (oEvent) => aEvents.push(oEvent);
		ControlBehavior.attachExtendedKeyboardNavigationChanged(fnHandler);
		ControlBehavior.setExtendedKeyboardNavigationEnabled(true);
		assert.strictEqual(aEvents.length, 1, "received before detach");
		ControlBehavior.detachExtendedKeyboardNavigationChanged(fnHandler);
		ControlBehavior.setExtendedKeyboardNavigationEnabled(false);
		assert.strictEqual(aEvents.length, 1, "no event after detach");
	});

	QUnit.test("dual fire: setter notifies both private 'change' and public 'extendedKeyboardNavigationChanged'", function(assert) {
		assert.expect(2);
		const aPrivateCalls = [];
		const aPublicCalls = [];
		const fnPrivate = (oEvent) => {
			if (oEvent.extendedKeyboardNavigation !== undefined) {
				aPrivateCalls.push(oEvent.extendedKeyboardNavigation);
			}
		};
		const fnPublic = (oEvent) => {
			aPublicCalls.push(oEvent.extendedKeyboardNavigationEnabled);
		};
		ControlBehavior.attachChange(fnPrivate);
		ControlBehavior.attachExtendedKeyboardNavigationChanged(fnPublic);
		ControlBehavior.setExtendedKeyboardNavigationEnabled(true);
		assert.deepEqual(aPrivateCalls, [true], "private change fired once");
		assert.deepEqual(aPublicCalls, [true], "public event fired once");
		ControlBehavior.detachChange(fnPrivate);
		ControlBehavior.detachExtendedKeyboardNavigationChanged(fnPublic);
	});

	QUnit.test("idempotent setter call fires neither event", function(assert) {
		assert.expect(2);
		const aPrivateCalls = [];
		const aPublicCalls = [];
		const fnPrivate = (oEvent) => {
			if (oEvent.extendedKeyboardNavigation !== undefined) {
				aPrivateCalls.push(oEvent.extendedKeyboardNavigation);
			}
		};
		const fnPublic = () => aPublicCalls.push("called");
		ControlBehavior.attachChange(fnPrivate);
		ControlBehavior.attachExtendedKeyboardNavigationChanged(fnPublic);
		ControlBehavior.setExtendedKeyboardNavigationEnabled(false); // same as default
		assert.deepEqual(aPrivateCalls, [], "no private change");
		assert.deepEqual(aPublicCalls, [], "no public event");
		ControlBehavior.detachChange(fnPrivate);
		ControlBehavior.detachExtendedKeyboardNavigationChanged(fnPublic);
	});
});
