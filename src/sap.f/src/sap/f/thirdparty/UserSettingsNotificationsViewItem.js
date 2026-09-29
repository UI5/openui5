sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/ListItemCustom', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/UserSettingsView.css', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/edit', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/ValueState'], (function (exports, webcomponentsBase, parametersBundle_css, ListItemCustom, eventStrict, parametersBundle_css$1, AccessibilityTextsHelper, ManagedStyles, ListItemTemplate, decline, Icons, i18nDefaults, Icon, parametersBundle_css$2, UserSettingsView_css, ListItemBase, edit, Button, willShowContent, toLowercaseEnumValue, Label, ValueState) { 'use strict';

    const name$1 = "less";
    const pathData$1 = "M14.5 7c.333 0 .5.167.5.5v1c0 .333-.167.5-.5.5h-13a.503.503 0 0 1-.344-.14A.462.462 0 0 1 1 8.5v-1c0-.146.052-.266.156-.36A.503.503 0 0 1 1.5 7h13Z";
    const ltr$1 = false;
    const viewBox$1 = "0 0 16 16";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

    const name = "less";
    const pathData = "M14.25 7a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5h12.5Z";
    const ltr = false;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, viewBox, collection, packageName });

    /**
     * Different types of Switch designs.
     * @public
     */
    var SwitchDesign;
    (function (SwitchDesign) {
        /**
         * Defines the Switch as Textual
         * @public
         */
        SwitchDesign["Textual"] = "Textual";
        /**
         * Defines the Switch as Graphical
         * @public
         */
        SwitchDesign["Graphical"] = "Graphical";
    })(SwitchDesign || (SwitchDesign = {}));
    var SwitchDesign$1 = SwitchDesign;

    function SwitchTemplate() {
        return (parametersBundle_css.jsxs("div", { class: {
                "ui5-switch-root": true,
                "ui5-switch--desktop": ManagedStyles.f$1(),
                "ui5-switch--disabled": this.disabled,
                "ui5-switch--checked": this.checked,
                "ui5-switch--semantic": this.graphical,
                "ui5-switch--no-label": !(this.graphical || this.textOn || this.textOff),
                "ui5-switch--safari": ManagedStyles.h(),
            }, role: "switch", "aria-label": this.ariaLabelText, "aria-checked": this.checked, "aria-disabled": this.effectiveAriaDisabled, "aria-readonly": this.effectiveAriaReadonly, "aria-required": this.required, "aria-describedby": this.ariaDescribedBy, onClick: this._onclick, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onFocusIn: this._onfocusin, tabindex: this.effectiveTabIndex, title: this.tooltip, children: [parametersBundle_css.jsx("div", { class: "ui5-switch-inner", children: parametersBundle_css.jsx("div", { class: "ui5-switch-track", part: "slider", children: parametersBundle_css.jsxs("div", { class: "ui5-switch-slider", children: [this.graphical ?
                                    parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { class: "ui5-switch-text ui5-switch-text--on", children: parametersBundle_css.jsx(Icon.Icon, { name: ListItemTemplate.acceptIcon, class: "ui5-switch-icon-on" }) }), parametersBundle_css.jsx("span", { class: "ui5-switch-text ui5-switch-text--off", children: parametersBundle_css.jsx(Icon.Icon, { name: decline.declineIcon, class: "ui5-switch-icon-off" }) })] })
                                    :
                                        parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.hasNoLabel ?
                                                parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { class: "ui5-switch-text ui5-switch-text--on ui5-switch-no-label-icon", part: "text-on", children: parametersBundle_css.jsx(Icon.Icon, { name: this.sapNextIcon, class: "ui5-switch-no-label-icon-on" }) }), parametersBundle_css.jsx("span", { class: "ui5-switch-text ui5-switch-text--off ui5-switch-no-label-icon", part: "text-off", children: parametersBundle_css.jsx(Icon.Icon, { name: this.sapNextIcon, class: "ui5-switch-no-label-icon-off" }) })] })
                                                :
                                                    parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { class: "ui5-switch-text ui5-switch-text--on", part: "text-on", "aria-hidden": this._textAriaHidden, children: this._textOn }), parametersBundle_css.jsx("span", { class: "ui5-switch-text ui5-switch-text--off", part: "text-off", "aria-hidden": this._textAriaHidden, children: this._textOff })] }) }), this.readonly && parametersBundle_css.jsx("span", { class: "ui5-switch-text ui5-switch-text--readonly", id: this.ariaDescribedBy, "aria-hidden": this._textAriaHidden, children: this.ariaDescribedByText }), parametersBundle_css.jsx("span", { class: "ui5-switch-handle", part: "handle" })] }) }) }), parametersBundle_css.jsx("input", { type: 'checkbox', checked: this.checked, class: "ui5-switch-input", "data-sap-no-tab-ref": true })] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var switchCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host{vertical-align:middle}:host(:not([hidden])){display:inline-block}.ui5-switch-root{position:relative;display:flex;align-items:center;width:var(--_ui5_switch_width);height:var(--_ui5_switch_height);min-width:var(--_ui5_switch_min_width);cursor:pointer;outline:none;border-radius:var(--_ui5-switch-root-border-radius)}.ui5-switch-root:not(.ui5-switch--no-label):not(.ui5-switch--semantic){width:var(--_ui5_switch_with_label_width);height:var(--_ui5_switch_height)}.ui5-switch-root.ui5-switch--no-label{min-width:var(--_ui5_switch_width)}.ui5-switch-inner{display:flex;align-items:center;justify-content:center;height:100%;width:100%;min-width:inherit;overflow:hidden;pointer-events:none;will-change:transform}:host([checked]) .ui5-switch-inner{border-radius:6.25rem;box-shadow:var(--_ui5-switch-root-box-shadow)}.ui5-switch-track{display:flex;align-items:center;height:var(--_ui5_switch_track_height);width:var(--_ui5_switch_track_width);border:var(--_ui5-switch-track-border);border-radius:var(--_ui5_switch_track_border_radius);box-sizing:border-box;transition:var(--_ui5_switch_track_transition)}.ui5-switch-root:not(.ui5-switch--no-label):not(.ui5-switch--semantic) .ui5-switch-track{height:var(--_ui5_switch_track_with_label_height);width:var(--_ui5_switch_track_with_label_width)}.ui5-switch-slider{position:relative;height:var(--_ui5_switch_height);width:100%;transition:transform .1s ease-in;transform-origin:top left}.ui5-switch-slider>*:not(.ui5-switch-handle){display:var(--_ui5-switch-slider-texts-display)}.ui5-switch-handle{position:absolute;display:flex;justify-content:center;align-items:center;width:var(--_ui5_switch_handle_width);height:var(--_ui5_switch_handle_height);border:var(--_ui5_switch_handle_border);border-radius:var(--_ui5_switch_handle_border_radius);box-sizing:border-box}.ui5-switch-root:not(.ui5-switch--no-label):not(.ui5-switch--semantic) .ui5-switch-handle{height:var(--_ui5_switch_handle_with_label_height);width:var(--_ui5_switch_handle_with_label_width)}.ui5-switch-text{display:flex;justify-content:center;position:absolute;z-index:var(--_ui5_switch_text_z_index);min-width:var(--_ui5_switch_text_min_width);font-size:var(--_ui5_switch_text_font_size);font-family:var(--_ui5-switch-text_font_family);text-transform:uppercase;text-align:center;white-space:nowrap;user-select:none;-webkit-user-select:none}.ui5-switch-handle,.ui5-switch-text{inset-inline-start:var(--_ui5_switch_handle_left);top:50%;transform:translateY(-50%)}.ui5-switch-root:focus-visible:after,.ui5-switch--desktop.ui5-switch-root:focus-within:after{content:"";position:absolute;inset-inline-start:var(--_ui5_switch_root_outline_left);inset-inline-end:var(--_ui5_switch_root_outline_right);top:var(--_ui5_switch_root_outline_top);bottom:var(--_ui5_switch_root_outline_bottom);border:var(--_ui5_switch_focus_outline);border-radius:var(--_ui5_switch_root_after_boreder_radius);pointer-events:none;transition:var(--_ui5_switch_track_transition);outline:var(--_ui5_switch_root_after_outline)}.ui5-switch-root .ui5-switch-input{position:absolute;inset-inline-start:0;width:0;height:0;margin:0;visibility:hidden;appearance:none;-webkit-appearance:none}.ui5-switch-root.ui5-switch--disabled{opacity:var(--_ui5_switch_disabled_opacity);cursor:default}.ui5-switch-root.ui5-switch--checked .ui5-switch-text--off,.ui5-switch-root.ui5-switch--checked .ui5-switch-text--readonly{visibility:var(--_ui5_switch_text_hidden)}.ui5-switch-root:not(.ui5-switch--checked) .ui5-switch-text--on,.ui5-switch-root:not(.ui5-switch--checked) .ui5-switch-text--readonly{visibility:var(--_ui5_switch_text_hidden)}.ui5-switch-root.ui5-switch--checked.ui5-switch--semantic .ui5-switch-text--on,.ui5-switch-root.ui5-switch--checked.ui5-switch--desktop.ui5-switch--no-label .ui5-switch-text--on{inset-inline-start:var(--_ui5_switch_text_active_left)}.ui5-switch-root:not(.ui5-switch--checked).ui5-switch--semantic .ui5-switch-text--off,.ui5-switch-root:not(.ui5-switch--checked).ui5-switch--desktop.ui5-switch--no-label .ui5-switch-text--off{inset-inline-start:var(--_ui5_switch_text_inactive_left);inset-inline-end:var(--_ui5_switch_text_inactive_right)}.ui5-switch-root.ui5-switch--checked .ui5-switch-handle{background:var(--_ui5_switch_handle_active_background_color);border-color:var(--_ui5_switch_handle_active_border_color)}.ui5-switch-root:not(.ui5-switch--checked) .ui5-switch-handle{background:var(--_ui5_switch_handle_inactive_background_color);border-color:var(--_ui5_switch_handle_inactive_border_color)}.ui5-switch--desktop.ui5-switch-root.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-handle{background:var(--_ui5_switch_handle_hover_active_background_color);border-color:var(--_ui5_switch_handle_hover_active_border_color)}.ui5-switch--desktop.ui5-switch-root:not(.ui5-switch--disabled):not(.ui5-switch--checked):hover .ui5-switch-handle{background:var(--_ui5_switch_handle_hover_inactive_background_color);border-color:var(--_ui5_switch_handle_hover_inactive_border_color)}.ui5-switch-root.ui5-switch--semantic.ui5-switch--checked .ui5-switch-handle{background:var(--_ui5_switch_handle_semantic_accept_background_color);border-color:var(--_ui5_switch_handle_semantic_accept_border_color)}.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--checked) .ui5-switch-handle{background:var(--_ui5_switch_handle_semantic_reject_background_color);border-color:var(--_ui5_switch_handle_semantic_reject_border_color)}.ui5-switch--desktop.ui5-switch-root.ui5-switch--semantic.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-handle{background:var(--_ui5_switch_handle_semantic_hover_accept_background_color);border-color:var(--_ui5_switch_handle_semantic_hover_accept_border_color)}.ui5-switch--desktop.ui5-switch--semantic.ui5-switch-root:not(.ui5-switch--checked):not(.ui5-switch--disabled):hover .ui5-switch-handle{background:var(--_ui5_switch_handle_semantic_hover_reject_background_color);border-color:var(--_ui5_switch_handle_semantic_hover_reject_border_color)}.ui5-switch-root.ui5-switch--checked .ui5-switch-track{background:var(--_ui5_switch_track_active_background_color);border-color:var(--_ui5_switch_track_active_border_color)}.ui5-switch-root:not(.ui5-switch--checked) .ui5-switch-track{background:var(--_ui5_switch_track_inactive_background_color);border-color:var(--_ui5_switch_track_inactive_border_color)}.ui5-switch--desktop.ui5-switch-root.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-track{background:var(--_ui5_switch_track_hover_active_background_color);border-color:var(--_ui5_switch_track_hover_active_border_color)}.ui5-switch--desktop.ui5-switch-root:not(.ui5-switch--checked):not(.ui5-switch--disabled):hover .ui5-switch-track{background:var(--_ui5_switch_track_hover_inactive_background_color);border-color:var(--_ui5_switch_track_hover_inactive_border_color)}.ui5-switch-root.ui5-switch--semantic.ui5-switch--checked .ui5-switch-track{background:var(--_ui5_switch_track_semantic_accept_background_color);border-color:var(--_ui5_switch_track_semantic_accept_border_color)}.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--checked) .ui5-switch-track{background:var(--_ui5_switch_track_semantic_reject_background_color);border-color:var(--_ui5_switch_track_semantic_reject_border_color)}.ui5-switch--desktop.ui5-switch-root.ui5-switch--semantic.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-track{background:var(--_ui5_switch_track_semantic_hover_accept_background_color);border-color:var(--_ui5_switch_track_semantic_hover_accept_border_color)}.ui5-switch--desktop.ui5-switch--semantic.ui5-switch-root:not(.ui5-switch--checked):not(.ui5-switch--disabled):hover .ui5-switch-track{background:var(--_ui5_switch_track_semantic_hover_reject_background_color);border-color:var(--_ui5_switch_track_semantic_hover_reject_border_color)}.ui5-switch-root.ui5-switch--checked:not(.ui5-switch--no-label):not(.ui5-switch--semantic) .ui5-switch-slider{transform:var(--_ui5_switch_transform_with_label)}.ui5-switch-root.ui5-switch--checked .ui5-switch-slider{transform:var(--_ui5_switch_transform)}.ui5-switch-text .ui5-switch-text--on .ui5-switch-no-label-icon,.ui5-switch-root.ui5-switch--semantic .ui5-switch-text,.ui5-switch-root.ui5-switch--no-label .ui5-switch-text{display:flex;justify-content:center}.ui5-switch--no-label .ui5-switch-no-label-icon-on,.ui5-switch--no-label .ui5-switch-no-label-icon-off{width:var(--_ui5_switch_icon_width);height:var(--_ui5_switch_icon_height);display:var(--_ui5_switch_track_icon_display)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-on,.ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-off{width:var(--_ui5_switch_icon_width);height:var(--_ui5_switch_icon_height)}.ui5-switch-root .ui5-switch-text{font-family:var(--_ui5_switch_text_font_family);font-size:var(--_ui5_switch_text_font_size);width:var(--_ui5_switch_text_width)}.ui5-switch-root:not(.ui5-switch--no-label):not(.ui5-switch--semantic) .ui5-switch-text{font-family:var(--_ui5_switch_text_with_label_font_family);font-size:var(--_ui5_switch_text_with_label_font_size);width:var(--_ui5_switch_text_with_label_width)}:host([active]) .ui5-switch--desktop.ui5-switch-root:not(.ui5-switch--disabled) .ui5-switch-track{background:var(--_ui5-switch_track-off-active-background)}:host([active]) .ui5-switch--desktop.ui5-switch-root.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-track{background:var(--_ui5-switch_track-on-active-background)}.ui5-switch--desktop.ui5-switch-root:not(.ui5-switch--disabled):hover .ui5-switch-handle{box-shadow:var(--_ui5_switch_handle_off_hover_box_shadow)}.ui5-switch--desktop.ui5-switch-root.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-handle{box-shadow:var(--_ui5_switch_handle_on_hover_box_shadow)}.ui5-switch--desktop.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--disabled):hover .ui5-switch-handle{box-shadow:var(--_ui5_switch_handle_semantic_off_hover_box_shadow)}.ui5-switch--desktop.ui5-switch-root.ui5-switch--semantic.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-handle{box-shadow:var(--_ui5_switch_handle_semantic_on_hover_box_shadow)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-on,.ui5-switch-root.ui5-switch--semantic .ui5-switch-text--on{color:var(--_ui5_switch_text_semantic_accept_color)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-off,.ui5-switch-root.ui5-switch--semantic .ui5-switch-text--off{color:var(--_ui5_switch_text_semantic_reject_color)}.ui5-switch-root .ui5-switch-text--on{color:var(--_ui5_switch_text_active_color);overflow:var(--_ui5_switch_text_overflow);text-overflow:ellipsis;inset-inline-start:var(--_ui5_switch_text_active_left_alternate)}.ui5-switch-root .ui5-switch-text--off{color:var(--_ui5_switch_text_inactive_color);overflow:var(--_ui5_switch_text_overflow);text-overflow:ellipsis;inset-inline-start:var(--_ui5_switch_text_inactive_left_alternate);inset-inline-end:var(--_ui5_switch_text_inactive_right_alternate)}.ui5-switch-root.ui5-switch--safari .ui5-switch-text--on.ui5-switch-no-label-icon,.ui5-switch-root.ui5-switch--safari .ui5-switch-text--off.ui5-switch-no-label-icon{inset-inline-start:.1875rem}.ui5-switch-root .ui5-switch-no-label-icon-on,.ui5-switch-root .ui5-switch-icon-on{color:var(--_ui5_switch_text_active_color)}.ui5-switch-root .ui5-switch-no-label-icon-off,.ui5-switch-root .ui5-switch-icon-off{color:var(--_ui5_switch_text_inactive_color)}:dir(rtl).ui5-switch-root.ui5-switch--checked:not(.ui5-switch--no-label):not(.ui5-switch--semantic) .ui5-switch-slider{transform:var(--_ui5_switch_rtl_transform_with_label)}:dir(rtl).ui5-switch-root.ui5-switch--checked .ui5-switch-slider{transform:var(--_ui5_switch_rtl_transform)}:host([readonly]) .ui5-switch-root{cursor:default}:host([readonly]) .ui5-switch-track,:host([readonly]) .ui5-switch-root.ui5-switch--semantic .ui5-switch-track{background:var(--sapField_ReadOnly_Background);border:.0625rem var(--_ui5_switch_readonly_track_border_style) var(--sapField_ReadOnly_BorderColor)}:host([readonly]) .ui5-switch-handle,:host([readonly]) .ui5-switch-root.ui5-switch--semantic .ui5-switch-handle{background:var(--sapField_ReadOnly_Background);border:.0625rem var(--_ui5_switch_readonly_handle_border_style) var(--sapField_ReadOnly_BorderColor)}:host([readonly]) .ui5-switch-text--on,:host([readonly]) .ui5-switch-text--off,:host([readonly]) .ui5-switch-no-label-icon-on,:host([readonly]) .ui5-switch-no-label-icon-off,:host([readonly]) .ui5-switch-icon-on,:host([readonly]) .ui5-switch-icon-off,:host([readonly]) .ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-on,:host([readonly]) .ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-off,:host([readonly]) .ui5-switch-root.ui5-switch--semantic .ui5-switch-text--on,:host([readonly]) .ui5-switch-root.ui5-switch--semantic .ui5-switch-text--off{color:var(--sapButton_Handle_TextColor)}:host([readonly]) .ui5-switch--desktop.ui5-switch-root:hover .ui5-switch-handle,:host([readonly]) .ui5-switch--desktop.ui5-switch-root.ui5-switch--checked:hover .ui5-switch-handle,:host([readonly]) .ui5-switch--desktop.ui5-switch-root.ui5-switch--semantic:hover .ui5-switch-handle,:host([readonly]) .ui5-switch--desktop.ui5-switch-root.ui5-switch--semantic.ui5-switch--checked:hover .ui5-switch-handle{box-shadow:none}:host([readonly]) .ui5-switch--desktop.ui5-switch-root:hover .ui5-switch-track,:host([readonly]) .ui5-switch--desktop.ui5-switch-root:hover .ui5-switch-handle,:host([readonly]) .ui5-switch--desktop.ui5-switch-root.ui5-switch--semantic:hover .ui5-switch-track,:host([readonly]) .ui5-switch--desktop.ui5-switch-root.ui5-switch--semantic:hover .ui5-switch-handle{background:var(--sapField_ReadOnly_Background);border-color:var(--sapField_ReadOnly_BorderColor)}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Switch_1;
    /**
     * @class
     *
     * ### Overview
     * The `ui5-switch` component is used for changing between binary states.
     *
     * The component can display texts, that will be switched, based on the component state, via the `textOn` and `textOff` properties,
     * but texts longer than 3 letters will be cutted off.
     *
     * However, users are able to customize the width of `ui5-switch` with pure CSS (`<ui5-switch style="width: 200px">`), and set widths, depending on the texts they would use.
     *
     * Note: the component would not automatically stretch to fit the whole text width.
     *
     * ### Keyboard Handling
     * The state can be changed by pressing the Space and Enter keys.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Switch";`
     * @constructor
     * @extends UI5Element
     * @public
     * @since 0.8.0
     * @csspart slider - Used to style the track, where the handle is being slid
     * @csspart text-on - Used to style the `textOn` property text
     * @csspart text-off - Used to style the `textOff` property text
     * @csspart handle - Used to style the handle of the switch
     */
    let Switch = Switch_1 = class Switch extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines the component design.
             *
             * **Note:** If `Graphical` type is set,
             * positive and negative icons will replace the `textOn` and `textOff`.
             * @public
             * @default "Textual"
             */
            this.design = "Textual";
            /**
             * Defines whether the component is in readonly state.
             *
             * **Note:** A readonly switch cannot be toggled by user interaction,
             * but can still be focused and its value read programmatically.
             * @default false
             * @public
             * @since 2.21.0
             */
            this.readonly = false;
            /**
             * Defines if the component is checked.
             *
             * **Note:** The property can be changed with user interaction,
             * either by clicking the component, or by pressing the `Enter` or `Space` key.
             * @default false
             * @formEvents change
             * @formProperty
             * @public
             */
            this.checked = false;
            /**
             * Defines whether the component is disabled.
             *
             * **Note:** A disabled component is noninteractive.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * Defines whether the component is required.
             * @default false
             * @public
             * @since 1.16.0
             */
            this.required = false;
            /**
             * Defines the form value of the component.
             * @default ""
             * @since 2.12.0
             * @public
             */
            this.value = "";
            this._cancelAction = false;
            this._isSpacePressed = false;
        }
        get formValidityMessage() {
            return Switch_1.i18nBundle.getText(i18nDefaults.FORM_CHECKABLE_REQUIRED);
        }
        get formValidity() {
            return { valueMissing: this.required && !this.checked };
        }
        async formElementAnchor() {
            return this.getFocusDomRefAsync();
        }
        get formFormattedValue() {
            if (this.checked) {
                return this.value || "on";
            }
            return null;
        }
        get sapNextIcon() {
            return this.checked ? "accept" : "less";
        }
        _onfocusin() {
            // Reset keyboard state on focus to prevent stale state from previous interactions
            this._cancelAction = false;
            this._isSpacePressed = false;
        }
        _onclick() {
            if (this.readonly) {
                return;
            }
            this.toggle();
        }
        _onkeydown(e) {
            if (webcomponentsBase.A(e)) {
                e.preventDefault();
            }
            if (this.readonly) {
                return;
            }
            if (webcomponentsBase.A(e)) {
                this._isSpacePressed = true;
            }
            else if (webcomponentsBase.Ko(e) || webcomponentsBase.m$1(e)) {
                this._cancelAction = true;
            }
            if (webcomponentsBase.b$1(e)) {
                this._onclick();
            }
        }
        _onkeyup(e) {
            if (this.readonly) {
                return;
            }
            const isSpaceKey = webcomponentsBase.A(e);
            const isCancelKey = webcomponentsBase.Ko(e) || webcomponentsBase.m$1(e);
            if (isSpaceKey || webcomponentsBase.K(e)) {
                if (this._cancelAction) {
                    this._cancelAction = false;
                    this._isSpacePressed = false;
                    e.preventDefault();
                    return;
                }
                this._isSpacePressed = false;
            }
            else if (isCancelKey && !this._isSpacePressed) {
                this._cancelAction = false;
            }
            if (isSpaceKey) {
                this._onclick();
            }
        }
        toggle() {
            if (!this.disabled && !this.readonly) {
                this.checked = !this.checked;
                const changePrevented = !this.fireDecoratorEvent("change");
                // Angular two way data binding;
                const valueChangePrevented = !this.fireDecoratorEvent("value-changed");
                if (changePrevented || valueChangePrevented) {
                    this.checked = !this.checked;
                }
            }
        }
        get graphical() {
            return this.design === SwitchDesign$1.Graphical;
        }
        get hasNoLabel() {
            return !(this.graphical || this.textOn || this.textOff);
        }
        get _textOn() {
            return this.graphical ? "" : this.textOn;
        }
        get _textOff() {
            return this.graphical ? "" : this.textOff;
        }
        /**
         * Determines if custom on/off texts duplicate the default role announcement.
         * When textOn/textOff match the localized "On"/"Off" strings (case-insensitive),
         * they duplicate what role="switch" with aria-checked already announces,
         * so they should be aria-hidden to avoid duplicate screen reader announcements.
         */
        get _textAriaHidden() {
            const on = this.textOn?.toLowerCase();
            const off = this.textOff?.toLowerCase();
            const i18nOn = Switch_1.i18nBundle.getText(i18nDefaults.SWITCH_ON).toLowerCase();
            const i18nOff = Switch_1.i18nBundle.getText(i18nDefaults.SWITCH_OFF).toLowerCase();
            return (on === i18nOn && off === i18nOff) || undefined;
        }
        get effectiveTabIndex() {
            return this.disabled ? undefined : 0;
        }
        get effectiveAriaReadonly() {
            return this.readonly ? "true" : undefined;
        }
        get effectiveAriaDisabled() {
            return this.disabled ? "true" : undefined;
        }
        get ariaLabelText() {
            return AccessibilityTextsHelper.A(this) || AccessibilityTextsHelper.M(this) || undefined;
        }
        get ariaDescribedBy() {
            return this.readonly ? `${this._id}-readonly-desc` : undefined;
        }
        get ariaDescribedByText() {
            return this.readonly ? Switch_1.i18nBundle.getText(i18nDefaults.ACC_STATE_READONLY) : "";
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], Switch.prototype, "design", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Switch.prototype, "readonly", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Switch.prototype, "checked", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Switch.prototype, "disabled", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Switch.prototype, "textOn", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Switch.prototype, "textOff", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Switch.prototype, "accessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Switch.prototype, "accessibleNameRef", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Switch.prototype, "tooltip", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Switch.prototype, "required", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Switch.prototype, "name", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Switch.prototype, "value", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Switch.prototype, "_cancelAction", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Switch.prototype, "_isSpacePressed", void 0);
    __decorate$1([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Switch, "i18nBundle", void 0);
    Switch = Switch_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-switch",
            formAssociated: true,
            languageAware: true,
            styles: switchCss,
            renderer: parametersBundle_css.y,
            template: SwitchTemplate,
        })
        /**
         * Fired when the component checked state changes.
         * @public
         */
        ,
        eventStrict.l("change", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired to make Angular two way data binding work properly.
         * @private
         */
        ,
        eventStrict.l("value-changed", {
            bubbles: true,
            cancelable: true,
        })
    ], Switch);
    Switch.define();
    var Switch$1 = Switch;

    function UserSettingsNotificationsViewItemTemplate() {
        if (this._isHeaderItem) {
            return headerItemContent(this);
        }
        return ListItemCustom.ListItemCustomTemplate.call(this, {
            listItemContent: listItemContent.bind(this),
        });
    }
    function headerItemContent(item) {
        return (parametersBundle_css.jsxs("div", { class: "ui5-user-settings-notifications-form-item", role: "group", "aria-label": item._accessibleSwitchName, "data-sap-focus-ref": true, tabindex: item._effectiveTabIndex, onFocusIn: item._onfocusin, onFocusOut: item._onfocusout, onKeyUp: item._onkeyup, onKeyDown: item._onkeydown, onClick: item._handleFormItemClick, children: [itemBody(item), item.navigable &&
                    parametersBundle_css.jsx(Icon.Icon, { class: "ui5-user-settings-notifications-item-arrow", name: ListItemTemplate.slimArrowRight, mode: "Decorative" })] }));
    }
    function listItemContent() {
        return itemBody(this);
    }
    function itemBody(item) {
        return (parametersBundle_css.jsxs("div", { class: `ui5-user-settings-notifications-item${item.bylineText && item.text ? " has-byline" : ""}`, children: [parametersBundle_css.jsx("div", { class: "ui5-user-settings-notifications-item-start", children: parametersBundle_css.jsxs("div", { class: "ui5-user-settings-notifications-item-texts", children: [item.text &&
                                parametersBundle_css.jsx("span", { class: "ui5-user-settings-notifications-item-title", children: item.text }), item.bylineText &&
                                parametersBundle_css.jsx("span", { class: "ui5-user-settings-notifications-item-byline", children: item.bylineText })] }) }), parametersBundle_css.jsx("div", { class: "ui5-user-settings-notifications-item-end", children: item._hasEndContent
                        ? parametersBundle_css.jsx("slot", { name: "endContent", onClick: item._handleEndClick })
                        : parametersBundle_css.jsx(Switch$1, { class: "ui5-user-settings-notifications-item-switch", checked: item.checked, onChange: item._handleSwitchChange, accessibleName: item._accessibleSwitchName, onClick: item._handleEndClick }) })] }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$2.defaultTheme, "host");
    var UserSettingsNotificationsViewItemCss = `:host{--_ui5_user_settings_notifications_item_end_margin: .75rem;min-height:var(--sapElement_LineHeight);overflow:visible}.ui5-li-root,.ui5-li-content{overflow:visible}.ui5-user-settings-notifications-form-item{display:flex;align-items:center;width:100%;min-height:var(--sapElement_LineHeight);padding:var(--_ui5_list_item_base_padding, 0 1rem);box-sizing:border-box;background:var(--sapList_Background);outline:none;position:relative;cursor:default}@media (hover: hover){.ui5-user-settings-notifications-form-item:hover{background:var(--sapList_Hover_Background)}}:host([navigable]) .ui5-user-settings-notifications-form-item{cursor:pointer}.ui5-user-settings-notifications-form-item .ui5-user-settings-notifications-item-end{padding-inline-end:var(--_ui5_list_item_icon_size, 1.125rem)}:host([navigable]) .ui5-user-settings-notifications-form-item .ui5-user-settings-notifications-item-end{padding-inline-end:.25rem}.ui5-user-settings-notifications-form-item .ui5-user-settings-notifications-item{flex:1 1 auto;min-width:0}.ui5-user-settings-notifications-item-arrow{flex-shrink:0}:host([desktop]) .ui5-user-settings-notifications-form-item:focus:after,.ui5-user-settings-notifications-form-item:focus-visible:after{content:"";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;inset:.125rem;pointer-events:none}@container style(--ui5_content_density: compact){:host{--_ui5_user_settings_notifications_item_end_margin: 1rem;min-height:var(--sapElement_Compact_LineHeight)}}.ui5-user-settings-notifications-item{display:flex;align-items:center;justify-content:space-between;width:100%;height:100%;box-sizing:border-box}.ui5-user-settings-notifications-item-start{display:flex;align-items:center;flex:1;min-width:0;gap:.75rem}.ui5-user-settings-notifications-item-texts{display:flex;flex-direction:column;min-width:0;overflow:hidden}.ui5-user-settings-notifications-item-title{font-family:var(--sapFontFamily);font-size:var(--sapFontLargeSize);font-weight:400;color:var(--sapList_TextColor);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@container style(--ui5_content_density: compact){.ui5-user-settings-notifications-item-title{font-size:var(--sapFontSize)}}.ui5-user-settings-notifications-item-byline{font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;color:var(--sapContent_LabelColor);padding-top:.5rem;padding-bottom:.125rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-user-settings-notifications-item-end{display:flex;align-items:center;flex-shrink:0;margin-inline-start:var(--_ui5_user_settings_notifications_item_end_margin);padding-inline-end:.25rem;overflow:visible}:host(:not([navigable])) .ui5-user-settings-notifications-item-end{padding-inline-end:calc(var(--_ui5_list_item_icon_size, 1.125rem) + .25rem)}.ui5-user-settings-notifications-item.has-byline{align-items:stretch;min-height:5rem}@container style(--ui5_content_density: compact){.ui5-user-settings-notifications-item.has-byline{min-height:4rem}}.has-byline .ui5-user-settings-notifications-item-start{align-items:center}.has-byline .ui5-user-settings-notifications-item-title{padding-top:.125rem}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-settings-notifications-view-item` represents a single notification setting
     * within the `ui5-user-settings-notifications-view`.
     *
     * It displays a title and an optional byline. By default a trailing switch reflects
     * the `checked` state. Applications can override the trailing control by providing content
     * in the `endContent` slot (e.g. a `ui5-select` for a value picker); the built-in switch and
     * its `switch-change` event are then suppressed. Items can additionally be flagged as
     * `navigable` to display a navigation arrow and behave as clickable list rows.
     *
     * **Note:** The default switch and the `endContent` slot are mutually exclusive.
     * When any content is provided in `endContent`, the trailing switch is not rendered
     * and no `switch-change` event is fired.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserSettingsNotificationsViewItem.js";`
     *
     * @constructor
     * @extends ListItemCustom
     * @public
     * @since 2.27.0
     */
    let UserSettingsNotificationsViewItem = class UserSettingsNotificationsViewItem extends ListItemCustom.ListItemCustom {
        constructor() {
            super(...arguments);
            /**
             * Defines the unique identifier of the item.
             *
             * When the item is navigable, `itemKey` is also used to route to a matching sibling
             * `secondary` view by id.
             *
             * @default ""
             * @public
             */
            this.itemKey = "";
            /**
             * Defines the title text of the item.
             * @default ""
             * @public
             */
            this.text = "";
            /**
             * Defines the byline text of the item, rendered below the title.
             * @default ""
             * @public
             */
            this.bylineText = "";
            /**
             * Defines whether the trailing switch is on.
             *
             * Ignored when the `endContent` slot is used.
             *
             * @default false
             * @public
             */
            this.checked = false;
            /**
             * Defines whether the item is navigable. When true, a navigation arrow is rendered
             * and the whole row becomes clickable (fires the parent view's `item-click` event).
             * @default false
             * @public
             */
            this.navigable = false;
            this._handleSwitchChange = (e) => {
                const target = e.target;
                this.checked = target.checked;
                this.fireDecoratorEvent("switch-change", { item: this, checked: this.checked });
            };
            this._handleFormItemClick = (e) => {
                if (!this.navigable) {
                    return;
                }
                if (e.target?.closest("[ui5-switch]")) {
                    return;
                }
                this.fireDecoratorEvent("_form-item-click", { item: this });
            };
            this._handleEndClick = (e) => {
                e.stopPropagation();
            };
        }
        get isUserSettingsNotificationsViewItem() {
            return true;
        }
        get typeNavigation() {
            return this.navigable;
        }
        get _isHeaderItem() {
            return this._individualSlot?.startsWith("headerItems") ?? false;
        }
        shouldForwardTabAfter() {
            if (this._isHeaderItem) {
                const tabbable = ListItemBase.b(this.getFocusDomRef());
                return tabbable.length === 0;
            }
            return super.shouldForwardTabAfter();
        }
        get _hasEndContent() {
            return this.endContent.length > 0;
        }
        get _accessibleSwitchName() {
            return this.bylineText ? `${this.text} ${this.bylineText}` : this.text;
        }
        _onkeyup(e) {
            // The switch only reacts to Space when it has focus itself (F2/arrow-key mode),
            // so toggling at row level must be done here.
            if (webcomponentsBase.A(e) && e.target === this.getFocusDomRef() && !this._hasEndContent) {
                this.checked = !this.checked;
                this.fireDecoratorEvent("switch-change", { item: this, checked: this.checked });
                return;
            }
            super._onkeyup(e);
        }
        get accessibilityInfo() {
            return {
                ...super.accessibilityInfo,
                description: this._accessibleSwitchName,
            };
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], UserSettingsNotificationsViewItem.prototype, "itemKey", void 0);
    __decorate([
        webcomponentsBase.s()
    ], UserSettingsNotificationsViewItem.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], UserSettingsNotificationsViewItem.prototype, "bylineText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsNotificationsViewItem.prototype, "checked", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], UserSettingsNotificationsViewItem.prototype, "navigable", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
        })
    ], UserSettingsNotificationsViewItem.prototype, "endContent", void 0);
    UserSettingsNotificationsViewItem = __decorate([
        webcomponentsBase.m({
            tag: "ui5-user-settings-notifications-view-item",
            renderer: parametersBundle_css.y,
            template: UserSettingsNotificationsViewItemTemplate,
            styles: [ListItemCustom.ListItemCustom.styles, UserSettingsView_css.UserSettingViewCss, UserSettingsNotificationsViewItemCss],
        })
        /**
         * Fired when the switch state changes.
         *
         * Not fired when the `endContent` slot is used to override the trailing control.
         *
         * @param {UserSettingsNotificationsViewItem} item The item whose switch was toggled.
         * @param {boolean} checked The new checked state of the switch.
         * @public
         */
        ,
        eventStrict.l("switch-change", {
            bubbles: true,
        }),
        eventStrict.l("_form-item-click", {
            bubbles: true,
        })
    ], UserSettingsNotificationsViewItem);
    UserSettingsNotificationsViewItem.define();
    const isInstanceOfUserSettingsNotificationsViewItem = webcomponentsBase.r("isUserSettingsNotificationsViewItem");
    var UserSettingsNotificationsViewItem_default = UserSettingsNotificationsViewItem;

    exports.default = UserSettingsNotificationsViewItem_default;
    exports.isInstanceOfUserSettingsNotificationsViewItem = isInstanceOfUserSettingsNotificationsViewItem;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
