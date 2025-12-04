/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/SelectionPlugin"
], function(
	TableQUnitUtils,
	SelectionPlugin
) {
	"use strict";

	const TestPlugin = SelectionPlugin.extend("sap.ui.table.test.SelectionPlugin.TestSelectionPlugin", {
		metadata: {
			properties: {
				headerSelectorType: {type: "string", defaultValue: "checkbox"},
				headerSelectorVisible: {type: "boolean", defaultValue: true},
				headerSelectorEnabled: {type: "boolean", defaultValue: true},
				headerSelectorSelected: {type: "boolean", defaultValue: false},
				headerSelectorIcon: {type: "string", defaultValue: null},
				headerSelectorTooltip: {type: "string", defaultValue: "Test Tooltip"}
			}
		},
		isSelected: () => false,
		onActivate: function() {
			SelectionPlugin.prototype.onActivate.apply(this, arguments);

			const oHeaderSelector = this._getHeaderSelector();

			oHeaderSelector?.setType(this.getHeaderSelectorType());
			oHeaderSelector?.setVisible(this.getHeaderSelectorVisible());
			oHeaderSelector?.setEnabled(this.getHeaderSelectorEnabled());
			oHeaderSelector?.setSelected(this.getHeaderSelectorSelected());
			oHeaderSelector?.setIcon(this.getHeaderSelectorIcon());
			oHeaderSelector?.setTooltip(this.getHeaderSelectorTooltip());
		}
	});

	QUnit.module("HeaderSelector Configuration");

	QUnit.test("Initial plugin", function(assert) {
		const oTable = TableQUnitUtils.createTable({
			dependents: [
				new TestPlugin({
					headerSelectorType: "custom",
					headerSelectorVisible: true,
					headerSelectorEnabled: false,
					headerSelectorSelected: true,
					headerSelectorIcon: "sap-icon://accept",
					headerSelectorTooltip: "Custom Tooltip"
				})
			]
		});
		const oHeaderSelector = oTable._getHeaderSelector();

		assert.strictEqual(oHeaderSelector.getType(), "custom", "HeaderSelector type correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "HeaderSelector visible correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getEnabled(), false, "HeaderSelector enabled correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getSelected(), true, "HeaderSelector selected correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getIcon(), "sap-icon://accept", "HeaderSelector icon correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getTooltip(), "Custom Tooltip", "HeaderSelector tooltip correctly set by plugin");

		oTable.destroy();
	});

	QUnit.test("Plugin added after table initialization", function(assert) {
		const oTable = TableQUnitUtils.createTable();
		const oHeaderSelector = oTable._getHeaderSelector();

		const mProperties = oHeaderSelector.getMetadata().getProperties();
		assert.strictEqual(oHeaderSelector.getType(), mProperties["type"].getDefaultValue(), "HeaderSelector type is default");
		assert.strictEqual(oHeaderSelector.getVisible(), mProperties["visible"].getDefaultValue(), "HeaderSelector visible is default");
		assert.strictEqual(oHeaderSelector.getEnabled(), mProperties["enabled"].getDefaultValue(), "HeaderSelector enabled is default");
		assert.strictEqual(oHeaderSelector.getSelected(), mProperties["selected"].getDefaultValue(), "HeaderSelector selected is default");
		assert.strictEqual(oHeaderSelector.getIcon(), mProperties["icon"].getDefaultValue(), "HeaderSelector icon is default");
		assert.strictEqual(oHeaderSelector.getTooltip(), null, "HeaderSelector tooltip is default");

		oTable.addDependent(new TestPlugin({
			headerSelectorType: "custom",
			headerSelectorVisible: true,
			headerSelectorEnabled: false,
			headerSelectorSelected: true,
			headerSelectorIcon: "sap-icon://decline",
			headerSelectorTooltip: "Custom Tooltip"
		}));

		assert.strictEqual(oHeaderSelector.getType(), "custom", "HeaderSelector type correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "HeaderSelector visible correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getEnabled(), false, "HeaderSelector enabled correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getSelected(), true, "HeaderSelector selected correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getIcon(), "sap-icon://decline", "HeaderSelector icon correctly set by plugin");
		assert.strictEqual(oHeaderSelector.getTooltip(), "Custom Tooltip", "HeaderSelector tooltip correctly set by plugin");

		oTable.destroy();
	});

	QUnit.test("Plugin replaced", function(assert) {
		const oPlugin = new TestPlugin();
		const oTable = TableQUnitUtils.createTable({
			dependents: [oPlugin]
		});
		const oHeaderSelector = oTable._getHeaderSelector();

		// Remove first plugin and add second plugin with different configuration
		oTable.removeDependent(oPlugin);
		oTable.addDependent(new TestPlugin({
			headerSelectorType: "custom",
			headerSelectorVisible: true,
			headerSelectorEnabled: false,
			headerSelectorSelected: true,
			headerSelectorIcon: "sap-icon://accept",
			headerSelectorTooltip: "Different Tooltip"
		}));

		assert.strictEqual(oHeaderSelector.getType(), "custom", "Type changed to custom");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "Visible remains true");
		assert.strictEqual(oHeaderSelector.getEnabled(), false, "Enabled changed to false");
		assert.strictEqual(oHeaderSelector.getSelected(), true, "Selected changed to true");
		assert.strictEqual(oHeaderSelector.getIcon(), "sap-icon://accept", "Icon is set correctly");
		assert.strictEqual(oHeaderSelector.getTooltip(), "Different Tooltip", "Tooltip changed correctly");

		oPlugin.destroy();
		oTable.destroy();
	});

	QUnit.test("New main plugin added", function(assert) {
		const oTable = TableQUnitUtils.createTable({
			dependents: [new TestPlugin()]
		});
		const oHeaderSelector = oTable._getHeaderSelector();

		// Add new main plugin
		oTable.insertDependent(new TestPlugin({
			headerSelectorType: "custom",
			headerSelectorVisible: true,
			headerSelectorEnabled: false,
			headerSelectorSelected: true,
			headerSelectorIcon: "sap-icon://accept",
			headerSelectorTooltip: "New Tooltip"
		}), 0);

		assert.strictEqual(oHeaderSelector.getType(), "custom", "Type changed to custom");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "Visible remains true");
		assert.strictEqual(oHeaderSelector.getEnabled(), false, "Enabled changed to false");
		assert.strictEqual(oHeaderSelector.getSelected(), true, "Selected changed to true");
		assert.strictEqual(oHeaderSelector.getIcon(), "sap-icon://accept", "Icon is set correctly");
		assert.strictEqual(oHeaderSelector.getTooltip(), "New Tooltip", "Tooltip changed correctly");

		oTable.destroy();
	});

	QUnit.test("Plugin removed", function(assert) {
		const oPlugin = new TestPlugin({
			headerSelectorType: "custom",
			headerSelectorVisible: true,
			headerSelectorEnabled: false,
			headerSelectorSelected: true,
			headerSelectorIcon: "sap-icon://accept",
			headerSelectorTooltip: "Custom Tooltip"
		});
		const oTable = TableQUnitUtils.createTable({
			dependents: [oPlugin]
		});
		const oHeaderSelector = oTable._getHeaderSelector();

		oTable.removeDependent(oPlugin);

		const mProperties = oHeaderSelector.getMetadata().getProperties();
		assert.strictEqual(oHeaderSelector.getType(), mProperties["type"].getDefaultValue(), "HeaderSelector type is default");
		assert.strictEqual(oHeaderSelector.getVisible(), mProperties["visible"].getDefaultValue(), "HeaderSelector visible is default");
		assert.strictEqual(oHeaderSelector.getEnabled(), mProperties["enabled"].getDefaultValue(), "HeaderSelector enabled is default");
		assert.strictEqual(oHeaderSelector.getSelected(), mProperties["selected"].getDefaultValue(), "HeaderSelector selected is default");
		assert.strictEqual(oHeaderSelector.getIcon(), mProperties["icon"].getDefaultValue(), "HeaderSelector icon is default");
		assert.strictEqual(oHeaderSelector.getTooltip(), null, "HeaderSelector tooltip is default");

		oPlugin.destroy();
		oTable.destroy();
	});

	QUnit.test("Plugin deactivated", function(assert) {
		const oTable = TableQUnitUtils.createTable({
			dependents: [
				new TestPlugin({
					headerSelectorType: "custom",
					headerSelectorVisible: true,
					headerSelectorEnabled: false,
					headerSelectorSelected: true,
					headerSelectorIcon: "sap-icon://accept",
					headerSelectorTooltip: "Custom Tooltip"
				})
			]
		});
		const oHeaderSelector = oTable._getHeaderSelector();

		oTable.getDependents()[0].setEnabled(false);

		assert.strictEqual(oHeaderSelector.getType(), "custom", "HeaderSelector type");
		assert.strictEqual(oHeaderSelector.getVisible(), false, "HeaderSelector visible");
		assert.strictEqual(oHeaderSelector.getEnabled(), false, "HeaderSelector enabled");
		assert.strictEqual(oHeaderSelector.getSelected(), true, "HeaderSelector selected");
		assert.strictEqual(oHeaderSelector.getIcon(), "sap-icon://accept", "HeaderSelector icon");
		assert.strictEqual(oHeaderSelector.getTooltip(), "Custom Tooltip", "HeaderSelector tooltip");
		oTable.destroy();
	});
});