sap.ui.define(['exports', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/ListItemGroup'], (function (exports, jsxRuntime, ListItemGroup) { 'use strict';

    function ListItemGroupTemplate(hooks) {
        const items = hooks?.items || defaultItems;
        return (jsxRuntime.jsxs("ul", { role: "group", class: "ui5-group-li-root", onDragEnter: this._ondragenter, onDragOver: this._ondragover, onDrop: this._ondrop, onDragLeave: this._ondragleave, children: [this.hasHeader &&
                    jsxRuntime.jsx(ListItemGroup.ListItemGroupHeader, { focused: this.focused, part: "header", accessibleRole: "Group", wrappingType: this.getGroupHeaderWrapping(), children: this.hasFormattedHeader ? jsxRuntime.jsx("slot", { name: "header" }) : this.headerText }), items.call(this), jsxRuntime.jsx(ListItemGroup.DropIndicator, { orientation: "Horizontal", ownerReference: this })] }));
    }
    function defaultItems() {
        return jsxRuntime.jsx("slot", {});
    }

    exports.ListItemGroupTemplate = ListItemGroupTemplate;

}));
