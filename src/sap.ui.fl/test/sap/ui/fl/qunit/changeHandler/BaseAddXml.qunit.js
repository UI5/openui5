/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/changeHandler/BaseAddXml",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/util/XMLHelper"
], function(
	Log,
	Button,
	HBox,
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	FlexObjectFactory,
	DelegateMediator,
	BaseAddXml,
	nextUIUpdate,
	sinon,
	XMLHelper
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const mPreloadedModules = {};

	const sReference = "sap.ui.fl.qunit.changeHandler.BaseAddXml";
	const sFragmentPath = "sap/ui/fl/qunit/changeHandler/BaseAddXml/changes/fragments/Fragment.fragment.xml";
	mPreloadedModules[sFragmentPath] =
		'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
			'<Button xmlns="sap.m" id="button" text="Hello World"></Button>' +
		"</core:FragmentDefinition>";
	const sFragmentInvalidTypePath = "sap/ui/fl/qunit/changeHandler/BaseAddXml/changes/fragments/FragmentInvalidType.fragment.xml";
	mPreloadedModules[sFragmentInvalidTypePath] = '<ManagedObject xmlns="sap.ui.base" id="managedObject"></ManagedObject>';
	const sFragmentMultiplePath = "sap/ui/fl/qunit/changeHandler/BaseAddXml/changes/fragments/FragmentMultiple.fragment.xml";
	mPreloadedModules[sFragmentMultiplePath] =
		'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
			'<Button xmlns="sap.m" id="button1" text="Hello World"></Button>' +
			'<Button xmlns="sap.m" id="button2" text="Hello World"></Button>' +
			'<Button xmlns="sap.m" id="button3" text="Hello World"></Button>' +
		"</core:FragmentDefinition>";
	const sFragmentMultipleInvalidTypesPath = "sap/ui/fl/qunit/changeHandler/BaseAddXml/changes/fragments/FragmentMultipleInvalidTypes.fragment.xml";
	mPreloadedModules[sFragmentMultipleInvalidTypesPath] =
		'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:base="sap.ui.base">' +
			'<Button xmlns="sap.m" id="button" text="Hello World"></Button>' +
			'<Button xmlns="sap.m" id="button2" text="Hello World"></Button>' +
			'<base:ManagedObject id="managedObject"></base:ManagedObject>' +
		"</core:FragmentDefinition>";
	const sFragmentInvalidPath = "sap/ui/fl/qunit/changeHandler/BaseAddXml/changes/fragments/FragmentInvalid.fragment.xml";
	mPreloadedModules[sFragmentInvalidPath] = "invalidFragment";
	const sNonExistingPath = "sap/ui/fl/qunit/changeHandler/BaseAddXml/changes/fragments/NonExisting";

	sap.ui.require.preload(mPreloadedModules);

	const sTypeError = "The content of the xml fragment does not match the type of the targetAggregation: ";
	const sWrongAggregationError = "The given Aggregation is not available in the given control: hbox";

	// the completeChangeContent function ignores the fragment property, but in applyChange we still need the information.
	// that's why we need to patch it in there before a change is applied.
	// in the code this is done in the command.

	QUnit.module("Given a BaseAddXml Change Handler", {
		beforeEach() {
			this.oHBox = new HBox("hbox", {
				items: [this.oButton]
			});

			const oChangeJson = {
				reference: sReference,
				selector: {
					id: this.oHBox.getId(),
					type: "sap.m.HBox"
				},
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				content: {
					fragmentPath: "fragments/Fragment.fragment.xml",
					targetAggregation: "items",
					index: 1
				}
			};

			this.oChange = FlexObjectFactory.createFromFileContent(oChangeJson);
		},
		afterEach() {
			this.oHBox.destroy();
		}
	}, function() {
		QUnit.test("When calling 'completeChangeContent' with complete information", function(assert) {
			const oExpectedChangeContent = {
				fragmentPath: "fragments/Fragment.fragment.xml"
			};

			BaseAddXml.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChange.getContent());
			assert.deepEqual(
				this.oChange.getContent(),
				oExpectedChangeContent,
				"then the change specific content is in the change, but the fragment not"
			);
			assert.equal(
				this.oChange.getFlexObjectMetadata().moduleName,
				"sap/ui/fl/qunit/changeHandler/BaseAddXml/changes/fragments/Fragment.fragment.xml",
				"and the module name is set correct in change"
			);
		});

		QUnit.test("When calling 'completeChangeContent' without complete information", function(assert) {
			this.oChangeSpecificContent.content.fragmentPath = null;
			assert.throws(
				() => {BaseAddXml.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChange.getContent());},
				Error("Attribute missing from the change specific content 'fragmentPath'"),
				"without fragmentPath 'completeChangeContent' throws an error"
			);
		});
	});

	QUnit.module("Given a BaseAddXml Change Handler with JSTreeModifier", {
		async beforeEach() {
			this.sHBoxId = "hbox";

			this.oChangeJson = {
				moduleName: sFragmentPath,
				selector: {
					id: this.sHBoxId,
					type: "sap.m.HBox"
				},
				reference: sReference,
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				content: {
					fragmentPath: "fragments/Fragment.fragment.xml",
					targetAggregation: "items",
					index: 1
				}
			};
			this.mChangeInfo = {
				aggregationName: this.oChangeSpecificContent.content.targetAggregation,
				index: this.oChangeSpecificContent.content.index
			};

			this.oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			BaseAddXml.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChange.getContent());

			// JSTreeModifier specific beforeEach
			this.oButton = new Button("initialButton");
			this.oHBox = new HBox(this.sHBoxId, {
				items: [this.oButton]
			});
			this.sAggregationType = this.oHBox.getMetadata().getAggregation("items").type;
			this.oHBox.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oPropertyBag = {
				modifier: JsControlTreeModifier,
				view: {
					getController() {},
					getId() {}
				}
			};
		},
		afterEach() {
			this.oHBox.destroy();
			DelegateMediator.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying the change on a js control tree", async function(assert) {
			const mRevertData = {
				id: "projectId.button",
				aggregationName: "items"
			};
			await BaseAddXml.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			assert.equal(this.oHBox.getItems().length, 2, "after the change there are 2 items in the hbox");
			assert.equal(this.oHBox.getItems()[1].getId(), "projectId.button", "the fragments control id is prefixed with project id");
			assert.deepEqual(this.oChange.getRevertData(), [mRevertData], "then the revert data is build properly");
		});

		QUnit.test("when applying a change with multiple addXMLAdjustFragmentHandlers", async function(assert) {
			const oHandler1 = sandbox.stub().callsFake((sFragment) => {
				return sFragment.replace("<Button", '<Button xmlns="sap.m." id="newButton1" /><Button');
			});
			DelegateMediator.registerAddXMLAdjustFragmentHandler({
				key: "handler1",
				handler: oHandler1,
				reference: sReference
			});
			const oHandler2 = sandbox.stub().callsFake((sFragment) => {
				return Promise.resolve(sFragment.replace("<Button", '<Button xmlns="sap.m." id="newButton2" /><Button'));
			});
			DelegateMediator.registerAddXMLAdjustFragmentHandler({
				key: "handler2",
				handler: oHandler2,
				reference: sReference
			});
			const oHandler3 = sandbox.stub().callsFake((sFragment) => {
				return sFragment.replace("<Button", '<Button xmlns="sap.m." id="newButton3" /><Button');
			});
			DelegateMediator.registerAddXMLAdjustFragmentHandler({
				key: "handler3",
				handler: oHandler3,
				reference: "differentReference"
			});

			await BaseAddXml.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			assert.strictEqual(this.oHBox.getItems().length, 5, "after the change there are 4 items in the hbox");
			assert.strictEqual(this.oHBox.getItems()[1].getId(), "projectId.newButton3", "the fragments control id is correctly prefixed");
			assert.strictEqual(this.oHBox.getItems()[2].getId(), "projectId.newButton2", "the fragments control id is correctly prefixed");
			assert.strictEqual(this.oHBox.getItems()[3].getId(), "projectId.newButton1", "the fragments control id is correctly prefixed");
			assert.strictEqual(this.oHBox.getItems()[4].getId(), "projectId.button", "the fragments control id is correctly prefixed");
			assert.strictEqual(oHandler1.callCount, 1, "then handler1 was called once");
			assert.strictEqual(oHandler2.callCount, 1, "then handler2 was called once");
			assert.strictEqual(oHandler3.callCount, 1, "then handler3 was called once");
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			sandbox.stub(Log, "error");
			this.mChangeInfo.aggregationName = "invalidAggregation";
			return BaseAddXml.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message, sWrongAggregationError, "then apply change throws an error");
			});
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements and one invalid type inside", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentMultipleInvalidTypesPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message,
					`${sTypeError}${this.sAggregationType}`,
					"then apply change throws an error");
				assert.equal(this.oHBox.getItems().length, 1, "after the change there is still only 1 item in the hbox");
			}.bind(this));
		});

		QUnit.test("When reverting the change on a js control tree", async function(assert) {
			await BaseAddXml.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			await BaseAddXml.revertChange(this.oChange, this.oHBox, this.oPropertyBag);
			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting the change on a js control tree with multiple root elements", async function(assert) {
			this.oChangeJson.moduleName = sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			await BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			await BaseAddXml.revertChange(oChange, this.oHBox, this.oPropertyBag);
			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting a change that failed on a js control tree with multiple root elements", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentMultipleInvalidTypesPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message,
					`${sTypeError}${this.sAggregationType}`,
					"then apply change throws an error");
				assert.equal(this.oHBox.getItems().length, 1, "after the change there is still only 1 item in the hbox");
				return BaseAddXml.revertChange(oChange, this.oHBox, this.oPropertyBag);
			}.bind(this))
			.then(function() {
				assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			}.bind(this));
		});
	});

	QUnit.module("Given a BaseAddXml Change Handler with XMLTreeModifier", {
		async beforeEach() {
			this.sHBoxId = "hbox";

			this.oChangeJson = {
				moduleName: sFragmentPath,
				selector: {
					id: this.sHBoxId,
					type: "sap.m.HBox"
				},
				reference: sReference,
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				content: {
					fragmentPath: "fragments/Fragment.fragment.xml",
					targetAggregation: "items",
					index: 1
				}
			};
			this.mChangeInfo = {
				aggregationName: this.oChangeSpecificContent.content.targetAggregation,
				index: this.oChangeSpecificContent.content.index
			};

			this.oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			BaseAddXml.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChange.getContent());

			// XMLTreeModifier specific beforeEach
			const oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync",
				metadata: {
					manifest: "json"
				}
			});
			this.oComponent = oComponent;
			this.oXmlString =
				'<mvc:View id="testComponentAsync---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					`<HBox id="${this.sHBoxId}">` +
						"<tooltip>" +	// 0..1 aggregation
							// inline namespace as sap.ui.core is use case for not existing namespace
							'<TooltipBase xmlns="sap.ui.core"></TooltipBase>' +
						"</tooltip>" +
						"<items>" +
							'<Button id="button123"></Button>' + // content in default aggregation
						"</items>" +
					"</HBox>" +
				"</mvc:View>";
			this.oXmlView = XMLHelper.parse(this.oXmlString, "application/xml").documentElement;
			[this.oHBox] = this.oXmlView.childNodes;
			this.sAggregationType = "sap.ui.core.Control";

			this.oPropertyBag = {
				modifier: XmlTreeModifier,
				view: this.oXmlView,
				appComponent: this.oComponent
			};
		},
		afterEach() {
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying the change on a xml control tree", async function(assert) {
			const oInsertAggregationSpy = sandbox.spy(XmlTreeModifier, "insertAggregation");
			const oHBoxItems = this.oHBox.childNodes[1];
			const mRevertData = {
				id: "projectId.button",
				aggregationName: "items"
			};
			await BaseAddXml.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			assert.notOk(oInsertAggregationSpy.args[0][5], "insertAggregation is called with falsy bSkipAdjustIndex");
			assert.equal(oHBoxItems.childNodes.length, 2, "after the BaseAddXml there are two children of the HBox");
			assert.deepEqual(this.oChange.getRevertData(), [mRevertData], "then the revert data is build properly");
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			sandbox.stub(Log, "error");
			this.mChangeInfo.aggregationName = "invalidAggregation";

			return BaseAddXml.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message,
					sWrongAggregationError,
					"then apply change throws an error");
			});
		});

		QUnit.test("When applying the change on a xml control tree with an invalid type", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentInvalidTypePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message,
					`${sTypeError}${this.sAggregationType}`,
					"then apply change throws an error");
			}.bind(this));
		});

		QUnit.test("When reverting the change on an xml control tree", async function(assert) {
			const oHBoxItems = this.oHBox.childNodes[1];

			await BaseAddXml.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			await BaseAddXml.revertChange(this.oChange, this.oHBox, this.oPropertyBag);
			assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When applying the change on a xml control tree with multiple root elements", async function(assert) {
			this.oChangeJson.moduleName = sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			await BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			const oHBoxItems = this.oHBox.childNodes[1];
			assert.equal(oHBoxItems.childNodes.length, 4, "after the change there are 4 items in the hbox");
			assert.equal(
				oHBoxItems.childNodes[1].getAttribute("id"),
				"projectId.button1",
				"then the first button in the fragment has the correct index and ID"
			);
			assert.equal(
				oHBoxItems.childNodes[2].getAttribute("id"),
				"projectId.button2",
				"then the second button in the fragment has the correct index and ID"
			);
			assert.equal(
				oHBoxItems.childNodes[3].getAttribute("id"),
				"projectId.button3",
				"then the third button in the fragment has the correct index and ID"
			);
		});

		QUnit.test("When applying the change on a xml control tree with multiple root elements and one invalid type inside", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentMultipleInvalidTypesPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message, `${sTypeError}${this.sAggregationType}`, "then apply change throws an error");
				const oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 1, "after the change there is still only 1 item in the hbox");
			}.bind(this));
		});

		QUnit.test("When reverting the change on an xml control tree with multiple root elements", async function(assert) {
			this.oChangeJson.moduleName = sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			await BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			await BaseAddXml.revertChange(oChange, this.oHBox, this.oPropertyBag);
			const oHBoxItems = this.oHBox.childNodes[1];
			assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting a failed change on an xml control tree with multiple root elements", function(assert) {
			sandbox.stub(Log, "error");
			this.oChangeJson.moduleName = sFragmentMultipleInvalidTypesPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				assert.equal(oError.message, `${sTypeError}${this.sAggregationType}`, "then apply change throws an error");
				return BaseAddXml.revertChange(this.oChange, this.oHBox, this.oPropertyBag);
			}.bind(this))
			.then(function() {
				const oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			}.bind(this));
		});

		QUnit.test("When applying the change with a not found module", function(assert) {
			this.oChangeJson.moduleName = sNonExistingPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return BaseAddXml.applyChange(oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo)
			.catch(function(oError) {
				const sErrorMessage =
					"resource sap/ui/fl/qunit/changeHandler/BaseAddXml/changes/fragments/NonExisting could not be loaded from";
				assert.ok(oError.message.indexOf(sErrorMessage) === 0, "then apply change throws an error");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
