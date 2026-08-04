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
	"sap/base/util/fetch",
	"sap/base/util/syncFetch",
	"sap/base/util/isPlainObject",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeHelper"
],
	function(ResourceBundle, Log, fetch, syncFetch, isPlainObject, Theming, ThemeHelper) {
		"use strict";

		const SAP_ICON_FONT_FAMILY = 'SAP-icons';

		const IconFontStrategy = {
			TYPE: 'FONT',
			SAP_ICON_FONT_FAMILY: SAP_ICON_FONT_FAMILY
		};

		// helper
		function makeChar(code) {
			return String.fromCharCode(typeof code === 'number' ? code : parseInt(code, 16));
		}

		// =========================================================================
		// The following functions are used in _IconRegistry.js to manage SVG icon
		// collections and their icons.
		// =========================================================================

		/**
		 * Creates a FONT icon info object and stores it in the registry.
		 *
		 * @param {string} iconName the icon name
		 * @param {string|undefined} collectionName the collection name, or undefined for built-in
		 * @param {object|string} iconInfo the icon configuration object, or a font family string (legacy API)
		 * @param {object} mRegistry the icon registry map
		 * @return {object|undefined} the created icon info object, or undefined if creation was skipped
		 */
		IconFontStrategy.addIcon = function(iconName, collectionName, iconInfo, mRegistry) {
			const collection = mRegistry[collectionName];
			let icon = collection[iconName];
			let sContent, sText, sKey;

			if (icon) {
				if (collectionName === undefined) {
					Log.error("Icon with name '" + iconName + "' belongs to the built-in SAP-icons collection which is now SVG-based; font icons cannot be added there.");
					return undefined;
				} else if (!iconInfo.overWrite) {
					Log.warning("Icon with name '" + iconName + "' in collection '" + collectionName + "' already exists. Specify 'iconInfo.overWrite' in order to overwrite.", "sap.ui.core.IconPool");
					return undefined;
				}
			}

			if (Array.isArray(iconInfo.content)) {
				sContent = iconInfo.content.map(makeChar).join('');
			} else {
				sContent = makeChar(iconInfo.content);
			}

			if (iconInfo.resourceBundle instanceof ResourceBundle) {
				sKey = "Icon." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					sText = iconInfo.resourceBundle.getText(sKey);
				}
			}

			icon = collection[iconName] = {
				name: iconName,
				collection: collectionName,
				type: IconFontStrategy.TYPE,
				uri: "sap-icon://" + (collectionName ? collectionName + "/" : "") + iconName,
				fontFamily: iconInfo.fontFamily,
				content: sContent,
				text: sText || '',
				suppressMirroring: iconInfo.suppressMirroring,
				skipMirroring: iconInfo.suppressMirroring
			};

			return icon;
		};

		/**
		 * Handles theme change for the font-face of a collection.
		 *
		 * Works for both pure FONT collections (reads from <code>oCollection.config</code>
		 * and <code>oCollection.themeConfig</code>) and dual-registered SVG+font collections
		 * (reads from <code>oCollection.fontConfig</code>).
		 *
		 * @param {string} collectionName the collection name
		 * @param {object} oCollection the collection registry entry
		 * @param {object} mCollectionRegistry the collection registry
		 * @param {function} [fnConvertUrl] optional URL converter (AppCacheBuster)
		 */
		IconFontStrategy.onThemeApplied = function(collectionName, oCollection, mCollectionRegistry, fnConvertUrl) {
			// For dual-registered SVG collections, font data lives under fontConfig
			const oFontConfig = oCollection.type === IconFontStrategy.TYPE
				? oCollection.config
				: oCollection.fontConfig;

			if (!oFontConfig) {
				return;
			}

			const oThemeConfig = oCollection.type === IconFontStrategy.TYPE
				? oCollection.themeConfig
				: oFontConfig.themeConfig;

			if (!oThemeConfig) {
				return;
			}

			const sFontURI = IconFontStrategy.resolveThemeUri(oThemeConfig) || oFontConfig.fontURI;
			IconFontStrategy.insertFontFaceStyle(oFontConfig.fontFamily, sFontURI, collectionName, mCollectionRegistry, fnConvertUrl);
		};

		/**
		 * Registers a font icon collection.
		 *
		 * Handles validation, dual registration with existing SVG collections,
		 * and triggers font metadata loading unless lazy mode is configured.
		 *
		 * @param {object} oConfig the font configuration
		 * @param {object} mCollectionRegistry the collection registry
		 * @param {object} mRegistry the icon registry
		 * @param {function} [fnConvertUrl] optional URL converter (AppCacheBuster)
		 */
		IconFontStrategy.register = function(oConfig, mCollectionRegistry, mRegistry, fnConvertUrl) {
			oConfig.collectionName = oConfig.collectionName || oConfig.fontFamily;

			// check for mandatory fontURI parameter
			if (!oConfig.fontURI) {
				Log.error("The configuration parameter fontURI is missing, cannot register the font '" + oConfig.collectionName + "'!");
				return;
			}

			// protect the default font family
			if (oConfig.fontFamily === SAP_ICON_FONT_FAMILY) {
				Log.error("The font family " + SAP_ICON_FONT_FAMILY + " is already registered");
				return;
			}

			// add trailing slash if necessary for more convenience
			if (oConfig.fontURI.substr(oConfig.fontURI.length - 1) !== "/") {
				oConfig.fontURI += "/";
			}

			// create an initial configuration for the font
			if (!mCollectionRegistry[oConfig.collectionName] || mCollectionRegistry[oConfig.collectionName].metadataLoaded === false) {
				mCollectionRegistry[oConfig.collectionName] = {
					config: oConfig,
					type: IconFontStrategy.TYPE
				};
			} else if (mCollectionRegistry[oConfig.collectionName].type !== IconFontStrategy.TYPE) {
				// SVG already registered — store font data alongside for backward compat
				mCollectionRegistry[oConfig.collectionName].fontConfig = {
					fontFamily: oConfig.fontFamily,
					fontURI: oConfig.fontURI,
					metadataURI: oConfig.metadataURI
				};
			} else {
				Log.warning("The font '" + oConfig.collectionName + "' is already registered");
				return;
			}

			// load font metadata immediately
			if (!oConfig.lazy) {
				IconFontStrategy.loadMetadata(oConfig.collectionName, true, mCollectionRegistry, mRegistry, fnConvertUrl);
			}
		};

		/**
		 * Deregisters a font collection, removing its FontFace from document.fonts.
		 * Intended for test isolation only.
		 *
		 * @param {string} sCollectionName the collection name
		 * @param {object} mCollectionRegistry the collection registry
		 * @private
		 */
		IconFontStrategy._deregister = function(sCollectionName, mCollectionRegistry) {
			const oCollection = mCollectionRegistry[sCollectionName];
			if (!oCollection) {
				return;
			}

			// For dual-registered SVG collections, font data lives under fontConfig
			const oFontData = oCollection.type === IconFontStrategy.TYPE
				? oCollection
				: oCollection.fontConfig;

			if (oFontData?.fontFace) {
				document.fonts.forEach(function(oFontFace) {
					if (oFontFace.family === oFontData.fontFace) {
						document.fonts.delete(oFontFace);
					}
				});
				delete oFontData.fontFace;
				delete oFontData.currentFontURI;
			}
		};

		// =========================================================================
		// The following functions are used internally in this module or in the tests
		// =========================================================================

		/**
		 * Resolves the theme-dependent font URI.
		 *
		 * @param {object} oConfig the theme config object (with "path" map of regex → module path)
		 * @return {string|undefined} resolved font URI or undefined
		 */
		IconFontStrategy.resolveThemeUri = function(oConfig) {
			if (!isPlainObject(oConfig)) {
				return undefined;
			}

			const mPath = oConfig["path"];
			const aThemes = [Theming.getTheme()];

			const sParentTheme = ThemeHelper.getMetadata("sap-ui-core")?.Extends?.[0];
			if (sParentTheme) {
				aThemes.push(sParentTheme);
			}

			for (const sTheme of aThemes) {
				for (const sPattern in mPath) {
					const rTheme = new RegExp(sPattern);
					if (rTheme.test(sTheme)) {
						let fontURI = mPath[sPattern];
						if (fontURI.charAt(fontURI.length - 1) !== "/") {
							fontURI += "/";
						}
						return sap.ui.require.toUrl(fontURI);
					}
				}
			}

			return undefined;
		};

		/**
		 * Inserts a font-face style for the given font.
		 *
		 * @param {string} sFontFace the font face name
		 * @param {string} sPath the path to the font files
		 * @param {string} sCollectionName the collection name
		 * @param {object} mCollectionRegistry the collection registry
		 * @param {function} [fnConvertUrl] optional URL converter (AppCacheBuster)
		 */
		IconFontStrategy.insertFontFaceStyle = function(sFontFace, sPath, sCollectionName, mCollectionRegistry, fnConvertUrl) {
			function convertUrl(sUrl) {
				return fnConvertUrl ? fnConvertUrl(sUrl) : sUrl;
			}

			if (!sFontFace || sFontFace === SAP_ICON_FONT_FAMILY) {
				Log.info("It's not needed to call IconPool.insertFontFaceStyle to insert font-face for the predefined icon font SAP-icons because the font-face is included in the library.css of sap.ui.core");
				return;
			}

			if (sPath === undefined) {
				Log.error("IconPool.insertFontFaceStyle must be called with at least two parameters!");
				return;
			}

			if (sCollectionName === undefined) {
				sCollectionName = sFontFace;
			}

			if (!mCollectionRegistry[sCollectionName]) {
				Log.error("Icon font '" + sCollectionName + "' has not been registered yet.");
				return;
			}

			// Allow both pure FONT collections and dual-registered SVG collections with fontConfig
			if (mCollectionRegistry[sCollectionName].type !== IconFontStrategy.TYPE
				&& !mCollectionRegistry[sCollectionName].fontConfig) {
				Log.error("Icon font '" + sCollectionName + "' has not been registered as a font.");
				return;
			}

			// For dual-registered collections, read/write font URI state from fontConfig
			const oFontData = mCollectionRegistry[sCollectionName].type === IconFontStrategy.TYPE
				? mCollectionRegistry[sCollectionName]
				: mCollectionRegistry[sCollectionName].fontConfig;

			if (sPath == oFontData.currentFontURI) {
				Log.info("The font face style of icon font '" + sCollectionName + "' was already inserted.");
				return;
			}

			oFontData.currentFontURI = sPath;

			const oFontFace = new FontFace(sFontFace,
				"url(" + convertUrl(sPath + sFontFace + ".woff2") + ") format('woff2')," +
				"local(" + sFontFace + ")",
				{
					weight: "normal",
					style: "normal"
				}
			);

			document.fonts.add(oFontFace);
			oFontFace.load();

			oFontData.fontFace = sFontFace;
		};

		/**
		 * Loads the font metadata for the given collection.
		 *
		 * @param {string} collectionName the font collection name
		 * @param {boolean} async whether the metadata is loaded async or sync
		 * @param {object} mCollectionRegistry the collection registry
		 * @param {object} mRegistry the icon registry
		 * @param {function} [fnConvertUrl] optional URL converter
		 * @return {Promise<undefined>|undefined} a Promise if async, otherwise undefined
		 */
		IconFontStrategy.loadMetadata = function(collectionName, async, mCollectionRegistry, mRegistry, fnConvertUrl) {
			const bIsSVGCollection = mCollectionRegistry[collectionName]?.type === 'SVG';

			// Resolve the two key references once:
			// - oConfig: where font settings live (fontFamily, fontURI, metadataURI, metadata)
			// - oState: where loading state lives (metadataLoaded, abortController)
			// For pure FONT collections both point into mCollectionRegistry[collectionName].
			// For dual-registered SVG collections both point into fontConfig.
			let oConfig, oState;

			if (mCollectionRegistry[collectionName]) {
				if (bIsSVGCollection) {
					oConfig = mCollectionRegistry[collectionName].fontConfig;
					if (!oConfig) {
						return undefined;
					}
					oState = oConfig;
				} else {
					oConfig = mCollectionRegistry[collectionName].config;
					oState = mCollectionRegistry[collectionName];
				}

				if (typeof oState.metadataLoaded === "boolean") {
					return undefined;
				}
				if (async && oState.metadataLoaded instanceof Promise) {
					return oState.metadataLoaded;
				}
			} else {
				if (!mRegistry[collectionName]) {
					Log.error("The font configuration for collection '" + collectionName + "' is not registered");
				}
				mCollectionRegistry[collectionName] = {
					metadataLoaded: false
				};
			}

			function loadFont(oFontMetadata) {
				let mIcons = oFontMetadata;
				let sFontURI = oConfig.fontURI;

				if (oFontMetadata?.config && isPlainObject(oFontMetadata.config)) {
					// Store themeConfig: on fontConfig for dual-registered, on collection entry for pure font
					if (bIsSVGCollection) {
						oConfig.themeConfig = oFontMetadata.config;
					} else {
						mCollectionRegistry[collectionName].themeConfig = oFontMetadata.config;
					}
					sFontURI = IconFontStrategy.resolveThemeUri(oFontMetadata.config) || oConfig.fontURI;
					mIcons = oFontMetadata.icons;

					if (!isPlainObject(mIcons)) {
						Log.error("There is something wrong with the structure of the font metadata loaded from " + sFontURI + ".");
					}
				}

				for (const sKey in mIcons) {
					mIcons[sKey] = parseInt(mIcons[sKey], 16);
				}

				if (bIsSVGCollection) {
					// Merge char codes — don't overwrite SVG icon info objects already in mRegistry
					if (!mRegistry[collectionName]) {
						mRegistry[collectionName] = {};
					}
					for (const sKey in mIcons) {
						if (mRegistry[collectionName][sKey] === undefined) {
							mRegistry[collectionName][sKey] = mIcons[sKey];
						}
					}
				} else {
					mRegistry[collectionName] = mIcons;
				}

				IconFontStrategy.insertFontFaceStyle(oConfig.fontFamily, sFontURI, collectionName, mCollectionRegistry, fnConvertUrl);
				oState.metadataLoaded = true;
			}

			const fnErrorCallback = function() {
				Log.error("An error occurred loading the font metadata for collection '" + collectionName + "'");
				oState.metadataLoaded = false;
			};

			if (oConfig) {
				if (oConfig.metadataURI === undefined) {
					oConfig.metadataURI = oConfig.fontURI + oConfig.fontFamily + ".json";
				}
				if (async && !oConfig.metadata) {
					if (oState.metadataLoaded instanceof Promise) {
						return oState.metadataLoaded;
					}
					// For SVG collections, always load font metadata even if mRegistry has data
					if (mRegistry[collectionName] === undefined || bIsSVGCollection) {
						const oAbortController = new AbortController();
						oState.abortController = oAbortController;

						oState.metadataLoaded = fetch(oConfig.metadataURI, {
							headers: {
								Accept: fetch.ContentTypes.JSON
							},
							signal: oAbortController.signal
						}).then(function(response) {
							if (response.ok) {
								return response.json().then(function(oJSON) {
									loadFont(oJSON);
									delete oState.abortController;
								});
							}
							throw new Error();
						}).catch(function(error) {
							if (error.name !== "AbortError") {
								fnErrorCallback();
							}
						});
					}
					return oState.metadataLoaded;
				}

				/**
				 * @deprecated As of Version 1.120
				 */
				if (!(async && !oConfig.metadata) && oConfig.metadataURI) {
					if (oState.abortController) {
						oState.abortController.abort("Replaced by sync request");
						oState.abortController = null;
					}
					Log.warning("Synchronous loading of font meta data in IconPool, due to .getIconInfo() call" +
						" for '" + collectionName + "'. Use loading mode 'async' to avoid this call.", "SyncXHR", null, function() {
						return {
							type: "SyncXHR",
							name: "IconPool"
						};
					});

					try {
						const response = syncFetch(oConfig.metadataURI, {
							headers: {
								Accept: syncFetch.ContentTypes.JSON
							}
						});

						if (response.ok) {
							const oJSON = response.json();
							loadFont(oJSON);
						} else {
							fnErrorCallback();
						}
					} catch (error) {
						fnErrorCallback();
					}
					return undefined;
				}

				loadFont(oConfig.metadata);
			}

			return undefined;
		};

		return IconFontStrategy;
	});
