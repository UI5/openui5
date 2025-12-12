sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/ResponsiveColumnSettings",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/enums/TableType",
	"sap/m/Text",
	"sap/m/ObjectStatus",
	"sap/m/Link",
	"../mockdata/TablePropertyInfo"
], (
	TableDelegateBase,
	Column,
	ResponsiveColumnSettings,
	FilterField,
	TableType,
	Text,
	ObjectStatus,
	Link,
	TablePropertyInfo
) => {
	"use strict";

	var TableDelegate = Object.assign({}, TableDelegateBase);

	TableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegateBase.updateBindingInfo.apply(this, arguments);
		oBindingInfo.path = oTable.getPayload().bindingPath;
	};

	TableDelegate.fetchProperties = function(oTable) {
		return Promise.resolve(TablePropertyInfo);
	};

	TableDelegate.addItem = function(oTable, sPropertyKey, mPropertyBag) {
		var oProperty = oTable.getPropertyHelper().getProperty(sPropertyKey);

		return Promise.resolve(
			new Column({
				propertyKey: sPropertyKey,
				header: oProperty.label,
				...getColumnSettings(oProperty)
			})
		);
	};

	function getColumnSettings(oProperty) {
		const mSettings = {
			template: getColumnTemplate(oProperty)
		};

		switch (oProperty.key) {
			case "id":
			case "name":
				mSettings.extendedSettings = new ResponsiveColumnSettings({
					importance: "High"
				});
				break;
			case "position":
				mSettings.minWidth = "12rem";
				break;
			case "email":
				mSettings.minWidth = "20rem";
				mSettings.extendedSettings = new ResponsiveColumnSettings({
					importance: "Low"
				});
				break;
			default:
		}

		return mSettings;
	}

	function getColumnTemplate(oProperty) {
		if (oProperty.key === "location") {
			return new ObjectStatus({
				text: {path: oProperty.path},
				state: {
					path: oProperty.path,
					formatter: function(sLocation) {
						return sLocation === "Headquarters" ? "Success" : "Warning";
					}
				}
			});
		}

		if (oProperty.key === "email") {
			return new Link({
				text: {path: oProperty.path},
				href: `mailto:{${oProperty.path}}`
			});
		}

		if (oProperty.key === "name") {
			return new Text({
				text: "{firstName} {lastName}"
			});
		}

		return new Text({
			text: {
				path: oProperty.path
			}
		});
	}

	TableDelegate.getFilterDelegate = function() {
		return {
			addItem: function(oControl, sPropertyKey) {
				var oProperty = oControl.getPropertyHelper().getProperty(sPropertyKey);

				return Promise.resolve(
					new FilterField({
						propertyKey: sPropertyKey,
						label: oProperty.label,
						conditions: "{$filters>/conditions/" + sPropertyKey + "}"
					})
				);
			}
		};
	};

	TableDelegate.fetchExpandAndCollapseConfiguration = function(oTable) {
		if (!oTable._isOfType(TableType.TreeTable)) {
			return Promise.resolve({});
		}

		return Promise.resolve({
			expandAll: function(oTable) {
				oTable.getRowBinding()?.expandToLevel(10); // No real expand all possible, but works with the sample data
			},
			collapseAll: function(oTable) {
				oTable.getRowBinding()?.collapseToLevel(0);
			},
			/*expandEntireNode: function(oTable, oContext) { // Can only expand one level
				const oBinding = oTable.getRowBinding();
				return oBinding?.expand(oBinding.getContexts().indexOf(oContext));
			},*/
			collapseEntireNode: function(oTable, oContext) {
				const oBinding = oTable.getRowBinding();
				return oBinding?.collapse(oBinding.getContexts().indexOf(oContext));
			},
			isNodeExpanded: function(oTable, oContext) {
				const oBinding = oTable.getRowBinding();
				return oBinding ? oBinding.isExpanded(oBinding.getContexts().indexOf(oContext)) : false;
			}
		});
	};

	return TableDelegate;
});