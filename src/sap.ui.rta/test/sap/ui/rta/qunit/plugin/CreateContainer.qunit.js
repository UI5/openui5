/* global QUnit */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Lib",
	"sap/ui/core/Title",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/CreateContainer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	uid,
	XMLView,
	Lib,
	Title,
	DesignTime,
	OverlayRegistry,
	DtUtil,
	ChangesWriteAPI,
	Utils,
	Form,
	FormContainer,
	FormLayout,
	SimpleForm,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	CreateContainerPlugin,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc">' + "</mvc:View>";

	let oMockedViewWithStableId;
	XMLView.create({
		id: "mockview",
		definition: viewContent
	}).then(function(oView) {
		oMockedViewWithStableId = oView;
		QUnit.start();
	});

	const sandbox = sinon.createSandbox();
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	QUnit.module("Given a designTime and createContainer plugin are instantiated for a Form", {
		async beforeEach(assert) {
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			this.oCreateContainer = new CreateContainerPlugin({
				commandFactory: new CommandFactory()
			});
			this.oFormContainer = new FormContainer(oMockedViewWithStableId.createId("formContainer"), {
				title: new Title({
					text: "title"
				})
			});
			this.oForm = new Form(oMockedViewWithStableId.createId("form"), {
				formContainers: [this.oFormContainer],
				layout: new FormLayout({
				})
			});
			this.oVerticalLayout = new VerticalLayout(oMockedViewWithStableId.createId("verticalLayout"), {
				content: [this.oForm]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.sNewControlID = oMockedViewWithStableId.createId(uid());
			this.oNewFormContainerStub = new FormContainer(this.sNewControlID);
			this.oForm.addFormContainer(this.oNewFormContainerStub);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oCreateContainer]
			});

			const fnDone = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				this.oNewFormContainerOverlay = OverlayRegistry.getOverlay(this.oNewFormContainerStub);

				fnDone();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}

	}, function() {
		QUnit.test("when an overlay has no createContainer action designTime metadata", async function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			await DtUtil.waitForSynced(this.oDesignTime)();
			const bIsEditable = await this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			assert.notOk(bIsEditable, "then the overlay is not editable");
			assert.strictEqual(this.oCreateContainer.isAvailable([this.oFormOverlay], {}, false), false, "then isAvailable is called and it returns false");
			assert.strictEqual(this.oCreateContainer.isEnabled([this.oFormOverlay], { action: undefined }), false, "then isEnabled is called and it returns false");
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, but has no isEnabled property defined", async function(assert) {
			const oAction = {
				changeType: "addGroup"
			};
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							createContainer: oAction
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			await DtUtil.waitForSynced(this.oDesignTime)();
			const bIsEditable = await this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			assert.ok(bIsEditable, "then the overlay is editable");
			assert.strictEqual(this.oCreateContainer.isAvailable([this.oFormOverlay], {}, false), true, "then isAvailable returns true");
			assert.strictEqual(this.oCreateContainer.isEnabled([this.oFormOverlay], { action: oAction }), true, "then isEnabled returns true");
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, has no changeType and isEnabled property is true", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							createContainer: {
								isEnabled: true
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oCreateContainer.isAvailable([this.oFormOverlay], {}, false), false, "then isAvailable is called and then it returns false");
				assert.strictEqual(this.oCreateContainer.isEnabled([this.oFormOverlay], { action: { isEnabled: true } }), true, "then isEnabled is called and then it returns correct value");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, and isEnabled property is function", async function(assert) {
			const oAction = {
				changeType: "addGroup",
				isEnabled(oElement) {
					return oElement.getMetadata().getName() === "sap.ui.layout.form.Form";
				}
			};
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							createContainer: oAction
						},
						childNames: { singular: "formContainer" }
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			await DtUtil.waitForSynced(this.oDesignTime)();
			assert.strictEqual(this.oCreateContainer.isAvailable([this.oFormOverlay], {}, false), true, "then isAvailable is called and it returns true");

			const bEditable = await this.oCreateContainer._isEditable(this.oFormOverlay, false);
			assert.ok(bEditable, "then the overlay is editable");

			const sExpectedText = Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_CREATE_CONTAINER", ["formContainer"]);
			const aMenuItems = await this.oCreateContainer.getMenuItems([this.oFormOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_CREATE_CHILD_CONTAINER", "there is an entry for create child container");
			assert.strictEqual(aMenuItems[0].aggregationRelevant, true, "then the action is flagged as aggregation-relevant");
			assert.strictEqual(this.oCreateContainer.isEnabled([this.oFormOverlay], aMenuItems[0]), true, "then isEnabled returns true");
			assert.deepEqual(aMenuItems[0].text, sExpectedText, "then the correct message key is returned");
		});

		QUnit.test("when an overlay has createContainer action with changeOnRelevantContainer true, but its relevant container has no stable id", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							createContainer: {
								changeType: "addGroup",
								changeOnRelevantContainer: true
							}
						}
					}
				}
			});
			sandbox.stub(this.oCreateContainer, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oLayoutOverlay) {
					return false;
				}
				return true;
			}.bind(this));
			sandbox.stub(this.oFormContainerOverlay, "getRelevantContainer").returns(this.oForm);

			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);
			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				return this.oCreateContainer._isEditableCheck(this.oFormContainerOverlay, true);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when a sibling overlay has createContainer action designTime metadata, but for another aggregation", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					toolBar: {
						actions: {
							createContainer: {
								changeType: "addToolbarContainer"
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return this.oCreateContainer._isEditableCheck(this.oFormOverlay, true)
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when the designTimeMetadata has a getContainerIndex property and a function _determineIndex() is called", function(assert) {
			const vAction = {
				aggregationName: "formContainers",
				getIndex(oForm, oFormContainer) {
					const sAggregationName = vAction.aggregationName;
					const oMetadata = oForm.getMetadata();
					const oAggregation = oMetadata.getAggregation(sAggregationName);
					const sGetter = oAggregation._sGetter;
					const aContainers = oForm[sGetter]();
					let iIndex;
					if (oFormContainer) {
						iIndex = aContainers.indexOf(oFormContainer) + 1;
					} else {
						iIndex = aContainers.length;
					}
					return iIndex;
				}
			};

			assert.deepEqual(this.oCreateContainer._determineIndex(this.oForm, undefined, vAction.aggregationName, vAction.getIndex), 2, "then the correct index of the new added group is returned from the function call");
		});

		QUnit.test("when the designTimeMetadata has no getContainerIndex property given and a function _determineIndex() is called", function(assert) {
			const vAction = {
				aggregationName: "formContainers",
				changeType: "addGroup"
			};

			assert.deepEqual(this.oCreateContainer._determineIndex(this.oForm, undefined, vAction.aggregationName, undefined), 0, "then the default index calculation would start and returns the right index");
		});

		QUnit.test("when the designTimeMetadata has a getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			const vAction = {
				getCreatedContainerId(sNewControlID) {
					return sNewControlID;
				}
			};

			assert.deepEqual(this.oCreateContainer.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewFormContainerOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when the designTimeMetadata has no getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			const vAction = {
				changeType: "addGroup"
			};

			assert.deepEqual(this.oCreateContainer.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewFormContainerOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when a child overlay has createContainer action designTime metadata and handler() is called, ", async function(assert) {
			const fnDone = assert.async();

			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							createContainer: {
								changeType: "addGroup",
								isEnabled: true
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);
			// editable has to be re-evaluated with the new actions
			await this.oCreateContainer._isEditable(this.oFormOverlay);

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.strictEqual(oCommand.getLabel(), "My New Group", "then the container is correctly labeled");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addGroup", "then the correct action is passed to the event");
				fnDone();
			});
			assert.ok(true, "then plugin createContainer is called with this overlay");

			const aMenuItems = await this.oCreateContainer.getMenuItems([this.oFormOverlay]);
			RtaQunitUtils.simulateRename(sandbox, "My New Group", () => {
				this.oCreateContainer.handler([this.oFormOverlay], { menuItem: aMenuItems[0] });
			});
		});

		QUnit.test("when the rename during the creation flow is invalid", async function(assert) {
			const fnDone = assert.async();

			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							createContainer: {
								changeType: "addGroup",
								isEnabled: true,
								validators: ["noEmptyText"]
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);
			// editable has to be re-evaluated with the new actions
			await this.oCreateContainer._isEditable(this.oFormOverlay);

			const aMenuItems = await this.oCreateContainer.getMenuItems([this.oFormOverlay]);
			const oCreateCommandSpy = sandbox.spy(CommandFactory, "getCommandFor");
			RtaQunitUtils.simulateRename(
				sandbox,
				"",
				() => {
					this.oCreateContainer.handler([this.oFormOverlay], { menuItem: aMenuItems[0] });
				},
				(sError) => {
					assert.ok(oCreateCommandSpy.notCalled, "then no command is created");
					assert.strictEqual(
						sError,
						oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"),
						"then the error message is correct"
					);
					fnDone();
				}
			);
		});

		QUnit.test("when a sibling overlay has createContainer action designTime metadata and handler() is called, ", async function(assert) {
			const fnDone = assert.async();

			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							createContainer: {
								changeType: "addGroup"
							}
						}
					}
				}
			});
			// editable has to be re-evaluated with the new actions
			await this.oCreateContainer._isEditable(this.oFormOverlay);

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addGroup", "then the correct action is passed to the event");
				assert.ok(oCommand.getLabel(), "then the label is in the command");
				assert.deepEqual(oCommand.getIndex(), 1, "then the correct index is in the command");
				assert.deepEqual(oCommand.getParentId(), this.oForm.getId(), "then the correct parentId is in the command");

				fnDone();
			}.bind(this));

			const aMenuItems = await this.oCreateContainer.getMenuItems([this.oFormContainerOverlay]);
			RtaQunitUtils.simulateRename(sandbox, "My New Group", () => {
				this.oCreateContainer.handler([this.oFormContainerOverlay], { menuItem: aMenuItems[0] });
			});
		});
	});

	QUnit.module("Given a designTime and createContainer plugin are instantiated for a SimpleForm", {
		async beforeEach(assert) {
			const fnDone = assert.async();
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			this.oCreateContainer = new CreateContainerPlugin({
				commandFactory: new CommandFactory()
			});
			this.oTitle = new Title(oMockedViewWithStableId.createId("title"), { text: "title" });
			this.oSimpleForm = new SimpleForm(oMockedViewWithStableId.createId("form"), {
				layout: "ResponsiveGridLayout",
				content: [this.oTitle]
			});
			this.oVerticalLayout = new VerticalLayout(oMockedViewWithStableId.createId("verticalLayout"), {
				content: [this.oSimpleForm]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oCreateContainer]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm.getAggregation("form"));
				this.oGroupOverlay = OverlayRegistry.getOverlay(this.oSimpleForm.getAggregation("form").getFormContainers()[0]);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when a child overlay has propagated createContainer action designTime metadata and handler() is called, ", async function(assert) {
			const fnDone = assert.async();

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addSimpleFormGroup", "then the correct action is passed to the event");
				assert.deepEqual(oCommand.getParentId(), this.oSimpleForm.getAggregation("form").getId(), "then the correct parentId is in the command");
				fnDone();
			}.bind(this));
			assert.ok(true, "then plugin createContainer is called with this overlay");

			const aMenuItems = await this.oCreateContainer.getMenuItems([this.oFormOverlay]);
			RtaQunitUtils.simulateRename(sandbox, "My New Group", () => {
				this.oCreateContainer.handler([this.oFormOverlay], { menuItem: aMenuItems[0] });
			});
		});

		QUnit.test("when a sibling overlay has propagated createContainer action designTime metadata and handler() is called, ", async function(assert) {
			const fnDone = assert.async();

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addSimpleFormGroup", "then the correct action is passed to the event");
				assert.deepEqual(oCommand.getParentId(), this.oSimpleForm.getAggregation("form").getId(), "then the correct parentId is in the command");
				fnDone();
			}.bind(this));
			assert.ok(true, "then plugin createContainer is called with this overlay");

			const aMenuItems = await this.oCreateContainer.getMenuItems([this.oGroupOverlay]);
			RtaQunitUtils.simulateRename(sandbox, "My New Group", () => {
				this.oCreateContainer.handler([this.oGroupOverlay], { menuItem: aMenuItems[0] });
			});
		});

		RtaQunitUtils.testGetParameters(function() {
			return this.oCreateContainer;
		}, ["isSibling", "label"]);

		QUnit.test("when createCommands is called directly with a pre-resolved action", async function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							createContainer: {
								changeType: "addGroup",
								isEnabled: true
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);
			await this.oCreateContainer._isEditable(this.oFormOverlay);

			const oAction = this.oCreateContainer.getCreateActions(this.oFormOverlay, false)[0];
			const oFireStub = sandbox.stub();
			this.oCreateContainer.attachElementModified(oFireStub);

			const oCommand = await this.oCreateContainer.createCommands(this.oFormOverlay, {
				isSibling: false,
				label: "My New Group",
				action: oAction
			});

			assert.strictEqual(
				oCommand.getMetadata().getName(),
				"sap.ui.rta.command.CreateContainer",
				"then createCommands returns a CreateContainer command"
			);
			assert.strictEqual(oCommand.getLabel(), "My New Group", "then the command has the given label");
			assert.strictEqual(oFireStub.callCount, 1, "then the elementModified event is fired once");
			const oEventArgs = oFireStub.getCall(0).args[0];
			assert.strictEqual(oEventArgs.getParameter("command"), oCommand, "then the fired command matches the returned command");
			assert.strictEqual(oEventArgs.getParameter("action"), oAction, "then the pre-resolved action is passed to the event");
			assert.ok(oEventArgs.getParameter("newControlId"), "then a newControlId is passed to the event");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
