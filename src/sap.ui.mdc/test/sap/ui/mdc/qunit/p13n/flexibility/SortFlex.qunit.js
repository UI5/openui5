/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "sap/ui/mdc/flexibility/SortFlex", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/test/utils/nextUIUpdate"
], function(createAppEnvironment, SortFlex, ChangesWriteAPI, JsControlTreeModifier, nextUIUpdate) {
	"use strict";

	const fCreateAddSortDefinition = function(){
		return {
			"changeType": "addSort",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"key": "Category",
				"descending": false,
				"index": 0
			}
		};
	};

	const fCreateRemoveSortDefintion = function(){
		return {
			"changeType": "removeSort",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"key": "Category",
				"descending": false,
				"index": 0
			}
		};
	};

	QUnit.module("change handlers", {
		beforeEach: function() {

			const sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table id="myTable"></Table></mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(async function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();

				this.oTable = this.oView.byId('myTable');

				//addSort
				this.fAddSort = SortFlex.addSort.changeHandler.applyChange;
				this.fRevertAddSort = SortFlex.addSort.changeHandler.revertChange;

				//removeSort
				this.fRemoveSort = SortFlex.removeSort.changeHandler.applyChange;
				this.fRevertRemoveSort = SortFlex.removeSort.changeHandler.revertChange;
			}.bind(this));
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("addSort", function(assert) {
		const done = assert.async();
		const oContent = fCreateAddSortDefinition();

		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.fAddSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				const oSortConditions = this.oTable.getSortConditions();
				const aSorters = oSortConditions.sorters;

				assert.equal(aSorters.length, 1, "one sorter has been created");
				assert.equal(aSorters[0].key, "Category", "correct sorter has been created");
				assert.equal(aSorters[0].descending, false, "correct sort order has been created");

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("removeSort", function(assert) {
		const done = assert.async();
		const oAddContent = fCreateAddSortDefinition();

		//create addSort
		return ChangesWriteAPI.create({
			changeSpecificData: oAddContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.fAddSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				let oSortConditions = this.oTable.getSortConditions();
				const aSorters = oSortConditions.sorters;

				assert.equal(aSorters.length, 1, "one sorter has been created");
				assert.equal(aSorters[0].key, "Category", "correct sorter has been created");
				assert.equal(aSorters[0].descending, false, "correct sort order has been created");

				//create removeSort
				const oRemoveContent = fCreateRemoveSortDefintion();
				return ChangesWriteAPI.create({
					changeSpecificData: oRemoveContent,
					selector: this.oTable
				}).then(function(oChange) {

					this.fRemoveSort(oChange, this.oTable, {
						modifier: JsControlTreeModifier,
						appComponent: this.oUiComponent,
						view: this.oView
					}).then(function(){

						oSortConditions = this.oTable.getSortConditions();

						assert.equal(oSortConditions.sorters.length, 0, "sort conditions contains an empty array");

						done();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("removeSort (for a sorter that does not exist) with a different existing sorter", function(assert) {
		const done = assert.async();
		const oAddContent = fCreateAddSortDefinition();

		//create addSort
		return ChangesWriteAPI.create({
			changeSpecificData: oAddContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.fAddSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				let oSortConditions = this.oTable.getSortConditions();
				const aSorters = oSortConditions.sorters;

				assert.equal(aSorters.length, 1, "one sorter has been created");
				assert.equal(aSorters[0].key, "Category", "correct sorter has been created");
				assert.equal(aSorters[0].descending, false, "correct sort order has been created");

				//create removeSort
				const oRemoveContent = {
					changeType: "removeSort",
					selector: {
						id: "comp---view--myTable"
					},
					content: {
						key: "someNonExistingPropertyName"
					}
				};
				return ChangesWriteAPI.create({
					changeSpecificData: oRemoveContent,
					selector: this.oTable
				}).then(function(oChange) {

					this.fRemoveSort(oChange, this.oTable, {
						modifier: JsControlTreeModifier,
						appComponent: this.oUiComponent,
						view: this.oView
					}).finally(function(){

						oSortConditions = this.oTable.getSortConditions();

						//Check that the false change has been ignored gracefully, the further appliance and chain of appliance works as expected
						assert.equal(oSortConditions.sorters.length, 1, "sort conditions still contains the earlier existing sorter");

						done();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'removeSort' with exisiting sortConditions", function(assert) {
		const done = assert.async();

		this.oTable.setSortConditions({
			sorters: [
				{
					"key": "Category",
					"descending": false
				}
			]
		});

		const oInitialSortConditions = this.oTable.getSortConditions();

		//create removeSort
		const oRemoveContent = fCreateRemoveSortDefintion();
		return ChangesWriteAPI.create({
			changeSpecificData: oRemoveContent,
			selector: this.oTable
		}).then(function(oChange) {

			//apply 'removeSort'
			this.fRemoveSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				//existing sort condition removed
				const oSortConditions = this.oTable.getSortConditions();
				assert.equal(oSortConditions.sorters.length, 0, "no sorters - sort has been removed");

				//revert 'removeSort'
				this.fRevertRemoveSort(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//sortConditions should be similar to the initial state
					const oCurrentSortConditions = this.oTable.getSortConditions();
					assert.deepEqual(oCurrentSortConditions, oInitialSortConditions, "sorter has been reverted and is available again");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'addSort'", function(assert) {
		const done = assert.async();

		//create removeSort
		const oRemoveContent = fCreateAddSortDefinition();
		return ChangesWriteAPI.create({
			changeSpecificData: oRemoveContent,
			selector: this.oTable
		}).then(function(oChange) {

			//apply 'removeSort'
			this.fAddSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				//existing sort condition removed
				const oSortConditions = this.oTable.getSortConditions();
				assert.equal(oSortConditions.sorters.length, 1, "sorter added");

				//revert 'removeSort'
				this.fRevertAddSort(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

				//'addSort' reverted --> no sorters
					const oSortConditions = this.oTable.getSortConditions();
					assert.equal(oSortConditions.sorters.length, 0, "no sorter available - addSort successfully reverted");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

	// ---------------------------------------------------------------
	// Tests for the condenser configuration and orphaned moveSort fix
	// ---------------------------------------------------------------

	const sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table id="myTable"></Table></mvc:View>';

	QUnit.module("fMoveSort: orphaned moveSort guard", {
		beforeEach: function() {
			return createAppEnvironment(sTableView, "Table").then(async function(mCreatedApp) {
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oTable = this.oView.byId("myTable");
				this.fMoveSort = SortFlex.moveSort.changeHandler.applyChange;
				this.mPropertyBag = {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				};
			}.bind(this));
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("moveSort on missing key leaves sortConditions unchanged and does not insert null", function(assert) {
		this.oTable.setSortConditions({ sorters: [{ key: "Amount", name: "Amount", descending: false }] });

		return ChangesWriteAPI.create({
			changeSpecificData: {
				changeType: "moveSort",
				selector: { id: "comp---view--myTable" },
				content: { key: "NetAmount", name: "NetAmount", index: 0 }
			},
			selector: this.oTable
		}).then((oChange) => {
			oChange.setRevertData({ key: "NetAmount", index: 0 });

			return this.fMoveSort(oChange, this.oTable, this.mPropertyBag)
				.then(() => {
					assert.ok(true, "apply resolved (key was found, unexpected)");
				})
				.catch((oError) => {
					// markAsNotApplicable rejects with a plain object {message} — not an Error.
					// This is the expected outcome for an orphaned moveSort.
					assert.ok(!(oError instanceof Error), "rejected with notApplicable signal, not a real error");
				})
				.finally(() => {
					const aSorters = this.oTable.getSortConditions().sorters;
					assert.strictEqual(aSorters.length, 1, "sortConditions is unchanged — no entry was added or removed");
					assert.strictEqual(aSorters[0].key, "Amount", "existing sorter is still present");
					assert.ok(aSorters.every(Boolean), "no null entries in sorters array");
				});
		});
	});

	QUnit.test("moveSort on missing key with empty sorters array does not insert null", function(assert) {
		// No pre-existing sorters — this is the case that produced [null]
		this.oTable.setSortConditions({ sorters: [] });

		return ChangesWriteAPI.create({
			changeSpecificData: {
				changeType: "moveSort",
				selector: { id: "comp---view--myTable" },
				content: { key: "NetAmount", name: "NetAmount", index: 0 }
			},
			selector: this.oTable
		}).then((oChange) => {
			oChange.setRevertData({ key: "NetAmount", index: 0 });

			return this.fMoveSort(oChange, this.oTable, this.mPropertyBag)
				.then(() => {
					assert.ok(true, "apply resolved (key was found, unexpected)");
				})
				.catch((oError) => {
					assert.ok(!(oError instanceof Error), "rejected with notApplicable signal, not a real error");
				})
				.finally(() => {
					const aSorters = this.oTable.getSortConditions().sorters;
					assert.strictEqual(aSorters.length, 0, "sorters array remains empty — no null injected");
				});
		});
	});

	QUnit.test("moveSort on present key moves it correctly", function(assert) {
		this.oTable.setSortConditions({
			sorters: [
				{ key: "Amount", name: "Amount", descending: false },
				{ key: "NetAmount", name: "NetAmount", descending: true }
			]
		});

		return ChangesWriteAPI.create({
			changeSpecificData: {
				changeType: "moveSort",
				selector: { id: "comp---view--myTable" },
				content: { key: "NetAmount", name: "NetAmount", index: 0 }
			},
			selector: this.oTable
		}).then((oChange) => {
			oChange.setRevertData({ key: "NetAmount", index: 1 });

			return this.fMoveSort(oChange, this.oTable, this.mPropertyBag).then(() => {
				const aSorters = this.oTable.getSortConditions().sorters;
				assert.strictEqual(aSorters.length, 2, "sorter count unchanged");
				assert.strictEqual(aSorters[0].key, "NetAmount", "NetAmount moved to index 0");
				assert.strictEqual(aSorters[1].key, "Amount", "Amount shifted to index 1");
			});
		});
	});

	QUnit.module("moveSort.getCondenserInfo: affectedControl id includes sort direction", {
		beforeEach: function() {
			return createAppEnvironment(sTableView, "Table").then(async function(mCreatedApp) {
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oTable = this.oView.byId("myTable");
				this.mPropertyBag = {
					modifier: { bySelector: () => this.oTable },
					appComponent: this.oUiComponent
				};
			}.bind(this));
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("moveSort affectedControl id matches addSort id for descending sorter", function(assert) {
		this.oTable.setSortConditions({ sorters: [{ key: "NetAmount", name: "NetAmount", descending: true }] });

		return Promise.all([
			ChangesWriteAPI.create({
				changeSpecificData: {
					changeType: "addSort",
					selector: { id: "comp---view--myTable" },
					content: { key: "NetAmount", descending: true, index: 0 }
				},
				selector: this.oTable
			}),
			ChangesWriteAPI.create({
				changeSpecificData: {
					changeType: "moveSort",
					selector: { id: "comp---view--myTable" },
					content: { key: "NetAmount", index: 1 }
				},
				selector: this.oTable
			})
		]).then(([oAddChange, oMoveChange]) => {
			oMoveChange.setRevertData({ key: "NetAmount", index: 0 });

			const oAddInfo = SortFlex.addSort.changeHandler.getCondenserInfo(oAddChange, this.mPropertyBag);
			const oMoveInfo = SortFlex.moveSort.changeHandler.getCondenserInfo(oMoveChange, this.mPropertyBag);

			assert.strictEqual(oAddInfo.affectedControl.id, "NetAmount-desc",
				"addSort affectedControl id is NetAmount-desc");
			assert.strictEqual(oMoveInfo.affectedControl.id, "NetAmount-desc",
				"moveSort affectedControl id reads direction from live sorters");
			assert.strictEqual(oAddInfo.affectedControl.id, oMoveInfo.affectedControl.id,
				"addSort and moveSort land in the same condenser slot");
		});
	});

	QUnit.test("moveSort affectedControl id matches addSort id for ascending sorter", function(assert) {
		this.oTable.setSortConditions({ sorters: [{ key: "Amount", name: "Amount", descending: false }] });

		return Promise.all([
			ChangesWriteAPI.create({
				changeSpecificData: {
					changeType: "addSort",
					selector: { id: "comp---view--myTable" },
					content: { key: "Amount", descending: false, index: 0 }
				},
				selector: this.oTable
			}),
			ChangesWriteAPI.create({
				changeSpecificData: {
					changeType: "moveSort",
					selector: { id: "comp---view--myTable" },
					content: { key: "Amount", index: 1 }
				},
				selector: this.oTable
			})
		]).then(([oAddChange, oMoveChange]) => {
			oMoveChange.setRevertData({ key: "Amount", index: 0 });

			const oAddInfo = SortFlex.addSort.changeHandler.getCondenserInfo(oAddChange, this.mPropertyBag);
			const oMoveInfo = SortFlex.moveSort.changeHandler.getCondenserInfo(oMoveChange, this.mPropertyBag);

			assert.strictEqual(oAddInfo.affectedControl.id, oMoveInfo.affectedControl.id,
				"addSort and moveSort share the same condenser slot for ascending sorter");
		});
	});

	QUnit.test("moveSort affectedControl id falls back to asc when sorter is not in live array", function(assert) {
		this.oTable.setSortConditions({ sorters: [] });

		return ChangesWriteAPI.create({
			changeSpecificData: {
				changeType: "moveSort",
				selector: { id: "comp---view--myTable" },
				content: { key: "NetAmount", index: 0 }
			},
			selector: this.oTable
		}).then((oMoveChange) => {
			oMoveChange.setRevertData({ key: "NetAmount", index: 0 });

			const oMoveInfo = SortFlex.moveSort.changeHandler.getCondenserInfo(oMoveChange, this.mPropertyBag);
			assert.strictEqual(oMoveInfo.affectedControl.id, "NetAmount-asc",
				"falls back to asc when live sorter is not found");
		});
	});

});
