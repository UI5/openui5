(function () {
	"use strict";

	async function distributionCheck() {
		const versionInfo = await new Promise((resolve) => {
			sap.ui.require(["sap/ui/VersionInfo"], async (VersionInfo) => {
				resolve(await VersionInfo.load());
			});
		});

		const gav = versionInfo?.gav?.toLowerCase(); // gav is available on productive environments
		const name = versionInfo?.name?.toLowerCase(); // for local development the name is sufficient
		const isOpenUI5 = /openui5/i.test(gav || name) ?? true; // fallback to true

		if (isOpenUI5) {
			document.querySelectorAll("ui-integration-card[data-card-sapui5-required]").forEach(function (oCard) {
				oCard.classList.add("hiddenCard");
			});

			document.querySelectorAll("[data-card-sapui5-required-notice]").forEach(function (oNotice) {
				oNotice.classList.add("visibleNotice");
			});
		}
	}

	window.distributionCheck = distributionCheck;
})();
