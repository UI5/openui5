sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/query', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Avatar', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/Tag', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/Text', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/List', 'sap/f/thirdparty/ListItemCustom', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/information', 'sap/f/thirdparty/sys-enter-2', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/ListItemAdditionalText.css'], (function (webcomponentsBase, eventStrict, parametersBundle_css$1, parametersBundle_css, query, ResponsivePopover, Theme, Avatar, Button, Icon, Tag, Title, Text, Label, List, ListItemCustom, i18nDefaults, Icons, information, sysEnter2, parametersBundle_css$2, i18nDefaults$1, ValueState, toLowercaseEnumValue, FocusableElements, ListItemBase, AccessibilityTextsHelper, willShowContent, BusyIndicator, ListItemGroup, WrappingType, ListItemAdditionalText_css) { 'use strict';

    function PanelTemplate() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs("div", { class: "ui5-panel-root", role: this.accRole, "aria-label": this.effectiveAccessibleName, "aria-labelledby": this.fixedPanelAriaLabelledbyReference, children: [this.hasHeaderOrHeaderText &&
                        // header: either header or h1 with header text
                        parametersBundle_css.jsx("div", { class: {
                                "ui5-panel-heading-wrapper": true,
                                "ui5-panel-heading-wrapper-sticky": this.stickyHeader,
                            }, role: this.headingWrapperRole, "aria-level": this.headingWrapperAriaLevel, children: parametersBundle_css.jsxs("div", { onClick: this._headerClick, onKeyDown: this._headerKeyDown, onKeyUp: this._headerKeyUp, class: "ui5-panel-header", tabindex: this.headerTabIndex, role: this.accInfo.role, "aria-expanded": this.accInfo.ariaExpanded, "aria-controls": this.accInfo.ariaControls, "aria-labelledby": this.accInfo.ariaLabelledby, part: "header", children: [!this.fixed &&
                                        parametersBundle_css.jsx("div", { class: "ui5-panel-header-button-root", children: this._hasHeader ?
                                                parametersBundle_css.jsx(Button.Button, { design: "Transparent", class: "ui5-panel-header-button ui5-panel-header-button-with-icon", onClick: this._toggleButtonClick, accessibilityAttributes: this.accInfo.button.accessibilityAttributes, tooltip: this.accInfo.button.title, accessibleName: this.accInfo.button.ariaLabelButton, children: parametersBundle_css.jsx("div", { class: "ui5-panel-header-icon-wrapper", children: parametersBundle_css.jsx(Icon.Icon, { class: {
                                                                "ui5-panel-header-icon": true,
                                                                "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                            }, name: ListItemCustom.slimArrowRight }) }) })
                                                : // else
                                                    parametersBundle_css.jsx(Icon.Icon, { class: {
                                                            "ui5-panel-header-button": true,
                                                            "ui5-panel-header-icon": true,
                                                            "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                        }, name: ListItemCustom.slimArrowRight, showTooltip: true, accessibleName: this.toggleButtonTitle }) }), this._hasHeader ?
                                        parametersBundle_css.jsx("slot", { name: "header" })
                                        : // else
                                            parametersBundle_css.jsx("div", { id: `${this._id}-header-title`, class: "ui5-panel-header-title", children: this.headerText })] }) }), parametersBundle_css.jsx("div", { class: "ui5-panel-content", id: `${this._id}-content`, tabindex: -1, style: {
                            display: this._contentExpanded ? "block" : "none",
                        }, part: "content", children: parametersBundle_css.jsx("slot", {}) })] }) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var panelCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:block}:host{font-family:var(--sapFontFamily);background-color:var(--sapGroup_TitleBackground);border-radius:var(--_ui5-v2-15-0_panel_border_radius)}:host(:not([collapsed])){border-bottom:var(--_ui5-v2-15-0_panel_border_bottom)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{min-height:var(--_ui5-v2-15-0_panel_header_height);width:100%;position:relative;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:var(--_ui5-v2-15-0_panel_header_padding_right);font-family:var(--sapFontHeaderFamily);font-size:var(--sapGroup_Title_FontSize);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-header-icon{color:var(--_ui5-v2-15-0_panel_icon_color)}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header]):not([fixed])) .ui5-panel-header{cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--_ui5-v2-15-0_panel_focus_border);border-radius:var(--_ui5-v2-15-0_panel_border_radius);top:var(--_ui5-v2-15-0_panel_focus_offset);bottom:var(--_ui5-v2-15-0_panel_focus_bottom_offset);left:var(--_ui5-v2-15-0_panel_focus_offset);right:var(--_ui5-v2-15-0_panel_focus_offset)}:host(:not([collapsed]):not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{border-radius:var(--_ui5-v2-15-0_panel_border_radius_expanded)}:host(:not([collapsed])) .ui5-panel-header-button:not(.ui5-panel-header-button-with-icon),:host(:not([collapsed])) .ui5-panel-header-icon-wrapper [ui5-icon]{transform:var(--_ui5-v2-15-0_panel_toggle_btn_rotation)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky{position:sticky;top:0;background-color:var(--_ui5-v2-15-0_panel_header_background_color);z-index:100;border-radius:var(--_ui5-v2-15-0_panel_border_radius)}.ui5-panel-header-title{width:calc(100% - var(--_ui5-v2-15-0_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-panel-content{padding:var(--_ui5-v2-15-0_panel_content_padding);background-color:var(--sapGroup_ContentBackground);outline:none;border-bottom-left-radius:var(--_ui5-v2-15-0_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-15-0_panel_border_radius);overflow:auto}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5-v2-15-0_panel_button_root_width);height:var(--_ui5-v2-15-0_panel_button_root_height);padding:var(--_ui5-v2-15-0_panel_header_button_wrapper_padding);box-sizing:border-box}:host([fixed]:not([collapsed]):not([_has-header])) .ui5-panel-header,:host([collapsed]) .ui5-panel-header{border-bottom:.0625rem solid var(--sapGroup_TitleBorderColor)}:host([collapsed]) .ui5-panel-header{border-bottom-left-radius:var(--_ui5-v2-15-0_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-15-0_panel_border_radius)}:host(:not([fixed]):not([collapsed])) .ui5-panel-header{border-bottom:var(--_ui5-v2-15-0_panel_default_header_border)}[ui5-button].ui5-panel-header-button{display:flex;justify-content:center;align-items:center;min-width:initial;height:100%;width:100%}.ui5-panel-header-icon-wrapper{display:flex;justify-content:center;align-items:center}.ui5-panel-header-icon-wrapper,.ui5-panel-header-icon-wrapper .ui5-panel-header-icon{color:inherit}.ui5-panel-header-icon-wrapper,[ui5-button].ui5-panel-header-button-with-icon [ui5-icon]{pointer-events:none}.ui5-panel-root{height:100%;display:flex;flex-direction:column}
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
     * @csspart header - Used to style the wrapper of the header.
     * @csspart content - Used to style the wrapper of the content.
     */
    let Panel = Panel_1 = class Panel extends webcomponentsBase.b {
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
            if (webcomponentsBase.b$1(e)) {
                e.preventDefault();
            }
            if (webcomponentsBase.A(e)) {
                e.preventDefault();
            }
        }
        _headerKeyUp(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            if (webcomponentsBase.b$1(e)) {
                this._toggleOpen();
            }
            if (webcomponentsBase.A(e)) {
                this._toggleOpen();
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
                    animations.push(webcomponentsBase.u(oElement).promise());
                }
                else {
                    animations.push(webcomponentsBase.b$2(oElement).promise());
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
        webcomponentsBase.d()
    ], Panel.prototype, "header", void 0);
    __decorate$2([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Panel, "i18nBundle", void 0);
    Panel = Panel_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-panel",
            fastNavigation: true,
            languageAware: true,
            renderer: parametersBundle_css.y,
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
        return (parametersBundle_css.jsxs("div", { class: "ui5-bar-root", "aria-label": this.accInfo.role && this.accInfo.label, role: this.accInfo.role, part: "bar", children: [parametersBundle_css.jsx("div", { class: "ui5-bar-content-container ui5-bar-startcontent-container", part: "startContent", children: parametersBundle_css.jsx("slot", { name: "startContent" }) }), parametersBundle_css.jsx("div", { class: "ui5-bar-content-container ui5-bar-midcontent-container", part: "midContent", children: parametersBundle_css.jsx("slot", {}) }), parametersBundle_css.jsx("div", { class: "ui5-bar-content-container ui5-bar-endcontent-container", part: "endContent", children: parametersBundle_css.jsx("slot", { name: "endContent" }) })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var BarCss = `:host{background-color:var(--sapPageHeader_Background);height:var(--_ui5-v2-15-0_bar_base_height);width:100%;box-shadow:var(--sapContent_HeaderShadow);display:block}.ui5-bar-root{display:flex;align-items:center;justify-content:space-between;height:100%;width:100%;background-color:inherit;box-shadow:inherit;border-radius:inherit;min-width:0;overflow:hidden}.ui5-bar-root .ui5-bar-startcontent-container,.ui5-bar-root .ui5-bar-endcontent-container,.ui5-bar-root .ui5-bar-midcontent-container{display:flex;align-items:center}.ui5-bar-root .ui5-bar-startcontent-container,.ui5-bar-root .ui5-bar-endcontent-container{flex:0 0 auto}.ui5-bar-root .ui5-bar-midcontent-container{justify-content:center;flex:1 1 auto;padding:0 var(--_ui5-v2-15-0_bar-mid-container-padding-start-end);min-width:0;overflow:hidden}.ui5-bar-root .ui5-bar-startcontent-container{padding-inline-start:var(--_ui5-v2-15-0_bar-start-container-padding-start)}.ui5-bar-root .ui5-bar-content-container{min-width:calc(30% - calc(var(--_ui5-v2-15-0_bar-start-container-padding-start) + var(--_ui5-v2-15-0_bar-end-container-padding-end) + (2*var(--_ui5-v2-15-0_bar-mid-container-padding-start-end))))}.ui5-bar-root.ui5-bar-root-shrinked .ui5-bar-content-container{min-width:0px;overflow:hidden;height:100%}.ui5-bar-root .ui5-bar-endcontent-container{padding-inline-end:var(--_ui5-v2-15-0_bar-end-container-padding-end)}:host([design="Footer"]){background-color:var(--sapPageFooter_Background);border-top:.0625rem solid var(--sapPageFooter_BorderColor);box-shadow:none}:host([design="Subheader"]){height:var(--_ui5-v2-15-0_bar_subheader_height);margin-top:var(--_ui5-v2-15-0_bar_subheader_margin-top)}:host([design="FloatingFooter"]){border-radius:var(--sapElement_BorderCornerRadius);background-color:var(--sapPageFooter_Background);box-shadow:var(--sapContent_Shadow1);border:none}::slotted(*){margin:0 .25rem}
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
    let Bar = class Bar extends webcomponentsBase.b {
        get accInfo() {
            return {
                "label": this.design,
                "role": this.effectiveRole,
            };
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
        webcomponentsBase.d({ type: HTMLElement })
    ], Bar.prototype, "startContent", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], Bar.prototype, "middleContent", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: HTMLElement })
    ], Bar.prototype, "endContent", void 0);
    Bar = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-bar",
            fastNavigation: true,
            renderer: parametersBundle_css.y,
            styles: BarCss,
            template: BarTemplate,
        })
    ], Bar);
    Bar.define();
    var Bar$1 = Bar;

    const name$7 = "person-placeholder";
    const pathData$7 = "M64 512V384q0-26 10-49.5t27.5-41T142 266t50-10h64q-27 0-50-10t-40.5-27.5T138 178t-10-50q0-26 10-49.5t27.5-41T206 10t50-10q26 0 49.5 10t41 27.5 27.5 41 10 49.5q0 27-10 50t-27.5 40.5-41 27.5-49.5 10h64q26 0 49.5 10t41 27.5 27.5 41 10 49.5v128H64zm32-128v96h320v-96q0-40-28-68t-68-28H192q-40 0-68 28t-28 68zm64-256q0 40 28 68t68 28 68-28 28-68-28-68-68-28-68 28-28 68z";
    const ltr$7 = false;
    const collection$7 = "SAP-icons-v4";
    const packageName$7 = "@ui5/webcomponents-icons";

    Icons.y(name$7, { pathData: pathData$7, ltr: ltr$7, collection: collection$7, packageName: packageName$7 });

    const name$6 = "person-placeholder";
    const pathData$6 = "M342 255q48 23 77 67.5t29 99.5v32q0 11-7.5 18.5T422 480H90q-11 0-18.5-7.5T64 454v-32q0-56 29-100t77-67q-20-18-31-42.5T128 160q0-27 10-50t27.5-40.5 41-27.5T256 32t49.5 10.5 41 28T374 111t10 49q0 27-11 52t-31 43zM256 83q-32 0-54.5 22.5T179 160t22.5 54.5T256 237t54.5-22.5T333 160t-22.5-54.5T256 83zm141 339q0-28-10.5-52.5t-29-42.5-43-28.5T262 288h-12q-28 0-52.5 10.5t-43 28.5-29 42.5T115 422v7h282v-7z";
    const ltr$6 = false;
    const collection$6 = "SAP-icons-v5";
    const packageName$6 = "@ui5/webcomponents-icons";

    Icons.y(name$6, { pathData: pathData$6, ltr: ltr$6, collection: collection$6, packageName: packageName$6 });

    var personPlaceholder = "person-placeholder";

    const name$5 = "user-settings";
    const pathData$5 = "M512 512H192v-64q0-27 10-50t27.5-40.5T270 330t50-10h32q-43 0-69.5-27T256 224q0-13 1-14 5-32 27-54t54-27q1-1 14-1 42 0 69 26.5t27 69.5q0 40-28 68t-68 28h32q26 0 49.5 10t41 27.5T502 398t10 50v64zM0 224q0-14 9-23t23-9h28q2-8 5.5-15t6.5-14l-20-20q-9-10-9-23t9-22l46-46q9-9 22-9 14 0 23 9l20 20q7-3 14-6.5t15-5.5V32q0-14 9-23t23-9h64q14 0 23 9t9 23v28q8 2 15 5.5t14 6.5l20-20q9-9 23-9 13 0 22 9l46 46q9 9 9 22t-9 23l-6 5-10-12-12-11 5-5-45-45-23 23q-5-1-8.5-1.5T352 96q-6 0-12 .5T328 98q-1-1-4-1-4-2-6.5-3l-7.5-3-22-8V32h-64v51l-22 8q-2 1-5 1.5t-5 2.5l-15 6-20 10-37-36-45 45 36 37-10 20q-3 6-5.5 12.5T91 202l-8 22H32v64h51l8 22q1 2 2 5t2 5q0 2 2 4 1 3 2 5.5t2 4.5l10 21-36 37 45 45 37-37 9 5q-5 18-6 37l-17 18q-9 9-23 9-13 0-22-9l-46-46q-9-9-9-22.5t9-22.5l20-20q-3-7-6.5-14T60 320H32q-14 0-23-9.5T0 288v-64zm480 256v-32q0-40-28-68t-68-28h-64q-40 0-68 28t-28 68v32h256zM288 224q0 27 18.5 45.5T352 288q26 0 45-19t19-45q0-27-18.5-45.5T352 160q-26 0-45 19t-19 45zm-128 37q0-35 16-59.5t48-36.5l8-2 9-2q-5 8-8.5 16.5T227 194q0 1-.5 2t-.5 3q-1 0-1 .5t-1 .5l-12 9q-11 11-15.5 21.5T192 256q0 4 .5 8t1.5 9q8 25 30 38l4 2 4 2q-4 1-8 5-5 4-9.5 8t-9.5 9q-4-2-7-5t-6-5q-4-3-7-7-13-15-18-27t-7-32z";
    const ltr$5 = false;
    const collection$5 = "SAP-icons-v4";
    const packageName$5 = "@ui5/webcomponents-icons";

    Icons.y(name$5, { pathData: pathData$5, ltr: ltr$5, collection: collection$5, packageName: packageName$5 });

    const name$4 = "user-settings";
    const pathData$4 = "M166.907 396.779q10.994 0 18.49 6.996t7.495 17.99-7.495 18.49-18.49 7.495H25.985q-10.993 0-18.49-7.496T0 421.764v-31.982q0-55.968 28.984-99.944t76.957-66.962q-41.977-38.979-41.977-94.947 0-26.985 10.494-50.472t27.985-40.977T142.92 9.495 191.893 0q26.985 0 49.972 10.494t40.477 27.985 27.485 40.477 9.995 48.973-9.495 48.972-26.985 40.478-40.977 27.984-50.472 10.494h-5.997q-27.984 0-52.47 10.494T90.45 294.835t-28.984 42.477-10.494 52.47v6.997h115.935zm24.986-345.807q-31.982 0-54.47 22.487t-22.487 54.47 22.487 54.47 54.47 22.487q32.982 0 54.97-22.988t21.987-53.97q0-31.982-22.487-54.469t-54.47-22.487zm310.826 340.81q4.998 1.998 7.496 5.996t1.5 8.995l-3.998 16.99q-2 9.995-11.994 9.995l-27.984-3.998q-5.997 11.993-15.991 21.988l-6.996 6.996 9.994 26.985q0 1 .5 1.999t.5 1.999q0 8.995-7.996 11.993l-14.991 7.996q-2 0-2.5.5t-2.498.499q-7.995 0-10.994-6.996l-14.991-25.986q-4.997 1-8.995 1.5t-8.995.5q-3.998 0-7.496-.5t-8.495-.5l-14.992 26.985q-2.998 5.996-10.994 5.996-3.998 0-5.996-.999l-14.992-7.996q-6.996-2.998-6.996-10.993 0-3.998 1-4.998l9.994-26.985q-7.996-4.997-13.493-11.993t-10.494-14.991l-27.984 3.997q-10.994 0-12.993-9.994l-3.998-19.989q0-9.994 8.995-11.993l22.987-7.996q0-21.988 6.996-39.978l-16.99-15.99q-3.998-3.998-3.998-9.995 0-3.998 2.999-7.996l9.994-12.992q4.997-4.998 9.994-4.998 2.999 0 6.996 2l18.99 12.992q7.995-6.996 16.99-11.493t18.99-7.496l1.999-22.987q1.999-11.994 12.992-11.994h16.99q4.998 0 8.496 3.498t3.498 8.496l2 21.987q21.987 4.997 37.978 17.99l18.99-12.993q3.997-1.998 6.995-1.998 4.998 0 9.995 4.997l9.994 12.993q2.999 3.997 2.999 7.995 0 5.997-3.998 9.995l-15.991 14.991q7.995 20.988 7.995 40.977zm-163.908-7.996q0 18.99 12.993 31.982t31.982 12.993 31.982-12.993 12.993-31.982-12.993-31.982-31.982-12.993-31.982 12.993-12.993 31.982z";
    const ltr$4 = false;
    const collection$4 = "SAP-icons-v5";
    const packageName$4 = "@ui5/webcomponents-icons";

    Icons.y(name$4, { pathData: pathData$4, ltr: ltr$4, collection: collection$4, packageName: packageName$4 });

    var userSettings = "user-settings";

    const name$3 = "log";
    const pathData$3 = "M352 86q57 27 92.5 81T480 288q0 47-17.5 87.5t-48 71-71.5 48-87 17.5q-47 0-87.5-17.5t-71-48-48-71T32 288q0-67 35.5-121T160 86v36q-43 25-69.5 68.5T64 288q0 40 15 75t41 61 61 41 75 15 75-15 61-41 41-61 15-75q0-54-26.5-97.5T352 122V86zm-96 202q-14 0-23-9t-9-23V32q0-13 9-22.5T256 0q13 0 22.5 9.5T288 32v224q0 14-9.5 23t-22.5 9z";
    const ltr$3 = false;
    const collection$3 = "SAP-icons-v4";
    const packageName$3 = "@ui5/webcomponents-icons";

    Icons.y(name$3, { pathData: pathData$3, ltr: ltr$3, collection: collection$3, packageName: packageName$3 });

    const name$2 = "log";
    const pathData$2 = "M256 256q-11 0-18.5-7.5T230 230V26q0-11 7.5-18.5T256 0t18.5 7.5T282 26v204q0 11-7.5 18.5T256 256zm0 256q-53 0-100-20t-81.5-54.5T20 356 0 256q0-67 31-125t82-90q9-6 13.5-7.5T134 32q11 0 18.5 7.5T160 58q0 13-12 21-46 29-71.5 76T51 256q0 43 16 80t44 65 65 44 80 16 80.5-16 65-44 43.5-65 16-80q0-54-26-101t-71-76q-12-8-12-21 0-11 7.5-18.5T378 32q3 0 7.5 1.5T399 41q51 32 82 90t31 126q0 53-20 99.5t-54.5 81T356 492t-100 20z";
    const ltr$2 = false;
    const collection$2 = "SAP-icons-v5";
    const packageName$2 = "@ui5/webcomponents-icons";

    Icons.y(name$2, { pathData: pathData$2, ltr: ltr$2, collection: collection$2, packageName: packageName$2 });

    var log = "log";

    const name$1 = "user-edit";
    const pathData$1 = "M151.25 384H.25v-64q0-26 10-49.5t27.5-41 40.5-27.5 50-10h32q-40 0-68-28t-28-68 28-68 68-28 68 28 28 68-28 68-68 28h32q31 0 57 14t44 37l-23 22q-13-19-33.5-30t-44.5-11h-64q-40 0-68 28t-28 68v32h151zm-9 128q2-4 8-20t12-34q4-10 7.5-21t8.5-24l261-260q5-5 11-5t11 5l45 45q11 11 0 22l-260 261q-1 1-17 6t-36 10q-22 8-51 15zm18-352q26 0 45-19t19-45-19-45-45-19q-27 0-45.5 19t-18.5 45 18.5 45 45.5 19zm45 271l23 22 181-181-22-22zm204-204l23 23 40-41-22-22z";
    const ltr$1 = false;
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

    const name = "user-edit";
    const pathData = "M70 397q11 0 18.5 7t7.5 18-7.5 18.5T70 448H26q-11 0-18.5-7.5T0 422v-32q0-55 29-99.5t77-67.5l-4-5q-19-18-28.5-41T64 128q0-27 10.5-50.5t28-41 40.5-27T192 0q27 0 50 10.5t40.5 28T310 79t10 49-9.5 49-27 40.5-41 28T192 256h-6q-28 0-52.5 10.5t-43 28.5-29 42.5T51 390v7h19zM192 51q-32 0-54.5 22.5T115 128t22.5 54.5T192 205q33 0 55-23t22-54q0-32-22.5-54.5T192 51zm313 161q7 7 7 18t-7 18l-25 26q-8 8-19 8-10 0-18-8l-50-51q-7-7-7-18t7-18l25-26q7-7 18-7 12 0 19 7zm-75 77q7 9 7 18t-7 18L254 504q-8 8-18 8h-50q-11 0-18.5-7.5T160 486v-51q0-9 7-18l176-179q8-8 18-8 12 0 18 8zm-55 18l-14-14-150 153v15h14z";
    const ltr = false;
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, collection, packageName });

    var userEdit = "user-edit";

    function UserMenuTemplate() {
        return (parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { id: "user-menu-rp", class: "ui5-user-menu-rp", placement: "Bottom", verticalAlign: "Bottom", horizontalAlign: "End", tabindex: -1, accessibleName: this.accessibleNameText, "aria-labelledby": this.accessibleNameText, open: this.open, opener: this.opener, onClose: this._handlePopoverAfterClose, onOpen: this._handlePopoverAfterOpen, onScroll: this._handleScroll, children: [parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsxs(Bar$1, { class: {
                                "ui5-user-menu-fixed-header": true,
                                "ui5-user-menu-rp-scrolled": this._isScrolled || this._titleMovedToHeader
                            }, slot: "header", children: [this._titleMovedToHeader &&
                                    parametersBundle_css.jsx(Title.Title, { level: "H1", wrappingType: "None", children: this._selectedAccount.titleText }), this._isPhone && parametersBundle_css.jsx(Button.Button, { icon: information.decline, design: "Transparent", accessibleName: this._closeDialogAriaLabel, onClick: this._closeUserMenu, slot: "endContent" })] }), parametersBundle_css.jsx("div", { class: "ui5-user-menu-header", children: headerContent.call(this) })] }), this.showOtherAccounts &&
                    parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: otherAccountsContent.call(this) }), this.menuItems.length > 0 &&
                    parametersBundle_css.jsx(List.List, { id: "ui5-user-menu-list", class: "ui5-user-menu-list", selectionMode: "None", separators: "None", accessibleRole: "Menu", onItemClick: this._handleMenuItemClick, "onui5-close-menu": this._handleMenuItemClose, children: parametersBundle_css.jsx("slot", {}) }), parametersBundle_css.jsx("div", { slot: "footer", class: "ui5-user-menu-footer", children: parametersBundle_css.jsx(Button.Button, { class: "ui5-user-menu-sign-out-btn", design: "Transparent", icon: log, onClick: this._handleSignOutClick, children: this._signOutButtonText }) })] }));
    }
    function headerContent() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this._selectedAccount &&
                parametersBundle_css.jsxs("div", { class: "ui5-user-menu-selected-account", "aria-labelledby": this._ariaLabelledByAccountInformationText, children: [parametersBundle_css.jsxs(Avatar, { size: "L", onClick: this._handleAvatarClick, initials: this._selectedAccount._initials, fallbackIcon: personPlaceholder, class: "ui5-user-menu--selected-account-avatar", interactive: true, children: [this._selectedAccount.avatarSrc &&
                                    parametersBundle_css.jsx("img", { src: this._selectedAccount.avatarSrc }), this.showEditButton &&
                                    parametersBundle_css.jsx(Tag.Tag, { slot: "badge", wrappingType: "None", design: "Set1", colorScheme: "5", title: this._editAvatarTooltip, children: parametersBundle_css.jsx(Icon.Icon, { slot: "icon", name: ListItemCustom.edit }) })] }), this._selectedAccount.titleText &&
                            parametersBundle_css.jsx(Text.Text, { maxLines: 2, id: "selected-account-title", class: "ui5-user-menu-selected-account-title", children: this._selectedAccount.titleText }), this._selectedAccount.subtitleText &&
                            parametersBundle_css.jsx(Text.Text, { maxLines: 1, class: "ui5-user-menu-selected-account-subtitleText", children: this._selectedAccount.subtitleText }), this._selectedAccount.description &&
                            parametersBundle_css.jsx(Text.Text, { maxLines: 1, class: "ui5-user-menu-selected-account-description", children: this._selectedAccount.description }), this.showManageAccount &&
                            parametersBundle_css.jsx(Button.Button, { id: "selected-account-manage-btn", icon: userSettings, class: "ui5-user-menu-manage-account-btn", onClick: this._handleManageAccountClick, children: this._manageAccountButtonText })] }) }));
    }
    function otherAccountsContent() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs(Panel$1, { collapsed: true, class: "ui5-user-menu-other-accounts", "aria-labelledby": this._otherAccountsButtonText, children: [parametersBundle_css.jsxs("div", { slot: "header", class: "ui5-user-menu-account-header", children: [parametersBundle_css.jsxs(Title.Title, { slot: "header", level: "H4", "wrapping-type": "None", children: [this._otherAccountsButtonText, " (", this._otherAccounts.length, ")"] }), this.showEditAccounts &&
                                parametersBundle_css.jsx(Button.Button, { slot: "header", class: "ui5-user-menu-add-account-btn", design: "Transparent", icon: userEdit, onClick: this._handleEditAccountsClick, tooltip: this._editAccountsTooltip })] }), this._otherAccounts.length > 0 &&
                        parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: otherAccountsList.call(this) })] }) }));
    }
    function otherAccountsList() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsx(List.List, { onItemClick: this._handleAccountSwitch, "aria-labelledby": this._ariaLabelledByActions, loadingDelay: 0, loading: this._otherAccounts.some(account => account.loading === true), children: this._otherAccounts.map((account, index) => parametersBundle_css.jsx(ListItemCustom.ListItemCustom, { ref: this.captureRef.bind(account), "aria-labelledby": account.titleText, "aria-possition": index + 1, "aria-setsize": this._otherAccounts.length, "aria-dectiption": this.getAccountDescriptionText(account), children: parametersBundle_css.jsxs("div", { class: "ui5-user-menu-other-accounts-content", children: [parametersBundle_css.jsx(Avatar, { slot: "image", size: "S", initials: account._initials, fallbackIcon: personPlaceholder, children: account.avatarSrc &&
                                    parametersBundle_css.jsx("img", { src: account.avatarSrc }) }), parametersBundle_css.jsxs("div", { class: "ui5-user-menu-other-accounts-info", children: [account.titleText &&
                                        parametersBundle_css.jsx(Title.Title, { class: "ui5-user-menu-other-accounts-title", "wrapping-type": "None", children: account.titleText }), account.subtitleText &&
                                        parametersBundle_css.jsx(Label, { class: "ui5-user-menu-other-accounts-additional-info", "wrapping-type": "None", children: account.subtitleText }), account.description &&
                                        parametersBundle_css.jsx(Label, { class: "ui5-user-menu-other-accounts-additional-info", "wrapping-type": "None", children: account.description })] }), parametersBundle_css.jsx("div", { children: account.selected &&
                                    parametersBundle_css.jsx(Icon.Icon, { part: "icon", name: sysEnter2.selectedAccount, class: "ui5-user-menu-selected-account-icon", mode: "Decorative" }) })] }) })) }) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme);
    var UserMenuCss = `.ui5-user-menu-rp{width:20rem}.ui5-user-menu-rp::part(content),.ui5-user-menu-rp::part(footer){padding-inline:.5rem}.ui5-user-menu-rp::part(header){box-shadow:none;padding:0}.ui5-user-menu-header{display:flex;flex-direction:column}[on-phone] .ui5-user-menu-header{padding-inline:0}.ui5-user-menu-fixed-header:not(.ui5-user-menu-rp-scrolled){box-shadow:none}.ui5-user-menu-fixed-header::part(startContent),.ui5-user-menu-fixed-header::part(endContent){padding:0}.ui5-user-menu-fixed-header [ui5-button]{margin-inline:.5rem;font-family:var(--sapFontSemiboldDuplexFamily)}.ui5-user-menu-rp::part(content){padding-top:0;padding-bottom:.5rem}.ui5-user-menu-rp::part(footer){padding-block:.5rem}.ui5-user-menu-selected-account{display:flex;align-items:center;flex-direction:column;margin-block-end:.5rem;overflow:hidden}.ui5-user-menu--selected-account-avatar{margin-block-start:.25rem;margin-block-end:.5rem}.ui5-user-menu-selected-account-title{margin-block:.25rem;font-family:var(--sapFontBoldFamily);font-size:var(--sapFontLargeSize);color:var(--sapTextColor)}.ui5-user-menu-selected-account-subtitleText{margin-bottom:.25rem;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor)}.ui5-user-menu-selected-account-description{font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor)}.ui5-user-menu-manage-account-btn{font-family:var(--sapFontSemiboldDuplexFamily);margin-block-start:1rem}.ui5-user-menu-sign-out-btn{font-family:var(--sapFontSemiboldDuplexFamily)}.ui5-user-menu-other-accounts{margin-block-end:.5rem}.ui5-user-menu-other-accounts::part(header){border-bottom-left-radius:0;border-bottom-right-radius:0}.ui5-user-menu-other-accounts::part(content){padding:0}.ui5-user-menu-other-accounts-content{display:flex;align-items:center;width:100%;height:4.5rem;gap:12px}.ui5-user-menu-other-accounts-info{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:4px;align-self:stretch;width:100%;overflow:hidden}.ui5-user-menu-other-accounts-title{overflow:hidden;color:var(--sapList_TextColor);text-overflow:ellipsis;font-family:var(--sapFontBoldFamily);font-size:var(--sapFontSize);font-style:normal;line-height:normal}.ui5-user-menu-other-accounts-additional-info{overflow:hidden;color:var(--sapContent_LabelColor);text-overflow:ellipsis;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-style:normal;line-height:normal}.ui5-user-menu-selected-account-icon{display:flex;width:18px;align-items:center;align-self:stretch;color:var(--sapContent_NonInteractiveIconColor);font-family:var(--_ui5-v2-15-0_slider_handle_font_family);font-size:1.125rem}.ui5-user-menu-account-header{display:flex;flex:1;justify-content:space-between;align-items:center}.ui5-user-menu-footer{display:flex;flex:1;justify-content:flex-end;align-items:center}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var UserMenu_1;
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
     * @experimental
     * @public
     * @since 2.5.0
     */
    let UserMenu = UserMenu_1 = class UserMenu extends webcomponentsBase.b {
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
        }
        onAfterRendering() {
            if (this._responsivePopover) {
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
            const item = e.detail.item; // imrove: improve this ideally without "as" cating
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
                this._openItemSubMenu(item);
            }
        }
        _handleMenuItemClose() {
            this._closeUserMenu();
        }
        _handlePopoverAfterOpen() {
            this.fireDecoratorEvent("open");
        }
        _handlePopoverAfterClose() {
            this.open = false;
            this.fireDecoratorEvent("close");
        }
        _openItemSubMenu(item) {
            if (!item._popover || item._popover.open) {
                return;
            }
            item._popover.opener = item;
            item._popover.open = true;
            item.selected = true;
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
        getAccountDescriptionText(account) {
            return `${account.subtitleText} ${account.description} ${account.selected ? UserMenu_1.i18nBundle.getText(i18nDefaults$1.USER_MENU_POPOVER_ACCESSIBLE_ACCOUNT_SELECTED_TXT) : ""}`;
        }
        getAccountByRefId(refId) {
            return this.accounts.find(account => account._id === refId);
        }
        captureRef(ref) {
            if (ref) {
                ref.associatedAccount = this;
            }
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
        parametersBundle_css$1.i("@ui5/webcomponents-fiori")
    ], UserMenu, "i18nBundle", void 0);
    UserMenu = UserMenu_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-menu",
            languageAware: true,
            renderer: parametersBundle_css.y,
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
