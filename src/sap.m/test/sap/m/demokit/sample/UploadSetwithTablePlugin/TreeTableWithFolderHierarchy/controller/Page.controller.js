sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/plugins/UploadSetwithTable",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "../model/mockserver",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/core/library",
    "sap/ui/core/Item",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Element",
    "sap/ui/model/json/JSONModel",
    "sap/base/util/uid"
], function (Controller, UploadSetwithTable, MessageBox, Fragment, MockServer, MessageToast, Dialog, Button, Input, mobileLibrary, Text, coreLibrary, CoreItem, Filter, FilterOperator, Element, JSONModel, uid) {
    "use strict";

    return Controller.extend("sap.m.sample.UploadSetwithTablePlugin.TreeTableWithFolderHierarchy.controller.Page", {
        onInit: function () {
            // set mock data
            this.oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/UploadSetwithTablePlugin/TreeTableWithFolderHierarchy/model/documents.json"));
            this.getView().setModel(this.oModel, "documents");

            this.oTable = this.byId("table-uploadSet");
            this.oBreadcrumbs = this.byId("breadcrumbs");

            // Initialize breadcrumb with simple root location text
            this.oBreadcrumbs.setCurrentLocationText("Attachments");

            this.bindTableItems("/items");

            this.oMockServer = new MockServer();
            this.oMockServer.oModel = this.oModel;
        },

        onBeforeUploadStarts: function () {
            // Start the mockserver with current path context
            var sCurrentPath = this.getCurrentFolderPath();
            this.oMockServer.start(sCurrentPath);
        },

        onPluginActivated: function (oEvent) {
            this.oUploadPluginInstance = oEvent.getParameter("oPlugin");
        },

        onUploadCompleted: function (oEvent) {
            // No breadcrumb updates needed - keep simple text
            setTimeout(function () {
                MessageToast.show("Upload completed successfully.");
            }, 2000);
        },

        onItemPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("documents");
            var bIsDirectory = oContext && oContext.getProperty("isDirectory");

            if (bIsDirectory) {
                this.navigateToFolder(oContext);
            }
        },

        navigateToFolder: function (oContext) {
            var aSubItems = oContext && oContext.getProperty("items");
            if (aSubItems) {
                // Build the complete path from root to the target folder
                var aFullPath = this.buildPathToFolder(oContext);

                // Navigate to new folder
                this.bindTableItems(oContext.getPath() + "/items");

                // Update history with the complete path (excluding the current folder)
                var aHistory = [];
                for (var i = 0; i < aFullPath.length - 1; i++) {
                    aHistory.push({
                        name: aFullPath[i].name,
                        path: aFullPath[i].path
                    });
                }

                this.oModel.setProperty("/history", aHistory);

                // update new current location folder text in Breadcrumb
                this.oBreadcrumbs.setCurrentLocationText(oContext.getProperty("fileName"));
            }
        },

        /**
         * Builds the complete path from root to the given folder context
         * @param {sap.ui.model.Context} oTargetContext - The target folder context
         * @returns {Array} Array of path objects with name and path properties
         */
        buildPathToFolder: function (oTargetContext) {
            var aPath = [];
            var sTargetPath = oTargetContext.getPath();

            // Always start with root
            aPath.push({
                name: "Attachments",
                path: "/items"
            });

            // Parse the path to extract folder hierarchy
            // Path format: /items/0/items/1/items/2 etc.
            var aPathSegments = sTargetPath.split("/").filter(function (segment) {
                return segment !== "" && segment !== "items";
            });

            var sCurrentPath = "/items";

            // Build path for each level
            for (var i = 0; i < aPathSegments.length; i++) {
                var iIndex = parseInt(aPathSegments[i]);
                var oFolderData = this.oModel.getProperty(sCurrentPath + "/" + iIndex);

                if (oFolderData && oFolderData.isDirectory) {
                    sCurrentPath = sCurrentPath + "/" + iIndex + "/items";
                    aPath.push({
                        name: oFolderData.fileName,
                        path: sCurrentPath
                    });
                }
            }

            return aPath;
        },

        /**
         * Handler for tree table toggle open state event
         * @param {sap.ui.base.Event} oEvent - The toggle open state event
         */
        onToggleOpenState: function (oEvent) {
            // This method handles the expansion/collapse of tree nodes
            // No special action needed for breadcrumbs here as we only update
            // breadcrumbs when actually navigating to folders via onItemPress
        },

        onBreadcrumbPress: function (oEvent) {
            var oLink = oEvent.getSource();
            var iIndex = this.oBreadcrumbs.indexOfLink(oLink);
            var aHistory = this.oModel.getProperty("/history");

            if (iIndex === -1) {
                // Clicked on current location text, check if we need to go back
                if (aHistory.length > 0) {
                    // We're in a subfolder, go back to root
                    this.bindTableItems("/items");
                    this.oModel.setProperty("/history", []);
                    this.oBreadcrumbs.setCurrentLocationText("Attachments");
                }
            } else {
                // Clicked on a breadcrumb link
                var oHistoryItem = aHistory[iIndex];

                if (oHistoryItem.name === "Attachments") {
                    // Going back to root
                    this.bindTableItems("/items");
                    this.oModel.setProperty("/history", []);
                    this.oBreadcrumbs.setCurrentLocationText("Attachments");
                } else {
                    // Going to a specific folder - use the stored path
                    this.bindTableItems(oHistoryItem.path);

                    // Update history - keep only the items BEFORE the clicked level
                    // because we're now AT the clicked level
                    var aNewHistory = aHistory.slice(0, iIndex);
                    this.oModel.setProperty("/history", aNewHistory);

                    // Set the current location folder to the clicked folder
                    this.oBreadcrumbs.setCurrentLocationText(oHistoryItem.name);
                }
            }
        },

        bindTableItems: function (path) {
            this.oTable.bindRows({
                path: "documents>" + path
            });
        },

        getCurrentFolderPath: function () {
            var oTable = this.byId("table-uploadSet");
            var sPath = oTable.getBinding("rows").getPath();

            // Remove the model name prefix if present
            if (sPath.startsWith("documents>")) {
                return sPath.substring(10);
            }
            return sPath;
        },

        getCurrentLocationText: function () {
            var aHistory = this.oModel.getProperty("/history");
            if (aHistory && aHistory.length > 0) {
                return aHistory[aHistory.length - 1].name;
            }
            return this.oModel.getProperty("/currentLocationText");
        },

        getIconSrc: function (mediaType, thumbnailUrl, isDirectory) {
            if (isDirectory) {
                return "sap-icon://folder-full";
            }
            return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
        },

        formatFileSize: function (iFileSize) {
            return UploadSetwithTable.getFileSizeWithUnits(iFileSize);
        },

        openPreview: function (oEvent) {
            const oSource = oEvent.getSource();
            const oBindingContext = oSource.getBindingContext("documents");
            if (oBindingContext && this.oUploadPluginInstance) {
                this.oUploadPluginInstance.openFilePreview(oBindingContext);
            }
        },

        onSelectionChange: function (oEvent) {
            const oTable = oEvent.getSource();
            var aSelectedItems = oTable?.getBinding("rows")?.getSelectedContexts();
            const aSelectedContexts = aSelectedItems?.filter((oContext) => oContext?.getProperty("isDirectory") != true);
            const bFolderContextSelected = aSelectedItems?.filter((oContext) => oContext?.getProperty("isDirectory") == true);
            const oDownloadBtn = this.byId("downloadSelectedButton");
            const oRenameBtn = this.byId("renameButton");
            const oRemoveAllBtn = this.byId("removeAllButton");

            // Get total number of items (both files and folders) in current folder
            var sCurrentPath = this.getCurrentFolderPath();
            var aAllItems = this.oModel.getProperty(sCurrentPath) || [];
            var iTotalItems = aAllItems.length;

            if (aSelectedContexts.length > 0 && !bFolderContextSelected?.length) {
                oDownloadBtn.setEnabled(true);
                oRenameBtn.setEnabled(aSelectedContexts.length === 1);
                // Enable Remove All only when all items are selected
                oRemoveAllBtn.setEnabled(aSelectedItems.length === iTotalItems && iTotalItems > 0);
            } else if (bFolderContextSelected?.length > 0 && !aSelectedContexts?.length) {
                oDownloadBtn.setEnabled(false);
                oRenameBtn.setEnabled(bFolderContextSelected.length === 1);
                // Enable Remove All only when all items are selected
                oRemoveAllBtn.setEnabled(aSelectedItems.length === iTotalItems && iTotalItems > 0);
            } else if (aSelectedItems?.length > 0) {
                // Mixed selection (both files and folders)
                oDownloadBtn.setEnabled(false);
                oRenameBtn.setEnabled(false);
                // Enable Remove All only when all items are selected
                oRemoveAllBtn.setEnabled(aSelectedItems.length === iTotalItems && iTotalItems > 0);
            } else {
                oDownloadBtn.setEnabled(false);
                oRenameBtn.setEnabled(false);
                oRemoveAllBtn.setEnabled(false);
            }
        },

        onDownloadFiles: function () {
            var aSelectedContexts = this.oTable.getBinding("rows").getSelectedContexts();
            var aSelectedFiles = aSelectedContexts.filter(function (oContext) {
                return !oContext.getProperty("isDirectory");
            });

            if (aSelectedFiles.length === 0) {
                MessageToast.show("No files selected for download");
                return;
            }

            aSelectedFiles.forEach(function (oContext) {
                var sUrl = oContext.getProperty("url");
                var sFileName = oContext.getProperty("fileName");
                if (sUrl) {
                    var link = document.createElement("a");
                    link.href = sUrl;
                    link.download = sFileName;
                    link.click();
                }
            });

            MessageToast.show("Download initiated for " + aSelectedFiles.length + " file(s)");
        },

        onCreateFolder: function () {
            if (!this.oCreateFolderDialog) {
                this.oCreateFolderDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "sap.m.sample.UploadSetwithTablePlugin.TreeTableWithFolderHierarchy.view.fragment.CreateFolderDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this.oCreateFolderDialog.then(function (oDialog) {
                var oInput = Fragment.byId(this.getView().getId(), "folderNameInput");
                oInput.setValue("");
                oDialog.open();
            }.bind(this));
        },

        onCreateFolderDialogPress: function () {
            var oInput = Fragment.byId(this.getView().getId(), "folderNameInput");
            var sFolderName = oInput.getValue();

            if (!sFolderName.trim()) {
                MessageToast.show("Please enter a folder name");
                return;
            }

            this.oCreateFolderDialog.then(function (oDialog) {
                oDialog.close();
            });

            this.createFolderWithName(sFolderName.trim());
        },

        onCreateFolderDialogCancel: function () {
            this.oCreateFolderDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        createFolderWithName: function (sFolderName) {
            // Check if any folder is selected
            var aSelectedContexts = this.oTable.getBinding("rows").getSelectedContexts();
            var aSelectedFolders = aSelectedContexts.filter(function (oContext) {
                return oContext.getProperty("isDirectory");
            });

            var sTargetPath, aTargetItems;

            if (aSelectedFolders.length === 1) {
                // Create folder inside the selected folder
                var oSelectedFolder = aSelectedFolders[0];
                sTargetPath = oSelectedFolder.getPath() + "/items";
                aTargetItems = this.oModel.getProperty(sTargetPath);

                if (!aTargetItems) {
                    aTargetItems = [];
                    this.oModel.setProperty(sTargetPath, aTargetItems);
                }
            } else {
                // Create folder in current path
                sTargetPath = this.getCurrentFolderPath();
                aTargetItems = this.oModel.getProperty(sTargetPath);
            }

            if (aTargetItems) {
                // Check if folder name already exists
                var bExists = aTargetItems.some(function (item) {
                    return item.fileName === sFolderName;
                });

                if (bExists) {
                    MessageToast.show("A folder with this name already exists");
                    return;
                }

                var oNewFolder = {
                    type: "folder",
                    isDirectory: true,
                    documentId: uid(),
                    fileName: sFolderName,
                    mimeType: "",
                    thumbnailUrl: "sap-icon://folder-blank",
                    url: "",
                    size: 0,
                    uploadedDate: new Date().toLocaleDateString(),
                    uploadedBy: "Current User",
                    status: "Active",
                    documentType: "Folder",
                    color: "#ffffff",
                    bgColor: "#30914c",
                    items: [],
                    uploadState: "Complete"  // Set uploadState for highlighting
                };

                // Insert folder at the beginning
                aTargetItems.unshift(oNewFolder);
                this.oModel.setProperty(sTargetPath, aTargetItems);

                var sMessage = aSelectedFolders.length === 1 ?
                    "New folder created inside '" + aSelectedFolders[0].getProperty("fileName") + "': " + sFolderName :
                    "New folder created: " + sFolderName;

                MessageToast.show(sMessage);
            }
        },

        onRenameItem: function () {
            var aSelectedContexts = this.oTable.getBinding("rows").getSelectedContexts();
            if (aSelectedContexts.length !== 1) {
                MessageToast.show("Please select exactly one item to rename");
                return;
            }

            var oContext = aSelectedContexts[0];
            var bIsDirectory = oContext.getProperty("isDirectory");

            if (bIsDirectory) {
                // Use dialog for folder rename
                this.renameFolderWithDialog(oContext);
            } else if (this.oUploadPluginInstance) {
                // Use UploadSetwithTable plugin API for file rename
                this.oUploadPluginInstance.renameItem(oContext);
            }
        },

        renameFolderWithDialog: function (oContext) {
            var sCurrentName = oContext.getProperty("fileName");

            var oDialog = new Dialog({
                title: "Rename Folder",
                content: new Input({
                    value: sCurrentName,
                    width: "100%"
                }),
                beginButton: new Button({
                    text: "OK",
                    type: "Emphasized",
                    press: function () {
                        var sNewName = oDialog.getContent()[0].getValue().trim();
                        if (sNewName && sNewName !== sCurrentName) {
                            oContext.getModel().setProperty(oContext.getPath() + "/fileName", sNewName);
                            MessageToast.show("Folder renamed successfully");
                        }
                        oDialog.close();
                    }
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });

            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        onDocumentRenamedSuccess: function (oEvent) {
            // Handle successful file rename using the UploadSetwithTable plugin
            var oItem = oEvent.getParameter("item");
            var oContext = oItem.getBindingContext("documents");

            if (oContext) {
                var oFileData = oContext.getObject();
                oFileData.fileName = oItem.getFileName();

                // Update the model with the new file name
                this.oModel.setProperty(oContext.getPath() + "/fileName", oItem.getFileName());

                // Update the backend simulation via mockserver
                this.oMockServer.updateExisitingDocument(oFileData);

                MessageToast.show("File renamed successfully", { duration: 2000 });
            }
        },

        onRemoveItemHandler: function (oEvent) {
            // Handle individual file removal (x button in each row)
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("documents");

            if (!oContext) {
                MessageToast.show("Unable to get item context for deletion");
                return;
            }

            var bIsDirectory = oContext.getProperty("isDirectory");

            // Only allow file deletion, not folder deletion
            if (bIsDirectory) {
                MessageToast.show("Folder deletion is not allowed");
                return;
            }

            var sItemName = oContext.getProperty("fileName");
            var sDocumentId = oContext.getProperty("documentId");

            var that = this;
            var sMessage = "Are you sure you want to delete the file '" + sItemName + "'?";

            MessageBox.confirm(sMessage, {
                title: "Delete File",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // Get current folder path and items
                        var sCurrentPath = that.getCurrentFolderPath();
                        var aItems = that.oModel.getProperty(sCurrentPath);

                        if (aItems) {
                            // Find and remove the file directly
                            var aRemainingItems = aItems.filter(function (oItem) {
                                return oItem.documentId !== sDocumentId;
                            });

                            // Update the model
                            that.oModel.setProperty(sCurrentPath, aRemainingItems);
                            that.oModel.refresh();

                            MessageToast.show("File '" + sItemName + "' deleted successfully");
                        } else {
                            MessageToast.show("Unable to delete file - folder not found");
                        }
                    }
                }
            });
        },

        onRemoveAllHandler: function () {
            // Handle Remove All functionality (when all items are selected)
            var aSelectedContexts = this.oTable.getBinding("rows").getSelectedContexts();
            if (aSelectedContexts.length === 0) {
                MessageToast.show("Please select items to delete");
                return;
            }

            var sCurrentPath = this.getCurrentFolderPath();
            var aAllItems = this.oModel.getProperty(sCurrentPath) || [];

            if (aSelectedContexts.length !== aAllItems.length) {
                MessageToast.show("Please select all items to use Remove All");
                return;
            }

            var that = this;
            var sMessage = "Are you sure you want to delete ALL " + aSelectedContexts.length + " item(s) in this folder?";

            MessageBox.confirm(sMessage, {
                title: "Delete All Items",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        that.deleteAllSelectedItems(aSelectedContexts);
                    }
                }
            });
        },

        onRemoveHandler: function () {
            var aSelectedContexts = this.oTable.getBinding("rows").getSelectedContexts();
            if (aSelectedContexts.length === 0) {
                MessageToast.show("Please select items to delete");
                return;
            }

            var that = this;
            var sMessage = "Are you sure you want to delete " + aSelectedContexts.length + " item(s)?";

            MessageBox.confirm(sMessage, {
                title: "Delete Items",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        that.deleteSelectedItems(aSelectedContexts);
                    }
                }
            });
        },

        deleteAllSelectedItems: function (aSelectedContexts) {
            if (!aSelectedContexts || aSelectedContexts.length === 0) {
                MessageToast.show("No items selected for deletion");
                return;
            }

            var sCurrentPath = this.getCurrentFolderPath();
            var aItems = this.oModel.getProperty(sCurrentPath);

            if (!aItems || !Array.isArray(aItems)) {
                MessageToast.show("Unable to access folder items for deletion");
                return;
            }

            // Get the document IDs of all items to delete (both files and folders)
            var aIdsToDelete = [];
            aSelectedContexts.forEach(function (oContext) {
                var sDocumentId = oContext.getProperty("documentId");
                if (sDocumentId) {
                    aIdsToDelete.push(sDocumentId);
                }
            });

            if (aIdsToDelete.length === 0) {
                MessageToast.show("Unable to identify items for deletion");
                return;
            }

            // Filter out all the items that should be deleted
            var aRemainingItems = aItems.filter(function (oItem) {
                return aIdsToDelete.indexOf(oItem.documentId) === -1;
            });

            // Check if any items were actually removed
            var iDeletedCount = aItems.length - aRemainingItems.length;

            if (iDeletedCount === 0) {
                MessageToast.show("No items were found to delete");
                return;
            }

            // Update the model with the remaining items
            this.oModel.setProperty(sCurrentPath, aRemainingItems);

            // Force model refresh to ensure UI updates
            this.oModel.refresh();

            MessageToast.show(iDeletedCount + " item(s) deleted successfully");
        },

        deleteSelectedItems: function (aSelectedContexts) {
            if (!aSelectedContexts || aSelectedContexts.length === 0) {
                MessageToast.show("No items selected for deletion");
                return;
            }

            // Filter to only include files (not folders)
            var aFileContexts = aSelectedContexts.filter(function (oContext) {
                return !oContext.getProperty("isDirectory");
            });

            if (aFileContexts.length === 0) {
                MessageToast.show("No files selected for deletion (folder deletion is not allowed)");
                return;
            }

            var sCurrentPath = this.getCurrentFolderPath();
            var aItems = this.oModel.getProperty(sCurrentPath);

            if (!aItems || !Array.isArray(aItems)) {
                MessageToast.show("Unable to access folder items for deletion");
                return;
            }

            // Get the document IDs of files to delete
            var aIdsToDelete = [];
            aFileContexts.forEach(function (oContext) {
                var sDocumentId = oContext.getProperty("documentId");
                if (sDocumentId) {
                    aIdsToDelete.push(sDocumentId);
                }
            });

            if (aIdsToDelete.length === 0) {
                MessageToast.show("Unable to identify files for deletion");
                return;
            }

            // Filter out the files that should be deleted (keep folders and other files)
            var aRemainingItems = aItems.filter(function (oItem) {
                return aIdsToDelete.indexOf(oItem.documentId) === -1;
            });

            // Check if any files were actually removed
            var iDeletedCount = aItems.length - aRemainingItems.length;

            if (iDeletedCount === 0) {
                MessageToast.show("No files were found to delete");
                return;
            }

            // Update the model with the remaining items
            this.oModel.setProperty(sCurrentPath, aRemainingItems);

            // Force model refresh to ensure UI updates
            this.oModel.refresh();

            MessageToast.show(iDeletedCount + " file(s) deleted successfully");
        }
    });
});
