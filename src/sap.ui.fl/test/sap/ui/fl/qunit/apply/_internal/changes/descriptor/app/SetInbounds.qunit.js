/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetInbounds",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/fl/Layer"
], function(
	SetInbounds,
	AppDescriptorChange,
	Layer
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = {
				"_version": "2.0.0",

				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon"
							}
						}
					}
				}
			};

			this.oChangeLayerCustomer = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_SetInboundss"
				},
				layer: Layer.CUSTOMER,
				content: {
					inbounds: {
						"customer.contactCreate": {
							semanticObject: "Contact",
							action: "create",
							icon: "sap-icon://add-contact",
							title: "Title",
							subTitle: "SubTitle"
						},
						  "customer.contactDisplay": {
							semanticObject: "Contact",
							action: "display",
							icon: "sap-icon://display-contact",
							title: "Title 2",
							subTitle: "SubTitle 2"
						}
					}
				}
			});
		}
	}, function() {
		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest from customer", function(assert) {
			const oNewManifest = SetInbounds.applyChange(this.oManifest, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 2, "expected inbounds size is correct");
			assert.notOk(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"], "Risk-configure still exits");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactDisplay"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbounds in an empty inbounds manifest", function(assert) {
			this.oManifestNoInbounds = {
				"_version": "2.0.0",

				"sap.app": {
					crossNavigation: {
						inbounds: {
						}
					}
				}
			};
			const oNewManifest = SetInbounds.applyChange(this.oManifestNoInbounds, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 2, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactDisplay"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbounds in a manifest which has path sap.app/crossNavigation but no inbounds", function(assert) {
			this.oManifestNoPathToInbounds2 = {
				"_version": "2.0.0",

				"sap.app": {
					crossNavigation: {}
				}
			};
			const oNewManifest = SetInbounds.applyChange(this.oManifestNoPathToInbounds2, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 2, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactDisplay"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbounds in a manifest which has path sap.app/ but no crossNavigation", function(assert) {
			this.oManifestNoPathToInbounds1 = {
				"_version": "2.0.0",
				"sap.app": {}
			};
			const oNewManifest = SetInbounds.applyChange(this.oManifestNoPathToInbounds1, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 2, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactDisplay"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest with empty inboud id", function(assert) {
			assert.throws(function() {
				// Empty inbound id
				this.oChangeEmptyInboundId = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {
						inbounds: {
							"": {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						}
					}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeEmptyInboundId);
			}, Error("The ID of your inbounds is empty."),
			"throws error that the id of the inbounds must not be empty");
		});

		QUnit.test("when calling '_applyChange' without an inbound", function(assert) {
			assert.throws(function() {
				// Empty inbound
				this.oChangeNoInbound = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {
						inbounds: {}
					}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeNoInbound);
			}, Error("There is no inbounds provided. Please provide an inbounds."),
			 "throws an error that the change does not have an inbound");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound which already exist in the manifest", function(assert) {
			this.oChangeAlreadyExistingInbound = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_SetInbounds"
				},
				layer: Layer.VENDOR,
				content: {
					inbounds: {
						"Risk-configure": {
							semanticObject: "Contact",
							action: "create",
							icon: "sap-icon://add-contact",
							title: "Title",
							subTitle: "SubTitle"
						}
					}
				}
			});
			const oNewManifest = SetInbounds.applyChange(this.oManifest, this.oChangeAlreadyExistingInbound);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest from customer layer with no prefix", function(assert) {
			assert.throws(function() {
				// Layer check
				this.oChangeLayerCustomerVendorNoPrefix = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {
						inbounds: {
							contactCreate: {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						}
					}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeLayerCustomerVendorNoPrefix);
			}, Error("Id contactCreate must start with customer."),
			"throws error that the namespace is not compliance");
		});

		QUnit.test("when calling '_applyChange' adding a change which has no object under content", function(assert) {
			assert.throws(function() {
				// No object under change object content
				this.oChangeNoObjectUnderContent = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {	}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeNoObjectUnderContent);
			}, Error("The change object 'content' cannot be empty. Please provide the necessary property, as outlined in the change schema for 'appdescr_app_SetInbounds'."),
			"throws error that the change object is not compliant");
		});

		QUnit.test("when calling '_applyChange' adding a change which has no supported object under change object content", function(assert) {
			assert.throws(function() {
				// Not supported object under change object content
				this.oChangeNotSupportedObjectUnderContent = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {
						notSupportedObject: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						}
					}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeNotSupportedObjectUnderContent);
			}, Error("The provided property 'notSupportedObject' is not supported. Supported property for change 'appdescr_app_SetInbounds' is 'inbounds'."),
			"throws error that the change object is not compliant");
		});

		QUnit.test("when calling '_applyChange' adding a change which has missing mandatory parameters", function(assert) {
			assert.throws(function() {
				// Mandatory property missing
				this.oChangeMandatoryParameterMissing = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {
						inbounds: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle",
								signature: {}
							}
						}
					}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeMandatoryParameterMissing);
			}, Error("Mandatory property 'action' is missing. Mandatory properties are semanticObject|action."),
			"throws error that the change object is missing mandatory parameters");
		});

		QUnit.test("when calling '_applyChange' adding a change which has not supported properties", function(assert) {
			assert.throws(function() {
				// Having not supported properties
				this.oChangeNotHavingSupportedProperties = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {
						inbounds: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle",
								signature: {}
							}
						}
					}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeNotHavingSupportedProperties);
			}, Error("Property additionalParameters is not supported. Supported properties are semanticObject|action|hideLauncher|icon|title|shortTitle|subTitle|info|indicatorDataSource|deviceTypes|displayMode|signature."),
			"throws error that the change object has not supported properties");
		});

		QUnit.test("when calling '_applyChange' adding a change which the property value of semanticObject does not match to regex", function(assert) {
			assert.throws(function() {
				// Property Value does not match to regular expression
				this.oChangeRegExNotMatchForSemanticObject = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {
						inbounds: {
							"customer.contactCreate": {
								semanticObject: "Not-Match-RegEx",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle",
								signature: {}
							}
						}
					}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeRegExNotMatchForSemanticObject);
			}, Error("The property has disallowed values. Supported values for 'semanticObject' should adhere to regular expression /^[\\w\\*]{0,30}$/."),
			"throws error that the change property does not match to regular expression");
		});

		QUnit.test("when calling '_applyChange' adding a change which the property value of action does not match to regex", function(assert) {
			assert.throws(function() {
				// Property Value does not match to regular expression
				this.oChangeRegExNotMatchForAction = new AppDescriptorChange({
					flexObjectMetadata: {
						changeType: "appdescr_app_SetInbounds"
					},
					layer: Layer.CUSTOMER,
					content: {
						inbounds: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "Not-Match-RegEx",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle",
								signature: {}
							}
						}
					}
				});
				SetInbounds.applyChange(this.oManifest, this.oChangeRegExNotMatchForAction);
			}, Error("The property has disallowed values. Supported values for 'action' should adhere to regular expression /^[\\w\\*]{0,60}$/."),
			"throws error that the change property does not match to regular expression");
		});
	});
});
