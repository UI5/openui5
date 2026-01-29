sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/information', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/i18n-defaults2'], (function (exports, webcomponentsBase, eventStrict, parametersBundle_css, parametersBundle_css$1, willShowContent, Theme, Icons, information, Icon, i18nDefaults) { 'use strict';

    const name$1 = "sys-help-2";
    const pathData$1 = "M256 0q53 0 99.5 20T437 74.5t55 81.5 20 100-20 99.5-55 81.5-81.5 55-99.5 20-100-20-81.5-55T20 355.5 0 256t20-100 54.5-81.5T156 20 256 0zm-5 425q15 0 26-11t11-26-11-25.5-26-10.5-25.5 10.5T215 388t10.5 26 25.5 11zm101-239q0-32-27-57t-77-25q-46 0-72.5 24T146 187h52q5-24 17.5-32.5T251 146t35 12.5 12 27.5q0 10-2.5 14T282 215l-20 17q-15 12-23 21t-11.5 18.5-4.5 21-1 27.5h50q0-12 .5-19t3-12.5T283 278t15-13l27-25 16-18 9-16z";
    const ltr$1 = true;
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

    const name = "sys-help-2";
    const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm32 289q31-10 50.5-36.5T358 192q0-43-29.5-72.5T256 90q-21 0-39.5 8T184 118.5 162 148t-8 35q0 20 9 30.5t23 10.5q13 0 22.5-9t9.5-23q0-16 11-27t27-11 27 11 11 27-11 27-27 11q-14 0-23 9.5t-9 22.5v26q0 14 9 23t23 9q13 0 22-9t10-22zm-32 127q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9z";
    const ltr = true;
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    Icons.y(name, { pathData, ltr, collection, packageName });

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
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.interactive ?
                parametersBundle_css.jsx("button", { class: "ui5-tag-root", title: this._title, "aria-roledescription": this._roleDescription, "aria-description": this._valueState, onClick: this._onclick, part: "root", children: content.call(this) })
                :
                    parametersBundle_css.jsx("div", { class: "ui5-tag-root", title: this._title, part: "root", children: content.call(this) }) }));
    }
    function content() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("slot", { name: "icon" }), this._semanticIconName &&
                    parametersBundle_css.jsx(Icon.Icon, { class: "ui5-tag-semantic-icon", name: this._semanticIconName }), parametersBundle_css.jsx("span", { class: "ui5-hidden-text", children: this.tagDescription }), this.hasText &&
                    parametersBundle_css.jsx("span", { class: "ui5-tag-text", children: parametersBundle_css.jsx("slot", {}) })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var tagCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{font-size:var(--sapFontSmallSize);font-family:var(--sapFontBoldFamily);font-weight:var(--_ui5-v2-15-0-tag-font-weight);letter-spacing:var(--_ui5-v2-15-0-tag-letter-spacing);line-height:var(--_ui5-v2-15-0-tag-height)}.ui5-tag-root{display:flex;align-items:baseline;justify-content:center;width:100%;min-width:1.125em;max-width:100%;box-sizing:border-box;padding:var(--_ui5-v2-15-0-tag-text-padding);border:.0625rem solid;border-radius:var(--sapButton_BorderCornerRadius);white-space:normal;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit;letter-spacing:inherit}:host([interactive]) .ui5-tag-root:active{text-shadow:var(--ui5-v2-15-0-tag-text-shadow)}:host([interactive]) .ui5-tag-root{cursor:pointer}:host([desktop][interactive]) .ui5-tag-root:focus,:host([interactive]) .ui5-tag-root:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:1px}:host([wrapping-type="None"]) .ui5-tag-root{white-space:nowrap}:host([_icon-only]) .ui5-tag-root{padding-inline:var(--_ui5-v2-15-0-tag-padding-inline-icon-only)}.ui5-tag-text{text-transform:var(--_ui5-v2-15-0-tag-text-transform);text-align:start;pointer-events:none;overflow:hidden;text-overflow:ellipsis}:host([_has-icon]) .ui5-tag-text{padding-inline-start:var(--_ui5-v2-15-0-tag-icon-gap)}[ui5-icon],::slotted([ui5-icon]){width:var(--_ui5-v2-15-0-tag-icon-width);min-width:var(--_ui5-v2-15-0-tag-icon-width);color:inherit;pointer-events:none;align-self:flex-start}.ui5-tag-root{background-color:var(--sapNeutralBackground);border-color:var(--sapNeutralBorderColor);color:var(--sapTextColor);text-shadow:var(--ui5-v2-15-0-tag-text-shadow)}:host([interactive]) .ui5-tag-root:hover{background-color:var(--sapButton_Neutral_Hover_Background);border-color:var(--sapButton_Neutral_Hover_BorderColor);color:var(--sapButton_Neutral_Hover_TextColor)}:host([interactive]) .ui5-tag-root:active{background-color:var(--sapButton_Neutral_Active_Background);border-color:var(--sapButton_Neutral_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([design="Positive"]) .ui5-tag-root{background-color:var(--sapButton_Success_Background);border-color:var(--sapButton_Success_BorderColor);color:var(--sapButton_Success_TextColor);text-shadow:var(--ui5-v2-15-0-tag-contrast-text-shadow)}:host([interactive][design="Positive"]) .ui5-tag-root:hover{background-color:var(--sapButton_Success_Hover_Background);border-color:var(--sapButton_Success_Hover_BorderColor);color:var(--sapButton_Success_Hover_TextColor)}:host([interactive][design="Positive"]) .ui5-tag-root:active{background-color:var(--sapButton_Success_Active_Background);border-color:var(--sapButton_Success_Active_BorderColor);color:var(--sapButton_Accept_Selected_TextColor)}:host([design="Negative"]) .ui5-tag-root{background-color:var(--sapButton_Negative_Background);border-color:var(--sapButton_Negative_BorderColor);color:var(--sapButton_Negative_TextColor);text-shadow:var(--ui5-v2-15-0-tag-contrast-text-shadow)}:host([interactive][design="Negative"]) .ui5-tag-root:hover{background-color:var(--sapButton_Negative_Hover_Background);border-color:var(--sapButton_Negative_Hover_BorderColor);color:var(--sapButton_Negative_Hover_TextColor)}:host([interactive][design="Negative"]) .ui5-tag-root:active{background-color:var(--sapButton_Negative_Active_Background);border-color:var(--sapButton_Negative_Active_BorderColor);color:var(--sapButton_Reject_Selected_TextColor)}:host([design="Critical"]) .ui5-tag-root{background-color:var(--sapButton_Critical_Background);border-color:var(--sapButton_Critical_BorderColor);color:var(--sapButton_Critical_TextColor);text-shadow:var(--ui5-v2-15-0-tag-contrast-text-shadow)}:host([interactive][design="Critical"]) .ui5-tag-root:hover{background-color:var(--sapButton_Critical_Hover_Background);border-color:var(--sapButton_Critical_Hover_BorderColor);color:var(--sapButton_Critical_Hover_TextColor)}:host([interactive][design="Critical"]) .ui5-tag-root:active{background-color:var(--sapButton_Critical_Active_Background);border-color:var(--sapButton_Critical_Active_BorderColor);color:var(--sapButton_Attention_Selected_TextColor)}:host([design="Information"]) .ui5-tag-root{background-color:var(--sapButton_Information_Background);border-color:var(--sapButton_Information_BorderColor);color:var(--sapButton_Information_TextColor);text-shadow:var(--ui5-v2-15-0-tag-information-text-shadow)}:host([interactive][design="Information"]) .ui5-tag-root:hover{background-color:var(--sapButton_Information_Hover_Background);border-color:var(--sapButton_Information_Hover_BorderColor);color:var(--sapButton_Information_Hover_TextColor)}:host([interactive][design="Information"]) .ui5-tag-root:active{background-color:var(--sapButton_Information_Active_Background);border-color:var(--sapButton_Information_Active_BorderColor);color:var(--sapButton_Selected_TextColor)}:host([design="Set1"]) .ui5-tag-root{text-shadow:var(--ui5-v2-15-0-tag-contrast-text-shadow)}:host([design="Set1"]) .ui5-tag-root,:host([interactive][design="Set1"]) .ui5-tag-root{background-color:var(--sapIndicationColor_1_Background);border-color:var(--sapIndicationColor_1_BorderColor);color:var(--sapIndicationColor_1_TextColor)}:host([interactive][design="Set1"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_1_Hover_Background)}:host([interactive][design="Set1"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_1_Active_Background);border-color:var(--sapIndicationColor_1_Active_BorderColor);color:var(--sapIndicationColor_1_Active_TextColor)}:host([design="Set1"][color-scheme="2"]) .ui5-tag-root{background-color:var(--sapIndicationColor_2_Background);border-color:var(--sapIndicationColor_2_BorderColor);color:var(--sapIndicationColor_2_TextColor)}:host([interactive][design="Set1"][color-scheme="2"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_2_Hover_Background)}:host([interactive][design="Set1"][color-scheme="2"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_2_Active_Background);border-color:var(--sapIndicationColor_2_Active_BorderColor);color:var(--sapIndicationColor_2_Active_TextColor)}:host([design="Set1"][color-scheme="3"]) .ui5-tag-root{background-color:var(--sapIndicationColor_3_Background);border-color:var(--sapIndicationColor_3_BorderColor);color:var(--sapIndicationColor_3_TextColor)}:host([interactive][design="Set1"][color-scheme="3"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_3_Hover_Background)}:host([interactive][design="Set1"][color-scheme="3"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_3_Active_Background);border-color:var(--sapIndicationColor_3_Active_BorderColor);color:var(--sapIndicationColor_3_Active_TextColor)}:host([design="Set1"][color-scheme="4"]) .ui5-tag-root{background-color:var(--sapIndicationColor_4_Background);border-color:var(--sapIndicationColor_4_BorderColor);color:var(--sapIndicationColor_4_TextColor)}:host([interactive][design="Set1"][color-scheme="4"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_4_Hover_Background)}:host([interactive][design="Set1"][color-scheme="4"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_4_Active_Background);border-color:var(--sapIndicationColor_4_Active_BorderColor);color:var(--sapIndicationColor_4_Active_TextColor)}:host([design="Set1"][color-scheme="5"]) .ui5-tag-root{background-color:var(--sapIndicationColor_5_Background);border-color:var(--sapIndicationColor_5_BorderColor);color:var(--sapIndicationColor_5_TextColor)}:host([interactive][design="Set1"][color-scheme="5"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_5_Hover_Background)}:host([interactive][design="Set1"][color-scheme="5"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_5_Active_Background);border-color:var(--sapIndicationColor_5_Active_BorderColor);color:var(--sapIndicationColor_5_Active_TextColor)}:host([design="Set1"][color-scheme="6"]) .ui5-tag-root{background-color:var(--sapIndicationColor_6_Background);border-color:var(--sapIndicationColor_6_BorderColor);color:var(--sapIndicationColor_6_TextColor)}:host([interactive][design="Set1"][color-scheme="6"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_6_Hover_Background)}:host([interactive][design="Set1"][color-scheme="6"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_6_Active_Background);border-color:var(--sapIndicationColor_6_Active_BorderColor);color:var(--sapIndicationColor_6_Active_TextColor)}:host([design="Set1"][color-scheme="7"]) .ui5-tag-root{background-color:var(--sapIndicationColor_7_Background);border-color:var(--sapIndicationColor_7_BorderColor);color:var(--sapIndicationColor_7_TextColor)}:host([interactive][design="Set1"][color-scheme="7"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_7_Hover_Background)}:host([interactive][design="Set1"][color-scheme="7"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_7_Active_Background);border-color:var(--sapIndicationColor_7_Active_BorderColor);color:var(--sapIndicationColor_7_Active_TextColor)}:host([design="Set1"][color-scheme="8"]) .ui5-tag-root{background-color:var(--sapIndicationColor_8_Background);border-color:var(--sapIndicationColor_8_BorderColor);color:var(--sapIndicationColor_8_TextColor)}:host([interactive][design="Set1"][color-scheme="8"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_8_Hover_Background)}:host([interactive][design="Set1"][color-scheme="8"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_8_Active_Background);border-color:var(--sapIndicationColor_8_Active_BorderColor);color:var(--sapIndicationColor_8_Active_TextColor)}:host([design="Set1"][color-scheme="9"]) .ui5-tag-root{background-color:var(--sapIndicationColor_9_Background);border-color:var(--sapIndicationColor_9_BorderColor);color:var(--sapIndicationColor_9_TextColor)}:host([interactive][design="Set1"][color-scheme="9"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_9_Hover_Background)}:host([interactive][design="Set1"][color-scheme="9"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_9_Active_Background);border-color:var(--sapIndicationColor_9_Active_BorderColor);color:var(--sapIndicationColor_9_Active_TextColor)}:host([design="Set1"][color-scheme="10"]) .ui5-tag-root{background-color:var(--sapIndicationColor_10_Background);border-color:var(--sapIndicationColor_10_BorderColor);color:var(--sapIndicationColor_10_TextColor)}:host([interactive][design="Set1"][color-scheme="10"]) .ui5-tag-root:hover{background-color:var(--sapIndicationColor_10_Hover_Background)}:host([interactive][design="Set1"][color-scheme="10"]) .ui5-tag-root:active{background-color:var(--sapIndicationColor_10_Active_Background);border-color:var(--sapIndicationColor_10_Active_BorderColor);color:var(--sapIndicationColor_10_Active_TextColor)}:host([design="Set2"]) .ui5-tag-root{text-shadow:var(--ui5-v2-15-0-tag-text-shadow)}:host([design="Set2"]) .ui5-tag-root,:host([interactive][design="Set2"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-1-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-1-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-1-color)}:host([interactive][design="Set2"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-1-hover-background)}:host([interactive][design="Set2"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-1-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-1-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-1-active-color)}:host([design="Set2"][color-scheme="2"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-2-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-2-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-2-color)}:host([design="Set2"][color-scheme="3"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-3-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-3-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-3-color)}:host([interactive][design="Set2"][color-scheme="3"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-3-hover-background)}:host([interactive][design="Set2"][color-scheme="3"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-3-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-3-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-3-active-color)}:host([design="Set2"][color-scheme="4"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-4-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-4-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-4-color)}:host([interactive][design="Set2"][color-scheme="4"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-4-hover-background)}:host([interactive][design="Set2"][color-scheme="4"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-4-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-4-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-4-active-color)}:host([design="Set2"][color-scheme="5"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-5-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-5-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-5-color)}:host([interactive][design="Set2"][color-scheme="5"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-5-hover-background)}:host([interactive][design="Set2"][color-scheme="5"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-5-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-5-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-5-active-color)}:host([design="Set2"][color-scheme="6"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-6-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-6-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-6-color)}:host([interactive][design="Set2"][color-scheme="6"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-6-hover-background)}:host([interactive][design="Set2"][color-scheme="6"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-6-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-6-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-6-active-color)}:host([design="Set2"][color-scheme="7"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-7-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-7-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-7-color)}:host([interactive][design="Set2"][color-scheme="7"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-7-hover-background)}:host([interactive][design="Set2"][color-scheme="7"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-7-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-7-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-7-active-color)}:host([design="Set2"][color-scheme="8"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-8-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-8-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-8-color)}:host([interactive][design="Set2"][color-scheme="8"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-8-hover-background)}:host([interactive][design="Set2"][color-scheme="8"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-8-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-8-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-8-active-color)}:host([design="Set2"][color-scheme="9"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-9-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-9-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-9-color)}:host([interactive][design="Set2"][color-scheme="9"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-9-hover-background)}:host([interactive][design="Set2"][color-scheme="9"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-9-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-9-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-9-active-color)}:host([interactive][design="Set2"][color-scheme="10"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-10-hover-background)}:host([interactive][design="Set2"][color-scheme="10"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-10-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-10-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-10-active-color)}:host([design="Set2"][color-scheme="10"]) .ui5-tag-root{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-10-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-10-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-10-color)}:host([interactive][design="Set2"][color-scheme="2"]) .ui5-tag-root:hover{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-2-hover-background)}:host([interactive][design="Set2"][color-scheme="2"]) .ui5-tag-root:active{background-color:var(--ui5-v2-15-0-tag-set2-color-scheme-2-active-background);border-color:var(--ui5-v2-15-0-tag-set2-color-scheme-2-active-border);color:var(--ui5-v2-15-0-tag-set2-color-scheme-2-active-color)}:host([size="L"]){font-family:var(--sapFontSemiboldDuplexFamily);line-height:var(--_ui5-v2-15-0-tag-height_size_l)}:host([size="L"]) .ui5-tag-root{font-size:var(--_ui5-v2-15-0-tag-font-size_size_l);min-width:var(--_ui5-v2-15-0-tag-min-width_size_l);padding:var(--_ui5-v2-15-0-tag-text_padding_size_l)}:host([size="L"]) [ui5-icon],:host([size="L"]) ::slotted([ui5-icon]){min-width:var(--_ui5-v2-15-0-tag-icon_min_width_size_l);min-height:var(--_ui5-v2-15-0-tag-icon_min_height_size_l);height:var(--_ui5-v2-15-0-tag-icon_height_size_l)}
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
    let Tag = Tag_1 = class Tag extends webcomponentsBase.b {
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
            if (Theme.f()) {
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
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], Tag, "i18nBundle", void 0);
    Tag = Tag_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-tag",
            languageAware: true,
            renderer: parametersBundle_css.y,
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
