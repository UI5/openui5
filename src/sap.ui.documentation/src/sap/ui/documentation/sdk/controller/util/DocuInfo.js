/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation topics from index.json files.
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/documentation/sdk/util/Resources", "sap/ui/documentation/sdk/controller/util/TreeUtil"],
	function (jQuery, ResourcesUtil, TreeUtil) {
		"use strict";

		var oCachedData;
		var oCachedPromise;

		function _getDocuIndexPromise(oConfig) {
			if (oCachedData) {
				return Promise.resolve(oCachedData);
			}

			if (oCachedPromise) {
				return oCachedPromise;
			}

			oCachedPromise = new Promise(function (resolve, reject) {
				jQuery.ajax({
					async: true,
					url: ResourcesUtil.getResourceOriginPath(oConfig.docuPath + "index.json"),
					dataType: 'json',
					success: function (oData) {
						oCachedData = oData;
						resolve(oData);
					},
					error: function (oError) {
						oCachedPromise = null; // clear so callers can retry after a transient failure (e.g. 469 error)
						reject(oError);
					}
				});
			});

			return oCachedPromise;
		}


		function _getDocumentTitle(sTopicId, oConfig) {
			return _getDocuIndexPromise(oConfig).then(function (oData) {
				var oTreeUtil = TreeUtil.getInstance(TreeUtil.treeTypes.Documentation, "key", "links");
				var oTopicInfo = oTreeUtil.getNodeById(sTopicId, oData);
				return oTopicInfo?.text;
			});
		}

		return {
			getDocuIndexPromise: _getDocuIndexPromise,
			getDocumentTitle: _getDocumentTitle
		};
	});