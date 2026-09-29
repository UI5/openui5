sap.ui.define([
	"sap/ui/integration/Extension"
], function (Extension) {
	"use strict";

	// Provides content data once the card (and its resolved context) is ready.
	const SampleExtension = Extension.extend("sap.f.cardsdemo.cardcontent.contextDependencies.SampleExtension");

	SampleExtension.prototype.getData = function () {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve([
					{ title: "Extension item 1" },
					{ title: "Extension item 2" },
					{ title: "Extension item 3" }
				]);
			}, 1000);
		});
	};

	return SampleExtension;
});
