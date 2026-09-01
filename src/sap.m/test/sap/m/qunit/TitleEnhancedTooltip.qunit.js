/*global QUnit, sinon */
sap.ui.define([
	"sap/m/Title",
	"sap/m/Link",
	"sap/ui/core/Title",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/core/tooltip/Tooltip",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Title, Link, CoreTitle, ControlBehavior, TooltipEnablement, Tooltip, nextUIUpdate) {
	"use strict";

	function hoverAndGetTooltipText(oTitle) {
		return getTooltipTextForInteraction(oTitle, function() {
			oTitle.getDomRef().dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
		});
	}

	function focusAndGetTooltipText(oTitle) {
		const oDomRef = oTitle.getDomRef();
		const fnOrigMatches = oDomRef.matches;
		oDomRef.matches = function(sSelector) {
			return sSelector === ":focus-visible" || fnOrigMatches.call(this, sSelector);
		};

		try {
			return getTooltipTextForInteraction(oTitle, function() {
				document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
				oDomRef.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
			});
		} finally {
			oDomRef.matches = fnOrigMatches;
		}
	}

	function getTooltipTextForInteraction(oTitle, fnInteract) {
		const oOpenByStub = sinon.stub(Tooltip.prototype, "openBy");
		try {
			fnInteract();
			return oOpenByStub.called ? oOpenByStub.thisValues[0].getText() : "";
		} finally {
			oOpenByStub.restore();
		}
	}

	async function whenTabIndexSettled(oClock, oTitle) {
		oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(oClock);
		await oClock.tickAsync(1);
		const oDomRef = oTitle.getDomRef();
		return oDomRef ? oDomRef.getAttribute("tabindex") : null;
	}

	async function destroyAndDrain(oClock, oTitle) {
		if (oTitle) {
			oTitle.destroy();
		}
		await oClock.tickAsync(2000);
	}

	QUnit.module("Enhanced Tooltip - Rendering and Interaction", {
		beforeEach: function() {
			this.oTitle = new Title({
				text: "This is a very long title that will definitely be truncated when the width is constrained",
				width: "200px"
			});
		},
		afterEach: async function() {
			await destroyAndDrain(this.clock, this.oTitle);
			this.oTitle = null;
		}
	});

	QUnit.test("Tooltip is not shown on render, only on interaction (lazy evaluation)", async function(assert) {
		const oOpenByStub = sinon.stub(Tooltip.prototype, "openBy");
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		assert.notOk(oOpenByStub.called,
			"no tooltip open is triggered from rendering alone - it is only resolved on user interaction");
		oOpenByStub.restore();
	});

	QUnit.test("Hovering a truncated title shows its text as a tooltip", async function(assert) {
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const sText = hoverAndGetTooltipText(this.oTitle);
		assert.strictEqual(sText, this.oTitle.getText(),
			"the truncated title's text is shown as a tooltip on hover");
	});

	QUnit.test("Focusing a title with a tooltip shows the tooltip", async function(assert) {
		ControlBehavior.setExtendedKeyboardNavigationEnabled(true);

		const oTitle = new Title({
			text: "This is a very long title that will definitely be truncated when the width is constrained",
			width: "200px",
			tooltip: "Custom tooltip"
		});

		try {
			await whenTabIndexSettled(this.clock, oTitle);

			const sText = focusAndGetTooltipText(oTitle);
			assert.strictEqual(sText, "Custom tooltip",
				"the tooltip is shown when the focusable title receives keyboard focus");
		} finally {
			await destroyAndDrain(this.clock, oTitle);
			ControlBehavior.setExtendedKeyboardNavigationEnabled(false);
		}
	});

	QUnit.test("Rendering a title does not force truncation measurement (no layout thrashing)", async function(assert) {
		// Truncation is measured by reading scrollWidth/clientWidth on the rendered node.
		// Spy those getters on the shared prototype so any measurement during render is caught.
		const oScrollWidthDesc = Object.getOwnPropertyDescriptor(Element.prototype, "scrollWidth");
		const oClientWidthDesc = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth");
		const oScrollSpy = sinon.spy(oScrollWidthDesc, "get");
		const oClientSpy = sinon.spy(oClientWidthDesc, "get");
		Object.defineProperty(Element.prototype, "scrollWidth", oScrollWidthDesc);
		Object.defineProperty(Element.prototype, "clientWidth", oClientWidthDesc);

		this.oTitle.placeAt("qunit-fixture");
		await this.clock.tickAsync(2000);

		const iMeasurements = oScrollSpy.callCount + oClientSpy.callCount;

		assert.strictEqual(iMeasurements, 0,
			"no scrollWidth/clientWidth read while rendering - truncation is deferred to interaction, so rendering does not thrash layout");

		Object.defineProperty(Element.prototype, "scrollWidth", oScrollWidthDesc);
		Object.defineProperty(Element.prototype, "clientWidth", oClientWidthDesc);
	});

	QUnit.module("Enhanced Tooltip - Tooltip Text Resolution", {
		beforeEach: function() {
			this.oTitle = new Title({
				text: "Very long title text that will be truncated in narrow container",
				width: "150px"
			});
		},
		afterEach: async function() {
			await destroyAndDrain(this.clock, this.oTitle);
			this.oTitle = null;
		}
	});

	QUnit.test("Explicit tooltip takes precedence over truncation", async function(assert) {
		this.oTitle.setTooltip("Custom tooltip text");
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const sText = hoverAndGetTooltipText(this.oTitle);
		assert.strictEqual(sText, "Custom tooltip text",
			"the explicit tooltip is shown on hover even though the title text is truncated");
	});

	QUnit.test("Falls back to title text when truncated and no explicit tooltip", async function(assert) {
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const sText = hoverAndGetTooltipText(this.oTitle);
		assert.strictEqual(sText, this.oTitle.getText(),
			"the truncated title's own text is shown on hover when there is no explicit tooltip");
	});

	QUnit.test("Returns empty string when not truncated and no explicit tooltip", async function(assert) {
		const oShortTitle = new Title({
			text: "Short",
			width: "200px"
		});

		oShortTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const sText = hoverAndGetTooltipText(oShortTitle);
		assert.strictEqual(sText, "",
			"no tooltip is shown on hover when the title fits and has no explicit tooltip");
		oShortTitle.destroy();
	});

	QUnit.test("Uses association title text when truncated", async function(assert) {
		const oCoreTitle = new CoreTitle({
			text: "Core title text that is long enough to truncate"
		});

		const oTitleWithAssoc = new Title({
			width: "100px",
			title: oCoreTitle
		});

		oTitleWithAssoc.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const sText = hoverAndGetTooltipText(oTitleWithAssoc);
		assert.strictEqual(sText, "Core title text that is long enough to truncate",
			"the associated core Title's text is shown on hover when the title is truncated");
		oTitleWithAssoc.destroy();
		oCoreTitle.destroy();
	});

	QUnit.module("Enhanced Tooltip - Focusability", {
		beforeEach: function() {
			ControlBehavior.setExtendedKeyboardNavigationEnabled(true);
		},
		afterEach: async function() {
			ControlBehavior.setExtendedKeyboardNavigationEnabled(false);
			await destroyAndDrain(this.clock, this.oTitle);
			this.oTitle = null;
		}
	});

	QUnit.test("Title is not focusable when Extended Keyboard Navigation is disabled", async function(assert) {
		ControlBehavior.setExtendedKeyboardNavigationEnabled(false);

		this.oTitle = new Title({
			text: "Title text",
			tooltip: "Custom tooltip"
		});

		const sTabIndex = await whenTabIndexSettled(this.clock, this.oTitle);
		assert.strictEqual(sTabIndex, null,
			"no tabindex is rendered when Extended Keyboard Navigation is disabled");
	});

	QUnit.test("Title is focusable with an explicit tooltip and Extended Keyboard Navigation enabled", async function(assert) {
		this.oTitle = new Title({
			text: "Title text",
			tooltip: "Custom tooltip"
		});

		const sTabIndex = await whenTabIndexSettled(this.clock, this.oTitle);
		assert.strictEqual(sTabIndex, "0",
			"tabindex='0' is rendered for a title with an explicit tooltip");
	});

	QUnit.test("Title is not focusable when it has no explicit tooltip", async function(assert) {
		this.oTitle = new Title({
			text: "Title text without tooltip"
		});

		const sTabIndex = await whenTabIndexSettled(this.clock, this.oTitle);
		assert.strictEqual(sTabIndex, null,
			"no tabindex is rendered for a fitting title without an explicit tooltip");
	});

	QUnit.test("Title is not focusable when a content control is used", async function(assert) {
		const oLink = new Link({
			text: "Link"
		});

		this.oTitle = new Title({
			tooltip: "Custom tooltip",
			content: oLink
		});

		const sTabIndex = await whenTabIndexSettled(this.clock, this.oTitle);
		assert.strictEqual(sTabIndex, null,
			"no tabindex is rendered when a content control is used, since the content is already focusable");
	});

	QUnit.test("tabindex is set after rendering when focusable", async function(assert) {
		this.oTitle = new Title({
			text: "Title with tooltip",
			tooltip: "Custom tooltip"
		});

		const sTabIndex = await whenTabIndexSettled(this.clock, this.oTitle);
		assert.strictEqual(sTabIndex, "0",
			"tabindex='0' is set after rendering for a focusable title");
	});

	QUnit.test("tabindex is removed when title becomes non-focusable", async function(assert) {
		this.oTitle = new Title({
			text: "Short",
			tooltip: "Custom tooltip"
		});

		await whenTabIndexSettled(this.clock, this.oTitle);

		this.oTitle.setTooltip("");
		await nextUIUpdate(this.clock);
		await this.clock.tickAsync(1);

		const oDomRef = this.oTitle.getDomRef();
		assert.notOk(oDomRef.hasAttribute("tabindex"),
			"tabindex is removed once the tooltip is cleared and the title is no longer focusable");
	});

	QUnit.module("Enhanced Tooltip - ARIA aria-describedby", {
		beforeEach: function() {
			this.oTitle = new Title({
				text: "Title text",
				tooltip: "Custom tooltip"
			});
		},
		afterEach: async function() {
			await destroyAndDrain(this.clock, this.oTitle);
			this.oTitle = null;
		}
	});

	QUnit.test("aria-describedby is rendered when explicit tooltip exists", async function(assert) {
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const oDomRef = this.oTitle.getDomRef();
		const sAriaDescribedBy = oDomRef.getAttribute("aria-describedby");

		assert.ok(sAriaDescribedBy && sAriaDescribedBy.length > 0,
			"aria-describedby attribute is present when explicit tooltip exists");

		const aIds = sAriaDescribedBy.split(" ");
		const bFoundInvisibleText = aIds.some(function(sId) {
			const oElement = document.getElementById(sId);
			return oElement && oElement.textContent === "Custom tooltip";
		});

		assert.ok(bFoundInvisibleText,
			"Invisible text element with tooltip content exists in DOM");
	});

	QUnit.test("aria-describedby is NOT rendered for auto-generated truncation tooltip", async function(assert) {
		const oTruncatedTitle = new Title({
			text: "Very long title text that will be truncated",
			width: "100px"
		});

		oTruncatedTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const oDomRef = oTruncatedTitle.getDomRef();
		const sAriaDescribedBy = oDomRef.getAttribute("aria-describedby");

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
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		this.oTitle.setTooltip("Updated tooltip");
		await nextUIUpdate(this.clock);

		const oDomRef = this.oTitle.getDomRef();
		const sAriaDescribedBy = oDomRef.getAttribute("aria-describedby");

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

	QUnit.test("Own tooltip is used over the association when a content control is present", async function(assert) {
		// With a content control the association is ignored, so the invisible aria
		// text must come from the Title's own tooltip, not the association's.
		const oCoreTitle = new CoreTitle({
			text: "Core title text",
			tooltip: "Association tooltip"
		});
		const oLink = new Link({
			text: "Link text"
		});
		const oTitleWithContent = new Title({
			text: "Own text",
			tooltip: "Own tooltip",
			width: "100px",
			title: oCoreTitle,
			content: oLink
		});

		oTitleWithContent.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const sAriaDescribedBy = oTitleWithContent.getDomRef().getAttribute("aria-describedby");
		const aIds = sAriaDescribedBy ? sAriaDescribedBy.split(" ") : [];

		const bFoundOwnTooltip = aIds.some(function(sId) {
			const oElement = document.getElementById(sId);
			return oElement && oElement.textContent === "Own tooltip";
		});
		const bFoundAssociationTooltip = aIds.some(function(sId) {
			const oElement = document.getElementById(sId);
			return oElement && oElement.textContent === "Association tooltip";
		});

		assert.ok(bFoundOwnTooltip,
			"the invisible aria text is the Title's own tooltip when a content control is present");
		assert.notOk(bFoundAssociationTooltip,
			"the association's tooltip is not used when a content control is present");

		oTitleWithContent.destroy();
		oCoreTitle.destroy();
		oLink.destroy();
	});

	QUnit.module("Enhanced Tooltip - Tooltip Anchor Positioning", {
		afterEach: async function() {
			await destroyAndDrain(this.clock, this.oTitle);
			this.oTitle = null;
		}
	});

	QUnit.test("Tooltip anchors to the text when the title is not truncated", async function(assert) {
		// Short text in a wide container: the anchor is the inner text span, not the
		// wide container. Hovering the container's empty area (outside the text) must
		// therefore not open the tooltip - it would appear detached from the text.
		this.oTitle = new Title({
			text: "Short",
			tooltip: "Custom tooltip",
			width: "500px"
		});
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const sText = hoverAndGetTooltipText(this.oTitle);
		assert.strictEqual(sText, "",
			"hovering the empty area of the wide container does not open the tooltip - it is anchored to the text, not the container");
	});

	QUnit.test("Tooltip anchors to the container when the title is truncated", async function(assert) {
		// Long text in a narrow container: the anchor is the container itself, so
		// hovering it opens the tooltip (the text fills the whole container).
		this.oTitle = new Title({
			text: "Very long title text that will definitely be truncated",
			tooltip: "Custom tooltip",
			width: "100px"
		});
		this.oTitle.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const sText = hoverAndGetTooltipText(this.oTitle);
		assert.strictEqual(sText, "Custom tooltip",
			"hovering the truncated title opens the tooltip - it is anchored to the container");
	});
});
