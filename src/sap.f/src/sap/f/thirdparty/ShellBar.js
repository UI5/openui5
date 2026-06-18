sap.ui.define(['exports', 'sap/f/thirdparty/webcomponents-fiori', 'sap/f/thirdparty/event-strict', 'sap/f/thirdparty/query', 'sap/f/thirdparty/parameters-bundle.css', 'sap/f/thirdparty/jsx-runtime', 'sap/f/thirdparty/Theme', 'sap/f/thirdparty/Button2', 'sap/f/thirdparty/ShellBarItem2', 'sap/f/thirdparty/Icon', 'sap/f/thirdparty/ResponsivePopover', 'sap/f/thirdparty/Menu', 'sap/f/thirdparty/List', 'sap/f/thirdparty/search2', 'sap/f/thirdparty/Icons', 'sap/f/thirdparty/overflow', 'sap/f/thirdparty/slim-arrow-down', 'sap/f/thirdparty/parameters-bundle.css2', 'sap/f/thirdparty/ListItemBase', 'sap/f/thirdparty/ShellBarSpacer', 'sap/f/thirdparty/i18n-defaults', 'sap/f/thirdparty/AccessibilityTextsHelper', 'sap/f/thirdparty/willShowContent', 'sap/f/thirdparty/toLowercaseEnumValue', 'sap/f/thirdparty/BusyIndicator', 'sap/f/thirdparty/Label', 'sap/f/thirdparty/i18n-defaults2', 'sap/f/thirdparty/Tag', 'sap/f/thirdparty/decline', 'sap/f/thirdparty/ListItemTemplate', 'sap/f/thirdparty/ListSelectionMode', 'sap/f/thirdparty/ListItemAdditionalText.css', 'sap/f/thirdparty/ValueState', 'sap/f/thirdparty/WrappingType', 'sap/f/thirdparty/Title', 'sap/f/thirdparty/FocusableElements', 'sap/f/thirdparty/InvisibleMessage', 'sap/f/thirdparty/MenuItem2', 'sap/f/thirdparty/ListItemGroup'], (function (exports, webcomponentsBase, eventStrict, query, parametersBundle_css$1, jsxRuntime, Theme, Button, ShellBarItem, Icon, ResponsivePopover, Menu, List, search, Icons, overflow, slimArrowDown, parametersBundle_css, ListItemBase, ShellBarSpacer, i18nDefaults, AccessibilityTextsHelper, willShowContent, toLowercaseEnumValue, BusyIndicator, Label, i18nDefaults$1, Tag, decline, ListItemTemplate, ListSelectionMode, ListItemAdditionalText_css, ValueState, WrappingType, Title, FocusableElements, InvisibleMessage, MenuItem, ListItemGroup) { 'use strict';

	function n(e,o){let t=null,l=null;return function(...u){if(l){t=u;return}e(...u),l=setTimeout(()=>{t&&(e(...t),t=null),l=null;},o);}}

	const name$5 = "bell";
	const pathData$5 = "M1 13c0-.146.156-.365.469-.656.312-.292.635-.714.968-1.266.334-.552.6-1.255.797-2.11.198-.853.183-1.905-.046-3.155a3.583 3.583 0 0 1 .093-1.704c.167-.53.427-1 .781-1.406a4.65 4.65 0 0 1 1.313-1.031 5.498 5.498 0 0 1 1.656-.578c0-.313.073-.573.219-.781C7.396.104 7.646 0 8 0c.292 0 .526.094.703.281.177.188.266.459.266.813a5.41 5.41 0 0 1 1.562.562c.5.271.927.615 1.281 1.032.355.416.61.89.766 1.421.156.532.172 1.1.047 1.704-.25 1.25-.266 2.302-.047 3.156.219.854.505 1.557.86 2.11.354.551.703.973 1.046 1.265.344.291.516.51.516.656a.974.974 0 0 1-.281.719A.974.974 0 0 1 14 14h-4a1.92 1.92 0 0 1-.594 1.406A1.922 1.922 0 0 1 8 16a1.92 1.92 0 0 1-1.406-.594A1.922 1.922 0 0 1 6 14H2a.973.973 0 0 1-.719-.281A.974.974 0 0 1 1 13Zm1.219 0H13.75c-.208-.23-.474-.547-.797-.953-.323-.406-.614-.912-.875-1.516-.26-.604-.448-1.312-.562-2.125-.115-.812-.068-1.74.14-2.781.104-.52.078-.98-.078-1.375-.156-.396-.328-.708-.515-.938-.396-.479-.834-.817-1.313-1.015C9.27 2.099 8.687 2 8 2c-.667 0-1.266.099-1.797.297a3.275 3.275 0 0 0-1.39 1.015c-.209.23-.396.542-.563.938-.167.396-.198.854-.094 1.375.188 1.042.23 1.969.125 2.781-.104.813-.27 1.521-.5 2.125-.229.604-.495 1.11-.797 1.516A13.01 13.01 0 0 1 2.22 13Z";
	const ltr$5 = false;
	const viewBox$5 = "0 0 16 16";
	const collection$5 = "SAP-icons-v4";
	const packageName$5 = "@ui5/webcomponents-icons";

	Icons.y(name$5, { pathData: pathData$5, ltr: ltr$5, viewBox: viewBox$5, collection: collection$5, packageName: packageName$5 });

	const name$4 = "bell";
	const pathData$4 = "M8 1c2.21 0 3.628.956 4.451 2.315.789 1.302.99 2.902.99 4.19v.636c0 1.072.341 1.976.691 2.62.189.347.41.678.669.974.442.469.098 1.265-.546 1.265h-3.837c-.281 1.15-1.256 2-2.418 2-1.162 0-2.137-.85-2.418-2H1.745c-.646 0-.989-.798-.544-1.267a5.19 5.19 0 0 0 .666-.971c.35-.645.691-1.55.691-2.621v-.636c0-1.288.202-2.888.99-4.19C4.372 1.955 5.791 1 8 1Zm0 1.5c-1.695 0-2.621.69-3.167 1.592-.582.96-.774 2.237-.774 3.413v.636c0 1.404-.45 2.563-.885 3.359h9.652c-.436-.795-.886-1.955-.886-3.36v-.635c0-1.176-.191-2.453-.773-3.413C10.621 3.19 9.695 2.5 8 2.5Z";
	const ltr$4 = false;
	const viewBox$4 = "0 0 16 16";
	const collection$4 = "SAP-icons-v5";
	const packageName$4 = "@ui5/webcomponents-icons";

	Icons.y(name$4, { pathData: pathData$4, ltr: ltr$4, viewBox: viewBox$4, collection: collection$4, packageName: packageName$4 });

	var bellIcon = "bell";

	const name$3 = "grid";
	const pathData$3 = "M12.313 11.313h1.718c.292 0 .526.093.703.28.178.188.266.428.266.72V14c0 .292-.088.531-.266.719-.177.187-.411.281-.703.281h-1.719c-.291 0-.525-.094-.703-.281a1.005 1.005 0 0 1-.265-.719v-1.688c0-.291.088-.53.265-.718.178-.188.412-.281.704-.281ZM7.125 6.155h1.719c.291 0 .526.094.703.282.177.187.265.427.265.718v1.688a.99.99 0 0 1-.28.703.91.91 0 0 1-.688.297H7.125a.91.91 0 0 1-.688-.297.988.988 0 0 1-.28-.703V7.156c0-.291.088-.531.265-.718.177-.188.411-.282.703-.282Zm4.219-2.468V2c0-.292.088-.531.265-.719.178-.187.412-.281.704-.281h1.718c.292 0 .526.094.703.281.178.188.266.427.266.719v1.688c0 .27-.094.505-.281.703a.911.911 0 0 1-.688.296h-1.719a.91.91 0 0 1-.687-.296.988.988 0 0 1-.281-.704Zm.969 2.468h1.718c.292 0 .526.094.703.282.178.187.266.427.266.718v1.688c0 .27-.094.505-.281.703a.911.911 0 0 1-.688.297h-1.719a.91.91 0 0 1-.687-.297.988.988 0 0 1-.281-.703V7.156c0-.291.088-.531.265-.718.178-.188.412-.282.704-.282ZM1.969 1h1.718c.292 0 .527.094.704.281.177.188.265.427.265.719v1.688c0 .27-.093.505-.281.703a.91.91 0 0 1-.688.296H1.97a.91.91 0 0 1-.688-.296A.988.988 0 0 1 1 3.687V2c0-.292.089-.531.266-.719.177-.187.411-.281.703-.281ZM1 7.156c0-.291.089-.531.266-.718.177-.188.411-.282.703-.282h1.718c.292 0 .527.094.704.282.177.187.265.427.265.718v1.688c0 .27-.093.505-.281.703a.91.91 0 0 1-.688.297H1.97a.91.91 0 0 1-.688-.297A.988.988 0 0 1 1 8.844V7.156Zm.969 4.157h1.718c.292 0 .527.093.704.28.177.188.265.428.265.72V14c0 .27-.093.505-.281.703a.91.91 0 0 1-.688.297H1.97a.91.91 0 0 1-.688-.297A.988.988 0 0 1 1 14v-1.688c0-.291.089-.53.266-.718.177-.188.411-.281.703-.281ZM7.125 1h1.719c.291 0 .526.094.703.281.177.188.265.427.265.719v1.688a.99.99 0 0 1-.28.703.91.91 0 0 1-.688.296H7.125a.91.91 0 0 1-.688-.296.988.988 0 0 1-.28-.704V2c0-.292.088-.531.265-.719.177-.187.411-.281.703-.281Zm-.969 11.313c0-.292.089-.532.266-.72.177-.187.411-.28.703-.28h1.719c.291 0 .526.093.703.28.177.188.265.428.265.72V14a.99.99 0 0 1-.28.703.91.91 0 0 1-.688.297H7.125a.91.91 0 0 1-.688-.297.988.988 0 0 1-.28-.703v-1.688Z";
	const ltr$3 = false;
	const viewBox$3 = "0 0 16 16";
	const collection$3 = "SAP-icons-v4";
	const packageName$3 = "@ui5/webcomponents-icons";

	Icons.y(name$3, { pathData: pathData$3, ltr: ltr$3, viewBox: viewBox$3, collection: collection$3, packageName: packageName$3 });

	const name$2 = "grid";
	const pathData$2 = "M2.5 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-11-5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM2.5 1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z";
	const ltr$2 = false;
	const viewBox$2 = "0 0 16 16";
	const collection$2 = "SAP-icons-v5";
	const packageName$2 = "@ui5/webcomponents-icons";

	Icons.y(name$2, { pathData: pathData$2, ltr: ltr$2, viewBox: viewBox$2, collection: collection$2, packageName: packageName$2 });

	var gridIcon = "grid";

	const name$1 = "da";
	const pathData$1 = "M1.125 5.094 8 14.625l6.906-9.563L12.125 1H4.281L1.125 5.094ZM8 16a.478.478 0 0 1-.406-.219L.094 5.375A.603.603 0 0 1 0 5.062a.45.45 0 0 1 .094-.28L3.656.187A.473.473 0 0 1 4.031 0h8.344c.188 0 .323.073.406.219l3.125 4.562a.457.457 0 0 1 .094.282.603.603 0 0 1-.094.312l-7.5 10.406A.478.478 0 0 1 8 16Zm3.75-10.188c-.542.188-.953.422-1.234.704-.282.28-.506.692-.672 1.234-.063.167-.177.25-.344.25-.167 0-.281-.083-.344-.25-.166-.542-.39-.953-.672-1.234-.28-.282-.692-.516-1.234-.704C7.083 5.771 7 5.668 7 5.5s.083-.281.25-.344c.542-.187.953-.422 1.234-.703.282-.281.506-.693.672-1.234C9.22 3.073 9.333 3 9.5 3c.167 0 .281.073.344.219.166.541.39.953.672 1.234.28.281.692.516 1.234.703.167.063.25.177.25.344a.415.415 0 0 1-.047.188c-.031.062-.099.104-.203.125Z";
	const ltr$1 = true;
	const viewBox$1 = "0 0 16 16";
	const collection$1 = "SAP-icons-v4";
	const packageName$1 = "@ui5/webcomponents-icons";

	Icons.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

	const name = "da";
	const pathData = "M12 0a.75.75 0 0 1 .62.326l3.25 4.752a.75.75 0 0 1-.018.871l-7.25 9.753a.756.756 0 0 1-1.204 0L.148 5.95a.75.75 0 0 1-.017-.871L3.437.254A.75.75 0 0 1 4 0h8ZM1.67 5.484 8 13.998l6.328-8.514L11.605 1.5h-7.21L1.671 5.484Zm7.5-2.25a.35.35 0 0 1 .66 0c.37 1.084.85 1.575 1.93 1.937.32.11.32.562 0 .662-1.08.371-1.57.853-1.93 1.936a.35.35 0 0 1-.66 0c-.37-1.083-.85-1.575-1.93-1.936-.32-.11-.32-.562 0-.662 1.08-.372 1.57-.853 1.93-1.937Z";
	const ltr = true;
	const viewBox = "0 0 16 16";
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";

	Icons.y(name, { pathData, ltr, viewBox, collection, packageName });

	var daIcon = "da";

	function ShellBarSearchField$1() {
	    return (
	    // .ui5-shellbar-search-field-area is used to measure the width of
	    // the search field. It must be present even if the search is in full-width mode.
	    jsxRuntime.jsx("div", { class: {
	            "ui5-shellbar-search-field-area ui5-shellbar-gap-start ui5-shellbar-search-toggle": true,
	            "ui5-shellbar-hidden": this.isHidden("search")
	        }, children: !this.showFullWidthSearch && (jsxRuntime.jsx("slot", { name: "searchField" })) }));
	}
	function ShellBarSearchFieldFullWidth$1() {
	    return (jsxRuntime.jsxs("div", { class: "ui5-shellbar-search-full-width-wrapper", children: [jsxRuntime.jsx("div", { class: "ui5-shellbar-search-full-field", children: jsxRuntime.jsx("slot", { name: "searchField" }) }), jsxRuntime.jsx(Button.Button, { class: "ui5-shellbar-cancel-button ui5-shellbar-gap-start", design: Button.ButtonDesign.Transparent, onClick: this.handleCancelButtonClick, children: "Cancel" })] }));
	}

	function ShellBarSearchField() {
	    return (
	    // .ui5-shellbar-search-field-area is used to measure the width of
	    // the search field. It must be present even if the search is in full-width mode.
	    jsxRuntime.jsx("div", { class: "ui5-shellbar-search-field-area", children: this.showSearchField && !this.showFullWidthSearch && (jsxRuntime.jsx("div", { class: "ui5-shellbar-search-field ui5-shellbar-gap-start", children: jsxRuntime.jsx("slot", { name: "searchField" }) })) }));
	}
	function ShellBarSearchFieldFullWidth() {
	    return (jsxRuntime.jsxs("div", { class: "ui5-shellbar-search-full-width-wrapper", children: [jsxRuntime.jsx("div", { class: "ui5-shellbar-search-full-field", children: jsxRuntime.jsx("slot", { name: "searchField" }) }), jsxRuntime.jsx(Button.Button, { class: "ui5-shellbar-cancel-button ui5-shellbar-gap-start", design: Button.ButtonDesign.Transparent, onClick: this.handleCancelButtonClick, children: "Cancel" })] }));
	}
	function ShellBarSearchButton() {
	    const searchAction = this.getAction("search");
	    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: !this.hideSearchButton && (jsxRuntime.jsx(Button.Button, { "data-ui5-stable": searchAction?.stableDomRef, class: "ui5-shellbar-search-button ui5-shellbar-action-button ui5-shellbar-gap-start ui5-shellbar-search-toggle", icon: searchAction?.icon, design: "Transparent", onClick: this.handleSearchButtonClick, tooltip: this.actionsAccessibilityInfo.search.title, "aria-expanded": this.showSearchField, accessibilityAttributes: this.actionsAccessibilityInfo.search.accessibilityAttributes })) }));
	}

	function ShellBarLegacyBrandingArea() {
	    const legacy = this.legacyAdaptor;
	    if (!legacy) {
	        return null;
	    }
	    return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [legacy.hasMenuItems && ShellBarInteractiveMenuButton.call(this), legacy.hasMenuItems && ShellBarLegacySecondaryTitle.call(this), !legacy.hasMenuItems && ShellBarLegacyTitleArea.call(this), ShellBarMenuPopover.call(this)] }));
	}
	function ShellBarLegacyTitleArea() {
	    const legacy = this.legacyAdaptor;
	    if (!legacy) {
	        return null;
	    }
	    return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [!!(legacy.isSBreakPoint && legacy.hasLogo) && ShellBarSingleLogo.call(this), !legacy.isSBreakPoint && (legacy.hasLogo || legacy.primaryTitle) && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [ShellBarCombinedLogo.call(this), legacy.hasSecondaryTitle && legacy.hasPrimaryTitle && ShellBarLegacySecondaryTitle.call(this)] }))] }));
	}
	/**
	 * Renders interactive menu button for non-S breakpoints.
	 * Shows primaryTitle with arrow, opens menu popover.
	 */
	function ShellBarInteractiveMenuButton() {
	    const legacy = this.legacyAdaptor;
	    if (!legacy) {
	        return null;
	    }
	    return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [!legacy.showLogoInMenuButton && legacy.hasLogo && ShellBarSingleLogo.call(this), legacy.showTitleInMenuButton && jsxRuntime.jsx("h1", { class: "ui5-hidden-text", children: legacy.primaryTitle }), legacy.showMenuButton && (jsxRuntime.jsxs("button", { class: {
	                    "ui5-shellbar-menu-button": true,
	                    "ui5-shellbar-menu-button--interactive": legacy.hasMenuItems,
	                }, onClick: legacy.handleMenuButtonClickBound, "aria-haspopup": "menu", "aria-expanded": legacy.menuPopoverExpanded, "aria-label": legacy.brandingText, "data-ui5-stable": "menu", tabIndex: 0, children: [legacy.showLogoInMenuButton && (jsxRuntime.jsx("span", { class: "ui5-shellbar-logo", "aria-label": legacy.logoAriaLabel, title: legacy.logoAriaLabel, children: jsxRuntime.jsx("slot", { name: "logo" }) })), legacy.showTitleInMenuButton && (jsxRuntime.jsx("div", { class: "ui5-shellbar-menu-button-title", children: legacy.primaryTitle })), jsxRuntime.jsx(Icon.Icon, { class: "ui5-shellbar-menu-button-arrow", name: slimArrowDown.slimArrowDown })] }))] }));
	}
	/**
	 * Renders single logo on S breakpoint when no menu items.
	 * Used on S breakpoint when no menu items and no branding slot.
	 */
	function ShellBarSingleLogo() {
	    const legacy = this.legacyAdaptor;
	    if (!legacy) {
	        return null;
	    }
	    return (jsxRuntime.jsx("span", { role: legacy.logoRole, class: "ui5-shellbar-logo ui5-shellbar-gap-end", "aria-label": legacy.logoAriaLabel, title: legacy.logoAriaLabel, onClick: legacy.handleLogoClickBound, onKeyDown: legacy.handleLogoKeydownBound, onKeyUp: legacy.handleLogoKeyupBound, tabIndex: 0, "data-ui5-stable": "logo", children: jsxRuntime.jsx("slot", { name: "logo" }) }));
	}
	function ShellBarCombinedLogo() {
	    const legacy = this.legacyAdaptor;
	    if (!legacy) {
	        return null;
	    }
	    return (jsxRuntime.jsxs("div", { role: legacy.logoRole, class: "ui5-shellbar-logo-area", onClick: legacy.handleLogoClickBound, tabIndex: 0, onKeyDown: legacy.handleLogoKeydownBound, onKeyUp: legacy.handleLogoKeyupBound, "aria-label": legacy.logoAriaLabel, children: [legacy.hasLogo && (jsxRuntime.jsx("span", { class: "ui5-shellbar-logo", title: legacy.logoAriaLabel, "data-ui5-stable": "logo", children: jsxRuntime.jsx("slot", { name: "logo" }) })), jsxRuntime.jsx("div", { class: "ui5-shellbar-headings", children: legacy.primaryTitle && (jsxRuntime.jsx("h1", { class: "ui5-shellbar-title", children: jsxRuntime.jsx("bdi", { children: legacy.primaryTitle }) })) })] }));
	}
	function ShellBarLegacySecondaryTitle() {
	    const legacy = this.legacyAdaptor;
	    if (!legacy || !legacy.showSecondaryTitle) {
	        return null;
	    }
	    return (jsxRuntime.jsx("div", { class: "ui5-shellbar-secondary-title ui5-shellbar-gap-start ui5-shellbar-gap-end", "data-ui5-stable": "secondary-title", children: this.secondaryTitle }));
	}
	/**
	 * Renders the menu popover.
	 * Contains the list of menu items.
	 */
	function ShellBarMenuPopover() {
	    const legacy = this.legacyAdaptor;
	    if (!legacy || !legacy.hasMenuItems) {
	        return null;
	    }
	    return (jsxRuntime.jsx(ResponsivePopover.Popover, { class: "ui5-shellbar-menu-popover", hideArrow: true, placement: "Bottom", preventInitialFocus: true, onBeforeOpen: legacy.handleMenuPopoverBeforeOpenBound, onClose: legacy.handleMenuPopoverAfterCloseBound, children: jsxRuntime.jsx(List.List, { separators: "None", selectionMode: "Single", onItemClick: legacy.handleMenuItemClickBound, children: jsxRuntime.jsx("slot", { name: "menuItems" }) }) }));
	}

	function ShellBarTemplate() {
	    const isLegacySearch = !this.isSelfCollapsibleSearch;
	    const SearchInBarTemplate = isLegacySearch ? ShellBarSearchField : ShellBarSearchField$1;
	    const SearchFullWidthTemplate = isLegacySearch ? ShellBarSearchFieldFullWidth : ShellBarSearchFieldFullWidth$1;
	    const profileAction = this.getAction("profile");
	    const overflowAction = this.getAction("overflow");
	    const assistantAction = this.getAction("assistant");
	    const notificationsAction = this.getAction("notifications");
	    const productSwitchAction = this.getAction("products");
	    const actionsAccInfo = this.actionsAccessibilityInfo;
	    return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs("header", { class: "ui5-shellbar-root", part: "root", onKeyDown: this._onKeyDown, "aria-label": this.texts.shellbar, children: [this.showFullWidthSearch && SearchFullWidthTemplate.call(this), this.enabledFeatures.startButton && (jsxRuntime.jsx("div", { class: "ui5-shellbar-start-button ui5-shellbar-gap-end", children: jsxRuntime.jsx("slot", { name: "startButton" }) })), this.enabledFeatures.branding && (jsxRuntime.jsx("div", { class: "ui5-shellbar-branding-area", children: jsxRuntime.jsx("slot", { name: "branding" }) })), !this.enabledFeatures.branding && ShellBarLegacyBrandingArea.call(this), jsxRuntime.jsx("div", { class: "ui5-shellbar-overflow-container", children: jsxRuntime.jsxs("div", { class: "ui5-shellbar-overflow-container-inner", children: [this.enabledFeatures.content && (jsxRuntime.jsxs("div", { class: "ui5-shellbar-content-area ui5-shellbar-content-items", role: this.contentRole, "aria-label": this.texts.contentItems, children: [this.separatorConfig.showStartSeparator && (jsxRuntime.jsx("div", { class: "ui5-shellbar-separator ui5-shellbar-separator-start" })), this.startContent.map(item => {
	                                            const itemId = item._individualSlot;
	                                            const packedSep = this.getPackedSeparatorInfo(item, true);
	                                            return (jsxRuntime.jsxs("div", { id: itemId, class: {
	                                                    "ui5-shellbar-content-item ui5-shellbar-gap-start": true,
	                                                    "ui5-shellbar-hidden": this.isHidden(itemId),
	                                                }, children: [packedSep.shouldPack && (jsxRuntime.jsx("div", { class: "ui5-shellbar-separator ui5-shellbar-separator-start" })), jsxRuntime.jsx("slot", { name: item._individualSlot })] }, itemId));
	                                        }), jsxRuntime.jsx("div", { class: "ui5-shellbar-spacer" }), this.endContent.map(item => {
	                                            const itemId = item._individualSlot;
	                                            const packedSep = this.getPackedSeparatorInfo(item, false);
	                                            return (jsxRuntime.jsxs("div", { id: itemId, class: {
	                                                    "ui5-shellbar-content-item ui5-shellbar-gap-start": true,
	                                                    "ui5-shellbar-hidden": this.isHidden(itemId),
	                                                }, children: [jsxRuntime.jsx("slot", { name: itemId }), packedSep.shouldPack && (jsxRuntime.jsx("div", { class: "ui5-shellbar-separator ui5-shellbar-separator-end ui5-shellbar-gap-start" }))] }, itemId));
	                                        }), this.separatorConfig.showEndSeparator && (jsxRuntime.jsx("div", { class: "ui5-shellbar-separator ui5-shellbar-separator-end ui5-shellbar-gap-start" }))] })), this.enabledFeatures.search && SearchInBarTemplate.call(this), this.enabledFeatures.search && isLegacySearch && ShellBarSearchButton.call(this), assistantAction && (jsxRuntime.jsx("div", { class: {
	                                        "ui5-shellbar-assistant-button ui5-shellbar-gap-start": true,
	                                        "ui5-shellbar-hidden": this.isHidden("assistant")
	                                    }, children: jsxRuntime.jsx("slot", { name: "assistant" }) })), notificationsAction && (jsxRuntime.jsx(Button.Button, { "data-ui5-stable": notificationsAction.stableDomRef, class: {
	                                        "ui5-shellbar-bell-button ui5-shellbar-action-button ui5-shellbar-gap-start": true,
	                                        "ui5-shellbar-hidden": this.isHidden("notifications")
	                                    }, icon: notificationsAction.icon, design: "Transparent", onClick: this.handleNotificationsClick, tooltip: actionsAccInfo.notifications.title, accessibilityAttributes: actionsAccInfo.notifications.accessibilityAttributes, children: notificationsAction?.count && (jsxRuntime.jsx(ShellBarItem.ButtonBadge, { slot: "badge", design: "OverlayText", text: notificationsAction?.count })) })), this.items.map(item => (jsxRuntime.jsx("div", { class: {
	                                        "ui5-shellbar-custom-item ui5-shellbar-gap-start": true,
	                                        "ui5-shellbar-hidden": this.isHidden(item._id),
	                                    }, "data-ui5-stable": item.stableDomRef, children: !item.inOverflow ? jsxRuntime.jsx("slot", { name: item._individualSlot }) : null }, item._id))), overflowAction && (jsxRuntime.jsx(Button.Button, { "data-ui5-stable": overflowAction.stableDomRef, id: "ui5-shellbar-overflow-button", class: {
	                                        "ui5-shellbar-overflow-button ui5-shellbar-action-button ui5-shellbar-gap-start": true,
	                                        "ui5-shellbar-hidden": this.isHidden("overflow")
	                                    }, icon: overflowAction.icon, design: "Transparent", onClick: this.handleOverflowClick, tooltip: actionsAccInfo.overflow.title, accessibilityAttributes: actionsAccInfo.overflow.accessibilityAttributes, children: this.overflowBadge && (jsxRuntime.jsx(ShellBarItem.ButtonBadge, { slot: "badge", design: this.overflowBadge === " " ? "AttentionDot" : "OverlayText", text: this.overflowBadge === " " ? "" : this.overflowBadge })) })), profileAction && (jsxRuntime.jsx(Button.Button, { "data-profile-btn": true, "data-ui5-stable": profileAction.stableDomRef, class: {
	                                        "ui5-shellbar-image-button ui5-shellbar-action-button ui5-shellbar-gap-start": true,
	                                        "ui5-shellbar-hidden": this.isHidden("profile")
	                                    }, design: "Transparent", onClick: this.handleProfileClick, tooltip: actionsAccInfo.profile.title, accessibilityAttributes: actionsAccInfo.profile.accessibilityAttributes, children: jsxRuntime.jsx("slot", { name: "profile" }) })), productSwitchAction && (jsxRuntime.jsx(Button.Button, { "data-ui5-stable": productSwitchAction.stableDomRef, class: {
	                                        "ui5-shellbar-button-product-switch ui5-shellbar-action-button ui5-shellbar-gap-start": true,
	                                        "ui5-shellbar-hidden": this.isHidden("products")
	                                    }, icon: productSwitchAction.icon, design: "Transparent", onClick: this.handleProductSwitchClick, tooltip: actionsAccInfo.products.title, accessibilityAttributes: actionsAccInfo.products.accessibilityAttributes }))] }) })] }), jsxRuntime.jsx(ResponsivePopover.Popover, { class: "ui5-shellbar-overflow-popover", open: this.overflowPopoverOpen, onClose: this.onPopoverClose, opener: "ui5-shellbar-overflow-button", placement: "Bottom", hideArrow: true, horizontalAlign: this.popoverHorizontalAlign, children: jsxRuntime.jsx(List.List, { separators: "None", onClick: this.handleOverflowItemClick, children: this.overflowItems.map(item => {
	                        if (item.type === "action") {
	                            const actionData = item.data;
	                            return (jsxRuntime.jsx(ShellBarItem.ShellBarItem, { icon: actionData.icon ? `sap-icon://${actionData.icon}` : "", "data-action-id": item.id, count: actionData.count, inOverflow: true, text: this.getActionOverflowText(item.id) }, item.id));
	                        }
	                        return jsxRuntime.jsx("slot", { name: item.data._individualSlot }, item.id);
	                    }) }) })] }));
	}

	Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
	Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
	var shellBarStyles = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}::slotted([ui5-input]){--_ui5_input_placeholder_color: var(--sapShell_InteractiveTextColor);--_ui5_input_border_radius: var(--_ui5_shellbar_input_border_radius);--_ui5_input_focus_border_radius: var(--_ui5_shellbar_input_focus_border_radius);--_ui5_input_background_color: var(--_ui5_shellbar_input_background_color);--_ui5_input_focus_outline_color: var(--_ui5_shellbar_input_focus_outline_color);--_ui5_input_margin_top_bottom: 0}::slotted([ui5-input]){background:var(--_ui5_shellbar_search_field_background);border:var(--_ui5_shellbar_search_field_border);box-shadow:var(--_ui5_shellbar_search_field_box_shadow);color:var(--_ui5_shellbar_search_field_color);height:2.25rem;width:100%;min-width:var(--_ui5_shellbar_search_field_width)}:host([breakpoint-size="M"]) ::slotted([ui5-input]),:host([breakpoint-size="S"]) ::slotted([ui5-input]){min-width:1rem}:host([breakpoint-size="M"][show-search-field]) .ui5-shellbar-overflow-container-right-child{flex-grow:1}::slotted([ui5-input]:hover){background:var(--_ui5_shellbar_search_field_background_hover);box-shadow:var(--_ui5_shellbar_search_field_box_shadow_hover)}::slotted([ui5-input][focused]){outline:var(--_ui5_shellbar_search_field_outline_focused)}:host(:not([hidden])){display:inline-block;width:100%;max-width:100%;background:var(--sapShellColor);box-sizing:border-box;box-shadow:inset 0 -.0625rem 0 0 var(--sapPageHeader_BorderColor);--_ui5_button_base_height: var(--sapElement_Height);--_ui5_button_base_padding: .5625rem;--_ui5_button_base_min_width: 2.25rem;--_ui5-button-badge-diameter: .75rem;--_ui5-shellbar_separator-color: var(--sapGroup_ContentBorderColor);--_ui5-shellbar-separator-height: 2rem;--_ui5_shellbar_search_field_width: 25rem;--ui5_shellbar_gap: .5rem}.ui5-shellbar-root{display:flex;align-items:center;height:var(--_ui5_shellbar_root_height);position:relative;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400}::slotted([ui5-button]:not([slot^="content"])),::slotted([ui5-toggle-button]:not([slot^="content"])){height:2.25rem;width:2.25rem;padding:0;border:.0625rem solid var(--sapButton_Lite_BorderColor);background:var(--sapButton_Lite_Background);color:var(--sapShell_TextColor);box-sizing:border-box;border-radius:var(--_ui5_shellbar_button_border_radius);font-weight:700}::slotted([ui5-button]:not([slot^="content"]):not([disabled]):hover),::slotted([ui5-toggle-button]:not([slot^="content"]):not([disabled]):hover){background:var(--sapShell_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapShell_TextColor)}::slotted([ui5-button]:not([slot^="content"]):not([disabled])[active]),::slotted([ui5-toggle-button]:not([slot^="content"]):not([disabled])[active]){background:var(--sapShell_Active_Background);border-color:var(--sapButton_Lite_Active_BorderColor);color:var(--_ui5_shellbar_button_active_color)}::slotted([ui5-button]:not([slot^="content"])),::slotted([ui5-toggle-button]:not([slot^="content"])){--_ui5_button_focused_border: var(--_ui5_shellbar_button_focused_border)}::slotted([ui5-button][slot^="content"]),::slotted([ui5-toggle-button][slot^="content"]){height:2.25rem;min-width:2.25rem}.ui5-shellbar-action-button{color:var(--sapShell_TextColor)}.ui5-shellbar-action-button:hover{background:var(--sapShell_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapShell_InteractiveTextColor)}.ui5-shellbar-action-button[active]{color:var(--_ui5_shellbar_button_active_color)}::slotted([ui5-toggle-button][slot="assistant"]){color:var(--sapShell_TextColor)}::slotted([ui5-toggle-button][slot="assistant"]:hover){color:var(--sapShell_TextColor)}::slotted([ui5-toggle-button][slot="assistant"][active]){color:var(--_ui5_shellbar_button_active_color)}.ui5-shellbar-start-button{flex-shrink:0;display:flex;align-items:center;gap:.5rem}.ui5-shellbar-branding-area{flex-shrink:0;display:flex;align-items:center}.ui5-shellbar-overflow-container{flex-direction:row-reverse;height:100%;flex:1;display:flex;align-items:center;min-width:0;overflow:visible;position:relative}.ui5-shellbar-overflow-container-inner{display:flex;align-items:center;justify-content:end;flex-shrink:0;min-width:100%}.ui5-shellbar-search-field-area{flex:0 1 auto;min-width:0;display:flex;align-items:center;margin-left:auto}:host([show-search-field]:not([show-full-width-search])) ::slotted([slot="searchField"]),:host([show-full-width-search]) .ui5-shellbar-search-field-area{min-width:var(--_ui5_shellbar_search_field_width)}.ui5-shellbar-content-area{flex-grow:1;display:flex;align-items:center}.ui5-shellbar-content-item{flex-shrink:0;display:flex;align-items:center}.ui5-shellbar-spacer{flex-grow:1;height:1px;flex-basis:1rem;flex-shrink:1}.ui5-shellbar-separator{flex-grow:0;flex-shrink:0;height:var(--_ui5-shellbar-separator-height);width:1px;background-color:var(--_ui5-shellbar_separator-color)}.ui5-shellbar-custom-item{width:2.25rem;flex-shrink:0;display:flex;align-items:center}.ui5-shellbar-custom-item.ui5-shellbar-hidden{display:none}.ui5-shellbar-action-button{white-space:initial;overflow:initial;text-overflow:initial;line-height:inherit;letter-spacing:inherit;word-spacing:inherit;width:2.25rem;height:2.25rem;box-sizing:border-box}.ui5-shellbar-action-button>[ui5-button-badge][slot=badge][design=OverlayText]{top:var(--_ui5-shellbar-badge-offset, 0);margin:var(--_ui5-shellbar-badge-margin, -.5rem)}.ui5-shellbar-image-button{display:flex;justify-content:center;align-items:center;width:2.25rem;height:2.25rem;min-width:auto;box-sizing:border-box;--_ui5_button_focused_border_radius: var(--_ui5_shellbar_image_button_border_radius);border-radius:var(--_ui5_shellbar_image_button_border_radius)}.ui5-shellbar-assistant-button{display:flex;align-items:center}::slotted([ui5-toggle-button][slot="assistant"]){margin-inline-start:0}::slotted([ui5-toggle-button][slot="assistant"][pressed]),::slotted([ui5-toggle-button][slot="assistant"][pressed]:hover:not([active])){color:var(--sapShell_Assistant_ForegroundColor)}slot[name=profile]{min-width:0}::slotted([ui5-avatar][slot="profile"]){display:block;width:2rem;height:2rem;min-width:0;min-height:2rem;font-size:var(--_ui5_avatar_fontsize_XS);font-weight:400}.ui5-shellbar-search-full-width-wrapper{position:absolute;bottom:.0625rem;left:0;background:var(--sapShellColor);height:100%;width:100%;z-index:1001;display:flex;align-items:center;box-sizing:border-box;padding:0 1rem}.ui5-shellbar-search-full-width-wrapper .ui5-shellbar-search-full-field{height:2.25rem;width:100%;flex:1}.ui5-shellbar-search-full-width-wrapper ::slotted([ui5-shellbar-search]){max-width:unset;width:100%}:host([breakpoint-size="S"]){padding:0 1rem}:host([breakpoint-size="M"]){padding:0 2rem}:host([breakpoint-size="L"]){padding:0 2rem}:host([breakpoint-size="XL"]){padding:0 3rem}:host([breakpoint-size="XXL"]){padding:0 3rem}:host([breakpoint-size="S"]) .ui5-shellbar-search-full-width-wrapper{padding:0 1rem}:host([breakpoint-size="M"]) .ui5-shellbar-search-full-width-wrapper{padding:0 2rem}.ui5-shellbar-gap-start{margin-inline-start:var(--ui5_shellbar_gap)}.ui5-shellbar-gap-end{margin-inline-end:var(--ui5_shellbar_gap)}.ui5-shellbar-hidden{display:none!important}
