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
	 * @since 1.144
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
					originalSelectedKeyBinding: mSelectedKeyBinding
						? { path: mSelectedKeyBinding.path, model: mSelectedKeyBinding.model, parts: mSelectedKeyBinding.parts }
						: null,
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
	SelectSegmentedButtonItem.revertChange = async function (oChange, oControl, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;
		const oView = mPropertyBag.view;
		const oAppComponent = mPropertyBag.appComponent;
		const oRevertData = oChange.getRevertData();

		if (!oRevertData) {
			return;
		}

		// Restore association
		let vOriginalItem = "";
		if (oRevertData.originalSelectedItem && oModifier.bySelector) {
			vOriginalItem = await oModifier.bySelector(oRevertData.originalSelectedItem, oAppComponent, oView) || "";
		}

		oControl._bUpdateSelectedKey = oRevertData.bUpdateSelectedKey;

		if (typeof oModifier.setAssociation === "function") {
			await oModifier.setAssociation(oControl, "selectedItem", vOriginalItem, oView);
		} else if (oControl.setSelectedItem) {
			oControl.setSelectedItem(vOriginalItem, false);
		}

		// Restore selectedKey binding or value
		if (oRevertData.originalSelectedKeyBinding && typeof oModifier.bindProperty === "function") {
			try {
				await oModifier.bindProperty(oControl, "selectedKey", oRevertData.originalSelectedKeyBinding, oView);
			} catch (e) {
				await this._setSelectedKey(oModifier, oControl, oRevertData.originalSelectedKey, oView);
			}
		} else {
			await this._setSelectedKey(oModifier, oControl, oRevertData.originalSelectedKey, oView);
		}

		oChange.resetRevertData();
	};

	SelectSegmentedButtonItem._setSelectedKey = async function (oModifier, oControl, sKey, oView) {
		if (typeof oModifier.setProperty === "function") {
			await oModifier.setProperty(oControl, "selectedKey", sKey, oView);
		} else if (oControl.setSelectedKey) {
			oControl.setSelectedKey(sKey);
		}
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
}, /* bExport= */ true);
