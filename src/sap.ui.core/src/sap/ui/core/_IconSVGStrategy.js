/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the UI5 core library must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/i18n/ResourceBundle",
	"sap/base/Log",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeHelper",
	"sap/ui/dom/includeStylesheet"
],
	function(ResourceBundle, Log, Theming, ThemeHelper, includeStylesheet) {
		"use strict";

		/**
		 * Map of loaded SVG CSS stylesheets.
		 * Key: collection name (or "undefined" for built-in), Value: true or pending Promise.
		 * @private
		 */
		const oLoadedStylesheets = Object.create(null);

		/**
		 * Builds the CSS custom property prefix for a given collection prefix.
		 * Example: "sapIcons" → "--sapIcons_"
		 *
		 * @param {string} sCssVarPrefix the collection's CSS variable prefix
		 * @return {string} the CSS custom property prefix
		 */
		function getCSSVarPrefix(sCssVarPrefix) {
			return "--" + sCssVarPrefix + "_";
		}

		function makeChar(code) {
			return String.fromCharCode(typeof code === 'number' ? code : parseInt(code, 16));
		}

		const IconSVGStrategy = {
			TYPE: 'SVG'
		};

		// =========================================================================
		// The following functions are used in _IconRegistry.js to manage SVG icon
		// collections and their icons.
		// =========================================================================

		/**
		 * Creates an SVG icon info object and stores it in the registry.
		 *
		 * @param {string} iconName the icon name
		 * @param {string|undefined} collectionName the collection name, or undefined for built-in
		 * @param {object} iconInfo the icon configuration object
		 * @param {object} mRegistry the icon registry map
		 * @return {object|undefined} the created icon info object, or undefined if creation was skipped
		 */
		IconSVGStrategy.addIcon = function(iconName, collectionName, iconInfo, mRegistry) {
			const collection = mRegistry[collectionName];
			let icon = collection[iconName];

			if (icon && typeof icon === 'object') {
				if (collectionName === undefined) {
					Log.warning("Icon with name '" + iconName + "' in built-in collection already exists and can not be overwritten.", "sap.ui.core.IconPool");
					return undefined;
				} else if (!iconInfo.overWrite) {
					Log.warning("Icon with name '" + iconName + "' in collection '" + collectionName + "' already exists. Specify 'iconInfo.overWrite' in order to overwrite.", "sap.ui.core.IconPool");
					return undefined;
				}
			}

			let sText;
			if (iconInfo.resourceBundle instanceof ResourceBundle) {
				const sKey = "Icon." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					sText = iconInfo.resourceBundle.getText(sKey);
				}
			}

			icon = collection[iconName] = {
				name: iconName,
				collection: collectionName,
				type: IconSVGStrategy.TYPE,
				uri: "sap-icon://" + (collectionName ? collectionName + "/" : "") + iconName,
				text: sText || '',
				suppressMirroring: !!iconInfo.suppressMirroring,
				id: iconInfo.id,
				cssVarPrefix: iconInfo.cssVarPrefix,
				// Font compat (optional — present when font char code data is available)
				fontFamily: iconInfo.fontFamily || undefined,
				content: iconInfo.content != null ? makeChar(iconInfo.content) : undefined,
				skipMirroring: !!iconInfo.suppressMirroring
			};

			return icon;
		};

		/**
		 * Handles theme change for an external SVG collection.
		 * Swaps the stylesheet if the theme maps to a different svg.css URI.
		 *
		 * @param {string} collectionName the collection name
		 * @param {object} oCollection the collection registry entry
		 * @param {object} mCollectionRegistry the collection registry
		 */
		IconSVGStrategy.onThemeApplied = function(collectionName, oCollection, mCollectionRegistry) {
			const oThemeConfig = oCollection.themeConfig;
			if (!oThemeConfig) {
				return;
			}

			const sNewCssUri = IconSVGStrategy.resolveThemeUri(
				oThemeConfig, oCollection.config.uri
			);
			const sNewPath = sNewCssUri.substring(0, sNewCssUri.lastIndexOf("/") + 1);

			if (!sNewPath || sNewPath === oCollection.currentSVGPath) {
				return;
			}
			oCollection.currentSVGPath = sNewPath;

			// Clear cached state so loadStylesheet re-loads via includeStylesheet
			// (includeStylesheet replaces the existing <link> with the same id automatically)
			const sCollKey = String(collectionName);
			delete oLoadedStylesheets[sCollKey];

			const sCssVarPrefix = oCollection.config.cssVarPrefix || collectionName;
			// Reset icon names so extractIconNames re-reads from the new stylesheet
			oCollection.config.iconNames = [];
			oCollection.config.iconNamesSet = new Set();
			IconSVGStrategy.loadStylesheet(sNewCssUri, collectionName).then(function() {
				IconSVGStrategy.extractIconNames(collectionName, sCssVarPrefix, mCollectionRegistry);
			}).catch(function(err) {
				Log.error("Failed to load SVG stylesheet for collection '" + collectionName + "': " + err.message, "sap.ui.core.IconPool");
			});
		};

		/**
		 * Handles theme change for the built-in SAP-icons collection.
		 * Loads fallback stylesheet if needed, and re-extracts icon
		 * names from the current theme's CSS custom properties.
		 *
		 * @param {object} mCollectionRegistry the collection registry
		 */
		IconSVGStrategy.onThemeAppliedBuiltIn = function(mCollectionRegistry) {
			// Remove previous fallback stylesheet (theme may have changed)
			IconSVGStrategy._removeFallbackStylesheet();

			// Reset icon names for re-extraction
			const oBuiltIn = mCollectionRegistry[undefined];
			if (oBuiltIn && oBuiltIn.config) {
				oBuiltIn.config.iconNames = [];
				oBuiltIn.config.iconNamesSet = new Set();
			}

			IconSVGStrategy.extractIconNames(undefined, "sapIcons", mCollectionRegistry);

			if (oBuiltIn.config.iconNames.length === 0) {
				// Old custom theme without SVG icon CSS vars — load fallback svg.css,
				// then extract names once the stylesheet is applied
				IconSVGStrategy._loadFallbackStylesheet().then(function() {
					IconSVGStrategy.extractIconNames(undefined, "sapIcons", mCollectionRegistry);
				}).catch(function(err) {
					Log.error("Failed to load fallback SVG stylesheet: " + err.message, "sap.ui.core.IconPool");
				});
			}
		};

		/**
		 * Registers a custom SVG icon collection.
		 *
		 * @param {object} oConfig configuration object
		 * @param {object} mCollectionRegistry the collection registry
		 * @param {object} mRegistry the icon registry
		 * @return {Promise} resolves when the stylesheet is loaded
		 */
		IconSVGStrategy.register = function(oConfig, mCollectionRegistry, mRegistry) {
			const sName = oConfig.name;
			const sDefaultUri = oConfig.uri;
			const sCssVarPrefix = oConfig.cssVarPrefix || sName;

			// Preserve font registration data if the collection was previously registered
			// as a font (dual registration: registerFont + registerSVG)
			const oExisting = mCollectionRegistry[sName];
			let oFontConfig;
			if (oExisting && oExisting.type !== IconSVGStrategy.TYPE) {
				oFontConfig = {
					fontFamily: oExisting.config?.fontFamily,
					fontURI: oExisting.config?.fontURI,
					metadataURI: oExisting.config?.metadataURI,
					themeConfig: oExisting.themeConfig,
					currentFontURI: oExisting.currentFontURI,
					fontFace: oExisting.fontFace
				};
			} else if (oExisting) {
				Log.warning("SVG collection '" + sName + "' is already registered, overwriting.");
			}

			const sUri = IconSVGStrategy.resolveThemeUri(oConfig.themeConfig, sDefaultUri);

			mCollectionRegistry[sName] = {
				config: {
					cssVarPrefix: sCssVarPrefix,
					uri: sDefaultUri,
					iconNames: []
				},
				themeConfig: oConfig.themeConfig || undefined,
				currentSVGPath: sUri.substring(0, sUri.lastIndexOf("/") + 1),
				type: IconSVGStrategy.TYPE,
				metadataLoaded: true
			};

			if (oFontConfig) {
				mCollectionRegistry[sName].fontConfig = oFontConfig;
			}

			if (oConfig.deprecatedNames) {
				mCollectionRegistry[sName].deprecatedNames = new Set(oConfig.deprecatedNames);
			}

			if (!mRegistry[sName]) {
				mRegistry[sName] = {};
			}

			const pReady = IconSVGStrategy.loadStylesheet(sUri, sName).then(function() {
				IconSVGStrategy.extractIconNames(sName, sCssVarPrefix, mCollectionRegistry);
			}).catch(function(err) {
				Log.error("Failed to load SVG stylesheet for collection '" + sName + "': " + err.message, "sap.ui.core.IconPool");
			});

			mCollectionRegistry[sName].ready = pReady;
			return pReady;
		};

		/**
		 * Deregisters an SVG collection, cleaning up all internal state.
		 * Intended for test isolation only.
		 *
		 * @param {string} sCollectionName the collection name
		 */
		IconSVGStrategy._deregister = function(sCollectionName) {
			const sKey = String(sCollectionName);

			// Remove stylesheet <link> element
			const oLink = document.getElementById(getLinkId(sKey));
			if (oLink) {
				oLink.parentNode.removeChild(oLink);
			}

			// Clear stylesheet cache
			delete oLoadedStylesheets[sKey];
		};

		// =========================================================================
		// The following functions are used internally in this module or in the tests
		// =========================================================================

		/**
		 * Extracts icon names from CSS custom properties available in the computed style
		 * of the document root element. Filters by the collection's CSS variable prefix.
		 *
		 * The extracted names are stored in the collection's config.iconNames array and
		 * config.iconNamesSet set.
		 *
		 * This approach works regardless of stylesheet origin (no CORS issues) because
		 * getComputedStyle reads the applied/resolved state, not the stylesheet rules.
		 * Names are extracted only once per collection; subsequent calls are no-ops.
		 *
		 * @param {string} sCollectionName the collection name
		 * @param {string} sCssVarPrefix the CSS variable prefix
		 * @param {object} mCollectionRegistry the collection registry
		 */
		IconSVGStrategy.extractIconNames = function(sCollectionName, sCssVarPrefix, mCollectionRegistry) {
			const oCollection = mCollectionRegistry[sCollectionName];
			if (!oCollection || !oCollection.config) {
				return;
			}

			// Only extract once per collection
			if (oCollection.config.iconNames && oCollection.config.iconNames.length > 0) {
				return;
			}

			const sPrefix = getCSSVarPrefix(sCssVarPrefix);
			const oStyle = window.getComputedStyle(document.documentElement);
			if (!oCollection.config.iconNames) {
				oCollection.config.iconNames = [];
			}
			if (!oCollection.config.iconNamesSet) {
				oCollection.config.iconNamesSet = new Set(oCollection.config.iconNames);
			}
			const aNames = oCollection.config.iconNames;
			const oNamesSet = oCollection.config.iconNamesSet;

			for (let i = 0; i < oStyle.length; i++) {
				const sProp = oStyle[i];
				if (sProp.startsWith(sPrefix)) {
					const sIconName = sProp.slice(sPrefix.length);
					if (!oNamesSet.has(sIconName)) {
						oNamesSet.add(sIconName);
						aNames.push(sIconName);
					}
				}
			}
		};

		/**
		 * Returns the CSS custom property name for a given icon info.
		 *
		 * @param {object} oIconInfo the icon info object
		 * @return {string} CSS custom property name, e.g. "--sapIcons_accept"
		 */
		IconSVGStrategy.getCSSVarName = function(oIconInfo) {
			return getCSSVarPrefix(oIconInfo.cssVarPrefix) + oIconInfo.name;
		};

		/**
		 * Returns the link element ID for a given collection.
		 * @param {string} sKey stringified collection name
		 * @return {string} the link element ID
		 */
		function getLinkId(sKey) {
			return "sap-ui-icon-svg-" + sKey;
		}

		/**
		 * Loads the SVG CSS stylesheet for a given collection.
		 *
		 * @param {string} sUri URI of the svg.css file
		 * @param {string} [sCollectionName] collection name (undefined for built-in)
		 * @return {Promise} resolves when the stylesheet is loaded
		 */
		IconSVGStrategy.loadStylesheet = function(sUri, sCollectionName) {
			const sKey = String(sCollectionName);
			if (oLoadedStylesheets[sKey]) {
				return typeof oLoadedStylesheets[sKey] === "object"
					? oLoadedStylesheets[sKey]
					: Promise.resolve();
			}

			const oPromise = includeStylesheet({
				url: sUri,
				id: getLinkId(sKey),
				attributes: {
					"data-sap-ui-icon-collection": sKey
				}
			}).then(function() {
				oLoadedStylesheets[sKey] = true;
			}).catch(function() {
				delete oLoadedStylesheets[sKey];
				const sMessage = "Failed to load SVG stylesheet: " + sUri;
				Log.error(sMessage);
				throw new Error(sMessage);
			});

			oLoadedStylesheets[sKey] = oPromise;
			return oPromise;
		};

		/**
		 * Resolves the correct svg.css URI for the current theme.
		 *
		 * @param {object} [mThemeConfig] map of regex → URI
		 * @param {string} sDefaultUri fallback URI
		 * @return {string} resolved URI
		 */
		IconSVGStrategy.resolveThemeUri = function(mThemeConfig, sDefaultUri) {
			if (!mThemeConfig) {
				return sDefaultUri;
			}

			const sTheme = Theming.getTheme();
			const oCustomThemeMetadata = ThemeHelper.getMetadata("sap-ui-core");
			const sParentTheme = oCustomThemeMetadata?.Extends?.[0];
			const aThemes = [sTheme];
			if (sParentTheme) {
				aThemes.push(sParentTheme);
			}

			for (let t = 0; t < aThemes.length; t++) {
				for (const sPattern in mThemeConfig) {
					if (new RegExp(sPattern).test(aThemes[t])) {
						return mThemeConfig[sPattern];
					}
				}
			}

			return sDefaultUri;
		};

		/**
		 * Loads the fallback svg.css from the base theme directory.
		 * Used when the current theme's library.css does not contain SVG icon CSS vars
		 * (old custom themes created before SVG icon support).
		 * The stylesheet is loaded so CSS vars resolve correctly and icon names
		 * can be extracted from the computed style.
		 *
		 * @return {Promise} resolves when the fallback stylesheet is loaded
		 */
		IconSVGStrategy._loadFallbackStylesheet = function() {
			const sSvgCssUrl = sap.ui.require.toUrl("sap/ui/core/themes/base/svg.css");
			return IconSVGStrategy.loadStylesheet(sSvgCssUrl, undefined);
		};

		/**
		 * Removes a previously loaded fallback stylesheet for the built-in collection.
		 * Called on theme change to clean up before re-evaluating whether fallback is needed.
		 */
		IconSVGStrategy._removeFallbackStylesheet = function() {
			const sKey = "undefined";
			const oLink = document.getElementById(getLinkId(sKey));
			if (oLink) {
				oLink.parentNode.removeChild(oLink);
				delete oLoadedStylesheets[sKey];
			}
		};

		return IconSVGStrategy;
	});
