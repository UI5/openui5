sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css'], (function (exports, webcomponentsBase, parametersBundle_css, Theme, parametersBundle_css$1) { 'use strict';

    /**
     * Different types of Title level.
     * @public
     */
    var TitleLevel;
    (function (TitleLevel) {
        /**
         * Renders `h1` tag.
         * @public
         */
        TitleLevel["H1"] = "H1";
        /**
         * Renders `h2` tag.
         * @public
         */
        TitleLevel["H2"] = "H2";
        /**
         * Renders `h3` tag.
         * @public
         */
        TitleLevel["H3"] = "H3";
        /**
         * Renders `h4` tag.
         * @public
         */
        TitleLevel["H4"] = "H4";
        /**
         * Renders `h5` tag.
         * @public
         */
        TitleLevel["H5"] = "H5";
        /**
         * Renders `h6` tag.
         * @public
         */
        TitleLevel["H6"] = "H6";
    })(TitleLevel || (TitleLevel = {}));
    var TitleLevel$1 = TitleLevel;

    function TitleTemplate() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: title.call(this, this.level) }));
    }
    function title(titleLevel) {
        switch (titleLevel) {
            case "H1":
                return (parametersBundle_css.jsx("h1", { class: "ui5-title-root", children: titleInner.call(this) }));
            case "H2":
                return (parametersBundle_css.jsx("h2", { class: "ui5-title-root", children: titleInner.call(this) }));
            case "H3":
                return (parametersBundle_css.jsx("h3", { class: "ui5-title-root", children: titleInner.call(this) }));
            case "H4":
                return (parametersBundle_css.jsx("h4", { class: "ui5-title-root", children: titleInner.call(this) }));
            case "H5":
                return (parametersBundle_css.jsx("h5", { class: "ui5-title-root", children: titleInner.call(this) }));
            case "H6":
                return (parametersBundle_css.jsx("h6", { id: `${this._id}-inner`, class: "ui5-title-root", children: titleInner.call(this) }));
            default:
                return (parametersBundle_css.jsx("h2", { class: "ui5-title-root", children: titleInner.call(this) }));
        }
    }
    function titleInner() {
        return (parametersBundle_css.jsx("span", { id: `${this._id}-inner`, children: parametersBundle_css.jsx("slot", {}) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var titleCss = `:host(:not([hidden])){display:block;cursor:text}:host{max-width:100%;color:var(--sapGroup_TitleTextColor);font-size:var(--sapFontHeader5Size);font-family:var(--sapFontHeaderFamily);text-shadow:var(--sapContent_TextShadow)}.ui5-title-root{display:inline-block;position:relative;font-weight:400;font-size:inherit;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis;max-width:100%;vertical-align:bottom;-webkit-margin-before:0;-webkit-margin-after:0;-webkit-margin-start:0;-webkit-margin-end:0;margin:0;cursor:inherit}:host{white-space:pre-line}:host([wrapping-type="None"]){white-space:nowrap}.ui5-title-root,:host ::slotted(*){white-space:inherit}::slotted(*){font-size:inherit;font-family:inherit;text-shadow:inherit}:host([size="H1"]){font-size:var(--sapFontHeader1Size)}:host([size="H2"]){font-size:var(--sapFontHeader2Size)}:host([size="H3"]){font-size:var(--sapFontHeader3Size)}:host([size="H4"]){font-size:var(--sapFontHeader4Size)}:host([size="H5"]){font-size:var(--sapFontHeader5Size)}:host([size="H6"]){font-size:var(--sapFontHeader6Size)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-title` component is used to display titles inside a page.
     * It is a simple, large-sized text with explicit header/title semantics.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Title.js";`
     * @constructor
     * @extends UI5Element
     * @slot {Node[]} default - Defines the text of the component.
     * This component supports nesting a `Link` component inside.
     *
     * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     * @public
     */
    let Title = class Title extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines how the text of a component will be displayed when there is not enough space.
             *
             * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
             * @default "Normal"
             * @public
             */
            this.wrappingType = "Normal";
            /**
             * Defines the component level.
             * Available options are: `"H6"` to `"H1"`.
             * This property does not influence the style of the component.
             * Use the property `size` for this purpose instead.
             * @default "H2"
             * @public
             */
            this.level = "H2";
            /**
             * Defines the visual appearance of the title.
             * Available options are: `"H6"` to `"H1"`.
             * @default "H5"
             * @public
             */
            this.size = "H5";
        }
        get h1() {
            return this.level === TitleLevel$1.H1;
        }
        get h2() {
            return this.level === TitleLevel$1.H2;
        }
        get h3() {
            return this.level === TitleLevel$1.H3;
        }
        get h4() {
            return this.level === TitleLevel$1.H4;
        }
        get h5() {
            return this.level === TitleLevel$1.H5;
        }
        get h6() {
            return this.level === TitleLevel$1.H6;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Title.prototype, "wrappingType", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Title.prototype, "level", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Title.prototype, "size", void 0);
    Title = __decorate([
        webcomponentsBase.m({
            tag: "ui5-title",
            renderer: parametersBundle_css.y,
            template: TitleTemplate,
            styles: titleCss,
        })
    ], Title);
    Title.define();
    var Title$1 = Title;

    exports.Title = Title$1;
    exports.TitleLevel = TitleLevel$1;

}));
