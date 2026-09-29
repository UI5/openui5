sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/Popover', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/Button2'], (function (exports, webcomponentsBase, ManagedStyles, parametersBundle_css$1, i18nDefaults, parametersBundle_css, decline, Popover, Title, Button) { 'use strict';

    function ResponsivePopoverTemplate() {
        if (!this._isPhone) {
            return Popover.PopoverTemplate.call(this);
        }
        return (parametersBundle_css.jsxs(Popover.Dialog, { "root-element": true, accessibleName: this.accessibleName, accessibleNameRef: this.accessibleNameRef, accessibleDescription: this.accessibleDescription, accessibleDescriptionRef: this.accessibleDescriptionRef, accessibleRole: this.accessibleRole, stretch: true, preventInitialFocus: this.preventInitialFocus, preventFocusRestore: this.preventFocusRestore, initialFocus: this.initialFocus, onBeforeOpen: this._beforeDialogOpen, onOpen: this._afterDialogOpen, onBeforeClose: this._beforeDialogClose, onClose: this._afterDialogClose, exportparts: "content, header, footer", open: this.open, children: [!this._hideHeader && parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.header.length ?
                        parametersBundle_css.jsx("slot", { slot: "header", name: "header" })
                        :
                            parametersBundle_css.jsxs("div", { class: this.classes.header, slot: "header", children: [this.headerText &&
                                        parametersBundle_css.jsx(Title.Title, { level: "H1", wrappingType: "None", class: "ui5-popup-header-text ui5-responsive-popover-header-text", children: this.headerText }), !this._hideCloseButton &&
                                        parametersBundle_css.jsx(Button.Button, { icon: decline.declineIcon, design: "Transparent", accessibleName: this._closeDialogAriaLabel, onClick: this._dialogCloseButtonClick })] }) }), parametersBundle_css.jsx("slot", {}), parametersBundle_css.jsx("slot", { slot: "footer", name: "footer" })] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var ResponsivePopoverCss = `:host{min-width:6.25rem;min-height:2rem}:host([on-phone]){display:contents}.ui5-responsive-popover-header{height:var(--_ui5-responsive_popover_header_height);display:flex;justify-content:var(--_ui5_popup_header_prop_header_text_alignment);align-items:center;width:100%}.ui5-responsive-popover-header-text{width:calc(100% - var(--_ui5_button_base_min_width))}.ui5-responsive-popover-header-no-title{justify-content:flex-end}
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
    let ResponsivePopover = ResponsivePopover_1 = class ResponsivePopover extends Popover.Popover {
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
            if (!ManagedStyles.d()) {
                await super.openPopup();
            }
            else if (this._dialog) {
                this._dialog.open = true;
            }
        }
        async _show() {
            if (!ManagedStyles.d()) {
                return super._show();
            }
        }
        handleOpenOnEnterDOM() {
            if (this.open && !ManagedStyles.d()) {
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
            if (!ManagedStyles.d()) {
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
            return ManagedStyles.d() ? this._dialog.contentDOM : super.contentDOM;
        }
        get _isPhone() {
            return ManagedStyles.d();
        }
        get _displayHeader() {
            return (ManagedStyles.d() || !this.contentOnlyOnDesktop) && super._displayHeader;
        }
        get _displayFooter() {
            return ManagedStyles.d() || !this.contentOnlyOnDesktop;
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
            if (!ManagedStyles.d()) {
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
            styles: [Popover.Popover.styles, ResponsivePopoverCss],
            template: ResponsivePopoverTemplate,
        })
    ], ResponsivePopover);
    ResponsivePopover.define();
    var ResponsivePopover$1 = ResponsivePopover;

    exports.ResponsivePopover = ResponsivePopover$1;

}));
