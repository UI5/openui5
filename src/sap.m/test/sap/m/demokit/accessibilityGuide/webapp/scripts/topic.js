(function () {
	'use strict';

	window.addEventListener("message", function (oEvent) {
		if (oEvent.data.channel === "scrollTo") {
			document.getElementById(oEvent.data.id).scrollIntoView();
		}
	}, false);

	resolveDemokitLinks();
	setupLinkHandlers();

	function resolveDemokitLinks() {
		var aLinks = document.getElementsByTagName("a"),
			iInd,
			oLink;

		for (iInd = 0; iInd < aLinks.length; iInd++) {
			oLink = aLinks[iInd];

			if (oLink.dataset.demokitHref) {
				oLink.href = getUrlToDemokit(oLink.dataset.demokitHref);
			}

			if (oLink.getAttribute("target") === "_blank") {
				oLink.setAttribute("rel", "noopener noreferrer");
			}
		}
	}

	function getUrlToDemokit(sUrl) {
		var sCurrentUrl = window.location.href,
			sDemokitUrl = sCurrentUrl.replace(/sap\/m\/.*/, "../");

		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
			sDemokitUrl += "documentation.html";
		}

		return sDemokitUrl + "#" + sUrl;
	}

	function setupLinkHandlers() {
		const aLinks = document.querySelectorAll('a[href^="#"]');

		for (let i = 0; i < aLinks.length; i++) {
			const oLink = aLinks[i];

			oLink.addEventListener("click", function(event) {
				const sHref = this.getAttribute("href");

				if (sHref && sHref.startsWith("#")) {
					const sTargetId = sHref.substring(1);
					const oHeading = document.getElementById(sTargetId);

					if (oHeading && window.parent && window.parent !== window) {
						window.parent.postMessage({
							channel: "updateURL",
							targetId: sTargetId
						}, window.location.origin);
					}
				}
			});
		}
	}
})();
