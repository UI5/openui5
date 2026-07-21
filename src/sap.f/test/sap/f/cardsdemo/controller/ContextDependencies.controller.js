sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/Host",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/Log"
], function (Controller, Host, RequestDataProvider, sinon, Log) {
	"use strict";

	const mContextValues = {
		"sample/currentUser/id": "U12345",
		"sample/currentUser/name": "John Miller",
		"sample/currentUser/budget": "15000",
		"sample/department/title": "Engineering"
	};

	const aTasksData = [
		{"task": "Review quarterly report"},
		{"task": "Approve budget request"},
		{"task": "Update team allocation"}
	];

	return Controller.extend("sap.f.cardsdemo.controller.ContextDependencies", {
		onInit: function () {
			let bContextAvailable = false;

			const oHost = new Host();
			oHost.getContextValue = function (sPath) {
				if (bContextAvailable) {
					return Promise.resolve(mContextValues[sPath]);
				}
				return Promise.resolve(null);
			};

			// Stub getData to delay tasks.json responses until context is available
			const fnOriginalGetData = RequestDataProvider.prototype.getData;
			this._fnGetDataStub = sinon.stub(RequestDataProvider.prototype, "getData").callsFake(function () {
				const oConfig = this.getConfiguration();
				const sUrl = oConfig && oConfig.request && oConfig.request.url || "";

				if (sUrl.indexOf("tasks.json") > -1) {
					if (bContextAvailable) {
						return Promise.resolve(aTasksData);
					}
					return new Promise(function () {});
				}
				return fnOriginalGetData.apply(this, arguments);
			});

			const aCards = [
				this.byId("cardWithContext"),
				this.byId("cardWithoutContext"),
				this.byId("cardWithContextInHeader"),
				this.byId("cardWithContextEverywhere")
			];

			aCards.forEach(function (oCard) {
				oCard.setHost(oHost);

				oCard.attachEventOnce("manifestReady", function () {
					const aDeps = oCard.getContextDependencies();
					Log.info("Card '" + oCard.getId() + "' context dependencies: " + JSON.stringify(aDeps));

					if (aDeps.some(function (sPath) { return sPath.indexOf("currentUser") > -1; })) {
						oCard.showLoadingPlaceholders();

						setTimeout(function () {
							bContextAvailable = true;
							oCard.refresh();
						}, 3000);
					}
				});
			});
		},

		onExit: function () {
			this._fnGetDataStub.restore();
		}
	});
});
