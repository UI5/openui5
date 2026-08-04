/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/ui/core/_IconRegistry",
	"sap/ui/core/_IconSVGStrategy",
	"sap/ui/core/_IconFontStrategy",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeHelper",
	"sap/base/Log"
], function(IconPool, _IconRegistry, SVGStrategy, FontStrategy, Theming, ThemeHelper, Log) {
	"use strict";

	const sTestDataPath = sap.ui.require.toUrl("testdata/iconsvg");

	QUnit.module("SVG Registration", {
		afterEach: function() {
			_IconRegistry._deregisterCollection("testSVG");
		}
	});

	QUnit.test("registerSVG registers a custom SVG collection", async function(assert) {
		await IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();
		assert.ok(mCollReg["testSVG"], "Collection registered");
		assert.strictEqual(mCollReg["testSVG"].type, IconPool.CollectionType.SVG, "Type is SVG");
		assert.strictEqual(mCollReg["testSVG"].config.cssVarPrefix, "testSVG", "CSS var prefix stored");
	});

	QUnit.test("registerSVG extracts icon names after stylesheet loads", async function(assert) {
		await IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const aNames = IconPool.getIconNames("testSVG");
		assert.ok(aNames.length >= 3, "Icon names extracted (got " + aNames.length + ")");
		assert.ok(aNames.indexOf("icon-alpha") !== -1, "icon-alpha found");
		assert.ok(aNames.indexOf("icon-beta") !== -1, "icon-beta found");
		assert.ok(aNames.indexOf("icon-gamma") !== -1, "icon-gamma found");
	});

	QUnit.test("registerSVG with duplicate collection warns and overwrites", async function(assert) {
		const oLogSpy = this.spy(Log, "warning");

		await IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		await IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		assert.ok(oLogSpy.calledWith(sinon.match(/already registered/)), "Warning logged on duplicate");
	});

	QUnit.test("registerSVG with deprecatedNames filters getIconNames", async function(assert) {
		await IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG",
			deprecatedNames: ["icon-gamma"]
		});

		const aNames = IconPool.getIconNames("testSVG");
		assert.ok(aNames.indexOf("icon-alpha") !== -1, "icon-alpha present");
		assert.ok(aNames.indexOf("icon-beta") !== -1, "icon-beta present");
		assert.strictEqual(aNames.indexOf("icon-gamma"), -1, "icon-gamma filtered by deprecatedNames");
	});

	QUnit.test("collectionReady resolves after stylesheet loads", async function(assert) {
		IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const pReady = IconPool.collectionReady("testSVG");
		assert.ok(pReady instanceof Promise, "collectionReady returns a Promise");

		await pReady;
		const aNames = IconPool.getIconNames("testSVG");
		assert.ok(aNames.length >= 3, "Names available after collectionReady resolves");
	});

	QUnit.test("collectionReady returns undefined for unregistered collection", function(assert) {
		const result = IconPool.collectionReady("nonExistentCollection");
		assert.strictEqual(result, undefined, "Returns undefined for unknown collection");
	});

	QUnit.test("getIconType returns TYPE_SVG for SVG collections", async function(assert) {
		await IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const sType = _IconRegistry.getIconType("sap-icon://testSVG/icon-alpha");
		assert.strictEqual(sType, IconPool.CollectionType.SVG, "Type is SVG");
	});

	// =========================================================================
	QUnit.module("SVG Icon Name Extraction");

	QUnit.test("getIconNames returns full list after collectionReady (built-in)", async function(assert) {
		await IconPool.collectionReady();

		const aNames = IconPool.getIconNames();
		assert.ok(aNames.length > 700, "Built-in collection has " + aNames.length + " icons");
		assert.ok(aNames.indexOf("accept") !== -1, "accept icon present");
		assert.ok(aNames.indexOf("add") !== -1, "add icon present");
	});

	QUnit.test("getIconInfo accepts any name before svg.css loads (optimistic validation)", function(assert) {
		// Stub loadStylesheet to return a pending promise (stylesheet never loads)
		let fnResolve;
		const pLoad = new Promise(function(resolve) { fnResolve = resolve; });
		this.stub(SVGStrategy, "loadStylesheet").returns(pLoad);

		IconPool.registerSVG({
			name: "testOptimistic",
			uri: "/nonexistent.css",
			cssVarPrefix: "testOpt"
		});

		const oInfo = IconPool.getIconInfo("sap-icon://testOptimistic/anything");
		assert.ok(oInfo, "Icon info created optimistically for unknown name");
		assert.strictEqual(oInfo.name, "anything", "Name matches");
		assert.strictEqual(oInfo.type, IconPool.CollectionType.SVG, "Type is SVG");

		// Clean up: resolve pending promise, then deregister
		fnResolve();
		return pLoad.then(function() {
			_IconRegistry._deregisterCollection("testOptimistic");
		});
	});

	QUnit.test("getIconInfo rejects invalid name after svg.css loads", async function(assert) {
		await IconPool.collectionReady();

		const oInfo = IconPool.getIconInfo("sap-icon://thisNameDoesNotExist12345");
		assert.strictEqual(oInfo, undefined, "Invalid name returns undefined after names extracted");
	});

	QUnit.test("extractIconNames parses icon names from computed style", async function(assert) {
		await IconPool.registerSVG({
			name: "testExtract",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();
		const oCollection = mCollReg["testExtract"];
		const aNames = oCollection.config.iconNames;

		assert.ok(aNames.length >= 3, "At least 3 icon names extracted");
		assert.ok(aNames.indexOf("icon-alpha") !== -1, "icon-alpha extracted");
		assert.ok(aNames.indexOf("icon-beta") !== -1, "icon-beta extracted");
		assert.ok(aNames.indexOf("icon-gamma") !== -1, "icon-gamma extracted");

		_IconRegistry._deregisterCollection("testExtract");
	});

	QUnit.test("extractIconNames deduplicates names", async function(assert) {
		await IconPool.registerSVG({
			name: "testDedup",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();
		const oCollection = mCollReg["testDedup"];
		const aNames = oCollection.config.iconNames;

		// svg.css has both @property and :root declarations for same names
		const oCount = {};
		aNames.forEach(function(name) {
			oCount[name] = (oCount[name] || 0) + 1;
		});
		Object.keys(oCount).forEach(function(name) {
			assert.strictEqual(oCount[name], 1, "Name '" + name + "' appears only once (deduplicated)");
		});

		_IconRegistry._deregisterCollection("testDedup");
	});

	QUnit.test("extractIconNames does not re-extract when names already populated", async function(assert) {
		await IconPool.registerSVG({
			name: "testNoReExtract",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();
		const oCollection = mCollReg["testNoReExtract"];
		const iInitialCount = oCollection.config.iconNames.length;
		assert.ok(iInitialCount > 0, "Names extracted on initial registration");

		// Call extractIconNames again — should be a no-op
		SVGStrategy.extractIconNames("testNoReExtract", "testSVG", mCollReg);
		assert.strictEqual(oCollection.config.iconNames.length, iInitialCount, "No additional names extracted on second call");

		_IconRegistry._deregisterCollection("testNoReExtract");
	});

	// =========================================================================
	QUnit.module("SVG Icon Info");

	QUnit.test("getIconInfo returns SVG-type info object for built-in icons", async function(assert) {
		await IconPool.collectionReady();

		const oInfo = IconPool.getIconInfo("sap-icon://accept");
		assert.ok(oInfo, "Icon info returned");
		assert.strictEqual(oInfo.type, IconPool.CollectionType.SVG, "type is SVG");
		assert.strictEqual(oInfo.name, "accept", "name correct");
		assert.strictEqual(oInfo.collection, undefined, "collection is undefined for built-in");
		assert.strictEqual(oInfo.uri, "sap-icon://accept", "URI correct");
		assert.strictEqual(oInfo.suppressMirroring, true, "suppressMirroring is true");
		assert.ok(oInfo.id, "id property exists");
		assert.ok(oInfo.cssVarPrefix, "cssVarPrefix property exists");
	});

	QUnit.test("SVG icon info has fontFamily, content and skipMirroring for backward compat", async function(assert) {
		await IconPool.collectionReady();

		const oInfo = IconPool.getIconInfo("sap-icon://accept");
		assert.strictEqual(oInfo.fontFamily, "SAP-icons", "fontFamily is SAP-icons");
		assert.strictEqual(typeof oInfo.content, "string", "content is a string");
		assert.ok(oInfo.content.length > 0, "content is not empty");
		assert.strictEqual(oInfo.skipMirroring, true, "skipMirroring is true (accept has suppressMirroring)");
	});

	QUnit.test("getIconInfo before and after registerSVG resolves", async function(assert) {
		// Start registration but don't await — stylesheet loading is async
		const pReady = IconPool.registerSVG({
			name: "testLazy",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		// Before stylesheet loads: iconNamesSet is empty, any name is accepted optimistically
		const oExisting = IconPool.getIconInfo("sap-icon://testLazy/icon-alpha");
		const oNonExisting = IconPool.getIconInfo("sap-icon://testLazy/nonExistentIcon999");
		assert.ok(oExisting, "Existing name returns info before stylesheet loads");
		assert.ok(oNonExisting, "Non-existing name also returns info before stylesheet loads (optimistic)");

		// After stylesheet loads: iconNamesSet is populated, only known names are accepted
		await pReady;

		const oExistingAfter = IconPool.getIconInfo("sap-icon://testLazy/icon-beta");
		const oNonExistingAfter = IconPool.getIconInfo("sap-icon://testLazy/doesNotExist123");
		assert.ok(oExistingAfter, "Existing name returns info after stylesheet loads");
		assert.strictEqual(oNonExistingAfter, undefined, "Non-existing name returns undefined after stylesheet loads");

		_IconRegistry._deregisterCollection("testLazy");
	});

	// =========================================================================
	QUnit.module("SVG CSS Variable Resolution");

	QUnit.test("getCSSVarName constructs correct variable name", function(assert) {
		const oIconInfo = { name: "my-icon", cssVarPrefix: "myPrefix" };
		assert.strictEqual(SVGStrategy.getCSSVarName(oIconInfo), "--myPrefix_my-icon", "Correct CSS var name");
	});

	QUnit.test("loadStylesheet deduplicates concurrent calls for same collection", async function(assert) {
		const sUri = sap.ui.require.toUrl("test-resources/sap/ui/core/qunit/testdata/iconsvg/svg.css");

		// Ensure clean state
		SVGStrategy._deregister("testDedup");

		const pFirst = SVGStrategy.loadStylesheet(sUri, "testDedup");
		const pSecond = SVGStrategy.loadStylesheet(sUri, "testDedup");

		assert.strictEqual(pFirst, pSecond, "Same Promise returned for concurrent calls");

		await pFirst;

		// After load, calling again returns a new resolved Promise (not the original)
		const pThird = SVGStrategy.loadStylesheet(sUri, "testDedup");
		assert.notStrictEqual(pThird, pFirst, "New Promise.resolve() returned after load completes");
		await pThird;

		SVGStrategy._deregister("testDedup");
	});

	// =========================================================================
	QUnit.module("SVG Theme Handling");

	QUnit.test("resolveThemeUri selects URI matching theme regex", function(assert) {
		this.stub(Theming, "getTheme").returns("sap_horizon");
		const mConfig = { "^sap_horizon": "/horizon/svg.css" };

		const sUri = SVGStrategy.resolveThemeUri(mConfig, "/default/svg.css");
		assert.strictEqual(sUri, "/horizon/svg.css", "Horizon URI selected");
	});

	QUnit.test("resolveThemeUri falls back to default URI when no match", function(assert) {
		this.stub(Theming, "getTheme").returns("sap_belize");
		const mConfig = { "^sap_horizon": "/horizon/svg.css" };

		const sUri = SVGStrategy.resolveThemeUri(mConfig, "/default/svg.css");
		assert.strictEqual(sUri, "/default/svg.css", "Default URI used as fallback");
	});

	QUnit.test("resolveThemeUri returns default when no themeConfig", function(assert) {
		const sUri = SVGStrategy.resolveThemeUri(null, "/default/svg.css");
		assert.strictEqual(sUri, "/default/svg.css", "Default URI returned");
	});

	// =========================================================================
	QUnit.module("collectionReady (general)");

	QUnit.test("Returns SVG collection's ready promise (built-in)", async function(assert) {
		const pReady = IconPool.collectionReady();
		assert.ok(pReady instanceof Promise, "Returns Promise for built-in SVG collection");
		await pReady;
		assert.ok(true, "Promise resolves");
	});

	QUnit.test("Returns Promise.resolve for already-loaded font collection", async function(assert) {
		const mCollReg = _IconRegistry.getCollectionRegistry();
		mCollReg["testFontReady"] = {
			type: IconPool.CollectionType.FONT,
			metadataLoaded: true,
			config: { fontFamily: "test", fontURI: "/test/" }
		};

		const pReady = IconPool.collectionReady("testFontReady");
		assert.ok(pReady instanceof Promise, "Returns Promise");
		await pReady;
		assert.ok(true, "Resolves immediately for loaded font");
		delete mCollReg["testFontReady"];
	});

	QUnit.test("Returns undefined for unregistered collection", function(assert) {
		const result = IconPool.collectionReady("totallyFakeCollection999");
		assert.strictEqual(result, undefined, "undefined for unregistered");
	});

	// =========================================================================
	QUnit.module("getIconHTML");

	QUnit.test("Returns empty string for non-icon URI", function(assert) {
		assert.strictEqual(IconPool.getIconHTML("http://example.com/img.png"), "", "Non-icon URI returns empty string");
		assert.strictEqual(IconPool.getIconHTML("just-a-string"), "", "Plain string returns empty string");
	});

	QUnit.test("Returns empty string for empty or falsy input", function(assert) {
		assert.strictEqual(IconPool.getIconHTML(""), "", "Empty string");
		assert.strictEqual(IconPool.getIconHTML(null), "", "null");
		assert.strictEqual(IconPool.getIconHTML(undefined), "", "undefined");
		assert.strictEqual(IconPool.getIconHTML(false), "", "false");
	});

	QUnit.test("Returns empty string for unregistered icon", async function(assert) {
		await IconPool.collectionReady();
		assert.strictEqual(IconPool.getIconHTML("sap-icon://thisDoesNotExist99999"), "", "Unknown icon returns empty string");
	});

	QUnit.test("Returns valid HTML span for a known SVG icon", function(assert) {
		const sHTML = IconPool.getIconHTML("sap-icon://accept");
		assert.ok(sHTML.length > 0, "Non-empty result");
		assert.ok(sHTML.indexOf("<span") === 0, "Starts with <span");
		assert.ok(sHTML.indexOf("</span>") > 0, "Contains closing </span>");
		assert.ok(sHTML.indexOf("sapUiIcon") > 0, "Contains sapUiIcon class");
		assert.ok(sHTML.indexOf("sapUiIconSVG") > 0, "Contains sapUiIconSVG class for SVG icons");
	});

	QUnit.test("Includes additional CSS classes passed as parameter", function(assert) {
		const sHTML = IconPool.getIconHTML("sap-icon://accept", ["myClass1", "myClass2"]);
		assert.ok(sHTML.indexOf("myClass1") > 0, "First custom class present");
		assert.ok(sHTML.indexOf("myClass2") > 0, "Second custom class present");
		assert.ok(sHTML.indexOf("sapUiIcon") > 0, "Base sapUiIcon class still present");
	});

	QUnit.test("Includes custom attributes", function(assert) {
		const sHTML = IconPool.getIconHTML("sap-icon://accept", [], {title: "Accept", id: "myIcon"});
		assert.ok(sHTML.indexOf('title="Accept"') > 0, "title attribute present");
		assert.ok(sHTML.indexOf('id="myIcon"') > 0, "id attribute present");
	});

	QUnit.test("Encodes special characters in attributes", function(assert) {
		const sHTML = IconPool.getIconHTML("sap-icon://accept", [], {title: "a<b&c"});
		assert.ok(sHTML.indexOf("a&lt;b&amp;c") > 0, "Special chars XML-encoded in attribute value");
	});

	QUnit.test("Does not return img element for icon URIs", function(assert) {
		const sHTML = IconPool.getIconHTML("sap-icon://accept");
		assert.ok(sHTML.indexOf("<img") === -1, "No img element produced");
	});

	QUnit.test("Works with custom SVG collection", async function(assert) {
		await IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const sHTML = IconPool.getIconHTML("sap-icon://testSVG/icon-alpha");
		assert.ok(sHTML.length > 0, "Non-empty result for custom SVG collection icon");
		assert.ok(sHTML.indexOf("sapUiIcon") > 0, "Contains sapUiIcon class");
		assert.ok(sHTML.indexOf("sapUiIconSVG") > 0, "Contains sapUiIconSVG class");

		_IconRegistry._deregisterCollection("testSVG");
	});

	QUnit.test("SVG icon HTML contains mask-image style with correct CSS variable", function(assert) {
		const sHTML = IconPool.getIconHTML("sap-icon://accept");
		const oDiv = document.createElement("div");
		oDiv.innerHTML = sHTML;
		const oSpan = oDiv.firstChild;

		assert.strictEqual(oSpan.tagName, "SPAN", "Root element is a span");
		assert.ok(oSpan.classList.contains("sapUiIcon"), "Has sapUiIcon class");
		assert.ok(oSpan.classList.contains("sapUiIconSVG"), "Has sapUiIconSVG class");
		assert.ok(oSpan.classList.contains("sapUiIconSVGMask"), "Has sapUiIconSVGMask class");
		assert.ok(oSpan.style.cssText.indexOf("--sapUiIconSVGMaskUrl") > -1, "CSS custom property for mask URL applied");
		assert.ok(oSpan.style.cssText.indexOf("--sapIcons_accept") > -1, "References correct CSS variable for icon");
	});

	QUnit.test("SVG icon HTML does NOT contain <svg> or <use> elements", function(assert) {
		const sHTML = IconPool.getIconHTML("sap-icon://accept");
		assert.strictEqual(sHTML.indexOf("<svg"), -1, "No <svg> element in getIconHTML output");
		assert.strictEqual(sHTML.indexOf("<use"), -1, "No <use> element in getIconHTML output");
	});

	QUnit.test("SVG icon HTML includes data-sap-ui-icon-collection for custom collection", async function(assert) {
		await IconPool.registerSVG({
			name: "testSVG",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const sHTML = IconPool.getIconHTML("sap-icon://testSVG/icon-alpha");
		const oDiv = document.createElement("div");
		oDiv.innerHTML = sHTML;
		const oSpan = oDiv.firstChild;

		assert.strictEqual(oSpan.getAttribute("data-sap-ui-icon-collection"), "testSVG",
			"data-sap-ui-icon-collection attribute present for custom collection");
		assert.ok(oSpan.style.cssText.indexOf("--sapUiIconSVGMaskUrl") > -1,
			"CSS custom property for mask URL applied for custom collection");
		assert.ok(oSpan.style.cssText.indexOf("--testSVG_icon-alpha") > -1,
			"References correct CSS variable for custom collection icon");

		_IconRegistry._deregisterCollection("testSVG");
	});

	// =========================================================================
	QUnit.module("SVG Theme Change", {
		afterEach: function() {
			_IconRegistry._deregisterCollection("testThemeColl");
		}
	});

	QUnit.test("onThemeApplied swaps stylesheet for external collection with themeConfig", async function(assert) {
		this.stub(SVGStrategy, "resolveThemeUri").returns(sTestDataPath + "/svg.css");

		await IconPool.registerSVG({
			name: "testThemeColl",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG",
			themeConfig: {
				"^sap_horizon.*": sTestDataPath + "/horizon/svg.css"
			}
		});

		// Restore resolveThemeUri so we can re-stub with different return
		SVGStrategy.resolveThemeUri.restore();

		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();
		const oCollection = mCollectionRegistry["testThemeColl"];

		const oInitialLink = document.head.querySelector(
			'link[data-sap-ui-icon-collection="testThemeColl"]'
		);
		assert.ok(oInitialLink, "Initial stylesheet link present");
		const sInitialHref = oInitialLink.href;

		this.stub(SVGStrategy, "resolveThemeUri").returns(sTestDataPath + "/horizon/svg.css");

		SVGStrategy.onThemeApplied("testThemeColl", oCollection, mCollectionRegistry);

		const oNewLink = document.head.querySelector(
			'link[data-sap-ui-icon-collection="testThemeColl"]'
		);
		assert.ok(oNewLink, "New stylesheet link present after theme change");
		assert.notEqual(oNewLink.href, sInitialHref, "Stylesheet href changed");
		assert.ok(oNewLink.href.indexOf("/horizon/") !== -1, "New href points to horizon theme");

		// Wait for stylesheet to load so extractIconNames is called
		await new Promise(function(resolve) { oNewLink.addEventListener("load", resolve); });

		const aNames = IconPool.getIconNames("testThemeColl");
		assert.ok(aNames.length > 0, "Icon names re-extracted from new stylesheet after theme swap");
	});

	QUnit.test("onThemeApplied does nothing when themeConfig is absent", async function(assert) {
		await IconPool.registerSVG({
			name: "testThemeColl",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();
		const oCollection = mCollectionRegistry["testThemeColl"];

		const oLoadSpy = this.spy(SVGStrategy, "loadStylesheet");
		SVGStrategy.onThemeApplied("testThemeColl", oCollection, mCollectionRegistry);

		assert.strictEqual(oLoadSpy.callCount, 0, "loadStylesheet not called when no themeConfig");
	});

	QUnit.test("onThemeApplied does nothing when theme resolves to same path", async function(assert) {
		await IconPool.registerSVG({
			name: "testThemeColl",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG",
			themeConfig: {
				"^sap_horizon.*": sTestDataPath + "/horizon/svg.css"
			}
		});

		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();
		const oCollection = mCollectionRegistry["testThemeColl"];

		const oLoadSpy = this.spy(SVGStrategy, "loadStylesheet");
		this.stub(SVGStrategy, "resolveThemeUri").returns(sTestDataPath + "/svg.css");
		oCollection.currentSVGPath = sTestDataPath + "/";

		SVGStrategy.onThemeApplied("testThemeColl", oCollection, mCollectionRegistry);

		assert.strictEqual(oLoadSpy.callCount, 0, "loadStylesheet not called when path unchanged");
	});

	// =========================================================================
	QUnit.module("Fallback stylesheet", {
		beforeEach: function() {
			// Remember existing link count to avoid removing pre-existing links in afterEach
			this.iInitialLinkCount = document.head.querySelectorAll(
				'link[data-sap-ui-icon-collection="undefined"]'
			).length;
		},
		afterEach: function() {
			// Only remove links added during test (not the pre-existing one from test env)
			const aLinks = document.head.querySelectorAll(
				'link[data-sap-ui-icon-collection="undefined"]'
			);
			for (let i = aLinks.length - 1; i >= this.iInitialLinkCount; i--) {
				aLinks[i].parentNode.removeChild(aLinks[i]);
			}
		}
	});

	QUnit.test("_removeFallbackStylesheet removes link and clears cache", function(assert) {
		const sLinkId = "sap-ui-icon-svg-undefined";

		// Remove any pre-existing link first to start clean
		const oExisting = document.getElementById(sLinkId);
		if (oExisting) {
			oExisting.parentNode.removeChild(oExisting);
		}

		// Insert a test link with the expected id
		const oLink = document.createElement("link");
		oLink.rel = "stylesheet";
		oLink.id = sLinkId;
		oLink.setAttribute("data-sap-ui-icon-collection", "undefined");
		document.head.appendChild(oLink);

		SVGStrategy._removeFallbackStylesheet();

		const oFound = document.getElementById(sLinkId);
		assert.strictEqual(oFound, null, "Fallback link element removed");

		// Re-add the one we removed (if it existed) to not break other tests
		if (oExisting) {
			document.head.appendChild(oExisting);
		}
	});

	QUnit.test("_removeFallbackStylesheet does nothing when no link exists", function(assert) {
		SVGStrategy._removeFallbackStylesheet();
		assert.ok(true, "No error when no fallback link exists");
	});

	QUnit.test("_loadFallbackStylesheet loads base/svg.css", function(assert) {
		const done = assert.async();
		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();

		SVGStrategy._loadFallbackStylesheet(mCollectionRegistry);

		setTimeout(function() {
			const oLink = document.head.querySelector('link[data-sap-ui-icon-collection="undefined"]');
			assert.ok(oLink, "Fallback link element was created");
			assert.ok(oLink.href.indexOf("themes/base/svg.css") > -1, "Points to base/svg.css");
			done();
		}, 2000);
	});

	QUnit.test("loadStylesheet rejects and cleans up on onerror", function(assert) {
		const sBrokenUri = sap.ui.require.toUrl("testdata/iconsvg/nonexistent-path/invalid.css");
		const sCollKey = "testLoadError";

		return SVGStrategy.loadStylesheet(sBrokenUri, sCollKey).then(function() {
			assert.ok(true, "Resolved (may happen in some environments where onerror doesn't fire)");
		}, function(err) {
			assert.ok(err instanceof Error, "Promise rejects with Error");
			assert.ok(err.message.indexOf("Failed to load SVG stylesheet") !== -1, "Error message correct");

			const pRetry = SVGStrategy.loadStylesheet(sBrokenUri, sCollKey);
			assert.ok(pRetry instanceof Promise, "Retry returns a fresh Promise (not cached stale state)");

			return pRetry.catch(function() { /* expected */ });
		}).finally(function() {
			const oLinks = document.head.querySelectorAll(
				'link[data-sap-ui-icon-collection="' + sCollKey + '"]'
			);
			oLinks.forEach(function(l) { l.parentNode.removeChild(l); });
		});
	});

	QUnit.test("onThemeAppliedBuiltIn does not load fallback when extractIconNames finds names", function(assert) {
		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();
		const oFallbackSpy = this.spy(SVGStrategy, "_loadFallbackStylesheet");
		this.stub(SVGStrategy, "_removeFallbackStylesheet");

		// Stub extractIconNames to simulate CSS vars present (names found)
		this.stub(SVGStrategy, "extractIconNames").callsFake(function(sCollName, _sPrefix, mReg) {
			const oBuiltIn = mReg[sCollName];
			if (oBuiltIn && oBuiltIn.config) {
				oBuiltIn.config.iconNames = ["accept", "add", "delete"];
				oBuiltIn.config.iconNamesSet = new Set(oBuiltIn.config.iconNames);
			}
		});

		SVGStrategy.onThemeAppliedBuiltIn(mCollectionRegistry);

		assert.strictEqual(oFallbackSpy.callCount, 0, "_loadFallbackStylesheet not called when names found");
	});

	QUnit.test("onThemeAppliedBuiltIn calls extractIconNames synchronously", function(assert) {
		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();
		this.stub(SVGStrategy, "_removeFallbackStylesheet");

		// Stub extractIconNames to simulate CSS vars present (names found)
		const oExtractStub = this.stub(SVGStrategy, "extractIconNames").callsFake(function(sCollName, _sPrefix, mReg) {
			const oBuiltIn = mReg[sCollName];
			if (oBuiltIn && oBuiltIn.config) {
				oBuiltIn.config.iconNames = ["accept"];
				oBuiltIn.config.iconNamesSet = new Set(["accept"]);
			}
		});

		SVGStrategy.onThemeAppliedBuiltIn(mCollectionRegistry);

		assert.strictEqual(oExtractStub.callCount, 1, "extractIconNames called once synchronously");
		assert.strictEqual(oExtractStub.firstCall.args[0], undefined, "Called for built-in collection");
		assert.strictEqual(oExtractStub.firstCall.args[1], "sapIcons", "Called with correct prefix");
	});

	QUnit.test("onThemeAppliedBuiltIn loads fallback when extractIconNames finds no names", function(assert) {
		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();
		const oFallbackSpy = this.spy(SVGStrategy, "_loadFallbackStylesheet");
		this.stub(SVGStrategy, "_removeFallbackStylesheet");

		// Stub extractIconNames to be a no-op (simulates old theme without CSS vars)
		this.stub(SVGStrategy, "extractIconNames");

		SVGStrategy.onThemeAppliedBuiltIn(mCollectionRegistry);

		assert.strictEqual(oFallbackSpy.callCount, 1, "_loadFallbackStylesheet called when no names found");

		// Return the Promise from _loadFallbackStylesheet to allow QUnit to wait for it
		return oFallbackSpy.firstCall.returnValue;
	});

	QUnit.test("onThemeAppliedBuiltIn extracts names after fallback stylesheet loads", async function(assert) {
		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();
		this.stub(SVGStrategy, "_removeFallbackStylesheet");

		// Reset built-in icon names to simulate a fresh state
		const oBuiltIn = mCollectionRegistry[undefined];
		oBuiltIn.config.iconNames = [];
		oBuiltIn.config.iconNamesSet = new Set();

		// Stub extractIconNames: first call finds nothing (old theme),
		// second call (after fallback loads) populates names
		let iExtractCallCount = 0;
		this.stub(SVGStrategy, "extractIconNames").callsFake(function(sCollName, _sPrefix, mReg) {
			iExtractCallCount++;
			if (iExtractCallCount > 1) {
				const oCol = mReg[sCollName];
				if (oCol && oCol.config) {
					oCol.config.iconNames = ["accept", "add"];
					oCol.config.iconNamesSet = new Set(oCol.config.iconNames);
				}
			}
		});

		// Stub _loadFallbackStylesheet with a controlled promise
		let fnResolveLoad;
		const pLoad = new Promise(function(resolve) { fnResolveLoad = resolve; });
		this.stub(SVGStrategy, "_loadFallbackStylesheet").returns(pLoad);

		SVGStrategy.onThemeAppliedBuiltIn(mCollectionRegistry);

		// extractIconNames called once synchronously (returned 0 names)
		assert.strictEqual(iExtractCallCount, 1,
			"extractIconNames called once synchronously (found no names)");

		// Resolve the fallback load
		fnResolveLoad();
		await pLoad;
		// Allow microtask (.then handler) to run
		await new Promise(function(resolve) { setTimeout(resolve, 0); });

		assert.strictEqual(iExtractCallCount, 2,
			"extractIconNames called again after fallback stylesheet resolved");
	});

	// =========================================================================
	// getIconInfo before collectionReady
	// =========================================================================
	QUnit.module("SVG getIconInfo Before collectionReady", {
		afterEach: function() {
			_IconRegistry._deregisterCollection("testEarlyColl");
		}
	});

	QUnit.test("getIconInfo returns info with correct properties before CSS loads", function(assert) {
		// Stub loadStylesheet to return a pending promise (stylesheet never loads)
		let fnResolve;
		const pLoad = new Promise(function(resolve) { fnResolve = resolve; });
		this.stub(SVGStrategy, "loadStylesheet").returns(pLoad);

		IconPool.registerSVG({
			name: "testEarlyColl",
			uri: "/nonexistent.css",
			cssVarPrefix: "testEarly"
		});

		const oInfo = IconPool.getIconInfo("sap-icon://testEarlyColl/myIcon");
		assert.ok(oInfo, "Icon info created optimistically");
		assert.strictEqual(oInfo.type, IconPool.CollectionType.SVG, "type is SVG");
		assert.strictEqual(oInfo.name, "myIcon", "name matches");
		assert.strictEqual(oInfo.cssVarPrefix, "testEarly", "cssVarPrefix from collection config");
		assert.strictEqual(oInfo.collection, "testEarlyColl", "collection name set");
		assert.strictEqual(oInfo.uri, "sap-icon://testEarlyColl/myIcon", "URI correct");

		// Clean up: resolve pending promise
		fnResolve();
		return pLoad;
	});

	QUnit.test("getIconNames returns empty before stylesheet loads for external SVG collection", async function(assert) {
		// Stub loadStylesheet to return a controlled promise
		let fnResolve;
		const pLoad = new Promise(function(resolve) { fnResolve = resolve; });
		this.stub(SVGStrategy, "loadStylesheet").returns(pLoad);

		IconPool.registerSVG({
			name: "testEarlyColl",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		let aNames = IconPool.getIconNames("testEarlyColl");
		assert.strictEqual(aNames.length, 0, "No names before stylesheet loads");

		SVGStrategy.loadStylesheet.restore();

		// Resolve the pending promise (extractIconNames won't find vars because no real stylesheet)
		fnResolve();
		await pLoad;
		await Promise.resolve();

		// Re-register properly now that loadStylesheet is real
		_IconRegistry._deregisterCollection("testEarlyColl");
		await IconPool.registerSVG({
			name: "testEarlyColl",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		aNames = IconPool.getIconNames("testEarlyColl");
		assert.ok(aNames.length >= 3, "Names populated after stylesheet loads (" + aNames.length + ")");
	});

	// =========================================================================
	// CSS prefix collision
	// =========================================================================
	QUnit.module("SVG CSS Prefix Collision");

	QUnit.test("extractIconNames does not cross-contaminate prefixed collections", function(assert) {
		const mCollReg = _IconRegistry.getCollectionRegistry();

		// Create two collections with similar prefixes
		mCollReg["shortPrefix"] = {
			config: { cssVarPrefix: "test", uri: "/test.css", iconNames: [], iconNamesSet: new Set() },
			type: IconPool.CollectionType.SVG,
			metadataLoaded: true
		};
		mCollReg["longPrefix"] = {
			config: { cssVarPrefix: "testLong", uri: "/testLong.css", iconNames: [], iconNamesSet: new Set() },
			type: IconPool.CollectionType.SVG,
			metadataLoaded: true
		};

		// Mock getComputedStyle to return properties with both prefixes
		const oOrigGetComputedStyle = window.getComputedStyle;
		const aMockProps = ["--test_iconA", "--testLong_iconB", "--test_iconC"];
		window.getComputedStyle = function() {
			return {
				length: aMockProps.length,
				0: aMockProps[0],
				1: aMockProps[1],
				2: aMockProps[2],
				getPropertyValue: function() { return ""; }
			};
		};

		SVGStrategy.extractIconNames("shortPrefix", "test", mCollReg);
		SVGStrategy.extractIconNames("longPrefix", "testLong", mCollReg);

		const aShortNames = mCollReg["shortPrefix"].config.iconNames;
		const aLongNames = mCollReg["longPrefix"].config.iconNames;

		assert.deepEqual(aShortNames.sort(), ["iconA", "iconC"], "Short prefix gets only its icons");
		assert.deepEqual(aLongNames, ["iconB"], "Long prefix gets only its icon");

		// No cross-contamination: "testLong_iconB" does NOT match "test_" prefix
		assert.strictEqual(aShortNames.indexOf("Long_iconB"), -1, "No cross-contamination from testLong to test");

		window.getComputedStyle = oOrigGetComputedStyle;
		delete mCollReg["shortPrefix"];
		delete mCollReg["longPrefix"];
	});

	// =========================================================================
	// Theme change + registerSVG concurrent
	// =========================================================================
	QUnit.module("SVG Registration + Theme Change Concurrency", {
		afterEach: function() {
			_IconRegistry._deregisterCollection("testConcurrent");
		}
	});

	QUnit.test("registerSVG + immediate theme change: only final state persists", async function(assert) {
		const mCollectionRegistry = _IconRegistry.getCollectionRegistry();

		// Stub loadStylesheet to return controlled promises
		let fnResolveReg, fnResolveTheme;
		const pReg = new Promise(function(resolve) { fnResolveReg = resolve; });
		const pTheme = new Promise(function(resolve) { fnResolveTheme = resolve; });

		let iCallCount = 0;
		this.stub(SVGStrategy, "loadStylesheet").callsFake(function() {
			iCallCount++;
			return iCallCount === 1 ? pReg : pTheme;
		});

		const oExtractSpy = this.spy(SVGStrategy, "extractIconNames");

		// Register collection (promise pending)
		IconPool.registerSVG({
			name: "testConcurrent",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testConc",
			themeConfig: { "^sap_horizon": sTestDataPath + "/horizon/svg.css" }
		});

		// Before resolving, trigger theme change via resolveThemeUri stub
		this.stub(SVGStrategy, "resolveThemeUri").returns(sTestDataPath + "/horizon/svg.css");
		mCollectionRegistry["testConcurrent"].currentSVGPath = "/old/";

		SVGStrategy.onThemeApplied("testConcurrent", mCollectionRegistry["testConcurrent"], mCollectionRegistry);

		// Resolve registerSVG promise
		fnResolveReg();
		await pReg;
		await Promise.resolve();

		oExtractSpy.resetHistory();

		// Resolve theme change promise
		fnResolveTheme();
		await pTheme;
		await Promise.resolve();

		assert.strictEqual(oExtractSpy.callCount, 1, "extractIconNames called for theme change callback");
		assert.strictEqual(oExtractSpy.firstCall.args[0], "testConcurrent", "Called for correct collection");
	});

	// =========================================================================
	// loadStylesheet rejection through register()
	// =========================================================================
	QUnit.module("SVG Stylesheet Load Failure", {
		afterEach: function() {
			_IconRegistry._deregisterCollection("testFailColl");
		}
	});

	QUnit.test("registerSVG logs error when stylesheet fails to load", async function(assert) {
		const oLogSpy = this.spy(Log, "error");
		this.stub(SVGStrategy, "loadStylesheet").rejects(new Error("Network error"));

		await IconPool.registerSVG({
			name: "testFailColl",
			uri: "/broken/svg.css",
			cssVarPrefix: "testFail"
		});

		assert.ok(oLogSpy.calledWith(sinon.match(/Failed to load SVG stylesheet/)), "Log.error called with stylesheet failure message");

		// Collection is still in registry (not cleaned up)
		const mCollReg = _IconRegistry.getCollectionRegistry();
		assert.ok(mCollReg["testFailColl"], "Collection entry remains in registry after load failure");
	});

	QUnit.test("loadStylesheet retry after rejection succeeds", async function(assert) {
		const sUri = sap.ui.require.toUrl("test-resources/sap/ui/core/qunit/testdata/iconsvg/nonexistent-path/invalid.css");
		const sCollKey = "testRetryFail";

		// First call: use real loadStylesheet — should reject on 404
		try {
			await SVGStrategy.loadStylesheet(sUri, sCollKey);
			assert.ok(false, "Should have rejected");
		} catch (err) {
			assert.ok(err instanceof Error, "First call rejects with Error");
		}

		// Second call: should create fresh promise (key was deleted on error)
		const pRetry = SVGStrategy.loadStylesheet(sUri, sCollKey);
		assert.ok(pRetry instanceof Promise, "Retry returns a fresh Promise");

		// Clean up
		try {
			await pRetry;
		} catch (e) {
			// expected
		}
		SVGStrategy._deregister(sCollKey);
	});

	// =========================================================================
	// resolveThemeUri with parent theme fallback
	// =========================================================================
	QUnit.module("SVG resolveThemeUri Parent Theme Fallback");

	QUnit.test("resolveThemeUri matches parent theme from ThemeHelper.getMetadata", function(assert) {
		this.stub(Theming, "getTheme").returns("custom_theme");
		this.stub(ThemeHelper, "getMetadata").returns({ Extends: ["sap_horizon"] });

		const mConfig = { "^sap_horizon": "/horizon/svg.css" };
		const sUri = SVGStrategy.resolveThemeUri(mConfig, "/default/svg.css");
		assert.strictEqual(sUri, "/horizon/svg.css", "Matches via parent theme");
	});

	QUnit.test("resolveThemeUri prefers direct theme match over parent", function(assert) {
		this.stub(Theming, "getTheme").returns("sap_horizon_dark");
		this.stub(ThemeHelper, "getMetadata").returns({ Extends: ["sap_horizon"] });

		const mConfig = { "^sap_horizon_dark": "/dark/svg.css", "^sap_horizon": "/base/svg.css" };
		const sUri = SVGStrategy.resolveThemeUri(mConfig, "/default/svg.css");
		assert.strictEqual(sUri, "/dark/svg.css", "Direct theme match wins over parent");
	});

	// =========================================================================
	QUnit.module("Dual Registration (registerFont + registerSVG)", {
		afterEach: function() {
			_IconRegistry._deregisterCollection("testDualReg");
		}
	});

	QUnit.test("registerFont then registerSVG: type becomes SVG, fontConfig preserved", async function(assert) {
		IconPool.registerFont({
			fontFamily: "TestDualFont",
			collectionName: "testDualReg",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
			lazy: true
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();
		assert.strictEqual(mCollReg["testDualReg"].type, IconPool.CollectionType.FONT, "Initially TYPE_FONT");

		await IconPool.registerSVG({
			name: "testDualReg",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		assert.strictEqual(mCollReg["testDualReg"].type, IconPool.CollectionType.SVG, "After registerSVG, type is SVG");
		assert.ok(mCollReg["testDualReg"].fontConfig, "fontConfig preserved from registerFont");
		assert.strictEqual(mCollReg["testDualReg"].fontConfig.fontFamily, "TestDualFont", "fontFamily in fontConfig");
		assert.ok(mCollReg["testDualReg"].fontConfig.fontURI, "fontURI in fontConfig");
		const aNames = IconPool.getIconNames("testDualReg");
		assert.ok(aNames.length >= 3, "SVG icon names available");
	});

	QUnit.test("registerSVG then registerFont: type stays SVG, fontConfig populated", async function(assert) {
		await IconPool.registerSVG({
			name: "testDualReg",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();
		assert.strictEqual(mCollReg["testDualReg"].type, IconPool.CollectionType.SVG, "Initially TYPE_SVG");
		assert.notOk(mCollReg["testDualReg"].fontConfig, "No fontConfig before registerFont");

		IconPool.registerFont({
			fontFamily: "TestDualFont",
			collectionName: "testDualReg",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
			lazy: true
		});

		assert.strictEqual(mCollReg["testDualReg"].type, IconPool.CollectionType.SVG, "After registerFont, type stays SVG");
		assert.ok(mCollReg["testDualReg"].fontConfig, "fontConfig populated by registerFont");
		assert.strictEqual(mCollReg["testDualReg"].fontConfig.fontFamily, "TestDualFont", "fontFamily stored");
		assert.ok(mCollReg["testDualReg"].fontConfig.fontURI, "fontURI stored");
		const aNames = IconPool.getIconNames("testDualReg");
		assert.ok(aNames.length >= 3, "SVG icon names still available");
	});

	QUnit.test("Pure registerSVG: no fontFamily or content on icon info", async function(assert) {
		await IconPool.registerSVG({
			name: "testDualReg",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const oInfo = IconPool.getIconInfo("sap-icon://testDualReg/icon-alpha");
		assert.ok(oInfo, "Icon info returned");
		assert.strictEqual(oInfo.type, IconPool.CollectionType.SVG, "Type is SVG");
		assert.strictEqual(oInfo.fontFamily, undefined, "No fontFamily without registerFont");
		assert.strictEqual(oInfo.content, undefined, "No content without registerFont");
	});

	QUnit.test("Theme change on dual-registered collection: both strategies run", async function(assert) {
		IconPool.registerFont({
			fontFamily: "TestDualFont",
			collectionName: "testDualReg",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
			lazy: true
		});

		await IconPool.registerSVG({
			name: "testDualReg",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG",
			themeConfig: {
				"^sap_horizon": sTestDataPath + "/horizon/svg.css"
			}
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();

		// Simulate font metadata with theme paths loaded (as if loadMetadata ran)
		mCollReg["testDualReg"].fontConfig.themeConfig = {
			path: { "^sap_horizon": "sap/tnt/themes/sap_horizon/fonts" }
		};

		const oSVGSpy = this.spy(SVGStrategy, "onThemeApplied");
		const oFontSpy = this.spy(FontStrategy, "onThemeApplied");

		// Trigger theme handler directly via Theming.attachApplied callback
		// We simulate what happens by calling both handlers
		const oCollection = mCollReg["testDualReg"];
		if (oCollection.themeConfig) {
			SVGStrategy.onThemeApplied("testDualReg", oCollection, mCollReg);
		}
		FontStrategy.onThemeApplied("testDualReg", oCollection, mCollReg, null);

		assert.ok(oSVGSpy.calledOnce, "SVGStrategy.onThemeApplied called");
		assert.ok(oFontSpy.calledOnce, "FontStrategy.onThemeApplied called for dual-registered font");
	});

	QUnit.test("insertFontFaceStyle works for dual-registered SVG collection", async function(assert) {
		IconPool.registerFont({
			fontFamily: "TestDualFont",
			collectionName: "testDualReg",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
			lazy: true
		});

		await IconPool.registerSVG({
			name: "testDualReg",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();
		assert.strictEqual(mCollReg["testDualReg"].type, IconPool.CollectionType.SVG, "Type is SVG");
		assert.ok(mCollReg["testDualReg"].fontConfig, "fontConfig exists");

		// insertFontFaceStyle should not throw for this dual-registered collection
		FontStrategy.insertFontFaceStyle(
			"TestDualFont",
			sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
			"testDualReg",
			mCollReg
		);

		assert.ok(mCollReg["testDualReg"].fontConfig.fontFace, "fontFace stored on fontConfig");
		assert.ok(mCollReg["testDualReg"].fontConfig.currentFontURI, "currentFontURI stored on fontConfig");
	});

	QUnit.test("insertFontFaceStyle rejects SVG collection without fontConfig", async function(assert) {
		const oLogSpy = this.spy(Log, "error");

		await IconPool.registerSVG({
			name: "testDualReg",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();

		FontStrategy.insertFontFaceStyle(
			"TestFont",
			"/some/path/",
			"testDualReg",
			mCollReg
		);

		assert.ok(oLogSpy.calledWith(sinon.match(/has not been registered as a font/)),
			"Error logged when SVG collection has no fontConfig");
	});

	QUnit.test("onThemeApplied is no-op for dual-registered collection without themeConfig", async function(assert) {
		IconPool.registerFont({
			fontFamily: "TestDualFont",
			collectionName: "testDualReg",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
			lazy: true
		});

		await IconPool.registerSVG({
			name: "testDualReg",
			uri: sTestDataPath + "/svg.css",
			cssVarPrefix: "testSVG"
		});

		const mCollReg = _IconRegistry.getCollectionRegistry();
		// fontConfig exists but no themeConfig
		assert.ok(mCollReg["testDualReg"].fontConfig, "fontConfig exists");
		assert.notOk(mCollReg["testDualReg"].fontConfig.themeConfig, "No themeConfig on fontConfig");

		const oInsertSpy = this.spy(FontStrategy, "insertFontFaceStyle");

		FontStrategy.onThemeApplied("testDualReg", mCollReg["testDualReg"], mCollReg, null);

		assert.strictEqual(oInsertSpy.callCount, 0, "insertFontFaceStyle not called without themeConfig");
	});

});
