sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/i18n-defaults2'], (function (exports, webcomponentsBase, eventStrict, jsxRuntime, parametersBundle_css, willShowContent, Theme, Icons, decline, Icon, i18nDefaults) { 'use strict';

    const name$1 = "sys-help-2";
    const pathData$1 = "M8 0c1.104 0 2.14.208 3.11.625a8.215 8.215 0 0 1 2.546 1.703 7.852 7.852 0 0 1 1.719 2.547c.417.98.625 2.02.625 3.125 0 1.104-.208 2.14-.625 3.11a8.082 8.082 0 0 1-1.719 2.546 8.082 8.082 0 0 1-2.547 1.719A7.785 7.785 0 0 1 8 16a7.897 7.897 0 0 1-3.125-.625 7.852 7.852 0 0 1-2.547-1.719A8.215 8.215 0 0 1 .625 11.11 7.786 7.786 0 0 1 0 8c0-1.104.208-2.146.625-3.125a7.977 7.977 0 0 1 1.703-2.547A7.977 7.977 0 0 1 4.875.625 7.897 7.897 0 0 1 8 0Zm-.156 13.281c.312 0 .583-.114.812-.344.23-.229.344-.5.344-.812a1.06 1.06 0 0 0-.344-.797A1.136 1.136 0 0 0 7.844 11c-.313 0-.578.11-.797.328a1.085 1.085 0 0 0-.328.797c0 .313.11.583.328.813.219.229.484.343.797.343ZM11 5.812c0-.666-.281-1.26-.844-1.78-.562-.522-1.364-.782-2.406-.782-.958 0-1.714.25-2.266.75s-.859 1.115-.921 1.844h1.625c.104-.5.286-.839.546-1.016.26-.177.63-.266 1.11-.266.479 0 .843.13 1.093.391.25.26.376.547.376.86 0 .208-.027.354-.079.437-.052.083-.192.24-.421.469l-.626.531c-.312.25-.552.469-.718.656-.167.188-.287.38-.36.578-.073.198-.12.417-.14.657-.021.24-.032.526-.032.859H8.5c0-.25.005-.448.016-.594.01-.146.041-.276.093-.39a1.12 1.12 0 0 1 .235-.329c.104-.104.26-.24.469-.406l.843-.781.5-.563.281-.5.063-.625Z";
    const ltr$1 = true;
    const viewBox$1 = "0 0 16 16";
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

    const name = "sys-help-2";
    const pathData = "M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm0 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm.2-8A3.194 3.194 0 0 0 5 6.2a1 1 0 0 0 1.995.103C6.995 5.619 7.443 5 8.2 5c.668 0 1.2.533 1.2 1.2 0 .41-.136.684-.322.859-.19.179-.528.341-1.078.341a1 1 0 0 0-.995.898S7 8.448 7 9a1 1 0 0 0 1.956.291 3.214 3.214 0 0 0 1.491-.774c.64-.6.953-1.428.953-2.317C11.4 4.428 9.972 3 8.2 3Z";
    const ltr = true;
    const viewBox = "0 0 16 16";
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, viewBox, collection, packageName });

    /**
     * Defines tag design types.
     * @public
     */
    var TagDesign;
    (function (TagDesign) {
        /**
         * Set1 of generic indication colors that are intended for industry-specific use cases
         * @public
         */
        TagDesign["Set1"] = "Set1";
        /**
         * Set2 of generic indication colors that are intended for industry-specific use cases
         * @public
         */
        TagDesign["Set2"] = "Set2";
        /**
         * Neutral design
         * @public
         */
        TagDesign["Neutral"] = "Neutral";
        /**
         * Information design
         * @public
         */
        TagDesign["Information"] = "Information";
        /**
         * Positive design
         * @public
         */
        TagDesign["Positive"] = "Positive";
        /**
         * Negative design
         * @public
         */
        TagDesign["Negative"] = "Negative";
        /**
         * Critical design
         * @public
         */
        TagDesign["Critical"] = "Critical";
    })(TagDesign || (TagDesign = {}));
    var TagDesign$1 = TagDesign;

    function TagTemplate() {
        return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: this.interactive ?
                jsxRuntime.jsx("button", { class: "ui5-tag-root", title: this._title, "aria-roledescription": this._roleDescription, "aria-description": this._valueState, onClick: this._onclick, part: "root", children: content.call(this) })
                :
                    jsxRuntime.jsx("div", { class: "ui5-tag-root", title: this._title, part: "root", children: content.call(this) }) }));
    }
    function content() {
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("slot", { name: "icon" }), this._semanticIconName &&
                    jsxRuntime.jsx(Icon.Icon, { class: "ui5-tag-semantic-icon", name: this._semanticIconName }), jsxRuntime.jsx("span", { class: "ui5-hidden-text", children: this.tagDescription }), this.hasText &&
                    jsxRuntime.jsx("span", { class: "ui5-tag-text", children: jsxRuntime.jsx("slot", {}) })] }));
    }

    Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
    Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
    var tagCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{font-size:var(--sapFontSmallSize);font-family:var(--sapFontBoldFamily);font-weight:var(--_ui5-tag-font-weight);letter-spacing:var(--_ui5-tag-letter-spacing);line-height:var(--_ui5-tag-height)}.ui5-tag-root{display:flex;align-items:baseline;justify-content:center;width:100%;min-width:1.125em;max-width:100%;box-sizing:border-box;padding:var(--_ui5-tag-text-padding);border:.0625rem solid;border-radius:var(--sapButton_BorderCornerRadius);white-space:normal;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit;letter-spacing:inherit}:host([interactive]) .ui5-tag-root:active{text-shadow:var(--ui5-tag-text-shadow)}:host([interactive]) .ui5-tag-root{cursor:pointer}:host([desktop][interactive]) .ui5-tag-root:focus,:host([interactive]) .ui5-tag-root:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:1px}:host([wrapping-type="None"]) .ui5-tag-root{white-space:nowrap}:host([_icon-only]) .ui5-tag-root{padding-inline:var(--_ui5-tag-padding-inline-icon-only)}.ui5-tag-text{text-transform:var(--_ui5-tag-text-transform);text-align:start;pointer-events:none;overflow:hidden;text-overflow:ellipsis}:host([_has-icon]) .ui5-tag-text{padding-inline-start:var(--_ui5-tag-icon-gap)}[ui5-icon],::slotted([ui5-icon]){width:var(--_ui5-tag-icon-width);min-width:var(--_ui5-tag-icon-width);color:inherit;pointer-events:none;align-self:flex-start}.ui5-tag-root{background-color:var(--sapNeutralBackground);border-color:var(--sapNeutralBorderColor);color:var(--sapTextColor);text-shadow:var(--ui5-tag-text-shadow)}:host([interactive]) .ui5-tag-root:hover{background-color:var(--sapButton_Neutral_Hover_Background);border-color:var(--sapButton_Neutral_Hover_BorderColor);color:var(--sapButton_Neutral_Hover_TextColor)}:host([interactive]) .ui5-tag-root:active{background-color:var(--sapButton_Neutral_Active_Background);border-color:var(--sapButton_Neutral_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([design="Positive"]) .ui5-tag-root{background-color:var(--sapButton_Success_Background);border-color:var(--sapButton_Success_BorderColor);color:var(--sapButton_Success_TextColor);text-shadow:var(--ui5-tag-contrast-text-shadow)}:host([interactive][design="Positive"]) .ui5-tag-root:hover{background-color:var(--sapButton_Success_Hover_Background);border-color:var(--sapButton_Success_Hover_BorderColor);color:var(--sapButton_Success_Hover_TextColor)}:host([interactive][design="Positive"]) .ui5-tag-root:active{background-color:var(--sapButton_Success_Active_Background);border-color:var(--sapButton_Success_Active_BorderColor);color:var(--sapButton_Accept_Selected_TextColor)}:host([design="Negative"]) .ui5-tag-root{background-color:var(--sapButton_Negative_Background);border-color:var(--sapButton_Negative_BorderColor);color:var(--sapButton_Negative_TextColor);text-shadow:var(--ui5-tag-contrast-text-shadow)}:host([interactive][design="Negative"]) .ui5-tag-root:hover{background-color:var(--sapButton_Negative_Hover_Background);border-color:var(--sapButton_Negative_Hover_BorderColor);color:var(--sapButton_Negative_Hover_TextColor)}:host([interactive][design="Negative"]) .ui5-tag-root:active{background-color:var(--sapButton_Negative_Active_Background);border-color:var(--sapButton_Negative_Active_BorderColor);color:var(--sapButton_Reject_Selected_TextColor)}:host([design="Critical"]) .ui5-tag-root{background-color:var(--sapButton_Critical_Background);border-color:var(--sapButton_Critical_BorderColor);color:var(--sapButton_Critical_TextColor);text-shadow:var(--ui5-tag-contrast-text-shadow)}:host([interactive][design="Critical"]) .ui5-tag-root:hover{background-color:var(--sapButton_Critical_Hover_Background);border-color:var(--sapButton_Critical_Hover_BorderColor);color:var(--sapButton_Critical_Hover_TextColor)}:host([interactive][design="Critical"]) .ui5-tag-root:active{background-color:var(--sapButton_Critical_Active_Background);border-color:var(--sapButton_Critical_Active_BorderColor);color:var(--sapButton_Attention_Selected_TextColor)}:host([design="Information"]) .ui5-tag-root{background-color:var(--sapButton_Information_Background);border-color:var(--sapButton_Information_BorderColor);color:var(--sapButton_Information_TextColor);text-shadow:var(--ui5-tag-information-text-shadow)}:host([interactive][design="Information"]) .ui5-tag-root:hover{background-color:var(--sapButton_Information_Hover_Background);border-color:var(--sapButton_Information_Hover_BorderColor);color:var(--sapButton_Information_Hover_TextColor)}:host([interactive][design="Information"]) .ui5-tag-root:active{background-color:var(--sapButton_Information_Active_Background);border-color:var(--sapButton_Information_Active_BorderColor);color:var(--sapButton_Selected_TextColor)}:host([design="Set1"]) .ui5-tag-root{text-shadow:var(--ui5-tag-contrast-text-shadow)}:host([design="Set1"]) .ui5-tag-root,:host([interactive][design="Set1"]) .ui5-tag-root{background-color:var(--sapIndicationColor_1_Background);border-color:var(--sapIndicationColor_1_BorderColor);color:var(--sapIndicationColor_1_TextColor)}:host([interactive][design="Set1"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_1_Hover_Background)}:host([interactive][design="Set1"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_1_Active_Background);border-color:var(--sapIndicationColor_1_Active_BorderColor);color:var(--sapIndicationColor_1_Active_TextColor)}:host([design="Set1"][color-scheme="2"]) .ui5-tag-root{background-color:var(--sapIndicationColor_2_Background);border-color:var(--sapIndicationColor_2_BorderColor);color:var(--sapIndicationColor_2_TextColor)}:host([interactive][design="Set1"][color-scheme="2"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_2_Hover_Background)}:host([interactive][design="Set1"][color-scheme="2"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_2_Active_Background);border-color:var(--sapIndicationColor_2_Active_BorderColor);color:var(--sapIndicationColor_2_Active_TextColor)}:host([design="Set1"][color-scheme="3"]) .ui5-tag-root{background-color:var(--sapIndicationColor_3_Background);border-color:var(--sapIndicationColor_3_BorderColor);color:var(--sapIndicationColor_3_TextColor)}:host([interactive][design="Set1"][color-scheme="3"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_3_Hover_Background)}:host([interactive][design="Set1"][color-scheme="3"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_3_Active_Background);border-color:var(--sapIndicationColor_3_Active_BorderColor);color:var(--sapIndicationColor_3_Active_TextColor)}:host([design="Set1"][color-scheme="4"]) .ui5-tag-root{background-color:var(--sapIndicationColor_4_Background);border-color:var(--sapIndicationColor_4_BorderColor);color:var(--sapIndicationColor_4_TextColor)}:host([interactive][design="Set1"][color-scheme="4"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_4_Hover_Background)}:host([interactive][design="Set1"][color-scheme="4"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_4_Active_Background);border-color:var(--sapIndicationColor_4_Active_BorderColor);color:var(--sapIndicationColor_4_Active_TextColor)}:host([design="Set1"][color-scheme="5"]) .ui5-tag-root{background-color:var(--sapIndicationColor_5_Background);border-color:var(--sapIndicationColor_5_BorderColor);color:var(--sapIndicationColor_5_TextColor)}:host([interactive][design="Set1"][color-scheme="5"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_5_Hover_Background)}:host([interactive][design="Set1"][color-scheme="5"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_5_Active_Background);border-color:var(--sapIndicationColor_5_Active_BorderColor);color:var(--sapIndicationColor_5_Active_TextColor)}:host([design="Set1"][color-scheme="6"]) .ui5-tag-root{background-color:var(--sapIndicationColor_6_Background);border-color:var(--sapIndicationColor_6_BorderColor);color:var(--sapIndicationColor_6_TextColor)}:host([interactive][design="Set1"][color-scheme="6"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_6_Hover_Background)}:host([interactive][design="Set1"][color-scheme="6"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_6_Active_Background);border-color:var(--sapIndicationColor_6_Active_BorderColor);color:var(--sapIndicationColor_6_Active_TextColor)}:host([design="Set1"][color-scheme="7"]) .ui5-tag-root{background-color:var(--sapIndicationColor_7_Background);border-color:var(--sapIndicationColor_7_BorderColor);color:var(--sapIndicationColor_7_TextColor)}:host([interactive][design="Set1"][color-scheme="7"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_7_Hover_Background)}:host([interactive][design="Set1"][color-scheme="7"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_7_Active_Background);border-color:var(--sapIndicationColor_7_Active_BorderColor);color:var(--sapIndicationColor_7_Active_TextColor)}:host([design="Set1"][color-scheme="8"]) .ui5-tag-root{background-color:var(--sapIndicationColor_8_Background);border-color:var(--sapIndicationColor_8_BorderColor);color:var(--sapIndicationColor_8_TextColor)}:host([interactive][design="Set1"][color-scheme="8"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_8_Hover_Background)}:host([interactive][design="Set1"][color-scheme="8"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_8_Active_Background);border-color:var(--sapIndicationColor_8_Active_BorderColor);color:var(--sapIndicationColor_8_Active_TextColor)}:host([design="Set1"][color-scheme="9"]) .ui5-tag-root{background-color:var(--sapIndicationColor_9_Background);border-color:var(--sapIndicationColor_9_BorderColor);color:var(--sapIndicationColor_9_TextColor)}:host([interactive][design="Set1"][color-scheme="9"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_9_Hover_Background)}:host([interactive][design="Set1"][color-scheme="9"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_9_Active_Background);border-color:var(--sapIndicationColor_9_Active_BorderColor);color:var(--sapIndicationColor_9_Active_TextColor)}:host([design="Set1"][color-scheme="10"]) .ui5-tag-root{background-color:var(--sapIndicationColor_10_Background);border-color:var(--sapIndicationColor_10_BorderColor);color:var(--sapIndicationColor_10_TextColor)}:host([interactive][design="Set1"][color-scheme="10"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_10_Hover_Background)}:host([interactive][design="Set1"][color-scheme="10"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_10_Active_Background);border-color:var(--sapIndicationColor_10_Active_BorderColor);color:var(--sapIndicationColor_10_Active_TextColor)}:host([design="Set2"]) .ui5-tag-root{text-shadow:var(--ui5-tag-text-shadow)}:host([design="Set2"]) .ui5-tag-root,:host([interactive][design="Set2"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-1-background);border-color:var(--ui5-tag-set2-color-scheme-1-border);color:var(--ui5-tag-set2-color-scheme-1-color)}:host([interactive][design="Set2"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-1-hover-background)}:host([interactive][design="Set2"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-1-active-background);border-color:var(--ui5-tag-set2-color-scheme-1-active-border);color:var(--ui5-tag-set2-color-scheme-1-active-color)}:host([design="Set2"][color-scheme="2"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-2-background);border-color:var(--ui5-tag-set2-color-scheme-2-border);color:var(--ui5-tag-set2-color-scheme-2-color)}:host([design="Set2"][color-scheme="3"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-3-background);border-color:var(--ui5-tag-set2-color-scheme-3-border);color:var(--ui5-tag-set2-color-scheme-3-color)}:host([interactive][design="Set2"][color-scheme="3"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-3-hover-background)}:host([interactive][design="Set2"][color-scheme="3"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-3-active-background);border-color:var(--ui5-tag-set2-color-scheme-3-active-border);color:var(--ui5-tag-set2-color-scheme-3-active-color)}:host([design="Set2"][color-scheme="4"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-4-background);border-color:var(--ui5-tag-set2-color-scheme-4-border);color:var(--ui5-tag-set2-color-scheme-4-color)}:host([interactive][design="Set2"][color-scheme="4"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-4-hover-background)}:host([interactive][design="Set2"][color-scheme="4"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-4-active-background);border-color:var(--ui5-tag-set2-color-scheme-4-active-border);color:var(--ui5-tag-set2-color-scheme-4-active-color)}:host([design="Set2"][color-scheme="5"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-5-background);border-color:var(--ui5-tag-set2-color-scheme-5-border);color:var(--ui5-tag-set2-color-scheme-5-color)}:host([interactive][design="Set2"][color-scheme="5"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-5-hover-background)}:host([interactive][design="Set2"][color-scheme="5"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-5-active-background);border-color:var(--ui5-tag-set2-color-scheme-5-active-border);color:var(--ui5-tag-set2-color-scheme-5-active-color)}:host([design="Set2"][color-scheme="6"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-6-background);border-color:var(--ui5-tag-set2-color-scheme-6-border);color:var(--ui5-tag-set2-color-scheme-6-color)}:host([interactive][design="Set2"][color-scheme="6"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-6-hover-background)}:host([interactive][design="Set2"][color-scheme="6"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-6-active-background);border-color:var(--ui5-tag-set2-color-scheme-6-active-border);color:var(--ui5-tag-set2-color-scheme-6-active-color)}:host([design="Set2"][color-scheme="7"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-7-background);border-color:var(--ui5-tag-set2-color-scheme-7-border);color:var(--ui5-tag-set2-color-scheme-7-color)}:host([interactive][design="Set2"][color-scheme="7"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-7-hover-background)}:host([interactive][design="Set2"][color-scheme="7"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-7-active-background);border-color:var(--ui5-tag-set2-color-scheme-7-active-border);color:var(--ui5-tag-set2-color-scheme-7-active-color)}:host([design="Set2"][color-scheme="8"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-8-background);border-color:var(--ui5-tag-set2-color-scheme-8-border);color:var(--ui5-tag-set2-color-scheme-8-color)}:host([interactive][design="Set2"][color-scheme="8"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-8-hover-background)}:host([interactive][design="Set2"][color-scheme="8"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-8-active-background);border-color:var(--ui5-tag-set2-color-scheme-8-active-border);color:var(--ui5-tag-set2-color-scheme-8-active-color)}:host([design="Set2"][color-scheme="9"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-9-background);border-color:var(--ui5-tag-set2-color-scheme-9-border);color:var(--ui5-tag-set2-color-scheme-9-color)}:host([interactive][design="Set2"][color-scheme="9"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-9-hover-background)}:host([interactive][design="Set2"][color-scheme="9"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-9-active-background);border-color:var(--ui5-tag-set2-color-scheme-9-active-border);color:var(--ui5-tag-set2-color-scheme-9-active-color)}:host([interactive][design="Set2"][color-scheme="10"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-10-hover-background)}:host([interactive][design="Set2"][color-scheme="10"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-10-active-background);border-color:var(--ui5-tag-set2-color-scheme-10-active-border);color:var(--ui5-tag-set2-color-scheme-10-active-color)}:host([design="Set2"][color-scheme="10"]) .ui5-tag-root{background-color:var(--ui5-tag-set2-color-scheme-10-background);border-color:var(--ui5-tag-set2-color-scheme-10-border);color:var(--ui5-tag-set2-color-scheme-10-color)}:host([interactive][design="Set2"][color-scheme="2"]) .ui5-tag-root:hover{background-color:var(--ui5-tag-set2-color-scheme-2-hover-background)}:host([interactive][design="Set2"][color-scheme="2"]) .ui5-tag-root:active{background-color:var(--ui5-tag-set2-color-scheme-2-active-background);border-color:var(--ui5-tag-set2-color-scheme-2-active-border);color:var(--ui5-tag-set2-color-scheme-2-active-color)}:host([size="L"]){font-family:var(--sapFontSemiboldDuplexFamily);line-height:var(--_ui5-tag-height_size_l)}:host([size="L"]) .ui5-tag-root{font-size:var(--_ui5-tag-font-size_size_l);min-width:var(--_ui5-tag-min-width_size_l);padding:var(--_ui5-tag-text_padding_size_l)}:host([size="L"]) [ui5-icon],:host([size="L"]) ::slotted([ui5-icon]){min-width:var(--_ui5-tag-icon_min_width_size_l);min-height:var(--_ui5-tag-icon_min_height_size_l);height:var(--_ui5-tag-icon_height_size_l)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Tag_1;
    /**
     * @class
     * ### Overview
     *
     * The `ui5-tag` is a component which serves
     * the purpose to attract the user attention to some piece
     * of information (state, quantity, condition, etc.).
     * It can contain icon and text information, and its design can be chosen from specific design types.
     *
     * ### Usage Guidelines
     *
     * - If the text is longer than the width of the component, it can wrap, or it can show ellipsis, depending on the `wrappingType` property.
      * - Colors can be semantic or not semantic.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Tag.js";`
     * @csspart root - Used to style the root element.
     * @constructor
     * @extends UI5Element
     * @since 2.0.0
     * @public
     */
    let Tag = Tag_1 = class Tag extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Defines the design type of the component.
             * @default "Neutral"
             * @public
             * @since 1.22.0
             */
            this.design = "Neutral";
            /**
             * Defines the color scheme of the component.
             * There are 10 predefined schemes.
             * To use one you can set a number from `"1"` to `"10"`. The `colorScheme` `"1"` will be set by default.
             * @default "1"
             * @public
             */
            this.colorScheme = "1";
            /**
             * Defines if the default state icon is shown.
             * @default false
             * @public
             * @since 1.22.0
             */
            this.hideStateIcon = false;
            /**
             * Defines if the component is interactive (focusable and pressable).
             *
             * @default false
             * @public
             * @since 1.22.0
             */
            this.interactive = false;
            /**
             * Defines how the text of a component will be displayed when there is not enough space.
             *
             * **Note:** For option "Normal" the text will wrap and the
             * words will not be broken based on hyphenation.
             * @default "Normal"
             * @public
             * @since 1.22.0
             */
            this.wrappingType = "Normal";
            /**
             * Defines predefined size of the component.
             * @default "S"
             * @public
             * @since 2.0.0
             */
            this.size = "S";
            /**
             * Defines if the tag has an icon.
             * @private
             */
            this._hasIcon = false;
            /**
             * Defines if the tag has only an icon (and no text).
             * @private
             */
            this._iconOnly = false;
        }
        onEnterDOM() {
            if (Theme.f$1()) {
                this.setAttribute("desktop", "");
            }
        }
        onBeforeRendering() {
            this._hasIcon = this.hasIcon || !!this._semanticIconName;
            this._iconOnly = this.iconOnly;
        }
        get _roleDescription() {
            return Tag_1.i18nBundle.getText(i18nDefaults.TAG_ROLE_DESCRIPTION);
        }
        get _valueState() {
            switch (this.design) {
                case TagDesign$1.Positive:
                    return Tag_1.i18nBundle.getText(i18nDefaults.TAG_SUCCESS);
                case TagDesign$1.Negative:
                    return Tag_1.i18nBundle.getText(i18nDefaults.TAG_ERROR);
                case TagDesign$1.Critical:
                    return Tag_1.i18nBundle.getText(i18nDefaults.TAG_WARNING);
                case TagDesign$1.Information:
                    return Tag_1.i18nBundle.getText(i18nDefaults.TAG_INFORMATION);
            }
            return undefined;
        }
        get hasText() {
            return willShowContent.t(this.text);
        }
        get hasIcon() {
            return !!this.icon.length;
        }
        get iconOnly() {
            return this.hasIcon && !this.hasText;
        }
        get _title() {
            return this.title || undefined;
        }
        get tagDescription() {
            if (this.interactive) {
                return undefined;
            }
            const valueState = this._valueState;
            let description = Tag_1.i18nBundle.getText(i18nDefaults.TAG_DESCRIPTION_TAG);
            if (valueState) {
                description = `${description} ${valueState}`;
            }
            return description;
        }
        get _semanticIconName() {
            if (this.hideStateIcon || this.hasIcon) {
                return null;
            }
            switch (this.design) {
                case TagDesign$1.Neutral:
                    return "sys-help-2";
                case TagDesign$1.Positive:
                    return "sys-enter-2";
                case TagDesign$1.Negative:
                    return "error";
                case TagDesign$1.Critical:
                    return "alert";
                case TagDesign$1.Information:
                    return "information";
                default:
                    return null;
            }
        }
        _onclick(e) {
            e.stopPropagation();
            this.fireDecoratorEvent("click");
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Tag.prototype, "design", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Tag.prototype, "colorScheme", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Tag.prototype, "hideStateIcon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Tag.prototype, "interactive", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Tag.prototype, "wrappingType", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Tag.prototype, "size", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Tag.prototype, "_hasIcon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Tag.prototype, "_iconOnly", void 0);
    __decorate([
        webcomponentsBase.d({ type: Node, "default": true })
    ], Tag.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.d()
    ], Tag.prototype, "icon", void 0);
    __decorate([
        parametersBundle_css.i("@ui5/webcomponents")
    ], Tag, "i18nBundle", void 0);
    Tag = Tag_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-tag",
            languageAware: true,
            renderer: jsxRuntime.y,
            template: TagTemplate,
            styles: tagCss,
        })
        /**
         * Fired when the user clicks on an interactive tag.
         *
         * **Note:** The event will be fired if the `interactive` property is `true`
         * @public
         * @since 1.22.0
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
        })
    ], Tag);
    Tag.define();
    var Tag$1 = Tag;

    exports.Tag = Tag$1;
    exports.TagDesign = TagDesign$1;

}));