`;

	Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
	Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
	var ShellBarPopoverCss = `.ui5-shellbar-menu-popover::part(content),.ui5-shellbar-overflow-popover::part(content){padding:0}.ui5-shellbar-overflow-popover [ui5-li]::part(icon){color:var(--sapList_TextColor)}.ui5-shellbar-overflow-popover ::slotted([ui5-toggle-button]),.ui5-shellbar-overflow-popover ::slotted([ui5-button]){color:var(--sapList_TextColor)}.ui5-shellbar-overflow-popover [ui5-li]::part(title){font-size:var(--sapFontSize)}.ui5-shellbar-overflow-popover [ui5-li]:after{position:relative;width:fit-content;height:1rem;min-width:1rem;background:var(--sapContent_BadgeBackground);border:var(--_ui5_shellbar_button_badge_border);color:var(--sapContent_BadgeTextColor);bottom:calc(100% + .0625rem);left:1.25rem;padding:0 .3125rem;border-radius:.5rem;display:flex;justify-content:center;align-items:center;font-size:var(--sapFontSmallSize);font-family:var(--sapFontFamily);z-index:2;box-sizing:border-box;pointer-events:none}.ui5-shellbar-overflow-popover [ui5-li][data-count]:after{content:attr(data-count)}
`;

	Theme.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => jsxRuntime.defaultThemeBase);
	Theme.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css.defaultTheme, "host");
	var shellBarLegacyStyles = `.ui5-shellbar-logo{overflow:hidden;cursor:pointer;display:flex;align-items:center}.ui5-shellbar-logo-area,.ui5-shellbar-legacy-branding{overflow:hidden;display:flex;align-items:center;padding:.25rem .5rem .25rem .25rem;box-sizing:border-box;cursor:pointer;background:var(--sapButton_Lite_Background);border:1px solid var(--sapButton_Lite_BorderColor);color:var(--sapShell_TextColor);margin-inline-start:.125rem}.ui5-shellbar-logo:focus,.ui5-shellbar-logo-area:focus{outline:var(--_ui5_shellbar_logo_outline);outline-offset:calc(-1 * var(--sapContent_FocusWidth));border-radius:var(--_ui5_shellbar_logo_border_radius)}.ui5-shellbar-overflow-container>.ui5-shellbar-logo:hover,.ui5-shellbar-logo-area:hover{box-shadow:var(--_ui5_shellbar_button_box_shadow);border-radius:var(--_ui5_shellbar_logo_border_radius)}.ui5-shellbar-logo-area:active:focus{background:var(--sapShell_Active_Background);border:1px solid var(--sapButton_Lite_Active_BorderColor);color:var(--sapShell_Active_TextColor)}::slotted([slot="logo"]){max-height:2rem}::slotted([slot="logo"]):active{pointer-events:none}.ui5-shellbar-headings{display:flex;flex-direction:column;justify-content:center;height:100%;overflow:hidden;margin-inline-start:.25rem}.ui5-shellbar-primary-title,.ui5-shellbar-menu-button-title,.ui5-shellbar-title{display:inline-block;font-family:var(--sapFontSemiboldDuplexFamily);margin:0;font-size:var(--_ui5_shellbar_menu_button_title_font_size);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--sapShell_SubBrand_TextColor)}.ui5-shellbar-secondary-title{display:flex;align-items:center;font-size:var(--sapFontSmallSize);color:var(--sapShell_TextColor);font-weight:400;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;text-align:start}.ui5-shellbar-menu-button{white-space:nowrap;overflow:hidden;display:flex;align-items:center;padding:.25rem .5rem;cursor:text;-webkit-user-select:text;-moz-user-select:text;user-select:text;margin-inline-start:.5rem;height:2.25rem;border:.0625rem solid var(--sapButton_Lite_BorderColor);background:var(--sapButton_Lite_Background);outline-color:var(--_ui5_shellbar_logo_outline_color);color:var(--sapShell_TextColor);box-sizing:border-box;border-radius:var(--_ui5_shellbar_button_border_radius);position:relative;font-weight:700}.ui5-shellbar-menu-button.ui5-shellbar-menu-button--interactive{-webkit-user-select:none;-moz-user-select:none;user-select:none;cursor:pointer;background:var(--sapButton_Lite_Background);border:var(--_ui5_shellbar_button_border);color:var(--sapShell_TextColor)}.ui5-shellbar-menu-button.ui5-shellbar-menu-button--interactive:hover{background:var(--sapShell_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapShell_TextColor);box-shadow:var(--_ui5_shellbar_button_box_shadow)}.ui5-shellbar-menu-button.ui5-shellbar-menu-button--interactive:active{background:var(--sapShell_Active_Background);border-color:var(--sapButton_Lite_Active_BorderColor);color:var(--_ui5_shellbar_button_active_color);box-shadow:var(--_ui5_shellbar_button_box_shadow_active)}.ui5-shellbar-menu-button.ui5-shellbar-menu-button--interactive:active .ui5-shellbar-menu-button-arrow,.ui5-shellbar-menu-button.ui5-shellbar-menu-button--interactive:active .ui5-shellbar-menu-button-title{color:var(--sapShell_Active_TextColor)}:host([desktop]) .ui5-shellbar-menu-button.ui5-shellbar-menu-button--interactive:focus,.ui5-shellbar-menu-button.ui5-shellbar-menu-button--interactive:focus-visible{outline:var(--_ui5_shellbar_logo_outline);outline-offset:var(--_ui5_shellbar_outline_offset)}.ui5-shellbar-menu-button.ui5-shellbar-menu-button--interactive::-moz-focus-inner{border:none}.ui5-shellbar-menu-button .ui5-shellbar-logo:hover{box-shadow:none}.ui5-shellbar-menu-button-arrow{display:inline-block;font-family:var(--sapFontSemiboldDuplexFamily);margin:0;font-size:var(--_ui5_shellbar_menu_button_title_font_size);color:var(--sapShell_SubBrand_TextColor)}.ui5-shellbar-menu-button--interactive .ui5-shellbar-menu-button-arrow{margin-inline-start:.375rem}:host(:not([primary-title])) .ui5-shellbar-menu-button{min-width:2.25rem;justify-content:center}:host(:not([with-logo])) .ui5-shellbar-menu-button{margin-inline-start:0}:host([breakpoint-size="S"]) .ui5-shellbar-menu-button{margin-inline-start:0}
