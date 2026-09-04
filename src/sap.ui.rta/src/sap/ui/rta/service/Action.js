/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/base/util/restricted/_castArray",
	"sap/base/util/restricted/_pick"
], function(
	OverlayRegistry,
	DtUtil,
	_castArray,
	_pick
) {
	"use strict";

	/**
	 * Provides necessary functionality to get and execute actions on controls. Actions are UI operations available in key user adaptation such as rename, remove, move etc.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.Action
	 * @author SAP SE
	 * @since 1.58
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 *
	*/

	/**
	 * Object containing the detailed information about the action.
	 *
	 * <pre>
	 * {
	 *    id: &lt;string&gt;, // ID of the action
	 *    group: &lt;string&gt;, // Group name, in case the action has been grouped with other action(s)
	 *    icon: &lt;string&gt;, // Icon name
	 *    enabled: &lt;boolean&gt;, // Indicates whether the action is active and can be executed
	 *    rank: &lt;int&gt;, // Sorting rank for visual representation of the action position
	 *    text: &lt;string&gt;, // Action name
	 *    description: &lt;string&gt;, // Human-readable description of what the action does
	 *    parameters: &lt;object[]&gt;, // Parameters accepted by the action's command factory
	 *    aggregationRelevant: &lt;boolean&gt;, // Whether the action's payload depends on aggregation structure
	 *    createCommands: &lt;function&gt;, // Creates the command(s) for the action from the given parameters
	 *    getContext: &lt;function&gt;, // Returns action-specific context for the target overlay
	 * }
	 * </pre>
	 *
	 *
	 * @typedef {object} sap.ui.rta.service.Action.ActionObject
	 * @since 1.58
	 * @private
	 * @ui5-restricted
	 * @property {string} id - ID of the action
	 * @property {string} group - Group name in case the action has been grouped with other action(s)
	 * @property {string} icon - Icon name
	 * @property {boolean} enabled - Indicates whether the action is active and can be executed
	 * @property {int} rank - Sorting rank for visual representation of the action position
	 * @property {string} text - Action name
	 * @property {string} [description] - Human-readable description of what the action does, for programmatic consumers
	 * @property {sap.ui.rta.service.Action.ActionParameter[]} [parameters] - Parameters accepted by the action's
	 *   command factory. Empty array when the underlying plugin does not declare any.
	 * @property {boolean} [aggregationRelevant] - Whether the action's payload depends on aggregation structure
	 *   (e.g. move, add). Programmatic consumers use this to decide if aggregation information must be collected.
	 *   Defaults to <code>false</code>.
	 * @property {function} [createCommands] - Bound plugin method that creates the command(s) for the action from a
	 *   given target overlay and a parameter map (as described by <code>parameters</code>)
	 * @property {function} [getContext] - Bound plugin method that returns action-specific context for a target overlay,
	 *   if the underlying plugin provides one
	 * @property {sap.ui.rta.service.Action.ActionObject[]} [submenu] - Nested actions (e.g. selectable variants).
	 *   Each entry's <code>id</code> is the target value passed as <code>{ key }</code> to <code>execute</code>
	*/

	/**
	 * Descriptor of a single parameter accepted by an action's command factory.
	 *
	 * @typedef {object} sap.ui.rta.service.Action.ActionParameter
	 * @since 1.153
	 * @private
	 * @ui5-restricted
	 * @property {string} name - Parameter name
	 * @property {string} type - Parameter type (e.g. <code>string</code>, <code>int</code>, <code>boolean</code>)
	 * @property {boolean} required - Whether the parameter must be provided
	 * @property {string} description - Human-readable description of the parameter
	*/

	return function(oRta) {
		function invoke(vValue, oOverlay, oMenuItem) {
			return typeof vValue === "function"
				? vValue(oOverlay, oMenuItem)
				: vValue;
		}

		// Resolve the function-valued fields of a menu (or submenu) item, mirroring how the context menu builds them.
		function normalizeMenuItem(mMenuItem, aElementOverlays) {
			return {
				...mMenuItem,
				enabled: invoke(mMenuItem.enabled, aElementOverlays, mMenuItem),
				text: invoke(mMenuItem.text, aElementOverlays[0])
			};
		}

		// Normalize a menu item and, if present, its submenu entries.
		// Submenu entries carry the actual target (e.g. a variant key) in their id.
		function normalizeMenuItemWithSubmenu(mMenuItem, aElementOverlays) {
			const mNormalizedItem = normalizeMenuItem(mMenuItem, aElementOverlays);
			if (mMenuItem.submenu) {
				mNormalizedItem.submenu = mMenuItem.submenu.map(function(mSubMenuItem) {
					return normalizeMenuItem(mSubMenuItem, aElementOverlays);
				});
			}
			return mNormalizedItem;
		}

		// Reduce a menu item to the public action shape, keeping submenu entries in the same reduced shape.
		// The agentic metadata fields (description, parameters, createCommands, getContext) are exposed so that
		// programmatic consumers can discover and invoke an action without going through the context menu UI.
		function pickAction(mMenuItem) {
			const mAction = _pick(mMenuItem, [
				"id", "icon", "rank", "group", "enabled", "text",
				"description", "parameters", "aggregationRelevant", "createCommands", "getContext"
			]);
			if (mMenuItem.submenu) {
				mAction.submenu = mMenuItem.submenu.map(function(mSubMenuItem) {
					return _pick(mSubMenuItem, ["id", "icon", "enabled", "text"]);
				});
			}
			return mAction;
		}

		function getActions(aElementOverlays) {
			var aMenuItemPromises = oRta._oDesignTime.getPlugins()
			.map(function(oPlugin) {
				return oPlugin.getMenuItems(aElementOverlays);
			});
			return Promise.all(aMenuItemPromises)
			.then(function(aMenuItems) {
				return aMenuItems
				.reduce(function(aResult, aMenuItems) {
					return aMenuItems
						? aResult.concat(aMenuItems)
						: aResult;
				}, [])
				.map(function(mMenuItem) {
					return normalizeMenuItemWithSubmenu(mMenuItem, aElementOverlays);
				});
			});
		}

		function get(vControlIds) {
			var aControlIds = _castArray(vControlIds);
			var aElementOverlays = aControlIds.map(function(sControlId) {
				var oElementOverlay = OverlayRegistry.getOverlay(sControlId);

				if (!oElementOverlay) {
					throw new Error(`Control with id="${sControlId}" is not under a root element or ignored.'`);
				}

				return oElementOverlay;
			});

			return getActions(aElementOverlays)
			.then(function(aMenuItems) {
				return aMenuItems.map(pickAction);
			});
		}

		function execute(vControlIds, sActionId, mPayload) {
			var aControlIds = _castArray(vControlIds);
			var aElementOverlays = aControlIds.map(function(sControlId) {
				var oElementOverlay = OverlayRegistry.getOverlay(sControlId);

				if (!oElementOverlay) {
					throw new Error(`Control with id="${sControlId}" is not under a root element or ignored.`);
				}

				return oElementOverlay;
			});

			return getActions(aElementOverlays)
			.then(function(aActions) {
				var mAction = aActions.filter(function(mAction) {
					return mAction.id === sActionId;
				}).pop();

				if (!mAction) {
					throw new Error("No action found by specified ID");
				} else {
					return mAction.handler(aElementOverlays, {
						menuItem: mAction,
						contextElement: aElementOverlays[0] && aElementOverlays[0].getElement(),
						payload: mPayload
					});
				}
			});
		}

		return {
			exports: {
				/**
				 * Returns a list of available actions for the specified control(s) wrapped in a promise.
				 *
				 * Example:
				 *
				 * <pre>
				 * [
				 *     {
				 *         "id": "CTX_RENAME",
				 *         "text": "Rename",
				 *         "enabled": false,
				 *         "rank": 10,
				 *         "icon": "sap-icon://edit"
				 *     },
				 *     {
				 *         "id": "CTX_ADD_ELEMENTS_AS_SIBLING",
				 *         "text": "Add Field",
				 *         "enabled": false,
				 *         "rank": 20,
				 *         "icon": "sap-icon://add",
				 *         "group": "Add"
				 *     },
				 *     {
				 *         "id": "CTX_REMOVE",
				 *         "text": "Remove",
				 *         "enabled": true,
				 *         "rank": 60,
				 *         "icon": "sap-icon://decline"
				 *     },
				 *     {
				 *         "id": "CTX_CUT",
				 *         "text": "Cut",
				 *         "enabled": false,
				 *         "rank": 70,
				 *         "icon": "sap-icon://scissors"
				 *     },
				 *     {
				 *         "id": "CTX_PASTE",
				 *         "text": "Paste",
				 *         "enabled": false,
				 *         "rank": 80,
				 *         "icon": "sap-icon://paste"
				 *     }
				 * ]
				 * </pre>
				 *
				 * @name sap.ui.rta.service.Action.get
				 * @param {string|string[]} vControlIds - Control ID or an array of IDs to get actions for
				 * @returns {Promise.<sap.ui.rta.service.Action.ActionObject[]>} List of available actions wrapped in a promise
				 * @public
				 * @function
				 */
				get,

				/**
				 * Returns a list of available actions for the specified control(s).
				 *
				 * @name sap.ui.rta.service.Action.execute
				 * @param {string|string[]} vControlIds - Control ID or an array of IDs to get actions for
				 * @param {string} sActionId - Action ID to be executed on the specified controls
				 * @param {object} [mPayload] - Payload forwarded to the plugin handler as <code>mPropertyBag.payload</code>,
				 *   e.g. <code>{ key }</code> for the variant switch actions
				 * @returns {Promise.<any>} Result of the operation wrapped in a promise.
				 * @public
				 * @function
				 */
				execute
			}
		};
	};
});