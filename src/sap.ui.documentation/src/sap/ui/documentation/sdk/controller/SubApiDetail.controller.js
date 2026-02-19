/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/base/Log",
		"sap/ui/core/Fragment",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/ui/documentation/sdk/model/formatter",
		"sap/ui/documentation/Row",
		"sap/ui/documentation/ParamText",
		"sap/ui/documentation/JSDocType",
		"sap/ui/documentation/JSDocText",
		"sap/m/Image",
		"sap/m/Label",
		"sap/m/Link",
		"sap/m/Text",
		"sap/m/HBox",
		"sap/m/ObjectAttribute",
		"sap/m/ObjectStatus",
		"sap/m/Popover",
		"sap/m/library",
		"sap/ui/core/library",
		"sap/m/CustomListItem",
		"sap/m/List",
		"sap/ui/dom/includeStylesheet",
		"sap/ui/dom/includeScript",
		"sap/uxap/ObjectPageSection",
		"sap/ui/documentation/ObjectPageSubSection",
		"sap/ui/core/HTML"
	], function (jQuery, Log, Fragment, APIInfo, BaseController, ToggleFullScreenHandler,
			formatter, Row, ParamText, JSDocType, JSDocText, Image, Label, Link, Text, HBox, ObjectAttribute, ObjectStatus, Popover,
			library, coreLibrary, CustomListItem, List, includeStylesheet, includeScript,
			ObjectPageSection, ObjectPageSubSection, HTML) {
		"use strict";

		// shortcut for sap.m.FlexWrap
		var FlexWrap = library.FlexWrap;
		var ObjectStatusState =  coreLibrary.ValueState;

		return BaseController.extend("sap.ui.documentation.sdk.controller.SubApiDetail", {

			NOT_AVAILABLE: 'N/A',
			PUBLIC_GITHUB_FRAMEWORK_DOMAIN: 'https://github.com/UI5/openui5/blob/master/src/',
			SECTION_MAP: {
				"properties": "controlProperties",
				"fields": "properties",
				"special settings": "specialsettings"
			},
			EXTERNAL_BASE_TYPES: [
				"Date",
				"Object"
			],
			formatter: formatter,

			onInit: function () {
				this._objectPage = this.byId("apiDetailObjectPage");

				if ( !window.hljs ) {
					//solarized-light
					includeStylesheet("resources/sap/ui/documentation/sdk/thirdparty/highlight.js/styles.css");
					includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/highlight.js/highlight.js" });
				}
			},

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			initiate: function (oReferences) {
				var bHasSelfProps,
					bHasSelfAggr,
					bHasSelfAssoc,
					fnOverrideBorrowedFilter = function (item) {
						return !item.borrowedFrom;
					};

				// Setup
				this._sTopicId = oReferences.sTopicId;
				this._oModel = oReferences.oModel;
				this._oControlData = this._oModel.getData();
				this._aApiIndex = oReferences.aApiIndex;
				this._aAllowedMembers = oReferences.aAllowedMembers;
				this._sEntityType = oReferences.sEntityType;
				this._sEntityId = oReferences.sEntityId !== "undefined" ? oReferences.sEntityId : undefined;
				this._oEntityData = oReferences.oEntityData;
				this._oContainerController = oReferences.oContainerController;
				this._oContainerView = oReferences.oContainerView;
				this._oToggleFullScreenBtn = this.byId("toggleFullScreenBtn");

				// Override instance getOwnerComponent so correct component will be used for the controller
				this.getOwnerComponent = function () {
					return oReferences.oOwnerComponent;
				};

				// Cache router instance
				this._oRouter = this.getRouter();

				this._allProperties = this._oModel.getProperty("/ui5-metadata/properties");
				this._allAggregations = this._oModel.getProperty("/ui5-metadata/aggregations");
				this._allAssociations = this._oModel.getProperty("/ui5-metadata/associations");

				if (this._allProperties) {
					this._selfProperties = this._allProperties.filter(fnOverrideBorrowedFilter);
					bHasSelfProps = this._selfProperties.length > 0;
					this._oModel.setProperty("/bShowBorrowedProps", !bHasSelfProps);
					this._oModel.setProperty("/bHasSelfProps", bHasSelfProps);
					this._oModel.setProperty("/bHasBorrowedProps", this._allProperties.length > this._selfProperties.length);
					this._oModel.setProperty("/ui5-metadata/properties", bHasSelfProps ? this._selfProperties : this._allProperties);
				}

				if (this._allAggregations) {
					this._selfAggregations = this._allAggregations.filter(fnOverrideBorrowedFilter);
					bHasSelfAggr = this._selfAggregations.length > 0;
					this._oModel.setProperty("/bShowBorrowedAggr", !bHasSelfAggr);
					this._oModel.setProperty("/bHasSelfAggr", bHasSelfAggr);
					this._oModel.setProperty("/bHasBorrowedAggr", this._allAggregations.length > this._selfAggregations.length);
					this._oModel.setProperty("/ui5-metadata/aggregations", bHasSelfAggr ? this._selfAggregations : this._allAggregations);
				}

				if (this._allAssociations) {
					this._selfAssociations = this._allAssociations.filter(fnOverrideBorrowedFilter);
					bHasSelfAssoc = this._selfAssociations.length > 0;
					this._oModel.setProperty("/bShowBorrowedAssoc", !bHasSelfAssoc);
					this._oModel.setProperty("/bHasSelfAssoc", bHasSelfAssoc);
					this._oModel.setProperty("/bHasBorrowedAssoc", this._allAssociations.length > this._selfAssociations.length);
					this._oModel.setProperty("/ui5-metadata/associations", bHasSelfAssoc ? this._selfAssociations : this._allAssociations);
				}

				var sLibName = this._oEntityData.lib,
					sLibPath = sLibName.replace(/\./g, '/'),
					sComponentPath = this._oEntityData.name.replace(sLibName, "").replace(/^[.]/, "").replace(/\./g, '/'),
					aSectionTypes = (this._oControlData.customSections || []).map(function(section) {
						var sType = typeof section === 'string' ? section : section.name;
						return {
							type: sType,
							property: sType + "Content",
							displayTitle: sType.charAt(0).toUpperCase() + sType.slice(1),
							sectionId: sType.toLowerCase(),
							hasSubsections: section.hasSubsections || false,
							subsections: section.subsections || null
						};
					});

				var fnLoadContent = function(sUrl, sProperty) {
					return new Promise(function(resolve) {
						jQuery.ajax({
							url: sUrl,
							success: function(data) {
								this._oModel.setProperty("/" + sProperty, data);
								resolve(true);
							}.bind(this),
							error: function() { resolve(false); }
						});
					}.bind(this));
				}.bind(this);

				var aContentPromises = aSectionTypes.map(function(oSection) {
					var aPromises = [];
					var sBaseUrl = './docs/api/' + sLibPath + '/demokit/sections/' + sComponentPath + '/';

					if (oSection.hasSubsections) {
						// Load main + subsections
						aPromises.push(fnLoadContent(sBaseUrl + oSection.type + '.html', oSection.type + "_mainContent"));
						oSection.subsections.forEach(function(sub) {
							aPromises.push(fnLoadContent(sBaseUrl + oSection.type + '/' + sub + '.html', oSection.type + "_" + sub + "Content"));
						});
					} else {
						// Load single section
						aPromises.push(fnLoadContent(sBaseUrl + oSection.type + '.html', oSection.property));
					}

					return Promise.all(aPromises).then(function() { return oSection; });
			});

			Promise.all(aContentPromises).then(function(aSections) {
					aSections.forEach(this._createAndAddSection, this);
				}.bind(this));

				this.setModel(this._oModel);

				// Build needed resources and pre-process data
				this._oEntityData.appComponent = this._oControlData.component || this.NOT_AVAILABLE;
				this._oEntityData.hasSample = this._oControlData.hasSample;
				this._oEntityData.sample = this._oControlData.hasSample ? this._sTopicId : this.NOT_AVAILABLE;

				this._buildHeaderLayout(this._oControlData, this._oEntityData);

				setTimeout(function () {
					// Initial hljs
					this._hljs();

					// Attach hljs for un-stashed sub sections
					this._objectPage.attachEvent("subSectionEnteredViewPort", function () {
						// Clear previous calls if any
						if (this._sHljsDelayedCallID) {
							clearTimeout(this._sHljsDelayedCallID);
						}
						this._sHljsDelayedCallID = setTimeout(function () {
							//The event is called even if all the sub-sections are un-stashed so apply the class and highlights only when we have un-processed targets.
							var $aNotApplied = this._objectPage.$().find("pre:not(.hljs)");
							if ($aNotApplied.length > 0 && window.hljs) {
								$aNotApplied.addClass('hljs');
								document.querySelectorAll('pre').forEach(function(block) {
									window.hljs.highlightElement(block);
								});
							}
						}.bind(this), 200);
					}, this);

					// Init scrolling right after busy indicator is cleared
					setTimeout(function () {

						if (this._sEntityType) {
							this.scrollToEntity(this._sEntityType, this._sEntityId);
						}

						// Add listener's with a slight delay so they don't break scroll to entity
						setTimeout(function () {
							this._objectPage.attachEvent("_sectionChange", function (oEvent) {
								var oSection = oEvent.getParameter("section"),
									oSubSection = oEvent.getParameter("subSection");

								if (this._oNavigatingTo) {
									if (this._oNavigatingTo === oSubSection) {
										// Destination is reached
										this._oNavigatingTo = null;
									}

									return;
								}

								this._modifyURL(oSection, oSubSection, false);
							}, this);

							this._objectPage.attachEvent("navigate", function (oEvent) {
								var oSection = oEvent.getParameter("section"),
									oSubSection = oEvent.getParameter("subSection");

								this._oNavigatingTo = oSubSection;
								this._modifyURL(oSection, oSubSection, true);
							}, this);
						}.bind(this), 500);

					}.bind(this), 1000);
				}.bind(this), 0);

				this.appendPageTitle(this._oModel.getProperty("/displayName"));
			},

			onAfterRendering: function () {
				this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);
				ToggleFullScreenHandler.updateControl(this._oToggleFullScreenBtn, this._oContainerView, this._oContainerController);
			},

			onExit: function () {
				this.getView().detachBrowserEvent("click", this.onJSDocLinkClick, this);
			},

			onToggleFullScreen: function (oEvent) {
				// As this is a nested sub-view we pass the container view and controller context so fullscreen will
				// work as expected.
				ToggleFullScreenHandler.updateMode(oEvent, this._oContainerView, this._oContainerController);
			},

			onBorrowedPropCheckboxClick: function (oEvent) {
				var bChecked = oEvent.getParameter("selected");

				this._oModel.setProperty("/bShowBorrowedProps", bChecked);

				this._oModel.setProperty("/ui5-metadata/properties", bChecked ? this._allProperties : this._selfProperties);
			},

			onBorrowedAggrCheckboxClick: function (oEvent) {
				var bChecked = oEvent.getParameter("selected");

				this._oModel.setProperty("/bShowBorrowedAggr", bChecked);

				this._oModel.setProperty("/ui5-metadata/aggregations", bChecked ? this._allAggregations : this._selfAggregations);
			},

			onBorrowedAssocCheckboxClick: function (oEvent) {
				var bChecked = oEvent.getParameter("selected");

				this._oModel.setProperty("/bShowBorrowedAssoc", bChecked);

				this._oModel.setProperty("/ui5-metadata/associations", bChecked ? this._allAssociations : this._selfAssociations);
			},

			onJSDocLinkClick: function (oEvent) {
				var oClassList = oEvent.target.classList,
					bExternalLink = oClassList.contains("sapUISDKExternalLink");

				if (bExternalLink) {
					this.onDisclaimerLinkPress(oEvent);
					return;
				}
			},

			onVisibilityInformationClick: function (oEvent) {
				var oIcon = oEvent.getSource(),
					oView = this.getView();

				if (!this._oPopover) {
					this._oPopover = Fragment.load({
						name: "sap.ui.documentation.sdk.view.VisibilityInformation",
						controller: this
					}).then(function(oPopover) {
						oView.addDependent(oPopover);
						return oPopover;
					});
				}
				this._oPopover.then(function(oPopover) {
					oPopover.openBy(oIcon);
				});
			},

			/* =========================================================== */
			/* begin: internal methods									   aa*/
			/* =========================================================== */

			_modifyURL: function(oSection, oSubSection, bShouldStoreToHistory) {
				var sSection = oSection.getTitle().toLowerCase(),
					sSubSection = (oSubSection && oSubSection.getTitle() !== 'Overview') ? oSubSection.getTitle() : '';

				// BCP: 1870269220 - We have a section with a name "constructor" which matches the native javascript
				// object constructor as a key and returns it's method instead of matched key->value pair.
				if (Object.keys(this.SECTION_MAP).indexOf(sSection) >= 0) {
					sSection = this.SECTION_MAP[sSection];
				}

				this._oRouter.navToChangeUrlOnly({
					id: this._sTopicId,
					entityType: sSection,
					entityId: sSubSection
				}, bShouldStoreToHistory);

			},

			_hljs: function () {
				if (window.hljs) {
					document.querySelectorAll('pre').forEach(function(block) {
						window.hljs.highlightElement(block);
					});
				}
			},

			/**
			 * Applies syntax highlighting to a LightTable after it is re-rendered.
			 * Attaches an onAfterRendering delegate to the LightTable, applies highlighting,
			 * and then removes the delegate.
			 * @param {sap.ui.documentation.LightTable} oLightTable The LightTable control to apply highlighting to
			 * @private
			 */
			_applyHljsToLightTable: function(oLightTable) {
				if (!oLightTable || !window.hljs) {
					return;
				}

				var oDelegate = {
					onAfterRendering: function() {
						// Find unprocessed pre elements within the LightTable's DOM
						var oDomRef = oLightTable.getDomRef();
						if (oDomRef) {
							var aPreElements = oDomRef.querySelectorAll('pre:not(.hljs)');
							if (aPreElements.length > 0) {
								aPreElements.forEach(function(oElement) {
									oElement.classList.add('hljs');
									window.hljs.highlightElement(oElement);
								});
							}
						}
						// Remove the delegate after execution
						oLightTable.removeEventDelegate(oDelegate);
					}
				};

				// Attach the delegate to the LightTable
				oLightTable.addEventDelegate(oDelegate);
			},

			scrollToEntity: function (sSectionId, sEntityId) {

				var aFilteredSubSections,
					aSubSections,
					oSection,
					sSubSectionTitle;

				if (!sSectionId) {
					return;
				}

				// LowerCase every input from URL
				sSectionId = sSectionId.toLowerCase();

				oSection = this.byId(sSectionId);
				if (!oSection) {
					return;
				}

				// If we have a target sub-section we will scroll to it else we will scroll directly to the section
				if (sEntityId) {
					// Let's ignore case when searching for the section especially like in this case
					// where sSubSectionTitle comes from the URL
					sSubSectionTitle = formatter.apiRefEntityName(sEntityId).toLowerCase();

					aSubSections = oSection.getSubSections();
					aFilteredSubSections = aSubSections.filter(function (oSubSection) {
						return oSubSection.getTitle().toLowerCase() === sSubSectionTitle;
					});

					if (aFilteredSubSections.length) {
						// We scroll to the first sub-section found
						this._objectPage.scrollToSection(aFilteredSubSections[0].getId(), 250);
					}
				} else {
					// We scroll to section
					this._objectPage.scrollToSection(oSection.getId(), 250);
				}

			},

			_scrollContentToTop: function () {
				if (this._objectPage && this._objectPage.$().length > 0) {
					this._objectPage.getScrollDelegate().scrollTo(0, 0);
				}
			},

			_getHeaderLayoutUtil: function () {
				if (!this._oHeaderLayoutUtil) {
					var _getObjectAttributeBlock = function (sTitle, sText, oCustomContent) {
							var oObjectAttribute = new ObjectAttribute({
								title: sTitle,
								text: sText
							}).addStyleClass("sapUiTinyMarginBottom");
							if (oCustomContent) {
								oObjectAttribute.setCustomContent(oCustomContent);
							}

							return oObjectAttribute;
						},
						_getVisibilityObjectStatusBlock = function (sText, allowedFor) {
							return new ObjectStatus({
								title: "Visibility",
								text: formatter.formatVisibility(sText, allowedFor),
								state: ObjectStatusState.Warning
							}).addStyleClass("sapUiTinyMarginBottom");
						},

						_getLink = function (oConfig) {
							return new Link(oConfig || {});
						},
						_getText = function (oConfig) {
							return new Text(oConfig || {});
						},
						_getLabel = function (oConfig) {
							return new Label(oConfig || {});
						},
						_getHBox = function (oConfig, bAddCommonStyles) {
							var oHBox = new HBox(oConfig || {});

							if (bAddCommonStyles) {
								oHBox.addStyleClass("sapUiDocumentationHeaderNavLinks sapUiTinyMarginBottom");
							}

							return oHBox;
						};

					this._oHeaderLayoutUtil = {

						_getControlSampleBlock: function (oControlData, oEntityData) {
							var sStereotype = oControlData && oControlData['ui5-metadata'] && oControlData['ui5-metadata'].stereotype || '';
							if (typeof sStereotype === 'string' && sStereotype.length > 0) {
								// stereotype with starting capital char and spacer at the end
								sStereotype = sStereotype.charAt(0).toUpperCase() + sStereotype.slice(1) + ' ';
							}

							return _getHBox({
								items: [
									_getLabel({design: "Bold", text: sStereotype + "Sample:"}),
									_getLink({
										emphasized: true,
										text: oEntityData.sample,
										visible: !!oEntityData.hasSample,
										href: "entity/" + oControlData.name
									}),
									_getText({text: oEntityData.sample, visible: !oEntityData.hasSample})
								]
							}, true);
						},
						_getControlGithub: function (oControlData, oEntityData) {
							return _getHBox({
								items: [
									_getLabel({design: "Bold", text: "GitHub:"}),
									_getLink({
										emphasized: true,
										text: oControlData.resource,
										visible: true,
										href: this.PUBLIC_GITHUB_FRAMEWORK_DOMAIN + oEntityData.lib + '/src/' + oControlData.resource
									})
								]
							}, true);
						},
						_getDocumentationBlock: function (oControlData, oEntityData) {
							return _getHBox({
								items: [
									_getLabel({design: "Bold", text: "Documentation:"}),
									_getLink({
										emphasized: true,
										text: oControlData.docuLinkText,
										href: "topic/" + oControlData.docuLink
									})
								]
							}, true);
						},
						_getUXGuidelinesBlock: function (oControlData) {
							return _getHBox({
								items: [
									_getLabel({design: "Bold", text: "UX Guidelines:"}),
									_getLink({
										emphasized: true,
										text: oControlData.uxGuidelinesLinkText,
										href: oControlData.uxGuidelinesLink,
										target: "_blank"
									}),
									new Image({
										src: "./resources/sap/ui/documentation/sdk/images/link-sap.png",
										tooltip: "Information published on SAP site",
										press: this.onDisclaimerLinkPress
									})
								]
							}, true);
						},
						_getExtendsBlock: function (oControlData, oEntityData) {
							// whether the base class can be linked to
							var bExtendsAPIEntity =
								oControlData.isDerived
								&& !this.EXTERNAL_BASE_TYPES.includes(oControlData.extendsText);

							return _getHBox({
								items: [
									_getLabel({text: "Extends:"}),
									_getLink({
										text: oControlData.extendsText,
										href: "api/" + oControlData.extendsText,
										visible: bExtendsAPIEntity
									}),
									_getText({text: oControlData.extendsText, visible: !bExtendsAPIEntity})
								]
							}, true);
						},
						_getSubclassesBlock: function (oControlData, oEntityData) {
							var aSubClasses =
									oEntityData.extendedBy ||
									oEntityData.implementedBy,
								fnFilterSubclassesByVisibility = function (aSubClasses) {
									return aSubClasses.filter((oSubClassInfo) =>
										this._aAllowedMembers.includes(
											oSubClassInfo.visibility
										)
									);
								}.bind(this),
								fnGetSubclassesNames = function (aSubClasses) {
									return aSubClasses.map(
										(oSubClassInfo) => oSubClassInfo.name
									);
								},
								oSubClassesLink;

							if (aSubClasses && typeof aSubClasses[0] === "object") {
								aSubClasses = fnGetSubclassesNames(fnFilterSubclassesByVisibility(aSubClasses));
							}
							this._aSubClasses = aSubClasses;

							if (aSubClasses.length === 1) {
								oSubClassesLink = _getLink({text: aSubClasses[0], href: "api/" + aSubClasses[0]});
							} else {
								oSubClassesLink = _getLink({
									text: oControlData.isClass ? "View subclasses" : "View implementations",
									press: this._openSubclassesImplementationsPopover.bind(this)
								});
								oSubClassesLink.onclick = function(oEvent) {
									oEvent.allowPreventDefault = true;
									Link.prototype._handlePress.call(this, oEvent);
								};
							}

							return _getHBox({
								items: [
									_getLabel({text: oControlData.isClass ? "Known direct subclasses:" : "Known direct implementations:"}),
									oSubClassesLink
								]
							}, true);
						},
						_getImplementsBlock: function (oControlData, oEntityData) {
							var aItems = [_getLabel({text: "Implements:"})];

							oControlData.implementsParsed.forEach(function (oElement) {
								aItems.push(_getLink({text: oElement.name, href: "api/" + oElement.href}));
							});

							return _getHBox({
								items: aItems,
								wrap: FlexWrap.Wrap
							}, true).addStyleClass("sapUiDocumentationCommaList");
						},
						_getModuleBlock: function (oControlData, oEntityData) {
							const versionData = this.getModel("versionData").getData();
							const isModuleAvailable = oControlData.module !== this.NOT_AVAILABLE;
							const library = versionData?.libraries?.find((lib) => lib.name === oEntityData.lib);
							const sVersion = library?.version?.includes("-SNAPSHOT") ? "HEAD" : library?.version;
							const bIsOpenUI5Lib = library.npmPackageName?.startsWith("@openui5");


							if (!isModuleAvailable || !sVersion || !bIsOpenUI5Lib) {
								return _getObjectAttributeBlock("Module", oControlData.module);
							}

							const sGitHubUrl = `https://github.com/UI5/openui5/blob/${sVersion}/src/${oEntityData.lib}/src/${oControlData.module}.js`;

							return _getHBox({
								items: [
									_getLabel({text: "Module:"}),
									_getLink({
										emphasized: true,
										text: oControlData.module,
										href: sGitHubUrl
									}),
									new Image({
										src: "./resources/sap/ui/documentation/sdk/images/link-external.png",
										tooltip: "{i18n>LEGAL_DISCLAIMER_EXTERNAL_TOOLTIP}",
										press: BaseController.prototype.onDisclaimerLinkPress.bind(this._oContainerController)
									})
								]
							}, true);
						},
						_getLibraryBlock: function (oControlData, oEntityData) {
							return _getObjectAttributeBlock("Library", oEntityData.lib);
						},
						_getVisibilityBlock: function (oControlData, oEntityData) {
							var sVisibility = oControlData.visibility,
								aAllowedFor = oEntityData.allowedFor;
							if ( sVisibility === "restricted" && aAllowedFor) {
								return aAllowedFor.length > 1 ?
									_getObjectAttributeBlock("Visibility", sVisibility,
									_getLink({
										text: "restricted to",
										press: this._openVisibilityPopover.bind(this, aAllowedFor)
								})) :
								_getVisibilityObjectStatusBlock(sVisibility, aAllowedFor);

							} else {
								return _getObjectAttributeBlock("Visibility", sVisibility);
							}

						},
						_getAvailableSinceBlock: function (oControlData, oEntityData) {
							return _getObjectAttributeBlock("Available since", oControlData.sinceText);
						},
						_getApplicationComponentBlock: function (oControlData, oEntityData) {
							return _getObjectAttributeBlock("Application Component", oEntityData.appComponent);
						}
					};
				}

				return this._oHeaderLayoutUtil;
			},

			/**
			 * Opens the Popover, which displays the entity subclasses, if the entity is a class.
			 * Or, it displays the direct implementations, if the entity is interface.
			 */
			_openSubclassesImplementationsPopover: function (oEvent) {
				var aPopoverContent = this._aSubClasses.map(function (oElement) {
					return new CustomListItem({
						content: [
							new Link({
								text: oElement,
								href: "api/" + oElement
							}).addStyleClass("sapUiTinyMargin")
						]
					});
				}), oPopover = this._addPopoverContent(aPopoverContent);

				oPopover.openBy(oEvent.getSource());
			},

			/**
			 * Opens the Popover, which displays the visibility of the restricted entities.
			 */
			_openVisibilityPopover: function (aAllowedForItems, oEvent) {
				var aPopoverContent = aAllowedForItems.map(function (sElement) {
					return new CustomListItem({
						content: [
							new Text({
								text: sElement
							}).addStyleClass("sapUiTinyMargin")
						]
					});
				}), oPopover = this._addPopoverContent(aPopoverContent);

				oPopover.openBy(oEvent.getSource());
			},

			_addPopoverContent: function (aContent) {
				var oPopover = this._getPopover();

				if (oPopover.getContent().length > 0) {
					oPopover.destroyContent(); // destroy the old content, before adding the new one
				}

				if (aContent && aContent.length > 0) {
					var oList = new List({
						items: aContent || []
					});

					oPopover.addContent(oList);
				}

				return oPopover;
			},

			_getPopover: function () {
				if (!this._oPopover) {
					this._oPopover = new Popover({
						placement: "Bottom",
						showHeader: false
					});
				}

				return this._oPopover;
			},

			/**
			 * Handles the typedef toggle event
			 * @param {sap.ui.base.Event} oEvent The event object
			 */
			onTypedefToggle: function(oEvent) {
				var oRow = oEvent.getSource(),
					oLightTable = this._findParentLightTable(oRow),
					sTypedefName = oRow?.getTypedefName();

				if (!sTypedefName || !oLightTable) {
					return;
				}

				if (oRow.getExpanded()) {
					oRow.setExpanded(false);

					oLightTable.invalidate();
					this._applyHljsToLightTable(oLightTable);

					return;
				}

				if (oRow.getSubRows().length > 0) {
					// Already loaded typedef properties, just expand
					oRow.setExpanded(true);

					oLightTable.invalidate();
					this._applyHljsToLightTable(oLightTable);

					return;
				}

				// Find the typedef entity in the API index first
				var oTypedefInfo = this._findTypedefInApiIndex(sTypedefName);

				if (oTypedefInfo) {
					// Fetch complete typedef data from API.json
					this._loadCompleteTypedefData(oTypedefInfo)
						.then(function(oFullTypedefData) {
							// Extract properties from the typedef entity
							var aTypedefProperties = this._extractTypedefProperties(oFullTypedefData);

							// Add Row controls to the LightTable for each typedef property
							if (aTypedefProperties && aTypedefProperties.length > 0) {
								this._addTypedefSubRows(oRow, aTypedefProperties);

								oRow.setExpanded(true);
								oLightTable.invalidate();
								this._applyHljsToLightTable(oLightTable);
							}
						}.bind(this))
						.catch(function(oError) {
							// Handle error silently
							Log.error("Error loading typedef data: " + oError);
						});
				}
			},

			/**
			 * Extracts properties from typedef data
			 * @param {object} oTypedefData The typedef data
			 * @returns {array} Array of typedef properties
			 * @private
			 */
			_extractTypedefProperties: function(oTypedefData) {
				var aProperties = [];

				if (oTypedefData && oTypedefData.properties) {
					aProperties = oTypedefData.properties.map(function(oProperty) {
						// Clone the property to avoid modifying the original
						var oClone = jQuery.extend(true, {}, oProperty);
						// Add depth property
						oClone.depth = 1;
						return oClone;
					});
				}

				return aProperties;
			},

			/**
			 * Adds Row controls to the LightTable for typedef properties
			 * @param {sap.ui.documentation.Row} oParentRow The parent row being expanded
			 * @param {array} aTypedefProperties Array of typedef properties to add as rows
			 * @private
			 */
			_addTypedefSubRows: function(oParentRow, aTypedefProperties) {
				// Create sub-row controls for typedef properties
				var aSubRows = aTypedefProperties.map(function(oProperty) {
					return new Row({
						content: [
							new ParamText({
								text: oProperty.name,
								phoneText: oProperty.phoneName,
								depth: oProperty.depth || 1,
								optional: oProperty.optional
							}),
							new JSDocType({
								typeInfo: oProperty.typeInfo
							}),
							new Text({
								text: oProperty.defaultValue || "",
								wrapping: false
							}),
							new JSDocText({
								sanitizeContent: false,
								text: this.formatter.escapeSettingsValue(oProperty.description)
							})
						]
					}).addStyleClass("subrow");
				}.bind(this));

				// Add sub-rows to the parent row
				aSubRows.forEach(function(oSubRow) {
					oParentRow.addSubRow(oSubRow);
				});
			},

			/**
			 * Finds the parent LightTable control of a given control
			 * @param {sap.ui.core.Control} oControl - The control to find the parent LightTable for
			 * @returns {sap.ui.documentation.LightTable|null} The parent LightTable control or null if not found
			 * @private
			 */
			_findParentLightTable: function(oControl) {
				var oParent = oControl?.getParent();

				while (oParent) {
					if (oParent.isA("sap.ui.documentation.LightTable")) {
						return oParent;
					}
					oParent = oParent.getParent();
				}

				return null;
			},

			/**
			 * Finds a typedef entity in the API index
			 * @param {string} sTypedefName The name of the typedef to find
			 * @returns {object} The typedef entity data or null if not found
			 * @private
			 */
			_findTypedefInApiIndex: function(sTypedefName) {
				var oTypedefData = null;

				// Recursive function to find the typedef in the API index
				function findSymbol(aNodes) {
					if (!aNodes) {
						return false;
					}

					return aNodes.some(function(oNode) {
						var bFound = oNode.name === sTypedefName;
						if (bFound) {
							oTypedefData = oNode;
							return true;
						} else if (oNode.nodes && sTypedefName.startsWith(oNode.name + ".")) {
							return findSymbol(oNode.nodes);
						}
						return false;
					});
				}

				// Search in the API index
				if (this._aApiIndex) {
					findSymbol(this._aApiIndex);
				}

				return oTypedefData;
			},

			/**
			 * Loads complete typedef data from API.json files
			 * @param {object} oTypedefInfo Initial typedef info from API index
			 * @returns {Promise} Promise that resolves with the complete typedef data
			 * @private
			 */
			_loadCompleteTypedefData: function(oTypedefInfo) {
				// Get the library name from the typedef info
				var sLibName = oTypedefInfo.lib;

				if (!sLibName) {
					return Promise.reject("Library name not found for typedef");
				}

				// Use APIInfo to load the library's API.json data
				return APIInfo.getLibraryElementsJSONPromise(sLibName)
					.then(function(aLibData) {
						try {
							// Find the complete typedef data in the library elements
							var oTypedefData = this._findEntityInLibraryData(aLibData, oTypedefInfo.name);

							if (oTypedefData) {
								return oTypedefData;
							} else {
								return Promise.reject("Typedef not found in library data");
							}
						} catch (oProcessError) {
							return Promise.reject("Error processing typedef data: " + oProcessError);
						}
					}.bind(this))
					.catch(function(oError) {
						return Promise.reject("Error loading library data: " + oError);
					});
			},

			/**
			 * Finds an entity in library data loaded from API.json
			 * @param {array} aLibraryData Array of library elements from API.json
			 * @param {string} sEntityName Name of the entity to find
			 * @returns {object} The entity data or null if not found
			 * @private
			 */
			_findEntityInLibraryData: function(aLibraryData, sEntityName) {
				// Find entity in loaded libs data
				for (var i = 0, iLen = aLibraryData.length; i < iLen; i++) {
					var oLibItem = aLibraryData[i];
					if (oLibItem.name === sEntityName) {
						// Check if we are allowed to display the requested symbol
						// BCP: 1870269087 item may not have visibility info at all. In this case we show the item
						if (oLibItem.visibility === undefined || this._aAllowedMembers.indexOf(oLibItem.visibility) >= 0) {
							return oLibItem;
						} else {
							return null;
						}
					}
				}
				return null;
			},

			/**
			 * Builds the header layout structure.
			 * The header displays the entity data in 3 columns
			 * and each column can consist of 3 key-value pairs at most.
			 * @param {object} oControlData main control data object source
			 * @param {object} oEntityData additional data object source
			 */
			_buildHeaderLayout: function (oControlData, oEntityData) {
				var FIRST_COLUMN = 0,
					SECOND_COLUMN = 1,
					THIRD_COLUMN = 2,
					ENTITIES_PER_COLUMN = 3,
					aHeaderControls = [[], [], []],
					oHeaderLayoutUtil = this._getHeaderLayoutUtil(),
					aSubClasses = oEntityData.extendedBy || oEntityData.implementedBy || [],
					bIsOpenUI5 = this.getModel("versionData").getProperty("/isOpenUI5"),
					bIsPureNamespace = oControlData.kind === "namespace" && oControlData.module === this.NOT_AVAILABLE,
					aHeaderBlocksInfo = [
						{creator: "_getControlSampleBlock", exists: oControlData.isClass || oControlData.isNamespace},
						{creator: "_getDocumentationBlock", exists: oControlData.docuLink !== undefined},
						{creator: "_getControlGithub", exists: bIsOpenUI5 && oControlData.resource && oEntityData.lib},
						{creator: "_getUXGuidelinesBlock", exists: oControlData.uxGuidelinesLink !== undefined},
						{creator: "_getExtendsBlock", exists: oControlData.isClass || oControlData.isTypedef && oControlData.isDerived},
						{creator: "_getSubclassesBlock", exists: aSubClasses.length > 0},
						{creator: "_getImplementsBlock", exists: oControlData.hasImplementsData},
						{creator: "_getModuleBlock", exists: !bIsPureNamespace},
						{creator: "_getLibraryBlock", exists: oControlData.kind === "namespace" && oEntityData.lib},
						{creator: "_getVisibilityBlock", exists: oControlData.visibility},
						{creator: "_getAvailableSinceBlock", exists: !bIsPureNamespace},
						{creator: "_getApplicationComponentBlock", exists: true}
					],
					fnFillHeaderControlsStructure = function () {
						var iControlsAdded = 0,
							iIndexToAdd,
							fnGetIndexToAdd = function (iControlsAdded) {
								// determines the column(1st, 2nd or 3rd), the next entity data key-value should be added to.
								if (iControlsAdded <= ENTITIES_PER_COLUMN) {
									return FIRST_COLUMN;
								} else if (iControlsAdded <= ENTITIES_PER_COLUMN * 2) {
									return SECOND_COLUMN;
								}
								return THIRD_COLUMN;
							};

						aHeaderBlocksInfo.forEach(function (oHeaderBlockInfo) {
							var oControlBlock;
							if (oHeaderBlockInfo.exists) {
								oControlBlock = oHeaderLayoutUtil[oHeaderBlockInfo.creator].call(this, oControlData, oEntityData);
								iIndexToAdd = fnGetIndexToAdd(++iControlsAdded);
								aHeaderControls[iIndexToAdd].push(oControlBlock);
							}
						}, this);
					}.bind(this);

				// Creates the entity key-value controls
				// based on the existing entity key-value data,
				fnFillHeaderControlsStructure();

				// Wraps each column in a <code>sap.ui.layout.VerticalLayout</code>.
				aHeaderControls.forEach(function (aHeaderColumn, iIndex) {
					var oVL = this.byId("headerColumn" + iIndex);
					oVL.removeAllContent();

					if (aHeaderColumn.length > 0) {
						oVL.setVisible(true);
						aHeaderColumn.forEach(oVL.addContent, oVL);
					}
				}, this);
			},

			/**
			 * Creates and adds a dynamic section to the ObjectPageLayout
			 * @param {object} oSectionConfig Section configuration object
			 * @private
			 */
			_createAndAddSection: function(oSectionConfig) {
				var fnCreateSubSection = function(sProperty, sTitle) {
					var oHTML = new HTML({content: "{/" + sProperty + "}"});
					oHTML.setModel(this._oModel);
					return new ObjectPageSubSection(sTitle ? {title: sTitle, blocks: [oHTML]} : {blocks: [oHTML]});
				}.bind(this);

				var aSubSections = [];
				if (oSectionConfig.hasSubsections) {
					aSubSections.push(fnCreateSubSection(oSectionConfig.type + "_mainContent", "Overview"));
					oSectionConfig.subsections.forEach(function(sub) {
						aSubSections.push(fnCreateSubSection(oSectionConfig.type + "_" + sub + "Content", sub));
					});
				} else {
					aSubSections.push(fnCreateSubSection(oSectionConfig.property));
				}

				var oPageSection = new ObjectPageSection({
					id: this.createId(oSectionConfig.sectionId),
					title: oSectionConfig.displayTitle,
					titleUppercase: false,
					subSections: aSubSections
				});
				oPageSection.addStyleClass("sectionContent");
				this._objectPage.addSection(oPageSection);
			},
			onAnnotationsLinkPress: function () {
				this.scrollToEntity("annotations", "Summary");
			},

			backToSearch: function () {
				this.onNavBack();
			}
		});
	}
);