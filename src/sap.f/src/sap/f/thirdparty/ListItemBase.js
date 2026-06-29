sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css'], (function (exports, webcomponentsBase, jsxRuntime, eventStrict, Theme, parametersBundle_css) { 'use strict';

    const i=t=>{if(t.nodeName==="SLOT")return  false;const e=window.getComputedStyle(t);return e.display!=="contents"&&t.offsetWidth<=0&&t.offsetHeight<=0||e.visibility==="hidden"};

    const r=e=>{if(!e||e.hasAttribute("data-sap-no-tab-ref")||i(e))return  false;const t=e.getAttribute("tabindex");if(t!=null)return parseInt(t)>=0;const n=e.nodeName.toLowerCase();return n==="a"||/^(input|select|textarea|button|object)$/.test(n)?!e.disabled:false};

    const b=e=>l(e.tagName==="SLOT"?[e]:[...e.children]),l=(e,n)=>{const a=n||[];return e&&e.forEach(r$1=>{if(r$1.nodeType===Node.TEXT_NODE||r$1.nodeType===Node.COMMENT_NODE)return;const t=r$1;if(!t.hasAttribute("data-sap-no-tab-ref"))if(r(t)&&a.push(t),t.tagName==="SLOT")l(t.assignedElements(),a);else {const s=t.shadowRoot?t.shadowRoot.children:t.children;l([...s],a);}}),a};

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var styles = `:host{box-sizing:border-box;height:var(--_ui5_list_item_base_height);background-color:var(--ui5-listitem-background-color);border-bottom:.0625rem solid transparent}:host(:not([hidden])){display:block}:host([disabled]){opacity:var(--_ui5-listitembase_disabled_opacity);pointer-events:none}:host([actionable]:not([disabled]):not([ui5-li-group-header])){cursor:pointer}:host([has-border]){border-bottom:var(--ui5-listitem-border-bottom)}:host([selected]){background-color:var(--sapList_SelectionBackgroundColor);border-bottom:var(--ui5-listitem-selected-border-bottom)}:host([selected]) .ui5-li-additional-text{text-shadow:var(--sapContent_TextShadow)}:host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover){background-color:var(--sapList_Hover_Background)}:host([actionable]:not([active]):not(:active):not([selected]):not([ui5-li-group-header]):hover) .ui5-li-additional-text{text-shadow:var(--sapContent_TextShadow)}:host([actionable][selected]:not([active]):not(:active):not([data-moving]):hover){background-color:var(--sapList_Hover_SelectionBackground)}:host([active][actionable]:not([data-moving])),:host([active][actionable][selected]:not([data-moving])){background-color:var(--sapList_Active_Background);border-bottom-color:var(--sapList_Active_Background)}:host([desktop]:not([data-moving])) .ui5-li-root.ui5-li--focusable:focus:after,:host([desktop][focused]:not([data-moving])) .ui5-li-root.ui5-li--focusable:after,:host(:not([data-moving])) .ui5-li-root.ui5-li--focusable:focus-visible:after,:host([desktop]:not([data-moving])) .ui5-li-root .ui5-li-content:focus:after,:host([desktop][focused]:not([data-moving])) .ui5-li-root .ui5-li-content:after,:host(:not([data-moving])) .ui5-li-root .ui5-li-content:focus-visible:after{content:"";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;inset:.125rem;pointer-events:none}.ui5-li-root{position:relative;display:flex;align-items:center;width:100%;height:100%;padding:var(--_ui5_list_item_base_padding);box-sizing:border-box;background-color:inherit}.ui5-li-root.ui5-li--focusable{outline:none}.ui5-li-content{display:flex;align-items:center;flex:auto;overflow:hidden;max-width:100%;font-family:var(--sapFontFamily);color:var(--sapList_TextColor)}.ui5-li-content .ui5-li-title{color:var(--sapList_TextColor);font-size:var(--_ui5_list_item_title_size)}.ui5-li-text-wrapper{display:flex;flex-direction:row;justify-content:space-between;flex:auto;min-width:1px;line-height:normal}
`;

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var draggableElementStyles = `[draggable=true]{cursor:grab!important}[draggable=true][data-moving]{cursor:grabbing!important;opacity:var(--sapContent_DisabledOpacity)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * A class to serve as a foundation
     * for the `ListItem` and `ListItemGroupHeader` classes.
     * @constructor
     * @abstract
     * @extends UI5Element
     * @public
     */
    let ListItemBase = class ListItemBase extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Defines the selected state of the component.
             * @default false
             * @private
             */
            this.selected = false;
            /**
             * Defines whether the item is movable.
             * @default false
             * @private
             * @since 2.0.0
             */
            this.movable = false;
            /**
            * Defines if the list item should display its bottom border.
            * @private
            */
            this.hasBorder = false;
            /**
            * Defines whether `ui5-li` is in disabled state.
            *
            * **Note:** A disabled `ui5-li` is noninteractive.
            * @default false
            * @protected
            * @since 1.0.0-rc.12
            */
            this.disabled = false;
            /**
             * Indicates if the element is on focus
             * @private
             */
            this.focused = false;
            /**
             * Indicates if the list item is actionable, e.g has hover and pressed effects.
             * @private
             */
            this.actionable = false;
        }
        onEnterDOM() {
            if (Theme.f$1()) {
                this.setAttribute("desktop", "");
            }
        }
        onBeforeRendering() {
            this.actionable = true;
        }
        _onfocusin(e) {
            this.fireDecoratorEvent("request-tabindex-change", e);
            if (e.target !== this.getFocusDomRef()) {
                return;
            }
            this.fireDecoratorEvent("_focused", e);
        }
        _onkeydown(e) {
            if (webcomponentsBase.x(e)) {
                return this._handleTabNext(e);
            }
            if (webcomponentsBase.V(e)) {
                return this._handleTabPrevious(e);
            }
            if (this.getFocusDomRef().matches(":has(:focus-within)")) {
                return;
            }
            if (this._isSpace(e)) {
                e.preventDefault();
            }
            if (this._isEnter(e)) {
                this.fireItemPress(e);
            }
        }
        _onkeyup(e) {
            if (this.getFocusDomRef().matches(":has(:focus-within)")) {
                return;
            }
            if (this._isSpace(e)) {
                this.fireItemPress(e);
            }
        }
        _onclick(e) {
            if (this.getFocusDomRef().matches(":has(:focus-within)") || this._isDisabledInteractiveContentClicked(e)) {
                return;
            }
            e.stopPropagation();
            this.fireItemPress(e);
        }
        _isDisabledInteractiveContentClicked(e) {
            const path = e.composedPath();
            const focusDomRef = this.getFocusDomRef();
            return path.some(target => {
                if (!(target instanceof HTMLElement)) {
                    return false;
                }
                if (target === this || target === focusDomRef) {
                    return false;
                }
                if (!this._isNativeInteractiveElement(target) && !this._isCustomInteractiveElement(target)) {
                    return false;
                }
                return this._isElementDisabled(target);
            });
        }
        _isNativeInteractiveElement(target) {
            return target.matches("button, input, select, textarea");
        }
        _isCustomInteractiveElement(target) {
            const targetWithDisabled = target;
            return target.tagName.includes("-")
                && ("disabled" in targetWithDisabled || target.hasAttribute("aria-disabled"));
        }
        _isElementDisabled(target) {
            const targetWithDisabled = target;
            if (typeof targetWithDisabled.disabled === "boolean") {
                return targetWithDisabled.disabled;
            }
            return target.getAttribute("aria-disabled") === "true";
        }
        /**
         * Override from subcomponent, if needed
         */
        _isSpace(e) {
            return webcomponentsBase.A(e);
        }
        /**
         * Override from subcomponent, if needed
         */
        _isEnter(e) {
            return webcomponentsBase.b(e);
        }
        fireItemPress(e) {
            if (this.disabled || !this._pressable) {
                return;
            }
            if (webcomponentsBase.b(e)) {
                e.preventDefault();
            }
            this.fireDecoratorEvent("click", { item: this, originalEvent: e });
            this.fireDecoratorEvent("_press", { item: this, selected: this.selected, key: e.key });
        }
        _handleTabNext(e) {
            if (this.shouldForwardTabAfter()) {
                if (!this.fireDecoratorEvent("forward-after")) {
                    e.preventDefault();
                }
            }
        }
        _handleTabPrevious(e) {
            const target = e.target;
            if (this.shouldForwardTabBefore(target)) {
                if (!this.fireDecoratorEvent("forward-before")) {
                    e.preventDefault();
                }
            }
        }
        /**
         * Determines if th current list item either has no tabbable content or
         * [Tab] is performed onto the last tabbale content item.
         */
        shouldForwardTabAfter() {
            const aContent = b(this.getFocusDomRef());
            return aContent.length === 0 || (aContent[aContent.length - 1] === webcomponentsBase.t());
        }
        /**
         * Determines if the current list item is target of [SHIFT+TAB].
         */
        shouldForwardTabBefore(target) {
            return this.getFocusDomRef() === target;
        }
        get classes() {
            return {
                main: {
                    "ui5-li-root": true,
                    "ui5-li--focusable": this._focusable,
                },
            };
        }
        get _ariaDisabled() {
            return this.disabled ? true : undefined;
        }
        get _focusable() {
            return !this.disabled;
        }
        get _pressable() {
            return true;
        }
        get hasConfigurableMode() {
            return false;
        }
        get _effectiveTabIndex() {
            if (!this._focusable) {
                return -1;
            }
            if (this.selected) {
                return 0;
            }
            return this.forcedTabIndex ? parseInt(this.forcedTabIndex) : undefined;
        }
        get isListItemBase() {
            return true;
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "selected", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "movable", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "hasBorder", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemBase.prototype, "forcedTabIndex", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "disabled", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "focused", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "actionable", void 0);
    ListItemBase = __decorate([
        webcomponentsBase.m({
            renderer: jsxRuntime.y,
            styles: [styles, draggableElementStyles],
        })
        /**
         * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.
         *
         * **Note:** The event will not be fired if the `disabled` property is set to `true`.
         *
         * @since 2.23.0
         * @public
         * @param {Event} originalEvent The original event from the user interaction.
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
        }),
        eventStrict.l("request-tabindex-change", {
            bubbles: true,
        }),
        eventStrict.l("_press", {
            bubbles: true,
        }),
        eventStrict.l("_focused", {
            bubbles: true,
        }),
        eventStrict.l("forward-after", {
            bubbles: true,
            cancelable: true,
        }),
        eventStrict.l("forward-before", {
            bubbles: true,
            cancelable: true,
        })
    ], ListItemBase);
    var ListItemBase$1 = ListItemBase;

    exports.ListItemBase = ListItemBase$1;
    exports.b = b;
    exports.i = i;

}));
