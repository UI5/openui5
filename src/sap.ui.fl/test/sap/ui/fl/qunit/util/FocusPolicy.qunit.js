/* global QUnit */

sap.ui.define([
	"sap/ui/fl/util/FocusPolicy",
	"sap/ui/thirdparty/sinon-4"
], (
	FocusPolicy,
	sinon
) => {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oOriginalPermissionsPolicy = Object.getOwnPropertyDescriptor(Document.prototype, "permissionsPolicy")
		|| Object.getOwnPropertyDescriptor(document, "permissionsPolicy");
	const oOriginalFeaturePolicy = Object.getOwnPropertyDescriptor(Document.prototype, "featurePolicy")
		|| Object.getOwnPropertyDescriptor(document, "featurePolicy");

	function mockPermissionsPolicy(oValue) {
		Object.defineProperty(document, "permissionsPolicy", {
			value: oValue,
			configurable: true
		});
	}

	function mockFeaturePolicy(oValue) {
		Object.defineProperty(document, "featurePolicy", {
			value: oValue,
			configurable: true
		});
	}

	function restoreDocumentProperties() {
		if (oOriginalPermissionsPolicy) {
			Object.defineProperty(document, "permissionsPolicy", oOriginalPermissionsPolicy);
		} else {
			delete document.permissionsPolicy;
		}
		if (oOriginalFeaturePolicy) {
			Object.defineProperty(document, "featurePolicy", oOriginalFeaturePolicy);
		} else {
			delete document.featurePolicy;
		}
	}

	QUnit.module("sap.ui.fl.util.FocusPolicy", {
		afterEach() {
			sandbox.restore();
			restoreDocumentProperties();
			delete FocusPolicy._bSupported;
		}
	}, () => {
		QUnit.test("returns true when permissionsPolicy includes focus-without-user-activation", (assert) => {
			mockPermissionsPolicy({
				features() {
					return ["focus-without-user-activation", "camera", "microphone"];
				}
			});
			assert.strictEqual(FocusPolicy.isFocusPolicySupported(), true);
		});

		QUnit.test("returns true when featurePolicy includes focus-without-user-activation", (assert) => {
			mockPermissionsPolicy(undefined);
			mockFeaturePolicy({
				features() {
					return ["focus-without-user-activation"];
				}
			});
			assert.strictEqual(FocusPolicy.isFocusPolicySupported(), true);
		});

		QUnit.test("returns false when permissionsPolicy does not include focus-without-user-activation", (assert) => {
			mockPermissionsPolicy({
				features() {
					return ["camera", "microphone"];
				}
			});
			assert.strictEqual(FocusPolicy.isFocusPolicySupported(), false);
		});
	});
});
