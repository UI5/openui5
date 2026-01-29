sap.ui.define(['exports', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Text', 'sap/f/thirdparty/Link', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/information', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/ListItemBase'], (function (exports, parametersBundle_css, webcomponentsBase, parametersBundle_css$1, Theme, i18nDefaults, Text, Link, Button, ResponsivePopover, Icons, willShowContent, eventStrict, AccessibilityTextsHelper, toLowercaseEnumValue, Icon, BusyIndicator, Label, information, Title, ValueState, FocusableElements, ListItemBase) { 'use strict';

    /**
     * Overflow Mode.
     * @public
     */
    var ExpandableTextOverflowMode;
    (function (ExpandableTextOverflowMode) {
        /**
         * Overflowing text is appended in-place.
         * @public
         */
        ExpandableTextOverflowMode["InPlace"] = "InPlace";
        /**
         * Full text is displayed in a popover.
         * @public
         */
        ExpandableTextOverflowMode["Popover"] = "Popover";
    })(ExpandableTextOverflowMode || (ExpandableTextOverflowMode = {}));
    var ExpandableTextOverflowMode$1 = ExpandableTextOverflowMode;

    function ExpandableTextTemplate() {
        return (parametersBundle_css.jsxs("div", { children: [parametersBundle_css.jsx(Text.Text, { class: "ui5-exp-text-text", emptyIndicatorMode: this.emptyIndicatorMode, children: this._displayedText }), this._maxCharactersExceeded && parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { class: "ui5-exp-text-ellipsis", children: this._ellipsisText }), parametersBundle_css.jsx(Link.Link, { id: "toggle", class: "ui5-exp-text-toggle", accessibleRole: "Button", accessibleName: this._accessibleNameForToggle, accessibilityAttributes: this._accessibilityAttributesForToggle, onClick: this._handleToggleClick, children: this._textForToggle }), this._usePopover &&
                            parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { open: this._expanded, opener: "toggle", accessibleNameRef: "popover-text", contentOnlyOnDesktop: true, _hideHeader: true, class: "ui5-exp-text-popover", onClose: this._handlePopoverClose, children: [parametersBundle_css.jsx(Text.Text, { id: "popover-text", children: this.text }), parametersBundle_css.jsx("div", { slot: "footer", class: "ui5-exp-text-footer", children: parametersBundle_css.jsx(Button.Button, { design: "Transparent", onClick: this._handleCloseButtonClick, children: this._closeButtonText }) })] })] })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var ExpandableTextCss = `:host{display:inline-block;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapTextColor)}:host([hidden]){display:none}.ui5-exp-text-text{display:inline}.ui5-exp-text-text,.ui5-exp-text-toggle{font-family:inherit;font-size:inherit}.ui5-exp-text-text,.ui5-exp-text-ellipsis{color:inherit}.ui5-exp-text-popover::part(content){padding-inline:1rem}.ui5-exp-text-footer{width:100%;display:flex;align-items:center;justify-content:flex-end}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ExpandableText_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-expandable-text` component allows displaying a large body of text in a small space. It provides an "expand/collapse" functionality, which shows/hides potentially truncated text.
     *
     * ### Usage
     *
     * #### When to use:
     * - To accommodate long texts in limited space, for example in list items, table cell texts, or forms
     *
     * #### When not to use:
     * - The content is critical for the user. In this case use short descriptions that can fit in
     * - Strive to provide short and meaningful texts to avoid excessive number of "Show More" links on the page
     *
     * ### Responsive Behavior
     *
     * On phones, if the component is configured to display the full text in a popover, the popover will appear in full screen.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/ExpandableText";`
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.6.0
     */
    let ExpandableText = ExpandableText_1 = class ExpandableText extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Maximum number of characters to be displayed initially. If the text length exceeds this limit, the text will be truncated with an ellipsis, and the "More" link will be displayed.
             * @default 100
             * @public
             */
            this.maxCharacters = 100;
            /**
             * Determines how the full text will be displayed.
             * @default "InPlace"
             * @public
             */
            this.overflowMode = "InPlace";
            /**
             * Specifies if an empty indicator should be displayed when there is no text.
             * @default "Off"
             * @public
             */
            this.emptyIndicatorMode = "Off";
            this._expanded = false;
        }
        getFocusDomRef() {
            if (this._usePopover) {
                return this.shadowRoot?.querySelector("[ui5-responsive-popover]");
            }
            return this.shadowRoot?.querySelector("[ui5-link]");
        }
        get _displayedText() {
            if (this._expanded && !this._usePopover) {
                return this.text;
            }
            return this.text?.substring(0, this.maxCharacters);
        }
        get _maxCharactersExceeded() {
            return (this.text?.length || 0) > this.maxCharacters;
        }
        get _usePopover() {
            return this.overflowMode === ExpandableTextOverflowMode$1.Popover;
        }
        get _ellipsisText() {
            if (this._expanded && !this._usePopover) {
                return " ";
            }
            return "... ";
        }
        get _textForToggle() {
            return this._expanded ? ExpandableText_1.i18nBundle.getText(i18nDefaults.EXPANDABLE_TEXT_SHOW_LESS) : ExpandableText_1.i18nBundle.getText(i18nDefaults.EXPANDABLE_TEXT_SHOW_MORE);
        }
        get _closeButtonText() {
            return ExpandableText_1.i18nBundle.getText(i18nDefaults.EXPANDABLE_TEXT_CLOSE);
        }
        get _accessibilityAttributesForToggle() {
            if (this._usePopover) {
                return {
                    expanded: this._expanded,
                    hasPopup: "dialog",
                };
            }
            return {
                expanded: this._expanded,
            };
        }
        get _accessibleNameForToggle() {
            if (this._usePopover) {
                return this._expanded ? ExpandableText_1.i18nBundle.getText(i18nDefaults.EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL) : ExpandableText_1.i18nBundle.getText(i18nDefaults.EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL);
            }
            return undefined;
        }
        _handlePopoverClose() {
            if (!Theme.d()) {
                this._expanded = false;
            }
        }
        _handleToggleClick() {
            this._expanded = !this._expanded;
        }
        _handleCloseButtonClick(e) {
            this._expanded = false;
            e.stopPropagation();
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], ExpandableText.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], ExpandableText.prototype, "maxCharacters", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ExpandableText.prototype, "overflowMode", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ExpandableText.prototype, "emptyIndicatorMode", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ExpandableText.prototype, "_expanded", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], ExpandableText, "i18nBundle", void 0);
    ExpandableText = ExpandableText_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-expandable-text",
            renderer: parametersBundle_css.y,
            styles: ExpandableTextCss,
            template: ExpandableTextTemplate,
        })
    ], ExpandableText);
    ExpandableText.define();

    /**
     * Provides a template for rendering text with the ExpandableText component
     * when wrappingType is set to "Normal".
     *
     * @param {object} injectedProps - The configuration options for the expandable text
     * @returns {JSX.Element} The rendered ExpandableText component
     */
    function ListItemStandardExpandableTextTemplate(injectedProps) {
        const { className, text, maxCharacters, part } = injectedProps;
        return (parametersBundle_css.jsx(ExpandableText, { part: part, class: className, text: text, maxCharacters: maxCharacters }));
    }

    exports.default = ListItemStandardExpandableTextTemplate;

}));
