/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/config"
], (
	config
) => {
	"use strict";

	let sInitModule = config.get({
		name: "sapUiOnInit",
		type: config.Type.String
	});

	return {
		run: () => {
			// inform native JavaScript that UI5 is initialized
			document.dispatchEvent(new CustomEvent("sap-ui-core-ready"));

			let pOnInit = Promise.resolve();
			if (sInitModule) {
				const aParts = sInitModule.split("@");
				sInitModule = aParts[0];
				const aResult = /^module\:((?:[_$.\-a-zA-Z0-9]+\/)*[_$.\-a-zA-Z0-9]+)$/.exec(sInitModule);
				if (aResult && aResult[1]) {
					sInitModule = aResult[1];
				}
				if (typeof globalThis[sInitModule] === "function") {
					globalThis[sInitModule]();
				} else {
					pOnInit = new Promise((resolve, reject) => {
						sap.ui.require([sInitModule], resolve, reject);
					});
				}
			}
			return pOnInit;
		}
	};
});
