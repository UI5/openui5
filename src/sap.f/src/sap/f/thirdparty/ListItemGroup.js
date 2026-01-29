sap.ui.define(['require', 'exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/Theme'], (function (require, exports, webcomponentsBase, eventStrict, parametersBundle_css, parametersBundle_css$1, toLowercaseEnumValue, ListItemBase, i18nDefaults, WrappingType, Theme) { 'use strict';

    function i(t,o,n,m,r={}){const a=webcomponentsBase.D$1.getDraggedElement(),e={targetReference:null,placement:null};if(!a&&!r?.crossDnD)return e;const s=n.placements;return e.targetReference=t.target,s.some(l=>{const c=r.originalEvent?{originalEvent:t}:{};return o.fireDecoratorEvent("move-over",{...c,source:{element:a},destination:{element:m,placement:l}})?false:(t.preventDefault(),e.targetReference=n.element,e.placement=l,true)})||(e.targetReference=null),e}

    function m(t,r,o,a,n={}){t.preventDefault();const e=webcomponentsBase.D$1.getDraggedElement();if(!e&&n?.crossDnD)return;const i=n.originalEvent?{originalEvent:t}:{};r.fireDecoratorEvent("move",{...i,source:{element:e},destination:{element:o,placement:a}}),e?.focus();}

    var r=(f=>(f.On="On",f.Before="Before",f.After="After",f))(r||{});

    var a=(l=>(l.Vertical="Vertical",l.Horizontal="Horizontal",l))(a||{});

    const A=(e,t,r$1,a)=>{const o=Math.abs(e-t),m=Math.abs(e-r$1),s=Math.abs(e-a),c=Math.min(o,m,s);let l=[];switch(c){case o:l=[r.Before];break;case m:l=[r.On,o<s?r.Before:r.After];break;case s:l=[r.After];break}return l},L=(e,t,r)=>{let a$1=Number.POSITIVE_INFINITY,o=null;for(let f=0;f<e.length;f++){const h=e[f],{left:p,width:w,top:B,height:H}=h.getBoundingClientRect();let u;r===a.Vertical?u=B+H/2:u=p+w/2;const M=Math.abs(t-u);M<a$1&&(a$1=M,o=h);}if(!o)return null;const{width:m,height:s,left:c,right:l,top:b,bottom:d}=o.getBoundingClientRect();let i;return r===a.Vertical?i=A(t,b,b+s/2,d):i=A(t,c,c+m/2,l),{element:o,placements:i}},T=(e,t)=>(t--,t<0?[]:[{element:e[t],placement:r.Before}]),y=(e,t)=>(t++,t>=e.length?[]:[{element:e[t],placement:r.After}]),E={ArrowLeft:T,ArrowUp:T,ArrowRight:y,ArrowDown:y,Home:(e,t)=>e.slice(0,t).map(r$1=>({element:r$1,placement:r.Before})),End:(e,t)=>e.slice(t+1,e.length).reverse().map(r$1=>({element:r$1,placement:r.After}))},k=(e,t,r)=>P(r.key)?E[r.key](e,e.indexOf(t)):[],P=e=>e in E;

    class DragAndDropHandler {
        constructor(component, config) {
            this.component = component;
            this.config = {
                orientation: a.Vertical,
                clientCoordinate: "clientY",
                ...config,
            };
        }
        ondragenter(e) {
            e.preventDefault();
        }
        ondragleave(e) {
            if (e.relatedTarget instanceof Node && this.component.shadowRoot?.contains(e.relatedTarget)) {
                return;
            }
            const dropIndicator = this.config.getDropIndicator();
            if (dropIndicator) {
                dropIndicator.targetReference = null;
            }
        }
        ondragover(e) {
            if (!this._validateDragOver(e)) {
                return;
            }
            const draggedElement = webcomponentsBase.D$1.getDraggedElement();
            const dropIndicator = this.config.getDropIndicator();
            const closestPosition = this._findClosestPosition(e);
            if (!closestPosition) {
                dropIndicator.targetReference = null;
                return;
            }
            const targetElement = this._transformTargetElement(closestPosition.element);
            if (!this._isValidDragTarget(draggedElement, targetElement)) {
                dropIndicator.targetReference = null;
                return;
            }
            // Filter placements if needed (e.g., ListItemGroup filtering out MovePlacement.On)
            const placements = this._filterPlacements(closestPosition.placements, draggedElement, targetElement);
            const settings = this.config.useOriginalEvent ? { originalEvent: true } : {};
            const { targetReference, placement } = i(e, this.component, {
                element: targetElement,
                placements,
            }, targetElement, settings);
            dropIndicator.targetReference = targetReference;
            dropIndicator.placement = placement;
        }
        ondrop(e) {
            const dropIndicator = this.config.getDropIndicator();
            if (!dropIndicator?.targetReference || !dropIndicator?.placement) {
                e.preventDefault();
                return;
            }
            const settings = this.config.useOriginalEvent ? { originalEvent: true } : {};
            m(e, this.component, dropIndicator.targetReference, dropIndicator.placement, settings);
            dropIndicator.targetReference = null;
        }
        _validateDragOver(e) {
            if (!(e.target instanceof HTMLElement)) {
                return false;
            }
            const draggedElement = webcomponentsBase.D$1.getDraggedElement();
            const dropIndicator = this.config.getDropIndicator();
            return !!(draggedElement && dropIndicator);
        }
        _findClosestPosition(e) {
            const items = this.config.getItems();
            const coordinate = this.config.clientCoordinate === "clientX" ? e.clientX : e.clientY;
            return L(items, coordinate, this.config.orientation);
        }
        _transformTargetElement(element) {
            if (this.config.transformElement) {
                return this.config.transformElement(element);
            }
            return element;
        }
        _isValidDragTarget(draggedElement, targetElement) {
            if (this.config.validateDraggedElement) {
                return this.config.validateDraggedElement(draggedElement, targetElement);
            }
            return true;
        }
        _filterPlacements(placements, draggedElement, targetElement) {
            if (this.config.filterPlacements) {
                return this.config.filterPlacements(placements, draggedElement, targetElement);
            }
            return placements;
        }
    }

    function DropIndicatorTemplate() {
        return parametersBundle_css.jsx("div", { class: {
                "ui5-di-rect": this.placement === r.On,
                "ui5-di-needle": this.placement !== r.On,
            } });
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var DropIndicatorCss = `:host{position:absolute;pointer-events:none;z-index:99}:host([orientation="Vertical"]) .ui5-di-needle{width:.125rem;height:100%;inset-block:0;background:var(--sapContent_DragAndDropActiveColor)}:host([orientation="Vertical"]){margin-left:-.0625rem}:host([orientation="Horizontal"]) .ui5-di-needle{height:.125rem;width:100%;inset-inline:0;background:var(--sapContent_DragAndDropActiveColor)}:host([orientation="Horizontal"]){margin-top:-.0625rem}:host([orientation="Horizontal"][placement="Before"][first]){margin-top:.3125rem}:host([orientation="Horizontal"][placement="After"][last]){margin-top:-.3125rem}:host([orientation="Vertical"]) .ui5-di-needle:before{left:-.1875rem;content:"";position:absolute;width:.25rem;height:.25rem;border-radius:.25rem;border:.125rem solid var(--sapContent_DragAndDropActiveColor);background-color:#fff;pointer-events:none}:host([orientation="Horizontal"]) .ui5-di-needle:before{top:-.1875rem;content:"";position:absolute;width:.25rem;height:.25rem;border-radius:.25rem;border:.125rem solid var(--sapContent_DragAndDropActiveColor);background-color:#fff;pointer-events:none}:host .ui5-di-rect{border:.125rem solid var(--sapContent_DragAndDropActiveColor);position:absolute;inset:0}:host .ui5-di-rect:before{content:" ";position:absolute;inset:0;background:var(--sapContent_DragAndDropActiveColor);opacity:.05}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
     * ### Usage
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/DropIndicator.js";`
     *
     * @constructor
     * @extends UI5Element
     * @private
     */
    let DropIndicator = class DropIndicator extends webcomponentsBase.b {
        get _positionProperty() {
            if (this.orientation === a.Vertical) {
                return "left";
            }
            return "top";
        }
        constructor() {
            super();
            /**
             * Element where the drop indicator will be shown.
             *
             * @public
             * @default null
             */
            this.targetReference = null;
            /**
             * Owner of the indicator and the target.
             * @public
             * @default null
             */
            this.ownerReference = null;
            /**
             * Placement of the indicator relative to the target.
             *
             * @default "Before"
             * @public
             */
            this.placement = "Before";
            /**
             * Orientation of the indicator.
             *
             * @default "Vertical"
             * @public
             */
            this.orientation = "Vertical";
        }
        onAfterRendering() {
            if (!this.targetReference || !this.ownerReference) {
                Object.assign(this.style, {
                    display: "none",
                });
                return;
            }
            const { left, width, right, top, bottom, height, } = this.targetReference.getBoundingClientRect();
            const { top: containerTop, height: containerHeight, } = this.ownerReference.getBoundingClientRect();
            const style = {
                display: "",
                [this._positionProperty]: "",
                width: "",
                height: "",
            };
            let position = 0;
            let isLast = false;
            let isFirst = false;
            if (this.orientation === a.Vertical) {
                switch (this.placement) {
                    case r.Before:
                        position = left;
                        break;
                    case r.On:
                        style.width = `${width}px`;
                        position = left;
                        break;
                    case r.After:
                        position = right;
                        break;
                }
                style.height = `${height}px`;
            }
            if (this.orientation === a.Horizontal) {
                switch (this.placement) {
                    case r.Before:
                        position = top;
                        break;
                    case r.On:
                        style.height = `${height}px`;
                        position = top;
                        break;
                    case r.After:
                        position = bottom;
                        break;
                }
                style.width = `${width}px`;
                position -= containerTop;
                if (position <= 0) {
                    isFirst = true;
                }
                if (position >= containerHeight) {
                    isLast = true;
                }
            }
            style[this._positionProperty] = `${position}px`;
            this.toggleAttribute("first", isFirst);
            this.toggleAttribute("last", isLast);
            Object.assign(this.style, style);
        }
    };
    __decorate$2([
        webcomponentsBase.s({ type: Object })
    ], DropIndicator.prototype, "targetReference", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Object })
    ], DropIndicator.prototype, "ownerReference", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], DropIndicator.prototype, "placement", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], DropIndicator.prototype, "orientation", void 0);
    DropIndicator = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-drop-indicator",
            renderer: parametersBundle_css.y,
            styles: DropIndicatorCss,
            template: DropIndicatorTemplate,
        })
    ], DropIndicator);
    DropIndicator.define();
    var DropIndicator$1 = DropIndicator;

    function ListItemGroupHeaderTemplate() {
        return (parametersBundle_css.jsxs("div", { part: "native-li", role: this.effectiveAccRole, tabindex: this.forcedTabIndex ? parseInt(this.forcedTabIndex) : undefined, class: {
                "ui5-ghli-root": true,
                ...this.classes.main,
            }, "aria-label": this.ariaLabelText, "aria-roledescription": this.groupHeaderText, onFocusIn: this._onfocusin, onKeyDown: this._onkeydown, children: [parametersBundle_css.jsx("div", { id: `${this._id}-content`, class: "ui5-li-content", children: renderTitle.call(this) }), this.hasSubItems && parametersBundle_css.jsx("slot", { name: "subItems" })] }));
    }
    function renderTitle() {
        if (this.wrappingType === WrappingType.WrappingType.Normal) {
            return this.expandableTextTemplate?.call(this, {
                className: "ui5-ghli-title",
                text: this._textContent,
                maxCharacters: this._maxCharacters,
                part: "title",
            });
        }
        return (parametersBundle_css.jsx("span", { part: "title", class: "ui5-ghli-title", children: parametersBundle_css.jsx("slot", {}) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var ListItemGroupHeaderCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{height:var(--_ui5-v2-15-0_group_header_list_item_height);background:var(--ui5-v2-15-0-group-header-listitem-background-color);color:var(--sapList_TableGroupHeaderTextColor)}:host([wrapping-type="Normal"]){height:auto}:host([has-border]){border-bottom:var(--sapList_BorderWidth) solid var(--sapList_GroupHeaderBorderColor)}:host([actionable]:not([disabled])){cursor:default}.ui5-li-root.ui5-ghli-root{padding-top:.5rem;color:currentColor;font-size:var(--sapFontHeader6Size);font-weight:400;line-height:2rem;margin:0}.ui5-ghli-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-family:var(--sapFontHeaderFamily)}.ui5-li-content{width:100%}
`;

    /**
     * ListItem accessible roles.
     * @public
     * @since 2.0.0
     */
    var ListItemAccessibleRole;
    (function (ListItemAccessibleRole) {
        /**
         * Represents the ARIA role "group".
         * @private
         */
        ListItemAccessibleRole["Group"] = "Group";
        /**
         * Represents the ARIA role "listitem". (by default)
         * @public
         */
        ListItemAccessibleRole["ListItem"] = "ListItem";
        /**
         * Represents the ARIA role "menuitem".
         * @public
         */
        ListItemAccessibleRole["MenuItem"] = "MenuItem";
        /**
         * Represents the ARIA role "treeitem".
         * @public
         */
        ListItemAccessibleRole["TreeItem"] = "TreeItem";
        /**
         * Represents the ARIA role "option".
         * @public
         */
        ListItemAccessibleRole["Option"] = "Option";
        /**
         * Represents the ARIA role "none".
         * @public
         */
        ListItemAccessibleRole["None"] = "None";
    })(ListItemAccessibleRole || (ListItemAccessibleRole = {}));
    var ListItemAccessibleRole$1 = ListItemAccessibleRole;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ListItemGroupHeader_1;
    /**
     * Maximum number of characters to display for small screens (Size S)
     * @private
     */
    const MAX_CHARACTERS_SIZE_S = 100;
    /**
     * Maximum number of characters to display for medium and larger screens (Size M and above)
     * @private
     */
    const MAX_CHARACTERS_SIZE_M = 300;
    /**
     * @class
     * The `ui5-li-group-header` is a special list item, used only to separate other list items into logical groups.
     * @slot {Node[]} default - Defines the text of the component.
     *
     * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     * @constructor
     * @extends ListItemBase
     * @private
     */
    let ListItemGroupHeader = ListItemGroupHeader_1 = class ListItemGroupHeader extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            this.accessibleRole = ListItemAccessibleRole$1.ListItem;
            /**
             * Defines if the text of the component should wrap when it's too long.
             * When set to "Normal", the content (title, description) will be wrapped
             * using the `ui5-expandable-text` component.<br/>
             *
             * The text can wrap up to 100 characters on small screens (size S) and
             * up to 300 characters on larger screens (size M and above). When text exceeds
             * these limits, it truncates with an ellipsis followed by a text expansion trigger.
             *
             * Available options are:
             * - `None` (default) - The text will truncate with an ellipsis.
             * - `Normal` - The text will wrap (without truncation).
             *
             * @default "None"
             * @public
             * @since 2.15.0
             */
            this.wrappingType = "None";
            /**
             * Defines the current media query size.
             * @default "S"
             * @private
             */
            this.mediaRange = "S";
        }
        get effectiveAccRole() {
            return toLowercaseEnumValue.n(this.accessibleRole);
        }
        get groupItem() {
            return true;
        }
        get _pressable() {
            return false;
        }
        get groupHeaderText() {
            return ListItemGroupHeader_1.i18nBundle.getText(i18nDefaults.GROUP_HEADER_TEXT);
        }
        get defaultSlotText() {
            return this.textContent;
        }
        get ariaLabelText() {
            return [this.textContent, this.accessibleName].filter(Boolean).join(" ");
        }
        get hasSubItems() {
            return this.subItems.length > 0;
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            // Only load ExpandableText if "Normal" wrapping is used
            if (this.wrappingType === "Normal") {
                // If feature is already loaded (preloaded by the user via importing ListItemGroupHeaderExpandableText.js), the template is already available
                if (ListItemGroupHeader_1.ExpandableTextTemplate) {
                    this.expandableTextTemplate = ListItemGroupHeader_1.ExpandableTextTemplate;
                    // If feature is not preloaded, load the template dynamically
                }
                else {
                    new Promise(function (resolve, reject) { require(['sap/f/thirdparty/_dynamics/ListItemStandardExpandableTextTemplate'], resolve, reject); }).then(module => {
                        this.expandableTextTemplate = module.default;
                    });
                }
            }
        }
        /**
         * Determines the maximum characters to display based on the current media range.
         * - Size S: 100 characters
         * - Size M and larger: 300 characters
         * @private
         */
        get _maxCharacters() {
            return this.mediaRange === "S" ? MAX_CHARACTERS_SIZE_S : MAX_CHARACTERS_SIZE_M;
        }
        /**
         * Returns the content text, either from text property or from the default slot
         * @private
         */
        get _textContent() {
            return this.defaultSlotText || this.groupHeaderText || "";
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemGroupHeader.prototype, "accessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemGroupHeader.prototype, "accessibleRole", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemGroupHeader.prototype, "wrappingType", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemGroupHeader.prototype, "mediaRange", void 0);
    __decorate$1([
        webcomponentsBase.s({ noAttribute: true })
    ], ListItemGroupHeader.prototype, "expandableTextTemplate", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], ListItemGroupHeader.prototype, "subItems", void 0);
    __decorate$1([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], ListItemGroupHeader, "i18nBundle", void 0);
    ListItemGroupHeader = ListItemGroupHeader_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-li-group-header",
            languageAware: true,
            template: ListItemGroupHeaderTemplate,
            styles: [ListItemBase.ListItemBase.styles, ListItemGroupHeaderCss],
        })
    ], ListItemGroupHeader);
    ListItemGroupHeader.define();
    var ListItemGroupHeader$1 = ListItemGroupHeader;

    function ListItemGroupTemplate() {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [this.hasHeader &&
                    parametersBundle_css.jsxs(ListItemGroupHeader$1, { wrappingType: this.wrappingType, focused: this.focused, part: "header", accessibleRole: ListItemAccessibleRole$1.ListItem, children: [this.hasFormattedHeader ? parametersBundle_css.jsx("slot", { name: "header" }) : this.headerText, parametersBundle_css.jsx("div", { role: "list", slot: "subItems", "aria-owns": `${this._id}-content`, "aria-label": this.headerText })] }), parametersBundle_css.jsxs("div", { class: "ui5-group-li-root", onDragEnter: this._ondragenter, onDragOver: this._ondragover, onDrop: this._ondrop, onDragLeave: this._ondragleave, id: `${this._id}-content`, children: [parametersBundle_css.jsx("slot", {}), parametersBundle_css.jsx(DropIndicator$1, { orientation: "Horizontal", ownerReference: this })] })] }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var ListItemGroupCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{height:var(--_ui5-v2-15-0_group_header_list_item_height);background:var(--ui5-v2-15-0-group-header-listitem-background-color);color:var(--sapList_TableGroupHeaderTextColor)}.ui5-group-li-root{width:100%;height:100%;position:relative;box-sizing:border-box;padding:0;margin:0;list-style-type:none}
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
     * The `ui5-li-group` is a special list item, used only to create groups of list items.
     *
     * This is the item to use inside a `ui5-list`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents/dist/ListItemGroup.js";`
     * @csspart header - Used to style the header item of the group
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.0.0
     */
    let ListItemGroup = class ListItemGroup extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines if the text of the component should wrap when it's too long.
             * When set to "Normal", the content (title, description) will be wrapped
             * using the `ui5-expandable-text` component.<br/>
             *
             * The text can wrap up to 100 characters on small screens (size S) and
             * up to 300 characters on larger screens (size M and above). When text exceeds
             * these limits, it truncates with an ellipsis followed by a text expansion trigger.
             *
             * Available options are:
             * - `None` (default) - The text will truncate with an ellipsis.
             * - `Normal` - The text will wrap (without truncation).
             *
             * @default "None"
             * @public
             * @since 2.15.0
             */
            this.wrappingType = "None";
            /**
             * Indicates whether the header is focused
             * @private
             */
            this.focused = false;
            // Initialize the DragAndDropHandler with the necessary configurations
            // The handler will manage the drag and drop operations for the list items.
            this._dragAndDropHandler = new DragAndDropHandler(this, {
                getItems: () => this.items,
                getDropIndicator: () => this.dropIndicatorDOM,
                filterPlacements: this._filterPlacements.bind(this),
            });
        }
        get groupHeaderItem() {
            return this.shadowRoot.querySelector("[ui5-li-group-header]");
        }
        get hasHeader() {
            return !!this.headerText || this.hasFormattedHeader;
        }
        get hasFormattedHeader() {
            return !!this.header.length;
        }
        get isListItemGroup() {
            return true;
        }
        get dropIndicatorDOM() {
            return this.shadowRoot.querySelector("[ui5-drop-indicator]");
        }
        _ondragenter(e) {
            this._dragAndDropHandler.ondragenter(e);
        }
        _ondragleave(e) {
            this._dragAndDropHandler.ondragleave(e);
        }
        _ondragover(e) {
            this._dragAndDropHandler.ondragover(e);
        }
        _ondrop(e) {
            this._dragAndDropHandler.ondrop(e);
        }
        _filterPlacements(placements, draggedElement, targetElement) {
            // Filter out MovePlacement.On when dragged element is the same as target
            if (targetElement === draggedElement) {
                return placements.filter(placement => placement !== r.On);
            }
            return placements;
        }
        getFocusDomRef() {
            return this.groupHeaderItem || this.items.at(0);
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], ListItemGroup.prototype, "headerText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemGroup.prototype, "headerAccessibleName", void 0);
    __decorate([
        webcomponentsBase.d({
            "default": true,
            invalidateOnChildChange: true,
            type: HTMLElement,
        })
    ], ListItemGroup.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemGroup.prototype, "wrappingType", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemGroup.prototype, "focused", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement })
    ], ListItemGroup.prototype, "header", void 0);
    ListItemGroup = __decorate([
        webcomponentsBase.m({
            tag: "ui5-li-group",
            renderer: parametersBundle_css.y,
            languageAware: true,
            template: ListItemGroupTemplate,
            styles: [ListItemGroupCss],
        })
        /**
         * Fired when a movable list item is moved over a potential drop target during a dragging operation.
         *
         * If the new position is valid, prevent the default action of the event using `preventDefault()`.
         * @param {object} source Contains information about the moved element under `element` property.
         * @param {object} destination Contains information about the destination of the moved element. Has `element` and `placement` properties.
         * @public
         * @since 2.1.0
         */
        ,
        eventStrict.l("move-over", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when a movable list item is dropped onto a drop target.
         *
         * **Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action.
         * @param {object} source Contains information about the moved element under `element` property.
         * @param {object} destination Contains information about the destination of the moved element. Has `element` and `placement` properties.
         * @public
         * @since 2.1.0
         */
        ,
        eventStrict.l("move", {
            bubbles: true,
        })
    ], ListItemGroup);
    ListItemGroup.define();
    const isInstanceOfListItemGroup = (object) => {
        return "isListItemGroup" in object;
    };
    var ListItemGroup$1 = ListItemGroup;

    exports.DragAndDropHandler = DragAndDropHandler;
    exports.DropIndicator = DropIndicator$1;
    exports.ListItemAccessibleRole = ListItemAccessibleRole$1;
    exports.ListItemGroup = ListItemGroup$1;
    exports.ListItemGroupHeader = ListItemGroupHeader$1;
    exports.isInstanceOfListItemGroup = isInstanceOfListItemGroup;
    exports.k = k;

}));
