/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/Fragment",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/library",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/Utils"
], function(
	mLibrary,
	ManagedObject,
	DateFormat,
	MessageType,
	Fragment,
	ResizeHandler,
	coreLibrary,
	Version,
	Filter,
	FilterOperator,
	Utils
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const { ValueState } = coreLibrary;
	const { ButtonType } = mLibrary;
	const SORT_ICON_ASC = "sap-icon://sort-ascending";
	const SORT_ICON_DESC = "sap-icon://sort-descending";

	var DRAFT_ACCENT_COLOR = "sapUiRtaDraftVersionAccent";
	var ACTIVE_ACCENT_COLOR = "sapUiRtaActiveVersionAccent";
	var VERSION_COLOR = "sapUiRtaVersionColor";

	/**
	 * Controller for the <code>sap.ui.rta.toolbar.versioning.Versioning</code> controls.
	 * Contains implementation of versioning functionality.
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.103
	 * @alias sap.ui.rta.toolbar.versioning.Versioning
	 */
	var Versioning = ManagedObject.extend("sap.ui.rta.toolbar.versioning.Versioning", {
		metadata: {
			properties: {
				toolbar: {
					type: "any" // "sap.ui.rta.toolbar.Base"
				}
			}
		},
		constructor: function(...aArgs) {
			ManagedObject.prototype.constructor.apply(this, aArgs);
			this.oTextResources = this.getToolbar().getTextResources();
		}
	});

	async function versionSelected(oEvent) {
		var oVersionsBindingContext = oEvent.getSource().getBindingContext("versions");
		var sVersion = Version.Number.Original;

		if (oVersionsBindingContext) {
			// the original Version does not have a version binding Context
			sVersion = oVersionsBindingContext.getProperty("version");
		}

		// The dialog must be fully closed before the switch is triggered; otherwise a UShell soft
		// reload keeps the modal dialog's block layer in the DOM, covering the reloaded application.
		// Closing is asynchronous (close animation + afterClose), so we wait for it to complete.
		if (this.oDialog?.isOpen()) {
			await new Promise((resolve) => {
				this.oDialog.attachEventOnce("afterClose", resolve);
				this.oDialog.close();
			});
		}
		this.getToolbar().fireEvent("switchVersion", { version: sVersion });
	}

	function doesActiveVersionExists(aVersions) {
		return aVersions.some(function(oVersion) {
			return oVersion.type === Version.Type.Active;
		});
	}

	// ------ formatting ------
	function formatOriginalAppHighlight(aVersions) {
		return doesActiveVersionExists(aVersions) ? MessageType.None : MessageType.Success;
	}

	function formatOriginalAppHighlightText(aVersions) {
		return doesActiveVersionExists(aVersions) ? this.oTextResources.getText("LBL_INACTIVE") : this.oTextResources.getText("LBL_ACTIVE");
	}

	function formatHighlight(sType) {
		switch (sType) {
			case Version.Type.Draft:
				return MessageType.Warning;
			case Version.Type.Active:
				return MessageType.Success;
			default:
				return MessageType.None;
		}
	}

	function formatHighlightText(sType) {
		switch (sType) {
			case Version.Type.Draft:
				return this.oTextResources.getText("TIT_DRAFT");
			case Version.Type.Active:
				return this.oTextResources.getText("LBL_ACTIVE");
			default:
				return this.oTextResources.getText("LBL_INACTIVE");
		}
	}

	function applyDraftVersionClasses(oEvent) {
		oEvent.getSource().getItems().forEach((oItem) => {
			const sType = oItem.getBindingContext("versions").getProperty("type");
			if (sType === Version.Type.Draft) {
				oItem.addStyleClass(DRAFT_ACCENT_COLOR);
			} else {
				oItem.removeStyleClass(DRAFT_ACCENT_COLOR);
			}
		});
		this.adjustOriginalVersionListPadding();
	}

	/**
	 * Aligns the footer table with the scrollable version list above it.
	 *
	 * When the version list overflows, its scroll container reserves space for a vertical
	 * scrollbar, which shrinks the list's content width. The footer table lives outside that
	 * scroll container, so without compensation its columns would be shifted to the right by the
	 * scrollbar width. The right padding mirrors that reserved space so both tables stay aligned.
	 */
	Versioning.prototype.adjustOriginalVersionListPadding = function() {
		const oOriginalVersionList = this.oDialog?.getFooter()?.getContent()[0];
		const oScrollSection = this.oDialog?.getDomRef("cont");
		const oFooterTableDomRef = oOriginalVersionList?.getDomRef();
		if (!oScrollSection || !oFooterTableDomRef) {
			return;
		}
		const iScrollbarWidth = oScrollSection.offsetWidth - oScrollSection.clientWidth;
		oFooterTableDomRef.style.paddingRight = iScrollbarWidth ? `${iScrollbarWidth}px` : "";
	};

	function formatVersionTitle(sTitle, sType) {
		if (sType === Version.Type.Draft) {
			return this.oTextResources.getText("TIT_DRAFT");
		}
		return sTitle || this.oTextResources.getText("TIT_VERSION_1");
	}

	function formatVersionTimeStamp(sActivatedAtTimeStamp, sImportedAtTimeStamp) {
		var sTimeStamp = sImportedAtTimeStamp || sActivatedAtTimeStamp;

		if (!sTimeStamp) {
			// in case of "Original App" and "Draft" no timestamp is set
			return "";
		}
		if (sTimeStamp.indexOf("Z") === -1) {
			sTimeStamp = `${sTimeStamp}Z`;
		}
		return DateFormat.getInstance({
			format: "yMMMdjm"
		}).format(new Date(sTimeStamp));
	}

	function setVersionButtonAccentColor(oVersionButton, sType) {
		switch (sType) {
			case Version.Type.Draft:
				oVersionButton.setType(ButtonType.Attention);
				oVersionButton.addStyleClass(DRAFT_ACCENT_COLOR);
				oVersionButton.removeStyleClass(ACTIVE_ACCENT_COLOR);
				oVersionButton.removeStyleClass(VERSION_COLOR);
				break;
			case Version.Type.Active:
				oVersionButton.setType(ButtonType.Transparent);
				oVersionButton.addStyleClass(ACTIVE_ACCENT_COLOR);
				oVersionButton.removeStyleClass(DRAFT_ACCENT_COLOR);
				oVersionButton.removeStyleClass(VERSION_COLOR);
				break;
			default:
				oVersionButton.setType(ButtonType.Transparent);
				oVersionButton.addStyleClass(VERSION_COLOR);
				oVersionButton.removeStyleClass(ACTIVE_ACCENT_COLOR);
				oVersionButton.removeStyleClass(DRAFT_ACCENT_COLOR);
		}
	}

	Versioning.prototype.formatVersionButtonText = function(aVersions, sDisplayedVersion) {
		var sText = "";
		var sType = "Active";
		aVersions ||= [];

		if (sDisplayedVersion === undefined || sDisplayedVersion === Version.Number.Original) {
			sText = this.oTextResources.getText("TIT_ORIGINAL_APP");
			sType = Version.Type.Inactive;
			if (aVersions.length === 0 || (aVersions.length === 1 && aVersions[0].type === Version.Type.Draft)) {
				sType = Version.Type.Active;
			}
		} else {
			var oDisplayedVersion = aVersions.find(function(oVersion) {
				return oVersion.version === sDisplayedVersion;
			});
			if (oDisplayedVersion) {
				sType = oDisplayedVersion.type;
				if (sDisplayedVersion === Version.Number.Draft) {
					sText = this.oTextResources.getText("TIT_DRAFT");
				} else {
					sText = oDisplayedVersion.title || this.oTextResources.getText("TIT_VERSION_1");
				}
			}
		}
		setVersionButtonAccentColor(this.getToolbar().getControl("versionButton"), sType);
		return sText;
	};

	Versioning.prototype.formatPublishVersionEnabled = function(bPublishVisible, sDisplayedVersion, bPublishVersionEnabled) {
		return bPublishVisible && bPublishVersionEnabled
			&& sDisplayedVersion !== Version.Number.Draft && sDisplayedVersion !== Version.Number.Original;
	};

	Versioning.prototype.formatDiscardDraftVisible = function(sDisplayedVersion, bVersioningEnabled, bAdaptationMode) {
		return sDisplayedVersion === Version.Number.Draft && bVersioningEnabled && bAdaptationMode;
	};

	// ------ Dialog handling ------

	function closeManageVersionsDialog() {
		this.oDialog.close();
	}

	function toggleVersionSearch() {
		const oSearchField = this.getToolbar().getControl("manageVersionsDialog--manageVersionsSearchField");
		const oContainer = this.getToolbar().getControl("manageVersionsDialog--manageVersionsSearchContainer");
		const bExpanded = oContainer.hasStyleClass("sapUiRtaVersionsSearchExpanded");
		if (bExpanded) {
			oContainer.removeStyleClass("sapUiRtaVersionsSearchExpanded");
			oSearchField.setValue("");
			filterVersions.call(this, "");
		} else {
			oContainer.addStyleClass("sapUiRtaVersionsSearchExpanded");
			oSearchField.focus();
		}
	}

	function filterVersions(sQuery) {
		const oVersionList = this.getToolbar().getControl("manageVersionsDialog--versionList");
		const oBinding = oVersionList.getBinding("items");
		if (!oBinding) {
			return;
		}
		if (!sQuery) {
			oBinding.filter([]);
			return;
		}
		oBinding.filter(new Filter({
			filters: [
				new Filter({ path: "title", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
				new Filter({ path: "activatedBy", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false })
			],
			and: false
		}));
	}

	function onSearchVersions(oEvent) {
		filterVersions.call(this, oEvent.getParameter("query") ?? oEvent.getParameter("newValue") ?? "");
	}

	// Returns the effective sort timestamp for a version object, mirroring the
	// priority used by formatVersionTimeStamp: importedAt takes precedence over
	// activatedAt. The trailing "Z" is normalised so string comparison is safe.
	function getEffectiveTimestamp(oVersion) {
		const sRaw = oVersion.importedAt || oVersion.activatedAt || "";
		if (!sRaw) {
			return "";
		}
		return sRaw.includes("Z") ? sRaw : `${sRaw}Z`;
	}

	function sortVersionsByDate() {
		const oVersionsModel = this.getToolbar().getModel("versions");
		const aVersions = oVersionsModel.getProperty("/versions");
		if (!aVersions?.length) {
			return;
		}
		const oSortButton = this.getToolbar().getControl("manageVersionsDialog--versionListDateSortButton");
		// Toggle: descending → ascending; ascending → descending.
		const bDescending = oSortButton.getIcon() === SORT_ICON_ASC;

		// Snapshot the original order before the first sort so afterClose can restore it.
		this._aVersionsSortBackup ||= [...aVersions];

		const aSorted = [...aVersions].sort((a, b) => {
			const bADraft = a.type === Version.Type.Draft;
			const bBDraft = b.type === Version.Type.Draft;
			// The draft has no date yet but represents the newest (unsaved) state, so it is
			// pinned as the newest entry regardless of the date values
			if (bADraft !== bBDraft) {
				return bADraft === bDescending ? -1 : 1;
			}
			const sA = getEffectiveTimestamp(a);
			const sB = getEffectiveTimestamp(b);
			if (sA < sB) { return bDescending ? 1 : -1; }
			if (sA > sB) { return bDescending ? -1 : 1; }
			return 0;
		});

		oVersionsModel.setProperty("/versions", aSorted);
		oSortButton.setIcon(bDescending ? SORT_ICON_DESC : SORT_ICON_ASC);
	}

	function formatVersionState(sType, bIsPublished) {
		if (sType === Version.Type.Active && !bIsPublished) {
			return ValueState.Success;
		}
		if (bIsPublished) {
			return ValueState.Information;
		}
		return undefined;
	}

	function formatVersionIcon(sType, bIsPublished) {
		if (sType === Version.Type.Active && !bIsPublished) {
			return "sap-icon://sys-enter-2";
		}
		if (bIsPublished) {
			return "sap-icon://information";
		}
		return undefined;
	}

	function formatVersionStateText(sType, bIsPublished) {
		if (sType === Version.Type.Active && !bIsPublished) {
			return this.oTextResources.getText("LBL_ACTIVE");
		}
		if (bIsPublished) {
			return this.oTextResources.getText("TIT_VERSION_HISTORY_PUBLISHED");
		}
		return undefined;
	}

	function formatOriginalVersionButtonEnabled(sDisplayedVersion) {
		return sDisplayedVersion !== Version.Number.Original;
	}

	Versioning.prototype.showManageVersions = async function() {
		if (!this._oManageVersionsDialogPromise) {
			this._oManageVersionsDialogPromise ||= Fragment.load({
				name: "sap.ui.rta.toolbar.versioning.ManageVersions",
				id: `${this.getToolbar().getId()}_fragment--sapUiRta_manageVersionsDialog`,
				controller: {
					formatVersionTitle: formatVersionTitle.bind(this),
					formatVersionTimeStamp,
					formatHighlight,
					formatHighlightText: formatHighlightText.bind(this),
					formatOriginalAppHighlight,
					formatOriginalAppHighlightText: formatOriginalAppHighlightText.bind(this),
					versionSelected: versionSelected.bind(this),
					closeManageVersionsDialog: closeManageVersionsDialog.bind(this),
					toggleVersionSearch: toggleVersionSearch.bind(this),
					onSearchVersions: onSearchVersions.bind(this),
					sortVersionsByDate: sortVersionsByDate.bind(this),
					formatVersionState: formatVersionState.bind(this),
					formatVersionIcon: formatVersionIcon.bind(this),
					formatVersionStateText: formatVersionStateText.bind(this),
					applyDraftVersionClasses: applyDraftVersionClasses.bind(this),
					formatOriginalVersionButtonEnabled
				}
			});
			this.oDialog = await this._oManageVersionsDialogPromise;
			this.oDialog.attachAfterOpen(() => {
				this.adjustOriginalVersionListPadding();
				this._iManageVersionsResizeHandler = ResizeHandler.register(
					this.oDialog,
					this.adjustOriginalVersionListPadding.bind(this)
				);
			});
			this.oDialog.attachAfterClose(() => {
				if (this._iManageVersionsResizeHandler) {
					ResizeHandler.deregister(this._iManageVersionsResizeHandler);
					delete this._iManageVersionsResizeHandler;
				}
				// reset the search so the dialog reopens collapsed and unfiltered
				const oContainer = this.getToolbar().getControl("manageVersionsDialog--manageVersionsSearchContainer");
				if (oContainer.hasStyleClass("sapUiRtaVersionsSearchExpanded")) {
					oContainer.removeStyleClass("sapUiRtaVersionsSearchExpanded");
					this.getToolbar().getControl("manageVersionsDialog--manageVersionsSearchField").setValue("");
					filterVersions.call(this, "");
				}
				// reset the date sort so the dialog reopens in natural (descending) order
				const oSortButton = this.getToolbar().getControl("manageVersionsDialog--versionListDateSortButton");
				if (oSortButton.getIcon() !== SORT_ICON_DESC) {
					oSortButton.setIcon(SORT_ICON_DESC);
				}
				if (this._aVersionsSortBackup) {
					this.getToolbar().getModel("versions").setProperty("/versions", this._aVersionsSortBackup);
					delete this._aVersionsSortBackup;
				}
			});
			this.getToolbar().addDependent(this.oDialog);
		}
		await this._oManageVersionsDialogPromise;
		this.oDialog.open();
	};

	Versioning.prototype.openActivateVersionDialog = function() {
		if (!this._oActivateVersionDialogPromise) {
			this._oActivateVersionDialogPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.versioning.VersionTitleDialog",
				id: `${this.getToolbar().getId()}_fragment--sapUiRta_activateVersionDialog`,
				controller: {
					onConfirmVersioningDialog: function() {
						var sVersionTitle = this.getToolbar().getControl("activateVersionDialog--versionTitleInput").getValue();
						if (sVersionTitle.length > 0) {
							this.getToolbar().fireEvent("activate", { versionTitle: sVersionTitle });
							this._oActivateVersionDialog.close();
						}
					}.bind(this),
					onCancelVersioningDialog: function() {
						this._oActivateVersionDialog.close();
					}.bind(this),
					onVersionTitleLiveChange: function(oEvent) {
						var sValue = oEvent.getParameter("value");
						this.getToolbar().getControl("activateVersionDialog--confirmVersionTitleButton").setEnabled(!!sValue);
					}.bind(this)
				}
			}).then(function(oDialog) {
				this._oActivateVersionDialog = oDialog;
				oDialog.addStyleClass(Utils.getRtaStyleClassName());
				this.getToolbar().addDependent(this._oActivateVersionDialog);
			}.bind(this));
		} else {
			this.getToolbar().getControl("activateVersionDialog--versionTitleInput").setValue("");
			this.getToolbar().getControl("activateVersionDialog--confirmVersionTitleButton").setEnabled(false);
		}

		return this._oActivateVersionDialogPromise.then(function() {
			var sTitle = this.oTextResources.getText("TIT_VERSION_TITLE_DIALOG");
			this._oActivateVersionDialog.setTitle(sTitle);
			return this._oActivateVersionDialog.open();
		}.bind(this));
	};

	return Versioning;
});