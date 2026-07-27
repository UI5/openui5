/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/valuehelp/CollectiveSearchSelect",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/model/json/JSONModel",
	"sap/m/library"
], (
	FilterBar,
	FilterBarBase,
	FilterField,
	CollectiveSearchSelect,
	Element,
	Library,
	JSONModel,
	mLibrary
) => {
	"use strict";

	const mdcMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	const { ButtonType } = mLibrary;
	let oFilterBar;

	QUnit.module("FilterBar", {
		beforeEach() {
			oFilterBar = new FilterBar("FB1", {
				//delegate: { name: "delegates/GenericVhFilterBarDelegate", payload: {} }
			});

		},
		afterEach() {
			oFilterBar?.destroy();
			oFilterBar = undefined;
		}
	});


	QUnit.test("instanciable", (assert) => {
		assert.ok(oFilterBar);
	});

	QUnit.test("inner layout exists on initialization", (assert) => {
		const done = assert.async();
		assert.ok(oFilterBar);

		oFilterBar.initialized().then(() => {
			assert.ok(!!oFilterBar.getAggregation("layout"));
			done();
		});
	});

	QUnit.test("getConditionModelName ", (assert) => {
		assert.equal(oFilterBar.getConditionModelName(), FilterBarBase.CONDITION_MODEL_NAME);
	});

	QUnit.test("get GO/Search button visiblity", (assert) => {
		const oButton = oFilterBar._btnSearch;

		assert.equal(oFilterBar.getBasicSearchField(), null, "No Basis Search exist");
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.notOk(oFilterBar._oBtnFilters.getVisible(), "showFilters button is not visible");

		assert.ok(oButton);
		assert.equal(oButton.getType(), ButtonType.Ghost, "Search/Go button is rendered with Ghost styling so that the dialog's OK button remains the only emphasized action");

		oFilterBar.setBasicSearchField(new FilterField("BS1", {
			conditions: "{$filters>/conditions/$search}",
			propertyKey: "$search",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		}));

		assert.ok(!!oFilterBar.getBasicSearchField(), "Basic Search exist");

		const oFilterField = new FilterField("FF1", {
			conditions: "{$filters>/conditions/ff1}",
			propertyKey: "ff1",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.addFilterItem(oFilterField);

		assert.ok(oFilterBar._oBtnFilters.getVisible(), "showFilters button is visible");

		assert.ok(oButton.getVisible(), "Search/Go button is visible");

		oFilterBar.setShowGoButton(false);
		assert.notOk(oButton.getVisible(), "Search/Go button is not visible");

		oFilterBar.setShowGoButton(true);
		assert.ok(oButton.getVisible(), "Search/Go button is visible");

		oFilterBar.setLiveMode(true);

		if (oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible(), "Search/Go button is visible");
		} else {
			assert.notOk(oButton.getVisible(), "Search/Go button is not visible");
		}

		oFilterBar.setLiveMode(false);
		oFilterBar.removeFilterItem(oFilterField);
		oFilterField.destroy();
		assert.notOk(oFilterBar._oBtnFilters.getVisible(), "showFilters button is not visible");
		assert.ok(oButton.getVisible(), "Search/Go button is visible");
	});

	QUnit.test("filterFieldThreshold / showAllFilters button", (assert) => {
		const oFilterContainer = oFilterBar._oFilterBarLayout;

		oFilterBar.setFilterFieldThreshold(2);
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");

		let oFilterField = new FilterField("FF1", {
			conditions: "{$filters>/conditions/ff1}",
			propertyKey: "ff1",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.addFilterItem(oFilterField);
		let aContent = oFilterContainer.getFilterFields();
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.equal(aContent.length, 1, "One FilterField shown");
		assert.equal(aContent[0]._getFilterField(), oFilterField, "New FilterField is first item");

		oFilterField = new FilterField("FF2", {
			conditions: "{$filters>/conditions/ff2}",
			propertyKey: "ff2",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.insertFilterItem(oFilterField, 0);
		aContent = oFilterContainer.getFilterFields();
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.equal(aContent.length, 2, "Two FilterFields shown");
		assert.equal(aContent[0]._getFilterField(), oFilterField, "New FilterField is first item");

		oFilterField = new FilterField("FF3", {
			conditions: "{$filters>/conditions/ff3}",
			propertyKey: "ff3",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.insertFilterItem(oFilterField, 0);
		aContent = oFilterContainer.getFilterFields();
		assert.ok(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is visible");
		assert.equal(aContent.length, 2, "Two FilterFields shown");
		assert.equal(aContent[0]._getFilterField(), oFilterField, "New FilterField is first item");

		oFilterField = new FilterField("FF4", {
			conditions: "{$filters>/conditions/ff4}",
			propertyKey: "ff3",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.addFilterItem(oFilterField);
		aContent = oFilterContainer.getFilterFields();
		assert.ok(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is visible");
		assert.equal(aContent.length, 2, "Two FilterFields shown");
		assert.equal(aContent[0]._getFilterField().getId(), "FF3", "Old FilterField is first item");

		oFilterBar._oShowAllFiltersBtn.firePress();
		aContent = oFilterContainer.getFilterFields();
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.equal(aContent.length, 4, "Four FilterFields shown");
	});

	QUnit.test("check liveMode property", (assert) => {
		const oButton = oFilterBar._btnSearch;
		assert.ok(oButton);

		assert.ok(!oFilterBar.getLiveMode());
		assert.ok(oButton.getVisible());

		oFilterBar.setLiveMode(true);
		assert.ok(oFilterBar.getLiveMode());
		if (oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible());
		} else {
			assert.ok(!oButton.getVisible());
		}
	});

	QUnit.test("check ExpandFilterFields", (assert) => {
		const oFilterContainer = oFilterBar._oFilterBarLayout;
		const oButton = oFilterBar._oBtnFilters;
		sinon.stub(oFilterContainer.oLayout, "getContent").returns([1,2,3]); // fake 3 FilterFields
		const bExpanded = oFilterBar.getExpandFilterFields();
		assert.ok(bExpanded);

		assert.equal(oButton.getText(), "Hide Filters");
		assert.ok(oFilterContainer.getFilterFields().length, "FilterFields layout should be visible");

		oFilterBar.setExpandFilterFields(false);
		assert.ok(!oFilterBar.getExpandFilterFields());

		assert.ok(oButton.getText() === "Show Filters");
		assert.ok(!oFilterContainer.getFilterFields().length, "FilterFields layout should be invisible");

		oFilterBar._onToggleFilters();
		assert.equal(oButton.getText(), "Hide Filters");
		assert.ok(oFilterContainer.getFilterFields().length, "FilterFields layout should be visible");

		oFilterBar._onShowAllFilters();
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "Show All button should be invisible");
		oFilterContainer.oLayout.getContent.restore();
	});

	QUnit.test("check BasicSearch", (assert) => {
		let oCtrl = oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === undefined, "BasicSearchField should not exist");

		const oBSField = new FilterField("BS1");
		oFilterBar.setBasicSearchField(oBSField);
		oCtrl = oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === oBSField, "BasicSearchField should exist");

		const oNewBSField = new FilterField("BS2");
		oFilterBar.setBasicSearchField(oNewBSField);
		oCtrl = oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === oNewBSField, "new BasicSearchField should exist");
		assert.notOk(oBSField.getParent(), "old BasicSearchField has no parent");

		oFilterBar.destroyBasicSearchField();
		oCtrl = oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === undefined, "BasicSearchField should not exist");

		oBSField.destroy();
	});

	QUnit.test("check CollectiveSearch", (assert) => {
		let oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === undefined, "CollectiveSearchSelect should not exist");

		const oColSearch = new CollectiveSearchSelect("CS1");
		oFilterBar.setCollectiveSearch(oColSearch);
		oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === oColSearch, "CollectiveSearchSelect should exist");

		const oNewColSearch = new CollectiveSearchSelect("CS2");
		oFilterBar.setCollectiveSearch(oNewColSearch);
		oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === oNewColSearch, "new CollectiveSearchSelect should exist");
		assert.notOk(oColSearch.getParent(), "old CollectiveSearchSelect has no parent");

		oFilterBar.destroyCollectiveSearch();
		oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === undefined, "CollectiveSearchSelect should not exist");
		assert.ok(oNewColSearch.isDestroyed(), "New CollectiveSearchSelect destroyed");

		oFilterBar.setCollectiveSearch(oColSearch);
		oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === oColSearch, "CollectiveSearchSelect should exist");
		oFilterBar.destroy();
		oFilterBar = undefined;
		assert.notOk(oColSearch.isDestroyed() || oColSearch.isDestroyStarted(), "CollectiveSearch not destroyed after FilterBar destroyed");

		oColSearch.destroy();
	});

	QUnit.test("getInitialFocusedControl", (assert) => {
		let oControl = oFilterBar.getInitialFocusedControl();
		assert.ok(oControl, "Control returned");
		assert.equal(oControl, oFilterBar._btnSearch, "Control is Go-Button");

		oFilterBar.setShowGoButton(false);
		oControl = oFilterBar.getInitialFocusedControl();
		assert.notOk(oControl, "no Control returned");

		const oBSField = new FilterField("BS1");
		oFilterBar.setBasicSearchField(oBSField);
		oControl = oFilterBar.getInitialFocusedControl();
		assert.ok(oControl, "Control returned");
		assert.equal(oControl, oBSField, "Control is SearchField");
	});

	QUnit.test("Properties", (assert) => {
		sinon.stub(oFilterBar, "getParent").returns({
			isPropertyInitial(sName) {return true;},
			isInvalidateSuppressed() {return false;},
			invalidate() {}
		});
		return oFilterBar._retrieveMetadata().then(() => {
			const aPropertyInfos = oFilterBar.getPropertyInfoSet();

			assert.equal(aPropertyInfos?.length, 1, "One Property");
			assert.equal(aPropertyInfos?.[0].key, "$search", "Key");
			assert.equal(aPropertyInfos?.[0].dataType, "sap.ui.model.type.String", "dataType");
			assert.equal(aPropertyInfos?.[0].label, mdcMessageBundle.getText("filterbar.SEARCH"), "Label");
		});
	});

	QUnit.test("Searchfield aria label", function(assert) {
		const vhModelMock = new JSONModel({title: "Title"});
		oFilterBar.setModel(vhModelMock, "$help");

		const oBasicSearchField = new FilterField("BS1", { conditions: "{cm>/conditions/$search}", propertyKey: "$search" });
		oFilterBar.setBasicSearchField(oBasicSearchField);


		const aAriaLabels = oBasicSearchField.getAriaLabelledBy();
		const sExpectedLabelText = mdcMessageBundle.getText("valuehelp.SEARCHFIELD_ARIA_LABEL", ["Title"]);
		const sAriaLabelId = aAriaLabels.find((sId) => Element.getElementById(sId).getText() === sExpectedLabelText);
		assert.ok(sAriaLabelId != null, "Search field has aria label referencing the VH title");

		oFilterBar.setBasicSearchField(null);
		assert.ok(!Element.getElementById(sAriaLabelId), "Aria label elements removed when Search field is removed");
	});

	/**
	 *  @deprecated since 1.120.2
	 */
	QUnit.test("Properties using FilterFields", (assert) => {
		sinon.stub(oFilterBar, "getParent").returns({
			isPropertyInitial(sName) {return sName !== "filterFields";},
			getFilterFields() {return "myField";},
			isInvalidateSuppressed() {return false;},
			invalidate() {}
		});
		return oFilterBar._retrieveMetadata().then(() => {
			const aPropertyInfos = oFilterBar.getPropertyInfoSet();

			assert.equal(aPropertyInfos?.length, 1, "One Property");
			assert.equal(aPropertyInfos?.[0].key, "myField", "Key");
			assert.equal(aPropertyInfos?.[0].dataType, "sap.ui.model.type.String", "dataType");
			assert.equal(aPropertyInfos?.[0].label, mdcMessageBundle.getText("filterbar.SEARCH"), "Label");
		});
	});

	QUnit.test("Show Filters button text - no active conditions", (assert) => {
		const oButton = oFilterBar._oBtnFilters;

		oFilterBar.setExpandFilterFields(false);
		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH"),
			"Button shows plain 'Show Filters' when no conditions are active");
	});

	QUnit.test("Show Filters button text - with active conditions", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setExpandFilterFields(false);

		const fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();

		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [1]),
			"Button shows 'Show Filters (1)' with one active condition");
	});

	QUnit.test("Show Filters button text - count reflects multiple active conditions", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setExpandFilterFields(false);

		const fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1", "ff2", "ff3"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();

		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [3]),
			"Button shows 'Show Filters (3)' with three active conditions");
	});

	QUnit.test("Show Filters button text - count updates dynamically as conditions are added and removed", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setExpandFilterFields(false);

		// 0 conditions
		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH"),
			"Starts with plain 'Show Filters'");

		// Add 1
		let fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();
		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [1]),
			"Shows 'Show Filters (1)' after adding one condition");

		// Add 2 more
		fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1", "ff2", "ff3"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();
		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [3]),
			"Shows 'Show Filters (3)' after adding two more conditions");

		// Remove 2
		fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();
		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [1]),
			"Shows 'Show Filters (1)' after removing two conditions");

		// Remove last
		fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns([]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();
		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH"),
			"Reverts to plain 'Show Filters' when all conditions cleared");
	});

	QUnit.test("Show Filters button text - count is hidden when zero (no brackets)", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setExpandFilterFields(false);

		// Set a count first
		let fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();

		// Clear back to zero
		fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns([]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();

		const sText = oButton.getText();
		assert.equal(sText, mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH"),
			"Button text is plain 'Show Filters' without brackets when count is zero");
		assert.notOk(sText.includes("("), "Button text contains no opening bracket");
		assert.notOk(sText.includes(")"), "Button text contains no closing bracket");
	});

	QUnit.test("Show Filters button text - count shown in liveMode", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setLiveMode(true);
		oFilterBar.setExpandFilterFields(false);

		const fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1", "ff2"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();

		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [2]),
			"Count is shown in liveMode");
	});

	QUnit.test("Show Filters button text - count shown when liveMode is off", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setLiveMode(false);
		oFilterBar.setExpandFilterFields(false);

		const fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1", "ff2"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();

		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [2]),
			"Count is shown regardless of liveMode");
	});

	QUnit.test("Show Filters button text - expanded state shows Hide Filters regardless of count", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setExpandFilterFields(true);

		const fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();

		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.HIDEADVSEARCH"),
			"Button shows 'Hide Filters' when filter bar is expanded, even with active conditions");
	});

	QUnit.test("Show Filters button text - getAdaptFiltersButtonText uses VH-specific i18n keys", (assert) => {
		assert.equal(
			oFilterBar.getAdaptFiltersButtonText(0),
			mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH"),
			"Returns 'Show Filters' for zero count"
		);
		assert.equal(
			oFilterBar.getAdaptFiltersButtonText(1),
			mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [1]),
			"Returns 'Show Filters (1)' for count 1"
		);
		assert.equal(
			oFilterBar.getAdaptFiltersButtonText(5),
			mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [5]),
			"Returns 'Show Filters (5)' for count 5"
		);
	});

	QUnit.test("Show Filters button text - bFiltersAggregationChanged suppresses count update", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setExpandFilterFields(false);

		// Set count to 1
		let fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1"]);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();
		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [1]),
			"Count is 1 before filter item change");

		// Simulate a filter item being added/removed (bFiltersAggregationChanged=true)
		fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(["ff1", "ff2"]);
		oFilterBar._handleAssignedFilterNames(true);
		fnStub.restore();

		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH_NONZERO", [1]),
			"Count is NOT updated when called with bFiltersAggregationChanged=true (filter item added/removed, not condition changed)");
	});

	QUnit.test("Show Filters button text - null return from getAssignedFilterNames is handled safely", (assert) => {
		const oButton = oFilterBar._oBtnFilters;
		oFilterBar.setExpandFilterFields(false);

		// Simulate condition model not yet initialized (getAssignedFilterNames returns null)
		const fnStub = sinon.stub(oFilterBar, "getAssignedFilterNames").returns(null);
		oFilterBar._handleAssignedFilterNames(false);
		fnStub.restore();

		assert.equal(oButton.getText(), mdcMessageBundle.getText("valuehelp.SHOWADVSEARCH"),
			"Falls back to 'Show Filters' (count 0) when condition model not initialized");
	});

	QUnit.test("getAssignedFilterNames only returns rendered filters (override behavior)", (assert) => {
		const done = assert.async();

		sap.ui.require([
			"sap/ui/mdc/FilterField",
			"sap/ui/mdc/condition/Condition",
			"sap/ui/mdc/enums/OperatorName",
			"sap/ui/mdc/enums/ConditionValidated"
		], (FilterField, Condition, OperatorName, ConditionValidated) => {
			// Add two filter fields
			const oFilterField1 = new FilterField("vhff1", {
				propertyKey: "key1",
				dataType: "sap.ui.model.type.String"
			});
			const oFilterField2 = new FilterField("vhff2", {
				propertyKey: "key2",
				dataType: "sap.ui.model.type.String"
			});

			oFilterBar.addFilterItem(oFilterField1);
			oFilterBar.addFilterItem(oFilterField2);

			// Mock _getNonHiddenPropertyInfoSet to return PropertyInfo for the two fields
			const fnStub = sinon.stub(oFilterBar, "_getNonHiddenPropertyInfoSet").returns([
				{ key: "key1", label: "Key 1" },
				{ key: "key2", label: "Key 2" }
			]);

			// Set conditions on both filters
			const oConditionModel = oFilterBar._getConditionModel();
			oConditionModel.addCondition("key1", Condition.createCondition(OperatorName.EQ, ["Value1"], undefined, undefined, ConditionValidated.Validated));
			oConditionModel.addCondition("key2", Condition.createCondition(OperatorName.EQ, ["Value2"], undefined, undefined, ConditionValidated.Validated));

			// Initially both are rendered
			let aAssignedNames = oFilterBar.getAssignedFilterNames();
			assert.equal(aAssignedNames.length, 2, "Both rendered filters with conditions are counted");

			// Now remove one filter field (it's no longer rendered, but condition still exists)
			oFilterBar.removeFilterItem(oFilterField2);

			// Only the rendered filter should be returned
			aAssignedNames = oFilterBar.getAssignedFilterNames();
			assert.equal(aAssignedNames.length, 1, "Only rendered filter with conditions is counted");

			// Cleanup
			fnStub.restore();
			oFilterField1.destroy();
			oFilterField2.destroy();

			done();
		});
	});

});
