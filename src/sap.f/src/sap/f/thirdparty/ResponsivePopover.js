sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/information', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Button2'], (function (exports, webcomponentsBase, Theme, parametersBundle_css$1, i18nDefaults, parametersBundle_css, information, Title, ValueState, toLowercaseEnumValue, eventStrict, FocusableElements, AccessibilityTextsHelper, Icons, Icon, Button) { 'use strict';

    const e$1={toAttribute(t){return t instanceof HTMLElement?null:t},fromAttribute(t){return t}};

    function PopubBlockLayerTemplate() {
        return (parametersBundle_css.jsx("div", { class: "ui5-block-layer", onKeyDown: this._preventBlockLayerFocus, onMouseDown: this._preventBlockLayerFocus }));
    }

    function PopupTemplate(hooks) {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [PopubBlockLayerTemplate.call(this), parametersBundle_css.jsxs("section", { "root-element": true, style: this.styles.root, class: this.classes.root, role: this._role, "aria-describedby": this.ariaDescribedByIds, "aria-modal": this._ariaModal, "aria-label": this._ariaLabel, "aria-labelledby": this._ariaLabelledBy, onKeyDown: this._onkeydown, onFocusOut: this._onfocusout, onMouseUp: this._onmouseup, onMouseDown: this._onmousedown, children: [parametersBundle_css.jsx("span", { class: "first-fe", "data-ui5-focus-trap": true, role: "none", tabIndex: 0, onFocusIn: this.forwardToLast }), (hooks?.beforeContent || beforeContent$2).call(this), parametersBundle_css.jsx("div", { style: this.styles.content, class: this.classes.content, onScroll: this._scroll, part: "content", children: parametersBundle_css.jsx("slot", {}) }), this.ariaDescriptionText &&
                            parametersBundle_css.jsx("span", { id: "accessibleDescription", class: "ui5-hidden-text", children: this.ariaDescriptionText }), (hooks?.afterContent || afterContent$2).call(this), parametersBundle_css.jsx("span", { class: "last-fe", "data-ui5-focus-trap": true, role: "none", tabIndex: 0, onFocusIn: this.forwardToFirst })] })] }));
    }
    function beforeContent$2() { }
    function afterContent$2() { }

    function PopoverTemplate() {
        return PopupTemplate.call(this, {
            beforeContent: beforeContent$1,
            afterContent: afterContent$1,
        });
    }
    function beforeContent$1() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { class: "ui5-popover-arrow", style: this.styles.arrow }), this._displayHeader &&
                    parametersBundle_css.jsx("header", { class: "ui5-popup-header-root", id: "ui5-popup-header", part: "header", children: this.header.length ?
                            parametersBundle_css.jsx("slot", { name: "header" })
                            :
                                parametersBundle_css.jsx(Title.Title, { level: "H1", class: "ui5-popup-header-text", children: this.headerText }) })] }));
    }
    function afterContent$1() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this._displayFooter && !!this.footer.length &&
                parametersBundle_css.jsx("footer", { class: "ui5-popup-footer-root", part: "footer", children: parametersBundle_css.jsx("slot", { name: "footer" }) }) }));
    }

    const m$1=(t,a,e)=>Math.min(Math.max(t,a),Math.max(a,e));

    const r=()=>{const e=webcomponentsBase.t();return e&&typeof e.focus=="function"?e:null},a=e=>{const n=r();return n?l(e,n):false},l=(e,n)=>{let t=e;if(t.shadowRoot&&(t=Array.from(t.shadowRoot.children).find(c=>c.localName!=="style"),!t))return  false;if(t===n)return  true;const o=t.localName==="slot"?t.assignedNodes():t.children;return o?Array.from(o).some(s=>l(s,n)):false},m=(e,n,t)=>e>=t.left&&e<=t.right&&n>=t.top&&n<=t.bottom,f=(e,n)=>{let t,o;if(e instanceof MouseEvent)t=e.clientX,o=e.clientY;else {const s=e.touches[0];t=s.clientX,o=s.clientY;}return m(t,o,n)};function d(e){return "isUI5Element"in e&&"_show"in e}const i=e=>{const n=e.parentElement||e.getRootNode&&e.getRootNode().host;return n&&(d(n)||n===document.documentElement)?n:i(n)};

    /**
     * Popup accessible roles.
     * @public
     */
    var PopupAccessibleRole;
    (function (PopupAccessibleRole) {
        /**
         * Represents no ARIA role.
         * @public
         */
        PopupAccessibleRole["None"] = "None";
        /**
         * Represents the ARIA role "dialog".
         * @public
         */
        PopupAccessibleRole["Dialog"] = "Dialog";
        /**
         * Represents the ARIA role "alertdialog".
         * @public
         */
        PopupAccessibleRole["AlertDialog"] = "AlertDialog";
    })(PopupAccessibleRole || (PopupAccessibleRole = {}));
    var PopupAccessibleRole$1 = PopupAccessibleRole;

    const OpenedPopupsRegistry = Theme.m("OpenedPopupsRegistry", { openedRegistry: [] });
    const openUI5Support = Theme.n$1("OpenUI5Support");
    function registerPopupWithOpenUI5Support(popupInfo) {
        openUI5Support?.addOpenedPopup(popupInfo);
    }
    function unregisterPopupWithOpenUI5Support(popup) {
        openUI5Support?.removeOpenedPopup(popup);
    }
    const addOpenedPopup = (instance, parentPopovers = []) => {
        if (!OpenedPopupsRegistry.openedRegistry.some(popup => popup.instance === instance)) {
            OpenedPopupsRegistry.openedRegistry.push({
                instance,
                parentPopovers,
            });
            registerPopupWithOpenUI5Support({
                type: "WebComponent",
                instance,
            });
        }
        _updateTopModalPopup();
        if (OpenedPopupsRegistry.openedRegistry.length === 1) {
            attachGlobalListener();
        }
    };
    const removeOpenedPopup = (instance) => {
        OpenedPopupsRegistry.openedRegistry = OpenedPopupsRegistry.openedRegistry.filter(el => {
            return el.instance !== instance;
        });
        unregisterPopupWithOpenUI5Support(instance);
        _updateTopModalPopup();
        if (!OpenedPopupsRegistry.openedRegistry.length) {
            detachGlobalListener();
        }
    };
    const getOpenedPopups = () => {
        return [...OpenedPopupsRegistry.openedRegistry];
    };
    const _keydownListener = (event) => {
        if (!OpenedPopupsRegistry.openedRegistry.length) {
            return;
        }
        if (webcomponentsBase.m$2(event)) {
            const topmostPopup = OpenedPopupsRegistry.openedRegistry[OpenedPopupsRegistry.openedRegistry.length - 1].instance;
            if (openUI5Support && topmostPopup !== openUI5Support.getTopmostPopup()) {
                return;
            }
            event.stopPropagation();
            topmostPopup.closePopup(true);
        }
    };
    const attachGlobalListener = () => {
        document.addEventListener("keydown", _keydownListener);
    };
    const detachGlobalListener = () => {
        document.removeEventListener("keydown", _keydownListener);
    };
    const _updateTopModalPopup = () => {
        let popup;
        let hasModal = false;
        for (let i = OpenedPopupsRegistry.openedRegistry.length - 1; i >= 0; i--) {
            popup = OpenedPopupsRegistry.openedRegistry[i].instance;
            if (!hasModal && popup.isModal) {
                popup.isTopModalPopup = true;
                hasModal = true;
            }
            else {
                popup.isTopModalPopup = false;
            }
        }
    };

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var popupStlyes = `:host{min-width:1px;overflow:visible;border:none;inset:unset;margin:0;padding:0}:host(:focus-visible){outline:none}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var popupBlockLayerStyles = `.ui5-block-layer{position:fixed;z-index:-1;display:none;inset:-500px;outline:none;pointer-events:all}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var globalStyles = `.ui5-popup-scroll-blocker{overflow:hidden}
`;

    var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Popup_1;
    const createBlockingStyle = () => {
        if (!Theme.S("data-ui5-popup-scroll-blocker")) {
            Theme.c$1(globalStyles, "data-ui5-popup-scroll-blocker");
        }
    };
    createBlockingStyle();
    const pageScrollingBlockers = new Set();
    /**
     * @class
     * ### Overview
     * Base class for all popup Web Components.
     *
     * If you need to create your own popup-like custom UI5 Web Components.
     *
     * 1. The Popup class handles modality:
     *  - The "isModal" getter can be overridden by derivatives to provide their own conditions when they are modal or not
     *  - Derivatives may call the "blockPageScrolling" and "unblockPageScrolling" static methods to temporarily remove scrollbars on the html element
     *  - Derivatives may call the "openPopup" and "closePopup" methods which handle focus, manage the popup registry and for modal popups, manage the blocking layer
     *
     *  2. Provides blocking layer (relevant for modal popups only):
     *   - Controlled by the "open" and "close" methods
     *
     * 3. The Popup class "traps" focus:
     *  - Derivatives may call the "applyInitialFocus" method (usually when opening, to transfer focus inside the popup)
     *
     * 4. The template of this component exposes two inline partials you can override in derivatives:
     *  - beforeContent (upper part of the box, useful for header/title/close button)
     *  - afterContent (lower part, useful for footer/action buttons)
     * @constructor
     * @extends UI5Element
     * @public
     */
    let Popup = Popup_1 = class Popup extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines if the focus should be returned to the previously focused element,
             * when the popup closes.
             * @default false
             * @public
             * @since 1.0.0-rc.8
            */
            this.preventFocusRestore = false;
            /**
             * Allows setting a custom role.
             * @default "Dialog"
             * @public
             * @since 1.10.0
             */
            this.accessibleRole = "Dialog";
            /**
             * Indicates whether initial focus should be prevented.
             * @public
             * @default false
             * @since 2.0.0
             */
            this.preventInitialFocus = false;
            /**
             * Indicates if the element is the top modal popup
             *
             * This property is calculated automatically
             * @private
             * @default false
             */
            this.isTopModalPopup = false;
            /**
             * @private
             */
            this.onPhone = false;
            /**
             * @private
             */
            this.onDesktop = false;
            this._opened = false;
            this._open = false;
            this._resizeHandlerRegistered = false;
            this._resizeHandler = this._resize.bind(this);
            this._getRealDomRef = () => {
                return this.shadowRoot.querySelector("[root-element]");
            };
        }
        onBeforeRendering() {
            this.onPhone = Theme.d();
            this.onDesktop = Theme.f();
        }
        onAfterRendering() {
            Theme.f$1().then(() => {
                this._updateMediaRange();
            });
            if (this.open) {
                this._registerResizeHandler();
            }
            else {
                this._deregisterResizeHandler();
            }
        }
        onEnterDOM() {
            this.setAttribute("popover", "manual");
            if (Theme.f()) {
                this.setAttribute("desktop", "");
            }
            this.tabIndex = -1;
            this.handleOpenOnEnterDOM();
            this.setAttribute("data-sap-ui-fastnavgroup-container", "true");
            AccessibilityTextsHelper.y(this, this._updateAssociatedLabelsTexts.bind(this));
        }
        handleOpenOnEnterDOM() {
            if (this.open) {
                this.showPopover();
                this.openPopup();
            }
        }
        onExitDOM() {
            if (this._opened) {
                Popup_1.unblockPageScrolling(this);
                this._removeOpenedPopup();
            }
            webcomponentsBase.f.deregister(this, this._resizeHandler);
            AccessibilityTextsHelper.T(this);
        }
        /**
         * Indicates if the element is open
         * @public
         * @default false
         * @since 1.2.0
         */
        set open(value) {
            if (this._open === value) {
                return;
            }
            this._open = value;
            if (value) {
                this.openPopup();
            }
            else {
                this.closePopup();
            }
        }
        get open() {
            return this._open;
        }
        async openPopup() {
            if (this._opened) {
                return;
            }
            const prevented = !this.fireDecoratorEvent("before-open");
            if (prevented) {
                this.open = false;
                return;
            }
            if (this.isModal) {
                Popup_1.blockPageScrolling(this);
            }
            this._focusedElementBeforeOpen = r();
            this._show();
            this._opened = true;
            if (this.getDomRef()) {
                this._updateMediaRange();
            }
            this._addOpenedPopup();
            this.open = true;
            // initial focus, if focused element is statically created
            await this.applyInitialFocus();
            await Theme.f$1();
            if (this.isConnected) {
                this.fireDecoratorEvent("open");
            }
        }
        _resize() {
            this._updateMediaRange();
        }
        /**
         * Prevents the user from interacting with the content under the block layer
         */
        _preventBlockLayerFocus(e) {
            e.preventDefault();
        }
        /**
         * Temporarily removes scrollbars from the html element
         * @protected
         */
        static blockPageScrolling(popup) {
            pageScrollingBlockers.add(popup);
            if (pageScrollingBlockers.size !== 1) {
                return;
            }
            document.documentElement.classList.add("ui5-popup-scroll-blocker");
        }
        /**
         * Restores scrollbars on the html element, if needed
         * @protected
         */
        static unblockPageScrolling(popup) {
            pageScrollingBlockers.delete(popup);
            if (pageScrollingBlockers.size !== 0) {
                return;
            }
            document.documentElement.classList.remove("ui5-popup-scroll-blocker");
        }
        _scroll(e) {
            this.fireDecoratorEvent("scroll", {
                scrollTop: e.target.scrollTop,
                targetRef: e.target,
            });
        }
        _onkeydown(e) {
            const isTabOutAttempt = e.target === this._root && webcomponentsBase.V(e);
            // if the popup is closed, focus is already moved, so Enter keydown may result in click on the newly focused element
            const isEnterOnClosedPopupChild = webcomponentsBase.b$1(e) && !this.open;
            if (isTabOutAttempt || isEnterOnClosedPopupChild) {
                e.preventDefault();
            }
        }
        _onfocusout(e) {
            // relatedTarget is the element, which will get focus. If no such element exists, focus the root.
            // This happens after the mouse is released in order to not interrupt text selection.
            if (!e.relatedTarget) {
                this._shouldFocusRoot = true;
            }
        }
        _onmousedown(e) {
            if (this.shadowRoot.contains(e.target)) {
                this._shouldFocusRoot = true;
            }
            else {
                this._shouldFocusRoot = false;
            }
        }
        _onmouseup() {
            if (this._shouldFocusRoot) {
                if (Theme.g()) {
                    this._root.focus();
                }
                this._shouldFocusRoot = false;
            }
        }
        /**
         * Focus trapping
         * @private
         */
        async forwardToFirst() {
            const firstFocusable = await FocusableElements.b(this);
            if (firstFocusable) {
                firstFocusable.focus();
            }
            else {
                this._root.focus();
            }
        }
        /**
         * Focus trapping
         * @private
         */
        async forwardToLast() {
            const lastFocusable = await FocusableElements.H(this);
            if (lastFocusable) {
                lastFocusable.focus();
            }
            else {
                this._root.focus();
            }
        }
        /**
         * Use this method to focus the element denoted by "initialFocus", if provided,
         * or the first focusable element otherwise.
         * @protected
         */
        async applyInitialFocus() {
            if (!this.preventInitialFocus) {
                await this.applyFocus();
            }
        }
        /**
         * Focuses the element denoted by `initialFocus`, if provided,
         * or the first focusable element otherwise.
         * @public
         * @returns Promise that resolves when the focus is applied
         */
        async applyFocus() {
            // do nothing if the standard HTML autofocus is used
            if (this.querySelector("[autofocus]")) {
                return;
            }
            await this._waitForDomRef();
            if (this.getRootNode() === this) {
                return;
            }
            let element;
            if (this.initialFocus) {
                element = this.getRootNode().getElementById(this.initialFocus)
                    || document.getElementById(this.initialFocus);
            }
            element = element || await FocusableElements.b(this) || this._root; // in case of no focusable content focus the root
            if (element) {
                if (element === this._root) {
                    element.tabIndex = -1;
                }
                element.focus();
            }
        }
        isFocusWithin() {
            return a(this._root);
        }
        _updateMediaRange() {
            this.mediaRange = webcomponentsBase.i$2.getCurrentRange(webcomponentsBase.i$2.RANGESETS.RANGE_4STEPS, this.getDomRef().offsetWidth);
        }
        _updateAssociatedLabelsTexts() {
            this._associatedDescriptionRefTexts = AccessibilityTextsHelper.p(this);
        }
        /**
         * Adds the popup to the "opened popups registry"
         * @protected
         */
        _addOpenedPopup() {
            addOpenedPopup(this);
        }
        /**
         * Closes the popup.
         */
        closePopup(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
            if (!this._opened) {
                return;
            }
            const prevented = !this.fireDecoratorEvent("before-close", { escPressed });
            if (prevented) {
                this.open = true;
                return;
            }
            this._opened = false;
            if (this.isModal) {
                Popup_1.unblockPageScrolling(this);
            }
            this.hide();
            this.open = false;
            if (!preventRegistryUpdate) {
                this._removeOpenedPopup();
            }
            if (!this.preventFocusRestore && !preventFocusRestore) {
                this.resetFocus();
            }
            this.fireDecoratorEvent("close");
        }
        /**
         * Removes the popup from the "opened popups registry"
         * @protected
         */
        _removeOpenedPopup() {
            removeOpenedPopup(this);
        }
        /**
         * Returns the focus to the previously focused element
         * @protected
         */
        resetFocus() {
            this._focusedElementBeforeOpen?.focus();
            this._focusedElementBeforeOpen = null;
        }
        /**
         * Sets "block" display to the popup. The property can be overriden by derivatives of Popup.
         * @protected
         */
        _show() {
            if (this.isConnected) {
                this.setAttribute("popover", "manual");
                this.showPopover();
            }
        }
        _registerResizeHandler() {
            if (!this._resizeHandlerRegistered) {
                webcomponentsBase.f.register(this, this._resizeHandler);
                this._resizeHandlerRegistered = true;
            }
        }
        _deregisterResizeHandler() {
            if (this._resizeHandlerRegistered) {
                webcomponentsBase.f.deregister(this, this._resizeHandler);
                this._resizeHandlerRegistered = false;
            }
        }
        /**
         * Sets "none" display to the popup
         * @protected
         */
        hide() {
            this.isConnected && this.hidePopover();
        }
        /**
         * Ensures ariaLabel is never null or empty string
         * @protected
         */
        get _ariaLabel() {
            return AccessibilityTextsHelper.A(this);
        }
        get _accInfoAriaDescription() {
            return this.ariaDescriptionText || "";
        }
        get ariaDescriptionText() {
            return this._associatedDescriptionRefTexts || AccessibilityTextsHelper.L(this);
        }
        get ariaDescriptionTextId() {
            return this.ariaDescriptionText ? "accessibleDescription" : "";
        }
        get ariaDescribedByIds() {
            return [
                this.ariaDescriptionTextId,
            ].filter(Boolean).join(" ");
        }
        get _root() {
            return this.shadowRoot.querySelector(".ui5-popup-root");
        }
        get _role() {
            return (this.accessibleRole === PopupAccessibleRole$1.None) ? undefined : toLowercaseEnumValue.n(this.accessibleRole);
        }
        get _ariaModal() {
            return this.accessibleRole === PopupAccessibleRole$1.None ? undefined : "true";
        }
        get contentDOM() {
            return this.shadowRoot.querySelector(".ui5-popup-content");
        }
        get styles() {
            return {
                root: {},
                content: {},
            };
        }
        get classes() {
            return {
                root: {
                    "ui5-popup-root": true,
                },
                content: {
                    "ui5-popup-content": true,
                },
            };
        }
    };
    __decorate$3([
        webcomponentsBase.s()
    ], Popup.prototype, "initialFocus", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], Popup.prototype, "preventFocusRestore", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Popup.prototype, "accessibleName", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Popup.prototype, "accessibleNameRef", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Popup.prototype, "accessibleRole", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Popup.prototype, "accessibleDescription", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Popup.prototype, "accessibleDescriptionRef", void 0);
    __decorate$3([
        webcomponentsBase.s({ noAttribute: true })
    ], Popup.prototype, "_associatedDescriptionRefTexts", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Popup.prototype, "mediaRange", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], Popup.prototype, "preventInitialFocus", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Popup.prototype, "isTopModalPopup", void 0);
    __decorate$3([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], Popup.prototype, "content", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], Popup.prototype, "onPhone", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], Popup.prototype, "onDesktop", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], Popup.prototype, "open", null);
    Popup = Popup_1 = __decorate$3([
        webcomponentsBase.m({
            renderer: parametersBundle_css.y,
            styles: [popupStlyes, popupBlockLayerStyles],
            template: PopupTemplate,
        })
        /**
         * Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening.
         * @public
         */
        ,
        eventStrict.l("before-open", {
            cancelable: true,
        })
        /**
         * Fired after the component is opened.
         * @public
         */
        ,
        eventStrict.l("open")
        /**
         * Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing.
         * @public
         * @param {boolean} escPressed Indicates that `ESC` key has triggered the event.
         */
        ,
        eventStrict.l("before-close", {
            cancelable: true,
        })
        /**
         * Fired after the component is closed.
         * @public
         */
        ,
        eventStrict.l("close")
        /**
         * Fired whenever the popup content area is scrolled
         * @private
         */
        ,
        eventStrict.l("scroll", {
            bubbles: true,
        })
    ], Popup);
    var Popup$1 = Popup;

    const name$1 = "resize-corner";
    const pathData$1 = "M384 160v32q0 12-10 22L182 406q-10 10-22 10h-32zM224 416l160-160v32q0 12-10 22l-96 96q-10 10-22 10h-32zm160-64v32q0 12-10 22t-22 10h-32z";
    const ltr$1 = false;
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

    const name = "resize-corner";
    const pathData = "M282 416q-11 0-18.5-7.5T256 390t7-18l109-109q7-7 18-7t18.5 7.5T416 282t-7 18L300 409q-7 7-18 7zm-160 0q-11 0-18.5-7.5T96 390t7-18l269-269q7-7 18-7t18.5 7.5T416 122t-7 18L140 409q-7 7-18 7z";
    const ltr = false;
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, collection, packageName });

    var resizeCorner = "resize-corner";

    function DialogTemplate() {
        return PopupTemplate.call(this, {
            beforeContent,
            afterContent,
        });
    }
    function beforeContent() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: !!this._displayHeader &&
                parametersBundle_css.jsx("header", { children: parametersBundle_css.jsxs("div", { class: "ui5-popup-header-root", id: "ui5-popup-header", role: "group", "aria-describedby": this.effectiveAriaDescribedBy, "aria-roledescription": this.ariaRoleDescriptionHeaderText, tabIndex: this._headerTabIndex, onKeyDown: this._onDragOrResizeKeyDown, onMouseDown: this._onDragMouseDown, part: "header", children: [this.hasValueState &&
                                parametersBundle_css.jsx(Icon.Icon, { class: "ui5-dialog-value-state-icon", name: this._dialogStateIcon }), this.header.length ?
                                parametersBundle_css.jsx("slot", { name: "header" })
                                :
                                    parametersBundle_css.jsx(Title.Title, { level: "H1", id: "ui5-popup-header-text", class: "ui5-popup-header-text", children: this.headerText }), this.resizable ?
                                this.draggable ?
                                    parametersBundle_css.jsx("span", { id: `${this._id}-descr`, "aria-hidden": "true", class: "ui5-hidden-text", children: this.ariaDescribedByHeaderTextDraggableAndResizable })
                                    :
                                        parametersBundle_css.jsx("span", { id: `${this._id}-descr`, "aria-hidden": "true", class: "ui5-hidden-text", children: this.ariaDescribedByHeaderTextResizable })
                                :
                                    this.draggable &&
                                        parametersBundle_css.jsx("span", { id: `${this._id}-descr`, "aria-hidden": "true", class: "ui5-hidden-text", children: this.ariaDescribedByHeaderTextDraggable })] }) }) }));
    }
    function afterContent() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [!!this.footer.length &&
                    parametersBundle_css.jsx("footer", { class: "ui5-popup-footer-root", part: "footer", children: parametersBundle_css.jsx("slot", { name: "footer" }) }), this._showResizeHandle &&
                    parametersBundle_css.jsx("div", { class: "ui5-popup-resize-handle", onMouseDown: this._onResizeMouseDown, children: parametersBundle_css.jsx(Icon.Icon, { name: resizeCorner }) })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var PopupsCommonCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{position:fixed;background:var(--sapGroup_ContentBackground);border-radius:var(--_ui5-v2-15-0_popup_border_radius);min-height:2rem;box-sizing:border-box}:host([open]){display:flex}.ui5-popup-root{background:inherit;border-radius:inherit;width:100%;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;flex:1 1 auto;outline:none}.ui5-popup-root .ui5-popup-header-root{box-shadow:var(--_ui5-v2-15-0_popup_header_shadow);border-bottom:var(--_ui5-v2-15-0_popup_header_border)}.ui5-popup-content{color:var(--sapTextColor);flex:auto}.ui5-popup-content:focus{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:calc(-1 * var(--sapContent_FocusWidth));border-radius:var(--_ui5-v2-15-0_popup_border_radius)}.ui5-popup-footer-root{background:var(--sapPageFooter_Background);border-top:1px solid var(--sapPageFooter_BorderColor);color:var(--sapPageFooter_TextColor)}.ui5-popup-header-root,.ui5-popup-footer-root,:host([header-text]) .ui5-popup-header-text{margin:0;display:flex;justify-content:center;align-items:center}.ui5-popup-header-root .ui5-popup-header-text{font-weight:var(--sapFontHeaderFamily);font-size:var(--sapFontHeader5Size);color:var(--sapPageHeader_TextColor)}.ui5-popup-content{overflow:auto;box-sizing:border-box}:host([header-text]) .ui5-popup-header-text{min-height:var(--_ui5-v2-15-0_popup_default_header_height);max-height:var(--_ui5-v2-15-0_popup_default_header_height);line-height:var(--_ui5-v2-15-0_popup_default_header_height);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;max-width:100%;display:inline-flex;justify-content:var(--_ui5-v2-15-0_popup_header_prop_header_text_alignment)}:host([header-text]) .ui5-popup-header-root{justify-content:var(--_ui5-v2-15-0_popup_header_prop_header_text_alignment)}:host(:not([header-text])) .ui5-popup-header-text{display:none}:host([media-range="S"]) .ui5-popup-content{padding:1rem var(--_ui5-v2-15-0_popup_content_padding_s)}:host([media-range="M"]) .ui5-popup-content,:host([media-range="L"]) .ui5-popup-content{padding:1rem var(--_ui5-v2-15-0_popup_content_padding_m_l)}:host([media-range="XL"]) .ui5-popup-content{padding:1rem var(--_ui5-v2-15-0_popup_content_padding_xl)}.ui5-popup-header-root{background:var(--sapPageHeader_Background)}:host([media-range="S"]) .ui5-popup-header-root,:host([media-range="S"]) .ui5-popup-footer-root{padding-left:var(--_ui5-v2-15-0_popup_header_footer_padding_s);padding-right:var(--_ui5-v2-15-0_popup_header_footer_padding_s)}:host([media-range="M"]) .ui5-popup-header-root,:host([media-range="L"]) .ui5-popup-header-root,:host([media-range="M"]) .ui5-popup-footer-root,:host([media-range="L"]) .ui5-popup-footer-root{padding-left:var(--_ui5-v2-15-0_popup_header_footer_padding_m_l);padding-right:var(--_ui5-v2-15-0_popup_header_footer_padding_m_l)}:host([media-range="XL"]) .ui5-popup-header-root,:host([media-range="XL"]) .ui5-popup-footer-root{padding-left:var(--_ui5-v2-15-0_popup_header_footer_padding_xl);padding-right:var(--_ui5-v2-15-0_popup_header_footer_padding_xl)}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var dialogCSS = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{min-width:20rem;min-height:6rem;max-height:94%;max-width:90%;flex-direction:column;box-shadow:var(--sapContent_Shadow3);border-radius:var(--sapElement_BorderCornerRadius)}:host([stretch]){width:90%;height:94%}:host([stretch][on-phone]){width:100%;height:100%;max-height:100%;max-width:100%;border-radius:0;min-width:0}:host([draggable]) .ui5-popup-header-root,:host([draggable]) ::slotted([slot="header"]){cursor:move}:host([draggable]) .ui5-popup-header-root *{cursor:auto}:host([draggable]) .ui5-popup-root{user-select:text}::slotted([slot="header"]){max-width:100%}.ui5-popup-root{display:flex;flex-direction:column;max-width:100vw}.ui5-popup-header-root{position:relative}.ui5-popup-header-root:before{content:"";position:absolute;inset-block-start:auto;inset-block-end:0;inset-inline-start:0;inset-inline-end:0;height:var(--_ui5-v2-15-0_dialog_header_state_line_height);background:var(--sapObjectHeader_BorderColor)}:host([state="Negative"]) .ui5-popup-header-root:before{background:var(--sapErrorBorderColor)}:host([state="Information"]) .ui5-popup-header-root:before{background:var(--sapInformationBorderColor)}:host([state="Positive"]) .ui5-popup-header-root:before{background:var(--sapSuccessBorderColor)}:host([state="Critical"]) .ui5-popup-header-root:before{background:var(--sapWarningBorderColor)}.ui5-dialog-value-state-icon{margin-inline-end:.5rem;flex-shrink:0}:host([state="Negative"]) .ui5-dialog-value-state-icon{color:var(--sapNegativeElementColor)}:host([state="Information"]) .ui5-dialog-value-state-icon{color:var(--sapInformativeElementColor)}:host([state="Positive"]) .ui5-dialog-value-state-icon{color:var(--sapPositiveElementColor)}:host([state="Critical"]) .ui5-dialog-value-state-icon{color:var(--sapCriticalElementColor)}.ui5-popup-header-root{outline:none}:host([desktop]) .ui5-popup-header-root:focus:after,.ui5-popup-header-root:focus-visible:after{content:"";position:absolute;left:var(--_ui5-v2-15-0_dialog_header_focus_left_offset);bottom:var(--_ui5-v2-15-0_dialog_header_focus_bottom_offset);right:var(--_ui5-v2-15-0_dialog_header_focus_right_offset);top:var(--_ui5-v2-15-0_dialog_header_focus_top_offset);border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--_ui5-v2-15-0_dialog_header_border_radius) var(--_ui5-v2-15-0_dialog_header_border_radius) 0 0;pointer-events:none}:host([stretch]) .ui5-popup-content{width:100%;height:100%}.ui5-popup-content{min-height:var(--_ui5-v2-15-0_dialog_content_min_height);flex:1 1 auto}.ui5-popup-resize-handle{position:absolute;bottom:-.5rem;inset-inline-end:-.5rem;cursor:var(--_ui5-v2-15-0_dialog_resize_cursor);width:1.5rem;height:1.5rem;border-radius:50%}.ui5-popup-resize-handle [ui5-icon]{color:var(--sapButton_Lite_TextColor)}::slotted([slot="footer"]){height:var(--_ui5-v2-15-0_dialog_footer_height)}::slotted([slot="footer"][ui5-bar][design="Footer"]){border-top:none}::slotted([slot="header"][ui5-bar]){box-shadow:none}::slotted([slot="footer"][ui5-toolbar]){border:0}:host::backdrop{background-color:var(--_ui5-v2-15-0_popup_block_layer_background);opacity:var(--_ui5-v2-15-0_popup_block_layer_opacity)}.ui5-block-layer{display:block}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Dialog_1;
    /**
     * Defines the step size at which this component would change by when being dragged or resized with the keyboard.
     */
    const STEP_SIZE = 16;
    /**
     * Defines the icons corresponding to the dialog's state.
     */
    const ICON_PER_STATE = {
        [ValueState.o.Negative]: "error",
        [ValueState.o.Critical]: "alert",
        [ValueState.o.Positive]: "sys-enter-2",
        [ValueState.o.Information]: "information",
    };
    /**
     * @class
     * ### Overview
     * The `ui5-dialog` component is used to temporarily display some information in a
     * size-limited window in front of the regular app screen.
     * It is used to prompt the user for an action or a confirmation.
     * The `ui5-dialog` interrupts the current app processing as it is the only focused UI element and
     * the main screen is dimmed/blocked.
     * The dialog combines concepts known from other technologies where the windows have
     * names such as dialog box, dialog window, pop-up, pop-up window, alert box, or message box.
     *
     * The `ui5-dialog` is modal, which means that a user action is required before it is possible to return to the parent window.
     * To open multiple dialogs, each dialog element should be separate in the markup. This will ensure the correct modal behavior. Avoid nesting dialogs within each other.
     * The content of the `ui5-dialog` is fully customizable.
     *
     * ### Structure
     * A `ui5-dialog` consists of a header, content, and a footer for action buttons.
     * The `ui5-dialog` is usually displayed at the center of the screen.
     * Its position can be changed by the user. To enable this, you need to set the property `draggable` accordingly.

     *
     * ### Responsive Behavior
     * The `stretch` property can be used to stretch the `ui5-dialog` to full screen. For better usability, it's recommended to stretch the dialog to full screen on phone devices.
     *
     * **Note:** When a `ui5-bar` is used in the header or in the footer, you should remove the default dialog's paddings.
     *
     * For more information see the sample "Bar in Header/Footer".

     * ### Keyboard Handling
     *
     * #### Basic Navigation
     * When the `ui5-dialog` has the `draggable` property set to `true` and the header is focused, the user can move the dialog
     * with the following keyboard shortcuts:
     *
     * - [Up] or [Down] arrow keys - Move the dialog up/down.
     * - [Left] or [Right] arrow keys - Move the dialog left/right.
     *
     * #### Resizing
     * When the `ui5-dialog` has the `resizable` property set to `true` and the header is focused, the user can change the size of the dialog
     * with the following keyboard shortcuts:
     *
     * - [Shift] + [Up] or [Down] - Decrease/Increase the height of the dialog.
     * - [Shift] + [Left] or [Right] - Decrease/Increase the width of the dialog.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Dialog";`
     *
     * @constructor
     * @extends Popup
     * @public
     * @csspart header - Used to style the header of the component
     * @csspart content - Used to style the content of the component
     * @csspart footer - Used to style the footer of the component
     */
    let Dialog = Dialog_1 = class Dialog extends Popup$1 {
        constructor() {
            super();
            /**
             * Determines if the dialog will be stretched to full screen on mobile. On desktop,
             * the dialog will be stretched to approximately 90% of the viewport.
             *
             * **Note:** For better usability of the component it is recommended to set this property to "true" when the dialog is opened on phone.
             * @default false
             * @public
             */
            this.stretch = false;
            /**
             * Determines whether the component is draggable.
             * If this property is set to true, the Dialog will be draggable by its header.
             *
             * **Note:** The component can be draggable only in desktop mode.
             *
             * **Note:** This property overrides the default HTML "draggable" attribute native behavior.
             * When "draggable" is set to true, the native browser "draggable"
             * behavior is prevented and only the Dialog custom logic ("draggable by its header") works.
             * @default false
             * @since 1.0.0-rc.9
             * @public
             */
            this.draggable = false;
            /**
             * Configures the component to be resizable.
             * If this property is set to true, the Dialog will have a resize handle in its bottom right corner in LTR languages.
             * In RTL languages, the resize handle will be placed in the bottom left corner.
             *
             * **Note:** The component can be resizable only in desktop mode.
             *
             * **Note:** Upon resizing, externally defined height and width styling will be ignored.
             * @default false
             * @since 1.0.0-rc.10
             * @public
             */
            this.resizable = false;
            /**
             * Defines the state of the `Dialog`.
             *
             * **Note:** If `"Negative"` and `"Critical"` states is set, it will change the
             * accessibility role to "alertdialog", if the accessibleRole property is set to `"Dialog"`.
             * @default "None"
             * @public
             * @since 1.0.0-rc.15
             */
            this.state = "None";
            this._draggedOrResized = false;
            this._revertSize = () => {
                Object.assign(this.style, {
                    top: "",
                    left: "",
                    width: "",
                    height: "",
                });
            };
            this._screenResizeHandler = this._screenResize.bind(this);
            this._dragMouseMoveHandler = this._onDragMouseMove.bind(this);
            this._dragMouseUpHandler = this._onDragMouseUp.bind(this);
            this._resizeMouseMoveHandler = this._onResizeMouseMove.bind(this);
            this._resizeMouseUpHandler = this._onResizeMouseUp.bind(this);
            this._dragStartHandler = this._handleDragStart.bind(this);
        }
        static _isHeader(element) {
            return element.classList.contains("ui5-popup-header-root") || element.getAttribute("slot") === "header";
        }
        get isModal() {
            return true;
        }
        get _ariaLabelledBy() {
            let ariaLabelledById;
            if (this.headerText && !this._ariaLabel) {
                ariaLabelledById = "ui5-popup-header-text";
            }
            return ariaLabelledById;
        }
        get ariaRoleDescriptionHeaderText() {
            return (this.resizable || this.draggable) ? Dialog_1.i18nBundle.getText(i18nDefaults.DIALOG_HEADER_ARIA_ROLE_DESCRIPTION) : undefined;
        }
        get effectiveAriaDescribedBy() {
            return (this.resizable || this.draggable) ? `${this._id}-descr` : undefined;
        }
        get ariaDescribedByHeaderTextResizable() {
            return Dialog_1.i18nBundle.getText(i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_RESIZABLE);
        }
        get ariaDescribedByHeaderTextDraggable() {
            return Dialog_1.i18nBundle.getText(i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE);
        }
        get ariaDescribedByHeaderTextDraggableAndResizable() {
            return Dialog_1.i18nBundle.getText(i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE_RESIZABLE);
        }
        /**
         * Determines if the header should be shown.
         */
        get _displayHeader() {
            return this.header.length || this.headerText || this.draggable || this.resizable;
        }
        get _movable() {
            return !this.stretch && this.onDesktop && (this.draggable || this.resizable);
        }
        get _headerTabIndex() {
            return this._movable ? 0 : undefined;
        }
        get _showResizeHandle() {
            return this.resizable && this.onDesktop;
        }
        get _minHeight() {
            let minHeight = Number.parseInt(window.getComputedStyle(this.contentDOM).minHeight);
            const header = this._root.querySelector(".ui5-popup-header-root");
            if (header) {
                minHeight += header.offsetHeight;
            }
            const footer = this._root.querySelector(".ui5-popup-footer-root");
            if (footer) {
                minHeight += footer.offsetHeight;
            }
            return minHeight;
        }
        get hasValueState() {
            return this.state !== ValueState.o.None;
        }
        get _dialogStateIcon() {
            return ICON_PER_STATE[this.state];
        }
        get _role() {
            if (this.accessibleRole === PopupAccessibleRole$1.None) {
                return undefined;
            }
            if (this.state === ValueState.o.Negative || this.state === ValueState.o.Critical) {
                return toLowercaseEnumValue.n(PopupAccessibleRole$1.AlertDialog);
            }
            return toLowercaseEnumValue.n(this.accessibleRole);
        }
        _show() {
            super._show();
            this._center();
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            this._isRTL = this.effectiveDir === "rtl";
        }
        onEnterDOM() {
            super.onEnterDOM();
            this._attachScreenResizeHandler();
            this.addEventListener("dragstart", this._dragStartHandler);
        }
        onExitDOM() {
            super.onExitDOM();
            this._detachScreenResizeHandler();
            this.removeEventListener("dragstart", this._dragStartHandler);
        }
        /**
         * @override
         */
        _resize() {
            super._resize();
            if (!this._draggedOrResized) {
                this._center();
            }
        }
        _screenResize() {
            this._center();
        }
        _attachScreenResizeHandler() {
            if (!this._screenResizeHandlerAttached) {
                window.addEventListener("resize", this._screenResizeHandler);
                this._screenResizeHandlerAttached = true;
            }
        }
        _detachScreenResizeHandler() {
            if (this._screenResizeHandlerAttached) {
                window.removeEventListener("resize", this._screenResizeHandler);
                this._screenResizeHandlerAttached = false; // prevent dialog from repositioning during resizing
            }
        }
        _center() {
            const height = window.innerHeight - this.offsetHeight, width = window.innerWidth - this.offsetWidth;
            Object.assign(this.style, {
                top: `${Math.round(height / 2)}px`,
                left: `${Math.round(width / 2)}px`,
            });
        }
        /**
         * Event handlers
         */
        _onDragMouseDown(e) {
            // allow dragging only on the header
            if (!this._movable || !this.draggable || !Dialog_1._isHeader(e.target)) {
                return;
            }
            const { top, left, } = this.getBoundingClientRect();
            const { width, height, } = window.getComputedStyle(this);
            Object.assign(this.style, {
                top: `${top}px`,
                left: `${left}px`,
                width: `${Math.round(Number.parseFloat(width) * 100) / 100}px`,
                height: `${Math.round(Number.parseFloat(height) * 100) / 100}px`,
            });
            this._x = e.clientX;
            this._y = e.clientY;
            this._draggedOrResized = true;
            this._attachMouseDragHandlers();
        }
        _onDragMouseMove(e) {
            e.preventDefault();
            const { clientX, clientY } = e;
            const calcX = this._x - clientX;
            const calcY = this._y - clientY;
            const { left, top, } = this.getBoundingClientRect();
            Object.assign(this.style, {
                left: `${Math.floor(left - calcX)}px`,
                top: `${Math.floor(top - calcY)}px`,
            });
            this._x = clientX;
            this._y = clientY;
        }
        _onDragMouseUp() {
            delete this._x;
            delete this._y;
            this._detachMouseDragHandlers();
        }
        _onDragOrResizeKeyDown(e) {
            if (!this._movable || !Dialog_1._isHeader(e.target)) {
                return;
            }
            if (this.draggable && [webcomponentsBase.P, webcomponentsBase._, webcomponentsBase.D, webcomponentsBase.R].some(key => key(e))) {
                this._dragWithEvent(e);
                return;
            }
            if (this.resizable && [webcomponentsBase.O, webcomponentsBase.N, webcomponentsBase.h, webcomponentsBase.I].some(key => key(e))) {
                this._resizeWithEvent(e);
            }
        }
        _dragWithEvent(e) {
            const { top, left, width, height, } = this.getBoundingClientRect();
            let newPos = 0;
            let posDirection = "top";
            switch (true) {
                case webcomponentsBase.P(e):
                    newPos = top - STEP_SIZE;
                    posDirection = "top";
                    break;
                case webcomponentsBase._(e):
                    newPos = top + STEP_SIZE;
                    posDirection = "top";
                    break;
                case webcomponentsBase.D(e):
                    newPos = left - STEP_SIZE;
                    posDirection = "left";
                    break;
                case webcomponentsBase.R(e):
                    newPos = left + STEP_SIZE;
                    posDirection = "left";
                    break;
            }
            newPos = m$1(newPos, 0, posDirection === "left" ? window.innerWidth - width : window.innerHeight - height);
            this.style[posDirection] = `${newPos}px`;
        }
        _resizeWithEvent(e) {
            this._draggedOrResized = true;
            this.addEventListener("ui5-before-close", this._revertSize, { once: true });
            const { top, left } = this.getBoundingClientRect(), style = window.getComputedStyle(this), minWidth = Number.parseFloat(style.minWidth), maxWidth = window.innerWidth - left, maxHeight = window.innerHeight - top;
            let width = Number.parseFloat(style.width), height = Number.parseFloat(style.height);
            switch (true) {
                case webcomponentsBase.O(e):
                    height -= STEP_SIZE;
                    break;
                case webcomponentsBase.N(e):
                    height += STEP_SIZE;
                    break;
                case webcomponentsBase.h(e):
                    width -= STEP_SIZE;
                    break;
                case webcomponentsBase.I(e):
                    width += STEP_SIZE;
                    break;
            }
            width = m$1(width, minWidth, maxWidth);
            height = m$1(height, this._minHeight, maxHeight);
            Object.assign(this.style, {
                width: `${width}px`,
                height: `${height}px`,
            });
        }
        _attachMouseDragHandlers() {
            window.addEventListener("mousemove", this._dragMouseMoveHandler);
            window.addEventListener("mouseup", this._dragMouseUpHandler);
        }
        _detachMouseDragHandlers() {
            window.removeEventListener("mousemove", this._dragMouseMoveHandler);
            window.removeEventListener("mouseup", this._dragMouseUpHandler);
        }
        _onResizeMouseDown(e) {
            if (!this._movable || !this.resizable) {
                return;
            }
            e.preventDefault();
            const { top, left, } = this.getBoundingClientRect();
            const { width, height, minWidth, } = window.getComputedStyle(this);
            this._initialX = e.clientX;
            this._initialY = e.clientY;
            this._initialWidth = Number.parseFloat(width);
            this._initialHeight = Number.parseFloat(height);
            this._initialTop = top;
            this._initialLeft = left;
            this._minWidth = Number.parseFloat(minWidth);
            this._cachedMinHeight = this._minHeight;
            Object.assign(this.style, {
                top: `${top}px`,
                left: `${left}px`,
            });
            this._draggedOrResized = true;
            this._attachMouseResizeHandlers();
        }
        _onResizeMouseMove(e) {
            const { clientX, clientY } = e;
            let newWidth, newLeft;
            if (this._isRTL) {
                newWidth = m$1(this._initialWidth - (clientX - this._initialX), this._minWidth, this._initialLeft + this._initialWidth);
                // check if width is changed to avoid "left" jumping when max width is reached
                Object.assign(this.style, {
                    width: `${newWidth}px`,
                });
                const deltaWidth = newWidth - this.getBoundingClientRect().width;
                const rightEdge = this._initialLeft + this._initialWidth + deltaWidth;
                newLeft = m$1(rightEdge - newWidth, 0, rightEdge - this._minWidth);
            }
            else {
                newWidth = m$1(this._initialWidth + (clientX - this._initialX), this._minWidth, window.innerWidth - this._initialLeft);
            }
            const newHeight = m$1(this._initialHeight + (clientY - this._initialY), this._cachedMinHeight, window.innerHeight - this._initialTop);
            Object.assign(this.style, {
                height: `${newHeight}px`,
                width: `${newWidth}px`,
                left: this._isRTL ? `${newLeft}px` : undefined,
            });
        }
        _onResizeMouseUp() {
            delete this._initialX;
            delete this._initialY;
            delete this._initialWidth;
            delete this._initialHeight;
            delete this._initialTop;
            delete this._initialLeft;
            delete this._minWidth;
            delete this._cachedMinHeight;
            this._detachMouseResizeHandlers();
        }
        _handleDragStart(e) {
            if (this.draggable) {
                e.preventDefault();
            }
        }
        _attachMouseResizeHandlers() {
            window.addEventListener("mousemove", this._resizeMouseMoveHandler);
            window.addEventListener("mouseup", this._resizeMouseUpHandler);
            this.addEventListener("ui5-before-close", this._revertSize, { once: true });
        }
        _detachMouseResizeHandlers() {
            window.removeEventListener("mousemove", this._resizeMouseMoveHandler);
            window.removeEventListener("mouseup", this._resizeMouseUpHandler);
        }
    };
    __decorate$2([
        webcomponentsBase.s()
    ], Dialog.prototype, "headerText", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Dialog.prototype, "stretch", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Dialog.prototype, "draggable", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Dialog.prototype, "resizable", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Dialog.prototype, "state", void 0);
    __decorate$2([
        webcomponentsBase.d()
    ], Dialog.prototype, "header", void 0);
    __decorate$2([
        webcomponentsBase.d()
    ], Dialog.prototype, "footer", void 0);
    __decorate$2([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Dialog, "i18nBundle", void 0);
    Dialog = Dialog_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-dialog",
            template: DialogTemplate,
            styles: [
                Popup$1.styles,
                PopupsCommonCss,
                dialogCSS,
            ],
        })
    ], Dialog);
    Dialog.define();
    var Dialog$1 = Dialog;

    function ResponsivePopoverTemplate() {
        if (!this._isPhone) {
            return PopoverTemplate.call(this);
        }
        return (parametersBundle_css.jsxs(Dialog$1, { "root-element": true, accessibleName: this.accessibleName, accessibleNameRef: this.accessibleNameRef, accessibleDescription: this.accessibleDescription, accessibleDescriptionRef: this.accessibleDescriptionRef, accessibleRole: this.accessibleRole, stretch: true, preventInitialFocus: this.preventInitialFocus, preventFocusRestore: this.preventFocusRestore, initialFocus: this.initialFocus, onBeforeOpen: this._beforeDialogOpen, onOpen: this._afterDialogOpen, onBeforeClose: this._beforeDialogClose, onClose: this._afterDialogClose, exportparts: "content, header, footer", open: this.open, children: [!this._hideHeader && parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.header.length ?
                        parametersBundle_css.jsx("slot", { slot: "header", name: "header" })
                        :
                            parametersBundle_css.jsxs("div", { class: this.classes.header, slot: "header", children: [this.headerText &&
                                        parametersBundle_css.jsx(Title.Title, { level: "H1", wrappingType: "None", class: "ui5-popup-header-text ui5-responsive-popover-header-text", children: this.headerText }), !this._hideCloseButton &&
                                        parametersBundle_css.jsx(Button.Button, { icon: information.decline, design: "Transparent", accessibleName: this._closeDialogAriaLabel, onClick: this._dialogCloseButtonClick })] }) }), parametersBundle_css.jsx("slot", {}), parametersBundle_css.jsx("slot", { slot: "footer", name: "footer" })] }));
    }

    /**
     * Popover placements.
     * @public
     */
    var PopoverPlacement;
    (function (PopoverPlacement) {
        /**
         * Popover will be placed at the start of the reference element.
         * @public
         */
        PopoverPlacement["Start"] = "Start";
        /**
         * Popover will be placed at the end of the reference element.
         * @public
         */
        PopoverPlacement["End"] = "End";
        /**
         * Popover will be placed at the top of the reference element.
         * @public
         */
        PopoverPlacement["Top"] = "Top";
        /**
         * Popover will be placed at the bottom of the reference element.
         * @public
         */
        PopoverPlacement["Bottom"] = "Bottom";
    })(PopoverPlacement || (PopoverPlacement = {}));
    var PopoverPlacement$1 = PopoverPlacement;

    /**
     * Popover vertical align types.
     * @public
     */
    var PopoverVerticalAlign;
    (function (PopoverVerticalAlign) {
        /**
         * @public
         */
        PopoverVerticalAlign["Center"] = "Center";
        /**
         * Popover will be placed at the top of the reference control.
         * @public
         */
        PopoverVerticalAlign["Top"] = "Top";
        /**
         * Popover will be placed at the bottom of the reference control.
         * @public
         */
        PopoverVerticalAlign["Bottom"] = "Bottom";
        /**
         * Popover will be streched
         * @public
         */
        PopoverVerticalAlign["Stretch"] = "Stretch";
    })(PopoverVerticalAlign || (PopoverVerticalAlign = {}));
    var PopoverVerticalAlign$1 = PopoverVerticalAlign;

    /**
     * Popover horizontal align types.
     * @public
     */
    var PopoverHorizontalAlign;
    (function (PopoverHorizontalAlign) {
        /**
         * Popover is centered.
         * @public
         */
        PopoverHorizontalAlign["Center"] = "Center";
        /**
         * Popover is aligned with the start of the target.
         * @public
         */
        PopoverHorizontalAlign["Start"] = "Start";
        /**
         * Popover is aligned with the end of the target.
         * @public
         */
        PopoverHorizontalAlign["End"] = "End";
        /**
         * Popover is stretched.
         * @public
         */
        PopoverHorizontalAlign["Stretch"] = "Stretch";
    })(PopoverHorizontalAlign || (PopoverHorizontalAlign = {}));
    var PopoverHorizontalAlign$1 = PopoverHorizontalAlign;

    const e=t=>t.parentElement?t.parentElement:t.parentNode.host;

    let updateInterval;
    const intervalTimeout = 300;
    const openedRegistry = [];
    const repositionPopovers = () => {
        openedRegistry.forEach(popover => {
            popover.instance.reposition();
        });
    };
    const closePopoversIfLostFocus = () => {
        let activeElement = webcomponentsBase.t();
        if (activeElement.tagName === "IFRAME") {
            getRegistry().reverse().forEach(popup => {
                const popover = popup.instance;
                const opener = popover.getOpenerHTMLElement(popover.opener);
                while (activeElement) {
                    if (activeElement === opener) {
                        return;
                    }
                    activeElement = e(activeElement);
                }
                popover.closePopup(false, false, true);
            });
        }
    };
    const runUpdateInterval = () => {
        updateInterval = setInterval(() => {
            repositionPopovers();
            closePopoversIfLostFocus();
        }, intervalTimeout);
    };
    const stopUpdateInterval = () => {
        clearInterval(updateInterval);
    };
    const attachGlobalScrollHandler = () => {
        document.addEventListener("scroll", repositionPopovers, { capture: true });
    };
    const detachGlobalScrollHandler = () => {
        document.removeEventListener("scroll", repositionPopovers, { capture: true });
    };
    const attachScrollHandler = (popover) => {
        popover && popover.shadowRoot.addEventListener("scroll", repositionPopovers, { capture: true });
    };
    const detachScrollHandler = (popover) => {
        popover && popover.shadowRoot.removeEventListener("scroll", repositionPopovers, { capture: true });
    };
    const attachGlobalClickHandler = () => {
        document.addEventListener("mousedown", clickHandler, { capture: true });
    };
    const detachGlobalClickHandler = () => {
        document.removeEventListener("mousedown", clickHandler, { capture: true });
    };
    const clickHandler = (event) => {
        const openedPopups = getOpenedPopups();
        if (openedPopups.length === 0) {
            return;
        }
        const isTopPopupPopover = instanceOfPopover(openedPopups[openedPopups.length - 1].instance);
        if (!isTopPopupPopover) {
            return;
        }
        // loop all open popovers
        for (let i = (openedPopups.length - 1); i !== -1; i--) {
            const popup = openedPopups[i].instance;
            // if popup is modal, opener is clicked, popup is dialog skip closing
            if (popup.isModal || popup.isOpenerClicked(event)) {
                return;
            }
            if (f(event, popup.getBoundingClientRect())) {
                break;
            }
            popup.closePopup();
        }
    };
    const addOpenedPopover = (instance) => {
        const parentPopovers = getParentPopoversIfNested(instance);
        addOpenedPopup(instance, parentPopovers);
        openedRegistry.push({
            instance,
            parentPopovers,
        });
        attachScrollHandler(instance);
        if (openedRegistry.length === 1) {
            attachGlobalScrollHandler();
            attachGlobalClickHandler();
            runUpdateInterval();
        }
    };
    const removeOpenedPopover = (instance) => {
        const popoversToClose = [instance];
        for (let i = 0; i < openedRegistry.length; i++) {
            const indexOfCurrentInstance = openedRegistry[i].parentPopovers.indexOf(instance);
            if (openedRegistry[i].parentPopovers.length > 0 && indexOfCurrentInstance > -1) {
                popoversToClose.push(openedRegistry[i].instance);
            }
        }
        for (let i = popoversToClose.length - 1; i >= 0; i--) {
            for (let j = 0; j < openedRegistry.length; j++) {
                let indexOfItemToRemove = -1;
                if (popoversToClose[i] === openedRegistry[j].instance) {
                    indexOfItemToRemove = j;
                }
                if (indexOfItemToRemove >= 0) {
                    removeOpenedPopup(openedRegistry[indexOfItemToRemove].instance);
                    detachScrollHandler(openedRegistry[indexOfItemToRemove].instance);
                    const itemToClose = openedRegistry.splice(indexOfItemToRemove, 1);
                    itemToClose[0].instance.closePopup(false, true);
                }
            }
        }
        if (!openedRegistry.length) {
            detachGlobalScrollHandler();
            detachGlobalClickHandler();
            stopUpdateInterval();
        }
    };
    const getRegistry = () => {
        return openedRegistry;
    };
    const getParentPopoversIfNested = (instance) => {
        let currentElement = instance.parentNode;
        const parentPopovers = [];
        while (currentElement && currentElement.parentNode) {
            for (let i = 0; i < openedRegistry.length; i++) {
                if (currentElement === openedRegistry[i].instance) {
                    parentPopovers.push(currentElement);
                }
            }
            currentElement = currentElement.parentNode;
        }
        return parentPopovers;
    };

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var PopoverCss = `:host{box-shadow:var(--_ui5-v2-15-0_popover_box_shadow);background-color:var(--_ui5-v2-15-0_popover_background);max-width:calc(100vw - (100vw - 100%) - 2 * var(--_ui5-v2-15-0_popup_viewport_margin))}:host([hide-arrow]){box-shadow:var(--_ui5-v2-15-0_popover_no_arrow_box_shadow)}:host([actual-placement="Bottom"]) .ui5-popover-arrow{left:calc(50% - .5625rem);top:-.5rem;height:.5rem}:host([actual-placement="Bottom"]) .ui5-popover-arrow:after{margin:var(--_ui5-v2-15-0_popover_upward_arrow_margin)}:host([actual-placement="Start"]) .ui5-popover-arrow{top:calc(50% - .5625rem);right:-.5625rem;width:.5625rem}:host([actual-placement="Start"]) .ui5-popover-arrow:after{margin:var(--_ui5-v2-15-0_popover_right_arrow_margin)}:host([actual-placement="Top"]) .ui5-popover-arrow{left:calc(50% - .5625rem);height:.5625rem;top:100%}:host([actual-placement="Top"]) .ui5-popover-arrow:after{margin:var(--_ui5-v2-15-0_popover_downward_arrow_margin)}:host(:not([actual-placement])) .ui5-popover-arrow,:host([actual-placement="End"]) .ui5-popover-arrow{left:-.5625rem;top:calc(50% - .5625rem);width:.5625rem;height:1rem}:host(:not([actual-placement])) .ui5-popover-arrow:after,:host([actual-placement="End"]) .ui5-popover-arrow:after{margin:var(--_ui5-v2-15-0_popover_left_arrow_margin)}:host([hide-arrow]) .ui5-popover-arrow{display:none}.ui5-popover-root{min-width:6.25rem}.ui5-popover-arrow{pointer-events:none;display:block;width:1rem;height:1rem;position:absolute;overflow:hidden}.ui5-popover-arrow:after{content:"";display:block;width:.7rem;height:.7rem;background-color:var(--_ui5-v2-15-0_popover_background);box-shadow:var(--_ui5-v2-15-0_popover_box_shadow);transform:rotate(-45deg)}:host([modal])::backdrop{background-color:var(--_ui5-v2-15-0_popup_block_layer_background);opacity:var(--_ui5-v2-15-0_popup_block_layer_opacity)}:host([modal]) .ui5-block-layer{display:block}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Popover_1;
    const ARROW_SIZE = 8;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-popover` component displays additional information for an object
     * in a compact way and without leaving the page.
     * The Popover can contain various UI elements, such as fields, tables, images, and charts.
     * It can also include actions in the footer.
     *
     * ### Structure
     *
     * The popover has three main areas:
     *
     * - Header (optional)
     * - Content
     * - Footer (optional)
     *
     * **Note:** The `ui5-popover` is closed when the user clicks
     * or taps outside the popover
     * or selects an action within the popover. You can prevent this with the
     * `modal` property.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Popover.js";`
     *
     * @constructor
     * @extends Popup
     * @since 1.0.0-rc.6
     * @public
     * @csspart header - Used to style the header of the component
     * @csspart content - Used to style the content of the component
     * @csspart footer - Used to style the footer of the component
     */
    let Popover = Popover_1 = class Popover extends Popup$1 {
        static get VIEWPORT_MARGIN() {
            return 10; // px
        }
        constructor() {
            super();
            /**
             * Determines on which side the component is placed at.
             * @default "End"
             * @public
             */
            this.placement = "End";
            /**
             * Determines the horizontal alignment of the component.
             * @default "Center"
             * @public
             */
            this.horizontalAlign = "Center";
            /**
             * Determines the vertical alignment of the component.
             * @default "Center"
             * @public
             */
            this.verticalAlign = "Center";
            /**
             * Defines whether the component should close when
             * clicking/tapping outside of the popover.
             * If enabled, it blocks any interaction with the background.
             * @default false
             * @public
             */
            this.modal = false;
            /**
             * Determines whether the component arrow is hidden.
             * @default false
             * @public
             * @since 1.0.0-rc.15
             */
            this.hideArrow = false;
            /**
             * Determines if there is no enough space, the component can be placed
             * over the target.
             * @default false
             * @public
             */
            this.allowTargetOverlap = false;
            /**
             * Sets the X translation of the arrow
             * @private
             */
            this.arrowTranslateX = 0;
            /**
             * Sets the Y translation of the arrow
             * @private
             */
            this.arrowTranslateY = 0;
            /**
             * Returns the calculated placement depending on the free space
             * @private
             */
            this.actualPlacement = "End";
        }
        /**
         * Defines the ID or DOM Reference of the element at which the popover is shown.
         * When using this attribute in a declarative way, you must only use the `id` (as a string) of the element at which you want to show the popover.
         * You can only set the `opener` attribute to a DOM Reference when using JavaScript.
         * @public
         * @default undefined
         * @since 1.2.0
         */
        set opener(value) {
            if (this._opener === value) {
                return;
            }
            this._opener = value;
            if (value && this.open) {
                this.openPopup();
            }
        }
        get opener() {
            return this._opener;
        }
        async openPopup() {
            if (this._opened) {
                return;
            }
            const opener = this.getOpenerHTMLElement(this.opener);
            if (!opener) {
                return;
            }
            if (!opener || this.isOpenerOutsideViewport(opener.getBoundingClientRect())) {
                await Theme.f$1();
                this.open = false;
                this.fireDecoratorEvent("close");
                return;
            }
            this._openerRect = opener.getBoundingClientRect();
            await super.openPopup();
        }
        isOpenerClicked(e) {
            const target = e.target;
            const opener = this.getOpenerHTMLElement(this.opener);
            if (!opener) {
                return false;
            }
            if (target === opener) {
                return true;
            }
            if (this._isUI5AbstractElement(target) && target.getFocusDomRef() === opener) {
                return true;
            }
            return e.composedPath().indexOf(opener) > -1;
        }
        /**
         * Override for the _addOpenedPopup hook, which would otherwise just call addOpenedPopup(this)
         * @private
         */
        _addOpenedPopup() {
            addOpenedPopover(this);
        }
        /**
         * Override for the _removeOpenedPopup hook, which would otherwise just call removeOpenedPopup(this)
         * @private
         */
        _removeOpenedPopup() {
            removeOpenedPopover(this);
        }
        getOpenerHTMLElement(opener) {
            if (opener === undefined || opener === null) {
                return opener;
            }
            if (opener instanceof HTMLElement) {
                return this._isUI5AbstractElement(opener) ? opener.getFocusDomRef() : opener;
            }
            let rootNode = this.getRootNode();
            if (rootNode === this) {
                rootNode = document;
            }
            let openerHTMLElement = rootNode.getElementById(opener);
            if (rootNode instanceof ShadowRoot && !openerHTMLElement) {
                openerHTMLElement = document.getElementById(opener);
            }
            if (openerHTMLElement) {
                return this._isUI5AbstractElement(openerHTMLElement) ? openerHTMLElement.getFocusDomRef() : openerHTMLElement;
            }
            return openerHTMLElement;
        }
        shouldCloseDueToOverflow(placement, openerRect) {
            const threshold = 32;
            const limits = {
                "Start": openerRect.right,
                "End": openerRect.left,
                "Top": openerRect.top,
                "Bottom": openerRect.bottom,
            };
            const opener = this.getOpenerHTMLElement(this.opener);
            const closedPopupParent = i(opener);
            let overflowsBottom = false;
            let overflowsTop = false;
            if (closedPopupParent instanceof Popover_1) {
                const contentRect = closedPopupParent.getBoundingClientRect();
                overflowsBottom = openerRect.top > (contentRect.top + contentRect.height);
                overflowsTop = (openerRect.top + openerRect.height) < contentRect.top;
            }
            return (limits[placement] < 0 || (limits[placement] + threshold > closedPopupParent.innerHeight)) || overflowsBottom || overflowsTop;
        }
        shouldCloseDueToNoOpener(openerRect) {
            return openerRect.top === 0
                && openerRect.bottom === 0
                && openerRect.left === 0
                && openerRect.right === 0;
        }
        isOpenerOutsideViewport(openerRect) {
            return openerRect.bottom < 0
                || openerRect.top > window.innerHeight
                || openerRect.right < 0
                || openerRect.left > window.innerWidth;
        }
        /**
         * @override
         */
        _resize() {
            super._resize();
            if (this.open) {
                this.reposition();
            }
        }
        reposition() {
            this._show();
        }
        async _show() {
            super._show();
            const opener = this.getOpenerHTMLElement(this.opener);
            if (!opener) {
                Object.assign(this.style, {
                    top: `0px`,
                    left: `0px`,
                });
                return;
            }
            if (opener && webcomponentsBase.v(opener) && !opener.getDomRef()) {
                return;
            }
            if (!this._opened) {
                this._showOutsideViewport();
            }
            const popoverSize = this.getPopoverSize();
            let placement;
            if (popoverSize.width === 0 || popoverSize.height === 0) {
                // size can not be determined properly at this point, popover will be shown with the next reposition
                return;
            }
            if (this.open) {
                // update opener rect if it was changed during the popover being opened
                this._openerRect = opener.getBoundingClientRect();
            }
            if (this._oldPlacement && this.shouldCloseDueToNoOpener(this._openerRect) && this.isFocusWithin()) {
                // reuse the old placement as the opener is not available,
                // but keep the popover open as the focus is within
                placement = this._oldPlacement;
            }
            else {
                placement = this.calcPlacement(this._openerRect, popoverSize);
            }
            if (this._preventRepositionAndClose || this.isOpenerOutsideViewport(this._openerRect)) {
                await this._waitForDomRef();
                return this.closePopup();
            }
            this._oldPlacement = placement;
            this.actualPlacement = placement.placement;
            let left = m$1(this._left, Popover_1.VIEWPORT_MARGIN, document.documentElement.clientWidth - popoverSize.width - Popover_1.VIEWPORT_MARGIN);
            if (this.actualPlacement === PopoverPlacement$1.End) {
                left = Math.max(left, this._left);
            }
            let top = m$1(this._top, Popover_1.VIEWPORT_MARGIN, document.documentElement.clientHeight - popoverSize.height - Popover_1.VIEWPORT_MARGIN);
            if (this.actualPlacement === PopoverPlacement$1.Bottom) {
                top = Math.max(top, this._top);
            }
            this.arrowTranslateX = placement.arrow.x;
            this.arrowTranslateY = placement.arrow.y;
            top = this._adjustForIOSKeyboard(top);
            Object.assign(this.style, {
                top: `${top}px`,
                left: `${left}px`,
            });
            if (this.horizontalAlign === PopoverHorizontalAlign$1.Stretch && this._width) {
                this.style.width = this._width;
            }
            if (this.verticalAlign === PopoverVerticalAlign$1.Stretch && this._height) {
                this.style.height = this._height;
            }
        }
        /**
         * Adjust the desired top position to compensate for shift of the screen
         * caused by opened keyboard on iOS which affects all elements with position:fixed.
         * @private
         * @param top The target top in px.
         * @returns The adjusted top in px.
         */
        _adjustForIOSKeyboard(top) {
            if (!Theme.w()) {
                return top;
            }
            const actualTop = Math.ceil(this.getBoundingClientRect().top);
            return top + (Number.parseInt(this.style.top || "0") - actualTop);
        }
        getPopoverSize(calcScrollHeight = false) {
            const rect = this.getBoundingClientRect();
            const width = rect.width;
            let height;
            const domRef = this.getDomRef();
            if (calcScrollHeight && domRef) {
                const header = domRef.querySelector(".ui5-popup-header-root");
                const content = domRef.querySelector(".ui5-popup-content");
                const footer = domRef.querySelector(".ui5-popup-footer-root");
                height = content?.scrollHeight || 0;
                height += header?.scrollHeight || 0;
                height += footer?.scrollHeight || 0;
            }
            else {
                height = rect.height;
            }
            return { width, height };
        }
        _showOutsideViewport() {
            Object.assign(this.style, {
                top: "-10000px",
                left: "-10000px",
            });
        }
        _isUI5AbstractElement(el) {
            return webcomponentsBase.v(el) && el.isUI5AbstractElement;
        }
        get arrowDOM() {
            return this.shadowRoot.querySelector(".ui5-popover-arrow");
        }
        /**
         * @protected
         */
        focusOpener() {
            this.getOpenerHTMLElement(this.opener)?.focus();
        }
        /**
         * @private
         */
        calcPlacement(targetRect, popoverSize) {
            let left = Popover_1.VIEWPORT_MARGIN;
            let top = 0;
            const allowTargetOverlap = this.allowTargetOverlap;
            const clientWidth = document.documentElement.clientWidth;
            const clientHeight = document.documentElement.clientHeight;
            let maxHeight = clientHeight;
            let maxWidth = clientWidth;
            const placement = this.getActualPlacement(targetRect);
            this._preventRepositionAndClose = this.shouldCloseDueToNoOpener(targetRect) || this.shouldCloseDueToOverflow(placement, targetRect);
            const isVertical = placement === PopoverPlacement$1.Top
                || placement === PopoverPlacement$1.Bottom;
            if (this.horizontalAlign === PopoverHorizontalAlign$1.Stretch && isVertical) {
                popoverSize.width = targetRect.width;
                this._width = `${targetRect.width}px`;
            }
            else if (this.verticalAlign === PopoverVerticalAlign$1.Stretch && !isVertical) {
                popoverSize.height = targetRect.height;
                this._height = `${targetRect.height}px`;
            }
            const arrowOffset = this.hideArrow ? 0 : ARROW_SIZE;
            // calc popover positions
            switch (placement) {
                case PopoverPlacement$1.Top:
                    left = this.getVerticalLeft(targetRect, popoverSize);
                    top = Math.max(targetRect.top - popoverSize.height - arrowOffset, 0);
                    if (!allowTargetOverlap) {
                        maxHeight = targetRect.top - arrowOffset;
                    }
                    break;
                case PopoverPlacement$1.Bottom:
                    left = this.getVerticalLeft(targetRect, popoverSize);
                    top = targetRect.bottom + arrowOffset;
                    if (allowTargetOverlap) {
                        top = Math.max(Math.min(top, clientHeight - popoverSize.height), 0);
                    }
                    else {
                        maxHeight = clientHeight - targetRect.bottom - arrowOffset;
                    }
                    break;
                case PopoverPlacement$1.Start:
                    left = Math.max(targetRect.left - popoverSize.width - arrowOffset, 0);
                    top = this.getHorizontalTop(targetRect, popoverSize);
                    if (!allowTargetOverlap) {
                        maxWidth = targetRect.left - arrowOffset;
                    }
                    break;
                case PopoverPlacement$1.End:
                    left = targetRect.left + targetRect.width + arrowOffset;
                    top = this.getHorizontalTop(targetRect, popoverSize);
                    if (allowTargetOverlap) {
                        left = Math.max(Math.min(left, clientWidth - popoverSize.width), 0);
                    }
                    else {
                        maxWidth = clientWidth - targetRect.right - arrowOffset;
                    }
                    break;
            }
            // correct popover positions
            if (isVertical) {
                if (popoverSize.width > clientWidth || left < Popover_1.VIEWPORT_MARGIN) {
                    left = Popover_1.VIEWPORT_MARGIN;
                }
                else if (left + popoverSize.width > clientWidth - Popover_1.VIEWPORT_MARGIN) {
                    left = clientWidth - Popover_1.VIEWPORT_MARGIN - popoverSize.width;
                }
            }
            else {
                if (popoverSize.height > clientHeight || top < Popover_1.VIEWPORT_MARGIN) { // eslint-disable-line
                    top = Popover_1.VIEWPORT_MARGIN;
                }
                else if (top + popoverSize.height > clientHeight - Popover_1.VIEWPORT_MARGIN) {
                    top = clientHeight - Popover_1.VIEWPORT_MARGIN - popoverSize.height;
                }
            }
            this._maxHeight = Math.round(maxHeight - Popover_1.VIEWPORT_MARGIN);
            this._maxWidth = Math.round(maxWidth - Popover_1.VIEWPORT_MARGIN);
            if (this._left === undefined || Math.abs(this._left - left) > 1.5) {
                this._left = Math.round(left);
            }
            if (this._top === undefined || Math.abs(this._top - top) > 1.5) {
                this._top = Math.round(top);
            }
            const borderRadius = Number.parseInt(window.getComputedStyle(this).getPropertyValue("border-radius"));
            const arrowPos = this.getArrowPosition(targetRect, popoverSize, left, top, isVertical, borderRadius);
            this._left += this.getRTLCorrectionLeft();
            return {
                arrow: arrowPos,
                top: this._top,
                left: this._left,
                placement,
            };
        }
        getRTLCorrectionLeft() {
            return parseFloat(window.getComputedStyle(this).left) - this.getBoundingClientRect().left;
        }
        /**
         * Calculates the position for the arrow.
         * @private
         * @param targetRect BoundingClientRect of the target element
         * @param popoverSize Width and height of the popover
         * @param left Left offset of the popover
         * @param top Top offset of the popover
         * @param isVertical If the popover is positioned vertically to the target element
         * @param borderRadius Value of the border-radius property
         * @returns  Arrow's coordinates
         */
        getArrowPosition(targetRect, popoverSize, left, top, isVertical, borderRadius) {
            const horizontalAlign = this._actualHorizontalAlign;
            let arrowXCentered = horizontalAlign === PopoverHorizontalAlign$1.Center || horizontalAlign === PopoverHorizontalAlign$1.Stretch;
            if (horizontalAlign === PopoverHorizontalAlign$1.End && left <= targetRect.left) {
                arrowXCentered = true;
            }
            if (horizontalAlign === PopoverHorizontalAlign$1.Start && left + popoverSize.width >= targetRect.left + targetRect.width) {
                arrowXCentered = true;
            }
            let arrowTranslateX = 0;
            if (isVertical && arrowXCentered) {
                arrowTranslateX = targetRect.left + targetRect.width / 2 - left - popoverSize.width / 2;
            }
            let arrowTranslateY = 0;
            if (!isVertical) {
                arrowTranslateY = targetRect.top + targetRect.height / 2 - top - popoverSize.height / 2;
            }
            // Restricts the arrow's translate value along each dimension,
            // so that the arrow does not clip over the popover's rounded borders.
            const safeRangeForArrowY = popoverSize.height / 2 - borderRadius - ARROW_SIZE / 2 - 2;
            arrowTranslateY = m$1(arrowTranslateY, -safeRangeForArrowY, safeRangeForArrowY);
            const safeRangeForArrowX = popoverSize.width / 2 - borderRadius - ARROW_SIZE / 2 - 2;
            arrowTranslateX = m$1(arrowTranslateX, -safeRangeForArrowX, safeRangeForArrowX);
            return {
                x: Math.round(arrowTranslateX),
                y: Math.round(arrowTranslateY),
            };
        }
        /**
         * Fallbacks to new placement, prioritizing `Left` and `Right` placements.
         * @private
         */
        fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) {
            if (targetRect.left > popoverSize.width) {
                return PopoverPlacement$1.Start;
            }
            if (clientWidth - targetRect.right > targetRect.left) {
                return PopoverPlacement$1.End;
            }
            if (clientHeight - targetRect.bottom > popoverSize.height) {
                return PopoverPlacement$1.Bottom;
            }
            if (clientHeight - targetRect.bottom < targetRect.top) {
                return PopoverPlacement$1.Top;
            }
        }
        getActualPlacement(targetRect) {
            const placement = this.placement;
            let actualPlacement = placement;
            const isVertical = placement === PopoverPlacement$1.Top
                || placement === PopoverPlacement$1.Bottom;
            const popoverSize = this.getPopoverSize(!this.allowTargetOverlap);
            const clientWidth = document.documentElement.clientWidth;
            let clientHeight = document.documentElement.clientHeight;
            let popoverHeight = popoverSize.height;
            if (isVertical) {
                popoverHeight += this.hideArrow ? 0 : ARROW_SIZE;
                clientHeight -= Popover_1.VIEWPORT_MARGIN;
            }
            switch (placement) {
                case PopoverPlacement$1.Top:
                    if (targetRect.top < popoverHeight
                        && targetRect.top < clientHeight - targetRect.bottom) {
                        actualPlacement = PopoverPlacement$1.Bottom;
                    }
                    break;
                case PopoverPlacement$1.Bottom:
                    if (clientHeight - targetRect.bottom < popoverHeight
                        && clientHeight - targetRect.bottom < targetRect.top) {
                        actualPlacement = PopoverPlacement$1.Top;
                    }
                    break;
                case PopoverPlacement$1.Start:
                    if (targetRect.left < popoverSize.width) {
                        actualPlacement = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placement;
                    }
                    break;
                case PopoverPlacement$1.End:
                    if (clientWidth - targetRect.right < popoverSize.width) {
                        actualPlacement = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placement;
                    }
                    break;
            }
            return actualPlacement;
        }
        getVerticalLeft(targetRect, popoverSize) {
            const horizontalAlign = this._actualHorizontalAlign;
            let left = Popover_1.VIEWPORT_MARGIN;
            switch (horizontalAlign) {
                case PopoverHorizontalAlign$1.Center:
                case PopoverHorizontalAlign$1.Stretch:
                    left = targetRect.left - (popoverSize.width - targetRect.width) / 2;
                    break;
                case PopoverHorizontalAlign$1.Start:
                    left = targetRect.left;
                    break;
                case PopoverHorizontalAlign$1.End:
                    left = targetRect.right - popoverSize.width;
                    break;
            }
            return left;
        }
        getHorizontalTop(targetRect, popoverSize) {
            let top = 0;
            switch (this.verticalAlign) {
                case PopoverVerticalAlign$1.Center:
                case PopoverVerticalAlign$1.Stretch:
                    top = targetRect.top - (popoverSize.height - targetRect.height) / 2;
                    break;
                case PopoverVerticalAlign$1.Top:
                    top = targetRect.top;
                    break;
                case PopoverVerticalAlign$1.Bottom:
                    top = targetRect.bottom - popoverSize.height;
                    break;
            }
            return top;
        }
        get isModal() {
            return this.modal;
        }
        get _ariaLabelledBy() {
            if (!this._ariaLabel && this._displayHeader) {
                return "ui5-popup-header";
            }
            return undefined;
        }
        get styles() {
            return {
                ...super.styles,
                root: {
                    "max-height": this._maxHeight ? `${this._maxHeight}px` : "",
                    "max-width": this._maxWidth ? `${this._maxWidth}px` : "",
                },
                arrow: {
                    transform: `translate(${this.arrowTranslateX}px, ${this.arrowTranslateY}px)`,
                },
            };
        }
        get classes() {
            const allClasses = super.classes;
            allClasses.root["ui5-popover-root"] = true;
            return allClasses;
        }
        /**
         * Hook for descendants to hide header.
         */
        get _displayHeader() {
            return !!(this.header.length || this.headerText);
        }
        /**
         * Hook for descendants to hide footer.
         */
        get _displayFooter() {
            return true;
        }
        get _actualHorizontalAlign() {
            if (this.effectiveDir === "rtl") {
                if (this.horizontalAlign === PopoverHorizontalAlign$1.Start) {
                    return PopoverHorizontalAlign$1.End;
                }
                if (this.horizontalAlign === PopoverHorizontalAlign$1.End) {
                    return PopoverHorizontalAlign$1.Start;
                }
            }
            return this.horizontalAlign;
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], Popover.prototype, "headerText", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Popover.prototype, "placement", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Popover.prototype, "horizontalAlign", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Popover.prototype, "verticalAlign", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Popover.prototype, "modal", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Popover.prototype, "hideArrow", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Popover.prototype, "allowTargetOverlap", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], Popover.prototype, "arrowTranslateX", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], Popover.prototype, "arrowTranslateY", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Popover.prototype, "actualPlacement", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], Popover.prototype, "_maxHeight", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], Popover.prototype, "_maxWidth", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: HTMLElement })
    ], Popover.prototype, "header", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: HTMLElement })
    ], Popover.prototype, "footer", void 0);
    __decorate$1([
        webcomponentsBase.s({ converter: e$1 })
    ], Popover.prototype, "opener", null);
    Popover = Popover_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-popover",
            styles: [
                Popup$1.styles,
                PopupsCommonCss,
                PopoverCss,
            ],
            template: PopoverTemplate,
        })
    ], Popover);
    const instanceOfPopover = (object) => {
        return "opener" in object;
    };
    Popover.define();
    var Popover$1 = Popover;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var ResponsivePopoverCss = `:host{--_ui5-v2-15-0_input_width: 100%;min-width:6.25rem;min-height:2rem}:host([on-phone]){display:contents}.ui5-responsive-popover-header{height:var(--_ui5-v2-15-0-responsive_popover_header_height);display:flex;justify-content:var(--_ui5-v2-15-0_popup_header_prop_header_text_alignment);align-items:center;width:100%}.ui5-responsive-popover-header-text{width:calc(100% - var(--_ui5-v2-15-0_button_base_min_width))}.ui5-responsive-popover-header-no-title{justify-content:flex-end}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ResponsivePopover_1;
    /**
     * @class
     *
     * ### Overview
     * The `ui5-responsive-popover` acts as a Popover on desktop and tablet, while on phone it acts as a Dialog.
     * The component improves tremendously the user experience on mobile.
     *
     * ### Usage
     * Use it when you want to make sure that all the content is visible on any device.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/ResponsivePopover.js";`
     * @constructor
     * @extends Popover
     * @since 1.0.0-rc.6
     * @public
     * @csspart header - Used to style the header of the component
     * @csspart content - Used to style the content of the component
     * @csspart footer - Used to style the footer of the component
     */
    let ResponsivePopover = ResponsivePopover_1 = class ResponsivePopover extends Popover$1 {
        constructor() {
            super();
            /**
             * Defines if only the content would be displayed (without header and footer) in the popover on Desktop.
             * By default both the header and footer would be displayed.
             * @private
             */
            this.contentOnlyOnDesktop = false;
            /**
             * Used internaly for controls which must not have header.
             * @private
             */
            this._hideHeader = false;
            /**
             * Defines whether a close button will be rendered in the header of the component
             * **Note:** If you are using the `header` slot, this property will have no effect
             * @private
             * @default false
             * @since 1.0.0-rc.16
             */
            this._hideCloseButton = false;
        }
        async openPopup() {
            if (!Theme.d()) {
                await super.openPopup();
            }
            else if (this._dialog) {
                this._dialog.open = true;
            }
        }
        async _show() {
            if (!Theme.d()) {
                return super._show();
            }
        }
        handleOpenOnEnterDOM() {
            if (this.open && !Theme.d()) {
                this.showPopover();
                this.openPopup();
            }
        }
        _dialogCloseButtonClick() {
            this.closePopup();
        }
        /**
         * Closes the popover/dialog.
         * @override
         */
        closePopup(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
            if (!Theme.d()) {
                super.closePopup(escPressed, preventRegistryUpdate, preventFocusRestore);
            }
            else {
                this._dialog?.closePopup(escPressed, preventRegistryUpdate, preventFocusRestore);
            }
        }
        toggle(opener) {
            if (this.open) {
                this.closePopup();
                return;
            }
            this.opener = opener;
            this.open = true;
        }
        get classes() {
            const allClasses = super.classes;
            allClasses.header = {
                "ui5-responsive-popover-header": true,
                "ui5-responsive-popover-header-no-title": !this.headerText,
            };
            return allClasses;
        }
        get _dialog() {
            return this.shadowRoot.querySelector("[ui5-dialog]");
        }
        get contentDOM() {
            return Theme.d() ? this._dialog.contentDOM : super.contentDOM;
        }
        get _isPhone() {
            return Theme.d();
        }
        get _displayHeader() {
            return (Theme.d() || !this.contentOnlyOnDesktop) && super._displayHeader;
        }
        get _displayFooter() {
            return Theme.d() || !this.contentOnlyOnDesktop;
        }
        get _closeDialogAriaLabel() {
            return ResponsivePopover_1.i18nBundle.getText(i18nDefaults.RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON);
        }
        _beforeDialogOpen() {
            this._opened = true;
            this.open = true;
            this.fireDecoratorEvent("before-open");
        }
        _afterDialogOpen() {
            this.fireDecoratorEvent("open");
        }
        _beforeDialogClose(e) {
            this.fireDecoratorEvent("before-close", e.detail);
        }
        _afterDialogClose() {
            this._opened = false;
            this.open = false;
            this.fireDecoratorEvent("close");
        }
        get isModal() {
            if (!Theme.d()) {
                return super.isModal;
            }
            return this._dialog.isModal;
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ResponsivePopover.prototype, "contentOnlyOnDesktop", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ResponsivePopover.prototype, "_hideHeader", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ResponsivePopover.prototype, "_hideCloseButton", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], ResponsivePopover, "i18nBundle", void 0);
    ResponsivePopover = ResponsivePopover_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-responsive-popover",
            styles: [Popover$1.styles, ResponsivePopoverCss],
            template: ResponsivePopoverTemplate,
        })
    ], ResponsivePopover);
    ResponsivePopover.define();
    var ResponsivePopover$1 = ResponsivePopover;

    exports.Popover = Popover$1;
    exports.PopoverHorizontalAlign = PopoverHorizontalAlign$1;
    exports.PopoverPlacement = PopoverPlacement$1;
    exports.ResponsivePopover = ResponsivePopover$1;
    exports.e = e$1;

}));
