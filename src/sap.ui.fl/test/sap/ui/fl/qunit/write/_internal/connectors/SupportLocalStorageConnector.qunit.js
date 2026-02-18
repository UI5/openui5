/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/connectors/SupportLocalStorageConnector"
], function(
	SupportLocalStorageConnector
) {
	"use strict";

	const oImportedFlexData = {
		extractorVersion: "2.0",
		extractionTimeStamp: "2026-01-27T09:11:16.709Z",
		ui5Version: "1.145.0-SNAPSHOT",
		appVersion: "1.145.0-SNAPSHOT",
		appACH: "CA-UI5-FL-RTA",
		flexSettings: [
			{
				key: "client"
			},
			{
				key: "hasPersoConnector",
				value: false
			},
			{
				key: "isAnnotationChangeEnabled",
				value: true
			},
			{
				key: "isAppVariantSaveAsEnabled",
				value: false
			},
			{
				key: "isAtoEnabled",
				value: false
			},
			{
				key: "isCondensingEnabled",
				value: true
			},
			{
				key: "isContextBasedAdaptationEnabled",
				value: false
			},
			{
				key: "isContextSharingEnabled",
				value: false
			},
			{
				key: "isKeyUser",
				value: true
			},
			{
				key: "isKeyUserTranslationEnabled",
				value: false
			},
			{
				key: "isLocalResetEnabled",
				value: false
			},
			{
				key: "isProductiveSystem",
				value: false
			},
			{
				key: "isPublicFlVariantEnabled",
				value: true
			},
			{
				key: "isPublicLayerAvailable",
				value: true
			},
			{
				key: "isPublishAvailable",
				value: false
			},
			{
				key: "isSeenFeaturesAvailable",
				value: false
			},
			{
				key: "isVariantAdaptationEnabled",
				value: true
			},
			{
				key: "isVariantAuthorNameAvailable",
				value: false
			},
			{
				key: "isVariantPersonalizationEnabled",
				value: true
			},
			{
				key: "isVariantSharingEnabled",
				value: true
			},
			{
				key: "isVersioningEnabled",
				value: true
			},
			{
				key: "system"
			},
			{
				key: "systemType"
			},
			{
				key: "user",
				value: "DEFAULT_USER"
			},
			{
				key: "userId",
				value: "DEFAULT_USER"
			}
		],
		flexObjectInfos: {
			allFlexObjectFileContents: [
				{
					changeType: "addSimpleFormGroup",
					reference: "sap.ui.demoapps.rta.freestyle",
					namespace: "apps/sap.ui.demoapps.rta.freestyle/changes/",
					creation: "2026-01-27T09:11:03.701Z",
					projectId: "sap.ui.demoapps.rta.freestyle",
					packageName: "$TMP",
					support: {
						generator: "sap.ui.rta.command",
						user: "DEFAULT_USER",
						sapui5Version: "1.145.0-SNAPSHOT",
						command: "createContainer"
					},
					originalLanguage: "EN",
					layer: "CUSTOMER",
					fileType: "change",
					fileName: "id_1769504978500_145_addSimpleFormGroup",
					content: {
						group: {
							selector: {
								id: "ProductDetail--GeneralForm--id-1769504971881-139",
								idIsLocal: true
							},
							relativeIndex: 1
						}
					},
					texts: {
						groupLabel: {
							value: "New: Group-Renamed",
							type: "XFLD"
						}
					},
					selector: {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					},
					dependentSelector: {},
					jsOnly: false
				},
				{
					changeType: "addSimpleFormField",
					reference: "sap.ui.demoapps.rta.freestyle",
					namespace: "apps/sap.ui.demoapps.rta.freestyle/changes/",
					creation: "2026-01-27T09:11:03.702Z",
					projectId: "sap.ui.demoapps.rta.freestyle",
					packageName: "$TMP",
					support: {
						generator: "sap.ui.rta.command",
						user: "DEFAULT_USER",
						sapui5Version: "1.145.0-SNAPSHOT",
						compositeCommand: "id_1769504983061_151_composite",
						command: "addDelegateProperty"
					},
					oDataInformation: {
						oDataServiceUri: "/sap/opu/odata/sap/SEPMRA_PROD_MAN/",
						propertyName: "ProductBaseUnit",
						entityType: "SEPMRA_C_PD_ProductType"
					},
					originalLanguage: "EN",
					layer: "CUSTOMER",
					fileType: "change",
					fileName: "id_1769504983060_150_addSimpleFormField",
					content: {
						parentId: {
							id: "ProductDetail--GeneralForm--generalForm--application-masterDetail-display-component---ProductDetail--GeneralForm--id-1769504971881-139--FC",
							idIsLocal: true
						},
						bindingPath: "ProductBaseUnit",
						newFieldSelector: {
							id: "ProductDetail--GeneralForm--generalForm_SEPMRA_C_PD_ProductType_ProductBaseUnit",
							idIsLocal: true
						},
						newFieldIndex: 0
					},
					texts: {},
					selector: {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					},
					dependentSelector: {
						targetContainerHeader: {
							id: "ProductDetail--GeneralForm--id-1769504971881-139",
							idIsLocal: true
						}
					},
					jsOnly: false
				},
				{
					changeType: "renameLabel",
					reference: "sap.ui.demoapps.rta.freestyle",
					namespace: "apps/sap.ui.demoapps.rta.freestyle/changes/",
					creation: "2026-01-27T09:11:03.706Z",
					projectId: "sap.ui.demoapps.rta.freestyle",
					packageName: "$TMP",
					support: {
						generator: "sap.ui.rta.command",
						user: "DEFAULT_USER",
						sapui5Version: "1.145.0-SNAPSHOT",
						command: "rename"
					},
					originalLanguage: "EN",
					layer: "CUSTOMER",
					fileType: "change",
					fileName: "id_1769505012319_166_renameLabel",
					content: {
						elementSelector: {
							id: "ProductDetail--GeneralForm--productLabel",
							idIsLocal: true
						}
					},
					texts: {
						formText: {
							value: "Product-renamed",
							type: "XFLD"
						}
					},
					selector: {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					},
					dependentSelector: {
						elementSelector: {
							id: "ProductDetail--GeneralForm--productLabel",
							idIsLocal: true
						}
					},
					jsOnly: false
				}
			]
		}
	};

	const oFlexDataResponse = {
		appDescriptorChanges: [],
		annotationChanges: [],
		changes: [
			{
				changeType: "addSimpleFormGroup",
				reference: "sap.ui.demoapps.rta.freestyle",
				namespace: "apps/sap.ui.demoapps.rta.freestyle/changes/",
				creation: "2026-01-27T09:11:03.701Z",
				projectId: "sap.ui.demoapps.rta.freestyle",
				packageName: "$TMP",
				support: {
					generator: "sap.ui.rta.command",
					user: "DEFAULT_USER",
					sapui5Version: "1.145.0-SNAPSHOT",
					command: "createContainer"
				},
				originalLanguage: "EN",
				layer: "CUSTOMER",
				fileType: "change",
				fileName: "id_1769504978500_145_addSimpleFormGroup",
				content: {
					group: {
						selector: {
							id: "ProductDetail--GeneralForm--id-1769504971881-139",
							idIsLocal: true
						},
						relativeIndex: 1
					}
				},
				texts: {
					groupLabel: {
						value: "New: Group-Renamed",
						type: "XFLD"
					}
				},
				selector: {
					id: "ProductDetail--GeneralForm--generalForm",
					idIsLocal: true
				},
				dependentSelector: {},
				jsOnly: false
			},
			{
				changeType: "addSimpleFormField",
				reference: "sap.ui.demoapps.rta.freestyle",
				namespace: "apps/sap.ui.demoapps.rta.freestyle/changes/",
				creation: "2026-01-27T09:11:03.702Z",
				projectId: "sap.ui.demoapps.rta.freestyle",
				packageName: "$TMP",
				support: {
					generator: "sap.ui.rta.command",
					user: "DEFAULT_USER",
					sapui5Version: "1.145.0-SNAPSHOT",
					compositeCommand: "id_1769504983061_151_composite",
					command: "addDelegateProperty"
				},
				oDataInformation: {
					oDataServiceUri: "/sap/opu/odata/sap/SEPMRA_PROD_MAN/",
					propertyName: "ProductBaseUnit",
					entityType: "SEPMRA_C_PD_ProductType"
				},
				originalLanguage: "EN",
				layer: "CUSTOMER",
				fileType: "change",
				fileName: "id_1769504983060_150_addSimpleFormField",
				content: {
					parentId: {
						id: "ProductDetail--GeneralForm--generalForm--application-masterDetail-display-component---ProductDetail--GeneralForm--id-1769504971881-139--FC",
						idIsLocal: true
					},
					bindingPath: "ProductBaseUnit",
					newFieldSelector: {
						id: "ProductDetail--GeneralForm--generalForm_SEPMRA_C_PD_ProductType_ProductBaseUnit",
						idIsLocal: true
					},
					newFieldIndex: 0
				},
				texts: {},
				selector: {
					id: "ProductDetail--GeneralForm--generalForm",
					idIsLocal: true
				},
				dependentSelector: {
					targetContainerHeader: {
						id: "ProductDetail--GeneralForm--id-1769504971881-139",
						idIsLocal: true
					}
				},
				jsOnly: false
			},
			{
				changeType: "renameLabel",
				reference: "sap.ui.demoapps.rta.freestyle",
				namespace: "apps/sap.ui.demoapps.rta.freestyle/changes/",
				creation: "2026-01-27T09:11:03.706Z",
				projectId: "sap.ui.demoapps.rta.freestyle",
				packageName: "$TMP",
				support: {
					generator: "sap.ui.rta.command",
					user: "DEFAULT_USER",
					sapui5Version: "1.145.0-SNAPSHOT",
					command: "rename"
				},
				originalLanguage: "EN",
				layer: "CUSTOMER",
				fileType: "change",
				fileName: "id_1769505012319_166_renameLabel",
				content: {
					elementSelector: {
						id: "ProductDetail--GeneralForm--productLabel",
						idIsLocal: true
					}
				},
				texts: {
					formText: {
						value: "Product-renamed",
						type: "XFLD"
					}
				},
				selector: {
					id: "ProductDetail--GeneralForm--generalForm",
					idIsLocal: true
				},
				dependentSelector: {
					elementSelector: {
						id: "ProductDetail--GeneralForm--productLabel",
						idIsLocal: true
					}
				},
				jsOnly: false
			}
		],
		comp: {
			variants: [],
			changes: [],
			defaultVariants: [],
			standardVariants: []
		},
		variants: [],
		variantChanges: [],
		variantDependentControlChanges: [],
		variantManagementChanges: [],
		ui2personalization: {}
	};

	const oFlexFeaturesResponse = {
		client: undefined,
		hasPersoConnector: false,
		isAnnotationChangeEnabled: true,
		isAppVariantSaveAsEnabled: false,
		isAtoEnabled: false,
		isCondensingEnabled: true,
		isContextBasedAdaptationEnabled: false,
		isContextSharingEnabled: false,
		isKeyUser: true,
		isKeyUserTranslationEnabled: false,
		isLocalResetEnabled: false,
		isProductiveSystem: false,
		isPublicFlVariantEnabled: true,
		isPublicLayerAvailable: true,
		isPublishAvailable: false,
		isSeenFeaturesAvailable: false,
		isVariantAdaptationEnabled: true,
		isVariantAuthorNameAvailable: false,
		isVariantPersonalizationEnabled: true,
		isVariantSharingEnabled: true,
		isVersioningEnabled: true,
		system: undefined,
		systemType: undefined,
		user: "DEFAULT_USER",
		userId: "DEFAULT_USER"
	};

	function saveDataToLocalStorage() {
		window.localStorage.setItem("UI5.Flexibility.Support.appliedData", JSON.stringify(oImportedFlexData));
	}

	function clearDataFromLocalStorage() {
		window.localStorage.removeItem("UI5.Flexibility.Support.appliedData");
	}

	QUnit.module("Given SupportLocalStorageConnector", {
		beforeEach() {
			saveDataToLocalStorage();
		},
		afterEach() {
			clearDataFromLocalStorage();
		}
	}, function() {
		QUnit.test("when loadFeatures is triggered", function(assert) {
			return SupportLocalStorageConnector.loadFeatures().then(function(oResponse) {
				assert.deepEqual(oFlexFeaturesResponse, oResponse, "loadFeatures response is correct");
			});
		});

		QUnit.test("when loadFlexData is triggered", function(assert) {
			return SupportLocalStorageConnector.loadFlexData().then(function(oResponse) {
				assert.deepEqual(oFlexDataResponse, oResponse, "then the correct response is received");
			});
		});

		QUnit.test("when condense is triggered", function(assert) {
			const oExpectedResponse = "Condensing not supported for SupportLocalStorageConnector. No action taken.";
			return SupportLocalStorageConnector.condense().then(function(oResponse) {
				assert.equal(oResponse, oExpectedResponse, "then the correct response is received");
			});
		});

		QUnit.test("when versions.load is triggered", function(assert) {
			const oExpectedResponse = [];
			return SupportLocalStorageConnector.versions.load().then(function(oResponse) {
				assert.deepEqual(oResponse, oExpectedResponse, "then the correct response is received");
			});
		});

		QUnit.test("when versions.activate is triggered", function(assert) {
			const oExpectedResponse = "Activating not supported for SupportLocalStorageConnector. No action taken.";
			return SupportLocalStorageConnector.versions.activate().then(function(oResponse) {
				assert.equal(oResponse, oExpectedResponse, "then the correct response is received");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});