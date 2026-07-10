sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Icons'], (function (webcomponentsBase, eventStrict, parametersBundle_css, jsxRuntime, Theme, Icon, i18nDefaults, Icons) { 'use strict';

    function AvatarTemplate() {
        return (jsxRuntime.jsxs("div", { class: "ui5-avatar-root", tabindex: this.tabindex, "data-sap-focus-ref": true, role: this._role, "aria-hidden": this.effectiveAriaHidden, "aria-haspopup": this._ariaHasPopup, "aria-label": this.accessibleNameText, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onClick: this._onclick, children: [this._hasImage ?
                    jsxRuntime.jsx("slot", {})
                    : jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [this.icon && jsxRuntime.jsx(Icon.Icon, { class: "ui5-avatar-icon", name: this.icon, accessibleName: this.accessibleName }), this.initials ? (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("span", { class: "ui5-avatar-initials ui5-avatar-initials-hidden", children: this.validInitials }), jsxRuntime.jsx(Icon.Icon, { name: this.fallbackIcon, class: "ui5-avatar-icon ui5-avatar-icon-fallback ui5-avatar-fallback-icon-hidden" })] })) : (
                            // Show fallback icon only
                            jsxRuntime.jsx(Icon.Icon, { name: this.fallbackIcon, class: "ui5-avatar-icon ui5-avatar-icon-fallback" }))] }), jsxRuntime.jsx("slot", { name: "badge" })] }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var AvatarCss = `:host(:not([hidden])){display:inline-block;box-sizing:border-box;position:relative;font-family:var(--sapFontFamily)}:host(:not([hidden]).ui5_hovered){opacity:.7}:host([interactive]:not([disabled])),:host([mode="Interactive"]:not([disabled])){cursor:pointer}:host([interactive]:not([hidden]):active),:host([mode="Interactive"]:not([hidden]):active){background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([interactive]:not([hidden]):not([disabled]):not(:active):not([focused]):hover),:host([mode="Interactive"]:not([hidden]):not([disabled]):not(:active):not([focused]):hover){box-shadow:var(--ui5-avatar-hover-box-shadow-offset)}:host([interactive][desktop]:not([hidden])) .ui5-avatar-root:focus,:host([interactive]:not([hidden])) .ui5-avatar-root:focus-visible,:host([mode="Interactive"][desktop]:not([hidden])) .ui5-avatar-root:focus,:host([mode="Interactive"]:not([hidden])) .ui5-avatar-root:focus-visible{outline:var(--_ui5_avatar_outline);outline-offset:var(--_ui5_avatar_focus_offset)}:host([disabled]){opacity:var(--sapContent_DisabledOpacity);pointer-events:none}:host{height:3rem;width:3rem;border-radius:50%;border:var(--ui5-avatar-initials-border);outline:none;color:var(--ui5-avatar-initials-color)}.ui5-avatar-root{display:flex;align-items:center;justify-content:center;outline:none;height:100%;width:100%;border-radius:inherit}:host([size="XS"]){height:2rem;width:2rem;min-height:2rem;min-width:2rem;font-size:var(--_ui5_avatar_fontsize_XS)}:host(:not([size])),:host([size="S"]){min-height:3rem;min-width:3rem;font-size:var(--_ui5_avatar_fontsize_S)}:host([size="M"]){min-height:4rem;min-width:4rem;font-size:var(--_ui5_avatar_fontsize_M)}:host([size="L"]){min-height:5rem;min-width:5rem;font-size:var(--_ui5_avatar_fontsize_L)}:host([size="XL"]){min-height:7rem;min-width:7rem;font-size:var(--_ui5_avatar_fontsize_XL)}:host .ui5-avatar-icon{height:var(--_ui5_avatar_fontsize_S);width:var(--_ui5_avatar_fontsize_S);color:inherit}:host([size="XS"]) .ui5-avatar-icon{height:var(--_ui5_avatar_icon_XS);width:var(--_ui5_avatar_icon_XS)}:host([size="S"]) .ui5-avatar-icon{height:var(--_ui5_avatar_icon_S);width:var(--_ui5_avatar_icon_S)}:host([size="M"]) .ui5-avatar-icon{height:var(--_ui5_avatar_icon_M);width:var(--_ui5_avatar_icon_M)}:host([size="L"]) .ui5-avatar-icon{height:var(--_ui5_avatar_icon_L);width:var(--_ui5_avatar_icon_L)}:host([size="XL"]) .ui5-avatar-icon{height:var(--_ui5_avatar_icon_XL);width:var(--_ui5_avatar_icon_XL)}::slotted(*){border-radius:50%;width:100%;height:100%;pointer-events:none}:host([shape="Square"]){border-radius:var(--ui5-avatar-border-radius)}:host([shape="Square"]) ::slotted(*){border-radius:calc(var(--ui5-avatar-border-radius) - var(--ui5-avatar-border-radius-img-deduction))}:host(:not([color-scheme])),:host(:not([_has-image])),:host([color-scheme="Auto"]),:host([_color-scheme="Accent6"]),:host([ui5-avatar][color-scheme="Accent6"]){background-color:var(--ui5-avatar-accent6);color:var(--ui5-avatar-accent6-color);border-color:var(--ui5-avatar-accent6-border-color)}:host([_color-scheme="Accent6"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent6"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent6"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent6"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_6_Hover_Background)}:host([_color-scheme="Accent1"]),:host([ui5-avatar][color-scheme="Accent1"]){background-color:var(--ui5-avatar-accent1);color:var(--ui5-avatar-accent1-color);border-color:var(--ui5-avatar-accent1-border-color)}:host([_color-scheme="Accent1"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent1"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent1"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent1"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_1_Hover_Background)}:host([_color-scheme="Accent2"]),:host([ui5-avatar][color-scheme="Accent2"]){background-color:var(--ui5-avatar-accent2);color:var(--ui5-avatar-accent2-color);border-color:var(--ui5-avatar-accent2-border-color)}:host([_color-scheme="Accent2"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent2"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent2"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent2"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_2_Hover_Background)}:host([_color-scheme="Accent3"]),:host([ui5-avatar][color-scheme="Accent3"]){background-color:var(--ui5-avatar-accent3);color:var(--ui5-avatar-accent3-color);border-color:var(--ui5-avatar-accent3-border-color)}:host([_color-scheme="Accent3"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent3"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent3"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent3"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_3_Hover_Background)}:host([_color-scheme="Accent4"]),:host([ui5-avatar][color-scheme="Accent4"]){background-color:var(--ui5-avatar-accent4);color:var(--ui5-avatar-accent4-color);border-color:var(--ui5-avatar-accent4-border-color)}:host([_color-scheme="Accent4"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent4"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent4"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent4"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_4_Hover_Background)}:host([_color-scheme="Accent5"]),:host([ui5-avatar][color-scheme="Accent5"]){background-color:var(--ui5-avatar-accent5);color:var(--ui5-avatar-accent5-color);border-color:var(--ui5-avatar-accent5-border-color)}:host([_color-scheme="Accent5"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent5"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent5"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent5"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_5_Hover_Background)}:host([_color-scheme="Accent7"]),:host([ui5-avatar][color-scheme="Accent7"]){background-color:var(--ui5-avatar-accent7);color:var(--ui5-avatar-accent7-color);border-color:var(--ui5-avatar-accent7-border-color)}:host([_color-scheme="Accent7"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent7"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent7"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent7"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_7_Hover_Background)}:host([_color-scheme="Accent8"]),:host([ui5-avatar][color-scheme="Accent8"]){background-color:var(--ui5-avatar-accent8);color:var(--ui5-avatar-accent8-color);border-color:var(--ui5-avatar-accent8-border-color)}:host([_color-scheme="Accent8"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent8"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent8"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent8"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_8_Hover_Background)}:host([_color-scheme="Accent9"]),:host([ui5-avatar][color-scheme="Accent9"]){background-color:var(--ui5-avatar-accent9);color:var(--ui5-avatar-accent9-color);border-color:var(--ui5-avatar-accent9-border-color)}:host([_color-scheme="Accent9"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent9"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent9"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent9"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_9_Hover_Background)}:host([_color-scheme="Accent10"]),:host([ui5-avatar][color-scheme="Accent10"]){background-color:var(--ui5-avatar-accent10);color:var(--ui5-avatar-accent10-color);border-color:var(--ui5-avatar-accent10-border-color)}:host([_color-scheme="Accent10"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent10"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([_color-scheme="Accent10"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent10"][mode="Interactive"]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_10_Hover_Background)}:host([_color-scheme="Placeholder"]),:host([ui5-avatar][color-scheme="Placeholder"]){background-color:var(--ui5-avatar-placeholder);color:var(--ui5-avatar-placeholder-color);border-color:var(--sapAvatar_Lite_BorderColor)}:host([_color-scheme="Transparent"]),:host([ui5-avatar][color-scheme="Transparent"]){background-color:transparent;border-color:transparent}:host([_has-image]){color:var(--ui5-avatar-accent10-color);border:var(--ui5-avatar-optional-border);background-color:transparent}.ui5-avatar-initials{color:inherit}.ui5-avatar-icon~.ui5-avatar-initials,.ui5-avatar-icon~.ui5-avatar-icon-fallback{display:none}.ui5-avatar-fallback-icon-hidden{display:none}.ui5-avatar-initials-hidden{position:absolute;visibility:hidden;z-index:0;pointer-events:none}::slotted([slot="badge"]){position:absolute;inset-block-end:0;inset-inline-end:0;width:1.125rem;height:1.125rem;font-family:var(--sapFontFamily);font-size:var(--sapFontSmallSize);--_ui5-avatar-badge-icon-size: .75rem}:host(:not([disabled])) ::slotted([slot="badge"]){pointer-events:initial}:host([size="L"]) ::slotted([slot="badge"]){width:1.25rem;height:1.25rem;--_ui5-avatar-badge-icon-size: .875rem}:host([size="XL"]) ::slotted([slot="badge"]){width:1.75rem;height:1.75rem;--_ui5-avatar-badge-icon-size: 1rem}:host([shape="Square"]) ::slotted([slot="badge"]){border-radius:50%}:host([shape="Square"]) ::slotted([slot="badge"]){inset-block-end:-.125rem;inset-inline-end:-.125rem}:host([size="L"][shape="Square"]) ::slotted([slot="badge"]){inset-block-end:-.1875rem;inset-inline-end:-.1875rem}:host([size="XL"][shape="Square"]) ::slotted([slot="badge"]){inset-block-end:-.25rem;inset-inline-end:-.25rem}
`;

    /**
     * Different types of AvatarSize.
     * @public
     */
    var AvatarSize;
    (function (AvatarSize) {
        /**
         * component size - 2rem
         * font size - 1rem
         * @public
         */
        AvatarSize["XS"] = "XS";
        /**
         * component size - 3rem
         * font size - 1.5rem
         * @public
         */
        AvatarSize["S"] = "S";
        /**
         * component size - 4rem
         * font size - 2rem
         * @public
         */
        AvatarSize["M"] = "M";
        /**
         * component size - 5rem
         * font size - 2.5rem
         * @public
         */
        AvatarSize["L"] = "L";
        /**
         * component size - 7rem
         * font size - 3rem
         * @public
         */
        AvatarSize["XL"] = "XL";
    })(AvatarSize || (AvatarSize = {}));
    var AvatarSize$1 = AvatarSize;

    /**
     * Different Avatar modes.
     * @public
     * @since 2.20.0
     */
    var AvatarMode;
    (function (AvatarMode) {
        /**
         * Image mode (by default).
         * Configures the component to internally render role="img".
         * @public
         */
        AvatarMode["Image"] = "Image";
        /**
         * Decorative mode.
         * Configures the component to internally render role="presentation" and aria-hidden="true",
         * making it purely decorative without semantic content or interactivity.
         * @public
         */
        AvatarMode["Decorative"] = "Decorative";
        /**
         * Interactive mode.
         * Configures the component to internally render role="button".
         * This mode also supports focus and enables keyboard interaction.
         * @public
         */
        AvatarMode["Interactive"] = "Interactive";
    })(AvatarMode || (AvatarMode = {}));
    var AvatarMode$1 = AvatarMode;

    const name$1 = "employee";
    const pathData$1 = "M14 16.016H2v-4a4.016 4.016 0 0 1 2.438-3.688A3.88 3.88 0 0 1 6 8.016h2a3.876 3.876 0 0 1-1.563-.313 4.065 4.065 0 0 1-2.125-2.125C4.104 5.1 4 4.578 4 4.016A4.016 4.016 0 0 1 6.438.329C6.917.12 7.438.015 8 .015a4.016 4.016 0 0 1 2.828 1.172A4.015 4.015 0 0 1 12 4.016c0 .562-.104 1.083-.313 1.562A4.016 4.016 0 0 1 8 8.016h2.001a4.016 4.016 0 0 1 2.828 1.172A4.016 4.016 0 0 1 14 12.016v4Zm-11-4v3h10v-3c0-.833-.292-1.542-.875-2.125A2.893 2.893 0 0 0 10 9.016H6c-.833 0-1.542.292-2.125.875A2.893 2.893 0 0 0 3 12.016Zm5-5c.833 0 1.542-.292 2.125-.875A2.893 2.893 0 0 0 11 4.016c0-.833-.292-1.542-.875-2.125A2.893 2.893 0 0 0 8 1.016c-.833 0-1.542.292-2.125.875A2.893 2.893 0 0 0 5 4.016c0 .833.292 1.542.875 2.125A2.893 2.893 0 0 0 8 7.016Zm1 6v-1h3v1H9Z";
    const ltr$1 = false;
    const viewBox$1 = "0 0 16 17";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

    const name = "employee";
    const pathData = "M8 1a4 4 0 0 1 2.616 7.023C12.61 8.931 14 10.927 14 13.25v1a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75v-1c0-2.323 1.39-4.319 3.383-5.227A4 4 0 0 1 8 1ZM6.034 9.375C4.54 10.042 3.5 11.53 3.5 13.25v.25h3.75v-2.797l-.848-.444a.75.75 0 0 1-.368-.884Zm3.93 0c.031.099.044.203.031.309a.75.75 0 0 1-.397.575l-.848.444V13.5h3.75v-.25c0-1.72-1.04-3.208-2.535-3.875ZM10.25 11a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5h.5ZM8 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z";
    const ltr = false;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, viewBox, collection, packageName });

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Avatar_1;
    /**
     * @class
     * ### Overview
     *
     * An image-like component that has different display options for representing images and icons
     * in different shapes and sizes, depending on the use case.
     *
     * The shape can be circular or square. There are several predefined sizes, as well as an option to
     * set a custom size.
     *
     * ### Keyboard Handling
     *
     * - [Space] / [Enter] or [Return] - Fires the `click` event if the `mode` is set to `Interactive` or the deprecated `interactive` property is set to true.
     * - [Shift] - If [Space] is pressed, pressing [Shift] releases the component without triggering the click event.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents/dist/Avatar.js";`
     * @constructor
     * @extends UI5Element
     * @since 1.0.0-rc.6
     * @implements {IAvatarGroupItem}
     * @public
     */
    let Avatar = Avatar_1 = class Avatar extends webcomponentsBase.S {
        constructor() {
            super();
            /**
             * Defines whether the component is disabled.
             * A disabled component can't be pressed or
             * focused, and it is not in the tab chain.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * Defines if the avatar is interactive (focusable and pressable).
             *
             * **Note:** When set to `true`, this property takes precedence over the `mode` property,
             * and the avatar will be rendered as interactive (role="button", focusable) regardless of the `mode` value.
             *
             * **Note:** This property won't have effect if the `disabled`
             * property is set to `true`.
             * @default false
             * @public
             * @deprecated Set `mode="Interactive"` instead for the same functionality with proper accessibility.
             */
            this.interactive = false;
            /**
             * Defines the mode of the component.
             *
             * **Note:**
             * - `Image` (default) - renders with role="img"
             * - `Decorative` - renders with role="presentation" and aria-hidden="true", making it purely decorative
             * - `Interactive` - renders with role="button", focusable (tabindex="0"), and supports keyboard interaction
             *
             * **Note:** This property is ignored when the `interactive` property is set to `true`.
             * In that case, the avatar will always be rendered as interactive.
             * @default "Image"
             * @public
             * @since 2.20
             */
            this.mode = "Image";
            /**
             * Defines the name of the fallback icon, which should be displayed in the following cases:
             *
             * 	- If the initials are not valid (more than 3 letters, unsupported languages or empty initials).
             * 	- If there are three initials and they do not fit in the shape (e.g. WWW for some of the sizes).
             * 	- If the image src is wrong.
             *
             * **Note:** If not set, a default fallback icon "employee" is displayed.
             *
             * **Note:** You should import the desired icon first, then use its name as "fallback-icon".
             *
             * `import "@ui5/webcomponents-icons/dist/{icon_name}.js"`
             *
             * `<ui5-avatar fallback-icon="alert">`
             *
             * See all the available icons in the [Icon Explorer](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html).
             * @default "employee"
             * @public
             */
            this.fallbackIcon = "employee";
            /**
             * Defines the shape of the component.
             * @default "Circle"
             * @public
             */
            this.shape = "Circle";
            /**
             * Defines predefined size of the component.
             * @default "S"
             * @public
             */
            this.size = "S";
            /**
             * Defines the background color of the desired image.
             * If `colorScheme` is set to `Auto`, the avatar will be displayed with the `Accent6` color.
             *
             * @default "Auto"
             * @public
             */
            this.colorScheme = "Auto";
            /**
             * @private
             */
            this._colorScheme = "Auto";
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following field is supported:
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
             * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
             *
             * @public
             * @since 2.0.0
             * @default {}
             */
            this.accessibilityAttributes = {};
            /**
             * @private
             */
            this._hasImage = false;
            /**
             * @private
             */
            this._imageLoadError = false;
            this._handleResizeBound = this.handleResize.bind(this);
            this._onImageLoadBound = this._onImageLoad.bind(this);
            this._onImageErrorBound = this._onImageError.bind(this);
        }
        onBeforeRendering() {
            this._attachImageEventHandlers();
            this._hasImage = this.hasImage;
        }
        get tabindex() {
            if (this.forcedTabIndex) {
                return parseInt(this.forcedTabIndex);
            }
            return this._interactive ? 0 : undefined;
        }
        /**
         * Returns the effective avatar size.
         * @default "S"
         * @private
         */
        get effectiveSize() {
            // we read the attribute, because the "size" property will always have a default value
            return this.getAttribute("size") || AvatarSize$1.S;
        }
        /**
         * Returns the effective background color.
         * @default "Auto"
         * @private
         */
        get effectiveBackgroundColor() {
            // we read the attribute, because the "background-color" property will always have a default value
            return this.getAttribute("color-scheme") || this._colorScheme;
        }
        get _role() {
            if (this._interactive) {
                return "button";
            }
            if (this.mode === AvatarMode$1.Decorative) {
                return "presentation";
            }
            return "img";
        }
        get effectiveAriaHidden() {
            // interactive property takes precedence - never hidden when interactive
            if (this.interactive) {
                return undefined;
            }
            return this.mode === AvatarMode$1.Decorative ? "true" : undefined;
        }
        get _ariaHasPopup() {
            return this._getAriaHasPopup();
        }
        get _interactive() {
            return (this.interactive || this.mode === AvatarMode$1.Interactive) && !this.disabled;
        }
        get validInitials() {
            // initials should consist of only 1,2 or 3 latin letters
            const validInitials = /^[a-zA-Zà-üÀ-Ü]{1,3}$/, areInitialsValid = this.initials && validInitials.test(this.initials);
            if (areInitialsValid) {
                return this.initials;
            }
            return null;
        }
        get accessibleNameText() {
            if (this.accessibleName) {
                return this.accessibleName;
            }
            const defaultLabel = Avatar_1.i18nBundle.getText(i18nDefaults.AVATAR_TOOLTIP);
            return this.initials ? `${defaultLabel} ${this.initials}`.trim() : defaultLabel;
        }
        get hasImage() {
            return !!this.image.length && !this._imageLoadError;
        }
        get imageEl() {
            return this.image?.[0] instanceof HTMLImageElement ? this.image[0] : null;
        }
        get initialsContainer() {
            return this.getDomRef().querySelector(".ui5-avatar-initials");
        }
        get fallBackIconDomRef() {
            return this.getDomRef().querySelector(".ui5-avatar-icon-fallback");
        }
        async onAfterRendering() {
            await Theme.w();
            if (this.initials && !this.icon) {
                this._checkInitials();
            }
        }
        onEnterDOM() {
            if (Theme.f$1()) {
                this.setAttribute("desktop", "");
            }
            this.initialsContainer && webcomponentsBase.f.register(this.initialsContainer, this._handleResizeBound);
        }
        onExitDOM() {
            this.initialsContainer && webcomponentsBase.f.deregister(this.initialsContainer, this._handleResizeBound);
            this._detachImageEventHandlers();
        }
        handleResize() {
            if (this.initials && !this.icon) {
                this._checkInitials();
            }
        }
        _checkInitials() {
            const avatar = this.getDomRef();
            const avatarInitials = avatar.querySelector(".ui5-avatar-initials");
            const validInitials = this.validInitials && avatarInitials && avatarInitials.scrollWidth <= avatar.scrollWidth;
            if (validInitials) {
                this.showInitials();
                return;
            }
            this.showFallbackIcon();
        }
        showFallbackIcon() {
            this.initialsContainer?.classList.add("ui5-avatar-initials-hidden");
            this.fallBackIconDomRef?.classList.remove("ui5-avatar-fallback-icon-hidden");
        }
        showInitials() {
            this.initialsContainer?.classList.remove("ui5-avatar-initials-hidden");
            this.fallBackIconDomRef?.classList.add("ui5-avatar-fallback-icon-hidden");
        }
        _onclick(e) {
            e.stopPropagation();
            this._fireClick();
        }
        _onkeydown(e) {
            if (!this._interactive) {
                return;
            }
            if (webcomponentsBase.b(e)) {
                this._fireClick();
            }
            if (webcomponentsBase.A(e)) {
                e.preventDefault(); // prevent scrolling
            }
        }
        _onkeyup(e) {
            if (this._interactive && !e.shiftKey && webcomponentsBase.A(e)) {
                this._fireClick();
            }
        }
        _fireClick() {
            this.fireDecoratorEvent("click");
        }
        _getAriaHasPopup() {
            const ariaHaspopup = this.accessibilityAttributes.hasPopup;
            // aria-haspopup only applies when avatar is interactive
            if (!this._interactive || !ariaHaspopup) {
                return;
            }
            return ariaHaspopup;
        }
        _attachImageEventHandlers() {
            const imgEl = this.imageEl;
            if (!imgEl) {
                this._imageLoadError = false;
                return;
            }
            // Remove previous handlers to avoid duplicates
            imgEl.removeEventListener("load", this._onImageLoadBound);
            imgEl.removeEventListener("error", this._onImageErrorBound);
            // Attach new handlers
            imgEl.addEventListener("load", this._onImageLoadBound);
            imgEl.addEventListener("error", this._onImageErrorBound);
            // Check existing image state
            this._checkExistingImageState();
        }
        _checkExistingImageState() {
            const imgEl = this.imageEl;
            if (!imgEl) {
                this._imageLoadError = false;
                return;
            }
            if (imgEl.complete && imgEl.naturalWidth === 0) {
                this._imageLoadError = true; // Already broken
            }
            else if (imgEl.complete && imgEl.naturalWidth > 0) {
                this._imageLoadError = false; // Already loaded
            }
            else {
                this._imageLoadError = false; // Pending load
            }
        }
        _detachImageEventHandlers() {
            const imgEl = this.imageEl;
            if (!imgEl) {
                return;
            }
            imgEl.removeEventListener("load", this._onImageLoadBound);
            imgEl.removeEventListener("error", this._onImageErrorBound);
        }
        _onImageLoad(e) {
            if (e.target !== this.imageEl) {
                e.target?.removeEventListener("load", this._onImageLoadBound);
                return;
            }
            this._imageLoadError = false;
        }
        _onImageError(e) {
            if (e.target !== this.imageEl) {
                e.target?.removeEventListener("error", this._onImageErrorBound);
                return;
            }
            this._imageLoadError = true;
        }
        get accessibilityInfo() {
            if (this.mode === AvatarMode$1.Decorative) {
                return {};
            }
            return {
                role: this._role,
                type: this._interactive ? Avatar_1.i18nBundle.getText(i18nDefaults.AVATAR_TYPE_BUTTON) : Avatar_1.i18nBundle.getText(i18nDefaults.AVATAR_TYPE_IMAGE),
                description: this.accessibleNameText,
                disabled: this.disabled,
            };
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Avatar.prototype, "disabled", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Avatar.prototype, "interactive", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "mode", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "fallbackIcon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "initials", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "shape", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "size", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "colorScheme", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "_colorScheme", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Avatar.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], Avatar.prototype, "accessibilityAttributes", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Avatar.prototype, "forcedTabIndex", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Avatar.prototype, "_hasImage", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Avatar.prototype, "_imageLoadError", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], Avatar.prototype, "image", void 0);
    __decorate([
        webcomponentsBase.d()
    ], Avatar.prototype, "badge", void 0);
    __decorate([
        parametersBundle_css.i("@ui5/webcomponents")
    ], Avatar, "i18nBundle", void 0);
    Avatar = Avatar_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-avatar",
            languageAware: true,
            renderer: jsxRuntime.y,
            styles: AvatarCss,
            template: AvatarTemplate,
        })
        /**
         * Fired on mouseup, space and enter if avatar is interactive
         *
         * **Note:** The event will not be fired if the `disabled`
         * property is set to `true`.
         * @public
         * @since 2.11.0
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
        })
    ], Avatar);
    Avatar.define();
    var Avatar$1 = Avatar;

    return Avatar$1;

}));
