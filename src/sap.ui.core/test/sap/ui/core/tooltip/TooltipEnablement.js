sap.ui.require([
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Text",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/Device"
], async function (Button, Link, Text, TooltipEnablement, Core, Element, Device) {
	"use strict";

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

	// Attach a TooltipEnablement helper to the given control.
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

	// --- Buttons with tooltip text ---
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
	// Tooltips on sap.m.Link are disabled on touch-only devices (per design)
	// so the native browser context menu remains accessible on long-press.
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
