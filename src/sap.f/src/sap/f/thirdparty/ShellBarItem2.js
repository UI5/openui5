sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Tag', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemStandard', 'sap/f/thirdparty/parameters-bundle3.css'], (function (exports, webcomponentsBase, eventStrict, parametersBundle_css, Button, Tag, ManagedStyles, parametersBundle_css$1, ListItemStandard, parametersBundle_css$2) { 'use strict';

    function ButtonTemplate() {
        return parametersBundle_css.jsx(Tag.Tag, { design: "Critical", "hide-state-icon": true, children: this.effectiveText });
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var buttonBadgeCss = `[ui5-tag]::part(root){border:.0625rem solid var(--sapContent_BadgeBorderColor);background-color:var(--sapContent_BadgeBackground);color:var(--sapContent_BadgeTextColor);height:1rem;border-radius:.5rem;display:flex;align-items:center}:host([design="AttentionDot"]) [ui5-tag]::part(root){min-width:var(--_ui5-button-badge-diameter);min-height:var(--_ui5-button-badge-diameter);height:var(--_ui5-button-badge-diameter);width:var(--_ui5-button-badge-diameter);border-radius:100%}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
    let ButtonBadge = class ButtonBadge extends webcomponentsBase.b {
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
    __decorate$1([
        webcomponentsBase.s()
    ], ButtonBadge.prototype, "design", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ButtonBadge.prototype, "text", void 0);
    ButtonBadge = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-button-badge",
            renderer: parametersBundle_css.y,
            template: ButtonTemplate,
            styles: buttonBadgeCss,
        })
    ], ButtonBadge);
    ButtonBadge.define();
    var ButtonBadge$1 = ButtonBadge;

    function ShellBarItemTemplate() {
        if (this.inOverflow) {
            return (parametersBundle_css.jsx(ListItemStandard.ListItemStandard, { icon: this.icon ? `sap-icon://${this.icon}` : "", type: "Active", text: this.text, wrappingType: "Normal", additionalText: this.count, "data-ui5-stable": this.stableDomRef, accessibilityAttributes: this.accessibilityAttributes, onClick: this.fireClickEvent }));
        }
        return (parametersBundle_css.jsx(Button.Button, { class: "ui5-shellbar-action-button", icon: this.icon, design: "Transparent", accessibleName: this.text, "data-ui5-stable": this.stableDomRef, accessibilityAttributes: this.accessibilityAttributes, onClick: this.fireClickEvent, children: this.count && (parametersBundle_css.jsx(ButtonBadge$1, { slot: "badge", design: "OverlayText", text: this.count })) }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme, "host");
    var shellBarV2ItemStyles = `.ui5-shellbar-action-button{width:2.25rem;height:2.25rem;color:var(--sapShell_TextColor)}.ui5-shellbar-action-button:hover{background:var(--sapShell_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapShell_InteractiveTextColor)}.ui5-shellbar-action-button[active]{color:var(--_ui5_shellbar_button_active_color)}.ui5-shellbar-action-button>[ui5-button-badge][slot=badge][design=OverlayText]{top:var(--_ui5-shellbar-badge-offset, 0);margin:var(--_ui5-shellbar-badge-margin, -.5rem)}[ui5-li]::part(icon){color:var(--sapList_TextColor);align-self:center}[ui5-li]{--_ui5_li_text_wrapper_flex: 0 1 auto}[ui5-li]::part(additional-text){display:inline-flex;align-items:center;justify-content:center;height:1rem;min-width:1rem;padding:0 .3125rem;border-radius:.5rem;border:var(--_ui5_shellbar_button_badge_border);background:var(--sapContent_BadgeBackground);color:var(--sapContent_BadgeTextColor);font-size:var(--sapFontSmallSize);font-family:var(--sapFontBoldFamily);font-weight:700;white-space:nowrap;flex-shrink:0;box-sizing:border-box;pointer-events:none;text-shadow:none!important;align-self:center;margin-inline-start:.25rem}[ui5-li][active][actionable]::part(additional-text){color:var(--sapContent_BadgeTextColor);background:var(--sapContent_BadgeBackground)}[ui5-li][wrapping-type=Normal][additional-text]::part(additional-text){padding-inline-start:.3125rem}
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
    let ShellBarItem = class ShellBarItem extends webcomponentsBase.b {
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
        get isShellBarItem() {
            return true;
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
            renderer: parametersBundle_css.y,
            template: ShellBarItemTemplate,
            styles: shellBarV2ItemStyles,
            dependencies: [Button.Button, ButtonBadge$1, ListItemStandard.ListItemStandard],
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
    const isInstanceOfShellBarItem = webcomponentsBase.r("isShellBarItem");

    exports.ButtonBadge = ButtonBadge$1;
    exports.ShellBarItem = ShellBarItem$1;
    exports.isInstanceOfShellBarItem = isInstanceOfShellBarItem;

}));
