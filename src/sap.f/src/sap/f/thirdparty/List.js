sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/i18n-defaults2'], (function (exports, webcomponentsBase, parametersBundle_css, toLowercaseEnumValue, eventStrict, parametersBundle_css$1, Theme, ListItemGroup, AccessibilityTextsHelper, BusyIndicator, i18nDefaults) { 'use strict';

    /**
     * Different list selection modes.
     * @public
     */
    var ListSelectionMode;
    (function (ListSelectionMode) {
        /**
         * Default mode (no selection).
         * @public
         */
        ListSelectionMode["None"] = "None";
        /**
         * Right-positioned single selection mode (only one list item can be selected).
         * @public
         */
        ListSelectionMode["Single"] = "Single";
        /**
         * Left-positioned single selection mode (only one list item can be selected).
         * @public
         */
        ListSelectionMode["SingleStart"] = "SingleStart";
        /**
         * Selected item is highlighted but no selection element is visible
         * (only one list item can be selected).
         * @public
         */
        ListSelectionMode["SingleEnd"] = "SingleEnd";
        /**
         * Selected item is highlighted and selection is changed upon arrow navigation
         * (only one list item can be selected - this is always the focused item).
         * @public
         */
        ListSelectionMode["SingleAuto"] = "SingleAuto";
        /**
         * Multi selection mode (more than one list item can be selected).
         * @public
         */
        ListSelectionMode["Multiple"] = "Multiple";
        /**
         * Delete mode (only one list item can be deleted via provided delete button)
         * @public
         */
        ListSelectionMode["Delete"] = "Delete";
    })(ListSelectionMode || (ListSelectionMode = {}));
    var ListSelectionMode$1 = ListSelectionMode;

    const t=e=>{let o=e;return e.shadowRoot&&e.shadowRoot.activeElement&&(o=e.shadowRoot.activeElement),o};

    let e=null;const u=(t,o)=>{e&&clearTimeout(e),e=setTimeout(()=>{e=null,t();},o);};

    const n=e=>{const t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)};

    /**
     * Different list growing modes.
     * @public
     */
    var ListGrowingMode;
    (function (ListGrowingMode) {
        /**
         * Component's "load-more" is fired upon pressing a "More" button.
         * at the bottom.
         * @public
         */
        ListGrowingMode["Button"] = "Button";
        /**
         * Component's "load-more" is fired upon scroll.
         * @public
         */
        ListGrowingMode["Scroll"] = "Scroll";
        /**
         * Component's growing is not enabled.
         * @public
         */
        ListGrowingMode["None"] = "None";
    })(ListGrowingMode || (ListGrowingMode = {}));
    var ListGrowingMode$1 = ListGrowingMode;

    /**
     * List accessible roles.
     * @public
     * @since 2.0.0
     */
    var ListAccessibleRole;
    (function (ListAccessibleRole) {
        /**
         * Represents the ARIA role "list". (by default)
         * @public
         */
        ListAccessibleRole["List"] = "List";
        /**
         * Represents the ARIA role "menu".
         * @public
         */
        ListAccessibleRole["Menu"] = "Menu";
        /**
         * Represents the ARIA role "tree".
         * @public
         */
        ListAccessibleRole["Tree"] = "Tree";
        /**
         * Represents the ARIA role "listbox".
         * @public
         */
        ListAccessibleRole["ListBox"] = "ListBox";
    })(ListAccessibleRole || (ListAccessibleRole = {}));
    var ListAccessibleRole$1 = ListAccessibleRole;

    /**
     * Different types of list items separators.
     * @public
     * @since 2.0.0
     */
    var ListSeparator;
    (function (ListSeparator) {
        /**
         * Separators between the items including the last and the first one.
         * @public
         */
        ListSeparator["All"] = "All";
        /**
         * Separators between the items.
         * Note: This enumeration depends on the theme.
         * @public
         */
        ListSeparator["Inner"] = "Inner";
        /**
         * No item separators.
         * @public
         */
        ListSeparator["None"] = "None";
    })(ListSeparator || (ListSeparator = {}));
    var ListSeparator$1 = ListSeparator;

    function ListTemplate() {
        return (parametersBundle_css.jsx("div", { class: "ui5-list-root", onFocusIn: this._onfocusin, onKeyDown: this._onkeydown, onDragEnter: this._ondragenter, onDragOver: this._ondragover, onDrop: this._ondrop, onDragLeave: this._ondragleave, "onui5-_close": this.onItemClose, "onui5-toggle": this.onItemToggle, "onui5-request-tabindex-change": this.onItemTabIndexChange, "onui5-_focused": this.onItemFocused, "onui5-forward-after": this.onForwardAfter, "onui5-forward-before": this.onForwardBefore, "onui5-selection-requested": this.onSelectionRequested, "onui5-focus-requested": this.onFocusRequested, "onui5-_press": this.onItemPress, children: parametersBundle_css.jsxs(BusyIndicator.BusyIndicator, { id: `${this._id}-busyIndicator`, delay: this.loadingDelay, active: this.showBusyIndicatorOverlay, class: "ui5-list-busy-indicator", children: [parametersBundle_css.jsxs("div", { class: "ui5-list-scroll-container", children: [parametersBundle_css.jsx("span", { tabindex: -1, "aria-hidden": "true", class: "ui5-list-start-marker" }), this.header.length > 0 && parametersBundle_css.jsx("slot", { name: "header" }), this.shouldRenderH1 &&
                                parametersBundle_css.jsx("header", { id: this.headerID, class: "ui5-list-header", children: this.headerText }), this.hasData &&
                                parametersBundle_css.jsx("div", { id: `${this._id}-before`, tabindex: 0, role: "none", class: "ui5-list-focusarea" }), parametersBundle_css.jsx("span", { id: `${this._id}-modeLabel`, class: "ui5-hidden-text", children: this.ariaLabelModeText }), parametersBundle_css.jsxs("ul", { id: `${this._id}-listUl`, class: "ui5-list-ul", role: this.listAccessibleRole, "aria-label": this.ariaLabelTxt, "aria-labelledby": this.ariaLabelledBy, "aria-description": this.ariaDescriptionText, children: [parametersBundle_css.jsx("slot", {}), this.showNoDataText &&
                                        parametersBundle_css.jsx("li", { tabindex: 0, id: `${this._id}-nodata`, class: "ui5-list-nodata", role: "listitem", children: parametersBundle_css.jsx("div", { id: `${this._id}-nodata-text`, class: "ui5-list-nodata-text", children: this.noDataText }) })] }), this.growsWithButton && moreRow.call(this), this.footerText &&
                                parametersBundle_css.jsx("footer", { id: `${this._id}-footer`, class: "ui5-list-footer", children: this.footerText }), this.hasData &&
                                parametersBundle_css.jsx("div", { id: `${this._id}-after`, tabindex: 0, role: "none", class: "ui5-list-focusarea" }), parametersBundle_css.jsx("span", { tabindex: -1, "aria-hidden": "true", class: "ui5-list-end-marker" })] }), parametersBundle_css.jsx(ListItemGroup.DropIndicator, { orientation: "Horizontal", ownerReference: this })] }) }));
    }
    function moreRow() {
        return (parametersBundle_css.jsx("div", { class: "ui5-growing-button", part: "growing-button", children: parametersBundle_css.jsxs("div", { id: `${this._id}-growing-btn`, role: "button", tabindex: 0, part: "growing-button-inner", class: {
                    "ui5-growing-button-inner": true,
                    "ui5-growing-button-inner-active": this._loadMoreActive,
                }, "aria-label": this.growingButtonAriaLabel, "aria-labelledby": this.growingButtonAriaLabelledBy, onClick: this._onLoadMoreClick, onKeyDown: this._onLoadMoreKeydown, onKeyUp: this._onLoadMoreKeyup, onMouseDown: this._onLoadMoreMousedown, onMouseUp: this._onLoadMoreMouseup, children: [this.loading &&
                        parametersBundle_css.jsx(BusyIndicator.BusyIndicator, { delay: this.loadingDelay, part: "growing-button-busy-indicator", class: "ui5-list-growing-button-busy-indicator", active: true }), parametersBundle_css.jsx("span", { id: `${this._id}-growingButton-text`, class: "ui5-growing-button-text", "growing-button-text": true, children: this._growingButtonText })] }) }));
    }

    Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var listCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}.ui5-growing-button{display:flex;align-items:center;padding:var(--_ui5-v2-15-0_load_more_padding);border-top:1px solid var(--sapList_BorderColor);border-bottom:var(--_ui5-v2-15-0_load_more_border-bottom);box-sizing:border-box;cursor:pointer;outline:none}.ui5-growing-button-inner{display:flex;align-items:center;justify-content:center;flex-direction:row;min-height:var(--_ui5-v2-15-0_load_more_text_height);width:100%;color:var(--sapButton_TextColor);background-color:var(--sapList_Background);border:var(--_ui5-v2-15-0_load_more_border);border-radius:var(--_ui5-v2-15-0_load_more_border_radius);box-sizing:border-box}.ui5-growing-button-inner:focus-visible{outline:var(--_ui5-v2-15-0_load_more_outline_width) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:-.125rem;border-color:transparent}.ui5-growing-button-inner:hover{background-color:var(--sapList_Hover_Background)}.ui5-growing-button-inner:active,.ui5-growing-button-inner.ui5-growing-button-inner--active{background-color:var(--sapList_Active_Background);border-color:var(--sapList_Active_Background)}.ui5-growing-button-inner:active>*,.ui5-growing-button-inner.ui5-growing-button-inner--active>*{color:var(--sapList_Active_TextColor)}.ui5-growing-button-text{text-align:center;font-family:var(--sapFontFamily);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}.ui5-growing-button-text{height:var(--_ui5-v2-15-0_load_more_text_height);padding:.875rem 1rem 1rem;font-size:var(--_ui5-v2-15-0_load_more_text_font_size);font-weight:700}:host([loading]) .ui5-list-growing-button-busy-indicator:not([_is-busy]){display:none}:host([loading]) .ui5-list-growing-button-busy-indicator[_is-busy]+.ui5-growing-button-text{padding-left:.5rem}:host(:not([hidden])){display:block;max-width:100%;width:100%;-webkit-tap-highlight-color:transparent}:host([indent]) .ui5-list-root{padding:2rem}:host([separators="None"]) .ui5-list-nodata{border-bottom:0}.ui5-list-root,.ui5-list-busy-indicator{width:100%;height:100%;position:relative;box-sizing:border-box}.ui5-list-scroll-container{overflow:auto;height:100%;width:100%}.ui5-list-ul{list-style-type:none;padding:0;margin:0}.ui5-list-ul:focus{outline:none}.ui5-list-focusarea{position:fixed}.ui5-list-header{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;box-sizing:border-box;font-size:var(--sapFontHeader4Size);font-family:var(--sapFontFamily);color:var(--sapGroup_TitleTextColor);height:3rem;line-height:3rem;padding:0 1rem;background-color:var(--sapGroup_TitleBackground);border-bottom:1px solid var(--sapGroup_TitleBorderColor)}.ui5-list-footer{height:2rem;box-sizing:border-box;-webkit-text-size-adjust:none;font-size:var(--sapFontSize);font-family:var(--sapFontFamily);line-height:2rem;background-color:var(--sapList_FooterBackground);color:var(--ui5-v2-15-0_list_footer_text_color);padding:0 1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-list-nodata{list-style-type:none;display:-webkit-box;display:flex;-webkit-box-align:center;align-items:center;-webkit-box-pack:center;justify-content:center;color:var(--sapTextColor);background-color:var(--sapList_Background);border-bottom:1px solid var(--sapList_BorderColor);padding:0 1rem!important;outline:none;min-height:var(--_ui5-v2-15-0_list_no_data_height);font-size:var(--_ui5-v2-15-0_list_no_data_font_size);font-family:var(--sapFontFamily);position:relative}.ui5-list-nodata:focus:after{content:"";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;inset:.125rem;pointer-events:none}.ui5-list-nodata-text{overflow:hidden;text-overflow:ellipsis;white-space:normal;margin:var(--_ui5-v2-15-0_list_item_content_vertical_offset) 0}:host([growing="Scroll"]) .ui5-list-end-marker{display:inline-block}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var List_1;
    const INFINITE_SCROLL_DEBOUNCE_RATE = 250; // ms
    const PAGE_UP_DOWN_SIZE = 10;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-list` component allows displaying a list of items, advanced keyboard
     * handling support for navigating between items, and predefined modes to improve the development efficiency.
     *
     * The `ui5-list` is a container for the available list items:
     *
     * - `ui5-li`
     * - `ui5-li-custom`
     * - `ui5-li-group`
     *
     * To benefit from the built-in selection mechanism, you can use the available
     * selection modes, such as
     * `Single`, `Multiple` and `Delete`.
     *
     * Additionally, the `ui5-list` provides header, footer, and customization for the list item separators.
     *
     * ### Keyboard Handling
     *
     * #### Basic Navigation
     * The `ui5-list` provides advanced keyboard handling.
     * When a list is focused the user can use the following keyboard
     * shortcuts in order to perform a navigation:
     *
     * - [Up] or [Down] - Navigates up and down the items
     * - [Home] - Navigates to first item
     * - [End] - Navigates to the last item
     *
     * The user can use the following keyboard shortcuts to perform actions (such as select, delete),
     * when the `selectionMode` property is in use:
     *
     * - [Space] - Select an item (if `type` is 'Active') when `selectionMode` is selection
     * - [Delete] - Delete an item if `selectionMode` property is `Delete`
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/List.js";`
     *
     * `import "@ui5/webcomponents/dist/ListItemStandard.js";` (for `ui5-li`)
     *
     * `import "@ui5/webcomponents/dist/ListItemCustom.js";` (for `ui5-li-custom`)
     *
     * `import "@ui5/webcomponents/dist/ListItemGroup.js";` (for `ui5-li-group`)
     * @constructor
     * @extends UI5Element
     * @public
     * @csspart growing-button - Used to style the button, that is used for growing of the component
     * @csspart growing-button-inner - Used to style the button inner element
     */
    let List = List_1 = class List extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Determines whether the component is indented.
             * @default false
             * @public
             */
            this.indent = false;
            /**
             * Defines the selection mode of the component.
             * @default "None"
             * @public
             */
            this.selectionMode = "None";
            /**
             * Defines the item separator style that is used.
             * @default "All"
             * @public
             */
            this.separators = "All";
            /**
             * Defines whether the component will have growing capability either by pressing a `More` button,
             * or via user scroll. In both cases `load-more` event is fired.
             *
             * **Restrictions:** `growing="Scroll"` is not supported for Internet Explorer,
             * on IE the component will fallback to `growing="Button"`.
             * @default "None"
             * @since 1.0.0-rc.13
             * @public
             */
            this.growing = "None";
            /**
             * Defines if the component would display a loading indicator over the list.
             * @default false
             * @public
             * @since 1.0.0-rc.6
             */
            this.loading = false;
            /**
             * Defines the delay in milliseconds, after which the loading indicator will show up for this component.
             * @default 1000
             * @public
             */
            this.loadingDelay = 1000;
            /**
            * Defines additional accessibility attributes on different areas of the component.
            *
            * The accessibilityAttributes object has the following field:
            *
            *  - **growingButton**: `growingButton.name`.
            *
            * The accessibility attributes support the following values:
            *
            * - **name**: Defines the accessible ARIA name of the growing button.
            * Accepts any string.
            *
            * **Note:** The `accessibilityAttributes` property is in an experimental state and is a subject to change.
            * @default {}
            * @public
            * @since 2.13.0
            */
            this.accessibilityAttributes = {};
            /**
             * Defines the accessible role of the component.
             * @public
             * @default "List"
             * @since 1.0.0-rc.15
             */
            this.accessibleRole = "List";
            /**
             * Defines if the entire list is in view port.
             * @private
             */
            this._inViewport = false;
            /**
             * Defines the active state of the `More` button.
             * @private
             */
            this._loadMoreActive = false;
            /**
             * Defines the current media query size.
             * @default "S"
             * @private
             */
            this.mediaRange = "S";
            this._startMarkerOutOfView = false;
            this._previouslyFocusedItem = null;
            // Indicates that the List is forwarding the focus before or after the internal ul.
            this._forwardingFocus = false;
            this._itemNavigation = new webcomponentsBase.f$1(this, {
                skipItemsSize: PAGE_UP_DOWN_SIZE, // PAGE_UP and PAGE_DOWN will skip trough 10 items
                navigationMode: webcomponentsBase.r.Vertical,
                getItemsCallback: () => this.getEnabledItems(),
            });
            this.handleResizeCallback = this._handleResize.bind(this);
            this._groupCount = 0;
            this._groupItemCount = 0;
            this.onItemFocusedBound = this.onItemFocused.bind(this);
            this.onForwardAfterBound = this.onForwardAfter.bind(this);
            this.onForwardBeforeBound = this.onForwardBefore.bind(this);
            this.onItemTabIndexChangeBound = this.onItemTabIndexChange.bind(this);
            // Initialize the DragAndDropHandler with the necessary configurations
            // The handler will manage the drag and drop operations for the list items.
            this._dragAndDropHandler = new ListItemGroup.DragAndDropHandler(this, {
                getItems: () => this.items,
                getDropIndicator: () => this.dropIndicatorDOM,
                useOriginalEvent: true,
            });
        }
        /**
         * Returns an array containing the list item instances without the groups in a flat structure.
         * @default []
         * @since 2.0.0
         * @public
         */
        get listItems() {
            return this.getItems();
        }
        _updateAssociatedLabelsTexts() {
            this._associatedDescriptionRefTexts = AccessibilityTextsHelper.p(this);
            this._associatedLabelsRefTexts = AccessibilityTextsHelper.E(this);
        }
        onEnterDOM() {
            AccessibilityTextsHelper.y(this, this._updateAssociatedLabelsTexts.bind(this));
            webcomponentsBase.f.register(this.getDomRef(), this.handleResizeCallback);
        }
        onExitDOM() {
            AccessibilityTextsHelper.T(this);
            this.unobserveListEnd();
            this.unobserveListStart();
            webcomponentsBase.f.deregister(this.getDomRef(), this.handleResizeCallback);
        }
        onBeforeRendering() {
            this.detachGroupHeaderEvents();
            this.prepareListItems();
        }
        onAfterRendering() {
            this.attachGroupHeaderEvents();
            if (this.growsOnScroll) {
                this.observeListEnd();
                this.observeListStart();
            }
            else {
                this.unobserveListEnd();
                this.unobserveListStart();
            }
            if (this.grows) {
                this.checkListInViewport();
            }
        }
        attachGroupHeaderEvents() {
            // events fired by the group headers are not bubbling through the shadow
            // dom of the groups because of capture: false of the custom events
            this.getItems().forEach(item => {
                if (item.hasAttribute("ui5-li-group-header")) {
                    item.addEventListener("ui5-_focused", this.onItemFocusedBound);
                    item.addEventListener("ui5-forward-after", this.onForwardAfterBound);
                    item.addEventListener("ui5-forward-before", this.onForwardBeforeBound);
                }
            });
        }
        detachGroupHeaderEvents() {
            this.getItems().forEach(item => {
                if (item.hasAttribute("ui5-li-group-header")) {
                    item.removeEventListener("ui5-_focused", this.onItemFocusedBound);
                    item.removeEventListener("ui5-forward-after", this.onForwardAfterBound);
                    item.removeEventListener("ui5-forward-before", this.onForwardBeforeBound);
                }
            });
        }
        getFocusDomRef() {
            return this._itemNavigation._getCurrentItem();
        }
        get shouldRenderH1() {
            return !this.header.length && this.headerText;
        }
        get headerID() {
            return `${this._id}-header`;
        }
        get modeLabelID() {
            return `${this._id}-modeLabel`;
        }
        get listEndDOM() {
            return this.shadowRoot.querySelector(".ui5-list-end-marker");
        }
        get listStartDOM() {
            return this.shadowRoot.querySelector(".ui5-list-start-marker");
        }
        get dropIndicatorDOM() {
            return this.shadowRoot.querySelector("[ui5-drop-indicator]");
        }
        get hasData() {
            return this.getItems().length !== 0;
        }
        get showBusyIndicatorOverlay() {
            return !this.growsWithButton && this.loading;
        }
        get showNoDataText() {
            return !this.hasData && this.noDataText;
        }
        get isDelete() {
            return this.selectionMode === ListSelectionMode$1.Delete;
        }
        get isSingleSelect() {
            return [
                ListSelectionMode$1.Single,
                ListSelectionMode$1.SingleStart,
                ListSelectionMode$1.SingleEnd,
                ListSelectionMode$1.SingleAuto,
            ].includes(this.selectionMode);
        }
        get isMultiple() {
            return this.selectionMode === ListSelectionMode$1.Multiple;
        }
        get ariaLabelledBy() {
            if (this.accessibleNameRef || this.accessibleName) {
                return undefined;
            }
            const ids = [];
            if (this.isMultiple || this.isSingleSelect || this.isDelete) {
                ids.push(this.modeLabelID);
            }
            if (this.shouldRenderH1) {
                ids.push(this.headerID);
            }
            return ids.length ? ids.join(" ") : undefined;
        }
        get ariaLabelTxt() {
            return this._associatedLabelsRefTexts || AccessibilityTextsHelper.A(this);
        }
        get ariaDescriptionText() {
            return this._associatedDescriptionRefTexts || AccessibilityTextsHelper.L(this) || this._getDescriptionForGroups();
        }
        get growingButtonAriaLabel() {
            return this.accessibilityAttributes.growingButton?.name;
        }
        get growingButtonAriaLabelledBy() {
            return this.accessibilityAttributes.growingButton?.name ? undefined : `${this._id}-growingButton-text`;
        }
        hasGrowingComponent() {
            if (this.growsOnScroll) {
                return this._startMarkerOutOfView;
            }
            return this.growsWithButton;
        }
        _getDescriptionForGroups() {
            let description = "";
            if (this._groupCount > 0) {
                if (this.accessibleRole === ListAccessibleRole$1.List) {
                    description = List_1.i18nBundle.getText(i18nDefaults.LIST_ROLE_LIST_GROUP_DESCRIPTION, this._groupCount, this._groupItemCount);
                }
                else if (this.accessibleRole === ListAccessibleRole$1.ListBox) {
                    description = List_1.i18nBundle.getText(i18nDefaults.LIST_ROLE_LISTBOX_GROUP_DESCRIPTION, this._groupCount);
                }
            }
            return description;
        }
        get ariaLabelModeText() {
            if (this.hasData) {
                if (this.isMultiple) {
                    return List_1.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_MULTISELECTABLE);
                }
                if (this.isSingleSelect) {
                    return List_1.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_SELECTABLE);
                }
                if (this.isDelete) {
                    return List_1.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_DELETABLE);
                }
            }
            return "";
        }
        get grows() {
            return this.growing !== ListGrowingMode$1.None;
        }
        get growsOnScroll() {
            return this.growing === ListGrowingMode$1.Scroll;
        }
        get growsWithButton() {
            return this.growing === ListGrowingMode$1.Button;
        }
        get _growingButtonText() {
            return this.growingButtonText || List_1.i18nBundle.getText(i18nDefaults.LOAD_MORE_TEXT);
        }
        get listAccessibleRole() {
            return toLowercaseEnumValue.n(this.accessibleRole);
        }
        get classes() {
            return {
                root: {
                    "ui5-list-root": true,
                },
            };
        }
        prepareListItems() {
            const slottedItems = this.getItemsForProcessing();
            slottedItems.forEach((item, key) => {
                const isLastChild = key === slottedItems.length - 1;
                const showBottomBorder = this.separators === ListSeparator$1.All
                    || (this.separators === ListSeparator$1.Inner && !isLastChild);
                if (item.hasConfigurableMode) {
                    item._selectionMode = this.selectionMode;
                }
                item.hasBorder = showBottomBorder;
                item.mediaRange = this.mediaRange;
            });
        }
        async observeListEnd() {
            await Theme.f$1();
            this.getEndIntersectionObserver().observe(this.listEndDOM);
        }
        unobserveListEnd() {
            if (this._endIntersectionObserver) {
                this._endIntersectionObserver.disconnect();
                this._endIntersectionObserver = null;
            }
        }
        async observeListStart() {
            await Theme.f$1();
            this.getStartIntersectionObserver().observe(this.listStartDOM);
        }
        unobserveListStart() {
            if (this._startIntersectionObserver) {
                this._startIntersectionObserver.disconnect();
                this._startIntersectionObserver = null;
            }
        }
        onEndIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    u(this.loadMore.bind(this), INFINITE_SCROLL_DEBOUNCE_RATE);
                }
            });
        }
        onStartIntersection(entries) {
            entries.forEach(entry => {
                this._startMarkerOutOfView = !entry.isIntersecting;
            });
        }
        /*
        * ITEM SELECTION BASED ON THE CURRENT MODE
        */
        onSelectionRequested(e) {
            const previouslySelectedItems = this.getSelectedItems();
            let selectionChange = false;
            if (this.selectionMode !== ListSelectionMode$1.None && this[`handle${this.selectionMode}`]) {
                selectionChange = this[`handle${this.selectionMode}`](e.detail.item, !!e.detail.selected);
            }
            if (selectionChange) {
                const changePrevented = !this.fireDecoratorEvent("selection-change", {
                    selectedItems: this.getSelectedItems(),
                    previouslySelectedItems,
                    selectionComponentPressed: e.detail.selectionComponentPressed,
                    targetItem: e.detail.item,
                    key: e.detail.key,
                });
                if (changePrevented) {
                    this._revertSelection(previouslySelectedItems);
                }
            }
        }
        handleSingle(item) {
            if (item.selected) {
                return false;
            }
            this.deselectSelectedItems();
            item.selected = true;
            return true;
        }
        handleSingleStart(item) {
            return this.handleSingle(item);
        }
        handleSingleEnd(item) {
            return this.handleSingle(item);
        }
        handleSingleAuto(item) {
            return this.handleSingle(item);
        }
        handleMultiple(item, selected) {
            item.selected = selected;
            return true;
        }
        handleDelete(item) {
            this.fireDecoratorEvent("item-delete", { item });
            return true;
        }
        deselectSelectedItems() {
            this.getSelectedItems().forEach(item => { item.selected = false; });
        }
        getSelectedItems() {
            return this.getItems().filter(item => item.selected);
        }
        getEnabledItems() {
            return this.getItems().filter(item => item._focusable);
        }
        getItems() {
            // drill down when we see ui5-li-group and get the items
            const items = [];
            const slottedItems = this.getSlottedNodes("items");
            let groupCount = 0;
            let groupItemCount = 0;
            slottedItems.forEach(item => {
                if (ListItemGroup.isInstanceOfListItemGroup(item)) {
                    const groupItems = [item.groupHeaderItem, ...item.items.filter(listItem => listItem.assignedSlot)].filter(Boolean);
                    items.push(...groupItems);
                    groupCount++;
                    // subtract group itself for proper group header item count
                    groupItemCount += groupItems.length - 1;
                }
                else {
                    item.assignedSlot && items.push(item);
                }
            });
            this._groupCount = groupCount;
            this._groupItemCount = groupItemCount;
            return items;
        }
        getItemsForProcessing() {
            return this.getItems();
        }
        _revertSelection(previouslySelectedItems) {
            this.getItems().forEach((item) => {
                const oldSelection = previouslySelectedItems.indexOf(item) !== -1;
                const multiSelectCheckBox = item.shadowRoot.querySelector(".ui5-li-multisel-cb");
                const singleSelectRadioButton = item.shadowRoot.querySelector(".ui5-li-singlesel-radiobtn");
                item.selected = oldSelection;
                if (multiSelectCheckBox) {
                    multiSelectCheckBox.checked = oldSelection;
                }
                else if (singleSelectRadioButton) {
                    singleSelectRadioButton.checked = oldSelection;
                }
            });
        }
        _onkeydown(e) {
            if (webcomponentsBase.n(e)) {
                this._handleEnd();
                e.preventDefault();
                return;
            }
            if (webcomponentsBase.M(e)) {
                this._handleHome();
                return;
            }
            if (webcomponentsBase._(e)) {
                this._handleDown();
                e.preventDefault();
                return;
            }
            if (webcomponentsBase.C(e)) {
                this._moveItem(e.target, e);
                return;
            }
            if (webcomponentsBase.x(e)) {
                this._handleTabNext(e);
            }
        }
        _moveItem(item, e) {
            if (!item || !item.movable) {
                return;
            }
            const closestPositions = ListItemGroup.k(this.items, item, e);
            if (!closestPositions.length) {
                return;
            }
            e.preventDefault();
            const acceptedPosition = closestPositions.find(({ element, placement }) => {
                return !this.fireDecoratorEvent("move-over", {
                    originalEvent: e,
                    source: {
                        element: item,
                    },
                    destination: {
                        element,
                        placement,
                    },
                });
            });
            if (acceptedPosition) {
                this.fireDecoratorEvent("move", {
                    originalEvent: e,
                    source: {
                        element: item,
                    },
                    destination: {
                        element: acceptedPosition.element,
                        placement: acceptedPosition.placement,
                    },
                });
                item.focus();
            }
        }
        _onLoadMoreKeydown(e) {
            if (webcomponentsBase.A(e)) {
                e.preventDefault();
                this._loadMoreActive = true;
            }
            if (webcomponentsBase.b$1(e)) {
                this._onLoadMoreClick();
                this._loadMoreActive = true;
            }
            if (webcomponentsBase.x(e)) {
                this.focusAfterElement();
            }
            if (webcomponentsBase.P(e)) {
                this._handleLodeMoreUp(e);
                return;
            }
            if (webcomponentsBase.V(e)) {
                if (this.getPreviouslyFocusedItem()) {
                    this.focusPreviouslyFocusedItem();
                }
                else {
                    this.focusFirstItem();
                }
                e.preventDefault();
            }
        }
        _onLoadMoreKeyup(e) {
            if (webcomponentsBase.A(e)) {
                this._onLoadMoreClick();
            }
            this._loadMoreActive = false;
        }
        _onLoadMoreMousedown() {
            this._loadMoreActive = true;
        }
        _onLoadMoreMouseup() {
            this._loadMoreActive = false;
        }
        _onLoadMoreClick() {
            this.loadMore();
        }
        _handleLodeMoreUp(e) {
            const growingButton = this.getGrowingButton();
            if (growingButton === e.target) {
                const items = this.getItems();
                const lastItem = items[items.length - 1];
                this.focusItem(lastItem);
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
        checkListInViewport() {
            this._inViewport = n(this.getDomRef());
        }
        loadMore() {
            if (this.hasGrowingComponent()) {
                this.fireDecoratorEvent("load-more");
            }
        }
        _handleResize() {
            this.checkListInViewport();
            const width = this.getBoundingClientRect().width;
            this.mediaRange = webcomponentsBase.i$2.getCurrentRange(webcomponentsBase.i$2.RANGESETS.RANGE_4STEPS, width);
        }
        /*
        * KEYBOARD SUPPORT
        */
        _handleTabNext(e) {
            t(e.target);
            {
                return;
            }
        }
        _handleHome() {
            if (!this.growsWithButton) {
                return;
            }
            this.focusFirstItem();
        }
        _handleEnd() {
            if (!this.growsWithButton) {
                return;
            }
            this._shouldFocusGrowingButton();
        }
        _handleDown() {
            if (!this.growsWithButton) {
                return;
            }
            this._shouldFocusGrowingButton();
        }
        _onfocusin(e) {
            const target = t(e.target);
            // If the focusin event does not origin from one of the 'triggers' - ignore it.
            if (!this.isForwardElement(target)) {
                return;
            }
            // The focus arrives in the List for the first time.
            // If there is selected item - focus it or focus the first item.
            if (!this.getPreviouslyFocusedItem()) {
                if (this.growsWithButton && this.isForwardAfterElement(target)) {
                    this.focusGrowingButton();
                }
                else {
                    this.focusFirstItem();
                }
                e.stopImmediatePropagation();
                return;
            }
            // The focus returns to the List,
            // focus the first selected item or the previously focused element.
            if (!this.getForwardingFocus()) {
                if (this.growsWithButton && this.isForwardAfterElement(target)) {
                    this.focusGrowingButton();
                    e.stopImmediatePropagation();
                    return;
                }
                this.focusPreviouslyFocusedItem();
            }
            e.stopImmediatePropagation();
            this.setForwardingFocus(false);
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
        isForwardElement(element) {
            const elementId = element.id;
            const beforeElement = this.getBeforeElement();
            if (this._id === elementId || (beforeElement && beforeElement.id === elementId)) {
                return true;
            }
            return this.isForwardAfterElement(element);
        }
        isForwardAfterElement(element) {
            const elementId = element.id;
            const afterElement = this.getAfterElement();
            return afterElement && afterElement.id === elementId;
        }
        onItemTabIndexChange(e) {
            e.stopPropagation();
            const target = e.target;
            this._itemNavigation.setCurrentItem(target);
        }
        onItemFocused(e) {
            const target = e.target;
            e.stopPropagation();
            this._itemNavigation.setCurrentItem(target);
            this.fireDecoratorEvent("item-focused", { item: target });
            if (this.selectionMode === ListSelectionMode$1.SingleAuto) {
                const detail = {
                    item: target,
                    selectionComponentPressed: false,
                    selected: true,
                    key: e.detail.key,
                };
                this.onSelectionRequested({ detail });
            }
        }
        onItemPress(e) {
            const pressedItem = e.detail.item;
            if (!this.fireDecoratorEvent("item-click", { item: pressedItem })) {
                return;
            }
            if (this.selectionMode !== ListSelectionMode$1.Delete) {
                const detail = {
                    item: pressedItem,
                    selectionComponentPressed: false,
                    selected: !pressedItem.selected,
                    key: e.detail.key,
                };
                this.onSelectionRequested({ detail });
            }
        }
        // This is applicable to NotificationListItem
        onItemClose(e) {
            const target = e.target;
            const shouldFireItemClose = target?.hasAttribute("ui5-li-notification") || target?.hasAttribute("ui5-li-notification-group");
            if (shouldFireItemClose) {
                this.fireDecoratorEvent("item-close", { item: e.detail?.item });
            }
        }
        onItemToggle(e) {
            if (!e.target?.isListItemBase) {
                return;
            }
            this.fireDecoratorEvent("item-toggle", { item: e.detail.item });
        }
        onForwardBefore(e) {
            this.setPreviouslyFocusedItem(e.target);
            this.focusBeforeElement();
            e.stopPropagation();
        }
        onForwardAfter(e) {
            this.setPreviouslyFocusedItem(e.target);
            if (!this.growsWithButton) {
                this.focusAfterElement();
            }
            else {
                this.focusGrowingButton();
                e.preventDefault();
            }
            e.stopPropagation();
        }
        focusBeforeElement() {
            this.setForwardingFocus(true);
            this.getBeforeElement().focus();
        }
        focusAfterElement() {
            this.setForwardingFocus(true);
            this.getAfterElement().focus();
        }
        focusGrowingButton() {
            const growingBtn = this.getGrowingButton();
            if (growingBtn) {
                growingBtn.focus();
            }
        }
        _shouldFocusGrowingButton() {
            const items = this.getItems();
            const lastIndex = items.length - 1;
            const currentIndex = this._itemNavigation._currentIndex;
            if (currentIndex !== -1 && currentIndex === lastIndex) {
                this.focusGrowingButton();
            }
        }
        getGrowingButton() {
            return this.shadowRoot.querySelector(`[id="${this._id}-growing-btn"]`);
        }
        /**
         * Focuses the first list item and sets its tabindex to "0" via the ItemNavigation
         * @protected
         */
        focusFirstItem() {
            // only enabled items are focusable
            const firstItem = this.getFirstItem(x => x._focusable);
            if (firstItem) {
                firstItem.focus();
            }
        }
        focusPreviouslyFocusedItem() {
            const previouslyFocusedItem = this.getPreviouslyFocusedItem();
            if (previouslyFocusedItem) {
                previouslyFocusedItem.focus();
            }
        }
        focusFirstSelectedItem() {
            // only enabled items are focusable
            const firstSelectedItem = this.getFirstItem(x => x.selected && x._focusable);
            if (firstSelectedItem) {
                firstSelectedItem.focus();
            }
        }
        /**
         * Focuses a list item and sets its tabindex to "0" via the ItemNavigation
         * @protected
         * @param item
         */
        focusItem(item) {
            this._itemNavigation.setCurrentItem(item);
            item.focus();
        }
        onFocusRequested(e) {
            setTimeout(() => {
                this.setPreviouslyFocusedItem(e.target);
                this.focusPreviouslyFocusedItem();
            }, 0);
        }
        setForwardingFocus(forwardingFocus) {
            this._forwardingFocus = forwardingFocus;
        }
        getForwardingFocus() {
            return this._forwardingFocus;
        }
        setPreviouslyFocusedItem(item) {
            this._previouslyFocusedItem = item;
        }
        getPreviouslyFocusedItem() {
            return this._previouslyFocusedItem;
        }
        getFirstItem(filter) {
            const slottedItems = this.getItems();
            let firstItem = null;
            if (!filter) {
                return slottedItems.length ? slottedItems[0] : null;
            }
            for (let i = 0; i < slottedItems.length; i++) {
                if (filter(slottedItems[i])) {
                    firstItem = slottedItems[i];
                    break;
                }
            }
            return firstItem;
        }
        getAfterElement() {
            if (!this._afterElement) {
                this._afterElement = this.shadowRoot.querySelector(`[id="${this._id}-after"]`);
            }
            return this._afterElement;
        }
        getBeforeElement() {
            if (!this._beforeElement) {
                this._beforeElement = this.shadowRoot.querySelector(`[id="${this._id}-before"]`);
            }
            return this._beforeElement;
        }
        getEndIntersectionObserver() {
            if (!this._endIntersectionObserver) {
                this._endIntersectionObserver = new IntersectionObserver(this.onEndIntersection.bind(this), {
                    root: null, // null means the viewport
                    rootMargin: "0px",
                    threshold: 1.0,
                });
            }
            return this._endIntersectionObserver;
        }
        getStartIntersectionObserver() {
            if (!this._startIntersectionObserver) {
                this._startIntersectionObserver = new IntersectionObserver(this.onStartIntersection.bind(this), {
                    root: null, // null means the viewport
                    rootMargin: "0px",
                    threshold: 1.0,
                });
            }
            return this._startIntersectionObserver;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "headerText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "footerText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], List.prototype, "indent", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "selectionMode", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "noDataText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "separators", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "growing", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "growingButtonText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], List.prototype, "loading", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], List.prototype, "loadingDelay", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], List.prototype, "accessibilityAttributes", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleNameRef", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleDescription", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleDescriptionRef", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], List.prototype, "_associatedDescriptionRefTexts", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], List.prototype, "_associatedLabelsRefTexts", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleRole", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], List.prototype, "_inViewport", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], List.prototype, "_loadMoreActive", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "mediaRange", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            "default": true,
            invalidateOnChildChange: true,
        })
    ], List.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.d()
    ], List.prototype, "header", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], List, "i18nBundle", void 0);
    List = List_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-list",
            fastNavigation: true,
            renderer: parametersBundle_css.y,
            template: ListTemplate,
            styles: [
                listCss,
            ],
        })
        /**
         * Fired when an item is activated, unless the item's `type` property
         * is set to `Inactive`.
         *
         * **Note**: This event is not triggered by interactions with selection components such as the checkboxes and radio buttons,
         * associated with non-default `selectionMode` values, or if any other **interactive** component
         * (such as a button or input) within the list item is directly clicked.
         * @param {HTMLElement} item The clicked item.
         * @public
         */
        ,
        eventStrict.l("item-click", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when the `Close` button of any item is clicked
         *
         * **Note:** This event is only applicable to list items that can be closed (such as notification list items),
         * not to be confused with `item-delete`.
         * @param {HTMLElement} item the item about to be closed.
         * @public
         * @since 1.0.0-rc.8
         */
        ,
        eventStrict.l("item-close", {
            bubbles: true,
        })
        /**
         * Fired when the `Toggle` button of any item is clicked.
         *
         * **Note:** This event is only applicable to list items that can be toggled (such as notification group list items).
         * @param {HTMLElement} item the toggled item.
         * @public
         * @since 1.0.0-rc.8
         */
        ,
        eventStrict.l("item-toggle", {
            bubbles: true,
        })
        /**
         * Fired when the Delete button of any item is pressed.
         *
         * **Note:** A Delete button is displayed on each item,
         * when the component `selectionMode` property is set to `Delete`.
         * @param {HTMLElement} item the deleted item.
         * @public
         */
        ,
        eventStrict.l("item-delete", {
            bubbles: true,
        })
        /**
         * Fired when selection is changed by user interaction
         * in `Single`, `SingleStart`, `SingleEnd` and `Multiple` selection modes.
         * @param {Array<ListItemBase>} selectedItems An array of the selected items.
         * @param {Array<ListItemBase>} previouslySelectedItems An array of the previously selected items.
         * @public
         */
        ,
        eventStrict.l("selection-change", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when the user scrolls to the bottom of the list.
         *
         * **Note:** The event is fired when the `growing='Scroll'` property is enabled.
         * @public
         * @since 1.0.0-rc.6
         */
        ,
        eventStrict.l("load-more", {
            bubbles: true,
        })
        /**
         * @private
         */
        ,
        eventStrict.l("item-focused", {
            bubbles: true,
        })
        /**
         * Fired when a movable list item is moved over a potential drop target during a dragging operation.
         *
         * If the new position is valid, prevent the default action of the event using `preventDefault()`.
         * @param {object} source Contains information about the moved element under `element` property.
         * @param {object} destination Contains information about the destination of the moved element. Has `element` and `placement` properties.
         * @public
         * @since 2.0.0
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
         */
        ,
        eventStrict.l("move", {
            bubbles: true,
        })
    ], List);
    List.define();
    var List$1 = List;

    exports.List = List$1;
    exports.ListAccessibleRole = ListAccessibleRole$1;
    exports.ListSelectionMode = ListSelectionMode$1;
    exports.ListSeparator = ListSeparator$1;

}));
