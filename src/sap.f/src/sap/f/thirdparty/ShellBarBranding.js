sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/Icons'], (function (webcomponentsBase, parametersBundle_css, eventStrict, Theme, parametersBundle_css$1, Icons) { 'use strict';

    function ShellBarBrandingTemplate() {
        return (parametersBundle_css.jsxs("a", { class: "ui5-shellbar-branding-root", href: this.parsedRef, target: this.target, role: this._role, tabIndex: 0, "aria-label": this.accessibleNameText, onClick: this._onclick, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, children: [parametersBundle_css.jsx("span", { class: "ui5-shellbar-logo", children: parametersBundle_css.jsx("slot", { name: "logo" }) }), !this._isSBreakPoint && (parametersBundle_css.jsx("bdi", { class: "ui5-shellbar-title", children: parametersBundle_css.jsx("slot", {}) }))] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var shellBarBrandingCss = `:host(:not([hidden])) .ui5-shellbar-branding-root{text-decoration:none}:host(:not([hidden])){display:inline}.ui5-shellbar-branding-root{overflow:hidden;display:flex;align-items:center;padding-block:.25rem;padding-inline:.25rem .5rem;box-sizing:border-box;cursor:pointer;background:var(--sapButton_Lite_Background);border:1px solid var(--sapButton_Lite_BorderColor);color:var(--sapShell_TextColor);margin-inline-start:.125rem;margin-inline-end:.5rem}.ui5-shellbar-branding-root:focus{outline:var(--_ui5-v2-15-0_shellbar_logo_outline);border-radius:var(--_ui5-v2-15-0_shellbar_logo_border_radius)}.ui5-shellbar-branding-root:hover{box-shadow:var(--_ui5-v2-15-0_shellbar_button_box_shadow);border-radius:var(--_ui5-v2-15-0_shellbar_logo_border_radius)}.ui5-shellbar-branding-root:active:focus{background:var(--sapShell_Active_Background);border:1px solid var(--sapButton_Lite_Active_BorderColor);color:var(--sapShell_Active_TextColor)}.ui5-shellbar-title{display:inline-block;font-family:var(--sapFontSemiboldDuplexFamily);margin:0;font-size:var(--_ui5-v2-15-0_shellbar_menu_button_title_font_size);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--sapShell_SubBrand_TextColor);margin-inline-start:.25rem}.ui5-shellbar-logo-area{overflow:hidden;display:flex;align-items:center;padding:.25rem .5rem .25rem .25rem;box-sizing:border-box;cursor:pointer;background:var(--sapButton_Lite_Background);border:1px solid var(--sapButton_Lite_BorderColor);color:var(--sapShell_TextColor);margin-inline-start:.125rem}::slotted([slot="logo"]){max-height:2rem;max-width:3.75rem;pointer-events:none;padding-inline:.25rem}
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
     * The `ui5-shellbar-branding` component is intended to be placed inside the branding slot of the
     * `ui5-shellbar` component. Its content has higher priority than the `primaryTitle` property
     * and the `logo` slot of `ui5-shellbar`.
     *
     * @constructor
     * @extends UI5Element
     * @since 2.12.0
     * @public
     * @experimental
     */
    let ShellBarBranding = class ShellBarBranding extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines if the title of the branding is shown on an S breakpoint.
             * @default false
             * @private
             */
            this._isSBreakPoint = false;
        }
        get parsedRef() {
            return (this.href && this.href.length > 0) ? this.href : undefined;
        }
        get _role() {
            return this.href && this.href.length > 0 ? "link" : "button";
        }
        get accessibleNameText() {
            if (this.accessibleName) {
                return this.accessibleName;
            }
            const defaultSlot = this.shadowRoot?.querySelector("slot:not([name])");
            return defaultSlot?.assignedNodes({ flatten: true })
                .find(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
                ?.textContent.trim();
        }
        _fireClick() {
            this.fireDecoratorEvent("click");
        }
        _onclick(e) {
            e.stopPropagation();
            this._fireClick();
        }
        _onkeyup(e) {
            if (webcomponentsBase.A(e)) {
                this._fireClick();
            }
        }
        _onkeydown(e) {
            if (webcomponentsBase.A(e)) {
                e.preventDefault();
                return;
            }
            if (webcomponentsBase.b$1(e)) {
                this._fireClick();
            }
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], ShellBarBranding.prototype, "href", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ShellBarBranding.prototype, "target", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ShellBarBranding.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ShellBarBranding.prototype, "_isSBreakPoint", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], ShellBarBranding.prototype, "content", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement })
    ], ShellBarBranding.prototype, "logo", void 0);
    ShellBarBranding = __decorate([
        webcomponentsBase.m({
            tag: "ui5-shellbar-branding",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: ShellBarBrandingTemplate,
            styles: shellBarBrandingCss,
        })
        /**
         * Fired, when the logo is activated.
         * @public
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
        })
    ], ShellBarBranding);
    ShellBarBranding.define();
    var ShellBarBranding_default = ShellBarBranding;

    return ShellBarBranding_default;

}));
