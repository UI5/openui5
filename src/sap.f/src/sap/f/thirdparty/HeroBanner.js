sap.ui.define(['sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/ManagedStyles', 'sap/f/thirdparty/parameters-bundle3.css', 'sap/f/thirdparty/Icons'], (function (webcomponentsBase, parametersBundle_css, ManagedStyles, parametersBundle_css$1, Icons) { 'use strict';

    function HeroBannerTemplate() {
        const actionsBottomStart = this.actionsPlacement === "BottomStart";
        return (parametersBundle_css.jsx("div", { class: "ui5-banner-root", role: "banner", part: "canvas", children: parametersBundle_css.jsxs("div", { class: {
                    "ui5-banner-content": true,
                    "ui5-banner-columns-equal": this.columnsRatio === "Equal" && this._hasEndContent,
                    "ui5-banner-columns-first-wider": this.columnsRatio === "FirstWider" && this._hasEndContent,
                }, part: "content", children: [parametersBundle_css.jsxs("div", { class: "ui5-banner-header", part: "header", children: [parametersBundle_css.jsxs("div", { class: "ui5-banner-header-text", children: [this.overlineText &&
                                        parametersBundle_css.jsx("div", { class: "ui5-banner-overline", children: this.overlineText }), this.headerText &&
                                        parametersBundle_css.jsx("h2", { class: "ui5-banner-heading", children: this.headerText }), actionsBottomStart && this._hasActions &&
                                        parametersBundle_css.jsx("div", { class: "ui5-banner-actions ui5-banner-actions-bottom-start", children: parametersBundle_css.jsx("slot", { name: "actions" }) })] }), !actionsBottomStart && !this._actionsAsGridItem && this._hasActions &&
                                parametersBundle_css.jsx("div", { class: "ui5-banner-actions", children: parametersBundle_css.jsx("slot", { name: "actions" }) })] }), this._hasStartContent &&
                        parametersBundle_css.jsx("div", { class: "ui5-banner-block ui5-banner-block-start", part: "startContent", children: parametersBundle_css.jsx("slot", {}) }), this._hasEndContent &&
                        parametersBundle_css.jsx("div", { class: "ui5-banner-block ui5-banner-block-end", part: "endContent", children: parametersBundle_css.jsx("slot", { name: "endContent" }) }), this._actionsAsGridItem &&
                        parametersBundle_css.jsx("div", { class: "ui5-banner-actions ui5-banner-actions-grid-item", children: parametersBundle_css.jsx("slot", { name: "actions" }) })] }) }));
    }

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var HeroBannerCss = `:host(:not([hidden])){display:block;width:100%;container-type:inline-size;border-radius:var(--_ui5_banner_border_radius);background-color:var(--_ui5_banner_background);background-image:var(--_ui5_banner_background_image);background-repeat:no-repeat;background-position:top;background-size:cover}.ui5-banner-root{box-sizing:border-box;min-height:5.75rem;border-radius:inherit;background-color:inherit;background-image:inherit;background-size:inherit;box-shadow:var(--_ui5_banner_box_shadow);overflow:hidden;position:relative}.ui5-banner-content{display:flex;flex-direction:column;gap:1rem;box-sizing:border-box;padding:1.5rem;color:var(--_ui5_banner_text_color);font-family:var(--sapFontFamily);font-size:var(--sapFontSize)}.ui5-banner-header{display:flex;flex-direction:row;align-items:flex-start;justify-content:space-between;gap:1rem}.ui5-banner-header-text{display:flex;flex-direction:column;gap:.25rem;flex:1 1 auto;min-width:0}.ui5-banner-actions{display:flex;align-items:center;gap:.5rem;flex:0 0 auto;--sapButton_Lite_TextColor: var(--_ui5_banner_text_color);--sapButton_Lite_Hover_TextColor: var(--_ui5_banner_text_color);--sapButton_Lite_Active_TextColor: var(--_ui5_banner_text_color);--sapButton_Lite_Hover_Background: color-mix(in srgb, var(--_ui5_banner_text_color) 15%, transparent);--sapButton_Lite_Active_Background: color-mix(in srgb, var(--_ui5_banner_text_color) 25%, transparent);--sapButton_IconColor: var(--_ui5_banner_text_color)}.ui5-banner-actions-bottom-start{align-self:flex-start;margin-top:.5rem}.ui5-banner-heading{font-family:var(--sapFontHeaderFamily);font-size:var(--sapFontHeader3Size);font-weight:400;text-align:start;color:var(--_ui5_banner_text_color);line-height:1.4;margin:0;padding:0}.ui5-banner-overline{font-family:var(--sapFontFamily);font-size:var(--sapFontSize);text-align:start;color:var(--_ui5_banner_text_color);line-height:1.4}.ui5-banner-block{box-sizing:border-box;min-width:0}.ui5-banner-content:not(:has(.ui5-banner-block-start)) .ui5-banner-block-end{display:flex;flex-direction:column;width:100%}.ui5-banner-content.ui5-banner-columns-equal{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr}.ui5-banner-columns-equal .ui5-banner-header{grid-column:1 / -1;grid-row:1}.ui5-banner-columns-equal .ui5-banner-block-start{grid-column:1;grid-row:2}.ui5-banner-columns-equal:not(:has(.ui5-banner-block-end)) .ui5-banner-block-start{grid-column:1 / -1}.ui5-banner-columns-equal .ui5-banner-block-end{grid-column:2;grid-row:2}.ui5-banner-content.ui5-banner-columns-first-wider{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:auto 1fr}.ui5-banner-columns-first-wider .ui5-banner-header{grid-column:1 / -1;grid-row:1}.ui5-banner-columns-first-wider .ui5-banner-block-start{grid-column:1;grid-row:2}.ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-end)) .ui5-banner-block-start{grid-column:1 / -1}.ui5-banner-columns-first-wider .ui5-banner-block-end{grid-column:2;grid-row:2}:host([actions-placement="BottomStart"]) .ui5-banner-root:has(.ui5-banner-block-end):not(:has(.ui5-banner-block-start)){display:flex;flex-direction:column}:host([actions-placement="BottomStart"]) .ui5-banner-root:has(.ui5-banner-block-end):not(:has(.ui5-banner-block-start)) .ui5-banner-content{flex:1}:host([actions-placement="BottomStart"]) .ui5-banner-content:has(.ui5-banner-block-end):not(:has(.ui5-banner-block-start)):not(.ui5-banner-columns-equal):not(.ui5-banner-columns-first-wider){display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr;align-items:stretch}:host([actions-placement="BottomStart"]) .ui5-banner-content:has(.ui5-banner-block-end):not(:has(.ui5-banner-block-start)):not(.ui5-banner-columns-equal):not(.ui5-banner-columns-first-wider) .ui5-banner-header{grid-column:1;grid-row:1;align-self:stretch;display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start}:host([actions-placement="BottomStart"]) .ui5-banner-content:has(.ui5-banner-block-end):not(:has(.ui5-banner-block-start)):not(.ui5-banner-columns-equal):not(.ui5-banner-columns-first-wider) .ui5-banner-block-end{grid-column:2;grid-row:1;height:100%;display:flex;flex-direction:column;align-items:flex-end;justify-content:center}:host([actions-placement="BottomStart"]) .ui5-banner-columns-equal:has(.ui5-banner-block-start) .ui5-banner-header,:host([actions-placement="BottomStart"]) .ui5-banner-columns-first-wider:has(.ui5-banner-block-start) .ui5-banner-header{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start}:host([actions-placement="BottomStart"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)),:host([actions-placement="BottomStart"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)){grid-template-rows:1fr;align-items:stretch}:host([actions-placement="BottomStart"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)) .ui5-banner-header,:host([actions-placement="BottomStart"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)) .ui5-banner-header{grid-column:1;grid-row:1;align-self:stretch;display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start}:host([actions-placement="BottomStart"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)) .ui5-banner-block-end,:host([actions-placement="BottomStart"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)) .ui5-banner-block-end{grid-column:2;grid-row:1;align-self:stretch;height:100%;display:flex;flex-direction:column;justify-content:center}:host([header-block-placement="Bottom"]) .ui5-banner-content:not(.ui5-banner-columns-equal):not(.ui5-banner-columns-first-wider) .ui5-banner-header{margin-top:auto}:host([header-block-placement="Bottom"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)),:host([header-block-placement="Bottom"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)){grid-template-rows:1fr;align-items:stretch;min-height:12rem}:host([header-block-placement="Bottom"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)):has(.ui5-banner-actions-grid-item),:host([header-block-placement="Bottom"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)):has(.ui5-banner-actions-grid-item){grid-template-rows:auto 1fr}:host([header-block-placement="Bottom"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)) .ui5-banner-header,:host([header-block-placement="Bottom"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)) .ui5-banner-header{grid-column:1;grid-row:1;align-self:end}:host([header-block-placement="Bottom"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)):has(.ui5-banner-actions-grid-item) .ui5-banner-header,:host([header-block-placement="Bottom"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)):has(.ui5-banner-actions-grid-item) .ui5-banner-header{grid-row:1 / 3;align-self:end}:host([header-block-placement="Bottom"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)) .ui5-banner-actions-grid-item,:host([header-block-placement="Bottom"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)) .ui5-banner-actions-grid-item{grid-column:2;grid-row:1;align-self:start;justify-self:end;min-width:0}:host([header-block-placement="Bottom"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)) .ui5-banner-block-end,:host([header-block-placement="Bottom"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)) .ui5-banner-block-end{grid-column:2;grid-row:1;align-self:stretch;height:100%}:host([header-block-placement="Bottom"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)):has(.ui5-banner-actions-grid-item) .ui5-banner-block-end,:host([header-block-placement="Bottom"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)):has(.ui5-banner-actions-grid-item) .ui5-banner-block-end{grid-row:2}@container (max-width: 599px){.ui5-banner-content.ui5-banner-columns-equal,.ui5-banner-content.ui5-banner-columns-first-wider{display:flex;flex-direction:column}:host([header-block-placement="Bottom"]) .ui5-banner-columns-first-wider:not(:has(.ui5-banner-block-start)):has(.ui5-banner-actions-grid-item) .ui5-banner-header,:host([header-block-placement="Bottom"]) .ui5-banner-columns-equal:not(:has(.ui5-banner-block-start)) .ui5-banner-header{align-self:flex-start}.ui5-banner-header{order:1;flex-direction:column;align-items:flex-start}.ui5-banner-actions,.ui5-banner-actions-grid-item{order:2;flex-direction:column;align-items:flex-start}.ui5-banner-block-start{order:3}.ui5-banner-block-end{order:4}:host([actions-placement="BottomStart"]) .ui5-banner-content:has(.ui5-banner-block-end):not(:has(.ui5-banner-block-start)):not(.ui5-banner-columns-equal):not(.ui5-banner-columns-first-wider){display:flex;flex-direction:column}:host([actions-placement="BottomStart"]) .ui5-banner-content:has(.ui5-banner-block-end):not(:has(.ui5-banner-block-start)):not(.ui5-banner-columns-equal):not(.ui5-banner-columns-first-wider) .ui5-banner-block-end{justify-content:center}.ui5-banner-content:not(:has(.ui5-banner-block-start)) .ui5-banner-block-end{justify-content:center;width:100%}}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
     * The `ui5-hero-banner` is a flexible, full-width banner designed for placement at the top of a page.
     * It provides a personalized greeting and quick access to key information or actions.
     *
     * ### Structure
     *
     * The HeroBanner consists of the following building blocks:
     *
     * - **Banner Canvas** - the visual base with a background color, optional background image and shadow.
     * - **Overline** (optional) - contextual text at the top, e.g. the current date or a status message.
     * - **Header** (optional) - the main greeting header below the overline, e.g. "Hello, John".
     * - **Free Slots** (optional) - customizable content areas that can contain KPI cards, search components, text, buttons, etc.
     *
     * The banner is not sticky — it scrolls away with the page content when the user scrolls down.
     *
     * ### Usage
     *
     * Place the `ui5-hero-banner` at the top of a page to welcome the user and surface relevant
     * information or shortcuts at a glance.
     *
     * The hero banner itself is non-interactive. However, interactive elements such as buttons, cards,
     * or search fields can be placed inside the free content slots and will follow their own
     * interactive states.
     *
     * ### Responsive Behavior
     *
     * The hero banner adapts to different screen sizes:
     * - On smaller screens, split layouts (Equal, FirstWider) collapse to a single stacked column.
     * - The heading text wraps to multiple lines as needed.
     * - Buttons in the headerAction slot will wrap.
     * - On screens ≤1024px, the header text is wrapped to a maximum of 3 lines.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/HeroBanner.js";`
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.23.0
     * @experimental
     * @csspart canvas - Used to style the banner canvas container
     * @csspart content - Used to style the content area of the banner
     * @csspart header - Used to style the header area (salutation, date, header actions)
     * @csspart startContent - Used to style the start (default) content block
     * @csspart endContent - Used to style the end content block
     */
    let HeroBanner = class HeroBanner extends webcomponentsBase.S {
        constructor() {
            super(...arguments);
            /**
             * Defines the ratio between the two content columns inside the hero banner.
             *
             * Takes effect only when `endContent` is provided. When no `endContent` is present, the content spans the full width (single column).
             *
             * - **Equal** - Two equal columns. Both content blocks share the available width equally.
             *   On smaller screens, both slots stack vertically.
             * - **FirstWider** - Two unequal columns. The start content takes two-thirds of the width, the end content one-third.
             *   On smaller screens, both slots stack vertically.
             *
             * @default "FirstWider"
             * @public
             */
            this.columnsRatio = "FirstWider";
            /**
             * Defines the placement of the actions slot within the hero banner header.
             *
             * - **TopEnd** (default) - Actions are displayed to the right of the header text, at the top of the header row.
             * - **BottomStart** - Actions are displayed below the header text, left-aligned, regardless of `columnsRatio` or slot usage.
             *
             * @default "TopEnd"
             * @public
             */
            this.actionsPlacement = "TopEnd";
            /**
             * Defines the vertical placement of the header block within the content area.
             *
             * - **Top** (default) - Header block is placed at the top of the content area.
             * - **Bottom** - Header block is pushed to the bottom of column 1. Only takes effect when `columnsRatio`
             *   is `Equal` or `FirstWider` and only `endContent` is provided (no default slot content).
             *   When `actionsPlacement` is also `BottomStart`, the `endContent` slot spans the full height.
             *
             * @default "Top"
             * @public
             */
            this.headerBlockPlacement = "Top";
        }
        get _hasStartContent() {
            return this.startContent.length > 0;
        }
        get _hasEndContent() {
            return this.endContent.length > 0;
        }
        get _hasActions() {
            return this.actions.length > 0;
        }
        // headerBlockPlacement="Bottom" only takes effect in split grid layouts with only endContent
        get _headerAtBottom() {
            return this.headerBlockPlacement === "Bottom"
                && !!this.columnsRatio
                && !this._hasStartContent
                && this._hasEndContent;
        }
        // TopEnd actions must be a standalone grid item when the header is at the bottom,
        // so they stay at the top of col 1 independently of the header position
        get _actionsAsGridItem() {
            return this._hasActions
                && this.actionsPlacement !== "BottomStart"
                && this._headerAtBottom;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], HeroBanner.prototype, "headerText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], HeroBanner.prototype, "overlineText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], HeroBanner.prototype, "columnsRatio", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, "default": true })
    ], HeroBanner.prototype, "startContent", void 0);
    __decorate([
        webcomponentsBase.d()
    ], HeroBanner.prototype, "endContent", void 0);
    __decorate([
        webcomponentsBase.d()
    ], HeroBanner.prototype, "actions", void 0);
    __decorate([
        webcomponentsBase.s()
    ], HeroBanner.prototype, "actionsPlacement", void 0);
    __decorate([
        webcomponentsBase.s()
    ], HeroBanner.prototype, "headerBlockPlacement", void 0);
    HeroBanner = __decorate([
        webcomponentsBase.m({
            tag: "ui5-hero-banner",
            renderer: parametersBundle_css.y,
            styles: HeroBannerCss,
            template: HeroBannerTemplate,
        })
    ], HeroBanner);
    HeroBanner.define();
    var HeroBanner_default = HeroBanner;

    return HeroBanner_default;

}));
