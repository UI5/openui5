sap.ui.require([
	"sap/m/Tooltip",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/Device"
], async function (Tooltip, Button, mLibrary, Core, Element, Device) {
	"use strict";

	const PlacementType = mLibrary.PlacementType;

	// Wait for Core readiness explicitly so placeAt() runs against a fully-
	// initialized framework (data-sap-ui-onInit already gates on this, but
	// being explicit makes the timing obvious).
	await Core.ready();

	// Materialize a sap.m.Button into every placeholder in the page. The HTML
	// declares each Button as <div data-sap-m-button data-button-id="..." data-text="...">
	// so the markup carries the showcase layout while the actual control is
	// instantiated here from JS — Button.js itself is not modified.
	// The host div is given an id so placeAt() can resolve it as a UIArea
	// container by id (the most well-tested code path).
	document.querySelectorAll("[data-sap-m-button]").forEach(function (oHost) {
		const sId = oHost.getAttribute("data-button-id");
		const sText = oHost.getAttribute("data-text") || "";
		const sHostId = sId + "-host";
		oHost.id = sHostId;
		new Button(sId, { text: sText }).placeAt(sHostId);
	});

	// Wire the public Tooltip open/close API directly to the host DOM element
	// using native listeners. This is the same set of gestures Tooltip.attachEvent
	// uses internally (mouseenter/mouseleave/focusin/focusout/keydown/mousedown
	// on desktop & combi; touchstart/touchend/touchcancel/contextmenu on mobile-
	// only), but driven from the test page so neither sap.m.Tooltip nor sap.m.Button
	// needs to be modified to support a Tooltip attached from the outside.
	// `delay` and `disabledForMobile` are read fresh from the Tooltip on every
	// gesture (not captured at attach time) so setDelay()/setDisabledForMobile()
	// after attach take effect immediately — matching Tooltip.attachEvent's behavior.
	function attachNativeListeners(oDomRef, oTooltip) {
		// Detach previous handlers (if any) so re-renders don't double-bind.
		if (oDomRef._sapMTooltipListeners) {
			oDomRef._sapMTooltipListeners.forEach(function (a) {
				oDomRef.removeEventListener(a[0], a[1]);
			});
		}
		const aListeners = [];
		function on(sType, fnHandler) {
			oDomRef.addEventListener(sType, fnHandler);
			aListeners.push([sType, fnHandler]);
		}

		if (Device.system.desktop || Device.system.combi) {
			// Left mousedown (normal activation) closes the tooltip immediately.
			// Right mousedown is left to the browser's contextmenu gesture.
			on("mousedown", function (e) {
				if (e.button === 2) {
					return;
				}
				const oSel = window.getSelection && window.getSelection();
				if (oSel && oSel.toString().length > 0) {
					return;
				}
				oTooltip.close(0);
			});

			on("mouseenter", function () {
				const oSel = window.getSelection && window.getSelection();
				if (oSel && oSel.toString().length > 0) {
					return;
				}
				oTooltip.openBy(oDomRef, oTooltip.getDelay());
			});

			on("mouseleave", function () {
				oTooltip.close(oTooltip.getDelay());
			});

			// Open on keyboard focus only (not on initial programmatic focus).
			on("focusin", function () {
				if (oDomRef.matches && oDomRef.matches(":focus-visible")) {
					oTooltip.openBy(oDomRef, oTooltip.getDelay());
				}
			});

			on("focusout", function () {
				oTooltip.close(oTooltip.getDelay());
			});

			// Escape closes a pending or open tooltip without swallowing the
			// event from ancestor handlers (e.g. a Dialog's Escape).
			on("keydown", function (e) {
				if (e.key !== "Escape") {
					return;
				}
				if (oTooltip._bIsOpen || oTooltip._iOpenTimeout) {
					oTooltip.close(0);
					e.preventDefault();
				}
			});
		}

		// Mobile (touch-only)
		if ((Device.system.phone || Device.system.tablet) && !Device.system.combi) {
			const bIsLink = oDomRef.tagName === "A";

			on("contextmenu", function (e) {
				const bDisabled = bIsLink || oTooltip.getDisabledForMobile();
				if (Device.os.ios) {
					oDomRef.style.webkitTouchCallout = bDisabled ? "default" : "none";
				}
				if (!bDisabled) {
					e.preventDefault();
				}
			});

			let iLongPressTimer;
			on("touchstart", function () {
				const bDisabled = bIsLink || oTooltip.getDisabledForMobile();
				if (!bDisabled) {
					iLongPressTimer = setTimeout(function () {
						oTooltip.openBy(oDomRef, 0);
					}, oTooltip.getDelay());
				}
			});
			on("touchmove", function () { clearTimeout(iLongPressTimer); });
			on("touchend", function () { clearTimeout(iLongPressTimer); });
			on("touchcancel", function () { clearTimeout(iLongPressTimer); });
		}

		oDomRef._sapMTooltipListeners = aListeners;
	}

	// Helper: creates a Tooltip and wires it to a host (UI5 control or native
	// HTML element) via native DOM listeners only. The host is never modified
	// (no aggregation override) and sap.m.Tooltip is used purely through its
	// public API (openBy/close).
	function bind(sId, mTooltipSettings) {
		const oUi5Control = Element.getElementById(sId);
		const oNativeRef = oUi5Control ? null : document.getElementById(sId);
		if (!oUi5Control && !oNativeRef) {
			return null;
		}
		const oTooltip = new Tooltip(mTooltipSettings);

		if (oUi5Control) {
			// UI5 Buttons may not be rendered yet when bind() runs (placeAt
			// schedules an async render). Re-attach after every render so
			// handlers live on the current DOM ref.
			const fnAttach = function () {
				const oDomRef = oUi5Control.getDomRef();
				if (oDomRef) {
					attachNativeListeners(oDomRef, oTooltip);
				}
			};
			oUi5Control.addEventDelegate({ onAfterRendering: fnAttach });
			fnAttach();
		} else {
			attachNativeListeners(oNativeRef, oTooltip);
		}

		return oTooltip;
	}

	// --- Text and default placement ---
	bind("btn-default",   { text: "Default tooltip" });
	bind("btn-short",     { text: "Short" });
	bind("btn-long",      { text: "This is a noticeably longer tooltip text used to verify wrapping behavior." });
	bind("btn-very-long", {
		text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra hendrerit convallis. " +
			"Mauris quis est metus. Curabitur convallis vel arcu id cursus. Maecenas augue neque, lacinia sed " +
			"pulvinar eu, malesuada sagittis mauris. Praesent malesuada erat vel tortor dictum, non tempor " +
			"mauris finibus. Sed eu porttitor velit, quis consequat lectus. Fusce volutpat nisl augue, eget " +
			"dictum mi dictum sit amet."
	});

	// --- Placement (every PlacementType value) ---
	bind("btn-top",    { text: "Top",    placement: PlacementType.Top });
	bind("btn-bottom", { text: "Bottom", placement: PlacementType.Bottom });
	bind("btn-left",   { text: "Left",   placement: PlacementType.Left });
	bind("btn-right",  { text: "Right",  placement: PlacementType.Right });

	bind("btn-vpt",  { text: "VerticalPreferredTop",      placement: PlacementType.VerticalPreferredTop });
	bind("btn-vpb",  { text: "VerticalPreferredBottom",   placement: PlacementType.VerticalPreferredBottom });
	bind("btn-hpl",  { text: "HorizontalPreferredLeft",   placement: PlacementType.HorizontalPreferredLeft });
	bind("btn-hpr",  { text: "HorizontalPreferredRight",  placement: PlacementType.HorizontalPreferredRight });

	bind("btn-ptof", { text: "PreferredTopOrFlip",    placement: PlacementType.PreferredTopOrFlip });
	bind("btn-pbof", { text: "PreferredBottomOrFlip", placement: PlacementType.PreferredBottomOrFlip });
	bind("btn-plof", { text: "PreferredLeftOrFlip",   placement: PlacementType.PreferredLeftOrFlip });
	bind("btn-prof", { text: "PreferredRightOrFlip",  placement: PlacementType.PreferredRightOrFlip });

	// --- Delay ---
	bind("btn-delay-0",    { text: "Opens immediately (delay 0)",    delay: 0 });
	bind("btn-delay-500",  { text: "Default 500ms delay",            delay: 500 });
	bind("btn-delay-1500", { text: "Slow 1500ms delay",              delay: 1500 });

	// --- Programmatic API: openBy / close ---
	// Resolve the anchor / open / close hosts through the UI5 registry so we
	// pass the sap.m.Button control to openBy. Tooltip#openBy accepts both
	// controls and DOM elements; Buttons are the natural choice on this page.
	const oAnchor = Element.getElementById("btn-api-anchor");
	const oApiTooltip = new Tooltip({ text: "Opened programmatically via Tooltip#openBy" });
	Element.getElementById("btn-api-open").attachPress(function () {
		oApiTooltip.openBy(oAnchor, 0);
	});
	Element.getElementById("btn-api-close").attachPress(function () {
		oApiTooltip.close(0);
	});

	// --- Text with tooltip (no focus, no extended tab chain) ---
	// Non-focusable host: exercises hover-only on desktop and long-press on mobile.
	// The surrounding paragraph is selectable, so the "selection suppresses tooltip"
	// path remains testable on touch devices.
	bind("txt-tooltip", { text: "Tooltip on plain (non-focusable) text" });

	// --- Focusable text with tooltip (isolated) ---
	// Focusable host (tabindex="0"): adds keyboard-focus open path on desktop on top
	// of hover; long-press on mobile. Surrounding paragraph text remains selectable.
	bind("txt-tooltip-focus", { text: "Tooltip on focusable text (Tab to focus, hover, or long-press)" });

	// --- Right-click on selected text ---
	bind("span-rclick", { text: "Tooltip on selectable text — should not open while text is selected" });

	// --- Links: mobile long-press behavior ---
	// Tooltips on <a> elements are automatically disabled on mobile (per design)
	// so the native browser context menu remains accessible on long-press.
	// On desktop the tooltip behaves like on any other element.
	bind("link-tooltip", { text: "Tooltip on a link (desktop only, disabled for mobile-touch devices)" });
	bind("link-long",    {
		text: "A noticeably longer tooltip text shown on a link to verify wrapping " +
			"and placement on desktop."
	});

	// --- Viewport corners (auto-flip placement) ---
	// Each corner button uses the placement that would naturally clip - the tooltip
	// must flip to the opposite side instead of covering the button or being cut off.
	// The corner buttons are toggled by a checkbox so they don't permanently obscure
	// the rest of the page when not in use.
	bind("btn-corner-tl", { text: "Tooltip flips to bottom because there is no space above", placement: PlacementType.Top });
	bind("btn-corner-tr", { text: "Tooltip flips to left because there is no space on the right", placement: PlacementType.Right });
	bind("btn-corner-bl", { text: "Tooltip flips to right because there is no space on the left", placement: PlacementType.Left });
	bind("btn-corner-br", { text: "Tooltip flips to top because there is no space below", placement: PlacementType.Bottom });

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
	// Together they let a tester confirm: short tap → blue only; long press →
	// red only (no blue afterwards). We auto-suppress the trailing click that
	// browsers synthesize on long-press release so the red banner stays alone.
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

		// Any movement / cancellation aborts the long-press timer.
		["touchmove", "touchcancel"].forEach(function (sType) {
			document.body.addEventListener(sType, function () {
				clearTimeout(iLongPressTimer);
			}, { passive: true });
		});

		document.body.addEventListener("touchend", function () {
			clearTimeout(iLongPressTimer);
		}, { passive: true });

		// Short tap → blue banner. The synthetic click that fires after a
		// long-press release is suppressed by the bLongPressFired flag.
		document.body.addEventListener("click", function (oEvent) {
			const oTarget = oEvent.target.closest(".demo, .demo-host, .text-with-tooltip");
			if (!oTarget) {
				return;
			}
			if (bLongPressFired) {
				bLongPressFired = false;
				return;
			}
			// Suppress link navigation so the banner is visible (the activation
			// itself is what we are demonstrating, not the navigation).
			if (oTarget.tagName === "A") {
				oEvent.preventDefault();
			}
			showBanner(oBanner, "Activated: " + (oTarget.id || oTarget.tagName.toLowerCase()));
		});
	}
});
