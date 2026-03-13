/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/ui/test/autowaiter/_cssTransitionWaiter",
	"sap/ui/test/autowaiter/_cssAnimationWaiter",
	"sap/ui/test/autowaiter/_UIUpdatesWaiter",
	"sap/m/NavContainer",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/core/IntervalTrigger",
	"sap/ui/core/ResizeHandler"
], function (_LogCollector, _autoWaiter, _timeoutWaiter, _XHRWaiter,
		_promiseWaiter, _cssTransitionWaiter, _cssAnimationWaiter, _UIUpdatesWaiter,
		NavContainer, App, Page, Button, opaTest, Opa5,
		nextUIUpdate, IntervalTrigger, ResizeHandler) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	[NavContainer, App].forEach(function (FnConstructor) {
		QUnit.module("NavigationContainerWaiter - " + FnConstructor.getMetadata().getName(), {
			beforeEach: function () {
				this.aIntervalListeners = [];
				this.aResizeListenerIds = [];

				this.oTimeoutWaiterStub = sinon.stub(_timeoutWaiter, "hasPending");
				this.oXHRWaiterStub = sinon.stub(_XHRWaiter, "hasPending");
				this.oPromiseWaiterStub = sinon.stub(_promiseWaiter, "hasPending");
				this.oCssTransitionWaiterStub = sinon.stub(_cssTransitionWaiter, "hasPending");
				this.oCssAnimationWaiterStub = sinon.stub(_cssAnimationWaiter, "hasPending");
				this.oUIUpdatesWaiterStub = sinon.stub(_UIUpdatesWaiter, "hasPending");
				this.oTimeoutWaiterStub.returns(false);
				this.oXHRWaiterStub.returns(false);
				this.oPromiseWaiterStub.returns(false);
				this.oCssTransitionWaiterStub.returns(false);
				this.oCssAnimationWaiterStub.returns(false);
				this.oUIUpdatesWaiterStub.returns(false);

				this.oInitialPageButton = new Button();
				this.oSecondPageButton = new Button();
				this.oInitialPage = new Page({
					showHeader: false,
					content: this.oInitialPageButton
				});
				this.oSecondPage = new Page({
					showHeader: false,
					content: this.oSecondPageButton
				});
				this.oNavContainer = new FnConstructor({
					pages: [this.oInitialPage, this.oSecondPage]
				}).placeAt("qunit-fixture");

				return nextUIUpdate();
			},

			afterEach: function () {
				this.aIntervalListeners.forEach(function (oListener) {
					IntervalTrigger.removeListener(oListener.fnListener, oListener.oContext);
				});
				this.aResizeListenerIds.forEach(function (sId) {
					ResizeHandler.deregister(sId);
				});

				this.oTimeoutWaiterStub.restore();
				this.oXHRWaiterStub.restore();
				this.oPromiseWaiterStub.restore();
				this.oCssTransitionWaiterStub.restore();
				this.oCssAnimationWaiterStub.restore();
				this.oUIUpdatesWaiterStub.restore();
				this.oNavContainer.destroy();
				return nextUIUpdate();
			}
		});

		QUnit.test("Should not match a Button while its navContainer is navigating", function (assert) {
			var fnDone = assert.async();
			var oNavigationLogRegExp = new RegExp("The NavContainer " + this.oNavContainer + " is currently navigating", "g");
			var bNavigationPendingWasDetected = false;
			var bIsAfterNavigate;
			var bWaitedAfterNavigateTick = false;
			var fnAfterNavigate = function () {
				bIsAfterNavigate = true;
			};

			var oIntervalListener = {
				onTrigger: function() {
					if (!bNavigationPendingWasDetected) {
						bNavigationPendingWasDetected = _autoWaiter.hasToWait();
						if (bNavigationPendingWasDetected) {
							assert.ok(bNavigationPendingWasDetected, "Navigation is in progress");
						}
					}

					if (bIsAfterNavigate && !bWaitedAfterNavigateTick) {
						bWaitedAfterNavigateTick = true;
						return;
					}

					if (bIsAfterNavigate) {
						oLogCollector.getAndClearLog();
						var bInitialResultAfterNavigationFinished = _autoWaiter.hasToWait();
						var bSecondResultAfterNavigationFinished = _autoWaiter.hasToWait();
						var aNavigationMatches = oLogCollector.getAndClearLog().match(oNavigationLogRegExp) || [];
						assert.ok(!bInitialResultAfterNavigationFinished, "Navigation is done");
						assert.ok(!bSecondResultAfterNavigationFinished, "Navigation is done");
						assert.strictEqual(aNavigationMatches.length, 0, "No navigation logs after navigation is done");
						IntervalTrigger.removeListener(this.onTrigger, this);
						fnDone();
					}
				}
			};
			this.aIntervalListeners.push({
				fnListener: oIntervalListener.onTrigger,
				oContext: oIntervalListener
			});
			IntervalTrigger.addListener(oIntervalListener.onTrigger, oIntervalListener);
			this.oNavContainer.attachAfterNavigate(fnAfterNavigate, this);
			this.oNavContainer.to(this.oSecondPage);
			var bInitialResultBeforeNavigationFinished = _autoWaiter.hasToWait();
			var bSecondResultBeforeNavigationFinished = _autoWaiter.hasToWait();
			var aNavigationMatches = oLogCollector.getAndClearLog().match(oNavigationLogRegExp) || [];

			assert.ok(aNavigationMatches.length >= 1, "Navigation logs are written while navigating");
			assert.ok(bInitialResultBeforeNavigationFinished, "Navigation is in progress");
			assert.ok(bSecondResultBeforeNavigationFinished, "Navigation is in progress");
		});

		QUnit.test("Should wait for resize notifications at navigatiion end", function (assert) {
			var fnDone = assert.async();
			var oResizeSpy = this.spy(ResizeHandler.prototype, "checkSizes");
			var bNavigationPendingWasDetected = false;
			var bIsAfterNavigate;
			var fnAfterNavigate = function () {
				bIsAfterNavigate = true;
			};

			var oIntervalListener = {
				onTrigger: function() {
					if (!bNavigationPendingWasDetected) {
						bNavigationPendingWasDetected = _autoWaiter.hasToWait();
					}

					if (bIsAfterNavigate) {
						assert.ok(bNavigationPendingWasDetected, "navigation in progress");
						assert.ok(oResizeSpy.called, "the resize listener is called at the next interval trigger");
						assert.notOk(_autoWaiter.hasToWait(), "no navigations in progress");
						IntervalTrigger.removeListener(this.onTrigger, this);
						fnDone();
					}
				}
			};
			this.oNavContainer.setDefaultTransitionName("show");
			// ensure ResizeHandler monitors at least one control for resize:
			this.aResizeListenerIds.push(ResizeHandler.register(this.oInitialPage, function(){}));
			this.aIntervalListeners.push({
				fnListener: oIntervalListener.onTrigger,
				oContext: oIntervalListener
			});
			IntervalTrigger.addListener(oIntervalListener.onTrigger, oIntervalListener);
			this.oNavContainer.attachAfterNavigate(fnAfterNavigate, this);
			oResizeSpy.reset();

			// Act
			this.oNavContainer.to(this.oSecondPage);
			bNavigationPendingWasDetected = _autoWaiter.hasToWait();

			// Check navigation detected
			assert.ok(bNavigationPendingWasDetected, "navigation in progress");
		});
	});

	QUnit.module("NavigationContainerWaiter - iFrame");

	opaTest("Should wait for navigating NavContainers in an IFrame", function (oOpa) {
		var oIFrameWindow;
		var oIFrameAutoWaiter;
		var oTimeoutWaiterStub;
		var oXHRWaiterStub;
		var oPromiseWaiterStub;
		var oApp;

		oOpa.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/miniUI5Site.html");

		oOpa.waitFor({
			viewName: "myView",
			id: "myApp",
			success: function (oFoundApp) {
				oApp = oFoundApp;
			}
		});

		oOpa.waitFor({
			viewName: "myView",
			id: "buttonOutsideOfTheApp",
			success: function () {
				oIFrameWindow = Opa5.getWindow();
				oTimeoutWaiterStub = oIFrameWindow.sinon.stub(oIFrameWindow.sap.ui.require("sap/ui/test/autowaiter/_timeoutWaiter"), "hasPending").returns(false);
				oXHRWaiterStub = oIFrameWindow.sinon.stub(oIFrameWindow.sap.ui.require("sap/ui/test/autowaiter/_XHRWaiter"), "hasPending").returns(false);
				oPromiseWaiterStub = oIFrameWindow.sinon.stub(oIFrameWindow.sap.ui.require("sap/ui/test/autowaiter/_promiseWaiter"), "hasPending").returns(false);
				oIFrameAutoWaiter = oIFrameWindow.sap.ui.require("sap/ui/test/autowaiter/_autoWaiter");

				Opa5.assert.ok(!oIFrameAutoWaiter.hasToWait(), "Navigation not started");
			}
		});

		oOpa.waitFor({
			success: function () {
				oApp.to(oApp.getPages()[1].getId());
			}
		});

		oOpa.waitFor({
			check: function () {
				return oIFrameAutoWaiter && oIFrameAutoWaiter.hasToWait();
			},
			success: function () {
				Opa5.assert.ok(true, "autoWaiter detected the navigation");
			}
		});

		oOpa.waitFor({
			success: function () {
				if (oTimeoutWaiterStub) {
					oTimeoutWaiterStub.restore();
				}
				if (oXHRWaiterStub) {
					oXHRWaiterStub.restore();
				}
				if (oPromiseWaiterStub) {
					oPromiseWaiterStub.restore();
				}
			}
		});

		oOpa.iTeardownMyApp();
	});
});
