/* global QUnit */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/thirdparty/sinon-4"
], function(
	Element,
	Lib,
	AddElementsDialog,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

	function createDialog() {
		var aElements = [
			{
				selected: false,
				label: "label1",
				tooltip: "tooltip1",
				elementId: "field1",
				originalLabel: "original",
				type: "invisible"
			},
			{
				selected: true,
				label: "label2",
				tooltip: "tooltip2",
				name: "field2",
				type: "odata"
			},
			{
				selected: true,
				label: "label3",
				tooltip: "tooltip3",
				parentPropertyName: "complexPropName",
				name: "field3",
				type: "odata"
			},
			{
				selected: false,
				label: "label4",
				tooltip: "tooltip4",
				parentPropertyName: "duplicateComplexPropName",
				duplicateName: true,
				name: "field4",
				type: "odata"
			},
			{
				selected: false,
				label: "label5",
				tooltip: "tooltip5",
				name: "field5",
				type: "delegate"
			}
		];

		var oAddElementsDialog = new AddElementsDialog({
			title: "hugo"
		});

		oAddElementsDialog.setElements(aElements);
		return oAddElementsDialog;
	}

	function createDialogWithEntityGroups() {
		const aElements = [
			{
				selected: false,
				label: "rootField1",
				tooltip: "tooltip1",
				elementId: "field1",
				type: "invisible"
			},
			{
				selected: false,
				label: "rootField2",
				tooltip: "tooltip2",
				name: "field2",
				type: "odata"
			},
			{
				selected: false,
				label: "entityAField1",
				tooltip: "tooltip3",
				name: "field3",
				type: "odata",
				entityTypeDisplayName: "Entity A"
			},
			{
				selected: false,
				label: "entityAField2",
				tooltip: "tooltip4",
				name: "field4",
				type: "odata",
				entityTypeDisplayName: "Entity A"
			},
			{
				selected: false,
				label: "entityBField1",
				tooltip: "tooltip5",
				name: "field5",
				type: "delegate",
				entityTypeDisplayName: "Entity B"
			}
		];

		const oAddElementsDialog = new AddElementsDialog({
			title: "Dialog with Entity Groups"
		});

		oAddElementsDialog.setElements(aElements);
		return oAddElementsDialog;
	}

	/**
	 * Helper function to get the label text from a list item
	 * @param {sap.m.ListItemBase} oItem - The list item
	 * @returns {string} The label text or title (stripped of HTML tags)
	 */
	function getItemLabelText(oItem) {
		// For GroupHeaderListItem, use getTitle()
		if (oItem.getTitle) {
			const sTitle = oItem.getTitle();
			if (sTitle) {
				return sTitle;
			}
		}
		// For CustomListItem, get the first FormattedText from content
		if (oItem.getContent) {
			const aContent = oItem.getContent();
			if (aContent.length > 0 && aContent[0].getItems) {
				const oFirstItem = aContent[0].getItems()[0];
				// Check if it's FormattedText (has getHtmlText) or Label (has getText)
				if (oFirstItem.getHtmlText) {
					// Strip HTML tags to get plain text
					return oFirstItem.getHtmlText().replace(/<[^>]*>/g, "");
				}
				if (oFirstItem.getText) {
					return oFirstItem.getText();
				}
			}
		}
		return "";
	}

	/**
	 * Helper function to check if an item is a group header
	 * @param {sap.m.ListItemBase} oItem - The list item
	 * @returns {boolean} True if it's a group header
	 */
	function isGroupHeader(oItem) {
		return oItem.isA("sap.m.GroupHeaderListItem");
	}

	QUnit.module("Given that a AddElementsDialog is available...", {
		beforeEach() {
			this.oAddElementsDialog = createDialog();
		},
		afterEach() {
			this.oAddElementsDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when item is selected, focus should persist", function(assert) {
			var done = assert.async();

			function getItemByPath(aItems, sBindingPath) {
				return aItems.filter(function(oItem) {
					return oItem.getBindingContext() && oItem.getBindingContext().getPath() === sBindingPath;
				})[0];
			}

			this.oAddElementsDialog.attachOpened(function() {
				const oList = Element.getElementById(`${this.getId()}--rta_addElementsDialogList`);
				var sBindingPath = oList.getItems()[0].getBindingContext().getPath();

				function checkList() {
					var oTargetItem = getItemByPath(oList.getItems(), sBindingPath);
					assert.strictEqual(document.activeElement, oTargetItem.getDomRef());
					done();
				}

				var oTargetItem = getItemByPath(oList.getItems(), sBindingPath);
				oTargetItem.getDomRef().focus();
				assert.strictEqual(document.activeElement, oTargetItem.getDomRef());
				oTargetItem.getDomRef().dispatchEvent(new Event("touchstart"));

				// Wait until list is re-rendered
				setTimeout(checkList);
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized and open is called,", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this.getTitle(), "hugo", "then the title is set");
				assert.strictEqual(this._oDialog.getTitle(), "hugo", "then the title is also set on the internal dialog");
				assert.equal(this._oList.getItems().length, 5, "then 5 elements internally known");
				assert.equal(this.getElements().length, 5, "then 5 elements externally known");
				assert.equal(this.getSelectedElements().length, 2, "then 2 selected elements");
				assert.equal(this.getCustomFieldButtonVisible(), false, "then the customField-button is hidden");

				// Get the second FormattedText (original label) and check its htmlText
				const oOriginalLabelItem = this._oList.getItems()[0].getContent()[0].getItems()[1];
				const sOriginalLabelText = oOriginalLabelItem.getHtmlText
					? oOriginalLabelItem.getHtmlText().replace(/<[^>]*>/g, "")
					: oOriginalLabelItem.getText();
				assert.equal(
					sOriginalLabelText,
					"was original",
					"then the originalLabel is set"
				);

				this.setTitle("new title");
				assert.equal(this.getTitle(), "new title", "then the title is changed");
				assert.strictEqual(this._oDialog.getTitle(), "new title", "then the title is also changed on the internal dialog");
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with customFieldButtonVisible set and no Business Contexts are available", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.setCustomFieldButtonVisible(true);
			this.oAddElementsDialog.addExtensibilityInfo({
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip"
				}
			});
			this.oAddElementsDialog.attachOpened(function() {
				const oBCContainer = Element.getElementById(`${this.getId()}--rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 2, "and the Business Context Container has two entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(
					oBCContainer.getContent()[1].getText(),
					oTextResources.getText("MSG_NO_BUSINESS_CONTEXTS"),
					"and the second entry is the No-Context Message"
				);
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with customFieldButtonVisible set and three Business Contexts are available", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.setCustomFieldButtonVisible(true);
			var oExtensibilityInfo = {
				extensionData: [
					{ description: "Business Context 1" },
					{ description: "Business Context 2" },
					{ description: "Business Context 3" }
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip"
				}
			};
			this.oAddElementsDialog.addExtensibilityInfo(oExtensibilityInfo);
			this.oAddElementsDialog.attachOpened(function() {
				const oBCContainer = Element.getElementById(`${this.getId()}--rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 4, "and the Business Context Container has four entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(
					oBCContainer.getContent()[1].getText(),
					"Business Context 1",
					"and the second entry is the First Business Context"
				);
				assert.equal(
					oBCContainer.getContent()[2].getText(),
					"Business Context 2",
					"and the third entry is the Second Business Context"
				);
				assert.equal(
					oBCContainer.getContent()[3].getText(),
					"Business Context 3",
					"and the fourth entry is the Third Business Context"
				);
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets closed and opened again with customFieldButtonVisible set and available Business Contexts", async function(assert) {
			function fnOnClose() {
				this.oAddElementsDialog.attachEventOnce("opened", fnOnOpen);
			}

			function fnFirstOpen() {
				this.oAddElementsDialog._submitDialog();
			}

			function fnOnOpen() {
				const oBCContainer = Element.getElementById(`${this.oAddElementsDialog.getId()}--rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 4, "and the Business Context Container has four entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(
					oBCContainer.getContent()[1].getText(),
					"Business Context 1",
					"and the second entry is the First Business Context"
				);
				assert.equal(
					oBCContainer.getContent()[2].getText(),
					"Business Context 2",
					"and the third entry is the Second Business Context"
				);
				assert.equal(
					oBCContainer.getContent()[3].getText(),
					"Business Context 3",
					"and the fourth entry is the Third Business Context"
				);
				this.oAddElementsDialog._submitDialog();
			}

			this.oAddElementsDialog.setCustomFieldButtonVisible(true);
			var oExtensibilityInfo = {
				extensionData: [
					{ description: "Business Context 1" },
					{ description: "Business Context 2" },
					{ description: "Business Context 3" }
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip"
				}
			};
			this.oAddElementsDialog.addExtensibilityInfo(oExtensibilityInfo);
			this.oAddElementsDialog.attachEventOnce("afterClose", fnOnClose, this);
			this.oAddElementsDialog.attachEventOnce("opened", fnFirstOpen, this);

			// Open the first time and close it
			await this.oAddElementsDialog.open();

			// Add Business Context again
			this.oAddElementsDialog = createDialog();
			this.oAddElementsDialog.attachEventOnce("opened", fnOnOpen, this);
			this.oAddElementsDialog.addExtensibilityInfo(oExtensibilityInfo);
			// Open the second time
			await this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with legacy extensibility", function(assert) {
			const done = assert.async();
			const oButtonText = oTextResources.getText("BTN_ADDITIONAL_ELEMENTS_CREATE_CUSTOM_FIELDS");
			const oExtensibilityInfo = {
				extensionData: [
					{ description: "Business Context 1" }
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip",
					options: [
						{
							tooltip: "extensibilityTooltip",
							text: oButtonText
						}]
				}
			};
			this.oAddElementsDialog.setExtensibilityOptions(oExtensibilityInfo);
			this.oAddElementsDialog.attachOpened(function() {
				const oButton = Element.getElementById(`${this.getId()}--rta_customFieldButton`);
				const oRedirectToCustomFieldCreationStub = sandbox.stub(AddElementsDialog.prototype, "_redirectToExtensibilityAction");
				assert.strictEqual(oButton.getVisible(), true, "then Button is visible");
				assert.strictEqual(
					oButton.getText(),
					oButtonText,
					"then the button text is set correctly"
				);
				assert.strictEqual(
					oButton.getTooltip(),
					oExtensibilityInfo.UITexts.tooltip,
					"then the tooltip text is set correctly"
				);
				function executeChecks() {
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledOnce,
						true,
						"then the _redirectToExtensibilityAction method is called once"
					);
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledWith(undefined),
						true,
						"then the _redirectToExtensibilityAction method is called with the correct parameters"
					);
					done();
				}
				oButton.attachPress(executeChecks);
				oButton.firePress();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with one extensibility option", function(assert) {
			var done = assert.async();
			var oExtensibilityInfo = {
				extensionData: [
					{ description: "Business Context 1" }
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip",
					buttonText: "Add Custom",
					options: [
						{
							actionKey: "key1",
							text: "Add Custom Field",
							tooltip: "tooltip1"
						}
					]
				}
			};
			this.oAddElementsDialog.setExtensibilityOptions(oExtensibilityInfo);
			this.oAddElementsDialog.attachOpened(function() {
				const oButton = Element.getElementById(`${this.getId()}--rta_customFieldButton`);
				const oRedirectToCustomFieldCreationStub = sandbox.stub(AddElementsDialog.prototype, "_redirectToExtensibilityAction");
				assert.strictEqual(oButton.getVisible(), true, "then Button is visible");
				assert.strictEqual(
					oButton.getText(),
					oExtensibilityInfo.UITexts.options[0].text,
					"then the button text is set correctly"
				);
				assert.strictEqual(
					oButton.getTooltip(),
					oExtensibilityInfo.UITexts.options[0].tooltip,
					"then the tooltip text is set correctly"
				);
				function executeChecks() {
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledOnce,
						true,
						"then the _redirectToExtensibilityAction method is called once"
					);
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledWith(oExtensibilityInfo.UITexts.options[0].actionKey),
						true,
						"then the _redirectToExtensibilityAction method is called with the correct parameters"
					);
					done();
				}
				oButton.attachPress(executeChecks);
				oButton.firePress();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with multiple extensibility options", function(assert) {
			var done = assert.async(2);
			var oExtensibilityInfo = {
				extensionData: [
					{ description: "Business Context 1" }
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip",
					buttonText: "Add Custom",
					options: [
						{
							actionKey: "key1",
							text: "Add Custom Field",
							tooltip: "tooltip1"
						},
						{
							actionKey: "key2",
							text: "Add Custom Logic",
							tooltip: "tooltip2"
						}
					]
				}
			};
			this.oAddElementsDialog.setExtensibilityOptions(oExtensibilityInfo);
			this.oAddElementsDialog.attachOpened(function() {
				const oMenuButton = Element.getElementById(`${this.getId()}--rta_customFieldMenuButton`);
				const aMenuItems = oMenuButton.getMenu().getItems();
				const oRedirectToCustomFieldCreationStub = sandbox.stub(AddElementsDialog.prototype, "_redirectToExtensibilityAction");
				assert.strictEqual(oMenuButton.getVisible(), true, "then MenuButton is visible");
				assert.strictEqual(
					oMenuButton.getText(),
					oExtensibilityInfo.UITexts.buttonText,
					"then the button text is set correctly"
				);
				assert.strictEqual(
					oMenuButton.getTooltip(),
					oExtensibilityInfo.UITexts.tooltip,
					"then the tooltip text is set correctly"
				);
				assert.strictEqual(
					aMenuItems[0].getText(),
					oExtensibilityInfo.UITexts.options[0].text,
					"then the first menu item text is set correctly"
				);
				assert.strictEqual(
					aMenuItems[0].getTooltip(),
					oExtensibilityInfo.UITexts.options[0].tooltip,
					"then the first menu item tooltip text is set correctly"
				);
				assert.strictEqual(
					aMenuItems[1].getText(),
					oExtensibilityInfo.UITexts.options[1].text,
					"then the second menu item text is set correctly"
				);
				assert.strictEqual(
					aMenuItems[1].getTooltip(),
					oExtensibilityInfo.UITexts.options[1].tooltip,
					"then the second menu item tooltip text is set correctly"
				);
				function executeFirstChecks() {
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledOnce,
						true,
						"then the _redirectToExtensibilityAction method is called once"
					);
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledWith(oExtensibilityInfo.UITexts.options[0].actionKey),
						true,
						"then the _redirectToExtensibilityAction method is called with the correct parameters"
					);
					done();
				}
				aMenuItems[0].attachPress(executeFirstChecks);

				function executeSecondChecks() {
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledTwice,
						true,
						"then the _redirectToExtensibilityAction method is called twice"
					);
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledWith(oExtensibilityInfo.UITexts.options[1].actionKey),
						true,
						"then the _redirectToExtensibilityAction method is called with the correct parameters"
					);
					done();
				}
				aMenuItems[1].attachPress(executeSecondChecks);
				aMenuItems[0].firePress();
				aMenuItems[1].firePress();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when on opened AddElementsDialog OK is pressed,", function(assert) {
			this.oAddElementsDialog.attachOpened(function() {
				this._submitDialog();
			});

			return this.oAddElementsDialog.open().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});

		QUnit.test("when on opened AddElementsDialog Cancel is pressed,", function(assert) {
			this.oAddElementsDialog.attachOpened(function() {
				this._cancelDialog();
			});

			return this.oAddElementsDialog.open().then(function() {
				assert.ok(false, "then the promise got rejected");
			}).catch(function() {
				assert.ok(true, "then the promise got rejected");
			});
		});

		QUnit.test("when on opened AddElementsDialog the list gets filtered via input", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(this._oList.getItems().length, 5, "then initially 5 entries are there");
				this._updateModelFilter({ getParameter() {return "2";} });
				assert.equal(this._oList.getItems().length, 1, "when filtering for '2' then 1 entry is shown");
				this._updateModelFilter({ getParameter() {return null;} });
				assert.equal(this._oList.getItems().length, 5, "then after clearing 5 entries are there");
				this._updateModelFilter({ getParameter() {return "complex";} });
				assert.equal(this._oList.getItems().length, 1, "when filtering for 'complex' then 1 entry is shown");
				assert.equal(
					getItemLabelText(this._oList.getItems()[0]),
					"label4 (duplicateComplexPropName)",
					"then only label4 where complex is part of the label (duplicateName)"
				);
				this._updateModelFilter({ getParameter() {return null;} });
				this._updateModelFilter({ getParameter() {return "orig";} });
				assert.equal(this._oList.getItems().length, 1, "when filtering for 'orig' then 1 entry is shown");
				assert.equal(
					getItemLabelText(this._oList.getItems()[0]),
					"label1",
					"then only label1 with original name"
				);
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when on opened AddElementsDialog the resort-button is pressed,", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(getItemLabelText(this._oList.getItems()[0]), "label1", "then label1 is first");
				this._resortList();
				assert.equal(getItemLabelText(this._oList.getItems()[0]), "label5", "then last label is first");
				done();
			});
			this.oAddElementsDialog.open();
		});

		function createManyElements(count) {
			const aElements = [];
			for (let i = 0; i < count; i++) {
				// Use zero-padded numbers to ensure consistent alphabetical sorting
				const sPaddedIndex = String(i).padStart(3, "0");
				aElements.push({
					selected: false,
					label: `element${sPaddedIndex}`,
					tooltip: `tooltip${sPaddedIndex}`,
					name: `field${sPaddedIndex}`,
					type: "odata"
				});
			}
			return aElements;
		}

		QUnit.test("when AddElementsDialog has more than 100 elements, all elements are displayed", function(assert) {
			const done = assert.async();
			const iElementCount = 1000;
			const aElements = createManyElements(iElementCount);

			const oLargeDialog = new AddElementsDialog({ title: "Large Dialog" });
			oLargeDialog.setElements(aElements);

			oLargeDialog.attachOpened(function() {
				assert.equal(this.getElements().length, iElementCount, `then ${iElementCount} elements are stored in the model`);
				assert.equal(this._oList.getItems().length, iElementCount, `then all ${iElementCount} elements are displayed in the list`);
				assert.equal(getItemLabelText(this._oList.getItems()[0]), "element000", "then the first element is displayed correctly");
				assert.equal(
					getItemLabelText(this._oList.getItems()[iElementCount - 1]),
					`element${String(iElementCount - 1)}`,
					"then the last element is displayed correctly"
				);
				oLargeDialog.destroy();
				done();
			});
			oLargeDialog.open();
		});

		QUnit.test("when AddElementsDialog is initialized with more than 1000 elements, an error is thrown", function(assert) {
			const aElements = createManyElements(1001);
			const oOversizedDialog = new AddElementsDialog({ title: "Oversized Dialog" });
			assert.throws(
				function() {
					oOversizedDialog.setElements(aElements);
				},
				new Error("AddElementsDialog: displaying more than 1000 elements is not supported."),
				"then an error is thrown"
			);
			oOversizedDialog.destroy();
		});
	});

	QUnit.module("Given that a AddElementsDialog with entityTypeDisplayName grouping is available...", {
		beforeEach() {
			this.oAddElementsDialog = createDialogWithEntityGroups();
		},
		afterEach() {
			this.oAddElementsDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when AddElementsDialog gets initialized with elements having entityTypeDisplayName", function(assert) {
			const done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Root elements (without entityTypeDisplayName) should be at the top
				// followed by group headers and their elements
				const aItems = this._oList.getItems();

				// Should have: 2 root elements + 2 group headers + 3 grouped elements = 7 items
				assert.equal(aItems.length, 7, "then 7 items are shown (2 root + 2 headers + 3 grouped)");

				// Check root elements are first
				assert.notOk(isGroupHeader(aItems[0]), "then first item is not a group header");
				assert.equal(getItemLabelText(aItems[0]), "rootField1", "then first item is rootField1");

				assert.notOk(isGroupHeader(aItems[1]), "then second item is not a group header");
				assert.equal(getItemLabelText(aItems[1]), "rootField2", "then second item is rootField2");

				// Check first group header (Entity A)
				assert.ok(isGroupHeader(aItems[2]), "then third item is a group header");
				assert.equal(getItemLabelText(aItems[2]), "Entity A", "then third item is Entity A group header");

				// Check Entity A elements
				assert.notOk(isGroupHeader(aItems[3]), "then fourth item is not a group header");
				assert.equal(getItemLabelText(aItems[3]), "entityAField1", "then fourth item is entityAField1");

				assert.notOk(isGroupHeader(aItems[4]), "then fifth item is not a group header");
				assert.equal(getItemLabelText(aItems[4]), "entityAField2", "then fifth item is entityAField2");

				// Check second group header (Entity B)
				assert.ok(isGroupHeader(aItems[5]), "then sixth item is a group header");
				assert.equal(getItemLabelText(aItems[5]), "Entity B", "then sixth item is Entity B group header");

				// Check Entity B elements
				assert.notOk(isGroupHeader(aItems[6]), "then seventh item is not a group header");
				assert.equal(getItemLabelText(aItems[6]), "entityBField1", "then seventh item is entityBField1");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when filtering with entityTypeDisplayName groups, only matching elements and their groups are shown", function(assert) {
			const done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Filter for "entityA"
				this._updateModelFilter({ getParameter() {return "entityA";} });

				const aItems = this._oList.getItems();
				// Should show Entity A header + 2 matching elements = 3 items
				assert.equal(aItems.length, 3, "then 3 items are shown");
				assert.ok(isGroupHeader(aItems[0]), "then first item is Entity A group header");
				assert.equal(getItemLabelText(aItems[0]), "Entity A", "then first item is Entity A");
				assert.equal(getItemLabelText(aItems[1]), "entityAField1", "then second item is entityAField1");
				assert.equal(getItemLabelText(aItems[2]), "entityAField2", "then third item is entityAField2");

				// Clear filter
				this._updateModelFilter({ getParameter() {return null;} });
				assert.equal(this._oList.getItems().length, 7, "then all 7 items are shown again");

				// Filter for "root"
				this._updateModelFilter({ getParameter() {return "root";} });
				assert.equal(this._oList.getItems().length, 2, "then 2 root elements are shown");
				assert.equal(getItemLabelText(this._oList.getItems()[0]), "rootField1", "then rootField1 is shown");
				assert.equal(getItemLabelText(this._oList.getItems()[1]), "rootField2", "then rootField2 is shown");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when sorting with entityTypeDisplayName groups, elements are sorted within their groups", function(assert) {
			const done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Initial order: rootField1, rootField2, Entity A header, entityAField1, entityAField2, Entity B header, entityBField1
				assert.equal(getItemLabelText(this._oList.getItems()[0]), "rootField1", "then rootField1 is first initially");
				assert.equal(getItemLabelText(this._oList.getItems()[2]), "Entity A", "then Entity A header is third initially");

				// Resort (descending)
				this._resortList();

				// After descending sort:
				// rootField2, rootField1, Entity B header, entityBField1, Entity A header, entityAField2, entityAField1
				assert.equal(getItemLabelText(this._oList.getItems()[0]), "rootField2", "then rootField2 is first after descending sort");
				assert.equal(getItemLabelText(this._oList.getItems()[1]), "rootField1", "then rootField1 is second after descending sort");
				assert.equal(
					getItemLabelText(this._oList.getItems()[2]), "Entity B", "then Entity B header is third after descending sort"
				);
				assert.equal(
					getItemLabelText(this._oList.getItems()[4]), "Entity A", "then Entity A header is fifth after descending sort"
				);

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when selecting elements, getSelectedElements returns only selected non-header elements", function(assert) {
			const done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Initially no elements are selected
				assert.equal(this.getSelectedElements().length, 0, "then no elements are selected initially");

				// Select rootField1 (index 0) via model
				const aElements = this.getElements();
				aElements[0].selected = true; // rootField1
				aElements[2].selected = true; // entityAField1
				this._oDialogModel.refresh(true);

				const aSelectedElements = this.getSelectedElements();
				assert.equal(aSelectedElements.length, 2, "then 2 elements are selected");
				assert.ok(
					aSelectedElements.some((el) => el.label === "rootField1"),
					"then rootField1 is in selected elements"
				);
				assert.ok(
					aSelectedElements.some((el) => el.label === "entityAField1"),
					"then entityAField1 is in selected elements"
				);

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when group headers have no checkbox (GroupHeaderListItem)", function(assert) {
			const done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				const aItems = this._oList.getItems();

				// Find group headers and verify they are GroupHeaderListItem (which doesn't have checkbox in MultiSelect mode)
				const aGroupHeaders = aItems.filter((oItem) => isGroupHeader(oItem));
				assert.equal(aGroupHeaders.length, 2, "then there are 2 group headers");

				aGroupHeaders.forEach(function(oHeader) {
					assert.ok(oHeader.isA("sap.m.GroupHeaderListItem"), "then group header is a GroupHeaderListItem");
				});

				done();
			});
			this.oAddElementsDialog.open();
		});
	});

	QUnit.module("Given that a AddElementsDialog with search text highlighting is available...", {
		beforeEach() {
			this.oAddElementsDialog = createDialog();
		},
		afterEach() {
			this.oAddElementsDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		/**
		 * Helper function to get the HTML text from a list item's first FormattedText
		 * @param {sap.m.ListItemBase} oItem - The list item
		 * @returns {string} The HTML text or empty string
		 */
		function getItemHtmlText(oItem) {
			if (oItem.getContent) {
				const aContent = oItem.getContent();
				if (aContent.length > 0 && aContent[0].getItems) {
					const oFirstItem = aContent[0].getItems()[0];
					if (oFirstItem.getHtmlText) {
						return oFirstItem.getHtmlText();
					}
				}
			}
			return "";
		}

		QUnit.test("when filtering, the matching text should be highlighted with strong tags", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Filter for "label"
				this._updateModelFilter({ getParameter() {return "label";} });

				const aItems = this._oList.getItems();
				assert.equal(aItems.length, 5, "then all 5 items match the filter");

				// Check that the first item has highlighted text
				const sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>"), "then the HTML contains <strong> tag");
				assert.ok(sHtmlText.includes("</strong>"), "then the HTML contains </strong> tag");
				assert.ok(sHtmlText.includes("<strong>label</strong>"), "then 'label' is wrapped in strong tags");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when filtering with partial match, only the matching part should be highlighted", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Filter for "bel" (partial match of "label")
				this._updateModelFilter({ getParameter() {return "bel";} });

				const aItems = this._oList.getItems();
				const sHtmlText = getItemHtmlText(aItems[0]);

				// Should be "la<strong>bel</strong>1"
				assert.ok(sHtmlText.includes("la<strong>bel</strong>"), "then only 'bel' is highlighted");
				assert.notOk(sHtmlText.includes("<strong>label</strong>"), "then 'label' is not fully highlighted");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when filtering is case-insensitive, the highlight should preserve original case", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Filter for "LABEL" (uppercase)
				this._updateModelFilter({ getParameter() {return "LABEL";} });

				const aItems = this._oList.getItems();
				const sHtmlText = getItemHtmlText(aItems[0]);

				// Should highlight "label" (original case) not "LABEL"
				assert.ok(sHtmlText.includes("<strong>label</strong>"), "then the original case 'label' is highlighted");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when filter is cleared, text should not have highlighting", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// First apply filter
				this._updateModelFilter({ getParameter() {return "label";} });

				// Then clear filter
				this._updateModelFilter({ getParameter() {return null;} });

				const aItems = this._oList.getItems();
				const sHtmlText = getItemHtmlText(aItems[0]);

				// Should not have any strong tags
				assert.notOk(sHtmlText.includes("<strong>"), "then the HTML does not contain <strong> tag");
				assert.equal(sHtmlText, "label1", "then the text is plain without highlighting");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when filtering matches originalLabel, it should be highlighted too", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Filter for "orig" (matches originalLabel)
				this._updateModelFilter({ getParameter() {return "orig";} });

				const aItems = this._oList.getItems();
				assert.equal(aItems.length, 1, "then 1 item matches the filter");

				// Get the second FormattedText (original label)
				const oVBox = aItems[0].getContent()[0];
				const oOriginalLabelItem = oVBox.getItems()[1];
				const sOriginalHtmlText = oOriginalLabelItem.getHtmlText();

				assert.ok(sOriginalHtmlText.includes("<strong>orig</strong>"), "then 'orig' is highlighted in the original label");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when filtering matches parentPropertyName for duplicates, it should be highlighted", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Filter for "duplicate" (matches parentPropertyName of item with duplicateName=true)
				this._updateModelFilter({ getParameter() {return "duplicate";} });

				const aItems = this._oList.getItems();
				assert.equal(aItems.length, 1, "then 1 item matches the filter");

				const sHtmlText = getItemHtmlText(aItems[0]);
				// Should highlight "duplicate" in "label4 (duplicateComplexPropName)"
				assert.ok(sHtmlText.includes("<strong>duplicate</strong>"), "then 'duplicate' is highlighted in the label");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when text contains special HTML characters, they should be escaped", function(assert) {
			var done = assert.async();

			// Create a dialog with special characters in label
			var oSpecialDialog = new AddElementsDialog({ title: "test" });
			oSpecialDialog.setElements([
				{
					selected: false,
					label: "Label <script>alert('xss')</script>",
					tooltip: "tooltip",
					name: "field1",
					type: "odata"
				}
			]);

			oSpecialDialog.attachOpened(function() {
				const aItems = this._oList.getItems();
				const sHtmlText = getItemHtmlText(aItems[0]);

				// Script tags should be escaped
				assert.notOk(sHtmlText.includes("<script>"), "then <script> tag is escaped");
				assert.ok(sHtmlText.includes("&lt;script&gt;"), "then script tag is HTML encoded");

				oSpecialDialog.destroy();
				done();
			});
			oSpecialDialog.open();
		});

		QUnit.test("when filtering with multiple occurrences, all should be highlighted", function(assert) {
			var done = assert.async();

			// Create a dialog with repeated text in label
			var oRepeatDialog = new AddElementsDialog({ title: "test" });
			oRepeatDialog.setElements([
				{
					selected: false,
					label: "test test test",
					tooltip: "tooltip",
					name: "field1",
					type: "odata"
				}
			]);

			oRepeatDialog.attachOpened(function() {
				// Filter for "test"
				this._updateModelFilter({ getParameter() {return "test";} });

				const aItems = this._oList.getItems();
				const sHtmlText = getItemHtmlText(aItems[0]);

				// Count occurrences of <strong>test</strong>
				const iHighlightCount = (sHtmlText.match(/<strong>test<\/strong>/g) || []).length;
				assert.equal(iHighlightCount, 3, "then all 3 occurrences of 'test' are highlighted");

				oRepeatDialog.destroy();
				done();
			});
			oRepeatDialog.open();
		});

		QUnit.test("when typing additional characters, highlighting should update incrementally", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Type "l" first
				this._updateModelFilter({ getParameter() {return "l";} });
				let aItems = this._oList.getItems();
				let sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>l</strong>"), "then 'l' is highlighted after typing 'l'");

				// Type "la" (adding 'a')
				this._updateModelFilter({ getParameter() {return "la";} });
				aItems = this._oList.getItems();
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>la</strong>"), "then 'la' is highlighted after typing 'la'");
				assert.notOk(sHtmlText.includes("<strong>l</strong>a"), "then it's not 'l' highlighted separately");

				// Type "lab" (adding 'b')
				this._updateModelFilter({ getParameter() {return "lab";} });
				aItems = this._oList.getItems();
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>lab</strong>"), "then 'lab' is highlighted after typing 'lab'");

				// Type "labe" (adding 'e')
				this._updateModelFilter({ getParameter() {return "labe";} });
				aItems = this._oList.getItems();
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>labe</strong>"), "then 'labe' is highlighted after typing 'labe'");

				// Type "label" (adding 'l')
				this._updateModelFilter({ getParameter() {return "label";} });
				aItems = this._oList.getItems();
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>label</strong>"), "then 'label' is highlighted after typing 'label'");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when erasing characters, highlighting and results should update correctly", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Start with "label"
				this._updateModelFilter({ getParameter() {return "label";} });
				let aItems = this._oList.getItems();
				assert.equal(aItems.length, 5, "then 5 items match 'label'");
				let sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>label</strong>"), "then 'label' is highlighted");

				// Erase to "labe"
				this._updateModelFilter({ getParameter() {return "labe";} });
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 5, "then still 5 items match 'labe'");
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>labe</strong>"), "then 'labe' is highlighted after erasing to 'labe'");
				assert.notOk(sHtmlText.includes("<strong>label</strong>"), "then 'label' is no longer fully highlighted");

				// Erase to "lab"
				this._updateModelFilter({ getParameter() {return "lab";} });
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 5, "then still 5 items match 'lab'");
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>lab</strong>"), "then 'lab' is highlighted after erasing to 'lab'");

				// Erase to "la"
				this._updateModelFilter({ getParameter() {return "la";} });
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 5, "then still 5 items match 'la'");
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>la</strong>"), "then 'la' is highlighted after erasing to 'la'");

				// Erase to "l"
				this._updateModelFilter({ getParameter() {return "l";} });
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 5, "then still 5 items match 'l'");
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>l</strong>"), "then 'l' is highlighted after erasing to 'l'");

				// Erase completely (empty filter)
				this._updateModelFilter({ getParameter() {return "";} });
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 5, "then all 5 items are shown with empty filter");
				sHtmlText = getItemHtmlText(aItems[0]);
				assert.notOk(sHtmlText.includes("<strong>"), "then no highlighting with empty filter");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when filter changes affect results, list updates correctly", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Filter for "label1" - should match only 1 item
				this._updateModelFilter({ getParameter() {return "label1";} });
				let aItems = this._oList.getItems();
				assert.equal(aItems.length, 1, "then 1 item matches 'label1'");
				assert.equal(getItemLabelText(aItems[0]), "label1", "then the matching item is label1");

				// Change to "label" - should match 5 items
				this._updateModelFilter({ getParameter() {return "label";} });
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 5, "then 5 items match 'label'");

				// Change to "label12" - should match 0 items
				this._updateModelFilter({ getParameter() {return "label12";} });
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 0, "then 0 items match 'label12'");

				// Go back to "label1" - should match 1 item again
				this._updateModelFilter({ getParameter() {return "label1";} });
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 1, "then 1 item matches 'label1' again");
				const sHtmlText = getItemHtmlText(aItems[0]);
				assert.ok(sHtmlText.includes("<strong>label1</strong>"), "then 'label1' is highlighted");

				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when setElements is called, filter should be reset", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				// Apply a filter that shows only 1 item
				this._updateModelFilter({ getParameter() {return "label1";} });
				let aItems = this._oList.getItems();
				assert.equal(aItems.length, 1, "then 1 item matches the initial filter");
				assert.equal(this._sCurrentFilterValue, "label1", "then the filter value is set");

				// Simulate reopening the dialog by calling setElements with same elements
				// (this happens when dialog is closed and reopened)
				this.setElements([
					{ selected: false, label: "newLabel1", tooltip: "tooltip1", name: "field1", type: "odata" },
					{ selected: false, label: "newLabel2", tooltip: "tooltip2", name: "field2", type: "odata" },
					{ selected: false, label: "newLabel3", tooltip: "tooltip3", name: "field3", type: "odata" }
				]);

				// Filter should be reset
				assert.equal(this._sCurrentFilterValue, "", "then the filter value is reset to empty");

				// Rebind the list to apply the new elements
				this._rebindList();

				// All items should be shown (not filtered by the old filter value)
				aItems = this._oList.getItems();
				assert.equal(aItems.length, 3, "then all 3 new elements are shown without filtering");

				// Check that there's no highlighting (since filter is empty)
				const sHtmlText = getItemHtmlText(aItems[0]);
				assert.notOk(sHtmlText.includes("<strong>"), "then no highlighting is present");
				assert.equal(sHtmlText, "newLabel1", "then the text is plain without highlighting");

				done();
			});
			this.oAddElementsDialog.open();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});