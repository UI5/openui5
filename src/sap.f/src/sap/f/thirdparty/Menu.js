sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/MenuItem2', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/slim-arrow-down', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/List', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/ListSelectionMode', 'sap/f/thirdparty/ListItemAdditionalText.css', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/WrappingType'], (function (webcomponentsBase, eventStrict, Theme, parametersBundle_css, InvisibleMessage, ListItemTemplate, jsxRuntime, ResponsivePopover, MenuItem, i18nDefaults, slimArrowDown, Button, List, BusyIndicator, Icons, ListItemBase, decline, ListSelectionMode, ListItemAdditionalText_css, Icon, ValueState, AccessibilityTextsHelper, Label, Title, toLowercaseEnumValue, FocusableElements, willShowContent, ListItemGroup, WrappingType) { 'use strict';

    function SplitButtonTemplate() {
        return (jsxRuntime.jsxs("div", { role: this._hideArrowButton ? "presentation" : "group", class: "ui5-split-button-root", tabindex: this._tabIndex, "aria-labelledby": !this._hideArrowButton ? `${this._id}-invisibleTextDefault ${this._id}-invisibleText` : undefined, "aria-haspopup": this._computedAccessibilityAttributes?.root?.hasPopup, "aria-roledescription": this._computedAccessibilityAttributes?.root?.roleDescription, "aria-label": this._computedAccessibilityAttributes?.root?.title, "aria-keyshortcuts": this._computedAccessibilityAttributes?.root?.ariaKeyShortcuts, onFocusOut: this._onFocusOut, onKeyDown: this._onKeyDown, onKeyUp: this._onKeyUp, children: [jsxRuntime.jsx(Button.Button, { class: "ui5-split-text-button", design: this.design, icon: this.icon, endIcon: this._endIcon, tabindex: -1, disabled: this.disabled, active: this._textButtonActive, exportparts: "icon,endIcon,button", onClick: this._handleMouseClick, onTouchStart: this.handleTouchStart, onMouseDown: this.handleTouchStart, onMouseUp: this._textButtonRelease, onFocusIn: this._onInnerButtonFocusIn, onFocusOut: this._onFocusOut, tooltip: this._computedAccessibilityAttributes?.root?.title, children: this.isTextButton && jsxRuntime.jsx("slot", {}) }), !this._hideArrowButton && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx(Button.Button, { class: "ui5-split-arrow-button", design: this.design, icon: slimArrowDown.slimArrowDown, tabindex: -1, tooltip: this._computedAccessibilityAttributes?.arrowButton?.title, accessibilityAttributes: { hasPopup: this._computedAccessibilityAttributes?.arrowButton?.hasPopup, expanded: this._computedAccessibilityAttributes?.arrowButton?.expanded }, disabled: this.disabled, active: this.effectiveActiveArrowButton, part: "arrowButton", onClick: this._handleArrowButtonAction, onMouseDown: this._arrowButtonPress, onMouseUp: this._arrowButtonRelease, onFocusIn: this._onInnerButtonFocusIn, onActiveStateChange: this._onArrowButtonActiveStateChange }), jsxRuntime.jsxs("span", { id: `${this._id}-invisibleText`, class: "ui5-hidden-text", children: [this.accInfo.keyboardHint, " ", this.accessibleName] }), jsxRuntime.jsx("span", { id: `${this._id}-invisibleTextDefault`, class: "ui5-hidden-text", children: this.buttonTextContent })] }))] }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var SplitButtonCss = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-flex;height:var(--_ui5_button_base_height);border-radius:var(--_ui5_button_border_radius);background-color:var(--sapButton_Background);box-shadow:var(--_ui5_split_button_host_default_box_shadow)}:host([active-arrow-button][design="Negative"]) .ui5-split-arrow-button,:host([design="Negative"]) .ui5-split-arrow-button[active]{background-color:var(--sapButton_Reject_Selected_Background);border:.0625rem solid var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Reject_Active_TextColor)}:host([active-arrow-button][design="Positive"]) .ui5-split-arrow-button,:host([design="Positive"]) .ui5-split-arrow-button[active]{background-color:var(--sapButton_Accept_Selected_Background);border:.0625rem solid var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Accept_Active_TextColor)}:host([active-arrow-button][design="Attention"]) .ui5-split-arrow-button,:host([design="Attention"]) .ui5-split-arrow-button[active]{background-color:var(--sapButton_Attention_Selected_Background);border:.0625rem solid var(--sapButton_Attention_Active_BorderColor);color:var(--sapButton_Attention_Active_TextColor)}:host([active-arrow-button][design="Emphasized"]) .ui5-split-arrow-button,:host([design="Emphasized"]) .ui5-split-arrow-button[active]{background-color:var(--sapButton_Emphasized_Active_Background);border:.0625rem solid var(--sapButton_Emphasized_Active_BorderColor)}:host([active-arrow-button][design="Transparent"]) .ui5-split-arrow-button,:host([active-arrow-button]) .ui5-split-arrow-button,:host([design="Transparent"]) .ui5-split-arrow-button[active],:host([design="Default"]) .ui5-split-arrow-button[active],.ui5-split-arrow-button[active],.ui5-split-arrow-button[active]:hover{background-color:var(--sapButton_Active_Background);border:.0625rem solid var(--sapButton_Lite_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([disabled]:not([hidden])){pointer-events:none;opacity:var(--sapContent_DisabledOpacity)}:host([design="Positive"]:not([hidden])){background-color:var(--sapButton_Accept_Background);box-shadow:var(--_ui5_split_button_host_positive_box_shadow)}:host([design="Negative"]:not([hidden])){background-color:var(--sapButton_Reject_Background);box-shadow:var(--_ui5_split_button_host_negative_box_shadow)}:host([design="Attention"]:not([hidden])){background-color:var(--sapButton_Attention_Background);box-shadow:var(--_ui5_split_button_host_attention_box_shadow)}:host([design="Emphasized"]:not([hidden])){background-color:var(--sapButton_Emphasized_Background);box-shadow:var(--_ui5_split_button_host_emphasized_box_shadow)}:host([design="Transparent"]:not([hidden])){background-color:var(--sapButton_Lite_Background);box-shadow:var(--_ui5_split_button_host_transparent_box_shadow)}:host([design="Transparent"][disabled]:not([hidden])){background-color:var(--_ui5_split_button_transparent_disabled_background)}:host([design="Transparent"]:not([hidden]):not([disabled]):hover){background-color:var(--_ui5_split_button_host_transparent_hover_background);box-shadow:var(--_ui5_split_button_host_transparent_hover_box_shadow)}:host([design="Transparent"]:not([hidden]):not([disabled]):hover) .ui5-split-arrow-button:not(:hover),:host([design="Transparent"]:not([hidden]):not([disabled]):hover) .ui5-split-text-button:not(:hover){color:var(--_ui5_split_button_transparent_hover_color)}:host([desktop]) .ui5-split-button-root:focus-within,.ui5-split-button-root:focus-visible{outline:0}:host([desktop]) .ui5-split-button-root:focus-within:after,.ui5-split-button-root:focus-visible:after{content:"";position:absolute;box-sizing:border-box;inset:.125rem;border:var(--_ui5_split_button_focused_border);pointer-events:none;border-radius:var(--_ui5_split_button_focused_border_radius)}:host([design="Emphasized"][desktop]) .ui5-split-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-split-button-root:focus-visible:after{border-color:var(--sapContent_ContrastFocusColor)}:host([design="Emphasized"][desktop]) .ui5-split-button-root:focus-within .ui5-split-text-button[active]::part(button):after,:host([design="Emphasized"]) .ui5-split-button-root:focus-visible .ui5-split-text-button[active]::part(button):after{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5_split_button_focused_border);border-radius:var(--_ui5_split_button_focused_border_radius)}:host([design="Emphasized"][desktop]) .ui5-split-button-root:has(.ui5-split-text-button[active]):after,:host([design="Emphasized"]) .ui5-split-button-root:has(.ui5-split-text-button[active]):after{border-color:transparent}.ui5-split-button-root{display:inline-flex;position:relative;width:inherit;height:100%}.ui5-split-button-root:focus,.ui5-split-text-button:focus,.ui5-split-arrow-button:focus{outline:0}.ui5-split-text-button{border-start-end-radius:var(--sapButton_Segment_BorderCornerRadius);border-end-end-radius:var(--sapButton_Segment_BorderCornerRadius);border-width:.0625rem;border-inline-end-width:var(--_ui5_split_button_text_button_right_border_width);border-color:var(--_ui5_split_text_button_border_color);background-color:var(--_ui5_split_text_button_background_color);vertical-align:top;flex-grow:1}.ui5-split-text-button:hover{border-start-end-radius:var(--sapButton_Segment_BorderCornerRadius);border-end-end-radius:var(--sapButton_Segment_BorderCornerRadius);background-color:var(--sapButton_Hover_Background);box-shadow:none;border:var(--_ui5_split_text_button_hover_border);border-inline-end:var(--_ui5_split_text_button_hover_border_right)}.ui5-split-text-button[design=Emphasized]{border:var(--_ui5_split_text_button_emphasized_border);border-width:var(--_ui5_split_text_button_emphasized_border_width)}.ui5-split-text-button[design=Emphasized]:hover{background-color:var(--sapButton_Emphasized_Hover_Background)}.ui5-split-text-button[design=Positive]:hover{background-color:var(--sapButton_Accept_Hover_Background);border:var(--_ui5_split_text_button_positive_hover_border);border-inline-end:var(--_ui5_split_text_button_positive_hover_border_right)}.ui5-split-text-button[design=Negative]:hover{background-color:var(--sapButton_Reject_Hover_Background);border:var(--_ui5_split_text_button_negative_hover_border);border-inline-end:var(--_ui5_split_text_button_negative_hover_border_right)}.ui5-split-text-button[design=Attention]:hover{background-color:var(--sapButton_Attention_Hover_Background);border:var(--_ui5_split_text_button_attention_hover_border);border-inline-end:var(--_ui5_split_text_button_attention_hover_border_right)}.ui5-split-text-button[design=Transparent]:hover{background-color:var(--_ui5_split_button_transparent_hover_background);border:var(--_ui5_split_text_button_transparent_hover_border);border-inline-end:var(--_ui5_split_text_button_transparent_hover_border_right)}.ui5-split-text-button[active][design=Emphasized]{background-color:var(--sapButton_Selected_Background);color:var(--sapButton_Emphasized_Active_TextColor);border-color:var(--sapButton_Emphasized_Active_BorderColor)}.ui5-split-text-button[active][design=Negative]{background-color:var(--sapButton_Reject_Selected_Background);color:var(--sapButton_Reject_Active_TextColor);border-color:var(--sapButton_Reject_Active_BorderColor)}.ui5-split-text-button[active][design=Positive]{background-color:var(--sapButton_Accept_Selected_Background);color:var(--sapButton_Accept_Active_TextColor);border-color:var(--sapButton_Accept_Active_BorderColor)}.ui5-split-text-button[active][design=Attention]{background-color:var(--sapButton_Attention_Selected_Background);color:var(--sapButton_Attention_Active_TextColor);border-color:var(--sapButton_Attention_Active_BorderColor)}.ui5-split-text-button[active][design=Default],.ui5-split-text-button[active][design=Transparent]{background-color:var(--sapButton_Active_Background);color:var(--sapButton_Active_TextColor);border-color:var(--sapButton_Active_BorderColor)}.ui5-split-text-button[active]{outline:0}.ui5-split-arrow-button{border-start-start-radius:var(--sapButton_Segment_BorderCornerRadius);border-end-start-radius:var(--sapButton_Segment_BorderCornerRadius);border-color:var(--_ui5_split_text_button_border_color);background-color:var(--_ui5_split_text_button_background_color);position:relative;border-width:.0625rem;overflow:visible}.ui5-split-arrow-button:hover{border-start-start-radius:var(--sapButton_Segment_BorderCornerRadius);border-end-start-radius:var(--sapButton_Segment_BorderCornerRadius);background-color:var(--sapButton_Hover_Background);box-shadow:none;border:var(--_ui5_split_arrow_button_hover_border)}.ui5-split-arrow-button[design=Emphasized]:hover{background-color:var(--sapButton_Emphasized_Hover_Background);border:var(--_ui5_split_arrow_button_emphasized_hover_border);box-shadow:var(--_ui5_split_arrow_button_emphasized_hover_box_shadow, none)}:dir(rtl).ui5-split-arrow-button[design=Emphasized]:hover{box-shadow:var(--_ui5_split_arrow_button_emphasized_hover_box_shadow_rtl, none)}.ui5-split-arrow-button[design=Positive]:hover{background-color:var(--sapButton_Accept_Hover_Background);border:var(--_ui5_split_arrow_button_positive_hover_border)}.ui5-split-arrow-button[design=Negative]:hover{background-color:var(--sapButton_Reject_Hover_Background);border:var(--_ui5_split_arrow_button_negative_hover_border)}.ui5-split-arrow-button[design=Attention]:hover{background-color:var(--sapButton_Attention_Hover_Background);border:var(--_ui5_split_arrow_button_attention_hover_border)}.ui5-split-arrow-button[design=Transparent]:hover{background-color:var(--_ui5_split_button_transparent_hover_background);border:var(--_ui5_split_arrow_button_transparent_hover_border)}.ui5-split-arrow-button:before{content:"";position:absolute;box-sizing:border-box;pointer-events:none;width:.0625rem;background-color:var(--sapButton_TextColor);inset-inline-start:var(--_ui5_split_button_middle_separator_left);inset-block-start:var(--_ui5_split_button_middle_separator_top);height:var(--_ui5_split_button_middle_separator_height)}.ui5-split-arrow-button[design=Emphasized]:before{content:"";position:absolute;box-sizing:border-box;pointer-events:none;inset-inline-start:var(--_ui5_split_button_middle_separator_left);inset-block-start:var(--_ui5_split_button_middle_separator_top);inset-inline-end:0;height:var(--_ui5_split_button_middle_separator_height);width:.0625rem}.ui5-split-text-button:hover+.ui5-split-arrow-button:before,.ui5-split-arrow-button:hover:before{display:var(--_ui5_split_button_middle_separator_hover_display)}.ui5-split-arrow-button[design=Emphasized]:hover:before{display:var(--_ui5_split_button_middle_separator_hover_display_emphasized)}.ui5-split-arrow-button[design=Transparent]:before{background-color:var(--sapButton_Lite_TextColor)}.ui5-split-arrow-button[design=Emphasized]:before{background-color:var(--sapButton_Emphasized_TextColor)}.ui5-split-arrow-button[design=Positive]:before{background-color:var(--sapButton_Accept_TextColor)}.ui5-split-arrow-button[design=Negative]:before{background-color:var(--sapButton_Reject_TextColor)}.ui5-split-arrow-button[design=Attention]:before{background-color:var(--_ui5_split_button_attention_separator_color_default)}.ui5-split-arrow-button[desktop]::part(button):focus-within:after,.ui5-split-arrow-button::part(button):focus-visible:after{border-start-start-radius:var(--_ui5_split_button_inner_focused_border_radius_inner);border-end-start-radius:var(--_ui5_split_button_inner_focused_border_radius_inner)}.ui5-split-arrow-button[desktop]::part(button):focus-within:after,.ui5-split-text-button::part(button):focus-visible:after{border-start-end-radius:var(--_ui5_split_button_inner_focused_border_radius_inner);border-end-end-radius:var(--_ui5_split_button_inner_focused_border_radius_inner)}.ui5-split-text-button[active][design=Emphasized]{color:var(--sapButton_Emphasized_Active_TextColor);background-color:var(--sapButton_Emphasized_Active_Background)}:host([design="Emphasized"][active-arrow-button]) .ui5-split-arrow-button,.ui5-split-arrow-button[active][design=Emphasized]{background-color:var(--sapButton_Selected_Background);color:var(--sapButton_Emphasized_Active_TextColor);border:var(--_ui5_split_arrow_button_emphasized_hover_border)}:host([design="Transparent"][active-arrow-button]:not([hidden]):not([disabled]):hover) .ui5-split-arrow-button{color:var(--sapButton_Active_TextColor)}:host([active-arrow-button]) .ui5-split-arrow-button{border:.0625rem solid var(--sapButton_Lite_Active_BorderColor)}:host([active-arrow-button]) .ui5-split-arrow-button:before,.ui5-split-arrow-button[active]:before,.ui5-split-text-button[active]+.ui5-split-arrow-button:before{background-color:var(--sapButton_TextColor)}:host([design="Emphasized"][active-arrow-button]) .ui5-split-arrow-button:before,:host([design="Emphasized"]) .ui5-split-arrow-button[active]:before,:host([design="Emphasized"]) .ui5-split-text-button[active]+.ui5-split-arrow-button:before{background-color:var(--_ui5_split_button_emphasized_separator_color)}:host([design="Positive"][active-arrow-button]) .ui5-split-arrow-button:before,:host([design="Positive"]) .ui5-split-arrow-button[active]:before,:host([design="Positive"]) .ui5-split-text-button[active]+.ui5-split-arrow-button:before{background-color:var(--_ui5_split_button_positive_separator_color)}:host([design="Negative"][active-arrow-button]) .ui5-split-arrow-button:before,:host([design="Negative"]) .ui5-split-arrow-button[active]:before,:host([design="Negative"]) .ui5-split-text-button[active]+.ui5-split-arrow-button:before{background-color:var(--_ui5_split_button_negative_separator_color)}:host([design="Attention"][active-arrow-button]) .ui5-split-arrow-button:before,:host([design="Attention"]) .ui5-split-arrow-button[active]:before,:host([design="Attention"]) .ui5-split-text-button[active]+.ui5-split-arrow-button:before{background-color:var(--_ui5_split_button_attention_separator_color)}.ui5-split-text-button::part(button){justify-content:flex-start;padding:0 var(--_ui5_button_base_padding)}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var SplitButton_1;
    /**
     * @class
     *
     * ### Overview
     *
     * `ui5-split-button` enables users to trigger actions. It is constructed of two separate actions -
     * default action and arrow action that can be activated by clicking or tapping, or by
     * pressing certain keyboard keys - `Space` or `Enter` for default action,
     * and `Arrow Down` or `Arrow Up` for arrow action.
     *
     * ### Usage
     *
     * `ui5-split-button` consists two separate buttons:
     *
     * - for the first one (default action) you can define some `text` or an `icon`, or both.
     * - the second one (arrow action) contains only `slim-arrow-down` icon.
     *
     * You can choose a `design` from a set of predefined types (the same as for ui5-button) that offer
     * different styling to correspond to the triggered action. Both text and arrow actions have the same design.
     *
     * You can set the `ui5-split-button` as enabled or disabled. Both parts of an enabled
     * `ui5-split-button` can be pressed by clicking or tapping it, or by certain keys, which changes
     * the style to provide visual feedback to the user that it is pressed or hovered over with
     * the mouse cursor. A disabled `ui5-split-button` appears inactive and any of the two buttons
     * cannot be pressed.
     *
     * ### Keyboard Handling
     *
     * - `Space` or `Enter` - triggers the default action
     * - `Shift` or `Escape` - if `Space` is pressed, releases the default action button without triggering the click event.
     * - `Arrow Down`, `Arrow Up`, `Alt`+`Arrow Down`, `Alt`+`Arrow Up`, or `F4` - triggers the arrow action
     * There are separate events that are fired on activating of `ui5-split-button` parts:
     *
     * - `click` for the first button (default action)
     * - `arrow-click` for the second button (arrow action)
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/SplitButton.js";`
     * @csspart button - Used to style the native button element
     * @csspart icon - Used to style the icon in the native button element
     * @csspart endIcon - Used to style the end icon in the native button element
     * @constructor
     * @extends UI5Element
     * @public
     * @since 1.1.0
     */
    let SplitButton = SplitButton_1 = class SplitButton extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the arrow button should have the active state styles or not.
             * @default false
             * @public
             * @since 1.21.0
             */
            this.activeArrowButton = false;
            /**
             * Defines the component design.
             * @default "Default"
             * @public
             */
            this.design = "Default";
            /**
             * Defines whether the component is disabled.
             * A disabled component can't be pressed or
             * focused, and it is not in the tab chain.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * Defines the tabIndex of the component.
             * @default "0"
             * @private
             */
            this._tabIndex = 0;
            /**
             * Indicates if there is Shift or Escape key pressed while Space key is down.
             * @default false
             * @private
             */
            this._shiftOrEscapePressedDuringSpace = false;
            /**
             * Defines the active state of the text button
             * @default false
             * @private
             */
            this._textButtonActive = false;
            /**
             * Defines the state of the internal Button used for the Arrow button of the SplitButton.
             * @default false
             * @private
             */
            this._activeArrowButton = false;
            /**
             * Defines the visibility of the arrow button of the component.
             *
             * @default false
             * @private
             */
            this._hideArrowButton = false;
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The `accessibilityAttributes` property accepts an object with the following optional fields:
             *
             * - **root**: Attributes that will be applied to the main (text) button.
             *   - **hasPopup**: Indicates the presence and type of popup triggered by the button.
             *     Accepts string values: `"dialog"`, `"grid"`, `"listbox"`, `"menu"`, or `"tree"`.
             *   - **roleDescription**: Provides a human-readable description for the role of the button.
             *     Accepts any string value.
             *   - **title**: Specifies a tooltip or description for screen readers.
             *     Accepts any string value.
             * 	- **ariaKeyShortcuts**: Defines keyboard shortcuts that activate or give focus to the button.
             *
             * - **arrowButton**: Attributes applied specifically to the arrow (split) button.
             *   - **hasPopup**: Indicates the presence and type of popup triggered by the arrow button.
             *     Accepts string values: `"dialog"`, `"grid"`, `"listbox"`, `"menu"`, or `"tree"`.
             *   - **expanded**: Indicates whether the popup triggered by the arrow button is currently expanded.
             *     Accepts boolean values: `true` or `false`.
             *
             * @default {}
             * @public
             * @since 2.13.0
             */
            this.accessibilityAttributes = {};
        }
        onBeforeRendering() {
            if (this.disabled) {
                this._tabIndex = -1;
            }
        }
        _handleMouseClick(e) {
            this._fireClick(e);
        }
        _onFocusOut() {
            if (this.disabled || this.getFocusDomRef().matches(":has(:focus-within)")) {
                return;
            }
            this._resetActionButtonStates();
            this._setTabIndexValue();
        }
        handleTouchStart(e) {
            e.stopPropagation();
            this._textButtonActive = true;
            this._tabIndex = -1;
        }
        _onInnerButtonFocusIn(e) {
            e.stopPropagation();
            this._setTabIndexValue(true);
            const target = e.target;
            target.focus();
        }
        _onKeyDown(e) {
            if (this._isArrowKeyAction(e)) {
                this._handleArrowButtonAction(e);
                this._activeArrowButton = true;
                return;
            }
            if (this._isDefaultAction(e)) {
                this._handleDefaultAction(e);
                return;
            }
            if ((webcomponentsBase.Ko(e) || webcomponentsBase.m$1(e)) && this._textButtonActive) {
                e.preventDefault();
                this._shiftOrEscapePressedDuringSpace = true;
            }
            if (webcomponentsBase.m$1(e) && !this._textButtonActive) {
                this._resetActionButtonStates();
            }
            this._tabIndex = -1;
        }
        _onKeyUp(e) {
            const target = e.target;
            if (this._isArrowKeyAction(e)) {
                e.preventDefault();
                this._activeArrowButton = false;
                return;
            }
            if (webcomponentsBase.A(e)) {
                e.preventDefault();
                e.stopPropagation();
                this._textButtonActive = false;
                if (!this._shiftOrEscapePressedDuringSpace) { // Do not fire click if Arrow button is focused by mouse and Space is pressed afterwards
                    if (target !== this.arrowButton) {
                        this._fireClick();
                    }
                    else {
                        this._fireArrowClick();
                    }
                }
                this._shiftOrEscapePressedDuringSpace = false;
                return;
            }
            const shouldToggleTextButtonActiveStateOff = webcomponentsBase.b(e) || (webcomponentsBase.Ko(e) && this._textButtonActive);
            if (shouldToggleTextButtonActiveStateOff) {
                this._textButtonActive = false;
            }
        }
        _resetActionButtonStates() {
            this._activeArrowButton = false;
            this._textButtonActive = false;
            this._shiftOrEscapePressedDuringSpace = false;
        }
        _fireClick(e) {
            e?.stopPropagation();
            this.fireDecoratorEvent("click");
        }
        _fireArrowClick(e) {
            e?.stopPropagation();
            this.fireDecoratorEvent("arrow-click");
        }
        _textButtonRelease() {
            this._textButtonActive = false;
            this._tabIndex = -1;
        }
        _arrowButtonPress(e) {
            e.stopPropagation();
            this._tabIndex = -1;
        }
        _arrowButtonRelease(e) {
            e.preventDefault();
            this._tabIndex = -1;
        }
        _setTabIndexValue(innerButtonPressed) {
            this._tabIndex = this.disabled ? -1 : 0;
            if (this._tabIndex === -1 && innerButtonPressed) {
                this._tabIndex = 0;
            }
        }
        _onArrowButtonActiveStateChange(e) {
            if (this.activeArrowButton) {
                e.preventDefault();
            }
        }
        /**
         * Checks if the pressed key is an arrow key.
         * @param e - keyboard event
         * @private
         */
        _isArrowKeyAction(e) {
            return webcomponentsBase._(e) || webcomponentsBase.P(e) || webcomponentsBase.T(e) || webcomponentsBase.w(e) || webcomponentsBase.s$1(e);
        }
        /**
         * Checks if the pressed key is a default action key (Space or Enter).
         * @param e - keyboard event
         * @private
         */
        _isDefaultAction(e) {
            return webcomponentsBase.A(e) || webcomponentsBase.b(e);
        }
        /**
         * Handles the click event and the focus on the arrow button.
         * @param e - keyboard event
         * @private
         */
        _handleArrowButtonAction(e) {
            e.preventDefault();
            this._fireArrowClick(e);
        }
        /**
         * Handles the default action and the active state of the respective button.
         * @param e - keyboard event
         * @private
         */
        _handleDefaultAction(e) {
            e.preventDefault();
            const target = e.target;
            if (webcomponentsBase.b(e)) {
                if (this.arrowButton && target === this.arrowButton) {
                    this._activeArrowButton = true;
                    this._fireArrowClick();
                    return;
                }
                this._textButtonActive = true;
                this._fireClick(e);
                return;
            }
            if (webcomponentsBase.V(e) || webcomponentsBase.x(e)) {
                this._resetActionButtonStates();
            }
        }
        get effectiveActiveArrowButton() {
            return this.activeArrowButton || this._activeArrowButton;
        }
        get buttonTextContent() {
            return this.textContent;
        }
        get isTextButton() {
            return !!this.textContent;
        }
        get textButton() {
            return this.getDomRef()?.querySelector(".ui5-split-text-button");
        }
        get arrowButton() {
            return this.getDomRef()?.querySelector(".ui5-split-arrow-button");
        }
        get _computedAccessibilityAttributes() {
            return {
                root: {
                    hasPopup: this.accessibilityAttributes?.root?.hasPopup,
                    roleDescription: this.accessibilityAttributes?.root?.roleDescription || (this._hideArrowButton ? undefined : SplitButton_1.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_DESCRIPTION)),
                    title: this.accessibilityAttributes?.root?.title,
                    ariaKeyShortcuts: this.accessibilityAttributes?.root?.ariaKeyShortcuts,
                },
                arrowButton: {
                    hasPopup: this.accessibilityAttributes?.arrowButton?.hasPopup || "menu",
                    expanded: this.accessibilityAttributes?.arrowButton?.expanded || this.effectiveActiveArrowButton,
                    title: this.accessibilityAttributes?.arrowButton?.title || this.arrowButtonTooltip,
                },
            };
        }
        get accInfo() {
            return {
                "keyboardHint": SplitButton_1.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_KEYBOARD_HINT),
                "description": SplitButton_1.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_DESCRIPTION),
            };
        }
        get arrowButtonTooltip() {
            return SplitButton_1.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_ARROW_BUTTON_TOOLTIP);
        }
        get isSplitButton() {
            return true;
        }
        get ariaLabelText() {
            return [SplitButton_1.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_DESCRIPTION), SplitButton_1.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_KEYBOARD_HINT)].join(" ");
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], SplitButton.prototype, "icon", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SplitButton.prototype, "activeArrowButton", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], SplitButton.prototype, "design", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SplitButton.prototype, "disabled", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], SplitButton.prototype, "accessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number, noAttribute: true })
    ], SplitButton.prototype, "_tabIndex", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], SplitButton.prototype, "_shiftOrEscapePressedDuringSpace", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], SplitButton.prototype, "_textButtonActive", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], SplitButton.prototype, "_activeArrowButton", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: String })
    ], SplitButton.prototype, "_endIcon", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], SplitButton.prototype, "_hideArrowButton", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Object })
    ], SplitButton.prototype, "accessibilityAttributes", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: Node, "default": true })
    ], SplitButton.prototype, "text", void 0);
    __decorate$1([
        parametersBundle_css.i("@ui5/webcomponents")
    ], SplitButton, "i18nBundle", void 0);
    SplitButton = SplitButton_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-split-button",
            renderer: jsxRuntime.y,
            styles: SplitButtonCss,
            template: SplitButtonTemplate,
        })
        /**
         * Fired when the user clicks on the default action.
         * @public
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
        })
        /**
         * Fired when the user clicks on the arrow action.
         * @public
         */
        ,
        eventStrict.l("arrow-click", {
            bubbles: true,
        })
    ], SplitButton);
    SplitButton.define();
    const isInstanceOfSplitButton = webcomponentsBase.r$1("isSplitButton");

    function MenuTemplate() {
        return (jsxRuntime.jsxs(ResponsivePopover.ResponsivePopover, { id: `${this._id}-menu-rp`, class: "ui5-menu-rp", placement: this.placement, verticalAlign: "Bottom", horizontalAlign: this.horizontalAlign, opener: this.opener, open: this.open, preventInitialFocus: true, hideArrow: true, allowTargetOverlap: true, accessibleName: this.accessibleNameText, onBeforeOpen: this._beforePopoverOpen, onOpen: this._afterPopoverOpen, onBeforeClose: this._beforePopoverClose, onClose: this._afterPopoverClose, children: [this.isPhone &&
                    jsxRuntime.jsx("div", { slot: "header", class: "ui5-menu-dialog-header", children: jsxRuntime.jsx("div", { class: "ui5-menu-dialog-title", children: jsxRuntime.jsx("h1", { children: this.headerText }) }) }), jsxRuntime.jsx("div", { id: `${this._id}-menu-main`, class: this.loading ? "ui5-menu-busy-indicator-main" : "", children: this.items.length ?
                        (jsxRuntime.jsx(List.List, { id: `${this._id}- menu-list`, selectionMode: "None", loading: this.loading, loadingDelay: this.loadingDelay, separators: "None", accessibleRole: "Menu", onItemClick: this._itemClick, onMouseOver: this._itemMouseOver, onKeyDown: this._itemKeyDown, "onui5-close-menu": this._close, "onui5-exit-end-content": this._navigateOutOfEndContent, children: jsxRuntime.jsx("slot", {}) }))
                        : this.loading && (jsxRuntime.jsx(BusyIndicator.BusyIndicator, { id: `${this._id}-menu-busy-indicator`, delay: this.loadingDelay, class: "ui5-menu-busy-indicator", active: true })) }), this.isPhone &&
                    jsxRuntime.jsx("div", { slot: "footer", class: "ui5-menu-dialog-footer", children: jsxRuntime.jsx(Button.Button, { design: "Transparent", onClick: this._close, children: this.labelCancel }) })] }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var menuCss = `:host{line-height:initial}::slotted([ui5-menu-item]){line-height:inherit}.ui5-menu-rp[ui5-responsive-popover]::part(header),.ui5-menu-rp[ui5-responsive-popover]::part(content),.ui5-menu-rp[ui5-responsive-popover]::part(footer){padding:0}.ui5-menu-rp[ui5-responsive-popover]{box-shadow:var(--sapContent_Shadow1);border-radius:var(--_ui5_menu_popover_border_radius)}.ui5-menu-busy-indicator{width:100%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}.ui5-menu-busy-indicator-main{min-height:var(--_ui5_list_item_base_height)}.ui5-menu-dialog-header{display:flex;height:var(--_ui5-responsive_popover_header_height);align-items:center;justify-content:space-between;padding:0px 1rem;width:100%;overflow:hidden}.ui5-menu-dialog-title{display:flex;flex-direction:row;align-items:center;justify-content:flex-start;width:calc(100% - 6.5rem);padding-right:1rem;font-family:var(--sapFontHeaderFamily)}.ui5-menu-dialog-title>h1{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--sapFontHeader5Size)}.ui5-menu-back-button{margin-right:1rem}.ui5-menu-dialog-footer{display:flex;align-items:center;justify-content:flex-end;padding:0 1rem;width:100%;border-top:.0625rem solid var(--sapPageFooter_BorderColor)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Menu_1;
    const MENU_OPEN_DELAY = 300;
    /**
     * @class
     *
     * ### Overview
     *
     * `ui5-menu` component represents a hierarchical menu structure.
     *
     * ### Structure
     *
     * The `ui5-menu` can hold two types of entities:
     *
     * - `ui5-menu-item` components
     * - `ui5-menu-separator` - used to separate menu items with a line
     *
     * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
     *
     * ### Keyboard Handling
     *
     * The `ui5-menu` provides advanced keyboard handling.
     * The user can use the following keyboard shortcuts in order to navigate trough the tree:
     *
     * - `Arrow Up` / `Arrow Down` - Navigates up and down the menu items that are currently visible.
     * - `Arrow Right`, `Space` or `Enter` - Opens a sub-menu if there are menu items nested
     * in the currently clicked menu item.
     * - `Arrow Left` or `Escape` - Closes the currently opened sub-menu.
     *
     * when there is `endContent` :
     * - `Arrow Left` or `ArrowRight` - Navigate between the menu item actions and the menu item itself
     * - `Arrow Up` / `Arrow Down` - Navigates up and down the currently visible menu items
     *
     * **Note:** If the text direction is set to Right-to-left (RTL), `Arrow Right` and `Arrow Left` functionality is swapped.
     *
     * Application developers are responsible for ensuring that interactive elements placed in the `endContent` slot
     * have the correct accessibility behaviour, including their enabled or disabled states.
     * The menu does not manage these aspects when the menu item state changes.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Menu.js";`
     * @constructor
     * @extends UI5Element
     * @since 1.3.0
     * @public
     */
    let Menu = Menu_1 = class Menu extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Indicates if the menu is open.
             * @public
             * @default false
             * @since 1.10.0
             */
            this.open = false;
            /**
             * Determines on which side the component is placed at.
             * @default "Bottom"
             * @public
             * @since 2.16.0
             */
            this.placement = "Bottom";
            /**
             * Determines the horizontal alignment of the menu relative to its opener control.
             * @default "Start"
             * @public
             */
            this.horizontalAlign = "Start";
            /**
             * Defines if a loading indicator would be displayed inside the corresponding ui5-menu popover.
             * @default false
             * @public
             * @since 1.13.0
             */
            this.loading = false;
            /**
             * Defines the delay in milliseconds, after which the loading indicator will be displayed inside the corresponding ui5-menu popover.
             * @default 1000
             * @public
             * @since 1.13.0
             */
            this.loadingDelay = 1000;
        }
        get isRtl() {
            return this.effectiveDir === "rtl";
        }
        get labelCancel() {
            return Menu_1.i18nBundle.getText(i18nDefaults.MENU_CANCEL_BUTTON_TEXT);
        }
        get isPhone() {
            return Theme.d();
        }
        get _popover() {
            return this.shadowRoot.querySelector("[ui5-responsive-popover]");
        }
        get _list() {
            return this.shadowRoot.querySelector("[ui5-list]");
        }
        get _opener() {
            return typeof this.opener === "string" ? document.getElementById(this.opener) : this.opener;
        }
        /** Returns menu item groups */
        get _menuItemGroups() {
            return this.items.filter(MenuItem.isInstanceOfMenuItemGroup);
        }
        /** Returns menu items */
        get _menuItems() {
            return this.items.filter(MenuItem.isInstanceOfMenuItem);
        }
        /** Returns all menu items (including those in groups */
        get _allMenuItems() {
            const items = [];
            const slottedItems = this.getSlottedNodes("items");
            slottedItems.forEach(item => {
                if (MenuItem.isInstanceOfMenuItemGroup(item)) {
                    items.push(...item._menuItems);
                }
                else if (!MenuItem.isInstanceOfMenuSeparator(item)) {
                    items.push(item);
                }
            });
            return items;
        }
        /** Returns menu items included in the ItemNavigation */
        get _navigatableMenuItems() {
            const items = [];
            const slottedItems = this.getSlottedNodes("items");
            slottedItems.forEach(item => {
                if (MenuItem.isInstanceOfMenuItemGroup(item)) {
                    const groupItems = item.getSlottedNodes("items");
                    items.push(...groupItems);
                }
                else if (!MenuItem.isInstanceOfMenuSeparator(item)) {
                    items.push(item);
                }
            });
            return items;
        }
        get accessibleNameText() {
            return Menu_1.i18nBundle.getText(i18nDefaults.MENU_POPOVER_ACCESSIBLE_NAME);
        }
        onBeforeRendering() {
            const siblingsWithIcon = this._allMenuItems.some(menuItem => !!menuItem.icon);
            this._setupItemNavigation();
            this._allMenuItems.forEach(item => {
                item._siblingsWithIcon = siblingsWithIcon;
            });
        }
        getFocusDomRef() {
            return this._list?.getFocusDomRef();
        }
        _setupItemNavigation() {
            if (this._list) {
                this._list._itemNavigation._getItems = () => this._navigatableMenuItems;
            }
        }
        _close() {
            this.open = false;
        }
        _openItemSubMenu(item, openedByMouse = false) {
            clearTimeout(this._timeout);
            if (!item._popover || item._popover.open) {
                return;
            }
            this.fireDecoratorEvent("before-open", {
                item,
            });
            item._popover.opener = item;
            item._popover.open = true;
            item.selected = true;
            item._openedByMouse = openedByMouse;
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
            // Opens submenu with 300ms delay
            this._startOpenTimeout(item);
        }
        async focus(focusOptions) {
            await Theme.w();
            const firstMenuItem = this._allMenuItems[0];
            if (firstMenuItem) {
                return firstMenuItem.focus(focusOptions);
            }
            return super.focus(focusOptions);
        }
        _closeOtherSubMenus(item) {
            const menuItems = this._allMenuItems;
            if (!menuItems.includes(item)) {
                return;
            }
            menuItems.forEach(menuItem => {
                if (menuItem !== item) {
                    menuItem._close();
                }
            });
        }
        _startOpenTimeout(item) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(() => {
                this._closeOtherSubMenus(item);
                this._openItemSubMenu(item, true);
            }, MENU_OPEN_DELAY);
        }
        _itemClick(e) {
            const item = e.detail.item;
            if (!item._popover) {
                const prevented = !this.fireDecoratorEvent("item-click", {
                    "item": item,
                    "text": item.text || "",
                });
                if (!prevented) {
                    item._updateCheckedState();
                    this._popover && !item._shiftPressed && item.fireDecoratorEvent("close-menu");
                }
            }
            else {
                this._openItemSubMenu(item);
            }
        }
        _itemKeyDown(e) {
            const isTabNextPrevious = webcomponentsBase.x(e) || webcomponentsBase.V(e);
            const isShowKey = webcomponentsBase.ko(e);
            const isSplitButton = this._opener && isInstanceOfSplitButton(this._opener);
            const item = e.target;
            if (!MenuItem.isInstanceOfMenuItem(item)) {
                return;
            }
            const isEndContentNavigation = webcomponentsBase.R(e) || webcomponentsBase.D(e);
            const shouldOpenMenu = this.isRtl ? webcomponentsBase.D(e) : webcomponentsBase.R(e);
            if (webcomponentsBase.b(e) || isTabNextPrevious || (isShowKey && isSplitButton)) {
                e.preventDefault();
            }
            if (isEndContentNavigation) {
                item._navigateToEndContent(webcomponentsBase.D(e));
            }
            if (shouldOpenMenu) {
                this._openItemSubMenu(item, false);
            }
            else if (isTabNextPrevious || (isShowKey && isSplitButton)) {
                this._close();
            }
        }
        _navigateOutOfEndContent(e) {
            const item = e.target;
            const shouldNavigateToNextItem = e.detail.shouldNavigateToNextItem;
            const menuItems = this._allMenuItems;
            const itemIndex = menuItems.indexOf(item);
            if (itemIndex > -1) {
                const nextItem = shouldNavigateToNextItem ? menuItems[itemIndex + 1] : menuItems[itemIndex - 1];
                const itemToFocus = nextItem || menuItems[itemIndex];
                itemToFocus?.focus();
                e.stopPropagation();
            }
        }
        _beforePopoverOpen(e) {
            const prevented = !this.fireDecoratorEvent("before-open", {});
            if (prevented) {
                this.open = false;
                e.preventDefault();
            }
        }
        _afterPopoverOpen() {
            this._allMenuItems[0]?.focus();
            if (this.loading) {
                InvisibleMessage.p(Menu_1.i18nBundle.getText(i18nDefaults.MENU_ITEM_LOADING));
            }
            this.fireDecoratorEvent("open");
        }
        _beforePopoverClose(e) {
            const prevented = !this.fireDecoratorEvent("before-close", { escPressed: e.detail.escPressed });
            if (prevented) {
                this.open = true;
                e.preventDefault();
            }
        }
        _afterPopoverClose() {
            this.open = false;
            this.fireDecoratorEvent("close");
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Menu.prototype, "headerText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Menu.prototype, "open", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Menu.prototype, "placement", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Menu.prototype, "horizontalAlign", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Menu.prototype, "loading", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], Menu.prototype, "loadingDelay", void 0);
    __decorate([
        webcomponentsBase.s({ converter: ResponsivePopover.e })
    ], Menu.prototype, "opener", void 0);
    __decorate([
        webcomponentsBase.d({ "default": true, type: HTMLElement, invalidateOnChildChange: true })
    ], Menu.prototype, "items", void 0);
    __decorate([
        parametersBundle_css.i("@ui5/webcomponents")
    ], Menu, "i18nBundle", void 0);
    Menu = Menu_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-menu",
            renderer: jsxRuntime.y,
            styles: menuCss,
            template: MenuTemplate,
        })
        /**
         * Fired when an item is being clicked.
         *
         * **Note:** Since 1.17.0 the event is preventable, allowing the menu to remain open after an item is pressed.
         * @param { HTMLElement } item The currently clicked menu item.
         * @param { string } text The text of the currently clicked menu item.
         * @public
         */
        ,
        eventStrict.l("item-click", {
            cancelable: true,
        })
        /**
         * Fired before the menu is opened. This event can be cancelled, which will prevent the menu from opening.
         *
         * **Note:** Since 1.14.0 the event is also fired before a sub-menu opens.
         * @public
         * @since 1.10.0
         * @param { HTMLElement } item The `ui5-menu-item` that triggers opening of the sub-menu or undefined when fired upon root menu opening.
         */
        ,
        eventStrict.l("before-open", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired after the menu is opened.
         * @public
         * @since 1.10.0
         */
        ,
        eventStrict.l("open", {
            bubbles: true,
        })
        /**
         * Fired when the menu is being closed.
         * @private
         */
        ,
        eventStrict.l("close-menu", {
            bubbles: true,
        })
        /**
         * Fired before the menu is closed. This event can be cancelled, which will prevent the menu from closing.
         * @public
         * @param {boolean} escPressed Indicates that `ESC` key has triggered the event.
         * @since 1.10.0
         */
        ,
        eventStrict.l("before-close", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired after the menu is closed.
         * @public
         * @since 1.10.0
         */
        ,
        eventStrict.l("close")
    ], Menu);
    Menu.define();
    var Menu$1 = Menu;

    return Menu$1;

}));
