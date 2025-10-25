/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/values",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library"
], function(
	merge,
	objectValues,
	Log,
	JsControlTreeModifier,
	Element,
	ControlVariantApplyAPI,
	ChangesWriteAPI,
	FlUtils,
	BaseCommand,
	rtaLibrary
) {
	"use strict";

	/**
	 * Basic implementation for the flexibility commands, that use a flex change handler.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.FlexCommand
	 */
	const FlexCommand = BaseCommand.extend("sap.ui.rta.command.FlexCommand", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				changeType: {
					type: "string"
				},
				/**
				 * Change can only be applied on js, other modifiers like xml will not work
				 */
				jsOnly: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * selector object containing id, appComponent and controlType to create a command for an element, which is not instantiated
				 */
				selector: {
					type: "object"
				},
				/**
				 * Change is independent of any Fl variant
				 */
				variantIndependent: {
					type: "boolean",
					defaultValue: false
				}
			}
		}
	});

	/**
	 * Retrieves the id of element or selector
	 *
	 * @returns {string} Id value
	 * @public
	 */
	FlexCommand.prototype.getElementId = function() {
		const oElement = this.getElement();
		return oElement ? oElement.getId() : this.getSelector().id;
	};

	/**
	 * Retrieves app component of element or selector
	 *
	 * @returns {sap.ui.core.UIComponent} App component Instance
	 * @private
	 */
	FlexCommand.prototype.getAppComponent = function() {
		const oElement = this.getElement();
		return oElement ? FlUtils.getAppComponentForControl(oElement) : this.getSelector().appComponent;
	};

	/**
	 * Prepares and stores change to be applied later
	 * (in some cases element of a command is unstable, so change needs to be created and stored upfront)
	 * @override
	 */
	FlexCommand.prototype.prepare = async function(mFlexSettings, sVariantManagementReference, sCommand) {
		try {
			let oSelector;
			if (!this.getSelector() && mFlexSettings && mFlexSettings.templateSelector) {
				oSelector = {
					id: mFlexSettings.templateSelector,
					appComponent: this.getAppComponent(),
					controlType: FlUtils.getControlType(Element.getElementById(mFlexSettings.templateSelector))
				};
				this.setSelector(oSelector);
			} else if (!this.getSelector() && this.getElement()) {
				oSelector = {
					id: this.getElement().getId(),
					appComponent: this.getAppComponent(),
					controlType: FlUtils.getControlType(this.getElement())
				};
				this.setSelector(oSelector);
			}

			this._oPreparedChange = await this._createChange(mFlexSettings, sVariantManagementReference, sCommand);
			return true;
		} catch (oError) {
			Log.error(oError.message || oError.name);
			return false;
		}
	};

	/**
	 * Returns a prepared change if exists in the command
	 * @returns {object} Prepared change instance
	 * @public
	 */
	FlexCommand.prototype.getPreparedChange = function() {
		return this._oPreparedChange;
	};

	/**
	 * @override
	 * @returns {Promise<undefined>} Resolves with undefined after finishing execution
	 */
	FlexCommand.prototype.execute = function() {
		const vChange = this.getPreparedChange();
		return this._applyChange(vChange);
	};

	/**
	 * This method converts all command constructor parameters that are flagged with group 'content' into the corresponding object.
	 * @return {object} Returns the <code>ChangeSpecificInfo</code> for change handler
	 * @protected
	 */
	FlexCommand.prototype._getChangeSpecificData = function() {
		const mProperties = this.getMetadata().getProperties();
		const mChangeSpecificData = {
			changeType: this.getChangeType(),
			content: mProperties.content?.get(this)
		};
		objectValues(mProperties)
		.filter((oProperty) => oProperty.group === "content")
		.forEach((oProperty) => {
			mChangeSpecificData.content ||= {};
			mChangeSpecificData.content[oProperty.name] = oProperty.get(this);
		});
		return mChangeSpecificData;
	};

	/**
	 * Creates a change.
	 * @param {object} mFlexSettings - Map containing the flexibility settings
	 * @param {string} sVariantManagementReference - Reference to the variant management
	 * @param {string} sCommand - Command name
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Returns the change instance
	 * @private
	 */
	FlexCommand.prototype._createChange = function(mFlexSettings, sVariantManagementReference, sCommand) {
		return this._createChangeFromData(this._getChangeSpecificData(), mFlexSettings, sVariantManagementReference, sCommand);
	};

	/**
	 * Create a Flex change from a given Change Specific Data.
	 * (This method can be reused to retrieve an Undo Change)
	 *
	 * @param {object} mChangeSpecificData - Map containing change specific data
	 * @param {object} mFlexSettings - Map containing flex settings
	 * @param {string} sVariantManagementReference - Reference to the variant management
	 * @param {string} sCommand - Command name
	 * @returns {Promise<object>} Resolves with the Change instance
	 * @private
	 */
	FlexCommand.prototype._createChangeFromData = async function(
		mChangeSpecificData,
		mFlexSettings,
		sVariantManagementReference,
		sCommand
	) {
		if (mFlexSettings) {
			mChangeSpecificData = merge({}, mChangeSpecificData, mFlexSettings);
		}
		mChangeSpecificData.jsOnly = this.getJsOnly();
		const oModel = this.getAppComponent().getModel(ControlVariantApplyAPI.getVariantModelName());
		let sVariantReference;
		if (oModel && sVariantManagementReference) {
			sVariantReference = oModel.getCurrentVariantReference(sVariantManagementReference);
		}
		if (sVariantReference && !this.getVariantIndependent()) {
			const mVariantObj = {
				variantManagementReference: sVariantManagementReference,
				variantReference: sVariantReference,
				isChangeOnStandardVariant: sVariantManagementReference === sVariantReference
			};
			mChangeSpecificData = { ...mChangeSpecificData, ...mVariantObj };
		}
		mChangeSpecificData.command = sCommand;
		mChangeSpecificData.generator = mFlexSettings.generator || rtaLibrary.GENERATOR_NAME;
		const oChange = await ChangesWriteAPI.create({
			changeSpecificData: mChangeSpecificData,
			selector: this._validateControlForChange(mFlexSettings)
		});
		// originalSelector is only present when making a change on/inside a template;
		// the selector does not work with the JS propagation hook (the template has no parent),
		// therefore the selector is changed to the parent (already the selector of the command)
		// and the original selector saved as dependent.
		// Also 'boundAggregation' property gets saved in the change content
		// ATTENTION! the change gets applied as soon as the parent is available, so there might be possible side effects with lazy loading
		if (mFlexSettings && mFlexSettings.originalSelector) {
			oChange.addDependentControl(
				mFlexSettings.originalSelector,
				"originalSelector",
				{ modifier: JsControlTreeModifier, appComponent: this.getAppComponent() }
			);
			oChange.setSelector({
				...oChange.getSelector(),
				...JsControlTreeModifier.getSelector(this.getSelector().id, this.getAppComponent())
			});
			oChange.setContent({ ...oChange.getContent(), ...mFlexSettings.content });
		}
		return oChange;
	};

	/**
	 * @override
	 */
	FlexCommand.prototype.undo = function() {
		const vControl = this.getElement() || JsControlTreeModifier.bySelector(this.getSelector());
		const oChange = this.getPreparedChange();

		return ChangesWriteAPI.revert({ change: oChange, element: vControl });
	};

	/**
	 * @private
	 * @param {sap.ui.fl.apply._internal.flexObjects.UIChange|Object} oChange Change object
	 */
	FlexCommand.prototype._applyChange = async function(oChange) {
		const oAppComponent = this.getAppComponent();
		const oSelectorElement = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);

		const mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: FlUtils.getViewForControl(oSelectorElement)
		};
		const oResult = await ChangesWriteAPI.apply({ change: oChange, element: oSelectorElement, ...mPropertyBag });
		if (!oResult.success) {
			throw new Error(oResult.error);
		}
	};

	FlexCommand.prototype._validateControlForChange = function(mFlexSettings) {
		if (mFlexSettings?.originalSelector && mFlexSettings?.content?.boundAggregation) {
			return {
				id: mFlexSettings.originalSelector,
				appComponent: this.getAppComponent(),
				controlType: FlUtils.getControlType(Element.getElementById(mFlexSettings.originalSelector))
			};
		}
		return this.getElement() || this.getSelector();
	};

	return FlexCommand;
});
