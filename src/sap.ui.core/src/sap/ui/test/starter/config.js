/*!
 * ${copyright}
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * @typedef {object} module:sap/ui/test/starter/config.SuiteConfiguration
	 *
	 * @property {string} [name]
	 *     Name of the test suite.
	 *
	 *     This name is used as the title of the index page / testsuite page.
	 *
	 * @property {module:sap/ui/test/starter/config.TestConfiguration} [defaults]
	 *     An Object with default settings for all tests.
	 *
	 *     The defaults and the test configuration are merged recursively in such a way
	 *     that the merge contains properties from both the defaults and the test config.
	 *     If a property is defined by both config objects, the value from the test config is used.
	 *     There's no special handling for other types of values, e.g an array value in the defaults
	 *     is replaced by an array value in the test config.
	 *
	 * The test starter applies the following complete default configuration structure:
	 *
	 * <pre>
	 * {
	 *   name: null,
	 *   beforeBootstrap: null,
	 *   module: "./{name}.qunit",
	 *   page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test={name}",
	 *   title: "QUnit tests '{name}' of suite '{suite}'",
	 *   qunit: "edge",
	 *   sinon: "edge",
	 *   coverage: {
	 *     only: null,
	 *     never: null,
	 *     branchTracking: false,
	 *     instrumenter: "auto"
	 *   },
	 *   ui5: {
	 *     bindingSyntax: "complex",
	 *     libs: []
	 *   },
	 *   bootCore: true,
	 *   autostart: true
	 * }
	 * </pre>
	 *
	 * @property {Object<string,module:sap/ui/test/starter/config.TestConfiguration>} [tests]
	 *     A map with the individual test configurations, keyed by a unique test name.
	 *
	 *     There's no technical limitation for the length or the characters of the test names.
	 *     The name is used only in the overview page showing all tests of your suite.
	 *
	 *     By default, the name is also used to derive an ID for the module that contains the test cases.
	 *     We therefore recommend using names which are valid module IDs (no blanks, no special chars other than "/" or ".").
	 *     If you have multiple tests that execute the same module but with different configurations
	 *     (e.g. different QUnit versions or different URL parameters), you have to make up unique names
	 *     and manually configure the module IDs for them.
	 *
	 * The test starter applies the following complete default configuration structure:
	 *
	 * <pre>
	 * {
	 *   name: null,
	 *   beforeBootstrap: null,
	 *   module: "./{name}.qunit",
	 *   page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test={name}",
	 *   title: "QUnit tests '{name}' of suite '{suite}'",
	 *   qunit: "edge",
	 *   sinon: "edge",
	 *   coverage: {
	 *     only: null,
	 *     never: null,
	 *     branchTracking: false,
	 *     instrumenter: "auto"
	 *   },
	 *   ui5: {
	 *     bindingSyntax: "complex",
	 *     libs: []
	 *   },
	 *   bootCore: true,
	 *   autostart: true
	 * }
	 * </pre>
	 *
	 * @public
	 */

	/**
	 * Defines the configuration options for a single test in a testsuite. The same structure is also used
	 * for the defaults of a testsuite.
	 *
	 * Some of the properties in this structure support placeholders for the name of the test (written
	 * as <code>{name}</code>) and the module ID of the testsuite (written as <code>{suite}</name>>).
	 * These placeholders are substituted before the test configuration is evaluated.
	 *
	 * Properties that represent UI5 module IDs also support relative module IDs (starting with <code>./</code>).
	 * They are resolved relative to the package that contains the testsuite. This behaves the same as
	 * if the testsuite module would use these IDs in its <code>sap.ui.define</code> call.
	 *
	 * The test starter applies the following complete default configuration structure:
	 *
	 * <pre>
	 * {
	 *   name: null, // Derived from test key
	 *   beforeBootstrap: null,
	 *   module: "./{name}.qunit",
	 *   page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test={name}",
	 *   title: "QUnit tests '{name}' of suite '{suite}'",
	 *   qunit: "edge",
	 *   sinon: "edge",
	 *   coverage: {
	 *     only: null,
	 *     never: null,
	 *     branchTracking: false,
	 *     instrumenter: "auto"
	 *   },
	 *   ui5: {
	 *     bindingSyntax: "complex",
	 *     libs: []
	 *   },
	 *   bootCore: true,
	 *   autostart: true
	 * }
	 * </pre>
	 *
	 * @typedef {object} module:sap/ui/test/starter/config.TestConfiguration
	 *
	 * @property {string} [group]
	 *     The name of a group to which the test belongs.
	 *
	 *     This is an optional string by which all tests in a testsuite will
	 *     be sorted and grouped when they are listed in a UI. The group name
	 *     usually is shown as a prefix of the test name.
	 *
	 * @property {boolean} [skip]
	 *     Whether the test starter should skip a test file. Such tests will remain in the overview list
	 *     but won't be executed in the test suite.
	 *
	 * @property {string} [name]
	 *     Name of the test. If omitted, it is derived from the corresponding key in the ´tests` object
	 *     of the enclosing suite.
	 *
	 * @property {string} [beforeBootstrap]
	 *     A module to be executed before the UI5 framework is bootstrapped.
	 *
	 *     This can be useful for setting up global configurations or mocks that need to exist
	 *     before any UI5 code runs.
	 *
	 *     The value can be a relative module ID (e.g., `./mySetup.js`) and may use the placeholders
	 *     <code>{name}</code> for the test name and <code>{suite}</code> for the suite name.
	 *
	 * @property {string|Array<string>} [module="./{name}.qunit"]
	 *     ID(s) of the module(s) to load.
	 *
	 *     Can either be a single string or an array of strings. Each given module ID can be a
	 *     relative module ID (relative to the package that contains the testsuite) and may use
	 *     the placeholders <code>{name}</code> and <code>{suite}</code>.
	 *
	 *     By default, a single module with the same name as the test and in the same
	 *     package as the testsuite is loaded.
	 *
	 * @property {sap.ui.core.URI} [page="resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test={name}"]
	 *     URL of the test page to start for this test.
	 *
	 *     By default, all tests use the generic starter page, which reads the suite
	 *     configuration, finds the tests, and starts the configured test components
	 *     before it requires and executes the configured test module(s).
	 *
	 *     The URL must either be relative to the application root or use the ui5:// protocol
	 *     with a module name. The URL can use the following placeholders, enclosed in curly braces:
	 *       {suite} - replaced by the name of the testsuite (configuration)
	 *        {name} - replaced by the name of the current test
	 *
	 *     By default, a generic test page uses the testsuite and test names as URL
	 *     parameters `testsuite` and `test`, respectively.
	 *
	 * @property {Object<string,string|string[]>} [searchParams]
	 *     A map-like object with URL parameters that are appended to the <code>page</code> URL.
	 *     Making this a separate property allows to use the same page URL for all tests but with
	 *     different URL parameters per test.
	 *
	 *     Keys in the object are parameter names, and their values represent the parameter values. If the value
	 *     for a parameter is an array, the parameter will be added multiple times, once for each value
	 *     in the array.
	 *
	 *     Non-string values are not recommended and are cast to string (using the standard JavaScript
	 *     `toString` functionality).
	 *
	 * @property {Object<string,string|string[]>} [uriParams]
	 *     A map-like object with URL parameters that are appended to the <code>page</code> URL.
	 *     {@deprecated As of version 1.141.0, use <code>searchParams</code> instead.}
	 *
	 * @property {string} [title]
	 *     Title of the test.
	 *
	 *     The title can use the following placeholders, enclosed in curly braces:
	 *           {suite} - replaced by the name of the testsuite (configuration)
	 *            {name} - replaced by the name of the current test
	 *
	 *     By default, a title is chosen which contains the names of the testsuite and the test.
	 *     The exact text is not specified and may change.
	 *
	 *     Default is "QUnit tests '{name}' of suite '{suite}'"
	 *
	 * @property {module:sap/ui/test/starter/config.QUnitConfiguration|null|false|number|"edge"} [qunit="edge"]
	 *     Whether QUnit should be started, what version of it should be used, and what configuration should
	 *     be applied. Details are described in the {@link module:sap/ui/test/starter/config.QUnitConfiguration} type.
	 *
	 *     The values <code>null</code>, <code>false</code>, <code>"edge"</code> as well as any numerical value
	 *     are shortcut notations for <code>qunit: { version: &lt;value&gt; }</code>.
	 *
	 *     Default is to use the "edge" version without any additional configuration.
	 *
	 * @property {module:sap/ui/test/starter/config.SinonConfiguration} [sinon="edge"]
	 *     Whether Sinon should be started, what version of it should be used, and what configuration should
	 *     be applied. Details are described in the {@link module:sap/ui/test/starter/config.SinonConfiguration} type.
	 *
	 *     The values <code>null</code>, <code>false</code>, <code>"edge"</code> as well as any numerical value
	 *     are shortcut notations for <code>sinon: { version: &lt;value&gt; }</code>.
	 *
	 *     Default is to use the "edge" version with a QUnit bridge, but without fake timers and fake servers.
	 *
	 * @property {module:sap/ui/test/starter/config.CoverageConfiguration} [coverage]
	 *     Code coverage options.
	 *
	 *     The qunit-coverage/qunit-coverage-istanbul module is always loaded after QUnit has been
	 *     loaded to enable the coverage option. When the 'coverage' parameter is set in the URL (e.g.
	 *     because the `coverage` checkbox has been clicked), then "blanket" (if Istanbul is not used
	 *     instead) will be loaded before qunit-coverage to avoid its synchronous loading.
	 *
	 *     The `instrumenter` property identifies which tool for code coverage should be used.
	 *     If "auto" is chosen, a check determines whether Istanbul and its middleware are available,
	 *     and if so, they will be loaded. Otherwise, "blanket" is used as a fallback.
	 *
	 *     The default is to automatically determine the instrumenter to use ("auto") and not to use
	 *     branch tracking.
	 *
	 * @property {Object<string,any>} [loader]
	 *     Configuration options for the ui5loader.
	 *
	 *     The configured object value is given to the {@link sap.ui.loader.config} API and supports
	 *     nearly all configuration options that are documented for that API.
	 *     The only exception is the async flag, which is already set to true by the test starter.
	 *     The ui5loader doesn't support switching back to sync mode (async:false).
	 *
	 * @property {Object<string,any>} [ui5]
	 *     UI5 runtime configuration options.
	 *
	 *     Any configured property is made available to the runtime as if it was given in the
	 *     <code>window["sap-ui-config"]</code> config object.
	 *     If a value is of a type not supported for window["sap-ui-config"], executing the UI5 core
	 *     might fail. As the only current exception, the "libs" property can be an array of library
	 *     names and not only a comma-separated string.
	 *
	 *     To ease test development, the test starter applies the following defaults.
	 *     Note that any default is only applied if the corresponding property has not been
	 *     defined in the test-specific configuration.
	 *     <ul>
	 *       <li><code>bindingSyntax: "complex"</code></li>
	 *     </ul>
	 *
	 * @property {boolean} [bootCore=true]
	 *     Whether the UI5 core (sap/ui/core/Core.js) should be required and booted.
	 *
	 *     When this option is true, the core is not only loaded and started, but loading and execution
	 *     of the test module(s) is also delayed until a listener registered with sap.ui.getCore().attachInit()
	 *     has been executed.
	 *
	 *     {@deprecated As of version 1.120, it should not be used in new tests}
	 *
	 * @property {boolean} [autostart=true]
	 *     Whether the test starter should call QUnit.start() after all prerequisites have been fulfilled
	 *     (e.g. QUnit, Sinon, a bridge, have been loaded, coverage tooling has been loaded and configured,
	 *     the Core has been booted, the test modules have been loaded and executed, any Promises returned by
	 *     the test modules have been resolved).
	 *
	 * @public
	 */

	/**
	 * Describes what versions of QUnit are known to the test starter, which one to use
	 * for a test, and how to configure it.
	 *
	 * Besides the documented properties, QUnit configuration options can be set as well.
	 * Currently supported are 	<code>altertitle</code>, <code>collapse</code>, <code>filter</code>,
	 * <code>fixture</code>, <code>hidepassed</code>, <code>maxDepth</code>, <code>module</code>,
	 * <code>moduleId</code>, <code>notrycatch</code>, <code>noglobals</code>, <code>seed</code>,
	 * <code>reorder</code>, <code>requireExpects</code>, <code>testId</code>, <code>testTimeout</code>,
	 * <code>scrolltop</code>.
	 *
	 * ## Default Configuration
	 *
	 * The following default QUnit configuration is applied:
	 *
	 * <pre>
	 * {
	 *   versions: {
	 *     1: {
	 *       module: "sap/ui/thirdparty/qunit",
	 *       css: "sap/ui/thirdparty/qunit-2.css"
	 *     },
	 *     2: {
	 *       module: "sap/ui/thirdparty/qunit-2",
	 *       css: "sap/ui/thirdparty/qunit-2.css"
	 *     },
	 *     edge: 2,
	 *     "true": "edge"
	 *   },
	 *   version: "edge"
	 * }
	 * </pre>
	 *
	 * @typedef {object} module:sap/ui/test/starter/config.QUnitConfiguration
	 *
	 * @property {Object<string | number, string | number | module:sap/ui/test/starter/config.QUnitVersionInfo>} [versions]
	 *     Defines a set of available QUnit versions that the test starter can use.
	 *
	 *     Allows for easier switch between different QUnit versions for tests by simply
	 *     changing the <code>version</code> property in the test configuration. The test starter then
	 *     uses the versions map to find the correct files for the requested version.
	 *
	 *     The keys of this map can be used as values of the <code>version</code> property.
	 *     The value can either be a <code>QUnitVersionInfo</code> that names a JavaScript module and
	 *     a CSS stylesheet resource for a QUnit version or it can be a reference to another key
	 *     (e.g. "edge" as an alias for a concrete version).
	 *
	 *     By default, the map contains entries for the keys 1, 2, "edge" (same as 2) and "true"
	 *     (same as "edge"). All predefined entries can be overridden in a testsuite or test.
	 *
	 * @property {null|false|int|"edge"|string} [version]
	 *     Version of QUnit that should be loaded.
	 *
	 *     If set to a null, QUnit won't be loaded.
	 *     If set to "edge", the newest available version of QUnit is used.
	 *     If set to a number, the corresponding major version of QUnit is used if supported.
	 *     Currently supported versions are 1 and 2. An error will be thrown for unsupported versions.
	 *
	 *     Default is "edge"
	 *
	 * @public
	 */

	/**
	 * Describes the JavaScript and CSS resources of a certain QUnit version. Allows the test starter
	 * to start a custom QUnit version not provided by the framework.
	 *
	 * @typedef {object} module:sap/ui/test/starter/config.QUnitVersionInfo
	 * @property {string} module
	 *     Module ID of the described QUnit version. Will be loaded with a sap.ui.require call
	 *     when that QUnit version is selected.
	 *
	 * @property {string} css
	 *     UI5 resource name of a CSS stylesheet that is loaded for the described QUnit version.
	 *
	 * @public
	 */

	/**
	 * Describes what versions of Sinon are known to the test starter, which one to use
	 * for a test, and how to configure it.
	 *
	 * For versions up to Sinon 4, further Sinon config options can be added and are copied
	 * into <code>sinon.config</code>. Newer Sinon versions don't support such a config anymore.
	 * In Sinon 4, supported options are <code>injectIntoThis</code>, <code>injectInto</code>,
	 * <code>properties</code>, <code>useFakeTimers</code>, <code>useFakeServer</code>
	 *
	 * The following default Sinon configuration is applied:
	 *
	 * <pre>
	 * {
	 *   versions: {
	 *     1: {
	 *       module: "sap/ui/thirdparty/sinon",
	 *       bridge: "sap/ui/thirdparty/sinon-qunit"
	 *     },
	 *     4: {
	 *       module: "sap/ui/thirdparty/sinon-4",
	 *       bridge: "sap/ui/qunit/sinon-qunit-bridge"
	 *     },
	 *     edge: 4,
	 *     "true": "edge"
	 *   },
	 *   version: "edge",
	 *   qunitBridge: true,
	 *   useFakeTimers: false,
	 *   useFakeServer: false
	 * }
	 * </pre>
	 *
	 * @typedef {object} module:sap/ui/test/starter/config.SinonConfiguration
	 *
	 * @property {Object<string | number, string | number | module:sap/ui/test/starter/config.SinonVersionInfo>} [versions]
	 *     Defines a set of available Sinon versions that the test starter can use.
	 *
	 *     Allows for an easier switch between different Sinon versions for tests by simply
	 *     changing the <code>version</code> property in the test configuration. The test starter then
	 *     uses the versions map to find the correct files for the requested version.
	 *
	 *     The keys of this map can be used as values of the <code>version</code> property.
	 *     The value can either be a <code>SinonVersionInfo</code> that names the JavaScript
	 *     module for a Sinon version or it can be a reference to another key (e.g. "edge"
	 *     as an alias for a concrete version).
	 *
	 *     By default, the map contains entries for the keys 1, 4, "edge" (same as 4) and "true"
	 *     (same as "edge"). All predefined entries can be overridden in a testsuite or test.
	 *
	 * @property {null|false|int|string} [version]
	 *     Version of Sinon that should be loaded.
	 *     Default: "edge"
	 *
	 *     If set to null, Sinon won't be loaded.
	 *     If set to "edge", the newest available version of Sinon is used.
	 *     If set to a number, the corresponding version of Sinon is used if supported.
	 *     By default, supported versions are 1 and 4. An error will be thrown for unsupported versions.
	 *
	 * @property {boolean} [qunitBridge=true]
	 *     Whether one of the sinon-qunit bridges is loaded.
	 *
	 *     When set to true, the sap/ui/thirdparty/sinon-qunit bridge is loaded for Sinon 1
	 *     and the sap/ui/qunit/sinon-qunit-bridge is loaded for newer versions of Sinon.
	 *
	 *     The bridge is only loaded after both QUnit and Sinon have been loaded.
	 *     If either QUnit or Sinon are not loaded, no bridge is loaded.
	 *
	 *     If Sinon is not loaded, but QUnit, the bridge will not be loaded, but a shim
	 *     with dependencies will be configured. This allows tests to load Sinon / the bridge on
	 *     their own without taking care of the bridge dependencies.
	 *
	 * @public
	 */

	/**
	 * Describes the JavaScript resource of a certain Sinon version. Allows the test starter
	 * to start a custom Sinon version not provided by the framework.
	 *
	 * @typedef {object} module:sap/ui/test/starter/config.SinonVersionInfo
	 *
	 * @property {string} module
	*     Module ID of the described Sinon version. Will be loaded with a sap.ui.require call
	*     when that Sinon version is selected.
	 *
	 * @property {string} bridge
	 *    Module ID of a "bridge" that can integrate the Sinon version with QUnit, wrapping each
	 *    test in a Sinon sandbox. The bridge module will only be required by the test starter
	 *    when the <code>qunitBridge</code> config option of the test is set to true.
	 *
	 * @public
	 */

	/**
	 * Code coverage options.
	 *
	 * The qunit-coverage/qunit-coverage-istanbul module is always loaded after QUnit has been loaded to enable the coverage
	 * option. When the 'coverage' parameter is set in the URL (e.g. because the `coverage` checkbox has been
	 * clicked), then "blanket" (if Istanbul is not used instead) is loaded before qunit-coverage to avoid its synchronous loading.
	 * The `instrumenter` property identifies which tool for code coverage should be used.
	 * If "auto" is chosen, a check determines whether Istanbul and its middleware are available, and if so, they are loaded.
	 * Otherwise, "blanket" is used as a fallback.
	 *
	 * The following default coverage configuration is applied:
	 *
	 * <pre>
	 * {
	 *   only: null,
	 *   never: null,
	 *   branchTracking: false,
	 *   instrumenter: "auto"
	 * }
	 * </pre>
	 *
	 * @typedef {object} module:sap/ui/test/starter/config.CoverageConfiguration
	 *
	 * @property {string[]} [only]
	 *     List of modules or packages that should be instrumented. If not given, all modules are instrumented.
	 *     Default is null
	 *
	 * @property {string[]} [never]
	 *     List of modules or packages that never should be instrumented.
	 *     Default is null
	 *
	 * @property {boolean} [branchTracking=false]
	 *
	 * @property {"auto"|"blanket"|"istanbul"} [instrumenter="auto"]
	 *     "auto" checks for istanbul middleware and loads istanbul instrumentation, otherwise blanket is used.
	 *     The other options set explicitly the desired instrumenter.
	 *
	 * @public
	 */

	/**
	 * Default configuration for the test starter.
	 * @private
	 */
	const DEFAULT_CONFIG = {
		name: null,
		beforeBootstrap: null,
		module: "./{name}.qunit",
		page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test={name}",
		title: "QUnit tests '{name}' of suite '{suite}'",
		qunit: {
			versions: {
				1: {
					module: "sap/ui/thirdparty/qunit",
					css: "sap/ui/thirdparty/qunit-2.css"
				},
				2: {
					module: "sap/ui/thirdparty/qunit-2",
					css: "sap/ui/thirdparty/qunit-2.css"
				},
				edge: 2,
				"true": "edge"
			},
			version: "edge"
		},
		sinon: {
			versions: {
				1: {
					module: "sap/ui/thirdparty/sinon",
					bridge: "sap/ui/thirdparty/sinon-qunit"
				},
				4: {
					module: "sap/ui/thirdparty/sinon-4",
					bridge: "sap/ui/qunit/sinon-qunit-bridge"
				},
				edge: 4,
				"true": "edge"
			},
			version: "edge",
			qunitBridge: true,
			useFakeTimers: false,
			useFakeServer: false
		},
		coverage: {
			only: null,
			never: null,
			branchTracking: false,
			// "auto" checks for istanbul middleware and loads istanbul instrumentation, otherwise blanket is used.
			// The other options set explicitly the desired instrumenter.
			instrumenter: "auto" // blanket, istanbul, auto (default)
		},
		ui5: {
			bindingSyntax: 'complex',
			libs: []
		},
		bootCore: true,
		autostart: true
	};

	return DEFAULT_CONFIG;
});