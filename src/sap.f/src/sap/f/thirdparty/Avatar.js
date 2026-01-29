sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Icons'], (function (webcomponentsBase, eventStrict, parametersBundle_css$1, parametersBundle_css, Theme, Icon, i18nDefaults, Icons) { 'use strict';

    function AvatarTemplate() {
        return (parametersBundle_css.jsxs("div", { class: "ui5-avatar-root", tabindex: this.tabindex, "data-sap-focus-ref": true, role: this._role, "aria-haspopup": this._ariaHasPopup, "aria-label": this.accessibleNameText, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onClick: this._onclick, children: [this._hasImage ?
                    parametersBundle_css.jsx("slot", {})
                    : parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [this.icon && parametersBundle_css.jsx(Icon.Icon, { class: "ui5-avatar-icon", name: this.icon, accessibleName: this.accessibleName }), this.initials ? (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { class: "ui5-avatar-initials ui5-avatar-initials-hidden", children: this.validInitials }), parametersBundle_css.jsx(Icon.Icon, { name: this.fallbackIcon, class: "ui5-avatar-icon ui5-avatar-icon-fallback ui5-avatar-fallback-icon-hidden" })] })) : (
                            // Show fallback icon only
                            parametersBundle_css.jsx(Icon.Icon, { name: this.fallbackIcon, class: "ui5-avatar-icon ui5-avatar-icon-fallback" }))] }), parametersBundle_css.jsx("slot", { name: "badge" })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var AvatarCss = `:host(:not([hidden])){display:inline-block;box-sizing:border-box;position:relative;font-family:var(--sapFontFamily)}:host(:not([hidden]).ui5_hovered){opacity:.7}:host([interactive]:not([disabled])){cursor:pointer}:host([interactive]:not([hidden]):active){background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([interactive]:not([hidden]):not([disabled]):not(:active):not([focused]):hover){box-shadow:var(--ui5-v2-15-0-avatar-hover-box-shadow-offset)}:host([interactive][desktop]:not([hidden])) .ui5-avatar-root:focus,:host([interactive]:not([hidden])) .ui5-avatar-root:focus-visible{outline:var(--_ui5-v2-15-0_avatar_outline);outline-offset:var(--_ui5-v2-15-0_avatar_focus_offset)}:host([disabled]){opacity:var(--sapContent_DisabledOpacity);pointer-events:none}:host{height:3rem;width:3rem;border-radius:50%;border:var(--ui5-v2-15-0-avatar-initials-border);outline:none;color:var(--ui5-v2-15-0-avatar-initials-color)}.ui5-avatar-root{display:flex;align-items:center;justify-content:center;outline:none;height:100%;width:100%;border-radius:inherit}:host([_size="XS"]),:host([size="XS"]){height:2rem;width:2rem;min-height:2rem;min-width:2rem;font-size:var(--_ui5-v2-15-0_avatar_fontsize_XS)}:host(:not([size])),:host([_size="S"]),:host([size="S"]){min-height:3rem;min-width:3rem;font-size:var(--_ui5-v2-15-0_avatar_fontsize_S)}:host([_size="M"]),:host([size="M"]){min-height:4rem;min-width:4rem;font-size:var(--_ui5-v2-15-0_avatar_fontsize_M)}:host([_size="L"]),:host([size="L"]){min-height:5rem;min-width:5rem;font-size:var(--_ui5-v2-15-0_avatar_fontsize_L)}:host([_size="XL"]),:host([size="XL"]){min-height:7rem;min-width:7rem;font-size:var(--_ui5-v2-15-0_avatar_fontsize_XL)}:host .ui5-avatar-icon{height:var(--_ui5-v2-15-0_avatar_fontsize_S);width:var(--_ui5-v2-15-0_avatar_fontsize_S);color:inherit}:host([_size="XS"]) .ui5-avatar-icon,:host([size="XS"]) .ui5-avatar-icon{height:var(--_ui5-v2-15-0_avatar_icon_XS);width:var(--_ui5-v2-15-0_avatar_icon_XS)}:host([_size="S"]) .ui5-avatar-icon,:host([size="S"]) .ui5-avatar-icon{height:var(--_ui5-v2-15-0_avatar_icon_S);width:var(--_ui5-v2-15-0_avatar_icon_S)}:host([_size="M"]) .ui5-avatar-icon,:host([size="M"]) .ui5-avatar-icon{height:var(--_ui5-v2-15-0_avatar_icon_M);width:var(--_ui5-v2-15-0_avatar_icon_M)}:host([_size="L"]) .ui5-avatar-icon,:host([size="L"]) .ui5-avatar-icon{height:var(--_ui5-v2-15-0_avatar_icon_L);width:var(--_ui5-v2-15-0_avatar_icon_L)}:host([_size="XL"]) .ui5-avatar-icon,:host([size="XL"]) .ui5-avatar-icon{height:var(--_ui5-v2-15-0_avatar_icon_XL);width:var(--_ui5-v2-15-0_avatar_icon_XL)}::slotted(*){border-radius:50%;width:100%;height:100%;pointer-events:none}:host([shape="Square"]){border-radius:var(--ui5-v2-15-0-avatar-border-radius)}:host([shape="Square"]) ::slotted(*){border-radius:calc(var(--ui5-v2-15-0-avatar-border-radius) - var(--ui5-v2-15-0-avatar-border-radius-img-deduction))}:host(:not([color-scheme])),:host(:not([_has-image])),:host([color-scheme="Auto"]),:host([_color-scheme="Accent6"]),:host([ui5-avatar][color-scheme="Accent6"]){background-color:var(--ui5-v2-15-0-avatar-accent6);color:var(--ui5-v2-15-0-avatar-accent6-color);border-color:var(--ui5-v2-15-0-avatar-accent6-border-color)}:host([_color-scheme="Accent6"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent6"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_6_Hover_Background)}:host([_color-scheme="Accent1"]),:host([ui5-avatar][color-scheme="Accent1"]){background-color:var(--ui5-v2-15-0-avatar-accent1);color:var(--ui5-v2-15-0-avatar-accent1-color);border-color:var(--ui5-v2-15-0-avatar-accent1-border-color)}:host([_color-scheme="Accent1"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent1"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_1_Hover_Background)}:host([_color-scheme="Accent2"]),:host([ui5-avatar][color-scheme="Accent2"]){background-color:var(--ui5-v2-15-0-avatar-accent2);color:var(--ui5-v2-15-0-avatar-accent2-color);border-color:var(--ui5-v2-15-0-avatar-accent2-border-color)}:host([_color-scheme="Accent2"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent2"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_2_Hover_Background)}:host([_color-scheme="Accent3"]),:host([ui5-avatar][color-scheme="Accent3"]){background-color:var(--ui5-v2-15-0-avatar-accent3);color:var(--ui5-v2-15-0-avatar-accent3-color);border-color:var(--ui5-v2-15-0-avatar-accent3-border-color)}:host([_color-scheme="Accent3"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent3"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_3_Hover_Background)}:host([_color-scheme="Accent4"]),:host([ui5-avatar][color-scheme="Accent4"]){background-color:var(--ui5-v2-15-0-avatar-accent4);color:var(--ui5-v2-15-0-avatar-accent4-color);border-color:var(--ui5-v2-15-0-avatar-accent4-border-color)}:host([_color-scheme="Accent4"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent4"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_4_Hover_Background)}:host([_color-scheme="Accent5"]),:host([ui5-avatar][color-scheme="Accent5"]){background-color:var(--ui5-v2-15-0-avatar-accent5);color:var(--ui5-v2-15-0-avatar-accent5-color);border-color:var(--ui5-v2-15-0-avatar-accent5-border-color)}:host([_color-scheme="Accent5"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent5"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_5_Hover_Background)}:host([_color-scheme="Accent7"]),:host([ui5-avatar][color-scheme="Accent7"]){background-color:var(--ui5-v2-15-0-avatar-accent7);color:var(--ui5-v2-15-0-avatar-accent7-color);border-color:var(--ui5-v2-15-0-avatar-accent7-border-color)}:host([_color-scheme="Accent7"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent7"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_7_Hover_Background)}:host([_color-scheme="Accent8"]),:host([ui5-avatar][color-scheme="Accent8"]){background-color:var(--ui5-v2-15-0-avatar-accent8);color:var(--ui5-v2-15-0-avatar-accent8-color);border-color:var(--ui5-v2-15-0-avatar-accent8-border-color)}:host([_color-scheme="Accent8"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent8"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_8_Hover_Background)}:host([_color-scheme="Accent9"]),:host([ui5-avatar][color-scheme="Accent9"]){background-color:var(--ui5-v2-15-0-avatar-accent9);color:var(--ui5-v2-15-0-avatar-accent9-color);border-color:var(--ui5-v2-15-0-avatar-accent9-border-color)}:host([_color-scheme="Accent9"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent9"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_9_Hover_Background)}:host([_color-scheme="Accent10"]),:host([ui5-avatar][color-scheme="Accent10"]){background-color:var(--ui5-v2-15-0-avatar-accent10);color:var(--ui5-v2-15-0-avatar-accent10-color);border-color:var(--ui5-v2-15-0-avatar-accent10-border-color)}:host([_color-scheme="Accent10"][interactive]:not([hidden]):not([disabled]):not(:active):hover),:host([ui5-avatar][color-scheme="Accent10"][interactive]:not([hidden]):not([disabled]):not(:active):hover){background-color:var(--sapAvatar_10_Hover_Background)}:host([_color-scheme="Placeholder"]),:host([ui5-avatar][color-scheme="Placeholder"]){background-color:var(--ui5-v2-15-0-avatar-placeholder);color:var(--ui5-v2-15-0-avatar-placeholder-color);border-color:var(--sapAvatar_Lite_BorderColor)}:host([_color-scheme="Transparent"]),:host([ui5-avatar][color-scheme="Transparent"]){background-color:transparent;border-color:transparent}:host([_has-image]){color:var(--ui5-v2-15-0-avatar-accent10-color);border:var(--ui5-v2-15-0-avatar-optional-border);background-color:transparent}.ui5-avatar-initials{color:inherit}.ui5-avatar-icon~.ui5-avatar-initials,.ui5-avatar-icon~.ui5-avatar-icon-fallback{display:none}.ui5-avatar-fallback-icon-hidden{display:none}.ui5-avatar-initials-hidden{position:absolute;visibility:hidden;z-index:0;pointer-events:none}::slotted([slot="badge"]){position:absolute;bottom:0;right:0;width:1.125rem;height:1.125rem;font-family:var(--sapFontFamily);font-size:var(--sapFontSmallSize);color:var(--sapBackgroundColor);--_ui5-v2-15-0-tag-height: 1.125rem}:host(:not([disabled])) ::slotted([slot="badge"]){pointer-events:initial}:host([_size="L"]) ::slotted([slot="badge"]),:host([size="L"]) ::slotted([slot="badge"]){width:1.25rem;height:1.25rem;--_ui5-v2-15-0-tag-height: 1.25rem;--_ui5-v2-15-0-tag-icon-width: .875rem}:host([_size="XL"]) ::slotted([slot="badge"]),:host([size="XL"]) ::slotted([slot="badge"]){width:1.75rem;height:1.75rem;--_ui5-v2-15-0-tag-height: 1.75rem;--_ui5-v2-15-0-tag-icon-width: 1rem}:host([shape="Square"]) ::slotted([slot="badge"]){bottom:-.125rem;right:-.125rem}:host([_size="L"][shape="Square"]) ::slotted([slot="badge"]),:host([size="L"][shape="Square"]) ::slotted([slot="badge"]){bottom:-.1875rem;right:-.1875rem}:host([_size="XL"][shape="Square"]) ::slotted([slot="badge"]),:host([size="XL"][shape="Square"]) ::slotted([slot="badge"]){bottom:-.25rem;right:-.25rem}
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

    const name$1 = "employee";
    const pathData$1 = "M448 512H64V384q0-26 10-49.5t27.5-41T142 266t50-10h64q-27 0-50-10t-40.5-27.5T138 178t-10-50q0-26 10-49.5t27.5-41T206 10t50-10q26 0 49.5 10t41 27.5 27.5 41 10 49.5q0 27-10 50t-27.5 40.5-41 27.5-49.5 10h64q26 0 49.5 10t41 27.5 27.5 41 10 49.5v128zM96 384v96h320v-96q0-40-28-68t-68-28H192q-40 0-68 28t-28 68zm160-160q40 0 68-28t28-68-28-68-68-28-68 28-28 68 28 68 68 28zm32 192v-32h96v32h-96z";
    const ltr$1 = false;
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

    const name = "employee";
    const pathData = "M342 255q48 23 77 67.5t29 99.5v32q0 11-7.5 18.5T422 480H90q-11 0-18.5-7.5T64 454v-32q0-55 29-99.5t77-67.5l-4-5q-19-17-28.5-40.5T128 160q0-27 10-50t27.5-40.5 41-27.5T256 32t49.5 10.5 41 28T374 111t10 49q0 27-11 52t-31 43zm-163-95q0 32 22.5 54.5T256 237t54.5-22.5T333 160t-22.5-54.5T256 83t-54.5 22.5T179 160zm51 181l-25-15q-13-7-13-19v-6q-34 17-55.5 49T115 422v7h115v-88zm167 81q0-40-21-72t-56-49v6q0 12-13 19l-26 15v88h116v-7zm-71-70q11 0 18.5 7.5T352 378t-7.5 18-18.5 7h-12q-11 0-18.5-7t-7.5-18 7.5-18.5T314 352h12z";
    const ltr = false;
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, collection, packageName });

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
     * - [Space] / [Enter] or [Return] - Fires the `click` event if the `interactive` property is set to true.
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
    let Avatar = Avatar_1 = class Avatar extends webcomponentsBase.b {
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
             * **Note:** This property won't have effect if the `disabled`
             * property is set to `true`.
             * @default false
             * @public
             */
            this.interactive = false;
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
            return this._interactive ? "button" : "img";
        }
        get _ariaHasPopup() {
            return this._getAriaHasPopup();
        }
        get _interactive() {
            return this.interactive && !this.disabled;
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
            await Theme.f$1();
            if (this.initials && !this.icon) {
                this._checkInitials();
            }
        }
        onEnterDOM() {
            if (Theme.f()) {
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
            if (webcomponentsBase.b$1(e)) {
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
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Avatar.prototype, "disabled", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Avatar.prototype, "interactive", void 0);
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
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Avatar, "i18nBundle", void 0);
    Avatar = Avatar_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-avatar",
            languageAware: true,
            renderer: parametersBundle_css.y,
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
