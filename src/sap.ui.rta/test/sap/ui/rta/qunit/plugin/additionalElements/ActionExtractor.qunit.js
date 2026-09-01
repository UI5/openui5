/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/additionalElements/ActionExtractor",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Bar,
	Button,
	Lib,
	DesignTime,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	DelegateMediatorAPI,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	ActionExtractor,
	AdditionalElementsPlugin,
	AdditionalElementsUtils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	let oDTMetadata = {};

	QUnit.module("Given DesignTime Metadata structures with valid and invalid actions...", {
		beforeEach() {
			this.fnLogErrorStub = sandbox.stub(Log, "error");
			sandbox.stub(ActionExtractor, "_getRevealActions").resolves();
			sandbox.stub(ActionExtractor, "_getAddViaDelegateActions").resolves();
			sandbox.stub(AdditionalElementsUtils, "getParents").returns({
				parentOverlay: {
					getDesignTimeMetadata() {
						return oDTMetadata;
					}
				}
			});
		},
		afterEach() {
			ActionExtractor.clearCache();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getActions is called with DT Metadata containing valid actions", async function(assert) {
			oDTMetadata = new ElementDesignTimeMetadata({
				data: {
					aggregations: {
						dummyAggregation: {
							actions: {
								add: {
									delegate: "addViaDelegateAction"
								},
								reveal: "revealAction"
							}
						}
					}
				}
			});

			await ActionExtractor.getActions(true, {});
			assert.notOk(this.fnLogErrorStub.called, "then no error is raised on the log");
		});
	});

	// 	oBar (Bar)
	//  	contentLeft
	//      	[oVisibleLeftButton, oInvisibleLeftButton]
	async function givenBarWithButtons() {
		this.oVisibleLeftButton = new Button({ id: "VisibleLeftButton", visible: true, text: "VisibleLeft" });
		this.oInvisibleLeftButton = new Button({ id: "InvisibleLeftButton", visible: false, text: "InvisibleLeft" });
		this.oBar = new Bar({
			id: "bar",
			contentLeft: [this.oVisibleLeftButton, this.oInvisibleLeftButton]
		});

		this.oPseudoPublicParent = new VerticalLayout({
			id: "pseudoParent",
			content: [this.oBar],
			width: "100%"
		});

		this.oPseudoPublicParent.placeAt("qunit-fixture");
		await nextUIUpdate();
	}

	QUnit.module("Given a bar with a visible and invisible buttons", {
		async before(assert) {
			await givenBarWithButtons.call(this);
			const done = assert.async();

			this.oPlugin = new AdditionalElementsPlugin({
				commandFactory: new CommandFactory()
			});
			this.oDialog = this.oPlugin.getDialog();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oPseudoPublicParent],
				plugins: [this.oPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVisibleLeftButtonOverlay = OverlayRegistry.getOverlay(this.oVisibleLeftButton);
				done();
			}.bind(this));
		},
		afterEach() {
			ActionExtractor.clearCache();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the control does not have a change handler for reveal", async function(assert) {
			sandbox.stub(this.oPlugin, "hasChangeHandler").resolves(false);

			const bIsEditable = await this.oPlugin._isEditableCheck(this.oVisibleLeftButtonOverlay, true);
			assert.notOk(bIsEditable, "the overlay should not be editable as no actions are available for it");
		});

		QUnit.test("when the invisible button becomes invalid (destroyed) during the reveal check", async function(assert) {
			const oGetRevealActionsStub = sandbox.stub(ActionExtractor, "_getRevealActions");
			oGetRevealActionsStub.callThrough();

			oGetRevealActionsStub.onFirstCall().callsFake((...aArgs) => {
				this.oInvisibleLeftButton.destroy();
				return oGetRevealActionsStub.wrappedMethod.apply(this, aArgs);
			});

			const bIsEditable = await this.oPlugin._isEditableCheck(this.oVisibleLeftButtonOverlay, true);
			assert.notOk(bIsEditable, "the overlay should not be editable as no actions are available for it");
		});
	});

	QUnit.module("Given a shared plain-object 'add.delegate' action evaluated in parallel", {
		beforeEach() {
			// Mirrors designtime definitions like sap.ui.layout.form.SimpleForm, where the
			// "add.delegate" action is a plain object. Such objects are module-level singletons
			// and getActionDataFromAggregations returns the shared reference (not a copy).
			this.oDTMetadata = new ElementDesignTimeMetadata({
				data: {
					aggregations: {
						content: {
							actions: {
								add: {
									delegate: {
										changeType: "addFields"
									}
								}
							}
						}
					}
				}
			});

			this.oParentA = new Button("parentA");
			this.oParentB = new Button("parentB");

			// The parent element is derived from the overlay passed to _getAddViaDelegateActions
			sandbox.stub(AdditionalElementsUtils, "getParents").callsFake((bSibling, oOverlay) => {
				return {
					parentOverlay: {
						getDesignTimeMetadata: () => this.oDTMetadata
					},
					parent: oOverlay.__parent,
					relevantContainer: oOverlay.__parent,
					relevantContainerOverlay: {}
				};
			});

			// Treat every control as available with a stable ID and a change handler
			sandbox.stub(OverlayRegistry, "getOverlay").returns({});
			sandbox.stub(Lib, "load").resolves();
			this.oPlugin = {
				hasStableId: () => true,
				hasChangeHandler: () => Promise.resolve(true)
			};

			// Return control-specific read/write delegate info so cross-contamination is detectable.
			// The read delegate resolves asynchronously to force the two evaluations to interleave.
			sandbox.stub(DelegateMediatorAPI, "getReadDelegateForControl").callsFake(({ control }) => {
				return new Promise(function(resolve) {
					setTimeout(function() {
						resolve({
							instance: {},
							payload: { forControl: control.getId() },
							modelType: control.getId()
						});
					}, 10);
				});
			});
			sandbox.stub(DelegateMediatorAPI, "getWriteDelegateForControl").callsFake(({ control }) => {
				return Promise.resolve({
					controlType: "sap.m.Button",
					requiredLibraries: { [control.getId()]: {} }
				});
			});
		},
		afterEach() {
			this.oParentA.destroy();
			this.oParentB.destroy();
			ActionExtractor.clearCache();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when two overlays are evaluated concurrently", async function(assert) {
			const [mActionsA, mActionsB] = await Promise.all([
				ActionExtractor._getAddViaDelegateActions(false, { __parent: this.oParentA }, this.oPlugin),
				ActionExtractor._getAddViaDelegateActions(false, { __parent: this.oParentB }, this.oPlugin)
			]);

			const oDelegateInfoA = mActionsA.content.addViaDelegate.delegateInfo;
			const oDelegateInfoB = mActionsB.content.addViaDelegate.delegateInfo;

			assert.strictEqual(oDelegateInfoA.modelType, "parentA", "then the first result keeps its own delegate info");
			assert.strictEqual(oDelegateInfoB.modelType, "parentB", "then the second result keeps its own delegate info");
			assert.strictEqual(
				oDelegateInfoA.payload.forControl,
				"parentA",
				"then the first result's payload is not overwritten by the parallel evaluation"
			);
			assert.strictEqual(
				oDelegateInfoB.payload.forControl,
				"parentB",
				"then the second result's payload is not overwritten by the parallel evaluation"
			);
			assert.ok(oDelegateInfoA.requiredLibraries.parentA, "then the first result keeps its own required libraries");
			assert.ok(oDelegateInfoB.requiredLibraries.parentB, "then the second result keeps its own required libraries");
			assert.notStrictEqual(
				mActionsA.content.addViaDelegate.action,
				mActionsB.content.addViaDelegate.action,
				"then each evaluation produces its own action object"
			);

			// The shared designtime action object must not be polluted with instance-specific data
			const oSharedAction = this.oDTMetadata.getActionDataFromAggregations("add", this.oParentA, undefined, "delegate")[0];
			assert.notOk("element" in oSharedAction, "then the shared designtime action is not polluted with an element reference");
			assert.notOk("delegateInfo" in oSharedAction, "then the shared designtime action is not polluted with delegate info");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
