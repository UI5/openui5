sap.ui.define(['exports', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/ListItemGroup'], (function (exports, parametersBundle_css, ListItemGroup) { 'use strict';

    function ListItemGroupTemplate(hooks) {
        const items = hooks?.items || defaultItems;
        return (parametersBundle_css.jsxs("ul", { role: "group", class: "ui5-group-li-root", onDragEnter: this._ondragenter, onDragOver: this._ondragover, onDrop: this._ondrop, onDragLeave: this._ondragleave, children: [this.hasHeader &&
                    parametersBundle_css.jsx(ListItemGroup.ListItemGroupHeader, { focused: this.focused, part: "header", accessibleRole: "Group", wrappingType: this.getGroupHeaderWrapping(), children: this.hasFormattedHeader ? parametersBundle_css.jsx("slot", { name: "header" }) : this.headerText }), items.call(this), parametersBundle_css.jsx(ListItemGroup.DropIndicator, { orientation: "Horizontal", ownerReference: this })] }));
    }
    function defaultItems() {
        return parametersBundle_css.jsx("slot", {});
    }

    exports.ListItemGroupTemplate = ListItemGroupTemplate;

}));
