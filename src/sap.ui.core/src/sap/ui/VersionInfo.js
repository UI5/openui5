/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	let oVersionInfo;

	/**
	 * @alias module:sap/ui/VersionInfo
	 * @namespace
	 * @since 1.56.0
	 * @public
	 */
	var VersionInfo = {
		/**
		 * Retrieves the version info in case it was already loaded.
		 * @private
		 * @ui5-restricted sap.ui.core
		 */

		get _content() {
			return oVersionInfo;
		}
	};

	/**
	 * Loads the version info asynchronously from resource "sap-ui-version.json".
	 *
	 * By default, the returned promise will resolve with the whole version info file's content.
	 * If a library name is specified in the options, then the promise will resolve with the
	 * version info for that library only or with <code>undefined</code>, if the named library
	 * is not listed in the version info file.
	 *
	 * If loading the version info file fails, the promise will be rejected with the corresponding
	 * error.
	 *
	 * @param {object} [mOptions] Map of options
	 * @param {string} [mOptions.library] Name of a library (e.g. "sap.ui.core")
	 * @returns {Promise<object|undefined>}
	 *    A promise which resolves with the full version info or with the library specific version
	 *    info or <code>undefined</code> if the library is not listed; if an error occurred during
	 *    loading, then the promise is rejected.
	 * @since 1.56.0
	 * @public
	 * @static
	 */
	VersionInfo.load = function (mOptions) {
		mOptions = mOptions || {};
		return VersionInfo._load(mOptions);
	};

	/**
	 * Stores the loading Promise for "sap-ui-version.json".
	 * @see sap.ui.getVersionInfo
	 * @private
	 */
	var oVersionInfoPromise = null;

	/**
	 * Mapping of library name to it's dependencies.
	 * Extracted from the loaded version info.
	 */
	var mKnownLibs;

	/**
	 * Mapping of component names to it's dependencies.
	 * Extracted from the loaded version info.
	 */
	var mKnownComponents;

	function updateVersionInfo(oNewVersionInfo) {
		// Persist the info object
		oVersionInfo = oNewVersionInfo;
		// reset known libs and components
		mKnownLibs = null;
		mKnownComponents = null;
	}

	/**
	 * Version retrieval. Used by {@link sap.ui.getVersionInfo} and {@link module:sap/ui/VersionInfo.load}
	 *
	 * @param {string|object} [mOptions] name of the library (e.g. "sap.ui.core") or an object map (see below)
	 * @param {boolean} [mOptions.library] name of the library (e.g. "sap.ui.core")
	 * @return {object|undefined|Promise} A Promise which resolves with the full version info,
	 *                                    the library specific one or undefined (if library is not listed)
	 * @private
	 * @static
	 */
	VersionInfo._load = function(mOptions) {

		// Check for no parameter / library name as string
		if (typeof mOptions !== "object") {
			mOptions = {
				library: mOptions
			};
		}

		if (!oVersionInfo) {
			// Load and cache the versioninfo

			// When the file is currently being loaded return the promise and make sure
			// the requested options are passed.
			// This is to prevent returning the full object as requested in a
			// first call (which created this promise) to the one requested just a
			// single lib in a second call (which re-uses this same promise) or vice versa.
			if (oVersionInfoPromise instanceof Promise) {
				return oVersionInfoPromise.then(function() {
					return VersionInfo._load(mOptions);
				});
			}

			var fnHandleSuccess = function(oNewVersionInfo) {
				updateVersionInfo(oNewVersionInfo);

				// Calling the function again with the same arguments will return the
				// cached value from the loaded version info.
				return VersionInfo._load(mOptions);
			};
			var fnHandleError = function(oError) {
				// Remove the stored Promise as the version info couldn't be loaded
				// and should be requested again the next time.
				oVersionInfoPromise = null;

				// Re-throw the error to give it to the user
				throw oError;
			};

			const vReturn = fetch(sap.ui.require.toUrl("sap-ui-version.json"))
				.then((oResponse) => {
					if (!oResponse.ok) {
						throw new Error(`loading of VersionInfo failed with status code ${oResponse.status}`);
					}
					return oResponse.json();
				})
				.then(fnHandleSuccess)
				.catch(fnHandleError);

			if (vReturn instanceof Promise) {
				oVersionInfoPromise = vReturn;
				return vReturn;
			} else {
				return fnHandleSuccess(vReturn);
			}

		} else {
			// Return the cached versioninfo

			var oResult;
			if (typeof mOptions.library !== "undefined") {
				// Find the version of the individual library
				var aLibs = oVersionInfo.libraries;
				if (aLibs) {
					for (var i = 0, l = aLibs.length; i < l; i++) {
						if (aLibs[i].name === mOptions.library) {
							oResult = aLibs[i];
							break;
						}
					}
				}
			} else {
				// Return the full version info
				oResult = oVersionInfo;
			}

			return Promise.resolve(oResult);
		}
	};

	/**
	 * Transforms the loaded version info to an easier consumable map.
	 */
	function transformVersionInfo() {
		if (oVersionInfo){
			// get the transitive dependencies of the given libs from the loaded version info
			// only do this once if mKnownLibs is not created yet
			if (oVersionInfo.libraries && !mKnownLibs) {
				// flatten dependency lists for all libs
				mKnownLibs = {};
				oVersionInfo.libraries.forEach(function(oLib, i) {
					mKnownLibs[oLib.name] = {};

					var mDeps = oLib.manifestHints && oLib.manifestHints.dependencies &&
								oLib.manifestHints.dependencies.libs;
					for (var sDep in mDeps) {
						if (!mDeps[sDep].lazy) {
							mKnownLibs[oLib.name][sDep] = true;
						}
					}
				});
			}

			// get transitive dependencies for a component
			if (oVersionInfo.components && !mKnownComponents) {
				mKnownComponents = {};

				Object.keys(oVersionInfo.components).forEach(function(sComponentName) {
					var oComponentInfo = oVersionInfo.components[sComponentName];

					mKnownComponents[sComponentName] = {
						library: oComponentInfo.library,
						hasOwnPreload: oComponentInfo.hasOwnPreload || false,
						dependencies: []
					};

					var mDeps = oComponentInfo.manifestHints && oComponentInfo.manifestHints.dependencies &&
						oComponentInfo.manifestHints.dependencies.libs;
					for (var sDep in mDeps) {
						if (!mDeps[sDep].lazy) {
							mKnownComponents[sComponentName].dependencies.push(sDep);
						}
					}
				});
			}
		}
	}

	/**
	 * Gets all additional transitive dependencies for the given list of libraries.
	 * Returns a new array.
	 * @param {object[]} aLibraries a list of libraries for which the transitive
	 * dependencies will be extracted from the loaded version info
	 * @returns {object[]} the list of all transitive dependencies for the given initial
	 * list of libraries
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	VersionInfo._getTransitiveDependencyForLibraries = function(aLibraries) {

		transformVersionInfo();
		const closure = Object.create(null);

		function addLibDependency(name, lazy) {
			if (closure[name] == null ) {
				closure[name] = {name, ...lazy && {lazy}};
			} else if (closure[name].lazy && !lazy) {
				delete closure[name].lazy;
			}
		}

		for (const {name, lazy} of aLibraries) {
			addLibDependency(name, lazy);
			if (mKnownLibs?.[name]) {
				for (const depName in mKnownLibs[name]) {
					// Dependencies in `mKnownLibs` are always eager.
					// They only inherit lazyness from the entry in aLibraries
					addLibDependency(depName, lazy);
				}
			}
		}

		return Object.values(closure);
	};

	/**
	 * If the given component is part of the version-info, an object with library and dependency information is returned.
	 *
	 * The object has three properties:
	 * <ul>
	 * <li><code>library</code> contains the name of the library which contains the component implementation</li>
	 * <li><code>dependencies</code> is an array with all transitive dependencies of the component</li>
	 * <li><code>hasOwnPreload</code> is a boolean indicating whether the component has its own Component-preload bundle</li>
	 * </ul>
	 *
	 * @param {string} sComponentName the component name
	 * @returns {{library: string, hasOwnPreload: boolean, dependencies: string[]}|undefined}
	 *    An info object containing the located library and all transitive dependencies for the given component
	 *    or <code>undefined</code> if the component is not part of the version-info.
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	VersionInfo._getTransitiveDependencyForComponent = function(sComponentName) {
		transformVersionInfo();

		if (mKnownComponents) {
			return mKnownComponents[sComponentName];
		}
	};

	/**
	 * Reset the cached version info data that is saved internally within this module.
	 *
	 * This function is intended to be used in unit tests where a custom version
	 * info object is needed.
	 *
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	VersionInfo._reset = function() {
		oVersionInfoPromise = undefined;
		updateVersionInfo();
	};

	return VersionInfo;
});
