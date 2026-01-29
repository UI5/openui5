sap.ui.define(['sap/f/thirdparty/webcomponents', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/NotificationListItemBase', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/List', 'sap/f/thirdparty/parameters-bundle.css3', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/ListItemGroup', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/Label'], (function (webcomponentsBase, eventStrict, parametersBundle_css, NotificationListItemBase, Theme, Icons, i18nDefaults, Icon, List, parametersBundle_css$1, parametersBundle_css$2, ListItemBase, FocusableElements, toLowercaseEnumValue, ListItemGroup, i18nDefaults$1, WrappingType, AccessibilityTextsHelper, BusyIndicator, willShowContent, Label) { 'use strict';

	const name$3 = "navigation-right-arrow";
	const pathData$3 = "M296 268q11-12 0-23L139 86q-10-10-10-23t10-22q9-10 22-10t23 10l191 193q9 9 9 22.5t-9 22.5L183 471q-10 10-23 10t-23-10q-9-9-9-22.5t9-22.5z";
	const ltr$3 = false;
	const collection$3 = "SAP-icons-v4";
	const packageName$3 = "@ui5/webcomponents-icons";

	Icons.y(name$3, { pathData: pathData$3, ltr: ltr$3, collection: collection$3, packageName: packageName$3 });

	const name$2 = "navigation-right-arrow";
	const pathData$2 = "M186 416q-11 0-18.5-7.5T160 390q0-10 8-18l121-116-121-116q-8-8-8-18 0-11 7.5-18.5T186 96q10 0 17 7l141 134q8 8 8 19 0 12-8 18L203 409q-7 7-17 7z";
	const ltr$2 = false;
	const collection$2 = "SAP-icons-v5";
	const packageName$2 = "@ui5/webcomponents-icons";

	Icons.y(name$2, { pathData: pathData$2, ltr: ltr$2, collection: collection$2, packageName: packageName$2 });

	var iconNavigationRightArrow = "navigation-right-arrow";

	const name$1 = "navigation-down-arrow";
	const pathData$1 = "M425.5 137q9-9 22.5-9t22.5 9q10 10 10 23t-10 23l-193 197q-4 2-5 3-2 1-2.5 1.5t-2.5 1.5q-6 2-11 2-2 0-3-.5t-2-.5q-4 0-6-1t-3.5-2-3.5-2q-1-1-1.5-1t-1.5-1-2-1l-192-196q-10-10-10-23t10-23q9-9 22.5-9t22.5 9l154 155q16 10 32 0z";
	const ltr$1 = false;
	const collection$1 = "SAP-icons-v4";
	const packageName$1 = "@ui5/webcomponents-icons";

	Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

	const name = "navigation-down-arrow";
	const pathData = "M96 186q0-11 7.5-18.5T122 160q10 0 18 8l116 121 116-121q8-8 18-8 11 0 18.5 7.5T416 186q0 10-7 17L275 344q-8 8-19 8-12 0-18-8L103 203q-7-7-7-17z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";

	Icons.y(name, { pathData, ltr, collection, packageName });

	var iconNavigationDownArrow = "navigation-down-arrow";

	var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	/**
	 * @class
	 *
	 * Internal `ui5-li-notification-group-list` component,
	 * that is used to support keyboard navigation of the notification group internal list.
	 *
	 * @private
	 */
	let NotificationListGroupList = class NotificationListGroupList extends List.List {
	    getEnabledItems() {
	        return [];
	    }
	    _handleTabNext() {
	    }
	    onForwardBefore() {
	    }
	    onForwardAfter() {
	    }
	    onItemTabIndexChange() {
	    }
	    onItemFocused() {
	    }
	    _onfocusin(e) {
	        e.stopImmediatePropagation();
	    }
	    _onkeydown() {
	    }
	    focusItem(item) {
	        item.focus();
	    }
	    _onLoadMoreKeydown(e) {
	        if (webcomponentsBase.A(e)) {
	            e.stopImmediatePropagation();
	        }
	        super._onLoadMoreKeydown(e);
	    }
	};
	NotificationListGroupList = __decorate$1([
	    webcomponentsBase.m("ui5-notification-group-list")
	], NotificationListGroupList);
	NotificationListGroupList.define();
	var NotificationListGroupList$1 = NotificationListGroupList;

	function NotificationListItemTemplate() {
	    return (parametersBundle_css.jsxs("li", { class: "ui5-nli-group-root ui5-nli-focusable", onFocusIn: this._onfocusin, onKeyDown: this._onkeydown, tabindex: this.forcedTabIndex ? parseInt(this.forcedTabIndex) : undefined, "aria-labelledby": this.ariaLabelledBy, "aria-description": this.accInvisibleText, "aria-level": 1, children: [this.loading && (parametersBundle_css.jsx("span", { id: `${this._id}-loading`, class: "ui5-hidden-text", children: this.loadingText })), parametersBundle_css.jsxs("div", { class: "ui5-nli-group-content-wrapper", children: [parametersBundle_css.jsxs("div", { class: {
	                            "ui5-nli-group-header": true,
	                            "ui5-nli-group-header-expanded": this._expanded,
	                        }, onClick: this._onHeaderToggleClick, onKeyDown: this._onkeydown, role: "button", "aria-expanded": this._expanded, "aria-controls": `${this._id}-notificationsList`, title: this.toggleIconAccessibleName, children: [parametersBundle_css.jsx(Icon.Icon, { name: this.groupCollapsedIcon, class: "ui5-nli-group-toggle-icon", mode: "Decorative" }), parametersBundle_css.jsx("div", { id: `${this._id}-title-text`, class: "ui5-nli-group-title-text", part: "title-text", role: "heading", "aria-level": 2, children: this.titleText }), parametersBundle_css.jsx("div", { class: "ui5-nli-group-divider" })] }), parametersBundle_css.jsx(NotificationListGroupList$1, { id: `${this._id}-notificationsList`, class: "ui5-nli-group-items", accessibleNameRef: `${this._id}-title-text`, growing: this.growing, loading: this.loading, loadingDelay: this.loadingDelay, onLoadMore: this._onLoadMore, children: parametersBundle_css.jsx("slot", {}) })] })] }));
	}

	Theme.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
	Theme.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
	var NotificationListGroupItemCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:block;max-width:100%;min-height:var(--_ui5-v2-15-0_list_item_base_height);background:var(--ui5-v2-15-0-listitem-background-color);cursor:pointer}.ui5-nli-focusable:focus{outline:none}:host([desktop]) .ui5-nli-focusable:focus:not(.ui5-nli-group-root):after,.ui5-nli-focusable:focus-visible:not(.ui5-nli-group-root):after{content:"";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;inset:0;pointer-events:none}.ui5-state-icon{min-width:1rem;min-height:1rem;padding-inline-end:var(--_ui5-v2-15-0-notification_item-state-icon-padding)}:host([collapsed]) .ui5-nli-group-items{display:none}:host([read]) .ui5-nli-group-title-text{font-weight:400}.ui5-nli-group-root{width:100%}.ui5-nli-group-content-wrapper{position:relative;box-sizing:border-box;width:100%;display:flex;flex-direction:column}[ui5-busy-indicator]{width:100%}.ui5-nli-group-header{height:2.75rem;position:sticky;top:0;z-index:90;background:var(--sapList_GroupHeaderBackground);display:flex;align-items:center;padding-inline:var(--_ui5-v2-15-0-notification_group_header-padding);width:100%;border-bottom:var(--_ui5-v2-15-0-notification_group_header-border-bottom-width) solid var(--sapList_GroupHeaderBorderColor);box-sizing:border-box;cursor:pointer;margin-bottom:var(--_ui5-v2-15-0-notification_group_header-margin)}.ui5-nli-group-header-expanded{margin-bottom:var(--_ui5-v2-15-0-notification_group_header-margin-expanded)}:host([desktop]) .ui5-nli-focusable.ui5-nli-group-root:focus .ui5-nli-group-header:before,.ui5-nli-focusable.ui5-nli-group-root:focus-visible .ui5-nli-group-header:before{content:"";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;top:var(--_ui5-v2-15-0-notification_group_header-margin);bottom:var(--_ui5-v2-15-0-notification_group_header-margin);left:0;right:0;pointer-events:none}.ui5-nli-group-toggle-icon{min-width:1rem;min-height:1rem;margin-inline:.5rem;color:var(--sapContent_IconColor)}.ui5-nli-group-title-text{color:var(--sapGroup_TitleTextColor);font-family:var(--sapFontFamily);font-size:var(--sapFontHeader5Size);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:2rem;margin-inline-start:.75rem}.ui5-nli-group-divider{flex:1}:host([ui5-li-notification-group]){-webkit-tap-highlight-color:transparent}[ui5-notification-group-list]::part(growing-button){border:none}[ui5-notification-group-list]::part(growing-button-inner){margin:var(--_ui5-v2-15-0-notification_item-margin);border:var(--_ui5-v2-15-0-notification_item-border-top-left-right);border-radius:var(--_ui5-v2-15-0-notification_item-border-radius)}[ui5-notification-group-list]::part(growing-button-inner){border-radius:var(--_ui5-v2-15-0-notification_item-border-radius);height:3.125rem}[ui5-notification-group-list]::part(growing-button-inner):focus,[ui5-notification-group-list]::part(growing-button-inner):focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:var(--_ui5-v2-15-0-notification_item-outline-offset)}[ui5-notification-group-list]::part(growing-button-inner):focus:active,[ui5-notification-group-list]::part(growing-button-inner):focus-visible:active{background-color:var(--_ui5-v2-15-0-notification_item-growing-btn-background-color-active);border-radius:var(--_ui5-v2-15-0-notification_item-border-radius);border:var(--_ui5-v2-15-0-notification_item-border-active)}[ui5-notification-group-list]::part(growing-button-busy-indicator){padding:.875rem 0 1rem}
`;

	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var NotificationListGroupItem_1;
	/**
	 * @class
	 *
	 * ### Overview
	 * The `ui5-li-notification-group` is a special type of list item,
	 * that unlike others can group items within self, usually `ui5-li-notification` items.
	 *
	 * The component consists of:
	 *
	 * - `Toggle` button to expand and collapse the group
	 * - `TitleText` to entitle the group
	 * - Items of the group
	 *
	 * ### Usage
	 * The component should be used inside a `ui5-notification-list`.
	 *
	 * ### Keyboard Handling
	 * The `ui5-li-notification-group` provides advanced keyboard handling.
	 * This component provides fast navigation when the header is focused using the following keyboard shortcuts:
	 *
	 * - [Space] - toggles expand / collapse of the group
	 * - [Plus] - expands the group
	 * - [Minus] - collapses the group
	 * - [Right] - expands the group
	 * - [Left] - collapses the group
	 *
	 * ### ES6 Module Import
	 *
	 * `import "@ui5/webcomponents-fiori/dist/NotificationListGroupItem.js";`
	 * @constructor
	 * @extends NotificationListItemBase
	 * @since 1.0.0-rc.8
	 * @public
	 */
	let NotificationListGroupItem = NotificationListGroupItem_1 = class NotificationListGroupItem extends NotificationListItemBase.NotificationListItemBase {
	    constructor() {
	        super(...arguments);
	        /**
	         * Defines if the group is collapsed or expanded.
	         * @default false
	         * @public
	         */
	        this.collapsed = false;
	        /**
	         * Defines whether the component will have growing capability by pressing a `More` button.
	         * When button is pressed `load-more` event will be fired.
	         * @default "None"
	         * @public
	         * @since 2.2.0
	         */
	        this.growing = "None";
	    }
	    onBeforeRendering() {
	        super.onBeforeRendering();
	        this.items.forEach(item => {
	            item._ariaLevel = 2;
	        });
	        if (this.loading) {
	            this.clearChildBusyIndicator();
	        }
	        this.actionable = false;
	    }
	    /**
	     * Clears child items loading state to show a single loading over the entire group,
	     * instead of multiple BusyIndicator instances
	     */
	    clearChildBusyIndicator() {
	        this.items.forEach(item => {
	            item.loading = false;
	        });
	    }
	    get toggleIconAccessibleName() {
	        return NotificationListGroupItem_1.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_TOGGLE_ICON_COLLAPSE_TITLE);
	    }
	    get accInvisibleText() {
	        return `${this.groupText} ${this.expandText}`;
	    }
	    get expandText() {
	        if (this.collapsed) {
	            return NotificationListGroupItem_1.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_COLLAPSED);
	        }
	        return NotificationListGroupItem_1.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_EXPANDED);
	    }
	    get groupText() {
	        return NotificationListGroupItem_1.i18nFioriBundle.getText(i18nDefaults.NOTIFICATION_LIST_GROUP_ITEM_TXT);
	    }
	    get ariaLabelledBy() {
	        const id = this._id;
	        if (this.loading) {
	            return `${id}-loading`;
	        }
	        const ids = [];
	        if (this.hasTitleText) {
	            ids.push(`${id}-title-text`);
	        }
	        return ids.join(" ");
	    }
	    get _expanded() {
	        return !this.collapsed;
	    }
	    get _pressable() {
	        return false;
	    }
	    get groupCollapsedIcon() {
	        return this.collapsed ? iconNavigationRightArrow : iconNavigationDownArrow;
	    }
	    toggleCollapsed() {
	        this.collapsed = !this.collapsed;
	        this.fireDecoratorEvent("toggle", { item: this });
	    }
	    /**
	     * Event handlers
	     *
	     */
	    _onHeaderToggleClick() {
	        this.toggleCollapsed();
	    }
	    _onLoadMore() {
	        this.fireDecoratorEvent("load-more");
	    }
	    getGrowingButton() {
	        const innerList = this.getDomRef()?.querySelector("[ui5-notification-group-list]");
	        return innerList.getGrowingButton();
	    }
	    async _onkeydown(e) {
	        const isFocused = this.matches(":focus");
	        if (!isFocused) {
	            return;
	        }
	        if (this.getGrowingButton()?.matches(":focus")) {
	            return;
	        }
	        await super._onkeydown(e);
	        const space = webcomponentsBase.A(e);
	        const plus = webcomponentsBase.ao(e);
	        const minus = webcomponentsBase.so(e);
	        const left = webcomponentsBase.D(e);
	        const right = webcomponentsBase.R(e);
	        if (space) {
	            this.toggleCollapsed();
	        }
	        if (plus || right) {
	            // expand
	            if (this.collapsed) {
	                this.toggleCollapsed();
	                e.stopImmediatePropagation();
	            }
	        }
	        if (minus || left) {
	            // collapse
	            if (!this.collapsed) {
	                this.toggleCollapsed();
	                e.stopImmediatePropagation();
	            }
	        }
	    }
	    getHeaderDomRef() {
	        return this.getDomRef()?.querySelector(".ui5-nli-group-header");
	    }
	};
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], NotificationListGroupItem.prototype, "collapsed", void 0);
	__decorate([
	    webcomponentsBase.s()
	], NotificationListGroupItem.prototype, "growing", void 0);
	__decorate([
	    webcomponentsBase.d({ type: HTMLElement, "default": true })
	], NotificationListGroupItem.prototype, "items", void 0);
	NotificationListGroupItem = NotificationListGroupItem_1 = __decorate([
	    webcomponentsBase.m({
	        tag: "ui5-li-notification-group",
	        languageAware: true,
	        renderer: parametersBundle_css.y,
	        styles: [
	            NotificationListGroupItemCss,
	        ],
	        template: NotificationListItemTemplate,
	    })
	    /**
	     * Fired when the `ui5-li-notification-group` is expanded/collapsed by user interaction.
	     * @public
	     */
	    ,
	    eventStrict.l("toggle", {
	        bubbles: true,
	    })
	    /**
	     * Fired when additional items are requested.
	     *
	     * @public
	     * @since 2.2.0
	     */
	    ,
	    eventStrict.l("load-more", {
	        bubbles: true,
	    })
	], NotificationListGroupItem);
	NotificationListGroupItem.define();
	var NotificationListGroupItem$1 = NotificationListGroupItem;

	return NotificationListGroupItem$1;

}));
