sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/query', 'sap/f/thirdparty/Popover', 'sap/f/thirdparty/MenuItem2', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/Avatar2', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/user-settings', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/Text', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/List', 'sap/f/thirdparty/ListItemCustom', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/edit', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/sys-enter-2', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/information', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/nav-back', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/WrappingType'], (function (webcomponentsBase, eventStrict, parametersBundle_css$1, parametersBundle_css, query, Popover, MenuItem, ManagedStyles, Avatar, Button, Icon, userSettings, Title, Text, Label, List, ListItemCustom, ListItemTemplate, i18nDefaults, AccessibilityTextsHelper, ResponsivePopover, edit, Icons, decline, sysEnter2, parametersBundle_css$2, i18nDefaults$1, ValueState, toLowercaseEnumValue, FocusableElements, ListItemBase, information, InvisibleMessage, navBack, willShowContent, ListItemGroup, WrappingType) { 'use strict';

    function PanelTemplate() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs("div", { class: "ui5-panel-root", role: this.accRole, "aria-label": this.effectiveAccessibleName, "aria-labelledby": this.fixedPanelAriaLabelledbyReference, children: [this.hasHeaderOrHeaderText &&
                        // header: either header or h1 with header text
                        parametersBundle_css.jsx("div", { class: {
                                "ui5-panel-heading-wrapper": true,
                                "ui5-panel-heading-wrapper-sticky": this.stickyHeader,
                            }, role: this.headingWrapperRole, "aria-level": this.headingWrapperAriaLevel, part: "header-wrapper", children: parametersBundle_css.jsxs("div", { onClick: this._headerClick, onKeyDown: this._headerKeyDown, onKeyUp: this._headerKeyUp, onTouchStart: this._isMobile, onFocusOut: this._headerFocusOut, class: "ui5-panel-header", tabindex: this.headerTabIndex, role: this.accInfo.role, "aria-expanded": this.accInfo.ariaExpanded, "aria-controls": this.accInfo.ariaControls, "aria-labelledby": this.accInfo.ariaLabelledby, part: "header", children: [!this.fixed &&
                                        parametersBundle_css.jsx("div", { class: "ui5-panel-header-button-root", children: this._hasHeader ?
                                                parametersBundle_css.jsx(Button.Button, { design: "Transparent", class: "ui5-panel-header-button ui5-panel-header-button-with-icon", onClick: this._toggleButtonClick, accessibilityAttributes: this.accInfo.button.accessibilityAttributes, tooltip: this.accInfo.button.title, accessibleName: this.accInfo.button.ariaLabelButton, children: parametersBundle_css.jsx("div", { class: "ui5-panel-header-icon-wrapper", children: parametersBundle_css.jsx(Icon.Icon, { class: {
                                                                "ui5-panel-header-icon": true,
                                                                "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                            }, name: ListItemTemplate.slimArrowRight }) }) })
                                                : // else
                                                    parametersBundle_css.jsx(Icon.Icon, { class: {
                                                            "ui5-panel-header-button": true,
                                                            "ui5-panel-header-icon": true,
                                                            "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                        }, name: ListItemTemplate.slimArrowRight, showTooltip: true, accessibleName: this.toggleButtonTitle }) }), this._hasHeader ?
                                        parametersBundle_css.jsx("slot", { name: "header" })
                                        : // else
                                            parametersBundle_css.jsx("div", { id: `${this._id}-header-title`, class: "ui5-panel-header-title", children: this.headerText })] }) }), parametersBundle_css.jsx("div", { class: "ui5-panel-content", id: `${this._id}-content`, tabindex: -1, style: {
                            display: this._contentExpanded ? "block" : "none",
                        }, part: "content", children: parametersBundle_css.jsx("slot", {}) })] }) }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
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
            return this.noAnimation || ManagedStyles.m$3() === ManagedStyles.u.None;
        }
        _isMobile() {
            if (ManagedStyles.l$1()) {
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
            if (webcomponentsBase.b$1(e)) {
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
            if (webcomponentsBase.b$1(e)) {
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
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Panel.prototype, "_pendingToggle", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "_touched", void 0);
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
        return (parametersBundle_css.jsxs("div", { class: "ui5-bar-root", "aria-label": this.accInfo.label, role: this.accInfo.role, part: "bar", children: [parametersBundle_css.jsx("div", { class: "ui5-bar-content-container ui5-bar-startcontent-container", part: "startContent", children: parametersBundle_css.jsx("slot", { name: "startContent" }) }), parametersBundle_css.jsx("div", { class: "ui5-bar-content-container ui5-bar-midcontent-container", part: "midContent", children: parametersBundle_css.jsx("slot", {}) }), parametersBundle_css.jsx("div", { class: "ui5-bar-content-container ui5-bar-endcontent-container", part: "endContent", children: parametersBundle_css.jsx("slot", { name: "endContent" }) })] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var BarCss = `:host{background-color:var(--sapPageHeader_Background);height:var(--_ui5_bar_base_height);width:100%;box-shadow:var(--sapContent_HeaderShadow);display:block}.ui5-bar-root{display:flex;align-items:center;justify-content:space-between;height:100%;width:100%;background-color:inherit;box-shadow:inherit;border-radius:inherit;min-width:0;overflow-x:clip;overflow-y:visible}.ui5-bar-root .ui5-bar-startcontent-container,.ui5-bar-root .ui5-bar-endcontent-container,.ui5-bar-root .ui5-bar-midcontent-container{display:flex;align-items:center}.ui5-bar-root .ui5-bar-startcontent-container{flex:0 1 auto}.ui5-bar-root .ui5-bar-endcontent-container{flex:0 0 auto}.ui5-bar-root .ui5-bar-midcontent-container{justify-content:center;flex:1 1 auto;padding:0 var(--_ui5_bar-mid-container-padding-start-end);min-width:0;overflow-x:clip;overflow-y:visible}.ui5-bar-root .ui5-bar-startcontent-container{padding-inline-start:var(--_ui5_bar-start-container-padding-start)}.ui5-bar-root .ui5-bar-content-container{min-width:calc(30% - calc(var(--_ui5_bar-start-container-padding-start) + var(--_ui5_bar-end-container-padding-end) + (2*var(--_ui5_bar-mid-container-padding-start-end))))}.ui5-bar-root.ui5-bar-root-shrinked .ui5-bar-content-container{min-width:0px;overflow-x:clip;overflow-y:visible;height:100%}.ui5-bar-root .ui5-bar-endcontent-container{padding-inline-end:var(--_ui5_bar-end-container-padding-end)}:host([design="Footer"]){background-color:var(--sapPageFooter_Background);border-top:.0625rem solid var(--sapPageFooter_BorderColor);box-shadow:none}:host([design="Subheader"]){height:var(--_ui5_bar_subheader_height);margin-top:var(--_ui5_bar_subheader_margin-top)}:host([design="FloatingFooter"]){border-radius:var(--sapElement_BorderCornerRadius);background-color:var(--sapPageFooter_Background);box-shadow:var(--sapContent_Shadow1);border:none}::slotted(*:not([hidden]):not([ui5-button])){margin:0 .25rem;display:inline-block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}::slotted([ui5-button]){margin:0 .25rem;--_ui5_button_overlay_badge_offset: -.25rem}@container style(--ui5_content_density: compact){::slotted([ui5-button]){--_ui5_button_overlay_badge_offset: initial}}
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
             * - By default, accessibleRole is set to "Toolbar", which renders the ARIA role "toolbar".
             *
             * - Use the default accessibleRole value "Toolbar" only when the component contains two or more active, interactive elements (such as buttons, links, or input fields) within the bar.
             *
             * - If there is only one or no active element, set accessibleRole to "None" to avoid rendering the ARIA role "toolbar", as that role implies a grouping of multiple interactive controls.
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
            renderer: parametersBundle_css.y,
            styles: BarCss,
            template: BarTemplate,
        })
    ], Bar);
    Bar.define();
    var Bar$1 = Bar;

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
        return (parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { id: "user-menu-rp", class: "ui5-user-menu-rp", placement: "Bottom", verticalAlign: "Bottom", horizontalAlign: "End", tabindex: -1, accessibleName: this.accessibleNameText, "aria-label": this.accessibleNameText, open: this.open, opener: this.opener, onClose: this._handlePopoverAfterClose, onOpen: this._handlePopoverAfterOpen, onScroll: this._handleScroll, children: [parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsxs(Bar$1, { class: {
                                "ui5-user-menu-fixed-header": true,
                                "ui5-user-menu-rp-scrolled": this._isScrolled || this._titleMovedToHeader
                            }, slot: "header", "accessible-name": this._ariaLabelledByAccountInformationText, children: [this._titleMovedToHeader &&
                                    parametersBundle_css.jsx(Title.Title, { level: "H1", wrappingType: "None", children: this._selectedAccount.titleText }), this._isPhone && parametersBundle_css.jsx(Button.Button, { icon: decline.declineIcon, design: "Transparent", accessibleName: this._closeDialogAriaLabel, onClick: this._closeUserMenu, slot: "endContent" })] }), parametersBundle_css.jsx("div", { class: "ui5-user-menu-header", children: headerContent.call(this) })] }), this.showOtherAccounts &&
                    parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: otherAccountsContent.call(this) }), this.menuItems.length > 0 &&
                    parametersBundle_css.jsx(List.List, { id: "ui5-user-menu-list", class: "ui5-user-menu-list", selectionMode: "None", separators: "None", accessibleRole: "Menu", accessibleName: this._ariaLabelledByActions, onItemClick: this._handleMenuItemClick, onMouseOver: this._itemMouseOver, "onui5-close-menu": this._handleMenuItemClose, children: parametersBundle_css.jsx("slot", {}) }), this._hasCustomFooter &&
                    parametersBundle_css.jsx("div", { slot: "footer", class: "ui5-user-menu-footer", children: parametersBundle_css.jsx("slot", { name: "footer" }) }), this._showDefaultFooter &&
                    parametersBundle_css.jsx("div", { slot: "footer", class: "ui5-user-menu-footer", children: parametersBundle_css.jsx(Button.Button, { class: "ui5-user-menu-sign-out-btn", design: "Transparent", icon: log, onClick: this._handleSignOutClick, children: this._signOutButtonText }) })] }));
    }
    function headerContent() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this._selectedAccount &&
                parametersBundle_css.jsxs("div", { class: "ui5-user-menu-selected-account", children: [parametersBundle_css.jsx("span", { title: this.showEditButton ? this._editAvatarTooltip : undefined, children: parametersBundle_css.jsxs(Avatar.Avatar, { size: "L", onClick: this._isAvatarInteractive ? this._handleAvatarClick : undefined, initials: this._selectedAccount._initials, colorScheme: this._selectedAccount.avatarColorScheme, fallbackIcon: userSettings.personPlaceholder, class: "ui5-user-menu-selected-account-avatar", mode: this._isAvatarInteractive ? "Interactive" : "Image", children: [this._selectedAccount.avatarSrc &&
                                        parametersBundle_css.jsx("img", { src: this._selectedAccount.avatarSrc }), this.showEditButton &&
                                        parametersBundle_css.jsx(userSettings.AvatarBadge, { slot: "badge", icon: edit.edit })] }) }), this._selectedAccount.titleText &&
                            parametersBundle_css.jsx(Text.Text, { id: "selected-account-title", class: "ui5-user-menu-selected-account-title", children: this._selectedAccount.titleText }), this._selectedAccount.subtitleText &&
                            parametersBundle_css.jsx(Text.Text, { class: "ui5-user-menu-selected-account-subtitleText", children: this._selectedAccount.subtitleText }), this._selectedAccount.description &&
                            parametersBundle_css.jsx(Text.Text, { class: "ui5-user-menu-selected-account-description", children: this._selectedAccount.description }), this._selectedAccount.additionalInfo &&
                            parametersBundle_css.jsx(Text.Text, { class: "ui5-user-menu-selected-account-additional-info", children: this._selectedAccount.additionalInfo }), this._hasInfoArea &&
                            parametersBundle_css.jsx("div", { class: "ui5-user-menu-info-area", children: parametersBundle_css.jsx("slot", { name: "infoArea" }) }), this.showManageAccount &&
                            parametersBundle_css.jsx(Button.Button, { id: "selected-account-manage-btn", icon: userSettings.userSettings, class: "ui5-user-menu-manage-account-btn", onClick: this._handleManageAccountClick, children: this._manageAccountButtonText })] }) }));
    }
    function otherAccountsContent() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs(Panel$1, { collapsed: true, class: "ui5-user-menu-other-accounts", accessibleName: `${this._otherAccountsButtonText} (${this._otherAccounts.length})`, children: [parametersBundle_css.jsxs("div", { slot: "header", class: "ui5-user-menu-account-header", children: [parametersBundle_css.jsxs(Title.Title, { slot: "header", level: "H4", "wrapping-type": "None", children: [this._otherAccountsButtonText, " (", this._otherAccounts.length, ")"] }), this.showEditAccounts &&
                                parametersBundle_css.jsx(Button.Button, { slot: "header", class: "ui5-user-menu-add-account-btn", design: "Transparent", icon: userEdit, onClick: this._handleEditAccountsClick, tooltip: this._editAccountsTooltip })] }), this._otherAccounts.length > 0 &&
                        parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: otherAccountsList.call(this) })] }) }));
    }
    function otherAccountsList() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsx(List.List, { onItemClick: this._handleAccountSwitch, loadingDelay: 0, accessibleName: `${this._otherAccountsButtonText} (${this._otherAccounts.length})`, loading: this._otherAccounts.some(account => account.loading === true), children: this._otherAccounts.map((account, index) => parametersBundle_css.jsx(ListItemCustom.ListItemCustom, { ref: this.captureRef.bind(account), accessibilityAttributes: {
                        "ariaPosinset": index + 1,
                        "ariaSetsize": this._otherAccounts.length
                    }, accessibleName: this.getAccountDescriptionText(account), children: parametersBundle_css.jsxs("div", { class: "ui5-user-menu-other-accounts-content", children: [parametersBundle_css.jsx(Avatar.Avatar, { slot: "image", size: "S", initials: account._initials, fallbackIcon: userSettings.personPlaceholder, colorScheme: account.avatarColorScheme, children: account.avatarSrc &&
                                    parametersBundle_css.jsx("img", { src: account.avatarSrc }) }), parametersBundle_css.jsxs("div", { class: "ui5-user-menu-other-accounts-info", children: [account.titleText &&
                                        parametersBundle_css.jsx(Title.Title, { class: "ui5-user-menu-other-accounts-title", children: account.titleText }), account.subtitleText &&
                                        parametersBundle_css.jsx(Label, { class: "ui5-user-menu-other-accounts-additional-info", children: account.subtitleText }), account.description &&
                                        parametersBundle_css.jsx(Label, { class: "ui5-user-menu-other-accounts-additional-info", children: account.description })] }), parametersBundle_css.jsx("div", { children: account.selected &&
                                    parametersBundle_css.jsx(Icon.Icon, { part: "icon", name: sysEnter2.selectedAccount, class: "ui5-user-menu-selected-account-icon", mode: "Decorative" }) })] }) })) }) }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme, "host");
    var UserMenuCss = `.ui5-user-menu-rp{width:20rem}.ui5-user-menu-rp::part(content),.ui5-user-menu-rp::part(footer){padding-inline:.5rem}.ui5-user-menu-rp::part(header){box-shadow:none;padding:0}.ui5-user-menu-rp::part(header):before{display:none}.ui5-user-menu-rp{--_ui5_popup_header_shadow: none}.ui5-user-menu-header{display:flex;flex-direction:column}[on-phone] .ui5-user-menu-header{padding-inline:0}.ui5-user-menu-fixed-header:not(.ui5-user-menu-rp-scrolled){box-shadow:none}.ui5-user-menu-fixed-header::part(bar){position:relative}.ui5-user-menu-fixed-header::part(startContent),.ui5-user-menu-fixed-header::part(endContent){padding:0}.ui5-user-menu-fixed-header::part(midContent){position:absolute;left:50%;transform:translate(-50%);justify-content:center;pointer-events:none}.ui5-user-menu-fixed-header [ui5-button]{margin-inline:.5rem;font-family:var(--sapFontSemiboldDuplexFamily)}.ui5-user-menu-rp::part(content){padding-top:0;padding-bottom:.5rem}.ui5-user-menu-selected-account{display:flex;align-items:center;flex-direction:column;margin-block-end:.5rem;overflow:hidden}.ui5-user-menu-selected-account-avatar{margin-block-start:.25rem;margin-block-end:.5rem}.ui5-user-menu-avatar-img{object-fit:cover}.ui5-user-menu-selected-account-title{text-align:center;margin-block:.25rem;font-family:var(--sapFontSemiboldDuplexFamily);font-size:var(--sapFontLargeSize);color:var(--sapTextColor)}.ui5-user-menu-selected-account-subtitleText{text-align:center;margin-bottom:.25rem;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor)}.ui5-user-menu-selected-account-description{text-align:center;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor)}.ui5-user-menu-selected-account-additional-info{margin-top:.25rem;text-align:center;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapContent_LabelColor)}.ui5-user-menu-manage-account-btn{font-family:var(--sapFontSemiboldDuplexFamily);margin-block-start:1rem}.ui5-user-menu-sign-out-btn{font-family:var(--sapFontSemiboldDuplexFamily)}.ui5-user-menu-other-accounts{margin-block-end:.5rem}.ui5-user-menu-other-accounts::part(header){border-bottom-left-radius:0;border-bottom-right-radius:0}.ui5-user-menu-other-accounts::part(content){padding:0}.ui5-user-menu-other-accounts-content{display:flex;align-items:center;width:100%;min-height:4.5rem;gap:12px}.ui5-user-menu-other-accounts-info{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:4px;align-self:stretch;width:100%;overflow:hidden}.ui5-user-menu-other-accounts-title{overflow:hidden;color:var(--sapList_TextColor);text-overflow:ellipsis;font-family:var(--sapFontSemiboldDuplexFamily);font-size:var(--sapFontSize);font-style:normal;line-height:normal}.ui5-user-menu-other-accounts-additional-info{overflow:hidden;color:var(--sapContent_LabelColor);text-overflow:ellipsis;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-style:normal;line-height:normal}.ui5-user-menu-selected-account-icon{display:flex;width:18px;align-items:center;align-self:stretch;color:var(--sapContent_NonInteractiveIconColor);font-family:var(--_ui5_slider_handle_font_family);font-size:1.125rem}.ui5-user-menu-account-header{display:flex;flex:1;justify-content:space-between;align-items:center}.ui5-user-menu-footer{display:flex;flex:1;justify-content:flex-end;align-items:center}.ui5-user-menu-info-area{display:flex;flex-direction:column;align-self:stretch;margin-block:.5rem;padding:.5rem;margin-inline:-.5rem}.ui5-user-menu-selected-account-subtitleText:has(+.ui5-user-menu-info-area){margin-bottom:0}.ui5-user-menu-info-area+.ui5-user-menu-manage-account-btn{margin-block-start:0}
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
             * Defines whether the avatar of the selected account is interactive (focusable and pressable).
             *
             * When `false` (default), the avatar is rendered as a non-interactive image
             * and is not announced as a button by screen readers.
             *
             * **Note:** When `showEditButton` is set to `true`, the avatar is treated as interactive
             * regardless of this property's value, to preserve the edit affordance.
             *
             * @default false
             * @public
             * @since 2.24.0
             */
            this.avatarInteractive = false;
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
            return ManagedStyles.d();
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
            this._menuItems[0]?.getFocusDomRef()?.focus();
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
            if (!ManagedStyles.f$1()) {
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
        get _hasInfoArea() {
            return this.infoArea.length > 0;
        }
        get _isAvatarInteractive() {
            return this.avatarInteractive || this.showEditButton;
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
        webcomponentsBase.s({ converter: Popover.e })
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
        webcomponentsBase.s({ type: Boolean })
    ], UserMenu.prototype, "avatarInteractive", void 0);
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
        webcomponentsBase.d()
    ], UserMenu.prototype, "infoArea", void 0);
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
