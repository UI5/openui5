sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/SuggestionItem', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/information', 'sap/f/thirdparty/List', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Popover', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/slim-arrow-down', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/ResponsivePopoverCommon.css', 'sap/f/thirdparty/Input', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/search2', 'sap/f/thirdparty/ListItemStandard', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/i18n-defaults'], (function (exports, webcomponentsBase, eventStrict, ManagedStyles, parametersBundle_css, Button, Icon, ListItemBase, SuggestionItem, parametersBundle_css$1, ListItemTemplate, InvisibleMessage, AccessibilityTextsHelper, ValueState, information, List, i18nDefaults, Label, ResponsivePopover, Popover, ListItemGroup, slimArrowDown, Title, ResponsivePopoverCommon_css, Input, decline, search, ListItemStandard, parametersBundle_css$2, i18nDefaults$1) { 'use strict';

    function OptionTemplate() {
        return SuggestionItem.ListItemBaseTemplate.call(this, { listItemContent }, {
            role: "option",
            title: this.tooltip,
            ariaSetsize: this._forcedSetsize,
            ariaPosinset: this._forcedPosinset,
        });
    }
    function listItemContent() {
        return (parametersBundle_css.jsxs("div", { part: "content", id: `${this._id}-content`, class: "ui5-li-content", children: [this.displayIconBegin &&
                    parametersBundle_css.jsx(Icon.Icon, { part: "icon", name: this.icon, class: "ui5-li-icon", mode: "Decorative" }), parametersBundle_css.jsxs("div", { class: "ui5-li-text-wrapper", children: [parametersBundle_css.jsx("span", { part: "title", class: "ui5-li-title", children: parametersBundle_css.jsx("slot", {}) }), this.additionalText &&
                            parametersBundle_css.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", children: this.additionalText })] })] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var optionBaseCss = `:host{height:var(--_ui5_list_item_dropdown_base_height);--_ui5_list_item_title_size: var(--sapFontSize)}:host(:active[actionable]:not([data-moving])),:host(:active[actionable][selected]:not([data-moving])){background-color:var(--sapList_Active_Background);border-bottom-color:var(--sapList_Active_Background)}
`;

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var listItemIconCss = `.ui5-li-icon{color:var(--sapList_TextColor);min-width:var(--_ui5_list_item_icon_size);min-height:var(--_ui5_list_item_icon_size);padding-inline-end:var(--_ui5_list_item_icon_padding-inline-end)}
`;

    var __decorate$4 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
    __decorate$4([
        webcomponentsBase.d({ type: Node, "default": true, invalidateOnChildChange: true })
    ], Option.prototype, "text", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Option.prototype, "value", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Option.prototype, "icon", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Option.prototype, "additionalText", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], Option.prototype, "tooltip", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], Option.prototype, "selected", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], Option.prototype, "_forcedSetsize", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], Option.prototype, "_forcedPosinset", void 0);
    Option = __decorate$4([
        webcomponentsBase.m({
            tag: "ui5-option",
            template: OptionTemplate,
            styles: [
                ListItemBase.ListItemBase.styles,
                ListItemTemplate.listItemAdditionalTextCss,
                listItemIconCss,
                optionBaseCss,
            ],
        })
    ], Option);
    Option.define();
    var Option$1 = Option;

    /**
     * Defines the separator types for Select component two-column layout.
     * @public
     * @since 2.16.0
     */
    var SelectTextSeparator;
    (function (SelectTextSeparator) {
        /**
         * Will show bullet(·) as separator on two columns layout when Select is in read-only mode.
         * @public
         */
        SelectTextSeparator["Bullet"] = "Bullet";
        /**
         *	Will show N-dash(–) as separator on two columns layout when Select is in read-only mode.
         * @public
         */
        SelectTextSeparator["Dash"] = "Dash";
        /**
         * 	Will show vertical line(|) as separator on two columns layout when Select is in read-only mode.
         * @public
         */
        SelectTextSeparator["VerticalLine"] = "VerticalLine";
    })(SelectTextSeparator || (SelectTextSeparator = {}));
    var SelectTextSeparator$1 = SelectTextSeparator;

    function OptionGroupTemplate() {
        return (parametersBundle_css.jsxs("div", { class: "ui5-option-group-root", role: "group", "aria-label": this.headerText || undefined, "aria-roledescription": this._groupHeaderRoleDescription, children: [this.headerText &&
                    parametersBundle_css.jsx("div", { class: "ui5-option-group-header", "aria-hidden": "true", children: this.headerText }), this.items.map((item) => parametersBundle_css.jsx("slot", { name: item._individualSlot }))] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var OptionGroupCss = `:host{display:block}.ui5-option-group-root{width:100%;box-sizing:border-box;padding:0;margin:0}.ui5-option-group-header{display:flex;align-items:flex-end;padding:1.25rem 1rem .5rem;box-sizing:border-box;border-bottom:1px solid var(--sapList_GroupHeaderBorderColor);background:var(--sapList_GroupHeaderBackground);color:var(--sapList_TableGroupHeaderTextColor);font-family:var(--sapFontHeaderFamily);font-size:var(--sapFontHeader6Size);font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;user-select:none}
`;

    var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var OptionGroup_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-option-group` component is used to group options within a `ui5-select`.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/OptionGroup.js";`
     * @constructor
     * @extends ListItemGroupBase
     * @public
     * @since 2.26.0
     */
    let OptionGroup = OptionGroup_1 = class OptionGroup extends ListItemGroup.ListItemGroupBase {
        get isOptionGroup() {
            return true;
        }
        get _groupHeaderRoleDescription() {
            return OptionGroup_1.i18nBundle.getText(i18nDefaults.LIST_ITEM_GROUP_HEADER);
        }
    };
    __decorate$3([
        webcomponentsBase.d({
            "default": true,
            invalidateOnChildChange: true,
            individualSlots: true,
            type: HTMLElement,
        })
    ], OptionGroup.prototype, "items", void 0);
    __decorate$3([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], OptionGroup, "i18nBundle", void 0);
    OptionGroup = OptionGroup_1 = __decorate$3([
        webcomponentsBase.m({
            tag: "ui5-option-group",
            languageAware: true,
            template: OptionGroupTemplate,
            styles: [OptionGroupCss],
        })
    ], OptionGroup);
    OptionGroup.define();
    const isInstanceOfOptionGroup = webcomponentsBase.r("isOptionGroup");
    var OptionGroup$1 = OptionGroup;

    function SelectPopoverTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [this._flatOptions.length > 0 &&
                    parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { id: this.responsivePopoverId, class: {
                            "ui5-select-popover": true,
                            ...this.classes.popover
                        }, part: "popover", style: this.styles.responsivePopover, placement: "Bottom", horizontalAlign: "Start", hideArrow: true, preventInitialFocus: true, onOpen: this._afterOpen, onBeforeOpen: this._beforeOpen, onClose: this._afterClose, onKeyDown: this._onkeydown, accessibleName: this._isPhone ? this._effectivePopoverAccessibleName : undefined, children: [this._isPhone &&
                                parametersBundle_css.jsxs("div", { slot: "header", class: "ui5-responsive-popover-header", children: [parametersBundle_css.jsx("div", { class: "row", children: parametersBundle_css.jsx(Title.Title, { children: this._headerTitleText }) }), this.hasValueStateText &&
                                            parametersBundle_css.jsx("div", { class: {
                                                    "row": true,
                                                    "ui5-select-value-state-dialog-header": true,
                                                    ...this.classes.popoverValueState
                                                }, children: this._isPickerOpen && valueStateMessage.call(this) })] }), !this._isPhone && this.hasValueStateText &&
                                parametersBundle_css.jsxs("div", { class: this.classes.popoverValueState, style: this.styles.responsivePopoverHeader, children: [parametersBundle_css.jsx(Icon.Icon, { class: "ui5-input-value-state-message-icon", name: this._valueStateMessageInputIcon }), this._isPickerOpen && valueStateMessage.call(this)] }), parametersBundle_css.jsx(List.List, { separators: "None", onMouseDown: this._itemMousedown, onItemClick: this._handleItemPress, accessibleRole: "ListBox", accessibleName: this._effectiveListAccessibleName, children: parametersBundle_css.jsx("slot", {}) }), this._isPhone &&
                                parametersBundle_css.jsx("div", { slot: "footer", class: "ui5-responsive-popover-footer", children: parametersBundle_css.jsx(Button.Button, { class: "ui5-responsive-popover-close-btn", design: "Transparent", onClick: this._toggleRespPopover, children: this._cancelButtonText }) })] }), this.shouldOpenValueStateMessagePopover &&
                    parametersBundle_css.jsx(Popover.Popover, { part: "popover", class: "ui5-valuestatemessage-popover", preventInitialFocus: true, preventFocusRestore: true, hideArrow: true, placement: "Bottom", horizontalAlign: "Start", children: parametersBundle_css.jsxs("div", { class: this.classes.popoverValueState, style: this.styles.popoverHeader, children: [parametersBundle_css.jsx(Icon.Icon, { class: "ui5-input-value-state-message-icon", name: this._valueStateMessageInputIcon }), valueStateMessage.call(this)] }) })] }));
    }
    function valueStateMessage() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.shouldDisplayDefaultValueStateMessage
                ? this.valueStateText
                : parametersBundle_css.jsx("slot", { onClick: this._applyFocus, name: "valueStateMessage" }) }));
    }

    function SelectTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsxs("div", { class: {
                        "ui5-select-root": true,
                        "ui5-input-focusable-element": true,
                    }, id: `${this._id}-select`, onClick: this._onclick, title: this._effectiveTooltip, children: [!this.icon && this.selectedOptionIcon &&
                            parametersBundle_css.jsx(Icon.Icon, { mode: "Decorative", class: "ui5-select-option-icon", name: this.selectedOptionIcon }), parametersBundle_css.jsx("div", { class: "ui5-select-label-root", part: "label", "data-sap-focus-ref": true, tabindex: this._effectiveTabIndex, role: "combobox", "aria-haspopup": "listbox", "aria-label": this.ariaLabelText, ...this.ariaDescribedByIds && {
                                "aria-describedby": this.ariaDescribedByIds
                            }, "aria-disabled": this.isDisabled, "aria-required": this.required, "aria-readonly": this.readonly, "aria-expanded": this._isPickerOpen, "aria-roledescription": this._ariaRoleDescription, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, "aria-controls": this.responsivePopoverId, children: this.hasCustomLabel
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
                                }, children: parametersBundle_css.jsx(Icon.Icon, { part: "icon", name: slimArrowDown.slimArrowDownIcon, class: {
                                        "ui5-select-icon": true,
                                    } }) }), this.hasValueState &&
                            parametersBundle_css.jsx("span", { id: `${this._id}-valueStateDesc`, class: "ui5-hidden-text", children: this.valueStateText }), this.ariaDescriptionText &&
                            parametersBundle_css.jsx("span", { id: "accessibleDescription", class: "ui5-hidden-text", children: this.ariaDescriptionText }), this.hasGroups &&
                            parametersBundle_css.jsx("span", { id: this._groupCountMessageId, class: "ui5-hidden-text", children: this._groupCountText })] }), SelectPopoverTemplate.call(this)] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var selectCss = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}.ui5-input-icon-root{height:100%;box-sizing:border-box}.inputIcon{color:var(--_ui5_input_icon_color);cursor:var(--_ui5_input_icon_state_cursor, pointer);opacity:var(--_ui5_input_icon_state_opacity, 1);pointer-events:var(--_ui5_input_icon_state_pointer_events, auto);outline:none;padding:var(--_ui5_input_icon_state_padding, var(--_ui5_input_icon_padding));border-inline-start:var(--_ui5_input_icon_border);min-width:1rem;min-height:1rem;border-radius:var(--_ui5_input_icon_border_radius);display:flex;align-items:center;justify-content:center}.inputIcon:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--_ui5_input_icon_state_focus_outline_color, var(--sapContent_FocusColor));outline-offset:-.125rem}.inputIcon.inputIcon--pressed{background:var(--_ui5_input_icon_pressed_bg);box-shadow:var(--_ui5_input_icon_state_pressed_shadow, var(--_ui5_input_icon_box_shadow));border-inline-start:var(--_ui5_select_hover_icon_left_border);color:var(--_ui5_input_icon_state_pressed_color, var(--_ui5_input_icon_pressed_color))}.inputIcon:active{background-color:var(--sapButton_Active_Background);box-shadow:var(--_ui5_input_icon_state_pressed_shadow, var(--_ui5_input_icon_box_shadow));border-inline-start:var(--_ui5_select_hover_icon_left_border);color:var(--_ui5_input_icon_state_pressed_color, var(--_ui5_input_icon_pressed_color))}.inputIcon:not(.inputIcon--pressed):not(:active):hover{background:var(--_ui5_input_icon_hover_bg);box-shadow:var(--_ui5_input_icon_state_pressed_shadow, var(--_ui5_input_icon_box_shadow))}.inputIcon:hover{border-inline-start:var(--_ui5_select_hover_icon_left_border);box-shadow:var(--_ui5_input_icon_state_pressed_shadow, var(--_ui5_input_icon_box_shadow))}.ui5-input-icon-inner{display:flex;width:1rem;height:1rem;color:inherit;pointer-events:none;flex-shrink:0}.inputIcon.inputIcon--focused{outline-color:var(--_ui5_input_icon_state_focus_outline_color, var(--sapContent_FocusColor));border-inline-start-color:var(--_ui5_input_icon_state_focus_outline_color)}:host(:not([hidden])){display:inline-block}:host{width:var(--_ui5_input_width);min-width:calc(var(--_ui5_input_min_width) + (var(--_ui5-input-icons-count)*var(--_ui5_input_icon_width)));margin:var(--_ui5_input_margin_top_bottom) 0;height:var(--_ui5_input_height);color:var(--sapField_TextColor);font-size:var(--sapFontSize);font-family:var(--sapFontFamily);font-style:normal;border:var(--_ui5-input-border);border-radius:var(--_ui5_input_border_radius);box-sizing:border-box;text-align:start;transition:var(--_ui5_input_transition);background:var(--sapField_BackgroundStyle);background-color:var(--_ui5_input_background_color)}:host(:not([readonly])),:host([readonly][disabled]){box-shadow:var(--sapField_Shadow)}:host([focused]:not([opened])){border-color:var(--_ui5_input_focused_border_color);background-color:var(--sapField_Focus_Background)}.ui5-input-focusable-element{position:relative}:host([focused]:not([opened])) .ui5-input-focusable-element:after{content:var(--ui5_input_focus_pseudo_element_content);position:absolute;pointer-events:none;z-index:2;border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--_ui5_input_focus_outline_color);border-radius:var(--_ui5_input_focus_border_radius);top:var(--_ui5_input_focus_offset);bottom:var(--_ui5_input_focus_offset);left:var(--_ui5_input_focus_offset);right:var(--_ui5_input_focus_offset)}:host([focused][readonly]:not([opened])) .ui5-input-focusable-element:after{top:var(--_ui5_input_readonly_focus_offset);bottom:var(--_ui5_input_readonly_focus_offset);left:var(--_ui5_input_readonly_focus_offset);right:var(--_ui5_input_readonly_focus_offset);border-radius:var(--_ui5_input_readonly_focus_border_radius)}.ui5-input-root:before{content:"";position:absolute;width:calc(100% - 2px);left:1px;bottom:-2px;border-bottom-left-radius:8px;border-bottom-right-radius:8px;height:var(--_ui5_input_bottom_border_height);transition:var(--_ui5_input_transition);background-color:var(--_ui5_input_bottom_border_color)}.ui5-input-root{width:100%;height:100%;position:relative;background:transparent;display:inline-block;outline:none;box-sizing:border-box;color:inherit;transition:border-color .2s ease-in-out;border-radius:var(--_ui5_input_border_radius);overflow:hidden}:host([disabled]){opacity:var(--_ui5_input_disabled_opacity);cursor:default;pointer-events:none;background-color:var(--_ui5-input_disabled_background);border-color:var(--_ui5_input_disabled_border_color)}:host([disabled]) .ui5-input-root:before,:host([readonly]) .ui5-input-root:before{content:none}[inner-input]{background:transparent;color:inherit;border:none;font-style:inherit;-webkit-appearance:none;-moz-appearance:textfield;padding:var(--_ui5_input_inner_padding);box-sizing:border-box;width:100%;text-overflow:ellipsis;flex:1;outline:none;font-size:inherit;font-family:inherit;line-height:inherit;letter-spacing:inherit;word-spacing:inherit;text-align:inherit}[inner-input][inner-input-with-icon]{padding:var(--_ui5_input_inner_padding_with_icon)}[inner-input][type=search]::-webkit-search-decoration,[inner-input][type=search]::-webkit-search-cancel-button,[inner-input][type=search]::-webkit-search-results-button,[inner-input][type=search]::-webkit-search-results-decoration{display:none}[inner-input]::-ms-reveal,[inner-input]::-ms-clear{display:none}.ui5-input-value-state-icon{height:100%;display:var(--_ui5-input-value-state-icon-display);align-items:center}.ui5-input-value-state-icon>svg{margin-right:8px}[inner-input]::selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}:host([disabled]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([disabled]) [inner-input]::-moz-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-moz-placeholder{visibility:hidden}[inner-input]::-webkit-input-placeholder{font-weight:400;font-style:var(--_ui5_input_placeholder_style);color:var(--_ui5_input_placeholder_color);padding-right:.125rem}[inner-input]::-moz-placeholder{font-weight:400;font-style:var(--_ui5_input_placeholder_style);color:var(--_ui5_input_placeholder_color);padding-right:.125rem}:host([value-state="Negative"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5-input_error_placeholder_color);font-weight:var(--_ui5_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Negative"]) [inner-input]::-moz-placeholder{color:var(--_ui5-input_error_placeholder_color);font-weight:var(--_ui5_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Critical"]) [inner-input]::-webkit-input-placeholder{font-weight:var(--_ui5_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Critical"]) [inner-input]::-moz-placeholder{font-weight:var(--_ui5_input_value_state_error_warning_placeholder_font_weight)}:host([value-state="Positive"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5_input_placeholder_color)}:host([value-state="Positive"]) [inner-input]::-moz-placeholder{color:var(--_ui5_input_placeholder_color)}:host([value-state="Information"]) [inner-input]::-webkit-input-placeholder{color:var(--_ui5_input_placeholder_color)}:host([value-state="Information"]) [inner-input]::-moz-placeholder{color:var(--_ui5_input_placeholder_color)}.ui5-input-content{height:100%;box-sizing:border-box;display:flex;flex-direction:row;justify-content:flex-end;overflow:hidden;outline:none;background:transparent;color:inherit;border-radius:var(--_ui5_input_border_radius)}:host([readonly]:not([disabled])){border:var(--_ui5_input_readonly_border);background:var(--sapField_ReadOnly_BackgroundStyle);background-color:var(--_ui5_input_readonly_background)}:host([value-state="None"]:not([readonly]):hover),:host(:not([value-state]):not([readonly]):hover){border:var(--_ui5_input_hover_border);border-color:var(--_ui5_input_focused_border_color);box-shadow:var(--sapField_Hover_Shadow);background:var(--sapField_Hover_BackgroundStyle);background-color:var(--sapField_Hover_Background)}:host(:not([value-state]):not([readonly])[focused]:not([opened]):hover),:host([value-state="None"]:not([readonly])[focused]:not([opened]):hover){box-shadow:none}:host([focused]):not([opened]) .ui5-input-root:before{content:none}:host(:not([readonly]):not([disabled])[value-state]:not([value-state="None"])){border-width:var(--_ui5_input_state_border_width)}:host([value-state="Negative"]) [inner-input],:host([value-state="Critical"]) [inner-input]{font-style:var(--_ui5_input_error_warning_font_style);text-indent:var(--_ui5_input_error_warning_text_indent)}:host([value-state="Negative"]) [inner-input]{font-weight:var(--_ui5_input_error_font_weight)}:host([value-state="Critical"]) [inner-input]{font-weight:var(--_ui5_input_warning_font_weight)}:host([value-state="Negative"]:not([readonly]):not([disabled])){background:var(--sapField_InvalidBackgroundStyle);background-color:var(--sapField_InvalidBackground);border-color:var(--_ui5_input_value_state_error_border_color);box-shadow:var(--sapField_InvalidShadow)}:host([value-state="Negative"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5_input_focused_value_state_error_background);border-color:var(--_ui5_input_focused_value_state_error_border_color)}:host([value-state="Negative"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5_input_focused_value_state_error_focus_outline_color)}:host([value-state="Negative"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5-input-value-state-error-border-botom-color)}:host([value-state="Negative"]:not([readonly]):not([focused]):hover),:host([value-state="Negative"]:not([readonly])[focused][opened]:hover){background-color:var(--_ui5_input_value_state_error_hover_background);box-shadow:var(--sapField_Hover_InvalidShadow)}:host([value-state="Negative"]:not([readonly]):not([disabled])),:host([value-state="Critical"]:not([readonly]):not([disabled])),:host([value-state="Information"]:not([readonly]):not([disabled])){border-style:var(--_ui5_input_error_warning_border_style)}:host([value-state="Critical"]:not([readonly]):not([disabled])){background:var(--sapField_WarningBackgroundStyle);background-color:var(--sapField_WarningBackground);border-color:var(--_ui5_input_value_state_warning_border_color);box-shadow:var(--sapField_WarningShadow)}:host([value-state="Critical"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5_input_focused_value_state_warning_background);border-color:var(--_ui5_input_focused_value_state_warning_border_color)}:host([value-state="Critical"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5_input_focused_value_state_warning_focus_outline_color)}:host([value-state="Critical"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5_input_value_state_warning_border_botom_color)}:host([value-state="Critical"]:not([readonly]):not([focused]):hover),:host([value-state="Critical"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_WarningShadow)}:host([value-state="Positive"]:not([readonly]):not([disabled])){background:var(--sapField_SuccessBackgroundStyle);background-color:var(--sapField_SuccessBackground);border-color:var(--_ui5_input_value_state_success_border_color);border-width:var(--_ui5_input_value_state_success_border_width);box-shadow:var(--sapField_SuccessShadow)}:host([value-state="Positive"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5_input_focused_value_state_success_background);border-color:var(--_ui5_input_focused_value_state_success_border_color)}:host([value-state="Positive"][focused]:not([opened]):not([readonly])) .ui5-input-focusable-element:after{border-color:var(--_ui5_input_focused_value_state_success_focus_outline_color)}:host([value-state="Positive"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5_input_value_state_success_border_botom_color)}:host([value-state="Positive"]:not([readonly]):not([focused]):hover),:host([value-state="Positive"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_SuccessShadow)}:host([value-state="Information"]:not([readonly]):not([disabled])){background:var(--sapField_InformationBackgroundStyle);background-color:var(--sapField_InformationBackground);border-color:var(--_ui5_input_value_state_information_border_color);border-width:var(--_ui5_input_information_border_width);box-shadow:var(--sapField_InformationShadow)}:host([value-state="Information"][focused]:not([opened]):not([readonly])){background-color:var(--_ui5_input_focused_value_state_information_background);border-color:var(--_ui5_input_focused_value_state_information_border_color)}:host([value-state="Information"]:not([readonly])) .ui5-input-root:before{background-color:var(--_ui5_input_value_success_information_border_botom_color)}:host([value-state="Information"]:not([readonly]):not([focused]):hover),:host([value-state="Information"]:not([readonly])[focused][opened]:hover){background-color:var(--sapField_Hover_Background);box-shadow:var(--sapField_Hover_InformationShadow)}::slotted([ui5-input-icon]){height:100%}.ui5-input-icon-root{min-width:var(--_ui5_input_icon_min_width);height:100%;display:flex;justify-content:center;align-items:center}::slotted([ui5-icon][slot="icon"]){align-self:start;padding:var(--_ui5_input_custom_icon_padding);box-sizing:content-box!important}:host([value-state="Negative"]) .inputIcon,:host([value-state="Critical"]) .inputIcon{padding:var(--_ui5_input_error_warning_icon_padding)}:host([value-state="Negative"][focused]) .inputIcon,:host([value-state="Critical"][focused]) .inputIcon{padding:var(--_ui5_input_error_warning_focused_icon_padding)}:host([value-state="Information"]) .inputIcon{padding:var(--_ui5_input_information_icon_padding)}:host([value-state="Information"][focused]) .inputIcon{padding:var(--_ui5_input_information_focused_icon_padding)}:host([value-state="Negative"]) ::slotted(.inputIcon[ui5-icon]),:host([value-state="Negative"]) ::slotted([ui5-icon][slot="icon"]),:host([value-state="Critical"]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5_input_error_warning_custom_icon_padding)}:host([value-state="Negative"][focused]) ::slotted(.inputIcon[ui5-icon]),:host([value-state="Negative"][focused]) ::slotted([ui5-icon][slot="icon"]),:host([value-state="Critical"][focused]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5_input_error_warning_custom_focused_icon_padding)}:host([value-state="Information"]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5_input_information_custom_icon_padding)}:host([value-state="Information"][focused]) ::slotted([ui5-icon][slot="icon"]){padding:var(--_ui5_input_information_custom_focused_icon_padding)}:host([value-state="Negative"]) .inputIcon:active,:host([value-state="Negative"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5_input_error_icon_box_shadow);color:var(--_ui5_input_icon_error_pressed_color)}:host([value-state="Negative"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5_input_error_icon_box_shadow)}:host([value-state="Critical"]) .inputIcon:active,:host([value-state="Critical"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5_input_warning_icon_box_shadow);color:var(--_ui5_input_icon_warning_pressed_color)}:host([value-state="Critical"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5_input_warning_icon_box_shadow)}:host([value-state="Information"]) .inputIcon:active,:host([value-state="Information"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5_input_information_icon_box_shadow);color:var(--_ui5_input_icon_information_pressed_color)}:host([value-state="Information"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5_input_information_icon_box_shadow)}:host([value-state="Positive"]) .inputIcon:active,:host([value-state="Positive"]) .inputIcon.inputIcon--pressed{box-shadow:var(--_ui5_input_success_icon_box_shadow);color:var(--_ui5_input_icon_success_pressed_color)}:host([value-state="Positive"]) .inputIcon:not(.inputIcon--pressed):not(:active):hover{box-shadow:var(--_ui5_input_success_icon_box_shadow)}.ui5-input-clear-icon-wrapper{height:var(--_ui5_input_icon_wrapper_height);padding:0;width:var(--_ui5_input_icon_width);min-width:var(--_ui5_input_icon_width);display:flex;justify-content:center;align-items:center;box-sizing:border-box}:host([value-state]:not([value-state="None"]):not([value-state="Positive"])) .ui5-input-clear-icon-wrapper{height:var(--_ui5_input_icon_wrapper_state_height);vertical-align:top}:host([value-state="Positive"]) .ui5-input-clear-icon-wrapper{height:var(--_ui5_input_icon_wrapper_success_state_height)}[ui5-icon].ui5-input-clear-icon{padding:0;color:inherit}[inner-input]::-webkit-outer-spin-button,[inner-input]::-webkit-inner-spin-button{-webkit-appearance:inherit;margin:inherit}[ui5-responsive-popover] [ui5-input]{width:100%}:host([value-state="Negative"]),:host([value-state="Critical"]){--_ui5_input_icon_state_padding: var(--_ui5_input_error_warning_icon_padding)}:host([value-state="Information"]){--_ui5_input_icon_state_padding: var(--_ui5_input_information_icon_padding)}:host([value-state="Negative"]){--_ui5_input_icon_state_pressed_shadow: var(--_ui5_input_error_icon_box_shadow);--_ui5_input_icon_state_pressed_color: var(--_ui5_input_icon_error_pressed_color);--_ui5_input_icon_state_focus_outline_color: var(--_ui5_input_focused_value_state_error_focus_outline_color)}:host([value-state="Critical"]){--_ui5_input_icon_state_pressed_shadow: var(--_ui5_input_warning_icon_box_shadow);--_ui5_input_icon_state_pressed_color: var(--_ui5_input_icon_warning_pressed_color);--_ui5_input_icon_state_focus_outline_color: var(--_ui5_input_focused_value_state_warning_focus_outline_color)}:host([value-state="Information"]){--_ui5_input_icon_state_pressed_shadow: var(--_ui5_input_information_icon_box_shadow);--_ui5_input_icon_state_pressed_color: var(--_ui5_input_icon_information_pressed_color);--_ui5_input_icon_state_focus_outline_color: var(--sapContent_FocusColor)}:host([value-state="Positive"]){--_ui5_input_icon_state_pressed_shadow: var(--_ui5_input_success_icon_box_shadow);--_ui5_input_icon_state_pressed_color: var(--_ui5_input_icon_success_pressed_color);--_ui5_input_icon_state_focus_outline_color: var(--_ui5_input_focused_value_state_success_focus_outline_color)}:host([disabled]){--_ui5_input_icon_state_opacity: var(--sapContent_DisabledOpacity);--_ui5_input_icon_state_pointer_events: none;--_ui5_input_icon_state_cursor: default}:host([readonly]:not([disabled])){--_ui5_input_icon_state_pointer_events: none;--_ui5_input_icon_state_cursor: default}:host([icon]){min-width:var(--_ui5_button_base_min_width);width:var(--_ui5_button_base_min_width)}:host([opened]) .ui5-input-focusable-element:after{content:none}:host([icon]) .ui5-select-root{min-width:var(--_ui5_button_base_min_width)}:host([icon]) .ui5-select-label-root{min-width:0;padding-inline-start:0}.ui5-select-root{min-width:calc(var(--_ui5_input_min_width) + (var(--_ui5-input-icons-count)*var(--_ui5_input_icon_width)));width:100%;height:100%;display:flex;outline:none;cursor:pointer;overflow:hidden;border-radius:var(--_ui5_input_border_radius);background:var(--_ui5_select_bottom_border_gradient)}.ui5-select-label-root{flex-shrink:1;flex-grow:1;align-self:center;min-width:1rem;padding-inline-start:.5rem;cursor:pointer;outline:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--_ui5_select_label_color);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400}.ui5-select-option-icon{padding-inline-start:.5rem;color:var(--sapField_TextColor);align-self:center}:host(:not([disabled])){cursor:pointer}.ui5-select-icon-root{display:flex;justify-content:center;align-items:center;box-sizing:border-box;width:var(--_ui5_select_icon_width);min-width:var(--_ui5_select_icon_width);height:var(--_ui5_select_icon_wrapper_height);padding:0}.ui5-select-icon{color:inherit}:host([value-state]:not([value-state="None"])) .ui5-select-root,:host([value-state="None"]:not([readonly]):not([disabled]):hover) .ui5-select-root,:host(:not([value-state]):not([readonly]):not([disabled]):hover) .ui5-select-root{background:none}:host([readonly]) .ui5-select-root{background:none}:host([value-state]:not([value-state="None"],[value-state="Positive"])) .ui5-select-icon-root{height:var(--_ui5_select_icon_wrapper_state_height)}
`;

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var SelectPopoverCss = `.ui5-select-popover::part(content),.ui5-select-popover::part(header){padding:0}.ui5-select-popover .ui5-responsive-popover-header .row{justify-content:flex-start}.ui5-select-popover .ui5-valuestatemessage--error,.ui5-select-popover .ui5-valuestatemessage--warning,.ui5-select-popover .ui5-valuestatemessage--success,.ui5-select-popover .ui5-valuestatemessage--information{box-shadow:none}.ui5-select-popover .ui5-valuestatemessage-header{box-shadow:var(--sapContent_HeaderShadow)}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Select_1;
    const isPrintableCharacter = (e) => {
        return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    };
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
             * Defines the separator type for the two columns layout when Select is in read-only mode.
             *
             * @default "Dash"
             * @public
             * @since 2.16.0
             */
            this.textSeparator = "Dash";
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
        get _flatOptions() {
            return this.options.flatMap(item => {
                if (isInstanceOfOptionGroup(item)) {
                    return item.items;
                }
                return item;
            });
        }
        get hasGroups() {
            return this.options.some(item => isInstanceOfOptionGroup(item));
        }
        get _groupCountMessageId() {
            return `${this._id}-groupCountDesc`;
        }
        get _groupCountText() {
            const groups = this.options.filter(item => isInstanceOfOptionGroup(item));
            return Select_1.i18nBundle.getText(i18nDefaults.SELECT_OPTIONS_IN_GROUPS, this._flatOptions.length, groups.length);
        }
        _applyGroupAriaPositions() {
            const flatOptions = this._flatOptions;
            flatOptions.forEach(o => {
                o._forcedSetsize = undefined;
                o._forcedPosinset = undefined;
            });
            if (!this.hasGroups) {
                return;
            }
            const totalCount = flatOptions.length;
            let globalPosition = 0;
            this.options.forEach(item => {
                if (isInstanceOfOptionGroup(item)) {
                    item.items.forEach(opt => {
                        opt._forcedSetsize = totalCount;
                        opt._forcedPosinset = ++globalPosition;
                    });
                }
                else {
                    globalPosition++;
                }
            });
        }
        onBeforeRendering() {
            this._applySelection();
            this._applyGroupAriaPositions();
            this.style.setProperty("--_ui5-input-icons-count", `${this.iconsCount}`);
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
                this._flatOptions.forEach(option => {
                    option.selected = !!((option.getAttribute("value") || option.textContent) === value);
                });
            }
        }
        /**
         * Selects the first option if no option is selected,
         * or selects the last option if multiple options are selected.
         */
        _applyAutoSelection() {
            const flatOptions = this._flatOptions;
            let selectedIndex = flatOptions.findLastIndex(option => option.selected);
            selectedIndex = selectedIndex === -1 ? 0 : selectedIndex;
            for (let i = 0; i < flatOptions.length; i++) {
                flatOptions[i].selected = selectedIndex === i;
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
            return this._flatOptions.findIndex(option => option.selected);
        }
        /**
         * Currently selected `ui5-option` element.
         * @public
         * @default undefined
         */
        get selectedOption() {
            return this._flatOptions.find(option => option.selected);
        }
        /**
         * Helper function to build display text with separator when additional text exists
         * @param mainText - The main text content
         * @param additionalText - The additional text (optional)
         * @returns The combined text with separator if additionalText exists, otherwise just mainText
         * @private
         */
        _buildDisplayText(mainText, additionalText) {
            if (!additionalText) {
                return mainText;
            }
            return `${mainText} ${this._separatorSymbol} ${additionalText}`;
        }
        get text() {
            const selectedOption = this.selectedOption;
            if (!selectedOption) {
                return "";
            }
            // Only show separator when readonly and there's additional text
            if (this.readonly && selectedOption.additionalText) {
                return this._buildDisplayText(selectedOption.effectiveDisplayText, selectedOption.additionalText);
            }
            return selectedOption.effectiveDisplayText;
        }
        get _effectiveTooltip() {
            // User-defined tooltip takes precedence
            if (this.tooltip) {
                return this.tooltip;
            }
            // Provide default tooltip for readonly mode to show full content
            if (this.readonly) {
                const selectedOption = this.selectedOption;
                if (!selectedOption) {
                    return undefined;
                }
                // Use textContent for tooltip to show actual text content, not display text
                const mainText = selectedOption.textContent || "";
                return this._buildDisplayText(mainText, selectedOption.additionalText);
            }
            return undefined;
        }
        get _separatorSymbol() {
            switch (this.textSeparator) {
                case SelectTextSeparator$1.Bullet:
                    return "·"; // Middle dot (U+00B7)
                case SelectTextSeparator$1.VerticalLine:
                    return "|"; // Vertical line (U+007C)
                case SelectTextSeparator$1.Dash:
                default:
                    return "–"; // En dash (U+2013)
            }
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
            else if (webcomponentsBase.m$1(e) && this._isPickerOpen) {
                this._escapePressed = true;
            }
            else if (webcomponentsBase.M(e)) {
                this._handleHomeKey(e);
            }
            else if (webcomponentsBase.n(e)) {
                this._handleEndKey(e);
                // When focus is on the list item, Enter triggers _handleItemPress via the List item-click
                // event, which already calls _handleSelectionChange and prevents default.
                // Skip here to avoid a double selection change.
            }
            else if (webcomponentsBase.b$1(e) && !e.defaultPrevented) {
                this._handleSelectionChange();
            }
            else if (webcomponentsBase.P(e) || webcomponentsBase._(e)) {
                this._handleArrowNavigation(e);
            }
            else if (isPrintableCharacter(e)) {
                this._handleKeyboardNavigation(e);
            }
        }
        _handleKeyboardNavigation(e) {
            if (this.readonly) {
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
                const nextIndex = this._flatOptions.indexOf(itemToSelect);
                this._changeSelectedItem(this._selectedIndex, nextIndex);
                if (currentIndex !== this._selectedIndex) {
                    this.itemSelectionAnnounce();
                    this._scrollSelectedItem();
                }
            }
        }
        _searchNextItemByText(text) {
            let orderedOptions = this._flatOptions.slice(0);
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
            const lastIndex = this._flatOptions.length - 1;
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
            return this._flatOptions.indexOf(item);
        }
        _select(index) {
            const selectedIndex = this._selectedIndex;
            const flatOptions = this._flatOptions;
            if (index < 0 || index >= flatOptions.length || flatOptions.length === 0) {
                return;
            }
            if (flatOptions[selectedIndex]) {
                flatOptions[selectedIndex].selected = false;
            }
            const selectedOption = flatOptions[index];
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
            const options = this._flatOptions;
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
            return this._selectedIndex === (this._flatOptions.length - 1) ? this._selectedIndex : (this._selectedIndex + 1);
        }
        _getPreviousOptionIndex() {
            return this._selectedIndex === 0 ? this._selectedIndex : (this._selectedIndex - 1);
        }
        _beforeOpen() {
            this._selectedIndexBeforeOpen = this._selectedIndex;
            this._lastSelectedOption = this._flatOptions[this._selectedIndex];
        }
        _afterOpen() {
            this.opened = true;
            this.fireDecoratorEvent("open");
            this.itemSelectionAnnounce();
            this._scrollSelectedItem();
            this._applyFocusToSelectedItem();
        }
        _applyFocusToSelectedItem() {
            const flatOptions = this._flatOptions;
            flatOptions.forEach(option => {
                option.focused = option.selected;
                if (option.focused) {
                    // move focus to the selected option so screen readers
                    // can announce it when the popover opens
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
            else if (this._lastSelectedOption !== this._flatOptions[this._selectedIndex]) {
                this._fireChangeEvent(this._flatOptions[this._selectedIndex]);
                this._lastSelectedOption = this._flatOptions[this._selectedIndex];
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
            return Select_1.i18nBundle.getText(i18nDefaults.SELECT_LISTBOX_LABEL);
        }
        get _cancelButtonText() {
            return Select_1.i18nBundle.getText(i18nDefaults.SELECT_DIALOG_CANCEL_BUTTON);
        }
        get _currentlySelectedOption() {
            return this._flatOptions[this._selectedIndex];
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
            const remSizeInPx = parseInt(getComputedStyle(document.documentElement).fontSize);
            const flatOptionsCount = this._flatOptions.length;
            return {
                popoverHeader: {
                    "display": "block",
                },
                responsivePopoverHeader: {
                    "display": flatOptionsCount && this._listWidth === 0 ? "none" : "inline-block",
                    "width": `${flatOptionsCount ? this._listWidth : this.offsetWidth}px`,
                    "max-width": "100%",
                },
                responsivePopover: {
                    "min-width": `${this.offsetWidth}px`,
                    "max-width": (this.offsetWidth / remSizeInPx) > 40 ? `${this.offsetWidth}px` : "40rem",
                    "margin-top": "var(--sapField_BorderWidth)",
                },
            };
        }
        get ariaLabelText() {
            return AccessibilityTextsHelper.A(this) || AccessibilityTextsHelper.M(this);
        }
        get _effectiveListAccessibleName() {
            return this.ariaLabelText || this._headerTitleText;
        }
        get _effectivePopoverAccessibleName() {
            const fieldName = this._effectiveListAccessibleName;
            if (!fieldName) {
                return undefined;
            }
            const prefix = Select_1.i18nBundle.getText(i18nDefaults.SELECT_POPOVER_ACCESSIBLE_NAME_PREFIX);
            return `${prefix} ${fieldName}`;
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
            return ManagedStyles.d();
        }
        itemSelectionAnnounce() {
            let text;
            const optionsCount = this._flatOptions.length;
            const itemPositionText = Select_1.i18nBundle.getText(i18nDefaults.LIST_ITEM_POSITION, this._selectedIndex + 1, optionsCount);
            if (this.focused && this._currentlySelectedOption) {
                text = `${this._currentlySelectedOption.textContent} ${this._isPickerOpen ? itemPositionText : ""}`;
                InvisibleMessage.v(text);
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
            const ids = [
                this.valueStateTextId,
                this.ariaDescriptionTextId,
                this.hasGroups ? this._groupCountMessageId : undefined,
            ].filter(Boolean);
            return ids.length ? ids.join(" ") : undefined;
        }
        get accessibilityInfo() {
            return {
                role: "combobox",
                type: this._ariaRoleDescription,
                description: this.text,
                label: this.ariaLabelText,
                readonly: this.readonly,
                required: this.required,
                disabled: this.disabled,
            };
        }
        _updateAssociatedLabelsTexts() {
            this._associatedDescriptionRefTexts = AccessibilityTextsHelper.p(this);
        }
        _getPopover() {
            return this.shadowRoot.querySelector("[ui5-popover]");
        }
    };
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "disabled", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "icon", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "name", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "valueState", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "required", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "readonly", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "accessibleName", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "accessibleNameRef", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "accessibleDescription", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "accessibleDescriptionRef", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "tooltip", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "textSeparator", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: String, noAttribute: true })
    ], Select.prototype, "_associatedDescriptionRefTexts", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Select.prototype, "_iconPressed", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "opened", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], Select.prototype, "_listWidth", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Select.prototype, "focused", void 0);
    __decorate$2([
        webcomponentsBase.d({ "default": true, type: HTMLElement, invalidateOnChildChange: true })
    ], Select.prototype, "options", void 0);
    __decorate$2([
        webcomponentsBase.d()
    ], Select.prototype, "valueStateMessage", void 0);
    __decorate$2([
        webcomponentsBase.d()
    ], Select.prototype, "label", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Select.prototype, "value", null);
    __decorate$2([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Select, "i18nBundle", void 0);
    Select = Select_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-select",
            languageAware: true,
            formAssociated: true,
            renderer: parametersBundle_css.y,
            template: SelectTemplate,
            styles: [
                selectCss,
                ResponsivePopoverCommon_css.ResponsivePopoverCommonCss,
                Input.ValueStateMessageCss,
                SelectPopoverCss,
            ],
            dependencies: [
                Label,
                ResponsivePopover.ResponsivePopover,
                Popover.Popover,
                List.List,
                Icon.Icon,
                Button.Button,
                OptionGroup$1,
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

    function SearchFieldScopePopoverTemplate() {
        return (parametersBundle_css.jsx(ResponsivePopover.ResponsivePopover, { id: `${this._id}-scope-popover`, class: "ui5-search-field-scope-popover", hideArrow: true, modal: false, placement: Popover.PopoverPlacement.Bottom, horizontalAlign: Popover.PopoverHorizontalAlign.Start, open: this._scopePopoverOpen, opener: this._scopeIconButton || this, onClose: this._handleScopePopoverClose, children: parametersBundle_css.jsx(List.List, { separators: List.ListSeparator.None, onItemClick: this._handleScopeItemClick.bind(this), children: this.scopes.map(scopeOption => (parametersBundle_css.jsx(ListItemStandard.ListItemStandard, { "data-scope-value": scopeOption.value, selected: scopeOption.value === this.scopeValue, children: scopeOption.text }))) }) }));
    }

    function SearchFieldTemplate(options) {
        return (!options?.forceExpanded && this.collapsed ? (parametersBundle_css.jsx(Button.Button, { class: "ui5-shell-search-field-button", icon: search.search, design: Button.ButtonDesign.Transparent, "data-sap-focus-ref": true, loading: this.fieldLoading, onClick: this._handleSearchIconPress, tooltip: this._effectiveIconTooltip, accessibleName: this._effectiveIconTooltip, accessibilityAttributes: this._searchButtonAccessibilityAttributes })) : (parametersBundle_css.jsxs(Button.BusyIndicator, { class: "ui5-search-field-busy-indicator", active: this.fieldLoading, children: [parametersBundle_css.jsx("div", { class: "ui5-search-field-root", role: "search", onFocusOut: this._onFocusOutSearch, children: parametersBundle_css.jsxs("div", { class: "ui5-search-field-content", children: [this.scopes?.length ? (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: !this._isMobileView ? (
                                // Desktop/Tablet: Show full Select component
                                parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx(Select$1, { onChange: this._handleScopeChange, class: "ui5-search-field-select", accessibleName: this._translations.scope, tooltip: this._translations.scope, value: this.scopeValue, exportparts: "label:scope-label", children: this.scopes.map(scopeOption => (parametersBundle_css.jsx(Option$1, { value: scopeOption.value, "data-ui5-stable": scopeOption.stableDomRef, ref: this.captureRef.bind(scopeOption), children: scopeOption.text }))) }), parametersBundle_css.jsx("div", { class: "ui5-search-field-separator" })] })) : (
                                // Mobile/Phone: Show icon button only
                                parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx(Button.Button, { ref: this.captureScopeIconRef.bind(this), class: "ui5-search-field-scope-button", icon: slimArrowDown.slimArrowDownIcon, design: Button.ButtonDesign.Transparent, onClick: this._handleScopeIconPress, tooltip: this._scopeIconAccessibleName, accessibleName: this._scopeIconAccessibleName, accessibilityAttributes: {
                                                hasPopup: "dialog",
                                                expanded: this._scopePopoverOpen,
                                            } }), parametersBundle_css.jsx("div", { class: "ui5-search-field-separator" })] })) })) : this.filterButton?.length ? (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("div", { class: "ui5-filter-wrapper", style: "display: contents", children: parametersBundle_css.jsx("slot", { name: "filterButton" }) }), parametersBundle_css.jsx("div", { class: "ui5-search-field-separator" })] })) : null, parametersBundle_css.jsx("input", { class: "ui5-search-field-inner-input", role: "searchbox", "aria-description": this.accessibleDescription, "aria-label": this.accessibleName || this._translations.searchFieldAriaLabel, "aria-autocomplete": "both", "aria-controls": "ui5-search-list", value: this.value, placeholder: this._effectivePlaceholder, "data-sap-focus-ref": true, onInput: this._handleInput, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, onKeyDown: this._onkeydown, onClick: this._handleInnerClick }), this._effectiveShowClearIcon &&
                                parametersBundle_css.jsx(Icon.Icon, { class: "ui5-shell-search-field-icon", name: decline.declineIcon, showTooltip: true, accessibleName: this._translations.clearIcon, onClick: this._handleClear }), parametersBundle_css.jsx(Icon.Icon, { class: {
                                    "ui5-shell-search-field-icon": true,
                                    "ui5-shell-search-field-search-icon": this._isSearchIcon,
                                }, name: search.search, showTooltip: true, accessibleName: this._effectiveIconTooltip, onClick: this._handleSearchIconPress })] }) }), SearchFieldScopePopoverTemplate.call(this)] })));
    }

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
        return (parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { id: "ui5-search-list", hideArrow: true, preventFocusRestore: true, preventInitialFocus: !ManagedStyles.d(), accessibleNameRef: "suggestions-speech-output message-area-text message-area-description", placement: Popover.PopoverPlacement.Bottom, horizontalAlign: Popover.PopoverHorizontalAlign.Start, open: this.open, opener: this, onOpen: this._handleOpen, onClose: this._handleClose, onBeforeClose: this._handleBeforeClose, onBeforeOpen: this._handleBeforeOpen, part: "popover", class: {
                "ui5-search-popover": true,
                "ui5-search-popover-phone": ManagedStyles.d(),
            }, children: [ManagedStyles.d() ? (headerTemplate ? headerTemplate.call(this) : (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsxs("header", { slot: "header", class: "ui5-search-popup-searching-header", children: [parametersBundle_css.jsx(Input.Input, { value: this.value, class: "ui5-search-popover-search-field", onInput: this._handleMobileInput, showClearIcon: this.showClearIcon, noTypeahead: this.noTypeahead, hint: InputKeyHint$1.Search, onKeyDown: this._onMobileInputKeydown, children: this._flattenItems.map(item => {
                                    return (parametersBundle_css.jsx(SuggestionItem.SuggestionItem, { text: item.text }));
                                }) }), parametersBundle_css.jsx(Button.Button, { design: Button.ButtonDesign.Transparent, onClick: this._handleCancel, children: this.cancelButtonText })] }) }))) : null, parametersBundle_css.jsxs("main", { class: "ui5-search-popover-content", children: [parametersBundle_css.jsx("slot", { name: "messageArea" }), parametersBundle_css.jsx("div", { class: "search-popover-busy-wrapper", children: parametersBundle_css.jsx(Button.BusyIndicator, { active: true }) }), this.items.length ?
                            parametersBundle_css.jsx(List.List, { class: "ui5-search-list", separators: List.ListSeparator.None, onKeyDown: this._onItemKeydown, onFocusIn: this._onListItemFocusIn, accessibleRole: List.ListAccessibleRole.ListBox, onItemClick: this._onItemClick, children: parametersBundle_css.jsx("slot", {}) })
                            : (parametersBundle_css.jsx("slot", { name: "illustration" })), parametersBundle_css.jsx("span", { class: "ui5-hidden-text", id: "suggestions-speech-output", children: this.suggestionsText }), this.messageArea[0]?.text ? (parametersBundle_css.jsx("span", { class: "ui5-hidden-text", id: "message-area-text", children: this.messageArea[0].text })) : null, this.messageArea[0]?.description ? (parametersBundle_css.jsx("span", { class: "ui5-hidden-text", id: "message-area-description", children: this.messageArea[0].description })) : null] }), this.action.length ? (parametersBundle_css.jsx("slot", { onKeyDown: this._handleActionKeydown, name: "action", slot: "footer" })) : null] }));
    }

    function SearchTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [SearchFieldTemplate.call(this), SearchPopoverTemplate.call(this)] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme, "host");
    var SearchCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}.ui5-search-popover{width:var(--search_width);max-height:var(--_ui5_search_popover_max_height);margin-top:.25rem;box-sizing:border-box}.ui5-search-popup-searching-header{display:flex;gap:.5rem;width:100%;align-items:center}.ui5-search-popover::part(header){padding:.5rem 1rem;box-shadow:none;box-sizing:border-box}.ui5-search-popover::part(header):before{display:none}.ui5-search-popover::part(content){padding:0;box-shadow:none}:host([loading]) .ui5-search-popover main{min-height:2rem}.ui5-search-popover-search-field{flex:1;height:2.25rem;border-radius:var(--_ui5_search_input_border_radius)}.ui5-search-popover-search-field::part(root):after{border-radius:var(--_ui5_search_input_border_radius)}.ui5-search-popover-search-field::part(input){padding-inline-start:.875rem}.ui5-search-popover-search-field::part(clear-icon-wrapper){margin-inline-end:.5rem}.ui5-search-popover-loading-bi{width:100%;height:100%}::slotted([slot="action"]){width:100%;margin-top:.5rem;margin-bottom:.5rem}.search-popover-busy-wrapper{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:42;width:100%;height:100%;display:none;justify-content:center;align-items:center;pointer-events:all}:host([loading]) .search-popover-busy-wrapper{display:flex;width:100%;height:100%}.search-popover-busy-wrapper [ui5-busy-indicator]{z-index:1}.search-popover-busy-wrapper:after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:var(--_ui5-search-loading-overlay-background);opacity:var(--_ui5-search-loading-overlay-transparency);border-radius:var(--_ui5_popup_border_radius)}.ui5-search-popover-phone .ui5-search-popover-content{position:relative;width:100%;height:100%;display:flex;flex-direction:column}.ui5-search-popover-phone .search-popover-busy-wrapper:after{border-radius:0}
