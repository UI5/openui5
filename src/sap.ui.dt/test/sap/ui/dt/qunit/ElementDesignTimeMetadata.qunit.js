/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/core/Lib",
	"sap/ui/dt/ElementUtil",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/sinon-4"
], function(
	ElementDesignTimeMetadata,
	Lib,
	ElementUtil,
	Element,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Given that an ElementDesignTimeMetadata is created for a control", {
		beforeEach() {
			this.oElementDesignTimeMetadata = new ElementDesignTimeMetadata({
				data: {
					name: {
						singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
						plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
					},
					aggregations: {
						testAggregation: {
							displayName: {
								singular: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME",
								plural: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME_PLURAL"
							},
							testField: "testValue",
							actions: {
								action1: "firstChangeType",
								action2: {
									changeType: "secondChangeType"
								},
								action3(oElement) {
									return { changeType: oElement.name };
								},
								action4(oElement, foo, bar) {
									return { changeType: oElement.name + foo + bar };
								},
								action5: {
									subAction: {
										changeType: "subChangeType"
									}
								},
								action6: {
									subAction(oElement, foo, bar) {
										return { changeType: oElement.name + foo + bar };
									}
								}
							},
							childNames: {
								singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
								plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
							},
							ignore: false
						},
						testAggregation2: {
							testField: "testValue",
							actions: {
								action1: "firstChangeType-aggregation2"
							}
						},
						testAggregation3: {
							childNames(oElement) {
								// fake 2 cases:
								// 1. childNames is a function, that returns the object
								// 2. singular and plural can be functions to handle cases with self made resource bundling
								return {
									singular() {
										// fake own resource bundle handling
										return `I18N_KEY${oElement.getText()}`;
									},
									plural() {
										// fake own resource bundle handling
										return `I18N_KEY_PLURAL${oElement.getText()}`;
									}
								};
							},
							displayName(oElement) {
								// fake 2 cases:
								// 1. displayName is a function, that returns the object
								// 2. singular and plural can be functions to handle cases with self made resource bundling
								return {
									singular() {
										// fake own resource bundle handling
										return `I18N_KEY${oElement.getText()}`;
									},
									plural() {
										// fake own resource bundle handling
										return `I18N_KEY_PLURAL${oElement.getText()}`;
									}
								};
							}
						},
						testAggregation4: {
							ignore: true
						},
						testAggregation5: {
							ignore() {
								return false;
							}
						}
					},
					associations: {
						testAssociation: {
							aggregationLike: true
						}
					},
					getStableElements(oElement) {
						return [oElement, oElement];
					}
				}
			});
		},
		afterEach() {
			this.oElementDesignTimeMetadata.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the ElementDesignTimeMetadata is initialized", function(assert) {
			assert.strictEqual(
				this.oElementDesignTimeMetadata.hasAggregation("testAggregation"),
				true,
				"hasAggregations is true when aggregation data exists"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.hasAggregation("fakeAggregation"),
				false,
				"hasAggregations is false when aggregation data not exists"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.hasAggregation("testAssociation"),
				true,
				"hasAggregations is true when aggregation-like association data exists"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.getAggregation("testAggregation").testField,
				"testValue",
				"getAggregation returns data when aggregation it exists"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.getAggregation("fakeAggregation"),
				undefined,
				"getAggregation returns undefined when aggregation data doesn't exists"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.getAggregation("layout").ignore,
				true,
				"getAggregation returns correct data for default aggregations"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.getAggregation("testAssociation").aggregationLike,
				true,
				"getAggregation returns correct data for aggregation-like association"
			);
		});

		QUnit.test("when creating aggregation dt metadata", function(assert) {
			const oAggregationDesignTimeMetadata = this.oElementDesignTimeMetadata
			.createAggregationDesignTimeMetadata({ testData: "TestData" });
			assert.equal(
				oAggregationDesignTimeMetadata.getMetadata().getName(),
				"sap.ui.dt.AggregationDesignTimeMetadata",
				"then aggregation designtime metadata class is created"
			);
		});

		QUnit.test("when getActionDataFromAggregations is called", function(assert) {
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getActionDataFromAggregations("action1"),
				[
					{ changeType: "firstChangeType", aggregation: "testAggregation" },
					{ changeType: "firstChangeType-aggregation2", aggregation: "testAggregation2" }
				],
				"for string action, the correct object is returned"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getActionDataFromAggregations("action2"),
				[{ changeType: "secondChangeType", aggregation: "testAggregation" }],
				"for object action, the correct object is returned"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getActionDataFromAggregations("action3", { name: "thirdChangeType" }),
				[{ changeType: "thirdChangeType", aggregation: "testAggregation" }],
				"for function action, the correct object is returned"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getActionDataFromAggregations("action4", { name: "fourthChangeType" }, ["foo", "bar"]),
				[{ changeType: "fourthChangeTypefoobar", aggregation: "testAggregation" }],
				"for function action with parameters , the correct object is returned"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getActionDataFromAggregations(
					"action5", { name: "subChangeType" }, ["foo", "bar"], "subAction"
				),
				[{ changeType: "subChangeType", aggregation: "testAggregation" }],
				"when the function was called with an action, a sub-action and parameters, then the correct object is returned"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getActionDataFromAggregations(
					"action6", { name: "subChangeType" }, ["foo", "bar"], "subAction"
				),
				[{ changeType: "subChangeTypefoobar", aggregation: "testAggregation" }],
				"for function action with a function action, a sub-action and parameters, then the correct object is returned"
			);
		});

		QUnit.test("when getAggregationDescription is called", function(assert) {
			const oFakeElement = {
				getMetadata: sandbox.stub().returns({
					getLibraryName: sandbox.stub().returns("fakeLibrary"),
					getParent: sandbox.stub().returns(undefined)
				}),
				getText: sandbox.stub().returns("simulateElement")
			};
			const oFakeLibBundle = {
				getText: sandbox.stub().returnsArg(0), // just return i18n keys
				hasText: sandbox.stub().returns(false)
			};
			sandbox.stub(Lib, "getResourceBundleFor").returns(oFakeLibBundle);

			assert.deepEqual(
				this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation", oFakeElement),
				{
					singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
					plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
				},
				"then the translated texts are returned for static keys"
			);
			assert.notOk(
				this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation2", oFakeElement),
				"then undefined is returned missing childNames"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getAggregationDescription("testAggregation3", oFakeElement, "simulateElement"),
				{
					singular: "I18N_KEYsimulateElement",
					plural: "I18N_KEY_PLURALsimulateElement"
				}, "then the translated texts are returned for variable texts/keys"
			);
		});

		QUnit.test("when getAggregationDisplayName is called", function(assert) {
			const oFakeElement = {
				getMetadata: sandbox.stub().returns({
					getLibraryName: sandbox.stub().returns("fakeLibrary"),
					getParent: sandbox.stub().returns(undefined)
				}),
				getText: sandbox.stub().returns("simulateElement")
			};
			const oFakeLibBundle = {
				getText: sandbox.stub().returnsArg(0), // just return i18n keys
				hasText: sandbox.stub().returns(false)
			};
			sandbox.stub(Lib, "getResourceBundleFor").returns(oFakeLibBundle);

			const mExpectedDisplayNames = {
				singular: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME",
				plural: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME_PLURAL"
			};

			const mExpectedTranslatedTexts = {
				singular: "I18N_KEYsimulateElement",
				plural: "I18N_KEY_PLURALsimulateElement"
			};

			assert.deepEqual(
				this.oElementDesignTimeMetadata.getAggregationDisplayName("testAggregation", oFakeElement),
				mExpectedDisplayNames,
				"then the translated texts are returned for static keys"
			);
			assert.notOk(
				this.oElementDesignTimeMetadata.getAggregationDisplayName("testAggregation2", oFakeElement),
				"then undefined is returned missing childNames"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getAggregationDisplayName("testAggregation3", oFakeElement, "simulateElement"),
				mExpectedTranslatedTexts,
				"then the translated texts are returned for variable texts/keys"
			);
		});

		QUnit.test("when getText is called (with and without function)", function(assert) {
			const oElementDesignTimeMetadataWithFunction = new ElementDesignTimeMetadata({
				data: {
					name() {
						return {
							singular: "MY_FANCY_NAME",
							plural: "MY_FANCY_NAME_PLURAL"
						};
					}
				}
			});
			const oFakeElement = {
				getMetadata: sandbox.stub().returns({
					getLibraryName: sandbox.stub().returns("fakeLibrary"),
					getParent: sandbox.stub().returns(undefined)
				})
			};

			const oFakeLibBundle = {
				getText: sandbox.stub().returnsArg(0), // just return i18n keys
				hasText: sandbox.stub().returns(false)
			};
			sandbox.stub(Lib, "getResourceBundleFor").returns(oFakeLibBundle);

			assert.deepEqual(
				this.oElementDesignTimeMetadata.getName(oFakeElement),
				{
					singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
					plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
				},
				"then the translated texts are returned for static keys"
			);

			assert.deepEqual(
				oElementDesignTimeMetadataWithFunction.getName(oFakeElement),
				{
					singular: "MY_FANCY_NAME",
					plural: "MY_FANCY_NAME_PLURAL"
				},
				"then the translated texts are returned for static keys"
			);
		});

		QUnit.test("when getName, getAggregationDescription and getAggregationDisplayName are called with missing singular/plural keys", function(assert) {
			const oElementDesignTimeMetadataWithMissingKeys = new ElementDesignTimeMetadata({
				data: {
					name: {
						plural: "ONLY_PLURAL_NAME"
					},
					aggregations: {
						testAggregation: {
							childNames: {
								singular: "ONLY_SINGULAR_CHILD_NAME"
							},
							displayName: {
								plural: "ONLY_PLURAL_DISPLAY_NAME"
							}
						}
					}
				}
			});
			const oFakeElement = {
				getMetadata: sandbox.stub().returns({
					getLibraryName: sandbox.stub().returns("fakeLibrary"),
					getParent: sandbox.stub().returns(undefined)
				})
			};
			const oFakeLibBundle = {
				getText: sandbox.stub().returnsArg(0), // just return i18n keys
				hasText: sandbox.stub().returns(false)
			};
			sandbox.stub(Lib, "getResourceBundleFor").returns(oFakeLibBundle);

			assert.deepEqual(
				oElementDesignTimeMetadataWithMissingKeys.getName(oFakeElement),
				{
					singular: undefined,
					plural: "ONLY_PLURAL_NAME"
				},
				"then getName returns undefined for the missing singular key without resolving it"
			);
			assert.deepEqual(
				oElementDesignTimeMetadataWithMissingKeys.getAggregationDescription("testAggregation", oFakeElement),
				{
					singular: "ONLY_SINGULAR_CHILD_NAME",
					plural: undefined
				},
				"then getAggregationDescription returns undefined for the missing plural key without resolving it"
			);
			assert.deepEqual(
				oElementDesignTimeMetadataWithMissingKeys.getAggregationDisplayName("testAggregation", oFakeElement),
				{
					singular: undefined,
					plural: "ONLY_PLURAL_DISPLAY_NAME"
				},
				"then getAggregationDisplayName returns undefined for the missing singular key without resolving it"
			);

			oElementDesignTimeMetadataWithMissingKeys.destroy();
		});

		QUnit.test("when getLabel is called with label property available in the DesignTimeMetadata as a function", function(assert) {
			this.oElementDesignTimeMetadata.getData().getLabel = function(oElement) {
				return oElement.getId();
			};
			const oTestElement = new Element("testId");
			assert.strictEqual(
				this.oElementDesignTimeMetadata.getLabel(oTestElement),
				oTestElement.getId(),
				"then the correct element is received"
			);
			oTestElement.destroy();
			delete this.oElementDesignTimeMetadata.getData().label;
		});

		QUnit.test("when getLabel is called with label property not available in the DesignTimeMetadata", function(assert) {
			const fnLabelForElementStub = sandbox.stub(ElementUtil, "getLabelForElement");
			const aMockArguments = ["testArg1", "testArg2"];
			this.oElementDesignTimeMetadata.getLabel(aMockArguments);
			assert.ok(fnLabelForElementStub.calledOnce, "then ElementUtil.getLabelForElement() called once");
			assert.ok(
				fnLabelForElementStub.calledWith(aMockArguments),
				"then ElementUtil.getLabelForElement() called with the correct arguments"
			);
		});

		QUnit.test("when getAggregations method is called and DT Metadata has no aggregations nor associations", function(assert) {
			this.oElementDesignTimeMetadata.getData().aggregations = null;
			this.oElementDesignTimeMetadata.getData().associations = null;
			assert.deepEqual(this.oElementDesignTimeMetadata.getAggregations(), {}, "then an empty object is returned");
		});

		QUnit.test("when getAggregations is called with aggregationLike associations, the live getData() is not mutated", function(assert) {
			this.oElementDesignTimeMetadata.setData({
				aggregations: { a: {} },
				associations: { b: { aggregationLike: true } }
			});
			const mResult = this.oElementDesignTimeMetadata.getAggregations();
			assert.ok(mResult.a, "then the aggregation is included");
			assert.ok(mResult.b, "then the aggregationLike association is included");
			assert.notOk("b" in this.oElementDesignTimeMetadata.getData().aggregations, "then getData().aggregations was not mutated");
		});

		QUnit.test("when getAggregations is called twice, the same reference is returned (cache)", function(assert) {
			const mFirst = this.oElementDesignTimeMetadata.getAggregations();
			const mSecond = this.oElementDesignTimeMetadata.getAggregations();
			assert.strictEqual(mFirst, mSecond, "then the same object reference is returned");
		});

		QUnit.test("when setData is called, the getAggregations cache is invalidated", function(assert) {
			const mFirst = this.oElementDesignTimeMetadata.getAggregations();
			this.oElementDesignTimeMetadata.setData({ aggregations: { newAgg: {} } });
			const mSecond = this.oElementDesignTimeMetadata.getAggregations();
			assert.notStrictEqual(mFirst, mSecond, "then a new reference is returned after setData");
			assert.ok(mSecond.newAgg, "then the new aggregation is present");
		});

		QUnit.test("when getStableElements method is called and DT Metadata has a getStableElements function returning valid data", function(assert) {
			const oOverlay = {
				getElement() {
					return "element";
				}
			};
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getStableElements(oOverlay),
				["element", "element"],
				"the function returns the value of the function"
			);
		});

		QUnit.test("when getStableElements method is called and DT Metadata has a getStableElements function returning invalid data", function(assert) {
			const oOverlay = {
				getElement() {
					return "element";
				}
			};
			this.oElementDesignTimeMetadata.getData().getStableElements = function() {return "notAnArray";};
			assert.deepEqual(this.oElementDesignTimeMetadata.getStableElements(oOverlay), [], "the function returns an empty array");
		});

		QUnit.test("when getStableElements method is called and DT Metadata has no getStableElements function", function(assert) {
			const oOverlay = {
				getElement() {
					return "element";
				}
			};
			this.oElementDesignTimeMetadata.getData().getStableElements = undefined;
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getStableElements(oOverlay),
				["element"],
				"the function returns the value of the function"
			);
		});

		QUnit.test("when getToolHooks method is called and DT Metadata has no tool object", function(assert) {
			assert.ok(
				typeof this.oElementDesignTimeMetadata.getToolHooks().start === "function",
				"the function inside the object is part of the return"
			);
			assert.ok(
				typeof this.oElementDesignTimeMetadata.getToolHooks().stop === "function",
				"the function inside the object is part of the return"
			);
		});

		QUnit.test("when getToolHooks method is called and DT Metadata has a tool object", function(assert) {
			const oStartSpy = sandbox.spy();
			const oStopSpy = sandbox.spy();

			this.oElementDesignTimeMetadata.setData({
				...this.oElementDesignTimeMetadata.getData(),
				tool: {
					start: oStartSpy,
					stop: oStopSpy
				}
			});
			assert.ok(
				typeof this.oElementDesignTimeMetadata.getToolHooks().start === "function",
				"the function inside the object is part of the return"
			);
			assert.ok(
				typeof this.oElementDesignTimeMetadata.getToolHooks().stop === "function",
				"the function inside the object is part of the return"
			);
			this.oElementDesignTimeMetadata.getToolHooks().start("arg1");
			this.oElementDesignTimeMetadata.getToolHooks().stop("arg2");
			assert.ok(oStartSpy.withArgs("arg1").calledOnce);
			assert.ok(oStopSpy.withArgs("arg2").calledOnce);
		});

		QUnit.test("when 'getScrollContainers' is called without scrollContainers defined in the metadata", function(assert) {
			assert.ok(Array.isArray(this.oElementDesignTimeMetadata.getScrollContainers()), "an array is returned");
			assert.equal(this.oElementDesignTimeMetadata.getScrollContainers().length, 0, "the array is empty");
		});

		QUnit.test("when calling isAggregationIgnored", function(assert) {
			const oElement = { foo: "bar" };
			assert.strictEqual(
				this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation"),
				false,
				"the aggregation is not ignored"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation2"),
				false,
				"the aggregation not is ignored"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation4"),
				true,
				"the aggregation is ignored"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation5"),
				false,
				"the aggregation is not ignored"
			);
			assert.strictEqual(
				this.oElementDesignTimeMetadata.isAggregationIgnored(oElement, "testAggregation6"),
				false,
				"a not existent aggregation is not ignored"
			);
		});

		QUnit.test("when calling getAggregationNamesWithAction", function(assert) {
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getAggregationNamesWithAction("action1"),
				["testAggregation", "testAggregation2"],
				"the action is in two aggregations"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getAggregationNamesWithAction("action2"),
				["testAggregation"],
				"the action is in one aggregations"
			);
			assert.deepEqual(
				this.oElementDesignTimeMetadata.getAggregationNamesWithAction("fooAction"),
				[],
				"the action is in no aggregations"
			);
		});
	});

	QUnit.module(
		"Given that an ElementDesignTimeMetadata with scrollContainers with an array for aggregations is created for a control",
		{
			beforeEach() {
				this.oScrollContainer = {
					domRef: "foo",
					aggregations: ["a", "b"]
				};
				this.oElementDesignTimeMetadata = new ElementDesignTimeMetadata({
					data: {
						scrollContainers: [
							this.oScrollContainer
						]
					}
				});
			},
			afterEach() {
				this.oElementDesignTimeMetadata.destroy();
				sandbox.restore();
			}
		}, function() {
			QUnit.test("when 'getScrollContainers' is called", function(assert) {
				const aScrollContainers = this.oElementDesignTimeMetadata.getScrollContainers();
				assert.equal(aScrollContainers.length, 1, "there is one scrollContainer");
				assert.deepEqual(this.oScrollContainer, aScrollContainers[0], "the scrollContainer is correctly returned");
			});
		});

	QUnit.module(
		"Given that an ElementDesignTimeMetadata with scrollContainers with a function for aggregations is created for a control",
		{
			beforeEach() {
				this.oGetAggregationsStub = sandbox.stub();
				this.oElementDesignTimeMetadata = new ElementDesignTimeMetadata({
					data: {
						scrollContainers: [
							{
								domRef: "foo",
								aggregations: this.oGetAggregationsStub
							}
						]
					}
				});
			},
			afterEach() {
				this.oElementDesignTimeMetadata.destroy();
				sandbox.restore();
			}
		}, function() {
			QUnit.test("when 'getScrollContainers' is called multiple times", function(assert) {
				const fnUpdate = sandbox.stub();
				const oElement = { foo: "bar" };
				this.oGetAggregationsStub.returns(["a"]);
				const oExpectedScrollContainer = {
					domRef: "foo",
					aggregations: ["a"],
					aggregationsFunction: this.oGetAggregationsStub
				};
				const aScrollContainers = this.oElementDesignTimeMetadata.getScrollContainers(oElement, false, fnUpdate);
				assert.strictEqual(aScrollContainers.length, 1, "there is one scrollContainer");
				assert.strictEqual(this.oGetAggregationsStub.callCount, 1, "the aggregations function was called only once");
				assert.strictEqual(this.oGetAggregationsStub.getCall(0).args[0], oElement, "the element was passed");
				assert.strictEqual(this.oGetAggregationsStub.getCall(0).args[1], fnUpdate, "the update function was passed");
				assert.deepEqual(aScrollContainers[0], oExpectedScrollContainer, "the scrollContainer is correctly returned");

				this.oElementDesignTimeMetadata.getScrollContainers(oElement, false, fnUpdate);
				assert.strictEqual(this.oGetAggregationsStub.callCount, 1, "the aggregations function was not called again");

				this.oElementDesignTimeMetadata.getScrollContainers(oElement, true, fnUpdate);
				assert.strictEqual(this.oGetAggregationsStub.callCount, 2, "the aggregations function was called again");
				assert.strictEqual(this.oGetAggregationsStub.getCall(0).args[0], oElement, "the element was passed");
				assert.strictEqual(this.oGetAggregationsStub.getCall(0).args[1], fnUpdate, "the update function was passed");
			});

			QUnit.test("when setData is called, the scroll container cache is invalidated", function(assert) {
				const oElement = { foo: "bar" };
				this.oGetAggregationsStub.returns(["a"]);
				this.oElementDesignTimeMetadata.getScrollContainers(oElement, false, sandbox.stub());
				assert.strictEqual(this.oGetAggregationsStub.callCount, 1, "aggregations function called once before setData");
				this.oElementDesignTimeMetadata.setData(this.oElementDesignTimeMetadata.getData());
				this.oElementDesignTimeMetadata.getScrollContainers(oElement, false, sandbox.stub());
				assert.strictEqual(this.oGetAggregationsStub.callCount, 2, "aggregations function called again after setData");
			});

			QUnit.test("when 'getScrollContainers' is called, the original stored descriptor is not mutated", function(assert) {
				const oElement = { foo: "bar" };
				this.oGetAggregationsStub.returns(["a"]);
				this.oElementDesignTimeMetadata.getScrollContainers(oElement, false, sandbox.stub());
				assert.strictEqual(
					typeof this.oElementDesignTimeMetadata.getData().scrollContainers[0].aggregations,
					"function",
					"then the original aggregations property is still a function"
				);
			});

			QUnit.test("when 'getScrollContainers' is called for two different elements, each gets independent resolved aggregations", function(assert) {
				const oElementA = { id: "A" };
				const oElementB = { id: "B" };
				this.oGetAggregationsStub.withArgs(oElementA).returns(["a"]);
				this.oGetAggregationsStub.withArgs(oElementB).returns(["b", "c"]);

				const aContainersA = this.oElementDesignTimeMetadata.getScrollContainers(oElementA, false);
				const aContainersB = this.oElementDesignTimeMetadata.getScrollContainers(oElementB, false);

				assert.deepEqual(aContainersA[0].aggregations, ["a"], "then element A has its own resolved aggregations");
				assert.deepEqual(aContainersB[0].aggregations, ["b", "c"], "then element B has its own resolved aggregations");
				assert.notStrictEqual(aContainersA[0], aContainersB[0], "then the resolved containers are independent objects");
			});
		});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});