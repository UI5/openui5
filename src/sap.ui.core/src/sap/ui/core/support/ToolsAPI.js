/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/ui/VersionInfo",
	"sap/ui/core/AnimationMode",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/ElementMetadata",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/core/Supportability",
	"sap/ui/core/Theming",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/jquery"
],
	function(
		Formatting,
		Localization,
		VersionInfo,
		AnimationMode,
		ControlBehavior,
		Core,
		Element,
		ElementMetadata,
		Lib,
		Locale,
		Supportability,
		Theming,
		LoaderExtensions,
		jQuery
	) {
		'use strict';

		// ================================================================================
		// Technical Information
		// ================================================================================

		/**
		 * Creates an object with the libraries and their version from the version info file.
		 * @returns {Object}
		 * @private
		 */
		function _getLibraries() {
			var libraries = VersionInfo._content ? VersionInfo._content.libraries : undefined;
			var formattedLibraries = Object.create(null);

			if (libraries !== undefined) {
				libraries.forEach(function (element, index, array) {
					formattedLibraries[element.name] = element.version;
				});
			}

			return formattedLibraries;
		}

		/**
		 * Creates an object with the loaded libraries and their version.
		 * @returns {Object}
		 * @private
		 */
		function _getLoadedLibraries() {
			var libraries = Lib.all();
			var formattedLibraries = Object.create(null);

			Object.keys(Lib.all()).forEach(function (element, index, array) {
				formattedLibraries[element] = libraries[element].version;
			});

			return formattedLibraries;
		}

		/**
		 * Creates a simple object with all URL parameters.
		 * @returns {Object<string,string[]>} Map of parameter value arrays keyed by parameter names
		 */
		function getURLParameters() {
			var oParams = new URLSearchParams(window.location.search);
			return Array.from(oParams.keys()).reduce(function(oResult, sKey) {
				oResult[sKey] = oParams.getAll(sKey);
				return oResult;
			}, {});
		}

		/**
		 * Gets all the relevant information for the framework.
		 * @returns {Object}
		 * @private
		 */
		function _getFrameworkInformation() {
			return {
				commonInformation: {
					version: Core.version,
					buildTime: Core.buildinfo.buildtime,
					lastChange: Core.buildinfo.lastchange,
					jquery: jQuery.fn.jquery,
					userAgent: navigator.userAgent,
					applicationHREF: window.location.href,
					documentTitle: document.title,
					documentMode: document.documentMode || '',
					debugMode: Supportability.isDebugModeEnabled(),
					statistics: Supportability.isStatisticsEnabled()
				},
				configurationBootstrap: window['sap-ui-config'] || Object.create(null),
				configurationComputed: {
					theme: Theming.getTheme(),
					language: Localization.getLanguage(),
					formatLocale: new Locale(Formatting.getLanguageTag()),
					accessibility: ControlBehavior.isAccessibilityEnabled(),

					animation: (ControlBehavior.getAnimationMode() !== AnimationMode.minimal &&
								ControlBehavior.getAnimationMode() !== AnimationMode.none),

					rtl: Localization.getRTL(),
					debug: Supportability.isDebugModeEnabled(),
					inspect: Supportability.isControlInspectorEnabled(),
					originInfo: Supportability.collectOriginInfo()
				},
				libraries: _getLibraries(),
				loadedLibraries: _getLoadedLibraries(),
				loadedModules: LoaderExtensions.getAllRequiredModules().sort(),
				URLParameters: getURLParameters()
			};
		}

		// ================================================================================
		// Control tree Information
		// ================================================================================

		/**
		 * Represents a node in the UI5 rendered control tree structure.
		 *
		 * @typedef {object} sap.ui.core.support.ToolsAPI.ControlTreeNode
		 * @property {string} id - The control's unique identifier
		 * @property {string} name - The fully qualified control class name (e.g., "sap.m.Button") or "sap-ui-area" for UI areas
		 * @property {string} type - Node type: "sap-ui-control" for controls, "data-sap-ui" for UI areas
		 * @property {Array<sap.ui.core.support.ToolsAPI.ControlTreeNode>} content - Child nodes (recursive)
		 * @property {Object<string, *>} [data] - Optional key-value map of control properties/associations
		 * @private
		 */

		/**
		 * Name space for all methods related to control trees
		 */
		var controlTree = {
			/**
			 * Creates data model of the rendered controls as a tree.
			 * @param {Element} nodeElement - HTML DOM element from which the function will star searching.
			 * @param {Array} resultArray - Array that will contains all the information.
			 * @param {Object} [oOptions] - Optional settings for enriching tree nodes.
			 * @param {boolean} [oOptions.includeAssignedProperties] - Whether to include assigned properties in each node.
			 * @param {boolean} [oOptions.includeAssignedAssociations] - Whether to include assigned associations in each node.
			 * @param {boolean} [oOptions.includeTooltipText] - Whether to include tooltip text in each node.
			 * @private
			 */
			_createRenderedTreeModel: function (nodeElement, resultArray, oOptions) {
				var node = nodeElement;
				var childNode = node.firstElementChild;
				var results = resultArray;
				var subResult = results;
				var related = node.getAttribute('data-sap-ui-related');
				var id = related ? related : node.id;
				var control = Element.getElementById(id);

				if ((node.getAttribute('data-sap-ui') || node.getAttribute('data-sap-ui-related')) && control) {
					var oControlNode = {
						id: control.getId(),
						name: control.getMetadata().getName(),
						type: 'sap-ui-control',
						content: []
					};

					// Enrich node with data if options are provided
					var oData = this._getControlData(control, oOptions);
					if (Object.keys(oData).length > 0) {
						oControlNode.data = oData;
					}

					results.push(oControlNode);
					subResult = results[results.length - 1].content;
				} else if (node.getAttribute('data-sap-ui-area')) {
					results.push({
						id: node.id,
						name: 'sap-ui-area',
						type: 'data-sap-ui',
						content: []
					});

					subResult = results[results.length - 1].content;
				}

				while (childNode) {
					this._createRenderedTreeModel(childNode, subResult, oOptions);
					childNode = childNode.nextElementSibling;
				}
			},

			/**
			 * Retrieves runtime data for a control based on the provided options.
			 * @param {sap.ui.core.Element} oControl - The UI5 control.
			 * @param {Object} [oOptions] - Optional settings.
			 * @param {boolean} [oOptions.includeAssignedProperties] - Whether to include assigned properties.
			 * @param {boolean} [oOptions.includeAssignedAssociations] - Whether to include assigned associations.
			 * @param {boolean} [oOptions.includeTooltipText] - Whether to include tooltip text.
			 * @returns {Object} An object containing the requested data.
			 * @private
			 */
			_getControlData: function (oControl, oOptions) {
				var oData = {};
				if (!oOptions || !oControl) {
					return oData;
				}

				if (oOptions.includeAssignedProperties && oControl.mProperties) {
					Object.assign(oData, _filterEmptyValues(oControl.mProperties));
				}

				if (oOptions.includeAssignedAssociations && oControl.mAssociations) {
					Object.assign(oData, _filterEmptyValues(oControl.mAssociations));
				}

				if (oOptions.includeTooltipText && typeof oControl.getTooltip_Text === 'function') {
					var sTooltipText = (oControl.getTooltip_Text() || "").trim();
					if (sTooltipText) {
						oData.tooltip = sTooltipText;
					}
				}

				return oData;
			}
		};

		function _filterEmptyValues(oMap) {
			return Object.fromEntries(
					Object.entries(oMap).filter(function(aEntry) {
					var vValue = aEntry[1];
					var bIsEmptyString = vValue === "";
					var bIsEmptyArray = Array.isArray(vValue) && vValue.length === 0;
					return !bIsEmptyString && !bIsEmptyArray;
				})
			);
		}

		// ================================================================================
		// Control Information
		// ================================================================================

		/**
		 * @typedef {Object} sap.ui.core.support.ToolsAPI.ControlInfoMeta
		 * @property {string} controlName - Fully qualified class name of the control that defines this group
		 * @private
		 */

		/**
		 * @typedef {Object} sap.ui.core.support.ToolsAPI.PropertyInfo
		 * @property {*} value - Current runtime value of the property
		 * @property {string} type - Data type name (e.g. "string", "boolean")
		 * @private
		 */

		/**
		 * @typedef {Object} sap.ui.core.support.ToolsAPI.PropertyInfoContainer
		 * @property {sap.ui.core.support.ToolsAPI.ControlInfoMeta} meta
		 * @property {Object.<string, sap.ui.core.support.ToolsAPI.PropertyInfo>} properties - Map of property name to property info
		 * @private
		 */

		/**
		 * @typedef {Object} sap.ui.core.support.ToolsAPI.AggregationInfo
		 * @property {string} type - Fully qualified class name of the aggregated objects (e.g. "sap.ui.core.Control")
		 * @property {number} count - Number of items currently in the aggregation (1 for non-multiple aggregations)
		 * @private
		 */

		/**
		 * @typedef {Object} sap.ui.core.support.ToolsAPI.AggregationInfoContainer
		 * @property {sap.ui.core.support.ToolsAPI.ControlInfoMeta} meta
		 * @property {Object.<string, sap.ui.core.support.ToolsAPI.AggregationInfo>} aggregations - Map of aggregation name to aggregation info
		 * @private
		 */

		/**
		 * @typedef {Object} sap.ui.core.support.ToolsAPI.AssociationInfo
		 * @property {string} type - Fully qualified class name of the associated objects (e.g. "sap.ui.core.Control")
		 * @property {string|string[]|object|null} value - Current association value: an ID string, array of ID strings, an object, or null when unset
		 * @private
		 */

		/**
		 * @typedef {Object} sap.ui.core.support.ToolsAPI.AssociationInfoContainer
		 * @property {sap.ui.core.support.ToolsAPI.ControlInfoMeta} meta
		 * @property {Object.<string, sap.ui.core.support.ToolsAPI.AssociationInfo>} associations - Map of association name to association info
		 * @private
		 */

		/**
		 * Name space for all information relevant for UI5 control
		 */
		var controlInformation = {

			// Control Properties Info
			// ================================================================================

			/**
			 * Creates an object with the control properties that are not inherited.
			 * @param {Object} control - UI5 control.
			 * @returns {sap.ui.core.support.ToolsAPI.PropertyInfoContainer}
			 * @private
			 */
			_getOwnProperties: function (control) {
				var result = Object.create(null);
				var controlPropertiesFromMetadata = control.getMetadata().getProperties();

				result.meta = Object.create(null);
				result.meta.controlName = control.getMetadata().getName();

				result.properties = Object.create(null);
				Object.keys(controlPropertiesFromMetadata).forEach(function (key) {
					result.properties[key] = Object.create(null);
					result.properties[key].value = control.getProperty(key);
					result.properties[key].type = controlPropertiesFromMetadata[key].getType().getName ? controlPropertiesFromMetadata[key].getType().getName() : '';
				});

				return result;
			},

			/**
			 * Copies the inherited properties of a UI5 control from the metadata.
			 * @param {Object} control - UI5 Control.
			 * @param {Object} inheritedMetadata - UI5 control metadata.
			 * @returns {sap.ui.core.support.ToolsAPI.PropertyInfoContainer}
			 * @private
			 */
			_copyInheritedProperties: function (control, inheritedMetadata) {
				var inheritedMetadataProperties = inheritedMetadata.getProperties();
				var result = Object.create(null);

				result.meta = Object.create(null);
				result.meta.controlName = inheritedMetadata.getName();

				result.properties = Object.create(null);
				Object.keys(inheritedMetadataProperties).forEach(function (key) {
					result.properties[key] = Object.create(null);
					result.properties[key].value = inheritedMetadataProperties[key].get(control);
					result.properties[key].type = inheritedMetadataProperties[key].getType().getName ? inheritedMetadataProperties[key].getType().getName() : '';
				});

				return result;
			},

			/**
			 * Creates an array with the control properties that are inherited.
			 * @param {Object} control - UI5 control.
			 * @returns {Array<sap.ui.core.support.ToolsAPI.PropertyInfoContainer>}
			 * @private
			 */
			_getInheritedProperties: function (control) {
				var result = [];
				var inheritedMetadata = control.getMetadata().getParent();

				while (inheritedMetadata instanceof ElementMetadata) {
					result.push(this._copyInheritedProperties(control, inheritedMetadata));
					inheritedMetadata = inheritedMetadata.getParent();
				}

				return result;
			},

			/**
			 * Creates an object with all control properties.
			 * @param {string} controlId
			 * @returns {{ own: sap.ui.core.support.ToolsAPI.PropertyInfoContainer, inherited: Array<sap.ui.core.support.ToolsAPI.PropertyInfoContainer> }}
			 * @private
			 */
			_getProperties: function (controlId) {
				var control = Element.getElementById(controlId);
				var properties = Object.create(null);

				if (control) {
					properties.own = this._getOwnProperties(control);
					properties.inherited = this._getInheritedProperties(control);
				}

				return properties;
			},

			// Control Aggregations Info
			// ================================================================================

			/**
			 * Creates an object with the control aggregations that are not inherited.
			 * @param {Object} oControl - UI5 control.
			 * @returns {sap.ui.core.support.ToolsAPI.AggregationInfoContainer}
			 * @private
			 */
			_getOwnAggregations: function (oControl) {
				var oResult = Object.create(null);
				var mAggregations = oControl.getMetadata().getAggregations();

				oResult.meta = Object.create(null);
				oResult.meta.controlName = oControl.getMetadata().getName();

				oResult.aggregations = Object.create(null);
				Object.keys(mAggregations).forEach(function (sKey) {
					var oAggregation = mAggregations[sKey];
					var vItems = oControl[oAggregation._sGetter]();
					oResult.aggregations[sKey] = Object.create(null);
					oResult.aggregations[sKey].type = oAggregation.type;
					oResult.aggregations[sKey].count = oAggregation.multiple ? vItems.length : 1;
				});

				return oResult;
			},

			/**
			 * Copies the inherited aggregations of a UI5 control from the metadata.
			 * @param {Object} oControl - UI5 control.
			 * @param {Object} oInheritedMetadata - UI5 control metadata.
			 * @returns {sap.ui.core.support.ToolsAPI.AggregationInfoContainer}
			 * @private
			 */
			_copyInheritedAggregations: function (oControl, oInheritedMetadata) {
				var mAggregations = oInheritedMetadata.getAggregations();
				var oResult = Object.create(null);

				oResult.meta = Object.create(null);
				oResult.meta.controlName = oInheritedMetadata.getName();

				oResult.aggregations = Object.create(null);
				Object.keys(mAggregations).forEach(function (sKey) {
					var oAggregation = mAggregations[sKey];
					var vItems = oControl[oAggregation._sGetter]();
					oResult.aggregations[sKey] = Object.create(null);
					oResult.aggregations[sKey].type = oAggregation.type;
					oResult.aggregations[sKey].count = oAggregation.multiple ? vItems.length : 1;
				});

				return oResult;
			},

			/**
			 * Creates an array with the control aggregations that are inherited.
			 * @param {Object} oControl - UI5 control.
			 * @returns {Array<sap.ui.core.support.ToolsAPI.AggregationInfoContainer>}
			 * @private
			 */
			_getInheritedAggregations: function (oControl) {
				var aResult = [];
				var oInheritedMetadata = oControl.getMetadata().getParent();

				while (oInheritedMetadata instanceof ElementMetadata) {
					aResult.push(this._copyInheritedAggregations(oControl, oInheritedMetadata));
					oInheritedMetadata = oInheritedMetadata.getParent();
				}

				return aResult;
			},

			/**
			 * Creates an object with all control aggregations.
			 * @param {string} sControlId
			 * @returns {{ own: sap.ui.core.support.ToolsAPI.AggregationInfoContainer, inherited: Array<sap.ui.core.support.ToolsAPI.AggregationInfoContainer> }}
			 * @private
			 */
			_getAggregations: function (sControlId) {
				var oControl = Element.getElementById(sControlId);
				var oAggregations = Object.create(null);

				if (oControl) {
					oAggregations.own = this._getOwnAggregations(oControl);
					oAggregations.inherited = this._getInheritedAggregations(oControl);
				}

				return oAggregations;
			},

			// Control Associations Info
			// ================================================================================

			/**
			 * Creates an object with the control associations that are not inherited.
			 * @param {Object} oControl - UI5 control.
			 * @returns {sap.ui.core.support.ToolsAPI.AssociationInfoContainer}
			 * @private
			 */
			_getOwnAssociations: function (oControl) {
				var oResult = Object.create(null);
				var mAssociations = oControl.getMetadata().getAssociations();

				oResult.meta = Object.create(null);
				oResult.meta.controlName = oControl.getMetadata().getName();

				oResult.associations = Object.create(null);
				Object.keys(mAssociations).forEach(function (sKey) {
					var oAssociation = mAssociations[sKey];
					oResult.associations[sKey] = Object.create(null);
					oResult.associations[sKey].type = oAssociation.type;
					oResult.associations[sKey].value = oControl[oAssociation._sGetter]();
				});

				return oResult;
			},

			/**
			 * Copies the inherited associations of a UI5 control from the metadata.
			 * @param {Object} oControl - UI5 control.
			 * @param {Object} oInheritedMetadata - UI5 control metadata.
			 * @returns {sap.ui.core.support.ToolsAPI.AssociationInfoContainer}
			 * @private
			 */
			_copyInheritedAssociations: function (oControl, oInheritedMetadata) {
				var mAssociations = oInheritedMetadata.getAssociations();
				var oResult = Object.create(null);

				oResult.meta = Object.create(null);
				oResult.meta.controlName = oInheritedMetadata.getName();

				oResult.associations = Object.create(null);
				Object.keys(mAssociations).forEach(function (sKey) {
					var oAssociation = mAssociations[sKey];
					oResult.associations[sKey] = Object.create(null);
					oResult.associations[sKey].type = oAssociation.type;
					oResult.associations[sKey].value = oControl[oAssociation._sGetter]();
				});

				return oResult;
			},

			/**
			 * Creates an array with the control associations that are inherited.
			 * @param {Object} oControl - UI5 control.
			 * @returns {Array<sap.ui.core.support.ToolsAPI.AssociationInfoContainer>}
			 * @private
			 */
			_getInheritedAssociations: function (oControl) {
				var aResult = [];
				var oInheritedMetadata = oControl.getMetadata().getParent();

				while (oInheritedMetadata instanceof ElementMetadata) {
					aResult.push(this._copyInheritedAssociations(oControl, oInheritedMetadata));
					oInheritedMetadata = oInheritedMetadata.getParent();
				}

				return aResult;
			},

			/**
			 * Creates an object with all control associations.
			 * @param {string} sControlId
			 * @returns {{ own: sap.ui.core.support.ToolsAPI.AssociationInfoContainer, inherited: Array<sap.ui.core.support.ToolsAPI.AssociationInfoContainer> }}
			 * @private
			 */
			_getAssociations: function (sControlId) {
				var oControl = Element.getElementById(sControlId);
				var oAssociations = Object.create(null);

				if (oControl) {
					oAssociations.own = this._getOwnAssociations(oControl);
					oAssociations.inherited = this._getInheritedAssociations(oControl);
				}

				return oAssociations;
			},

			// Binding Info
			// ================================================================================

			/**
			 * Creates an object with the context model of a UI5 control.
			 * @param {Object} control
			 * @param {string} controlProperty
			 * @returns {Object}
			 * @private
			 */
			_getModelFromContext: function (control, controlProperty) {
				var bindingContext = control.getBinding(controlProperty);
				var bindingContextModel = bindingContext.getModel();
				var bindingInfoParts = (control.getBindingInfo(controlProperty).parts) ? control.getBindingInfo(controlProperty).parts : [];
				var modelNames = [];

				for (var i = 0; i < bindingInfoParts.length; i++) {
					modelNames.push(bindingInfoParts[i].model);
				}

				var model = {
					names: modelNames,
					path: bindingContext.getPath()
				};

				if (bindingContextModel) {
					model.mode = bindingContextModel.getDefaultBindingMode();
					model.type = bindingContextModel.getMetadata().getName();
					model.data = bindingContextModel.getData ? bindingContextModel.getData('/') : undefined;
				}

				return model;
			},

			/**
			 * Creates an object with the properties bindings of a UI5 control.
			 * @param {Object} control
			 * @returns {Object}
			 * @private
			 */
			_getBindDataForProperties: function (control) {
				var properties = control.getMetadata().getAllProperties();
				var propertiesBindingData = Object.create(null);

				for (var key in properties) {
					if (properties.hasOwnProperty(key) && control.getBinding(key)) {
						propertiesBindingData[key] = Object.create(null);
						propertiesBindingData[key].path = control.getBinding(key).getPath();
						propertiesBindingData[key].value = control.getBinding(key).getValue();
						propertiesBindingData[key].type = control.getMetadata().getProperty(key).getType().getName ? control.getMetadata().getProperty(key).getType().getName() : '';
						propertiesBindingData[key].mode = control.getBinding(key).getBindingMode();
						propertiesBindingData[key].model = this._getModelFromContext(control, key);
					}
				}

				return propertiesBindingData;
			},

			/**
			 * Creates an object with the agregations bindings of a UI5 control.
			 * @param {Object} control
			 * @returns {Object}
			 * @private
			 */
			_getBindDataForAggregations: function (control) {
				var aggregations = control.getMetadata().getAllAggregations();
				var aggregationsBindingData = Object.create(null);

				for (var key in aggregations) {
					if (aggregations.hasOwnProperty(key) && control.getBinding(key)) {
						aggregationsBindingData[key] = Object.create(null);
						aggregationsBindingData[key].model = this._getModelFromContext(control, key);
					}
				}

				return aggregationsBindingData;
			}
		};

		// ================================================================================
		// Public API
		// ================================================================================

		/**
		 * Global object that provide common information for all support tools
		 * @type {{getFrameworkInformation: Function, getRenderedControlTree: Function, getControlProperties: Function, getControlBindingInformation: Function}}
		 */
		return {

			/**
			 * Common information about the framework
			 * @returns {*}
			 */
			getFrameworkInformation: _getFrameworkInformation,

			/**
			 * Array model of the rendered control as a tree.
			 *
			 * @param {Object} [oOptions] - Optional settings for enriching tree nodes.
			 * @param {boolean} [oOptions.includeAssignedProperties] - Whether to include assigned properties in each node's data.
			 * @param {boolean} [oOptions.includeAssignedAssociations] - Whether to include assigned associations in each node's data.
			 * @param {boolean} [oOptions.includeTooltipText] - Whether to include tooltip text in each node's data.
			 * @returns {Array<sap.ui.core.support.ToolsAPI.ControlTreeNode>} Array of root control tree nodes
			 */
			getRenderedControlTree: function (oOptions) {
				oOptions = oOptions || {};
				var renderedControlTreeModel = [];
				controlTree._createRenderedTreeModel(document.body, renderedControlTreeModel, oOptions);

				return renderedControlTreeModel;
			},

			/**
			 * Gets all control properties.
			 * @param {string} controlId
			 * @returns {{ own: sap.ui.core.support.ToolsAPI.PropertyInfoContainer, inherited: Array<sap.ui.core.support.ToolsAPI.PropertyInfoContainer> }}
			 */
			getControlProperties: function (controlId) {
				return controlInformation._getProperties(controlId);
			},

			/**
			 * Gets control binding information.
			 * @param {string} controlId
			 * @returns {Object}
			 */
			getControlBindings: function (controlId) {
				var result = Object.create(null);
				var control = Element.getElementById(controlId);
				var bindingContext;

				if (!control) {
					return result;
				}

				bindingContext = control.getBindingContext();

				result.meta = Object.create(null);
				result.contextPath = bindingContext ? bindingContext.getPath() : null;
				result.aggregations = controlInformation._getBindDataForAggregations(control);
				result.properties = controlInformation._getBindDataForProperties(control);

				return result;
			},

			/**
			 * Gets all control aggregations.
			 * @param {string} controlId - The ID of the control.
			 * @returns {{ own: sap.ui.core.support.ToolsAPI.AggregationInfoContainer, inherited: Array<sap.ui.core.support.ToolsAPI.AggregationInfoContainer> }}
			 */
			getControlAggregations: function (controlId) {
				return controlInformation._getAggregations(controlId);
			},

			/**
			 * Gets all control associations.
			 * @param {string} controlId - The ID of the control.
			 * @returns {{ own: sap.ui.core.support.ToolsAPI.AssociationInfoContainer, inherited: Array<sap.ui.core.support.ToolsAPI.AssociationInfoContainer> }}
			 */
			getControlAssociations: function (controlId) {
				return controlInformation._getAssociations(controlId);
			}
		};

	});