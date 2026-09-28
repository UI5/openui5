sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ValueState'], (function (exports, webcomponentsBase, parametersBundle_css, Icons, Icon, ManagedStyles, parametersBundle_css$1, ValueState) { 'use strict';

    function AvatarBadgeTemplate() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: !this.invalid && (parametersBundle_css.jsx(Icon.Icon, { name: this.icon, class: "ui5-avatar-badge-icon", title: this.effectiveTooltip, mode: "Image" })) }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var AvatarBadgeCss = `:host{display:flex;align-items:center;justify-content:center;box-sizing:border-box;outline:none;border:.0625rem solid;background:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);color:var(--sapButton_Emphasized_TextColor)}:host([invalid]){display:none}:host([state="Positive"]){background:var(--sapSuccessBackground);border-color:var(--sapSuccessBorderColor);color:var(--sapPositiveTextColor)}:host([state="Critical"]){background:var(--sapWarningBackground);border-color:var(--sapWarningBorderColor);color:var(--sapCriticalTextColor)}:host([state="Negative"]){background:var(--sapErrorBackground);border-color:var(--sapErrorBorderColor);color:var(--sapNegativeTextColor)}:host([state="Information"]){background:var(--sapInformationBackground);border-color:var(--sapInformationBorderColor);color:var(--sapInformativeTextColor)}:host([color-scheme="1"][state="None"]){background:var(--sapIndicationColor_1_Background);border-color:var(--sapIndicationColor_1_BorderColor);color:var(--sapIndicationColor_1_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="2"][state="None"]){background:var(--sapIndicationColor_2_Background);border-color:var(--sapIndicationColor_2_BorderColor);color:var(--sapIndicationColor_2_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="3"][state="None"]){background:var(--sapIndicationColor_3_Background);border-color:var(--sapIndicationColor_3_BorderColor);color:var(--sapIndicationColor_3_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="4"][state="None"]){background:var(--sapIndicationColor_4_Background);border-color:var(--sapIndicationColor_4_BorderColor);color:var(--sapIndicationColor_4_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="5"][state="None"]){background:var(--sapIndicationColor_5_Background);border-color:var(--sapIndicationColor_5_BorderColor);color:var(--sapIndicationColor_5_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="6"][state="None"]){background:var(--sapIndicationColor_6_Background);border-color:var(--sapIndicationColor_6_BorderColor);color:var(--sapIndicationColor_6_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="7"][state="None"]){background:var(--sapIndicationColor_7_Background);border-color:var(--sapIndicationColor_7_BorderColor);color:var(--sapIndicationColor_7_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="8"][state="None"]){background:var(--sapIndicationColor_8_Background);border-color:var(--sapIndicationColor_8_BorderColor);color:var(--sapIndicationColor_8_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="9"][state="None"]){background:var(--sapIndicationColor_9_Background);border-color:var(--sapIndicationColor_9_BorderColor);color:var(--sapIndicationColor_9_TextColor);box-shadow:var(--sapContent_Shadow1)}:host([color-scheme="10"][state="None"]){background:var(--sapIndicationColor_10_Background);border-color:var(--sapIndicationColor_10_BorderColor);color:var(--sapIndicationColor_10_TextColor);box-shadow:var(--sapContent_Shadow1)}.ui5-avatar-badge-icon{width:var(--_ui5-avatar-badge-icon-size);height:var(--_ui5-avatar-badge-icon-size);color:inherit}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    const ICON_NOT_FOUND = "ICON_NOT_FOUND";
    /**
     * @class
     * ### Overview
     *
     * The `ui5-avatar-badge` component is used to display a badge on top of `ui5-avatar` component.
     * The badge can display an icon and supports different states for visual affordance.
     *
     * ### Usage
     *
     * The badge should be used as a child element of `ui5-avatar` in the `badge` slot.
     *
     * ```html
     * <ui5-avatar>
     *   <ui5-avatar-badge icon="edit" slot="badge"></ui5-avatar-badge>
     * </ui5-avatar>
     * ```
     *
     * ### Keyboard Handling
     *
     * The badge does not receive keyboard focus.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents/dist/AvatarBadge.js";`
     *
     * @constructor
     * @extends UI5Element
     * @since 2.19.0
     * @public
     */
    let AvatarBadge = class AvatarBadge extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines the state of the badge, which determines its styling.
             *
             * Available options:
             * - `None` (default) - Standard appearance
             * - `Positive` - Green, used for success/approved states
             * - `Critical` - Orange, used for warning states
             * - `Negative` - Red, used for error/rejected states
             * - `Information` - Blue, used for informational states
             *
             * **Note:** `state` takes precedence over `colorScheme`. When `state` is set
             * to any value other than `None`, the semantic styling applies and `colorScheme` is ignored.
             *
             * @default "None"
             * @public
             */
            this.state = ValueState.o.None;
            /**
             * @private
             */
            this.invalid = false;
        }
        async onBeforeRendering() {
            const icon = this.icon;
            if (!icon) {
                this.invalid = true;
                this.effectiveTooltip = undefined;
                return;
            }
            const iconData = Icons.D(icon) || await Icons.n(icon);
            this.invalid = !iconData || iconData === ICON_NOT_FOUND;
            if (this.invalid) {
                this.effectiveTooltip = undefined;
            }
            else if (this.tooltip) {
                // User-provided tooltip takes precedence
                this.effectiveTooltip = this.tooltip;
            }
            else if (iconData && iconData !== ICON_NOT_FOUND && iconData.accData) {
                // Use the icon's registered i18n label (e.g., message-error -> "Error")
                if (iconData.packageName) {
                    const i18nBundle = await Icons.f(iconData.packageName);
                    this.effectiveTooltip = i18nBundle.getText(iconData.accData) || undefined;
                }
                else {
                    this.effectiveTooltip = iconData.accData.defaultText || undefined;
                }
            }
            else {
                // Derive from icon name (e.g., "edit" -> "Edit")
                this.effectiveTooltip = icon.charAt(0).toUpperCase() + icon.slice(1);
            }
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], AvatarBadge.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], AvatarBadge.prototype, "tooltip", void 0);
    __decorate([
        webcomponentsBase.s()
    ], AvatarBadge.prototype, "state", void 0);
    __decorate([
        webcomponentsBase.s()
    ], AvatarBadge.prototype, "colorScheme", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], AvatarBadge.prototype, "invalid", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], AvatarBadge.prototype, "effectiveTooltip", void 0);
    AvatarBadge = __decorate([
        webcomponentsBase.m({
            tag: "ui5-avatar-badge",
            languageAware: true,
            renderer: parametersBundle_css.y,
            styles: AvatarBadgeCss,
            template: AvatarBadgeTemplate,
        })
    ], AvatarBadge);
    AvatarBadge.define();
    var AvatarBadge$1 = AvatarBadge;

    const name$3 = "person-placeholder";
    const pathData$3 = "M2 16v-4a4.016 4.016 0 0 1 2.438-3.688A3.88 3.88 0 0 1 6 8h2a3.876 3.876 0 0 1-1.563-.313 4.065 4.065 0 0 1-2.125-2.125A3.877 3.877 0 0 1 4 4 4.016 4.016 0 0 1 6.438.313C6.917.104 7.438 0 8 0a4.016 4.016 0 0 1 2.828 1.172A4.015 4.015 0 0 1 12 4c0 .563-.104 1.083-.313 1.563A4.016 4.016 0 0 1 8 8h2.001a4.016 4.016 0 0 1 2.828 1.172A4.016 4.016 0 0 1 14 11.999v4H2Zm1-4v3h10v-3c0-.833-.292-1.542-.875-2.125A2.893 2.893 0 0 0 10 9H6c-.833 0-1.542.292-2.125.875A2.893 2.893 0 0 0 3 12Zm2-8c0 .833.292 1.542.875 2.125A2.893 2.893 0 0 0 8 7c.833 0 1.542-.292 2.125-.875A2.893 2.893 0 0 0 11 4c0-.833-.292-1.542-.875-2.125A2.893 2.893 0 0 0 8 1c-.833 0-1.542.292-2.125.875A2.893 2.893 0 0 0 5 4Z";
    const ltr$3 = false;
    const viewBox$3 = "0 0 16 16";
    const collection$3 = "SAP-icons-v4";
    const packageName$3 = "@ui5/webcomponents-icons";

    Icons.y(name$3, { pathData: pathData$3, ltr: ltr$3, viewBox: viewBox$3, collection: collection$3, packageName: packageName$3 });

    const name$2 = "person-placeholder";
    const pathData$2 = "M8 1a4 4 0 0 1 2.616 7.023C12.61 8.931 14 10.927 14 13.25v1a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75v-1c0-2.323 1.39-4.319 3.383-5.227A4 4 0 0 1 8 1Zm-.001 8C5.372 9 3.5 10.911 3.5 13.25v.25h9v-.25C12.5 10.911 10.686 9 7.999 9ZM8 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z";
    const ltr$2 = false;
    const viewBox$2 = "0 0 16 16";
    const collection$2 = "SAP-icons-v5";
    const packageName$2 = "@ui5/webcomponents-icons";

    Icons.y(name$2, { pathData: pathData$2, ltr: ltr$2, viewBox: viewBox$2, collection: collection$2, packageName: packageName$2 });

    var personPlaceholder = "person-placeholder";

    const name$1 = "user-settings";
    const pathData$1 = "M16 16H6v-2c0-.563.104-1.083.313-1.563a4.065 4.065 0 0 1 2.125-2.124c.479-.209 1-.313 1.562-.313h1c-.896 0-1.62-.281-2.172-.844C8.276 8.594 8 7.875 8 7c0-.27.01-.417.031-.438a2.97 2.97 0 0 1 .844-1.687 2.97 2.97 0 0 1 1.688-.844c.02-.02.166-.031.437-.031.875 0 1.594.276 2.156.828C13.72 5.38 14 6.104 14 7c0 .833-.292 1.542-.875 2.125A2.893 2.893 0 0 1 11 10h1a4.015 4.015 0 0 1 3.688 2.438c.208.479.312 1 .312 1.562v2ZM0 7c0-.292.094-.531.281-.719A.973.973 0 0 1 1 6h.875c.042-.167.099-.323.172-.469.073-.146.14-.291.203-.437l-.625-.625a1.043 1.043 0 0 1-.281-.719c0-.27.093-.5.281-.688l1.438-1.437a.935.935 0 0 1 .687-.281c.292 0 .531.093.719.281l.625.625c.146-.063.291-.13.437-.203.146-.073.302-.13.469-.172V1c0-.292.094-.531.281-.719A.973.973 0 0 1 7 0h2c.292 0 .531.094.719.281A.973.973 0 0 1 10 1v.875c.167.042.323.099.469.172.146.073.291.14.437.203l.625-.625a.974.974 0 0 1 .719-.281c.27 0 .5.093.688.281l1.437 1.438a.935.935 0 0 1 .281.687c0 .27-.094.51-.281.719l-.188.156-.312-.375a1.992 1.992 0 0 0-.375-.344l.156-.156-1.406-1.406-.719.719a4.97 4.97 0 0 0-.265-.047A1.917 1.917 0 0 0 11 3a4.517 4.517 0 0 0-.75.063c-.02-.021-.063-.032-.125-.032a2.819 2.819 0 0 0-.203-.094l-.235-.093L9 2.594V1H7v1.594l-.688.25a.555.555 0 0 1-.156.047.28.28 0 0 0-.156.078l-.469.187-.625.313L3.75 2.344 2.344 3.75l1.125 1.156-.313.625c-.062.125-.12.255-.172.39a9.185 9.185 0 0 0-.14.391L2.594 7H1v2h1.594l.25.688c.02.041.041.093.062.156.021.062.042.114.063.156 0 .042.02.083.062.125a3.134 3.134 0 0 0 .125.313l.313.656-1.125 1.156 1.406 1.406L4.906 12.5l.282.156c-.105.375-.167.76-.188 1.156l-.531.563a.973.973 0 0 1-.719.281.94.94 0 0 1-.688-.281l-1.437-1.438a.954.954 0 0 1-.281-.703c0-.28.093-.515.281-.703l.625-.625a8.179 8.179 0 0 0-.203-.437A2.282 2.282 0 0 1 1.875 10H1a.947.947 0 0 1-.719-.297A.988.988 0 0 1 0 9V7Zm15 8v-1c0-.833-.292-1.542-.875-2.125A2.893 2.893 0 0 0 12 11h-2c-.833 0-1.542.292-2.125.875A2.893 2.893 0 0 0 7 14v1h8ZM9 7c0 .563.193 1.036.578 1.422.386.385.86.578 1.422.578a1.92 1.92 0 0 0 1.406-.594A1.92 1.92 0 0 0 13 7c0-.563-.193-1.036-.578-1.422A1.933 1.933 0 0 0 11 5a1.92 1.92 0 0 0-1.406.594A1.922 1.922 0 0 0 9 7ZM5 8.156c0-.729.167-1.349.5-1.86.333-.51.833-.89 1.5-1.14l.25-.062a6 6 0 0 1 .281-.063 3.739 3.739 0 0 0-.438 1.031.133.133 0 0 1-.015.063.218.218 0 0 0-.016.094c-.02 0-.03.005-.03.015 0 .01-.011.016-.032.016l-.375.281c-.23.23-.39.453-.484.672A2.02 2.02 0 0 0 6 8c0 .083.005.167.016.25.01.083.026.177.046.281.167.521.48.917.938 1.188l.125.062.125.063A.553.553 0 0 0 7 10a7.495 7.495 0 0 0-.594.531.832.832 0 0 1-.218-.156A1.237 1.237 0 0 0 6 10.219 1.09 1.09 0 0 1 5.781 10c-.27-.313-.458-.594-.562-.844-.104-.25-.177-.583-.219-1Z";
    const ltr$1 = false;
    const viewBox$1 = "0 0 16 16";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

    const name = "user-settings";
    const pathData = "M12 8a.75.75 0 0 1 .75.75v.348c.426.11.816.308 1.146.578l.43-.294a.75.75 0 0 1 .849 1.236l-.39.268c.156.392.234.834.21 1.277l.437.11a.75.75 0 1 1-.364 1.454l-.53-.132a3.032 3.032 0 0 1-.717.785l.303.454a.75.75 0 1 1-1.248.832l-.464-.695a3.08 3.08 0 0 1-.825 0l-.463.695a.75.75 0 1 1-1.248-.832l.302-.454a3.011 3.011 0 0 1-.716-.785l-.53.132a.75.75 0 0 1-.364-1.454l.436-.11c-.024-.445.055-.89.214-1.283l-.384-.256a.75.75 0 0 1 .832-1.248l.442.295c.33-.268.718-.464 1.142-.573V8.75A.75.75 0 0 1 12 8ZM6 0a4 4 0 0 1 .355 7.983C6.137 8 5.981 8 5.798 8 3.418 8 1.5 9.911 1.5 12.25v.25h3.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75v-1c0-2.323 1.39-4.319 3.383-5.227A4 4 0 0 1 6 0Zm6 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm-6-9a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z";
    const ltr = false;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, viewBox, collection, packageName });

    var userSettings = "user-settings";

    exports.AvatarBadge = AvatarBadge$1;
    exports.personPlaceholder = personPlaceholder;
    exports.userSettings = userSettings;

}));
