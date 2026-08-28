/*!
 * ${copyright}
 */

sap.ui.define([
	"./ListBase",
	"./NotificationListRenderer"
],
function(
	ListBase,
	NotificationListRenderer
	) {
	'use strict';

	/**
	 * Constructor for a new <code>NotificationList<code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationList control provides a container for <code>NotificationListGroup</code>
	 * and <code>NotificationListItem</code>.
	 *
	 * <b>Note:</b> <code>sap.m.NotificationList</code> will no longer be aligned with future design updates. Use the UI5 Web Components' notifications instead,
	 * which are UXC-compliant and are the successors going forward. They can be integrated seamlessly using ui5-tooling-modules. See {@link topic:1c80793df5bb424091954697fc0b2828 Using Web Components}
	 * and the {@link https://github.com/SAP-samples/uxc-integration UXC integration sample}.
	 *
	 * @extends sap.m.ListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.90
	 * @deprecated As of version 1.153. Will no longer be aligned with future design updates. Replaced by the UI5 Web Components' notifications, which are UXC-compliant.
	 * The UI5 Web Components can be integrated seamlessly using ui5-tooling-modules.
	 * See {@link topic:1c80793df5bb424091954697fc0b2828 Using Web Components} and the {@link https://github.com/SAP-samples/uxc-integration UXC integration sample}.
	 * @alias sap.m.NotificationList
	 */
	var NotificationList = ListBase.extend('sap.m.NotificationList', /** @lends sap.m.NotificationList.prototype */ {
		metadata: {
			library: 'sap.m'
		},

		renderer: NotificationListRenderer
	});

	NotificationList.prototype.onItemFocusIn = function() { };

	NotificationList.prototype.onItemArrowUpDown = function(oListItem, oEvent) { };

	NotificationList.prototype._startItemNavigation = function () {
		ListBase.prototype._startItemNavigation.call(this);

		if (this._oItemNavigation) {
			this._oItemNavigation.setTableMode(false);
		}
	};

	NotificationList.prototype.setNavigationItems = function(oItemNavigation, oNavigationRoot) {
		var aItems = oNavigationRoot.querySelectorAll(".sapMLIB");

		oItemNavigation.setItemDomRefs(Array.from(aItems));

		if (oItemNavigation.getFocusedIndex() === -1) {
			oItemNavigation.setFocusedIndex(0);
		}
	};

	return NotificationList;
});
