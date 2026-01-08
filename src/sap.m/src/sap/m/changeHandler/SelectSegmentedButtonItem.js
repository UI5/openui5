/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/changeHandler/condenser/Classification"
], function (Classification) {
	"use strict";

	/**
	 * Change handler for changing sap.m.SegmentedButton selected item
	 *
	 * @alias sap.m.changeHandler.SelectSegmentedButtonItem
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.144
	 */
	const SelectSegmentedButtonItem = {};

	/**
	 * Apply change: set selectedItem association and selectedKey.
	 *
	 * @param {sap.ui.fl.Change} oChange
	 * @param {sap.m.SegmentedButton} oControl
	 * @param {object} mPropertyBag
	 * @returns {Promise}
	 */
	SelectSegmentedButtonItem.applyChange = function (oChange, oControl, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;
		const oView = mPropertyBag.view;
		const oAppComponent = mPropertyBag.appComponent;
		const oChangeContent = oChange.getContent();

		if (mPropertyBag?.modifier?.targets !== "jsControlTree") {
			return Promise.reject(new Error("SelectSegmentedButtonItem change can't be applied on XML tree"));
		}

		return Promise.resolve()
			.then(oModifier.bySelector.bind(oModifier, oChangeContent.selectedItem, oAppComponent, oView))
			.then(async function (oSelectedItem) {
				// detect if selectedKey was bound
				let mSelectedKeyBinding = null;
				if (typeof oModifier.getPropertyBinding === "function") {
					mSelectedKeyBinding = await oModifier.getPropertyBinding(oControl, "selectedKey");
				} else if (typeof oModifier.getBinding === "function") {
					try {
						mSelectedKeyBinding = await oModifier.getBinding(oControl, "selectedKey");
					} catch (e) {
						mSelectedKeyBinding = null;
					}
				}

				// Save revert data
				const oRevertData = {
					originalSelectedItem: oChangeContent.previousItem || "",
					originalSelectedKey: oChangeContent.previousKey || "",
					originalSelectedKeyBinding: mSelectedKeyBinding,
					bUpdateSelectedKey: oChangeContent.bUpdateSelectedKey
				};
				oChange.setRevertData(oRevertData);

				oControl._bUpdateSelectedKey = oChangeContent.bUpdateSelectedKey;
				// Apply new association selectedItem
				if (typeof oModifier.setAssociation === "function") {
					await oModifier.setAssociation(oControl, "selectedItem", oSelectedItem, oView);
				} else if (oControl.setSelectedItem) {
					// fallback: use public API when modifier doesn't expose association setter
					oControl.setSelectedItem(oSelectedItem, false);
				}

				// If selectedKey is not bound, set the property value to the selected item's key (if available).
				if (!mSelectedKeyBinding) {
					let sNewKey = null;
					if (oSelectedItem) {
						if (typeof oModifier.getProperty === "function") {
							// try to read key from item via modifier
							try {
								sNewKey = await oModifier.getProperty(oSelectedItem, "selectedKey");
							} catch (e) {
								sNewKey = null;
							}
						}
						// fallback to public API
						if ((sNewKey === null || sNewKey === undefined) && oSelectedItem.getKey) {
							sNewKey = oSelectedItem.getKey();
						}
					}
					if (sNewKey) {
						// Only set selectedKey from the change handler when the control is NOT expected
						// to update it itself (i.e. _bUpdateSelectedKey is falsy).
						if (!oControl._bUpdateSelectedKey) {
							if (typeof oModifier.setProperty === "function") {
								await oModifier.setProperty(oControl, "selectedKey", sNewKey, oView);
							} else if (oControl.setSelectedKey) {
								oControl.setSelectedKey(sNewKey);
							}
						}
					}
				}

				return Promise.resolve();
			});
	};

	/**
	 * Revert change: restore original selectedItem association and selectedKey (value or binding).
	 *
	 * @param {sap.ui.fl.Change} oChange
	 * @param {sap.m.SegmentedButton} oControl
	 * @param {object} mPropertyBag
	 * @returns {Promise}
	 */
	SelectSegmentedButtonItem.revertChange = function (oChange, oControl, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;
		const oView = mPropertyBag.view;
		const oAppComponent = mPropertyBag.appComponent;
		const oRevertData = oChange.getRevertData();

		if (!oRevertData) {
			return Promise.resolve();
		}

		return Promise.resolve()
			.then(async function () {
				// restore association
				if (oRevertData.originalSelectedItem) {
					// originalSelectedItem might be a selector (string) or id; try to resolve it via modifier
					return Promise.resolve()
						.then(oModifier.bySelector ? oModifier.bySelector.bind(oModifier, oRevertData.originalSelectedItem, oAppComponent, oView) : Promise.resolve.bind(Promise, oRevertData.originalSelectedItem))
						.then(async function (vOriginalItem) {
							oControl._bUpdateSelectedKey = oRevertData.bUpdateSelectedKey;
							if (typeof oModifier.setAssociation === "function") {
								await oModifier.setAssociation(oControl, "selectedItem", vOriginalItem || "", oView);
							} else if (oControl.setSelectedItem) {
								oControl.setSelectedItem(vOriginalItem || "", false);
							}
							return vOriginalItem;
						});
				}
				// if no original selected item, clear association
				if (typeof oModifier.setAssociation === "function") {
					await oModifier.setAssociation(oControl, "selectedItem", "", oView);
				} else if (oControl.setSelectedItem) {
					oControl.setSelectedItem("", false);
				}
				return Promise.resolve();
			})
			.then(async function () {
				// restore selectedKey binding or value
				if (oRevertData.originalSelectedKeyBinding) {
					// attempt to reapply binding using modifier.bindProperty (fallbacks)
					if (typeof oModifier.bindProperty === "function") {
						try {
							await oModifier.bindProperty(oControl, "selectedKey", oRevertData.originalSelectedKeyBinding, oView);
						} catch (e) {
							// if bindProperty fails, set raw value as fallback
							if (typeof oModifier.setProperty === "function") {
								await oModifier.setProperty(oControl, "selectedKey", oRevertData.originalSelectedKey, oView);
							} else if (oControl.setSelectedKey) {
								oControl.setSelectedKey(oRevertData.originalSelectedKey);
							}
						}
					} else {
						// no bindProperty available on modifier: try public API setSelectedKey as fallback (this will unbind but it's the best we can do)
						if (oControl.setSelectedKey) {
							oControl.setSelectedKey(oRevertData.originalSelectedKey);
						}
					}
				} else {
					// original selectedKey was a plain value -> restore it
					if (typeof oModifier.setProperty === "function") {
						await oModifier.setProperty(oControl, "selectedKey", oRevertData.originalSelectedKey, oView);
					} else if (oControl.setSelectedKey) {
						oControl.setSelectedKey(oRevertData.originalSelectedKey);
					}
				}
			})
			.then(function () {
				// clear revert data
				oChange.resetRevertData();
			});
	};

	SelectSegmentedButtonItem.completeChangeContent = function () {	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	SelectSegmentedButtonItem.getCondenserInfo = function (oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: Classification.LastOneWins,
			uniqueKey: "selectSegmentedButtonItem"
		};
	};

		return SelectSegmentedButtonItem;
});
