/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepClone",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/merge",
	"sap/m/Tree",
	"sap/m/StandardTreeItem",
	"sap/ui/model/json/JSONModel"
], function (
	Log,
	deepClone,
	LoaderExtensions,
	merge,
	Tree,
	StandardTreeItem,
	JSONModel
) {
	"use strict";

	/**
	 * Child card tree helper for the Editor control.
	 * Contains methods for building the child card navigation tree and
	 * handling tree-item press and expand/collapse events.
	 *
	 * @namespace
	 * @alias sap.ui.integration.editor.EditorChildTree
	 * @static
	 * @private
	 */
	var EditorChildTree = {};

	/**
	 * Creates the child card tree and stores it on <code>oEditor._oChildTree</code>.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor The editor instance
	 * @param {object} oChildNodes child card configuration map from the manifest
	 */
	EditorChildTree.createChildTree = function (oEditor, oChildNodes) {
		var sBaseUrl = oEditor.getBaseUrl();

		var sMainManifest = oEditor._vIdOrSettings.manifest;
		if (typeof oEditor._vIdOrSettings.manifest === "object") {
			sMainManifest = JSON.stringify(oEditor._vIdOrSettings.manifest);
		}
		var mainTitle = oEditor._oManifest.get("/sap.app/title") || oEditor._oResourceBundle.getText("EDITOR_CHILD_TREE_MAIN_NODE_TEXT");
		// Create data model with main node
		var oData = [{
			text: mainTitle,
			baseUrl: sBaseUrl,
			manifest: sMainManifest,
			path: "",
			selected: true,
			textReady: true,
			dataReady: false,
			nodes: []
		}];
		var oModel = new JSONModel(oData);

		// check if all texts are ready
		var checkTextsReady = function (oDataNode) {
			oDataNode = oDataNode || oData[0];
			if (!oDataNode.textReady) {
				return false;
			}
			var oNodes = oDataNode.nodes;
			for (var i = 0; i < oNodes.length; i++) {
				if (!checkTextsReady(oNodes[i])) {
					return false;
				}
			}
			return true;
		};

		var loadChildNode = function (sName, oChildConfig, sPath, sNodeBaseUrl, sParentName) {
			var oNode = {
				text: sName,
				baseUrl: sNodeBaseUrl,
				manifest: "",
				isChild: true,
				path: sPath,
				selected: false,
				textReady: false,
				nodes: []
			};

			var markTextReady = function () {
				oNode.textReady = true;
				if (checkTextsReady()) {
					oData[0].dataReady = true;
					oModel.checkUpdate(true);
					oEditor.fireChildTreeDataReady();
				} else {
					oModel.checkUpdate(true);
				}
			};

			if (oChildConfig.manifest) {
				// calculate base url and manifest path for childs — only when manifest is defined
				var sManifestPath = sNodeBaseUrl + oChildConfig.manifest;
				sNodeBaseUrl = sManifestPath.substring(0, sManifestPath.lastIndexOf("/") + 1);
				oNode.baseUrl = sNodeBaseUrl;
				oNode.manifest = sManifestPath;

				try {
					var sManifestUrl = oEditor._sAppId.replace(/\./g, "/");
					if (sParentName) {
						sManifestUrl += "/" + sParentName;
					}
					sManifestUrl += "/" + oChildConfig.manifest;
					// load child manifest to get title and sub child nodes
					LoaderExtensions.loadResource(sManifestUrl, {
						dataType: "json",
						async: true,
						failOnError: false
					}).then(function (oManifest) {
						if (oManifest && oManifest["sap.card"]?.configuration?.childCards) {
							var oSubChildNodes = oManifest["sap.card"].configuration.childCards;
							for (var sSubName in oSubChildNodes) {
								var oSubNode = loadChildNode(sSubName, oSubChildNodes[sSubName], sPath ? (sPath + "/" + sSubName) : sSubName, sNodeBaseUrl, sName);
								oNode.nodes.push(oSubNode);
							}
						}
						if (oManifest) {
							oNode.text = oChildConfig.title || oManifest["sap.app"]?.title || oNode.text;
						} else if (oChildConfig.title) {
							oNode.text = oChildConfig.title;
						}
						markTextReady();
					}).catch(function (e) {
						if (oChildConfig.title) {
							oNode.text = oChildConfig.title;
						}
						Log.error("sap.ui.integration.editor.Editor: child edtior tree manifest load error: " + e);
						markTextReady();
					});
				} catch (e) {
					if (oChildConfig.title) {
						oNode.text = oChildConfig.title;
					}
					Log.error("sap.ui.integration.editor.Editor: child edtior tree manifest load error: " + e);
					markTextReady();
				}
			} else if (oChildConfig.title) {
				oNode.text = oChildConfig.title;
				markTextReady();
			} else {
				// no manifest and no title — mark ready immediately to avoid permanently blocking the tree
				markTextReady();
			}
			return oNode;
		};

		for (var sChildNodeName in oChildNodes) {
			var oNode = loadChildNode(sChildNodeName, oChildNodes[sChildNodeName], sChildNodeName, sBaseUrl);
			oData[0].nodes.push(oNode);
		}
		oEditor._oChildTree = new Tree({
			items: {
				path: "/",
				template: new StandardTreeItem({
					title: "{text}",
					tooltip: "{text}",
					type: "Active",
					highlight: "{= ${selected} ? 'Information' : 'None'}"
				})
			},
			toggleOpenState: EditorChildTree._onToggleOpenState,
			itemPress: EditorChildTree._onTreeItemPress.bind(oEditor)
		}).addStyleClass("sapUiIntegrationEditorChildTreeItem");
		oEditor._oChildTree.setModel(oModel);
	};

	/**
	 * Handles the tree node expand/collapse toggle.
	 *
	 * @param {sap.ui.base.Event} oEvent the toggle event
	 */
	EditorChildTree._onToggleOpenState = function (oEvent) {
		var oControl = oEvent.getSource();
		var bExpanded = oEvent.getParameter("expanded");
		if (bExpanded) {
			Log.info("sap.ui.integration.editor.Editor: child edtior tree item expanded: " + oEvent.getParameter("itemIndex"));
			oControl.expand([oEvent.getParameter("itemIndex")]);
		} else {
			Log.info("sap.ui.integration.editor.Editor: child edtior tree item collapsed: " + oEvent.getParameter("itemIndex"));
			oControl.collapse([oEvent.getParameter("itemIndex")]);
		}
	};

	/**
	 * Handles a tree item press — saves current settings, resets the editor,
	 * and switches to the manifest of the pressed child card.
	 *
	 * Called with the editor instance as <code>this</code>.
	 *
	 * @param {sap.ui.base.Event} oEvent the item press event
	 */
	EditorChildTree._onTreeItemPress = function (oEvent) {
		var that = this;
		// get the pressed item
		var oItem = oEvent.getParameter("srcControl");
		if (!oItem || !oItem.getBindingContext() || !oItem.getBindingContext().getObject()) {
			Log.error("sap.ui.integration.editor.Editor: child editor tree item pressed without binding context or binding object");
			return;
		}

		// get the binding object and the manifest
		var oItemObject = oItem.getBindingContext().getObject();
		var oManifest = oItemObject.manifest;
		if (!oManifest) {
			Log.error("sap.ui.integration.editor.Editor: child editor tree item pressed without manifest");
			return;
		}
		// check if manifest is json
		try {
			oManifest = JSON.parse(oManifest);
		} catch (e) {
			//manifest is not json
			Log.info("sap.ui.integration.editor.Editor: child editor tree item pressed with manifest not json");
		}
		// check if same item pressed, if yes do nothing
		var path = oItemObject.path || "/";
		that._oChildTree._path = that._oChildTree._path || "/";
		if (that._oChildTree._path === path) {
			Log.info("sap.ui.integration.editor.Editor: same item pressed, do nothing");
			return;
		}

		// update current settings to manifest changes (main editor or Child editor)
		var oCurrentSettings = that.getCurrentSettings(true);
		that._oChildEditorChanges = that._oChildEditorChanges || {};
		that._aMainEditorChanges = that._aMainEditorChanges || [];
		var sLayer = oCurrentSettings[":layer"];
		var oMatchedChange, oMatchedChangeCloned, iIndex;
		if (!that.isChild) {
			// find current layer change in main editor changes
			oMatchedChange = that._aMainEditorChanges.find(function (oChange) {
				return oChange[":layer"] === sLayer;
			});
			if (oMatchedChange) {
				oMatchedChangeCloned = merge({}, oMatchedChange, oCurrentSettings);
				iIndex = that._aMainEditorChanges.indexOf(oMatchedChange);
				if (iIndex > -1) {
					that._aMainEditorChanges.splice(iIndex, 1);
				}
				oMatchedChange = oMatchedChangeCloned;
			} else {
				oMatchedChange = oCurrentSettings;
			}
			that._aMainEditorChanges.push(oMatchedChange);
		} else {
			that._oChildEditorChanges[that._oChildTree._path] = that._oChildEditorChanges[that._oChildTree._path] || [];
			var aChildChanges = that._oChildEditorChanges[that._oChildTree._path];
			// find current layer change in Child editor changes
			oMatchedChange = aChildChanges.find(function (oChange) {
				return oChange[":layer"] === sLayer;
			});
			if (oMatchedChange) {
				oMatchedChangeCloned = merge({}, oMatchedChange, oCurrentSettings);
				iIndex = aChildChanges.indexOf(oMatchedChange);
				if (iIndex > -1) {
					aChildChanges.splice(iIndex, 1);
				}
				oMatchedChange = oMatchedChangeCloned;
			} else {
				oMatchedChange = oCurrentSettings;
			}
			aChildChanges.push(oMatchedChange);
		}

		// clean editor and reset flags
		that.cleanAndReset();

		// switch to the pressed editor
		that.switchToEditor(oManifest, oItemObject, path);

		// unHighlignt the previous selected item and highlight the current selected item
		var oTreeModel = that._oChildTree.getModel();
		var sCurrentItemIndex = that._oChildTree._itemIndex || "/0";
		oTreeModel.setProperty(sCurrentItemIndex + "/selected", false);
		oItemObject.selected = true;
		oTreeModel.checkUpdate(true);

		// update the item index and path
		that._oChildTree._itemIndex = oItem.getBindingContext().getPath();
		that._oChildTree._path = path;
		Log.info("sap.ui.integration.editor.Editor: child editor tree item pressed");
	};

	/**
	 * Switches the editor to the manifest identified by the pressed tree item.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor The editor instance
	 * @param {object|string} oManifest the manifest (object or URL string) of the target editor
	 * @param {object} oItemObject binding data of the pressed tree item
	 * @param {string} sPath path key of the pressed tree item
	 */
	EditorChildTree.switchToEditor = function (oEditor, oManifest, oItemObject, sPath) {
		// save the current settings, to avoid creating new instance when switching between child editors
		oEditor._oChildTreeSettings = oEditor._oChildTreeSettings || {};
		if (!oEditor._oChildTreeSettings[oEditor._oChildTree._path]) {
			oEditor._oChildTreeSettings[oEditor._oChildTree._path] = deepClone(oEditor._vIdOrSettings, 500);
		}

		// keep current manifest as main manifest if it is not a child
		var bDestoryCurrentManifest = !!oEditor.isChild;
		if (!bDestoryCurrentManifest) {
			oEditor._mainManifest = oEditor._oManifest;
		}
		// get settings for the pressed item
		oEditor.isChild = oItemObject.isChild;
		var oManifestChanges;
		if (!oEditor.isChild) {
			oManifestChanges = oEditor._aMainEditorChanges;
		} else {
			oManifestChanges = oEditor._oChildEditorChanges[sPath] || [];
		}
		if (oEditor._oChildTreeSettings[sPath]) {
			oEditor._vIdOrSettings = oEditor._oChildTreeSettings[sPath];
		} else {
			oEditor._vIdOrSettings.baseUrl = oItemObject.baseUrl;
			oEditor._vIdOrSettings.manifest = oManifest;
		}
		oEditor._vIdOrSettings.manifestChanges = oManifestChanges;
		oEditor._vIdOrSettings.destoryManifest = bDestoryCurrentManifest;

		// switch to the pressed editor
		oEditor.setJson(oEditor._vIdOrSettings, true); //suppress rerendering as the editor will be rerendered anyway
	};

	return EditorChildTree;

});
