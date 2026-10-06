sap.ui.define(['require', 'exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/WrappingType'], (function (require, exports, webcomponentsBase, parametersBundle_css, ListItemTemplate, Icon, WrappingType) { 'use strict';

    const predefinedHooks = {
        imageBegin,
        iconBegin,
        iconEnd,
        listItemContent
    };
    function ListItemStandardTemplate(hooks) {
        const currentHooks = { ...predefinedHooks, ...hooks };
        return ListItemTemplate.ListItemTemplate.call(this, currentHooks);
    }
    function listItemContent() {
        return parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsxs("div", { class: "ui5-li-text-wrapper", children: [renderTitle.call(this), renderDescription.call(this), !this.typeActive && !this.isInactiveSelectable && parametersBundle_css.jsx("span", { class: "ui5-hidden-text", children: this.type })] }), !this.description && renderAdditionalText.call(this)] });
    }
    function renderTitle() {
        if (this.wrappingType === WrappingType.WrappingType.Normal) {
            return this.expandableTextTemplate?.call(this, {
                className: "ui5-li-title",
                text: this._textContent,
                maxCharacters: this._maxCharacters,
                part: "title",
            });
        }
        return (parametersBundle_css.jsx("span", { part: "title", class: "ui5-li-title", children: this.text ? this.text : parametersBundle_css.jsx("slot", {}) }));
    }
    function renderDescription() {
        if (!this.description) {
            return null;
        }
        if (this.wrappingType === WrappingType.WrappingType.Normal) {
            return (parametersBundle_css.jsxs("div", { class: "ui5-li-description-info-wrapper", children: [this.expandableTextTemplate?.call(this, {
                        className: "ui5-li-desc",
                        text: this.description,
                        maxCharacters: this._maxCharacters,
                        part: "description",
                    }), renderAdditionalText.call(this)] }));
        }
        return (parametersBundle_css.jsxs("div", { class: "ui5-li-description-info-wrapper", children: [parametersBundle_css.jsx("span", { part: "description", class: "ui5-li-desc", children: this.description }), renderAdditionalText.call(this)] }));
    }
    function renderAdditionalText() {
        if (!this.additionalText) {
            return null;
        }
        return parametersBundle_css.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", children: this.additionalText });
    }
    function imageBegin() {
        if (this.hasImage) {
            return parametersBundle_css.jsx("div", { class: "ui5-li-image", children: parametersBundle_css.jsx("slot", { name: "image" }) });
        }
    }
    function iconBegin() {
        if (this.displayIconBegin) {
            return parametersBundle_css.jsx(Icon.Icon, { part: "icon", name: this.icon, class: "ui5-li-icon", mode: "Decorative" });
        }
    }
    function iconEnd() {
        if (this.displayIconEnd) {
            return parametersBundle_css.jsx(Icon.Icon, { part: "icon", name: this.icon, class: "ui5-li-icon", mode: "Decorative" });
        }
    }

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ListItemStandard_1;
    /**
     * Maximum number of characters to display for small screens (Size S)
     * @private
     */
    const MAX_CHARACTERS_SIZE_S = 100;
    /**
     * Maximum number of characters to display for medium and larger screens (Size M and above)
     * @private
     */
    const MAX_CHARACTERS_SIZE_M = 300;
    /**
     * @class
     * The `ui5-li` represents the simplest type of item for a `ui5-list`.
     *
     * This is a list item,
     * providing the most common use cases such as `text`,
     * `image` and `icon`.

     * @csspart title - Used to style the title of the list item
     * @csspart description - Used to style the description of the list item
     * @csspart additional-text - Used to style the additionalText of the list item
     * @csspart icon - Used to style the icon of the list item
     * @csspart native-li - Used to style the main li tag of the list item
     * @csspart content - Used to style the content area of the list item
     * @csspart detail-button - Used to style the button rendered when the list item is of type detail
     * @csspart delete-button - Used to style the button rendered when the list item is in delete mode
     * @csspart radio - Used to style the radio button rendered when the list item is in single selection mode
     * @csspart checkbox - Used to style the checkbox rendered when the list item is in multiple selection mode
     * @constructor
     * @extends ListItem
     * @public
     */
    let ListItemStandard = ListItemStandard_1 = class ListItemStandard extends ListItemTemplate.ListItem {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the `icon` should be displayed in the beginning of the list item or in the end.
             *
             * @default false
             * @public
             */
            this.iconEnd = false;
            /**
             * Defines the state of the `additionalText`.
             *
             * Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`.
             * @default "None"
             * @public
             * @since 1.0.0-rc.15
             */
            this.additionalTextState = "None";
            /**
             * Defines whether the item is movable.
             * @default false
             * @public
             * @since 2.0.0
             */
            this.movable = false;
            /**
             * Defines if the text of the component should wrap when it's too long.
             * When set to "Normal", the content (title, description) will be wrapped
             * using the `ui5-expandable-text` component.<br/>
             *
             * The text can wrap up to 100 characters on small screens (size S) and
             * up to 300 characters on larger screens (size M and above). When text exceeds
             * these limits, it truncates with an ellipsis followed by a text expansion trigger.
             *
             * Available options are:
             * - `None` (default) - The text will truncate with an ellipsis.
             * - `Normal` - The text will wrap (without truncation).
             *
             * @default "None"
             * @public
             * @since 2.10.0
             */
            this.wrappingType = "None";
            /**
             * Indicates if the list item has text content.
             * @private
             */
            this.hasTitle = false;
            this._hasImage = false;
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            this.hasTitle = !!(this.text || this.textContent);
            this._hasImage = this.hasImage;
            // Only load ExpandableText if "Normal" wrapping is used
            if (this.wrappingType === "Normal") {
                // If feature is already loaded (preloaded by the user via importing ListItemStandardExpandableText.js), the template is already available
                if (ListItemStandard_1.ExpandableTextTemplate) {
                    this.expandableTextTemplate = ListItemStandard_1.ExpandableTextTemplate;
                    // If feature is not preloaded, load the template dynamically
                }
                else {
                    new Promise(function (resolve, reject) { require(['sap/f/thirdparty/_dynamics/ListItemStandardExpandableTextTemplate'], resolve, reject); }).then(module => {
                        this.expandableTextTemplate = module.default;
                    });
                }
            }
        }
        /**
         * Returns the content text, either from text property or from the default slot
         * @private
         */
        get _textContent() {
            return this.text || this.textContent || "";
        }
        /**
         * Determines the maximum characters to display based on the current media range.
         * - Size S: 100 characters
         * - Size M and larger: 300 characters
         * @private
         */
        get _maxCharacters() {
            return this.mediaRange === "S" ? MAX_CHARACTERS_SIZE_S : MAX_CHARACTERS_SIZE_M;
        }
        get displayIconBegin() {
            return !!(this.icon && !this.iconEnd);
        }
        get displayIconEnd() {
            return !!(this.icon && this.iconEnd);
        }
        get hasImage() {
            return !!this.image.length;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "description", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemStandard.prototype, "iconEnd", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "additionalText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "additionalTextState", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemStandard.prototype, "movable", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "wrappingType", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemStandard.prototype, "hasTitle", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemStandard.prototype, "_hasImage", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], ListItemStandard.prototype, "expandableTextTemplate", void 0);
    __decorate([
        webcomponentsBase.d({ type: Node, "default": true })
    ], ListItemStandard.prototype, "content", void 0);
    __decorate([
        webcomponentsBase.d()
    ], ListItemStandard.prototype, "image", void 0);
    ListItemStandard = ListItemStandard_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-li",
            renderer: parametersBundle_css.y,
            template: ListItemStandardTemplate,
        })
    ], ListItemStandard);
    ListItemStandard.define();
    var ListItemStandard$1 = ListItemStandard;

    exports.ListItemStandard = ListItemStandard$1;

}));
