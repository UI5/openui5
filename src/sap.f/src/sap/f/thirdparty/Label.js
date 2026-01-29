sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons'], (function (webcomponentsBase, parametersBundle_css$1, parametersBundle_css, i18nDefaults, Theme, Icons) { 'use strict';

    function LabelTemplate() {
        return (parametersBundle_css.jsxs("label", { class: "ui5-label-root", onClick: this._onclick, children: [parametersBundle_css.jsx("span", { class: "ui5-label-text-wrapper", children: parametersBundle_css.jsx("slot", {}) }), parametersBundle_css.jsx("span", { "aria-hidden": "true", class: "ui5-label-required-colon", "data-ui5-colon": this._colonSymbol })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var labelCss = `:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapContent_LabelColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;cursor:text}.ui5-label-root{width:100%;cursor:inherit}:host{white-space:normal}:host([wrapping-type="None"]){white-space:nowrap}:host([wrapping-type="None"]) .ui5-label-root{display:inline-flex}:host([wrapping-type="None"]) .ui5-label-text-wrapper{text-overflow:ellipsis;overflow:hidden;display:inline-block;vertical-align:top;flex:0 1 auto;min-width:0}:host([show-colon]) .ui5-label-required-colon:before{content:attr(data-ui5-colon)}:host([required]) .ui5-label-required-colon:after{content:"*";color:var(--sapField_RequiredColor);font-size:var(--sapFontLargeSize);font-weight:700;position:relative;font-style:normal;vertical-align:middle;line-height:0}.ui5-label-text-wrapper{padding-inline-end:.075rem}:host([required][show-colon]) .ui5-label-required-colon:after{margin-inline-start:.125rem}:host([show-colon]) .ui5-label-required-colon{margin-inline-start:-.05rem;white-space:pre}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Label_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-label` is a component used to represent a label for elements like input, textarea, select.
     * The `for` property of the `ui5-label` must be the same as the id attribute of the related input element.
     * Screen readers read out the label, when the user focuses the labelled control.
     *
     * The `ui5-label` appearance can be influenced by properties,
     * such as `required` and `wrappingType`.
     * The appearance of the Label can be configured in a limited way by using the design property.
     * For a broader choice of designs, you can use custom styles.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Label";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Defines the text of the component.
     *
     * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     */
    let Label = Label_1 = class Label extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines whether colon is added to the component text.
             *
             * **Note:** Usually used in forms.
             * @default false
             * @public
             */
            this.showColon = false;
            /**
             * Defines whether an asterisk character is added to the component text.
             *
             * **Note:** Usually indicates that user input (bound with the `for` property) is required.
             * In that case the `required` property of
             * the corresponding input should also be set.
             * @default false
             * @public
             */
            this.required = false;
            /**
             * Defines how the text of a component will be displayed when there is not enough space.
             *
             * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
             * @default "Normal"
             * @public
             */
            this.wrappingType = "Normal";
        }
        _onclick() {
            if (!this.for) {
                return;
            }
            const elementToFocus = this.getRootNode().querySelector(`[id="${this.for}"]`);
            if (elementToFocus) {
                elementToFocus.focus();
            }
        }
        get _colonSymbol() {
            return Label_1.i18nBundle.getText(i18nDefaults.LABEL_COLON);
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Label.prototype, "for", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Label.prototype, "showColon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Label.prototype, "required", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Label.prototype, "wrappingType", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Label, "i18nBundle", void 0);
    Label = Label_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-label",
            renderer: parametersBundle_css.y,
            template: LabelTemplate,
            styles: labelCss,
            languageAware: true,
        })
    ], Label);
    Label.define();
    var Label$1 = Label;

    return Label$1;

}));
