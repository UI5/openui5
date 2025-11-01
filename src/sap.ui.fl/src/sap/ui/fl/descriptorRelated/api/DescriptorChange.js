/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager"
], function(
	fnBaseMerge,
	FlexObjectFactory,
	UIChangeManager,
	FlexObjectManager
) {
	"use strict";

	/**
	 * Descriptor Related
	 * @namespace
	 * @name sap.ui.fl.descriptorRelated
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */

	/**
	 * Descriptor Related Apis
	 * @namespace
	 * @name sap.ui.fl.descriptorRelated.api
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */

	/**
	 * Descriptor Change
	 *
	 * @param {object} mChangeFile change file
	 * @param {sap.ui.fl.descriptorRelated.api.DescriptorInlineChange} oInlineChange inline change object
	 * @param {object} oAppComponent Application component
	 *
	 * @constructor
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorChange
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	const DescriptorChange = function(mChangeFile, oInlineChange, oAppComponent) { // so far, parameter correspond to inline change format
		this._mChangeFile = mChangeFile;
		this._mChangeFile.packageName = "";
		this._oInlineChange = oInlineChange;
		this._oAppComponent = oAppComponent;
	};

	/**
	 * Submits the descriptor change to the backend
	 *
	 * @param {object} [oAppComponent] - Application component
	 * @return {Promise} resolving after all changes have been saved
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorChange.prototype.submit = function(oAppComponent) {
		this.store(oAppComponent);

		return FlexObjectManager.saveFlexObjects({
			reference: this._mChangeFile.reference,
			selector: this._mChangeFile.selector
		});
	};

	/**
	 * Stores the descriptor change in change persistence
	 *
	 * @param {object} [oAppComponent] - Application component
	 * @return {object} change object
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorChange.prototype.store = function(oAppComponent) {
		const sReference = this._mChangeFile.reference;
		const oChange = this._getChangeToSubmit();
		UIChangeManager.addDirtyChanges(sReference, [oChange], oAppComponent || this._oAppComponent);

		return oChange;
	};

	DescriptorChange.prototype._getChangeToSubmit = function() {
		return FlexObjectFactory.createAppDescriptorChange(this._getMap());
	};

	DescriptorChange.prototype._getMap = function() {
		var mInlineChange = this._oInlineChange.getMap();

		this._mChangeFile.content = mInlineChange.content;
		this._mChangeFile.texts = mInlineChange.texts;
		return this._mChangeFile;
	};

	/**
	 * Returns a copy of the JSON object of the descriptor change
	 *
	 * @return {object} copy of JSON object of the descriptor change
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorChange.prototype.getJson = function() {
		return fnBaseMerge({}, this._getMap());
	};

	return DescriptorChange;
});