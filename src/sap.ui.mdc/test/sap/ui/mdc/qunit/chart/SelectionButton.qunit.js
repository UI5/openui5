/* global QUnit */

sap.ui.define([
    "sap/ui/mdc/chart/ToolbarControlFactory"
], function(
    ToolbarControlFactory
) {
    "use strict";

    QUnit.module("private methods", {

        beforeEach: function() {
            this._oSelectionButton = ToolbarControlFactory.createChartTypeBtn("testSelectionButtonId");
        },

        afterEach: function() {
            if (this._oSelectionButton) {
                this._oSelectionButton.destroy();
            }
        }
    });

    QUnit.test("_createPopover should not create popover with fixed contentWidth", function(assert) {
        const done = assert.async();

        // Trigger openPopover to load async dependencies first
        this._oSelectionButton.openPopover();

        // Wait for async loading to complete
        this._oSelectionButton.oReadyPromise.then(() => {
            // Act
            const oPopover = this._oSelectionButton._createPopover();

            // Assert
            assert.ok(oPopover, "Popover is created");
            assert.notOk(oPopover.getContentWidth(), "contentWidth is not set");

            // Cleanup
            oPopover.destroy();
            done();
        });
    });

    QUnit.test("_createPopover should remove the aria role description of the list", function(assert) {
        const done = assert.async();

        // Trigger openPopover to load async dependencies first
        this._oSelectionButton.openPopover();

        // Wait for async loading to complete
        this._oSelectionButton.oReadyPromise.then(() => {
            // Act
            const oPopover = this._oSelectionButton._createPopover();
            const oList = oPopover.getContent().find((oContent) => oContent.isA("sap.m.List"));

            // Assert
            assert.ok(oList, "List is part of the popover content");
            assert.strictEqual(oList._sAriaRoleDescriptionKey, null, "The aria role description of the list is removed");

            // Cleanup
            oPopover.destroy();
            done();
        });
    });
});