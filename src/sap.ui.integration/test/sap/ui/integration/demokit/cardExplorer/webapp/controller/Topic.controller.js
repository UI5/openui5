sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController"
], function (
	BaseController
) {
	"use strict";

	/**
	 * Single place to register listener for the "message" event of the window.
	 * It helps to avoid multiple registered listeners from the different controllers at the same time, such as Integrate, LearnDetail, etc.
	 * Only the last registered listener is called at most 1 time.
	 */
	var TopicFrameMessageManager = {
		_fnCurrentCb: null,
		_iBootFinishedCallCount: 0,
		_registered: false,
		_onMessage: function (oEvent) {
			if (this._fnCurrentCb) {
				if (oEvent.data === "bootFinished" && this._iBootFinishedCallCount === 0) {
					this._iBootFinishedCallCount = 1;
				}
				this._fnCurrentCb.apply(this, arguments);
			}
		},
		startListening: function (fnCb) {
			this._fnCurrentCb = fnCb;
			this._iBootFinishedCallCount = 0;

			if (this._registered) {
				return;
			}

			window.addEventListener("message", this._onMessage.bind(this));
			this._registered = true;
		},
		stopListening: function () {
			window.removeEventListener("message", this._onMessage.bind(this));
		}
	};

	/**
	 * Serves as base class for controllers, which show topic (.html) and use iframe.
	 */
	return BaseController.extend("sap.ui.demo.cardExplorer.controller.Topic", {

		onInit: function () {
			this._fnOnFrameMessageHandler = this._onFrameMessage.bind(this);
		},

		/**
		 * Adds event listener for "bootFinished" event of the topic iframe.
		 * Only handles initial loading of the iframe.
		 */
		onFrameSourceChange: function () {
			TopicFrameMessageManager.startListening(this._fnOnFrameMessageHandler);
		},

		onExit: function () {
			TopicFrameMessageManager.stopListening();
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
			const sCurrentHash = this.getRouter().getHashChanger().getHash(),
				oRouteInfo = this.getRouter().getRouteInfoByHash(sCurrentHash);

			if (oRouteInfo && oRouteInfo.name) {
				const oArgs = oRouteInfo.arguments;

				const mNewArgs = {
					topic: oArgs.topic
				};

				if (oArgs.subTopic && this.isSubTopic(oArgs.subTopic)) {
					mNewArgs.subTopic = oArgs.subTopic;
					mNewArgs.id = sTargetId;
				} else {
					mNewArgs.subTopic = sTargetId;
				}

				if (oRouteInfo.name === "default") {
					oRouteInfo.name = "overview";
					mNewArgs.topic = "introduction";
				}

				this.getRouter().navTo(oRouteInfo.name, mNewArgs, true);
			}
		},

		_onFrameLoaded: function () {
			// sync sapUiSizeCompact with the iframe
			var sClass = this.getOwnerComponent().getContentDensityClass();
			this._getIFrame().contentDocument.body.classList.add(sClass);

			// apply device-specific classes to iframe's html tag for proper scrollbar styling
			var aDeviceClasses = document.documentElement.className.match(/sap-\w+/g);
			if (aDeviceClasses && aDeviceClasses.length > 0) {
				this._getIFrame().contentWindow.postMessage({
					channel: "applyDeviceClass",
					deviceClasses: aDeviceClasses
				}, window.location.origin);
			}

			// navigate to the id in the URL
			var sCurrentHash = this.getRouter().getHashChanger().getHash();
			var oArgs = this.getRouter().getRouteInfoByHash(sCurrentHash).arguments;
			var sElementId = oArgs.id;

			// right shift the sub topic to element id
			// /{topic}/:subTopic:/:id:
			if (!this.isSubTopic(oArgs.subTopic)) {
				sElementId = oArgs.subTopic;
			}

			this.scrollTo(sElementId);
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

		/**
		 * Checks if the given key is sub topic key
		 * E.g. "/learn/{topic}/:subTopic:/:id:"
		 *
		 * @param {string} sKey The key of the topic
		 * @returns {boolean} Whether sKey is a key of sub topic
		 */
		isSubTopic: function (sKey) {
			return this.getNavigationModel().getProperty("/navigation").some(function (oNavEntry) {
				return oNavEntry.items && oNavEntry.items.some(function (oSubEntry) {
					return oSubEntry.key === sKey;
				});
			});
		},

		findNavEntry: function (key) {
			var navEntries = this.getNavigationModel().getProperty("/navigation"),
				navEntry,
				subItems,
				i,
				j;

			for (i = 0; i < navEntries.length; i++) {
				navEntry  = navEntries[i];

				if (navEntry.key === key) {
					return navEntry;
				}

				subItems = navEntry.items;

				if (subItems) {
					for (j = 0; j < subItems.length; j++) {
						if (subItems[j].key === key) {
							return subItems[j];
						}
					}
				}
			}

			return null;
		},

		getNavigationModel: function() {
			return null;
		},

		_getIFrame: function () {
			if (this.byId("topicFrame").getDomRef()) {
				return this.byId("topicFrame").getDomRef().querySelector("iframe");
			}

			return null;
		}
	});

});