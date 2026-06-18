sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Theme'], (function (exports, webcomponentsBase, jsxRuntime, parametersBundle_css, willShowContent, i18nDefaults, Theme) { 'use strict';

    /**
     * Empty Indicator Mode.
     * @public
     */
    var TextEmptyIndicatorMode;
    (function (TextEmptyIndicatorMode) {
        /**
         * Empty indicator is never rendered.
         * @public
         */
        TextEmptyIndicatorMode["Off"] = "Off";
        /**
         * Empty indicator is rendered always when the component's content is empty.
         * @public
         */
        TextEmptyIndicatorMode["On"] = "On";
    })(TextEmptyIndicatorMode || (TextEmptyIndicatorMode = {}));
    var TextEmptyIndicatorMode$1 = TextEmptyIndicatorMode;

    function TextTemplate() {
        return jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("span", { children: this._renderEmptyIndicator ?
                    jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("span", { className: "empty-indicator", "aria-hidden": "true", children: this._emptyIndicatorSymbol }), jsxRuntime.jsx("span", { className: "empty-indicator-aria-label", children: this._emptyIndicatorAriaLabel })] })
                    :
                        jsxRuntime.jsx("slot", {}) }) });
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var styles = `:host{max-width:100%;font-size:var(--sapFontSize);font-family:var(--sapFontFamily);color:var(--sapTextColor);line-height:normal;cursor:text;overflow:hidden;display:-webkit-inline-box;-webkit-line-clamp:var(--_ui5_text_max_lines);line-clamp:var(--_ui5_text_max_lines);-webkit-box-orient:vertical;white-space:normal;word-wrap:break-word}:host([max-lines="1"]){word-break:break-all}.empty-indicator-aria-label{position:absolute!important;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0;font-size:0}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Text_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-text` component displays text that can be used in any content area of an application.
     *
     * ### Usage
     *
     * - Use the `ui5-text` if you want to display text inside a form, table, or any other content area.
     * - Do not use the `ui5-text` if you need to reference input type of components (use ui5-label).
     *
     * ### Responsive behavior
     *
     * The `ui5-text` component is fully adaptive to all screen sizes.
     * By default, the text will wrap when the space is not enough.
     * In addition, the component supports truncation via the `max-lines` property,
     * by defining the number of lines the text should wrap before start truncating.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Text";`
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.0.0
     */
    let Text = Text_1 = class Text extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Defines the number of lines the text should wrap before it truncates.
             * @default Infinity
             * @public
             */
            this.maxLines = Infinity;
            /**
             * Specifies if an empty indicator should be displayed when there is no text.
             * @default "Off"
             * @since 2.2.0
             * @public
             */
            this.emptyIndicatorMode = "Off";
        }
        onBeforeRendering() {
            this.style.setProperty("--_ui5_text_max_lines", `${this.maxLines}`);
        }
        get hasText() {
            return willShowContent.t(this.text);
        }
        get _renderEmptyIndicator() {
            return !this.hasText && this.emptyIndicatorMode === TextEmptyIndicatorMode$1.On;
        }
        get _emptyIndicatorAriaLabel() {
            return Text_1.i18nBundle.getText(i18nDefaults.EMPTY_INDICATOR_ACCESSIBLE_TEXT);
        }
        get _emptyIndicatorSymbol() {
            return Text_1.i18nBundle.getText(i18nDefaults.EMPTY_INDICATOR_SYMBOL);
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], Text.prototype, "maxLines", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Text.prototype, "emptyIndicatorMode", void 0);
    __decorate([
        webcomponentsBase.d({ type: Node, "default": true })
    ], Text.prototype, "text", void 0);
    __decorate([
        parametersBundle_css.i("@ui5/webcomponents")
    ], Text, "i18nBundle", void 0);
    Text = Text_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-text",
            renderer: jsxRuntime.y,
            template: TextTemplate,
            styles,
        })
    ], Text);
    Text.define();
    var Text$1 = Text;

    exports.Text = Text$1;

}));
