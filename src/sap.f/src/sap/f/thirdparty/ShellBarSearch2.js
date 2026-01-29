sap.ui.define(['require', 'exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemAdditionalText.css', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/information', 'sap/f/thirdparty/List', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/slim-arrow-down', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/encodeXML', 'sap/f/thirdparty/information2', 'sap/f/thirdparty/sys-enter-2', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/i18n-defaults'], (function (require, exports, webcomponentsBase, eventStrict, Theme, parametersBundle_css, Button, Icon, ListItemBase, parametersBundle_css$1, ListItemAdditionalText_css, AccessibilityTextsHelper, ValueState, information, List, i18nDefaults, Label, ResponsivePopover, slimArrowDown, Title, BusyIndicator, encodeXML, information$1, sysEnter2, parametersBundle_css$2, i18nDefaults$1) { 'use strict';

    function ListItemBaseTemplate(hooks, injectedProps) {
        const listItemContent = hooks?.listItemContent || defaultListItemContent;
        return (parametersBundle_css.jsx("li", { part: "native-li", "data-sap-focus-ref": true, tabindex: this._effectiveTabIndex, class: this.classes.main, draggable: this.movable, role: injectedProps?.role, title: injectedProps?.title, onFocusIn: this._onfocusin, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onClick: this._onclick, children: listItemContent.call(this) }));
    }
    function defaultListItemContent() {
        return parametersBundle_css.jsx("div", { part: "content", id: `${this._id}-content`, class: "ui5-li-content", children: parametersBundle_css.jsx("div", { class: "ui5-li-text-wrapper", children: parametersBundle_css.jsx("span", { part: "title", class: "ui5-li-title", children: parametersBundle_css.jsx("slot", {}) }) }) });
    }

    function OptionTemplate() {
        return ListItemBaseTemplate.call(this, { listItemContent: listItemContent$1 }, { role: "option", title: this.tooltip });
    }
    function listItemContent$1() {
        return (parametersBundle_css.jsxs("div", { part: "content", id: `${this._id}-content`, class: "ui5-li-content", children: [this.displayIconBegin &&
                    parametersBundle_css.jsx(Icon.Icon, { part: "icon", name: this.icon, class: "ui5-li-icon", mode: "Decorative" }), parametersBundle_css.jsxs("div", { class: "ui5-li-text-wrapper", children: [parametersBundle_css.jsx("span", { part: "title", class: "ui5-li-title", children: parametersBundle_css.jsx("slot", {}) }), this.additionalText &&
                            parametersBundle_css.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", children: this.additionalText })] })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var optionBaseCss = `:host{height:var(--_ui5-v2-15-0_list_item_dropdown_base_height);--_ui5-v2-15-0_list_item_title_size: var(--sapFontSize)}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var listItemIconCss = `.ui5-li-icon{color:var(--sapList_TextColor);min-width:var(--_ui5-v2-15-0_list_item_icon_size);min-height:var(--_ui5-v2-15-0_list_item_icon_size);padding-inline-end:var(--_ui5-v2-15-0_list_item_icon_padding-inline-end)}
`;

    var __decorate$6 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-option` component defines the content of an option in the `ui5-select`.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Option.js";`
     * @constructor
     * @extends ListItemBase
     * @implements {IOption}
     * @public
     */
    let Option = class Option extends ListItemBase.ListItemBase {
        get displayIconBegin() {
            return !!this.icon;
        }
        get effectiveDisplayText() {
            return this.textContent || "";
        }
    };
    __decorate$6([
        webcomponentsBase.d({ type: Node, "default": true, invalidateOnChildChange: true })
    ], Option.prototype, "text", void 0);
    __decorate$6([
        webcomponentsBase.s()
    ], Option.prototype, "value", void 0);
    __decorate$6([
        webcomponentsBase.s()
    ], Option.prototype, "icon", void 0);
    __decorate$6([
        webcomponentsBase.s()
    ], Option.prototype, "additionalText", void 0);
    __decorate$6([
        webcomponentsBase.s()
    ], Option.prototype, "tooltip", void 0);
    __decorate$6([
        webcomponentsBase.s({ type: Boolean })
    ], Option.prototype, "selected", void 0);
    Option = __decorate$6([
        webcomponentsBase.m({
            tag: "ui5-option",
            template: OptionTemplate,
            styles: [
                ListItemBase.ListItemBase.styles,
                ListItemAdditionalText_css.listItemAdditionalTextCss,
                listItemIconCss,
                optionBaseCss,
            ],
        })
    ], Option);
    Option.define();
    var Option$1 = Option;

    let t,n$1;const l=e=>{e.style.position="absolute",e.style.clip="rect(1px,1px,1px,1px)",e.style.userSelect="none",e.style.left="-1000px",e.style.top="-1000px",e.style.pointerEvents="none";};Theme.P(()=>{t&&n$1||(t=document.createElement("span"),n$1=document.createElement("span"),t.classList.add("ui5-invisiblemessage-polite"),n$1.classList.add("ui5-invisiblemessage-assertive"),t.setAttribute("aria-live","polite"),n$1.setAttribute("aria-live","assertive"),t.setAttribute("role","alert"),n$1.setAttribute("role","alert"),l(t),l(n$1),Theme.o("ui5-announcement-area").appendChild(t),Theme.o("ui5-announcement-area").appendChild(n$1));});const p=(e,s)=>{const i=t;i.textContent="",i.textContent=e,setTimeout(()=>{i.textContent===e&&(i.textContent="");},3e3);};

    function SelectPopoverTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [this.options.length > 0 &&
                    parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { id: this.responsivePopoverId, class: {
                            "ui5-select-popover": true,
                            ...this.classes.popover
                        }, part: "popover", style: this.styles.responsivePopover, placement: "Bottom", horizontalAlign: "Start", hideArrow: true, preventInitialFocus: true, onOpen: this._afterOpen, onBeforeOpen: this._beforeOpen, onClose: this._afterClose, onKeyDown: this._onkeydown, accessibleName: this._isPhone ? this._headerTitleText : undefined, children: [this._isPhone &&
                                parametersBundle_css.jsxs("div", { slot: "header", class: "ui5-responsive-popover-header", children: [parametersBundle_css.jsxs("div", { class: "row", children: [parametersBundle_css.jsx(Title.Title, { children: this._headerTitleText }), parametersBundle_css.jsx(Button.Button, { class: "ui5-responsive-popover-close-btn", icon: information.decline, design: "Transparent", onClick: this._toggleRespPopover })] }), this.hasValueStateText &&
                                            parametersBundle_css.jsx("div", { class: {
                                                    "row": true,
                                                    "ui5-select-value-state-dialog-header": true,
                                                    ...this.classes.popoverValueState
                                                }, children: this._isPickerOpen && valueStateMessage$1.call(this) })] }), !this._isPhone && this.hasValueStateText &&
                                parametersBundle_css.jsxs("div", { class: this.classes.popoverValueState, style: this.styles.responsivePopoverHeader, children: [parametersBundle_css.jsx(Icon.Icon, { class: "ui5-input-value-state-message-icon", name: this._valueStateMessageInputIcon }), this._isPickerOpen && valueStateMessage$1.call(this)] }), parametersBundle_css.jsx(List.List, { separators: "None", onMouseDown: this._itemMousedown, onItemClick: this._handleItemPress, accessibleRole: "ListBox", children: parametersBundle_css.jsx("slot", {}) })] }), this.shouldOpenValueStateMessagePopover &&
                    parametersBundle_css.jsx(ResponsivePopover.Popover, { part: "popover", class: "ui5-valuestatemessage-popover", preventInitialFocus: true, preventFocusRestore: true, hideArrow: true, placement: "Bottom", horizontalAlign: "Start", children: parametersBundle_css.jsxs("div", { class: this.classes.popoverValueState, style: this.styles.popoverHeader, children: [parametersBundle_css.jsx(Icon.Icon, { class: "ui5-input-value-state-message-icon", name: this._valueStateMessageInputIcon }), valueStateMessage$1.call(this)] }) })] }));
    }
    function valueStateMessage$1() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.shouldDisplayDefaultValueStateMessage
                ? this.valueStateText
                : parametersBundle_css.jsx("slot", { onClick: this._applyFocus, name: "valueStateMessage" }) }));
    }

    function SelectTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsxs("div", { class: {
                        "ui5-select-root": true,
                        "ui5-input-focusable-element": true,
                    }, id: `${this._id}-select`, onClick: this._onclick, title: this.tooltip, children: [!this.icon && this.selectedOptionIcon &&
                            parametersBundle_css.jsx(Icon.Icon, { mode: "Decorative", class: "ui5-select-option-icon", name: this.selectedOptionIcon }), parametersBundle_css.jsx("div", { class: "ui5-select-label-root", "data-sap-focus-ref": true, tabindex: this._effectiveTabIndex, role: "combobox", "aria-haspopup": "listbox", "aria-label": this.ariaLabelText, ...this.ariaDescribedByIds && {
                                "aria-describedby": this.ariaDescribedByIds
                            }, "aria-disabled": this.isDisabled, "aria-required": this.required, "aria-readonly": this.readonly, "aria-expanded": this._isPickerOpen, "aria-roledescription": this._ariaRoleDescription, onKeyDown: this._onkeydown, onKeyPress: this._handleKeyboardNavigation, onKeyUp: this._onkeyup, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, "aria-controls": this.responsivePopoverId, children: this.hasCustomLabel
                                ? parametersBundle_css.jsx("slot", { name: "label" })
                                : this.text }), this.icon &&
                            parametersBundle_css.jsx("div", { class: {
                                    "ui5-select-icon-root": true,
                                    "inputIcon": true,
                                    "inputIcon--pressed": this._iconPressed,
                                }, children: parametersBundle_css.jsx(Icon.Icon, { name: this.icon, class: {
                                        "ui5-select-icon": true,
                                    } }) }), !this.icon && !this.readonly &&
                            parametersBundle_css.jsx("div", { part: "icon-wrapper", class: {
                                    "ui5-select-icon-root": true,
                                    "inputIcon": true,
                                    "inputIcon--pressed": this._iconPressed,
                                }, children: parametersBundle_css.jsx(Icon.Icon, { part: "icon", name: slimArrowDown.slimArrowDown, class: {
                                        "ui5-select-icon": true,
                                    } }) }), this.hasValueState &&
                            parametersBundle_css.jsx("span", { id: `${this._id}-valueStateDesc`, class: "ui5-hidden-text", children: this.valueStateText }), this.ariaDescriptionText &&
                            parametersBundle_css.jsx("span", { id: "accessibleDescription", class: "ui5-hidden-text", children: this.ariaDescriptionText })] }), SelectPopoverTemplate.call(this)] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var selectCss = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}.inputIcon{color:var(--_ui5-v2-15-0_input_icon_color);cursor:pointer;outline:none;padding:var(--_ui5-v2-15-0_input_icon_padding);border-inline-start:var(--_ui5-v2-15-0_input_icon_border);min-width:1rem;min-height:1rem;border-radius:var(--_ui5-v2-15-0_input_icon_border_radius)}.inputIcon.inputIcon--pressed{background:var(--_ui5-v2-15-0_input_icon_pressed_bg);box-shadow:var(--_ui5-v2-15-0_input_icon_box_shadow);border-inline-start:var(--_ui5-v2-15-0_select_hover_icon_left_border);color:var(--_ui5-v2-15-0_input_icon_pressed_color)}.inputIcon:active{background-color:var(--sapButton_Active_Background);box-shadow:var(--_ui5-v2-15-0_input_icon_box_shadow);border-inline-start:var(--_ui5-v2-15-0_select_hover_icon_left_border);color:var(--_ui5-v2-15-0_input_icon_pressed_color)}.inputIcon:not(.inputIcon--pressed):not(:active):hover{background:var(--_ui5-v2-15-0_input_icon_hover_bg);box-shadow:var(--_ui5-v2-15-0_input_icon_box_shadow)}.inputIcon:hover{border-inline-start:var(--_ui5-v2-15-0_select_hover_icon_left_border);box-shadow:var(--_ui5-v2-15-0_input_icon_box_shadow)}:host(:not([hidden])){display:inline-block}:host{width:var(--_ui5-v2-15-0_input_width);min-width:calc(var(--_ui5-v2-15-0_input_min_width) + (var(--_ui5-v2-15-0-input-icons-count)*var(--_ui5-v2-15-0_input_icon_width)));margin:var(--_ui5-v2-15-0_input_margin_top_bottom) 0;height:var(--_ui5-v2-15-0_input_height);color:var(--sapField_TextColor);font-size:var(--sapFontSize);font-family:var(--sapFontFamily);font-style:normal;border:var(--_ui5-v2-15-0-input-border);border-radius:var(--_ui5-v2-15-0_input_border_radius);box-sizing:border-box;text-align:start;transition:var(--_ui5-v2-15-0_input_transition);background:var(--sapField_BackgroundStyle);background-color:var(--_ui5-v2-15-0_input_background_color)}:host(:not([readonly])),:host([readonly][disabled]){box-shadow:var(--sapField_Shadow)}:host([focused]:not([opened])){border-color:var(--_ui5-v2-15-0_input_focused_border_color);background-color:var(--sapField_Focus_Background)}.ui5-input-focusable-element{position:relative}:host([focused]:not([opened])) .ui5-input-focusable-element:after{content:var(--ui5-v2-15-0_input_focus_pseudo_element_content);position:absolute;pointer-events:none;z-index:2;border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--_ui5-v2-15-0_input_focus_outline_color);border-radius:var(--_ui5-v2-15-0_input_focus_border_radius);top:var(--_ui5-v2-15-0_input_focus_offset);bottom:var(--_ui5-v2-15-0_input_focus_offset);left:var(--_ui5-v2-15-0_input_focus_offset);right:var(--_ui5-v2-15-0_input_focus_offset)}:host([focused][readonly]:not([opened])) .ui5-input-focusable-element:after{top:var(--_ui5-v2-15-0_input_readonly_focus_offset);bottom:var(--_ui5-v2-15-0_input_readonly_focus_offset);left:var(--_ui5-v2-15-0_input_readonly_focus_offset);right:var(--_ui5-v2-15-0_input_readonly_focus_offset);border-radius:var(--_ui5-v2-15-0_input_readonly_focus_border_radius)}.ui5-input-root:before{content:"";position:absolute;width:calc(100% - 2px);left:1px;bottom:-2px;border-bottom-left-radius:8px;border-bottom-right-radius:8px;height:var(--_ui5-v2-15-0_input_bottom_border_height);transition:var(--_ui5-v2-15-0_input_transition);background-color:var(--_ui5-v2-15-0_input_bottom_border_color)}.ui5-input-root{width:100%;height:100%;position:relative;background:transparent;display:inline-block;outline:none;box-sizing:border-box;color:inherit;transition:border-color .2s ease-in-out;border-radius:var(--_ui5-v2-15-0_input_border_radius);overflow:hidden}:host([disabled]){opacity:var(--_ui5-v2-15-0_input_disabled_opacity);cursor:default;pointer-events:none;background-color:var(--_ui5-v2-15-0-input_disabled_background);border-color:var(--_ui5-v2-15-0_input_disabled_border_color)}:host([disabled]) .ui5-input-root:before,:host([readonly]) .ui5-input-root:before{content:none}[inner-input]{background:transparent;color:inherit;border:none;font-style:inherit;-webkit-appearance:none;-moz-appearance:textfield;padding:var(--_ui5-v2-15-0_input_inner_padding);box-sizing:border-box;width:100%;text-overflow:ellipsis;flex:1;outline:none;font-size:inherit;font-family:inherit;line-height:inherit;letter-spacing:inherit;word-spacing:inherit;text-align:inherit}[inner-input][inner-input-with-icon]{padding:var(--_ui5-v2-15-0_input_inner_padding_with_icon)}[inner-input][type=search]::-webkit-search-decoration,[inner-input][type=search]::-webkit-search-cancel-button,[inner-input][type=search]::-webkit-search-results-button,[inner-input][type=search]::-webkit-search-results-decoration{display:none}[inner-input]::-ms-reveal,[inner-input]::-ms-clear{display:none}.ui5-input-value-state-icon{height:100%;display:var(--_ui5-v2-15-0-input-value-state-icon-display);align-items:center}.ui5-input-value-state-icon>svg{margin-right:8px}[inner-input]::selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}:host([disabled]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([disabled]) [inner-input]::-moz-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-moz-placeholder{visibility:hidden}[inner-input]::-webkit-input-placeholder{font-weight:400;font-style:var(--_ui5-v2-15-0_input_placeholder_style);color:var(--_ui5-v2-15-0_input_placeholder_color);padding-right:.125rem}[inner-input]::-moz-placeholder{font-weight:400;font-style:var(--_ui5-v2-15-0_input_placeholder_style);color:var(--_ui5-v2-15-0_input_placeholder_color);padding-right:.125rem}:host([value-state="Negative"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-15-0-input_error_placeholder_color);font-weight:var(--_ui5-v2-15-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Negative"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-15-0-input_error_placeholder_color);font-weight:var(--_ui5-v2-15-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Critical"]) [inner-input]::-webkit-input-placeholder{font-weight:var(--_ui5-v2-15-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Critical"]) [inner-input]::-moz-placeholder{font-weight:var(--_ui5-v2-15-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Positive"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-15-0_input_placeholder_color)}:host([value-state="Positive"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-15-0_input_placeholder_color)}:host([value-state="Information"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-15-0_input_placeholder_color)}:host([value-state="Information"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-15-0_input_placeholder_color)}.ui5-input-content{height:100%;box-sizing:border-box;display:flex;flex-direction:row;justify-content:flex-end;overflow:hidden;outline:none;background:transparent;color:inherit;border-radius:var(--_ui5-v2-15-0_input_border_radius)}:host([readonly]:not([disabled])){border:var(--_ui5-v2-15-0_input_readonly_border);background:var(--sapField_ReadOnly_BackgroundStyle);background-color:var(--_ui5-v2-15-0_input_readonly_background)}:host([value-state="None"]:not([readonly]):hover),:host(:not([value-state]):not([readonly]):hover){border:var(--_ui5-v2-15-0_input_hover_border);border-color:var(--_ui5-v2-15-0_input_focused_border_color);box-shadow:var(--sapField_Hover_Shadow);background:var(--sapField_Hover_BackgroundStyle);background-color:var(--sapField_Hover_Background)}:host(:not([value-state]):not([readonly])[focused]:not([opened]):hover),:host([value-state="None"]:not([readonly])[focused]:not([opened]):hover){box-shadow:none}:host([focused]):not([opened]) .ui5-input-root:before{content:none}:host(:not([readonly]):not([disabled])[value-state]:not([value-state="None"])){border-width:var(--_ui5-v2-15-0_input_state_border_width)}:host([value-state="Negative"]) [inner-input],:host([value-state="Critical"]) [inner-input]{font-style:var(--_ui5-v2-15-0_input_error_warning_font_style);text-indent:var(--_ui5-v2-15-0_input_error_warning_text_indent)}:host([value-state="Negative"]) [inner-input]{font-weight:var(--_ui5-v2-15-0_input_error_font_weight)}:host([value-state="Critical"]) [inner-input]{font-weight:var(--_ui5-v2-15-0_input_warning_font_weight)}:host([value-state="Negative"]:not([readonly]):not([disabled])){background:var(--sapField_InvalidBackgroundStyle);background-color:var(--sapField_InvalidBackground);border-color:var(--_ui5-v2-15-0_input_value_state_error_border_color);box-shadow:var(--sapField_InvalidShadow)}:host([value-state="Negative"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-15-0_input_focused_value_state_error_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_error_border_color)}:host([value-state="Negative"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-15-0_input_focused_value_state_error_focus_outline_color)}:host([value-state="Negative"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-15-0-input-value-state-error-border-botom-color)}:host([value-state="Negative"]:not([readonly]):not([focused]):hover),:host([value-state="Negative"]:not([readonly])[focused][opened]:hover){background-color:var(--_ui5-v2-15-0_input_value_state_error_hover_background);box-shadow:var(--sapField_Hover_InvalidShadow)}:host([value-state="Negative"]:not([readonly]):not([disabled])),:host([value-state="Critical"]:not([readonly]):not([disabled])),:host([value-state="Information"]:not([readonly]):not([disabled])){border-style:var(--_ui5-v2-15-0_input_error_warning_border_style)}:host([value-state="Critical"]:not([readonly]):not([disabled])){background:var(--sapField_WarningBackgroundStyle);background-color:var(--sapField_WarningBackground);border-color:var(--_ui5-v2-15-0_input_value_state_warning_border_color);box-shadow:var(--sapField_WarningShadow)}:host([value-state="Critical"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_border_color)}:host([value-state="Critical"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_focus_outline_color)}:host([value-state="Critical"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-15-0_input_value_state_warning_border_botom_color)}:host([value-state="Critical"]:not([readonly]):not([focused]):hover),:host([value-state="Critical"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_WarningShadow)}:host([value-state="Positive"]:not([readonly]):not([disabled])){background:var(--sapField_SuccessBackgroundStyle);background-color:var(--sapField_SuccessBackground);border-color:var(--_ui5-v2-15-0_input_value_state_success_border_color);border-width:var(--_ui5-v2-15-0_input_value_state_success_border_width);box-shadow:var(--sapField_SuccessShadow)}:host([value-state="Positive"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-15-0_input_focused_value_state_success_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_success_border_color)}:host([value-state="Positive"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-15-0_input_focused_value_state_success_focus_outline_color)}:host([value-state="Positive"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-15-0_input_value_state_success_border_botom_color)}:host([value-state="Positive"]:not([readonly]):not([focused]):hover),:host([value-state="Positive"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_SuccessShadow)}:host([value-state="Information"]:not([readonly]):not([disabled])){background:var(--sapField_InformationBackgroundStyle);background-color:var(--sapField_InformationBackground);border-color:var(--_ui5-v2-15-0_input_value_state_information_border_color);border-width:var(--_ui5-v2-15-0_input_information_border_width);box-shadow:var(--sapField_InformationShadow)}:host([value-state="Information"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-15-0_input_focused_value_state_information_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_information_border_color)}:host([value-state="Information"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-15-0_input_value_success_information_border_botom_color)}:host([value-state="Information"]:not([readonly]):not([focused]):hover),:host([value-state="Information"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_InformationShadow)}.ui5-input-icon-root{min-width:var(--_ui5-v2-15-0_input_icon_min_width);height:100%;display:flex;justify-content:center;align-items:center}::slotted([ui5-icon][slot="icon"]){align-self:start;padding:var(--_ui5-v2-15-0_input_custom_icon_padding);box-sizing:content-box!important}:host([value-state="Negative"]) .inputIcon,:host([value-state="Critical"]) .inputIcon{padding:var(--_ui5-v2-15-0_input_error_warning_icon_padding)}:host([value-state="Negative"][focused]) .inputIcon,:host([value-state="Critical"][focused]) .inputIcon{padding:var(--_ui5-v2-15-0_input_error_warning_focused_icon_padding)}:host([value-state="Information"]) .inputIcon{padding:var(--_ui5-v2-15-0_input_information_icon_padding)}:host([value-state="Information"][focused]) .inputIcon{padding:var(--_ui5-v2-15-0_input_information_focused_icon_padding)}:host([value-state="Negative"]) ::slotted(.inputIcon[ui5-icon]),:host([value-state="Negative"]) ::slotted([ui5-icon][slot="icon"]),:host([value-state="Critical"]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-15-0_input_error_warning_custom_icon_padding)}:host([value-state="Negative"][focused]) ::slotted(.inputIcon[ui5-icon]),:host([value-state="Negative"][focused]) ::slotted([ui5-icon][slot="icon"]),:host([value-state="Critical"][focused]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-15-0_input_error_warning_custom_focused_icon_padding)}:host([value-state="Information"]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-15-0_input_information_custom_icon_padding)}:host([value-state="Information"][focused]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-15-0_input_information_custom_focused_icon_padding)}:host([value-state="Negative"]) .inputIcon:active,:host([value-state="Negative"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-15-0_input_error_icon_box_shadow);color:var(--_ui5-v2-15-0_input_icon_error_pressed_color)}:host([value-state="Negative"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-15-0_input_error_icon_box_shadow)}:host([value-state="Critical"]) .inputIcon:active,:host([value-state="Critical"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-15-0_input_warning_icon_box_shadow);color:var(--_ui5-v2-15-0_input_icon_warning_pressed_color)}:host([value-state="Critical"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-15-0_input_warning_icon_box_shadow)}:host([value-state="Information"]) .inputIcon:active,:host([value-state="Information"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-15-0_input_information_icon_box_shadow);color:var(--_ui5-v2-15-0_input_icon_information_pressed_color)}:host([value-state="Information"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-15-0_input_information_icon_box_shadow)}:host([value-state="Positive"]) .inputIcon:active,:host([value-state="Positive"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-15-0_input_success_icon_box_shadow);color:var(--_ui5-v2-15-0_input_icon_success_pressed_color)}:host([value-state="Positive"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-15-0_input_success_icon_box_shadow)}.ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-15-0_input_icon_wrapper_height);padding:0;width:var(--_ui5-v2-15-0_input_icon_width);min-width:var(--_ui5-v2-15-0_input_icon_width);display:flex;justify-content:center;align-items:center;box-sizing:border-box}:host([value-state]:not([value-state="None"]):not([value-state="Positive"])) .ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-15-0_input_icon_wrapper_state_height);vertical-align:top}:host([value-state="Positive"]) .ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-15-0_input_icon_wrapper_success_state_height)}[ui5-icon].ui5-input-clear-icon{padding:0;color:inherit}[inner-input]::-webkit-outer-spin-button,[inner-input]::-webkit-inner-spin-button{-webkit-appearance:inherit;margin:inherit}:host([icon]){min-width:var(--_ui5-v2-15-0_button_base_min_width);width:var(--_ui5-v2-15-0_button_base_min_width)}:host([icon]) .ui5-select-root{min-width:var(--_ui5-v2-15-0_button_base_min_width)}:host([icon]) .ui5-select-label-root{min-width:0;padding-inline-start:0}.ui5-select-root{min-width:calc(var(--_ui5-v2-15-0_input_min_width) + (var(--_ui5-v2-15-0-input-icons-count)*var(--_ui5-v2-15-0_input_icon_width)));width:100%;height:100%;display:flex;outline:none;cursor:pointer;overflow:hidden;border-radius:var(--_ui5-v2-15-0_input_border_radius)}.ui5-select-label-root{flex-shrink:1;flex-grow:1;align-self:center;min-width:1rem;padding-inline-start:.5rem;cursor:pointer;outline:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--_ui5-v2-15-0_select_label_color);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400}.ui5-select-option-icon{padding-inline-start:.5rem;color:var(--sapField_TextColor);align-self:center}:host(:not([disabled])){cursor:pointer}.ui5-select-icon-root{display:flex;justify-content:center;align-items:center;box-sizing:border-box;width:var(--_ui5-v2-15-0_select_icon_width);min-width:var(--_ui5-v2-15-0_select_icon_width);height:var(--_ui5-v2-15-0_select_icon_wrapper_height);padding:0}.ui5-select-icon{color:inherit}:host([value-state]:not([value-state="None"],[value-state="Positive"])) .ui5-select-icon-root{height:var(--_ui5-v2-15-0_select_icon_wrapper_state_height)}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var ResponsivePopoverCommonCss = `.input-root-phone{flex:1;position:relative;height:var(--_ui5-v2-15-0_input_height);color:var(--sapField_TextColor);font-size:var(--sapFontSize);font-family:var(--sapFontFamily);background:var(--sapField_BackgroundStyle);background-color:var(--_ui5-v2-15-0_input_background_color);border:var(--_ui5-v2-15-0-input-border);border-radius:var(--_ui5-v2-15-0_input_border_radius);box-sizing:border-box}.input-root-phone [inner-input]{padding:0 .5rem;width:100%;height:100%}.input-root-phone [inner-input]:focus{background-color:var(--sapField_Focus_Background)}.input-root-phone:focus-within:before{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--_ui5-v2-15-0_input_focus_border_radius);top:var(--_ui5-v2-15-0_input_focus_offset);bottom:var(--_ui5-v2-15-0_input_focus_offset);left:var(--_ui5-v2-15-0_input_focus_offset);right:var(--_ui5-v2-15-0_input_focus_offset)}.input-root-phone [value-state=Negative] .inputIcon[data-ui5-compact-size],.input-root-phone [value-state=Positive] .inputIcon[data-ui5-compact-size],.input-root-phone [value-state=Critical] .inputIcon[data-ui5-compact-size]{padding:.1875rem .5rem}[inner-input]{background:transparent;color:inherit;border:none;font-style:normal;-webkit-appearance:none;-moz-appearance:textfield;line-height:normal;padding:var(--_ui5-v2-15-0_input_inner_padding);box-sizing:border-box;min-width:3rem;text-overflow:ellipsis;flex:1;outline:none;font-size:inherit;font-family:inherit;border-radius:var(--_ui5-v2-15-0_input_border_radius)}[inner-input]::selection,[inner-input]::-moz-selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}[inner-input]::-webkit-input-placeholder{font-style:var(--_ui5-v2-15-0_input_placeholder_style);color:var(--sapField_PlaceholderTextColor)}[inner-input]::-moz-placeholder{font-style:var(--_ui5-v2-15-0_input_placeholder_style);color:var(--sapField_PlaceholderTextColor)}.input-root-phone[value-state]:not([value-state=None]){border-width:var(--_ui5-v2-15-0_input_state_border_width)}.input-root-phone[value-state=Negative] [inner-input],.input-root-phone[value-state=Critical] [inner-input]{font-style:var(--_ui5-v2-15-0_input_error_warning_font_style)}.input-root-phone[value-state=Negative] [inner-input]{font-weight:var(--_ui5-v2-15-0_input_error_font_weight)}.input-root-phone[value-state=Negative]:not([readonly]){background:var(--sapField_InvalidBackgroundStyle);background-color:var(--sapField_InvalidBackground);border-color:var(--_ui5-v2-15-0_input_value_state_error_border_color)}.input-root-phone[value-state=Negative]:not([readonly]) [inner-input]:focus{background-color:var(--_ui5-v2-15-0_input_focused_value_state_error_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_error_border_color)}.input-root-phone[value-state=Negative]:not([readonly]):focus-within:before{border-color:var(--_ui5-v2-15-0_input_focused_value_state_error_focus_outline_color)}.input-root-phone[value-state=Negative]:not([readonly]):not([disabled]),.input-root-phone[value-state=Critical]:not([readonly]):not([disabled]),.input-root-phone[value-state=Information]:not([readonly]):not([disabled]){border-style:var(--_ui5-v2-15-0_input_error_warning_border_style)}.input-root-phone[value-state=Critical]:not([readonly]){background:var(--sapField_WarningBackgroundStyle);background-color:var(--sapField_WarningBackground);border-color:var(--_ui5-v2-15-0_input_value_state_warning_border_color)}.input-root-phone[value-state=Critical]:not([readonly]) [inner-input]:focus{background-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_border_color)}.input-root-phone[value-state=Critical]:not([readonly]):focus-within:before{border-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_focus_outline_color)}.input-root-phone[value-state=Positive]:not([readonly]){background:var(--sapField_SuccessBackgroundStyle);background-color:var(--sapField_SuccessBackground);border-color:var(--_ui5-v2-15-0_input_value_state_success_border_color);border-width:var(--_ui5-v2-15-0_input_value_state_success_border_width)}.input-root-phone[value-state=Positive]:not([readonly]) [inner-input]:focus{background-color:var(--_ui5-v2-15-0_input_focused_value_state_success_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_success_border_color)}.input-root-phone[value-state=Positive]:not([readonly]):focus-within:before{border-color:var(--_ui5-v2-15-0_input_focused_value_state_success_focus_outline_color)}.input-root-phone[value-state=Information]:not([readonly]){background:var(--sapField_InformationBackgroundStyle);background-color:var(--sapField_InformationBackground);border-color:var(--_ui5-v2-15-0_input_value_state_information_border_color);border-width:var(--_ui5-v2-15-0_input_information_border_width)}.input-root-phone[value-state=Information]:not([readonly]) [inner-input]:focus{background-color:var(--_ui5-v2-15-0_input_focused_value_state_information_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_information_border_color)}.ui5-multi-combobox-toggle-button{margin-left:.5rem}.ui5-responsive-popover-header{width:100%;min-height:2.5rem;display:flex;flex-direction:column}.ui5-responsive-popover-header-text{width:calc(100% - var(--_ui5-v2-15-0_button_base_min_width))}.ui5-responsive-popover-header .row{box-sizing:border-box;padding:.25rem 1rem;min-height:2.5rem;display:flex;justify-content:center;align-items:center;font-size:var(--sapFontHeader5Size)}.ui5-responsive-popover-footer{display:flex;justify-content:flex-end;padding:.25rem 0;width:100%}.ui5-responsive-popover-footer .ui5-responsive-popover-close-btn{margin-left:.5rem}.ui5-responsive-popover-header .ui5-responsive-popover-close-btn{position:absolute;right:1rem}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var ValueStateMessageCss = `.ui5-valuestatemessage-popover{border-radius:var(--_ui5-v2-15-0_value_state_message_popover_border_radius);box-shadow:var(--_ui5-v2-15-0_value_state_message_popover_box_shadow)}.ui5-input-value-state-message-icon{width:var(--_ui5-v2-15-0_value_state_message_icon_width);height:var(--_ui5-v2-15-0_value_state_message_icon_height);display:var(--_ui5-v2-15-0_input_value_state_icon_display);position:absolute;padding-right:.375rem}.ui5-valuestatemessage-root .ui5-input-value-state-message-icon{left:var(--_ui5-v2-15-0_input_value_state_icon_offset)}.ui5-input-value-state-message-icon[name=error]{color:var(--sapNegativeElementColor)}.ui5-input-value-state-message-icon[name=alert]{color:var(--sapCriticalElementColor)}.ui5-input-value-state-message-icon[name=success]{color:var(--sapPositiveElementColor)}.ui5-input-value-state-message-icon[name=information]{color:var(--sapInformativeElementColor)}.ui5-valuestatemessage-root{box-sizing:border-box;display:inline-block;color:var(--sapTextColor);font-size:var(--sapFontSmallSize);font-family:var(--sapFontFamily);height:auto;padding:var(--_ui5-v2-15-0_value_state_message_padding);overflow:hidden;text-overflow:ellipsis;min-width:6.25rem;border:var(--_ui5-v2-15-0_value_state_message_border);line-height:var(--_ui5-v2-15-0_value_state_message_line_height)}[ui5-responsive-popover] .ui5-valuestatemessage-header,[ui5-popover] .ui5-valuestatemessage-header{min-height:var(--_ui5-v2-15-0_value_state_message_popover_header_min_height);min-width:var(--_ui5-v2-15-0_value_state_message_popover_header_min_width);max-width:var(--_ui5-v2-15-0_value_state_message_popover_header_max_width);width:var(--_ui5-v2-15-0_value_state_message_popover_header_width)}[ui5-responsive-popover] .ui5-valuestatemessage-header{padding:var(--_ui5-v2-15-0_value_state_header_padding);border:var(--_ui5-v2-15-0_value_state_header_border);border-bottom:var(--_ui5-v2-15-0_value_state_header_border_bottom);flex-grow:1;position:relative}.ui5-valuestatemessage--success{background:var(--sapSuccessBackground)}.ui5-valuestatemessage--warning{background:var(--sapWarningBackground)}.ui5-valuestatemessage--error{background:var(--sapErrorBackground)}.ui5-valuestatemessage--information{background:var(--sapInformationBackground)}.ui5-responsive-popover-header:focus{outline-offset:var(--_ui5-v2-15-0_value_state_header_offset);outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor)}.ui5-valuestatemessage-popover::part(header),.ui5-valuestatemessage-popover::part(content){padding:0}.ui5-valuestatemessage-popover::part(header),.ui5-valuestatemessage-popover::part(footer){min-height:0}.ui5-valuestatemessage-popover::part(header),.ui5-popover-with-value-state-header::part(header),.ui5-popover-with-value-state-header-phone::part(header){margin-bottom:0}.ui5-popover-with-value-state-header-phone .ui5-valuestatemessage-root{padding:var(--_ui5-v2-15-0_value_state_message_padding_phone);width:100%}.ui5-popover-with-value-state-header-phone .ui5-input-value-state-message-icon{left:var(--_ui5-v2-15-0_value_state_message_icon_offset_phone)}.ui5-popover-with-value-state-header-phone .ui5-valuestatemessage-header{position:relative;flex:none;top:0;left:0;max-width:100%}.ui5-popover-with-value-state-header-phone::part(content){padding:0;overflow:hidden;display:flex;flex-direction:column}.ui5-popover-with-value-state-header-phone [ui5-list]{overflow:auto}[ui5-responsive-popover] .ui5-valuestatemessage--error{box-shadow:var(--_ui5-v2-15-0_value_state_header_box_shadow_error)}[ui5-responsive-popover] .ui5-valuestatemessage--information{box-shadow:var(--_ui5-v2-15-0_value_state_header_box_shadow_information)}[ui5-responsive-popover] .ui5-valuestatemessage--success{box-shadow:var(--_ui5-v2-15-0_value_state_header_box_shadow_success)}[ui5-responsive-popover] .ui5-valuestatemessage--warning{box-shadow:var(--_ui5-v2-15-0_value_state_header_box_shadow_warning)}[ui5-responsive-popover].ui5-popover-with-value-state-header .ui5-valuestatemessage-root:has(+[ui5-list]:empty){box-shadow:none}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var SelectPopoverCss = `.ui5-select-popover::part(content),.ui5-select-popover::part(header){padding:0}.ui5-select-popover .ui5-responsive-popover-header .row{justify-content:flex-start}
`;

    var __decorate$5 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Select_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-select` component is used to create a drop-down list.
     *
     * ### Usage
     *
     * There are two main usages of the `ui5-select>`.
     *
     * - With Option (`ui5-option`) web component:
     *
     * The available options of the Select are defined by using the Option component.
     * The Option comes with predefined design and layout, including `icon`, `text` and `additional-text`.
     *
     * - With OptionCustom (`ui5-option-custom`) web component.
     *
     * Options with custom content are defined by using the OptionCustom component.
     * The OptionCustom component comes with no predefined layout and it expects consumers to define it.
     *
     * ### Selection
     *
     * The options can be selected via user interaction (click or with the use of the Space and Enter keys)
     * and programmatically - the Select component supports two distinct selection APIs, though mixing them is not supported:
     * - The "value" property of the Select component
     * - The "selected" property on individual options
     *
     * **Note:** If the "value" property is set but does not match any option,
     * no option will be selected and the Select component will be displayed as empty.
     *
     * **Note:** when both "value" and "selected" are both used (although discouraged),
     * the "value" property will take precedence.
     *
     * ### Keyboard Handling
     *
     * The `ui5-select` provides advanced keyboard handling.
     *
     * - [F4] / [Alt] + [Up] / [Alt] + [Down] / [Space] or [Enter] - Opens/closes the drop-down.
     * - [Up] or [Down] - If the drop-down is closed - changes selection to the next or the previous option. If the drop-down is opened - moves focus to the next or the previous option.
     * - [Space], [Enter] - If the drop-down is opened - selects the focused option.
     * - [Escape] - Closes the drop-down without changing the selection.
     * - [Home] - Navigates to first option
     * - [End] - Navigates to the last option
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Select";`
     *
     * `import "@ui5/webcomponents/dist/Option";`
     * `import "@ui5/webcomponents/dist/OptionCustom";`
     * @constructor
     * @extends UI5Element
     * @public
     * @csspart popover - Used to style the popover element
     * @since 0.8.0
     */
    let Select = Select_1 = class Select extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the component is in disabled state.
             *
             * **Note:** A disabled component is noninteractive.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * Defines the value state of the component.
             * @default "None"
             * @public
             */
            this.valueState = "None";
            /**
             * Defines whether the component is required.
             * @since 1.0.0-rc.9
             * @default false
             * @public
             */
            this.required = false;
            /**
             * Defines whether the component is read-only.
             *
             * **Note:** A read-only component is not editable,
             * but still provides visual feedback upon user interaction.
             * @default false
             * @since 1.21.0
             * @public
             */
            this.readonly = false;
            /**
             * @private
             */
            this._iconPressed = false;
            /**
             * @private
             */
            this.opened = false;
            /**
             * @private
             */
            this._listWidth = 0;
            /**
             * @private
             */
            this.focused = false;
            this._selectedIndexBeforeOpen = -1;
            this._escapePressed = false;
            this._lastSelectedOption = null;
            this._typedChars = "";
        }
        ;
        get formValidityMessage() {
            return Select_1.i18nBundle.getText(i18nDefaults.FORM_SELECTABLE_REQUIRED);
        }
        get formValidity() {
            return { valueMissing: this.required && (this.selectedOption?.getAttribute("value") === "") };
        }
        async formElementAnchor() {
            return this.getFocusDomRefAsync();
        }
        get formFormattedValue() {
            if (this._valueStorage !== undefined) {
                return this._valueStorage;
            }
            const selectedOption = this.selectedOption;
            if (selectedOption) {
                if ("value" in selectedOption && selectedOption.value !== undefined) {
                    return selectedOption.value;
                }
                return selectedOption.hasAttribute("value") ? selectedOption.getAttribute("value") : selectedOption.textContent;
            }
            return "";
        }
        onEnterDOM() {
            AccessibilityTextsHelper.y(this, this._updateAssociatedLabelsTexts.bind(this));
        }
        onExitDOM() {
            AccessibilityTextsHelper.T(this);
        }
        onBeforeRendering() {
            this._applySelection();
            this.style.setProperty(Theme.d$1("--_ui5-input-icons-count"), `${this.iconsCount}`);
        }
        onAfterRendering() {
            this.toggleValueStatePopover(this.shouldOpenValueStateMessagePopover);
            if (this._isPickerOpen) {
                if (!this._listWidth) {
                    this._listWidth = this.responsivePopover.offsetWidth;
                }
            }
        }
        /**
         * Selects an option, based on the Select's "value" property,
         * or the options' "selected" property.
         */
        _applySelection() {
            // Flow 1: "value" has not been used
            if (this._valueStorage === undefined) {
                this._applyAutoSelection();
                return;
            }
            // Flow 2: "value" has been used - select the option by value or apply auto selection
            this._applySelectionByValue(this._valueStorage);
        }
        /**
         * Selects an option by given value.
         */
        _applySelectionByValue(value) {
            if (value !== (this.selectedOption?.value || this.selectedOption?.textContent)) {
                const options = Array.from(this.children);
                options.forEach(option => {
                    option.selected = !!((option.getAttribute("value") || option.textContent) === value);
                });
            }
        }
        /**
         * Selects the first option if no option is selected,
         * or selects the last option if multiple options are selected.
         */
        _applyAutoSelection() {
            let selectedIndex = this.options.findLastIndex(option => option.selected);
            selectedIndex = selectedIndex === -1 ? 0 : selectedIndex;
            for (let i = 0; i < this.options.length; i++) {
                this.options[i].selected = selectedIndex === i;
                if (selectedIndex === i) {
                    break;
                }
            }
        }
        /**
         * Sets value by given option.
         */
        _setValueByOption(option) {
            this.value = option.value || option.textContent || "";
        }
        _applyFocus() {
            this.focus();
        }
        _onfocusin() {
            this.focused = true;
        }
        _onfocusout() {
            this.focused = false;
        }
        get _isPickerOpen() {
            return !!this.responsivePopover && this.responsivePopover.open;
        }
        _respPopover() {
            return this.shadowRoot.querySelector("[ui5-responsive-popover]");
        }
        /**
         * Defines the value of the component:
         *
         * - when get - returns the value of the component or the value/text content of the selected option.
         * - when set - selects the option with matching `value` property or text content.
         *
         * **Note:** Use either the Select's value or the Options' selected property.
         * Mixed usage could result in unexpected behavior.
         *
         * **Note:** If the given value does not match any existing option,
         * no option will be selected and the Select component will be displayed as empty.
         * @public
         * @default ""
         * @since 1.20.0
         * @formProperty
         * @formEvents change liveChange
         */
        set value(newValue) {
            this._valueStorage = newValue;
        }
        get value() {
            if (this._valueStorage !== undefined) {
                return this._valueStorage;
            }
            return this.selectedOption?.value === undefined ? (this.selectedOption?.textContent || "") : this.selectedOption?.value;
        }
        get _selectedIndex() {
            return this.options.findIndex(option => option.selected);
        }
        /**
         * Currently selected `ui5-option` element.
         * @public
         * @default undefined
         */
        get selectedOption() {
            return this.options.find(option => option.selected);
        }
        get text() {
            return this.selectedOption?.effectiveDisplayText;
        }
        _toggleRespPopover() {
            if (this.disabled || this.readonly) {
                return;
            }
            this._iconPressed = true;
            this.responsivePopover = this._respPopover();
            if (this._isPickerOpen) {
                this.responsivePopover.open = false;
            }
            else {
                this.responsivePopover.opener = this;
                this.responsivePopover.open = true;
            }
        }
        _onkeydown(e) {
            const isTab = (webcomponentsBase.x(e) || webcomponentsBase.V(e));
            if (isTab && this._isPickerOpen) {
                this.responsivePopover.open = false;
            }
            else if (webcomponentsBase.ko(e)) {
                e.preventDefault();
                this._toggleRespPopover();
            }
            else if (webcomponentsBase.A(e)) {
                e.preventDefault();
            }
            else if (webcomponentsBase.m$2(e) && this._isPickerOpen) {
                this._escapePressed = true;
            }
            else if (webcomponentsBase.M(e)) {
                this._handleHomeKey(e);
            }
            else if (webcomponentsBase.n(e)) {
                this._handleEndKey(e);
            }
            else if (webcomponentsBase.b$1(e)) {
                this._handleSelectionChange();
            }
            else if (webcomponentsBase.P(e) || webcomponentsBase._(e)) {
                this._handleArrowNavigation(e);
            }
        }
        _handleKeyboardNavigation(e) {
            if (webcomponentsBase.b$1(e) || this.readonly) {
                return;
            }
            const typedCharacter = e.key.toLowerCase();
            this._typedChars += typedCharacter;
            // We check if we have more than one characters and they are all duplicate, we set the
            // text to be the last input character (typedCharacter). If not, we set the text to be
            // the whole input string.
            const text = (/^(.)\1+$/i).test(this._typedChars) ? typedCharacter : this._typedChars;
            clearTimeout(this._typingTimeoutID);
            this._typingTimeoutID = setTimeout(() => {
                this._typedChars = "";
                this._typingTimeoutID = -1;
            }, 1000);
            this._selectTypedItem(text);
        }
        _selectTypedItem(text) {
            const currentIndex = this._selectedIndex;
            const itemToSelect = this._searchNextItemByText(text);
            if (itemToSelect) {
                const nextIndex = this.options.indexOf(itemToSelect);
                this._changeSelectedItem(this._selectedIndex, nextIndex);
                if (currentIndex !== this._selectedIndex) {
                    this.itemSelectionAnnounce();
                    this._scrollSelectedItem();
                }
            }
        }
        _searchNextItemByText(text) {
            let orderedOptions = this.options.slice(0);
            const optionsAfterSelected = orderedOptions.splice(this._selectedIndex + 1, orderedOptions.length - this._selectedIndex);
            const optionsBeforeSelected = orderedOptions.splice(0, orderedOptions.length - 1);
            orderedOptions = optionsAfterSelected.concat(optionsBeforeSelected);
            return orderedOptions.find(option => option.effectiveDisplayText.toLowerCase().startsWith(text));
        }
        _handleHomeKey(e) {
            e.preventDefault();
            if (this.readonly) {
                return;
            }
            this._changeSelectedItem(this._selectedIndex, 0);
        }
        _handleEndKey(e) {
            e.preventDefault();
            if (this.readonly) {
                return;
            }
            const lastIndex = this.options.length - 1;
            this._changeSelectedItem(this._selectedIndex, lastIndex);
        }
        _onkeyup(e) {
            if (webcomponentsBase.A(e)) {
                if (this._isPickerOpen) {
                    this._handleSelectionChange();
                }
                else {
                    this._toggleRespPopover();
                }
            }
        }
        _getItemIndex(item) {
            return this.options.indexOf(item);
        }
        _select(index) {
            const selectedIndex = this._selectedIndex;
            if (index < 0 || index >= this.options.length || this.options.length === 0) {
                return;
            }
            if (this.options[selectedIndex]) {
                this.options[selectedIndex].selected = false;
            }
            const selectedOption = this.options[index];
            if (selectedIndex !== index) {
                this.fireDecoratorEvent("live-change", { selectedOption });
            }
            selectedOption.selected = true;
            if (this._valueStorage !== undefined) {
                this._setValueByOption(selectedOption);
            }
        }
        /**
         * The user clicked on an item from the list
         * @private
         */
        _handleItemPress(e) {
            const listItem = e.detail.item;
            const selectedItemIndex = this._getItemIndex(listItem);
            this._handleSelectionChange(selectedItemIndex);
        }
        _itemMousedown(e) {
            // prevent actual focus of items
            e.preventDefault();
        }
        _onclick() {
            this.getFocusDomRef().focus();
            this._toggleRespPopover();
        }
        /**
         * The user selected an item with Enter or Space
         * @private
         */
        _handleSelectionChange(index = this._selectedIndex) {
            this._typedChars = "";
            this._select(index);
            this._toggleRespPopover();
        }
        _scrollSelectedItem() {
            if (this._isPickerOpen) {
                const itemRef = this._currentlySelectedOption?.getDomRef();
                if (itemRef) {
                    itemRef.scrollIntoView({
                        behavior: "auto",
                        block: "nearest",
                        inline: "nearest",
                    });
                }
            }
        }
        _handleArrowNavigation(e) {
            e.preventDefault();
            if (this.readonly) {
                return;
            }
            let nextIndex = -1;
            const currentIndex = this._selectedIndex;
            const isDownKey = webcomponentsBase._(e);
            if (isDownKey) {
                nextIndex = this._getNextOptionIndex();
            }
            else {
                nextIndex = this._getPreviousOptionIndex();
            }
            this._changeSelectedItem(this._selectedIndex, nextIndex);
            if (currentIndex !== this._selectedIndex) {
                // Announce new item even if picker is opened.
                // The aria-activedescendents attribute can't be used,
                // because listitem elements are in different shadow dom
                this.itemSelectionAnnounce();
                this._scrollSelectedItem();
            }
        }
        _changeSelectedItem(oldIndex, newIndex) {
            const options = this.options;
            // Normalize: first navigation with Up when nothing selected -> last item
            if (oldIndex === -1 && newIndex < 0 && options.length) {
                newIndex = options.length - 1;
            }
            // Abort on invalid target
            if (newIndex < 0 || newIndex >= options.length) {
                return;
            }
            const previousOption = options[oldIndex];
            const nextOption = options[newIndex];
            if (previousOption === nextOption) {
                return;
            }
            if (previousOption) {
                previousOption.selected = false;
                previousOption.focused = false;
            }
            nextOption.selected = true;
            nextOption.focused = true;
            if (this._valueStorage !== undefined) {
                this._setValueByOption(nextOption);
            }
            this.fireDecoratorEvent("live-change", { selectedOption: nextOption });
            if (!this._isPickerOpen) {
                // arrow pressed on closed picker - do selection change
                this._fireChangeEvent(nextOption);
            }
        }
        _getNextOptionIndex() {
            return this._selectedIndex === (this.options.length - 1) ? this._selectedIndex : (this._selectedIndex + 1);
        }
        _getPreviousOptionIndex() {
            return this._selectedIndex === 0 ? this._selectedIndex : (this._selectedIndex - 1);
        }
        _beforeOpen() {
            this._selectedIndexBeforeOpen = this._selectedIndex;
            this._lastSelectedOption = this.options[this._selectedIndex];
        }
        _afterOpen() {
            this.opened = true;
            this.fireDecoratorEvent("open");
            this.itemSelectionAnnounce();
            this._scrollSelectedItem();
            this._applyFocusToSelectedItem();
        }
        _applyFocusToSelectedItem() {
            this.options.forEach(option => {
                option.focused = option.selected;
                if (option.focused && Theme.d()) {
                    // on phone, the popover opens full screen (dialog)
                    // move focus to option to read out dialog header
                    option.focus();
                }
            });
        }
        _afterClose() {
            this.opened = false;
            this._iconPressed = false;
            this._listWidth = 0;
            if (this._escapePressed) {
                this._select(this._selectedIndexBeforeOpen);
                this._escapePressed = false;
            }
            else if (this._lastSelectedOption !== this.options[this._selectedIndex]) {
                this._fireChangeEvent(this.options[this._selectedIndex]);
                this._lastSelectedOption = this.options[this._selectedIndex];
            }
            this.fireDecoratorEvent("close");
        }
        get hasCustomLabel() {
            return !!this.label.length;
        }
        _fireChangeEvent(selectedOption) {
            const changePrevented = !this.fireDecoratorEvent("change", { selectedOption });
            //  Angular two way data binding
            this.fireDecoratorEvent("selected-item-changed");
            // Fire input event for Vue.js two-way binding
            this.fireDecoratorEvent("input");
            if (changePrevented) {
                this._select(this._selectedIndexBeforeOpen);
            }
        }
        get valueStateTextMappings() {
            return {
                [ValueState.o.Positive]: Select_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
                [ValueState.o.Information]: Select_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
                [ValueState.o.Negative]: Select_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
                [ValueState.o.Critical]: Select_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
            };
        }
        get valueStateTypeMappings() {
            return {
                [ValueState.o.Positive]: Select_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_SUCCESS),
                [ValueState.o.Information]: Select_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_INFORMATION),
                [ValueState.o.Negative]: Select_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_ERROR),
                [ValueState.o.Critical]: Select_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_WARNING),
            };
        }
        get valueStateText() {
            let valueStateText;
            if (this.shouldDisplayDefaultValueStateMessage) {
                valueStateText = this.valueStateDefaultText;
            }
            else {
                valueStateText = this.valueStateMessage.map(el => el.textContent).join(" ");
            }
            return `${this.valueStateTypeText} ${valueStateText}`;
        }
        get valueStateDefaultText() {
            return this.valueState !== ValueState.o.None ? this.valueStateTextMappings[this.valueState] : "";
        }
        get valueStateTypeText() {
            return this.valueState !== ValueState.o.None ? this.valueStateTypeMappings[this.valueState] : "";
        }
        get hasValueState() {
            return this.valueState !== ValueState.o.None;
        }
        get valueStateTextId() {
            return this.hasValueState ? `${this._id}-valueStateDesc` : undefined;
        }
        get responsivePopoverId() {
            return `${this._id}-popover`;
        }
        get isDisabled() {
            return this.disabled || undefined;
        }
        get _headerTitleText() {
            return Select_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
        }
        get _currentlySelectedOption() {
            return this.options[this._selectedIndex];
        }
        get _effectiveTabIndex() {
            return this.disabled
                || (this.responsivePopover // Handles focus on Tab/Shift + Tab when the popover is opened
                    && this.responsivePopover.open) ? -1 : 0;
        }
        /**
        * This method is relevant for sap_horizon theme only
        */
        get _valueStateMessageInputIcon() {
            const iconPerValueState = {
                Negative: "error",
                Critical: "alert",
                Positive: "sys-enter-2",
                Information: "information",
            };
            return this.valueState !== ValueState.o.None ? iconPerValueState[this.valueState] : "";
        }
        get iconsCount() {
            return this.selectedOptionIcon ? 2 : 1;
        }
        get classes() {
            return {
                popoverValueState: {
                    "ui5-valuestatemessage-root": true,
                    "ui5-valuestatemessage-header": !this._isPhone,
                    "ui5-valuestatemessage--success": this.valueState === ValueState.o.Positive,
                    "ui5-valuestatemessage--error": this.valueState === ValueState.o.Negative,
                    "ui5-valuestatemessage--warning": this.valueState === ValueState.o.Critical,
                    "ui5-valuestatemessage--information": this.valueState === ValueState.o.Information,
                },
                popover: {
                    "ui5-select-popover-valuestate": this.hasValueState,
                },
            };
        }
        get styles() {
            return {
                popoverHeader: {
                    "display": "block",
                },
                responsivePopoverHeader: {
                    "display": this.options.length && this._listWidth === 0 ? "none" : "inline-block",
                    "width": `${this.options.length ? this._listWidth : this.offsetWidth}px`,
                    "max-width": "100%",
                },
                responsivePopover: {
                    "min-width": `${this.offsetWidth}px`,
                },
            };
        }
        get ariaLabelText() {
            return AccessibilityTextsHelper.A(this) || AccessibilityTextsHelper.M(this);
        }
        get shouldDisplayDefaultValueStateMessage() {
            return !this.valueStateMessage.length && this.hasValueStateText;
        }
        get hasValueStateText() {
            return this.hasValueState && this.valueState !== ValueState.o.Positive;
        }
        get shouldOpenValueStateMessagePopover() {
            return this.focused && this.hasValueStateText && !this._iconPressed
                && !this._isPickerOpen && !this._isPhone;
        }
        get _ariaRoleDescription() {
            return Select_1.i18nBundle.getText(i18nDefaults.SELECT_ROLE_DESCRIPTION);
        }
        get _isPhone() {
            return Theme.d();
        }
        itemSelectionAnnounce() {
            let text;
            const optionsCount = this.options.length;
            const itemPositionText = Select_1.i18nBundle.getText(i18nDefaults.LIST_ITEM_POSITION, this._selectedIndex + 1, optionsCount);
            if (this.focused && this._currentlySelectedOption) {
                text = `${this._currentlySelectedOption.textContent} ${this._isPickerOpen ? itemPositionText : ""}`;
                p(text);
            }
        }
        openValueStatePopover() {
            this.valueStatePopover = this._getPopover();
            if (this.valueStatePopover) {
                this.valueStatePopover.opener = this;
                this.valueStatePopover.open = true;
            }
        }
        closeValueStatePopover() {
            this.valueStatePopover && (this.valueStatePopover.open = false);
        }
        toggleValueStatePopover(open) {
            if (open) {
                this.openValueStatePopover();
            }
            else {
                this.closeValueStatePopover();
            }
        }
        get selectedOptionIcon() {
            return this.selectedOption && this.selectedOption.icon;
        }
        get ariaDescriptionText() {
            return this._associatedDescriptionRefTexts || AccessibilityTextsHelper.L(this);
        }
        get ariaDescriptionTextId() {
            return this.ariaDescriptionText ? "accessibleDescription" : "";
        }
        get ariaDescribedByIds() {
            const ids = [this.valueStateTextId, this.ariaDescriptionTextId].filter(Boolean);
            return ids.length ? ids.join(" ") : undefined;
        }
        _updateAssociatedLabelsTexts() {
            this._associatedDescriptionRefTexts = AccessibilityTextsHelper.p(this);
        }
        _getPopover() {
            return this.shadowRoot.querySelector("[ui5-popover]");
        }
    };
    __decorate$5([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "disabled", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "icon", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "name", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "valueState", void 0);
    __decorate$5([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "required", void 0);
    __decorate$5([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "readonly", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "accessibleName", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "accessibleNameRef", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "accessibleDescription", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "accessibleDescriptionRef", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "tooltip", void 0);
    __decorate$5([
        webcomponentsBase.s({ type: String, noAttribute: true })
    ], Select.prototype, "_associatedDescriptionRefTexts", void 0);
    __decorate$5([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Select.prototype, "_iconPressed", void 0);
    __decorate$5([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "opened", void 0);
    __decorate$5([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], Select.prototype, "_listWidth", void 0);
    __decorate$5([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "focused", void 0);
    __decorate$5([
        webcomponentsBase.d({ "default": true, type: HTMLElement, invalidateOnChildChange: true })
    ], Select.prototype, "options", void 0);
    __decorate$5([
        webcomponentsBase.d()
    ], Select.prototype, "valueStateMessage", void 0);
    __decorate$5([
        webcomponentsBase.d()
    ], Select.prototype, "label", void 0);
    __decorate$5([
        webcomponentsBase.s()
    ], Select.prototype, "value", null);
    __decorate$5([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Select, "i18nBundle", void 0);
    Select = Select_1 = __decorate$5([
        webcomponentsBase.m({
            tag: "ui5-select",
            languageAware: true,
            formAssociated: true,
            renderer: parametersBundle_css.y,
            template: SelectTemplate,
            styles: [
                selectCss,
                ResponsivePopoverCommonCss,
                ValueStateMessageCss,
                SelectPopoverCss,
            ],
            dependencies: [
                Label,
                ResponsivePopover.ResponsivePopover,
                ResponsivePopover.Popover,
                List.List,
                Icon.Icon,
                Button.Button,
            ],
        })
        /**
         * Fired when the selected option changes.
         * @param {IOption} selectedOption the selected option.
         * @public
         */
        ,
        eventStrict.l("change", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when the user navigates through the options, but the selection is not finalized,
         * or when pressing the ESC key to revert the current selection.
         * @param {IOption} selectedOption the selected option.
         * @public
         * @since 1.17.0
         */
        ,
        eventStrict.l("live-change", {
            bubbles: true,
        })
        /**
         * Fired after the component's dropdown menu opens.
         * @public
         */
        ,
        eventStrict.l("open")
        /**
         * Fired after the component's dropdown menu closes.
         * @public
         */
        ,
        eventStrict.l("close")
        /**
         * Fired to make Angular two way data binding work properly.
         * @private
         */
        ,
        eventStrict.l("selected-item-changed", {
            bubbles: true,
        })
        /**
         * Fired to make Vue.js two way data binding work properly.
         * @private
         */
        ,
        eventStrict.l("input", {
            bubbles: true,
        })
    ], Select);
    Select.define();
    var Select$1 = Select;

    function SearchFieldTemplate(options) {
        return (!options?.forceExpanded && this.collapsed ? (parametersBundle_css.jsx(Button.Button, { class: "ui5-shell-search-field-button", icon: slimArrowDown.search, design: Button.ButtonDesign.Transparent, "data-sap-focus-ref": true, onClick: this._handleSearchIconPress, tooltip: this._effectiveIconTooltip, accessibleName: this._effectiveIconTooltip, accessibilityAttributes: this._searchButtonAccessibilityAttributes })) : (parametersBundle_css.jsx("div", { class: "ui5-search-field-root", role: "search", onFocusOut: this._onFocusOutSearch, children: parametersBundle_css.jsxs("div", { class: "ui5-search-field-content", children: [this.scopes?.length ? (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx(Select$1, { onChange: this._handleScopeChange, class: "sapUiSizeCompact ui5-search-field-select", accessibleName: this._translations.scope, tooltip: this._translations.scope, children: this.scopes.map(scopeOption => (parametersBundle_css.jsx(Option$1, { selected: scopeOption.selected, "data-ui5-stable": scopeOption.stableDomRef, ref: this.captureRef.bind(scopeOption), children: scopeOption.text }))) }), parametersBundle_css.jsx("div", { class: "ui5-search-field-separator" })] })) : this.filterButton?.length ? (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("div", { class: "ui5-filter-wrapper", style: "display: contents", children: parametersBundle_css.jsx("slot", { name: "filterButton" }) }), parametersBundle_css.jsx("div", { class: "ui5-search-field-separator" })] })) : null, parametersBundle_css.jsx("input", { class: "ui5-search-field-inner-input", role: "searchbox", "aria-description": this.accessibleDescription, "aria-label": this.accessibleName || this._translations.searchFieldAriaLabel, value: this.value, placeholder: this.placeholder, "data-sap-focus-ref": true, onInput: this._handleInput, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, onKeyDown: this._onkeydown, onClick: this._handleInnerClick }), this._effectiveShowClearIcon &&
                        parametersBundle_css.jsx(Icon.Icon, { class: "ui5-shell-search-field-icon", name: information.decline, showTooltip: true, accessibleName: this._translations.clearIcon, onClick: this._handleClear }), parametersBundle_css.jsx(Icon.Icon, { class: {
                            "ui5-shell-search-field-icon": true,
                            "ui5-shell-search-field-search-icon": this._isSearchIcon,
                        }, name: slimArrowDown.search, showTooltip: true, accessibleName: this._effectiveIconTooltip, onClick: this._handleSearchIconPress })] }) })));
    }

    const f=(t,a,e,o)=>{webcomponentsBase.x(t)&&(e!==a.length-1?(t.stopImmediatePropagation(),t.preventDefault(),a[e+1].focus()):(o.closeValueState(),o.focusInput())),webcomponentsBase.V(t)&&(t.preventDefault(),t.stopImmediatePropagation(),e>0?a[e-1].focus():o.focusInput()),webcomponentsBase.P(t)&&(t.preventDefault(),t.stopImmediatePropagation(),o.isPopoverOpen()&&o.focusInput()),webcomponentsBase._(t)&&(t.preventDefault(),t.stopImmediatePropagation(),o.navigateToItem()),webcomponentsBase.m$2(t)&&(t.preventDefault(),t.stopImmediatePropagation());};

    const n=t=>{let e=0;return (t.selectionStart||t.selectionStart===0)&&(e=t.selectionDirection==="backward"?t.selectionStart:t.selectionEnd),e},o=(t,e)=>{t.selectionStart?(t.focus(),t.setSelectionRange(e,e)):t.focus();};

    /**
     * Different input types.
     * @public
     */
    var InputType;
    (function (InputType) {
        /**
         * Defines a one-line text input field:
         * @public
         */
        InputType["Text"] = "Text";
        /**
         * Used for input fields that must contain an e-mail address.
         * @public
         */
        InputType["Email"] = "Email";
        /**
         * Defines a numeric input field.
         * @public
         */
        InputType["Number"] = "Number";
        /**
         * Defines a password field.
         * @public
         */
        InputType["Password"] = "Password";
        /**
         * Used for input fields that should contain a telephone number.
         * @public
         */
        InputType["Tel"] = "Tel";
        /**
         * Used for input fields that should contain a URL address.
         * @public
         */
        InputType["URL"] = "URL";
        /**
         * Used for input fields that should contain a search term.
         * @since 2.0.0
         * @public
         */
        InputType["Search"] = "Search";
    })(InputType || (InputType = {}));
    var InputType$1 = InputType;

    function InputPopoverTemplate(hooks) {
        const suggestionsList = hooks?.suggestionsList;
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [this._effectiveShowSuggestions && this.Suggestions?.template.call(this, { suggestionsList, valueStateMessage, valueStateMessageInputIcon }), this.hasValueStateMessage &&
                    parametersBundle_css.jsx(ResponsivePopover.Popover, { preventInitialFocus: true, preventFocusRestore: true, hideArrow: true, class: "ui5-valuestatemessage-popover", placement: "Bottom", tabindex: -1, horizontalAlign: this._valueStatePopoverHorizontalAlign, opener: this, open: this.valueStateOpen, onClose: this._handleValueStatePopoverAfterClose, children: parametersBundle_css.jsxs("div", { slot: "header", class: this.classes.popoverValueState, children: [parametersBundle_css.jsx(Icon.Icon, { class: "ui5-input-value-state-message-icon", name: valueStateMessageInputIcon.call(this) }), this.valueStateOpen && valueStateMessage.call(this)] }) })] }));
    }
    function valueStateMessage() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.shouldDisplayDefaultValueStateMessage ? this.valueStateText : parametersBundle_css.jsx("slot", { name: "valueStateMessage" }) }));
    }
    function valueStateMessageInputIcon() {
        const iconPerValueState = {
            Negative: information$1.error,
            Critical: information$1.alert,
            Positive: sysEnter2.selectedAccount,
            Information: information$1.information,
        };
        return this.valueState !== ValueState.o.None ? iconPerValueState[this.valueState] : "";
    }

    function InputTemplate(hooks) {
        const suggestionsList = hooks?.suggestionsList;
        const preContent = hooks?.preContent || defaultPreContent;
        const postContent = hooks?.postContent || defaultPostContent;
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("div", { class: "ui5-input-root ui5-input-focusable-element", part: "root", onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, children: parametersBundle_css.jsxs("div", { class: "ui5-input-content", children: [preContent.call(this), parametersBundle_css.jsx("input", { id: "inner", part: "input", class: "ui5-input-inner", style: this.styles.innerInput, type: this.inputNativeType, "inner-input": true, "inner-input-with-icon": !!this.icon.length, disabled: this.disabled, readonly: this._readonly, value: this._innerValue, placeholder: this._placeholder, maxlength: this.maxlength, role: this.accInfo.role, enterkeyhint: this.hint, "aria-controls": this.accInfo.ariaControls, "aria-invalid": this.accInfo.ariaInvalid, "aria-haspopup": this.accInfo.ariaHasPopup, "aria-describedby": this.accInfo.ariaDescribedBy, "aria-roledescription": this.accInfo.ariaRoledescription, "aria-autocomplete": this.accInfo.ariaAutoComplete, "aria-expanded": this.accInfo.ariaExpanded, "aria-label": this.accInfo.ariaLabel, "aria-required": this.required, autocomplete: "off", "data-sap-focus-ref": true, step: this.nativeInputAttributes.step, min: this.nativeInputAttributes.min, max: this.nativeInputAttributes.max, onInput: this._handleNativeInput, onChange: this._handleChange, onSelect: this._handleSelect, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onClick: this._click, onFocusIn: this.innerFocusIn }), this._effectiveShowClearIcon &&
                                parametersBundle_css.jsx("div", { tabindex: -1, class: "ui5-input-clear-icon-wrapper inputIcon", part: "clear-icon-wrapper", onClick: this._clear, onMouseDown: this._iconMouseDown, children: parametersBundle_css.jsx(Icon.Icon, { part: "clear-icon", class: "ui5-input-clear-icon", name: information.decline, tabindex: -1, accessibleName: this.clearIconAccessibleName }) }), this.icon.length > 0 &&
                                parametersBundle_css.jsx("div", { class: "ui5-input-icon-root", tabindex: -1, children: parametersBundle_css.jsx("slot", { name: "icon" }) }), parametersBundle_css.jsx("div", { class: "ui5-input-value-state-icon", children: this._valueStateInputIcon }), postContent.call(this), this._effectiveShowSuggestions &&
                                parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { id: "suggestionsText", class: "ui5-hidden-text", children: this.suggestionsText }), parametersBundle_css.jsx("span", { id: "selectionText", class: "ui5-hidden-text", "aria-live": "polite", role: "status" }), parametersBundle_css.jsx("span", { id: "suggestionsCount", class: "ui5-hidden-text", "aria-live": "polite", children: this.availableSuggestionsCount })] }), this.accInfo.ariaDescription &&
                                parametersBundle_css.jsx("span", { id: "descr", class: "ui5-hidden-text", children: this.accInfo.ariaDescription }), this.accInfo.accessibleDescription &&
                                parametersBundle_css.jsx("span", { id: "accessibleDescription", class: "ui5-hidden-text", children: this.accInfo.accessibleDescription }), this.linksInAriaValueStateHiddenText.length > 0 &&
                                parametersBundle_css.jsx("span", { id: "hiddenText-value-state-link-shortcut", class: "ui5-hidden-text", children: this.valueStateLinksShortcutsTextAcc }), this.hasValueState &&
                                parametersBundle_css.jsx("span", { id: "valueStateDesc", class: "ui5-hidden-text", children: this.ariaValueStateHiddenText })] }) }), InputPopoverTemplate.call(this, { suggestionsList })] }));
    }
    function defaultPreContent() { }
    function defaultPostContent() { }

    const StartsWith = (value, items, propName) => items.filter(item => (item[propName] || "").toLowerCase().startsWith(value.toLowerCase()));

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var inputStyles = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}.inputIcon{color:var(--_ui5-v2-15-0_input_icon_color);cursor:pointer;outline:none;padding:var(--_ui5-v2-15-0_input_icon_padding);border-inline-start:var(--_ui5-v2-15-0_input_icon_border);min-width:1rem;min-height:1rem;border-radius:var(--_ui5-v2-15-0_input_icon_border_radius)}.inputIcon.inputIcon--pressed{background:var(--_ui5-v2-15-0_input_icon_pressed_bg);box-shadow:var(--_ui5-v2-15-0_input_icon_box_shadow);border-inline-start:var(--_ui5-v2-15-0_select_hover_icon_left_border);color:var(--_ui5-v2-15-0_input_icon_pressed_color)}.inputIcon:active{background-color:var(--sapButton_Active_Background);box-shadow:var(--_ui5-v2-15-0_input_icon_box_shadow);border-inline-start:var(--_ui5-v2-15-0_select_hover_icon_left_border);color:var(--_ui5-v2-15-0_input_icon_pressed_color)}.inputIcon:not(.inputIcon--pressed):not(:active):hover{background:var(--_ui5-v2-15-0_input_icon_hover_bg);box-shadow:var(--_ui5-v2-15-0_input_icon_box_shadow)}.inputIcon:hover{border-inline-start:var(--_ui5-v2-15-0_select_hover_icon_left_border);box-shadow:var(--_ui5-v2-15-0_input_icon_box_shadow)}:host(:not([hidden])){display:inline-block}:host{width:var(--_ui5-v2-15-0_input_width);min-width:calc(var(--_ui5-v2-15-0_input_min_width) + (var(--_ui5-v2-15-0-input-icons-count)*var(--_ui5-v2-15-0_input_icon_width)));margin:var(--_ui5-v2-15-0_input_margin_top_bottom) 0;height:var(--_ui5-v2-15-0_input_height);color:var(--sapField_TextColor);font-size:var(--sapFontSize);font-family:var(--sapFontFamily);font-style:normal;border:var(--_ui5-v2-15-0-input-border);border-radius:var(--_ui5-v2-15-0_input_border_radius);box-sizing:border-box;text-align:start;transition:var(--_ui5-v2-15-0_input_transition);background:var(--sapField_BackgroundStyle);background-color:var(--_ui5-v2-15-0_input_background_color)}:host(:not([readonly])),:host([readonly][disabled]){box-shadow:var(--sapField_Shadow)}:host([focused]:not([opened])){border-color:var(--_ui5-v2-15-0_input_focused_border_color);background-color:var(--sapField_Focus_Background)}.ui5-input-focusable-element{position:relative}:host([focused]:not([opened])) .ui5-input-focusable-element:after{content:var(--ui5-v2-15-0_input_focus_pseudo_element_content);position:absolute;pointer-events:none;z-index:2;border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--_ui5-v2-15-0_input_focus_outline_color);border-radius:var(--_ui5-v2-15-0_input_focus_border_radius);top:var(--_ui5-v2-15-0_input_focus_offset);bottom:var(--_ui5-v2-15-0_input_focus_offset);left:var(--_ui5-v2-15-0_input_focus_offset);right:var(--_ui5-v2-15-0_input_focus_offset)}:host([focused][readonly]:not([opened])) .ui5-input-focusable-element:after{top:var(--_ui5-v2-15-0_input_readonly_focus_offset);bottom:var(--_ui5-v2-15-0_input_readonly_focus_offset);left:var(--_ui5-v2-15-0_input_readonly_focus_offset);right:var(--_ui5-v2-15-0_input_readonly_focus_offset);border-radius:var(--_ui5-v2-15-0_input_readonly_focus_border_radius)}.ui5-input-root:before{content:"";position:absolute;width:calc(100% - 2px);left:1px;bottom:-2px;border-bottom-left-radius:8px;border-bottom-right-radius:8px;height:var(--_ui5-v2-15-0_input_bottom_border_height);transition:var(--_ui5-v2-15-0_input_transition);background-color:var(--_ui5-v2-15-0_input_bottom_border_color)}.ui5-input-root{width:100%;height:100%;position:relative;background:transparent;display:inline-block;outline:none;box-sizing:border-box;color:inherit;transition:border-color .2s ease-in-out;border-radius:var(--_ui5-v2-15-0_input_border_radius);overflow:hidden}:host([disabled]){opacity:var(--_ui5-v2-15-0_input_disabled_opacity);cursor:default;pointer-events:none;background-color:var(--_ui5-v2-15-0-input_disabled_background);border-color:var(--_ui5-v2-15-0_input_disabled_border_color)}:host([disabled]) .ui5-input-root:before,:host([readonly]) .ui5-input-root:before{content:none}[inner-input]{background:transparent;color:inherit;border:none;font-style:inherit;-webkit-appearance:none;-moz-appearance:textfield;padding:var(--_ui5-v2-15-0_input_inner_padding);box-sizing:border-box;width:100%;text-overflow:ellipsis;flex:1;outline:none;font-size:inherit;font-family:inherit;line-height:inherit;letter-spacing:inherit;word-spacing:inherit;text-align:inherit}[inner-input][inner-input-with-icon]{padding:var(--_ui5-v2-15-0_input_inner_padding_with_icon)}[inner-input][type=search]::-webkit-search-decoration,[inner-input][type=search]::-webkit-search-cancel-button,[inner-input][type=search]::-webkit-search-results-button,[inner-input][type=search]::-webkit-search-results-decoration{display:none}[inner-input]::-ms-reveal,[inner-input]::-ms-clear{display:none}.ui5-input-value-state-icon{height:100%;display:var(--_ui5-v2-15-0-input-value-state-icon-display);align-items:center}.ui5-input-value-state-icon>svg{margin-right:8px}[inner-input]::selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}:host([disabled]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([disabled]) [inner-input]::-moz-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-moz-placeholder{visibility:hidden}[inner-input]::-webkit-input-placeholder{font-weight:400;font-style:var(--_ui5-v2-15-0_input_placeholder_style);color:var(--_ui5-v2-15-0_input_placeholder_color);padding-right:.125rem}[inner-input]::-moz-placeholder{font-weight:400;font-style:var(--_ui5-v2-15-0_input_placeholder_style);color:var(--_ui5-v2-15-0_input_placeholder_color);padding-right:.125rem}:host([value-state="Negative"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-15-0-input_error_placeholder_color);font-weight:var(--_ui5-v2-15-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Negative"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-15-0-input_error_placeholder_color);font-weight:var(--_ui5-v2-15-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Critical"]) [inner-input]::-webkit-input-placeholder{font-weight:var(--_ui5-v2-15-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Critical"]) [inner-input]::-moz-placeholder{font-weight:var(--_ui5-v2-15-0_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Positive"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-15-0_input_placeholder_color)}:host([value-state="Positive"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-15-0_input_placeholder_color)}:host([value-state="Information"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-v2-15-0_input_placeholder_color)}:host([value-state="Information"]) [inner-input]::-moz-placeholder{color:var(--_ui5-v2-15-0_input_placeholder_color)}.ui5-input-content{height:100%;box-sizing:border-box;display:flex;flex-direction:row;justify-content:flex-end;overflow:hidden;outline:none;background:transparent;color:inherit;border-radius:var(--_ui5-v2-15-0_input_border_radius)}:host([readonly]:not([disabled])){border:var(--_ui5-v2-15-0_input_readonly_border);background:var(--sapField_ReadOnly_BackgroundStyle);background-color:var(--_ui5-v2-15-0_input_readonly_background)}:host([value-state="None"]:not([readonly]):hover),:host(:not([value-state]):not([readonly]):hover){border:var(--_ui5-v2-15-0_input_hover_border);border-color:var(--_ui5-v2-15-0_input_focused_border_color);box-shadow:var(--sapField_Hover_Shadow);background:var(--sapField_Hover_BackgroundStyle);background-color:var(--sapField_Hover_Background)}:host(:not([value-state]):not([readonly])[focused]:not([opened]):hover),:host([value-state="None"]:not([readonly])[focused]:not([opened]):hover){box-shadow:none}:host([focused]):not([opened]) .ui5-input-root:before{content:none}:host(:not([readonly]):not([disabled])[value-state]:not([value-state="None"])){border-width:var(--_ui5-v2-15-0_input_state_border_width)}:host([value-state="Negative"]) [inner-input],:host([value-state="Critical"]) [inner-input]{font-style:var(--_ui5-v2-15-0_input_error_warning_font_style);text-indent:var(--_ui5-v2-15-0_input_error_warning_text_indent)}:host([value-state="Negative"]) [inner-input]{font-weight:var(--_ui5-v2-15-0_input_error_font_weight)}:host([value-state="Critical"]) [inner-input]{font-weight:var(--_ui5-v2-15-0_input_warning_font_weight)}:host([value-state="Negative"]:not([readonly]):not([disabled])){background:var(--sapField_InvalidBackgroundStyle);background-color:var(--sapField_InvalidBackground);border-color:var(--_ui5-v2-15-0_input_value_state_error_border_color);box-shadow:var(--sapField_InvalidShadow)}:host([value-state="Negative"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-15-0_input_focused_value_state_error_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_error_border_color)}:host([value-state="Negative"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-15-0_input_focused_value_state_error_focus_outline_color)}:host([value-state="Negative"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-15-0-input-value-state-error-border-botom-color)}:host([value-state="Negative"]:not([readonly]):not([focused]):hover),:host([value-state="Negative"]:not([readonly])[focused][opened]:hover){background-color:var(--_ui5-v2-15-0_input_value_state_error_hover_background);box-shadow:var(--sapField_Hover_InvalidShadow)}:host([value-state="Negative"]:not([readonly]):not([disabled])),:host([value-state="Critical"]:not([readonly]):not([disabled])),:host([value-state="Information"]:not([readonly]):not([disabled])){border-style:var(--_ui5-v2-15-0_input_error_warning_border_style)}:host([value-state="Critical"]:not([readonly]):not([disabled])){background:var(--sapField_WarningBackgroundStyle);background-color:var(--sapField_WarningBackground);border-color:var(--_ui5-v2-15-0_input_value_state_warning_border_color);box-shadow:var(--sapField_WarningShadow)}:host([value-state="Critical"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_border_color)}:host([value-state="Critical"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-15-0_input_focused_value_state_warning_focus_outline_color)}:host([value-state="Critical"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-15-0_input_value_state_warning_border_botom_color)}:host([value-state="Critical"]:not([readonly]):not([focused]):hover),:host([value-state="Critical"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_WarningShadow)}:host([value-state="Positive"]:not([readonly]):not([disabled])){background:var(--sapField_SuccessBackgroundStyle);background-color:var(--sapField_SuccessBackground);border-color:var(--_ui5-v2-15-0_input_value_state_success_border_color);border-width:var(--_ui5-v2-15-0_input_value_state_success_border_width);box-shadow:var(--sapField_SuccessShadow)}:host([value-state="Positive"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-15-0_input_focused_value_state_success_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_success_border_color)}:host([value-state="Positive"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5-v2-15-0_input_focused_value_state_success_focus_outline_color)}:host([value-state="Positive"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-15-0_input_value_state_success_border_botom_color)}:host([value-state="Positive"]:not([readonly]):not([focused]):hover),:host([value-state="Positive"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_SuccessShadow)}:host([value-state="Information"]:not([readonly]):not([disabled])){background:var(--sapField_InformationBackgroundStyle);background-color:var(--sapField_InformationBackground);border-color:var(--_ui5-v2-15-0_input_value_state_information_border_color);border-width:var(--_ui5-v2-15-0_input_information_border_width);box-shadow:var(--sapField_InformationShadow)}:host([value-state="Information"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5-v2-15-0_input_focused_value_state_information_background);border-color:var(--_ui5-v2-15-0_input_focused_value_state_information_border_color)}:host([value-state="Information"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-v2-15-0_input_value_success_information_border_botom_color)}:host([value-state="Information"]:not([readonly]):not([focused]):hover),:host([value-state="Information"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_InformationShadow)}.ui5-input-icon-root{min-width:var(--_ui5-v2-15-0_input_icon_min_width);height:100%;display:flex;justify-content:center;align-items:center}::slotted([ui5-icon][slot="icon"]){align-self:start;padding:var(--_ui5-v2-15-0_input_custom_icon_padding);box-sizing:content-box!important}:host([value-state="Negative"]) .inputIcon,:host([value-state="Critical"]) .inputIcon{padding:var(--_ui5-v2-15-0_input_error_warning_icon_padding)}:host([value-state="Negative"][focused]) .inputIcon,:host([value-state="Critical"][focused]) .inputIcon{padding:var(--_ui5-v2-15-0_input_error_warning_focused_icon_padding)}:host([value-state="Information"]) .inputIcon{padding:var(--_ui5-v2-15-0_input_information_icon_padding)}:host([value-state="Information"][focused]) .inputIcon{padding:var(--_ui5-v2-15-0_input_information_focused_icon_padding)}:host([value-state="Negative"]) ::slotted(.inputIcon[ui5-icon]),:host([value-state="Negative"]) ::slotted([ui5-icon][slot="icon"]),:host([value-state="Critical"]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-15-0_input_error_warning_custom_icon_padding)}:host([value-state="Negative"][focused]) ::slotted(.inputIcon[ui5-icon]),:host([value-state="Negative"][focused]) ::slotted([ui5-icon][slot="icon"]),:host([value-state="Critical"][focused]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-15-0_input_error_warning_custom_focused_icon_padding)}:host([value-state="Information"]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-15-0_input_information_custom_icon_padding)}:host([value-state="Information"][focused]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5-v2-15-0_input_information_custom_focused_icon_padding)}:host([value-state="Negative"]) .inputIcon:active,:host([value-state="Negative"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-15-0_input_error_icon_box_shadow);color:var(--_ui5-v2-15-0_input_icon_error_pressed_color)}:host([value-state="Negative"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-15-0_input_error_icon_box_shadow)}:host([value-state="Critical"]) .inputIcon:active,:host([value-state="Critical"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-15-0_input_warning_icon_box_shadow);color:var(--_ui5-v2-15-0_input_icon_warning_pressed_color)}:host([value-state="Critical"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-15-0_input_warning_icon_box_shadow)}:host([value-state="Information"]) .inputIcon:active,:host([value-state="Information"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-15-0_input_information_icon_box_shadow);color:var(--_ui5-v2-15-0_input_icon_information_pressed_color)}:host([value-state="Information"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-15-0_input_information_icon_box_shadow)}:host([value-state="Positive"]) .inputIcon:active,:host([value-state="Positive"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5-v2-15-0_input_success_icon_box_shadow);color:var(--_ui5-v2-15-0_input_icon_success_pressed_color)}:host([value-state="Positive"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5-v2-15-0_input_success_icon_box_shadow)}.ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-15-0_input_icon_wrapper_height);padding:0;width:var(--_ui5-v2-15-0_input_icon_width);min-width:var(--_ui5-v2-15-0_input_icon_width);display:flex;justify-content:center;align-items:center;box-sizing:border-box}:host([value-state]:not([value-state="None"]):not([value-state="Positive"])) .ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-15-0_input_icon_wrapper_state_height);vertical-align:top}:host([value-state="Positive"]) .ui5-input-clear-icon-wrapper{height:var(--_ui5-v2-15-0_input_icon_wrapper_success_state_height)}[ui5-icon].ui5-input-clear-icon{padding:0;color:inherit}[inner-input]::-webkit-outer-spin-button,[inner-input]::-webkit-inner-spin-button{-webkit-appearance:inherit;margin:inherit}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var SuggestionsCss = `.ui5-suggestions-popover{box-shadow:var(--sapContent_Shadow1)}.ui5-suggestions-popover::part(header),.ui5-suggestions-popover::part(content){padding:0}.ui5-suggestions-popover::part(footer){padding:0 1rem}.input-root-phone.native-input-wrapper{display:contents}.input-root-phone.native-input-wrapper:before{display:none}.native-input-wrapper .ui5-input-inner-phone{margin:0}
`;

    var __decorate$4 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Input_1;
    // all sementic events
    var INPUT_EVENTS;
    (function (INPUT_EVENTS) {
        INPUT_EVENTS["CHANGE"] = "change";
        INPUT_EVENTS["INPUT"] = "input";
        INPUT_EVENTS["SELECTION_CHANGE"] = "selection-change";
    })(INPUT_EVENTS || (INPUT_EVENTS = {}));
    // all user interactions
    var INPUT_ACTIONS;
    (function (INPUT_ACTIONS) {
        INPUT_ACTIONS["ACTION_ENTER"] = "enter";
        INPUT_ACTIONS["ACTION_USER_INPUT"] = "input";
    })(INPUT_ACTIONS || (INPUT_ACTIONS = {}));
    /**
     * @class
     * ### Overview
     *
     * The `ui5-input` component allows the user to enter and edit text or numeric values in one line.
     *
     * Additionally, you can provide `suggestionItems`,
     * that are displayed in a popover right under the input.
     *
     * The text field can be editable or read-only (`readonly` property),
     * and it can be enabled or disabled (`disabled` property).
     * To visualize semantic states, such as "Negative" or "Critical", the `valueState` property is provided.
     * When the user makes changes to the text, the change event is fired,
     * which enables you to react on any text change.
     *
     * ### Keyboard Handling
     * The `ui5-input` provides the following keyboard shortcuts:
     *
     * - [Escape] - Closes the suggestion list, if open. If closed or not enabled, cancels changes and reverts to the value which the Input field had when it got the focus.
     * - [Enter] or [Return] - If suggestion list is open takes over the current matching item and closes it. If value state or group header is focused, does nothing.
     * - [Down] - Focuses the next matching item in the suggestion list. Selection-change event is fired.
     * - [Up] - Focuses the previous matching item in the suggestion list. Selection-change event is fired.
     * - [Home] - If focus is in the text input, moves caret before the first character. If focus is in the list, highlights the first item and updates the input accordingly.
     * - [End] - If focus is in the text input, moves caret after the last character. If focus is in the list, highlights the last item and updates the input accordingly.
     * - [Page Up] - If focus is in the list, moves highlight up by page size (10 items by default). If focus is in the input, does nothing.
     * - [Page Down] - If focus is in the list, moves highlight down by page size (10 items by default). If focus is in the input, does nothing.
     * - [Ctrl]+[Alt]+[F8] or [Command]+[Option]+[F8] - Focuses the first link in the value state message, if available. Pressing [Tab] moves the focus to the next link in the value state message, or closes the value state message if there are no more links.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Input.js";`
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @csspart root - Used to style the root DOM element of the Input component
     * @csspart input - Used to style the native input element
     * @csspart clear-icon - Used to style the clear icon, which can be pressed to clear user input text
     */
    let Input = Input_1 = class Input extends webcomponentsBase.b {
        get formValidityMessage() {
            return Input_1.i18nBundle.getText(i18nDefaults.FORM_TEXTFIELD_REQUIRED);
        }
        get _effectiveShowSuggestions() {
            return !!(this.showSuggestions && this.Suggestions);
        }
        get formValidity() {
            return { valueMissing: this.required && !this.value };
        }
        async formElementAnchor() {
            return this.getFocusDomRefAsync();
        }
        get formFormattedValue() {
            return this.value;
        }
        constructor() {
            super();
            /**
             * Defines whether the component is in disabled state.
             *
             * **Note:** A disabled component is completely noninteractive.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * Defines if characters within the suggestions are to be highlighted
             * in case the input value matches parts of the suggestions text.
             *
             * **Note:** takes effect when `showSuggestions` is set to `true`
             * @default false
             * @private
             * @since 1.0.0-rc.8
             */
            this.highlight = false;
            /**
             * Defines whether the component is read-only.
             *
             * **Note:** A read-only component is not editable,
             * but still provides visual feedback upon user interaction.
             * @default false
             * @public
             */
            this.readonly = false;
            /**
             * Defines whether the component is required.
             * @default false
             * @public
             * @since 1.0.0-rc.3
             */
            this.required = false;
            /**
             * Defines whether the value will be autcompleted to match an item
             * @default false
             * @public
             * @since 1.4.0
             */
            this.noTypeahead = false;
            /**
             * Defines the HTML type of the component.
             *
             * **Notes:**
             *
             * - The particular effect of this property differs depending on the browser
             * and the current language settings, especially for type `Number`.
             * - The property is mostly intended to be used with touch devices
             * that use different soft keyboard layouts depending on the given input type.
             * @default "Text"
             * @public
             */
            this.type = "Text";
            /**
             * Defines the value of the component.
             *
             * **Note:** The property is updated upon typing.
             * @default ""
             * @formEvents change input
             * @formProperty
             * @public
             */
            this.value = "";
            /**
             * Defines the inner stored value of the component.
             *
             * **Note:** The property is updated upon typing. In some special cases the old value is kept (e.g. deleting the value after the dot in a float)
             * @default ""
             * @private
             */
            this._innerValue = "";
            /**
             * Defines the value state of the component.
             * @default "None"
             * @public
             */
            this.valueState = "None";
            /**
             * Defines whether the component should show suggestions, if such are present.
             *
             * @default false
             * @public
             */
            this.showSuggestions = false;
            /**
             * Defines whether the clear icon of the input will be shown.
             * @default false
             * @public
             * @since 1.2.0
             */
            this.showClearIcon = false;
            /**
             * Defines whether the suggestions picker is open.
             * The picker will not open if the `showSuggestions` property is set to `false`, the input is disabled or the input is readonly.
             * The picker will close automatically and `close` event will be fired if the input is not in the viewport.
             * @default false
             * @public
             * @since 2.0.0
             */
            this.open = false;
            /**
             * Defines whether the clear icon is visible.
             * @default false
             * @private
             * @since 1.2.0
             */
            this._effectiveShowClearIcon = false;
            /**
             * @private
             */
            this.focused = false;
            this.valueStateOpen = false;
            this._inputAccInfo = {};
            this._nativeInputAttributes = {};
            this._inputIconFocused = false;
            /**
             * @private
             */
            this._linksListenersArray = [];
            /**
             * Indicates whether IME composition is currently active
             * @default false
             * @private
             */
            this._isComposing = false;
            /**
             * Indicates whether link navigation is being handled.
             * @default false
             * @private
             * @since 2.11.0
             */
            this._handleLinkNavigation = false;
            // Indicates if there is selected suggestionItem.
            this.hasSuggestionItemSelected = false;
            // Represents the value before user moves selection from suggestion item to another
            // and its value is updated after each move.
            // Note: Used to register and fire "input" event upon [Space] or [Enter].
            // Note: The property "value" is updated upon selection move and can`t be used.
            this.valueBeforeItemSelection = "";
            // Represents the value before user moves selection between the suggestion items
            // and its value remains the same when the user navigates up or down the list.
            // Note: Used to cancel selection upon [Escape].
            this.valueBeforeSelectionStart = "";
            // tracks the value between focus in and focus out to detect that change event should be fired.
            this.previousValue = "";
            // Indicates, if the component is rendering for first time.
            this.firstRendering = true;
            // The typed in value.
            this.typedInValue = "";
            // The last value confirmed by the user with "ENTER"
            this.lastConfirmedValue = "";
            // Indicates, if the user is typing. Gets reset once popup is closed
            this.isTyping = false;
            // Indicates whether the value of the input is comming from a suggestion item
            this._isLatestValueFromSuggestions = false;
            this._isChangeTriggeredBySuggestion = false;
            this._indexOfSelectedItem = -1;
            this._handleResizeBound = this._handleResize.bind(this);
            this._keepInnerValue = false;
            this._focusedAfterClear = false;
            this._valueStateLinks = [];
        }
        onEnterDOM() {
            webcomponentsBase.f.register(this, this._handleResizeBound);
            AccessibilityTextsHelper.y(this, this._updateAssociatedLabelsTexts.bind(this));
            this._enableComposition();
        }
        onExitDOM() {
            webcomponentsBase.f.deregister(this, this._handleResizeBound);
            AccessibilityTextsHelper.T(this);
            this._removeLinksEventListeners();
            this._composition?.removeEventListeners();
        }
        _highlightSuggestionItem(item) {
            item.markupText = this.typedInValue ? this.Suggestions?.hightlightInput((item.text || ""), this.typedInValue) : encodeXML.fnEncodeXML(item.text || "");
        }
        _isGroupItem(item) {
            return item.hasAttribute("ui5-suggestion-item-group");
        }
        onBeforeRendering() {
            if (!this._keepInnerValue) {
                this._innerValue = this.value === null ? "" : this.value;
            }
            if (this.showSuggestions) {
                this.enableSuggestions();
                this._flattenItems.forEach(item => {
                    if (item.hasAttribute("ui5-suggestion-item")) {
                        this._highlightSuggestionItem(item);
                    }
                    else if (this._isGroupItem(item)) {
                        item.items?.forEach(nestedItem => {
                            this._highlightSuggestionItem(nestedItem);
                        });
                    }
                });
            }
            this._effectiveShowClearIcon = (this.showClearIcon && !!this.value && !this.readonly && !this.disabled);
            this.style.setProperty(Theme.d$1("--_ui5-input-icons-count"), `${this.iconsCount}`);
            const hasItems = !!this._flattenItems.length;
            const hasValue = !!this.value;
            const isFocused = this.shadowRoot.querySelector("input") === webcomponentsBase.t();
            if (this.shouldDisplayOnlyValueStateMessage) {
                this.openValueStatePopover();
            }
            else {
                this.closeValueStatePopover();
            }
            const preventOpenPicker = this.disabled || this.readonly;
            if (preventOpenPicker) {
                this.open = false;
            }
            else if (!this._isPhone) {
                this.open = hasItems && (this.open || (hasValue && isFocused && this.isTyping));
            }
            const value = this.value;
            const innerInput = this.getInputDOMRefSync();
            if (!innerInput || !value) {
                return;
            }
            const autoCompletedChars = innerInput.selectionEnd - innerInput.selectionStart;
            // Typehead causes issues on Android devices, so we disable it for now
            // If there is already a selection the autocomplete has already been performed
            if (this._shouldAutocomplete && !Theme.P$1() && !autoCompletedChars && !this._isKeyNavigation) {
                const item = this._getFirstMatchingItem(value);
                if (item) {
                    if (!this._isComposing) {
                        this._handleTypeAhead(item);
                    }
                    this._selectMatchingItem(item);
                }
            }
        }
        onAfterRendering() {
            const innerInput = this.getInputDOMRefSync();
            if (this.showSuggestions && this.Suggestions?._getPicker()) {
                this._listWidth = this.Suggestions._getListWidth();
                // disabled ItemNavigation from the list since we are not using it
                this.Suggestions._getList()._itemNavigation._getItems = () => [];
            }
            if (this._performTextSelection) {
                // this is required to syncronize lit-html input's value and user's input
                // lit-html does not sync its stored value for the value property when the user is typing
                if (innerInput.value !== this._innerValue) {
                    innerInput.value = this._innerValue;
                }
                if (this.typedInValue.length && this.value.length) {
                    innerInput.setSelectionRange(this.typedInValue.length, this.value.length);
                }
                this.fireDecoratorEvent("type-ahead");
            }
            this._performTextSelection = false;
            if (!webcomponentsBase.n$2(this._valueStateLinks, this.linksInAriaValueStateHiddenText)) {
                this._removeLinksEventListeners();
                this._addLinksEventListeners();
                this._valueStateLinks = this.linksInAriaValueStateHiddenText;
            }
        }
        _onkeydown(e) {
            this._isKeyNavigation = true;
            this._shouldAutocomplete = !this.noTypeahead && !(webcomponentsBase.Q(e) || webcomponentsBase.X(e) || webcomponentsBase.m$2(e));
            if (webcomponentsBase.P(e)) {
                return this._handleUp(e);
            }
            if (webcomponentsBase._(e)) {
                return this._handleDown(e);
            }
            if (webcomponentsBase.A(e)) {
                return this._handleSpace(e);
            }
            if (webcomponentsBase.x(e)) {
                return this._handleTab();
            }
            if (webcomponentsBase.b$1(e)) {
                const isValueUnchanged = this.previousValue === this.getInputDOMRefSync().value;
                const shouldSubmit = this._internals.form && this._internals.form.querySelectorAll("[ui5-input]").length === 1;
                this._enterKeyDown = true;
                if (isValueUnchanged && shouldSubmit) {
                    webcomponentsBase.i$1(this);
                }
                return this._handleEnter(e);
            }
            if (webcomponentsBase.j(e)) {
                return this._handlePageUp(e);
            }
            if (webcomponentsBase.q(e)) {
                return this._handlePageDown(e);
            }
            if (webcomponentsBase.M(e)) {
                return this._handleHome(e);
            }
            if (webcomponentsBase.n(e)) {
                return this._handleEnd(e);
            }
            if (webcomponentsBase.m$2(e)) {
                return this._handleEscape();
            }
            if (webcomponentsBase.Co(e)) {
                return this._handleCtrlAltF8();
            }
            if (this.showSuggestions) {
                this._clearPopoverFocusAndSelection();
            }
            this._isKeyNavigation = false;
        }
        _onkeyup(e) {
            // The native Delete event does not update the value property "on time".
            // So, the (native) change event is always fired with the old value
            if (webcomponentsBase.X(e)) {
                this.value = e.target.value;
            }
            this._enterKeyDown = false;
        }
        get currentItemIndex() {
            const allItems = this.Suggestions?._getItems();
            const currentItem = allItems.find(item => { return item.selected || item.focused; });
            const indexOfCurrentItem = currentItem ? allItems.indexOf(currentItem) : -1;
            return indexOfCurrentItem;
        }
        _handleUp(e) {
            if (this.Suggestions?.isOpened()) {
                this.Suggestions.onUp(e, this.currentItemIndex);
            }
        }
        _handleDown(e) {
            if (this.Suggestions?.isOpened()) {
                this.Suggestions.onDown(e, this.currentItemIndex);
            }
        }
        _handleSpace(e) {
            if (this.Suggestions) {
                this.Suggestions.onSpace(e);
            }
        }
        _handleTab() {
            if (this.Suggestions && (this.previousValue !== this.value)) {
                this.Suggestions.onTab();
            }
        }
        _handleCtrlAltF8() {
            this._handleLinkNavigation = true;
            const links = this.linksInAriaValueStateHiddenText;
            if (links.length) {
                links[0].focus();
            }
        }
        _addLinksEventListeners() {
            const links = this.linksInAriaValueStateHiddenText;
            links.forEach((link, index) => {
                this._linksListenersArray.push((e) => {
                    f(e, links, index, {
                        closeValueState: () => {
                            if (this.Suggestions?.isOpened()) {
                                this.Suggestions?.close();
                            }
                            if (this.valueStateOpen) {
                                this.closeValueStatePopover();
                            }
                        },
                        focusInput: () => {
                            this._handleLinkNavigation = false;
                            this.getInputDOMRef().focus();
                        },
                        navigateToItem: () => {
                            if (this._handleLinkNavigation) {
                                this._handleLinkNavigation = false;
                                if (this.Suggestions?.isOpened()) {
                                    this.innerFocusIn();
                                    (this.getInputDOMRef()).focus();
                                    this.Suggestions.onDown(e, this.currentItemIndex);
                                }
                            }
                            else {
                                this._handleDown(e);
                            }
                        },
                        isPopoverOpen: () => { return (this.Suggestions && this.Suggestions?.isOpened()) || false; },
                    });
                });
                link.addEventListener("keydown", this._linksListenersArray[index]);
            });
        }
        _removeLinksEventListeners() {
            const links = this.linksInAriaValueStateHiddenText;
            links.forEach((link, index) => {
                link.removeEventListener("keydown", this._linksListenersArray[index]);
            });
            this._linksListenersArray = [];
            this._handleLinkNavigation = false;
        }
        _handleEnter(e) {
            // if a group item is focused, this is false
            const suggestionItemPressed = !!(this.Suggestions?.onEnter(e));
            const innerInput = this.getInputDOMRefSync();
            const matchingItem = this._selectableItems.find(item => {
                return item.text === this.value;
            });
            if (matchingItem) {
                const itemText = matchingItem.text || "";
                innerInput.setSelectionRange(itemText.length, itemText.length);
                if (!suggestionItemPressed) {
                    this.fireSelectionChange(matchingItem, true);
                    this.acceptSuggestion(matchingItem, true);
                    this.open = false;
                }
            }
            if (this._isPhone && !this._flattenItems.length && !this.isTypeNumber) {
                innerInput.setSelectionRange(this.value.length, this.value.length);
            }
            if (!suggestionItemPressed) {
                this.lastConfirmedValue = this.value;
                return;
            }
            this.focused = true;
        }
        _handlePageUp(e) {
            if (this._isSuggestionsFocused) {
                this.Suggestions?.onPageUp(e);
            }
            else {
                e.preventDefault();
            }
        }
        _handlePageDown(e) {
            if (this._isSuggestionsFocused) {
                this.Suggestions?.onPageDown(e);
            }
            else {
                e.preventDefault();
            }
        }
        _handleHome(e) {
            if (this._isSuggestionsFocused) {
                this.Suggestions?.onHome(e);
            }
        }
        _handleEnd(e) {
            if (this._isSuggestionsFocused) {
                this.Suggestions?.onEnd(e);
            }
        }
        _handleEscape() {
            const hasSuggestions = this.showSuggestions && !!this.Suggestions;
            const isOpen = hasSuggestions && this.open;
            const innerInput = this.getInputDOMRefSync();
            const isAutoCompleted = innerInput.selectionEnd - innerInput.selectionStart > 0;
            this.isTyping = false;
            if (this.value !== this.previousValue && this.value !== this.lastConfirmedValue && !this.open) {
                this.value = this.lastConfirmedValue ? this.lastConfirmedValue : this.previousValue;
                this.fireDecoratorEvent(INPUT_EVENTS.INPUT, { inputType: "" });
                return;
            }
            if (!isOpen) {
                this.value = this.lastConfirmedValue ? this.lastConfirmedValue : this.previousValue;
                return;
            }
            if (isOpen && this.Suggestions?._isItemOnTarget()) {
                // Restore the value.
                this.value = this.typedInValue || this.valueBeforeSelectionStart;
                this.focused = true;
                return;
            }
            if (isAutoCompleted) {
                this.value = this.typedInValue;
            }
            this.focused = true;
        }
        _onfocusin(e) {
            this.focused = true; // invalidating property
            if (!this._focusedAfterClear) {
                this.previousValue = this.value;
            }
            this.valueBeforeSelectionStart = this.value;
            this._inputIconFocused = !!e.target && e.target === this.querySelector("[ui5-icon]");
            this._focusedAfterClear = false;
        }
        /**
         * Called on "focusin" of the native input HTML Element.
         * **Note:** implemented in MultiInput, but used in the Input template.
         */
        innerFocusIn() { }
        _onfocusout(e) {
            const toBeFocused = e.relatedTarget;
            if (this.Suggestions?._getPicker().contains(toBeFocused) || this.contains(toBeFocused) || this.getSlottedNodes("valueStateMessage").some(el => el.contains(toBeFocused))) {
                return;
            }
            this._keepInnerValue = false;
            this.focused = false; // invalidating property
            this._isChangeTriggeredBySuggestion = false;
            if (this.showClearIcon && !this._effectiveShowClearIcon) {
                this._clearIconClicked = false;
                this._handleChange();
            }
            this.open = false;
            this._clearPopoverFocusAndSelection();
            if (!this._clearIconClicked) {
                this.previousValue = "";
            }
            this.lastConfirmedValue = "";
            this.isTyping = false;
            if ((this.value !== this.previousValue) && this.showClearIcon) {
                this._clearIconClicked = false;
            }
        }
        _clearPopoverFocusAndSelection() {
            if (!this.showSuggestions || !this.Suggestions) {
                return;
            }
            this.hasSuggestionItemSelected = false;
            this.Suggestions?._deselectItems();
            this.Suggestions?._clearItemFocus();
        }
        _click() {
            if (Theme.d() && !this.readonly && this.Suggestions) {
                this.blur();
                this.open = true;
            }
        }
        _handleChange() {
            const shouldSubmit = this._internals.form && this._internals.form.querySelectorAll("[ui5-input]").length === 1;
            if (this._clearIconClicked) {
                this._clearIconClicked = false;
                return;
            }
            const fireChange = () => {
                if (!this._isChangeTriggeredBySuggestion) {
                    this.fireDecoratorEvent(INPUT_EVENTS.CHANGE);
                }
                this.previousValue = this.value;
                this.typedInValue = this.value;
                this._isChangeTriggeredBySuggestion = false;
            };
            if (this.previousValue !== this.getInputDOMRefSync().value) {
                // if picker is open there might be a selected item, wait next tick to get the value applied
                if (this.Suggestions?._getPicker().open && this._flattenItems.some(item => item.hasAttribute("ui5-suggestion-item") && item.selected)) {
                    this._changeToBeFired = true;
                }
                else {
                    fireChange();
                    if (this._enterKeyDown && shouldSubmit) {
                        webcomponentsBase.i$1(this);
                    }
                }
            }
        }
        _clear() {
            const valueBeforeClear = this.value;
            this.value = "";
            const prevented = !this.fireDecoratorEvent(INPUT_EVENTS.INPUT, { inputType: "" });
            if (prevented) {
                this.value = valueBeforeClear;
                return;
            }
            this.typedInValue = "";
            if (!this._isPhone) {
                this.fireResetSelectionChange();
                this.focus();
                this._focusedAfterClear = true;
            }
        }
        _iconMouseDown() {
            this._clearIconClicked = true;
        }
        _scroll(e) {
            this.fireDecoratorEvent("suggestion-scroll", {
                scrollTop: e.detail.scrollTop,
                scrollContainer: e.detail.targetRef,
            });
        }
        _handleSelect() {
            this.fireDecoratorEvent("select");
        }
        _handleInput(e) {
            const eventType = (e.detail && e.detail.inputType) || "";
            this._input(e, eventType);
        }
        _handleNativeInput(e) {
            const eventType = e.inputType || "";
            this._input(e, eventType);
        }
        _input(e, eventType) {
            const inputDomRef = this.getInputDOMRefSync();
            const emptyValueFiredOnNumberInput = this.value && this.isTypeNumber && !inputDomRef.value;
            this._keepInnerValue = false;
            const allowedEventTypes = [
                "deleteWordBackward",
                "deleteWordForward",
                "deleteSoftLineBackward",
                "deleteSoftLineForward",
                "deleteEntireSoftLine",
                "deleteHardLineBackward",
                "deleteHardLineForward",
                "deleteByDrag",
                "deleteByCut",
                "deleteContent",
                "deleteContentBackward",
                "deleteContentForward",
                "historyUndo",
            ];
            this._shouldAutocomplete = !allowedEventTypes.includes(eventType) && !this.noTypeahead;
            if (e instanceof InputEvent) {
                // ---- Special cases of numeric Input ----
                // ---------------- Start -----------------
                // When the last character after the delimiter is removed.
                // In such cases, we want to skip the re-rendering of the
                // component as this leads to cursor repositioning and causes user experience issues.
                // There are few scenarios:
                // Example: type "123.4" and press BACKSPACE - the native input is firing event with the whole part as value (123).
                // Pressing BACKSPACE again will remove the delimiter and the native input will fire event with the whole part as value again (123).
                // Example: type "123.456", select/mark "456" and press BACKSPACE - the native input is firing event with the whole part as value (123).
                // Example: type "123.456", select/mark "123.456" and press BACKSPACE - the native input is firing event with empty value.
                const delimiterCase = this.isTypeNumber
                    && (e.inputType === "deleteContentForward" || e.inputType === "deleteContentBackward")
                    && !e.target.value.includes(".")
                    && this.value.includes(".");
                // Handle special numeric notation with "e", example "12.5e12"
                const eNotationCase = emptyValueFiredOnNumberInput && e.data === "e";
                // Handle special numeric notation with "-", example "-3"
                // When pressing BACKSPACE, the native input fires event with empty value
                const minusRemovalCase = emptyValueFiredOnNumberInput
                    && this.value.startsWith("-")
                    && this.value.length === 2
                    && (e.inputType === "deleteContentForward" || e.inputType === "deleteContentBackward");
                if (delimiterCase || eNotationCase || minusRemovalCase) {
                    this.value = e.target.value;
                    this._keepInnerValue = true;
                }
                // ----------------- End ------------------
            }
            if (e.target === inputDomRef) {
                this.focused = true;
                // stop the native event, as the semantic "input" would be fired.
                e.stopImmediatePropagation();
            }
            this.fireEventByAction(INPUT_ACTIONS.ACTION_ENTER, e);
            this.hasSuggestionItemSelected = false;
            if (this.Suggestions) {
                this.Suggestions.updateSelectedItemPosition(-1);
            }
            this.isTyping = true;
        }
        _startsWithMatchingItems(str) {
            return StartsWith(str, this._selectableItems, "text");
        }
        _getFirstMatchingItem(current) {
            if (!this._flattenItems.length) {
                return;
            }
            const matchingItems = this._startsWithMatchingItems(current).filter(item => !this._isGroupItem(item));
            if (matchingItems.length) {
                return matchingItems[0];
            }
        }
        _handleSelectionChange(e) {
            this.Suggestions?.onItemPress(e);
        }
        _selectMatchingItem(item) {
            item.selected = true;
        }
        _handleTypeAhead(item) {
            const value = item.text ? item.text : "";
            this._innerValue = value;
            this.value = value;
            this._performTextSelection = true;
            this._shouldAutocomplete = false;
        }
        _handleResize() {
            this._inputWidth = this.offsetWidth;
        }
        _updateAssociatedLabelsTexts() {
            this._associatedLabelsTexts = AccessibilityTextsHelper.M(this);
            this._accessibleLabelsRefTexts = AccessibilityTextsHelper.E(this);
            this._associatedDescriptionRefTexts = AccessibilityTextsHelper.p(this);
        }
        _closePicker() {
            this.open = false;
        }
        _afterOpenPicker() {
            // Set initial focus to the native input
            if (Theme.d()) {
                (this.getInputDOMRef()).focus();
                this._composition?.addEventListeners();
            }
            this._handlePickerAfterOpen();
        }
        _afterClosePicker() {
            this.announceSelectedItem();
            // close device's keyboard and prevent further typing
            if (Theme.d()) {
                this.blur();
                this.focused = false;
            }
            if (this._changeToBeFired && !this._isChangeTriggeredBySuggestion) {
                this.previousValue = this.value;
                this.fireDecoratorEvent(INPUT_EVENTS.CHANGE);
            }
            else {
                this._isChangeTriggeredBySuggestion = false;
            }
            this._changeToBeFired = false;
            this.open = false;
            this.isTyping = false;
            if (this.hasSuggestionItemSelected) {
                this.focus();
            }
            this._handlePickerAfterClose();
        }
        _handlePickerAfterOpen() {
            this.fireDecoratorEvent("open");
        }
        _handlePickerAfterClose() {
            this.Suggestions?._onClose();
            this.fireDecoratorEvent("close");
        }
        openValueStatePopover() {
            this.valueStateOpen = true;
        }
        closeValueStatePopover() {
            this.valueStateOpen = false;
        }
        _handleValueStatePopoverAfterClose() {
            this.valueStateOpen = false;
            this._handleLinkNavigation = false;
        }
        _getValueStatePopover() {
            return this.shadowRoot.querySelector("[ui5-popover]");
        }
        enableSuggestions() {
            if (this.Suggestions) {
                return;
            }
            const setup = (Suggestions) => {
                Suggestions.i18nBundle = Input_1.i18nBundle;
                this.Suggestions = new Suggestions(this, "suggestionItems", true, false);
            };
            // If the feature is preloaded (the user manually imported InputSuggestions.js), it is already available on the constructor
            if (Input_1.SuggestionsClass) {
                setup(Input_1.SuggestionsClass);
                // If feature is not preloaded, load it dynamically
            }
            else {
                new Promise(function (resolve, reject) { require(['sap/f/thirdparty/_dynamics/InputSuggestions'], resolve, reject); }).then(SuggestionsModule => {
                    setup(SuggestionsModule.default);
                });
            }
        }
        /**
         * Enables IME composition handling.
         * Dynamically loads the InputComposition feature and sets up event listeners.
         * @private
         */
        _enableComposition() {
            if (this._composition) {
                return;
            }
            const setup = (FeatureClass) => {
                this._composition = new FeatureClass({
                    getInputEl: () => this.getInputDOMRefSync(),
                    updateCompositionState: (isComposing) => {
                        this._isComposing = isComposing;
                    },
                });
                this._composition.addEventListeners();
            };
            if (Input_1.composition) {
                setup(Input_1.composition);
            }
            else {
                new Promise(function (resolve, reject) { require(['sap/f/thirdparty/_dynamics/InputComposition'], resolve, reject); }).then(CompositionModule => {
                    Input_1.composition = CompositionModule.default;
                    setup(CompositionModule.default);
                });
            }
        }
        acceptSuggestion(item, keyboardUsed) {
            if (this._isGroupItem(item)) {
                return;
            }
            const itemText = item.text || "";
            const fireChange = keyboardUsed
                ? this.valueBeforeItemSelection !== itemText : this.previousValue !== itemText;
            this.hasSuggestionItemSelected = true;
            this.value = itemText;
            if (fireChange && (this.previousValue !== itemText)) {
                this.valueBeforeItemSelection = itemText;
                this.lastConfirmedValue = itemText;
                this._performTextSelection = true;
                this.fireDecoratorEvent(INPUT_EVENTS.CHANGE);
                this._isChangeTriggeredBySuggestion = true;
                // value might change in the change event handler
                this.typedInValue = this.value;
                this.previousValue = this.value;
            }
            this.valueBeforeSelectionStart = "";
            this.isTyping = false;
            this.open = false;
        }
        /**
         * Updates the input value on item select.
         * @param item The item that is on select
         */
        updateValueOnSelect(item) {
            const itemValue = this._isGroupItem(item) ? this.valueBeforeSelectionStart : item.text;
            this.value = itemValue || "";
            this._performTextSelection = true;
        }
        fireEventByAction(action, e) {
            const valueBeforeInput = this.value;
            const inputRef = this.getInputDOMRefSync();
            if (this.disabled || this.readonly) {
                return;
            }
            const inputValue = this.getInputValue();
            const isUserInput = action === INPUT_ACTIONS.ACTION_ENTER;
            this.value = inputValue;
            this.typedInValue = inputValue;
            this.valueBeforeSelectionStart = inputValue;
            const valueAfterInput = this.value;
            if (isUserInput) { // input
                const inputType = e.inputType || "";
                const prevented = !this.fireDecoratorEvent(INPUT_EVENTS.INPUT, { inputType });
                if (prevented) {
                    // if the value is not changed after preventing the input event, revert the value
                    if (valueAfterInput === this.value) {
                        this.value = valueBeforeInput;
                    }
                    inputRef && (inputRef.value = this.value);
                }
                this.fireResetSelectionChange();
            }
        }
        getInputValue() {
            const domRef = this.getDomRef();
            if (domRef) {
                return (this.getInputDOMRef()).value;
            }
            return "";
        }
        getInputDOMRef() {
            if (Theme.d() && this.Suggestions) {
                return this.Suggestions._getPicker().querySelector(".ui5-input-inner-phone");
            }
            return this.nativeInput;
        }
        getInputDOMRefSync() {
            if (Theme.d() && this.Suggestions?._getPicker()) {
                return this.Suggestions._getPicker().querySelector(".ui5-input-inner-phone").shadowRoot.querySelector("input");
            }
            return this.nativeInput;
        }
        /**
         * Returns a reference to the native input element
         * @protected
         */
        get nativeInput() {
            const domRef = this.getDomRef();
            return domRef ? domRef.querySelector(`input`) : null;
        }
        get nativeInputWidth() {
            return this.nativeInput ? this.nativeInput.offsetWidth : 0;
        }
        /**
         * Returns if the suggestions popover is scrollable.
         * The method returns `Promise` that resolves to true,
         * if the popup is scrollable and false otherwise.
         */
        isSuggestionsScrollable() {
            if (!this.Suggestions) {
                return Promise.resolve(false);
            }
            return this.Suggestions?._isScrollable();
        }
        onItemMouseDown(e) {
            e.preventDefault();
        }
        onItemSelected(suggestionItem, keyboardUsed) {
            const shouldFireSelectionChange = !keyboardUsed && !suggestionItem?.focused && this.valueBeforeItemSelection !== suggestionItem.text;
            if (shouldFireSelectionChange) {
                this.fireSelectionChange(suggestionItem, true);
            }
            this.acceptSuggestion(suggestionItem, keyboardUsed);
        }
        _handleSuggestionItemPress(e) {
            this.Suggestions?.onItemPress(e);
        }
        onItemSelect(item) {
            this.valueBeforeItemSelection = this.value;
            this.updateValueOnSelect(item);
            this.announceSelectedItem();
            this.fireSelectionChange(item, true);
        }
        get _flattenItems() {
            return this.getSlottedNodes("suggestionItems").flatMap(item => {
                return this._isGroupItem(item) ? [item, ...item.items] : [item];
            });
        }
        get _selectableItems() {
            return this._flattenItems.filter(item => !this._isGroupItem(item));
        }
        get valueStateTypeMappings() {
            return {
                "Positive": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_SUCCESS),
                "Information": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_INFORMATION),
                "Negative": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_ERROR),
                "Critical": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_TYPE_WARNING),
            };
        }
        valueStateTextMappings() {
            return {
                "Positive": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
                "Information": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
                "Negative": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
                "Critical": Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
            };
        }
        announceSelectedItem() {
            const invisibleText = this.shadowRoot.querySelector(`#selectionText`);
            if (invisibleText) {
                invisibleText.textContent = this.itemSelectionAnnounce;
            }
        }
        fireSelectionChange(item, isValueFromSuggestions) {
            if (this.Suggestions) {
                this.fireDecoratorEvent(INPUT_EVENTS.SELECTION_CHANGE, { item });
                this._isLatestValueFromSuggestions = isValueFromSuggestions;
            }
        }
        fireResetSelectionChange() {
            if (this._isLatestValueFromSuggestions) {
                this.fireSelectionChange(null, false);
                this.valueBeforeItemSelection = this.value;
            }
        }
        get _readonly() {
            return this.readonly && !this.disabled;
        }
        get _headerTitleText() {
            return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
        }
        get _suggestionsOkButtonText() {
            return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_OK_BUTTON);
        }
        get _suggestionsCancelButtonText() {
            return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_CANCEL_BUTTON);
        }
        get clearIconAccessibleName() {
            return Input_1.i18nBundle.getText(i18nDefaults.INPUT_CLEAR_ICON_ACC_NAME);
        }
        get _popupLabel() {
            return Input_1.i18nBundle.getText(i18nDefaults.INPUT_AVALIABLE_VALUES);
        }
        get inputType() {
            return this.type;
        }
        get inputNativeType() {
            return this.type.toLowerCase();
        }
        get isTypeNumber() {
            return this.type === InputType$1.Number;
        }
        get suggestionsTextId() {
            return this.showSuggestions ? `suggestionsText` : "";
        }
        get valueStateTextId() {
            return this.hasValueState ? `valueStateDesc` : "";
        }
        get _accInfoAriaDescription() {
            return (this._inputAccInfo && this._inputAccInfo.ariaDescription) || "";
        }
        get _accInfoAriaDescriptionId() {
            const hasAriaDescription = this._accInfoAriaDescription !== "";
            return hasAriaDescription ? "descr" : "";
        }
        get ariaDescriptionText() {
            return this._associatedDescriptionRefTexts || AccessibilityTextsHelper.L(this);
        }
        get ariaDescriptionTextId() {
            return this.ariaDescriptionText ? "accessibleDescription" : "";
        }
        get ariaDescribedByIds() {
            return [
                this.suggestionsTextId,
                this.valueStateTextId,
                this._valueStateLinksShortcutsTextAccId,
                this._inputAccInfo.ariaDescribedBy,
                this._accInfoAriaDescriptionId,
                this.ariaDescriptionTextId,
            ].filter(Boolean).join(" ");
        }
        get accInfo() {
            const ariaHasPopupDefault = this.showSuggestions ? "dialog" : undefined;
            const ariaAutoCompleteDefault = this.showSuggestions ? "list" : undefined;
            return {
                "ariaRoledescription": this._inputAccInfo && (this._inputAccInfo.ariaRoledescription || undefined),
                "ariaDescribedBy": this.ariaDescribedByIds || undefined,
                "ariaInvalid": this.valueState === ValueState.o.Negative ? true : undefined,
                "ariaHasPopup": this._inputAccInfo.ariaHasPopup ? this._inputAccInfo.ariaHasPopup : ariaHasPopupDefault,
                "ariaAutoComplete": this._inputAccInfo.ariaAutoComplete ? this._inputAccInfo.ariaAutoComplete : ariaAutoCompleteDefault,
                "role": this._inputAccInfo && this._inputAccInfo.role,
                "ariaControls": this._inputAccInfo && this._inputAccInfo.ariaControls,
                "ariaExpanded": this._inputAccInfo && this._inputAccInfo.ariaExpanded,
                "ariaDescription": this._accInfoAriaDescription,
                "accessibleDescription": this.ariaDescriptionText,
                "ariaLabel": (this._inputAccInfo && this._inputAccInfo.ariaLabel) || this._accessibleLabelsRefTexts || this.accessibleName || this._associatedLabelsTexts || undefined,
            };
        }
        get nativeInputAttributes() {
            return {
                "min": this.isTypeNumber ? this._nativeInputAttributes.min : undefined,
                "max": this.isTypeNumber ? this._nativeInputAttributes.max : undefined,
                "step": this.isTypeNumber ? (this._nativeInputAttributes.step || "any") : undefined,
            };
        }
        get ariaValueStateHiddenText() {
            if (!this.hasValueState) {
                return;
            }
            const valueState = this.valueState !== ValueState.o.None ? this.valueStateTypeMappings[this.valueState] : "";
            if (this.shouldDisplayDefaultValueStateMessage) {
                return this.valueStateText ? `${valueState} ${this.valueStateText}` : valueState;
            }
            return this.valueStateMessage.length ? `${valueState} ${this.valueStateMessage.map(el => el.textContent).join(" ")}` : valueState;
        }
        get itemSelectionAnnounce() {
            return this.Suggestions ? this.Suggestions.itemSelectionAnnounce : "";
        }
        get linksInAriaValueStateHiddenText() {
            const links = [];
            if (this.valueStateMessage) {
                this.valueStateMessage.forEach(element => {
                    if (element.children.length) {
                        element.querySelectorAll("ui5-link").forEach(link => {
                            links.push(link);
                        });
                    }
                });
            }
            return links;
        }
        get valueStateLinksShortcutsTextAcc() {
            const links = this.linksInAriaValueStateHiddenText;
            if (!links.length) {
                return "";
            }
            if (Theme.A()) {
                return links.length === 1
                    ? Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_LINK_MAC)
                    : Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_LINKS_MAC);
            }
            return links.length === 1
                ? Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_LINK)
                : Input_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_LINKS);
        }
        get _valueStateLinksShortcutsTextAccId() {
            return this.linksInAriaValueStateHiddenText.length > 0 ? `hiddenText-value-state-link-shortcut` : "";
        }
        get iconsCount() {
            const slottedIconsCount = this.icon ? this.icon.length : 0;
            const clearIconCount = Number(this._effectiveShowClearIcon) ?? 0;
            return slottedIconsCount + clearIconCount;
        }
        get classes() {
            return {
                popover: {
                    "ui5-suggestions-popover": this.showSuggestions,
                    "ui5-popover-with-value-state-header-phone": this._isPhone && this.showSuggestions && this.hasValueStateMessage,
                    "ui5-popover-with-value-state-header": !this._isPhone && this.showSuggestions && this.hasValueStateMessage,
                },
                popoverValueState: {
                    "ui5-valuestatemessage-root": true,
                    "ui5-valuestatemessage-header": true,
                    "ui5-valuestatemessage--success": this.valueState === ValueState.o.Positive,
                    "ui5-valuestatemessage--error": this.valueState === ValueState.o.Negative,
                    "ui5-valuestatemessage--warning": this.valueState === ValueState.o.Critical,
                    "ui5-valuestatemessage--information": this.valueState === ValueState.o.Information,
                },
            };
        }
        get styles() {
            const remSizeInPx = parseInt(getComputedStyle(document.documentElement).fontSize);
            const stylesObject = {
                suggestionPopoverHeader: {
                    "display": this._listWidth === 0 ? "none" : "inline-block",
                    "width": this._listWidth ? `${this._listWidth}px` : "",
                    "max-width": "inherit",
                },
                suggestionsPopover: {
                    "min-width": this._inputWidth ? `${this._inputWidth}px` : "",
                    "max-width": this._inputWidth && (this._inputWidth / remSizeInPx) > 40 ? `${this._inputWidth}px` : "40rem",
                },
                innerInput: {
                    "padding": "",
                },
            };
            return stylesObject;
        }
        get suggestionSeparators() {
            return "None";
        }
        get shouldDisplayOnlyValueStateMessage() {
            return this.hasValueStateMessage && !this.readonly && !this.open && this.focused;
        }
        get shouldDisplayDefaultValueStateMessage() {
            return !this.valueStateMessage.length && this.hasValueStateMessage;
        }
        get hasValueState() {
            return this.valueState !== ValueState.o.None;
        }
        get hasValueStateMessage() {
            return this.hasValueState && this.valueState !== ValueState.o.Positive
                && (!this._inputIconFocused // Handles the cases when valueStateMessage is forwarded (from datepicker e.g.)
                    || !!(this._isPhone && this.Suggestions)); // Handles Input with suggestions on mobile
        }
        get valueStateText() {
            return this.valueState !== ValueState.o.None ? this.valueStateTextMappings()[this.valueState] : undefined;
        }
        get suggestionsText() {
            return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS);
        }
        get availableSuggestionsCount() {
            if (this.showSuggestions && (this.value || this.Suggestions?.isOpened())) {
                const nonGroupItems = this._selectableItems;
                switch (nonGroupItems.length) {
                    case 0:
                        return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_NO_HIT);
                    case 1:
                        return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_ONE_HIT);
                    default:
                        return Input_1.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_MORE_HITS, nonGroupItems.length);
                }
            }
            return undefined;
        }
        get step() {
            return this.isTypeNumber ? "any" : undefined;
        }
        get _isPhone() {
            return Theme.d();
        }
        get _isSuggestionsFocused() {
            return !this.focused && this.Suggestions?.isOpened();
        }
        /**
         * Returns the placeholder value.
         * @protected
         */
        get _placeholder() {
            return this.placeholder;
        }
        /**
         * This method is relevant for sap_horizon theme only
         */
        get _valueStateInputIcon() {
            const iconPerValueState = {
                Negative: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM7.70711 13.7071C7.31658 14.0976 6.68342 14.0976 6.29289 13.7071C5.90237 13.3166 5.90237 12.6834 6.29289 12.2929L8.58579 10L6.29289 7.70711C5.90237 7.31658 5.90237 6.68342 6.29289 6.29289C6.68342 5.90237 7.31658 5.90237 7.70711 6.29289L10 8.58579L12.2929 6.29289C12.6834 5.90237 13.3166 5.90237 13.7071 6.29289C14.0976 6.68342 14.0976 7.31658 13.7071 7.70711L11.4142 10L13.7071 12.2929C14.0976 12.6834 14.0976 13.3166 13.7071 13.7071C13.3166 14.0976 12.6834 14.0976 12.2929 13.7071L10 11.4142L7.70711 13.7071Z" fill="#EE3939"/>`,
                Critical: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M11.8619 0.49298C11.6823 0.187541 11.3544 0 11 0C10.6456 0 10.3177 0.187541 10.1381 0.49298L0.138066 17.493C-0.0438112 17.8022 -0.0461447 18.1851 0.13195 18.4965C0.310046 18.8079 0.641283 19 1 19H21C21.3587 19 21.69 18.8079 21.868 18.4965C22.0461 18.1851 22.0438 17.8022 21.8619 17.493L11.8619 0.49298ZM11 6C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11C10.4477 11 10 10.5523 10 10V7C10 6.44772 10.4477 6 11 6ZM11 16C11.8284 16 12.5 15.3284 12.5 14.5C12.5 13.6716 11.8284 13 11 13C10.1716 13 9.5 13.6716 9.5 14.5C9.5 15.3284 10.1716 16 11 16Z" fill="#F58B00"/>`,
                Positive: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10ZM14.7071 6.29289C14.3166 5.90237 13.6834 5.90237 13.2929 6.29289L8 11.5858L6.70711 10.2929C6.31658 9.90237 5.68342 9.90237 5.29289 10.2929C4.90237 10.6834 4.90237 11.3166 5.29289 11.7071L7.29289 13.7071C7.68342 14.0976 8.31658 14.0976 8.70711 13.7071L14.7071 7.70711C15.0976 7.31658 15.0976 6.68342 14.7071 6.29289Z" fill="#36A41D"/>`,
                Information: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M3 0C1.34315 0 0 1.34315 0 3V15C0 16.6569 1.34315 18 3 18H15C16.6569 18 18 16.6569 18 15V3C18 1.34315 16.6569 0 15 0H3ZM9 6.5C9.82843 6.5 10.5 5.82843 10.5 5C10.5 4.17157 9.82843 3.5 9 3.5C8.17157 3.5 7.5 4.17157 7.5 5C7.5 5.82843 8.17157 6.5 9 6.5ZM9 8.5C9.55228 8.5 10 8.94772 10 9.5V13.5C10 14.0523 9.55228 14.5 9 14.5C8.44771 14.5 8 14.0523 8 13.5V9.5C8 8.94772 8.44771 8.5 9 8.5Z" fill="#1B90FF"/>`,
            };
            if (this.valueState !== ValueState.o.None) {
                return `
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 20 20" fill="none">
				${iconPerValueState[this.valueState]};
			</svg>
			`;
            }
            return "";
        }
        get _valueStatePopoverHorizontalAlign() {
            return this.effectiveDir !== "rtl" ? "Start" : "End";
        }
        /**
         * This method is relevant for sap_horizon theme only
         */
        get _valueStateMessageInputIcon() {
            const iconPerValueState = {
                Negative: "error",
                Critical: "alert",
                Positive: "sys-enter-2",
                Information: "information",
            };
            return this.valueState !== ValueState.o.None ? iconPerValueState[this.valueState] : "";
        }
        /**
         * Returns the caret position inside the native input
         * @protected
         */
        getCaretPosition() {
            return n(this.nativeInput);
        }
        /**
         * Sets the caret to a certain position inside the native input
         * @protected
         */
        setCaretPosition(pos) {
            o(this.nativeInput, pos);
        }
        /**
         * Removes the fractional part of floating-point number.
         * @param value the numeric value of Input of type "Number"
         */
        removeFractionalPart(value) {
            if (value.includes(".")) {
                return value.slice(0, value.indexOf("."));
            }
            if (value.includes(",")) {
                return value.slice(0, value.indexOf(","));
            }
            return value;
        }
    };
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "disabled", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "highlight", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "placeholder", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "readonly", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "required", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "noTypeahead", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "type", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "value", void 0);
    __decorate$4([
        webcomponentsBase.s({ noAttribute: true })
    ], Input.prototype, "_innerValue", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "valueState", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "name", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "showSuggestions", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Number })
    ], Input.prototype, "maxlength", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "accessibleName", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "accessibleNameRef", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "accessibleDescription", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "accessibleDescriptionRef", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "showClearIcon", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "open", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "_effectiveShowClearIcon", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "focused", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Input.prototype, "hint", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Input.prototype, "valueStateOpen", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Object })
    ], Input.prototype, "_inputAccInfo", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Object })
    ], Input.prototype, "_nativeInputAttributes", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Number })
    ], Input.prototype, "_inputWidth", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Number })
    ], Input.prototype, "_listWidth", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Input.prototype, "_inputIconFocused", void 0);
    __decorate$4([
        webcomponentsBase.s({ noAttribute: true })
    ], Input.prototype, "_associatedLabelsTexts", void 0);
    __decorate$4([
        webcomponentsBase.s({ noAttribute: true })
    ], Input.prototype, "_accessibleLabelsRefTexts", void 0);
    __decorate$4([
        webcomponentsBase.s({ noAttribute: true })
    ], Input.prototype, "_associatedDescriptionRefTexts", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Object })
    ], Input.prototype, "Suggestions", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Array })
    ], Input.prototype, "_linksListenersArray", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Input.prototype, "_isComposing", void 0);
    __decorate$4([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], Input.prototype, "suggestionItems", void 0);
    __decorate$4([
        webcomponentsBase.d()
    ], Input.prototype, "icon", void 0);
    __decorate$4([
        webcomponentsBase.d({
            type: HTMLElement,
            invalidateOnChildChange: true,
        })
    ], Input.prototype, "valueStateMessage", void 0);
    __decorate$4([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Input, "i18nBundle", void 0);
    Input = Input_1 = __decorate$4([
        webcomponentsBase.m({
            tag: "ui5-input",
            languageAware: true,
            formAssociated: true,
            renderer: parametersBundle_css.y,
            template: InputTemplate,
            styles: [
                inputStyles,
                ResponsivePopoverCommonCss,
                ValueStateMessageCss,
                SuggestionsCss,
            ],
        })
        /**
         * Fired when the input operation has finished by pressing Enter or on focusout.
         * @public
         */
        ,
        eventStrict.l("change", {
            bubbles: true,
        })
        /**
         * Fired when the value of the component changes at each keystroke,
         * and when a suggestion item has been selected.
         * @public
         */
        ,
        eventStrict.l("input", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when some text has been selected.
         *
         * @since 2.0.0
         * @public
         */
        ,
        eventStrict.l("select", {
            bubbles: true,
        })
        /**
         * Fired when the user navigates to a suggestion item via the ARROW keys,
         * as a preview, before the final selection.
         * @param {HTMLElement} item The previewed suggestion item.
         * @public
         * @since 2.0.0
         */
        ,
        eventStrict.l("selection-change", {
            bubbles: true,
        })
        /**
         * Fires when a suggestion item is autocompleted in the input.
         *
         * @private
         */
        ,
        eventStrict.l("type-ahead", {
            bubbles: true,
        })
        /**
         * Fired when the user scrolls the suggestion popover.
         * @param {Integer} scrollTop The current scroll position.
         * @param {HTMLElement} scrollContainer The scroll container.
         * @protected
         * @since 1.0.0-rc.8
         */
        ,
        eventStrict.l("suggestion-scroll", {
            bubbles: true,
        })
        /**
         * Fired when the suggestions picker is open.
         * @public
         * @since 2.0.0
         */
        ,
        eventStrict.l("open", {
            bubbles: true,
        })
        /**
         * Fired when the suggestions picker is closed.
         * @public
         * @since 2.0.0
         */
        ,
        eventStrict.l("close")
    ], Input);
    Input.define();
    var Input$1 = Input;

    function SuggestionItemTemplate() {
        return [ListItemBaseTemplate.call(this, { listItemContent }, { role: "option" })];
    }
    function listItemContent() {
        return parametersBundle_css.jsx("div", { part: "content", id: "content", class: "ui5-li-content", children: parametersBundle_css.jsxs("div", { class: "ui5-li-text-wrapper", children: [parametersBundle_css.jsx("span", { part: "title", className: "ui5-li-title", dangerouslySetInnerHTML: { __html: this.markupText } }), this.additionalText &&
                        parametersBundle_css.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", children: this.additionalText })] }) });
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var styles = `:host([ui5-suggestion-item]){height:auto;min-height:var(--_ui5-v2-15-0_list_item_base_height)}:host([ui5-suggestion-item]) .ui5-li-root{min-height:var(--_ui5-v2-15-0_list_item_base_height)}:host([ui5-suggestion-item]) .ui5-li-content{padding-bottom:.5rem;padding-top:.5rem;box-sizing:border-box}
`;

    var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * The `ui5-suggestion-item` represents the suggestion item of the `ui5-input`.
     * @constructor
     * @extends ListItemBase
     * @abstract
     * @implements { IInputSuggestionItemSelectable }
     * @public
     */
    let SuggestionItem = class SuggestionItem extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            /**
             * Defines the markup text that will be displayed as suggestion.
             * Used for highlighting the matching parts of the text.
             *
             * @since 2.0.0
             * @private
             */
            this.markupText = "";
        }
        onEnterDOM() {
            if (Theme.f()) {
                this.setAttribute("desktop", "");
            }
        }
        get _effectiveTabIndex() {
            return -1;
        }
    };
    __decorate$3([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "text", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "additionalText", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "markupText", void 0);
    SuggestionItem = __decorate$3([
        webcomponentsBase.m({
            tag: "ui5-suggestion-item",
            template: SuggestionItemTemplate,
            styles: [ListItemBase.ListItemBase.styles, styles],
        })
    ], SuggestionItem);
    SuggestionItem.define();
    var SuggestionItem$1 = SuggestionItem;

    /**
     * Different input key hints.
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint
     *
     * @private
     */
    var InputKeyHint;
    (function (InputKeyHint) {
        InputKeyHint["Search"] = "search";
        InputKeyHint["Go"] = "go";
        InputKeyHint["Next"] = "next";
        InputKeyHint["Enter"] = "enter";
        InputKeyHint["Done"] = "done";
        InputKeyHint["Previous"] = "previous";
        InputKeyHint["Send"] = "send";
    })(InputKeyHint || (InputKeyHint = {}));
    var InputKeyHint$1 = InputKeyHint;

    function SearchPopoverTemplate(headerTemplate) {
        return (parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { hideArrow: true, preventFocusRestore: true, preventInitialFocus: !Theme.d(), accessibleNameRef: "suggestions-speech-output message-area-text message-area-description", placement: ResponsivePopover.PopoverPlacement.Bottom, horizontalAlign: ResponsivePopover.PopoverHorizontalAlign.Start, open: this.open, opener: this, onOpen: this._handleOpen, onClose: this._handleClose, onBeforeClose: this._handleBeforeClose, onBeforeOpen: this._handleBeforeOpen, class: {
                "ui5-search-popover": true,
                "ui5-search-popover-phone": Theme.d(),
            }, children: [Theme.d() ? (headerTemplate ? headerTemplate.call(this) : (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs("header", { slot: "header", class: "ui5-search-popup-searching-header", children: [parametersBundle_css.jsx(Input$1, { class: "ui5-search-popover-search-field", onInput: this._handleMobileInput, showClearIcon: this.showClearIcon, noTypeahead: this.noTypeahead, hint: InputKeyHint$1.Search, onKeyDown: this._onMobileInputKeydown, children: this._flattenItems.map(item => {
                                    return (parametersBundle_css.jsx(SuggestionItem$1, { text: item.text }));
                                }) }), parametersBundle_css.jsx(Button.Button, { design: Button.ButtonDesign.Transparent, onClick: this._handleCancel, children: this.cancelButtonText })] }) }))) : null, parametersBundle_css.jsxs("main", { class: "ui5-search-popover-content", children: [parametersBundle_css.jsx("slot", { name: "messageArea" }), parametersBundle_css.jsx("div", { class: "search-popover-busy-wrapper", children: parametersBundle_css.jsx(BusyIndicator.BusyIndicator, { active: true }) }), this.items.length ?
                            parametersBundle_css.jsx(List.List, { class: "ui5-search-list", separators: List.ListSeparator.None, onKeyDown: this._onItemKeydown, accessibleRole: List.ListAccessibleRole.ListBox, onItemClick: this._onItemClick, children: parametersBundle_css.jsx("slot", {}) })
                            : (parametersBundle_css.jsx("slot", { name: "illustration" })), parametersBundle_css.jsx("span", { class: "ui5-hidden-text", id: "suggestions-speech-output", children: this.suggestionsText }), this.messageArea[0]?.text ? (parametersBundle_css.jsx("span", { class: "ui5-hidden-text", id: "message-area-text", children: this.messageArea[0].text })) : null, this.messageArea[0]?.description ? (parametersBundle_css.jsx("span", { class: "ui5-hidden-text", id: "message-area-description", children: this.messageArea[0].description })) : null] }), this.action.length ? (parametersBundle_css.jsx("slot", { onKeyDown: this._handleActionKeydown, name: "action", slot: "footer" })) : null] }));
    }

    function SearchTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [SearchFieldTemplate.call(this), SearchPopoverTemplate.call(this)] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme);
    var SearchCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}.ui5-search-popover{width:var(--search_width);margin-top:.25rem;box-sizing:border-box}.ui5-search-popup-searching-header{display:flex;gap:.5rem;width:100%;align-items:center}.ui5-search-popover::part(header){padding:.5rem 1rem;box-shadow:none;box-sizing:border-box}.ui5-search-popover::part(header):before{display:none}.ui5-search-popover::part(content){padding:0;box-shadow:none}:host([loading]) .ui5-search-popover main{min-height:2rem}.ui5-search-popover-search-field{flex:1;height:2.25rem;border-radius:var(--_ui5-v2-15-0_search_input_border_radius)}.ui5-search-popover-search-field::part(root):after{border-radius:var(--_ui5-v2-15-0_search_input_border_radius)}.ui5-search-popover-search-field::part(input){padding-inline-start:.875rem}.ui5-search-popover-search-field::part(clear-icon-wrapper){margin-inline-end:.5rem}.ui5-search-popover-loading-bi{width:100%;height:100%}::slotted([slot="action"]){width:100%;margin-top:.5rem;margin-bottom:.5rem}.search-popover-busy-wrapper{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:42;width:100%;height:100%;display:none;justify-content:center;align-items:center;pointer-events:all}:host([loading]) .search-popover-busy-wrapper{display:flex;width:100%;height:100%}.search-popover-busy-wrapper [ui5-busy-indicator]{z-index:1}.search-popover-busy-wrapper:after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:var(--_ui5-v2-15-0-search-loading-overlay-background);opacity:var(--_ui5-v2-15-0-search-loading-overlay-transparency);border-radius:var(--_ui5-v2-15-0_popup_border_radius)}.ui5-search-popover-phone .ui5-search-popover-content{position:relative;width:100%;height:100%;display:flex;flex-direction:column}.ui5-search-popover-phone .search-popover-busy-wrapper:after{border-radius:0}
`;

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme);
    var SearchFieldCss = `:host,.ui5-shellbar-search-field-wrapper{height:2.25rem;display:flex;align-items:center}:host(:not([collapsed])),.ui5-shellbar-search-field-wrapper{min-width:18rem;max-width:36rem;margin:0;height:2.25rem;color:var(--sapShell_TextColor);font-size:var(--sapFontSize);font-family:var(--sapFontFamily);font-style:normal;box-shadow:var(--sapField_Shadow);border-radius:var(--_ui5-v2-15-0_search_input_border_radius);box-sizing:border-box;text-align:start;background:var(--sapField_BackgroundStyle);background-color:var(--_ui5-v2-15-0-search-wrapper-background);position:relative}.ui5-shellbar-search-field-wrapper{flex:1;min-width:auto}:host(:not([collapsed]):hover),:host(:not([collapsed]):focus-within),.ui5-shellbar-search-field-wrapper:focus-within{box-shadow:var(--sapField_Hover_Shadow);background:var(--_ui5-v2-15-0-search-wrapper-hover-background);background-color:var(--_ui5-v2-15-0-search-wrapper-hover-background-color)}:host([focused-inner-input]) .ui5-search-field-root{outline:var(--_ui5-v2-15-0_search_wrapper_outline);border-radius:var(--_ui5-v2-15-0_search_input_border_radius);outline-offset:-.125rem}.ui5-search-field-root{width:100%;height:100%;position:relative;background:transparent;display:inline-block;outline:none;box-sizing:border-box;color:inherit;transition:border-color .2s ease-in-out;border-radius:var(--_ui5-v2-15-0_search_input_border_radius);overflow:hidden}.ui5-search-field-content{height:100%;display:flex;flex-direction:row;justify-content:flex-end;align-items:center;overflow:hidden}[ui5-select]{--_ui5-v2-15-0_content_density: compact;outline:none;margin:var(--_ui5-v2-15-0_search_input_scope_margin);max-width:10rem;border-radius:var(--_ui5-v2-15-0_search_input_border_radius);border:var(--_ui5-v2-15-0-search-border);box-shadow:none;background:unset;background-color:var(--_ui5-v2-15-0-search-elements-background);height:var(--_ui5-v2-15-0-search-select-height);--_ui5-v2-15-0_select_label_color: var(--sapShell_TextColor)}[ui5-select]:hover{box-shadow:var(--sapField_Hover_Shadow)}[ui5-select]::part(icon){display:flex;justify-content:center;align-items:stretch;height:100%;padding:0 .5rem;align-self:center;border-radius:var(--_ui5-v2-15-0_search_input_border_radius);color:var(--sapShell_InteractiveTextColor)}[ui5-select]::part(popover){background-color:var(--sapShellColor)}.ui5-filter-wrapper{--_ui5-v2-15-0_button_focused_border_radius: var(--_ui5-v2-15-0_search_filter_button_border_radius)}::slotted([slot="filterButton"]){min-width:var(--_ui5-v2-15-0_search_icon_size);height:var(--_ui5-v2-15-0_search_icon_size);border:var(--_ui5-v2-15-0_search_filter_button_border);border-radius:var(--_ui5-v2-15-0_search_filter_button_border_radius);color:var(--sapShell_InteractiveTextColor);outline:none;background:var(--_ui5-v2-15-0-search-filter_button_background_color);box-sizing:border-box;margin-inline-end:.1875rem;margin-inline-start:.25rem}::slotted([slot="filterButton"]:focus-within){background-color:var(--ui5-v2-15-0_search_filter_button_background_active);border:var(--_ui5-v2-15-0_search_filter_button_border)}::slotted([slot="filterButton"]:hover){background-color:var(--sapShell_Hover_Background);border:var(--_ui5-v2-15-0_seach_filter_button_border_hover)}.ui5-search-field-inner-input{font-size:var(--sapFontSize);font-family:var(--sapFontFamily);font-style:normal;padding:.5rem 0;height:100%;width:100%;box-sizing:border-box;background-color:var(--_ui5-v2-15-0-search-elements-background);border:var(--_ui5-v2-15-0-search-border);outline:none;color:inherit;padding-inline-start:var(--_ui5-v2-15-0-search-input-start-padding);padding-inline-end:var(--_ui5-v2-15-0_search_input_end_padding)}:host([focused-inner-input]) .ui5-search-field-inner-input{outline:var(--_ui5-v2-15-0_search_input_outline);border-radius:var(--_ui5-v2-15-0_search_input_border_radius);outline-offset:-.3125rem}:host(:not([mode="Scoped"])) .ui5-search-field-inner-input{padding-inline-start:.875rem}[ui5-select]:hover,.ui5-search-field-inner-input:hover{background-color:var(--_ui5-v2-15-0-search-elements-hover-background)}[ui5-select]:focus-within,.ui5-search-field-inner-input:focus-within{background-color:var(--_ui5-v2-15-0-search-elements-active-background)}.ui5-search-field-inner-input::placeholder{font-weight:400;font-style:italic;color:var(--sapField_PlaceholderTextColor);padding-inline-start:.125rem}:host([mode="Scoped"]) .ui5-search-field-inner-input{margin-inline-start:var(--_ui5-v2-15-0_search_input_start_margin)}.ui5-search-field-separator{height:1.5rem;width:.0625rem;background:var(--_ui5-v2-15-0_search_separator_background);box-sizing:border-box}.ui5-shell-search-field-button{outline:none;min-width:var(--_ui5-v2-15-0_search_icon_size);height:var(--_ui5-v2-15-0_search_icon_size);border-radius:var(--_ui5-v2-15-0_search_icon_border_radius);box-sizing:border-box;cursor:pointer}.ui5-shell-search-field-button:not([design=Emphasized]){color:var(--sapShell_InteractiveTextColor);background-color:var(--_ui5-v2-15-0-search-elements-background);min-width:var(--_ui5-v2-15-0_search_icon_size_default);height:var(--_ui5-v2-15-0_search_icon_size_default);border-radius:var(--_ui5-v2-15-0_shellbar_button_border_radius)}.ui5-shell-search-field-button:not([design=Emphasized]):hover{background-color:var(--sapShell_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);border-radius:var(--_ui5-v2-15-0_shellbar_button_border_radius)}.ui5-shell-search-field-button[desktop]:not([active])::part(button):after,.ui5-shell-search-field-button:not([active])::part(button):focus-visible:after,.ui5-shell-search-field-button[desktop][active][design=Emphasized]::part(button):focus-within:after,.ui5-shell-search-field-button[active][design=Emphasized]::part(button):focus-visible:after,.ui5-shell-search-field-button[desktop][active]::part(button):focus-within:before,.ui5-shell-search-field-button[active]::part(button):focus-visible:before,.ui5-shell-search-field-button[design=Emphasized][desktop]::part(button):focus-within:before,.ui5-shell-search-field-button[design=Emphasized]::part(button):focus-visible:before{border-radius:var(--_ui5-v2-15-0_shellbar_button_border_radius)}.ui5-shell-search-field-icon{display:flex;justify-content:center;align-items:stretch;cursor:pointer;outline:none;min-width:var(--_ui5-v2-15-0_search_icon_size);height:var(--_ui5-v2-15-0_search_icon_size);border-radius:var(--_ui5-v2-15-0_search_icon_border_radius);margin-inline-end:.25rem;margin-inline-start:.1875rem;box-sizing:border-box;color:var(--sapShell_InteractiveTextColor);background-color:var(--_ui5-v2-15-0-search-elements-background);border:var(--_ui5-v2-15-0-search-icon-border)}.ui5-shell-search-field-icon::part(root){padding:var(--_ui5-v2-15-0_search_icon_padding);width:1rem;height:1rem;outline-offset:-.125rem}.ui5-shell-search-field-icon:hover::part(root){padding:var(--_ui5-v2-15-0_search_icon_hover_padding);outline-offset:-.1875rem}.ui5-shell-search-field-icon:focus::part(root){border-radius:var(--_ui5-v2-15-0_search_icon_border_radius)}.ui5-shell-search-field-icon:hover,.ui5-shell-search-field-input-button:hover{background:var(--sapShell_Hover_Background);border:1px solid var(--sapButton_Lite_Hover_BorderColor);color:var(--sapShell_InteractiveTextColor)}.ui5-shell-search-field-search-icon{background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);color:var(--sapButton_Emphasized_TextColor)}.ui5-search-field-select{--_ui5-v2-15-0_input_focus_border_radius: var(--_ui5-v2-15-0_search_input_border_radius)}.ui5-search-field-select:hover,.ui5-search-field-select[focused]{background:var(--_ui5-v2-15-0-search-wrapper-hover-background-color)}.ui5-search-field-select::part(icon-wrapper){border-radius:var(--_ui5-v2-15-0_search_input_border_radius);height:100%}.ui5-search-field-select[focused]::part(icon-wrapper){box-shadow:var(--sapField_Hover_Shadow)}:host(:not([collapsed]):hover):has([ui5-select]:hover){background:var(--_ui5-v2-15-0-search-wrapper-background)}:host(:not([collapsed])):has([ui5-select][focused]){background:var(--_ui5-v2-15-0-search-wrapper-background)}.ui5-search-field-inner-input::selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var SearchField_1;
    /**
     * @class
     *
     * ### Overview
     *
     * A `ui5-search-field` is an input field, used for user search.
     *
     * The `ui5-search-field` consists of several elements parts:
     * - Scope - displays a select in the beggining of the component, used for filtering results by their scope.
     * - Input field - for user input value
     * - Clear button - gives the possibility for deleting the entered value
     * - Search button - a primary button for performing search, when the user has entered a search term
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/SearchField.js";`
     *
     * @constructor
     * @extends UI5Element
     * @private
     */
    let SearchField = SearchField_1 = class SearchField extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the clear icon of the search will be shown.
             * @default false
             * @public
             */
            this.showClearIcon = false;
            /**
             * Defines whether the component is collapsed.
             *
             * @default false
             * @private
             */
            this.collapsed = false;
            /**
             * Defines the value of the component.
             *
             * **Note:** The property is updated upon typing.
             * @default ""
             * @public
             */
            this.value = "";
            /**
             * @private
             */
            this.focusedInnerInput = false;
            /**
             * @private
             */
            this._effectiveShowClearIcon = false;
        }
        onBeforeRendering() {
            this._effectiveShowClearIcon = (this.showClearIcon && !!this.value);
        }
        _onkeydown(e) {
            if (webcomponentsBase.b$1(e)) {
                return this._handleEnter();
            }
        }
        _onfocusin() {
            this.focusedInnerInput = true;
        }
        _onfocusout() {
            this.focusedInnerInput = false;
        }
        _onFocusOutSearch(e) { } // eslint-disable-line
        _handleEnter() {
            if (this.value.length) {
                this._handleSearchEvent();
            }
        }
        _handleInnerClick() { } // eslint-disable-line
        _handleSearchIconPress() {
            this._handleSearchEvent();
            setTimeout(() => {
                this.focus();
            }, 0);
        }
        _handleSearchEvent() {
            this.fireDecoratorEvent("search");
        }
        _handleInput(e) {
            this.value = e.target.value;
            this.fireDecoratorEvent("input");
        }
        _handleClear() {
            this.value = "";
            this.fireDecoratorEvent("input");
            this.focus();
        }
        _handleScopeChange(e) {
            const item = e.detail.selectedOption;
            this.fireDecoratorEvent("scope-change", {
                scope: item.scopeOption,
            });
        }
        get _isSearchIcon() {
            return this.value.length && this.focusedInnerInput;
        }
        get _searchButtonAccessibilityAttributes() {
            return {
                expanded: !this.collapsed,
            };
        }
        get _translations() {
            return {
                scope: SearchField_1.i18nBundle.getText(i18nDefaults$1.SEARCH_FIELD_SCOPE_SELECT_LABEL),
                searchIcon: SearchField_1.i18nBundle.getText(i18nDefaults$1.SEARCH_FIELD_SEARCH_ICON),
                clearIcon: SearchField_1.i18nBundle.getText(i18nDefaults$1.SEARCH_FIELD_CLEAR_ICON),
                searchFieldAriaLabel: SearchField_1.i18nBundle.getText(i18nDefaults$1.SEARCH_FIELD_LABEL),
            };
        }
        get _effectiveIconTooltip() {
            return this._translations.searchIcon;
        }
        captureRef(ref) {
            if (ref) {
                ref.scopeOption = this;
            }
        }
    };
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "showClearIcon", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "collapsed", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], SearchField.prototype, "value", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], SearchField.prototype, "placeholder", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], SearchField.prototype, "accessibleName", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], SearchField.prototype, "accessibleDescription", void 0);
    __decorate$2([
        webcomponentsBase.d({ type: HTMLElement, individualSlots: true, invalidateOnChildChange: true })
    ], SearchField.prototype, "scopes", void 0);
    __decorate$2([
        webcomponentsBase.d()
    ], SearchField.prototype, "filterButton", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "focusedInnerInput", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "_effectiveShowClearIcon", void 0);
    __decorate$2([
        parametersBundle_css$1.i("@ui5/webcomponents-fiori")
    ], SearchField, "i18nBundle", void 0);
    SearchField = SearchField_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-search-field",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: SearchFieldTemplate,
            styles: [
                SearchFieldCss,
            ],
        })
        /**
         * Fired when typing in input or clear icon is pressed.
         *
         * @public
         */
        ,
        eventStrict.l("input", {
            bubbles: true,
        })
        /**
         * Fired when the scope has changed.
         * @public
         * @param {HTMLElement} scope The newly selected scope
         */
        ,
        eventStrict.l("scope-change", {
            bubbles: true,
        })
        /**
         * Fired when the user has triggered search with Enter key or Search Button press.
         * @public
         */
        ,
        eventStrict.l("search", {
            bubbles: true,
            cancelable: true,
        })
    ], SearchField);
    SearchField.define();
    var SearchField$1 = SearchField;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Search_1;
    /**
     * @class
     *
     * ### Overview
     *
     * A `ui5-search` is an input with suggestions, used for user search.
     *
     * The `ui5-search` consists of several elements parts:
     * - Scope - displays a select in the beggining of the component, used for filtering results by their scope.
     * - Input field - for user input value
     * - Clear button - gives the possibility for deleting the entered value
     * - Search button - a primary button for performing search, when the user has entered a search term
     * - Suggestions - a list with available search suggestions
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/Search.js";`
     *
     * @constructor
     * @extends SearchField
     * @public
     * @since 2.9.0
     * @experimental
     */
    let Search = Search_1 = class Search extends SearchField$1 {
        constructor() {
            super();
            /**
             * Indicates whether a loading indicator should be shown in the popup.
             * @default false
             * @public
             */
            this.loading = false;
            /**
             * Defines whether the value will be autcompleted to match an item.
             * @default false
             * @public
             */
            this.noTypeahead = false;
            /**
             * Indicates whether the items picker is open.
             * @public
             */
            this.open = false;
            // The typed in value.
            this._typedInValue = "";
            this._valueBeforeOpen = this.getAttribute("value") || "";
            this._isTyping = false;
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            if (this.collapsed && !Theme.d()) {
                this.open = false;
                return;
            }
            const innerInput = this.nativeInput;
            const autoCompletedChars = innerInput && (innerInput.selectionEnd - innerInput.selectionStart);
            this.open = this.open || (this._popoupHasAnyContent() && this._isTyping && innerInput.value.length > 0);
            // If there is already a selection the autocomplete has already been performed
            if (this._shouldAutocomplete && !autoCompletedChars) {
                const item = this._getFirstMatchingItem(this.value);
                this._proposedItem = item;
                if (item) {
                    this._handleTypeAhead(item);
                    this._selectMatchingItem(item);
                }
                else {
                    this._deselectItems();
                }
            }
            if (Theme.d() && this.open) {
                const item = this._getFirstMatchingItem(this.value);
                this._proposedItem = item;
                if (item && this._performItemSelectionOnMobile) {
                    this._selectMatchingItem(item);
                }
            }
            this._flattenItems.forEach(item => {
                item.highlightText = this._typedInValue;
            });
        }
        onAfterRendering() {
            const innerInput = this.nativeInput;
            if (this._performTextSelection && innerInput && innerInput.value !== this._innerValue) {
                innerInput.value = this._innerValue || "";
            }
            if (this._performTextSelection && this._typedInValue.length && this.value.length) {
                innerInput?.setSelectionRange(this._typedInValue.length, this.value.length);
            }
            this._performTextSelection = false;
            if (!this.collapsed) {
                this.style.setProperty("--search_width", `${this.getBoundingClientRect().width}px`);
            }
        }
        _handleMobileInput(e) {
            this.value = e.target.value;
            this._performItemSelectionOnMobile = this._shouldPerformSelectionOnMobile(e.detail.inputType);
            this.fireDecoratorEvent("input");
        }
        _shouldPerformSelectionOnMobile(inputType) {
            const allowedEventTypes = [
                "deleteWordBackward",
                "deleteWordForward",
                "deleteSoftLineBackward",
                "deleteSoftLineForward",
                "deleteEntireSoftLine",
                "deleteHardLineBackward",
                "deleteHardLineForward",
                "deleteByDrag",
                "deleteByCut",
                "deleteContent",
                "deleteContentBackward",
                "deleteContentForward",
                "historyUndo",
            ];
            return !this.noTypeahead && !allowedEventTypes.includes(inputType || "");
        }
        _handleTypeAhead(item) {
            const originalValue = item.text || "";
            this._typedInValue = this.value;
            this._innerValue = originalValue;
            this._performTextSelection = true;
            this.value = originalValue;
        }
        _startsWithMatchingItems(str) {
            return StartsWith(str, this._flattenItems.filter(item => !this._isGroupItem(item) && !this._isShowMoreItem(item)), "text");
        }
        _isGroupItem(item) {
            return item.hasAttribute("ui5-search-item-group");
        }
        _isShowMoreItem(item) {
            return item.hasAttribute("ui5-search-item-show-more");
        }
        _deselectItems() {
            this._flattenItems.forEach(item => {
                item.selected = false;
            });
        }
        _selectMatchingItem(item) {
            this._deselectItems();
            item.selected = true;
        }
        _handleDown(e) {
            if (this.open) {
                e.preventDefault();
                this._handleArrowDown();
            }
        }
        _handleArrowDown() {
            const focusableItems = this._getItemsList().listItems;
            const firstListItem = focusableItems.at(0);
            if (this.open) {
                this._deselectItems();
                this.value = this._typedInValue || this.value;
                this._innerValue = this.value;
                firstListItem?.focus();
            }
        }
        _handleInnerClick() {
            if (Theme.d()) {
                this.open = true;
            }
        }
        _handleSearchIconPress() {
            if (Theme.d()) {
                this.open = true;
            }
            else {
                super._handleSearchIconPress();
            }
        }
        _handleEnter() {
            const prevented = !this.fireDecoratorEvent("search", { item: this._proposedItem });
            if (prevented) {
                return;
            }
            const innerInput = this.nativeInput;
            innerInput.setSelectionRange(this.value.length, this.value.length);
            this.open = false;
            this._isTyping = false;
        }
        _onMobileInputKeydown(e) {
            if (webcomponentsBase.b$1(e)) {
                this.value = this.mobileInput?.value || this.value;
                this._handleEnter();
                this.blur();
            }
        }
        _handleSearchEvent() {
            this.fireDecoratorEvent("search", { item: this._proposedItem });
        }
        _handleEscape() {
            this.value = this._typedInValue || this.value;
            this._innerValue = this.value;
            this._isTyping = false;
        }
        _handleInput(e) {
            super._handleInput(e);
            this._typedInValue = this.value;
            this._proposedItem = undefined;
            if (Theme.d()) {
                return;
            }
            this._isTyping = true;
            this.open = this.value.length > 0;
        }
        _handleClear() {
            super._handleClear();
            this._typedInValue = "";
            this._innerValue = "";
            this._shouldAutocomplete = false;
            this.open = false;
        }
        _popoupHasAnyContent() {
            return this.items.length > 0 || this.illustration.length > 0 || this.messageArea.length > 0 || this.loading || this.action.length > 0;
        }
        _onFooterButtonKeyDown(e) {
            if (webcomponentsBase.P(e)) {
                this._flattenItems[this._flattenItems.length - 1].focus();
            }
            if (webcomponentsBase.V(e)) {
                this._getItemsList().focus();
            }
        }
        _onItemKeydown(e) {
            const target = e.target;
            // if focus is on the group header (in group's shadow dom) the target is the group itself,
            // if so using getFocusDomRef ensures the actual focused element is used
            const focusedItem = this._isGroupItem(target) ? target?.getFocusDomRef() : target;
            const focusableItems = this._getItemsList().listItems;
            const isFirstItem = focusableItems.at(0) === focusedItem;
            const isLastItem = focusableItems.at(-1) === focusedItem;
            const isArrowUp = webcomponentsBase.P(e);
            const isArrowDown = webcomponentsBase._(e);
            const isTab = webcomponentsBase.x(e);
            e.preventDefault();
            if (isFirstItem && isArrowUp) {
                this.nativeInput?.focus();
                this._shouldAutocomplete = true;
            }
            if ((isLastItem && isArrowDown) || isTab) {
                this._getFooterButton()?.focus();
            }
        }
        _onItemClick(e) {
            const item = e.detail.item;
            const prevented = !this.fireDecoratorEvent("search", { item });
            if (prevented) {
                if (Theme.d()) {
                    this.open = false;
                }
                return;
            }
            this.value = item.text;
            this._innerValue = this.value;
            this._typedInValue = this.value;
            this._shouldAutocomplete = false;
            this._performTextSelection = true;
            this.open = false;
            this._isTyping = false;
            this.focus();
        }
        _onkeydown(e) {
            super._onkeydown(e);
            if (this.loading) {
                return;
            }
            this._shouldAutocomplete = !this.noTypeahead
                && !(webcomponentsBase.Q(e) || webcomponentsBase.X(e) || webcomponentsBase.m$2(e) || webcomponentsBase.P(e) || webcomponentsBase._(e) || webcomponentsBase.x(e) || webcomponentsBase.b$1(e) || webcomponentsBase.j(e) || webcomponentsBase.q(e) || webcomponentsBase.M(e) || webcomponentsBase.n(e) || webcomponentsBase.m$2(e));
            if (webcomponentsBase._(e)) {
                this._handleDown(e);
            }
            if (webcomponentsBase.m$2(e)) {
                this._handleEscape();
            }
            // deselect item on backspace or delete
            if (webcomponentsBase.Q(e) || webcomponentsBase.X(e)) {
                this._deselectItems();
            }
        }
        _onFocusOutSearch(e) {
            const target = e.relatedTarget;
            if (this._getPicker().contains(target) || this.contains(target)) {
                return;
            }
            this.open = false;
            this._isTyping = false;
        }
        _handleBeforeClose(e) {
            if (e.detail.escPressed) {
                this.focus();
            }
        }
        _handleCancel() {
            this._handleClose();
            this.value = this._valueBeforeOpen;
            this.fireDecoratorEvent("input");
        }
        _handleClose() {
            this.open = false;
            this._isTyping = false;
            this.fireDecoratorEvent("close");
        }
        _handleBeforeOpen() {
            this._valueBeforeOpen = this.value;
            if (Theme.d() && this.mobileInput) {
                this.mobileInput.value = this.value;
            }
        }
        _handleOpen() {
            this.fireDecoratorEvent("open");
        }
        _handleActionKeydown(e) {
            if (webcomponentsBase.P(e)) {
                this._flattenItems[this._flattenItems.length - 1].focus();
            }
        }
        _onFooterButtonClick() {
            this.fireDecoratorEvent("popup-action-press");
        }
        _getFirstMatchingItem(current) {
            if (!this._flattenItems.length || !current) {
                return;
            }
            const startsWithMatches = this._startsWithMatchingItems(current);
            if (!startsWithMatches.length) {
                return undefined;
            }
            return startsWithMatches[0];
        }
        _getPicker() {
            return this.shadowRoot.querySelector("[ui5-responsive-popover]");
        }
        _getItemsList() {
            return this._getPicker().querySelector(".ui5-search-list");
        }
        _getFooterButton() {
            return this.action[0];
        }
        get _flattenItems() {
            return this.getSlottedNodes("items").flatMap(item => {
                return this._isGroupItem(item) ? [item, ...item.items] : [item];
            });
        }
        get nativeInput() {
            const domRef = this.getDomRef();
            return domRef?.querySelector(`input`);
        }
        get mobileInput() {
            const domRef = this.shadowRoot;
            return domRef ? domRef.querySelector(`[ui5-input]`) : null;
        }
        get cancelButtonText() {
            return Search_1.i18nBundle.getText(i18nDefaults$1.SEARCH_CANCEL_BUTTON);
        }
        get suggestionsText() {
            return Search_1.i18nBundle.getText(i18nDefaults$1.SEARCH_SUGGESTIONS);
        }
        get scopeSelect() {
            const domRef = this.shadowRoot;
            return domRef ? domRef.querySelector(`[ui5-select]`) : null;
        }
    };
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Search.prototype, "loading", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Search.prototype, "noTypeahead", void 0);
    __decorate$1([
        webcomponentsBase.d({
            type: HTMLElement,
            "default": true,
            invalidateOnChildChange: true,
        })
    ], Search.prototype, "items", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], Search.prototype, "action", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], Search.prototype, "illustration", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], Search.prototype, "messageArea", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Search.prototype, "open", void 0);
    __decorate$1([
        webcomponentsBase.s({ noAttribute: true })
    ], Search.prototype, "_innerValue", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Search.prototype, "_performItemSelectionOnMobile", void 0);
    __decorate$1([
        parametersBundle_css$1.i("@ui5/webcomponents-fiori")
    ], Search, "i18nBundle", void 0);
    Search = Search_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-search",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: SearchTemplate,
            styles: [
                SearchField$1.styles,
                SearchCss,
            ],
        })
        /**
         * Fired when the popup is opened.
         *
         * @public
         */
        ,
        eventStrict.l("open")
        /**
         * Fired when the popup is closed.
         *
         * @public
         */
        ,
        eventStrict.l("close")
    ], Search);
    Search.define();
    var Search$1 = Search;

    function ShellBarSearchPopoverTemplate() {
        return (SearchPopoverTemplate.call(this, ShellBarSearchDialogHeader));
    }
    function ShellBarSearchDialogHeader() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs("header", { slot: "header", class: "ui5-search-popup-searching-header", children: [parametersBundle_css.jsx("div", { class: "ui5-shellbar-search-field-wrapper", children: SearchFieldTemplate.call(this, { forceExpanded: true }) }), parametersBundle_css.jsx(Button.Button, { design: Button.ButtonDesign.Transparent, onClick: this._handleCancel, children: this.cancelButtonText })] }) }));
    }

    function ShellBarSearchTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [SearchFieldTemplate.call(this), ShellBarSearchPopoverTemplate.call(this)] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme);
    var ShellBarSearchCss = `:host(:not([collapsed])){min-width:13rem}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ShellBarSearch_1;
    /**
     * @class
     * Search field for the ShellBar component.
     * @constructor
     * @extends Search
     * @public
     * @since 2.10.0
     * @experimental
     */
    let ShellBarSearch = ShellBarSearch_1 = class ShellBarSearch extends Search$1 {
        constructor() {
            super(...arguments);
            /**
             * Indicates whether the suggestions popover should be opened on focus.
             * @default false
             * @public
             */
            this.autoOpen = false;
        }
        _handleSearchIconPress() {
            super._handleSearchIconPress();
            if (this.collapsed) {
                this.collapsed = false;
            }
            else if (!this.value) {
                this.collapsed = true;
            }
        }
        _onFocusOutSearch(e) {
            if (Theme.d()) {
                return;
            }
            super._onFocusOutSearch(e);
        }
        _handleInput(e) {
            super._handleInput(e);
            if (Theme.d()) {
                this._performItemSelectionOnMobile = this._shouldPerformSelectionOnMobile(e.inputType);
            }
        }
        get _effectiveIconTooltip() {
            if (this.collapsed) {
                return ShellBarSearch_1.i18nBundle.getText(i18nDefaults$1.SHELLBAR_SEARCH_COLLAPSED);
            }
            if (this.value) {
                return ShellBarSearch_1.i18nBundle.getText(i18nDefaults$1.SEARCH_FIELD_SEARCH_ICON);
            }
            return ShellBarSearch_1.i18nBundle.getText(i18nDefaults$1.SHELLBAR_SEARCH_EXPANDED);
        }
        get nativeInput() {
            const domRef = this.shadowRoot;
            return Theme.d() ? domRef?.querySelector(`[ui5-responsive-popover] input`) : super.nativeInput;
        }
        _onfocusin() {
            super._onfocusin();
            if (this.autoOpen) {
                this.open = true;
                this.fireDecoratorEvent("open");
            }
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            if (Theme.d()) {
                this.collapsed = true;
            }
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ShellBarSearch.prototype, "autoOpen", void 0);
    ShellBarSearch = ShellBarSearch_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-shellbar-search",
            template: ShellBarSearchTemplate,
            styles: [
                Search$1.styles,
                ShellBarSearchCss,
            ],
        })
    ], ShellBarSearch);
    ShellBarSearch.define();
    var ShellBarSearch_default = ShellBarSearch;

    exports.Input = Input$1;
    exports.ShellBarSearch_default = ShellBarSearch_default;

}));
