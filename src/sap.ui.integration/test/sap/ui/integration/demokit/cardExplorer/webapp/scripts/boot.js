(function () {
	"use strict";
	document.documentElement.style.opacity = "0";
	document.documentElement.style.transition = "opacity 0.1s";

	function restoreOpacity() {
		document.documentElement.style.opacity = "1";
	}

	function resolveTargetRoot(sPathname, sOrigin) {
		const iIdx = sPathname.indexOf("/test-resources");
		return iIdx !== -1 ? sOrigin + sPathname.substring(0, iIdx) : sOrigin;
	}

	window.resolveTargetRoot = resolveTargetRoot;

	function onScriptLoad(sRes) {
		if (window.hljs && window.codesample) {
			window.codesample();

			if (document.querySelector("script[data-require-ui5-init]") || document.querySelector("script[data-require-ui5-noinit]")) {
				const oScript = document.createElement("script");
				oScript.setAttribute("id", "sap-ui-bootstrap");
				oScript.setAttribute("src", sRes + "/sap-ui-integration.js");
				oScript.setAttribute("data-sap-ui-theme", "sap_horizon");
				oScript.setAttribute("data-sap-ui-compatVersion", "edge");
				oScript.setAttribute("data-sap-ui-async", "true");
				window.initWithDistributionCheck = function () {
					window.distributionCheck();

					if (document.querySelector("script[data-require-ui5-init]")) {
						window.init();
					}

					sap.ui.require(["sap/ui/core/Theming"], (Theming) => {
						Theming.attachApplied(restoreOpacity);
					});
				};
				oScript.setAttribute("data-sap-ui-on-init", "initWithDistributionCheck");
				oScript.setAttribute("data-sap-ui-resourceroots", '{"custom": "./"}');
				document.head.appendChild(oScript);
			} else {
				restoreOpacity();
			}
		}
	}

	window.addEventListener("load", function () {
		const sTargetRoot = resolveTargetRoot(window.location.pathname, window.location.origin),
			sWebApp = sTargetRoot + "/test-resources/sap/ui/integration/demokit/cardExplorer/webapp/",
			sRes = sTargetRoot + "/resources/",
			isLandingPage = document.location.pathname === "/test-resources/sap/ui/integration/demokit/cardExplorer/index.html",
			aNodes = [
				{ tag: "script", src: sWebApp + "scripts/codesample.js" },
				{ tag: "script", src: sWebApp + "scripts/iframeHandler.js" },
				{ tag: "link", href: sWebApp + "css/codesample.css" },
				{ tag: "link", href: sRes + "sap/ui/documentation/sdk/thirdparty/highlight.js/styles.css" },
				{ tag: "script", src: sRes + "sap/ui/documentation/sdk/thirdparty/highlight.js/highlight.js" },
				{ tag: "script", src: sWebApp + "scripts/distributionCheck.js" }
			];

		if (!isLandingPage) {
			aNodes.push(
				{ tag: "link", href: sRes + "sap/ui/core/themes/sap_horizon/library.css" },
				{ tag: "link", href: sWebApp + "css/topic.css" },
				{ tag: "script", src: sWebApp + "scripts/deepNavigation.js" },
				{ tag: "script", src: sWebApp + "scripts/generateNavMenu.js" },
				{ tag: "script", src: sWebApp + "scripts/resolveDemokitURLs.js" }
			);
		}

		let iLoadedCnt = 0;

		function afterLoad() {
			iLoadedCnt++;
			if (iLoadedCnt === aNodes.length) {
				window.parent.postMessage("bootFinished", window.location.origin);
			}
		}

		aNodes.forEach(function (oNode) {
			const oEl = document.createElement(oNode.tag);
			oEl.addEventListener("load", afterLoad);
			if (oNode.tag === "script") {
				oEl.src = oNode.src;
				oEl.async = true;
				oEl.addEventListener("load", onScriptLoad.bind(null, sRes));
			} else {
				oEl.rel = "stylesheet";
				oEl.href = oNode.href;
			}
			document.head.appendChild(oEl);
		});
	});
})();
