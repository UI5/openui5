sap.ui.define(['require', 'exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Tag', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/parameters-bundle.css2'], (function (require, exports, webcomponentsBase, eventStrict, jsxRuntime, Button, Tag, Theme, parametersBundle_css, ListItemTemplate, Icon, WrappingType, parametersBundle_css$1) { 'use strict';

    function ButtonTemplate() {
        return jsxRuntime.jsx(Tag.Tag, { design: "Critical", "hide-state-icon": true, children: this.effectiveText });
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var buttonBadgeCss = `[ui5-tag]::part(root){border:.0625rem solid var(--sapContent_BadgeBorderColor);background-color:var(--sapContent_BadgeBackground);color:var(--sapContent_BadgeTextColor);height:1rem;border-radius:.5rem;display:flex;align-items:center}:host([design="AttentionDot"]) [ui5-tag]::part(root){min-width:var(--_ui5-button-badge-diameter);min-height:var(--_ui5-button-badge-diameter);height:var(--_ui5-button-badge-diameter);width:var(--_ui5-button-badge-diameter);border-radius:100%}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * The `ui5-button-badge` component defines a badge that appears in the `ui5-button`.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/ButtonBadge.js";`
     * @constructor
     * @extends UI5Element
     * @since 2.7.0
     * @public
     */
    let ButtonBadge = class ButtonBadge extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Defines the badge placement and appearance.
             * - **InlineText** - displayed inside the button after its text, and recommended for **compact** density.
             * - **OverlayText** - displayed at the top-end corner of the button, and recommended for **cozy** density.
             * - **AttentionDot** - displayed at the top-end corner of the button as a dot, and suitable for both **cozy** and **compact** densities.
             * @since 2.7.0
             * @public
            */
            this.design = "AttentionDot";
            /**
             * Defines the text of the component.
             *
             * **Note:** Text is not applied when the `design` property is set to `AttentionDot`.
             *
             * **Note:** The badge component only accepts numeric values and the "+" symbol. Using other characters or formats may result in unpredictable behavior, which is not guaranteed or supported.
             * @since 2.7.0
             * @public
            */
            this.text = "";
        }
        get effectiveText() {
            return this.design === Button.ButtonBadgeDesign.AttentionDot ? "" : this.text;
        }
    };
    __decorate$2([
        webcomponentsBase.s()
    ], ButtonBadge.prototype, "design", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ButtonBadge.prototype, "text", void 0);
    ButtonBadge = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-button-badge",
            renderer: jsxRuntime.y,
            template: ButtonTemplate,
            styles: buttonBadgeCss,
        })
    ], ButtonBadge);
    ButtonBadge.define();
    var ButtonBadge$1 = ButtonBadge;

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
        return jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs("div", { class: "ui5-li-text-wrapper", children: [renderTitle.call(this), renderDescription.call(this), !this.typeActive && jsxRuntime.jsx("span", { class: "ui5-hidden-text", children: this.type })] }), !this.description && renderAdditionalText.call(this)] });
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
        return (jsxRuntime.jsx("span", { part: "title", class: "ui5-li-title", children: this.text ? this.text : jsxRuntime.jsx("slot", {}) }));
    }
    function renderDescription() {
        if (!this.description) {
            return null;
        }
        if (this.wrappingType === WrappingType.WrappingType.Normal) {
            return (jsxRuntime.jsxs("div", { class: "ui5-li-description-info-wrapper", children: [this.expandableTextTemplate?.call(this, {
                        className: "ui5-li-desc",
                        text: this.description,
                        maxCharacters: this._maxCharacters,
                        part: "description",
                    }), renderAdditionalText.call(this)] }));
        }
        return (jsxRuntime.jsxs("div", { class: "ui5-li-description-info-wrapper", children: [jsxRuntime.jsx("span", { part: "description", class: "ui5-li-desc", children: this.description }), renderAdditionalText.call(this)] }));
    }
    function renderAdditionalText() {
        if (!this.additionalText) {
            return null;
        }
        return jsxRuntime.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", children: this.additionalText });
    }
    function imageBegin() {
        if (this.hasImage) {
            return jsxRuntime.jsx("div", { class: "ui5-li-image", children: jsxRuntime.jsx("slot", { name: "image" }) });
        }
    }
    function iconBegin() {
        if (this.displayIconBegin) {
            return jsxRuntime.jsx(Icon.Icon, { part: "icon", name: this.icon, class: "ui5-li-icon", mode: "Decorative" });
        }
    }
    function iconEnd() {
        if (this.displayIconEnd) {
            return jsxRuntime.jsx(Icon.Icon, { part: "icon", name: this.icon, class: "ui5-li-icon", mode: "Decorative" });
        }
    }

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "text", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "description", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "icon", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemStandard.prototype, "iconEnd", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "additionalText", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "additionalTextState", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemStandard.prototype, "movable", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "accessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemStandard.prototype, "wrappingType", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemStandard.prototype, "hasTitle", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemStandard.prototype, "_hasImage", void 0);
    __decorate$1([
        webcomponentsBase.s({ noAttribute: true })
    ], ListItemStandard.prototype, "expandableTextTemplate", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: Node, "default": true })
    ], ListItemStandard.prototype, "content", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], ListItemStandard.prototype, "image", void 0);
    ListItemStandard = ListItemStandard_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-li",
            renderer: jsxRuntime.y,
            template: ListItemStandardTemplate,
        })
    ], ListItemStandard);
    ListItemStandard.define();
    var ListItemStandard$1 = ListItemStandard;

    function ShellBarItemTemplate() {
        if (this.inOverflow) {
            return (jsxRuntime.jsx(ListItemStandard$1, { icon: this.icon ? `sap-icon://${this.icon}` : "", type: "Active", "data-count": this.count, "data-ui5-stable": this.stableDomRef, accessibilityAttributes: this.accessibilityAttributes, children: this.text }));
        }
        return (jsxRuntime.jsx(Button.Button, { class: "ui5-shellbar-action-button", icon: this.icon, design: "Transparent", accessibleName: this.text, "data-ui5-stable": this.stableDomRef, accessibilityAttributes: this.accessibilityAttributes, onClick: this.fireClickEvent, children: this.count && (jsxRuntime.jsx(ButtonBadge$1, { slot: "badge", design: "OverlayText", text: this.count })) }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var shellBarV2ItemStyles = `.ui5-shellbar-action-button{width:2.25rem;height:2.25rem;color:var(--sapShell_TextColor)}.ui5-shellbar-action-button:hover{background:var(--sapShell_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapShell_InteractiveTextColor)}.ui5-shellbar-action-button[active]{color:var(--_ui5_shellbar_button_active_color)}.ui5-shellbar-action-button>[ui5-button-badge][slot=badge][design=OverlayText]{top:var(--_ui5-shellbar-badge-offset, 0);margin:var(--_ui5-shellbar-badge-margin, -.5rem)}[ui5-li]::part(icon){color:var(--sapList_TextColor)}[ui5-li]:after{position:relative;width:fit-content;height:1rem;min-width:1rem;background:var(--sapContent_BadgeBackground);border:var(--_ui5_shellbar_button_badge_border);color:var(--sapContent_BadgeTextColor);bottom:calc(100% + .0625rem);left:1.25rem;padding:0 .3125rem;border-radius:.5rem;display:flex;justify-content:center;align-items:center;font-size:var(--sapFontSmallSize);font-family:var(--sapFontFamily);z-index:2;box-sizing:border-box;pointer-events:none}[ui5-li][data-count]:after{content:attr(data-count)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * The `ui5-shellbar-item` represents a custom item for `ui5-shellbar`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/ShellBarItem.js";`
     * @constructor
     * @extends UI5Element
     * @public
     */
    let ShellBarItem = class ShellBarItem extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Defines additional accessibility attributes on Shellbar Items.
             *
             * The accessibility attributes support the following values:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls,
             * is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`.
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element,
             * such as menu or dialog, that can be triggered by the button.
             *
             * - **controls**: Identifies the element (or elements) whose contents
             * or presence are controlled by the component.
             * Accepts a lowercase string value, referencing the ID of the element it controls.
             *
             * @default {}
             * @public
             * @since 2.9.0
             */
            this.accessibilityAttributes = {};
            /**
             * Indicates if item is in overflow popover.
             * @default false
             * @private
             */
            this.inOverflow = false;
        }
        get stableDomRef() {
            return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
        }
        hasListItems() {
            return this.inOverflow;
        }
        get listItems() {
            const domRef = this.getDomRef();
            if (!domRef || !this.inOverflow) {
                return [];
            }
            return [domRef];
        }
        fireClickEvent(e) {
            return this.fireDecoratorEvent("click", {
                targetRef: e.target,
            });
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], ShellBarItem.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ShellBarItem.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ShellBarItem.prototype, "count", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], ShellBarItem.prototype, "accessibilityAttributes", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ShellBarItem.prototype, "inOverflow", void 0);
    ShellBarItem = __decorate([
        webcomponentsBase.m({
            tag: "ui5-shellbar-item",
            renderer: jsxRuntime.y,
            template: ShellBarItemTemplate,
            styles: shellBarV2ItemStyles,
            dependencies: [Button.Button, ButtonBadge$1, ListItemStandard$1],
        })
        /**
         * Fired when the item is clicked.
         * @param {HTMLElement} targetRef DOM ref of the clicked element
         * @public
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
            cancelable: true,
        })
    ], ShellBarItem);
    ShellBarItem.define();
    var ShellBarItem$1 = ShellBarItem;

    exports.ButtonBadge = ButtonBadge$1;
    exports.ListItemStandard = ListItemStandard$1;
    exports.ShellBarItem = ShellBarItem$1;

}));
