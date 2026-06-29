sap.ui.define(['exports'], (function (exports) { 'use strict';

    /**
     * Different types of wrapping.
     * @public
     */
    var WrappingType;
    (function (WrappingType) {
        /**
         * The text will be truncated with an ellipsis.
         * @public
         */
        WrappingType["None"] = "None";
        /**
         * The text will wrap. The words will not be broken based on hyphenation.
         * @public
         */
        WrappingType["Normal"] = "Normal";
    })(WrappingType || (WrappingType = {}));
    var WrappingType$1 = WrappingType;

    exports.WrappingType = WrappingType$1;

}));
