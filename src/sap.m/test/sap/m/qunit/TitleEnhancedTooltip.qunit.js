/*global QUnit, sinon */
sap.ui.define([
	"sap/m/Title",
	"sap/m/Link",
	"sap/ui/core/Title",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/test/utils/nextUIUpdate"
], function(Title, Link, CoreTitle, ControlBehavior, TooltipEnablement, nextUIUpdate) {
	"use strict";

	QUnit.module("Enhanced Tooltip Performance", {
		beforeEach: function() {
			this.oTitle = new Title({
				text: "This is a very long title that will definitely be truncated when the width is constrained",
				width: "200px"
			});
		},
		afterEach: function() {
			if (this.oTitle) {
				this.oTitle.destroy();
				this.oTitle = null;
			}
		}
	});

	QUnit.test("_isTextTruncated is NOT called during rendering (lazy evaluation)", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		const oSpy = sinon.spy(this.oTitle, "_isTextTruncated");

		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oSpy.callCount, 0,
			"_isTextTruncated was not called synchronously during rendering - lazy evaluation works correctly");
	});

	QUnit.test("_isTextTruncated IS called on mouseover interaction", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oSpy = sinon.spy(this.oTitle, "_isTextTruncated");

		this.oTitle.$().trigger("mouseover");

		assert.ok(oSpy.callCount > 0,
			"_isTextTruncated was called on mouseover interaction (callCount: " + oSpy.callCount + ")");
	});

	QUnit.test("_isTextTruncated IS called on focus interaction (when focusable)", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		const oFocusableTitle = new Title({
			text: "This is a very long title that will definitely be truncated when the width is constrained",
			width: "200px",
			tooltip: "Custom tooltip"
		});

		oFocusableTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const done = assert.async();
		setTimeout(function() {
			const oDomRef = oFocusableTitle.getDomRef();
			const bHasTabIndex = oDomRef && oDomRef.hasAttribute("tabindex");

			if (!bHasTabIndex) {
				oFocusableTitle.destroy();
				assert.ok(true, "Title not focusable (Extended Keyboard Navigation disabled) - test skipped");
				done();
				return;
			}

			const oSpy = sinon.spy(oFocusableTitle, "_isTextTruncated");

			oDomRef.focus();

			setTimeout(function() {
				assert.ok(oSpy.callCount > 0,
					"_isTextTruncated was called on focus interaction (callCount: " + oSpy.callCount + ")");

				oFocusableTitle.destroy();
				done();
			}, 100);
		}, 50);
	});

	QUnit.test("_getTooltipAnchorElement is NOT called during rendering (lazy evaluation)", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		const oSpy = sinon.spy(this.oTitle, "_getTooltipAnchorElement");

		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oSpy.callCount, 0,
			"_getTooltipAnchorElement was not called synchronously during rendering - lazy evaluation works correctly (no DOM measurements during render)");
	});

	QUnit.test("Performance: No layout thrashing during batch rendering", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		const aTitles = [];
		for (let i = 0; i < 10; i++) {
			aTitles.push(new Title({
				text: "This is a very long title that will definitely be truncated when the width is constrained " + i,
				width: "200px"
			}));
		}

		const aTruncationSpies = aTitles.map(function(oTitle) {
			return sinon.spy(oTitle, "_isTextTruncated");
		});

		const aAnchorSpies = aTitles.map(function(oTitle) {
			return sinon.spy(oTitle, "_getTooltipAnchorElement");
		});

		aTitles.forEach(function(oTitle) {
			oTitle.placeAt("qunit-fixture");
		});
		await nextUIUpdate();

		const iTotalTruncationCalls = aTruncationSpies.reduce(function(sum, spy) {
			return sum + spy.callCount;
		}, 0);

		const iTotalAnchorCalls = aAnchorSpies.reduce(function(sum, spy) {
			return sum + spy.callCount;
		}, 0);

		assert.strictEqual(iTotalTruncationCalls, 0,
			"_isTextTruncated was not called during batch rendering of 10 titles (total: " + iTotalTruncationCalls + ")");

		assert.strictEqual(iTotalAnchorCalls, 0,
			"_getTooltipAnchorElement was not called during batch rendering of 10 titles (total: " + iTotalAnchorCalls + ") - no DOM measurements, no layout thrashing");

		aTitles.forEach(function(oTitle) {
			oTitle.destroy();
		});
	});

	QUnit.module("Enhanced Tooltip - Tooltip Text Resolution", {
		beforeEach: function() {
			this.oTitle = new Title({
				text: "Very long title text that will be truncated in narrow container",
				width: "150px"
			});
		},
		afterEach: function() {
			if (this.oTitle) {
				this.oTitle.destroy();
				this.oTitle = null;
			}
		}
	});

	QUnit.test("Explicit tooltip takes precedence over truncation", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.setTooltip("Custom tooltip text");
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const sTooltipText = this.oTitle._getEnhancedTooltipText();

		assert.strictEqual(sTooltipText, "Custom tooltip text",
			"Explicit tooltip is returned even if text is truncated");
	});

	QUnit.test("Falls back to title text when truncated and no explicit tooltip", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		sinon.stub(this.oTitle, "_isTextTruncated").returns(true);

		const sTooltipText = this.oTitle._getEnhancedTooltipText();

		assert.strictEqual(sTooltipText, this.oTitle.getText(),
			"Title text is returned when truncated and no explicit tooltip");
	});

	QUnit.test("Returns empty string when not truncated and no explicit tooltip", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		const oShortTitle = new Title({
			text: "Short",
			width: "200px"
		});

		oShortTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const sTooltipText = oShortTitle._getEnhancedTooltipText();

		assert.strictEqual(sTooltipText, "",
			"Empty string returned when text is not truncated and no explicit tooltip");

		oShortTitle.destroy();
	});

	QUnit.test("Uses association title text when truncated", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		const oCoreTitle = new CoreTitle({
			text: "Core title text"
		});

		const oTitleWithAssoc = new Title({
			width: "100px",
			title: oCoreTitle
		});

		oTitleWithAssoc.placeAt("qunit-fixture");
		await nextUIUpdate();

		sinon.stub(oTitleWithAssoc, "_isTextTruncated").returns(true);

		const sTooltipText = oTitleWithAssoc._getEnhancedTooltipText();
		assert.strictEqual(sTooltipText, "Core title text",
			"Association title text is used when truncated");

		oTitleWithAssoc.destroy();
		oCoreTitle.destroy();
	});

	QUnit.test("Prefers own text over association when content aggregation is used", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		const oCoreTitle = new CoreTitle({
			text: "Core title text"
		});

		const oLink = new Link({
			text: "Link text"
		});

		const oTitleWithContent = new Title({
			text: "Own text",
			width: "100px",
			title: oCoreTitle,
			content: oLink
		});

		oTitleWithContent.placeAt("qunit-fixture");
		await nextUIUpdate();

		sinon.stub(oTitleWithContent, "_isTextTruncated").returns(true);

		const sTooltipText = oTitleWithContent._getEnhancedTooltipText();
		assert.strictEqual(sTooltipText, "Own text",
			"Own text is used when content aggregation is present, not association");

		oTitleWithContent.destroy();
		oCoreTitle.destroy();
		oLink.destroy();
	});

	QUnit.module("Enhanced Tooltip - Focusability", {
		beforeEach: function() {
			this._oExtendedKeyboardNavigationStub = null;
		},
		afterEach: function() {
			if (this.oTitle) {
				this.oTitle.destroy();
				this.oTitle = null;
			}
			if (this._oExtendedKeyboardNavigationStub) {
				this._oExtendedKeyboardNavigationStub.restore();
				this._oExtendedKeyboardNavigationStub = null;
			}
		}
	});

	QUnit.test("_shouldBeFocusable returns false when Extended Keyboard Navigation is disabled", function(assert) {
		const oTitle = new Title({
			text: "Title text",
			tooltip: "Custom tooltip"
		});

		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			oTitle.destroy();
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this._oExtendedKeyboardNavigationStub = sinon.stub(ControlBehavior, "isExtendedKeyboardNavigationEnabled").returns(false);

		const bShouldBeFocusable = oTitle._shouldBeFocusable();

		assert.strictEqual(bShouldBeFocusable, false,
			"Title is not focusable when Extended Keyboard Navigation is disabled");

		oTitle.destroy();
	});

	QUnit.test("_shouldBeFocusable returns true with explicit tooltip and Extended Keyboard Navigation enabled", function(assert) {
		const oTitle = new Title({
			text: "Title text",
			tooltip: "Custom tooltip"
		});

		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			oTitle.destroy();
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this._oExtendedKeyboardNavigationStub = sinon.stub(ControlBehavior, "isExtendedKeyboardNavigationEnabled").returns(true);

		const bShouldBeFocusable = oTitle._shouldBeFocusable();

		assert.strictEqual(bShouldBeFocusable, true,
			"Title is focusable with explicit tooltip and Extended Keyboard Navigation enabled");

		oTitle.destroy();
	});

	QUnit.test("_shouldBeFocusable returns false when no explicit tooltip", function(assert) {
		const oTitle = new Title({
			text: "Title text without tooltip"
		});

		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			oTitle.destroy();
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this._oExtendedKeyboardNavigationStub = sinon.stub(ControlBehavior, "isExtendedKeyboardNavigationEnabled").returns(true);

		const bShouldBeFocusable = oTitle._shouldBeFocusable();

		assert.strictEqual(bShouldBeFocusable, false,
			"Title is not focusable via _shouldBeFocusable when no explicit tooltip (truncation check happens separately)");

		oTitle.destroy();
	});

	QUnit.test("_shouldBeFocusable returns false when content aggregation is used", function(assert) {
		const oLink = new Link({
			text: "Link"
		});

		const oTitle = new Title({
			tooltip: "Custom tooltip",
			content: oLink
		});

		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			oTitle.destroy();
			oLink.destroy();
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this._oExtendedKeyboardNavigationStub = sinon.stub(ControlBehavior, "isExtendedKeyboardNavigationEnabled").returns(true);

		const bShouldBeFocusable = oTitle._shouldBeFocusable();

		assert.strictEqual(bShouldBeFocusable, false,
			"Title is not focusable when content aggregation is used (Link is already focusable)");

		oTitle.destroy();
		oLink.destroy();
	});

	QUnit.test("tabindex is set after rendering when focusable", async function(assert) {
		this._oExtendedKeyboardNavigationStub = sinon.stub(ControlBehavior, "isExtendedKeyboardNavigationEnabled").returns(true);

		const oTitle = new Title({
			text: "Title with tooltip",
			tooltip: "Custom tooltip"
		});

		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			oTitle.destroy();
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const done = assert.async();

		setTimeout(function() {
			const oDomRef = oTitle.getDomRef();
			const sTabIndex = oDomRef ? oDomRef.getAttribute("tabindex") : null;

			assert.strictEqual(sTabIndex, "0",
				"tabindex='0' is set after rendering for focusable title");

			oTitle.destroy();
			done();
		}, 50);
	});

	QUnit.test("tabindex is removed when title becomes non-focusable", async function(assert) {
		this._oExtendedKeyboardNavigationStub = sinon.stub(ControlBehavior, "isExtendedKeyboardNavigationEnabled").returns(true);

		const oTitle = new Title({
			text: "Short",
			tooltip: "Custom tooltip"
		});

		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			oTitle.destroy();
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const done = assert.async();

		// Wait for initial _updateTabIndex
		setTimeout(function() {

			oTitle.setTooltip("");
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;


			setTimeout(function() {
				const oDomRef = oTitle.getDomRef();
				const bHasTabIndex = oDomRef ? oDomRef.hasAttribute("tabindex") : false;

				assert.strictEqual(bHasTabIndex, false,
					"tabindex is removed when title becomes non-focusable");

				oTitle.destroy();
				done();
			}, 50);
		}, 50);
	});

	QUnit.module("Enhanced Tooltip - ARIA aria-describedby", {
		beforeEach: function() {
			this.oTitle = new Title({
				text: "Title text",
				tooltip: "Custom tooltip"
			});
		},
		afterEach: function() {
			if (this.oTitle) {
				this.oTitle.destroy();
				this.oTitle = null;
			}
		}
	});

	QUnit.test("Invisible text provider returns explicit tooltip", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();


		const sInvisibleText = this.oTitle._getTooltipText();

		assert.strictEqual(sInvisibleText, "Custom tooltip",
			"Invisible text provider returns explicit tooltip for aria-describedby");
	});

	QUnit.test("aria-describedby is rendered when explicit tooltip exists", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = this.oTitle.getDomRef();
		const sAriaDescribedBy = oDomRef ? oDomRef.getAttribute("aria-describedby") : null;

		assert.ok(sAriaDescribedBy && sAriaDescribedBy.length > 0,
			"aria-describedby attribute is present when explicit tooltip exists");


		if (sAriaDescribedBy) {
			const aIds = sAriaDescribedBy.split(" ");
			const bFoundInvisibleText = aIds.some(function(sId) {
				const oElement = document.getElementById(sId);
				return oElement && oElement.textContent === "Custom tooltip";
			});

			assert.ok(bFoundInvisibleText,
				"Invisible text element with tooltip content exists in DOM");
		}
	});

	QUnit.test("aria-describedby is NOT rendered for auto-generated truncation tooltip", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		const oTruncatedTitle = new Title({
			text: "Very long title text that will be truncated",
			width: "100px"

		});

		oTruncatedTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = oTruncatedTitle.getDomRef();
		const sAriaDescribedBy = oDomRef ? oDomRef.getAttribute("aria-describedby") : null;


		if (sAriaDescribedBy) {
			const aIds = sAriaDescribedBy.split(" ");
			const bFoundTitleText = aIds.some(function(sId) {
				const oElement = document.getElementById(sId);
				return oElement && oElement.textContent === oTruncatedTitle.getText();
			});

			assert.strictEqual(bFoundTitleText, false,
				"aria-describedby does not contain title text for auto-generated truncation tooltip");
		} else {
			assert.ok(true, "No aria-describedby attribute - correct for auto-generated tooltip");
		}

		oTruncatedTitle.destroy();
	});

	QUnit.test("Invisible text is updated when tooltip changes", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();


		this.oTitle.setTooltip("Updated tooltip");
		await nextUIUpdate();

		const oDomRef = this.oTitle.getDomRef();
		const sAriaDescribedBy = oDomRef ? oDomRef.getAttribute("aria-describedby") : null;

		assert.ok(sAriaDescribedBy, "aria-describedby still exists after tooltip change");

		if (sAriaDescribedBy) {
			const aIds = sAriaDescribedBy.split(" ");
			const bFoundUpdatedText = aIds.some(function(sId) {
				const oElement = document.getElementById(sId);
				return oElement && oElement.textContent === "Updated tooltip";
			});

			assert.ok(bFoundUpdatedText,
				"Invisible text element is updated with new tooltip content");
		}
	});

	QUnit.module("Enhanced Tooltip - Tooltip Anchor Positioning", {
		beforeEach: function() {
			this.oTitle = new Title({
				text: "Title text",
				tooltip: "Custom tooltip"
			});
		},
		afterEach: function() {
			if (this.oTitle) {
				this.oTitle.destroy();
				this.oTitle = null;
			}
		}
	});

	QUnit.test("_getTooltipAnchorElement returns inner span when text is not truncated", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.setWidth("500px");
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = this.oTitle.getDomRef();

		sinon.stub(oDomRef, "scrollWidth").value(100);
		sinon.stub(oDomRef, "clientWidth").value(100);

		const oAnchor = this.oTitle._getTooltipAnchorElement();
		const oInnerDomRef = this.oTitle.getDomRef("inner");

		assert.strictEqual(oAnchor, oInnerDomRef,
			"Anchor is inner span when text is not truncated");
	});

	QUnit.test("_getTooltipAnchorElement returns root element when text is truncated", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.setText("Very long title text that will definitely be truncated");
		this.oTitle.setWidth("100px");
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = this.oTitle.getDomRef();

		sinon.stub(oDomRef, "scrollWidth").value(200);
		sinon.stub(oDomRef, "clientWidth").value(100);

		const oAnchor = this.oTitle._getTooltipAnchorElement();

		assert.strictEqual(oAnchor, oDomRef,
			"Anchor is root element when text is truncated (prevents empty space tooltip)");
	});

	QUnit.test("_getTooltipAnchorElement returns available element when one is missing", async function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}

		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = this.oTitle.getDomRef();


		const oInnerSpan = this.oTitle.getDomRef("inner");
		if (oInnerSpan) {
			oInnerSpan.remove();
		}

		const oAnchor = this.oTitle._getTooltipAnchorElement();

		assert.strictEqual(oAnchor, oDomRef,
			"Anchor is root element when inner span is missing");
	});

	QUnit.test("_getTooltipAnchorElement returns null when control not rendered", function(assert) {
		if (!TooltipEnablement.isEnhancedTooltipEnabled()) {
			assert.ok(true, "Enhanced tooltip not enabled - test skipped");
			return;
		}


		const oAnchor = this.oTitle._getTooltipAnchorElement();

		assert.strictEqual(oAnchor, null,
			"Anchor is null when control is not rendered");
	});

	QUnit.module("Enhanced Tooltip - Truncation Detection", {
		beforeEach: function() {
			this.oTitle = new Title();
		},
		afterEach: function() {
			if (this.oTitle) {
				this.oTitle.destroy();
				this.oTitle = null;
			}
		}
	});

	QUnit.test("_isTextTruncated returns false when not rendered", function(assert) {
		const bIsTruncated = this.oTitle._isTextTruncated();

		assert.strictEqual(bIsTruncated, false,
			"Returns false when control is not rendered");
	});

	QUnit.test("_isTextTruncated returns true when scrollWidth > clientWidth", async function(assert) {
		this.oTitle.setText("Very long title text that will definitely be truncated in narrow container");
		this.oTitle.setWidth("100px");
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = this.oTitle.getDomRef();

		sinon.stub(oDomRef, "scrollWidth").value(200);
		sinon.stub(oDomRef, "clientWidth").value(100);

		const bIsTruncated = this.oTitle._isTextTruncated();

		assert.strictEqual(bIsTruncated, true,
			"Returns true when text is truncated (scrollWidth > clientWidth)");
	});

	QUnit.test("_isTextTruncated returns false when text fits in container", async function(assert) {
		this.oTitle.setText("Short");
		this.oTitle.setWidth("500px");
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate();

		const bIsTruncated = this.oTitle._isTextTruncated();

		assert.strictEqual(bIsTruncated, false,
			"Returns false when text fits in container");
	});
});
