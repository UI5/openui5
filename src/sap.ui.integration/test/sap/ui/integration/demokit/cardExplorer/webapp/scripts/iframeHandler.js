(function () {
	"use strict";

	window.addEventListener("message", function (oEvent) {
		if (oEvent.data.channel === "applyDeviceClass") {
			var aDeviceClasses = oEvent.data.deviceClasses;
			if (aDeviceClasses && document.documentElement) {
				aDeviceClasses.forEach(function(sClass) {
					document.documentElement.classList.add(sClass);
				});
			}
		}
	}, false);

})();