/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController",
	"./PresetsController",
	"../models/SharedModel",
	"../models/TableSettingsModel",
	"../models/SelectionUtils",
	"../models/PresetsUtils",
	"../models/CustomJSONListSelection",
	"sap/base/util/deepExtend",
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/Fragment",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/ui/support/supportRules/CommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage"
], function(
	BaseController,
	PresetsController,
	SharedModel,
	TableSettingsModel,
	SelectionUtils,
	PresetsUtils,
	CustomJSONListSelection,
	deepExtend,
	Element,
	JSONModel,
	BindingMode,
	Fragment,
	mLibrary,
	MessageToast,
	MessageBox,
	List,
	StandardListItem,
	ColumnMenu,
	ActionItem,
	Dialog,
	Button,
	CommunicationBus,
	channelNames,
	RuleSerializer,
	Constants,
	Storage
) {
	"use strict";

	return BaseController.extend("sap.ui.support.supportRules.ui.controllers.Analysis", {

		onInit: function () {
			this.model = SharedModel;
			this.setCommunicationSubscriptions();
			this.getView().setModel(this.model);
			this.treeTable = SelectionUtils.treeTable = this.byId("ruleList");
			this._oRuleSetsModel = new JSONModel();
			this.treeTable.setModel(this._oRuleSetsModel, "ruleSets");
			this.treeTable.setModel(TableSettingsModel, "tableSettings");
			this.ruleSetView = this.byId("ruleSetsView");
			this.rulesViewContainer = this.byId("rulesNavContainer");
			this.bAdditionalViewLoaded = false;
			this.bAdditionalRulesetsLoaded = false;
			this.bInitFired = false;

			/* eslint-disable no-new */
			//attach adapter for custom selection
			new CustomJSONListSelection(this.treeTable, true, "id");
			/* eslint-enable no-new */

			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, function () {
				if (!this.bAdditionalViewLoaded) {
					CommunicationBus.publish(channelNames.RESIZE_FRAME, { bigger: true });

					this.bAdditionalViewLoaded = true;
					this.loadAdditionalUI();
				}
			}, this);

			if (this.model.getProperty("/persistingSettings")) {
				var aColumnsIds = Storage.getVisibleColumns() || [];
				if (aColumnsIds.length) {
					this.setColumnVisibility(aColumnsIds, true);
				}
			}

			this.byId("presetVariant").addEventDelegate({
				onclick: this.onPresetVariantClick.bind(this)
			});

			this._associateTableColumnsMenu();
		},

		onAfterRendering: function () {
			if (!this.bInitFired) {
				CommunicationBus.publish(channelNames.ON_INIT_ANALYSIS_CTRL);
				this.bInitFired = true;
			}
		},

		loadAdditionalUI: function () {
			if (!this._ruleDetails) {
				this._ruleDetails = Fragment.load({
					name: "sap.ui.support.supportRules.ui.views.RuleDetails",
					controller: this
				}).then(function (ruleDetails) {
					this.byId("rulesDisplayPage").addContentArea(ruleDetails);
				}.bind(this));
			}

			this._updateRuleList();
		},

		setCommunicationSubscriptions: function () {
			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, this.updateSupportRules, this);

			CommunicationBus.subscribe(channelNames.POST_AVAILABLE_LIBRARIES, function (data) {
				this.bAdditionalRulesetsLoaded = true;
				this.model.setProperty("/availableLibrariesSet", data.libNames);
				this.rulesViewContainer.setBusy(false);
			}, this);

			CommunicationBus.subscribe(channelNames.POST_AVAILABLE_COMPONENTS, function (data) {
				var executionScopeComponents = [],
					modelScopeComponents = this.model.getProperty("/executionScopeComponents"),
					savedComponents = Storage.getSelectedScopeComponents(),
					index;

				for (var componentIndex = 0; componentIndex < data.length; componentIndex += 1) {
					executionScopeComponents.push({ text: data[componentIndex] });
				}
				if (modelScopeComponents && modelScopeComponents.length > 0) {
					for (index = 0; index < executionScopeComponents.length; index++) {
						executionScopeComponents[index].selected = this.checkIfComponentIsSelected(executionScopeComponents[index], modelScopeComponents);
					}
				} else if (savedComponents && savedComponents.length > 0) {
					for (index = 0; index < executionScopeComponents.length; index++) {
						executionScopeComponents[index].selected = this.checkIfComponentIsSelected(executionScopeComponents[index], savedComponents);
					}
				}

				this.model.setProperty("/executionScopeComponents", executionScopeComponents);
			}, this);

			// Called when new rule sets are loaded with all rulesets
			// "oRuleSets" is fresh object and all selections so far have to be applied on it
			CommunicationBus.subscribe(channelNames.GET_RULES_MODEL, function (oRuleSets) {
				var bPersistSettings = Storage.readPersistenceCookie(Constants.COOKIE_NAME),
					bLoadingAdditionalRuleSets = this.model.getProperty("/loadingAdditionalRuleSets");

				// Keep selection when additional rulesets are loaded
				if (bLoadingAdditionalRuleSets) {
					SelectionUtils._syncSelectionAdditionalRuleSetsMainModel(oRuleSets, this._oRuleSetsModel.getData());
					SelectionUtils._deselectAdditionalRuleSets(oRuleSets, this.model.getProperty("/namesOfLoadedAdditionalRuleSets"));
				}

				if (bPersistSettings) {
					//Selection should be applied from local storage
					// Syncs selection for all libs
					var oUpdatedRules = SelectionUtils.updateSelectedRulesFromLocalStorage(oRuleSets);
					// In case of deleted local storage item
					if (oUpdatedRules) {
						oRuleSets = oUpdatedRules;
					}

					PresetsUtils.loadCustomPresets();
				}

				this._oRuleSetsModel.setData(oRuleSets);

				if (bPersistSettings || bLoadingAdditionalRuleSets) {
					this.treeTable.updateSelectionFromModel();
				} else {
					this.treeTable.selectAll();
				}

				this.model.setProperty("/selectedRulesCount", SelectionUtils.getSelectedRules().length);

				PresetsUtils.initializeSelectionPresets(SelectionUtils.getSelectedRules());

			}, this);

			CommunicationBus.subscribe(channelNames.POST_MESSAGE, function (data) {
				MessageToast.show(data.message);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_ANALYZE_STARTED, function (data) {
				this.model.setProperty("/showProgressIndicator", true);
			}, this);
		},

		/**
		 * Checks if given execution scope component is selected comparing against an array of settings
		 * @param {Object} component The current component object to be checked
		 * @param {Array} savedComponents The local storage settings for the checked execution scope components
		 * @returns {boolean} If the component is checked or not
		 */
		checkIfComponentIsSelected: function (component, savedComponents) {
			for (var index = 0; index < savedComponents.length; index += 1) {
				if (savedComponents[index].text == component.text && savedComponents[index].selected) {
					return true;
				}
			}
			return false;
		},

		onAnalyze: function () {
			var currentPreset = this.model.getProperty("/selectionPresetsCurrent"),
				oExecutionContext = this._getExecutionContext();

			if (currentPreset.selections.length === 0) {
				MessageToast.show("Select some rules to be analyzed.");
				return;
			}

			if (oExecutionContext.type === "components" && oExecutionContext.components.length === 0) {
				MessageToast.show("Please select some components to be analyzed.");
				return;
			}

			CommunicationBus.publish(channelNames.ON_ANALYZE_REQUEST, {
				rulePreset: currentPreset,
				executionContext: oExecutionContext
			});
		},

		_getExecutionContext: function () {
			var ctx = {
				type: this.model.getProperty("/analyzeContext/key")
			};

			// TODO: these "if"s can be consistently turned into switch with constants
			if (ctx.type === "subtree") {
				ctx.parentId = this.model.getProperty("/subtreeExecutionContextId");
			}

			if (ctx.type === "components") {
				var selectionContainer = Element.getElementById("componentsSelectionContainer"),
					cbs = selectionContainer.getContent();

				ctx.components = [];
				cbs.forEach(function (checkBox) {
					if (checkBox.getSelected()) {
						ctx.components.push(checkBox.getText());
					}
				});
			}

			return ctx;
		},

		/**
		 * On selecting "Additional RuleSet" tab, start loading Additional RuleSets by brute search.
		 * @param {Event} oEvent TreeTable event
		 */
		onSelectedRuleSets: function (oEvent) {
			var bShowRuleProperties = true,
				oSelectedRule = this.model.getProperty("/selectedRule"),
				bAdditionalRulesetsTab = oEvent.getParameter("selectedKey") === "additionalRulesets";

			if (bAdditionalRulesetsTab || !oSelectedRule) {
				bShowRuleProperties = false;
			}

			// Ensure we don't make unnecessary requests. The requests will be made only
			// the first time the user clicks AdditionalRulesets tab.
			if (!this.bAdditionalRulesetsLoaded && bAdditionalRulesetsTab) {
				this.rulesViewContainer.setBusyIndicatorDelay(0);
				this.rulesViewContainer.setBusy(true);
				CommunicationBus.publish(channelNames.GET_NON_LOADED_RULE_SETS, {
					loadedRulesets: this._getLoadedRulesets()
				});
			}

			this.getView().getModel().setProperty("/showRuleProperties", bShowRuleProperties);
		},

		/**
		 * @private
		 * @returns {Array} All currently loaded rulesets.
		 */
		_getLoadedRulesets: function () {
			var oRulesSts = this.treeTable.getModel("ruleSets").getData(),
				aLoadedLibraries = [];

			Object.keys(oRulesSts).forEach(function (sKey) {
				var sLibraryName = oRulesSts[sKey].name;
				if (sLibraryName) {
					aLoadedLibraries.push(sLibraryName);
				}
			});

			return aLoadedLibraries;
		},

		_hasSelectedComponent: function () {
			var aAllComponentElements = Element.getElementById("componentsSelectionContainer").getContent();
			function isSelected(oComponent) {
				return oComponent.getSelected();
			}

			return aAllComponentElements.some(isSelected);
		},

		onAnalyzeSettings: function (oEvent) {
			var oSource = oEvent.getSource();

			CommunicationBus.publish(channelNames.GET_AVAILABLE_COMPONENTS);

			if (!this._analyzeSettingsPopover) {
				this._analyzeSettingsPopover = Fragment.load({
					name: "sap.ui.support.supportRules.ui.views.AnalyzeSettings",
					controller: this
				}).then(function (analyzeSettingsPopover) {
					this.getView().addDependent(analyzeSettingsPopover);
					return analyzeSettingsPopover;
				}.bind(this));
			}

			this._analyzeSettingsPopover.then(function (analyzeSettingsPopover) {
				analyzeSettingsPopover.openBy(oSource);
			});
		},

		onContextSelect: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				var source = oEvent.getSource(),
					radioKey = source.getCustomData()[0].getValue(),
					execScope = this.model.getProperty("/executionScopes")[radioKey];
				if (radioKey === "components" && !this._hasSelectedComponent()) {
					var aComponents = Element.getElementById("componentsSelectionContainer").getContent();
					if (aComponents.length > 0) {
						aComponents[0].setSelected(true);
						this.onScopeComponentSelect(null);
					}
				}
				this.model.setProperty("/analyzeContext", execScope);
			}

			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				this.persistExecutionScope();
			}
		},

		onExecutionContextChange: function (event) {
			var value = event.getSource().getValue();

			if (value) {
				this.model.setProperty("/subtreeExecutionContextId", value);
			}

			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				this.persistExecutionScope();
			}
		},

		onScopeComponentSelect: function (event) {
			var scopeComponents = this.model.getProperty("/executionScopeComponents");
			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				Storage.setSelectedScopeComponents(scopeComponents);
			}
		},

		onBeforePopoverOpen: function () {
			if (this.model.getProperty("/executionScopeComponents").length === 0) {
				CommunicationBus.publish(channelNames.GET_AVAILABLE_COMPONENTS);
			}
		},

		createNewRulePress: function (oEvent) {
			MessageBox.warning(
				"Temporary rules have been deprecated and are non-functional anymore. Please use library rulesets instead.",
				{
					details: "See documentation about <a href='https://ui5.sap.com/#/topic/b5a51358b3574aea9143fa50ae4e0e2a' target='_blank'>library rulesets</a>.",
					contentWidth: "400px"
				}
			);
		},

		createRuleString: function (rule) {
			// FIXME
			// Need to return empty string when rule is undefined
			// it happens when tool is injected from outside
			if (!rule) {
				return '';
			}

			var str = "{\n",
				count = 0,
				keysLength = Object.keys(rule).length;

			for (var key in rule) {
				var value = rule[key];
				count++;
				str += "\t";
				str += key + ": ";
				if (key === "check") {
					str += value.split("\n").join("\n\t");
				} else {
					str += JSON.stringify(value);
				}

				//Don't add comma after last value
				if (count < keysLength) {
					str += ",";
				}

				str += "\n";
			}
			str += "}";
			return str;
		},

		updateSupportRules: function (data) {
			data = RuleSerializer.deserialize(data.sRuleSet);

			CommunicationBus.publish(channelNames.REQUEST_RULES_MODEL, data);

			var libraries = [],
				that = this;

			for (var i in data) {
				var rules = [],
					ruleSets = data[i].ruleset._mRules;

				for (var j in ruleSets) {
					var rule = ruleSets[j];
					rule.libName = i;
					rule.selected = true;
					rules.push(rule);

				}

				libraries.push({
					title: i,
					type: "library",
					rules: rules,
					selected: true
				});

			}

			// Set first rule from first library (there are no temporary rules anymore)
			var firstSelectedRule = libraries[0].rules[0];

			that.model.setProperty("/selectedRuleStringify", "");
			that.model.setProperty("/selectedRule", firstSelectedRule);
			that.model.setProperty("/selectedRuleStringify", that.createRuleString(firstSelectedRule));
			that.model.setProperty("/libraries", libraries);

			var loadingFromAdditionalRuleSets = that.model.getProperty("/loadingAdditionalRuleSets");

			if (loadingFromAdditionalRuleSets) {
				MessageToast.show("Additional rule set(s) loaded!");
				this.ruleSetView.setSelectedKey("availableRules");
			}
		},

		loadMarkedSupportLibraries: function () {
			var list = this.byId("availableLibrariesSet"),
				aLibNames = [],
				aAvailableRulesets = this.model.getProperty("/availableLibrariesSet");

			aLibNames = list.getSelectedItems().map(function (item) {
				return item.getTitle();
			});

			list.getItems().forEach(function (item) {
				item.setSelected(false);

			});

			if (aLibNames.length > 0) {
				aAvailableRulesets = aAvailableRulesets.filter(function (sLibName) {
					return aLibNames.indexOf(sLibName) < 0;
				});
				this.model.setProperty("/availableLibrariesSet", aAvailableRulesets);

				this.model.setProperty("/namesOfLoadedAdditionalRuleSets", aLibNames);
				CommunicationBus.publish(channelNames.LOAD_RULESETS, {
					aLibNames: { publicRules: aLibNames, internalRules: aLibNames }
				});
				this.model.setProperty("/loadingAdditionalRuleSets", true);
				this.model.setProperty("/showRuleProperties", true);
			} else {
				MessageToast.show("Select additional RuleSet to be loaded.");
			}
		},

		onCellClick: function (oEvent) {
			if (oEvent.getParameter("rowBindingContext")) {
				var oSelection = oEvent.getParameter("rowBindingContext").getObject(),
					oSelectedRule,
					sRule = "",
					bShowRuleProperties = false;

				if (oSelection.id && oSelection.type !== "lib") {
					oSelectedRule = this.getMainModelFromTreeViewModel(oSelection);
					sRule = this.createRuleString(oSelectedRule);
					bShowRuleProperties = true;
				}

				this.model.setProperty("/selectedRuleStringify", sRule);
				this.model.setProperty("/selectedRule", oSelectedRule);
				this.model.setProperty("/showRuleProperties", bShowRuleProperties);
			}
		},

		onRowSelectionChange: function (oEvent) {
			if (oEvent.getParameter("userInteraction")) {
				PresetsUtils.syncCurrentSelectionPreset(SelectionUtils.getSelectedRules());
			}
		},

		getMainModelFromTreeViewModel: function (selectedRule) {

			var structeredRulesModel = this.model.getProperty("/libraries"),
				mainModelRule = null;

			structeredRulesModel.forEach(function (lib, index) {
				structeredRulesModel[index].rules.forEach(function (element) {
					if (selectedRule.id === element.id) {
						mainModelRule = element;
					}
				});
			});

			return mainModelRule;
		},

		/**
		* Gets rule from selected row
		* @param {Object} event Event
		* @returns {Object} ISelected rule from row
		***/
		getObjectOnTreeRow: function (event) {
			var sPath = event.getSource().getBindingContext("ruleSets").getPath(),
				sourceObject = this.treeTable.getBinding().getModel().getProperty(sPath),
				libs = this.model.getProperty("/libraries");

			libs.forEach(function (lib, libIndex) {
				lib.rules.forEach(function (rule) {
					if (rule.id === sourceObject.id) {
						sourceObject.check = rule.check;
					}
				});
			});
			return sourceObject;
		},

		_updateRuleList: function() {
			var oRuleList = this.getView().byId("ruleList");
			oRuleList.setRowActionCount(1);
		},

		/**
		 * Sets visibility to columns.
		 * @param {Array} aColumnsIds Ids of columns
		 * @param {boolean} bVisibilityValue
		 **/
		setColumnVisibility: function (aColumnsIds, bVisibilityValue) {
			var aColumns = this.treeTable.getColumns();

			aColumns.forEach(function(oColumn) {
				oColumn.setVisible(!bVisibilityValue);
				aColumnsIds.forEach(function(sRuleId) {
					if (oColumn.sId.includes(sRuleId)) {
						oColumn.setVisible(bVisibilityValue);
					}
				});
			});
		},

		/**
		 * Handles the selection presets variant selector click.
		 * Opens selection presets popover.
		 */
		onPresetVariantClick: function () {
			if (!this._PresetsController) {
				this._PresetsController = new PresetsController(this.model, this.getView());
			}
			this._PresetsController.openPresetVariant();
		},

		_associateTableColumnsMenu: function () {
			const oColumnsData = TableSettingsModel.getProperty("/columns");
			const oList = new List({
				mode: mLibrary.ListMode.MultiSelect
			});
			oList.setModel(TableSettingsModel, "tableSettings");

			for (const sColumnKey in oColumnsData) {
				if (oColumnsData[sColumnKey].visibilityConfigurable) {
					oList.addItem(new StandardListItem({
						title: `{tableSettings>/columns/${sColumnKey}/title}`,
						selected: {
							model: "tableSettings",
							path: `/columns/${sColumnKey}/visible`,
							mode: BindingMode.OneWay
						}
					}));
				}
			}

			const oColumnsMenu = new ColumnMenu("tableColumnMenu", {
				beforeOpen: function () {
					oList.getItems().forEach(function (oItem) {
						oItem.setSelected(oItem.getBinding("selected").getValue());
					});
				},
				items: [
					new ActionItem({
						label: "Columns",
						press: function(oEvent) {
							var oDialog = oEvent.getSource().getDependents()[0];
							if (!oDialog) {
								oDialog = new Dialog({
									type: mLibrary.DialogType.Message,
									title: "Columns",
									content: oList,
									beginButton: new Button({
										type: mLibrary.ButtonType.Emphasized,
										text: "Ok",
										press: function () {
											oList.getItems().forEach(function (oItem) {
												TableSettingsModel.setProperty(oItem.getBinding("selected").getPath(), oItem.getSelected());
											});

											if (this.model.getProperty("/persistingSettings")) {
												this.persistVisibleColumns();
											}
											oDialog.close();
										}.bind(this)
									}),
									endButton: new Button({
										text: "Cancel",
										press: function () {
											oDialog.close();
										}
									})
								});
								oEvent.getSource().addDependent(oDialog);
							}
							oDialog.open();
						}.bind(this)
					})
				]
			});

			this.getView().addDependent(oColumnsMenu);

			for (const sColumnKey in oColumnsData) {
				this.byId(sColumnKey + "Column").setHeaderMenu(oColumnsMenu);
			}
		}
	});
});