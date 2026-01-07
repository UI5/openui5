sap.ui.define([
	"sap/ui/demo/accessibilityGuide/controller/BaseController",
	"../util/LibLoading",
	"../model/OverviewNavigationModel"
], function (
	BaseController,
	LibLoading,
	OverviewNavigationModel
) {
	"use strict";

	/**
	 * Serves as base class for controllers, which show topic (.html) and use iframe.
	 */
	return BaseController.extend("sap.ui.demo.accessibilityGuide.controller.Topic", {

		onInit: function () {
			this._fnOnFrameMessageHandler = this._onFrameMessage.bind(this);
		},

		/**
		 * Adds event listener for messages from the topic iframe.
		 * Handles both initial loading and URL updates from TOC links.
		 */
		onFrameSourceChange: function () {
			window.removeEventListener("message", this._fnOnFrameMessageHandler);
			window.addEventListener("message", this._fnOnFrameMessageHandler);
		},

		onExit: function () {
			window.removeEventListener("message", this._fnOnFrameMessageHandler);
			this._fnOnFrameMessageHandler = null;
		},

		_onFrameMessage: function (oEvent) {
			if (oEvent.data === "bootFinished") {
				this._onFrameLoaded();
			} else if (oEvent.data.channel === "updateURL") {
				this._updateURLHash(oEvent.data.targetId);
			}
		},

		_updateURLHash: function (sTargetId) {
			const oRouter = this.getRouter();
			const sCurrentHash = oRouter.getHashChanger().getHash();
			const oRouteInfo = oRouter.getRouteInfoByHash(sCurrentHash);

			if (!oRouteInfo || !oRouteInfo.name) {
				return;
			}

			const oArgs = oRouteInfo.arguments || {};
			const mNewArgs = {
				topic: oArgs.topic,
				id: sTargetId
			};

			if (oArgs.subTopic && this.isSubTopic(oArgs.subTopic)) {
				mNewArgs.subTopic = oArgs.subTopic;
			}

			oRouter.navTo(oRouteInfo.name, mNewArgs, true);
		},

		onBeforeRendering: function() {
			if (!LibLoading.bCommonsLibAvailable) {
				this.getView().addStyleClass("sapSuiteUiCommonsView");
			}
		},
		_onFrameLoaded: function () {
			// sync sapUiSizeCompact with the iframe
			var sClass = this.getOwnerComponent().getContentDensityClass();
			this._getIFrame().contentDocument.body.classList.add(sClass);

			// navigate to the id in the URL
			var sCurrentHash = this.getRouter().getHashChanger().getHash();
			var oArgs = this.getRouter().getRouteInfoByHash(sCurrentHash).arguments;
			if (!LibLoading.bCommonsLibAvailable) {
				this._getIFrame().contentDocument.body.classList.add("sapSuiteUiCommonsView");
			}

			this.scrollTo(oArgs.id);
		},

		scrollTo: function (sId) {
			var oIFrame = this._getIFrame();

			if (!oIFrame || !sId) {
				return;
			}

			oIFrame.contentWindow.postMessage({
				channel: "scrollTo",
				id: sId
			}, window.location.origin);
		},

		_getIFrame: function () {
			if (this.byId("topicFrame").getDomRef()) {
				return this.byId("topicFrame").getDomRef().querySelector("iframe");
			}

			return null;
		},

		/**
		 * Checks if the given key is subtopic key
		 * @param {string} sKey The key to check
		 * @returns {boolean} True if the key is a subtopic
		 */
		isSubTopic: function (sKey) {
			const aNavEntries = OverviewNavigationModel.getProperty('/navigation');

			return aNavEntries.some(function (oNavEntry) {
				return oNavEntry.items && oNavEntry.items.some(function (oSubEntry) {
					return oSubEntry.key === sKey;
				});
			});
		}
	});

});
