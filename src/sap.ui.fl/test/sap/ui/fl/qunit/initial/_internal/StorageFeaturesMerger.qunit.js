/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/initial/_internal/StorageFeaturesMerger"
], function(
	sinon,
	Layer,
	StorageFeaturesMerger
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Basic functions", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("mergeResults with empty aResponse", function(assert) {
			var aResponse = [];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse, {});
			assert.deepEqual(oResult, {}, "empty response");
		});

		QUnit.test("mergeResults with different responses", function(assert) {
			var oResponse1 = {
				layers: [],
				features: { isProductiveSystem: false, isVariantAuthorNameAvailable: true }
			};
			var oResponse2 = {
				layers: [Layer.CUSTOMER],
				features: { isKeyUser: true, isKeyUserTranslationEnabled: true, isProductiveSystem: true }
			};
			var oResponse3 = {
				layers: [],
				features: { newKey: true }
			};
			var aResponse = [oResponse1, oResponse2, oResponse3];

			var oResult = StorageFeaturesMerger.mergeResults(aResponse, {});

			assert.equal(oResult.newKey, true, "get new key");
			assert.equal(oResult.isKeyUser, true, "last isKeyUser is true");
			assert.equal(oResult.isProductiveSystem, true, "isProductiveSystem is true");
			assert.equal(oResult.isKeyUserTranslationEnabled, true, "isKeyUserTranslationEnabled is true");
			assert.equal(oResult.isVariantAuthorNameAvailable, true, "isVariantAuthorNameAvailable is true");
		});

		QUnit.test("mergeResults with different values for a Key User write operations", function(assert) {
			// isAnnotationChangeEnabled is enabled for the CUSTOMER layer only
			const oResponse1 = {
				layers: ["ALL"],
				features: { isAnnotationChangeEnabled: false }
			};
			const oResponse2 = {
				layers: [],
				features: { isAnnotationChangeEnabled: true }
			};
			const oResponse3 = {
				layers: ["USER"],
				features: { isAnnotationChangeEnabled: true, foobar: false }
			};
			const oResponse4 = {
				features: { isAnnotationChangeEnabled: true, foobar: true }
			};
			const oLayerConfiguration = {
				isAnnotationChangeEnabled: [Layer.CUSTOMER],
				foobar: [Layer.USER]
			};
			const oResult = StorageFeaturesMerger.mergeResults([oResponse1, oResponse2, oResponse3, oResponse4], oLayerConfiguration);

			assert.strictEqual(oResult.isAnnotationChangeEnabled, false, "the value with the correct layer is taken");
			assert.strictEqual(oResult.foobar, false, "the value with the correct layer is taken");
		});

		QUnit.test("mergeResults with different values for a Key User write operations", function(assert) {
			// isAnnotationChangeEnabled is enabled for the CUSTOMER layer only
			const oResponse1 = {
				layers: ["CUSTOMER"],
				features: { isAnnotationChangeEnabled: false }
			};
			const oResponse2 = {
				layers: [],
				features: { isAnnotationChangeEnabled: true }
			};
			const oResponse3 = {
				layers: ["USER"],
				features: { isAnnotationChangeEnabled: true }
			};
			const oLayerConfiguration = {
				isAnnotationChangeEnabled: [Layer.CUSTOMER]
			};
			const oResult = StorageFeaturesMerger.mergeResults([oResponse1, oResponse2, oResponse3], oLayerConfiguration);

			assert.strictEqual(oResult.isAnnotationChangeEnabled, false, "the value with the correct layer is taken");
		});
	});

	QUnit.module("Layer specific handling if isKeyUser", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		[{
			description: "no layer are configured and ",
			expectedLogs: 0,
			connectors: [{
				layers: [],
				isKeyUser: undefined
			}],
			expectedValue: undefined
		}, {
			description: "no CUSTOMER layer",
			expectedLogs: 0,
			connectors: [{
				layers: [],
				isKeyUser: undefined
			}],
			expectedValue: undefined
		}, {
			description: "the CUSTOMER layer configured",
			expectedLogs: 0,
			connectors: [{
				layers: [Layer.CUSTOMER_BASE, Layer.CUSTOMER, Layer.PUBLIC, Layer.USER],
				isKeyUser: undefined
			}],
			expectedValue: undefined
		}, {
			description: "with layers configured to ALL",
			expectedLogs: 0,
			connectors: [{
				layers: ["ALL"],
				isKeyUser: undefined
			}],
			expectedValue: undefined
		}, {
			description: "no layer are configured and the key user flag is set to false",
			expectedLogs: 1,
			connectors: [{
				layers: [],
				isKeyUser: false
			}],
			expectedValue: undefined
		}, {
			description: "no CUSTOMER layer and the key user flag is set to false",
			expectedLogs: 1,
			connectors: [{
				layers: [Layer.CUSTOMER_BASE],
				isKeyUser: false
			}],
			expectedValue: undefined
		}, {
			description: "the CUSTOMER layer configured and the key user flag is set to false",
			expectedLogs: 0,
			connectors: [{
				layers: [Layer.CUSTOMER],
				isKeyUser: false
			}],
			expectedValue: false
		}, {
			description: "with layers configured to ALL and the key user flag is set to false",
			expectedLogs: 0,
			connectors: [{
				layers: ["ALL"],
				isKeyUser: false
			}],
			expectedValue: false
		}, {
			description: "no layer are configured and the key user flag is set to true",
			expectedLogs: 1,
			connectors: [{
				layers: [],
				isKeyUser: true
			}],
			expectedValue: undefined
		}, {
			description: "no CUSTOMER layer and the key user flag is set to true",
			expectedLogs: 1,
			connectors: [{
				layers: [Layer.CUSTOMER_BASE],
				isKeyUser: true
			}],
			expectedValue: undefined
		}, {
			description: "the CUSTOMER layer configured and the key user flag is set to true",
			expectedLogs: 0,
			connectors: [{
				layers: [Layer.CUSTOMER],
				isKeyUser: true
			}],
			expectedValue: true
		}, {
			description: "with layers configured to ALL and the key user flag is set to true",
			expectedLogs: 0,
			connectors: [{
				layers: ["ALL"],
				isKeyUser: true
			}],
			expectedValue: true
		}].forEach(function(oTestSetup) {
			QUnit.test(`merge handles the layer specific key user flag: ${oTestSetup.description}`, (assert) => {
				const aConnectors = oTestSetup.connectors.map((oConnector) => {
					const oFeatures = {};

					if (oConnector.isKeyUser !== undefined) {
						oFeatures.isKeyUser = oConnector.isKeyUser;
					}

					return {
						layers: oConnector.layers,
						features: oFeatures
					};
				});

				const oResult = StorageFeaturesMerger.mergeResults(aConnectors, { isKeyUser: [Layer.CUSTOMER] });

				assert.equal(oResult.isKeyUser, oTestSetup.expectedValue);
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
