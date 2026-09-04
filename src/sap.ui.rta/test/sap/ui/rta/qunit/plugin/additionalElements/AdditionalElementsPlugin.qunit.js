/* global QUnit */

sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Input",
	"sap/ui/core/CustomData",
	"sap/ui/core/EventBus",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/util/CancelError",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/additionalElements/ActionExtractor",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	isEmptyObject,
	merge,
	ObjectPath,
	Log,
	Bar,
	Button,
	Input,
	CustomData,
	EventBus,
	Library,
	DesignTime,
	OverlayRegistry,
	DtUtil,
	DelegateMediator,
	DelegateMediatorAPI,
	CancelError,
	ChangesWriteAPI,
	FieldExtensibility,
	VerticalLayout,
	JSONModel,
	nextUIUpdate,
	CommandFactory,
	AdditionalElementsActionExtractor,
	AdditionalElementsAnalyzer,
	AdditionalElementsPlugin,
	RTAPlugin,
	RTAUtils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	// TODO: refactor whole file:
	// 3. use before/after hooks to setup stuff for whole module if needed
	// 5. avoid creation of many DesignTime instances just for creating one single overlay <=
	// 6. add comprehensive comments at least to each module - what is going on there

	const TEST_DELEGATE_PATH = "sap/ui/rta/enablement/TestDelegate";
	const DEFAULT_REQUIRED_LIBRARIES = {
		"sap.uxap": {
			minVersion: "1.44",
			lazy: false
		},
		"sap.ui.layout": {
			minVersion: "1.20",
			lazy: false
		}
	};

	// ensure a model specific delegate exists for a model not used anywhere else
	const SomeModel = JSONModel.extend("sap.ui.rta.qunit.test.Model");

	const DEFAULT_MANIFEST = {
		"sap.app": {
			id: "applicationId",
			applicationVersion: {
				version: "1.2.3"
			}
		},
		"sap.ui5": {
			dependencies: {
				minUI5Version: "2.6.4",
				libs: {
					"sap.ui.core": {
						minVersion: "2.5.4"
					},
					"sap.m": {
						minVersion: "2.3.5"
					},
					"sap.ui.layout": {
						lazy: true
					}
				}
			}
		}
	};
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "applicationId", DEFAULT_MANIFEST);

	const sVariantManagementReference = "test-variant-management-reference";
	const sandbox = sinon.createSandbox();

	function registerControlsForChanges() {
		sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
		sandbox.stub(ChangesWriteAPI, "create").resolves({
			getSupportInformation() {
				return {};
			},
			setSupportInformation() {}
		});
	}

	async function getMenuEntryAndCheck(assert, oOverlay, bIsSibling, oAssertions) {
		await DtUtil.waitForSynced(this.oDesignTime)();
		const bIsEditable = await this.oPlugin._isEditableCheck(oOverlay, bIsSibling);
		assert.strictEqual(bIsEditable, oAssertions.editable, "then the overlay is editable");
		assert.strictEqual(this.oPlugin.isAvailable([oOverlay], {}, bIsSibling), oAssertions.available, "then the action is available");

		const oMenuItem = (await this.oPlugin.getMenuItems([oOverlay]))[0];
		if (oMenuItem) {
			if (typeof oMenuItem.enabled === "function") {
				assert.strictEqual(oMenuItem.enabled([oOverlay], oMenuItem), oAssertions.enabled, "then the action is enabled");
			} else {
				assert.strictEqual(oMenuItem.enabled, oAssertions.enabled, "then the action is enabled");
			}
			if (oAssertions.text) {
				assert.strictEqual(oMenuItem.text, oAssertions.text, "then the menu item has the correct text");
			}
		}
		return oMenuItem;
	}

	async function getMenuEntryAndCallHandler(oOverlay) {
		await this.oPlugin._isEditableCheck(oOverlay, true);
		await this.oPlugin._isEditableCheck(oOverlay, false);
		const oMenuItem = (await this.oPlugin.getMenuItems([oOverlay]))[0];
		return oMenuItem.handler([oOverlay], { menuItem: oMenuItem });
	}

	const ON_SIBLING = "SIBLING";
	const ON_CHILD = "CHILD";
	const ON_CONTAINER = "CONTAINER";
	const ON_IRRELEVANT = "IRRELEVANT";

	const oRTATexts = Library.getResourceBundleFor("sap.ui.rta");
	const fnOriginalGetResourceBundleFor = Library.getResourceBundleFor;
	const oFakeLibBundle = {
		getText: sandbox.stub().returnsArg(0),
		hasText: sandbox.stub().returns(true)
	};
	sinon.stub(Library, "getResourceBundleFor").callsFake(function(...aArgs) {
		const [sLibraryName] = aArgs;
		if (sLibraryName === "sap.ui.layout" || sLibraryName === "sap.m") {
			return oFakeLibBundle;
		}
		return fnOriginalGetResourceBundleFor.apply(this, aArgs);
	});

	QUnit.module("Context Menu Operations: Given a plugin whose dialog always close with OK", {
		async beforeEach(assert) {
			registerControlsForChanges();
			sandbox.stub(RTAPlugin.prototype, "hasChangeHandler").resolves(true);
			await givenSomeBoundControls.call(this, assert);

			givenThePluginWithOKClosingDialog.call(this);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			this.oPseudoPublicParent.destroy();
			DelegateMediator.clear();
			sandbox.restore();
		}
	}, function() {
		[
			{
				dtMetadata: {
					reveal: {
						changeType: "unhideControl"
					}
				},
				sibling: false,
				msg: "when the control's dt metadata has NO add.delegate and a reveal action"
			},
			{
				dtMetadata: {
					reveal: {
						changeType: "unhideControl"
					}
				},
				sibling: true,
				msg: " when the control's dt metadata has NO add.delegate and a reveal action"
			},
			{
				dtMetadata: {
					add: {
						delegate: {
							changeType: "foo"
						}
					}
				},
				sibling: false,
				msg: "when the control's dt metadata has an add.delegate and NO reveal action"
			},
			{
				dtMetadata: {
					add: {
						delegate: {
							changeType: "foo"
						}
					}
				},
				sibling: true,
				msg: "when the control's dt metadata has an add.delegate and NO reveal action"
			},
			{
				dtMetadata: {
					add: {
						delegate: {
							changeType: "foo",
							changeOnRelevantContainer: true
						}
					}
				},
				sibling: true,
				delegateRegistration: {
					instanceSpecific: true
				},
				msg: "when the control's dt metadata has an add.delegate with instance-specific delegate and NO reveal action"
			},
			{
				dtMetadata: {
					reveal: {
						changeType: "unhideControl",
						changeOnRelevantContainer: true
					}
				},
				sibling: true,
				msg: " when the control's dt metadata has a reveal action with changeOnRelevantContainer"
			}
		].forEach(function(test) {
			const sPrefix = test.sibling ? "As sibling: " : "As child: ";
			const sOverlayType = test.sibling ? ON_SIBLING : ON_CHILD;

			QUnit.test(sPrefix + test.msg, async function(assert) {
				const oOverlay = await createOverlayWithAggregationActions.call(
					this,
					test.dtMetadata,
					sOverlayType,
					test.delegateRegistration
				);
				this.oPlugin.registerElementOverlay(oOverlay);
				const oMenuItem = await getMenuEntryAndCheck.call(this, assert, oOverlay, test.sibling, {
					text: !test.sibling && test.dtMetadata.reveal ?
						oRTATexts.getText("CTX_ADD_ELEMENTS_WITH_SUBMENU") :
						oRTATexts.getText("CTX_ADD_ELEMENTS", ["I18N_KEY_USER_FRIENDLY_CONTROL_NAME"]),
					editable: true,
					available: true,
					enabled: true
				});
				if (!test.sibling && test.dtMetadata.reveal) {
					assert.equal(oMenuItem.submenu.length, 3, "there are three submenus for the three aggregations");
					assert.equal(
						oMenuItem.submenu[0].id,
						"CTX_ADD_ELEMENTS_AS_CHILD_0",
						"the first submenu is for the first aggregation"
					);
					assert.equal(
						oMenuItem.submenu[1].id,
						"CTX_ADD_ELEMENTS_AS_CHILD_1",
						"the second submenu is for the second aggregation"
					);
					assert.equal(
						oMenuItem.submenu[2].id,
						"CTX_ADD_ELEMENTS_AS_CHILD_2",
						"the third submenu is for the third aggregation"
					);
				}
			});
		});

		QUnit.test(" when the control's dt metadata has add via delegate action but the delegate is read-only", function(assert) {
			return createOverlayWithAggregationActions.call(
				this,
				{
					add: {
						delegate: {
							changeType: "foo"
						}
					}
				},
				ON_SIBLING,
				{
					instanceSpecific: false,
					modelSpecificRead: true,
					controlSpecificWrite: false
				}
			)
			.then(function(oOverlay) {
				this.oPlugin.registerElementOverlay(oOverlay);
				return DtUtil.waitForSynced(this.oDesignTime, function() {
					return oOverlay;
				})();
			}.bind(this))
			.then(function(oOverlay) {
				assert.notOk(this.oPlugin.isAvailable([oOverlay], true), "then the action is not available");
			}.bind(this));
		});

		QUnit.test(" when the control's dt metadata has add via delegate action but the delegate is write-only", function(assert) {
			return createOverlayWithAggregationActions.call(
				this,
				{
					add: {
						delegate: {
							changeType: "foo"
						}
					}
				}, ON_SIBLING,
				{
					instanceSpecific: false,
					modelSpecificRead: false,
					controlSpecificWrite: true
				}
			)
			.then(function(oOverlay) {
				this.oPlugin.registerElementOverlay(oOverlay);
				return DtUtil.waitForSynced(this.oDesignTime, function() {
					return oOverlay;
				})();
			}.bind(this))
			.then(function(oOverlay) {
				assert.notOk(this.oPlugin.isAvailable([oOverlay], true), "then the action is not available");
			}.bind(this));
		});

		QUnit.test(" when the control's dt metadata has a reveal action, but no name", async function(assert) {
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				},
				noName: true
			}, ON_SIBLING);
			this.oPlugin.registerElementOverlay(oOverlay);
			await DtUtil.waitForSynced(this.oDesignTime)();
			const sExpectedControlTypeText = oRTATexts.getText("MULTIPLE_CONTROL_NAME");
			const sExpectedText = oRTATexts.getText("CTX_ADD_ELEMENTS", [sExpectedControlTypeText]);
			await getMenuEntryAndCheck.call(this, assert, oOverlay, true, {
				text: sExpectedText,
				editable: true,
				available: true,
				enabled: true
			});
		});

		QUnit.test(" when the control's dt metadata has a reveal action with function allowing reveal only for some instances", async function(assert) {
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal(oControl) {
					if (oControl.getId() === "Invisible1") {
						return {
							changeType: "unhideControl"
						};
					}
					return undefined;
				}
			}, ON_SIBLING);
			this.oPlugin.registerElementOverlay(oOverlay);
			await DtUtil.waitForSynced(this.oDesignTime)();
			await getMenuEntryAndCheck.call(this, assert, oOverlay, true, {
				editable: true,
				available: true,
				enabled: true
			});
		});

		[
			{
				dtMetadata: {},
				on: ON_CHILD,
				sibling: false,
				msg: "when the control's dt metadata has NO addViaDelegate and NO reveal action"
			},
			{
				dtMetadata: {},
				on: ON_SIBLING,
				sibling: true,
				msg: "when the control's dt metadata has NO addViaDelegate and NO reveal action"
			}
		].forEach(function(test) {
			var sPrefix = test.sibling ? "On sibling: " : "On child: ";

			QUnit.test(sPrefix + test.msg, async function(assert) {
				const oOverlay = await createOverlayWithAggregationActions.call(this, test.dtMetadata, test.on);
				sandbox.stub(oOverlay, "isVisible").returns(true);
				sandbox.stub(oOverlay.getParentElementOverlay(), "isVisible").returns(true);
				await getMenuEntryAndCheck.call(this, assert, oOverlay, test.sibling, {
					editable: false,
					available: false
				});
			});
		});

		QUnit.test("On sibling, when the control's dt metadata has a reveal action but no invisible siblings", async function(assert) {
			var oDTMetadata = {
				reveal: {
					changeType: "unhideControl"
				}
			};

			// Elements from other aggregations can also be revealed on this overlay
			this.oUnsupportedInvisible.setVisible(true);
			this.oInvisible1.setVisible(true);
			this.oInvisible2.setVisible(true);

			const oOverlay = await createOverlayWithAggregationActions.call(this, oDTMetadata, ON_IRRELEVANT);
			sandbox.stub(oOverlay, "isVisible").returns(true);
			sandbox.stub(oOverlay.getParentElementOverlay(), "isVisible").returns(true);
			await getMenuEntryAndCheck.call(this, assert, oOverlay, true, {
				editable: false,
				available: false
			});
		});
	});

	QUnit.module("Given a plugin whose dialog always close with CANCEL", {
		async beforeEach(assert) {
			registerControlsForChanges();
			await givenSomeBoundControls.call(this, assert);

			givenThePluginWithCancelClosingDialog.call(this);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			this.oPseudoPublicParent.destroy();
			DelegateMediator.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the control's dt metadata has reveal and addViaDelegate actions", async function(assert) {
			var fnElementModifiedStub = sandbox.stub();

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				},
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			this.oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			assert.ok(this.fnGetCommandSpy.notCalled, "then no commands are created");
			assert.ok(fnElementModifiedStub.notCalled, "then the element modified event is not thrown");
		});

		QUnit.test("when the control's dt metadata has reveal and addViaDelegate actions with changeOnRelevantContainer", async function(assert) {
			var fnElementModifiedStub = sandbox.stub();

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl",
					changeOnRelevantContainer: true
				},
				add: {
					delegate: {
						changeType: "addFields",
						changeOnRelevantContainer: true
					}
				}
			}, ON_CHILD);
			this.oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);
			await getMenuEntryAndCallHandler.call(this, oOverlay);

			assert.ok(this.fnGetCommandSpy.notCalled, "then no commands are created");
			assert.ok(fnElementModifiedStub.notCalled, "then the element modified event is not thrown");
		});

		QUnit.test(" when the control's dt metadata has a reveal action with function allowing reveal only for some instances", async function(assert) {
			var REVEALABLE_CTRL_ID = "Invisible1";
			this.fnEnhanceInvisibleElementsStub.restore();
			this.fnEnhanceInvisibleElementsStub = sandbox.stub(AdditionalElementsAnalyzer, "enhanceInvisibleElements").resolves([]);

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal(oControl) {
					if (oControl.getId() === REVEALABLE_CTRL_ID) {
						return {
							changeType: "unhideControl"
						};
					}
					return null;
				}
			}, ON_SIBLING);

			await getMenuEntryAndCallHandler.call(this, oOverlay);

			const mActions = this.fnEnhanceInvisibleElementsStub.firstCall.args[1];
			assert.strictEqual(mActions.reveal.elements.length, 1, "only one of the invisible actions can be revealed");
			assert.strictEqual(
				mActions.reveal.elements[0].element.getId(),
				REVEALABLE_CTRL_ID,
				"only the control that can be revealed is found"
			);
		});
	});

	QUnit.module("Given a plugin whose dialog always close with OK", {
		async beforeEach(assert) {
			registerControlsForChanges();
			await givenSomeBoundControls.call(this, assert);
			sandbox.stub(RTAPlugin.prototype, "hasChangeHandler").resolves(true);

			givenThePluginWithOKClosingDialog.call(this);
		},
		afterEach() {
			this.oPlugin.destroy();
			this.oPseudoPublicParent.destroy();
			DelegateMediator.clear();
			sandbox.restore();
		}
	}, function() {
		[
			{
				overlay: createOverlayWithAggregationActions,
				sibling: false
			},
			{
				overlay: createOverlayWithAggregationActions,
				sibling: true
			}
		].forEach(function(test) {
			const sPrefix = test.sibling ? "On sibling: " : "On child: ";

			QUnit.test(`${sPrefix}when the control's dt metadata has NO addViaDelegate and a reveal action`, async function(assert) {
				const done = assert.async();

				function fnExecuteAssertions(oEvent) {
					const oCompositeCommand = oEvent.getParameter("command");
					if (test.sibling) {
						assert.strictEqual(
							oCompositeCommand.getCommands().length,
							2,
							"then for the one selected to be revealed element two commands are created"
						);
						assert.strictEqual(
							oCompositeCommand.getCommands()[0].getName(),
							"reveal",
							"then one reveal command is created"
						);
						assert.strictEqual(
							oCompositeCommand.getCommands()[0].getChangeType(),
							"unstashControl",
							"then the reveal command has the right changeType"
						);
						assert.strictEqual(
							oCompositeCommand.getCommands()[1].getName(),
							"move",
							"then one move command is created"
						);
						assert.strictEqual(
							oCompositeCommand.getCommands()[1].getMovedElements()[0].targetIndex,
							1,
							"then the move command goes to the right position"
						);
					} else {
						assert.strictEqual(
							oCompositeCommand.getCommands().length,
							2,
							"then for the one selected to be revealed element two commands are created"
						);
						assert.strictEqual(
							oCompositeCommand.getCommands()[0].getName(),
							"reveal",
							"then one reveal command is created"
						);
						assert.strictEqual(
							oCompositeCommand.getCommands()[0].getChangeType(),
							"unstashControl",
							"then the reveal command has the right changeType"
						);
						assert.strictEqual(
							oCompositeCommand.getCommands()[1].getName(),
							"move",
							"then one move command is created"
						);
						assert.strictEqual(
							oCompositeCommand.getCommands()[1].getMovedElements()[0].targetIndex,
							0,
							"then the move command moves the element to the first position"
						);
					}
					done();
				}

				this.oPlugin.attachEventOnce("elementModified", fnExecuteAssertions);

				const oOverlay = await test.overlay.call(this, {
					reveal: {
						changeType: "unstashControl"
					},
					move: "moveControls"
				}, test.sibling ? ON_SIBLING : ON_CHILD);

				await getMenuEntryAndCallHandler.call(this, oOverlay);

				assert.strictEqual(
					this.fnEnhanceInvisibleElementsStub.callCount,
					3,
					"then the analyzer is called to return the invisible elements for each aggregation"
				);
				assert.ok(
					this.fnGetUnrepresentedDelegateProperties.notCalled,
					"then the analyzer is NOT called to return the unbound odata properties"
				);
				assertDialogModelLength.call(this, assert, 2, "then both invisible elements are part of the dialog model");
				assert.strictEqual(
					this.oPlugin.getDialog().getElements()[0].label,
					"Invisible1",
					"then the first element is an invisible property"
				);
			});

			QUnit.test(`${sPrefix}when the control's dt metadata has only an add via delegate action`, async function(assert) {
				const fnDone = assert.async();
				sandbox.stub(RTAPlugin.prototype, "getVariantManagementReference").returns(sVariantManagementReference);
				const sChangeType = "addFields";
				let oElement;

				function fnExecuteAssertions(oEvent) {
					let iExpectedIndex = 0;
					if (test.sibling) {
						iExpectedIndex = 1;
						oElement = oElement.getParent();
					}
					const oExpectedCommandProperties = {
						newControlId: "bar_EntityType01_Property03",
						index: iExpectedIndex,
						bindingString: "Property03",
						entityType: "EntityType01",
						parentId: "bar",
						propertyName: "Name1",
						name: "addDelegateProperty",
						relevantForSave: true,
						changeType: sChangeType,
						jsOnly: false,
						oDataServiceUri: "",
						oDataServiceVersion: undefined,
						modelType: undefined,
						relevantContainerId: "bar",
						runtimeOnly: undefined,
						selector: {
							id: oElement.getId(),
							appComponent: oMockedAppComponent,
							controlType: oElement.getMetadata().getName()
						},
						variantIndependent: false
					};
					const oCompositeCommand = oEvent.getParameter("command");
					const aCommands = oCompositeCommand.getCommands();

					assert.strictEqual(aCommands.length, 1, "then one command was created");

					const oCommand = aCommands[0];
					assert.deepEqual(oCommand.mProperties, oExpectedCommandProperties, "then the command was created correctly");
					fnDone();
				}

				this.oPlugin.attachEventOnce("elementModified", fnExecuteAssertions);

				const oOverlay = await test.overlay.call(this, {
					add: {
						delegate: {
							changeType: sChangeType
						}
					}
				}, test.sibling ? ON_SIBLING : ON_CHILD);

				oElement = oOverlay.getElement();
				await getMenuEntryAndCallHandler.call(this, oOverlay);

				assert.strictEqual(
					this.fnGetUnrepresentedDelegateProperties.callCount,
					1,
					"then the analyzer was called once for addViaDelegate elements"
				);
				assert.strictEqual(
					this.fnEnhanceInvisibleElementsStub.callCount,
					0,
					"then the analyzer was not called for invisible elements"
				);
				assertDialogModelLength.call(this, assert, 3, "then all three addViaDelegate elements are part of the dialog model");
				const bValidDialogElements = this.oPlugin.getDialog().getElements().every((oElement, iIndex) => oElement.label === `delegate${iIndex}`);
				assert.ok(bValidDialogElements, "then all elements in the dialog are valid");
			});

			QUnit.test(`${sPrefix}when the control's dt metadata has addViaDelegate with a valid delegate configured`, async function(assert) {
				const fnDone = assert.async();
				const sChangeType = "addFields";

				this.oPlugin.attachEventOnce("elementModified", function(oEvent) {
					const aCommands = oEvent.getParameter("command").getCommands();
					assert.equal(aCommands.length, 1, "then one command for the selected addViaDelegate element was created");
					assert.equal(aCommands[0].getChangeType(), sChangeType, "then the command with the correct change type was created");
					fnDone();
				});

				const oOverlay = await test.overlay.call(this, {
					add: {
						delegate: {
							changeType: sChangeType
						}
					}
				}, test.sibling ? ON_SIBLING : ON_CHILD);

				await getMenuEntryAndCallHandler.call(this, oOverlay);

				assert.strictEqual(
					this.fnGetUnrepresentedDelegateProperties.callCount,
					1,
					"then the analyzer was called once for addViaDelegate elements"
				);
				assert.strictEqual(
					this.fnEnhanceInvisibleElementsStub.callCount,
					0,
					"then the analyzer was not called for invisible elements"
				);
				assertDialogModelLength.call(this, assert, 3, "then all three addViaDelegate elements are part of the dialog model");
				const bValidDialogElements = this.oPlugin.getDialog().getElements().every((oElement, iIndex) => oElement.label === `delegate${iIndex}`);
				assert.ok(bValidDialogElements, "then all elements in the dialog are valid");
			});

			QUnit.test(`${sPrefix}when the control's dt metadata has addViaDelegate with an invalid delegate configured`, async function(assert) {
				const fnDone = assert.async();
				const sChangeType = "addFields";
				const sDelegatePath = "misconfigured/module/path";

				sandbox.stub(Log, "error").callsFake(function(sMessage) {
					assert.ok(sMessage.indexOf(sDelegatePath) !== -1, "then an error was logged for a mis-configured delegate module path");
					Log.error.restore();
					fnDone();
				});
				const oOverlay = await test.overlay.call(
					this,
					{
						add: {
							delegate: {
								changeType: sChangeType
							}
						},
						delegateModulePath: sDelegatePath
					},
					test.sibling ? ON_SIBLING : ON_CHILD,
					true, // instance-specific delegate registration
					false // control-specific delegate registration
				);
				const bIsEditable = await this.oPlugin._isEditableCheck(oOverlay, test.sibling);
				assert.notOk(bIsEditable, "then the overlay is not editable");

				assert.strictEqual(
					this.fnGetUnrepresentedDelegateProperties.callCount,
					0,
					"then the analyzer was not called for addViaDelegate elements"
				);
				assert.strictEqual(
					this.fnEnhanceInvisibleElementsStub.callCount,
					0,
					"then the analyzer was not called for invisible elements"
				);
				assertDialogModelLength.call(this, assert, 0, "then no elements are part of the dialog model");
			});
		});

		QUnit.test("when the control's dt metadata has a reveal action on a responsible element and getMenuItems() is called", async function(assert) {
			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(...aArgs) {
				if (aArgs[0][0] === this.oPseudoPublicParentOverlay) {
					return true;
				}
				return undefined;
			}.bind(this));
			const oCreatedOverlay = await createOverlayWithAggregationActions.call(this,
				{
					reveal: {
						changeType: "unhideControl",
						changeOnRelevantContainer: true
					},
					responsibleElement: {
						target: this.oSibling,
						source: this.oPseudoPublicParent,
						actionsFromResponsibleElement: ["reveal"]
					}
				}, ON_CONTAINER
			);
			const oMenuItem = await getMenuEntryAndCheck.call(this, assert, oCreatedOverlay, true, { editable: true, available: true, enabled: true });
			assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_SIBLING", "there is an entry for add elements as sibling");
			assert.deepEqual(
				oMenuItem.responsible[0],
				this.oSiblingOverlay,
				"then the responsible element overlay is set as a menu item property"
			);
		});

		QUnit.test("when the control's dt metadata has a disabled reveal action along with an enabled reveal action on the responsible element and getActions() is called", function(assert) {
			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(...aArgs) {
				if (aArgs[0][0] === this.oPseudoPublicParentOverlay) {
					return true;
				}
				return undefined;
			}.bind(this));
			return createOverlayWithAggregationActions.call(this,
				{
					add: {
						delegate: {
							changeType: "addFields"
						}
					},
					reveal: {
						changeType: "unhideControl"
					},
					responsibleElement: {
						target: this.oSibling,
						source: this.oPseudoPublicParent
					}
				},
				ON_CONTAINER
			)
			.then(function(oCreatedOverlay) {
				return AdditionalElementsActionExtractor.getActions(true, oCreatedOverlay, this.oPlugin);
			}.bind(this)).then(function(mActions) {
				assert.ok(isEmptyObject(mActions), "then no actions were returned");
			});
		});

		QUnit.test("when the control's dt metadata has a reveal and addViaDelegate action on the responsible element and getActions() is called", function(assert) {
			return createOverlayWithAggregationActions.call(this,
				{
					add: {
						delegate: {
							changeType: "addFields"
						}
					},
					reveal: {
						changeType: "unhideControl"
					},
					responsibleElement: {
						target: this.oSibling,
						source: this.oPseudoPublicParent,
						actionsFromResponsibleElement: ["reveal"]
					}
				}, ON_CONTAINER)
			.then(function(oCreatedOverlay) {
				return AdditionalElementsActionExtractor.getActions(true, oCreatedOverlay, this.oPlugin);
			}.bind(this)).then(function(mActions) {
				assert.equal(
					mActions.contentLeft.reveal.elements.length,
					2,
					"then the reveal actions has two elements from the responsible element"
				);
				assert.equal(
					mActions.contentLeft.addViaDelegate.action.changeType,
					"addFields",
					"then the addViaDelegate action was retrieved from the responsible element"
				);
			});
		});

		QUnit.test("when the control's dt metadata has an addViaDelegate action on the responsible element and _isEditableCheck is called", function(assert) {
			return createOverlayWithAggregationActions.call(this,
				{
					add: {
						delegate: {
							changeType: "addFields"
						}
					},
					responsibleElement: {
						target: this.oSibling,
						source: this.oPseudoPublicParent,
						actionsFromResponsibleElement: ["add.delegate"]
					}
				}, ON_CONTAINER)
			.then(function(oCreatedOverlay) {
				return this.oPlugin._isEditableCheck(oCreatedOverlay, true);
			}.bind(this)).then(function(bEditable) {
				assert.equal(bEditable, true, "then the editable property is set from the responsible element overlays");
			});
		});

		QUnit.test("when the control's dt metadata has addViaDelegate and a reveal actions", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_CHILD)
			.then(async function(oOverlay) {
				await getMenuEntryAndCallHandler.call(this, oOverlay);
			}.bind(this))

			.then(function() {
				var sExpectedText = oRTATexts.getText("HEADER_ADDITIONAL_ELEMENTS", ["I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"]);
				assert.equal(this.oDialog.getTitle(), sExpectedText, "then the translated title is properly set");
			}.bind(this));
		});

		QUnit.test("when the control's dt metadata has a reveal and addViaDelegate and delegate definitions are not available", function(assert) {
			return createOverlayWithAggregationActions.call(
				this,
				{
					add: {
						delegate: {
							changeType: "addFields"
						}
					},
					reveal: {
						changeType: "unhideControl"
					},
					responsibleElement: {
						target: this.oSibling,
						source: this.oPseudoPublicParent,
						actionsFromResponsibleElement: ["reveal"]
					}
				},
				ON_CONTAINER,
				{
					instanceSpecific: false,
					modelSpecificRead: false,
					controlSpecificWrite: false
				}
			)
			.then(function(oCreatedOverlay) {
				return AdditionalElementsActionExtractor.getActions(true, oCreatedOverlay, this.oPlugin);
			}.bind(this)).then(function(mActions) {
				assert.notOk(mActions.contentLeft.hasOwnProperty("addViaDelegate"), "then the invalid add via delegate action is filtered");
				assert.ok(mActions.contentLeft.hasOwnProperty("reveal"), "then the reveal action is still available");
			});
		});

		QUnit.test("when the control's dt metadata has an instance-specific delegate and an unavailable model-specific read delegate", function(assert) {
			RtaQunitUtils.stubSapUiRequire(sandbox, [{
				name: ["path/to/instancespecific/delegate"],
				stub: {
					getPropertyInfo() {},
					createLabel() {},
					createLayout() {}
				}
			}]);

			return createOverlayWithAggregationActions.call(
				this,
				{
					add: {
						delegate: {
							changeType: "addFields"
						}
					},
					responsibleElement: {
						target: this.oSibling,
						source: this.oPseudoPublicParent,
						actionsFromResponsibleElement: ["reveal"]
					},
					delegateModulePath: "path/to/instancespecific/delegate"
				},
				ON_CONTAINER,
				{
					instanceSpecific: true,
					modelSpecificRead: false,
					controlSpecificWrite: false
				}
			)
			.then(function(oCreatedOverlay) {
				return AdditionalElementsActionExtractor.getActions(true, oCreatedOverlay, this.oPlugin);
			}.bind(this)).then(function(mActions) {
				assert.ok(
					mActions.contentLeft.hasOwnProperty("addViaDelegate"),
					"then the add via delegate action for the instance-specific delegate is available"
				);
			});
		});

		function whenOverlayHasNoStableId(oOverlayWithoutStableID) {
			sandbox.stub(this.oPlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === oOverlayWithoutStableID) {
					return false;
				}
				return true;
			});
		}

		QUnit.test("when the control's dt metadata has a reveal action with changeOnRelevantContainer true but the relevant container does not have stable ID", async function(assert) {
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl",
					changeOnRelevantContainer: true
				}
			}, ON_SIBLING);
			whenOverlayHasNoStableId.call(this, this.oPseudoPublicParentOverlay);
			const bEditable = await this.oPlugin._isEditableCheck(oOverlay, true);
			assert.strictEqual(bEditable, false, "then the overlay is not editable");
		});

		QUnit.test("when something breaks during _isEditableCheck() check", async function(assert) {
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl",
					changeOnRelevantContainer: true
				}
			}, ON_SIBLING);
			sandbox.stub(this.oPlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oPseudoPublicParentOverlay) {
					throw new Error("Some error");
				}
				return true;
			}.bind(this));
			try {
				await this.oPlugin._isEditableCheck(oOverlay, true, "then the overlay is editable");
				assert.ok(false, "should never come here");
			} catch (oError) {
				assert.strictEqual(oError.message, "Some error");
			}
		});

		QUnit.test("when _isEditableCheck() is called and parent overlay is destroyed asynchronously", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_CHILD)
			.then(function(oParentOverlay) {
				oParentOverlay.destroy();
				return this.oPlugin._isEditableCheck(this.oSiblingOverlay, true);
			}.bind(this))
			.then(function(bEditable) {
				assert.strictEqual(bEditable, false, "then the overlay is not editable");
			});
		});

		QUnit.test("when _isEditableCheck() is called and overlay is destroyed asynchronously", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_SIBLING)
			.then(function(oChildOverlay) {
				oChildOverlay.destroy();
				return this.oPlugin._isEditableCheck(this.oSiblingOverlay, true);
			}.bind(this))
			.then(function(bEditable) {
				assert.strictEqual(bEditable, false, "then the overlay is not editable");
			});
		});

		QUnit.test("when the control's dt metadata has a reveal action with changeOnRelevantContainer true but the parent does not have stable ID", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl",
					changeOnRelevantContainer: true
				}
			}, ON_SIBLING)
			.then(function(oOverlay) {
				whenOverlayHasNoStableId.call(this, this.oParentOverlay);
				return this.oPlugin._isEditableCheck(oOverlay, true);
			}.bind(this))
			.then(function(bEditable) {
				assert.equal(bEditable, false, "then the overlay is not editable");
			});
		});

		QUnit.test("when the control's dt metadata has a reveal action but the parent does not have stable ID", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_CHILD)
			.then(function(oOverlay) {
				whenOverlayHasNoStableId.call(this, this.oParentOverlay);
				return this.oPlugin._isEditableCheck(oOverlay, false);
			}.bind(this))
			.then(function(bEditable) {
				assert.equal(bEditable, false, "then the parent overlay is not editable");
			});
		});

		QUnit.test("when the control has sibling actions but the parent does not have stable ID", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_SIBLING)
			.then(function(oOverlay) {
				// E.g. FormContainer has no stable ID, but another FormContainer has stable ID and has a hidden FormElement
				// that could be revealed, then the move to the FormContainer without stable ID would fail, so no reveal action
				// should be available.
				whenOverlayHasNoStableId.call(this, this.oParentOverlay);
				return this.oPlugin._isEditableCheck(oOverlay, true);
			}.bind(this))
			.then(function(bEditable) {
				assert.equal(bEditable, false, "then the sibling overlay is not editable");
			});
		});

		QUnit.test("when the control has sibling actions but the sibling does not have stable ID", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_SIBLING)
			.then(function(oOverlay) {
				// E.g. FormContainer has no stable ID, but another FormContainer has stable ID and has a hidden FormElement
				// that could be revealed, then the move to the FormContainer without stable ID would fail, so no reveal action
				// should be available.
				whenOverlayHasNoStableId.call(this, oOverlay);
				return this.oPlugin._isEditableCheck(oOverlay, true);
			}.bind(this))
			.then(function(bEditable) {
				assert.equal(bEditable, false, "then the sibling overlay is not editable");
			});
		});

		QUnit.test("when the control has delegate action but not a stable ID", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD)
			.then(function(oOverlay) {
				// E.g. Control has delegate action but no stable
				whenOverlayHasNoStableId.call(this, this.oParentOverlay);
				return this.oPlugin._isEditableCheck(oOverlay, false);
			}.bind(this))
			.then(function(bEditable) {
				assert.equal(bEditable, false, "then the parent overlay is not editable");
			});
		});

		QUnit.test("when the control's dt metadata has no addViaDelegate and reveal action, and the parent is invisible", function(assert) {
			return createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_CHILD)
			.then(async function(oOverlay) {
				oOverlay.getElement().setVisible(false);
				oOverlay.getElement().getContentLeft()[0].setVisible(true);
				oOverlay.getElement().getContentLeft()[1].setVisible(true);
				oOverlay.getElement().getContentLeft()[2].setVisible(true);
				var fnElementModifiedStub = sandbox.stub();
				this.oPlugin.attachEventOnce("elementModified", fnElementModifiedStub);

				await getMenuEntryAndCallHandler.call(this, oOverlay);
				assertDialogModelLength.call(this, assert, 2, "then the two visible elements are part of the dialog model");
			}.bind(this));
		});

		QUnit.test("when the control's dt metadata has an add via delegate action", async function(assert) {
			var done = assert.async();
			this.oPlugin.attachEventOnce("elementModified", function(oEvent) {
				var oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 1, "then one command is created");
				var oAddCmd = oCompositeCommand.getCommands()[0];
				assert.equal(oAddCmd.getName(), "addDelegateProperty",
					"then the addDelegateProperty command is created ");
				assert.equal(oAddCmd.getParentId(), "bar", "then the parentId is set correctly ");
				assert.equal(oAddCmd.getElementId(), "bar", "then the relevant container is set correctly as element of the command");
				assert.equal(oAddCmd.getRelevantContainerId(), "bar", "then the relevant container is set correctly ");
				assert.ok(oAddCmd.getNewControlId().indexOf("bar") > -1,
					"then the pseudo parent (relevant container) is used to create the new control ID");
				done();
			});
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			assert.ok(true, "then the plugin should not complain about it");
		});

		QUnit.test("when the control's dt metadata has an add via delegate action on relevant container with model specific read delegate "
		+ "and control specific write delegate are available", async function(assert) {
			var done = assert.async();
			this.oPlugin.attachEventOnce("elementModified", function(oEvent) {
				var oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 2, "then two commands are created");

				var oAddLibrary = oCompositeCommand.getCommands()[0];
				assert.equal(oAddLibrary.getName(), "addLibrary", "then the addLibrary command is created first");
				assert.equal(
					oAddLibrary.getReference(),
					"applicationId",
					"then the addLibrary command is created with the proper reference"
				);
				// Non-existing library
				const sLib1 = Object.keys(DEFAULT_REQUIRED_LIBRARIES)[0];
				// Existing library but with lazy: true
				const sLib2 = Object.keys(DEFAULT_REQUIRED_LIBRARIES)[1];
				assert.equal(
					oAddLibrary.getParameters().libraries[sLib1].minVersion,
					DEFAULT_REQUIRED_LIBRARIES[sLib1].minVersion,
					"then the addLibrary command is created with the library which was not on the manifest"
				);
				assert.equal(
					oAddLibrary.getParameters().libraries[sLib2].minVersion,
					DEFAULT_REQUIRED_LIBRARIES[sLib2].minVersion,
					"then the addLibrary command is created with the library which was on the manifest with lazy: true"
				);

				const oAddCmd = oCompositeCommand.getCommands()[1];
				assert.equal(oAddCmd.getName(), "addDelegateProperty",
					"then the addDelegateProperty command is created ");
				assert.equal(oAddCmd.getParentId(), "bar", "then the parentId is set correctly ");
				assert.equal(oAddCmd.getElementId(), "pseudoParent", "then the parent is set correctly as element of the command");
				assert.equal(oAddCmd.getRelevantContainerId(), "pseudoParent", "then the relevant container is set correctly ");
				assert.ok(oAddCmd.getNewControlId().indexOf("pseudoParent") > -1,
					"then the pseudo parent (relevant container) is used to create the new control ID");
				done();
			});

			const oOverlay = await createOverlayWithAggregationActions.call(
				this,
				{
					add: {
						delegate: {
							changeType: "addFields",
							changeOnRelevantContainer: true
						}
					}
				},
				ON_CHILD,
				{
					instanceSpecific: false,
					modelSpecificRead: true,
					controlSpecificWrite: true
				}
			);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			assert.ok(true, "then the plugin should not complain about it");
		});

		function givenAddHasLibraryDependencyToWriteDelegateLibDependencies() {
			sandbox.stub(oMockedAppComponent, "getManifestEntry").callsFake(function(sPath) {
				if (sPath.indexOf("libs")) {
					return merge(
						{},
						DEFAULT_MANIFEST["sap.ui5"].dependencies.libs,
						DEFAULT_REQUIRED_LIBRARIES
					);
				}
				return {};
			});
		}

		QUnit.test("when the control's dt metadata has an add via delegate action on relevant container "
		+ "and read write delegates are available, but library dependency already exists", async function(assert) {
			givenAddHasLibraryDependencyToWriteDelegateLibDependencies();

			var done = assert.async();
			this.oPlugin.attachEventOnce("elementModified", function(oEvent) {
				var oCompositeCommand = oEvent.getParameter("command");
				assert.equal(
					oCompositeCommand.getCommands().length,
					1,
					"then only the addDelegateProperty is created and no addLibrary command as the library dependency already exists"
				);

				var oAddCmd = oCompositeCommand.getCommands()[0];
				assert.equal(oAddCmd.getName(), "addDelegateProperty",
					"then the addDelegateProperty command is created ");
				done();
			});

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields",
						changeOnRelevantContainer: true
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			assert.ok(true, "then the plugin should not complain about it");
		});

		QUnit.test("when the control's dt metadata has an add via delegate action on relevant container and model specific read delegate "
		+ "and control specific write delegates are available, but library dependency has lazy: true", async function(assert) {
			sandbox.stub(oMockedAppComponent, "getManifestEntry").callsFake(function(sPath) {
				// Only missing dependency becomes "layout" which is set with "lazy: true"
				if (sPath.indexOf("libs")) {
					return merge(
						{},
						DEFAULT_MANIFEST["sap.ui5"].dependencies.libs,
						{
							"sap.uxap": {
								minVersion: "1.44",
								lazy: false
							}
						}
					);
				}
				return {};
			});

			var done = assert.async();
			this.oPlugin.attachEventOnce("elementModified", function(oEvent) {
				var oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 2, "then two commands are created");

				var oAddLibrary = oCompositeCommand.getCommands()[0];
				assert.equal(oAddLibrary.getName(), "addLibrary", "then the addLibrary command is created first");
				assert.equal(
					oAddLibrary.getReference(),
					"applicationId",
					"then the addLibrary command is created with the proper reference"
				);
				// Existing library but with lazy: true
				var sLib = Object.keys(DEFAULT_REQUIRED_LIBRARIES)[0];
				assert.equal(
					oAddLibrary.getParameters().libraries[sLib].minVersion,
					DEFAULT_REQUIRED_LIBRARIES[sLib].minVersion,
					"then the addLibrary command is created with the library which was on the manifest with lazy: true"
				);
				done();
			});

			const oOverlay = await createOverlayWithAggregationActions.call(
				this,
				{
					add: {
						delegate: {
							changeType: "addFields",
							changeOnRelevantContainer: true
						}
					}
				},
				ON_CHILD,
				{
					instanceSpecific: false,
					modelSpecificRead: true,
					controlSpecificWrite: true
				}
			);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			assert.ok(true, "then the plugin should not complain about it");
		});

		QUnit.test("when 'registerElementOverlay' is called and the metamodel is not loaded yet", function(assert) {
			var fnDone = assert.async();
			var { oSibling } = this;
			var oSiblingOverlay = {
				getElement() {
					return oSibling;
				}
			};

			sandbox.stub(this.oSibling, "getModel").returns({
				getMetaModel() {
					return {
						loaded() {
							return Promise.resolve();
						}
					};
				}
			});

			// prevent the RTAPlugin call to be able to check if evaluateEditable was called on this plugin
			sandbox.stub(RTAPlugin.prototype, "registerElementOverlay");

			// evaluateEditable should be called when the promise is resolved
			sandbox.stub(this.oPlugin, "evaluateEditable").callsFake(function() {
				assert.ok(true, "evaluateEditable() is called after the MetaModel is loaded");
				fnDone();
			});

			this.oPlugin.registerElementOverlay(oSiblingOverlay);
		});

		QUnit.test("when 'getActions' is called multiple times without invalidate", function(assert) {
			return createOverlayWithAggregationActions.call(this,
				{
					add: {
						delegate: {
							changeType: "addFields"
						}
					},
					reveal: {
						changeType: "unhideControl"
					},
					move: "moveControls"
				},
				ON_SIBLING
			)
			.then(function(oOverlay) {
				var oGetRevealActionsSpy = sandbox.spy(AdditionalElementsActionExtractor, "_getRevealActions");
				var oGetAddActionsSpy = sandbox.spy(AdditionalElementsActionExtractor, "_getAddViaDelegateActions");
				return AdditionalElementsActionExtractor.getActions(true, oOverlay, this.oPlugin, false)
				.then(function() {
					assert.equal(oGetRevealActionsSpy.callCount, 1, "the reveal action was calculated once");
					assert.equal(oGetAddActionsSpy.callCount, 1, "the add action was calculated once");
				})
				.then(function() {
					return AdditionalElementsActionExtractor.getActions(true, oOverlay, this.oPlugin, false);
				}.bind(this))
				.then(function() {
					assert.equal(oGetRevealActionsSpy.callCount, 1, "the reveal action was not calculated again");
					assert.equal(oGetAddActionsSpy.callCount, 1, "the add action was not calculated again");
				});
			}.bind(this));
		});

		QUnit.test("when 'getActions' is called multiple times with invalidate", function(assert) {
			return createOverlayWithAggregationActions.call(this,
				{
					add: {
						delegate: {
							changeType: "addFields"
						}
					},
					reveal: {
						changeType: "unhideControl"
					},
					move: "moveControls"
				},
				ON_SIBLING
			)
			.then(function(oOverlay) {
				var oGetRevealActionsSpy = sandbox.spy(AdditionalElementsActionExtractor, "_getRevealActions");
				var oGetAddActionsSpy = sandbox.spy(AdditionalElementsActionExtractor, "_getAddViaDelegateActions");
				return AdditionalElementsActionExtractor.getActions(true, oOverlay, this.oPlugin, true)
				.then(function() {
					assert.equal(oGetRevealActionsSpy.callCount, 1, "the reveal action was calculated once");
					assert.equal(oGetAddActionsSpy.callCount, 1, "the add action was calculated once");
				})
				.then(function() {
					return AdditionalElementsActionExtractor.getActions(true, oOverlay, this.oPlugin, true);
				}.bind(this))
				.then(function() {
					assert.equal(oGetRevealActionsSpy.callCount, 2, "the reveal action was calculated again");
					assert.equal(oGetAddActionsSpy.callCount, 2, "the add action was calculated again");
				});
			}.bind(this));
		});

		QUnit.test("when getParameters is called", function(assert) {
			const aParameters = this.oPlugin.getParameters();
			const aNames = aParameters.map((mParameter) => mParameter.name);
			["isSibling", "aggregation", "selectedElements"].forEach(function(sName) {
				assert.ok(aNames.includes(sName), `then the '${sName}' parameter is exposed`);
			});
			assert.ok(aParameters.every((mParameter) => !!mParameter.description), "then every parameter has a description");
		});

		QUnit.test("when getContext is called", async function(assert) {
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_CHILD);
			await DtUtil.waitForSynced(this.oDesignTime)();

			const mContext = await this.oPlugin.getContext(oOverlay);

			assert.ok(mContext.availableElements, "then the context exposes availableElements");
			assert.ok(mContext.availableElements.description, "then the availableElements carry a description");
			assert.ok(Array.isArray(mContext.availableElements.value.asChild), "then the available child elements are grouped as an array");
			assert.ok(Array.isArray(mContext.availableElements.value.asSibling), "then the available sibling elements are grouped as an array");
		});
	});

	QUnit.module("Given an app that is field extensible enabled...", {
		async beforeEach(assert) {
			registerControlsForChanges();
			this.STUB_EXTENSIBILITY_BUSINESS_CTXT = {
				extensionData: [{
					BusinessContext: "some context",
					description: "some description"
				}], // BusinessContext API returns this structure
				serviceName: "service name",
				serviceVersion: "some dummy ServiceVersion",
				entityType: "Header"
			};
			this.STUB_EXTENSIBILITY_USHELL_PARAMS = {
				target: {
					semanticObject: "CustomField",
					action: "develop"
				},
				params: {
					extensionData: ["some context"], // Custom Field App expects list of strings
					serviceName: "service name",
					serviceVersion: "some dummy ServiceVersion",
					entityType: "Header"
				}
			};
			this.STUB_EXTENSIBILITY_USHELL_URL = `someURLToCheckOurParameterPassing:${
				 JSON.stringify(this.STUB_EXTENSIBILITY_USHELL_PARAMS)}`;

			await givenSomeBoundControls.call(this, assert);

			givenThePluginWithOKClosingDialog.call(this);
		},
		afterEach() {
			this.oDesignTime.destroy();
			sandbox.restore();
			this.oPlugin.destroy();
			this.oPseudoPublicParent.destroy();
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("when no addViaDelegate action is available", async function(assert) {
			var oIsServiceOutdatedStub = sandbox.stub(FieldExtensibility, "isServiceOutdated");
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);

			assert.ok(this.fnDialogOpen.calledOnce, "then the dialog was opened");
			assert.ok(oIsServiceOutdatedStub.notCalled, "up to date service is not called");
			assert.equal(this.oDialog.getCustomFieldButtonVisible(), false, "then the button to create custom fields is not shown");
		});

		QUnit.test("when the service is up to date and addViaDelegate action is available but extensibility is not enabled in the system", async function(assert) {
			var oIsServiceOutdatedStub = sandbox.stub(FieldExtensibility, "isServiceOutdated").resolves(false);

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);

			assert.ok(this.fnDialogOpen.calledOnce, "then the dialog was opened");
			assert.strictEqual(oIsServiceOutdatedStub.callCount, 0, "the function is not called");
			assert.equal(this.oDialog.getCustomFieldButtonVisible(), false, "the Button to create custom Fields is not shown");
		});

		QUnit.test("when the service is up to date and addViaDelegate action is available and extensibility is enabled in the system", async function(assert) {
			sandbox.stub(FieldExtensibility, "isServiceOutdated").resolves(false);
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			sandbox.stub(FieldExtensibility, "getExtensionData").resolves({ foo: "bar" });

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);

			assert.ok(this.fnDialogOpen.calledOnce, "then the dialog was opened");
			assert.equal(this.oDialog.getCustomFieldButtonVisible(), true, "the Button to create custom Fields is shown");
		});

		QUnit.test("when the service is not up to date and addViaDelegate action is available and extensibility is enabled in the system", async function(assert) {
			const oSetServiceValidStub = sandbox.stub(FieldExtensibility, "setServiceValid");
			const oEventBusPublishSpy = sandbox.spy(EventBus.getInstance(), "publish");
			sandbox.stub(FieldExtensibility, "isServiceOutdated").resolves(true);
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			sandbox.stub(FieldExtensibility, "getExtensionData").resolves({ foo: "bar" });

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);

			assert.strictEqual(oSetServiceValidStub.callCount, 1, "the service is set to valid");
			assert.ok(
				oEventBusPublishSpy.calledWith("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", {}),
				"the event is fired"
			);
			assert.ok(this.fnDialogOpen.calledOnce, "then the dialog was opened");
			assert.equal(this.oDialog.getCustomFieldButtonVisible(), true, "the Button to create custom Fields is shown");
		});

		QUnit.test("when no addViaDelegate action is available", async function(assert) {
			var oGetExtensionDataStub = sandbox.stub(FieldExtensibility, "getExtensionData");
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);

			assert.ok(oGetExtensionDataStub.notCalled, "then custom field enabling should not be asked");
			assert.equal(this.oDialog.getCustomFieldButtonVisible(), false, "then in the dialog custom field is disabled");
		});

		QUnit.test("When handler is called with legacy extension data", async function(assert) {
			const oExtensibilityInfo = { headerText: "Legacy", tooltip: "LegacyTooltip" };
			const oExtensibilityOptions = {
				actionKey: undefined,
				text: oRTATexts.getText("BTN_ADDITIONAL_ELEMENTS_CREATE_CUSTOM_FIELDS"),
				tooltip: "LegacyTooltip"
			};
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			sandbox.stub(FieldExtensibility, "getExtensionData").resolves(this.STUB_EXTENSIBILITY_BUSINESS_CTXT);
			sandbox.stub(FieldExtensibility, "getTexts").resolves(oExtensibilityInfo);
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			assert.equal(this.oDialog.getCustomFieldButtonVisible(), true, "then in the dialog custom field is enabled");
			assert.deepEqual(
				this.oDialog.getExtensibilityOptions()[0],
				oExtensibilityOptions,
				"then the legacy extensibility options are set correctly"
			);
		});

		QUnit.test("when addViaDelegate action is available and simulating a click on open custom field", async function(assert) {
			const fnDone = assert.async();

			const oIsServiceOutdatedStub = sandbox.stub(FieldExtensibility, "isServiceOutdated").resolves(false);
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			sandbox.stub(FieldExtensibility, "getExtensionData").resolves(this.STUB_EXTENSIBILITY_BUSINESS_CTXT);

			sandbox.stub(FieldExtensibility, "onTriggerCreateExtensionData").callsFake(function(oExtensionData) {
				assert.strictEqual(oExtensionData, this.STUB_EXTENSIBILITY_BUSINESS_CTXT,
					"then we are calling the extensibility tool with the correct parameter");
				fnDone();
			}.bind(this));

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);

			assert.ok(
				oIsServiceOutdatedStub.getCall(0).args[0],
				"addViaDelegate is dependent on up to date service, it should be called with a control"
			);
			assert.strictEqual(this.oDialog.getCustomFieldButtonVisible(), true, "then in the dialog custom field is enabled");

			this.oDialog.fireTriggerExtensibilityAction();
		});

		QUnit.test("when addViaDelegate action is available and handler is called 3 times and simulating a click on open custom field the last time", async function(assert) {
			const fnDone = assert.async();

			sandbox.stub(FieldExtensibility, "isServiceOutdated").resolves(false);
			const oSetServiceValidStub = sandbox.stub(FieldExtensibility, "setServiceValid");
			sandbox.stub(FieldExtensibility, "isExtensibilityEnabled").resolves(true);
			sandbox.stub(FieldExtensibility, "getExtensionData").resolves(this.STUB_EXTENSIBILITY_BUSINESS_CTXT);
			const handlerSpy = sandbox.spy(this.oPlugin, "handler");

			sandbox.stub(FieldExtensibility, "onTriggerCreateExtensionData").callsFake(function(oExtensionData) {
				assert.ok(handlerSpy.calledThrice, "then handler is called 3 times");
				assert.strictEqual(oExtensionData, this.STUB_EXTENSIBILITY_BUSINESS_CTXT,
					"then we are calling the extensibility tool with the correct parameter");
				fnDone();
			}.bind(this));

			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);

			assert.strictEqual(oSetServiceValidStub.callCount, 0, "the service is valid already");
			assert.strictEqual(
				this.oDialog.getCustomFieldButtonVisible(),
				true,
				"then in the dialog custom field button is visible"
			);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			this.oDialog.fireTriggerExtensibilityAction();
		});

		QUnit.test("when getAllElements is called for sibling overlay,", async function(assert) {
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				},
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			const aAllElements = await this.oPlugin.getAllElements(true, [oOverlay]);
			assert.equal(aAllElements.length, 0, "then no Elements are available");
		});

		QUnit.test("when getAllElements is called for child overlay,", async function(assert) {
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				add: {
					delegate: {
						changeType: "addFields"
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			}, ON_CHILD);
			const aAllElements = await this.oPlugin.getAllElements(false, [oOverlay]);
			assert.equal(aAllElements[0].elements.length, 5, "then 5 Elements are available");
		});

		QUnit.test("when getMenuItems is called,", async function(assert) {
			var oGetAllElementsSpy = sandbox.spy(this.oPlugin, "getAllElements");
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				},
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await this.oPlugin.getMenuItems([oOverlay]);
			assert.equal(
				oGetAllElementsSpy.callCount,
				2,
				"then getAllElements Method for collecting Elements was called twice (for child & sibling)"
			);
		});

		QUnit.test("when handler is called,", async function(assert) {
			const oGetAllElementsSpy = sandbox.spy(this.oPlugin, "getAllElements");
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				},
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			assert.strictEqual(oGetAllElementsSpy.callCount, 3, "then getAllElements Method for collecting Elements was called thrice");
		});

		QUnit.test("when getMenuItems and handler are called,", async function(assert) {
			// we stub "setCachedElements" which is only called when getAllElements is processed.
			// "setCachedElements" is not called, when there are cached Elements available
			const oSetCachedElements = sandbox.spy(this.oPlugin, "setCachedElements");
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				},
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_CHILD);
			await DtUtil.waitForSynced(this.oDesignTime)();
			await getMenuEntryAndCallHandler.call(this, oOverlay);
			assert.strictEqual(oSetCachedElements.callCount, 2, "then getAllElements Method has been processed only twice");
		});

		function requestAnimationFramePromise() {
			return new Promise((resolve) => {
				window.requestAnimationFrame(() => {
					resolve([]);
				});
			});
		}

		QUnit.test("when getMenuItems and _isEditableCheck is called in parallel,", async function(assert) {
			const oOverlay = await createOverlayWithAggregationActions.call(this, {
				reveal: {
					changeType: "unhideControl"
				},
				add: {
					delegate: {
						changeType: "addFields"
					}
				}
			}, ON_SIBLING);
			await DtUtil.waitForSynced(this.oDesignTime)();

			sandbox.stub(this.oPlugin, "getAllElements")
			.callThrough()
			.withArgs(false, [oOverlay])
			.callsFake(() => {
				this.oPlugin._isEditableCheck(oOverlay, true);
				return requestAnimationFramePromise();
			})
			.withArgs(true, [oOverlay])
			.callsFake(() => {
				this.oPlugin._oCachedElements = {
					asSibling: [{}, {}, {}]
				};
				return [{}, {}, {}];
			});

			const aMenuItems = await this.oPlugin.getMenuItems([oOverlay]);
			assert.ok(aMenuItems[0].enabled([oOverlay], aMenuItems[0]),
				"then the MenuItem creation is not blocked by the _isEditableCheck");
			assert.strictEqual(aMenuItems[0].aggregationRelevant, true, "then the action is flagged as aggregation-relevant");
		});
	});

	QUnit.module("Given a Plugin and a DT with one control", {
		async beforeEach() {
			this.oButton = new Button("control1", { text: "foo" });
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
			givenThePluginWithOKClosingDialog.call(this);
			return new Promise(function(resolve) {
				this.oDesignTime = new DesignTime({
					rootElements: [this.oButton]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oOverlay = OverlayRegistry.getOverlay(this.oButton);
					resolve();
				}.bind(this));
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oButton.destroy();
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("when the control gets destroyed during isEditable", function(assert) {
			var oUtilsSpy = sandbox.spy(RTAUtils, "doIfAllControlsAreAvailable");
			sandbox.stub(AdditionalElementsActionExtractor, "getActions").callsFake(function() {
				if (!this.oButton._bIsBeingDestroyed) {
					this.oButton.destroy();
				}
				return Promise.resolve();
			}.bind(this));
			return this.oPlugin._isEditableCheck(this.oOverlay)
			.then(function(bEditable) {
				assert.ok(true, "the function resolves");
				assert.notOk(bEditable, "the overlay is not editable");
				assert.equal(oUtilsSpy.callCount, 1, "doIfAllControlsAreAvailable was called once");
				assert.notOk(oUtilsSpy.lastCall.returnValue, undefined, "and returned undefined");
			});
		});
	});

	//                                          PseudoPublicParent (VerticalLayout)
	//                                                    oControl (Bar)
	//                 contentLeft                                        contentMiddle         contentRight
	// [oSibling, <oUnsupportedInvisible>, <oInvisible1>, <oInvisible2>        EMPTY          oIrrelevantChild]
	async function givenSomeBoundControls() {
		this.oSibling = new Button({ id: "Sibling", visible: true });
		this.oUnsupportedInvisible = new Input({ id: "UnsupportedInvisible", visible: false });
		this.oInvisible1 = new Button({ id: "Invisible1", visible: false });
		this.oInvisible2 = new Button({ id: "Invisible2", visible: false });
		this.oIrrelevantChild = new Button({ id: "Irrelevant", visible: true });
		this.oControl = new Bar({
			id: "bar",
			contentLeft: [this.oSibling, this.oUnsupportedInvisible, this.oInvisible1, this.oInvisible2],
			contentRight: [this.oIrrelevantChild]
		});

		this.oPseudoPublicParent = new VerticalLayout({
			id: "pseudoParent",
			content: [this.oControl]
		});

		// attach a model used for model specific read delegate determination
		const oModel = new SomeModel();
		oModel.sServiceUrl = "foo";
		this.oPseudoPublicParent.setModel(oModel);

		this.oPseudoPublicParent.placeAt("qunit-fixture");
		await nextUIUpdate();

		// simulate analyzer returning some elements
		this.fnEnhanceInvisibleElementsStub = sandbox.stub(AdditionalElementsAnalyzer, "enhanceInvisibleElements").resolves([
			{
				selected: false,
				label: "Invisible1",
				tooltip: "",
				type: "invisible",
				elementId: this.oInvisible1.getId(),
				bindingPaths: ["Property01"],
				sourceAggregation: "contentLeft"
			},
			{
				selected: true,
				label: "Invisible2",
				tooltip: "",
				type: "invisible",
				elementId: this.oInvisible2.getId(),
				bindingPaths: ["Property02"],
				sourceAggregation: "contentLeft"
			}
		]);

		function getAddItems(sType) {
			return [
				{
					selected: true,
					tooltip: "",
					entityType: "EntityType01",
					bindingPath: "Property03",
					name: "Name1",
					label: sType + 0,
					type: sType
				},
				{
					selected: false,
					tooltip: "",
					entityType: "EntityType01",
					bindingPath: "Property04",
					name: "Name2",
					label: sType + 1,
					type: sType
				},
				{
					selected: false,
					tooltip: "",
					entityType: "EntityType01",
					bindingPath: "Property05",
					name: "Name3",
					label: sType + 2,
					type: sType
				}
			];
		}

		// TODO: getadditems remove type
		this.fnGetUnrepresentedDelegateProperties = sandbox.stub(
			AdditionalElementsAnalyzer,
			"getUnrepresentedDelegateProperties").resolves(getAddItems("delegate")
		);
	}

	function givenThePluginWithCancelClosingDialog() {
		givenThePluginWithDialogClosing.call(this, Promise.reject(new CancelError()));
	}

	function givenThePluginWithOKClosingDialog() {
		givenThePluginWithDialogClosing.call(this, Promise.resolve());
	}

	function givenThePluginWithDialogClosing(oDialogReturnValue) {
		// intercept command creation
		this.fnGetCommandSpy = sandbox.spy(CommandFactory.prototype, "getCommandFor");

		this.oPlugin = new AdditionalElementsPlugin({
			commandFactory: new CommandFactory()
		});
		this.oDialog = this.oPlugin.getDialog();

		// simulate dialog closed with OK/CANCEL
		this.fnDialogOpen = sandbox.stub(this.oDialog, "open").callsFake(function() {
			return oDialogReturnValue;
		});
	}

	function enhanceForResponsibleElement(mActions) {
		if (mActions.responsibleElement) {
			var oSourceElementOverlay = OverlayRegistry.getOverlay(mActions.responsibleElement.source);
			var oSourceDTMetadata = oSourceElementOverlay.getDesignTimeMetadata().getData();

			var oActions = {
				getResponsibleElement() {
					return mActions.responsibleElement.target;
				},
				actionsFromResponsibleElement: mActions.responsibleElement.actionsFromResponsibleElement || [],
				...oSourceDTMetadata.actions
			};

			oSourceElementOverlay.setDesignTimeMetadata({ ...oSourceDTMetadata, actions: oActions });
		}
	}

	function attachInstanceSpecificDelegate(mActions, oRelevantContainer) {
		// attach instance-specific delegate to the control, where the model-specific read delegate is also valid for.
		// instance-specific delegate should always overrule the model-specific read delegate registered in delegate mediator.
		const oCustomData = new CustomData({
			key: "sap-ui-custom-settings",
			value: {
				"sap.ui.fl": {
					delegate: JSON.stringify({
						name: mActions.delegateModulePath || TEST_DELEGATE_PATH
					})
				}
			}
		});
		oRelevantContainer.insertAggregation("customData", oCustomData, 0, /* bSuppressInvalidate= */true);
	}

	function registerControlSpecificWriteDelegate(oRelevantContainer) {
		DelegateMediatorAPI.registerWriteDelegate({
			controlType: oRelevantContainer.getMetadata().getName(),
			delegate: TEST_DELEGATE_PATH,
			requiredLibraries: DEFAULT_REQUIRED_LIBRARIES
		});
	}

	function registerReadDelegate() {
		DelegateMediatorAPI.registerReadDelegate({
			modelType: SomeModel.getMetadata().getName(),
			delegate: TEST_DELEGATE_PATH
		});
	}

	function enhanceForAddViaDelegate(mActions, mDelegateRegistration) {
		const mAddViaDelegateAction = ObjectPath.get(["add", "delegate"], mActions);
		if (mAddViaDelegateAction) {
			mDelegateRegistration = merge(
				{
					modelSpecificRead: true,
					controlSpecificWrite: false,
					instanceSpecific: true
				},
				mDelegateRegistration
			); // default test setting
			const oRelevantContainer = mAddViaDelegateAction.changeOnRelevantContainer ? this.oPseudoPublicParent : this.oControl;
			if (mDelegateRegistration?.modelSpecificRead) {
				registerReadDelegate();
			}
			if (mDelegateRegistration?.controlSpecificWrite) {
				registerControlSpecificWriteDelegate(oRelevantContainer);
			}
			if (mDelegateRegistration?.instanceSpecific) {
				attachInstanceSpecificDelegate(mActions, oRelevantContainer);
			}
		}
	}

	//                                          PseudoPublicParent (VerticalLayout)
	//                                                    oControl (Bar)
	//                 contentLeft                                        contentMiddle         contentRight
	// [oSibling, <oUnsupportedInvisible>, <oInvisible1>, <oInvisible2>        EMPTY          oIrrelevantChild]
	function createOverlayWithAggregationActions(
		mActions,
		sOverlayType,
		mDelegateRegistration = {}
	) {
		var mChildNames = {
			singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		};
		var mName = mActions.noName ? undefined : {
			singular: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME",
			plural: "I18N_KEY_USER_FRIENDLY_CONTROL_NAME_PLURAL"
		};

		var bPropagateRelevantContainer = false;

		if (mActions.reveal) {
			mActions.reveal.getInvisibleElements = function() {
				return [this.oInvisible1, this.oInvisible2];
			};

			bPropagateRelevantContainer = mActions.reveal.changeOnRelevantContainer;
		}
		var mAddViaDelegateAction = ObjectPath.get(["add", "delegate"], mActions);
		if (mAddViaDelegateAction) {
			bPropagateRelevantContainer = !!mAddViaDelegateAction.changeOnRelevantContainer;
		}

		var oPseudoPublicParentDesignTimeMetadata = {
			aggregations: {
				content: {
					propagateRelevantContainer: bPropagateRelevantContainer,
					actions: null,
					childNames: null,
					getStableElements() {
						return [];
					},
					getIndex(oBar, oBtn) {
						if (oBtn) {
							return oBar.getContentLeft().indexOf(oBtn) + 1;
						}
						return oBar.getContentLeft().length;
					}
				}
			}
		};
		var oParentDesignTimeMetadata = {
			aggregations: {
				contentLeft: {
					childNames: mChildNames,
					displayName: {
						singular: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME",
						plural: "I18N_KEY_USER_FRIENDLY_AGGREGATION_NAME_PLURAL"
					},
					actions: (mActions.move || mActions.add || mActions.addODataProperty) ? {
						add: mActions.add || null,
						move: mActions.move || null,
						addODataProperty: mActions.addODataProperty || null
					} : null
				}
			}
		};
		var oControlDesignTimeMetadata = {
			name: mName,
			actions: mActions.reveal ? {
				reveal: mActions.reveal
			} : null
		};
		var oUnsupportedInvisibleDesignTimeMetadata = {
			// unsupported control without any designtime metadata
			actions: null
		};
		var oCustomDesignTimeMetadata = {
			"sap.ui.layout.VerticalLayout": oPseudoPublicParentDesignTimeMetadata,
			"sap.m.Input": oUnsupportedInvisibleDesignTimeMetadata,
			"sap.m.Bar": oParentDesignTimeMetadata,
			"sap.m.Button": oControlDesignTimeMetadata
		};

		return new Promise(function(resolve) {
			this.oDesignTime = new DesignTime({
				rootElements: [this.oPseudoPublicParent],
				designTimeMetadata: oCustomDesignTimeMetadata
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPseudoPublicParentOverlay = OverlayRegistry.getOverlay(this.oPseudoPublicParent);
				this.oParentOverlay = OverlayRegistry.getOverlay(this.oControl);
				this.oSiblingOverlay = OverlayRegistry.getOverlay(this.oSibling);
				this.oIrrelevantOverlay = OverlayRegistry.getOverlay(this.oIrrelevantChild);
				enhanceForResponsibleElement(mActions);
				enhanceForAddViaDelegate.call(
					this,
					mActions,
					mDelegateRegistration
				);
				resolve();
			}.bind(this));
		}.bind(this))
		.then(async function() {
			await nextUIUpdate();
			this.oDesignTime.addPlugin(this.oPlugin);
			switch (sOverlayType) {
				case ON_SIBLING :
					return this.oSiblingOverlay;
				case ON_CHILD :
					return this.oParentOverlay;
				case ON_CONTAINER :
					return this.oPseudoPublicParentOverlay;
				case ON_IRRELEVANT :
					return this.oIrrelevantOverlay;
				default :
					return undefined;
			}
		}.bind(this));
	}

	function assertDialogModelLength(assert, iExpectedLength, sMsg) {
		var aElements = this.oPlugin.getDialog().getElements();
		assert.equal(aElements.length, iExpectedLength, sMsg);
	}

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
		Library.getResourceBundleFor.restore();
	});
});
