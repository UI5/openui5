/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/core/EventBus",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/NewsInfo",
	"sap/ui/documentation/sdk/controller/util/SearchUtil",
	"sap/ui/documentation/sdk/controller/util/LocaleHelper",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/documentation/library",
	"sap/m/library",
	"sap/base/Log",
	"sap/base/util/Version",
	"sap/ui/util/openWindow",
	"sap/ui/documentation/sdk/model/formatter",
	"sap/m/Button",
	"sap/ui/documentation/sdk/util/Resources",
	'sap/base/util/LoaderExtensions',
	"sap/ui/documentation/sdk/controller/util/ThemePicker",
	"sap/ui/documentation/sdk/controller/util/SearchRenderer"
], function(
	Localization,
	Element,
	EventBus,
	Library,
	jQuery,
	BaseController,
	NewsInfo,
	SearchUtil,
	LocaleHelper,
	Filter,
	FilterOperator,
	JSONModel,
	ResizeHandler,
	Device,
	Fragment,
	library,
	mobileLibrary,
	Log,
	Version,
	openWindow,
	globalFormatter,
	Button,
	ResourcesUtil,
	LoaderExtensions,
	ThemePicker,
	SearchRenderer
) {
	"use strict";

	var getResourcePath = function (sResource) {
		return ResourcesUtil.getResourcesVersion() && !self['sap-ui-documentation-config']
			? window.origin + sResource
			: ResourcesUtil.getResourceOriginPath(sResource);
	};

	var MAIN_WEB_PAGE_TITLE = "Demo Kit - \uFFFD SDK",
		WEB_PAGE_TITLE = {
			topic: "Documentation - " + MAIN_WEB_PAGE_TITLE,
			api: "API Reference - " + MAIN_WEB_PAGE_TITLE,
			controls: "Samples - " + MAIN_WEB_PAGE_TITLE,
			demoapps: "Demo Apps - " + MAIN_WEB_PAGE_TITLE,
			resources: "Resources - " + MAIN_WEB_PAGE_TITLE,
			home: MAIN_WEB_PAGE_TITLE
		};

	var URLHelper = mobileLibrary.URLHelper,
		SplitAppMode = mobileLibrary.SplitAppMode,
		sNeoAppJsonPath = getResourcePath("/neo-app.json"), /* Load neo-app.json always from root URL */
		sVersionOverviewJsonPath = getResourcePath("/versionoverview.json"), /* Load versionoverview.json always from root URL */
		ABOUT_TEXT = "about",
		CHANGE_VERSION_TEXT = "change_version",
		CHANGE_SETTINGS_TEXT = "settings",
		CHANGE_COOKIE_PREFERENCES_TEXT = "cookie_preferences",
		DEMOKIT_DEFAULT_LANGUAGE = "en_US",
		PRIVACY_TEXT = "privacy",
		DEMOKIT_CONFIGURATION_LANGUAGE = "language",
		DEMOKIT_CONFIGURATION_APPEARANCE = "appearance",
		SITEMAP = "sitemap";

	return BaseController.extend("sap.ui.documentation.sdk.controller.App", {
		formatter: globalFormatter,

		_arrToTreeConverter: function () {
			var aNodes,
				aOriginalArr = this._aNeoAppVersions.slice(),
				aResultArr = [],
				iCounter = 0,
				sCurrGroupTitle = "";

			for (var i = 0; i < aOriginalArr.length; i++) {
				sCurrGroupTitle = aOriginalArr[i].groupTitle;
				if (aOriginalArr[i]?.version?.includes("legacy-free")) {
					continue;
				}
				iCounter = 0;
				aNodes = [];
				while (aOriginalArr[i] && aOriginalArr[i].groupTitle && aOriginalArr[i].groupTitle === sCurrGroupTitle) {
					if (!aOriginalArr[i]?.version?.includes("legacy-free")) {
						aNodes.push(aOriginalArr[i]);
						iCounter++;
					}
					i++;
				}
				i--;
				aResultArr.push({
					"groupTitle": sCurrGroupTitle,
					"version": sCurrGroupTitle + " (" + iCounter + " versions)",
					"nodes": aNodes,
					"path": aNodes[0].path
				});
			}

			return aResultArr;
		},

		onInit: function () {
			BaseController.prototype.onInit.call(this);

			var oViewModel = new JSONModel({
				bCNICPShow: window.location.href.includes("sapui5.platform.sapcloud.cn"),
				busy: false,
				delay: 0,
				device: Device,
				bPhoneSize: false,
				bDesktopSize: false,
				bShowVersionSwitchButton: false,
				bLandscape: Device.orientation.landscape,
				bHasMaster: false,
				bHideTopicSection: !!window['sap-ui-documentation-hideTopicSection'],
				bHideApiSection: !!window['sap-ui-documentation-hideApiSection'],
				sAboutInfoSAPUI5: "Looking for the Demo Kit for a specific SAPUI5 version? " +
					"Check at <a href = 'https://ui5.sap.com/versionoverview.html'>https://ui5.sap.com/versionoverview.html</a> " +
					"which versions are available. " +
					"You can view the version-specific Demo Kit by adding the version number to the URL, e.g. " +
					"<a href='https://ui5.sap.com/1.71.46/'>https://ui5.sap.com/1.71.46/</a>",
				sAboutInfoOpenUI5: "Looking for the Demo Kit for a specific OpenUI5 version? " +
					"Check at <a href = 'https://sdk.openui5.org/versionoverview.html'>https://sdk.openui5.org/versionoverview.html</a> " +
					"which versions are available. " +
					"You can view the version-specific Demo Kit by adding the version number to the URL, e.g. " +
					"<a href='https://sdk.openui5.org/1.71.46/'>https://sdk.openui5.org/1.71.46/</a>"
			});

			var oController = this;

			ThemePicker.init(oController);

			this.getModel("i18n").getResourceBundle().then(function (oBundle) {
				this._oI18nBundle = oBundle;
			}.bind(this));

			this.MENU_LINKS_MAP = {
				"copyright": "https://www.sap.com/corporate/en/legal/copyright.html",
				"trademark": "https://www.sap.com/corporate/en/legal/trademark.html",
				"disclaimer": "https://help.sap.com/viewer/disclaimer",
				"sitemap": "sitemap"
			};

			jQuery.extend(this.MENU_LINKS_MAP, BaseController.LEGAL_LINKS);

			this.getOwnerComponent().loadVersionInfo().then(function () {
				var sProduct;
				if (this.getModel("versionData").getProperty("/isOpenUI5")) {
					sProduct = "OPENUI5";
				} else {
					sProduct = "SAPUI5";
				}
				MAIN_WEB_PAGE_TITLE = MAIN_WEB_PAGE_TITLE.replace("\uFFFD", sProduct);
				Object.keys(WEB_PAGE_TITLE).forEach(function (sKey) {
					WEB_PAGE_TITLE[sKey] = WEB_PAGE_TITLE[sKey].replace("\uFFFD", sProduct);
				});

				if (this._sKey) {
					this.appendPageTitle(null).appendPageTitle(WEB_PAGE_TITLE[this._sKey]);
				}

			}.bind(this));

			this.getOwnerComponent().loadMessagesInfo().then(function (data) {
				if (data) {
					this._updateMessagesModel(data);
				}

			}.bind(this));

			// Config routes
			this.oRouter = this.getRouter();
			this.oRouter.attachRouteMatched(this.onRouteChange.bind(this));
			this.oRouter.attachBypassed(this.onRouteNotFound.bind(this));
			this.oRouter.attachEvent("_navToWithoutHash", this.onNavToWithoutHash.bind(this));

			// Store product version information
			this._aNeoAppVersions = [];

			// Set app view models
			this._oView = this.getView();
			this.setModel(oViewModel, "appView");

			this._oNewsModel = new JSONModel();
			this.setModel(this._oNewsModel, "news");

			this._oSupportedLangModel = new JSONModel();
			this.setModel(this._oSupportedLangModel, "supportedLanguages");

			this.setModel(new JSONModel(), "messagesData");

			// Store references of the control tree
			this._demoKitPage = this.byId("demoKitPage");
			this._demoKitSubHeader = this.byId("demoKitSubHeader");
			this._demoKitSideNavigation = this.byId("demoKitSideNavigation");
			this._demoKitSplitApp = this.byId("splitApp");

			// Adjust focus handling for the detail nav container
			// (the default behavior would be to focus the first focusable element)
			// Which in our case is the footer links fragment which causes the page to scroll down on mobile devices
			this._demoKitSplitApp._oDetailNav.setAutoFocus(false);

			// attach to the afterMasterClose event of the splitApp to be able to toggle the button state on clicking anywhere
			this._demoKitSplitApp.attachEvent("afterMasterClose", function (oEvent) {
				oViewModel.setProperty("/bIsShownMaster", false);
			}, this);

			// Init version info
			this._requestVersionInfo();
			// Init search
			this.initSearch();
			// Since the searchfield is open by default on desktop devices, we need to load the search index
			SearchUtil.init();

			// Init survey
			this.setSurveyModelData();

			// Subscribe to events
			this.bus = EventBus.getInstance();
			this.bus.subscribe("newsChanged", "onDemoKitNewsChanged", this._syncNewsModelWithNewsInfo, this);

			// Init cookie settings
			this._oConfigUtil = this.getOwnerComponent().getConfigUtil();
			this._oCookieNames = this._oConfigUtil.COOKIE_NAMES;
			this._sLocalStorageNewsName = this._oConfigUtil.LOCAL_STORAGE_NAMES['OLD_NEWS_IDS'];

			NewsInfo.prepareNewsData(this._oConfigUtil);

			this._createConfigurationBasedOnURIInput();

			this._oCookiesConsentManager = this.getOwnerComponent().getCookiesConsentManager();
			this._oCookiesConsentManager.checkUserAcceptsToPersistDisplaySettings(function(bAccepts) {
				if (bAccepts && this._aConfiguration.length > 0) {
					this._applyCookiesConfiguration(this._aConfiguration);
				} else {
					this._applyDefaultConfiguration(this._aConfiguration);
				}
			}.bind(this));
			this._oCookiesConsentManager.checkUserAcceptsUsageTracking(function(bAccepts) {
				if (bAccepts) {
					this._getVersionName().then(function(sVersionName) {
						// start tracking, including the route visited at app-startup (before the check of the persisted consent-decision completed)
						this.getOwnerComponent().getUsageTracker().start(sVersionName, this._aRouterCachedEventDetails);
						this._aRouterCachedEventDetails = []; // clear the already logged route visits
					}.bind(this));
				}
			}.bind(this));

			// Handle page resize
			this._sResizeHandlerId = ResizeHandler.register(this._demoKitPage, this.onPageResize.bind(this));
		},

		onBeforeRendering: function () {
			Device.orientation.detachHandler(this._onOrientationChange, this);
		},

		onAfterRendering: function () {
			// apply content density mode to the body tag
			// in order to get the controls in the static area styled correctly,
			// such as Dialog and Popover.
			jQuery(document.body).addClass(this.getOwnerComponent().getContentDensityClass());

			Device.orientation.attachHandler(this._onOrientationChange, this);

			this._syncNewsModelWithNewsInfo();
		},

		onExit: function () {
			Device.orientation.detachHandler(this._onOrientationChange, this);

			clearTimeout(this._iSearchDebounceTimer);

			if (this._sResizeHandlerId) {
				ResizeHandler.deregister(this._sResizeHandlerId);
				this._sResizeHandlerId = null;
			}

			this._oCookiesConsentManager = null;
		},

		onRouteChange: function (oEvent) {
			this._cacheRouteEventDetails(oEvent);
			if (!this.oRouter.getRoute(oEvent.getParameter("name"))._oConfig.target) {
				return;
			}

			var bPhone = Device.system.phone,
				sRouteName = oEvent.getParameter("name"),
				sTabId = this.oRouter.getRoute(sRouteName)._oConfig.target[0] + "Tab",
				oTabToSelect = this._oView.byId(sTabId),
				sKey = oTabToSelect ? oTabToSelect.getKey() : "home",
				oViewModel = this.getModel("appView"),
				bHasMaster = this.getOwnerComponent().getConfigUtil().hasMasterView(sRouteName);

			this._setHeaderSelectedKey(sKey);
			this._setSelectedSectionTitle(sKey);

			oViewModel.setProperty("/bHasMaster", bHasMaster);

			if (bPhone && bHasMaster) { // on phone we need the id of the master view (for navigation)
				this.getOwnerComponent().getConfigUtil().getMasterView(sRouteName).then(function(oMasterView) {
					var sMasterViewId = oMasterView?.getId();
					oViewModel.setProperty("/sMasterViewId", sMasterViewId);
				});
			}

			// hide master on route change
			this._demoKitSplitApp.hideMaster();
			oViewModel.setProperty("/bIsShownMaster", false);
			this.appendPageTitle(null).appendPageTitle(WEB_PAGE_TITLE[sKey]);
		},

		onNavToWithoutHash: function(oEvent) {
			this._cacheRouteEventDetails(oEvent);
		},

		onCloseImportantMessage: function (oEvent) {
			var aMessageCookie = this._oConfigUtil.getCookieValue(this._oCookieNames.DEMOKIT_IMPORTANT_MESSAGES_READ)
					.split(",").filter(function(id) { return id !== ''; }),
				oCustomData = oEvent.getSource().getCustomData().find(function(oCustomData) {
					return oCustomData.getKey() === "messageID";
				}),
				sId = oCustomData.getValue();

			aMessageCookie.push(sId);
			this._oConfigUtil.setCookie(this._oCookieNames.DEMOKIT_IMPORTANT_MESSAGES_READ, aMessageCookie.join(","));

			this._updateMessagesModel(this.getModel("messagesData").getData());
		},

		toggleMaster: function (oEvent) {
			var oViewModel = this.getModel("appView"),
				sMasterViewId = oViewModel.getProperty("/sMasterViewId"),
				isShowHideMode = this._demoKitSplitApp.getMode() === SplitAppMode.ShowHideMode,
				isHideMode = this._demoKitSplitApp.getMode() === SplitAppMode.HideMode,
				bPhone = Device.system.phone,
				bPressed = oEvent.getParameter("pressed"),
				fnToggle;

			if (!bPhone && (isShowHideMode || isHideMode)) {
				fnToggle = (bPressed) ? this._demoKitSplitApp.showMaster : this._demoKitSplitApp.hideMaster;
				fnToggle.call(this._demoKitSplitApp);
				return;
			}

			// on phone there is no master-detail pair, but a single navContainer => so navigate within this navContainer
			if (bPhone) {
				if (bPressed) {
					this._demoKitSplitApp.to(sMasterViewId);
				} else {
					this._demoKitSplitApp.backDetail();
				}
			}
		},

		/**
		 * This function handles the navigation logic for different sections,
		 * including handling special cases for specific keys and devices.
		 *
		 * @param {Object} oEvent - The event object.
		 * @returns {void}
		 */
		navigateToSection: function (oEvent) {
			var sKey = oEvent.getParameter("key") || oEvent.getParameter("item").getKey(),
				bEventFiredFromSideNavigation = oEvent.getSource().isA("sap.tnt.SideNavigation");

			// close the side navigation on phone devices
			if (Device.system.phone && bEventFiredFromSideNavigation) {
				this.onSideNavigationButtonPress();
			}

			if (sKey && sKey !== "home") {
				this.getRouter().navTo(sKey, {});
			} else {
				this.getRouter().navTo("welcome", {});
				this._setHeaderSelectedKey("home");
			}
		},

		navigateToNews: function () {
			this.getRouter().navTo("news");
		},

		onNewsButtonPress: function (oEvent) {
			var oOpener = oEvent.getParameter("targetRef"),
				oView = this.getView();

			if (this._oNewsModel.getProperty("/newsCount") === 0) {
				this.navigateToNews();
			} else if (!this._oNewsPopover) {
				Fragment.load({
					name: "sap.ui.documentation.sdk.view.NewsPopover",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					this._oNewsPopover = oPopover;
					this._oNewsPopover.openBy(oOpener);
				}.bind(this));
			} else {
				this._oNewsPopover.openBy(oOpener);
			}
		},

		handleShowAllPress: function () {
			this._oNewsPopover.close();
			this.navigateToNews();
		},

		handleDismissAllPress: function () {
			NewsInfo.moveAllNewItemsToOld();
		},

		handleNewsItemClose: function (oEvent) {
			var oItem = oEvent.getSource(),
				iItemCustomId = oItem.getCustomData()[0].getValue(),
				oItemInfoInItemsProperty = this._oNewsModel.getProperty("/items").find(function (oItem) {
					return oItem.id === iItemCustomId;
				});

			NewsInfo.moveNewItemToOld(oItemInfoInItemsProperty);
		},

		handleVisitNewsLink: function (oEvent) {
			var oItem = oEvent.getSource(),
				sItemLink = oItem.getCustomData()[0].getValue();

			URLHelper.redirect(sItemLink, true);
		},

		_updateMessagesModel: function(oMessagesData) {
			var oMessageCookie = this._oConfigUtil.getCookieValue(this._oCookieNames.DEMOKIT_IMPORTANT_MESSAGES_READ),
				iVisibleMessagesCount = 0,
				sCurrURL,
				sFullVersion,
				sRegExpValidator;

			if (oMessagesData.messages.length) {
				sCurrURL = this._getCurrentURL();
				sFullVersion = this._getFullVersion();
				oMessagesData.messages.forEach(function(message) {
					var bExpired = !!message.expire && (new Date().getTime() - new Date(message.expire).getTime()) > 0,
						bPostponed = !!message.postpone && (new Date(message.postpone).getTime() - new Date()) > 0;

					message.isMessageVisible = message.mandatory || (
						!bPostponed &&
						!bExpired &&
						!oMessageCookie.includes(message.id));

						if (message.isMessageVisible && message.versionValidator) {
							sRegExpValidator = new RegExp(message.versionValidator);
							message.isMessageVisible = sRegExpValidator.test(sFullVersion);
						}

						if (message.isMessageVisible && message.urlValidator) {
							sRegExpValidator = new RegExp(message.urlValidator);
							message.isMessageVisible = sRegExpValidator.test(sCurrURL);
						}

					if (message.isMessageVisible) {
						iVisibleMessagesCount++;
					}
				});
			}

			oMessagesData.iVisibleMessagesCount = iVisibleMessagesCount;

			this.getModel("messagesData").setData(oMessagesData);

		},

		_syncNewsModelWithNewsInfo: function () {
			var aNewsInfoCopy,
				sPreparationFailureMessage = NewsInfo.getPreparationFailureMessage();

			if (!sPreparationFailureMessage) {
				aNewsInfoCopy = NewsInfo.getNewNewsArray().slice();
				this._oNewsModel.setProperty("/items", aNewsInfoCopy);
				this._oNewsModel.setProperty("/newsCount", aNewsInfoCopy.length);
			}

			this._oNewsModel.setProperty("/newsPreparationFailureMessage", sPreparationFailureMessage);
		},

		/**
		 * Opens the policies (legal) menu anchored to its button.
		 *
		 * @param {sap.ui.base.Event} oEvent The button's click event
		 */
		onOpenPoliciesMenu: function (oEvent) {
			this._openHeaderMenu("policiesMenu", oEvent.getSource());
		},

		/**
		 * Opens the settings/about menu anchored to its button.
		 *
		 * @param {sap.ui.base.Event} oEvent The button's click event
		 */
		onOpenAboutMenu: function (oEvent) {
			this._openHeaderMenu("aboutMenu", oEvent.getSource());
		},

		/**
		 * Opens a header Web Component menu below the given opener.
		 *
		 * @param {string} sMenuId The stable (non-prefixed) id of the menu control
		 * @param {sap.ui.core.Control} oOpener The control that triggered the menu
		 * @private
		 */
		_openHeaderMenu: function (sMenuId, oOpener) {
			var oMenu = this.byId(sMenuId);

			// The opener must be a control (or its id): a UI5 association does not accept
			// a raw DOM node, so passing the click event's targetRef would leave the
			// menu unanchored (positioned at the top-left of the page).
			oMenu.setAssociation("opener", oOpener);
			oMenu.setOpen(true);
		},

		onMenuButtonItemSelected: function (oEvent) {
			var oItem = oEvent.getParameter("item"),
				oKeyData = oItem && oItem.getCustomData().find(function (oData) {
					return oData.getKey() === "action";
				}),
				sTargetText = oKeyData ? oKeyData.getValue() : undefined,
				sTarget = this.MENU_LINKS_MAP[sTargetText];

			if (sTargetText === ABOUT_TEXT) {
				this.aboutDialogOpen();
			} else if (sTargetText === CHANGE_SETTINGS_TEXT) {
				this.settingsDialogOpen();
			} else if (sTargetText === PRIVACY_TEXT) {
				this.navToPrivacyStatement();
			} else if (sTargetText === CHANGE_COOKIE_PREFERENCES_TEXT) {
				this.onEditCookiePreferencesRequest();
			} else if (sTargetText === CHANGE_VERSION_TEXT) {
				this.onChangeVersionButtonPress();
			} else if (ThemePicker._getTheme()[sTargetText]) {
				this._updateAppearance(sTargetText);
			} else if (sTarget === SITEMAP) {
				this.onSiteMapPress();
			} else if (sTarget) {
				URLHelper.redirect(sTarget, true);
			}
			this.sTarget = sTarget;
		},

		initSearch: function () {
			// set the search data to custom search`s suggestions
			var oModel = this.getModel("searchData"),
				oSectionToRoutesMap = {
					"topics": ["topic", "topicId", "subTopicId"],
					"entity": ["sample", "controlsMaster", "controls", "code", "entity"],
					"apiref": ["api", "apiSpecialRoute", "apiId"]
				};

			// update current section on navigate
			this.oRouter.attachRouteMatched(function () {
				oModel.setProperty("/preferencedCategory", null);
			});

			Object.keys(oSectionToRoutesMap).forEach(function (sSectionKey) {
				var aRoutes = oSectionToRoutesMap[sSectionKey];
				aRoutes.forEach(function (sRoute) {
					this.oRouter.getRoute(sRoute).attachPatternMatched(function () {
						oModel.setProperty("/preferencedCategory", sSectionKey);
					});
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Updates the appearance of the Demo Kit depending of the incoming appearance keyword.
		 * If the keyword is "auto" the appearance will be updated to light or dark depending on the
		 * user's OS settings.
		 *
		 * @param {string} sKey the appearance keyword
		 * @param {object} oComponent the component where the theme will be changed
		 * @private
		 */
		_updateAppearance: function (sKey) {
			var oComponent = this;
			ThemePicker._updateAppearance(sKey, oComponent);
		},

		/**
		 * Creates configuration for the application regarding the URI input.
		 *
		 * @private
		 */
		_createConfigurationBasedOnURIInput: function () {
			var oUriParams = new URLSearchParams(window.location.search);
			this._aConfiguration = [];

			if (!(oUriParams.has('sap-ui-language') || oUriParams.has('sap-language'))) {
				this._aConfiguration.push(DEMOKIT_CONFIGURATION_LANGUAGE);
			}

			if (!(oUriParams.has('sap-ui-theme') || oUriParams.has('sap-theme'))) {
				this._aConfiguration.push(DEMOKIT_CONFIGURATION_APPEARANCE);
			}
		},

		/**
		 * Applies configuration for the application regarding the default values.
		 *
		 * @private
		 */
		_applyDefaultConfiguration: function () {
			this._aConfiguration.forEach(function (sConf) {
				if (sConf === DEMOKIT_CONFIGURATION_LANGUAGE) {
					Localization.setLanguage(DEMOKIT_DEFAULT_LANGUAGE);
				} else if (sConf === DEMOKIT_CONFIGURATION_APPEARANCE) {
					this._updateAppearance("auto");
				}
			}, this);

			this._oSupportedLangModel.setProperty("/selectedLang", Localization.getLanguage());
		},

		/**
		 * Applies configuration for the application regarding the cookies.
		 *
		 * @private
		 */
		_applyCookiesConfiguration: function () {
			var sCookieValue, sConf, i;

			for (i = 0; i < this._aConfiguration.length; i++) {
				sConf = this._aConfiguration[i];
				sCookieValue = this._oConfigUtil.getCookieValue(sConf);

				if (sCookieValue !== "") {
					if (sConf === DEMOKIT_CONFIGURATION_LANGUAGE) {
						this._setSelectedLanguage(sCookieValue);
					} else if (sConf === DEMOKIT_CONFIGURATION_APPEARANCE) {
						this._updateAppearance(sCookieValue);
					}

					// If we have available value for the given cookie we remove it from the configuration array.
					this._aConfiguration.splice(i, 1);
					i--;
				}
			}

			// If we still have configurations which are not set by their cookie values, we apply their default values.
			if (this._aConfiguration.length > 0) {
				this._applyDefaultConfiguration();
			}
		},

		/**
		 * Helper for function for preparing the data for the SupportedLangModel.
		 *
		 * @private
		 * @returns {Object[]} Array of objects containg the needed data for the SupportedLangModel
		 */
		_prepareSupportedLangModelData: function () {
			return Localization.getLanguagesDeliveredWithCore().reduce(function (result, sLangAbbreviation) {
				var langName,
					sLang = sLangAbbreviation,
					sLangRegion = sLangAbbreviation;

				if (typeof sLangAbbreviation === "string" && sLangAbbreviation.length > 0) {

					switch (sLangAbbreviation) {
						case "sh": //Serbian
							sLang = "sr_Latn";
							break;
						case "no": //Norwegian
							sLang = "nb";	// Bokmål
							break;
						case "iw": // Israel
							// Hebrew
							sLang = "he";
							sLangRegion = "he";
							break;
						case "zh_TW": // Taiwan
							// Chinese Traditional
							sLangRegion = "zh_Hant";
							break;
						case "zh_CN": // People's Republic of China
							// Chinese Simplified
							sLangRegion = "zh_Hans";
							break;
					}

					if (!LocaleHelper.hasRegion(sLangAbbreviation)) {
						sLangAbbreviation = LocaleHelper.appendDefaultRegion(sLangAbbreviation);
					}

					result.push(new Promise(function (resolve, reject) {
						LoaderExtensions.loadResource("sap/ui/core/cldr/" + sLang + ".json", { async: true })
							.then(function (locale) {
								langName = locale.languages[sLangRegion];

								resolve({
									"text": typeof langName === 'string' ? langName.charAt(0).toUpperCase() + langName.substring(1) : "Unknown",
									"key": sLangAbbreviation
								});
							});
					}));
				}

				return result;
			}, []);
		},

		/**
		 * Sets the selected language code abbreviation
		 *
		 * @param {string} sLanguage language code abbreviation
		 * @private
		 */
		_setSelectedLanguage: function (sLanguage) {
			this._oSupportedLangModel.setProperty("/selectedLang", sLanguage);
			Localization.setLanguage(sLanguage);
			this._oCookiesConsentManager.checkUserAcceptsToPersistDisplaySettings(function(bAccepts) {
				if (bAccepts) {
					this._oConfigUtil.setCookie(DEMOKIT_CONFIGURATION_LANGUAGE, sLanguage);
				}
			}.bind(this));

			if (this._sKey) {
				this._setSelectedSectionTitle(this._sKey);
			}
		},

		/**
		 * Gets the selected language code abbreviation
		 *
		 * @private
		 * @returns {string} sLanguage language code abbreviation
		 */
		_getSelectedLanguage: function () {
			return this._oSupportedLangModel.getProperty("/selectedLang");
		},

		/**
		 * Opens the settings dialog
		 *
		 * @public
		 */
		settingsDialogOpen: function () {
			var oModel;

			if (!this._oSettingsDialog) {
				Fragment.load({
					name: "sap.ui.documentation.sdk.view.globalSettingsDialog",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					this._oView.addDependent(oDialog);
					this._oSettingsDialog = oDialog;
					Element.getElementById("LanguageSelect").setSelectedKey(this._getSelectedLanguage());
					this._oSettingsDialog.open();
				}.bind(this));
			} else {
				this._oSettingsDialog.open();
			}

			if (!this._oSupportedLangModel.getProperty("/langs")) {
				oModel = this._oSupportedLangModel;
				oModel.setProperty("/selectBusy", true);
				Promise.all(this._prepareSupportedLangModelData()).then(function (result) {
					oModel.setProperty("/selectBusy", false);
					oModel.setProperty("/langs", result);
				});
			}
		},

		/**
		 * Closes the settings dialog
		 *
		 * @public
		 */
		handleCloseAppSettings: function () {
			this._oSettingsDialog.close();
		},

		/**
		 * Saves settings from the settings dialog
		 *
		 * @public
		 */
		handleSaveAppSettings: function () {
			var sLanguage = Element.getElementById('LanguageSelect').getSelectedKey();

			this._oSettingsDialog.close();

			// handle settings change
			this._applyAppConfiguration(sLanguage);
		},

		/**
		 * Apply content configuration
		 *
		 * @param {string} sLanguage language code abbreviation
		 * @private
		 */
		_applyAppConfiguration: function (sLanguage) {
			this._setSelectedLanguage(sLanguage);
		},

		getAboutDialog: function () {
			return new Promise(function (resolve, reject) {
				if (!this._oAboutDialog) {
					Fragment.load({
						id: "aboutDialogFragment",
						name: "sap.ui.documentation.sdk.view.AboutDialog",
						controller: this
					}).then(function (oDialog) {
						this._oAboutDialog = oDialog;
						this._oView.addDependent(this._oAboutDialog);
						resolve(this._oAboutDialog);
					}.bind(this));
				} else {
					resolve(this._oAboutDialog);
				}
			}.bind(this));
		},

		aboutDialogOpen: function () {
			this.getAboutDialog().then(function (oDialog) {
				oDialog.getContent()[0].backToTop(); // reset the nav container to the first page
				oDialog.open();
			});
		},

		aboutDialogClose: function (oEvent) {
			this.getAboutDialog().then(function (oDialog) {
				oDialog.close();
			});
		},

		onAboutVersionDetails: function (oEvent) {
			var oViewModel = this.getModel("appView"),
				oViewModelData = oViewModel.getData(),
				that = this;

			library._loadAllLibInfo("", "_getLibraryInfo", "", function (aLibs, oLibInfos) {
				var data = {};
				var oLibInfo = library._getLibraryInfoSingleton();

				for (var i = 0, l = aLibs.length; i < l; i++) {
					aLibs[i] = oLibInfos[aLibs[i]];
					aLibs[i].libDefaultComponent = oLibInfo._getDefaultComponent(aLibs[i]);
				}

				data.libs = aLibs;
				oViewModelData.oVersionInfo = data;
				oViewModel.setData(oViewModelData);
				that.setModel(oViewModel, "appView");
			});

			var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon"),
				oDetailPage = Fragment.byId("aboutDialogFragment", "aboutDetail");
			oNavCon.to(oDetailPage);
		},

		onAboutThirdParty: function (oEvent) {
			var oViewModel = this.getModel("appView"),
				oViewModelData = oViewModel.getData(),
				that = this;

			library._loadAllLibInfo("", "_getThirdPartyInfo", function (aLibs, oLibInfos) {
				if (!aLibs) {
					return;
				}
				var data = {};
				data.thirdparty = [];
				for (var j = 0; j < aLibs.length; j++) {
					var oData = oLibInfos[aLibs[j]];
					for (var i = 0; i < oData.libs.length; i++) {
						var oOpenSourceLib = oData.libs[i];
						oOpenSourceLib._lib = aLibs[j];
						data.thirdparty.push(oOpenSourceLib);
					}
				}

				data.thirdparty.sort(function (a, b) {
					var aName = (a.displayName || "").toUpperCase();
					var bName = (b.displayName || "").toUpperCase();

					if (aName > bName) {
						return 1;
					} else if (aName < bName) {
						return -1;
					} else {
						return 0;
					}
				});

				oViewModelData.oThirdPartyInfo = data;
				oViewModel.setData(oViewModelData);
				that.setModel(oViewModel, "appView");
			});

			var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon"),
				oDetailPage = Fragment.byId("aboutDialogFragment", "aboutThirdParty");
			oNavCon.to(oDetailPage);
		},

		_getReleaseDialog: function () {
			return new Promise(function (resolve) {
				if (!this._oReleaseDialog) {
					Fragment.load({
						id: "releaseDialogFragment",
						name: "sap.ui.documentation.sdk.view.ReleaseDialog",
						controller: this
					}).then(function (oDialog) {
						this._oReleaseDialog = oDialog;
						this._oView.addDependent(this._oReleaseDialog);
						resolve(this._oReleaseDialog);
					}
						.bind(this));
				} else {
					resolve(this._oReleaseDialog);
				}
			}.bind(this));
		},

		_getNotesView: function () {
			var oNotesModel;
			return new Promise(function (resolve) {
				if (!this._oNotesView) {
					oNotesModel = new JSONModel();
					Fragment.load({
						id: "notesView",
						name: "sap.ui.documentation.sdk.view.ReleaseNotesView",
						controller: this
					}).then(function (oView) {
						this._oNotesView = oView;
						this._oNotesView.setModel(oNotesModel);
						resolve(this._oNotesView);
					}.bind(this));
				} else {
					resolve(this._oNotesView);
				}
			}.bind(this));
		},

		onReleaseDialogOpen: function (oEvent) {
			var oLibInfo = library._getLibraryInfoSingleton(),
				sVersion = oEvent.getSource().data("version"),
				sLibrary = oEvent.getSource().data("library"),
				oDialogModel = new JSONModel();

			Promise.all([this._getReleaseDialog(), this._getNotesView()]).then(function (aResult) {
				var oReleaseDialog = aResult[0],
					oNotesView = aResult[1],
					oNotesViewData = {};

				oLibInfo._getReleaseNotes(sLibrary, sVersion, function (oRelNotes, sVersion) {
					var oDialogData = {};

					if (oRelNotes && oRelNotes[sVersion] && oRelNotes[sVersion].notes && oRelNotes[sVersion].notes.length > 0) {
						oNotesViewData = oRelNotes[sVersion];
					} else {
						oDialogData.noData = true;
					}
					oNotesView.getModel().setData(oNotesViewData);
					oDialogData.library = sLibrary;
					oDialogModel.setData(oDialogData);
				});

				oReleaseDialog.setModel(oDialogModel);
				oReleaseDialog.addContent(oNotesView);
				oReleaseDialog.open();
			});

		},

		onReleaseDialogClose: function (oEvent) {
			this._getReleaseDialog().then(function (oDialog) {
				oDialog.close();
			});
		},

		onAboutNavBack: function (oEvent) {
			var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon");
			oNavCon.back();
		},

		onChangeVersionButtonPress: function () {
			this.getVersionSwitchDialog().then(function (oDialog) {
				oDialog.open();
			});
		},

		onCloseVersionDialog: function () {
			this.getVersionSwitchDialog().then(function (oDialog) {
				oDialog.close();
			});
		},

		onChangeVersionDialogSearch: function (oEvent) {
			var sSearchedValue = oEvent.getParameter("newValue"),
				oFilter = new Filter("version", FilterOperator.Contains, sSearchedValue),
				oTree = Element.getElementById("versionList"),
				oBinding = oTree.getBinding("items");

			oBinding.filter([oFilter]);

			// If only one branch of the version info tree is currently left after filtering
			if (oBinding.getChildCount() === 1) {
				// expand the only branch of the version info tree
				oBinding.expand(0);
			} else {
				// collapse all of the branches of the version info tree
				oTree.collapseAll();
			}
		},

		onHeaderLogoPress: function () {
			this._demoKitPage.setSideExpanded(false);
			this.oRouter.navTo("welcome", {});
		},

		onSiteMapPress: function () {
			this.oRouter.navTo("sitemap", {});
		},

		onLatestVersionItemPress: function () {
			if (ResourcesUtil.getResourcesVersion()) {
				window.sessionStorage.removeItem("versionPrefixPath");
				window.location.reload();
			} else {
				window.location.href = "/";
			}
		},

		onVersionItemPress: function (oEvent) {
			var oSelectedItem = Element.getElementById("versionList").getSelectedItem(),
				oCustomData = oSelectedItem.getCustomData()[0];

			if (oCustomData && oCustomData.getKey() === "path") {

				if (ResourcesUtil.getHasProxy()) {
					window.sessionStorage.setItem("versionPrefixPath", oCustomData.getValue());
					window.location.reload();
				} else {
					window.location.href = oCustomData.getValue(); // Domain relative redirect
				}
			}
		},

		getVersionSwitchDialog: function () {
			return new Promise(function (resolve) {
				if (!this._oChangeVersionDialog) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.ChangeVersionDialog",
						controller: this
					}).then(function (oDialog) {
						this._oChangeVersionDialog = oDialog;
						this._oChangeVersionDialog.setModel(this._buildVersionDialogModel());
						this._oView.addDependent(this._oChangeVersionDialog);
						resolve(this._oChangeVersionDialog);
					}.bind(this));
				} else {
					resolve(this._oChangeVersionDialog);
				}
			}.bind(this));
		},

		/**
		 * Custom comparison function, which is used when sorting group titles by minor version in the change version dialog
		 *
		 * @param sGroupTitleA
		 * @param sGroupTitleB
		 * @returns {number}
		 */
		versionSwitchCustomComparator: function (sGroupTitleA, sGroupTitleB) {
			return Version(sGroupTitleA).compareTo(Version(sGroupTitleB));
		},

		/**
		 * Determines whether or not to show the version change button
		 *
		 * @private
		 */
		_updateVersionSwitchVisibility: function () {
			this.getModel("appView").setProperty("/bShowVersionSwitchButton", !!this._aNeoAppVersions.length);
		},

		_buildVersionDialogModel: function () {
			var oChangeVersionDialogModel = new JSONModel();
			oChangeVersionDialogModel.setSizeLimit(1000);
			oChangeVersionDialogModel.setData(this._aNeoAppVersions);
			oChangeVersionDialogModel.setData(this._arrToTreeConverter(this._aNeoAppVersions));
			return oChangeVersionDialogModel;
		},

		/**
		 * Opens the Qualtrics UX survey when the feedback button is pressed.
		 * There are two available surveys - a short one (all year round), and quarterly survey.
		 *
		 * Depending on the number of available surveys:
		 * - Directly opens the short survey in a new tab.
		 * - If a long, quarterly survey is available, opens a popover with links for both.
		 *
		 * @param {sap.ui.base.Event} oEvent The feedback/menu button's press event
		 * @param {boolean} bMenu Whether the pressed button is hidden in the 'About' menu
		 */
		launchSurvey: function (oEvent, bMenu) {
			var oTarget = (oEvent && oEvent.getParameter && oEvent.getParameter("targetRef"))
					|| this.byId(bMenu ? "aboutMenuButton" : "surveyButton"),
				oView = this.getView(),
				oViewModel = this.getModel("appView"),
				bShowLongSurvey = oViewModel.getProperty("/bShowLongSurvey");

			if (!bShowLongSurvey) {
				this.shortSurveyRedirect();
			} else if (!this._oSurveyPopover) {
				Fragment.load({
					name: "sap.ui.documentation.sdk.view.SurveyPopover",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					this._oSurveyPopover = oPopover;

					if (Device.system.phone) {
						this.addSurveyPopoverCloseBtn();
					}

					this._oSurveyPopover.openBy(oTarget);
				}.bind(this));
			} else {
				this._oSurveyPopover.openBy(oTarget);
			}
		},

		/**
		 * Closes the survey popover on mobile.
		 *
		 * @param {sap.ui.base.Event} oEvent The close button's press event
		 */
		closeSurveyPopover: function (oEvent) {
			this._oSurveyPopover.close();
		},

		shortSurveyRedirect: function () {
			var sQueryParams = "?Release_version=" + this._getUI5Version()
				+ "&Source=" + this._getUI5Distribution()
				+ "&Type=" + this._getUI5VersionType()
				+ "&product=UI5%20Demo%20Kit"
				+ "&product_filter=UI5"
				+ "&cluster=BTP"
				+ "&page=" + encodeURIComponent(document.location.href);

			var sProdURL = "https://sapinsights.eu.qualtrics.com/jfe/form/SV_byI4QeS7Ic2Psyi" + sQueryParams,
				sDevURL = "https://sapinsights.eu.qualtrics.com/jfe/form/SV_3Epqk1MLAUQVrwy" + sQueryParams,
				bProd = !this.getModel("versionData").getProperty("/isDevEnv");

			// This survey could be displayed in a Qualtrics intercept
			// dialog in the future, instead of a new tab
			var sUrl = bProd ? sProdURL : sDevURL;
			this._logFeedbackSurveyClick("short survey", sUrl);
			URLHelper.redirect(sUrl, true);
		},

		longSurveyRedirect: function () {
			var sBaseUrl = "https://sapinsights.eu.qualtrics.com/jfe/form/SV_7X5P63Zg5zXC5zE",
				sQueryParams = "?product=UI5%20Demo%20Kit"
					+ "&product_filter=UI5"
					+ "&cluster=BTP"
					+ "&page=" + encodeURIComponent(document.location.href),
				sProdURL = sBaseUrl + sQueryParams,
				sDevURL = sBaseUrl + sQueryParams + "&Q_CHL=preview&Q_SurveyVersionID=current",
				bProd = !this.getModel("versionData").getProperty("/isDevEnv");

			var sUrl = bProd ? sProdURL : sDevURL;
			this._logFeedbackSurveyClick("quarterly survey", sUrl);
			URLHelper.redirect(sUrl, true);
		},

		_logFeedbackSurveyClick: function (sSurveyType, sDestination) {
			this.getOwnerComponent().getUsageTracker().logActivityMapEvent({
				region: "header",
				link: "feedback icon - " + sSurveyType,
				destination: sDestination
			});
		},

		setSurveyModelData: function () {
			var oViewModel = this.getModel("appView"),
				dCurrentDate = new Date(),
				iCurrentYear = dCurrentDate.getFullYear(),
				aDateSpans = [
					[new Date(iCurrentYear, 1, 1), new Date(iCurrentYear, 1, 21)], // Feb 1-21
					[new Date(iCurrentYear, 4, 1), new Date(iCurrentYear, 4, 21)], // May 1-21
					[new Date(iCurrentYear, 7, 1), new Date(iCurrentYear, 7, 21)], // Aug 1-21
					[new Date(iCurrentYear, 10, 1), new Date(iCurrentYear, 10, 21)] // Nov 1-21
				],
				bDateInSpan = false,
				sLastAvailableDate;

			aDateSpans.forEach(function (aDateSpan) {
				var dMinDate = aDateSpan[0],
					dMaxDate = aDateSpan[1];

				if (dCurrentDate >= dMinDate && dCurrentDate <= dMaxDate) {
					bDateInSpan = true;
					sLastAvailableDate = dMaxDate.toLocaleDateString();
					return;
				}
			});

			oViewModel.setProperty("/bShowLongSurvey", bDateInSpan);

			if (bDateInSpan) {
				oViewModel.setProperty("/sLongSurveyLastDate", sLastAvailableDate);
			}
		},

		addSurveyPopoverCloseBtn: async function () {
			var oResourceBundle = await this.getModel("i18n").getResourceBundle(),
				fCloseBtnHandler = this.closeSurveyPopover.bind(this),
				oCloseButton = new Button({
					text: oResourceBundle.getText("SURVEY_POPOVER_CLOSE_BTN"),
					press: fCloseBtnHandler
				});

			this._oSurveyPopover.setEndButton(oCloseButton);
		},

		onSearch: function (oEvent) {
			var oItem = oEvent.getParameter("item"),
				// Use the model query as the authoritative value — the DOM value may have
				// been replaced by ShellBarSearch typeahead autocomplete (e.g. "g" → "Git Guidelines").
				sQuery = this.getModel("searchData").getProperty("/query") || "";

			if (oItem) {
				var oPayload = typeof oItem.data === "function" ? oItem.data("_payload") : null;
				if (!oPayload) { return; }

				switch (oPayload.type) {
					case "noData":
						return;
					case "allResults":
						this.navToSearchResults();
						this._restoreSearchValue(sQuery);
						return;
					case "category":
						if (sQuery) {
							this.getRouter().navTo("search", { searchParam: encodeURIComponent(sQuery), "?options": { category: oPayload.key } }, false);
						}
						this._restoreSearchValue(sQuery);
						return;
					case "result":
						var sItemText = oPayload.item.summary ? oPayload.item.title + ": " + oPayload.item.summary : (oPayload.item.title || sQuery);
						this._navigateToSearchItem(oPayload.item, sQuery);
						this._restoreSearchValue(sItemText);
						return;
				}
			}

			// Plain Enter — fall back to DOM value in case model hasn't updated yet (e.g. paste)
			sQuery = sQuery || this._getSearchValue();
			if (!sQuery) { return; }
			this.getRouter().navTo("search", { searchParam: encodeURIComponent(sQuery) }, false);
		},

		/**
		 * Navigates to a selected search result item (internal route or external link).
		 *
		 * @param {object} oDataItem The search match backing the selected suggestion item
		 * @param {string} sQuery    The current search query (appended to Documentation links)
		 * @private
		 */
		_navigateToSearchItem: function (oDataItem, sQuery) {
			if (oDataItem.external) {
				openWindow(new URL(oDataItem.path, document.baseURI).href);
			} else {
				var sPath = oDataItem.path + (sQuery && oDataItem.category === "Documentation" ? "?q=" + encodeURIComponent(sQuery) : "");
				this.getRouter().parsePath(sPath);
			}
		},

		navToSearchResults: function (sCategory) {
			var sQuery = this.getModel("searchData").getProperty("/query"),
				oRouterParams = { searchParam: sQuery };

			if (!sQuery) {
				return;
			}

			if (sCategory) {
				oRouterParams["?options"] = {
					category: sCategory
				};
			}

			this.getRouter().navTo("search", oRouterParams, true);
			if (this._getSearchControl()) { SearchRenderer.clear(this._getSearchControl()); }
		},

		/**
		 * Handles the live change event of the search field.
		 * Performs a search based on the entered query and updates the search results.
		 * If the query is empty, hides the search picker.
		 *
		 * @param {Object} oEvent - The live change event object.
		 * @returns {void}
		 */
		onSearchLiveChange: function (/* oEvent */) {
			// ShellBarSearch fires an input event without a value parameter — read value from DOM directly.
			var sQuery = this._getSearchValue();
			this.getModel("searchData").setProperty("/query", sQuery);

			clearTimeout(this._iSearchDebounceTimer);

			if (!sQuery) {
				this._setSearchMode(false);
				return;
			}

			// Show the popup loading indicator during the debounce + async lookup window,
			// so the suggest panel shows a spinner rather than a transient "No data" state.
			this._setSearchLoading(true);
			this._iSearchDebounceTimer = setTimeout(this._executeSearch.bind(this, sQuery), 200);
		},

		_executeSearch: function (sQuery) {
			var oSearchModel = this.getModel("searchData");
			this._sLastSearchQuery = sQuery;

			SearchUtil.search(sQuery, {
				preferencedCategory: oSearchModel.getProperty("/preferencedCategory"),
				includeDeprecated: oSearchModel.getProperty("/includeDeprecated")
			}).then(function (result) {

				if (sQuery !== this._sLastSearchQuery) { return; }

				this._setSearchLoading(false);

				if (!result) {
					if (this._getSearchControl()) { SearchRenderer.clear(this._getSearchControl()); }
					oSearchModel.setProperty("/messageAreaText", "");
					return;
				}

				var oMatches = result.matches,
					aTop10 = (oMatches.filteredData || []).slice(0, 10),
					oCounts = {
						AllLength:     oMatches.AllLength || 0,
						APILength:     (oMatches.aDataAPI || []).length,
						DocLength:     (oMatches.aDataDoc || []).length,
						SamplesLength: (oMatches.aDataExplored || []).length,
						ExternalLength:(oMatches.aDataExternal || []).length
					};

				oSearchModel.setProperty("/matches", {
					filteredData:  aTop10,
					data:          oMatches.data || [],
					aDataAPI:      oMatches.aDataAPI || [],
					aDataDoc:      oMatches.aDataDoc || [],
					aDataExplored: oMatches.aDataExplored || [],
					aDataExternal: oMatches.aDataExternal || [],
					AllLength:     oCounts.AllLength,
					APILength:     oCounts.APILength,
					DocLength:     oCounts.DocLength,
					ExploredLength:oCounts.SamplesLength,
					SamplesLength: oCounts.SamplesLength,
					ExternalLength:oCounts.ExternalLength
				});

				this._renderSearchResults(aTop10, oCounts);
			}.bind(this)).catch(function () {
				if (sQuery === this._sLastSearchQuery) {
					this._setSearchLoading(false);
				}
			}.bind(this));
		},

		/**
		 * Restores the input value after ShellBarSearch overwrites it on item selection.
		 * The component sets its own value after the search event fires (post-click microtask),
		 * so the restore must be deferred past that with setTimeout(0).
		 *
		 *
		 * @param {string} sQuery The value to restore into the search field
		 * @private
		 */
		_restoreSearchValue: function (sQuery) {
			setTimeout(function () {
				var oCtrl = this._getSearchControl();
				if (oCtrl) {
					oCtrl.setValue(sQuery);
				}
			}.bind(this), 0);
		},

		/**
		 * Returns the cached searchControl instance, resolving it once via byId.
		 *
		 * @returns {sap.ui.core.Control|undefined} The search control, or undefined if not yet rendered
		 * @private
		 */
		_getSearchControl: function () {
			if (!this._oSearchControl) {
				this._oSearchControl = this.byId("searchControl");
				if (this._oSearchControl) {
					this._oSearchControl.addEventDelegate({
						onfocusin: this._onSuggestionItemFocusIn.bind(this)
					});
				}
			}
			return this._oSearchControl;
		},

		/**
		 * Keeps the actual user query in the search field while arrow-navigating the
		 * suggestion list.
		 *
		 * On item focus the ShellBarSearch web component copies the focused item's
		 * text into the field value. That is meaningful for real result items, but
		 * the "All" and per-category entries are navigation shortcuts rather than
		 * search suggestions, so their labels (e.g. "All (1028)") must not appear in
		 * the field. When such an item is focused, the user's query is restored.
		 *
		 * @param {jQuery.Event} oEvent The focusin event
		 * @private
		 */
		_onSuggestionItemFocusIn: function (oEvent) {
			var oNode = oEvent.target;
			if (!oNode || !oNode.id) { return; }

			var oItem = Element.getElementById(oNode.id),
				oPayload = oItem && typeof oItem.data === "function" ? oItem.data("_payload") : null;

			// Only result items may replace the field value with their own text;
			// "allResults", "category" and "noData" entries keep the user's query.
			if (!oPayload || oPayload.type === "result") { return; }

			this._getSearchControl().setValue(this.getModel("searchData").getProperty("/query") || "");
		},

		/**
		 * Reads the current input value from the ShellBarSearch control.
		 * ShellBarSearch fires input events without a value parameter, so the
		 * value is read from the control property instead.
		 *
		 * @returns {string} The current search field value (empty string if unavailable)
		 * @private
		 */
		_getSearchValue: function () {
			return this._getSearchControl() ? this._getSearchControl().getValue().trim() : "";
		},

		/**
		 * Toggles the ShellBarSearch popup loading indicator, shown while a search
		 * is pending (debounce + async lookup) so the suggest panel displays a
		 * spinner instead of an empty "No data" state.
		 *
		 * @param {boolean} bLoading true to show the loading indicator, false to hide it
		 * @private
		 */
		_setSearchLoading: function (bLoading) {
			if (this._getSearchControl()) {
				this._getSearchControl().setLoading(!!bLoading);
			}
		},

		_renderSearchResults: function (aItems, oCounts) {
			if (!this._getSearchControl()) { return; }

			var bPhone = this.getModel("appView").getProperty("/bPhoneSize"),
				oSearchModel = this.getModel("searchData");

			SearchRenderer.render(this._getSearchControl(), aItems, oCounts, this._oI18nBundle, bPhone, oSearchModel);
		},

		/**
		 * Handles the resize event of the page.
		 *
		 * This function adjusts the view model properties based on the page width,
			 * and performs additional actions for a better user experience.
		 *
		 * @param {Object} oEvent - The resize event object.
		 * @returns {void}
		 */
		onPageResize: function (oEvent) {
			var iWidth = oEvent.size.width,
				bDesktopSize = iWidth >= Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1], // 1024px
				bPhoneSize = iWidth < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0], // 600px
				oViewModel = this.getModel("appView");

			if (bPhoneSize !== oViewModel.getProperty("/bPhoneSize")) {
				oViewModel.setProperty("/bPhoneSize", bPhoneSize);

				// When page is resized from desktop to phone size, hide side navigation initially for better UX
				this._demoKitPage.setSideExpanded(false);
			}

			if (bDesktopSize !== oViewModel.getProperty("/bDesktopSize")) {
				oViewModel.setProperty("/bDesktopSize", bDesktopSize);
			}
		},

		onSideNavigationButtonPress: function () {
			this._demoKitPage.setSideExpanded(!this._demoKitPage.getSideExpanded());
		},

		_onOrientationChange: function () {
			this.getModel("appView").setProperty("/bLandscape", Device.orientation.landscape);
		},

		/**
		 * Handles the ShellBar search field expanding or collapsing on phone.
		 * When it expands with an empty field, proactively open the suggestion
		 * popup with the category empty-state so it is not blank.
		 *
		 * @param {sap.ui.base.Event} oEvent
		 */
		onSearchFieldToggle: function (oEvent) {
			var bOpen = oEvent.getParameter("expanded");
			if (!bOpen) { return; }
			var bPhone = this.getModel("appView").getProperty("/bPhoneSize");
			if (!bPhone) { return; }
			if (!this._getSearchControl()) { return; }
			this._setSearchMode(true);
			this._getSearchControl().setOpen(true);
		},

		/**
		 * Handles the closing of the search suggestion popup.
		 *
		 * @returns {void}
		 */
		onSearchClose: function () {
			this._setSearchMode(false);
		},

		/**
		 * Populates or resets the suggestion popup for the current search state.
		 *
		 * @param {boolean} bOpen Whether the search popup is open
		 * @private
		 */
		_setSearchMode: function (bOpen) {
			var oViewModel = this.getModel("appView");
			if (!bOpen) {
				if (this._getSearchControl()) { SearchRenderer.clear(this._getSearchControl()); }
				this._setSearchLoading(false);
				return;
			}

			var bPhone = oViewModel.getProperty("/bPhoneSize");
			if (bPhone) {
				var oSearchModel = this.getModel("searchData"),
					sQuery = oSearchModel.getProperty("/query"),
					sCurrentValue = this._getSearchValue(),
					oMatches = oSearchModel.getProperty("/matches");
				if (sCurrentValue && sCurrentValue !== sQuery) {
					oSearchModel.setProperty("/query", sCurrentValue);
					this._setSearchLoading(true);
					this._executeSearch(sCurrentValue);
					return;
				}
				if (sQuery && oMatches) {
					var aTop10 = oMatches.filteredData || [],
						oCounts = {
							AllLength:     oMatches.AllLength || 0,
							APILength:     oMatches.APILength || 0,
							DocLength:     oMatches.DocLength || 0,
							SamplesLength: oMatches.SamplesLength || 0,
							ExternalLength:oMatches.ExternalLength || 0
						};
					SearchRenderer.render(this._getSearchControl(), aTop10, oCounts, this._oI18nBundle, bPhone, oSearchModel);
					return;
				}
			}

			if (this._getSearchControl()) {
				bPhone ? SearchRenderer.renderEmptyState(this._getSearchControl(), this._oI18nBundle) : SearchRenderer.clear(this._getSearchControl());
			}
		},

		_getCurrentYear: function () {
			return new Date().getFullYear();
		},

		_getCurrentQuarter: function () {
			var oDate = new Date(),
				iMonth = oDate.getMonth(),
				iQuarter = Math.floor(iMonth / 3) + 1;

			return iQuarter;
		},

		/**
		 * Filters versions in the given JSON object that have passed their end of cloud maintenance date.
		 *
		 * @param {Object} oVersionOverviewJson - A JSON object containing version information.
		 * @returns {Array} An array of versions that have not passed their end of cloud maintenance date.
		 */
		_filterVersionsPastEOCP: function (oVersionOverviewJson) {
			var aVersions = oVersionOverviewJson.patches;

			return aVersions.filter(function (oVersion) {
				var sVersionEOCP = oVersion.extended_eocp || oVersion.eocp || "";
				// Handle the case when eocp is not defined and include it in the list
				if (!sVersionEOCP) {
					return true;
				}
				// Handle the case when eocp is not in the "quarter/year" format (e.g., "To Be Determined")
				// Treat it as if it hasn't passed its end of cloud maintenance date and include it in the list
				var isQuarterYearFormat = /^Q[1-4]\/\d{4}$/i.test(sVersionEOCP);
				if (!isQuarterYearFormat) {
					return true;
				}
				// Otherwise, check if the version has passed its end of cloud maintenance date
				var iQuarter = Number(sVersionEOCP.substring(1, 2)),
					iYear = Number(sVersionEOCP.substring(3));

				return iYear > this._getCurrentYear() ||
					iYear === this._getCurrentYear() && iQuarter >= this._getCurrentQuarter();
			}.bind(this));
		},

		_processVersionOverview: function (oVersionOverviewJson) {
			var aVersions = oVersionOverviewJson.versions,
				aResult = [];

			if (Array.isArray(aVersions)) {
				aVersions = aVersions.filter(function (oVersion) {
					return !!oVersion.hidden;
				}).forEach(function (oVersion) {
					var aHiddenVersions = oVersion.hidden.split(",").map(function (sVersion) {
						return sVersion.trim();
					});

					aResult = aResult.concat(aHiddenVersions);
				});
			}

			return aResult;
		},

		_processNeoAppJSON: function (oNeoAppJson) {
			var oVersionModel = this.getModel("versionData"),
				bIsInternal = oVersionModel.getProperty("/isInternal"),
				bIsSnapshotVersion = oVersionModel.getProperty("/isSnapshotVersion"),
				aRoutes = [];

			if (!(oNeoAppJson && oNeoAppJson.routes)) {
				Log.warning("No versions were found");
				return;
			}

			aRoutes = oNeoAppJson.routes;

			// Current version would be displayed for a second time as the last element,
			// therefore we should skip it to avoid duplicate items in the dialog.
			aRoutes.pop();

			// Store needed data
			if (!bIsInternal && !bIsSnapshotVersion) {
				aRoutes = aRoutes.filter(function (oRoute) {
					return oRoute.target.version.indexOf("-beta") === -1;
				});
			}

			aRoutes = aRoutes.map(function (oRoute) {
				var oVersion = Version(oRoute.target.version),
					oVersionSummary = {};

				// Add the following properties, in order use them for grouping later
				oVersionSummary.patchVersion = oVersion.getPatch(); // E.g: Extract 5 from "1.52.5"
				oVersionSummary.groupTitle = oVersion.getMajor() + "." + oVersion.getMinor(); // E.g: Extract "1.52" from "1.52.5"
				oVersionSummary.version = oVersion.toString();
				oVersionSummary.path = oRoute.path;

				return oVersionSummary;
			});

			return aRoutes;
		},

		_requestVersionInfo: function () {
			Promise.all([
				jQuery.ajax(sNeoAppJsonPath),
				jQuery.ajax(sVersionOverviewJsonPath)
			]).then(
				// Success
				function (oValues) {
					var aNeoAppVersions = this._processNeoAppJSON(oValues[0]),
						aHiddenValues = this._processVersionOverview(oValues[1]),
						aFilteredVersionsEOCP = this._filterVersionsPastEOCP(oValues[1]);

					if (Array.isArray(aNeoAppVersions) && aNeoAppVersions.length > 0) {
						aNeoAppVersions = aNeoAppVersions.filter(function (oVersion) {
							return aHiddenValues.indexOf(oVersion.version) === -1;
						});

						// Filters "aNeoAppVersions" array by removing elements
						// that don't have a matching version in "aFilteredVersionsEOCP" array.
						aNeoAppVersions = aNeoAppVersions.filter(function (oVersion) {
							return aFilteredVersionsEOCP.find(function (oFilteredVersion) {
								return oFilteredVersion.version === oVersion.version;
							});
						});

						this._aNeoAppVersions = aNeoAppVersions;
						// Make version select visible
						this._updateVersionSwitchVisibility();
						this.getModel("versionData").setProperty("/latestVersion", this._aNeoAppVersions[0].version);
					} else {
						this._aNeoAppVersions = [];
						Log.warning("No multi-version environment detected");
					}
				}.bind(this),
				// Error
				function () {
					Log.warning("No neo-app.json or versionoverview.json was detected");
				}
			);
		},

		_getFullVersion: function () {
			return this.getModel("versionData").getProperty("/fullVersion");
		},

		_getUI5Version: function () {
			return ResourcesUtil.getResourcesVersion()
				? window.sessionStorage.getItem("versionPrefixPath")
				: this.getModel("versionData").getProperty("/version");
		},

		_getUI5VersionGav: function () {
			return this.getModel("versionData").getProperty("/versionGav");
		},

		_getUI5Distribution: function () {
			var sVersionGav = this._getUI5VersionGav(),
				sUI5Distribution = "SAPUI5";

			if (sVersionGav && /openui5/i.test(sVersionGav)) {
				sUI5Distribution = "OpenUI5";
			}

			return sUI5Distribution;
		},

		_getUI5VersionType: function () {
			var oVersionModel = this.getModel("versionData"),
				bIsInternal = oVersionModel.getProperty("/isInternal"),
				bIsSnapshotVersion = oVersionModel.getProperty("/isSnapshotVersion"),
				sVersionType;

			switch (true) {
				case bIsSnapshotVersion && bIsInternal:
					sVersionType = "InternalSnapshot";
					break;
				case bIsInternal:
					sVersionType = "Internal";
					break;
				case bIsSnapshotVersion:
					sVersionType = "Snapshot";
					break;
				default:
					sVersionType = "Release";
			}

			return sVersionType;
		},

		_getCurrentPageRelativeURL: function () {
			var currentLocation = window.location;
			return currentLocation.pathname + currentLocation.hash + currentLocation.search;
		},

		_getCurrentURL: function () {
			var currentLocation = window.location;
			return currentLocation.href;
		},

		_setHeaderSelectedKey: function (sKey) {
			this._demoKitSubHeader.setSelectedKey(sKey);
			this._demoKitSideNavigation.setSelectedKey(sKey);
			this._sKey = sKey;
		},

		/**
		 * Sets the selected section title based on the provided key.
		 *
		 * @param {string} sKey - The key of the selected section.
		 * @returns {void}
		 */
		_setSelectedSectionTitle: async function (sKey) {
			var oViewModel = this.getModel("appView"),
				oResourceBundle = await this.getModel("i18n").getResourceBundle();

			var items = [
				{ key: "home", 		text: oResourceBundle.getText("APP_TABHEADER_ITEM_HOME") },
				{ key: "topic", 	text: oResourceBundle.getText("APP_TABHEADER_ITEM_DOCUMENTATION") },
				{ key: "api", 		text: oResourceBundle.getText("APP_TABHEADER_ITEM_API_REFERENCE") },
				{ key: "controls", 	text: oResourceBundle.getText("APP_TABHEADER_ITEM_SAMPLES") },
				{ key: "demoapps", 	text: oResourceBundle.getText("APP_TABHEADER_ITEM_DEMO_APPS") },
				{ key: "resources", text: oResourceBundle.getText("APP_TABHEADER_ITEM_RESOURCES") }
			];

			var selectedItem = items.find(function (item) { return item.key === sKey; });
			oViewModel.setProperty("/selectedSectionTitle", selectedItem.text);
		}
	});
});