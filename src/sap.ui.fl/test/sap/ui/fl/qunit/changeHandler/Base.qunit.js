/* global QUnit */

sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/thirdparty/sinon-4"
], function(
	LoaderExtensions,
	JsControlTreeModifier,
	FlexObjectFactory,
	Base,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("instantiateFragment on JSControlTreeModifier", {
		before() {
			// predefine some modules
			const mPreloadedModules = {};
			this.sFragmentMultiplePath = "sap/somePath/toSomewhereFragmentMultiple";
			this.sFragmentMultiple = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
				'<Button xmlns="sap.m" id="button1" text="Hello World"></Button>' +
				'<Button xmlns="sap.m" id="button2" text="Hello World"></Button>' +
				'<Button xmlns="sap.m" id="button3" text="Hello World"></Button>' +
				"</core:FragmentDefinition>";
			mPreloadedModules[this.sFragmentMultiplePath] = this.sFragmentMultiple;
			this.sFragmentInvalidPath = "sap/somePath/toSomewhereFragmentInvalid";
			mPreloadedModules[this.sFragmentInvalidPath] = "invalidFragment";
			this.sNonExistingPath = "sap/somePath/toSomewhereNonExisting";
			sap.ui.require.preload(mPreloadedModules);
		},
		beforeEach() {
			this.oChangeJson = {
				projectId: "projectId"
			};

			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				view: {
					getController() {
					},
					getId() {
					}
				}
			};
			this.aItems = [];
		},
		afterEach() {
			sandbox.restore();
			this.aItems.forEach((oItem) => oItem.destroy());
		}
	}, function() {
		QUnit.test("When applying the change on a js control tree without a fragment", function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.catch(function(vError) {
				assert.ok(vError instanceof Error, "then apply change throws an error");
			});
		});

		QUnit.test("When applying the change on a js control tree with an invalid fragment", function(assert) {
			this.oChangeJson.moduleName = this.sFragmentInvalidPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.catch(function(vError) {
				assert.ok(vError instanceof Error, "then apply change throws an error");
			});
		});

		QUnit.test("When applying the change with a not found module", function(assert) {
			this.oChangeJson.moduleName = this.sNonExistingPath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.catch(function(vError) {
				assert.ok(vError.message.indexOf("resource sap/somePath/toSomewhereNonExisting could not be loaded from") > -1,
					"then apply change throws an error");
			});
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements", async function(assert) {
			this.oChangeJson.moduleName = this.sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			this.aItems = await Base.instantiateFragment(oChange, this.mPropertyBag);

			assert.strictEqual(this.aItems.length, 3, "after the change there are 4 items in the hbox");
			assert.strictEqual(this.aItems[0].getId(), "projectId.button1", "then the first button has the correct index and ID");
			assert.strictEqual(this.aItems[1].getId(), "projectId.button2", "then the second button has the correct index and ID");
			assert.strictEqual(this.aItems[2].getId(), "projectId.button3", "then the third button has the correct index and ID");
		});

		QUnit.test("when calling instantiateFragment directly with a fragment", async function(assert) {
			this.oChangeJson.moduleName = this.sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			const oLoaderSpy = sandbox.spy(LoaderExtensions, "loadResource");
			this.aItems = await Base.instantiateFragment(oChange, { ...this.mPropertyBag, fragment: this.sFragmentMultiple });

			assert.strictEqual(this.aItems.length, 3, "after the change there are 4 items in the hbox");
			assert.strictEqual(this.aItems[0].getId(), "projectId.button1", "then the first button has the correct index and ID");
			assert.strictEqual(this.aItems[1].getId(), "projectId.button2", "then the second button has the correct index and ID");
			assert.strictEqual(this.aItems[2].getId(), "projectId.button3", "then the third button has the correct index and ID");
			assert.strictEqual(oLoaderSpy.callCount, 0, "then the loader was not called");
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements and extension point with fragmentId", async function(assert) {
			this.oChangeJson.moduleName = this.sFragmentMultiplePath;
			const oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			oChange.setExtensionPointInfo({ fragmentId: "EPFragmentId" });
			this.aItems = await Base.instantiateFragment(oChange, this.mPropertyBag);

			assert.strictEqual(this.aItems.length, 3, "after the change there are 4 items in the hbox");
			assert.strictEqual(
				this.aItems[0].getId(), "projectId.EPFragmentId.button1",
				"then the first button has the correct index and ID"
			);
			assert.strictEqual(
				this.aItems[1].getId(), "projectId.EPFragmentId.button2",
				"then the second button has the correct index and ID"
			);
			assert.strictEqual(
				this.aItems[2].getId(), "projectId.EPFragmentId.button3",
				"then the third button has the correct index and ID"
			);
		});
	});

	QUnit.module("instantiateFragment namespace check", {
		before() {
			// predefine some modules
			const mModules = {};
			this.sFragmentPath = "sap/somePath/toSomewhereFragment";
			mModules[this.sFragmentPath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"></core:FragmentDefinition>';
			sap.ui.require.preload(mModules);
		},
		beforeEach() {
			this.oInstantiateFragmentStub = sandbox.stub().resolves();
			this.mPropertyBag = {
				modifier: { instantiateFragment: this.oInstantiateFragmentStub },
				view: "<view></view>",
				viewId: "componentId--viewId"
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying the change on a xml control tree with viewId and without prefix", async function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentPath,
				projectId: undefined
			});
			this.mPropertyBag.viewId = undefined;
			await Base.instantiateFragment(oChange, this.mPropertyBag);
			assert.strictEqual(this.oInstantiateFragmentStub.firstCall.args[1], "", "then the namespace is prepared properly");
		});

		QUnit.test("When applying the change on a xml control tree with viewId and without projectId & fragmentId available as prefix", async function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentPath,
				projectId: undefined
			});
			await Base.instantiateFragment(oChange, this.mPropertyBag);
			assert.strictEqual(
				this.oInstantiateFragmentStub.firstCall.args[1], "componentId--viewId--",
				"then the namespace is prepared properly"
			);
		});

		QUnit.test("When applying the change on a xml control tree with viewId & fragmentId and without projectId available as prefix", async function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentPath,
				projectId: undefined
			});
			oChange.setExtensionPointInfo({ fragmentId: "fragmentId" });
			await Base.instantiateFragment(oChange, this.mPropertyBag);
			assert.strictEqual(
				this.oInstantiateFragmentStub.firstCall.args[1], "componentId--viewId--fragmentId",
				"then the namespace is prepared properly"
			);
		});

		QUnit.test("When applying the change on a xml control tree with viewId is available as prefix", async function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentPath,
				projectId: "projectId"
			});
			await Base.instantiateFragment(oChange, this.mPropertyBag);
			assert.strictEqual(
				this.oInstantiateFragmentStub.firstCall.args[1], "componentId--viewId--projectId",
				"then the namespace is prepared properly"
			);
		});

		QUnit.test("When applying the change on a xml control tree with viewId and fragmentId are available as prefixes", async function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentPath,
				projectId: "projectId"
			});
			oChange.setExtensionPointInfo({ fragmentId: "fragmentId" });
			await Base.instantiateFragment(oChange, this.mPropertyBag);
			assert.strictEqual(
				this.oInstantiateFragmentStub.firstCall.args[1], "componentId--viewId--projectId.fragmentId",
				"then the namespace is prepared properly"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
