sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/parameters-bundle2.css', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/ManagedStyles'], (function (exports, webcomponentsBase, parametersBundle_css, parametersBundle_css$1, ListItemTemplate, Icons, ListItemBase, i18nDefaults, ManagedStyles) { 'use strict';

    const predefinedHooks = {
        listItemContent,
    };
    function ListItemCustomTemplate(hooks) {
        const currentHooks = { ...predefinedHooks, ...hooks };
        return ListItemTemplate.ListItemTemplate.call(this, currentHooks);
    }
    function listItemContent() {
        return parametersBundle_css.jsx("slot", {});
    }

    let i18nBundle;
    let invisibleText;
    const getBundle = () => {
        i18nBundle ??= new Icons.u("@ui5/webcomponents-base");
        return i18nBundle;
    };
    const checkVisibility = (element) => {
        return element.checkVisibility() || getComputedStyle(element).display === "contents";
    };
    const applyCustomAnnouncement = (element, text = []) => {
        if (!invisibleText || !invisibleText.isConnected) {
            invisibleText = document.createElement("span");
            invisibleText.id = "ui5-invisible-text";
            invisibleText.hidden = true;
            document.body.appendChild(invisibleText);
        }
        const ariaLabelledByElements = [...(element.ariaLabelledByElements || [])];
        const invisibleTextIndex = ariaLabelledByElements.indexOf(invisibleText);
        text = Array.isArray(text) ? text.filter(Boolean).join(" . ").trim() : text.trim();
        invisibleText.textContent = text;
        if (text && invisibleTextIndex === -1) {
            ariaLabelledByElements.unshift(invisibleText);
            element.ariaLabelledByElements = ariaLabelledByElements;
        }
        else if (!text && invisibleTextIndex > -1) {
            ariaLabelledByElements.splice(invisibleTextIndex, 1);
            element.ariaLabelledByElements = ariaLabelledByElements.length ? ariaLabelledByElements : null;
        }
    };
    const getCustomAnnouncement = (element, options = {}, _isRootElement = true) => {
        if (!element) {
            return "";
        }
        if (element.nodeType === Node.TEXT_NODE) {
            return element.data.trim();
        }
        if (!(element instanceof HTMLElement)) {
            return "";
        }
        if (element.hasAttribute("data-ui5-acc-text")) {
            return element.getAttribute("data-ui5-acc-text") || "";
        }
        if (element.ariaHidden === "true" || !checkVisibility(element)) {
            return _isRootElement ? getBundle().getText(i18nDefaults.ACC_STATE_EMPTY) : "";
        }
        let childNodes = [];
        const descriptions = [];
        const accessibilityInfo = element.accessibilityInfo;
        const { lessDetails } = options;
        if (accessibilityInfo) {
            const { type, description, required, disabled, readonly, children, } = accessibilityInfo;
            childNodes = children || [];
            type && descriptions.push(type);
            description && descriptions.push(description);
            if (!lessDetails) {
                required && descriptions.push(getBundle().getText(i18nDefaults.ACC_STATE_REQUIRED));
                disabled && descriptions.push(getBundle().getText(i18nDefaults.ACC_STATE_DISABLED));
                readonly && descriptions.push(getBundle().getText(i18nDefaults.ACC_STATE_READONLY));
            }
        }
        else if (element.localName === "slot") {
            childNodes = element.assignedNodes({ flatten: true });
        }
        else {
            childNodes = element.shadowRoot ? [...element.shadowRoot.childNodes] : [...element.childNodes];
        }
        childNodes.forEach(child => {
            const childDescription = getCustomAnnouncement(child, options, false);
            childDescription && descriptions.push(childDescription);
        });
        if (_isRootElement) {
            const hasDescription = descriptions.length > 0;
            if (!hasDescription || !lessDetails) {
                const tabbables = ListItemBase.b(element);
                const bundleKey = [
                    hasDescription ? "" : i18nDefaults.ACC_STATE_EMPTY,
                    i18nDefaults.ACC_STATE_SINGLE_CONTROL,
                    i18nDefaults.ACC_STATE_MULTIPLE_CONTROLS,
                ][Math.min(tabbables.length, 2)];
                if (bundleKey) {
                    hasDescription && descriptions.push(".");
                    descriptions.push(getBundle().getText(bundleKey));
                }
            }
        }
        return descriptions.join(" ").trim();
    };

    ManagedStyles.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    ManagedStyles.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme, "host");
    var ListItemCustomCss = `:host(:not([hidden])){display:block}:host{min-height:var(--_ui5_list_item_base_height);height:auto;box-sizing:border-box}.ui5-li-root.ui5-custom-li-root{pointer-events:inherit;min-height:inherit}.ui5-li-root.ui5-custom-li-root .ui5-li-content{pointer-events:inherit}[ui5-checkbox].ui5-li-singlesel-radiobtn,[ui5-radio-button].ui5-li-singlesel-radiobtn{display:flex;align-items:center}.ui5-li-root.ui5-custom-li-root,[ui5-checkbox].ui5-li-singlesel-radiobtn,[ui5-radio-button].ui5-li-singlesel-radiobtn{min-width:var(--_ui5_custom_list_item_rb_min_width)}:host([_selection-mode="SingleStart"]) .ui5-li-root.ui5-custom-li-root{padding-inline:0 1rem}:host([_selection-mode="Multiple"]) .ui5-li-root.ui5-custom-li-root{padding-inline:0 1rem}:host([_selection-mode="SingleEnd"]) .ui5-li-root.ui5-custom-li-root{padding-inline:1rem 0}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ListItemCustom_1;
    /**
     * @class
     *
     * A component to be used as custom list item within the `ui5-list`
     * the same way as the standard `ui5-li`.
     *
     * The component accepts arbitrary HTML content to allow full customization.
     *
     * ### Keyboard Handling
     *
     * Interactive elements placed in the default slot (buttons, links, inputs, etc.)
     * are **not** reached by [Tab] from outside the list. This follows the SAP Fiori
     * "Intentional Edit Pattern" and preserves fast keyboard navigation between items.
     *
     * To activate an interactive element inside a `ui5-li-custom`:
     *
     * - [F2] on the focused item - moves focus to the first interactive element inside the item.
     *   Pressing [F2] again returns focus to the item level.
     * - [F7] on the focused item - moves focus to the last remembered interactive element
     *   inside the item (or to the first interactive element if none is remembered).
     *   Pressing [F7] again saves the current position and returns focus to the item level.
     * - [Tab] or [Shift] + [Tab] then walks through the interactive elements within the item
     *   and continues into the next/previous item.
     * - [Up] or [Down] while focused on an interactive element moves focus to the element
     *   at the same index in the previous/next item; items with no interactive elements
     *   are skipped and `ui5-li-group` boundaries are crossed.
     *
     * See the `ui5-list` "Keyboard Handling" section for the full behavior.
     *
     * @csspart native-li - Used to style the main li tag of the list item
     * @csspart content - Used to style the content area of the list item
     * @csspart detail-button - Used to style the button rendered when the list item is of type detail
     * @csspart delete-button - Used to style the button rendered when the list item is in delete mode
     * @csspart radio - Used to style the radio button rendered when the list item is in single selection mode
     * @csspart checkbox - Used to style the checkbox rendered when the list item is in multiple selection mode
     * @slot {Node[]} default - Defines the content of the component.
     * @constructor
     * @extends ListItem
     * @public
     */
    let ListItemCustom = ListItemCustom_1 = class ListItemCustom extends ListItemTemplate.ListItem {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the item is movable.
             * @default false
             * @public
             * @since 2.0.0
             */
            this.movable = false;
        }
        get isCustomListItem() {
            return true;
        }
        _onkeydown(e) {
            const isFocused = this.matches(":focus");
            const shouldHandle = isFocused
                || webcomponentsBase.x(e) || webcomponentsBase.V(e)
                || webcomponentsBase.ro(e) || webcomponentsBase.io(e)
                || webcomponentsBase.P(e) || webcomponentsBase._(e);
            if (shouldHandle) {
                super._onkeydown(e);
            }
        }
        _onkeyup(e) {
            const isFocused = this.matches(":focus");
            const shouldHandle = isFocused
                || webcomponentsBase.x(e) || webcomponentsBase.V(e)
                || webcomponentsBase.ro(e) || webcomponentsBase.io(e)
                || webcomponentsBase.P(e) || webcomponentsBase._(e);
            if (shouldHandle) {
                super._onkeyup(e);
            }
        }
        get _accessibleNameRef() {
            return `${this._id}-invisibleText`;
        }
        _onfocusin(e) {
            super._onfocusin(e);
            // Skip updating invisible text during drag operations
            if (!this._isDragging() && !this.accessibleName) {
                this._updateInvisibleTextContent();
            }
        }
        _onfocusout(e) {
            super._onfocusout(e);
            // Skip clearing invisible text during drag operations
            if (!this._isDragging() && !this.accessibleName) {
                this._clearInvisibleTextContent();
            }
        }
        /**
         * Checks if this element is currently being dragged
         * @returns True if this element is being dragged
         * @private
         */
        _isDragging() {
            // Check if this specific element has the data-moving attribute
            return this.hasAttribute("data-moving");
        }
        _updateInvisibleTextContent() {
            const listItem = this._listItem;
            if (!listItem) {
                return;
            }
            // Get accessibility announcements
            const accessibilityText = getCustomAnnouncement(this);
            // Apply the announcement using the shared invisible text element from CustomAnnouncement
            applyCustomAnnouncement(listItem, accessibilityText);
        }
        _clearInvisibleTextContent() {
            const listItem = this._listItem;
            if (!listItem) {
                return;
            }
            // Clear the announcement by passing empty text
            applyCustomAnnouncement(listItem, "");
        }
        /**
         * Gets delete button nodes to process for accessibility
         * @returns Array of nodes to process
         * @private
         */
        _getDeleteButtonNodes() {
            if (!this.modeDelete) {
                return [];
            }
            if (this.hasDeleteButtonSlot) {
                // Return custom delete buttons from slot
                return this.deleteButton;
            }
            // Return the built-in delete button from the shadow DOM if it exists
            const deleteButton = this.shadowRoot?.querySelector(`#${this._id}-deleteSelectionElement`);
            return deleteButton ? [deleteButton] : [];
        }
        get classes() {
            const result = super.classes;
            result.main["ui5-custom-li-root"] = true;
            return result;
        }
        get accessibilityInfo() {
            const children = [];
            // Get slotted content elements (default slot)
            const defaultSlot = this.shadowRoot?.querySelector("slot:not([name])");
            if (defaultSlot) {
                const assignedNodes = defaultSlot.assignedNodes({ flatten: true });
                children.push(...assignedNodes);
            }
            // Get delete button nodes
            const deleteButtonNodes = this._getDeleteButtonNodes();
            children.push(...deleteButtonNodes);
            return {
                type: ListItemCustom_1.i18nBundle.getText(i18nDefaults.LISTITEMCUSTOM_TYPE_TEXT),
                children,
            };
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemCustom.prototype, "movable", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemCustom.prototype, "accessibleName", void 0);
    __decorate([
        parametersBundle_css$1.i("@ui5/webcomponents")
    ], ListItemCustom, "i18nBundle", void 0);
    ListItemCustom = ListItemCustom_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-li-custom",
            template: ListItemCustomTemplate,
            renderer: parametersBundle_css.y,
            styles: [ListItemTemplate.ListItem.styles, ListItemCustomCss],
        })
    ], ListItemCustom);
    ListItemCustom.define();
    var ListItemCustom$1 = ListItemCustom;
    const isInstanceOfListItemCustom = webcomponentsBase.r("isCustomListItem");

    exports.ListItemCustom = ListItemCustom$1;
    exports.ListItemCustomTemplate = ListItemCustomTemplate;
    exports.isInstanceOfListItemCustom = isInstanceOfListItemCustom;

}));
