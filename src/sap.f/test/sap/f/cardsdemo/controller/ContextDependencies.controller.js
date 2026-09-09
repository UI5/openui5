sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/Host",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/Log"
], function (Controller, Host, RequestDataProvider, sinon, Log) {
	"use strict";

	const CONTEXT_DELAY = 3000;

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

	const aCategoriesData = [
		{"key": "all", "title": "All categories"},
		{"key": "finance", "title": "Finance"},
		{"key": "engineering", "title": "Engineering"}
	];

	const oBudgetData = { "budget": "15000" };

	// Data returned per stubbed URL.
	const mMockData = {
		"tasks.json": aTasksData,
		"categories.json": aCategoriesData,
		"budget.json": oBudgetData
	};

	return Controller.extend("sap.f.cardsdemo.controller.ContextDependencies", {
		onInit: function () {
			// Resolves once, CONTEXT_DELAY after the first context/data request.
			// Cards show loading placeholders until then.
			let pReady;
			const fnWhenReady = function () {
				if (!pReady) {
					pReady = new Promise(function (resolve) {
						setTimeout(resolve, CONTEXT_DELAY);
					});
				}
				return pReady;
			};

			const oHost = new Host();
			oHost.getContextValue = function (sPath) {
				return fnWhenReady().then(function () {
					return mContextValues[sPath];
				});
			};

			// Stub getData so mocked requests wait for the context to be resolved.
			const fnOriginalGetData = RequestDataProvider.prototype.getData;
			this._fnGetDataStub = sinon.stub(RequestDataProvider.prototype, "getData").callsFake(function () {
				const oConfig = this.getConfiguration();
				const sUrl = oConfig && oConfig.request && oConfig.request.url || "";
				const sKey = Object.keys(mMockData).find(function (sName) {
					return sUrl.indexOf(sName) > -1;
				});

				if (sKey) {
					return fnWhenReady().then(function () {
						return mMockData[sKey];
					});
				}
				return fnOriginalGetData.apply(this, arguments);
			});

			const aCards = [
				this.byId("cardWithContext"),
				this.byId("cardWithoutContext"),
				this.byId("cardWithContextInHeader"),
				this.byId("cardWithContextEverywhere"),
				this.byId("cardWithContextInFilter"),
				this.byId("dataRequestInCard"),
				this.byId("dataRequestInHeader"),
				this.byId("dataRequestInContent"),
				this.byId("objectCardWithContext"),
				this.byId("extensionCardWithContext")
			];

			aCards.forEach(function (oCard) {
				oCard.setHost(oHost);

				oCard.attachEventOnce("manifestReady", function () {
					Log.info("Card '" + oCard.getId() + "' context dependencies: " + JSON.stringify(oCard.getContextDependencies()));
				});
			});
		},

		onExit: function () {
			this._fnGetDataStub.restore();
		}
	});
});
