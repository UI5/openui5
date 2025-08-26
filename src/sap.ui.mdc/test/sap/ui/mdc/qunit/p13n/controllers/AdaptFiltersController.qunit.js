/* global QUnit, sinon*/
sap.ui.define([
	"sap/ui/mdc/p13n/subcontroller/AdaptFiltersController",
    "sap/ui/mdc/filterbar/p13n/AdaptationFilterBar",
    "sap/ui/mdc/Control"
], function (AdaptFiltersController, AdaptationFilterBar, MDCControl) {
	"use strict";

    QUnit.module("determineValidationState",{
        beforeEach: function(){
            this.oControl = new MDCControl();
            AdaptationFilterBar.prototype._checkAdvancedParent = sinon.stub().returns(true);
            AdaptationFilterBar.prototype.isControlDelegateInitialized = sinon.stub().returns(true);
            AdaptationFilterBar.prototype.getControlDelegate = sinon.stub().returns({});
			this.oAdaptationFilterBar = new AdaptationFilterBar({
                adaptationControl: this.oControl
            });
		},
		afterEach: function(){
			this.oControl.destroy();
			this.oAdaptationFilterBar.destroy();
		}
    });

    QUnit.test("initAdaptationUI calls determineValidationState", function(assert){
        const done = assert.async();

        // arrange
        const oDetermineValidationStateSpy = sinon.spy();

        const oMockDelegate = {
            determineValidationState: oDetermineValidationStateSpy
        };

        this.oAdaptationFilterBar.setP13nData = sinon.stub();
        this.oAdaptationFilterBar.setLiveMode = sinon.stub();
        this.oAdaptationFilterBar.setProperty = sinon.stub();
        this.oAdaptationFilterBar.getTitle = sinon.stub();
        this.oAdaptationFilterBar.createFilterFields = sinon.stub().returns(Promise.resolve());
        this.oAdaptationFilterBar.awaitControlDelegate = sinon.stub().returns(Promise.resolve(oMockDelegate));

        const oMockAdaptationControl = {
            retrieveInbuiltFilter: sinon.stub().returns(Promise.resolve(this.oAdaptationFilterBar))
        };

        const oController = new AdaptFiltersController({
            control: oMockAdaptationControl
        });
        sinon.stub(oController, "getAdaptationControl").returns(oMockAdaptationControl);
        sinon.stub(oController, "mixInfoAndState").returns({ items: [] });

        const oMockPropertyHelper = {};

        // act
        oController.initAdaptationUI(oMockPropertyHelper).then(() => {
            // assert
            assert.ok(oDetermineValidationStateSpy.calledOnce, "determineValidationState was called");
            assert.ok(oDetermineValidationStateSpy.calledWith(this.oAdaptationFilterBar), "determineValidationState was called with the adaptation filter bar");

            // Clean up
            oController.destroy();
            done();
        }).catch((error) => {
            assert.ok(false, "initAdaptationUI should not fail: " + error.message);
            oController.destroy();
            done();
        });
    });

    QUnit.test("initAdaptationUI calls determineValidationState with getFilterDelegate", function(assert){
        const done = assert.async();

        // arrange
        const oDetermineValidationStateSpy = sinon.spy();

        const oMockFilterDelegate = {
            determineValidationState: oDetermineValidationStateSpy
        };

        const oGetFilterDelegateSpy = sinon.stub().returns(oMockFilterDelegate);

        const oMockDelegate = {
            getFilterDelegate: oGetFilterDelegateSpy
        };

        this.oAdaptationFilterBar.setP13nData = sinon.stub();
        this.oAdaptationFilterBar.setLiveMode = sinon.stub();
        this.oAdaptationFilterBar.setProperty = sinon.stub();
        this.oAdaptationFilterBar.getTitle = sinon.stub();
        this.oAdaptationFilterBar.createFilterFields = sinon.stub().returns(Promise.resolve());
        this.oAdaptationFilterBar.awaitControlDelegate = sinon.stub().returns(Promise.resolve(oMockDelegate));

        const oMockAdaptationControl = {
            retrieveInbuiltFilter: sinon.stub().returns(Promise.resolve(this.oAdaptationFilterBar))
        };

        const oController = new AdaptFiltersController({
            control: oMockAdaptationControl
        });
        sinon.stub(oController, "getAdaptationControl").returns(oMockAdaptationControl);
        sinon.stub(oController, "mixInfoAndState").returns({ items: [] });

        const oMockPropertyHelper = {};

        // act
        oController.initAdaptationUI(oMockPropertyHelper).then(() => {
            // assert
            assert.ok(oDetermineValidationStateSpy.calledOnce, "determineValidationState was called on the filter delegate");
            assert.ok(oDetermineValidationStateSpy.calledWith(this.oAdaptationFilterBar), "determineValidationState was called with the adaptation filter bar");

            // Clean up
            oController.destroy();
            done();
        }).catch((error) => {
            assert.ok(false, "initAdaptationUI should not fail: " + error.message);
            oController.destroy();
            done();
        });
    });

});
