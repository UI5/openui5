/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/api/ExtensionPointRegistryAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils"
], function(
	FlexCommand,
	JsControlTreeModifier,
	ExtensionPointRegistryAPI,
	ChangesWriteAPI,
	Utils
) {
	"use strict";

	/**
	 * Add a control from a XML fragment
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.76
	 * @alias sap.ui.rta.command.AddXMLAtExtensionPoint
	 */
	const AddXMLAtExtensionPoint = FlexCommand.extend("sap.ui.rta.command.AddXMLAtExtensionPoint", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				fragment: {
					type: "string",
					group: "content"
				},
				fragmentPath: {
					type: "string",
					group: "content"
				},
				changeType: {
					type: "string",
					defaultValue: "addXMLAtExtensionPoint"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * Overridden to suppress the {} being recognized as binding strings.
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype.bindProperty = function(...aArgs) {
		const [sName, oBindingInfo] = aArgs;
		if (sName === "fragment") {
			return this.setFragment(oBindingInfo.bindingString);
		}
		return FlexCommand.prototype.bindProperty.apply(this, aArgs);
	};

	AddXMLAtExtensionPoint.prototype.getAppComponent = function() {
		const oView = this.getSelector().view;
		return Utils.getAppComponentForControl(oView);
	};

	/**
	 * Normally when the changes are loaded, the backend preloads the fragment as a module,
	 * When first applying a change we need to do the same.
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype._applyChange = async function(vChange) {
		// preload the module to be applicable in this session
		const mModulePreloads = {};
		mModulePreloads[vChange.getFlexObjectMetadata().moduleName] = this.getFragment();
		sap.ui.require.preload(mModulePreloads);

		const oChange = vChange.change || vChange;
		const oAppComponent = this.getAppComponent();
		const oSelector = oChange.getSelector();
		const oView = JsControlTreeModifier.bySelector(oSelector.viewSelector, oAppComponent);
		const oExtensionPointInfo = ExtensionPointRegistryAPI.getExtensionPointInfo({
			name: oSelector.name,
			view: oView
		});
		const oSelectorElement = oExtensionPointInfo.targetControl;
		oChange.setExtensionPointInfo(oExtensionPointInfo);

		const mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: oView
		};
		const oResult = await ChangesWriteAPI.apply({ change: oChange, element: oSelectorElement, ...mPropertyBag });
		if (!oResult.success) {
			throw Error(oResult.error);
		}
		return oResult;
	};

	return AddXMLAtExtensionPoint;
});