`;

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme, "host");
    var SearchFieldCss = `:host,.ui5-shellbar-search-field-wrapper{height:2.25rem;display:flex;align-items:center}:host(:not([collapsed])),.ui5-shellbar-search-field-wrapper{width:var(--search_width);min-width:18rem;max-width:36rem;margin:0;height:2.25rem;color:var(--_ui5-search-field-text-color);font-size:var(--sapFontSize);font-family:var(--sapFontFamily);font-style:normal;box-shadow:var(--sapField_Shadow);border-radius:var(--_ui5_search_input_border_radius);box-sizing:border-box;text-align:start;background:var(--sapField_BackgroundStyle);background-color:var(--_ui5-search-wrapper-background);position:relative}.ui5-search-field-busy-indicator{width:100%;height:100%;border-radius:var(--_ui5_search_input_border_radius)}.ui5-shellbar-search-field-wrapper{flex:1;min-width:auto}:host(:not([collapsed]):hover),:host(:not([collapsed]):focus-within),.ui5-shellbar-search-field-wrapper:focus-within{box-shadow:var(--sapField_Hover_Shadow);background:var(--_ui5-search-wrapper-hover-background);background-color:var(--_ui5-search-wrapper-hover-background-color)}:host(:not([collapsed]):focus-within),.ui5-shellbar-search-field-wrapper:focus-within{background-color:var(--_ui5-search-wrapper-active-background-color)}:host([focused-inner-input]) .ui5-search-field-root{outline:var(--_ui5_search_wrapper_outline);border-radius:var(--_ui5_search_input_border_radius);outline-offset:-.125rem}.ui5-search-field-root{width:100%;height:100%;position:relative;background:transparent;display:inline-block;outline:none;box-sizing:border-box;color:inherit;transition:border-color .2s ease-in-out;border-radius:var(--_ui5_search_input_border_radius);overflow:hidden}.ui5-search-field-content{height:100%;display:flex;flex-direction:row;justify-content:flex-end;align-items:center;overflow:hidden}[ui5-select]{outline:none;margin:var(--_ui5-search-scope-spacing);width:fit-content;min-width:auto;max-width:18rem;flex:0 1 auto;border-radius:var(--_ui5_search_input_border_radius);border:var(--_ui5-search-border);box-shadow:none;background:unset;background-color:var(--_ui5-search-elements-background);height:var(--_ui5-search-select-height);--_ui5_select_label_color: var(--sapShell_TextColor);--_ui5_input_focus_outline_color: transparent;--_ui5_select_bottom_border_gradient: none}[ui5-select]:hover:not(:active):not(:focus-within){box-shadow:var(--_ui5-search_input_scope_hover_shadow)}[ui5-select]:not(:active):not(:focus-within)::part(icon-wrapper):hover{box-shadow:var(--_ui5-search_input_scope_hover_shadow)}[ui5-select]:active,[ui5-select]:focus-within{box-shadow:var(--_ui5-search_input_scope_active_shadow)}[ui5-select]:active::part(icon-wrapper),[ui5-select]:focus-within::part(icon-wrapper){box-shadow:var(--_ui5-search_input_scope_active_shadow);background:var(--sapShell_Active_Background);color:var(--sapShell_Active_TextColor)}[ui5-select]::part(icon){display:flex;justify-content:center;align-items:stretch;height:100%;padding:0 .5rem;align-self:center;border-radius:var(--_ui5_search_input_border_radius);color:var(--sapShell_InteractiveTextColor)}[ui5-select]::part(popover){background-color:var(--sapShellColor)}::slotted([slot="filterButton"]){--_ui5_button_focused_border_radius: var(--_ui5_search_filter_button_border_radius);min-width:var(--_ui5_search_icon_size);height:var(--_ui5_search_icon_size);border:var(--_ui5_search_filter_button_border);border-radius:var(--_ui5_search_filter_button_border_radius);color:var(--sapShell_InteractiveTextColor);outline:none;background:var(--_ui5-search-filter_button_background_color);box-sizing:border-box;margin-inline-end:.1875rem;margin-inline-start:.25rem}::slotted([slot="filterButton"]:focus-within){background-color:var(--ui5_search_filter_button_background_active);border:var(--_ui5_search_filter_button_border)}::slotted([slot="filterButton"]:not([active]):not(:focus-within):hover){background-color:var(--sapShell_Hover_Background);border:var(--_ui5_seach_filter_button_border_hover)}.ui5-search-field-inner-input{font-size:var(--sapFontSize);font-family:var(--sapFontFamily);font-style:normal;padding:.5rem 0;height:100%;width:100%;box-sizing:border-box;background-color:var(--_ui5-search-elements-background);border:var(--_ui5-search-border);outline:none;color:inherit;padding-inline-start:var(--_ui5-search-input-start-padding);padding-inline-end:var(--_ui5_search_input_end_padding)}:host([focused-inner-input]) .ui5-search-field-inner-input{outline:var(--_ui5_search_input_outline);border-radius:var(--_ui5_search_input_border_radius);outline-offset:-.3125rem}:host(:not([mode="Scoped"])) .ui5-search-field-inner-input{padding-inline-start:.875rem}.ui5-search-field-inner-input:hover{background-color:var(--_ui5-search-elements-hover-background)}.ui5-search-field-inner-input:focus-within{background-color:var(--_ui5-search-elements-active-background)}.ui5-search-field-inner-input::placeholder{font-weight:400;font-style:italic;color:var(--sapField_PlaceholderTextColor);padding-inline-start:.125rem}:host([mode="Scoped"]) .ui5-search-field-inner-input{margin-inline-start:var(--_ui5_search_input_start_margin)}.ui5-search-field-separator{height:1.5rem;width:.0625rem;background:var(--_ui5_search_separator_background);box-sizing:border-box}.ui5-shell-search-field-button{outline:none;min-width:var(--_ui5_search_icon_size);height:var(--_ui5_search_icon_size);border-radius:var(--_ui5_search_icon_border_radius);box-sizing:border-box;cursor:pointer}.ui5-shell-search-field-button:not([design=Emphasized]){color:var(--sapShell_InteractiveTextColor);background-color:var(--_ui5-search-elements-background);min-width:var(--_ui5_search_icon_size_default);height:var(--_ui5_search_icon_size_default);border-radius:var(--_ui5_shellbar_button_border_radius)}.ui5-shell-search-field-button:not([design=Emphasized]):hover{background-color:var(--sapShell_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);border-radius:var(--_ui5_shellbar_button_border_radius)}.ui5-shell-search-field-button[desktop]:not([active])::part(button):after,.ui5-shell-search-field-button:not([active])::part(button):focus-visible:after,.ui5-shell-search-field-button[desktop][active][design=Emphasized]::part(button):focus-within:after,.ui5-shell-search-field-button[active][design=Emphasized]::part(button):focus-visible:after,.ui5-shell-search-field-button[desktop][active]::part(button):focus-within:before,.ui5-shell-search-field-button[active]::part(button):focus-visible:before,.ui5-shell-search-field-button[design=Emphasized][desktop]::part(button):focus-within:before,.ui5-shell-search-field-button[design=Emphasized]::part(button):focus-visible:before{border-radius:var(--_ui5_shellbar_button_border_radius)}.ui5-shell-search-field-icon{display:flex;justify-content:center;align-items:stretch;cursor:pointer;outline:none;min-width:var(--_ui5_search_icon_size);height:var(--_ui5_search_icon_size);border-radius:var(--_ui5_search_icon_border_radius);margin-inline-end:.25rem;margin-inline-start:.1875rem;box-sizing:border-box;color:var(--sapShell_InteractiveTextColor);background-color:var(--_ui5-search-elements-background);border:var(--_ui5-search-icon-border)}.ui5-shell-search-field-icon::part(root){padding:var(--_ui5_search_icon_padding);outline-offset:-.125rem}.ui5-shell-search-field-icon:hover::part(root){padding:var(--_ui5_search_icon_hover_padding);outline-offset:-.1875rem}.ui5-shell-search-field-icon:focus::part(root){border-radius:var(--_ui5_search_icon_border_radius)}.ui5-shell-search-field-icon:hover,.ui5-shell-search-field-input-button:hover{background:var(--sapShell_Hover_Background);border:1px solid var(--sapButton_Lite_Hover_BorderColor);color:var(--sapShell_InteractiveTextColor)}.ui5-shell-search-field-search-icon{background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);color:var(--sapButton_Emphasized_TextColor)}.ui5-search-field-select{--_ui5_input_focus_border_radius: var(--_ui5_search_input_border_radius)}.ui5-search-field-select::part(label){padding:0 .25rem 0 .5rem}.ui5-search-field-select::part(icon-wrapper){border-radius:var(--_ui5_search_input_border_radius);height:100%}.ui5-search-field-inner-input::selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}.ui5-search-field-scope-button{min-width:2rem;width:2rem;height:var(--_ui5-search-select-height);margin:var(--_ui5-search-scope-spacing);border-radius:var(--_ui5_search_input_border_radius);border:var(--_ui5-search-border);box-shadow:none;background:var(--_ui5-search-elements-background);color:var(--sapShell_InteractiveTextColor)}.ui5-search-field-scope-button::part(button):before,.ui5-search-field-scope-button::part(button):after{display:none}.ui5-search-field-scope-button:hover{box-shadow:var(--_ui5-search_input_scope_hover_shadow);background-color:var(--sapShell_Hover_Background)}.ui5-search-field-scope-button:focus-within{box-shadow:var(--_ui5-search_input_scope_active_shadow);background:var(--sapShell_Active_Background);color:var(--sapShell_Active_TextColor)}.ui5-search-field-scope-popover{min-width:12rem}.ui5-search-field-scope-popover::part(content){padding:0}.ui5-search-field-scope-popover [ui5-list]{border:none}.ui5-search-field-scope-popover [ui5-li-standard][selected]{background-color:var(--sapList_SelectionBackgroundColor)}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var SearchField_1;
    const SCREEN_WIDTH_BREAKPOINT = 450;
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
             * Indicates whether a loading indicator should be shown in the input field.
             * @default false
             * @since 2.19.0
             * @public
             */
            this.fieldLoading = false;
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
            /**
             * Indicates whether the component renders on a small screen (mobile).
             * @private
             */
            this._isMobileView = false;
            /**
             * Indicates whether the scope selection popover is open on mobile.
             * @private
             */
            this._scopePopoverOpen = false;
        }
        onEnterDOM() {
            this._resizeHandler = this._handleResize.bind(this);
            window.addEventListener("resize", this._resizeHandler);
            this._isMobileView = this._isSmallScreen();
        }
        onExitDOM() {
            if (this._resizeHandler) {
                window.removeEventListener("resize", this._resizeHandler);
            }
        }
        onBeforeRendering() {
            this._effectiveShowClearIcon = (this.showClearIcon && !!this.value);
        }
        _isSmallScreen() {
            return ManagedStyles.d() || window.innerWidth < SCREEN_WIDTH_BREAKPOINT;
        }
        _handleResize() {
            const newMobileView = this._isSmallScreen();
            if (this._isMobileView !== newMobileView) {
                this._isMobileView = newMobileView;
                // Close popover when switching modes to prevent state issues
                if (this._scopePopoverOpen) {
                    this._scopePopoverOpen = false;
                }
            }
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
            // Set the scopeValue property if the selected scope has a value defined
            if (item.value) {
                this.scopeValue = item.value;
            }
            this.fireDecoratorEvent("scope-change", {
                scope: item.scopeOption,
            });
        }
        _handleScopeIconPress() {
            if (!this.scopes?.length) {
                return;
            }
            this._scopePopoverOpen = !this._scopePopoverOpen;
        }
        _handleScopePopoverClose() {
            this._scopePopoverOpen = false;
        }
        _handleScopeItemClick(e) {
            const listItem = e.detail.item;
            if (!listItem) {
                return;
            }
            const scopeValue = listItem.getAttribute("data-scope-value");
            const scopeItem = this.scopes.find((scope) => scope.value === scopeValue);
            if (scopeItem) {
                this.scopeValue = scopeItem.value;
                this.fireDecoratorEvent("scope-change", {
                    scope: scopeItem,
                });
            }
            this._scopePopoverOpen = false;
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
                placeholderWithScope: SearchField_1.i18nBundle.getText(i18nDefaults$1.SEARCH_FIELD_PLACEHOLDER_WITH_SCOPE),
            };
        }
        get _effectivePlaceholder() {
            // If scopes exist and no user-defined placeholder, show "Search in: {SCOPE}"
            if (this.scopes?.length && !this.placeholder && this.scopeValue) {
                const selectedScope = this.scopes.find((scope) => scope.value === this.scopeValue);
                if (selectedScope?.text) {
                    return String(SearchField_1.i18nBundle.getText(i18nDefaults$1.SEARCH_FIELD_PLACEHOLDER_WITH_SCOPE, String(selectedScope.text)));
                }
            }
            return this.placeholder;
        }
        get _scopeIconAccessibleName() {
            const selectedScope = this.scopes.find((scope) => scope.value === this.scopeValue);
            return selectedScope
                ? `${this._translations.scope}, ${selectedScope.text}`
                : this._translations.scope;
        }
        get _effectiveIconTooltip() {
            return this._translations.searchIcon;
        }
        captureRef(ref) {
            if (ref) {
                ref.scopeOption = this;
            }
        }
        captureScopeIconRef(ref) {
            if (ref) {
                this._scopeIconButton = ref;
            }
        }
    };
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "fieldLoading", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "showClearIcon", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "collapsed", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], SearchField.prototype, "value", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], SearchField.prototype, "placeholder", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], SearchField.prototype, "accessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], SearchField.prototype, "accessibleDescription", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], SearchField.prototype, "scopeValue", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: HTMLElement, individualSlots: true, invalidateOnChildChange: true })
    ], SearchField.prototype, "scopes", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], SearchField.prototype, "filterButton", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "focusedInnerInput", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "_effectiveShowClearIcon", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "_isMobileView", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SearchField.prototype, "_scopePopoverOpen", void 0);
    __decorate$1([
        parametersBundle_css$1.i("@ui5/webcomponents-fiori")
    ], SearchField, "i18nBundle", void 0);
    SearchField = SearchField_1 = __decorate$1([
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

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
     * @csspart popover - Used to style the suggestions popup
     * @since 2.24.0
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
            this._openChangedInternally = false;
            this._lastOpenState = this.open;
            this._deleteHandler = this._onItemDelete.bind(this);
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            if (this.collapsed && !ManagedStyles.d()) {
                this.open = false;
                this._lastOpenState = false;
                this._openChangedInternally = false;
                return;
            }
            const innerInput = this.nativeInput;
            const autoCompletedChars = innerInput && (innerInput.selectionEnd - innerInput.selectionStart);
            // The public `open` property is application-controlled and takes higher
            // precedence. Internal writes go through `_setInternalOpen`, which raises
            // `_openChangedInternally`. A change is treated as application-driven only
            // when that flag is not set AND `open` differs from the last committed
            // state; that distinguishes an app write from a plain re-render (e.g. when
            // lazy-loaded items arrive) where the internal auto-open logic must still run.
            const appControlledOpen = !this._openChangedInternally && this.open !== this._lastOpenState;
            if (!appControlledOpen) {
                this.open = this.open || (this._popoupHasAnyContent() && this._isTyping && innerInput.value.length > 0);
            }
            else if (!this.open) {
                // The application force-closed the picker; reset the typing state so the
                // internal auto-open logic does not immediately reopen it on next render.
                this._isTyping = false;
            }
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
            if (ManagedStyles.d() && this.open) {
                const item = this._getFirstMatchingItem(this.value);
                this._proposedItem = item;
                if (item && this._performItemSelectionOnMobile) {
                    this._selectMatchingItem(item);
                }
            }
            // Update highlight text and attach delete listeners
            this._flattenItems.forEach(item => {
                item.highlightText = this._typedInValue;
                // Listen for delete events on each item
                // Using capture phase to ensure we catch it before application handlers
                item.removeEventListener("ui5-delete", this._deleteHandler, true);
                item.addEventListener("ui5-delete", this._deleteHandler, true);
            });
            // Commit the resolved open state and clear the internal-change flag so the
            // next reconciliation can tell an application-driven change to `open` apart
            // from a re-render where `open` was not touched.
            this._lastOpenState = this.open;
            this._openChangedInternally = false;
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
            return Input.StartsWith(str, this._flattenItems.filter(item => !this._isGroupItem(item) && !this._isShowMoreItem(item)), "text");
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
            // Store the original value before navigation starts
            if (this._valueBeforeArrowNav === undefined) {
                this._valueBeforeArrowNav = this._typedInValue || this.value;
            }
            this._deselectItems();
            this.value = this._typedInValue || this.value;
            this._innerValue = this.value;
            // Clear any text selection to allow autocomplete to work again when navigating back
            const innerInput = this.nativeInput;
            if (innerInput) {
                innerInput.setSelectionRange(this.value.length, this.value.length);
            }
            firstListItem?.focus();
        }
        /**
         * Sets the `open` property from internal control logic and flags the change
         * as internally driven, so reconciliation can distinguish it from an
         * application-driven change to `open`.
         * @private
         */
        _setInternalOpen(value) {
            // Only flag the change when `open` actually changes. A no-op assignment
            // does not invalidate the component (see UI5Element property setter), so
            // no reconciliation would run to clear the flag - leaving it stale and
            // causing a later application-driven change to be misread as internal.
            if (value === this.open) {
                return;
            }
            this._openChangedInternally = true;
            this.open = value;
        }
        _handleInnerClick() {
            if (ManagedStyles.d()) {
                this._setInternalOpen(true);
            }
        }
        _handleSearchIconPress() {
            if (ManagedStyles.d()) {
                this._setInternalOpen(true);
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
            this._closePopupAndResetState();
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
        _closePopupAndResetState() {
            this._setInternalOpen(false);
            this._isTyping = false;
            this._valueBeforeArrowNav = undefined;
        }
        _handleEscape() {
            // If arrow navigation was active, restore the original typed value
            if (this._valueBeforeArrowNav !== undefined) {
                this.value = this._valueBeforeArrowNav;
                this._innerValue = this._valueBeforeArrowNav;
                this._valueBeforeArrowNav = undefined;
            }
            else {
                this.value = this._typedInValue || this.value;
                this._innerValue = this.value;
            }
            this._isTyping = false;
        }
        _handleInput(e) {
            super._handleInput(e);
            this._typedInValue = this.value;
            this._proposedItem = undefined;
            this._valueBeforeArrowNav = undefined;
            if (ManagedStyles.d()) {
                return;
            }
            this._isTyping = true;
            this._setInternalOpen(this.value.length > 0 && this._popoupHasAnyContent());
        }
        _handleClear() {
            super._handleClear();
            this._typedInValue = "";
            this._innerValue = "";
            this._shouldAutocomplete = false;
            this._valueBeforeArrowNav = undefined;
            this._setInternalOpen(false);
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
                // Restore original value when navigating back to input
                if (this._valueBeforeArrowNav !== undefined) {
                    this.value = this._valueBeforeArrowNav;
                    this._innerValue = this._valueBeforeArrowNav;
                    this._valueBeforeArrowNav = undefined;
                }
                this.nativeInput?.focus();
                this._shouldAutocomplete = true;
            }
            if (webcomponentsBase.m$1(e)) {
                this._handleEscape();
            }
            if ((isLastItem && isArrowDown) || isTab) {
                this._getFooterButton()?.focus();
            }
        }
        _onListItemFocusIn(e) {
            // Update input value when an item gets focus during arrow navigation
            if (this._valueBeforeArrowNav === undefined) {
                return;
            }
            const target = e.target;
            const item = target;
            // Don't update input value when focus is on action buttons or delete button
            if (target.hasAttribute("ui5-button") || target.hasAttribute("ui5-icon")) {
                return;
            }
            if (item && item.text && !this._isShowMoreItem(item)) {
                this.value = item.text;
                this._innerValue = item.text;
            }
        }
        _onItemClick(e) {
            const item = e.detail.item;
            const prevented = !this.fireDecoratorEvent("search", { item });
            if (prevented) {
                return;
            }
            this.value = item.text;
            this._innerValue = this.value;
            this._typedInValue = this.value;
            this._shouldAutocomplete = false;
            this._performTextSelection = true;
            this._valueBeforeArrowNav = undefined;
            this._setInternalOpen(false);
            this._isTyping = false;
            this.focus();
        }
        _onItemDelete(e) {
            // If we're in arrow navigation mode and an item was deleted,
            // update the input to show the next matching item
            if (this._valueBeforeArrowNav !== undefined) {
                const deletedItem = e.target;
                // Wait for the item to be removed from DOM
                setTimeout(() => {
                    const nextItem = this._getFirstMatchingItem(this._valueBeforeArrowNav);
                    if (nextItem && nextItem !== deletedItem) {
                        this.value = nextItem.text;
                        this._innerValue = nextItem.text;
                        this._selectMatchingItem(nextItem);
                        nextItem.focus();
                    }
                    else {
                        // No more matching items, restore original typed value
                        this.value = this._valueBeforeArrowNav;
                        this._innerValue = this._valueBeforeArrowNav;
                        this._deselectItems();
                        this.nativeInput?.focus();
                    }
                }, 0);
            }
        }
        _onkeydown(e) {
            super._onkeydown(e);
            if (this.loading) {
                return;
            }
            this._shouldAutocomplete = !this.noTypeahead
                && !(webcomponentsBase.Q(e) || webcomponentsBase.X(e) || webcomponentsBase.m$1(e) || webcomponentsBase.P(e) || webcomponentsBase._(e) || webcomponentsBase.x(e) || webcomponentsBase.b$1(e) || webcomponentsBase.j(e) || webcomponentsBase.q(e) || webcomponentsBase.M(e) || webcomponentsBase.n(e) || webcomponentsBase.m$1(e));
            if (webcomponentsBase._(e)) {
                this._handleDown(e);
            }
            if (webcomponentsBase.m$1(e)) {
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
            this._setInternalOpen(false);
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
            this._setInternalOpen(false);
            this._isTyping = false;
            this._valueBeforeArrowNav = undefined;
            this.fireDecoratorEvent("close");
        }
        _handleBeforeOpen() {
            this._valueBeforeOpen = this.value;
            if (ManagedStyles.d() && this.mobileInput) {
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
            return this.shadowRoot.querySelector("#ui5-search-list");
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
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Search.prototype, "loading", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Search.prototype, "noTypeahead", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            "default": true,
            invalidateOnChildChange: true,
        })
    ], Search.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.d()
    ], Search.prototype, "action", void 0);
    __decorate([
        webcomponentsBase.d()
    ], Search.prototype, "illustration", void 0);
    __decorate([
        webcomponentsBase.d()
    ], Search.prototype, "messageArea", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Search.prototype, "open", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Search.prototype, "_innerValue", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Search.prototype, "_performItemSelectionOnMobile", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents-fiori")
    ], Search, "i18nBundle", void 0);
    Search = Search_1 = __decorate([
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

    exports.Search = Search$1;
    exports.SearchFieldTemplate = SearchFieldTemplate;
    exports.SearchPopoverTemplate = SearchPopoverTemplate;

}));
