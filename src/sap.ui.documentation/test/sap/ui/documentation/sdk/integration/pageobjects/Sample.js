sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals'
], function (Opa5, PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({
		onTheSamplePage: {
			viewName: "Sample",
			actions: {
				iPressOnShowCode : function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers : new PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://source-code"
						}),
						success : function (aButtons) {
							aButtons[0].$().trigger("tap");
						},
						errorMessage: "Did not find the show code button"
					});
				},
				iClearTheServiceWorkerCache() {
					return new Promise((resolve) => {
						if (navigator.serviceWorker?.controller == null) {
							resolve();
							return;
						}

						// Set up a one-time listener for the service worker response
						function messageHandler(event) {
							if (event.data === "CACHE_CLEANED") {
								navigator.serviceWorker.removeEventListener('message', messageHandler);
								resolve();
							}
						}

						navigator.serviceWorker.addEventListener('message', messageHandler);

						// Send message to clean the cache
						navigator.serviceWorker.controller.postMessage({
							type: "CLEAN_CACHE"
						});

						// Set a timeout in case the service worker doesn't respond
						setTimeout(() => messageHandler({data: "CACHE_CLEANED"}), 5000);
					});
				}

			},

			assertions: {

			}
		}
	});

});
