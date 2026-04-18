/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/additionalElements/ActionExtractor",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Lib,
	DesignTime,
	OverlayRegistry,
	Util,
	CommandFactory,
	ActionExtractor,
	AddElementsDialog,
	AdditionalElementsPlugin,
	AdditionalElementsUtils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	/**
	 * Tests related to the context menu items
	 * created by the AdditionalElements Plugin
	 */
	const oRTABundle = Lib.getResourceBundleFor("sap.ui.rta");

	QUnit.module("Given the method 'getMenuItems' is called on the AdditionalElements Plugin", {
		async beforeEach() {
			this.oDialog = new AddElementsDialog();

			this.oPlugin = new AdditionalElementsPlugin({
				dialog: this.oDialog,
				commandFactory: new CommandFactory()
			});

			this.oDummySelectedOverlay = "DummySelectedOverlay";
			this.oButton = new Button({ id: "DummyButton", text: "DummyButton" });
			this.oDesignTime = new DesignTime({
				rootElements: [this.oButton],
				plugins: [this.oPlugin]
			});
			await Util.waitForSynced(this.oDesignTime)();
			this.oOverlay = OverlayRegistry.getOverlay(this.oButton);
			sandbox.stub(this.oPlugin, "_isEditableByPlugin").returns(true);
		},
		afterEach() {
			this.oDialog.destroy();
			this.oPlugin.destroy();
			this.oDesignTime.destroy();
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when there are only siblings", function(assert) {
			const sExpectedContextMenuText = "CONTEXT_MENU_TEXT";
			const iExpectedRank = 20;
			const sExpectedIcon = "sap-icon://add";
			const sAggregationName = "DummyAggregation";

			sandbox.stub(AdditionalElementsUtils, "getParents").returns({
				responsibleElementOverlay: {
					getParentAggregationOverlay() {
						return {
							getAggregationName() {
								return sAggregationName;
							}
						};
					}
				}
			});

			const aElementOverlays = [this.oOverlay];

			// "getAllElements" returns only elements for the call with isSibling = true
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				const aElementsArray = bIsSibling ? [{
					aggregation: sAggregationName,
					elements: [
						{ elementId: "DummyElement" }
					]
				}] : [];
				return Promise.resolve(aElementsArray);
			});
			sandbox.stub(ActionExtractor, "getActionsOrUndef").returns({
				[sAggregationName]: {}
			});

			sandbox.stub(this.oPlugin, "isAvailable").returnsArg(1);

			sandbox.stub(this.oPlugin, "getActionText").returns(sExpectedContextMenuText);
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				const oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_SIBLING", "then the entry is for sibling");
				assert.strictEqual(oMenuItem.text, sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				assert.notOk(oMenuItem.submenu, "then the entry has no submenu");
			});
		});

		QUnit.test("when there are only children from the same aggregation", function(assert) {
			const sExpectedContextMenuText = "CONTEXT_MENU_TEXT";
			const iExpectedRank = 25;
			const sExpectedIcon = "sap-icon://add";
			const sAggregationName = "DummyAggregation";

			this.oOverlay.setDesignTimeMetadata({
				aggregations: {
					[sAggregationName]: {
						displayName: {
							singular: () => sExpectedContextMenuText,
							plural: () => sExpectedContextMenuText
						}
					}
				}
			});
			sandbox.stub(ActionExtractor, "getActionsOrUndef").returns({
				[sAggregationName]: {}
			});

			const aElementOverlays = [this.oOverlay];

			// "getAllElements" returns only elements for the call with isSibling = false
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				const aElementsArray = !bIsSibling ? [
					{
						aggregation: sAggregationName,
						elements: [
							{ elementId: "DummyElement" },
							{ elementId: "DummyElement2" }
						]
					}
				] : [];
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(aOverlays, oAction, bIsSibling) {
				return !bIsSibling;
			});

			sandbox.stub(this.oPlugin, "getActionText").returns(sExpectedContextMenuText);
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				const oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_CHILD", "then the entry is for child");
				assert.strictEqual(oMenuItem.text, sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				assert.notOk(oMenuItem.submenu, "then the entry has no submenu");
			});
		});

		QUnit.test("when there are children from the same aggregation and siblings", function(assert) {
			const sExpectedContextMenuText = oRTABundle.getText("CTX_ADD_ELEMENTS_WITH_SUBMENU");
			const sExpectedContextMenuTextSibling = "CONTEXT_MENU_TEXT_SIBLING";
			const sExpectedContextMenuTextChild = "CONTEXT_MENU_TEXT_CHILD";
			const iExpectedRank = 30;
			const sExpectedIcon = "sap-icon://add";
			const sChildAggregationName = "ChildAggregationName";
			const sSiblingAggregationName = "SiblingAggregationName";

			this.oOverlay.setDesignTimeMetadata({
				aggregations: {
					[sChildAggregationName]: {
						displayName: {
							singular: () => sExpectedContextMenuTextChild,
							plural: () => sExpectedContextMenuTextChild
						}
					}
				}
			});
			sandbox.stub(this.oOverlay, "getParentElementOverlay").returns({
				getDesignTimeMetadata() {
					return {
						getAggregationDisplayName() {
							return {
								plural: sExpectedContextMenuTextSibling
							};
						},
						getResponsibleElement() {
							return;
						}
					};
				},
				getElement() {
					return "DummyParentElement";
				}
			 });

			sandbox.stub(ActionExtractor, "getActionsOrUndef").returns({
				[sChildAggregationName]: {},
				[sSiblingAggregationName]: {}
			});

			const aElementOverlays = [this.oOverlay];

			// "getAllElements" returns elements for the call with isSibling = false and true
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				const aElementsArray = bIsSibling ? [{
					aggregation: sSiblingAggregationName,
					elements: [
						{ elementId: "DummySiblingElement" }
					]
				}] : [{
					aggregation: sChildAggregationName,
					elements: [
						{ elementId: "DummyChildElement" }
					]
				}];
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").returns(true);
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				const oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_CHILD_AND_SIBLING", "then the entry is for sibling and child");
				assert.strictEqual(oMenuItem.text, sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				assert.ok(oMenuItem.enabled, "then the menu item is enabled");
				assert.ok(oMenuItem.submenu, "then there is a submenu");
				const aSubMenuItems = oMenuItem.submenu;
				const oSubMenuItemChild = aSubMenuItems[0];
				assert.strictEqual(oSubMenuItemChild.id, "CTX_ADD_ELEMENTS_AS_CHILD_0", "then the first submenu entry id is for the child");
				assert.strictEqual(oSubMenuItemChild.text, sExpectedContextMenuTextChild, "then the aggregation name is the entry text");
				const oSubMenuItemSibling = aSubMenuItems[1];
				assert.strictEqual(
					oSubMenuItemSibling.id,
					"CTX_ADD_ELEMENTS_AS_SIBLING_0",
					"then the second submenu entry id is for the sibling"
				);
				assert.strictEqual(
					oSubMenuItemSibling.text,
					sExpectedContextMenuTextSibling,
					"then the aggregation name is the entry text"
				);
			});
		});

		QUnit.test("when there are children from different aggregations", function(assert) {
			const sExpectedContextMenuText = oRTABundle.getText("CTX_ADD_ELEMENTS_WITH_SUBMENU");
			const sExpectedContextMenuTextChild = "CONTEXT_MENU_TEXT_CHILD";
			const sFirstChildAggregationName = "childAggregationName";
			const sSecondChildAggregationName = "childAggregationName2";
			const iExpectedRank = 25;
			const sExpectedIcon = "sap-icon://add";

			this.oOverlay.setDesignTimeMetadata({
				aggregations: {
					[sFirstChildAggregationName]: {
						displayName: {
							singular: () => sExpectedContextMenuTextChild,
							plural: () => sExpectedContextMenuTextChild
						}
					},
					[sSecondChildAggregationName]: {
						displayName: {
							singular: () => sExpectedContextMenuTextChild,
							plural: () => sExpectedContextMenuTextChild
						}
					}
				}
			});
			sandbox.stub(ActionExtractor, "getActionsOrUndef").returns({
				[sFirstChildAggregationName]: {},
				[sSecondChildAggregationName]: {}
			});

			const aElementOverlays = [this.oOverlay];

			// "getAllElements" returns elements for the call with isSibling = false for different aggregations
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				const aElementsArray = bIsSibling ? [] : [{
					aggregation: sFirstChildAggregationName,
					elements: [
						{ elementId: "DummyChildElement" }
					]
				}, {
					aggregation: sSecondChildAggregationName,
					elements: [
						{ elementId: "DummyChildElement2" }
					]
				}];
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(aOverlays, oAction, bIsSibling) {
				return !bIsSibling;
			});
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				const oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_CHILD", "then the entry is for sibling and child");
				assert.strictEqual(oMenuItem.text, sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				assert.ok(oMenuItem.enabled, "then the menu item is enabled");
				assert.ok(oMenuItem.submenu, "then there is a submenu");
				const aSubMenuItems = oMenuItem.submenu;
				const oSubMenuItemChild = aSubMenuItems[0];
				assert.strictEqual(oSubMenuItemChild.id, "CTX_ADD_ELEMENTS_AS_CHILD_0", "then the first submenu entry id is for the child");
				assert.strictEqual(oSubMenuItemChild.text, sExpectedContextMenuTextChild, "then the aggregation name is the entry text");
				const oSubMenuItemChildSecondAggregation = aSubMenuItems[1];
				assert.strictEqual(
					oSubMenuItemChildSecondAggregation.id,
					"CTX_ADD_ELEMENTS_AS_CHILD_1", "then the second submenu entry id is for the child"
				);
				assert.strictEqual(
					oSubMenuItemChildSecondAggregation.text,
					sExpectedContextMenuTextChild,
					"then the aggregation name is the entry text"
				);
			});
		});

		QUnit.test("when there are children from multiple aggregations and siblings", function(assert) {
			const sExpectedContextMenuText = oRTABundle.getText("CTX_ADD_ELEMENTS_WITH_SUBMENU");
			const sExpectedContextMenuTextSibling = "CONTEXT_MENU_TEXT_SIBLING";
			const sExpectedContextMenuTextChild = "CONTEXT_MENU_TEXT_CHILD";
			const sSiblingAggregationName = "SiblingAggregation";
			const sFirstChildAggregationName = "FirstChildAggregation";
			const sSecondChildAggregationName = "SecondChildAggregation";
			const iExpectedRank = 30;
			const sExpectedIcon = "sap-icon://add";

			this.oOverlay.setDesignTimeMetadata({
				aggregations: {
					[sFirstChildAggregationName]: {
						displayName: {
							singular: () => sExpectedContextMenuTextChild,
							plural: () => sExpectedContextMenuTextChild
						}
					},
					[sSecondChildAggregationName]: {
						displayName: {
							singular: () => sExpectedContextMenuTextChild,
							plural: () => sExpectedContextMenuTextChild
						}
					}
				}
			});
			sandbox.stub(this.oOverlay, "getParentElementOverlay").returns({
				getDesignTimeMetadata() {
					return {
						getAggregationDisplayName() {
							return {
								plural: sExpectedContextMenuTextSibling
							};
						}
					};
				},
				getElement() {
					return "DummyElement";
				}
			});
			sandbox.stub(ActionExtractor, "getActionsOrUndef").returns({
				[sSiblingAggregationName]: {},
				[sFirstChildAggregationName]: {},
				[sSecondChildAggregationName]: {}
			});

			const aElementOverlays = [this.oOverlay];

			// "getAllElements" returns elements for siblings and multiple child aggregations
			sandbox.stub(this.oPlugin, "getAllElements").callsFake(function(bIsSibling) {
				const aElementsArray = bIsSibling ? [{
					aggregation: sSiblingAggregationName,
					elements: [
						{ elementId: "DummySiblingElement" }
					]
				}] : [{
					aggregation: sFirstChildAggregationName,
					elements: [
						{ elementId: "DummyChildElement" }
					]
				}, {
					aggregation: sSecondChildAggregationName,
					elements: [
						{ elementId: "DummyChildElement2" }
					]
				}];
				return Promise.resolve(aElementsArray);
			});

			sandbox.stub(this.oPlugin, "isAvailable").returns(true);
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				const oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_CHILD_AND_SIBLING", "then the entry is for sibling and child");
				assert.strictEqual(oMenuItem.text, sExpectedContextMenuText, "then the expected text is returned");
				assert.strictEqual(oMenuItem.rank, iExpectedRank, "then the rank is correct");
				assert.strictEqual(oMenuItem.icon, sExpectedIcon, "then the icon is correct");
				assert.ok(oMenuItem.enabled, "then the menu item is enabled");
				assert.ok(oMenuItem.submenu, "then there is a submenu");
				const aSubMenuItems = oMenuItem.submenu;
				const oSubMenuItemChild = aSubMenuItems[0];
				assert.strictEqual(
					oSubMenuItemChild.id,
					"CTX_ADD_ELEMENTS_AS_CHILD_0",
					"then the first submenu entry id is for the child of the first aggregation"
				);
				assert.strictEqual(oSubMenuItemChild.text, sExpectedContextMenuTextChild, "then the aggregation name is the entry text");
				const oSubMenuItemChild2 = aSubMenuItems[1];
				assert.strictEqual(
					oSubMenuItemChild2.id,
					"CTX_ADD_ELEMENTS_AS_CHILD_1",
					"then the second submenu entry id is for the child of the second aggregation"
				);
				assert.strictEqual(oSubMenuItemChild2.text, sExpectedContextMenuTextChild, "then the aggregation name is the entry text");
				const oSubMenuItemSibling = aSubMenuItems[2];
				assert.strictEqual(
					oSubMenuItemSibling.id,
					"CTX_ADD_ELEMENTS_AS_SIBLING_0",
					"then the third submenu entry id is for the sibling"
				);
				assert.strictEqual(
					oSubMenuItemSibling.text,
					sExpectedContextMenuTextSibling,
					"then the aggregation name is the entry text"
				);
			});
		});

		QUnit.test("when there are no elements available but extension fields is allowed - sibling case", function(assert) {
			const sExpectedContextMenuText = "Expected Text";

			sandbox.stub(AdditionalElementsUtils, "getParents").returns({
				responsibleElementOverlay: {
					getParentAggregationOverlay() {
						return {
							getAggregationName() {
								return "dummyAggregation";
							}
						};
					}
				},
				parent: "dummyParent"
			});

			const aElementOverlays = [this.oOverlay];

			// "getAllElements" returns no elements
			sandbox.stub(this.oPlugin, "getAllElements").returns([]);

			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(aOverlays, oAction, bIsSibling) {
				return bIsSibling;
			});

			sandbox.stub(ActionExtractor, "getActionsOrUndef").returns({
				dummyAggregation: {
					action: "dummyAction"
				}
			});

			sandbox.stub(AdditionalElementsUtils, "getText").callsFake(function(sExpectedKey, mActions, sParent, bSingular) {
				assert.equal(sExpectedKey, "CTX_ADD_ELEMENTS", "getText called with right key");
				assert.equal(mActions.action, "dummyAction", "getText called with the right actions");
				assert.equal(sParent, "dummyParent", "getText called with the right parent");
				assert.ok(bSingular, "getText called with SINGULAR (true)");
				return sExpectedContextMenuText;
			});

			// Return the menu item
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				const oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_SIBLING", "then the entry is for sibling");
				assert.strictEqual(oMenuItem.text, sExpectedContextMenuText, "then the expected text is returned");
				assert.notOk(oMenuItem.submenu, "then the entry has no submenu");
			});
		});

		QUnit.test("when there are no elements available but extension fields is allowed - child case", function(assert) {
			const aElementOverlays = [this.oOverlay];
			const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
			const sExpectedContextMenuText = oTextResources.getText("CTX_ADD_ELEMENTS", [oTextResources.getText("MULTIPLE_CONTROL_NAME")]);

			// "getAllElements" returns no elements
			sandbox.stub(this.oPlugin, "getAllElements").returns([]);
			sandbox.stub(ActionExtractor, "getActionsOrUndef").returns({
				$$OnlyChildCustomField$$: {}
			});

			sandbox.stub(this.oPlugin, "isAvailable").callsFake(function(aOverlays, oAction, bIsSibling) {
				return !bIsSibling;
			});

			// Return the menu item
			sandbox.stub(this.oPlugin, "enhanceItemWithResponsibleElement").returnsArg(0);

			return this.oPlugin.getMenuItems(aElementOverlays).then(function(aMenuItems) {
				assert.strictEqual(aMenuItems.length, 1, "then only one menu item is returned");
				const oMenuItem = aMenuItems[0];
				assert.strictEqual(oMenuItem.id, "CTX_ADD_ELEMENTS_AS_CHILD", "then the entry is for child");
				assert.strictEqual(oMenuItem.text, sExpectedContextMenuText, "then the expected text is returned");
				assert.notOk(oMenuItem.submenu, "then the entry has no submenu");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});