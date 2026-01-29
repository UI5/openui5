sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/i18n-defaults2'], (function (exports, webcomponentsBase, parametersBundle_css$1, parametersBundle_css, Theme, willShowContent, Label, i18nDefaults) { 'use strict';

    /**
     * Different BusyIndicator text placements.
     *
     * @public
     */
    var BusyIndicatorTextPlacement;
    (function (BusyIndicatorTextPlacement) {
        /**
         * The text will be displayed on top of the busy indicator.
         * @public
         */
        BusyIndicatorTextPlacement["Top"] = "Top";
        /**
         * The text will be displayed at the bottom of the busy indicator.
         * @public
         */
        BusyIndicatorTextPlacement["Bottom"] = "Bottom";
    })(BusyIndicatorTextPlacement || (BusyIndicatorTextPlacement = {}));
    var BusyIndicatorTextPlacement$1 = BusyIndicatorTextPlacement;

    function BusyIndicatorTemplate() {
        return (parametersBundle_css.jsxs("div", { class: "ui5-busy-indicator-root", children: [this._isBusy && (parametersBundle_css.jsxs("div", { class: {
                        "ui5-busy-indicator-busy-area": true,
                        "ui5-busy-indicator-busy-area-over-content": this.hasContent,
                    }, title: this.ariaTitle, tabindex: 0, role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuetext": "Busy", "aria-labelledby": this.labelId, "data-sap-focus-ref": true, children: [this.textPosition.top && BusyIndicatorBusyText.call(this), parametersBundle_css.jsxs("div", { class: "ui5-busy-indicator-circles-wrapper", children: [parametersBundle_css.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-0" }), parametersBundle_css.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-1" }), parametersBundle_css.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-2" })] }), this.textPosition.bottom && BusyIndicatorBusyText.call(this)] })), parametersBundle_css.jsx("slot", {}), this._isBusy && (parametersBundle_css.jsx("span", { "data-ui5-focus-redirect": true, tabindex: 0, role: "none", onFocusIn: this._redirectFocus }))] }));
    }
    function BusyIndicatorBusyText() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.text && (parametersBundle_css.jsx(Label, { id: `${this._id}-label`, class: "ui5-busy-indicator-text", children: this.text })) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var busyIndicatorCss = `:host(:not([hidden])){display:inline-block}:host([_is-busy]){color:var(--_ui5-v2-15-0_busy_indicator_color)}:host([size="S"]) .ui5-busy-indicator-root{min-width:1.625rem;min-height:.5rem}:host([size="S"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:1.75rem}:host([size="S"]) .ui5-busy-indicator-circle{width:.5rem;height:.5rem}:host([size="S"]) .ui5-busy-indicator-circle:first-child,:host([size="S"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.0625rem}:host(:not([size])) .ui5-busy-indicator-root,:host([size="M"]) .ui5-busy-indicator-root{min-width:3.375rem;min-height:1rem}:host([size="M"]) .ui5-busy-indicator-circle:first-child,:host([size="M"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.1875rem}:host(:not([size])[text]:not([text=""])) .ui5-busy-indicator-root,:host([size="M"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:2.25rem}:host(:not([size])) .ui5-busy-indicator-circle,:host([size="M"]) .ui5-busy-indicator-circle{width:1rem;height:1rem}:host([size="L"]) .ui5-busy-indicator-root{min-width:6.5rem;min-height:2rem}:host([size="L"]) .ui5-busy-indicator-circle:first-child,:host([size="L"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.25rem}:host([size="L"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:3.25rem}:host([size="L"]) .ui5-busy-indicator-circle{width:2rem;height:2rem}.ui5-busy-indicator-root{display:flex;justify-content:center;align-items:center;position:relative;background-color:inherit;height:inherit;border-radius:inherit}.ui5-busy-indicator-busy-area.ui5-busy-indicator-busy-area-over-content{position:absolute;inset:0;z-index:99}.ui5-busy-indicator-busy-area{display:flex;justify-content:center;align-items:center;background-color:inherit;flex-direction:column;border-radius:inherit}:host([active]) ::slotted(*){opacity:var(--sapContent_DisabledOpacity)}:host([desktop]) .ui5-busy-indicator-busy-area:focus,.ui5-busy-indicator-busy-area:focus-visible{outline:var(--_ui5-v2-15-0_busy_indicator_focus_outline);outline-offset:-2px}.ui5-busy-indicator-circles-wrapper{line-height:0}.ui5-busy-indicator-circle{display:inline-block;background-color:currentColor;border-radius:50%}.ui5-busy-indicator-circle:before{content:"";width:100%;height:100%;border-radius:100%}.circle-animation-0{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11)}.circle-animation-1{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.2s}.circle-animation-2{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.4s}.ui5-busy-indicator-text{width:100%;text-align:center}:host([text-placement="Top"]) .ui5-busy-indicator-text{margin-bottom:.5rem}:host(:not([text-placement])) .ui5-busy-indicator-text,:host([text-placement="Bottom"]) .ui5-busy-indicator-text{margin-top:.5rem}@keyframes grow{0%,50%,to{-webkit-transform:scale(.5);-moz-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var BusyIndicator_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-busy-indicator` signals that some operation is going on and that the
     * user must wait. It does not block the current UI screen so other operations could be triggered in parallel.
     * It displays 3 dots and each dot expands and shrinks at a different rate, resulting in a cascading flow of animation.
     *
     * ### Usage
     * For the `ui5-busy-indicator` you can define the size, the text and whether it is shown or hidden.
     * In order to hide it, use the "active" property.
     *
     * In order to show busy state over an HTML element, simply nest the HTML element in a `ui5-busy-indicator` instance.
     *
     * **Note:** Since `ui5-busy-indicator` has `display: inline-block;` by default and no width of its own,
     * whenever you need to wrap a block-level element, you should set `display: block` to the busy indicator as well.
     *
     * #### When to use:
     *
     * - The user needs to be able to cancel the operation.
     * - Only part of the application or a particular component is affected.
     *
     * #### When not to use:
     *
     * - The operation takes less than one second.
     * - You need to block the screen and prevent the user from starting another activity.
     * - Do not show multiple busy indicators at once.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/BusyIndicator.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Determines the content over which the component will appear.
     * @since 0.12.0
     */
    let BusyIndicator = BusyIndicator_1 = class BusyIndicator extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines the size of the component.
             * @default "M"
             * @public
             */
            this.size = "M";
            /**
             * Defines if the busy indicator is visible on the screen. By default it is not.
             * @default false
             * @public
             */
            this.active = false;
            /**
             * Defines the delay in milliseconds, after which the busy indicator will be visible on the screen.
             * @default 1000
             * @public
             */
            this.delay = 1000;
            /**
             * Defines the placement of the text.
             *
             * @default "Bottom"
             * @public
             */
            this.textPlacement = "Bottom";
            /**
             * Defines if the component is currently in busy state.
             * @private
             */
            this._isBusy = false;
            this._keydownHandler = this._handleKeydown.bind(this);
            this._preventEventHandler = this._preventEvent.bind(this);
        }
        onEnterDOM() {
            this.addEventListener("keydown", this._keydownHandler, {
                capture: true,
            });
            this.addEventListener("keyup", this._preventEventHandler, {
                capture: true,
            });
            if (Theme.f()) {
                this.setAttribute("desktop", "");
            }
        }
        onExitDOM() {
            if (this._busyTimeoutId) {
                clearTimeout(this._busyTimeoutId);
                delete this._busyTimeoutId;
            }
            this.removeEventListener("keydown", this._keydownHandler, true);
            this.removeEventListener("keyup", this._preventEventHandler, true);
        }
        get ariaTitle() {
            return BusyIndicator_1.i18nBundle.getText(i18nDefaults.BUSY_INDICATOR_TITLE);
        }
        get labelId() {
            return this.text ? `${this._id}-label` : undefined;
        }
        get textPosition() {
            return {
                top: this.text && this.textPlacement === BusyIndicatorTextPlacement$1.Top,
                bottom: this.text && this.textPlacement === BusyIndicatorTextPlacement$1.Bottom,
            };
        }
        get hasContent() {
            return willShowContent.t(Array.from(this.children));
        }
        onBeforeRendering() {
            if (this.active) {
                if (!this._isBusy && !this._busyTimeoutId) {
                    this._busyTimeoutId = setTimeout(() => {
                        delete this._busyTimeoutId;
                        this._isBusy = true;
                    }, Math.max(0, this.delay));
                }
            }
            else {
                if (this._busyTimeoutId) {
                    clearTimeout(this._busyTimeoutId);
                    delete this._busyTimeoutId;
                }
                this._isBusy = false;
            }
        }
        _handleKeydown(e) {
            if (!this._isBusy) {
                return;
            }
            e.stopImmediatePropagation();
            // move the focus to the last element in this DOM and let TAB continue to the next focusable element
            if (webcomponentsBase.x(e)) {
                this.focusForward = true;
                this.shadowRoot.querySelector("[data-ui5-focus-redirect]").focus();
                this.focusForward = false;
            }
        }
        _preventEvent(e) {
            if (this._isBusy) {
                e.stopImmediatePropagation();
            }
        }
        /**
         * Moves the focus to busy area when coming with SHIFT + TAB
         */
        _redirectFocus(e) {
            if (this.focusForward) {
                return;
            }
            e.preventDefault();
            this.shadowRoot.querySelector(".ui5-busy-indicator-busy-area").focus();
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "size", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], BusyIndicator.prototype, "active", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], BusyIndicator.prototype, "delay", void 0);
    __decorate([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "textPlacement", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], BusyIndicator.prototype, "_isBusy", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], BusyIndicator, "i18nBundle", void 0);
    BusyIndicator = BusyIndicator_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-busy-indicator",
            languageAware: true,
            styles: busyIndicatorCss,
            renderer: parametersBundle_css.y,
            template: BusyIndicatorTemplate,
        })
    ], BusyIndicator);
    BusyIndicator.define();
    var BusyIndicator$1 = BusyIndicator;

    exports.BusyIndicator = BusyIndicator$1;

}));
