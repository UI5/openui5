sap.ui.define([
	"sap/ui/integration/Extension"
], function (Extension) {
	"use strict";

	// Minimal extension that provides content data once the card (and therefore the
	// resolved context parameters) is ready — mirrors the SuccessFactors-style card.
	var SampleExtension = Extension.extend("test.cardcontent.contextLoading.SampleExtension");

	SampleExtension.prototype.onCardReady = function () {
		this._iOnCardReadyCount = (this._iOnCardReadyCount || 0) + 1;
	};

	SampleExtension.prototype.getOnCardReadyCount = function () {
		return this._iOnCardReadyCount || 0;
	};

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
