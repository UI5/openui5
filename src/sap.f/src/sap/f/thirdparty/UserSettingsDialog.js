sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/Popover', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/Input', 'sap/f/thirdparty/Text', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/List', 'sap/f/thirdparty/ListItemStandard', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/overflow', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/search2', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/information', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/encodeXML', 'sap/f/thirdparty/information2', 'sap/f/thirdparty/sys-enter-2', 'sap/f/thirdparty/ResponsivePopoverCommon.css', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/edit', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ListItemCustom'], (function (webcomponentsBase, eventStrict, parametersBundle_css$1, parametersBundle_css, ManagedStyles, InvisibleMessage, Popover, Title, Input, Text, Icon, List, ListItemStandard, Button, AccessibilityTextsHelper, overflow, i18nDefaults, search, parametersBundle_css$2, i18nDefaults$1, Icons, ValueState, toLowercaseEnumValue, FocusableElements, ListItemBase, information, decline, encodeXML, information$1, sysEnter2, ResponsivePopoverCommon_css, willShowContent, ListItemGroup, WrappingType, ListItemTemplate, edit, Label, ListItemCustom) { 'use strict';

    var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    let ToolbarItemBase =
    /**
     * @class
     * Represents an abstract base class for items used in the `ui5-toolbar`.
     *
     *
     * @cssState overflowed - When the item is displayed in the overflow popover.
     * Use this state to apply different styles when the item is overflowed.
     * Available since 2.20.0.
     * @constructor
     * @extends UI5Element
     * @abstract
     * @public
     * @since 1.17.0
     */
    class ToolbarItemBase extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
            * Property used to define the access of the item to the overflow Popover. If "NeverOverflow" option is set,
            * the item never goes in the Popover, if "AlwaysOverflow" - it never comes out of it.
            * @public
            * @default "Default"
            */
            this.overflowPriority = "Default";
            /**
             * Defines if the toolbar overflow popup should close upon interaction with the item.
             * It will close by default.
             * @default false
             * @public
             */
            this.preventOverflowClosing = false;
            this._isOverflowed = false;
            // One-shot guards for `overflowGroup` validation warnings — suppress repeat
            // warnings across re-renders, consistent with `ToolbarItem.checkForWrapper`.
            this._overflowGroupPriorityWarned = false;
            this._overflowGroupSpacerWarned = false;
            this._maxWidth = 0;
            this._isRendering = true;
        }
        _getNavigationTargets() {
            const ref = this.getFocusDomRef();
            return ref ? [ref] : [];
        }
        /**
         * Focus entry point when toolbar navigates into this item.
         * Override in complex items (e.g., Breadcrumbs) to handle direction-aware entry.
         * @private
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        focusForToolbarNavigation(isForward) {
            this.getFocusDomRef()?.focus();
        }
        getArrowNavState() {
            return undefined;
        }
        get isOverflowed() {
            return this._isOverflowed;
        }
        /**
         * Defines if the toolbar item is overflowed.
         * @default false
         * @protected
         * @since 2.11.0
         */
        set isOverflowed(value) {
            this._isOverflowed = value;
            if (value) {
                this._internals.states.add("overflowed");
            }
            else {
                this._internals.states.delete("overflowed");
            }
        }
        onAfterRendering() {
            this._isRendering = false;
            this.validateOverflowGroupConstraints();
        }
        /**
         * Emits one-time developer warnings for invalid `overflowGroup` configurations.
         * Called once per render from `onAfterRendering` so getters stay pure.
         * Each warning fires at most once per element lifetime via one-shot guards.
         */
        validateOverflowGroupConstraints() {
            if (!this.isSpacer
                && this.overflowGroup
                && (this.overflowPriority === "AlwaysOverflow" || this.overflowPriority === "NeverOverflow")) {
                if (!this._overflowGroupPriorityWarned) {
                    this._overflowGroupPriorityWarned = true;
                    // eslint-disable-next-line no-console
                    console.warn(`[ui5-toolbar] ${this.tagName.toLowerCase()} has both overflow-group="${this.overflowGroup}" and overflow-priority="${this.overflowPriority}". `
                        + `Items in a non-empty overflow-group must use overflow-priority="Default"; priority dropped to Default for layout.`, this);
                }
            }
            if (this.isSpacer && this.overflowGroup) {
                if (!this._overflowGroupSpacerWarned) {
                    this._overflowGroupSpacerWarned = true;
                    // eslint-disable-next-line no-console
                    console.warn(`[ui5-toolbar] ${this.tagName.toLowerCase()} has overflow-group="${this.overflowGroup}". `
                        + `Spacers cannot participate in an overflow-group; the group tag is ignored.`, this);
                }
            }
        }
        /**
        * Defines if the width of the item should be ignored in calculating the whole width of the toolbar
        * @protected
        */
        get ignoreSpace() {
            return false;
        }
        /**
         * Returns if the item is flexible. An item that is returning true for this property will make
         * the toolbar expand to fill the 100% width of its container.
         * @protected
         */
        get hasFlexibleWidth() {
            return false;
        }
        /**
         * Returns if the item is interactive.
         * This value is used to determinate if the toolbar should have its accessibility role and attributes set.
         * At least two interactive items are needed for the toolbar to have the role="toolbar" attribute set.
         * @protected
         */
        get isInteractive() {
            return true;
        }
        get isToolbarNavigatable() {
            return this.isInteractive && !this.hidden && !("disabled" in this && !!this.disabled);
        }
        get hasOverflow() {
            return false;
        }
        /**
         * Returns if the item is separator.
         * @protected
         */
        get isSeparator() {
            return false;
        }
        /**
         * Returns if the item is a spacer.
         * A spacer item is an item that takes space in the toolbar, but does not render any content.
         * @protected
         * @since 2.21.0
         */
        get isSpacer() {
            return false;
        }
        /**
         * Returns the `overflowPriority` actually used by the toolbar's distribution
         * algorithm. Items in a non-empty `overflowGroup` must have `Default` priority;
         * when a developer puts `AlwaysOverflow` or `NeverOverflow` on a
         * grouped non-spacer item, the priority is treated as `"Default"` for layout.
         * Spacers are exempt from this rule and keep their declared priority.
         *
         * @protected
         */
        get effectiveOverflowPriority() {
            const declared = this.overflowPriority;
            if (!this.isSpacer
                && this.overflowGroup
                && (declared === "AlwaysOverflow" || declared === "NeverOverflow")) {
                return "Default";
            }
            return declared;
        }
        /**
         * Returns the `overflowGroup` actually used by the toolbar's distribution
         * algorithm. Spacers cannot participate in grouping; a spacer
         * with a non-empty `overflowGroup` returns `""` so the spacer is treated
         * as ungrouped by the algorithm.
         *
         * @protected
         */
        get effectiveOverflowGroup() {
            if (this.isSpacer && this.overflowGroup) {
                return undefined;
            }
            return this.overflowGroup;
        }
        get stableDomRef() {
            return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
        }
        get classes() {
            return {
                root: {
                    "ui5-tb-popover-item": this.isOverflowed,
                    "ui5-tb-item": true,
                },
            };
        }
        get styles() {
            return {};
        }
    };
    __decorate$3([
        webcomponentsBase.s()
    ], ToolbarItemBase.prototype, "overflowPriority", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], ToolbarItemBase.prototype, "overflowGroup", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], ToolbarItemBase.prototype, "preventOverflowClosing", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], ToolbarItemBase.prototype, "isOverflowed", null);
    ToolbarItemBase = __decorate$3([
        eventStrict.l("close-overflow", {
            bubbles: true,
        })
        /**
         * @class
         * Represents an abstract base class for items used in the `ui5-toolbar`.
         *
         *
         * @cssState overflowed - When the item is displayed in the overflow popover.
         * Use this state to apply different styles when the item is overflowed.
         * Available since 2.20.0.
         * @constructor
         * @extends UI5Element
         * @abstract
         * @public
         * @since 1.17.0
         */
    ], ToolbarItemBase);
    var ToolbarItemBase$1 = ToolbarItemBase;

    function ToolbarButtonTemplate() {
        return (parametersBundle_css.jsx(Button.Button, { class: this.classes.root, id: this.id, style: {
                width: this.width || "100%",
            }, icon: this.icon, endIcon: this.endIcon, tooltip: this.tooltip, accessibleName: this.accessibleName, accessibleNameRef: this.accessibleNameRef, accessibleDescription: this.accessibleDescription, accessibleRole: this.accessibleRole, accessibilityAttributes: this.accessibilityAttributes, design: this.design, disabled: this.disabled, hidden: this.hidden, "data-ui5-external-action-item-id": this._id, "data-ui5-stable": this.stableDomRef, onClick: (...args) => this.onClick(...args), children: this.effectiveText }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var ToolbarButtonCss = `:host([disabled]:active){pointer-events:none}.ui5-tb-popover-item.ui5-tb-button::part(button){justify-content:start}.ui5-tb-popover-item.ui5-tb-button[icon-only]::part(button){padding:0 var(--_ui5_button_base_padding)}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * ### Overview
     * The `ui5-toolbar-button` represents an abstract action,
     * used in the `ui5-toolbar`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents/dist/ToolbarButton.js";`
     * @constructor
     * @abstract
     * @extends ToolbarItemBase
     * @public
     * @since 1.17.0
     */
    let ToolbarButton = class ToolbarButton extends ToolbarItemBase$1 {
        constructor() {
            super(...arguments);
            /**
            * Property used to define the access of the item to the overflow Popover. If "NeverOverflow" option is set,
            * the item never goes in the Popover, if "AlwaysOverflow" - it never comes out of it.
            * @public
            * @default "Default"
            */
            this.overflowPriority = "Default";
            /**
             * Defines if the toolbar overflow popup should close upon interaction with the item.
             * It will close by default.
             * @default false
             * @public
             */
            this.preventOverflowClosing = false;
            /**
             * Defines if the action is disabled.
             *
             * **Note:** a disabled action can't be pressed or focused, and it is not in the tab chain.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * Defines the action design.
             * @default "Default"
             * @public
             */
            this.design = "Default";
            /**
             * Defines the ARIA role of the component.
             *
             * **Note:** Use `ButtonAccessibleRole.Link` role only with a press handler that performs navigation.
             * In all other scenarios the default button semantics are recommended.
             * @default "Button"
             * @public
             * @since 2.27.0
             */
            this.accessibleRole = "Button";
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             *
             * The following fields are supported:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
             * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
             *
             * - **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.
             * Accepts a lowercase string value.
             *
             * @default {}
             * @public
             */
            this.accessibilityAttributes = {};
            /**
             * Defines whether the button text should only be displayed in the overflow popover.
             *
             * When set to `true`, the button appears as icon-only in the main toolbar,
             * but shows both icon and text when moved to the overflow popover.
             *
             * **Note:** This property only takes effect when the `text` property is also set.
             *
             * @default false
             * @public
             * @since 2.17.0
             */
            this.showOverflowText = false;
        }
        get styles() {
            return {
                width: this.width,
                display: this.hidden ? "none" : "inline-block",
            };
        }
        /**
         * Returns the effective text to display based on overflow state and showOverflowText property.
         *
         * When showOverflowText is true:
         * - Normal state: returns empty string (icon-only)
         * - Overflow state: returns text
         *
         * When showOverflowText is false:
         * - Returns text in both states (normal behavior)
         */
        get effectiveText() {
            if (this.showOverflowText) {
                return this.isOverflowed ? this.text : "";
            }
            return this.text;
        }
        onClick(e) {
            e.stopImmediatePropagation();
            const prevented = !this.fireDecoratorEvent("click", { targetRef: e.target });
            if (!prevented && !this.preventOverflowClosing) {
                this.fireDecoratorEvent("close-overflow");
            }
        }
        /**
         * @override
         */
        get classes() {
            return {
                root: {
                    ...super.classes.root,
                    "ui5-tb-button": true,
                },
            };
        }
    };
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "overflowPriority", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], ToolbarButton.prototype, "preventOverflowClosing", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], ToolbarButton.prototype, "disabled", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "design", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "icon", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "endIcon", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "tooltip", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "accessibleName", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "accessibleNameRef", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "accessibleDescription", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "accessibleRole", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Object })
    ], ToolbarButton.prototype, "accessibilityAttributes", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "text", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], ToolbarButton.prototype, "showOverflowText", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ToolbarButton.prototype, "width", void 0);
    ToolbarButton = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-toolbar-button",
            template: ToolbarButtonTemplate,
            renderer: parametersBundle_css.y,
            styles: [ToolbarButtonCss],
        })
        /**
         * Fired when the component is activated either with a
         * mouse/tap or by using the Enter or Space key.
         *
         * **Note:** The event will not be fired if the `disabled`
         * property is set to `true`.
         * @public
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
            cancelable: true,
        })
    ], ToolbarButton);
    ToolbarButton.define();
    var ToolbarButton$1 = ToolbarButton;

    function ToolbarTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsxs("div", { class: {
                        "ui5-tb-items": true,
                        "ui5-tb-items-full-width": this.hasFlexibleSpacers,
                    }, role: this.accInfo.root.role, "aria-label": this.accInfo.root.accessibleName, children: [this.standardItems.map(item => {
                            return (parametersBundle_css.jsx("div", { class: {
                                    "ui5-tb-item": !item.hasFlexibleWidth,
                                    "ui5-tb-self-overflow": item.hasOverflow,
                                }, id: item._individualSlot, style: item.isSpacer ? item.styles : undefined, children: parametersBundle_css.jsx("slot", { name: item._individualSlot }) }));
                        }), parametersBundle_css.jsx(Button.Button, { "aria-hidden": this.hideOverflowButton, icon: overflow.overflowIcon, design: "Transparent", onClick: this.toggleOverflow, class: {
                                "ui5-tb-item": true,
                                "ui5-tb-overflow-btn": true,
                                "ui5-tb-overflow-btn-hidden": this.hideOverflowButton,
                            }, tooltip: this.accInfo.overflowButton.tooltip, accessibleName: this.accInfo.overflowButton.accessibleName, accessibilityAttributes: this.accInfo.overflowButton.accessibilityAttributes })] }), parametersBundle_css.jsx(Popover.Popover, { class: "ui5-overflow-popover", placement: "Bottom", horizontalAlign: "End", onClose: this.onOverflowPopoverClosed, onOpen: this.onOverflowPopoverOpened, accessibleName: this.accInfo.popover.accessibleName, hideArrow: true, children: parametersBundle_css.jsx("div", { class: {
                            "ui5-overflow-list": true
                        }, children: this.overflowItems.map(item => {
                            return (parametersBundle_css.jsx("div", { class: {
                                    "ui5-tb-popover-item": true,
                                    "ui5-tb-separator ui5-tb-separator-in-overflow": item.isSeparator,
                                    "ui5-tb-popover-self-overflow": item.hasOverflow,
                                }, id: item._individualSlot, children: parametersBundle_css.jsx("slot", { name: item._individualSlot }) }));
                        }) }) })] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var ToolbarCss = `:host(:not([hidden])){width:100%;height:var(--_ui5-toolbar-height);display:flex;align-items:center;justify-content:flex-end;box-sizing:border-box;border-bottom:var(--sapGroup_TitleBorderWidth) solid var(--sapGroup_TitleBorderColor);padding:0 var(--_ui5-toolbar-padding-right) 0 var(--_ui5-toolbar-padding-left);background-color:var(--sapToolbar_Background)}:host([align-content="Start"]){justify-content:flex-start}.ui5-tb-items{width:100%;height:100%;display:inherit;align-items:inherit;justify-content:inherit}.ui5-tb-items-full-width{width:100%}.ui5-tb-item{flex-shrink:0;margin-inline-end:var(--_ui5-toolbar-item-margin-right);margin-inline-start:var(--_ui5-toolbar-item-margin-left)}.ui5-tb-self-overflow{min-width:2.5rem;flex-shrink:1;flex-grow:1}.ui5-tb-self-overflow-grow{position:absolute}.ui5-tb-overflow-btn,.ui5-tb-items:has(.ui5-tb-overflow-btn-hidden) .ui5-tb-item:nth-last-child(2){margin-inline-end:0;margin-inline-start:0}.ui5-tb-overflow-btn-hidden{visibility:hidden;position:absolute}:host([design="Transparent"]){background-color:transparent}
`;

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var ToolbarPopoverCss = `.ui5-overflow-popover::part(content){padding:var(--_ui5_toolbar_overflow_padding)}.ui5-overflow-list{display:flex;flex-direction:column;justify-content:center;align-items:flex-start}.ui5-tb-popover-item{width:100%}::slotted([slot^="default"])::part(button){width:100%;display:block}.ui5-tb-popover-item:not(:last-child){margin-bottom:.25rem}.ui5-tb-separator-in-overflow{display:none;height:.0625rem;background:var(--sapToolbar_SeparatorColor);box-sizing:border-box}.ui5-tb-separator-in-overflow[visible]{display:block}
`;

    /**
     * Defines the priority of the toolbar item to go inside overflow popover.
     * @public
     */
    var ToolbarItemOverflowBehavior;
    (function (ToolbarItemOverflowBehavior) {
        /**
         * The item is presented inside the toolbar and goes in the popover, when there is not enough space.
         * @public
         */
        ToolbarItemOverflowBehavior["Default"] = "Default";
        /**
         * When set, the item will never go to the overflow popover.
         * @public
         */
        ToolbarItemOverflowBehavior["NeverOverflow"] = "NeverOverflow";
        /**
         * When set, the item will be always part of the overflow part of ui5-toolbar.
         * @public
         */
        ToolbarItemOverflowBehavior["AlwaysOverflow"] = "AlwaysOverflow";
    })(ToolbarItemOverflowBehavior || (ToolbarItemOverflowBehavior = {}));
    var ToolbarItemOverflowBehavior$1 = ToolbarItemOverflowBehavior;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Toolbar_1;
    function calculateCSSREMValue(styleSet, propertyName) {
        return Number(styleSet.getPropertyValue(propertyName).replace("rem", "")) * parseInt(getComputedStyle(document.body).getPropertyValue("font-size"));
    }
    function parsePxValue(styleSet, propertyName) {
        return Number(styleSet.getPropertyValue(propertyName).replace("px", ""));
    }
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-toolbar` component is used to create a horizontal layout with items.
     * The items can be overflowing in a popover, when the space is not enough to show all of them.
     *
     * ### Grouped Overflow
     *
     * Items that share the same non-empty `overflowGroup` string are treated as one atomic
     * unit during overflow distribution: when any member must move into the overflow
     * popover, all members move together. The visible bar always preserves slot order;
     * the group becomes adjacent only inside the popover. See the `overflowGroup` property
     * on `ToolbarItemBase` for the full contract.
     *
     * ### Keyboard Handling
     * The `ui5-toolbar` provides advanced keyboard handling.
     *
     * - [Left]/[Right] - navigate among toolbar items
     * - [Home]/[End] - move to first/last toolbar item
     * - [Tab] / [Shift]+[Tab] - exit the toolbar
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents/dist/Toolbar.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @since 1.17.0
     */
    let Toolbar = Toolbar_1 = class Toolbar extends webcomponentsBase.b {
        static get styles() {
            return [
                ToolbarCss,
                ToolbarPopoverCss,
            ];
        }
        constructor() {
            super();
            /**
             * Indicated the direction in which the Toolbar items will be aligned.
             * @public
             * @default "End"
             */
            this.alignContent = "End";
            /**
             * Notifies the toolbar if it should show the items in a reverse way if Toolbar Popover needs to be placed on "Top" position.
             * @private
             */
            this.reverseOverflow = false;
            /**
             * Defines the toolbar design.
             * @public
             * @default "Solid"
             * @since 2.0.0
             */
            this.design = "Solid";
            this.popoverOpen = false;
            this.itemsToOverflow = [];
            this.itemsWidth = 0;
            this.minContentWidth = 0;
            // Snapshot of children's `overflowGroup` values, joined with "|". Tracks whether
            // the grouping decision has changed even when total content width has not.
            this._groupingKey = "";
            this.ITEMS_WIDTH_MAP = new Map();
            this._onResize = this.onResize.bind(this);
            this._onCloseOverflow = this.closeOverflow.bind(this);
            this._onFocusIn = this._onfocusin.bind(this);
            this._onKeyDown = this._onkeydown.bind(this);
        }
        /**
         * Read-only members
         */
        get overflowButtonSize() {
            return this.overflowButtonDOM?.getBoundingClientRect().width || 0;
        }
        get padding() {
            const toolbarComputedStyle = getComputedStyle(this.getDomRef());
            return calculateCSSREMValue(toolbarComputedStyle, "--_ui5-toolbar-padding-left")
                + calculateCSSREMValue(toolbarComputedStyle, "--_ui5-toolbar-padding-right");
        }
        get alwaysOverflowItems() {
            return this.items.filter(item => item.effectiveOverflowPriority === ToolbarItemOverflowBehavior$1.AlwaysOverflow);
        }
        get movableItems() {
            return this.items.filter(item => item.effectiveOverflowPriority !== ToolbarItemOverflowBehavior$1.AlwaysOverflow && item.effectiveOverflowPriority !== ToolbarItemOverflowBehavior$1.NeverOverflow);
        }
        get overflowItems() {
            // spacers are ignored
            const overflowItems = this.itemsToOverflow.filter(item => !item.ignoreSpace);
            return this.reverseOverflow ? overflowItems.reverse() : overflowItems;
        }
        get standardItems() {
            return this.items.filter(item => this.itemsToOverflow.indexOf(item) === -1);
        }
        get hideOverflowButton() {
            return this.itemsToOverflow.filter(item => !(item.ignoreSpace || item.isSeparator)).length === 0;
        }
        get interactiveItems() {
            return this.items.filter((item) => item.isInteractive);
        }
        /**
         * Accessibility
         */
        get hasAriaSemantics() {
            return this.interactiveItems.length > 1;
        }
        get accessibleRole() {
            return this.hasAriaSemantics ? "toolbar" : undefined;
        }
        get ariaLabelText() {
            return this.hasAriaSemantics ? AccessibilityTextsHelper.A(this) : undefined;
        }
        get accInfo() {
            return {
                root: {
                    role: this.accessibleRole,
                    accessibleName: this.ariaLabelText,
                },
                overflowButton: {
                    accessibleName: this.overflowButtonAccessibleName || Toolbar_1.i18nBundle.getText(i18nDefaults.TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL),
                    tooltip: Toolbar_1.i18nBundle.getText(i18nDefaults.TOOLBAR_OVERFLOW_BUTTON_ARIA_LABEL),
                    accessibilityAttributes: {
                        expanded: this.popoverOpen,
                        hasPopup: "menu",
                    },
                },
                popover: {
                    accessibleName: Toolbar_1.i18nBundle.getText(i18nDefaults.TOOLBAR_POPOVER_AVAILABLE_VALUES),
                },
            };
        }
        /**
         * Toolbar Overflow Popover
         */
        get overflowButtonDOM() {
            return this.shadowRoot.querySelector(".ui5-tb-overflow-btn");
        }
        get hasFlexibleSpacers() {
            return this.items.some((item) => item.hasFlexibleWidth);
        }
        /**
         * Lifecycle methods
         */
        onEnterDOM() {
            webcomponentsBase.f.register(this, this._onResize);
            this.attachListeners();
        }
        onExitDOM() {
            webcomponentsBase.f.deregister(this, this._onResize);
            this.detachListeners();
        }
        onInvalidation(changeInfo) {
            if (changeInfo.reason === "childchange") {
                const currentItemsWidth = this.items.reduce((total, item) => total + this.getItemWidth(item), 0);
                const currentGroupingKey = this.items.map(item => item.effectiveOverflowGroup).join("|");
                if (currentItemsWidth !== this.itemsWidth || currentGroupingKey !== this._groupingKey) {
                    this.onToolbarItemChange();
                }
            }
        }
        onBeforeRendering() {
            if (webcomponentsBase.t() === this.overflowButtonDOM?.getFocusDomRef() && this.hideOverflowButton) {
                const items = this.standardItems.filter(item => item.isToolbarNavigatable);
                const lastItem = items.at(-1);
                if (lastItem) {
                    this._lastFocusedItem = lastItem;
                    lastItem.focusForToolbarNavigation(false);
                }
            }
            this.prePopulateAlwaysOverflowItems();
        }
        async onAfterRendering() {
            await ManagedStyles.w();
            this.storeItemsWidth();
            this.processOverflowLayout();
            this.items.forEach(item => {
                this.addItemsAdditionalProperties(item);
            });
            this._reconcileLastFocusedItem();
        }
        /**
         * Drops the tracked re-entry item once it leaves the navigation chain
         * (moved to overflow or removed), so Tab re-entry and arrow/Home/End
         * navigation don't silently restart from the first item.
         */
        _reconcileLastFocusedItem() {
            if (this._lastFocusedItem instanceof ToolbarItemBase$1 && !this._getNavigationChain().includes(this._lastFocusedItem)) {
                this._lastFocusedItem = undefined;
            }
        }
        addItemsAdditionalProperties(item) {
            item.isOverflowed = this.overflowItems.indexOf(item) !== -1;
            const itemWrapper = this.shadowRoot.querySelector(`#${item._individualSlot}`);
            if (item.hasOverflow && !item.isOverflowed && itemWrapper) {
                // We need to set the max-width to the self-overflow element in order ot prevent it from taking all the available space,
                // since, unlike the other items, it is allowed to grow and shrink
                // We need to set the max-width to none and its position to absolute to allow the item to grow and measure its width,
                // then when set, the max-width will be cached and we will set its highest value to not cut it when the Toolbar shrinks it
                // on rendering and then we resize it manually.
                itemWrapper.style.maxWidth = `none`;
                itemWrapper?.classList.add("ui5-tb-self-overflow-grow");
                item._maxWidth = Math.max(this.getItemWidth(item), item._maxWidth);
                itemWrapper.style.maxWidth = `${item._maxWidth}px`;
                itemWrapper?.classList.remove("ui5-tb-self-overflow-grow");
            }
        }
        /**
         * Returns if the overflow popup is open.
         * @public
         */
        isOverflowOpen() {
            const overflowPopover = this.getOverflowPopover();
            return overflowPopover.open;
        }
        openOverflow() {
            const overflowPopover = this.getOverflowPopover();
            overflowPopover.opener = this.overflowButtonDOM;
            overflowPopover.open = true;
            this.reverseOverflow = overflowPopover.actualPlacement === "Top";
        }
        closeOverflow() {
            const overflowPopover = this.getOverflowPopover();
            overflowPopover.open = false;
        }
        toggleOverflow() {
            if (this.popoverOpen) {
                this.closeOverflow();
            }
            else {
                this.openOverflow();
            }
        }
        getOverflowPopover() {
            return this.shadowRoot.querySelector(".ui5-overflow-popover");
        }
        /**
         * Layout management
         */
        processOverflowLayout() {
            if (this.offsetWidth === 0) {
                return;
            }
            const containerWidth = this.offsetWidth - this.padding;
            const contentWidth = this.itemsWidth;
            let overflowSpace = contentWidth - containerWidth + this.overflowButtonSize;
            if (contentWidth <= containerWidth) {
                overflowSpace = 0;
            }
            // skip calculation if the width has not been changed or if the items width has not been changed
            if (this.width === containerWidth && this.contentWidth === contentWidth) {
                return;
            }
            this.distributeItems(overflowSpace);
            this.width = containerWidth;
            this.contentWidth = contentWidth;
        }
        storeItemsWidth() {
            let totalWidth = 0, minWidth = 0;
            this.items.forEach(item => {
                const itemWidth = this.getItemWidth(item);
                totalWidth += itemWidth;
                if (item.effectiveOverflowPriority === ToolbarItemOverflowBehavior$1.NeverOverflow) {
                    minWidth += itemWidth;
                }
                this.ITEMS_WIDTH_MAP.set(item._id, itemWidth);
            });
            if (minWidth !== this.minContentWidth) {
                const spaceAroundContent = this.offsetWidth - this.getDomRef().offsetWidth;
                this.fireDecoratorEvent("_min-content-width-change", {
                    minWidth: minWidth + spaceAroundContent + this.overflowButtonSize,
                });
            }
            this.itemsWidth = totalWidth;
            this.minContentWidth = minWidth;
            this._groupingKey = this.items.map(item => item.effectiveOverflowGroup).join("|");
        }
        distributeItems(overflowSpace = 0) {
            this.itemsToOverflow = [];
            // distribute items that always overflow
            this.distributeItemsThatAlwaysOverflow();
            // Bucket movable items (in slot order) into distribution units.
            // A unit is either a single ungrouped item, or a group of items
            // sharing the same non-empty `overflowGroup`. A unit is atomic:
            // when it is pushed into overflow, all its members move together.
            // The unit's representative slot position is its rightmost member's
            // index — that index is what orders the unit during distribution.
            const slotIndex = new Map();
            this.items.forEach((item, idx) => slotIndex.set(item, idx));
            const units = this.buildDistributionUnits(slotIndex);
            // Walk units from rightmost to leftmost, pushing each atomically.
            // A unit is pushed in full as soon as overflowSpace is still positive;
            // the post-push budget is allowed to go negative — over-shoot is accepted
            // by design because a group is indivisible.
            const overflowedItems = [];
            let nextNonOverflowedUnitIndex = units.length - 1;
            for (let i = units.length - 1; i >= 0; i--) {
                if (overflowSpace <= 0) {
                    nextNonOverflowedUnitIndex = i;
                    break;
                }
                const unit = units[i];
                overflowedItems.push(...unit.members);
                overflowSpace -= unit.width;
                nextNonOverflowedUnitIndex = i - 1;
            }
            // If the last bar item is a separator, force it (and any contiguous
            // trailing separators) into overflow even if there is enough space.
            // Only single-member separator units are considered — pushing a
            // group's entire content (non-separator content included) because its
            // rightmost member happens to be a separator would be wrong.
            while (nextNonOverflowedUnitIndex >= 0) {
                const unit = units[nextNonOverflowedUnitIndex];
                if (unit.members.length === 1 && unit.members[0].isSeparator) {
                    overflowedItems.push(...unit.members);
                    nextNonOverflowedUnitIndex--;
                }
                else {
                    break;
                }
            }
            // itemsToOverflow must be in slot order so popover rendering matches
            // the developer's source order (group members adjacent by construction).
            overflowedItems.sort((a, b) => (slotIndex.get(a) - slotIndex.get(b)));
            this.itemsToOverflow.push(...overflowedItems);
            this.setSeperatorsVisibilityInOverflow();
        }
        /**
         * Buckets `movableItems` (in slot order) into atomic distribution units.
         * Each unit either holds a single ungrouped item or all members of one
         * non-empty `overflowGroup`. A unit's order key is its rightmost member's
         * slot index. Returned units are sorted ascending by that key.
         */
        buildDistributionUnits(slotIndex) {
            const movable = this.movableItems;
            const groupUnits = new Map();
            const units = [];
            movable.forEach(item => {
                const itemWidth = this.getCachedItemWidth(item._id) || 0;
                const slotIdx = slotIndex.get(item);
                const groupKey = item.effectiveOverflowGroup;
                if (!groupKey) {
                    units.push({
                        members: [item],
                        width: itemWidth,
                        rightmostIndex: slotIdx,
                    });
                    return;
                }
                const existing = groupUnits.get(groupKey);
                if (existing) {
                    existing.members.push(item);
                    existing.width += itemWidth;
                    if (slotIdx > existing.rightmostIndex) {
                        existing.rightmostIndex = slotIdx;
                    }
                }
                else {
                    const unit = {
                        members: [item],
                        width: itemWidth,
                        rightmostIndex: slotIdx,
                    };
                    groupUnits.set(groupKey, unit);
                    units.push(unit);
                }
            });
            units.sort((a, b) => a.rightmostIndex - b.rightmostIndex);
            return units;
        }
        distributeItemsThatAlwaysOverflow() {
            this.alwaysOverflowItems.forEach((item) => {
                this.itemsToOverflow.push(item);
            });
        }
        setSeperatorsVisibilityInOverflow() {
            this.itemsToOverflow.forEach((item, idx, items) => {
                if (item.isSeparator) {
                    item.visible = this.shouldShowSeparatorInOverflow(idx, items);
                }
            });
        }
        shouldShowSeparatorInOverflow(separatorIdx, overflowItems) {
            let foundPrevNonSeparatorItem = false;
            let foundNextNonSeperatorItem = false;
            // search for non-separator item before and after the seperator
            overflowItems.forEach((item, idx) => {
                if (idx < separatorIdx && !item.isSeparator) {
                    foundPrevNonSeparatorItem = true;
                }
                if (idx > separatorIdx && !item.isSeparator) {
                    foundNextNonSeperatorItem = true;
                }
            });
            return foundPrevNonSeparatorItem && foundNextNonSeperatorItem;
        }
        /**
         * Adds AlwaysOverflow items to overflow to ensure they are never rendered outside overflow (and visual flash is prevented)
         */
        prePopulateAlwaysOverflowItems() {
            this.alwaysOverflowItems.forEach(item => {
                if (!this.itemsToOverflow.includes(item)) {
                    this.itemsToOverflow.push(item);
                }
            });
        }
        /**
         * Event Handlers
         */
        onOverflowPopoverClosed() {
            this.popoverOpen = false;
        }
        onOverflowPopoverOpened() {
            this.popoverOpen = true;
            const firstItem = this.overflowItems.find(item => item.isInteractive && !item.hidden);
            firstItem?.focusForToolbarNavigation(true);
        }
        onResize() {
            this.closeOverflow();
            this.storeItemsWidth();
            this.processOverflowLayout();
        }
        /**
         * Private members
         */
        attachListeners() {
            this.addEventListener("ui5-close-overflow", this._onCloseOverflow);
            this.addEventListener("focusin", this._onFocusIn);
            this.addEventListener("keydown", this._onKeyDown, true);
        }
        detachListeners() {
            this.removeEventListener("ui5-close-overflow", this._onCloseOverflow);
            this.removeEventListener("focusin", this._onFocusIn);
            this.removeEventListener("keydown", this._onKeyDown, true);
        }
        onToolbarItemChange() {
            // some items were updated reset the cache and trigger a re-render
            this.itemsToOverflow = [];
            this.contentWidth = 0; // re-render
        }
        getItemWidth(item) {
            // Spacer width - always 0 for flexible spacers, so that they shrink, otherwise - measure the width normally
            if (item.ignoreSpace || item.isSeparator) {
                return 0;
            }
            const id = item._id;
            // Measure rendered width for spacers with width, and for normal items
            const renderedItem = this.shadowRoot.querySelector(`#${item._individualSlot}`);
            let itemWidth = 0;
            if (renderedItem && !renderedItem.classList.contains("ui5-tb-popover-item") && renderedItem.offsetWidth && item._isRendering === false) {
                const ItemCSSStyleSet = getComputedStyle(renderedItem);
                itemWidth = renderedItem.offsetWidth + parsePxValue(ItemCSSStyleSet, "margin-inline-end")
                    + parsePxValue(ItemCSSStyleSet, "margin-inline-start");
            }
            else {
                itemWidth = this.getCachedItemWidth(id) || 0;
            }
            return Math.ceil(itemWidth);
        }
        getCachedItemWidth(id) {
            return this.ITEMS_WIDTH_MAP.get(id);
        }
        /**
         * Keyboard Navigation
         */
        _isFocusInsideOverflow(path) {
            const popover = this.getOverflowPopover();
            if (!popover) {
                return false;
            }
            // Check popover shadow DOM (e.g. focus trap sentinels)
            if (path.some(node => popover === node || popover.shadowRoot === node)) {
                return true;
            }
            // Check if the event originates from a slotted overflow item (light DOM, not contained by popover)
            const overflowItemSet = new Set(this.overflowItems);
            return path.some(node => overflowItemSet.has(node));
        }
        _onfocusin(e) {
            const path = e.composedPath();
            if (this.popoverOpen && this._isFocusInsideOverflow(path)) {
                return;
            }
            const currentTarget = this._findItemByPath(path)
                || this._findOverflowButtonByPath(path)
                || this._findCurrentTargetByActiveElement();
            if (currentTarget) {
                this._setCurrentItem(currentTarget);
            }
        }
        _onkeydown(e) {
            const path = e.composedPath();
            if (this.popoverOpen && this._isFocusInsideOverflow(path)) {
                return;
            }
            if (webcomponentsBase.x(e) || webcomponentsBase.V(e)) {
                const tabTarget = this._findItemByPath(path)
                    || this._findOverflowButtonByPath(path)
                    || this._findCurrentTargetByActiveElement()
                    || this._lastFocusedItem;
                if (tabTarget) {
                    this._setCurrentItem(tabTarget);
                }
                return;
            }
            const isForward = this.effectiveDir === "rtl" ? webcomponentsBase.D(e) : webcomponentsBase.R(e);
            const isBackward = this.effectiveDir === "rtl" ? webcomponentsBase.R(e) : webcomponentsBase.D(e);
            const isHomeKey = webcomponentsBase.M(e);
            const isEndKey = webcomponentsBase.n(e);
            if (!isForward && !isBackward && !isHomeKey && !isEndKey) {
                return;
            }
            const currentTarget = this._findItemByPath(path)
                || this._findOverflowButtonByPath(path)
                || this._findCurrentTargetByActiveElement()
                || this._lastFocusedItem;
            if (!currentTarget) {
                return;
            }
            // Items that manage their own internal navigation (Input caret, Breadcrumbs,
            // checkbox groups) report a boundary state; the toolbar only takes over the
            // key once the item is at the relevant end.
            const navState = currentTarget instanceof ToolbarItemBase$1 ? currentTarget.getArrowNavState() : undefined;
            if (navState && (isForward || isBackward)) {
                const atEnd = isForward ? navState.atRightEnd : navState.atLeftEnd;
                if (!atEnd) {
                    return;
                }
            }
            if (navState && (isHomeKey || isEndKey)) {
                return;
            }
            if (isHomeKey) {
                this._moveToFirst();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (isEndKey) {
                this._moveToLast();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (isForward || isBackward) {
                if (isForward) {
                    this._moveToNext();
                }
                else {
                    this._moveToPrev();
                }
                e.preventDefault();
                e.stopPropagation();
            }
        }
        _findItemByPath(path) {
            return path.find((el) => el instanceof ToolbarItemBase$1);
        }
        _findOverflowButtonByPath(path) {
            const overflowButton = this.overflowButtonDOM;
            if (!overflowButton) {
                return undefined;
            }
            const active = webcomponentsBase.t();
            return path.includes(overflowButton)
                || !!(active && this._isNodeInsideElement(active, overflowButton))
                ? overflowButton
                : undefined;
        }
        _isNodeInsideElement(node, element) {
            let current = node;
            while (current) {
                if (current === element) {
                    return true;
                }
                const root = current.getRootNode?.();
                if (root instanceof ShadowRoot) {
                    current = root.host;
                }
                else {
                    current = current.parentNode;
                }
            }
            return false;
        }
        _findCurrentTargetByActiveElement() {
            const active = webcomponentsBase.t();
            if (!active) {
                return undefined;
            }
            const overflowButton = this.overflowButtonDOM;
            if (overflowButton && this._isNodeInsideElement(active, overflowButton)) {
                return overflowButton;
            }
            // _getNavigationTargets() already includes the item's focus ref, so a single
            // membership check per item is enough - no need to test getFocusDomRef separately.
            return this._getNavigableItems().find(item => item._getNavigationTargets().some(target => this._isNodeInsideElement(active, target)));
        }
        _getNavigationChain() {
            const chain = [...this._getNavigableItems()];
            const overflowButton = this.overflowButtonDOM;
            if (!this.hideOverflowButton && overflowButton) {
                chain.push(overflowButton);
            }
            return chain;
        }
        _getNavigableItems() {
            return this.items.filter(item => item.isToolbarNavigatable && !item.isOverflowed);
        }
        _setCurrentItem(item) {
            this._lastFocusedItem = item;
        }
        _moveToNext() {
            this._moveToItem((current, items) => Math.min(current + 1, items.length - 1), true);
        }
        _moveToPrev() {
            this._moveToItem(current => Math.max(current - 1, 0), false);
        }
        _moveToFirst() {
            this._moveToItem(() => 0, true);
        }
        _moveToLast() {
            this._moveToItem((_, items) => items.length - 1, false);
        }
        _moveToItem(indexCalc, isForward) {
            const items = this._getNavigationChain();
            if (!items.length) {
                return;
            }
            const currentIndex = this._lastFocusedItem ? items.indexOf(this._lastFocusedItem) : -1;
            // No tracked item in the current chain: enter at the near end for the
            // pressed direction (first item for forward, last for backward) instead
            // of coercing to 0 and then stepping past it.
            if (currentIndex === -1) {
                const entryItem = items[isForward ? 0 : items.length - 1];
                this._setCurrentItem(entryItem);
                this._focusNavigationItem(entryItem, isForward);
                return;
            }
            const nextIndex = indexCalc(currentIndex, items);
            if (nextIndex === currentIndex) {
                return;
            }
            const nextItem = items[nextIndex];
            this._setCurrentItem(nextItem);
            this._focusNavigationItem(nextItem, isForward);
        }
        _focusNavigationItem(item, isForward) {
            if (item instanceof ToolbarItemBase$1) {
                item.focusForToolbarNavigation(isForward);
            }
            else {
                item.focus();
            }
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], Toolbar.prototype, "alignContent", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number })
    ], Toolbar.prototype, "width", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number })
    ], Toolbar.prototype, "contentWidth", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Toolbar.prototype, "reverseOverflow", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Toolbar.prototype, "accessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Toolbar.prototype, "accessibleNameRef", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Toolbar.prototype, "overflowButtonAccessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Toolbar.prototype, "design", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Toolbar.prototype, "popoverOpen", void 0);
    __decorate$1([
        webcomponentsBase.d({
            "default": true, type: HTMLElement, invalidateOnChildChange: true, individualSlots: true,
        })
    ], Toolbar.prototype, "items", void 0);
    __decorate$1([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Toolbar, "i18nBundle", void 0);
    Toolbar = Toolbar_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-toolbar",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: ToolbarTemplate,
        })
        /**
         * @private
        */
        ,
        eventStrict.l("_min-content-width-change", {
            bubbles: true,
        })
    ], Toolbar);
    Toolbar.define();
    var Toolbar$1 = Toolbar;

    function UserSettingsDialogTemplate() {
        return (parametersBundle_css.jsxs(Popover.Dialog, { class: "ui5-user-settings-dialog", open: this.open, stretch: true, accessibleName: this.accessibleNameText, "onui5-_collapse": this._handleCollapseClick, onOpen: this._handleDialogAfterOpen, onBeforeClose: this._handleDialogBeforeClose, onClose: this._handleDialogAfterClose, initialFocus: `setting-${this._selectedSetting?._id}`, children: [parametersBundle_css.jsxs("div", { class: "ui5-user-settings-root", children: [parametersBundle_css.jsxs("div", { class: "ui5-user-settings-side", "data-sap-ui-fastnavgroup": "true", "aria-roledescription": this.ariaRoleDescList, children: [parametersBundle_css.jsxs("div", { class: "ui5-user-settings-side-header", children: [this.headerText &&
                                            parametersBundle_css.jsx(Title.Title, { level: "H1", size: "H5", children: this.headerText }), this.showSearchField &&
                                            parametersBundle_css.jsx(Input.Input, { placeholder: "Search", type: "Search", class: "ui5-user-settings-side-search", onInput: this._handleInput, children: parametersBundle_css.jsx(Icon.Icon, { id: "searchFieldIcon", slot: "icon", name: search.search, showTooltip: true }) })] }), this._showNoSearchResult ?
                                    parametersBundle_css.jsx("div", { class: "ui5-user-settings-side-search", children: parametersBundle_css.jsx(Text.Text, { children: this.noSearchResultsText }) })
                                    :
                                        renderList.call(this, this._filteredItems, "ui5-user-settings-side-items"), this._filteredFixedItems.length > 0 && renderList.call(this, this._filteredFixedItems, "ui5-user-settings-side-fixedItems")] }), parametersBundle_css.jsx("div", { class: "ui5-user-settings-content", children: parametersBundle_css.jsx("slot", { name: this._selectedItemSlotName }) })] }), parametersBundle_css.jsx(Toolbar$1, { slot: "footer", design: "Transparent", "data-sap-ui-fastnavgroup": "true", children: this.saveMode ? (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx(ToolbarButton$1, { id: `${this._id}-save-btn`, design: "Emphasized", text: this.saveButtonText, onClick: this._handleSaveButtonClick }), parametersBundle_css.jsx(ToolbarButton$1, { id: `${this._id}-cancel-btn`, design: "Transparent", text: this.cancelButtonText, onClick: this._handleCancelButtonClick })] })) : (parametersBundle_css.jsx(ToolbarButton$1, { id: `${this._id}-close-btn`, design: "Transparent", text: this.closeButtonText, onClick: this._handleCloseButtonClick })) })] }));
    }
    function renderList(items = [], classes) {
        return parametersBundle_css.jsx(List.List, { onItemClick: this._handleItemClick, class: classes, separators: "None", "data-sap-ui-fastnavgroup": "false", children: items.map(item => (parametersBundle_css.jsx(ListItemStandard.ListItemStandard, { class: !item._icon && item._siblingsWithIcon ? "ui5-user-settings-item-no-icon" : "", id: `setting-${item._id}`, icon: !item._icon && item._siblingsWithIcon ? undefined : item._icon, tooltip: item._tooltip, ref: this.captureRef.bind(item), selected: item.selected, disabled: item.disabled, accessibleName: item.ariaLabelledByText, type: this._showSettingWithNavigation ? "Navigation" : "Active", children: item.text }))) });
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme, "host");
    var UserSettingsDialogCss = `.ui5-user-settings-dialog{max-width:calc(100% - 2px);max-height:calc(100% - 2px);width:100%;height:100%}.ui5-user-settings-dialog::part(content){padding:0}.ui5-user-settings-dialog::part(footer){padding:0}.ui5-user-settings-root{display:flex;height:100%}.ui5-user-settings-side{flex:1;box-sizing:border-box;display:flex;flex-direction:column;max-width:100%;overflow:hidden}.ui5-user-settings-side-header{display:flex;flex-direction:column;gap:.5rem;padding:1rem;border-bottom:.0625rem solid var(--sapList_BorderColor)}.ui5-user-settings-side-search{width:100%}.ui5-user-settings-side-items,.ui5-user-settings-side-fixedItems{border-top:0}.ui5-user-settings-side-fixedItems{border-top:.0625rem solid var(--sapList_BorderColor)}.ui5-user-settings-side-items{flex:1;min-height:0}.ui5-user-settings-side-text{align-self:center}.ui5-user-settings-side-fixedItems :last-child{border-bottom:none}.ui5-user-settings-content{display:none;flex:1;background-color:var(--sapGroup_ContentBackground);height:100%;overflow:hidden}.ui5-user-settings-dialog[on-phone]{border-radius:0}.ui5-user-settings-item-no-icon::part(title){padding-left:1.875rem}@media screen and (width >= 37.5rem) and (width < 64rem){.ui5-user-settings-dialog:not([on-phone]){max-width:min(40rem,80%);max-height:min(42.5rem,88%)}}@media screen and (width < 64rem){:host([_collapsed]) .ui5-user-settings-content{display:block}:host([_collapsed]) .ui5-user-settings-side{display:none}}@media screen and (width >= 64rem){.ui5-user-settings-dialog{width:60rem;max-height:min(42.5rem,88%)}.ui5-user-settings-side{max-width:20rem}:dir(ltr) .ui5-user-settings-side{border-right:.0625rem solid var(--sapList_BorderColor)}:dir(rtl) .ui5-user-settings-side{border-left:.0625rem solid var(--sapList_BorderColor)}.ui5-user-settings-content{display:block}}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var UserSettingsDialog_1;
    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-dialog` is an SAP Fiori-specific web component used in the `ui5-user-menu`.
     * It allows the user to easily view information and settings for an account.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsDialog.js";`
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.8.0
     */
    let UserSettingsDialog = UserSettingsDialog_1 = class UserSettingsDialog extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines, if the User Settings Dialog is opened.
             *
             * @default false
             * @public
             */
            this.open = false;
            /**
             * Defines if the Search Field would be displayed.
             *
             * **Note:** By default the Search Field is not displayed.
             * @default false
             * @public
             */
            this.showSearchField = false;
            /**
             * Defines whether the dialog offers Save and Cancel actions in its footer.
             *
             * When true, the footer renders a Save (Emphasized) and a Cancel button
             * instead of the default Close button. Save and Cancel each fire a
             * corresponding event; the application is responsible for closing the
             * dialog (typically after persisting or discarding the changes).
             *
             * @default false
             * @public
             */
            this.saveMode = false;
            /**
             * @private
             */
            this._searchValue = "";
            /**
             * @private
             */
            this._collapsed = false;
            /**
             * @private
             */
            this._filteredItems = [];
            /**
             * @private
             */
            this._filteredFixedItems = [];
            /**
             * @private
             */
            this._showNoSearchResult = false;
            /**
             * Indicates that the user changed the search value and the search
             * results should be announced on the next rendering.
             * @private
             */
            this._announceSearchResults = false;
        }
        onEnterDOM() {
            this.setAttribute("data-sap-ui-fastnavgroup-container", "true");
        }
        onBeforeRendering() {
            this._mediaRange = webcomponentsBase.i$1.getCurrentRange(webcomponentsBase.i$1.RANGESETS.RANGE_4STEPS);
            const searchValue = this._searchValue.toLowerCase();
            this._filteredItems = [];
            this._filteredFixedItems = [];
            const siblingsWithIcon = this.items.some(item => !!item.icon);
            this.items.forEach(item => {
                if (item.text.toLowerCase().includes(searchValue)) {
                    this._filteredItems.push(item);
                }
                if (item.selected) {
                    this._selectedSetting = item;
                }
                item._siblingsWithIcon = siblingsWithIcon;
                item._inMobileView = this._showSettingWithNavigation;
            });
            this.fixedItems.forEach(item => {
                if (item.text.toLowerCase().includes(searchValue)) {
                    this._filteredFixedItems.push(item);
                }
                if (item.selected) {
                    this._selectedSetting = item;
                }
                item._inMobileView = this._showSettingWithNavigation;
            });
            if (this._filteredItems.length === 0 && this._filteredFixedItems.length === 0) {
                this._showNoSearchResult = true;
            }
            else {
                this._showNoSearchResult = false;
            }
            if (this._announceSearchResults) {
                this._announceSearchResults = false;
                InvisibleMessage.v(this._searchResultsText);
            }
            if (!this._selectedSetting) {
                this._selectedSetting = this.items[0] || this.fixedItems[0];
            }
            const allItems = [...this.items, ...this.fixedItems];
            allItems.forEach(item => {
                if (item === this._selectedSetting) {
                    item.setAttribute("data-sap-ui-fastnavgroup", "true");
                }
                else {
                    item.removeAttribute("data-sap-ui-fastnavgroup");
                }
            });
        }
        async _handleItemClick(e) {
            const setting = e.detail.item;
            const settingItem = setting.associatedSettingItem;
            const eventPrevented = !this.fireDecoratorEvent("selection-change", {
                item: settingItem,
            });
            const shouldNavigate = this._showSettingWithNavigation;
            this._collapsed = true;
            if (!eventPrevented) {
                this.items.forEach(item => {
                    item.selected = false;
                });
                this.fixedItems.forEach(item => {
                    item.selected = false;
                });
                settingItem.selected = true;
            }
            // In navigation (single-column) mode the content replaces the list, so move the
            // focus to the first interactive element of the content instead of losing it.
            if (shouldNavigate) {
                await ManagedStyles.w();
                this._selectedSetting?.focusFirstContentElement();
            }
        }
        _handleDialogAfterOpen() {
            this.fireDecoratorEvent("open");
        }
        _handleDialogBeforeClose(e) {
            if (!e.detail.escPressed) {
                return;
            }
            const eventPrevented = !this.fireDecoratorEvent("before-close", e.detail);
            if (eventPrevented) {
                e.preventDefault();
            }
        }
        _handleDialogAfterClose() {
            this.open = false;
            this.fireDecoratorEvent("close");
        }
        get accessibleNameText() {
            return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_DIALOG_ACCESSIBLE_NAME);
        }
        get ariaRoleDescList() {
            return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_LIST_ARIA_ROLE_DESC);
        }
        get closeButtonText() {
            return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_DIALOG_CLOSE_BUTTON_TEXT);
        }
        get saveButtonText() {
            return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_DIALOG_SAVE_BUTTON_TEXT);
        }
        get cancelButtonText() {
            return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_DIALOG_CANCEL_BUTTON_TEXT);
        }
        get noSearchResultsText() {
            return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_DIALOG_NO_SEARCH_RESULTS_TEXT);
        }
        get _searchResultsText() {
            const resultsCount = this._filteredItems.length + this._filteredFixedItems.length;
            switch (resultsCount) {
                case 0:
                    return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_DIALOG_SEARCH_NO_RESULTS);
                case 1:
                    return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_DIALOG_SEARCH_ONE_RESULT);
                default:
                    return UserSettingsDialog_1.i18nBundle.getText(i18nDefaults$1.USER_SETTINGS_DIALOG_SEARCH_MORE_RESULTS, resultsCount);
            }
        }
        get _selectedItemSlotName() {
            return this._selectedSetting ? this._selectedSetting._individualSlot : "";
        }
        get _showSettingWithNavigation() {
            return (ManagedStyles.d() || (ManagedStyles.a$1() && !ManagedStyles.m$1())) || (this._mediaRange === "S" || this._mediaRange === "M");
        }
        _handleCloseButtonClick() {
            const eventPrevented = !this.fireDecoratorEvent("before-close", { escPressed: false });
            if (!eventPrevented) {
                this.open = false;
            }
        }
        _handleSaveButtonClick() {
            this.fireDecoratorEvent("save");
        }
        _handleCancelButtonClick() {
            this.fireDecoratorEvent("cancel");
        }
        async _handleCollapseClick() {
            this._collapsed = false;
            // The side list replaces the content, so return the focus to the
            // user settings item that was selected instead of losing it.
            await ManagedStyles.w();
            const selectedListItem = this._selectedSetting
                ? this.shadowRoot.querySelector(`#setting-${this._selectedSetting._id}`)
                : null;
            selectedListItem?.focus();
        }
        _handleInput(e) {
            this._searchValue = e.target.value;
            this._announceSearchResults = true;
        }
        captureRef(ref) {
            if (ref) {
                ref.associatedSettingItem = this;
            }
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsDialog.prototype, "open", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], UserSettingsDialog.prototype, "headerText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsDialog.prototype, "showSearchField", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsDialog.prototype, "saveMode", void 0);
    __decorate([
        webcomponentsBase.d({
            "default": true,
            type: HTMLElement,
            individualSlots: true,
            invalidateOnChildChange: {
                properties: true,
                slots: true,
            },
        })
    ], UserSettingsDialog.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            individualSlots: true,
            invalidateOnChildChange: {
                properties: true,
                slots: true,
            },
        })
    ], UserSettingsDialog.prototype, "fixedItems", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], UserSettingsDialog.prototype, "_searchValue", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsDialog.prototype, "_collapsed", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], UserSettingsDialog.prototype, "_selectedSetting", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsDialog.prototype, "_showNoSearchResult", void 0);
    __decorate([
        webcomponentsBase.s({ type: String })
    ], UserSettingsDialog.prototype, "_mediaRange", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents-fiori")
    ], UserSettingsDialog, "i18nBundle", void 0);
    UserSettingsDialog = UserSettingsDialog_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-dialog",
            renderer: parametersBundle_css.y,
            template: UserSettingsDialogTemplate,
            styles: [UserSettingsDialogCss],
        })
        /**
         * Fired when an item is selected.
         * @param {UserSettingsItem} item The selected `user settings item`.
         * @public
         */
        ,
        eventStrict.l("selection-change", {
            cancelable: true,
        })
        /**
         * Fired when the settings dialog is opened.
         * @public
         */
        ,
        eventStrict.l("open")
        /**
         * Fired before the settings dialog is closed.
         *
         * **Note:** This event is cancelable via `preventDefault()`, allowing the application to keep the
         * dialog open — for example, to prompt the user about unsaved changes before dismissal.
         * @public
         */
        ,
        eventStrict.l("before-close", {
            cancelable: true,
        })
        /**
         * Fired when the settings dialog is closed.
         * @public
         */
        ,
        eventStrict.l("close")
        /**
         * Fired when the Save button in the footer is clicked.
         * The dialog does not close automatically — the application is responsible
         * for closing it after persisting the changes.
         * @public
         */
        ,
        eventStrict.l("save")
        /**
         * Fired when the Cancel button in the footer is clicked.
         * The dialog does not close automatically — the application is responsible
         * for closing it after discarding the changes.
         * @public
         */
        ,
        eventStrict.l("cancel")
    ], UserSettingsDialog);
    UserSettingsDialog.define();
    var UserSettingsDialog_default = UserSettingsDialog;

    return UserSettingsDialog_default;

}));
