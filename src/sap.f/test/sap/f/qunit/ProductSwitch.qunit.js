/*global QUnit*/
sap.ui.define(["sap/f/ProductSwitch", "sap/f/ProductSwitchItem", "sap/ui/core/Lib", "sap/ui/test/utils/nextUIUpdate"],
	function(ProductSwitch, ProductSwitchItem, Library, nextUIUpdate) {
		"use strict";

		const TESTS_DOM_CONTAINER = "qunit-fixture",
			oUtil = {
				getProductSwitchItem: function (sTitle, sSubTitle, sSrc) {
					return new ProductSwitchItem({
						title: sTitle,
						subTitle: sSubTitle,
						src: sSrc
					});
				},
				getProductSwitchItems: function (iCount) {
					const aCreatedItems = [];

					for (let i = 0; i < iCount; i++) {
						aCreatedItems.push(this.getProductSwitchItem("Title" + i, "SubTitle" + i, "sap-icon://home"));
					}

					return aCreatedItems;
				},
				getProductSwitch: function (iCount) {
					return new ProductSwitch({items: this.getProductSwitchItems(iCount)});
				}
			};

		QUnit.module("ProductSwitch - API ", {
			beforeEach: async function () {
				this.oProductSwitch = oUtil.getProductSwitch();
				this.oProductSwitch.placeAt(TESTS_DOM_CONTAINER);
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oProductSwitch.destroy();
				this.oProductSwitch = null;
			}
		});

		QUnit.test("Instantiation - ProductSwitch is created successfully", function (assert) {
			// Assert
			assert.ok(this.oProductSwitch, "The ProductSwitch is instantiated successfully");
		});

		QUnit.test("items aggregation - items are forwarded to the internal GridContainer", async function (assert) {
			// Assert
			assert.ok(this.oProductSwitch._getGridContainer(), "Internal aggregation for forwarding is instatiated.");
			assert.strictEqual(this.oProductSwitch.getItems().length, this.oProductSwitch._getGridContainer().getItems().length, "Items are succcessfully forwarded");

			// Act
			this.oProductSwitch.addItem(oUtil.getProductSwitchItem());
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oProductSwitch.getItems().length, this.oProductSwitch._getGridContainer().getItems().length, "Items are succcessfully forwarded");
		});

		QUnit.test("items aggregation forwarding - insertItem inserts at the correct position", async function (assert) {
			// Arrange
			const oItem = oUtil.getProductSwitchItem();

			// Act
			this.oProductSwitch.insertItem(oItem, 0);
			await nextUIUpdate();

			// Assert
			assert.equal(this.oProductSwitch._getGridContainer().getItems()[0], oItem, "insertItem is forwarded successfully");
			assert.equal(this.oProductSwitch.getItems()[0], oItem, "insertItem is executed successfully");
		});

		QUnit.test("items aggregation forwarding - removeItem removes an item from both aggregations", async function (assert) {
			// Arrange
			oUtil.getProductSwitchItems(5).forEach((oCreatedItem) => {
				this.oProductSwitch.addItem(oCreatedItem);
			});
			await nextUIUpdate();

			const oItem  = this.oProductSwitch.getItems()[0];

			assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) !== -1, "Item is in the forwarded items aggregation");
			assert.ok(this.oProductSwitch.getItems().indexOf(oItem) !== -1, "item is in the items aggregation");

			// Act
			this.oProductSwitch.removeItem(oItem);
			await nextUIUpdate();

			// Assert
			assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) === -1, "Change in the aggregation was forwarded correctly");
			assert.ok(this.oProductSwitch.getItems().indexOf(oItem) === -1, "Item was successfully removed");
		});

		QUnit.test("items aggregation forwarding - removeAllItems removes all items from both aggregations", async function (assert) {
			// Arrange
			const aItems = oUtil.getProductSwitchItems(5);

			aItems.forEach((oCreatedItem) => {
				this.oProductSwitch.addItem(oCreatedItem);
			});
			await nextUIUpdate();

			aItems.forEach((oItem) => {
				assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) !== -1, "Item is in the forwarded items aggregation");
				assert.ok(this.oProductSwitch.getItems().indexOf(oItem) !== -1, "item is in the items aggregation");
			});

			// Act
			this.oProductSwitch.removeAllItems();
			await nextUIUpdate();

			// Assert
			aItems.forEach((oItem) => {
				assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) === -1, "Change in the aggregation was forwarded correctly");
				assert.ok(this.oProductSwitch.getItems().indexOf(oItem) === -1, "Item was successfully removed");
			});
		});

		QUnit.test("items aggregation forwarding - destroyItems destroys all items in both aggregations", async function (assert) {
			// Arrange
			const aItems = oUtil.getProductSwitchItems(5);

			aItems.forEach((oCreatedItem) => {
				this.oProductSwitch.addItem(oCreatedItem);
			});
			await nextUIUpdate();

			aItems.forEach((oItem) => {
				assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) !== -1, "Item is in the forwarded items aggregation");
				assert.ok(this.oProductSwitch.getItems().indexOf(oItem) !== -1, "item is in the items aggregation");
			});

			// Act
			this.oProductSwitch.destroyItems();
			await nextUIUpdate();

			// Assert
			aItems.forEach((oItem) => {
				assert.ok(this.oProductSwitch._getGridContainer().getItems().indexOf(oItem) === -1, "Change in the aggregation was forwarded correctly");
				assert.ok(this.oProductSwitch.getItems().indexOf(oItem) === -1, "Item was successfully destroyed");
			});
		});

		QUnit.module("ProductSwitch - private methods ", {
			beforeEach: async function () {
				this.oProductSwitch = oUtil.getProductSwitch();
				this.oProductSwitch.placeAt(TESTS_DOM_CONTAINER);
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oProductSwitch.destroy();
				this.oProductSwitch = null;
			}
		});

		QUnit.test("Layout update after items count change - column count adjusts correctly", async function (assert) {
			// Arrange
			const oItem = oUtil.getProductSwitchItem();

			oUtil.getProductSwitchItems(6).forEach((oCreatedItem) => {
				this.oProductSwitch.addItem(oCreatedItem);
			});
			await nextUIUpdate();

			// Assert initial state
			assert.strictEqual(this.oProductSwitch._getGridContainer().getLayout().getColumns(), 3, "Layout columns are updated");

			// Act - add item to exceed 3-column threshold
			this.oProductSwitch.addItem(oItem);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oProductSwitch._getGridContainer().getLayout().getColumns(), 4, "Layout columns are updated");

			// Act - remove item to go back below threshold
			this.oProductSwitch.removeItem(oItem);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oProductSwitch._getGridContainer().getLayout().getColumns(), 3, "Layout columns are updated");
		});

		QUnit.module("ProductSwitch - Accessibility", {
			beforeEach: async function () {
				this.oProductSwitch = oUtil.getProductSwitch(5);
				this.oProductSwitch.placeAt(TESTS_DOM_CONTAINER);
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oProductSwitch.destroy();
				this.oProductSwitch = null;
			}
		});

		QUnit.test("Accessibility attributes - role and aria-label are set correctly on the container", function (assert) {
			// Arrange
			const $ProductSwitch = this.oProductSwitch.$(),
				oRb = Library.getResourceBundleFor("sap.f");

			// Assert
			assert.equal($ProductSwitch.attr("role"), "menu", "Role menu is set on the container");
			assert.equal($ProductSwitch.attr("aria-label"), oRb.getText("PRODUCTSWITCH_CONTAINER_LABEL"), "Container aria-label is set correctly");
		});

		QUnit.test("Accessibility - aria-setsize, aria-posinset and aria-checked are set correctly on items", async function (assert) {
			// Arrange
			const aItems = this.oProductSwitch.getItems(),
				iItemCount = aItems.length,
				oItem = aItems[3],
				$Item = oItem.$();

			// Assert initial ARIA positional attributes
			assert.equal($Item.attr("aria-setsize"), iItemCount, "aria-setsize has the correct value");
			assert.equal($Item.attr("aria-posinset"), "4", "aria-posinset has the correct value");

			// Act - select item
			this.oProductSwitch.setSelectedItem(oItem);

			// Assert
			assert.equal($Item.attr("aria-checked"), "true", "aria-checked is correctly set");

			// Act - force re-render
			this.oProductSwitch.invalidate();
			await nextUIUpdate();

			// Assert - checked state persists after re-render
			assert.equal($Item.attr("aria-checked"), "true", "aria-checked is still correctly set");
		});

	});
