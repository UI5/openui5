/*global QUnit */
sap.ui.define([
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/ui/core/_IconRegistry",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/test/utils/nextUIUpdate"
], function(Icon, IconPool, _IconRegistry, qutils, nextUIUpdate) {
	"use strict";

	async function createIcon(mSettings) {
		const oIcon = new Icon(mSettings);
		oIcon.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oIcon;
	}

	// =========================================================================
	QUnit.module("SVG Icon Rendering", {
		before: function() {
			return IconPool.collectionReady();
		},
		afterEach: function() {
			if (this.oIcon) {
				this.oIcon.destroy();
				this.oIcon = null;
			}
		}
	});

	QUnit.test("Icon renders with sapUiIconSVG class for SVG source", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		const oDomRef = this.oIcon.getDomRef();
		assert.ok(oDomRef.classList.contains("sapUiIconSVG"), "sapUiIconSVG class present");
		assert.ok(oDomRef.classList.contains("sapUiIconSVGMask"), "sapUiIconSVGMask class present");
		assert.ok(oDomRef.classList.contains("sapUiIcon"), "sapUiIcon class also present");
	});

	QUnit.test("Icon renders mask-image CSS variable via custom property", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		const oDomRef = this.oIcon.getDomRef();
		assert.ok(oDomRef.style.cssText.indexOf("--sapUiIconSVGMaskUrl") !== -1, "CSS custom property for mask URL applied: " + oDomRef.style.cssText);
		assert.ok(oDomRef.style.cssText.indexOf("--sapIcons_accept") !== -1, "Correct CSS variable referenced");
	});

	QUnit.test("Icon does NOT render inner <svg> element", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		const oDomRef = this.oIcon.getDomRef();
		assert.notOk(oDomRef.querySelector("svg"), "No inner <svg> element");
	});

	QUnit.test("Icon renders data-sap-ui-icon-content for font backward compat", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		const oDomRef = this.oIcon.getDomRef();
		assert.ok(oDomRef.hasAttribute("data-sap-ui-icon-content"),
			"data-sap-ui-icon-content present for SVG icon with font compat data");
	});

	QUnit.test("Icon does NOT render font-family style", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		const oDomRef = this.oIcon.getDomRef();
		assert.strictEqual(oDomRef.style.fontFamily, "", "No font-family style for SVG icon");
	});

	QUnit.test("Icon does NOT render data-sap-ui-icon-collection for built-in", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		const oDomRef = this.oIcon.getDomRef();
		assert.strictEqual(oDomRef.getAttribute("data-sap-ui-icon-collection"), null,
			"No data-sap-ui-icon-collection for built-in icons");
	});

	QUnit.test("Size applied via font-size on outer span", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept", size: "2rem" });
		const oDomRef = this.oIcon.getDomRef();
		assert.strictEqual(oDomRef.style.fontSize, "2rem", "font-size applied");
	});

	// =========================================================================
	QUnit.module("SVG Icon Source Changes", {
		before: function() {
			return IconPool.collectionReady();
		},
		afterEach: function() {
			if (this.oIcon) {
				this.oIcon.destroy();
				this.oIcon = null;
			}
		}
	});

	QUnit.test("Changing src between SVG icons updates mask-image variable", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		let oDomRef = this.oIcon.getDomRef();
		assert.ok(oDomRef.style.cssText.indexOf("--sapIcons_accept") !== -1, "Initial mask-image references accept");

		this.oIcon.setSrc("sap-icon://add");
		await nextUIUpdate();
		oDomRef = this.oIcon.getDomRef();
		assert.ok(oDomRef.style.cssText.indexOf("--sapIcons_add") !== -1, "Updated mask-image references add");
	});

	QUnit.test("Tooltip updates when SVG icon src changes", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		this.oIcon.setSrc("sap-icon://add");
		await nextUIUpdate();
		assert.ok(this.oIcon.getDomRef(), "Icon still rendered after src change");
	});

	// =========================================================================
	QUnit.module("SVG Icon RTL", {
		before: function() {
			return IconPool.collectionReady();
		},
		afterEach: function() {
			if (this.oIcon) {
				this.oIcon.destroy();
				this.oIcon = null;
			}
		}
	});

	QUnit.test("Built-in SVG icons have suppressMirroring=true", function(assert) {
		const oInfo = IconPool.getIconInfo("sap-icon://accept");
		assert.strictEqual(oInfo.suppressMirroring, true, "suppressMirroring is true");
	});

	QUnit.test("sapUiIconMirrorInRTL NOT added for SVG icons", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://accept" });
		const oDomRef = this.oIcon.getDomRef();
		assert.notOk(oDomRef.classList.contains("sapUiIconMirrorInRTL"),
			"sapUiIconMirrorInRTL not added (RTL handled by CSS :dir(rtl))");
	});

	// =========================================================================
	QUnit.module("SVG Icon Interaction", {
		before: function() {
			return IconPool.collectionReady();
		},
		afterEach: function() {
			if (this.oIcon) {
				this.oIcon.destroy();
				this.oIcon = null;
			}
		}
	});

	QUnit.test("SVG icon supports press events", async function(assert) {
		let bPressed = false;
		this.oIcon = await createIcon({
			src: "sap-icon://accept",
			press: function() { bPressed = true; }
		});
		const oDomRef = this.oIcon.getDomRef();
		assert.ok(oDomRef.classList.contains("sapUiIconPointer"), "Pointer class added");
		qutils.triggerEvent("click", oDomRef);
		assert.ok(bPressed, "Press event fired on click");
	});

	QUnit.test("SVG icon has correct tabindex when press handler attached", async function(assert) {
		this.oIcon = await createIcon({
			src: "sap-icon://accept",
			press: function() {}
		});
		const oDomRef = this.oIcon.getDomRef();
		assert.strictEqual(oDomRef.getAttribute("tabindex"), "0", "tabindex=0 for interactive SVG icon");
	});

	// =========================================================================
	QUnit.module("SVG Icon with Custom Collection", {
		before: function() {
			return IconPool.registerSVG({
				name: "testIconColl",
				uri: sap.ui.require.toUrl("test-resources/sap/ui/core/qunit/testdata/iconsvg/svg.css"),
				cssVarPrefix: "testSVG"
			});
		},
		afterEach: function() {
			if (this.oIcon) {
				this.oIcon.destroy();
				this.oIcon = null;
			}
		}
	});

	QUnit.test("Icon with custom SVG collection renders data-sap-ui-icon-collection", async function(assert) {
		this.oIcon = await createIcon({ src: "sap-icon://testIconColl/icon-alpha" });
		const oDomRef = this.oIcon.getDomRef();
		assert.ok(oDomRef, "Icon rendered");
		assert.strictEqual(oDomRef.getAttribute("data-sap-ui-icon-collection"), "testIconColl",
			"data-sap-ui-icon-collection attribute present");
		assert.ok(oDomRef.classList.contains("sapUiIconSVGMask"), "sapUiIconSVGMask class present");
		assert.ok(oDomRef.style.cssText.indexOf("--testSVG_icon-alpha") !== -1,
			"CSS custom property references correct collection prefix");
	});
});
