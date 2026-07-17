sap.ui.require([
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Text",
	"sap/ui/core/tooltip/Tooltip",
	"sap/m/library",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/Device"
], async function (Button, Link, Text, Tooltip, mLibrary, TooltipEnablement, Core, Element, Device) {
	"use strict";

	const PlacementType = mLibrary.PlacementType;

	await Core.ready();

	// Materialize a sap.m.Button into every placeholder in the page. The HTML
	// declares each Button as <div data-sap-m-button data-button-id="..." data-text="...">.
	// The host div is given an id so placeAt() can resolve it as a UIArea container.
	document.querySelectorAll("[data-sap-m-button]").forEach(function (oHost) {
		const sId = oHost.getAttribute("data-button-id");
		const sText = oHost.getAttribute("data-text") || "";
		const sHostId = sId + "-host";
		oHost.id = sHostId;
		new Button(sId, { text: sText }).placeAt(sHostId);
	});

	// Attach a TooltipEnablement helper to the given control. The helper
	// only takes textProvider/invisibleTextProvider/enableForTouchDevices —
	// placement and delay scenarios go through attachPlacement() below using
	// sap.ui.core.tooltip.Tooltip directly.
	function attach(oControl, mSettings) {
		if (!oControl) {
			return null;
		}
		const oConfig = {};
		if (mSettings.text !== undefined) {
			const sText = mSettings.text;
			oConfig.textProvider = () => sText;
		}
		if (mSettings.enableForTouchDevices !== undefined) {
			oConfig.enableForTouchDevices = mSettings.enableForTouchDevices;
		}
		return new TooltipEnablement(oControl, oConfig);
	}

	// Wires a sap.ui.core.tooltip.Tooltip directly onto a control's DOM for scenarios that
	// vary placement or delay — those settings are no longer part of the
	// TooltipEnablement API. Listens to mouseenter/mouseleave and focusin/
	// focusout on desktop only; this is enough to exercise placement and
	// open-delay behavior of sap.ui.core.tooltip.Tooltip itself.
	function attachPlacement(oControl, mSettings) {
		if (!oControl) {
			return null;
		}
		const oTooltip = new Tooltip({
			text: mSettings.text,
			placement: mSettings.placement,
			delay: mSettings.delay !== undefined ? mSettings.delay : 500
		});
		oControl.addEventDelegate({
			onAfterRendering: function () {
				const oDomRef = oControl.getDomRef();
				if (!oDomRef) {
					return;
				}
				oDomRef.addEventListener("mouseenter", function () {
					oTooltip.openBy(oControl);
				});
				oDomRef.addEventListener("mouseleave", function () {
					oTooltip.close();
				});
				oDomRef.addEventListener("focusin", function () {
					if (oDomRef.matches && oDomRef.matches(":focus-visible")) {
						oTooltip.openBy(oControl);
					}
				});
				oDomRef.addEventListener("focusout", function () {
					oTooltip.close();
				});
			}
		});
		return oTooltip;
	}

	// --- Text and default placement ---
	attach(Element.getElementById("btn-default"),   { text: "Default tooltip" });
	attach(Element.getElementById("btn-short"),     { text: "Short" });
	attach(Element.getElementById("btn-long"),      { text: "This is a noticeably longer tooltip text used to verify wrapping behavior." });
	attach(Element.getElementById("btn-very-long"), {
		text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra hendrerit convallis. " +
			"Mauris quis est metus. Curabitur convallis vel arcu id cursus. Maecenas augue neque, lacinia sed " +
			"pulvinar eu, malesuada sagittis mauris. Praesent malesuada erat vel tortor dictum, non tempor " +
			"mauris finibus. Sed eu porttitor velit, quis consequat lectus. Fusce volutpat nisl augue, eget " +
			"dictum mi dictum sit amet."
	});

	// --- Placement (every PlacementType value) — exercised via sap.ui.core.tooltip.Tooltip directly ---
	attachPlacement(Element.getElementById("btn-top"),    { text: "Top",    placement: PlacementType.Top });
	attachPlacement(Element.getElementById("btn-bottom"), { text: "Bottom", placement: PlacementType.Bottom });
	attachPlacement(Element.getElementById("btn-left"),   { text: "Left",   placement: PlacementType.Left });
	attachPlacement(Element.getElementById("btn-right"),  { text: "Right",  placement: PlacementType.Right });

	attachPlacement(Element.getElementById("btn-vpt"),  { text: "VerticalPreferredTop",      placement: PlacementType.VerticalPreferredTop });
	attachPlacement(Element.getElementById("btn-vpb"),  { text: "VerticalPreferredBottom",   placement: PlacementType.VerticalPreferredBottom });
	attachPlacement(Element.getElementById("btn-hpl"),  { text: "HorizontalPreferredLeft",   placement: PlacementType.HorizontalPreferredLeft });
	attachPlacement(Element.getElementById("btn-hpr"),  { text: "HorizontalPreferredRight",  placement: PlacementType.HorizontalPreferredRight });

	attachPlacement(Element.getElementById("btn-ptof"), { text: "PreferredTopOrFlip",    placement: PlacementType.PreferredTopOrFlip });
	attachPlacement(Element.getElementById("btn-pbof"), { text: "PreferredBottomOrFlip", placement: PlacementType.PreferredBottomOrFlip });
	attachPlacement(Element.getElementById("btn-plof"), { text: "PreferredLeftOrFlip",   placement: PlacementType.PreferredLeftOrFlip });
	attachPlacement(Element.getElementById("btn-prof"), { text: "PreferredRightOrFlip",  placement: PlacementType.PreferredRightOrFlip });

	// --- Delay ---
	attachPlacement(Element.getElementById("btn-delay-0"),    { text: "Opens immediately (delay 0)",    delay: 0 });
	attachPlacement(Element.getElementById("btn-delay-500"),  { text: "Default 500ms delay",            delay: 500 });
	attachPlacement(Element.getElementById("btn-delay-1500"), { text: "Slow 1500ms delay",              delay: 1500 });

	// --- Programmatic API: openBy / close ---
	// This sample deliberately uses sap.ui.core.tooltip.Tooltip directly (not through
	// TooltipEnablement) to exercise the public openBy/close API.
	const oAnchor = Element.getElementById("btn-api-anchor");
	const oApiTooltip = new Tooltip({ text: "Opened programmatically via Tooltip#openBy" });
	Element.getElementById("btn-api-open").attachPress(function () {
		oApiTooltip.openBy(oAnchor, 0);
	});
	Element.getElementById("btn-api-close").attachPress(function () {
		oApiTooltip.close(0);
	});

	// --- Text with tooltip (no focus, no extended tab chain) ---
	// Inline sap.m.Text inside the paragraph. The Text renders as a <span>
	// so it stays inline in the surrounding prose.
	new Text("txt-tooltip", {
		text: "this is a longer highlighted phrase used for testing text selection"
	}).addStyleClass("text-with-tooltip").placeAt("txt-tooltip-host");
	attach(Element.getElementById("txt-tooltip"), { text: "Tooltip on plain (non-focusable) text" });

	// --- Focusable text with tooltip (isolated) ---
	// sap.m.Text doesn't expose a tabindex property; we set it directly on the
	// DOM after first render so the keyboard-focus path is exercised here too.
	const oFocusText = new Text("txt-tooltip-focus", {
		text: "this is a longer focusable phrase used for testing focus and text selection"
	}).addStyleClass("demo").placeAt("txt-tooltip-focus-host");
	oFocusText.addEventDelegate({
		onAfterRendering: function () {
			oFocusText.getDomRef().tabIndex = 0;
		}
	});
	attach(oFocusText, { text: "Tooltip on focusable text (Tab to focus, hover, or long-press)" });

	// --- Right-click on selected text ---
	const oRClickText = new Text("span-rclick", {
		text: "Selectable text with a tooltip"
	}).addStyleClass("demo").placeAt("span-rclick-host");
	oRClickText.addEventDelegate({
		onAfterRendering: function () {
			oRClickText.getDomRef().tabIndex = 0;
		}
	});
	attach(oRClickText, { text: "Tooltip on selectable text — should not open while text is selected" });

	// --- Links: mobile long-press behavior ---
	// Tooltips on sap.m.Link are automatically disabled on touch-only devices
	// (per design) so the native browser context menu remains accessible on
	// long-press.
	new Link("link-tooltip", {
		text: "SAP",
		href: "https://sap.com",
		target: "_blank"
	}).addStyleClass("demo").placeAt("link-tooltip-host");
	attach(Element.getElementById("link-tooltip"), {
		text: "Tooltip on a link (desktop only, disabled for touch-only devices)",
		enableForTouchDevices: false
	});

	new Link("link-long", {
		text: "SAP (long tooltip)",
		href: "https://sap.com",
		target: "_blank"
	}).addStyleClass("demo").placeAt("link-long-host");
	attach(Element.getElementById("link-long"), {
		text: "A noticeably longer tooltip text shown on a link to verify wrapping " +
			"and placement on desktop.",
		enableForTouchDevices: false
	});

	// --- Viewport corners (auto-flip placement) ---
	attachPlacement(Element.getElementById("btn-corner-tl"), { text: "Tooltip flips to bottom because there is no space above", placement: PlacementType.Top });
	attachPlacement(Element.getElementById("btn-corner-tr"), { text: "Tooltip flips to left because there is no space on the right", placement: PlacementType.Right });
	attachPlacement(Element.getElementById("btn-corner-bl"), { text: "Tooltip flips to right because there is no space on the left", placement: PlacementType.Left });
	attachPlacement(Element.getElementById("btn-corner-br"), { text: "Tooltip flips to top because there is no space below", placement: PlacementType.Bottom });

	const oCornerToggle = document.getElementById("cb-corners");
	const oCornerHost = document.getElementById("viewport-corners");
	if (oCornerToggle && oCornerHost) {
		oCornerToggle.addEventListener("change", function () {
			oCornerHost.hidden = !oCornerToggle.checked;
		});
	}

	// --- Activation banners (auto-detected on touch devices) ---
	// On touch devices we surface two banners that make the per-gesture behavior
	// visible without a manual toggle:
	//   • Blue "Activated" — fires on a short tap (the demo's natural click).
	//   • Red  "Long press" — fires when a touch survives past the tooltip open
	//     delay; this is the gesture the tooltip rides on.
	const oBanner = document.getElementById("activation-banner");
	const oLongPressBanner = document.getElementById("long-press-banner");
	const bIsTouchOnly = Device.support.touch && !Device.system.desktop && !Device.system.combi;
	const LONG_PRESS_DELAY = 500;

	let iBannerTimeout;
	function showBanner(oEl, sText) {
		if (!oEl) {
			return;
		}
		oEl.textContent = sText;
		oEl.hidden = false;
		clearTimeout(iBannerTimeout);
		iBannerTimeout = setTimeout(function () { oEl.hidden = true; }, 1500);
	}

	if (bIsTouchOnly) {
		let iLongPressTimer;
		let bLongPressFired = false;

		document.body.addEventListener("touchstart", function (oEvent) {
			const oTarget = oEvent.target.closest(".demo, .demo-host, .text-with-tooltip");
			if (!oTarget) {
				return;
			}
			bLongPressFired = false;
			clearTimeout(iLongPressTimer);
			iLongPressTimer = setTimeout(function () {
				bLongPressFired = true;
				showBanner(oLongPressBanner, "Long press: " + (oTarget.id || oTarget.tagName.toLowerCase()));
			}, LONG_PRESS_DELAY);
		}, { passive: true });

		["touchmove", "touchcancel"].forEach(function (sType) {
			document.body.addEventListener(sType, function () {
				clearTimeout(iLongPressTimer);
			}, { passive: true });
		});

		document.body.addEventListener("touchend", function () {
			clearTimeout(iLongPressTimer);
		}, { passive: true });

		document.body.addEventListener("click", function (oEvent) {
			const oTarget = oEvent.target.closest(".demo, .demo-host, .text-with-tooltip");
			if (!oTarget) {
				return;
			}
			if (bLongPressFired) {
				bLongPressFired = false;
				return;
			}
			if (oTarget.tagName === "A") {
				oEvent.preventDefault();
			}
			showBanner(oBanner, "Activated: " + (oTarget.id || oTarget.tagName.toLowerCase()));
		});
	}
});
