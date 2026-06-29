/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessageStrip",
	"sap/m/Popover",
	"sap/ui/core/IconPool",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Popup",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/util/CancelError",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/toolbar/contextBased/ManageAdaptations",
	"sap/ui/rta/toolbar/contextBased/SaveAsAdaptation",
	"sap/ui/rta/toolbar/translation/Translation",
	"sap/ui/rta/toolbar/versioning/Versioning",
	"sap/ui/rta/toolbar/AdaptationRenderer",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/rta/util/guidedTour/content/GeneralTour",
	"sap/ui/rta/util/guidedTour/GuidedTour",
	"sap/ui/rta/util/whatsNew/WhatsNewOverview",
	"sap/ui/rta/Utils"
], function(
	Localization,
	Log,
	MessageBox,
	MessageStrip,
	Popover,
	IconPool,
	MessageType,
	BusyIndicator,
	Element,
	Fragment,
	Popup,
	FlexRuntimeInfoAPI,
	Version,
	CancelError,
	ContextBasedAdaptationsAPI,
	JSONModel,
	Measurement,
	AppVariantFeature,
	ManageAdaptations,
	SaveAsAdaptation,
	Translation,
	Versioning,
	AdaptationRenderer,
	Base,
	GeneralTour,
	GuidedTour,
	WhatsNewOverview,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.Adaptation control
	 *
	 * @class
	 * Contains implementation of Adaptation toolbar
	 * @extends sap.ui.rta.toolbar.Base
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.toolbar.Adaptation
	 */
	const Adaptation = Base.extend("sap.ui.rta.toolbar.Adaptation", {
		renderer: AdaptationRenderer,
		animation: true,
		metadata: {
			library: "sap.ui.rta",
			events: {
				/**
				 * Events are fired when the Toolbar Buttons are pressed
				 */
				undo: {},
				redo: {},
				exit: {},
				save: {},
				restore: {},
				publishVersion: {},
				modeChange: {},
				activate: {},
				discardDraft: {},
				switchVersion: {},
				switchAdaptation: {},
				deleteAdaptation: {},
				saveAndReload: {},
				highlightAllChanges: {}
			}
		}
	});

	Adaptation.LEFT_SECTION = "toolbarIconAndDraftSection";
	Adaptation.MIDDLE_SECTION = "toolbarSwitcherSection";
	Adaptation.RIGHT_SECTION = "toolbarActionsSection";

	Adaptation.prototype.init = function(...aArgs) {
		Base.prototype.init.apply(this, aArgs);
		this._pFragmentLoaded = this._pFragmentLoaded.then(function() {
			this.setupNavigationTracking();
		}.bind(this));
	};

	Adaptation.prototype.exit = function(...aArgs) {
		this.cleanupNavigationTracking();
		Base.prototype.exit.apply(this, aArgs);
	};

	Adaptation.prototype.formatPublishVersionEnabled = function(bPublishVisible, bVersioningEnabled, bAdaptationMode) {
		return this.getExtension(
			"versioning",
			Versioning).formatPublishVersionEnabled(bPublishVisible, bVersioningEnabled, bAdaptationMode
		);
	};

	Adaptation.prototype.formatDiscardDraftVisible = function(sDisplayedVersion, bVersioningEnabled, bAdaptationMode) {
		return this.getExtension("versioning", Versioning).formatDiscardDraftVisible(sDisplayedVersion, bVersioningEnabled, bAdaptationMode);
	};

	Adaptation.prototype.formatVersionButtonText = function(aVersions, sDisplayedVersion) {
		return this.getExtension("versioning", Versioning).formatVersionButtonText(aVersions, sDisplayedVersion);
	};

	Adaptation.prototype.showVersionHistory = function(oEvent) {
		return this.getExtension("versioning", Versioning).showVersionHistory(oEvent);
	};

	Adaptation.prototype._openVersionTitleDialog = function(sDisplayedVersion) {
		return this.getExtension("versioning", Versioning).openActivateVersionDialog(sDisplayedVersion);
	};

	Adaptation.prototype.showHardReloadInfoPopover = function(oEvent) {
		this._oHardReloadInfoPopover ||= new Popover({
			placement: "Bottom",
			content: [
				new MessageStrip({
					text: this.getTextResources().getText("MSG_HARD_RELOAD_INFO"),
					type: MessageType.Warning,
					showIcon: true
				})
			],
			showHeader: false,
			contentWidth: "18rem"
		});
		this.addDependent(this._oHardReloadInfoPopover);
		this._oHardReloadInfoPopover.openBy(oEvent.getSource());
	};

	Adaptation.prototype.showActionsMenu = function(oEvent) {
		const oButton = oEvent.getSource();
		if (!this._oActionsMenuFragment) {
			return Fragment.load({
				id: `${this.getId()}_actionsMenu_fragment`,
				name: "sap.ui.rta.toolbar.ActionsMenu",
				controller: {
					openDownloadTranslationDialog: onOpenDownloadTranslationDialog.bind(this),
					openUploadTranslationDialog: onOpenUploadTranslationDialog.bind(this),
					manageApps: onManageAppsPressed.bind(this),
					overviewForKeyUser: onOverviewForKeyUserPressed.bind(this),
					overviewForDeveloper: onOverviewForDeveloperPressed.bind(this),
					restore: this.eventHandler.bind(this, "Restore"),
					formatAdaptationsMenuText: formatAdaptationsMenuText.bind(this),
					formatSaveAsEnabled,
					formatManageAppVariants: formatAppVariantsEnabled.bind(this),
					formatSaveAsAppVariants: formatSaveAsAppVariantsEnabled.bind(this),
					saveAs: onSaveAsPressed.bind(this),
					openWhatsNewOverviewDialog: openWhatsNewOverviewDialog.bind(this, this.getRtaInformation().flexSettings.layer),
					openGuidedTour,
					highlightAllChanges: this.eventHandler.bind(this, "HighlightAllChanges")
				}
			}).then(function(oMenu) {
				oMenu.addStyleClass(Utils.getRtaStyleClassName());
				this.addDependent(oMenu);
				oMenu.openBy(oButton, true, Popup.Dock.CenterTop, Popup.Dock.CenterBottom);
				this._oActionsMenuFragment = oMenu;
			}.bind(this));
		}
		this._oActionsMenuFragment.openBy(oButton, true, Popup.Dock.CenterTop, Popup.Dock.CenterBottom);
		return Promise.resolve();
	};

	/**
	 * Loads and creates the Fragment of the Toolbar
	 *
	 * @returns {Promise<sap.ui.core.Control[]>} Returns the controls in a structure described above.
	 */
	Adaptation.prototype.buildControls = async function() {
		const oControl = await Fragment.load({
			name: "sap.ui.rta.toolbar.Adaptation",
			id: `${this.getId()}_fragment`,
			controller: {
				activate: this._openVersionTitleDialog.bind(this),
				discardDraft: this.eventHandler.bind(this, "DiscardDraft"),
				formatDiscardDraftVisible: this.formatDiscardDraftVisible.bind(this),
				formatPublishVersionEnabled: this.formatPublishVersionEnabled.bind(this),
				modeChange: this.eventHandler.bind(this, "ModeChange"),
				undo: this.eventHandler.bind(this, "Undo"),
				redo: this.eventHandler.bind(this, "Redo"),
				saveAsAdaptation: this.onSaveAsAdaptation.bind(this),
				editAdaptation: this.onEditAdaptation.bind(this),
				deleteAdaptation: this.onDeleteAdaptation.bind(this),
				manageAdaptations: this.onManageAdaptations.bind(this),
				switchAdaptation: this.onSwitchAdaptations.bind(this),
				publishVersion: this.eventHandler.bind(this, "PublishVersion"),
				save: this.eventHandler.bind(this, "Save"),
				exit: this.eventHandler.bind(this, "Exit"),
				formatVersionButtonText: this.formatVersionButtonText.bind(this),
				formatSaveVisibility,
				showVersionHistory: this.showVersionHistory.bind(this),
				showActionsMenu: this.showActionsMenu.bind(this),
				showFeedbackForm: this.showFeedbackForm.bind(this),
				showHardReloadInfoPopover: this.showHardReloadInfoPopover.bind(this),
				saveAndReloadApp: this.eventHandler.bind(this, "SaveAndReload"),
				navigateBack: this.navigateBack.bind(this)
			}
		});
		return oControl.getItems();
	};

	function formatSaveVisibility(bVersioningEnabled, sDisplayedVersion, bAdaptationMode) {
		return bAdaptationMode && (bVersioningEnabled ? sDisplayedVersion === Version.Number.Draft : true);
	}

	function onOpenDownloadTranslationDialog() {
		const mPropertyBag = {
			layer: this.getRtaInformation().flexSettings.layer,
			selector: this.getRtaInformation().rootControl
		};
		this.getExtension("translation", Translation).openDownloadTranslationDialog(mPropertyBag);
	}

	function onOpenUploadTranslationDialog() {
		this.getExtension("translation", Translation).openUploadTranslationDialog();
	}

	function formatSaveAsEnabled(bGeneralSaveAsEnabled, sDisplayedVersion) {
		return bGeneralSaveAsEnabled && sDisplayedVersion !== Version.Number.Draft;
	}

	function formatAppVariantsEnabled(bAppVariantsMenuEnabled) {
		return bAppVariantsMenuEnabled ? null : this.getTextResources().getText("TOOLTIP_MANAGE_APPS_TXT_DISABLED");
	}

	function formatSaveAsAppVariantsEnabled(bAppVariantSaveAsEnabled, sDisplayedVersion) {
		return (bAppVariantSaveAsEnabled && sDisplayedVersion !== Version.Number.Draft)
			? null : this.getTextResources().getText("TOOLTIP_SAVE_AS_APP_VARIANT_DISABLED");
	}

	function onSaveAsPressed() {
		AppVariantFeature.onSaveAs(true, true, this.getRtaInformation().flexSettings.layer, null);
	}

	async function confirmMigration(oRtaInformation) {
		const bDirty = oRtaInformation.commandStack.canSave();
		const sAction = await Utils.showMessageBox(
			"confirm",
			bDirty ? "DAC_DIALOG_MIGRATION_DIRTY_DESCRIPTION" : "DAC_DIALOG_MIGRATION_DESCRIPTION",
			{
				titleKey: "DAC_DIALOG_MIGRATION_HEADER",
				actionKeys: ["DAC_DIALOG_MIGRATION_HEADER"],
				showCancel: true
			}
		);
		if (sAction !== MessageBox.Action.CANCEL) {
			if (bDirty) {
				await new Promise((resolve) => {
					this.fireEvent("save", { callback: resolve });
				});
			}
			return performMigration.call(this, oRtaInformation);
		}
	}

	function performMigration(oRtaInformation) {
		BusyIndicator.show();
		Measurement.start("onCBAMigration", "Measurement of migration to context-based adaptation");
		return ContextBasedAdaptationsAPI.migrate({
			control: oRtaInformation.rootControl,
			layer: oRtaInformation.flexSettings.layer
		})
		.finally(function() {
			Measurement.end("onCBAMigration");
			Measurement.getActive() && Log.info(`onCBAMigration: ${Measurement.getMeasurement("onCBAMigration").time} ms`);
			BusyIndicator.hide();
		})
		.then(Utils.showMessageBox.bind(undefined, "information", "DAC_DIALOG_MIGRATION_SUCCESSFULL_DESCRIPTION", {
			titleKey: "DAC_DIALOG_MIGRATION_HEADER"
		}))
		.then(function() {
			return new Promise(function(resolve) {
				this.fireEvent("switchAdaptation", { adaptationId: "DEFAULT", callback: resolve });
			}.bind(this));
		}.bind(this))
		.catch(function(oError) {
			Log.error(oError.stack || oError);
			const sMessage = "DAC_DIALOG_MIGRATION_ERROR_DESCRIPTION";
			const oOptions = {
				titleKey: "DAC_DIALOG_MIGRATION_HEADER",
				details: oError.userMessage || oError
			};
			Utils.showMessageBox("error", sMessage, oOptions);
		});
	}

	Adaptation.prototype.onSaveAsAdaptation = function() {
		const oRtaInformation = this.getRtaInformation();
		return Utils.checkDraftOverwrite(this.getModel("versions")).then(function() {
			Measurement.start("onCBACanMigrate", "Measurement if its possible to migrate to context-based adaptation");
			return ContextBasedAdaptationsAPI.canMigrate(
				{ control: oRtaInformation.rootControl, layer: oRtaInformation.flexSettings.layer });
		}).then(function(bCanMigrate) {
			Measurement.end("onCBACanMigrate");
			Measurement.getActive() && Log.info(`onCBACanMigrate: ${Measurement.getMeasurement("onCBACanMigrate").time} ms`);
			if (bCanMigrate) {
				return confirmMigration.call(this, oRtaInformation);
			}
			return this.getExtension("contextBasedSaveAs", SaveAsAdaptation).openAddAdaptationDialog(oRtaInformation.flexSettings.layer);
		}.bind(this))
		.catch(handleError);
	};

	Adaptation.prototype.onEditAdaptation = function() {
		return Utils.checkDraftOverwrite(this.getModel("versions"))
		.then(function() {
			this.getExtension("contextBasedSaveAs", SaveAsAdaptation).openAddAdaptationDialog(
				this.getRtaInformation().flexSettings.layer, true /* bIsEditMode */
			);
		}.bind(this))
		.catch(handleError);
	};

	function handleError(oError) {
		if (!(oError instanceof CancelError)) {
			Utils.showMessageBox("error", "MSG_LREP_TRANSFER_ERROR", { error: oError });
			Log.error(`sap.ui.rta: ${oError.stack || oError.message || oError}`);
		}
	}

	Adaptation.prototype.onDeleteAdaptation = function() {
		return Utils.checkDraftOverwrite(this.getModel("versions"))
		.then(function() {
			this.fireEvent("deleteAdaptation");
		}.bind(this))
		.catch(handleError);
	};

	Adaptation.prototype.onManageAdaptations = function() {
		this.getExtension("contextBasedManage", ManageAdaptations).openManageAdaptationDialog();
	};

	Adaptation.prototype.onSwitchAdaptations = function(sAdaptationId) {
		this.fireEvent("switchAdaptation", { adaptationId: sAdaptationId });
	};

	function formatAdaptationsMenuText(iCount, sTitle) {
		if (iCount > 0) {
			if (!sTitle) {
				return this.getTextResources().getText("TXT_DEFAULT_APP");
			}
			return this.getTextResources().getText("BTN_ADAPTING_FOR", [sTitle]);
		}
		return this.getTextResources().getText("BTN_ADAPTING_FOR_ALL_USERS");
	}

	function onOverviewForKeyUserPressed() {
		return AppVariantFeature.onGetOverview(true, this.getRtaInformation().flexSettings.layer);
	}

	function onOverviewForDeveloperPressed() {
		return AppVariantFeature.onGetOverview(false, this.getRtaInformation().flexSettings.layer);
	}

	function onManageAppsPressed() {
		AppVariantFeature.onGetOverview(true, this.getRtaInformation().flexSettings.layer);
	}

	function openWhatsNewOverviewDialog(sLayer) {
		WhatsNewOverview.openWhatsNewOverviewDialog(sLayer);
	}

	function openGuidedTour() {
		new GuidedTour().start(GeneralTour.getTourContent());
	}

	Adaptation.prototype.getControl = function(sName) {
		let oControl = Element.getElementById(`${this.getId()}_fragment--sapUiRta_${sName}`);
		// Control is inside the ActionsMenu
		if (!oControl && this._oActionsMenuFragment) {
			oControl = Element.getElementById(this._oActionsMenuFragment.getId().replace("sapUiRta_actions", "sapUiRta_") + sName);
		}
		return oControl;
	};

	Adaptation.prototype.showFeedbackForm = async function() {
		// Set URL
		const sURLPart1 = "https://sapinsights.eu.qualtrics.com/jfe/form/";
		const sURLPart2 = "SV_4MANxRymEIl9K06";
		const sURL = sURLPart1 + sURLPart2;
		const oUrlParams = new URLSearchParams();
		const mPropertyBag = {
			rootControl: this.getRtaInformation().rootControl
		};
		const oFeedbackUrlParams = await FlexRuntimeInfoAPI.getFeedbackInformation(mPropertyBag);
		oUrlParams.set("version", oFeedbackUrlParams.version);
		const bCF = oFeedbackUrlParams.connector === "KeyUserConnector" || oFeedbackUrlParams.connector === "BtpServiceConnector";
		oUrlParams.set("feature", bCF ? "BTP" : "ABAP");
		oUrlParams.set("appId", oFeedbackUrlParams.appId);
		oUrlParams.set("appVersion", oFeedbackUrlParams.appVersion);
		// Add product filter for qualtrics colleagues
		oUrlParams.set("product_filter", "Key%20User%20Adaptation");

		const oFeedbackDialogModel = new JSONModel({
			url: `${sURL}?${oUrlParams.toString()}`
		});

		return Fragment.load({
			name: "sap.ui.rta.toolbar.FeedbackDialog",
			controller: this
		}).then(function(oFeedbackDialog) {
			this._oFeedbackDialog = oFeedbackDialog;
			this._oFeedbackDialog.addStyleClass(Utils.getRtaStyleClassName());
			this._oFeedbackDialog.setModel(oFeedbackDialogModel, "feedbackModel");
			this._oFeedbackDialog.setModel(this.getModel("i18n"), "i18n");
			this._oFeedbackDialog.open();
		}.bind(this)).catch(function(oError) {
			Log.error("Error loading fragment sap.ui.rta.toolbar.FeedbackDialog: ", oError);
		});
	};

	Adaptation.prototype.closeFeedbackForm = function() {
		if (this._oFeedbackDialog) {
			this._oFeedbackDialog.close();
			this._oFeedbackDialog.destroy();
		}
	};

	Adaptation.prototype.setupNavigationTracking = function() {
		if (!window.navigation) {
			return;
		}

		this._oStartingNavigationEntry = window.navigation.currentEntry;

		this._fnNavigationHandler = () => {
			this._updateBackButtonState();
		};

		window.navigation.addEventListener("currententrychange", this._fnNavigationHandler);
	};

	Adaptation.prototype.cleanupNavigationTracking = function() {
		if (this._fnNavigationHandler && window.navigation) {
			window.navigation.removeEventListener("currententrychange", this._fnNavigationHandler);
			this._fnNavigationHandler = null;
			this._oStartingNavigationEntry = null;
		}
	};

	Adaptation.prototype._updateBackButtonState = function() {
		if (!window.navigation || !this._oStartingNavigationEntry) {
			return;
		}
		const oControlsModel = this.getModel("controls");
		const aEntries = window.navigation.entries();
		const iCurrentIndex = aEntries.indexOf(window.navigation.currentEntry);
		const iStartIndex = aEntries.findIndex((oEntry) => oEntry.key === this._oStartingNavigationEntry.key);

		const bCanNavigateBack = iCurrentIndex > iStartIndex;
		oControlsModel.setProperty("/backButton/enabled", bCanNavigateBack);
	};

	// Non-FLP case
	Adaptation.prototype.navigateBack = function() {
		window.history.back();
	};

	return Adaptation;
});
