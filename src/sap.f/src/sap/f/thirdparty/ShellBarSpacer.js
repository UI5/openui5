sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons'], (function (webcomponentsBase, Theme, Icons) { 'use strict';

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
     * The `ui5-shellbar-spacer` is an element, used for visual separation between the two content parts of the `ui5-shellbar`.
     * **Note:** The `ui5-shellbar-spacer` component is in an experimental state and is a subject to change.
     * @constructor
     * @extends UI5Element
     * @since 2.7.0
     * @abstract
     * @public
     */
    let ShellBarSpacer = class ShellBarSpacer extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            this.visible = false;
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ShellBarSpacer.prototype, "visible", void 0);
    ShellBarSpacer = __decorate([
        webcomponentsBase.m({
            tag: "ui5-shellbar-spacer",
        })
    ], ShellBarSpacer);
    ShellBarSpacer.define();
    var ShellBarSpacer_default = ShellBarSpacer;

    return ShellBarSpacer_default;

}));
