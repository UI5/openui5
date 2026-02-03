/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/Log',
	'sap/ui/base/OwnStatics',
	'sap/ui/core/Theming',
	'sap/ui/core/theming/ThemeManager',
	'sap/ui/util/_URL'
], function(
	Log,
	OwnStatics,
	Theming,
	ThemeManager,
	_URL
) {
	"use strict";

	const { attachChange } = OwnStatics.get(Theming);
	const { getAllLibraryInfoObjects } = OwnStatics.get(ThemeManager);

	/**
	 * A helper used for (read-only) access to CSS parameters at runtime.
	 *
	 * @author SAP SE
	 * @namespace
	 *
	 * @public
	 * @alias sap.ui.core.theming.Parameters
	 */
	const Parameters = {};

	let mParameters = {};
	let sTheme = null;

	const parsedLibraries = new Set();
	const aCallbackRegistry = [];
	const rCssUrl = /url[\s]*\('?"?([^\'")]*)'?"?\)/;


	/**
	 * Resolves relative URLs in parameter values.
	 * Only for inline-parameters.
	 *
	 * Parameters containing CSS URLs will automatically be resolved to the theme-specific location they originate from.
	 *
	 * Example:
	 * A parameter for the "sap_horizon" theme will be resolved to a libraries "[library path...]/themes/sap_horizon" folder.
	 * Relative URLs can resolve backwards, too, so given the sample above, a parameter value of <code>url('../my_logo.jpeg')</code>
	 * will resolve to the "[library path...]/themes" folder.
	 *
	 * @param {string} sUrl the relative URL to resolve
	 * @param {string} sThemeBaseUrl the theme base URL, pointing to the library that contains the parameter
	 * @returns {string} the resolved URL in CSS URL notation
	 */
	function checkAndResolveRelativeUrl(sUrl, sThemeBaseUrl) {
		const aMatch = rCssUrl.exec(sUrl);
		if (aMatch) {
			const oUrl = new _URL(aMatch[1], sThemeBaseUrl);
			if (!oUrl.isAbsolute()) {
				// Rewrite relative URLs based on the theme base url
				const sNormalizedUrl = oUrl.href;
				sUrl = "url('" + sNormalizedUrl + "')";
			}
		}

		return sUrl;
	}

	function mergeParameters(mNewParameters, sThemeBaseUrl) {
		// normalize parameter maps
		// for legacy reasons themes may provide nested objects:
		if (typeof mNewParameters["default"] === "object") {
			mNewParameters = mNewParameters["default"];
		}

		// merge new parameters with existing ones
		for (const sParam in mNewParameters) {
			if (typeof mParameters[sParam] === "undefined") {
				mParameters[sParam] = checkAndResolveRelativeUrl(mNewParameters[sParam], sThemeBaseUrl);
			}
		}
	}

	function processLibraries(callback) {
		const mAllLibraryInfoObjects = getAllLibraryInfoObjects();
		new Set([...mAllLibraryInfoObjects.keys()]).difference(parsedLibraries).forEach((id) => callback(mAllLibraryInfoObjects.get(id)));
	}

	/**
	 * Parses theming parameters from the library.css file for a given library.
	 *
	 * The function attempts to extract and parse inline parameters embedded in the CSS file's
	 * background-image property as a data URI.
	 *
	 * @param {object} libInfo Library info object containing metadata about the library
	 * @param {string} libInfo.id The library identifier (e.g., 'sap.ui.core')
	 * @param {string} libInfo.linkId The ID of the CSS link element
	 * @param {boolean} libInfo.finishedLoading Indicates whether the library CSS has finished loading
	 * @returns {boolean} `true` if parameters were successfully parsed (sync mode) or if the CSS
	 *   is loaded (async mode); `false` otherwise
	 * @private
	 */
	function parseParameters(libInfo) {
		const oUrl = getThemeBaseUrlForId(libInfo);

		// In some browsers (e.g. Safari) it might happen that after switching the theme or adopting the <link>'s href,
		// the parameters from the previous stylesheet are taken. This can be prevented by checking whether the theme is applied.
		if (libInfo.finishedLoading) {
			const oLink = document.getElementById(libInfo.linkId);
			const sDataUri = window.getComputedStyle(oLink).getPropertyValue("background-image");
			const aParams = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(sDataUri);
			if (aParams && aParams.length >= 2) {
				let sParams = aParams[1];
				// decode only if necessary
				if (sParams.charAt(0) !== "{" && sParams.charAt(sParams.length - 1) !== "}") {
					try {
						sParams = decodeURIComponent(sParams);
					} catch (ex) {
						throw new Error("Could not decode theme parameters URI from " + oUrl.styleSheetUrl, {
							cause: ex
						});
					}
				}
				try {
					const oParams = JSON.parse(sParams);
					mergeParameters(oParams, oUrl.themeBaseUrl);
					parsedLibraries.add(libInfo.id);
					return true; // parameters successfully parsed
				} catch (ex) {
					throw new Error("Could not parse theme parameters from " + oUrl.styleSheetUrl + ".", {
						cause: ex
					});
				}
			}
			// async: always return bThemeApplied. Issues during parsing are not relevant for further processing because
			//        there is no fallback as in the sync case
			parsedLibraries.add(libInfo.id);
			return true;
		}

		// return false if theme is not applied
		return false;
	}

	function getThemeBaseUrlForId (libInfo) {
		if (!libInfo.getUrl().url && !libInfo.cssLinkElement) {
			throw new Error(`sap.ui.core.theming.Parameters: Could not find stylesheet element with ID "${libInfo.id}"`);
		}

		const sStyleSheetUrl = libInfo.getUrl().url || libInfo.cssLinkElement?.getAttribute("href");
		// The baseUrl from libInfo.getUrl() returns an absolute URL without query parameters or fragments.
		// To derive the theme base directory, we only need to remove the filename portion after the last "/"
		// (e.g., "https://example.com/resources/sap/ui/core/themes/base/library.css" → "https://example.com/resources/sap/ui/core/themes/base/")
		const sThemeBaseUrl = libInfo.getUrl().baseUrl.replace(/\/[^\/]*$/, '/');

		// Remove CSS file name and query to create theme base url (to resolve relative urls)
		return {
			themeBaseUrl: sThemeBaseUrl,
			styleSheetUrl : sStyleSheetUrl
		};
	}

	/**
	 * Returns parameter value from given map and handles legacy parameter names
	 *
	 * @param {string} sParameterName Parameter name / key
	 * @returns {string|undefined} parameter value or undefined
	 * @private
	 */
	function getParameter(sParameterName) {
		processLibraries(parseParameters);


		let sParamValue = mParameters[sParameterName];

		// [Compatibility]: if a parameter contains a prefix, we cut off the ":" and try again
		// e.g. "my.lib:paramName"
		if (!sParamValue) {
			const iIndex = sParameterName.indexOf(":");
			if (iIndex != -1) {
				const sParamNameWithoutColon = sParameterName.slice(iIndex + 1);
				sParamValue = mParameters[sParamNameWithoutColon];
			}
		}

		return sParamValue;
	}

	/**
	 *
	 * Theming Parameter Value
	 *
	 * @typedef {(string|Object<string,string>|undefined)} sap.ui.core.theming.Parameters.Value
	 * @public
	 */

	/**
	 * <p>
	 * Returns the current value for one or more theming parameters, depending on the given arguments.
	 * The synchronous usage of this API has been deprecated and only the asynchronous usage should still be used
	 * (see the 4th bullet point and the code examples below).
	 * </p>
	 *
	 * <p>
	 * The theming parameters are immutable and cannot be changed at runtime.
	 * Multiple <code>Parameters.get()</code> API calls for the same parameter name will always result in the same parameter value.
	 * </p>
	 *
	 * <p>
	 * The following API variants are available (see also the below examples):
	 * <ul>
	 * <li> <b>(deprecated since 1.92)</b> If no parameter is given a key-value map containing all parameters is returned</li>
	 * <li> <b>(deprecated since 1.94)</b> If a <code>string</code> is given as first parameter the value is returned as a <code>string</code></li>
	 * <li> <b>(deprecated since 1.94)</b> If an <code>array</code> is given as first parameter a key-value map containing all parameters from the <code>array</code> is returned</li>
	 * <li>If an <code>object</code> is given as first parameter the result is returned immediately in case all parameters are loaded and available or within the callback in case not all CSS files are already loaded.
	 * This is the <b>only asynchronous</b> API variant. This variant is the preferred way to retrieve theming parameters.
	 * The structure of the return value is the same as listed above depending on the type of the name property within the <code>object</code>.</li>
	 * </ul>
	 * </p>
	 *
	 * <p>The returned key-value maps are a copy so changing values in the map does not have any effect</p>
	 *
	 * <p>
	 * Please see the examples below for a detailed guide on how to use the <b>asynchronous variant</b> of the API.
	 * </p>
	 *
	 * @example <caption>Scenario 1: Parameters are already available</caption>
	 *  // "sapUiParam1", "sapUiParam2", "sapUiParam3" are already available
	 *  Parameters.get({
	 *     name: ["sapUiParam1", "sapUiParam2", "sapUiParam3"],
	 *     callback: function(mParams) {
	 *        // callback is not called, since all Parameters are available synchronously
	 *     }
	 *  });
	 *  // As described above, returns a map with key-value pairs corresponding to the parameters:
	 *  // mParams = {sapUiParam1: '...value...', sapUiParam2: '...value...', sapUiParam3: '...value...'}
	 *
	 * @example <caption>Scenario 2: Some Parameters are missing </caption>
	 *  // "sapUiParam1", "sapUiParam2" are already available
	 *  // "sapUiParam3" is not yet available
	 *  Parameters.get({
	 *     name: ["sapUiParam1", "sapUiParam2", "sapUiParam3"],
	 *     callback: function(mParams) {
	 *        // Parameters.get() callback gets the same map with key-value pairs as in "Scenario 1".
	 *        // mParams = {sapUiParam1: '...value...', sapUiParam2: '...value...', sapUiParam3: '...value...'}
	 *     }
	 *  });
	 *  // return-value is undefined, since not all Parameters are yet available synchronously
	 *
	 * @example <caption>Scenario 3: Default values</caption>
	 *  // Scenario 1 (all parameters are available): the returned parameter map can be used to merge with a map of default values.
	 *  // Scenario 2 (one or more parameters are missing): the returned undefined value does not change the default parameters
	 *  // This allows you to always retrieve a consistent set of parameters, either synchronously via the return-value or asynchronously via the provided callback.
	 *  const mMyParams = Object.assign({
	 *     sapUiParam1: "1rem",
	 *     sapUiParam2: "#FF0000",
	 *     sapUiParam3: "16px"
	 *  }, Parameters.get({
	 *     name: ["sapUiParam1", "sapUiParam2", "sapUiParam3"],
	 *     callback: function(mParams) {
	 *        // merge the current parameters with the actual parameters in case they are retrieved asynchronously
	 *        Object.assign(mMyParams, mParams);
	 *     }
	 *  }));
	 *
	 * @param {string | string[] | object} vName the (array with) CSS parameter name(s) or an object containing the (array with) CSS parameter name(s),
	 *     and a callback for async retrieval of parameters.
	 * @param {string | string[]} vName.name the (array with) CSS parameter name(s)
	 * @param {function(sap.ui.core.theming.Parameters.Value)} [vName.callback] If given, the callback is only executed in case there are still parameters pending and one or more of the requested parameters is missing.
	 * @returns {sap.ui.core.theming.Parameters.Value} the CSS parameter value(s) or <code>undefined</code> if the parameters could not be retrieved.
	 *
	 * @public
	 */
	Parameters.get = function(vName) {
		let fnAsyncCallback, aNames;

		// Whether parameters containing CSS URLs should be parsed into regular URL strings,
		// e.g. a parameter value of url('https://myapp.sample/image.jpeg') will be returned as "https://myapp.sample/image.jpeg".
		// Empty strings as well as the special CSS value 'none' will be parsed to null.
		let bParseUrls;

		const findRegisteredCallback = function (oCallbackInfo) { return oCallbackInfo.callback === fnAsyncCallback; };

		if (!sTheme) {
			sTheme = Theming.getTheme();
		}

		if (!vName) {
			return undefined;
		}

		if (vName instanceof Object && !Array.isArray(vName)) {
			// async variant of Parameters.get
			if (!vName.name) {
				throw new Error("sap.ui.core.theming.Parameters: Get was called with an object argument without one or more parameter names.");
			}
			fnAsyncCallback = vName.callback;
			bParseUrls = vName._restrictedParseUrls || false;
			aNames = typeof vName.name === "string" ? [vName.name] : vName.name;
		} else {
			throw new Error(
				`Legacy variant usage of sap.ui.core.theming.Parameters.get API detected for parameter(s): '${(vName.join?.(", ") ?? vName)}'.`
			);
		}

		const mResult = {};

		for (const sParamName of aNames) {
			const sParamValue = getParameter(sParamName);
			if (sParamValue) {
				mResult[sParamName] = sParamValue;
			}
		}

		if (fnAsyncCallback && Object.keys(mResult).length !== aNames.length) {
			const resolveWithParameter = function () {
				Theming.detachApplied(resolveWithParameter);
				const vParams = this.get({ // Don't pass callback again
					name: vName.name
				});

				if (!vParams || (typeof vParams === "object" && (Object.keys(vParams).length !== aNames.length))) {
					Log.error(`sap.ui.core.theming.Parameters: The following parameters could not be found: "${aNames.length === 1 ? aNames[0] : aNames.filter((n) => vParams && !Object.hasOwn(vParams, n))}"`);
				}

				fnAsyncCallback(vParams);
				aCallbackRegistry.splice(aCallbackRegistry.findIndex(findRegisteredCallback), 1);
			}.bind(this);

			// Check if identical callback is already registered and reregister with current parameters
			const iIndex = aCallbackRegistry.findIndex(findRegisteredCallback);
			if (iIndex >= 0) {
				Theming.detachApplied(aCallbackRegistry[iIndex].eventHandler);
				aCallbackRegistry[iIndex].eventHandler = resolveWithParameter;
			} else {
				aCallbackRegistry.push({ callback: fnAsyncCallback, eventHandler: resolveWithParameter });
			}
			Theming.attachApplied(resolveWithParameter);
			return undefined; // Don't return partial result in case we expect applied event.
		}

		// parse CSS URL strings
		// The URLs itself have been resolved at this point
		if (bParseUrls) {
			parseUrls(mResult);
		}

		// if only 1 parameter is requests we unwrap the results array
		return aNames.length === 1 ? mResult[aNames[0]] : mResult;
	};

	/**
	 * Checks the given map of parameters for CSS URLs and parses them to a regular string.
	 * Modifies the mParams argument in place.
	 *
	 * In order to only retrieve resolved URL strings and not the CSS URL strings, we expose a restricted Parameters.get() option <code>_restrictedParseUrls</code>.
	 *
	 * A URL parameter value of '' (empty string) or "none" (standard CSS value) will result in <code>null</code>.
	 * As with any other <code>Parameters.get()</code> call, a non-existent parameter will result in <code>undefined</code>.
	 *
	 * Usage in controls:
	 *
	 * @example <caption>Scenario 4: Parsing CSS URLs</caption>
	 *   const sUrl = Parameters.get({
	 *      name: ["sapUiUrlParam"],
	 *      _restrictedParseUrls: true
	 *   }) ?? "https://my.bootstrap.url/resource/my/lib/images/fallback.jpeg"; // fallback via nullish coalescing operator
	 *
	 * @param {object<string,string|undefined>} mParams a set of parameters that should be parsed for CSS URLs
	 */
	function parseUrls(mParams) {
		for (const sKey in mParams) {
			if (Object.hasOwn(mParams, sKey)) {
				let sValue = mParams[sKey];
				const match = rCssUrl.exec(sValue);
				if (match) {
					sValue = match[1];
				} else if (sValue === "''" || sValue === "none") {
					sValue = null;
				}
				mParams[sKey] = sValue;
			}
		}
	}

	/**
	 * Resets the CSS parameters which finally will reload the parameters
	 * the next time they are queried via the method <code>get</code>.
	 */
	function reset() {
		if ( Theming.getTheme() !== sTheme ) {
			sTheme = Theming.getTheme();
			parsedLibraries.clear();
			mParameters = {};
		}
	}

	attachChange(reset);

	return Parameters;
});
