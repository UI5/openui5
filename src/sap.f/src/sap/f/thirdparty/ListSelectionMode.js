sap.ui.define(['exports'], (function (exports) { 'use strict';

    /**
     * Different list selection modes.
     * @public
     */
    var ListSelectionMode;
    (function (ListSelectionMode) {
        /**
         * Default mode (no selection).
         * @public
         */
        ListSelectionMode["None"] = "None";
        /**
         * Right-positioned single selection mode (only one list item can be selected).
         * @public
         */
        ListSelectionMode["Single"] = "Single";
        /**
         * Left-positioned single selection mode (only one list item can be selected).
         * @public
         */
        ListSelectionMode["SingleStart"] = "SingleStart";
        /**
         * Selected item is highlighted but no selection element is visible
         * (only one list item can be selected).
         * @public
         */
        ListSelectionMode["SingleEnd"] = "SingleEnd";
        /**
         * Selected item is highlighted and selection is changed upon arrow navigation
         * (only one list item can be selected - this is always the focused item).
         * @public
         */
        ListSelectionMode["SingleAuto"] = "SingleAuto";
        /**
         * Multi selection mode (more than one list item can be selected).
         * @public
         */
        ListSelectionMode["Multiple"] = "Multiple";
        /**
         * Delete mode (only one list item can be deleted via provided delete button)
         * @public
         */
        ListSelectionMode["Delete"] = "Delete";
    })(ListSelectionMode || (ListSelectionMode = {}));
    var ListSelectionMode$1 = ListSelectionMode;

    exports.ListSelectionMode = ListSelectionMode$1;

}));