`;

	/**
	 * Controller for legacy ShellBar features that will be removed in future versions.
	 * Handles: logo slot, primaryTitle/secondaryTitle properties, menuItems slot.
	 */
	class ShellBarLegacy {
	    constructor(deps) {
	        // Bound handlers for event listeners
	        this.handleLogoClickBound = this.handleLogoClick.bind(this);
	        this.handleLogoKeyupBound = this.handleLogoKeyup.bind(this);
	        this.handleLogoKeydownBound = this.handleLogoKeydown.bind(this);
	        this.handleMenuItemClickBound = this.handleMenuItemClick.bind(this);
	        this.handleMenuButtonClickBound = this.handleMenuButtonClick.bind(this);
	        this.handleMenuPopoverBeforeOpenBound = this.handleMenuPopoverBeforeOpen.bind(this);
	        this.handleMenuPopoverAfterCloseBound = this.handleMenuPopoverAfterClose.bind(this);
	        this.component = deps.component;
	        this.getShadowRoot = deps.getShadowRoot;
	    }
	    /* ------------- Menu Management -------------- */
	    handleMenuButtonClick() {
	        const shadowRoot = this.getShadowRoot();
	        if (!shadowRoot) {
	            return;
	        }
	        const menuButton = shadowRoot.querySelector(".ui5-shellbar-menu-button");
	        const menuPopover = this.getMenuPopover();
	        if (menuPopover && menuButton) {
	            menuPopover.opener = menuButton;
	            menuPopover.open = true;
	        }
	    }
	    handleMenuItemClick(e) {
	        const shouldContinue = this.component.fireDecoratorEvent("menu-item-click", {
	            item: e.detail.item,
	        });
	        if (shouldContinue) {
	            const menuPopover = this.getMenuPopover();
	            if (menuPopover) {
	                menuPopover.open = false;
	            }
	        }
	    }
	    handleMenuPopoverBeforeOpen() {
	        this.component.menuPopoverOpen = true;
	        const menuPopover = this.getMenuPopover();
	        if (menuPopover?.content && menuPopover.content.length) {
	            const list = menuPopover.content[0];
	            if (list instanceof List.List) {
	                list.focusFirstItem();
	            }
	        }
	    }
	    handleMenuPopoverAfterClose() {
	        this.component.menuPopoverOpen = false;
	    }
	    getMenuPopover() {
	        const shadowRoot = this.getShadowRoot();
	        return shadowRoot?.querySelector(".ui5-shellbar-menu-popover");
	    }
	    get hasMenuItems() {
	        return this.component.menuItems.length > 0;
	    }
	    get menuPopoverExpanded() {
	        return this.component.menuPopoverOpen;
	    }
	    /* ------------- Logo Management -------------- */
	    handleLogoClick() {
	        const shadowRoot = this.getShadowRoot();
	        if (!shadowRoot) {
	            return;
	        }
	        const logoElement = shadowRoot.querySelector(".ui5-shellbar-logo");
	        if (logoElement) {
	            this.component.fireDecoratorEvent("logo-click", {
	                targetRef: logoElement,
	            });
	        }
	    }
	    handleLogoKeydown(e) {
	        if (webcomponentsBase.A(e)) {
	            e.preventDefault();
	            return;
	        }
	        if (webcomponentsBase.b(e)) {
	            this.handleLogoClick();
	        }
	    }
	    handleLogoKeyup(e) {
	        if (webcomponentsBase.A(e)) {
	            this.handleLogoClick();
	        }
	    }
	    get hasLogo() {
	        return this.component.logo.length > 0;
	    }
	    get logoRole() {
	        return this.component.accessibilityAttributes.logo?.role || "link";
	    }
	    get logoAriaLabel() {
	        return this.component.accessibilityAttributes.logo?.name || "Logo";
	    }
	    get brandingText() {
	        return this.component.accessibilityAttributes.branding?.name || this.primaryTitle;
	    }
	    /* ------------- Title Management -------------- */
	    get hasPrimaryTitle() {
	        return !!this.component.primaryTitle;
	    }
	    get hasSecondaryTitle() {
	        return !!this.component.secondaryTitle;
	    }
	    get showSecondaryTitle() {
	        return this.hasSecondaryTitle && !this.component.isSBreakPoint;
	    }
	    get primaryTitle() {
	        return this.component.primaryTitle || "";
	    }
	    get secondaryTitle() {
	        return this.component.secondaryTitle || "";
	    }
	    /* ------------- Menu Button -------------- */
	    get showMenuButton() {
	        return this.hasPrimaryTitle || this.showLogoInMenuButton;
	    }
	    get showLogoInMenuButton() {
	        return this.hasLogo && this.isSBreakPoint;
	    }
	    get showTitleInMenuButton() {
	        return this.hasPrimaryTitle && !this.showLogoInMenuButton;
	    }
	    /* ------------- Common -------------- */
	    get isSBreakPoint() {
	        return this.component.isSBreakPoint;
	    }
	}

	/**
	 * Search controller for self-collapsible search (ui5-shellbar-search).
	 * Handles search fields with collapsed/open properties and ui5-open/close/search events.
	 */
	class ShellBarSearch {
	    constructor({ getOverflowed, setSearchState, getSearchField, getSearchState, getCSSVariable, }) {
	        this.onSearchBound = this.onSearch.bind(this);
	        this.onSearchOpenBound = this.onSearchOpen.bind(this);
	        this.onSearchCloseBound = this.onSearchClose.bind(this);
	        this.initialRender = true;
	        this.getOverflowed = getOverflowed;
	        this.getCSSVariable = getCSSVariable;
	        this.getSearchField = getSearchField;
	        this.getSearchState = getSearchState;
	        this.setSearchState = setSearchState;
	    }
	    subscribe(searchField = this.getSearchField()) {
	        if (!searchField) {
	            return;
	        }
	        searchField.addEventListener("ui5-open", this.onSearchOpenBound);
	        searchField.addEventListener("ui5-close", this.onSearchCloseBound);
	        searchField.addEventListener("ui5-search", this.onSearchBound);
	    }
	    unsubscribe(searchField = this.getSearchField()) {
	        if (!searchField) {
	            return;
	        }
	        searchField.removeEventListener("ui5-open", this.onSearchOpenBound);
	        searchField.removeEventListener("ui5-close", this.onSearchCloseBound);
	        searchField.removeEventListener("ui5-search", this.onSearchBound);
	    }
	    /**
	     * Auto-collapse/restore search field based on available space.
	     * Delegates decision logic to SearchController.
	     */
	    autoManageSearchState(hiddenItems, availableSpace) {
	        if (!this.hasSearchField) {
	            return;
	        }
	        // Get search field min width from CSS variable
	        const searchFieldWidth = this.getSearchFieldWidth();
	        const searchHasFocus = document.activeElement === this.getSearchField();
	        const searchHasValue = !!this.getSearchField()?.value;
	        // On initial load, allow search to collapse even if it would trigger full-screen mode.
	        // This prevents search from showing in full-screen when page loads on small screens.
	        // After initial render, prevent collapse in full-screen mode during resize.
	        const inFullScreen = !this.initialRender && this.shouldShowFullScreen();
	        const preventCollapse = searchHasFocus || searchHasValue || inFullScreen;
	        if (hiddenItems > 0 && !preventCollapse) {
	            this.setSearchState(false);
	        }
	        else if (availableSpace + this.getSearchButtonSize() > searchFieldWidth) {
	            this.setSearchState(true);
	        }
	        this.initialRender = false;
	    }
	    /**
	     * Applies the show-search-field state to the search field.
	     */
	    syncShowSearchFieldState() {
	        const search = this.getSearchField();
	        if (!search) {
	            return;
	        }
	        if (Theme.d()) {
	            // On initial render, don't auto-open the search dialog on phones
	            // to prevent the full-screen search from showing when page loads
	            if (this.initialRender) {
	                return;
	            }
	            search.open = this.getSearchState();
	        }
	        else {
	            search.collapsed = !this.getSearchState();
	        }
	    }
	    /**
	     * Determines if full-screen search should be shown.
	     * Full-screen search activates when overflow happens AND search is visible.
	     */
	    shouldShowFullScreen() {
	        return this.getOverflowed() && this.getSearchState();
	    }
	    onSearchOpen(e) {
	        if (e.target !== this.getSearchField()) {
	            this.unsubscribe(e.target);
	            return;
	        }
	        if (Theme.d()) {
	            this.setSearchState(true);
	        }
	    }
	    onSearchClose(e) {
	        if (e.target !== this.getSearchField()) {
	            this.unsubscribe(e.target);
	            return;
	        }
	        if (Theme.d()) {
	            this.setSearchState(false);
	        }
	    }
	    onSearch(e) {
	        if (e.target !== this.getSearchField()) {
	            this.unsubscribe(e.target);
	            return;
	        }
	        // On mobile or if has value, don't toggle
	        if (Theme.d() || (this.getSearchField()?.value && this.getSearchState())) {
	            return;
	        }
	        this.setSearchState(!this.getSearchState());
	    }
	    /**
	     * Gets the minimum width needed for search field from CSS variable.
	     */
	    getSearchFieldWidth() {
	        const width = this.getCSSVariable(ShellBarSearch.CSS_VARIABLE);
	        if (!width) {
	            return ShellBarSearch.FALLBACK_WIDTH;
	        }
	        // Convert rem to px
	        if (width.endsWith("rem")) {
	            const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
	            return parseFloat(width) * fontSize;
	        }
	        return parseFloat(width);
	    }
	    get hasSearchField() {
	        return !!this.getSearchField();
	    }
	    /**
	     * Gets the size of the search button.
	     * If the search field is visible, the size is 0.
	     * Otherwise, it is the width of the search field (just a button in collapsed state).
	     */
	    getSearchButtonSize() {
	        return this.getSearchState() ? 0 : this.getSearchField()?.getBoundingClientRect().width || 0;
	    }
	}
	ShellBarSearch.CSS_VARIABLE = "--_ui5_shellbar_search_field_width";
	ShellBarSearch.FALLBACK_WIDTH = 400;

	/**
	 * Search controller for legacy search fields (ui5-input, custom div).
	 * Handles search fields that don't have collapsed/open properties.
	 * Supports disableSearchCollapse for preventing auto-collapse.
	 */
	class ShellBarSearchLegacy {
	    constructor({ getOverflowed, setSearchState, getSearchField, getSearchState, getCSSVariable, getDisableSearchCollapse, }) {
	        this.initialRender = true;
	        this.getOverflowed = getOverflowed;
	        this.getCSSVariable = getCSSVariable;
	        this.getSearchField = getSearchField;
	        this.getSearchState = getSearchState;
	        this.setSearchState = setSearchState;
	        this.getDisableSearchCollapse = getDisableSearchCollapse;
	    }
	    /**
	     * No-op for legacy search - legacy fields don't emit ui5-open/close/search events.
	     */
	    subscribe() {
	        // No events to subscribe to for legacy search fields
	    }
	    /**
	     * No-op for legacy search - no event listeners to clean up.
	     */
	    unsubscribe() {
	        // No events to unsubscribe from
	    }
	    /**
	     * Auto-collapse/restore search field based on available space.
	     * Respects disableSearchCollapse flag, focus state, and field value.
	     */
	    autoManageSearchState(hiddenItems, availableSpace) {
	        if (!this.hasSearchField) {
	            return;
	        }
	        // Check if auto-collapse is disabled
	        if (this.getDisableSearchCollapse()) {
	            return;
	        }
	        const searchFieldWidth = this.getSearchFieldWidth();
	        // Check focus and value to prevent collapse
	        const searchField = this.getSearchField();
	        const searchHasFocus = searchField?.contains(document.activeElement) || false;
	        const searchHasValue = this.hasValue(searchField);
	        // On initial load, allow search to collapse even if it would trigger full-screen mode.
	        // This prevents search from showing in full-screen when page loads on small screens.
	        // After initial render, prevent collapse in full-screen mode during resize.
	        const inFullScreen = !this.initialRender && this.shouldShowFullScreen();
	        const preventCollapse = searchHasFocus || searchHasValue || inFullScreen;
	        if (hiddenItems > 0 && !preventCollapse) {
	            this.setSearchState(false);
	        }
	        else if (availableSpace + this.getSearchButtonSize() > searchFieldWidth) {
	            this.setSearchState(true);
	        }
	        this.initialRender = false;
	    }
	    /**
	     * No-op for legacy search - legacy fields don't have collapsed/open properties.
	     */
	    syncShowSearchFieldState() {
	        // Legacy search fields don't have collapsed/open properties to sync
	    }
	    /**
	     * Determines if full-screen search should be shown.
	     * Full-screen search activates when overflow happens AND search is visible.
	     */
	    shouldShowFullScreen() {
	        return this.getOverflowed() && this.getSearchState();
	    }
	    /**
	     * Get value from various field types.
	     * Supports ui5-input (value property) and custom div (nested input element).
	     */
	    hasValue(searchField) {
	        if (!searchField) {
	            return false;
	        }
	        // ui5-input or similar components with value property
	        if ("value" in searchField) {
	            return !!searchField.value;
	        }
	        // Custom div - find input inside
	        const input = searchField.querySelector("input");
	        return input ? !!input.value : false;
	    }
	    /**
	     * Get minimum width needed for search field from CSS variable.
	     */
	    getSearchFieldWidth() {
	        const width = this.getCSSVariable(ShellBarSearchLegacy.CSS_VARIABLE);
	        if (!width) {
	            return ShellBarSearchLegacy.FALLBACK_WIDTH;
	        }
	        // Convert rem to px
	        if (width.endsWith("rem")) {
	            const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
	            return parseFloat(width) * fontSize;
	        }
	        return parseFloat(width);
	    }
	    get hasSearchField() {
	        return !!this.getSearchField();
	    }
	    /**
	     * Get search button size for overflow calculation.
	     * Returns 0 if search is expanded, otherwise returns button width.
	     */
	    getSearchButtonSize() {
	        return this.getSearchState() ? 0 : this.getSearchField()?.getBoundingClientRect().width || 0;
	    }
	}
	ShellBarSearchLegacy.CSS_VARIABLE = "--_ui5_shellbar_search_field_width";
	ShellBarSearchLegacy.FALLBACK_WIDTH = 400;

	class ShellBarOverflow {
	    constructor() {
	        this.CLOSED_SEARCH_STRATEGY = {
	            ACTIONS: 0, // All actions hide first
	            CONTENT: 1000, // Then content (except last)
	            SEARCH: 2000, // Then search button
	            LAST_CONTENT: 3000, // Last content item hides last
	        };
	        this.OPEN_SEARCH_STRATEGY = {
	            CONTENT: 0, // All content hide first
	            ACTIONS: 1000, // All actions next
	            SEARCH: 2000, // Then search button
	            LAST_CONTENT: 0, // Last content same as other content
	        };
	    }
	    updateOverflow(params) {
	        const { overflowOuter, overflowInner, setVisible, } = params;
	        if (!overflowOuter || !overflowInner) {
	            return { hiddenItemsIds: [], showOverflowButton: false };
	        }
	        const sortedItems = this.buildHidableItems(params);
	        // set initial state, to account for isOverflowing calculation
	        setVisible(ShellBarActionsSelectors.Overflow, false);
	        sortedItems.forEach(item => {
	            // show all items to account for isOverflowing calculation
	            setVisible(item.selector, true);
	        });
	        let nextItemToHide = null;
	        let showOverflowButton = false;
	        const hiddenItemsIds = [];
	        // Iteratively hide items until no overflow
	        for (let indexToHide = 0; indexToHide < sortedItems.length; indexToHide++) {
	            nextItemToHide = sortedItems[indexToHide];
	            if (!this.isOverflowing(overflowOuter, overflowInner)) {
	                break; // No more overflow, stop hiding
	            }
	            setVisible(nextItemToHide.selector, false);
	            hiddenItemsIds.push(nextItemToHide.id);
	            if (nextItemToHide.showInOverflow) {
	                // show overflow button to account in isOverflowing calculation
	                setVisible(ShellBarActionsSelectors.Overflow, true);
	                showOverflowButton = true;
	            }
	        }
	        return {
	            hiddenItemsIds,
	            showOverflowButton,
	        };
	    }
	    isOverflowing(overflowOuter, overflowInner) {
	        return overflowInner.offsetWidth > overflowOuter.offsetWidth;
	    }
	    getOverflowStrategy(showSearchField) {
	        return showSearchField ? this.OPEN_SEARCH_STRATEGY : this.CLOSED_SEARCH_STRATEGY;
	    }
	    buildHidableItems(params) {
	        const items = [
	            ...this.buildContent(params),
	            ...this.buildActions(params),
	        ];
	        // sort by hideOrder first then by keepHidden keepHidden items are at the start
	        return items.sort((a, b) => {
	            if (a.keepHidden && !b.keepHidden) {
	                return -1;
	            }
	            if (!a.keepHidden && b.keepHidden) {
	                return 1;
	            }
	            return a.hideOrder - b.hideOrder;
	        });
	    }
	    buildContent(params) {
	        const { content, showSearchField, } = params;
	        const items = [];
	        const overflowStrategy = this.getOverflowStrategy(showSearchField);
	        // Build content items
	        content.forEach((item, index) => {
	            const slotName = item._individualSlot;
	            const dataHideOrder = parseInt(item.getAttribute("data-hide-order") || String(index));
	            const isLast = index === content.length - 1;
	            const priority = isLast ? overflowStrategy.LAST_CONTENT : overflowStrategy.CONTENT;
	            items.push({
	                id: slotName,
	                selector: `#${slotName}`,
	                hideOrder: priority + dataHideOrder,
	                keepHidden: false, // Content items don't cause flickering
	                showInOverflow: false,
	            });
	        });
	        return items;
	    }
	    buildActions(params) {
	        const { customItems, actions, showSearchField, hiddenItemsIds, } = params;
	        const items = [];
	        const overflowStrategy = this.getOverflowStrategy(showSearchField);
	        let actionIndex = 0;
	        customItems.forEach(item => {
	            items.push({
	                id: item._id,
	                selector: `[data-ui5-stable="${item.stableDomRef}"]`,
	                hideOrder: overflowStrategy.ACTIONS + actionIndex++,
	                keepHidden: hiddenItemsIds.includes(item._id),
	                showInOverflow: true,
	            });
	        });
	        actions
	            // skip protected actions and search (handled separately)
	            .filter(a => !a.isProtected && a.id !== ShellBarActions.Search)
	            .forEach(config => {
	            items.push({
	                id: config.id,
	                selector: config.selector,
	                hideOrder: overflowStrategy.ACTIONS + actionIndex++,
	                keepHidden: hiddenItemsIds.includes(config.id),
	                showInOverflow: true,
	            });
	        });
	        if (!showSearchField) {
	            // Only move search to overflow if it's closed
	            items.push({
	                id: ShellBarActions.Search,
	                selector: ShellBarActionsSelectors.Search,
	                hideOrder: overflowStrategy.SEARCH + actionIndex++,
	                keepHidden: false, // Search button can be shown/hidden freely
	                showInOverflow: true,
	            });
	        }
	        return items;
	    }
	    getOverflowItems(params) {
	        const { actions, customItems, hiddenItemsIds } = params;
	        const result = [];
	        // Add hidden custom items
	        const hiddenCustomItems = customItems.filter((item) => hiddenItemsIds.includes(item._id));
	        hiddenCustomItems.forEach((item, index) => {
	            result.push({
	                type: "item", id: item._id, data: item, order: 3 + index,
	            });
	        });
	        const actionOrder = {
	            [ShellBarActions.Search]: 0,
	            [ShellBarActions.Notifications]: 1,
	            [ShellBarActions.Assistant]: 2,
	        };
	        const hiddenActions = actions.filter(action => hiddenItemsIds.includes(action.id));
	        hiddenActions.forEach(action => {
	            result.push({
	                type: "action",
	                id: action.id,
	                data: action,
	                order: actionOrder[action.id] ?? 0,
	            });
	        });
	        return result.sort((a, b) => a.order - b.order);
	    }
	}

	class ShellBarAccessibility {
	    getActionsAccessibilityAttributes(defaultTexts, params) {
	        const { overflowPopoverOpen, accessibilityAttributes } = params;
	        const overflowExpanded = accessibilityAttributes.overflow?.expanded;
	        return {
	            notifications: {
	                title: defaultTexts.notifications,
	                accessibilityAttributes: {
	                    expanded: accessibilityAttributes.notifications?.expanded,
	                    hasPopup: accessibilityAttributes.notifications?.hasPopup,
	                },
	            },
	            profile: {
	                title: accessibilityAttributes.profile?.name || defaultTexts.profile,
	                accessibilityAttributes: {
	                    hasPopup: accessibilityAttributes.profile?.hasPopup,
	                    expanded: accessibilityAttributes.profile?.expanded,
	                },
	            },
	            products: {
	                title: defaultTexts.products,
	                accessibilityAttributes: {
	                    hasPopup: accessibilityAttributes.product?.hasPopup,
	                    expanded: accessibilityAttributes.product?.expanded,
	                },
	            },
	            search: {
	                title: defaultTexts.search,
	                accessibilityAttributes: {
	                    hasPopup: accessibilityAttributes.search?.hasPopup,
	                },
	            },
	            overflow: {
	                title: defaultTexts.overflow,
	                accessibilityAttributes: {
	                    hasPopup: accessibilityAttributes.overflow?.hasPopup || "menu",
	                    expanded: overflowExpanded === undefined ? overflowPopoverOpen : overflowExpanded,
	                },
	            },
	        };
	    }
	    getActionsRole(visibleItemsCount) {
	        return visibleItemsCount > 1 ? "toolbar" : undefined;
	    }
	    getContentRole(visibleItemsCount) {
	        return visibleItemsCount > 1 ? "group" : undefined;
	    }
	}

	class ShellBarItemNavigation {
	    constructor(params) {
	        this.params = params;
	    }
	    handleKeyDown(e) {
	        if (!this.shouldHandle(e)) {
	            return;
	        }
	        const domRef = this.params.getDomRef();
	        if (!domRef) {
	            return;
	        }
	        const activeElement = webcomponentsBase.t();
	        if (!activeElement) {
	            return;
	        }
	        if (this.shouldChildHandleNavigation(activeElement, e)) {
	            return;
	        }
	        const items = this.getTabbableItems(domRef);
	        const currentIndex = items.findIndex(el => el === activeElement);
	        if (currentIndex !== -1) {
	            e.preventDefault();
	            this.navigateToItem(items, currentIndex, e);
	        }
	    }
	    shouldHandle(e) {
	        return webcomponentsBase.D(e) || webcomponentsBase.R(e) || webcomponentsBase.M(e) || webcomponentsBase.n(e);
	    }
	    shouldChildHandleNavigation(element, e) {
	        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
	            return this.shouldInputHandleNavigation(element, e);
	        }
	        return false;
	    }
	    shouldInputHandleNavigation(input, e) {
	        const cursorPos = input.selectionStart || 0;
	        const textLength = input.value.length;
	        if (webcomponentsBase.D(e) && cursorPos > 0) {
	            return true;
	        }
	        if (webcomponentsBase.R(e) && cursorPos < textLength) {
	            return true;
	        }
	        return false;
	    }
	    getTabbableItems(domRef) {
	        return ListItemBase.b(domRef).filter(el => this.isVisible(el));
	    }
	    isVisible(element) {
	        const style = getComputedStyle(element);
	        return style.display !== "none"
	            && style.visibility !== "hidden"
	            && element.offsetWidth > 0
	            && element.offsetHeight > 0;
	    }
	    navigateToItem(items, currentIndex, e) {
	        if (webcomponentsBase.D(e)) {
	            this.focusPrevious(items, currentIndex);
	        }
	        else if (webcomponentsBase.R(e)) {
	            this.focusNext(items, currentIndex);
	        }
	        else if (webcomponentsBase.M(e)) {
	            items[0]?.focus();
	        }
	        else if (webcomponentsBase.n(e)) {
	            items[items.length - 1]?.focus();
	        }
	    }
	    focusPrevious(items, currentIndex) {
	        if (currentIndex > 0) {
	            items[currentIndex - 1].focus();
	        }
	    }
	    focusNext(items, currentIndex) {
	        if (currentIndex < items.length - 1) {
	            items[currentIndex + 1].focus();
	        }
	    }
	}

	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var ShellBar_1;
	const ShellBarActions = {
	    Search: "search",
	    Profile: "profile",
	    Overflow: "overflow",
	    Assistant: "assistant",
	    ProductSwitch: "products",
	    Notifications: "notifications",
	};
	const ShellBarActionsSelectors = {
	    Search: ".ui5-shellbar-search-toggle",
	    Profile: ".ui5-shellbar-image-button",
	    Overflow: ".ui5-shellbar-overflow-button",
	    Assistant: ".ui5-shellbar-assistant-button",
	    ProductSwitch: ".ui5-shellbar-button-product-switch",
	    Notifications: ".ui5-shellbar-bell-button",
	};
	/**
	 * @class
	 * ### Overview
	 *
	 * The `ui5-shellbar` is meant to serve as an application header
	 * and includes numerous built-in features, such as: logo, profile image/icon, title, search field, notifications and so on.
	 *
	 * ### Stable DOM Refs
	 *
	 * You can use the following stable DOM refs for the `ui5-shellbar`:
	 *
	 * - logo
	 * - notifications
	 * - overflow
	 * - profile
	 * - product-switch
	 *
	 * ### Keyboard Handling
	 *
	 * #### Fast Navigation
	 * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
	 * In order to use this functionality, you need to import the following module:
	 * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
	 *
	 * ### ES6 Module Import
	 * `import "@ui5/webcomponents-fiori/dist/ShellBar.js";`
	 * @csspart root - Used to style the outermost wrapper of the `ui5-shellbar`
	 * @constructor
	 * @extends UI5Element
	 * @public
	 * @since 0.8.0
	 */
	let ShellBar = ShellBar_1 = class ShellBar extends webcomponentsBase.S {
	    constructor() {
	        super(...arguments);
	        /**
	         * Defines, if the notification icon would be displayed.
	         * @default false
	         * @public
	         */
	        this.showNotifications = false;
	        /**
	         * Defines, if the product switch icon would be displayed.
	         * @default false
	         * @public
	         */
	        this.showProductSwitch = false;
	        /**
	         * Defines, if the Search Field would be displayed when there is a valid `searchField` slot.
	         *
	         * **Note:** By default the Search Field is not displayed.
	         * @default false
	         * @public
	         */
	        this.showSearchField = false;
	        /**
	         * Defines additional accessibility attributes on different areas of the component.
	         *
	         * The accessibilityAttributes object has the following fields,
	         * where each field is an object supporting one or more accessibility attributes:
	         *
	         * - **logo** - `logo.role` and `logo.name`.
	         * - **notifications** - `notifications.expanded` and `notifications.hasPopup`.
	         * - **profile** - `profile.expanded`, `profile.hasPopup` and `profile.name`.
	         * - **product** - `product.expanded` and `product.hasPopup`.
	         * - **search** - `search.hasPopup`.
	         * - **overflow** - `overflow.expanded` and `overflow.hasPopup`.
	         * - **branding** - `branding.name`.
	         *
	         * The accessibility attributes support the following values:
	         *
	         * - **role**: Defines the accessible ARIA role of the logo area.
	         * Accepts the following string values: `button` or `link`.
	         *
	         * - **expanded**: Indicates whether the button, or another grouping element it controls,
	         * is currently expanded or collapsed.
	         * Accepts the following string values: `true` or `false`.
	         *
	         * - **hasPopup**: Indicates the availability and type of interactive popup element,
	         * such as menu or dialog, that can be triggered by the button.
	         *
	         * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
	         * - **name**: Defines the accessible ARIA name of the area.
	         * Accepts any string.
	         *
	         * @default {}
	         * @public
	         * @since 1.10.0
	         */
	        this.accessibilityAttributes = {};
	        /**
	         * @private
	         */
	        this.breakpointSize = "S";
	        /**
	         * Actions computed from controllers.
	         * @private
	         */
	        this.actions = [];
	        /**
	         * Show overflow button when items are hidden.
	         * @private
	         */
	        this.showOverflowButton = false;
	        /**
	         * Open state of the overflow popover.
	         * @private
	         */
	        this.overflowPopoverOpen = false;
	        /**
	         * IDs of items currently hidden due to overflow.
	         * Used to trigger rerender for conditional rendering.
	         * @private
	         */
	        this.hiddenItemsIds = [];
	        /**
	         * Show full-screen search overlay.
	         * @private
	         */
	        this.showFullWidthSearch = false;
	        this.RESIZE_THROTTLE_RATE = 100; // ms
	        this.handleResizeBound = n(this.handleResize.bind(this), this.RESIZE_THROTTLE_RATE);
	        this.breakpoints = [599, 1023, 1439, 1919, 10000];
	        this.breakpointMap = {
	            599: "S",
	            1023: "M",
	            1439: "L",
	            1919: "XL",
	            10000: "XXL",
	        };
	        this.itemNavigation = new ShellBarItemNavigation({
	            getDomRef: () => this.getDomRef() || null,
	        });
	        this.overflow = new ShellBarOverflow();
	        this.accessibility = new ShellBarAccessibility();
	        this._searchAdaptor = new ShellBarSearch(this.getSearchDeps());
	        this._searchAdaptorLegacy = new ShellBarSearchLegacy({
	            ...this.getSearchDeps(),
	            getDisableSearchCollapse: () => this.disableSearchCollapse,
	        });
	        /* =================== Legacy Members =================== */
	        /**
	         * Defines the visibility state of the search button.
	         *
	         * **Note:** The `hideSearchButton` property is in an experimental state and is a subject to change.
	         * @default false
	         * @public
	         */
	        this.hideSearchButton = false;
	        /**
	         * Disables the automatic search field expansion/collapse when the available space is not enough.
	         *
	         * **Note:** The `disableSearchCollapse` property is in an experimental state and is a subject to change.
	         * @default false
	         * @public
	         */
	        this.disableSearchCollapse = false;
	        /**
	         * Open state of the menu popover (legacy).
	         * @private
	         */
	        this.menuPopoverOpen = false;
	    }
	    /* =================== Lifecycle Methods =================== */
	    onEnterDOM() {
	        webcomponentsBase.f.register(this, this.handleResizeBound);
	        this.searchAdaptor?.subscribe();
	    }
	    onExitDOM() {
	        webcomponentsBase.f.deregister(this, this.handleResizeBound);
	        this.searchAdaptor?.unsubscribe();
	    }
	    onBeforeRendering() {
	        if (!this.legacyAdaptor) {
	            this.initLegacyController();
	        }
	        // Sync branding breakpoint state
	        this.branding.forEach(brandingEl => {
	            brandingEl._isSBreakPoint = this.isSBreakPoint;
	        });
	        this.buildActions();
	        this.searchAdaptor?.syncShowSearchFieldState();
	        // subscribe to search adaptor for cases when search is added dynamically
	        this.searchAdaptor?.unsubscribe();
	        this.searchAdaptor?.subscribe();
	    }
	    onAfterRendering() {
	        this.updateBreakpoint();
	        this.updateOverflow();
	    }
	    /* =================== Actions Management =================== */
	    buildActions() {
	        this.actions = [
	            {
	                id: ShellBarActions.Search,
	                icon: search.searchIcon,
	                enabled: this.enabledFeatures.search,
	                selector: ShellBarActionsSelectors.Search,
	                isProtected: false,
	                stableDomRef: "toggle-search",
	            },
	            {
	                id: ShellBarActions.Assistant,
	                icon: daIcon,
	                enabled: this.enabledFeatures.assistant,
	                selector: ShellBarActionsSelectors.Assistant,
	                isProtected: false,
	            },
	            {
	                id: ShellBarActions.Notifications,
	                icon: bellIcon,
	                count: this.notificationsCount,
	                enabled: this.enabledFeatures.notifications,
	                selector: ShellBarActionsSelectors.Notifications,
	                isProtected: false,
	                stableDomRef: "notifications",
	            },
	            {
	                id: ShellBarActions.Overflow,
	                icon: overflow.overflowIcon,
	                enabled: this.enabledFeatures.overflow,
	                selector: ShellBarActionsSelectors.Overflow,
	                isProtected: true,
	                stableDomRef: "overflow",
	            },
	            {
	                id: ShellBarActions.Profile,
	                enabled: this.enabledFeatures.profile,
	                selector: ShellBarActionsSelectors.Profile,
	                isProtected: true,
	                stableDomRef: "profile",
	            },
	            {
	                id: ShellBarActions.ProductSwitch,
	                icon: gridIcon,
	                enabled: this.enabledFeatures.productSwitch,
	                selector: ShellBarActionsSelectors.ProductSwitch,
	                isProtected: true,
	                stableDomRef: "product-switch",
	            },
	        ].filter(action => action.enabled);
	    }
	    getAction(actionId) {
	        return this.actions.find(action => action.id === actionId);
	    }
	    getActionOverflowText(actionId) {
	        const texts = {
	            [ShellBarActions.Search]: this.texts.search,
	            [ShellBarActions.Profile]: this.texts.profile,
	            [ShellBarActions.Overflow]: this.texts.overflow,
	            [ShellBarActions.Assistant]: this.texts.assistant,
	            [ShellBarActions.ProductSwitch]: this.texts.products,
	            [ShellBarActions.Notifications]: this.texts.notificationsNoCount,
	        };
	        return texts[actionId] || actionId;
	    }
	    /* =================== Breakpoint Management =================== */
	    get isSBreakPoint() {
	        return this.breakpointSize === "S";
	    }
	    updateBreakpoint() {
	        const width = this.getBoundingClientRect().width;
	        const bp = this.breakpoints.find(b => width <= b) || 10000;
	        const breakpoint = this.breakpointMap[bp];
	        if (this.breakpointSize !== breakpoint) {
	            this.breakpointSize = breakpoint;
	        }
	    }
	    /* =================== Overflow Management =================== */
	    updateOverflow() {
	        if (!this.overflow) {
	            return;
	        }
	        const result = this.overflow.updateOverflow({
	            actions: this.actions,
	            content: this.sortContent(this.content),
	            customItems: this.items,
	            hiddenItemsIds: this.hiddenItemsIds,
	            showSearchField: this.enabledFeatures.search && this.showSearchField,
	            overflowOuter: this.overflowOuter,
	            overflowInner: this.overflowInner,
	            setVisible: (selector, visible) => {
	                const element = this.shadowRoot.querySelector(selector);
	                if (element) {
	                    element.classList[visible ? "remove" : "add"]("ui5-shellbar-hidden");
	                }
	            },
	        });
	        this.handleUpdateOverflowResult(result);
	        return result.hiddenItemsIds;
	    }
	    handleUpdateOverflowResult(result) {
	        const { hiddenItemsIds, showOverflowButton } = result;
	        // Update items overflow state
	        this.items.forEach(item => {
	            item.inOverflow = hiddenItemsIds.includes(item._id);
	            if (item.inOverflow) {
	                // clear the hidden class to ensure the item is visible in the overflow popover
	                item.classList.remove("ui5-shellbar-hidden");
	            }
	        });
	        if (!webcomponentsBase.n$2(this.hiddenItemsIds, hiddenItemsIds)) {
	            this.handleContentVisibilityChanged(this.hiddenItemsIds, hiddenItemsIds);
	            this.hiddenItemsIds = hiddenItemsIds;
	            this.showOverflowButton = showOverflowButton;
	        }
	        this.showFullWidthSearch = this.searchAdaptor?.shouldShowFullScreen() || false;
	    }
	    handleContentVisibilityChanged(oldHiddenItemsIds, newHiddenItemsIds) {
	        const filterContentIds = (ids) => ids.filter(id => this.content.some(item => item._individualSlot === id));
	        const oldHiddenContentIds = filterContentIds(oldHiddenItemsIds);
	        const newHiddenContentIds = filterContentIds(newHiddenItemsIds);
	        if (!webcomponentsBase.n$2(oldHiddenContentIds, newHiddenContentIds)) {
	            this.fireDecoratorEvent("content-item-visibility-change", {
	                items: newHiddenContentIds.map(id => this.content.find(item => item._individualSlot === id)),
	            });
	        }
	    }
	    handleResize() {
	        this.overflowPopoverOpen = false;
	        this.updateBreakpoint();
	        const hiddenItemsIds = this.updateOverflow() ?? [];
	        const spacerWidth = this.spacer?.getBoundingClientRect().width || 0;
	        this.searchAdaptor?.autoManageSearchState(hiddenItemsIds.length, spacerWidth);
	    }
	    isHidden(itemId) {
	        return this.hiddenItemsIds.includes(itemId);
	    }
	    handleOverflowClick() {
	        this.overflowPopoverOpen = !this.overflowPopoverOpen;
	    }
	    onPopoverClose() {
	        this.overflowPopoverOpen = false;
	    }
	    /**
	     * Closes the overflow popover.
	     * @public
	     */
	    closeOverflow() {
	        this.overflowPopoverOpen = false;
	    }
	    handleOverflowItemClick(e) {
	        const target = e.target;
	        const actionId = target.getAttribute("data-action-id");
	        let prevented = e.defaultPrevented; // for custom actions
	        if (actionId === ShellBarActions.Notifications) {
	            prevented = this.handleNotificationsClick();
	        }
	        else if (actionId === ShellBarActions.Search) {
	            prevented = this.handleSearchButtonClick();
	        }
	        if (!prevented) {
	            this.overflowPopoverOpen = false;
	        }
	    }
	    get overflowItems() {
	        return this.overflow.getOverflowItems({
	            actions: this.actions,
	            customItems: this.items,
	            hiddenItemsIds: this.hiddenItemsIds,
	        });
	    }
	    /**
	     * Returns badge text for overflow button.
	     * Shows count if only one item with count is overflowed, otherwise shows attention dot.
	     */
	    get overflowBadge() {
	        const itemsWithCount = this.overflowItems.filter(item => item.data.count);
	        if (itemsWithCount.length === 1) {
	            return itemsWithCount[0].data.count;
	        }
	        if (itemsWithCount.length > 1) {
	            return " "; // Attention dot
	        }
	        return undefined;
	    }
	    /* =================== Search Management =================== */
	    get search() {
	        return this.searchField.length ? this.searchField[0] : null;
	    }
	    get isSelfCollapsibleSearch() {
	        const searchField = this.search;
	        if (searchField) {
	            return "collapsed" in searchField && "open" in searchField;
	        }
	        return false;
	    }
	    getSearchDeps() {
	        return {
	            getSearchField: () => this.search,
	            getSearchState: () => this.enabledFeatures.search && this.showSearchField,
	            getCSSVariable: (cssVar) => this.getCSSVariable(cssVar),
	            setSearchState: (expanded) => this.setSearchState(expanded),
	            getOverflowed: () => this.overflow.isOverflowing(this.overflowOuter, this.overflowInner),
	        };
	    }
	    get searchAdaptor() {
	        if (this.isSelfCollapsibleSearch) {
	            return this._searchAdaptor;
	        }
	        return this._searchAdaptorLegacy;
	    }
	    handleSearchButtonClick() {
	        const searchButton = this.shadowRoot.querySelector(".ui5-shellbar-search-button");
	        const defaultPrevented = !this.fireDecoratorEvent("search-button-click", {
	            targetRef: searchButton,
	            searchFieldVisible: this.showSearchField,
	        });
	        if (defaultPrevented) {
	            return defaultPrevented;
	        }
	        this.setSearchState(!this.showSearchField);
	        if (!this.showSearchField) {
	            return defaultPrevented;
	        }
	        const input = this.searchField[0];
	        if (input) {
	            input.focused = true;
	            setTimeout(() => {
	                input.focus();
	            }, 100);
	        }
	        return defaultPrevented;
	    }
	    async setSearchState(expanded) {
	        if (expanded === this.showSearchField) {
	            return;
	        }
	        this.showSearchField = expanded;
	        await Theme.w();
	        this.fireDecoratorEvent("search-field-toggle", { expanded });
	    }
	    handleCancelButtonClick() {
	        const cancelBtn = this.shadowRoot.querySelector(".ui5-shellbar-cancel-button");
	        if (!cancelBtn) {
	            return;
	        }
	        const clearDefaultPrevented = !this.fireDecoratorEvent("search-field-clear", {
	            targetRef: cancelBtn,
	        });
	        this.showFullWidthSearch = false;
	        this.setSearchState(false);
	        if (!clearDefaultPrevented && this.search) {
	            this.search.value = "";
	        }
	    }
	    /* =================== Legacy Features Management =================== */
	    initLegacyController() {
	        if (this.hasLegacyFeatures) {
	            this.legacyAdaptor = new ShellBarLegacy({
	                component: this,
	                getShadowRoot: () => this.shadowRoot,
	            });
	        }
	    }
	    get hasLegacyFeatures() {
	        return this.logo.length > 0
	            || !!this.primaryTitle
	            || !!this.secondaryTitle
	            || this.menuItems.length > 0;
	    }
	    /* =================== Keyboard Navigation =================== */
	    _onKeyDown(e) {
	        this.itemNavigation.handleKeyDown(e);
	    }
	    /* =================== Content Management =================== */
	    get startContent() {
	        return this.splitContent(this.content).start;
	    }
	    get endContent() {
	        return this.splitContent(this.content).end;
	    }
	    get separatorConfig() {
	        if (this.isSBreakPoint) {
	            return {
	                showStartSeparator: false,
	                showEndSeparator: false,
	            };
	        }
	        const { start, end } = this.splitContent(this.content);
	        return {
	            showStartSeparator: start.some(item => !this.hiddenItemsIds.includes(item._individualSlot)),
	            showEndSeparator: end.some(item => !this.hiddenItemsIds.includes(item._individualSlot)),
	        };
	    }
	    splitContent(content) {
	        const spacerIndex = content.findIndex(child => child.hasAttribute("ui5-shellbar-spacer"));
	        if (spacerIndex === -1) {
	            return { start: [...content], end: [] };
	        }
	        return {
	            start: content.slice(0, spacerIndex),
	            end: content.slice(spacerIndex + 1),
	        };
	    }
	    sortContent(content) {
	        // reverse so items on the right are hidden first
	        // then sort by hide order to apply custom preferences
	        return content.toReversed().toSorted((a, b) => {
	            const aOrder = parseInt(a.getAttribute("data-hide-order") || "0");
	            const bOrder = parseInt(b.getAttribute("data-hide-order") || "0");
	            return aOrder - bOrder;
	        });
	    }
	    /*
	     * Determines whether a separator should be packed with an item.
	     * Separators are packed with the last item that is hidden to account for
	     * the space they occupy when next overflow calculation occurs.
	     */
	    getPackedSeparatorInfo(item, isStartGroup) {
	        const group = isStartGroup ? this.startContent : this.endContent;
	        const sorted = this.sortContent(group);
	        const isHidden = this.hiddenItemsIds.includes(item._individualSlot);
	        const isLastItem = sorted.at(-1) === item;
	        return { shouldPack: isHidden && isLastItem };
	    }
	    /* =================== Items Management =================== */
	    /* =================== Accessibility =================== */
	    get actionsAccessibilityInfo() {
	        return this.accessibility.getActionsAccessibilityAttributes(this.texts, {
	            overflowPopoverOpen: this.overflowPopoverOpen,
	            accessibilityAttributes: this.accessibilityAttributes,
	        });
	    }
	    get actionsRole() {
	        const visibleCount = this.actions.filter(a => !this.hiddenItemsIds.includes(a.id)).length;
	        return this.accessibility.getActionsRole(visibleCount);
	    }
	    get contentRole() {
	        const visibleItemsCount = this.content.filter(item => !this.hiddenItemsIds.includes(item._individualSlot)).length;
	        return this.accessibility.getContentRole(visibleItemsCount);
	    }
	    /* =================== Common Members =================== */
	    get enabledFeatures() {
	        return {
	            search: this.searchField.length > 0,
	            profile: this.profile.length > 0,
	            content: this.content.length > 0,
	            branding: this.branding.length > 0,
	            overflow: this.showOverflowButton,
	            assistant: this.assistant.length > 0,
	            startButton: this.startButton.length > 0,
	            notifications: this.showNotifications,
	            productSwitch: this.showProductSwitch,
	        };
	    }
	    get texts() {
	        return {
	            search: ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_SEARCH),
	            profile: ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_PROFILE),
	            shellbar: ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_LABEL),
	            products: ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_PRODUCTS),
	            overflow: ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_OVERFLOW),
	            assistant: ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_ASSISTANT),
	            notifications: ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_NOTIFICATIONS, this.notificationsCount || 0),
	            notificationsNoCount: ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_NOTIFICATIONS_NO_COUNT),
	            contentItems: this.content.length > 1 ? ShellBar_1.i18nBundle.getText(i18nDefaults.SHELLBAR_ADDITIONAL_CONTEXT) : undefined,
	        };
	    }
	    get popoverHorizontalAlign() {
	        return this.effectiveDir === "rtl" ? "Start" : "End";
	    }
	    /**
	     * Returns the `logo` DOM ref.
	     * @public
	     * @default null
	     * @since 1.0.0-rc.16
	     */
	    get logoDomRef() {
	        return this.shadowRoot.querySelector(`*[data-ui5-stable="logo"]`);
	    }
	    /**
	     * Returns the `notifications` icon DOM ref.
	     * @public
	     * @default null
	     * @since 1.0.0-rc.16
	     */
	    get notificationsDomRef() {
	        return this.shadowRoot.querySelector(`*[data-ui5-stable="notifications"]`);
	    }
	    /**
	     * Returns the `overflow` icon DOM ref.
	     * @public
	     * @default null
	     * @since 1.0.0-rc.16
	     */
	    get overflowDomRef() {
	        return this.shadowRoot.querySelector(`*[data-ui5-stable="overflow"]`);
	    }
	    /**
	     * Returns the `profile` icon DOM ref.
	     * @public
	     * @default null
	     * @since 1.0.0-rc.16
	     */
	    get profileDomRef() {
	        return this.shadowRoot.querySelector(`*[data-ui5-stable="profile"]`);
	    }
	    /**
	     * Returns the `product-switch` icon DOM ref.
	     * @public
	     * @default null
	     * @since 1.0.0-rc.16
	     */
	    get productSwitchDomRef() {
	        return this.shadowRoot.querySelector(`*[data-ui5-stable="product-switch"]`);
	    }
	    /**
	     * Returns the search button DOM reference.
	     * @public
	     */
	    async getSearchButtonDomRef() {
	        await Theme.w();
	        return this.shadowRoot.querySelector(`*[data-ui5-stable="toggle-search"]`);
	    }
	    _fireClickEvent(eventName, domRef) {
	        return domRef ? !this.fireDecoratorEvent(eventName, { targetRef: domRef }) : false;
	    }
	    handleNotificationsClick() {
	        return this._fireClickEvent("notifications-click", this.notificationsDomRef);
	    }
	    handleProfileClick() {
	        return this._fireClickEvent("profile-click", this.profileDomRef);
	    }
	    handleProductSwitchClick() {
	        return this._fireClickEvent("product-switch-click", this.productSwitchDomRef);
	    }
	    getCSSVariable(cssVar) {
	        const styleSet = getComputedStyle(this.getDomRef());
	        return styleSet.getPropertyValue(Theme.f$3(cssVar));
	    }
	};
	__decorate([
	    webcomponentsBase.d()
	], ShellBar.prototype, "startButton", void 0);
	__decorate([
	    webcomponentsBase.d()
	], ShellBar.prototype, "branding", void 0);
	__decorate([
	    webcomponentsBase.d({ type: HTMLElement, individualSlots: true })
	], ShellBar.prototype, "content", void 0);
	__decorate([
	    webcomponentsBase.d({ type: HTMLElement })
	], ShellBar.prototype, "searchField", void 0);
	__decorate([
	    webcomponentsBase.d()
	], ShellBar.prototype, "assistant", void 0);
	__decorate([
	    webcomponentsBase.d({ type: HTMLElement, "default": true, individualSlots: true })
	], ShellBar.prototype, "items", void 0);
	__decorate([
	    webcomponentsBase.d()
	], ShellBar.prototype, "profile", void 0);
	__decorate([
	    webcomponentsBase.s()
	], ShellBar.prototype, "notificationsCount", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "showNotifications", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "showProductSwitch", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "showSearchField", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Object })
	], ShellBar.prototype, "accessibilityAttributes", void 0);
	__decorate([
	    webcomponentsBase.s()
	], ShellBar.prototype, "breakpointSize", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Object })
	], ShellBar.prototype, "actions", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "showOverflowButton", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "overflowPopoverOpen", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Object })
	], ShellBar.prototype, "hiddenItemsIds", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "showFullWidthSearch", void 0);
	__decorate([
	    query.o(".ui5-shellbar-spacer")
	], ShellBar.prototype, "spacer", void 0);
	__decorate([
	    query.o(".ui5-shellbar-overflow-container")
	], ShellBar.prototype, "overflowOuter", void 0);
	__decorate([
	    query.o(".ui5-shellbar-overflow-container-inner")
	], ShellBar.prototype, "overflowInner", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "hideSearchButton", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "disableSearchCollapse", void 0);
	__decorate([
	    webcomponentsBase.s()
	], ShellBar.prototype, "primaryTitle", void 0);
	__decorate([
	    webcomponentsBase.s()
	], ShellBar.prototype, "secondaryTitle", void 0);
	__decorate([
	    webcomponentsBase.d()
	], ShellBar.prototype, "logo", void 0);
	__decorate([
	    webcomponentsBase.d()
	], ShellBar.prototype, "menuItems", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ShellBar.prototype, "menuPopoverOpen", void 0);
	__decorate([
	    webcomponentsBase.d()
	], ShellBar.prototype, "midContent", void 0);
	__decorate([
	    parametersBundle_css$1.i("@ui5/webcomponents-fiori")
	], ShellBar, "i18nBundle", void 0);
	ShellBar = ShellBar_1 = __decorate([
	    webcomponentsBase.m({
	        tag: "ui5-shellbar",
	        styles: [shellBarStyles, shellBarLegacyStyles, ShellBarPopoverCss],
	        renderer: jsxRuntime.y,
	        template: ShellBarTemplate,
	        fastNavigation: true,
	        languageAware: true,
	        dependencies: [
	            Icon.Icon,
	            List.List,
	            Button.Button,
	            ShellBarItem.ButtonBadge,
	            ResponsivePopover.Popover,
	            ShellBarSpacer,
	            ShellBarItem.ShellBarItem,
	            ShellBarItem.ListItemStandard,
	            // legacy dependencies
	            Menu,
	        ],
	    })
	    /**
	     *
	     * Fired, when the notification icon is activated.
	     * @param {HTMLElement} targetRef dom ref of the activated element
	     * @public
	     */
	    ,
	    eventStrict.l("notifications-click", {
	        cancelable: true,
	        bubbles: true,
	    })
	    /**
	     * Fired, when the profile slot is present.
	     * @param {HTMLElement} targetRef dom ref of the activated element
	     * @public
	     */
	    ,
	    eventStrict.l("profile-click", {
	        bubbles: true,
	    })
	    /**
	     * Fired, when the product switch icon is activated.
	     *
	     * **Note:** You can prevent closing of overflow popover by calling `event.preventDefault()`.
	     * @param {HTMLElement} targetRef dom ref of the activated element
	     * @public
	     */
	    ,
	    eventStrict.l("product-switch-click", {
	        cancelable: true,
	        bubbles: true,
	    })
	    /**
	     * Fired, when the logo is activated.
	     * @param {HTMLElement} targetRef dom ref of the activated element
	     * @since 0.10
	     * @public
	     */
	    ,
	    eventStrict.l("logo-click", {
	        bubbles: true,
	    })
	    /**
	     * Fired, when a menu item is activated
	     *
	     * **Note:** You can prevent closing of overflow popover by calling `event.preventDefault()`.
	     * @param {HTMLElement} item DOM ref of the activated list item
	     * @since 0.10
	     * @public
	     */
	    ,
	    eventStrict.l("menu-item-click", {
	        bubbles: true,
	        cancelable: true,
	    })
	    /**
	     * Fired, when the search button is activated.
	     *
	     * **Note:** You can prevent expanding/collapsing of the search field by calling `event.preventDefault()`.
	     * @param {HTMLElement} targetRef dom ref of the activated element
	     * @param {Boolean} searchFieldVisible whether the search field is visible
	     * @public
	     */
	    ,
	    eventStrict.l("search-button-click", {
	        cancelable: true,
	        bubbles: true,
	    })
	    /**
	     * Fired, when the search field is expanded or collapsed.
	     * @since 2.10.0
	     * @param {Boolean} expanded whether the search field is expanded
	     * @public
	     */
	    ,
	    eventStrict.l("search-field-toggle", {
	        bubbles: true,
	    })
	    /**
	     * Fired, when the search cancel button is activated.
	     *
	     * **Note:** You can prevent the default behavior (clearing the search field value) by calling `event.preventDefault()`. The search will still be closed.
	     * **Note:** The `search-field-clear` event is in an experimental state and is a subject to change.
	     * @param {HTMLElement} targetRef dom ref of the cancel button element
	     * @since 2.14.0
	     * @public
	     */
	    ,
	    eventStrict.l("search-field-clear", {
	        cancelable: true,
	        bubbles: true,
	    })
	    /**
	     * Fired, when an item from the content slot is hidden or shown.
	     * **Note:** The `content-item-visibility-change` event is in an experimental state and is a subject to change.
	     *
	     * @param {Array<HTMLElement>} array of all the items that are hidden
	     * @public
	     * @since 2.7.0
	     */
	    ,
	    eventStrict.l("content-item-visibility-change", {
	        bubbles: true,
	    })
	], ShellBar);
	ShellBar.define();
	var ShellBar_default = ShellBar;

	exports.ShellBarActions = ShellBarActions;
	exports.ShellBarActionsSelectors = ShellBarActionsSelectors;
	exports.default = ShellBar_default;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
