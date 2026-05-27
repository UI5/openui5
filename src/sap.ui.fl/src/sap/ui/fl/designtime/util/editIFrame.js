/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/deepClone",
	"sap/ui/core/Element",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog"
], function(
	_isEqual,
	deepClone,
	Element,
	AddIFrameDialog
) {
	"use strict";

	return async function editIFrame(oIFrame) {
		const oAddIFrameDialog = new AddIFrameDialog();
		const oInitialSettings = oIFrame.get_settings();
		const mRenameInfo = oIFrame.getRenameInfo();

		// The title of the iFrame container could have changed
		// so we need to retrieve it before opening the dialog
		if (mRenameInfo) {
			const oContainer = Element.getElementById(mRenameInfo.sourceControlId);
			oInitialSettings.title = oContainer.getProperty(mRenameInfo.propertyName);
		}

		const mURLParameters = await AddIFrameDialog.buildUrlBuilderParametersFor(oIFrame);
		const mDialogSettings = {
			parameters: mURLParameters,
			frameUrl: oInitialSettings.url,
			frameWidth: oInitialSettings.width,
			frameHeight: oInitialSettings.height,
			title: oInitialSettings.title,
			asContainer: !!oInitialSettings.title,
			advancedSettings: deepClone(oInitialSettings.advancedSettings),
			allowFocusWithoutUserActivation: oInitialSettings.allowFocusWithoutUserActivation ?? true,
			updateMode: true
		};
		const mSettings = await oAddIFrameDialog.open(mDialogSettings, oIFrame);
		if (!mSettings) {
			return []; // No change
		}
		const aChanges = [];
		let bContentChanged = false;
		const oNewContent = {
			url: oInitialSettings.url,
			height: oInitialSettings.height,
			width: oInitialSettings.width,
			advancedSettings: oInitialSettings.advancedSettings
		};
		// The dialog only returns allowFocusWithoutUserActivation when the browser supports
		// the Permissions Policy. When the value is missing, leave the existing setting
		// untouched: legacy iframes keep the implicit default (true) and iframes that already
		// have a persisted value keep that value. Only seed and compare the property when the
		// dialog actually returned it.
		if (mSettings.allowFocusWithoutUserActivation !== undefined) {
			oNewContent.allowFocusWithoutUserActivation = oInitialSettings.allowFocusWithoutUserActivation ?? true;
		}

		if (mSettings.frameHeight + mSettings.frameHeightUnit !== oInitialSettings.height) {
			bContentChanged = true;
			oNewContent.height = mSettings.frameHeight + mSettings.frameHeightUnit;
		}
		if (mSettings.frameWidth + mSettings.frameWidthUnit !== oInitialSettings.width) {
			bContentChanged = true;
			oNewContent.width = mSettings.frameWidth + mSettings.frameWidthUnit;
		}
		if (mSettings.frameUrl !== oInitialSettings.url) {
			bContentChanged = true;
			oNewContent.url = mSettings.frameUrl;
		}
		if (!_isEqual(mSettings.advancedSettings, oInitialSettings.advancedSettings)) {
			bContentChanged = true;
			oNewContent.advancedSettings = mSettings.advancedSettings;
		}
		if (
			mSettings.allowFocusWithoutUserActivation !== undefined
			&& (mSettings.allowFocusWithoutUserActivation ?? true) !== (oInitialSettings.allowFocusWithoutUserActivation ?? true)
		) {
			bContentChanged = true;
			oNewContent.allowFocusWithoutUserActivation = mSettings.allowFocusWithoutUserActivation;
		}

		if (bContentChanged) {
			aChanges.push({
				selectorControl: oIFrame,
				changeSpecificData: {
					changeType: "updateIFrame",
					content: oNewContent
				}
			});
		}

		// If the title changes a rename change must be created
		if (mSettings.title !== oInitialSettings.title) {
			const mRenameChange = {
				selectorControl: Element.getElementById(mRenameInfo.selectorControlId),
				changeSpecificData: {
					changeType: "rename",
					content: {
						value: mSettings.title
					}
				}
			};
			aChanges.push(mRenameChange);
		}
		return aChanges;
	};
});