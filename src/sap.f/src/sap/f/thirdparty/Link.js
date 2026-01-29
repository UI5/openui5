sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/i18n-defaults2'], (function (exports, webcomponentsBase, eventStrict, parametersBundle_css, AccessibilityTextsHelper, parametersBundle_css$1, Theme, toLowercaseEnumValue, Icon, i18nDefaults) { 'use strict';

    /**
     * Different link designs.
     * @public
     */
    var LinkDesign;
    (function (LinkDesign) {
        /**
         * default type (no special styling)
         * @public
         */
        LinkDesign["Default"] = "Default";
        /**
         * subtle type (appears as regular text, rather than a link)
         * @public
         */
        LinkDesign["Subtle"] = "Subtle";
        /**
         * emphasized type
         * @public
         */
        LinkDesign["Emphasized"] = "Emphasized";
    })(LinkDesign || (LinkDesign = {}));
    var LinkDesign$1 = LinkDesign;

    function LinkTemplate() {
        return (parametersBundle_css.jsxs("a", { part: "root", class: "ui5-link-root", role: this.effectiveAccRole, href: this.parsedRef, target: this.target, rel: this._rel, tabindex: this.effectiveTabIndex, title: this.tooltip, "aria-disabled": this.disabled, "aria-label": this.ariaLabelText, "aria-haspopup": this._hasPopup, "aria-expanded": this.accessibilityAttributes.expanded, "aria-current": this.accessibilityAttributes.current, "aria-description": this.ariaDescriptionText, onClick: this._onclick, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, children: [this.icon &&
                    parametersBundle_css.jsx(Icon.Icon, { class: "ui5-link-icon", name: this.icon, mode: "Decorative", part: "icon" }), parametersBundle_css.jsx("span", { class: "ui5-link-text", children: parametersBundle_css.jsx("slot", {}) }), this.hasLinkType &&
                    parametersBundle_css.jsx("span", { class: "ui5-hidden-text", children: this.linkTypeText }), this.endIcon &&
                    parametersBundle_css.jsx(Icon.Icon, { class: "ui5-link-end-icon", name: this.endIcon, mode: "Decorative", part: "endIcon" })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var linkCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapLinkColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);cursor:pointer;outline:none;text-decoration:var(--_ui5-v2-15-0_link_text_decoration);text-shadow:var(--sapContent_TextShadow);white-space:normal;overflow-wrap:break-word}:host(:hover){color:var(--sapLink_Hover_Color);text-decoration:var(--_ui5-v2-15-0_link_hover_text_decoration)}:host(:active){color:var(--sapLink_Active_Color);text-decoration:var(--_ui5-v2-15-0_link_active_text_decoration)}:host([disabled]){pointer-events:none}:host([disabled]) .ui5-link-root{text-shadow:none;outline:none;cursor:default;pointer-events:none;opacity:var(--sapContent_DisabledOpacity)}:host([design="Emphasized"]) .ui5-link-root{font-family:var(--sapFontBoldFamily)}:host([design="Subtle"]){color:var(--sapLink_SubtleColor);text-decoration:var(--_ui5-v2-15-0_link_subtle_text_decoration)}:host([design="Subtle"]:hover:not(:active)){color:var(--sapLink_SubtleColor);text-decoration:var(--_ui5-v2-15-0_link_subtle_text_decoration_hover)}:host([wrapping-type="None"]){white-space:nowrap;overflow-wrap:normal}.ui5-link-root{max-width:100%;display:inline-block;position:relative;overflow:hidden;text-overflow:ellipsis;outline:none;white-space:inherit;overflow-wrap:inherit;text-decoration:inherit;color:inherit}:host([wrapping-type="None"][end-icon]) .ui5-link-root{display:inline-flex;align-items:end}:host .ui5-link-root{outline-offset:-.0625rem;border-radius:var(--_ui5-v2-15-0_link_focus_border-radius)}.ui5-link-icon,.ui5-link-end-icon{color:inherit;flex-shrink:0}.ui5-link-icon{float:inline-start;margin-inline-end:.125rem}.ui5-link-end-icon{margin-inline-start:.125rem;vertical-align:bottom}.ui5-link-text{overflow:hidden;text-overflow:ellipsis}.ui5-link-root:focus-visible,:host([desktop]) .ui5-link-root:focus-within,:host([design="Subtle"]) .ui5-link-root:focus-visible,:host([design="Subtle"][desktop]) .ui5-link-root:focus-within{background-color:var(--_ui5-v2-15-0_link_focus_background_color);outline:var(--_ui5-v2-15-0_link_outline);border-radius:var(--_ui5-v2-15-0_link_focus_border-radius);text-shadow:none;color:var(--_ui5-v2-15-0_link_focus_color)}:host(:not([desktop])) .ui5-link-root:focus-visible,:host([desktop]:focus-within),:host([design="Subtle"][desktop]:focus-within){text-decoration:var(--_ui5-v2-15-0_link_focus_text_decoration)}:host([desktop]:hover:not(:active):focus-within),:host([design="Subtle"][desktop]:hover:not(:active):focus-within){color:var(--_ui5-v2-15-0_link_focused_hover_text_color);text-decoration:var(--_ui5-v2-15-0_link_focused_hover_text_decoration)}:host([interactive-area-size="Large"]) .ui5-link-root{line-height:var(--_ui5-v2-15-0_link_large_interactive_area_height)}:host([interactive-area-size="Large"])::part(icon),:host([interactive-area-size="Large"])::part(endIcon){height:var(--_ui5-v2-15-0_link_large_interactive_area_height)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Link_1;
    /**
     * @class
     *
     * ### Overview
     * The `ui5-link` is a hyperlink component that is used to navigate to other
     * apps and web pages, or to trigger actions.
     * It is a clickable text element, visualized in such a way that it stands out
     * from the standard text.
     * On hover, it changes its style to an underlined text to provide additional feedback to the user.
     *
     * ### Usage
     *
     * You can set the `ui5-link` to be enabled or disabled.
     *
     * To create a visual hierarchy in large lists of links, you can set the less important links as
     * `Subtle` or the more important ones as `Emphasized`,
     * by using the `design` property.
     *
     * If the `href` property is set, the link behaves as the HTML
     * anchor tag (`<a></a>`) and opens the specified URL in the given target frame (`target` property).
     * To specify where the linked content is opened, you can use the `target` property.
     *
     * ### Responsive behavior
     *
     * If there is not enough space, the text of the `ui5-link` becomes truncated.
     * If the `wrappingType` property is set to `"Normal"`, the text is displayed
     * on several lines instead of being truncated.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Link";`
     * @constructor
     * @extends UI5Element
     * @public
     * @csspart icon - Used to style the provided icon within the link
     * @csspart endIcon - Used to style the provided endIcon within the link
     * @slot {Array<Node>} default - Defines the text of the component.
     *
     * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     */
    let Link = Link_1 = class Link extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines whether the component is disabled.
             *
             * **Note:** When disabled, the click event cannot be triggered by the user.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * Defines the component design.
             *
             * **Note:** Avaialble options are `Default`, `Subtle`, and `Emphasized`.
             * @default "Default"
             * @public
             */
            this.design = "Default";
            /**
             * Defines the target area size of the link:
             * - **InteractiveAreaSize.Normal**: The default target area size.
             * - **InteractiveAreaSize.Large**: The target area size is enlarged to 24px in height.
             *
             * **Note:**The property is designed to make links easier to activate and helps meet the WCAG 2.2 Target Size requirement. It is applicable only for the SAP Horizon themes.
             * **Note:**To improve <code>ui5-link</code>'s reliability and usability, it is recommended to use the <code>InteractiveAreaSize.Large</code> value in scenarios where the <code>ui5-link</code> component is placed inside another interactive component, such as a list item or a table cell.
             * Setting the <code>interactiveAreaSize</code> property to <code>InteractiveAreaSize.Large</code> increases the <code>ui5-link</code>'s invisible touch area. As a result, the user's intended one-time selection command is more likely to activate the desired <code>ui5-link</code>, with minimal chance of unintentionally activating the underlying component.
             *
             * @public
             * @since 2.8.0
             * @default "Normal"
             */
            this.interactiveAreaSize = "Normal";
            /**
             * Defines how the text of a component will be displayed when there is not enough space.
             *
             * **Note:** By default the text will wrap. If "None" is set - the text will truncate.
             * @default "Normal"
             * @public
             */
            this.wrappingType = "Normal";
            /**
             * Defines the ARIA role of the component.
             *
             * **Note:** Use the <code>LinkAccessibleRole.Button</code> role in cases when navigation is not expected to occur and the href property is not defined.
             * @default "Link"
             * @public
             * @since 1.9.0
             */
            this.accessibleRole = "Link";
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following fields are supported:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`.
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
             * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
             *
             * @public
             * @since 1.1.0
             * @default {}
             */
            this.accessibilityAttributes = {};
            this._dummyAnchor = document.createElement("a");
        }
        onEnterDOM() {
            if (Theme.f()) {
                this.setAttribute("desktop", "");
            }
        }
        onBeforeRendering() {
            const needsNoReferrer = this.target !== "_self"
                && this.href
                && this._isCrossOrigin(this.href);
            this._rel = needsNoReferrer ? "noreferrer noopener" : undefined;
        }
        _isCrossOrigin(href) {
            this._dummyAnchor.href = href;
            return !(this._dummyAnchor.hostname === Theme.i()
                && this._dummyAnchor.port === Theme.c()
                && this._dummyAnchor.protocol === Theme.a());
        }
        get effectiveTabIndex() {
            if (this.forcedTabIndex) {
                return Number.parseInt(this.forcedTabIndex);
            }
            return (this.disabled || !this.textContent?.length) ? -1 : 0;
        }
        get ariaLabelText() {
            return AccessibilityTextsHelper.A(this);
        }
        get hasLinkType() {
            return this.design !== LinkDesign$1.Default;
        }
        static typeTextMappings() {
            return {
                "Subtle": i18nDefaults.LINK_SUBTLE,
                "Emphasized": i18nDefaults.LINK_EMPHASIZED,
            };
        }
        get linkTypeText() {
            return Link_1.i18nBundle.getText(Link_1.typeTextMappings()[this.design]);
        }
        get parsedRef() {
            return (this.href && this.href.length > 0) ? this.href : undefined;
        }
        get effectiveAccRole() {
            return toLowercaseEnumValue.n(this.accessibleRole);
        }
        get ariaDescriptionText() {
            return this.accessibleDescription === "" ? undefined : this.accessibleDescription;
        }
        get _hasPopup() {
            return this.accessibilityAttributes.hasPopup;
        }
        _onclick(e) {
            const { altKey, ctrlKey, metaKey, shiftKey, } = e;
            e.stopImmediatePropagation();
            const executeEvent = this.fireDecoratorEvent("click", {
                altKey,
                ctrlKey,
                metaKey,
                shiftKey,
            });
            if (!executeEvent) {
                e.preventDefault();
            }
        }
        _onkeydown(e) {
            if (webcomponentsBase.b$1(e) && !this.href) {
                this._onclick(e);
                e.preventDefault();
            }
            else if (webcomponentsBase.A(e)) {
                e.preventDefault();
            }
        }
        _onkeyup(e) {
            if (!webcomponentsBase.A(e)) {
                return;
            }
            this._onclick(e);
            if (this.href && !e.defaultPrevented) {
                const customEvent = new MouseEvent("click");
                customEvent.stopImmediatePropagation();
                this.getDomRef().dispatchEvent(customEvent);
            }
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Link.prototype, "disabled", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "tooltip", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "href", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "target", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "design", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "interactiveAreaSize", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "wrappingType", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "accessibleNameRef", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "accessibleRole", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], Link.prototype, "accessibilityAttributes", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "accessibleDescription", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Link.prototype, "endIcon", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Link.prototype, "_rel", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Link.prototype, "forcedTabIndex", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Link, "i18nBundle", void 0);
    Link = Link_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-link",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: LinkTemplate,
            styles: linkCss,
        })
        /**
         * Fired when the component is triggered either with a mouse/tap
         * or by using the Enter key.
         * @public
         * @param {boolean} altKey Returns whether the "ALT" key was pressed when the event was triggered.
         * @param {boolean} ctrlKey Returns whether the "CTRL" key was pressed when the event was triggered.
         * @param {boolean} metaKey Returns whether the "META" key was pressed when the event was triggered.
         * @param {boolean} shiftKey Returns whether the "SHIFT" key was pressed when the event was triggered.
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
            cancelable: true,
        })
    ], Link);
    Link.define();
    var Link$1 = Link;

    exports.Link = Link$1;

}));
