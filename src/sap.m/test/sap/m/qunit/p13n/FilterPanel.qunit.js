/* global QUnit */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/m/p13n/FilterPanel",
    "sap/ui/test/utils/nextUIUpdate",
    "sap/m/VBox",
    "sap/m/Input"
], function(Element, FilterPanel, nextUIUpdate, VBox, Input) {
	"use strict";

    const getTestData = function() {
        return [
            {
                active: false,
                key: "key1",
                name: "key1",
                label: "Field 1"
            },
            {
                active: false,
                key: "key2",
                name: "key2",
                label: "Field 2"
            },
            {
                active: false,
                key: "key3",
                name: "key3",
                label: "Field 3",
                tooltip: "Some tooltip"
            },
            {
                active: false,
                key: "key4",
                name: "key4",
                label: "Field 4"
            }
        ];
    };

	QUnit.module("FilterPanel API tests", {
		beforeEach: async function(){
            this.oFilterPanel = new FilterPanel({
                itemFactory: function(oP13nItem) {
                    return new Input(oP13nItem.name, {

                    });
                }
            });
            this.oFilterPanel.placeAt("qunit-fixture");
            await nextUIUpdate();
		},
		afterEach: function(){
            this.oFilterPanel.destroy();
            this.oFilterPanel = null;
		}
	});

    QUnit.test("instantiate FilterPanel with itemFactory", function(assert){
		assert.ok(this.oFilterPanel, "FilterPanel is instanciable");
	});

    QUnit.test("Check #setP13nData without active fields", function(assert){
        const aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);

        assert.equal(this.oFilterPanel.getP13nData(true).length, 0, "There are no active items present in the panel");
    });

    QUnit.test("Check #setP13nData without active fields", function(assert){
        const aTestData = getTestData();
        aTestData[1].active = true;//set key2 to active
        this.oFilterPanel.setP13nData(aTestData);

        assert.equal(this.oFilterPanel.getP13nData(true).length, 1, "There is one item present in the panel");

        const aRows = this.oFilterPanel._oListControl.getItems();
        const oInputKey2 = this.oFilterPanel._getFactoryControlForRow(aRows[0]);
        assert.equal(oInputKey2.getId(), "key2", "The factory control has been created");
        oInputKey2.destroy();
    });

    QUnit.test("Check #setP13nData to reset an active field", function(assert){
        let aTestData = getTestData();
        aTestData[1].active = true;//set key2 to active
        this.oFilterPanel.setP13nData(aTestData);
        let aRows = this.oFilterPanel._oListControl.getItems();
        const oInputKey2 = this.oFilterPanel._getFactoryControlForRow(aRows[0]);
        assert.equal(oInputKey2.getId(), "key2", "The factory control has been created");

        aTestData = getTestData(); //All fields inactive again
        this.oFilterPanel.setP13nData(aTestData);
        aRows = this.oFilterPanel._oListControl.getItems();
        assert.equal(aRows.length, 1, "The active row has been removed again");

        assert.notOk(oInputKey2.bIsDestroyed, "The control has not been destroyed by the panel as the lifecyle needs to be handled by the consumer");

        oInputKey2.destroy();
    });

    QUnit.test("Check that #_selectKey creates a new factory control", function(assert){
        const aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);
        let aRows = this.oFilterPanel._oListControl.getItems();

        const oComboBox = aRows[0].getContent()[0].getContent()[0];
        oComboBox.setSelectedKey("key2");
        oComboBox.fireSelectionChange({
            source: oComboBox
        });
        oComboBox.fireChange({
            source: oComboBox,
            newValue: "key2"
        });

        aRows = this.oFilterPanel._oListControl.getItems();
        assert.equal(aRows.length, 2, "The item has been added through the ComboBox event handling");
    });

    QUnit.test("Check value state handling by entering invalid values", function(assert){
        const aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);
        let aRows = this.oFilterPanel._oListControl.getItems();

        let oComboBox = aRows[0].getContent()[0].getContent()[0];

        //Enter some invalid value --> Error
        oComboBox.fireChange({
            source: oComboBox,
            newValue: "someInvalidValue"
        });
        aRows = this.oFilterPanel._oListControl.getItems();
        oComboBox = aRows[0].getContent()[0].getContent()[0];
        assert.equal(oComboBox.getValueState(), "Error", "The value state has been set as expected");

        //Clear the invalid value --> no Error value state
        oComboBox.fireChange({
            source: oComboBox,
            newValue: ""
        });
        assert.equal(oComboBox.getValueState(), "None", "The value state has been set as expected");
    });

    QUnit.test("Check labelFor reference on label (W/O getIdForLabel)", function(assert){
        const aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);

        const sKey = "key2";

        const oFieldBox = this.oFilterPanel._createRowContainer("Field 2", sKey);
        const oFilterItem = this.oFilterPanel._createFactoryControl({name: sKey});
        this.oFilterPanel._setLabelForOnBox(oFilterItem, oFieldBox);

        assert.ok(oFieldBox.getItems()[0].getLabelFor(), "Set 'labelFor' reference on label control");
        oFilterItem.destroy();
    });

    QUnit.test("Check labelFor reference on label (WITH getIdForLabel)", function(assert){
        const aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);

        this.oFilterPanel.setItemFactory(function(sKey){
            const oContainer = new VBox({
                items: [
                    new Input("testAccInput", {})
                ]
            });

            oContainer.getIdForLabel = function() {
                return oContainer.getItems()[0].getId();
            };

            return oContainer;
        });

        const sKey = "key2";

        const oFieldBox = this.oFilterPanel._createRowContainer("Field 2", sKey);
        const oFilterItem = this.oFilterPanel._createFactoryControl({name: sKey});
        this.oFilterPanel._setLabelForOnBox(oFilterItem, oFieldBox);
        const sLabelFor = Element.getElementById(oFieldBox.getItems()[0].getLabelFor()).getIdForLabel();
        assert.equal(sLabelFor, "testAccInput", "Correct 'labelFor' reference on label control");
    });

    QUnit.test("Check tooltip functionality on field labels", function(assert){
        const aTestData = getTestData();
        // Activate the field with tooltip (key3/Field 3 has tooltip "Some tooltip")
        aTestData[2].active = true;
        this.oFilterPanel.setP13nData(aTestData);

        const aRows = this.oFilterPanel._oListControl.getItems();
        assert.equal(aRows.length, 2, "One active row and one empty row are present");

        // Get the label from the first active row (the field box contains the label)
        const oFieldBox = aRows[0].getContent()[0].getContent()[0];
        const oLabel = oFieldBox.getItems()[0];

        assert.equal(oLabel.getTooltip(), "Some tooltip", "Tooltip is correctly set on the field label");
        assert.equal(oLabel.getText(), "Field 3", "Label text is correct");
    });

    QUnit.test("Check tooltip functionality when selecting field via ComboBox", function(assert){
        const done = assert.async();
        const aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);

        let aRows = this.oFilterPanel._oListControl.getItems();
        const oComboBox = aRows[0].getContent()[0].getContent()[0];

        // Select the field with tooltip (key3/Field 3)
        oComboBox.setSelectedKey("key3");
        oComboBox.fireSelectionChange({
            source: oComboBox
        });
        oComboBox.fireChange({
            source: oComboBox,
            newValue: "Field 3"
        });

        // Wait for the async operations to complete
        setTimeout(() => {
            aRows = this.oFilterPanel._oListControl.getItems();

            // Get the newly created field box and its label
            const oFieldBox = aRows[0].getContent()[0].getContent()[0];
            const oLabel = oFieldBox.getItems()[0];

            assert.equal(oLabel.getTooltip(), "Some tooltip", "Tooltip is correctly applied when field is selected via ComboBox");
            assert.equal(oLabel.getText(), "Field 3", "Label text is correct for selected field");

            done();
        }, 100);
    });

    QUnit.test("Check tooltip functionality with field without tooltip", function(assert){
        const aTestData = getTestData();
        // Activate field without tooltip (key4/Field 4)
        aTestData[3].active = true;
        this.oFilterPanel.setP13nData(aTestData);

        const aRows = this.oFilterPanel._oListControl.getItems();
        const oFieldBox = aRows[0].getContent()[0].getContent()[0];
        const oLabel = oFieldBox.getItems()[0];

        assert.notOk(oLabel.getTooltip(), "No tooltip is set for field without tooltip property");
        assert.equal(oLabel.getText(), "Field 4", "Label text is correct for field without tooltip");
    });

	QUnit.test("GridData", function(assert){
        this.oFilterPanel.setP13nData(getTestData());
        let aRows = this.oFilterPanel._oListControl.getItems();
		let oGrid = aRows[0].getContent()[0];
        const oComboBox = oGrid.getContent()[0];

        assert.equal(oGrid.getDefaultSpan(), "XL4 L4 M4 S4", "Grid: Span");
		let oGridData = oComboBox.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL4 L4 M4 S10", "ComboBox: Span");

        oComboBox.setSelectedKey("key2");
        oComboBox.fireSelectionChange({
            source: oComboBox
        });
        oComboBox.fireChange({
            source: oComboBox,
            newValue: "key2"
        });

        aRows = this.oFilterPanel._oListControl.getItems();
		oGrid = aRows[0].getContent()[0];
		const oLabel = oGrid.getContent()[0];
		const oField = oGrid.getContent()[1];
		const oButtonBox = oGrid.getContent()[2];

		oGridData = oLabel.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL4 L4 M4 S10", "Label: Span");
		oGridData = oField.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL7 L7 M7 S10", "Field: Span");
		assert.ok(oGridData.getLinebreakS(), "Field: linebreakS");
		oGridData = oButtonBox.getLayoutData();
		assert.equal(oGridData.getSpan(), "XL1 L1 M1 S2", "ButtonBox: Span");
	});
});
