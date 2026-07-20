/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry",
	"sap/ui/rta/util/changeVisualization/ChangeStates",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Log,
	JsControlTreeModifier,
	Control,
	FlStates,
	ChangesWriteAPI,
	ChangeIndicatorRegistry,
	ChangeStates,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	function createMockChange(sId, sState) {
		const oChange = RtaQunitUtils.createUIChange({
			selector: {
				id: "myControl"
			},
			fileName: sId
		});
		oChange.setState(sState);
		oChange.markFinished();
		return oChange;
	}

	function createMockVersioning(aDraftChangeFileNames) {
		return {
			getData() {
				return {
					draftFilenames: aDraftChangeFileNames
				};
			}
		};
	}

	function registerChange(oRegistry, oChange, sCommandName, oVersionsModel) {
		oRegistry.addChangeToCatalog(oChange, sCommandName, oVersionsModel);
		// oAppComponent is undefined in tests — bySelector is stubbed and doesn't need it
		return oRegistry.resolveVisualizationInfo(oChange, undefined);
	}

	QUnit.module("Basic tests", {
		beforeEach() {
			this.oRegistry = new ChangeIndicatorRegistry({
				changeCategories: {
					fooCategory: [
						"foo"
					],
					barCategory: [
						"bar"
					]
				}
			});
			this.oControl = new Control("myControl");
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(this.oControl);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
		},
		afterEach() {
			this.oRegistry.destroy();
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when changes with valid command types are registered", async function(assert) {
			const oVersionsModel = createMockVersioning(["draftChange"]);
			await Promise.all([
				registerChange(this.oRegistry, createMockChange("fooChange", FlStates.LifecycleState.NEW), "foo", oVersionsModel),
				registerChange(this.oRegistry, createMockChange("barChange", FlStates.LifecycleState.PERSISTED), "bar", oVersionsModel),
				registerChange(this.oRegistry, createMockChange("draftChange", FlStates.LifecycleState.PERSISTED), "bar", oVersionsModel)
			]);
			assert.strictEqual(
				this.oRegistry.getSelectorsWithRegisteredChanges().myControl.length,
				3,
				"then the selector has the correct number of changes"
			);
			assert.deepEqual(
				this.oRegistry.getRegisteredChangeIds(),
				["fooChange", "barChange", "draftChange"],
				"then the change ids are registered"
			);
			assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 3, "then the changes are added to the registry");
			assert.strictEqual(
				this.oRegistry.getRegisteredChange("fooChange").changeCategory,
				"fooCategory",
				"then the command categories are properly classified"
			);
			assert.deepEqual(
				this.oRegistry.getRegisteredChange("fooChange").changeStates,
				ChangeStates.getDraftAndDirtyStates(),
				"then the change state is properly classified (Dirty & Draft)"
			);
			assert.deepEqual(
				this.oRegistry.getRegisteredChange("barChange").changeStates,
				[ChangeStates.ALL],
				"then the change state is properly classified (All)"
			);
			assert.deepEqual(
				this.oRegistry.getRegisteredChange("draftChange").changeStates,
				[ChangeStates.DRAFT],
				"then the change state is properly classified (Draft)"
			);
		});

		QUnit.test("when a change with an invalid command type is registered", async function(assert) {
			await registerChange(this.oRegistry, createMockChange("bazChange"), "baz");
			assert.ok(this.oRegistry.getRegisteredChange("bazChange"), "then it is added to the registry");
		});

		QUnit.test("when a settings command change is registered with a valid category", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						descriptionPayload: {
							category: "fooCategory"
						}
					};
				}
			});
			await registerChange(this.oRegistry, createMockChange("id1"), "settings");
			assert.strictEqual(
				this.oRegistry.getRegisteredChange("id1").changeCategory,
				"fooCategory",
				"then the category is considered"
			);
		});

		QUnit.test("when a settings command change is registered with an invalid category", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						descriptionPayload: {
							category: "move123"
						}
					};
				}
			});
			await registerChange(this.oRegistry, createMockChange("id1"), "settings");
			assert.strictEqual(
				this.oRegistry.getRegisteredChange("id1").changeCategory,
				"other",
				"then the category is set to 'other'"
			);
		});

		QUnit.test("when a settings command change is registered with getChangeHandler rejecting", async function(assert) {
			const oLogStub = sandbox.stub(Log, "error");
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.rejects("foo");
			await registerChange(this.oRegistry, createMockChange("id1"), "settings");
			assert.strictEqual(oLogStub.callCount, 1, "then an error is logged");
			assert.ok(this.oRegistry.getRegisteredChange("id1"), "then the change is still added");
		});

		QUnit.test("when a not settings command change is registered with a category", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						descriptionPayload: {
							category: "fooCategory"
						}
					};
				}
			});
			await registerChange(this.oRegistry, createMockChange("id1"), "bar");
			assert.strictEqual(this.oRegistry.getRegisteredChange("id1").changeCategory, "barCategory", "then the category is ignored");
		});

		QUnit.test("when a registered change has the updateRequired flag it is invalidated (not removed from the catalog)", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler
			.onFirstCall()
			.resolves({
				getChangeVisualizationInfo() {
					return {
						updateRequired: true
					};
				}
			})
			.onSecondCall()
			.resolves({
				getChangeVisualizationInfo() {
					return {
						updateRequired: false
					};
				}
			});
			await Promise.all([
				registerChange(this.oRegistry, createMockChange("fooChange"), "foo"),
				registerChange(this.oRegistry, createMockChange("barChange"), "bar")
			]);
			assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 2, "then both changes are registered");
			this.oRegistry.invalidateOutdatedResolutions();

			// updateRequired entry is invalidated: catalog kept, cache cleared
			assert.strictEqual(this.oRegistry.getCatalogIds().length, 2, "then the catalog still holds both changes");
			assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 1, "then only the non-outdated change is still resolved");
			assert.strictEqual(this.oRegistry.getUnresolvedChangeIds().length, 1, "then the outdated change is unresolved");
			assert.notOk(
				this.oRegistry.getAllRegisteredChanges()[0].visualizationInfo.updateRequired,
				"then the remaining resolved change has no updateRequired flag"
			);
		});

		QUnit.test("when a registered change has no displayElementId it is invalidated (not removed from the catalog)", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves();
			await Promise.all([
				registerChange(this.oRegistry, createMockChange("fooChange"), "foo"),
				registerChange(this.oRegistry, createMockChange("barChange"), "bar")
			]);
			assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 2, "then both changes are registered");

			// Simulate a change whose displayElementIds resolved to [] (control absent),
			// then invalidate it directly (removeRegisteredChangesWithoutVizInfo is removed).
			this.oRegistry._oResolutionCache.fooChange.displayElementIds = [];
			this.oRegistry.invalidateResolution("fooChange");

			assert.strictEqual(this.oRegistry.getCatalogIds().length, 2, "then the catalog still holds both changes");
			assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 1,
				"then only the change with display elements is resolved");
			assert.strictEqual(this.oRegistry.getUnresolvedChangeIds().length, 1, "then the change without display elements is unresolved");
			assert.strictEqual(
				this.oRegistry.getAllRegisteredChanges()[0].visualizationInfo.displayElementIds.length,
				1,
				"then the remaining resolved change has a display element id"
			);
		});

		QUnit.test("getCatalogEntry and getCatalogIds return catalog data independently of resolution", async function(assert) {
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			assert.ok(this.oRegistry.getCatalogEntry("fooChange"), "then getCatalogEntry returns the catalog entry");
			assert.deepEqual(this.oRegistry.getCatalogIds(), ["fooChange"], "then getCatalogIds lists all catalog entries");

			this.oRegistry.invalidateResolution("fooChange");
			assert.ok(this.oRegistry.getCatalogEntry("fooChange"), "then the catalog entry is still present after invalidation");
			assert.deepEqual(this.oRegistry.getUnresolvedChangeIds(), ["fooChange"], "then the change is listed as unresolved");
			assert.deepEqual(this.oRegistry.getAllRegisteredChanges(), [], "then no changes are returned as registered (resolved)");
		});

		QUnit.test("getChangeIdsForSelector returns change ids from the reverse index", async function(assert) {
			await registerChange(this.oRegistry, createMockChange("fooChange", "NEW"), "foo");
			const aIds = this.oRegistry.getChangeIdsForSelector("myControl");
			assert.deepEqual(aIds, ["fooChange"], "then the change id is returned for the selector element id");
			assert.deepEqual(
				this.oRegistry.getChangeIdsForSelector("unknownElement"),
				[],
				"then an empty array is returned for unknown elements"
			);
		});

		QUnit.test("resolveVisualizationInfo returns undefined when the change is not in the catalog", async function(assert) {
			const oChange = createMockChange("unknownChange");
			const oResult = await this.oRegistry.resolveVisualizationInfo(oChange, undefined);
			assert.strictEqual(oResult, undefined, "then undefined is returned for a change not in the catalog");
		});

		QUnit.test("hasChangesForElement returns false for an element with no index entry", async function(assert) {
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			assert.strictEqual(
				this.oRegistry.hasChangesForElement("elementNotInIndex"),
				false,
				"then false is returned for an element not in the element index"
			);
		});

		QUnit.test("hasChangesForElement matches affected elements that are not display elements", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					// display element (host) differs from the affected element (templated instance)
					return {
						displayControls: [{ id: "displayHost" }],
						affectedControls: [{ id: "affectedInstance" }]
					};
				}
			});
			JsControlTreeModifier.bySelector.callsFake((oSelector) => ({ getId: () => oSelector.id }));

			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			assert.ok(this.oRegistry.hasChangesForElement("displayHost"), "then the display element is matched");
			assert.ok(this.oRegistry.hasChangesForElement("affectedInstance"), "then the affected-only element is also matched");
		});

		QUnit.test("getVisualizationInfo uses originalSelector as display selector for template changes", async function(assert) {
			const oChange = RtaQunitUtils.createUIChange({
				selector: { id: "myControl" },
				fileName: "templateChange"
			});
			oChange.setState(FlStates.LifecycleState.NEW);
			oChange.markFinished();
			// Simulate a change with an originalSelector (template host)
			oChange.getOriginalSelector = () => ({ id: "templateHost" });

			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return { affectedControls: [{ id: "myControl" }] };
				}
			});

			this.oRegistry.addChangeToCatalog(oChange, "foo");
			const oResult = await this.oRegistry.resolveVisualizationInfo(oChange, undefined);
			// When originalSelector is present, displayElementIds should use the change selector (myControl),
			// not the affectedControls — that is the template-host display logic.
			assert.ok(oResult, "then vizInfo is resolved");
			assert.ok(Array.isArray(oResult.displayElementIds), "then displayElementIds is an array");
		});

		QUnit.test("getVisualizationInfo resolves dependent controls", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						affectedControls: [{ id: "myControl" }],
						dependentControls: [{ id: "myControl" }]
					};
				}
			});
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			const oEntry = this.oRegistry.getRegisteredChange("fooChange");
			assert.deepEqual(
				oEntry.visualizationInfo.dependentElementIds,
				["myControl"],
				"then dependent element ids are resolved"
			);
		});

		QUnit.test("getSelectorIds handles a selector that is already a control instance", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					// Return a control instance (with getId) instead of a selector object
					return {
						affectedControls: [{ getId: () => "myControl" }]
					};
				}
			});
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			const oEntry = this.oRegistry.getRegisteredChange("fooChange");
			assert.deepEqual(
				oEntry.visualizationInfo.affectedElementIds,
				["myControl"],
				"then a control instance with getId is resolved directly without bySelector"
			);
		});

		QUnit.test("getVisualizationInfo uses explicit displayControls when provided", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						affectedControls: [{ id: "myControl" }],
						displayControls: [{ id: "myControl" }]
					};
				}
			});
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			const oEntry = this.oRegistry.getRegisteredChange("fooChange");
			// Both resolve to "myControl" because bySelector is stubbed to return that control.
			// The key assertion is that displayControls is used and both are populated.
			assert.deepEqual(
				oEntry.visualizationInfo.displayElementIds, ["myControl"],
				"then displayControls overrides the default display calculation"
			);
			assert.deepEqual(
				oEntry.visualizationInfo.affectedElementIds, ["myControl"],
				"then affectedControls is also resolved"
			);
		});

		QUnit.test("getVisualizationInfo sets updateRequired when handler signals it", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						affectedControls: [{ id: "myControl" }],
						updateRequired: true
					};
				}
			});
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			const oEntry = this.oRegistry.getRegisteredChange("fooChange");
			assert.strictEqual(
				oEntry.visualizationInfo.updateRequired, true,
				"then updateRequired is propagated from the change handler"
			);
		});

		QUnit.test("getSelectorsWithRegisteredChanges handles more display ids than affected ids", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						affectedControls: [{ id: "myControl" }],
						displayControls: [{ id: "myControl" }, { id: "myControl" }]
					};
				}
			});
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			const oSelectors = this.oRegistry.getSelectorsWithRegisteredChanges();
			assert.ok(oSelectors.myControl, "then the display element is in the selectors map");
		});

		QUnit.test("getVisualizationInfo defaults descriptionPayload and arrays when handler returns no payload", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					// No affectedControls, no dependentControls, no descriptionPayload
					return {};
				}
			});
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			const oEntry = this.oRegistry.getRegisteredChange("fooChange");
			assert.deepEqual(oEntry.visualizationInfo.descriptionPayload, {}, "then descriptionPayload defaults to {}");
			assert.deepEqual(oEntry.visualizationInfo.dependentElementIds, [], "then dependentElementIds defaults to []");
		});

		QUnit.test("removeRegisteredChange cleans catalog, resolution cache, selector index and display index", async function(assert) {
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			assert.ok(this.oRegistry.getCatalogEntry("fooChange"), "precondition: change is in catalog");
			assert.ok(this.oRegistry.getRegisteredChange("fooChange"), "precondition: change is resolved");
			assert.ok(
				this.oRegistry.getChangeIdsForSelector("myControl").includes("fooChange"),
				"precondition: change is in selector index"
			);
			assert.ok(this.oRegistry.hasChangesForElement("myControl"), "precondition: change is in element index");

			this.oRegistry.removeRegisteredChange("fooChange");

			assert.strictEqual(this.oRegistry.getCatalogEntry("fooChange"), undefined, "then catalog entry is removed");
			assert.strictEqual(this.oRegistry.getRegisteredChange("fooChange"), undefined, "then resolved entry is removed");
			assert.notOk(
				this.oRegistry.getChangeIdsForSelector("myControl").includes("fooChange"),
				"then selector index entry is removed"
			);
			assert.notOk(this.oRegistry.hasChangesForElement("myControl"), "then element index entry is removed");

			// calling removeRegisteredChange on an unknown id must not throw
			this.oRegistry.removeRegisteredChange("unknownChange");
			assert.ok(true, "then removing an unknown id does not throw");
		});

		QUnit.test("getRegisteredChange and getCatalogEntry return undefined for unknown ids", function(assert) {
			assert.strictEqual(
				this.oRegistry.getRegisteredChange("unknownChange"),
				undefined,
				"then getRegisteredChange returns undefined for an unknown id"
			);
			assert.strictEqual(
				this.oRegistry.getCatalogEntry("unknownChange"),
				undefined,
				"then getCatalogEntry returns undefined for an id not in the catalog"
			);
		});

		QUnit.test("hasPersistedChanges returns true for a resolved persisted change", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return { affectedControls: [{ id: "myControl" }] };
				}
			});
			const oChange = createMockChange("persistedChange", FlStates.LifecycleState.PERSISTED);
			oChange.isSuccessfullyApplied = () => true;
			await registerChange(this.oRegistry, oChange, "foo", createMockVersioning([]));
			assert.strictEqual(
				this.oRegistry.hasPersistedChanges(), true,
				"then true is returned when a resolved persisted change is applied"
			);
		});

		QUnit.test("hasChangesForElement: filter callbacks and stale index entries", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return { affectedControls: [{ id: "myControl" }] };
				}
			});
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			assert.strictEqual(
				this.oRegistry.hasChangesForElement("myControl", () => true),
				true,
				"then true is returned when filter passes"
			);
			assert.strictEqual(
				this.oRegistry.hasChangesForElement("myControl", () => false),
				false,
				"then false is returned when filter rejects all entries"
			);
			// Simulate stale index by removing the catalog entry but leaving the display index
			delete this.oRegistry._oChangeCatalog.fooChange;
			assert.strictEqual(
				this.oRegistry.hasChangesForElement("myControl"),
				false,
				"then false is returned when catalog entry is missing (stale index)"
			);
		});

		QUnit.test("getSelectorsWithRegisteredChanges uses descriptionPayload fallback to {} when absent", async function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					// No descriptionPayload — tests the || {} branch in getSelectorsWithRegisteredChanges
					return { affectedControls: [{ id: "myControl" }] };
				}
			});
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			const oSelectors = this.oRegistry.getSelectorsWithRegisteredChanges();
			assert.deepEqual(
				oSelectors.myControl[0].descriptionPayload,
				{},
				"then descriptionPayload defaults to {} in the selector entry"
			);
		});

		QUnit.test("getChangeInfosForElement: match by display/affected id, filter, deduplication, and affectedIds fallback", async function(assert) {
			await registerChange(this.oRegistry, createMockChange("fooChange"), "foo");
			// Matching by displayElementId
			const aInfos = this.oRegistry.getChangeInfosForElement("myControl");
			assert.strictEqual(aInfos.length, 1, "then one change info is returned for the display element");
			assert.strictEqual(aInfos[0].id, "fooChange", "then the correct change is returned");

			// Unknown element returns empty
			assert.deepEqual(this.oRegistry.getChangeInfosForElement("unknownElement"), [], "then empty array for an unknown element");

			// fnFilter rejected
			assert.deepEqual(this.oRegistry.getChangeInfosForElement("myControl", () => false), [], "then empty when filter rejects");

			// Deduplication: myControl is in both display and affected ids — must appear only once
			assert.strictEqual(aInfos.length, 1, "then the change appears only once despite matching both paths");

			// Matching by affectedElementIds when element is not in displayElementIds
			this.oRegistry._oResolutionCache.fooChange.affectedElementIds = ["myControl", "extraAffected"];
			const aAffectedInfos = this.oRegistry.getChangeInfosForElement("extraAffected");
			assert.strictEqual(aAffectedInfos.length, 1, "then the change is found via affectedElementIds");
			assert.strictEqual(aAffectedInfos[0].id, "fooChange", "then the correct change id is returned");
		});

		QUnit.test("refreshChangeStates reclassifies catalog entries after version activation", async function(assert) {
			const oVersionsModelDraft = createMockVersioning(["fooChange"]);
			const oVersionsModelActivated = createMockVersioning([]); // no more drafts
			await registerChange(this.oRegistry,
				createMockChange("fooChange", FlStates.LifecycleState.PERSISTED), "foo", oVersionsModelDraft
			);
			assert.deepEqual(
				this.oRegistry.getRegisteredChange("fooChange").changeStates,
				[ChangeStates.DRAFT],
				"then the change starts as DRAFT"
			);
			this.oRegistry.refreshChangeStates(oVersionsModelActivated);
			assert.deepEqual(
				this.oRegistry.getRegisteredChange("fooChange").changeStates,
				[ChangeStates.ALL],
				"then the change is reclassified to ALL after activation"
			);
		});
	});

	QUnit.module("Cleanup", {
		beforeEach() {
			this.oRegistry = new ChangeIndicatorRegistry({
				changeCategories: {
					fooCategory: [
						"foo"
					]
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the registry is destroyed", async function(assert) {
			await Promise.all([
				registerChange(this.oRegistry, createMockChange("fooChange"), "foo"),
				registerChange(this.oRegistry, createMockChange("barChange"), "bar")
			]);
			this.oRegistry.destroy();
			assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 0, "then all changes are deleted");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
