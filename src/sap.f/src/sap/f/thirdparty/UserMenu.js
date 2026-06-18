sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/query', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/MenuItem2', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Avatar', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Tag', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/Text', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/List', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/sys-enter-2', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/ListSelectionMode', 'sap/f/thirdparty/ListItemAdditionalText.css'], (function (webcomponentsBase, eventStrict, parametersBundle_css, jsxRuntime, query, ResponsivePopover, MenuItem, Theme, Avatar, Button, Icon, Tag, Title, Text, Label, List, ListItemTemplate, i18nDefaults, AccessibilityTextsHelper, Icons, decline, sysEnter2, parametersBundle_css$1, i18nDefaults$1, ValueState, toLowercaseEnumValue, FocusableElements, ListItemBase, InvisibleMessage, BusyIndicator, willShowContent, ListItemGroup, WrappingType, ListSelectionMode, ListItemAdditionalText_css) { 'use strict';

    function PanelTemplate() {
        return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("div", { class: "ui5-panel-root", role: this.accRole, "aria-label": this.effectiveAccessibleName, "aria-labelledby": this.fixedPanelAriaLabelledbyReference, children: [this.hasHeaderOrHeaderText &&
                        // header: either header or h1 with header text
                        jsxRuntime.jsx("div", { class: {
                                "ui5-panel-heading-wrapper": true,
                                "ui5-panel-heading-wrapper-sticky": this.stickyHeader,
                            }, role: this.headingWrapperRole, "aria-level": this.headingWrapperAriaLevel, part: "header-wrapper", children: jsxRuntime.jsxs("div", { onClick: this._headerClick, onKeyDown: this._headerKeyDown, onKeyUp: this._headerKeyUp, onTouchStart: this._isMobile, onFocusOut: this._headerFocusOut, class: "ui5-panel-header", tabindex: this.headerTabIndex, role: this.accInfo.role, "aria-expanded": this.accInfo.ariaExpanded, "aria-controls": this.accInfo.ariaControls, "aria-labelledby": this.accInfo.ariaLabelledby, part: "header", children: [!this.fixed &&
                                        jsxRuntime.jsx("div", { class: "ui5-panel-header-button-root", children: this._hasHeader ?
                                                jsxRuntime.jsx(Button.Button, { design: "Transparent", class: "ui5-panel-header-button ui5-panel-header-button-with-icon", onClick: this._toggleButtonClick, accessibilityAttributes: this.accInfo.button.accessibilityAttributes, tooltip: this.accInfo.button.title, accessibleName: this.accInfo.button.ariaLabelButton, children: jsxRuntime.jsx("div", { class: "ui5-panel-header-icon-wrapper", children: jsxRuntime.jsx(Icon.Icon, { class: {
                                                                "ui5-panel-header-icon": true,
                                                                "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                            }, name: ListItemTemplate.slimArrowRight }) }) })
                                                : // else
                                                    jsxRuntime.jsx(Icon.Icon, { class: {
                                                            "ui5-panel-header-button": true,
                                                            "ui5-panel-header-icon": true,
                                                            "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                        }, name: ListItemTemplate.slimArrowRight, showTooltip: true, accessibleName: this.toggleButtonTitle }) }), this._hasHeader ?
                                        jsxRuntime.jsx("slot", { name: "header" })
                                        : // else
                                            jsxRuntime.jsx("div", { id: `${this._id}-header-title`, class: "ui5-panel-header-title", children: this.headerText })] }) }), jsxRuntime.jsx("div", { class: "ui5-panel-content", id: `${this._id}-content`, tabindex: -1, style: {
                            display: this._contentExpanded ? "block" : "none",
                        }, part: "content", children: jsxRuntime.jsx("slot", {}) })] }) }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var panelCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:block}:host{font-family:var(--sapFontFamily);background-color:var(--sapGroup_TitleBackground);border-radius:var(--_ui5_panel_border_radius)}:host(:not([collapsed])){border-bottom:var(--_ui5_panel_border_bottom)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{min-height:var(--_ui5_panel_header_height);width:100%;position:relative;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:var(--_ui5_panel_header_padding_right);font-family:var(--sapFontHeaderFamily);font-size:var(--sapGroup_Title_FontSize);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-header-icon{color:var(--_ui5_panel_icon_color)}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header]):not([fixed])) .ui5-panel-header{cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--_ui5_panel_focus_border);border-radius:var(--_ui5_panel_border_radius);top:var(--_ui5_panel_focus_offset);bottom:var(--_ui5_panel_focus_bottom_offset);left:var(--_ui5_panel_focus_offset);right:var(--_ui5_panel_focus_offset)}:host(:not([collapsed]):not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{border-radius:var(--_ui5_panel_border_radius_expanded)}:host([_touched]:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{display:none}:host(:not([collapsed])) .ui5-panel-header-button:not(.ui5-panel-header-button-with-icon),:host(:not([collapsed])) .ui5-panel-header-icon-wrapper [ui5-icon]{transform:var(--_ui5_panel_toggle_btn_rotation)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky{position:sticky;top:0;background-color:var(--_ui5_panel_header_background_color);z-index:100;border-radius:var(--_ui5_panel_border_radius)}.ui5-panel-header-title{width:calc(100% - var(--_ui5_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-panel-content{padding:var(--_ui5_panel_content_padding);background-color:var(--sapGroup_ContentBackground);outline:none;border-bottom-left-radius:var(--_ui5_panel_border_radius);border-bottom-right-radius:var(--_ui5_panel_border_radius);overflow:auto}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5_panel_button_root_width);height:var(--_ui5_panel_button_root_height);padding:var(--_ui5_panel_header_button_wrapper_padding);box-sizing:border-box}:host([fixed]:not([collapsed]):not([_has-header])) .ui5-panel-header,:host([collapsed]) .ui5-panel-header{border-bottom:.0625rem solid var(--sapGroup_TitleBorderColor)}:host([collapsed]) .ui5-panel-header{border-bottom-left-radius:var(--_ui5_panel_border_radius);border-bottom-right-radius:var(--_ui5_panel_border_radius)}:host(:not([fixed]):not([collapsed])) .ui5-panel-header{border-bottom:var(--_ui5_panel_default_header_border)}[ui5-button].ui5-panel-header-button{display:flex;justify-content:center;align-items:center;min-width:initial;height:100%;width:100%}.ui5-panel-header-icon-wrapper{display:flex;justify-content:center;align-items:center}.ui5-panel-header-icon-wrapper,.ui5-panel-header-icon-wrapper .ui5-panel-header-icon{color:inherit}.ui5-panel-header-icon-wrapper,[ui5-button].ui5-panel-header-button-with-icon [ui5-icon]{pointer-events:none}.ui5-panel-root{height:100%;display:flex;flex-direction:column}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Panel_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-panel` component is a container which has a header and a
     * content area and is used
     * for grouping and displaying information. It can be collapsed to save space on the screen.
     *
     * ### Guidelines:
     *
     * - Nesting two or more panels is not recommended.
     * - Do not stack too many panels on one page.
     *
     * ### Structure
     * The panel's header area consists of a title bar with a header text or custom header.
     *
     * The header is clickable and can be used to toggle between the expanded and collapsed state. It includes an icon which rotates depending on the state.
     *
     * The custom header can be set through the `header` slot and it may contain arbitraray content, such as: title, buttons or any other HTML elements.
     *
     * The content area can contain an arbitrary set of controls.
     *
     * **Note:** The custom header is not clickable out of the box, but in this case the icon is interactive and allows to show/hide the content area.
     *
     * ### Responsive Behavior
     *
     * - If the width of the panel is set to 100% (default), the panel and its children are
     * resized responsively,
     * depending on its parent container.
     * - If the panel has a fixed height, it will take up the space even if the panel is
     * collapsed.
     * - When the panel is expandable (the `fixed` property is set to `false`),
     * an arrow icon (pointing to the right) appears in front of the header.
     * - When the animation is activated, expand/collapse uses a smooth animation to open or
     * close the content area.
     * - When the panel expands/collapses, the arrow icon rotates 90 degrees
     * clockwise/counter-clockwise.
     *
     * ### Keyboard Handling
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Panel.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Defines the content of the component. The content is visible only when the component is expanded.
     * @csspart header-wrapper - Used to style the outermost header wrapper, useful for adjusting sticky header position.
     * @csspart header - Used to style the header.
     * @csspart content - Used to style the wrapper of the content.
     */
    let Panel = Panel_1 = class Panel extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Determines whether the component is in a fixed state that is not
             * expandable/collapsible by user interaction.
             * @default false
             * @public
             */
            this.fixed = false;
            /**
             * Indicates whether the component is collapsed and only the header is displayed.
             * @default false
             * @public
             */
            this.collapsed = false;
            /**
             * Indicates whether the transition between the expanded and the collapsed state of the component is animated. By default the animation is enabled.
             * @default false
             * @public
             * @since 1.0.0-rc.16
             */
            this.noAnimation = false;
            /**
             * Sets the accessible ARIA role of the component.
             * Depending on the usage, you can change the role from the default `Form`
             * to `Region` or `Complementary`.
             * @default "Form"
             * @public
             */
            this.accessibleRole = "Form";
            /**
             * Defines the "aria-level" of component heading,
             * set by the `headerText`.
             * @default "H2"
             * @public
            */
            this.headerLevel = "H2";
            /**
             * Indicates whether the Panel header is sticky or not.
             * If stickyHeader is set to true, then whenever you scroll the content or
             * the application, the header of the panel will be always visible and
             * a solid color will be used for its design.
             * @default false
             * @public
             * @since 1.16.0-rc.1
             */
            this.stickyHeader = false;
            /**
             * When set to `true`, the `accessibleName` property will be
             * applied not only on the panel root itself, but on its toggle button too.
             * **Note:** This property only has effect if `accessibleName` is set and a header slot is provided.
             * @default false
             * @private
              */
            this.useAccessibleNameForToggleButton = false;
            /**
             * @private
             */
            this._hasHeader = false;
            this._contentExpanded = false;
            this._animationRunning = false;
            this._pendingToggle = false;
            this._touched = false;
        }
        onBeforeRendering() {
            // If the animation is running, it will set the content expanded state at the end
            if (!this._animationRunning) {
                this._contentExpanded = !this.collapsed;
            }
            this._hasHeader = !!this.header.length;
        }
        shouldToggle(element) {
            const customContent = this.header.length;
            if (customContent) {
                return element.classList.contains("ui5-panel-header-button");
            }
            return true;
        }
        get shouldNotAnimate() {
            return this.noAnimation || webcomponentsBase.d$1() === Theme.u.None;
        }
        _isMobile() {
            if (Theme.l()) {
                this._touched = true;
            }
        }
        _headerFocusOut() {
            this._touched = false;
        }
        _headerClick(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            this._toggleOpen();
        }
        _toggleButtonClick(e) {
            if (e.detail.originalEvent.x === 0 && e.detail.originalEvent.y === 0) {
                e.stopImmediatePropagation();
            }
        }
        _headerKeyDown(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            if (webcomponentsBase.b(e)) {
                this._toggleOpen();
            }
            if (webcomponentsBase.A(e)) {
                e.preventDefault();
                this._pendingToggle = true;
            }
            // Cancel toggle if Escape is pressed
            if (webcomponentsBase.m$1(e) && this._pendingToggle) {
                e.preventDefault();
                this._pendingToggle = false;
            }
        }
        _headerKeyUp(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            if (webcomponentsBase.b(e)) {
                e.preventDefault();
            }
            if (webcomponentsBase.A(e)) {
                // Only toggle if space was pressed and escape wasn't pressed to cancel
                if (this._pendingToggle) {
                    this._toggleOpen();
                }
                this._pendingToggle = false;
            }
        }
        _toggleOpen() {
            if (this.fixed) {
                return;
            }
            this.collapsed = !this.collapsed;
            if (this.shouldNotAnimate) {
                this.fireDecoratorEvent("toggle");
                return;
            }
            this._animationRunning = true;
            const elements = this.getDomRef().querySelectorAll(".ui5-panel-content");
            const animations = [];
            [].forEach.call(elements, oElement => {
                if (this.collapsed) {
                    animations.push(webcomponentsBase.u$1(oElement).promise());
                }
                else {
                    animations.push(webcomponentsBase.b$1(oElement).promise());
                }
            });
            Promise.all(animations).then(() => {
                this._animationRunning = false;
                this._contentExpanded = !this.collapsed;
                this.fireDecoratorEvent("toggle");
            });
        }
        _headerOnTarget(target) {
            return target.classList.contains("sapMPanelWrappingDiv");
        }
        get toggleButtonTitle() {
            return Panel_1.i18nBundle.getText(i18nDefaults.PANEL_ICON);
        }
        get expanded() {
            return !this.collapsed;
        }
        get accRole() {
            return this.accessibleRole.toLowerCase();
        }
        get effectiveAccessibleName() {
            return typeof this.accessibleName === "string" && this.accessibleName.length ? this.accessibleName : undefined;
        }
        get accInfo() {
            return {
                "button": {
                    "accessibilityAttributes": {
                        "expanded": this.expanded,
                    },
                    "title": this.toggleButtonTitle,
                    "ariaLabelButton": !this.nonFocusableButton && this.useAccessibleNameForToggleButton ? this.effectiveAccessibleName : undefined,
                },
                "ariaExpanded": this.nonFixedInternalHeader ? this.expanded : undefined,
                "ariaControls": this.nonFixedInternalHeader ? `${this._id}-content` : undefined,
                "ariaLabelledby": this.nonFocusableButton ? this.ariaLabelledbyReference : undefined,
                "role": this.nonFixedInternalHeader ? "button" : undefined,
            };
        }
        get ariaLabelledbyReference() {
            return (this.nonFocusableButton && this.headerText && !this.fixed) ? `${this._id}-header-title` : undefined;
        }
        get fixedPanelAriaLabelledbyReference() {
            return this.fixed && !this.effectiveAccessibleName ? `${this._id}-header-title` : undefined;
        }
        get headerAriaLevel() {
            return Number.parseInt(this.headerLevel.slice(1));
        }
        get headerTabIndex() {
            return (this.header.length || this.fixed) ? -1 : 0;
        }
        get headingWrapperAriaLevel() {
            return !this._hasHeader ? this.headerAriaLevel : undefined;
        }
        get headingWrapperRole() {
            return !this._hasHeader ? "heading" : undefined;
        }
        get nonFixedInternalHeader() {
            return !this._hasHeader && !this.fixed;
        }
        get hasHeaderOrHeaderText() {
            return this._hasHeader || this.headerText;
        }
        get nonFocusableButton() {
            return !this.header.length;
        }
    };
    __decorate$2([
        webcomponentsBase.s()
    ], Panel.prototype, "headerText", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "fixed", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "collapsed", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "noAnimation", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Panel.prototype, "accessibleRole", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Panel.prototype, "headerLevel", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Panel.prototype, "accessibleName", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "stickyHeader", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "useAccessibleNameForToggleButton", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "_hasHeader", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Panel.prototype, "_contentExpanded", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Panel.prototype, "_animationRunning", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Panel.prototype, "_pendingToggle", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "_touched", void 0);
    __decorate$2([
        webcomponentsBase.d()
    ], Panel.prototype, "header", void 0);
    __decorate$2([
        parametersBundle_css.i("@ui5/webcomponents")
    ], Panel, "i18nBundle", void 0);
    Panel = Panel_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-panel",
            fastNavigation: true,
            languageAware: true,
            renderer: jsxRuntime.y,
            template: PanelTemplate,
            styles: panelCss,
        })
        /**
         * Fired when the component is expanded/collapsed by user interaction.
         * @public
         */
        ,
        eventStrict.l("toggle", {
            bubbles: true,
        })
    ], Panel);
    Panel.define();
    var Panel$1 = Panel;

    function BarTemplate() {
        return (jsxRuntime.jsxs("div", { class: "ui5-bar-root", "aria-label": this.accInfo.label, role: this.accInfo.role, part: "bar", children: [jsxRuntime.jsx("div", { class: "ui5-bar-content-container ui5-bar-startcontent-container", part: "startContent", children: jsxRuntime.jsx("slot", { name: "startContent" }) }), jsxRuntime.jsx("div", { class: "ui5-bar-content-container ui5-bar-midcontent-container", part: "midContent", children: jsxRuntime.jsx("slot", {}) }), jsxRuntime.jsx("div", { class: "ui5-bar-content-container ui5-bar-endcontent-container", part: "endContent", children: jsxRuntime.jsx("slot", { name: "endContent" }) })] }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var BarCss = `:host{background-color:var(--sapPageHeader_Background);height:var(--_ui5_bar_base_height);width:100%;box-shadow:var(--sapContent_HeaderShadow);display:block}.ui5-bar-root{display:flex;align-items:center;justify-content:space-between;height:100%;width:100%;background-color:inherit;box-shadow:inherit;border-radius:inherit;min-width:0;overflow:hidden}.ui5-bar-root .ui5-bar-startcontent-container,.ui5-bar-root .ui5-bar-endcontent-container,.ui5-bar-root .ui5-bar-midcontent-container{display:flex;align-items:center}.ui5-bar-root .ui5-bar-startcontent-container{flex:0 1 auto}.ui5-bar-root .ui5-bar-endcontent-container{flex:0 0 auto}.ui5-bar-root .ui5-bar-midcontent-container{justify-content:center;flex:1 1 auto;padding:0 var(--_ui5_bar-mid-container-padding-start-end);min-width:0;overflow:hidden}.ui5-bar-root .ui5-bar-startcontent-container{padding-inline-start:var(--_ui5_bar-start-container-padding-start)}.ui5-bar-root .ui5-bar-content-container{min-width:calc(30% - calc(var(--_ui5_bar-start-container-padding-start) + var(--_ui5_bar-end-container-padding-end) + (2*var(--_ui5_bar-mid-container-padding-start-end))))}.ui5-bar-root.ui5-bar-root-shrinked .ui5-bar-content-container{min-width:0px;overflow:hidden;height:100%}.ui5-bar-root .ui5-bar-endcontent-container{padding-inline-end:var(--_ui5_bar-end-container-padding-end)}:host([design="Footer"]){background-color:var(--sapPageFooter_Background);border-top:.0625rem solid var(--sapPageFooter_BorderColor);box-shadow:none}:host([design="Subheader"]){height:var(--_ui5_bar_subheader_height);margin-top:var(--_ui5_bar_subheader_margin-top)}:host([design="FloatingFooter"]){border-radius:var(--sapElement_BorderCornerRadius);background-color:var(--sapPageFooter_Background);box-shadow:var(--sapContent_Shadow1);border:none}::slotted(*:not([hidden])){margin:0 .25rem;display:inline-block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * ### Overview
     * The Bar is a container which is primarily used to hold titles, buttons and input elements
     * and its design and functionality is the basis for page headers and footers.
     * The component consists of three areas to hold its content - startContent slot, default slot and endContent slot.
     * It has the capability to center content, such as a title, while having other components on the left and right side.
     *
     * ### Usage
     * With the use of the design property, you can set the style of the Bar to appear designed like a Header, Subheader, Footer and FloatingFooter.
     *
     * **Note:** Do not place a Bar inside another Bar or inside any bar-like component. Doing so may cause unpredictable behavior.
     *
     * ### Responsive Behavior
     * The default slot will be centered in the available space between the startContent and the endContent areas,
     * therefore it might not always be centered in the entire bar.
     *
     * ### Keyboard Handling
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Bar.js";`
     * @csspart bar - Used to style the wrapper of the content of the component
     * @csspart startContent - Used to style the wrapper of the start content of the component
     * @csspart midContent - Used to style the wrapper of the middle content of the component
     * @csspart endContent - Used to style the wrapper of the end content of the component
     * @constructor
     * @extends UI5Element
     * @public
     * @since 1.0.0-rc.11
     */
    let Bar = class Bar extends webcomponentsBase.S {
        get accInfo() {
            return {
                "label": this.ariaLabelText,
                "role": this.effectiveRole,
            };
        }
        get ariaLabelText() {
            if (this.accessibleName || this.accessibleNameRef) {
                return AccessibilityTextsHelper.A(this);
            }
            return this.design;
        }
        constructor() {
            super();
            /**
             * Defines the component's design.
             * @default "Header"
             * @public
             */
            this.design = "Header";
            /**
             * Specifies the ARIA role applied to the component for accessibility purposes.
             *
             * **Note:**
             *
             * - Set accessibleRole to "toolbar" only when the component contains two or more active, interactive elements (such as buttons, links, or input fields) within the bar.
             *
             * - If there is only one or no active element, it is recommended to avoid using the "toolbar" role, as it implies a grouping of multiple interactive controls.
             *
             * @public
             * @default "Toolbar"
             * @since 2.10.0
             *
             */
            this.accessibleRole = "Toolbar";
            this._handleResizeBound = this.handleResize.bind(this);
        }
        handleResize() {
            const bar = this.getDomRef();
            const barWidth = bar.offsetWidth;
            const needShrinked = Array.from(bar.children).some(child => {
                return child.offsetWidth > barWidth / 3;
            });
            bar.classList.toggle("ui5-bar-root-shrinked", needShrinked);
        }
        onEnterDOM() {
            webcomponentsBase.f.register(this, this._handleResizeBound);
            this.getDomRef().querySelectorAll(".ui5-bar-content-container").forEach(child => {
                webcomponentsBase.f.register(child, this._handleResizeBound);
            }, this);
        }
        onExitDOM() {
            webcomponentsBase.f.deregister(this, this._handleResizeBound);
            this.getDomRef().querySelectorAll(".ui5-bar-content-container").forEach(child => {
                webcomponentsBase.f.deregister(child, this._handleResizeBound);
            }, this);
        }
        get effectiveRole() {
            return this.accessibleRole.toLowerCase() === "toolbar" ? "toolbar" : undefined;
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], Bar.prototype, "design", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Bar.prototype, "accessibleRole", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Bar.prototype, "accessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Bar.prototype, "accessibleNameRef", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], Bar.prototype, "startContent", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], Bar.prototype, "middleContent", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], Bar.prototype, "endContent", void 0);
    Bar = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-bar",
            fastNavigation: true,
            renderer: jsxRuntime.y,
            styles: BarCss,
            template: BarTemplate,
        })
    ], Bar);
    Bar.define();
    var Bar$1 = Bar;

    const name$7 = "person-placeholder";
    const pathData$7 = "M2 16v-4a4.016 4.016 0 0 1 2.438-3.688A3.88 3.88 0 0 1 6 8h2a3.876 3.876 0 0 1-1.563-.313 4.065 4.065 0 0 1-2.125-2.125A3.877 3.877 0 0 1 4 4 4.016 4.016 0 0 1 6.438.313C6.917.104 7.438 0 8 0a4.016 4.016 0 0 1 2.828 1.172A4.015 4.015 0 0 1 12 4c0 .563-.104 1.083-.313 1.563A4.016 4.016 0 0 1 8 8h2.001a4.016 4.016 0 0 1 2.828 1.172A4.016 4.016 0 0 1 14 11.999v4H2Zm1-4v3h10v-3c0-.833-.292-1.542-.875-2.125A2.893 2.893 0 0 0 10 9H6c-.833 0-1.542.292-2.125.875A2.893 2.893 0 0 0 3 12Zm2-8c0 .833.292 1.542.875 2.125A2.893 2.893 0 0 0 8 7c.833 0 1.542-.292 2.125-.875A2.893 2.893 0 0 0 11 4c0-.833-.292-1.542-.875-2.125A2.893 2.893 0 0 0 8 1c-.833 0-1.542.292-2.125.875A2.893 2.893 0 0 0 5 4Z";
    const ltr$7 = false;
    const viewBox$7 = "0 0 16 16";
    const collection$7 = "SAP-icons-v4";
    const packageName$7 = "@ui5/webcomponents-icons";

    Icons.y(name$7, { pathData: pathData$7, ltr: ltr$7, viewBox: viewBox$7, collection: collection$7, packageName: packageName$7 });

    const name$6 = "person-placeholder";
    const pathData$6 = "M8 1a4 4 0 0 1 2.616 7.023C12.61 8.931 14 10.927 14 13.25v1a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75v-1c0-2.323 1.39-4.319 3.383-5.227A4 4 0 0 1 8 1Zm-.001 8C5.372 9 3.5 10.911 3.5 13.25v.25h9v-.25C12.5 10.911 10.686 9 7.999 9ZM8 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z";
    const ltr$6 = false;
    const viewBox$6 = "0 0 16 16";
    const collection$6 = "SAP-icons-v5";
    const packageName$6 = "@ui5/webcomponents-icons";

    Icons.y(name$6, { pathData: pathData$6, ltr: ltr$6, viewBox: viewBox$6, collection: collection$6, packageName: packageName$6 });

    var personPlaceholder = "person-placeholder";

    const name$5 = "user-settings";
    const pathData$5 = "M16 16H6v-2c0-.563.104-1.083.313-1.563a4.065 4.065 0 0 1 2.125-2.124c.479-.209 1-.313 1.562-.313h1c-.896 0-1.62-.281-2.172-.844C8.276 8.594 8 7.875 8 7c0-.27.01-.417.031-.438a2.97 2.97 0 0 1 .844-1.687 2.97 2.97 0 0 1 1.688-.844c.02-.02.166-.031.437-.031.875 0 1.594.276 2.156.828C13.72 5.38 14 6.104 14 7c0 .833-.292 1.542-.875 2.125A2.893 2.893 0 0 1 11 10h1a4.015 4.015 0 0 1 3.688 2.438c.208.479.312 1 .312 1.562v2ZM0 7c0-.292.094-.531.281-.719A.973.973 0 0 1 1 6h.875c.042-.167.099-.323.172-.469.073-.146.14-.291.203-.437l-.625-.625a1.043 1.043 0 0 1-.281-.719c0-.27.093-.5.281-.688l1.438-1.437a.935.935 0 0 1 .687-.281c.292 0 .531.093.719.281l.625.625c.146-.063.291-.13.437-.203.146-.073.302-.13.469-.172V1c0-.292.094-.531.281-.719A.973.973 0 0 1 7 0h2c.292 0 .531.094.719.281A.973.973 0 0 1 10 1v.875c.167.042.323.099.469.172.146.073.291.14.437.203l.625-.625a.974.974 0 0 1 .719-.281c.27 0 .5.093.688.281l1.437 1.438a.935.935 0 0 1 .281.687c0 .27-.094.51-.281.719l-.188.156-.312-.375a1.992 1.992 0 0 0-.375-.344l.156-.156-1.406-1.406-.719.719a4.97 4.97 0 0 0-.265-.047A1.917 1.917 0 0 0 11 3a4.517 4.517 0 0 0-.75.063c-.02-.021-.063-.032-.125-.032a2.819 2.819 0 0 0-.203-.094l-.235-.093L9 2.594V1H7v1.594l-.688.25a.555.555 0 0 1-.156.047.28.28 0 0 0-.156.078l-.469.187-.625.313L3.75 2.344 2.344 3.75l1.125 1.156-.313.625c-.062.125-.12.255-.172.39a9.185 9.185 0 0 0-.14.391L2.594 7H1v2h1.594l.25.688c.02.041.041.093.062.156.021.062.042.114.063.156 0 .042.02.083.062.125a3.134 3.134 0 0 0 .125.313l.313.656-1.125 1.156 1.406 1.406L4.906 12.5l.282.156c-.105.375-.167.76-.188 1.156l-.531.563a.973.973 0 0 1-.719.281.94.94 0 0 1-.688-.281l-1.437-1.438a.954.954 0 0 1-.281-.703c0-.28.093-.515.281-.703l.625-.625a8.179 8.179 0 0 0-.203-.437A2.282 2.282 0 0 1 1.875 10H1a.947.947 0 0 1-.719-.297A.988.988 0 0 1 0 9V7Zm15 8v-1c0-.833-.292-1.542-.875-2.125A2.893 2.893 0 0 0 12 11h-2c-.833 0-1.542.292-2.125.875A2.893 2.893 0 0 0 7 14v1h8ZM9 7c0 .563.193 1.036.578 1.422.386.385.86.578 1.422.578a1.92 1.92 0 0 0 1.406-.594A1.92 1.92 0 0 0 13 7c0-.563-.193-1.036-.578-1.422A1.933 1.933 0 0 0 11 5a1.92 1.92 0 0 0-1.406.594A1.922 1.922 0 0 0 9 7ZM5 8.156c0-.729.167-1.349.5-1.86.333-.51.833-.89 1.5-1.14l.25-.062a6 6 0 0 1 .281-.063 3.739 3.739 0 0 0-.438 1.031.133.133 0 0 1-.015.063.218.218 0 0 0-.016.094c-.02 0-.03.005-.03.015 0 .01-.011.016-.032.016l-.375.281c-.23.23-.39.453-.484.672A2.02 2.02 0 0 0 6 8c0 .083.005.167.016.25.01.083.026.177.046.281.167.521.48.917.938 1.188l.125.062.125.063A.553.553 0 0 0 7 10a7.495 7.495 0 0 0-.594.531.832.832 0 0 1-.218-.156A1.237 1.237 0 0 0 6 10.219 1.09 1.09 0 0 1 5.781 10c-.27-.313-.458-.594-.562-.844-.104-.25-.177-.583-.219-1Z";
    const ltr$5 = false;
    const viewBox$5 = "0 0 16 16";
    const collection$5 = "SAP-icons-v4";
    const packageName$5 = "@ui5/webcomponents-icons";

    Icons.y(name$5, { pathData: pathData$5, ltr: ltr$5, viewBox: viewBox$5, collection: collection$5, packageName: packageName$5 });

    const name$4 = "user-settings";
    const pathData$4 = "M12 8a.75.75 0 0 1 .75.75v.348c.426.11.816.308 1.146.578l.43-.294a.75.75 0 0 1 .849 1.236l-.39.268c.156.392.234.834.21 1.277l.437.11a.75.75 0 1 1-.364 1.454l-.53-.132a3.032 3.032 0 0 1-.717.785l.303.454a.75.75 0 1 1-1.248.832l-.464-.695a3.08 3.08 0 0 1-.825 0l-.463.695a.75.75 0 1 1-1.248-.832l.302-.454a3.011 3.011 0 0 1-.716-.785l-.53.132a.75.75 0 0 1-.364-1.454l.436-.11c-.024-.445.055-.89.214-1.283l-.384-.256a.75.75 0 0 1 .832-1.248l.442.295c.33-.268.718-.464 1.142-.573V8.75A.75.75 0 0 1 12 8ZM6 0a4 4 0 0 1 .355 7.983C6.137 8 5.981 8 5.798 8 3.418 8 1.5 9.911 1.5 12.25v.25h3.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75v-1c0-2.323 1.39-4.319 3.383-5.227A4 4 0 0 1 6 0Zm6 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm-6-9a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z";
    const ltr$4 = false;
    const viewBox$4 = "0 0 16 16";
    const collection$4 = "SAP-icons-v5";
    const packageName$4 = "@ui5/webcomponents-icons";

    Icons.y(name$4, { pathData: pathData$4, ltr: ltr$4, viewBox: viewBox$4, collection: collection$4, packageName: packageName$4 });

    var userSettings = "user-settings";

    const name$3 = "log";
    const pathData$3 = "M11 2.688a6.986 6.986 0 0 1 2.89 2.53C14.63 6.345 15 7.605 15 9c0 .98-.182 1.89-.547 2.734a7.075 7.075 0 0 1-1.5 2.22 7.027 7.027 0 0 1-2.234 1.5A6.853 6.853 0 0 1 8 16c-.98 0-1.89-.182-2.734-.547a7.075 7.075 0 0 1-2.22-1.5 7.074 7.074 0 0 1-1.5-2.219A6.82 6.82 0 0 1 1 9c0-1.396.37-2.656 1.11-3.781A6.986 6.986 0 0 1 5 2.687v1.126a6.106 6.106 0 0 0-2.172 2.14C2.276 6.86 2 7.875 2 9c0 .833.156 1.615.469 2.344A6.02 6.02 0 0 0 3.75 13.25a6.017 6.017 0 0 0 1.906 1.281A5.88 5.88 0 0 0 8 15a5.88 5.88 0 0 0 2.344-.469 6.018 6.018 0 0 0 1.906-1.281 6.018 6.018 0 0 0 1.281-1.906A5.88 5.88 0 0 0 14 9c0-1.125-.276-2.14-.828-3.047A6.107 6.107 0 0 0 11 3.813V2.687ZM8 9a.973.973 0 0 1-.719-.281A.973.973 0 0 1 7 8V1c0-.27.094-.505.281-.703A.947.947 0 0 1 8 0c.27 0 .505.099.703.297A.961.961 0 0 1 9 1v7a.947.947 0 0 1-.297.719A.988.988 0 0 1 8 9Z";
    const ltr$3 = false;
    const viewBox$3 = "0 0 16 16";
    const collection$3 = "SAP-icons-v4";
    const packageName$3 = "@ui5/webcomponents-icons";

    Icons.y(name$3, { pathData: pathData$3, ltr: ltr$3, viewBox: viewBox$3, collection: collection$3, packageName: packageName$3 });

    const name$2 = "log";
    const pathData$2 = "M3.86 1.153a.75.75 0 0 1 .778 1.284 6.5 6.5 0 1 0 6.728.002.75.75 0 0 1 .778-1.283 8 8 0 1 1-8.283-.003ZM8 0a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 8 0Z";
    const ltr$2 = false;
    const viewBox$2 = "0 0 16 16";
    const collection$2 = "SAP-icons-v5";
    const packageName$2 = "@ui5/webcomponents-icons";

    Icons.y(name$2, { pathData: pathData$2, ltr: ltr$2, viewBox: viewBox$2, collection: collection$2, packageName: packageName$2 });

    var log = "log";

    const name$1 = "user-edit";
    const pathData$1 = "M4.723 12H0v-2a4.016 4.016 0 0 1 2.44-3.688A3.883 3.883 0 0 1 4.004 6h1a2.897 2.897 0 0 1-2.126-.875A2.892 2.892 0 0 1 2.002 3c0-.833.292-1.542.876-2.125A2.897 2.897 0 0 1 5.005 0c.834 0 1.543.292 2.127.875.584.583.876 1.292.876 2.125s-.292 1.542-.876 2.125A2.897 2.897 0 0 1 5.005 6h1c.647 0 1.242.146 1.784.438a4.34 4.34 0 0 1 1.376 1.156l-.72.687a2.927 2.927 0 0 0-1.047-.937A2.9 2.9 0 0 0 6.006 7H4.004c-.834 0-1.543.292-2.127.875A2.892 2.892 0 0 0 1 10v1h4.723l-1 1Zm-.281 4a8.93 8.93 0 0 0 .25-.625c.125-.333.25-.688.375-1.063.084-.208.162-.427.235-.656.073-.229.162-.479.266-.75l8.164-8.125a.479.479 0 0 1 .344-.156c.125 0 .24.052.344.156l1.408 1.407c.23.229.23.458 0 .687l-8.133 8.156c-.02.021-.198.084-.532.188-.333.104-.709.208-1.126.312-.459.167-.99.323-1.595.469Zm.563-11c.542 0 1.011-.198 1.408-.594A1.92 1.92 0 0 0 7.007 3a1.92 1.92 0 0 0-.594-1.406A1.925 1.925 0 0 0 5.005 1a1.91 1.91 0 0 0-1.423.594A1.947 1.947 0 0 0 3.002 3c0 .542.194 1.01.58 1.406.385.396.86.594 1.423.594Zm1.408 8.469.719.687L12.794 8.5l-.688-.688-5.693 5.657Zm6.38-6.375.72.718 1.252-1.28-.689-.688-1.282 1.25Z";
    const ltr$1 = false;
    const viewBox$1 = "0 0 16 16";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

    const name = "user-edit";
    const pathData = "M10.798 7.543a.749.749 0 0 1 1.002.05l1.583 1.585a.75.75 0 0 1 .002 1.06l-5.53 5.542a.75.75 0 0 1-.53.22H5.742a.75.75 0 0 1-.749-.75v-1.583c0-.199.08-.39.22-.53l5.586-5.594ZM6.49 13.977v.523h.525l4.78-4.792-.524-.523-4.781 4.792ZM5.99 0a3.997 3.997 0 0 1 3.994 4 3.996 3.996 0 0 1-3.638 3.983C6.108 8 5.97 8 5.789 8c-2.375 0-4.291 1.911-4.291 4.25v.25h.749a.75.75 0 0 1 0 1.5H.749A.75.75 0 0 1 0 13.25v-1c0-2.323 1.387-4.319 3.378-5.227A3.992 3.992 0 0 1 1.997 4c0-2.21 1.788-4 3.994-4Zm7.526 5c.199 0 .39.078.53.219l1.584 1.584a.75.75 0 0 1 .002 1.06l-.787.791a.749.749 0 0 1-1.06.002l-1.583-1.584a.75.75 0 0 1-.002-1.06l.787-.791a.746.746 0 0 1 .53-.221ZM5.991 1.5A2.498 2.498 0 0 0 3.495 4c0 1.38 1.117 2.5 2.496 2.5A2.498 2.498 0 0 0 8.487 4c0-1.38-1.118-2.5-2.496-2.5Z";
    const ltr = false;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, viewBox, collection, packageName });

    var userEdit = "user-edit";

    function UserMenuTemplate() {
        return (jsxRuntime.jsxs(ResponsivePopover.ResponsivePopover, { id: "user-menu-rp", class: "ui5-user-menu-rp", placement: "Bottom", verticalAlign: "Bottom", horizontalAlign: "End", tabindex: -1, accessibleName: this.accessibleNameText, "aria-label": this.accessibleNameText, open: this.open, opener: this.opener, onClose: this._handlePopoverAfterClose, onOpen: this._handlePopoverAfterOpen, onScroll: this._handleScroll, children: [jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs(Bar$1, { class: {
                                "ui5-user-menu-fixed-header": true,
                                "ui5-user-menu-rp-scrolled": this._isScrolled || this._titleMovedToHeader
                            }, slot: "header", children: [this._titleMovedToHeader &&
                                    jsxRuntime.jsx(Title.Title, { level: "H1", wrappingType: "None", children: this._selectedAccount.titleText }), this._isPhone && jsxRuntime.jsx(Button.Button, { icon: decline.decline, design: "Transparent", accessibleName: this._closeDialogAriaLabel, onClick: this._closeUserMenu, slot: "endContent" })] }), jsxRuntime.jsx("div", { class: "ui5-user-menu-header", children: headerContent.call(this) })] }), this.showOtherAccounts &&
                    jsxRuntime.jsx(jsxRuntime.Fragment, { children: otherAccountsContent.call(this) }), this.menuItems.length > 0 &&
                    jsxRuntime.jsx(List.List, { id: "ui5-user-menu-list", class: "ui5-user-menu-list", selectionMode: "None", separators: "None", accessibleRole: "Menu", accessibleName: this._ariaLabelledByActions, onItemClick: this._handleMenuItemClick, onMouseOver: this._itemMouseOver, "onui5-close-menu": this._handleMenuItemClose, children: jsxRuntime.jsx("slot", {}) }), this._hasCustomFooter &&
                    jsxRuntime.jsx("div", { slot: "footer", class: "ui5-user-menu-footer", children: jsxRuntime.jsx("slot", { name: "footer" }) }), this._showDefaultFooter &&
                    jsxRuntime.jsx("div", { slot: "footer", class: "ui5-user-menu-footer", children: jsxRuntime.jsx(Button.Button, { class: "ui5-user-menu-sign-out-btn", design: "Transparent", icon: log, onClick: this._handleSignOutClick, children: this._signOutButtonText }) })] }));
    }
    function headerContent() {
        return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: this._selectedAccount &&
                jsxRuntime.jsxs("div", { class: "ui5-user-menu-selected-account", "aria-label": this._ariaLabelledByAccountInformationText, children: [jsxRuntime.jsx("span", { title: this.showEditButton ? this._editAvatarTooltip : undefined, children: jsxRuntime.jsxs(Avatar, { size: "L", onClick: this._handleAvatarClick, initials: this._selectedAccount._initials, colorScheme: this._selectedAccount.avatarColorScheme, fallbackIcon: personPlaceholder, class: "ui5-user-menu-selected-account-avatar", interactive: true, children: [this._selectedAccount.avatarSrc &&
                                        jsxRuntime.jsx("img", { src: this._selectedAccount.avatarSrc }), this.showEditButton &&
                                        jsxRuntime.jsx(Tag.Tag, { slot: "badge", wrappingType: "None", design: "Set1", colorScheme: "5", children: jsxRuntime.jsx(Icon.Icon, { slot: "icon", name: ListItemTemplate.edit }) })] }) }), this._selectedAccount.titleText &&
                            jsxRuntime.jsx(Text.Text, { id: "selected-account-title", class: "ui5-user-menu-selected-account-title", children: this._selectedAccount.titleText }), this._selectedAccount.subtitleText &&
                            jsxRuntime.jsx(Text.Text, { class: "ui5-user-menu-selected-account-subtitleText", children: this._selectedAccount.subtitleText }), this._selectedAccount.description &&
                            jsxRuntime.jsx(Text.Text, { class: "ui5-user-menu-selected-account-description", children: this._selectedAccount.description }), this._selectedAccount.additionalInfo &&
                            jsxRuntime.jsx(Text.Text, { class: "ui5-user-menu-selected-account-additional-info", children: this._selectedAccount.additionalInfo }), this.showManageAccount &&
                            jsxRuntime.jsx(Button.Button, { id: "selected-account-manage-btn", icon: userSettings, class: "ui5-user-menu-manage-account-btn", onClick: this._handleManageAccountClick, children: this._manageAccountButtonText })] }) }));
    }
    function otherAccountsContent() {
        return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs(Panel$1, { collapsed: true, class: "ui5-user-menu-other-accounts", children: [jsxRuntime.jsxs("div", { slot: "header", class: "ui5-user-menu-account-header", children: [jsxRuntime.jsxs(Title.Title, { slot: "header", level: "H4", "wrapping-type": "None", children: [this._otherAccountsButtonText, " (", this._otherAccounts.length, ")"] }), this.showEditAccounts &&
                                jsxRuntime.jsx(Button.Button, { slot: "header", class: "ui5-user-menu-add-account-btn", design: "Transparent", icon: userEdit, onClick: this._handleEditAccountsClick, tooltip: this._editAccountsTooltip })] }), this._otherAccounts.length > 0 &&
                        jsxRuntime.jsx(jsxRuntime.Fragment, { children: otherAccountsList.call(this) })] }) }));
    }
    function otherAccountsList() {
        return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx(List.List, { onItemClick: this._handleAccountSwitch, loadingDelay: 0, accessibleName: `${this._otherAccountsButtonText} (${this._otherAccounts.length})`, loading: this._otherAccounts.some(account => account.loading === true), children: this._otherAccounts.map((account, index) => jsxRuntime.jsx(MenuItem.ListItemCustom, { ref: this.captureRef.bind(account), accessibilityAttributes: {
                        "ariaPosinset": index + 1,
                        "ariaSetsize": this._otherAccounts.length
                    }, accessibleName: this.getAccountDescriptionText(account), children: jsxRuntime.jsxs("div", { class: "ui5-user-menu-other-accounts-content", children: [jsxRuntime.jsx(Avatar, { slot: "image", size: "S", initials: account._initials, fallbackIcon: personPlaceholder, colorScheme: account.avatarColorScheme, children: account.avatarSrc &&
                                    jsxRuntime.jsx("img", { src: account.avatarSrc }) }), jsxRuntime.jsxs("div", { class: "ui5-user-menu-other-accounts-info", children: [account.titleText &&
                                        jsxRuntime.jsx(Title.Title, { class: "ui5-user-menu-other-accounts-title", children: account.titleText }), account.subtitleText &&
                                        jsxRuntime.jsx(Label, { class: "ui5-user-menu-other-accounts-additional-info", children: account.subtitleText }), account.description &&
                                        jsxRuntime.jsx(Label, { class: "ui5-user-menu-other-accounts-additional-info", children: account.description })] }), jsxRuntime.jsx("div", { children: account.selected &&
                                    jsxRuntime.jsx(Icon.Icon, { part: "icon", name: sysEnter2.selectedAccount, class: "ui5-user-menu-selected-account-icon", mode: "Decorative" }) })] }) })) }) }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var UserMenuCss = `.ui5-user-menu-rp{width:20rem}.ui5-user-menu-rp::part(content),.ui5-user-menu-rp::part(footer){padding-inline:.5rem}.ui5-user-menu-rp::part(header){box-shadow:none;padding:0}.ui5-user-menu-header{display:flex;flex-direction:column}[on-phone] .ui5-user-menu-header{padding-inline:0}.ui5-user-menu-fixed-header:not(.ui5-user-menu-rp-scrolled){box-shadow:none}.ui5-user-menu-fixed-header::part(startContent),.ui5-user-menu-fixed-header::part(endContent){padding:0}.ui5-user-menu-fixed-header [ui5-button]{margin-inline:.5rem;font-family:var(--sapFontSemiboldDuplexFamily)}.ui5-user-menu-rp::part(content){padding-top:0;padding-bottom:.5rem}.ui5-user-menu-selected-account{display:flex;align-items:center;flex-direction:column;margin-block-end:.5rem;overflow:hidden}.ui5-user-menu-selected-account-avatar{margin-block-start:.25rem;margin-block-end:.5rem}.ui5-user-menu-avatar-img{object-fit:cover}.ui5-user-menu-selected-account-title{text-align:center;margin-block:.25rem;font-family:var(--sapFontSemiboldDuplexFamily);font-size:var(--sapFontLargeSize);color:var(--sapTextColor)}.ui5-user-menu-selected-account-subtitleText{text-align:center;margin-bottom:.25rem;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor)}.ui5-user-menu-selected-account-description{text-align:center;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor)}.ui5-user-menu-selected-account-additional-info{margin-top:.25rem;text-align:center;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor)}.ui5-user-menu-manage-account-btn{font-family:var(--sapFontSemiboldDuplexFamily);margin-block-start:1rem}.ui5-user-menu-sign-out-btn{font-family:var(--sapFontSemiboldDuplexFamily)}.ui5-user-menu-other-accounts{margin-block-end:.5rem}.ui5-user-menu-other-accounts::part(header){border-bottom-left-radius:0;border-bottom-right-radius:0}.ui5-user-menu-other-accounts::part(content){padding:0}.ui5-user-menu-other-accounts-content{display:flex;align-items:center;width:100%;min-height:4.5rem;gap:12px}.ui5-user-menu-other-accounts-info{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:4px;align-self:stretch;width:100%;overflow:hidden}.ui5-user-menu-other-accounts-title{overflow:hidden;color:var(--sapList_TextColor);text-overflow:ellipsis;font-family:var(--sapFontSemiboldDuplexFamily);font-size:var(--sapFontSize);font-style:normal;line-height:normal}.ui5-user-menu-other-accounts-additional-info{overflow:hidden;color:var(--sapContent_LabelColor);text-overflow:ellipsis;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-style:normal;line-height:normal}.ui5-user-menu-selected-account-icon{display:flex;width:18px;align-items:center;align-self:stretch;color:var(--sapContent_NonInteractiveIconColor);font-family:var(--_ui5_slider_handle_font_family);font-size:1.125rem}.ui5-user-menu-account-header{display:flex;flex:1;justify-content:space-between;align-items:center}.ui5-user-menu-footer{display:flex;flex:1;justify-content:flex-end;align-items:center}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var UserMenu_1;
    const MENU_OPEN_DELAY = 300;
    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-menu` is an SAP Fiori specific web component that is used in `ui5-shellbar`
     * and allows the user to easily see information and settings for the current user and all other logged in accounts.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserMenu.js";`
     *
     * `import "@ui5/webcomponents-fiori/dist/UserMenuItem.js";` (for `ui5-user-menu-item`)
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.5.0
     */
    let UserMenu = UserMenu_1 = class UserMenu extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Defines if the User Menu is opened.
             *
             * @default false
             * @public
             */
            this.open = false;
            /**
             * Defines if the User Menu shows the Manage Account option.
             *
             * @default false
             * @public
             */
            this.showManageAccount = false;
            /**
             * Defines if the User Menu shows the Other Accounts option.
             *
             * @default false
             * @public
             */
            this.showOtherAccounts = false;
            /**
             * Defines if the User Menu shows the Edit Accounts option.
             *
             * @default false
             * @public
             */
            this.showEditAccounts = false;
            /**
             * Defines if the User menu shows edit button.
             *
             * @default false
             * @public
             * @since 2.7.0
             */
            this.showEditButton = false;
            /**
             * @default false
             * @private
             */
            this._titleMovedToHeader = false;
            /**
             * @default false
             * @private
             */
            this._isScrolled = false;
        }
        onBeforeRendering() {
            this._selectedAccount = this.accounts.find(account => account.selected) || this.accounts[0];
            const siblingsWithIcon = this._menuItems.some(menuItem => !!menuItem.icon);
            this._menuItems.forEach(item => {
                item._siblingsWithIcon = siblingsWithIcon;
            });
        }
        onAfterRendering() {
            if (this._responsivePopover && this.open && !this._observer) {
                this._setupObserver();
            }
        }
        _setupObserver() {
            const observerOptions = {
                threshold: [0.15],
            };
            this._observer?.disconnect();
            this._observer = new IntersectionObserver(entries => this._handleIntersection(entries), observerOptions);
            if (this._selectedAccountTitleEl) {
                this._observer.observe(this._selectedAccountTitleEl);
            }
            if (this._selectedAccountManageBtn) {
                this._observer.observe(this._selectedAccountManageBtn);
            }
        }
        get _isPhone() {
            return Theme.d();
        }
        _handleScroll(e) {
            this._isScrolled = e.detail.scrollTop > 0;
        }
        _handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.id === "selected-account-title") {
                        this._titleMovedToHeader = false;
                    }
                    return;
                }
                if (entry.target.id === "selected-account-title") {
                    this._titleMovedToHeader = true;
                }
            }, this);
        }
        _handleAvatarClick(e) {
            if (e.type === "click") {
                // TOFIX: Discuss this check: Fire the custom UserMenu#avatar-click only for Avatar#click (not for Avatar#ui5-click as well).
                this.fireDecoratorEvent("avatar-click");
            }
        }
        _handleManageAccountClick() {
            this.fireDecoratorEvent("manage-account-click");
        }
        _handleEditAccountsClick() {
            this.fireDecoratorEvent("edit-accounts-click");
        }
        _handleAccountSwitch(e) {
            const item = e.detail.item;
            const eventPrevented = !this.fireDecoratorEvent("change-account", {
                prevSelectedAccount: this._selectedAccount,
                selectedAccount: item.associatedAccount,
            });
            if (eventPrevented) {
                return;
            }
            this._selectedAccount.selected = false;
            item.associatedAccount.selected = true;
        }
        _handleSignOutClick() {
            const eventPrevented = !this.fireDecoratorEvent("sign-out-click");
            if (eventPrevented) {
                return;
            }
            this._closeUserMenu();
        }
        _handleMenuItemClick(e) {
            const item = e.detail.item;
            item._updateCheckedState();
            if (!item._popover) {
                const eventPrevented = !this.fireDecoratorEvent("item-click", {
                    "item": item,
                });
                if (!eventPrevented) {
                    item.fireEvent("close-menu");
                }
            }
            else {
                this._closeOtherSubMenus(item);
                this._openItemSubMenu(item);
            }
        }
        _handleMenuItemClose() {
            this._closeUserMenu();
        }
        _handlePopoverAfterOpen() {
            this._titleMovedToHeader = false;
            this._isScrolled = false;
            this._setupObserver();
            this.fireDecoratorEvent("open");
        }
        _handlePopoverAfterClose() {
            this._observer?.disconnect();
            this._observer = undefined;
            this._titleMovedToHeader = false;
            this._isScrolled = false;
            this.open = false;
            this.fireDecoratorEvent("close");
        }
        _itemMouseOver(e) {
            if (!Theme.f$1()) {
                return;
            }
            const item = e.target;
            if (!MenuItem.isInstanceOfMenuItem(item)) {
                return;
            }
            item.getFocusDomRef()?.focus();
            this._startOpenTimeout(item);
        }
        _startOpenTimeout(item) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(() => {
                this._closeOtherSubMenus(item);
                this._openItemSubMenu(item, true);
            }, MENU_OPEN_DELAY);
        }
        _closeOtherSubMenus(item) {
            if (!this._menuItems.includes(item)) {
                return;
            }
            this._menuItems.forEach(menuItem => {
                if (menuItem !== item) {
                    menuItem._close();
                }
            });
        }
        _openItemSubMenu(item, openedByMouse = false) {
            clearTimeout(this._timeout);
            if (!item._popover || item._popover.open) {
                return;
            }
            item._popover.opener = item;
            item._popover.open = true;
            item.selected = true;
            item._openedByMouse = openedByMouse;
        }
        _closeUserMenu() {
            this.open = false;
        }
        get _otherAccounts() {
            return this.accounts;
        }
        get _manageAccountButtonText() {
            return UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_MANAGE_ACCOUNT_BUTTON_TXT);
        }
        get _otherAccountsButtonText() {
            return UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_OTHER_ACCOUNT_BUTTON_TXT);
        }
        get _signOutButtonText() {
            return UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_SIGN_OUT_BUTTON_TXT);
        }
        get _editAvatarTooltip() {
            return UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_EDIT_AVATAR_TXT);
        }
        get _editAccountsTooltip() {
            return UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_EDIT_ACCOUNTS_TXT);
        }
        get _closeDialogAriaLabel() {
            return UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_CLOSE_DIALOG_BUTTON);
        }
        get accessibleNameText() {
            if (!this._selectedAccount) {
                return "";
            }
            return `${UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_POPOVER_ACCESSIBLE_NAME)} ${this._selectedAccount.titleText}`;
        }
        get _ariaLabelledByAccountInformationText() {
            return UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_CURRENT_INFORMATION_TXT);
        }
        get _ariaLabelledByActions() {
            return UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_ACTIONS_TXT);
        }
        get _hasCustomFooter() {
            return this.footer.length > 0 && this.footer[0]?.innerHTML.trim() !== "";
        }
        get _showDefaultFooter() {
            return this.footer.length === 0;
        }
        getAccountDescriptionText(account) {
            return `${account.titleText} ${account.subtitleText} ${account.description} ${account.selected ? UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_POPOVER_ACCESSIBLE_ACCOUNT_SELECTED_TXT) : ""}`;
        }
        getAccountByRefId(refId) {
            return this.accounts.find(account => account._id === refId);
        }
        captureRef(ref) {
            if (ref) {
                ref.associatedAccount = this;
            }
        }
        get _menuItems() {
            return this.menuItems.filter(MenuItem.isInstanceOfMenuItem);
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserMenu.prototype, "open", void 0);
    __decorate([
        webcomponentsBase.s({ converter: ResponsivePopover.e })
    ], UserMenu.prototype, "opener", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserMenu.prototype, "showManageAccount", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserMenu.prototype, "showOtherAccounts", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserMenu.prototype, "showEditAccounts", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserMenu.prototype, "showEditButton", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            "default": true,
        })
    ], UserMenu.prototype, "menuItems", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            invalidateOnChildChange: {
                properties: true,
                slots: false,
            },
        })
    ], UserMenu.prototype, "accounts", void 0);
    __decorate([
        webcomponentsBase.d()
    ], UserMenu.prototype, "footer", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserMenu.prototype, "_titleMovedToHeader", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserMenu.prototype, "_isScrolled", void 0);
    __decorate([
        query.o("#user-menu-rp")
    ], UserMenu.prototype, "_responsivePopover", void 0);
    __decorate([
        query.o("#selected-account-title")
    ], UserMenu.prototype, "_selectedAccountTitleEl", void 0);
    __decorate([
        query.o("#selected-account-manage-btn")
    ], UserMenu.prototype, "_selectedAccountManageBtn", void 0);
    __decorate([
        parametersBundle_css.i("@ui5/webcomponents-fiori")
    ], UserMenu, "i18nBundle", void 0);
    UserMenu = UserMenu_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-menu",
            languageAware: true,
            renderer: jsxRuntime.y,
            template: UserMenuTemplate,
            styles: [UserMenuCss],
        })
        /**
         * Fired when the account avatar is selected.
         * @public
         */
        ,
        eventStrict.l("avatar-click")
        /**
         * Fired when the "Manage Account" button is selected.
         * @public
         */
        ,
        eventStrict.l("manage-account-click")
        /**
         * Fired when the "Edit Accounts" button is selected.
         * @public
         */
        ,
        eventStrict.l("edit-accounts-click")
        /**
         * Fired when the account is switched to a different one.
         * @param {UserMenuAccount} prevSelectedAccount The previously selected account.
         * @param {UserMenuAccount} selectedAccount The selected account.
         * @public
         */
        ,
        eventStrict.l("change-account", {
            cancelable: true,
        })
        /**
         * Fired when a menu item is selected.
         * @param {UserMenuItem} item The selected `user menu item`.
         * @public
         */
        ,
        eventStrict.l("item-click", {
            cancelable: true,
        })
        /**
         * Fired when a user menu is open.
         * @public
         * @since 2.6.0
         */
        ,
        eventStrict.l("open")
        /**
         * Fired when a user menu is close.
         * @public
         * @since 2.6.0
         */
        ,
        eventStrict.l("close")
        /**
         * Fired when the "Sign Out" button is selected.
         * @public
         * @since 2.6.0
         */
        ,
        eventStrict.l("sign-out-click", {
            cancelable: true,
        })
    ], UserMenu);
    UserMenu.define();
    var UserMenu_default = UserMenu;

    return UserMenu_default;

}));
