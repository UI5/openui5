/* global QUnit */

sap.ui.define([
	"sap/ui/dt/MetadataPropagationUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"qunit/MetadataTestUtil",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	MetadataPropagationUtil,
	OverlayRegistry,
	DesignTime,
	MetadataTestUtil,
	Button,
	Page,
	Text,
	Toolbar,
	VerticalLayout,
	sinon,
	nextUIUpdate
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Given empty propagation map (without 'propagateRelevantContainer' designTimeMetadata and no parent propagationInfos)", {
		beforeEach() {
			this.oVerticalLayout = new VerticalLayout("layout");
			this.oPage = new Page("test-page");
			this.mAggregationData = {};
			this.oVerticalLayoutOverlay = {
				getElement: () => this.oVerticalLayout,
				getDesignTimeMetadata: () => {
					return {
						getAggregation(sAggregation) {
							if (sAggregation === "myAggregation") {
								return this.mAggregationData;
							}
							return undefined;
						},
						getPropagateActions: () => []
					};
				}
			};
		},
		afterEach() {
			this.oVerticalLayout.destroy();
			this.oPage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when propagateMetadataToAggregationOverlay is called", function(assert) {
			const fnParentPropagationInfoSpy = sandbox.spy(MetadataPropagationUtil, "_getParentPropagationInfo");
			const fnPropagateRelevantContainerSpy = sandbox.spy(MetadataPropagationUtil, "_setPropagationInfo");
			const mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(
				this.oVerticalLayoutOverlay,
				"myAggregation",
				{}
			);
			assert.deepEqual(mResultData, this.mAggregationData, "then designtime metadata should not be changed");
			assert.notOk(mResultData.propagationInfos, "then no propagation infos are generated");
			assert.equal(fnParentPropagationInfoSpy.callCount, 1, "then _getParentPropagationInfo method should be called");
			assert.strictEqual(fnPropagateRelevantContainerSpy.withArgs({}, null).callCount, 0,
				"then '_setPropagationInfo' shouldn't be called");
		});

		QUnit.test("when '_setPropagationInfo' is called without attributes", function(assert) {
			assert.strictEqual(MetadataPropagationUtil._setPropagationInfo(), false,
				"then '_setPropagationInfo' should return false");
		});

		QUnit.test("when '_setPropagationInfo' is called with new relevantContainerPropagation object and without parentPropagation object", function(assert) {
			const oNewPropagationInfo = MetadataTestUtil.createPropagationInfoObject(true, this.oVerticalLayout, null);
			const oResult = MetadataPropagationUtil._setPropagationInfo(this.mAggregationData, oNewPropagationInfo, undefined);
			assert.strictEqual(oResult, this.mAggregationData,
				"then '_setPropagationInfo' should return metadata");
			assert.deepEqual(oResult.propagationInfos[0], oNewPropagationInfo,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains relevantContainer propagation object");
		});

		QUnit.test("when '_setPropagationInfo' is called with new relevantContainerPropagation object and with parentPropagation object", function(assert) {
			const aParentRelevantContainerPropagation = [MetadataTestUtil.createPropagationInfoObject(true, this.oPage, null)];
			const oNewPropagationInfo = MetadataTestUtil.createPropagationInfoObject(true, this.oVerticalLayout, null);
			const oResult = MetadataPropagationUtil._setPropagationInfo(
				this.mAggregationData,
				oNewPropagationInfo,
				aParentRelevantContainerPropagation
			);
			assert.strictEqual(oResult, this.mAggregationData,
				"then '_setPropagationInfo' should return metadata");
			assert.deepEqual(oResult.propagationInfos.length, 2,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains 2 objects");
			assert.deepEqual(oResult.propagationInfos[0], aParentRelevantContainerPropagation[0],
				"then after '_setPropagationInfo' is called, data of designtime metadata contains the parentRelevantContainer object");
			assert.deepEqual(oResult.propagationInfos[1], oNewPropagationInfo,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains also the oNewPropagationInfo object");
		});

		QUnit.test("when '_setPropagationInfo' is called without new relevantContainerPropagation object and with parentPropagation object", function(assert) {
			const aParentRelevantContainerPropagation = [MetadataTestUtil.createPropagationInfoObject(true, this.oPage, null)];
			const oResult = MetadataPropagationUtil._setPropagationInfo(this.mAggregationData, null, aParentRelevantContainerPropagation);
			assert.strictEqual(oResult, this.mAggregationData,
				"then '_setPropagationInfo' should return designTimeMetadata");
			assert.deepEqual(oResult.propagationInfos.length, 1,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains 1 objects");
			assert.deepEqual(oResult.propagationInfos[0], aParentRelevantContainerPropagation[0],
				"then after '_setPropagationInfo' is called, data of designtime metadata contains only the parentRelevantContainer object");
		});
	});

	QUnit.module("Given propagation map with 'propagateRelevantContainer' as boolean and without parent propagationInfos", {
		beforeEach() {
			this.oButton = new Button("test-button2");
			this.oButtonOverlay = {
				getElement: () => this.oButton,
				getDesignTimeMetadata: () => {
					return {
						getAggregation(sAggregation) {
							if (sAggregation === "myAggregation") {
								return { propagateRelevantContainer: true };
							}
							return undefined;
						},
						getPropagateActions: () => [],
						getName: () => ({ singular: "Button" })
					};
				}
			};
		},
		afterEach() {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			const fnPropagateRelevantContainerSpy = sandbox.spy(MetadataPropagationUtil, "_setPropagationInfo");
			const fnCurrentRelevantContainerPropagationSpy = sandbox.spy(MetadataPropagationUtil, "_getCurrentRelevantContainerPropagation");
			const fnCurrentDesigntimePropagationSpy = sandbox.spy(MetadataPropagationUtil, "_getCurrentDesigntimePropagation");
			const mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oButtonOverlay, "myAggregation");
			assert.equal(
				mResultData.propagationInfos[0].relevantContainerFunction(),
				true,
				"then relevantContainerFunction is set to the propagation info"
			);
			assert.strictEqual(
				mResultData.propagationInfos[0].relevantContainerElement,
				this.oButton,
				"then relevantContainerElement is set to the propagation info"
			);
			assert.strictEqual(fnCurrentRelevantContainerPropagationSpy.callCount, 1,
				"then '_getCurrentRelevantContainerPropagation' called once");
			assert.strictEqual(fnCurrentDesigntimePropagationSpy.callCount, 1,
				"then '_getCurrentDesigntimePropagation' called once");
			assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
				"then '_setPropagationInfo' called once");
			const oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
			assert.ok(oSpyArgs[1],
				"then '_setPropagationInfo' called with new propagationInfo");
			assert.strictEqual(oSpyArgs[1].relevantContainerFunction(), true,
				"then relevantContainerFunction should return 'true'");
			assert.notOk(oSpyArgs[2],
				"then '_setPropagationInfo' called without propagationInfo from parent");
		});
	});

	QUnit.module("Given propagation map with 'propagateRelevantContainer' as function and without parent propagationInfos", {
		beforeEach() {
			this.fnPropagateRelevantContainer = function() {
				return true;
			};
			this.oButton = new Button("test-button3");
			const oPropObject = { propagateRelevantContainer: this.fnPropagateRelevantContainer };
			this.oButtonOverlay = {
				getElement: () => this.oButton,
				getDesignTimeMetadata: () => {
					return {
						getAggregation(sAggregation) {
							if (sAggregation === "myAggregation") {
								return oPropObject;
							}
							return undefined;
						},
						getPropagateActions: () => [],
						getName: () => ({ singular: "Button" })
					};
				}
			};
		},
		afterEach() {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			const fnPropagateRelevantContainerSpy = sandbox.spy(MetadataPropagationUtil, "_setPropagationInfo");
			const mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oButtonOverlay, "myAggregation");
			assert.equal(
				mResultData.propagationInfos[0].relevantContainerFunction,
				this.fnPropagateRelevantContainer,
				"then relevantContainerFunction is set to the propagation info"
			);
			assert.strictEqual(
				mResultData.propagationInfos[0].relevantContainerElement,
				this.oButton,
				"then relevantContainerElement is set to the propagation info"
			);
			assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
				"then '_setPropagationInfo' called once");
			const oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
			assert.strictEqual(oSpyArgs[1].relevantContainerFunction, this.fnPropagateRelevantContainer,
				"then '_setPropagationInfo' called with propagatedRelevantContainer object");
			assert.notOk(oSpyArgs[2],
				"then '_setPropagationInfo' called without propagatedRelevantContainer object from parent");
		});
	});

	QUnit.module("Given propagation map with 'propagateRelevantContainer' as object and without parent propagationInfo", {
		beforeEach() {
			this.oButton = new Button("test-button4");
			this.oButtonOverlay = {
				getElement: () => this.oButton,
				getDesignTimeMetadata: () => {
					return {
						getAggregation(sAggregation) {
							if (sAggregation === "myAggregation") {
								return { propagateRelevantContainer: {} };
							}
							return undefined;
						},
						getPropagateActions: () => [],
						getName: () => ({ singular: "Button" })
					};
				}
			};
		},
		afterEach() {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			assert.throws(function() {
				MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oButtonOverlay, "myAggregation");
			}, /Wrong type: it should be either a function or a boolean value/,
			"then '_setPropagationInfo' should throw an exception");
		});
	});

	QUnit.module("Given propagation map with 'propagateMetadata' as function", {
		beforeEach() {
			this.oElement = new VerticalLayout("layout");
			this.oMetadataFunction = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button");
			this.oElementOverlay = {
				getElement: () => this.oElement,
				getDesignTimeMetadata: () => {
					return {
						getAggregation: (sAggregationName) => {
							if (sAggregationName === "myAggregation") {
								return this.oMetadataFunction;
							}
							return undefined;
						},
						getPropagateActions: () => [],
						getName: () => ({ singular: "Button" })
					};
				}
			};
		},
		afterEach() {
			this.oElement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			const fnPropagateRelevantContainerSpy = sandbox.spy(MetadataPropagationUtil, "_setPropagationInfo");
			const mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oElementOverlay, "myAggregation");
			assert.strictEqual(
				mResultData.propagationInfos[0].metadataFunction,
				this.oMetadataFunction.propagateMetadata,
				"then metadata function propagated successfully"
			);
			assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
				"then '_setPropagationInfo' called once");
			const oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
			assert.deepEqual(oSpyArgs[1].metadataFunction, this.oMetadataFunction.propagateMetadata,
				"then '_setPropagationInfo' called with propagationInfos object");
		});
	});

	QUnit.module("Given propagation map with 'propagateMetadata' as string", {
		beforeEach() {
			this.oElement = new VerticalLayout("layout");
			this.oMetadataFunction = { propagateMetadata: "propagateMatadata" };
			this.oElementOverlay = {
				getElement: () => this.oElement,
				getDesignTimeMetadata: () => {
					return {
						getAggregation: (sAggregationName) => {
							if (sAggregationName === "myAggregation") {
								return this.oMetadataFunction;
							}
							return undefined;
						},
						getPropagateActions: () => [],
						getName: () => ({ singular: "Button" })
					};
				}
			};
		},
		afterEach() {
			this.oElement.destroy();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			assert.throws(function() {
				MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oElementOverlay, "myAggregation");
			}, /Wrong type: it should be a function and it is:/,
			"then '_setPropagationInfo' should throw the following exception: wrong type: it should be a function...");
		});
	});

	QUnit.module("Given design time metadata has propagateActions set", {
		beforeEach() {
			this.oButton = new Button("test-button3");
			this.oButtonOverlay = {
				getElement: () => this.oButton,
				getDesignTimeMetadata: () => {
					return {
						getAggregation: () => { return { dummyMetadata: true }; },
						getAction: (sAction) => { return { changeType: `changeType-${sAction}` }; },
						getPropagateActions: () => ["myAction", { action: "myAction2", isActive: true }],
						getName: () => ({ singular: "MyButton" })
					};
				}
			};
		},
		afterEach() {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			const mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oButtonOverlay, "myAggregation");
			assert.strictEqual(
				mResultData.propagationInfos[0].propagatedActionInfo.propagatingControl.getId(),
				this.oButton.getId(),
				"then the action parent is properly set"
			);
			assert.strictEqual(
				mResultData.propagationInfos[0].propagatedActionInfo.propagatingControlName,
				"MyButton",
				"then the parent name is properly set"
			);
			assert.strictEqual(
				mResultData.propagationInfos[0].propagatedActionInfo.actions[0].name,
				"myAction",
				"then the first action name is properly set"
			);
			assert.strictEqual(
				mResultData.propagationInfos[0].propagatedActionInfo.actions[1].name,
				"myAction2",
				"then the second action name is properly set"
			);
			assert.strictEqual(
				mResultData.propagationInfos[0].propagatedActionInfo.actions[1].isActive,
				true,
				"then the second action isActive property is properly set"
			);
		});
		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called and the control has no name defined in DT metadata", function(assert) {
			sandbox.stub(this.oButtonOverlay, "getDesignTimeMetadata").returns({
				getAggregation: () => { return { dummyMetadata: true }; },
				getAction: (sAction) => { return { changeType: `changeType-${sAction}` }; },
				getPropagateActions: () => ["myAction", { action: "myAction2", isActive: true }],
				getName: () => (undefined)
			});
			const mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oButtonOverlay, "myAggregation");
			assert.strictEqual(
				mResultData.propagationInfos[0].propagatedActionInfo.propagatingControlName,
				"Button",
				"then the parent name is properly set"
			);
		});
	});

	QUnit.module("Given aggregationMetadata map without propagationInfos", {
		beforeEach() {
			this.oButton = new Button("test-button8");
			this.mAggregationData = { test: "test" };
			this.mElementData = {};
		},
		afterEach() {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToElementOverlay' is called without AggregationMetadata map", function(assert) {
			assert.strictEqual(
				MetadataPropagationUtil.propagateMetadataToElementOverlay(this.mElementData, undefined, this.oButton),
				this.mElementData,
				"then no relevant container added to the element"
			);
		});

		QUnit.test("when 'propagateMetadataToElementOverlay' is called", function(assert) {
			const mResultData = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mElementData,
				this.mAggregationData,
				this.oButton
			);
			assert.strictEqual(mResultData, this.mElementData, "then designtimeMetadata is returned without changes");
		});
	});

	QUnit.module("Given aggregationMetadata map with valid propagation information for relevantContainer propagation", {
		beforeEach() {
			this.oVerticalLayout = new VerticalLayout("layout1");
			this.oButton = new Button("test-button1");

			this.mAggregationData = {
				propagationInfos: [
					{
						relevantContainerElement: this.oVerticalLayout,
						relevantContainerFunction() {
							return true;
						}
					}
				]
			};
			this.mElementData = {};
		},
		afterEach() {
			this.oButton.destroy();
			this.oVerticalLayout.destroy();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToElementOverlay' is called", function(assert) {
			const mResultData = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mElementData,
				this.mAggregationData,
				this.oButton
			);
			assert.strictEqual(
				mResultData.relevantContainer.getId(),
				this.oVerticalLayout.getId(),
				"then the returned data map contains the relevantContainer element"
			);
		});

		QUnit.test("when 'propagateMetadataToElementOverlay' with incomplete relevant container information is called", function(assert) {
			// manipulate propagation information
			delete this.mAggregationData.propagationInfos[0].relevantContainerFunction;
			const mResultData = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mElementData,
				this.mAggregationData,
				this.oButton
			);
			assert.strictEqual(
				mResultData,
				this.mElementData,
				"then designtimeMetadata is returned without changes"
			);
			assert.strictEqual(
				mResultData.relevantContainer,
				undefined,
				"then the returned data map doesn't include the relevantContainer element"
			);
		});
	});

	QUnit.module("Given aggregationMetadata map for metadata propagation", {
		beforeEach() {
			this.oButton = new Button("button");
			this.oElement = new VerticalLayout("vertlay", {
				content: [this.oButton]
			});

			this.oMetadataFunction = MetadataTestUtil.createPropagateMetadataObject(
				"sap.m.Button", null, null, null
			);
			this.oPropagatedActionInfo = {
				propagatingControl: this.oElement,
				propagatingControlName: "Button",
				actions: [
					{
						name: "myPropagatedAction"
					},
					{
						name: "myOtherPropagatedAction",
						isActive: (oChildElement) => {
							return oChildElement.getId() === this.oButton.getId();
						}
					},
					{
						name: "excludedPropagatedAction",
						isActive: (oChildElement) => {
							return oChildElement.getId() !== this.oButton.getId();
						}
					}
				]
			};
			this.mAggregationData = {
				propagationInfos: [
					MetadataTestUtil.createPropagationInfoObject(
						null,
						this.oElement,
						this.oMetadataFunction.propagateMetadata,
						this.oPropagatedActionInfo
					)
				]
			};
			this.mElementData = MetadataTestUtil.buildMetadataObject("contentValue", "testValue").data;
		},
		afterEach() {
			this.oElement.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when propagateMetadataToElementOverlay is called for button", function(assert) {
			const oAggregations = this.oMetadataFunction.propagateMetadata(this.oButton).aggregations;
			const mResultData = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mElementData,
				this.mAggregationData,
				this.oButton
			);
			assert.notEqual(mResultData, this.mElementData, "then the metadata map was cloned and modified");
			assert.deepEqual(
				mResultData.aggregations.content,
				oAggregations.content,
				"then the metadata was propagated successfully from the aggregation overlay"
			);
			assert.deepEqual(
				mResultData.metadataContainer.getId(),
				this.oElement.getId(),
				"then relevant container is set inside metadataFunction while execution, as expected"
			);
			assert.strictEqual(mResultData.aggregations.testAggregation, "testValue", "then default aggregation still exists");
			assert.strictEqual(
				mResultData.propagatedActions[0].name,
				"myPropagatedAction",
				"then propagated action name is correct"
			);
			assert.strictEqual(
				mResultData.propagatedActions[1].name,
				"myOtherPropagatedAction",
				"then other propagated action name is correct"
			);
			assert.strictEqual(
				mResultData.propagatedActions[0].propagatingControl.getId(),
				this.oElement.getId(),
				"then propagating control is set"
			);
			assert.strictEqual(
				mResultData.propagatedActions[0].propagatingControlName,
				"Button",
				"then propagating control name is set"
			);
			assert.strictEqual(
				mResultData.propagatedActions[1].propagatingControl.getId(),
				this.oElement.getId(),
				"then propagating control is set"
			);
			assert.strictEqual(
				mResultData.propagatedActions[1].propagatingControlName,
				"Button",
				"then propagating control name is set"
			);
			assert.strictEqual(
				mResultData.propagatedActions.length,
				2,
				"then excluded propagated action is not set"
			);
		});

		QUnit.test("when getMetadataForPropagation is called with propagatedActionInfo but no metadataFunction", function(assert) {
			// Build a propagationInfos entry with NO metadataFunction — exercises the else branch directly
			const mAggregationDataNoFn = {
				propagationInfos: [
					MetadataTestUtil.createPropagationInfoObject(null, this.oElement, null, this.oPropagatedActionInfo)
				]
			};
			const mResult = MetadataPropagationUtil.getMetadataForPropagation(mAggregationDataNoFn, this.oButton);
			assert.ok(mResult, "then a metadata object is returned");
			assert.ok(Array.isArray(mResult.propagatedActions), "then propagatedActions array is present");
			assert.strictEqual(mResult.propagatedActions[0].name, "myPropagatedAction",
				"then first propagated action is included");
			assert.strictEqual(mResult.propagatedActions[1].name, "myOtherPropagatedAction",
				"then active propagated action is included");
			assert.strictEqual(mResult.propagatedActions.length, 2,
				"then inactive propagated action is excluded");
		});
	});

	QUnit.module("Given aggregationMetadata map with actions delete for metadata propagation", {
		beforeEach() {
			this.oButton = new Button("button");
			this.oElement = new VerticalLayout("vertlay", {
				content: [this.oButton]
			});

			this.mPropagateMetadata = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", undefined, null);
			this.mAggregationData = {
				propagationInfos: [
					MetadataTestUtil.createPropagationInfoObject(null, this.oElement, this.mPropagateMetadata.propagateMetadata)
				]
			};
			this.mElementData = MetadataTestUtil.buildMetadataObject({ actions: { myAction: "testAction" } }).data;
		},
		afterEach() {
			this.oElement.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToElementOverlay' is called", function(assert) {
			const mExtendedDesigntime = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mElementData,
				this.mAggregationData,
				this.oButton
			);
			assert.equal(mExtendedDesigntime.actions, null, "then element actions in designtime were replaced with null value");
			assert.equal(
				mExtendedDesigntime.aggregations.content.actions,
				null,
				"then all element aggregation actions were replaced with null value"
			);
		});

		QUnit.test("when 'propagateMetadataToElementOverlay' is called without aggregations defined", function(assert) {
			delete this.mElementData.aggregations;
			const mExtendedDesigntime = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mElementData,
				this.mAggregationData,
				this.oButton
			);
			const mExpectedAggregationData = this.mPropagateMetadata.propagateMetadata(this.oButton);
			assert.deepEqual(
				mExtendedDesigntime.aggregations,
				mExpectedAggregationData.aggregations,
				"then element designtime was extended empty aggregations object"
			);
		});
	});

	QUnit.module("Given aggregationMetadata map with actions 'not-adaptable' for metadata propagation", {
		beforeEach() {
			this.sNotAdaptable = "not-adaptable";
			this.oButton = new Button("button");
			this.oElement = new VerticalLayout("vertlay", {
				content: [this.oButton]
			});

			this.mPropagateMetadata = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", undefined, this.sNotAdaptable);
			this.mAggregationData = {
				propagationInfos: [
					MetadataTestUtil.createPropagationInfoObject(null, this.oElement, this.mPropagateMetadata.propagateMetadata)
				]
			};
			this.mElementData = MetadataTestUtil.buildMetadataObject({ actions: { myAction: "testAction" } }).data;
		},
		afterEach() {
			this.oElement.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when 'propagateMetadataToElementOverlay' is called", function(assert) {
			const mExtendedDesigntime = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mElementData,
				this.mAggregationData,
				this.oButton
			);
			assert.equal(
				mExtendedDesigntime.actions,
				this.sNotAdaptable,
				"then element actions in designtime were replaced with 'not-adaptable' value"
			);
			assert.equal(
				mExtendedDesigntime.aggregations.content.actions,
				this.sNotAdaptable,
				"then all element aggregation actions were replaced with 'not-adaptable' value"
			);
		});

		QUnit.test("when 'propagateMetadataToElementOverlay' is called without aggregations defined", function(assert) {
			delete this.mElementData.aggregations;
			const mExtendedDesigntime = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mElementData,
				this.mAggregationData,
				this.oButton
			);
			const mExpectedAggregationData = this.mPropagateMetadata.propagateMetadata(this.oButton);
			assert.deepEqual(
				mExtendedDesigntime.aggregations,
				mExpectedAggregationData.aggregations,
				"then element designtime was extended empty aggregations object"
			);
		});
	});

	QUnit.module("Given complex test with only 'propagateRelevantContainer' as function in the designTimeMetadata", {
		async beforeEach(assert) {
			const done = assert.async();
			this.fnPropagateRelevantContainer = function() {
				return true;
			};
			this.oMetadata = MetadataTestUtil.buildMetadataObject({ propagateRelevantContainer: this.fnPropagateRelevantContainer });
			this.oButton = new Button("test-button7");
			this.oPage = new Page({
				content: [this.oButton]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage],
				designTimeMetadata: { "sap.m.Page": this.oMetadata.data }
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oPage.destroy();
		}
	}, function() {
		QUnit.test("when overlay is created", function(assert) {
			const oContentAggregation = this.oPageOverlay.getAggregationOverlay("content");
			const mContentData = oContentAggregation.getDesignTimeMetadata().getData();
			assert.deepEqual(mContentData.propagationInfos.length, 1,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains 1 objects");
			assert.deepEqual(mContentData.propagationInfos[0].relevantContainerFunction, this.fnPropagateRelevantContainer,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains relevantContainer propagation function");
			assert.deepEqual(mContentData.propagationInfos[0].relevantContainerElement, this.oPage,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains relevantContainer propagation element");
		});
	});

	QUnit.module("Given that a complex test has been created with different relevantContainer and metadata propagations", {
		async beforeEach(assert) {
			// page				--> propagate relevant container for toolbar
			//					--> propagate metadata for toolbar
			//	verticalLayout 	--> propagate relevant container for buttons
			//					--> propagate metadata for buttons
			//		toolbar
			//			button1
			//			text
			//		button2
			// button3

			this.oMetadataForToolbar = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Toolbar");
			this.oMetadataForButton = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");
			Object.assign(this.oMetadataForToolbar, MetadataTestUtil.createPropagateMetadataObject("sap.m.Toolbar"));
			Object.assign(this.oMetadataForButton, MetadataTestUtil.createPropagateMetadataObject("sap.m.Button"));

			const oPageMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForToolbar);
			const oVerticalLayoutMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForButton);

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oText = new Text("text1");
			this.oToolbar = new Toolbar("toolbar1", {
				content: [this.oButton1, this.oText]
			});
			this.oVerticalLayout = new VerticalLayout("layout", {
				content: [this.oToolbar, this.oButton2]
			});
			this.oPage = new Page({
				content: [this.oVerticalLayout, this.oButton3]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage],
				designTimeMetadata: {
					"sap.m.Page": oPageMetadata.data,
					"sap.ui.layout.VerticalLayout": oVerticalLayoutMetadata.data
				}
			});

			const done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
				this.oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oTextOverlay = OverlayRegistry.getOverlay(this.oText);
				this.oToolbarOverlay = OverlayRegistry.getOverlay(this.oToolbar);
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oButton1Overlay.destroy();
			this.oButton2Overlay.destroy();
			this.oButton3Overlay.destroy();
			this.oTextOverlay.destroy();
			this.oToolbarOverlay.destroy();
			this.oVerticalLayoutOverlay.destroy();
			this.oPage.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when page overlay is created", function(assert) {
			const oContentAggregationOverlay = this.oPageOverlay.getAggregationOverlay("content");
			const oContentDesignTimeMetadata = oContentAggregationOverlay.getDesignTimeMetadata();

			assert.deepEqual(this.oPageOverlay.getRelevantContainer(), undefined,
				"then there is no propagated relevantContainer");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos.length, 1,
				"then the 'content' aggregation overlay contains only one propagationInfos");
		});

		QUnit.test("when verticalLayout overlay is created", function(assert) {
			const oContentAggregationOverlay = this.oVerticalLayoutOverlay.getAggregationOverlay("content");
			const oContentDesignTimeMetadata = oContentAggregationOverlay.getDesignTimeMetadata();

			assert.deepEqual(this.oVerticalLayoutOverlay.getRelevantContainer(), this.oPage,
				"then there is no propagated relevantContainer for the verticalLayout");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos.length, 2,
				"then the 'content' aggregation overlay contains two propagationInfos");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[0].relevantContainerFunction,
				this.oMetadataForToolbar.propagateRelevantContainer,
				"then the 'content' aggregation overlay first propagationInfos contains the relevant container function for the toolbar");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[1].relevantContainerFunction,
				this.oMetadataForButton.propagateRelevantContainer,
				"then the 'content' aggregation overlay second propagationInfos contains the relevant container function for the button");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[0].relevantContainerElement,
				this.oPage,
				"then the 'content' aggregation overlay first propagationInfos contains the element related to the page");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[1].relevantContainerElement,
				this.oVerticalLayout,
				"then the 'content' aggregation overlay second propagationInfos contains the element related to the verticalLayout");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[0].metadataFunction,
				this.oMetadataForToolbar.propagateMetadata,
				"then the 'content' aggregation overlay first propagationInfos contains the metadata function related to the toolbar");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[1].metadataFunction,
				this.oMetadataForButton.propagateMetadata,
				"then the 'content' aggregation overlay second propagationInfos contains the metadata function related to the button");
		});

		QUnit.test("when toolbar overlay is created", function(assert) {
			const mData = this.oMetadataForToolbar.propagateMetadata(this.oToolbar);
			const oContentAggregationOverlay = this.oToolbarOverlay.getAggregationOverlay("content");
			const oContentDesignTimeMetadata = oContentAggregationOverlay.getDesignTimeMetadata();

			assert.deepEqual(this.oToolbarOverlay.getRelevantContainer().getId(), this.oPage.getId(),
				"then page element as relevant container is propagated");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos.length, 2,
				"then the 'content' aggregation overlay contains two propagationInfos");
			assert.deepEqual(this.oToolbarOverlay.getDesignTimeMetadata().getAggregation("content").testProp,
				mData.aggregations.content.testProp,
				"then designtime metadata for toolbar is propagated from the page");
		});

		QUnit.test("when text overlay is created", function(assert) {
			assert.deepEqual(this.oTextOverlay.getRelevantContainer(), this.oToolbar,
				"then the parent is returned as propagated container by default");
		});

		QUnit.test("when button overlays are created", function(assert) {
			let mData = this.oMetadataForButton.propagateMetadata(this.oButton1);
			assert.deepEqual(this.oButton1Overlay.getRelevantContainer(), this.oVerticalLayout,
				"then the button1 has verticalLayout as relevant container");
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content"),
				mData.aggregations.content,
				"then designtime metadata for button1 is propagated from the vertical layout");
			mData = this.oMetadataForButton.propagateMetadata(this.oButton2);
			assert.deepEqual(this.oButton2Overlay.getRelevantContainer(), this.oVerticalLayout,
				"then the button2 has verticalLayout as relevant container");
			assert.deepEqual(this.oButton2Overlay.getDesignTimeMetadata().getAggregation("content"),
				mData.aggregations.content,
				"then designtime metadata for button2 is propagated from the vertical layout");
			assert.deepEqual(this.oButton3Overlay.getRelevantContainer(), this.oPage,
				"then the button3 has page as relevant container by default");
			assert.deepEqual(this.oButton3Overlay.getDesignTimeMetadata().getAggregation("content"), undefined,
				"then there is no designtime metadata propagation from vertical layout for button3");
		});
	});

	QUnit.module("Given a page with a vertical layout with toolbar, all containing propagateMetadata for button...", {
		async beforeEach(assert) {
			// page				--> propagate metadata for buttons
			//	verticalLayout 	--> propagate metadata for buttons
			//		toolbar     --> propagate metadata for buttons
			//			button1

			this.oMetadataForButtonInPage = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");
			Object.assign(this.oMetadataForButtonInPage,
				MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "valueForPage", undefined, "propertyFromPage"));
			this.oMetadataForButtonInLayout = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");
			Object.assign(this.oMetadataForButtonInLayout,
				MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "valueForLayout", undefined, "propertyFromLayout"));
			this.oMetadataForButtonInToolbar = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");
			Object.assign(this.oMetadataForButtonInToolbar,
				MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "valueForToolbar", undefined, "propertyFromToolbar"));

			const oPageMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForButtonInPage);
			const oVerticalLayoutMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForButtonInLayout);
			const oToolbarMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForButtonInToolbar);

			this.oButton1 = new Button("button1");
			this.oToolbar = new Toolbar("toolbar1", {
				content: [this.oButton1]
			});
			this.oVerticalLayout = new VerticalLayout("layout", {
				content: [this.oToolbar]
			});
			this.oPage = new Page({
				content: [this.oVerticalLayout]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage],
				designTimeMetadata: {
					"sap.m.Page": oPageMetadata.data,
					"sap.ui.layout.VerticalLayout": oVerticalLayoutMetadata.data,
					"sap.m.Toolbar": oToolbarMetadata.data
				}
			});

			const done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
				this.oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oToolbarOverlay = OverlayRegistry.getOverlay(this.oToolbar);
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oButton1Overlay.destroy();
			this.oToolbarOverlay.destroy();
			this.oVerticalLayoutOverlay.destroy();
			this.oPage.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when button overlay is created", function(assert) {
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content").testProp,
				"valueForPage",
				"then common property in all propagation levels is taken from the page (highest parent)");
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content").propertyFromPage,
				"propertyFromPage",
				"then the property set only on the page is propagated to the button");
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content").propertyFromLayout,
				"propertyFromLayout",
				"then the property set only on the layout is propagated to the button");
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content").propertyFromToolbar,
				"propertyFromToolbar",
				"then the property set only on the toolbar is propagated to the button");
		});
	});

	QUnit.module("propagateMetadataToElementOverlay — Set-based dedup and isolation guarantee", {
		beforeEach() {
			// Use a Toolbar which has many aggregations (content, ariaLabelledBy, …)
			this.oToolbar = new Toolbar("toolbar");
			// Build mTargetMetadata with several DT-aggregation entries that have actions
			this.mOriginalAggregations = {
				content: { actions: { rename: "rename" } },
				dependents: { actions: { remove: "remove" } },
				customData: { actions: { add: "add" } },
				layoutData: { actions: { move: "move" } },
				tooltip: { actions: { combine: "combine" } }
			};
			this.mTargetMetadata = {
				actions: { myAction: "testAction" },
				aggregations: this.mOriginalAggregations
			};
			// Deep-copy the original so we can check isolation afterwards
			this.mTargetMetadataCopy = JSON.parse(JSON.stringify(this.mTargetMetadata));

			const mPropagateMetadata = MetadataTestUtil.createPropagateMetadataObject("sap.m.Toolbar", undefined, "not-adaptable");
			this.mAggregationData = {
				propagationInfos: [
					MetadataTestUtil.createPropagationInfoObject(null, this.oToolbar, mPropagateMetadata.propagateMetadata)
				]
			};
		},
		afterEach() {
			this.oToolbar.destroy();
		}
	}, function() {
		QUnit.test("when called with many aggregations and 'not-adaptable', every aggregation's actions is rewritten", function(assert) {
			const mResult = MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mTargetMetadata,
				this.mAggregationData,
				this.oToolbar
			);
			const aResultKeys = Object.keys(mResult.aggregations);
			assert.ok(aResultKeys.length >= Object.keys(this.mOriginalAggregations).length,
				"then result contains at least as many aggregation keys as the input");
			// All DT aggregation entries that had actions must now have 'not-adaptable'
			Object.keys(this.mOriginalAggregations).forEach((sName) => {
				assert.strictEqual(
					mResult.aggregations[sName].actions,
					"not-adaptable",
					`then aggregation '${sName}' actions is rewritten to 'not-adaptable'`
				);
			});
			// No duplicate keys
			assert.strictEqual(
				aResultKeys.length,
				new Set(aResultKeys).size,
				"then there are no duplicate aggregation keys in the result"
			);
		});

		QUnit.test("when called with 'not-adaptable', the input mTargetMetadata and its aggregations are not mutated", function(assert) {
			MetadataPropagationUtil.propagateMetadataToElementOverlay(
				this.mTargetMetadata,
				this.mAggregationData,
				this.oToolbar
			);
			assert.deepEqual(
				this.mTargetMetadata,
				this.mTargetMetadataCopy,
				"then the input mTargetMetadata object is unchanged after propagation"
			);
			Object.keys(this.mOriginalAggregations).forEach((sName) => {
				assert.deepEqual(
					this.mTargetMetadata.aggregations[sName],
					this.mTargetMetadataCopy.aggregations[sName],
					`then aggregation '${sName}' in mTargetMetadata is unchanged`
				);
			});
		});

		QUnit.test("when called via metadataFunction path, the input mTargetMetadata aggregations are not mutated by merge", function(assert) {
			// This exercises the path where vPropagatedMetadata has aggregations but actions !== null/"not-adaptable",
			// so the not-adaptable branch is skipped and merge() runs directly on mResultMetadata.
			// Before the fix, mResultMetadata.aggregations pointed at mTargetMetadata.aggregations, so merge() would mutate it.
			const mPropagateMetadataWithAggr = MetadataTestUtil.createPropagateMetadataObject("sap.m.Toolbar", "propagatedValue");
			const mAggregationDataFnPath = {
				propagationInfos: [
					MetadataTestUtil.createPropagationInfoObject(null, this.oToolbar, mPropagateMetadataWithAggr.propagateMetadata)
				]
			};
			const mTargetWithContent = {
				aggregations: {
					content: { actions: { rename: "rename" }, existingProp: "original" }
				}
			};
			const mTargetCopy = JSON.parse(JSON.stringify(mTargetWithContent));

			MetadataPropagationUtil.propagateMetadataToElementOverlay(
				mTargetWithContent,
				mAggregationDataFnPath,
				this.oToolbar
			);

			assert.deepEqual(
				mTargetWithContent,
				mTargetCopy,
				"then mTargetMetadata is unchanged after propagation via metadataFunction path"
			);
			assert.strictEqual(
				mTargetWithContent.aggregations.content.existingProp,
				"original",
				"then the aggregation entry in mTargetMetadata is not mutated by the propagation merge"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});