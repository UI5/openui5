/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Label",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/BindingMode",
	"sap/m/plugins/PluginBase",
	"sap/ui/core/Element",
	"sap/ui/core/Control",
	"sap/base/Log"
], (
	Label,
	ManagedObjectModel,
	BindingMode,
	PluginBase,
	Element,
	Control,
	Log
) => {
	"use strict";

	/**
	 * Constructor for a new <code>Column</column>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The column for the metadata-driven table with the template, which is shown if the rows have data.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @public
	 * @since 1.58
	 * @alias sap.ui.mdc.table.Column
	 */
	const Column = Control.extend("sap.ui.mdc.table.Column", {
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "template",
			properties: {
				/**
				 * Defines the width of the column.
				 *
				 * @since 1.80
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},

				/**
				 * Defines the minimum width of the column. This property only takes effect if the column has a flexible <code>width</code>, for
				 * example, a percentage value. The user can resize the column to a smaller width if
				 * {@link sap.ui.mdc.Table#getEnableColumnResize column resizing} is enabled in the table.
				 *
				 * <b>Note:</b> If the table type is {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, the property is used to influence
				 * the pop-in behavior: If the accumulated width of all columns is bigger than the width of the table, then the least important column
				 * is moved into the pop-in area. For more information, see
				 * {@link sap.ui.mdc.table.ResponsiveColumnSettings#getImportance ResponsiveColumnSettings}.
				 *
				 * @since 1.80
				 */
				minWidth: {
					type: "float",
					group: "Behavior",
					defaultValue: 8
				},

				/**
				 * Defines the column header text.
				 *
				 * @since 1.80
				 */
				header: {
					type: "string",
					group: "Appearance"
				},

				/**
				 * Defines whether the column header is visible.
				 *
				 * @since 1.80
				 */
				headerVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Defines the horizontal alignment of the column content.
				 *
				 * @since 1.80
				 */
				hAlign: {
					type: "sap.ui.core.HorizontalAlign",
					group: "Appearance",
					defaultValue: "Begin"
				},

				/**
				 * Defines data property related to the column.
				 *
				 * @since 1.115
				 */
				propertyKey: {
					type: "string"
				},

				/**
				 * Indicates whether the content of the column is required.
				 *
				 * <b>Note:</b> The table only takes care of announcing the state of the column header as defined by the <code>required</code>
				 * property. The application needs to take care of the screen reader announcement of the state of the table cells, for example, by
				 * setting the <code>required</code> property to <code>true</code> for <code>sap.m.Input</code>.
				 */
				required: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				}
			},
			aggregations: {
				/**
				 * Template for the column.
				 */
				template: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				 * <code>CreationRow</code> template.
				 *
				 * <b>Note:</b> Once the binding supports creating transient records, this aggregation will be removed.
				 *
				 * @ui5-restricted sap.fe
				 * @experimental Internal use only
				 * @deprecated As of version 1.124, the concept has been discarded.
				 */
				creationTemplate: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				 * Defines type-specific column settings based on the used {@link sap.ui.mdc.table.TableTypeBase}.
				 *
				 * <b>Note:</b> Once <code>sap.ui.mdc.table.ColumnSettings</code> are defined,
				 * all properties provided by the <code>ColumnSettings</code> are automatically assigned to the column.
				 *
				 * @since 1.110
				 */
				extendedSettings: {
					type: "sap.ui.mdc.table.ColumnSettings",
					multiple: false
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oColumn) {
				oRm.openStart("div", oColumn);
				oRm.openEnd();
				if (oColumn._oColumnHeaderLabel) {
					oRm.renderControl(oColumn._oColumnHeaderLabel.getLabel());
				}
				oRm.close("div");
			}
		}
	});

	Column.prototype.init = function() {
		// Skip propagation of properties (models and bindingContexts).
		this.mSkipPropagation = {
			template: true,
			creationTemplate: true
		};

		this._oManagedObjectModel = new ManagedObjectModel(this, {
			calculatedWidth: null,
			p13nWidth: null
		});
		this._oManagedObjectModel.setDefaultBindingMode(BindingMode.OneWay);
		this._oInnerColumnReady = Promise.withResolvers();
	};

	Column.prototype.getColumnAIActionPluginOwner = function() {
		return this._oInnerColumn || this._oInnerColumnReady.promise;
	};

	Column.prototype.getInnerColumn = function() {
		const oTable = this.getTable();

		if (oTable && (!this._oInnerColumn || this._oInnerColumn.isDestroyed())) {
			this._oInnerColumn = oTable._getType().createColumn(this);
			// XConfig might not have been available on init - depends on the order settings are applied in Table#applySettings.
			this._readP13nValues();
			this._oInnerColumn.setModel(this._oManagedObjectModel, "$sap.ui.mdc.table.Column");
			this._oInnerColumnReady.resolve();
		}

		return this._oInnerColumn;
	};

	// The purpose of this control is to render the MDC column in the inner table column header, for example to support tools that allow the user to
	// select controls on the UI for editing.
	const ColumnHeaderLabel = Control.extend("sap.ui.mdc.table.ColumnHeaderLabel", {
		metadata: {
			library: "sap.ui.mdc",
			"final": true,
			aggregations: {
				label: {type: "sap.m.Label", multiple: false}
			},
			associations: {
				column: {type: "sap.ui.mdc.table.Column"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oColumnHeaderLabel) {
				oRm.openStart("div", oColumnHeaderLabel);
				oRm.style("width", "100%");
				oRm.openEnd();
				oRm.renderControl(Element.getElementById(oColumnHeaderLabel.getColumn()));
				oRm.close("div");
			}
		},
		getText: function() { // Used by inner table for the fieldHelpInfo, and by tests in MDC and FE.
			return this.getLabel()?.getText();
		},
		clone: function() { // For ResponsiveTable popin.
			return this.getLabel()?.clone();
		},
		// Used by inner table for accessibility support.
		getRequired: function() {
			return this.getLabel()?.getRequired();
		},
		getAccessibilityInfo: function() {
			return this.getLabel()?.getAccessibilityInfo();
		},
		setIsInColumnHeaderContext: function(bIsInColumnHeaderContext) {
			this.getLabel()?.setIsInColumnHeaderContext(bIsInColumnHeaderContext);
		}
	});

	/**
	 * Creates and returns the column header control. If the control is already created, the existing instance is returned. The settings are not
	 * updated. To create a new instance with new settings, first destroy the old instance.
	 * If <code>headerVisible=false</code> then <code>width=0px</code> is applied to the <code>sap.m.Label</code> control for accessibility purposes.
	 *
	 * @param {object} [mLabelSettings] Additional settings for the inner <code>sap.m.Label</code>
	 * @returns {sap.ui.mdc.table.ColumnHeaderLabel} The column header control
	 * @private
	 */
	Column.prototype.getHeaderLabel = function(mLabelSettings) {
		if (this._oColumnHeaderLabel?.isDestroyed()) {
			delete this._oColumnHeaderLabel;
		}

		this._oColumnHeaderLabel ??= new ColumnHeaderLabel({
			column: this,
			label: new Label({
				width: "{= ${$sap.ui.mdc.table.Column>/headerVisible} ? '100%' : '0px' }",
				text: "{$sap.ui.mdc.table.Column>/header}",
				textAlign: "{$sap.ui.mdc.table.Column>/hAlign}",
				required: "{$sap.ui.mdc.table.Column>/required}",
				...mLabelSettings
			})
		});

		return this._oColumnHeaderLabel;
	};

	Column.prototype.getTemplateClone = function() {
		const oTemplate = this.getTemplate();

		if (oTemplate && (!this._oTemplateClone || this._oTemplateClone.isDestroyed())) {
			this._oTemplateClone = oTemplate.clone();
		}

		return this._oTemplateClone;
	};

	Column.prototype.setHeader = function(sHeader) {
		this.setProperty("header", sHeader, true);

		const oLabelElement = this.getDomRef();
		if (oLabelElement) {
			oLabelElement.textContent = this.getHeader();
		}

		return this;
	};

	//Temporary fallback for compatibility until the dataProperty can be removed
	Column.prototype.getPropertyKey = function() {
		const sPropertyKey = this.getProperty("propertyKey");
		return sPropertyKey || undefined;
	};

	/**
	 * Sets a new tooltip for this object.
	 *
	 * The tooltip can only be a simple string. An instance of {@link sap.ui.core.TooltipBase}
	 * is not supported.
	 *
	 * If a new tooltip is set, any previously set tooltip is deactivated.
	 *
	 * @param {string} vTooltip New tooltip
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	Column.prototype.setTooltip = function(vTooltip) {
		if (vTooltip && vTooltip.isA && vTooltip.isA("sap.ui.core.TooltipBase")) {
			Log.error("The control sap.ui.mdc.table.Column allows only strings as tooltip, but given is " + vTooltip);
			return this;
		}

		return Control.prototype.setTooltip.apply(this, arguments);
	};

	Column.prototype.setParent = function(oParent) {
		const oPreviousTable = this.getTable();
		Control.prototype.setParent.apply(this, arguments);

		if (this._bIsBeingMoved) { // Set by the table when moving this column.
			return;
		}

		this._disconnectFromTable(oPreviousTable);
		this._connectToTable();
	};

	Column.prototype._getAIAction = function() {
		return PluginBase.getPlugin(this, "sap.m.plugins.ColumnAIAction");
	};

	Column.prototype._connectToTable = function() {
		const oTable = this.getTable();

		if (!oTable) {
			return;
		}

		this._getAIAction()?.setEnabled(true);
		this._calculateColumnWidth();
		this._readP13nValues();
	};

	Column.prototype._disconnectFromTable = function() {
		this._getAIAction()?.setEnabled(false);
		this._oInnerColumn?.destroy();
		delete this._oInnerColumn;
	};

	Column.prototype._onModifications = function() {
		this._readP13nValues();
	};

	Column.prototype._calculateColumnWidth = function() {
		const oTable = this.getTable();

		if (!oTable || !oTable.getEnableAutoColumnWidth() || !this.isPropertyInitial("width")) {
			return;
		}

		const oPropertyHelper = oTable.getPropertyHelper();

		if (oPropertyHelper) {
			oPropertyHelper.calculateColumnWidth(this).then((sWidth) => {
				this._oManagedObjectModel.setProperty("/@custom/calculatedWidth", sWidth);
			});
		} else {
			oTable._fullyInitialized().then(this._calculateColumnWidth.bind(this));
		}
	};

	Column.prototype._readP13nValues = function() {
		const oTable = this.getTable();
		const sPropertyKey = this.getPropertyKey();
		const oXConfig = oTable._getXConfig();
		const oColumnConfig = oXConfig?.aggregations?.columns?.[sPropertyKey];

		this._oManagedObjectModel.setProperty("/@custom/p13nWidth", oColumnConfig?.width);
	};

	Column.prototype.getTable = function() {
		const oParent = this.getParent();
		return oParent && oParent.isA("sap.ui.mdc.Table") ? oParent : null;
	};

	Column.prototype.exit = function() {
		this._disconnectFromTable();
		this._oInnerColumnReady = null;
		[
			"_oManagedObjectModel",
			"_oInnerColumn",
			"_oTemplateClone",
			"_oColumnHeaderLabel"
		].forEach(function(sObject) {
			if (this[sObject]) {
				this[sObject].destroy();
				delete this[sObject];
			}
		}, this);
	};

	return Column;
});