/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/SmartBusinessWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	_omit,
	Log,
	FlexObjectState,
	InitialUtils,
	ManifestUtils,
	Settings,
	AppVariantFactory,
	LrepConnector,
	WriteUtils,
	FlexObjectManager,
	SmartBusinessWriteAPI,
	Layer,
	Utils,
	sinon
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	const sandbox = sinon.createSandbox();
	const sReference = "reference.app";

	function simulateSystemConfig(bIsCloudSystem) {
		sandbox.stub(Settings, "getInstance").resolves(
			new Settings({
				isKeyUser: true,
				isAtoEnabled: bIsCloudSystem,
				isProductiveSystem: false
			})
		);
	}

	QUnit.module("Given SmartBusinessWriteAPI", {
		beforeEach() {
			const oAppComponent = {
				getId: () => "componentId",
				getManifestObject: () => ({}),
				getComponentData: () => ({})
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(Utils, "getAppComponentForSelector").returns(oAppComponent);
			sandbox.stub(Utils, "getComponentForControl").returns(oAppComponent);

			this.oDescrChangeSpecificData1 = {
				changeType: "appdescr_ovp_addNewCard",
				content: {
					card: {
						"customer.acard": {
							model: "customer.boring_model",
							template: "sap.ovp.cards.list",
							settings: {
								category: "{{reference.app_sap.app.ovp.cards.customer.acard.category}}",
								title: "{{reference.app_sap.app.ovp.cards.customer.acard.title}}",
								description: "extended",
								entitySet: "Zme_Overdue",
								sortBy: "OverdueTime",
								sortOrder: "desc",
								listType: "extended"
							}
						}
					}
				},
				texts: {
					"reference.app_sap.app.ovp.cards.customer.acard.category": {
						type: "XTIT",
						maxLength: 20,
						comment: "example",
						value: {
							"": "Category example default text",
							en: "Category example text in en",
							de: "Kategorie Beispieltext in de",
							// eslint-disable-next-line camelcase
							en_US: "Category example text in en_US"
						}
					},
					"reference.app_sap.app.ovp.cards.customer.acard.title": {
						type: "XTIT",
						maxLength: 20,
						comment: "example",
						value: {
							"": "Title example default text",
							en: "Title example text in en",
							de: "Titel Beispieltext in de",
							// eslint-disable-next-line camelcase
							en_US: "Title example text in en_US"
						}
					}
				}
			};
			this.oDescrChangeSpecificData2 = {
				changeType: "appdescr_app_setTitle",
				content: {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Title example default text",
						en: "Title example text in en",
						de: "Titel Beispieltext in de",
						// eslint-disable-next-line camelcase
						en_US: "Title example text in en_US"
					}
				},
				fileName: "id_1584608199136_1961_appdescr_app_setTitle",
				fileType: "change",
				moduleName: "",
				reference: sReference,
				namespace: "apps/reference.app/changes/",
				projectId: sReference,
				creation: "",
				originalLanguage: "EN"
			};
			this.oDescrChangeSpecificData3 = {
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "contactCreate",
					entityPropertyChange: {
						propertyPath: "semanticObject",
						operation: "UPSERT",
						propertyValue: "changeMerger"
					}
				},
				fileName: "id_1584608199136_1961_appdescr_app_changeInbound",
				fileType: "change",
				moduleName: "",
				reference: sReference,
				namespace: "apps/reference.app/changes/",
				projectId: sReference,
				creation: "",
				originalLanguage: "EN"
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("(S4/Hana onPremise system) when create is called to save an app variant in CUSTOMER layer, with a descriptor change already added into persistence", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			simulateSystemConfig(false);

			const oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: sReference
			})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({ change: oDescriptorInlineChange, appId: sReference });
			})
			.then(function() {
				return SmartBusinessWriteAPI.createDescriptorInlineChanges({
					changeSpecificData: this.oDescrChangeSpecificData2,
					appId: sReference
				});
			}.bind(this))
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({ change: oDescriptorInlineChange, appId: sReference });
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					2,
					"then 2 descriptor changes have been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: sReference
					},
					id: "customer.reference.app.id",
					"package": "TEST_PACKAGE",
					transport: "U1YK123456",
					layer: Layer.CUSTOMER
				});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then a descriptor change has been removed from the state"
				);
				// Get the app variant to be saved to backend
				const oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "TEST_PACKAGE", "then the app variant will be saved with a provided package");
				assert.strictEqual(oAppVariant.reference, sReference, "then the reference app id is correct");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
				assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then it is a correct changetype");
				assert.strictEqual(oAppVariant.content[1].changeType, "appdescr_app_setTitle", "then it is a correct changetype");
				assert.deepEqual(oAppVariant.content[1].content, {}, "then content is empty for setTitle change");
				Object.keys(oAppVariant.content[1]).forEach(function(sKey) {
					if (
						sKey === "changeType"
							|| sKey === "content"
							|| sKey === "texts"
					) {
						assert.ok("Correct properties being passed");
					} else {
						assert.notOk("Test should not succeed!");
					}
				});
				const sTextKey = `${oAppVariant.id}_sap.app.title`;
				assert.deepEqual(
					oAppVariant.content[1].texts[sTextKey],
					this.oDescrChangeSpecificData2.content,
					"then texts are correct for setTitle change"
				);
				assert.ok(
					oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?changelist=U1YK123456&sap-language=EN", "POST"),
					"then backend call is triggered with correct parameters"
				);
			}.bind(this));
		});

		QUnit.test("(S4/Hana Cloud system) when create is called to save an app variant in CUSTOMER with descriptor change already added into own persistence", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			simulateSystemConfig(true);

			const oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: sReference
			})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({ change: oDescriptorInlineChange, appId: sReference });
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: sReference
					},
					id: "customer.reference.app.id",
					layer: Layer.CUSTOMER
				});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				// Get the app variant to be saved to backend
				const oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
				assert.strictEqual(oAppVariant.reference, sReference, "then the reference app id is correct");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
				assert.strictEqual(
					oAppVariant.content[0].changeType,
					"appdescr_ovp_addNewCard",
					"then the inline change is saved into manifest"
				);
				assert.ok(
					oNewConnectorCall.calledWith(
						"/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION&skipIam=true&sap-language=EN", "POST"
					),
					"then backend call is triggered with correct parameters"
				);
			});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in VENDOR layer in a valid package failed", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			simulateSystemConfig(false);

			const oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").rejects({ message: "App variant failed to save" });

			sandbox.stub(Log, "error")
			.callThrough()
			.withArgs("the app variant could not be created.", "App variant failed to save").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: sReference
			})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({ change: oDescriptorInlineChange, appId: sReference });
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: sReference
					},
					id: "customer.reference.app.id",
					"package": "TEST_PACKAGE",
					transport: "U1YK123456",
					layer: Layer.VENDOR
				});
			})
			.catch(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				// Get the app variant to be saved to backend
				const oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "TEST_PACKAGE", "then the app variant will be saved with a provided package");
				assert.strictEqual(oAppVariant.reference, sReference, "then the reference app id is correct");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
				assert.strictEqual(
					oAppVariant.content[0].changeType,
					"appdescr_ovp_addNewCard",
					"then the inline change is saved into manifest"
				);
				assert.ok(
					oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?changelist=U1YK123456&sap-language=EN", "POST"),
					"then backend call is triggered with correct parameters"
				);
			});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in VENDOR layer in an empty package failed", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			simulateSystemConfig(false);

			const oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");

			sandbox.stub(Log, "error")
			.callThrough()
			.withArgs("the app variant could not be created.", "Package must be provided or is valid").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: sReference
			})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({ change: oDescriptorInlineChange, appId: sReference });
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: sReference
					},
					id: "customer.reference.app.id",
					"package": "",
					transport: "U1YK123456",
					layer: Layer.VENDOR
				});
			})
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				assert.ok(oNewConnectorCall.notCalled, "then backend call is never triggered");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence, no transport passed and submitting app variant to backend in VENDOR layer as a local object", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			simulateSystemConfig(false);

			const oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			sandbox.stub(Log, "error")
			.callThrough()
			.withArgs("the app variant could not be created.", "Package must be provided or is valid").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: sReference
			})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({ change: oDescriptorInlineChange, appId: sReference });
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: sReference
					},
					id: "customer.reference.app.id",
					"package": "$TMP",
					layer: Layer.VENDOR
				});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				// Get the app variant to be saved to backend
				const oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "$TMP", "then the app variant will be saved with an empty package");
				assert.strictEqual(oAppVariant.reference, sReference, "then the reference app id is correct");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
				assert.strictEqual(
					oAppVariant.content[0].changeType,
					"appdescr_ovp_addNewCard",
					"then the inline change is saved into manifest"
				);
				assert.ok(
					oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?sap-language=EN", "POST"),
					"then backend call is triggered with correct parameters"
				);
			});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in CUSTOMER_BASE layer in an empty package failed", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			simulateSystemConfig(false);

			const oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");

			sandbox.stub(Log, "error")
			.callThrough()
			.withArgs("the app variant could not be created.", "Package must be provided or is valid").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: sReference
			})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({ change: oDescriptorInlineChange, appId: sReference });
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: sReference
					},
					id: "customer.reference.app.id",
					"package": "",
					transport: "U1YK123456",
					layer: Layer.CUSTOMER_BASE
				});
			})
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				assert.ok(oNewConnectorCall.notCalled, "then backend call is never triggered");
			});
		});

		QUnit.test("(S4/Hana Cloud system) when update is called to update a published app variant in CUSTOMER layer", function(assert) {
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			simulateSystemConfig(true);
			const mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			const mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: sReference,
					fileName: "fileName1",
					namespace: "namespace1",
					layer: Layer.CUSTOMER,
					fileType: "fileType1",
					packageName: "ATO_PACKAGE",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(
					fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"),
					"then the parameters are correct"
				);
				const oRequestPayload = JSON.parse(fnNewConnectorCall.getCall(1).args[2].payload);
				assert.equal(oRequestPayload.content.length, 1, "then the app variant will be updated with 1 inline change");
				assert.ok(
					fnNewConnectorCall.calledWith(
						"/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=ATO_NOTIFICATION&skipIam=true&sap-language=EN",
						"PUT"
					),
					"then the parameters are correct"
				);
			});
		});

		QUnit.test("(S4/Hana Cloud system) when update is called to update a published app variant (having a new inline change) in CUSTOMER layer ", function(assert) {
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			simulateSystemConfig(true);
			const mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			const mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: sReference,
					fileName: "fileName1",
					namespace: "namespace1",
					layer: Layer.CUSTOMER,
					fileType: "fileType1",
					packageName: "ATO_PACKAGE",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			// Creates a first descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({
				changeSpecificData: this.oDescrChangeSpecificData2,
				appId: "customer.reference.app.id"
			})
			.then(function(oDescriptorInlineChange) {
				// Adds a first descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({ change: oDescriptorInlineChange, appId: "customer.reference.app.id" });
			}).then(function() {
				return SmartBusinessWriteAPI.update(mPropertyBag);
			})
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(
					fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"),
					"then the parameters are correct"
				);
				const oRequestPayload = JSON.parse(fnNewConnectorCall.getCall(1).args[2].payload);
				assert.strictEqual(oRequestPayload.content[1].changeType, "appdescr_app_setTitle", "then it is a correct changetype");
				assert.deepEqual(oRequestPayload.content[1].content, {}, "then content is empty for setTitle change");
				const sTextKey = `${oRequestPayload.id}_sap.app.title`;
				assert.deepEqual(
					oRequestPayload.content[1].texts[sTextKey],
					this.oDescrChangeSpecificData2.content,
					"then texts are correct for setTitle change"
				);
				Object.keys(oRequestPayload.content[1]).forEach(function(sKey) {
					if (
						sKey === "changeType"
							|| sKey === "content"
							|| sKey === "texts"
					) {
						assert.ok("Correct properties being passed");
					} else {
						assert.notOk("Test should not succeed!");
					}
				});
				assert.equal(oRequestPayload.content.length, 2, "then the app variant will be updated with 2 inline changes");
				assert.ok(
					fnNewConnectorCall.calledWith(
						"/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=ATO_NOTIFICATION&skipIam=true&sap-language=EN",
						"PUT"
					),
					"then the parameters are correct"
				);
			}.bind(this));
		});

		QUnit.test("(S4/Hana onPremise system) when update is called to update a local app variant ($TMP) in CUSTOMER layer", function(assert) {
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			simulateSystemConfig(false);
			const mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			const mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: sReference,
					fileName: "fileName1",
					namespace: "namespace1",
					layer: Layer.CUSTOMER,
					fileType: "fileType1",
					packageName: "$TMP",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(
					fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"),
					"then the parameters are correct"
				);
				assert.ok(
					fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?sap-language=EN", "PUT"),
					"then the parameters are correct"
				);
			});
		});

		QUnit.test("(S4/Hana onPremise system) when update is called to update an app variant with empty package in CUSTOMER layer", function(assert) {
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			simulateSystemConfig(false);
			const mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			const mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: sReference,
					fileName: "fileName1",
					namespace: "namespace1",
					layer: Layer.CUSTOMER,
					fileType: "fileType1",
					packageName: "",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(
					fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"),
					"then the parameters are correct"
				);
				assert.ok(
					fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?sap-language=EN", "PUT"),
					"then the parameters are correct"
				);
			})
			.catch(function() {
				assert.ok(false, "Should not fail");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when update is called to update a published app variant in CUSTOMER layer", function(assert) {
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			simulateSystemConfig(false);
			const mPropertyBag = {
				transport: "TRANSPORT123",
				appId: "customer.reference.app.id"
			};

			const mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: sReference,
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "layer1",
					fileType: "fileType1",
					packageName: "$TMP",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(
					fnNewConnectorCall.calledWith(
						"/sap/bc/lrep/appdescr_variants/customer.reference.app.id",
						"GET"
					),
					"then the parameters are correct"
				);
				assert.ok(
					fnNewConnectorCall.calledWith(
						"/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=TRANSPORT123&sap-language=EN",
						"PUT"
					),
					"then the parameters are correct"
				);
			});
		});

		QUnit.test("(S4/Hana Cloud system) when remove is called to delete a published app variant in CUSTOMER layer", function(assert) {
			simulateSystemConfig(true);
			const mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports
			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves(); // Update call to backend

			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(
					oOldConnectorCall.notCalled,
					"then getTransports from backend is never called"
				);
				assert.ok(
					fnNewConnectorCall.calledWith(
						"/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=ATO_NOTIFICATION",
						"DELETE"
					),
					"then the parameters are correct"
				);
			});
		});

		QUnit.test("(S4/Hana onPremise system) when remove is called to delete a local app variant ($TMP) in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			const mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports
			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves(); // Update call to backend

			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(
					oOldConnectorCall.notCalled,
					"then getTransports from backend is never called"
				);
				assert.ok(
					fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "DELETE"),
					"then the parameters are correct"
				);
			});
		});

		QUnit.test("(S4/Hana onPremise system) when remove is called to delete an app variant with empty package in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			const mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports
			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves(); // Update call to backend

			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(
					oOldConnectorCall.notCalled,
					"then getTransports from backend is never called"
				);
				assert.ok(
					fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "DELETE"),
					"then the parameters are correct"
				);
			})
			.catch(function() {
				assert.ok(false, "Should not fail");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when remove is called to delete a published app variant in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			const mPropertyBag = {
				transport: "TRANSPORT123",
				appId: "customer.reference.app.id"
			};

			const oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports
			const fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves(); // Update call to backend

			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(
					fnNewConnectorCall.calledWith(
						"/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=TRANSPORT123",
						"DELETE"
					),
					"then the parameters are correct"
				);
			});
		});

		QUnit.test("when createDescriptorChangeString is called for changeType appdescr_app_setTitle", function(assert) {
			const sExpected = '{"changeType":"appdescr_app_setTitle","content":{},"texts":{"reference.app_sap.app.title":{' +
					'"type":"XTIT","maxLength":20,"comment":"example","value":{"":"Title example default text",' +
					'"en":"Title example text in en","de":"Titel Beispieltext in de","en_US":"Title example text in en_US"}}}}';

			return SmartBusinessWriteAPI.createDescriptorChangeString({
				changeSpecificData: this.oDescrChangeSpecificData2,
				appId: sReference
			})
			.then(function(sChange) {
				assert.equal(sChange, sExpected, "then the DescriptorChange will be returned as string");
			});
		});

		QUnit.test("when createDescriptorChangeString is called for changeType appdescr_ovp_addNewCard", function(assert) {
			const sExpected = '{"changeType":"appdescr_ovp_addNewCard","content":{"card":{"customer.acard":{"model":"customer.boring_model"' +
					',"template":"sap.ovp.cards.list",' +
					'"settings":{"category":"{{reference.app_sap.app.ovp.cards.customer.acard.category}}",' +
					'"title":"{{reference.app_sap.app.ovp.cards.customer.acard.title}}","description":"extended",' +
					'"entitySet":"Zme_Overdue","sortBy":"OverdueTime","sortOrder":"desc","listType":"extended"}}}},"texts":{' +
					'"reference.app_sap.app.ovp.cards.customer.acard.category":{"type":"XTIT","maxLength":20,"comment":"example",' +
					'"value":{"":"Category example default text","en":"Category example text in en","de":"Kategorie Beispieltext in de",' +
					'"en_US":"Category example text in en_US"}},"reference.app_sap.app.ovp.cards.customer.acard.title":{' +
					'"type":"XTIT","maxLength":20,"comment":"example","value":{"":"Title example default text",' +
					'"en":"Title example text in en","de":"Titel Beispieltext in de","en_US":"Title example text in en_US"}}}}';

			return SmartBusinessWriteAPI.createDescriptorChangeString({
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: sReference
			})
			.then(function(sChange) {
				assert.equal(sChange, sExpected, "then the DescriptorChange will be returned as string");
			});
		});

		QUnit.test("when createDescriptorChangeString is called for changeType appdescr_app_changeInbound with no texts property", function(assert) {
			const sExpected = '{"changeType":"appdescr_app_changeInbound","content":{"inboundId":"contactCreate",' +
					'"entityPropertyChange":{"propertyPath":"semanticObject","operation":"UPSERT","propertyValue":"changeMerger"}}}';

			return SmartBusinessWriteAPI.createDescriptorChangeString({
				changeSpecificData: this.oDescrChangeSpecificData3,
				appId: sReference
			})
			.then(function(sChange) {
				assert.equal(sChange, sExpected, "then the DescriptorChange will be returned as string without property texts");
			});
		});

		QUnit.test("negative tests for create function", function(assert) {
			const mPropertyBag = {
				selector: {
					appId: sReference
				},
				id: "customer.reference.app.id",
				layer: Layer.CUSTOMER
			};
			return SmartBusinessWriteAPI.create(_omit(mPropertyBag, ["id"]))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("App variant ID must be provided") > -1, "when 'id' is missing then an error is thrown");
			})
			.then(SmartBusinessWriteAPI.create.bind(SmartBusinessWriteAPI, _omit(mPropertyBag, ["layer"])))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("Layer must be provided") > -1, "when 'layer' is missing then an error is thrown");
			})
			.then(SmartBusinessWriteAPI.create.bind(SmartBusinessWriteAPI, _omit(mPropertyBag, ["selector"])))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("selector.appId must be provided") > -1,
					"when 'selector' is missing then an error is thrown");
			})
			.then(SmartBusinessWriteAPI.create.bind(SmartBusinessWriteAPI, _omit(mPropertyBag, ["selector.appId"])))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("selector.appId must be provided") > -1,
					"when 'selector.appId' is missing then an error is thrown");
			});
		});

		QUnit.test("negative tests for update function", function(assert) {
			const mPropertyBag = {};
			return SmartBusinessWriteAPI.update(mPropertyBag)
			.catch((oError) => {
				assert.ok(oError.message.indexOf("App Variant ID must be provided") > -1, "when 'appId' is missing then an error is thrown");
			});
		});

		QUnit.test("negative tests for remove function", function(assert) {
			const mPropertyBag = {};
			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.catch((oError) => {
				assert.ok(oError.message.indexOf("App Variant ID must be provided") > -1, "when 'appId' is missing then an error is thrown");
			});
		});

		QUnit.test("negative tests for createDescriptorChangeString function", function(assert) {
			const mPropertyBag = {
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: sReference
			};
			return SmartBusinessWriteAPI.createDescriptorChangeString(_omit(mPropertyBag, ["changeSpecificData"]))
			.catch((oError) => {
				assert.ok(
					oError.message.indexOf("changeSpecificData must be provided") > -1,
					"when 'changeSpecificData' is missing then an error is thrown"
				);
			})
			.then(SmartBusinessWriteAPI.createDescriptorChangeString.bind(SmartBusinessWriteAPI, _omit(mPropertyBag, ["appId"])))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("appId must be provided") > -1, "when 'appId' is missing then an error is thrown");
			});
		});

		QUnit.test("negative test for add function", function(assert) {
			const mPropertyBag = {
				appId: sReference,
				change: { id: "fakeChange" }
			};
			return SmartBusinessWriteAPI.add(_omit(mPropertyBag, ["appId"]))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("appId must be provided") > -1, "when 'appId' is missing then an error is thrown");
			})
			.then(SmartBusinessWriteAPI.add.bind(SmartBusinessWriteAPI, _omit(mPropertyBag, ["change"])))
			.catch((oError) => {
				assert.ok(
					oError.message.indexOf("Change instance must be provided") > -1,
					"when 'change' instance is missing then an error is thrown"
				);
			});
		});

		QUnit.test("getDesignTimeVariant function call", function(assert) {
			const mPropertyBag = {
				appId: sReference,
				id: "customer.reference.app.id"
			};
			const oAppvariantFactoryLoadStub = sandbox.stub(AppVariantFactory, "load").resolves({});
			return SmartBusinessWriteAPI.getDesignTimeVariant(_omit(mPropertyBag, ["id"]))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("App Variant ID must be provided") > -1, "when 'id' is missing then an error is thrown");
			})
			.then(SmartBusinessWriteAPI.getDesignTimeVariant.bind(SmartBusinessWriteAPI, mPropertyBag))
			.then(() => {
				assert.strictEqual(oAppvariantFactoryLoadStub.callCount, 1, "then loading from AppVariantFactory is called once");
			});
		});

		QUnit.test("getRunTimeVariant function call", function(assert) {
			const mPropertyBag = {
				appId: sReference,
				id: "customer.reference.app.id"
			};
			const oLrepConnectorGetManifestStub = sandbox.stub(LrepConnector.appVariant, "getManifest").resolves({});
			return SmartBusinessWriteAPI.getRunTimeVariant(_omit(mPropertyBag, ["appId"]))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("Reference App ID must be provided") > -1, "when 'appId' is missing then an error is thrown");
			})
			.then(SmartBusinessWriteAPI.getRunTimeVariant.bind(SmartBusinessWriteAPI, _omit(mPropertyBag, ["id"])))
			.catch((oError) => {
				assert.ok(oError.message.indexOf("App Variant ID must be provided") > -1, "when 'id' is missing then an error is thrown");
			})
			.then(SmartBusinessWriteAPI.getRunTimeVariant.bind(SmartBusinessWriteAPI, mPropertyBag))
			.then(() => {
				assert.strictEqual(
					oLrepConnectorGetManifestStub.callCount,
					1,
					"then loading from AppVariantFactory is called once"
				);
				assert.strictEqual(
					oLrepConnectorGetManifestStub.firstCall.args[0].appVarUrl?.length > 0,
					true,
					"then an app variant url is passed"
				);
			});
		});
	});
});
