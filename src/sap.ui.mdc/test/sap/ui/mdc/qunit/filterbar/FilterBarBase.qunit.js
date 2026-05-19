/* global QUnit, sinon*/

sap.ui.define([
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/DefaultTypeMap",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/Log",
    "sap/ui/core/Lib",
    "sap/ui/core/Core",
	"sap/ui/core/library"
], function (
	FilterBarBase, FilterField, DefaultTypeMap, ConditionValidated, OperatorName, nextUIUpdate, Log, Library, coreLibrary
) {
	"use strict";

	QUnit.module("FilterBarBase API tests", {
		beforeEach: function () {
			this.oFilterBarBase = new FilterBarBase({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
            });
		},
		afterEach: function () {
			this.oFilterBarBase.destroy();
            this.oFilterBarBase = undefined;
            this.oProperty1 = null;
		}
	});

	QUnit.test("instanciable", function (assert) {
        assert.ok(this.oFilterBarBase, "FilterBarBase instance created");
    });

    QUnit.test("getCurrentState returns conditions based on the persistence setting", function(assert){
        const done = assert.async();


        this.oFilterBarBase.setFilterConditions({
            "key1": [
                {
                  "operator": OperatorName.EQ,
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": ConditionValidated.Validated
                }
              ]
        });

        sinon.stub(this.oFilterBarBase, "_applyFilterConditionsChanges").returns(Promise.resolve());
        this.oFilterBarBase.initialized().then(function(){
            sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: this.oFilterBarBase.getTypeMap().getTypeConfig("sap.ui.model.type.String")});

            let oCurrentState = this.oFilterBarBase.getCurrentState();

            assert.ok(oCurrentState.filter, "The persistence for filter values is always enabled, current state will return filter conditions");


            oCurrentState = this.oFilterBarBase.getCurrentState();
            assert.ok(oCurrentState.filter, "The persistence for filter values is always enabled, current state will return filter conditions");

            done();
        }.bind(this));
    });

    QUnit.test("'getConditions' should always return the externalized conditions", function(assert){
        const done = assert.async();

        const oDummyCondition = {
            "key1": [
                {
                  "operator": OperatorName.EQ,
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": ConditionValidated.Validated
                }
              ]
        };


        this.oFilterBarBase.initialized().then(function(){

            sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: this.oFilterBarBase.getTypeMap().getTypeConfig("sap.ui.model.type.String")});

            this.oFilterBarBase._setXConditions(oDummyCondition)
            .then(function(){
				// simulate change appliance
				this.oFilterBarBase.setFilterConditions(this.oFilterBarBase._getXConditions());

                assert.deepEqual(oDummyCondition, this.oFilterBarBase.getConditions(), "Condition returned without persistence active");
                assert.ok(!this.oFilterBarBase.getConditions()["key1"][0].hasOwnProperty("isEmpty"), "External format");
                assert.ok(!this.oFilterBarBase._getXConditions()["key1"][0].hasOwnProperty("isEmpty"), "External format");
                assert.ok(this.oFilterBarBase.getInternalConditions()["key1"][0].hasOwnProperty("isEmpty"), "Internal format");

                done();
            }.bind(this));
        }.bind(this));

    });

    QUnit.test("check reaction to the FilterField 'submit' event", function(assert){
        const oFilterField = new FilterField({
					label: "Test"
				});
        sinon.stub(this.oFilterBarBase, "triggerSearch");

        assert.ok(!oFilterField.hasListeners("submit"), "FilterField should not have a event listener for 'submit'");

        let fPromiseResolved;
        const oPromise = new Promise(function(resolve) {
            fPromiseResolved = resolve;
        });
        this.oFilterBarBase.addFilterItem(oFilterField);

        const fCallback = function(oEvent) {
            setTimeout(function() { fPromiseResolved(); }, 100);
        };

        oFilterField.attachSubmit(fCallback);

        assert.ok(oFilterField.hasListeners("submit"), "FilterField should have a event listener for 'submit'");

        assert.ok(this.oFilterBarBase.triggerSearch.notCalled, "should not call 'triggerSearch' on FilterBar");
        oFilterField.fireSubmit({promise: Promise.resolve()});

        return oPromise.then(function() {
            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce, "should call 'triggerSearch' once on FilterBar");

            oFilterField.detachSubmit(fCallback);
            this.oFilterBarBase.removeFilterItem(oFilterField);

            assert.ok(!oFilterField.hasListeners("submit"), "FilterField should not have a event listener for 'submit'");

            oFilterField.destroy();
            this.oFilterBarBase.triggerSearch.restore();
        }.bind(this));

    });

    QUnit.test("check reaction to the basic search 'submit' event", function(assert){
        const oFilterField = new FilterField();
        sinon.stub(this.oFilterBarBase, "triggerSearch");

        assert.ok(!oFilterField.hasListeners("submit"));

        this.oFilterBarBase.setBasicSearchField(oFilterField);
        assert.ok(oFilterField.hasListeners("submit"));

		assert.ok(!this.oFilterBarBase.triggerSearch.called);
        oFilterField.fireSubmit({promise: Promise.resolve()});

        return this.oFilterBarBase.waitForInitialization().then(function() {
            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);

            this.oFilterBarBase.triggerSearch.restore();
        }.bind(this));

    });

    QUnit.test("check reaction to the basic search 'submit' with an filter change event", function(assert){
        let nIdx = 0;
        const oFilterField = new FilterField();

        let fTestPromiseResolve = null;
        const oTestPromise = new Promise(function(resolve) {
            fTestPromiseResolve = resolve;
        });

        sinon.stub(this.oFilterBarBase, "triggerSearch");
        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        sinon.stub(this.oFilterBarBase, "_retrieveMetadata").returns(Promise.resolve());
        this.oFilterBarBase._addConditionChange = function() {
            assert.equal(++nIdx, 1);
        };
        this.oFilterBarBase.triggerSearch = function() {
            assert.equal(++nIdx, 2);
            fTestPromiseResolve();
        };

        this.oFilterBarBase.setBasicSearchField(oFilterField);

        this.oFilterBarBase._handleConditionModelPropertyChange({ getParameter: function(sParam) {
            if (sParam === "path") {
                return "/conditions/$search";
            } else if (sParam === "value") {
                return [{
                    "operator": OperatorName.EQ,
                    "values": ["SomeTestValue"],
                    "validated": ConditionValidated.Validated
                }];
            }
        }});

        oFilterField.fireSubmit({promise: Promise.resolve()});

        return oTestPromise;
    });

    QUnit.test("check submit with liveMode and no changes", function(assert){

		let fPromiseResolved;
		let oPromise = new Promise(function(resolve) {
			fPromiseResolved = resolve;
		});

		const oFilterField = new FilterField();
		this.oFilterBarBase.addFilterItem(oFilterField);

		this.oFilterBarBase.setLiveMode(true);

		sinon.stub(this.oFilterBarBase, "triggerSearch").returns(fPromiseResolved());

		oFilterField.fireSubmit({ promise: Promise.resolve() });

		return oPromise.then(function() {
			assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);
			this.oFilterBarBase.triggerSearch.restore();

			this.oFilterBarBase.setLiveMode(false);
			oPromise = new Promise(function(resolve) {
				fPromiseResolved = resolve;
			});

			sinon.stub(this.oFilterBarBase, "triggerSearch").returns(fPromiseResolved());
			oFilterField.fireSubmit({ promise: Promise.resolve() });
			return oPromise.then(function() {
				assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);
				this.oFilterBarBase.triggerSearch.reset();
			}.bind(this));
		}.bind(this));
    });

    QUnit.test("check submit with changes and liveMode=true", function(assert){
		const done = assert.async();

		let fPromiseResolved;
		const oPromise = new Promise(function(resolve) {
			fPromiseResolved = resolve;
		});

		const oFilterField = new FilterField();
		this.oFilterBarBase.addFilterItem(oFilterField);

		this.oFilterBarBase.setLiveMode(true);

		sinon.stub(this.oFilterBarBase, '_hasAppliancePromises').callsFake(function fakeFn() {
			fPromiseResolved();
			return [Promise.resolve()];
		});

		oFilterField.fireSubmit({ promise: Promise.resolve() });
		oPromise.then(function() {
			assert.ok(!this.oFilterBarBase.triggerSearch.calledOnce);
			done();
		}.bind(this));
    });

    QUnit.test("check submit with changes and liveMode=false", function(assert){
		const done = assert.async();

		let fPromiseResolved;
		const oPromise = new Promise(function(resolve) {
			fPromiseResolved = resolve;
		});

		const oFilterField = new FilterField();
		this.oFilterBarBase.addFilterItem(oFilterField);

		this.oFilterBarBase.setLiveMode(false);

		sinon.stub(this.oFilterBarBase, '_hasAppliancePromises').callsFake(function fakeFn() {
			return [Promise.resolve()];
		});

		sinon.stub(this.oFilterBarBase, "triggerSearch").callsFake(function fakeFn() {
			fPromiseResolved();
		});
		oFilterField.fireSubmit({ promise: Promise.resolve() });
		oPromise.then(function() {
			assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);
			done();
		}.bind(this));
    });

	QUnit.test("Check error state management in live mode - multiple fields with errors", async function(assert){
		const done = assert.async();

		// Create two filter fields
		const oFilterField1 = new FilterField({
			propertyKey: "key1",
			dataType: "sap.ui.model.type.String",
			conditions: "{$filters>/conditions/key1}"
		});

		const oFilterField2 = new FilterField({
			propertyKey: "key2",
			dataType: "sap.ui.model.type.String",
			conditions: "{$filters>/conditions/key2}"
		});

		this.oFilterBarBase.addFilterItem(oFilterField1);
		this.oFilterBarBase.addFilterItem(oFilterField2);

		// Enable live mode
		this.oFilterBarBase.setLiveMode(true);

		let nFiltersChangedCount = 0;
		let aFiltersChangedEvents = [];
		let nSearchCount = 0;

		// Track filtersChanged events to verify lock behavior
		this.oFilterBarBase.attachFiltersChanged(function(oEvent) {
			nFiltersChangedCount++;
			aFiltersChangedEvents.push({
				count: nFiltersChangedCount,
				conditionsBased: oEvent.getParameter("conditionsBased")
			});
		});

		// Track search events to verify unlock behavior
		this.oFilterBarBase.attachSearch(function() {
			nSearchCount++;
		});

		// Helper function to wait for async operations
		const wait = (ms) => new Promise((resolve) => {setTimeout(resolve, ms);});

		await this.oFilterBarBase.initialized();
		await nextUIUpdate();

		// Clear initial events - these are from FilterBar initialization
		nFiltersChangedCount = 0;
		aFiltersChangedEvents = [];
		nSearchCount = 0;

		// Step 1: Set field1 to error state
		oFilterField1.setValueState("Error");
		oFilterField1.setValueStateText("Invalid value");
		oFilterField1.fireChange({
			value: "invalid",
			valid: false,
			promise: Promise.reject("Validation error").catch(() => {})
		});

		await wait(150);
		assert.ok(nFiltersChangedCount >= 1, "FiltersChanged event fired after field1 error");
		assert.ok(aFiltersChangedEvents[aFiltersChangedEvents.length - 1].conditionsBased,
			"Table locked after field1 has error");

		// Step 2: Set field2 to error state as well
		oFilterField2.setValueState("Error");
		oFilterField2.setValueStateText("Invalid value");
		oFilterField2.fireChange({
			value: "invalid2",
			valid: false,
			promise: Promise.reject("Validation error").catch(() => {})
		});

		await wait(150);
		assert.ok(aFiltersChangedEvents[aFiltersChangedEvents.length - 1].conditionsBased,
			"Table still locked after field2 also has error");

		// Step 3: Fix field2 - field1 still has error, table should stay locked
		const nCountBefore = nFiltersChangedCount;
		const nSearchCountBefore = nSearchCount;
		oFilterField2.setValueState("None");
		oFilterField2.fireChange({
			value: "valid",
			valid: true,
			promise: Promise.resolve([])
		});

		await wait(150);
		assert.ok(nFiltersChangedCount > nCountBefore,
			"FiltersChanged event fired after field2 is fixed");
		assert.ok(aFiltersChangedEvents[aFiltersChangedEvents.length - 1].conditionsBased,
			"Table STILL LOCKED because field1 still has error (BUG FIX VERIFICATION)");
		assert.equal(nSearchCount, nSearchCountBefore, "No search triggered while errors still exist");

		// Step 4: Fix field1 - no errors left, table should unlock via search
		const nSearchCountBeforeLastFix = nSearchCount;
		oFilterField1.setValueState("None");
		oFilterField1.fireChange({
			value: "valid",
			valid: true,
			promise: Promise.resolve([])
		});

		await wait(150);
		assert.ok(nSearchCount > nSearchCountBeforeLastFix, "Search event fired after all errors are fixed, triggering rebind which unlocks table");

		done();
	});

	QUnit.test("Check error state management with invalid input and value state", async function(assert){
		const done = assert.async();

		const oFilterField = new FilterField({
			propertyKey: "key1",
			dataType: "sap.ui.model.type.String",
			conditions: "{$filters>/conditions/key1}"
		});

		this.oFilterBarBase.addFilterItem(oFilterField);
		this.oFilterBarBase.setLiveMode(true);

		let lastLockState = null;
		let nSearchCount = 0;

		this.oFilterBarBase.attachFiltersChanged(function(oEvent) {
			lastLockState = oEvent.getParameter("conditionsBased");
		});

		this.oFilterBarBase.attachSearch(function() {
			nSearchCount++;
		});

		// Helper function to wait for async operations
		const wait = (ms) => new Promise((resolve) => {setTimeout(resolve, ms);});

		await this.oFilterBarBase.initialized();
		await nextUIUpdate();

		// Test with isInvalidInput
		sinon.stub(oFilterField, "isInvalidInput").returns(true);
		oFilterField.fireChange({
			value: "test",
			valid: false,
			promise: Promise.reject().catch(() => {})
		});

		await wait(150);
		assert.ok(lastLockState, "Table locked when field has invalid input");

		// Clear invalid input
		oFilterField.isInvalidInput.restore();
		sinon.stub(oFilterField, "isInvalidInput").returns(false);
		let nSearchCountBefore = nSearchCount;
		oFilterField.fireChange({
			value: "valid",
			valid: true,
			promise: Promise.resolve([])
		});

		await wait(150);
		assert.ok(nSearchCount > nSearchCountBefore, "Search triggered after invalid input is cleared, unlocking table via rebind");

		// Test with error value state
		oFilterField.setValueState("Error");
		oFilterField.setValueStateText("Custom error");
		oFilterField.fireChange({
			value: "test2",
			valid: false,
			promise: Promise.reject().catch(() => {})
		});

		await wait(150);
		assert.ok(lastLockState, "Table locked when field has error value state");

		// Clear error state
		oFilterField.setValueState("None");
		nSearchCountBefore = nSearchCount;
		oFilterField.fireChange({
			value: "valid2",
			valid: true,
			promise: Promise.resolve([])
		});

		await wait(150);
		assert.ok(nSearchCount > nSearchCountBefore, "Search triggered after error value state is cleared, unlocking table via rebind");

		done();
	});

	QUnit.test("Check that lock state updates when fields are removed in live mode", async function(assert){
		const done = assert.async();

		const oFilterField1 = new FilterField({
			propertyKey: "key1",
			dataType: "sap.ui.model.type.String",
			conditions: "{$filters>/conditions/key1}"
		});

		const oFilterField2 = new FilterField({
			propertyKey: "key2",
			dataType: "sap.ui.model.type.String",
			conditions: "{$filters>/conditions/key2}"
		});

		this.oFilterBarBase.addFilterItem(oFilterField1);
		this.oFilterBarBase.addFilterItem(oFilterField2);
		this.oFilterBarBase.setLiveMode(true);

		let lastLockState = null;
		let nSearchCount = 0;

		this.oFilterBarBase.attachFiltersChanged(function(oEvent) {
			lastLockState = oEvent.getParameter("conditionsBased");
		});

		this.oFilterBarBase.attachSearch(function() {
			nSearchCount++;
		});

		// Helper function to wait for async operations
		const wait = (ms) => new Promise((resolve) => {setTimeout(resolve, ms);});

		await this.oFilterBarBase.initialized();
		await nextUIUpdate();

		// Set both fields to error state using ValueState
		oFilterField1.setValueState("Error");
		oFilterField1.setValueStateText("Invalid value");
		oFilterField2.setValueState("Error");
		oFilterField2.setValueStateText("Invalid value");

		oFilterField1.fireChange({
			value: "invalid1",
			valid: false,
			promise: Promise.reject().catch(() => {})
		});

		await wait(150);
		assert.ok(lastLockState, "Table locked with field1 error");

		oFilterField2.fireChange({
			value: "invalid2",
			valid: false,
			promise: Promise.reject().catch(() => {})
		});

		await wait(150);
		assert.ok(lastLockState, "Table still locked with both fields in error");

		// Remove field1 while it has error - field2 still has error
		this.oFilterBarBase.removeFilterItem(oFilterField1);
		oFilterField1.destroy();

		// Fix field2 - now no error fields exist
		oFilterField2.setValueState("None");
		const nSearchCountBefore = nSearchCount;
		oFilterField2.fireChange({
			value: "valid",
			valid: true,
			promise: Promise.resolve([])
		});

		await wait(150);
		assert.ok(nSearchCount > nSearchCountBefore, "Search triggered after last error field is fixed, unlocking table via rebind");

		done();
	});

    QUnit.test("Check 'valid' promise - do not provide parameter", function(assert){
        const oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        const oValid = this.oFilterBarBase.validate();

        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed by default");
        });
    });

    QUnit.test("Check 'valid' promise - explicitly fire search", function(assert){
        const oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        const oValid = this.oFilterBarBase.triggerSearch();

        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed");
        });
    });

    QUnit.test("Check 'valid' promise - do not fire search", function(assert){
        const oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        const oValid = this.oFilterBarBase.validate(true);
        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 0, "No Search executed");
        });
    });

    QUnit.test("Check 'valid' promise - when called twice with same suppressSearch information", function(assert){
        const oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");
        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        let fResolveApplyChanges;
		this.oFilterBarBase._aOngoingChangeAppliance = [new Promise((resolve) => {
			fResolveApplyChanges = resolve;
		})];

        const oValid = this.oFilterBarBase.validate(true);

		const fDelayedFunction = function() {
			this.oFilterBarBase.validate(true);
			fResolveApplyChanges();
		};
        setTimeout(fDelayedFunction.bind(this), 300);

        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 0, "No Search executed");
        });
    });

    QUnit.test("Check 'valid' promise - when called twice with contradictionary suppressSearch information", function(assert){
        const oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");
        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        let fResolveApplyChanges;
		this.oFilterBarBase._aOngoingChangeAppliance = [new Promise((resolve) => {
			fResolveApplyChanges = resolve;
		})];

        const oValid = this.oFilterBarBase.validate(true);

		const fDelayedFunction = function() {
			this.oFilterBarBase.validate(false);
			fResolveApplyChanges();
		};
        setTimeout(fDelayedFunction.bind(this), 300);

        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed");
        });
    });

    QUnit.test("Check cleanup for search promise", function(assert){

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        const oValidPromise = this.oFilterBarBase.validate();

        return oValidPromise.then(function(){
            assert.ok(!this.oFilterBarBase._fResolvedSearchPromise, "Search resolve has been cleaned up");
            assert.ok(!this.oFilterBarBase._fRejectedSearchPromise, "Search reject has been cleaned up");
        }.bind(this));

    });

    QUnit.test("Check validate without/with existing metadata", function(assert){

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        sinon.stub(this.oFilterBarBase, "_retrieveMetadata").returns(Promise.resolve());
        sinon.stub(this.oFilterBarBase, '_validate').callsFake(function fakeFn() {
            this.oFilterBarBase._fResolvedSearchPromise();
            this.oFilterBarBase._fRejectedSearchPromise = null;
            this.oFilterBarBase._fResolvedSearchPromise = null;
        }.bind(this));

        sinon.stub(this.oFilterBarBase, "_hasRetrieveMetadataToBeCalled").returns(false);
        let oValidPromise = this.oFilterBarBase.validate();

        return oValidPromise.then(function(){
            assert.ok(!this.oFilterBarBase._retrieveMetadata.called);

            this.oFilterBarBase._hasRetrieveMetadataToBeCalled.restore();
            sinon.stub(this.oFilterBarBase, "_hasRetrieveMetadataToBeCalled").returns(true);

            oValidPromise = this.oFilterBarBase.validate();

            return oValidPromise.then(function(){
                assert.ok(this.oFilterBarBase._retrieveMetadata.calledOnce);
            }.bind(this));

        }.bind(this));
    });

    QUnit.test("Check cleanup for metadata promise", function(assert){

        const done = assert.async();

        this.oFilterBarBase._waitForMetadata().then(function(){
            assert.ok(!this.oFilterBarBase._fResolveMetadataApplied, "Metadata resolve has been cleaned up");

            done();
        }.bind(this));

    });

    QUnit.test("Check cleanup for initial filters promise", function(assert){

        sinon.stub(this.oFilterBarBase, "awaitPropertyHelper").returns(Promise.resolve());

        return this.oFilterBarBase.initialized().then(function(){
            assert.ok(!this.oFilterBarBase._fResolveInitialFiltersApplied, "Initial filter resolve has been cleaned up");
        }.bind(this));

    });

    QUnit.test("Check multiple onSearch calls", function(assert){

        let fnTriggerPromiseResolve = null;
        const oTriggerPromise = new Promise(function(resolve, reject) { fnTriggerPromiseResolve = resolve; });

        sinon.stub(this.oFilterBarBase, "triggerSearch").callsFake(function() {
            return oTriggerPromise;
        });

        assert.ok(!this.oFilterBarBase._bSearchPressed, "not yet set");


        this.oFilterBarBase.onSearch();
        assert.ok(this.oFilterBarBase._bSearchPressed, "should be set");

        this.oFilterBarBase.onSearch();
        assert.ok(this.oFilterBarBase._bSearchPressed, "should be set");

        fnTriggerPromiseResolve();
        return oTriggerPromise.then(function(){
            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce, "should be called once");
            assert.ok(!this.oFilterBarBase._bSearchPressed, "should be resetted");
        }.bind(this));

    });

    QUnit.test("Check _handleFilterItemSubmit", function(assert){
        sinon.stub(this.oFilterBarBase, "triggerSearch");

        let fnSubmitPromiseResolve = null;
        const fCallBack = function() {
            setTimeout(fnSubmitPromiseResolve, 100);
        };

        let oSubmitPromise = new Promise(function(resolve, reject) { fnSubmitPromiseResolve = resolve; });
        let oEvent = {
            getParameter: function() { fCallBack(); return Promise.resolve(); }
        };

        const done = assert.async();

        this.oFilterBarBase._handleFilterItemSubmit(oEvent);
        oSubmitPromise.then(function() {

            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce, "should be called once");

            let fnChangePromiseResolve = null;
            const oChangePromise = new Promise(function(resolve, reject) { fnChangePromiseResolve = resolve; });
            this.oFilterBarBase._aCollectedChangePromises = [ Promise.resolve(), Promise.resolve(), oChangePromise];

            oSubmitPromise = Promise.resolve();

            oEvent = {
               getParameter: function() { return oSubmitPromise; }
            };
            this.oFilterBarBase._handleFilterItemSubmit(oEvent);
            oSubmitPromise.then(function() {

                fnChangePromiseResolve();

                Promise.all(this.oFilterBarBase._aCollectedChangePromises).then(function() {
                    assert.ok(this.oFilterBarBase.triggerSearch.calledTwice, "should be called twice");
                    done();
                }.bind(this));
            }.bind(this));
        }.bind(this));
    });


    QUnit.test("Check _handleFilterItemSubmit with ongoing flex changes", function(assert){
        const done = assert.async();

        let fnSubmitPromiseResolve = null;
        const oSubmitPromise = new Promise(function(resolve, reject) { fnSubmitPromiseResolve = resolve; });
        const oEvent = {
            getParameter: function() { fnSubmitPromiseResolve(); return oSubmitPromise; }
        };

        let fnFlexPromiseResolve = null;
        const oFlexPromise = new Promise(function(resolve, reject) { fnFlexPromiseResolve = resolve; });
        sinon.stub(this.oFilterBarBase, "_getWaitForChangesPromise").returns(oFlexPromise);

        sinon.stub(this.oFilterBarBase, "_applyInitialFilterConditions").callsFake(function() {
            this.oFilterBarBase._bInitialFiltersApplied = true;
            this.oFilterBarBase._fResolveInitialFiltersApplied();
            this.oFilterBarBase._fResolveInitialFiltersApplied = null;
        }.bind(this));

        let nFiltersChangedCount = 0;
        let nSearchCount = 0;
        let bSearchCalledAfterFiltersChanged = false;

        const fSearch = function(oEvent) {
            nSearchCount++;
            if (nFiltersChangedCount > 0) {
                bSearchCalledAfterFiltersChanged = true;
            }

            // Verify search is called once at the end
            assert.equal(nSearchCount, 1, "Search should be called exactly once");
            assert.ok(bSearchCalledAfterFiltersChanged, "Search should be called after filtersChanged events");
            done();
        };

        const fFiltersChanged = function(oEvent) {
            nFiltersChangedCount++;

            // Allow multiple filtersChanged events (this is expected behavior during flex changes)
            assert.ok(nFiltersChangedCount > 0, "FiltersChanged event " + nFiltersChangedCount + " fired");
        };

        this.oFilterBarBase.attachFiltersChanged(fFiltersChanged);
        this.oFilterBarBase.attachSearch(fSearch);

		sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        this.oFilterBarBase._reportModelChange({
            triggerSearch: true,
            triggerFilterUpdate: true
        });

        this.oFilterBarBase._handleFilterItemSubmit(oEvent);
        oSubmitPromise.then(function() {
            setTimeout(function() { fnFlexPromiseResolve(); });
        });
    });

    QUnit.test("Check 'filtersChange' event handling on filter changes", function(assert){

        const done = assert.async();

        sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")});

		this.oFilterBarBase.initialized().then(function () {
            // --> this would happen during runtime through a change
            this.oFilterBarBase.setFilterConditions({
                "key1": [
                    {
                    "operator": OperatorName.EQ,
                    "values": [
                        "SomeTestValue"
                    ],
                    "validated": ConditionValidated.Validated
                    }
                ]
            });

            this.oFilterBarBase.attachFiltersChanged(function(oEvent){
                assert.ok(oEvent, "Event gets triggered since a filter update is done by _onModifications");
                done();
            });

            //trigger the handling after changes have been applied
            this.oFilterBarBase._onModifications();
        }.bind(this));

    });

    QUnit.test("Check change appliance handling", function(assert){

        assert.ok(this.oFilterBarBase._aOngoingChangeAppliance.length === 0, "no pending appliance");
        this.oFilterBarBase._addConditionChange({
			key1: [
				{operator: OperatorName.EQ, value: ["Test"]}
			]
		});
        assert.ok(this.oFilterBarBase._aOngoingChangeAppliance.length === 1, "pending appliance");
    });

    QUnit.test("Check modification handling & pending modification (awaitPendingModification)", function(assert){

		const oReportSpy = sinon.spy(this.oFilterBarBase, "_reportModelChange");

        // usually this promise is provided by sap/ui/mdc/flexibility/Util --> since this is propagated by AdaptationMixin#awaitPendingModification
        // this test is using this variable to mock a long pending change appliance
        this.oFilterBarBase._pPendingModification = new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve();
            }, 200);
        });

		assert.notOk(oReportSpy.called, "No change reported yet");

		return this.oFilterBarBase.awaitPendingModification().then(function(){
			assert.ok(oReportSpy.calledOnce, "Change has been reported to update FilterBar");
		});

    });

	QUnit.test("Check modification handlingg & pending modification (awaitPendingModification)", function(assert){

		const done = assert.async();

		this.oFilterBarBase.attachFiltersChanged(function(oEvt){
			assert.ok(oEvt, "Filter event fired after modification has been processed");
			done();
		});

        // usually this promise is provided by sap/ui/mdc/flexibility/Util --> since this is propagated by AdaptationMixin#awaitPendingModification
        // this test is using this variable to mock a long pending change appliance
        this.oFilterBarBase._pPendingModification = new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve();
            }, 200);
        });

    });

    QUnit.test("Check sync of ConditionModel with filterConditions after change appliance", function(assert){
        sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")});

		return this.oFilterBarBase.initialized().then(function () {

            //add condition to filterConditions --> simulate flex change
            this.oFilterBarBase.setFilterConditions({
                key1: [
                    {operator: OperatorName.EQ, values: ["Test"]}
                ]
            });

            //Check empty CM
            assert.equal(this.oFilterBarBase._getConditionModel().getConditions("key1").length, 0, "No conditions yet in CM");

            //trigger the sync
            return this.oFilterBarBase._onModifications()
            .then(function(){
                assert.equal(this.oFilterBarBase._getConditionModel().getConditions("key1").length, 1, "CM and filterConditons are now in sync");
            }.bind(this));

        }.bind(this));


    });

	QUnit.test("Check _setXConditions applies a fine granular delta (Remove a condition)", function(assert){

		const done = assert.async();

		//mock the missing typeConfig information
		sinon.stub(this.oFilterBarBase, "_getPropertyByName").callsFake(function(sKey){
			return {
				name: sKey,
				typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")
			};
		});

		//set initial conditions
		this.oFilterBarBase.setFilterConditions({
			key2: [
				{operator: OperatorName.EQ, values: ["Test"]}
			],
			key1: [
				{operator: OperatorName.EQ, values: ["Test"]}
			]
		});

		return this.oFilterBarBase.initialized().then(function () {

			//check that only the necessary operations will be executed
			const oCMRemoveAllSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "removeAllConditions");
			const oCMRemoveSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "removeCondition");
			const oCMAddSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "addCondition");

			//clear the current condition
			this.oFilterBarBase._setXConditions({
				key1: [],
				key2: [
					{operator: OperatorName.EQ, values: ["Test"]}
				]
			})
			.then(function(){

				//Only one condition has been removed, we expect no clear or no add to be executed --> only one remove
				assert.equal(oCMRemoveAllSpy.callCount, 0, "CM has not been cleared");
				assert.equal(oCMRemoveSpy.callCount, 1, "Remove has not been called once");
				assert.equal(oCMAddSpy.callCount, 0, "Add has not been called");

				this.oFilterBarBase._getConditionModel().removeAllConditions.restore();
				this.oFilterBarBase._getConditionModel().removeCondition.restore();
				this.oFilterBarBase._getConditionModel().addCondition.restore();
				done();
			}.bind(this));

		}.bind(this));

	});

	QUnit.test("Check _setXConditions applies a fine granular delta (Add a condition)", function(assert){

		const done = assert.async();

		//mock the missing typeConfig information
		sinon.stub(this.oFilterBarBase, "_getPropertyByName").callsFake(function(sKey){
			return {
				name: sKey,
				typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")
			};
		});

		//set initial conditions
		this.oFilterBarBase.setFilterConditions(this.oFilterBarBase._setXConditions({
			key2: [{operator: OperatorName.EQ, values: ["Test"]}]
		}));

		return this.oFilterBarBase.initialized().then(function () {

			//check that only the necessary operations will be executed
			const oCMRemoveAllSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "removeAllConditions");
			const oCMRemoveSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "removeCondition");
			const oCMAddSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "addCondition");

			//clear the current condition
			this.oFilterBarBase._setXConditions({
				key1: [{operator: OperatorName.EQ, values: ["Test"]}]
			})
			.then(function(){

				//Only one condition has been removed, we expect no clear or no add to be executed --> only one remove
				assert.equal(oCMRemoveAllSpy.callCount, 0, "CM has not been cleared");
				assert.equal(oCMRemoveSpy.callCount, 0, "Remove has not been called once");
				assert.equal(oCMAddSpy.callCount, 1, "Add has not been called");

				this.oFilterBarBase._getConditionModel().removeAllConditions.restore();
				this.oFilterBarBase._getConditionModel().removeCondition.restore();
				this.oFilterBarBase._getConditionModel().addCondition.restore();
				done();
			}.bind(this));

		}.bind(this));

	});

    QUnit.test("Check cleanUpAllFilterFieldsInErrorState", function(assert){

		const oFilterField = new FilterField("key1", {
			label: "key1",
			conditions: "{$filters>/conditions/key1}",
			propertyKey: "key1",
			dataTypeConstraints: { maxLength: 2},
			dataType: "sap.ui.model.type.String",
			required: false
		});

		oFilterField.setValueState("Error");
		this.oFilterBarBase.addFilterItem(oFilterField);

		assert.equal(oFilterField.getValueState(), "Error");
		this.oFilterBarBase.cleanUpAllFilterFieldsInErrorState();

		assert.equal(oFilterField.getValueState(), "None");
    });

    QUnit.test("Check required missing handling on filter changes", function(assert){

        const done = assert.async();

		const oStub = sinon.stub(this.oFilterBarBase, "_getPropertyByName");
		oStub.withArgs("key1").returns({name: "key1", required: true, typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String"), constraints: {maxLength: 4}});
		oStub.withArgs("key2").returns({name: "key2", required: true, typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")});

		sinon.stub(this.oFilterBarBase, "_getRequiredPropertyNames").returns(["key1", "key2"]);

		const oFilterField1 = new FilterField("key1", {
			label: "key1",
			conditions: "{$filters>/conditions/key1}",
			propertyKey: "key1",
			dataType: "sap.ui.model.type.String",
			required: true
		});
        this.oFilterBarBase.addFilterItem(oFilterField1);

		const oFilterField2 = new FilterField("key2", {
			label: "key2",
			conditions: "{$filters>/conditions/key2}",
			propertyKey: "key2",
			dataType: "sap.ui.model.type.String",
			required: true
		});
        this.oFilterBarBase.addFilterItem(oFilterField2);


        this.oFilterBarBase.checkFilters();
        assert.equal(oFilterField1.getValueState(), "Error");
        assert.equal(oFilterField2.getValueState(), "Error");


		this.oFilterBarBase.initialized().then(function () {
            // --> this would happen during runtime through a change
            this.oFilterBarBase.setFilterConditions({
                "key1": [
                    {
                    "operator": OperatorName.EQ,
                    "values": [
                        "test"
                    ]
                    }
                ]
            });

            //trigger the handling after changes have been applied
            this.oFilterBarBase._onModifications().then(function() {
                assert.equal(oFilterField1.getValueState(), "None");
                assert.equal(oFilterField2.getValueState(), "Error");
                assert.equal(oFilterField2.getValueStateText(), this.oFilterBarBase._getRequiredFilterFieldValueText(oFilterField2));


                //Check required field in error state
                oFilterField1.setValueState("Error");
                oFilterField1.setValueStateText("Some Error Text");
                this.oFilterBarBase.setFilterConditions({
                    "key1": [
                        {
                        "operator": OperatorName.EQ,
                        "values": [
                           "too long"
                        ],
                        "validated": ConditionValidated.Validated
                        }
                    ]
                });
                this.oFilterBarBase._onModifications().then(function() {
                    assert.equal(oFilterField1.getValueState(), "Error");
                    assert.equal(oFilterField1.getValueStateText(), "Some Error Text");
                    assert.equal(oFilterField2.getValueState(), "Error");
                    assert.equal(oFilterField2.getValueStateText(), this.oFilterBarBase._getRequiredFilterFieldValueText(oFilterField2));
                    done();
                }.bind(this));
            }.bind(this));
        }.bind(this));

    });

    QUnit.test("check reason information", async function(assert){

        const done = assert.async(3);

        let fnSubmittedResolve = null;
        const oSubmittedPromise = new Promise(function(resolve) {
            fnSubmittedResolve = resolve;
        });

        let fnGoResolve = null;
        const oGoPromise = new Promise(function(resolve) {
            fnGoResolve = resolve;
        });

        let nCall = 0;
        this.oFilterBarBase.attachSearch(function(oEvent) {

            const sReason = oEvent.getParameter("reason");
            ++nCall;

            if (nCall === 1) {
                assert.equal("Enter", sReason, "expected reason 'Enter'");
                fnSubmittedResolve();
            } else if (nCall === 2) {
                assert.equal("Go", sReason, "expected reason 'Go'");
                fnGoResolve();
            } else if (nCall === 3) {
                assert.equal("Variant", sReason, "expected reason 'Variant'");
            }

            done();
        });

        //SUBMIT
        const oFilterField = new FilterField();
        this.oFilterBarBase.setBasicSearchField(oFilterField);
        oFilterField.fireSubmit({promise: Promise.resolve()});
		await nextUIUpdate();

        //GO
		oSubmittedPromise.then(async function() {
	        this.oFilterBarBase.onSearch();
			await nextUIUpdate();
		}.bind(this));


        //VARIANT
		oGoPromise.then(function() {
			sinon.stub(this.oFilterBarBase, "_getExecuteOnSelectionOnVariant").returns( true );
			this.oFilterBarBase._handleVariantSwitch({});
		}.bind(this));

    });


    QUnit.test("Check the new 'validationState' handling ", function(assert){
        const done = assert.async();

        const oDelegate = {
            determineValidationState: function(oControl) {
                assert.equal(oControl, this.oFilterBarBase);
                return 44;
            }.bind(this),
            visualizeValidationState: function(oControl, mMap) {
                assert.equal(mMap.status, 44);
                done();
            }
        };

        sinon.stub(this.oFilterBarBase, "_hasRetrieveMetadataToBeCalled").returns(false);
        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        sinon.stub(this.oFilterBarBase, "awaitControlDelegate").returns(Promise.resolve(oDelegate));
        this.oFilterBarBase._oDelegate = oDelegate;

        this.oFilterBarBase.validate(true);
    });

	QUnit.test("check variantSwitch for non filterbar & for filterbar", function(assert) {

		const aAffectedControls = ["Item"];

		sinon.stub(this.oFilterBarBase, "awaitPendingModification").returns(Promise.resolve(aAffectedControls));
		sinon.stub(this.oFilterBarBase, "_getExecuteOnSelectionOnVariant").returns(true);
		sinon.stub(this.oFilterBarBase, "_reportModelChange");

		this.oFilterBarBase._bInitialFiltersApplied = true;

		return this.oFilterBarBase._handleVariantSwitch({}).then(function() {
			assert.ok(this.oFilterBarBase._reportModelChange.called);
			this.oFilterBarBase._reportModelChange.reset();
			aAffectedControls.push("Filter");
			return this.oFilterBarBase._handleVariantSwitch({}).then(function() {
				assert.ok(!this.oFilterBarBase._reportModelChange.called);
			}.bind(this));

		}.bind(this));

	});

    QUnit.test("_setXConditions with unknown properties", function(assert){
        const done = assert.async();

        const mDummyCondition = {
            "key1": [
                {
                  "operator": OperatorName.EQ,
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": ConditionValidated.Validated
                }
              ],
             "unknown": [                {
                  "operator": OperatorName.EQ,
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": ConditionValidated.Validated
                }]
        };
        const mResultCondition = {
            "key1": [
                {
				  "isEmpty": false,
                  "operator": OperatorName.EQ,
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": ConditionValidated.Validated
                }
              ]
        };


        this.oFilterBarBase.initialized().then(function(){

            sinon.stub(this.oFilterBarBase, "_getPropertyByName").callsFake(function(sPropertyName){
				if (sPropertyName === "key1") {
					return {name: "key1", typeConfig: this.oFilterBarBase.getTypeMap().getTypeConfig("sap.ui.model.type.String")};
				} else {
					return null;
				}
			}.bind(this));

			const fnLogErrorSpy = sinon.spy(Log, "error");
			assert.ok(!fnLogErrorSpy.called);

            this.oFilterBarBase._setXConditions(mDummyCondition)
            .then(function(){
                assert.deepEqual(mResultCondition, this.oFilterBarBase.getInternalConditions(), "Condition returned without persistence active");
				assert.ok(fnLogErrorSpy.calledOnce);
				fnLogErrorSpy.restore();

                done();
            }.bind(this));
        }.bind(this));

    });

    QUnit.module("_enhanceBasicSearchField");

    QUnit.test("should log a warning when the 'propertyKey' of the given SearchField is not '$search' and then default to it", function (assert) {
        const oFilterBarBase = new FilterBarBase({
            delegate: {
                name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate",
                payload: {
                    modelName: undefined,
                    collectionName: "test"
                }
            }
        });

        const fnLogWarningSpy = sinon.spy(Log, "warning");
        const fnEnhanceFilterFieldStub = sinon.stub(oFilterBarBase, "_enhanceFilterField");
        const oBasicSearchFieldMock = {};
        oBasicSearchFieldMock.getPropertyKey = sinon.stub().returns("");
        oBasicSearchFieldMock.setPropertyKey = sinon.stub();
        oBasicSearchFieldMock.setModel = sinon.stub();

        assert.ok(oBasicSearchFieldMock.getPropertyKey.notCalled, "should not call 'getPropertyKey' initially");
        assert.ok(oBasicSearchFieldMock.setPropertyKey.notCalled, "should not call 'setPropertyKey' initially");
        assert.ok(fnLogWarningSpy.notCalled, "should not call 'warning' initially");
        assert.ok(fnEnhanceFilterFieldStub.notCalled, "should not call '_enhanceFilterField' initially");

        oFilterBarBase._enhanceBasicSearchField(oBasicSearchFieldMock);

        assert.ok(oBasicSearchFieldMock.getPropertyKey.calledOnce, "should call 'getPropertyKey'");
        assert.ok(oBasicSearchFieldMock.setPropertyKey.calledOnce, "should call 'setPropertyKey'");
        assert.ok(oBasicSearchFieldMock.setPropertyKey.calledWith("$search"), "should call 'setPropertyKey' with correct value");

        const sExpectedErrorText = `sap.ui.mdc.FilterBar: BasicSearchField has incorrect 'propertyKey' ''. Overriding to default '$search'`;

        assert.ok(fnLogWarningSpy.calledOnce, "should call 'warning'");
        assert.ok(fnLogWarningSpy.calledWith(sExpectedErrorText), "should call 'warning' with correct value");

        assert.ok(fnEnhanceFilterFieldStub.calledOnce, "should call '_enhanceFilterField'");
        assert.ok(fnEnhanceFilterFieldStub.calledWith(oBasicSearchFieldMock), "should call '_enhanceFilterField' with correct value");

        fnLogWarningSpy.restore();
    });

    QUnit.module("Accessibility", {
        beforeEach: async function () {
			this.oFilterBarBase = new FilterBarBase({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
            });
            this.oRb = Library.getResourceBundleFor("sap.ui.mdc");

            this.oFilterBarBase.placeAt("qunit-fixture");
            await nextUIUpdate();
		},
		afterEach: function () {
			this.oFilterBarBase.destroy();
            this.oFilterBarBase = undefined;
		}
    });

    QUnit.test("Check description for Go Button", function(assert) {
        const oButton = this.oFilterBarBase._getSearchButton();
        assert.ok(oButton, "Go Button available");

        const sExpectedDescription = this.oRb.getText("filterbar.GO_DESCRIPTION");
        const sInvisibleTextId = this.oFilterBarBase.getId() + "-btnSearch-description";

        const aDescribedBy = oButton.getAriaDescribedBy();
        assert.ok(aDescribedBy.length > 0, "Go Button has ariaDescribedBy references");

        const oDescription = this.oFilterBarBase.getInvisibleText(sInvisibleTextId);
        assert.ok(oDescription, "Description InvisibleText available");
        assert.equal(oDescription.getText(), sExpectedDescription, "Description InvisibleText has correct text");
    });

});